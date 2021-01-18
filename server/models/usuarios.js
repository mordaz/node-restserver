//Creamos esquema de conexion de base de datos moongose
//Moongose es un servidor de base de datos no relacional
//$ npm install mongoose --save
const mongoose = require('mongoose');

//Cargamos un validador de unicos de mongoose
//$ npm install --save mongoose-unique-validator
const mongooseUniqueValidator = require('mongoose-unique-validator');

//Creamos una enumeracion para solo aceptar nombres de rol correctos
let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};

//Creamos un Schema "Tabla" en mongo
let Schema = mongoose.Schema;
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

//Sobrecargando el metodo 'toJSON' para evitar regresar el campo de contraseña 
usuarioSchema.methods.toJSON = function() {
    //hacemos una copia del objeto actual
    let user = this;
    let userObjet = user.toObject();
    //quitamos el objeto password dentro del objeto copia actual
    delete userObjet.password;
    return userObjet;
}

//Asignando el plugin y configurando mensaje del validador de unicos
usuarioSchema.plugin(mongooseUniqueValidator, { message: '{PATH} debe ser único' });

//Exportamos el Schema de usuarios con el nombre 'Usuario'
//Exportar el schema sirve para referencias el schema en otros schemas moongose
module.exports = mongoose.model('Usuarios', usuarioSchema);