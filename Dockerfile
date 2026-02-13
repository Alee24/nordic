FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite port
EXPOSE 8542

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8542"]
