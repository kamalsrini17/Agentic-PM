// Mock data generators for the trading bot prototype

export interface PerformanceData {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface Position {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocation: number;
}

export function generateMockPortfolioData(
  startValue: number = 100000,
  days: number = 30
): PerformanceData[] {
  const data: PerformanceData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let portfolioValue = startValue;
  let benchmarkValue = startValue;

  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    // Simulate portfolio performance with slight outperformance
    const portfolioChange = (Math.random() - 0.45) * 0.02; // Slight positive bias
    const benchmarkChange = (Math.random() - 0.5) * 0.015; // More conservative

    portfolioValue *= (1 + portfolioChange);
    benchmarkValue *= (1 + benchmarkChange);

    data.push({
      date: date.toISOString(),
      portfolio: Math.round(portfolioValue * 100) / 100,
      benchmark: Math.round(benchmarkValue * 100) / 100
    });
  }

  return data;
}

export function generateMockPositions(): Position[] {
  const stocks = [
    { symbol: 'CRWD', name: 'CrowdStrike Holdings Inc', basePrice: 245.67, marketCap: 'small' },
    { symbol: 'ZS', name: 'Zscaler Inc', basePrice: 189.43, marketCap: 'small' },
    { symbol: 'DDOG', name: 'Datadog Inc', basePrice: 112.89, marketCap: 'small' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', basePrice: 378.85, marketCap: 'large' },
    { symbol: 'GOOGL', name: 'Alphabet Inc Class A', basePrice: 142.56, marketCap: 'large' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', basePrice: 478.23, marketCap: 'large' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', basePrice: 155.89, marketCap: 'large' },
  ];

  return stocks.map((stock, index) => {
    const shares = Math.floor(Math.random() * 500) + 50;
    const avgCost = stock.basePrice * (0.85 + Math.random() * 0.3); // Bought at different prices
    const currentPrice = stock.basePrice * (0.95 + Math.random() * 0.1); // Current price variation
    const marketValue = shares * currentPrice;
    const unrealizedPnL = (currentPrice - avgCost) * shares;
    const unrealizedPnLPercent = ((currentPrice - avgCost) / avgCost) * 100;
    const allocation = 8 + Math.random() * 12; // 8-20% allocation

    return {
      symbol: stock.symbol,
      name: stock.name,
      shares,
      avgCost,
      currentPrice,
      marketValue,
      unrealizedPnL,
      unrealizedPnLPercent,
      allocation
    };
  }).filter((_, index) => Math.random() > 0.3); // Randomly exclude some positions
}

export function generateMockTrades() {
  const trades = [
    {
      id: '1',
      symbol: 'CRWD',
      type: 'BUY' as const,
      shares: 100,
      price: 240.50,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'Breakout above resistance with volume confirmation'
    },
    {
      id: '2',
      symbol: 'ZS',
      type: 'SELL' as const,
      shares: 75,
      price: 195.30,
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      reason: 'Profit taking at target level'
    },
    {
      id: '3',
      symbol: 'MSFT',
      type: 'BUY' as const,
      shares: 50,
      price: 375.20,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      reason: 'Strong earnings report and AI momentum'
    }
  ];

  return trades;
}

export function generateMockAlerts() {
  return [
    {
      id: '1',
      type: 'TRADE_EXECUTED' as const,
      message: 'Bought 100 shares of CRWD at $240.50',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      severity: 'info' as const
    },
    {
      id: '2',
      type: 'RISK_WARNING' as const,
      message: 'Portfolio concentration in tech sector exceeds 60%',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      severity: 'warning' as const
    },
    {
      id: '3',
      type: 'OPPORTUNITY' as const,
      message: 'New small-cap opportunity identified: NET showing breakout pattern',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      severity: 'success' as const
    }
  ];
}

export function generateMockMarketData() {
  return {
    marketStatus: 'OPEN' as const,
    spyPrice: 445.67,
    spyChange: 2.34,
    spyChangePercent: 0.53,
    vixLevel: 18.45,
    volume: 45600000,
    timestamp: new Date().toISOString()
  };
}