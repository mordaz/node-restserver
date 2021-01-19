//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Cargamos paquere de filesystem de node para manipular archivos ya grabados
const fs = require('fs');
//Cargamos paquete de direcciones de node para generar rutas
const path = require('path');

//Usando destructuracion obtenemos la funcion de autentificacion
const { verificaTokenImg } = require('../middlewares/autenticacion.js');

//Creamos una funcion get para regresar la imagen solicitada
app.get('/imagen/:tipo/:img', verificaTokenImg, (req, res) => {

    //Obtenemos el valor de los parametros
    let tipo = req.params.tipo;
    let img = req.params.img;

    //Generamos la ruta para verificar si la imagen existe
    let pathImg = `./uploads/${tipo}/${img}`;
    let pathRespuesta;
    if (fs.existsSync(pathImg)) {
        //generamos la ruta absoluta 
        pathRespuesta = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    } else {
        //en caso de no existir regresamos la imagen por default
        pathRespuesta = path.resolve(__dirname, '../assets/no-imagen.png');
    }

    //Resondemos la imagen solicitada 
    res.sendFile(pathRespuesta);
});


//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;