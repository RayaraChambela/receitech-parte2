// public/js/login.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  const msgErro = document.getElementById('mensagem-erro');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value.trim();

    msgErro.textContent = '';

    if (!login || !senha) {
      msgErro.textContent = 'Preencha login e senha.';
      return;
    }

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: login,      // login por e-mail
          password: senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        msgErro.textContent = data.error || 'Login ou senha inválidos.';
        return;
      }

      // Salva token + usuário no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));

      // Redireciona para o perfil
      window.location.href = '/perfil';
    } catch (err) {
      console.error('Erro no login:', err);
      msgErro.textContent = 'Erro ao conectar com o servidor.';
    }
  });
});
