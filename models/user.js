const mongoose = require("mongoose");
const Joi = require("joi");

// ✅ Schéma Mongoose optimisé
const userSchema = new mongoose.Schema({
    nom: { type: String, required: true, minlength: 5 },
    email: { type: String, required: true, minlength: 5, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['employe', 'rh'], default: 'employe' },
    competence: [String],
    statut: { 
        type: String, 
        enum: ['en_attente', 'actif', 'inactif'], 
        default: 'en_attente' 
    },
    validationCode: { type: String },
    validationCodeExpires: { type: Date },
    emailVerified: { type: Boolean, default: false }, // Nouveau champ pour vérifier l'email
    enLigne: { type: Boolean, default: false }
}, { timestamps: true });

// ✅ Validation pour l'enregistrement
function valid_Enregistrement(obj) {
    const schema = Joi.object({
        nom: Joi.string().min(5).required(),
        email: Joi.string().email().min(5).required(),
        password: Joi.string().min(8).required(),
        role: Joi.string().valid('employe', 'rh').default('employe')
    });
    return schema.validate(obj);
}

// ✅ Validation pour la connexion
function valid_connexion(obj) {
    const schema = Joi.object({
        email: Joi.string().email().min(5).required(),
        password: Joi.string().min(8).required()
    });
    return schema.validate(obj);
}

// ✅ Validation pour la mise à jour d'un utilisateur
function valid_mise_a_jour(obj) {
    const schema = Joi.object({
        nom: Joi.string().min(5),
        email: Joi.string().email().min(5),
        password: Joi.string().min(8),
        role: Joi.string().valid('employe', 'rh'),
        statut: Joi.string().valid('en_attente', 'actif', 'inactif')
    });
    return schema.validate(obj);
}

// ✅ Fonction simplifiée pour valider un compte utilisateur
function valid_activation_compte(obj) {
    const schema = Joi.object({
        statut: Joi.string().valid('actif', 'inactif').required()
    });
    return schema.validate(obj);
}

//✅ Fonction simplifiée  pour valider le code de comfirmation 
function valid_code_validation(obj){
    const schema = Joi.object({
        email: Joi.string().email().min(5).required(),
        code: Joi.string().length(6).required(),
    });
    return  schema.validate(obj);
}

// ✅ Validation pour forgot password
function valid_forgot_password(obj) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    return schema.validate(obj);
}

// ✅ Validation pour reset password
function valid_reset_password(obj) {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        code: Joi.string().length(6).required(),
        password: Joi.string().min(8).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    return schema.validate(obj);
}

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    valid_Enregistrement,
    valid_connexion,
    valid_mise_a_jour,
    valid_activation_compte,valid_code_validation,
    valid_forgot_password,
    valid_reset_password
};