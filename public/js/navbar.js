document.addEventListener('DOMContentLoaded', () => {
  const campo = document.getElementById('campo-pesquisa');
  if (campo) {
    campo.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        const termo = this.value.trim();
        if (termo) {
          window.location.href = `/pesquisa?termo=${encodeURIComponent(termo)}`;
        }
      }
    });
  }

  try {
    const raw = localStorage.getItem('usuario');
    if (raw) {
      const usuario = JSON.parse(raw);
      if (usuario && usuario.fotoPerfil) {
        const navbarIcon = document.querySelector('.user-icon img');
        if (navbarIcon) navbarIcon.src = usuario.fotoPerfil;
      }
      if (usuario) {
        const perfilLink = document.querySelector('.user-icon');
        if (perfilLink) perfilLink.setAttribute('href', '/perfil');
      }
    }
  } catch (_) {
  }
});
