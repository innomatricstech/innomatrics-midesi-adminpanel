const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const NOTIF_URL = "https://mi-desi-notification-service.vercel.app/api/sendNotification";

app.post("/sendNotificationProxy", async (req, res) => {
  try {
    const { title, body, fcmToken, screen, customerId, orderId, status } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ error: "Missing FCM token" });
    }

    const payload = { title, body, fcmToken, screen };

    const response = await fetch(NOTIF_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      return res.status(200).json({ success: true, data });
    }

    return res.status(400).json({ success: false, error: "Notification failed" });

  } catch (error) {
    console.error("Function error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

exports.api = functions.https.onRequest(app);
