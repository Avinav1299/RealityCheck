/**
 * AI Summarization Service with RAG Pipeline
 * Generates smart summaries, timelines, and strategic analysis using AI models
 */

import { getTopicContext } from './wiki.js';
import { searchSearXNG } from './searxng.js';

/**
 * Generate comprehensive summary using RAG pipeline with API keys
 */
export async function generateSmartSummary(article, additionalContext = []) {
  try {
    console.log('Generating smart summary for:', article.title);

    // Extract key topics for context retrieval
    const topics = extractKeyTopics(article.title + ' ' + article.description);
    
    // Gather context from multiple sources
    const [wikiContext, relatedNews] = await Promise.all([
      getWikipediaContext(topics),
      getRelatedNews(article.title)
    ]);

    // Combine all context
    const fullContext = {
      article,
      wikipedia: wikiContext,
      relatedNews: relatedNews,
      additional: additionalContext
    };

    // Check if we have any AI API keys configured
    const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY && 
                     import.meta.env.VITE_OPENAI_API_KEY !== 'demo-key' &&
                     import.meta.env.VITE_OPENAI_API_KEY !== 'your_openai_api_key';
    
    const hasClaude = import.meta.env.VITE_CLAUDE_API_KEY && 
                     import.meta.env.VITE_CLAUDE_API_KEY !== 'demo-key' &&
                     import.meta.env.VITE_CLAUDE_API_KEY !== 'your_claude_api_key';

    if (hasOpenAI) {
      return await generateOpenAISummary(fullContext);
    } else if (hasClaude) {
      return await generateClaudeSummary(fullContext);
    } else {
      console.warn('No AI API keys configured, using enhanced mock summary');
      return generateEnhancedMockSummary(fullContext);
    }
  } catch (error) {
    console.error('Smart summary generation error:', error);
    return generateEnhancedMockSummary({ article, wikipedia: [], relatedNews: [], additional: [] });
  }
}

/**
 * Generate AI-powered summary using OpenAI
 */
async function generateOpenAISummary(context) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert analyst creating comprehensive summaries using RAG (Retrieval-Augmented Generation). 

Create a detailed analysis including:
1. TL;DR (2-3 sentences)
2. Key Points (4-5 bullet points)
3. Timeline of events (if applicable)
4. Context and background
5. Implications and significance
6. Trust score (0-100) based on source credibility
7. Strategic recommendations
8. Related topics for further exploration

Use the provided Wikipedia context and related news to enhance accuracy.

Respond in JSON format:
{
  "tldr": "Brief summary...",
  "keyPoints": ["Point 1", "Point 2", ...],
  "timeline": [{"date": "2025-01-XX", "event": "Description"}],
  "context": "Background information...",
  "implications": "What this means...",
  "trustScore": 85,
  "strategy": {
    "recommendations": ["Rec 1", "Rec 2", ...],
    "priority": "high",
    "timeframe": "immediate"
  },
  "relatedTopics": ["Topic 1", "Topic 2", ...],
  "sources": ["Source 1", "Source 2", ...],
  "confidence": 90
}`
          },
          {
            role: "user",
            content: `Analyze this article with the provided context:

Article: ${context.article.title}
Description: ${context.article.description}

Wikipedia Context:
${JSON.stringify(context.wikipedia, null, 2)}

Related News:
${JSON.stringify(context.relatedNews, null, 2)}

Additional Context:
${JSON.stringify(context.additional, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(content);
    
    return {
      ...analysis,
      generatedAt: new Date().toISOString(),
      source: 'openai-rag'
    };
  } catch (error) {
    console.error('OpenAI summary generation error:', error);
    return generateEnhancedMockSummary(context);
  }
}

/**
 * Generate AI-powered summary using Claude
 */
async function generateClaudeSummary(context) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': import.meta.env.VITE_CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 2000,
        system: `You are an expert analyst creating comprehensive summaries using RAG. Create detailed analysis with TL;DR, key points, timeline, context, implications, trust score, strategic recommendations, and related topics. Respond in JSON format.`,
        messages: [
          {
            role: "user",
            content: `Analyze this article: ${context.article.title}\n\nDescription: ${context.article.description}\n\nContext: ${JSON.stringify(context, null, 2)}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    if (!content) {
      throw new Error('No response from Claude');
    }

    const analysis = JSON.parse(content);
    
    return {
      ...analysis,
      generatedAt: new Date().toISOString(),
      source: 'claude-rag'
    };
  } catch (error) {
    console.error('Claude summary generation error:', error);
    return generateEnhancedMockSummary(context);
  }
}

/**
 * Generate event timeline with AI analysis
 */
export async function generateEventTimeline(topic, events = []) {
  try {
    // Search for timeline information
    const timelineData = await searchTimelineEvents(topic);

    // Combine with provided events
    const allEvents = [...events, ...timelineData];

    // Sort chronologically
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate AI analysis of timeline
    const analysis = await analyzeTimeline(topic, allEvents);

    return {
      topic,
      events: allEvents.slice(0, 15), // Limit to 15 most relevant events
      analysis,
      generatedAt: new Date().toISOString(),
      source: 'rag-timeline'
    };
  } catch (error) {
    console.error('Timeline generation error:', error);
    return generateMockTimeline(topic);
  }
}

/**
 * Search for timeline events using multiple sources
 */
async function searchTimelineEvents(topic) {
  try {
    const timelineQueries = [
      `"${topic}" timeline chronology`,
      `"${topic}" history development`,
      `when did "${topic}" start`,
      `"${topic}" latest developments`
    ];

    const events = [];
    
    for (const query of timelineQueries) {
      try {
        const results = await searchSearXNG(query, ['general', 'news']);
        
        events.push(...results.results.slice(0, 3).map(result => ({
          date: result.publishedDate || extractDateFromContent(result.content) || new Date().toISOString(),
          title: result.title,
          description: result.content || result.title,
          source: result.source,
          url: result.url,
          relevance: result.relevance || 0.5
        })));
      } catch (error) {
        console.warn(`Timeline search failed for: ${query}`, error);
      }
    }

    return events.sort((a, b) => b.relevance - a.relevance).slice(0, 10);
  } catch (error) {
    console.error('Timeline search error:', error);
    return [];
  }
}

/**
 * Analyze timeline for patterns and insights
 */
async function analyzeTimeline(topic, events) {
  const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY && 
                   import.meta.env.VITE_OPENAI_API_KEY !== 'demo-key';

  if (!hasOpenAI) {
    return generateMockTimelineAnalysis(topic);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Analyze the timeline of events and provide insights about patterns, causes, effects, and future implications.

Respond in JSON format:
{
  "summary": "Overview of the timeline...",
  "keyPatterns": ["Pattern 1", "Pattern 2", ...],
  "causeEffect": [{"cause": "X", "effect": "Y", "confidence": 85}],
  "futurePredictions": ["Prediction 1", "Prediction 2", ...],
  "significance": "Why this timeline matters...",
  "strategy": {
    "recommendations": ["Action 1", "Action 2", ...],
    "priority": "high",
    "stakeholders": ["Stakeholder 1", "Stakeholder 2", ...]
  }
}`
          },
          {
            role: "user",
            content: `Analyze this timeline for "${topic}":

Events:
${events.map(e => `${e.date}: ${e.title} - ${e.description}`).join('\n')}`
          }
        ],
        temperature: 0.4,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Timeline analysis error:', error);
    return generateMockTimelineAnalysis(topic);
  }
}

/**
 * Helper functions
 */
function extractKeyTopics(text) {
  const words = text.toLowerCase().split(/\W+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
  
  return words
    .filter(word => word.length > 3 && !stopWords.has(word))
    .slice(0, 5);
}

async function getWikipediaContext(topics) {
  try {
    const contexts = await Promise.all(
      topics.slice(0, 3).map(topic => getTopicContext(topic))
    );
    return contexts.filter(context => context && context.summary);
  } catch (error) {
    console.warn('Wikipedia context error:', error);
    return [];
  }
}

async function getRelatedNews(title) {
  try {
    const results = await searchSearXNG(`"${title}" OR related news`, ['news']);
    return results.results.slice(0, 5);
  } catch (error) {
    console.warn('Related news search error:', error);
    return [];
  }
}

function extractDateFromContent(content) {
  if (!content) return null;
  
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
 * Enhanced mock data generators
 */
function generateEnhancedMockSummary(context) {
  const article = context.article;
  
  return {
    tldr: `${article.title} represents a significant development with multiple implications for stakeholders and future trends. Analysis reveals key patterns and strategic opportunities.`,
    keyPoints: [
      'Primary development shows substantial impact on the sector',
      'Multiple sources confirm the authenticity and significance',
      'Expert analysis indicates long-term implications',
      'Stakeholder responses suggest broad industry interest',
      'Timeline suggests accelerating pace of change'
    ],
    timeline: [
      {
        date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
        event: 'Initial reports emerge from multiple sources'
      },
      {
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        event: 'Expert verification and comprehensive analysis'
      },
      {
        date: new Date().toISOString().split('T')[0],
        event: 'Current developments and strategic implications'
      }
    ],
    context: `This development occurs within the broader context of ongoing changes in the sector, with multiple contributing factors and stakeholder interests converging.`,
    implications: `The significance extends beyond immediate effects to include long-term strategic implications for industry, policy, and future developments.`,
    trustScore: Math.floor(Math.random() * 20) + 80,
    strategy: {
      recommendations: [
        'Monitor ongoing developments closely',
        'Assess potential impact on operations',
        'Engage with key stakeholders',
        'Develop contingency plans'
      ],
      priority: 'high',
      timeframe: 'immediate'
    },
    relatedTopics: extractKeyTopics(article.title + ' ' + article.description),
    sources: ['Wikipedia', 'News sources', 'Expert analysis'],
    confidence: Math.floor(Math.random() * 15) + 85,
    generatedAt: new Date().toISOString(),
    source: 'enhanced-mock-rag'
  };
}

function generateMockTimeline(topic) {
  return {
    topic,
    events: [
      {
        date: new Date(Date.now() - 86400000 * 30).toISOString(),
        title: `${topic} - Initial Development`,
        description: 'First reports and initial analysis from multiple sources',
        source: 'News Network',
        relevance: 0.9
      },
      {
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        title: `${topic} - Expert Analysis`,
        description: 'Comprehensive expert review and verification process',
        source: 'Expert Analysis',
        relevance: 0.8
      },
      {
        date: new Date().toISOString(),
        title: `${topic} - Current Status`,
        description: 'Latest developments and strategic implications',
        source: 'Real-time Updates',
        relevance: 1.0
      }
    ],
    analysis: generateMockTimelineAnalysis(topic),
    generatedAt: new Date().toISOString(),
    source: 'mock-timeline'
  };
}

function generateMockTimelineAnalysis(topic) {
  return {
    summary: `The timeline for ${topic} shows accelerating development with increasing stakeholder engagement and expert validation.`,
    keyPatterns: [
      'Accelerating pace of development',
      'Increasing expert attention',
      'Growing stakeholder involvement',
      'Expanding scope of implications'
    ],
    causeEffect: [
      { cause: 'Initial development', effect: 'Expert attention', confidence: 85 },
      { cause: 'Expert validation', effect: 'Stakeholder engagement', confidence: 78 },
      { cause: 'Stakeholder interest', effect: 'Accelerated development', confidence: 82 }
    ],
    futurePredictions: [
      'Continued acceleration of development',
      'Increased regulatory attention',
      'Broader industry adoption',
      'Long-term strategic implications'
    ],
    significance: `This timeline demonstrates the rapid evolution and growing importance of ${topic} in the current landscape.`,
    strategy: {
      recommendations: [
        'Establish monitoring systems',
        'Engage with key stakeholders',
        'Develop strategic response plans',
        'Allocate resources for analysis'
      ],
      priority: 'high',
      stakeholders: ['Industry leaders', 'Policy makers', 'Research institutions', 'General public']
    }
  };
}