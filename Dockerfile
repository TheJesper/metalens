# Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Enable corepack for yarn
RUN corepack enable

# Copy package files
COPY package*.json yarn.lock* ./

# Copy @covers/ui dependency (from sibling directory during build)
COPY covers-ui-package /app/covers-ui-package

# Update package.json to use copied ui package
RUN sed -i 's|"@covers/ui": "file:../covers/packages/ui"|"@covers/ui": "file:./covers-ui-package"|g' package.json

# Install dependencies
RUN yarn install

# Copy source
COPY . .

# Build
RUN yarn build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
