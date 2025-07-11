FROM alpine:3.19
EXPOSE 3000
RUN apk add yarn
WORKDIR /app
COPY package.json yarn.lock tsconfig.json .eslintrc.json ./
WORKDIR /app/projects/frontend
COPY projects/frontend/package.json projects/frontend/tsconfig.json projects/frontend/tsconfig.node.json projects/frontend/vite.config.ts projects/frontend/index.html ./
COPY projects/frontend/src/ src/
COPY projects/frontend/public/ public/
RUN yarn --pure-lockfile
ENTRYPOINT ["yarn", "run", "start"]
