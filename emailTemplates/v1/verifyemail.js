const verificationEmail = async (otp) => {
  return `
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 20px; text-align: left;">
              <h2 style="color: #333;">Dear User,</h2>
              <p style="font-size: 16px; color: #555;">
                  Thank you for signing up with <strong style="color: #007BFF;">Cadooga!</strong> To complete your email verification, please use the One-Time Password (OTP) provided below: 
              </p>
              <div style="text-align: center; margin: 20px 0;">
                  <h3 style="color: #007BFF; font-size: 24px; margin: 10px 0;">${otp}</h3>
              </div>
              <p style="font-size: 16px; color: #555;">
                  This OTP is valid for the next 10 minutes. Please enter it on the verification screen to confirm your email address.
              </p>
              <p style="font-size: 16px; color: #555;">
                  If you didn’t sign up for Cadooga, you can safely ignore this email.
              </p>
              <p style="font-size: 16px; color: #555;">
                  Thank you for being a part of <strong style="color: #007BFF;">Cadooga!</strong>
              </p>
              <p style="font-size: 16px; color: #555;">
                  Best regards,<br>
                  <strong style="color: #007BFF;">The Cadooga Team</strong>
              </p>
          </div>
      </body>
      </html>
  `;
};

module.exports = {
  verificationEmail,
};
