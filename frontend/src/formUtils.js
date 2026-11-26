export const API_URL = (process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production'
  ? 'https://zoho-skill-update.onrender.com' : 'http://localhost:9000')).replace(/\/$/, '');
export const TEXT_LIMITS = {
  First_Name: 100, Mobile: 15, Country_Code: 5, LinkedIn_URL: 2048,
  PAN_Number: 10, Mailing_Street: 100, Mailing_City: 100, Mailing_State: 100,
  Mailing_Zip: 10, Country: 100, Consulting_Experience: 2500,
  Training_Experience: 2500, Ins_skills: 222, Certification: 2500,
  What_are_the_next_steps_w_r_t_Learning: 2500, Description: 2500,
};
export const ARRAY_FIELDS = ['Business_Domain', 'Languages_Known', 'Certification_s_Lists'];
export const EDITABLE_FIELDS = [...Object.keys(TEXT_LIMITS), ...ARRAY_FIELDS, 'US_Visa'];
export function validateField(key, value) {
  if (ARRAY_FIELDS.includes(key)) {
    return !Array.isArray(value) || value.length > 100 || value.some(v => typeof v !== 'string' || !v.trim() || v.length > 255)
      ? `${key}: select up to 100 values (255 characters each).` : '';
  }
  if (key === 'US_Visa') return typeof value === 'boolean' ? '' : 'US Visa must be true or false.';
  if (!Object.hasOwn(TEXT_LIMITS, key)) return 'This field cannot be updated.';
  if (typeof value !== 'string' || value.length > TEXT_LIMITS[key]) return `${key}: maximum ${TEXT_LIMITS[key]} characters.`;
  if (!value) return '';
  if (key === 'First_Name' && !/^[\p{L}\p{M}\s\-'.]+$/u.test(value)) return 'Enter a valid name.';
  if (key === 'Mobile' && !/^\d{7,15}$/.test(value)) return 'Phone must contain 7–15 digits.';
  if (key === 'Country_Code' && !/^\+\d{1,4}$/.test(value)) return 'Enter a valid country code.';
  if (key === 'PAN_Number' && !/^[A-Z]{5}\d{4}[A-Z]$/.test(value)) return 'Enter a valid PAN (e.g. ABCDE1234F).';
  if (key === 'LinkedIn_URL') {
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || !/^(www\.)?linkedin\.com$/i.test(url.hostname) || !/^\/in\/[^/]+\/?$/.test(url.pathname) || url.username || url.password) throw new Error();
    } catch { return 'Enter a valid LinkedIn profile URL.'; }
  }
  return '';
}
export function normalizeProfile(profile) {
  const result = { ...profile };
  ARRAY_FIELDS.forEach(key => {
    const value = result[key];
    // Domain names may themselves contain commas; only legacy certifications use comma delimiters.
    result[key] = Array.isArray(value) ? value : typeof value === 'string' && value.trim()
      ? (key === 'Certification_s_Lists' ? value.split(',').map(v => v.trim()).filter(Boolean) : [value]) : [];
  });
  return result;
}
export async function requestJSON(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, signal: controller.signal });
    let result;
    try { result = await response.json(); } catch { throw new Error('The server returned an invalid response. Please try again.'); }
    if (!response.ok || !result.success) {
      const error = new Error(result.error || 'Request failed. Please try again.');
      error.status = response.status;
      throw error;
    }
    return result;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The request timed out. Please try again.');
    if (err instanceof TypeError) throw new Error('Could not connect to the server. Please try again.');
    throw err;
  } finally { clearTimeout(timeout); }
}
