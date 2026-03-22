export interface Project {
  id: string;
  title: string;
  description: string;
  year: string;
  visibility: 'public' | 'private';
  image?: string;
  tech?: string[];
  link?: {
    url: string;
    label: string;
    external: boolean;
  };
}

export const projects: Project[] = [
  {
    id: 'compound-interest-calculator',
    title: 'Compound Interest Calculator',
    description: 'Interactive tool for visualizing compound growth with configurable monthly contributions and compounding frequencies.',
    year: 'Jan 2024',
    visibility: 'public',
    image: '/calculator-preview.png',
    tech: ['Next.js', 'Chart.js', 'TypeScript'],
    link: { url: '/calculator', label: 'Try it', external: false },
  },
  {
    id: 'graham-screener',
    title: 'Graham Intrinsic Value Screener',
    description: 'Stock screening tool implementing Benjamin Graham\'s value investing methodology with real-time market data.',
    year: 'Mar 2024',
    visibility: 'public',
    image: '/benjamin-graham.jpg',
    tech: ['Next.js', 'yahoo-finance2', 'TypeScript'],
    link: { url: '/graham-screener', label: 'Try it', external: false },
  },
  {
    id: 'pe-analyzer',
    title: 'P/E Comparative Analysis',
    description: 'Compare target stock P/E ratios against industry peers with trailing and forward metrics.',
    year: 'May 2024',
    visibility: 'public',
    image: '/pe-comparable.png',
    tech: ['Next.js', 'yahoo-finance2', 'Chart.js'],
    link: { url: '/pe-analyzer', label: 'Try it', external: false },
  },
  {
    id: 'portfolio-builder',
    title: 'Portfolio Builder Dashboard',
    description: 'Dashboard for constructing and analyzing investment portfolios with performance tracking.',
    year: 'Jul 2024',
    visibility: 'public',
    image: '/Portfolio-builder.png',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://personalanalytics-juf6xlhx6valr7qpabuupu.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'delta-fightwear',
    title: 'Delta Fightwear',
    description: 'E-commerce brand for combat sports apparel. From supply chain to storefront.',
    year: 'Aug 2024',
    visibility: 'public',
    image: '/delta_fightwear.png',
    tech: ['E-commerce', 'Supply Chain'],
    link: { url: 'https://deltafightwear.com/', label: 'Visit', external: true },
  },
  {
    id: 'vfc-research-dashboard',
    title: 'VFC Research Dashboard',
    description: 'Research dashboard built for the Viking Fund Club to streamline equity analysis and team collaboration.',
    year: 'Jan 2025',
    visibility: 'public',
    image: '/vfc-card.png',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://vikingfunddashboard.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'stralane',
    title: 'Stralane',
    description: 'Investing platform for retail investors. Currently in a developing beta with rapid feature updates.',
    year: 'Feb 2025',
    visibility: 'private',
    image: '/stralane-screenshot.png',
    tech: ['In Development'],
    link: { url: 'https://stralane.com', label: 'Visit', external: true },
  },
  {
    id: 'ufc-ml-model',
    title: 'UFC ML Prediction Model',
    description: 'Machine learning model for predicting UFC fight outcomes using fighter statistics, historical records, and decision factors.',
    year: 'Mar 2025',
    visibility: 'private',
    image: '/ufc-ml-model.png',
    tech: ['Python', 'Machine Learning', 'Streamlit'],
  },
];
