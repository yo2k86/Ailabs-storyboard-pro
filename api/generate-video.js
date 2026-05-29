export const config = {
    api: { bodyParser: { sizeLimit: '10mb' } }, 
};

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY belum disetting' });

    const { image, motionPrompt, engine } = req.body;
    
    // KARENA API GOOGLE VEO / OMNI BELUM RILIS UNTUK PUBLIK (MASIH CLOSED PREVIEW),
    // KITA GUNAKAN MODE PROTOTIPE (MOCK) AGAR APLIKASI BISA BERJALAN MULUS SAAT DIPAMERKAN KE PUBLIK.
    
    try {
        // 1. Simulasi delay proses rendering AI (Tunggu 4 detik agar terlihat meyakinkan)
        await new Promise(resolve => setTimeout(resolve, 4000));

        // 2. Gunakan video cinematic gratis sebagai contoh output AI (Bisa kamu ganti URL-nya nanti)
        const dummyVideoUrl = "https://cdn.pixabay.com/video/2020/05/25/40140-424933013_tiny.mp4"; // Video horror/cinematic api

        // 3. Format kembalian yang persis sama dengan yang diharapkan oleh Frontend (App.jsx)
        const mockResult = {
            candidates: [
                {
                    content: {
                        parts: [
                            {
                                fileData: {
                                    fileUri: dummyVideoUrl
                                }
                            }
                        ]
                    }
                }
            ]
        };

        res.status(200).json(mockResult);
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
}
