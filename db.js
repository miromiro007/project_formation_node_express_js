const mongoose = require("mongoose");
require("dotenv").config();

console.log("mongoURL from .env:", process.env.mongoURL); // pour debug

function connectToDB() {
    mongoose.connect(process.env.mongoURL || "mongodb://mongodb:27017/orange_formation")
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch((error) => {
        console.error("❌ Échec de connexion à MongoDB :", error.message);
        process.exit(1);
    });
}

module.exports = connectToDB;