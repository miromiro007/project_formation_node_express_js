const express = require('express');
const {getUsersProfile , deleteProfile} = require('../controllers/userController');
const { verifyToken } = require('../middleware/verifyToken');
const router = express.Router();

// Route pour récupérer les profils utilisateurs avec filtres
router.get('/profile', verifyToken,getUsersProfile);

// 🗑️ Supprimer un user par id
router.delete('/delete/:id', verifyToken, deleteProfile);

module.exports = router;