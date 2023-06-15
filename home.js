const express = require('express');
const router = express.Router();
const db = require('./db');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

// GET /home - Mendapatkan semua home
router.get('/home', (req, res) => {
  const query = 'SELECT * FROM tampilan_home';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Failed to fetch home' });
      return;
    }
    res.json(results);
  });
});

// GET /home/:id - Mendapatkan tampilan home berdasarkan ID
router.get('/home/:id', (req, res) => {
  const id = req.params.id;

  const query = `SELECT * FROM tampilan_home WHERE id = '${id}'`;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Failed to fetch home' });
      return;
    }

    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).json({ message: 'home not found' });
    }
  });
});


// POST /tips - Membuat tampilan home baru
router.post('/home', (req, res) => {
  const { id, gambar, place, city, rating } = req.body;
  const query = `INSERT INTO tampilan_home (id, gambar, place, city, rating) VALUES ('${id}', '${gambar}', '${place}', '${city}', '${rating}')`;
  db.query(query, [id, gambar, place, city, rating], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      res.status(500).json({ error: 'Failed to create home' });
      return;
    }
    res.json({ message: 'home created successfully' });
  });
});

//////////////////////////////////////////////////////////////////
// Konfigurasi penyimpanan file menggunakan Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Konfigurasi GCS
const storageGCS = new Storage({
  projectId: 'trave-guide-389313',
  keyFilename: 'F:\BANGKIT\home-backend\trave-guide-389313-ba79a2513d3c.json',
});

const bucketName = 'homeee';


// Endpoint untuk mengunggah gambar
router.post('/upload', upload.single('gambar'), async (req, res) => {
    const file = req.file;
  
    try {
      // Mengunggah file ke GCS
      const bucket = storageGCS.bucket(bucketName);
      const blob = bucket.file(file.originalname);
      const stream = blob.createWriteStream();
  
      stream.on('error', (err) => {
        console.error('Error uploading image to GCS: ', err);
        res.status(500).json({ message: 'Internal server error' });
      });
  
      stream.on('finish', () => {
        const imageUrl = `https://storage.googleapis.com/${bucketName}/${file.originalname}`;

        // Menyimpan informasi gambar ke database
        const query = `INSERT INTO tampilan_home (gambar) VALUES ('${imageUrl}')`;
        db.query(query, (err, result) => {
          if (err) {
            console.error('Error saving image to database: ', err);
            res.status(500).json({ message: 'Internal server error' });
          } else {
            res.status(200).json({ imageUrl });
          }
        });
      });
  
      stream.end(file.buffer);
    } catch (err) {
      console.error('Error uploading image: ', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Endpoint untuk menampilkan gambar
  router.get('/home/images/:id', (req, res) => {
    const id = req.params.id;
  
    // Mengambil URL gambar dari database
    const query = `SELECT gambar FROM tampilan_home WHERE id = '${id}'`;
    db.query(query, [id], (err, result) => {
      if (err) {
        console.error('Error fetching image from database: ', err);
        res.status(500).json({ message: 'Internal server error' });
      } else {
        if (result.length > 0) {
          const imageUrl = result[0].gambar;
  
          // Mengirimkan URL gambar sebagai respons
          res.status(200).json({ imageUrl });
        } else {
          res.status(404).json({ message: 'Image not found' });
        }
      }
    });
  });


module.exports = router;