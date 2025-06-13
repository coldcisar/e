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
        // --- CORRECCIÓN 1: El valor para ordenar debe ser 1 (asc) o -1 (desc) ---
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

/* OBTENER UN SOLO ARTÍCULO POR SU ID */
// --- CORRECCIÓN 2: Cambiamos el nombre del parámetro a ':id' para que coincida con el frontend ---
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

/* OBTENER ARTÍCULOS POR CATEGORÍA */
router.get('/categoria/:nombreCat', (req, res) => {
    // ... tu código para esta ruta parece tener una inyección SQL en el JOIN,
    // pero lo dejaremos así por ahora para enfocarnos en el problema principal.
    const cat_nombre = req.params.nombreCat;
    database.table('articulos as a')
        .join([{
            table: 'categorias as c',
            on: 'c.id_categoria = a.tipo_producto'
        }])
        .filter({'c.nombre_categoria': { $like: `%${cat_nombre}%` }}) // Forma más segura de filtrar
        .getAll()
        .then(arts => {
            if (arts.length > 0) {
                res.status(200).json({
                    count: arts.length,
                    articulos: arts
                });
            } else {
                res.json({ message: `No se encontraron artículos en la categoría ${cat_nombre}` })
            }
        }).catch(err => console.log(err));
});


module.exports = router;