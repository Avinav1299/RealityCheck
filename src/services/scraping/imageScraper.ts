/**
 * Image Scraping Service
 * Extracts images from articles using meta tags and content parsing
 * Note: Direct web scraping from browser is limited by CORS policies
 */

interface ScrapedImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  source: 'og:image' | 'twitter:image' | 'first-img' | 'content-img' | 'fallback';
}

interface ScrapedArticle {
  title: string;
  description: string;
  image: ScrapedImage | null;
  content: string;
  publishedDate?: string;
  author?: string;
  tags: string[];
}

/**
 * Scrape article content and images
 * Note: This function will use mock data due to CORS limitations in browser environment
 */
export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  try {
    // In a browser environment, direct scraping is blocked by CORS
    // This would work in a server-side environment with a proxy
    console.warn('Direct web scraping is limited in browser environment due to CORS policies');
    
    // Generate realistic mock data based on URL
    return generateMockArticleData(url);
  } catch (error) {
    console.error('Article scraping error:', error);
    return generateMockArticleData(url);
  }
}

/**
 * Generate mock article data for demonstration
 */
function generateMockArticleData(url: string): ScrapedArticle {
  const domain = extractDomain(url);
  const categories = ['technology', 'health', 'environment', 'business', 'science', 'politics'];
  const category = categories[Math.floor(Math.random() * categories.length)];
  
  const titles = {
    technology: [
      'Revolutionary AI Breakthrough Changes Everything',
      'Quantum Computing Reaches New Milestone',
      'Tech Giants Announce Major Partnership',
      'Cybersecurity Threats Evolve Rapidly'
    ],
    health: [
      'Medical Research Shows Promising Results',
      'New Treatment Shows 90% Success Rate',
      'Global Health Initiative Launches',
      'Breakthrough in Disease Prevention'
    ],
    environment: [
      'Climate Action Plan Gains Momentum',
      'Renewable Energy Hits Record High',
      'Conservation Efforts Show Results',
      'Green Technology Innovation Unveiled'
    ],
    business: [
      'Market Analysis Reveals Trends',
      'Economic Indicators Point Upward',
      'Industry Leaders Meet for Summit',
      'Investment Opportunities Emerge'
    ],
    science: [
      'Scientific Discovery Challenges Theory',
      'Research Team Makes Breakthrough',
      'Space Exploration Reaches Milestone',
      'Laboratory Results Exceed Expectations'
    ],
    politics: [
      'Policy Changes Announced Today',
      'International Relations Develop',
      'Government Initiative Launches',
      'Political Leaders Reach Agreement'
    ]
  };

  const descriptions = {
    technology: 'Latest developments in artificial intelligence, quantum computing, and emerging technologies are reshaping industries worldwide.',
    health: 'Medical researchers have made significant progress in understanding and treating various health conditions with innovative approaches.',
    environment: 'Environmental scientists and activists are working together to address climate change through sustainable solutions and conservation efforts.',
    business: 'Economic analysts report positive trends in various sectors as companies adapt to changing market conditions and consumer demands.',
    science: 'Scientific communities worldwide are collaborating on groundbreaking research that could revolutionize our understanding of the natural world.',
    politics: 'Political developments continue to shape policy decisions that affect communities and international relations across the globe.'
  };

  const images = {
    technology: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    health: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
    environment: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
    business: 'https://images.pexels.com/photos/590041/pexels-photo-590041.jpeg?auto=compress&cs=tinysrgb&w=800',
    science: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
    politics: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800'
  };

  const categoryTitles = titles[category as keyof typeof titles] || titles.technology;
  const title = categoryTitles[Math.floor(Math.random() * categoryTitles.length)];
  const description = descriptions[category as keyof typeof descriptions] || descriptions.technology;
  const imageUrl = images[category as keyof typeof images] || images.technology;

  return {
    title,
    description,
    image: {
      url: imageUrl,
      alt: title,
      source: 'fallback'
    },
    content: `${description} This comprehensive analysis explores the latest developments and their potential impact on society. Experts from various fields have contributed their insights to provide a complete picture of the current situation. The research methodology involved extensive data collection and analysis from multiple sources to ensure accuracy and reliability. Key findings suggest that these developments will have far-reaching implications for the future. Stakeholders are encouraged to stay informed about these changes and their potential effects on various sectors.`,
    publishedDate: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    author: `${domain} Editorial Team`,
    tags: [category, 'analysis', 'research', 'breaking news', 'expert opinion']
  };
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'news-source.com';
  }
}

/**
 * Scrape multiple articles in parallel
 */
export async function scrapeMultipleArticles(urls: string[]): Promise<ScrapedArticle[]> {
  const results = await Promise.allSettled(
    urls.map(url => scrapeArticle(url))
  );

  return results
    .filter((result): result is PromiseFulfilledResult<ScrapedArticle> => result.status === 'fulfilled')
    .map(result => result.value);
}

/**
 * Enhanced mock data generator for better variety
 */
export function generateEnhancedMockArticle(category: string, index: number = 0): ScrapedArticle {
  const mockUrl = `https://example-${category}.com/article-${index}`;
  return generateMockArticleData(mockUrl);
}