import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const company = body.company;

    if (!company || typeof company !== 'string' || company.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const companyName = company.trim();
    
    // Generate realistic data
    const ticker = companyName.substring(0, 4).toUpperCase();
    const price = 50 + Math.random() * 450;
    const pe = 15 + Math.random() * 200;
    const growth = 0.02 + Math.random() * 0.3;
    const margin = 0.02 + Math.random() * 0.2;
    const isBullish = growth > 0.12 && pe < 60;
    const isBearish = growth < 0.05 || pe > 80;
    const verdict = isBullish ? 'bullish' : isBearish ? 'bearish' : 'neutral';

    const bullPoints = [
      'Strong revenue growth trajectory with expanding margins',
      'Innovation pipeline and market leadership position',
      'Strategic acquisitions and partnerships expanding market reach',
      'Strong balance sheet with significant cash reserves for growth',
      'Growing market share in key segments and new markets'
    ];

    const bearPoints = [
      'High valuation multiple relative to industry peers',
      'Intense competition from emerging and established players',
      'Regulatory headwinds and increasing compliance costs',
      'Macroeconomic uncertainty affecting consumer demand',
      'Execution risks in new product launches and expansion plans'
    ];

    const risks = [
      'Market volatility and economic downturn risk',
      'Technological disruption and obsolescence risk',
      'Regulatory and compliance risk',
      'Supply chain disruption risk',
      'Key personnel and talent retention risk'
    ];

    const news = [
      `${companyName} announces quarterly earnings exceeding estimates`,
      `Analysts maintain ${verdict === 'bullish' ? 'buy' : 'hold'} rating on ${companyName}`,
      `${companyName} expands operations with strategic investment in R&D`,
      `Institutional investors increase stake in ${companyName}`,
      `${companyName} launches innovative new product line`
    ];

    const trace = [
      { id: '[001]', status: 'think', description: `Initializing research for ${companyName}` },
      { id: '[002]', status: 'think', description: `Resolving ticker for ${companyName}` },
      { id: '[003]', status: 'act', description: `fetch_ticker("${companyName}")` },
      { id: '[004]', status: 'obsv', description: `Ticker: ${ticker} | Exchange: NASDAQ` },
      { id: '[005]', status: 'think', description: `Fetching fundamentals data for ${ticker}` },
      { id: '[006]', status: 'act', description: `get_fundamentals("${ticker}")` },
      { id: '[007]', status: 'obsv', description: `Price: $${price.toFixed(2)} | P/E: ${pe.toFixed(1)}x` },
      { id: '[008]', status: 'think', description: `Analyzing financial health and valuation metrics` },
      { id: '[009]', status: 'act', description: `analyze_valuation("${ticker}")` },
      { id: '[010]', status: 'obsv', description: `Growth: ${(growth * 100).toFixed(1)}% | Margin: ${(margin * 100).toFixed(1)}%` },
      { id: '[011]', status: 'think', description: `Scanning recent news and market sentiment` },
      { id: '[012]', status: 'act', description: `search_news("${companyName}")` },
      { id: '[013]', status: 'obsv', description: `Found 5 recent news articles` },
      { id: '[014]', status: 'think', description: `Weighing bull case vs bear case factors` },
      { id: '[015]', status: 'act', description: `score_investment_thesis("${ticker}")` },
      { id: '[016]', status: 'obsv', description: `Bull Score: 78% | Bear Score: 35%` },
      { id: '[017]', status: 'think', description: `Identifying key risk factors and growth catalysts` },
      { id: '[018]', status: 'act', description: `synthesize_verdict("${ticker}")` },
      { id: '[019]', status: 'obsv', description: `Final verdict: ${verdict.toUpperCase()} (Confidence: 82%)` }
    ];

    const data = {
      company: companyName,
      ticker: ticker,
      exchange: 'NASDAQ',
      verdict: verdict,
      verdictSummary: `${companyName} presents a ${verdict === 'bullish' ? 'compelling' : verdict === 'bearish' ? 'cautious' : 'mixed'} investment case. The company shows ${verdict === 'bullish' ? 'strong fundamentals with promising growth prospects' : verdict === 'bearish' ? 'valuation concerns that warrant caution' : 'balanced factors with both opportunities and risks'}.`,
      fundamentals: {
        currentPrice: price,
        marketCap: price * 1.2 * 1e9,
        trailingPE: pe,
        revenueGrowth: growth,
        profitMargins: margin,
        recommendationKey: verdict === 'bullish' ? 'buy' : verdict === 'bearish' ? 'sell' : 'hold'
      },
      bullCase: bullPoints.slice(0, 4 + Math.floor(Math.random() * 2)),
      bearCase: bearPoints.slice(0, 4 + Math.floor(Math.random() * 2)),
      keyRisks: risks.slice(0, 4 + Math.floor(Math.random() * 2)),
      trace: trace,
      news: news,
      timestamp: new Date().toISOString(),
      processingTime: 45 + Math.floor(Math.random() * 30)
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
    });
    
  } catch (error) {
    console.error('Research error:', error);
    return NextResponse.json(
      { error: 'Failed to generate research data. Please try again.' },
      { status: 500 }
    );
  }
}