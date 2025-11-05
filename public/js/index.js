document.addEventListener('DOMContentLoaded', () => {
  const categoriaButtons = [
    ...document.querySelectorAll('.dropdown-item[data-categoria]'),
    ...document.querySelectorAll('.bolinha-categoria')
  ];

  categoriaButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const c = e.currentTarget.dataset.categoria || e.currentTarget.querySelector('p')?.textContent;
      if (!c) return;
      filtrarPorCategoria(c);
    });
  });

  const campoPesquisa = document.getElementById('campo-pesquisa');
  if (campoPesquisa) {
    campoPesquisa.addEventListener('input', (e) => {
      filtrarPorTexto(e.target.value);
    });
  }
});

function filtrarPorCategoria(cat) {
  const cards = document.querySelectorAll('.receita-card');
  cards.forEach(card => {
    const titulo = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    const pertence = true; 
    card.style.display = pertence ? '' : 'none';
  });
}

function filtrarPorTexto(texto) {
  const t = (texto || '').toLowerCase().trim();
  const cards = document.querySelectorAll('.receita-card');
  cards.forEach(card => {
    const titulo = card.querySelector('h3')?.textContent?.toLowerCase() || '';
    card.style.display = titulo.includes(t) ? '' : 'none';
  });
}
