FROM node:6

EXPOSE 80

ENV S2_PORT 80
ENV S2_DATA_DIR /data

RUN mkdir -p /data
RUN mkdir -p /app
COPY . /app

WORKDIR /app
CMD [ "npm", "start" ]
