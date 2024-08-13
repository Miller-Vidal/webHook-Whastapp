// Importar el módulo MySQL
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';


dotenv.config();

// Configurar la conexión a la base de datos
const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Función para comprobar la conexión a la base de datos
const testConnection = async () => {
  try {
    const [rows] = await connection.query('SELECT 1');
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    process.exit(1); // Detener el proceso si no se puede conectar
  }
};

export { connection, testConnection };
