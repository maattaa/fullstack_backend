const mongoose = require('mongoose')

const password = process.argv[2]
const url = 
`mongodb+srv://admin_phonebook:${password}@fstack.n3sfl.mongodb.net/fstack?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const printPersons = () => {
    console.log('phonebook:')
    Person.find({}).then(result => {
        result.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
}

const person = new Person({
    name: process.argv[3],
    number: process.argv[4]
})

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
} else if (process.argv.length === 3) {
    printPersons()
} else if (process.argv.length > 0) {
    person.save().then(result => {
        console.log(`added ${person.name} number ${person.number} to phonebook`)
        mongoose.connection.close()
    })
}