FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (better cache)
COPY package.json package-lock.json ./
RUN npm install --production=false

# Copy the rest of the project
COPY . .

# Build Strapi admin
ENV NODE_ENV=production
RUN npm run build

# Expose Strapi port
EXPOSE 1337

# Start Strapi
CMD ["npm", "run", "start"]
