// Contains an object that implements a snowflake as a blob
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Primitives.js

function blobSnowFlake() {
	var defaultBlobRadius = 7;
	this.boundingBox = new rectangle(0, 0, defaultBlobRadius, defaultBlobRadius);
	this.flakeAlpha = 0.70;
	this.flakeColor = "rgba(255, 255, 255, " + this.flakeAlpha + ")";
}

/**
 * Renders the representation to a specified canvas
 *  object
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context associated with
 *                            the canvas to which the snowflake
 *                            will be rendered.
 */
blobSnowFlake.prototype.render = function(targetCanvasContext) {
	// Render the snowflake as a circle ("blob").
	if (validateVar(targetCanvasContext)) {
	
		// Inner margin "fraction," used to ensure that the blob does
		// not exceed the bounding box.
		var blobInnerMarginFct = 0.2;
	
		targetCanvasContext.save();
		targetCanvasContext.beginPath();
		targetCanvasContext.fillStyle = this.flakeColor;
		targetCanvasContext.arc(
			this.boundingBox.getCenter().getX(),
			this.boundingBox.getCenter().getY(),
			(this.boundingBox.getWidth() * (1.0 - blobInnerMarginFct)) / 2.0,
			0,
			Math.PI * 2.0);
		targetCanvasContext.fill();	
		targetCanvasContext.restore();
	}
}

/**
 * Retrieves the snowflake bounding box
 * @return {rectangle} The snowflake bounding box
 */
blobSnowFlake.prototype.getBoundingBox = function() {
	return this.boundingBox;
}

/**
 * Sets the absolute top-left coordinate of the snowflake
 * @param topLeftPoint {point} The top-left coordinate of the snowflake,
 *                     in canvas coordinates.
 */
blobSnowFlake.prototype.setBoundingBoxTopLeft = function(topLeftPoint) {
	if (validateVar(topLeftPoint)) {
		this.boundingBox.setTopLeft(topLeftPoint);
	}
}

/**
 * Adjusts the top-left coordinate of the snowflake, using the provided
 *  coordinate delta values
 * @param deltaX Amount by which the top-left x-coordinate should be offset
 * @param deltaT Amount by which the top-left y-coordinate should be offset
 */
blobSnowFlake.prototype.offsetCoords = function(deltaX, deltaY) {
	if (validateVar(deltaX) && validateVar(deltaY)) {
		this.boundingBox.move(deltaX, deltaY);
	}
}