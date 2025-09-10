const mongoose = require("mongoose");
const Joi = require("joi");

// ✅ Schéma Mongoose Reservation
const ReservationSchema = new mongoose.Schema({
    formation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Formation", // 🔥 Référence par le nom du modèle
        required: true
    },
    employe: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // 🔥 Référence à ton modèle User
        required: true
    },
    status: {
        type: String,
        enum: ["en_attente", "confirmee", "annulee"],
        default: "en_attente"
    },
    dateReservation: { 
        type: Date, 
        default: Date.now // 🔥 sans ()
    }
}, { timestamps: true });

// ✅ Validation avec Joi
function ValidationDemandeReservation(obj) {
    const schema = Joi.object({
        formation: Joi.string().required(),
    });
    return schema.validate(obj);
}
// ✅ Validation avec Joi  
function ValidationReservation(obj) {
    const schema = Joi.object({
        status: Joi.string().valid("en_attente", "confirmee", "annulee").required()
    });
    return schema.validate(obj); // ⚠️ Assure-toi de RETURN
}

const Reservation = mongoose.model("Reservation", ReservationSchema);

module.exports = {
    Reservation,
    ValidationDemandeReservation,
    ValidationReservation
};
