# G-Task Manager Telegram Mini App

## Project Overview
A modern Ethiopian-themed Telegram Mini App where users earn ETB by creating Gmail accounts. Features include task and withdrawal approval workflows, 5% referral rewards system, comprehensive admin management panel, and 1-hour task timeout system.

## Recent Changes (Nov 28, 2025)
- ✅ Updated Gmail Credentials Pool form: First Name, Last Name, Gmail, Password
- ✅ Updated credentials display for users
- ✅ Integrated Telegram bot with polling
- ✅ Configured for Render deployment

## Tech Stack
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Python with Flask + python-telegram-bot
- **Storage**: Browser localStorage
- **Deployment**: Render (web service + bot service)

## Deployment Configuration (Render)

### Files for Render:
- **Procfile** - Defines how to run web and bot services
- **requirements.txt** - Python dependencies
- **app.py** - Flask web server for mini app
- **bot/bot.py** - Telegram bot service

### Render Setup:
1. **Web Service** (Frontend Mini App):
   - Start command: `python app.py`
   - Serves on port 5000
   - Static files: index.html, style.css

2. **Background Worker** (Telegram Bot):
   - Start command: `python bot/bot.py`
   - Uses polling mode for continuous updates
   - Requires TELEGRAM_BOT_TOKEN secret

### Environment Variables for Render:
```
TELEGRAM_BOT_TOKEN=<your-bot-token>
MINI_APP_URL=<your-render-app-url>
PORT=5000
```

## Project Structure
```
├── app.py (Flask web server - main entry for Render web service)
├── index.html (Mini app frontend)
├── style.css (Styling)
├── requirements.txt (Python dependencies)
├── Procfile (Render process definitions)
├── bot/
│   └── bot.py (Telegram bot - runs as background worker)
├── .gitignore
└── .replit (Replit config - kept for local development)
```

## Key Features Implemented
1. ✅ 1-hour task timeout with live countdown timer
2. ✅ Channel Join task (3 ETB) with verification
3. ✅ Task submission with screenshot verification
4. ✅ Admin panel with 3 tabs: Credentials Pool, Pending Tasks, Withdrawals
5. ✅ Referral system (5% rewards)
6. ✅ Modern dark theme with Ethiopian colors
7. ✅ Telegram bot with commands: /start, /help, /balance, /withdraw, /invite

## User Preferences
- Ethiopian theme with colors: Green (#1DB854), Gold (#FFB800), Red (#FF6B5B)
- Admin password: "admin123" (use trim() for validation)
- Admin access: Triple-click app title
- Minimum withdrawal: 50 ETB
- Task payment: 5 ETB per verified account
- Task timeout: 1 hour with auto-return

## Telegram Bot Commands
- `/start` - Opens mini app with a button
- `/help` - Shows available features
- `/balance` - Check account balance
- `/withdraw` - Request withdrawal
- `/invite` - Get referral link

## Deployment to Render

### Step 1: Create Services
1. Go to render.com and create account
2. Create **New > Web Service** and connect to this GitHub repo
   - Build command: `pip install -r requirements.txt`
   - Start command: `python app.py`
   - Environment: Python 3.11+

3. Create **New > Background Worker** and connect same repo
   - Build command: `pip install -r requirements.txt`
   - Start command: `python bot/bot.py`
   - Environment: Python 3.11+

### Step 2: Add Environment Variables
For both services, add:
- `TELEGRAM_BOT_TOKEN` = Your bot token from @BotFather
- `MINI_APP_URL` = Your Render web service URL

### Step 3: Deploy
- Push to GitHub
- Render auto-deploys both services

## Local Development (Replit)
```bash
# Terminal 1: Run web server
python3 -m http.server 5000 --bind 0.0.0.0

# Terminal 2: Run bot
cd bot && python3 bot.py
```

## Database
Currently using browser localStorage. For production, consider:
- PostgreSQL with Neon (managed by Render)
- Firebase Realtime Database
- Any REST API backend

## Next Steps
1. Deploy bot token to Render environment
2. Set MINI_APP_URL after web service deployment
3. Test bot commands
4. Monitor logs in Render dashboard
