const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { UpdateUser, ValidateEmailUpdate ,Change_status} = require("../controllers/updateController");


// Mise à jour du profil utilisateur (protégée par token)
router.put("/:id", verifyToken, UpdateUser);

// Validation du code pour la modification d'email
router.post("/validate-email", ValidateEmailUpdate);

// Route pour changer le statut (RH seulement)
router.put("/change-status/:id", verifyToken, Change_status);

module.exports = router;

