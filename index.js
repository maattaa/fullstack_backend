require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const app = express()
const Person = require('./models/person')
const cors = require('cors')

app.use(cors())
app.use(express.json())
app.use(express.static('build'))

//Loggign for everything else than POST, excluding body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  skip: function (req) {
    return req.method === 'POST'
  }
}))

//Logging for POST, contains body
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  skip: function (req) {
    return req.method !== 'POST'
  }
}))

morgan.token('body', function (req) {
  return JSON.stringify(req.body)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then(() => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const body = req.body

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => (savedPerson.toJSON()))
    .then(savedAndformatted => {
      res.json(savedAndformatted)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {

  const id = req.params.id
  const number = req.body.number

  const options = {
    runValidators: true,
    context: 'query',
    new: true
  }
  Person.findOneAndUpdate({ _id: id }, { number: number }, options)
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.get('/info', (req, res, next) => {

  Person.countDocuments({})
    .then(count => {
      res.send(`<p>Phonebook has info for ${count} people</p>
            <p>${new Date()}</p>`)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {


  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})