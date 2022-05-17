var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

submitContactData = (query, callback) => {
    conn.query(`INSERT INTO $$contact (\`name\`, \`email\`, \`message\`) ` +
        `VALUES ("${query.name}", "${query.email}", "${query.message}")`,
    (err, result) => {
        if(err) callback(err, null);
        else callback(null, result.affectedRows);
    });
}

router.put("/", (req, res) => {
    submitContactData(req.query, (err, result) => {
        if(err) console.log(err);
        else res.send({affectedRows: result});
    });
});

module.exports = router;
