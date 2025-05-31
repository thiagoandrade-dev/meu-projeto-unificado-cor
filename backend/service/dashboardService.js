module.exports = {
  async getEstatisticas() {
    return {
      totalImoveis: await Imovel.countDocuments({}),
      totalInquilinos: await Inquilino.countDocuments({}),
      // ... outras queries
    };
  }
};