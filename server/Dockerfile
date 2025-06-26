# Use an official Node.js runtime as a parent image.
# Using alpine for a smaller image size.
FROM node:20-alpine

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json to the working directory.
# Copying them first leverages Docker's layer caching.
COPY package*.json ./

# Install production dependencies.
# 'npm ci' is often faster and more reliable for CI/CD.
RUN npm ci --only=production

# Copy the rest of your application's source code.
COPY . .

# Expose the port the app runs on.
EXPOSE 8080

# Define the command to run your app.
CMD [ "node", "server.js" ]
