const bcrypt = require("bcrypt");
const { User, valid_forgot_password } = require("../models/user");
const { sendPasswordMail } = require("../utils/mailer");
const asyncHandler = require("express-async-handler");

// Page "Mot de passe oublié" - si utilisée, sinon peut être supprimée en SPA Angular
const getForgotPassword = asyncHandler(async (req, res) => {
    res.json({ message: "Endpoint mot de passe oublié - GET endpoint non utilisé en SPA" });
});

// Traitement "Mot de passe oublié" → envoi code
const postForgotPassword = asyncHandler(async (req, res) => {
  const { error } = valid_forgot_password(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.json({ message: "Si l'email existe, un code de validation a été envoyé" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.validationCode = code;
  user.validationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  try {
    await sendPasswordMail(email, code);
    return res.json({ message: "Un code de validation a été envoyé à votre email" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Erreur lors de l'envoi du mail" });
  }
});

// POST - Validation du code
const postValidateCode = asyncHandler(async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: "Tous les champs sont requis" });

  const user = await User.findOne({
    email,
    validationCode: code,
    validationCodeExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Code invalide ou expiré" });

  return res.json({ message: "Code validé avec succès" });
});

// Page "Réinitialiser mot de passe" - pas nécessaire si front Angular, mais à garder si tu veux 
// (sinon peut renvoyer un json ou un message pour que front gère)
const getResetPassword = asyncHandler(async (req, res) => {
    const { email, code } = req.query;

    if (!email || !code) {
        return res.status(400).json({ message: "Email et code requis" });
    }

    const user = await User.findOne({
        email,
        validationCode: code,
        validationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: "Code invalide ou expiré" });
    }

    return res.json({ message: "Code valide" });
});

// POST - Réinitialisation du mot de passe
const postResetPassword = asyncHandler(async (req, res) => {
  const { email, code, password, confirmPassword } = req.body;

  if (!email || !code || !password || !confirmPassword) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Les mots de passe ne correspondent pas" });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères" });
  }

  const user = await User.findOne({
    email,
    validationCode: code,
    validationCodeExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: "Code invalide ou expiré" });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);

  user.emailVerified = true;
  user.validationCode = null;
  user.validationCodeExpires = null;
  await user.save();

  return res.json({ message: "Mot de passe réinitialisé avec succès" });
});

module.exports = {
    getForgotPassword,
    postForgotPassword,
    postValidateCode,
    getResetPassword,
    postResetPassword,
};