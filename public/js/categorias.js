document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.dropdown-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      const categoria = btn.textContent.trim();
      window.location.href = `/categorias?categoria=${encodeURIComponent(categoria)}`;
    });
  });

  document.querySelectorAll('.bolinha-categoria').forEach((bolinha) => {
    bolinha.addEventListener('click', () => {
      const categoria = bolinha.dataset.categoria;
      window.location.href = `/categorias?categoria=${encodeURIComponent(categoria)}`;
    });
  });

  if (window.location.pathname === '/categorias') {
    const params = new URLSearchParams(window.location.search);
    const categoriaSelecionada = params.get('categoria');

    if (!categoriaSelecionada) {
      alert('Categoria não especificada.');
      window.location.href = '/';
      return;
    }

    const container = document.getElementById('resultado-categoria');
    const tituloCategoria = document.getElementById('titulo-categoria');
    if (tituloCategoria) tituloCategoria.textContent = `${categoriaSelecionada}`;

    const receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
    const filtradas = receitas.filter((r) => r.categoria === categoriaSelecionada);

    if (!container) return;

    if (filtradas.length === 0) {
      container.innerHTML = `<p>Nenhuma receita encontrada para a categoria "${categoriaSelecionada}".</p>`;
      return;
    }

    filtradas.forEach((receita) => {
      const card = document.createElement('div');
      card.classList.add('card-receita');

      const imagem = (receita.imagens && receita.imagens.length > 0)
        ? receita.imagens[0]
        : '/assets/padrao.jpg';

      card.innerHTML = `
        <img src="${imagem}" alt="${receita.nome}">
        <div class="card-receita-conteudo">
          <h3 title="${receita.nome}">${receita.nome}</h3>
          <div class="tempo">
            <img src="/assets/icon-tempo.svg" alt="Tempo">
            <span>${receita.tempoPreparo || ''}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        window.location.href = `/receita?id=${encodeURIComponent(receita.id)}`;
      });

      container.appendChild(card);
    });
  }
});
