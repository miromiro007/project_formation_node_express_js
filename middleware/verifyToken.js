const jwt = require("jsonwebtoken"); 
require("dotenv").config();

function verifyToken(req, res, next) {
    const token = req.query.token || req.headers['x-access-token'];
  
    if (!token) {
        return res.status(403).json({ message: "Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = decoded; // Stocke les données décodées dans `req.user`
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
}

function generateToken(user) {
    
    return jwt.sign(
        { message : "login reussie",
          id: user._id, email: user.email, role: user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "7d" } //expiration dans 7 days 
    );
}

module.exports = { verifyToken, generateToken };
