export const siteConfig = {
  siteName: 'LLM Knowledge Graph',
  nav: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '/' },
  ],
  hero: {
    title_l1: 'Never Overpay at the',
    title_l2: 'Market Again.',
    subtitle:
      'LLM Knowledge Graph brings you hyper-local market insights on daily commodity prices, trends, and forecasts. From farmers to traders to households, everyone deserves price transparency.',
    ctaText: 'Download the App',
    ctaLink: '/get-started',
    bgImage: '/hero_bg',
    highlights: [
      { icon: 'TrendingUp', text: 'Live Price Data', variant: 'primary' },
      { icon: 'Bell', text: 'Smart Alerts', variant: 'secondary' },
      { icon: 'Users', text: 'Farmer & Trader Friendly', variant: 'tertiary' },
    ],
  },
  toolsSection: {
    title: 'Features That Matter',
    subtitle:
      'Designed to give farmers, traders, and households the insights they need to make better decisions.',
    tools: [
      {
        name: 'Daily Price Updates',
        description:
          'Access real-time prices of key commodities across local markets.',
        status: 'live',
        icon: 'BarChart',
      },
      {
        name: 'Price Trend Forecasts',
        description:
          'See where prices are heading with simple predictions and market insights.',
        status: 'coming soon',
        icon: 'TrendingUp',
      },
      {
        name: 'SMS & WhatsApp Alerts',
        description:
          'Get notified instantly when prices change, even without internet.',
        status: 'coming soon',
        icon: 'Bell',
      },
      {
        name: 'Buyer–Seller Connections',
        description:
          'Connect directly with verified farmers, wholesalers, and market traders.',
        status: 'coming soon',
        icon: 'Users',
      },
    ],
  },
  testimonials: [
    {
      quote:
        'With LLM Knowledge Graph, I know the price of maize before I even step into the market. No more surprises!',
      name: 'Abdul Rahman',
      title: 'Farmer, Tamale',
      img: '/testimony_1.png',
    },
    {
      quote:
        'The daily tomato price alerts help me plan my stock better and avoid losses.',
      name: 'Akosua Mensah',
      title: 'Market Trader, Accra',
      img: '/testimony_2.png',
    },

    {
      quote:
        'Finally, price transparency for the everyday Ghanaian household. This is long overdue.',
      name: 'Kwame Boateng',
      title: 'Household Consumer',
      img: '/testimony_3.png',
    },
  ],

  cta: {
    title: 'Ready to Save Money?',
    subtitle:
      "Join thousands of Ghanaians making smarter decisions. Download LLM Knowledge Graph today, it's free!",
    ctaText: 'Download For Free',
    ctaLink: '/get-started',
  },
  footerCta: {
    title:
      'Transparancy for every Ghanaian. From the farm to the market to your kitchen.',
  },
  footer: {
    links: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Resources', href: '/resources' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
    copyright: '© 2025 LLM Knowledge Graph. All rights reserved.',
  },
};
