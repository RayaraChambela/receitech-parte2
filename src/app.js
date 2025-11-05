import path from 'node:path';
import express from 'express';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'src', 'views'));

app.use(express.static(path.join(process.cwd(), 'public')));

app.get('/', (req, res) => res.render('index', { title: 'Início' }));
app.get('/pesquisa', (req, res) => {
  const termo = (req.query.termo || '').toString();
  
  res.render('index', { title: `Pesquisa: ${termo}` });
});

app.get('/categorias', (req, res) => {
 
  res.render('categorias', { title: 'Categorias' });
});


app.get('/register', (req, res) => res.render('register', { title: 'Criar conta' }));
app.get('/login',    (req, res) => res.render('login', { title: 'Login' })); 
app.get('/perfil',   (req, res) => res.render('index', { title: 'Meu Perfil' })); // 

app.get('/receita/nova', (req, res) => {
  res.render('nova-receita', { title: 'Criar Receita' });
});


app.get('/receita', (req, res) => {
  
  res.render('index', { title: 'Receita' });
});

app.get('/perfil', (req, res) => res.render('perfil', { title: 'Meu Perfil' }));
app.get('/receita/nova', (req, res) => res.render('nova-receita', { title: 'Criar Receita' }));
app.get('/receita', (req, res) => res.render('receita', { title: 'Receita' })); 


export default app;
