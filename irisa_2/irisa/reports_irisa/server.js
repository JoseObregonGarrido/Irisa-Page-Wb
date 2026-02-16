import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js'; // <--- Importamos nuestra conexion limpia

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Usamos la conexión importada
        const [rows] = await db.query(
            'SELECT * FROM usuarios WHERE username = ? AND password = ?',
            [username, password]
        );

        if (rows.length > 0) {
            res.json({
                token: 'token_seguro_irisaralda_2026',
                username: rows[0].username
            });
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error en DB:', error);
        res.status(500).json({ error: 'Error conectando a la base de datos' });
    }
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`  Servidor corriendo en http://localhost:${PORT}`);
});