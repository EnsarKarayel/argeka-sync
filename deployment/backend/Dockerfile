FROM node:22-alpine

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/src ./src

ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
