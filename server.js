const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");

const cloudinary = require('cloudinary').v2;
require('dotenv').config();


const mongoose = require('mongoose');
const app = express();
mongoose.set('strictQuery', false);
app.use(express.json());
app.use(cors(corsOptions));
const bodyParser = require('body-parser')

var corsOptions = {
  origin: ['http://192.168.56.1:8000','http://localhost:8000', 'http://localhost:3001','http://127.0.0.1:5173','http://127.0.0.1:5174']
};

cloudinary.config({
  cloud_name: "dncrtidgo",
  api_key: 783742147831456,
  api_secret: "Ivu3bFAbUL0eO7w9EP8IFf055T0",
}); 

MONGODB_URI="mongodb+srv://ahmedouvadel:09132339Aa@cluster0.m2qi4nf.mongodb.net/testBrimaApp?retryWrites=true&w=majority";


   
const productRoutes=require ('./app/routes/product.routes')
const productPartnerRoutes=require ('./app/routes/productPartner.routes')
const profilPartnerRoutes=require ('./app/routes/profilPartner.routes')
const partnerRoutes=require ('./app/routes/partner.routes')

const formulairePartnerRoutes=require ('./app/routes/formulairePartner.routes')

const uploadRoute = require('./app/routes/upload.route'); 
const downloadRoutes = require('./app/routes/download.routes');
const orderRoutes = require('./app/routes/order.routes'); 
const cartaRoutes = require ('./app/routes/carta.routes')

app.use('/download', downloadRoutes);
app.use('/upload', uploadRoute); 



// parse requests of content-type - application/json


// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;

//pour compas
 // `mongodb://localhost:27017/Livro`
db.mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to temo team application." });
});


app.use('/product',productRoutes)
app.use('/productPartner',productPartnerRoutes)
app.use('/profilPartner',profilPartnerRoutes)
app.use('/partner',partnerRoutes)
app.use('/carta',cartaRoutes)
app.use('/formulairePartner',formulairePartnerRoutes)
app.use('/order',orderRoutes)

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}
