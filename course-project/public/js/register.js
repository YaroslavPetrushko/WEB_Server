  // Якщо вже є токен — одразу на головну
  if (localStorage.getItem('token')) {
    window.location.href = '/';
  }

  const form = document.getElementById('registerForm');
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('message');

  function showMessage(text, type) {
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
  }

  // Підсвічуємо поля при збігу/незбігу паролів у реальному часі
  document.getElementById('confirmPassword').addEventListener('input', () => {
    const pw = document.getElementById('password').value;
    const cpw = document.getElementById('confirmPassword').value;
    const input = document.getElementById('confirmPassword');

    if (cpw && pw !== cpw) {
      input.classList.add('invalid');
    } else {
      input.classList.remove('invalid');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // не перезавантажувати сторінку!

    btn.disabled = true;
    btn.textContent = 'Реєстрація...';
    msg.style.display = 'none';

    const body = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value
    };

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    if (!res.ok) {
      // Joi може повернути кілька помилок у одному рядку через '; '
      showMessage(data.message || 'Помилка реєстрації', 'error');
      btn.disabled = false;
      btn.textContent = 'Зареєструватися';
      return;
    }

    // Після успішної реєстрації — зберігаємо токен і переходимо
    localStorage.setItem('token', data.data.token);
    showMessage('Акаунт створено! Перенаправлення...', 'success');

    setTimeout(() => window.location.href = '/', 800);
  });