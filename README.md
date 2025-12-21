# Real-Time Cryptocurrency Dashboard

A fullstack application for monitoring real-time cryptocurrency exchange rates with live price updates and hourly average calculations.

## Features

- **Real-time Price Updates**: Live streaming prices for ETH/USDC, ETH/USDT, and ETH/BTC pairs
- **Hourly Averages**: Automatic calculation and display of hourly average prices
- **WebSocket Communication**: Efficient real-time data streaming from backend to frontend
- **Modern UI**: Clean, responsive dashboard with intuitive design
- **Docker Support**: Easy deployment with Docker Compose
- **Clean Architecture**: Well-structured codebase following best practices

## Tech Stack

### Backend

- **NestJS**: Progressive Node.js framework
- **Socket.IO**: WebSocket implementation for real-time communication
- **Finnhub API**: WebSocket integration for live cryptocurrency data
- **TypeORM**: ORM for database operations
- **SQLite**: Lightweight database for persistence

### Frontend

- **React**: UI library
- **TypeScript**: Type-safe development
- **Socket.IO Client**: Real-time WebSocket client

## Prerequisites

- Node.js 20+ and npm
- **Finnhub API Key** (required - get one at https://finnhub.io/)
- Docker and Docker Compose (optional, for containerized deployment)
  - **Windows**: Install Docker Desktop from https://www.docker.com/products/docker-desktop
  - **macOS**: Install Docker Desktop or use alternatives like Colima/OrbStack
  - **Linux**: Install Docker Engine directly (no Desktop needed)
  - After installation, use `docker compose` (without hyphen) for newer versions
  - Older versions may use `docker-compose` (with hyphen)

## Getting Started

### Option 1: Local Development (Recommended if Docker is not installed)

#### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your Finnhub API key:

```bash
PORT=3001
FRONTEND_URL=http://localhost:3000
FINNHUB_API_KEY=your_finnhub_api_key_here
```

**Important:** The `FINNHUB_API_KEY` is required. The application will not start without it.

4. Start the development server:

```bash
npm run start:dev
```

#### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
REACT_APP_BACKEND_URL=http://localhost:3001
```

4. Start the development server:

```bash
npm start
```

5. Open http://localhost:3000 in your browser

### Option 2: Docker Compose (Requires Docker installation)

**Note:** Docker is not installed on your system. To use Docker:

1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
2. After installation, restart your terminal
3. Then use the commands below

4. Create a `.env` file in the root directory with your Finnhub API key:

```bash
FINNHUB_API_KEY=your_finnhub_api_key_here
```

**Note:** You can get a free API key by signing up at https://finnhub.io/

2. Build and start the services:

```bash
docker compose up --build
```

**Note:** If `docker compose` doesn't work, try `docker-compose` (with hyphen). Modern Docker installations use `docker compose` (without hyphen).

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Project Structure

```
live-crypto-rates/
├── backend/
│   ├── src/
│   │   ├── crypto/
│   │   │   ├── crypto.gateway.ts      # WebSocket gateway
│   │   │   └── crypto.service.ts      # Price tracking & averages
│   │   ├── finnhub/
│   │   │   └── finnhub.service.ts     # Finnhub API integration
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx          # Main dashboard component
│   │   │   └── PriceCard.tsx          # Price display card
│   │   ├── services/
│   │   │   └── websocket.service.ts   # WebSocket client service
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### WebSocket Events

#### Client → Server

- `getLatestPrices`: Request latest prices for all symbols

#### Server → Client

- `latestPrices`: Initial price data for all symbols
- `priceUpdate`: Real-time price update for a specific symbol
- `hourlyAverages`: Initial hourly average data
- `hourlyAverageUpdate`: Updated hourly average for a symbol

## Environment Variables

### Backend

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `FINNHUB_API_KEY`: Finnhub API key (required)

### Frontend

- `REACT_APP_BACKEND_URL`: Backend WebSocket URL (default: http://localhost:3001)

## Monitoring Pairs

The application tracks the following cryptocurrency pairs:

- **ETH/USDC**: Ethereum to USD Coin
- **ETH/USDT**: Ethereum to Tether
- **ETH/BTC**: Ethereum to Bitcoin

## Hourly Average Calculation

The system automatically calculates hourly averages based on all price updates received within the current hour. The average is updated in real-time as new prices arrive and is displayed alongside the current price for each trading pair.

## Development

### Backend Commands

```bash
npm run start:dev    # Start development server with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run test         # Run tests
npm run lint         # Run linter
```

### Frontend Commands

```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

## Production Deployment

### Docker Production Build

1. Build the images:

```bash
docker compose build
```

2. Start in detached mode:

```bash
docker compose up -d
```

3. View logs:

```bash
docker compose logs -f
```

4. Stop services:

```bash
docker compose down
```

**Note:** If `docker compose` doesn't work, try `docker-compose` (with hyphen).

### Cloud Deployment

This application is fully compatible with cloud container services. The Dockerfiles are cross-platform compatible (Linux, macOS, Windows) and work seamlessly in cloud environments.

#### AWS (Amazon Web Services)

**Option 1: AWS ECS with Fargate**
- Push images to Amazon ECR (Elastic Container Registry)
- Create ECS task definitions
- Deploy using Fargate (serverless containers)

**Option 2: AWS EC2 with Docker**
- Launch EC2 instance (Amazon Linux 2 or Ubuntu)
- Install Docker Engine
- Clone repository and run `docker compose up -d`

**Option 3: AWS App Runner**
- Connect to GitHub/ECR
- Configure build and run commands
- Automatic scaling and HTTPS

#### Azure (Microsoft Azure)

**Option 1: Azure Container Instances (ACI)**
- Build and push images to Azure Container Registry (ACR)
- Create container groups with docker-compose
- Simple serverless deployment

**Option 2: Azure Container Apps**
- Deploy containerized applications
- Built-in auto-scaling and load balancing
- Integrated with Azure Container Registry

**Option 3: Azure App Service for Containers**
- Deploy Docker containers directly
- Continuous deployment from ACR
- Built-in CI/CD integration

#### Other Cloud Providers

- **Google Cloud Platform**: Cloud Run, GKE (Google Kubernetes Engine)
- **DigitalOcean**: App Platform or Droplets with Docker
- **Heroku**: Container Registry and Runtime
- **Vercel/Railway**: For simplified deployments

#### Environment Variables for Cloud Deployment

Make sure to set these environment variables in your cloud platform:

```bash
# Backend
PORT=3001
FRONTEND_URL=https://your-frontend-domain.com
FINNHUB_API_KEY=your_finnhub_api_key_here

# Frontend (build time)
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

**Important Notes:**
- Replace URLs with your actual production domains
- Use HTTPS in production
- Store API keys securely (use cloud provider's secret management)
- Consider using environment-specific docker-compose files

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
