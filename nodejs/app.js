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

// 1. CORS: seguridad del navegador.
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



app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send('Error: ' + err.message); 
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo y escuchando en el puerto ${PORT}`);
});