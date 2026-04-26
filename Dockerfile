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
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY server/ ./server/
COPY --from=build /app/dist ./dist

EXPOSE 5000
CMD ["node", "server/server.js"]
