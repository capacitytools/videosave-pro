module.exports = async function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { text, voice = 'Brian' } = req.query;
  if (!text) { res.status(400).json({ error: 'Missing text' }); return; }

  const safeText = text.substring(0, 500);

  try {
    const seUrl = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(safeText)}`;
    const seRes = await fetch(seUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'audio/mpeg' }
    });

    if (seRes.ok) {
      const buffer = await seRes.arrayBuffer();
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
      res.status(200).send(Buffer.from(buffer));
      return;
    }

    throw new Error('TTS provider failed. Please try again.');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
