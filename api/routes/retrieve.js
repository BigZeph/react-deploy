var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

getFormData = (query, callback) => {
	json_data = []
	conn.query(`SELECT * FROM \`$${query.formName}\``, (err, result, fields) => {
		if(err) callback(err, null);
		for(rdpi in result) { // RowDataPacket index
			var field  = result[rdpi].Field;
			json_data.push({
				id: rdpi,
				title: result[rdpi].title,
				key: result[rdpi].key,
				type: result[rdpi].type
			});
		}
		callback(null, json_data);
		});
}

getFormNames = (callback) => {
	conn.query("show tables where Tables_in_purpledb not like '$%'", (err, result) => {
		if(err) callback(err, null);
		else callback(null, result);
	});
}

router.get("/", function (req, res, next) {
	switch(req.query.data) {
		case "formData":
			getFormData(req.query, (err, data) => {
				if(err) console.log(err);
				else res.send(data);
			});
			break;
		
		case "formNames":
			getFormNames((err, data) => {
				if(err) console.log(err);
				else res.send(data);
			});
		
		default:
			break;
	}
});

module.exports = router;
