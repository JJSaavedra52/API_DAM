const { Router } = require('express');
const {
    scansGet,
    scanIdGet,
    scansByTypeGet,
    scansPost,
    scanPut,
    scanDelete,
    scansDeleteAll,
    scansDistancePost
} = require('../controllers/scan.controller');

const router = Router();

// GET /scans
router.get('/', scansGet);

// GET /scans/:id
router.get('/:id', scanIdGet);

// GET /scans/type/:tipo
router.get('/type/:tipo', scansByTypeGet);

// POST /scans
router.post('/', scansPost);

// PUT /scans/:id
router.put('/:id', scanPut);

// DELETE /scans/:id
router.delete('/:id', scanDelete);

// DELETE /scans (optional: delete all scans)
router.delete('/', scansDeleteAll);

// POST /scans/distance
router.post('/distance', scansDistancePost);

module.exports = router;