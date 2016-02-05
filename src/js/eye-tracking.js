var eyex;

//functions - eyex

function setupEyeX() {
	overwolf.extensions.current.getExtraObject("eyex", function(res) {
		if (res.status !== "success") {
			console.log('Unable to get EyeX instance');
			console.log(res);
			return;
		}
		eyex = res.object;
		eyex.init();
		eyex.onGazePoint.addListener(handleGazePoint);
	});
}

function handleGazePoint(evt) {
	var i;

	for (i = 0; i < hotspotsData.length; i++) {
		if (hotspotsData[i].isEnabled) {
			if (
				evt.X >= hotspotsData[i].x &&
				evt.X <= hotspotsData[i].x + hotspotsData[i].width &&
				evt.Y >= hotspotsData[i].y &&
				evt.Y <= hotspotsData[i].y + hotspotsData[i].height
			) {
				if ( !hotspotsData[i].userGazeActive ) {
					hotspotsData[i].userGazeActive = true;
					window.localStorage.setItem('et.h'+(i+1)+'.user_gaze_active', true);
				}
			} else {
				if ( hotspotsData[i].userGazeActive ) {
					hotspotsData[i].userGazeActive = false;
					window.localStorage.setItem('et.h'+(i+1)+'.user_gaze_active', false);
				}
			}
		}
	}
}

//init
$(document).ready(function init() {
	setupEyeX();
});