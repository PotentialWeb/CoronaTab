FROM mhart/alpine-node

ENV APP_DIR /var/www/app
RUN mkdir -p $APP_DIR
WORKDIR ${APP_DIR}

COPY modules modules
COPY site site

WORKDIR ${APP_DIR}/modules/shared
RUN npm i && npm run build

WORKDIR ${APP_DIR}/site

RUN npm i
RUN npm run build:production

CMD ["npm", "start", "--", "-p", "$PORT"]