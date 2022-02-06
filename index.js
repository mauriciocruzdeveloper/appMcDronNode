// Importaciones
const express = require("express");
const mongoose = require("mongoose");
const rutas = require("./rutas");
require("dotenv").config();
var cors = require('cors');

// Uso dotenv para pasar parámetros de conexion.

// Estos son los datos para la conección local que está comentada en el apartado "Conexion MongoDB con Mongoose"
const puertoMongoDB = process.env.MONGODB_PORT

// Estos son los datos del server
const host = process.env.SERVER_HOST_NAME;
const puertoServidor = process.env.SERVER_PORT;
const nombreDbLocal = process.env.NOMBRE_DB_LOCAL

// Estos son los datos para la conexión remota a la BD MongoDB Atlas (servicio cloud)
// HACER ////////////////////////////////////////////////////
// const usuarioServidor = process.env.SERVER_USER;
// const clusterDB = process.env.CLUSTER_DB;
// const nombreDB = process.env.NOMBRE_DB



//Conexion MongoDB con Mongoose
mongoose.connect("mongodb://" + host + ":" + puertoMongoDB + "/mcdron", { useNewUrlParser: true })
//mongoose.connect("mongodb+srv://" + usuarioServidor + "@" + clusterDB + ".mongodb.net/" + nombreDB + "?retryWrites=true&w=majority", { useNewUrlParser: true })

.then( () => {
        // Configuración Express

        const app = express();
        // Empleo cors para que me permita acceder al servidor y no me bloquee por CORS
        app.use(cors());

        app.use(express.json());
        app.use("/api", rutas)

        // Listener del servidor web
        app.listen( 5000, () => {
            console.log(`Servidor levantado! en http://${host}:${puertoServidor}/`);
        });
    });

    