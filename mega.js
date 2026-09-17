const { Storage } = require('megajs');
const fs = require('fs-extra');
const path = require('path');

const MEGA_EMAIL = process.env.MEGA_EMAIL;
const MEGA_PASSWORD = process.env.MEGA_PASSWORD;
const SESSION_PREFIX = process.env.SESSION_PREFIX || 'KING-XD-V6~';

async function uploadSession(sessionId, folder) {
  if (!MEGA_EMAIL || !MEGA_PASSWORD) return null;
  try {
    const storage = await new Storage({ email: MEGA_EMAIL, password: MEGA_PASSWORD, autologin: true }).ready;
    const files = fs.readdirSync(folder);
    await Promise.all(files.map(file =>
      storage.upload({
        name: `${SESSION_PREFIX}${sessionId}~${file}`,
        data: fs.createReadStream(path.join(folder, file))
      }).complete
    ));
    return `${SESSION_PREFIX}${sessionId}`;
  } catch (e) { console.error('MEGA upload error:', e.message); return null; }
}

async function downloadSession(sessionId, targetFolder) {
  if (!MEGA_EMAIL || !MEGA_PASSWORD) return false;
  try {
    const storage = await new Storage({ email: MEGA_EMAIL, password: MEGA_PASSWORD, autologin: true }).ready;
    const files = Object.values(storage.files).filter(f => f.name.startsWith(`${SESSION_PREFIX}${sessionId}~`));
    if (!files.length) return false;
    fs.ensureDirSync(targetFolder);
    for (const file of files) {
      const name = file.name.replace(`${SESSION_PREFIX}${sessionId}~`, '');
      await file.download(undefined, path.join(targetFolder, name));
    }
    return true;
  } catch (e) { console.error('MEGA download error:', e.message); return false; }
}

module.exports = { uploadSession, downloadSession };
