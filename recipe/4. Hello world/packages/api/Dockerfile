FROM node

ENV USER=api-user NODE_ENV=production
RUN adduser --disabled-password --gecos "" $USER

WORKDIR /app

COPY package*json ./
RUN npm ci
COPY index.js ./

USER $USER
CMD npm start
