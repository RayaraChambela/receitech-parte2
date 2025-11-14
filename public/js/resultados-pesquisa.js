function normalizarTexto(texto){
  return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}

function obterParametroBusca(){
  const params = new URLSearchParams(window.location.search);
  return params.get('termo') || '';
}

function exibirResultados(termo){
  const container = document.getElementById('resultados');
  const titulo = document.getElementById('titulo-pesquisa');
  if (!container) return;

  container.innerHTML = '';
  if (titulo) titulo.textContent = `Resultados da Pesquisa: "${termo}"`;

  const receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
  const termoNorm = normalizarTexto(termo);

  const resultados = receitas.filter((r) => {
    const nome = normalizarTexto(r.nome || '');
    if (nome.includes(termoNorm)) return true;

    // pequeno relaxamento no plural simples
    const tSemS = termoNorm.replace(/s$/, '');
    const nSemS = nome.replace(/s$/, '');
    return nSemS.includes(tSemS);
  });

  if (resultados.length === 0){
    container.innerHTML = `<p>Nenhuma receita encontrada para "${termo}".</p>`;
    return;
  }

  resultados.forEach((receita) => {
    const card = document.createElement('div');
    card.classList.add('card-receita');

    const imagem = (receita.imagens && receita.imagens.length > 0)
      ? receita.imagens[0]
      : '/assets/imagem-padrao.png';

    card.innerHTML = `
      <img src="${imagem}" alt="${receita.nome}">
      <div class="card-receita-conteudo">
        <h3 title="${receita.nome}">${receita.nome}</h3>
        <div class="tempo">
          <img src="/assets/icon-tempo.svg" alt="Relógio">
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

// Inicialização
const termo = obterParametroBusca();
const campo = document.getElementById('campo-pesquisa');
if (campo) campo.value = termo;
exibirResultados(termo);

// Enter na barra de busca (mantém rota /pesquisa)
document.getElementById('campo-pesquisa')?.addEventListener('keypress', function(e){
  if (e.key === 'Enter'){
    const novoTermo = this.value.trim();
    if (novoTermo){
      window.location.href = `/pesquisa?termo=${encodeURIComponent(novoTermo)}`;
    }
  }
});
