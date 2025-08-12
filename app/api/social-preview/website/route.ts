import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL is required' },
      { status: 400 }
    );
  }

  // Validate URL format
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid protocol');
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Collabute-Bot/1.0)',
      },
      // Timeout after 10 seconds
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch website' },
        { status: response.status }
      );
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract metadata
    const getMetaContent = (name: string, property?: string) => {
      const selector = property 
        ? `meta[property="${property}"]` 
        : `meta[name="${name}"]`;
      const element = document.querySelector(selector);
      return element?.getAttribute('content') || '';
    };

    const title = 
      getMetaContent('', 'og:title') ||
      getMetaContent('twitter:title') ||
      document.querySelector('title')?.textContent ||
      '';

    const description = 
      getMetaContent('', 'og:description') ||
      getMetaContent('twitter:description') ||
      getMetaContent('description') ||
      '';

    const image = 
      getMetaContent('', 'og:image') ||
      getMetaContent('twitter:image') ||
      '';

    const domain = new URL(url).hostname;
    const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    const metadata = {
      title: title.trim().substring(0, 100), // Limit title length
      description: description.trim().substring(0, 200), // Limit description length
      image: image || '',
      favicon,
      url,
      domain
    };

    return NextResponse.json(metadata, {
      headers: {
        // Cache for 6 hours
        'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400'
      }
    });

  } catch (error) {
    console.error('Website metadata extraction error:', error);
    
    // Fallback response with basic info
    const domain = new URL(url).hostname;
    const fallbackMetadata = {
      title: `Portfolio - ${domain}`,
      description: 'Personal portfolio and professional showcase',
      image: '',
      favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
      url,
      domain
    };

    return NextResponse.json(fallbackMetadata, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    });
  }
}
