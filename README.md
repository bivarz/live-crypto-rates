# Live Crypto Rates

A real-time cryptocurrency dashboard that streams live market data for pairs like ETH/USDT and BTC/USDT. Includes interactive charts, instant price updates, and a responsive interface designed to showcase real-time data processing, WebSocket integration, and modern frontend architecture.

## Features

- 🚀 **Real-Time Price Updates**: Live streaming of cryptocurrency prices via Binance WebSocket API
- 📊 **Interactive Charts**: Dynamic price history visualization using Recharts
- 💱 **Multiple Trading Pairs**: ETH/USDT and BTC/USDT support
- 🎨 **Modern UI**: Responsive design with gradient cards and smooth animations
- 🔄 **Auto-Reconnection**: Automatic WebSocket reconnection on connection loss
- 🔒 **Fallback Mode**: Automatic mock data mode when WebSocket is unavailable (for demo/restricted environments)
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React 19** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Recharts** - Data visualization library
- **WebSocket API** - Real-time data streaming
- **CSS3** - Modern styling with gradients and animations

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/bivarz/live-crypto-rates.git
cd live-crypto-rates
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── PriceCard.tsx   # Price display card
│   ├── PriceChart.tsx  # Interactive chart
│   └── *.css           # Component styles
├── hooks/              # Custom React hooks
│   └── useCryptoPrice.ts
├── services/           # Services
│   ├── cryptoWebSocket.ts  # WebSocket service
│   └── mockCryptoService.ts # Mock data service
├── types/              # TypeScript types
│   └── crypto.ts
├── App.tsx             # Main application
└── main.tsx            # Entry point
```

## How It Works

The application connects to Binance's WebSocket API to stream real-time cryptocurrency data. If the WebSocket connection fails (e.g., due to network restrictions or unavailability), the app automatically switches to a mock data mode that simulates realistic price movements.

### WebSocket Connection

The app attempts to connect to `wss://stream.binance.com/stream?streams={pair}@ticker` for each trading pair. The connection provides 24-hour ticker statistics including:
- Current price
- Price change
- Price change percentage
- Volume and other metrics

### Mock Data Fallback

After 3 failed connection attempts, the application automatically switches to mock data mode, which:
- Generates realistic price movements (±0.5% variation)
- Updates every 2 seconds
- Maintains separate state for each trading pair
- Provides a seamless demo experience

## Data Source

This application uses the Binance WebSocket API to stream real-time cryptocurrency market data. The API provides 24-hour ticker statistics for trading pairs.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
