import { PriceCard } from './components/PriceCard'
import { PriceChart } from './components/PriceChart'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Live Crypto Rates</h1>
        <p className="subtitle">Real-time cryptocurrency price dashboard</p>
      </header>

      <main className="app-main">
        <section className="price-cards-section">
          <PriceCard pair="ETHUSDT" displayName="ETH/USDT" />
          <PriceCard pair="BTCUSDT" displayName="BTC/USDT" />
        </section>

        <section className="charts-section">
          <PriceChart pair="ETHUSDT" displayName="ETH/USDT" />
          <PriceChart pair="BTCUSDT" displayName="BTC/USDT" />
        </section>
      </main>

      <footer className="app-footer">
        <p>Data provided by Binance WebSocket API</p>
      </footer>
    </div>
  )
}

export default App
