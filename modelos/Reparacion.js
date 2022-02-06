// Se importa mongoose
const mongoose = require("mongoose");

// Se define schema Empleado

const schemaReparacion = mongoose.Schema({
    EstadoRep: {
        type: String,
        required: [false, ''] // Ver cómo capturar los errores de validación.
    },
    DriveRep: {
        type: String
    },
    FeConRep: {
        type: Number
    },
    NombreUsu: {
        type: String
    },
    ApellidoUsu: {
        type: String
    },
    TelefonoUsu: {
        type: String
    },
    DroneRep: {
        type: String
    },
    DescripcionUsuRep:{
        type: String
    },
    FeRecRep: {
        type: Number
    },
    NumeroSerieRep:{
        type: String
    },
    DescripcionTecRep:{
        type: String
    },
    PresuMoRep:{
        type: Number
    },
    PresuReRep:{
        type: Number
    },
    PresuFiRep:{
        type: Number
    },
    PresuDiRep:{
        type: Number
    },
    TxtRepuestosRep:{
        type: String
    },
    InformeRep:{
        type: String
    },
    FeFinRep:{
        type: Number
    },
    FeEntRep:{
        type: Number
    },
    txtEntregaRep:{
        type: String
    },
    SeguimientoEntregaRep:{
        type: String
    }
});

// Query helper - get empleados por email (EXACTO)
// schemaEmpleado.query.byEmail = function(email) {
//     return this.findOne({email: email});
// }


module.exports = mongoose.model("Reparacion", schemaReparacion);