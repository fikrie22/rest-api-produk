const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Dummy Database (Data sementara di memori)
let products = [
    { id: 1, name: 'Laptop ThinkPad X230', price: 2500000, stock: 5 },
    { id: 2, name: 'Mouse Wireless Logitech', price: 150000, stock: 20 }
];

// 1. GET: Ambil semua data produk
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        count: products.length,
        data: products
    });
});

// 2. POST: Tambah produk baru
app.post('/api/products', (req, res) => {
    const { name, price, stock } = req.body;
    
    if (!name || !price) {
        return res.status(400).json({ success: false, message: 'Nama dan harga produk wajib diisi!' });
    }

    const newProduct = {
        id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
        name,
        price: Number(price),
        stock: Number(stock) || 0
    };

    products.push(newProduct);
    res.status(201).json({
        success: true,
        message: 'Produk berhasil ditambahkan',
        data: newProduct
    });
});

// 3. DELETE: Hapus produk berdasarkan ID
app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    const deletedProduct = products.splice(index, 1);
    res.json({
        success: true,
        message: 'Produk berhasil dihapus',
        data: deletedProduct[0]
    });
});

// 4. PUT: Update data produk berdasarkan ID
app.put('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, price, stock } = req.body;
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }

    // Perbarui data produk
    products[index] = {
        id: id,
        name: name !== undefined ? name : products[index].name,
        price: price !== undefined ? Number(price) : products[index].price,
        stock: stock !== undefined ? Number(stock) : products[index].stock
    };

    res.json({
        success: true,
        message: 'Produk berhasil diperbarui',
        data: products[index]
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server REST API berjalan di http://localhost:${PORT}`);
});