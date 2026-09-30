const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// متغیر کلید هوش مصنوعی از تنظیمات سرور
const API_KEY = process.env.AVALAI_API_KEY;

// ۱. ارسال پیام به هوش مصنوعی
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'پیامی ارسال نشده است.' });
    }

    const response = await fetch('https://api.avalai.ir/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'شما یک دستیار هوشمند، مودب و مسلط به زبان فارسی هستید.' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      res.json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'پاسخی از هوش مصنوعی دریافت نشد.' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'خطای داخلی سرور' });
  }
});

// ۲. صفحه اصلی سوپر اپلیکیشن (UI لانچر و چت‌بات)
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سوپر اپلیکیشن ابری</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: Tahoma, sans-serif; }
    body { background: #0f172a; color: #f8fafc; display: flex; flex-direction: column; height: 100vh; }
    header { background: #1e293b; padding: 15px; text-align: center; font-size: 1.2rem; font-weight: bold; border-bottom: 1px solid #334155; }
    
    .apps-bar { display: flex; justify-content: space-around; background: #1e293b; padding: 12px 10px; border-bottom: 1px solid #334155; }
    .app-btn { display: flex; flex-direction: column; align-items: center; text-decoration: none; color: #f8fafc; font-size: 0.8rem; }
    .app-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 4px; font-size: 1.1rem; }
    .rubika { background: #7c3aed; }
    .eitaa { background: #ea580c; }
    .bale { background: #16a34a; }
    .soroush { background: #0284c7; }

    .chat-container { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 10px; }
    .msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; line-height: 1.5; font-size: 0.95rem; }
    .msg.user { background: #2563eb; align-self: flex-start; border-bottom-right-radius: 2px; }
    .msg.bot { background: #334155; align-self: flex-end; border-bottom-left-radius: 2px; }

    .input-box { display: flex; padding: 12px; background: #1e293b; border-top: 1px solid #334155; gap: 8px; }
    input { flex: 1; background: #0f172a; border: 1px solid #475569; border-radius: 8px; color: #fff; padding: 10px 14px; font-size: 1rem; outline: none; }
    button { background: #2563eb; border: none; color: white; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer; }
    button:hover { background: #1d4ed8; }
  </style>
</head>
<body>

  <header>✨ سوپر اپلیکیشن هوشمند</header>

  <!-- دکمه‌های پرش مستقیم به پیام‌رسان‌ها -->
  <div class="apps-bar">
    <a href="rubika://" class="app-btn">
      <div class="app-icon rubika">ر</div>
      <span>روبیکا</span>
    </a>
    <a href="eitaa://" class="app-btn">
      <div class="app-icon eitaa">ای</div>
      <span>ایتا</span>
    </a>
    <a href="bale://" class="app-btn">
      <div class="app-icon bale">ب</div>
      <span>بله</span>
    </a>
    <a href="soroush://" class="app-btn">
      <div class="app-icon soroush">س</div>
      <span>سروش</span>
    </a>
  </div>

  <!-- بخش پیام‌ها -->
  <div class="chat-container" id="chat">
    <div class="msg bot">سلام! من دستیار هوش مصنوعی شما هستم. چطور می‌تونم کمکتون کنم؟</div>
  </div>

  <!-- فرم ارسال -->
  <div class="input-box">
    <input type="text" id="userInput" placeholder="پیام خود را بنویسید..." onkeydown="if(event.key==='Enter') sendMsg()">
    <button onclick="sendMsg()">ارسال</button>
  </div>

  <script>
    async function sendMsg() {
      const input = document.getElementById('userInput');
      const chat = document.getElementById('chat');
      const text = input.value.trim();
      if (!text) return;

      // نمایش پیام کاربر
      chat.innerHTML += '<div class="msg user">' + text + '</div>';
      input.value = '';
      chat.scrollTop = chat.scrollHeight;

      // پیام در حال پاسخ...
      const loadingId = 'loading-' + Date.now();
      chat.innerHTML += '<div class="msg bot" id="' + loadingId + '">در حال نوشتن پاسخ... ⏳</div>';
      chat.scrollTop = chat.scrollHeight;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        const loadElem = document.getElementById(loadingId);
        if (loadElem) {
          loadElem.innerText = data.reply || data.error || 'خطایی رخ داد';
        }
      } catch (err) {
        const loadElem = document.getElementById(loadingId);
        if (loadElem) {
          loadElem.innerText = 'ارتباط با سرور برقرار نشد.';
        }
      }
      chat.scrollTop = chat.scrollHeight;
    }
  </script>
</body>
</html>
  `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
