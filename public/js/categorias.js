document.addEventListener('DOMContentLoaded', () => {
  // Função auxiliar para navegação
  const navegarParaCategoria = (categoria) => {
    if (!categoria) return;
    
    const url = categoria.toLowerCase() === 'todas as receitas'
      ? '/categorias'
      : `/categorias?categoria=${encodeURIComponent(categoria)}`;
    
    window.location.href = url;
  };

  // Dropdown da navbar
  document.querySelectorAll('.dropdown-item[data-categoria]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const categoria = (btn.dataset.categoria || btn.textContent.trim()).trim();
      navegarParaCategoria(categoria);
    });
  });

  // Bolinhas de categoria
  document.querySelectorAll('.bolinha-categoria').forEach((bolinha) => {
    bolinha.addEventListener('click', () => {
      navegarParaCategoria(bolinha.dataset.categoria);
    });
  });
});