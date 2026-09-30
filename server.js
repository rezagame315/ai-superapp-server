const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// کلید هوش مصنوعی
const API_KEY = process.env.AVALAI_API_KEY;

// ۱. ارسال پیام به هوش مصنوعی
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await fetch('https://api.avalai.ir/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'خطا در ارتباط با هوش مصنوعی' });
  }
});

// ۲. صفحه اصلی (UI)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سوپر اپلیکیشن ابری</title>
  <style>
    body { font-family: Tahoma, sans-serif; background: #0f172a; color: #fff; margin: 0; display: flex; flex-direction: column; height: 100vh; }
    header { background: #1e293b; padding: 15px; text-align: center; font-weight: bold; }
    .apps-bar { display: flex; justify-content: space-around; padding: 20px; background: #1e293b; border-bottom: 1px solid #334155; }
    .app-btn { text-align: center; text-decoration: none; color: white; font-size: 0.8rem; }
    .app-icon { width: 50px; height: 50px; border-radius: 12px; margin-bottom: 5px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; background: #334155; }
    .chat-container { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .msg { padding: 10px; border-radius: 10px; max-width: 80%; }
    .user { background: #2563eb; align-self: flex-end; }
    .bot { background: #334155; align-self: flex-start; }
    .input-box { display: flex; padding: 10px; gap: 5px; }
    input { flex: 1; padding: 10px; border-radius: 5px; border: none; }
    button { padding: 10px 20px; border-radius: 5px; background: #2563eb; color: white; border: none; }
  </style>
</head>
<body>
  <header>سوپر اپلیکیشن من</header>
  <div class="apps-bar">
    <a href="rubika://" class="app-btn"><div class="app-icon">ر</div>روبیکا</a>
    <a href="eitaa://" class="app-btn"><div class="app-icon">ای</div>ایتا</a>
  </div>
  <div class="chat-container" id="chat"><div class="msg bot">سلام! چطور کمکت کنم؟</div></div>
  <div class="input-box">
    <input type="text" id="userInput" placeholder="پیام...">
    <button onclick="sendMsg()">ارسال</button>
  </div>
  <script>
    async function sendMsg() {
      const input = document.getElementById('userInput');
      const chat = document.getElementById('chat');
      if(!input.value) return;
      chat.innerHTML += '<div class="msg user">' + input.value + '</div>';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.value })
      });
      const data = await res.json();
      chat.innerHTML += '<div class="msg bot">' + data.reply + '</div>';
      input.value = '';
    }
  </script>
</body>
</html>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
