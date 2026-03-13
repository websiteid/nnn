module.exports = {
  command: 'kirimpap',
  description: 'Kirim PAP untuk di-rate',
  execute: (bot, msg) => {
    const chatId = msg.chat.id;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📢 Publik', callback_data: 'mode_publik' }, { text: '🥷 Privat', callback_data: 'mode_privat' }]
        ]
      }
    };
    bot.sendMessage(chatId, '📸 **Pilih mode PAP kamu:**', options);

    // Menangani klik tombol
    bot.once('callback_query', (query) => {
      const mode = query.data === 'mode_publik' ? 'Publik' : 'Privat';
      global.userState[chatId] = mode; // Simpan mode pilihan
      
      bot.editMessageText(`✅ Mode **${mode}** dipilih.\n\nSekarang kirim foto atau video PAP kamu:`, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown'
      });
      bot.answerCallbackQuery(query.id);
    });
  }
};
