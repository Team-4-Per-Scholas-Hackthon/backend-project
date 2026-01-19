const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: Number(process.env.MAILTRAP_PORT),
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

async function sendMail({ to, subject, html }) {
  return transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };
