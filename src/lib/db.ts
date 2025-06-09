import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '192.168.0.19',
  port: 3306,
  user: 'min',
  password: 'f8tgw3lshms!',
  database: 'wedding_invitation',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool; 