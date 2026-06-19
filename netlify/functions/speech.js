exports.handler = async (event) => {
  const text = event.queryStringParameters?.text || '';
  const voice = event.queryStringParameters?.voice || 'en-US';

  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No text provided' }) };
  }

  try {
    // Call the exact ahm7xmakki API
    const url = `https://ahm7xmakki.com/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Get the MP3 binary data
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
