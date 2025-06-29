/**
 * Real-world web scraping service using multiple approaches
 * Combines RSS feeds, public APIs, and proxy services for real data
 */

// Public RSS feeds that don't require API keys
const RSS_FEEDS = {
  news: [
    'https://rss.cnn.com/rss/edition.rss',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://www.reuters.com/rssFeed/topNews',
    'https://feeds.npr.org/1001/rss.xml',
    'https://feeds.washingtonpost.com/rss/world'
  ],
  technology: [
    'https://feeds.feedburner.com/TechCrunch',
    'https://www.wired.com/feed/rss',
    'https://feeds.arstechnica.com/arstechnica/index',
    'https://www.theverge.com/rss/index.xml'
  ],
  health: [
    'https://rss.cnn.com/rss/edition_health.rss',
    'https://feeds.medicalnewstoday.com/medicalnewstoday/rss',
    'https://www.who.int/rss-feeds/news-english.xml'
  ],
  business: [
    'https://feeds.bloomberg.com/markets/news.rss',
    'https://www.ft.com/rss/home',
    'https://feeds.reuters.com/reuters/businessNews'
  ]
};

// CORS proxy services for RSS parsing
const CORS_PROXIES = [
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.codetabs.com/v1/proxy?quest='
];

let currentProxyIndex = 0;

/**
 * Get current CORS proxy with rotation
 */
function getCurrentProxy() {
  const proxy = CORS_PROXIES[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
  return proxy;
}

/**
 * Fetch real RSS feed data
 */
export async function fetchRSSFeed(feedUrl, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const proxy = getCurrentProxy();
      const proxyUrl = proxy.includes('allorigins') 
        ? `${proxy}${encodeURIComponent(feedUrl)}`
        : `${proxy}${feedUrl}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/rss+xml, application/xml, text/xml',
          'User-Agent': 'RealityCheckAI/2.0'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      let xmlText;
      if (proxy.includes('allorigins')) {
        const data = await response.json();
        xmlText = data.contents;
      } else {
        xmlText = await response.text();
      }

      return parseRSSFeed(xmlText, feedUrl);
    } catch (error) {
      console.warn(`RSS fetch attempt ${attempt + 1} failed for ${feedUrl}:`, error);
      if (attempt === maxRetries - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

/**
 * Parse RSS XML to extract articles
 */
function parseRSSFeed(xmlText, sourceUrl) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing failed');
    }

    const items = xmlDoc.querySelectorAll('item, entry');
    const articles = [];

    items.forEach((item, index) => {
      if (index >= 20) return; // Limit to 20 articles per feed

      const title = getTextContent(item, 'title');
      const description = getTextContent(item, 'description, summary, content');
      const link = getTextContent(item, 'link, guid');
      const pubDate = getTextContent(item, 'pubDate, published, updated');
      const author = getTextContent(item, 'author, dc\\:creator');
      
      // Extract image from content or media tags
      const imageUrl = extractImageFromItem(item);

      if (title && link) {
        articles.push({
          title: cleanText(title),
          description: cleanText(description) || title,
          url: link,
          urlToImage: imageUrl,
          publishedAt: parseDate(pubDate) || new Date().toISOString(),
          source: { name: extractSourceName(sourceUrl) },
          author: cleanText(author) || 'Editorial Team',
          content: cleanText(description) || title
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('RSS parsing error:', error);
    return [];
  }
}

/**
 * Helper function to get text content from XML elements
 */
function getTextContent(item, selectors) {
  const selectorList = selectors.split(', ');
  for (const selector of selectorList) {
    const element = item.querySelector(selector);
    if (element) {
      return element.textContent || element.getAttribute('href') || element.getAttribute('url');
    }
  }
  return '';
}

/**
 * Extract image URL from RSS item
 */
function extractImageFromItem(item) {
  // Try various image sources
  const imageSources = [
    'media\\:thumbnail',
    'media\\:content[medium="image"]',
    'enclosure[type^="image"]',
    'image',
    'media\\:group media\\:content'
  ];

  for (const source of imageSources) {
    const element = item.querySelector(source);
    if (element) {
      return element.getAttribute('url') || element.getAttribute('href') || element.textContent;
    }
  }

  // Try to extract from description HTML
  const description = getTextContent(item, 'description, content');
  if (description) {
    const imgMatch = description.match(/<img[^>]+src="([^"]+)"/i);
    if (imgMatch) {
      return imgMatch[1];
    }
  }

  return null;
}

/**
 * Clean and sanitize text content
 */
function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Parse various date formats
 */
function parseDate(dateString) {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Extract source name from URL
 */
function extractSourceName(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace('www.', '').replace('feeds.', '').split('.')[0];
  } catch {
    return 'RSS Source';
  }
}

/**
 * Fetch real-world articles from multiple RSS sources
 */
export async function fetchRealWorldArticles(category = 'news', limit = 20) {
  const feeds = RSS_FEEDS[category] || RSS_FEEDS.news;
  const allArticles = [];
  
  console.log(`🌐 Fetching real-world articles from ${feeds.length} RSS sources...`);

  // Fetch from multiple feeds in parallel
  const feedPromises = feeds.map(async (feedUrl) => {
    try {
      const articles = await fetchRSSFeed(feedUrl);
      console.log(`✅ Fetched ${articles.length} articles from ${extractSourceName(feedUrl)}`);
      return articles;
    } catch (error) {
      console.warn(`❌ Failed to fetch from ${feedUrl}:`, error.message);
      return [];
    }
  });

  const results = await Promise.allSettled(feedPromises);
  
  // Combine all successful results
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  });

  // Sort by publication date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Remove duplicates based on title similarity
  const uniqueArticles = removeDuplicateArticles(allArticles);

  console.log(`📰 Successfully fetched ${uniqueArticles.length} unique real-world articles`);

  return {
    articles: uniqueArticles.slice(0, limit),
    totalResults: uniqueArticles.length,
    source: 'real-rss-feeds'
  };
}

/**
 * Remove duplicate articles based on title similarity
 */
function removeDuplicateArticles(articles) {
  const unique = [];
  const seenTitles = new Set();

  for (const article of articles) {
    const normalizedTitle = article.title.toLowerCase().replace(/[^\w\s]/g, '').trim();
    
    // Check for exact matches or very similar titles
    let isDuplicate = false;
    for (const seenTitle of seenTitles) {
      if (calculateSimilarity(normalizedTitle, seenTitle) > 0.8) {
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(article);
      seenTitles.add(normalizedTitle);
    }
  }

  return unique;
}

/**
 * Calculate similarity between two strings
 */
function calculateSimilarity(str1, str2) {
  const words1 = str1.split(/\s+/);
  const words2 = str2.split(/\s+/);
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

/**
 * Search real-world articles by query
 */
export async function searchRealWorldArticles(query, limit = 20) {
  console.log(`🔍 Searching real-world articles for: "${query}"`);
  
  // Fetch from all categories
  const categories = Object.keys(RSS_FEEDS);
  const allArticles = [];

  for (const category of categories) {
    try {
      const result = await fetchRealWorldArticles(category, 10);
      allArticles.push(...result.articles);
    } catch (error) {
      console.warn(`Failed to fetch ${category} articles:`, error);
    }
  }

  // Filter articles that match the query
  const queryWords = query.toLowerCase().split(/\s+/);
  const matchingArticles = allArticles.filter(article => {
    const searchText = `${article.title} ${article.description}`.toLowerCase();
    return queryWords.some(word => searchText.includes(word));
  });

  // Sort by relevance
  matchingArticles.sort((a, b) => {
    const scoreA = calculateRelevanceScore(query, a);
    const scoreB = calculateRelevanceScore(query, b);
    return scoreB - scoreA;
  });

  return {
    articles: matchingArticles.slice(0, limit),
    totalResults: matchingArticles.length,
    source: 'real-rss-search'
  };
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(query, article) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const titleText = article.title.toLowerCase();
  const descText = article.description.toLowerCase();
  
  let score = 0;
  
  queryWords.forEach(word => {
    // Title matches are worth more
    if (titleText.includes(word)) score += 3;
    if (descText.includes(word)) score += 1;
  });
  
  return score;
}