require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const pairingRouter = require('./pair');
const qrRouter = require('./qr');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.use('/pair', pairingRouter);
app.use('/qr', qrRouter);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'main.html')));
app.get('/pair', (req, res) => res.sendFile(path.join(__dirname, 'pair.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'qr.html')));
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'KING XD V6 PAIRING' }));

app.listen(PORT, () => console.log(`👑 KING XD V6 PAIRING running on port ${PORT}`));
