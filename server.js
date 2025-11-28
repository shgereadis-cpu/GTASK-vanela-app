const express = require('express');
const path = require('path');
const app = express();

// Read environment variables
const PORT = process.env.PORT || 5000;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_BOT_USERNAME = 'GtaskProVanela_bot';

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// API endpoint to get configuration
app.get('/api/config', (req, res) => {
    res.json({
        botToken: TELEGRAM_BOT_TOKEN,
        botUsername: TELEGRAM_BOT_USERNAME,
        timestamp: new Date().toISOString()
    });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ G-Task Manager server running on http://0.0.0.0:${PORT}`);
    console.log(`🤖 Bot Token Status: ${TELEGRAM_BOT_TOKEN ? 'Loaded ✅' : 'Not set - set TELEGRAM_BOT_TOKEN env var'}`);
});
