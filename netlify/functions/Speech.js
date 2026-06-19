exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const text  = event.queryStringParameters?.text;
  const voice = event.queryStringParameters?.voice || "Brian";

  if (!text) {
    return { statusCode: 400, headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ error: "Missing text parameter" }) };
  }

  try {
    const url = `https://api.streamelements.com/kappa/v2/speech?voice=${encodeURIComponent(voice)}&text=${encodeURIComponent(text)}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`StreamElements returned ${res.status}`);

    const audioBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(audioBuffer).toString("base64");

    return {
      statusCode: 200,
      headers: {
        ...headers,
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="speech.mp3"`,
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
