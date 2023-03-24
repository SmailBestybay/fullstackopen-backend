require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
const cors = require('cors')

app.use(express.static('build'))
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
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
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

  const person = new Person({
    name: request.body.name,
    number: request.body.number
  })

  person
    .save()
    .then(savedPerson => {
      response.json(savedPerson)
    })

})

app.get('/api/persons/:id', (request, response) => {
  Person
    .findById(request.params.id)
    .then(person => {
      response.json(person)
    })
    .catch(error => {
      response.status(404).end()
    })
})

app.get('/api/info', (request, response) => {
  const entries = `Phonebook has info for ${persons.length} people`
  const recievedOn = new Date()
  response.send(`${entries} <br> ${recievedOn}`)
})

app.delete('/api/persons/:id', (request, response) => {
  Person
    .findByIdAndDelete(request.params.id)
    .then(success => {
      response.status(204).end()
    })
})

const PORT = process.env.PORT
app.listen(PORT , () => {
  console.log(`Server running on port ${PORT}`)
})