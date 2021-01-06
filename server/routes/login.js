//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Importamos Schema de usuario para poder grabar en la base de datos
const Usuario = require('../models/usuarios.js');

//Creamos variable para encriptar contraseña
//$ npm i bcrypt --save
const bcrypt = require('bcrypt');

//Creamos un objeto json web token para generar un token para el usuario
//$ npm i jsonwebtoken --save
const jwt = require('jsonwebtoken');

//Se crea una funcion post de respuesta 
//post crear nuevo registro
app.post('/login', function(req, res) {

    //obtenemos el body serializado por body-parser
    let body = req.body;

    //Buscamos con el Schema Usuario si encuentra una coincidencia en la bd con el email recibido en body
    //Si lo encuentra regresa un Usuario y lo guarda en usuarioDB
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        if (err) {
            //En caso de recibir un error al grabar responder codigo 500 error del servidor
            //Respondemos un JSon con el formato de error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si no encontro un usuario enviar error codigo 400 bad request
        if (!usuarioDB) {
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err: '(Usuario) o contraseña incorrectos'
            });
        }

        //Si encontro un un usario existente validamos la contraseña correcta
        //compareSync compara la contraseña recibida con la contraseña almacenada
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err: 'Usuario o (contraseña) incorrectos'
            });
        }

        //Generando token de sesion
        //El token contine toda la informacion del usuario ademas de una fecha de caducidad
        /*
        jwt.sign({
            data: 'foobar'
        }, 'secret', { expiresIn: 60 * 60 });

        expiresIn: 60 * 60 es la fecha de expiracion y es en milisegundos
        */
        let token = jwt.sign({
            usuario: usuarioDB,
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });


        //Si encuentra un usuario
        res.json({
            ok: true,
            usuario: usuarioDB,
            token: token
        });
    });
});


//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;