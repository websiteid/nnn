const config = require('../config');
const fs = require('fs');

// Simulasi database sederhana
let papDatabase = {}; 

module.exports = {
  command: 'kirimpap',
  description: 'Kirim PAP untuk mendapatkan token rating',
  execute: (bot, msg) => {
    bot.sendMessage(msg.chat.id, '📤 **Kirim PAP**\n\nSilakan kirim **Foto** atau **Video** untuk di-rate.');

    bot.once('message', (pesan) => {
      const media = pesan.photo ? pesan.photo[pesan.photo.length - 1].file_id : (pesan.video ? pesan.video.file_id : null);
      const type = pesan.photo ? 'photo' : (pesan.video ? 'video' : null);

      if (!media) return bot.sendMessage(msg.chat.id, '❌ Hanya mendukung Foto atau Video!');

      // Generate Token unik (misal: 6 angka acak)
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Simpan ke database
      papDatabase[token] = { media, type, sender: pesan.from.id };

      // Kirim ke Channel dengan Token
      const caption = `📸 **PAP Baru!**\n\nGunakan token ini untuk merate: \`${token}\``;
      if (type === 'photo') bot.sendPhoto(config.CHANNEL_ID, media, { caption, parse_mode: 'Markdown' });
      else bot.sendVideo(config.CHANNEL_ID, media, { caption, parse_mode: 'Markdown' });

      bot.sendMessage(msg.chat.id, `✅ Berhasil! Token kamu adalah: \`${token}\`\n\nBagikan token ini agar orang lain bisa merate PAP kamu.`, { parse_mode: 'Markdown' });
    });
  }
};
