const express = require('express');
const cors = require('cors');

const SqlString = require('sqlstring');
const randomstring = require("randomstring");
const bcrypt = require('bcryptjs');

let db = require('./lib/db');
let getSqlConnection = db.getSqlConnection;
let querySql = db.querySql;


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

function addArticelRequest(id, days, startDay, pricePerDay, deposit, additionalCost) {
    let requestQuery = "INSERT INTO `articel_request` (`articel_id`, `days`, `start_date`, `cost_per_day`, `deposit`, `additional_cost`) VALUES ('" + id + "', '" + days + "', '" + startDay + "', '" + pricePerDay + "', '" + deposit + "' ,'" + additionalCost + "')";
    return querySql(requestQuery);
}

function selectUserData(username) {
    const sql = "SELECT * FROM user WHERE username = " + SqlString.escape(username) + "";
    return querySql(sql)
       .then(function(rows){
        if (rows.length == 0) {
            return Promise.reject("No user found");
        }
  
        let userData = rows[0];
        return userData;
    });
}

function createToken(token, userId) {
    const sql = "INSERT INTO user_token (user_id, token) VALUES ('" + userId + "', '" + token + "') ON DUPLICATE KEY UPDATE token = '" + token + "'";
    return querySql(sql);
}

app.get('/articel/list', (req, res) => {
    Promise.resolve().then(function () {
        return getAllArticels();
    })
    .then(function (articels) {
        res.status(200).json({"message": "success", "articels": articels});
    })
    .catch(function (err) {
        console.error("got error: " + err);
        if (err instanceof Error) {
            res.status(400).send("General error");
        } else {
            res.status(200).json({"message": err });
        }
    });
});

app.get('/articel/:id', (req, res) => {
    const id = req.params.id;
    Promise.resolve().then(function () {
        return getOneArticel(id);
    })
    .then(function (articels) {
        res.status(200).json({"message": "success", "articel": articels});
    })
    .catch(function (err) {
        console.error("got error: " + err);
        if (err instanceof Error) {
            res.status(400).send("General error");
        } else {
            res.status(200).json({"message": err });
        }
    });
});


app.post('/articel/request/:id', (req, res) => {
    const id = req.params.id;
    const days = req.body.days;
    const startDay = req.body.startDay;
    const pricePerDay = req.body.pricePerDay;
    const deposit = req.body.deposit;
    const additionalCost = req.body.additionalCost;

    if (id && days && startDay && pricePerDay && deposit && additionalCost) {
        Promise.resolve().then(() => {
            return addArticelRequest(id, days, startDay, pricePerDay, deposit, additionalCost);
        }).then(function () {
            res.status(200).json({"message": "success"});
        })
        .catch(function (err) {
            console.error("got error: " + err);
            if (err instanceof Error) {
                res.status(400).send("General error");
            } else {
                res.status(200).json({"message": err });
            }
        });
    } else {
        res.status(400).json({"message": "Missing parameter"});
    }
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (username && password) {
        Promise.resolve().then(() => {
            return selectUserData(username);
        }).then((userData) => {
            const userId = userData.id;
            const token = randomstring.generate({
                length: 64,
                charset: 'alphabetic'
            });

            Promise.resolve().then(() => {
                return createToken(token, userId);
            }); 

            const verify = bcrypt.compareSync(password, userData.password);

            res.status(200).send({
                auth: verify,
                message: "request was successfull",
                uid: (verify === true) ? userId : '',
                token: (verify === true) ? token : ''
            });
        }).catch((err) => {
            console.error("got error: " + err);
            if (err instanceof Error) {
                res.status(400).send("General error");
            } else {
                res.status(200).json({"message": err });
            }
        });
    } else {
        res.status(200).send({
            auth: false,
            message: "missing param"
        });
    }
});

app.listen(port, () => {
    console.log('Listening to Port: ' + port);
})