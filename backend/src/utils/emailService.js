import sendEmail from "../config/email.js";

export const sendOTPEmail = async (to, otp) => {
  const subject = "OTP to Reset Your Password";

  const message = `
  <body style="margin:0; padding:0; background-color:#eef2ff; font-family:Arial, Helvetica, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0"
            style="background:#ffffff;
                   border-radius:14px;
                   box-shadow:0 10px 30px rgba(0,0,0,0.08);
                   overflow:hidden;">

            <!-- Top Gradient Strip -->
            <tr>
              <td style="height:6px; background:linear-gradient(90deg,#7c3aed,#2563eb);"></td>
            </tr>

            <!-- Header -->
            <tr>
              <td style="padding:30px 30px 10px 30px; text-align:center;">
                <h2 style="margin:0; font-size:24px; color:#111827;">
                  Password Reset Verification
                </h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:20px 30px 40px 30px; text-align:center; color:#374151;">

                <p style="font-size:15px; margin:0 0 25px; color:#6b7280;">
                  Use the One-Time Password (OTP) below to securely reset your password.
                </p>

                <!-- OTP BOX -->
                <div style="margin:30px 0;">
                  <span style="
                    display:inline-block;
                    padding:18px 55px;
                    font-size:32px;
                    letter-spacing:12px;
                    font-weight:bold;
                    color:#ffffff;
                    background:linear-gradient(90deg,#7c3aed,#2563eb);
                    border-radius:12px;
                  ">
                    ${otp}
                  </span>
                </div>

                <p style="font-size:14px; color:#6b7280; margin:20px 0 10px;">
                  This OTP is valid for <strong>5 minutes</strong>.
                </p>

                <p style="font-size:13px; color:#9ca3af; margin:0;">
                  For your security, do not share this code with anyone.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px; text-align:center; background:#f9fafb; border-top:1px solid #e5e7eb;">
                <p style="font-size:12px; color:#9ca3af; margin:0;">
                  © ${new Date().getFullYear()} HealthUP ! Stay Fit India. All rights reserved.
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  `;

  await sendEmail(to, subject, message);
};