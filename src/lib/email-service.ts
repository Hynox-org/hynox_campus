import nodemailer from 'nodemailer';

export interface EmailPayload {
  to: string;
  fullName: string;
  role: string;
  institutionName?: string;
  activationLink: string;
}

// Map database roles to friendly, premium visual labels
const roleLabels: Record<string, string> = {
  student: 'Student Member',
  teacher: 'Faculty / Teacher',
  institution_admin: 'Institution Administrator',
  super_admin: 'Platform Super Administrator',
  public: 'Public Member',
};

/**
 * Creates a reusable SMTP transport pool.
 */
function createTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true'; // false for 587 (STARTTLS), true for 465 (SSL)
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('SMTP credentials are missing from environment variables! Email dispatch will be simulated.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    // Prevent self-signed cert issues with local dev
    tls: {
      rejectUnauthorized: false,
    },
  });
}

/**
 * Renders a premium, responsive dark-mode themed HTML email template for onboarding invites.
 */
function renderOnboardingHtml(payload: EmailPayload): string {
  const friendlyRole = roleLabels[payload.role] || payload.role;
  const instBlock = payload.institutionName 
    ? `<div style="margin-bottom: 6px; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Institution</div>
       <div style="color: #06b6d4; font-size: 15px; font-weight: 800; margin-bottom: 20px;">${payload.institutionName}</div>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Hynox Campus</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #030712; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #030712; padding: 40px 20px;">
        <tr>
          <td align="center">
            
            <!-- Email Wrapper Card -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #090d16; border: 1px solid #1f2937; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
              
              <!-- Top Glowing Header Line -->
              <tr>
                <td height="5" style="background: linear-gradient(to right, #06b6d4, #3b82f6); line-height: 5px; font-size: 0px;">&nbsp;</td>
              </tr>
              
              <!-- Content Body -->
              <tr>
                <td style="padding: 40px 35px; text-align: center;">
                  
                  <!-- Academic Logo Icon Placeholder -->
                  <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
                    <tr>
                      <td align="center" style="background-color: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.2); width: 64px; height: 64px; border-radius: 18px; text-align: center;">
                        <span style="font-size: 32px; line-height: 64px; display: block; vertical-align: middle;">🎓</span>
                      </td>
                    </tr>
                  </table>
                  
                  <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 10px 0; letter-spacing: -0.02em;">Activate Your Portal</h1>
                  <p style="color: #6b7280; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.15em; margin: 0 0 30px 0;">Hynox Campus Onboarding</p>
                  
                  <!-- Invitation Credentials Card -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: rgba(17, 24, 39, 0.6); border: 1px solid #1f2937; border-radius: 16px; padding: 24px; margin-bottom: 30px; text-align: left;">
                    <tr>
                      <td>
                        <div style="margin-bottom: 6px; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Authorized Member</div>
                        <div style="color: #ffffff; font-size: 16px; font-weight: bold; margin-bottom: 16px;">${payload.fullName}</div>
                        
                        <div style="margin-bottom: 6px; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Portal Role</div>
                        <div style="color: #ffffff; font-size: 15px; font-weight: 600; margin-bottom: 16px;">${friendlyRole}</div>
                        
                        ${instBlock}
                        
                        <div style="margin-bottom: 6px; color: #94a3b8; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">Registered Email</div>
                        <div style="color: #e2e8f0; font-size: 14px; font-family: monospace; word-break: break-all;">${payload.to}</div>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Activation Call to Action Button -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                    <tr>
                      <td align="center">
                        <a href="${payload.activationLink}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #090d16; font-size: 14px; font-weight: 900; text-decoration: none; padding: 16px 32px; border-radius: 14px; box-shadow: 0 10px 25px rgba(6, 182, 212, 0.25); text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.3s ease;">
                          Link &amp; Activate Account &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Security Note -->
                  <p style="color: #6b7280; font-size: 12px; line-height: 1.6; margin: 0 auto; max-width: 380px;">
                    For security reasons, this activation link is restricted exclusively to <strong>${payload.to}</strong> and will expire in <strong>7 days</strong>.
                  </p>
                  
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 35px; border-t: 1px solid #1f2937; background-color: #070a11; text-align: center;">
                  <p style="color: #4b5563; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; margin: 0;">
                    Secured by Hynox Identity
                  </p>
                </td>
              </tr>
              
            </table>
            
            <!-- Small Outer Footer -->
            <table border="0" cellpadding="0" cellspacing="0" style="margin-top: 20px;">
              <tr>
                <td align="center" style="color: #4b5563; font-size: 11px;">
                  This is an automated security invite. Please do not reply to this mail.
                </td>
              </tr>
            </table>
            
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Dispatches an automated onboarding email containing the cryptographically secure token link.
 */
export async function sendOnboardingEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  console.log(`[EmailService] Attempting to dispatch onboarding email to: ${payload.to}`);

  const transporter = createTransport();
  
  // Simulated Mode (Fallback if credentials not provided)
  if (!transporter) {
    const mockLog = `
========================================
[EMAIL SIMULATION] Onboarding Invite
To: ${payload.to}
Name: ${payload.fullName}
Role: ${payload.role}
Link: ${payload.activationLink}
========================================`;
    console.log(mockLog);
    return { success: true };
  }

  try {
    const from = process.env.SMTP_FROM || `"Hynox Campus" <${process.env.SMTP_USER}>`;
    const html = renderOnboardingHtml(payload);

    const info = await transporter.sendMail({
      from,
      to: payload.to,
      subject: 'Welcome to Hynox Campus! Activate your Portal Account',
      text: `Hello ${payload.fullName},\n\nYou have been invited to join Hynox Campus as a ${payload.role}.\n\nPlease copy and paste the following link into your browser to activate your account:\n${payload.activationLink}\n\nNote: This link is restricted to ${payload.to} and expires in 7 days.`,
      html,
    });

    console.log(`[EmailService] Email successfully sent! MessageId: ${info.messageId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[EmailService] SMTP Dispatch Failed:', err);
    return { 
      success: false, 
      error: err?.message || 'SMTP Authentication or connection failed.' 
    };
  }
}
