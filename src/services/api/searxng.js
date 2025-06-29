/**
 * SearXNG Search API Service
 * Free and open-source metasearch engine for real-time web scraping
 */

// Public SearXNG instances (no API key required)
const SEARXNG_INSTANCES = [
  'https://searx.be',
  'https://search.sapti.me',
  'https://searx.tiekoetter.com',
  'https://searx.work',
  'https://searx.prvcy.eu'
];

let currentInstanceIndex = 0;

/**
 * Get current SearXNG instance with rotation
 */
function getCurrentInstance() {
  const instance = SEARXNG_INSTANCES[currentInstanceIndex];
  currentInstanceIndex = (currentInstanceIndex + 1) % SEARXNG_INSTANCES.length;
  return instance;
}

/**
 * Search using SearXNG
 */
export async function searchSearXNG(query, categories = ['general'], format = 'json') {
  const instance = getCurrentInstance();
  
  try {
    const params = new URLSearchParams({
      q: query,
      format: format,
      categories: categories.join(','),
      engines: 'google,bing,duckduckgo,startpage',
      time_range: '',
      safesearch: '1'
    });

    const response = await fetch(`${instance}/search?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RealityCheckAI/2.0'
      },
      timeout: 10000
    });

    if (!response.ok) {
      throw new Error(`SearXNG error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      results: data.results || [],
      suggestions: data.suggestions || [],
      infoboxes: data.infoboxes || [],
      totalResults: data.number_of_results || 0,
      instance: instance,
      source: 'searxng'
    };
  } catch (error) {
    console.warn(`SearXNG instance ${instance} failed:`, error.message);
    
    // Try next instance
    if (currentInstanceIndex < SEARXNG_INSTANCES.length) {
      return searchSearXNG(query, categories, format);
    }
    
    // All instances failed, return mock data
    return generateMockSearchResults(query);
  }
}

/**
 * Search for trending topics
 */
export async function searchTrendingTopics(region = 'global') {
  const trendingQueries = [
    'breaking news today',
    'latest technology developments',
    'global events happening now',
    'scientific breakthroughs 2025',
    'political developments',
    'climate change updates',
    'health news today',
    'economic trends'
  ];

  const results = [];
  
  for (const query of trendingQueries.slice(0, 3)) {
    try {
      const searchResults = await searchSearXNG(query, ['news', 'general']);
      results.push({
        query,
        results: searchResults.results.slice(0, 5),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn(`Failed to search trending topic: ${query}`, error);
    }
  }

  return {
    trending: results,
    source: 'searxng',
    timestamp: new Date().toISOString()
  };
}

/**
 * Search news specifically
 */
export async function searchNews(query, timeRange = 'day') {
  try {
    const searchResults = await searchSearXNG(query, ['news'], 'json');
    
    // Filter and enhance results
    const newsResults = searchResults.results
      .filter(result => result.publishedDate || result.url.includes('news'))
      .map(result => ({
        title: result.title,
        description: result.content || result.title,
        url: result.url,
        publishedDate: result.publishedDate || new Date().toISOString(),
        source: extractDomain(result.url),
        category: categorizeNews(result.title + ' ' + (result.content || '')),
        thumbnail: result.img_src || null
      }));

    return {
      articles: newsResults,
      totalResults: newsResults.length,
      query,
      source: 'searxng'
    };
  } catch (error) {
    console.error('SearXNG news search error:', error);
    return generateMockNewsResults(query);
  }
}

/**
 * Search for fact-checking sources
 */
export async function searchFactCheck(claim) {
  const factCheckSites = [
    'site:snopes.com',
    'site:factcheck.org',
    'site:politifact.com',
    'site:reuters.com/fact-check',
    'site:apnews.com/hub/ap-fact-check'
  ];

  const query = `"${claim}" ${factCheckSites.join(' OR ')}`;
  
  try {
    const results = await searchSearXNG(query, ['general']);
    
    return {
      factChecks: results.results.map(result => ({
        title: result.title,
        url: result.url,
        snippet: result.content,
        source: extractDomain(result.url),
        relevance: calculateRelevance(claim, result.title + ' ' + result.content)
      })),
      source: 'searxng'
    };
  } catch (error) {
    console.error('Fact-check search error:', error);
    return { factChecks: [], source: 'mock' };
  }
}

/**
 * Real-time event timeline search
 */
export async function searchEventTimeline(topic) {
  const timeQueries = [
    `"${topic}" timeline`,
    `"${topic}" chronology`,
    `"${topic}" history`,
    `when did "${topic}" start`,
    `"${topic}" latest developments`
  ];

  const timelineData = [];

  for (const query of timeQueries) {
    try {
      const results = await searchSearXNG(query, ['general', 'news']);
      
      timelineData.push(...results.results.slice(0, 3).map(result => ({
        title: result.title,
        description: result.content,
        url: result.url,
        date: extractDateFromContent(result.content) || new Date().toISOString(),
        source: extractDomain(result.url),
        relevance: calculateRelevance(topic, result.title + ' ' + result.content)
      })));
    } catch (error) {
      console.warn(`Timeline search failed for: ${query}`, error);
    }
  }

  // Sort by relevance and date
  timelineData.sort((a, b) => {
    const relevanceDiff = b.relevance - a.relevance;
    if (Math.abs(relevanceDiff) > 0.1) return relevanceDiff;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return {
    timeline: timelineData.slice(0, 10),
    topic,
    source: 'searxng'
  };
}

/**
 * Helper functions
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function categorizeNews(text) {
  const categories = {
    technology: ['ai', 'tech', 'software', 'computer', 'digital', 'cyber'],
    health: ['health', 'medical', 'disease', 'vaccine', 'hospital', 'doctor'],
    politics: ['government', 'election', 'political', 'congress', 'senate', 'president'],
    climate: ['climate', 'environment', 'weather', 'carbon', 'emission', 'green'],
    business: ['business', 'economy', 'market', 'stock', 'financial', 'company'],
    science: ['science', 'research', 'study', 'discovery', 'experiment', 'scientist']
  };

  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'general';
}

function calculateRelevance(query, text) {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase().split(/\s+/);
  
  let matches = 0;
  for (const word of queryWords) {
    if (textWords.some(textWord => textWord.includes(word) || word.includes(textWord))) {
      matches++;
    }
  }
  
  return matches / queryWords.length;
}

function extractDateFromContent(content) {
  // Simple date extraction - in production, use more sophisticated NLP
  const dateRegex = /(\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4})/;
  const match = content.match(dateRegex);
  
  if (match) {
    try {
      return new Date(match[1]).toISOString();
    } catch {
      return null;
    }
  }
  
  return null;
}

/**
 * Mock data generators
 */
function generateMockSearchResults(query) {
  return {
    results: [
      {
        title: `Latest developments in ${query}`,
        content: `Recent analysis and updates regarding ${query} with comprehensive coverage and expert insights.`,
        url: `https://example.com/search/${encodeURIComponent(query)}`,
        publishedDate: new Date().toISOString()
      }
    ],
    suggestions: [`${query} news`, `${query} analysis`, `${query} timeline`],
    totalResults: 1,
    source: 'mock'
  };
}

function generateMockNewsResults(query) {
  return {
    articles: [
      {
        title: `Breaking: ${query} developments unfold in real-time`,
        description: `Latest updates and analysis on ${query} with expert commentary and verified sources.`,
        url: `https://example.com/news/${encodeURIComponent(query)}`,
        publishedDate: new Date().toISOString(),
        source: 'Mock News',
        category: 'general',
        thumbnail: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=400'
      }
    ],
    totalResults: 1,
    source: 'mock'
  };
}