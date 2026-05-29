export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mengambil API Key dari Environment Variable Vercel
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY belum dikonfigurasi di Vercel.' });
  }

  // Menggunakan DeepSeek V4 Flash sebagai default jika OPENROUTER_MODEL tidak diset di Vercel
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-v4-flash:free';

  try {
    // Menangkap data dari frontend (index.html)
    const { prompt, systemInstruction } = req.body;

    // Memanggil API OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://ai-storyboard.vercel.app', // Bebas, info untuk OpenRouter
        'X-Title': 'AI Storyboard App',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: prompt }
        ],
        // DeepSeek mensupport mode JSON untuk memastikan outputnya bisa dibaca sistem
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gagal menghubungi OpenRouter API');
    }

    const data = await response.json();
    const textResponse = data.choices[0].message.content;

    // Mengembalikan hasil teks ke frontend
    res.status(200).json({ text: textResponse });

  } catch (error) {
    console.error('Backend Error:', error);
    res.status(500).json({ error: error.message });
  }
}
