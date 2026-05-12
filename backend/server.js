const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Resend } = require("resend");
require("dotenv").config();

// Ensure this file exists in your directory to handle Zoho OAuth
const { getAccessToken } = require("./zohoService");

const app = express();

// Initialize Resend with your API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json());

/* ---------- LOGGER MIDDLEWARE ---------- */
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Status: ${res.statusCode} | Duration: ${duration}ms`);
  });
  next();
});

/* ---------- OTP STORE ---------- */
const otpStore = {};

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.json({ message: "Backend is running and connected to Resend ✅" });
});

/* ---------- SEND OTP ---------- */
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: "Email required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Skill Portal <otp@support.datacouch.io>', 
      to: email,
      subject: "Your OTP Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p>Your one-time password (OTP) for the Instructor Skill Update portal is:</p>
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 4px;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #777; text-align: center;">This code will expire once used.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Sending Error:", error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

/* ---------- FETCH CONTACT ---------- */
app.post("/contact", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, error: "Email and OTP required" });
    }

    if (otpStore[email] != otp) {
      return res.status(401).json({ success: false, error: "Invalid OTP ❌" });
    }

    delete otpStore[email];

    const token = await getAccessToken();
    const response = await axios.get(
      `https://www.zohoapis.com/crm/v2/Contacts/search?email=${email}`,
      {
        headers: { Authorization: `Zoho-oauthtoken ${token}` },
      }
    );

    if (!response.data.data || response.data.data.length === 0) {
      return res.status(404).json({ success: false, error: "No contact found" });
    }

    res.json({ success: true, data: response.data.data[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: "Fetch failed" });
  }
});

/* ---------- UPDATE CONTACT ---------- */
app.put("/contact", async (req, res) => {
  try {
    const { id, data, userEmail, userName } = req.body;
    if (!id) return res.status(400).json({ success: false, error: "ID required" });

    const token = await getAccessToken();
    const response = await axios.put(
      "https://www.zohoapis.com/crm/v2/Contacts",
      { data: [{ id, ...data }] },
      { headers: { Authorization: `Zoho-oauthtoken ${token}` } }
    );

    const zohoResult = response.data?.data?.[0];
    if (zohoResult?.status === "error") {
      console.error("Zoho rejected update:", JSON.stringify(zohoResult));
      return res.status(400).json({ success: false, error: zohoResult.message || zohoResult.code });
    }

    // Send admin notification (fire-and-forget, don't block response)
    if (process.env.ADMIN_EMAIL) {
      const displayName = userName || userEmail || "Unknown";
      resend.emails.send({
        from: "Skill Portal <otp@support.datacouch.io>",
        to: process.env.ADMIN_EMAIL,
        subject: `Skill Update: ${displayName} updated their profile`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333;">Profile Updated</h2>
            <p><strong>${displayName}</strong> has just updated their instructor profile on the Skill Update Portal.</p>
            ${userEmail ? `<p>Email: ${userEmail}</p>` : ""}
            <p style="font-size: 12px; color: #777;">Submitted at: ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</p>
          </div>
        `,
      }).catch((err) => console.error("Admin notification failed:", err));
    }

    res.json({ success: true, data: response.data });
  } catch (err) {
    const zohoError = err.response?.data;
    console.error("Zoho update error:", JSON.stringify(zohoError || err.message));
    res.status(500).json({
      success: false,
      error: zohoError?.message || zohoError?.code || "Update failed",
    });
  }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`🚀 Server is active on port ${PORT}`);
});