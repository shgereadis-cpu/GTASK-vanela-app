import os
import logging
from flask import Flask, request, jsonify
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler, filters
import json
from config import BOT_TOKEN, MINI_APP_URL, PORT, HOST

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Storage for user data (in production, use database)
user_data = {}

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command - open mini app"""
    user = update.effective_user
    
    # Store user info
    user_data[user.id] = {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name
    }
    
    keyboard = [
        [InlineKeyboardButton(
            "🎮 ጂሜል ሙያ ጀምር",
            web_app=WebAppInfo(url=MINI_APP_URL)
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        f"እንኳን ወደ G-Task Manager {user.first_name}! 👋\n\n"
        f"🎁 ጂሜል አካውንት ከፍተው ገንዘብ ያገኙ\n"
        f"💰 ወይም ሙያ ማጠናቀቅ የሌለበት ሚኒ አፕ ክፈቱ\n\n"
        f"<b>ታዛይ ሙያዎች:</b>\n"
        f"✅ ጂሜል አካውንት - <b>5 ETB</b>\n"
        f"📺 ሳህን ይቅር - <b>3 ETB</b>\n"
        f"⏰ ዕለታዊ ምልክት - <b>1-3 ETB</b>\n",
        parse_mode='HTML',
        reply_markup=reply_markup
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command"""
    help_text = """
<b>G-Task Manager መመሪያ</b>

<b>ዋና ውዥዋጅ:</b>
/start - ሚኒ አፕ ክፈት
/balance - የእርስዎ ሂሳብ ይመልከቱ
/withdraw - ገንዘብ ጠይቁ
/invite - ጋብዙ እና ሪዋርድ ያግኙ

<b>ሙያ ዓይነቶች:</b>
📧 <b>ጂሜል አካውንት:</b> 5 ETB
   ➜ አዲስ Gmail ከፍተው መረጃ ያስገቡ
   
📺 <b>ቻናል ጆይን:</b> 3 ETB
   ➜ ቴሌግራም ቻናልን ጋብዙ
   
⏰ <b>ዕለታዊ ምልክት:</b> 1-3 ETB
   ➜ ዳይሊ ቼክ ወደ ውስጥ ይግቡ

<b>ስሌት ዝርዝር:</b>
💚 ሙያ ሙያ = +5 ETB
💳 ወጪ (ቢደርሳ) = -50 ETB
👥 ሚስጥር = +2.5 ETB (የተቀያየርወ 5%)
    """
    await update.message.reply_text(help_text, parse_mode='HTML')

async def balance_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /balance command"""
    user_id = update.effective_user.id
    # In production, fetch from database
    balance = 125.00  # Mock value
    
    await update.message.reply_text(
        f"💰 <b>የእርስዎ ሂሳብ</b>\n\n"
        f"<b>ጠቅላላ:</b> {balance} ETB\n"
        f"<b>ተቀብለኛ:</b> 75 ETB\n"
        f"<b>በመጠባበቅ:</b> 50 ETB",
        parse_mode='HTML'
    )

async def withdraw_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /withdraw command"""
    await update.message.reply_text(
        "💳 <b>ወጪ ጠይቅ</b>\n\n"
        "ዝቅተኛ ወጪ: <b>50 ETB</b>\n\n"
        "በሚኒ ሳህን ውስጥ ወጪ ጠይቅ ወይም አስታወሳህን ይላክ",
        parse_mode='HTML'
    )

async def invite_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /invite command"""
    user_id = update.effective_user.id
    invite_link = f"https://t.me/GTaskManagerBot?start={user_id}"
    
    await update.message.reply_text(
        f"👥 <b>ጋብዙ እና ሪዋርድ ያግኙ</b>\n\n"
        f"<b>የእርስዎ ረቂቅ ሊንክ:</b>\n"
        f"<code>{invite_link}</code>\n\n"
        f"<b>ሪዋርድ:</b> ለእያንዳንዱ ጥበውት ጨምሮ \n"
        f"<b>5% ETB</b> ያግኙ",
        parse_mode='HTML'
    )

async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle data from mini app web view"""
    data = update.effective_message.web_app_data.data
    logger.info(f"Received data from web app: {data}")
    
    try:
        app_data = json.loads(data)
        # Process data from mini app
        logger.info(f"Processing user data: {app_data}")
        
        await update.message.reply_text(
            "✅ ውሂብ ተቀብሏል!\n\n"
            "ምስጋና ለሙያ ማጠናቀቅ!"
        )
    except json.JSONDecodeError:
        await update.message.reply_text("❌ ስህተት ውሂብ ሂደት")

def main():
    """Start the bot"""
    if not BOT_TOKEN:
        print("❌ Error: TELEGRAM_BOT_TOKEN not set!")
        return
    
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("balance", balance_command))
    application.add_handler(CommandHandler("withdraw", withdraw_command))
    application.add_handler(CommandHandler("invite", invite_command))
    
    # Add web app data handler
    application.add_handler(MessageHandler(filters.Regex(r".*"), handle_web_app_data))
    
    # Flask routes
    @app.route('/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'}), 200
    
    @app.route('/webhook', methods=['POST'])
    def webhook():
        """Handle Telegram webhook"""
        try:
            update_data = request.get_json()
            update = Update.de_json(update_data, application.bot)
            application.process_update(update)
            return 'ok', 200
        except Exception as e:
            logger.error(f"Webhook error: {e}")
            return 'error', 400
    
    @app.route('/users/<int:user_id>', methods=['GET'])
    def get_user(user_id):
        """Get user data"""
        if user_id in user_data:
            return jsonify(user_data[user_id]), 200
        return jsonify({'error': 'User not found'}), 404
    
    # Start polling (for development)
    logger.info("🤖 Bot started with polling...")
    application.run_polling()

if __name__ == '__main__':
    main()
