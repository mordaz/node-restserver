//Importamos el archivo de configuracion 
//cuando no asignamos a variable solo ejecuta en este momento el codigo del java.js
require('./config/config.js');

//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Creamos esquema de conexion de base de datos moongose
//Moongose es un servidor de base de datos no relacional
//$ npm install mongoose --save
const mongoose = require('mongoose');

//Creamos el objeto body-parser del Node Package Manager npm
//body-parser serializa automaticamente los parametros enviados en la URL
//los parametros deben venir en un formato x-www-form-urlencoder
//$ npm install body-parser --save
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Importamos metodos GET POST PUT DELETE de Ususarios del archivo usuario.js
app.use(require('./routes/usuario.js'));

//Conectando con la base de datos
//Creando parametros de conexion dbOptions
dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
};
//estableciendo conexion mediante una funcion async await  
//process.env.URL_DB viene del archivo de configuracion config.js
(async() => {
    try {
        await mongoose.connect(process.env.URL_DB, dbOptions);
        console.log('Servidor de base de datos ONLINE');
    } catch (err) {
        console.log('error: ' + err);
    }
})()

//process.env.PORT es una variable importada de config.js
app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto ', process.env.PORT);
});