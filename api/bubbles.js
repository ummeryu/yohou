const { getRedis } = require('./_redis');

const KEY = 'yohou:bubbles';

function readBody(req){
  if(typeof req.body === 'object' && req.body !== null) return req.body;
  try{return JSON.parse(req.body || '{}');}catch{return {};}
}

async function readBubbles(redis){
  return (await redis.get(KEY)) || [];
}

module.exports = async function handler(req, res){
  try{
    const redis = getRedis();
    const bubbles = await readBubbles(redis);

    if(req.method === 'GET') return res.status(200).json({bubbles});

    if(req.method === 'POST'){
      const {content, x, y, ownerId} = readBody(req);
      if(typeof content !== 'string' || !content.trim()) return res.status(400).json({error:'missing content'});
      const bubble = {
        id: Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),
        content: content.trim(),
        x: typeof x === 'number' ? Math.max(0, Math.min(1, x)) : Math.random(),
        y: typeof y === 'number' ? Math.max(0, Math.min(1, y)) : Math.random(),
        ownerId: ownerId || null,
        createdAt: Date.now()
      };
      bubbles.push(bubble);
      await redis.set(KEY, bubbles);
      return res.status(200).json({bubble});
    }

    if(req.method === 'PATCH'){
      const {x, y} = readBody(req);
      const bubble = bubbles.find(item=>item.id === req.query.id);
      if(!bubble) return res.status(404).json({error:'not found'});
      if(typeof x === 'number') bubble.x = Math.max(0, Math.min(1, x));
      if(typeof y === 'number') bubble.y = Math.max(0, Math.min(1, y));
      await redis.set(KEY, bubbles);
      return res.status(200).json({bubble});
    }

    if(req.method === 'DELETE'){
      const next = bubbles.filter(item=>item.id !== req.query.id);
      if(next.length === bubbles.length) return res.status(404).json({error:'not found'});
      await redis.set(KEY, next);
      return res.status(200).json({ok:true});
    }

    res.setHeader('Allow','GET, POST, PATCH, DELETE');
    return res.status(405).json({error:'method not allowed'});
  }catch(error){
    console.error('bubbles api error:', error);
    return res.status(500).json({error:'storage unavailable'});
  }
};
