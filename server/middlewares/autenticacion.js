// =============================
// VERIFICAR TOKEN
// =============================

//Creamos un objeto json web token para validar el token del usuario
//$ npm i jsonwebtoken --save
const jwt = require('jsonwebtoken');

//Funcion callback que recibe de parametros req -> solicitud , res ->respuesta , next ->
let verificaToken = (req, res, next) => {

    //Obtener header token de la solicitud req
    let token = req.get('token');

    //Verificamos si el token es valido
    //token es el token a validar, process.env.SEED es la semilla con que se genero el token
    jwt.verify(token, process.env.SEED, (err, decoded) => {
        //Si recibimos un error enviamos mensaje de error
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    meesage: 'Token invalido'
                }
            });
        }

        //En caso de que la validacion sea correcta respondemos los datos del usuario
        //Los datos de usuario vienen ocultos en el mismo token ya decodificado
        req.usuario = decoded.usuario;

        //Ejecutamos next hasta que las validaciones se realicen de forma correcta 
        //Si no se ejecuta next el middleware no permitira continuar con la funcion
        //El Next se debe ejecutar dentro de la validacion 
        next();
    });
};


// =============================
// VERIFICAR ADMIN ROLE
// =============================

//Funcion callback que recibe de parametros req -> solicitud , res ->respuesta , next ->
let verificaAdminRole = (req, res, next) => {

    //Obtenemos los datos del usuario que vienen del middleware verficaToken
    let usuario = req.usuario;

    //Verificamos si el role es ADMIN_ROLE
    if (usuario.role === "ADMIN_ROLE") {
        next();
    } else {
        //Enviamos mensaje de error
        return res.status(401).json({
            ok: false,
            err: {
                meesage: 'El usuario no tiene rol de administrador'
            }
        });
    }
}

module.exports = {
    verificaToken,
    verificaAdminRole
};