const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers');

/* OBTENER TODOS LOS ARTÍCULOS (CON PAGINACIÓN) */
router.get('/', function (req, res) {
    let page = (req.query.page !== undefined && req.query.page !== 0) ? req.query.page : 1;
    const limit = (req.query.limit !== undefined && req.query.limit !== 0) ? req.query.limit : 10;

    let startValue;
    let endValue;

    if (page > 0) {
        startValue = (page * limit) - limit; // 0, 10, 20, ...
        endValue = limit; // El segundo parámetro de slice es la cantidad, no el índice final
    } else {
        startValue = 0;
        endValue = 10;
    }

    database.table('articulos as a')
        .join([{
            table: 'categorias as c',
            on: 'c.id_categoria = a.tipo_producto'
        }])
        .withFields(['c.nombre_categoria as categoria',
            'a.id_producto',
            'a.nombre_producto',
            'a.descripcion',
            'a.imagen',
            'a.precio',
            'a.cantidad'
        ])
        .slice(startValue, endValue)
        .sort({ id_producto: 1 }) 
        .getAll()
        .then(arts => {
            if (arts.length > 0) {
                // Contamos el total de artículos para la paginación
                database.table('articulos').count().then(totalCount => {
                    res.status(200).json({
                        count: totalCount, // El total de artículos, no solo los de la página actual
                        articulos: arts
                    });
                }).catch(err => console.log(err));
            } else {
                res.json({ message: 'No se encontraron productos' });
            }
        }).catch(err => console.log(err));
});

router.get('/search/:query', (req, res) => {
    // Obtenemos el término de búsqueda de los parámetros de la URL
    const searchTerm = req.params.query;

    database.table('articulos as a')
        .join([{
            table: 'categorias as c',
            on: 'c.id_categoria = a.tipo_producto'
        }])
        .withFields(['c.nombre_categoria as categoria',
            'a.id_producto',
            'a.nombre_producto',
            'a.descripcion',
            'a.imagen',
            'a.precio',
            'a.cantidad'
        ])
        .filter({
            // Buscamos coincidencias parciales en el nombre Y en la descripción
            $or: [
                { nombre_producto: { $like: `%${searchTerm}%` } },
                { descripcion: { $like: `%${searchTerm}%` } }
            ]
        })
        .getAll()
        .then(arts => {
            if (arts.length > 0) {
                res.status(200).json(arts);
            } else {
                // Es mejor devolver un array vacío que un mensaje de error
                res.json([]); 
            }
        }).catch(err => res.status(500).json(err));
});
router.get('/:id', (req, res) => {
    let articuloId = req.params.id; // Obtenemos el ID de la URL

    database.table('articulos as a')
        .join([{
            table: 'categorias as c',
            on: 'c.id_categoria = a.tipo_producto'
        }])
        .withFields(['c.nombre_categoria as categoria',
            'a.id_producto',
            'a.nombre_producto',
            'a.descripcion',
            'a.imagen',
            'a.precio',
            'a.cantidad'
        ])
        .filter({ 'a.id_producto': articuloId })
        .get()
        .then(art => {
            if (art) {
                res.status(200).json(art);
            } else {
                res.status(404).json({ message: `Articulo no encontrado con ID ${articuloId}` });
            }
        }).catch(err => res.status(500).json(err));
});

//* OBTENER ARTÍCULOS POR CATEGORÍA (MEJORADO) */
router.get('/categoria/:catName', (req, res) => {
    const { catName } = req.params;
    const { exclude } = req.query; // Obtenemos el ID a excluir de los parámetros de consulta (ej: ?exclude=1)
    const limit = 4; // Mostraremos un máximo de 4 productos relacionados

    database.table('articulos as a')
        .join([{ table: 'categorias as c', on: 'c.id_categoria = a.tipo_producto' }])
        .withFields(['c.nombre_categoria as categoria', 'a.id_producto', 'a.nombre_producto', 'a.descripcion', 'a.imagen', 'a.precio', 'a.cantidad'])
        .filter({ 'c.nombre_categoria': catName }) // Forma correcta y segura de filtrar
        .getAll()
        .then(prods => {
            if (prods.length > 0) {
                // Si se proporcionó un ID para excluir, filtramos ese producto del array
                const finalProducts = exclude ? prods.filter(p => p.id_producto.toString() !== exclude) : prods;
                
                // Devolvemos solo la cantidad definida por 'limit'
                res.status(200).json(finalProducts.slice(0, limit));
            } else {
                res.json([]); // Si no hay productos, devolvemos un array vacío
            }
        }).catch(err => res.status(500).json(err));
});


module.exports = router;