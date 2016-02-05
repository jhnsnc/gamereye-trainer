//global variables
var currentWindow;
var isRequestingWindowDimensons;

//functions
function openWindow(name) {
	overwolf.windows.obtainDeclaredWindow(name, function callbackShowWindow(res) {
		//handle error
		if (res.status !== 'success') {
			console.log("Unable to get window: " + windowName);
			console.log(res);
			return;
		}

		var windowId = res.window.id;
		overwolf.windows.restore(windowId, function onOpen() {
			console.log("Opened window: " + name + " (id = " + windowId + ")");
		});
	});
}

function closeWindow() {
	console.log("closeWindow()");
	if (typeof currentWindow === 'undefined') {
		//wait until later to execute
		getWindowThenExecute(closeWindow);
	} else {
		overwolf.windows.close(currentWindow);
	}
}

function minimizeWindow() {
	console.log("minimizeWindow()");
	if (typeof currentWindow === 'undefined') {
		//wait until later to execute
		getWindowThenExecute(minimizeWindow);
	} else {
		overwolf.windows.minimize(currentWindow);
	}
}

function restoreWindow() {
	console.log("restoreWindow()");
	if (typeof currentWindow === 'undefined') {
		//wait until later to execute
		getWindowThenExecute(restoreWindow);
	} else {
		overwolf.windows.restore(currentWindow);
	}
}

function beginDragMove() {
	console.log("beginDragMove()");
	if (typeof currentWindow !== 'undefined') {
		//don't wait until later to execute--now or never
		overwolf.windows.dragMove(currentWindow);
	}
}

function beginDragResize(edge) {
	console.log("beginDragResize()");
	if (typeof currentWindow !== 'undefined') {
		//don't wait until later to execute--now or never
		overwolf.windows.dragResize(currentWindow, edge);
	}
}

function endDragAction() {
	//at the end of a drag action, get the new dimensions and pass them to function onDragActionComplete (if it exists)
	if (typeof window['onDragActionComplete'] === 'function') {
		if (!isRequestingWindowDimensons) {
			isRequestingWindowDimensons = true;
			overwolf.windows.getCurrentWindow(function withCurrentWindow(res) {
				isRequestingWindowDimensons = false;
				window['onDragActionComplete'].call(this, res.window.left, res.window.top, res.window.width, res.window.height);
			});
		}
	}
}

function resizeWindow(x, y, width, height) {
	console.log("resizeWindow()");
	if (typeof currentWindow === 'undefined') {
		//wait until later to execute
		getWindowThenExecute(resizeWindow, x, y, width, height);
	} else {
		overwolf.windows.changeSize(currentWindow, width, height, function onResize() {
			overwolf.windows.changePosition(currentWindow, x, y);
		});
	}
}

function getWindowThenExecute(callback) {
	var callbackArgs = Array.prototype.slice.call(arguments, 1);

	overwolf.windows.getCurrentWindow(function withCurrentWindow(res) {
		if (res.status !== 'success') {
			console.log("Unable to get current window");
			return;
		}
		currentWindow = res.window.id;
		//execute callback
		callback.apply(null, callbackArgs);
	});
}

//misc functions

function bindDragResizeHandlers() {
	var handleDragResizeGrip = function(evt) {
		console.log("begin drag resize from edge: "+evt.data.edge);
		evt.preventDefault();
		unbindDragResizeHandlers();
		beginDragResize(evt.data.edge);
		return false;
	};
	$('.windowDragResizeGrip.top').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.Top}, handleDragResizeGrip);
	$('.windowDragResizeGrip.top-right').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.TopRight}, handleDragResizeGrip);
	$('.windowDragResizeGrip.right').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.Right}, handleDragResizeGrip);
	$('.windowDragResizeGrip.bottom-right').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.BottomRight}, handleDragResizeGrip);
	$('.windowDragResizeGrip.bottom').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.Bottom}, handleDragResizeGrip);
	$('.windowDragResizeGrip.bottom-left').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.BottomLeft}, handleDragResizeGrip);
	$('.windowDragResizeGrip.left').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.Left}, handleDragResizeGrip);
	$('.windowDragResizeGrip.top-left').on('mousedown', {edge: overwolf.windows.enums.WindowDragEdge.TopLeft}, handleDragResizeGrip);

	$(document).off('mousemove');
}

function unbindDragResizeHandlers() {
	var handleDragResizeGripMouseup = function(evt) {
		evt.preventDefault();
		if (evt.which === 0) {
			console.log('end drag resize');
			bindDragResizeHandlers();
			endDragAction(evt);
		}
		return false;
	};
	$('.windowDragResizeGrip.top').off('mousedown');
	$('.windowDragResizeGrip.top-right').off('mousedown');
	$('.windowDragResizeGrip.right').off('mousedown');
	$('.windowDragResizeGrip.bottom-right').off('mousedown');
	$('.windowDragResizeGrip.bottom').off('mousedown');
	$('.windowDragResizeGrip.bottom-left').off('mousedown');
	$('.windowDragResizeGrip.left').off('mousedown');
	$('.windowDragResizeGrip.top-left').off('mousedown');

	$(document).on('mousemove', handleDragResizeGripMouseup);
}

//init
$(document).ready(function init() {
	//current window ID
	getWindowThenExecute(function() {
		console.log("Got current window");
	});

	isRequestingWindowDimensons = false;

	//button actions
	$('.windowDragGrip').on('mousedown', beginDragMove);
	$('.windowDragGrip').on('mouseup', endDragAction);
	$('.btnCloseWindow').on('click', closeWindow);

	// bindDragResizeHandlers(); //cut until Overwolf fixes the dragResize() issue or exposes a 'dragComplete' event
});
