module.exports = {
  command: 'ratepap',
  description: 'Rate foto/PAP',
  execute: (bot, msg) => {
    bot.sendMessage(msg.chat.id, 'Fitur Rate PAP:\n1. Masukkan Token\n2. Berikan Rating (1-10)\n3. Tambahkan Komentar');
  }
};
