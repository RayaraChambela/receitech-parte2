// public/js/perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  // se não estiver logado, volta pra HOME
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
  if (usuario.fotoPerfil && imgPerfilEl) {
    imgPerfilEl.src = usuario.fotoPerfil;
  }

  // ==============================
  // POPUP FOTO DE PERFIL
  // ==============================
  const popupFoto = document.getElementById('popup-foto') || document.getElementById('popup');
  const btnOpenFoto = document.getElementById('btn-open-foto');
  const btnCloseFoto = document.getElementById('close-foto');
  const inputImagem = document.getElementById('imagem');
  const btnExcluirFoto = document.getElementById('img-btn-excluir');
  const btnSalvarFoto = document.getElementById('salvar');
  const previewFoto = document.getElementById('preview-foto');

  function abrirPopupFoto() {
    if (popupFoto) popupFoto.style.display = 'flex';
    if (previewFoto && imgPerfilEl) {
      previewFoto.src = imgPerfilEl.src;
    }
  }

  function fecharPopupFoto() {
    if (popupFoto) popupFoto.style.display = 'none';
    if (inputImagem) inputImagem.value = '';
  }

  if (btnOpenFoto) {
    btnOpenFoto.addEventListener('click', (e) => {
      e.preventDefault();
      abrirPopupFoto();
    });
  }

  if (btnCloseFoto) {
    btnCloseFoto.addEventListener('click', (e) => {
      e.preventDefault();
      fecharPopupFoto();
    });
  }

  if (popupFoto) {
    popupFoto.addEventListener('click', (e) => {
      if (e.target === popupFoto) fecharPopupFoto();
    });
  }

  if (inputImagem) {
    inputImagem.addEventListener('change', () => {
      const file = inputImagem.files[0];
      if (!file || !previewFoto) return;

      const reader = new FileReader();
      reader.onload = function (ev) {
        previewFoto.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  if (btnExcluirFoto) {
    btnExcluirFoto.addEventListener('click', (e) => {
      e.preventDefault();
      if (imgPerfilEl) imgPerfilEl.src = '/assets/icon-img-perfil.png';
      if (previewFoto) previewFoto.src = '/assets/icon-img-perfil.png';

      delete usuario.fotoPerfil;
      localStorage.setItem('usuario', JSON.stringify(usuario));

      const navbarIcon = document.querySelector('.user-icon img');
      if (navbarIcon) navbarIcon.src = '/assets/user-placeholder.png';
    });
  }

  if (btnSalvarFoto) {
    btnSalvarFoto.addEventListener('click', (e) => {
      e.preventDefault();

      const file = inputImagem && inputImagem.files ? inputImagem.files[0] : null;
      if (!file) {
        fecharPopupFoto();
        return;
      }

      const reader = new FileReader();
      reader.onload = function (ev) {
        const dataUrl = ev.target.result;

        if (imgPerfilEl) imgPerfilEl.src = dataUrl;
        if (previewFoto) previewFoto.src = dataUrl;

        usuario.fotoPerfil = dataUrl;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        const navbarIcon = document.querySelector('.user-icon img');
        if (navbarIcon) navbarIcon.src = dataUrl;

        fecharPopupFoto();
      };
      reader.readAsDataURL(file);
    });
  }

  // ==============================
  // POPUP EDITAR PERFIL (LÁPIS)
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

    if (inputNome) inputNome.value = usuario.name || '';
    if (inputEmail) inputEmail.value = usuario.email || '';
    if (inputSenha) inputSenha.value = '';
  }

  function fecharPopupEditar() {
    if (popupEditar) popupEditar.style.display = 'none';
  }

  if (btnOpenEditar) {
    btnOpenEditar.addEventListener('click', (e) => {
      e.preventDefault();
      abrirPopupEditar();
    });
  }

  if (btnCloseEditar) {
    btnCloseEditar.addEventListener('click', (e) => {
      e.preventDefault();
      fecharPopupEditar();
    });
  }

  if (popupEditar) {
    popupEditar.addEventListener('click', (e) => {
      if (e.target === popupEditar) fecharPopupEditar();
    });
  }

  if (formEditar) {
    formEditar.addEventListener('submit', (e) => {
      e.preventDefault();

      const novoNome = inputNome ? inputNome.value.trim() : '';
      const novoEmail = inputEmail ? inputEmail.value.trim() : '';
      const novaSenha = inputSenha ? inputSenha.value.trim() : '';

      if (novoNome) usuario.name = novoNome;
      if (novoEmail) usuario.email = novoEmail;
      if (novaSenha) {
        // por enquanto só guardamos no localStorage;
        // quando tiver API, manda pro backend aqui
        usuario.password = novaSenha;
      }

      localStorage.setItem('usuario', JSON.stringify(usuario));

      if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuario.name || 'Usuário';
      if (emailUsuarioEl) emailUsuarioEl.textContent = usuario.email || '';

      fecharPopupEditar();
    });
  }

  // ==============================
  // EXCLUIR CONTA
  // ==============================
  if (btnExcluirConta) {
    btnExcluirConta.addEventListener('click', async (e) => {
      e.preventDefault();

      const confirmar = window.confirm(
        'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.'
      );
      if (!confirmar) return;

      try {
        const resposta = await fetch('/usuario/excluir', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: usuario.email })
        });

        if (!resposta.ok) {
          const data = await resposta.json().catch(() => ({}));
          console.error('Erro ao excluir conta:', data);
          alert('Erro ao excluir conta. Tente novamente.');
          return;
        }

        // deu certo: limpa front e volta pra HOME
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        window.location.href = '/';
      } catch (err) {
        console.error(err);
        alert('Erro de conexão ao excluir conta.');
      }
    });
  }

  // ==============================
  // LOGOUT
  // ==============================
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        await fetch('/usuario/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('Erro ao deslogar no servidor (vou limpar mesmo assim).', err);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');

      // volta pra HOME
      window.location.href = '/';
    });
  }
});
