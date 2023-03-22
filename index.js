const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')

app.use(express.json())
app.use(cors())

morgan.token('req-body', (request) =>  JSON.stringify(request.body))
app.use(morgan(
  ':method :url request body: :req-body',
  {
    skip: request => request.method !== "POST",
    immediate: true
  }
))
app.use(morgan('tiny'))

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Welcome to Phonebook!</h1>')
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

const generateId = () => {
  const min = persons.length
  const max = persons.length + 1000;
  return Math.floor((Math.random() * (max - min) + min))
}

app.post('/api/persons', (request, response) => {

  if(!request.body.name) {
    return response.status(400).json({error: 'name missing'})
  }
  
  if(!request.body.number) {
    return response.status(400).json({error: 'number missing'})
  }

  if (persons.find(person => person.name === request.body.name)) {
    return response.status(400).json({error: 'name must be unique'})
  }

  const person = request.body
  person.id = generateId()
  persons = persons.concat(person)
  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.get('/api/info', (request, response) => {
  const entries = `Phonebook has info for ${persons.length} people`
  const recievedOn = new Date()
  response.send(`${entries} <br> ${recievedOn}`)
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT , () => {
  console.log(`Server running on port ${PORT}`)
})