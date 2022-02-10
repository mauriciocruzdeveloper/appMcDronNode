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
                console.log("decoded en verify: " + JSON.stringify(decoded))
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
      const validPassword = await bcrypt.compare(req.body.password, req.body.password);
      if (validPassword) {
        // Genero el token y lo mando con el usuario en la propiedad "token"
        // El payload es el email y el nombre de usuario
        const payload = { email: body.email, nombre: user.nombre }; 
        const token = jwt.sign(payload, semilla, { expiresIn: 1440 });
        res.send({
            ...user._doc,
            // Mando el token junto a los datos del usuario
            token: token
        });
        res.status(200).json({ message: "Password Válido" });
      } else {
        res.status(401).json({ error: "Password Inválido" });
      }
    } else {
      res.status(404).json({ error: "No se encontró el usuario" });
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
        res.send({ error: "Hubo un problema" });
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
        res.send({ error: "Hubo un problema al cargar" });
    };
});

// GET - Permite traer una reparacion en particular por id
router.get( "/reparaciones/:id", rutasProtegidas, async (req, res) => { 
    try {
        const reparacion = await Reparacion.findOne({ _id: req.params.id });
        const usuario = await Usuario.findOne({ _id: reparacion.data.UsuarioRep });
        res.send({
            ...reparacion, 
            data: {
                ...reparacion.data,
                NombreUsu: usuario.NombreUsu,
                ApellidoUsu: usuario.ApellidoUsu,
                TelefonoUsu: usuario.TelefonoUsu
            }
        });
    } catch {
        res.status(404);
        res.send({ error: "La reparación no existe!" });
    };
});

// PATCH - Permite actualizar una reparación
router.patch("/reparaciones/:id", rutasProtegidas, async (req, res) => {
    try {
        // La línea de abajo busca la reparación por id, si no existe va al catch
        const reparacion = await Reparacion.findOne({ _id: req.params.id });
        // A la reparacion le copio todo lo que tenía y le sobrescribo todo lo del body
        reparacion = {
            ...reparacion,
            ...req.body
        };

        // LO DE ABAJO ME PARECE UN POCO ENGORROSO, MEJOR LO DE ARRIBA/////////
        // const reparacion = await Reparacion.findOne({ _id: req.params.id });
        // if ( req.body.nombre ) {
        //     empleado.nombre = req.body.nombre;
        // };
        // if ( req.body.email ) {
        //     empleado.email = req.body.email;
        // };
        // if ( req.body.password ) {
        //     empleado.password = req.body.password;
        // };
        // // Lo tengo que comentar porque sino no pasa el if cuando es falso.
        // // if ( req.body.admin ) {
        //     empleado.admin = req.body.admin;
        // // };
        //////////////////////////////////////////////////////////////////////

        // Guardo la reparación
        await reparacion.save();
        res.send( reparacion );
    } catch {
        res.status(404);
        res.send({ error: "La reparación no existe!"} );
    };
});

// DELETE - Permite borrar una reparación por id
router.delete( "/reparaciones/:id", rutasProtegidas, async ( req, res ) => {
    console.log( 'Delete -> ' + req.params.id );
    try {
        await Reparacion.deleteOne({ _id: req.params.id });
        res.send("Reparación borrada");
        res.status( 204 ).send();
    } catch {
        res.status( 404 );
        res.send({ error: "La reparación no existe!" });  
    };
});

//////////////////////////////////
//////   USUARIO   //////
//////////////////////////////////


// PATCH - Permite actualizar un empleado por email
// router.patch( "/usuario/:email", rutasProtegidas, async ( req, res ) => {
//     try {
//         const empleado = await Empleado.find().byEmail(req.params.email );
//         if ( req.body.nombre ) {
//             empleado.nombre = req.body.nombre;
//         };
//         if ( req.body.email ) {
//             empleado.email = req.body.email;
//         };
//         if ( req.body.password ) {
//             empleado.password = req.body.password;
//         };
//         // Lo tengo que comentar porque sino no pasa el if cuando es falso.
//         // if ( req.body.admin ) {
//             empleado.admin = req.body.admin;
//         // };
//         await empleado.save();
//         res.send( empleado );
//     } catch {
//         res.status( 404 );
//         res.send( "Empleado no existe!" );
//     };
// });


// // Query helper - get tipo de jornada por tipo (EXACTO)
// router.get( "/tipojornadaByTipo/:tipo", rutasProtegidas, async ( req, res ) => {
//     try {
//         const tipojornada = await TipoJornada.find().byTipo( req.params.tipo );
//         res.send( tipojornada );
//     } catch {
//         res.status( 404 );
//         res.send({ error: "Tipo de Jornada no existe!" });
//     }
    
// });

// GET - Devuelve el listado de usuarios
router.get("/usuarios", async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.send(usuarios);
    } catch {
        res.status(404);
        res.send({ error: "Hubo un problema" });
    };
});

// GET - Permite traer un usuario en particular por id
router.get( "/usuarios/:id", async (req, res) => { 
    try {
        const usuario = await Usuario.findOne({ _id: req.params.id });
        res.send(usuario)
    } catch {
        res.status(404);
        res.send({ error: "El usuario no existe!" });
    };
});

// POST - Permite dar de alta una tipo de jornada
router.post("/usuarios", async (req, res) => {
    try {
        // el body contiene el objeto usuario tal como va en la db
        const usuario = new Usuario(req.body);
        await usuario.save();
        res.send(usuario);
    } catch {
        res.status(400);
        res.send({ error: "Hubo un problema al cargar" });
    };
});

// PATCH - Permite actualizar un usuario
router.patch("/usuarios/:id", async (req, res) => {
    try {
        console.log("id: " + req.params.id);
        // La línea de abajo busca el usuario por id, si no existe va al catch
        const usuario = await Usuario.findOne({ _id: req.params.id });
        // A la reparacion le copio todo lo que tenía y le sobrescribo todo lo del body
        console.log("usuario: " + JSON.stringify(usuario));
        console.log("usuario: " + JSON.stringify({...usuario._doc}));
        console.log("req.body: " + JSON.stringify({...req.body}));
        // console.log("doto junto: " + JSON.stringify({...usuario,...req.body}));
        usuario = {
            ...usuario._doc,
            ...req.body
        };
        
        console.log("usuario: " + JSON.stringify(usuario));
        // Guardo el usuario
        await usuario.save();
        res.send(usuario);
    } catch {
        res.status(404);
        res.send( {code: "Usuario no existe!"} );
    };
});

// DELETE - Permite borrar un usuario por id
router.delete("/usuario/:id", async (req, res) => {
    console.log('Delete -> ' + req.params.id );
    try {
        await TipoJornada.deleteOne({ _id: req.params.id });
        res.send("Tipo de Jornada borrada");
        res.status(204).send();
    } catch {
        res.status(404);
        res.send({ error: "Tipo de Jornada no existe!" });  
    };
});


// Exportable
module.exports = router;