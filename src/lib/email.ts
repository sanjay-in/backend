import nodemailer from 'nodemailer';

function createTransporter() {
  const smtpHost = Bun.env.SMTP_HOST;
  const smtpPort = Number(Bun.env.SMTP_PORT || 0);
  const smtpUser = Bun.env.SMTP_USER || Bun.env.EMAIL_USER;
  const smtpPass = Bun.env.SMTP_PASS || Bun.env.EMAIL_PASS;

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

export async function sendVerificationEmail(to: string, name: string): Promise<void> {
  const defaultFrom = Bun.env.EMAIL_USER || 'no-reply@eduledger.local';
  const from = Bun.env.EMAIL_FROM || defaultFrom;
  const transporter = createTransporter();

  const subject = `Welcome to EduLedger, ${name}!`;
  const appUrl = process.env.CLIENT_URL || 'http://localhost:51524';
  const dashboardUrl = `${appUrl}/dashboard`;

  const text = `Hi ${name},\n\nWelcome to EduLedger! Your student profile has been created.\n\nHead to your dashboard to start exploring, upload study materials, and share to earn.\n\nDashboard: ${dashboardUrl}\n\nCheers,\nEduLedger Team`;

  const html = `<p>Welcome to EduLedger, ${name}!</p><p>Dashboard: <a href="${dashboardUrl}">${dashboardUrl}</a></p>`;

  await transporter.sendMail({ from, to, subject, text, html });
}