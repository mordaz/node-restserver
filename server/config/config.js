//Archivo necesario para configuracion de ejecucion en produccion o en servicio

//Asignamos el puerto de escucha al valor por defecto 3000 al objeto process
//el objeto process esta en ejecucion en todo momento es como ua variable global
process.env.PORT = process.env.PORT || 3000;