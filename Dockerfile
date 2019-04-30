FROM node:12.0-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk update
RUN apk --no-cache add --virtual builds-deps build-base python
RUN npm config set python /usr/bin/python
RUN npm ci --only-production

COPY . .

EXPOSE 80

CMD [ "npm" , "start" ]
