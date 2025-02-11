const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const uri = "mongodb://localhost:27017"; // Remplace par ton URL MongoDB
const client = new MongoClient(uri);

app.get('/depots-proches', async (req, res) => {
    const { latitude, longitude } = req.query;
    
    try {
        await client.connect();
        console.log("Connecté à MongoDB !"); // Message pour confirmer la connexion

        const db = client.db("dechetsDB");  // Remplace par le nom de ta base
        const depots = await db.collection("depots").find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(longitude), parseFloat(latitude)]
                    },
                    $maxDistance: 10000 // Rayon de 5 km
                }
            }
        }).limit(3).toArray();
        
        res.json(depots);
    } catch (err) {
        console.error("Erreur de connexion MongoDB:", err); // Message d'erreur en cas de problème
        res.status(500).send(err);
    } finally {
        await client.close(); // Assure-toi de fermer la connexion après la requête
    }
});

app.listen(3000, () => console.log("Serveur en cours sur http://localhost:3000"));
