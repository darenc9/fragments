# This Dockerfile is used to build a Docker image for a Node.js microservice
# for Fragments.

# Stage 0: Build Dependencies
FROM node:21-bookworm@sha256:162d92c5f1467ad877bf6d8a098d9b04d7303879017a2f3644bfb1de1fc88ff0 AS dependencies

# Use /app as our working directory
WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies
RUN npm install 

# Copy src to /app/src/
COPY ./src ./src

##############################################################

# Stage 1: Deploy
FROM alpine:3.19.1@sha256:c5b1261d6d3e43071626931fc004f70149baeba2c8ec672bd4f27761f8e1ad6b

# Set labels
LABEL maintainer="Devon Chan <dchen80@myseneca.ca"
LABEL description="Fragments node.js microservice"

# Set environment variables
ENV PORT=${PORT:-8080} \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Install npm and curl
RUN apk update && \
    apk add --no-cache npm=10.2.5-r0 curl=8.5.0-r0

# Use /app as our working directory
WORKDIR /app

# Copy dependencies from dependencies stage
COPY --from=dependencies /app /app

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["node", "src/index.js"]

# We run our service on port 8080
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=15s --timeout=10s --start-period=10s --retries=3 \
    CMD curl --fail localhost:${PORT}/ || exit 1