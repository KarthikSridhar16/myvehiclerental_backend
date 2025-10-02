export function passwordResetHtml({ user, link }) {
  const name = user?.name || user?.email || "Customer";
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7f9">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;padding:32px 0">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;font:14px/1.6 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #eef0f3">
                <div style="font-size:18px;font-weight:600;color:#111">VrumaCars</div>
                <div style="font-size:12px;color:#6b7280">Password Reset</div>
              </td>
            </tr>
            <tr>
              <td style="padding:24px">
                <p style="margin:0 0 12px;">Dear ${name},</p>
                <p style="margin:0 0 12px;">
                  We received a request to reset the password for your Vrumacars account.
                </p>
                <p style="margin:0 0 16px;">
                  Please click the button below to set a new password. For your security, this link will expire in <strong>30 minutes</strong>.
                </p>
                <p style="margin:0 0 20px;">
                  <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;text-decoration:none;padding:10px 16px;border-radius:8px;font-weight:600">Set a new password</a>
                </p>
                <p style="margin:0 0 8px;color:#6b7280;font-size:12px;">
                  If the button does not work, copy and paste this link into your browser:
                </p>
                <p style="word-break:break-all;margin:0 0 20px;color:#1f2937;font-size:12px;">${link}</p>
                <p style="margin:0 0 12px;">
                  If you did not request this change, no action is required and you may safely ignore this email.
                </p>
                <p style="margin:0 0 0;">Sincerely,<br/>The VehicleRent Team</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #eef0f3;color:#6b7280;font-size:12px;">
                This is an automated message. Please do not reply to this email.
              </td>
            </tr>
          </table>
          <div style="color:#9ca3af;font-size:12px;margin-top:12px;">© ${new Date().getFullYear()} VehicleRent</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
