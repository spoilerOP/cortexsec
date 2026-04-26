# Build stage for React Frontend
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage for Node Backend
FROM node:20-slim
WORKDIR /app
# Copy server dependencies and install
COPY server/package*.json ./
RUN npm install --production
# Copy server source and built frontend
COPY server/server.js ./
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "server.js"]
