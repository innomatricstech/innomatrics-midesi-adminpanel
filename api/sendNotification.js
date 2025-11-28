import axios from "axios";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST allowed" });
    }

    const { title, body, fcmToken, screen } = req.body || {};

    if (!title || !body || !fcmToken) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    const response = await axios.post(
      "https://mi-desi-notification-service.vercel.app/api/sendNotification",
      { title, body, fcmToken, screen },
      { timeout: 8000 }
    );

    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
