//Creamos esquema de conexion de base de datos moongose
//Moongose es un servidor de base de datos no relacional
//$ npm install mongoose --save
var mongoose = require('mongoose');

//Creamos un Schema "Tabla" en mongo
var Schema = mongoose.Schema;
var productoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    precioUni: { type: Number, required: [true, 'El precio únitario es necesario'] },
    descripcion: { type: String, required: false },
    disponible: { type: Boolean, required: true, default: true },
    img: { type: String, required: false },
    //categoria es de tipo ID moongose => Schema.Types.ObjectId
    //ref: 'Categorias' hace relacion con el eschema Categorias
    categoria: { type: Schema.Types.ObjectId, ref: 'Categorias', required: true },
    //usuario es de tipo ID moongose => Schema.Types.ObjectId
    //ref: 'Usuario' hace relacion con el eschema Usuarios
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuarios' }
});

//Exportamos el Schema de productos con el nombre 'Productos'
//Exportar el schema sirve para referencias el schema en otros schemas moongose
module.exports = mongoose.model('Productos', productoSchema);