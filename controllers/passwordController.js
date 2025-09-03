const bcrypt = require("bcrypt");
const { User, valid_forgot_password } = require("../models/user");
const { sendPasswordMail } = require("../utils/mailer");
const asyncHandler = require("express-async-handler");

// Page "Mot de passe oublié"
const getForgotPassword = asyncHandler(async (req, res) => {
    res.render("forgot-password", { error: null, message: null });
});

// Traitement "Mot de passe oublié" → envoi code
const postForgotPassword = asyncHandler(async (req, res) => {
    const { error } = valid_forgot_password(req.body);
    if (error) return res.render("forgot-password", { 
        error: error.details[0].message, 
        message: null 
    });

    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Toujours afficher le même message pour des raisons de sécurité
    if (!user) return res.render("forgot-password", {
        message: "Si l'email existe, un code de validation a été envoyé",
        error: null
    });

    // Générer code 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.validationCode = code;
    user.validationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await user.save();

    try {
        // Construire le lien de réinitialisation
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password?email=${encodeURIComponent(email)}&code=${code}`;
        
        await sendPasswordMail(email, resetLink, code);
        res.render("validate-code", { 
            email, 
            error: null,
            message: "Un code de validation a été envoyé à votre email" 
        });
    } catch (err) {
        console.error(err);
        res.render("forgot-password", { 
            error: "Erreur lors de l'envoi du mail", 
            message: null 
        });
    }
});

// Page "Validation du code"
const getValidateCode = (req, res) => {
    const { email } = req.query;
    res.render("validate-code", { 
        email, 
        error: null,
        message: null 
    });
};

// Traitement "Validation du code"
const postValidateCode = asyncHandler(async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) return res.render("validate-code", { 
        email, 
        error: "Tous les champs sont requis",
        message: null 
    });

    const user = await User.findOne({
        email,
        validationCode: code,
        validationCodeExpires: { $gt: Date.now() },
    });

    if (!user) return res.render("validate-code", { 
        email, 
        error: "Code invalide ou expiré",
        message: null 
    });

    // Rediriger vers la page de réinitialisation avec email et code
    res.redirect(`/reset-password?email=${encodeURIComponent(email)}&code=${code}`);
});

// Page "Réinitialiser mot de passe"
const getResetPassword = asyncHandler(async (req, res) => {
    const { email, code } = req.query;
    
    if (!email || !code) {
        return res.render("reset-password", { 
            email: "", 
            code: "", 
            error: "Email et code requis",
            message: null 
        });
    }

    // Vérifier que le code est toujours valide
    const user = await User.findOne({
        email,
        validationCode: code,
        validationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.render("reset-password", { 
            email, 
            code, 
            error: "Code invalide ou expiré",
            message: null 
        });
    }

    res.render("reset-password", { 
        email, 
        code, 
        error: null,
        message: null 
    });
});

// Traitement "Nouveau mot de passe"
const postResetPassword = asyncHandler(async (req, res) => {
    const { email, code, password, confirmPassword } = req.body;

    if (!email || !code || !password || !confirmPassword) {
        return res.render("reset-password", { 
            email, 
            code, 
            error: "Tous les champs sont requis",
            message: null 
        });
    }
    if (password !== confirmPassword) {
        return res.render("reset-password", { 
            email, 
            code, 
            error: "Les mots de passe ne correspondent pas",
            message: null 
        });
    }
    if (password.length < 8) {
        return res.render("reset-password", { 
            email, 
            code, 
            error: "Le mot de passe doit contenir au moins 8 caractères",
            message: null 
        });
    }

    const user = await User.findOne({
        email,
        validationCode: code,
        validationCodeExpires: { $gt: Date.now() },
    });

    if (!user) return res.render("reset-password", { 
        email, 
        code, 
        error: "Code invalide ou expiré",
        message: null 
    });

    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.validationCode = undefined;
    user.validationCodeExpires = undefined;
    await user.save();

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Mot de passe réinitialisé</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .success { color: green; font-size: 18px; }
                a { color: #007bff; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="success">
                <h2>Mot de passe réinitialisé avec succès !</h2>
                <p>Vous pouvez maintenant vous connecter.</p>
                <p><a href="/login">Se connecter</a></p>
            </div>
        </body>
        </html>
    `);
});

module.exports = {
    getForgotPassword,
    postForgotPassword,
    getValidateCode,
    postValidateCode,
    getResetPassword,
    postResetPassword,
};