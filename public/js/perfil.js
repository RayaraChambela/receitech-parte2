async function sha256(text){
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

function getUsuario(){
  try { return JSON.parse(localStorage.getItem('usuario') || 'null'); }
  catch { return null; }
}

function setUsuario(u){
  localStorage.setItem('usuario', JSON.stringify(u));
}

(function ensureAuth(){
  const u = getUsuario();
  if(!u || !u.email){
    alert('Faça login para acessar seu perfil.');
    window.location.href = '/login';
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const usuario = getUsuario() || {};
  const nomeUsuario = document.getElementById('nome-usuario');
  const emailUsuario = document.getElementById('email-usuario');
  const imgPerfil = document.getElementById('img-perfil');

  if (nomeUsuario && usuario.nome) nomeUsuario.textContent = usuario.nome;
  if (emailUsuario && usuario.email) emailUsuario.textContent = usuario.email;
  if (usuario.fotoPerfil && imgPerfil) imgPerfil.src = usuario.fotoPerfil;

  const navbarIcon = document.querySelector('.user-icon img');
  if (navbarIcon && usuario.fotoPerfil) navbarIcon.src = usuario.fotoPerfil;

  document.getElementById('btn-novo-post')?.addEventListener('click', () => {
    window.location.href = '/receita/nova';
  });

  const popupFoto = document.getElementById('popup-foto');
  const popupEditar = document.getElementById('popup-editar');

  document.getElementById('btn-open-foto')?.addEventListener('click', () => popupFoto.style.display = 'flex');
  document.getElementById('close-foto')?.addEventListener('click', () => popupFoto.style.display = 'none');

  document.getElementById('edit-perfil')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('nome').value = usuario.nome || '';
    document.getElementById('email').value = usuario.email || '';
    document.getElementById('senha').value = '';
    popupEditar.style.display = 'flex';
  });
  document.getElementById('close-editar')?.addEventListener('click', () => popupEditar.style.display = 'none');


  document.getElementById('salvar')?.addEventListener('click', () => {
    const file = document.getElementById('imagem')?.files?.[0];
    if (!file) { popupFoto.style.display = 'none'; return; }
    const reader = new FileReader();
    reader.onload = () => {
      usuario.fotoPerfil = reader.result;
      setUsuario(usuario);

  
      let users = JSON.parse(localStorage.getItem('users') || '[]');
      users = users.map(u => (u.email === usuario.email ? { ...u, fotoPerfil: usuario.fotoPerfil } : u));
      localStorage.setItem('users', JSON.stringify(users));

      if (imgPerfil) imgPerfil.src = usuario.fotoPerfil;
      if (navbarIcon) navbarIcon.src = usuario.fotoPerfil;
      popupFoto.style.display = 'none';
    };
    reader.onerror = () => alert('Erro ao carregar imagem.');
    reader.readAsDataURL(file);
  });

  document.getElementById('remover-foto')?.addEventListener('click', () => {
    delete usuario.fotoPerfil;
    setUsuario(usuario);

    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.map(u => (u.email === usuario.email ? ({ ...u, fotoPerfil: undefined }) : u));
    localStorage.setItem('users', JSON.stringify(users));

    if (imgPerfil) imgPerfil.src = '/assets/icon-img-perfil.png';
    if (navbarIcon) navbarIcon.src = '/assets/icon-perfil.png';
  });

  
  document.getElementById('form-editar-perfil')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const novoNome = document.getElementById('nome').value.trim();
    const novoEmail = document.getElementById('email').value.trim().toLowerCase();
    const novaSenha = document.getElementById('senha').value;

    if (!novoNome || !novoEmail){
      alert('Preencha nome e e-mail.');
      return;
    }

    
    let receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
    receitas = receitas.map(r => {
      if (r.emailAutor === usuario.email){
        return { ...r, autor: novoNome, emailAutor: novoEmail };
      }
      return r;
    });
    localStorage.setItem('receitas', JSON.stringify(receitas));

  
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = await Promise.all(users.map(async (u) => {
      if (u.email !== usuario.email) return u;
      const updated = { ...u, nome: novoNome, email: novoEmail };
      if (novaSenha) updated.passwordHash = await sha256(novaSenha);
      return updated;
    }));
    localStorage.setItem('users', JSON.stringify(users));

    
    usuario.nome = novoNome;
    usuario.email = novoEmail;
    setUsuario(usuario);

   
    if (nomeUsuario) nomeUsuario.textContent = novoNome;
    if (emailUsuario) emailUsuario.textContent = novoEmail;

    popupEditar.style.display = 'none';
    alert('Informações atualizadas com sucesso!');
    carregarFeed(); 
  });

  
  document.getElementById('btn-excluir-conta')?.addEventListener('click', () => {
    if (!confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) return;

    
    let receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
    receitas = receitas.map(r => (r.emailAutor === usuario.email ? { ...r, autor: 'Anônimo', emailAutor: '' } : r));
    localStorage.setItem('receitas', JSON.stringify(receitas));

    
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    users = users.filter(u => u.email !== usuario.email);
    localStorage.setItem('users', JSON.stringify(users));

 
    localStorage.removeItem('usuario');
    localStorage.removeItem('authToken');

    alert('Sua conta foi excluída com sucesso.');
    window.location.href = '/';
  });

  carregarFeed();
});


function carregarFeed(){
  const feed = document.querySelector('.feed-receitas');
  if (!feed) return;

  feed.innerHTML = '';
  const usuario = getUsuario() || {};
  const receitas = JSON.parse(localStorage.getItem('receitas') || '[]');
  let count = 0;

  receitas.forEach(r => {
    if (r.emailAutor === usuario.email && r.imagens && r.imagens.length){
      const div = document.createElement('div');
      div.classList.add('receita-post');

      const link = document.createElement('a');
      link.href = `/receita?id=${encodeURIComponent(r.id)}`;

      const img = document.createElement('img');
      img.src = r.imagens[0];
      img.alt = r.nome;
      img.classList.add('receita-feed-img');

      link.appendChild(img);
      div.appendChild(link);
      feed.appendChild(div);
      count++;
    }
  });

  if (count === 0){
    feed.innerHTML = `<p class="mensagem-vazio">Nenhuma receita publicada ainda.</p>`;
  }
}
