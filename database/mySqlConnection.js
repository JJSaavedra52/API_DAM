const { Sequelize } = require('sequelize');
const path = require('path');

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = nodeEnv === 'production' ? '.env' : '.env.development';
require('dotenv').config({ path: path.resolve(__dirname, '..', envFile) });

const isProd = nodeEnv === 'production';

// Remota (Railway)
const bdmysqlNube = new Sequelize(
  process.env.REMOTE_DB_NAME || 'myDb',
  process.env.REMOTE_DB_USER || 'mydb',
  process.env.REMOTE_DB_PASS || 'mariadb',
  {
    host: process.env.REMOTE_DB_HOST || 'monorail.proxy.rlwy.net',
    port: process.env.REMOTE_DB_PORT || '23251',
    dialect: 'mysql',
    logging: false
  }
);

// Local (solo desarrollo)
let bdmysql = null;
if (!isProd && process.env.USE_LOCAL_DB === 'true') {
  bdmysql = new Sequelize(
    process.env.LOCAL_DB_NAME || 'test',
    process.env.LOCAL_DB_USER || 'root',
    process.env.LOCAL_DB_PASS || '',
    {
      host: process.env.LOCAL_DB_HOST || 'localhost',
      port: process.env.LOCAL_DB_PORT || '3306',
      dialect: 'mysql',
      logging: false
    }
  );
}

module.exports = { bdmysql, bdmysqlNube, isProd };

