async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-login');
  const msg = document.getElementById('mensagem-erro');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    msg.textContent = '';

    const login = document.getElementById('login').value.trim();
    const senha = document.getElementById('senha').value;

    if (!login || !senha) {
      msg.textContent = 'Preencha login e senha.';
      return;
    }

    try {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (!Array.isArray(users) || users.length === 0) {
        msg.textContent = 'Nenhum usuário cadastrado.';
        return;
      }

      const lower = login.toLowerCase();
      const user = users.find(u =>
        (u.email && u.email.toLowerCase() === lower) ||
        (u.nome && u.nome.trim().toLowerCase() === lower)
      );

      if (!user) {
        msg.textContent = 'Login ou senha incorretos. Usuário não encontrado.';
        return;
      }

      const hash = await sha256(senha);
      if (hash !== user.passwordHash) {
        msg.textContent = 'Login ou senha incorretos.';
        return;
      }

      const token = btoa(`${user.email}.${Date.now()}`);
      localStorage.setItem('authToken', token);
      localStorage.setItem('usuario', JSON.stringify({
        id: user.id, nome: user.nome, email: user.email, fotoPerfil: user.fotoPerfil || '/assets/user-placeholder.png'
      }));

      window.location.href = '/perfil';
    } catch (e) {
      console.error(e);
      msg.textContent = 'Ocorreu um erro ao efetuar login. Tente novamente.';
    }
  });
});
