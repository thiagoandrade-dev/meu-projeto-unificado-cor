require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Inquilino = require("../models/Inquilino");

const dbURI = process.env.MONGODB_URI || "mongodb://localhost:27017/firenzeImobiliaria";

async function atualizarUsuarios() {
  try {
    await mongoose.connect(dbURI);
    console.log("Conectado ao MongoDB para atualizar usuários...");

    // Atualizar status de "Ativo" para "ativo" e "Inativo" para "inativo"
    const resultStatus = await Inquilino.updateMany(
      { status: { $in: ["Ativo", "Inativo"] } },
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  { case: { $eq: ["$status", "Ativo"] }, then: "ativo" },
                  { case: { $eq: ["$status", "Inativo"] }, then: "inativo" }
                ],
                default: "$status"
              }
            }
          }
        }
      ]
    );

    console.log(`Status atualizado para ${resultStatus.modifiedCount} usuários`);

    // Adicionar campos dataCadastro e telefone se não existirem
    const resultCampos = await Inquilino.updateMany(
      { dataCadastro: { $exists: false } },
      [
        {
          $set: {
            dataCadastro: "$createdAt",
            telefone: { $ifNull: ["$telefone", ""] }
          }
        }
      ]
    );

    console.log(`Campos adicionados para ${resultCampos.modifiedCount} usuários`);

    // Listar todos os usuários para verificar
    const usuarios = await Inquilino.find().select("-senha");
    console.log("\nUsuários no banco:");
    usuarios.forEach(usuario => {
      console.log(`- ${usuario.nome} (${usuario.email}) - Perfil: ${usuario.perfil}, Status: ${usuario.status}`);
    });

    await mongoose.disconnect();
    console.log("\nDesconectado do MongoDB.");
  } catch (error) {
    console.error("Erro ao atualizar usuários:", error);
    process.exit(1);
  }
}

atualizarUsuarios();