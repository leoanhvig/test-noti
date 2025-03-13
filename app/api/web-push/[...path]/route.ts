import { NextRequest } from 'next/server';
import webpush, { PushSubscription } from 'web-push';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails('mailto:mail@example.com', vapidPublicKey, vapidPrivateKey);

let subscription: PushSubscription;

export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  switch (pathname) {
    case '/api/web-push/subscription':
      return setSubscription(request);
    case '/api/web-push/send':
      return sendPush(request);
    default:
      return notFoundApi();
  }
}

async function setSubscription(request: { url?: string | URL; json?: any }) {
  const body: { subscription: PushSubscription } = await request.json();
  subscription = body.subscription;
  return new Response(JSON.stringify({ message: 'Subscription set.' }), {});
}

async function sendPush(request: { url?: string | URL; json?: any }) {
  await setSubscription(request);
  const body = await request.json();
  const pushPayload = JSON.stringify(body);
  if (!subscription) {
    return new Response(JSON.stringify({ error: 'Subscription not found' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 404,
    });
  }
  await webpush.sendNotification(subscription, pushPayload);
  return new Response(JSON.stringify({ message: 'Push sent.' }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

async function notFoundApi() {
  return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
    headers: { 'Content-Type': 'application/json' },
    status: 404,
  });
}
