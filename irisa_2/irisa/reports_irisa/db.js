import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // CAMBIO CLAVE: TiDB usa el 4000. Forzamos a que use el del .env 
    // y si no existe, que falle o use el 4000, no el 3306.
    port: parseInt(process.env.DB_PORT) || 4000, 
    waitForConnections: true,
    connectionLimit: 20,
    // TiDB Cloud EXIGE TLS/SSL igual que Aiven, esto queda melo:
    ssl: { 
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2' 
    }
});

// Prueba de conexion inicial para ver en los logs de Render si corono
pool.getConnection()
    .then(conn => {
        console.log("✅ Conectado a TiDB Cloud con exito, mano.");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Error conectando a la base de datos:", err.message);
    });

export default pool;