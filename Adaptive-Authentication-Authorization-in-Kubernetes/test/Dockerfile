FROM node:14

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY test/hello.js .

EXPOSE 3005

CMD [ "node", "hello.js" ]