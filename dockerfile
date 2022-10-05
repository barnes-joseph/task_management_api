FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
Run npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 8080

# Start application
CMD ["npm", "run", "start"]