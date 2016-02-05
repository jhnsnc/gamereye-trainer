var hotspotNum;
var $shapeContainer;
var shapeX, shapeY, shapeWidth, shapeHeight;
var isEnabled, eyeTrackingEnabled;
var alertDelay, alertTimeout, alertAnimationInterval, alertAnimationPulseOn;

//functions - storage

function storeShapeDimensions() {
	if (typeof hotspotNum !== 'number') { console.log('hotspotNum not valid'); return; }

	window.localStorage.setItem('et.h'+hotspotNum+'.shape.x', shapeX);
	window.localStorage.setItem('et.h'+hotspotNum+'.shape.y', shapeY);
	window.localStorage.setItem('et.h'+hotspotNum+'.shape.width', shapeWidth);
	window.localStorage.setItem('et.h'+hotspotNum+'.shape.height', shapeHeight);
}

function handleStorage(evt) {
	if (typeof hotspotNum !== 'number') { console.log('hotspotNum not valid'); return; }
	switch (evt.key) {
		case 'et.h'+hotspotNum+'.shape.x':
			shapeX = parseInt(evt.newValue,10);
			updateShapeDimensions();
			break;
		case 'et.h'+hotspotNum+'.shape.y':
			shapeY = parseInt(evt.newValue,10);
			updateShapeDimensions();
			break;
		case 'et.h'+hotspotNum+'.shape.width':
			shapeWidth = parseInt(evt.newValue,10);
			updateShapeDimensions();
			break;
		case 'et.h'+hotspotNum+'.shape.height':
			shapeHeight = parseInt(evt.newValue,10);
			updateShapeDimensions();
			break;
		case 'et.h'+hotspotNum+'.is_enabled':
			handleEnabledStatus( evt.newValue === "true" );
			break;
		case 'et.h'+hotspotNum+'.alert_delay':
			alertDelay = parseInt(evt.newValue,10);
			break;
		case 'et.h'+hotspotNum+'.user_gaze_active':
			handleUserGaze( evt.newValue === "true" );
			break;
		case 'et.h'+hotspotNum+'.restore':
			handleRestore();
			break;
		case 'et.edit_mode':
			updateEditMode( evt.newValue === "true" );
			break;
		case 'et.tracking_enabled':
			updateTracking( evt.newValue === "true" );
			break;
		default:
			break;
	}
}

function handleEnabledStatus(newVal) {
	if ( newVal !== isEnabled ) {
		isEnabled = newVal;

		if (isEnabled) {
			console.log("Hotspot Enabled");	
			restoreWindow();
		} else {
			console.log("Hotspot Disabled");
			minimizeWindow();
		}
	}
}

function handleRestore() {
	window.localStorage.setItem('et.h'+hotspotNum+'.restore', false);
	if (isEnabled) {
		restoreWindow();
	}
}

function updateEditMode(val) {
	if ( val ) {
		$shapeContainer.addClass('edit-mode-active');
	} else {
		$shapeContainer.removeClass('edit-mode-active');
	}
}

function updateTracking(val) {
	eyeTrackingEnabled = val;
	if (eyeTrackingEnabled) {
		restartTimer();
	} else {
		cleanupAlert();
	}
}

//functions - shape

function updateShapeDimensions() {
	console.log("Resizing Window");
	console.log("x: " + shapeX + " / y: " + shapeY + " / w: " + shapeWidth + " / h: " + shapeHeight);
	//$shapeContainer.css({width: shapeWidth, height: shapeHeight}); 
	resizeWindow(shapeX, shapeY, shapeWidth + 10, shapeHeight + 10);
}

window['onDragActionComplete'] = function(x, y, width, height) { //gets called from window-management.js when a dragResize or dragMove action is completed
	console.log("Drag complete -- new dimensions below");
	console.log("x: " + shapeX + " / y: " + shapeY + " / w: " + shapeWidth + " / h: " + shapeHeight);

	shapeX = x;
	shapeY = y;
	shapeWidth = width - 10;
	shapeHeight = height - 10;

	storeShapeDimensions();
}

//functions - timer

function handleUserGaze(isGazeActive) {
	if ( isGazeActive ) {
		console.log("User Gaze Active");

		$shapeContainer.addClass('gaze-active');

		restartTimer();
	} else {
		console.log("User Gaze Off");

		$shapeContainer.removeClass('gaze-active');
	}
}

function restartTimer() {
	cleanupAlert(); //also clears pending timeouts
	alertTimeout = setTimeout(startAlert, alertDelay * 1000);
}

function startAlert() {
	if (eyeTrackingEnabled) {
		//add alert class (animation to be handled in CSS)
		$shapeContainer.addClass('alert-active');
		alertAnimationPulseOn = false;
		//set up animation interval
		if (alertAnimationInterval) {
			clearInterval(alertAnimationInterval);
			alertAnimationInterval = undefined;
		}
		alertAnimationInterval = setInterval(pulseAlertAnimation, 500); //full cycle = 1 second

		//add an additional class after alert has been active for 5 seconds
		if (alertTimeout) {
			clearTimeout(alertTimeout);
			alertTimeout = undefined;
		}
		alertTimeout = setTimeout(emphasizeAlert, 5 * 1000);
	} else {
		cleanupAlert();
	}
}

function emphasizeAlert() {
	if (eyeTrackingEnabled) {
		//clear timeout
		if (alertTimeout) {
			clearTimeout(alertTimeout);
			alertTimeout = undefined;
		}
		//change interval
		if (alertAnimationInterval) {
			clearInterval(alertAnimationInterval);
			alertAnimationInterval = undefined;
		}
		alertAnimationInterval = setInterval(pulseAlertAnimation, 300); //full cycle = 600 miliseconds
		//add emphasize class (handle animation change in CSS)
		$shapeContainer.addClass('alert-emphasize');
	} else {
		cleanupAlert();
	}
}

function cleanupAlert() {
	alertAnimationPulseOn = false;
	//clear timeout and interval
	if (alertTimeout) {
		clearTimeout(alertTimeout);
		alertTimeout = undefined;
	}
	if (alertAnimationInterval) {
		clearInterval(alertAnimationInterval);
		alertAnimationInterval = undefined;
	}
	//remove alert classes
	$shapeContainer.removeClass('alert-active');
	$shapeContainer.removeClass('alert-emphasize');
	$shapeContainer.removeClass('alert-pulse-off');
	$shapeContainer.removeClass('alert-pulse-on');
}

function pulseAlertAnimation() {
	alertAnimationPulseOn = !alertAnimationPulseOn;

	if (alertAnimationPulseOn) {
		$shapeContainer.removeClass('alert-pulse-off');
		$shapeContainer.addClass('alert-pulse-on');
	} else {
		$shapeContainer.removeClass('alert-pulse-on');
		$shapeContainer.addClass('alert-pulse-off');
	}
}

//init
$(document).ready(function init() {
	hotspotNum = $('body').data('hotspot-num');
	$shapeContainer = $('.shape-container');

	console.log("Setting up hotspot #" + hotspotNum);

	$('h1').html( hotspotNum );

	//storage
	window.addEventListener('storage', handleStorage, false);

	var val;
	if (typeof hotspotNum === 'number') {
		//get initial shape
		val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.x');
		shapeX = (val) ? parseInt(val, 10) : 0;
		val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.y');
		shapeY = (val) ? parseInt(val, 10) : 0;
		val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.width');
		shapeWidth = (val) ? parseInt(val, 10) : 300;
		val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.height');
		shapeHeight = (val) ? parseInt(val, 10) : 100;

		isEnabled = window.localStorage.getItem('et.h'+hotspotNum+'.is_enabled') === "true";

		val = window.localStorage.getItem('et.h'+hotspotNum+'.alert_delay');
		alertDelay = (val) ? parseInt(val, 10) : 15;

		if (window.localStorage.getItem('et.h'+hotspotNum+'.user_gaze_active') === "true") {
			window.localStorage.setItem('et.h'+hotspotNum+'.user_gaze_active', false);
		}
		if (window.localStorage.getItem('et.h'+hotspotNum+'.restore') === "true") {
			window.localStorage.setItem('et.h'+hotspotNum+'.restore', false);
		}

		eyeTrackingEnabled = window.localStorage.getItem('et.tracking_enabled') === "true";
	}
	updateEditMode( window.localStorage.getItem('et.edit_mode') === "true" );

	//initial setup
	restartTimer();
	updateShapeDimensions();
	if (!isEnabled) {
		minimizeWindow();
	}
});
