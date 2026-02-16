// db.js
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',      
    password: 'tu_password',
    database: 'ingenio_risaralda',
    waitForConnections: true,
    connectionLimit: 10,
    port: 3306
});

export default pool; // Usamos export default en lugar de module.exports