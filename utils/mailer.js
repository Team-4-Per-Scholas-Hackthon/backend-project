const nodemailer = require("nodemailer");
const { Resend } = require("resend");

let transporter;
let resend;

// if (process.env.MAIL_PROVIDER === "mailtrap") {
// 	// ✅ Local / testing
// 	transporter = nodemailer.createTransport({
// // const transporter = nodemailer.createTransport({
//   host: process.env.MAILTRAP_HOST,
//   port: Number(process.env.MAILTRAP_PORT),
//   auth: {
//     user: process.env.MAILTRAP_USER,
//     pass: process.env.MAILTRAP_PASS,
//   },
// });
// } else {
// 	// ✅ Production (example: SendGrid SMTP)
// 	transporter = nodemailer.createTransport({
// 		host: process.env.SMTP_HOST,
// 		port: process.env.SMTP_PORT,
// 		secure: false,
// 		auth: {
// 			user: process.env.SMTP_USER,
// 			pass: process.env.SMTP_PASS,
// 		},
// 	});
// }
// async function sendMail({ to, subject, html }) {
//   	await transporter.sendMail({
// //   return transporter.sendMail({
// 		from: `"PeerTrack+" <${process.env.MAIL_FROM}>`,
// //     from: process.env.MAIL_FROM,
//     to,
//     subject,
//     html,
//   });
// }

if (process.env.MAIL_PROVIDER === "mailtrap") {
  transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
} else if (process.env.MAIL_PROVIDER === "resend") {
  resend = new Resend(process.env.RESEND_API_KEY);
}

async function sendMail({ to, subject, html }) {
  console.log("MAIL PROVIDER:", process.env.MAIL_PROVIDER);
  if (process.env.MAIL_PROVIDER === "resend") {
    await resend.emails.send({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  } else {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      html,
    });
  }
}

module.exports = { sendMail };
