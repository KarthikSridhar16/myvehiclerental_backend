export const brand = "VRUMA Cars";

export function wrapEmail({ title, bodyHtml }) {
  const logoTag = `<img src="cid:brandlogo" alt="${brand}" style="height:52px;display:inline-block;" />`;

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <title>${title}</title>
    </head>
    <body style="margin:0;background:#f6f7fb;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,'Helvetica Neue',Arial,'Noto Sans',sans-serif;color:#0f172a;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center" style="padding:24px 12px;">
            <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #eef2ff;">
              <tr>
                <td style="background:#0b1020;padding:20px;text-align:center;">${logoTag}</td>
              </tr>
              <tr>
                <td style="padding:24px;">${bodyHtml}</td>
              </tr>
              <tr>
                <td style="padding:16px 24px;background:#f8fafc;color:#334155;font-size:12px;text-align:center">
                  © ${new Date().getFullYear()} ${brand}. All rights reserved.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}
