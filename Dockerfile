FROM node:9

WORKDIR /app

EXPOSE 80

ENV S2_PORT 80
ENV S2_DATA_DIR /data
ENV S2_TRUST_PROXY 0

RUN mkdir -p /data
RUN mkdir -p /app

COPY ./package.json /app
RUN npm install

COPY src/ /app/src/
COPY public/ /app/public/
COPY index.js /app/

CMD [ "node", "index.js" ]
