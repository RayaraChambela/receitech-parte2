// public/js/navbar.js
document.addEventListener('DOMContentLoaded', () => {
  // =========================
  // ÍCONE / LOGIN DO USUÁRIO
  // =========================
  const userLink =
    document.getElementById('user-link') ||
    document.querySelector('.user-icon');

  const userImg =
    document.querySelector('.user-icon img') ||
    (userLink ? userLink.querySelector('img') : null);

  if (userLink && userImg) {
    const usuarioStr = localStorage.getItem('usuario');
    const token      = localStorage.getItem('token');

    if (usuarioStr && token) {
      try {
        const usuario = JSON.parse(usuarioStr);

        if (usuario.avatar_url) {
          userImg.src = usuario.avatar_url;
        } else if (usuario.fotoPerfil) {
          userImg.src = usuario.fotoPerfil;
        }
      } catch (e) {
        console.warn('Erro ao ler usuario do localStorage:', e);
      }
    }

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
  }

  // =========================
  // DROPDOWN DE CATEGORIAS
  // =========================

  // mesmo mapa de categorias/subcategorias que você usa no resto do app
  const mapaCategorias = {
    "Bolos e tortas": [
      "Bolos simples",
      "Bolos recheados",
      "Tortas doces",
      "Tortas salgadas"
    ],
    "Carnes": [
      "Bovina",
      "Suína",
      "Carne moída",
      "Churrasco"
    ],
    "Aves": [
      "Frango",
      "Peru",
      "Frango desfiado"
    ],
    "Peixes e frutos do mar": [
      "Peixes",
      "Camarão",
      "Frutos do mar variados"
    ],
    "Saladas e molhos": [
      "Saladas frias",
      "Saladas quentes",
      "Molhos para salada"
    ],
    "Sopas": [
      "Sopas leves",
      "Caldos"
    ],
    "Massas": [
      "Macarrão",
      "Lasanha",
      "Nhoque"
    ],
    "Bebidas": [
      "Sucos",
      "Drinks",
      "Sem álcool"
    ],
    "Lanches": [
      "Sanduíches",
      "Hambúrguer",
      "Salgados assados"
    ],
    "Doces e sobremesas": [
      "Pudins",
      "Mousses",
      "Gelatinas",
      "Brigadeiro"
    ],
    "Alimentação saudável": [
      "Low carb",
      "Vegetariano",
      "Vegano",
      "Fit"
    ]
  };

  const menu   = document.getElementById('categorias-menu');
  const toggle = document.getElementById('dropdownMenu2');

  if (!menu || !toggle) return;

  // Monta o menu (categoria + submenu de subcategorias)
  Object.entries(mapaCategorias).forEach(([categoria, subcats]) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'categoria-item';

    const btnCat = document.createElement('button');
    btnCat.type = 'button';
    btnCat.className = 'dropdown-item';
    btnCat.dataset.categoria = categoria;
    btnCat.textContent = categoria;
    wrapper.appendChild(btnCat);

    if (subcats && subcats.length) {
      const submenu = document.createElement('div');
      submenu.className = 'dropdown-submenu';

      subcats.forEach((sub) => {
        const subBtn = document.createElement('button');
        subBtn.type = 'button';
        subBtn.className = 'dropdown-subitem';
        subBtn.dataset.categoria = categoria;
        subBtn.dataset.subcategoria = sub;
        subBtn.textContent = sub;
        submenu.appendChild(subBtn);
      });

      wrapper.appendChild(submenu);
    }

    menu.appendChild(wrapper);
  });

  // Abre/fecha o dropdown
  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('show');
  });

  // Clicar fora fecha o menu
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && e.target !== toggle) {
      menu.classList.remove('show');
    }
  });

  // Navegação ao clicar nas categorias / subcategorias
  menu.addEventListener('click', (e) => {
    const subBtn = e.target.closest('.dropdown-subitem');
    const catBtn = e.target.closest('.dropdown-item');

    if (subBtn) {
      const categoria    = subBtn.dataset.categoria;
      const subcategoria = subBtn.dataset.subcategoria;
      window.location.href =
        `/categorias?categoria=${encodeURIComponent(categoria)}&subcategoria=${encodeURIComponent(subcategoria)}`;
      return;
    }

    if (catBtn) {
      const categoria = catBtn.dataset.categoria;
      window.location.href =
        `/categorias?categoria=${encodeURIComponent(categoria)}`;
    }
  });
});
