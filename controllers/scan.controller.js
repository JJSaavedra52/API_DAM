const { response, request } = require('express');
const { Scans } = require('../models/mySqlScans.model');

// Helper: parse "geo:lat,lng" -> { lat, lng } or null
const parseGeo = (geoString) => {
    if (!geoString || typeof geoString !== 'string') return null;
    const s = geoString.trim();
    if (!s.startsWith('geo:')) return null;
    const parts = s.substring(4).split(',');
    if (parts.length < 2) return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
};

// Haversine distance (meters)
const distanceMeters = (lat1, lon1, lat2, lon2) => {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) ** 2;
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// GET /scans
const scansGet = async (req, res = response) => {
    try {
        const items = await Scans.findAll();
        res.json({ ok: true, data: items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// GET /scans/:id
const scanIdGet = async (req, res = response) => {
    const { id } = req.params;
    try {
        const item = await Scans.findByPk(id);
        if (!item) return res.status(404).json({ ok: false, msg: `No existe scan con id: ${id}` });
        res.json({ ok: true, data: item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// GET /scans/type/:tipo  (e.g. /scans/type/geo)
const scansByTypeGet = async (req, res = response) => {
    const { tipo } = req.params;
    try {
        const items = await Scans.findAll({ where: { tipo } });
        res.json({ ok: true, data: items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// POST /scans
// body: { valor, location?, tipo? }
const scansPost = async (req, res = response) => {
    const { valor, location, tipo } = req.body;
    if (!valor) return res.status(400).json({ ok: false, msg: 'Campo valor requerido' });

    // Determine tipo like front-end
    let resolvedTipo = tipo;
    if (!resolvedTipo) {
        if (valor.includes('http')) resolvedTipo = 'http';
        else if (valor.includes('geo')) resolvedTipo = 'geo';
        else resolvedTipo = 'otro';
    }

    // If location not provided, prefer storing geo from valor when present
    const resolvedLocation = location ?? (valor.includes('geo') ? valor : null);

    try {
        const created = await Scans.create({ tipo: resolvedTipo, valor, location: resolvedLocation });
        res.json({ ok: true, msg: 'Scan INSERTADO', data: created });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// PUT /scans/:id
const scanPut = async (req, res = response) => {
    const { id } = req.params;
    const body = req.body;
    try {
        const item = await Scans.findByPk(id);
        if (!item) return res.status(404).json({ ok: false, msg: `No existe scan con id: ${id}` });
        // Optionally recompute tipo if valor changed
        if (body.valor && !body.tipo) {
            if (body.valor.includes('http')) body.tipo = 'http';
            else if (body.valor.includes('geo')) body.tipo = 'geo';
            else body.tipo = 'otro';
        }
        await item.update(body);
        res.json({ ok: true, msg: 'Scan ACTUALIZADO', data: item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// DELETE /scans/:id
const scanDelete = async (req, res = response) => {
    const { id } = req.params;
    try {
        const item = await Scans.findByPk(id);
        if (!item) return res.status(404).json({ ok: false, msg: `No existe scan con id: ${id}` });
        await item.destroy();
        res.json({ ok: true, msg: 'Scan ELIMINADO', data: item });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// DELETE /scans   -> borrar todo (opcional)
const scansDeleteAll = async (req, res = response) => {
    try {
        await Scans.destroy({ where: {}, truncate: true });
        res.json({ ok: true, msg: 'Todos los scans eliminados' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

// POST /scans/distance
// body: { start: "geo:lat,lng" | {lat, lng}, end: "geo:lat,lng" | {lat, lng} }
// or { startId, endId } to use stored scans
const scansDistancePost = async (req, res = response) => {
    try {
        let startCoord = null;
        let endCoord = null;

        if (req.body.startId) {
            const s = await Scans.findByPk(req.body.startId);
            startCoord = s ? parseGeo(s.location ?? s.valor) : null;
        } else if (req.body.start) {
            startCoord = typeof req.body.start === 'string' ? parseGeo(req.body.start) : req.body.start;
        }

        if (req.body.endId) {
            const e = await Scans.findByPk(req.body.endId);
            endCoord = e ? parseGeo(e.location ?? e.valor) : null;
        } else if (req.body.end) {
            endCoord = typeof req.body.end === 'string' ? parseGeo(req.body.end) : req.body.end;
        }

        if (!startCoord || !endCoord) {
            return res.status(400).json({ ok: false, msg: 'No se pudieron obtener ambas coordenadas en formato geo' });
        }

        const meters = distanceMeters(startCoord.lat, startCoord.lng, endCoord.lat, endCoord.lng);
        res.json({ ok: true, distanceMeters: meters, distanceKm: meters / 1000 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, msg: 'Hable con el Administrador', err });
    }
};

module.exports = {
    scansGet,
    scanIdGet,
    scansByTypeGet,
    scansPost,
    scanPut,
    scanDelete,
    scansDeleteAll,
    scansDistancePost
};