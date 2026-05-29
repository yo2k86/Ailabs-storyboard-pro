export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } }, // Limit lebih besar karena frame video lumayan berat
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY belum disetting' });

    const { image, motionPrompt, engine } = req.body;
    
    // MENGGUNAKAN MODEL PUBLIK YANG DIJAMIN TERSEDIA
    let modelName = "veo-2.0-generate-001"; // Engine Veo
    if (engine === "Gemini Omni") modelName = "gemini-1.5-flash"; // Fallback ke model paling aman

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const apiPayload = {
        contents: [
            {
                parts: [
                    { text: motionPrompt },
                    { 
                        inlineData: { 
                            mimeType: "image/png", 
                            data: image.split(',')[1] // Menghilangkan tulisan "data:image/png;base64,"
                        } 
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(apiPayload)
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Google Video API Error');

        res.status(200).json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
}
