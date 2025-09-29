const express = require("express");
const router = express.Router();

const {
  getForgotPassword,
  postForgotPassword,
  postValidateCode,
  getResetPassword,
  postResetPassword,
} = require("../controllers/passwordController");

// Route GET facultative, utile uniquement si utilisée côté front classique
// Peut être supprimée si uniquement SPA Angular est utilisé
router.get("/forgot-password", getForgotPassword);

// POST demander un code
router.post("/forgot-password", postForgotPassword);

// POST validation du code
router.post("/validate-code", postValidateCode);

// GET reset password (optionnel pour contrôles côté front)
// Peut retourner JSON ou être supprimé si front gère toute la navigation
router.get("/reset-password", getResetPassword);

// POST réinitialisation mot de passe
router.post("/reset-password", postResetPassword);

module.exports = router;
