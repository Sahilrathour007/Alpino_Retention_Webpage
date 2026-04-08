// =============================================================
//  ALPINO FRONTEND — signup.js
//  Drop this in your Alpino GitHub Pages repo
//
//  WHAT IT DOES:
//  - Collects email + goal + lifestyle + diet_pref from the form
//  - POSTs to your Render backend /signup endpoint
//  - Shows success/error state to user
//  - No Netlify, no Brevo — everything goes to Render
// =============================================================

const BACKEND_URL = 'https://wholetruth.onrender.com';

document.addEventListener('DOMContentLoaded', () => {

  // The main email input on the landing page
  const emailInput  = document.querySelector('input[type="email"]');
  const startBtn    = document.querySelector('button, .start-btn, [data-action="start"]');

  // The modal form fields
  let selectedGoal      = null;
  let selectedLifestyle = null;
  let selectedDiet      = null;

  // ── Goal buttons ────────────────────────────────────────────
  document.querySelectorAll('[data-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-goal]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedGoal = btn.dataset.goal;
    });
  });

  // ── Lifestyle buttons ────────────────────────────────────────
  document.querySelectorAll('[data-lifestyle]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-lifestyle]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedLifestyle = btn.dataset.lifestyle;
    });
  });

  // ── Diet buttons ────────────────────────────────────────────
  document.querySelectorAll('[data-diet]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-diet]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedDiet = btn.dataset.diet;
    });
  });

  // ── Final submit ("SEND MY DAY 1 PLAN") ────────────────────
  const submitBtn = document.querySelector('[data-action="submit"], .send-plan-btn, #send-plan-btn');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleSubmit);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const email = emailInput?.value?.trim()?.toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }
    if (!selectedGoal) {
      showError('Please select your main goal.');
      return;
    }
    if (!selectedLifestyle) {
      showError('Please select your lifestyle.');
      return;
    }

    // Map display labels to DB values
    const goalMap = {
      'Lose weight':  'lose_weight',
      'Gain muscle':  'gain_muscle',
      'Stay healthy': 'general_health',
      'Just try it':  'just_try',
      'Energy':       'energy',
    };
    const lifestyleMap = {
      'Sedentary': 'sedentary',
      'Active':    'active',
      'Athlete':   'athlete',
      'Student':   'sedentary',
      'Working':   'active',
    };
    const dietMap = {
      'Vegetarian':     'veg',
      'Non-Vegetarian': 'non_veg',
      'Vegan':          'vegan',
    };

    const payload = {
      email,
      goal:      goalMap[selectedGoal]          || selectedGoal,
      lifestyle: lifestyleMap[selectedLifestyle] || selectedLifestyle,
      diet_pref: dietMap[selectedDiet]          || 'veg',
    };

    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showSuccess();
      } else {
        showError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('[SIGNUP ERROR]', err);
      showError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  function setLoading(isLoading) {
    const btn = document.querySelector('[data-action="submit"], .send-plan-btn, #send-plan-btn');
    if (!btn) return;
    btn.disabled    = isLoading;
    btn.textContent = isLoading ? 'SENDING...' : 'SEND MY DAY 1 PLAN →';
  }

  function showSuccess() {
    // Close modal if present
    const modal = document.querySelector('.modal, #signup-modal, [data-modal]');
    if (modal) modal.style.display = 'none';

    // Show success message — adapt selector to your actual HTML
    const successEl = document.querySelector('#success-message, .success-message');
    if (successEl) {
      successEl.style.display = 'block';
      successEl.textContent   = '✅ Check your email — your habit journey starts tomorrow morning.';
    } else {
      alert('✅ Done! Check your email. First habit task arrives tomorrow at 8am.');
    }
  }

  function showError(msg) {
    const errEl = document.querySelector('#error-message, .error-message');
    if (errEl) {
      errEl.style.display = 'block';
      errEl.textContent   = msg;
      setTimeout(() => errEl.style.display = 'none', 4000);
    } else {
      alert(msg);
    }
  }
});
