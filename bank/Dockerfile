# server/Dockerfile

# Use the official Node.js image as the base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY pedalboard2/package*.json ./pedalboard2/
COPY pedalboard2/server/package*.json ./pedalboard2/server/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build
RUN npm run build

# Expose the port used by the Express server
EXPOSE 6002

# Start the Express server
CMD ["npm", "run", "start:prod"]
