# 🤖 NextGen Personal Trading Bot - Prototype

A functional prototype of the NextGen Personal Trading Bot that demonstrates capital-aware AI trading strategies with interactive components and real-time simulation.

## 🌟 Features

### Core Functionality
- **Capital-Aware Strategy Engine**: Personalizes trading strategies based on your exact capital amount
- **Smart Allocation**: Optimizes between small-cap and mid-cap stocks based on capital and risk
- **Interactive Onboarding**: 4-step setup process with real-time strategy generation
- **Live Dashboard**: Real-time portfolio monitoring with performance charts
- **Paper Trading**: Risk-free testing environment with simulated positions

### Key Components
- **CapitalInput**: Interactive capital input with strategy preview
- **RiskPreferences**: Risk tolerance and time horizon configuration
- **StrategyRecommendations**: AI-generated strategy display with backtesting
- **PerformanceChart**: Real-time portfolio performance visualization
- **PositionsTable**: Active positions monitoring with P&L tracking

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
1. Navigate to the project directory:
   ```bash
   cd nextgen-trading-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## 📱 Demo Flow

### 1. Landing Page (`/`)
- Product overview and value proposition
- Key features and benefits
- Call-to-action to start onboarding

### 2. Interactive Demo (`/demo`)
- Try the capital-aware strategy engine
- See personalized recommendations
- No signup required

### 3. Onboarding Flow (`/onboarding`)
- Step 1: Capital amount input with real-time validation
- Step 2: Risk tolerance and time horizon preferences
- Step 3: AI-generated strategy recommendations
- Step 4: Choose paper trading or live trading

### 4. Trading Dashboard (`/dashboard`)
- Real-time portfolio monitoring
- Performance charts with benchmark comparison
- Active positions table
- Bot control (start/pause)
- Paper trading simulation

## 🧠 AI Strategy Engine

### Capital-Aware Algorithm
The prototype includes a sophisticated strategy engine that:

1. **Analyzes Capital Constraints**: Different strategies for $10K vs $500K accounts
2. **Optimizes Allocation**: Dynamic small-cap vs mid-cap allocation
3. **Manages Risk**: Position sizing and risk limits based on capital
4. **Adapts to Time Horizon**: Strategy parameters adjust for different timeframes
5. **Generates Realistic Backtests**: Simulated historical performance

### Strategy Tiers
- **Starter** (<$25K): Conservative growth, 65% mid-cap, 25% small-cap
- **Growth** ($25K-$100K): Balanced approach, 55% mid-cap, 35% small-cap  
- **Advanced** ($100K-$500K): Aggressive growth, 45% mid-cap, 45% small-cap
- **Professional** ($500K+): Sophisticated strategies with advanced risk management

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#2563eb) - Trust and stability
- **Success**: Green (#22c55e) - Positive returns
- **Warning**: Amber (#f59e0b) - Risk alerts
- **Error**: Red (#ef4444) - Losses and errors

### Typography
- **Font**: Inter - Clean, modern, highly readable
- **Hierarchy**: Clear sizing from 12px to 48px
- **Weight**: 400 (normal) to 700 (bold)

### Components
- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Multiple variants (primary, secondary, success, danger)
- **Forms**: Clean inputs with validation states
- **Charts**: Interactive with tooltips and controls

## 📊 Mock Data

The prototype includes realistic mock data for demonstration:

- **Portfolio Performance**: 30 days of simulated returns
- **Stock Positions**: 7 sample positions with real company data
- **Trade History**: Sample buy/sell transactions
- **Market Data**: Simulated real-time price updates

## 🔧 Technical Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety and better development experience
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful, consistent icons

### Charts & Visualization
- **Recharts**: Responsive charts and data visualization
- **Custom Components**: Interactive performance and allocation charts

### State Management
- **React Hooks**: useState, useEffect for local state
- **URL State**: Search params for navigation state

## 🎯 Key Metrics Demonstrated

### Performance Metrics
- **Total Return**: Portfolio performance vs benchmark
- **Sharpe Ratio**: Risk-adjusted returns
- **Maximum Drawdown**: Worst peak-to-trough decline
- **Win Rate**: Percentage of profitable trades

### Risk Metrics
- **Volatility**: Standard deviation of returns
- **Position Concentration**: Maximum position size limits
- **Sector Allocation**: Diversification across industries
- **Correlation Limits**: Risk management constraints

## 🚀 Next Steps for Production

### Backend Integration
- Real broker API integration (Alpaca, Interactive Brokers)
- Live market data feeds (Polygon.io, Alpha Vantage)
- User authentication and account management
- Trade execution and order management

### Advanced Features
- Machine learning model training
- Real-time news and sentiment analysis
- Advanced risk management systems
- Mobile app development

### Compliance & Security
- SEC/FINRA regulatory compliance
- Data encryption and security
- Audit logging and reporting
- Customer suitability assessments

## 📄 License

This is a prototype for demonstration purposes. All trading involves risk and past performance is not indicative of future results.

## 🤝 Contributing

This is a prototype project. For production development, please contact the development team.

---

**Disclaimer**: This is a prototype trading application for demonstration purposes only. It does not provide investment advice and should not be used for actual trading decisions. Always consult with qualified financial advisors before making investment decisions.