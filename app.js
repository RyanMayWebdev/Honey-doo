const express = require('express');
const https = require('https');
const date = require('./date.js');
const mongoose = require('mongoose');
const app = express();

let Key = process.key.apiKey
let newItems = []
let weatherData;
let password = process.env.password
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/scripts', express.static(__dirname + '/node_modules/particles.js/'));
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

mongoose.connect(`mongodb+srv://Admin-Ryan:${password}@honey-doo.z19qq.mongodb.net/ToDoDB`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const todoSchema = new mongoose.Schema({
    post: {
        type: String,
        required: true
    }
})

const toDoItem = mongoose.model('toDoList', todoSchema);

//Get site data from database on server start up
function getItems() {
    toDoItem.find((err, items) => {
        if (err) console.log(err)
        else {
            items.forEach((item) => {
                newItems.push(item);
            });
        }
    })
}

getItems();

//Get apiKey from file.
Key = process.env.apiKey


app.get('/', (req, res) => {
    // Render website
    res.render('list', {
        kindOfDay: date(),
        newItem: newItems
    });
})

// post request from index.js to send over user location data used for getting local weather.
app.post("/app.js", (req, res) => {
    let long = JSON.parse(req.body.longitude);
    let lat = JSON.parse(req.body.latitude);
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${Key}`;
    https.get(weatherUrl, (response) => {
        response.on("data", (data) => {
            weatherData = JSON.parse(data);
            res.send(weatherData);
        });
    });
})

app.post('/newItem', (req, res) => {
    //Get new items user wants added to list, push them to array and save the data to the server
    let item = req.body.addItem;
    const listItem = new toDoItem({
        post: item
    })
    const saveItem = () => {
        return new Promise((resolve, reject) => {
            toDoItem.insertMany([listItem], (err) => {
                if (err === null) {
                    newItems.push(listItem);
                    resolve();
                }
            })
        })
    }

    // Re-render website
    saveItem()
        .then(() => res.redirect('/'))
})

app.post('/remove', (req, res) => {
    //Remove requested data from array and save file as per user request
    let removeItem = req.body.button;
    const deleteItem = () => {
        return new Promise((resolve, reject) => {
            toDoItem.deleteOne({
                _id: removeItem
            }, (err) => {
                if (err) {
                    console.log(err);
                    reject();
                } else {
                    console.log(`Deleted item ${removeItem} from database.`)
                    newItems = [];
                    getItems();
                    resolve();
                }
            })
        })
    }

    deleteItem()
        .then(() => res.redirect('/'));
})


app.listen(process.env.PORT, (req, res) => console.log('server running on port 3000'));