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