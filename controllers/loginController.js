    const {User,valid_connexion,valid_code_validation} = require("../models/user")
    const asyncHandler = require("express-async-handler");
    const bcrypt = require("bcrypt");
    require("dotenv").config();
    const crypto = require("crypto");
    const { invalid } = require("joi");
    const {generateToken}= require("../middleware/verifyToken");
    const { sendLoginNotification } = require("../utils/mailer");

    //Post login user 
    /**
     * @file loginController.js
     * @description Gère l'enregistrement des utilisateurs (route POST /login)
     * @route /api/userLogin/login
     * @requires express
     * @requires bcrypt
     * @requires express-async-handler
     * @requires ../models/user (modèle Mongoose + fonctions de validation)
     */
    const loginUser = asyncHandler(async(req,res)=>{

        // 1. Validation des données
        const { error } = valid_connexion(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        // 2. Recherche de l'utilisateur
        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

        user.enLigne = true ;
        user.save();
        
        // 3. Vérification du mot de passe
        const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordMatch) return res.status(400).json({ message: "Mot de passe invalide" });


        // Récupérer IP et User-Agent
        const ip = req.ip || req.connection.remoteAddress || "IP non disponible";
        const userAgent = req.headers['user-agent'] || "Agent utilisateur non disponible";
        
        // Envoyer mail notification
        sendLoginNotification(user.email, ip, userAgent).catch(console.error);

        
        // ✅ Réponse en cas de succès (ex: sans token pour l'instant)
        const token = generateToken(user);
        res.json({
            message: "Connexion réussie",
            token,
            user: {
                id: user._id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                statut: user.statut,
                enLigne : user.enLigne
            }
        });
            
    })


    const logoutUser = asyncHandler(async(req,res)=>{
      const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }
        
        if (!user.enLigne) {
            return res.status(400).json({ message: "Ce compte est déjà déconnecté" });
        }
        
        user.enLigne = false;
        await user.save();

        res.json({
            message: "Déconnexion réussie",
            user: {
                id: user._id,
                email: user.email,
                nom: user.nom,
                enLigne: user.enLigne
            }
        });
    })
    module.exports = {loginUser,logoutUser}