// public/js/editar-receita.js
document.addEventListener('DOMContentLoaded', () => {
  // ===== USUÁRIO LOGADO =====
  let usuario = null;
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      usuario = JSON.parse(usuarioStr);
    }
  } catch (e) {
    console.error('Erro ao ler usuário do localStorage:', e);
  }

  if (!usuario) {
    alert('Você precisa estar logado para editar uma receita.');
    window.location.href = '/login';
    return;
  }

  const card = document.querySelector('.card-cadastro');
  const recipeId = card?.dataset.recipeId;

  // ===== MAPA CATEGORIAS → SUBCATEGORIAS (MESMO DA CRIAÇÃO) =====
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

  const selectCategoria = document.getElementById('categoria');
  const selectSubcategoria = document.getElementById('subcategoria');
  const subcategoriaSalva = selectSubcategoria?.dataset.subcategoriaSalva || '';

  function atualizarSubcategorias(categoria, selecionada) {
    if (!selectSubcategoria) return;

    // limpa tudo
    selectSubcategoria.innerHTML = '';

    if (!categoria || !mapaCategorias[categoria]) {
      selectSubcategoria.disabled = true;
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = 'Selecione a categoria primeiro';
      selectSubcategoria.appendChild(opt);
      return;
    }

    selectSubcategoria.disabled = false;

    const optPadrao = document.createElement('option');
    optPadrao.value = '';
    optPadrao.textContent = 'Selecione';
    selectSubcategoria.appendChild(optPadrao);

    mapaCategorias[categoria].forEach((sub) => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      if (selecionada && selecionada === sub) {
        opt.selected = true;
      }
      selectSubcategoria.appendChild(opt);
    });
  }

  // ao carregar a página: popula de acordo com a categoria e subcategoria da receita
  if (selectCategoria) {
    atualizarSubcategorias(selectCategoria.value, subcategoriaSalva);

    selectCategoria.addEventListener('change', () => {
      atualizarSubcategorias(selectCategoria.value, '');
    });
  }

  // ===== CONTROLE DE ETAPAS =====
  let etapaAtual = 1;
  const totalEtapas = 5;

  const progressBar = document.querySelector('.progress-bar');
  const bolinha = document.querySelector('.bolinha');

  function atualizarProgresso() {
    const perc = ((etapaAtual - 1) / (totalEtapas - 1)) * 100;
    if (progressBar) progressBar.style.width = `${perc}%`;
    if (bolinha) bolinha.style.left = `${perc}%`;
  }

  function atualizarEtapas() {
    for (let i = 1; i <= totalEtapas; i++) {
      const etapa = document.getElementById(`etapa-${i}`);
      if (!etapa) continue;
      etapa.style.display = i === etapaAtual ? 'block' : 'none';
    }
    atualizarProgresso();
  }

  // inicia na etapa 1
  atualizarEtapas();

  // expõe no escopo global porque o HTML chama essas funções
  window.proximaEtapa = function () {
    if (etapaAtual < totalEtapas) {
      etapaAtual++;
      atualizarEtapas();
    }
  };

  window.voltarEtapa = function () {
    if (etapaAtual > 1) {
      etapaAtual--;
      atualizarEtapas();
    }
  };

  window.fecharModal = function () {
    window.history.back();
  };

  // ===== ADICIONAR CAMPOS DINÂMICOS =====
  const listaIngredientes = document.getElementById('lista-ingredientes');
  const listaPreparo = document.getElementById('lista-preparo');

  window.adicionarIngrediente = function () {
    if (!listaIngredientes) return;
    const qtd = listaIngredientes.querySelectorAll('.ingrediente-input').length;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ingrediente-input';
    input.placeholder = `${qtd + 1} -`;
    listaIngredientes.appendChild(input);
  };

  window.adicionarEtapaPreparo = function () {
    if (!listaPreparo) return;
    const qtd = listaPreparo.querySelectorAll('.preparo-input').length;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'preparo-input';
    input.placeholder = `${qtd + 1} -`;
    listaPreparo.appendChild(input);
  };

  // essas funções só avançam etapa (se quiser guardar estado no futuro, dá pra evoluir)
  window.salvarEtapa2 = function () {
    window.proximaEtapa();
  };

  window.salvarEtapa3 = function () {
    window.proximaEtapa();
  };

  window.salvarEtapa4 = function () {
    window.proximaEtapa();
  };

  // ===== FINALIZAR (PUT /receitas/:id) =====
  window.finalizarReceita = async function () {
    const inputNome = document.getElementById('nome');
    const textareaSobre = document.getElementById('sobre');
    const inputTempo = document.getElementById('tempo-preparo');
    const textareaDica = document.getElementById('dica');

    const nome = inputNome.value.trim();
    const categoria = selectCategoria.value.trim();
    const sobre = textareaSobre.value.trim();

    if (!nome || !categoria || !sobre) {
      alert('Nome, categoria e sobre a receita são obrigatórios.');
      return;
    }

    const ingredientesArr = Array.from(
      listaIngredientes.querySelectorAll('.ingrediente-input')
    )
      .map((inp) => inp.value.trim())
      .filter((v) => v.length > 0);

    if (!ingredientesArr.length) {
      alert('Informe pelo menos um ingrediente.');
      return;
    }

    const passosArr = Array.from(
      listaPreparo.querySelectorAll('.preparo-input')
    )
      .map((inp) => inp.value.trim())
      .filter((v) => v.length > 0);

    if (!passosArr.length) {
      alert('Informe pelo menos uma etapa de preparo.');
      return;
    }

    const payload = {
      user_id: usuario.id,
      title: nome,
      category: categoria,
      subcategory: selectSubcategoria.value || null,
      description: sobre,
      ingredients: JSON.stringify(ingredientesArr),
      steps: JSON.stringify(passosArr),
      prep_time_min: inputTempo.value.trim() || null,
      tip: textareaDica.value.trim() || null,
      // por enquanto não estamos mexendo com porções nem imagem aqui
    };

    try {
      const resp = await fetch(`/receitas/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        alert(data.error || 'Erro ao atualizar receita.');
        return;
      }

      // deu bom: volta pra página da receita
      window.location.href = `/receitas/${recipeId}`;
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar receita.');
    }
  };
});
