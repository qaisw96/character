// require packages
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const methodOverride = require('method-override');

// get the variables from .env file 
const PORT = process.env.PORT;
const DATABASE_URL = process.env.DATABASE_URL;

// Application setup
const app = express();
const client = new pg.Client(DATABASE_URL)

// express middleware
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static('./public'));

app.set('view engine', 'ejs')


// routes 
app.get('/home', getDataApiAndRenderToHome);
app.post('/favorite-character', saveAddedCharacters)
app.get('/character/my-fav-characters', renderAddedCharacters )

app.get('/character/:id', renderCharacterDetails)
app.put('/character/:id', updateCharacter)
app.delete('/character/:id', deleteCharacter)

app.get('/characters/create', displayCreateForm)
app.post('/characters/my-characters', addCreatedCharacter)
app.get('/created-characters', displayCreatedCharacter)


// callback function
function getDataApiAndRenderToHome(req, res) {
    const apiUrl = 'http://hp-api.herokuapp.com/api/characters';

   superagent.get(apiUrl).then(result => {
    const results = result.body.map(obj => {
        return new Character(obj)
    })
    res.render('pages/index', {characters: results})
       
   })
}

function saveAddedCharacters(req, res) {
    const {name, house, patronus, is_alive} = req.body;

    const sql = 'INSERT INTO characters(name, house, patronus, is_alive, add_by) VALUES($1, $2, $3, $4, $5);'
    const val = [name, house, patronus, is_alive, 'api']

    client.query(sql, val).then(() => {
        res.redirect('/character/my-fav-characters')
    })

    
}

function renderAddedCharacters(req, res) {
    const sql = 'SELECT * FROM characters WHERE add_by=$1;'
    const val = ['api'];

    client.query(sql, val).then(results => {
        res.render('pages/favorite', {characters: results.rows})
    })

}

function renderCharacterDetails(req, res) {
    const characterId = req.params.id
    console.log(characterId);
    const sql = 'SELECT * FROM characters WHERE id=$1;'
    const val = [characterId]

    client.query(sql, val).then(results => {
        res.render('pages/details', {character: results.rows})
    })
}

function updateCharacter(req, res) {
    const characterId = req.params.id
    const {name, house, patronus, status} = req.body

    const sql = 'UPDATE characters SET name=$1, house=$2, patronus=$3, is_alive=$4 WHERE id=$5;'
    const val = [name, house, patronus, status, characterId]

    client.query(sql, val).then(() => {
        res.redirect(`/character/${characterId}`)
    })
}

function deleteCharacter(req, res) {
    const id = req.params.id;
    
    const sql = 'DELETE FROM characters WHERE id=$1;'
    const val = [id]

    client.query(sql, val).then(() => {
        res.redirect(`/character/my-fav-characters`)
    })
}

function displayCreateForm(req, res) {
    res.render('pages/display-form')
}

function addCreatedCharacter(req, res) {
    const {name, house, patronus, status} = req.body
    const sql = 'INSERT INTO characters(name, house, patronus, is_alive, add_by) VALUES($1, $2, $3, $4, $5);'
    const val = [name, house, patronus, status, 'user']

    
    client.query(sql, val).then(() => {
       
           res.redirect('/created-characters')
        })
 
}

function displayCreatedCharacter(req, res) {
    const select = 'SELECT * FROM characters WHERE add_by=$1;'
    const value = ['user']

    client.query(select, value).then(results => {

        res.render('pages/favorite', {characters: results.rows})
    })

}



// Constructor function
function Character(character) {
    this.name = character.name
    this.house = character.house
    this.patronus = character.patronus
    this.is_alive = character.alive
}



// listening 
client.connect().then(() => {
    console.log('connect to DB');
    app.listen(PORT, () => console.log(`listening to port ${PORT} .....`))
})

app.use('*', (req,res) => res.send('Route does not exist'))