import { createRequire } from "module";
const require = createRequire(import.meta.url);
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;
defaultClient.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;
const api = new SibApiV3Sdk.TransactionalEmailsApi();

export const sendContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "All fields are required" });

    const ADMIN = process.env.ADMIN_EMAIL;

    // Email to admin
    await api.sendTransacEmail({
      subject:     `New Contact: ${name} — InteriorAI`,
      sender:      { name: "InteriorAI Contact", email: ADMIN },
      to:          [{ email: ADMIN }],
      replyTo:     { email, name },
      htmlContent: `<div style="font-family:Arial,sans-serif;padding:30px;max-width:600px">
        <h2 style="color:#7c3aed">New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> <a href="mailto:${email}">${email}</a></p>
        <p><b>Message:</b></p>
        <p style="background:#f5f3ff;padding:16px;border-radius:8px">${message.replace(/\n/g,"<br>")}</p>
      </div>`,
    });

    // Auto-reply to user
    await api.sendTransacEmail({
      subject:     "Thanks for contacting InteriorAI",
      sender:      { name: "InteriorAI Support", email: ADMIN },
      to:          [{ email, name }],
      htmlContent: `<div style="font-family:Arial,sans-serif;padding:30px;max-width:600px">
        <h2 style="color:#7c3aed">Hello ${name}! 👋</h2>
        <p>Thank you for contacting <b>InteriorAI</b>. We've received your message and will get back to you within 24 hours.</p>
        <div style="background:#f5f3ff;padding:16px;border-radius:8px;margin:16px 0">
          <b>Your message:</b><br><br>${message.replace(/\n/g,"<br>")}
        </div>
        <p>Best regards,<br><b>InteriorAI Team</b></p>
      </div>`,
    });

    res.json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("sendContact error:", err.message);
    res.status(500).json({ message: "Failed to send email. Please try again." });
  }
};
