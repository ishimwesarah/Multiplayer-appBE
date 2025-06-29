import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyUrl = `http://localhost:3000/api/auth/verify-email?token=${token}`;

  const message = {
    from: `"MultiPlayer Quiz" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: 'Verify your email',
    html: `
      <p>Hi,</p>
      <p>Please click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
    `,
  };

  await transporter.sendMail(message);
};
