#!/bin/bash

# Navigate to client directory and start TypeScript watch in background
echo "Starting TypeScript watch..."
cd client
npm run build & # Run tsc --watch in the background
cd ..

# Start Docker Compose
echo "Starting Docker containers..."
docker-compose up --build
