FROM node:21-alpine3.19

WORKDIR /code

COPY . /code/

RUN npm i

CMD npm run start:prod