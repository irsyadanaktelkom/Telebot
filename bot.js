const TelegramBot = require('node-telegram-bot-api');
const fetch = require('node-fetch');
const { getCurrencies } = require('./kucoin.js');
const { getData } = require('./kucoin.js');


// Initialize Telegram bot
const bot = new TelegramBot('6829214775:AAGptbh5th7_swqlowjiJIyPo78w-DOYwaA', { polling: true });

// Function to retrieve current price from KuCoin exchange
async function getKuCoinPrice() {
    const response = await fetch('https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT');
    const data = await response.json();
    return data.data.price;
}

// Function to retrieve current price from Gate.io exchange
async function getGateIoPrice() {
    const response = await fetch('https://api.gate.io/api2/1/ticker/btc_usdt');
    const data = await response.json();
    return parseFloat(data.last);
}

// Function to periodically check data and send updates
async function checkAndSendUpdates() {
    // Fetch current cryptocurrency price from KuCoin and Gate.io exchanges
    const kucoinPrice = await getKuCoinPrice();
    const gateIoPrice = await getGateIoPrice();

    // Compare prices and send notification if significant difference is detected
    const threshold = 100; // Example threshold in USDT
    const priceDifference = Math.abs(kucoinPrice - gateIoPrice);
    if (priceDifference >= threshold) {
        const message = `Alert: Significant price difference detected!\nKuCoin Price: ${kucoinPrice}\nGate.io Price: ${gateIoPrice}`;
        // Send message to Telegram
        bot.sendMessage('Telearbit_bot', message); // Replace YOUR_CHAT_ID with the chat ID you want to send the message to
    }
}

// Interval for checking and sending updates (every 5 minutes in this example)
setInterval(checkAndSendUpdates, 5 * 60 * 1000); // Adjust the interval as needed

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Welcome to Crypto Signal Bot! Type /signal to get the latest signal.');
});

// Handle /signal command
bot.onText(/\/signal/, (msg) => {
  const chatId = msg.chat.id;
  // Fetch current cryptocurrency price from KuCoin and Gate.io exchanges
  getKuCoinPrice().then(kucoinPrice => {
      getGateIoPrice().then(gateIoPrice => {
          // Example comparison (you may adjust this according to your requirements)
          if (kucoinPrice > gateIoPrice) {
              bot.sendMessage(chatId, `KuCoin price (${kucoinPrice}) is higher than Gate.io price (${gateIoPrice}).`);
          } else if (kucoinPrice < gateIoPrice) {
              bot.sendMessage(chatId, `Gate.io price (${gateIoPrice}) is higher than KuCoin price (${kucoinPrice}).`);
          } else {
              bot.sendMessage(chatId, `KuCoin price (${kucoinPrice}) is the same as Gate.io price (${gateIoPrice}).`);
          }
      });
  }).catch(err => {
      console.error('Error fetching prices:', err);
      bot.sendMessage(chatId, 'Error fetching prices. Please try again later.');
  });
});

// Command handler for /compare command
bot.onText(/\/compare/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Fetch current prices from KuCoin and Gate.io exchanges
        const kucoinPrice = await getKuCoinPrice();
        const gateIoPrice = await getGateIoPrice();
        
        // Compare prices and send the result
        if (kucoinPrice > gateIoPrice) {
            bot.sendMessage(chatId, `KuCoin price (${kucoinPrice}) is higher than Gate.io price (${gateIoPrice}).`);
        } else if (kucoinPrice < gateIoPrice) {
            bot.sendMessage(chatId, `Gate.io price (${gateIoPrice}) is higher than KuCoin price (${kucoinPrice}).`);
        } else {
            bot.sendMessage(chatId, `KuCoin price (${kucoinPrice}) is the same as Gate.io price (${gateIoPrice}).`);
        }
    } catch (error) {
        console.error('Error fetching prices:', error);
        bot.sendMessage(chatId, 'Error fetching prices. Please try again later.');
    }
});

bot.onText(/\/currencies/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Fetch currency list from KuCoin
        const currencies = await getCurrencies();
        
        // Check if currencies were fetched successfully
        if (currencies) {
            // Format the currency list for display
            const formattedCurrencies = currencies.map(currency => `${currency.currency} (${currency.fullName})`).join('\n');
            
            // Send the formatted currency list as a message
            bot.sendMessage(chatId, `List of currencies on KuCoin:\n${formattedCurrencies}`);
        } else {
            bot.sendMessage(chatId, 'Failed to fetch currency list from KuCoin. Please try again later.');
        }
    } catch (error) {
        console.error('Error handling /currencies command:', error);
        bot.sendMessage(chatId, 'Error fetching currency list. Please try again later.');
    }
});
