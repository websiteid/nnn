module.exports = {
  command: 'ratepap',
  description: 'Memberikan rating pada PAP',
  execute: (bot, msg) => {
    bot.sendMessage(msg.chat.id, '⭐ **Rate PAP Menu**\n\nSilakan kirimkan Token untuk memulai proses rating.', { parse_mode: 'Markdown' });
  }
};
