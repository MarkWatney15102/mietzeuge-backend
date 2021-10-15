var mysql = require('mysql');
var Promise = require("bluebird");
const db = require('mysql2/promise');

Promise.promisifyAll(mysql);
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

const sqlConnection = {
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: '',
    database: 'backend'
};

var pool = mysql.createPool(sqlConnection);

function getSqlConnection() {
    return pool.getConnectionAsync().disposer(function (connection) {
        console.log("Releasing connection back to pool")
        connection.release();
    });
}

function querySql (query, params) {
    return Promise.using(getSqlConnection(), function (connection) {
        console.log("Got connection from pool");
        if (typeof params !== 'undefined'){
            return connection.queryAsync(query, params);
        } else {
            return connection.queryAsync(query);
        }
    });
};

async function executeQuery(sql) {
    const connection = await db.createConnection(sqlConnection);

    return [rows, fields] = await connection.execute(sql);
}

module.exports = {
    getSqlConnection : getSqlConnection,
    querySql : querySql,
    executeQuery: executeQuery
};