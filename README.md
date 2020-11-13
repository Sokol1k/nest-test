# Nest-test

### Installation

1. Copy `.env` file
```sh
$ cp .env.dist .env
```
2. Configure `.env` to send message to mail
```sh
MAILER_SERVICE=gmail
MAILER_USER=example@mail.com
MAILER_PASS=password
```
3. Run `docker-compose.yml`
```sh
$ sudo docker-compose up
```
4. Install packages
```sh
$ npm install
```
5. Run project
```sh
$ npm run start
```

### Test

For testing purposes, follow steps 1-4 from the **Installation** section. And after that do next step
```sh
$ npm run test:e2e
```