const express = require('express');
const router = express.Router();
const {database}= require('../config/helpers');
/* GET home page. */
router.get('/', function(req, res) {
  let page=(req.query.page != undefined && req.query.page != 0) ? req.query.page :1;
  const limit=(req.query.limit != undefined && req.query.limit !=0) ? req.query.limit :10;
  
  let startValue;
  let endValue;

  if(page >0){
    startValue=(page* limit)- limit;
    endValue=page*limit; 
  } else {
    startValue=0;
    endValue= 10;
  }

  database.table('articulos as a')
        .join([{
          table:'categorias as c',
          on: 'c.id_categoria= a.tipo_producto'
        }])
        .withFields(['c.nombre_categoria as categoria',
          'a.id_producto',
          'a.tipo_producto as categoria',
          'a.nombre_producto',
          'a.descripcion',
          'a.imagen',
          'a.precio',
          
        ])
        .slice(startValue,endValue)
        .sort({id_producto: .1})
        .getAll()
        .then(arts => {
              if (arts.length >0){
                  res.status(200).json({
                      count:arts.length,
                      articulos:arts
                  });
              } else {
                  res.json({message: 'No product founds'})
              }
        }).catch(err => console.log(err));


   
});
router.get('/:artiId',(req,res) => {
   let articuloId = req.params.artiId;
   console.log(articuloId);
  
  database.table('articulos as a')
        .join([{
          table:'categorias as c',
          on: 'c.id_categoria= a.tipo_producto'
        }])
        .withFields(['c.nombre_categoria as categoria',
          'a.id_producto',
          'a.tipo_producto as categoria',
          'a.nombre_producto',
          'a.descripcion',
          'a.imagen',
          'a.precio',
          
        ])
        .filter({'a.id_producto':articuloId})
        .get()
        .then(art => {
              if (art){
                  res.status(200).json(art);
              } else {
                  res.json({message: `Articulo no encontrado con esa articuloID ${articuloId}`});
              }
        }).catch(err => console.log(err));
                 
});

router.get('/categoria/:nombreCat',(req,res) =>{
    let page=(req.query.page != undefined && req.query.page != 0) ? req.query.page :1;
    const limit=(req.query.limit != undefined && req.query.limit !=0) ? req.query.limit :10;
  
    let startValue;
    let endValue;

    if(page >0){
      startValue=(page* limit)- limit;
      endValue=page*limit; 
    } else {
      startValue=0;
      endValue= 10;
    }
    const cat_nombre=req.params.nombreCat

    database.table('articulos as a')
          .join([{
            table:'categorias as c',
            on: `c.id_categoria= a.tipo_producto WHERE c.nombre_categoria LIKE '%${cat_nombre}%'` 
          }])
          .withFields(['c.nombre_categoria as categoria',
            'a.id_producto',
          'a.tipo_producto as categoria',
          'a.nombre_producto',
          'a.imagen',
          'a.precio',
          
        ])
        .slice(startValue,endValue)
        .sort({id_producto: .1})
        .getAll()
        .then(arts => {
              if (arts.length >0){
                  res.status(200).json({
                      count:arts.length,
                      articulos:arts
                  });
              } else {
                  res.json({message: `Articulo no encontrado en la categoria ${cat_nombre}`  })
              }
        }).catch(err => console.log(err));
  });

   
module.exports = router;
