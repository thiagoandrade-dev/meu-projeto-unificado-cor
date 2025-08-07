const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ erro: "Token de acesso não fornecido" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Adiciona os dados do usuário à requisição
    next();
  } catch (err) {
    return res.status(403).json({ erro: "Token inválido ou expirado" });
  }
};