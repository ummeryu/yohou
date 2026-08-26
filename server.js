const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const DATA = path.join(__dirname, 'visits.json');
const BUBBLES = path.join(__dirname, 'bubbles.json');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function readCount(){
  try{
    if(!fs.existsSync(DATA)) return 0;
    const raw = fs.readFileSync(DATA,'utf8');
    const obj = JSON.parse(raw||'{}');
    return Number(obj.count)||0;
  }catch(e){ return 0; }
}

function writeCount(n){
  try{ fs.writeFileSync(DATA, JSON.stringify({count: n}, null, 2), 'utf8'); }
  catch(e){ console.error('写入 visits.json 失败', e); }
}

function readBubbles(){
  try{
    if(!fs.existsSync(BUBBLES)) return [];
    const raw = fs.readFileSync(BUBBLES,'utf8');
    const arr = JSON.parse(raw||'[]');
    return Array.isArray(arr) ? arr : [];
  }catch(e){ return []; }
}

function writeBubbles(arr){
  try{ fs.writeFileSync(BUBBLES, JSON.stringify(arr, null, 2), 'utf8'); }
  catch(e){ console.error('写入 bubbles.json 失败', e); }
}

// 静态文件（可选），提供静态页面访问
app.use(express.static(path.join(__dirname)));

app.get('/api/visits', (req, res)=>{
  const count = readCount();
  res.json({count});
});

app.post('/api/visits', (req, res)=>{
  // 可基于客户端 IP 或其它字段做去重/限制，这里简单计数每次请求
  const current = readCount();
  const next = current + 1;
  writeCount(next);
  res.json({count: next});
});

// bubbles API
app.get('/api/bubbles', (req, res)=>{
  const arr = readBubbles();
  res.json({bubbles: arr});
});

app.post('/api/bubbles', (req, res)=>{
  const {content, x, y, ownerId} = req.body || {};
  if(!content) return res.status(400).json({error:'missing content'});
  const arr = readBubbles();
  const id = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  const bubble = { id, content, x: typeof x==='number'?x:Math.random(), y: typeof y==='number'?y:Math.random(), ownerId: ownerId||null, createdAt: Date.now() };
  arr.push(bubble);
  writeBubbles(arr);
  res.json({bubble});
});

app.delete('/api/bubbles/:id', (req, res)=>{
  const id = req.params.id;
  const { ownerId } = req.body || {};
  const arr = readBubbles();
  const idx = arr.findIndex(b=>b.id===id);
  if(idx===-1) return res.status(404).json({error:'not found'});
  const bubble = arr[idx];
  // only owner can delete
  if(bubble.ownerId && ownerId && bubble.ownerId === ownerId){
    arr.splice(idx,1);
    writeBubbles(arr);
    return res.json({ok:true});
  }
  return res.status(403).json({error:'forbidden'});
});

app.listen(PORT, ()=>{
  console.log(`Visits server running on http://localhost:${PORT}`);
});
