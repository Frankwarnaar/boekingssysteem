var express = require('express');
var router = express.Router();

// Afhandeling voor adminoverzicht
router.get('/', function(req, res){
	if (!req.session.admin){
		res.redirect('/rooms/');
	} else{
		req.getConnection(function (err, connection){
			connection.query('SELECT * FROM users', function(err, results){
				res.locals.users = results;
				res.render('admin/index');
			});
		});
	}
});

// Afhandeling voor het geven van adminrechten aan iemand
router.get('/makeAdmin/:id', function(req, res){
	if (!req.session.admin){
		res.redirect('/');
	} else{
		var userid = req.params.id;
		req.getConnection(function (err, connection){
			connection.query("UPDATE users set admin=1 WHERE id = ?", [userid], function(err, results){
				if (err){
					console.log(err);
				}
				res.redirect('/admin');
			});
		});
	}
});

// Afhandeling voor het verwijderen van adminrechten van iemand
router.get('/removeAdmin/:id', function(req, res){
	if (!req.session.admin){
		res.redirect('/');
	} else{
		var userid = req.params.id;
		req.getConnection(function (err, connection){
			connection.query("UPDATE users set admin=0 WHERE id = ?", [userid], function(err, results){
				if (err){
					console.log(err);
				}
				res.redirect('/admin');
			});
		});
	}
});

// 404 afhandeling
router.get('*', function(req, res, next) {
	res.render('404', {url: req.url});
});

module.exports = router;
