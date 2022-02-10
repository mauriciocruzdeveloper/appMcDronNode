// Se importa mongoose
const mongoose = require("mongoose");

// Se define schema Usuario

const schemaUsuario = mongoose.Schema({
    NombreUsu: {
        type: String
    },
    ApellidoUsu: {
        type: String
    },
    TelefonoUsu: {
        type: String
    },
    EmailUsu: {
        type: String
    },
    ProvinciaUsu: {
        type: String
    },
    CiudadUsu: {
        type: String
    },
    Admin: {
        type: Boolean
    },
    Nick: {
        type: String
    },
    UrlFotoUsu: {
        type: String
    }
});

// Se valida e-mail con expresión regular
schemaUsuario.path('EmailUsu').validate((value) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/i.test(value);
  }, 'Sintaxis de e-mail erróneo');

// Query helper - get empleados por email (EXACTO)
schemaUsuario.query.byEmail = function(email) {
    return this.findOne({email: email});
}


module.exports = mongoose.model("Usuario", schemaUsuario);