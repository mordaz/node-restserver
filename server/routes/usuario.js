//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Importamos Schema de usuario para poder grabar en la base de datos
const Usuario = require('../models/usuarios.js');

//Usando destructuracion obtenemos la funcion de autentificacion
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion.js');

//Creamos variable para encriptar contraseña
//$ npm i bcrypt --save
const bcrypt = require('bcrypt');

//Importamos Herramientas de Underscore.JS para funcionalidades nuevas JavaScript
//Asignandole el esquema de usuarios
//npm install underscore --save
//https://underscorejs.org
const underscore = require('underscore');
const { json } = require('body-parser');

//Se crea una funcion get de respuesta 
//get obtener registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.get('/usuarios', verificaToken, function(req, res) {

    //varibale para indicar a partir de que registro se va a obtener la lista
    //req.query.desde se obtiene de los parametros opcionales de la peticion get
    //en caso de no recibir el parametro usar cero
    let desde = req.query.desde || 0;
    //convirtiendo a numero
    desde = Number(desde);

    //variable para indicar cuantos registros se van a mostrar
    let limite = req.query.limite || 0;
    limite = Number(limite);

    //obteniendo la lista de usuarios usando un filtro find
    //Usuario.find({ estado: true }) es la condicion para realizar la busqueda
    //Usuario.find({}, 'nombre email') filtro para responder solo nombre y mail
    //ejecutando la consulta con exec y guardando el resultado en usuarios
    //limit(5) limita los resultados a 5 registros
    //.skip(5) si deseo saltar los primeros 5
    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                //En caso de recibir un error al grabar responder codigo 400 bad request
                //Respondemos un JSon con el formato de error
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //Funcion para contar registros 
            Usuario.countDocuments({ estado: true }, (err, contador) => {
                //En caso de grabar el usuario correctamente respondemos ok 
                //Y enviamos el usuario grabado en la BD
                res.json({
                    ok: true,
                    usuarios: usuarios,
                    contador
                });
            });
        });
});

//Se crea una funcion post de respuesta 
//post crear nuevo registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer la insercion
app.post('/usuarios', function(req, res) {
    //obtenemos el body serializado por body-parser
    let body = req.body;

    //Creamos una instancia del Schema de Usuario para guardar en la base de datos
    //Asignamos a cada parametro del Schema de Usuario un valor del body de la peticion
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //Encriptamos la contraseña que se guarda
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
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
        //En caso de grabar el usuario correctamente respondemos ok 
        //Y enviamos el usuario grabado en la BD
        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });
});

//Se crea una funcion put de respuesta 
//put actualizar registro con el primer parametro asignandolo a id
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer el cambio
app.put('/usuarios/:id', [verificaToken, verificaAdminRole], function(req, res) {
    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;
    //obtenemos el body serializado por body-parser
    //El body viene en forma de cuerpo desde la peticion con los nuevos datos del usuario
    let body = req.body;

    //OPCION 1
    //Creamos un nuevo Objeto de Usuario solo con los valores a modificar
    let usuarioActualizado = {
        nombre: body.nombre,
        email: body.email,
        img: body.img,
        role: body.role,
        estado: body.estado
    };

    //OPCION 2
    //Pick es una funcion de Underscore y regresa una copia de un objeto filtrando valores
    let usuarioActualizado2 = underscore.pick(body, ['nombre', 'email', 'img', 'role', 'estado']);

    //Usando el Schema "Usuario" podemos encontrar un registro por findByID para modificarlo
    //Se localiza con el id y se actualizan los datos que vienen en el body
    //El parametro id viene en forma de parametro desde la peticion PUT
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    //options new:true regresa el registro acutalizado, runValidators: ejecuta las validaciones del Schema
    Usuario.findByIdAndUpdate(id, usuarioActualizado2, { new: true, runValidators: true, useFindAndModify: false }, (err, usuarioDB) => {
        if (err) {
            //En caso de recibir un error al modificar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //En caso de grabar el usuario correctamente respondemos ok 
        //Y enviamos el usuario grabado en la BD
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

//Se crea una funcion delete de respuesta 
//delete borrar registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer el cambio
app.delete('/usuarios/:id', [verificaToken, verificaAdminRole], function(req, res) {
    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //OPCION 1 ELIMINAR FISICAMENTE EL REGISTRO
    /*
    //Usando el Schema "Usuario" podemos encontrar un registro por findByID para modificarlo
    //El parametro id viene en forma de parametro desde la peticion DELETE
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    Usuario.findByIdAndRemove(id, { useFindAndModify: false }, (err, usuarioEliminado) => {
        if (err) {
            //En caso de recibir un error al eliminar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Verificando si encontro y elimino algun usuario
        if (!usuarioEliminado) {
            //En caso de no borrar ningun usuario responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        //En caso de elimnar el usuario correctamente respondemos ok 
        //Y enviamos el usuario grabado en la BD
        res.json({
            ok: true,
            usuario: usuarioEliminado
        });
    });
    */

    //OPCION 2 CAMBIAR EL ESTADO DEL REGISTRO SIN ELIMINARLO
    //Creamos un nuevo Objeto de Usuario solo con los valores a modificar
    let usuarioActualizado = {
        estado: false
    };

    //Usando el Schema "Usuario" podemos encontrar un registro por findByID para modificarlo
    //Se localiza con el id y se actualizan los datos que vienen en el body
    //El parametro id viene en forma de parametro desde la peticion PUT
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    //options new:true regresa el registro acutalizado, runValidators: ejecuta las validaciones del Schema
    Usuario.findByIdAndUpdate(id, usuarioActualizado, { new: true, useFindAndModify: false }, (err, usuarioEliminado) => {
        if (err) {
            //En caso de recibir un error al modificar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //En caso de grabar el usuario correctamente respondemos ok 
        //Y enviamos el usuario modificado en la BD
        res.json({
            ok: true,
            meesage: 'Usuario Eliminado'
        });
    });

});

//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;