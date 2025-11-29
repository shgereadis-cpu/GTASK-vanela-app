require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const dbService = require('./dbService');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

// ===== Configuration =====
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const ADMIN_ID = parseInt(process.env.ADMIN_ID) || 123456;
const TELEGRAM_API = 'https://api.telegram.org';
const MINI_APP_URL = `${process.env.MINI_APP_URL || 'http://localhost:5000'}/mini-app`;

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
        
        if (!response.ok) {
            console.error('Failed to send message:', await response.text());
        }
        
        return response.ok;
    } catch (error) {
        console.error('Error sending message:', error);
        return false;
    }
}

async function answerCallbackQuery(callbackQueryId, text = '', showAlert = false) {
    try {
        await fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/answerCallbackQuery`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                callback_query_id: callbackQueryId,
                text,
                show_alert: showAlert
            })
        });
    } catch (error) {
        console.error('Error answering callback query:', error);
    }
}

// ===== Bot Commands =====

async function handleStart(message) {
    const userId = message.from.id;
    const username = message.from.username || 'User';
    const firstName = message.from.first_name || 'Friend';
    
    // Extract referral code from deep link
    let referrerId = null;
    if (message.text && message.text.includes(' ')) {
        const referralCode = message.text.split(' ')[1];
        if (referralCode.startsWith('user_')) {
            referrerId = parseInt(referralCode.replace('user_', ''));
        }
    }
    
    try {
        // Check if user exists
        let user = await dbService.getUserData(userId);
        
        if (!user) {
            // Create new user
            user = await dbService.createUser(userId, username, firstName, referrerId);
            console.log(`New user registered: ${userId}`);
        }
        
        // Prepare inline buttons
        const inlineKeyboard = [
            [
                {
                    text: '🎮 ሚኒአፑን ይክፈቱ',
                    web_app: { url: MINI_APP_URL }
                }
            ],
            [
                { text: '💰 ባላንስ', callback_data: 'show_balance' },
                { text: '📊 ስታትስቲክስ', callback_data: 'show_stats' }
            ],
            [
                { text: '❓ እርዳታ', callback_data: 'show_help' }
            ]
        ];
        
        const welcomeMessage = `
<b>ዋለሙ ወደ G-TASK! 🎯</b>

ስላም ${firstName}! 
ሚኒአፑን ይክፈቱ እና ገንዘብ ይገምቱ! 💚💛

<b>ምን ማድረግ ይችላሉ:</b>
✅ ገመናማማ ተግባራት ሙላ ያደርጋሉ
💬 ወደ ጓደኞችዎ ማጫወቻውን ያሰናዱ (5% ሪወርድ)
💸 ገንዘብ ይሳሉ (Telebirr/CBE)

<b>🎮 ቦታ ይክፈቱ እና ጀምሩ!</b>
        `;
        
        await sendMessage(userId, welcomeMessage, inlineKeyboard);
        
    } catch (error) {
        console.error('Error in /start:', error);
        await sendMessage(userId, '❌ መተግበር ላይ ስህተት ተከስቷል');
    }
}

async function handleBroadcast(message) {
    const userId = message.from.id;
    
    // Check if user is admin
    if (userId !== ADMIN_ID) {
        await sendMessage(userId, '❌ ይህ ትዕዛዝ ለአስተዳዳሪዎች ብቻ ነው');
        return;
    }
    
    // Get broadcast message
    const broadcastText = message.text.replace('/broadcast ', '').trim();
    
    if (!broadcastText) {
        await sendMessage(userId, '❌ ብሮድካስት ታሪክ ይሰጡ\n\n/broadcast <message>');
        return;
    }
    
    try {
        // Get all user IDs
        const userIds = await dbService.getAllUserIds();
        
        if (userIds.length === 0) {
            await sendMessage(userId, '⚠️ ምንም ተጠቃሚዎች አልተገኙም');
            return;
        }
        
        // Send to all users
        let successCount = 0;
        for (const uid of userIds) {
            const sent = await sendMessage(uid, `📢 <b>Admin Message:</b>\n\n${broadcastText}`);
            if (sent) successCount++;
            
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        await sendMessage(userId, `✅ ብሮድካስት ተላከ!\n${successCount}/${userIds.length} ተጠቃሚዎች`);
        
    } catch (error) {
        console.error('Error in broadcast:', error);
        await sendMessage(userId, '❌ ብሮድካስት ላይ ስህተት ተከስቷል');
    }
}

// ===== Callback Query Handler =====
async function handleCallbackQuery(callbackQuery) {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;
    
    try {
        if (data === 'show_balance') {
            const user = await dbService.getUserData(userId);
            if (user) {
                await sendMessage(userId, `💰 <b>ያለዎ ባላንስ:</b>\n\n<b>${user.balance?.toFixed(2) || '0.00'} ETB</b>\n\n🎮 ሚኒአፑን ይክፈቱ ገንዘብ ለመዝገብ`);
            } else {
                await sendMessage(userId, '❌ ተጠቃሚ አልተገኘም');
            }
        } 
        else if (data === 'show_stats') {
            const stats = await dbService.getUserStats(userId);
            if (stats) {
                const statsMessage = `
📊 <b>ስታትስቲክስ:</b>

✅ ተጠናቅ ተግባራት: ${stats.completedTasks || 0}
👥 ለስላሜ ወደዳ: ${stats.referralCount || 0}
💵 ጠቅላላ ገቢ: ${stats.totalEarnings?.toFixed(2) || '0.00'} ETB
💰 አሁን ላይ ባላንስ: ${stats.balance?.toFixed(2) || '0.00'} ETB
                `;
                await sendMessage(userId, statsMessage);
            } else {
                await sendMessage(userId, '❌ ስታትስቲክስ አልተገኘም');
            }
        }
        else if (data === 'show_help') {
            const helpMessage = `
❓ <b>እርዳታ:</b>

<b>ያገኛሉ ይሆናል:</b>
💻 Gmail ✅ - 10 ETB
✅ Daily ጎብኝነት - 1-3 ETB

<b>Referral:</b>
👥 ወደዳ ወዳ - 5% ሪወርድ
🔗 ያወዛወዘበት ህዋ: https://t.me/GtaskProVanela_bot?start=user_${userId}

<b>ተሳትፎ:</b>
1️⃣ ሚኒአፑ ይክፈቱ
2️⃣ ተግባር ምረጡ
3️⃣ Screenshot ይላኩ
4️⃣ Admin ምረጅ ለማመንጨት

❓ ለበለጠ ጋብቁ: @GtaskSupport
                `;
            await sendMessage(userId, helpMessage);
        }
        
        await answerCallbackQuery(callbackQuery.id);
        
    } catch (error) {
        console.error('Error handling callback query:', error);
        await answerCallbackQuery(callbackQuery.id, '❌ ስህተት ተከስቷል', true);
    }
}

// ===== API Endpoints =====

// GET /api/config - Configuration for mini app
app.get('/api/config', (req, res) => {
    res.json({
        botUsername: 'GtaskProVanela_bot',
        timestamp: new Date().toISOString()
    });
});

// POST /api/complete-task - Mini App calls this when task is completed
app.post('/api/complete-task', async (req, res) => {
    try {
        const { userId, amount, taskType = 'gmail', referrerId = null } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({ error: 'Missing userId or amount' });
        }
        
        // Update user balance
        const updatedUser = await dbService.updateBalance(userId, amount);
        
        // Record the task
        await dbService.recordCompletedTask(userId, taskType, amount);
        
        // If there's a referrer, add referral bonus (5%)
        if (referrerId) {
            const referralBonus = (amount * 0.05).toFixed(2);
            await dbService.addReferralBonus(referrerId, parseFloat(referralBonus));
            
            // Notify referrer
            await sendMessage(referrerId, `🎉 <b>Referral Bonus!</b>\n\nYou earned <b>${referralBonus} ETB</b> from a referral!\n\n💰 New Balance: ${updatedUser.balance?.toFixed(2) || '0.00'} ETB`);
        }
        
        // Notify the user
        await sendMessage(userId, `✅ <b>ምርጫ ተጠናቋል!</b>\n\n💰 <b>+${amount.toFixed(2)} ETB</b> ከክላስ\n\n🏦 አሁን ላይ ባላንስ: <b>${updatedUser.balance?.toFixed(2) || '0.00'} ETB</b>`);
        
        res.json({
            success: true,
            newBalance: updatedUser.balance,
            message: 'Task completed and balance updated'
        });
        
    } catch (error) {
        console.error('Error in /api/complete-task:', error);
        res.status(500).json({ error: 'Failed to complete task' });
    }
});

// POST /api/update-balance - Update user balance from mini app
app.post('/api/update-balance', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({ error: 'Missing userId or amount' });
        }
        
        const updatedUser = await dbService.updateBalance(userId, amount);
        
        res.json({
            success: true,
            newBalance: updatedUser.balance
        });
        
    } catch (error) {
        console.error('Error in /api/update-balance:', error);
        res.status(500).json({ error: 'Failed to update balance' });
    }
});

// GET /api/user/:userId - Get user balance and stats
app.get('/api/user/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const user = await dbService.getUserData(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
        
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Webhook endpoint for Telegram
app.post('/webhook', async (req, res) => {
    try {
        const update = req.body;
        
        // Handle messages
        if (update.message) {
            const message = update.message;
            
            if (message.text === '/start' || message.text.startsWith('/start user_')) {
                await handleStart(message);
            } else if (message.text && message.text.startsWith('/broadcast')) {
                await handleBroadcast(message);
            }
        }
        
        // Handle callback queries
        if (update.callback_query) {
            await handleCallbackQuery(update.callback_query);
        }
        
        res.json({ ok: true });
        
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(200).json({ ok: true }); // Always return 200 to Telegram
    }
});

// ===== Server Health =====
app.get('/', (req, res) => {
    res.send('✅ G-TASK Server is running');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve mini app
app.get('/mini-app', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve static mini app assets
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ G-TASK Server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Webhook URL: https://your-domain/webhook`);
    console.log(`🎮 Mini App: http://0.0.0.0:${PORT}/mini-app`);
    console.log(`📝 Environment:`);
    console.log(`   - BOT_TOKEN: ${BOT_TOKEN ? '✓ Set' : '✗ Missing'}`);
    console.log(`   - ADMIN_ID: ${ADMIN_ID}`);
    console.log(`   - DB_API_URL: ${process.env.DB_API_URL || '✗ Missing'}`);
});
