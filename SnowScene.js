// SnowScene.js - Happy Holidays 2013 main snow scene
// Author: Ayodeji Oshinnaiye
// Dependent upon:
//  -Utility.js
//  -InternalConstants.js
//  -SnowFlakePlane.js

function snowScene(snowFlakePlaneList, messageTextArray) {
	this.constTextDisplayPhaseFadeIn = 0;
	this.constTextDisplayPhaseDisplayText = 1;	
	this.constTextDisplayPhaseFadeOut = 2;
	this.constTextDisplayPhaseInterMessagePause = 3;
	
	// Duration required for a text fade in/out event (milliseconds)
	this.constTextLineFadeDuration = 1500;

	// Duration that each line of text will be displayed, or the current
	// inter-message pause duration (milliseconds)
	this.currentMessageDelayValue = 0;	
	this.currentDisplayMessage = "";
		
	this.textDisplayTimer = 0;
	this.currentTextDisplayPhase = this.constTextDisplayPhaseFadeIn;
	this.currentArrayIndex = 0;
	
	// Text height, in pixels
	this.constTextHeightPx = 30;

	// Name of the font to be used for text drawing.	
	this.constTextFontName = "arial";
	this.constTextFontStyle = "italic";
	
	// RGB components (string) for text fill and outline colors
	this.constTextFontRgbFillColorTriplet = "0, 0, 0";
	this.constTextFontRgbOutlineColorTriplet = " 255, 255, 255";
	
	this.snowFlakePlaneList = snowFlakePlaneList;
	this.messageTextArray = messageTextArray;
	this.backgroundSourceCanvas = document.createElement("canvas");
	this.backgroundSourceCanvas.width = Constants.defaultCanvasWidth;
	this.backgroundSourceCanvas.height = Constants.defaultCanvasHeight;
	this.backgroundSourceCanvasContext = this.backgroundSourceCanvas.getContext("2d");
	
	this.textBackgroundErasureCanvas = document.createElement("canvas");
	this.textBackgroundErasureCanvas.width = this.backgroundSourceCanvas.width;
	this.textBackgroundErasureCanvas.height = this.backgroundSourceCanvas.height;
	this.textBackgroundErasureContext = this.textBackgroundErasureCanvas.getContext("2d");
	this.eraseTextRect = null;
	
	this.firstFrameRendered = false;
}

/**
 * Initializes the snowflake animation scene
 *  (must be invoked before the object is used)
 */
snowScene.prototype.initialize = function() {
	clearContext(this.backgroundSourceCanvasContext, "RGBA(0, 0, 0, 255)");
	
	// Draw the snow scene background, which will persist, as the image data
	// from the background will be used to "erase" portions of the target
	// context when updates are performed.
	this.backgroundSourceCanvasContext.save();
	var backgroundImage = globalResources.getSnowSceneImage()
	if (validateVar(backgroundImage)) {
		this.backgroundSourceCanvasContext.drawImage(backgroundImage, 0, 0, 
			this.backgroundSourceCanvas.width, this.backgroundSourceCanvas.height);
			
		this.textBackgroundErasureContext.drawImage(this.backgroundSourceCanvas, 0, 0);			
	}
	this.backgroundSourceCanvasContext.restore();
	
	// Set-up the initial message to be displayed.
	this.updateMessageDisplayAndDelay();		
}

/**
 * Updates the timer/states used to internally determine
 *  what text to display, text display transitions, and display
 *  durations
 * @param timeQuantum Time quantum delta with respect to the last
 *                    displayed frame (milliseconds)
 */
snowScene.prototype.updateTextTimerAndIndex = function(timeQuantum) {
	if (validateVar(timeQuantum)) {
		// Update the text display timer...
		this.textDisplayTimer += timeQuantum;

		// Determine if the current text display phase has been completed - if so,
		// proceed to the next phase.
		switch (this.currentTextDisplayPhase) {
			case this.constTextDisplayPhaseFadeIn:
				if (this.textDisplayTimer >= this.constTextLineFadeDuration) {
					this.currentTextDisplayPhase = this.constTextDisplayPhaseDisplayText;
					this.textDisplayTimer = 0;
				}
				break;
			case this.constTextDisplayPhaseDisplayText:
				if (this.textDisplayTimer >= this.currentMessageDelayValue) {
					this.currentTextDisplayPhase = this.constTextDisplayPhaseFadeOut;
					this.textDisplayTimer = 0;				
				}		
				break;
			case this.constTextDisplayPhaseFadeOut:
				if (this.textDisplayTimer >= this.constTextLineFadeDuration) {
					this.textDisplayTimer = 0;
					this.currentArrayIndex++;			

					this.setDisplayPhaseByContext();					
					
					this.updateMessageDisplayAndDelay();
				}
				break;
			case this.constTextDisplayPhaseInterMessagePause:
				if (this.textDisplayTimer >= this.currentMessageDelayValue) {
					this.textDisplayTimer = 0;
					this.currentArrayIndex++;
					
					this.setDisplayPhaseByContext();
					
					this.updateMessageDisplayAndDelay();
				}
				break;
		}
	}	
}

/**
 * Properly sets the internal text display phase, based
 *  upon the current text display/update context.
 */
snowScene.prototype.setDisplayPhaseByContext = function() {
	switch (this.currentTextDisplayPhase) {
		case this.constTextDisplayPhaseFadeOut:
		case this.constTextDisplayPhaseInterMessagePause:
			if (this.currentArrayIndex < this.messageTextArray.length) {
				this.currentTextDisplayPhase =
					(typeof this.messageTextArray[this.currentArrayIndex] == "string")? 
					this.constTextDisplayPhaseFadeIn :
					this.constTextDisplayPhaseInterMessagePause;
					
				// Indicate that the background image used for text erasure should
				// be updated, as new text will be drawn (which may result in a string
				// of a different length being drawn).
				this.refreshTextCanvasContents = true;
			}
			else {
				this.currentTextDisplayPhase = this.constTextDisplayPhaseFadeIn;
			}
			
			break;
	}
}

/**
 * Updates the internally-used message display text and
 *  message delay values for the message to be displayed
 *  next.
 */
snowScene.prototype.updateMessageDisplayAndDelay = function() {
	if (this.currentArrayIndex < this.messageTextArray.length)
	{
		if ((typeof this.messageTextArray[this.currentArrayIndex] === "string") &&
			((this.currentArrayIndex + 1) < this.messageTextArray.length)) {
			
			// The current array index references a string - set the current string to be
			// the message to be displayed.
			this.currentDisplayMessage = this.messageTextArray[this.currentArrayIndex];	
			
			if (typeof this.messageTextArray[this.currentArrayIndex + 1] === "number") {
				// The array index subsequent to the string is a number - use this number to
				// determine the duration for which the text should be displayed.
				this.currentMessageDelayValue = this.messageTextArray[this.currentArrayIndex + 1];
				this.currentArrayIndex++;
			}
			else {
				this.currentMessageDelayValue = 0;
			}			
		}
		else if (typeof this.messageTextArray[this.currentArrayIndex] === "number") {
			// A number exists without a preceding string - use the number to specify an
			// inter-message delay value.
			this.currentDisplayMessage = "";
			this.currentMessageDelayValue = this.messageTextArray[this.currentArrayIndex];
		}
	}
	else if (this.messageTextArray.length > 0)
	{
		// Restart the text display at the initial message.
		this.currentArrayIndex = 0;
		this.updateMessageDisplayAndDelay();
	}
}

/**
 * Draws current message text to the specified target
 *  canvas
 * @param targetCanvasContext {CanvasRenderingContext2D} Canvas context
 *                            onto which the text will be drawn
 */
snowScene.prototype.drawTextDisplay = function(targetCanvasContext) {
	if (validateVar(targetCanvasContext)) {
	
		var drawText = false;
	
		var textAlpha = 1.0;
		
		// Additional text width padding (compensates for internal text
		// width computations that may not be correct due to font typeface
		// modifications such as italics).
		var textWidthExtraPadding = 30;
	
		switch (this.currentTextDisplayPhase) {
			case this.constTextDisplayPhaseFadeIn:
				textAlpha = Math.min(this.textDisplayTimer / this.constTextLineFadeDuration, 1.0);
				drawText = true;
				break;
			case this.constTextDisplayPhaseDisplayText:
				break;
			case this.constTextDisplayPhaseFadeOut:
				textAlpha = 1.0 - Math.min(this.textDisplayTimer / this.constTextLineFadeDuration, 1.0);
				drawText = true;
				break;			
				break;
			case this.constTextDisplayPhaseInterMessagePause:
				break;
		}
	
		if (drawText) {	
			targetCanvasContext.save();
			this.backgroundSourceCanvasContext.save();			
			
			this.backgroundSourceCanvasContext.font = this.constTextFontStyle + " " + this.constTextHeightPx + "px " + this.constTextFontName;
			var messageWidth = this.backgroundSourceCanvasContext.measureText(this.currentDisplayMessage).width + textWidthExtraPadding;
			var messageHeight = this.constTextHeightPx;
			
			// Permit extra height within the bounding box in order 
			var boundingBoxHeight = messageHeight * 2;
			
			var messageLocationX = (targetCanvasContext.canvas.width - messageWidth) / 2.0;
			var messageLocationY = (targetCanvasContext.canvas.height - messageHeight) / 2.0;
			var boundingBoxLocationY = (targetCanvasContext.canvas.height - boundingBoxHeight) / 2.0;
	
			if (this.eraseTextRect != null) {
				// Erase the previously-drawn text on the background.
				targetCanvasContext.drawImage(this.textBackgroundErasureCanvas,
					this.eraseTextRect.left, this.eraseTextRect.top, this.eraseTextRect.width, this.eraseTextRect.height,
					this.eraseTextRect.left, this.eraseTextRect.top, this.eraseTextRect.width, this.eraseTextRect.height);
				this.backgroundSourceCanvasContext.drawImage(this.textBackgroundErasureCanvas,
					this.eraseTextRect.left, this.eraseTextRect.top, this.eraseTextRect.width, this.eraseTextRect.height,
					this.eraseTextRect.left, this.eraseTextRect.top, this.eraseTextRect.width, this.eraseTextRect.height);
			}
			
			// Update the text erasure region specification.
			this.refreshTextCanvasContents = false;
			this.eraseTextRect = new rectangle(messageLocationX, boundingBoxLocationY, messageWidth,
				boundingBoxHeight);

			this.backgroundSourceCanvasContext.textBaseline = "top";
			this.backgroundSourceCanvasContext.fillStyle = "RGBA(" + this.constTextFontRgbFillColorTriplet + ", " + textAlpha + ")";
			this.backgroundSourceCanvasContext.strokeStyle = "RGBA(" + this.constTextFontRgbOutlineColorTriplet + ", " + textAlpha + ")";
			this.backgroundSourceCanvasContext.fillText(this.currentDisplayMessage, messageLocationX, messageLocationY);
			this.backgroundSourceCanvasContext.strokeText(this.currentDisplayMessage, messageLocationX, messageLocationY);
			
			targetCanvasContext.drawImage(this.backgroundSourceCanvas, messageLocationX, boundingBoxLocationY,
				messageWidth, boundingBoxHeight, messageLocationX, boundingBoxLocationY, messageWidth, boundingBoxHeight);
				
			this.backgroundSourceCanvasContext.restore();				
			targetCanvasContext.restore();		
		}
	}
}

/**
 * Executes a time-parameterized single scene animation step
 * @param timeQuantum Time delta with respect to the previously-executed
 *                    animation step (milliseconds)
 * @param targetCanvasContext {CanvasRenderingContext2D} Context onto which
 *                            the scene data will be drawn
 */
snowScene.prototype.executeStep = function(timeQuantum, targetCanvasContext) {
	// Iterate through all snowflake planes, updating the snowflake positions,
	// and redrawing the snowflakes.
	if (this.firstFrameRendered === false) {	
		// First frame is being rendered - draw the initial representation of the scene; during
		// subsequent drawing passes, only portions of the scene will be updated as necessary.
		targetCanvasContext.drawImage(this.backgroundSourceCanvas, 0, 0);
						
		this.firstFrameRendered = true;
	}
	
	// Erase all planes
	for (var planeEraseIndex = 0; planeEraseIndex < this.snowFlakePlaneList.length; planeEraseIndex++) {
		this.snowFlakePlaneList[planeEraseIndex].eraseSnowFlakes(this.backgroundSourceCanvasContext, targetCanvasContext);
		this.snowFlakePlaneList[planeEraseIndex].updateSnowFlakePositions(timeQuantum);
	}
	
	// Update the message text display.
	this.drawTextDisplay(targetCanvasContext);
	
	// Render all snowflake planes
	for (var planeRenderIndex = 0; planeRenderIndex < this.snowFlakePlaneList.length; planeRenderIndex++) {
		this.snowFlakePlaneList[planeRenderIndex].renderSnowFlakes(targetCanvasContext);
	}
	
	// Update the timer that determine the duration of message text display for the
	// current message.
	this.updateTextTimerAndIndex(timeQuantum);
}