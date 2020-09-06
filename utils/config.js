const mongodb = require('mongodb').MongoClient;
const path = require('path');
const nconf = require('nconf');
const redis = require('redis');

class Config {
  static instance = null;
  constructor() {
    this.config = null;
    this.db = null;
    this.updateConfigTimeout = null;
    this.MongoClient = mongodb;
    this.RedisClient = null;
    this.nconf = nconf;
    this.systemMail = [];
    this.loadRedis();
  }

  static getInstance() {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  getRedisClient() {
    if (!this.RedisClient) {
      this.loadRedis();
    }
    return this.RedisClient;
  }

  loadRedis() {
    this.nconf.file(path.join(__dirname, '..', 'deploy', process.env.ENVIRONMENT, 'dbconfig.json'));
    this.RedisClient = redis.createClient(nconf.get("REDIS_PORT"), nconf.get("REDIS_URL"));
  }
  loadConfigs(done) {
    this.nconf.file(path.join(__dirname, '..', 'deploy', process.env.ENVIRONMENT, 'dbconfig.json'));  
        if (this.db) {
          console.log("INSIDE IF 1");
          done()
        } else {
          console.log("INSIDE ELSE 1");
          this.MongoClient.connect(nconf.get('DATABASE_URL'), { useUnifiedTopology: true }, (err, client) => {
            if (err) {
              console.log("Error in mongo connection",err)
              done(err);
            } else {
              console.log('Database Connected.');
              this.db = client.db('simplegame');
              console.log(`db ${this.db}`);
              done();
            }
          });
        }
  }

  getConfig() {
    return this.config;
  }

  getDB() {
    return this.db;
  }
}


module.exports = Config;