const { MongoClient } = require('mongodb');

async function updateImovelImages() {
  const client = new MongoClient('mongodb://localhost:27017/firenzeImobiliaria');
  
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');
    
    const db = client.db('firenzeImobiliaria');
    const collection = db.collection('imovels');
    
    // Atualizar o imóvel com as imagens corretas
    const result = await collection.updateOne(
      { _id: new require('mongodb').ObjectId('68aa5167b69a841731d59e16') },
      {
        $set: {
          imagens: [
            'uploads/imoveis/imagens-1755909324917.jpg',
            'uploads/imoveis/imagens-1755909324942.jpg'
          ],
          fotoPrincipal: '0'
        }
      }
    );
    
    console.log('Resultado da atualização:', result);
    
    if (result.modifiedCount > 0) {
      console.log('✅ Imóvel atualizado com sucesso!');
    } else {
      console.log('❌ Nenhum documento foi modificado');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await client.close();
    console.log('Conexão fechada');
  }
}

updateImovelImages();