var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

parseType = (type) => {
	switch(type) {
		case "binary":
			return "bit";
		case "integer":
			return "int";
		case "decimal":
			return "float";
		case "textfield":
			return "varchar(30)";
		case "email":
			return "varchar(30)";
		case "HTML":
			return "varchar(50)"; // ?
		case "password":
			return "varchar(30)";
		default:
			return "null";
	}
}

createForm = (query, callback) => {
	var query_clone = { ...query };
	delete query_clone["oper"];
	delete query_clone["table_name"];
	var keys = Object.keys(query_clone);
	var values = Object.values(query_clone);
	var attributes = [];
	for(i in values) values[i] = values[i].split(",");
	for(i in values) {
		if(values[i].length == 3) attributes.push("`" + keys[i] + "` " + values[i][2]);
		else attributes.push("`" + keys[i] + "` " + parseType(values[i][1]));
	}
	attributes = attributes.join(", ");
	conn.query(`CREATE TABLE \`${query.table_name}\` (${attributes})`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Created table \`${query.table_name}\``);
			conn.query(`CREATE TABLE \`${query.table_name}_data\` (\`key\` varchar(30), \`title\` varchar(30), \`type\` varchar(30))`, (err, result) => {
				if(err) callback(err, null);
				else {
					console.log(`Created table \`${query.table_name}_data\``);
					for(i in keys) {
						conn.query(`INSERT INTO \`${query.table_name}_data\` (\`key\`, \`title\`, \`type\`) VALUES ("${keys[i]}", "${values[i][0]}", "${values[i][1]}")`, (err, result) => {
							if(err) callback(err, null);
							else {
								console.log(`${result.affectedRows} row(s) inserted into \`${query.table_name}_data\``);
								callback(null, "Done!");
							}
						});
					}
				}
			});
		}
	});
}

editFormName = (old_form_name, new_form_name, callback) => {
	conn.query(`rename table \`${old_form_name}\` to \`${new_form_name}\``, (err, result1) => {
		if(err) callback(err, null);
		else {
			console.log(`Successfully renamed table \`${old_form_name}\` to \`${new_form_name}\``);
			conn.query(`rename table \`${old_form_name}\_data\` to \`${new_form_name}_data\``,
			(err, result2) => {
				if(err) callback(err, null);
				else {
					console.log(`Successfully renamed table \`${old_form_name}_data\` to \`${new_form_name}_data\``);
					callback(null, true);
				}
			});
		}
	});
}

dropForm = (form_name, callback) => {
	conn.query(`drop table \`${form_name}\``, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Dropped table \`${form_name}\``);
			conn.query(`drop table \`${form_name}_data\``, (err, result) => {
				if(err) callback(err, null);
				else {
					console.log(`Dropped table \`${form_name}_data\``);
					callback(null, "Done!");
				}
			});
		}
	});
}

addRow = (query, callback) => {
	var query_clone = { ...query };
	delete query_clone["oper"];
	delete query_clone["formName"];
	var keys = "`" + Object.keys(query_clone).join('\`, \`') + "`";
	var values = '"' + Object.values(query_clone).join('", "') + '"';
	var callback_data = [];
	conn.query(`INSERT INTO \`${query.formName}_data\` (${keys}) VALUES (${values})`, (err, result) => {
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
		conn.query(`UPDATE ${formName}_data SET \`${search_key}\`="${value}" WHERE \`key\`="${key}"`,
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
	if("key" in query) {
		var query_clone = { ...query };
		var formName = query.formName;
		var key = query.key;
		delete query_clone["oper"];
		delete query_clone["formName"];
		delete query_clone["key"];
		editRowLoop(query_clone, formName, key, editRowCallback);
		callback(null, "Edit successful");
	} else callback("Failed to edit", null);
}

deleteRow = (query, callback) => {
	if(!("key" in query)) callback("No key provided", null);
	conn.query(`DELETE FROM ${query.formName}_data WHERE \`key\`="${query.key}"`, (err, result) => {
		if(err) callback(err, null);
		else callback(null, result);
	});
}

router.put("/", (req, res) => {
	switch(req.query.oper) {
		case "create":
			createForm(req.query, (err, result) => {
				if(err) console.log(err);
				else console.log(result);
			});
			break;
		case "rename":
			editFormName(req.query.formName, req.query.newFormName, (err, result) => {
				if(err) console.log(err);
				else console.log(result ? "Success" : "Failed");
			});
			break;
		case "add":
			addRow(req.query, (err, result) => {
				if(err) console.log(err, err);
				else console.log(result ? "Success" : "Failed");
			});
			break;
		case "edit":
			editRow(req.query, (err, result) => {
				if(err) console.log(err);
				else console.log(result);
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
				else console.log(`Deleted ${result.affectedRows} row(s)`);
			});
			break;
		case "drop":
			dropForm(req.query.formName, (err, result) => {
				if(err) console.log(err);
				else console.log(result);
			});
			break;
		default:
			break;
	}
});

module.exports = router;
