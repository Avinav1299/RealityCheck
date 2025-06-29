/**
 * AI Summarization Service with RAG Pipeline
 * Generates smart summaries using multiple sources and context
 */

import OpenAI from 'openai';
import { getTopicContext } from './wiki.js';
import { searchFactCheck } from './searxng.js';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  dangerouslyAllowBrowser: true
});

/**
 * Generate comprehensive summary using RAG pipeline
 */
export async function generateSmartSummary(article, additionalContext = []) {
  try {
    console.log('Generating smart summary for:', article.title);

    // Extract key topics for context retrieval
    const topics = extractKeyTopics(article.title + ' ' + article.description);
    
    // Gather context from multiple sources
    const [wikiContext, factCheckContext] = await Promise.all([
      getWikipediaContext(topics),
      getFactCheckContext(article.title)
    ]);

    // Combine all context
    const fullContext = {
      article,
      wikipedia: wikiContext,
      factChecks: factCheckContext,
      additional: additionalContext
    };

    // Generate summary using AI
    if (import.meta.env.VITE_OPENAI_API_KEY && import.meta.env.VITE_OPENAI_API_KEY !== 'demo-key') {
      return await generateAISummary(fullContext);
    } else {
      return generateMockSummary(fullContext);
    }
  } catch (error) {
    console.error('Smart summary generation error:', error);
    return generateMockSummary({ article, wikipedia: [], factChecks: [], additional: [] });
  }
}

/**
 * Generate AI-powered summary
 */
async function generateAISummary(context) {
  try {
    const completion = await openai.chat.completions.create({
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
7. Related topics for further exploration

Use the provided Wikipedia context and fact-check sources to enhance accuracy.

Respond in JSON format:
{
  "tldr": "Brief summary...",
  "keyPoints": ["Point 1", "Point 2", ...],
  "timeline": [{"date": "2025-01-XX", "event": "Description"}],
  "context": "Background information...",
  "implications": "What this means...",
  "trustScore": 85,
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

Fact-Check Context:
${JSON.stringify(context.factChecks, null, 2)}

Additional Context:
${JSON.stringify(context.additional, null, 2)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(response);
    
    return {
      ...analysis,
      generatedAt: new Date().toISOString(),
      source: 'openai-rag'
    };
  } catch (error) {
    console.error('AI summary generation error:', error);
    return generateMockSummary(context);
  }
}

/**
 * Generate event timeline
 */
export async function generateEventTimeline(topic, events = []) {
  try {
    // Search for timeline information
    const { searchEventTimeline } = await import('./searxng.js');
    const timelineData = await searchEventTimeline(topic);

    // Combine with provided events
    const allEvents = [...events, ...timelineData.timeline];

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
 * Analyze timeline for patterns and insights
 */
async function analyzeTimeline(topic, events) {
  if (!import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_OPENAI_API_KEY === 'demo-key') {
    return generateMockTimelineAnalysis(topic);
  }

  try {
    const completion = await openai.chat.completions.create({
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
  "significance": "Why this timeline matters..."
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
      max_tokens: 800
    });

    const response = completion.choices[0]?.message?.content;
    return JSON.parse(response);
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

async function getFactCheckContext(title) {
  try {
    const factChecks = await searchFactCheck(title);
    return factChecks.factChecks || [];
  } catch (error) {
    console.warn('Fact-check context error:', error);
    return [];
  }
}

/**
 * Mock data generators
 */
function generateMockSummary(context) {
  const article = context.article;
  
  return {
    tldr: `${article.title} represents a significant development with multiple implications for stakeholders and future trends.`,
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
        event: 'Initial reports emerge'
      },
      {
        date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
        event: 'Expert verification and analysis'
      },
      {
        date: new Date().toISOString().split('T')[0],
        event: 'Current developments and implications'
      }
    ],
    context: `This development occurs within the broader context of ongoing changes in the sector, with multiple contributing factors and stakeholder interests.`,
    implications: `The significance extends beyond immediate effects to include long-term strategic implications for industry and policy.`,
    trustScore: Math.floor(Math.random() * 20) + 80,
    relatedTopics: extractKeyTopics(article.title + ' ' + article.description),
    sources: ['Wikipedia', 'Fact-check sources', 'Expert analysis'],
    confidence: Math.floor(Math.random() * 15) + 85,
    generatedAt: new Date().toISOString(),
    source: 'mock-rag'
  };
}

function generateMockTimeline(topic) {
  return {
    topic,
    events: [
      {
        date: new Date(Date.now() - 86400000 * 30).toISOString(),
        title: `${topic} - Initial Development`,
        description: 'First reports and initial analysis',
        source: 'Mock Source'
      },
      {
        date: new Date(Date.now() - 86400000 * 15).toISOString(),
        title: `${topic} - Expert Analysis`,
        description: 'Comprehensive expert review and verification',
        source: 'Mock Analysis'
      },
      {
        date: new Date().toISOString(),
        title: `${topic} - Current Status`,
        description: 'Latest developments and implications',
        source: 'Mock Update'
      }
    ],
    analysis: generateMockTimelineAnalysis(topic),
    generatedAt: new Date().toISOString(),
    source: 'mock-timeline'
  };
}

function generateMockTimelineAnalysis(topic) {
  return {
    summary: `The timeline for ${topic} shows accelerating development with increasing stakeholder engagement.`,
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
    significance: `This timeline demonstrates the rapid evolution and growing importance of ${topic} in the current landscape.`
  };
}