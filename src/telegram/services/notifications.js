import { sendTelegramMessage, telegram } from './telegramClient.js';

const { escapeHtml } = telegram;

const linesToHtml = (lines) => lines.filter(Boolean).join('\n');

export const sendContactTelegramNotification = async (data) => {
  const contactLabel = data.contactMethod === 'Email' ? 'Email' : 'Phone';
  const html = linesToHtml([
    `<b>New Contact Form Submission (Portfolio)</b>`,
    ``,
    `<b>Name:</b> ${escapeHtml(data.name)}`,
    `<b>Preferred contact:</b> ${escapeHtml(data.contactMethod)}`,
    `<b>${escapeHtml(contactLabel)}:</b> ${escapeHtml(data.contactValue)}`,
    `<b>Message:</b> ${escapeHtml(data.message || '—')}`,
    ``,
    `<b>Submitted at:</b> ${escapeHtml(data.submitted_at)}`
  ]);

  return sendTelegramMessage(html);
};
