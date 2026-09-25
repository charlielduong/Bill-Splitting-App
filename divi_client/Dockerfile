FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY App.tsx index.ts app.json tsconfig.json .prettierrc.json .prettierignore ./
COPY assets ./assets
COPY divi_client ./divi_client
COPY tests ./tests

EXPOSE 8083

CMD ["npm", "run", "web", "--", "--host", "0.0.0.0", "--port", "8083"]
