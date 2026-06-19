exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    let prompt, width, height;

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      prompt = body.prompt;
      const ratio = body.ratio || "16:9";
      if (ratio === "1:1")       { width = 1024; height = 1024; }
      else if (ratio === "9:16") { width = 720;  height = 1280; }
      else if (ratio === "4:5")  { width = 1024; height = 1280; }
      else                        { width = 1280; height = 720;  }
    } else {
      prompt = event.queryStringParameters?.prompt;
      width  = parseInt(event.queryStringParameters?.width  || "1280");
      height = parseInt(event.queryStringParameters?.height || "720");
    }

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing prompt" }) };
    }

    const seed = Math.floor(Math.random() * 999999);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${seed}&enhance=true`;

    // Fetch the actual image and return it directly — avoids CORS issues
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error("Image generation failed. Try a different prompt.");

    const imgBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(imgBuffer).toString("base64");
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": contentType,
        "X-Image-Width": String(width),
        "X-Image-Height": String(height),
      },
      body: base64,
      isBase64Encoded: true,
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
