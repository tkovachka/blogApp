FROM node:20

ARG MONGODBURI
ENV MONGODBURI=$MONGODBURI

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
