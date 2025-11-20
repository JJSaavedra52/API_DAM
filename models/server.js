const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const { bdmysql, bdmysqlNube } = require('../database/mySqlConnection');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;

        this.pathsMySql = {
            auth: '/api/auth',
            prueba: '/api/prueba',

            // AQUI DEFINO la ruta de Heroes
            heroes: '/api/heroes',

            // AQUI DEFINO la ruta de Usuarios
            usuarios: '/api/usuarios',

            // AQUI DEFINO la ruta de Scans
            scans: '/api/scans'
        };

        this.app.get('/', function (req, res) {
            res.send('Hola Mundo a todos desde la Clase...');
        });

        // Aqui me conecto a la BD
        this.dbConnection();

        // Middlewares
        this.middlewares();

        // Routes
        this.routes();
    }

    async createDatabaseIfNotExists({ host, port, user, password, database }) {
        if (!database) return;
        const connConfig = { host, port, user, password, multipleStatements: true };
        try {
            const conn = await mysql.createConnection(connConfig);
            const sql = `CREATE DATABASE IF NOT EXISTS \`${database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`;
            await conn.query(sql);
            await conn.end();
            console.log(`Database ensured: ${database} on ${host}:${port}`);
        } catch (err) {
            console.warn(`Could not ensure database ${database} on ${host}:${port} — continuing:`, err.message);
        }
    }

    async dbConnection() {
        // Ensure remote DB exists (project default)
        await this.createDatabaseIfNotExists({
            host: process.env.REMOTE_DB_HOST || 'monorail.proxy.rlwy.net',
            port: process.env.REMOTE_DB_PORT || '23251',
            user: process.env.REMOTE_DB_USER || 'mydb',
            password: process.env.REMOTE_DB_PASS || 'mariadb',
            database: process.env.REMOTE_DB_NAME || 'myDb'
        });

        // Optionally ensure local DB if requested
        if (process.env.USE_LOCAL_DB === 'true') {
            await this.createDatabaseIfNotExists({
                host: process.env.LOCAL_DB_HOST || 'localhost',
                port: process.env.LOCAL_DB_PORT || '3306',
                user: process.env.LOCAL_DB_USER || 'root',
                password: process.env.LOCAL_DB_PASS || '',
                database: process.env.LOCAL_DB_NAME || 'test'
            });
        }

        // Now try Sequelize connections (non-blocking failures handled)
        try {
            await bdmysqlNube.authenticate();
            console.log('Remote DB (bdmysqlNube) connection OK.');
        } catch (error) {
            console.error('Remote DB connection failed:', error.message);
        }

        if (process.env.USE_LOCAL_DB === 'true') {
            try {
                await bdmysql.authenticate();
                console.log('Local DB (bdmysql) connection OK.');
            } catch (error) {
                console.warn('Local DB connection failed (ignored):', error.message);
            }
        } else {
            console.log('Local DB connection skipped (USE_LOCAL_DB not set to true).');
        }

        // Sync models (will create tables inside the DBs)
        try {
            const { Scans } = require('../models/mySqlScans.model');
            const { UsuariosLocal, UsuariosRemote } = require('../models/usuarios.model');

            // sincroniza la tabla en la DB "activa" (Scans ya lo hace)
            await Scans.sync();

            // opcional: crear ambas tablas de usuarios (best-effort)
            try { await UsuariosLocal.sync(); } catch(e){ console.warn('UsuariosLocal sync failed:', e.message); }
            try { await UsuariosRemote.sync(); } catch(e){ console.warn('UsuariosRemote sync failed:', e.message); }

            console.log('Modelos sincronizados.');
        } catch (err) {
            console.warn('Model sync error:', err.message);
        }

        try {
            // sincronizar estructuras con alter (cuidado en producción)
            const { ScansLocal, ScansRemote } = require('../models/mySqlScans.model');
            await ScansLocal.sync({ alter: true }).catch(()=>{});
            await ScansRemote.sync({ alter: true }).catch(()=>{});
            console.log('Sequelize sync({alter:true}) applied to ScansLocal and ScansRemote');
        } catch (e) {
            console.warn('Sync alter failed:', e.message);
        }
    }

    routes() {
        // this.app.use(this.pathsMySql.auth, require('../routes/MySqlAuth'));
        // this.app.use(this.pathsMySql.prueba, require('../routes/prueba'));

        this.app.use(this.pathsMySql.heroes, require('../routes/heroes.route'));
        this.app.use(this.pathsMySql.usuarios, require('../routes/usuarios.route'));

        // Add the scans route
        this.app.use(this.pathsMySql.scans, require('../routes/scan.routes'));
    }

    middlewares() {
        // CORS
        this.app.use(cors());

        // Lectura y Parseo del body
        this.app.use(express.json());

        // Directorio publico
        this.app.use(express.static('public'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log('Servidor corriendo en puerto', this.port);
        });
    }
}

module.exports = Server;