const verificarToken = require("../middlewares/verificarToken");
const router = require("express").Router();
const Imovel = require("../models/Imovel");
const Inquilino = require("../models/Inquilino");
const mongoose = require("mongoose");

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Endpoints para o painel administrativo
 */

/**
 * @swagger
 * /dashboard/estatisticas:
 *   get:
 *     summary: Estatísticas gerais
 *     description: Retorna totais de imóveis, inquilinos, contratos e inadimplentes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados estatísticos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalImoveis:
 *                   type: number
 *                   example: 42
 *                 totalInquilinos:
 *                   type: number
 *                   example: 38
 *                 totalContratos:
 *                   type: number
 *                   example: 25
 *                 totalInadimplentes:
 *                   type: number
 *                   example: 3
 *       401:
 *         description: Token não fornecido/inválido
 *       500:
 *         description: Erro no servidor
 */
router.get("/estatisticas", verificarToken, async (req, res) => {
  try {
    const totalImoveis = await Imovel.countDocuments({});
    const totalInquilinos = await Inquilino.countDocuments({});
    const totalContratos = 25;
    const totalInadimplentes = 3;

    res.json({
      totalImoveis: totalImoveis || 0,
      totalInquilinos: totalInquilinos || 0,
      totalContratos: totalContratos || 0,
      totalInadimplentes: totalInadimplentes || 0
    });
  } catch (err) {
    console.error("Erro ao buscar estatísticas:", err);
    res.status(500).json({ erro: "Erro ao buscar estatísticas do dashboard: " + err.message });
  }
});

/**
 * @swagger
 * /dashboard/ocupacao-por-grupo:
 *   get:
 *     summary: Ocupação por grupo
 *     description: Retorna a relação de imóveis ocupados/disponíveis por grupo
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de grupos com dados de ocupação
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   grupo:
 *                     type: number
 *                     example: 12
 *                   ocupados:
 *                     type: number
 *                     example: 8
 *                   disponiveis:
 *                     type: number
 *                     example: 4
 *                   total:
 *                     type: number
 *                     example: 12
 *       500:
 *         description: Erro no servidor
 */
router.get("/ocupacao-por-grupo", verificarToken, async (req, res) => {
  try {
    const grupos = [12, 13, 14, 15, 16, 17, 18];
    const resultado = [];

    for (const grupo of grupos) {
      const totalImoveis = await Imovel.countDocuments({ grupo });
      const disponiveis = await Imovel.countDocuments({ 
        grupo, 
        statusAnuncio: { $in: ["Disponível para Venda", "Disponível para Locação"] } 
      });
      
      const ocupados = totalImoveis - disponiveis;
      
      resultado.push({
        grupo,
        ocupados,
        disponiveis,
        total: totalImoveis
      });
    }

    res.json(resultado);
  } catch (err) {
    console.error("Erro ao buscar ocupação por grupo:", err);
    res.status(500).json({ erro: "Erro ao buscar ocupação por grupo: " + err.message });
  }
});

/**
 * @swagger
 * /dashboard/resumo-financeiro:
 *   get:
 *     summary: Resumo financeiro
 *     description: Retorna valores recebidos, pendentes e atrasados
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados financeiros consolidados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valorRecebido:
 *                   type: number
 *                   example: 48500.75
 *                 valorPendente:
 *                   type: number
 *                   example: 12300.25
 *                 valorAtrasado:
 *                   type: number
 *                   example: 6750.00
 *                 total:
 *                   type: number
 *                   example: 67551.00
 *       500:
 *         description: Erro no servidor
 */
router.get("/resumo-financeiro", verificarToken, async (req, res) => {
  try {
    res.json({
      valorRecebido: 48500.75,
      valorPendente: 12300.25,
      valorAtrasado: 6750.00,
      total: 67551.00
    });
  } catch (err) {
    console.error("Erro ao buscar resumo financeiro:", err);
    res.status(500).json({ erro: "Erro ao buscar resumo financeiro: " + err.message });
  }
});

/**
 * @swagger
 * /dashboard/alertas:
 *   get:
 *     summary: Alertas do sistema
 *     description: Retorna lista de alertas (contratos, pagamentos, manutenções)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de alertas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tipo:
 *                     type: string
 *                     example: "atrasado"
 *                   titulo:
 *                     type: string
 *                     example: "Pagamento atrasado"
 *                   mensagem:
 *                     type: string
 *                     example: "O contrato #BX7192 está atrasado há 3 dias"
 *       500:
 *         description: Erro no servidor
 */
router.get("/alertas", verificarToken, async (req, res) => {
  try {
    const alertas = [
      {
        tipo: "vencendo",
        titulo: "Contrato próximo do vencimento",
        mensagem: "O contrato #AF2398 (Maria Silva) vence em 15 dias."
      },
      {
        tipo: "atrasado",
        titulo: "Pagamento atrasado",
        mensagem: "O pagamento do contrato #BX7192 (Carlos Santos) está atrasado há 3 dias."
      },
      {
        tipo: "contrato",
        titulo: "Novo contrato",
        mensagem: "O contrato #CK9821 (Joana Pereira) foi assinado hoje."
      },
      {
        tipo: "info",
        titulo: "Manutenção agendada",
        mensagem: "Manutenção no elevador do Grupo 12, Bloco A marcada para amanhã."
      }
    ];
    
    res.json(alertas);
  } catch (err) {
    console.error("Erro ao buscar alertas:", err);
    res.status(500).json({ erro: "Erro ao buscar alertas do sistema: " + err.message });
  }
});

module.exports = router;