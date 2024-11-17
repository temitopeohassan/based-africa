# Use Node.js base image
FROM node:18-buster

# Install dependencies required by the canvas package
RUN apt-get update && apt-get install -y \
  libcairo2 \
  libpango1.0-0 \
  libjpeg8-dev \
  libgif-dev \
  librsvg2-dev \
  && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy your project files
COPY . .

# Install the project dependencies
RUN yarn install --production

# Expose the server port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
