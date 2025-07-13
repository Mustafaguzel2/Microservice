# Use the latest Node.js image with alpine linux
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 3004

# Start the application
CMD ["node", "src/server.js"]