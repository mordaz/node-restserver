//Creamos esquema de conexion de base de datos moongose
//Moongose es un servidor de base de datos no relacional
//$ npm install mongoose --save
const mongoose = require('mongoose');

//Cargamos un validador de unicos de mongoose
//$ npm install --save mongoose-unique-validator
const mongooseUniqueValidator = require('mongoose-unique-validator');

//Creamos un Schema "Tabla" en mongo
let Schema = mongoose.Schema;
let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descricion es necesaria']
    },
    estado: {
        type: Boolean,
        default: true
    },
    //usuario es de tipo ID moongose => Schema.Types.ObjectId
    //ref: 'Usuario' hace relacion con el eschema Usuario
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuarios'
    }
});

//Asignando el plugin y configurando mensaje del validador de unicos
categoriaSchema.plugin(mongooseUniqueValidator, { message: '{PATH} debe ser único' });

//Exportamos el Schema de usuarios con el nombre 'Categoria'
//Exportar el schema sirve para referencias el schema en otros schemas moongose
module.exports = mongoose.model('Categorias', categoriaSchema);