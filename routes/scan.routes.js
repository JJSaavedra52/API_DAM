const { Router } = require('express');
const {
    scansGet,
    scanIdGet,
    scansByTypeGet,
    scansPost,
    scanPut,
    scanDelete,
    scansDeleteAll,
    scansDistancePost,
    scansGetByUser
} = require('../controllers/scan.controller');
const { validarJWT } = require('../middlewares/validar-jwt');

const router = Router();

// Rutas protegidas (requieren x-token)
router.get('/me', validarJWT, scansGetByUser);
router.post('/', validarJWT, scansPost);  // <-- AÑADE validarJWT aquí

// Rutas públicas
router.get('/', scansGet);
router.get('/:id', scanIdGet);
router.get('/type/:tipo', scansByTypeGet);

// Otras rutas protegidas (opcional)
router.put('/:id', validarJWT, scanPut);
router.delete('/:id', validarJWT, scanDelete);
router.delete('/', validarJWT, scansDeleteAll);

// Distancia puede ser pública o protegida según prefieras
router.post('/distance', scansDistancePost);

module.exports = router;