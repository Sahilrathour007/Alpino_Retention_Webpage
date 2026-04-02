const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let email, goal, lifestyle;

  try {
    const body = JSON.parse(event.body || '{}');
    email = (body.email || '').trim().toLowerCase();
    goal = (body.goal || 'Stay healthy').trim();
    lifestyle = (body.lifestyle || 'Student').trim();
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: 'Invalid email' };
  }

  // ─── ACTION LOGIC ───
  const actions = {
    'Lose weight': {
      Student: 'Swap your morning biscuit for peanut butter.',
      Working: 'Add peanut butter and skip biscuit.'
    },
    'Gain muscle': {
      Student: 'Eat 2 spoons peanut butter in breakfast.',
      Working: 'Have 2 spoons before leaving.'
    },
    'Stay healthy': {
      Student: 'Replace one snack with peanut butter.',
      Working: 'Add peanut butter to lunch.'
    },
    'Just try it': {
      Student: 'Add peanut butter to breakfast.',
      Working: 'Add peanut butter to morning meal.'
    }
  };

  const action = actions[goal]?.[lifestyle] || 'Add peanut butter to breakfast.';

  // ─── BREVO SMTP SETUP ───
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "your-email@gmail.com", // 👈 replace with your email
      pass: process.env.BREVO_SMTP_KEY // 👈 store in Netlify env
    }
  });

  try {
    await transporter.sendMail({
      from: '"Alpino" <your-email@gmail.com>', // 👈 same email as above
      to: email,
      subject: "Your Day 1 starts now",
      html: `
        <h2>Your Day 1 Action</h2>
        <p>${action}</p>
        <p>Do this today. That’s it.</p>
      `
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error("Email error:", error);
    return {
      statusCode: 500,
      body: "Email failed"
    };
  }
};
