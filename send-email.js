// /netlify/functions/send-email.js
// Uses Resend (free tier: 3000 emails/month, no credit card)
// Set RESEND_API_KEY in Netlify → Site settings → Environment variables

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, goal, lifestyle;
  try {
    const body = JSON.parse(event.body || '{}');
    email     = (body.email     || '').trim().toLowerCase();
    goal      = (body.goal      || 'Stay healthy').trim();
    lifestyle = (body.lifestyle || 'Student').trim();
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: 'Invalid email' };
  }

  // --- Personalised Day 1 action (mirrors your frontend logic) ---
  const actions = {
    'Lose weight': {
      Student: 'Swap your morning biscuit for 1 spoon of peanut butter on toast. That\'s your only change today.',
      Working: 'Add 1 spoon of peanut butter to your morning meal. Skip the biscuit with your chai.'
    },
    'Gain muscle': {
      Student: 'Add 2 spoons of peanut butter to your breakfast before you leave. Roti, toast, or spoon — just eat it.',
      Working: 'Have 2 spoons of peanut butter with breakfast before leaving home. Protein first, everything else after.'
    },
    'Stay healthy': {
      Student: 'Replace one snack today — any snack — with 1 spoon of peanut butter on toast or a banana.',
      Working: 'Add 1 spoon of peanut butter somewhere in your lunch today. Roti, toast, or mid-morning — your call.'
    },
    'Just try it': {
      Student: 'Add 1 spoon of peanut butter to whatever you eat for breakfast. That\'s the whole task.',
      Working: 'Add 1 spoon of peanut butter to your morning meal. Eat it with roti, toast, or a banana.'
    }
  };

  const goalActions  = actions[goal]      || actions['Just try it'];
  const action       = goalActions[lifestyle] || goalActions['Student'];

  // --- Build email HTML ---
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#F6F1E9;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F1E9;padding:40px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#1C1C1A;padding:20px 32px;">
            <span style="font-family:Arial Black,sans-serif;font-size:22px;letter-spacing:6px;color:#FDFAF5;">AL<span style="color:#C47A3A;">P</span>INO</span>
          </td>
        </tr>

        <!-- Amber banner -->
        <tr>
          <td style="background:#C47A3A;padding:28px 32px 22px;">
            <p style="margin:0 0 6px;font-family:monospace;font-size:10px;color:rgba(28,28,26,0.5);letter-spacing:3px;text-transform:uppercase;">// Free 7-day plan</p>
            <h1 style="margin:0;font-family:Arial Black,sans-serif;font-size:42px;line-height:0.9;color:#1C1C1A;letter-spacing:1px;">YOUR DAY 1<br><span style="color:#FDFAF5;">STARTS NOW.</span></h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#FDFAF5;padding:32px 32px 24px;">

            <!-- Day 1 action box -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1C1C1A;border-left:4px solid #C47A3A;padding:18px 20px;">
                  <p style="margin:0 0 6px;font-family:monospace;font-size:9px;color:#C47A3A;letter-spacing:2px;text-transform:uppercase;">// Your Day 1 action</p>
                  <p style="margin:0;font-family:Arial Black,sans-serif;font-size:18px;color:#FDFAF5;letter-spacing:1px;line-height:1.3;text-transform:uppercase;">${action}</p>
                </td>
              </tr>
            </table>

            <p style="margin:24px 0 8px;font-size:15px;color:#4A4845;line-height:1.75;">
              That's it. One thing. Do it today and your streak starts.
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#4A4845;line-height:1.75;">
              Tomorrow you'll get Day 2 — still just one small thing. By Day 7 you'll have built your first real protein habit, without changing everything.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#2A6640;padding:14px 28px;">
                  <a href="https://alpino-day1.netlify.app/alpino_journey.html?email=${encodeURIComponent(email)}"
                     style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#E4F0E8;letter-spacing:1.5px;text-decoration:none;text-transform:uppercase;">
                    See My Day 1 Progress →
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Streak preview -->
        <tr>
          <td style="background:#EDE6D8;padding:20px 32px;">
            <p style="margin:0 0 10px;font-family:monospace;font-size:9px;color:#C47A3A;letter-spacing:2px;">// Your 7-day streak</p>
            <table cellpadding="0" cellspacing="0"><tr>
              <td style="width:28px;height:7px;background:#2A6640;margin-right:4px;"></td>
              ${[2,3,4,5,6,7].map(() => `<td style="width:4px;"></td><td style="width:28px;height:7px;background:#D8CEBC;"></td>`).join('')}
            </tr></table>
            <p style="margin:8px 0 0;font-family:monospace;font-size:9px;color:#8A8780;letter-spacing:1px;">Day 1 (today) → Day 7</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1C1C1A;padding:18px 32px;">
            <p style="margin:0;font-family:monospace;font-size:9px;color:rgba(253,250,245,0.3);letter-spacing:1px;">
              © 2025 Alpino Health Foods · You signed up at alpino-day1.netlify.app<br>
              <a href="#" style="color:rgba(253,250,245,0.3);">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // --- Send via Resend ---
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from:    'Alpino <onboarding@resend.dev>',   // ← swap to your domain once verified
        to:      [email],
        subject: 'Your Day 1 starts now (2 min task)',
        html
      })
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return { statusCode: 500, body: 'Email send failed: ' + err };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ sent: true })
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};
