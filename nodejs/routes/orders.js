const express= require('express');
const router=express.Router();
const {database}= require('../config/helpers');

router.get('/',(req,res) => {
    database.table('ordenes_detalles as od')
        .join([
            {
                table:'ordenes as o',
                on:'o.order_id= od.order_id'
            },
            {
                table: 'articulos as a',
                on: 'a.id_producto= od.articulo_id'
            },
            {
                table:'user as u',
                on:'u.user_id=o.id_comprador'
            }
        ])
        .withFields(['o.order_id','a.nombre_producto as nombre','a.descripcion','a.precio','u.user_id'])
        .sort({order_id: 1})
        .getAll()
        .then(ordenes => {
            if(ordenes.length >0 ){
                res.status(200).json(ordenes);
            }  else {
                res.json({message:'Orden no encontrada'});
            }
        }).catch(err => console.log(err));
});

router.post('/new',(req,res) =>{

    let {userId,articulos}=req.body;
    if(userId != null && userId > 0 && !isNaN(userId)){
        database.table('ordenes')
            .insert({
                id_comprador:userId
            }).then(newOrderId => {
            
            if (newOrderId >0){
                articulos.forEach(async(a)=> {
                    let data= await database.table('articulos').filter({id_producto:a.id_producto}).withFields(['cantidad']).get();
                    
                    let inCart= a.incart;

                    if(data.cantidad > 0){
                        data.cantidad=data.cantidad - inCart;
                        if(data.cantidad < 0){
                            data.cantidad=0;
                        }
                    } else{
                        data.cantidad=0;
                    }

                    database.table('ordenes_detalles')
                        .insert({
                            order_id:newOrderId,
                            articulo_id:a.id_producto,
                            cantidad:inCart
                        }).then(newId =>{
                        database.table('articulos')
                            .filter({id_producto:a.id_producto})
                            .update({
                                cantidad:data.cantidad
                            }).then(successNum => {

                            }).catch(err=> console.log(err));
                        }).catch(err=> console.log(err));


                });
            }else{
                res.json({message:'Fallo en la nueva orden mientras se añadia detalles de la orden',success: false})
            }    
            res.json({
                message:`orden añadida exitosamente con la id ${newOrderId}`,
                success:true,
                order_id:newOrderId,
                articulos:articulos 
            });
            }).catch(err => console.log(err));
    }
    else{
        res.json({message:'Fallo en la nueva orden  ',success:false});
    }
    
});

router.post('/payment',(req,res)=>{
    setTimeout(()=>{
        res.status(200).json({success:true});
    },3000);
});

module.exports=router;