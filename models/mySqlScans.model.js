const { DataTypes } = require('sequelize');
const { bdmysqlNube } = require('../database/mySqlConnection');

const Scans = bdmysqlNube.define('Scans', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tipo: {
        type: DataTypes.STRING,
        allowNull: true
    },
    valor: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    freezeTableName: true,
    createdAt: false,
    updatedAt: false
});

module.exports = {
    Scans
};