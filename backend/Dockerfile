FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci && npm install -g nodemon

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
