const express = require("express");
const router = express.Router();
const { getFormations , addFormation, deleteFormation, updateFormation } = require("../controllers/FormationController"); // Nom correct
const { verifyToken } = require("../middleware/verifyToken");

// GET Formations avec filtres
router.get("/", getFormations); // ajoute verifyToken si nécessaire

//Post  create neauveau Formation
router.post("/addFormation",verifyToken,addFormation);

//DELETE Formation by id 
router.delete("/deleteFormation/:id", verifyToken, deleteFormation);


// PUT update formation par ID
router.put("/updateFormation/:id", verifyToken, updateFormation);

module.exports = router;

