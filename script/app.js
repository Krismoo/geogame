$(document).ready(function(){
	$('body').on('click', 'button', function(event) {
		event.preventDefault();

		window.navigator.geolocation.getCurrentPosition(function(position) {
			console.log(position);
			//doSomething()
		});
	});
});