const { DataTypes } = require('sequelize');
const { bdmysqlNube, bdmysql } = require('../database/mySqlConnection');

const commonFields = {
  id: { type: DataTypes.BIGINT, allowNull: false, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(150), allowNull: false },
  correo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(250), allowNull: false },
  estado: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  fecha_creacion: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
};

const opts = { freezeTableName: true, createdAt: false, updatedAt: false };

/*
 * Modo simplificado Render: usamos siempre la remota.
 * Mantengo exports para compatibilidad con controladores.
 */
const UsuariosRemote = bdmysqlNube.define('usuarios', commonFields, opts);
const UsuariosLocal = bdmysql ? bdmysql.define('usuarios', commonFields, opts) : UsuariosRemote;
const Usuarios = UsuariosRemote; // fuerza remota

module.exports = {
  Usuarios,
  UsuariosLocal,
  UsuariosRemote
};
