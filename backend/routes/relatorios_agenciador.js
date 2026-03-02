const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { validationResult, param, query } = require('express-validator');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

// ============================================
// ROTAS - RELATÓRIOS
// ============================================

/**
 * GET /api/relatorios-agenciador/agenciador/:agenciador_id/mensal
 * Relatório mensal de vendas
 */
router.get('/agenciador/:agenciador_id/mensal', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;
    const { mes, ano } = req.query;

    // Validar parâmetros
    const mesNum = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoNum = ano ? parseInt(ano) : new Date().getFullYear();

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Mês deve estar entre 1 e 12'
      });
    }

    // Buscar vendas do mês
    const [vendas] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total_vendas,
        SUM(comissao_valor) as total_comissoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as vendas_pendentes,
        COUNT(CASE WHEN status = 'confirmada' THEN 1 END) as vendas_confirmadas,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as vendas_canceladas,
        AVG(valor_total) as ticket_medio,
        MAX(valor_total) as maior_venda,
        MIN(valor_total) as menor_venda
       FROM vendas_agenciador 
       WHERE agenciador_id = ? AND MONTH(data_venda) = ? AND YEAR(data_venda) = ? AND ativo = TRUE`,
      [agenciador_id, mesNum, anoNum]
    );

    // Buscar parcelas do mês
    const [parcelas] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_parcelas,
        SUM(valor) as valor_total_parcelas,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as pagas,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'atrasada' THEN 1 END) as atrasadas,
        SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as valor_pago,
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as valor_pendente
       FROM parcelas_venda p
       INNER JOIN vendas_agenciador v ON p.venda_id = v.id
       WHERE v.agenciador_id = ? AND MONTH(v.data_venda) = ? AND YEAR(v.data_venda) = ? AND p.ativo = TRUE`,
      [agenciador_id, mesNum, anoNum]
    );

    // Buscar comissões do mês
    const [comissoes] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_comissoes,
        SUM(valor_comissao) as valor_total_comissoes,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as pagas,
        SUM(CASE WHEN status = 'pendente' THEN valor_comissao ELSE 0 END) as valor_pendente,
        SUM(CASE WHEN status = 'paga' THEN valor_comissao ELSE 0 END) as valor_pago
       FROM comissoes_agenciador 
       WHERE agenciador_id = ? AND periodo_mes = ? AND periodo_ano = ? AND ativo = TRUE`,
      [agenciador_id, mesNum, anoNum]
    );

    // Buscar top 5 clientes do mês
    const [topClientes] = await db.promise().query(
      `SELECT 
        v.cliente_nome,
        COUNT(*) as numero_vendas,
        SUM(v.valor_total) as valor_total,
        AVG(v.valor_total) as ticket_medio
       FROM vendas_agenciador v
       WHERE v.agenciador_id = ? AND MONTH(v.data_venda) = ? AND YEAR(v.data_venda) = ? AND v.ativo = TRUE
       GROUP BY v.cliente_nome
       ORDER BY valor_total DESC
       LIMIT 5`,
      [agenciador_id, mesNum, anoNum]
    );

    logger.info('Relatório mensal gerado', {
      agenciador_id,
      mes: mesNum,
      ano: anoNum,
      user_id: req.user?.id
    });

    res.json({
      success: true,
      data: {
        periodo: {
          mes: mesNum,
          ano: anoNum
        },
        vendas: vendas[0],
        parcelas: parcelas[0],
        comissoes: comissoes[0],
        top_clientes: topClientes
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório mensal', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório mensal',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/relatorios-agenciador/agenciador/:agenciador_id/anual
 * Relatório anual de vendas
 */
router.get('/agenciador/:agenciador_id/anual', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;
    const { ano } = req.query;

    const anoNum = ano ? parseInt(ano) : new Date().getFullYear();

    // Buscar vendas por mês
    const [vendasPorMes] = await db.promise().query(
      `SELECT 
        MONTH(data_venda) as mes,
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total,
        SUM(comissao_valor) as total_comissoes,
        AVG(valor_total) as ticket_medio
       FROM vendas_agenciador 
       WHERE agenciador_id = ? AND YEAR(data_venda) = ? AND ativo = TRUE
       GROUP BY MONTH(data_venda)
       ORDER BY mes`,
      [agenciador_id, anoNum]
    );

    // Buscar totais anuais
    const [totaisAnuais] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total_vendas,
        SUM(comissao_valor) as total_comissoes,
        COUNT(DISTINCT cliente_nome) as total_clientes,
        AVG(valor_total) as ticket_medio,
        MAX(valor_total) as maior_venda
       FROM vendas_agenciador 
       WHERE agenciador_id = ? AND YEAR(data_venda) = ? AND ativo = TRUE`,
      [agenciador_id, anoNum]
    );

    // Buscar comissões por status
    const [comissoesPorStatus] = await db.promise().query(
      `SELECT 
        status,
        COUNT(*) as total,
        SUM(valor_comissao) as valor_total
       FROM comissoes_agenciador 
       WHERE agenciador_id = ? AND periodo_ano = ? AND ativo = TRUE
       GROUP BY status`,
      [agenciador_id, anoNum]
    );

    logger.info('Relatório anual gerado', {
      agenciador_id,
      ano: anoNum,
      user_id: req.user?.id
    });

    res.json({
      success: true,
      data: {
        periodo: {
          ano: anoNum
        },
        totais_anuais: totaisAnuais[0],
        vendas_por_mes: vendasPorMes,
        comissoes_por_status: comissoesPorStatus
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório anual', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório anual',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/relatorios-agenciador/agenciador/:agenciador_id/desempenho
 * Relatório de desempenho do agenciador
 */
router.get('/agenciador/:agenciador_id/desempenho', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;

    // Buscar dados gerais
    const [agenciador] = await db.promise().query(
      'SELECT * FROM agenciadores WHERE id = ? AND ativo = TRUE',
      [agenciador_id]
    );

    if (agenciador.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Agenciador não encontrado'
      });
    }

    // Buscar estatísticas de vendas
    const [estatisticasVendas] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_vendas,
        SUM(valor_total) as valor_total_vendas,
        SUM(comissao_valor) as total_comissoes_geradas,
        COUNT(DISTINCT cliente_nome) as total_clientes_unicos,
        AVG(valor_total) as ticket_medio,
        COUNT(CASE WHEN status = 'confirmada' THEN 1 END) as vendas_confirmadas,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as vendas_pendentes,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as vendas_canceladas
       FROM vendas_agenciador 
       WHERE agenciador_id = ? AND ativo = TRUE`,
      [agenciador_id]
    );

    // Buscar estatísticas de recebimentos
    const [estatisticasRecebimentos] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_recebimentos,
        SUM(valor_recebido) as valor_total_recebido,
        COUNT(CASE WHEN status = 'pago' THEN 1 END) as recebimentos_pagos,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as recebimentos_pendentes
       FROM recebimentos_agenciador 
       WHERE agenciador_id = ? AND ativo = TRUE`,
      [agenciador_id]
    );

    // Buscar estatísticas de parcelas
    const [estatisticasParcelas] = await db.promise().query(
      `SELECT 
        COUNT(*) as total_parcelas,
        SUM(valor) as valor_total_parcelas,
        COUNT(CASE WHEN status = 'paga' THEN 1 END) as pagas,
        COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
        COUNT(CASE WHEN status = 'atrasada' THEN 1 END) as atrasadas,
        SUM(CASE WHEN status = 'paga' THEN valor ELSE 0 END) as valor_pago,
        SUM(CASE WHEN status = 'pendente' THEN valor ELSE 0 END) as valor_pendente,
        SUM(CASE WHEN status = 'atrasada' THEN valor ELSE 0 END) as valor_atrasado
       FROM parcelas_venda p
       INNER JOIN vendas_agenciador v ON p.venda_id = v.id
       WHERE v.agenciador_id = ? AND p.ativo = TRUE`,
      [agenciador_id]
    );

    // Calcular taxa de conversão
    const totalVendas = estatisticasVendas[0].total_vendas || 0;
    const vendasConfirmadas = estatisticasVendas[0].vendas_confirmadas || 0;
    const taxaConversao = totalVendas > 0 ? ((vendasConfirmadas / totalVendas) * 100).toFixed(2) : 0;

    // Calcular taxa de recebimento
    const totalParcelas = estatisticasParcelas[0].total_parcelas || 0;
    const parcelaspagas = estatisticasParcelas[0].pagas || 0;
    const taxaRecebimento = totalParcelas > 0 ? ((parcelaspagas / totalParcelas) * 100).toFixed(2) : 0;

    logger.info('Relatório de desempenho gerado', {
      agenciador_id,
      user_id: req.user?.id
    });

    res.json({
      success: true,
      data: {
        agenciador: {
          id: agenciador[0].id,
          usuario_id: agenciador[0].usuario_id,
          comissao_percentual: agenciador[0].comissao_percentual,
          total_vendas_intermediadas: agenciador[0].total_vendas_intermediadas,
          total_comissao: agenciador[0].total_comissao
        },
        vendas: {
          ...estatisticasVendas[0],
          taxa_confirmacao: `${taxaConversao}%`
        },
        parcelas: {
          ...estatisticasParcelas[0],
          taxa_recebimento: `${taxaRecebimento}%`
        },
        recebimentos: estatisticasRecebimentos[0]
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de desempenho', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de desempenho',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/relatorios-agenciador/agenciador/:agenciador_id/pendencias
 * Relatório de pendências (parcelas atrasadas, comissões não pagas)
 */
router.get('/agenciador/:agenciador_id/pendencias', auth, param('agenciador_id').isInt({ min: 1 }), async (req, res) => {
  try {
    const { agenciador_id } = req.params;

    // Buscar parcelas atrasadas
    const [parcelasAtrasadas] = await db.promise().query(
      `SELECT 
        p.id,
        p.numero_parcela,
        v.numero_processo,
        v.cliente_nome,
        p.valor,
        p.data_vencimento,
        DATEDIFF(CURDATE(), p.data_vencimento) as dias_atraso,
        p.forma_pagamento
       FROM parcelas_venda p
       INNER JOIN vendas_agenciador v ON p.venda_id = v.id
       WHERE v.agenciador_id = ? AND p.status = 'atrasada' AND p.ativo = TRUE
       ORDER BY p.data_vencimento ASC`,
      [agenciador_id]
    );

    // Buscar comissões não pagas
    const [comissoesNaoPagas] = await db.promise().query(
      `SELECT 
        c.id,
        c.venda_id,
        c.valor_venda,
        c.valor_comissao,
        c.periodo_mes,
        c.periodo_ano,
        c.status
       FROM comissoes_agenciador c
       WHERE c.agenciador_id = ? AND c.status = 'pendente' AND c.ativo = TRUE
       ORDER BY c.periodo_ano DESC, c.periodo_mes DESC`,
      [agenciador_id]
    );

    // Buscar recebimentos não realizados
    const [recebimentosNaoRealizados] = await db.promise().query(
      `SELECT 
        r.id,
        r.periodo_mes,
        r.periodo_ano,
        r.valor_total_comissoes,
        r.status,
        DATE_ADD(LAST_DAY(CONCAT(r.periodo_ano, '-', LPAD(r.periodo_mes, 2, '0'), '-01')), INTERVAL 30 DAY) as data_prevista
       FROM recebimentos_agenciador r
       WHERE r.agenciador_id = ? AND r.status = 'pendente' AND r.ativo = TRUE
       ORDER BY r.periodo_ano DESC, r.periodo_mes DESC`,
      [agenciador_id]
    );

    // Calcular totais
    const totalParcelasAtrasadas = parcelasAtrasadas.reduce((sum, p) => sum + parseFloat(p.valor || 0), 0);
    const totalComissoesNaoPagas = comissoesNaoPagas.reduce((sum, c) => sum + parseFloat(c.valor_comissao || 0), 0);
    const totalRecebimentosNaoRealizados = recebimentosNaoRealizados.reduce((sum, r) => sum + parseFloat(r.valor_total_comissoes || 0), 0);

    logger.info('Relatório de pendências gerado', {
      agenciador_id,
      user_id: req.user?.id
    });

    res.json({
      success: true,
      data: {
        parcelas_atrasadas: {
          total: parcelasAtrasadas.length,
          valor_total: totalParcelasAtrasadas,
          detalhes: parcelasAtrasadas
        },
        comissoes_nao_pagas: {
          total: comissoesNaoPagas.length,
          valor_total: totalComissoesNaoPagas,
          detalhes: comissoesNaoPagas
        },
        recebimentos_nao_realizados: {
          total: recebimentosNaoRealizados.length,
          valor_total: totalRecebimentosNaoRealizados,
          detalhes: recebimentosNaoRealizados
        },
        resumo: {
          valor_total_pendente: totalParcelasAtrasadas + totalComissoesNaoPagas + totalRecebimentosNaoRealizados
        }
      }
    });
  } catch (error) {
    logger.error('Erro ao gerar relatório de pendências', { error: error.message, user_id: req.user?.id });
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar relatório de pendências',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
