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

async function storeImageInR2(bucket, imageData) {
	const now = new Date();
	const date = now.toISOString().split('T')[0];
	const rand = Math.random().toString(36).substring(2, 8);
	const key = `cats/${date}-${rand}.png`;

	await bucket.put(key, imageData, {
		httpMetadata: { contentType: 'image/png' },
	});

	console.log(`Stored image at: ${key}`);
	return key;
}

function getPublicUrl(env, key) {
	return `${env.R2_PUBLIC_URL}/${key}`;
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

async function runDailyCat(env) {
	// 1. Generate the image
	const { imageData, prompt } = await generateCatImage(env.AI);

	// 2. Store in R2
	const key = await storeImageInR2(env.BUCKET, imageData);
	const imageUrl = getPublicUrl(env, key);
	console.log(`Public URL: ${imageUrl}`);

	// 3. Send MMS to recipient
	await sendMMS(env, imageUrl, env.TWILIO_PHONE_TO_1);

	return { imageUrl, prompt };
}

export default {
	// Cron trigger handler — runs daily at 7am EST
	async scheduled(event, env, ctx) {
		ctx.waitUntil(runDailyCat(env));
	},

	// HTTP handler — for testing and previewing
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/preview') {
			// Generate a cat image and return it directly (no MMS)
			const { imageData } = await generateCatImage(env.AI);
			return new Response(imageData, {
				headers: { 'Content-Type': 'image/png' },
			});
		}

		if (url.pathname === '/trigger') {
			// Full flow: generate, store, send MMS
			const { imageUrl, prompt } = await runDailyCat(env);
			return Response.json({ ok: true, imageUrl, prompt });
		}

		return new Response(
			'DailyFunnyCat\n\nGET /preview  — generate and view a cat image\nGET /trigger  — full flow (generate + store + MMS)\n',
			{ headers: { 'Content-Type': 'text/plain' } }
		);
	},
};
