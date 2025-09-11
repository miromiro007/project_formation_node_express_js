const {User} = require('../models/user');
const asyncHandler = require('express-async-handler')

/**
 * @file userController.js
 * @description Récupère les profils utilisateurs avec possibilité de filtres dynamiques
 * @route GET /api/user/profile
 * @access Admin
 * @returns {Array<Object>} Liste des utilisateurs filtrés
 */

// 👉 GET Users Profile (avec filtres ou tous si aucun filtre)
const getUsersProfile = asyncHandler(async (req, res) => {


    
    // Vérifie l'authentification et le rôle admin
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès refusé, administrateur uniquement" });
    }

    const filter = {};

    // 🔍 Recherche partielle par rôle
    if (req.query.role) {
        filter.role = { $regex: req.query.role, $options: "i" };
    }

    // 🔍 Recherche partielle par nom
    if (req.query.nom) {
        filter.nom = { $regex: req.query.nom, $options: "i" };
    }

    // 🔍 Recherche partielle par email
    if (req.query.email) {
        filter.email = { $regex: req.query.email, $options: "i" };
    }

    // ⚡ Si aucun filtre, retourne tous les utilisateurs
    const users = await User.find(filter);
    res.status(200).json(users);
});;


module.exports = {
    getUsersProfile
};