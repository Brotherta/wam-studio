# public/Dockerfile

# Use the official Node.js image as the base image
FROM node:16

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the frontend application using Webpack
RUN npm run build


# Expose the port used by the HTTP server
EXPOSE 5002

# Start the HTTP server
CMD ["npm", "run", "start:prod"]