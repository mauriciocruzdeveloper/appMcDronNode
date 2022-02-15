// Importaciones

const express = require( "express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Modelos

const Reparacion = require("./modelos/Reparacion");
const Usuario = require("./modelos/Usuario");

// Routers

const router = express.Router();
const rutasProtegidas = express.Router(); 


//////////////////////////////////////
//////////   TOKEN Y LOGIN   /////////
//////////////////////////////////////

// rutasProtegidas es una función que se agrega a las llamadas al servidor y
// verifica que el token sea el correcto, sino no deja pasar
rutasProtegidas.use((req, res, next) => {
    const token = req.headers['autorization'];
    if (token) {
        const semilla = process.env.SEMILLA_JWT;
        jwt.verify(token, semilla, (err, decoded) => {      
            if (err) {
                console.log("error en verify: " + err)
                return res.status(401).json({ mensaje: 'Token inválida' });    
            } else {
                req.decoded = decoded;    
                next();
            }
        });
    } else {
        res.status(401).json({ mensaje: 'Token no proveída.' });
    }
 });


 // POST - Verifica el email y la contraseña para el login
router.post("/login", async (req, res) => {
    const user = await Usuario.findOne({ email: req.body.email });
    const semilla = process.env.SEMILLA_JWT;

    if (user) {
      // Compara el password que envié con el de la base de datos
      // Comenté la verificación del pass hasta que haga el registro bien.
      const validPassword = true; // await bcrypt.compare(req.body.password, req.body.password);
      if (validPassword) {
        // Genero el token y lo mando con el usuario en la propiedad "token"
        // El payload es el email y el nombre de usuario
        const payload = { email: req.body.email, nombre: user.NombreUsu }; 
        const token = jwt.sign(payload, semilla, { expiresIn: 1440 });
        res.send({
            ...user._doc,
            // Mando el token junto a los datos del usuario
            token: token
        });
        res.status(200).json({ message: "Password Válido" });
      } else {
        res.status(401).json({ code: "Password Inválido" });
      }
    } else {
      res.status(404).json({ code: "No se encontró el usuario" });
    }
});


//////////////////////////////////
//////////   REPARACIONES   /////////
//////////////////////////////////

// GET - Devuelve el listado de las reparaciones
router.get( "/reparaciones", rutasProtegidas, async (req, res) => {
    try {
        const reparaciones = await Reparacion.find();
        res.send(reparaciones);
    } catch {
        res.status(404);
        res.send({ code: "Hubo un problema" });
    };
});


// POST - Permite dar de alta una persona
router.post("/reparaciones", rutasProtegidas, async (req, res) => {
    try {
        // Acá paso como parámetro el body, en lugar de hacer un objeto
        // cuyos parámetros tienen el mismo nombre que los del body.
        const reparacion = new Reparacion(req.body); 
        await reparacion.save();
        res.send(reparacion);
    } catch {
        res.status(400);
        res.send({ code: "Hubo un problema al cargar" });
    };
});

// GET - Permite traer una reparacion en particular por id
router.get( "/reparaciones/:id", rutasProtegidas, async (req, res) => { 
    try {
        const reparacion = await Reparacion.findOne({ _id: req.params.id });
        res.send(reparacion);
    } catch {
        res.status(404);
        res.send({ code: "La reparación no existe!" });
    };
});

// PATCH - Permite actualizar un usuario
router.patch("/reparaciones/:id", async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const update = { ...req.body };
        let reparacion = await Reparacion.findOneAndUpdate(filter, update, {
            new: true
          });
        res.send(reparacion);
    } catch {
        res.status(404);
        res.send({ code: "Problema al modificar reparacion!" });
    };
});

// DELETE - Permite borrar una reparación por id
router.delete( "/reparaciones/:id", rutasProtegidas, async ( req, res ) => {
    try {
        await Reparacion.deleteOne({ _id: req.params.id });
        res.send("Reparación borrada");
        res.status( 204 ).send();
    } catch {
        res.status( 404 );
        res.send({ code: "La reparación no existe!" });  
    };
});

//////////////////////////////////
//////   USUARIO   //////
//////////////////////////////////

// Query helper - get tipo de jornada por tipo (EXACTO)
router.get( "/usuarioByEmail/:email", rutasProtegidas, async (req, res) => {
    try {
        console.log("usuarioByEmail: " + req.params.email);
        const usuario = await Usuario.find().byEmail(req.params.email);
        console.log("usuario: " + JSON.stringify(usuario));
        res.send(usuario);
    } catch {
        res.status(404);
        res.send({ code: "Usuario no encontrado!" });
    } 
});

// GET - Devuelve el listado de usuarios
router.get("/usuarios", rutasProtegidas, async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.send(usuarios);
    } catch {
        res.status(404);
        res.send({ code: "Hubo un problema" });
    };
});

// GET - Permite traer un usuario en particular por id
router.get( "/usuarios/:id", rutasProtegidas, async (req, res) => { 
    try {
        const usuario = await Usuario.findOne({ _id: req.params.id });
        res.send(usuario)
    } catch {
        res.status(404);
        res.send({ code: "El usuario no existe!" });
    };
});

// POST - Permite dar de alta un usuario
router.post("/usuarios", rutasProtegidas, async (req, res) => {
    try {
        // el body contiene el objeto usuario tal como va en la db
        console.log("post server: " + JSON.stringify(req.body));
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.send(usuario);
    } catch(error) {
        console.log("error.message: " + error.message);
        res.status(400).json({msj: error.message});
    };
});

// PATCH - Permite actualizar un usuario
router.patch("/usuarios/:id", rutasProtegidas, async (req, res) => {
    try {
        const filter = { _id: req.params.id };
        const update = { ...req.body };
        let usuario = await Usuario.findOneAndUpdate(filter, update, {
            new: true
          });
        res.send(usuario);
    } catch {
        res.status(404);
        res.send( {code: "Problema al modificar usuario!"} );
    };
});

// DELETE - Permite borrar un usuario por id
router.delete("/usuarios/:id", rutasProtegidas, async (req, res) => {
    try {
        await Usuario.deleteOne({ _id: req.params.id });
        res.send("Usuario borrado: " + req.params.id);
        res.status(204).send();
    } catch {
        res.status(404);
        res.send({ code: "Problema al borrar Usuario!" });  
    };
});

// Exportable
module.exports = router;