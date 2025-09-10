const mongoose = require("mongoose");
const Joi = require("joi");

// ✅ Schéma Mongoose
const formationSchema = new mongoose.Schema({
    titre: { type: String, required: true },
    description: { type: String },
    domaine: { type: String, required: true },
    competenceVisee: [{ type: String }],
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    placeDispo: { type: Number, required: true, min: 0 },
    numeroSalle: { type: String, required: true } 
}, { timestamps: true });

const Formation = mongoose.model("Formation", formationSchema);

// ✅ Validation création
function valid_CreationFormation(obj) {
    const schema = Joi.object({
        titre: Joi.string().min(3).required(),
        description: Joi.string().allow('', null),
        domaine: Joi.string().required(),
        competenceVisee: Joi.array().items(Joi.string()),
        dateDebut: Joi.date().required(),
        dateFin: Joi.date().greater(Joi.ref('dateDebut')).required(),
        placeDispo: Joi.number().min(0).required(),
        numeroSalle: Joi.string().required() // 🔥 Validation ajoutée
    });

    return schema.validate(obj);
}

// ✅ Validation mise à jour (tous les champs optionnels)
function valid_UpdateFormation(obj) {
    const schema = Joi.object({
        titre: Joi.string().min(3),
        description: Joi.string().allow('', null),
        domaine: Joi.string(),
        competenceVisee: Joi.array().items(Joi.string()),
        dateDebut: Joi.date(),
        dateFin: Joi.date().greater(Joi.ref('dateDebut')),
        placeDispo: Joi.number().min(0),
        numeroSalle: Joi.string() // 🔥 Optionnel pour update
    });

    return schema.validate(obj);
}

// ✅ Validation suppression
function valid_DeleteFormation(obj) {
    const schema = Joi.object({
        id: Joi.string().required() // ID obligatoire
    });

    return schema.validate(obj);
}

module.exports = {
    Formation,
    valid_CreationFormation,
    valid_UpdateFormation,
    valid_DeleteFormation
};
