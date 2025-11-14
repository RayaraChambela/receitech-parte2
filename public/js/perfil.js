// public/js/perfil.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');

  if (!token || !usuarioStr) {
    // se não estiver logado, manda pro login
    window.location.href = '/login';
    return;
  }

  const usuario = JSON.parse(usuarioStr);

  const nomeUsuarioEl = document.getElementById('nome-usuario');
  const emailUsuarioEl = document.getElementById('email-usuario');
  const imgPerfilEl = document.getElementById('img-perfil');

  if (nomeUsuarioEl) nomeUsuarioEl.textContent = usuario.name || 'Usuário';
  if (emailUsuarioEl) emailUsuarioEl.textContent = usuario.email || '';

  // foto salva no localStorage (cliente)
  const fotoLocal = usuario.fotoPerfil;
  if (fotoLocal && imgPerfilEl) {
    imgPerfilEl.src = fotoLocal;
  }

  // POPUP FOTO
  const popupFoto = document.getElementById('popup-foto');
  const btnOpenFoto = document.getElementById('btn-open-foto');
  const btnCloseFoto = document.getElementById('close-foto');
  const inputImagem = document.getElementById('imagem');
  const btnExcluirFoto = document.getElementById('img-btn-excluir');
  const btnSalvarFoto = document.getElementById('salvar');

  function abrirPopupFoto() {
    if (popupFoto) popupFoto.style.display = 'flex';
  }
  function fecharPopupFoto() {
    if (popupFoto) popupFoto.style.display = 'none';
  }

  if (btnOpenFoto) btnOpenFoto.addEventListener('click', (e) => {
    e.preventDefault();
    abrirPopupFoto();
  });

  if (btnCloseFoto) btnCloseFoto.addEventListener('click', (e) => {
    e.preventDefault();
    fecharPopupFoto();
  });

  if (btnExcluirFoto) {
    btnExcluirFoto.addEventListener('click', (e) => {
      e.preventDefault();
      if (imgPerfilEl) imgPerfilEl.src = '/assets/icon-img-perfil.png';
      delete usuario.fotoPerfil;
      localStorage.setItem('usuario', JSON.stringify(usuario));
      
      // atualizar navbar também
      const navbarIcon = document.querySelector('.user-icon img');
      if (navbarIcon) navbarIcon.src = '/assets/user-placeholder.png';
    });
  }

  if (btnSalvarFoto && inputImagem) {
    btnSalvarFoto.addEventListener('click', (e) => {
      e.preventDefault();
      const file = inputImagem.files[0];
      if (!file) {
        fecharPopupFoto();
        return;
      }

      const reader = new FileReader();
      reader.onload = function (ev) {
        const dataUrl = ev.target.result;
        if (imgPerfilEl) imgPerfilEl.src = dataUrl;

        usuario.fotoPerfil = dataUrl;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // atualiza navbar
        const navbarIcon = document.querySelector('.user-icon img');
        if (navbarIcon) navbarIcon.src = dataUrl;

        fecharPopupFoto();
      };
      reader.readAsDataURL(file);
    });
  }

  // TODO: popup de edição de nome/email/senha + excluir conta
  // por enquanto, podemos só atualizar localStorage pro nome/email
  // e depois conectamos isso com a API /user/update.
});
