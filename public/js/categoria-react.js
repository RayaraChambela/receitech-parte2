// public/js/categoria-react.js

// Ajudante pra deixar o código menos feio
const e = React.createElement;

function formatTempoJS(min) {
  if (!min) return '';
  const total = Number(min);
  if (Number.isNaN(total)) return '';

  if (total < 60) {
    return total + ' min';
  }

  const horas = Math.floor(total / 60);
  const minutos = total % 60;

  if (minutos === 0) {
    return `${horas} h`;
  }

  return `${horas} h ${minutos} min`;
}

function CategoriaPage(props) {
  const titulo = props.titulo || '';
  const recipes = Array.isArray(props.recipes) ? props.recipes : [];

  const childrenCards =
    recipes.length === 0
      ? [
          e(
            'p',
            { key: 'empty' },
            `Nenhuma receita encontrada para "${titulo}".`
          )
        ]
      : recipes.map((recipe) =>
          e(
            'div',
            {
              key: recipe.id,
              className: 'card-receita',
              'data-recipe-id': recipe.id,
              onClick: () => {
                if (!recipe.id) return;
                window.location.href = `/receitas/${recipe.id}`;
              }
            },
            [
              // Imagem de capa
              e('img', {
                key: 'img',
                src: recipe.cover_image || '/assets/imagem-padrao.png',
                alt: recipe.title || ''
              }),

              // Conteúdo do card
              e(
                'div',
                { key: 'conteudo', className: 'card-receita-conteudo' },
                [
                  e(
                    'h3',
                    { key: 'titulo', title: recipe.title || '' },
                    recipe.title || ''
                  ),

                  // Linha do tempo (ícone + texto)
                  e(
                    'div',
                    { key: 'tempo', className: 'tempo' },
                    [
                      e('img', {
                        key: 'icone-tempo',
                        // 🔴 IMPORTANTE: esse arquivo PRECISA existir em public/assets
                        // exemplo: public/assets/icon-tempo-novo.svg
                        src: '/assets/icon-tempo-novo.svg',
                        alt: 'Tempo'
                      }),
                      e(
                        'span',
                        { key: 'tempo-texto' },
                        formatTempoJS(recipe.prep_time_min)
                      )
                    ]
                  )
                ]
              )
            ]
          )
        );

  return e(
    React.Fragment,
    null,
    e('h2', { id: 'titulo-categoria' }, titulo),
    e(
      'div',
      { className: 'resultados-container', id: 'resultado-categoria' },
      ...childrenCards
    )
  );
}

// Montar na página
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('categoria-root');
  if (!container) return;

  const props = window.__CATEGORIA_PROPS__ || { titulo: '', recipes: [] };

  try {
    const root = ReactDOM.createRoot(container);
    root.render(e(CategoriaPage, props));
  } catch (err) {
    console.error('Erro ao montar React na página de categorias:', err);
  }
});
