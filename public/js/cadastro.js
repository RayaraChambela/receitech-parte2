async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const senha = document.getElementById('senha').value;

    if (!nome || !email || !senha) {
      alert('Preencha todos os campos');
      return;
    }
    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      const passwordHash = await sha256(senha);

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const exists = users.some(u => u.email === email);
      if (exists) {
        alert('Este e-mail já está cadastrado.');
        return;
      }

      const novoUsuario = {
        id: Date.now(),
        nome,
        email,
        passwordHash,     
        fotoPerfil: '/assets/user-placeholder.png'
      };

      users.push(novoUsuario);
      localStorage.setItem('users', JSON.stringify(users));

      const token = btoa(`${email}.${Date.now()}`);
      localStorage.setItem('authToken', token);
      localStorage.setItem('usuario', JSON.stringify({
        id: novoUsuario.id,
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        fotoPerfil: novoUsuario.fotoPerfil
      }));

      window.location.href = '/perfil';
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao cadastrar. Tente novamente.');
    }
  });
});
