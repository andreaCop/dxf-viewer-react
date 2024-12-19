const express = require("express");
const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch"); // Per ottenere il file DXF da URL esterni

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

// Endpoint per caricare il file DXF da un URL
app.get("/api/load-dxf", async (req, res) => {
    const fileUrl = req.query.file; // Ottieni il "file" dall'URL

    if (!fileUrl) {
        return res.status(400).json({ error: "Il parametro 'file' è obbligatorio." });
    }

    try {
        // Effettua il fetch del contenuto del file DXF
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Errore nel recupero del file: ${response.statusText}`);
        }

        const dxfContent = await response.text();

        // Invia il contenuto come file DXF
        res.setHeader('Content-Type', 'application/dxf');
        res.send(dxfContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: `Errore durante il caricamento del file: ${error.message}` });
    }
});

// Route per gestire tutte le altre richieste
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Avvio del server
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});