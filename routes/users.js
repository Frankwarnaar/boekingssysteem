var express = require('express');
var router = express.Router();

// Aanvraag van loginpagina
router.get('/login', function(req, res){
	if(req.session.username){
    res.redirect('/');    
  } else{
    res.render('users/login', {
    	error: false
    });
  }
});

// Afhandeling van login
router.post('/login', function(req, res){
	var username = req.body.username;
	var password = req.body.password;
	req.getConnection(function(err, connection){
		connection.query('SELECT * FROM users WHERE name = ? and password = ?', [username, password], function(err, results) {
			if (results.length>0){
				if(results[0].admin == 1){
					req.session.admin = true;
				}
				req.session.username = username;
				req.session.userid = results[0].id;
				res.redirect('/');
			} else{
				res.locals.error = 'Gebruikersnaam en/of wachtwoord onjuist.';
				res.render('users/login');
			}
		});
	}); 
});

// Aanvraag voor registreerpagina
router.get('/register', function(req, res){
	if(req.session.username){
		res.redirect('/users');
	} else{
		res.locals.error = false;
		res.render('users/register');
	}
});

// Afhandeling van registreren
router.post('/register', function(req, res) {
	if (req.body.name.trim() == '' || req.body.password.trim() == ''){
		if (req.body.name.trim() == ''){
			res.render('users/register', {
				error: "Voer een naam in."
			});
		} else {
			res.render('users/register', {
				error: "Voer een wachtwoord in."
			});
		}
	} else{
		req.getConnection(function (err, connection) {
			var data = {
				name : req.body.name,
				password : req.body.password,
				email : req.body.email
			};
			connection.query("INSERT INTO users set ? ", [data], function(err, results) {
				res.render('users/login', {
					error: "Registratie succesvol"
				});
			});
		});
	}
});

// Aanvraag voor edit pagina
router.get('/edit/', function(req, res){
	if(!req.session.username){
		res.redirect('/users');
	} else{
		var username = req.session.username;
		req.getConnection(function(err, connection){
			connection.query("SELECT * FROM users WHERE name = ? ", [username], function(err, results){
				res.locals.data = results[0];
				res.render('users/edit', {
					error: false
				});
			});
		}); 
	}
});

// Afhandeling van edit van gebruiker
router.post('/edit/', function(req, res) {
	if (req.body.name.trim() == '' || req.body.password.trim() == '' || req.body.email.trim() == ''){
		if (req.body.name.trim = ''){
			res.render('users/edit', {
				error: "De ingevoerde gebruikersnaam is incorrect."
			});
		} else if(req.body.password.trim() == ''){
			res.render('users/edit', {
				error: "Het ingevoerde wachtwoord is incorrect."
			});
		} else if(req.body.email.trim() == ''){
			res.render('users/edit', {
				error: "Het ingevoerde emailadres is incorrect."
			})
		}
	} else {
		req.getConnection(function (err, connection) {
			var data = {
				name : req.body.name,
				password : req.body.password,
				email : req.body.email
			};
			connection.query("UPDATE users set ? WHERE id = ? ", [data, req.session.userid], function(err, results) {
				res.redirect('/users');
			});
		});
	}
});

// Afhandeling van het verwijderen van jouw gebruiker
router.get('/remove', function(req, res){
	if(!req.session.username){
		res.redirect('/');
	} else{
		req.getConnection(function (err, connection){
		    connection.query("DELETE FROM users WHERE id = ? ", [req.session.userid], function(err, results) {
		    	req.session.destroy();
				res.redirect('/');
		    });
	    }); 
	}
});

// Afhandeling voor uitloggen
router.get('/logout', function(req, res){
	req.session.destroy();
	res.redirect('/');
});

// Afhandeling 404
router.get('*', function(req, res, next) {
	res.render('404', {url: req.url});
});

module.exports = router;
