export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,X-Session-Id,User-Agent')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const { path } = req.query
  if (!path) return res.status(400).json({ message: 'path query required' })

  const target = `https://react-channelwa.vercel.app/api/${path}`

  try {
    const response = await fetch(target, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
        ...(req.headers['x-session-id'] && { 'X-Session-Id': req.headers['x-session-id'] })
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    res.status(500).json({ message: err.message || 'Proxy error' })
  }
}
