import cors from 'cors'
import express from 'express'

const app = express()
const port = process.env.PORT || 3000

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
