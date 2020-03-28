FROM node:lts-slim

ARG DB_URL
RUN test -n "$DB_URL"
ENV DB_URL $DB_URL

ARG REDIS_URL
RUN test -n "$REDIS_URL"
ENV REDIS_URL $REDIS_URL

ENV APP_DIR /var/www/app
RUN mkdir -p $APP_DIR
WORKDIR ${APP_DIR}

COPY modules modules
COPY api api

WORKDIR ${APP_DIR}/modules/shared
RUN npm i && npm run build

WORKDIR ${APP_DIR}/modules/data
RUN npm i && npm run build

WORKDIR ${APP_DIR}/api

RUN npm i
RUN npm run build

CMD ["npm", "start"]