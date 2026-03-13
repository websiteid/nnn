const fs = require('fs');
const path = require('path');
const config = require('../config');

// Inisialisasi Database & State Global (Data hilang saat bot restart)
global.papDatabase = global.papDatabase || {};
global.userState = global.userState || {};

const features = {};

// 1. Load semua fitur dari folder
const files = fs.readdirSync(__dirname)
  .filter(file => file.endsWith('.js') && file !== 'index.js');

files.forEach(file => {
  const featureName = path.basename(file, '.js');
  try {
    features[featureName] = require(`./${file}`);
    console.log(`Loaded feature: ${featureName}`);
  } catch (error) {
    console.error(`Error loading ${file}:`, error.message);
  }
});

function register(bot) {
  console.log('🔧 Registering commands...');

  // 2. Registrasi Command
  Object.entries(features).forEach(([name, feature]) => {
    if (feature.command) {
      const pattern = new RegExp(`^\\/${feature.command}(?:@\\w+)?$`);
      bot.onText(pattern, (msg) => {
        feature.execute(bot, msg);
      });
      console.log(`    ↳ /${feature.command} - ${feature.description}`);
    }
  });

  // 3. Centralized Message Handler
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // A. Logika Kirim PAP (Jika user sedang dalam mode menunggu media)
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

    // B. Logika Command tidak dikenal
    if (msg.text && msg.text.startsWith('/') && !msg.text.startsWith('/start')) {
      const cmd = msg.text.split(' ')[0].replace('/', '');
      const knownCommands = Object.values(features).map(f => f.command).filter(c => c);
      if (!knownCommands.includes(cmd)) {
        bot.sendMessage(chatId, `❌ Unknown: /${cmd}\nKetik /start.`);
      }
    }
  });

  // 4. Handle Callback Query (Tombol Menu)
  bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    // Handle PAP Mode Selection
    if (data === 'mode_publik' || data === 'mode_privat') {
      const mode = data === 'mode_publik' ? 'Publik' : 'Privat';
      global.userState[chatId] = mode;
      bot.editMessageText(`✅ Mode **${mode}** dipilih. Silakan kirim foto/video PAP kamu:`, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown'
      });
    } 
    // Handle Menu Utama
    else if (features[data.replace('menu_', '')]) {
      features[data.replace('menu_', '')].execute(bot, query.message);
    }
    
    bot.answerCallbackQuery(query.id);
  });
}

module.exports = { ...features, register };
