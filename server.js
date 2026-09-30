const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const AVALAI_API_KEY = process.env.AVALAI_API_KEY;
const TARGET_API_URL = 'https://api.avalai.ir/v1/chat/completions';

app.get('/', (req, res) => {
  res.send('Server is running smoothly!');
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model } = req.body;
    const response = await fetch(TARGET_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AVALAI_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: messages
      })
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
