var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

const getRows = (query, callback) => {
	if(query.form[0] == '$') callback("Invalid form name (starts with '$')", null);
	else conn.query(`SELECT * FROM \`${query.form}\``, (err, result) => {
		if(err) callback(err, null);
		else callback(null, result);
	});
}

const insertRow = (query, callback) => {
	var query_clone = { ...query };
	delete query_clone["form"];

	var keys = "`" + Object.keys(query_clone).join("`, `") + "`";
	var values = '"' + Object.values(query_clone).join('", "') + '"';

	console.log(query.form, keys, values);
	conn.query(`INSERT INTO \`${query.form}\` (${keys}) VALUES (${values})`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Number of rows inserted: ${result.affectedRows}`);
			callback(null, result.affectedRows);
		}
	});
}

const deleteRows = (query) => {
	conn.query(`DELETE FROM \`${query.form}\` WHERE \`${query.key}\` = "${query.value}"`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Number of affected (inserted) rows: ${result.affectedRows}`);
			callback(null, result.affectedRows);
		}
	});
}

router.get("/", (req, res) => {
	getRows(req.query, (err, result) => {
		if(err) res.send({error: err});
		else res.send(result);
	});
});

router.put("/", (req, res) => {
	insertRow(req.query, (err, result) => {
		if(err) res.send({error: err});
		else res.send({insertedRows: result});
	});
});

router.delete("/", (req, res) => {
	deleteRows(req.query, (err, result) => {
		if(err) res.send({error: err});
		else res.send({deletedRows: result});
	});
});

module.exports = router;