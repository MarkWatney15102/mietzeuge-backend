const express = require('express');
const cors = require('cors');

var db = require('./lib/db');
var getSqlConnection = db.getSqlConnection;
var querySql = db.querySql;


const app = express();
const port = 43921;

app.use(cors());
app.use(express.json());

function getAllArticels() {
    let articelQuery =
     "SELECT art.ID, art.title, art.description, cat.text_de category, art.timestamp, art.last_changed, " + 
     "artImg.image_path, artPrice.cost_per_day, artPrice.deposit, artPrice.additional_cost " +
     "FROM articel art " +
     "INNER JOIN articel_images artImg ON art.ID = artImg.articel_id " +
     "INNER JOIN articel_prices artPrice ON art.ID = artPrice.articel_id " +
     "INNER JOIN cat_categories cat ON art.category_id = cat.id ";
    return querySql(articelQuery)
       .then(function(rows){
        if (rows.length == 0) {
            return Promise.reject("No articel found");
        }
  
        let articels = rows;
        return articels;
    });
}

function getOneArticel(artId) {
    let articelQuery =
     "SELECT art.ID, art.title, art.description, cat.text_de category, art.timestamp, art.last_changed, " + 
     "artImg.image_path, artPrice.cost_per_day, artPrice.deposit, artPrice.additional_cost " +
     "FROM articel art " +
     "INNER JOIN articel_images artImg ON art.ID = artImg.articel_id " +
     "INNER JOIN articel_prices artPrice ON art.ID = artPrice.articel_id " +
     "INNER JOIN cat_categories cat ON art.category_id = cat.id " +
     "WHERE art.ID = '" + artId + "'";
    return querySql(articelQuery)
       .then(function(rows){
        if (rows.length == 0) {
            return Promise.reject("No articel found");
        }
  
        let articels = rows;
        return articels;
    });
}

app.get('/articel/list', (req, res) => {
    Promise.resolve().then(function () {
        return getAllArticels();
    })
    .then(function (articels) {
        res.status(200).json({ "code": 0, "message": "success", "articels": articels});
    })
    .catch(function (err) {
        console.error("got error: " + err);
        if (err instanceof Error) {
            res.status(400).send("General error");
        } else {
            res.status(200).json({ "code": 1000, "message": err });
        }
    });
});

app.get('/articel/:id', (req, res) => {
    const id = req.params.id;
    Promise.resolve().then(function () {
        return getOneArticel(id);
    })
    .then(function (articels) {
        res.status(200).json({ "code": 0, "message": "success", "articel": articels});
    })
    .catch(function (err) {
        console.error("got error: " + err);
        if (err instanceof Error) {
            res.status(400).send("General error");
        } else {
            res.status(200).json({ "code": 1000, "message": err });
        }
    });
});

app.listen(port, () => {
    console.log('Listening to Port: ' + port);
})