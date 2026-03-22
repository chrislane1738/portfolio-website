// src/data/projects.ts
export interface Project {
  id: string;
  title: string;
  description: string;
  year: string;
  visibility: 'public' | 'private';
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
    year: '2024',
    visibility: 'public',
    tech: ['Next.js', 'Chart.js', 'TypeScript'],
    link: { url: '/calculator', label: 'Try it', external: false },
  },
  {
    id: 'graham-screener',
    title: 'Graham Intrinsic Value Screener',
    description: 'Stock screening tool implementing Benjamin Graham\'s value investing methodology with real-time market data.',
    year: '2024',
    visibility: 'public',
    tech: ['Next.js', 'yahoo-finance2', 'TypeScript'],
    link: { url: '/graham-screener', label: 'Try it', external: false },
  },
  {
    id: 'pe-analyzer',
    title: 'P/E Comparative Analysis',
    description: 'Compare target stock P/E ratios against industry peers with trailing and forward metrics.',
    year: '2024',
    visibility: 'public',
    tech: ['Next.js', 'yahoo-finance2', 'Chart.js'],
    link: { url: '/pe-analyzer', label: 'Try it', external: false },
  },
  {
    id: 'portfolio-builder',
    title: 'Portfolio Builder Dashboard',
    description: 'Dashboard for constructing and analyzing investment portfolios with performance tracking.',
    year: '2024',
    visibility: 'public',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://personalanalytics-juf6xlhx6valr7qpabuupu.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'vfc-research-dashboard',
    title: 'VFC Research Dashboard',
    description: 'Research dashboard built for the Viking Fund Club to streamline equity analysis and team collaboration.',
    year: '2025',
    visibility: 'public',
    tech: ['Python', 'Streamlit'],
    link: { url: 'https://vikingfunddashboard.streamlit.app/', label: 'View', external: true },
  },
  {
    id: 'delta-fightwear',
    title: 'Delta Fightwear',
    description: 'E-commerce brand for combat sports apparel — from supply chain to storefront.',
    year: '2024',
    visibility: 'public',
    tech: ['E-commerce', 'Supply Chain'],
    link: { url: 'https://deltafightwear.com/', label: 'Visit', external: true },
  },
  {
    id: 'stralane',
    title: 'Stralane',
    description: 'Investing platform for retail investors — currently in a developing beta with rapid feature updates.',
    year: '2025',
    visibility: 'private',
    tech: ['In Development'],
    link: { url: 'https://stralane.com', label: 'Visit', external: true },
  },
];

export const publicProjects = projects.filter(p => p.visibility === 'public');
export const privateProjects = projects.filter(p => p.visibility === 'private');
