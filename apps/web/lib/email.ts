import nodemailer from 'nodemailer';

interface SendEmailOptions {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendEmail({
  name,
  email,
  subject,
  message,
}: SendEmailOptions): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Next.js WordPress Starter" <${process.env.SMTP_USER}>`,
    to: process.env.CONTACT_EMAIL_TO,
    replyTo: `"${name}" <${email}>`,
    subject: `Contact: ${subject}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr />
      <p>${message.replace(/\n/g, '<br />')}</p>
    `,
  });
}
