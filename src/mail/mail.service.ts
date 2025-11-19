import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      secure: false,
      auth: {
        user: "bf8e3aa51462f2",
        pass: "64862c1825d60a",
      },
    });
  }
  async sendMail(to: string, subject: string, html: string) {
    return this.transporter.sendMail({
      from: '"Auto Message" <no-reply@automessage.app>',
      to,
      subject,
      html,
    });
  }
  async sendVerificationEmail(email: string, key: string) {
    const verificationUrl = `${process.env.FRONTEND_URL}/auth/activate-account?key=${key}`;
    const html = `
          <p>Hello,</p>
          <p>Your account has been created, please click on the link to activate it now:</p>
          <a href="${verificationUrl}">Verify Account</a>
          <p>This link will expire in 24 hours.</p>
        `;
    return this.sendMail(email, "Verify your account", html);
  }
}