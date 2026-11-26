import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import { validateField } from './formUtils';

const profile = { id: 'contact-1', Email: 'person@example.test', First_Name: 'Jane', Mobile: '9876543210', Certification_s_Lists: [] };
const reply = (body, ok = true, status = 200) => Promise.resolve({ ok, status, json: async () => body });
beforeEach(() => { global.fetch = jest.fn(); });
afterEach(() => { jest.restoreAllMocks(); });
async function emailStep() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Email address' }), { target: { value: 'person@example.test' } });
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
}
async function login() {
  fetch.mockImplementationOnce(() => reply({ success: true }));
  await emailStep();
  await screen.findByRole('textbox', { name: 'OTP digit 1' });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fetch.mockImplementationOnce(() => reply({ success: true, data: profile, sessionToken: 'a'.repeat(64) }));
  fireEvent.paste(screen.getByRole('textbox', { name: 'OTP digit 1' }), { clipboardData: { getData: () => '123456' } });
  await screen.findByText('Review your profile below and save any updates.');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
}

test('shows email delivery errors without advancing to OTP', async () => {
  fetch.mockImplementationOnce(() => reply({ success: false, error: 'Delivery failed' }, false, 502));
  render(<App />);
  await emailStep();
  expect(await screen.findByText('Delivery failed')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
  expect(screen.queryByRole('textbox', { name: 'OTP digit 1' })).not.toBeInTheDocument();
});

test('recovers from network failure and allows retry', async () => {
  fetch.mockRejectedValueOnce(new TypeError('offline'));
  render(<App />);
  await emailStep();
  expect(await screen.findByText('Could not connect to the server. Please try again.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('deleting a middle OTP digit preserves the other box positions', async () => {
  fetch.mockImplementationOnce(() => reply({ success: true }));
  render(<App />);
  await emailStep();
  await screen.findByRole('textbox', { name: 'OTP digit 1' });
  fireEvent.paste(screen.getByRole('textbox', { name: 'OTP digit 1' }), { clipboardData: { getData: () => '12345' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'OTP digit 3' }), { target: { value: '' } });
  expect(screen.getByRole('textbox', { name: 'OTP digit 3' })).toHaveValue('');
  expect(screen.getByRole('textbox', { name: 'OTP digit 4' })).toHaveValue('4');
  expect(screen.getByRole('textbox', { name: 'OTP digit 5' })).toHaveValue('5');
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('blocks invalid fields, authenticates saves and retains edits after failure', async () => {
  render(<App />);
  await login();
  const phone = screen.getByPlaceholderText('Phone number');
  expect(phone).toBeEnabled();
  fireEvent.change(phone, { target: { value: 'abc' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  expect(fetch).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fireEvent.change(phone, { target: { value: '9876543211' } });
  fetch.mockImplementationOnce(() => reply({ success: false, error: 'CRM unavailable' }, false, 502));
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  await screen.findByText('CRM unavailable');
  expect(phone).toHaveValue('9876543211');
  expect(screen.getByRole('button', { name: 'Save Changes' })).toBeEnabled();
  const [, options] = fetch.mock.calls[2];
  expect(options.headers.Authorization).toBe(`Bearer ${'a'.repeat(64)}`);
  expect(JSON.parse(options.body)).toEqual({ id: 'contact-1', data: { Mobile: '9876543211', Country_Code: '+91' } });
});

test('CV imports remain editable drafts and cannot change contact identity', async () => {
  render(<App />);
  await login();
  fireEvent.click(screen.getByRole('button', { name: 'Have Resume' }));
  fetch.mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ success: true, data: { id: 'other-contact', Email: 'other@example.test', Ins_skills: 'React', Mailing_City: 'Delhi' } }) });
  const input = document.getElementById('cvUpload');
  fireEvent.change(input, { target: { files: [new File(['pdf'], 'resume.pdf', { type: 'application/pdf' })] } });
  await screen.findByText('CV parsed successfully! Please review and save.');
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  expect(screen.getByRole('textbox', { name: 'Skills' })).toHaveValue('React');
  fetch.mockImplementationOnce(() => reply({ success: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Save Changes' })).not.toBeInTheDocument());
  const body = JSON.parse(fetch.mock.calls[3][1].body);
  expect(body.id).toBe('contact-1');
  expect(body.data.id).toBeUndefined();
  expect(body.data.Email).toBeUndefined();
});

test('validates URL hostname, PAN, phone and unicode names', () => {
  expect(validateField('LinkedIn_URL', 'https://linkedin.com.evil.test/in/jane')).toBeTruthy();
  expect(validateField('LinkedIn_URL', 'https://www.linkedin.com/in/jane')).toBe('');
  expect(validateField('PAN_Number', 'ABCDE1234F')).toBe('');
  expect(validateField('PAN_Number', 'bad')).toBeTruthy();
  expect(validateField('Mobile', '123')).toBeTruthy();
  expect(validateField('First_Name', 'José')).toBe('');
});

test('expired sessions allow reverification without losing the same contact draft', async () => {
  render(<App />);
  await login();
  fireEvent.change(screen.getByRole('textbox', { name: 'Skills' }), { target: { value: 'Unsaved skill' } });
  fetch.mockImplementationOnce(() => reply({ success: false, error: 'Session expired. Verify your email again.' }, false, 401));
  fireEvent.click(screen.getByRole('button', { name: 'Save Changes' }));
  await screen.findByRole('button', { name: 'Next' });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fetch.mockImplementationOnce(() => reply({ success: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByRole('textbox', { name: 'OTP digit 1' });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fetch.mockImplementationOnce(() => reply({ success: true, data: profile, sessionToken: 'b'.repeat(64) }));
  fireEvent.paste(screen.getByRole('textbox', { name: 'OTP digit 1' }), { clipboardData: { getData: () => '654321' } });
  expect(await screen.findByRole('textbox', { name: 'Skills' })).toHaveValue('Unsaved skill');
  expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
});

test('verification network failure clears loading and permits retry', async () => {
  render(<App />);
  fetch.mockImplementationOnce(() => reply({ success: true }));
  await emailStep();
  await screen.findByRole('textbox', { name: 'OTP digit 1' });
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fetch.mockRejectedValueOnce(new TypeError('offline'));
  fireEvent.paste(screen.getByRole('textbox', { name: 'OTP digit 1' }), { clipboardData: { getData: () => '123456' } });
  await screen.findByText('Could not connect to the server. Please try again.');
  expect(screen.getByRole('textbox', { name: 'OTP digit 1' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'OK' }));
  fetch.mockImplementationOnce(() => reply({ success: true, data: profile, sessionToken: 'a'.repeat(64) }));
  fireEvent.paste(screen.getByRole('textbox', { name: 'OTP digit 1' }), { clipboardData: { getData: () => '123456' } });
  expect(await screen.findByText('Review your profile below and save any updates.')).toBeInTheDocument();
});
