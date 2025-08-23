const mongoose = require('mongoose');
const Imovel = require('./models/Imovel');

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/imobiliaria', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixImages() {
  try {
    console.log('Conectando ao banco de dados...');
    
    // Atualizar o imóvel específico com as imagens corretas
    const result = await Imovel.findByIdAndUpdate(
      '68aa5167b69a841731d59e16',
      {
        $set: {
          imagens: [
            'uploads/imoveis/imagens-1755909324917.jpg',
            'uploads/imoveis/imagens-1755909324942.jpg'
          ],
          fotoPrincipal: 'uploads/imoveis/imagens-1755909324917.jpg'
        }
      },
      { new: true }
    );
    
    if (result) {
      console.log('Imóvel atualizado com sucesso!');
      console.log('Novas imagens:', result.imagens);
      console.log('Foto principal:', result.fotoPrincipal);
    } else {
      console.log('Imóvel não encontrado.');
    }
    
  } catch (error) {
    console.error('Erro ao atualizar imóvel:', error);
  } finally {
    mongoose.connection.close();
    console.log('Conexão fechada.');
  }
}

fixImages();