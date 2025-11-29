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

console.log('🔧 Server Configuration:');
console.log(`   BOT_TOKEN: ${BOT_TOKEN ? '✓ Set (' + BOT_TOKEN.slice(0, 10) + '...)' : '✗ MISSING'}`);
console.log(`   ANNOUNCEMENT_CHANNEL_LINK: ${ANNOUNCEMENT_CHANNEL_LINK ? '✓ Set (' + ANNOUNCEMENT_CHANNEL_LINK.slice(0, 30) + '...)' : '✗ MISSING'}`);

// ===== Telegram API Helper =====
async function sendMessage(chatId, text, inlineKeyboard = null, parseMode = 'HTML') {
    try {
        if (!BOT_TOKEN) {
            console.error('❌ BOT_TOKEN not configured');
            return false;
        }

        const payload = {
            chat_id: chatId,
            text,
            parse_mode: parseMode
        };
        
        if (inlineKeyboard) {
            payload.reply_markup = { inline_keyboard: inlineKeyboard };
        }
        
        console.log(`📤 Sending message to ${chatId}`);
        const response = await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ Telegram API Error: ${response.status} - ${error}`);
            return false;
        }

        console.log(`✅ Message sent successfully to ${chatId}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending message:', error);
        return false;
    }
}

// ===== Bot Commands =====

async function handleStart(message) {
    const userId = message.from.id;
    const firstName = message.from.first_name || 'Friend';
    
    console.log(`👤 /start received from user ${userId} (${firstName})`);

    if (!ANNOUNCEMENT_CHANNEL_LINK) {
        console.error('❌ ANNOUNCEMENT_CHANNEL_LINK not configured');
        return;
    }
    
    // Prepare inline button
    const inlineKeyboard = [
        [
            {
                text: '🔗 ቻናል ይቀላቀሉ',
                url: ANNOUNCEMENT_CHANNEL_LINK
            }
        ]
    ];
    
    const welcomeMessage = `እንኳን ደህና መጣህ! 👋

የ G-Task Proን ስራዎች ለመጀመር ቻናላችንን ይቀላቀሉ! 💚`;
    
    await sendMessage(userId, welcomeMessage, inlineKeyboard);
}

// ===== Webhook Endpoint =====

app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        console.log('📨 Webhook received:', JSON.stringify(update).slice(0, 200));
        
        if (update.message) {
            const text = update.message.text || '';
            console.log(`📝 Message text: "${text}"`);
            
            if (text === '/start' || text.startsWith('/start ')) {
                console.log('✅ /start command detected');
                await handleStart(update.message);
            } else {
                console.log(`⏭️  Message ignored (not /start command)`);
            }
        } else {
            console.log('⏭️  No message in update');
        }
        
        res.json({ ok: true });
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
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
    console.log(`\n✅ G-Task Bot Server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Webhook URL: https://your-app-name.onrender.com/webhook`);
    console.log(`\n📋 Setup Instructions:`);
    console.log(`1. Set environment variables in Render dashboard`);
    console.log(`2. Deploy the app`);
    console.log(`3. Register webhook with Telegram:\n`);
    console.log(`   curl -X POST https://api.telegram.org/bot{BOT_TOKEN}/setWebhook \\`);
    console.log(`     -F url=https://your-app-name.onrender.com/webhook\n`);
});
