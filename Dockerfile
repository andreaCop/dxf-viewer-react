# Usa un'immagine Node.js
FROM node:18

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutti i file del progetto
COPY . .

# Compila l'app React (build)
RUN npm run build

# Espone la porta (per Express o React standalone)
EXPOSE 8080

# Comando per avviare il server
CMD ["node", "server.js"]