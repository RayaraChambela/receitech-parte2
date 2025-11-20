// public/js/nova-receita.js

let etapaAtual = 1;

// MAPA CATEGORIAS → SUBCATEGORIAS
const mapaCategorias = {
  "Bolos e tortas": [
    "Bolos simples",
    "Bolos recheados",
    "Tortas doces",
    "Tortas salgadas"
  ],
  "Carnes": [
    "Bovina",
    "Suína",
    "Carne moída",
    "Churrasco"
  ],
  "Aves": [
    "Frango",
    "Peru",
    "Frango desfiado"
  ],
  "Peixes e frutos do mar": [
    "Peixes",
    "Camarão",
    "Frutos do mar variados"
  ],
  "Saladas e molhos": [
    "Saladas frias",
    "Saladas quentes",
    "Molhos para salada"
  ],
  "Sopas": [
    "Sopas leves",
    "Caldos"
  ],
  "Massas": [
    "Macarrão",
    "Lasanha",
    "Nhoque"
  ],
  "Bebidas": [
    "Sucos",
    "Drinks",
    "Sem álcool"
  ],
  "Lanches": [
    "Sanduíches",
    "Hambúrguer",
    "Salgados assados"
  ],
  "Doces e sobremesas": [
    "Pudins",
    "Mousses",
    "Gelatinas",
    "Brigadeiro"
  ],
  "Alimentação saudável": [
    "Low carb",
    "Vegetariano",
    "Vegano",
    "Fit"
  ]
};

let dadosReceita = {
  nome: '',
  categoria: '',
  subcategoria: '',
  sobre: '',
  ingredientes: [],
  preparo: [],
  tempoPreparo: '',
  dica: ''
};

// garante que só entra aqui logado
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
  const selectCategoria = document.getElementById('categoria');
  if (selectCategoria) {
    selectCategoria.addEventListener('change', () => {
      preencherSubcategorias(selectCategoria.value);
    });
  }
});

/* ===================== SUBCATEGORIAS ===================== */

function preencherSubcategorias(categoriaSelecionada) {
  const selectSub = document.getElementById('subcategoria');
  selectSub.innerHTML = '';

  if (!categoriaSelecionada || !mapaCategorias[categoriaSelecionada]) {
    selectSub.disabled = true;
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'Selecione a categoria primeiro';
    selectSub.appendChild(opt);
    return;
  }

  selectSub.disabled = false;

  const optPadrao = document.createElement('option');
  optPadrao.value = '';
  optPadrao.textContent = 'Selecione';
  selectSub.appendChild(optPadrao);

  mapaCategorias[categoriaSelecionada].forEach(sub => {
    const opt = document.createElement('option');
    opt.value = sub;
    opt.textContent = sub;
    selectSub.appendChild(opt);
  });
}

/* ===================== ETAPAS ===================== */

function proximaEtapa() {
  const nome = document.getElementById('nome').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const subcategoria = document.getElementById('subcategoria').value.trim();
  const sobre = document.getElementById('sobre').value.trim();

  if (!nome || !categoria || !subcategoria || !sobre) {
    alert("Preencha todos os campos!");
    return;
  }

  dadosReceita.nome = nome;
  dadosReceita.categoria = categoria;
  dadosReceita.subcategoria = subcategoria;
  dadosReceita.sobre = sobre;

  mudarEtapa(2);
}

function salvarEtapa2() {
  const inputs = document.querySelectorAll('#lista-ingredientes input');
  dadosReceita.ingredientes = Array.from(inputs)
    .map(inp => inp.value.trim())
    .filter(val => val !== "");

  if (dadosReceita.ingredientes.length === 0) {
    alert("Adicione pelo menos um ingrediente!");
    return;
  }

  mudarEtapa(3);
}

function salvarEtapa3() {
  const inputs = document.querySelectorAll('#lista-preparo input');
  dadosReceita.preparo = Array.from(inputs)
    .map(inp => inp.value.trim())
    .filter(val => val !== "");

  dadosReceita.tempoPreparo = document.getElementById('tempo-preparo').value.trim();

  if (dadosReceita.preparo.length === 0 || !dadosReceita.tempoPreparo) {
    alert("Adicione as etapas de preparo e o tempo!");
    return;
  }

  mudarEtapa(4);
}

function salvarEtapa4() {
  dadosReceita.dica = document.getElementById('dica').value.trim();
  mudarEtapa(5);
}

/* ===================== FINALIZAR (ENVIA PRO BACK) ===================== */

async function finalizarReceita() {
  const input = document.querySelector('#lista-imagens input');

  if (!input || !input.files || !input.files[0]) {
    alert("Adicione uma imagem!");
    return;
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

  if (!usuario.email) {
    alert("Usuário não encontrado. Faça login novamente.");
    window.location.href = '/login';
    return;
  }

  const file = input.files[0];

  const formData = new FormData();
  formData.append('title', dadosReceita.nome);
  formData.append('category', dadosReceita.categoria);
  formData.append('subcategory', dadosReceita.subcategoria);
  formData.append('description', dadosReceita.sobre);
  formData.append('ingredients', JSON.stringify(dadosReceita.ingredientes));
  formData.append('steps', JSON.stringify(dadosReceita.preparo));
  formData.append('prep_time_min', dadosReceita.tempoPreparo);
  formData.append('tip', dadosReceita.dica);
  formData.append('author_name', usuario.name || 'Anônimo');
  formData.append('author_email', usuario.email || '');

  if (usuario.id) {
    formData.append('user_id', usuario.id);
  }

  formData.append('image', file);

  try {
    const res = await fetch('/receitas', {
      method: 'POST',
      body: formData
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error('Erro ao criar receita:', data);
      alert(data.error || 'Erro ao criar receita.');
      return;
    }

    if (data.recipe && data.recipe.id) {
      window.location.href = `/receitas/${data.recipe.id}`;
    } else {
      alert('Receita criada, mas resposta inesperada do servidor.');
    }
  } catch (err) {
    console.error(err);
    alert('Erro ao enviar a receita. Tente novamente.');
  }
}

/* ===================== NAVEGAÇÃO ENTRE ETAPAS ===================== */

function voltarEtapa() {
  if (etapaAtual > 1) {
    mudarEtapa(etapaAtual - 1);
  }
}

function mudarEtapa(novaEtapa) {
  const atual = document.getElementById(`etapa-${etapaAtual}`);
  const nova = document.getElementById(`etapa-${novaEtapa}`);

  if (atual) atual.style.display = 'none';
  if (nova) nova.style.display = 'block';

  etapaAtual = novaEtapa;
  atualizarProgresso();
}

function atualizarProgresso() {
  const bolinha = document.querySelector('.bolinha');
  const barra = document.querySelector('.progress-bar');
  const TOTAL_ETAPAS = 5;
  const pct = ((etapaAtual - 1) / (TOTAL_ETAPAS - 1)) * 100;

  if (bolinha) bolinha.style.left = `${pct}%`;
  if (barra) barra.style.width = `${pct}%`;
}

/* ===================== ADICIONAR CAMPOS DINÂMICOS ===================== */

function adicionarIngrediente() {
  const lista = document.getElementById('lista-ingredientes');
  const index = lista.querySelectorAll('input').length + 1;
  const input = document.createElement('input');
  input.type = "text";
  input.placeholder = `${index} -`;
  lista.appendChild(input);
}

function adicionarEtapaPreparo() {
  const lista = document.getElementById('lista-preparo');
  const index = lista.querySelectorAll('input').length + 1;
  const input = document.createElement('input');
  input.type = "text";
  input.placeholder = `${index} -`;
  lista.appendChild(input);
}

/* ===================== FECHAR MODAL ===================== */

function fecharModal() {
  if (confirm("Deseja cancelar a criação da receita?")) {
    window.location.href = "/perfil";
  }
}

// deixa as funções globais pro onclick do HTML
window.proximaEtapa = proximaEtapa;
window.salvarEtapa2 = salvarEtapa2;
window.salvarEtapa3 = salvarEtapa3;
window.salvarEtapa4 = salvarEtapa4;
window.finalizarReceita = finalizarReceita;
window.voltarEtapa = voltarEtapa;
window.adicionarIngrediente = adicionarIngrediente;
window.adicionarEtapaPreparo = adicionarEtapaPreparo;
window.fecharModal = fecharModal;
