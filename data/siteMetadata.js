const siteMetadata = {
  title: 'webDeveloperBlog',
  author: 'Armando Toro Cárdenas',
  headerTitle: 'Web Developer Blog',
  description: 'A blog about Full Stack JavaScript web development',
  language: 'es-co',
  theme: 'system', // 'system, dark or light',
  siteUrl: 'https://web-developer-blog.vercel.app/',
  socialBanner: '/static/images/opengrapg-imagotype.png',
  siteRepo: 'https://github.com/decaldas/webDeveloperBlog', // private repo,
  siteLogo: '/static/images/imagotype.png',
  email: 'armandotorocardenas@gmail.com',
  github: 'https://github.com/devCaldas-dev',
  twitter: 'https://twitter.com/@WhiskeyDeCaldas',
  linkedin: 'https://www.linkedin.com/in/devCaldas/',
  youtube: 'https://www.youtube.com/@devCaldas-webDeveloper',
  locale: 'es-CO',
  analytics: {
    // If you want to use an analytics provider you have to add it to the
    // content security policy in the `next.config.js` file.
    // supports Plausible, Simple Analytics, Umami, Posthog or Google Analytics.
    umamiAnalytics: {
      // We use an env variable for this site to avoid other users cloning our analytics ID
      umamiWebsiteId: process.env.NEXT_UMAMI_ID, // e.g. 123e4567-e89b-12d3-a456-426614174000
    },
    // plausibleAnalytics: {
    //   plausibleDataDomain: '', // e.g. tailwind-nextjs-starter-blog.vercel.app
    // },
    // simpleAnalytics: {},
    // posthogAnalytics: {
    //   posthogProjectApiKey: '', // e.g. 123e4567-e89b-12d3-a456-426614174000
    // },
    // googleAnalytics: {
    //   googleAnalyticsId: '', // e.g. G-XXXXXXX
    // },
  },
  newsletter: {
    // supports mailchimp, buttondown, convertkit, klaviyo, revue, emailoctopus
    // Please add your .env file and modify it according to your selection
    provider: 'buttondown',
  },
  comments: false,
  search: {
    provider: 'kbar', // kbar or algolia
    kbarConfig: {
      searchDocumentsPath: 'search.json', // path to load documents to search
    },
    // provider: 'algolia',
    // algoliaConfig: {
    //   // The application ID provided by Algolia
    //   appId: 'R2IYF7ETH7',
    //   // Public API key: it is safe to commit it
    //   apiKey: '599cec31baffa4868cae4e79f180729b',
    //   indexName: 'docsearch',
    // },
  },
}

module.exports = siteMetadata
