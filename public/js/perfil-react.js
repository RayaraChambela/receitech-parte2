// public/js/perfil-react.js

const { useState, useEffect, useCallback } = React;

// Dados iniciais injetados pelo EJS
const initialProps = window.__PERFIL_PROPS__;
const DEFAULT_AVATAR = '/assets/icon-img-perfil.png';

// ==========================================================
// 1. COMPONENTE POPUP DE EDIÇÃO DE FOTO
// ==========================================================
function PopupEditarFoto({
  usuario,
  onClose,
  onUpdateUsuario,
}) {
  // Estado local para a imagem selecionada
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(usuario.avatar_url || DEFAULT_AVATAR);
  const fileInputRef = React.useRef(null);

  // Efeito para resetar o preview ao abrir
  useEffect(() => {
    setPreviewSrc(usuario.avatar_url || DEFAULT_AVATAR);
    setFile(null);
  }, [usuario.avatar_url]);


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => setPreviewSrc(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewSrc(usuario.avatar_url || DEFAULT_AVATAR);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!file) {
      onClose(); // Fecha se não houver arquivo
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('email', usuario.email);

    try {
      const res = await fetch('/usuario/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const texto = await res.text();
        console.error('Erro ao atualizar avatar:', texto);
        alert('Erro ao salvar foto de perfil.');
        return;
      }

      const data = await res.json();
      localStorage.setItem('usuario', JSON.stringify(data.user));
      onUpdateUsuario(data.user); // Atualiza o estado global
      onClose();
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar foto de perfil.');
    }
  };

  const handleRemoverFoto = async (e) => {
    e.preventDefault();

    if (!window.confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

    try {
      const res = await fetch('/usuario/avatar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error('Erro ao remover avatar:', data);
        alert(data.error || 'Erro ao remover foto de perfil.');
        return;
      }

      localStorage.setItem('usuario', JSON.stringify(data.user));
      onUpdateUsuario(data.user); // Atualiza o estado global
      onClose();
    } catch (err) {
      console.error('Erro de conexão ao remover avatar:', err);
      alert('Erro ao remover foto de perfil.');
    }
  };


  return (
    <div className="popup-overlay" id="popup-foto" style={{ display: 'flex' }}>
      <div className="popup">

        <div id="navbar-popup">
          <div className="centered-text">Editar Foto de Perfil</div>
          <button className="btn-fechar" onClick={onClose}>
            <img src="/assets/icon-sair.png" alt="Sair" className="img-btn-sair" />
          </button>
        </div>

        <label htmlFor="imagem" className="label-imagem">+ Inserir Imagem</label>
        {/* O input é mantido oculto e acionado pelo label/botão */}
        <input 
            type="file" 
            id="imagem" 
            className="input-arquivo" 
            accept="image/*" 
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: 'none' }} 
        />

        <div className="preview-wrapper">
          <img id="preview-foto" className="preview-foto" src={previewSrc} alt="Pré-visualização da foto" />
        </div>

        <div id="excluir" onClick={handleRemoverFoto}>
          <img src="/assets/icon-excluir.png" alt="Excluir" id="img-btn-excluir" />
          <p id="remover-foto">Remover foto atual</p>
        </div>

        <div>
          <button id="salvar" onClick={handleSalvar}>Salvar Alterações</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================================
// 2. COMPONENTE POPUP DE EDIÇÃO DE PERFIL
// ==========================================================
function PopupEditarPerfil({
  usuario,
  onClose,
  onUpdateUsuario
}) {
  const [nome, setNome] = useState(usuario.name || '');
  const [email, setEmail] = useState(usuario.email || '');
  const [senha, setSenha] = useState('');

  // Sincroniza estado inicial ao abrir o popup
  useEffect(() => {
    setNome(usuario.name || '');
    setEmail(usuario.email || '');
    setSenha('');
  }, [usuario.name, usuario.email]);

  const handleSalvar = async (e) => {
    e.preventDefault();

    const updateData = {
      // O backend pode usar o email original para identificar o usuário
      emailOriginal: usuario.email, 
      name: nome,
      email: email,
      // A senha só é enviada se preenchida
      password: senha || undefined, 
    };

    try {
      // Sua lógica original do JS puro apenas atualizava o localStorage,
      // mas para ser robusto, implementamos aqui a comunicação com o backend
      // para salvar o perfil, análogo à lógica de avatar.
      
      // OBS: Assumindo um endpoint de API para atualizar o perfil
      const res = await fetch('/usuario/perfil', {
        method: 'PUT', // ou POST/PATCH, dependendo da sua API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Erro ao salvar alterações do perfil.');
        return;
      }
      
      const data = await res.json();
      const novoUsuario = data.user;

      localStorage.setItem('usuario', JSON.stringify(novoUsuario));
      onUpdateUsuario(novoUsuario);
      onClose();
    } catch (err) {
      console.error(err);
      // Mantendo a lógica de fallback da versão JS pura (apenas local)
      // Se não houver endpoint de API, o código abaixo seria o fallback:
      /*
      const novoUsuario = { ...usuario };
      if (nome) novoUsuario.name = nome;
      if (email) novoUsuario.email = email;
      if (senha) novoUsuario.password = senha; 

      localStorage.setItem('usuario', JSON.stringify(novoUsuario));
      onUpdateUsuario(novoUsuario);
      onClose();
      */
      alert('Erro ao salvar alterações do perfil.');
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await fetch('/usuario/logout', { method: 'POST' });
    } catch (err) {
      console.error('Erro ao deslogar:', err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/';
  };

  const handleExcluirConta = async (e) => {
    e.preventDefault();
    if (!window.confirm('Tem certeza que deseja excluir sua conta?')) return;

    try {
      const res = await fetch('/usuario/excluir', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: usuario.email }),
      });

      if (!res.ok) {
        alert('Erro ao excluir conta.');
        return;
      }

      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      window.location.href = '/';
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir conta.');
    }
  };


  return (
    <div className="popup-overlay" id="popup-editar" style={{ display: 'flex' }}>
      <div className="popup-editar">

        <div className="popup-header">
          <h3>Editar Perfil</h3>
          <button className="fechar-popup" onClick={onClose}>
            <img src="/assets/icon-sair.png" alt="Fechar" className="img-btn-sair" />
          </button>
        </div>

        <form id="form-editar-perfil" onSubmit={handleSalvar} noValidate>
          <label htmlFor="nome" className="label-perfil">NOME</label>
          <input 
            type="text" 
            id="nome" 
            placeholder="Digite o seu nome" 
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <label htmlFor="email" className="label-perfil">E-MAIL</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Digite o seu e-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="senha" className="label-perfil">SENHA (opcional)</label>
          <input 
            type="password" 
            id="senha" 
            placeholder="Digite a sua nova senha (opcional)" 
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button type="submit" className="btn-salvar">Salvar Alterações</button>
        </form>

        <p className="aviso">
          Quer excluir sua conta? <br />Essa ação não pode ser desfeita.
        </p>

        <button className="btn-logout" onClick={handleLogout}>Sair da conta</button>
        <button className="btn-excluir" onClick={handleExcluirConta}>Excluir minha conta</button>
      </div>
    </div>
  );
}

// ==========================================================
// 3. COMPONENTE DE RECEITA INDIVIDUAL NO FEED
// ==========================================================
function ReceitaPost({ receita }) {
  const handleClick = () => {
    window.location.href = `/receitas/${receita.id}`;
  };

  return (
    <div 
      className="receita-post" 
      onClick={handleClick}
    >
      <img
        src={receita.cover_image || '/assets/img-bolinho.png'}
        className="receita-feed-img"
        alt={receita.title}
      />
    </div>
  );
}


// ==========================================================
// 4. COMPONENTE PRINCIPAL (PerfilApp)
// ==========================================================
function PerfilApp({ initialUsuario, initialToken }) {
  const [usuario, setUsuario] = useState(initialUsuario);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showFotoPopup, setShowFotoPopup] = useState(false);
  const [showEditarPopup, setShowEditarPopup] = useState(false);

  useEffect(() => {
    if (!initialToken || !initialUsuario) {
      window.location.href = '/';
      return;
    }
  }, [initialToken, initialUsuario]);

  const carregarReceitasUsuario = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/receitas/usuario/${userId}`);
      if (!res.ok) {
        setError('Erro ao carregar suas receitas.');
        return;
      }

      const data = await res.json().catch(() => ({}));
      const receitas = data.recipes || data.receitas || [];
      setRecipes(receitas);
    } catch (err) {
      console.error('Erro ao carregar receitas do usuário:', err);
      setError('Erro ao carregar suas receitas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (usuario && usuario.id) {
      carregarReceitasUsuario(usuario.id);
    }
  }, [usuario, carregarReceitasUsuario]);
  
  const handleNovoPost = (e) => {
    e.preventDefault();
    window.location.href = '/receitas/nova';
  };


  if (!usuario) {
      return null; 
  }

  const avatarSrc = usuario.avatar_url || DEFAULT_AVATAR;

  return (
    <div className="perfil-content">

      {/* BANNER */}
      <div className="perfil-banner">
        <img src="/assets/img-fundo-perfil.png" alt="banner" id="banner" />
      </div>

      {/* FOTO DO PERFIL */}
      <div className="perfil-foto">
        <img src={avatarSrc} alt="Foto de perfil" id="img-perfil" />

        {/* Botão abre o PopupEditarFoto */}
        <button className="camera-btn" onClick={() => setShowFotoPopup(true)}>
          <img src="/assets/icon-camera.png" alt="Câmera" className="img-camera" />
        </button>
      </div>

      {/* POPUP EDITAR FOTO - RENDERIZAÇÃO CONDICIONAL */}
      {showFotoPopup && (
        <PopupEditarFoto 
          usuario={usuario}
          onClose={() => setShowFotoPopup(false)}
          onUpdateUsuario={setUsuario}
        />
      )}

      {/* INFO DO PERFIL */}
      <div className="perfil-info">
        <div className="perfil-nome-edit">
          <h2 id="nome-usuario">{usuario.name || 'Usuário'}</h2>
          
          {/* Botão abre o PopupEditarPerfil */}
          <a href="#" onClick={(e) => { e.preventDefault(); setShowEditarPopup(true); }}>
            <img src="/assets/icon-edit-perfil.png" alt="Editar perfil" id="edit-perfil" />
          </a>
        </div>
        <p id="email-usuario">{usuario.email || ''}</p>
      </div>

      {/* POPUP EDITAR PERFIL - RENDERIZAÇÃO CONDICIONAL */}
      {showEditarPopup && (
        <PopupEditarPerfil 
          usuario={usuario}
          onClose={() => setShowEditarPopup(false)}
          onUpdateUsuario={setUsuario}
        />
      )}

      {/* BOTÃO NOVO POST */}
      <section className="perfil-posts">
        <div className="post-box">
          <div className="post-header">
            <button className="novo-post-btn" onClick={handleNovoPost}>
              <img src="/assets/icon-novo-post.png" alt="Novo Post" id="novo-post" /> Novo Post
            </button>
          </div>
        </div>
      </section>

      {/* FEED DINÂMICO DO USUÁRIO */}
      <div className="feed-receitas" id="feed-usuario">
        {loading ? (
          <p>Carregando receitas...</p>
        ) : error ? (
          <p>{error}</p>
        ) : recipes.length === 0 ? (
          <p>Você ainda não publicou nenhuma receita.</p>
        ) : (
          recipes.map((r) => <ReceitaPost key={r.id} receita={r} />)
        )}
      </div>

    </div>
  );
}

// ==========================================================
// MONTAGEM DO COMPONENTE NA PÁGINA
// ==========================================================
// ==========================================================
// MONTAGEM DO COMPONENTE NA PÁGINA
// ==========================================================
const rootElement = document.getElementById('perfil-root');

if (rootElement) {
  // Acesso seguro aos dados
  const props = window.__PERFIL_PROPS__ || {}; 

  // Se a página de perfil é carregada, e os dados são null,
  // significa que a lógica de JS puro de redirecionamento falhou
  // ou os dados foram perdidos. O componente fará o redirecionamento.
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <PerfilApp 
      initialUsuario={props.usuario} 
      initialToken={props.token} 
    />
  );
} else {
    // Adicione um log de erro no console para debug
    console.error("Elemento 'perfil-root' não encontrado no DOM. O React não pode ser montado.");
}