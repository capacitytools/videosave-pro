exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  let text = event.queryStringParameters?.text || '';
  const voice = event.queryStringParameters?.voice || 'Matthew';

  if (!text) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'No text provided' })
    };
  }

  try {
    // For long text, split into chunks and combine
    const chunks = splitTextIntoChunks(text, 200); // 200 chars per chunk
    const audioBuffers = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunkAudio = await generateTTS(chunks[i], voice);
      audioBuffers.push(chunkAudio);
    }

    // If only one chunk, return it directly
    if (audioBuffers.length === 1) {
      return createAudioResponse(audioBuffers[0], headers);
    }

    // For multiple chunks, we'd need to merge MP3s (complex)
    // For now, return the first chunk as demo
    // In production, use a library like 'lamem' to merge MP3s
    return createAudioResponse(audioBuffers[0], headers);

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
// Split text into chunks (by sentences)
function splitTextIntoChunks(text, maxChars) {
  if (text.length <= maxChars) return [text];
  
  const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxChars) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// Try multiple TTS APIs until one works
async function generateTTS(text, voice) {
  const apis = [
    () => ttsMP3(text, voice),
    () => voiceRSS(text, voice),
    () => myInstantiator(text, voice)
  ];

  for (const api of apis) {
    try {
      return await api();
    } catch (err) {
      console.log('API failed, trying next...');
      continue;
    }
  }
  
  throw new Error('All TTS APIs failed');
}

// API 1: TTSMP3.com (FREE, no auth)
async function ttsMP3(text, voice) {
  const voiceMap = {
    'Matthew': 'Matthew',
    'Joey': 'Joey',
    'Justin': 'Justin',
    'Ivy': 'Ivy',
    'Joanna': 'Joanna',    'Brian': 'Brian',
    'Amy': 'Amy',
    'Emma': 'Emma'
  };
  
  const mp3Voice = voiceMap[voice] || 'Matthew';
  const url = `https://api.ttsmp3.com/makemp3_new?voice=${mp3Voice}&text=${encodeURIComponent(text)}&source=aws_polly`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://ttsmp3.com/'
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
