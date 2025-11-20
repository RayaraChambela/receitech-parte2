// public/js/receita.js
document.addEventListener('DOMContentLoaded', () => {
  const campo = document.getElementById('campo-pesquisa');

  campo?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const termo = campo.value.trim();
      if (termo) {
        window.location.href = `/pesquisa?termo=${encodeURIComponent(termo)}`;
      }
    }
  });
});
