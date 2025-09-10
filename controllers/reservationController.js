const {Reservation,ValidationDemandeReservation,ValidationReservation} =require("../models/reservation") ;
const asyncHandler = require("express-async-handler")
const {sendReservationStatusEmail} = require("../utils/mailer");

require("dotenv").config();

/**
 * @desc    Ajouter une nouvelle réservation
 * @route   POST /api/reservations
 * @access  Employé
 * @desc Demander de reserver un formation a l admin
 */
const addReservation = asyncHandler(async(req,res)=>{
    // Validation des données entrantes
    const { error } = ValidationDemandeReservation(req.body);
    if (error) {
       return res.status(400).json({ message: error.details[0].message });
    }

    //verify token and get user id
    const employeId = req.user.id; // Assure-toi que le middleware d'authentification est en place
    if(!employeId || req.user.role !=='employe') {
        return res.status(401).json({message:"Non autorisé"});
    }

    // Créer une nouvelle réservation
    const newReservation = new Reservation({
        formation: req.body.formation,
        employe: employeId,
        status: "en_attente", // Statut par défaut
        dateReservation: Date.now() // Par défaut, la date actuelle
    })

    // Sauvegarder la réservation dans la base de données
    await newReservation.save();
    res.status(201).json({message:"Demande de réservation envoyée avec succès", reservation:newReservation })
    
})
/**
 * @desc    Mettre à jour le statut d'une réservation par l'admin
 * @route   PUT /api/reservations/:id
 * @access  Admin
 * @desc L'admin peut confirmer ou annuler une réservation
 */
const updateReservationStatus = asyncHandler(async(req,res)=>{
    // Validation des données entrantes
    const {error}=ValidationReservation(req.body)
    if(error) return res.status(400).json({message:error.details[0].message});  

    //verify token 
    if(req.user.role !=='admin') {
        return res.status(401).json({message:"Non autorisé"});
    }

    // Trouver la réservation par ID et peupler employe et formation
    const reservation = await Reservation.findById(req.params.id)
        .populate('employe','email nom')
        .populate('formation',  'titre');
    if(!reservation){
        return res.status(404).json({message:"Réservation non trouvée"})
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

    res.status(200).json({message:"Statut de la réservation mis à jour avec succès", reservation})
})



module.exports = {
    addReservation,
    updateReservationStatus
};

