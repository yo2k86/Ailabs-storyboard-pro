export const config = {
    api: { bodyParser: { sizeLimit: '4mb' } },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY belum disetting di Environment Variables Vercel' });

    // KITA KUNCI DI MODEL PALING AMAN DAN PASTI JALAN: gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body) 
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Google API Error');

        res.status(200).json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
}

Jika kamu mengalami error yang mirip pada saat melakukan **Generate Image**, silakan ubah juga kata-kata model di `api/generate-image.js` menjadi `gemini-1.5-flash`.

Simpan file tersebut dan jangan lupa lakukan **Redeploy** di Vercel ya boss, agar server membaca model `1.5-flash` yang baru! 🚀
