const express = require("express");
const router = express.Router();
const {
    getForgotPassword,
    postForgotPassword,
    getValidateCode,
    postValidateCode,
    getResetPassword,
    postResetPassword
} = require("../controllers/passwordController");

// 🔹 Page "Mot de passe oublié"
router.get("/forgot-password", getForgotPassword);
router.post("/forgot-password", postForgotPassword);

// 🔹 Page "Validation du code"
router.get("/validate-code", getValidateCode);
router.post("/validate-code", postValidateCode); // AJOUTER CETTE LIGNE

// 🔹 Page "Réinitialiser le mot de passe"
router.get("/reset-password", getResetPassword);
router.post("/reset-password", postResetPassword);

module.exports = router;