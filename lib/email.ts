import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "myTCteam <notifications@mytcteam.com>";
const REPLY_TO = process.env.ADMIN_EMAIL || "support@mytcteam.com";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://mytcteam.vercel.app";

// ─── Shared layout ────────────────────────────────────────────────────────────

function emailLayout(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#f8fafc; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; color:#1e293b; }
    .wrapper { max-width:560px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,.08); }
    .header { background:#0f172a; padding:24px 32px; display:flex; align-items:center; gap:10px; }
    .logo-box { width:28px; height:28px; background:#6366f1; border-radius:7px; display:inline-flex; align-items:center; justify-content:center; }
    .logo-text { color:#fff; font-weight:700; font-size:11px; }
    .brand { color:#fff; font-weight:600; font-size:15px; margin-left:8px; }
    .body { padding:32px; }
    h2 { margin:0 0 8px; font-size:20px; font-weight:700; color:#0f172a; }
    p { margin:0 0 16px; font-size:15px; line-height:1.6; color:#475569; }
    .btn { display:inline-block; background:#6366f1; color:#fff!important; padding:11px 22px; border-radius:8px; font-weight:600; font-size:14px; text-decoration:none; }
    .divider { height:1px; background:#f1f5f9; margin:24px 0; }
    .footer { padding:20px 32px; text-align:center; font-size:12px; color:#94a3b8; }
    .detail-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px 16px; margin-bottom:16px; font-size:14px; color:#334155; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo-box"><span class="logo-text">TC</span></div>
      <span class="brand">myTCteam</span>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      myTCteam · Real Estate Transaction Coordination<br/>
      <a href="${BASE_URL}" style="color:#94a3b8;">mytcteam.com</a>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email senders ─────────────────────────────────────────────────────────────

export async function sendNewMessageEmail({
  to,
  toName,
  fromName,
  propertyAddress,
  messagePreview,
  dealId,
  isAdmin,
}: {
  to: string;
  toName: string;
  fromName: string;
  propertyAddress: string;
  messagePreview: string;
  dealId: string;
  isAdmin: boolean;
}) {
  const dealUrl = isAdmin
    ? `${BASE_URL}/admin/deals/${dealId}?tab=messages`
    : `${BASE_URL}/dashboard/deals/${dealId}?tab=messages`;

  const body = `
    <h2>New message from ${fromName}</h2>
    <p>Hi ${toName}, you have a new message regarding your transaction.</p>
    <div class="detail-box">
      <strong>${propertyAddress}</strong><br/>
      <span style="color:#64748b;">${messagePreview.slice(0, 200)}${messagePreview.length > 200 ? "…" : ""}</span>
    </div>
    <a href="${dealUrl}" class="btn">View Message</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">You're receiving this because you have an active deal on myTCteam.</p>
  `;

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `New message: ${propertyAddress}`,
    html: emailLayout("New message", body),
  });
}

export async function sendDocumentUploadedEmail({
  to,
  toName,
  propertyAddress,
  documentName,
  uploadedBy,
  dealId,
}: {
  to: string;
  toName: string;
  propertyAddress: string;
  documentName: string;
  uploadedBy: string;
  dealId: string;
}) {
  const dealUrl = `${BASE_URL}/dashboard/deals/${dealId}?tab=documents`;

  const body = `
    <h2>New document uploaded</h2>
    <p>Hi ${toName}, a new document has been added to your transaction.</p>
    <div class="detail-box">
      <strong>${propertyAddress}</strong><br/>
      📄 ${documentName}<br/>
      <span style="color:#64748b;font-size:13px;">Uploaded by ${uploadedBy}</span>
    </div>
    <a href="${dealUrl}" class="btn">View Documents</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">You're receiving this because you have an active deal on myTCteam.</p>
  `;

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `New document: ${propertyAddress}`,
    html: emailLayout("New document uploaded", body),
  });
}

export async function sendDealStageChangedEmail({
  to,
  toName,
  propertyAddress,
  newStage,
  dealId,
  note,
}: {
  to: string;
  toName: string;
  propertyAddress: string;
  newStage: string;
  dealId: string;
  note?: string;
}) {
  const dealUrl = `${BASE_URL}/dashboard/deals/${dealId}`;

  const stageLabels: Record<string, { label: string; emoji: string }> = {
    pending:        { label: "Pending",         emoji: "🕐" },
    active:         { label: "Active",           emoji: "✅" },
    closing:        { label: "Closing",          emoji: "🏁" },
    closed:         { label: "Closed",           emoji: "🎉" },
    fallen_through: { label: "Fallen Through",   emoji: "❌" },
  };
  const { label, emoji } = stageLabels[newStage] || { label: newStage, emoji: "📋" };

  const body = `
    <h2>${emoji} Transaction status update</h2>
    <p>Hi ${toName}, your transaction status has been updated.</p>
    <div class="detail-box">
      <strong>${propertyAddress}</strong><br/>
      New status: <strong>${label}</strong>
      ${note ? `<br/><span style="color:#64748b;font-size:13px;margin-top:4px;display:block;">${note}</span>` : ""}
    </div>
    <a href="${dealUrl}" class="btn">View Transaction</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">You're receiving this because you have an active deal on myTCteam.</p>
  `;

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `${emoji} Transaction update: ${propertyAddress}`,
    html: emailLayout("Transaction update", body),
  });
}

export async function sendDeadlineReminderEmail({
  to,
  deadlines,
}: {
  to: string;
  deadlines: Array<{
    propertyAddress: string;
    dateLabel: string;
    dateValue: string;
    daysUntil: number;
    dealId: string;
  }>;
}) {
  const rows = deadlines.map(d => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;">
        <a href="${BASE_URL}/admin/deals/${d.dealId}?tab=dates" style="color:#6366f1;text-decoration:none;font-weight:500;">${d.propertyAddress}</a>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;color:#475569;">${d.dateLabel}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;font-weight:600;color:${d.daysUntil <= 1 ? "#dc2626" : d.daysUntil <= 2 ? "#d97706" : "#16a34a"};">
        ${d.daysUntil === 0 ? "Today" : d.daysUntil === 1 ? "Tomorrow" : `${d.daysUntil} days`}
      </td>
    </tr>
  `).join("");

  const body = `
    <h2>⏰ Upcoming deadlines</h2>
    <p>You have ${deadlines.length} deadline${deadlines.length !== 1 ? "s" : ""} coming up in the next 3 days.</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:16px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">PROPERTY</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">DATE TYPE</th>
          <th style="padding:10px 12px;text-align:left;font-size:12px;color:#64748b;font-weight:600;">DUE</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <a href="${BASE_URL}/admin/calendar" class="btn">View Calendar</a>
    <div class="divider"></div>
    <p style="font-size:13px;color:#94a3b8;">Daily deadline reminders from myTCteam.</p>
  `;

  return resend.emails.send({
    from: FROM,
    replyTo: REPLY_TO,
    to,
    subject: `⏰ ${deadlines.length} deadline${deadlines.length !== 1 ? "s" : ""} coming up`,
    html: emailLayout("Upcoming deadlines", body),
  });
}
