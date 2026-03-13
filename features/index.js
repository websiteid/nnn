const fs = require('fs');
const path = require('path');

const features = {};

// 1. Memuat semua file di folder features secara otomatis
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
  
  // 2. Mendaftarkan command (misal: /start, /help)
  Object.entries(features).forEach(([name, feature]) => {
    if (feature.command) {
      const pattern = new RegExp(`^\\/${feature.command}(?:@\\w+)?$`);
      
      bot.onText(pattern, (msg) => {
        console.log(`Command /${feature.command} from ${msg.from.id}`);
        feature.execute(bot, msg);
      });
      
      console.log(`    ↳ /${feature.command} - ${feature.description}`);
    }
  });

  // 3. Menangani interaksi tombol (Callback Query)
  // 
  bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    // Logika navigasi berdasarkan data tombol
    if (data === 'menu_ratepap') {
      bot.sendMessage(chatId, '📝 Masukkan Token untuk memulai Rate PAP:');
    } else if (data === 'menu_kirimpap') {
      bot.sendMessage(chatId, '📤 Pilih mode: [Foto/Video]. Silakan upload media Anda.');
    } else if (data === 'menu_menfes') {
      bot.sendMessage(chatId, '💌 Mode Menfes diaktifkan. Silakan kirim pesan Anda.');
    }
    
    // Menghapus notifikasi loading di tombol agar tidak nyangkut
    bot.answerCallbackQuery(query.id);
  });

  // 4. Menangani pesan teks biasa dan command yang tidak dikenal
  bot.on('message', (msg) => {
    if (msg.text && msg.text.startsWith('/') && !msg.text.startsWith('/start')) {
      const cmd = msg.text.split(' ')[0].replace('/', '');
      const knownCommands = Object.values(features)
        .map(f => f.command)
        .filter(c => c);
      
      if (!knownCommands.includes(cmd)) {
        bot.sendMessage(
          msg.chat.id,
          `❌ Unknown command: /${cmd}\n\nKetik /start untuk membuka menu utama.`
        );
      }
    }
  });

  console.log(`Total commands: ${Object.keys(features).length}`);
}

module.exports = {
  ...features,
  register
};
