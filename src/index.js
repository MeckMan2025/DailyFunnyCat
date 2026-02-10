const MECKMAN_STYLES = `
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #000000;
    color: #FFFFFF;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
    line-height: 1.7;
    padding: 80px 20px;
  }
  .container {
    max-width: 680px;
    margin: 0 auto;
  }
  .panel {
    background: #2A2A2A;
    border: 1px solid rgba(255, 242, 204, 0.2);
    border-radius: 12px;
    padding: 48px 40px;
  }
  h1 {
    font-size: 1.8rem;
    font-weight: 600;
    letter-spacing: -0.02em;
    margin-bottom: 8px;
  }
  h1 .accent-line {
    display: block;
    width: 40px;
    height: 2px;
    background: #CC0000;
    margin: 12px 0 0 0;
  }
  .subtitle {
    color: #CCCCCC;
    font-size: 0.9rem;
    margin-bottom: 40px;
  }
  h2 {
    font-size: 1.05rem;
    font-weight: 600;
    color: #FFF2CC;
    margin-top: 32px;
    margin-bottom: 12px;
  }
  p {
    color: #CCCCCC;
    font-size: 0.95rem;
    margin-bottom: 16px;
  }
  a {
    color: #FFF2CC;
    text-decoration: none;
    transition: color 0.2s;
  }
  a:hover { color: #CC0000; }
  .divider {
    text-align: center;
    margin: 32px 0;
    color: rgba(255, 242, 204, 0.2);
    font-size: 0.6rem;
    letter-spacing: 8px;
  }
  .nav {
    margin-top: 40px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 242, 204, 0.1);
    display: flex;
    gap: 24px;
  }
  .nav a {
    font-size: 0.85rem;
    color: #CCCCCC;
  }
  .nav a:hover { color: #CC0000; }
  .route-card {
    background: #000000;
    border: 1px solid rgba(255, 242, 204, 0.15);
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 12px;
  }
  .route-card code {
    color: #FFF2CC;
    font-size: 0.95rem;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .route-card p {
    margin-bottom: 0;
    margin-top: 6px;
    font-size: 0.85rem;
  }
  .gallery {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 32px;
  }
  @media (max-width: 560px) {
    .gallery { grid-template-columns: 1fr; }
  }
  .gallery-card {
    background: #000000;
    border: 1px solid rgba(255, 242, 204, 0.15);
    border-radius: 8px;
    overflow: hidden;
  }
  .gallery-card img {
    width: 100%;
    display: block;
  }
  .gallery-card .caption {
    padding: 10px 14px;
    font-size: 0.8rem;
    color: #CCCCCC;
  }
  .empty-state {
    text-align: center;
    padding: 48px 0;
    color: #666666;
    font-size: 0.95rem;
  }
</style>`;

function pageNav(current) {
	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/privacy', label: 'Privacy' },
		{ href: '/terms', label: 'Terms' },
	];
	return '<div class="nav">' + links
		.filter(l => l.href !== current)
		.map(l => `<a href="${l.href}">${l.label}</a>`)
		.join('') + '</div>';
}

function htmlPage(title, body, currentPath) {
	return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><link rel="manifest" href="/manifest.json"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="icon" type="image/png" href="/apple-touch-icon.png"><meta name="theme-color" content="#000000"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black">${MECKMAN_STYLES}</head><body><div class="container"><div class="panel">${body}${pageNav(currentPath)}</div></div></body></html>`;
}

const CAT_PROMPTS = [
	'a fluffy orange cat dressed as a pirate standing on a cardboard ship, funny, cute, photorealistic',
	'a cat astronaut floating in space reaching for a ball of yarn, funny, cute, photorealistic',
	'a cat wearing a tiny business suit sitting at a desk with a laptop looking stressed, funny, cute, photorealistic',
	'a cat dressed as a chef cooking a fish in a tiny kitchen, funny, cute, photorealistic',
	'a cat wearing sunglasses DJing at a turntable at a rooftop party, funny, cute, photorealistic',
	'a cat in a superhero cape flying over a city skyline, funny, cute, photorealistic',
	'a cat dressed as a cowboy riding a roomba through a living room, funny, cute, photorealistic',
	'a cat sitting on a throne wearing a golden crown looking majestic, funny, cute, photorealistic',
	'a cat dressed as a scientist with goggles mixing colorful potions in a lab, funny, cute, photorealistic',
	'a cat as a medieval knight jousting against a cucumber, funny, cute, photorealistic',
	'a cat wearing a tiny raincoat and boots splashing in a puddle, funny, cute, photorealistic',
	'a cat dressed as sherlock holmes with a magnifying glass investigating a knocked over vase, funny, cute, photorealistic',
	'a cat in a spacesuit planting a flag on the moon that has a fish on it, funny, cute, photorealistic',
	'a cat dressed as a lifeguard sitting in a high chair watching rubber ducks in a bathtub, funny, cute, photorealistic',
	'a cat wearing a beret painting a self-portrait on a tiny easel, funny, cute, photorealistic',
];

function pickPrompt() {
	return CAT_PROMPTS[Math.floor(Math.random() * CAT_PROMPTS.length)];
}

async function generateCatImage(ai) {
	const prompt = pickPrompt();
	console.log(`Generating image with prompt: ${prompt}`);

	const response = await ai.run('@cf/bytedance/stable-diffusion-xl-lightning', {
		prompt,
		num_steps: 4,
	});

	// response is a ReadableStream of PNG bytes
	const arrayBuffer = await new Response(response).arrayBuffer();
	return { imageData: new Uint8Array(arrayBuffer), prompt };
}

async function storeImageInR2(bucket, imageData, prompt) {
	const now = new Date();
	const date = now.toISOString().split('T')[0];
	const rand = Math.random().toString(36).substring(2, 8);
	const key = `cats/${date}-${rand}.png`;

	await bucket.put(key, imageData, {
		httpMetadata: { contentType: 'image/png' },
		customMetadata: { prompt: prompt || '' },
	});

	console.log(`Stored image at: ${key}`);
	return key;
}

function getPublicUrl(workerUrl, key) {
	return `${workerUrl}/image/${key}`;
}

async function sendMMS(env, imageUrl, toPhone) {
	const sid = env.TWILIO_ACCOUNT_SID;
	const token = env.TWILIO_AUTH_TOKEN;
	const from = env.TWILIO_PHONE_FROM;

	const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
	const auth = btoa(`${sid}:${token}`);

	const body = new URLSearchParams({
		From: from,
		To: toPhone,
		Body: '🐱 Your daily funny cat!',
		MediaUrl: imageUrl,
	});

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			Authorization: `Basic ${auth}`,
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body,
	});

	const result = await response.json();
	if (!response.ok) {
		throw new Error(`Twilio error (${toPhone}): ${result.message}`);
	}

	console.log(`MMS sent to ${toPhone}: SID ${result.sid}`);
	return result;
}

async function runDailyCat(env, workerUrl) {
	// 1. Generate the image
	const { imageData, prompt } = await generateCatImage(env.AI);

	// 2. Store in R2
	const key = await storeImageInR2(env.BUCKET, imageData, prompt);
	const imageUrl = getPublicUrl(workerUrl, key);
	console.log(`Public URL: ${imageUrl}`);

	// 3. Send MMS to recipient
	await sendMMS(env, imageUrl, env.TWILIO_PHONE_TO_1);

	return { imageUrl, prompt };
}

export default {
	// Cron trigger handler — runs daily at 7am EST
	async scheduled(event, env, ctx) {
		const workerUrl = 'https://cat.meckman.org';
		ctx.waitUntil(runDailyCat(env, workerUrl));
	},

	// HTTP handler — for testing and previewing
	async fetch(request, env) {
		const url = new URL(request.url);
		const workerUrl = url.origin;

		// Serve images from R2 for Twilio to fetch
		if (url.pathname.startsWith('/image/')) {
			const key = url.pathname.replace('/image/', '');
			const object = await env.BUCKET.get(key);
			if (!object) {
				return new Response('Not found', { status: 404 });
			}
			return new Response(object.body, {
				headers: {
					'Content-Type': 'image/png',
					'Content-Length': object.size.toString(),
				},
			});
		}

		if (url.pathname === '/privacy') {
			return new Response(
				htmlPage('DailyFunnyCat — Privacy Policy', `
<h1>Privacy Policy<span class="accent-line"></span></h1>
<p class="subtitle">Last updated: February 9, 2026</p>
<h2>What We Collect</h2>
<p>DailyFunnyCat collects only the phone numbers of consenting recipients for the sole purpose of delivering daily cat images via MMS.</p>
<div class="divider">---</div>
<h2>How We Use Your Information</h2>
<p>Phone numbers are used exclusively to send one AI-generated cat image per day. We do not sell, share, or disclose your phone number to any third parties.</p>
<div class="divider">---</div>
<h2>Third-Party Services</h2>
<p>We use Twilio to deliver MMS messages. Your phone number is shared with Twilio solely for message delivery. See <a href="https://www.twilio.com/legal/privacy">Twilio's Privacy Policy</a>.</p>
<div class="divider">---</div>
<h2>Data Storage</h2>
<p>Phone numbers are stored securely as encrypted environment variables. Generated images are stored in Cloudflare R2.</p>
<div class="divider">---</div>
<h2>Opting Out</h2>
<p>You may stop receiving messages at any time by replying <strong style="color:#FFFFFF">STOP</strong> to any message.</p>
<div class="divider">---</div>
<h2>Contact</h2>
<p>For questions about this policy, contact the project owner directly.</p>
`, '/privacy'),
				{ headers: { 'Content-Type': 'text/html' } }
			);
		}

		if (url.pathname === '/terms') {
			return new Response(
				htmlPage('DailyFunnyCat — Terms and Conditions', `
<h1>Terms and Conditions<span class="accent-line"></span></h1>
<p class="subtitle">Last updated: February 9, 2026</p>
<h2>Program Name</h2>
<p><strong style="color:#FFFFFF">DailyFunnyCat</strong> — a daily AI-generated funny cat image delivery service.</p>
<div class="divider">---</div>
<h2>Program Description</h2>
<p>DailyFunnyCat sends one AI-generated funny cat image per day via MMS to opted-in recipients. Images are created using AI image generation and delivered to your mobile phone.</p>
<div class="divider">---</div>
<h2>Message Frequency</h2>
<p>You will receive <strong style="color:#FFFFFF">1 message per day</strong>, sent at approximately 7:00 AM EST.</p>
<div class="divider">---</div>
<h2>Message and Data Rates</h2>
<p>Message and data rates may apply. Please check with your mobile carrier for details on messaging and data charges.</p>
<div class="divider">---</div>
<h2>Opt-In</h2>
<p>By providing your phone number to DailyFunnyCat, you consent to receive one automated MMS message per day containing an AI-generated cat image. Consent is not a condition of any purchase.</p>
<div class="divider">---</div>
<h2>Opt-Out</h2>
<p>You can opt out at any time by replying <strong style="color:#FFFFFF">STOP</strong> to any message you receive. You will receive a confirmation message and no further messages will be sent.</p>
<div class="divider">---</div>
<h2>Help</h2>
<p>For support, reply <strong style="color:#FFFFFF">HELP</strong> to any message, or contact the project owner directly.</p>
<div class="divider">---</div>
<h2>Liability</h2>
<p>DailyFunnyCat is provided as-is. We are not responsible for any charges from your mobile carrier related to receiving MMS messages.</p>
<div class="divider">---</div>
<h2>Privacy</h2>
<p>See our <a href="/privacy">Privacy Policy</a> for details on data collection and usage.</p>
`, '/terms'),
				{ headers: { 'Content-Type': 'text/html' } }
			);
		}

		if (url.pathname === '/preview' || url.pathname === '/trigger') {
			// Auth check — require secret key
			if (url.searchParams.get('key') !== env.TRIGGER_KEY) {
				return new Response('Unauthorized', { status: 401 });
			}

			if (url.pathname === '/preview') {
				const customPrompt = url.searchParams.get('prompt');
				let result;
				if (customPrompt) {
					const response = await env.AI.run('@cf/bytedance/stable-diffusion-xl-lightning', {
						prompt: customPrompt,
						num_steps: 4,
					});
					const arrayBuffer = await new Response(response).arrayBuffer();
					result = { imageData: new Uint8Array(arrayBuffer), prompt: customPrompt };
				} else {
					result = await generateCatImage(env.AI);
				}
				return new Response(result.imageData, {
					headers: { 'Content-Type': 'image/jpeg' },
				});
			}

			// /trigger — full flow: generate, store, send MMS
			const { imageUrl, prompt } = await runDailyCat(env, workerUrl);
			return Response.json({ ok: true, imageUrl, prompt });
		}

		// Home page — gallery of all generated cat images
		const listed = await env.BUCKET.list({ prefix: 'cats/' });
		const images = listed.objects.sort((a, b) => b.key.localeCompare(a.key));

		let galleryHtml = '';
		if (images.length === 0) {
			galleryHtml = '<div class="empty-state">No cat images yet. The first one arrives tomorrow at 7:00 AM EST!</div>';
		} else {
			galleryHtml = '<div class="gallery">';
			for (const obj of images) {
				const dateMatch = obj.key.match(/cats\/(\d{4}-\d{2}-\d{2})/);
				const dateLabel = dateMatch ? dateMatch[1] : '';
				galleryHtml += `<div class="gallery-card"><a href="/image/${obj.key}"><img src="/image/${obj.key}" alt="Daily cat - ${dateLabel}" loading="lazy"></a><div class="caption">${dateLabel}</div></div>`;
			}
			galleryHtml += '</div>';
		}

		return new Response(
			htmlPage('DailyFunnyCat', `
<h1>DailyFunnyCat<span class="accent-line"></span></h1>
<p class="subtitle">AI-generated funny cat images, delivered daily via MMS.</p>
${galleryHtml}
`, '/'),
			{ headers: { 'Content-Type': 'text/html' } }
		);
	},
};
