module.exports = {
  command: 'ratepap',
  description: 'Melihat & Rate PAP pakai Token',
  execute: (bot, msg) => {
    const chatId = msg.chat.id;

    bot.sendMessage(chatId, '⭐ **Masukkan Token PAP** untuk melihat & memberi rating:');

    bot.once('message', (pesan) => {
      const token = pesan.text;
      const data = global.papDatabase ? global.papDatabase[token] : null;

      if (!data) return bot.sendMessage(chatId, '❌ Token salah atau sudah kadaluarsa.');

      const isAnonymous = data.anonymous;
      const raterInfo = isAnonymous 
        ? "Anonim" 
        : (msg.from.username ? `@${msg.from.username}` : msg.from.first_name);

      const caption = `🖼️ **PAP Rating**\n\n` +
                      `👤 Pengirim: ${data.ownerName || 'Unknown'}\n` +
                      `📝 Berikan reaksi atau balas pesan ini untuk berkomentar!`;

      // Membuat Tombol Emoji untuk Reaksi
      const opts = {
        caption: caption,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔥', callback_data: `rate_${token}_hot` },
              { text: '⭐', callback_data: `rate_${token}_star` },
              { text: '❤️', callback_data: `rate_${token}_love` },
              { text: '🤣', callback_data: `rate_${token}_funny` },
              { text: '👍', callback_data: `rate_${token}_cool` }
            ]
          ]
        }
      };

      // Kirim Media
      let sentMedia;
      if (data.type === 'photo') {
        sentMedia = bot.sendPhoto(chatId, data.media, opts);
      } else {
        sentMedia = bot.sendVideo(chatId, data.media, opts);
      }

      // FITUR KOMENTAR: Menunggu balasan teks setelah media muncul
      bot.sendMessage(chatId, "💬 _Balas dengan pesan teks jika ingin memberikan komentar..._", { parse_mode: 'Markdown' });
      
      bot.once('message', (commentMsg) => {
        // Pastikan bukan perintah lain
        if (commentMsg.text && !commentMsg.text.startsWith('/')) {
          const comment = commentMsg.text;
          const targetOwner = data.senderId; // Pastikan saat simpan PAP, senderId juga disimpan

          // Kirim Komentar ke Pemilik Media
          bot.sendMessage(targetOwner, 
            `💬 **Komentar Baru masuk!**\n\n` +
            `Token: \`${token}\`\n` +
            `Dari: ${raterInfo} (ID: ${msg.from.id})\n` +
            `Komentar: _${comment}_`, 
            { parse_mode: 'Markdown' }
          );

          bot.sendMessage(chatId, "✅ Komentar kamu telah terkirim ke pengirim!");
        }
      });
    });
  }
};

// ==========================================
// CALLBACK QUERY HANDLER (Tambahkan di file utama bot kamu)
// ==========================================
/*
bot.on('callback_query', (query) => {
  const [action, token, emoji] = query.data.split('_');

  if (action === 'rate') {
    const data = global.papDatabase[token];
    if (data) {
      const emojiMap = { hot: '🔥', star: '⭐', love: '❤️', funny: '🤣', cool: '👍' };
      const selectedEmoji = emojiMap[emoji];
      
      // Notifikasi ke Pengirim Media
      bot.sendMessage(data.senderId, 
        `✨ **Seseorang memberikan reaksi!**\n\n` +
        `Token: \`${token}\` memberikan reaksi: ${selectedEmoji}\n` +
        `Oleh: ${query.from.first_name} (ID: ${query.from.id})`
      );

      bot.answerCallbackQuery(query.id, { text: `Kamu memberikan reaksi ${selectedEmoji}` });
      bot.editMessageCaption(`✅ Berhasil memberikan reaksi ${selectedEmoji}`, {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id
      });
    }
  }
});
*/
