const User = require('../models/User'); // importa o model certo

exports.excluirConta = async (req, res) => {
  try {
    const { email } = req.body;

    console.log("Requisição para excluir conta de:", email);

    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // encontra o usuário
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("Usuário não encontrado no banco.");
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // exclui
    await user.destroy();

    console.log("Usuário excluído com sucesso.");
    return res.json({ success: true });

  } catch (err) {
    console.error("Erro ao excluir usuário:", err);
    return res.status(500).json({ error: 'Erro no servidor ao excluir a conta.' });
  }
};




module.exports.logout = (req, res) => {
  if (!req.session) {
    return res.json({ success: true });
  }

  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    return res.json({ success: true });
  });
};
