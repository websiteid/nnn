bot.on('callback_query', (query) => {
  const data = query.data;
  const msg = query.message;
  const chatId = msg.chat.id;

  // Pastikan bot merespons siapapun yang menekan tombol
  console.log(`User ${query.from.id} menekan ${data}`);

  if (data === 'menu_ratepap') {
    require('./ratepap').execute(bot, msg);
  } else if (data === 'menu_kirimpap') {
    require('./kirimpap').execute(bot, msg);
  } else if (data === 'menu_menfes') {
    require('./menfes').execute(bot, msg);
  } else if (data === 'mode_publik' || data === 'mode_privat') {
    // Penanganan mode PAP
    const mode = data === 'mode_publik' ? 'Publik' : 'Privat';
    global.userState[chatId] = mode;
    bot.editMessageText(`✅ Mode **${mode}** dipilih.\n\nSekarang kirim foto/video PAP kamu:`, {
      chat_id: chatId,
      message_id: msg.message_id,
      parse_mode: 'Markdown'
    });
  }
  
  bot.answerCallbackQuery(query.id).catch(err => console.error("Gagal menjawab query:", err));
});
