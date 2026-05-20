import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createRequire } from 'node:module'
import { defineConfig, loadEnv } from 'vite'

const require = createRequire(import.meta.url)
const { createAssistantAnswer } = require('./api/assistant-core.cjs')
const { identifyProductFromImage } = require('./api/product-identify-core.cjs')

const readJsonBody = (request: { on: (event: string, callback: (chunk?: Buffer) => void) => void }) =>
  new Promise((resolve, reject) => {
    let rawBody = ''

    request.on('data', (chunk) => {
      rawBody += chunk?.toString() ?? ''
    })
    request.on('end', () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {})
      } catch (error) {
        reject(error)
      }
    })
    request.on('error', reject)
  })

const getPublicApiError = (error: unknown) => {
  const message = error instanceof Error ? error.message : 'Erro inesperado.'

  if (/quota|billing|plan/i.test(message)) {
    return 'A chave da OpenAI esta sem quota ou com faturamento indisponivel. Verifique billing/creditos da conta.'
  }

  return message
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, env)

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        configureServer(server) {
          server.middlewares.use('/api/product-identify', async (request, response) => {
            response.setHeader('Content-Type', 'application/json; charset=utf-8')

            if (request.method !== 'POST') {
              response.statusCode = 405
              response.end(JSON.stringify({ error: 'Metodo nao permitido.' }))
              return
            }

            try {
              const body = await readJsonBody(request)
              const result = await identifyProductFromImage(body)

              response.statusCode = result.missingKey || result.invalidImage ? 400 : 200
              response.end(JSON.stringify(result))
            } catch (error) {
              response.statusCode = 502
              response.end(
                JSON.stringify({
                  error: getPublicApiError(error),
                }),
              )
            }
          })

          server.middlewares.use('/api/assistant', async (request, response) => {
            response.setHeader('Content-Type', 'application/json; charset=utf-8')

            if (request.method !== 'POST') {
              response.statusCode = 405
              response.end(JSON.stringify({ error: 'Metodo nao permitido.' }))
              return
            }

            try {
              const body = await readJsonBody(request)
              const result = await createAssistantAnswer(body)

              response.statusCode = result.missingKey ? 503 : 200
              response.end(JSON.stringify(result))
            } catch (error) {
              response.statusCode = 502
              response.end(
                JSON.stringify({
                  answer: 'O assistente ficou indisponivel por um instante. Tente novamente em alguns segundos.',
                  error: error instanceof Error ? error.message : 'Erro inesperado.',
                }),
              )
            }
          })
        },
        name: 'assistant-dev-api',
      },
    ],
  }
})
