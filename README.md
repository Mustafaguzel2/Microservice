# Microservices Architecture Project

A scalable microservices-based application built with Node.js, Express, MongoDB, Redis, and RabbitMQ. This project demonstrates a complete backend architecture with API Gateway, authentication, content management, media handling, and search functionality.

## 🏗️ Architecture Overview

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client    │────│   API Gateway   │────│    Services     │
│             │    │    (Port 3000)  │    │                 │
└─────────────┘    └─────────────────┘    └─────────────────┘
                            │
                            └─────┬─────┬─────┬─────┬─────
                                  │     │     │     │     │
                         ┌────────▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐ ┌─▼─┐
                         │Identity  │ │Post│ │Media│ │Search│
                         │Service   │ │Svc │ │Svc │ │Svc │
                         │(Port 3001)│ │3002│ │3003│ │3004│
                         └──────────┘ └───┘ └───┘ └───┘ └───┘
                                  │     │     │     │
                         ┌────────▼─────▼─────▼─────▼─────┐
                         │    Shared Infrastructure     │
                         │  MongoDB │ Redis │ RabbitMQ  │
                         └──────────────────────────────┘
```

## 🚀 Services Overview

### API Gateway (Port 3000)
- **Purpose**: Single entry point for all client requests
- **Features**: Request routing, authentication, rate limiting, CORS handling
- **Technologies**: Express.js, JWT, Redis, Rate Limiting
- **Routes**: Proxies to all microservices

### Identity Service (Port 3001)
- **Purpose**: User authentication and authorization
- **Features**: User registration, login, JWT token management, password hashing
- **Technologies**: Express.js, MongoDB, Argon2, JWT
- **Database**: User profiles and authentication data

### Post Service (Port 3002)
- **Purpose**: Content management and post operations
- **Features**: CRUD operations for posts, content validation
- **Technologies**: Express.js, MongoDB, RabbitMQ, Multer
- **Database**: Posts, comments, content metadata

### Media Service (Port 3003)
- **Purpose**: Media file handling and storage
- **Features**: File upload, image processing, cloud storage integration
- **Technologies**: Express.js, MongoDB, Cloudinary, RabbitMQ
- **Database**: Media metadata and file references

### Search Service (Port 3004)
- **Purpose**: Search functionality across content
- **Features**: Full-text search, indexing, search analytics
- **Technologies**: Express.js, MongoDB, Redis, RabbitMQ
- **Database**: Search indices and analytics

## 🛠️ Technologies Used

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Argon2
- **Media Storage**: Cloudinary
- **Containerization**: Docker & Docker Compose
- **Process Management**: PM2 (production)

## 📋 Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd microservices-project
```

### 2. Set Up Environment Variables
```bash
# Copy environment files for all services
cp api-gateway/.env.example api-gateway/.env
cp identity-service/.env.example identity-service/.env
cp post-service/.env.example post-service/.env
cp media-service/.env.example media-service/.env
cp search-service/.env.example search-service/.env
```

### 3. Configure Environment Variables
Edit each `.env` file with your specific configuration. See [Environment Setup Guide](ENVIRONMENT_SETUP.md) for detailed instructions.

### 4. Start the Application
```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Or start each service individually
npm run dev:all
```

### 5. Verify Services
```bash
# Check service health
curl http://localhost:3000/health    # API Gateway
curl http://localhost:3001/health    # Identity Service
curl http://localhost:3002/health    # Post Service
curl http://localhost:3003/health    # Media Service
curl http://localhost:3004/health    # Search Service
```

## 📁 Project Structure

```
├── api-gateway/
│   ├── src/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── identity-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── post-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── media-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── handlers/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── search-service/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── ENVIRONMENT_SETUP.md
└── README.md
```

## 🔧 Development

### Running in Development Mode
```bash
# Start all services in development mode
cd api-gateway && npm run dev &
cd identity-service && npm run dev &
cd post-service && npm run dev &
cd media-service && npm run dev &
cd search-service && npm run dev &
```

### Installing Dependencies
```bash
# Install dependencies for all services
npm run install:all

# Or install for individual services
cd api-gateway && npm install
cd identity-service && npm install
cd post-service && npm install
cd media-service && npm install
cd search-service && npm install
```

### Running Tests
```bash
# Run tests for all services
npm run test:all

# Or run tests for individual services
cd api-gateway && npm test
cd identity-service && npm test
cd post-service && npm test
cd media-service && npm test
cd search-service && npm test
```

## 🔐 Authentication Flow

1. **User Registration**: POST `/auth/register`
2. **User Login**: POST `/auth/login`
3. **Token Verification**: Middleware validates JWT tokens
4. **Protected Routes**: All API calls require valid JWT tokens

## 📡 API Endpoints

### Authentication (Identity Service)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Posts (Post Service)
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get specific post
- `POST /posts` - Create new post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Media (Media Service)
- `POST /media/upload` - Upload media file
- `GET /media/:id` - Get media file
- `DELETE /media/:id` - Delete media file

### Search (Search Service)
- `GET /search` - Search across content
- `GET /search/suggestions` - Get search suggestions

## 🚢 Deployment

### Using Docker Compose
```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Using PM2 (Alternative)
```bash
# Install PM2 globally
npm install -g pm2

# Start all services with PM2
pm2 start ecosystem.config.js
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production database URLs
- Configure proper JWT secrets
- Set up SSL/TLS certificates
- Configure monitoring and logging

## 📊 Monitoring and Logging

### Health Checks
Each service exposes a `/health` endpoint for monitoring:
- API Gateway: `http://localhost:3000/health`
- Identity Service: `http://localhost:3001/health`
- Post Service: `http://localhost:3002/health`
- Media Service: `http://localhost:3003/health`
- Search Service: `http://localhost:3004/health`

### Logging
- Winston logger configured for all services
- Centralized logging in production
- Request/response logging
- Error tracking and monitoring

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Kill process using port
   lsof -ti:3000 | xargs kill -9
   ```

2. **Database Connection Issues**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongo
   
   # Check if Redis is running
   docker ps | grep redis
   ```

3. **Service Communication Issues**
   - Verify all services are running
   - Check network connectivity between containers
   - Validate environment variables

### Debugging

```bash
# View logs for specific service
docker-compose logs api-gateway
docker-compose logs identity-service

# View logs for all services
docker-compose logs -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint for code linting
- Follow REST API conventions
- Write meaningful commit messages
- Add appropriate documentation

### Development Guidelines
- Follow microservices best practices
- Implement proper error handling
- Add unit and integration tests
- Use environment variables for configuration

## 📄 License

This project is licensed under the ISC License.

## 🔗 Additional Resources

- [Environment Setup Guide](ENVIRONMENT_SETUP.md)
- [API Documentation](docs/api.md)
- [Architecture Decision Records](docs/adr/)
- [Deployment Guide](docs/deployment.md)

## 📞 Support

For questions and support:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using Node.js and microservices architecture**