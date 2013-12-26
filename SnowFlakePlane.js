// SnowFlakePlane.js - Defines a class that maintains a single plane of snowflakes
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Primitives.js
//  -InternalConstants.js

function snowFlakePlane(zOrder, maxSnowFlakeCount, snowFlakeClass) {

	var validatedZOrderValue = returnValidNumOrZero(zOrder);
	this.planeZOrder = Math.min(Math.max(validatedZOrderValue, 0.0), Constants.maxZOrder);
	this.maxSnowFlakeCount = Math.min(Math.max(returnValidNumOrZero(maxSnowFlakeCount), 0.0), Constants.defaultSnowFlakeCount);
	this.snowFlakeList = new Array();
	
	this.updatesSinceLastFlakeAddition = 0;
	
	// [Present] Minimum number of updates that will occur before a snowflake is
	// added (ensures that snowflakes are distributed across the target region).
	this.minUpdatesBeforeNextFlakeAddition = 0;
	
	this.updatesSinceLastFlakeAddition = 0;
	
	// Maximum number of updates that will occur before a snowflake is added.
	this.maxUpdatesBeforeNextFlakeAddition = 50;
	
	// Class that represents the type of snowflakes that will be added
	// to this plane instance.
	this.snowFlakeClass = snowFlakeClass;
	
	// Snow flake falling rate multiplier (dependent upon Z-order - snowflakes
	// contained in planes with a higher Z-order fall faster).
	this.snowFlakeFallRateMultiplier = ((zOrder / Constants.maxZOrder) + 1.0);
	
	// Default snow flake fall rate at z-order of zero, in pixels/second
	this.snowFlakeFallRate = 20.0;
}

/**
 * Returns the plane z-order
 * @return The z-order of the plane
 */
snowFlakePlane.prototype.getZOrder = function() {
	return this.planeZOrder;
}

/**
 * Adds a snowflake to the plane
 */
snowFlakePlane.prototype.addNewSnowFlake = function() {
	// Create a new instance of a snowflake object.
	if (validateVar(this.snowFlakeClass) && this.shouldNewSnowFlakeBeAddedNow()) {
		var newSnowFlake = new this.snowFlakeClass();
		var flakeBoundingBox = newSnowFlake.getBoundingBox();
		var flakeXPos = (Constants.defaultCanvasWidth - flakeBoundingBox.getWidth()) * Math.random();
		var flakeYPos = -flakeBoundingBox.getHeight();
		newSnowFlake.setBoundingBoxTopLeft(new point(flakeXPos, flakeYPos));
		this.snowFlakeList.push(newSnowFlake);
	}
	
	this.updateSnowFlakeAdditionCriteria();	
}

/**
 * Determines if a snowflake should be added to the plane
 * @return True if a snowflake should be added, false otherwise
 */
snowFlakePlane.prototype.shouldNewSnowFlakeBeAddedNow = function() {
	// A new snow flake can be added if the snow flake limit has not been
	// reached, and the 
	return ((this.snowFlakeList.length < this.maxSnowFlakeCount) &&
		(this.updatesSinceLastFlakeAddition >= this.minUpdatesBeforeNextFlakeAddition))
}

/**
 * Updates the criteria used by the snowflake addition logic in
 *  order to determine if a snowflake should be added to the
 *  plane
 * @see snowFlakePlane.shouldNewSnowFlakeBeAddedNow
 */
snowFlakePlane.prototype.updateSnowFlakeAdditionCriteria = function() {
	if (this.shouldNewSnowFlakeBeAddedNow()) {
		this.updatesSinceLastFlakeAddition = 0;
		this.minUpdatesBeforeNextFlakeAddition = Math.random() *
			this.maxUpdatesBeforeNextFlakeAddition;
	}
	else {
		this.updatesSinceLastFlakeAddition++;
	}
}

/**
 * Updates the time-parameterized snowflake positions
 * @param timeQuantum Time delta with respect to the previously-
 *                    invoked positional update (milliseconds)
 */
snowFlakePlane.prototype.updateSnowFlakePositions = function(timeQuantum) {
	if (this.snowFlakeList.length < this.maxSnowFlakeCount) {
		this.addNewSnowFlake();
	}
	
	// Update the position for each snowflake, using the current timequantum and falling
	// rates in order to determine the new displacement over the timequantum interval.
	for (var updatePositionLoop = 0; updatePositionLoop < this.snowFlakeList.length; updatePositionLoop++) {
		var flakeVerticalOffset = 
			this.snowFlakeFallRateMultiplier * this.snowFlakeFallRate * timeQuantum /
			Constants.millisecondsPerSecond;
		this.snowFlakeList[updatePositionLoop].offsetCoords(0, flakeVerticalOffset);
	}
	
	this.removeNonVisibleSnowFlakes()
}

/**
 * Removes snowflakes that have reached the extend of their travel, and
 *  are now longer visible.
 */
snowFlakePlane.prototype.removeNonVisibleSnowFlakes = function() {
	var currentSnowFlakeIndex = 0;
	while (currentSnowFlakeIndex < this.snowFlakeList.length) {
		var flakeBoundingBox = this.snowFlakeList[currentSnowFlakeIndex].getBoundingBox();
		if (flakeBoundingBox.getTopLeft().getY() > Constants.defaultCanvasHeight) {
			this.snowFlakeList.splice(currentSnowFlakeIndex, 1);
		}
		
		currentSnowFlakeIndex++;
	}
}

/**
 * Erases all snowflakes contained within the plane, using
 *  data from a "background" canvas
 * @param sourceCanvasContext {CanvasRenderingContext2D} Canvas that contains the data that will
 *                            be used to erase the snowflake
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas to which the data will be written
 */
snowFlakePlane.prototype.eraseSnowFlakes = function(sourceCanvasContext, targetCanvasContext) {
	// Iterate through the list of snowflakes, erasing each flake...
	for (var eraseFlakeLoop = 0; eraseFlakeLoop < this.snowFlakeList.length; eraseFlakeLoop++) {
		// Overwrite the snowflake in the display buffer, using the original image data
		// from the background, in order to erase the image.
		var flakeBoundingBox = this.snowFlakeList[eraseFlakeLoop].getBoundingBox();

		// Clip the source bounding box to be used with canvas.drawImage(...); otherwise,
		// the routine will generate an exception (Chrome, as tested with version 31.0.1650.63 m,
		// will automatically clip the source bounding box without generating an exception).
		var topLeftX = Math.max(flakeBoundingBox.getTopLeft().getX(), 0);
		var topLeftY = Math.max(flakeBoundingBox.getTopLeft().getY(), 0);
		var width = ((flakeBoundingBox.getTopLeft().getX() + flakeBoundingBox.getWidth()) <=
			sourceCanvasContext.canvas.width) ?
			flakeBoundingBox.getWidth() :
			(sourceCanvasContext.canvas.width - topLeftX);
		var height = ((flakeBoundingBox.getTopLeft().getX() + flakeBoundingBox.getHeight()) <=
			sourceCanvasContext.canvas.height) ?
			flakeBoundingBox.getHeight() :
			(sourceCanvasContext.canvas.height - topLeftY);
		
		// (Try to prevent possible exceptions resulting from using a set of out-of-bounds
		// source coordinates, in the event there is an error in the source bounds
		// verification logic.)
		try {
			// Erase the current snowflake image.
			targetCanvasContext.drawImage(sourceCanvasContext.canvas, 
				topLeftX, topLeftY,
				width, height,
				topLeftX, topLeftY,
				width, height);
		}
		catch (drawImageException) {
		
		}
	}
}

/**
 * Renders all internally-maintained snowflakes
 * @param targetCanvas The canvas onto which the snowflakes will be rendered
 */
snowFlakePlane.prototype.renderSnowFlakes = function(targetCanvasContext) {
	if (validateVar(targetCanvasContext)) {
		// Iterate through the list of snowflakes, rendering all snowflakes
		for (var renderLoop = 0; renderLoop < this.snowFlakeList.length; renderLoop++) {
			this.snowFlakeList[renderLoop].render(targetCanvasContext);
		}
	}
}