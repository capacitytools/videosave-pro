exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const text = event.queryStringParameters?.text || '';
  const voice = event.queryStringParameters?.voice || 'Brian';

  if (!text) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No text provided' })
    };
  }

  try {
    // Call the ahm7xmakki API
    const url = `https://ahm7xmakki.com/api/tts?text=${encodeURIComponent(text)}&voice=${encodeURIComponent(voice)}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    // Check if the API returns a JSON with a URL, or the Audio file directly
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        const audioUrl = data.url || data.audioUrl || data.download_url;
        if (audioUrl) {
            return {
                statusCode: 200,
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioUrl: audioUrl })
            };
        }
        throw new Error('API returned JSON but no audio URL found');
    } else {
        // It's audio directly
        const audioBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(audioBuffer).toString('base64');

        return {
            statusCode: 200,
            headers: {
                ...headers,
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString()
            },
            body: base64,
            isBase64Encoded: true
        };
    }

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};      'Referer': 'https://ttsmp3.com/'
    }
  });
  
  if (!response.ok) throw new Error('TTSMP3 failed');
  return await response.arrayBuffer();
}

// API 2: VoiceRSS (FREE with API key - get one at voicer.org)
async function voiceRSS(text, voice) {
  const apiKey = 'YOUR_VOICERSS_API_KEY'; // Get free at https://www.voicer.org/
  const url = `https://api.voicerss.org/?key=${apiKey}&hl=${voice}&src=${encodeURIComponent(text)}&c=mp3&f=16khz_16bit_stereo`;
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('VoiceRSS failed');
  return await response.arrayBuffer();
}

// API 3: MyInstantiator (FREE)
async function myInstantiator(text, voice) {
  const url = `https://api.myinstanator.com/?text=${encodeURIComponent(text)}&lang=${voice}&format=mp3`;
  
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  
  if (!response.ok) throw new Error('MyInstantiator failed');
  return await response.arrayBuffer();
}

function createAudioResponse(buffer, headers) {
  const base64 = Buffer.from(buffer).toString('base64');
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Content-Type': 'audio/mpeg',
      'Content-Length': buffer.byteLength.toString()
    },    body: base64,
    isBase64Encoded: true
  };
}
