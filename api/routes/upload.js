var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

router.put("/", function (req, res) {
	var formName = req.query.formName;
	delete req.query["formName"];

	var keys = "`" + Object.keys(req.query).join("`, `") + "`";
	var values = '"' + Object.values(req.query).join('", "') + '"';

	conn.query(`INSERT INTO \`${formName}\` (${keys}) VALUES (${values})`, (err, result) => {
		if(err) console.log(err);
		else {
			console.log(`Number of affected (inserted) rows: ${result.affectedRows}`);
			res.send(values);
		}
	});
});

module.exports = router;