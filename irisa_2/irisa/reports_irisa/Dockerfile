# Usamos Node 20 Alpine para que pese poco
FROM node:20-alpine

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos todo
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite
EXPOSE 5173

# Comando para desarrollo con los flags de host necesarios
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]