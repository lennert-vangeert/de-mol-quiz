import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true", // true for EMAIL_PORT, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (
  to: string,
  subject: string,
  content: string
) => {
  try {
    await transporter.sendMail({
      from: `"Lennert van Geert" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: content,
      text: content,
      replyTo: process.env.EMAIL_USER,
      headers: {
        'List-Unsubscribe': '<https://de-mol-quiz.vercel.app/unsubscribe>'
      },
    });
    console.log("Email sent successfully to", to);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
