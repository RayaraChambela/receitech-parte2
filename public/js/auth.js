// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('form-register');
  const loginForm    = document.getElementById('form-login');

  // Registro
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name     = registerForm.querySelector('input[name="name"]').value.trim();
      const email    = registerForm.querySelector('input[name="email"]').value.trim();
      const password = registerForm.querySelector('input[name="password"]').value.trim();

      try {
        const res = await fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || 'Erro ao registrar.');
          return;
        }

        // salva token + usuário
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.user));

        // redireciona pra home
        window.location.href = '/';
      } catch (err) {
        console.error(err);
        alert('Erro de conexão ao registrar.');
      }
    });
  }

  // Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email    = loginForm.querySelector('input[name="email"]').value.trim();
      const password = loginForm.querySelector('input[name="password"]').value.trim();

      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || 'Erro ao fazer login.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.user));

        window.location.href = '/';
      } catch (err) {
        console.error(err);
        alert('Erro de conexão ao fazer login.');
      }
    });
  }

  // Botão de logout (se existir)
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/login';
    });
  }
});
