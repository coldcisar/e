const express = require('express');
const router = express.Router();
const { database } = require('../config/helpers');

// OBTENER TODAS LAS ÓRDENES
router.get('/', (req, res) => {
    database.table('ordenes_detalles as od')
        .join([
            { table: 'ordenes as o', on: 'o.order_id = od.order_id' },
            { table: 'articulos as a', on: 'a.id_producto = od.articulo_id' },
            { table: 'user as u', on: 'u.user_id = o.id_comprador' }
        ])
        .withFields(['o.order_id', 'a.nombre_producto as nombre', 'a.descripcion', 'a.precio', 'u.user_id'])
        .sort({ order_id: 1 })
        .getAll()
        .then(ordenes => {
            if (ordenes.length > 0) {
                res.status(200).json(ordenes);
            } else {
                res.json({ message: 'No se encontraron órdenes' });
            }
        }).catch(err => res.json(err));
});

// OBTENER UNA SOLA ORDEN
router.get('/:id', async (req, res) => {
    let order_id = req.params.id;
    database.table('ordenes_detalles as od')
        .join([
            { table: 'ordenes as o', on: 'o.order_id = od.order_id' },
            { table: 'articulos as a', on: 'a.id_producto = od.articulo_id' },
            { table: 'user as u', on: 'u.user_id = o.id_comprador' }
        ])
        .withFields(['o.order_id', 'a.nombre_producto', 'a.descripcion', 'a.precio', 'a.imagen', 'od.cantidad as cantidadOrdenada'])
        .filter({ 'o.order_id': order_id })
        .getAll()
        .then(ordenes => {
            if (ordenes.length > 0) {
                res.json(ordenes);
            } else {
                res.json({ message: "No se encontraron órdenes" });
            }
        }).catch(err => res.json(err));
});

// CREAR UNA NUEVA ORDEN
router.post('/nuevo', async (req, res) => {
    let { userId, articulos } = req.body;

    if (userId != null && userId > 0 && !isNaN(userId)) {
        try {
            const newOrderData = await database.table('ordenes').insert({
                id_comprador: userId
            });

            // --- PRIMERA CORRECCIÓN: Acceder a la propiedad 'insertId' ---
            if (newOrderData.insertId > 0) {
                const newOrderId = newOrderData.insertId;

                const promises = articulos.map(async (a) => {
                    const productoActual = await database.table('articulos').filter({ id_producto: a.id_producto }).withFields(['cantidad']).get();

                    if (!productoActual) {
                        throw new Error(`El producto con ID ${a.id_producto} no fue encontrado en la base de datos.`);
                    }

                    let nuevaCantidad = productoActual.cantidad - a.incart;
                    if (nuevaCantidad < 0) {
                        nuevaCantidad = 0;
                    }

                    // --- SEGUNDA CORRECCIÓN: Usar la variable correcta del ID ---
                    await database.table('ordenes_detalles').insert({
                        order_id: newOrderId,
                        articulo_id: a.id_producto,
                        cantidad: a.incart
                    });

                    await database.table('articulos').filter({ id_producto: a.id_producto }).update({
                        cantidad: nuevaCantidad
                    });
                });

                await Promise.all(promises);

                return res.json({
                    message: `Orden añadida exitosamente con la id ${newOrderId}`,
                    success: true,
                    order_id: newOrderId,
                    articulos: articulos
                });

            } else {
                return res.status(400).json({ message: 'No se pudo crear la orden en la base de datos.', success: false });
            }
        } catch (err) {
            console.error("ERROR DETALLADO DENTRO DEL CATCH:", err);
            return res.status(500).json({
                message: "Error al procesar los detalles de la orden.",
                error: err.message,
                success: false
            });
        }
    } else {
        return res.status(400).json({ message: `ID de usuario inválido. Se recibió: ${userId}`, success: false });
    }
});

// SIMULACIÓN DE PAGO
router.post('/pago', (req, res) => {
    setTimeout(() => {
        res.status(200).json({ success: true });
    }, 3000);
});

module.exports = router;