exports.handler = async (event) => {
  const { prompt, ratio } = JSON.parse(event.body);
  
  try {
    // Convert ratio to dimensions
    let width = 1024;
    let height = 1024;
    
    if (ratio === '16:9') {
      width = 1280;
      height = 720;
    } else if (ratio === '9:16') {
      width = 720;
      height = 1280;
    } else if (ratio === '4:5') {
      width = 800;
      height = 1000;
    }
    
    // Pollinations AI endpoint (FREE, no key needed)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&nologo=true`;
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        imageUrl: imageUrl
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        success: false 
      })
    };
  }
};
