import https from "https";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.statusCode = 405;
      return res.end("Only POST allowed");
    }

    let body = "";

    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
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

        const request = https.request(
          "https://mi-desi-notification-service.vercel.app/api/sendNotification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload)
            }
          },
          response => {
            let result = "";
            response.on("data", chunk => result += chunk);
            response.on("end", () => {
              res.statusCode = response.statusCode || 200;
              res.setHeader("Content-Type", "application/json");
              res.end(result);
            });
          }
        );

        request.on("error", err => {
          console.error("Forwarding failed:", err);
          res.statusCode = 500;
          res.end("Proxy failed");
        });

        request.write(payload);
        request.end();

      } catch (err) {
        res.statusCode = 500;
        res.end("Invalid JSON");
      }
    });

  } catch (error) {
    res.statusCode = 500;
    res.end("Server error: " + error.message);
  }
}
git add api\sendNotification.js