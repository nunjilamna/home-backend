// Import modul mysql
const mysql = require('mysql');

// Buat koneksi ke database MySQL
const connection = mysql.createConnection({
  host: '34.101.132.147',    
  user: 'travetips',          
  password: 'travetips',  
  database: 'home'   
});

// Terhubung ke database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Export objek koneksi
module.exports = connection;
