const carritoService = require('./carritoService');

const carritoController = {
    obtenerCarrito: async (req, res, next) => {
        try {
            const idUsuario = req.user ? req.user.sub : req.query.idUsuario;
            if (!idUsuario) {
                return res.status(400).json({ error: 'Se requiere el idUsuario' });
            }

            const carrito = await carritoService.obtenerCarrito(idUsuario);
            res.json({ datos: carrito });
        } catch (error) {
            next(error);
        }
    },

    agregarArticulo: async (req, res, next) => {
        try {
            const idUsuario = req.user ? req.user.sub : req.query.idUsuario;
            if (!idUsuario) {
                return res.status(400).json({ error: 'Se requiere el idUsuario' });
            }

            const carrito = await carritoService.agregarArticulo(idUsuario, req.body);
            res.json({ datos: carrito });
        } catch (error) {
            next(error);
        }
    },

    eliminarArticulo: async (req, res, next) => {
        try {
            const idUsuario = req.user ? req.user.sub : req.query.idUsuario;
            const { idArticulo } = req.params;

            if (!idUsuario) {
                return res.status(400).json({ error: 'Se requiere el idUsuario' });
            }

            const carrito = await carritoService.eliminarArticulo(idUsuario, idArticulo);
            res.json({ datos: carrito });
        } catch (error) {
            next(error);
        }
    },

    vaciarCarrito: async (req, res, next) => {
        try {
            const idUsuario = req.user ? req.user.sub : req.query.idUsuario;
            if (!idUsuario) {
                return res.status(400).json({ error: 'Se requiere el idUsuario' });
            }

            const resultado = await carritoService.vaciarCarrito(idUsuario);
            res.json({ datos: resultado });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = carritoController;
