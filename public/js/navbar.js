// public/js/navbar.js

document.addEventListener('DOMContentLoaded', () => {
  // Link/ícone do usuário na navbar
  const userLink =
    document.getElementById('user-link') ||
    document.querySelector('.user-icon');

  const userImg =
    document.querySelector('.user-icon img') ||
    (userLink ? userLink.querySelector('img') : null);

  // Se não tiver ícone/link, não faz nada
  if (!userLink || !userImg) return;

  // Lê dados do localStorage
  const usuarioStr = localStorage.getItem('usuario');
  const token      = localStorage.getItem('token');

  if (usuarioStr && token) {
    try {
      const usuario = JSON.parse(usuarioStr);

      // Prioriza avatar_url vindo do backend
      if (usuario.avatar_url) {
        userImg.src = usuario.avatar_url;
      }
      // Mantém compat com versão antiga usando fotoPerfil (base64)
      else if (usuario.fotoPerfil) {
        userImg.src = usuario.fotoPerfil;
      }
      // Se não tiver nada, deixa o src que já está no HTML
      // (ex: /assets/user-placeholder.png)
    } catch (e) {
      console.warn('Erro ao ler usuario do localStorage:', e);
    }
  }

  // Clique no ícone: se logado vai pro perfil, senão vai pro cadastro
  userLink.addEventListener('click', (e) => {
    e.preventDefault();

    const usuarioStrAtual = localStorage.getItem('usuario');
    const tokenAtual      = localStorage.getItem('token');

    if (usuarioStrAtual && tokenAtual) {
      window.location.href = '/perfil';
    } else {
      window.location.href = '/register';
    }
  });
});
