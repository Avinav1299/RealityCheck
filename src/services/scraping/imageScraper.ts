/**
 * Image Scraping Service
 * Extracts images from articles using meta tags and content parsing
 */

import axios from 'axios';
import * as cheerio from 'cheerio';

interface ScrapedImage {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  source: 'og:image' | 'twitter:image' | 'first-img' | 'content-img';
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
 */
export async function scrapeArticle(url: string): Promise<ScrapedArticle> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('meta[property="og:title"]').attr('content') ||
                  $('meta[name="twitter:title"]').attr('content') ||
                  $('title').text() ||
                  $('h1').first().text() ||
                  'Untitled';

    // Extract description
    const description = $('meta[property="og:description"]').attr('content') ||
                       $('meta[name="twitter:description"]').attr('content') ||
                       $('meta[name="description"]').attr('content') ||
                       $('p').first().text().substring(0, 200) ||
                       '';

    // Extract image
    const image = extractBestImage($);

    // Extract content
    const content = extractArticleContent($);

    // Extract published date
    const publishedDate = $('meta[property="article:published_time"]').attr('content') ||
                         $('meta[name="publish-date"]').attr('content') ||
                         $('time').attr('datetime') ||
                         undefined;

    // Extract author
    const author = $('meta[property="article:author"]').attr('content') ||
                  $('meta[name="author"]').attr('content') ||
                  $('.author').text() ||
                  undefined;

    // Extract tags
    const tags = extractTags($);

    return {
      title: title.trim(),
      description: description.trim(),
      image,
      content: content.trim(),
      publishedDate,
      author,
      tags
    };
  } catch (error) {
    console.error('Article scraping error:', error);
    throw new Error(`Failed to scrape article: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract the best available image from the page
 */
function extractBestImage($: cheerio.CheerioAPI): ScrapedImage | null {
  // Try Open Graph image first
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (ogImage && isValidImageUrl(ogImage)) {
    return {
      url: ogImage,
      source: 'og:image',
      width: parseInt($('meta[property="og:image:width"]').attr('content') || '0'),
      height: parseInt($('meta[property="og:image:height"]').attr('content') || '0')
    };
  }

  // Try Twitter image
  const twitterImage = $('meta[name="twitter:image"]').attr('content');
  if (twitterImage && isValidImageUrl(twitterImage)) {
    return {
      url: twitterImage,
      source: 'twitter:image'
    };
  }

  // Try first image in article content
  const contentImages = $('article img, .content img, .post-content img, main img');
  for (let i = 0; i < contentImages.length; i++) {
    const img = contentImages.eq(i);
    const src = img.attr('src') || img.attr('data-src');
    if (src && isValidImageUrl(src)) {
      return {
        url: makeAbsoluteUrl(src, $('base').attr('href') || ''),
        alt: img.attr('alt'),
        width: parseInt(img.attr('width') || '0'),
        height: parseInt(img.attr('height') || '0'),
        source: 'content-img'
      };
    }
  }

  // Try any image on the page
  const allImages = $('img');
  for (let i = 0; i < allImages.length; i++) {
    const img = allImages.eq(i);
    const src = img.attr('src') || img.attr('data-src');
    if (src && isValidImageUrl(src) && !isIconOrLogo(src)) {
      return {
        url: makeAbsoluteUrl(src, $('base').attr('href') || ''),
        alt: img.attr('alt'),
        source: 'first-img'
      };
    }
  }

  return null;
}

/**
 * Extract article content text
 */
function extractArticleContent($: cheerio.CheerioAPI): string {
  // Try common article selectors
  const selectors = [
    'article',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    'main',
    '.story-body',
    '.article-body'
  ];

  for (const selector of selectors) {
    const element = $(selector);
    if (element.length > 0) {
      // Remove unwanted elements
      element.find('script, style, nav, header, footer, aside, .ad, .advertisement').remove();
      const text = element.text();
      if (text.length > 100) {
        return text;
      }
    }
  }

  // Fallback to all paragraphs
  const paragraphs = $('p').map((_, el) => $(el).text()).get();
  return paragraphs.join('\n');
}

/**
 * Extract tags and keywords
 */
function extractTags($: cheerio.CheerioAPI): string[] {
  const tags: string[] = [];

  // Meta keywords
  const keywords = $('meta[name="keywords"]').attr('content');
  if (keywords) {
    tags.push(...keywords.split(',').map(k => k.trim()));
  }

  // Article tags
  $('.tag, .tags a, .category, .categories a').each((_, el) => {
    const tag = $(el).text().trim();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
    }
  });

  return tags.slice(0, 10); // Limit to 10 tags
}

/**
 * Validate if URL is a valid image
 */
function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
  const hasImageExtension = imageExtensions.test(url);
  const isDataUrl = url.startsWith('data:image/');
  const isHttpUrl = url.startsWith('http://') || url.startsWith('https://');
  
  return (hasImageExtension || isDataUrl) && (isDataUrl || isHttpUrl);
}

/**
 * Check if image is likely an icon or logo
 */
function isIconOrLogo(url: string): boolean {
  const iconKeywords = ['icon', 'logo', 'favicon', 'avatar', 'profile'];
  return iconKeywords.some(keyword => url.toLowerCase().includes(keyword));
}

/**
 * Convert relative URL to absolute
 */
function makeAbsoluteUrl(url: string, base: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  
  try {
    return new URL(url, base).href;
  } catch {
    return url;
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