export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // Limit lebih besar untuk mengirim gambar awal resolusi tinggi
        },
        // responseLimit: false, // Opsional jika ukuran video balasan sangat besar
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY belum disetting' });
    }

    const { image, motionPrompt, engine } = req.body;

    // Menyesuaikan nama model API Google berdasarkan pilihan Engine di UI
    // (Nama model bisa disesuaikan dengan dokumentasi Google Veo/Omni terbaru)
    const modelName = engine === 'Gemini Omni' 
        ? 'gemini-omni-video-preview' 
        : 'veo-3-lite-preview';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    try {
        // Hapus prefix "data:image/png;base64," jika ada, ambil murni base64-nya
        const base64Data = image.includes(',') ? image.split(',')[1] : image;
        const mimeType = image.substring(image.indexOf(':') + 1, image.indexOf(';')) || 'image/png';

        const payload = {
            contents: [{
                parts: [
                    { text: `Create a highly realistic cinematic video based on this exact starting frame. Motion instruction: ${motionPrompt}. Keep lighting and aesthetic consistent.` },
                    { inlineData: { mimeType: mimeType, data: base64Data } }
                ]
            }],
            generationConfig: {
                // Konfigurasi ini mengikuti standar API Google
                responseModalities: ['VIDEO'], 
            }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Google Video API Error');
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Backend Video Error:', error);
        res.status(500).json({ error: error.message });
    }
}
