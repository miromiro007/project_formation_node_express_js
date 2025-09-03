const express = require("express")
const router = express.Router();
const {loginUser,logoutUser}= require("../controllers/loginController")
const { verifyToken ,} = require("../middleware/verifyToken");

// Route POST pour la connexion
router.post("/login", loginUser);


// Route POST pour la déconnexion (protégée par token)
router.post("/logout", verifyToken, logoutUser);


module.exports = router