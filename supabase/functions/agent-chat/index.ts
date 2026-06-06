import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.24.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }

  try {
    const apiKey = Deno.env.get('GEMINI_API_KEY')

    if (!apiKey) {
      return Response.json(
        {
          error: 'Missing GEMINI_API_KEY secret.',
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      )
    }

    const { message, history = [] } = (await request.json()) as {
      message?: string
      history?: ChatMessage[]
    }

    if (!message?.trim()) {
      return Response.json(
        {
          error: 'Message is required.',
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `
You are the website assistant for Aureate Creations.

Your role:
- Help website visitors understand the company, services, portfolio, contact process, and consultation options.
- Be warm, professional, concise, and helpful.
- Encourage users to use the contact page when they want pricing, booking, timelines, or detailed project discussions.
- Do not claim that a consultation is booked unless the user actually submitted a form through the website.
- Do not invent specific prices, unavailable dates, private client details, or internal company information.
- If you are unsure, say so and suggest contacting Aureate Creations directly.

Business context:
Aureate Creations is an architecture and design-focused website with services, portfolio work, contact options, and a client portal.
The website includes public pages for home, about, services, portfolio, and contact.
`,
    })

    const recentHistory = Array.isArray(history) ? history.slice(-8) : []

    const prompt = `
Conversation so far:
${recentHistory
  .map((item) => `${item.role === 'user' ? 'Visitor' : 'Assistant'}: ${item.content}`)
  .join('\n')}

Visitor's latest question:
${message}

Reply as the Aureate Creations website assistant.
`

    const result = await model.generateContent(prompt)
    const reply = result.response.text()

    return Response.json(
      {
        reply,
      },
      {
        headers: corsHeaders,
      }
    )
  } catch (error) {
    console.error('Agent function error:', error)

    return Response.json(
      {
        error: 'Failed to generate assistant response.',
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    )
  }
})