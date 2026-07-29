import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Token helpers ──
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// ── Send verification email after registration ──
export async function sendVerificationEmail(toEmail, userName, token) {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"RemitX" <${process.env.SMTP_FROM}>`,
    to: toEmail,
    subject: 'Verify your RemitX account',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px;">
        <h2 style="color:#3b82f6;">Welcome to RemitX, ${userName}!</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${link}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#6366f1);color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;margin:20px 0;">
          Verify Email
        </a>
        <p style="font-size:12px;color:#9ca3af;">If the button doesn't work, copy this link:<br/>${link}</p>
      </div>
    `,
  });
}

// ── Send transaction confirmation email ──
export async function sendTransactionConfirmationEmail(toEmail, userName, txDetails, confirmToken) {
  const acceptLink = `${process.env.FRONTEND_URL}/confirm-transaction?token=${confirmToken}&action=accept`;
  const rejectLink = `${process.env.FRONTEND_URL}/confirm-transaction?token=${confirmToken}&action=reject`;

  const typeLabel = txDetails.type === 'transfer' ? 'Transfer' : txDetails.type === 'deposit' ? 'Deposit' : 'Withdrawal';

  await transporter.sendMail({
    from: `"RemitX" <${process.env.SMTP_FROM}>`,
    to: toEmail,
    subject: `Confirm your ${typeLabel} — RemitX`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:16px;">
        <h2 style="color:#3b82f6;">Transaction Confirmation</h2>
        <p>Hi ${userName}, a <strong>${typeLabel}</strong> was initiated from your account:</p>
        <div style="background:#f9fafb;border-radius:10px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;"><strong>Amount:</strong> ${txDetails.amount}</p>
          ${txDetails.receiver ? `<p style="margin:4px 0;"><strong>To:</strong> ${txDetails.receiver}</p>` : ''}
          ${txDetails.rate ? `<p style="margin:4px 0;"><strong>Exchange Rate:</strong> ${txDetails.rate}</p>` : ''}
          ${txDetails.converted ? `<p style="margin:4px 0;"><strong>Recipient Gets:</strong> ${txDetails.converted}</p>` : ''}
          <p style="margin:4px 0;"><strong>Reference:</strong> ${txDetails.txHash}</p>
        </div>
        <p>Do you want to proceed?</p>
        <div style="margin:20px 0;">
          <a href="${acceptLink}" style="display:inline-block;padding:14px 28px;background:#22c55e;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;margin-right:12px;">
            ✅ Accept
          </a>
          <a href="${rejectLink}" style="display:inline-block;padding:14px 28px;background:#ef4444;color:#fff;border-radius:10px;text-decoration:none;font-weight:bold;">
            ❌ Reject
          </a>
        </div>
        <p style="font-size:12px;color:#9ca3af;">This link expires when used. If you did not initiate this, click Reject immediately.</p>
      </div>
    `,
  });
}
