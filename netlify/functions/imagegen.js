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

    // Confirm the image is reachable
    const check = await fetch(imageUrl, { method: "HEAD" });
    if (!check.ok) throw new Error("Image generation failed. Try a different prompt.");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ imageUrl, seed, width, height }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
