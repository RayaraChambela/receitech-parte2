// /public/js/pesquisa.js
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card-receita');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.recipeId;
      if (!id) return;

      // Ajusta essa rota para o que você usa no backend:
      // /receitas/:id, /receita/:id, etc.
      window.location.href = `/receitas/${id}`;
    });
  });
});
