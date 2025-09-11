const express = require('express');
const {getUsersProfile} = require('../controllers/userController');
const { verifyToken } = require('../middleware/verifyToken');
const router = express.Router();

// Route pour récupérer les profils utilisateurs avec filtres
router.get('/profile', verifyToken,getUsersProfile);

module.exports = router;