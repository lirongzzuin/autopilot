import { Resend } from 'resend';

let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY!);
  }
  return resend;
}

const FROM_EMAIL = 'AutoPilot <noreply@autopilot.kr>';

/** 이메일 다이제스트 발송 */
export async function sendEmailDigest(params: {
  to: string;
  userName: string;
  date: string;
  stats: { total: number; urgent: number; important: number; normal: number };
  urgentEmails: Array<{ subject: string; sender: string; summary: string }>;
}): Promise<void> {
  const { to, userName, date, stats, urgentEmails } = params;

  const urgentHtml = urgentEmails
    .map(
      (e) => `
      <tr>
        <td style="padding:12px; border-bottom:1px solid #f0f0f0;">
          <strong>${e.sender}</strong><br/>
          <span style="color:#374151;">${e.subject}</span><br/>
          <span style="color:#6b7280; font-size:13px;">${e.summary}</span>
        </td>
      </tr>`
    )
    .join('');

  const r = getResend();
  await r.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `[AutoPilot] ${date} 이메일 다이제스트`,
    html: `
      <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto; background:#fff;">
        <div style="background:#5048e5; padding:32px; border-radius:16px 16px 0 0; text-align:center;">
          <h1 style="color:#fff; margin:0; font-size:24px;">📬 오늘의 이메일 요약</h1>
          <p style="color:rgba(255,255,255,0.8); margin:8px 0 0;">${date}</p>
        </div>
        <div style="padding:32px;">
          <p style="color:#374151;">안녕하세요, <strong>${userName}</strong>님!</p>
          <div style="display:flex; gap:16px; margin:24px 0; text-align:center;">
            <div style="flex:1; background:#fef2f2; padding:16px; border-radius:12px;">
              <div style="font-size:28px; font-weight:700; color:#ef4444;">${stats.urgent}</div>
              <div style="font-size:12px; color:#6b7280;">🔴 긴급</div>
            </div>
            <div style="flex:1; background:#fffbeb; padding:16px; border-radius:12px;">
              <div style="font-size:28px; font-weight:700; color:#f59e0b;">${stats.important}</div>
              <div style="font-size:12px; color:#6b7280;">🟡 중요</div>
            </div>
            <div style="flex:1; background:#f0fdf4; padding:16px; border-radius:12px;">
              <div style="font-size:28px; font-weight:700; color:#22c55e;">${stats.normal}</div>
              <div style="font-size:12px; color:#6b7280;">🟢 일반</div>
            </div>
          </div>
          ${
            urgentEmails.length > 0
              ? `<h3 style="color:#111827;">⚡ 긴급 이메일</h3>
              <table style="width:100%; border-collapse:collapse;">
                ${urgentHtml}
              </table>`
              : ''
          }
          <div style="text-align:center; margin-top:32px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/inbox"
               style="display:inline-block; background:#5048e5; color:#fff; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:700;">
              전체 인박스 보기 →
            </a>
          </div>
        </div>
        <div style="background:#f9fafb; padding:16px; text-align:center; font-size:12px; color:#9ca3af; border-radius:0 0 16px 16px;">
          AutoPilot · <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings" style="color:#5048e5;">알림 설정</a>
        </div>
      </div>
    `,
  });
}

/** 결제 실패 알림 */
export async function sendPaymentFailedEmail(params: {
  to: string;
  userName: string;
  amount: number;
  retryDate: string;
}): Promise<void> {
  const r = getResend();
  await r.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: '[AutoPilot] 결제가 실패했습니다',
    html: `
      <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto;">
        <h2>결제 실패 안내</h2>
        <p>안녕하세요, <strong>${params.userName}</strong>님.</p>
        <p>구독 결제(₩${params.amount.toLocaleString()})가 실패했습니다.</p>
        <p>${params.retryDate}에 재시도 예정입니다.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings/billing"
           style="display:inline-block; background:#5048e5; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none;">
          결제 수단 업데이트
        </a>
      </div>
    `,
  });
}

/** 회원가입 환영 이메일 */
export async function sendWelcomeEmail(params: {
  to: string;
  userName: string;
}): Promise<void> {
  const r = getResend();
  await r.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: '🎉 AutoPilot에 오신 것을 환영합니다!',
    html: `
      <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto;">
        <div style="background:#5048e5; padding:32px; border-radius:16px 16px 0 0; text-align:center;">
          <h1 style="color:#fff; margin:0;">AutoPilot에 오신 것을 환영합니다! 🚀</h1>
        </div>
        <div style="padding:32px;">
          <p>안녕하세요, <strong>${params.userName}</strong>님!</p>
          <p>AI 기반 업무 자동화로 매주 5시간 이상을 절약해 보세요.</p>
          <h3>시작하기</h3>
          <ol>
            <li>이메일(Gmail/Outlook) 연결하기</li>
            <li>AI 모델 선택 또는 API 키 등록</li>
            <li>첫 번째 자동화 만들기</li>
          </ol>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display:inline-block; background:#5048e5; color:#fff; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:700;">
            대시보드 시작 →
          </a>
        </div>
      </div>
    `,
  });
}
