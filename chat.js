export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Check API key exists
  const apiKey = process.env.ANTHROPIC_API_KEY;
  console.log('API key present:', !!apiKey);
  console.log('API key prefix:', apiKey ? apiKey.slice(0, 12) : 'MISSING');

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in environment variables' });
  }

  try {
    const { messages } = req.body;
    console.log('Calling Anthropic with', messages?.length, 'messages');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        messages,
      }),
    });

    console.log('Anthropic status:', response.status);
    const data = await response.json();
    console.log('Anthropic response type:', data.type, 'content length:', data.content?.length);

    return res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
