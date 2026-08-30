import transporter from "../config/email.js";

const sendEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,

    to,

    subject,

    html,
  });
};

export default sendEmail;
