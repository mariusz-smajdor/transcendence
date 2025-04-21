FROM node:22

RUN apt-get update && apt-get install -y sqlite3

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
