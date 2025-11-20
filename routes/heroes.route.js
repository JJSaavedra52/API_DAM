const { Router } = require('express');

const { heroesGet,
        heroeIdGet,
        heroesComoGet,

        heroesPost,
        heroePut,
        heroeDelete

} = require('../controllers/heroes.controller');


const router = Router();

router.get('/', heroesGet);

router.get('/:id', heroeIdGet);

router.get('/como/:termino', heroesComoGet);

//INSERT
router.post('/', heroesPost);

//UPDATE
router.put('/:id', heroePut);

//DELETE
router.delete('/:id', heroeDelete);

//router.patch('/', usuariosPatch);

module.exports = router;