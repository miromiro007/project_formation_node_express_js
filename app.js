const express = require("express")
const app = express();
require("dotenv").config()
console.log("mongoURL from .env:", process.env.mongoURL);
const path= require("path");
const nodemailer = require("nodemailer");
const connectTo = require("./db");
const {User}= require('./models/user');
const cors = require('cors');


// Configurez CORS AVANT les routes !
app.use(cors({
  origin: 'http://localhost:4200', // autorisez votre front Angular
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true,
}));


//connection to database 
connectTo();





// Configuration EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");


//parse json
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


//import route 
const registerRoute = require("./routes/registerRoute");
const loginRoute = require("./routes/loginRoute")
const updateRoute = require("./routes/updateRoute")
const passwordRoute = require("./routes/passwordRoute");
const formationRoute = require("./routes/formationRoute");
const reservationRoute = require("./routes/reservationRoute");
const userRoute = require('./routes/userRoute')



//routing
app.use("/api/userRegister/",registerRoute);
app.use("/api/userLogin", loginRoute);
app.use("/api/userUpdate",updateRoute);
app.use("/",passwordRoute);
app.use("/api/formations",formationRoute);
app.use("/api/reservations",reservationRoute);
app.use("/api/user",userRoute)



const port  = process.env.PORT 
//app.listen(port, () => console.log(`Serveur lancé sur http://localhost:${port}`));





app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur lancé sur http://localhost:${port}`);
});




