// public/js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
  // ====== BUSCA NA NAVBAR (Enter) ======
  const campoPesquisa = document.getElementById('campo-pesquisa');

  if (campoPesquisa) {
    campoPesquisa.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const termo = this.value.trim();
        if (termo) {
          window.location.href = `/pesquisa?termo=${encodeURIComponent(termo)}`;
        }
      }
    });
  }

// ====== ÍCONE / FOTO DO USUÁRIO NA NAVBAR ======
const userLink =
  document.getElementById('user-link') ||
  document.querySelector('.user-icon');

// tenta achar a imagem do perfil em diferentes formatos de HTML
const userImg =
  document.querySelector('.navbar .perfil-navbar img') || // caso .perfil-navbar seja wrapper
  document.querySelector('.navbar img.perfil-navbar')   || // caso a própria img tenha a classe
  document.querySelector('.navbar .user-icon img')      || // outras páginas
  (userLink ? userLink.querySelector('img') : null);

if (userLink && userImg) {
  let usuario = null;
  let token = null;

  try {
    const usuarioStr = localStorage.getItem('usuario');
    token = localStorage.getItem('token');

    if (usuarioStr) {
      usuario = JSON.parse(usuarioStr);
    }
  } catch (err) {
    console.warn('Erro ao ler usuário do localStorage:', err);
  }

  // Se estiver logado (usuario + token), troca a foto
  if (usuario && token) {
    if (usuario.avatar_url) {
      userImg.src = usuario.avatar_url;
    } else if (usuario.fotoPerfil) {
      userImg.src = usuario.fotoPerfil;
    }
    // se não tiver nada, mantém o ícone padrão do HTML
  }

  // Clique no ícone: se logado vai pro perfil, senão vai pro login
  userLink.addEventListener('click', (e) => {
    e.preventDefault();

    const usuarioStrAtual = localStorage.getItem('usuario');
    const tokenAtual = localStorage.getItem('token');

    if (usuarioStrAtual && tokenAtual) {
      window.location.href = '/perfil';
    } else {
      window.location.href = '/login'; // ou /register se preferir
    }
  });
}


  // ====== CATEGORIAS DO DROPDOWN ======
  document
    .querySelectorAll('.dropdown-item[data-categoria]')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const categoria = btn.dataset.categoria || btn.textContent.trim();
        if (!categoria) return;
        window.location.href = `/categorias?categoria=${encodeURIComponent(
          categoria
        )}`;
      });
    });

  document.querySelectorAll('.dropdown-subitem').forEach((btn) => {
    btn.addEventListener('click', () => {
      const categoria = btn.dataset.categoria;
      const subcategoria = btn.dataset.subcategoria;
      if (!categoria) return;

      const params = new URLSearchParams({ categoria });
      if (subcategoria) params.append('subcategoria', subcategoria);

      window.location.href = `/categorias?${params.toString()}`;
    });
  });
});
