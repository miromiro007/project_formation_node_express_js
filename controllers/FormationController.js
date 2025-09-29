const {Formation,valid_CreationFormation,valid_DeleteFormation,valid_UpdateFormation} = require("../models/formation");
const asyncHandler = require ("express-async-handler");
const {} = require("../utils/mailer");
const cors = require('cors');
require("dotenv").config();


// Autoriser toutes les origines (développement uniquement)




//Get Formation (can be filtred by any filter)
/**
 * @file formationController.js
 * @description Controller pour gérer les formations
 * @access Public
 * @desc Récupérer toutes les formations avec possibilité de filtres dynamiques
 * @route GET /api/formations
 * @returns {Array<Object>} 
 */

const getFormations = asyncHandler(async (req, res) => {
  const { titre, domaine, dateDebut, dateFin, placeDispo } = req.query || {};

  let filtre = {};

  // Filtre partiel sur le titre (insensible à la casse)
  if (titre) {
    filtre.titre = { $regex: titre, $options: "i" };
  }

  // Filtre partiel sur le domaine (insensible à la casse)
  if (domaine) {
    filtre.domaine = { $regex: domaine, $options: "i" };
  }

  // Filtrage sur la dateDebut comprise entre dateDebut et dateFin
  if (dateDebut || dateFin) {
    filtre.dateDebut = {};
    if (dateDebut) filtre.dateDebut.$gte = new Date(dateDebut);
    if (dateFin) filtre.dateDebut.$lte = new Date(dateFin);
  }

  // Filtrage exact sur le nombre de places disponibles
  if (placeDispo) {
    filtre.placeDispo = { $gte: parseInt(placeDispo , 10) };
  }

  const formations = await Formation.find(filtre);
  res.status(200).json(formations);
});

/**
 * @desc  Récupérer une formation par son ID
 * @route GET /api/formations/:id
 * @access Public
 */
const getFormation = asyncHandler(async (req, res) => {
  const formation = await Formation.findById(req.params.id);

  if (!formation) {
    return res.status(404).json({ message: "Formation non trouvée" });
  }

  res.status(200).json(formation);
});




/**
 * @desc    Ajouter une nouvelle formation (admin seulement)
 * @route   POST /api/formations
 * @access  Admin
 */
const addFormation = asyncHandler(async (req, res) => {

  // ✅ Vérification du rôle
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé(e)" });
  }

  // ✅ Validation des données
  const { error } = valid_CreationFormation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // ✅ Création et sauvegarde
  const formation = new Formation({
    titre: req.body.titre,
    description: req.body.description,
    domaine: req.body.domaine,
    competenceVisee: req.body.competenceVisee,
    dateDebut: req.body.dateDebut,
    dateFin: req.body.dateFin,
    placeDispo: req.body.placeDispo,
    numeroSalle: req.body.numeroSalle,
  });

  const createdFormation = await formation.save();
  // ✅ Réponse
  res.status(201).json(createdFormation);
});

/**
 * @desc    Supprimer une formation par ID (admin seulement)
 * @route   DELETE /api/formations/:id
 * @access  Admin
 */
const deleteFormation = asyncHandler(async (req, res) => {
  // ✅ Vérification du rôle admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé(e)" });
  }

  const formation = await Formation.findById(req.params.id);
  if (!formation) {
    return res.status(404).json({ message: "Formation non trouvée" });
  }

  // ✅ Version compatible Mongoose 6+
  await Formation.deleteOne({ _id: req.params.id });

  res.status(200).json({ message: "Formation supprimée avec succès" });
});


/**
 * @desc    Mettre à jour une formation par ID (admin seulement)
 * @route   PUT /api/formations/:id
 * @access  Admin
 */
const updateFormation = asyncHandler(async (req, res) => {
  // ✅ Vérification du rôle admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Vous n'êtes pas autorisé(e)" });
  }

  // ✅ Validation des données
  const { error } = valid_UpdateFormation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  // ✅ Recherche et mise à jour
  const updatedFormation = await Formation.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true } // renvoie la formation mise à jour
  );

  if (!updatedFormation) {
    return res.status(404).json({ message: "Formation non trouvée" });
  }

  res.status(200).json(updatedFormation);
});


module.exports = {getFormations,addFormation,deleteFormation,updateFormation,getFormation}

