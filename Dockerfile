FROM node:latest

RUN mkdir -p /usr/src/nest-test
WORKDIR /usr/src/nest-test

COPY package*.json /usr/src/nest-test/
RUN npm install

COPY . /usr/src/nest-test