// Contains an object that implements a snowflake as a star with
//  recursively-generated spokes
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -Primitives.js

function starSnowFlake() {
	// The number of star spokes must be a multiple of 4.
	var starSpokeMultiplier = 4;
	
	// Maximum number of star spokes sets
	var maxStarSpokeSets = 3;	
	
	// Maximum recursion level used when drawing flake branches
	// from spokes.
	var maxBranchRecursionLevel = 3;
	
	// Minimum number of branches that may extend from one spoke (or sub-branch)
	var minBranches = 1;
	// Maximum number of branches that may extend from one spoke (or sub-branch)
	var maxBranches = 4;
	
	// Minimum length fraction of a branch, relative to its host spoke.
	var minBranchLengthFraction = 0.1;
	// Maximum length fraction of a branch, relative to its host spoke.	
	var maxBranchLengthFraction = 0.5;
	
	// Minimum star snowflake radius.
	var minStarRadius = 50;
	// Maximum star snowflake radius.
	var maxStarRadius = 135;
	
	var defaultStarRadius = getRangedRandomValue(minStarRadius, maxStarRadius);
	
	this.boundingBox = new rectangle(0, 0, defaultStarRadius, defaultStarRadius);
	this.flakeAlpha = 0.70;
	this.flakeColor = "rgba(255, 255, 255, " + this.flakeAlpha + ")";
	
	// Absolute angle at which branches project from the host spoke.
	var minBranchAngle = 2 * Math.PI / 20;
	var maxBranchAngle = 2 * Math.PI / 16;
	
	this.branchAngle = getRangedRandomValue(minBranchAngle, maxBranchAngle);
	
	// Create a star with at least 4 spokes.
	this.numStarSpokes = starSpokeMultiplier * (Math.round(getRangedRandomValue(1, maxStarSpokeSets)));
	
	// Construct a set of length fractions that indicate the relative lengths of the branches,
	// with respect to each host spoke.
	var numBranchesPerSpoke = Math.round(getRangedRandomValue(minBranches, maxBranches));
	this.branchLengthFractions = new Array();	
	for (lengthFractionLoop = 0; lengthFractionLoop < numBranchesPerSpoke; lengthFractionLoop++) {
		this.branchLengthFractions.push(getRangedRandomValue(minBranchLengthFraction, maxBranchLengthFraction));
	}
	
	this.branchRecursionLevel = maxBranchRecursionLevel * Math.random();
	
	this.createOffScreenStarContext();
}

/**
 * Creates an off-screen canvas (and associated canvas context) used
 *  to draw the star snow flake, ensuring that the snowflake only
 *  requires a single image generation event (generating snowflakes
 *  may require too much time to perform real-time drawing).
 */
starSnowFlake.prototype.createOffScreenStarContext = function() {
	this.starOffScreenCanvas = document.createElement("canvas");
	this.starOffScreenCanvas.width = this.boundingBox.getWidth();
	this.starOffScreenCanvas.height = this.boundingBox.getHeight();
	var starOffScreenContext = this.starOffScreenCanvas.getContext("2d");
	clearContext(starOffScreenContext, "RGBA(0, 0, 0, 0)");
	this.drawStarSpokes(starOffScreenContext);
}

/**
 * Renders the representation to a specified canvas
 *  object
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context associated with
 *                            the canvas to which the snowflake
 *                            will be rendered.
 */
starSnowFlake.prototype.render = function(targetCanvasContext) {
	// Render the snowflake as a star.
	if (validateVar(targetCanvasContext)) {
		targetCanvasContext.save();
		targetCanvasContext.drawImage(this.starOffScreenCanvas,
			this.boundingBox.getTopLeft().getX(),
			this.boundingBox.getTopLeft().getY());
		targetCanvasContext.restore();
	}
}

/**
 * Utility routine - draws a line on a specified canvas
 *  (Does not save the canvas context)
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context onto which the line will be drawn
 * @param startPoint {point} Starting point of the line
 * @param endPoint {point} Ending point of the line
 */
starSnowFlake.prototype.drawLine = function(targetCanvasContext, startPoint, endPoint) {
	if (validateVar(targetCanvasContext) && validateVar(startPoint) &&
		validateVar(endPoint)) {
		targetCanvasContext.strokeStyle = this.flakeColor;
		targetCanvasContext.beginPath();
		targetCanvasContext.moveTo(startPoint.getX(), startPoint.getY());		
		targetCanvasContext.lineTo(endPoint.getX(), endPoint.getY());
		targetCanvasContext.stroke();
	}	
}

/**
 * Draws the primary snowflake "spokes," which extend radially from the
 *  snowflake center
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas onto which the spokes will be drawn
 *
 */
starSnowFlake.prototype.drawStarSpokes = function(targetCanvasContext) {
	if (validateVar(targetCanvasContext)) {
	
		// Inner margin (fraction) for the "main" star frame - used to provide a margin
		// for the bounding box, as branches off of the main spoke may
		// exceed the bounding box otherwise.
		var mainStarInnerMarginFct = 0.25;
	
	    // Each snowflake consists primarily of several spokes extending from
		// the center of the flake. The complexity of the snowflake is
		// augmented by "branches" extending from the spoke. A fixed number of
		// branches per spoke in internally specified for each snowflake. The
		// branch arrangement may then be used to recursively generate "sub-branches"
		// on each branch.
		//
		//                    |
		//                    |/ - Branch
		//                    |
		//                    | /  - Branch
		//                    |/
		//                    |
		//        Spoke -     |
		//
	
	
		// Use the star centerpoint and upper point of the top spoke
		// as the initial spoke line during the drawing process.
		var centerPoint = this.boundingBox.getCenter();		
		var starTopSpokePoint = new point (centerPoint.getX(), centerPoint.getY() -
			(this.boundingBox.getHeight() * (1.0 - mainStarInnerMarginFct) / 2.0));
		
		var angleIncrement = 2 * Math.PI / this.numStarSpokes;
		
		// Iterate through the list of spokes, drawing spokes that extend radially
		// for the snowflake center.
		for (var spokeDrawLoop = 0; spokeDrawLoop < this.numStarSpokes;
			spokeDrawLoop++) {
			
			var spokeEndPoint = starTopSpokePoint.rotatePointCopy(centerPoint,
				angleIncrement * spokeDrawLoop);
								
			this.drawLine(targetCanvasContext, centerPoint, spokeEndPoint);
			this.drawBranches(targetCanvasContext, centerPoint, spokeEndPoint,
				this.branchRecursionLevel);
		}	
	}
}

/**
 * [Recursively] draws a set of branches along a specified line
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas onto which the
 *                            branches will be drawn
 * @param hostLineStartPoint {point} Starting point that defines the host line
 *                                   (point ordering implies direction, and is
 *                                   important)
 * @param hostLineEndPoint {point} Ending point that defines the host line 
 *                                   (point ordering implies direction, and is
 *                                   important)
 */
starSnowFlake.prototype.drawBranches = function(targetCanvasContext, hostLineStartPoint, hostLineEndPoint,
	recursionLevel) {
	// Iterate through the length fractions, drawing a branch for each length fraction
	if (validateVar(targetCanvasContext) && validateVar(hostLineStartPoint) &&
		validateVar(hostLineEndPoint) && validateVar(recursionLevel)) {
		if ((this.branchLengthFractions.length > 0) && (recursionLevel > 0)) {
		
			// Compute the length of the host line in terms of a length along each axis
			// (represented here as a vector component in order to facilitate traversal
			// along a host line)...
			var lineXLength = hostLineEndPoint.getX() - hostLineStartPoint.getX();
			var lineYLength = hostLineEndPoint.getY() - hostLineStartPoint.getY();
		
			// Compute the steps along the host line to be used when drawing the lines...			
			var xIncrement = lineXLength / this.branchLengthFractions.length;
			var yIncrement = lineYLength / this.branchLengthFractions.length;
		
			for (var branchDrawLoop = 0; branchDrawLoop < this.branchLengthFractions.length; branchDrawLoop++) {
				var branchStartPoint = new point(hostLineStartPoint.getX() + (xIncrement * branchDrawLoop),
					hostLineStartPoint.getY() + (yIncrement * branchDrawLoop));
				
				var colinearRefBranchEndPoint = new point (
					branchStartPoint.getX() + (lineXLength * this.branchLengthFractions[branchDrawLoop]),
					branchStartPoint.getY() + (lineYLength * this.branchLengthFractions[branchDrawLoop]));
				
				var firstBranchEndPoint = colinearRefBranchEndPoint.rotatePointCopy(hostLineStartPoint,
					this.branchAngle);
				var secondBranchEndPoint = colinearRefBranchEndPoint.rotatePointCopy(hostLineStartPoint,
					-this.branchAngle);
				this.drawLine(targetCanvasContext, branchStartPoint, firstBranchEndPoint);
				this.drawBranches(targetCanvasContext, branchStartPoint, firstBranchEndPoint, recursionLevel - 1);
				this.drawLine(targetCanvasContext, branchStartPoint, secondBranchEndPoint);							
				this.drawBranches(targetCanvasContext, branchStartPoint, secondBranchEndPoint, recursionLevel - 1);	
			}
		}
	}
}

/**
 * Retrieves the snowflake bounding box
 * @return {rectangle} The snowflake bounding box
 */
starSnowFlake.prototype.getBoundingBox = function() {
	return this.boundingBox;
}

/**
 * Sets the absolute top-left coordinate of the snowflake
 * @param topLeftPoint {point} The top-left coordinate of the snowflake,
 *                     in canvas coordinates.
 */
starSnowFlake.prototype.setBoundingBoxTopLeft = function(topLeftPoint) {
	this.boundingBox.setTopLeft(topLeftPoint);
}

/**
 * Adjusts the top-left coordinate of the snowflake, using the provided
 *  coordinate delta values
 * @param deltaX Amount by which the top-left x-coordinate should be offset
 * @param deltaT Amount by which the top-left y-coordinate should be offset
 */
starSnowFlake.prototype.offsetCoords = function(deltaX, deltaY) {
	this.boundingBox.move(deltaX, deltaY);
}
