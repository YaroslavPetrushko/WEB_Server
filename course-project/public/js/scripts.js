  // ── Стан ──
  let currentPage = 1;
  const limit = 6;
  let filterTimeout = null;

  // ── Auth UI ──
  // Показуємо кнопку "Вийти" та "Додати курс" лише якщо є токен
  const token = localStorage.getItem('token');
  if (token) {
    document.getElementById('logoutBtn').style.display = 'inline-flex';
    document.getElementById('createLink').style.display = 'inline-flex';
    document.getElementById('loginLink').style.display = 'none';
    document.getElementById('registerLink').style.display = 'none';
  }

  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.reload();
  });

  // ── Завантаження курсів ──
  async function loadCourses(page = 1, instructor = '') {
    const grid = document.getElementById('courseGrid');
    grid.innerHTML = '<div class="state-msg"><div class="spinner"></div>Завантаження...</div>';

    // Будуємо URL з query-параметрами
    const params = new URLSearchParams({ page, limit });
    if (instructor.trim()) params.set('instructor', instructor.trim());

    // Публічний запит — токен не потрібен
    const res = await fetch(`/api/courses?${params}`);
    const data = await res.json();

    if (!res.ok) {
      grid.innerHTML = `<div class="state-msg">Помилка: ${data.message}</div>`;
      return;
    }

    const courses = data.data;
    const pagination = data.pagination;

    // Оновлюємо інфо про пагінацію
    document.getElementById('paginationInfo').textContent =
      `${pagination.total} курс(ів) · сторінка ${pagination.page} з ${pagination.pages || 1}`;

    if (courses.length === 0) {
      grid.innerHTML = '<div class="state-msg">Курсів не знайдено</div>';
      renderPager(pagination);
      return;
    }

    // Рендеримо картки
    grid.innerHTML = courses.map((c, i) => `
      <div class="card" style="animation-delay:${i * 0.05}s">
        <span class="card-tag">${c.instructor}</span>
        <h3>${c.title}</h3>
        <p class="card-desc">${c.description}</p>
        <div class="card-meta">
          <span class="card-price ${c.price === 0 ? 'free' : ''}">
            ${c.price === 0 ? 'Безкоштовно' : `${c.price} ₴`}
          </span>
          <span class="card-duration">⏱ ${c.duration} год</span>
        </div>
      </div>
    `).join('');

    renderPager(pagination);
    currentPage = pagination.page;
  }

  // ── Пагінація ──
  function renderPager({ page, pages }) {
    const pager = document.getElementById('pager');
    if (pages <= 1) { pager.innerHTML = ''; return; }

    let html = `<button ${page <= 1 ? 'disabled' : ''} onclick="goPage(${page - 1})">← Назад</button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="${i === page ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
    }
    html += `<button ${page >= pages ? 'disabled' : ''} onclick="goPage(${page + 1})">Вперед →</button>`;
    pager.innerHTML = html;
  }

  function goPage(p) {
    loadCourses(p, document.getElementById('instructorFilter').value);
  }

  // ── Фільтр з debounce ──
  // debounce — затримує виконання функції до того, як користувач
  // перестане друкувати (300ms). Без цього кожна літера → запит до API.
  document.getElementById('instructorFilter').addEventListener('input', (e) => {
    clearTimeout(filterTimeout);
    filterTimeout = setTimeout(() => {
      currentPage = 1;
      loadCourses(1, e.target.value);
    }, 300);
  });

  // Початкове завантаження
  loadCourses();