require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
const cors = require('cors')

morgan.token('req-body', (request) =>  JSON.stringify(request.body))

app.use(express.static('build'))
app.use(express.json())
app.use(morgan(
  ':method :url request body: :req-body',
  {
    skip: request => request.method !== "POST",
    immediate: true
  }
))
app.use(morgan('tiny'))
app.use(cors())

app.get('/api/persons', (request, response) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
})

app.post('/api/persons', (request, response, next) => {

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
    .catch(error => next(error))

})

app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.get('/api/info', (request, response) => {
  Person
    .find({})
    .then(persons => {
      const entries = `Phonebook has info for ${persons.length} people`
      const recievedOn = new Date()
      response.send(`${entries} <br> ${recievedOn}`)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person
    .findByIdAndRemove(request.params.id)
    .then(success => response.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const person = {
    name: request.body.name,
    number: request.body.number,
  }

  Person
    .findByIdAndUpdate(
      request.params.id, 
      person, 
      {new: true, runValidators: true, context: 'query'},
      )
    .then(updatedPerson => response.json(updatedPerson))
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)
// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT , () => {
  console.log(`Server running on port ${PORT}`)
})