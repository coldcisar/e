const Mysqli = require('mysqli')

let conn=new Mysqli({
    host: 'localhost',
    post:3306,
    user:'root',
    passwd:'123456',
    db: 'tienda'

});

let db = conn.emit(false,'');

module.exports={
    database: db
};