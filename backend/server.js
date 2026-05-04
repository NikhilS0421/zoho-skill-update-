const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const nodemailer = require("nodemailer");
const { getAccessToken } = require("./zohoService");

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(cors({
  origin: "https://zoho-skill-update.vercel.app",
  credentials: true
}));

app.use(express.json());

/* ---------- LOGGER ---------- */
app.use((req, res, next) => {
  const start = Date.now();

  console.log("\n========== REQUEST ==========");
  console.log("Time:", new Date().toISOString());
  console.log("Method:", req.method);
  console.log("URL:", req.originalUrl);
  console.log("Body:", req.body);

  res.on("finish", () => {
    console.log("========== RESPONSE ==========");
    console.log("Status:", res.statusCode);
    console.log("Time:", Date.now() - start + "ms");
    console.log("================================\n");
  });

  next();
});

/* ---------- OTP STORE ---------- */
const otpStore = {};

/* ---------- EMAIL SETUP ---------- */
// Updated to a more robust configuration to prevent ETIMEDOUT on Render
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  // Force IPv4
  connection: {
    family: 4  // Force IPv4
  }
});

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.json({ message: "Backend running ✅" });
});

/* ---------- SEND OTP ---------- */
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: "Email required",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);
  otpStore[email] = otp;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification",
      text: `Your OTP is ${otp}`,
    });

    console.log("OTP sent to:", email);

    res.json({ success: true });
  } catch (err) {
    console.error("CRITICAL EMAIL ERROR:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ---------- FETCH CONTACT ---------- */
app.post("/contact", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP required",
      });
    }

    if (otpStore[email] != otp) {
      return res.status(401).json({
        success: false,
        error: "Invalid OTP",
      });
    }

    delete otpStore[email];

    const token = await getAccessToken();

    const response = await axios.get(
      `https://www.zohoapis.com/crm/v2/Contacts/search?email=${email}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
      }
    );

    if (!response.data.data || response.data.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No contact found",
      });
    }

    res.json({
      success: true,
      data: response.data.data[0],
    });

  } catch (err) {
    console.error("Fetch error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "Fetch failed",
    });
  }
});

/* ---------- UPDATE CONTACT ---------- */
app.put("/contact", async (req, res) => {
  try {
    const { id, data } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "ID required",
      });
    }

    const token = await getAccessToken();

    const response = await axios.put(
      "https://www.zohoapis.com/crm/v2/Contacts",
      {
        data: [{ id, ...data }],
      },
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
      }
    );

    res.json({
      success: true,
      data: response.data,
    });

  } catch (err) {
    console.error("Update error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "Update failed",
    });
  }
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});