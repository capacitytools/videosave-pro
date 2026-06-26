export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Video URL is required' });
  }

  try {
    // This runs on Vercel's server, so there are NO CORS restrictions!
    const response = await fetch(`https://ahm7xmakki.com/api/alldl?url=${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Downloader Error:', error);
    return res.status(500).json({ error: 'Failed to fetch video. It may be private or unsupported.' });
  }
}
