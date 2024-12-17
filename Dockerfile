FROM node:16

ARG MONGODBURI
ENV MONGODBURI=$MONGODBURI

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY docker .

EXPOSE 3000

CMD ["npm", "start"]
