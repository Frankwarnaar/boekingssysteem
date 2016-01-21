var fs = require('fs'),
    express = require('express');

var router = express.Router();

// Afhandeling voor tonen van alle kamers
router.get('/', function(req, res){
	req.getConnection(function (err, connection) {
		connection.query("SELECT * FROM rooms", function(err, results){
			res.locals.rooms = results;
			res.render("rooms/index");
		});
	});
});

// Afhandeling om een kamer toe te voegen
router.get('/add', function(req, res) {
	if (req.session.username){
		res.render("rooms/add");
	} else{
		res.redirect("/users/login");
	}
});

// Afhandeling van post om kamer toe te voegen
router.post('/add', function(req, res){
	req.getConnection(function (err, connection) {
		var data = {
			naam: req.body.naam,
			prijs: req.body.prijs,
			personen: req.body.personen,
			image: req.file.originalname
		}
		connection.query("INSERT INTO rooms set ? ", [data], function(err, results) {
			res.redirect('/rooms');
		});
	});
	fs.rename(req.file.path, req.file.destination + req.file.originalname, function(err){
		if(err) return next(err);
    });
});

// Afhandeling voor detailpagina van een kamer
router.get('/:id', function(req, res){
	var id = req.params.id;
	req.getConnection(function (err, connection){
		connection.query("SELECT * FROM rooms WHERE id = ?", [id], function(err, results){
			res.locals.details = results[0];
			if (req.session.dateError){
				if (req.session.dateError != false){
					res.locals.dateError = "Voer een geldige datum in";
				} else{
					res.locals.dateError = false;
				}
			} else{
				req.session.dateError = false;
				res.locals.dateError = false;
			}
			res.render("rooms/view");
		});
	});
});

// Afhandeling voor het aanpassen van een kamer
router.get('/edit/:id', function(req, res){
	if(req.session.admin){
		var id = req.params.id;
		req.getConnection(function (err, connection){
			connection.query("SELECT * FROM rooms WHERE id = ?", [id], function(err, results){
				res.locals.details = results[0];
				res.render("rooms/edit");
			});
		});
	} else{
		res.redirect('/users');
	}
});

// Afhandeling van post voor aanpassen van een kamer
router.post('/edit/:id', function(req, res){
	req.getConnection(function (err, connection) {
		var id = req.params.id;
		if (req.file){
			var data = {
				naam: req.body.naam,
				prijs: req.body.prijs,
				personen: req.body.personen,
				image: req.file.originalname
			}
		} else{
			var data = {
				naam: req.body.naam,
				prijs: req.body.prijs,
				personen: req.body.personen,
			}
		}
		connection.query("UPDATE rooms set ? WHERE id = ? ", [data, id], function(err, results) {
			res.redirect('/rooms');
		});
	});
	if (req.file){
		fs.rename(req.file.path, req.file.destination + req.file.originalname, function(err){
			if(err) return next(err);
	    });
	}
});

// Afhandeling voor het verwijderen van een kamer
router.get('/remove/:id', function(req, res){
	if(!req.session.admin){
		res.redirect('/rooms');
	} else{
		var id = req.params.id
		req.getConnection(function (err, connection){
			connection.query("DELETE FROM rooms where id = ?", [id], function(err, results){
				res.redirect('/rooms');
			});
		});
	}
});

// Afhandeling 404
router.get('*', function(req, res, next) {
	res.render('404', {url: req.url});
});

module.exports = router;
