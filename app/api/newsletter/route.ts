const buttondownEndpoint = 'https://api.buttondown.email/v1/subscribers'

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return Response.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const email =
    typeof payload === 'object' && payload !== null && 'email' in payload
      ? payload.email
      : undefined
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'A valid email address is required.' }, { status: 400 })
  }

  const apiKey = process.env.BUTTONDOWN_API_KEY
  if (!apiKey) {
    console.error('Newsletter subscription is not configured: BUTTONDOWN_API_KEY is missing.')
    return Response.json({ error: 'Newsletter subscriptions are not configured.' }, { status: 503 })
  }

  const response = await fetch(buttondownEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (!response.ok) {
    console.error(`Newsletter provider rejected the subscription with status ${response.status}.`)
    return Response.json({ error: 'The newsletter provider could not accept the subscription.' }, { status: 502 })
  }

  return Response.json({ success: true })
}

export function GET() {
  return Response.json({ error: 'Use POST to subscribe.' }, { status: 405 })
}
