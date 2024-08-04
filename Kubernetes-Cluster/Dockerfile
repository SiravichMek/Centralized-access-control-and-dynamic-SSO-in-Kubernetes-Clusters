FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY generateToken/roleToken.js .

EXPOSE 3008

CMD [ "node", "roleToken.js" ]
