// public/js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
  // Tenta achar pelo id primeiro, depois pelo class
  const userLink = document.getElementById('user-link') || document.querySelector('.user-icon');
  const userImg  = document.querySelector('.user-icon img') || document.querySelector('#user-link img');

  if (!userLink || !userImg) return;

  // Atualiza ícone com foto salva (se tiver)
  const usuarioStr = localStorage.getItem('usuario');
  const token      = localStorage.getItem('token');

  if (usuarioStr && token) {
    try {
      const usuario = JSON.parse(usuarioStr);

      if (usuario.fotoPerfil) {
        userImg.src = usuario.fotoPerfil;
      } else if (usuario.avatar_url) {
        userImg.src = usuario.avatar_url;
      }
    } catch (e) {
      console.warn('Erro ao ler usuario do localStorage:', e);
    }
  }

  // Clique no ícone
  userLink.addEventListener('click', (e) => {
    e.preventDefault();

    const usuarioStr = localStorage.getItem('usuario');
    const token      = localStorage.getItem('token');

    // 👉 Regra nova:
    // - se NÃO estiver logado → /register
    // - se estiver logado → /perfil
    if (usuarioStr && token) {
      window.location.href = '/perfil';
    } else {
      window.location.href = '/register';
    }
  });
});
