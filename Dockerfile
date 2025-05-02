# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package files to install dependencies first (improves caching)
COPY package.json package-lock.json ./

# Install dependencies (only production packages)
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]
