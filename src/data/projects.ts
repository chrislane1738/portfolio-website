export type ProjectTag = 'work' | 'muse' | 'venture' | 'tool' | 'club'

export interface Project {
  id: string
  title: string
  description: string
  /** 'YYYY-MM' */
  date: string
  tag: ProjectTag
  /** Shown as "Internal · <org>" on work items. */
  org?: string
  image?: string
  tech?: string[]
  link?: { url: string; label: string; external: boolean }
}

// Order within a month is preserved; the page sorts newest month first.
export const projects: Project[] = [
  {
    id: 'pokemon-stock-checker',
    title: 'Pokemon Card Stock Checker',
    description: 'Watches retail stores and free Discord servers for Pokemon cards in stock at MSRP.',
    date: '2026-10',
    tag: 'muse',
    tech: ['Muse'],
  },
  {
    id: 'daily-technicals',
    title: 'Daily Technicals',
    description: 'A bigger version of IB Daily Question with far more depth. Built and hosted on Muse.',
    date: '2026-09',
    tag: 'muse',
    tech: ['Muse'],
  },
  {
    id: 'ib-daily-question',
    title: 'IB Daily Question',
    description: 'Sends me one investment banking technical question a day to keep my fundamentals sharp.',
    date: '2026-07',
    tag: 'tool',
    image: '/ib-daily-question.png',
    tech: ['Telegram Bot', 'Finance'],
  },
  {
    id: 'populate-financials',
    title: 'Populate Financials',
    description: "Reads a new deal's CIM or financials and fills the historicals into our LBO model on SharePoint. Cuts about 20 minutes of manual entry down to 2.",
    date: '2026-07',
    tag: 'work',
    org: 'TeedUp',
  },
  {
    id: 'equity-research-agents',
    title: 'Public Equity Research Agent Team',
    description: 'Open-source team of AI agents that researches a US stock end to end. One agent pulls the data and another checks it against SEC filings. Five more then cover DCF, comps, catalysts, moat, and technicals before it writes the final report.',
    date: '2026-06',
    tag: 'tool',
    image: '/equity-research-agents.png',
    tech: ['Claude Code', 'AI Agents', 'Equity Research'],
    link: { url: 'https://github.com/chrislane1738/public-equity-research-team', label: 'View on GitHub', external: true },
  },
  {
    id: 'portco-reporting',
    title: 'Portco Reporting Dashboard',
    description: 'Tracks transactions, financials, and fund reporting across our portfolio companies.',
    date: '2026-06',
    tag: 'work',
    org: 'TeedUp',
  },
  {
    id: 'trading-bot',
    title: 'Trading Bot',
    description: "Backtesting dashboard for trading strategies. Strategies are written in YAML and tested walk-forward across market regimes. It's private, but I'm happy to walk through it.",
    date: '2026-05',
    tag: 'tool',
    image: '/trading-bot.png',
    tech: ['Python', 'Backtesting', 'YAML'],
  },
  {
    id: 'pe-curriculum',
    title: 'PE Curriculum',
    description: 'Private equity course with 12 modules, 70 lessons, and practice exercises. I built it for myself with a group of research agents, then made it public.',
    date: '2026-05',
    tag: 'club',
    image: '/pe-curriculum.png',
    tech: ['Next.js', 'AI Agents', 'TypeScript'],
    link: { url: 'https://pe-curriculum.vercel.app/', label: 'Try it', external: true },
  },
  {
    id: 'stralane',
    title: 'Stralane',
    description: 'Research platform for retail investors.',
    date: '2026-04',
    tag: 'venture',
    image: '/stralane-screenshot.png',
    link: { url: 'https://stralane.com', label: 'Visit', external: true },
  },
  {
    id: 'delta-fightwear',
    title: 'Delta Fightwear',
    description: 'Combat sports apparel brand I ran, from sourcing to the storefront. No longer operating.',
    date: '2026-04',
    tag: 'venture',
    image: '/delta_fightwear.png',
    tech: ['E-commerce', 'Supply Chain'],
    link: { url: 'https://deltafightwear.com/', label: 'Visit', external: true },
  },
  {
    id: 'ufc-ml-model',
    title: 'UFC ML Prediction Model',
    description: 'Predicts UFC fight outcomes from fighter stats and past results, and sizes bets with the Kelly criterion. Results get posted in the Discord.',
    date: '2026-04',
    tag: 'tool',
    image: '/ufc-ml-model.png',
    tech: ['Python', 'Machine Learning', 'Streamlit'],
    link: { url: 'https://discord.gg/yjJfXaZVCm', label: 'Join Discord', external: true },
  },
  {
    id: 'pe-analyzer',
    title: 'P/E Comparative Analysis',
    description: "Compares a stock's trailing and forward P/E against its industry peers.",
    date: '2026-03',
    tag: 'tool',
    image: '/pe-comparable.png',
    tech: ['Next.js', 'yahoo-finance2', 'Chart.js'],
    link: { url: '/pe-analyzer', label: 'Try it', external: false },
  },
  {
    id: 'portfolio-builder',
    title: 'Portfolio Builder Dashboard',
    description: 'Build a portfolio and track how it performs over time.',
    date: '2026-03',
    tag: 'tool',
    image: '/Portfolio-builder.png',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://personalanalytics-juf6xlhx6valr7qpabuupu.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'vfc-research-dashboard',
    title: 'VFC Research Dashboard',
    description: 'Equity research dashboard for the Viking Fund Club. Building it is what gave me the idea for Stralane.',
    date: '2026-03',
    tag: 'club',
    image: '/vfc-card.png',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://vikingfunddashboard.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'graham-screener',
    title: 'Graham Intrinsic Value Screener',
    description: "Screens stocks with Benjamin Graham's intrinsic value formula using live market data.",
    date: '2026-02',
    tag: 'tool',
    image: '/benjamin-graham.jpg',
    tech: ['Next.js', 'yahoo-finance2', 'TypeScript'],
    link: { url: '/graham-screener', label: 'Try it', external: false },
  },
  {
    id: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    description: 'Shows how money grows with monthly contributions and different compounding schedules. The first thing I built.',
    date: '2026-02',
    tag: 'tool',
    image: '/calculator-preview.png',
    tech: ['Next.js', 'Chart.js', 'TypeScript'],
    link: { url: '/calculator', label: 'Try it', external: false },
  },
]
