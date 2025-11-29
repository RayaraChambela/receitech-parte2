// public/js/categorias.js
document.addEventListener('DOMContentLoaded', () => {
  // Dropdown da navbar
  document.querySelectorAll('.dropdown-item[data-categoria]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const categoria = (btn.dataset.categoria || btn.textContent.trim()).trim();
      if (!categoria) return;

      // 👇 CASO ESPECIAL: TODAS AS RECEITAS
      if (categoria.toLowerCase() === 'todas as receitas') {
        window.location.href = '/categorias'; // sem filtro
        return;
      }

      window.location.href =
        `/categorias?categoria=${encodeURIComponent(categoria)}`;
    });
  });

  // Bolinhas de categoria na home
  document.querySelectorAll('.bolinha-categoria').forEach((bolinha) => {
    bolinha.addEventListener('click', () => {
      const categoria = bolinha.dataset.categoria;
      if (!categoria) return;

      // se algum dia tiver bolinha "Todas as receitas"
      if (categoria.toLowerCase() === 'todas as receitas') {
        window.location.href = '/categorias';
        return;
      }

      window.location.href =
        `/categorias?categoria=${encodeURIComponent(categoria)}`;
    });
  });

  // Clique no card leva pra página da receita
  document.querySelectorAll('.card-receita').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.recipeId;
      if (!id) return;
      window.location.href = `/receitas/${id}`;
    });
  });
});
