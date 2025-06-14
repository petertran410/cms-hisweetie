FROM node:20-alpine3.18

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .
COPY .env .env

EXPOSE 3333

# Add --host flag to expose on all interfaces
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "3333"]