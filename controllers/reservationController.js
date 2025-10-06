const {Reservation,ValidationDemandeReservation,ValidationReservation} =require("../models/reservation") ;
const asyncHandler = require("express-async-handler")
const {sendReservationStatusEmail} = require("../utils/mailer");
const {Formation} = require("../models/formation")
const {User} = require("../models/user")

require("dotenv").config();

/**
 * @desc    Ajouter une nouvelle réservation
 * @route   POST /api/reservations
 * @access  Employé
 * @desc Demander de reserver un formation a l admin
 */
const addReservation = asyncHandler(async (req, res) => {
    // Validation des données entrantes
    const { error } = ValidationDemandeReservation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier l’utilisateur connecté
    const employeId = req.user.id;
    if (!employeId || req.user.role !== "employe") {
        return res.status(401).json({ message: "Non autorisé" });
    }

    // Vérifier que la formation existe
    const formation = await Formation.findById(req.body.formation);
    if (!formation) {
        return res.status(404).json({ message: "Formation introuvable" });
    }

    // Vérifier si l'employé a déjà réservé cette formation
    const reservationExistante = await Reservation.findOne({
        formation: formation._id,
        employe: employeId
    });

    if (reservationExistante) {
        return res.status(400).json({ message: "Vous avez déjà réservé cette formation" });
    }

    // Vérifier les places disponibles
    if (formation.placeDispo <= 0) {
        return res.status(400).json({ message: "Aucune place disponible pour cette formation" });
    }

    // Créer une nouvelle réservation
    const newReservation = new Reservation({
        formation: formation._id,
        employe: employeId,
        status: "en_attente",
        dateReservation: Date.now()
    });

    await newReservation.save();
    res.status(201).json({
        message: "Demande de réservation envoyée avec succès",
        reservation: newReservation
    });
});
/**
 * @desc    Mettre à jour le statut d'une réservation par l'admin
 * @route   PUT /api/reservations/:id
 * @access  Admin
 * @desc    L'admin peut confirmer, annuler ou remettre en attente une réservation
 */
const updateReservationStatus = asyncHandler(async (req, res) => {
    // Validation des données entrantes
    const { error } = ValidationReservation(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin") {
        return res.status(401).json({ message: "Non autorisé" });
    }

    // Trouver la réservation par ID et peupler employé + formation
    const reservation = await Reservation.findById(req.params.id)
        .populate("employe", "email nom")
        .populate("formation", "titre placeDispo");

    if (!reservation) {
        return res.status(404).json({ message: "Réservation non trouvée" });
    }

    // Si l'admin confirme la réservation
    if (req.body.status === "confirmee") {
        if (reservation.formation.placeDispo <= 0) {
            return res
                .status(400)
                .json({ message: "Plus de places disponibles pour cette formation" });
        }

        // Décrémenter le nombre de places disponibles
        reservation.formation.placeDispo -= 1;
        await reservation.formation.save();
    }

    // Mettre à jour le statut
    reservation.status = req.body.status;
    await reservation.save();

    // Envoyer un email à l'employé pour l'informer du changement de statut
    await sendReservationStatusEmail(
        reservation.employe.email,
        reservation.employe.nom,
        reservation.formation.titre,
        reservation.status
    );

    res.status(200).json({
        message: "Statut de la réservation mis à jour avec succès",
        reservation,
    });
});


/**
 * @desc    Récupérer toutes les réservations (peut être filtré par employé ou formation)
 * @route   GET /api/reservations
 * @access  Admin
 */
const getReservations = asyncHandler(async (req, res) => {
    // Vérifier si l'utilisateur est admin
    if (req.user.role !== "admin" ) {
        return res.status(401).json({ message: "Non autorisé" });
    }

    const { employeId, formationId } = req.query; // ✅ cohérence avec les paramètres
    let filtre = {};

    // Ajout des filtres si présents
    if (employeId) filtre.employe = employeId;
    if (formationId) filtre.formation = formationId;

    const reservations = await Reservation.find(filtre)
        .populate("employe", "nom email")
        .populate("formation", "titre");

    if (!reservations || reservations.length === 0) {
        return res.status(404).json({ message: "Aucune réservation trouvée" });
    }

    res.status(200).json(reservations);
});

/**
 * @desc    Supprimer une réservation avec validation par email
 * @route   DELETE /api/reservations/public/:id
 * @access  Public
 */
const deleteReservation = asyncHandler(async (req, res) => {
  const reservationId = req.params.id;

  const reservation = await Reservation.findById(reservationId).populate('employe');
  if (!reservation) {
    return res.status(404).json({ message: "Réservation non trouvée" });
  }

  // Si réservation confirmée, remettre une place dispo en vérifiant la capacité
  if (reservation.status === "confirmee") {
    const formation = await Formation.findById(reservation.formation);
    if (formation) {
        formation.placeDispo += 1;
        await formation.save();
    }
  }

  await Reservation.findByIdAndDelete(reservationId);

  res.status(200).json({
    message: "Réservation supprimée avec succès"
  });
});

/**
 * @desc    Récupérer toutes les réservations d un seul employe 
 * @route   GET /api/reservations/employe
 * @access  employe
 */
const getEmployeReservations = asyncHandler(async (req, res) => {
    if (!req.user) {
      console.error('Erreur : req.user est undefined. Middleware auth non appliquée ?');
      return res.status(401).json({ message: 'Non autorisé' });
    }

    if (req.user.role !== 'employe') {
      return res.status(401).json({ message: 'Non autorisé' });
    }

    const employeId = req.user.id;
    const reservations = await Reservation.find({ employe: employeId })
      .populate('formation', 'titre placeDispo dateDebut dateFin')
      .populate('employe', 'nom email');

    if (!reservations || reservations.length === 0) {
      return res.status(404).json({ message: 'Aucune réservation trouvée' });
    }

    res.json(reservations);
});


module.exports = {
    addReservation,
    updateReservationStatus,
    getReservations,
    deleteReservation,
    getEmployeReservations
};

