const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const features = require('../features');

const app = express();
const bot = new TelegramBot(config.BOT_TOKEN, { polling: false });

// Inisialisasi Database Global
global.papDatabase = global.papDatabase || {};
global.userState = global.userState || {};
features.register(bot);

// ==========================================
// ⚡ CALLBACK QUERY HANDLER (UNTUK RATING)
// ==========================================
bot.on('callback_query', async (query) => {
  const dataParts = query.data.split('_'); // Format: rate_TOKEN_EMOJI
  
  if (dataParts[0] === 'rate') {
    const token = dataParts[1];
    const emojiType = dataParts[2];
    const papData = global.papDatabase[token];

    if (!papData) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Token sudah kedaluwarsa." });
    }

    const emojiMap = { hot: '🔥', star: '⭐', love: '❤️', funny: '🤣', cool: '👍' };
    const selectedEmoji = emojiMap[emojiType];
    const raterName = query.from.username ? `@${query.from.username}` : query.from.first_name;

    try {
      // 1. Kirim Notifikasi ke Pemilik PAP (senderId)
      await bot.sendMessage(papData.senderId, 
        `✨ **Seseorang memberikan reaksi!**\n\n` +
        `Token: \`${token}\` memberikan reaksi: ${selectedEmoji}\n` +
        `Oleh: ${raterName} (ID: ${query.from.id})`,
        { parse_mode: 'Markdown' }
      );

      // 2. Beri respon ke pemberi rating (popup di Telegram)
      await bot.answerCallbackQuery(query.id, { text: `Berhasil memberikan ${selectedEmoji}!` });

      // 3. Ubah pesan agar tombol hilang (opsional, agar tidak diklik berkali-kali)
      await bot.editMessageCaption(`✅ Kamu telah memberikan reaksi ${selectedEmoji}`, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      });

    } catch (err) {
      console.error("Gagal mengirim notifikasi rating:", err);
      bot.answerCallbackQuery(query.id, { text: "⚠️ Gagal mengirim notifikasi ke pemilik." });
    }
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/bot', async (req, res) => {
  try {
    await bot.processUpdate(req.body);
    res.status(200).send('OK');
  } catch (error) {
    res.status(200).send('OK');
  }
});

app.get('/set-webhook', async (req, res) => {
  try {
    const vercelUrl = 'https://nnn-tau-jet.vercel.app';
    const webhookUrl = `${vercelUrl}/api/bot`;
    await bot.deleteWebHook();
    await bot.setWebHook(webhookUrl);
    res.send(`<!DOCTYPE html><html><body><h1>Webhook Set!</h1></body></html>`);
  } catch (error) {
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Bot Operational</h1>');
});

module.exports = app;
