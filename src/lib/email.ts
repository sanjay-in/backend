import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { CreateEmailVerification } from '../types/email/email.types';
import EmailVerify from '../models/Email.model';

/**
  * @description Config of the nodemailer service to send email
*/
function createTransporter() {
  const smtpHost = Bun.env.SMTP_HOST;
  const smtpPort = Number(Bun.env.SMTP_PORT || 0);
  const smtpUser = Bun.env.SMTP_USER;
  const smtpPass = Bun.env.SMTP_PASS;

  if (smtpHost) {
    const port = smtpPort || 587;
    return nodemailer.createTransport({
      host: smtpHost,
      port,
      secure: port === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });
  }

  if (!smtpUser || !smtpPass) {
    throw new Error('Email credentials missing (EMAIL_USER/EMAIL_PASS or SMTP_*)');
  }

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });
}

/**
  * @description Sends verification email to the mentioned email and makes an entry in database
  * @param to Email ID to which the mail should be sent
  * @param name Name of the person who registered
  * @param c Context
  * @param next Next
*/
export async function sendVerificationEmail(to: string, name: string, id: string): Promise<void> {
  const defaultFrom = Bun.env.EMAIL_USER || 'no-reply@eduledger.local';
  const from = Bun.env.EMAIL_FROM || defaultFrom;
  const transporter = createTransporter();

  const subject = `Welcome to EduLedger, ${name}!`;
  const serverUrl = Bun.env.SERVER_URL || 'http://localhost:51524';

  // A random string is generated and combined with ID
  const generatedUUID = crypto.randomUUID() + '-' + id;
  const verificationURL = `${serverUrl}/verify/${generatedUUID}`;

  const hashedToken = await bcrypt.hash(generatedUUID, 12);

  // the email id along with the hashed token is stored in email_verification_token collection
  const emailVerification: CreateEmailVerification = new EmailVerify({
    email: to,
    password: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  });

  // Start session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await EmailVerify.findOne({ email: to });

    await EmailVerify.insertOne(emailVerification);
  } catch (error) {
    console.error('Error saving verification token:', error);
  }

  try {
    const text = `Hi ${name},\n\nWelcome to EduLedger! Your student profile has been created.\n\nHead to your dashboard to start exploring, upload study materials, and share to earn.\n\ns\n\nCheers,\nEduLedger Team`;

    const html = `<p>Welcome to EduLedger, ${name}!</p><p>Dashboard: <a href="${verificationURL}">Click here to verify</a></p>`;

    await transporter.sendMail({ from, to, subject, text, html });
  } catch (error) {
    // aborts session if error
    await session.abortTransaction();
    console.error('Error sending verification email:', error);
  } finally {
    // ends session and enters email entry
    session.endSession();
  }
}