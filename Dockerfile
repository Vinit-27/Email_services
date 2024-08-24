# Use the official Node.js image.
FROM node:18

# Create and set the working directory.
WORKDIR /usr/src/app

# Create a directory for logs.
RUN mkdir -p logs

# Copy package.json and install dependencies.
COPY package*.json ./
RUN npm install

# Copy the rest of the application code.
COPY . .

# Compile TypeScript to JavaScript (if applicable).
# RUN npm run build

# Expose the port the app runs on.
EXPOSE 3000

# Command to run the application.
CMD ["node", "index.js"]
