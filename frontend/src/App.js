import { useState, useRef, useEffect } from "react";
import "./App.css";
import logo from "./assets/Untitled design.svg";

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
  const [otp, setOtp] = useState("");

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

  /* ---------- OTP ---------- */
  const sendOTP = async () => {
    if (!email) {
      showNotif("Please enter your email address.", "error");
      return;
    }

    setOtpLoading(true);
    await fetch("https://zoho-skill-update.onrender.com/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setOtpLoading(false);
    setStep("otp");
  };

  /* ---------- FETCH ---------- */
  const fetchData = async () => {
    if (!otp) {
      showNotif("Please enter the OTP sent to your email.", "error");
      return;
    }

    setVerifyLoading(true);
    const res = await fetch("https://zoho-skill-update.onrender.com/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const result = await res.json();
    setVerifyLoading(false);

    if (!result.success) {
      showNotif(result.error || "Invalid OTP. Please try again.", "error");
      return;
    }

    const fetched = result.data;

    if (
      fetched.Certification_s_Lists &&
      typeof fetched.Certification_s_Lists === "string"
    ) {
      fetched.Certification_s_Lists =
        fetched.Certification_s_Lists.split(",").map((s) => s.trim());
    }

    setData(fetched);
    setIsFetched(true);
  };

  /* ---------- CV UPLOAD ---------- */
  const handleCVUpload = async (file) => {
    if (!file) return;

    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        "https://n8n.datacouch.io/webhook/parse-cv",
        {
          method: "POST",
          body: formData,
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

      if (!result.success || !result.data) {
        showNotif("Could not parse the CV. Please try a different file.", "error");
        return;
      }

      const parsed = result.data;

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
        "US_Visa", "Designation", "Business_Domain", "Country", "Mailing_State",
      ];

      const currentData = data || {};
      const mergedFields = {};

      Object.keys(parsed).forEach((key) => {
        const effective = editedData[key] !== undefined ? editedData[key] : currentData[key];
        const incoming = parsed[key];

        if (incoming === undefined || incoming === null) return;

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

      setData((prev) => ({ ...(prev || {}), ...mergedFields }));
      setEditedData((prev) => ({ ...prev, ...mergedFields }));
      setIsEditing(true);

      showNotif("CV parsed successfully! Please review and save.", "success");

    } catch (err) {
      console.error(err);
      showNotif("CV upload failed. Please try again.", "error");
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
    const wordLimitFields = [
      { key: "Consulting_Experience", label: "Consulting" },
      { key: "Training_Experience",   label: "Training" },
      { key: "Ins_skills",            label: "Skills" },
      { key: "Certification",         label: "Other Certification" },
    ];

    for (const { key, label } of wordLimitFields) {
      const val = (editedData[key] ?? data[key] ?? "").toString().trim();
      const count = val === "" ? 0 : val.split(/\s+/).length;
      if (count > 250) {
        showNotif(`"${label}" exceeds the 250-word limit (${count} words). Please shorten it before saving.`, "error");
        return;
      }
    }
    const res = await fetch("https://zoho-skill-update.onrender.com/contact", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: data.id,
        data: editedData,
        userEmail: data.Email || email,
        userName: editedData.First_Name || data.First_Name || "",
      }),
    });

    const result = await res.json();

    if (!result.success) {
      showNotif("Update failed: " + (result.error || "Unknown error"), "error");
      return;
    }

    setData({ ...data, ...editedData });
    setEditedData({});
    setIsEditing(false);

    showNotif("Profile updated successfully!", "success");
  };

  return (
    <div className="page">
      <Notification notif={notif} onClose={() => setNotif(null)} />
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
              <input
                className="input"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData()}
                autoFocus
              />
              <button className="primaryBtn authBtn" onClick={fetchData} disabled={verifyLoading}>
                {verifyLoading ? "Verifying…" : "Verify OTP"}
              </button>
              <button className="authBack" onClick={() => { setStep("email"); setOtp(""); }}>
                ← Change email
              </button>
            </div>
          )}

          {data && (
            <div className="dataContainer">

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
                      id="cvUpload"
                      style={{ display: "none" }}
                      onChange={(e) => handleCVUpload(e.target.files[0])}
                    />
                    <button
                      className="primaryBtn"
                      onClick={() =>
                        document.getElementById("cvUpload").click()
                      }
                    >
                      Choose File
                    </button>
                    {fileName && (
                      <span className="fileName">✓ {fileName}</span>
                    )}
                  </div>
                </div>
              )}

              <Section title="Basic Info">
                <Field label="Name" field="First_Name" {...props()}
                  hint="Letters, spaces, and hyphens only"
                  maxLength={100}
                  validate={(v) => v && !/^[a-zA-Z\s\-'.]+$/.test(v) ? "Only letters, spaces, hyphens, and apostrophes allowed" : ""}
                />

                <div className="fieldRow">
                  <label className="label">Phone</label>
                  <div className="fieldInputWrapper">
                    <div className="phoneInputGroup">
                      <select
                        className="input countryCodeSelect"
                        disabled={data.Mobile && data.Mobile.toString().trim() !== ""}
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
                        placeholder="Phone number"
                        value={editedData["Mobile"] ?? data["Mobile"] ?? ""}
                        disabled={data.Mobile && data.Mobile.toString().trim() !== ""}
                        maxLength={15}
                        onChange={(e) => {
                          setIsEditing(true);
                          handleChange("Mobile", e.target.value);
                        }}
                      />
                    </div>
                    <div className="fieldMeta">
                      <span className="fieldHint">Digits only · 7–15 numbers</span>
                    </div>
                  </div>
                </div>

                <Field label="LinkedIn URL" field="LinkedIn_URL" {...props()}
                  hint="e.g. https://www.linkedin.com/in/yourname"
                  validate={(v) => v && !v.toLowerCase().includes("linkedin.com") ? "Must be a valid LinkedIn URL" : ""}
                />
                <Field label="US Visa" field="US_Visa" type="checkbox" {...props()} />
                <Field label="Designation" field="Designation" {...props()}
                  hint="Your current job title"
                  maxLength={150}
                />

                <BusinessDomainField
                  label="Business Domain"
                  field="Business_Domain"
                  {...props()}
                />

                <Field label="Languages Known" field="Languages_Known" {...props()}
                  hint="e.g. English, Hindi, Spanish"
                  maxLength={200}
                />

                <Field label="PAN No" field="PAN_Number" {...props()}
                  hint="10-character PAN (e.g. ABCDE1234F)"
                  maxLength={10}
                />
              </Section>

              <Section title="Address">
                <Field label="Street" field="Mailing_StreetMailing" {...props()}
                  hint="House / flat no., street name"
                  maxLength={255}
                />

                <Field label="City" field="Mailing_CityMailing" {...props()}
                  hint="City or town"
                  maxLength={100}
                />

                <Field label="State" field="Mailing_State" {...props()}
                  hint="State or province"
                  maxLength={100}
                />

                <Field label="Zip" field="Mailing_ZipMailing" {...props()}
                  hint="Postal / ZIP code"
                  maxLength={20}
                />

                <div className="fieldRow">
                  <label className="label">Country</label>
                  <select
                    className="input"
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
                  maxWords={250}
                />
                <TextAreaField label="Training" field="Training_Experience" {...props()}
                  hint="Describe your training and teaching experience"
                  maxWords={250}
                />
              </Section>

              <Section title="Skills & Certifications">
                <TextAreaField label="Skills" field="Ins_skills" {...props()}
                  hint="List your technical and domain skills"
                  maxWords={250}
                />

                <MultiSelectField
                  label="Certification(s)"
                  field="Certification_s_Lists"
                  {...props()}
                />

                <TextAreaField label="Other Certification" field="Certification" {...props()}
                  hint="Certifications not available in the dropdown above"
                  maxWords={250}
                />
              </Section>

              <Section title="Goals & Feedback">
                <TextAreaField label="Long Term Goal" field="What_are_the_next_steps_w_r_t_Learning" {...props()}
                  hint="What are your next steps with respect to learning?"
                  maxWords={250}
                />
                <TextAreaField label="Feedback for Us" field="Description" {...props()}
                  hint="Any feedback or comments for us"
                  maxWords={250}
                />
              </Section>

              <div className="fieldRow">
                <label className="label">Email</label>
                <input className="input" value={data.Email || ""} disabled />
              </div>

              {isEditing && (
                <div className="saveContainer">
                  <button className="primaryBtn" onClick={updateContact}>
                    Save Changes
                  </button>
                </div>
              )}

            </div>
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
  const [error, setError] = useState("");
  const originalValue = data[field];
  const value = editedData[field] ?? originalValue ?? "";
  const strValue = value != null ? value.toString() : "";

  const basicFields = ["First_Name", "Mobile", "LinkedIn_URL"];
  const isDisabled =
    basicFields.includes(field) &&
    originalValue &&
    originalValue.toString().trim() !== "";

  const checkError = (val) => {
    if (!validate || isDisabled) return "";
    return validate(val) || "";
  };

  return (
    <div className="fieldRow">
      <label className="label">{label}</label>
      {type === "checkbox" ? (
        <input
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
            className={`input${error ? " inputError" : ""}`}
            value={strValue}
            disabled={isDisabled}
            maxLength={maxLength}
            onChange={(e) => {
              setIsEditing(true);
              handleChange(field, e.target.value);
              if (error) setError(checkError(e.target.value));
            }}
            onBlur={(e) => setError(checkError(e.target.value))}
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

const TextAreaField = ({ label, field, data, editedData, handleChange, setIsEditing, hint, maxWords = 250 }) => {
  const value = editedData[field] ?? data[field] ?? "";
  const strValue = value != null ? value.toString() : "";
  const wordCount = strValue.trim() === "" ? 0 : strValue.trim().split(/\s+/).length;
  const isOver = wordCount > maxWords;
  const isWarn = wordCount >= Math.floor(maxWords * 0.85);

  return (
    <div className="fieldRow fieldRowTop">
      <label className="label">{label}</label>
      <div className="fieldInputWrapper">
        <textarea
          className={`textarea${isOver ? " inputError" : ""}`}
          value={strValue}
          onChange={(e) => {
            setIsEditing(true);
            handleChange(field, e.target.value);
          }}
        />
        <div className="fieldMeta">
          {isOver
            ? <span className="fieldError">Exceeds {maxWords}-word limit</span>
            : hint && <span className="fieldHint">{hint}</span>
          }
          <span className={`charCount${isOver ? " over" : isWarn ? " warn" : ""}`}>
            {wordCount}/{maxWords} words
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
      <label className="label">{label}</label>

      <div className="dropdownContainer" ref={ref}>
        <div
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
const BusinessDomainField = ({ label, field, data, editedData, handleChange, setIsEditing }) => {
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

  const filtered = BUSINESS_DOMAIN_OPTIONS.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const removeItem = (opt) => {
    setIsEditing(true);
    handleChange(field, selectedArr.filter((o) => o !== opt));
  };

  return (
    <div className="fieldRow fieldRowTop">
      <label className="label">{label}</label>
      <div className="dropdownContainer" ref={ref}>
        <div
          className={`dropdownHeader ${open ? "active" : ""}`}
          onClick={() => setOpen(!open)}
        >
          <span className="dropdownSelectedText">
            {selectedArr.length === 0
              ? "Select domain(s)..."
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
              placeholder="Search domains..."
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