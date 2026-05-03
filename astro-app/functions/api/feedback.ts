// Cloudflare Pages Function - EmailJS proxy
// Keeps credentials server-side, away from client code

interface FeedbackRequest {
  type: string
  message: string
  email?: string
  from_name?: string
}

export const onRequestPost: PagesFunction = async (context) => {
  const { request, env } = context

  const EMAILJS_SERVICE_ID = env.EMAILJS_SERVICE_ID
  const EMAILJS_TEMPLATE_ID = env.EMAILJS_TEMPLATE_ID
  const EMAILJS_PUBLIC_KEY = env.EMAILJS_PUBLIC_KEY

  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    return new Response(JSON.stringify({ error: 'Feedback service not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: FeedbackRequest
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.message?.trim()) {
    return new Response(JSON.stringify({ error: 'Message is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          from_email: body.email || 'anonymous@ruleword.com',
          from_name: body.from_name || 'RuleWord User',
          message_type: body.type || 'Feedback',
          message: body.message,
          reply_to: body.email || 'Not provided',
          submit_time: new Date().toISOString(),
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`EmailJS returned ${response.status}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to send feedback' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
