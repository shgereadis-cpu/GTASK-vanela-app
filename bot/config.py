import os

# Telegram Bot Configuration
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
MINI_APP_URL = os.getenv('MINI_APP_URL', 'https://replit.com')  # Will be replaced with actual Replit domain
ADMIN_CHAT_ID = os.getenv('ADMIN_CHAT_ID', '')

# Task Configuration
TASK_TIMEOUT = 3600  # 1 hour in seconds
TASK_REWARD = 5  # ETB
MIN_WITHDRAWAL = 50  # ETB
REFERRAL_PERCENTAGE = 5  # %

# Channel Configuration
CHANNEL_ID = os.getenv('CHANNEL_ID', '@yourtestchannel')
CHANNEL_JOIN_REWARD = 3  # ETB
