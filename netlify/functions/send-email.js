const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse the request body
  let email, goal, lifestyle;
  try {
    const body = JSON.parse(event.body || '{}');
    email     = (body.email     || '').trim().toLowerCase();
    goal      = (body.goal      || 'Stay healthy').trim();
    lifestyle = (body.lifestyle || 'Student').trim();
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: 'Invalid email' };
  }

  // ─── PERSONALISED ACTION MAP ───────────────────────────────────────────────
  const actions = {
    'Lose weight': {
      Student: 'Swap your morning biscuit for peanut butter. Less sugar, more protein.',
      Working: 'Add peanut butter to breakfast and skip the biscuit pack at your desk.'
    },
    'Gain muscle': {
      Student: 'Eat 2 spoons of peanut butter before college. Protein window = morning.',
      Working: 'Have 2 spoons before leaving home. Don\'t skip this.'
    },
    'Stay healthy': {
      Student: 'Replace one snack today with peanut butter on a banana or toast.',
      Working: 'Add peanut butter to your lunch. Small swap, real result.'
    },
    'Just try it': {
      Student: 'Add peanut butter to your breakfast. That\'s your only task today.',
      Working: 'Add peanut butter to your morning meal. One minute. Do it.'
    }
  };

  const action = actions[goal]?.[lifestyle] || 'Add peanut butter to breakfast today.';

  // ─── BREVO SMTP TRANSPORTER ────────────────────────────────────────────────
  // Brevo SMTP does NOT use an API key for authentication.
  // It uses:  BREVO_SMTP_USER = your Brevo account login email
  //           BREVO_SMTP_KEY  = the SMTP password shown in Brevo → SMTP & API → SMTP tab
  // These are set as environment variables in Netlify → Site settings → Env variables
  const transporter = nodemailer.createTransport({
    host:   'smtp-relay.brevo.com',
    port:   587,
    secure: false, // TLS via STARTTLS on port 587
    auth: {
      user: process.env.BREVO_SMTP_USER, // your Brevo login email
      pass: process.env.BREVO_SMTP_KEY   // Brevo SMTP password (not API key)
    }
  });

  // ─── SEND EMAIL ────────────────────────────────────────────────────────────
  try {
    await transporter.sendMail({
      from:    `"Alpino" <${process.env.BREVO_FROM_EMAIL}>`, // must be a verified sender in Brevo
      to:      email,
      subject: 'Your Day 1 starts now 💪',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:'DM Sans',Arial,sans-serif;background:#F6F1E9;margin:0;padding:40px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" style="background:#FDFAF5;border:1px solid #D8CEBC;padding:40px;">
                  <tr>
                    <td style="font-family:'Bebas Neue',Arial,sans-serif;font-size:28px;letter-spacing:4px;color:#1C1C1A;padding-bottom:8px;">
                      ALPIN<span style="color:#C47A3A;">O</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:11px;font-family:monospace;color:#C47A3A;letter-spacing:2px;text-transform:uppercase;padding-bottom:28px;border-bottom:1px solid #D8CEBC;">
                      DAY 1 ACTION
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:28px 0 16px;font-size:20px;font-weight:700;color:#1C1C1A;">
                      One thing. Today. That's it.
                    </td>
                  </tr>
                  <tr>
                    <td style="background:#E4F0E8;border-left:3px solid #2A6640;padding:16px 20px;font-size:15px;color:#1D4D2E;line-height:1.6;">
                      ${action}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:28px;font-size:13px;color:#4A4845;line-height:1.7;">
                      You signed up with goal: <strong>${goal}</strong><br/>
                      Lifestyle: <strong>${lifestyle}</strong><br/><br/>
                      We'll check in tomorrow with Day 2.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-top:32px;font-size:10px;color:#8A8780;font-family:monospace;letter-spacing:1px;border-top:1px solid #D8CEBC;margin-top:32px;">
                      ALPINO · REAL PEANUT BUTTER · NO EXCUSES
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Email sent' })
    };

  } catch (error) {
    console.error('Nodemailer error:', error.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
