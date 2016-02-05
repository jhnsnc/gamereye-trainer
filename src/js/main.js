var screenW = 1920, screenH = 1080; //assuming 1080p until I can detect dynamically
var hotspotsData;
var eyeTrackingEnabled;
var configuringHotspotNum;

//functions - storage

function handleStorage(evt) {
	for (var i = 0; i < 4; i++) {
		switch (evt.key) {
			case 'et.h'+(i+1)+'.shape.x':
				console.log("updating hotspot #"+(i+1)+" x="+parseInt(evt.newValue,10));
				hotspotsData[i].x = parseInt(evt.newValue,10);
				if ( configuringHotspotNum === i+1 ) {
					updateConfigPanelValues( configuringHotspotNum );
				}
				break;
			case 'et.h'+(i+1)+'.shape.y':
				console.log("updating hotspot #"+(i+1)+" y="+parseInt(evt.newValue,10));
				hotspotsData[i].y = parseInt(evt.newValue,10);
				if ( configuringHotspotNum === i+1 ) {
					updateConfigPanelValues( configuringHotspotNum );
				}
				break;
			case 'et.h'+(i+1)+'.shape.width':
				console.log("updating hotspot #"+(i+1)+" width="+parseInt(evt.newValue,10));
				hotspotsData[i].width = parseInt(evt.newValue,10);
				if ( configuringHotspotNum === i+1 ) {
					updateConfigPanelValues( configuringHotspotNum );
				}
				break;
			case 'et.h'+(i+1)+'.shape.height':
				console.log("updating hotspot #"+(i+1)+" height="+parseInt(evt.newValue,10));
				hotspotsData[i].height = parseInt(evt.newValue,10);
				if ( configuringHotspotNum === i+1 ) {
					updateConfigPanelValues( configuringHotspotNum );
				}
				break;
			default:
				break;
		}
	}
}

function setEditMode(editModeActive) {
	window.localStorage.setItem('et.edit_mode', !!editModeActive);
}

function setTrackingMode(eyeTracking) {
	window.localStorage.setItem('et.tracking_enabled', !!eyeTracking);
}

function getHotspotData(hotspotNum) {
	var val;
	var hotspotData = {};
	
	//x
	val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.x');
	if ( val !== null ) {
		hotspotData.x = parseInt(val, 10);
	} else {
		hotspotData.x = getDefaultData(hotspotNum, 'x');
		window.localStorage.setItem('et.h'+hotspotNum+'.shape.x', hotspotData.x);
	}
	//y
	val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.y');
	if ( val !== null ) {
		hotspotData.y = parseInt(val, 10);
	} else {
		hotspotData.y = getDefaultData(hotspotNum, 'y');
		window.localStorage.setItem('et.h'+hotspotNum+'.shape.y', hotspotData.y);
	}
	//width
	val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.width');
	if ( val !== null ) {
		hotspotData.width = parseInt(val, 10);
	} else {
		hotspotData.width = getDefaultData(hotspotNum, 'width');
		window.localStorage.setItem('et.h'+hotspotNum+'.shape.width', hotspotData.width);
	}
	//height
	val = window.localStorage.getItem('et.h'+hotspotNum+'.shape.height');
	if ( val !== null ) {
		hotspotData.height = parseInt(val, 10);
	} else {
		hotspotData.height = getDefaultData(hotspotNum, 'height');
		window.localStorage.setItem('et.h'+hotspotNum+'.shape.height', hotspotData.height);
	} 
	//is enabled
	val = window.localStorage.getItem('et.h'+hotspotNum+'.is_enabled');
	if ( val !== null ) {
		hotspotData.isEnabled = (val === "true");
	} else {
		hotspotData.isEnabled = getDefaultData(hotspotNum, 'is_enabled');
		window.localStorage.setItem('et.h'+hotspotNum+'.is_enabled', hotspotData.isEnabled);
	}
	//alert delay
	val = window.localStorage.getItem('et.h'+hotspotNum+'.alert_delay');
	if ( val !== null ) {
		hotspotData.alertDelay = parseInt(val, 10);
	} else {
		hotspotData.alertDelay = getDefaultData(hotspotNum, 'alert_delay');
		window.localStorage.setItem('et.h'+hotspotNum+'.alert_delay', hotspotData.alertDelay);
	}

	//userGazeActive is reset for each new session. it only hits localStorage when the controller needs to communicate with the view windows
	hotspotData.userGazeActive = false;

	return hotspotData;
}

function getDefaultData(hotspotNum, propName) {
	switch (hotspotNum) {
		case 1:
			switch (propName) {
				case "x":
					return screenW - 290; break;
				case "y":
					return screenH - 310; break;
				case "width":
					return 285; break;
				case "height":
					return 305; break;
				case "is_enabled":
					return true; break;
				case "alert_delay":
					return 10; break;
				default: break;
			}
			break;
		case 2:
			switch (propName) {
				case "x":
					return (0.5 * screenW) - (700 / 2); break;
				case "y":
					return -10; break;
				case "width":
					return 700; break;
				case "height":
					return 100; break;
				case "is_enabled":
					return true; break;
				case "alert_delay":
					return 30; break;
				default: break;
			}
			break;
		case 3:
			switch (propName) {
				case "x":
					return 50; break;
				case "y":
					return 50; break;
				case "width":
					return 300; break;
				case "height":
					return 200; break;
				case "is_enabled":
					return false; break;
				case "alert_delay":
					return 15; break;
				default: break;
			}
			break;
		case 4:
			switch (propName) {
				case "x":
					return 50; break;
				case "y":
					return screenH - 380; break;
				case "width":
					return 300; break;
				case "height":
					return 200; break;
				case "is_enabled":
					return false; break;
				case "alert_delay":
					return 15; break;
				default: break;
			}
			break;
		default: break;
	}
}

//window control

function toggleHotspotEnabled(hotspotNum) {
	var newVal = !hotspotsData[hotspotNum-1].isEnabled;
	hotspotsData[hotspotNum-1].isEnabled = newVal;
	window.localStorage.setItem('et.h'+hotspotNum+'.is_enabled', newVal);
}

function toggleEyeTracking(evt) {
	if ( !eyeTrackingEnabled ) { //enable
		$('body').removeClass('eye-tracking-off');
		$('body').addClass('eye-tracking-on');
		eyeTrackingEnabled = true;
		restoreAllHotspotWindows();
	} else { //disable
		$('body').removeClass('eye-tracking-on');
		$('body').addClass('eye-tracking-off');
		eyeTrackingEnabled = false;
	}

	setTrackingMode(eyeTrackingEnabled);
}

function toggleConfigPanel(evt) {
	$('body').toggleClass('show-config');
}

function restoreAllHotspotWindows() {
	for (var i=0; i<4; i++) {
		window.localStorage.setItem('et.h'+(i+1)+'.restore', true);
	}
}

//config panel

function updateConfigPanelValues(hotspotNum) {
	//edit mode
	if ( window.localStorage.getItem('et.edit_mode') === "true" ) {
		$('#radio-edit-mode-on').trigger('click', true);
	} else {
		$('#radio-edit-mode-off').trigger('click', true);
	}
		//$('[name=radio-edit-mode]:checked').val();
	//hotspot
	if ( $('[name=radio-selected-hotspot]:checked').val() !== ""+hotspotNum ) {
		$('#radio-hotspot-'+hotspotNum).trigger('click', true);
	}
		//$('[name=radio-selected-hotspot]:checked').val();
	//enabled
	if ( hotspotsData[hotspotNum-1].isEnabled ) {
		$('#radio-hotspot-enabled-yes').trigger('click', true);
	} else {
		$('#radio-hotspot-enabled-no').trigger('click', true);
	}
		//$('[name=radio-hotspot-enabled]:checked').val();
	//x position
	$('#hotspot-position-x').val( hotspotsData[hotspotNum-1].x );
	//y position
	$('#hotspot-position-y').val( hotspotsData[hotspotNum-1].y );
	//width
	$('#hotspot-width').val( hotspotsData[hotspotNum-1].width );
	//height
	$('#hotspot-height').val( hotspotsData[hotspotNum-1].height );
	//alert delay
	$('#hotspot-alert-delay').val( hotspotsData[hotspotNum-1].alertDelay );
}

function handleEditModeClick(evt, ignoreClick) {
	if ( !ignoreClick ) {
		setEditMode( $('[name=radio-edit-mode]:checked').val() === "true" );
		restoreAllHotspotWindows();
	}
}

function handleSelectedHotspotClick(evt, ignoreClick) {
	if ( !ignoreClick ) {
		var newVal = parseInt( $('[name=radio-selected-hotspot]:checked').val(), 10 );

		if ( !isNaN(newVal) ) {
			configuringHotspotNum = newVal;
			updateConfigPanelValues(configuringHotspotNum);
		}
	}
}

function handleHotspotEnabledClick(evt, ignoreClick) {
	if ( !ignoreClick ) {
		var newVal = $('[name=radio-hotspot-enabled]:checked').val() === "true";
		
		hotspotsData[configuringHotspotNum-1].isEnabled = newVal;
		window.localStorage.setItem( 'et.h'+configuringHotspotNum+'.is_enabled', newVal );
	}
}

function handleXPositionChange(evt) {
	var newVal = parseInt( $('#hotspot-position-x').val(), 10 );

	if ( !isNaN(newVal) ) {
		hotspotsData[configuringHotspotNum-1].x = newVal;
		window.localStorage.setItem( 'et.h'+configuringHotspotNum+'.shape.x', newVal );
	}
}

function handleYPositionChange(evt) {
	var newVal = parseInt( $('#hotspot-position-y').val(), 10 );

	if ( !isNaN(newVal) ) {
		hotspotsData[configuringHotspotNum-1].y = newVal;
		window.localStorage.setItem( 'et.h'+configuringHotspotNum+'.shape.y', newVal );
	}
}

function handleWidthChange(evt) {
	var newVal = parseInt( $('#hotspot-width').val(), 10 );

	if ( !isNaN(newVal) ) {
		hotspotsData[configuringHotspotNum-1].width = newVal;
		window.localStorage.setItem( 'et.h'+configuringHotspotNum+'.shape.width', newVal );
	}
}

function handleHeightChange(evt) {
	var newVal = parseInt( $('#hotspot-height').val(), 10 );

	if ( !isNaN(newVal) ) {
		hotspotsData[configuringHotspotNum-1].height = newVal;
		window.localStorage.setItem( 'et.h'+configuringHotspotNum+'.shape.height', newVal );
	}
}

function handleAlertDelayChange(evt) {
	var newVal = parseInt( $('#hotspot-alert-delay').val(), 10 );

	if ( !isNaN(newVal) ) {
		hotspotsData[configuringHotspotNum-1].alertDelay = newVal;
		window.localStorage.setItem( 'et.h'+configuringHotspotNum+'.alert_delay', newVal );
	}
}

//init
$(document).ready(function init() {
	if (screen.availWidth) {
		screenW = Math.min( screen.availWidth, screenW );
	}
	if (screen.availHeight) {
		screenH = Math.min( screen.availHeight, screenH );
	}	

	//jquery UI setup
	$('.split-selector').buttonset();

	//setup hotspots data
	hotspotsData = [];
	for (var i = 0; i < 4; i++) {
		hotspotsData[i] = getHotspotData(i+1);
		openWindow('hotspot-'+(i+1));
	}

	//storage
	window.addEventListener('storage', handleStorage, false);

	setEditMode(false);

	toggleEyeTracking(); //immediately turn on eye tracking

	configuringHotspotNum = 1;
	updateConfigPanelValues(configuringHotspotNum);

	//button setup - main tabs
	$('.btn-toggle-eye-tracking').on('click', toggleEyeTracking);
	$('.btn-toggle-config').on('click', toggleConfigPanel);
	//button setup - config panel
	$('input[name=radio-edit-mode]').on('click', handleEditModeClick);
	$('input[name=radio-selected-hotspot]').on('click', handleSelectedHotspotClick);
	$('input[name=radio-hotspot-enabled]').on('click', handleHotspotEnabledClick);
	$('#hotspot-position-x').on('change', handleXPositionChange);
	$('#hotspot-position-y').on('change', handleYPositionChange);
	$('#hotspot-width').on('change', handleWidthChange);
	$('#hotspot-height').on('change', handleHeightChange);
	$('#hotspot-alert-delay').on('change', handleAlertDelayChange);
});
