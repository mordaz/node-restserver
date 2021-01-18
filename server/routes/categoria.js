//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Importamos Schema de categoria para poder grabar en la base de datos
const Categorias = require('../models/categorias.js');

//Usando destructuracion obtenemos la funcion de autentificacion
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion.js');
//const { createCollection } = require('../models/usuarios.js');


//Se crea una funcion get de respuesta 
//get obtener registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.get('/categorias', verificaToken, function(req, res) {

    //obteniendo la lista de categorias usando un filtro find
    //Categorias.find({}) retorna todos los documentos sin filtros
    //ejecutando la consulta con exec y guardando el resultado en categorias
    //.sort('descripcion') regresa los documentos ordenados por descripcion
    //.populate('usuario') regresa los datos referenciados del usuario a travez del eschema
    //.populate('usuario', 'nombre email') solo regresa nombre y email del usuario
    Categorias.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoria) => {
            if (err) {
                //En caso de recibir un error al grabar responder codigo 400 bad request
                //Respondemos un JSon con el formato de error
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //Funcion para contar registros 
            Categorias.countDocuments({ estado: true }, (err, contador) => {
                //En caso de grabar la categoria correctamente respondemos ok 
                //Y enviamos la categoria grabado en la BD
                res.json({
                    ok: true,
                    categoria: categoria,
                    contador
                });
            });
        });
});


//Se crea una funcion get de respuesta 
//get obtener registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.get('/categorias/:id', verificaToken, function(req, res) {

    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //obteniendo la lista de categorias usando un filtro find
    //Categorias.find({ estado: true }) es la condicion para realizar la busqueda
    //Categorias.find({}, 'nombre email') filtro para responder solo nombre y mail
    //ejecutando la consulta con exec y guardando el resultado en categorias
    //limit(5) limita los resultados a 5 registros
    //.skip(5) si deseo saltar los primeros 5
    Categorias.findById(id, 'id descripcion estado usuario').exec((err, categoria) => {
        if (err) {
            //En caso de recibir un error al grabar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //En caso de no recibir error se verifica si encontro algun documento
        if (!categoria) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoria,
        });
    });
});


//Se crea una funcion post de respuesta 
//post crear nuevo registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer la insercion
app.post('/categorias', [verificaToken, verificaAdminRole], function(req, res) {
    //obtenemos el body serializado por body-parser
    let body = req.body;

    //Creamos una instancia del Schema de Categorias para guardar en la base de datos
    //Asignamos a cada parametro del Schema de Categorias un valor del body de la peticion
    let categoria = new Categorias({
        descripcion: body.descripcion,
        //guardamos el usuario que lo creo el id se obtiene del middleware verificaToken y es recibido en req
        usuario: req.usuario._id
    });

    //Grabamos el Schema Categorias a la base de datos 
    //categoriaDB es la respuesta de la categoria grabado en mongo
    categoria.save((err, categoriaDB) => {
        if (err) {
            //En caso de recibir un error al grabar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //En caso de grabar la categoria correctamente respondemos ok 
        //Y enviamos la categoria grabado en la BD
        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});


//Se crea una funcion put de respuesta 
//put actualizar registro con el primer parametro asignandolo a id
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer el cambio
app.put('/categorias/:id', [verificaToken, verificaAdminRole], function(req, res) {

    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //obtenemos el body serializado por body-parser
    //El body viene en forma de cuerpo desde la peticion con los nuevos datos de la categoria
    let body = req.body;

    //Creamos un nuevo Objeto de Categoria solo con los valores a modificar
    let categoriaActualizada = {
        descripcion: body.descripcion
    };

    //Usando el Schema "Categoria" podemos encontrar un registro por findByID para modificarlo
    //Se localiza con el id y se actualizan los datos que vienen en el body
    //El parametro id viene en forma de parametro desde la peticion PUT
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    //options new:true regresa el registro acutalizado, runValidators: ejecuta las validaciones del Schema
    Categorias.findByIdAndUpdate(id, categoriaActualizada, { new: true, runValidators: true, useFindAndModify: false, context: 'query' }, (err, categoriaDB) => {
        if (err) {
            //En caso de recibir un error al modificar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }
        //En caso de grabar la categoria correctamente respondemos ok 
        //Y enviamos la categoria grabado en la BD
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});


//Se crea una funcion delete de respuesta 
//delete borrar registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer el cambio
app.delete('/categorias/:id', [verificaToken, verificaAdminRole], function(req, res) {
    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //OPCION 1 ELIMINAR FISICAMENTE EL REGISTRO

    //Usando el Schema "Categoria" podemos encontrar un registro por findByID para modificarlo
    //El parametro id viene en forma de parametro desde la peticion DELETE
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    Categorias.findByIdAndRemove(id, { useFindAndModify: false }, (err, categoriaEliminada) => {
        if (err) {
            //En caso de recibir un error al eliminar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //Verificando si encontro y elimino alguna categoria
        if (!categoriaEliminada) {
            //En caso de no borrar ninguna categoria responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        //En caso de elimnar la categoria correctamente respondemos ok 
        //Y enviamos la cartegoria grabado en la BD
        res.json({
            ok: true,
            meesage: 'Categoria Eliminada'
        });
    });
});


//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;