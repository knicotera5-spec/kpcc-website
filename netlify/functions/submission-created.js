const https = require('https');

exports.handler = async function(event) {
  // Netlify submission-created passes data as JSON payload
  let school, name, email, plan;
  try {
    const body = JSON.parse(event.body);
    const data = body.payload?.data || body.data || {};
    school = data.school || '';
    name = data.name || '';
    email = body.payload?.email || data.email || '';
    plan = data.plan || 'suite';
    console.log('Form submission received:', { school, name, email, plan });
    // Only process suite-trial and suite-access-request forms
    const formName = body.payload?.form_name || '';
    if (!formName.includes('suite')) {
      console.log('Ignoring non-suite form:', formName);
      return { statusCode: 200, body: 'Ignored' };
    }
  } catch(e) {
    console.error('Parse error:', e);
    return { statusCode: 400, body: 'Bad request' };
  }

  if (!email || !school) {
    return { statusCode: 400, body: 'Missing required fields' };
  }

  // Generate password: schoolname2026 (lowercase, no spaces)
  const password = school.toLowerCase().replace(/\s+/g, '') + '2026';

  // Plan display name
  const planNames = { hub: 'Hub', enroll: 'Enroll', suite: 'Full Suite (Hub + Enroll)' };
  const planDisplay = planNames[plan] || plan;

  // Login URLs
  const loginUrls = {
    hub: 'https://kpcharterkollective.com/suite-hub',
    enroll: 'https://kpcharterkollective.com/suite-enroll',
    suite: 'https://kpcharterkollective.com/suite-login'
  };
  const loginUrl = loginUrls[plan] || loginUrls.suite;

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f2d5a,#089494);padding:36px 40px;text-align:center;">
            <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">KPCC Suite</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;letter-spacing:0.08em;text-transform:uppercase;">Your 14-Day Free Trial Is Ready</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#1a2b4a;">Hi ${name},</p>
            <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">
              Welcome to the KPCC Suite beta! Your 14-day free trial of <strong>${planDisplay}</strong> is active. Here are your login credentials:
            </p>

            <!-- Credentials Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;margin-bottom:28px;">
              <tr>
                <td style="padding:24px 28px;">
                  <div style="margin-bottom:16px;">
                    <div style="font-size:11px;font-weight:700;color:#089494;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Email</div>
                    <div style="font-size:15px;color:#0f2d5a;font-weight:600;">${email}</div>
                  </div>
                  <div style="margin-bottom:16px;">
                    <div style="font-size:11px;font-weight:700;color:#089494;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Password</div>
                    <div style="font-size:15px;color:#0f2d5a;font-weight:600;font-family:monospace;">${password}</div>
                  </div>
                  <div>
                    <div style="font-size:11px;font-weight:700;color:#089494;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">Plan</div>
                    <div style="font-size:15px;color:#0f2d5a;font-weight:600;">${planDisplay}</div>
                  </div>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
              <tr>
                <td align="center">
                  <a href="${loginUrl}" style="display:inline-block;background:#f97316;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:8px;">
                    Sign In to Your Account →
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
              If you selected Enroll, your school access code is: trial2026

This is a beta — there may be a few bugs and rough edges. That's exactly why your feedback matters. After your 14 days, I'll follow up to hear what worked and what didn't.
            </p>
            <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;">
              Any questions at all, just reply to this email or reach me at <a href="mailto:kristina@kpcharterkollective.com" style="color:#089494;">kristina@kpcharterkollective.com</a>.
            </p>
            <p style="margin:0;font-size:15px;color:#1a2b4a;">
              — Kristina<br>
              <span style="color:#6b7280;font-size:13px;">KP Charter Kollective</span>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              KP Charter Kollective · <a href="https://kpcharterkollective.com" style="color:#089494;text-decoration:none;">kpcharterkollective.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // Send email via Resend
  const payload = JSON.stringify({
    from: 'Kristina at KPCC Suite <kristina@kpcharterkollective.com>',
    to: [email],
    reply_to: 'kristina@kpcharterkollective.com',
    subject: `Your KPCC Suite login is ready — ${planDisplay}`,
    html: emailHtml
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Resend response:', res.statusCode, data);
        resolve({ statusCode: 200, body: 'OK' });
      });
    });
    req.on('error', (e) => {
      console.error('Email error:', e);
      resolve({ statusCode: 500, body: 'Email failed' });
    });
    req.write(payload);
    req.end();
  });
};
