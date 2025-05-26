import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import fetch from 'node-fetch';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/ai', async (req, res) => {
  const prompt = req.body.prompt || 'Say hello from Gemini';

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyBHw88LT-90F1EU_9Od6l149Zli29J6iEg`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      res.json({ text: reply });
    } else {
      console.error('Gemini API error:', data);
      res.status(500).json({ error: data.error?.message || 'Gemini API error' });
    }
  } catch (error) {
    console.error('Request failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

