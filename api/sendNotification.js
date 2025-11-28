import https from "https";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Only POST allowed");
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", () => {
    try {
      const data = JSON.parse(body || "{}");
      const { title, body: message, fcmToken, screen } = data;

      if (!title || !message || !fcmToken) {
        res.statusCode = 400;
        return res.end("Missing required fields");
      }

      const payload = JSON.stringify({
        title,
        body: message,
        fcmToken,
        screen
      });

      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload)
        }
      };

      const proxyReq = https.request(
        "https://mi-desi-notification-service.vercel.app/api/sendNotification",
        options,
        proxyRes => {
          let responseData = "";

          proxyRes.on("data", chunk => responseData += chunk);
          proxyRes.on("end", () => {
            res.statusCode = proxyRes.statusCode || 200;
            res.setHeader("Content-Type", "application/json");
            res.end(responseData);
          });
        }
      );

      proxyReq.on("error", err => {
        console.error("Proxy error:", err);
        res.statusCode = 500;
        res.end("Proxy failed");
      });

      proxyReq.write(payload);
      proxyReq.end();

    } catch (error) {
      console.error("Parse Error:", error);
      res.statusCode = 500;
      res.end("Invalid JSON");
    }
  });
}
