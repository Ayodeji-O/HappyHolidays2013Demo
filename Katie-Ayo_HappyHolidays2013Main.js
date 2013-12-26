// Katie-Ayo_HappyHolidays2013Main.js - Happy Holidays 2013 demo entry point
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -InternalConstants.js
//  -Utility.js
//  -SnowFlakePlane.js
//  -SnowScene.js
//  -BlobSnowFlake.js

function globalResources() {
}

/**
 * Loads a "snow scene" image, executing the provided
 *  function upon completion of the loading process
 * @param completionFunction {function} Function to be executed when
 *                           loading of the background image has been
 *                           completed
 */
globalResources.loadSnowSceneImage = function(completionFunction) {
	if (validateVar(completionFunction) && (typeof completionFunction == "function")) {
		// Attempt to load the snow scene image, invoking the specified
		// competion function upon success.
		this.snowSceneImage = new Image()
		this.snowSceneImage.onload = completionFunction;
		this.snowSceneImage.src = Constants.snowSceneBackgroundImage;	
	}
}

globalResources.getSnowSceneImage = function() {
	return ((typeof this.snowSceneImage !== "undefined") ? this.snowSceneImage : null);
}

/**
 * Sets the "main" canvas context used for drawing data to the
 *  browser window
 * @param mainCanvasContext {CanvasRenderingContext2D} The canvas context the
 *                          will be retrieved for drawing data to the browser
 *                          window
 */
globalResources.setMainCanvasContext = function(mainCanvasContext) {
	this.mainCanvasContext = mainCanvasContext;
}

/**
 * Retrieves the "main" canvas context used for drawing data
 *  to the browser window
 * @return {CanvasRenderingContext2D} The canvas context used for
 *         drawing data to the browser window
 */
globalResources.getMainCanvasContext = function() {
	return typeof this.mainCanvasContext !== "undefined" ?
		this.mainCanvasContext : null;
}

/**
 * Initializes any required DOM resources
 *  (creates objects, etc.)
 * @param completionFunction Function to be invoked after the
 *                           DOM resource initialization has
 *                           been completed.
 * @param functionParam Completion function parameter
 */
function initDomResources(completionFunction, functionParam) {
	// Create the main canvas on which output
	// will be displayed..
	mainDiv = document.createElement("div");
	
	// Center the div within the window (the height centering will
	// not be retained if the window size has been altered).
	mainDiv.setAttribute("style", "text-align:center; margin-top: " +
		Math.round((window.innerHeight - Constants.defaultCanvasHeight) / 2.0) + "px");
	
	// Add the DIV to the DOM.
	document.body.appendChild(mainDiv);		
	var mainCanvas = document.createElement("canvas");

    if (validateVar(mainCanvas) && (typeof mainCanvas.getContext === 'function')) {
		mainCanvas.width = Constants.defaultCanvasWidth;
		mainCanvas.height = Constants.defaultCanvasHeight;
	
        // Store the two-dimensional context that is
        // required to write data to the canvas.
        mainCanvasContext = mainCanvas.getContext('2d');
    
		if (validateVar(mainCanvasContext)) {
			// Add the canvas object to the DOM (within the DIV).
			mainDiv.appendChild(mainCanvas);
			
			globalResources.setMainCanvasContext(mainCanvasContext);
			
			function loadSnowSceneCompletionFunction() {
				completionFunction(functionParam);
			}
			
			// Load the snow scene image, and execute the demo once the
			// image loading process has been completed.
			globalResources.loadSnowSceneImage(loadSnowSceneCompletionFunction);
		}
    }
	else {
		// HTML 5 canvas object is not supported (e.g. Internet Explorer 8 and earlier).
		document.write(Constants.errorMessageNoCanvasSupport);
	}
}

/**
 * Main routine - function that is
 *  executed when page loading has
 *  completed
 */
onLoadHandler = function() {

	var snowFlakePlaneList = new Array();
	snowFlakePlaneList.push(new snowFlakePlane(0, 75, blobSnowFlake));
	snowFlakePlaneList.push(new snowFlakePlane(3, 75, blobSnowFlake));
	snowFlakePlaneList.push(new snowFlakePlane(5, 25, starSnowFlake));
	snowFlakePlaneList.push(new snowFlakePlane(8, 25, starSnowFlake));	
	snowFlakePlaneList.push(new snowFlakePlane(13, 25, starSnowFlake));
	
	var snowFlakeScene = new snowScene(snowFlakePlaneList, Constants.messageTextArray);
	initDomResources(sceneExecution, snowFlakeScene)
}