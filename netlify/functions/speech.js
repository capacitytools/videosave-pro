exports.handler = async (event) => {
  const text = event.queryStringParameters?.text || '';
  const voice = event.queryStringParameters?.voice || 'Matthew';

  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No text provided' }) };
  }

  try {
    // TTSMP3.com - FREE, unlimited, no auth needed
    const url = `https://api.ttsmp3.com/makemp3_new?voice=${voice}&text=${encodeURIComponent(text)}&source=aws_polly`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://ttsmp3.com/'
      }
    });

    if (!response.ok) throw new Error('TTS service failed');

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': arrayBuffer.byteLength.toString()
      },
      body: base64Audio,
      isBase64Encoded: true
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
