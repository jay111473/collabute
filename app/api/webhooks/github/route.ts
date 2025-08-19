import { NextRequest } from 'next/server';
import { verifyGitHubWebhook } from '@/lib/github-webhook-verify';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

/**
 * GitHub Webhook Handler
 * Receives webhook events from GitHub and queues them for processing
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');
    const event = request.headers.get('x-github-event');
    const deliveryId = request.headers.get('x-github-delivery');

    // Verify webhook signature
    if (!verifyGitHubWebhook(body, signature)) {
      console.error('Invalid webhook signature');
      return Response.json(
        { error: 'Invalid signature' }, 
        { status: 401 }
      );
    }

    // Parse the payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return Response.json(
        { error: 'Invalid JSON payload' }, 
        { status: 400 }
      );
    }

    // Log the webhook for debugging
    console.log(`GitHub webhook received: ${event} (${deliveryId})`, {
      action: payload.action,
      repository: payload.repository?.full_name,
      issue: payload.issue?.number,
    });

    // Queue the webhook for processing
    await convex.mutation(api.githubWebhook.queueWebhookProcessing, {
      event: event || 'unknown',
      payload,
      timestamp: Date.now(),
      deliveryId: deliveryId || undefined,
    });

    return Response.json({ 
      received: true,
      event,
      deliveryId,
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json(
      { error: 'Processing failed' }, 
      { status: 500 }
    );
  }
}

/**
 * GET handler for webhook health check
 */
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: Date.now(),
    service: 'github-webhook-handler',
  });
}