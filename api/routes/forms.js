var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

const default_data_types = {
	date: "date",
	email: "varchar(254)",
	number: "int",
	password: "varchar(30)",
	tel: "varchar(12)",
	textfield: "varchar(30)",
	textarea: "varchar(500)"
}

getFormNames = (callback) => {
	conn.query("show tables where Tables_in_purpledb not like '$%'", (err, result) => {
		if(err) callback(err, null);
		else callback(null, result);
	});
}

editFormName = (old_form_name, new_form_name, callback) => {
	if(old_form_name[0] == "$") callback("You're not allowed to do that", null);
	else if(new_form_name[0] == "$") callback("Table can't start with '$'", null);
	else conn.query(`rename table \`${old_form_name}\` to \`${new_form_name}\``, (err, result1) => {
		if(err) callback(err, null);
		else {
			console.log(`Successfully renamed table \`${old_form_name}\` to \`${new_form_name}\``);
			conn.query(`rename table \`$${old_form_name}\` to \`$${new_form_name}\``,
			(err, result2) => {
				if(err) callback(err, null);
				else {
					console.log(`Successfully renamed table \`$${old_form_name}\` to \`$${new_form_name}\``);
					callback(null, true);
				}
			});
		}
	});
}

createFormLoop = (form, keys, values, i, callback) => {
	conn.query(`INSERT INTO \`$${form}\` (\`key\`, \`title\`, \`type\`, \`order\`) VALUES ("${keys[i]}", "${values[i][0]}", "${values[i][1]}", ${i+1})`,
	(err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`${result.affectedRows} row(s) inserted into \`${form}_data\``);
			if(i + 1 < keys.length) createFormLoop(form, keys, values, i + 1, callback);
			else callback(null, true);
		}
	});
}

createForm = (query, callback) => {
	if(query.form[0] == '$') return callback("Table name can't start with '$'", null);
	var query_clone = { ...query };
	delete query_clone["oper"];
	delete query_clone["form"];
	var keys = Object.keys(query_clone);
	var values = Object.values(query_clone);
	var attributes = [];
	for(i in values) values[i] = values[i].split(",");
	for(i in values) {
		if(values[i].length == 3) attributes.push("`" + keys[i] + "` " + values[i][2]);
		else attributes.push("`" + keys[i] + "` " + default_data_types[values[i][1]]);
	}
	attributes = attributes.join(", ");
	conn.query(`CREATE TABLE \`${query.form}\` (${attributes})`,
	(err) => {
		if(err) callback(err, null);
		else {
			console.log(`Created table \`${query.form}\``);
			conn.query(`CREATE TABLE \`$${query.form}\` (\`key\` varchar(30), \`title\` varchar(30), \`type\` varchar(30), \`order\` int, primary key (\`key\`))`,
			(err) => {
				if(err) callback(err, null);
				else {
					console.log(`Created table \`$${query.form}\``);
					createFormLoop(query.form, keys, values, 0, (err) => {
						if(err) callback(err, null);
						else callback(err, true);
					});
				}
			});
		}
	});
}

dropForm = (form_name, callback) => {
	if(form_name[0] == "$") callback("Table name uses '$' symbol", null);
	else conn.query(`drop table \`${form_name}\``, (err) => {
		if(err) callback(err, null);
		else {
			console.log(`Dropped table \`${form_name}\``);
			conn.query(`drop table \`$${form_name}\``, (err) => {
				if(err) callback(err, null);
				else {
					console.log(`Dropped table \`$${form_name}\``);
					callback(null, true);
				}
			});
		}
	});
}

router.get("/", (req, res) => {
	getFormNames((err, result) => {
		if(err) console.log({error: err});
		else res.send(result);
	});
});

router.put('/', (req, res) => {
	switch(req.query.oper) {
		case "create":
			createForm(req.query, (err, result) => {
				if(err) console.log({error: err});
				else res.send(result);
			});
			break;
		case "rename":
			editFormName(req.query.old_form, req.query.new_form, (err, result) => {
				if(err) console.log({error: err});
				else res.send({edited_name: result});
			});
			break;
	}
});

router.delete('/', (req, res) => {
	dropForm(req.query.form, (err, result) => {
		if(err) console.log({error: err});
		else res.send({dropped_form: result});
	});
});

module.exports = router;
