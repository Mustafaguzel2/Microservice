# Environment Setup Guide

This guide explains how to configure environment variables for all microservices in this project.

## Overview

Each service has its own `.env.example` file that shows all required environment variables. Copy these files to `.env` and configure them according to your environment.

## Quick Setup

```bash
# Copy all .env.example files to .env
cp api-gateway/.env.example api-gateway/.env
cp identity-service/.env.example identity-service/.env
cp media-service/.env.example media-service/.env
cp post-service/.env.example post-service/.env
cp search-service/.env.example search-service/.env
```

## Service Configuration Details

### 1. API Gateway (Port: 3001)

**Required Variables:**

- `PORT`: Server port (default: 3001)
- `REDIS_URL`: Redis connection for rate limiting
- `IDENTITY_SERVICE_URL`: Identity service endpoint
- `POST_SERVICE_URL`: Post service endpoint  
- `MEDIA_SERVICE_URL`: Media service endpoint
- `SEARCH_SERVICE_URL`: Search service endpoint
- `JWT_SECRET`: JWT secret key (must match identity service)

### 2. Identity Service (Port: 3002)

**Required Variables:**

- `PORT`: Server port (default: 3002)
- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection for rate limiting
- `JWT_SECRET`: JWT secret key for token generation

### 3. Post Service (Port: 3003)

**Required Variables:**

- `PORT`: Server port (default: 3003)
- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection for rate limiting and caching
- `RABBITMQ_URL`: RabbitMQ connection for event messaging

### 4. Media Service (Port: 3004)

**Required Variables:**

- `PORT`: Server port (default: 3004)
- `MONGO_URI`: MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `RABBITMQ_URL`: RabbitMQ connection for event messaging

### 5. Search Service (Port: 3005)

**Required Variables:**

- `PORT`: Server port (default: 3005)
- `MONGO_URI`: MongoDB connection string
- `REDIS_URL`: Redis connection for rate limiting
- `RABBITMQ_URL`: RabbitMQ connection for event messaging

## External Dependencies Setup

### MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
brew install mongodb/brew/mongodb-community
brew services start mongodb/brew/mongodb-community
```

### Redis

```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest

# Or install locally
brew install redis
brew services start redis
```

### RabbitMQ

```bash
# Using Docker
docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management

# Or install locally
brew install rabbitmq
brew services start rabbitmq
```

### Cloudinary

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name, API key, and API secret from dashboard
3. Configure in media service environment variables

## Security Considerations

1. **JWT Secret**: Use a strong, unique secret key
2. **Database Credentials**: Use proper authentication for production
3. **API Keys**: Keep Cloudinary credentials secure
4. **Environment Files**: Never commit actual `.env` files to version control

## Environment-Specific Configurations

### Development

```bash
NODE_ENV=development
# Use local databases and services
MONGO_URI=mongodb://localhost:27017/service_name
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
```

### Production

```bash
NODE_ENV=production
# Use production databases with authentication
MONGO_URI=mongodb://username:password@prod-host:27017/service_name
REDIS_URL=redis://username:password@prod-host:6379
RABBITMQ_URL=amqp://username:password@prod-host:5672
```

## Verification

After setting up all environment variables, verify the configuration:

```bash
# Check if all services can start
cd api-gateway && npm start &
cd identity-service && npm start &
cd post-service && npm start &
cd media-service && npm start &
cd search-service && npm start &

# Check service health
curl http://localhost:3001/health    # API Gateway
curl http://localhost:3002/health    # Identity Service
curl http://localhost:3003/health    # Post Service
curl http://localhost:3004/health    # Media Service
curl http://localhost:3005/health    # Search Service
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if external services (MongoDB, Redis, RabbitMQ) are running
2. **Invalid Token**: Ensure JWT_SECRET matches between API Gateway and Identity Service
3. **CORS Errors**: Check service URLs in API Gateway configuration
4. **Cloudinary Errors**: Verify API credentials and account status

### Service Dependencies

``` a
API Gateway → Identity, Post, Media, Search Services
Post Service → MongoDB, Redis, RabbitMQ
Media Service → MongoDB, Cloudinary, RabbitMQ
Search Service → MongoDB, Redis, RabbitMQ
Identity Service → MongoDB, Redis
```

## Environment Variables Summary

| Variable | API Gateway | Identity | Post | Media | Search |
|----------|-------------|----------|------|-------|--------|
| PORT | ✓ | ✓ | ✓ | ✓ | ✓ |
| MONGO_URI | ✗ | ✓ | ✓ | ✓ | ✓ |
| REDIS_URL | ✓ | ✓ | ✓ | ✗ | ✓ |
| RABBITMQ_URL | ✗ | ✗ | ✓ | ✓ | ✓ |
| JWT_SECRET | ✓ | ✓ | ✗ | ✗ | ✗ |
| CLOUDINARY_* | ✗ | ✗ | ✗ | ✓ | ✗ |
| SERVICE_URLS | ✓ | ✗ | ✗ | ✗ | ✗ |
