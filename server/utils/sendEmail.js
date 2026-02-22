const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Gmail App Password (not your regular password)
    },
  });
};

const sendVerificationEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const verifyURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/verify-email/${token}`;

  const mailOptions = {
    from: `"MargDisha" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Verify Your MargDisha Account",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e4b6e, #3498db); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to <span style="color: #f39c12;">MargDisha</span></h1>
          <p style="color: #bae6fd; margin-top: 8px; font-size: 14px;">Your Career Intelligence Platform</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${name} 👋</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
            Thank you for joining MargDisha! Please verify your email address to activate your account and start your career discovery journey.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyURL}" 
               style="background: linear-gradient(135deg, #d35400, #e67e22); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
              Verify My Email
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            This link expires in <strong>24 hours</strong>. If you didn't create this account, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center;">
            If the button doesn't work, copy this link:<br/>
            <a href="${verifyURL}" style="color: #3498db; word-break: break-all;">${verifyURL}</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, name, token) => {
  const transporter = createTransporter();
  const resetURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${token}`;

  const mailOptions = {
    from: `"MargDisha" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Reset Your MargDisha Password",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e4b6e, #3498db); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;"><span style="color: #3498db;">Marg</span><span style="color: #f39c12;">Disha</span></h1>
          <p style="color: #bae6fd; margin-top: 8px; font-size: 14px;">Password Reset Request</p>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #1e293b; margin-top: 0;">Hi ${name} 🔒</h2>
          <p style="color: #64748b; font-size: 15px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetURL}" 
               style="background: linear-gradient(135deg, #d35400, #e67e22); color: white; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            This link expires in <strong>1 hour</strong>. If you didn't request this, your account is safe — just ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center;">
            If the button doesn't work, copy this link:<br/>
            <a href="${resetURL}" style="color: #3498db; word-break: break-all;">${resetURL}</a>
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
