// InternalConstants.js - Contains common constants used within various classes/routines
// Author: Ayodeji Oshinnaiye

var Constants = {
	/**
	 * Width of the canvas to be displayed
	 */
	defaultCanvasWidth : 960,
	
	/**
	 * Height of the canvas to be displayed
	 */
	defaultCanvasHeight : 720,
	
	/**
	 * Maximum permissible z-order value
	 */
	maxZOrder : 10,
	
	/**
	 * Default number of snowflakes
	 */
	defaultSnowFlakeCount : 25,
	
	/**
	 * Number of milliseconds contained in one second
	 */
	millisecondsPerSecond : 1000,
	
	/**
	 * Background image that will be used for the snow scene
	 */
	snowSceneBackgroundImage : "images/SunnySnowMan.svg",
	
	/**
	 * Error message that is displayed when a browser with
	 *  no canvas support is encountered.
	 */
	errorMessageNoCanvasSupport : "Uh oh... things are not working correctly, since your browser appears to be a bit old. Anyhow, Happy Holidays!",
	
	/**
	 * Message text - a mixed array of strings and numbers.
	 *  Strings are message text lines, and numbers are delays
	 *  (in milliseconds). When a string is succeeded by a number,
	 *  the number represents the duration of the message display
	 *  (not including fade in/fade out time).
	 */
	 messageTextArray : [
		"Happy Holidays from Katie and Ayo!", 7000,
		"We hope that you take the time to enjoy", 5000,
		"The presence of family, friends,", 5000,
		"And Food", 3000,
		"During the holidays.", 5000,
		"Stay warm (or cool) out there!", 5000,
		5000
	]
}
