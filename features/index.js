const fs = require('fs');
const path = require('path');
const config = require('../config');

// Inisialisasi Database & State Global
global.papDatabase = global.papDatabase || {};
global.userState = global.userState || {};

const features = {};

// Load semua file fitur secara otomatis
const files = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

files.forEach(file => {
  const featureName = path.basename(file, '.js');
  features[featureName] = require(`./${file}`);
});

function register(bot) {
  console.log('🔧 Registering commands & handlers...');

  // 1. Registrasi Command
  Object.entries(features).forEach(([name, feature]) => {
    if (feature.command) {
      const pattern = new RegExp(`^\\/${feature.command}(?:@\\w+)?$`);
      bot.onText(pattern, (msg) => feature.execute(bot, msg));
    }
  });

  // 2. Handler Pesan Global (Menangkap PAP)
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (global.userState[chatId] && (msg.photo || msg.video)) {
      const media = msg.photo ? msg.photo[msg.photo.length - 1].file_id : msg.video.file_id;
      const type = msg.photo ? 'photo' : 'video';
      const mode = global.userState[chatId];
      const token = Math.floor(100000 + Math.random() * 900000).toString();

      global.papDatabase[token] = { media, type, mode, sender: msg.from.username || 'Anonim' };

      const channelText = `📸 **NEW PAP**\n\nMode: ${mode}\nToken: \`${token}\`\n\nKirim /ratepap di bot dan masukkan token di atas untuk melihat media!`;
      
      bot.sendMessage(config.CHANNEL_ID, channelText, { parse_mode: 'Markdown' });
      bot.sendMessage(chatId, `✅ Berhasil! Token kamu: \`${token}\``, { parse_mode: 'Markdown' });

      delete global.userState[chatId];
      return;
    }
  });

  // 3. Handler Callback Button
  bot.on('callback_query', (query) => {
    const data = query.data;
    const msg = query.message;
    const chatId = msg.chat.id;

    if (data === 'mode_publik' || data === 'mode_privat') {
      const mode = data === 'mode_publik' ? 'Publik' : 'Privat';
      global.userState[chatId] = mode;
      bot.editMessageText(`✅ Mode **${mode}** dipilih.\n\nSekarang kirim foto/video PAP kamu:`, {
        chat_id: chatId,
        message_id: msg.message_id,
        parse_mode: 'Markdown'
      });
    } else if (features[data.replace('menu_', '')]) {
      features[data.replace('menu_', '')].execute(bot, msg);
    }
    bot.answerCallbackQuery(query.id);
  });
}

module.exports = { ...features, register };
