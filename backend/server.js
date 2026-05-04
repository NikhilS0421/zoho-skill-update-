const express = require("express");
const cors = require("cors");
const axios = require("axios");
const dns = require('dns');
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

/* ---------- EMAIL SETUP - FORCE IPv4 ---------- */
// This is the correct way to force IPv4
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  },
  logger: true,
  debug: true // Enable debug logs
});

// Verify connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error('❌ SMTP connection error:', error.message);
  } else {
    console.log('✅ SMTP server is ready to take our messages');
  }
});

/* ---------- HEALTH CHECK ---------- */
app.get("/", (req, res) => {
  res.json({ 
    message: "Backend running ✅",
    emailConfigured: !!process.env.EMAIL_USER,
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
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
  otpStore[email] = {
    otp: otp,
    timestamp: Date.now(),
    attempts: 0
  };

  try {
    console.log(`📧 Attempting to send OTP to: ${email}`);
    
    const mailOptions = {
      from: `"Zoho Skill Update" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email Verification</h2>
          <p>Your OTP verification code is:</p>
          <h1 style="color: #4CAF50; font-size: 48px; letter-spacing: 5px;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ OTP sent successfully to:", email);
    console.log("Message ID:", info.messageId);

    res.json({ 
      success: true,
      message: "OTP sent successfully"
    });
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    
    // Remove OTP from store if sending failed
    delete otpStore[email];
    
    // More detailed error response
    let errorMessage = "Failed to send OTP. Please try again.";
    if (err.code === 'ENETUNREACH') {
      errorMessage = "Network connectivity issue. Please try again later.";
    } else if (err.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please contact support.";
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage,
      code: err.code
    });
  }
});

/* ---------- VERIFY OTP ---------- */
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: "Email and OTP required",
    });
  }

  const storedData = otpStore[email];
  
  if (!storedData) {
    return res.status(401).json({
      success: false,
      error: "No OTP found. Please request a new one.",
    });
  }

  // Check if OTP has expired (10 minutes)
  if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
    delete otpStore[email];
    return res.status(401).json({
      success: false,
      error: "OTP has expired. Please request a new one.",
    });
  }

  // Check attempts
  if (storedData.attempts >= 3) {
    delete otpStore[email];
    return res.status(401).json({
      success: false,
      error: "Too many attempts. Please request a new OTP.",
    });
  }

  storedData.attempts += 1;

  if (storedData.otp != otp) {
    return res.status(401).json({
      success: false,
      error: "Invalid OTP. Please try again.",
      attemptsLeft: 3 - storedData.attempts
    });
  }

  // OTP verified successfully
  delete otpStore[email];

  res.json({
    success: true,
    message: "OTP verified successfully"
  });
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

    // Verify OTP first
    const storedData = otpStore[email];
    if (!storedData || storedData.otp != otp) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired OTP",
      });
    }

    // Don't delete OTP yet - keep it for retries
    // delete otpStore[email]; // Removed this line

    const token = await getAccessToken();

    const response = await axios.get(
      `https://www.zohoapis.com/crm/v2/Contacts/search?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
        },
        timeout: 10000
      }
    );

    if (!response.data.data || response.data.data.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No contact found with this email",
      });
    }

    // Now delete OTP after successful fetch
    delete otpStore[email];

    res.json({
      success: true,
      data: response.data.data[0],
    });

  } catch (err) {
    console.error("Fetch error:", err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contact details",
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
        error: "Contact ID required",
      });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Update data required",
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
          'Content-Type': 'application/json'
        },
        timeout: 10000
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
      error: "Failed to update contact",
    });
  }
});

/* ---------- ERROR HANDLING MIDDLEWARE ---------- */
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 9000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🟢 Node.js version: ${process.version}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing gracefully...');
  transporter.close();
  process.exit(0);
});