var express = require("express");
var mysql = require("mysql");
var db_login = require("../config/login");

var router = express.Router();
var conn = mysql.createConnection(db_login);

conn.connect((err) => {
	if(err) return err;
});

const default_data_types = {
	date: "date", email: "varchar(254)",
	number: "int", password: "varchar(30)",
	tel: "varchar(12)",	textfield: "varchar(30)"
}

getFields = (form, callback) => {
	field_data = []
	conn.query(`SELECT * FROM \`$${form}\` ORDER BY \`order\``, (err, result) => {
		if(err) callback(err, null);
		for(rdpi in result) { // RowDataPacket index
			field_data.push({
				id: result[rdpi].order, // add this attr?
				title: result[rdpi].title,
				key: result[rdpi].key,
				type: result[rdpi].type
			});
		}
		callback(null, field_data);
		});
}

reorderFieldsLoop = (form, keys, i, callback) => {
	conn.query(`update \`$${form}\` set \`order\`=${i+1} where \`key\`="${keys[i]}"`,
	(err) => {
		if(err)	callback(err, null);
		else if (i == keys.length - 1) callback(null, true);
		else reorderFieldsLoop(form, keys, i + 1, callback);
	});
}

reorderFields = (query, callback) => {
	const keys = query.keys.split(",");
	reorderFieldsLoop(query.form, keys, 0, (err, result) => {
		if(err) callback(err, null);
		else callback(null, true);
	});
}

addField = (query, callback) => {
	if(query.form[0] == "$") return callback("Can't do that", null);
	var query_clone = { ...query };
	delete query_clone["oper"];
	delete query_clone["form"];
	var keys = "`" + Object.keys(query_clone).join('\`, \`') + "`";
	var values = '"' + Object.values(query_clone).join('", "') + '"';
	var callback_data = [];
	conn.query(`INSERT INTO \`$${query.form}\` (${keys}) VALUES (${values})`, (err, result) => {
		if(err) callback(err, null);
		else {
			console.log(`Inserted ${result.affectedRows} row(s) into \`${query.form}\``);
			conn.query(`ALTER TABLE \`${query.form}\` ADD \`${query.key}\` ${default_data_types[query.type]}`, (err, result) => {
				if(err) callback(err, null);
				else {
					console.log(`Added column \`${query.key}\` (${query.type}) to \`${query.form}\``);
					callback(null, true);
				}
			});
		}
	});
}

editFieldLoop = (query, form, key, callback) => {
	if(Object.keys(query).length > 0) {
		var attr = Object.keys(query)[0];
		var value = Object.values(query)[0];
		var search_key = (attr == "new_key") ? "key" : attr;
		conn.query(`UPDATE \`$${form}\` SET \`${search_key}\`="${value}" WHERE \`key\`="${key}"`,
		(err, result) => {
			if(err) callback(err, null, null, true);
			if(attr == "new_key") key = query.new_key;
			delete query[attr];
			callback(null, query, form, key, false);
		});
	} else callback(null, query, form, key, true);
}

editFieldCallback = (err, query, form, key, done) => {
	if(err) throw err;
	else if(!done) editFieldLoop(query, form, key, editFieldCallback);
}

editField = (query, callback) => {
	if(query.form[0] == "$") callback("Can't do that", null);
	else if("key" in query) {
		var query_clone = { ...query };
		delete query_clone["oper"];
		delete query_clone["form"];
		delete query_clone["key"];
		editFieldLoop(query_clone, query.form, query.key, editFieldCallback);
		callback(null, true);
	} else callback("Failed to edit", null);
}

deleteField = (query, callback) => {
	if(query.form[0] == "$") callback("Can't do that", null);
	else if(!("key" in query)) callback("No key provided", null);
	else conn.query(`DELETE FROM \`$${query.form}\` WHERE \`key\`="${query.key}"`, (err, result) => {
		if(err) callback(err, null);
		else callback(null, result.affectedRows);
	});
}

router.get("/", (req, res) => {
	getFields(req.query.form, (err, result) => {
		if(err) res.send({error: err});
		else res.send(result);
	});
});

router.put("/", (req, res) => {
	switch(req.query.oper) {
		case "add":
			addField(req.query, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
		case "edit":
			editField(req.query, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
		case "reorder":
			reorderFields(req.query, (err, result) => {
				if(err) console.log(err);
				else res.send({success: result});
			});
			break;
	}
});

router.delete("/", (req, res) => {
	deleteField(req.query, (err, result) => {
		if(err) console.log(err);
		else {
			console.log(`Deleted ${result} row(s)`);
			res.send({success: true});
		}
	});
});

module.exports = router;
