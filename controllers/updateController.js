const { User, valid_mise_a_jour, valid_code_validation,valid_activation_compte } = require("../models/user");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { generateToken } = require("../middleware/verifyToken");
const { sendValidationUpdate, sendValidationConfirmation ,sendStatusActif} = require("../utils/mailer");

// PUT Update user
/**
 * @file updateController.js
 * @description Met à jour les informations d'un utilisateur après vérification du token
 * @route PUT /api/userUpdate/Update/:id
 * @access Privé - Seul l'utilisateur propriétaire du compte
 */
const UpdateUser = asyncHandler(async (req, res) => {
    console.log("Decoded user :", req.user);

    //🔐 Vérification le role 
    if (req.body.role && req.body.role !== user.role) {
    return res.status(403).json({ 
        message: "La modification du rôle n'est pas autorisée" 
    });
}

    // 🔐 Vérification que l'utilisateur modifie bien son propre compte
    if (req.user.id !== req.params.id) {
        return res.status(403).json({ message: "Modification interdite" });
    }

    // ✅ Validation des données avec Joi
    const { error } = valid_mise_a_jour(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 🔍 Recherche de l'utilisateur dans la base de données
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 📧 Gestion spéciale pour le changement d'email
    if (req.body.email && req.body.email !== user.email) {
        // Génération d'un code de validation à 6 chiffres
        const validationCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Expiration du code dans 24 heures
        const validationCodeExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Stockage temporaire du nouvel email et du code
        user.newEmail = req.body.email; // Champ temporaire pour le nouvel email
        user.validationCode = validationCode;
        user.validationCodeExpires = validationCodeExpires;
        user.emailVerified = false; // Email non validé tant que le code n'est pas confirmé

        await user.save();
        
        // 📨 Envoi du code de validation par email
        await sendValidationUpdate(req.body.email, validationCode);

        return res.status(200).json({
            message: "Un code de validation a été envoyé à votre nouvelle adresse email.",
            requiresValidation: true
        });
    }

    // 🔐 Hashage du mot de passe s'il est modifié
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    // 📋 Préparation des données de mise à jour (on exclut l'email qui est géré séparément)
    const updateData = { ...req.body };
    delete updateData.email; // L'email est géré via le processus de validation

    // 💾 Mise à jour de l'utilisateur dans la base de données
    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true } // Retourne le document mis à jour
    ).select("-password"); // Exclut le mot de passe de la réponse

    // ✅ Réponse de succès
    res.status(200).json({
        message: "Utilisateur mis à jour avec succès",
        user: updatedUser
    });
});

// POST Validate email update
/**
 * @file updateController.js
 * @description Valide la mise à jour de l'adresse email avec le code reçu
 * @route POST /api/userUpdate/validateEmail
 * @access Public - Nécessite le code de validation
 */
const ValidateEmailUpdate = asyncHandler(async (req, res) => {
    const { error } = valid_code_validation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 🔍 Chercher l'utilisateur par le code de validation uniquement
    const user = await User.findOne({ validationCode: req.body.code });
    
    if (!user) {
        return res.status(404).json({ message: "Code de validation invalide ou expiré" });
    }

    // ⏰ Vérifier si le code n'a pas expiré
    if (user.validationCodeExpires < new Date()) {
        return res.status(400).json({ message: "Le code de validation a expiré" });
    }

    // ✅ Mettre à jour l'email avec celui fourni dans la requête
    user.email = req.body.email;
     // Mise à jour de l'utilisateur : email validé
  user.emailVerified = true;
  user.validationCode = null;
  user.validationCodeExpires = null;
    
    await user.save();

    await sendValidationConfirmation(user.email);

    res.status(200).json({
        message: "Email validé et mis à jour avec succès"
    });
});

// PUT Changer le status 
/**
 * @file updateController.js
 * @description Valide la mise à jour de l'adresse email avec le code reçu
 * @route  /api/userUpdate/Change_status
 * @access only (admin)
 */
const Change_status = asyncHandler(async(req, res) => {
    console.log("Decoded user :", req.user);
    
    // 1. Vérifier que seul un admin peut faire cette action
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Non autorisé - Réservé aux admins" });
    }

    const { error } = valid_activation_compte(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // 2. Trouver l'utilisateur à modifier
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // 3. Vérifier qu'on ne modifie pas son propre statut
    if (req.user.id === req.params.id) {
        return res.status(403).json({ message: "Vous ne pouvez pas modifier votre propre statut" });
    }
    // 4. Vérifier si le statut est déjà celui demandé (évite opération inutile)
    if (user.statut === req.body.statut) {
        return res.status(200).json({
            message: `Le statut est déjà "${user.statut}" - Aucune modification nécessaire`
        });
    }

    // 5. Mettre à jour le statut
    user.statut = req.body.statut; 
    await user.save();

    // 6. Envoyer l'email de notification
    await sendStatusActif(user.email, user.statut);

    return res.status(200).json({
        message: `Statut modifié avec succès: ${user.statut}`
    });
});
module.exports = { UpdateUser, ValidateEmailUpdate , Change_status };