const redisClient = require('../src/config/redis');

jest.mock('../src/config/redis', () => ({
  get: jest.fn(),
  setEx: jest.fn(),
  del: jest.fn(),
}));

const carritoService = require('../src/modules/carrito/carritoService');

describe('src/modules/carrito/carritoService.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('agregarArticulo', () => {
    test('crea un carrito nuevo, calcula total=10 y persiste con TTL positivo', async () => {
      // Arrange
      redisClient.get.mockResolvedValueOnce(null);
      redisClient.setEx.mockResolvedValueOnce('OK');

      const idUsuario = 'u1';
      const articulo = { idProducto: 'p1', cantidad: 2, precio: 5 };

      // Act
      const carrito = await carritoService.agregarArticulo(idUsuario, articulo);

      // Assert
      expect(carrito).toEqual({
        articulos: [
          {
            idProducto: 'p1',
            cantidad: 2,
            precio: 5,
          },
        ],
        total: 10,
      });

      expect(redisClient.get).toHaveBeenCalledWith('carrito:u1');
      expect(redisClient.setEx).toHaveBeenCalledTimes(1);

      const [key, ttl, value] = redisClient.setEx.mock.calls[0];
      expect(key).toBe('carrito:u1');
      expect(Number.isInteger(ttl)).toBe(true);
      expect(ttl).toBeGreaterThan(0);
      expect(value).toBe(JSON.stringify(carrito));
    });
  });

  describe('eliminarArticulo', () => {
    test('elimina el artículo indicado, recalcula total y persiste el carrito actualizado', async () => {
      // Arrange
      redisClient.get.mockResolvedValueOnce(
        JSON.stringify({
          articulos: [
            { idProducto: 'p1', cantidad: 2, precio: 5 },
            { idProducto: 'p2', cantidad: 1, precio: 3 },
          ],
          total: 13,
        })
      );
      redisClient.setEx.mockResolvedValueOnce('OK');

      // Act
      const resultado = await carritoService.eliminarArticulo('u1', 'p1');

      // Assert
      expect(resultado).toEqual({
        articulos: [
          { idProducto: 'p2', cantidad: 1, precio: 3 },
        ],
        total: 3,
      });
      expect(resultado.articulos).not.toContainEqual({ idProducto: 'p1', cantidad: 2, precio: 5 });

      expect(redisClient.setEx).toHaveBeenCalledTimes(1);
      const [key, ttl, value] = redisClient.setEx.mock.calls[0];
      expect(key).toBe('carrito:u1');
      expect(Number.isInteger(ttl)).toBe(true);
      expect(ttl).toBeGreaterThan(0);
      expect(value).toBe(JSON.stringify(resultado));
    });
  });

  describe('vaciarCarrito', () => {
    test('llama redisClient.del con la clave del carrito y retorna el mensaje esperado', async () => {
      // Arrange
      redisClient.del.mockResolvedValueOnce(1);

      // Act
      const resultado = await carritoService.vaciarCarrito('u1');

      // Assert
      expect(redisClient.del).toHaveBeenCalledWith('carrito:u1');
      expect(resultado).toEqual({ mensaje: 'Carrito vaciado exitosamente' });
    });
  });
});
