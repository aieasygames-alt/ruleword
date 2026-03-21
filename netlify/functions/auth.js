// Netlify Function for GitHub OAuth Proxy
// This handles the OAuth flow for Decap CMS

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || ''

export async function handler(event, context) {
  const path = event.path.replace('/.netlify/functions/auth', '')

  // Handle OAuth callback
  if (path.startsWith('/callback')) {
    const code = event.queryStringParameters.code
    const state = event.queryStringParameters.state

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code,
          state: state,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: tokenData.error }),
        }
      }

      // Return token to CMS
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          token: tokenData.access_token,
          provider: 'github',
        }),
      }
    } catch (error) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to exchange token' }),
      }
    }
  }

  // Handle metadata endpoint
  if (path === '/metadata') {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user:email&state=${Math.random().toString(36).substring(7)}`

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        auth_url: authUrl,
        state: Math.random().toString(36).substring(7),
      }),
    }
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ error: 'Not found' }),
  }
}
