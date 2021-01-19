//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Importamos Schema de productos para poder grabar en la base de datos
const Producto = require('../models/productos.js');

//Usando destructuracion obtenemos la funcion de autentificacion
const { verificaToken } = require('../middlewares/autenticacion.js');

//Se crea una funcion get de respuesta 
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.get('/productos', verificaToken, function(req, res) {

    //varibale para indicar a partir de que registro se va a obtener la lista
    //req.query.desde se obtiene de los parametros opcionales de la peticion get
    //en caso de no recibir el parametro usar cero
    let desde = req.query.desde || 0;
    //convirtiendo a numero
    desde = Number(desde);

    //variable para indicar cuantos registros se van a mostrar
    let limite = req.query.limite || 0;
    limite = Number(limite);

    //obteniendo la lista de productos usando un filtro find
    //.skip(5) si deseo saltar los primeros 5
    //limit(5) limita los resultados a 5 registros
    //productos.find({disponible: true }) retorna todos los documentos donde disponible=true
    //.populate('usuario') regresa los datos referenciados del usuario a travez del eschema
    //.populate('usuario', 'nombre email') solo regresa nombre y email del usuario
    //ejecutando la consulta con exec y guardando el resultado en productos
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, producto) => {
            if (err) {
                //En caso de recibir un error al grabar responder codigo 400 bad request
                //Respondemos un JSon con el formato de error
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //Funcion para contar registros 
            Producto.countDocuments({ disponible: true }, (err, contador) => {
                //En caso de grabar la producto correctamente respondemos ok 
                //Y enviamos la producto grabado en la BD
                res.json({
                    ok: true,
                    producto: producto,
                    contador
                });
            });
        });
});


//Se crea una funcion get de respuesta 
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.get('/productos/:id', verificaToken, function(req, res) {

    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //obteniendo la lista de productos usando un filtro findById
    //ejecutando la consulta con exec y guardando el resultado en productos
    //.populate('usuario') regresa los datos referenciados del usuario a travez del eschema
    //.populate('usuario', 'nombre email') solo regresa nombre y email del usuario
    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, productoDB) => {
            if (err) {
                //En caso de recibir un error al grabar responder codigo 400 bad request
                //Respondemos un JSon con el formato de error
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //En caso de no recibir error se verifica si encontro algun documento
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
            });
        });
});

// =============================
// BUSCAR PRODUCTOS CON EXPRESION REGULAR
// =============================
//Se crea una funcion get de respuesta 
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.get('/productos/buscar/:termino', verificaToken, function(req, res) {
    //obtenemos la coincidencia que fue enviado como parametro
    let termino = req.params.termino;

    //Creando una expresion regular para busqueda de moongose
    //'i' se usa para que no haga distincion entre mayusculas y minusculas
    //RegExp es una funcion de javascript normal
    let regex = new RegExp(termino, 'i');

    //obteniendo la lista de productos usando un filtro findById
    //ejecutando la consulta con exec y guardando el resultado en productos
    //.populate('usuario') regresa los datos referenciados del usuario a travez del eschema
    //.populate('usuario', 'nombre email') solo regresa nombre y email del usuario
    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion')
        .exec((err, productoDB) => {
            if (err) {
                //En caso de recibir un error al grabar responder codigo 400 bad request
                //Respondemos un JSon con el formato de error
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            //En caso de no recibir error se verifica si encontro algun documento
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                producto: productoDB,
            });
        });
});


//Se crea una funcion post de respuesta 
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.post('/productos', verificaToken, function(req, res) {

    //obtenemos el body serializado por body-parser
    let body = req.body;

    //Verificamos si la categoria se encuentra en la base de datos
    //Importamos Schema de categorias para poder buscar en la base de datos
    const Categoria = require('../models/categorias.js');
    Categoria.findById(body.categoria).exec((err, categoria) => {
        if (err) {
            //En caso de recibir un error al buscar responder codigo 400 bad request
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

        //En caso de que si exista la categoria intentamos grabar el producto
        //Creamos una instancia del Schema de productos para guardar en la base de datos
        //Asignamos a cada parametro del Schema de productos un valor del body de la peticion
        let producto = new Producto({
            nombre: body.nombre,
            precioUni: Number(body.precio),
            descripcion: body.descripcion,
            categoria: categoria._id,
            usuario: req.usuario._id
        });

        //Grabamos el Schema productos a la base de datos 
        //productoDB es la respuesta de la producto grabado en mongo
        producto.save((err, productoDB) => {
            if (err) {
                //En caso de recibir un error al grabar responder codigo 400 bad request
                //Respondemos un JSon con el formato de error
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            //En caso de grabar la producto correctamente respondemos ok 
            //Y enviamos la producto grabado en la BD
            res.status(201).json({
                ok: true,
                producto: productoDB
            });

        });

    });
});


//Se crea una funcion put de respuesta 
//put actualizar registro con el primer parametro asignandolo a id
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
app.put('/productos/:id', verificaToken, function(req, res) {

    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //obtenemos el body serializado por body-parser
    //El body viene en forma de cuerpo desde la peticion con los nuevos datos de la producto
    let body = req.body;

    //FORMA DE ACTUALIZAR 1 ENCONTRANDO y ACTUALIZANDO AL MISMO TIEMPO
    /*
    //Creamos un nuevo Objeto de producto solo con los valores a modificar
    let productoActualizado = {
        nombre: body.nombre,
        precioUni: Number(body.precio),
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    };

    //Usando el Schema "producto" podemos encontrar un registro por findByID para modificarlo
    //Se localiza con el id y se actualizan los datos que vienen en el body
    //El parametro id viene en forma de parametro desde la peticion PUT
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    //options new:true regresa el registro acutalizado, runValidators: ejecuta las validaciones del Schema
    Producto.findByIdAndUpdate(id, productoActualizado, { new: true, runValidators: true, useFindAndModify: false, context: 'query' }, (err, productoLocalizado) => {
        if (err) {
            //En caso de recibir un error al modificar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //En caso de no recibir error se verifica si encontro algun documento
        if (!productoLocalizado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        //En caso de grabar la producto correctamente respondemos ok 
        //Y enviamos la producto grabado en la BD
        res.json({
            ok: true,
            producto: productoLocalizado
        });
    });
    */

    //FORMA DE ACTUALIZAR 2 ENCONTRANDO PRIMERO Y ACTUALIZANDO DESPUES

    //Usando el Schema "producto" podemos encontrar un registro por findByID para modificarlo
    //Se localiza con el id y se actualizan los datos que vienen en el body
    //El parametro id viene en forma de parametro desde la peticion PUT
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    //options new:true regresa el registro acutalizado, runValidators: ejecuta las validaciones del Schema
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            //En caso de recibir un error al modificar responder codigo 500 bad request
            //Respondemos un JSon con el formato de error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //En caso de no recibir error se verifica si encontro algun documento
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }
        //Actualizamos el objeto de la BD
        productoDB.nombre = body.nombre;
        productoDB.precioUni = Number(body.precio);
        productoDB.descripcion = body.descripcion;
        productoDB.disponible = body.disponible;
        productoDB.categoria = body.categoria;

        //Guardando objeto modificado de la BD
        productoDB.save((err, productoGuardado) => {
            if (err) {
                //En caso de recibir un error al modificar responder codigo 500 bad request
                //Respondemos un JSon con el formato de error
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            //En caso de grabar la producto correctamente respondemos ok 
            //Y enviamos la producto grabado en la BD
            res.json({
                ok: true,
                producto: productoDB
            });

        });

    });

});

//Se crea una funcion delete de respuesta 
//delete borrar registro
//verificaToken es un middleware que se dispara automaticamente al entrar a la funcion
//verificaToken sirve para hacer validaciones hasta cumplirse se ejecuta el codigo de aqui
//verificaAdminRole sirve para verificar el role del usuario que intenta hacer el cambio
app.delete('/productos/:id', verificaToken, function(req, res) {

    //obtenemos el id que fue enviado como parametro
    let id = req.params.id;

    //OPCION 2 CAMBIAR EL ESTADO DEL REGISTRO SIN ELIMINARLO
    //Creamos un nuevo Objeto de producto solo con los valores a modificar
    let productoActualizado = {
        disponible: false
    };

    //Usando el Schema "Producto" podemos encontrar un registro por findByID para modificarlo
    //Se localiza con el id y se actualizan los datos que vienen en el body
    //El parametro id viene en forma de parametro desde la peticion PUT
    //https://mongoosejs.com/docs/api/model.html#model_Model.findByIdAndUpdate
    //options new:true regresa el registro acutalizado, runValidators: ejecuta las validaciones del Schema
    Producto.findByIdAndUpdate(id, productoActualizado, { new: true, useFindAndModify: false }, (err, productoEliminado) => {
        if (err) {
            //En caso de recibir un error al modificar responder codigo 400 bad request
            //Respondemos un JSon con el formato de error
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //En caso de no recibir error se verifica si encontro algun documento
        if (!productoEliminado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        //En caso de grabar el usuario correctamente respondemos ok 
        //Y enviamos el usuario modificado en la BD
        res.json({
            ok: true,
            meesage: 'Producto Eliminado'
        });
    });
});

//Se exporta la app como modulo para servidor de middleware en el proyecto principal
module.exports = app;