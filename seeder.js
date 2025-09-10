const mongoose = require("mongoose");
const { Formation } = require("./models/formation");
const connectToDB = require("./db");
const Formations = require("./data/data");

connectToDB();

// 👉 Import formations
const importFormations = async () => {
  try {
    await Formation.insertMany(Formations);
    console.log("✅ Formations insérées avec succès");
    process.exit(); // quitte après insertion
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion :", error.message);
    process.exit(1);
  }
};

// 👉 Delete formations
const deleteFormations = async () => {
  try {
    await Formation.deleteMany();
    console.log("🗑️ Toutes les formations supprimées");
    process.exit(); // quitte après suppression
  } catch (error) {
    console.error("❌ Erreur lors de la suppression :", error.message);
    process.exit(1);
  }
};

// 👉 Command handler
if (process.argv[2] === "-import") {
  importFormations();
} else if (process.argv[2] === "-remove") {
  deleteFormations();
} else {
  console.log("❓ Utilise -import ou -remove");
  process.exit(1);
}
