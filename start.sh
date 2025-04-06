#!/bin/bash

echo "Building the project..."
cd client
npm install
npm run build &
cd ..

echo "Starting Docker containers..."
docker-compose up --build
