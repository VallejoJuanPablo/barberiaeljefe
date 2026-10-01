FROM node:22-alpine

WORKDIR /app

# Fuentes para renderizado SVG en sharp (tarjetas QR)
RUN apk add --no-cache fontconfig ttf-dejavu

# Instalar dependencias
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar codigo fuente
COPY src ./src

# Crear carpeta uploads
RUN mkdir -p uploads/marcas uploads/tarjetas

EXPOSE 3200

CMD ["node", "src/server.js"]
