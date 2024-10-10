FROM node:20.15.0

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y build-essential python3

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]