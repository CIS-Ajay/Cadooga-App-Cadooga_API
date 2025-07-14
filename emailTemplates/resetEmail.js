exports.generateResetEmailHtml = async (resetUrl, user) => {
    return `
      <div style="font-family: sans-serif;">
        <h2>Hi ${user.legal_first_name || user.username || "User"},</h2>
        <p>You requested to reset your password.</p>
        <p>
          <a href="${resetUrl}" style="background:#2563eb;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 5 minutes.</p>
        <br/>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <hr/>
        <small>© ${new Date().getFullYear()} Cadooga</small>
      </div>
    `;
  };
  