require('dotenv').config();
const { Sequelize } = require('sequelize');

const bdmysql = new Sequelize(
    process.env.LOCAL_DB_NAME || 'test',
    process.env.LOCAL_DB_USER || 'root',
    process.env.LOCAL_DB_PASS || '',
    {
        host: process.env.LOCAL_DB_HOST || 'localhost',
        port: process.env.LOCAL_DB_PORT || '3306',
        dialect: 'mysql'
    }
);

const bdmysqlNube = new Sequelize(
    process.env.REMOTE_DB_NAME || 'myDb',
    process.env.REMOTE_DB_USER || 'mydb',
    process.env.REMOTE_DB_PASS || 'mariadb',
    {
        host: process.env.REMOTE_DB_HOST || 'monorail.proxy.rlwy.net',
        port: process.env.REMOTE_DB_PORT || '23251',
        dialect: 'mysql'
    }
);

module.exports = {
    bdmysql, bdmysqlNube
}

