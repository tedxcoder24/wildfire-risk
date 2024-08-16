# Stage 1: Build Stage
FROM node:18-alpine AS builder

WORKDIR /src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Production Stage
FROM node:18-alpine

WORKDIR /src/app

# Copy only the necessary files
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main"]
