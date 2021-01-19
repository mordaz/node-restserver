//Creamos el objeto express del Node Package Manager npm
//express sirve para crear un servidor web con puerto de escucha
//$ npm install express --save
const express = require('express');
const app = express();

//Cargamos paquere de filesystem de node para manipular archivos ya grabados
const fs = require('fs');
//Cargamos paquete de direcciones de node para generar rutas
const path = require('path');

//Middleware para cargar archivos
//npm i express-fileupload --save
const fileUpload = require('express-fileupload');

// Cuando se ejecuta la funcion Upload lo carga en req.files 
app.use(fileUpload());

//Importamos Schema de usuario para poder grabar en la base de datos
const Usuario = require('../models/usuarios.js');

//Importamos Schema de productos para poder grabar en la base de datos
const Producto = require('../models/productos.js');

// Metodo put que cargara archivos en la ruta upload
// Recibe como argumento 
app.put('/upload/:tipo/:id', function(req, res) {

    //Recibimos los parametros de tipo de carga y id de producto o usuario 
    let tipo = req.params.tipo;
    let id = req.params.id;

    //Validacion para verificar si se cargo algun archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: "No se ha seleccionado ningun archivo"
                }
            });
    }

    //Validamos el tipo de carga que se tiene que hacer
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        //Si el parametro recibido no coincide con los tiposValidos enviar un error
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: "Tipo no valido, los tipos permitidos son " + tiposValidos.join(', ')
                }
            });
    }


    // En caso de recibir un archivo
    // Tomamos el archivo proveniente del body <form-data> de la peticion con nombre "archivo"
    let archivo = req.files.archivo;

    // Verificar la extension del archivo
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    // Segmentamos el nombre en nombre y extension
    let nombreSegmentado = archivo.name.split('.');
    // Obtenemos la extension
    let extension = nombreSegmentado[nombreSegmentado.length - 1];
    // Comparamos la extension con las permitidas
    if (extensionesValidas.indexOf(extension) < 0) {
        //Si no la encontro significa que la extension no es valida
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: "Extension de archivo no valida, las extensiones validas son " + extensionesValidas.join(', ')
                }
            });
    }

    // Generar nombre de archivo
    // Adjuntamos los milisegundos para generar un nombre aleatoreo diferente para que 
    // el cache del navegador actualice de forma correcta la imagen del archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Generamos la ruta donde se guardara el archivo
    let uploadPath = `uploads/${tipo}/${nombreArchivo}`;

    // Con el metodo mv() guardamos el archivo en la ruta indicada del servidor
    archivo.mv(uploadPath, function(err) {
        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        //Despues de cargar la imagen al servidor actualizamos la imagen en la base de datos
        if (tipo === 'usuarios')
            imagenUsuario(id, res, nombreArchivo, tipo);
        if (tipo === 'productos')
            imagenProducto(id, res, nombreArchivo, tipo);
    });
});

//Funcion para cargar la imagen en la base de datos
//Recibe como parametro el id y la respuesta de la funcion PUT original
function imagenUsuario(id, res, nombreArchivo, tipo) {
    //Buscamos el usuario por ID
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            //Eliminando imagen subida porque ocurrio un error con la busqueda
            borraArchivo(nombreArchivo, tipo);
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }
        //Verificando si encontro el usuario
        if (!usuarioDB) {
            //Eliminando imagen subida porque el usuario no existe
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }

        //Eliminando imagen anterior de usuario si existe
        borraArchivo(usuarioDB.img, tipo);


        //Asignando el nombre del archivo a almacenar
        usuarioDB.img = nombreArchivo;

        //Grabando en base de datos
        usuarioDB.save((err, usuarioActualizado) => {
            if (err)
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });

            //En caso de no recibir error enviamos la confirmacion
            res.jsonp({
                ok: true,
                usuario: usuarioActualizado,
                message: "Archivo cargado correctamente"
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo, tipo) {
    //Buscamos el producto por ID
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            //Eliminando imagen subida porque ocurrio un error con la busqueda
            borraArchivo(nombreArchivo, tipo);
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }
        //Verificando si encontro el producto
        if (!productoDB) {
            //Eliminando imagen subida porque el producto no existe
            borraArchivo(nombreArchivo, tipo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        //Eliminando imagen anterior de producto si existe
        borraArchivo(productoDB.img, tipo);


        //Asignando el nombre del archivo a almacenar
        productoDB.img = nombreArchivo;

        //Grabando en base de datos
        productoDB.save((err, productoActualizado) => {
            if (err)
                return res.status(500)
                    .json({
                        ok: false,
                        err
                    });

            //En caso de no recibir error enviamos la confirmacion
            res.jsonp({
                ok: true,
                producto: productoActualizado,
                message: "Archivo cargado correctamente"
            });
        });
    });
}

function borraArchivo(nombreImagen, tipo) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;