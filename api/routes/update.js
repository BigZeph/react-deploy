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
	textfield: "varchar(30)"
}

createForm = (query, callback) => {
	if(query.table_name[0] == '$') return callback("Table name can't start with '$'", null);
	var query_clone = { ...query };
	delete query_clone["oper"];
	delete query_clone["table_name"];
	var keys = Object.keys(query_clone);
	var values = Object.values(query_clone);
	var attributes = [];
	for(i in values) values[i] = values[i].split(",");
	for(i in values) {
		if(values[i].length == 3) attributes.push("`" + keys[i] + "` " + values[i][2]);
		else attributes.push("`" + keys[i] + "` " + default_data_types[values[i][1]]);
	}
	attributes = attributes.join(", ");
	conn.query(`CREATE TABLE \`${query.table_name}\` (${attributes})`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Created table \`${query.table_name}\``);
			conn.query(`CREATE TABLE \`$${query.table_name}\` (\`key\` varchar(30), \`title\` varchar(30), \`type\` varchar(30))`, (err, result) => {
				if(err) callback(err, null);
				else {
					console.log(`Created table \`$${query.table_name}\``);
					for(i in keys) {
						conn.query(`INSERT INTO \`$${query.table_name}\` (\`key\`, \`title\`, \`type\`) VALUES ("${keys[i]}", "${values[i][0]}", "${values[i][1]}")`, (err, result) => {
							if(err) callback(err, null);
							else {
								console.log(`${result.affectedRows} row(s) inserted into \`${query.table_name}_data\``);
								callback(null, true);
							}
						});
					}
				}
			});
		}
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

dropForm = (form_name, callback) => {
	if(form_name == "$") callback("You're not allowed to do that", null);
	else conn.query(`drop table \`${form_name}\``, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Dropped table \`${form_name}\``);
			conn.query(`drop table \`$${form_name}\``, (err, result) => {
				if(err) callback(err, null);
				else {
					console.log(`Dropped table \`$${form_name}\``);
					callback(null, true);
				}
			});
		}
	});
}

addRow = (query, callback) => {
	if(query.formName[0] == "$") return callback("You're not allowed to do that", null);
	var query_clone = { ...query };
	delete query_clone["oper"];
	delete query_clone["formName"];
	var keys = "`" + Object.keys(query_clone).join('\`, \`') + "`";
	var values = '"' + Object.values(query_clone).join('", "') + '"';
	var callback_data = [];
	conn.query(`INSERT INTO \`$${query.formName}\` (${keys}) VALUES (${values})`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Inserted ${result.affectedRows} row(s) into \`${query.formName}\``);
			conn.query(`ALTER TABLE \`${query.formName}\` ADD \`${query.key}\` ${parseType(query.type)}`, (err, result) => {
				if(err) callback(err, null);
				else {
					console.log(`Added column \`${query.key}\` (${query.type}) to \`${query.formName}\``);
					callback(null, true);
				}
			});
		}
	});
}

editRowLoop = (query, formName, key, callback) => {
	if(Object.keys(query).length > 0) {
		var attr = Object.keys(query)[0];
		var value = Object.values(query)[0];
		var search_key = (attr == "new_key") ? "key" : attr;
		conn.query(`UPDATE \`$${formName}\` SET \`${search_key}\`="${value}" WHERE \`key\`="${key}"`,
		(err, result) => {
			if(err) callback(err, null, null, true);
			if(attr == "new_key") key = query.new_key;
			delete query[attr];
			callback(null, query, formName, key, false);
		});
	} else callback(null, query, formName, key, true);
}

editRowCallback = (err, query, formName, key, done) => {
	if(err) throw err;
	else if(!done) return editRowLoop(query, formName, key, editRowCallback);
}

editRow = (query, callback) => {
	if(query.formName[0] == "$") callback("You're not allowed to do that", null);
	else if("key" in query) {
		var query_clone = { ...query };
		var formName = query.formName;
		var key = query.key;
		delete query_clone["oper"];
		delete query_clone["formName"];
		delete query_clone["key"];
		editRowLoop(query_clone, formName, key, editRowCallback);
		callback(null, true);
	} else callback("Failed to edit", null);
}

deleteRow = (query, callback) => {
	if(query.formName[0] == "$") callback("You're not allowed to do that", null);
	else if(!("key" in query)) callback("No key provided", null);
	else conn.query(`DELETE FROM \`$${query.formName}\` WHERE \`key\`="${query.key}"`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(result);
			callback(null, true);
		}
	});
}

router.put("/", (req, res) => {
	switch(req.query.oper) {
		case "create":
			createForm(req.query, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
		case "rename":
			editFormName(req.query.formName, req.query.newFormName, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
		case "add":
			addRow(req.query, (err, result) => {
				if(err) console.log(err, err);
				else res.send({success: result});
			});
			break;
		case "edit":
			editRow(req.query, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
		default:
			break;
	}
});

router.delete("/", (req, res) => {
	switch(req.query.oper) {
		case "delete":
			deleteRow(req.query, (err, result) => {
				if(err) console.log(err);
				else {
					console.log(`Deleted ${result.affectedRows} row(s)`);
					res.send({success: true});
				}
			});
			break;
		case "drop":
			dropForm(req.query.formName, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
		default:
			break;
	}
});

module.exports = router;
