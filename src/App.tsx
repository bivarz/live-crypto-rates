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
          <PriceCard pair="ETHUSDC" displayName="ETH/USDC" />
          <PriceCard pair="USDTBTC" displayName="USDT/BTC" />
        </section>

        <section className="charts-section">
          <PriceChart pair="ETHUSDC" displayName="ETH/USDC" />
          <PriceChart pair="USDTBTC" displayName="USDT/BTC" />
        </section>
      </main>

      <footer className="app-footer">
        <p>Data provided by Binance WebSocket API</p>
      </footer>
    </div>
  )
}

export default App
