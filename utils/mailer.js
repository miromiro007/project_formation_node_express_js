const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Fonction pour envoyer l'email de confirmation d'inscription
async function sendRegistrationEmail(email, nom, validationCode) {
    const mailOption = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Confirmez votre adresse email",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Bonjour ${nom},</h2>
            <p>Votre compte a été créé avec succès. Veuillez vérifier votre adresse email en utilisant le code suivant :</p>
            <h3 style="color: #007bff;">${validationCode}</h3>
            <p>Ce code est valide pendant 24 heures. Une fois votre email vérifié, un responsable admin examinera votre compte pour l'activer.</p>
            <p>Cordialement,</p>
            <p>L'équipe admin</p>
        </div>
        `,
    };
    try {
        await transporter.sendMail(mailOption);
        console.log(`Email envoyé à ${email} avec le code ${validationCode}`);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        throw new Error("Erreur lors de l'envoi de l'email de confirmation.");
    }
}

   // Fonction pour envoyer l'email de validation réussie
   async function sendValidationSuccessEmail(email, nom) {
    const mailOption = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Validation de votre adresse email réussie",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Bonjour ${nom},</h2>
            <p>Votre adresse email a été vérifiée avec succès !</p>
            <p>Votre compte est actuellement en attente d'approbation par un responsable admin. Vous recevrez une notification une fois votre compte activé.</p>
            <p>Cordialement,</p>
            <p>L'équipe admin</p>
        </div>
        `,
    };
    try {
        await transporter.sendMail(mailOption);
        console.log(`Email de validation réussie envoyé à ${email}`);
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de validation réussie :", error);
        throw new Error("Erreur lors de l'envoi de l'email de validation réussie.");
    }
   }

    //detecter le login 
    async function sendLoginNotification(email,ip,userAgent){
        const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Nouvelle connexion détectée",
        text: `Bonjour,

               Nous avons détecté une nouvelle connexion à votre compte depuis un appareil avec les informations suivantes :
               Adresse IP : ${ip}
               Appareil/Navigateur : ${userAgent}
               Date et heure : ${new Date().toLocaleString()}
               Si ce n'était pas vous, merci de vérifier la sécurité de votre compte.
               Cordialement,
               L'équipe de support`,
        };

    return transporter.sendMail(mailOptions);
}

    // Email de validation pour changement d'email
    async function sendValidationUpdate(email,code){
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Code de validation pour la modification de votre email",
            html: `
                <h2>Validation de votre nouvelle adresse email</h2>
                <p>Votre code de validation est: <strong>${code}</strong></p>
                <p>Ce code expirera dans 24 heures.</p>
                <p>Si vous n'avez pas demandé de changement d'email, veuillez ignorer ce message.</p>`
            };

            return transporter.sendMail(mailOptions);
    }

    //Email de Confirmation de validation du update
    async function sendValidationConfirmation(email){
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Votre email a été validé avec succès",
            text: `
                Validation d'email réussie !

                Bonjour,

                Votre adresse email a été validée avec succès et est maintenant activée sur votre compte.

                Vous pouvez désormais utiliser cette adresse email pour vous connecter à votre compte et recevoir toutes nos communications.

                ✅ Email validé avec succès

                Date de validation: ${new Date().toLocaleString('fr-FR')}

                Si vous n'êtes pas à l'origine de cette action, veuillez contacter immédiatement le support.

                Cordialement,
                L'équipe de support`
            };

            return transporter.sendMail(mailOptions);
    }

   //Email de Confirmation de 
async function sendStatusActif(email, status) {
    const subject = status === 'actif' 
        ? "Votre compte a été activé" 
        : "Votre compte a été désactivé";
    
    const text = status === 'actif'
        ? `Bonjour, votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.`
        : `Bonjour, votre compte a été désactivé. Contactez l'administration pour plus d'informations.`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: text
    };

    return transporter.sendMail(mailOptions);
}

// ✅ Fonction générique d'envoi
async function sendMail(to, subject, html) {
    try {
        await transporter.sendMail({
            from: `"Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log(`📧 Email envoyé à ${to}`);
        return true;
    } catch (err) {
        console.error("Erreur envoi email:", err);
        throw new Error("Erreur lors de l'envoi du mail");
    }
}

// ✅ Fonction spécialisée pour reset password
async function sendPasswordMail(to, code) {
    const html = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Réinitialisation du mot de passe</title>
        </head>
        <body>
            <h2>Réinitialisation de votre mot de passe</h2>
            <p>Bonjour,</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>Voici votre code de validation :</p>
            <h3 style="color:blue;">${code}</h3>
            <p>Ou cliquez directement sur ce lien :</p>
            <p><b>⚠️ Ce code/lien est valable 15 minutes.</b></p>
            <p>Si vous n'avez pas fait cette demande, ignorez ce message.</p>
            <br>
            <p>— L'équipe Support</p>
        </body>
        </html>
    `;
    return sendMail(to, "Réinitialisation du mot de passe", html);
}

async function sendReservationStatusEmail(email, nom, formation, status) {
    const statusMessage = status === 'confirmee'
        ? `Votre réservation pour la formation "${formation}" a été confirmée.`
        : `Votre réservation pour la formation "${formation}" a été annulée.`;

    const html = `
        <div>
            <h2 style="color: #333;">Bonjour ${nom},</h2>
            <p>${statusMessage}</p>
            <p>Cordialement,</p>
            <p>L'équipe admin</p>
        </div>
    `;

    // Envoi de l'email
    return sendMail(email, "Mise à jour de votre réservation", html);
}



module.exports = { transporter, 
    sendRegistrationEmail,
    sendValidationSuccessEmail,
    sendLoginNotification,
    sendValidationUpdate ,
    sendValidationConfirmation ,
    sendStatusActif,
    sendPasswordMail,
    sendMail,
    sendPasswordMail,
    sendReservationStatusEmail};
