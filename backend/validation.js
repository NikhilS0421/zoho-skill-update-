const TEXT_LIMITS = {
  First_Name: 100, Mobile: 15, Country_Code: 5, LinkedIn_URL: 2048,
  PAN_Number: 10, Mailing_Street: 100, Mailing_City: 100,
  Mailing_State: 100, Mailing_Zip: 10, Country: 100,
  Consulting_Experience: 2500, Training_Experience: 2500, Ins_skills: 222,
  Certification: 2500, What_are_the_next_steps_w_r_t_Learning: 2500,
  Description: 2500,
};
const ARRAY_FIELDS = ['Business_Domain', 'Languages_Known', 'Certification_s_Lists'];
const EDITABLE_FIELDS = [...Object.keys(TEXT_LIMITS), ...ARRAY_FIELDS, 'US_Visa'];
function validateUpdates(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Object.keys(data).length) {
    return 'Provide at least one profile field to update.';
  }
  for (const [key, value] of Object.entries(data)) {
    if (!EDITABLE_FIELDS.includes(key)) return `Field cannot be updated: ${key}`;
    if (key === 'US_Visa') {
      if (typeof value !== 'boolean') return 'US Visa must be true or false.';
    } else if (ARRAY_FIELDS.includes(key)) {
      if (!Array.isArray(value) || value.length > 100 || value.some(v => typeof v !== 'string' || !v.trim() || v.length > 255)) {
        return `${key} must contain up to 100 non-empty text values (255 characters each).`;
      }
    } else if (typeof value !== 'string' || value.length > TEXT_LIMITS[key]) {
      return `${key} must be text with at most ${TEXT_LIMITS[key]} characters.`;
    }
  }
  if (data.First_Name && !/^[\p{L}\p{M}\s\-'.]+$/u.test(data.First_Name)) return 'Enter a valid name.';
  if (data.Mobile && !/^\d{7,15}$/.test(data.Mobile)) return 'Phone must contain 7–15 digits.';
  if (data.Country_Code && !/^\+\d{1,4}$/.test(data.Country_Code)) return 'Enter a valid country code.';
  if (data.PAN_Number && !/^[A-Z]{5}\d{4}[A-Z]$/.test(data.PAN_Number)) return 'Enter a valid PAN (e.g. ABCDE1234F).';
  if (data.LinkedIn_URL) {
    try {
      const url = new URL(data.LinkedIn_URL);
      if (!['https:', 'http:'].includes(url.protocol) || !/^(www\.)?linkedin\.com$/i.test(url.hostname) || !/^\/in\/[^/]+\/?$/.test(url.pathname) || url.username || url.password) throw new Error();
    } catch { return 'Enter a valid LinkedIn profile URL.'; }
  }
  return null;
}
module.exports = { EDITABLE_FIELDS, validateUpdates };
