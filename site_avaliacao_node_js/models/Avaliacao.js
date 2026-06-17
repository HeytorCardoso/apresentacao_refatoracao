const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Avaliacao = sequelize.define('Avaliacao', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    nota: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    comentario: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: true
});
module.exports = Avaliacao;
