const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');
const features = require('../features');

const app = express();
const bot = new TelegramBot(config.BOT_TOKEN, { polling: false });

// Di api/bot.js
global.papDatabase = global.papDatabase || {};
global.userState = global.userState || {};
features.register(bot);

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
    
    // HTML harus di dalam backticks (`)
    res.send(`<!DOCTYPE html><html><body><h1>Webhook Set!</h1></body></html>`);
  } catch (error) {
    res.status(500).send('Error');
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Bot Operational</h1>');
});

module.exports = app;
// TIDAK BOLEH ADA HTML APA PUN DI BAWAH BARIS INI
