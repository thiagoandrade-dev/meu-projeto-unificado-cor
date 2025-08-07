const router = require("express").Router();
const { body, validationResult } = require("express-validator");

// Rota para receber mensagens do formulário de contato
router.post("/", [
    body("nome").trim().notEmpty().withMessage("O nome é obrigatório."),
    body("email").isEmail().withMessage("Email inválido.").normalizeEmail(),
    body("telefone").notEmpty().withMessage("O telefone é obrigatório."),
    body("assunto").notEmpty().withMessage("O assunto é obrigatório."),
    body("mensagem").notEmpty().withMessage("A mensagem é obrigatória.")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Retorna os erros de validação para o frontend
        return res.status(400).json({ erros: errors.array().map(err => ({ [err.path]: err.msg })) });
    }

    try {
        const { nome, email, telefone, assunto, mensagem, destinatario, origem, timestamp } = req.body;

        // *** Lógica de Processamento (Exemplo: Log) ***
        // Aqui você implementaria a lógica real, como:
        // 1. Enviar um email para o 'destinatario' com os dados do formulário.
        // 2. Salvar a mensagem em um banco de dados.
        // 3. Integrar com um sistema de CRM.
        
        // Por enquanto, vamos apenas registrar no console do servidor (visível nos logs do Render)
        console.log("--- Nova Mensagem de Contato Recebida ---");
        console.log("Timestamp:", timestamp);
        console.log("Origem:", origem);
        console.log("Nome:", nome);
        console.log("Email:", email);
        console.log("Telefone:", telefone);
        console.log("Assunto:", assunto);
        console.log("Mensagem:", mensagem);
        console.log("Destinatário Sugerido:", destinatario);
        console.log("-----------------------------------------");

        // Resposta de sucesso para o frontend
        res.status(200).json({ mensagem: "Mensagem recebida com sucesso!" });

    } catch (erro) {
        console.error("Erro ao processar mensagem de contato:", erro);
        // Retorna um erro genérico para o frontend
        res.status(500).json({ erro: "Erro interno no servidor ao processar a mensagem." });
    }
});

module.exports = router;
