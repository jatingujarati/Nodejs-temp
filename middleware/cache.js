/* eslint-disable no-console */

const redis = require('redis');
const { redis: redisConfig } = require('../config/index');

const client = redis.createClient({
  host: redisConfig.host,
  port: redisConfig.port,
  enable_offline_queue: false,
  legacyMode: true
});

const cacheExpTime = 86400;

(async () => {
  await client.connect();
})();

client.on('connect', () => {
  console.log('Redis connected successfully...');
})

client.on('error', err => {
  console.log(`Redis Error ::: ${err}`);
});

/**
 * Get data from the cache
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getCache = (isUserSpecific = false) => async (req, res, next) => {
  let key = req.originalUrl;

  key = (isUserSpecific && req.user) ? `${req.user.my_library_id}-${req.user.id}:${key}` : `${req.user.my_library_id}:${key}`;

  client.get(`cache/${key}`, (err, data) => {
    try {
      if (data) {
        data = JSON.parse(data);
        return res.sendJson(200, data.message, data.result, data?.pages, data?.total);
      }
      next();
    }
    catch (err) { next(err); }
  });
}

exports.removeCache = (isUserSpecific = false, isResetMyCache = false, isResetAll = false) => async (req, res, next) => {

  const key = isResetAll ? '*' : isUserSpecific ? (isResetMyCache ? `${req.user.my_library_id}*` : `${req.user.my_library_id}-${req.user.id}:*`) : `${req.user.my_library_id}:${req.baseUrl}*`;

  client.keys(`cache/${key}`, (err, data) => {
    if (data?.length > 0) {
      client.del(data)
        .then(() => {
          next();
        }).catch(err => {
          next(err);
        })
    } else {
      next();
    }
  });
}

exports.setCache = (key, message, result, pages = null, total = null) => {
  let cacheData = { message, result };
  cacheData = pages ? { ...cacheData, pages, total } : cacheData;
  client.setEx(`cache/${key}`, cacheExpTime, JSON.stringify(cacheData));
}

exports.client = client;