FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
# Ensure Prisma client is generated for the current schema (MySQL)
RUN npx prisma generate

EXPOSE 8123

# Use start instead of dev for production stability
CMD ["npm", "start"]
