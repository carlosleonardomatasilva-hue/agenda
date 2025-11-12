const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))
 
app.use(express.json())

morgan.token('body', req => req.method === 'POST' ? JSON.stringify(req.body) : '-');

app.use(morgan('tiny', { skip: req => req.method === 'POST' }));

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body', {
    skip: req => req.method !== 'POST'
  })
);
 
let persons = [
  { id: 1, name: 'Arto Hellas', number: '040-123456' },
  { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
  { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
]
 
app.get('/api/persons', (request, response) => {
  response.json(persons)
})
 
app.get('/info', (request, response) => {
  const info = `
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `
  response.send(info)
})
 
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(p => p.id === id)
 
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
 
app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)
  response.status(204).end()
})
 
app.post('/api/persons', (request, response) => {
  const body = request.body
 
  if (!body.name) {
    return response.status(400).json({ error: 'name is missing' })
  }
 
   if (!body.number) {
    return response.status(400).json({ error: 'number is missing' })
  }
 
  const nameExists = persons.some(p => p.name.trim().toLowerCase() === body.name.toLowerCase())
  if (nameExists) {
    return response.status(409).json({ error: 'el nombre no debe repetirse' })
  }
 
  const person = {
    id: Math.floor(Math.random() * 1000000),
    name: body.name,
    number: body.number
  }
 
  persons = persons.concat(person)
  response.json(person)
})

app.put('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'name and number required' })
  }

  const idx = persons.findIndex(p => p.id === id)
  if (idx === -1) return res.status(404).json({ error: 'person not found' })

  const duplicate = persons.some(
    p => p.id !== id && p.name.trim().toLowerCase() === name.trim().toLowerCase()
  )
  if (duplicate) return res.status(409).json({ error: 'el nombre no debe repetirse' })

  persons[idx] = { id, name: name.trim(), number: number.trim() }
  res.json(persons[idx])
})
 
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
 