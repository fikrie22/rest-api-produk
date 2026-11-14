const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// Konfigurasi koneksi PostgreSQL lokal
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'db_produk',
    password: '123456', // Kosongkan jika belum diatur passwordnya
    port: 5432,
});

// 1. GET: Ambil semua data produk dari database
app.get('/api/products', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal mengambil data dari database' });
    }
});

// 2. POST: Tambah produk baru ke database
app.post('/api/products', async (req, res) => {
    const { name, price, stock } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Nama dan harga produk wajib diisi!' });
    }

    try {
        const query = 'INSERT INTO products (name, price, stock) VALUES ($1, $2, $3) RETURNING *';
        const values = [name, Number(price), Number(stock) || 0];
        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: 'Produk berhasil ditambahkan ke database',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menyimpan produk' });
    }
});

// 3. PUT: Update data produk berdasarkan ID
app.put('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, stock } = req.body;

    try {
        const query = `
            UPDATE products 
            SET name = COALESCE($1, name), 
                price = COALESCE($2, price), 
                stock = COALESCE($3, stock) 
            WHERE id = $4 RETURNING *
        `;
        const values = [name || null, price ? Number(price) : null, stock !== undefined ? Number(stock) : null, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        res.json({
            success: true,
            message: 'Produk berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui produk' });
    }
});

// 4. DELETE: Hapus produk berdasarkan ID
app.delete('/api/products/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
        }

        res.json({
            success: true,
            message: 'Produk berhasil dihapus',
            data: result.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Gagal menghapus produk' });
    }
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server REST API (PostgreSQL) berjalan di http://localhost:${PORT}`);
});