import nodemailer from "nodemailer";

export const mailer = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 587,
  secure: false, // TLS
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY!, // from your .env.local
  },
});
