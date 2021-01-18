//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Importamos metodos POST para hacer login de Ususarios del archivo login.js
app.use(require('./login.js'));

//Importamos metodos GET POST PUT DELETE de Ususarios del archivo usuario.js
app.use(require('./usuario.js'));

//Importamos metodos GET POST PUT DELETE de Categorias del archivo categoria.js
app.use(require('./categoria.js'));

//Importamos metodos GET POST PUT DELETE de Productos del archivo producto.js
app.use(require('./producto.js'));

//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;