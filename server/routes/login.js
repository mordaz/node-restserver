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

//Creamos un objeto validador de tokens sign in de google
//npm install google-auth-library --save
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


//Se crea una funcion post de respuesta al logn in normal
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

//Configuracion de google para hacer login mediante google sign in
//Funcion descargada de https://developers.google.com/identity/sign-in/web/backend-auth
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    //Al verificar el token de google obtendremos los datos necesarios para crear un usuario en base de datos 
    //Los regresaremos a la funcion post de autentificacion
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

//Se crea una funcion post de respuesta al logn in de google
//post crear nuevo registro
app.post('/google', async(req, res) => {

    //obtenemos el token google recibido de la peticion x-form-www-urlencoded 
    let token = req.body.idtoken;

    //ejecutamos la funcion de verificacion de google para obtener los datos del usuario
    //como la funcion de verificacion es un async se debe usar await
    //para poder usar await la funcion callback principal debe ser async tambien
    let googleUser = await verify(token)
        .catch(e => {
            // En caso de error respondemos con estatus de error
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //verificamos que el usuario no exista en la base de datos
    //findOne recibe en su primer parametro el objeto a comparar
    //en el segundo parametro regresa una funcion callback con el usuarioDB encontrado
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            //En caso de recibir un error al grabar responder codigo 500 error del servidor
            //Respondemos un JSon con el formato de error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //Si encontro un usuario registrado con ese email
        if (usuarioDB) {
            //Si el usuario no se auntentico por google
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe ingresar con login normal'
                    }
                });
            }
            //Si el usuario si estaba autenticado con google generar su token de sesion
            else {
                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
            }

            //En caso de que la validacion sea correcta regresamos el usuario
            res.json({
                ok: true,
                usuario: usuarioDB,
                token
            });
        }

        //Si el usuario logeado no existe en la base de datos creamos un nuevo usuario
        else {
            //Creamos una instancia del Schema de Usuario para guardar en la base de datos
            //Asignamos a cada parametro del Schema de Usuario un valor del body de la peticion
            let usuario = new Usuario({
                nombre: googleUser.nombre,
                email: googleUser.email,
                img: googleUser.img,
                password: ':)',
                role: 'USER_ROLE',
                google: true
            });

            //Grabamos el Schema Usuario a la base de datos 
            //usuarioDB es la respuesta del usuario grabado en mongo
            usuario.save((err, usuarioDB) => {
                if (err) {
                    //En caso de recibir un error al grabar responder codigo 400 bad request
                    //Respondemos un JSon con el formato de error
                    return res.status(400).json({
                        ok: false,
                        err
                    });
                }
                //En caso de grabar el usuario correctamente respondemos y generamos un token
                let token = jwt.sign({
                    usuario: usuarioDB,
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                //si el token se genero correctamente resondemos el token y el usario
                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            });
        }
    });
});


//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;