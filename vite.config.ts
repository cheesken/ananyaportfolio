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

export default defineConfig({
  plugins: [contactApiPlugin(), react(), tailwindcss()],
  envPrefix: ['VITE_', 'RESEND_', 'CONTACT_'],
})
