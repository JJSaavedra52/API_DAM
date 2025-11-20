const jwt = require('jsonwebtoken');
const { request, response } = require("express");
const { Usuarios } = require('../models/usuarios.model');

const validarJWT = async (req = request, res = response, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({ ok: false, msg: 'No hay token en la petición' });
    }

    try {
        // Verificar el token y extraer el uid
        const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

        // Buscar el usuario en la BD
        const usuario = await Usuarios.findByPk(uid);

        if (!usuario) {
            return res.status(401).json({ ok: false, msg: 'Token no válido - usuario no existe' });
        }

        if (!usuario.estado) {
            return res.status(401).json({ ok: false, msg: 'Token no válido - usuario inactivo' });
        }

        // Agregar el usuario a la request para que lo usen los controladores
        req.usuario = usuario;

        next();
    } catch (error) {
        console.error('Error al validar token:', error);
        res.status(401).json({ ok: false, msg: 'Token no válido' });
    }
};

module.exports = {
    validarJWT
};
