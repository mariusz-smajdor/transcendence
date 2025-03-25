#!/bin/bash

echo "Starting TypeScript watch..."
cd client
npm run build &
cd ..

echo "Starting Docker containers..."
docker-compose up --build
