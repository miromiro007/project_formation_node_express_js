const { User,valid_Enregistrement,valid_connexion,valid_mise_a_jour,valid_activation_compte,valid_code_validation} = require("../models/user");
const asyncHandler = require ("express-async-handler");
const bcrypt = require("bcrypt");
const { sendRegistrationEmail,sendValidationSuccessEmail } = require("../utils/mailer");
require("dotenv").config();
const crypto = require("crypto");



//Post register user 
/**
 * @file registerController.js
 * @description Gère l'enregistrement des utilisateurs (route POST /register)
 * @route /api/userRegister/register
 * @requires express
 * @requires bcrypt
 * @requires express-async-handler
 * @requires ../models/user (modèle Mongoose + fonctions de validation)
 */
const createUser = asyncHandler(async (req, res) => {
    // 1. Validation
    const { error } = valid_Enregistrement(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    // 2. Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send({ message: "This user is already registered" });

    // 3. Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);


    // 4. Générer un code de validation à 6 chiffres
    const validationCode = crypto.randomInt(100000, 999999).toString() // Code à 6 chiffres
    const validationCodeExpires = Date.now() +  5 * 60 * 1000; // Expire dans 5 minutes 

    //Generer un code de 6 chiffre 

    // 4. Créer le nouvel utilisateur
    const newUser = new User({
        nom: req.body.nom,
        email: req.body.email,
        password: hashedPassword,
        role: req.body.role || 'employe',
        statut: req.body.role==='admin'?'actif':'en_attente',
        validationCode, // Ajouter le code
        validationCodeExpires, // Ajouter la date d'expiration
        emailVerified: false
    });

    const savedUser = await newUser.save();

   // 6. Envoyer l'email avec le code
    try {
        await sendRegistrationEmail(savedUser.email, savedUser.nom, validationCode);
        console.log(`Email envoyé à ${savedUser.email} avec le code ${validationCode}`);
    } catch (err) {
        console.error("Erreur d'envoi d'email:", err);
        return res.status(500).send({ message: "Erreur lors de l'envoi de l'email de confirmation." });
    }

    // 6. Préparer la réponse sans le mot de passe
    const userResponse = {
        _id: savedUser._id,
        nom: savedUser.nom,
        email: savedUser.email,
        role: savedUser.role,
        statut: savedUser.statut,
        emailVerified: savedUser.emailVerified,
        createdAt: savedUser.createdAt
    };



    res.status(201).json({
        message: "Compte créé avec succès. En attente d'activation par le admin.",
        user: userResponse,
    });
});

// ✅ POST : validation du code de confirmation email
const validateUserCode = asyncHandler(async (req, res) => {
  // Vérification de la structure des données reçues
  const { error } = valid_code_validation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { email, code } = req.body;

  // Recherche de l'utilisateur par email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "Utilisateur non trouvé." });
  }

  // Vérification du code de validation
  if (String(user.validationCode) !== String(code)) {
    return res.status(401).json({ message: "Code de validation incorrect." });
  }

  // Vérification de l'expiration du code
  if (!user.validationCodeExpires || new Date(user.validationCodeExpires).getTime() < Date.now()) {
    return res.status(400).json({ message: "Code de validation expiré." });
  }

  // Mise à jour de l'utilisateur : email validé
  user.emailVerified = true;
  user.validationCode = null;
  user.validationCodeExpires = null;

  await user.save();

  // Envoi d'un mail de confirmation de succès
  
  await sendValidationSuccessEmail(user.email, user.nom);
  
  console.log("hahahahha")

  // ✅ Réponse succès
  res.status(200).json({
    message: "Email vérifié avec succès. Votre compte est désormais en attente d'approbation par un administrateur."
  });
});



module.exports = { createUser ,validateUserCode};