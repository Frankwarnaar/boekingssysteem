var express = require('express');
var router = express.Router();

// Functie om te checken of een invoer een datum is
function checkIfDate(date){
	date = String(date);
	dateSplitted = date.split('-');
	if (dateSplitted.length != 3){
		return false;
	} else if (parseInt(dateSplitted[0]) < 2016 || parseInt(dateSplitted[1]) > 12 || parseInt(dateSplitted[1]) < 1 || parseInt(dateSplitted[2]) > 31 || parseInt(dateSplitted[2]) < 1){
		return false;
	} else if (isNaN(parseInt(dateSplitted[0])) || isNaN(parseInt(dateSplitted[1])) || isNaN(dateSplitted[2])){
		return false;
	} else{
		return true;
	}
}

// Functie om the checken of de einddatum van een boeking later is dan de startdatum
// Checkt ook of startdatum vandaag of later is.
function compareDates(startDate, endDate){
	var today = new Date();
	var startDateFullFormat = new Date(startDate);
	if (!today > startDateFullFormat){
		return false;
	} else if(endDate > startDate){
		return true;
	} else{
		return false;
	}
}

// Functie om datum om te zetten in dd-mm-yyyy notatie
function dateFormat(date){
	date = String(date);
	date = date.split(' ')
	date = date[2] + ' ' + date[1] + ' ' + date[3];
	return date;
}

// Als je naar /bookings gaat, worden alle gegevens van de boekingen van de ingelogde persoon opgehaald
router.get('/', function(req, res){
	req.getConnection(function (err, connection){
		connection.query("SELECT bookings.*, rooms.naam, rooms.prijs, rooms.image, DATEDIFF(einddatum, begindatum) AS nachten FROM bookings JOIN rooms ON rooms.id = bookings.roomid WHERE userid = ? ORDER BY bookings.id DESC", [req.session.userid], function(err, results){
			if (results.length > 0){
				for (var i=0; i<results.length; i++){
					results[i].begindatum = dateFormat(results[i].begindatum);
					results[i].einddatum = dateFormat(results[i].einddatum);
					results[i].boekingsdatum = dateFormat(results[i].boekingsdatum);
					results[i].prijs = results[i].nachten * results[i].prijs * results[i].personen;
				}
			}
			res.locals.bookings = results;
			res.render('bookings/index');
		});
	});
});

// Afhandeling van het boeken van een kamer
router.post('/book/:id', function(req, res){
	var roomid = req.params.id;
	var startDate = req.body.startdatum;
	var endDate = req.body.einddatum;
	if (checkIfDate(startDate) == false || checkIfDate(endDate) == false){
		req.session.dateError = 'Voer een geldige datum in.';
		res.redirect('/rooms/'+roomid);
	} else if(compareDates(startDate, endDate) == false){
		req.session.dateError = 'Voer een geldige datum in.'
		res.redirect('/rooms/'+roomid);
	} else{
		req.getConnection(function (err, connection){
			var data = {
				userid: req.session.userid,
				roomid: parseInt(req.params.id),
				personen: parseInt(req.body.personen),
				begindatum: req.body.startdatum,
				einddatum: req.body.einddatum,
				boekingsdatum: new Date()
			}
			connection.query("INSERT INTO bookings set ?", [data], function(err, results){
				if (err){
					console.log(err);
				}
				res.redirect("/bookings");
			});
		});
		req.session.dateError = false;
	}
});

// Afhandeling 404
router.get('*', function(req, res, next) {
	res.render('404', {url: req.url});
});

module.exports = router;
