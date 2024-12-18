const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// Configurazione CORS per consentire richieste solo da andreacop.retool.com
const corsOptions = (req, callback) => {
    const allowedOrigins = [
        'https://andreacop.retool.com',
        'null', // Consente richieste locali o senza origine definita
    ];
    const origin = req.header('Origin');

    if (allowedOrigins.includes(origin) || !origin) {
        // Se l'origine è consentita, aggiungila alle intestazioni
        callback(null, { origin: true });
    } else {
        // Blocca altre origini
        callback(new Error('Not allowed by CORS'));
    }
};

// Applica le impostazioni di CORS globalmente
app.use(cors(corsOptions));

// Serve i file statici di React
app.use(express.static(path.join(__dirname, "build"))); // Assumendo build Vite

// Route per gestire tutte le altre richieste
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});