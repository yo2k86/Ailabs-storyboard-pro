export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY belum disetting di Vercel' });

    try {
        // 1. Mengambil teks prompt dari payload Frontend
        const parts = req.body.contents?.[0]?.parts || [];
        const textPart = parts.find(p => p.text);
        if (!textPart) throw new Error("Prompt teks tidak ditemukan");
        
        let promptText = textPart.text;

        // 2. Deteksi otomatis Aspect Ratio dari prompt
        let aspectRatio = "16:9";
        if (promptText.includes("9:16")) aspectRatio = "9:16";
        else if (promptText.includes("1:1")) aspectRatio = "1:1";

        // 3. Payload khusus untuk Model Google Imagen 3
        const imagenPayload = {
            instances: [
                { prompt: promptText }
            ],
            parameters: {
                sampleCount: 1,
                aspectRatio: aspectRatio
            }
        };

        // Menggunakan Endpoint khusus IMAGEN 3 dari Google AI Studio
        const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(imagenPayload)
        });
        
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error?.message || 'Google Imagen API Error');

        // 4. Ekstrak gambar base64 dari Imagen 3
        const base64Data = data.predictions?.[0]?.bytesBase64Encoded;
        if (!base64Data) throw new Error("Tidak ada gambar yang dikembalikan oleh API");

        // 5. Kembalikan data dengan format yang sama persis seperti yang diharapkan App.jsx
        const frontendResponse = {
            candidates: [
                {
                    content: {
                        parts: [
                            {
                                inlineData: {
                                    mimeType: "image/png",
                                    data: base64Data
                                }
                            }
                        ]
                    }
                }
            ]
        };

        res.status(200).json(frontendResponse);
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
}
