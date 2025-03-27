const express= require('express');
const path =require('path')
const cookieParser=require('cookie-parser');
const logger=require('morgan');
const cors=require('cors');
const createError = require('http-errors');


const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: "*",
  methods:['GET','POST','PATCH','DELETE','PUT'],
  allowedHeaders: 'Content-Type, Authorization, Origin, X-Request-With, Accept'
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const productsRoute = require('./routes/articulos');
const usersRoute = require('./routes/users');
const ordersRoute= require('./routes/orders');

app.use('/api/articulos',productsRoute);
app.use('/api/users',usersRoute);
app.use('/api/ordenes',ordersRoute);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',{
    title: 'Error'
  });
});

module.exports = app;
