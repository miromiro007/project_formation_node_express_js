const express = require('express');
const router = express.Router();
const { addReservation, updateReservationStatus } = require('../controllers/reservationController');
const { verifyToken } = require('../middleware/verifyToken');

// Route pour ajouter une nouvelle réservation (employé)
router.post('/', verifyToken, addReservation);

// Route pour mettre à jour le statut d'une réservation (admin)
router.put('/:id', verifyToken, updateReservationStatus);


module.exports = router;