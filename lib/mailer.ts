import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || "smtp.gmail.com",
  port:   parseInt(process.env.SMTP_PORT || "465"),
  secure: parseInt(process.env.SMTP_PORT || "465") === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({
  to, subject, html, text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || "TraceMind AI <noreply@tracemind.ai>",
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, ""),
  });
}

export function replyTemplate(params: {
  userName: string;
  originalSubject: string;
  originalMessage: string;
  replyBody: string;
  adminName: string;
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#f3f4f6;margin:0;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6);padding:24px 32px;">
      <p style="color:#bfdbfe;font-size:12px;margin:0 0 4px;">TraceMind AI</p>
      <h1 style="color:#fff;font-size:20px;margin:0;">Reply from Admin</h1>
    </div>
    <!-- Body -->
    <div style="padding:32px;">
      <p style="color:#374151;margin:0 0 16px;">Hi <strong>${params.userName}</strong>,</p>
      <p style="color:#374151;margin:0 0 24px;">${params.replyBody.replace(/\n/g, "<br>")}</p>

      <!-- Original message -->
      <div style="border-left:3px solid #e5e7eb;padding:12px 16px;background:#f9fafb;border-radius:0 8px 8px 0;margin-top:24px;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your original message</p>
        <p style="color:#6b7280;font-size:13px;margin:0 0 4px;"><strong>Subject:</strong> ${params.originalSubject}</p>
        <p style="color:#6b7280;font-size:13px;margin:0;">${params.originalMessage.replace(/\n/g, "<br>")}</p>
      </div>
    </div>
    <!-- Footer -->
    <div style="padding:16px 32px;border-top:1px solid #f3f4f6;background:#f9fafb;">
      <p style="color:#9ca3af;font-size:12px;margin:0;">
        Replied by <strong>${params.adminName}</strong> · TraceMind AI Digital Forensics Platform
      </p>
    </div>
  </div>
</body>
</html>`;
}
