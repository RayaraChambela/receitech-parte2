// public/js/cadastro.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastro');
  const msgErro = document.getElementById('mensagem-erro-cadastro');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    msgErro.textContent = '';

    if (!nome || !email || !senha) {
      msgErro.textContent = 'Preencha todos os campos.';
      return;
    }

    if (senha.length < 6) {
      msgErro.textContent = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nome,
          email,
          password: senha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        msgErro.textContent = data.error || 'Erro ao cadastrar usuário.';
        return;
      }

      // Salva token + usuário no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.user));

      // Vai direto pro perfil depois de cadastrar
      window.location.href = '/perfil';
    } catch (err) {
      console.error('Erro no cadastro:', err);
      msgErro.textContent = 'Erro ao conectar com o servidor.';
    }
  });
});
