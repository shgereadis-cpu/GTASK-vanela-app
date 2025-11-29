require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

// ===== Configuration =====
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ANNOUNCEMENT_CHANNEL_LINK = process.env.ANNOUNCEMENT_CHANNEL_LINK || '';
const TELEGRAM_API = 'https://api.telegram.org';

// ===== Telegram API Helper =====
async function sendMessage(chatId, text, inlineKeyboard = null, parseMode = 'HTML') {
    try {
        const payload = {
            chat_id: chatId,
            text,
            parse_mode: parseMode
        };
        
        if (inlineKeyboard) {
            payload.reply_markup = { inline_keyboard: inlineKeyboard };
        }
        
        const response = await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        return response.ok;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

// ===== Bot Commands =====

async function handleStart(message) {
    const userId = message.from.id;
    const firstName = message.from.first_name || 'Friend';
    
    // Prepare inline button
    const inlineKeyboard = [
        [
            {
                text: '🔗 ቻናል ይቀላቀሉ',
                url: ANNOUNCEMENT_CHANNEL_LINK
            }
        ]
    ];
    
    const welcomeMessage = `
እንኳን ደህና መጣህ! 👋

የ G-Task Proን ስራዎች ለመጀመር ቻናላችንን ይቀላቀሉ! 💚
    `;
    
    await sendMessage(userId, welcomeMessage, inlineKeyboard);
}

// ===== Webhook Endpoint =====

app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        
        if (update.message && (update.message.text === '/start' || update.message.text.startsWith('/start '))) {
            await handleStart(update.message);
        }
        
        res.json({ ok: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(200).json({ ok: true });
    }
});

// ===== Server Routes =====

app.get('/', (req, res) => {
    res.send('✅ G-Task Bot Server is running');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve mini app
app.get('/mini-app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ===== Start Server =====

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ G-Task Bot Server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Webhook URL: https://your-domain.com/webhook`);
    console.log(`📝 Configuration:`);
    console.log(`   - BOT_TOKEN: ${BOT_TOKEN ? '✓ Set' : '✗ Missing'}`);
    console.log(`   - ANNOUNCEMENT_CHANNEL_LINK: ${ANNOUNCEMENT_CHANNEL_LINK ? '✓ Set' : '✗ Missing'}`);
});
