var spanPrice = document.getElementById('totalPrice');
var currentDate = new Date();
var twoDigitMonth=((currentDate.getMonth()+1)>=10)? (currentDate.getMonth()+1) : '0' + (currentDate.getMonth()+1);  
var twoDigitDate=((currentDate.getDate())>=10)? (currentDate.getDate()) : '0' + (currentDate.getDate());
var strDate = currentDate.getFullYear() + "-" + twoDigitMonth + "-" + twoDigitDate;

// Als je ingelogd bent, worden deze vars gevuld en de minimale boekingsdatum op vandaag gezet.
if (spanPrice){
	var roomPrice = document.getElementById('persons').getAttribute('data-roomPrice');
	var pPrice = document.getElementById('pPrice');
	pPrice.classList.add('invisible');
	document.getElementById('startDate').setAttribute('min', strDate);
}

// Functie om de prijs van een boeking te berekenen
function calculatePriceOnChange(){
	var startDate = document.getElementById('startDate').value;
	var endDate = document.getElementById('endDate').value;
	var persons = document.getElementById('persons').value;
	if (startDate.value == '' || endDate == '' || persons == ''){
		return;
	} else{
		startDate = startDate.split('-');
		endDate = endDate.split('-');
		startDate = new Date(parseInt(startDate[0]), parseInt(startDate[1]), parseInt(startDate[2]));
		endDate = new Date(parseInt(endDate[0]), parseInt(endDate[1]), parseInt(endDate[2]));
		var oneDay = 24*60*60*1000;
		var nights = Math.round(Math.abs((startDate.getTime() - endDate.getTime())/(oneDay)));
		var totalPrice = nights * roomPrice * persons;
		spanPrice.innerHTML = totalPrice;
		if (totalPrice > 0){
			pPrice.classList.remove('invisible');
		} else{
			pPrice.classList.add('invisible');
		}
	}
}

if (spanPrice){
	document.getElementById('persons').addEventListener('change', calculatePriceOnChange);
	
	document.getElementById('endDate').addEventListener('change', calculatePriceOnChange);
	
	document.getElementById('startDate').addEventListener('change', function(){
		var startDate = document.getElementById('startDate').value;
		startDate = startDate.split('-');
		startDay = parseInt(startDate[2]);
		minEndDate = startDate[0] + '-' + startDate[1] + '-' + (startDay+1);
		document.getElementById('endDate').setAttribute('min', minEndDate);
		calculatePriceOnChange();
	});
}
