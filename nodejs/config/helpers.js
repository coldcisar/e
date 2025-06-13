const MySqli = require('mysqli');
const bcrypt = require('bcrypt');


const HASH_SECRET = 'esta-es-una-clave-muy-secreta-y-larga-para-proteger-mis-tokens';

// Configuración de la conexión a la base de datos (ajústala con tus datos)
let conn = new MySqli({
    host: 'localhost',
    post: 3306,
    user: 'root',
    passwd: '123456',
    db: 'tienda'
});

let db = conn.emit(false, '');

// Middleware para verificar si los campos de email y contraseña existen
const hasAuthFields = (req, res, next) => {
    let { email, password } = req.body;

    if (email && password) {
        next();
    } else {
        res.status(400).json({ message: 'Email and password fields are required.' });
    }
};


const isPasswordAndUserMatch = async (req, res, next) => {
    let { email, password } = req.body;
    try {
        const user = await db.table('user').filter({ email: email }).get();
        if (user) {
            const match = await bcrypt.compare(password, user.password);
            if (match) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ message: 'Incorrect password.' });
            }
        } else {
            res.status(401).json({ message: 'User not found.' });
        }
    } catch (err) {
        res.status(500).json({ message: 'Error accessing the database.', error: err });
    }
};


module.exports = {
    database: db,
    hasAuthFields: hasAuthFields,
    isPasswordAndUserMatch: isPasswordAndUserMatch,
    secret: HASH_SECRET 
};