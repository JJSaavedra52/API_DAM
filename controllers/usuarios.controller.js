const { response } = require('express');
const bcryptjs = require('bcryptjs');
const { generarJWT } = require('../helpers/generar-jwt');
const { Usuarios, UsuariosLocal, UsuariosRemote } = require('../models/usuarios.model');

const usuariosPost = async (req, res = response) => {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo || !password) {
        return res.status(400).json({ ok: false, msg: 'nombre, correo y password son requeridos' });
    }

    try {
        const existe = await Usuarios.findOne({ where: { correo } });
        if (existe) return res.status(400).json({ ok: false, msg: 'Ya existe un usuario con ese correo' });

        const salt = bcryptjs.genSaltSync();
        const hashed = bcryptjs.hashSync(password, salt);

        // crear en DB activa
        const created = await Usuarios.create({ nombre, correo, password: hashed });

        // duplicar en la otra DB si está activado
        if (process.env.DUPLICATE_TO_BOTH === 'true') {
            try {
                const secondary = Usuarios === UsuariosRemote ? UsuariosLocal : UsuariosRemote;
                if (secondary) {
                    await secondary.create({ nombre, correo, password: hashed });
                }
            } catch (dupErr) {
                console.warn('Duplicate user to secondary DB failed:', dupErr.message);
            }
        }

        // no devolver la password
        const out = created.toJSON();
        delete out.password;

        res.json({ ok: true, msg: 'Usuario CREADO', data: out });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

const login = async (req, res = response) => {
    const { correo, password } = req.body;
    if (!correo || !password) return res.status(400).json({ ok: false, msg: 'correo y password son requeridos' });

    try {
        const usuario = await Usuarios.findOne({ where: { correo } });
        if (!usuario) return res.status(400).json({ ok: false, msg: 'Usuario / contraseña no son correctos - correo' });

        const validPassword = bcryptjs.compareSync(password, usuario.password);
        if (!validPassword) return res.status(400).json({ ok: false, msg: 'Usuario / contraseña no son correctos - password' });

        // generar JWT
        const token = await generarJWT(usuario.id);

        const out = usuario.toJSON();
        delete out.password;

        res.json({ ok: true, msg: 'Login OK', data: { user: out, token } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// GET /api/usuarios  -> lista usuarios (sin password)
const usuariosGet = async (req, res = response) => {
    try {
        const users = await Usuarios.findAll({
            attributes: { exclude: ['password'] }
        });
        res.json({ ok: true, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

module.exports = {
    usuariosPost,
    login,
    usuariosGet
};


