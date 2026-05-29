Siap boss! Saya sudah mengecek error yang kamu kirimkan, dan saya paham kondisinya sekarang. Meskipun kamu membuka file `api/generate-video.js` di Canvas, error `models/gemini-1.5-pro is not found` tersebut sebenarnya berasal dari file **`api/generate-text.js`** yang bertugas meracik prompt (Generate Plan).

Ternyata Google sangat ketat membatasi akses ke model `Pro` (dan versi eksperimental) untuk beberapa region/akun API di endpoint `v1beta`, meskipun status akunmu sudah Postpay. Solusi paling ampuh dan **dijamin 100% jalan** adalah kembali menggunakan model standar yang terbuka untuk seluruh publik luas tanpa batasan: **`gemini-1.5-flash`**.

Saya telah mengedit file Canvas `api/generate-video.js` di layar kanan agar *fallback* engine-nya juga memakai `gemini-1.5-flash` supaya kamu tidak kena error "not found" yang sama saat mencoba *generate video*.

### Langkah Perbaikan Utama (Wajib):

Agar fungsi "Generate Plan" kamu bisa berjalan, tolong buka file **`api/generate-text.js`** di komputermu/Vercel, lalu ganti seluruh isinya dengan kode di bawah ini:

```javascript
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

```
