const { DataTypes } = require('sequelize');
const { bdmysqlNube, bdmysql } = require('../database/mySqlConnection');

const Locations = bdmysqlNube.define('locations',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        latitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        longitude: {
            type: DataTypes.DOUBLE,
            allowNull: false
        },
        accuracy: {
            type: DataTypes.DOUBLE,
            allowNull: true
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        freezeTableName: true,
        createdAt: false,
        updatedAt: false
    }
);

module.exports = {
    Locations
};