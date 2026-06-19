exports.handler = async (event) => {
  const text = event.queryStringParameters?.text || '';
  const voice = event.queryStringParameters?.voice || 'en-US';

  if (!text) {
    return { 
      statusCode: 400, 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'No text provided' }) 
    };
  }

  try {
    // Use POST request instead of GET
    const response = await fetch('https://ahm7xmakki.com/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      },
      body: JSON.stringify({
        text: text,
        voice: voice
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
