# Utiliser une image Node.js alpine légère
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste de l'application
COPY . .

#Exposer port  
EXPOSE 5000

# Démarrer l'application

CMD  ["npm", "start"]

