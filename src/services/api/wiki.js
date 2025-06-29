/**
 * Wikipedia API Service
 * Provides context, background information, and structured facts
 */

const WIKI_API_BASE = import.meta.env.VITE_WIKI_API_BASE || 'https://en.wikipedia.org/w/api.php';
const WIKIDATA_SPARQL = 'https://query.wikidata.org/sparql';

/**
 * Search Wikipedia articles
 */
export async function searchWikipedia(query, limit = 10) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: query,
      srlimit: limit.toString(),
      origin: '*'
    });

    const response = await fetch(`${WIKI_API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      results: data.query?.search || [],
      suggestion: data.query?.searchinfo?.suggestion || null,
      source: 'wikipedia'
    };
  } catch (error) {
    console.error('Wikipedia search error:', error);
    return generateMockWikiResults(query);
  }
}

/**
 * Get Wikipedia page summary
 */
export async function getWikipediaSummary(title) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'extracts|pageimages',
      exintro: 'true',
      explaintext: 'true',
      exsectionformat: 'plain',
      piprop: 'original',
      titles: title,
      origin: '*'
    });

    const response = await fetch(`${WIKI_API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];

    if (!page || page.missing) {
      return null;
    }

    return {
      title: page.title,
      extract: page.extract,
      thumbnail: page.original?.source || null,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
      source: 'wikipedia'
    };
  } catch (error) {
    console.error('Wikipedia summary error:', error);
    return generateMockSummary(title);
  }
}

/**
 * Get structured data from Wikipedia infobox
 */
export async function getWikipediaInfobox(title) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'revisions',
      rvprop: 'content',
      rvslots: 'main',
      titles: title,
      origin: '*'
    });

    const response = await fetch(`${WIKI_API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];

    if (!page || page.missing) {
      return null;
    }

    const content = page.revisions?.[0]?.slots?.main?.['*'] || '';
    const infobox = extractInfoboxData(content);

    return {
      title: page.title,
      infobox,
      source: 'wikipedia'
    };
  } catch (error) {
    console.error('Wikipedia infobox error:', error);
    return generateMockInfobox(title);
  }
}

/**
 * Extract structured data from Wikipedia infobox markup
 */
function extractInfoboxData(wikitext) {
  const infobox = {};
  
  // Simple regex to extract infobox parameters
  const infoboxMatch = wikitext.match(/\{\{[Ii]nfobox[^}]*\}\}/s);
  if (!infoboxMatch) return infobox;

  const infoboxText = infoboxMatch[0];
  const paramRegex = /\|\s*([^=]+?)\s*=\s*([^|]+?)(?=\s*\||\s*\}\})/g;
  
  let match;
  while ((match = paramRegex.exec(infoboxText)) !== null) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/\[\[([^|\]]+)(\|[^\]]+)?\]\]/g, '$1');
    infobox[key] = value;
  }

  return infobox;
}

/**
 * Get related Wikipedia articles
 */
export async function getRelatedWikipediaArticles(title, limit = 5) {
  try {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'links',
      titles: title,
      pllimit: limit.toString(),
      plnamespace: '0',
      origin: '*'
    });

    const response = await fetch(`${WIKI_API_BASE}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();
    const pages = data.query?.pages || {};
    const page = Object.values(pages)[0];

    return {
      related: page?.links?.map(link => link.title) || [],
      source: 'wikipedia'
    };
  } catch (error) {
    console.error('Wikipedia related articles error:', error);
    return { related: [], source: 'mock' };
  }
}

/**
 * Query Wikidata for structured facts
 */
export async function queryWikidata(sparqlQuery) {
  try {
    const params = new URLSearchParams({
      query: sparqlQuery,
      format: 'json'
    });

    const response = await fetch(`${WIKIDATA_SPARQL}?${params}`, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'RealityCheckAI/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Wikidata SPARQL error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      results: data.results?.bindings || [],
      source: 'wikidata'
    };
  } catch (error) {
    console.error('Wikidata query error:', error);
    return { results: [], source: 'mock' };
  }
}

/**
 * Get comprehensive context for a topic
 */
export async function getTopicContext(topic) {
  try {
    const [searchResults, summary] = await Promise.all([
      searchWikipedia(topic, 3),
      getWikipediaSummary(topic)
    ]);

    const context = {
      topic,
      summary,
      relatedArticles: searchResults.results,
      source: 'wikipedia'
    };

    // Get additional context from top search result
    if (searchResults.results.length > 0) {
      const topResult = searchResults.results[0];
      const [infobox, related] = await Promise.all([
        getWikipediaInfobox(topResult.title),
        getRelatedWikipediaArticles(topResult.title)
      ]);

      context.infobox = infobox?.infobox || {};
      context.related = related.related || [];
    }

    return context;
  } catch (error) {
    console.error('Topic context error:', error);
    return generateMockContext(topic);
  }
}

/**
 * Generate mock Wikipedia results
 */
function generateMockWikiResults(query) {
  return {
    results: [
      {
        title: `${query} - Wikipedia`,
        snippet: `${query} is a topic of significant importance with various aspects and implications...`,
        size: 15420,
        wordcount: 2156,
        timestamp: new Date().toISOString()
      }
    ],
    suggestion: null,
    source: 'mock'
  };
}

/**
 * Generate mock Wikipedia summary
 */
function generateMockSummary(title) {
  return {
    title,
    extract: `${title} is a significant topic with multiple dimensions and implications. This comprehensive overview provides essential context and background information for understanding the subject matter.`,
    thumbnail: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=300',
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title)}`,
    source: 'mock'
  };
}

/**
 * Generate mock infobox data
 */
function generateMockInfobox(title) {
  return {
    title,
    infobox: {
      'Type': 'Concept',
      'Category': 'General Knowledge',
      'Status': 'Active',
      'Related': 'Various topics'
    },
    source: 'mock'
  };
}

/**
 * Generate mock topic context
 */
function generateMockContext(topic) {
  return {
    topic,
    summary: generateMockSummary(topic),
    relatedArticles: generateMockWikiResults(topic).results,
    infobox: {
      'Type': 'Topic',
      'Category': 'Knowledge',
      'Relevance': 'High'
    },
    related: [`Related to ${topic}`, `${topic} applications`, `${topic} history`],
    source: 'mock'
  };
}