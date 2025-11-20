const { Router } = require('express');

const { validarJWT} = require('../middlewares/validar-jwt');
const { check } = require('express-validator');
const { validarCampos } = require('../middlewares/validar-campos');

const {
    //heroesGet,
    //heroeIdGet,
    //heroesComoGet,
    usuariosGet,

    usuariosPost,
    login
    //heroePut,
    //heroeDelete
} = require('../controllers/usuarios.controller');


const router = Router();

//select * from heroes
router.get('/',

    //Aqui involucro el middleware
    validarJWT,

    usuariosGet);

//select * from heroes where id = :id
//router.get('/:id', heroeIdGet);

//select * from heroes where nombre like '%:termino%'
//router.get('/como/:termino', heroesComoGet);


// Insert - CREATE
router.post('/', usuariosPost);


router.post('/login',
    //Valido que el correo se un correo Valido
    check('correo','El correo es obligatorio').isEmail(),

    check('password','La contraseña es obligatoria').not().isEmpty(),

    validarCampos,
  
    
    
    login);


// Update - UPDATE
//router.put('/:id', heroePut);


// Delete - DELETE
//router.delete('/:id', heroeDelete);

//router.patch('/', pruebaPatch);


module.exports = router;
