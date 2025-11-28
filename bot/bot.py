import os
import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
import sys

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Configuration
BOT_TOKEN = os.getenv('TELEGRAM_BOT_TOKEN', '')
MINI_APP_URL = os.getenv('MINI_APP_URL', 'https://replit.com')

if not BOT_TOKEN:
    print("❌ Error: TELEGRAM_BOT_TOKEN environment variable not set!")
    sys.exit(1)

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
        f"📺 ቻናል ጆይን - <b>3 ETB</b>\n"
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
    """
    await update.message.reply_text(help_text, parse_mode='HTML')

async def balance_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /balance command"""
    await update.message.reply_text(
        f"💰 <b>የእርስዎ ሂሳብ</b>\n\n"
        f"<b>ጠቅላላ:</b> 125.00 ETB\n"
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

def main():
    """Start the bot with polling"""
    logger.info("🤖 G-Task Manager Bot starting...")
    
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("balance", balance_command))
    application.add_handler(CommandHandler("withdraw", withdraw_command))
    application.add_handler(CommandHandler("invite", invite_command))
    
    # Start polling
    logger.info("📡 Bot polling started...")
    application.run_polling()

if __name__ == '__main__':
    main()
