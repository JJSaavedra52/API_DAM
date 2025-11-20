const { DataTypes } = require('sequelize');
const { bdmysql, bdmysqlNube } = require('../database/mySqlConnection');

const commonFields = {
    id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    correo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(250),
        allowNull: false,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
};

const opts = { freezeTableName: true, createdAt: false, updatedAt: false };

const UsuariosLocal = bdmysql.define('usuarios', commonFields, opts);
const UsuariosRemote = bdmysqlNube.define('usuarios', commonFields, opts);

// Exportar el modelo "activo" según USE_LOCAL_DB, y también los dos concretos
const Usuarios = process.env.USE_LOCAL_DB === 'true' ? UsuariosLocal : UsuariosRemote;

module.exports = {
    Usuarios,
    UsuariosLocal,
    UsuariosRemote
};
