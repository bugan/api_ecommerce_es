const carritoService = require('../src/modules/carrito/carritoService');

jest.mock('../src/modules/carrito/carritoService', () => ({
  obtenerCarrito: jest.fn(),
  agregarArticulo: jest.fn(),
  eliminarArticulo: jest.fn(),
  vaciarCarrito: jest.fn(),
}));

const carritoController = require('../src/modules/carrito/carritoController');

describe('src/modules/carrito/carritoController.js', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    req = {
      query: {},
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    jest.clearAllMocks();
  });

  describe('validación de idUsuario requerido', () => {
    test('obtenerCarrito responde 400 y no invoca el servicio si req no tiene user ni query', async () => {
      // Arrange
      req = { query: {}, body: {}, params: {} };

      // Act
      await carritoController.obtenerCarrito(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere el idUsuario' });
      expect(carritoService.obtenerCarrito).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('agregarArticulo responde 400 y no invoca el servicio si req no tiene user ni query', async () => {
      // Arrange
      req = { query: {}, body: { idProducto: 'prod-1', cantidad: 2, precio: 100 }, params: {} };

      // Act
      await carritoController.agregarArticulo(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere el idUsuario' });
      expect(carritoService.agregarArticulo).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('eliminarArticulo responde 400 y no invoca el servicio si req no tiene user ni query', async () => {
      // Arrange
      req = { query: {}, body: {}, params: { idArticulo: 'prod-1' } };

      // Act
      await carritoController.eliminarArticulo(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere el idUsuario' });
      expect(carritoService.eliminarArticulo).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('vaciarCarrito responde 400 y no invoca el servicio si req no tiene user ni query', async () => {
      // Arrange
      req = { query: {}, body: {}, params: {} };

      // Act
      await carritoController.vaciarCarrito(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Se requiere el idUsuario' });
      expect(carritoService.vaciarCarrito).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('prioridad de req.user.sub sobre req.query.idUsuario', () => {
    test('agregarArticulo usa req.user.sub aunque query.idUsuario sea diferente', async () => {
      // Arrange
      req = {
        user: { sub: 'user-auth-123' },
        query: { idUsuario: 'user-query-999' },
        body: { idProducto: 'prod-1', cantidad: 2, precio: 100 },
        params: {},
      };
      const carritoMock = { articulos: [], total: 0 };
      carritoService.agregarArticulo.mockResolvedValue(carritoMock);

      // Act
      await carritoController.agregarArticulo(req, res, next);

      // Assert
      expect(carritoService.agregarArticulo).toHaveBeenCalledWith('user-auth-123', req.body);
      expect(carritoService.agregarArticulo).not.toHaveBeenCalledWith('user-query-999', req.body);
      expect(res.json).toHaveBeenCalledWith({ datos: carritoMock });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('manejo de errores', () => {
    test('llama next(error) cuando el servicio obtenerCarrito lanza un error', async () => {
      // Arrange
      req = {
        user: { sub: 'user-auth-123' },
        query: {},
        body: {},
        params: {},
      };
      const error = new Error('Fallo del servicio');
      carritoService.obtenerCarrito.mockRejectedValue(error);

      // Act
      await carritoController.obtenerCarrito(req, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalledWith({ error: 'Se requiere el idUsuario' });
    });
  });
});
