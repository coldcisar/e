const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

// --- Rutas ---
const authRoutes = require('./routes/auth');
const productsRoute = require('./routes/articulos');
const usersRoute = require('./routes/users');
const ordersRoute = require('./routes/orders');

const app = express();

// --- Configuración de Middlewares ---

// 1. CORS: Debe ser el primero para manejar la seguridad del navegador.
app.use(cors());

// 2. Logger y Parsers
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 3. Servir archivos estáticos (imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));


// --- Configuración de Rutas de la API ---
app.use('/api/auth', authRoutes);
app.use('/api/articulos', productsRoute);
app.use('/api/users', usersRoute);
app.use('/api/ordenes', ordersRoute);


// --- Manejo de Errores (Debe ir después de las rutas) ---

// Captura 404 y lo envía al manejador de errores
app.use(function(req, res, next) {
  next(createError(404));
});

// Manejador de errores principal
app.use(function(err, req, res, next) {
  // Solo muestra el error detallado en desarrollo
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderiza una página de error (si tienes una)
  res.status(err.status || 500);
  res.send('Error: ' + err.message); // Enviamos un mensaje de error simple
});


// --- Iniciar el Servidor (Debe ir al final de todo) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo y escuchando en el puerto ${PORT}`);
});