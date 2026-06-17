
exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json"
  };

  const videoUrl = event.queryStringParameters && event.queryStringParameters.url;

  if (!videoUrl) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing 'url' parameter" })
    };
  }

  try {
    const apiUrl = `https://ahm7xmakki.com/api/alldl?url=${encodeURIComponent(videoUrl)}`;
    const response = await fetch(apiUrl);
    const text = await response.text();

    return {
      statusCode: response.status,
      headers,
      body: text
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Could not reach the video service", details: err.message })
    };
  }
};
