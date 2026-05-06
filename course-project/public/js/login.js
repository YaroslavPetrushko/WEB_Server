  // Якщо вже є токен — одразу на головну
  if (localStorage.getItem('token')) {
    window.location.href = '/';
  }

  const form = document.getElementById('loginForm');
  const btn = document.getElementById('submitBtn');
  const msg = document.getElementById('message');

  function showMessage(text, type) {
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // зупиняємо стандартну відправку форми (перезавантаження)

    btn.disabled = true;
    btn.textContent = 'Входимо...';
    msg.style.display = 'none';

    const body = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };

    // fetch('/api/auth/login') — відносний шлях: запит іде на той самий сервер
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();

    // response.ok — true лише для 200-299.
    // fetch НЕ кидає помилку при 4xx/5xx — потрібно перевіряти вручну!
    if (!res.ok) {
      showMessage(data.message || 'Помилка входу', 'error');
      btn.disabled = false;
      btn.textContent = 'Увійти';
      return;
    }

    // Зберігаємо токен — він знадобиться для захищених запитів
    localStorage.setItem('token', data.data.token);
    showMessage('Успішний вхід! Перенаправлення...', 'success');

    setTimeout(() => window.location.href = '/', 800);
  });