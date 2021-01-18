//Archivo necesario para configuracion de ejecucion en produccion o en servicio

// =============================
// ENTORNO
// =============================
//Variable para comprobar si estamos trabajando en produccion o desarrollo
//Si no se recibe parametro se considera entorno de desarrollo por default 'dev'
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =============================
// PUERTO
// =============================
//Asignamos el puerto de escucha al valor por defecto 3000 al objeto process
//el objeto process esta en ejecucion en todo momento es como ua variable global
process.env.PORT = process.env.PORT || 3000;

// =============================
// LOGIN
// =============================
//Fecha de expiracion de token para la sesion de usuario
// 60 Seg x 60 Min x 24 Hrs = 30 Dias
process.env.CADUCIDAD_TOKEN = '48h';
//Seed semilla de autenticacion para generacion de token
//Semilla declarada en el servidor 'Heroku' o localmente
process.env.SEED = process.env.SEED || 'semilla-de-token-desarollo';

// =============================
// BASE DE DATOS
// =============================
//Creamos una variable con la direccion de la base de datos
//El valor depende del parametro NODE_ENV
let urlDB;
if (process.env.NODE_ENV == 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    //Variable de entorno de heroku
    urlDB = process.env.MONGO_URI;
}
process.env.URL_DB = urlDB;

// =============================
// CLIENT ID DE GOOGLE
// =============================
//Creamos una variable con el ID del servicio de GOOGLE
process.env.CLIENT_ID = process.env.CLIENT_ID || '613161767546-pv4jnp1634q666lkd7b008qlqud10kb1.apps.googleusercontent.com';