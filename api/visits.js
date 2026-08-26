const { getRedis } = require('./_redis');

module.exports = async function handler(req, res){
  try{
    const redis = getRedis();
    if(req.method === 'POST'){
      const count = await redis.incr('yohou:visits');
      return res.status(200).json({count});
    }
    if(req.method === 'GET'){
      const count = Number(await redis.get('yohou:visits')) || 0;
      return res.status(200).json({count});
    }
    res.setHeader('Allow','GET, POST');
    return res.status(405).json({error:'method not allowed'});
  }catch(error){
    console.error('visits api error:', error);
    return res.status(500).json({error:'storage unavailable'});
  }
};
