const redisClient = require('../../config/redis');

const PREFIJO_CARRITO = 'carrito:';
const EXPIRACION_CARRITO = 60 * 60 * 24 * 7; // 7 días

const carritoService = {
    obtenerCarrito: async (idUsuario) => {
        const datosCarrito = await redisClient.get(`${PREFIJO_CARRITO}${idUsuario}`);
        if (!datosCarrito) {
            return { articulos: [], total: 0 };
        }
        return JSON.parse(datosCarrito);
    },

    agregarArticulo: async (idUsuario, articulo) => {
        const carrito = await carritoService.obtenerCarrito(idUsuario);
        const indiceExistente = carrito.articulos.findIndex(item => item.idProducto === articulo.idProducto);

        if (indiceExistente >= 0) {
            carrito.articulos[indiceExistente].cantidad += articulo.cantidad;
        } else {
            carrito.articulos.push({
                idProducto: articulo.idProducto,
                cantidad: articulo.cantidad,
                precio: articulo.precio
            });
        }

        carrito.total = carrito.articulos.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);

        await redisClient.setEx(
            `${PREFIJO_CARRITO}${idUsuario}`,
            EXPIRACION_CARRITO,
            JSON.stringify(carrito)
        );

        return carrito;
    },

    eliminarArticulo: async (idUsuario, idProducto) => {
        const carrito = await carritoService.obtenerCarrito(idUsuario);
        
        carrito.articulos = carrito.articulos.filter(item => item.idProducto !== idProducto);
        carrito.total = carrito.articulos.reduce((acc, curr) => acc + (curr.precio * curr.cantidad), 0);

        await redisClient.setEx(
            `${PREFIJO_CARRITO}${idUsuario}`,
            EXPIRACION_CARRITO,
            JSON.stringify(carrito)
        );

        return carrito;
    },

    vaciarCarrito: async (idUsuario) => {
        await redisClient.del(`${PREFIJO_CARRITO}${idUsuario}`);
        return { mensaje: 'Carrito vaciado exitosamente' };
    }
};

module.exports = carritoService;
