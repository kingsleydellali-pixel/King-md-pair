const express = require('express');
const router = express.Router();
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs-extra');
const path = require('path');
const QRCode = require('qrcode');
const { makeid } = require('./gen-id');
const { uploadSession } = require('./mega');

router.get('/generate', async (req, res) => {
  const sessionId = makeid(8);
  const sessionDir = path.join(__dirname, 'temp', sessionId);
  fs.ensureDirSync(sessionDir);

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' })
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ qr, connection }) => {
      if (qr) {
        const qrDataUrl = await QRCode.toDataURL(qr);
        res.json({ success: true, qr: qrDataUrl, sessionId });
      }
      if (connection === 'open') {
        const megaId = await uploadSession(sessionId, sessionDir);
        if (megaId) {
          await sock.sendMessage(sock.user.id, {
            text: `👑 *KING XD V6 PAIRING*\n\n✅ Successfully linked via QR!\n📦 *Session ID:* ${megaId}`
          });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
