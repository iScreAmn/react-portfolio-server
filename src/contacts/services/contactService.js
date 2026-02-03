import nodemailer from 'nodemailer';

export const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendContactEmail = async ({ name, contactMethod, contactValue, message }) => {
  const transporter = createTransporter();
  await transporter.verify();

  const contactLabel = contactMethod === 'Email' ? 'Email' : 'Phone';

  const emailContent = `
    New Contact Form Submission
    
    Name: ${name}
    Preferred contact: ${contactMethod}
    ${contactLabel}: ${contactValue}
    
    Message:
    ${message}
    
    Submitted at: ${new Date().toLocaleString()}
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact (${contactMethod})`,
    text: emailContent,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Preferred contact:</strong> ${contactMethod}</p>
      <p><strong>${contactLabel}:</strong> ${contactValue}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
    `
  });
};
