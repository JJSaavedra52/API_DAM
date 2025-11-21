const { DataTypes } = require('sequelize');
const { bdmysqlNube, bdmysql } = require('../database/mySqlConnection');

const commonFields = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tipo: { type: DataTypes.STRING, allowNull: true },
  valor: { type: DataTypes.TEXT, allowNull: false },
  location: { type: DataTypes.TEXT, allowNull: true },
  usuarioId: { type: DataTypes.BIGINT, allowNull: true }
};

const ScansRemote = bdmysqlNube.define('Scans', commonFields, { freezeTableName: true, createdAt: false, updatedAt: false });
const ScansLocal = bdmysql ? bdmysql.define('Scans', commonFields, { freezeTableName: true, createdAt: false, updatedAt: false }) : ScansRemote;
const Scans = ScansRemote; // fuerza remota

module.exports = {
  Scans,
  ScansLocal,
  ScansRemote
};