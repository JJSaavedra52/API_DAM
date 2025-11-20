const { Usuarios } = require('../models/usuarios.model');

const bcryptjs = require("bcryptjs");
const { generarJWT } = require("../helpers/generar-jwt");

const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');


const usuariosPost = async (req, res = response) => {


    //Desestructuracion de los Datos, desde el BODY, que es donde estamos pasando la informacion
    const { nombre, correo, password, img, rol, google } = req.body;

    const usuario = new Usuarios({ nombre, correo, password, img, rol, google });

    try {
       
        const existeUsuario = await Usuarios.findOne({ where: { correo: correo} });

        if (existeUsuario) {
            return res.status(400).json({ok:false,
                msg: 'Ya existe un Usuario con el correo ' + correo
            })
        }


        console.log("Sin encriptar",usuario.password);

        //Encryptar la constraseña
        const salt = bcryptjs.genSaltSync();
        //let unpassword = usuario.password;
        usuario.password = bcryptjs.hashSync(usuario.password, salt);

        console.log("Encriptado",usuario.password);


        // Guardar en BD
        newUsuario = await usuario.save();

        //console.log(newHeroe.null);
        //Ajusta el Id del nuevo registro al Usuario
        usuario.id = newUsuario.null;

        res.json({
            ok:true,
            msg:"Usuario CREADO",
            data:usuario
        });
       


    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el Administrador',
            err: error
        })

    }


}

const login = async (req, res = response) => {

    const { correo, password } = req.body;

    try {
       
        const usuario = await Usuarios.findOne({ where: { correo: correo} });
        console.log(usuario);
       
        if (!usuario) {
            return res
                .status(400)
                .json({
                    ok: false,
                    msg: "Usuario / Password no son correctos - correo: " + correo,
                });
        }


        // Verificar si el usuario esta activo
        if (!usuario.estado) {
            return res
                .status(400)
                .json({
                    ok: false,
                    msg: "Usuario / Password no son correctos - estado: false",
                });
        }

        const validaPassword = bcryptjs.compareSync(password, usuario.password);
        // Verificar la contraseña


        if (!validaPassword) {
            return res
                .status(401)
                .json({
                    ok: false,
                    msg: "Usuario / Password no son correctos - password",
                });
        }


        // Generar el JWT
        const token = await generarJWT(usuario.id);


        res.json({
            ok: true,
            msg: "Login ok",
            usuario,
            token,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            ok: false,
            msg: "Hable con el Administrador...",
            error: error,
        });
    }
};


//SELECT * FROM usuarios
const usuariosGet = async (req, res = response) => {


    try {
        //select * from usuarios;
        const unosUsuarios = await Usuarios.findAll();


        res.json({
            ok: true,
            data: unosUsuarios
        });




    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Hable con el Administrador',
            err: error
        })


    }
}



module.exports = {
    //usuariosGet,
    //heroeIdGet,
    //heroesComoGet,

    usuariosPost,
    login,
    usuariosGet

    //heroePut,
    //heroeDelete,


}


