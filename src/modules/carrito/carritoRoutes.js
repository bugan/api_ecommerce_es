const express = require('express');
const carritoController = require('./carritoController');

const enrutador = express.Router();

enrutador.get('/', carritoController.obtenerCarrito);
enrutador.post('/articulos', carritoController.agregarArticulo);
enrutador.delete('/articulos/:idArticulo', carritoController.eliminarArticulo);
enrutador.delete('/', carritoController.vaciarCarrito);

module.exports = enrutador;
