const express = require('express');
const cors = require('cors');

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

    async dbConnection() {
        try {
            await bdmysqlNube.authenticate();
            console.log('Connection OK a MySQL.');

            // Sync the Scans model to create the table if it doesn't exist
            await require('../models/mySqlScans.model').Scans.sync();
        } catch (error) {
            console.error('No se pudo Conectar a la BD MySQL', error);
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