const {User } = require('../models/user');
const asyncHandler = require('express-async-handler');
const {Reservation} = require("../models/reservation")
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

/**
 * @file userController.js
 * @desc Supprimer un utilisateur par l'admin
 * @route DELETE /api/user/delete/:id
 * @access Admin
 */
const deleteProfile = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: "Accès refusé, administrateur uniquement" });
  }

  const userId = req.params.id;

  // Trouver l'utilisateur à supprimer
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "Utilisateur introuvable" });
  }

  // Trouver toutes les réservations de cet utilisateur
  const reservations = await Reservation.find({ employe: userId }).populate('formation');

  // Pour chaque réservation confirmée, remettre une place disponible dans la formation
  for (const reservation of reservations) {
    if (reservation.status === "confirmee" && reservation.formation) {
      reservation.formation.placeDispo += 1;
      await reservation.formation.save();
    }
  }

  // Supprimer toutes les réservations de l'utilisateur
  await Reservation.deleteMany({ employe: userId });

  // Supprimer l'utilisateur
  await User.findByIdAndDelete(userId);

  return res.status(200).json({ message: `L'utilisateur ${userId} et ses réservations associées ont été supprimés avec succès` });
});


// ✅ Correct
module.exports = {
    getUsersProfile,
    deleteProfile
};  