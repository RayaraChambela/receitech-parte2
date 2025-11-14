document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  const goPerfil = () => (window.location.href = '/perfil');

  if (!id) {
    alert('Receita não encontrada.');
    return goPerfil();
  }

  const receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
  const receita = receitas.find(r => String(r.id) === String(id));

  if (!receita) {
    alert('Receita não encontrada.');
    return goPerfil();
  }

  // Preenche campos
  qs('#nome-receita').textContent = receita.nome || '—';
  qs('#autor-receita').textContent = receita.autor || 'Anônimo';
  qs('#tempo-preparo').textContent = receita.tempoPreparo || '—';
  qs('#sobre-receita').textContent = receita.sobre || '';

  // Ingredientes
  const ul = qs('#ingredientes');
  ul.innerHTML = (receita.ingredientes || [])
    .filter(Boolean)
    .map(i => `<li>${escapeHTML(i)}</li>`).join('');

  // Preparo
  const ol = qs('#modo-preparo');
  ol.innerHTML = (receita.preparo || [])
    .filter(Boolean)
    .map(p => `<li>${escapeHTML(p)}</li>`).join('');

  // Imagem principal (fallback)
  const img = qs('#imagem-receita');
  const primeira = (receita.imagens || []).find(x => (x || '').trim() !== '');
  img.src = primeira || '/assets/imagem-padrao.png';
  img.alt = receita.nome || 'Receita';

  // Avatar do autor (usa lista 'users', padronizada)
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const autor = users.find(u => u.email === receita.emailAutor);
  const avatar = qs('#avatar-autor');
  if (autor?.fotoPerfil) avatar.src = autor.fotoPerfil;

  // Enter na busca da navbar (se existir no layout)
  const campo = document.getElementById('campo-pesquisa');
  campo?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const termo = campo.value.trim();
      if (termo) window.location.href = `/pesquisa?termo=${encodeURIComponent(termo)}`;
    }
  });
});

// Helpers
function qs(sel){ return document.querySelector(sel); }
function escapeHTML(str=''){
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
