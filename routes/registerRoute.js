const express = require("express");
const router = express.Router();
const {createUser,validateUserCode} = require("../controllers/registerController")

// Route pour l'enregistrement
router.post("/register",createUser);

// Route pour valider le code
router.post("/validate-code", validateUserCode);


module.exports = router;




