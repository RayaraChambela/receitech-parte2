// public/js/receita.js
document.addEventListener('DOMContentLoaded', () => {
  // ================== BUSCA NA NAVBAR ==================
  const campo = document.getElementById('campo-pesquisa');

  campo?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const termo = campo.value.trim();
      if (termo) {
        window.location.href = `/pesquisa?termo=${encodeURIComponent(termo)}`;
      }
    }
  });

  // ================== USUÁRIO LOGADO ==================
  let usuario = null;
  try {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
      usuario = JSON.parse(usuarioStr);
    }
  } catch (e) {
    console.error('Erro ao ler usuário do localStorage:', e);
  }

  const currentUserId = usuario?.id || null;

  function getUserPayload() {
    if (!usuario) {
      alert('Você precisa estar logado para comentar.');
      return null;
    }
    return {
      user_id: usuario.id,
      author_name: usuario.nome || usuario.name || usuario.email,
    };
  }

    // ===== CLIQUE NO AVATAR DO AUTOR =====
  const linkPerfilAutor = document.querySelector('.link-perfil-autor');

  if (linkPerfilAutor) {
    linkPerfilAutor.addEventListener('click', (e) => {
      e.preventDefault();

      const autorId = linkPerfilAutor.dataset.authorId;
      if (!autorId) return;

      // se o autor da receita for o usuário logado -> vai pra /perfil
      if (usuario && String(usuario.id) === String(autorId)) {
        window.location.href = '/perfil';
      } else {
        // se for outro autor -> perfil público desse usuário
        window.location.href = `/usuario/${autorId}`;
      }
    });
  }

  // ID da receita pela URL: /receitas/:id
  const partesUrl = window.location.pathname.split('/');
  const recipeId = partesUrl[partesUrl.length - 1];

  // ================== AÇÕES DA RECEITA (EDITAR/EXCLUIR) ==================
  const blocoAcoesReceita = document.querySelector('.receita-acoes');
  const btnEditarReceita = document.querySelector('.btn-editar-receita');
  const btnExcluirReceita = document.querySelector('.btn-excluir-receita');

  if (blocoAcoesReceita) {
    const autorId = blocoAcoesReceita.dataset.authorId;

    // Só mostra o bloco se o usuário logado for o autor
    if (currentUserId && String(currentUserId) === String(autorId)) {
      blocoAcoesReceita.style.display = 'flex';
    } else {
      blocoAcoesReceita.style.display = 'none';
    }
  }

  // EDITAR RECEITA – redireciona para a página que parece pop-up
  btnEditarReceita?.addEventListener('click', () => {
    if (!usuario) {
      alert('Você precisa estar logado para editar esta receita.');
      return;
    }
    window.location.href = `/receitas/${recipeId}/editar`;
  });

  // EXCLUIR RECEITA
  btnExcluirReceita?.addEventListener('click', async () => {
    if (!usuario) {
      alert('Você precisa estar logado para excluir esta receita.');
      return;
    }

    const confirmar = window.confirm('Tem certeza que deseja excluir esta receita?');
    if (!confirmar) return;

    try {
      const resp = await fetch(`/receitas/${recipeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: usuario.id,
        }),
      });

      if (!resp.ok && resp.status !== 204) {
        const data = await resp.json().catch(() => ({}));
        alert(data.error || 'Erro ao excluir receita.');
        return;
      }

      window.location.href = '/perfil';
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir receita.');
    }
  });

  // ================== ELEMENTOS DE COMENTÁRIOS ==================
  const form = document.getElementById('form-comentario');
  const textarea = document.getElementById('comentario-texto');
  const lista = document.getElementById('lista-comentarios');

  // Controla visibilidade dos botões (só para comentários do usuário logado)
  function aplicarPermissoesComentarios() {
    const itensComentario = document.querySelectorAll('.comentario-item');

    itensComentario.forEach((item) => {
      const acoes = item.querySelector('.comentario-acoes');
      if (!acoes) return;

      const donoId = item.dataset.commentUserId;
      if (!currentUserId || String(currentUserId) !== String(donoId)) {
        acoes.style.display = 'none';
      } else {
        acoes.style.display = 'flex';
      }
    });
  }

  // Aplica nas linhas que vieram do servidor
  aplicarPermissoesComentarios();

  // ================== CRIAR COMENTÁRIO ==================
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const texto = textarea.value.trim();
    if (!texto) return;

    const userPayload = getUserPayload();
    if (!userPayload) return;

    try {
      const resp = await fetch(`/receitas/${recipeId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userPayload,
          content: texto,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.error || 'Erro ao enviar comentário.');
        return;
      }

      const c = data.comment;
      const li = document.createElement('li');
      li.className = 'comentario-item';
      li.dataset.commentId = c.id;
      li.dataset.commentUserId = c.user_id;

      const dataCriacao = new Date(c.created_at || c.createdAt);

      li.innerHTML = `
        <div class="comentario-conteudo">
          <div class="comentario-topo">
            <strong>${c.author_name}</strong>
            <span class="comentario-data">
              ${dataCriacao.toLocaleDateString('pt-BR')}
            </span>
          </div>
          <p class="comentario-texto">${c.content}</p>
        </div>
        <div class="comentario-acoes">
          <button type="button" class="btn-editar-comentario">Editar</button>
          <button type="button" class="btn-excluir-comentario">Excluir</button>
        </div>
      `;

      lista?.appendChild(li);
      textarea.value = '';

      aplicarPermissoesComentarios();
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar comentário.');
    }
  });

  // ================== EDITAR / EXCLUIR COMENTÁRIO (DELEGAÇÃO) ==================
  lista?.addEventListener('click', async (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const li = btn.closest('.comentario-item');
    if (!li) return;

    const commentId = li.dataset.commentId;
    const commentUserId = li.dataset.commentUserId;

    if (!usuario || String(usuario.id) !== String(commentUserId)) {
      alert('Você não pode alterar este comentário.');
      return;
    }

    const pTexto = li.querySelector('.comentario-texto');
    if (!pTexto) return;

    // -------- EDITAR --------
    if (btn.classList.contains('btn-editar-comentario')) {
      const isEditing = li.classList.contains('editing');

      if (!isEditing) {
        li.classList.add('editing');
        pTexto.contentEditable = 'true';
        pTexto.focus();
        btn.textContent = 'Salvar';
      } else {
        const novoTexto = pTexto.textContent.trim();
        if (!novoTexto) {
          alert('Comentário não pode ficar vazio.');
          return;
        }

        try {
          const resp = await fetch(`/receitas/${recipeId}/comentarios/${commentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: usuario.id,
              content: novoTexto,
            }),
          });

          const data = await resp.json();

          if (!resp.ok) {
            alert(data.error || 'Erro ao atualizar comentário.');
            return;
          }

          li.classList.remove('editing');
          pTexto.contentEditable = 'false';
          btn.textContent = 'Editar';
        } catch (err) {
          console.error(err);
          alert('Erro ao atualizar comentário.');
        }
      }
    }

    // -------- EXCLUIR --------
    if (btn.classList.contains('btn-excluir-comentario')) {
      const confirmar = window.confirm('Tem certeza que deseja excluir este comentário?');
      if (!confirmar) return;

      try {
        const resp = await fetch(`/receitas/${recipeId}/comentarios/${commentId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: usuario.id,
          }),
        });

        if (!resp.ok && resp.status !== 204) {
          const data = await resp.json().catch(() => ({}));
          alert(data.error || 'Erro ao excluir comentário.');
          return;
        }

        li.remove();
      } catch (err) {
        console.error(err);
        alert('Erro ao excluir comentário.');
      }
    }
  });
});
