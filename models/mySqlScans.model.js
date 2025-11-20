const { DataTypes } = require('sequelize');
const { bdmysql, bdmysqlNube } = require('../database/mySqlConnection');

const commonFields = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.STRING, allowNull: true },
    valor: { type: DataTypes.TEXT, allowNull: false },
    location: { type: DataTypes.TEXT, allowNull: true },
    usuarioId: { type: DataTypes.BIGINT, allowNull: true } // track user who saved this scan (nullable)
};

const ScansLocal = bdmysql.define('Scans', commonFields, { freezeTableName: true, createdAt: false, updatedAt: false });
const ScansRemote = bdmysqlNube.define('Scans', commonFields, { freezeTableName: true, createdAt: false, updatedAt: false });

// Modelo "activo" según USE_LOCAL_DB
const Scans = process.env.USE_LOCAL_DB === 'true' ? ScansLocal : ScansRemote;

module.exports = {
    Scans,
    ScansLocal,
    ScansRemote
};