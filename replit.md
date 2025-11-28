# G-Task Manager Telegram Mini App

## Project Overview
A modern Ethiopian-themed Telegram Mini App where users earn ETB by creating Gmail accounts. Features include task and withdrawal approval workflows, 5% referral rewards system, comprehensive admin management panel, and 1-hour task timeout system.

## Recent Changes (Nov 28, 2025)
- Updated Gmail Credentials Pool form to collect: First Name, Last Name, Gmail, Password (removed Recovery Email)
- Fixed warning text to "ይህን ተግባር በ1 ሰአት ማጠናቀቅ ይኖርቦታል"
- Updated credentials display to show First Name, Last Name, Gmail Address, Password
- Started Telegram bot backend integration

## Tech Stack
- Frontend: HTML, CSS, JavaScript (Vanilla)
- Backend: Python with Flask + python-telegram-bot
- Storage: Browser localStorage (development)
- Deployment: Render (static website)

## Project Structure
```
├── index.html (Mini app frontend)
├── style.css (Styling)
├── bot/
│   ├── bot.py (Telegram bot main file)
│   ├── handlers.py (Bot command handlers)
│   └── config.py (Configuration)
└── .replit (Replit config)
```

## Key Features Implemented
1. ✅ 1-hour task timeout with live countdown timer
2. ✅ Channel Join task (3 ETB) with verification
3. ✅ Task submission with screenshot verification
4. ✅ Admin panel with 3 tabs: Credentials Pool, Pending Tasks, Withdrawals
5. ✅ Referral system (5% rewards)
6. ✅ Modern dark theme with Ethiopian colors
7. 🚧 Telegram bot connection (in progress)

## User Preferences
- Ethiopian theme with colors: Green (#1DB854), Gold (#FFB800), Red (#FF6B5B)
- Admin password: "admin123"
- Admin access: Triple-click app title
- Minimum withdrawal: 50 ETB
- Task payment: 5 ETB per verified account

## Telegram Bot Setup
- Bot token needed from @BotFather (user to provide)
- Webhook URL: Will be generated on deployment
- Commands: /start, /earn, /balance, /withdraw, /admin

## Next Steps
- User provides Telegram Bot Token
- Deploy bot server
- Connect bot to mini app via initData
