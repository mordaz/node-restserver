//Importamos el archivo de configuracion 
//cuando no asignamos a variable solo ejecuta en este momento el codigo 
//del java.js
require('./config/config.js');

//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express')
const app = express()

//Creamos el objeto body-parser del Node Package Manager npm
//body-parser serializa automaticamente los parametros enviados en la URL
//$ npm install body-parser --save
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


//Se crea una funcion get de respuesta 
//get obtener registro
app.get('/usuarios', function(req, res) {
    res.json('get usuarios')
})

//Se crea una funcion post de respuesta 
//post crear nuevo registro
app.post('/usuarios', function(req, res) {
    //obtenemos el body serializado por body-parser
    let body = req.body;

    //validando el parametro serializado nombre
    if (body.nombre === undefined) {
        // en caso de no recibir el nombre responder codigo 400 bad request
        res.status(400).json({
            ok: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        // en caso de recibir parametros correctos responder ok
        res.json({ persona: body });
    }
})

//Se crea una funcion put de respuesta 
//put actualizar registro
app.put('/usuarios', function(req, res) {
    res.json('put usuarios')
})

//Se crea una funcion delete de respuesta 
//delete borrar registro
app.delete('/usuarios', function(req, res) {
    res.json('delete usuarios')
})

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto ', process.env.PORT);
});