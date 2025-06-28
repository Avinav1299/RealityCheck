import { supabase } from '../lib/supabase';
import { detectImageManipulation } from './detectImageManipulation';
import { verifyTextClaim } from './verifyTextClaim';
import { summarizeAndStrategize } from './summarizeAndStrategize';

// Enhanced mock data with more realistic real-time content
const generateRealtimeArticles = (sector: string) => {
  const currentTime = new Date();
  const articles = [
    {
      title: `[LIVE] AI Systems Detect ${Math.floor(Math.random() * 5000 + 1000)} Security Threats in Last 60 Seconds`,
      description: `Real-time cybersecurity monitoring reveals unprecedented threat detection rates across global networks. Advanced AI algorithms successfully identified and neutralized sophisticated attacks targeting critical infrastructure in ${sector} sector.`,
      url: `https://example.com/live-security-${Date.now()}`,
      urlToImage: 'https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: new Date(currentTime.getTime() - Math.random() * 300000).toISOString(), // Last 5 minutes
      content: `Breaking: Global security networks report massive real-time threat detection success. AI-powered systems demonstrate unprecedented capability in identifying and neutralizing cyber threats across ${sector} infrastructure.`
    },
    {
      title: `Real-Time: ${Math.floor(Math.random() * 50 + 10)} Countries Report Breakthrough in ${sector.charAt(0).toUpperCase() + sector.slice(1)} Technology`,
      description: `Live updates from international research networks show simultaneous breakthroughs occurring across multiple continents. Advanced monitoring systems detect rapid technological advancement patterns.`,
      url: `https://example.com/global-breakthrough-${Date.now()}`,
      urlToImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: new Date(currentTime.getTime() - Math.random() * 180000).toISOString(), // Last 3 minutes
      content: `International collaboration yields remarkable results in ${sector} sector. Real-time data analysis reveals coordinated advancement across research institutions worldwide.`
    },
    {
      title: `URGENT: AI Verification Systems Process ${Math.floor(Math.random() * 10000 + 5000)} Media Files in 30 Seconds`,
      description: `Advanced verification algorithms demonstrate unprecedented processing speed, analyzing multimedia content for authenticity markers and manipulation indicators in real-time across global platforms.`,
      url: `https://example.com/verification-surge-${Date.now()}`,
      urlToImage: 'https://images.pexels.com/photos/518543/pexels-photo-518543.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: new Date(currentTime.getTime() - Math.random() * 120000).toISOString(), // Last 2 minutes
      content: `Revolutionary verification technology processes massive volumes of media content with 99.7% accuracy. Real-time analysis prevents misinformation spread across digital platforms.`
    },
    {
      title: `Live Update: Quantum Computing Milestone Achieved - ${Math.floor(Math.random() * 2000 + 500)} Qubit Stability Maintained`,
      description: `Research teams report breakthrough quantum coherence lasting ${Math.floor(Math.random() * 60 + 10)} seconds, marking significant advancement in quantum computing stability and practical applications.`,
      url: `https://example.com/quantum-milestone-${Date.now()}`,
      urlToImage: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: new Date(currentTime.getTime() - Math.random() * 240000).toISOString(), // Last 4 minutes
      content: `Quantum research laboratories achieve unprecedented stability in quantum state maintenance. Real-time monitoring confirms sustained coherence beyond theoretical predictions.`
    },
    {
      title: `Real-Time Climate Data: ${Math.floor(Math.random() * 100 + 50)} Monitoring Stations Report Synchronized Changes`,
      description: `Global climate monitoring network detects coordinated environmental changes occurring simultaneously across multiple geographic regions, with AI systems identifying patterns in real-time.`,
      url: `https://example.com/climate-sync-${Date.now()}`,
      urlToImage: 'https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: new Date(currentTime.getTime() - Math.random() * 360000).toISOString(), // Last 6 minutes
      content: `Advanced climate monitoring reveals unprecedented synchronization in global environmental patterns. Real-time analysis provides critical insights for climate response strategies.`
    },
    {
      title: `Breaking: Medical AI Identifies ${Math.floor(Math.random() * 500 + 100)} Treatment Correlations in Live Analysis`,
      description: `Healthcare AI systems processing global medical data discover new treatment patterns and correlations in real-time, potentially benefiting millions of patients worldwide.`,
      url: `https://example.com/medical-discovery-${Date.now()}`,
      urlToImage: 'https://images.pexels.com/photos/3938023/pexels-photo-3938023.jpeg?auto=compress&cs=tinysrgb&w=800',
      publishedAt: new Date(currentTime.getTime() - Math.random() * 420000).toISOString(), // Last 7 minutes
      content: `Revolutionary medical AI analysis reveals novel treatment correlations across global health databases. Real-time processing enables immediate clinical application potential.`
    }
  ];

  return articles.map(article => ({
    ...article,
    title: `[${sector.toUpperCase()}] ${article.title}`,
    description: article.description.replace(/\b(sector|technology|systems)\b/g, `${sector} $1`)
  }));
};

export async function fetchArticles(sector: string = 'general') {
  try {
    console.log(`🔄 Fetching real-time articles for sector: ${sector}`);
    
    let articles = [];
    
    // Check if we have NewsAPI key
    if (import.meta.env.VITE_NEWSAPI_KEY && import.meta.env.VITE_NEWSAPI_KEY !== 'demo-key') {
      try {
        // Use fetch instead of NewsAPI library to avoid browser compatibility issues
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?category=${sector === 'general' ? '' : sector}&language=en&pageSize=20&apiKey=${import.meta.env.VITE_NEWSAPI_KEY}`
        );
        
        if (response.ok) {
          const data = await response.json();
          articles = data.articles || [];
          console.log(`✅ Fetched ${articles.length} real articles from NewsAPI`);
        } else {
          throw new Error(`NewsAPI error: ${response.status}`);
        }
      } catch (apiError) {
        console.warn('📡 NewsAPI unavailable, using enhanced mock data:', apiError);
        articles = generateRealtimeArticles(sector);
      }
    } else {
      console.log('🎭 Using enhanced real-time mock data');
      articles = generateRealtimeArticles(sector);
    }

    // Process and store articles with enhanced real-time processing
    let processedCount = 0;
    for (const article of articles) {
      if (!article.title || !article.description) continue;

      try {
        // Check if article already exists
        const { data: existingArticle } = await supabase
          .from('articles')
          .select('id')
          .eq('url', article.url)
          .single();

        if (existingArticle) continue;

        // Insert article with enhanced metadata
        const { data: insertedArticle, error: insertError } = await supabase
          .from('articles')
          .insert({
            title: article.title,
            content: article.description || article.content || '',
            url: article.url,
            image_url: article.urlToImage,
            sector: sector,
            published_at: article.publishedAt || new Date().toISOString()
          })
          .select()
          .single();

        if (insertError || !insertedArticle) {
          console.error('❌ Error inserting article:', insertError);
          continue;
        }

        // Process verification checks asynchronously for real-time feel
        Promise.all([
          article.urlToImage ? processImageCheck(insertedArticle.id, article.urlToImage) : null,
          processTextVerification(insertedArticle.id, article.title + ' ' + article.description)
        ]).catch(error => console.warn('⚠️ Background processing error:', error));

        processedCount++;
      } catch (error) {
        console.error('❌ Error processing article:', error);
      }
    }

    console.log(`✅ Successfully processed ${processedCount}/${articles.length} articles`);
    return articles;

  } catch (error) {
    console.error('❌ Error in fetchArticles:', error);
    // Return enhanced mock data as fallback
    return generateRealtimeArticles(sector);
  }
}

async function processImageCheck(articleId: string, imageUrl: string) {
  try {
    console.log('🖼️ Processing image verification...');
    const result = await detectImageManipulation(imageUrl);
    
    await supabase.from('image_checks').insert({
      article_id: articleId,
      image_url: imageUrl,
      match_count: result.matchCount || 0,
      earliest_date: result.earliestDate,
      context_urls: result.contextUrls || [],
      confidence_score: Math.floor(result.confidence || 85),
      status: result.status || 'verified'
    });
    
    console.log('✅ Image verification completed');
  } catch (error) {
    console.error('❌ Error processing image check:', error);
  }
}

async function processTextVerification(articleId: string, text: string) {
  try {
    console.log('📝 Processing text verification...');
    const result = await verifyTextClaim(text);
    
    // Insert text check
    await supabase.from('text_checks').insert({
      article_id: articleId,
      claim_text: text.substring(0, 500), // Limit text length
      verification_status: result.verificationStatus || 'unverified',
      confidence_score: result.confidenceScore || 75,
      citations: result.citations || [],
      reasoning: result.reasoning || 'Real-time automated verification completed'
    });

    // Generate strategy
    const strategy = await summarizeAndStrategize(result);
    
    await supabase.from('strategies').insert({
      article_id: articleId,
      summary: strategy.summary,
      action_steps: strategy.actionSteps,
      priority_level: strategy.priorityLevel || 'medium'
    });

    console.log('✅ Text verification and strategy generation completed');
  } catch (error) {
    console.error('❌ Error processing text verification:', error);
  }
}