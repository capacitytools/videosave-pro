export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { text, voice = 'Brian' } = req.query;
  if (!text) { res.status(400).json({ error: 'Missing text parameter' }); return; }

  // Limit text length to avoid timeouts
  const safeText = text.substring(0, 500);

  try {
    // Primary: StreamElements (Microsoft Neural voices, no API key)
    const seUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(safeText)}`;
    const seRes = await fetch(seUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'audio/mpeg' }
    });

    if (seRes.ok && seRes.headers.get('content-type')?.includes('audio')) {
      const buffer = await seRes.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
      res.status(200).send(Buffer.from(buffer));
      return;
    }

    // Fallback: TikTok TTS (free, no key, high quality)
    const tiktokUrl = `https://tiktok-tts.weilbyte.dev/api/generate`;
    const tiktokRes = await fetch(tiktokUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: safeText, voice: 'en_us_006' })
    });

    if (tiktokRes.ok) {
      const tdata = await tiktokRes.json();
      if (tdata.data) {
        const audioBuffer = Buffer.from(tdata.data, 'base64');
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
        res.status(200).send(audioBuffer);
        return;
      }
    }

    throw new Error('All TTS providers failed. Please try again.');

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
