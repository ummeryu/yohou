const { Redis } = require('@upstash/redis');

let redis;

function getRedis(){
  if(!redis) redis = Redis.fromEnv();
  return redis;
}

module.exports = { getRedis };
