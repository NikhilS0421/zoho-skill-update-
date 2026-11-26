import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";
import logo from "./assets/Untitled design.svg";
import { requestJSON, normalizeProfile, validateField, EDITABLE_FIELDS, ARRAY_FIELDS } from "./formUtils";

/* CERT OPTIONS */
const CERT_OPTIONS = [
  "AWS Certified Advanced Networking – Specialty (ANS-C01)",
  "AWS Certified Cloud Practitioner (CLF-C01)",
  "AWS Certified Data Analytics – Specialty (DAS-C01)",
  "AWS Certified Database – Specialty (DBS-C01)",
  "AWS Certified DevOps Engineer – Professional (DOP-C01)",
  "AWS Certified Developer – Associate (DVA-C01)",
  "AWS Certified Machine Learning – Specialty (MLS-C01)",
  "AWS Certified SAP on AWS – Specialty (PAS-C01)",
  "AWS Certified Security – Specialty (SCS-C01)",
  "AWS Certified Solutions Architect – Associate (SAA-C03)",
  "AWS Certified Solutions Architect – Professional (SAP-C01)",
  "AWS Certified SysOps Administrator – Associate (SOA-C02)",

  "Certified Kubernetes Administrator (CKA)",
  "Certified Kubernetes Application Developer (CKAD)",
  "Certified Kubernetes Security Specialist (CKS)",
  "Kubernetes and Cloud Native Associate (KCNA)",

  "Google Associate Cloud Engineer",
  "Google Cloud Digital Leader",
  "Google Professional Cloud Architect",
  "Google Professional Cloud Database Engineer",
  "Google Professional Cloud DevOps Engineer",
  "Google Professional Cloud Developer",
  "Google Professional Cloud Network Engineer",
  "Google Professional Cloud Security Engineer",
  "Google Professional Data Engineer",
  "Google Professional Machine Learning Engineer",

  "VCTA - VMware Certified Technical Associate 2022",
  "VCP - VMware Certified Professional 2022",
  "VMware Certified Master Specialist - Cloud Native 2022",
  "VMware Certified Specialist - vSphere with Tanzu 2022",
  "VCTA - VMware Certified Technical Associate Security 2022",
  "VMware Certified Professional - Endpoint and Workload Security 2022",
  "VMware Carbon Black Cloud Audit and Remediation Skills 2022",
  "VMware Carbon Black Cloud Enterprise EDR Skills 2022",
  "VMware NSX-T Data Center Security 2022",
  "VMware Carbon Black Cloud Endpoint Standard Skills 2022",
  "VCAP - VMware Certified Advanced Professional 2022",
  "VCDX - VMware Certified Design Expert 2022",
  "VMware Specialist - Cloud Provider 2022",
  "VMware Specialist - vRealize Operations 2022",
  "VMware Specialist - Workspace ONE 21.X Advanced Integration 2022",
  "VMware Workspace ONE for macOS 2022",
  "VMware vRealize Operations - Cloud Management Automation 2022",
  "VMware Certified Implementation Expert - Desktop Management 2022",
  "VMware Certified Master Specialist - Digital Workspace 2022",
  "VMware Specialist - Workspace ONE 21.X UEM Troubleshooting 2022",
  "VMware Certified Implementation Expert - Cloud Management & Automation 2022",
  "VMware Telco Cloud NFV Skills 2022",
  "VMware Telco Cloud Practitioner Milestone 2022",
  "VMware CloudHealth Platform Administrator - Associate (Azure)",
  "VMware Telco Cloud Automation Skills 2022",
  "VMware Telco Cloud Platform Specialist Skills 2022",
  "VMware CloudHealth Platform Administrator - Associate (AWS)",
  "VMware SD-WAN Foundations 2022",
  "VMware SD-WAN Troubleshoot 2022",
  "VMware Master Specialist - SD-WAN 2022",
  "VMware Certified Implementation Expert - Network Virtualization 2022",
  "VMware SD-WAN Design and Deploy 2022",
  "VMware NSX Advanced Load Balancer (Avi) for Operators 2022",
  "VMware Certified Specialist - vSAN 2022",
  "Master Specialist - VMware Cloud on AWS 2022",
  "VMware Certified Master Specialist - HCI 2022",
  "VMware Certified Specialist - Cloud Foundation 2022",
  "VMware Certified Implementation Expert - Data Center Virtualization 2022",

  "Microsoft Certified: Azure Fundamentals",
  "Microsoft Certified: Azure Administrator Associate",
  "Microsoft Certified: Azure Developer Associate",
  "Microsoft Certified: Azure Solutions Architect Expert",
  "Microsoft Certified: Azure AI Engineer Associate",
  "Microsoft Certified: Azure Data Scientist Associate",
  "Microsoft Certified: Azure Security Engineer Associate",
  "Microsoft Certified: Azure DevOps Engineer Expert",
  "Microsoft Certified: Microsoft Azure IoT Developer Specialty",
  "Microsoft Certified: Dynamics 365 for Sales Functional Consultant Associate",
  "Microsoft Certified: Dynamics 365 for Customer Service Functional Consultant Associate",
  "Microsoft 365 Certified Fundamentals",
  "Microsoft 365 Certified: Messaging Administrator Associate",
  "Microsoft 365 Certified: Teamwork Administrator Associate",
  "Microsoft 365 Certified: Security Administrator Associate",
  "Microsoft 365 Certified: Enterprise Administrator",
  "Microsoft 365 Certified: Modern Desktop Administrator",

  "Oracle Certified Professional Oracle Linux 8 System Administrator certification",

  "CompTIA Linux+",
  "LPIC 1 – Linux Administrator",
  "LPIC 2 – Linux Engineer",
  "LPIC 3 – 300 – Linux Enterprise Professional Certification",
  "LFCS (Linux Foundation Certified System Administrator) certification",
  "LFCE (Linux Foundation Certified Engineer) certification",
  "RHCSA (Red Hat Certified System Administrator) certification",
  "RHCE (Red Hat Certified Engineer) certification",
  "RHCA (Red Hat Certified Architect) certification"
];

/* LANGUAGE OPTIONS */
const LANGUAGE_OPTIONS = [
  "Arabic",
  "Chinese - Mandarin",
  "Czech",
  "Dutch",
  "French",
  "German",
  "Indonesia Bahasa",
  "Italian",
  "Japanese",
  "Korean",
  "Malay Bahasa",
  "Portuguse",
  "Russian",
  "Serbian",
  "Spanish",
  "Thai",
];

/* BUSINESS DOMAIN OPTIONS */
const BUSINESS_DOMAIN_OPTIONS = [
  "Finance",
  "Insurance",
  "Banking",
  "Retail",
  "Fintech",
  "Manufacturing",
  "Telecommunications",
  "Healthcare, Life Sciences, & Pharma",
  "Energy (ONG)",
  "eCommerce",
  "Travel & Hospitality",
  "Education",
  "Technology",
  "Agriculture/Agritech",
  "Marketing/Sales",
  "CRM",
  "Automotive",
  "Real Estate/Construction",
  "Supply Chain",
  "Private Equity",
  "Others",
];

/* COUNTRY CODES */
const COUNTRY_CODES = [
  { code: "+91", label: "IND (+91)" },
  { code: "+1", label: "USA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+61", label: "AUS (+61)" },
  { code: "+65", label: "SGP (+65)" },
];

/* 🔥 ADDED: COUNTRY LIST */
const COUNTRY_LIST = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

function App() {
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));
  const [sessionToken, setSessionToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const sendingRef = useRef(false);
  const verifyingRef = useRef(false);
  const savingRef = useRef(false);
  const parsingRef = useRef(false);
  const authVersionRef = useRef(0);

  const [data, setData] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [fileName, setFileName] = useState("");

  const [isFetched, setIsFetched] = useState(false);
  const [hasResume, setHasResume] = useState(null);
  const [step, setStep] = useState("email"); // "email" | "otp"
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [notif, setNotif] = useState(null); // { message, type: "success"|"error" }

  const showNotif = (message, type = "success") => setNotif({ message, type });
  const closeNotif = useCallback(() => setNotif(null), []);

  /* ---------- OTP ---------- */
  const sendOTP = async () => {
    if (sendingRef.current || verifyingRef.current) return;
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showNotif("Please enter a valid email address.", "error");
      return;
    }
    sendingRef.current = true;
    setOtpLoading(true);
    try {
      await requestJSON("/send-otp", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      setEmail(normalizedEmail);
      setOtpDigits(Array(6).fill(""));
      setStep("otp");
      showNotif("Code sent. It expires in 10 minutes.");
    } catch (err) {
      showNotif(err.message, "error");
    } finally {
      sendingRef.current = false;
      setOtpLoading(false);
    }
  };

  const fetchData = async (otpValue) => {
    if (verifyingRef.current || !/^\d{6}$/.test(otpValue)) return;
    verifyingRef.current = true;
    const authVersion = authVersionRef.current;
    setVerifyLoading(true);
    try {
      const result = await requestJSON("/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpValue }),
      });
      if (authVersion !== authVersionRef.current) return;
      if (!result.data?.id || !result.sessionToken) throw new Error("Please verify again to start a secure session.");
      setData(normalizeProfile(result.data));
      setSessionToken(result.sessionToken);
      const sameContact = data?.id === result.data.id;
      if (!sameContact) {
        setEditedData({});
        setIsEditing(false);
        setFileName("");
        setHasResume(null);
      }
      setIsFetched(true);
      showNotif(`Welcome, ${result.data.First_Name || "Instructor"}! Please review and update your profile.`);
    } catch (err) {
      if (authVersion === authVersionRef.current) showNotif(err.message, "error");
    } finally {
      verifyingRef.current = false;
      setVerifyLoading(false);
    }
  };

  /* ---------- CV UPLOAD ---------- */
  const handleCVUpload = async (file) => {
    if (!file || parsingRef.current || savingRef.current) return;
    if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== "application/pdf")) {
      showNotif("Please choose a PDF file.", "error");
      return;
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      showNotif("Choose a PDF smaller than 10 MB.", "error");
      return;
    }
    parsingRef.current = true;
    setParsing(true);
    setFileName("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://n8n.datacouch.io/webhook/parse-cv",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      const raw = await res.text();

      if (!res.ok) {
        showNotif(`CV parser error (HTTP ${res.status}). Please try again.`, "error");
        return;
      }

      if (!raw || raw.trim() === "") {
        showNotif("No response from CV parser. Check the workflow is active.", "error");
        return;
      }

      let result = JSON.parse(raw);

      if (Array.isArray(result)) {
        result = result[0];
      }

      if (!result?.success || !result.data || typeof result.data !== "object" || Array.isArray(result.data)) {
        showNotif("Could not parse the CV. Please try a different file.", "error");
        return;
      }

      const parsed = { ...result.data };
      ARRAY_FIELDS.filter(key => key !== "Certification_s_Lists").forEach(key => {
        if (typeof parsed[key] === "string") parsed[key] = parsed[key].trim() ? [parsed[key].trim()] : [];
      });

      if (parsed.Certification_s_Lists && typeof parsed.Certification_s_Lists === "string") {
        parsed.Certification_s_Lists = parsed.Certification_s_Lists
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (!Array.isArray(parsed.Certification_s_Lists)) {
        parsed.Certification_s_Lists = [];
      }

      const basicInfoFields = [
        "First_Name", "Mobile", "Country_Code", "LinkedIn_URL",
        "US_Visa", "Business_Domain", "Country", "Mailing_State",
      ];

      const currentData = data || {};
      const mergedFields = {};

      Object.keys(parsed).filter(key => EDITABLE_FIELDS.includes(key)).forEach((key) => {
        const effective = editedData[key] !== undefined ? editedData[key] : currentData[key];
        const incoming = parsed[key];

        if (incoming === undefined || incoming === null) return;
        if (key === "US_Visa" && typeof incoming !== "boolean") return;
        if (ARRAY_FIELDS.includes(key) && (!Array.isArray(incoming) || incoming.some(v => typeof v !== "string"))) return;
        if (!ARRAY_FIELDS.includes(key) && key !== "US_Visa" && typeof incoming !== "string") return;
        if (key === "US_Visa") {
          if (effective == null || effective === "") mergedFields[key] = incoming;
          return;
        }

        if (basicInfoFields.includes(key)) {
          // For basic info: only fill if currently empty
          const isEmpty = effective == null || effective.toString().trim() === "" ||
            (Array.isArray(effective) && effective.length === 0);
          if (isEmpty) {
            mergedFields[key] = incoming;
          }
        } else if (Array.isArray(effective) || Array.isArray(incoming)) {
          const existingArr = Array.isArray(effective) ? effective : (effective ? [effective] : []);
          const incomingArr = Array.isArray(incoming) ? incoming : (incoming ? [incoming] : []);
          if (incomingArr.length > 0) {
            mergedFields[key] = [...new Set([...existingArr, ...incomingArr])];
          }
        } else {
          const incomingStr = incoming.toString().trim();
          if (incomingStr) {
            mergedFields[key] = incomingStr;
          }
        }
      });

      setEditedData((prev) => ({ ...prev, ...mergedFields }));
      setIsEditing(true);
      setFileName(file.name);

      showNotif("CV parsed successfully! Please review and save.", "success");

    } catch (err) {
      console.error(err);
      showNotif(err.name === "AbortError" ? "CV parsing timed out. Please try again." : "CV upload failed. Please try again.", "error");
    } finally {
      clearTimeout(timeout);
      parsingRef.current = false;
      setParsing(false);
    }
  };

  /* ---------- CHANGE ---------- */
  const handleChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ---------- UPDATE ---------- */
  const updateContact = async () => {
    if (savingRef.current || parsingRef.current) return;
    if (!sessionToken) {
      showNotif("Your session has ended. Reload and verify your email again.", "error");
      return;
    }
    const updates = { ...editedData };
    // Persist the displayed default whenever a new phone number is entered.
    if (updates.Mobile && !updates.Country_Code && !data.Country_Code) updates.Country_Code = "+91";
    for (const [key, value] of Object.entries(updates)) {
      const error = validateField(key, value);
      if (error) { showNotif(error, "error"); return; }
    }
    if (!Object.keys(updates).length) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await requestJSON("/contact", {
        method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: data.id, data: updates }),
      });
      setData(prev => ({ ...prev, ...updates }));
      setEditedData({});
      setIsEditing(false);
      showNotif("Thank you for updating your profile! You can see the updates here.");
    } catch (err) {
      if (err.status === 401) {
        setSessionToken("");
        setIsFetched(false);
        setStep("email");
        setOtpDigits(Array(6).fill(""));
      }
      showNotif(err.message, "error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <Notification notif={notif} onClose={closeNotif} />
      <div className="card">

        <div className="cardHeader">
          <img src={logo} alt="logo" className="logo" />
          <h2 className="title centeredTitle">Instructor Skill Update</h2>
        </div>

        <div className="cardBody">

          {!isFetched && step === "email" && (
            <div className="authStep">
              <p className="authSubtitle">Enter your email address to get started</p>
              <input
                className="input"
                placeholder="you@example.com"
                type="email"
                aria-label="Email address"
                disabled={otpLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendOTP()}
              />
              <button className="primaryBtn authBtn" onClick={sendOTP} disabled={otpLoading}>
                {otpLoading ? "Sending…" : "Next"}
              </button>
            </div>
          )}

          {!isFetched && step === "otp" && (
            <div className="authStep">
              <p className="authSubtitle">
                Enter the OTP sent to <strong>{email}</strong>
              </p>
              <div className="otpBoxes">
                {[0,1,2,3,4,5].map((i) => (
                  <input
                    key={i}
                    id={`otp-box-${i}`}
                    className="otpBox"
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`OTP digit ${i + 1}`}
                    value={otpDigits[i]}
                    autoFocus={i === 0}
                    disabled={verifyLoading}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(-1);
                      const chars = [...otpDigits];
                      chars[i] = val;
                      const newOtp = chars.join("");
                      setOtpDigits(chars);
                      if (val && i < 5) document.getElementById(`otp-box-${i + 1}`).focus();
                      if (chars.every(Boolean)) fetchData(newOtp);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otpDigits[i] && i > 0) {
                        document.getElementById(`otp-box-${i - 1}`).focus();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                      if (pasted) {
                        setOtpDigits(Array.from({ length: 6 }, (_, k) => pasted[k] || ""));
                        document.getElementById(`otp-box-${Math.min(pasted.length, 5)}`)?.focus();
                        if (pasted.length === 6) fetchData(pasted);
                        e.preventDefault();
                      }
                    }}
                  />
                ))}
              </div>
              {verifyLoading
                ? <p className="authSubtitle otpVerifying">Verifying…</p>
                : <p className="authSubtitle otpHint">Auto-verifies when all digits are entered</p>
              }
              <button className="authBack" onClick={sendOTP} disabled={otpLoading || verifyLoading}>
                {otpLoading ? "Sending…" : "Resend code"}
              </button>
              <button className="authBack" disabled={verifyLoading || otpLoading} onClick={() => { authVersionRef.current++; setStep("email"); setOtpDigits(Array(6).fill("")); }}>
                ← Change email
              </button>
            </div>
          )}

          {data && isFetched && (
            <fieldset className="dataContainer" inert={saving || parsing} disabled={saving || parsing} style={{ border: 0, margin: 0, padding: 0, minWidth: 0, pointerEvents: saving || parsing ? "none" : "auto" }}>

              <div className="welcomeBanner">
                <span className="welcomeWave">👋</span>
                <div>
                  <p className="welcomeName">Welcome, {data.First_Name || "Instructor"}!</p>
                  <p className="welcomeSub">Review your profile below and save any updates.</p>
                </div>
              </div>

              <div className="row">
                <label className="label">Do you have a resume?</label>
                <div className="btnGroup">
                  <button
                    className="primaryBtn"
                    onClick={() => setHasResume(true)}
                  >
                    Have Resume
                  </button>
                  <button
                    className="primaryBtn"
                    onClick={() => setHasResume(false)}
                  >
                    Don’t Have Resume
                  </button>
                </div>
              </div>

              {hasResume === true && (
                <div className="row">
                  <label className="label">Upload CV</label>
                  <div className="fileUploadArea">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      id="cvUpload"
                      style={{ display: "none" }}
                      onChange={(e) => { handleCVUpload(e.target.files[0]); e.target.value = ""; }}
                    />
                    <button
                      className="primaryBtn"
                      onClick={() =>
                        document.getElementById("cvUpload").click()
                      }
                    >
                      {parsing ? "Parsing…" : "Choose PDF (max 10 MB)"}
                    </button>
                    {fileName && (
                      <span className="fileName">✓ {fileName}</span>
                    )}
                  </div>
                </div>
              )}

              <Section title="Basic Info">
                <Field label="Name" field="First_Name" {...props()}
                  hint="Letters, spaces, hyphens, and apostrophes"
                  maxLength={100}
                  validate={(v) => validateField("First_Name", v)}
                />

                <div className="fieldRow">
                  <label className="label" htmlFor="mobile">Phone</label>
                  <div className="fieldInputWrapper">
                    <div className="phoneInputGroup">
                      <select
                        className="input countryCodeSelect"
                        aria-label="Phone country code"
                        onChange={(e) => {
                          setIsEditing(true);
                          handleChange("Country_Code", e.target.value);
                        }}
                        value={editedData["Country_Code"] ?? data["Country_Code"] ?? "+91"}
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                      <input
                        className="input"
                        id="mobile"
                        inputMode="tel"
                        placeholder="Phone number"
                        value={editedData["Mobile"] ?? data["Mobile"] ?? ""}
                        maxLength={15}
                        onChange={(e) => {
                          setIsEditing(true);
                          handleChange("Mobile", e.target.value);
                        }}
                      />
                    </div>
                    <div className="fieldMeta">
                      <span className="fieldError">{validateField("Mobile", editedData.Mobile ?? data.Mobile ?? "")}</span>
                      <span className="fieldHint">Digits only · 7–15 numbers</span>
                    </div>
                  </div>
                </div>

                <Field label="LinkedIn URL" field="LinkedIn_URL" {...props()}
                  hint="e.g. https://www.linkedin.com/in/yourname"
                  validate={(v) => validateField("LinkedIn_URL", v)}
                />
                <Field label="US Visa" field="US_Visa" type="checkbox" {...props()} />
                <BusinessDomainField
                  label="Business Domain(s)"
                  field="Business_Domain"
                  {...props()}
                />

                <BusinessDomainField
                  label="Languages Known"
                  field="Languages_Known"
                  options={LANGUAGE_OPTIONS}
                  placeholder="Select language(s)..."
                  {...props()}
                />

                <Field label="PAN No" field="PAN_Number" {...props()}
                  hint="10-character PAN (e.g. ABCDE1234F)"
                  maxLength={10}
                />
              </Section>

              <Section title="Address">
                <Field label="Street" field="Mailing_Street" {...props()}
                  hint="House / flat no., street name"
                  maxLength={100}
                />

                <Field label="City" field="Mailing_City" {...props()}
                  hint="City or town"
                  maxLength={100}
                />

                <Field label="State" field="Mailing_State" {...props()}
                  hint="State or province"
                  maxLength={100}
                />

                <Field label="Zip" field="Mailing_Zip" {...props()}
                  hint="Postal / ZIP code"
                  maxLength={10}
                />

                <div className="fieldRow">
                  <label className="label" htmlFor="country">Country</label>
                  <select
                    className="input"
                    id="country"
                    value={editedData["Country"] ?? data["Country"] ?? ""}
                    onChange={(e) => {
                      setIsEditing(true);
                      handleChange("Country", e.target.value);
                    }}
                  >
                    <option value="">Select Country</option>
                    {COUNTRY_LIST.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </Section>

              <Section title="Describe Your Experience">
                <TextAreaField label="Consulting" field="Consulting_Experience" {...props()}
                  hint="Describe your consulting background and experience"
                  maxChars={2500}
                />
                <TextAreaField label="Training" field="Training_Experience" {...props()}
                  hint="Describe your training and teaching experience"
                  maxChars={2500}
                />
              </Section>

              <Section title="Skills & Certifications">
                <TextAreaField label="Skills" field="Ins_skills" {...props()}
                  hint="If you have more skills, add them in Other Certifications and Skills below"
                  maxChars={222}
                  commaSeparated
                />

                <MultiSelectField
                  label="Certification(s)"
                  field="Certification_s_Lists"
                  {...props()}
                />

                <TextAreaField label="Other Certifications and Skills" field="Certification" {...props()}
                  hint="Comma-separated list of certifications and additional skills not listed above"
                  maxChars={2500}
                  commaSeparated
                />
              </Section>

              <Section title="Goals & Feedback">
                <TextAreaField label="Long Term Goal(s)" field="What_are_the_next_steps_w_r_t_Learning" {...props()}
                  hint="What are your next steps with respect to learning?"
                  maxChars={2500}
                />
                <TextAreaField label="Feedback for Us" field="Description" {...props()}
                  hint="Any feedback or comments for us"
                  maxChars={2500}
                />
              </Section>

              <div className="fieldRow">
                <label className="label">Email</label>
                <input className="input" value={data.Email || ""} disabled />
              </div>

              {isEditing && (
                <div className="saveContainer">
                  <button className="primaryBtn" onClick={updateContact}>
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}

            </fieldset>
          )}

        </div>
      </div>
    </div>
  );

  function props() {
    return {
      data,
      editedData,
      handleChange,
      setIsEditing,
    };
  }
}

/* ---------- COMPONENTS ---------- */

const Section = ({ title, children }) => (
  <div className="section">
    <h4>{title}</h4>
    {children}
  </div>
);

const Field = ({ label, field, type, data, editedData, handleChange, setIsEditing, hint, maxLength, validate }) => {
  const value = editedData[field] ?? data[field] ?? "";
  const strValue = value != null ? value.toString() : "";
  const error = type === "checkbox" ? "" : (validate ? validate(strValue) : validateField(field, strValue));

  return (
    <div className="fieldRow">
      <label className="label" htmlFor={field}>{label}</label>
      {type === "checkbox" ? (
        <input
          id={field}
          type="checkbox"
          style={{ width: "20px", height: "20px", cursor: "pointer" }}
          checked={value === true || value === "true" || value === "Yes" || value === "yes"}
          onChange={(e) => {
            setIsEditing(true);
            handleChange(field, e.target.checked);
          }}
        />
      ) : (
        <div className="fieldInputWrapper">
          <input
            id={field}
            className={`input${error ? " inputError" : ""}`}
            value={strValue}
            maxLength={maxLength}
            onChange={(e) => {
              setIsEditing(true);
              handleChange(field, e.target.value);
            }}
          />
          {(hint || maxLength || error) && (
            <div className="fieldMeta">
              {error
                ? <span className="fieldError">{error}</span>
                : hint && <span className="fieldHint">{hint}</span>
              }
              {maxLength && (
                <span className={`charCount${strValue.length >= maxLength ? " over" : strValue.length >= maxLength * 0.85 ? " warn" : ""}`}>
                  {strValue.length}/{maxLength}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const normalizeToComma = (val) =>
  val.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).join(", ");

const TextAreaField = ({ label, field, data, editedData, handleChange, setIsEditing, hint, maxChars = 2500, commaSeparated = false }) => {
  const value = editedData[field] ?? data[field] ?? "";
  const strValue = value != null ? value.toString() : "";
  const charCount = strValue.length;
  const isOver = charCount > maxChars;
  const isWarn = charCount >= Math.floor(maxChars * 0.85);

  return (
    <div className="fieldRow fieldRowTop">
      <label className="label" htmlFor={field}>{label}</label>
      <div className="fieldInputWrapper">
        <textarea
          id={field}
          className={`textarea${isOver ? " inputError" : ""}`}
          value={strValue}
          onChange={(e) => {
            setIsEditing(true);
            handleChange(field, e.target.value);
          }}
          onBlur={(e) => {
            if (commaSeparated && e.target.value.trim()) {
              handleChange(field, normalizeToComma(e.target.value));
            }
          }}
        />
        <div className="fieldMeta">
          {isOver
            ? <span className="fieldError">Exceeds {maxChars} character limit</span>
            : hint && <span className="fieldHint">{hint}</span>
          }
          <span className={`charCount${isOver ? " over" : isWarn ? " warn" : ""}`}>
            {charCount}/{maxChars} chars
          </span>
        </div>
      </div>
    </div>
  );
};

/* SEARCH DROPDOWN */
const MultiSelectField = ({
  label,
  field,
  data,
  editedData,
  handleChange,
  setIsEditing,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = editedData[field] ?? data[field] ?? [];

  const filteredOptions = CERT_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const removeItem = (opt) => {
    setIsEditing(true);
    handleChange(field, selected.filter((o) => o !== opt));
  };

  return (
    <div className="fieldRow fieldRowTop">
      <label className="label" htmlFor={field}>{label}</label>

      <div className="dropdownContainer" ref={ref}>
        <div
          id={field}
          role="button"
          tabIndex={0}
          aria-label={label}
          aria-expanded={open}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } if (e.key === "Escape") setOpen(false); }}
          className={`dropdownHeader ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span className="dropdownSelectedText">
            {selected.length === 0
              ? "Select certifications..."
              : `${selected.length} selected`}
          </span>
          <span className={`dropdownChevron ${open ? "open" : ""}`}>▾</span>
        </div>

        {selected.length > 0 && (
          <div className="tagsWrapper">
            {selected.map((opt) => (
              <span key={opt} className="tag">
                <span>{opt}</span>
                <button className="tagRemove" onClick={() => removeItem(opt)}>×</button>
              </span>
            ))}
          </div>
        )}

        {open && (
          <div className="dropdownList">
            <input
              className="input"
              placeholder="Search certifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filteredOptions.map((opt) => (
              <div
                key={opt}
                className={`dropdownItem ${selected.includes(opt) ? "selected" : ""}`}
                onClick={() => {
                  const updated = selected.includes(opt)
                    ? selected.filter((o) => o !== opt)
                    : [...selected, opt];
                  setIsEditing(true);
                  handleChange(field, updated);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* BUSINESS DOMAIN DROPDOWN */
const BusinessDomainField = ({ label, field, data, editedData, handleChange, setIsEditing, options = BUSINESS_DOMAIN_OPTIONS, placeholder = "Select domain(s)..." }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = editedData[field] ?? data[field] ?? [];
  const selectedArr = Array.isArray(selected) ? selected : selected ? [selected] : [];

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const removeItem = (opt) => {
    setIsEditing(true);
    handleChange(field, selectedArr.filter((o) => o !== opt));
  };

  return (
    <div className="fieldRow fieldRowTop">
      <label className="label" htmlFor={field}>{label}</label>
      <div className="dropdownContainer" ref={ref}>
        <div
          id={field}
          role="button"
          tabIndex={0}
          aria-label={label}
          aria-expanded={open}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(!open); } if (e.key === "Escape") setOpen(false); }}
          className={`dropdownHeader ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span className="dropdownSelectedText">
            {selectedArr.length === 0
              ? placeholder
              : `${selectedArr.length} selected`}
          </span>
          <span className={`dropdownChevron ${open ? "open" : ""}`}>▾</span>
        </div>

        {selectedArr.length > 0 && (
          <div className="tagsWrapper">
            {selectedArr.map((opt) => (
              <span key={opt} className="tag">
                <span>{opt}</span>
                <button className="tagRemove" onClick={() => removeItem(opt)}>×</button>
              </span>
            ))}
          </div>
        )}

        {open && (
          <div className="dropdownList">
            <input
              className="input"
              placeholder={`Search ${label.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {filtered.map((opt) => (
              <div
                key={opt}
                className={`dropdownItem ${selectedArr.includes(opt) ? "selected" : ""}`}
                onClick={() => {
                  const updated = selectedArr.includes(opt)
                    ? selectedArr.filter((o) => o !== opt)
                    : [...selectedArr, opt];
                  setIsEditing(true);
                  handleChange(field, updated);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- NOTIFICATION ---------- */
const Notification = ({ notif, onClose }) => {
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [notif, onClose]);

  if (!notif) return null;

  const isSuccess = notif.type === "success";

  return (
    <div className="notifOverlay" onClick={onClose}>
      <div
        className={`notifBox ${isSuccess ? "notifSuccess" : "notifError"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="notifIconCircle">
          {isSuccess ? "✓" : "✕"}
        </div>
        <p className="notifTitle">{isSuccess ? "Success" : "Error"}</p>
        <p className="notifMessage">{notif.message}</p>
        <button className="notifOkBtn" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default App;