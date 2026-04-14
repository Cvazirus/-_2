export const sendTelegramMessage = async (text: string) => {
  const token = localStorage.getItem('tg_bot_token');
  const chatId = localStorage.getItem('tg_chat_id');

  if (!token || !chatId) {
    console.warn('Telegram credentials not set');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${response.statusText}`);
    }
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
};
