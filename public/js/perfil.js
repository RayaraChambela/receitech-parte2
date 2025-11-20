// public/js/perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  // Se não estiver logado → volta pra home
  if (!token || !usuarioStr) {
    window.location.href = '/';
    return;
  }

  let usuario = JSON.parse(usuarioStr);

  const nomeUsuarioEl = document.getElementById('nome-usuario');
  const emailUsuarioEl = document.getElementById('email-usuario');
  const imgPerfilEl = document.getElementById('img-perfil');

  if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuario.name || 'Usuário';
  if (emailUsuarioEl) emailUsuarioEl.textContent = usuario.email || '';

  // Foto do usuário (prioriza avatar_url salvo no BD)
  if (usuario.avatar_url && imgPerfilEl) {
    imgPerfilEl.src = usuario.avatar_url;
  } else if (imgPerfilEl) {
    imgPerfilEl.src = '/assets/icon-img-perfil.png';
  }

  // ==============================
  // POPUP FOTO DE PERFIL
  // ==============================
  const popupFoto = document.getElementById('popup-foto');
  const btnOpenFoto = document.getElementById('btn-open-foto');
  const btnCloseFoto = document.getElementById('close-foto');
  const inputImagem = document.getElementById('imagem');
  const btnExcluirFoto = document.getElementById('img-btn-excluir');
  const btnSalvarFoto = document.getElementById('salvar');
  const previewFoto = document.getElementById('preview-foto');

  function abrirPopupFoto() {
    if (!popupFoto) return;
    popupFoto.style.display = 'flex';
    if (previewFoto && imgPerfilEl) {
      previewFoto.src = imgPerfilEl.src;
    }
  }

  function fecharPopupFoto() {
    if (popupFoto) popupFoto.style.display = 'none';
    if (inputImagem) inputImagem.value = '';
  }

  // Abrir popup da foto
  btnOpenFoto?.addEventListener('click', (e) => {
    e.preventDefault();
    abrirPopupFoto();
  });

  // Fechar popup da foto
  btnCloseFoto?.addEventListener('click', (e) => {
    e.preventDefault();
    fecharPopupFoto();
  });

  popupFoto?.addEventListener('click', (e) => {
    if (e.target === popupFoto) fecharPopupFoto();
  });

  // Preview local antes de enviar
  inputImagem?.addEventListener('change', () => {
    const file = inputImagem.files[0];
    if (!file || !previewFoto) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      previewFoto.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // REMOVER FOTO DE PERFIL (envia DELETE pro backend com email)
  btnExcluirFoto?.addEventListener('click', async (e) => {
    e.preventDefault();

    const confirmar = window.confirm(
      'Tem certeza que deseja remover sua foto de perfil?'
    );
    if (!confirmar) return;

    try {
      const res = await fetch('/usuario/avatar', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: usuario.email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Erro ao remover avatar:', data);
        alert(data.error || 'Erro ao remover foto de perfil.');
        return;
      }

      // atualiza objeto usuario vindo do backend (avatar_url = null)
      usuario = data.user;
      localStorage.setItem('usuario', JSON.stringify(usuario));

      // volta para a imagem padrão em todos os lugares
      if (imgPerfilEl) imgPerfilEl.src = '/assets/icon-img-perfil.png';
      if (previewFoto) previewFoto.src = '/assets/icon-img-perfil.png';

      const navbarIcon = document.querySelector('.user-icon img');
      if (navbarIcon) {
        navbarIcon.src = '/assets/user-placeholder.png';
      }

      fecharPopupFoto();
    } catch (err) {
      console.error('Erro de conexão ao remover avatar:', err);
      alert('Erro ao remover foto de perfil.');
    }
  });

  // SALVAR FOTO → envia para backend com FormData
  btnSalvarFoto?.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!inputImagem) {
      fecharPopupFoto();
      return;
    }

    const file = inputImagem.files[0];
    if (!file) {
      fecharPopupFoto();
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', usuario.email); // identifica o usuário no backend

    try {
      const res = await fetch('/usuario/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const texto = await res.text();
        console.error('Erro ao atualizar avatar:', texto);
        alert('Erro ao salvar foto de perfil.');
        return;
      }

      const data = await res.json();
      usuario = data.user;

      localStorage.setItem('usuario', JSON.stringify(usuario));

      if (imgPerfilEl) imgPerfilEl.src = usuario.avatar_url;
      if (previewFoto) previewFoto.src = usuario.avatar_url;

      const navbarIcon = document.querySelector('.user-icon img');
      if (navbarIcon) navbarIcon.src = usuario.avatar_url;

      fecharPopupFoto();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar foto de perfil.');
    }
  });

  // ==============================
  // POPUP EDITAR PERFIL
  // ==============================
  const popupEditar = document.getElementById('popup-editar');
  const btnOpenEditar =
    document.getElementById('edit-perfil-link') ||
    document.getElementById('edit-perfil');
  const btnCloseEditar = document.getElementById('close-editar');
  const formEditar = document.getElementById('form-editar-perfil');
  const inputNome = document.getElementById('nome');
  const inputEmail = document.getElementById('email');
  const inputSenha = document.getElementById('senha');
  const btnExcluirConta = document.getElementById('btn-excluir-conta');
  const btnLogout = document.getElementById('btn-logout');

  function abrirPopupEditar() {
    if (!popupEditar) return;
    popupEditar.style.display = 'flex';
    if (inputNome) inputNome.value = usuario.name;
    if (inputEmail) inputEmail.value = usuario.email;
    if (inputSenha) inputSenha.value = '';
  }

  function fecharPopupEditar() {
    if (popupEditar) popupEditar.style.display = 'none';
  }

  btnOpenEditar?.addEventListener('click', (e) => {
    e.preventDefault();
    abrirPopupEditar();
  });

  btnCloseEditar?.addEventListener('click', (e) => {
    e.preventDefault();
    fecharPopupEditar();
  });

  popupEditar?.addEventListener('click', (e) => {
    if (e.target === popupEditar) fecharPopupEditar();
  });

  // Editar perfil (ainda localStorage por enquanto)
  formEditar?.addEventListener('submit', (e) => {
    e.preventDefault();

    const novoNome = inputNome ? inputNome.value.trim() : '';
    const novoEmail = inputEmail ? inputEmail.value.trim() : '';
    const novaSenha = inputSenha ? inputSenha.value.trim() : '';

    if (novoNome) usuario.name = novoNome;
    if (novoEmail) usuario.email = novoEmail;
    if (novaSenha) usuario.password = novaSenha;

    localStorage.setItem('usuario', JSON.stringify(usuario));

    if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuario.name;
    if (emailUsuarioEl) emailUsuarioEl.textContent = usuario.email;

    fecharPopupEditar();
  });

  // ==============================
  // EXCLUIR CONTA
  // ==============================
  btnExcluirConta?.addEventListener('click', async (e) => {
    e.preventDefault();

    if (!confirm('Tem certeza que deseja excluir sua conta?')) return;

    try {
      const res = await fetch('/usuario/excluir', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email }),
      });

      if (!res.ok) {
        alert('Erro ao excluir conta.');
        return;
      }

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir conta.');
    }
  });

  // ==============================
  // LOGOUT
  // ==============================
  btnLogout?.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      await fetch('/usuario/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    window.location.href = '/';
  });

  // ==============================
  // FEED DE RECEITAS DO USUÁRIO
  // ==============================
  const feedContainer = document.getElementById('feed-usuario');

  async function carregarReceitasUsuario() {
    if (!feedContainer || !usuario.id) return;

    try {
      const res = await fetch(`/receitas/usuario/${usuario.id}`);

      console.log('GET /receitas/usuario', usuario.id, 'status:', res.status);

      if (!res.ok) {
        console.error('Erro HTTP ao buscar receitas do usuário');
        feedContainer.innerHTML = '<p>Erro ao carregar suas receitas.</p>';
        return;
      }

      const data = await res.json().catch(() => ({}));
      console.log('Resposta da API de receitas do usuário:', data);

      const receitas = data.recipes || data.receitas || [];

      if (!receitas.length) {
        feedContainer.innerHTML = '<p>Você ainda não publicou nenhuma receita.</p>';
        return;
      }

      const html = receitas
        .map(
          (r) => `
          <div class="receita-post" onclick="window.location.href='/receitas/${r.id}'">
            <img
              src="${r.cover_image || '/assets/img-bolinho.png'}"
              class="receita-feed-img"
              alt="${r.title}"
            >
          </div>
        `
        )
        .join('');

      feedContainer.innerHTML = html;
    } catch (err) {
      console.error('Erro ao carregar receitas do usuário:', err);
      feedContainer.innerHTML = '<p>Erro ao carregar suas receitas.</p>';
    }
  }

  carregarReceitasUsuario();



  // ==============================
  // BOTÃO "NOVO POST" → nova receita
  // ==============================
  const btnNovoPost = document.getElementById('btn-novo-post');

  if (btnNovoPost) {
    btnNovoPost.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/receitas/nova';
    });
  }
});
