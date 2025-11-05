let etapaAtual = 1;
const TOTAL_ETAPAS = 5;

const dadosReceita = {
  id: '',
  nome: '',
  categoria: '',
  sobre: '',
  ingredientes: [],
  preparo: [],
  tempoPreparo: '',
  dica: '',
  imagens: [],
  autor: '',
  emailAutor: ''
};

(function ensureAuth() {
  try {
    const u = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!u || !u.email) {
      alert('Faça login para criar uma receita.');
      window.location.href = '/login';
    }
  } catch (_) {}
})();

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-etapa-1')?.addEventListener('click', (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value.trim();
    const categoria = document.getElementById('categoria').value.trim();
    const sobre = document.getElementById('sobre').value.trim();

    if (!nome || !categoria || !sobre) {
      alert('Preencha todos os campos!');
      return;
    }
    dadosReceita.nome = nome;
    dadosReceita.categoria = categoria;
    dadosReceita.sobre = sobre;
    mudarEtapa(2);
  });

  document.getElementById('btn-add-ingrediente')?.addEventListener('click', adicionarIngrediente);
  document.getElementById('btn-etapa-2')?.addEventListener('click', (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('#lista-ingredientes input');
    dadosReceita.ingredientes = [...inputs].map(i => i.value.trim()).filter(Boolean);
    if (dadosReceita.ingredientes.length === 0) {
      alert('Adicione pelo menos um ingrediente!');
      return;
    }
    mudarEtapa(3);
  });

  document.getElementById('btn-add-preparo')?.addEventListener('click', adicionarEtapaPreparo);
  document.getElementById('btn-etapa-3')?.addEventListener('click', (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll('#lista-preparo input');
    dadosReceita.preparo = [...inputs].map(i => i.value.trim()).filter(Boolean);
    dadosReceita.tempoPreparo = document.getElementById('tempo-preparo').value.trim();
    if (dadosReceita.preparo.length === 0 || !dadosReceita.tempoPreparo) {
      alert('Adicione as etapas de preparo e o tempo!');
      return;
    }
    mudarEtapa(4);
  });

  document.getElementById('btn-etapa-4')?.addEventListener('click', (e) => {
    e.preventDefault();
    dadosReceita.dica = document.getElementById('dica').value.trim();
    mudarEtapa(5);
  });

  document.getElementById('btn-finalizar')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const input = document.querySelector('#lista-imagens input');
    if (!input?.files?.[0]) {
      alert('Adicione uma imagem!');
      return;
    }
    try {
      const dataUrl = await fileToDataURL(input.files[0]);
      dadosReceita.imagens.push(dataUrl);
      salvarLocalStorage();
    } catch (err) {
      console.error(err);
      alert('Não foi possível ler a imagem. Tente novamente.');
    }
  });

  document.querySelectorAll('[data-voltar]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (etapaAtual > 1) mudarEtapa(etapaAtual - 1);
    });
  });

  atualizarProgresso();
});

function adicionarIngrediente() {
  const lista = document.getElementById('lista-ingredientes');
  const index = lista.querySelectorAll('input').length + 1;
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `${index} -`;
  lista.appendChild(input);
}

function adicionarEtapaPreparo() {
  const lista = document.getElementById('lista-preparo');
  const index = lista.querySelectorAll('input').length + 1;
  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = `${index} -`;
  lista.appendChild(input);
}

function mudarEtapa(nova) {
  const atual = document.getElementById(`etapa-${etapaAtual}`);
  const prox = document.getElementById(`etapa-${nova}`);
  if (atual) atual.style.display = 'none';
  if (prox) prox.style.display = 'block';
  etapaAtual = nova;
  atualizarProgresso();
}

function atualizarProgresso() {
  const bolinha = document.querySelector('.bolinha');
  const barra = document.querySelector('.progress-bar');
  const pct = ((etapaAtual - 1) / (TOTAL_ETAPAS - 1)) * 100; // 0%..100%
  if (bolinha) bolinha.style.left = `${pct}%`;
  if (barra) barra.style.width = `${pct}%`;
}

function salvarLocalStorage() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
  if (!usuario.email) {
    alert('Usuário não encontrado. Faça login novamente.');
    window.location.href = '/login';
    return;
  }

  const receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
  dadosReceita.id = Date.now();
  dadosReceita.autor = usuario.nome || 'Anônimo';
  dadosReceita.emailAutor = usuario.email;

  receitas.push(dadosReceita);
  localStorage.setItem('receitas', JSON.stringify(receitas));

  window.location.href = `/receita?id=${dadosReceita.id}`;
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
