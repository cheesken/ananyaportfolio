import { readFileSync } from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'http'

// Load .env into process.env for server-side plugin use
try {
  const envFile = readFileSync('.env', 'utf-8')
  for (const line of envFile.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (match) process.env[match[1].trim()] = match[2].trim()
  }
} catch { /* .env may not exist */ }

function contactApiPlugin(): Plugin {
  return {
    name: 'contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', async (req: IncomingMessage, res: ServerResponse) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk: Buffer) => { body += chunk })
        req.on('end', async () => {
          try {
            const { name, email, message } = JSON.parse(body)

            if (!name || !email || !message) {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'All fields are required' }))
              return
            }

            const { Resend } = await import('resend')
            const resend = new Resend(process.env.RESEND_API_KEY)

            await resend.emails.send({
              from: 'Portfolio Contact <onboarding@resend.dev>',
              to: process.env.CONTACT_EMAIL!,
              replyTo: email,
              subject: `Portfolio message from ${name}`,
              text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
            })

            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ ok: true }))
          } catch (err) {
            console.error('Contact API error:', err)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to send email' }))
          }
        })
      })
    },
  }
}

function leaderboardApiPlugin(): Plugin {
  const store = new Map<string, { score: number; member: string }[]>()
  const MAX = 10
  const VALID = ['snake', 'bricks', 'dino', 'bounce']

  return {
    name: 'leaderboard-api',
    configureServer(server) {
      server.middlewares.use('/api/leaderboard', (req: IncomingMessage, res: ServerResponse) => {
        res.setHeader('Content-Type', 'application/json')

        if (req.method === 'GET') {
          const url = new URL(req.url ?? '', 'http://localhost')
          const game = url.searchParams.get('game')
          if (!game || !VALID.includes(game)) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'Invalid game' }))
            return
          }
          const entries = (store.get(game) ?? []).slice(0, MAX).map(e => JSON.parse(e.member))
          res.end(JSON.stringify({ entries }))
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: Buffer) => { body += chunk })
          req.on('end', () => {
            try {
              const { game, name, score } = JSON.parse(body)
              if (!VALID.includes(game) || !/^[A-Z]{3}$/.test(name) ||
                  typeof score !== 'number' || score < 1) {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid data' }))
                return
              }
              const entry = { name, score, ts: Date.now() }
              const list = store.get(game) ?? []
              list.push({ score, member: JSON.stringify(entry) })
              list.sort((a, b) => b.score - a.score)
              store.set(game, list.slice(0, MAX))
              res.end(JSON.stringify({ ok: true }))
            } catch {
              res.statusCode = 400
              res.end(JSON.stringify({ error: 'Bad JSON' }))
            }
          })
          return
        }

        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method not allowed' }))
      })
    },
  }
}

export default defineConfig({
  plugins: [contactApiPlugin(), leaderboardApiPlugin(), react(), tailwindcss()],
  envPrefix: ['VITE_', 'RESEND_', 'CONTACT_'],
})
