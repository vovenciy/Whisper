# --- STAGE 1: Build Platform ---
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy dependency files first to leverage Docker caching
COPY package*.json ./

# Install all dependencies (including build tools)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the static production assets (outputs to /app/build)
RUN npm run build


# --- STAGE 2: Production Nginx Server ---
FROM nginx:1.27-alpine AS runner

# Copy the static files compiled by Create React App to Nginx's public directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx configuration to handle React Router client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
