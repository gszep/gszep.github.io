"use strict";
(self["webpackChunkwebgpu_collab_stringed_entities"] = self["webpackChunkwebgpu_collab_stringed_entities"] || []).push([["index"],{

/***/ "./node_modules/lil-gui/dist/lil-gui.esm.js":
/*!**************************************************!*\
  !*** ./node_modules/lil-gui/dist/lil-gui.esm.js ***!
  \**************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BooleanController: () => (/* binding */ BooleanController),
/* harmony export */   ColorController: () => (/* binding */ ColorController),
/* harmony export */   Controller: () => (/* binding */ Controller),
/* harmony export */   FunctionController: () => (/* binding */ FunctionController),
/* harmony export */   GUI: () => (/* binding */ GUI),
/* harmony export */   NumberController: () => (/* binding */ NumberController),
/* harmony export */   OptionController: () => (/* binding */ OptionController),
/* harmony export */   StringController: () => (/* binding */ StringController),
/* harmony export */   "default": () => (/* binding */ GUI)
/* harmony export */ });
/**
 * lil-gui
 * https://lil-gui.georgealways.com
 * @version 0.20.0
 * @author George Michael Brower
 * @license MIT
 */

/**
 * Base class for all controllers.
 */
class Controller {

	constructor( parent, object, property, className, elementType = 'div' ) {

		/**
		 * The GUI that contains this controller.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The object this controller will modify.
		 * @type {object}
		 */
		this.object = object;

		/**
		 * The name of the property to control.
		 * @type {string}
		 */
		this.property = property;

		/**
		 * Used to determine if the controller is disabled.
		 * Use `controller.disable( true|false )` to modify this value.
		 * @type {boolean}
		 */
		this._disabled = false;

		/**
		 * Used to determine if the Controller is hidden.
		 * Use `controller.show()` or `controller.hide()` to change this.
		 * @type {boolean}
		 */
		this._hidden = false;

		/**
		 * The value of `object[ property ]` when the controller was created.
		 * @type {any}
		 */
		this.initialValue = this.getValue();

		/**
		 * The outermost container DOM element for this controller.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( elementType );
		this.domElement.classList.add( 'controller' );
		this.domElement.classList.add( className );

		/**
		 * The DOM element that contains the controller's name.
		 * @type {HTMLElement}
		 */
		this.$name = document.createElement( 'div' );
		this.$name.classList.add( 'name' );

		Controller.nextNameID = Controller.nextNameID || 0;
		this.$name.id = `lil-gui-name-${++Controller.nextNameID}`;

		/**
		 * The DOM element that contains the controller's "widget" (which differs by controller type).
		 * @type {HTMLElement}
		 */
		this.$widget = document.createElement( 'div' );
		this.$widget.classList.add( 'widget' );

		/**
		 * The DOM element that receives the disabled attribute when using disable().
		 * @type {HTMLElement}
		 */
		this.$disable = this.$widget;

		this.domElement.appendChild( this.$name );
		this.domElement.appendChild( this.$widget );

		// Don't fire global key events while typing in a controller
		this.domElement.addEventListener( 'keydown', e => e.stopPropagation() );
		this.domElement.addEventListener( 'keyup', e => e.stopPropagation() );

		this.parent.children.push( this );
		this.parent.controllers.push( this );

		this.parent.$children.appendChild( this.domElement );

		this._listenCallback = this._listenCallback.bind( this );

		this.name( property );

	}

	/**
	 * Sets the name of the controller and its label in the GUI.
	 * @param {string} name
	 * @returns {this}
	 */
	name( name ) {
		/**
		 * The controller's name. Use `controller.name( 'Name' )` to modify this value.
		 * @type {string}
		 */
		this._name = name;
		this.$name.textContent = name;
		return this;
	}

	/**
	 * Pass a function to be called whenever the value is modified by this controller.
	 * The function receives the new value as its first parameter. The value of `this` will be the
	 * controller.
	 *
	 * For function controllers, the `onChange` callback will be fired on click, after the function
	 * executes.
	 * @param {Function} callback
	 * @returns {this}
	 * @example
	 * const controller = gui.add( object, 'property' );
	 *
	 * controller.onChange( function( v ) {
	 * 	console.log( 'The value is now ' + v );
	 * 	console.assert( this === controller );
	 * } );
	 */
	onChange( callback ) {
		/**
		 * Used to access the function bound to `onChange` events. Don't modify this value directly.
		 * Use the `controller.onChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	/**
	 * Calls the onChange methods of this controller and its parent GUI.
	 * @protected
	 */
	_callOnChange() {

		this.parent._callOnChange( this );

		if ( this._onChange !== undefined ) {
			this._onChange.call( this, this.getValue() );
		}

		this._changed = true;

	}

	/**
	 * Pass a function to be called after this controller has been modified and loses focus.
	 * @param {Function} callback
	 * @returns {this}
	 * @example
	 * const controller = gui.add( object, 'property' );
	 *
	 * controller.onFinishChange( function( v ) {
	 * 	console.log( 'Changes complete: ' + v );
	 * 	console.assert( this === controller );
	 * } );
	 */
	onFinishChange( callback ) {
		/**
		 * Used to access the function bound to `onFinishChange` events. Don't modify this value
		 * directly. Use the `controller.onFinishChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onFinishChange = callback;
		return this;
	}

	/**
	 * Should be called by Controller when its widgets lose focus.
	 * @protected
	 */
	_callOnFinishChange() {

		if ( this._changed ) {

			this.parent._callOnFinishChange( this );

			if ( this._onFinishChange !== undefined ) {
				this._onFinishChange.call( this, this.getValue() );
			}

		}

		this._changed = false;

	}

	/**
	 * Sets the controller back to its initial value.
	 * @returns {this}
	 */
	reset() {
		this.setValue( this.initialValue );
		this._callOnFinishChange();
		return this;
	}

	/**
	 * Enables this controller.
	 * @param {boolean} enabled
	 * @returns {this}
	 * @example
	 * controller.enable();
	 * controller.enable( false ); // disable
	 * controller.enable( controller._disabled ); // toggle
	 */
	enable( enabled = true ) {
		return this.disable( !enabled );
	}

	/**
	 * Disables this controller.
	 * @param {boolean} disabled
	 * @returns {this}
	 * @example
	 * controller.disable();
	 * controller.disable( false ); // enable
	 * controller.disable( !controller._disabled ); // toggle
	 */
	disable( disabled = true ) {

		if ( disabled === this._disabled ) return this;

		this._disabled = disabled;

		this.domElement.classList.toggle( 'disabled', disabled );
		this.$disable.toggleAttribute( 'disabled', disabled );

		return this;

	}

	/**
	 * Shows the Controller after it's been hidden.
	 * @param {boolean} show
	 * @returns {this}
	 * @example
	 * controller.show();
	 * controller.show( false ); // hide
	 * controller.show( controller._hidden ); // toggle
	 */
	show( show = true ) {

		this._hidden = !show;

		this.domElement.style.display = this._hidden ? 'none' : '';

		return this;

	}

	/**
	 * Hides the Controller.
	 * @returns {this}
	 */
	hide() {
		return this.show( false );
	}

	/**
	 * Changes this controller into a dropdown of options.
	 *
	 * Calling this method on an option controller will simply update the options. However, if this
	 * controller was not already an option controller, old references to this controller are
	 * destroyed, and a new controller is added to the end of the GUI.
	 * @example
	 * // safe usage
	 *
	 * gui.add( obj, 'prop1' ).options( [ 'a', 'b', 'c' ] );
	 * gui.add( obj, 'prop2' ).options( { Big: 10, Small: 1 } );
	 * gui.add( obj, 'prop3' );
	 *
	 * // danger
	 *
	 * const ctrl1 = gui.add( obj, 'prop1' );
	 * gui.add( obj, 'prop2' );
	 *
	 * // calling options out of order adds a new controller to the end...
	 * const ctrl2 = ctrl1.options( [ 'a', 'b', 'c' ] );
	 *
	 * // ...and ctrl1 now references a controller that doesn't exist
	 * assert( ctrl2 !== ctrl1 )
	 * @param {object|Array} options
	 * @returns {Controller}
	 */
	options( options ) {
		const controller = this.parent.add( this.object, this.property, options );
		controller.name( this._name );
		this.destroy();
		return controller;
	}

	/**
	 * Sets the minimum value. Only works on number controllers.
	 * @param {number} min
	 * @returns {this}
	 */
	min( min ) {
		return this;
	}

	/**
	 * Sets the maximum value. Only works on number controllers.
	 * @param {number} max
	 * @returns {this}
	 */
	max( max ) {
		return this;
	}

	/**
	 * Values set by this controller will be rounded to multiples of `step`. Only works on number
	 * controllers.
	 * @param {number} step
	 * @returns {this}
	 */
	step( step ) {
		return this;
	}

	/**
	 * Rounds the displayed value to a fixed number of decimals, without affecting the actual value
	 * like `step()`. Only works on number controllers.
	 * @example
	 * gui.add( object, 'property' ).listen().decimals( 4 );
	 * @param {number} decimals
	 * @returns {this}
	 */
	decimals( decimals ) {
		return this;
	}

	/**
	 * Calls `updateDisplay()` every animation frame. Pass `false` to stop listening.
	 * @param {boolean} listen
	 * @returns {this}
	 */
	listen( listen = true ) {

		/**
		 * Used to determine if the controller is currently listening. Don't modify this value
		 * directly. Use the `controller.listen( true|false )` method instead.
		 * @type {boolean}
		 */
		this._listening = listen;

		if ( this._listenCallbackID !== undefined ) {
			cancelAnimationFrame( this._listenCallbackID );
			this._listenCallbackID = undefined;
		}

		if ( this._listening ) {
			this._listenCallback();
		}

		return this;

	}

	_listenCallback() {

		this._listenCallbackID = requestAnimationFrame( this._listenCallback );

		// To prevent framerate loss, make sure the value has changed before updating the display.
		// Note: save() is used here instead of getValue() only because of ColorController. The !== operator
		// won't work for color objects or arrays, but ColorController.save() always returns a string.

		const curValue = this.save();

		if ( curValue !== this._listenPrevValue ) {
			this.updateDisplay();
		}

		this._listenPrevValue = curValue;

	}

	/**
	 * Returns `object[ property ]`.
	 * @returns {any}
	 */
	getValue() {
		return this.object[ this.property ];
	}

	/**
	 * Sets the value of `object[ property ]`, invokes any `onChange` handlers and updates the display.
	 * @param {any} value
	 * @returns {this}
	 */
	setValue( value ) {

		if ( this.getValue() !== value ) {

			this.object[ this.property ] = value;
			this._callOnChange();
			this.updateDisplay();

		}

		return this;

	}

	/**
	 * Updates the display to keep it in sync with the current value. Useful for updating your
	 * controllers when their values have been modified outside of the GUI.
	 * @returns {this}
	 */
	updateDisplay() {
		return this;
	}

	load( value ) {
		this.setValue( value );
		this._callOnFinishChange();
		return this;
	}

	save() {
		return this.getValue();
	}

	/**
	 * Destroys this controller and removes it from the parent GUI.
	 */
	destroy() {
		this.listen( false );
		this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
		this.parent.controllers.splice( this.parent.controllers.indexOf( this ), 1 );
		this.parent.$children.removeChild( this.domElement );
	}

}

class BooleanController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'boolean', 'label' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$widget.appendChild( this.$input );

		this.$input.addEventListener( 'change', () => {
			this.setValue( this.$input.checked );
			this._callOnFinishChange();
		} );

		this.$disable = this.$input;

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.checked = this.getValue();
		return this;
	}

}

function normalizeColorString( string ) {

	let match, result;

	if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {

		result = match[ 2 ];

	} else if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {

		result = parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );

	} else if ( match = string.match( /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i ) ) {

		result = match[ 1 ] + match[ 1 ] + match[ 2 ] + match[ 2 ] + match[ 3 ] + match[ 3 ];

	}

	if ( result ) {
		return '#' + result;
	}

	return false;

}

const STRING = {
	isPrimitive: true,
	match: v => typeof v === 'string',
	fromHexString: normalizeColorString,
	toHexString: normalizeColorString
};

const INT = {
	isPrimitive: true,
	match: v => typeof v === 'number',
	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
	isPrimitive: false,

	// The arrow function is here to appease tree shakers like esbuild or webpack.
	// See https://esbuild.github.io/api/#tree-shaking
	match: v => Array.isArray( v ),

	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target[ 0 ] = ( int >> 16 & 255 ) / 255 * rgbScale;
		target[ 1 ] = ( int >> 8 & 255 ) / 255 * rgbScale;
		target[ 2 ] = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( [ r, g, b ], rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const OBJECT = {
	isPrimitive: false,
	match: v => Object( v ) === v,
	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target.r = ( int >> 16 & 255 ) / 255 * rgbScale;
		target.g = ( int >> 8 & 255 ) / 255 * rgbScale;
		target.b = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( { r, g, b }, rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}

class ColorController extends Controller {

	constructor( parent, object, property, rgbScale ) {

		super( parent, object, property, 'color' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'color' );
		this.$input.setAttribute( 'tabindex', -1 );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$text = document.createElement( 'input' );
		this.$text.setAttribute( 'type', 'text' );
		this.$text.setAttribute( 'spellcheck', 'false' );
		this.$text.setAttribute( 'aria-labelledby', this.$name.id );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$display.appendChild( this.$input );
		this.$widget.appendChild( this.$display );
		this.$widget.appendChild( this.$text );

		this._format = getColorFormat( this.initialValue );
		this._rgbScale = rgbScale;

		this._initialValueHexString = this.save();
		this._textFocused = false;

		this.$input.addEventListener( 'input', () => {
			this._setValueFromHexString( this.$input.value );
		} );

		this.$input.addEventListener( 'blur', () => {
			this._callOnFinishChange();
		} );

		this.$text.addEventListener( 'input', () => {
			const tryParse = normalizeColorString( this.$text.value );
			if ( tryParse ) {
				this._setValueFromHexString( tryParse );
			}
		} );

		this.$text.addEventListener( 'focus', () => {
			this._textFocused = true;
			this.$text.select();
		} );

		this.$text.addEventListener( 'blur', () => {
			this._textFocused = false;
			this.updateDisplay();
			this._callOnFinishChange();
		} );

		this.$disable = this.$text;

		this.updateDisplay();

	}

	reset() {
		this._setValueFromHexString( this._initialValueHexString );
		return this;
	}

	_setValueFromHexString( value ) {

		if ( this._format.isPrimitive ) {

			const newValue = this._format.fromHexString( value );
			this.setValue( newValue );

		} else {

			this._format.fromHexString( value, this.getValue(), this._rgbScale );
			this._callOnChange();
			this.updateDisplay();

		}

	}

	save() {
		return this._format.toHexString( this.getValue(), this._rgbScale );
	}

	load( value ) {
		this._setValueFromHexString( value );
		this._callOnFinishChange();
		return this;
	}

	updateDisplay() {
		this.$input.value = this._format.toHexString( this.getValue(), this._rgbScale );
		if ( !this._textFocused ) {
			this.$text.value = this.$input.value.substring( 1 );
		}
		this.$display.style.backgroundColor = this.$input.value;
		return this;
	}

}

class FunctionController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'function' );

		// Buttons are the only case where widget contains name
		this.$button = document.createElement( 'button' );
		this.$button.appendChild( this.$name );
		this.$widget.appendChild( this.$button );

		this.$button.addEventListener( 'click', e => {
			e.preventDefault();
			this.getValue().call( this.object );
			this._callOnChange();
		} );

		// enables :active pseudo class on mobile
		this.$button.addEventListener( 'touchstart', () => {}, { passive: true } );

		this.$disable = this.$button;

	}

}

class NumberController extends Controller {

	constructor( parent, object, property, min, max, step ) {

		super( parent, object, property, 'number' );

		this._initInput();

		this.min( min );
		this.max( max );

		const stepExplicit = step !== undefined;
		this.step( stepExplicit ? step : this._getImplicitStep(), stepExplicit );

		this.updateDisplay();

	}

	decimals( decimals ) {
		this._decimals = decimals;
		this.updateDisplay();
		return this;
	}

	min( min ) {
		this._min = min;
		this._onUpdateMinMax();
		return this;
	}

	max( max ) {
		this._max = max;
		this._onUpdateMinMax();
		return this;
	}

	step( step, explicit = true ) {
		this._step = step;
		this._stepExplicit = explicit;
		return this;
	}

	updateDisplay() {

		const value = this.getValue();

		if ( this._hasSlider ) {

			let percent = ( value - this._min ) / ( this._max - this._min );
			percent = Math.max( 0, Math.min( percent, 1 ) );

			this.$fill.style.width = percent * 100 + '%';

		}

		if ( !this._inputFocused ) {
			this.$input.value = this._decimals === undefined ? value : value.toFixed( this._decimals );
		}

		return this;

	}

	_initInput() {

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		// On touch devices only, use input[type=number] to force a numeric keyboard.
		// Ideally we could use one input type everywhere, but [type=number] has quirks
		// on desktop, and [inputmode=decimal] has quirks on iOS.
		// See https://github.com/georgealways/lil-gui/pull/16

		const isTouch = window.matchMedia( '(pointer: coarse)' ).matches;

		if ( isTouch ) {
			this.$input.setAttribute( 'type', 'number' );
			this.$input.setAttribute( 'step', 'any' );
		}

		this.$widget.appendChild( this.$input );

		this.$disable = this.$input;

		const onInput = () => {

			let value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			if ( this._stepExplicit ) {
				value = this._snap( value );
			}

			this.setValue( this._clamp( value ) );

		};

		// Keys & mouse wheel
		// ---------------------------------------------------------------------

		const increment = delta => {

			const value = parseFloat( this.$input.value );

			if ( isNaN( value ) ) return;

			this._snapClampSetValue( value + delta );

			// Force the input to updateDisplay when it's focused
			this.$input.value = this.getValue();

		};

		const onKeyDown = e => {
			// Using `e.key` instead of `e.code` also catches NumpadEnter
			if ( e.key === 'Enter' ) {
				this.$input.blur();
			}
			if ( e.code === 'ArrowUp' ) {
				e.preventDefault();
				increment( this._step * this._arrowKeyMultiplier( e ) );
			}
			if ( e.code === 'ArrowDown' ) {
				e.preventDefault();
				increment( this._step * this._arrowKeyMultiplier( e ) * -1 );
			}
		};

		const onWheel = e => {
			if ( this._inputFocused ) {
				e.preventDefault();
				increment( this._step * this._normalizeMouseWheel( e ) );
			}
		};

		// Vertical drag
		// ---------------------------------------------------------------------

		let testingForVerticalDrag = false,
			initClientX,
			initClientY,
			prevClientY,
			initValue,
			dragDelta;

		// Once the mouse is dragged more than DRAG_THRESH px on any axis, we decide
		// on the user's intent: horizontal means highlight, vertical means drag.
		const DRAG_THRESH = 5;

		const onMouseDown = e => {

			initClientX = e.clientX;
			initClientY = prevClientY = e.clientY;
			testingForVerticalDrag = true;

			initValue = this.getValue();
			dragDelta = 0;

			window.addEventListener( 'mousemove', onMouseMove );
			window.addEventListener( 'mouseup', onMouseUp );

		};

		const onMouseMove = e => {

			if ( testingForVerticalDrag ) {

				const dx = e.clientX - initClientX;
				const dy = e.clientY - initClientY;

				if ( Math.abs( dy ) > DRAG_THRESH ) {

					e.preventDefault();
					this.$input.blur();
					testingForVerticalDrag = false;
					this._setDraggingStyle( true, 'vertical' );

				} else if ( Math.abs( dx ) > DRAG_THRESH ) {

					onMouseUp();

				}

			}

			// This isn't an else so that the first move counts towards dragDelta
			if ( !testingForVerticalDrag ) {

				const dy = e.clientY - prevClientY;

				dragDelta -= dy * this._step * this._arrowKeyMultiplier( e );

				// Clamp dragDelta so we don't have 'dead space' after dragging past bounds.
				// We're okay with the fact that bounds can be undefined here.
				if ( initValue + dragDelta > this._max ) {
					dragDelta = this._max - initValue;
				} else if ( initValue + dragDelta < this._min ) {
					dragDelta = this._min - initValue;
				}

				this._snapClampSetValue( initValue + dragDelta );

			}

			prevClientY = e.clientY;

		};

		const onMouseUp = () => {
			this._setDraggingStyle( false, 'vertical' );
			this._callOnFinishChange();
			window.removeEventListener( 'mousemove', onMouseMove );
			window.removeEventListener( 'mouseup', onMouseUp );
		};

		// Focus state & onFinishChange
		// ---------------------------------------------------------------------

		const onFocus = () => {
			this._inputFocused = true;
		};

		const onBlur = () => {
			this._inputFocused = false;
			this.updateDisplay();
			this._callOnFinishChange();
		};

		this.$input.addEventListener( 'input', onInput );
		this.$input.addEventListener( 'keydown', onKeyDown );
		this.$input.addEventListener( 'wheel', onWheel, { passive: false } );
		this.$input.addEventListener( 'mousedown', onMouseDown );
		this.$input.addEventListener( 'focus', onFocus );
		this.$input.addEventListener( 'blur', onBlur );

	}

	_initSlider() {

		this._hasSlider = true;

		// Build DOM
		// ---------------------------------------------------------------------

		this.$slider = document.createElement( 'div' );
		this.$slider.classList.add( 'slider' );

		this.$fill = document.createElement( 'div' );
		this.$fill.classList.add( 'fill' );

		this.$slider.appendChild( this.$fill );
		this.$widget.insertBefore( this.$slider, this.$input );

		this.domElement.classList.add( 'hasSlider' );

		// Map clientX to value
		// ---------------------------------------------------------------------

		const map = ( v, a, b, c, d ) => {
			return ( v - a ) / ( b - a ) * ( d - c ) + c;
		};

		const setValueFromX = clientX => {
			const rect = this.$slider.getBoundingClientRect();
			let value = map( clientX, rect.left, rect.right, this._min, this._max );
			this._snapClampSetValue( value );
		};

		// Mouse drag
		// ---------------------------------------------------------------------

		const mouseDown = e => {
			this._setDraggingStyle( true );
			setValueFromX( e.clientX );
			window.addEventListener( 'mousemove', mouseMove );
			window.addEventListener( 'mouseup', mouseUp );
		};

		const mouseMove = e => {
			setValueFromX( e.clientX );
		};

		const mouseUp = () => {
			this._callOnFinishChange();
			this._setDraggingStyle( false );
			window.removeEventListener( 'mousemove', mouseMove );
			window.removeEventListener( 'mouseup', mouseUp );
		};

		// Touch drag
		// ---------------------------------------------------------------------

		let testingForScroll = false, prevClientX, prevClientY;

		const beginTouchDrag = e => {
			e.preventDefault();
			this._setDraggingStyle( true );
			setValueFromX( e.touches[ 0 ].clientX );
			testingForScroll = false;
		};

		const onTouchStart = e => {

			if ( e.touches.length > 1 ) return;

			// If we're in a scrollable container, we should wait for the first
			// touchmove to see if the user is trying to slide or scroll.
			if ( this._hasScrollBar ) {

				prevClientX = e.touches[ 0 ].clientX;
				prevClientY = e.touches[ 0 ].clientY;
				testingForScroll = true;

			} else {

				// Otherwise, we can set the value straight away on touchstart.
				beginTouchDrag( e );

			}

			window.addEventListener( 'touchmove', onTouchMove, { passive: false } );
			window.addEventListener( 'touchend', onTouchEnd );

		};

		const onTouchMove = e => {

			if ( testingForScroll ) {

				const dx = e.touches[ 0 ].clientX - prevClientX;
				const dy = e.touches[ 0 ].clientY - prevClientY;

				if ( Math.abs( dx ) > Math.abs( dy ) ) {

					// We moved horizontally, set the value and stop checking.
					beginTouchDrag( e );

				} else {

					// This was, in fact, an attempt to scroll. Abort.
					window.removeEventListener( 'touchmove', onTouchMove );
					window.removeEventListener( 'touchend', onTouchEnd );

				}

			} else {

				e.preventDefault();
				setValueFromX( e.touches[ 0 ].clientX );

			}

		};

		const onTouchEnd = () => {
			this._callOnFinishChange();
			this._setDraggingStyle( false );
			window.removeEventListener( 'touchmove', onTouchMove );
			window.removeEventListener( 'touchend', onTouchEnd );
		};

		// Mouse wheel
		// ---------------------------------------------------------------------

		// We have to use a debounced function to call onFinishChange because
		// there's no way to tell when the user is "done" mouse-wheeling.
		const callOnFinishChange = this._callOnFinishChange.bind( this );
		const WHEEL_DEBOUNCE_TIME = 400;
		let wheelFinishChangeTimeout;

		const onWheel = e => {

			// ignore vertical wheels if there's a scrollbar
			const isVertical = Math.abs( e.deltaX ) < Math.abs( e.deltaY );
			if ( isVertical && this._hasScrollBar ) return;

			e.preventDefault();

			// set value
			const delta = this._normalizeMouseWheel( e ) * this._step;
			this._snapClampSetValue( this.getValue() + delta );

			// force the input to updateDisplay when it's focused
			this.$input.value = this.getValue();

			// debounce onFinishChange
			clearTimeout( wheelFinishChangeTimeout );
			wheelFinishChangeTimeout = setTimeout( callOnFinishChange, WHEEL_DEBOUNCE_TIME );

		};

		this.$slider.addEventListener( 'mousedown', mouseDown );
		this.$slider.addEventListener( 'touchstart', onTouchStart, { passive: false } );
		this.$slider.addEventListener( 'wheel', onWheel, { passive: false } );

	}

	_setDraggingStyle( active, axis = 'horizontal' ) {
		if ( this.$slider ) {
			this.$slider.classList.toggle( 'active', active );
		}
		document.body.classList.toggle( 'lil-gui-dragging', active );
		document.body.classList.toggle( `lil-gui-${axis}`, active );
	}

	_getImplicitStep() {

		if ( this._hasMin && this._hasMax ) {
			return ( this._max - this._min ) / 1000;
		}

		return 0.1;

	}

	_onUpdateMinMax() {

		if ( !this._hasSlider && this._hasMin && this._hasMax ) {

			// If this is the first time we're hearing about min and max
			// and we haven't explicitly stated what our step is, let's
			// update that too.
			if ( !this._stepExplicit ) {
				this.step( this._getImplicitStep(), false );
			}

			this._initSlider();
			this.updateDisplay();

		}

	}

	_normalizeMouseWheel( e ) {

		let { deltaX, deltaY } = e;

		// Safari and Chrome report weird non-integral values for a notched wheel,
		// but still expose actual lines scrolled via wheelDelta. Notched wheels
		// should behave the same way as arrow keys.
		if ( Math.floor( e.deltaY ) !== e.deltaY && e.wheelDelta ) {
			deltaX = 0;
			deltaY = -e.wheelDelta / 120;
			deltaY *= this._stepExplicit ? 1 : 10;
		}

		const wheel = deltaX + -deltaY;

		return wheel;

	}

	_arrowKeyMultiplier( e ) {

		let mult = this._stepExplicit ? 1 : 10;

		if ( e.shiftKey ) {
			mult *= 10;
		} else if ( e.altKey ) {
			mult /= 10;
		}

		return mult;

	}

	_snap( value ) {

		// Make the steps "start" at min or max.
		let offset = 0;
		if ( this._hasMin ) {
			offset = this._min;
		} else if ( this._hasMax ) {
			offset = this._max;
		}

		value -= offset;

		value = Math.round( value / this._step ) * this._step;

		value += offset;

		// Used to prevent "flyaway" decimals like 1.00000000000001
		value = parseFloat( value.toPrecision( 15 ) );

		return value;

	}

	_clamp( value ) {
		// either condition is false if min or max is undefined
		if ( value < this._min ) value = this._min;
		if ( value > this._max ) value = this._max;
		return value;
	}

	_snapClampSetValue( value ) {
		this.setValue( this._clamp( this._snap( value ) ) );
	}

	get _hasScrollBar() {
		const root = this.parent.root.$children;
		return root.scrollHeight > root.clientHeight;
	}

	get _hasMin() {
		return this._min !== undefined;
	}

	get _hasMax() {
		return this._max !== undefined;
	}

}

class OptionController extends Controller {

	constructor( parent, object, property, options ) {

		super( parent, object, property, 'option' );

		this.$select = document.createElement( 'select' );
		this.$select.setAttribute( 'aria-labelledby', this.$name.id );

		this.$display = document.createElement( 'div' );
		this.$display.classList.add( 'display' );

		this.$select.addEventListener( 'change', () => {
			this.setValue( this._values[ this.$select.selectedIndex ] );
			this._callOnFinishChange();
		} );

		this.$select.addEventListener( 'focus', () => {
			this.$display.classList.add( 'focus' );
		} );

		this.$select.addEventListener( 'blur', () => {
			this.$display.classList.remove( 'focus' );
		} );

		this.$widget.appendChild( this.$select );
		this.$widget.appendChild( this.$display );

		this.$disable = this.$select;

		this.options( options );

	}

	options( options ) {

		this._values = Array.isArray( options ) ? options : Object.values( options );
		this._names = Array.isArray( options ) ? options : Object.keys( options );

		this.$select.replaceChildren();

		this._names.forEach( name => {
			const $option = document.createElement( 'option' );
			$option.textContent = name;
			this.$select.appendChild( $option );
		} );

		this.updateDisplay();

		return this;

	}

	updateDisplay() {
		const value = this.getValue();
		const index = this._values.indexOf( value );
		this.$select.selectedIndex = index;
		this.$display.textContent = index === -1 ? value : this._names[ index ];
		return this;
	}

}

class StringController extends Controller {

	constructor( parent, object, property ) {

		super( parent, object, property, 'string' );

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'text' );
		this.$input.setAttribute( 'spellcheck', 'false' );
		this.$input.setAttribute( 'aria-labelledby', this.$name.id );

		this.$input.addEventListener( 'input', () => {
			this.setValue( this.$input.value );
		} );

		this.$input.addEventListener( 'keydown', e => {
			if ( e.code === 'Enter' ) {
				this.$input.blur();
			}
		} );

		this.$input.addEventListener( 'blur', () => {
			this._callOnFinishChange();
		} );

		this.$widget.appendChild( this.$input );

		this.$disable = this.$input;

		this.updateDisplay();

	}

	updateDisplay() {
		this.$input.value = this.getValue();
		return this;
	}

}

var stylesheet = `.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.root > .title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.root > .children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.root > .children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.root > .children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.allow-touch-styles, .lil-gui.allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.force-touch-styles, .lil-gui.force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-gui .controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-gui .controller.disabled {
  opacity: 0.5;
}
.lil-gui .controller.disabled, .lil-gui .controller.disabled * {
  pointer-events: none !important;
}
.lil-gui .controller > .name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-gui .controller .widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-gui .controller.string input {
  color: var(--string-color);
}
.lil-gui .controller.boolean {
  cursor: pointer;
}
.lil-gui .controller.color .display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-gui .controller.color .display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-gui .controller.color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-gui .controller.color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-gui .controller.option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-gui .controller.option .display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-gui .controller.option .display.focus {
    background: var(--focus-color);
  }
}
.lil-gui .controller.option .display.active {
  background: var(--focus-color);
}
.lil-gui .controller.option .display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-gui .controller.option .widget,
.lil-gui .controller.option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-gui .controller.option .widget:hover .display {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number input {
  color: var(--number-color);
}
.lil-gui .controller.number.hasSlider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-gui .controller.number .slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-gui .controller.number .slider:hover {
    background: var(--hover-color);
  }
}
.lil-gui .controller.number .slider.active {
  background: var(--focus-color);
}
.lil-gui .controller.number .slider.active .fill {
  opacity: 0.95;
}
.lil-gui .controller.number .fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-gui-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-gui-dragging * {
  cursor: ew-resize !important;
}

.lil-gui-dragging.lil-gui-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-gui-dragging) .lil-gui .title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.root > .title:focus {
  text-decoration: none !important;
}
.lil-gui.closed > .title:before {
  content: "▸";
}
.lil-gui.closed > .children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.closed:not(.transition) > .children {
  display: none;
}
.lil-gui.transition > .children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.root > .children > .lil-gui > .title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.root > .children > .lil-gui.closed > .title {
  border-bottom-color: transparent;
}
.lil-gui + .controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff;charset=utf-8;base64,d09GRgABAAAAAAUsAAsAAAAACJwAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABHU1VCAAABCAAAAH4AAADAImwmYE9TLzIAAAGIAAAAPwAAAGBKqH5SY21hcAAAAcgAAAD0AAACrukyyJBnbHlmAAACvAAAAF8AAACEIZpWH2hlYWQAAAMcAAAAJwAAADZfcj2zaGhlYQAAA0QAAAAYAAAAJAC5AHhobXR4AAADXAAAABAAAABMAZAAAGxvY2EAAANsAAAAFAAAACgCEgIybWF4cAAAA4AAAAAeAAAAIAEfABJuYW1lAAADoAAAASIAAAIK9SUU/XBvc3QAAATEAAAAZgAAAJCTcMc2eJxVjbEOgjAURU+hFRBK1dGRL+ALnAiToyMLEzFpnPz/eAshwSa97517c/MwwJmeB9kwPl+0cf5+uGPZXsqPu4nvZabcSZldZ6kfyWnomFY/eScKqZNWupKJO6kXN3K9uCVoL7iInPr1X5baXs3tjuMqCtzEuagm/AAlzQgPAAB4nGNgYRBlnMDAysDAYM/gBiT5oLQBAwuDJAMDEwMrMwNWEJDmmsJwgCFeXZghBcjlZMgFCzOiKOIFAB71Bb8AeJy1kjFuwkAQRZ+DwRAwBtNQRUGKQ8OdKCAWUhAgKLhIuAsVSpWz5Bbkj3dEgYiUIszqWdpZe+Z7/wB1oCYmIoboiwiLT2WjKl/jscrHfGg/pKdMkyklC5Zs2LEfHYpjcRoPzme9MWWmk3dWbK9ObkWkikOetJ554fWyoEsmdSlt+uR0pCJR34b6t/TVg1SY3sYvdf8vuiKrpyaDXDISiegp17p7579Gp3p++y7HPAiY9pmTibljrr85qSidtlg4+l25GLCaS8e6rRxNBmsnERunKbaOObRz7N72ju5vdAjYpBXHgJylOAVsMseDAPEP8LYoUHicY2BiAAEfhiAGJgZWBgZ7RnFRdnVJELCQlBSRlATJMoLV2DK4glSYs6ubq5vbKrJLSbGrgEmovDuDJVhe3VzcXFwNLCOILB/C4IuQ1xTn5FPilBTj5FPmBAB4WwoqAHicY2BkYGAA4sk1sR/j+W2+MnAzpDBgAyEMQUCSg4EJxAEAwUgFHgB4nGNgZGBgSGFggJMhDIwMqEAYAByHATJ4nGNgAIIUNEwmAABl3AGReJxjYAACIQYlBiMGJ3wQAEcQBEV4nGNgZGBgEGZgY2BiAAEQyQWEDAz/wXwGAAsPATIAAHicXdBNSsNAHAXwl35iA0UQXYnMShfS9GPZA7T7LgIu03SSpkwzYTIt1BN4Ak/gKTyAeCxfw39jZkjymzcvAwmAW/wgwHUEGDb36+jQQ3GXGot79L24jxCP4gHzF/EIr4jEIe7wxhOC3g2TMYy4Q7+Lu/SHuEd/ivt4wJd4wPxbPEKMX3GI5+DJFGaSn4qNzk8mcbKSR6xdXdhSzaOZJGtdapd4vVPbi6rP+cL7TGXOHtXKll4bY1Xl7EGnPtp7Xy2n00zyKLVHfkHBa4IcJ2oD3cgggWvt/V/FbDrUlEUJhTn/0azVWbNTNr0Ens8de1tceK9xZmfB1CPjOmPH4kitmvOubcNpmVTN3oFJyjzCvnmrwhJTzqzVj9jiSX911FjeAAB4nG3HMRKCMBBA0f0giiKi4DU8k0V2GWbIZDOh4PoWWvq6J5V8If9NVNQcaDhyouXMhY4rPTcG7jwYmXhKq8Wz+p762aNaeYXom2n3m2dLTVgsrCgFJ7OTmIkYbwIbC6vIB7WmFfAAAA==") format("woff");
}`;

function _injectStyles( cssContent ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}


let stylesInjected = false;

class GUI {

	/**
	 * Creates a panel that holds controllers.
	 * @example
	 * new GUI();
	 * new GUI( { container: document.getElementById( 'custom' ) } );
	 *
	 * @param {object} [options]
	 * @param {boolean} [options.autoPlace=true]
	 * Adds the GUI to `document.body` and fixes it to the top right of the page.
	 *
	 * @param {HTMLElement} [options.container]
	 * Adds the GUI to this DOM element. Overrides `autoPlace`.
	 *
	 * @param {number} [options.width=245]
	 * Width of the GUI in pixels, usually set when name labels become too long. Note that you can make
	 * name labels wider in CSS with `.lil‑gui { ‑‑name‑width: 55% }`.
	 *
	 * @param {string} [options.title=Controls]
	 * Name to display in the title bar.
	 *
	 * @param {boolean} [options.closeFolders=false]
	 * Pass `true` to close all folders in this GUI by default.
	 *
	 * @param {boolean} [options.injectStyles=true]
	 * Injects the default stylesheet into the page if this is the first GUI.
	 * Pass `false` to use your own stylesheet.
	 *
	 * @param {number} [options.touchStyles=true]
	 * Makes controllers larger on touch devices. Pass `false` to disable touch styles.
	 *
	 * @param {GUI} [options.parent]
	 * Adds this GUI as a child in another GUI. Usually this is done for you by `addFolder()`.
	 */
	constructor( {
		parent,
		autoPlace = parent === undefined,
		container,
		width,
		title = 'Controls',
		closeFolders = false,
		injectStyles = true,
		touchStyles = true
	} = {} ) {

		/**
		 * The GUI containing this folder, or `undefined` if this is the root GUI.
		 * @type {GUI}
		 */
		this.parent = parent;

		/**
		 * The top level GUI containing this folder, or `this` if this is the root GUI.
		 * @type {GUI}
		 */
		this.root = parent ? parent.root : this;

		/**
		 * The list of controllers and folders contained by this GUI.
		 * @type {Array<GUI|Controller>}
		 */
		this.children = [];

		/**
		 * The list of controllers contained by this GUI.
		 * @type {Array<Controller>}
		 */
		this.controllers = [];

		/**
		 * The list of folders contained by this GUI.
		 * @type {Array<GUI>}
		 */
		this.folders = [];

		/**
		 * Used to determine if the GUI is closed. Use `gui.open()` or `gui.close()` to change this.
		 * @type {boolean}
		 */
		this._closed = false;

		/**
		 * Used to determine if the GUI is hidden. Use `gui.show()` or `gui.hide()` to change this.
		 * @type {boolean}
		 */
		this._hidden = false;

		/**
		 * The outermost container element.
		 * @type {HTMLElement}
		 */
		this.domElement = document.createElement( 'div' );
		this.domElement.classList.add( 'lil-gui' );

		/**
		 * The DOM element that contains the title.
		 * @type {HTMLElement}
		 */
		this.$title = document.createElement( 'button' );
		this.$title.classList.add( 'title' );
		this.$title.setAttribute( 'aria-expanded', true );

		this.$title.addEventListener( 'click', () => this.openAnimated( this._closed ) );

		// enables :active pseudo class on mobile
		this.$title.addEventListener( 'touchstart', () => {}, { passive: true } );

		/**
		 * The DOM element that contains children.
		 * @type {HTMLElement}
		 */
		this.$children = document.createElement( 'div' );
		this.$children.classList.add( 'children' );

		this.domElement.appendChild( this.$title );
		this.domElement.appendChild( this.$children );

		this.title( title );

		if ( this.parent ) {

			this.parent.children.push( this );
			this.parent.folders.push( this );

			this.parent.$children.appendChild( this.domElement );

			// Stop the constructor early, everything onward only applies to root GUI's
			return;

		}

		this.domElement.classList.add( 'root' );

		if ( touchStyles ) {
			this.domElement.classList.add( 'allow-touch-styles' );
		}

		// Inject stylesheet if we haven't done that yet
		if ( !stylesInjected && injectStyles ) {
			_injectStyles( stylesheet );
			stylesInjected = true;
		}

		if ( container ) {

			container.appendChild( this.domElement );

		} else if ( autoPlace ) {

			this.domElement.classList.add( 'autoPlace' );
			document.body.appendChild( this.domElement );

		}

		if ( width ) {
			this.domElement.style.setProperty( '--width', width + 'px' );
		}

		this._closeFolders = closeFolders;

	}

	/**
	 * Adds a controller to the GUI, inferring controller type using the `typeof` operator.
	 * @example
	 * gui.add( object, 'property' );
	 * gui.add( object, 'number', 0, 100, 1 );
	 * gui.add( object, 'options', [ 1, 2, 3 ] );
	 *
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number|object|Array} [$1] Minimum value for number controllers, or the set of
	 * selectable values for a dropdown.
	 * @param {number} [max] Maximum value for number controllers.
	 * @param {number} [step] Step value for number controllers.
	 * @returns {Controller}
	 */
	add( object, property, $1, max, step ) {

		if ( Object( $1 ) === $1 ) {

			return new OptionController( this, object, property, $1 );

		}

		const initialValue = object[ property ];

		switch ( typeof initialValue ) {

			case 'number':

				return new NumberController( this, object, property, $1, max, step );

			case 'boolean':

				return new BooleanController( this, object, property );

			case 'string':

				return new StringController( this, object, property );

			case 'function':

				return new FunctionController( this, object, property );

		}

		console.error( `gui.add failed
	property:`, property, `
	object:`, object, `
	value:`, initialValue );

	}

	/**
	 * Adds a color controller to the GUI.
	 * @example
	 * params = {
	 * 	cssColor: '#ff00ff',
	 * 	rgbColor: { r: 0, g: 0.2, b: 0.4 },
	 * 	customRange: [ 0, 127, 255 ],
	 * };
	 *
	 * gui.addColor( params, 'cssColor' );
	 * gui.addColor( params, 'rgbColor' );
	 * gui.addColor( params, 'customRange', 255 );
	 *
	 * @param {object} object The object the controller will modify.
	 * @param {string} property Name of the property to control.
	 * @param {number} rgbScale Maximum value for a color channel when using an RGB color. You may
	 * need to set this to 255 if your colors are too bright.
	 * @returns {Controller}
	 */
	addColor( object, property, rgbScale = 1 ) {
		return new ColorController( this, object, property, rgbScale );
	}

	/**
	 * Adds a folder to the GUI, which is just another GUI. This method returns
	 * the nested GUI so you can add controllers to it.
	 * @example
	 * const folder = gui.addFolder( 'Position' );
	 * folder.add( position, 'x' );
	 * folder.add( position, 'y' );
	 * folder.add( position, 'z' );
	 *
	 * @param {string} title Name to display in the folder's title bar.
	 * @returns {GUI}
	 */
	addFolder( title ) {
		const folder = new GUI( { parent: this, title } );
		if ( this.root._closeFolders ) folder.close();
		return folder;
	}

	/**
	 * Recalls values that were saved with `gui.save()`.
	 * @param {object} obj
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {this}
	 */
	load( obj, recursive = true ) {

		if ( obj.controllers ) {

			this.controllers.forEach( c => {

				if ( c instanceof FunctionController ) return;

				if ( c._name in obj.controllers ) {
					c.load( obj.controllers[ c._name ] );
				}

			} );

		}

		if ( recursive && obj.folders ) {

			this.folders.forEach( f => {

				if ( f._title in obj.folders ) {
					f.load( obj.folders[ f._title ] );
				}

			} );

		}

		return this;

	}

	/**
	 * Returns an object mapping controller names to values. The object can be passed to `gui.load()` to
	 * recall these values.
	 * @example
	 * {
	 * 	controllers: {
	 * 		prop1: 1,
	 * 		prop2: 'value',
	 * 		...
	 * 	},
	 * 	folders: {
	 * 		folderName1: { controllers, folders },
	 * 		folderName2: { controllers, folders }
	 * 		...
	 * 	}
	 * }
	 *
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {object}
	 */
	save( recursive = true ) {

		const obj = {
			controllers: {},
			folders: {}
		};

		this.controllers.forEach( c => {

			if ( c instanceof FunctionController ) return;

			if ( c._name in obj.controllers ) {
				throw new Error( `Cannot save GUI with duplicate property "${c._name}"` );
			}

			obj.controllers[ c._name ] = c.save();

		} );

		if ( recursive ) {

			this.folders.forEach( f => {

				if ( f._title in obj.folders ) {
					throw new Error( `Cannot save GUI with duplicate folder "${f._title}"` );
				}

				obj.folders[ f._title ] = f.save();

			} );

		}

		return obj;

	}

	/**
	 * Opens a GUI or folder. GUI and folders are open by default.
	 * @param {boolean} open Pass false to close.
	 * @returns {this}
	 * @example
	 * gui.open(); // open
	 * gui.open( false ); // close
	 * gui.open( gui._closed ); // toggle
	 */
	open( open = true ) {

		this._setClosed( !open );

		this.$title.setAttribute( 'aria-expanded', !this._closed );
		this.domElement.classList.toggle( 'closed', this._closed );

		return this;

	}

	/**
	 * Closes the GUI.
	 * @returns {this}
	 */
	close() {
		return this.open( false );
	}

	_setClosed( closed ) {
		if ( this._closed === closed ) return;
		this._closed = closed;
		this._callOnOpenClose( this );
	}

	/**
	 * Shows the GUI after it's been hidden.
	 * @param {boolean} show
	 * @returns {this}
	 * @example
	 * gui.show();
	 * gui.show( false ); // hide
	 * gui.show( gui._hidden ); // toggle
	 */
	show( show = true ) {

		this._hidden = !show;

		this.domElement.style.display = this._hidden ? 'none' : '';

		return this;

	}

	/**
	 * Hides the GUI.
	 * @returns {this}
	 */
	hide() {
		return this.show( false );
	}

	openAnimated( open = true ) {

		// set state immediately
		this._setClosed( !open );

		this.$title.setAttribute( 'aria-expanded', !this._closed );

		// wait for next frame to measure $children
		requestAnimationFrame( () => {

			// explicitly set initial height for transition
			const initialHeight = this.$children.clientHeight;
			this.$children.style.height = initialHeight + 'px';

			this.domElement.classList.add( 'transition' );

			const onTransitionEnd = e => {
				if ( e.target !== this.$children ) return;
				this.$children.style.height = '';
				this.domElement.classList.remove( 'transition' );
				this.$children.removeEventListener( 'transitionend', onTransitionEnd );
			};

			this.$children.addEventListener( 'transitionend', onTransitionEnd );

			// todo: this is wrong if children's scrollHeight makes for a gui taller than maxHeight
			const targetHeight = !open ? 0 : this.$children.scrollHeight;

			this.domElement.classList.toggle( 'closed', !open );

			requestAnimationFrame( () => {
				this.$children.style.height = targetHeight + 'px';
			} );

		} );

		return this;

	}

	/**
	 * Change the title of this GUI.
	 * @param {string} title
	 * @returns {this}
	 */
	title( title ) {
		/**
		 * Current title of the GUI. Use `gui.title( 'Title' )` to modify this value.
		 * @type {string}
		 */
		this._title = title;
		this.$title.textContent = title;
		return this;
	}

	/**
	 * Resets all controllers to their initial values.
	 * @param {boolean} recursive Pass false to exclude folders descending from this GUI.
	 * @returns {this}
	 */
	reset( recursive = true ) {
		const controllers = recursive ? this.controllersRecursive() : this.controllers;
		controllers.forEach( c => c.reset() );
		return this;
	}

	/**
	 * Pass a function to be called whenever a controller in this GUI changes.
	 * @param {function({object:object, property:string, value:any, controller:Controller})} callback
	 * @returns {this}
	 * @example
	 * gui.onChange( event => {
	 * 	event.object     // object that was modified
	 * 	event.property   // string, name of property
	 * 	event.value      // new value of controller
	 * 	event.controller // controller that was modified
	 * } );
	 */
	onChange( callback ) {
		/**
		 * Used to access the function bound to `onChange` events. Don't modify this value
		 * directly. Use the `gui.onChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onChange = callback;
		return this;
	}

	_callOnChange( controller ) {

		if ( this.parent ) {
			this.parent._callOnChange( controller );
		}

		if ( this._onChange !== undefined ) {
			this._onChange.call( this, {
				object: controller.object,
				property: controller.property,
				value: controller.getValue(),
				controller
			} );
		}
	}

	/**
	 * Pass a function to be called whenever a controller in this GUI has finished changing.
	 * @param {function({object:object, property:string, value:any, controller:Controller})} callback
	 * @returns {this}
	 * @example
	 * gui.onFinishChange( event => {
	 * 	event.object     // object that was modified
	 * 	event.property   // string, name of property
	 * 	event.value      // new value of controller
	 * 	event.controller // controller that was modified
	 * } );
	 */
	onFinishChange( callback ) {
		/**
		 * Used to access the function bound to `onFinishChange` events. Don't modify this value
		 * directly. Use the `gui.onFinishChange( callback )` method instead.
		 * @type {Function}
		 */
		this._onFinishChange = callback;
		return this;
	}

	_callOnFinishChange( controller ) {

		if ( this.parent ) {
			this.parent._callOnFinishChange( controller );
		}

		if ( this._onFinishChange !== undefined ) {
			this._onFinishChange.call( this, {
				object: controller.object,
				property: controller.property,
				value: controller.getValue(),
				controller
			} );
		}
	}

	/**
	 * Pass a function to be called when this GUI or its descendants are opened or closed.
	 * @param {function(GUI)} callback
	 * @returns {this}
	 * @example
	 * gui.onOpenClose( changedGUI => {
	 * 	console.log( changedGUI._closed );
	 * } );
	 */
	onOpenClose( callback ) {
		this._onOpenClose = callback;
		return this;
	}

	_callOnOpenClose( changedGUI ) {
		if ( this.parent ) {
			this.parent._callOnOpenClose( changedGUI );
		}

		if ( this._onOpenClose !== undefined ) {
			this._onOpenClose.call( this, changedGUI );
		}
	}

	/**
	 * Destroys all DOM elements and event listeners associated with this GUI.
	 */
	destroy() {

		if ( this.parent ) {
			this.parent.children.splice( this.parent.children.indexOf( this ), 1 );
			this.parent.folders.splice( this.parent.folders.indexOf( this ), 1 );
		}

		if ( this.domElement.parentElement ) {
			this.domElement.parentElement.removeChild( this.domElement );
		}

		Array.from( this.children ).forEach( c => c.destroy() );

	}

	/**
	 * Returns an array of controllers contained by this GUI and its descendents.
	 * @returns {Controller[]}
	 */
	controllersRecursive() {
		let controllers = Array.from( this.controllers );
		this.folders.forEach( f => {
			controllers = controllers.concat( f.controllersRecursive() );
		} );
		return controllers;
	}

	/**
	 * Returns an array of folders contained by this GUI and its descendents.
	 * @returns {GUI[]}
	 */
	foldersRecursive() {
		let folders = Array.from( this.folders );
		this.folders.forEach( f => {
			folders = folders.concat( f.foldersRecursive() );
		} );
		return folders;
	}

}




/***/ }),

/***/ "./src/contact-recovery.ts":
/*!*********************************!*\
  !*** ./src/contact-recovery.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ContactRecovery: () => (/* binding */ ContactRecovery),
/* harmony export */   checkpointDetails: () => (/* binding */ checkpointDetails),
/* harmony export */   classifyCheckpoint: () => (/* binding */ classifyCheckpoint)
/* harmony export */ });
function classifyCheckpoint(s, fixedArea) {
    const finite = [
        s.cell.area,
        s.cell.centroidX,
        s.cell.centroidY,
        s.cell.left,
        s.cell.right,
        s.cell.top,
        s.cell.bottom,
        s.actinBalanceError,
        s.insidePolymerBeads,
        s.inPolymer,
        s.crossingFilamentBonds,
        s.brokenLinks,
        s.cycles,
    ].every(Number.isFinite);
    if (!finite ||
        s.cell.area <= 0 ||
        s.actinBalanceError !== 0 ||
        s.brokenLinks !== 0 ||
        s.cycles !== 0 ||
        !Number.isInteger(s.insidePolymerBeads) ||
        !Number.isInteger(s.inPolymer) ||
        s.insidePolymerBeads < 0 ||
        s.insidePolymerBeads > s.inPolymer ||
        !Number.isInteger(s.crossingFilamentBonds) ||
        s.crossingFilamentBonds < 0 ||
        (fixedArea && Math.abs(s.cell.area - 1) > 0.001))
        return "fatal";
    if (s.crossingFilamentBonds === 0 && s.insidePolymerBeads === s.inPolymer)
        return "valid";
    // Counts identify residual contacts, not corruption. The repair's displacement,
    // iteration and elapsed-time limits decide whether these can be corrected.
    return "contacts";
}
function checkpointDetails(s) {
    return {
        step: s.step,
        mass: s.actinBalanceError,
        insideF: s.insidePolymerBeads,
        totalF: s.inPolymer,
        outsideF: s.inPolymer - s.insidePolymerBeads,
        crossings: s.crossingFilamentBonds,
        brokenLinks: s.brokenLinks,
        cycles: s.cycles,
        area: s.cell.area,
        centroidX: s.cell.centroidX,
        centroidY: s.cell.centroidY,
    };
}
// Called synchronously from the asynchronous diagnostic callback, but never
// awaited by that callback. The active flag freezes new physics submissions.
class ContactRecovery {
    active = false;
    history = [];
    pending = null;
    deps;
    constructor(deps) {
        this.deps = deps;
    }
    wait() {
        return this.pending ?? Promise.resolve();
    }
    request(trigger) {
        if (this.active)
            return this.wait();
        this.active = true;
        const d = this.deps, started = d.now();
        const record = {
            triggerStep: trigger.step,
            initialCrossings: trigger.crossingFilamentBonds,
            initialOutside: trigger.inPolymer - trigger.insidePolymerBeads,
            passes: 0,
            outcome: "checking",
            maxDisplacement: 0,
        };
        this.history.push(record);
        if (this.history.length > 32)
            this.history.shift();
        let backedUp = false;
        const checkBudget = () => {
            if (d.now() - started > 5000)
                throw Error("Contact recovery exceeded its time budget");
        };
        const run = async () => {
            try {
                d.notice(`Rechecking contacts: ${record.initialOutside} outside bead(s), ${trigger.crossingFilamentBonds} crossing(s)…`);
                let state = await d.inspect();
                record.latest = checkpointDetails(state);
                checkBudget();
                record.currentStep = state.step;
                let kind = classifyCheckpoint(state, d.fixedArea());
                if (kind === "valid") {
                    record.outcome = "fresh-state-clean";
                    d.notice("Current state verified; continuing.");
                    return;
                }
                if (kind !== "contacts")
                    throw Error(`Current state has a non-contact invariant failure: ${JSON.stringify(record.latest)}`);
                await d.begin();
                backedUp = true;
                for (const iterations of [4, 8, 16, 32]) {
                    checkBudget();
                    d.notice(`Correcting contact residuals (${record.passes + iterations} extra passes)…`);
                    record.maxDisplacement = await d.repair(iterations);
                    record.passes += iterations;
                    if (!Number.isFinite(record.maxDisplacement) || record.maxDisplacement > d.maxDisplacement())
                        throw Error("Contact correction exceeded its displacement budget");
                    state = await d.inspect();
                    record.latest = checkpointDetails(state);
                    checkBudget();
                    if (state.step !== record.currentStep)
                        throw Error("Physics advanced during contact recovery");
                    kind = classifyCheckpoint(state, d.fixedArea());
                    if (kind === "valid") {
                        record.outcome = "corrected";
                        d.notice(`Contacts corrected and verified (${record.passes} passes).`);
                        return;
                    }
                    if (kind !== "contacts")
                        throw Error(`Contact correction changed another invariant: ${JSON.stringify(record.latest)}`);
                }
                throw Error(`Contact correction did not converge within 60 extra passes: ${JSON.stringify(record.latest)}`);
            }
            catch (error) {
                record.outcome = "failed";
                record.error = error instanceof Error ? error.message : String(error);
                if (backedUp) {
                    try {
                        await d.rollback();
                    }
                    catch (rollbackError) {
                        record.error += `; rollback failed: ${String(rollbackError)}`;
                    }
                }
                d.fail(new Error(record.error));
            }
            finally {
                d.dispose();
                record.elapsedMs = d.now() - started;
                this.active = false;
            }
        };
        this.pending = run();
        return this.pending;
    }
}


/***/ }),

/***/ "./src/enclosure-test.ts":
/*!*******************************!*\
  !*** ./src/enclosure-test.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   testEnclosure: () => (/* binding */ testEnclosure)
/* harmony export */ });
/* harmony import */ var _occupancy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./occupancy */ "./src/occupancy.ts");

async function testEnclosure(device, buffers, counts, dispatch, configure) {
    const checks = [];
    const assert = (name, condition) => {
        checks.push({ name, passed: condition });
        if (!condition)
            throw new Error(`Enclosure fixture failed: ${name}`);
    };
    const read = async (buffer) => {
        const stage = device.createBuffer({ size: buffer.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(buffer, 0, stage, 0, buffer.size);
        device.queue.submit([encoder.finish()]);
        await stage.mapAsync(GPUMapMode.READ);
        const data = stage.getMappedRange().slice(0);
        stage.unmap();
        stage.destroy();
        return data;
    };
    const run = async (polygon, points, fixedArea = false, referenceArea = 400) => {
        const mem = new ArrayBuffer(buffers.membrane.size), mf = new Float32Array(mem), mu = new Uint32Array(mem);
        for (let i = 0; i < counts.membrane; i++) {
            // Dense horizontal edges also overflow the shortlists, exercising their
            // complete-polygon fallback rather than only sparse happy-path bins.
            const at = (i * polygon.length) / counts.membrane;
            const edge = Math.floor(at);
            const a = polygon[edge], b = polygon[(edge + 1) % polygon.length];
            const p = [a[0] + (b[0] - a[0]) * (at - edge), a[1] + (b[1] - a[1]) * (at - edge)];
            mu[i * 10] = i;
            mu[i * 10 + 6] = (i + 1) % counts.membrane;
            mu[i * 10 + 7] = (i + counts.membrane - 1) % counts.membrane;
            mf[i * 10 + 2] = p[0];
            mf[i * 10 + 3] = p[1];
        }
        const actin = new ArrayBuffer(buffers.actin.size), af = new Float32Array(actin), au = new Uint32Array(actin);
        for (let i = 0; i < counts.actin; i++) {
            au[i * 10] = au[i * 10 + 6] = au[i * 10 + 7] = i;
        }
        points.forEach(([x, y], i) => {
            af[i * 10 + 2] = x;
            af[i * 10 + 3] = y;
            au[i * 10 + 6] = i === 0 ? 0 : i - 1;
            au[i * 10 + 7] = i === points.length - 1 ? i : i + 1;
        });
        device.queue.writeBuffer(buffers.membrane, 0, mem);
        device.queue.writeBuffer(buffers.actin, 0, actin);
        configure(fixedArea, referenceArea);
        dispatch();
        await device.queue.onSubmittedWorkDone();
        return { actin: new Float32Array(await read(buffers.actin)), membrane: new Float32Array(await read(buffers.membrane)) };
    };
    let result = await run([
        [0, 0],
        [20, 0],
        [20, 20],
        [0, 20],
    ], [
        [25, 1],
        [26, 1],
    ]);
    let inside = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonOccupancy)(result.membrane, 10, true);
    assert("escaped filament beads are projected inside", inside(result.actin[2], result.actin[3]) && inside(result.actin[12], result.actin[13]));
    let words = new Uint32Array(result.actin.buffer);
    assert("contact preserves connectivity and finite reservoir amount", words[7] === 1 &&
        words[16] === 0 &&
        Array.from({ length: counts.actin - 2 }, (_, k) => k + 2).every((i) => words[i * 10 + 6] === i && words[i * 10 + 7] === i));
    result = await run([
        [0, 0],
        [8, 0],
        [8, 3],
        [3, 3],
        [3, 8],
        [0, 8],
    ], [
        [7, 1],
        [1, 7],
    ]);
    inside = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonOccupancy)(result.membrane, 10, true);
    const crossing = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonBondCrossing)(result.membrane);
    assert("interior endpoints cannot bridge across a concave exterior", inside(result.actin[12], result.actin[13]) && !crossing(result.actin[2], result.actin[3], result.actin[12], result.actin[13]));
    result = await run([
        [0, 0],
        [20, 0],
        [20, 20],
        [0, 20],
    ], [], true, 900);
    let area2 = 0, cx = 0, cy = 0;
    for (let i = 0; i < counts.membrane; i++) {
        const j = (i + 1) % counts.membrane;
        const ax = result.membrane[i * 10 + 2], ay = result.membrane[i * 10 + 3];
        const bx = result.membrane[j * 10 + 2], by = result.membrane[j * 10 + 3];
        const cross = ax * by - ay * bx;
        area2 += cross;
        cx += (ax + bx) * cross;
        cy += (ay + by) * cross;
    }
    assert("area closure reaches the declared reference area", Math.abs(area2 / 2 - 900) < 0.02);
    assert("area closure preserves the current geometric centroid", Math.abs(cx / (3 * area2) - 10) < 0.001 && Math.abs(cy / (3 * area2) - 10) < 0.001);
    words = new Uint32Array(result.actin.buffer);
    assert("geometry changes do not manufacture or discard G-actin", Array.from({ length: counts.actin }, (_, i) => i).every((i) => words[i * 10 + 6] === i && words[i * 10 + 7] === i));
    return checks;
}


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony import */ var lil_gui__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! lil-gui */ "./node_modules/lil-gui/dist/lil-gui.esm.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _shaders_render_wgsl__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shaders/render.wgsl */ "./src/shaders/render.wgsl");
/* harmony import */ var _shaders_simulate_wgsl__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./shaders/simulate.wgsl */ "./src/shaders/simulate.wgsl");
/* harmony import */ var _simulate__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./simulate */ "./src/simulate.ts");
/* harmony import */ var _contact_recovery__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./contact-recovery */ "./src/contact-recovery.ts");
/* harmony import */ var _shaders_includes_bindings_wgsl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./shaders/includes/bindings.wgsl */ "./src/shaders/includes/bindings.wgsl");
/* harmony import */ var _shaders_includes_textures_wgsl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./shaders/includes/textures.wgsl */ "./src/shaders/includes/textures.wgsl");
/* harmony import */ var _shaders_includes_buffers_wgsl__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./shaders/includes/buffers.wgsl */ "./src/shaders/includes/buffers.wgsl");
/* harmony import */ var _shaders_includes_random_wgsl__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./shaders/includes/random.wgsl */ "./src/shaders/includes/random.wgsl");
/* harmony import */ var _shaders_includes_actomyosin_wgsl__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./shaders/includes/actomyosin.wgsl */ "./src/shaders/includes/actomyosin.wgsl");
/* harmony import */ var _shaders_includes_enclosure_wgsl__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./shaders/includes/enclosure.wgsl */ "./src/shaders/includes/enclosure.wgsl");
/* harmony import */ var _render__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./render */ "./src/render.ts");
/* harmony import */ var _sprouts__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./sprouts */ "./src/sprouts.ts");
/* harmony import */ var _telemetry__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./telemetry */ "./src/telemetry.ts");
/* harmony import */ var _random__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./random */ "./src/random.ts");
/* harmony import */ var _mechanics_test__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./mechanics-test */ "./src/mechanics-test.ts");
/* harmony import */ var _enclosure_test__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./enclosure-test */ "./src/enclosure-test.ts");
/* harmony import */ var _renewal_test__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./renewal-test */ "./src/renewal-test.ts");
/* harmony import */ var _realtime__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./realtime */ "./src/realtime.ts");






// Import shader includes














// Shader includes mapping
const shaderIncludes = {
    bindings: _shaders_includes_bindings_wgsl__WEBPACK_IMPORTED_MODULE_5__,
    textures: _shaders_includes_textures_wgsl__WEBPACK_IMPORTED_MODULE_6__,
    buffers: _shaders_includes_buffers_wgsl__WEBPACK_IMPORTED_MODULE_7__,
    random: _shaders_includes_random_wgsl__WEBPACK_IMPORTED_MODULE_8__,
    actomyosin: _shaders_includes_actomyosin_wgsl__WEBPACK_IMPORTED_MODULE_9__,
    enclosure: _shaders_includes_enclosure_wgsl__WEBPACK_IMPORTED_MODULE_10__,
};
// Sizes in bytes - useful for calculating buffer sizes and offsets
const size32 = 4; // size of a 32-bit float or int
// Uniform values container
const uniforms = {
    computeStepsPerFrame: 4,
    targetFPS: 60,
    simulationScale: 1.0, // texture pixels per screen (CSS) pixel; the cell scales with it in pixels, so it looks the same size on screen
    actinCount: 1 * 256 * 256, // 4000 is minimum for nice action.
    membraneCount: 6 * 256,
    stiffness: 0.5,
    foodNearbyThreshold: 0.001,
    disconnectionProbability: 0.006,
    monomerMembraneRepulsion: 0.09, // how hard monomers are pushed off the membrane: 1.0 leaves a ~8 px gap, 0.1 about 4 px
    polymerRepulsion: 0.422,
    stericSamplingRange: 2,
    actinCohesionRange: 1,
    bindProb: 0.03,
    bindLengthFloor: 2, // filaments shorter than this bind at bindProb * this (a lone monomer at bindProb); longer ones at bindProb * length
    bindLengthSaturation: 20, // filaments longer than this bind no more readily (max 64)
    actinStericForce: 0.2,
    equilibriumLineDistance: 2.0, // actin rest length in pixels; sets filament spacing now that a filament doesn't repel itself
    movementMode: 0, // Idle: polymerization only comes from the sprout sites
    membraneRestLength: 2.0 / 3.0, // with 6x the original 256 nodes at rest length 2 the cell is 2x wider in pixels, matching simulationScale
    membraneStiffness: 3.0, // how hard a stretched membrane pulls in, along its curvature
    lamellipodiumStrength: 0.15, // polymerization field emitted by the front of the membrane, where filaments also branch; 0 = off
    lamellipodiumWidth: 0.036, // fraction of the membrane, centered on the front (the right side at reset), that emits it
    lamellipodiumFieldDecay: 0.98, // per-step decay of that field
    branchProbability: 0.01, // per step, for a monomer next to a filament in the lamellipodium field at strength 1
    debranchProbability: 0.0005, // per step, for each branch to come off its mother filament
    actinBendStiffness: 4.0, // how fast an actin's director turns toward its neighbours' (Cosserat bending); 0 = floppy
    actinCosseratIterations: 8, // Cosserat passes per simulation step; more = stiffer, straightens long filaments faster
    stericSelfNeighbors: 6, // filament neighbours on each side that don't repel an actin (max 12); the rest length spaces them
    membraneFlow: 0.5, // how fast membrane slides toward stretched regions (tangential spacing equalization)
    membraneFlowIterations: 8, // tangential flow passes per simulation step
    membraneSmoothing: 0.02, // pull toward the neighbours' midpoint per step; relaxes idle protrusions and cusps
    polymerizationPatchSize: 0.02, // fraction of the membrane that polymerizes in Move East mode
    polymerizationFieldDecay: 0.95, // per-step decay of the polymerization field; lower = more local = thinner protrusions
    sproutCount: 6, // max number of short-lived polymerization sites at once
    sproutWidth: 1, // membrane nodes covered by one site
    sproutFrontBias: 0.75, // fraction of sites placed near the front, the rest anywhere in the front 30%
    sproutOnSteps: 6000, // average simulation steps a site stays on
    sproutOffSteps: 1500, // average simulation steps a site stays off
    myosinStrength: 0, // opt-in until matched comparisons establish a benefit
    myosinSpeed: 0.02,
    membraneCoupling: 0,
    substrateDrag: 4,
    cortexPolymerization: 0, // distinct optional hypothesis: a posterior actin substrate
    monomerOpacity: 0.2, // visual only: keep the explicit filaments legible
    gActinField: 1, // finite well-mixed pool plus explicit-filament containment
    areaConservation: 1, // imposed area, a 2-D volume surrogate, not measured pressure
    adaptiveFrames: 1,
    cueX: 0,
    cueY: 0,
    cueEnabled: 0,
    polarityMode: 0,
    polarityTurnRate: 0.02,
    rearTurnover: 0,
    turnoverAge: 500,
    tetherTurnover: 0,
    tetherOnRate: 0.02,
    tetherOffRate: 0.002,
    tetherRecoverySteps: 40,
    motorRearBias: 0,
    frontAlignment: 0,
    tetherLoadOff: 0.002,
    colourAge: 0,
};
// numeric uniforms can be overridden from the URL, e.g. ?bindProb=0.05&equilibriumLineDistance=2; ?run=name labels the telemetry
const urlParams = new URLSearchParams(window.location.search);
const showcase = urlParams.size === 0 || urlParams.get("demo") === "1";
if (showcase)
    Object.assign(uniforms, {
        membraneRestLength: 1 / 3,
        myosinStrength: 0.05,
        membraneCoupling: 0.05,
        gActinField: 1,
        areaConservation: 1,
        polarityMode: 1,
        rearTurnover: 0.01,
        tetherTurnover: 1,
        motorRearBias: 1,
        frontAlignment: 0.8,
        colourAge: 1,
    });
const seed = Number(urlParams.get("seed") ?? 42) >>> 0;
const initialRandom = (0,_random__WEBPACK_IMPORTED_MODULE_14__.seededRandom)(seed);
for (const [key, value] of urlParams) {
    if (key in uniforms && Number.isFinite(Number(value))) {
        uniforms[key] = Number(value);
    }
}
for (const [name, maximum] of Object.entries({
    myosinStrength: 0.2,
    myosinSpeed: 0.1,
    membraneCoupling: 0.2,
    substrateDrag: 20,
    cortexPolymerization: 0.1,
    monomerOpacity: 1,
    gActinField: 1,
    areaConservation: 1,
    polarityMode: 1,
    polarityTurnRate: 0.2,
    rearTurnover: 0.2,
    tetherTurnover: 1,
    tetherOnRate: 1,
    tetherOffRate: 0.2,
    motorRearBias: 1,
    frontAlignment: 1,
    tetherLoadOff: 0.1,
    colourAge: 1,
})) {
    const values = uniforms;
    values[name] = Math.max(0, Math.min(maximum, values[name]));
}
const DEBUGMODE = false;
const debugSize = 200;
const WORKGROUP_SIZE = 256;
async function index() {
    const isMobileDevice = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    if (isMobileDevice) {
        uniforms.computeStepsPerFrame = 1;
    }
    // setup and configure WebGPU
    const device = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.requestDevice)();
    // Get the existing canvas from the DOM instead of creating a new one
    const canvas = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.configureCanvas)(device, "main-canvas", {
        width: Math.round(Math.max(showcase ? 1280 : 0, window.innerWidth) * uniforms.simulationScale),
        height: Math.round(Math.max(showcase ? 960 : 0, window.innerHeight) * uniforms.simulationScale),
    });
    let time = 0;
    let paused = urlParams.has("paused");
    let manualAdvancePending = false;
    let controlsDirty = false;
    let cueVersion = 0;
    const frameBudget = new _realtime__WEBPACK_IMPORTED_MODULE_18__.FrameBudget();
    const livePerformance = new _realtime__WEBPACK_IMPORTED_MODULE_18__.LivePerformance();
    const runtimeErrors = [];
    function setPaused(value) {
        paused = value;
        document.getElementById("pause-demo").textContent = paused ? "Resume" : "Pause";
        if (!value)
            livePerformance.clearFrames();
    }
    function stopSimulation(error) {
        const text = error instanceof Error ? error.message : String(error);
        if (!runtimeErrors.includes(text))
            runtimeErrors.push(text);
        setPaused(true);
        document.getElementById("mechanical-status").textContent = `Stopped: ${text}`;
        const notice = document.getElementById("demo-notice");
        notice.hidden = false;
        notice.textContent = `Simulation paused: ${text}`;
    }
    const gpuErrors = [];
    device.addEventListener("uncapturederror", (event) => {
        gpuErrors.push(event.error.message);
        stopSimulation(`GPU error: ${event.error.message}`);
        document.getElementById("mechanical-status").textContent = `GPU error: ${event.error.message}`;
    });
    device.lost.then((info) => gpuErrors.push(`Device lost: ${info.message}`));
    const GROUP_INDEX = 0;
    const BINDINGS_BUFFER = { CANVAS: 0, CONTROLS: 1, INTERACTIONS: 2 };
    const BINDINGS_TEXTURE = {
        INDEX: 3,
        STERIC_POTENTIAL: 4,
        PARAMETER_FIELDS: 5,
    };
    const BINDINGS_AGENTS = {
        RANDOM: 6,
        MEMBRANE: 7,
        ACTIN: 8,
        CONNECTION_LOCKS: 9,
        TELEMETRY: 12,
        MECHANICAL_SNAPSHOT: 13,
        MECHANICAL_LINKS: 14,
        MECHANICAL_FORCES: 15,
    };
    // ---------------------------
    // Set up memory resources
    var actualWidth = canvas.size.width;
    var actualHeight = canvas.size.height;
    if (DEBUGMODE) {
        actualWidth = debugSize;
        actualHeight = debugSize;
    }
    const textures = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.setupTextures)(device, Object.values(BINDINGS_TEXTURE), {}, {
        depthOrArrayLayers: {
            [BINDINGS_TEXTURE.STERIC_POTENTIAL]: 3,
            [BINDINGS_TEXTURE.PARAMETER_FIELDS]: 6,
            [BINDINGS_TEXTURE.INDEX]: 4,
        },
        width: actualWidth,
        height: actualHeight,
    }, {
        [BINDINGS_TEXTURE.STERIC_POTENTIAL]: "r32float",
        [BINDINGS_TEXTURE.PARAMETER_FIELDS]: "r32float",
        [BINDINGS_TEXTURE.INDEX]: "r32uint",
    });
    const TEXTURE_WORKGROUP_COUNT = [
        Math.ceil(textures.size.width / Math.sqrt(WORKGROUP_SIZE)),
        Math.ceil(textures.size.height / Math.sqrt(WORKGROUP_SIZE)),
    ];
    const BUFFER_WORKGROUP_COUNT = {
        ACTIN: Math.ceil(uniforms.actinCount / WORKGROUP_SIZE),
        MEMBRANE: Math.ceil(uniforms.membraneCount / WORKGROUP_SIZE),
    };
    const MAX_BUFFER_WORKGROUP_COUNT = Math.max(...Object.values(BUFFER_WORKGROUP_COUNT));
    // setup interactions
    const interactions = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.setupInteractions)(device, canvas.context.canvas, textures.size);
    const canvas_buffers = {
        [BINDINGS_BUFFER.CANVAS]: textures.canvas.buffer,
        [BINDINGS_BUFFER.CONTROLS]: interactions.controls.buffer,
        [BINDINGS_BUFFER.INTERACTIONS]: interactions.interactions.buffer,
    };
    // Function to write the uniforms object into the ArrayBuffer according to WGSL struct layout
    const controlsDataView = new DataView(interactions.controls.data);
    const canvasView = new DataView(textures.canvas.data.buffer);
    const writeUniforms = () => {
        // Write canvas size
        canvasView.setInt32(0, actualWidth, true);
        canvasView.setInt32(4, actualHeight, true);
        // Canvas.key is vec2<u32>, aligned to byte 16. UI changes do not reseed.
        canvasView.setUint32(16, seed, true);
        canvasView.setUint32(20, seed ^ 0x9e3779b9, true);
        // Write controls with adjusted offsets:
        controlsDataView.setUint32(0, uniforms.membraneCount, true);
        controlsDataView.setUint32(4, uniforms.actinCount, true);
        controlsDataView.setFloat32(8, uniforms.stiffness, true);
        controlsDataView.setFloat32(12, uniforms.foodNearbyThreshold, true);
        controlsDataView.setFloat32(16, uniforms.disconnectionProbability, true);
        controlsDataView.setFloat32(20, uniforms.polymerRepulsion, true);
        controlsDataView.setInt32(24, uniforms.stericSamplingRange, true);
        controlsDataView.setInt32(28, uniforms.actinCohesionRange, true);
        controlsDataView.setFloat32(32, uniforms.bindProb, true);
        controlsDataView.setUint32(36, uniforms.bindLengthSaturation, true);
        controlsDataView.setUint32(48, uniforms.bindLengthFloor, true);
        controlsDataView.setFloat32(40, uniforms.actinStericForce, true);
        controlsDataView.setFloat32(44, uniforms.equilibriumLineDistance, true);
        controlsDataView.setFloat32(56, uniforms.monomerMembraneRepulsion, true);
        controlsDataView.setUint32(52, uniforms.movementMode, true);
        controlsDataView.setFloat32(60, uniforms.membraneStiffness, true);
        controlsDataView.setFloat32(72, uniforms.polymerizationPatchSize, true);
        controlsDataView.setFloat32(76, uniforms.membraneRestLength, true);
        controlsDataView.setFloat32(208, uniforms.membraneSmoothing, true);
        controlsDataView.setFloat32(216, uniforms.polymerizationFieldDecay, true);
        controlsDataView.setFloat32(220, uniforms.membraneFlow, true);
        controlsDataView.setFloat32(224, uniforms.lamellipodiumStrength, true);
        controlsDataView.setFloat32(228, uniforms.lamellipodiumWidth, true);
        controlsDataView.setFloat32(232, uniforms.lamellipodiumFieldDecay, true);
        controlsDataView.setFloat32(236, uniforms.branchProbability, true);
        controlsDataView.setFloat32(240, uniforms.debranchProbability, true);
        controlsDataView.setFloat32(244, uniforms.actinBendStiffness, true);
        controlsDataView.setUint32(248, uniforms.stericSelfNeighbors, true);
        controlsDataView.setFloat32(252, uniforms.myosinStrength, true);
        controlsDataView.setFloat32(256, uniforms.myosinSpeed, true);
        controlsDataView.setFloat32(260, uniforms.membraneCoupling, true);
        controlsDataView.setFloat32(264, uniforms.substrateDrag, true);
        controlsDataView.setFloat32(268, uniforms.cortexPolymerization, true);
        controlsDataView.setFloat32(64, uniforms.monomerOpacity, true);
        controlsDataView.setUint32(68, uniforms.gActinField ? 1 : 0, true);
        controlsDataView.setFloat32(212, uniforms.areaConservation, true);
        controlsDataView.setFloat32(272, uniforms.cueX, true);
        controlsDataView.setFloat32(276, uniforms.cueY, true);
        controlsDataView.setUint32(280, uniforms.cueEnabled ? 1 : 0, true);
        controlsDataView.setUint32(284, cueVersion, true);
        controlsDataView.setUint32(288, uniforms.polarityMode ? 1 : 0, true);
        controlsDataView.setFloat32(292, uniforms.polarityTurnRate, true);
        controlsDataView.setFloat32(296, uniforms.rearTurnover, true);
        controlsDataView.setFloat32(300, Math.max(1, uniforms.turnoverAge), true);
        controlsDataView.setUint32(304, uniforms.tetherTurnover ? 1 : 0, true);
        controlsDataView.setFloat32(308, uniforms.tetherOnRate, true);
        controlsDataView.setFloat32(312, uniforms.tetherOffRate, true);
        controlsDataView.setUint32(316, Math.max(0, uniforms.tetherRecoverySteps), true);
        controlsDataView.setFloat32(320, uniforms.motorRearBias, true);
        controlsDataView.setFloat32(324, uniforms.frontAlignment, true);
        controlsDataView.setFloat32(328, uniforms.tetherLoadOff, true);
        controlsDataView.setUint32(332, uniforms.colourAge ? 1 : 0, true);
        device.queue.writeBuffer(interactions.controls.buffer, 0, interactions.controls.data);
        device.queue.writeBuffer(textures.canvas.buffer, 0, textures.canvas.data);
    };
    writeUniforms();
    // setup agents
    const randomBufferSize = Math.max(textures.size.width * textures.size.height, uniforms.actinCount + uniforms.membraneCount + 256);
    // initialize random buffer
    const randomData = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getRandomValues)(randomBufferSize, initialRandom);
    const numFloats = 10; // Segment struct size in 32-bit words
    const agent_buffers = {
        [BINDINGS_AGENTS.MECHANICAL_SNAPSHOT]: device.createBuffer({
            size: 32 * (uniforms.actinCount + uniforms.membraneCount + 2),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        }),
        [BINDINGS_AGENTS.MECHANICAL_LINKS]: device.createBuffer({
            size: 32 * (256 + uniforms.membraneCount),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        }),
        [BINDINGS_AGENTS.MECHANICAL_FORCES]: device.createBuffer({
            // Prefix: physical force accumulators. Tail: conservative membrane-edge
            // row shortlists; exact tests fall back to all edges on overflow.
            size: 8 * (uniforms.actinCount + uniforms.membraneCount + Math.ceil(actualHeight / 4) * 257),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        }),
        [BINDINGS_AGENTS.RANDOM]: device.createBuffer({
            label: "Random Buffer",
            size: randomData.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        }),
        [BINDINGS_AGENTS.ACTIN]: device.createBuffer({
            size: size32 * numFloats * uniforms.actinCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        }),
        [BINDINGS_AGENTS.MEMBRANE]: device.createBuffer({
            size: size32 * numFloats * uniforms.membraneCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        }),
        [BINDINGS_AGENTS.CONNECTION_LOCKS]: device.createBuffer({
            label: "Actin Connection Locks Buffer",
            size: size32 * uniforms.actinCount,
            usage: GPUBufferUsage.STORAGE,
        }),
    };
    const telemetry = new _telemetry__WEBPACK_IMPORTED_MODULE_13__.ActinTelemetry(device, agent_buffers[BINDINGS_AGENTS.ACTIN], uniforms.actinCount, agent_buffers[BINDINGS_AGENTS.MEMBRANE], uniforms.membraneCount, uniforms.membraneRestLength, urlParams.get("run") ?? "default", 30, !!uniforms.gActinField);
    telemetry.onSample = (s) => {
        renderModule.setCellBounds(s.cell.left, s.cell.right, s.cell.top, s.cell.bottom);
        if (recovery.active || s.diagnosticKind === "contact-recheck")
            return;
        if (uniforms.gActinField && (0,_contact_recovery__WEBPACK_IMPORTED_MODULE_4__.classifyCheckpoint)(s, !!uniforms.areaConservation) === "contacts") {
            void recovery.request(s);
            return;
        }
        const invalid = (uniforms.gActinField && (0,_contact_recovery__WEBPACK_IMPORTED_MODULE_4__.classifyCheckpoint)(s, !!uniforms.areaConservation) === "fatal") ||
            s.actinBalanceError ||
            s.brokenLinks ||
            s.cycles ||
            (uniforms.gActinField && (s.insidePolymerBeads !== s.inPolymer || s.crossingFilamentBonds)) ||
            (uniforms.areaConservation && Math.abs(s.cell.area - 1) > 0.001) ||
            !Number.isFinite(s.cell.centroidX);
        if (invalid)
            stopSimulation(`Numerical check failed at step ${s.step}: ${JSON.stringify({
                mass: s.actinBalanceError,
                insideF: s.insidePolymerBeads,
                totalF: s.inPolymer,
                crossings: s.crossingFilamentBonds,
                brokenLinks: s.brokenLinks,
                cycles: s.cycles,
                area: s.cell.area,
                centroidX: s.cell.centroidX,
            })}; reset to replay.`);
    };
    let contactBackup = null;
    async function readActin() {
        const source = agent_buffers[BINDINGS_AGENTS.ACTIN];
        const stage = device.createBuffer({ size: source.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        try {
            const encoder = device.createCommandEncoder();
            encoder.copyBufferToBuffer(source, 0, stage, 0, source.size);
            device.queue.submit([encoder.finish()]);
            await stage.mapAsync(GPUMapMode.READ);
            return stage.getMappedRange().slice(0);
        }
        finally {
            stage.destroy();
        }
    }
    const recovery = new _contact_recovery__WEBPACK_IMPORTED_MODULE_4__.ContactRecovery({
        inspect: async () => {
            await device.queue.onSubmittedWorkDone();
            await telemetry.update(time, frameNr, uniforms.equilibriumLineDistance, true, true);
            if (gpuErrors.length)
                throw Error(gpuErrors.join("\n"));
            return telemetry.history.at(-1);
        },
        begin: async () => {
            contactBackup = await readActin();
        },
        repair: async (iterations) => {
            (0,_simulate__WEBPACK_IMPORTED_MODULE_3__.runContactRepair)(device, simPipelines, bindGroupSimulate, BUFFER_WORKGROUP_COUNT, canvas.canvas.height, iterations);
            const current = await readActin(), before = new Float32Array(contactBackup), after = new Float32Array(current);
            const bu = new Uint32Array(contactBackup), au = new Uint32Array(current);
            let maximum = 0;
            for (let i = 0; i < after.length; i += 10) {
                for (let j = 0; j < 10; j++)
                    if (j !== 2 && j !== 3 && bu[i + j] !== au[i + j])
                        throw Error("Contact repair changed actin metadata");
                const displacement = Math.hypot(after[i + 2] - before[i + 2], after[i + 3] - before[i + 3]);
                if (!Number.isFinite(displacement))
                    throw Error("Non-finite contact correction");
                maximum = Math.max(maximum, displacement);
            }
            return maximum;
        },
        rollback: async () => {
            if (contactBackup)
                device.queue.writeBuffer(agent_buffers[BINDINGS_AGENTS.ACTIN], 0, contactBackup);
            await device.queue.onSubmittedWorkDone();
        },
        dispose: () => {
            contactBackup = null;
        },
        fixedArea: () => !!uniforms.areaConservation,
        maxDisplacement: () => 8,
        now: () => performance.now(),
        notice: (message) => {
            document.getElementById("mechanical-status").textContent = message;
        },
        fail: stopSimulation,
    });
    agent_buffers[BINDINGS_AGENTS.TELEMETRY] = telemetry.counterBuffer;
    device.queue.writeBuffer(agent_buffers[BINDINGS_AGENTS.RANDOM], /*offset=*/ 0, /*data=*/ randomData);
    // ---------------------------
    // Overall memory layout
    const visibility = GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT;
    // This layout is for shared resources between simulation and rendering
    const sharedLayoutEntries = [
        ...Object.values(BINDINGS_BUFFER).map((binding) => ({
            binding: binding,
            visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
            buffer: { type: "uniform" },
        })),
        ...Object.values(BINDINGS_TEXTURE).map((binding) => ({
            binding: binding,
            visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
            storageTexture: textures.bindingLayout[binding],
        })),
    ];
    const sharedBindGroupEntries = [
        ...Object.values(BINDINGS_TEXTURE).map((binding) => ({
            binding,
            resource: textures.textures[binding].createView(),
        })),
        ...Object.values(BINDINGS_BUFFER).map((binding) => ({
            binding,
            resource: { buffer: canvas_buffers[binding] },
        })),
    ];
    const bindGroupLayoutSimulate = device.createBindGroupLayout({
        label: "bindGroupLayoutSimulate",
        entries: [
            ...sharedLayoutEntries,
            ...Object.values(BINDINGS_AGENTS).map((binding) => ({
                binding: binding,
                visibility: visibility,
                buffer: { type: "storage" },
            })),
        ],
    });
    const bindGroupSimulate = device.createBindGroup({
        label: `Bind Group`,
        layout: bindGroupLayoutSimulate,
        entries: [
            ...sharedBindGroupEntries,
            ...Object.values(BINDINGS_AGENTS).map((binding) => ({
                binding,
                resource: { buffer: agent_buffers[binding] },
            })),
        ],
    });
    const pipelineLayoutSimulate = device.createPipelineLayout({
        label: "pipelineLayout",
        bindGroupLayouts: [bindGroupLayoutSimulate],
    });
    function lineConstraintFunction(pass) {
        pass.setPipeline(simPipelines.orientationUpdate);
        pass.dispatchWorkgroups(MAX_BUFFER_WORKGROUP_COUNT);
        pass.setPipeline(simPipelines.cosseratUpdate);
        for (let i = 0; i < uniforms.actinCosseratIterations; i++) {
            pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN);
        }
        pass.setPipeline(simPipelines.lineConstraint);
        pass.dispatchWorkgroups(MAX_BUFFER_WORKGROUP_COUNT);
        pass.setPipeline(simPipelines.membraneTangentialFlow);
        for (let i = 0; i < uniforms.membraneFlowIterations; i++) {
            pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.MEMBRANE);
        }
    }
    // ---------------------------
    // Set up code instructions
    const module = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createShader)(device, _shaders_simulate_wgsl__WEBPACK_IMPORTED_MODULE_2__, shaderIncludes);
    const simPipelines = (0,_simulate__WEBPACK_IMPORTED_MODULE_3__.createSimulationPipelines)(device, module, pipelineLayoutSimulate);
    // ---------------------------
    // RUN the reset shader function
    const reset = () => {
        writeUniforms();
        device.queue.writeBuffer(agent_buffers[BINDINGS_AGENTS.MECHANICAL_LINKS], 0, new Uint32Array(8 * (256 + uniforms.membraneCount)));
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setBindGroup(GROUP_INDEX, bindGroupSimulate);
        pass.setPipeline(simPipelines.resetActin);
        pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN);
        pass.setPipeline(simPipelines.resetMembrane);
        pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.MEMBRANE);
        pass.end();
        device.queue.submit([encoder.finish()]);
        if (uniforms.gActinField || uniforms.areaConservation)
            (0,_simulate__WEBPACK_IMPORTED_MODULE_3__.runEnclosure)(device, simPipelines, bindGroupSimulate, BUFFER_WORKGROUP_COUNT, actualHeight);
        telemetry.reset();
    };
    reset();
    const renderShader = await (0,_utils__WEBPACK_IMPORTED_MODULE_0__.createShader)(device, _shaders_render_wgsl__WEBPACK_IMPORTED_MODULE_1__, shaderIncludes);
    const renderModule = new _render__WEBPACK_IMPORTED_MODULE_11__.RenderModule(device, canvas.format, { width: actualWidth, height: actualHeight }, renderShader, textures, sharedLayoutEntries, sharedBindGroupEntries, { buffer: agent_buffers[BINDINGS_AGENTS.MECHANICAL_SNAPSHOT], offset: 32 * (uniforms.actinCount + uniforms.membraneCount), size: 32 });
    for (const [key, parameter, low, high] of [
        ["mode", "microscope", 0, 1],
        ["zoom", "viewZoom", 1, 6],
        ["focus", "focus", -1, 1],
        ["contrast", "opticalContrast", 0.2, 2.5],
    ]) {
        if (urlParams.has(parameter)) {
            const value = Number(urlParams.get(parameter));
            if (Number.isFinite(value))
                renderModule.view[key] = Math.max(low, Math.min(high, value));
        }
    }
    renderModule.view.mode = renderModule.view.mode ? 1 : 0;
    renderModule.view.autoFit = !urlParams.has("viewZoom");
    const initialRadius = (uniforms.membraneCount * uniforms.membraneRestLength) / (2 * Math.PI);
    renderModule.setCellBounds(actualWidth / 2 - initialRadius, actualWidth / 2 + initialRadius, actualHeight / 2 - initialRadius, actualHeight / 2 + initialRadius);
    renderModule.fitImmediately();
    // Show the initial soluble compartment even when opened paused. This writes
    // only the visualization mask, not reaction/steric fields or physical state.
    if (uniforms.gActinField) {
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginComputePass();
        pass.setBindGroup(0, bindGroupSimulate);
        pass.setPipeline(simPipelines.drawReservoir);
        pass.dispatchWorkgroups(...TEXTURE_WORKGROUP_COUNT);
        pass.end();
        device.queue.submit([encoder.finish()]);
        renderModule.render(canvas.context);
    }
    var frameNr = 0;
    const sprouts = new _sprouts__WEBPACK_IMPORTED_MODULE_12__.SproutScheduler(uniforms.sproutOnSteps + uniforms.sproutOffSteps, (0,_random__WEBPACK_IMPORTED_MODULE_14__.seededRandom)(seed ^ 0xa341316c));
    const sproutSites = new Float32Array(interactions.controls.data, 80, 4 * _sprouts__WEBPACK_IMPORTED_MODULE_12__.MAX_SPROUT_SITES);
    // RUN the sim compute function and render pixels
    async function timestep(stepCount = uniforms.computeStepsPerFrame) {
        if (recovery.active)
            return;
        time++;
        if (controlsDirty) {
            writeUniforms();
            controlsDirty = false;
        }
        device.queue.writeBuffer(interactions.interactions.buffer, 0, interactions.interactions.data);
        for (let i = 0; i < stepCount; i++) {
            sprouts.update(frameNr, uniforms, sproutSites);
            device.queue.writeBuffer(interactions.controls.buffer, 80, sproutSites);
            (0,_simulate__WEBPACK_IMPORTED_MODULE_3__.runSimulationStep)(device, simPipelines, bindGroupSimulate, BUFFER_WORKGROUP_COUNT, TEXTURE_WORKGROUP_COUNT, lineConstraintFunction, frameNr, i === stepCount - 1, !!(uniforms.gActinField || uniforms.areaConservation), !!uniforms.polarityMode);
            frameNr++;
        }
        renderModule.render(canvas.context);
        if (uniforms.cueEnabled)
            displayCue();
        telemetry.snapshot(time, canvas.canvas);
        if (!paused)
            telemetry.update(time, frameNr, uniforms.equilibriumLineDistance).catch(stopSimulation);
        if (time % 30 === 0)
            mechanicalSummary()
                .then(({ motors, tethers }) => {
                const status = document.getElementById("mechanical-status");
                if (status)
                    status.textContent = `Seed ${seed} · ${motors} motor links · ${tethers} tethers · cortex ${uniforms.cortexPolymerization > 0 ? "on" : "off"}`;
            })
                .catch(stopSimulation);
    }
    async function mechanicalSummary() {
        const buffer = agent_buffers[BINDINGS_AGENTS.MECHANICAL_LINKS];
        const staging = device.createBuffer({ size: buffer.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(buffer, 0, staging, 0, buffer.size);
        device.queue.submit([encoder.finish()]);
        await staging.mapAsync(GPUMapMode.READ);
        const words = new Uint32Array(staging.getMappedRange());
        let motors = 0, tethers = 0, posteriorTethers = 0;
        for (let i = 0; i < words.length / 8; i++) {
            if (words[i * 8]) {
                if (i < 256)
                    motors++;
                else {
                    tethers++;
                    const arc = (i - 256) / uniforms.membraneCount;
                    if (arc > 0.25 && arc < 0.75)
                        posteriorTethers++;
                }
            }
        }
        staging.unmap();
        staging.destroy();
        return { motors, tethers, posteriorTethers };
    }
    const cueMarker = document.getElementById("cue-marker");
    function displayCue() {
        cueMarker.hidden = !uniforms.cueEnabled;
        const rect = canvas.canvas.getBoundingClientRect();
        const point = renderModule.worldToScreen(uniforms.cueX, uniforms.cueY);
        cueMarker.style.left = `${rect.left + (point.x / actualWidth) * rect.width}px`;
        cueMarker.style.top = `${rect.top + (point.y / actualHeight) * rect.height}px`;
        document.getElementById("cue-status").textContent = uniforms.polarityMode
            ? "Persistent heading · drag to set a new direction · Esc faces right"
            : uniforms.cueEnabled
                ? "Polarity cue active · drag to move · Esc to clear"
                : "Click or drag the canvas to move the active edge";
    }
    function setCue(x, y) {
        if (!Number.isFinite(x) || !Number.isFinite(y))
            throw new Error("Cue coordinates must be finite");
        uniforms.cueX = Math.max(0, Math.min(actualWidth, x));
        uniforms.cueY = Math.max(0, Math.min(actualHeight, y));
        uniforms.cueEnabled = 1;
        cueVersion++;
        controlsDirty = true;
        livePerformance.input();
        displayCue();
    }
    function clearCue() {
        uniforms.cueEnabled = 0;
        cueVersion++;
        controlsDirty = true;
        livePerformance.input();
        displayCue();
    }
    async function cueState() {
        const staging = device.createBuffer({ size: 32, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        try {
            const encoder = device.createCommandEncoder();
            encoder.copyBufferToBuffer(agent_buffers[BINDINGS_AGENTS.MECHANICAL_SNAPSHOT], 32 * (uniforms.actinCount + uniforms.membraneCount + 1), staging, 0, 32);
            device.queue.submit([encoder.finish()]);
            await staging.mapAsync(GPUMapMode.READ);
            const data = staging.getMappedRange(), u = new Uint32Array(data), f = new Float32Array(data);
            return { index: u[4], version: u[5], x: f[0], y: f[1], axisX: f[2], axisY: f[3], enabled: !!uniforms.cueEnabled, step: frameNr };
        }
        finally {
            if (staging.mapState === "mapped")
                staging.unmap();
            staging.destroy();
        }
    }
    canvas.canvas.style.touchAction = "none";
    let dragging = false;
    const pointCue = (e) => {
        const rect = canvas.canvas.getBoundingClientRect();
        const point = renderModule.screenToWorld(((e.clientX - rect.left) / rect.width) * actualWidth, ((e.clientY - rect.top) / rect.height) * actualHeight);
        setCue(point.x, point.y);
    };
    canvas.canvas.addEventListener("pointerdown", (e) => {
        if (e.button !== 0)
            return;
        dragging = true;
        canvas.canvas.setPointerCapture(e.pointerId);
        pointCue(e);
    });
    canvas.canvas.addEventListener("pointermove", (e) => {
        if (dragging)
            pointCue(e);
    });
    canvas.canvas.addEventListener("pointerup", () => {
        dragging = false;
    });
    canvas.canvas.addEventListener("pointercancel", () => {
        dragging = false;
    });
    canvas.canvas.addEventListener("lostpointercapture", () => {
        dragging = false;
    });
    window.addEventListener("resize", () => {
        renderModule.fitImmediately();
        updateView();
    });
    displayCue();
    function updateView() {
        document.body.dataset.view = renderModule.view.mode ? "microscope" : "diagnostic";
        document.getElementById("demo-title").textContent = renderModule.view.mode ? "Cell · transmitted light" : "Explicit filaments · diagnostics";
        document.getElementById("view-zoom-value").textContent = `${renderModule.view.zoom.toFixed(1)}×`;
        renderModule.render(canvas.context);
        displayCue();
    }
    const viewSelect = document.getElementById("view-mode");
    viewSelect.value = String(renderModule.view.mode);
    viewSelect.addEventListener("change", () => {
        renderModule.view.mode = Number(viewSelect.value);
        updateView();
    });
    for (const [id, key] of [
        ["view-zoom", "zoom"],
        ["view-focus", "focus"],
        ["view-contrast", "contrast"],
    ]) {
        const input = document.getElementById(id);
        input.value = String(renderModule.view[key]);
        input.addEventListener("input", () => {
            renderModule.view[key] = Number(input.value);
            if (key === "zoom")
                renderModule.view.autoFit = false;
            updateView();
        });
    }
    document.getElementById("follow-cell").addEventListener("change", (e) => {
        renderModule.view.follow = e.target.checked;
        updateView();
    });
    updateView();
    const settingsPanel = document.getElementById("demo-panel");
    const settingsButton = document.getElementById("toggle-settings");
    function setSettings(open) {
        settingsPanel.hidden = !open;
        settingsButton.setAttribute("aria-expanded", String(open));
        document.body.dataset.settings = open ? "open" : "closed";
        if (open)
            document.getElementById("close-settings").focus();
        else
            settingsButton.focus();
    }
    settingsButton.addEventListener("click", () => setSettings(settingsPanel.hidden));
    document.getElementById("close-settings").addEventListener("click", () => setSettings(false));
    document.getElementById("fit-cell").addEventListener("click", () => {
        renderModule.view.autoFit = true;
        renderModule.view.follow = true;
        renderModule.fitImmediately();
        updateView();
    });
    document.getElementById("restore-demo").addEventListener("click", () => {
        location.href = location.pathname + "?demo=1";
    });
    settingsPanel.append(document.getElementById("diagnostics"));
    settingsPanel.append(document.getElementById("fpsCounter"));
    window.filamentDemo = {
        seed,
        uniforms,
        gpuErrors,
        runtimeErrors,
        contactRecovery: recovery,
        view: renderModule.view,
        redraw: updateView,
        screenToWorld: (x, y) => renderModule.screenToWorld(x, y),
        setCue,
        clearCue,
        cueState,
        get paused() {
            return paused;
        },
        get step() {
            return frameNr;
        },
        performanceSnapshot: () => ({ ...livePerformance.snapshot(), diagnostics: { ...telemetry.timings } }),
        pause: () => {
            setPaused(true);
        },
        play: () => {
            setPaused(false);
        },
        async advance(steps) {
            if (!paused || recovery.active || manualAdvancePending || !Number.isInteger(steps) || steps < 0 || steps > 2000)
                throw new Error("Pause and request one batch of 0–2000 whole steps");
            manualAdvancePending = true;
            try {
                await device.queue.onSubmittedWorkDone();
                for (let remaining = steps; remaining > 0;) {
                    await recovery.wait();
                    if (runtimeErrors.length)
                        throw new Error(runtimeErrors.join("\n"));
                    const batch = Math.min(20, remaining);
                    await timestep(batch);
                    remaining -= batch;
                    await device.queue.onSubmittedWorkDone();
                    if (gpuErrors.length)
                        throw new Error(gpuErrors.join("\n"));
                }
                await telemetry.update(time, frameNr, uniforms.equilibriumLineDistance, true);
                await recovery.wait();
                if (runtimeErrors.length)
                    throw new Error(runtimeErrors.join("\n"));
                updateView();
                document.getElementById("fpsCounter").textContent = `Paused · step ${frameNr}`;
                return { stats: telemetry.history.at(-1), links: await mechanicalSummary(), gpuErrors };
            }
            finally {
                manualAdvancePending = false;
            }
        },
    };
    if (urlParams.has("mechanicsTest")) {
        window.filamentDemo.testRenewal = () => {
            if (!paused)
                throw Error("Pause before destructive renewal fixtures");
            return (0,_renewal_test__WEBPACK_IMPORTED_MODULE_17__.testRenewal)(device, {
                actin: agent_buffers[BINDINGS_AGENTS.ACTIN],
                membrane: agent_buffers[BINDINGS_AGENTS.MEMBRANE],
                links: agent_buffers[BINDINGS_AGENTS.MECHANICAL_LINKS],
                snapshot: agent_buffers[BINDINGS_AGENTS.MECHANICAL_SNAPSHOT],
            }, { actin: uniforms.actinCount, membrane: uniforms.membraneCount }, (values) => {
                Object.assign(uniforms, values);
                writeUniforms();
            }, (kind, repeats = 1) => {
                const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
                pass.setBindGroup(0, bindGroupSimulate);
                if (kind === "polarity") {
                    pass.setPipeline(simPipelines.measureEnclosure);
                    pass.dispatchWorkgroups(1);
                    pass.setPipeline(simPipelines.resolveCue);
                    pass.dispatchWorkgroups(1);
                }
                else if (kind === "turnover") {
                    pass.setPipeline(simPipelines.unbindMinPole);
                    pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN);
                }
                else if (kind === "motor") {
                    pass.setPipeline(simPipelines.snapshotMechanics);
                    pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN + BUFFER_WORKGROUP_COUNT.MEMBRANE);
                    pass.setPipeline(simPipelines.motorLinks);
                    pass.dispatchWorkgroups(1);
                    pass.setPipeline(simPipelines.applyMechanicalForces);
                    pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN + BUFFER_WORKGROUP_COUNT.MEMBRANE);
                }
                else {
                    pass.setPipeline(simPipelines.actinesToTextures);
                    pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN);
                    pass.setPipeline(simPipelines.snapshotMechanics);
                    pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.ACTIN + BUFFER_WORKGROUP_COUNT.MEMBRANE);
                    pass.setPipeline(simPipelines.membraneTethers);
                    for (let i = 0; i < repeats; i++)
                        pass.dispatchWorkgroups(BUFFER_WORKGROUP_COUNT.MEMBRANE);
                }
                pass.end();
                device.queue.submit([encoder.finish()]);
            });
        };
        window.filamentDemo.testEnclosure = () => {
            if (!paused)
                throw new Error("Pause before running destructive enclosure fixtures");
            return (0,_enclosure_test__WEBPACK_IMPORTED_MODULE_16__.testEnclosure)(device, { actin: agent_buffers[BINDINGS_AGENTS.ACTIN], membrane: agent_buffers[BINDINGS_AGENTS.MEMBRANE] }, { actin: uniforms.actinCount, membrane: uniforms.membraneCount }, () => (0,_simulate__WEBPACK_IMPORTED_MODULE_3__.runEnclosure)(device, simPipelines, bindGroupSimulate, BUFFER_WORKGROUP_COUNT, actualHeight), (fixedArea, area) => {
                uniforms.gActinField = 1;
                uniforms.areaConservation = fixedArea ? 1 : 0;
                uniforms.membraneRestLength = Math.sqrt(4 * Math.PI * area) / uniforms.membraneCount;
                writeUniforms();
            });
        };
        window.filamentDemo.testMechanics = () => {
            if (!paused)
                throw new Error("Pause before running destructive mechanical fixtures");
            return (0,_mechanics_test__WEBPACK_IMPORTED_MODULE_15__.testMechanics)(device, {
                actin: agent_buffers[BINDINGS_AGENTS.ACTIN],
                membrane: agent_buffers[BINDINGS_AGENTS.MEMBRANE],
                links: agent_buffers[BINDINGS_AGENTS.MECHANICAL_LINKS],
                forces: agent_buffers[BINDINGS_AGENTS.MECHANICAL_FORCES],
            }, { actin: uniforms.actinCount, membrane: uniforms.membraneCount }, () => {
                const encoder = device.createCommandEncoder();
                const pass = encoder.beginComputePass();
                pass.setBindGroup(0, bindGroupSimulate);
                const count = Math.ceil((uniforms.actinCount + uniforms.membraneCount) / WORKGROUP_SIZE);
                for (const [pipeline, groups] of [
                    [simPipelines.resolveCue, 1],
                    [simPipelines.snapshotMechanics, count],
                    [simPipelines.motorLinks, 1],
                    [simPipelines.membraneTethers, BUFFER_WORKGROUP_COUNT.MEMBRANE],
                    [simPipelines.applyMechanicalForces, count],
                ]) {
                    pass.setPipeline(pipeline);
                    pass.dispatchWorkgroups(groups);
                }
                pass.end();
                device.queue.submit([encoder.finish()]);
            }, (strength, coupling, drag) => {
                uniforms.myosinStrength = strength;
                uniforms.membraneCoupling = coupling;
                uniforms.substrateDrag = drag;
                uniforms.cueEnabled = 0;
                writeUniforms();
            });
        };
    }
    const pauseButton = document.getElementById("pause-demo");
    pauseButton.textContent = paused ? "Resume" : "Pause";
    pauseButton.addEventListener("click", () => {
        setPaused(!paused);
    });
    document.getElementById("reset-demo").addEventListener("click", () => location.reload());
    document.getElementById("clear-cue").addEventListener("click", clearCue);
    const stepButton = document.getElementById("step-demo");
    async function singleStep() {
        if (stepButton.disabled)
            return;
        stepButton.disabled = true;
        setPaused(true);
        try {
            await window.filamentDemo.advance(1);
        }
        catch (error) {
            stopSimulation(error);
        }
        finally {
            stepButton.disabled = false;
        }
    }
    stepButton.addEventListener("click", singleStep);
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !settingsPanel.hidden) {
            setSettings(false);
            return;
        }
        if (event.ctrlKey || event.metaKey || event.altKey)
            return;
        if (event.target?.closest("input,select,textarea,button,[contenteditable=true]") || event.repeat)
            return;
        if (event.code === "Space") {
            event.preventDefault();
            setPaused(!paused);
        }
        else if (event.key.toLowerCase() === "n") {
            event.preventDefault();
            void singleStep();
        }
        else if (event.key === "Escape") {
            clearCue();
        }
        else if (event.key.toLowerCase() === "r") {
            location.reload();
        }
    });
    for (const key of ["lamellipodiumStrength", "myosinStrength", "membraneCoupling"]) {
        const slider = document.getElementById(`live-${key}`);
        const value = document.getElementById(`value-${key}`);
        slider.value = String(uniforms[key]);
        value.textContent = uniforms[key].toFixed(key === "lamellipodiumStrength" ? 2 : 3);
        slider.addEventListener("input", () => {
            uniforms[key] = Number(slider.value);
            value.textContent = uniforms[key].toFixed(key === "lamellipodiumStrength" ? 2 : 3);
            controlsDirty = true;
            livePerformance.input();
        });
    }
    const adaptive = document.getElementById("adaptive-frames");
    adaptive.checked = !!uniforms.adaptiveFrames;
    adaptive.addEventListener("change", () => {
        uniforms.adaptiveFrames = adaptive.checked ? 1 : 0;
        livePerformance.input();
    });
    const cellSize = document.getElementById("cell-size");
    const compactLink = document.getElementById("compact-demo");
    const compactUrl = new URL(compactLink.href);
    compactUrl.searchParams.set("seed", String(seed));
    compactLink.href = compactUrl.toString();
    const renewalLink = document.getElementById("renewal-demo");
    const renewalUrl = new URL(renewalLink.href);
    renewalUrl.searchParams.set("seed", String(seed));
    renewalLink.href = renewalUrl.toString();
    const selectedSize = String(uniforms.membraneRestLength);
    if (![...cellSize.options].some((option) => option.value === selectedSize)) {
        cellSize.add(new Option(`${Math.round(150 * uniforms.membraneRestLength)}% (custom)`, selectedSize));
    }
    cellSize.value = selectedSize;
    cellSize.addEventListener("change", () => {
        const next = new URL(location.href);
        next.searchParams.set("membraneRestLength", cellSize.value);
        location.href = next.toString();
    });
    for (const name of ["gActinField", "areaConservation"]) {
        const checkbox = document.getElementById(name);
        checkbox.checked = uniforms[name] > 0;
        checkbox.addEventListener("change", () => {
            const next = new URL(location.href);
            next.searchParams.set(name, checkbox.checked ? "1" : "0");
            location.href = next.toString();
        });
    }
    const cortexToggle = document.getElementById("cortex-toggle");
    cortexToggle.checked = uniforms.cortexPolymerization > 0;
    cortexToggle.addEventListener("change", () => {
        const next = new URL(location.href);
        next.searchParams.set("cortexPolymerization", cortexToggle.checked ? "0.03" : "0");
        location.href = next.toString();
    });
    document.getElementById("mechanical-status").textContent = `Seed ${seed} · motor ${uniforms.myosinStrength} · coupling ${uniforms.membraneCoupling}`;
    document.getElementById("enclosure-status").textContent =
        `G-actin: ${uniforms.gActinField ? "conserved, well-mixed pool" : "legacy particles"} · area: ${uniforms.areaConservation ? "constrained" : "free"}`;
    for (const anchor of document.querySelectorAll("[data-case]")) {
        const next = new URL(anchor.href);
        next.searchParams.set("seed", String(seed));
        next.searchParams.set("cortexPolymerization", String(uniforms.cortexPolymerization));
        next.searchParams.set("membraneRestLength", String(uniforms.membraneRestLength));
        next.searchParams.set("actinCount", String(uniforms.actinCount));
        next.searchParams.set("gActinField", String(uniforms.gActinField));
        next.searchParams.set("areaConservation", String(uniforms.areaConservation));
        for (const key of [
            "polarityMode",
            "polarityTurnRate",
            "rearTurnover",
            "turnoverAge",
            "tetherTurnover",
            "tetherOnRate",
            "tetherOffRate",
            "tetherRecoverySteps",
            "motorRearBias",
            "frontAlignment",
            "tetherLoadOff",
            "colourAge",
        ])
            next.searchParams.set(key, String(uniforms[key]));
        anchor.href = next.toString();
        const active = Number(next.searchParams.get("myosinStrength") ?? 0) === uniforms.myosinStrength &&
            Number(next.searchParams.get("membraneCoupling") ?? 0) === uniforms.membraneCoupling &&
            Number(next.searchParams.get("membraneStiffness") ?? 3) === uniforms.membraneStiffness;
        anchor.setAttribute("aria-current", String(active));
    }
    // GUI for controls for desktop only
    if (!isMobileDevice) {
        let gui = new lil_gui__WEBPACK_IMPORTED_MODULE_19__["default"]({ container: document.getElementById("advanced-controls") });
        const mechanics = gui.addFolder("Actomyosin hypothesis");
        const renewal = gui.addFolder("Polarity and renewal");
        renewal.add(uniforms, "polarityMode", { materialPole: 0, persistentDirection: 1 }).name("Polarity frame");
        renewal.add(uniforms, "polarityTurnRate", 0.001, 0.1, 0.001).name("Turning / step");
        renewal.add(uniforms, "rearTurnover", 0, 0.1, 0.005).name("Aged rear clearance");
        renewal.add(uniforms, "turnoverAge", 100, 2000, 50).name("Actin maturation steps");
        renewal.add(uniforms, "motorRearBias", 0, 1, 0.05).name("Mature-rear motor bias");
        renewal.add(uniforms, "frontAlignment", 0, 1, 0.05).name("Front filament alignment");
        renewal.add(uniforms, "colourAge", { assemblyRecency: 0, beadAge: 1 }).name("Actin colours");
        renewal.add(uniforms, "tetherTurnover", { immediateRebinding: 0, finiteBinding: 1 }).name("Tether kinetics");
        renewal.add(uniforms, "tetherOnRate", 0.001, 0.1, 0.001).name("Tether binding / step");
        renewal.add(uniforms, "tetherOffRate", 0, 0.02, 0.001).name("Tether release / step");
        renewal.add(uniforms, "tetherRecoverySteps", 0, 300, 10).name("Tether unbound dwell");
        mechanics.add(uniforms, "myosinStrength", 0, 0.2, 0.005).name("Motor contractility").listen();
        mechanics.add(uniforms, "myosinSpeed", 0, 0.1, 0.005).name("Link shortening / step");
        mechanics.add(uniforms, "membraneCoupling", 0, 0.2, 0.005).name("Membrane tethers").listen();
        mechanics.add(uniforms, "substrateDrag", 0, 20, 0.5).name("Front clutch drag");
        mechanics.add(uniforms, "cortexPolymerization", 0, 0.1, 0.005).name("Basal cortex assembly");
        gui.add(uniforms, "monomerOpacity", 0, 1, 0.05).name("Monomer visibility");
        gui.add(uniforms, "computeStepsPerFrame").min(1).max(75).step(1).name("Max steps / frame");
        gui.add(uniforms, "targetFPS").min(1).max(120).step(1).name("Target FPS");
        gui.add(uniforms, "stiffness").min(0.0).max(2.0).name("Stiffness");
        gui.add(uniforms, "foodNearbyThreshold").min(0.0000001).max(1.0).name("Food Nearby Threshold");
        gui.add(uniforms, "disconnectionProbability").min(0).max(0.999).name("Disconnection probability");
        gui.add(uniforms, "stericSamplingRange").min(1).max(50).step(1).name("Steric Sampling Range");
        gui.add(uniforms, "actinCohesionRange").min(1).max(100).step(1).name("Actin Cohesion Range");
        gui.add(uniforms, "bindProb").min(0.0).max(0.1).step(0.0001).name("Bind Probability");
        gui.add(uniforms, "actinStericForce").min(0.0).max(1.0).name("Actin Steric Force");
        gui.add(uniforms, "actinBendStiffness").min(0.0).max(4.0).name("Actin Bend Stiffness");
        gui.add(uniforms, "actinCosseratIterations").min(0).max(16).step(1).name("Actin Cosserat Iterations");
        gui.add(uniforms, "stericSelfNeighbors").min(0).max(12).step(1).name("Steric Self Neighbors");
        gui.add(uniforms, "equilibriumLineDistance").min(0.01).max(6.0).name("Equilibrium Line Distance");
        gui.add(uniforms, "polymerRepulsion").min(0.0).max(1.0).name("Polymer Repulsion");
        gui.add(uniforms, "monomerMembraneRepulsion").min(0.0).max(2.0).name("Monomer-Membrane Repulsion");
        gui.add(uniforms, "bindLengthFloor").min(1).max(64).step(1).name("Bind Length Floor");
        gui.add(uniforms, "bindLengthSaturation").min(1).max(64).step(1).name("Bind Length Saturation");
        gui.add(uniforms, "movementMode").options({ Idle: 0, "Move East": 1 }).name("Movement Mode");
        // the other membrane settings are tuned and rarely touched; they can still be set from the URL, e.g. ?membraneFlow=0.3
        gui.add(uniforms, "membraneStiffness").min(0.0).max(100.0).name("Membrane Stiffness");
        gui.add(uniforms, "membraneSmoothing").min(0.0).max(0.5).name("Membrane Smoothing");
        gui.add(uniforms, "polymerizationPatchSize").min(0.0).max(0.2).name("Polymerization Patch Size");
        gui.add(uniforms, "polymerizationFieldDecay").min(0.8).max(0.999).step(0.001).name("Polymerization Field Decay");
        gui.add(uniforms, "lamellipodiumStrength").min(0.0).max(2.0).name("Lamellipodium Strength").listen();
        gui.add(uniforms, "lamellipodiumWidth").min(0.0).max(0.5).name("Lamellipodium Width");
        gui.add(uniforms, "lamellipodiumFieldDecay").min(0.8).max(0.999).step(0.001).name("Lamellipodium Field Decay");
        gui.add(uniforms, "branchProbability").min(0.0).max(0.2).step(0.001).name("Branch Probability");
        gui.add(uniforms, "debranchProbability").min(0.0).max(0.01).step(0.0001).name("Debranch Probability");
        gui.add(uniforms, "sproutCount").min(0).max(_sprouts__WEBPACK_IMPORTED_MODULE_12__.MAX_SPROUT_SITES).step(1).name("Sprout Sites");
        gui.add(uniforms, "sproutWidth").min(1).max(16).step(1).name("Sprout Width (nodes)");
        gui.add(uniforms, "sproutFrontBias").min(0.0).max(1.0).name("Sprout Front Bias");
        gui.add(uniforms, "sproutOnSteps").min(100).max(20000).step(100).name("Sprout On Steps");
        gui.add(uniforms, "sproutOffSteps").min(100).max(20000).step(100).name("Sprout Off Steps");
        gui.add({ executeFunction: () => location.reload() }, "executeFunction").name("Reset seed and fields");
        gui
            .add({
            pause: () => {
                setPaused(!paused);
            },
        }, "pause")
            .name("Pause / resume");
        gui.onChange(() => {
            controlsDirty = true;
            livePerformance.input();
            displayCue();
            for (const key of ["lamellipodiumStrength", "myosinStrength", "membraneCoupling"]) {
                document.getElementById(`live-${key}`).value = String(uniforms[key]);
                document.getElementById(`value-${key}`).textContent = uniforms[key].toFixed(key === "lamellipodiumStrength" ? 2 : 3);
            }
        });
        gui.close();
    }
    let lastFrameTime = 0;
    setPaused(paused);
    document.getElementById("demo-notice").hidden = true;
    let framePending = false;
    const getFrameInterval = () => 1000 / uniforms.targetFPS; // Convert FPS to milliseconds
    function frame(currentTime) {
        if (!paused && !recovery.active && !framePending && !manualAdvancePending && currentTime - lastFrameTime >= getFrameInterval() - 0.5) {
            framePending = true;
            const start = performance.now(), input = livePerformance.inputSnapshot();
            const steps = uniforms.adaptiveFrames ? frameBudget.choose(uniforms.computeStepsPerFrame, uniforms.targetFPS) : uniforms.computeStepsPerFrame;
            let encodedAt = start;
            timestep(steps)
                .then(() => {
                encodedAt = performance.now();
                return device.queue.onSubmittedWorkDone();
            })
                .then(() => {
                const done = performance.now();
                frameBudget.observe(steps, done - start, encodedAt - start);
                livePerformance.frame({ at: done, steps, encodeMs: encodedAt - start, queueTailMs: done - encodedAt, totalMs: done - start }, input);
                const perf = livePerformance.snapshot();
                document.getElementById("fpsCounter").textContent = paused
                    ? `Paused · step ${frameNr}`
                    : `${perf.renderFPS.toFixed(0)} FPS · ${perf.stepsPerSecond.toFixed(0)} steps/s · ${steps} step${steps === 1 ? "" : "s"}/frame`;
            })
                .catch(stopSimulation)
                .finally(() => {
                framePending = false;
            });
            lastFrameTime = currentTime;
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return;
}
index().catch((error) => {
    const status = document.getElementById("mechanical-status");
    if (status)
        status.textContent = `Unable to start WebGPU: ${String(error)}`;
    const notice = document.getElementById("demo-notice");
    if (notice) {
        notice.hidden = false;
        notice.textContent = `Unable to start WebGPU: ${String(error)}`;
    }
    console.error(error);
});


/***/ }),

/***/ "./src/mechanics-test.ts":
/*!*******************************!*\
  !*** ./src/mechanics-test.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   testMechanics: () => (/* binding */ testMechanics)
/* harmony export */ });
// Executed only with ?mechanicsTest=1. Tests the actual WGSL pipelines on two
// explicit two-bead filaments and one membrane attachment, not a CPU surrogate.
async function testMechanics(device, buffers, counts, dispatch, configure) {
    const results = [];
    const assert = (name, ok) => {
        results.push({ name, passed: ok });
        if (!ok)
            throw new Error(`Mechanical fixture failed: ${name}`);
    };
    const read = async (buffer) => {
        const copy = device.createBuffer({ size: buffer.size, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
        const encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(buffer, 0, copy, 0, buffer.size);
        device.queue.submit([encoder.finish()]);
        await copy.mapAsync(GPUMapMode.READ);
        const data = copy.getMappedRange().slice(0);
        copy.unmap();
        copy.destroy();
        return data;
    };
    const fixture = async (strength, coupling, drag = 0, detached = false) => {
        const actin = new ArrayBuffer(buffers.actin.size);
        const a = new Uint32Array(actin), af = new Float32Array(actin);
        for (let i = 0; i < counts.actin; i++) {
            a[i * 10] = a[i * 10 + 6] = a[i * 10 + 7] = i;
            af[i * 10 + 2] = af[i * 10 + 3] = 500;
        }
        for (let i = 0; i < 4; i++) {
            af[i * 10 + 2] = [10, 12, 20, 18][i];
            af[i * 10 + 3] = 10;
            af[i * 10 + 4] = i < 2 ? 1 : -1;
            a[i * 10 + 6] = i < 2 ? 0 : 2;
            a[i * 10 + 7] = i < 2 ? 1 : 3;
        }
        const mem = new ArrayBuffer(buffers.membrane.size);
        const mf = new Float32Array(mem), mu = new Uint32Array(mem);
        for (let i = 0; i < counts.membrane; i++) {
            mu[i * 10] = i;
            mu[i * 10 + 6] = (i + 1) % counts.membrane;
            mu[i * 10 + 7] = (i + counts.membrane - 1) % counts.membrane;
            mf[i * 10 + 2] = 1000;
            mf[i * 10 + 3] = 1000;
        }
        mf[2] = 25;
        mf[3] = 10;
        mf[(counts.membrane / 2) * 10 + 2] = 0;
        mf[(counts.membrane / 2) * 10 + 3] = 10;
        const links = new ArrayBuffer(buffers.links.size);
        const lu = new Uint32Array(links), lf = new Float32Array(links);
        lu.set([1, 3, 0, 1, 1, 0, 3, 2], 0);
        lf[2] = 5;
        lu.set([3, 0, 0, 1, 3, 2, 0, 0], 256 * 8);
        lf[256 * 8 + 2] = 1;
        if (detached) {
            a[6] = a[7] = 0;
            a[26] = a[27] = 2;
        }
        device.queue.writeBuffer(buffers.actin, 0, actin);
        device.queue.writeBuffer(buffers.membrane, 0, mem);
        device.queue.writeBuffer(buffers.links, 0, links);
        configure(strength, coupling, drag);
        dispatch();
        await device.queue.onSubmittedWorkDone();
        return {
            forces: new Int32Array(await read(buffers.forces)).subarray(0, 2 * (counts.actin + counts.membrane)),
            actin: new Float32Array(await read(buffers.actin)),
            membrane: new Float32Array(await read(buffers.membrane)),
        };
    };
    let state = await fixture(0, 0);
    assert("off is mechanically inert", state.forces.every((x) => x === 0) && state.actin[2] === 10 && state.membrane[2] === 25);
    state = await fixture(0.05, 0);
    assert("motor contracts opposed filaments", state.actin[2] > 10 && state.actin[22] < 20);
    assert("motor without tether does not move membrane", state.membrane[2] === 25);
    assert("motor forces are reciprocal", state.forces[0] === -state.forces[4] && state.forces[0] > 0);
    state = await fixture(0, 0.05);
    assert("tether pulls membrane toward filament", state.membrane[2] < 25 && state.actin[22] > 20);
    assert("tether reaction acts on actin", state.forces[4] === -state.forces[counts.actin * 2]);
    state = await fixture(0.05, 0.05);
    let fx = 0, fy = 0;
    for (let i = 0; i < state.forces.length; i += 2) {
        fx += state.forces[i];
        fy += state.forces[i + 1];
    }
    assert("combined internal force sums to zero", fx === 0 && fy === 0);
    const freeDisplacement = state.actin[2] - 10;
    state = await fixture(0.05, 0.05, 4);
    assert("clutch reduces motion without changing generated force", state.actin[2] - 10 < freeDisplacement && state.forces[0] > 0);
    state = await fixture(0.05, 0.05, 0, true);
    assert("depolymerized endpoints release motor and tether", state.forces.every((x) => x === 0));
    return results;
}


/***/ }),

/***/ "./src/occupancy.ts":
/*!**************************!*\
  !*** ./src/occupancy.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   polygonBondCrossing: () => (/* binding */ polygonBondCrossing),
/* harmony export */   polygonOccupancy: () => (/* binding */ polygonOccupancy)
/* harmony export */ });
// Conservative y-band edge index. Predicates remain exact; long edges are
// retained in a global list and long bond queries fall back to all edges.
// No boundary/collision is discarded to improve diagnostic latency.
const BAND = 4;
function edgeIndex(membrane, stride, reverse = false) {
    const n = membrane.length / stride;
    const edges = [], rows = new Map(), wide = [];
    for (let i = 0; i < n; i++) {
        const j = (i + (reverse ? n - 1 : 1)) % n;
        const x = membrane[i * stride + 2], y = membrane[i * stride + 3], bx = membrane[j * stride + 2], by = membrane[j * stride + 3];
        if (![x, y, bx, by].every(Number.isFinite))
            throw new Error("Non-finite membrane geometry");
        const e = { x, y, dx: bx - x, dy: by - y, lx: Math.min(x, bx), hx: Math.max(x, bx), ly: Math.min(y, by), hy: Math.max(y, by) };
        edges.push(e);
        const low = Math.floor(e.ly / BAND), high = Math.floor(e.hy / BAND);
        if (high - low > 256) {
            wide.push(e);
            continue;
        }
        for (let row = low; row <= high; row++) {
            const list = rows.get(row);
            if (list)
                list.push(e);
            else
                rows.set(row, [e]);
        }
    }
    return { edges, rows, wide };
}
// Legacy particle counts use pixel-row sampling; explicit-filament mode uses
// exact y coordinates. The geometry formula/order matches the prior full scan.
function polygonOccupancy(membrane, stride = 10, exact = false) {
    const { rows, wide } = edgeIndex(membrane, stride, true);
    const cache = new Map();
    return (x, y) => {
        if (!Number.isFinite(x) || !Number.isFinite(y))
            return false;
        const row = Math.floor(y), scanY = exact ? y : row + 0.5;
        const candidates = rows.get(Math.floor(scanY / BAND)) ?? [];
        if (exact) {
            let inside = false;
            for (const list of [candidates, wide])
                for (const e of list) {
                    if (e.y > scanY != e.y + e.dy > scanY && e.x + ((scanY - e.y) * e.dx) / e.dy <= x)
                        inside = !inside;
                }
            return inside;
        }
        let crossings = cache.get(row);
        if (!crossings) {
            crossings = [];
            for (const list of [candidates, wide])
                for (const e of list) {
                    if (e.y > scanY != e.y + e.dy > scanY)
                        crossings.push(e.x + ((scanY - e.y) * e.dx) / e.dy);
                }
            crossings.sort((a, b) => a - b);
            cache.set(row, crossings);
        }
        let lo = 0, hi = crossings.length;
        while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (crossings[mid] <= x)
                lo = mid + 1;
            else
                hi = mid;
        }
        return lo % 2 === 1;
    };
}
function polygonBondCrossing(membrane, stride = 10) {
    const { edges, rows, wide } = edgeIndex(membrane, stride);
    return (ax, ay, bx, by) => {
        const dx = bx - ax, dy = by - ay, minX = Math.min(ax, bx), maxX = Math.max(ax, bx), minY = Math.min(ay, by), maxY = Math.max(ay, by);
        const crosses = (list) => {
            for (const e of list) {
                if (maxX < e.lx || minX > e.hx || maxY < e.ly || minY > e.hy)
                    continue;
                const denominator = dx * e.dy - dy * e.dx;
                if (Math.abs(denominator) < 1e-8)
                    continue;
                const t = ((e.x - ax) * e.dy - (e.y - ay) * e.dx) / denominator;
                const u = ((e.x - ax) * dy - (e.y - ay) * dx) / denominator;
                if (t > 1e-5 && t < 1 - 1e-5 && u >= 0 && u <= 1)
                    return true;
            }
            return false;
        };
        const low = Math.floor(minY / BAND), high = Math.floor(maxY / BAND);
        if (high - low > 2)
            return crosses(edges);
        if (crosses(wide))
            return true;
        for (let row = low; row <= high; row++)
            if (crosses(rows.get(row) ?? []))
                return true;
        return false;
    };
}


/***/ }),

/***/ "./src/random.ts":
/*!***********************!*\
  !*** ./src/random.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   seededRandom: () => (/* binding */ seededRandom)
/* harmony export */ });
// Separate seeded streams for initial positions/keys and CPU sprout scheduling.
// GPU in-place kernels inherited from the prototype are not bitwise deterministic.
function seededRandom(seed) {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = Math.imul(state ^ (state >>> 15), state | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


/***/ }),

/***/ "./src/realtime.ts":
/*!*************************!*\
  !*** ./src/realtime.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FrameBudget: () => (/* binding */ FrameBudget),
/* harmony export */   LivePerformance: () => (/* binding */ LivePerformance)
/* harmony export */ });
class FrameBudget {
    stepMs = 4;
    overheadMs = 2;
    choose(maxSteps, targetFPS) {
        const budget = Math.max(1, 1000 / Math.max(1, targetFPS) - 2 - this.overheadMs);
        return Math.max(1, Math.min(Math.floor(maxSteps), Math.floor(budget / Math.max(0.1, this.stepMs))));
    }
    observe(steps, totalMs, encodeMs) {
        // Fixed physical steps; adapt batching only, never dt or solver iterations.
        this.stepMs = 0.8 * this.stepMs + 0.2 * Math.max(0.1, (totalMs - this.overheadMs) / steps);
        this.overheadMs = 0.9 * this.overheadMs + 0.1 * Math.min(3, encodeMs / Math.max(1, steps));
    }
}
function distribution(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted.length
        ? { median: sorted[sorted.length >> 1], p95: sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))], max: sorted.at(-1) }
        : null;
}
class LivePerformance {
    frames = [];
    inputs = [];
    inputVersion = 0;
    processedVersion = 0;
    inputAt = 0;
    coalescedInputs = 0;
    input() {
        this.inputAt = performance.now();
        return ++this.inputVersion;
    }
    inputSnapshot() {
        return { version: this.inputVersion, at: this.inputAt };
    }
    frame(sample, input) {
        this.frames.push(sample);
        if (this.frames.length > 600)
            this.frames.shift();
        if (input.version > this.processedVersion) {
            this.coalescedInputs += Math.max(0, input.version - this.processedVersion - 1);
            this.processedVersion = input.version;
            this.inputs.push(sample.at - input.at);
            if (this.inputs.length > 256)
                this.inputs.shift();
        }
    }
    clearFrames() {
        this.frames.length = 0;
    }
    snapshot() {
        const frames = this.frames, span = frames.length > 1 ? (frames.at(-1).at - frames[0].at) / 1000 : 0;
        const intervals = frames.slice(1).map((f, i) => f.at - frames[i].at);
        return {
            windowFrames: frames.length,
            renderFPS: span ? (frames.length - 1) / span : 0,
            stepsPerSecond: span ? frames.slice(1).reduce((n, f) => n + f.steps, 0) / span : 0,
            frameIntervalMs: distribution(intervals),
            encodeMs: distribution(frames.map((f) => f.encodeMs)),
            queueTailMs: distribution(frames.map((f) => f.queueTailMs)),
            inputToCompletedFrameMs: distribution(this.inputs),
            coalescedInputs: this.coalescedInputs,
        };
    }
}


/***/ }),

/***/ "./src/render.ts":
/*!***********************!*\
  !*** ./src/render.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderModule: () => (/* binding */ RenderModule)
/* harmony export */ });
class RenderModule {
    device;
    canvasFormat;
    // Rendering resources
    intermediateTexture;
    computeRenderPipeline;
    renderPipeline;
    bindGroupPostProcess;
    renderBindGroup;
    specimenPipeline;
    specimenBindGroup;
    specimenLayout;
    preparesSpecimen;
    viewBuffer;
    size;
    view = { mode: 1, zoom: 3, focus: 0.15, contrast: 1.2, chroma: 0.45, grain: 0.6, follow: true, autoFit: true };
    camera;
    cameraTarget;
    extent = { width: 200, height: 200 };
    setCellBounds(left, right, top, bottom) {
        if (![left, right, top, bottom].every(Number.isFinite) || right <= left || bottom <= top)
            return;
        this.cameraTarget = { x: (left + right) / 2, y: (top + bottom) / 2 };
        this.extent = { width: right - left, height: bottom - top };
    }
    fittedZoom() {
        return Math.max(0.2, Math.min(3.8, (window.innerWidth * 0.76) / this.extent.width, (Math.max(100, window.innerHeight - 160) * 0.78) / this.extent.height));
    }
    fitImmediately() {
        if (this.view.autoFit)
            this.view.zoom = this.fittedZoom();
        if (this.view.follow)
            Object.assign(this.camera, this.cameraTarget);
    }
    screenScale() {
        return { x: (this.view.zoom * this.size.width) / window.innerWidth, y: (this.view.zoom * this.size.height) / window.innerHeight };
    }
    screenToWorld(x, y) {
        if (!this.view.mode)
            return { x, y };
        const scale = this.screenScale();
        return { x: this.camera.x + (x - this.size.width / 2) / scale.x, y: this.camera.y + (y - this.size.height / 2) / scale.y };
    }
    worldToScreen(x, y) {
        if (!this.view.mode)
            return { x, y };
        const scale = this.screenScale();
        return { x: (x - this.camera.x) * scale.x + this.size.width / 2, y: (y - this.camera.y) * scale.y + this.size.height / 2 };
    }
    TEXTURE_WORKGROUP_COUNT;
    constructor(device, canvasFormat, canvasSize, renderShader, textures, sharedLayoutEntries, sharedBindGroupEntries, geometry, externalSpecimen) {
        this.device = device;
        this.canvasFormat = canvasFormat;
        this.size = canvasSize;
        this.camera = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
        this.cameraTarget = { ...this.camera };
        this.TEXTURE_WORKGROUP_COUNT = [Math.ceil(textures.size.width / 16), Math.ceil(textures.size.height / 16)];
        const BINDING_INTERMEDIATE_TEXTURE = 10;
        this.viewBuffer = device.createBuffer({ size: 48, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        this.preparesSpecimen = !externalSpecimen;
        const specimen = externalSpecimen ??
            device.createTexture({
                size: [textures.size.width, textures.size.height],
                format: "rgba16float",
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING,
            });
        const specimenView = specimen.createView();
        const specimenLayout = device.createBindGroupLayout({
            entries: [
                ...sharedLayoutEntries,
                { binding: 13, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
                { binding: 16, visibility: GPUShaderStage.COMPUTE, storageTexture: { access: "write-only", format: "rgba16float" } },
            ],
        });
        this.specimenLayout = specimenLayout;
        this.specimenBindGroup = device.createBindGroup({
            layout: specimenLayout,
            entries: [...sharedBindGroupEntries, { binding: 13, resource: geometry }, { binding: 16, resource: specimenView }],
        });
        this.specimenPipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [specimenLayout] }),
            compute: { module: renderShader, entryPoint: "build_specimen" },
        });
        this.intermediateTexture = this.device.createTexture({
            size: [canvasSize.width, canvasSize.height],
            format: "rgba8unorm",
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
        });
        const bindGroupLayoutPostProcess = this.device.createBindGroupLayout({
            label: "bindGroupLayoutPostProcess",
            entries: [
                ...sharedLayoutEntries,
                { binding: 11, visibility: GPUShaderStage.COMPUTE, texture: { sampleType: "float" } },
                { binding: 12, visibility: GPUShaderStage.COMPUTE, sampler: { type: "filtering" } },
                { binding: 17, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } },
                {
                    binding: BINDING_INTERMEDIATE_TEXTURE,
                    visibility: GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT,
                    storageTexture: {
                        access: "write-only",
                        format: "rgba8unorm",
                    },
                },
            ],
        });
        this.bindGroupPostProcess = this.device.createBindGroup({
            label: `Bind Group Post Process`,
            layout: bindGroupLayoutPostProcess,
            entries: [
                ...sharedBindGroupEntries,
                { binding: 11, resource: specimenView },
                { binding: 12, resource: device.createSampler({ magFilter: "linear", minFilter: "linear" }) },
                { binding: 17, resource: { buffer: this.viewBuffer } },
                {
                    binding: BINDING_INTERMEDIATE_TEXTURE,
                    resource: this.intermediateTexture.createView(),
                },
            ],
        });
        const pipelineLayoutPostProcess = this.device.createPipelineLayout({
            label: "pipelineLayoutPostProcess",
            bindGroupLayouts: [bindGroupLayoutPostProcess],
        });
        this.computeRenderPipeline = this.device.createComputePipeline({
            layout: pipelineLayoutPostProcess,
            compute: { module: renderShader, entryPoint: "render" },
        });
        const screenSampler = this.device.createSampler({
            magFilter: "nearest",
            minFilter: "nearest",
        });
        const renderBindGroupLayout = this.device.createBindGroupLayout({
            label: "Render Bind Group Layout",
            entries: [
                { binding: 0, visibility: GPUShaderStage.FRAGMENT, sampler: { type: "non-filtering" } },
                { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: {} },
            ],
        });
        this.renderBindGroup = this.device.createBindGroup({
            label: "Render Bind Group",
            layout: renderBindGroupLayout,
            entries: [
                { binding: 0, resource: screenSampler },
                { binding: 1, resource: this.intermediateTexture.createView() },
            ],
        });
        this.renderPipeline = this.device.createRenderPipeline({
            label: "Render Pipeline",
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.device.createBindGroupLayout({ entries: [] }), renderBindGroupLayout],
            }),
            vertex: {
                module: renderShader,
                entryPoint: "vert",
            },
            fragment: {
                module: renderShader,
                entryPoint: "frag",
                targets: [{ format: this.canvasFormat }],
            },
            primitive: {
                topology: "triangle-list",
            },
        });
    }
    createSpecimenBindings(entries, geometry, output) {
        return this.device.createBindGroup({
            layout: this.specimenLayout,
            entries: [...entries, { binding: 13, resource: geometry }, { binding: 16, resource: output }],
        });
    }
    encodeSpecimen(encoder, group) {
        const pass = encoder.beginComputePass();
        pass.setPipeline(this.specimenPipeline);
        pass.setBindGroup(0, group);
        pass.dispatchWorkgroups(...this.TEXTURE_WORKGROUP_COUNT);
        pass.end();
    }
    render(canvasContext, querySet, resolveBuffer, resultBuffer) {
        if (this.view.mode && this.view.autoFit)
            this.view.zoom += 0.18 * (this.fittedZoom() - this.view.zoom);
        if (this.view.mode && this.view.follow) {
            this.camera.x += 0.18 * (this.cameraTarget.x - this.camera.x);
            this.camera.y += 0.18 * (this.cameraTarget.y - this.camera.y);
        }
        const viewData = new ArrayBuffer(48), f = new Float32Array(viewData), u = new Uint32Array(viewData);
        f.set([this.camera.x, this.camera.y, this.view.zoom]);
        u[3] = this.view.mode;
        f.set([this.view.focus, this.view.contrast, this.view.chroma, this.view.grain], 4);
        const scale = this.screenScale();
        f.set([scale.x, scale.y], 8);
        this.device.queue.writeBuffer(this.viewBuffer, 0, viewData);
        const commandEncoder = this.device.createCommandEncoder();
        if (this.view.mode && this.preparesSpecimen) {
            const specimenPass = commandEncoder.beginComputePass();
            specimenPass.setPipeline(this.specimenPipeline);
            specimenPass.setBindGroup(0, this.specimenBindGroup);
            specimenPass.dispatchWorkgroups(...this.TEXTURE_WORKGROUP_COUNT);
            specimenPass.end();
        }
        // 1. Main compute render pass
        const passCompute = commandEncoder.beginComputePass();
        passCompute.setPipeline(this.computeRenderPipeline);
        passCompute.setBindGroup(0, this.bindGroupPostProcess);
        passCompute.dispatchWorkgroups(...this.TEXTURE_WORKGROUP_COUNT);
        passCompute.end();
        // 2. Main render pass
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [
                {
                    view: canvasContext.getCurrentTexture().createView(),
                    loadOp: "clear",
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: "store",
                },
            ],
        });
        renderPass.setPipeline(this.renderPipeline);
        renderPass.setBindGroup(1, this.renderBindGroup);
        renderPass.draw(6, 1, 0, 0);
        renderPass.end();
        this.device.queue.submit([commandEncoder.finish()]);
    }
}


/***/ }),

/***/ "./src/renewal-test.ts":
/*!*****************************!*\
  !*** ./src/renewal-test.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   testRenewal: () => (/* binding */ testRenewal)
/* harmony export */ });
// Actual GPU checks for selective renewal, genuine tether dwell, and a polarity
// direction that survives translation. Fresh fixture pages only.
async function testRenewal(device, buffers, counts, configure, dispatch) {
    const checks = [];
    const assert = (name, passed) => {
        checks.push({ name, passed });
        if (!passed)
            throw Error(`Renewal fixture failed: ${name}`);
    };
    const read = async (buffer, offset = 0, size = buffer.size) => {
        const stage = device.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        const e = device.createCommandEncoder();
        e.copyBufferToBuffer(buffer, offset, stage, 0, size);
        device.queue.submit([e.finish()]);
        await stage.mapAsync(GPUMapMode.READ);
        const data = stage.getMappedRange().slice(0);
        stage.unmap();
        stage.destroy();
        return data;
    };
    function membrane(shift = 0, atContact = false) {
        const data = new ArrayBuffer(buffers.membrane.size), u = new Uint32Array(data), f = new Float32Array(data);
        for (let i = 0; i < counts.membrane; i++) {
            const angle = (2 * Math.PI * i) / counts.membrane;
            u[i * 10] = i;
            u[i * 10 + 6] = (i + 1) % counts.membrane;
            u[i * 10 + 7] = (i + counts.membrane - 1) % counts.membrane;
            f[i * 10 + 2] = 50 + shift + 45 * Math.cos(angle);
            f[i * 10 + 3] = 50 + 45 * Math.sin(angle);
            f[i * 10 + 8] = i;
        }
        if (atContact) {
            f[2] = 12;
            f[3] = 50;
        }
        device.queue.writeBuffer(buffers.membrane, 0, data);
    }
    function filaments(age, positions = [10, 14, 85, 89]) {
        const data = new ArrayBuffer(buffers.actin.size), u = new Uint32Array(data), f = new Float32Array(data);
        for (let i = 0; i < counts.actin; i++)
            u[i * 10] = u[i * 10 + 6] = u[i * 10 + 7] = i;
        positions.forEach((x, i) => {
            u[i * 10 + 6] = i < 2 ? 0 : 2;
            u[i * 10 + 7] = i < 2 ? 1 : 3;
            f[i * 10 + 2] = x;
            f[i * 10 + 3] = 50;
            f[i * 10 + 4] = 1;
            f[i * 10 + 9] = age;
        });
        device.queue.writeBuffer(buffers.actin, 0, data);
        return data;
    }
    membrane();
    filaments(1000);
    configure({ polarityMode: 0, cueEnabled: 0 });
    dispatch("polarity");
    configure({
        polarityMode: 1,
        cueEnabled: 1,
        cueX: 100,
        cueY: 50,
        polarityTurnRate: 0.02,
        rearTurnover: 1,
        turnoverAge: 10,
        disconnectionProbability: 0,
        debranchProbability: 0,
    });
    dispatch("polarity");
    dispatch("turnover");
    let u = new Uint32Array(await read(buffers.actin));
    assert("aged rear filament returns to G-actin", u[6] === 0 && u[7] === 0 && u[16] === 1 && u[17] === 1);
    assert("same-aged front filament is protected", u[27] === 3 && u[36] === 2);
    const branch = filaments(0), bu = new Uint32Array(branch), bf = new Float32Array(branch);
    bu[26] = 0;
    bu[27] = 2;
    bf[22] = 12;
    bf[23] = 52;
    bf[29] = 1000;
    bu[36] = 3;
    bu[37] = 3;
    device.queue.writeBuffer(buffers.actin, 0, branch);
    dispatch("turnover");
    u = new Uint32Array(await read(buffers.actin));
    assert("old one-bead branch returns to the soluble pool", u[26] === 2 && u[27] === 2);
    assert("branch removal does not cut the mother filament", u[7] === 1 && u[16] === 0);
    filaments(0);
    dispatch("turnover");
    u = new Uint32Array(await read(buffers.actin));
    assert("young rear network is not prematurely cleared", u[7] === 1 && u[16] === 0);
    const before = new Float32Array(await read(buffers.snapshot, 32 * (counts.actin + counts.membrane + 1), 32));
    membrane(100);
    dispatch("polarity");
    const after = new Float32Array(await read(buffers.snapshot, 32 * (counts.actin + counts.membrane + 1), 32));
    assert("polarity vector persists under cell translation", Math.abs(before[2] - after[2]) < 1e-6 && Math.abs(before[3] - after[3]) < 1e-6 && after[2] > 0.99);
    membrane();
    dispatch("polarity");
    configure({ motorRearBias: 1, myosinStrength: 0.05, myosinSpeed: 0.02 });
    for (const [positions, name, active] of [
        [[10, 14, 20, 16], "mature rear motor produces contraction", true],
        [[80, 84, 90, 86], "mature front motor stays inactive", false],
    ]) {
        filaments(1000, [...positions]);
        const link = new Uint32Array(8 * (256 + counts.membrane));
        link.set([1, 3, 0, 1, 1, 0, 3, 2]);
        new Float32Array(link.buffer)[2] = 5;
        device.queue.writeBuffer(buffers.links, 0, link);
        dispatch("motor");
        const moved = new Float32Array(await read(buffers.actin));
        assert(name, active ? moved[2] > positions[0] && moved[22] < positions[2] : moved[2] === positions[0] && moved[22] === positions[2]);
    }
    membrane(0, true);
    filaments(1000);
    const link = new Uint32Array(8 * (256 + counts.membrane));
    link.set([1, 0, 0, 600, 1, 0, 0, 0], 256 * 8);
    new Float32Array(link.buffer)[256 * 8 + 2] = 2;
    device.queue.writeBuffer(buffers.links, 0, link);
    configure({ membraneCoupling: 0.05, tetherTurnover: 1, tetherOnRate: 1, tetherOffRate: 0, tetherLoadOff: 0, tetherRecoverySteps: 40 });
    dispatch("tether");
    let links = new Uint32Array(await read(buffers.links));
    assert("expired tether enters an unbound dwell", links[256 * 8] === 0 && links[256 * 8 + 3] === 40);
    dispatch("tether");
    links = new Uint32Array(await read(buffers.links));
    assert("tether does not rebind on the next step", links[256 * 8] === 0 && links[256 * 8 + 3] === 39);
    dispatch("tether", 40);
    links = new Uint32Array(await read(buffers.links));
    assert("tether can rebind after its dwell", links[256 * 8] > 0);
    return checks;
}


/***/ }),

/***/ "./src/shaders/includes/actomyosin.wgsl":
/*!**********************************************!*\
  !*** ./src/shaders/includes/actomyosin.wgsl ***!
  \**********************************************/
/***/ ((module) => {

module.exports = "// Coarse-grained, transient contractile crosslinks between EXPLICIT actin beads.\n// Shortening a link represents motor work; it is not an ATP cycle or a prediction\n// of molecular stepping. Each force has an equal and opposite partner. Snapshots\n// and fixed-point scatter accumulation prevent read/write races in these passes.\nconst MOTOR_SLOTS = 256u;\nconst FORCE_SCALE = 65536.0;\nstruct MechanicalSnapshot {\n  position: vec2<f32>,\n  orientation: vec2<f32>,\n  head: u32,\n  tail: u32,\n  attached: u32,\n  unused: u32,\n}\nstruct MechanicalLink {\n  a: u32, // actin index + 1, zero means unbound\n  b: u32,\n  rest: f32,\n  age: u32,\n  headA: u32,\n  tailA: u32,\n  headB: u32,\n  tailB: u32,\n}\nstruct MechanicalForce { x: atomic<i32>, y: atomic<i32> }\n@group(GROUP_INDEX) @binding(MECHANICAL_SNAPSHOT)\nvar<storage, read_write> mechanical_snapshot: array<MechanicalSnapshot>;\n@group(GROUP_INDEX) @binding(MECHANICAL_LINKS)\nvar<storage, read_write> mechanical_links: array<MechanicalLink>;\n@group(GROUP_INDEX) @binding(MECHANICAL_FORCES)\nvar<storage, read_write> mechanical_forces: array<MechanicalForce>;\n\nfn add_mechanical_force(i: u32, f: vec2<f32>) {\n  atomicAdd(&mechanical_forces[i].x, i32(round(f.x * FORCE_SCALE)));\n  atomicAdd(&mechanical_forces[i].y, i32(round(f.y * FORCE_SCALE)));\n}\n\n// Legacy mode uses a selected material vertex; renewal mode uses a persistent\n// cell-centred direction. Both prescribe polarity, not spontaneous biochemical\n// polarization or a translational steering force.\nfn cue_slot() -> u32 { return controls.actinCount + controls.membraneCount + 1u; }\nfn front_index() -> u32 { return mechanical_snapshot[cue_slot()].head; }\nfn front_arc() -> f32 { return f32(front_index()) / f32(controls.membraneCount); }\nfn polarity_axis() -> vec2<f32> {\n  let p = mechanical_snapshot[cue_slot()].orientation;\n  return select(vec2<f32>(1.0, 0.0), p, dot(p,p) > 0.5);\n}\nfn cell_center() -> vec2<f32> { return mechanical_snapshot[enclosure_slot()].position; }\nfn front_coordinate(p: vec2<f32>, material_arc: f32) -> f32 {\n  if (controls.polarityMode == 0u) { return fract(material_arc - front_arc()); }\n  let radial = normalize_safely(p - cell_center());\n  let axis = polarity_axis();\n  return fract(atan2(cross2(axis, radial), dot(axis, radial)) / (2.0 * PI) + 1.0);\n}\n\n@compute @workgroup_size(1)\nfn resolve_front_cue() {\n  var nearest = 0u;\n  if (controls.polarityMode != 0u) {\n    var state = mechanical_snapshot[cue_slot()];\n    let initialized = dot(state.orientation,state.orientation) > 0.5;\n    var axis = select(vec2<f32>(1.0,0.0),state.orientation,initialized);\n    var goalDirection = vec2<f32>(bitcast<f32>(state.attached),bitcast<f32>(state.unused));\n    if (!initialized || state.tail != controls.cueVersion) {\n      goalDirection = vec2<f32>(1.0,0.0);\n      if (controls.cueEnabled != 0u) {\n        goalDirection=axis;\n        if(distance(controls.cueTarget,cell_center()) > 1e-4) {goalDirection = normalize_safely(controls.cueTarget-cell_center());}\n      }\n    }\n    let angle = atan2(cross2(axis,goalDirection),dot(axis,goalDirection));\n    axis = rotate(axis,clamp(angle,-controls.polarityTurnRate,controls.polarityTurnRate));\n    var furthest = -1e30;\n    for (var i=0u;i<controls.membraneCount;i++) {\n      let projection=dot(membrane[i].position-cell_center(),axis);\n      if(projection>furthest){furthest=projection;nearest=i;}\n    }\n    state.orientation=axis;state.attached=bitcast<u32>(goalDirection.x);state.unused=bitcast<u32>(goalDirection.y);\n    state.head=nearest;state.tail=controls.cueVersion;state.position=membrane[nearest].position;\n    mechanical_snapshot[cue_slot()]=state;\n    return;\n  }\n  if (controls.cueEnabled != 0u) {\n    var distance_squared = 1e30;\n    for (var i = 0u; i < controls.membraneCount; i++) {\n      let delta = membrane[i].position - controls.cueTarget;\n      let d = dot(delta, delta);\n      if (d < distance_squared) { distance_squared = d; nearest = i; }\n    }\n  }\n  // Selection only: no position, force, or velocity is written to the cell.\n  mechanical_snapshot[cue_slot()].head = nearest;\n  mechanical_snapshot[cue_slot()].tail = controls.cueVersion;\n  mechanical_snapshot[cue_slot()].position = membrane[nearest].position;\n  mechanical_snapshot[cue_slot()].orientation = vec2<f32>(0.0);\n}\n\n@compute @workgroup_size(1)\nfn draw_resolved_cue() {\n  if (controls.cueEnabled == 0u && controls.polarityMode == 0u) { return; }\n  let p = membrane[front_index()].position;\n  mechanical_snapshot[cue_slot()].position = p;\n  for (var y = -3; y <= 3; y++) {\n    for (var x = -3; x <= 3; x++) {\n      if (x*x+y*y<=9) { store_texture(parameter_fields, DEBUG, as_vec2i(p)+vec2<i32>(x,y), 8.0); }\n    }\n  }\n  if (controls.polarityMode != 0u) {\n    for (var t=0.0;t<=10.0;t+=1.0) {store_texture(parameter_fields,DEBUG,as_vec2i(p+polarity_axis()*t),8.0);}\n  }\n}\n\nfn front_fraction(p: vec2<f32>) -> f32 {\n  if (controls.polarityMode != 0u) {\n    let radius=sqrt(max(1.0,mechanical_snapshot[enclosure_slot()].orientation.x)/PI);\n    return clamp(0.5+0.5*dot(p-cell_center(),polarity_axis())/radius,0.0,1.0);\n  }\n  let n = controls.actinCount;\n  let i = front_index();\n  let rear = mechanical_snapshot[n + (i + controls.membraneCount / 2u) % controls.membraneCount].position;\n  let front = mechanical_snapshot[n + i].position;\n  let axis = front - rear;\n  return clamp(dot(p - rear, axis) / max(dot(axis, axis), 1.0), 0.0, 1.0);\n}\nfn rear_maturity(p: vec2<f32>, age: f32) -> f32 {\n  let rear=1.0-smoothstep(0.3,0.7,front_fraction(p));\n  let scale=max(1.0,controls.turnoverAge);\n  return rear*smoothstep(scale,2.0*scale,age);\n}\nfn growing_head(s: Segment) -> bool {\n  return is_head(s) && s.subtype != FILOPODIAL_ACTIN && (controls.rearTurnover <= 0.0 || rear_maturity(s.position,s.age) < 0.5);\n}\n\nfn same_actin(i: u32, h: u32, t: u32) -> bool {\n  let s = mechanical_snapshot[i];\n  return s.attached == 1u && s.head == h && s.tail == t;\n}\n\n@compute @workgroup_size(WGSZ)\nfn snapshot_mechanics(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  let n = controls.actinCount;\n  if (i >= n + controls.membraneCount) { return; }\n  var s: Segment;\n  if (i < n) { s = actines[i]; } else { s = membrane[i - n]; }\n  mechanical_snapshot[i] = MechanicalSnapshot(s.position, s.orientation, s.head, s.tail,\n    select(0u, 1u, s.head != s.id || s.tail != s.id), bitcast<u32>(s.age));\n  atomicStore(&mechanical_forces[i].x, 0);\n  atomicStore(&mechanical_forces[i].y, 0);\n}\n\n@compute @workgroup_size(WGSZ)\nfn motor_links(@builtin(global_invocation_id) id: vec3u) {\n  let slot = id.x;\n  if (slot >= MOTOR_SLOTS) { return; }\n  let rng = controls.actinCount + controls.membraneCount + slot;\n  if (controls.myosinStrength <= 0.0) { mechanical_links[slot].a = 0u; return; }\n  var link = mechanical_links[slot];\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let b = link.b - 1u;\n    if (!same_actin(a, link.headA, link.tailA) || !same_actin(b, link.headB, link.tailB) ||\n        link.age >= 300u || distance(mechanical_snapshot[a].position, mechanical_snapshot[b].position) > 24.0) {\n      link.a = 0u;\n    }\n  }\n  if (link.a == 0u) {\n    // Bounded search. No teleportation or global pull: a motor must find two\n    // nearby polymerized beads, on different local filament segments.\n    for (var trial = 0u; trial < 24u; trial++) {\n      let a = min(u32(random_uniform(rng) * f32(controls.actinCount)), controls.actinCount - 1u);\n      let sa = mechanical_snapshot[a];\n      if (sa.attached == 0u || random_uniform(rng) < front_fraction(sa.position)) { continue; }\n      if (controls.motorRearBias > 0.0 && random_uniform(rng) > mix(1.0,rear_maturity(sa.position,bitcast<f32>(sa.unused)),controls.motorRearBias)) { continue; }\n      let theta = random_uniform(rng) * 2.0 * PI;\n      let radius = 3.0 + random_uniform(rng) * 9.0;\n      let q = as_vec2i(sa.position + radius * vec2<f32>(cos(theta), sin(theta)));\n      let signal = load_texture_index(POLYMER_INDEX, q);\n      if (signal == 0u || signal > controls.actinCount) { continue; }\n      let b = signal - 1u;\n      let sb = mechanical_snapshot[b];\n      let d = distance(sa.position, sb.position);\n      if (a == b || b == sa.head || b == sa.tail || a == sb.head || a == sb.tail ||\n          sb.attached == 0u || any(as_vec2i(sb.position) != q) || d < 3.0 || d > 12.0 ||\n          dot(sa.orientation, sb.orientation) > 0.5) { continue; }\n      link = MechanicalLink(a + 1u, b + 1u, d, 0u, sa.head, sa.tail, sb.head, sb.tail);\n      break;\n    }\n  }\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let b = link.b - 1u;\n    let offset = mechanical_snapshot[b].position - mechanical_snapshot[a].position;\n    let d = length(offset);\n    let activation=mix(1.0,0.5*(rear_maturity(mechanical_snapshot[a].position,bitcast<f32>(mechanical_snapshot[a].unused))+\n      rear_maturity(mechanical_snapshot[b].position,bitcast<f32>(mechanical_snapshot[b].unused))),controls.motorRearBias);\n    link.rest = max(2.0, link.rest - controls.myosinSpeed * activation);\n    let f = normalize_safely(offset) * min(0.1, controls.myosinStrength * activation * max(0.0, d - link.rest));\n    add_mechanical_force(a, f);\n    add_mechanical_force(b, -f);\n    link.age++;\n  }\n  mechanical_links[slot] = link;\n}\n\n@compute @workgroup_size(WGSZ)\nfn membrane_tethers(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.membraneCount) { return; }\n  let slot = MOTOR_SLOTS + i;\n  if (controls.membraneCoupling <= 0.0) { mechanical_links[slot].a = 0u; mechanical_links[slot].age = 0u; return; }\n  let m = controls.actinCount + i;\n  let p = mechanical_snapshot[m].position;\n  var link = mechanical_links[slot];\n  let rng = controls.actinCount + i;\n  if (link.a > 0u) {\n    let extension=distance(mechanical_snapshot[link.a - 1u].position,p);\n    var detach = !same_actin(link.a - 1u, link.headA, link.tailA) || link.age >= 600u || extension > 24.0;\n    if (controls.tetherTurnover != 0u) {\n      let hazard=controls.tetherOffRate+controls.tetherLoadOff*max(0.0,extension-link.rest);\n      detach = detach || random_uniform(rng) < 1.0-exp(-hazard);\n    }\n    if (detach) {\n      link.a=0u;\n      if (controls.tetherTurnover != 0u) {\n        link.age=controls.tetherRecoverySteps;\n        mechanical_links[slot]=link;\n        atomicAdd(&telemetry[TELEMETRY_TETHER_RELEASED],1u);\n        return;\n      }\n    }\n  }\n  if (link.a == 0u) {\n    if (controls.tetherTurnover != 0u) {\n      if (link.age>0u) {link.age--;mechanical_links[slot]=link;return;}\n      if (random_uniform(rng) >= controls.tetherOnRate) { return; }\n    }\n    var best = 13.0;\n    // Deterministic local search over the current polymer index. A tether binds\n    // slack at the observed distance and becomes tensile only after separation.\n    for (var dy = -12; dy <= 12; dy += 2) {\n      for (var dx = -12; dx <= 12; dx += 2) {\n        let q = as_vec2i(p) + vec2<i32>(dx, dy);\n        let signal = load_texture_index(POLYMER_INDEX, q);\n        if (signal == 0u || signal > controls.actinCount) { continue; }\n        let a = signal - 1u;\n        let s = mechanical_snapshot[a];\n        let d = distance(p, s.position);\n        if (s.attached == 1u && all(as_vec2i(s.position) == q) && d < best) {\n          best = d;\n          link = MechanicalLink(a + 1u, 0u, d, 0u, s.head, s.tail, 0u, 0u);\n        }\n      }\n    }\n  }\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let offset = mechanical_snapshot[a].position - p;\n    let f = normalize_safely(offset) * min(0.1, controls.membraneCoupling * max(0.0, length(offset) - link.rest));\n    add_mechanical_force(m, f);\n    add_mechanical_force(a, -f);\n    link.age++;\n  }\n  mechanical_links[slot] = link;\n}\n\n@compute @workgroup_size(WGSZ)\nfn apply_mechanical_forces(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.actinCount + controls.membraneCount) { return; }\n  let force = vec2<f32>(f32(atomicLoad(&mechanical_forces[i].x)), f32(atomicLoad(&mechanical_forces[i].y))) / FORCE_SCALE;\n  if (i < controls.actinCount) {\n    // Effective clutch resistance to the added forces, strongest at the front.\n    // The original positional solver is otherwise unchanged; no force-free\n    // hydrodynamics or full focal-adhesion dynamics are implied.\n    let mobility = 1.0 / (1.0 + controls.substrateDrag * front_fraction(mechanical_snapshot[i].position));\n    actines[i].position += mobility * force;\n  } else { membrane[i - controls.actinCount].position += force; }\n}\n\n@compute @workgroup_size(WGSZ)\nfn draw_mechanical_links(@builtin(global_invocation_id) id: vec3u) {\n  let slot = id.x;\n  if (slot >= MOTOR_SLOTS + controls.membraneCount) { return; }\n  let link = mechanical_links[slot];\n  if (link.a == 0u) { return; }\n  let a = actines[link.a - 1u].position;\n  var b: vec2<f32>;\n  var color = 6.0;\n  if (slot < MOTOR_SLOTS) { b = actines[link.b - 1u].position; }\n  else { b = membrane[slot - MOTOR_SLOTS].position; color = 7.0; }\n  let d = distance(a, b);\n  for (var t = 0.0; t <= min(d, 24.0); t += 0.8) {\n    store_texture(parameter_fields, DEBUG, as_vec2i(mix(a, b, t / max(d, 0.01))), color);\n  }\n}\n";

/***/ }),

/***/ "./src/shaders/includes/bindings.wgsl":
/*!********************************************!*\
  !*** ./src/shaders/includes/bindings.wgsl ***!
  \********************************************/
/***/ ((module) => {

module.exports = "const GROUP_INDEX = 0;\n\nconst CANVAS = 0;\nconst CONTROLS = 1;\nconst INTERACTIONS = 2;\n\nconst INDEX = 3;\nconst SEGMENT_INDEX = 0;\nconst ACTIN_INDEX = 1;\nconst HEAD_INDEX = 2; // filament plus ends, written at the spot where they take up a monomer\nconst POLYMER_INDEX = 3; // filament actins, for their repulsion; branches nucleate on the interior ones\n\n\nconst STERIC_POTENTIAL = 4;\nconst STERIC_POTENTIAL_DIM = 3;\nconst STIGMERGYMONOMER = 0;\nconst STIGMERGYPOLYMER = 1;\nconst STIGMERGYMEMBRANE = 2;\n\nconst PARAMETER_FIELDS = 5;\nconst DEBUG = 0;\nconst CONNECTION_PROBABILITY = 1;\nconst RECENCY = 2;\n// second polymerization field, emitted by the front of the membrane: filaments there grow and also branch\nconst LAMELLIPODIUM = 3;\nconst G_ACTIN_COMPARTMENT = 4; // visualization mask only, not a transported concentration field\nconst ACTIN_AGE = 5; // visualization only; actual bead age, not a diffusing field\n\nconst RANDOM = 6;\nconst MEMBRANE = 7;\nconst ACTIN = 8;\nconst CONNECTION_LOCKS = 9;\nconst TELEMETRY = 12;\nconst MECHANICAL_SNAPSHOT = 13;\nconst MECHANICAL_LINKS = 14;\nconst MECHANICAL_FORCES = 15;\n\nconst BINDING_INTERMEDIATE_TEXTURE = 10;\n\n\nconst MAX_SPROUT_SITES = 8;\n\n// TODO: maybe put elsewhere, but best place for now\n// Define the Controls struct matching TypeScript layout\nstruct Controls {    \n    membraneCount: u32,        // offset 0, size 4, align 4\n    actinCount: u32,           // offset 4, size 4, align 4\n    stiffness: f32,     // offset 8, size 4, align 4\n    foodNearbyThreshold: f32,     // offset 12, size 4, align 4\n    disconnection_probability: f32,          // offset 16, size 4, align 4\n    polymerRepulsion: f32,        // offset 20, size 4, align 4\n    steric_sampling_range: i32,// offset 24, size 4, align 4\n    actinCohesionRange: i32,   // offset 28, size 4, align 4\n    bindProb: f32,            // offset 32, size 4, align 4\n    bindLengthSaturation: u32,     // offset 36, size 4, align 4\n    actinStericForce: f32,                // offset 40, size 4, align 4\n    equilibrium_line_distance: f32,     // offset 44, size 4, align 4\n    bindLengthFloor: u32,     // offset 48, size 4, align 4\n    movementMode: u32,        // offset 52, size 4, align 4\n    monomerMembraneRepulsion: f32,    // offset 56, size 4, align 4\n    membraneStiffness: f32,           // offset 60, size 4, align 4\n    monomerOpacity: f32,              // offset 64\n    gActinField: u32,                 // offset 68: finite, well-mixed monomer reservoir\n    polymerizationPatchSize: f32,     // offset 72, size 4, align 4\n    membraneRestLength: f32,          // offset 76, size 4, align 4\n    sproutSites: array<vec4<f32>, MAX_SPROUT_SITES>, // offset 80, size 128, align 16\n    membraneSmoothing: f32,           // offset 208, size 4, align 4\n    areaConservation: f32,             // offset 212: imposed 2-D volume surrogate\n    polymerizationFieldDecay: f32,    // offset 216, size 4, align 4\n    membraneFlow: f32,                // offset 220, size 4, align 4\n    lamellipodiumStrength: f32,       // offset 224, size 4, align 4\n    lamellipodiumWidth: f32,          // offset 228, size 4, align 4\n    lamellipodiumFieldDecay: f32,     // offset 232, size 4, align 4\n    branchProbability: f32,           // offset 236, size 4, align 4\n    debranchProbability: f32,         // offset 240, size 4, align 4\n    actinBendStiffness: f32,          // offset 244, size 4, align 4\n    stericSelfNeighbors: u32,         // offset 248, size 4, align 4\n    myosinStrength: f32,              // offset 252\n    myosinSpeed: f32,                 // offset 256\n    membraneCoupling: f32,            // offset 260\n    substrateDrag: f32,               // offset 264\n    cortexPolymerization: f32,         // offset 268; optional basal cortical assembly\n    cueTarget: vec2<f32>,              // offset 272: world-space pointer cue\n    cueEnabled: u32,                   // offset 280\n    cueVersion: u32,                   // offset 284, applied input version for diagnostics\n    polarityMode: u32,                 // 288: persistent cell-centred vector\n    polarityTurnRate: f32,             // 292: radians per fixed step\n    rearTurnover: f32,                 // 296: extra aged-rear end loss probability\n    turnoverAge: f32,                  // 300: maturation scale in fixed steps\n    tetherTurnover: u32,               // 304: finite binding and unbound dwell\n    tetherOnRate: f32,                 // 308\n    tetherOffRate: f32,                // 312\n    tetherRecoverySteps: u32,          // 316\n    motorRearBias: f32,                // 320: age/rear activation weight\n    frontAlignment: f32,              // 324: initial filament orientation bias\n    tetherLoadOff: f32,                // 328: extension-dependent detachment\n    colourAge: u32,                    // 332: yellow young -> red old\n                               // Total size = 336 bytes, rounded to 16.\n}\n";

/***/ }),

/***/ "./src/shaders/includes/buffers.wgsl":
/*!*******************************************!*\
  !*** ./src/shaders/includes/buffers.wgsl ***!
  \*******************************************/
/***/ ((module) => {

module.exports = "struct Segment {\n  id: u32,\n  subtype: u32,\n  position: vec2f,\n  orientation: vec2f,\n  tail: u32,\n  head: u32,\n  arc_length: f32,\n  age: f32, // bound-actin age in fixed steps; occupies the former padding word\n}\nconst FILOPODIAL_ACTIN = 24u;\n\nfn is_disconnected(segment: Segment) -> bool {\n  return segment.tail == segment.id && segment.head == segment.id;\n}\n\nfn is_head(segment: Segment) -> bool {\n  return segment.tail != segment.id && segment.head == segment.id;\n}\n\nfn has_head(segment: Segment) -> bool {\n  return segment.head != segment.id;\n}\n\nfn is_tail(segment: Segment) -> bool {\n  return segment.tail == segment.id && segment.head != segment.id;\n}\n\nfn has_tail(segment: Segment) -> bool {\n  return segment.tail != segment.id;\n}\n\nfn is_end(segment: Segment) -> bool {\n  return segment.tail == segment.id || segment.head == segment.id;\n}\n\nfn has_connection(segment: Segment) -> bool {\n  return segment.tail != segment.id || segment.head != segment.id;\n}\n\nfn has_both_connections(segment: Segment) -> bool {\n  return segment.tail != segment.id && segment.head != segment.id;\n}\n\n// a branch hangs off the side of its mother filament: its tail points to the mother actin,\n// but the mother's head points along the mother filament, not back to the branch\nfn is_branch_root(idx: u32, segments: ptr<storage, array<Segment>, read_write>) -> bool {\n  let tail = segments[idx].tail;\n  return tail != idx && segments[tail].head != idx;\n}\n\nfn disconnect_from_head(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n\n  segments[segment.head].tail = segments[segment.head].id;\n  segments[idx].head = segment.id;\n}\n\nfn disconnect_from_tail(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n\n  segments[segment.tail].head = segments[segment.tail].id;\n  segments[idx].tail = segment.id;\n}\n";

/***/ }),

/***/ "./src/shaders/includes/enclosure.wgsl":
/*!*********************************************!*\
  !*** ./src/shaders/includes/enclosure.wgsl ***!
  \*********************************************/
/***/ ((module) => {

module.exports = "// Enclosure closure for a 2-D cell. Area projection is an imposed volume\n// surrogate, NOT a measurement of hydrostatic pressure. Contacts below are\n// kinematic nonpenetration constraints; the pre-existing steric coupling still\n// supplies the deformable-wall response.\nfn enclosure_slot() -> u32 { return controls.actinCount + controls.membraneCount; }\nfn reference_area() -> f32 {\n  let circumference = f32(controls.membraneCount) * controls.membraneRestLength;\n  return circumference * circumference / (4.0 * PI);\n}\n\nconst ENCLOSURE_ROW_HEIGHT = 4.0;\nconst ENCLOSURE_ROW_CAPACITY = 256u;\nconst ENCLOSURE_ROW_STRIDE = 257u;\nfn row_base(row: u32) -> u32 { return enclosure_slot() + row * ENCLOSURE_ROW_STRIDE; }\nfn reaction_dilution() -> f32 {\n  // Fixed reference across cell sizes, so a smaller volume really increases\n  // concentration-dependent supply instead of redefining its reference rate.\n  return (1024.0 * 1024.0 / (4.0 * PI)) / max(1.0, mechanical_snapshot[enclosure_slot()].orientation.x);\n}\n\n@compute @workgroup_size(WGSZ)\nfn build_enclosure_rows(@builtin(global_invocation_id) id: vec3u) {\n  let row = id.x;\n  let rows = u32(ceil(f32(canvas.size.y) / ENCLOSURE_ROW_HEIGHT));\n  if (row >= rows || controls.gActinField == 0u) { return; }\n  let low = f32(row) * ENCLOSURE_ROW_HEIGHT;\n  let high = low + ENCLOSURE_ROW_HEIGHT;\n  var count = 0u;\n  for (var i = 0u; i < controls.membraneCount; i++) {\n    let a = membrane[i].position;\n    let b = membrane[(i + 1u) % controls.membraneCount].position;\n    if (max(a.y, b.y) >= low && min(a.y, b.y) <= high && any(a != b)) {\n      if (count < ENCLOSURE_ROW_CAPACITY) { atomicStore(&mechanical_forces[row_base(row) + 1u + count].x, i32(i)); }\n      count++;\n    }\n  }\n  // Overflow is explicit: callers fall back to the complete polygon. No edge\n  // or selected collision case is discarded to meet a performance target.\n  atomicStore(&mechanical_forces[row_base(row)].x, i32(count));\n}\n\nfn inside_membrane(p: vec2<f32>) -> bool {\n  var inside = false;\n  let row = i32(floor(p.y / ENCLOSURE_ROW_HEIGHT));\n  var count = controls.membraneCount;\n  var shortlist = false;\n  if (row >= 0 && p.y < f32(canvas.size.y)) {\n    let found = u32(atomicLoad(&mechanical_forces[row_base(u32(row))].x));\n    if (found <= ENCLOSURE_ROW_CAPACITY) { count = found; shortlist = true; }\n  }\n  for (var k = 0u; k < count; k++) {\n    var i = k;\n    if (shortlist) { i = u32(atomicLoad(&mechanical_forces[row_base(u32(row)) + 1u + k].x)); }\n    let a = membrane[i].position;\n    let b = membrane[(i + 1u) % controls.membraneCount].position;\n    if ((a.y > p.y) != (b.y > p.y)) {\n      let x = a.x + (p.y - a.y) * (b.x - a.x) / (b.y - a.y);\n      if (p.x < x) { inside = !inside; }\n    }\n  }\n  return inside;\n}\n\n@compute @workgroup_size(1)\nfn measure_enclosure() {\n  let n = controls.membraneCount;\n  // Relative coordinates avoid cancellation when the cell translates.\n  let origin = membrane[0].position;\n  var area2 = 0.0;\n  var moment = vec2<f32>(0.0);\n  var low = origin;\n  var high = origin;\n  for (var i = 0u; i < n; i++) {\n    low = min(low, membrane[i].position);\n    high = max(high, membrane[i].position);\n    let a = membrane[i].position - origin;\n    let b = membrane[(i + 1u) % n].position - origin;\n    let weight = cross2(a, b);\n    area2 += weight;\n    moment += (a + b) * weight;\n  }\n  let area = abs(area2) * 0.5;\n  var center = origin;\n  var scale = 1.0;\n  if (area > 1.0) {\n    center += moment / (3.0 * area2);\n    if (controls.areaConservation > 0.0) { scale = sqrt(reference_area() / area); }\n  }\n  mechanical_snapshot[enclosure_slot()].position = center;\n  mechanical_snapshot[enclosure_slot()].orientation = vec2<f32>(area, scale);\n  mechanical_snapshot[enclosure_slot()].head = bitcast<u32>(low.x);\n  mechanical_snapshot[enclosure_slot()].tail = bitcast<u32>(high.x);\n  mechanical_snapshot[enclosure_slot()].attached = bitcast<u32>(low.y);\n  mechanical_snapshot[enclosure_slot()].unused = bitcast<u32>(high.y);\n}\n\n@compute @workgroup_size(WGSZ)\nfn project_enclosure_area(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.membraneCount || controls.areaConservation <= 0.0) { return; }\n  let geometry = mechanical_snapshot[enclosure_slot()];\n  // Uniform scaling about the CURRENT area centroid changes area but does not\n  // prescribe a centroid destination or a direction of translation.\n  membrane[i].position = geometry.position + (membrane[i].position - geometry.position) * geometry.orientation.y;\n}\n\n@compute @workgroup_size(WGSZ)\nfn contain_filament_points(@builtin(global_invocation_id) id: vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount || controls.gActinField == 0u || is_disconnected(actines[idx])) { return; }\n  let p = actines[idx].position;\n  if (inside_membrane(p)) { return; }\n  atomicAdd(&telemetry[TELEMETRY_POINT_CONTACTS], 1u);\n  var best_distance = 1e30;\n  var best = p;\n  var best_a = p;\n  var best_b = p;\n  for (var i = 0u; i < controls.membraneCount; i++) {\n    let a = membrane[i].position;\n    let b = membrane[(i + 1u) % controls.membraneCount].position;\n    let edge = b - a;\n    let t = clamp(dot(p - a, edge) / max(dot(edge, edge), 1e-12), 0.0, 1.0);\n    let q = a + t * edge;\n    let d = dot(p - q, p - q);\n    if (d < best_distance && dot(edge, edge) > 1e-12) {\n      best_distance = d; best = q; best_a = a; best_b = b;\n    }\n  }\n  let inward = normalize_safely(perpendicular(best_b - best_a));\n  var q = best + 0.1 * inward;\n  // At a concave vertex, move toward the selected edge's interior before\n  // applying the small inward inset. Reject neither mass nor connectivity.\n  for (var k = 0u; k < 8u && !inside_membrane(q); k++) {\n    best = mix(best, (best_a + best_b) * 0.5, 0.5);\n    q = best + inward * (0.1 / f32(k + 2u));\n  }\n  actines[idx].position = q;\n}\n\n@compute @workgroup_size(WGSZ)\nfn contain_filament_bonds(@builtin(global_invocation_id) id: vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount || controls.gActinField == 0u) { return; }\n  let bead = mechanical_snapshot[idx];\n  if (bead.attached == 0u || bead.tail == idx) { return; }\n  let a = mechanical_snapshot[bead.tail].position;\n  let b = bead.position;\n  let delta = b - a;\n  var first = 1.0;\n  let low = i32(floor(min(a.y, b.y) / ENCLOSURE_ROW_HEIGHT));\n  let high = i32(floor(max(a.y, b.y) / ENCLOSURE_ROW_HEIGHT));\n  var shortlist = low >= 0 && max(a.y, b.y) < f32(canvas.size.y) && high - low <= 2;\n  if (shortlist) {\n    for (var row = low; row <= high; row++) {\n      shortlist = shortlist && u32(atomicLoad(&mechanical_forces[row_base(u32(row))].x)) <= ENCLOSURE_ROW_CAPACITY;\n    }\n  }\n  let batches = select(1u, u32(high - low + 1), shortlist);\n  for (var batch = 0u; batch < batches; batch++) {\n    var count = controls.membraneCount;\n    var base = 0u;\n    if (shortlist) {\n      base = row_base(u32(low) + batch);\n      count = u32(atomicLoad(&mechanical_forces[base].x));\n    }\n    for (var k = 0u; k < count; k++) {\n      var i = k;\n      if (shortlist) { i = u32(atomicLoad(&mechanical_forces[base + 1u + k].x)); }\n      let c = membrane[i].position;\n      let edge = membrane[(i + 1u) % controls.membraneCount].position - c;\n      let denominator = cross2(delta, edge);\n      if (abs(denominator) < 1e-8) { continue; }\n      let t = cross2(c - a, edge) / denominator;\n      let u = cross2(c - a, delta) / denominator;\n      if (t > 1e-5 && t < first && u >= 0.0 && u <= 1.0) { first = t; }\n    }\n  }\n  if (first < 1.0) {\n    atomicAdd(&telemetry[TELEMETRY_BOND_CONTACTS], 1u);\n    actines[idx].position = a + delta * max(0.0, first - 0.1 / max(length(delta), 0.1));\n  }\n}\n\n@compute @workgroup_size(16, 16)\nfn draw_reservoir_compartment(@builtin(global_invocation_id) id: vec3u) {\n  let p = vec2<i32>(id.xy);\n  if (any(p >= canvas.size)) { return; }\n  let geometry = mechanical_snapshot[enclosure_slot()];\n  let q = vec2<f32>(p) + 0.5;\n  var fill = 0.0;\n  if (controls.gActinField != 0u && q.x >= bitcast<f32>(geometry.head) && q.x <= bitcast<f32>(geometry.tail) &&\n      q.y >= bitcast<f32>(geometry.attached) && q.y <= bitcast<f32>(geometry.unused)) {\n    fill = select(0.0, 1.0, inside_membrane(q));\n  }\n  store_texture(parameter_fields, G_ACTIN_COMPARTMENT, p, fill);\n}\n";

/***/ }),

/***/ "./src/shaders/includes/random.wgsl":
/*!******************************************!*\
  !*** ./src/shaders/includes/random.wgsl ***!
  \******************************************/
/***/ ((module) => {

module.exports = "@group(GROUP_INDEX) @binding(RANDOM)  \n  var<storage, read_write> randomBuffer : array<vec4<u32>>;\n\nfn threefry_2x32(idx: u32) -> vec4<u32> {\n\n    let R: array<u32, 8> = array<u32, 8>(13, 15, 26, 6, 17, 29, 16, 24);\n    let C: u32 = 0x1BD11BDAu;\n\n    var state = randomBuffer[idx];\n  \n    state.x += canvas.key.x;\n    state.y += canvas.key.y;\n    state.z += canvas.key.x ^ C;\n    state.w += canvas.key.y ^ C;\n\n    for (var i = 0u; i < 8u; i++) {\n        state.x += state.z;\n        state.y += state.w;\n        state.z ^= state.x;\n        state.w ^= state.y;\n        state.z = (state.zw.x >> R[i]) | (state.zw.x << (32u - R[i]));\n        state.w = (state.zw.y >> R[i]) | (state.zw.y << (32u - R[i]));\n\n        if (i % 4u == 3u) {\n            state = vec4<u32>(state.z, state.w, state.x, state.y);\n        }\n    }\n    randomBuffer[idx] = state;\n    return state;\n}\n\nfn random_uniform(thread_id: u32) -> f32 {\n    return random_uniform_buffer(thread_id).x;\n}\n\nconst UINT32_MAX: f32 = 4294967296.0;\nfn random_uniform_buffer(thread_id: u32) -> vec4<f32> {\n\n    let random_values = threefry_2x32(thread_id);\n    return vec4<f32>(random_values) / UINT32_MAX;\n}\n\nfn random_uniform_texture(thread_id: vec2<u32>) -> vec4<f32> {\n\n    let random_values = threefry_2x32(thread_id.x + thread_id.y * u32(canvas.size.x));\n    return vec4<f32>(random_values) / UINT32_MAX;\n}";

/***/ }),

/***/ "./src/shaders/includes/textures.wgsl":
/*!********************************************!*\
  !*** ./src/shaders/includes/textures.wgsl ***!
  \********************************************/
/***/ ((module) => {

module.exports = "// Textures\n@group(GROUP_INDEX) @binding(INDEX)\n  var index_texture: texture_storage_2d_array<r32uint, read_write>;\n\n@group(GROUP_INDEX) @binding(STERIC_POTENTIAL)  \n  var steric_potential: texture_storage_2d_array<r32float, read_write>;\n\n@group(GROUP_INDEX) @binding(PARAMETER_FIELDS)  \n  var parameter_fields: texture_storage_2d_array<r32float, read_write>;\n\nconst DX = vec2i(1, 0);\nconst DY = vec2i(0, 1);\n\nconst EPS = 1e-37;\n\nfn as_r32float(r: f32) -> vec4<f32> {\n    return vec4<f32>(f32(r), 0.0, 0.0, 1.0);\n}\n\nfn as_r32uint(r: u32) -> vec4<u32> {\n    return vec4<u32>(u32(r), 0, 0, 1);\n}\n\nfn normalize_safely(x: vec2<f32>) -> vec2<f32> {\n  return x / max(length(x), EPS);\n}\n\nfn load_texture(texture: texture_storage_2d_array<r32float, read_write>, F: i32, p: vec2<i32>) -> f32 {\n  let q = p + canvas.size;\n  return textureLoad(texture, q  % canvas.size, F).r;\n}\n\nfn store_texture(texture: texture_storage_2d_array<r32float, read_write>, F: u32, p: vec2<i32>, value: f32) {\n  let q = p + canvas.size;\n  textureStore(texture, q  % canvas.size, F, as_r32float(value));\n}\n\nfn load_texture_index(F: i32, p: vec2<i32>) -> u32 {\n  let q = p + canvas.size;\n  return textureLoad(index_texture, q  % canvas.size, F).r;\n}\n\nfn store_texture_index(F: i32, p: vec2<i32>, value: u32) {\n  let q = p + canvas.size;\n  textureStore(index_texture, q  % canvas.size, F, as_r32uint(value));\n}\n\nfn as_vec2i(p: vec2<f32>) -> vec2<i32> {\n  return vec2<i32>(p + (0.5 - fract(p)));\n}\n\nfn load_steric_potential(p: vec2<i32>) -> array<f32, STERIC_POTENTIAL_DIM> {\n  var U: array<f32, STERIC_POTENTIAL_DIM>;\n  for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n    U[i] = load_texture(steric_potential, i, p);\n  }\n  return U;\n}\n\nfn steric_force(x: vec2<f32>, dx: vec2<f32>, coefficients: array<f32, STERIC_POTENTIAL_DIM>) -> f32 {\n  var force: f32 = 0.0;\n  for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n    force += coefficients[i] * (load_texture(steric_potential, i, as_vec2i(x + dx)) - load_texture(steric_potential, i, as_vec2i(x - dx))) / length(2*dx);\n  }\n  return force;\n}\n\nfn store_steric_potential(p: vec2<i32>, U: array<f32, STERIC_POTENTIAL_DIM>) {\n  for (var i = 0u; i < STERIC_POTENTIAL_DIM; i++) {\n    store_texture(steric_potential, i, p, U[i]);\n  }\n}\n\n";

/***/ }),

/***/ "./src/shaders/render.wgsl":
/*!*********************************!*\
  !*** ./src/shaders/render.wgsl ***!
  \*********************************/
/***/ ((module) => {

module.exports = "#import includes::bindings\n#import includes::textures\n\nstruct VertexOutput {\n    @builtin(position) Position : vec4f,\n    @location(0) fragUV : vec2f,\n}\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n@vertex\nfn vert(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {\n    const pos = array(\n        vec2( 1.0,  1.0),\n        vec2( 1.0, -1.0),\n        vec2(-1.0, -1.0),\n        vec2( 1.0,  1.0),\n        vec2(-1.0, -1.0),\n        vec2(-1.0,  1.0),\n    );\n\n    const uv = array(\n        vec2(1.0, 0.0),\n        vec2(1.0, 1.0),\n        vec2(0.0, 1.0),\n        vec2(1.0, 0.0),\n        vec2(0.0, 1.0),\n        vec2(0.0, 0.0),\n    );\n\n    var output : VertexOutput;\n    output.Position = vec4(pos[VertexIndex], 0.0, 1.0);\n    output.fragUV = uv[VertexIndex];\n    return output;\n}\n\nstruct Canvas {\n    size: vec2<i32>,\n    pass_id: u32,\n    key: vec2<u32>,\n}\n\nstruct Interactions {\n    position: vec2<f32>,\n    size: f32,\n};\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(INTERACTIONS)\n  var<uniform> interactions: Interactions;\n\n@group(GROUP_INDEX) @binding(BINDING_INTERMEDIATE_TEXTURE)\n  var intermediateTexture: texture_storage_2d<rgba8unorm, write>; //rgba8unorm\n\n// Bindings for the final screen render\n@group(1) @binding(0) var screenSampler: sampler;\n@group(1) @binding(1) var screenTexture: texture_2d<f32>;\n\n// A display-only transmitted-light approximation, not a light-field acquisition\n// or a calibrated optical model. No simulation buffers or fields are modified.\nstruct View {\n  center: vec2<f32>, zoom: f32, mode: u32,\n  focus: f32, contrast: f32, chroma: f32, grain: f32,\n  screenScale: vec2f,\n}\nstruct SpecimenGeometry { center: vec2<f32>, areaScale: vec2<f32>, bounds: vec4<u32> }\n@group(0) @binding(11) var specimenTexture: texture_2d<f32>;\n@group(0) @binding(12) var specimenSampler: sampler;\n@group(0) @binding(13) var<storage, read> specimenGeometry: SpecimenGeometry;\n@group(0) @binding(16) var specimenOutput: texture_storage_2d<rgba16float, write>;\n@group(0) @binding(17) var<uniform> view: View;\n\nfn hash2(p: vec2<f32>) -> f32 {\n  var q = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);\n  q += dot(q, q.yzx + 33.33);\n  return fract((q.x + q.y) * q.z);\n}\nfn soft_noise(p: vec2<f32>) -> f32 {\n  let i = floor(p); let f = fract(p); let w = f*f*(3.0-2.0*f);\n  return mix(mix(hash2(i),hash2(i+vec2f(1,0)),w.x),mix(hash2(i+vec2f(0,1)),hash2(i+vec2f(1,1)),w.x),w.y);\n}\nfn optical_granules(p: vec2f) -> f32 {\n  let warped = p + 1.5*vec2f(soft_noise(p*0.2),soft_noise(p*0.2+7.1));\n  let grid = floor(warped);\n  var pigment = 0.0;\n  for(var y=-1;y<=1;y++) {\n    for(var x=-1;x<=1;x++) {\n      let cell = grid+vec2f(f32(x),f32(y));\n      let seed = hash2(cell);\n      let offset = vec2f(hash2(cell+17.3),hash2(cell-9.7));\n      let angle = seed*6.2831853;\n      let axis = vec2f(cos(angle),sin(angle));\n      let delta = warped-cell-offset;\n      let q = vec2f(dot(delta,axis),dot(delta,vec2f(-axis.y,axis.x)))*(vec2f(1.0,1.0+0.7*seed));\n      let r = length(q);\n      let size = 0.12+0.29*seed;\n      let core = 1.0-smoothstep(size-0.07,size+0.02,r);\n      let rim = exp(-pow((r-size)/0.045,2.0));\n      pigment = max(pigment,(0.5+0.5*seed)*core+0.3*rim);\n    }\n  }\n  return pigment;\n}\n\n@compute @workgroup_size(16,16)\nfn build_specimen(@builtin(global_invocation_id) id: vec3u) {\n  let p = vec2i(id.xy);\n  if (any(p >= canvas.size)) { return; }\n  let body = select(0.0,load_texture(parameter_fields, G_ACTIN_COMPARTMENT, p),controls.gActinField != 0u);\n  let polymer = clamp(load_texture(steric_potential, STIGMERGYPOLYMER, p), 0.0, 1.0);\n  let membrane = clamp(load_texture(steric_potential, STIGMERGYMEMBRANE, p), 0.0, 1.0);\n  // Coarse granulation modulates actual network density. It is an illustrative\n  // pigment/texture treatment, not additional simulated organelles or chloroplasts.\n  let local = vec2f(p) - specimenGeometry.center;\n  var pigment = 0.0;\n  if (polymer > 0.001) { pigment = polymer * (0.08 + 1.65*optical_granules(local/6.2)); }\n  textureStore(specimenOutput,p,vec4f(body,polymer,membrane,pigment));\n}\n\nfn specimen(p: vec2f) -> vec4f {\n  // Optical sampling is not periodic: do not repeat the cell at image borders.\n  if (any(p < vec2f(0)) || any(p >= vec2f(canvas.size))) { return vec4f(0); }\n  return textureSampleLevel(specimenTexture,specimenSampler,(p+0.5)/vec2f(canvas.size),0.0);\n}\nfn soft_specimen(p: vec2f, radius: f32) -> vec4f {\n  var value = specimen(p)*0.25;\n  value += (specimen(p+vec2f(radius,0))+specimen(p-vec2f(radius,0))+\n    specimen(p+vec2f(0,radius))+specimen(p-vec2f(0,radius)))*0.125;\n  let r=radius*0.7071;\n  value += (specimen(p+vec2f(r,r))+specimen(p-vec2f(r,r))+\n    specimen(p+vec2f(r,-r))+specimen(p+vec2f(-r,r)))*0.0625;\n  return value;\n}\nfn microscope(screen: vec2f) -> vec4f {\n  let p = view.center + (screen - vec2f(canvas.size)*0.5) / view.screenScale;\n  let radius = 0.35 + abs(view.focus)*2.4;\n  let image = soft_specimen(p,radius);\n  let wide = soft_specimen(p,radius+2.5);\n  let pigment = max(0.0,image.a)*view.contrast;\n  let uv = (screen-vec2f(canvas.size)*0.5)/f32(max(canvas.size.x,canvas.size.y));\n  let light = vec3f(0.835,0.875,0.862) - 0.055*dot(uv,uv);\n  let extinction = vec3f(0.68,0.47,1.32)*pigment + vec3f(0.025,0.032,0.035)*image.r;\n  var color = light*exp(-extinction);\n  // Low-amplitude phase halo and a soft membrane rim; never a neon outline.\n  let phase = wide.r-image.r;\n  color += vec3f(0.12,0.105,0.075)*phase*(1.0+0.4*view.focus);\n  color -= vec3f(0.09,0.08,0.16)*image.b*view.contrast;\n  color -= vec3f(0.025)*image.g;\n  let shift = vec2f(0.8,0.35)*(1.0+abs(view.focus));\n  let dispersion = specimen(p+shift)-specimen(p-shift);\n  color += view.chroma*vec3f(0.055,-0.022,0.045)*(dispersion.r+0.45*dispersion.a);\n  // Fixed sensor grain: no flicker and no simulation RNG consumption.\n  let grain = hash2(screen)-0.5;\n  let haze = soft_noise(screen/2.3)-0.5;\n  color += view.grain*(0.018*grain+0.014*haze);\n  return vec4f(clamp(color,vec3f(0),vec3f(1)),1);\n}\n\n// #e0600cff\nconst orange = vec4(0.878, 0.373, 0.000, 1.0);\n\n// #064164ff\n// const blue = vec4(0.024, 0.255, 0.396, 1.0);\nconst blue = vec4(0.0, 0.0, 0.0, 1.0);\n\nfn random_uniform(seed: u32) -> f32 {\n    return fract(sin(f32(seed) * 43758.5453123) * 12345.6789);\n}\n\n@compute @workgroup_size(16, 16)\nfn render(@builtin(global_invocation_id) id: vec3u) {\n    let x = vec2<i32>(id.xy);\n    if (any(x >= canvas.size)) { return; }\n    if (view.mode != 0u) {\n      textureStore(intermediateTexture,x,microscope(vec2f(x)));\n      return;\n    }\n    var color = blue / 4;  // background\n    // Schematic compartment tint, not a quantitative G-actin density scale.\n    if (controls.gActinField != 0u && load_texture(parameter_fields, G_ACTIN_COMPARTMENT, x) > 0.5) {\n        color = vec4(0.025, 0.065, 0.09, 1.0);\n    }\n\n    // steric potential\n    var max_potential = 0.0;\n    let potential = load_steric_potential(x);\n\n    for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n        max_potential = max(max_potential, potential[i]);\n    }\n    color -= 0.05 * max_potential; // add shadow\n\n    // agent locations\n    let idx = load_texture_index(SEGMENT_INDEX, x);\n    if (idx > 0){\n        if (potential[STIGMERGYPOLYMER] > 0.1) {\n            let randomSample = 0.4 + random_uniform(idx) * 0.6;\n            color += get_actin_color(vec2<f32>(x));\n        }\n        else if (potential[STIGMERGYMONOMER] > 0.1) {\n            let randomSample = 0.4 + random_uniform(idx) * 0.6;\n             color += controls.monomerOpacity * randomSample * orange;\n        }\n    }\n    \n    // food signal\n    let foodsignal = load_texture(parameter_fields, CONNECTION_PROBABILITY, x);\n\n    let foodNearby = foodsignal > controls.foodNearbyThreshold;\n    var foodnearbyColor = vec4(0.0, 0.0, 0.0, 1.0);\n    if (foodNearby){\n      var decayedFoodSignal = foodsignal;\n      decayedFoodSignal = select(1.0, foodsignal / 0.01, foodsignal < 0.01);\n      foodnearbyColor = vec4(0.4, 0.4, 0.4, 1.0) * decayedFoodSignal;\n    }\n    \n    var debug = load_texture(parameter_fields, DEBUG, x);\n    if (debug > 0.0){\n      color = vec4(1.0, 1.0, 1.0, 1.0);\n    }\n    if (debug == 4.0){\n      color = vec4(0.0, 0.0, 1.0, 1.0);\n    }\n    if (debug == 5.0){\n      color = vec4(0.0, 1.0, 0.0, 1.0);\n    }\n    if (debug == 6.0) { color = vec4(1.0, 0.25, 0.85, 1.0); }\n    if (debug == 7.0) { color = vec4(0.2, 0.85, 1.0, 1.0); }\n    if (debug == 8.0) { color = vec4(1.0, 0.7, 0.2, 1.0); }\n    if (debug >= 20 && debug < 30000){\n      color = index_to_rainbow(u32(debug));\n    }\n\n    textureStore(intermediateTexture, x, color);\n}\n\nfn index_to_rainbow(idx: u32) -> vec4f {\n    if idx == 0 {\n        return vec4(0.0, 0.0, 0.0, 1.0);\n    }\n    let r = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 0.0);\n    let g = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 2.094);\n    let b = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 4.188);\n    return vec4(r, g, b, 1.0);\n}\nfn index_to_parity(idx: u32) -> vec4f {\n    if idx == 0 {\n        return vec4(0.0, 0.0, 0.0, 1.0);\n    }\n    if (idx % 2 == 0) {\n        return vec4(1.0, 0.0, 0.0, 1.0);\n    } else {\n        return vec4(0.0, 1.0, 0.0, 1.0);\n    }\n}\n\n// Add this to your rendering shader\nfn get_actin_color(position: vec2<f32>) -> vec4<f32> {\n  if(controls.colourAge!=0u) {\n    let age=load_texture(parameter_fields,ACTIN_AGE,as_vec2i(position));\n    let mature=clamp(age/max(1.0,2.0*controls.turnoverAge),0.0,1.0);\n    return vec4(mix(vec3(1.0,1.0,0.0),vec3(1.0,0.1,0.1),mature),1.0);\n  }\n  let recency = load_texture(parameter_fields, RECENCY, as_vec2i(position));\n  \n  // Red color (newest)\n  let red = vec3<f32>(1.0, 0.0, 0.0);\n  // Yellow color (oldest)\n  let yellow = vec3<f32>(1.0, 1.0, 0.0);\n  \n  // Interpolate between yellow and red based on recency\n  let color = mix(red, yellow, recency);\n  \n  return vec4<f32>(color, 1.0);\n}\n\n@fragment\nfn frag(@location(0) fragUV: vec2f) -> @location(0) vec4f {\n  return textureSample(screenTexture, screenSampler, fragUV);\n}\n";

/***/ }),

/***/ "./src/shaders/simulate.wgsl":
/*!***********************************!*\
  !*** ./src/shaders/simulate.wgsl ***!
  \***********************************/
/***/ ((module) => {

module.exports = "#import includes::bindings\n#import includes::textures\n#import includes::random\n#import includes::buffers\n#import includes::actomyosin\n#import includes::enclosure\n\nstruct Canvas {\n  size: vec2<i32>,\n  pass_id: u32,\n  key: vec2<u32>,\n}\n\nstruct NeighborStruct {\n  idx: u32,\n  distance: f32,\n}\n\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n\n@group(GROUP_INDEX) @binding(ACTIN)\n  var<storage, read_write> actines : array<Segment>;\n\n@group(GROUP_INDEX) @binding(MEMBRANE)  \n  var<storage, read_write> membrane : array<Segment>;\n\n@group(GROUP_INDEX) @binding(CONNECTION_LOCKS)\n  var<storage, read_write> connectionLocks: array<atomic<i32>>;\n\n// event counters read back by src/telemetry.ts (same order as TELEMETRY_COUNTERS there)\n@group(GROUP_INDEX) @binding(TELEMETRY)\n  var<storage, read_write> telemetry: array<atomic<u32>>;\nconst TELEMETRY_CANDIDATES = 0;\nconst TELEMETRY_NEIGHBOR_FOUND = 1;\nconst TELEMETRY_PASSED_PROB = 2;\nconst TELEMETRY_BOUND = 3;\nconst TELEMETRY_UNBOUND = 4;\nconst TELEMETRY_ELONGATED = 5;\nconst TELEMETRY_HEADS_IN_FIELD = 6;\nconst TELEMETRY_HEAD_FOUND = 7;\nconst TELEMETRY_BRANCHED = 8;\nconst TELEMETRY_DEBRANCHED = 9;\nconst TELEMETRY_POINT_CONTACTS = 10;\nconst TELEMETRY_BOND_CONTACTS = 11;\nconst TELEMETRY_REAR_LOSS = 12;\nconst TELEMETRY_FRONT_LOSS = 13;\nconst TELEMETRY_REAR_HEAD_LOSS = 14;\nconst TELEMETRY_TETHER_RELEASED = 15;\n\n\n\n\nconst PI = 3.14159265358979323846;\nconst WGSZ = 256;\n\n// new actins are placed this many rest lengths ahead of the filament head\nconst ACTIN_DROP_DISTANCE = 1.5;\n// Arp2/3 branches leave their mother filament at ~70 degrees, toward its plus end\nconst BRANCH_ANGLE = 70.0 * PI / 180.0;\n// how fast a branch root is pulled back to that angle, per step\nconst BRANCH_STIFFNESS = 0.5;\n// a branch whose mother actin got further than this (pixels) has lost it: the mother depolymerized and was rebound elsewhere.\n// Steric jitter alone moves them a couple of pixels apart\nconst BRANCH_MAX_DISTANCE = 6.0;\n\nconst MOVE_EAST = 1;\n\n// distance between two normalized arc lengths on a closed loop\nfn arc_distance(a: f32, b: f32) -> f32 {\n  let d = abs(a - b);\n  return min(d, 1.0 - d);\n}\n\nfn cross2(a: vec2<f32>, b: vec2<f32>) -> f32 {\n  return a.x * b.y - a.y * b.x;\n}\n\nfn perpendicular(v: vec2<f32>) -> vec2<f32> {\n  return vec2<f32>(-v.y, v.x);\n}\n\nfn angle(a: vec2<f32>, b: vec2<f32>) -> f32 {\n  return atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);\n}\n\nfn rotate(v: vec2<f32>, theta: f32) -> vec2<f32> {\n  let c = cos(theta);\n  let s = sin(theta);\n  return vec2<f32>(c * v.x - s * v.y, s * v.x + c * v.y);\n}\n\n\nfn orientation_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, stiffness: f32) {\n  storageBarrier();\n\n  let segment = segments[idx];  \n  \n  // straightening a branch root would fold the branch onto its mother; update_actin_polymer_position keeps its angle instead\n  if (is_disconnected(segment) || idx >= arrayLength(segments) || is_branch_root(idx, segments)) {\n    return;\n  }\n  var tail = segments[segment.tail];\n  var head = segments[segment.head];\n\n  let perp = normalize_safely(perpendicular(segment.orientation));\n\n  // Measure the \"width\" of the membrane at two offset positions\n  let offset_distance = 0.5; // How far to offset the trapezium corners\n  let tail_offset_a = tail.position + perp * offset_distance;\n  let tail_offset_b = tail.position - perp * offset_distance;\n  let head_offset_a = head.position + perp * offset_distance;\n  let head_offset_b = head.position - perp * offset_distance;\n\n  // Compute trapezium edge lengths\n  let distance_a = length(head_offset_a - tail_offset_a);\n  let distance_b = length(head_offset_b - tail_offset_b);\n\n  // both edges prefer the same length, so any difference bends the chain back toward straight\n  let net_torque = distance_a - distance_b;\n\n  segments[idx].position += net_torque * perp * stiffness;\n  }\n\nfn steric_force_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, coefficients: array<f32, STERIC_POTENTIAL_DIM>) {\n  let segment = segments[idx];\n  \n  if (idx >= arrayLength(segments)) {\n    return;\n  }\n  let theta = random_uniform(idx) * 2.0 * PI;\n  // 1 + was too small. Got artifacts from self. \n  let dx = (2 + f32(controls.steric_sampling_range) * random_uniform(idx)) * vec2<f32>(cos(theta), sin(theta));\n  \n  let normal = perpendicular(segment.orientation);\n  let position = segment.position - normal * dot(normalize_safely(dx), normal) * steric_force(segment.position, dx, coefficients) * 0.5;\n  \n  segments[idx].position = position;\n}\n\n\nfn line_constraint_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let rest_length = controls.equilibrium_line_distance;\n  let segment = segments[idx];\n  \n  if (is_disconnected(segment) || is_end(segment) || idx >= arrayLength(segments)) {\n    return;\n  }\n\n  let tail = segments[segment.tail];\n  let head = segments[segment.head];\n\n  var net_displacement = vec2<f32>(0.0);\n  \n  // Simple spring forces-like constraint to maintain equilibrium distance\n  // use select to avoid branching\n  let tail_vec = tail.position - segment.position;\n  let tail_error = length(tail_vec) - rest_length;\n  net_displacement += select(vec2<f32>(0.0), normalize_safely(tail_vec) * tail_error * 0.5, has_tail(segment));\n\n  // same for head  \n  let head_vec = head.position - segment.position;\n  let head_error = length(head_vec) - rest_length;\n  net_displacement += select(vec2<f32>(0.0), normalize_safely(head_vec) * head_error * 0.5, has_head(segment));\n\n  segments[idx].position = segment.position + net_displacement;\n}\n\n// neighbours 1, 2, 4, ... nodes away on either side that the membrane rules compare with\nconst MEMBRANE_SCALES = 7u;\n\n// The membrane is a rope: it resists stretching, and folds freely when compressed.\n// Tension pulls a node toward the chord between its neighbours (along the curvature), as hard as the membrane\n// between them is stretched beyond its rest length. Measured at several scales, so the pull doesn't fade with\n// the node count: a taut membrane pulls the whole cell in, which is how the rear follows the front.\nfn membrane_constraint_update(idx: u32) {\n  if (idx >= arrayLength(&membrane)) {\n    return;\n  }\n  let segment = membrane[idx];\n  let tail = membrane[segment.tail];\n  let head = membrane[segment.head];\n\n  var net_displacement = vec2<f32>(0.0);\n  var tail_idx = idx;\n  var head_idx = idx;\n  var tail_length = 0.0;\n  var head_length = 0.0;\n  var steps = 0u;\n  for (var scale = 0u; scale < MEMBRANE_SCALES; scale++) {\n    for (; steps < (1u << scale); steps++) {\n      let next_tail = membrane[tail_idx].tail;\n      let next_head = membrane[head_idx].head;\n      tail_length += length(membrane[next_tail].position - membrane[tail_idx].position);\n      head_length += length(membrane[next_head].position - membrane[head_idx].position);\n      tail_idx = next_tail;\n      head_idx = next_head;\n    }\n    let stretch = max(0.0, (tail_length + head_length) / (2.0 * f32(steps) * controls.membraneRestLength) - 1.0);\n    let chord_midpoint = 0.5 * (membrane[tail_idx].position + membrane[head_idx].position);\n    // tension times the curvature of the circle through the node and its two neighbours at this scale, capped\n    // at half the way to the chord so short edges can't overshoot\n    let pull = controls.membraneStiffness * stretch * 2.0 / max(tail_length * head_length, 1e-6);\n    net_displacement += (chord_midpoint - segment.position) * min(0.5, pull);\n  }\n  net_displacement /= f32(MEMBRANE_SCALES);\n\n  // membrane smoothing: move toward the neighbours' midpoint. Fastest where the membrane is sharply curved,\n  // so idle protrusions and cusps retract and flatten while the round body barely shrinks.\n  let midpoint = 0.5 * (tail.position + head.position);\n  net_displacement += (midpoint - segment.position) * controls.membraneSmoothing;\n\n  membrane[idx].position = segment.position + net_displacement;\n  // membrane orientation is not 'constrained', just calculated. Actin carries its own director, see cosserat_update\n  membrane[idx].orientation = normalize_safely(head.position - tail.position);\n}\n\n// Slide membrane nodes along the membrane toward the more stretched side, comparing the membrane length to the\n// neighbours 1, 2, 4, ... nodes away on either side. This evens out node spacing without changing the shape, so\n// membrane flows toward stretched regions like a growing dendrite. The farther neighbours carry it across the\n// whole cell; with the direct neighbours alone it diffuses, and the rear stays crowded while the front is\n// stretched to its max length. A node slides at most half an edge per pass, so it stays on the membrane.\n\n@compute @workgroup_size(WGSZ)\nfn membrane_tangential_flow(@builtin(global_invocation_id) id : vec3u) {\n  if (id.x >= arrayLength(&membrane)) {\n    return;\n  }\n  let segment = membrane[id.x];\n  let tangent = normalize_safely(membrane[segment.head].position - membrane[segment.tail].position);\n  var tail = id.x;\n  var head = id.x;\n  var tail_length = 0.0;\n  var head_length = 0.0;\n  var steps = 0u;\n  var shift = 0.0;\n  for (var scale = 0u; scale < MEMBRANE_SCALES; scale++) {\n    for (; steps < (1u << scale); steps++) {\n      let next_tail = membrane[tail].tail;\n      let next_head = membrane[head].head;\n      tail_length += length(membrane[next_tail].position - membrane[tail].position);\n      head_length += length(membrane[next_head].position - membrane[head].position);\n      tail = next_tail;\n      head = next_head;\n    }\n    // per node, so every scale weighs the same\n    shift += 0.5 * (head_length - tail_length) / f32(steps);\n  }\n  let edge = min(length(membrane[segment.head].position - segment.position), length(membrane[segment.tail].position - segment.position));\n  shift = clamp(shift / f32(MEMBRANE_SCALES) * controls.membraneFlow, -0.5 * edge, 0.5 * edge);\n  membrane[id.x].position += tangent * shift;\n}\n\n// how fast an actin moves onto its neighbours' director lines, per step\nconst ACTIN_SHEAR_STIFFNESS = 0.5;\n// how fast a director turns toward its bond, per step. Kept weak: a director that just follows its bond\n// only describes the current shape, and the positions then have nothing to straighten toward\nconst ACTIN_DIRECTOR_SHEAR = 0.05;\n\n// 2D Cosserat rod for the actin filaments: every actin carries a director (its orientation) besides its position.\n// Bending acts on the angle between neighbouring directors and shear on the angle between a director and its bond,\n// so the stiffness doesn't depend on how far apart the actins are. Spacing is left to the steric forces.\nfn cosserat_update(idx: u32) {\n  if (idx >= arrayLength(&actines)) {\n    return;\n  }\n  let actin = actines[idx];\n  if (is_disconnected(actin)) {\n    return;\n  }\n  // a branch root meets its mother at BRANCH_ANGLE, which update_actin_polymer_position keeps\n  let along_tail = has_tail(actin) && !is_branch_root(idx, &actines);\n  let tail = actines[actin.tail];\n  let head = actines[actin.head];\n\n  // bond toward the head, or from the tail at the plus end\n  let bond = normalize_safely(select(actin.position - tail.position, head.position - actin.position, has_head(actin)));\n\n  // bending: turn the director toward its neighbours' directors\n  var neighbors = vec2<f32>(0.0);\n  neighbors += select(vec2<f32>(0.0), tail.orientation, along_tail);\n  neighbors += select(vec2<f32>(0.0), head.orientation, has_head(actin));\n  var director = normalize_safely(actin.orientation + controls.actinBendStiffness * neighbors);\n  // shear: turn the director toward its bond\n  director = normalize_safely(mix(director, bond, ACTIN_DIRECTOR_SHEAR));\n  actines[idx].orientation = director;\n\n  // shear on the positions: move onto the line the tail's director points along, and onto the line\n  // that puts the head along this director, at the same distances\n  var goal = vec2<f32>(0.0);\n  var count = 0.0;\n  if (along_tail) {\n    goal += tail.position + tail.orientation * length(actin.position - tail.position);\n    count += 1.0;\n  }\n  if (has_head(actin)) {\n    goal += head.position - director * length(head.position - actin.position);\n    count += 1.0;\n  }\n  if (count > 0.0) {\n    actines[idx].position += (goal / count - actin.position) * ACTIN_SHEAR_STIFFNESS;\n  }\n}\n\n// dispatched actinCosseratIterations times per step: each pass carries bending one actin further along a filament\n@compute @workgroup_size(WGSZ)\nfn cosserat_updates(@builtin(global_invocation_id) id : vec3u) {\n  cosserat_update(id.x);\n}\n\n@compute @workgroup_size(WGSZ)\nfn line_constraint_updates(@builtin(global_invocation_id) id : vec3u) {  \n  membrane_constraint_update(id.x);\n  line_constraint_update(id.x, &actines);\n}\n\n@compute @workgroup_size(WGSZ)\nfn orientation_updates(@builtin(global_invocation_id) id : vec3u) {\n  orientation_update(id.x, &membrane, controls.stiffness);\n  // do another update. gets a bit snappier\n  orientation_update(id.x, &membrane, controls.stiffness);\n}\n\n\n@compute @workgroup_size(WGSZ)\nfn steric_force_updates(@builtin(global_invocation_id) id : vec3u) {\n  // only polymers push the membrane. Monomers don't (G-actin barely does), and membrane self-repulsion\n  // makes the soft membrane buckle into persistent waves.\n  steric_force_update(id.x, &membrane, array<f32, STERIC_POTENTIAL_DIM>(0.0, 12.0, 0.0));\n}\n\n@compute @workgroup_size(WGSZ)\nfn update_actin_monomer_position(@builtin(global_invocation_id) id : vec3u) {\n  if (controls.gActinField != 0u) { return; }\n  let idx = id.x;\n  let actin = actines[idx];\n\n  if (has_connection(actin)) {\n    return;\n  }\n\n  let p = actines[idx].position;\n  let tangent = actines[idx].orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange);\n  var stericForce = vec2<f32>(0.0);\n  let membraneSignal = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(p)) * 3.0;\n  // choose either this one or the next. both are nice\n  // these 2 solutions to prevent actin 'highways' near the membrane. Uncomment to see what I mean.\n  let actinRepulsionScale = 0.2 + 0.8 * exp(-membraneSignal * 1000.0);\n  // let actinRepulsionScale = select(1.0, 0.2, membraneSignal/3.0 > 0.0001);\n\n  for (var t = -2.0*range; t <= 2.0*range; t += 1.0*range) {  \n    for (var n = -2.0*range; n <= 2.0*range; n += 1.0*range) { \n      let sample_pos = p + t * tangent + n * normal;\n      let densityMO = load_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(sample_pos)) * 0.4;\n      // how hard monomers are pushed off the membrane; sets the gap between the membrane and the actin\n      let densityME = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(sample_pos)) * controls.monomerMembraneRepulsion;\n\n      var density = densityME + densityMO*0.4;\n      let direction = normalize_safely(p - sample_pos);\n\n      // steer towards highest lifetime density\n      let food_signal = load_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(sample_pos));\n      let moveCondition = food_signal > controls.foodNearbyThreshold;\n\n      stericForce += select(vec2<f32>(0.0), direction * densityMO * actinRepulsionScale, densityMO > 0.0);\n      stericForce += select(vec2<f32>(0.0), direction * densityME, densityME > 0.0);\n    }\n  }\n\n  // go into the direction of the orientation texture\n  // Apply forces - steric force for avoidance, orientation for directed movement\n  actines[id.x].position += controls.actinStericForce * stericForce*10;\n}\n\n// upper bound for stericSelfNeighbors, the filament neighbours on each side that don't repel an actin\nconst MAX_STERIC_SELF_NEIGHBORS = 12u;\n\n@compute @workgroup_size(WGSZ)\nfn update_actin_polymer_position(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n  let actin = actines[idx];\n\n  if (is_disconnected(actin)) {\n    return;\n  }\n\n  let p = actin.position;\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange) * 3.0;\n  var stericForce = vec2<f32>(0.0);\n\n  // the membrane pushes through its field. Sample in a circle pattern\n  let sampleCount = 8; \n  for (var i = 0.0; i < f32(sampleCount); i += 1.0) {\n    let angle = 2.0 * PI * (i / f32(sampleCount));\n    let sampleDir = vec2f(cos(angle), sin(angle));\n    // make a radius that is subject to randomness\n    let radius = 0.1 + random_uniform(idx) * 0.9; // random radius between 0 and 1\n    let sample_pos = p + radius * range * sampleDir;\n\n    let densityME = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(sample_pos));\n\n    stericForce += select(\n      vec2<f32>(0.0), \n      normalize_safely(p - sample_pos) * densityME, \n      densityME > 0.0\n    );\n  }\n\n  // this actin and its nearest neighbours along its own filament, which don't repel it: the rest length spaces them\n  var own: array<u32, 2 * MAX_STERIC_SELF_NEIGHBORS + 1>;\n  own[0] = idx;\n  var ownCount = 1u;\n  let selfNeighbors = min(controls.stericSelfNeighbors, MAX_STERIC_SELF_NEIGHBORS);\n  var current = idx;\n  for (var k = 0u; k < selfNeighbors && has_tail(actines[current]); k++) {\n    current = actines[current].tail;\n    own[ownCount] = current;\n    ownCount++;\n  }\n  current = idx;\n  for (var k = 0u; k < selfNeighbors && has_head(actines[current]); k++) {\n    current = actines[current].head;\n    own[ownCount] = current;\n    ownCount++;\n  }\n\n  // other polymer actins repel from where they are now, found through the polymer index. The blurred polymer\n  // field also holds where an actin was the last few steps, and an actin pushed by that trail keeps going\n  let center = as_vec2i(p);\n  let reach = i32(ceil(range));\n  for (var dy = -reach; dy <= reach; dy++) {\n    for (var dx = -reach; dx <= reach; dx++) {\n      let q = center + vec2<i32>(dx, dy);\n      let signal = load_texture_index(POLYMER_INDEX, q);\n      if (signal == 0u) {\n        continue;\n      }\n      let j = signal - 1u;\n      let other = actines[j];\n      // the index is never cleared: only count an actin at the pixel it is in now, so it counts once\n      if (is_disconnected(other) || any(as_vec2i(other.position) != q)) {\n        continue;\n      }\n      var isOwn = false;\n      for (var k = 0u; k < ownCount; k++) {\n        isOwn = isOwn || own[k] == j;\n      }\n      let offset = p - other.position;\n      let dist = length(offset);\n      if (!isOwn && dist < range) {\n        stericForce += normalize_safely(offset) * (1.0 - dist / range) * controls.polymerRepulsion;\n      }\n    }\n  }\n\n  actines[id.x].position += 0.5 * stericForce;\n\n  // keep a branch at its angle on whichever side of the mother it is\n  if (is_branch_root(idx, &actines)) {\n    let mother = actines[actin.tail];\n    let side = select(-1.0, 1.0, cross2(mother.orientation, actines[idx].position - mother.position) >= 0.0);\n    actines[idx].position += (branch_position(mother, side) - actines[idx].position) * BRANCH_STIFFNESS;\n  }\n}\n\n// both polymerization fields: the sprout / Move East one and the lamellipodium one\nfn polymerization_signal(p: vec2<f32>) -> f32 {\n  let front = max(load_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p)), load_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p)));\n  // Optional second hypothesis: basal assembly near the entire membrane supplies\n  // a posterior actin substrate. Zero exactly recovers the front-only rule.\n  let cortex = controls.cortexPolymerization * load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(p));\n  return max(front, cortex);\n}\n\n// where a branch root sits: at BRANCH_ANGLE on the given side (+1 or -1) of its mother, as far from it as the\n// mother's own next actin (the actual spacing, which can stretch above the rest length)\nfn branch_position(mother: Segment, side: f32) -> vec2<f32> {\n  let spacing = max(controls.equilibrium_line_distance, length(actines[mother.head].position - mother.position));\n  return mother.position + rotate(mother.orientation, side * BRANCH_ANGLE) * spacing;\n}\n\n// upper bound for bindLengthSaturation; also caps the walk below\nconst MAX_BIND_LENGTH = 64u;\n\n// number of actins from idx back to the filament's minus end, counting idx, capped at max_length\nfn filament_length(idx: u32, max_length: u32) -> u32 {\n  var current = idx;\n  var n = 1u;\n  while (n < max_length && actines[current].tail != current) {\n    current = actines[current].tail;\n    n++;\n  }\n  return n;\n}\n\n@compute @workgroup_size(WGSZ)\nfn bind_actin_monomer(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&actines);\n  let idx = id.x;\n\n  let actin = actines[idx];\n  var p = actin.position;\n  if (controls.gActinField != 0u) {\n    if (has_connection(actin)) { return; }\n    // A free slot is a monomer equivalent in a uniform finite reservoir, not\n    // a particle at its stored position. Sample a membrane-access reaction\n    // location; only ACCEPTED transfers turn a free slot into an explicit bead.\n    let site = min(u32(random_uniform(idx) * f32(controls.membraneCount)), controls.membraneCount - 1u);\n    let wall = membrane[site];\n    p = wall.position - perpendicular(wall.orientation) * (2.0 + 6.0 * random_uniform(idx));\n  }\n\n  let food_signal = polymerization_signal(p);\n  let food_nearby = food_signal > controls.foodNearbyThreshold;\n  let lamellipodium_signal = load_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p));\n\n  // cancel if not a monomer and no food nearby\n  if (has_connection(actin) || !food_nearby) {\n    return;\n  }\n  atomicAdd(&telemetry[TELEMETRY_CANDIDATES], 1u);\n\n  let tangent = actin.orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange);\n  var neighborStruct = NeighborStruct(idx, 999999.9);\n  // plus ends nearby win over monomers: elongation is fast, nucleating a new filament from two monomers is slow\n  var headStruct = NeighborStruct(idx, 999999.9);\n  // in the lamellipodium field, monomers next to the side of a filament can nucleate a branch on it\n  var motherStruct = NeighborStruct(idx, 999999.9);\n\n  let sampleCount = 6; \n  for (var i = 0.0; i < f32(sampleCount); i += 1.0) {\n    let angle2 = 2.0 * PI * (i / f32(sampleCount));\n    let sampleDir = vec2f(cos(angle2), sin(angle2));\n    // make a radius that is subject to randomness\n    let radius = 0.0 + random_uniform(idx) * 1.0; // random radius between 0 and 1\n    let sample_pos = p + radius * range * 2.0 * sampleDir;\n\n\n    let dist = length(p - sample_pos);\n\n    // monomers look for polymers to connect to. The head layer is never cleared, so only trust heads\n    // that are still close to where they wrote themselves\n    let headSignal = load_texture_index(HEAD_INDEX, as_vec2i(sample_pos));\n    if (headSignal > 0) {\n      let idxH = headSignal - 1;\n      let head = actines[idxH];\n      let headDist = length(p - head.position);\n      if (idxH != idx && growing_head(head) && headDist < ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance + 2.0 * range && headDist < headStruct.distance) {\n        headStruct = NeighborStruct(idxH, headDist);\n      }\n    }\n\n    // the polymer layer isn't cleared either\n    let polymerSignal = load_texture_index(POLYMER_INDEX, as_vec2i(sample_pos));\n    if (polymerSignal > 0 && lamellipodium_signal > controls.foodNearbyThreshold) {\n      let idxM = polymerSignal - 1;\n      let motherDist = length(p - actines[idxM].position);\n      if (actines[idxM].subtype != FILOPODIAL_ACTIN && has_both_connections(actines[idxM]) && motherDist < 2.0 * range + 1.0 && motherDist < motherStruct.distance) {\n        motherStruct = NeighborStruct(idxM, motherDist);\n      }\n    }\n\n    if (controls.gActinField != 0u) { continue; }\n    let actinSignal = load_texture_index(ACTIN_INDEX, as_vec2i(sample_pos));\n    if (actinSignal <= 0) {\n      continue;\n    }\n\n    let idxN = actinSignal - 1;\n    let neighbor = actines[idxN];\n    // NOTE: simplify more; Maybe already just bind to the first one instead of closest. Way easier.\n    let available = is_head(neighbor) || is_disconnected(neighbor);\n\n    // skip if not available or self\n    if (!available || idxN == idx){\n      continue;\n    }\n\n    // maybe not necessary. Just get a random one\n    if (dist < neighborStruct.distance) {\n        neighborStruct = NeighborStruct(idxN, dist);\n    } else if (dist == neighborStruct.distance && random_uniform(idx) < 0.3) {\n        neighborStruct = NeighborStruct(idxN, dist);\n    }\n  }\n\n  if (headStruct.idx != idx) {\n    neighborStruct = headStruct;\n    atomicAdd(&telemetry[TELEMETRY_HEAD_FOUND], 1u);\n  } else if (motherStruct.idx != idx) {\n    // branching (Arp2/3): the monomer becomes the root of a new filament on the side of the mother.\n    // Only the monomer changes, the mother keeps its own head and tail\n    if (random_uniform(idx) < controls.branchProbability * lamellipodium_signal &&\n        (controls.gActinField == 0u || inside_membrane(p)) &&\n        atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged) {\n      let mother = actines[motherStruct.idx];\n      let side = select(-1.0, 1.0, random_uniform(idx) < 0.5);\n      actines[idx].tail = motherStruct.idx;\n      actines[idx].age = 0.0;\n      actines[idx].position = branch_position(mother, side);\n      actines[idx].orientation = rotate(mother.orientation, side * BRANCH_ANGLE);\n      store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n      atomicAdd(&telemetry[TELEMETRY_BRANCHED], 1u);\n    }\n    return;\n  }\n\n  if (controls.gActinField != 0u && neighborStruct.idx == idx && (idx & 1u) == 0u) {\n    // A nucleus consumes two distinct free slots. Paired locks prevent double\n    // consumption when the partner is also recruited by a growing filament.\n    let partner = idx + 1u;\n    let dilution = reaction_dilution();\n    if (partner < count && is_disconnected(actines[partner]) &&\n        random_uniform(idx) < min(0.25, 0.02 * controls.bindProb * food_signal * dilution) && inside_membrane(p)) {\n      let theta = random_uniform(idx) * 2.0 * PI;\n      var direction = vec2<f32>(cos(theta), sin(theta));\n      if(controls.frontAlignment>0.0) {\n        let biased=mix(direction,polarity_axis(),controls.frontAlignment);\n        direction=select(polarity_axis(),normalize_safely(biased),dot(biased,biased)>1e-8);\n      }\n      let q = p + controls.equilibrium_line_distance * direction;\n      if (!inside_membrane(q)) { return; }\n      let locked = atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged;\n      if (!locked) { return; }\n      if (!atomicCompareExchangeWeak(&connectionLocks[partner], 0, 1).exchanged) {\n        atomicStore(&connectionLocks[idx], 0); return;\n      }\n      if (!is_disconnected(actines[idx]) || !is_disconnected(actines[partner])) {\n        atomicStore(&connectionLocks[idx], 0); atomicStore(&connectionLocks[partner], 0); return;\n      }\n      actines[idx].position = p; actines[partner].position = q;\n      actines[idx].orientation = direction; actines[partner].orientation = direction;\n      actines[idx].head = partner; actines[partner].tail = idx;\n      actines[idx].age = 0.0; actines[partner].age = 0.0;\n      atomicAdd(&telemetry[TELEMETRY_BOUND], 1u);\n    }\n    return;\n  }\n\n  // 3. Handle binding with neighborStruct\n  if (neighborStruct.idx != idx) {\n    atomicAdd(&telemetry[TELEMETRY_NEIGHBOR_FOUND], 1u);\n    // bind probability depends on the length L of the filament we'd join: bindProb for a lone monomer,\n    // bindProb * bindLengthFloor for short filaments, growing as bindProb * L from L = bindLengthFloor\n    // up to L = bindLengthSaturation\n    let neighborMin = actines[neighborStruct.idx].tail;\n    var dilution = 1.0;\n    if (controls.gActinField != 0u) {\n      dilution = reaction_dilution();\n    }\n    let rnd = random_uniform(idx) / max(0.01, food_signal * dilution);\n    let max_length = clamp(controls.bindLengthSaturation, controls.bindLengthFloor, MAX_BIND_LENGTH);\n    // cheap early outs before walking the filament\n    if (rnd > controls.bindProb * f32(max_length)) {\n      return;\n    }\n    let is_monomer = neighborMin == actines[neighborStruct.idx].id;\n    if (is_monomer && rnd > controls.bindProb) {\n      return;\n    }\n    if (!is_monomer && rnd > controls.bindProb * f32(controls.bindLengthFloor) &&\n        rnd > controls.bindProb * f32(filament_length(neighborStruct.idx, max_length))) {\n      return;\n    }\n    atomicAdd(&telemetry[TELEMETRY_PASSED_PROB], 1u);\n    if (controls.gActinField != 0u && !inside_membrane(p)) { return; }\n    if (atomicCompareExchangeWeak(&connectionLocks[neighborStruct.idx], 0, 1).exchanged && atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged) {\n      // locked the target and self\n      // atomicStore(&connectionLocks[idx], 1);\n      if (actines[neighborStruct.idx].head != actines[neighborStruct.idx].id || actines[idx].tail != actines[idx].id ) {\n        atomicStore(&connectionLocks[neighborStruct.idx], 0);\n        atomicStore(&connectionLocks[idx], 0);\n        return;\n      }\n      actines[idx].tail = neighborStruct.idx;\n      actines[neighborStruct.idx].head = idx;\n      actines[idx].age = 0.0;\n      if (is_monomer) { actines[neighborStruct.idx].age = 0.0; }\n      atomicAdd(&telemetry[TELEMETRY_BOUND], 1u);\n      if (!is_monomer) {\n        atomicAdd(&telemetry[TELEMETRY_ELONGATED], 1u);\n      }\n\n      // Mark the binding location with high recency value\n      store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n\n      // directors start along the bond; a monomer that nucleates a filament takes the same one\n      let bondDirection = normalize_safely(p - actines[neighborStruct.idx].position);\n      actines[idx].orientation = bondDirection;\n      if (is_monomer) {\n        actines[neighborStruct.idx].orientation = bondDirection;\n      }\n\n      // also put the actin exactly on the polymer + direction\n      if (neighborMin >= 0) {\n        let direction = normalize_safely(actines[neighborStruct.idx].position - actines[neighborMin].position);\n        let newPosition = actines[neighborStruct.idx].position + direction * ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance; // Move forward from current position\n        actines[idx].position = newPosition;\n      }\n    }\n  }\n}\n\n@compute @workgroup_size(WGSZ)\nfn unbind_min_pole(@builtin(global_invocation_id) id : vec3u) {\n\n  let idx = id.x;  \n  let actin = actines[idx];\n  if (is_disconnected(actin)) { actines[idx].age=0.0; return; }\n  actines[idx].age=min(actin.age+1.0,1e7);\n  if(actin.subtype == FILOPODIAL_ACTIN) { return; }\n  let rear=rear_maturity(actin.position,actin.age);\n  let extra=controls.rearTurnover*rear;\n\n  if (is_tail(actin) && random_uniform(idx) < min(0.5,controls.disconnection_probability+extra)) {\n    if (actines[idx].head != idx) {\n      disconnect_from_head(idx, &actines);\n      atomicAdd(&telemetry[TELEMETRY_UNBOUND], 1u);\n      if(front_fraction(actin.position)<0.5){atomicAdd(&telemetry[TELEMETRY_REAR_LOSS],1u);}\n      else {atomicAdd(&telemetry[TELEMETRY_FRONT_LOSS],1u);}\n    }\n  }\n\n  // Aged rear barbed ends are capped against elongation and can peel back.\n  // A one-bead branch must detach only itself, never its mother's own head.\n  if (extra>0.0 && is_head(actin) && random_uniform(idx)<extra) {\n    let current=actines[idx];\n    if(current.tail!=idx) {\n      if(actines[current.tail].head==idx){disconnect_from_tail(idx,&actines);}\n      else {actines[idx].tail=idx;}\n      atomicAdd(&telemetry[TELEMETRY_REAR_HEAD_LOSS],1u);\n    }\n  }\n\n  // a branch comes off its mother at random, or once the mother actin has depolymerized\n  // (it is then a free monomer, or may already have been rebound somewhere else)\n  if (is_branch_root(idx, &actines)) {\n    let mother = actines[actin.tail];\n    let lost_mother = !has_both_connections(mother) || length(mother.position - actin.position) > BRANCH_MAX_DISTANCE;\n    if (lost_mother || random_uniform(idx) < min(0.5,controls.debranchProbability+0.25*extra)) {\n      actines[idx].tail = idx;\n      atomicAdd(&telemetry[TELEMETRY_DEBRANCHED], 1u);\n    }\n  }\n}\n\n\n@compute @workgroup_size(WGSZ)\nfn membrane_to_textures(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&membrane);\n  let idx = id.x;\n  if (idx >= count) {\n    return;\n  }\n\n  var segment = membrane[idx];\n  let p = segment.position;\n  let tangent = segment.orientation;\n\n  let normalized_arc_len = front_coordinate(p,segment.arc_length / f32(count));\n\n  if controls.movementMode == MOVE_EAST {\n    // polymerization patch around the selected front (arc 0 when cue is off)\n    if (arc_distance(normalized_arc_len, 0.0) < controls.polymerizationPatchSize * 0.5) {\n      store_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p), 1.0);\n    }\n  }\n\n  // lamellipodium: a broad field at the selected front (the right side at reset)\n  if (arc_distance(normalized_arc_len, 0.0) < controls.lamellipodiumWidth * 0.5) {\n    store_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p), controls.lamellipodiumStrength);\n  }\n\n  // short-lived sprout sites scheduled on the CPU: (center arc length, half width in nodes, strength, unused)\n  for (var i = 0; i < MAX_SPROUT_SITES; i++) {\n    let site = controls.sproutSites[i];\n    if (site.z > 0.0 && arc_distance(normalized_arc_len, site.x) * f32(count) < site.y) {\n      store_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p), site.z);\n    }\n  }\n\n  // rasterize the whole edge to the head, so a stretched membrane has no gaps for actin to leak through\n  let edge = membrane[segment.head].position - p;\n  let edge_length = min(length(edge), 32.0);\n  let edge_dir = normalize_safely(edge);\n  // 5.0 renders green, 4.0 blue: mark every 20th node. Edges are sub-pixel, so a lone blue node gets\n  // overwritten by its green neighbours; colouring a short run of nodes keeps a visible blue dash.\n  let debug_color = select(5.0, 4.0, idx % 20u < 4u);\n  for (var t = -1.0; t <= edge_length; t += 1.0) {\n    let q = p + t * edge_dir;\n    store_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(q), 1.0);\n    store_texture(parameter_fields, DEBUG, as_vec2i(q), debug_color);\n  }\n}\n\n@compute @workgroup_size(WGSZ)\nfn actines_to_textures(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount) {\n    return;\n  }\n\n  let actin = actines[idx];\n  if (controls.gActinField != 0u && is_disconnected(actin)) {\n    atomicStore(&connectionLocks[idx], 0);\n    return;\n  }\n  let p = actin.position;\n  let tangent = actin.orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n  let direction = tangent * normal;\n\n  if (is_disconnected(actin)) {\n    // TODO: maybe smooth with a sigmoid function?\n    store_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(p), load_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(p)) + 0.01);\n  }\n  else {\n    // the polymer field pushes the membrane, plus ends included\n    store_texture(steric_potential, STIGMERGYPOLYMER, as_vec2i(p), 1.0);\n    // read by the actin repulsion; branch nucleation only takes interior actins from it\n    store_texture_index(POLYMER_INDEX, as_vec2i(p), idx + 1);\n    if(controls.colourAge!=0u){store_texture(parameter_fields,ACTIN_AGE,as_vec2i(p),actin.age);}\n  }\n\n  // this is just for rendering!\n  store_texture_index(SEGMENT_INDEX, as_vec2i(p), idx + 1);\n  if (is_branch_root(idx, &actines)) {\n    store_texture(parameter_fields, DEBUG, as_vec2i(p), 4.0); // 4.0 renders blue\n    // the mother actin is the junction: tail, head and this branch give it degree 3\n    store_texture(parameter_fields, DEBUG, as_vec2i(actines[actin.tail].position), 4.0);\n  }\n\n  let food_nearby = polymerization_signal(p) > 0.001;\n  if (growing_head(actin) && food_nearby) {\n    let tail = actines[actin.tail];\n    let direction = normalize_safely(p - tail.position);\n    let dropPosition = p + direction * ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance; // Move forward from current position\n\n    // Set high recency for head segments\n    store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n\n    store_texture_index(HEAD_INDEX, as_vec2i(dropPosition), idx + 1);\n    atomicAdd(&telemetry[TELEMETRY_HEADS_IN_FIELD], 1u);\n    store_texture(parameter_fields, DEBUG, as_vec2i(dropPosition), 2.0);\n    // 0 means it's available to connect\n    // TODO: CAN'T WE DO THIS ELSEWHERE? LIKE A FINISH STEP IN THE PIPELINE? \n    atomicStore(&connectionLocks[idx], 0);\n  }\n  else if (is_disconnected(actin)) {\n    // 0 means it's available to connect\n    store_texture_index(ACTIN_INDEX, as_vec2i(p), idx + 1);\n    atomicStore(&connectionLocks[idx], 0);\n  }\n  else {\n    // 1 means it cannot connect\n    atomicStore(&connectionLocks[idx], 1);\n  }\n}\n\n// Each 16x16 workgroup copies its tile plus a 1-pixel border into workgroup memory once, then blurs from\n// there: ~1.3 texture loads per pixel per layer instead of 9.\nconst BLUR_TILE = 18;\nconst BLUR_LAYERS = 5;\nvar<workgroup> blur_tile: array<array<f32, BLUR_TILE * BLUR_TILE>, BLUR_LAYERS>;\n\nfn load_blur_layer(layer: u32, p: vec2i) -> f32 {\n  switch layer {\n    case 0u: { return load_texture(steric_potential, STIGMERGYMONOMER, p); }\n    case 1u: { return load_texture(steric_potential, STIGMERGYPOLYMER, p); }\n    case 2u: { return load_texture(steric_potential, STIGMERGYMEMBRANE, p); }\n    case 3u: { return load_texture(parameter_fields, CONNECTION_PROBABILITY, p); }\n    default: { return load_texture(parameter_fields, LAMELLIPODIUM, p); }\n  }\n}\n\n// same 3x3 kernel as gaussian_blur: center 8, adjacents 2, diagonals 1, normalized by 20\nfn blur_from_tile(layer: u32, local: vec2i) -> f32 {\n  let c = (local.y + 1) * BLUR_TILE + local.x + 1;\n  let t = &blur_tile[layer];\n  return (\n    2.0 * ((*t)[c - 1] + (*t)[c + 1] + (*t)[c - BLUR_TILE] + (*t)[c + BLUR_TILE]) +\n    (*t)[c - BLUR_TILE - 1] + (*t)[c - BLUR_TILE + 1] + (*t)[c + BLUR_TILE - 1] + (*t)[c + BLUR_TILE + 1] +\n    8.0 * (*t)[c]\n  ) / 20.0;\n}\n\n@compute @workgroup_size(16, 16)\nfn update_textures(@builtin(global_invocation_id) id : vec3u, @builtin(workgroup_id) wid : vec3u, @builtin(local_invocation_index) li : u32) {\n  let origin = vec2i(wid.xy) * 16 - 1;\n  for (var k = li; k < BLUR_TILE * BLUR_TILE; k += 256u) {\n    let q = origin + vec2i(i32(k % BLUR_TILE), i32(k / BLUR_TILE));\n    for (var layer = 0u; layer < BLUR_LAYERS; layer++) {\n      blur_tile[layer][k] = load_blur_layer(layer, q);\n    }\n  }\n  workgroupBarrier();\n\n  let p = vec2i(id.xy);\n  if (any(p >= canvas.size)) {\n    return;\n  }\n  let local = p - origin - 1;\n\n  // blur and decay in one pass; the particles only read these fields after both\n  store_texture(steric_potential, STIGMERGYMONOMER, p, 0.997*blur_from_tile(0u, local));\n  store_texture(steric_potential, STIGMERGYPOLYMER, p, 0.75*blur_from_tile(1u, local));\n  store_texture(steric_potential, STIGMERGYMEMBRANE, p, 0.95*blur_from_tile(2u, local));\n  // fast decay keeps the polymerization field local, so sprout sites make thin protrusions instead of broad bulges\n  store_texture(parameter_fields, CONNECTION_PROBABILITY, p, controls.polymerizationFieldDecay*blur_from_tile(3u, local));\n  store_texture(parameter_fields, LAMELLIPODIUM, p, controls.lamellipodiumFieldDecay*blur_from_tile(4u, local));\n}\n\n// layers only used for rendering; cleared once per frame, before the frame's last step\n@compute @workgroup_size(16, 16)\nfn clear_render_layers(@builtin(global_invocation_id) id : vec3u) {\n  let p = vec2i(id.xy);\n\n  store_texture_index(SEGMENT_INDEX, p, 0);\n  store_texture(parameter_fields, DEBUG, p, 0.0);\n  if(controls.colourAge!=0u){store_texture(parameter_fields,ACTIN_AGE,p,0.0);}\n  store_texture(parameter_fields, RECENCY, p, 0.99*load_texture(parameter_fields, RECENCY, p)); // ~0.9995 per step at 20 steps per frame\n}\n\n@compute @workgroup_size(WGSZ)\nfn reset_membrane(@builtin(global_invocation_id) id : vec3u) {\n  let count = arrayLength(&membrane);\n  let idx = id.x;\n  \n  if (idx >= count) {\n    return;\n  }\n\n  \n  let center = vec2<f32>(canvas.size) * 0.5;\n  // start at rest length, so the membrane begins relaxed instead of collapsing from far outside the actin\n  let radius = f32(count) * controls.membraneRestLength / (2.0 * PI);\n  let angle =  2 * PI * f32(idx) / f32(count);\n  membrane[idx].id = idx;\n  membrane[idx].subtype = MEMBRANE;\n  membrane[idx].position.x = center.x + radius * cos(angle);\n  membrane[idx].position.y = center.y + radius * sin(angle);\n\n  membrane[idx].orientation.x = -sin(angle);\n  membrane[idx].orientation.y = cos(angle);\n\n  membrane[idx].tail = (idx + count + 1) % count;\n  membrane[idx].head = (idx + count - 1) % count;\n  membrane[idx].arc_length = f32(idx);\n  membrane[idx].age = 0.0;\n  \n\n}\n\n@compute @workgroup_size(WGSZ)\nfn reset_actin(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n\n  // actines\n  let center = vec2<f32>(canvas.size) * 0.5;\n  let radius = min(center.x, center.y) * 0.5;\n  // distribute around a circle\n  let current_angle = random_uniform(idx) * 2.0 * PI;\n  let normalized_radius = sqrt(random_uniform(idx)) * radius * 0.3;\n\n  let xt = center.x + normalized_radius * cos(current_angle);\n  let yt = center.y + normalized_radius * sin(current_angle);\n  actines[idx].position = vec2<f32>(xt, yt);\n\n  let random_angle = random_uniform(idx);\n  actines[idx].orientation = vec2<f32>(cos(random_angle * 2.0 * PI), sin(random_angle * 2.0 * PI));\n\n  actines[idx].id = idx;\n  actines[idx].subtype = ACTIN;\n\n  actines[idx].head = idx;\n  actines[idx].tail = idx;\n  actines[idx].age = 0.0;\n}\n";

/***/ }),

/***/ "./src/simulate.ts":
/*!*************************!*\
  !*** ./src/simulate.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createSimulationPipelines: () => (/* binding */ createSimulationPipelines),
/* harmony export */   runContactRepair: () => (/* binding */ runContactRepair),
/* harmony export */   runEnclosure: () => (/* binding */ runEnclosure),
/* harmony export */   runSimulationStep: () => (/* binding */ runSimulationStep)
/* harmony export */ });
function createSimulationPipelines(device, module, layout) {
    return {
        resolveCue: device.createComputePipeline({ layout, compute: { module, entryPoint: "resolve_front_cue" } }),
        drawCue: device.createComputePipeline({ layout, compute: { module, entryPoint: "draw_resolved_cue" } }),
        measureEnclosure: device.createComputePipeline({ layout, compute: { module, entryPoint: "measure_enclosure" } }),
        buildEnclosureRows: device.createComputePipeline({ layout, compute: { module, entryPoint: "build_enclosure_rows" } }),
        drawReservoir: device.createComputePipeline({ layout, compute: { module, entryPoint: "draw_reservoir_compartment" } }),
        projectEnclosureArea: device.createComputePipeline({ layout, compute: { module, entryPoint: "project_enclosure_area" } }),
        containFilamentPoints: device.createComputePipeline({ layout, compute: { module, entryPoint: "contain_filament_points" } }),
        containFilamentBonds: device.createComputePipeline({ layout, compute: { module, entryPoint: "contain_filament_bonds" } }),
        snapshotMechanics: device.createComputePipeline({ layout, compute: { module, entryPoint: "snapshot_mechanics" } }),
        motorLinks: device.createComputePipeline({ layout, compute: { module, entryPoint: "motor_links" } }),
        membraneTethers: device.createComputePipeline({ layout, compute: { module, entryPoint: "membrane_tethers" } }),
        applyMechanicalForces: device.createComputePipeline({ layout, compute: { module, entryPoint: "apply_mechanical_forces" } }),
        drawMechanicalLinks: device.createComputePipeline({ layout, compute: { module, entryPoint: "draw_mechanical_links" } }),
        lineConstraint: device.createComputePipeline({ layout, compute: { module, entryPoint: "line_constraint_updates" } }),
        membraneTangentialFlow: device.createComputePipeline({ layout, compute: { module, entryPoint: "membrane_tangential_flow" } }),
        orientationUpdate: device.createComputePipeline({ layout, compute: { module, entryPoint: "orientation_updates" } }),
        cosseratUpdate: device.createComputePipeline({ layout, compute: { module, entryPoint: "cosserat_updates" } }),
        resetActin: device.createComputePipeline({ layout, compute: { module, entryPoint: "reset_actin" } }),
        resetMembrane: device.createComputePipeline({ layout, compute: { module, entryPoint: "reset_membrane" } }),
        stericForceUpdate: device.createComputePipeline({ layout, compute: { module, entryPoint: "steric_force_updates" } }),
        actinBind: device.createComputePipeline({ layout, compute: { module, entryPoint: "bind_actin_monomer" } }),
        actinPolymerPosition: device.createComputePipeline({ layout, compute: { module, entryPoint: "update_actin_polymer_position" } }),
        actinMonomerPosition: device.createComputePipeline({ layout, compute: { module, entryPoint: "update_actin_monomer_position" } }),
        unbindMinPole: device.createComputePipeline({ layout, compute: { module, entryPoint: "unbind_min_pole" } }),
        membraneToTextures: device.createComputePipeline({ layout, compute: { module, entryPoint: "membrane_to_textures" } }),
        actinesToTextures: device.createComputePipeline({ layout, compute: { module, entryPoint: "actines_to_textures" } }),
        clearRenderLayers: device.createComputePipeline({ layout, compute: { module, entryPoint: "clear_render_layers" } }),
        updateTextures: device.createComputePipeline({ layout, compute: { module, entryPoint: "update_textures" } }),
    };
}
function dispatch(pass, pipeline, x, y = 1) {
    pass.setPipeline(pipeline);
    pass.dispatchWorkgroups(x, y);
}
function runSimulationStep(device, pipelines, bindGroup, workgroupCounts, textureWorkgroupCount, lineConstraintFunction, frameNr, isLastStepOfFrame, enclosure = false, persistentPolarity = false, queryInfo, extensions) {
    // One submission per fixed step. Dispatch order and iteration counts are
    // unchanged; dispatch boundaries retain storage dependencies. Uniform writes
    // remain BEFORE each step submission, so sprouts are not overwritten by the
    // last step's values when several fixed steps share an animation frame.
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass({
        ...(queryInfo?.isFirstStep && {
            timestampWrites: {
                querySet: queryInfo.querySet,
                beginningOfPassWriteIndex: 0,
                endOfPassWriteIndex: 1,
            },
        }),
    });
    pass.setBindGroup(0, bindGroup);
    if (persistentPolarity)
        dispatch(pass, pipelines.measureEnclosure, 1);
    dispatch(pass, pipelines.resolveCue, 1);
    if (isLastStepOfFrame) {
        dispatch(pass, pipelines.clearRenderLayers, ...textureWorkgroupCount);
    }
    dispatch(pass, pipelines.stericForceUpdate, workgroupCounts.MEMBRANE);
    lineConstraintFunction(pass);
    if (enclosure)
        dispatch(pass, pipelines.buildEnclosureRows, Math.ceil((textureWorkgroupCount[1] * 16) / (4 * 256)));
    if (extensions)
        dispatch(pass, extensions.growth, 1);
    dispatch(pass, pipelines.actinBind, workgroupCounts.ACTIN);
    dispatch(pass, pipelines.actinPolymerPosition, workgroupCounts.ACTIN);
    dispatch(pass, pipelines.actinMonomerPosition, workgroupCounts.ACTIN);
    dispatch(pass, pipelines.unbindMinPole, workgroupCounts.ACTIN);
    if (enclosure)
        encodeEnclosure(pass, pipelines, workgroupCounts, textureWorkgroupCount[1] * 16);
    dispatch(pass, pipelines.membraneToTextures, workgroupCounts.MEMBRANE);
    dispatch(pass, pipelines.actinesToTextures, workgroupCounts.ACTIN);
    dispatch(pass, pipelines.updateTextures, ...textureWorkgroupCount);
    const mechanicalCount = workgroupCounts.ACTIN + workgroupCounts.MEMBRANE;
    dispatch(pass, pipelines.snapshotMechanics, mechanicalCount);
    dispatch(pass, pipelines.motorLinks, 1);
    dispatch(pass, pipelines.membraneTethers, workgroupCounts.MEMBRANE);
    if (extensions)
        dispatch(pass, extensions.forces, 1);
    dispatch(pass, pipelines.applyMechanicalForces, mechanicalCount);
    if (enclosure)
        encodeEnclosure(pass, pipelines, workgroupCounts, textureWorkgroupCount[1] * 16);
    if (isLastStepOfFrame)
        dispatch(pass, pipelines.drawMechanicalLinks, 1 + workgroupCounts.MEMBRANE);
    if (isLastStepOfFrame && enclosure)
        dispatch(pass, pipelines.drawReservoir, ...textureWorkgroupCount);
    if (isLastStepOfFrame)
        dispatch(pass, pipelines.drawCue, 1);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
function runEnclosure(device, pipelines, bindGroup, counts, height) {
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setBindGroup(0, bindGroup);
    encodeEnclosure(pass, pipelines, counts, height);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
// Frozen-time correction: no reactions, ages, motors, membrane motion or area
// projection. The caller verifies the full state after each bounded batch.
function runContactRepair(device, pipelines, bindGroup, counts, height, iterations) {
    const encoder = device.createCommandEncoder(), pass = encoder.beginComputePass();
    pass.setBindGroup(0, bindGroup);
    dispatch(pass, pipelines.buildEnclosureRows, Math.ceil(height / (4 * 256)));
    for (let i = 0; i < iterations; i++) {
        dispatch(pass, pipelines.containFilamentPoints, counts.ACTIN);
        dispatch(pass, pipelines.snapshotMechanics, counts.ACTIN + counts.MEMBRANE);
        dispatch(pass, pipelines.containFilamentBonds, counts.ACTIN);
    }
    dispatch(pass, pipelines.containFilamentPoints, counts.ACTIN);
    pass.end();
    device.queue.submit([encoder.finish()]);
}
function encodeEnclosure(pass, pipelines, counts, height) {
    dispatch(pass, pipelines.measureEnclosure, 1);
    dispatch(pass, pipelines.projectEnclosureArea, counts.MEMBRANE);
    // Refresh the measured area after projection for the next reaction step.
    dispatch(pass, pipelines.measureEnclosure, 1);
    dispatch(pass, pipelines.buildEnclosureRows, Math.ceil(height / (4 * 256)));
    dispatch(pass, pipelines.containFilamentPoints, counts.ACTIN);
    for (let iteration = 0; iteration < 2; iteration++) {
        dispatch(pass, pipelines.snapshotMechanics, counts.ACTIN + counts.MEMBRANE);
        dispatch(pass, pipelines.containFilamentBonds, counts.ACTIN);
    }
}


/***/ }),

/***/ "./src/sprouts.ts":
/*!************************!*\
  !*** ./src/sprouts.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MAX_SPROUT_SITES: () => (/* binding */ MAX_SPROUT_SITES),
/* harmony export */   SproutScheduler: () => (/* binding */ SproutScheduler)
/* harmony export */ });
// Schedules short-lived polymerization sites on the membrane, so local protrusions sprout and retract.
// Each slot alternates between on (a site at a fixed membrane position) and off, with random durations,
// so the number of active sites fluctuates. Offsets land in the front 30%; the
// GPU maps them into the selected polarity frame without extra RNG draws.
const MAX_SPROUT_SITES = 8;
// half of the front region where sites can land, in normalized arc length (0.15 = front 30% of the membrane)
const FRONT_HALF_WIDTH = 0.15;
class SproutScheduler {
    random;
    slots = [];
    constructor(staggerSteps, random = Math.random) {
        this.random = random;
        for (let i = 0; i < MAX_SPROUT_SITES; i++) {
            // stagger the first switch-on over a whole on/off cycle so the sites don't all start together
            this.slots.push({ center: 0, onUntil: 0, offUntil: this.random() * staggerSteps });
        }
    }
    // Writes [center (normalized arc length), halfWidth (nodes), strength, 0] per slot into `out`.
    update(step, params, out) {
        for (let i = 0; i < MAX_SPROUT_SITES; i++) {
            const slot = this.slots[i];
            if (step >= slot.offUntil && step >= slot.onUntil) {
                slot.center = sampleCenter(params.sproutFrontBias, this.random);
                slot.onUntil = step + params.sproutOnSteps * (0.5 + this.random());
                slot.offUntil = slot.onUntil + params.sproutOffSteps * (0.5 + this.random());
            }
            const active = i < params.sproutCount && step < slot.onUntil;
            out.set([slot.center, params.sproutWidth * 0.5, active ? 1 : 0, 0], i * 4);
        }
    }
}
// Near the front (arc length 0) with probability `frontBias`, anywhere in the front region otherwise.
function sampleCenter(frontBias, random) {
    let offset = (random() - 0.5) * 2 * FRONT_HALF_WIDTH;
    if (random() < frontBias) {
        const gaussian = Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
        offset = Math.max(-FRONT_HALF_WIDTH, Math.min(FRONT_HALF_WIDTH, gaussian * 0.08));
    }
    return (offset + 1) % 1;
}


/***/ }),

/***/ "./src/telemetry-analysis.ts":
/*!***********************************!*\
  !*** ./src/telemetry-analysis.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TELEMETRY_COUNTERS: () => (/* binding */ TELEMETRY_COUNTERS),
/* harmony export */   TelemetryAnalysis: () => (/* binding */ TelemetryAnalysis)
/* harmony export */ });
/* harmony import */ var _occupancy__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./occupancy */ "./src/occupancy.ts");
// Pure full-snapshot diagnostics. Runs in the bounded worker, with no DOM or
// GPU access. Geometry checks, topology walks and counter semantics are shared
// by live diagnostics and every forced scientific-assay checkpoint.

const SEGMENT_WORDS = 10; // id, subtype, position(2), orientation(2), tail, head, arc_length, age
const TAIL = 6;
const HEAD = 7;
// must match the TELEMETRY_* indices in simulate.wgsl
const TELEMETRY_COUNTERS = [
    "candidates", // free monomers in the polymerization field
    "neighborFound", // ... that saw an available head or monomer nearby
    "passedProb", // ... and passed the bind probability
    "bound", // ... and won both locks
    "unbound", // minus-end depolymerizations
    "elongated", // binds onto an existing filament's plus end (bound minus elongated = new dimers)
    "headsInField", // plus ends in the polymerization field, i.e. able to elongate
    "headFound", // candidates that saw such a plus end nearby
    "branched", // new branches nucleated on the side of a filament (lamellipodium field)
    "debranched", // branches that came off their mother
    "pointContacts",
    "bondContacts",
    "rearMinusLoss",
    "frontMinusLoss",
    "rearPlusLoss",
    "tetherReleased",
];
const HISTOGRAM_EDGES = [2, 4, 8, 16, 32, 64];
class TelemetryAnalysis {
    actinCount;
    membraneCount;
    membraneRestLength;
    run;
    wellMixed;
    lastCounters = null;
    lastStep = 0;
    constructor(actinCount, membraneCount, membraneRestLength, run, wellMixed = false) {
        this.actinCount = actinCount;
        this.membraneCount = membraneCount;
        this.membraneRestLength = membraneRestLength;
        this.run = run;
        this.wellMixed = wellMixed;
    }
    reset() {
        this.lastCounters = null;
        this.lastStep = 0;
    }
    analyze(actin, membraneData, counterData, frame, step, equilibriumLineDistance, verification = false) {
        const previousCounters = this.lastCounters, previousStep = this.lastStep;
        const words = new Uint32Array(actin);
        const floats = new Float32Array(words.buffer);
        const counters = Array.from(new Uint32Array(counterData));
        const membrane = new Float32Array(membraneData);
        const cell = this.cellShape(membrane);
        const stats = this.compute(words, floats, counters, frame, step, equilibriumLineDistance, cell);
        const inside = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonOccupancy)(membrane, SEGMENT_WORDS, this.wellMixed);
        const crossing = this.wellMixed ? (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonBondCrossing)(membrane) : null;
        for (let i = 0; i < this.actinCount; i++) {
            const disconnected = words[i * SEGMENT_WORDS + TAIL] === i && words[i * SEGMENT_WORDS + HEAD] === i;
            if (this.wellMixed && disconnected)
                continue; // reservoir entries have no spatial coordinates
            const tail = words[i * SEGMENT_WORDS + TAIL];
            if (crossing &&
                tail !== i &&
                crossing(floats[i * SEGMENT_WORDS + 2], floats[i * SEGMENT_WORDS + 3], floats[tail * SEGMENT_WORDS + 2], floats[tail * SEGMENT_WORDS + 3]))
                stats.crossingFilamentBonds++;
            if (!inside(floats[i * SEGMENT_WORDS + 2], floats[i * SEGMENT_WORDS + 3]))
                continue;
            if (words[i * SEGMENT_WORDS + TAIL] === i && words[i * SEGMENT_WORDS + HEAD] === i)
                stats.insideMonomerBeads++;
            else
                stats.insidePolymerBeads++;
        }
        stats.gActinConcentration = this.wellMixed ? stats.gActinAmount / ((cell.area * (this.membraneCount * this.membraneRestLength) ** 2) / (4 * Math.PI)) : 0;
        stats.diagnosticKind = verification ? "contact-recheck" : "simulation";
        if (verification) {
            this.lastCounters = previousCounters;
            this.lastStep = previousStep;
        }
        return stats;
    }
    cellShape(floats) {
        const n = this.membraneCount;
        const x = (i) => floats[i * SEGMENT_WORDS + 2];
        const y = (i) => floats[i * SEGMENT_WORDS + 3];
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        // area-weighted centroid (shoelace)
        let area = 0;
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < n; i++) {
            left = Math.min(left, x(i));
            right = Math.max(right, x(i));
            top = Math.min(top, y(i));
            bottom = Math.max(bottom, y(i));
            const j = (i + 1) % n;
            const cross = x(i) * y(j) - x(j) * y(i);
            area += cross / 2;
            cx += (x(i) + x(j)) * cross;
            cy += (y(i) + y(j)) * cross;
        }
        const rear = n >> 1;
        const quarterSpacing = (center) => {
            let sum = 0;
            for (let k = -(n >> 3); k < n >> 3; k++) {
                const i = (center + k + n) % n;
                const j = (i + 1) % n;
                sum += Math.hypot(x(j) - x(i), y(j) - y(i));
            }
            return sum / (n >> 2) / this.membraneRestLength;
        };
        const restArea = (n * this.membraneRestLength) ** 2 / (4 * Math.PI);
        return {
            left,
            right,
            top,
            bottom,
            frontX: x(0),
            rearX: x(rear),
            centroidX: cx / (6 * area),
            centroidY: cy / (6 * area),
            length: Math.hypot(x(0) - x(rear), y(0) - y(rear)),
            area: Math.abs(area) / restArea,
            frontSpacing: quarterSpacing(0),
            rearSpacing: quarterSpacing(rear),
        };
    }
    compute(words, floats, counters, frame, step, restLength, cell) {
        const n = this.actinCount;
        const visited = new Uint8Array(n);
        const lengths = [];
        let monomers = 0;
        let brokenLinks = 0;
        let cycles = 0;
        let branches = 0;
        let posteriorPolymerBeads = 0;
        let ageSum = 0, maxAge = 0;
        const bondLengths = [];
        const bendAngles = [];
        for (let i = 0; i < n; i++) {
            const tail = words[i * SEGMENT_WORDS + TAIL];
            const head = words[i * SEGMENT_WORDS + HEAD];
            if (tail === i && head === i) {
                monomers++;
                continue;
            }
            const age = floats[i * SEGMENT_WORDS + 9];
            ageSum += age;
            maxAge = Math.max(maxAge, age);
            if (floats[i * SEGMENT_WORDS + 2] < (cell.frontX + cell.rearX) / 2)
                posteriorPolymerBeads++;
            if (head !== i && words[head * SEGMENT_WORDS + TAIL] !== i) {
                brokenLinks++;
            }
            // a branch root's tail is its mother, whose head points elsewhere along the mother filament
            const isBranchRoot = tail !== i && words[tail * SEGMENT_WORDS + HEAD] !== i;
            if (tail !== i && !isBranchRoot) {
                continue;
            }
            branches += isBranchRoot ? 1 : 0;
            // a minus end or branch root: walk to the plus end
            let length = 1;
            let current = i;
            let prevDx = 0;
            let prevDy = 0;
            visited[i] = 1;
            while (true) {
                const next = words[current * SEGMENT_WORDS + HEAD];
                if (next === current)
                    break;
                if (visited[next]) {
                    cycles++;
                    break;
                }
                const dx = floats[next * SEGMENT_WORDS + 2] - floats[current * SEGMENT_WORDS + 2];
                const dy = floats[next * SEGMENT_WORDS + 3] - floats[current * SEGMENT_WORDS + 3];
                bondLengths.push(Math.hypot(dx, dy));
                if (length > 1) {
                    bendAngles.push((Math.abs(Math.atan2(prevDx * dy - prevDy * dx, prevDx * dx + prevDy * dy)) * 180) / Math.PI);
                }
                prevDx = dx;
                prevDy = dy;
                visited[next] = 1;
                current = next;
                length++;
            }
            lengths.push(length);
        }
        lengths.sort((a, b) => a - b);
        const inPolymer = lengths.reduce((sum, l) => sum + l, 0);
        const histogram = new Array(HISTOGRAM_EDGES.length + 1).fill(0);
        for (const l of lengths) {
            const bin = HISTOGRAM_EDGES.findIndex((edge) => l <= edge);
            histogram[bin === -1 ? HISTOGRAM_EDGES.length : bin]++;
        }
        const steps = Math.max(1, step - this.lastStep);
        const perStep = Object.fromEntries(TELEMETRY_COUNTERS.map((name, k) => [name, this.lastCounters ? (counters[k] - this.lastCounters[k]) / steps : 0]));
        this.lastCounters = counters;
        this.lastStep = step;
        const quantile = (q) => (lengths.length ? lengths[Math.min(lengths.length - 1, Math.floor(q * lengths.length))] : 0);
        return {
            run: this.run,
            frame,
            step,
            actinCount: n,
            monomers,
            filaments: lengths.length,
            branches,
            inPolymer,
            posteriorPolymerBeads,
            insidePolymerBeads: 0,
            insideMonomerBeads: 0,
            gActinMode: this.wellMixed ? "well-mixed" : "particles",
            gActinAmount: monomers,
            gActinConcentration: 0,
            actinBalanceError: monomers + inPolymer - n,
            crossingFilamentBonds: 0,
            meanPolymerAge: n > monomers ? ageSum / (n - monomers) : 0,
            maxPolymerAge: maxAge,
            meanLength: lengths.length ? inPolymer / lengths.length : 0,
            medianLength: quantile(0.5),
            p90Length: quantile(0.9),
            maxLength: lengths.length ? lengths[lengths.length - 1] : 0,
            histogram,
            medianBondLength: bondLengths.length ? bondLengths.sort((a, b) => a - b)[bondLengths.length >> 1] / restLength : 0,
            medianBendAngle: bendAngles.length ? bendAngles.sort((a, b) => a - b)[bendAngles.length >> 1] : 0,
            brokenLinks,
            cycles,
            perStep,
            cell,
        };
    }
}


/***/ }),

/***/ "./src/telemetry.ts":
/*!**************************!*\
  !*** ./src/telemetry.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ActinTelemetry: () => (/* binding */ ActinTelemetry),
/* harmony export */   TELEMETRY_COUNTERS: () => (/* reexport safe */ _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__.TELEMETRY_COUNTERS)
/* harmony export */ });
/* harmony import */ var _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./telemetry-analysis */ "./src/telemetry-analysis.ts");


// One in-flight readback/worker job. Every forced assay checkpoint waits for a
// fresh full analysis; interactive requests coalesce while the worker is busy.
class ActinTelemetry {
    device;
    actinBuffer;
    membraneBuffer;
    run;
    intervalFrames;
    wellMixed;
    counterBuffer;
    actinStaging;
    counterStaging;
    membraneStaging;
    pending = null;
    worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u(0), __webpack_require__.b), { type: undefined });
    job = null;
    workerFailure = null;
    nextId = 0;
    display;
    summary;
    postToServer = new URLSearchParams(location.search).get("telemetry") === "1";
    history = [];
    onSample;
    timings = { readbackMs: 0, analysisMs: 0, workerRoundTripMs: 0, totalMs: 0, coalescedAutomaticSamples: 0 };
    constructor(device, actinBuffer, actinCount, membraneBuffer, membraneCount, membraneRestLength, run, intervalFrames = 30, wellMixed = false) {
        this.device = device;
        this.actinBuffer = actinBuffer;
        this.membraneBuffer = membraneBuffer;
        this.run = run;
        this.intervalFrames = intervalFrames;
        this.wellMixed = wellMixed;
        this.counterBuffer = device.createBuffer({
            label: "Telemetry counters",
            size: 4 * _telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__.TELEMETRY_COUNTERS.length,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
        });
        const staging = (size) => device.createBuffer({ size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        this.actinStaging = staging(actinBuffer.size);
        this.counterStaging = staging(this.counterBuffer.size);
        this.membraneStaging = staging(membraneBuffer.size);
        this.worker.onmessage = ({ data }) => {
            const job = this.job;
            if (!job || job.id !== data.id)
                return;
            this.job = null;
            if (data.error)
                job.reject(new Error(data.error));
            else
                job.resolve(data);
        };
        this.worker.onerror = (event) => {
            this.workerFailure = new Error(`Diagnostic worker: ${event.message}`);
            this.job?.reject(this.workerFailure);
            this.job = null;
        };
        this.worker.postMessage({ type: "init", config: [actinCount, membraneCount, membraneRestLength, run, wellMixed] });
        const details = Object.assign(document.createElement("details"), { id: "diagnostics" });
        Object.assign(details.style, {
            position: "fixed",
            left: "10px",
            bottom: "10px",
            padding: "6px",
            color: "white",
            font: "11px monospace",
            background: "rgba(0,0,0,.8)",
            zIndex: "1000",
            maxWidth: "calc(100vw - 32px)",
        });
        this.summary = document.createElement("summary");
        this.summary.textContent = "Full numerical diagnostics · worker";
        this.display = Object.assign(document.createElement("pre"), { id: "actinTelemetry" });
        Object.assign(this.display.style, { maxHeight: "220px", overflow: "auto", margin: "6px 0 0" });
        details.append(this.summary, this.display);
        document.body.append(details);
        window.actinTelemetry = this;
        window.addEventListener("pagehide", (event) => {
            if (!event.persisted)
                this.worker.terminate();
        });
    }
    reset() {
        this.device.queue.writeBuffer(this.counterBuffer, 0, new Uint32Array(_telemetry_analysis__WEBPACK_IMPORTED_MODULE_0__.TELEMETRY_COUNTERS.length));
        this.worker.postMessage({ type: "reset" });
        this.history.length = 0;
    }
    async update(frame, step, rest, force = false, verification = false) {
        if (!force && frame % this.intervalFrames !== 0)
            return;
        if (this.pending) {
            if (!force) {
                this.timings.coalescedAutomaticSamples++;
                return;
            }
            await this.pending; // never return an old snapshot for an exact-step assay
        }
        if (this.workerFailure)
            throw this.workerFailure;
        const promise = this.capture(frame, step, rest, verification);
        this.pending = promise;
        try {
            await promise;
        }
        finally {
            if (this.pending === promise)
                this.pending = null;
        }
    }
    async capture(frame, step, rest, verification = false) {
        const start = performance.now();
        const encoder = this.device.createCommandEncoder();
        encoder.copyBufferToBuffer(this.actinBuffer, 0, this.actinStaging, 0, this.actinStaging.size);
        encoder.copyBufferToBuffer(this.counterBuffer, 0, this.counterStaging, 0, this.counterStaging.size);
        encoder.copyBufferToBuffer(this.membraneBuffer, 0, this.membraneStaging, 0, this.membraneStaging.size);
        this.device.queue.submit([encoder.finish()]);
        const stages = [this.actinStaging, this.membraneStaging, this.counterStaging];
        let copies;
        try {
            const mapped = await Promise.allSettled(stages.map((buffer) => buffer.mapAsync(GPUMapMode.READ)));
            const failed = mapped.find((result) => result.status === "rejected");
            if (failed?.status === "rejected")
                throw failed.reason;
            copies = stages.map((buffer) => buffer.getMappedRange().slice(0));
        }
        finally {
            for (const buffer of stages)
                if (buffer.mapState === "mapped")
                    buffer.unmap();
        }
        this.timings.readbackMs = performance.now() - start;
        const workerStart = performance.now(), id = ++this.nextId;
        const result = await new Promise((resolve, reject) => {
            this.job = { id, resolve, reject };
            this.worker.postMessage({ type: "analyze", id, actin: copies[0], membrane: copies[1], counters: copies[2], frame, step, rest, verification }, copies);
        });
        this.timings.workerRoundTripMs = performance.now() - workerStart;
        this.timings.analysisMs = result.analysisMs;
        this.timings.totalMs = performance.now() - start;
        const s = result.stats;
        this.history.push(s);
        if (this.history.length > 1024)
            this.history.shift();
        this.show(s);
        this.onSample?.(s);
        if (this.postToServer)
            fetch("/__telemetry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) }).then((r) => (this.postToServer = r.ok), () => (this.postToServer = false));
    }
    show(s) {
        const c = s.cell, r = s.perStep;
        this.summary.textContent = `Checked step ${s.step} · mass error ${s.actinBalanceError} · F inside ${s.insidePolymerBeads}/${s.inPolymer} · area ${c.area.toFixed(4)} · worker ${this.timings.analysisMs.toFixed(0)} ms`;
        this.display.textContent = [
            `filaments ${s.filaments} (branches ${s.branches}) · polymer ${((100 * s.inPolymer) / s.actinCount).toFixed(1)}%`,
            `length mean ${s.meanLength.toFixed(1)} median ${s.medianLength} p90 ${s.p90Length} max ${s.maxLength}`,
            `polymer age mean ${s.meanPolymerAge.toFixed(0)} max ${s.maxPolymerAge.toFixed(0)} fixed steps`,
            `hist [2|3-4|5-8|9-16|17-32|33-64|65+] ${s.histogram.join(" ")}`,
            `bond/rest ${s.medianBondLength.toFixed(2)} · bend ${s.medianBendAngle.toFixed(1)}° · broken ${s.brokenLinks} · cycles ${s.cycles}`,
            `events/step ${Object.entries(r)
                .map(([k, v]) => `${k}:${v.toFixed(3)}`)
                .join(" ")}`,
            `x bounds ${c.left.toFixed(1)}–${c.right.toFixed(1)} · material markers ${c.rearX.toFixed(1)}/${c.frontX.toFixed(1)} · centroid ${c.centroidX.toFixed(1)},${c.centroidY.toFixed(1)}`,
            `length ${c.length.toFixed(1)} · area ${c.area.toFixed(6)} · spacing front/rear ${c.frontSpacing.toFixed(2)}/${c.rearSpacing.toFixed(2)}`,
            this.wellMixed
                ? `G pool ${s.gActinAmount} (${s.gActinConcentration.toFixed(3)}/px²) · crossing bonds ${s.crossingFilamentBonds}`
                : `inside: ${s.insidePolymerBeads} F + ${s.insideMonomerBeads} G beads`,
            `legacy marker-x half polymer ${s.posteriorPolymerBeads} · readback ${this.timings.readbackMs.toFixed(1)} ms · worker round trip ${this.timings.workerRoundTripMs.toFixed(1)} ms`,
        ].join("\n");
    }
    snapshot(frame, canvas) {
        const every = Number(new URLSearchParams(location.search).get("snapshotEvery"));
        if (!every || frame % every !== 0)
            return;
        canvas.toBlob((blob) => blob && fetch(`/__snapshot?name=${encodeURIComponent(`${this.run}-${frame}`)}`, { method: "POST", body: blob }));
    }
}


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PerformanceMonitor: () => (/* binding */ PerformanceMonitor),
/* harmony export */   configureCanvas: () => (/* binding */ configureCanvas),
/* harmony export */   createPerformanceQueries: () => (/* binding */ createPerformanceQueries),
/* harmony export */   createShader: () => (/* binding */ createShader),
/* harmony export */   getRandomValues: () => (/* binding */ getRandomValues),
/* harmony export */   requestDevice: () => (/* binding */ requestDevice),
/* harmony export */   setupInteractions: () => (/* binding */ setupInteractions),
/* harmony export */   setupTextures: () => (/* binding */ setupTextures)
/* harmony export */ });
function throwDetectionError(error) {
    const notice = document.querySelector(".webgpu-not-supported");
    if (notice)
        notice.style.visibility = "visible";
    throw new Error("Could not initialize WebGPU: " + error);
}
async function requestDevice(options = {
    powerPreference: "high-performance",
}, requiredFeatures = [], requiredLimits = {
    maxStorageTexturesPerShaderStage: 8,
}) {
    if (!navigator.gpu)
        throwDetectionError("WebGPU NOT Supported");
    const adapter = await navigator.gpu.requestAdapter(options);
    if (!adapter)
        throwDetectionError("No GPU adapter found");
    const canTimestamp = adapter.features.has("timestamp-query");
    const features = [...requiredFeatures];
    if (canTimestamp) {
        features.push("timestamp-query");
    }
    // Instead of passing a record that might have undefined values, filter them out:
    const limits = Object.fromEntries(Object.entries(requiredLimits).filter(([key, value]) => value !== undefined));
    // Then use the filtered limits object:
    return adapter.requestDevice({
        requiredFeatures: features,
        requiredLimits: limits,
        ...(canTimestamp ? ["timestamp-query"] : []),
    });
}
function configureCanvas(device, id, size = { width: window.innerWidth, height: window.innerHeight }) {
    const canvas = Object.assign(document.createElement("canvas"), size);
    canvas.id = id;
    document.body.appendChild(canvas);
    const context = canvas.getContext("webgpu");
    if (!context)
        throwDetectionError("Canvas does not support WebGPU");
    const format = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
        device: device,
        format: format,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
        alphaMode: "premultiplied",
    });
    return { canvas: canvas, context: context, format: format, size: size };
}
async function createShader(device, code, includes) {
    // Process the code with imports
    const processedCode = prependIncludes(code, includes);
    const module = device.createShaderModule({ code: processedCode });
    const info = await module.getCompilationInfo();
    if (info.messages.length > 0) {
        for (let message of info.messages) {
            console.warn(`${message.message} 
  at line ${message.lineNum}`);
        }
        throw new Error(`Could not compile shader`);
    }
    return module;
}
/**
 * Process import statements in shader code to include the content of referenced modules
 * @param code - The shader code containing import statements
 * @param includes - Optional mapping of module names to their content
 * @returns The processed shader code with imports resolved
 */
function prependIncludes(code, includes) {
    // Extract import statements
    const importRegex = /^#import\s+([a-zA-Z0-9_]+)::([a-zA-Z0-9_]+)/gm;
    const imports = [...code.matchAll(importRegex)];
    // Build a map of imports to their content
    const includesToAdd = {};
    // Process each import
    for (const [fullMatch, namespace, moduleName] of imports) {
        if (namespace === "includes" && includes && moduleName in includes) {
            includesToAdd[fullMatch] = includes[moduleName];
        }
        else {
            console.warn(`Could not resolve import: ${fullMatch}`);
        }
    }
    // Replace import statements with their content
    let processedCode = code;
    for (const [importStatement, content] of Object.entries(includesToAdd)) {
        // Replace the import statement with the content
        processedCode = processedCode.replace(importStatement, content);
    }
    return processedCode;
}
async function createPerformanceQueries(device) {
    const canTimestamp = device.features.has("timestamp-query");
    // if (!canTimestamp) {
    //   console.warn("Timestamp queries are not supported by this device.");
    //   return {};
    // }
    const querySet = device.createQuerySet({
        type: "timestamp",
        count: 2,
    });
    const resolveBuffer = device.createBuffer({
        size: querySet.count * 8,
        usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
    });
    const resultBuffer = device.createBuffer({
        size: resolveBuffer.size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
    return { querySet, resolveBuffer, resultBuffer };
}
function setupInteractions(device, canvas, texture, size = 10) {
    let uniformBufferData = new Float32Array(4);
    let controlsBufferData = new ArrayBuffer(336);
    var sign = 1;
    let position = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 };
    uniformBufferData.set([position.x, position.y]);
    if (canvas instanceof HTMLCanvasElement) {
        // disable context menu
        canvas.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        // move events
        ["mousemove", "touchmove"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                const rect = canvas.getBoundingClientRect();
                let clientX = 0;
                let clientY = 0;
                if (event instanceof MouseEvent) {
                    clientX = event.clientX;
                    clientY = event.clientY;
                }
                else if (event instanceof TouchEvent) {
                    if (event.touches.length === 0)
                        return;
                    clientX = event.touches[0].clientX;
                    clientY = event.touches[0].clientY;
                }
                position.x = clientX - rect.left;
                position.y = clientY - rect.top;
                // Scale from CSS pixels to texture coordinates
                const x = Math.floor((position.x / rect.width) * texture.width);
                const y = Math.floor((position.y / rect.height) * texture.height);
                uniformBufferData.set([x, y]);
            }, { passive: true });
        });
        // zoom events TODO(@gszep) add pinch and scroll for touch devices
        ["wheel"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                switch (true) {
                    case event instanceof WheelEvent:
                        velocity.x = event.deltaY;
                        velocity.y = event.deltaY;
                        break;
                }
                size += velocity.y;
                uniformBufferData.set([size], 2);
            }, { passive: true });
        });
        // click events TODO(@gszep) implement right click equivalent for touch devices
        ["mousedown", "touchstart"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                switch (true) {
                    case event instanceof MouseEvent:
                        sign = 1 - event.button;
                        break;
                    case event instanceof TouchEvent:
                        sign = event.touches.length > 1 ? -1 : 1;
                }
                uniformBufferData.set([sign * size], 2);
            }, { passive: true });
        });
        ["mouseup", "touchend"].forEach((type) => {
            canvas.addEventListener(type, (event) => {
                uniformBufferData.set([NaN], 2);
            }, { passive: true });
        });
    }
    const uniformBuffer = device.createBuffer({
        label: "Interaction Buffer",
        size: uniformBufferData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    const controlsBuffer = device.createBuffer({
        label: "Controls Buffer",
        size: controlsBufferData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    return {
        interactions: { data: uniformBufferData, buffer: uniformBuffer },
        controls: { data: controlsBufferData, buffer: controlsBuffer },
        type: "uniform",
    };
}
function setupTextures(device, bindings, data, size, format) {
    const textures = {};
    const bindingLayout = {};
    const depthOrArrayLayers = size.depthOrArrayLayers || {};
    const DEFAULT_FORMAT = "r32float";
    bindings.forEach((key) => {
        textures[key] = device.createTexture({
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
            format: format && key in format ? format[key] : DEFAULT_FORMAT,
            size: {
                width: size.width,
                height: size.height,
                depthOrArrayLayers: key in depthOrArrayLayers ? depthOrArrayLayers[key] : 1,
            },
        });
    });
    Object.keys(textures).forEach((key) => {
        const layers = key in depthOrArrayLayers ? depthOrArrayLayers[key] : 1;
        bindingLayout[key] = {
            format: format && key in format ? format[key] : DEFAULT_FORMAT,
            access: "read-write",
            viewDimension: layers > 1 ? "2d-array" : "2d",
        };
        const array = key in data ? new Float32Array(flatten(data[key])) : new Float32Array(size.width * size.height * layers);
        const channels = channelCount(bindingLayout[key].format);
        device.queue.writeTexture({ texture: textures[key] }, 
        /*data=*/ array, 
        /*dataLayout=*/ {
            offset: 0,
            bytesPerRow: size.width * array.BYTES_PER_ELEMENT * channels,
            rowsPerImage: size.height,
        }, 
        /*size=*/ {
            width: size.width,
            height: size.height,
            depthOrArrayLayers: layers,
        });
    });
    let canvasData = new Uint32Array([size.width, size.height, 0, 0, 0, 0]);
    const canvasBuffer = device.createBuffer({
        label: "Canvas Buffer",
        size: canvasData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(canvasBuffer, /*offset=*/ 0, /*data=*/ canvasData);
    return {
        canvas: {
            buffer: canvasBuffer,
            data: canvasData,
            type: "uniform",
        },
        textures: textures,
        bindingLayout: bindingLayout,
        size: size,
    };
}
function channelCount(format) {
    if (format.includes("rgba")) {
        return 4;
    }
    else if (format.includes("rgb")) {
        return 3;
    }
    else if (format.includes("rg")) {
        return 2;
    }
    else if (format.includes("r")) {
        return 1;
    }
    else {
        throw new Error("Invalid format: " + format);
    }
}
function flatten(nestedArray) {
    const flattened = [];
    for (let k = 0; k < nestedArray[0][0].length; k++) {
        for (let i = 0; i < nestedArray.length; i++) {
            for (let j = 0; j < nestedArray[0].length; j++) {
                flattened.push(nestedArray[i][j][k]);
            }
        }
    }
    return flattened;
}
function zeros(height, width, layers = 1) {
    const zeroArray = [];
    for (let i = 0; i < height; i++) {
        const row = [];
        for (let j = 0; j < width; j++) {
            const layer = [];
            for (let k = 0; k < layers; k++) {
                layer.push(0);
            }
            row.push(layer);
        }
        zeroArray.push(row);
    }
    return zeroArray;
}
function getRandomValues(length, random) {
    // fast cpu-side random number generation
    const maxChunkLength = 65536 / 4;
    const result = new Uint32Array(4 * length);
    for (let i = 0; i < 4 * length; i += maxChunkLength) {
        const chunkLength = Math.min(maxChunkLength, 4 * length - i);
        if (random) {
            for (let j = i; j < Math.min(i + chunkLength, result.length); j++)
                result[j] = Math.floor(random() * 4294967296);
        }
        else
            crypto.getRandomValues(result.subarray(i, i + chunkLength));
    }
    return result;
}
class PerformanceMonitor {
    lastTime;
    frameCount;
    framesPerTimeLog;
    fpsDisplay;
    constructor(framesPerTimeLog = 30) {
        this.framesPerTimeLog = framesPerTimeLog;
        this.fpsDisplay = document.getElementById("fpsCounter");
        this.lastTime = performance.now();
        this.frameCount = 0;
    }
    update(time) {
        if (time % this.framesPerTimeLog === 0) {
            const currentTime = performance.now();
            const timeElapsed = currentTime - this.lastTime;
            // FPS Calculation
            const fps = Math.round((this.frameCount * 1000) / timeElapsed);
            this.fpsDisplay.textContent = `FPS: ${fps}`;
            // Reset counters
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
        this.frameCount++;
    }
}


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__("./src/index.ts"));
/******/ }
]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLGNBQWM7QUFDZDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLDhDQUE4QyxFQUFFOztBQUVoRDs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFFO0FBQ0Y7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRixnQkFBZ0IsU0FBUzs7QUFFekI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0EsdURBQXVELElBQUksZ0JBQWdCOztBQUUzRTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU07O0FBRU47O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvREFBb0QsaUJBQWlCO0FBQ3JFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQSx3REFBd0QsaUJBQWlCO0FBQ3pFOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxNQUFNOztBQUVOO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0RBQStELGlCQUFpQjtBQUNoRixxREFBcUQsaUJBQWlCOztBQUV0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLEtBQUs7QUFDbEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLFFBQVEsaUJBQWlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7O0FBRUo7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLGNBQWM7QUFDckQsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFH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QUFDLElBQUksQ0FBQyxFQUMvQyxFQUFFLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQzVCLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztR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USxHQUFHLEVBQUUsQ0FBQztZQUU1QyxpQkFBaUI7WUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUM7UUFDOUIsQ0FBQztRQUNELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNwQixDQUFDO0NBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vbm9kZV9tb2R1bGVzL2xpbC1ndWkvZGlzdC9saWwtZ3VpLmVzbS5qcyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL2NvbnRhY3QtcmVjb3ZlcnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9lbmNsb3N1cmUtdGVzdC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvbWVjaGFuaWNzLXRlc3QudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9vY2N1cGFuY3kudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yYW5kb20udHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yZWFsdGltZS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3JlbmRlci50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3JlbmV3YWwtdGVzdC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3NpbXVsYXRlLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvc3Byb3V0cy50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS1hbmFseXNpcy50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3V0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbGlsLWd1aVxuICogaHR0cHM6Ly9saWwtZ3VpLmdlb3JnZWFsd2F5cy5jb21cbiAqIEB2ZXJzaW9uIDAuMjAuMFxuICogQGF1dGhvciBHZW9yZ2UgTWljaGFlbCBCcm93ZXJcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIGNvbnRyb2xsZXJzLlxuICovXG5jbGFzcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCBjbGFzc05hbWUsIGVsZW1lbnRUeXBlID0gJ2RpdicgKSB7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgR1VJIHRoYXQgY29udGFpbnMgdGhpcyBjb250cm9sbGVyLlxuXHRcdCAqIEB0eXBlIHtHVUl9XG5cdFx0ICovXG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgb2JqZWN0IHRoaXMgY29udHJvbGxlciB3aWxsIG1vZGlmeS5cblx0XHQgKiBAdHlwZSB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbnRyb2wuXG5cdFx0ICogQHR5cGUge3N0cmluZ31cblx0XHQgKi9cblx0XHR0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgY29udHJvbGxlciBpcyBkaXNhYmxlZC5cblx0XHQgKiBVc2UgYGNvbnRyb2xsZXIuZGlzYWJsZSggdHJ1ZXxmYWxzZSApYCB0byBtb2RpZnkgdGhpcyB2YWx1ZS5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9kaXNhYmxlZCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIENvbnRyb2xsZXIgaXMgaGlkZGVuLlxuXHRcdCAqIFVzZSBgY29udHJvbGxlci5zaG93KClgIG9yIGBjb250cm9sbGVyLmhpZGUoKWAgdG8gY2hhbmdlIHRoaXMuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5faGlkZGVuID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgdmFsdWUgb2YgYG9iamVjdFsgcHJvcGVydHkgXWAgd2hlbiB0aGUgY29udHJvbGxlciB3YXMgY3JlYXRlZC5cblx0XHQgKiBAdHlwZSB7YW55fVxuXHRcdCAqL1xuXHRcdHRoaXMuaW5pdGlhbFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG91dGVybW9zdCBjb250YWluZXIgRE9NIGVsZW1lbnQgZm9yIHRoaXMgY29udHJvbGxlci5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggZWxlbWVudFR5cGUgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2NvbnRyb2xsZXInICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGNvbnRyb2xsZXIncyBuYW1lLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiRuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRuYW1lLmNsYXNzTGlzdC5hZGQoICduYW1lJyApO1xuXG5cdFx0Q29udHJvbGxlci5uZXh0TmFtZUlEID0gQ29udHJvbGxlci5uZXh0TmFtZUlEIHx8IDA7XG5cdFx0dGhpcy4kbmFtZS5pZCA9IGBsaWwtZ3VpLW5hbWUtJHsrK0NvbnRyb2xsZXIubmV4dE5hbWVJRH1gO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGNvbnRyb2xsZXIncyBcIndpZGdldFwiICh3aGljaCBkaWZmZXJzIGJ5IGNvbnRyb2xsZXIgdHlwZSkuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmNsYXNzTGlzdC5hZGQoICd3aWRnZXQnICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCByZWNlaXZlcyB0aGUgZGlzYWJsZWQgYXR0cmlidXRlIHdoZW4gdXNpbmcgZGlzYWJsZSgpLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kd2lkZ2V0O1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiRuYW1lICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiR3aWRnZXQgKTtcblxuXHRcdC8vIERvbid0IGZpcmUgZ2xvYmFsIGtleSBldmVudHMgd2hpbGUgdHlwaW5nIGluIGEgY29udHJvbGxlclxuXHRcdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGUgPT4gZS5zdG9wUHJvcGFnYXRpb24oKSApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCkgKTtcblxuXHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnB1c2goIHRoaXMgKTtcblx0XHR0aGlzLnBhcmVudC5jb250cm9sbGVycy5wdXNoKCB0aGlzICk7XG5cblx0XHR0aGlzLnBhcmVudC4kY2hpbGRyZW4uYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXG5cdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2sgPSB0aGlzLl9saXN0ZW5DYWxsYmFjay5iaW5kKCB0aGlzICk7XG5cblx0XHR0aGlzLm5hbWUoIHByb3BlcnR5ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBuYW1lIG9mIHRoZSBjb250cm9sbGVyIGFuZCBpdHMgbGFiZWwgaW4gdGhlIEdVSS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRuYW1lKCBuYW1lICkge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBjb250cm9sbGVyJ3MgbmFtZS4gVXNlIGBjb250cm9sbGVyLm5hbWUoICdOYW1lJyApYCB0byBtb2RpZnkgdGhpcyB2YWx1ZS5cblx0XHQgKiBAdHlwZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuJG5hbWUudGV4dENvbnRlbnQgPSBuYW1lO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIGlzIG1vZGlmaWVkIGJ5IHRoaXMgY29udHJvbGxlci5cblx0ICogVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIHRoZSBuZXcgdmFsdWUgYXMgaXRzIGZpcnN0IHBhcmFtZXRlci4gVGhlIHZhbHVlIG9mIGB0aGlzYCB3aWxsIGJlIHRoZVxuXHQgKiBjb250cm9sbGVyLlxuXHQgKlxuXHQgKiBGb3IgZnVuY3Rpb24gY29udHJvbGxlcnMsIHRoZSBgb25DaGFuZ2VgIGNhbGxiYWNrIHdpbGwgYmUgZmlyZWQgb24gY2xpY2ssIGFmdGVyIHRoZSBmdW5jdGlvblxuXHQgKiBleGVjdXRlcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IGNvbnRyb2xsZXIgPSBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKTtcblx0ICpcblx0ICogY29udHJvbGxlci5vbkNoYW5nZSggZnVuY3Rpb24oIHYgKSB7XG5cdCAqIFx0Y29uc29sZS5sb2coICdUaGUgdmFsdWUgaXMgbm93ICcgKyB2ICk7XG5cdCAqIFx0Y29uc29sZS5hc3NlcnQoIHRoaXMgPT09IGNvbnRyb2xsZXIgKTtcblx0ICogfSApO1xuXHQgKi9cblx0b25DaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25DaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWUgZGlyZWN0bHkuXG5cdFx0ICogVXNlIHRoZSBgY29udHJvbGxlci5vbkNoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbHMgdGhlIG9uQ2hhbmdlIG1ldGhvZHMgb2YgdGhpcyBjb250cm9sbGVyIGFuZCBpdHMgcGFyZW50IEdVSS5cblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0X2NhbGxPbkNoYW5nZSgpIHtcblxuXHRcdHRoaXMucGFyZW50Ll9jYWxsT25DaGFuZ2UoIHRoaXMgKTtcblxuXHRcdGlmICggdGhpcy5fb25DaGFuZ2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX29uQ2hhbmdlLmNhbGwoIHRoaXMsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NoYW5nZWQgPSB0cnVlO1xuXG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciB0aGlzIGNvbnRyb2xsZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGxvc2VzIGZvY3VzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29uc3QgY29udHJvbGxlciA9IGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApO1xuXHQgKlxuXHQgKiBjb250cm9sbGVyLm9uRmluaXNoQ2hhbmdlKCBmdW5jdGlvbiggdiApIHtcblx0ICogXHRjb25zb2xlLmxvZyggJ0NoYW5nZXMgY29tcGxldGU6ICcgKyB2ICk7XG5cdCAqIFx0Y29uc29sZS5hc3NlcnQoIHRoaXMgPT09IGNvbnRyb2xsZXIgKTtcblx0ICogfSApO1xuXHQgKi9cblx0b25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25GaW5pc2hDaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWVcblx0XHQgKiBkaXJlY3RseS4gVXNlIHRoZSBgY29udHJvbGxlci5vbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2hvdWxkIGJlIGNhbGxlZCBieSBDb250cm9sbGVyIHdoZW4gaXRzIHdpZGdldHMgbG9zZSBmb2N1cy5cblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0X2NhbGxPbkZpbmlzaENoYW5nZSgpIHtcblxuXHRcdGlmICggdGhpcy5fY2hhbmdlZCApIHtcblxuXHRcdFx0dGhpcy5wYXJlbnQuX2NhbGxPbkZpbmlzaENoYW5nZSggdGhpcyApO1xuXG5cdFx0XHRpZiAoIHRoaXMuX29uRmluaXNoQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlLmNhbGwoIHRoaXMsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0dGhpcy5fY2hhbmdlZCA9IGZhbHNlO1xuXG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgY29udHJvbGxlciBiYWNrIHRvIGl0cyBpbml0aWFsIHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuaW5pdGlhbFZhbHVlICk7XG5cdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogRW5hYmxlcyB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29udHJvbGxlci5lbmFibGUoKTtcblx0ICogY29udHJvbGxlci5lbmFibGUoIGZhbHNlICk7IC8vIGRpc2FibGVcblx0ICogY29udHJvbGxlci5lbmFibGUoIGNvbnRyb2xsZXIuX2Rpc2FibGVkICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0ZW5hYmxlKCBlbmFibGVkID0gdHJ1ZSApIHtcblx0XHRyZXR1cm4gdGhpcy5kaXNhYmxlKCAhZW5hYmxlZCApO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc2FibGVzIHRoaXMgY29udHJvbGxlci5cblx0ICogQHBhcmFtIHtib29sZWFufSBkaXNhYmxlZFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29udHJvbGxlci5kaXNhYmxlKCk7XG5cdCAqIGNvbnRyb2xsZXIuZGlzYWJsZSggZmFsc2UgKTsgLy8gZW5hYmxlXG5cdCAqIGNvbnRyb2xsZXIuZGlzYWJsZSggIWNvbnRyb2xsZXIuX2Rpc2FibGVkICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0ZGlzYWJsZSggZGlzYWJsZWQgPSB0cnVlICkge1xuXG5cdFx0aWYgKCBkaXNhYmxlZCA9PT0gdGhpcy5fZGlzYWJsZWQgKSByZXR1cm4gdGhpcztcblxuXHRcdHRoaXMuX2Rpc2FibGVkID0gZGlzYWJsZWQ7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSggJ2Rpc2FibGVkJywgZGlzYWJsZWQgKTtcblx0XHR0aGlzLiRkaXNhYmxlLnRvZ2dsZUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgZGlzYWJsZWQgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgdGhlIENvbnRyb2xsZXIgYWZ0ZXIgaXQncyBiZWVuIGhpZGRlbi5cblx0ICogQHBhcmFtIHtib29sZWFufSBzaG93XG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb250cm9sbGVyLnNob3coKTtcblx0ICogY29udHJvbGxlci5zaG93KCBmYWxzZSApOyAvLyBoaWRlXG5cdCAqIGNvbnRyb2xsZXIuc2hvdyggY29udHJvbGxlci5faGlkZGVuICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0c2hvdyggc2hvdyA9IHRydWUgKSB7XG5cblx0XHR0aGlzLl9oaWRkZW4gPSAhc2hvdztcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdGhpcy5faGlkZGVuID8gJ25vbmUnIDogJyc7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBDb250cm9sbGVyLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGhpZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2hvdyggZmFsc2UgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoaXMgY29udHJvbGxlciBpbnRvIGEgZHJvcGRvd24gb2Ygb3B0aW9ucy5cblx0ICpcblx0ICogQ2FsbGluZyB0aGlzIG1ldGhvZCBvbiBhbiBvcHRpb24gY29udHJvbGxlciB3aWxsIHNpbXBseSB1cGRhdGUgdGhlIG9wdGlvbnMuIEhvd2V2ZXIsIGlmIHRoaXNcblx0ICogY29udHJvbGxlciB3YXMgbm90IGFscmVhZHkgYW4gb3B0aW9uIGNvbnRyb2xsZXIsIG9sZCByZWZlcmVuY2VzIHRvIHRoaXMgY29udHJvbGxlciBhcmVcblx0ICogZGVzdHJveWVkLCBhbmQgYSBuZXcgY29udHJvbGxlciBpcyBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBHVUkuXG5cdCAqIEBleGFtcGxlXG5cdCAqIC8vIHNhZmUgdXNhZ2Vcblx0ICpcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDEnICkub3B0aW9ucyggWyAnYScsICdiJywgJ2MnIF0gKTtcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDInICkub3B0aW9ucyggeyBCaWc6IDEwLCBTbWFsbDogMSB9ICk7XG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AzJyApO1xuXHQgKlxuXHQgKiAvLyBkYW5nZXJcblx0ICpcblx0ICogY29uc3QgY3RybDEgPSBndWkuYWRkKCBvYmosICdwcm9wMScgKTtcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDInICk7XG5cdCAqXG5cdCAqIC8vIGNhbGxpbmcgb3B0aW9ucyBvdXQgb2Ygb3JkZXIgYWRkcyBhIG5ldyBjb250cm9sbGVyIHRvIHRoZSBlbmQuLi5cblx0ICogY29uc3QgY3RybDIgPSBjdHJsMS5vcHRpb25zKCBbICdhJywgJ2InLCAnYycgXSApO1xuXHQgKlxuXHQgKiAvLyAuLi5hbmQgY3RybDEgbm93IHJlZmVyZW5jZXMgYSBjb250cm9sbGVyIHRoYXQgZG9lc24ndCBleGlzdFxuXHQgKiBhc3NlcnQoIGN0cmwyICE9PSBjdHJsMSApXG5cdCAqIEBwYXJhbSB7b2JqZWN0fEFycmF5fSBvcHRpb25zXG5cdCAqIEByZXR1cm5zIHtDb250cm9sbGVyfVxuXHQgKi9cblx0b3B0aW9ucyggb3B0aW9ucyApIHtcblx0XHRjb25zdCBjb250cm9sbGVyID0gdGhpcy5wYXJlbnQuYWRkKCB0aGlzLm9iamVjdCwgdGhpcy5wcm9wZXJ0eSwgb3B0aW9ucyApO1xuXHRcdGNvbnRyb2xsZXIubmFtZSggdGhpcy5fbmFtZSApO1xuXHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdHJldHVybiBjb250cm9sbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1pbmltdW0gdmFsdWUuIE9ubHkgd29ya3Mgb24gbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gbWluXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bWluKCBtaW4gKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbWF4aW11bSB2YWx1ZS4gT25seSB3b3JrcyBvbiBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRtYXgoIG1heCApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBWYWx1ZXMgc2V0IGJ5IHRoaXMgY29udHJvbGxlciB3aWxsIGJlIHJvdW5kZWQgdG8gbXVsdGlwbGVzIG9mIGBzdGVwYC4gT25seSB3b3JrcyBvbiBudW1iZXJcblx0ICogY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0c3RlcCggc3RlcCApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSb3VuZHMgdGhlIGRpc3BsYXllZCB2YWx1ZSB0byBhIGZpeGVkIG51bWJlciBvZiBkZWNpbWFscywgd2l0aG91dCBhZmZlY3RpbmcgdGhlIGFjdHVhbCB2YWx1ZVxuXHQgKiBsaWtlIGBzdGVwKClgLiBPbmx5IHdvcmtzIG9uIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAncHJvcGVydHknICkubGlzdGVuKCkuZGVjaW1hbHMoIDQgKTtcblx0ICogQHBhcmFtIHtudW1iZXJ9IGRlY2ltYWxzXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0ZGVjaW1hbHMoIGRlY2ltYWxzICkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxzIGB1cGRhdGVEaXNwbGF5KClgIGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZS4gUGFzcyBgZmFsc2VgIHRvIHN0b3AgbGlzdGVuaW5nLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGxpc3RlblxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGxpc3RlbiggbGlzdGVuID0gdHJ1ZSApIHtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjb250cm9sbGVyIGlzIGN1cnJlbnRseSBsaXN0ZW5pbmcuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGNvbnRyb2xsZXIubGlzdGVuKCB0cnVlfGZhbHNlIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2xpc3RlbmluZyA9IGxpc3RlbjtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuQ2FsbGJhY2tJRCAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUoIHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgKTtcblx0XHRcdHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5pbmcgKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5DYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRfbGlzdGVuQ2FsbGJhY2soKSB7XG5cblx0XHR0aGlzLl9saXN0ZW5DYWxsYmFja0lEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLl9saXN0ZW5DYWxsYmFjayApO1xuXG5cdFx0Ly8gVG8gcHJldmVudCBmcmFtZXJhdGUgbG9zcywgbWFrZSBzdXJlIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZCBiZWZvcmUgdXBkYXRpbmcgdGhlIGRpc3BsYXkuXG5cdFx0Ly8gTm90ZTogc2F2ZSgpIGlzIHVzZWQgaGVyZSBpbnN0ZWFkIG9mIGdldFZhbHVlKCkgb25seSBiZWNhdXNlIG9mIENvbG9yQ29udHJvbGxlci4gVGhlICE9PSBvcGVyYXRvclxuXHRcdC8vIHdvbid0IHdvcmsgZm9yIGNvbG9yIG9iamVjdHMgb3IgYXJyYXlzLCBidXQgQ29sb3JDb250cm9sbGVyLnNhdmUoKSBhbHdheXMgcmV0dXJucyBhIHN0cmluZy5cblxuXHRcdGNvbnN0IGN1clZhbHVlID0gdGhpcy5zYXZlKCk7XG5cblx0XHRpZiAoIGN1clZhbHVlICE9PSB0aGlzLl9saXN0ZW5QcmV2VmFsdWUgKSB7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9saXN0ZW5QcmV2VmFsdWUgPSBjdXJWYWx1ZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYG9iamVjdFsgcHJvcGVydHkgXWAuXG5cdCAqIEByZXR1cm5zIHthbnl9XG5cdCAqL1xuXHRnZXRWYWx1ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5vYmplY3RbIHRoaXMucHJvcGVydHkgXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB2YWx1ZSBvZiBgb2JqZWN0WyBwcm9wZXJ0eSBdYCwgaW52b2tlcyBhbnkgYG9uQ2hhbmdlYCBoYW5kbGVycyBhbmQgdXBkYXRlcyB0aGUgZGlzcGxheS5cblx0ICogQHBhcmFtIHthbnl9IHZhbHVlXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0c2V0VmFsdWUoIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLmdldFZhbHVlKCkgIT09IHZhbHVlICkge1xuXG5cdFx0XHR0aGlzLm9iamVjdFsgdGhpcy5wcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR0aGlzLl9jYWxsT25DaGFuZ2UoKTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBkaXNwbGF5IHRvIGtlZXAgaXQgaW4gc3luYyB3aXRoIHRoZSBjdXJyZW50IHZhbHVlLiBVc2VmdWwgZm9yIHVwZGF0aW5nIHlvdXJcblx0ICogY29udHJvbGxlcnMgd2hlbiB0aGVpciB2YWx1ZXMgaGF2ZSBiZWVuIG1vZGlmaWVkIG91dHNpZGUgb2YgdGhlIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bG9hZCggdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdmFsdWUgKTtcblx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHNhdmUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cm95cyB0aGlzIGNvbnRyb2xsZXIgYW5kIHJlbW92ZXMgaXQgZnJvbSB0aGUgcGFyZW50IEdVSS5cblx0ICovXG5cdGRlc3Ryb3koKSB7XG5cdFx0dGhpcy5saXN0ZW4oIGZhbHNlICk7XG5cdFx0dGhpcy5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKCB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHR0aGlzLnBhcmVudC5jb250cm9sbGVycy5zcGxpY2UoIHRoaXMucGFyZW50LmNvbnRyb2xsZXJzLmluZGV4T2YoIHRoaXMgKSwgMSApO1xuXHRcdHRoaXMucGFyZW50LiRjaGlsZHJlbi5yZW1vdmVDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cdH1cblxufVxuXG5jbGFzcyBCb29sZWFuQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHkgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnYm9vbGVhbicsICdsYWJlbCcgKTtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAnY2hlY2tib3gnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRpbnB1dCApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuJGlucHV0LmNoZWNrZWQgKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRpbnB1dDtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHRoaXMuJGlucHV0LmNoZWNrZWQgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVDb2xvclN0cmluZyggc3RyaW5nICkge1xuXG5cdGxldCBtYXRjaCwgcmVzdWx0O1xuXG5cdGlmICggbWF0Y2ggPSBzdHJpbmcubWF0Y2goIC8oI3wweCk/KFthLWYwLTldezZ9KS9pICkgKSB7XG5cblx0XHRyZXN1bHQgPSBtYXRjaFsgMiBdO1xuXG5cdH0gZWxzZSBpZiAoIG1hdGNoID0gc3RyaW5nLm1hdGNoKCAvcmdiXFwoXFxzKihcXGQqKVxccyosXFxzKihcXGQqKVxccyosXFxzKihcXGQqKVxccypcXCkvICkgKSB7XG5cblx0XHRyZXN1bHQgPSBwYXJzZUludCggbWF0Y2hbIDEgXSApLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCAyLCAwIClcblx0XHRcdCsgcGFyc2VJbnQoIG1hdGNoWyAyIF0gKS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggMiwgMCApXG5cdFx0XHQrIHBhcnNlSW50KCBtYXRjaFsgMyBdICkudG9TdHJpbmcoIDE2ICkucGFkU3RhcnQoIDIsIDAgKTtcblxuXHR9IGVsc2UgaWYgKCBtYXRjaCA9IHN0cmluZy5tYXRjaCggL14jPyhbYS1mMC05XSkoW2EtZjAtOV0pKFthLWYwLTldKSQvaSApICkge1xuXG5cdFx0cmVzdWx0ID0gbWF0Y2hbIDEgXSArIG1hdGNoWyAxIF0gKyBtYXRjaFsgMiBdICsgbWF0Y2hbIDIgXSArIG1hdGNoWyAzIF0gKyBtYXRjaFsgMyBdO1xuXG5cdH1cblxuXHRpZiAoIHJlc3VsdCApIHtcblx0XHRyZXR1cm4gJyMnICsgcmVzdWx0O1xuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xuXG59XG5cbmNvbnN0IFNUUklORyA9IHtcblx0aXNQcmltaXRpdmU6IHRydWUsXG5cdG1hdGNoOiB2ID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJyxcblx0ZnJvbUhleFN0cmluZzogbm9ybWFsaXplQ29sb3JTdHJpbmcsXG5cdHRvSGV4U3RyaW5nOiBub3JtYWxpemVDb2xvclN0cmluZ1xufTtcblxuY29uc3QgSU5UID0ge1xuXHRpc1ByaW1pdGl2ZTogdHJ1ZSxcblx0bWF0Y2g6IHYgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInLFxuXHRmcm9tSGV4U3RyaW5nOiBzdHJpbmcgPT4gcGFyc2VJbnQoIHN0cmluZy5zdWJzdHJpbmcoIDEgKSwgMTYgKSxcblx0dG9IZXhTdHJpbmc6IHZhbHVlID0+ICcjJyArIHZhbHVlLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCA2LCAwIClcbn07XG5cbmNvbnN0IEFSUkFZID0ge1xuXHRpc1ByaW1pdGl2ZTogZmFsc2UsXG5cblx0Ly8gVGhlIGFycm93IGZ1bmN0aW9uIGlzIGhlcmUgdG8gYXBwZWFzZSB0cmVlIHNoYWtlcnMgbGlrZSBlc2J1aWxkIG9yIHdlYnBhY2suXG5cdC8vIFNlZSBodHRwczovL2VzYnVpbGQuZ2l0aHViLmlvL2FwaS8jdHJlZS1zaGFraW5nXG5cdG1hdGNoOiB2ID0+IEFycmF5LmlzQXJyYXkoIHYgKSxcblxuXHRmcm9tSGV4U3RyaW5nKCBzdHJpbmcsIHRhcmdldCwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0Y29uc3QgaW50ID0gSU5ULmZyb21IZXhTdHJpbmcoIHN0cmluZyApO1xuXG5cdFx0dGFyZ2V0WyAwIF0gPSAoIGludCA+PiAxNiAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0WyAxIF0gPSAoIGludCA+PiA4ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXRbIDIgXSA9ICggaW50ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblxuXHR9LFxuXHR0b0hleFN0cmluZyggWyByLCBnLCBiIF0sIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdHJnYlNjYWxlID0gMjU1IC8gcmdiU2NhbGU7XG5cblx0XHRjb25zdCBpbnQgPSAoIHIgKiByZ2JTY2FsZSApIDw8IDE2IF5cblx0XHRcdCggZyAqIHJnYlNjYWxlICkgPDwgOCBeXG5cdFx0XHQoIGIgKiByZ2JTY2FsZSApIDw8IDA7XG5cblx0XHRyZXR1cm4gSU5ULnRvSGV4U3RyaW5nKCBpbnQgKTtcblxuXHR9XG59O1xuXG5jb25zdCBPQkpFQ1QgPSB7XG5cdGlzUHJpbWl0aXZlOiBmYWxzZSxcblx0bWF0Y2g6IHYgPT4gT2JqZWN0KCB2ICkgPT09IHYsXG5cdGZyb21IZXhTdHJpbmcoIHN0cmluZywgdGFyZ2V0LCByZ2JTY2FsZSA9IDEgKSB7XG5cblx0XHRjb25zdCBpbnQgPSBJTlQuZnJvbUhleFN0cmluZyggc3RyaW5nICk7XG5cblx0XHR0YXJnZXQuciA9ICggaW50ID4+IDE2ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXQuZyA9ICggaW50ID4+IDggJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXHRcdHRhcmdldC5iID0gKCBpbnQgJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXG5cdH0sXG5cdHRvSGV4U3RyaW5nKCB7IHIsIGcsIGIgfSwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0cmdiU2NhbGUgPSAyNTUgLyByZ2JTY2FsZTtcblxuXHRcdGNvbnN0IGludCA9ICggciAqIHJnYlNjYWxlICkgPDwgMTYgXlxuXHRcdFx0KCBnICogcmdiU2NhbGUgKSA8PCA4IF5cblx0XHRcdCggYiAqIHJnYlNjYWxlICkgPDwgMDtcblxuXHRcdHJldHVybiBJTlQudG9IZXhTdHJpbmcoIGludCApO1xuXG5cdH1cbn07XG5cbmNvbnN0IEZPUk1BVFMgPSBbIFNUUklORywgSU5ULCBBUlJBWSwgT0JKRUNUIF07XG5cbmZ1bmN0aW9uIGdldENvbG9yRm9ybWF0KCB2YWx1ZSApIHtcblx0cmV0dXJuIEZPUk1BVFMuZmluZCggZm9ybWF0ID0+IGZvcm1hdC5tYXRjaCggdmFsdWUgKSApO1xufVxuXG5jbGFzcyBDb2xvckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCByZ2JTY2FsZSApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdjb2xvcicgKTtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAnY29sb3InICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndGFiaW5kZXgnLCAtMSApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kdGV4dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ3RleHQnICk7XG5cdFx0dGhpcy4kdGV4dC5zZXRBdHRyaWJ1dGUoICdzcGVsbGNoZWNrJywgJ2ZhbHNlJyApO1xuXHRcdHRoaXMuJHRleHQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kZGlzcGxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QuYWRkKCAnZGlzcGxheScgKTtcblxuXHRcdHRoaXMuJGRpc3BsYXkuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRkaXNwbGF5ICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiR0ZXh0ICk7XG5cblx0XHR0aGlzLl9mb3JtYXQgPSBnZXRDb2xvckZvcm1hdCggdGhpcy5pbml0aWFsVmFsdWUgKTtcblx0XHR0aGlzLl9yZ2JTY2FsZSA9IHJnYlNjYWxlO1xuXG5cdFx0dGhpcy5faW5pdGlhbFZhbHVlSGV4U3RyaW5nID0gdGhpcy5zYXZlKCk7XG5cdFx0dGhpcy5fdGV4dEZvY3VzZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsICgpID0+IHtcblx0XHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdGhpcy4kaW5wdXQudmFsdWUgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHRleHQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0JywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgdHJ5UGFyc2UgPSBub3JtYWxpemVDb2xvclN0cmluZyggdGhpcy4kdGV4dC52YWx1ZSApO1xuXHRcdFx0aWYgKCB0cnlQYXJzZSApIHtcblx0XHRcdFx0dGhpcy5fc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB0cnlQYXJzZSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHRleHQuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fdGV4dEZvY3VzZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy4kdGV4dC5zZWxlY3QoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fdGV4dEZvY3VzZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJHRleHQ7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0cmVzZXQoKSB7XG5cdFx0dGhpcy5fc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB0aGlzLl9pbml0aWFsVmFsdWVIZXhTdHJpbmcgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLl9mb3JtYXQuaXNQcmltaXRpdmUgKSB7XG5cblx0XHRcdGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5fZm9ybWF0LmZyb21IZXhTdHJpbmcoIHZhbHVlICk7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCBuZXdWYWx1ZSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5fZm9ybWF0LmZyb21IZXhTdHJpbmcoIHZhbHVlLCB0aGlzLmdldFZhbHVlKCksIHRoaXMuX3JnYlNjYWxlICk7XG5cdFx0XHR0aGlzLl9jYWxsT25DaGFuZ2UoKTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRzYXZlKCkge1xuXHRcdHJldHVybiB0aGlzLl9mb3JtYXQudG9IZXhTdHJpbmcoIHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5fcmdiU2NhbGUgKTtcblx0fVxuXG5cdGxvYWQoIHZhbHVlICkge1xuXHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdmFsdWUgKTtcblx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLl9mb3JtYXQudG9IZXhTdHJpbmcoIHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5fcmdiU2NhbGUgKTtcblx0XHRpZiAoICF0aGlzLl90ZXh0Rm9jdXNlZCApIHtcblx0XHRcdHRoaXMuJHRleHQudmFsdWUgPSB0aGlzLiRpbnB1dC52YWx1ZS5zdWJzdHJpbmcoIDEgKTtcblx0XHR9XG5cdFx0dGhpcy4kZGlzcGxheS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLiRpbnB1dC52YWx1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbmNsYXNzIEZ1bmN0aW9uQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHkgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnZnVuY3Rpb24nICk7XG5cblx0XHQvLyBCdXR0b25zIGFyZSB0aGUgb25seSBjYXNlIHdoZXJlIHdpZGdldCBjb250YWlucyBuYW1lXG5cdFx0dGhpcy4kYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2J1dHRvbicgKTtcblx0XHR0aGlzLiRidXR0b24uYXBwZW5kQ2hpbGQoIHRoaXMuJG5hbWUgKTtcblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGJ1dHRvbiApO1xuXG5cdFx0dGhpcy4kYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGUgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5nZXRWYWx1ZSgpLmNhbGwoIHRoaXMub2JqZWN0ICk7XG5cdFx0XHR0aGlzLl9jYWxsT25DaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHQvLyBlbmFibGVzIDphY3RpdmUgcHNldWRvIGNsYXNzIG9uIG1vYmlsZVxuXHRcdHRoaXMuJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsICgpID0+IHt9LCB7IHBhc3NpdmU6IHRydWUgfSApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJGJ1dHRvbjtcblxuXHR9XG5cbn1cblxuY2xhc3MgTnVtYmVyQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksIG1pbiwgbWF4LCBzdGVwICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ251bWJlcicgKTtcblxuXHRcdHRoaXMuX2luaXRJbnB1dCgpO1xuXG5cdFx0dGhpcy5taW4oIG1pbiApO1xuXHRcdHRoaXMubWF4KCBtYXggKTtcblxuXHRcdGNvbnN0IHN0ZXBFeHBsaWNpdCA9IHN0ZXAgIT09IHVuZGVmaW5lZDtcblx0XHR0aGlzLnN0ZXAoIHN0ZXBFeHBsaWNpdCA/IHN0ZXAgOiB0aGlzLl9nZXRJbXBsaWNpdFN0ZXAoKSwgc3RlcEV4cGxpY2l0ICk7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0ZGVjaW1hbHMoIGRlY2ltYWxzICkge1xuXHRcdHRoaXMuX2RlY2ltYWxzID0gZGVjaW1hbHM7XG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRtaW4oIG1pbiApIHtcblx0XHR0aGlzLl9taW4gPSBtaW47XG5cdFx0dGhpcy5fb25VcGRhdGVNaW5NYXgoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG1heCggbWF4ICkge1xuXHRcdHRoaXMuX21heCA9IG1heDtcblx0XHR0aGlzLl9vblVwZGF0ZU1pbk1heCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c3RlcCggc3RlcCwgZXhwbGljaXQgPSB0cnVlICkge1xuXHRcdHRoaXMuX3N0ZXAgPSBzdGVwO1xuXHRcdHRoaXMuX3N0ZXBFeHBsaWNpdCA9IGV4cGxpY2l0O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblxuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0aWYgKCB0aGlzLl9oYXNTbGlkZXIgKSB7XG5cblx0XHRcdGxldCBwZXJjZW50ID0gKCB2YWx1ZSAtIHRoaXMuX21pbiApIC8gKCB0aGlzLl9tYXggLSB0aGlzLl9taW4gKTtcblx0XHRcdHBlcmNlbnQgPSBNYXRoLm1heCggMCwgTWF0aC5taW4oIHBlcmNlbnQsIDEgKSApO1xuXG5cdFx0XHR0aGlzLiRmaWxsLnN0eWxlLndpZHRoID0gcGVyY2VudCAqIDEwMCArICclJztcblxuXHRcdH1cblxuXHRcdGlmICggIXRoaXMuX2lucHV0Rm9jdXNlZCApIHtcblx0XHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5fZGVjaW1hbHMgPT09IHVuZGVmaW5lZCA/IHZhbHVlIDogdmFsdWUudG9GaXhlZCggdGhpcy5fZGVjaW1hbHMgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0X2luaXRJbnB1dCgpIHtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAndGV4dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHQvLyBPbiB0b3VjaCBkZXZpY2VzIG9ubHksIHVzZSBpbnB1dFt0eXBlPW51bWJlcl0gdG8gZm9yY2UgYSBudW1lcmljIGtleWJvYXJkLlxuXHRcdC8vIElkZWFsbHkgd2UgY291bGQgdXNlIG9uZSBpbnB1dCB0eXBlIGV2ZXJ5d2hlcmUsIGJ1dCBbdHlwZT1udW1iZXJdIGhhcyBxdWlya3Ncblx0XHQvLyBvbiBkZXNrdG9wLCBhbmQgW2lucHV0bW9kZT1kZWNpbWFsXSBoYXMgcXVpcmtzIG9uIGlPUy5cblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2dlb3JnZWFsd2F5cy9saWwtZ3VpL3B1bGwvMTZcblxuXHRcdGNvbnN0IGlzVG91Y2ggPSB3aW5kb3cubWF0Y2hNZWRpYSggJyhwb2ludGVyOiBjb2Fyc2UpJyApLm1hdGNoZXM7XG5cblx0XHRpZiAoIGlzVG91Y2ggKSB7XG5cdFx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ251bWJlcicgKTtcblx0XHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3N0ZXAnLCAnYW55JyApO1xuXHRcdH1cblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRpbnB1dDtcblxuXHRcdGNvbnN0IG9uSW5wdXQgPSAoKSA9PiB7XG5cblx0XHRcdGxldCB2YWx1ZSA9IHBhcnNlRmxvYXQoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cblx0XHRcdGlmICggaXNOYU4oIHZhbHVlICkgKSByZXR1cm47XG5cblx0XHRcdGlmICggdGhpcy5fc3RlcEV4cGxpY2l0ICkge1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuX3NuYXAoIHZhbHVlICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuX2NsYW1wKCB2YWx1ZSApICk7XG5cblx0XHR9O1xuXG5cdFx0Ly8gS2V5cyAmIG1vdXNlIHdoZWVsXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBpbmNyZW1lbnQgPSBkZWx0YSA9PiB7XG5cblx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdCggdGhpcy4kaW5wdXQudmFsdWUgKTtcblxuXHRcdFx0aWYgKCBpc05hTiggdmFsdWUgKSApIHJldHVybjtcblxuXHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIHZhbHVlICsgZGVsdGEgKTtcblxuXHRcdFx0Ly8gRm9yY2UgdGhlIGlucHV0IHRvIHVwZGF0ZURpc3BsYXkgd2hlbiBpdCdzIGZvY3VzZWRcblx0XHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uS2V5RG93biA9IGUgPT4ge1xuXHRcdFx0Ly8gVXNpbmcgYGUua2V5YCBpbnN0ZWFkIG9mIGBlLmNvZGVgIGFsc28gY2F0Y2hlcyBOdW1wYWRFbnRlclxuXHRcdFx0aWYgKCBlLmtleSA9PT0gJ0VudGVyJyApIHtcblx0XHRcdFx0dGhpcy4kaW5wdXQuYmx1cigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBlLmNvZGUgPT09ICdBcnJvd1VwJyApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpbmNyZW1lbnQoIHRoaXMuX3N0ZXAgKiB0aGlzLl9hcnJvd0tleU11bHRpcGxpZXIoIGUgKSApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBlLmNvZGUgPT09ICdBcnJvd0Rvd24nICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGluY3JlbWVudCggdGhpcy5fc3RlcCAqIHRoaXMuX2Fycm93S2V5TXVsdGlwbGllciggZSApICogLTEgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25XaGVlbCA9IGUgPT4ge1xuXHRcdFx0aWYgKCB0aGlzLl9pbnB1dEZvY3VzZWQgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aW5jcmVtZW50KCB0aGlzLl9zdGVwICogdGhpcy5fbm9ybWFsaXplTW91c2VXaGVlbCggZSApICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIFZlcnRpY2FsIGRyYWdcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGxldCB0ZXN0aW5nRm9yVmVydGljYWxEcmFnID0gZmFsc2UsXG5cdFx0XHRpbml0Q2xpZW50WCxcblx0XHRcdGluaXRDbGllbnRZLFxuXHRcdFx0cHJldkNsaWVudFksXG5cdFx0XHRpbml0VmFsdWUsXG5cdFx0XHRkcmFnRGVsdGE7XG5cblx0XHQvLyBPbmNlIHRoZSBtb3VzZSBpcyBkcmFnZ2VkIG1vcmUgdGhhbiBEUkFHX1RIUkVTSCBweCBvbiBhbnkgYXhpcywgd2UgZGVjaWRlXG5cdFx0Ly8gb24gdGhlIHVzZXIncyBpbnRlbnQ6IGhvcml6b250YWwgbWVhbnMgaGlnaGxpZ2h0LCB2ZXJ0aWNhbCBtZWFucyBkcmFnLlxuXHRcdGNvbnN0IERSQUdfVEhSRVNIID0gNTtcblxuXHRcdGNvbnN0IG9uTW91c2VEb3duID0gZSA9PiB7XG5cblx0XHRcdGluaXRDbGllbnRYID0gZS5jbGllbnRYO1xuXHRcdFx0aW5pdENsaWVudFkgPSBwcmV2Q2xpZW50WSA9IGUuY2xpZW50WTtcblx0XHRcdHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgPSB0cnVlO1xuXG5cdFx0XHRpbml0VmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0XHRkcmFnRGVsdGEgPSAwO1xuXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAgKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvbk1vdXNlTW92ZSA9IGUgPT4ge1xuXG5cdFx0XHRpZiAoIHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgKSB7XG5cblx0XHRcdFx0Y29uc3QgZHggPSBlLmNsaWVudFggLSBpbml0Q2xpZW50WDtcblx0XHRcdFx0Y29uc3QgZHkgPSBlLmNsaWVudFkgLSBpbml0Q2xpZW50WTtcblxuXHRcdFx0XHRpZiAoIE1hdGguYWJzKCBkeSApID4gRFJBR19USFJFU0ggKSB7XG5cblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0dGhpcy4kaW5wdXQuYmx1cigpO1xuXHRcdFx0XHRcdHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCB0cnVlLCAndmVydGljYWwnICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggTWF0aC5hYnMoIGR4ICkgPiBEUkFHX1RIUkVTSCApIHtcblxuXHRcdFx0XHRcdG9uTW91c2VVcCgpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUaGlzIGlzbid0IGFuIGVsc2Ugc28gdGhhdCB0aGUgZmlyc3QgbW92ZSBjb3VudHMgdG93YXJkcyBkcmFnRGVsdGFcblx0XHRcdGlmICggIXRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgKSB7XG5cblx0XHRcdFx0Y29uc3QgZHkgPSBlLmNsaWVudFkgLSBwcmV2Q2xpZW50WTtcblxuXHRcdFx0XHRkcmFnRGVsdGEgLT0gZHkgKiB0aGlzLl9zdGVwICogdGhpcy5fYXJyb3dLZXlNdWx0aXBsaWVyKCBlICk7XG5cblx0XHRcdFx0Ly8gQ2xhbXAgZHJhZ0RlbHRhIHNvIHdlIGRvbid0IGhhdmUgJ2RlYWQgc3BhY2UnIGFmdGVyIGRyYWdnaW5nIHBhc3QgYm91bmRzLlxuXHRcdFx0XHQvLyBXZSdyZSBva2F5IHdpdGggdGhlIGZhY3QgdGhhdCBib3VuZHMgY2FuIGJlIHVuZGVmaW5lZCBoZXJlLlxuXHRcdFx0XHRpZiAoIGluaXRWYWx1ZSArIGRyYWdEZWx0YSA+IHRoaXMuX21heCApIHtcblx0XHRcdFx0XHRkcmFnRGVsdGEgPSB0aGlzLl9tYXggLSBpbml0VmFsdWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGluaXRWYWx1ZSArIGRyYWdEZWx0YSA8IHRoaXMuX21pbiApIHtcblx0XHRcdFx0XHRkcmFnRGVsdGEgPSB0aGlzLl9taW4gLSBpbml0VmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9zbmFwQ2xhbXBTZXRWYWx1ZSggaW5pdFZhbHVlICsgZHJhZ0RlbHRhICk7XG5cblx0XHRcdH1cblxuXHRcdFx0cHJldkNsaWVudFkgPSBlLmNsaWVudFk7XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Nb3VzZVVwID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggZmFsc2UsICd2ZXJ0aWNhbCcgKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwICk7XG5cdFx0fTtcblxuXHRcdC8vIEZvY3VzIHN0YXRlICYgb25GaW5pc2hDaGFuZ2Vcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGNvbnN0IG9uRm9jdXMgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9pbnB1dEZvY3VzZWQgPSB0cnVlO1xuXHRcdH07XG5cblx0XHRjb25zdCBvbkJsdXIgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9pbnB1dEZvY3VzZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsIG9uSW5wdXQgKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIG9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBvbk1vdXNlRG93biApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXMgKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsIG9uQmx1ciApO1xuXG5cdH1cblxuXHRfaW5pdFNsaWRlcigpIHtcblxuXHRcdHRoaXMuX2hhc1NsaWRlciA9IHRydWU7XG5cblx0XHQvLyBCdWlsZCBET01cblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdHRoaXMuJHNsaWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kc2xpZGVyLmNsYXNzTGlzdC5hZGQoICdzbGlkZXInICk7XG5cblx0XHR0aGlzLiRmaWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRmaWxsLmNsYXNzTGlzdC5hZGQoICdmaWxsJyApO1xuXG5cdFx0dGhpcy4kc2xpZGVyLmFwcGVuZENoaWxkKCB0aGlzLiRmaWxsICk7XG5cdFx0dGhpcy4kd2lkZ2V0Lmluc2VydEJlZm9yZSggdGhpcy4kc2xpZGVyLCB0aGlzLiRpbnB1dCApO1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdoYXNTbGlkZXInICk7XG5cblx0XHQvLyBNYXAgY2xpZW50WCB0byB2YWx1ZVxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3QgbWFwID0gKCB2LCBhLCBiLCBjLCBkICkgPT4ge1xuXHRcdFx0cmV0dXJuICggdiAtIGEgKSAvICggYiAtIGEgKSAqICggZCAtIGMgKSArIGM7XG5cdFx0fTtcblxuXHRcdGNvbnN0IHNldFZhbHVlRnJvbVggPSBjbGllbnRYID0+IHtcblx0XHRcdGNvbnN0IHJlY3QgPSB0aGlzLiRzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRsZXQgdmFsdWUgPSBtYXAoIGNsaWVudFgsIHJlY3QubGVmdCwgcmVjdC5yaWdodCwgdGhpcy5fbWluLCB0aGlzLl9tYXggKTtcblx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdH07XG5cblx0XHQvLyBNb3VzZSBkcmFnXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBtb3VzZURvd24gPSBlID0+IHtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIHRydWUgKTtcblx0XHRcdHNldFZhbHVlRnJvbVgoIGUuY2xpZW50WCApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZU1vdmUgKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNlVXAgKTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgbW91c2VNb3ZlID0gZSA9PiB7XG5cdFx0XHRzZXRWYWx1ZUZyb21YKCBlLmNsaWVudFggKTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgbW91c2VVcCA9ICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggZmFsc2UgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZVVwICk7XG5cdFx0fTtcblxuXHRcdC8vIFRvdWNoIGRyYWdcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGxldCB0ZXN0aW5nRm9yU2Nyb2xsID0gZmFsc2UsIHByZXZDbGllbnRYLCBwcmV2Q2xpZW50WTtcblxuXHRcdGNvbnN0IGJlZ2luVG91Y2hEcmFnID0gZSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCB0cnVlICk7XG5cdFx0XHRzZXRWYWx1ZUZyb21YKCBlLnRvdWNoZXNbIDAgXS5jbGllbnRYICk7XG5cdFx0XHR0ZXN0aW5nRm9yU2Nyb2xsID0gZmFsc2U7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uVG91Y2hTdGFydCA9IGUgPT4ge1xuXG5cdFx0XHRpZiAoIGUudG91Y2hlcy5sZW5ndGggPiAxICkgcmV0dXJuO1xuXG5cdFx0XHQvLyBJZiB3ZSdyZSBpbiBhIHNjcm9sbGFibGUgY29udGFpbmVyLCB3ZSBzaG91bGQgd2FpdCBmb3IgdGhlIGZpcnN0XG5cdFx0XHQvLyB0b3VjaG1vdmUgdG8gc2VlIGlmIHRoZSB1c2VyIGlzIHRyeWluZyB0byBzbGlkZSBvciBzY3JvbGwuXG5cdFx0XHRpZiAoIHRoaXMuX2hhc1Njcm9sbEJhciApIHtcblxuXHRcdFx0XHRwcmV2Q2xpZW50WCA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFg7XG5cdFx0XHRcdHByZXZDbGllbnRZID0gZS50b3VjaGVzWyAwIF0uY2xpZW50WTtcblx0XHRcdFx0dGVzdGluZ0ZvclNjcm9sbCA9IHRydWU7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSBjYW4gc2V0IHRoZSB2YWx1ZSBzdHJhaWdodCBhd2F5IG9uIHRvdWNoc3RhcnQuXG5cdFx0XHRcdGJlZ2luVG91Y2hEcmFnKCBlICk7XG5cblx0XHRcdH1cblxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgeyBwYXNzaXZlOiBmYWxzZSB9ICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCApO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uVG91Y2hNb3ZlID0gZSA9PiB7XG5cblx0XHRcdGlmICggdGVzdGluZ0ZvclNjcm9sbCApIHtcblxuXHRcdFx0XHRjb25zdCBkeCA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFggLSBwcmV2Q2xpZW50WDtcblx0XHRcdFx0Y29uc3QgZHkgPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRZIC0gcHJldkNsaWVudFk7XG5cblx0XHRcdFx0aWYgKCBNYXRoLmFicyggZHggKSA+IE1hdGguYWJzKCBkeSApICkge1xuXG5cdFx0XHRcdFx0Ly8gV2UgbW92ZWQgaG9yaXpvbnRhbGx5LCBzZXQgdGhlIHZhbHVlIGFuZCBzdG9wIGNoZWNraW5nLlxuXHRcdFx0XHRcdGJlZ2luVG91Y2hEcmFnKCBlICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdC8vIFRoaXMgd2FzLCBpbiBmYWN0LCBhbiBhdHRlbXB0IHRvIHNjcm9sbC4gQWJvcnQuXG5cdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSApO1xuXHRcdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBvblRvdWNoRW5kICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0c2V0VmFsdWVGcm9tWCggZS50b3VjaGVzWyAwIF0uY2xpZW50WCApO1xuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Ub3VjaEVuZCA9ICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggZmFsc2UgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBvblRvdWNoRW5kICk7XG5cdFx0fTtcblxuXHRcdC8vIE1vdXNlIHdoZWVsXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHQvLyBXZSBoYXZlIHRvIHVzZSBhIGRlYm91bmNlZCBmdW5jdGlvbiB0byBjYWxsIG9uRmluaXNoQ2hhbmdlIGJlY2F1c2Vcblx0XHQvLyB0aGVyZSdzIG5vIHdheSB0byB0ZWxsIHdoZW4gdGhlIHVzZXIgaXMgXCJkb25lXCIgbW91c2Utd2hlZWxpbmcuXG5cdFx0Y29uc3QgY2FsbE9uRmluaXNoQ2hhbmdlID0gdGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0XHRjb25zdCBXSEVFTF9ERUJPVU5DRV9USU1FID0gNDAwO1xuXHRcdGxldCB3aGVlbEZpbmlzaENoYW5nZVRpbWVvdXQ7XG5cblx0XHRjb25zdCBvbldoZWVsID0gZSA9PiB7XG5cblx0XHRcdC8vIGlnbm9yZSB2ZXJ0aWNhbCB3aGVlbHMgaWYgdGhlcmUncyBhIHNjcm9sbGJhclxuXHRcdFx0Y29uc3QgaXNWZXJ0aWNhbCA9IE1hdGguYWJzKCBlLmRlbHRhWCApIDwgTWF0aC5hYnMoIGUuZGVsdGFZICk7XG5cdFx0XHRpZiAoIGlzVmVydGljYWwgJiYgdGhpcy5faGFzU2Nyb2xsQmFyICkgcmV0dXJuO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdC8vIHNldCB2YWx1ZVxuXHRcdFx0Y29uc3QgZGVsdGEgPSB0aGlzLl9ub3JtYWxpemVNb3VzZVdoZWVsKCBlICkgKiB0aGlzLl9zdGVwO1xuXHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIHRoaXMuZ2V0VmFsdWUoKSArIGRlbHRhICk7XG5cblx0XHRcdC8vIGZvcmNlIHRoZSBpbnB1dCB0byB1cGRhdGVEaXNwbGF5IHdoZW4gaXQncyBmb2N1c2VkXG5cdFx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdFx0Ly8gZGVib3VuY2Ugb25GaW5pc2hDaGFuZ2Vcblx0XHRcdGNsZWFyVGltZW91dCggd2hlZWxGaW5pc2hDaGFuZ2VUaW1lb3V0ICk7XG5cdFx0XHR3aGVlbEZpbmlzaENoYW5nZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCBjYWxsT25GaW5pc2hDaGFuZ2UsIFdIRUVMX0RFQk9VTkNFX1RJTUUgKTtcblxuXHRcdH07XG5cblx0XHR0aGlzLiRzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG1vdXNlRG93biApO1xuXHRcdHRoaXMuJHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgeyBwYXNzaXZlOiBmYWxzZSB9ICk7XG5cdFx0dGhpcy4kc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIG9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXG5cdH1cblxuXHRfc2V0RHJhZ2dpbmdTdHlsZSggYWN0aXZlLCBheGlzID0gJ2hvcml6b250YWwnICkge1xuXHRcdGlmICggdGhpcy4kc2xpZGVyICkge1xuXHRcdFx0dGhpcy4kc2xpZGVyLmNsYXNzTGlzdC50b2dnbGUoICdhY3RpdmUnLCBhY3RpdmUgKTtcblx0XHR9XG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbGlsLWd1aS1kcmFnZ2luZycsIGFjdGl2ZSApO1xuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggYGxpbC1ndWktJHtheGlzfWAsIGFjdGl2ZSApO1xuXHR9XG5cblx0X2dldEltcGxpY2l0U3RlcCgpIHtcblxuXHRcdGlmICggdGhpcy5faGFzTWluICYmIHRoaXMuX2hhc01heCApIHtcblx0XHRcdHJldHVybiAoIHRoaXMuX21heCAtIHRoaXMuX21pbiApIC8gMTAwMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gMC4xO1xuXG5cdH1cblxuXHRfb25VcGRhdGVNaW5NYXgoKSB7XG5cblx0XHRpZiAoICF0aGlzLl9oYXNTbGlkZXIgJiYgdGhpcy5faGFzTWluICYmIHRoaXMuX2hhc01heCApIHtcblxuXHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgdGltZSB3ZSdyZSBoZWFyaW5nIGFib3V0IG1pbiBhbmQgbWF4XG5cdFx0XHQvLyBhbmQgd2UgaGF2ZW4ndCBleHBsaWNpdGx5IHN0YXRlZCB3aGF0IG91ciBzdGVwIGlzLCBsZXQnc1xuXHRcdFx0Ly8gdXBkYXRlIHRoYXQgdG9vLlxuXHRcdFx0aWYgKCAhdGhpcy5fc3RlcEV4cGxpY2l0ICkge1xuXHRcdFx0XHR0aGlzLnN0ZXAoIHRoaXMuX2dldEltcGxpY2l0U3RlcCgpLCBmYWxzZSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9pbml0U2xpZGVyKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdH1cblxuXHR9XG5cblx0X25vcm1hbGl6ZU1vdXNlV2hlZWwoIGUgKSB7XG5cblx0XHRsZXQgeyBkZWx0YVgsIGRlbHRhWSB9ID0gZTtcblxuXHRcdC8vIFNhZmFyaSBhbmQgQ2hyb21lIHJlcG9ydCB3ZWlyZCBub24taW50ZWdyYWwgdmFsdWVzIGZvciBhIG5vdGNoZWQgd2hlZWwsXG5cdFx0Ly8gYnV0IHN0aWxsIGV4cG9zZSBhY3R1YWwgbGluZXMgc2Nyb2xsZWQgdmlhIHdoZWVsRGVsdGEuIE5vdGNoZWQgd2hlZWxzXG5cdFx0Ly8gc2hvdWxkIGJlaGF2ZSB0aGUgc2FtZSB3YXkgYXMgYXJyb3cga2V5cy5cblx0XHRpZiAoIE1hdGguZmxvb3IoIGUuZGVsdGFZICkgIT09IGUuZGVsdGFZICYmIGUud2hlZWxEZWx0YSApIHtcblx0XHRcdGRlbHRhWCA9IDA7XG5cdFx0XHRkZWx0YVkgPSAtZS53aGVlbERlbHRhIC8gMTIwO1xuXHRcdFx0ZGVsdGFZICo9IHRoaXMuX3N0ZXBFeHBsaWNpdCA/IDEgOiAxMDtcblx0XHR9XG5cblx0XHRjb25zdCB3aGVlbCA9IGRlbHRhWCArIC1kZWx0YVk7XG5cblx0XHRyZXR1cm4gd2hlZWw7XG5cblx0fVxuXG5cdF9hcnJvd0tleU11bHRpcGxpZXIoIGUgKSB7XG5cblx0XHRsZXQgbXVsdCA9IHRoaXMuX3N0ZXBFeHBsaWNpdCA/IDEgOiAxMDtcblxuXHRcdGlmICggZS5zaGlmdEtleSApIHtcblx0XHRcdG11bHQgKj0gMTA7XG5cdFx0fSBlbHNlIGlmICggZS5hbHRLZXkgKSB7XG5cdFx0XHRtdWx0IC89IDEwO1xuXHRcdH1cblxuXHRcdHJldHVybiBtdWx0O1xuXG5cdH1cblxuXHRfc25hcCggdmFsdWUgKSB7XG5cblx0XHQvLyBNYWtlIHRoZSBzdGVwcyBcInN0YXJ0XCIgYXQgbWluIG9yIG1heC5cblx0XHRsZXQgb2Zmc2V0ID0gMDtcblx0XHRpZiAoIHRoaXMuX2hhc01pbiApIHtcblx0XHRcdG9mZnNldCA9IHRoaXMuX21pbjtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLl9oYXNNYXggKSB7XG5cdFx0XHRvZmZzZXQgPSB0aGlzLl9tYXg7XG5cdFx0fVxuXG5cdFx0dmFsdWUgLT0gb2Zmc2V0O1xuXG5cdFx0dmFsdWUgPSBNYXRoLnJvdW5kKCB2YWx1ZSAvIHRoaXMuX3N0ZXAgKSAqIHRoaXMuX3N0ZXA7XG5cblx0XHR2YWx1ZSArPSBvZmZzZXQ7XG5cblx0XHQvLyBVc2VkIHRvIHByZXZlbnQgXCJmbHlhd2F5XCIgZGVjaW1hbHMgbGlrZSAxLjAwMDAwMDAwMDAwMDAxXG5cdFx0dmFsdWUgPSBwYXJzZUZsb2F0KCB2YWx1ZS50b1ByZWNpc2lvbiggMTUgKSApO1xuXG5cdFx0cmV0dXJuIHZhbHVlO1xuXG5cdH1cblxuXHRfY2xhbXAoIHZhbHVlICkge1xuXHRcdC8vIGVpdGhlciBjb25kaXRpb24gaXMgZmFsc2UgaWYgbWluIG9yIG1heCBpcyB1bmRlZmluZWRcblx0XHRpZiAoIHZhbHVlIDwgdGhpcy5fbWluICkgdmFsdWUgPSB0aGlzLl9taW47XG5cdFx0aWYgKCB2YWx1ZSA+IHRoaXMuX21heCApIHZhbHVlID0gdGhpcy5fbWF4O1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdF9zbmFwQ2xhbXBTZXRWYWx1ZSggdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5fY2xhbXAoIHRoaXMuX3NuYXAoIHZhbHVlICkgKSApO1xuXHR9XG5cblx0Z2V0IF9oYXNTY3JvbGxCYXIoKSB7XG5cdFx0Y29uc3Qgcm9vdCA9IHRoaXMucGFyZW50LnJvb3QuJGNoaWxkcmVuO1xuXHRcdHJldHVybiByb290LnNjcm9sbEhlaWdodCA+IHJvb3QuY2xpZW50SGVpZ2h0O1xuXHR9XG5cblx0Z2V0IF9oYXNNaW4oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21pbiAhPT0gdW5kZWZpbmVkO1xuXHR9XG5cblx0Z2V0IF9oYXNNYXgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21heCAhPT0gdW5kZWZpbmVkO1xuXHR9XG5cbn1cblxuY2xhc3MgT3B0aW9uQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksIG9wdGlvbnMgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnb3B0aW9uJyApO1xuXG5cdFx0dGhpcy4kc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NlbGVjdCcgKTtcblx0XHR0aGlzLiRzZWxlY3Quc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kZGlzcGxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QuYWRkKCAnZGlzcGxheScgKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5fdmFsdWVzWyB0aGlzLiRzZWxlY3Quc2VsZWN0ZWRJbmRleCBdICk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzJywgKCkgPT4ge1xuXHRcdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QuYWRkKCAnZm9jdXMnICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgKCkgPT4ge1xuXHRcdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QucmVtb3ZlKCAnZm9jdXMnICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRzZWxlY3QgKTtcblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGRpc3BsYXkgKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRzZWxlY3Q7XG5cblx0XHR0aGlzLm9wdGlvbnMoIG9wdGlvbnMgKTtcblxuXHR9XG5cblx0b3B0aW9ucyggb3B0aW9ucyApIHtcblxuXHRcdHRoaXMuX3ZhbHVlcyA9IEFycmF5LmlzQXJyYXkoIG9wdGlvbnMgKSA/IG9wdGlvbnMgOiBPYmplY3QudmFsdWVzKCBvcHRpb25zICk7XG5cdFx0dGhpcy5fbmFtZXMgPSBBcnJheS5pc0FycmF5KCBvcHRpb25zICkgPyBvcHRpb25zIDogT2JqZWN0LmtleXMoIG9wdGlvbnMgKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5yZXBsYWNlQ2hpbGRyZW4oKTtcblxuXHRcdHRoaXMuX25hbWVzLmZvckVhY2goIG5hbWUgPT4ge1xuXHRcdFx0Y29uc3QgJG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdvcHRpb24nICk7XG5cdFx0XHQkb3B0aW9uLnRleHRDb250ZW50ID0gbmFtZTtcblx0XHRcdHRoaXMuJHNlbGVjdC5hcHBlbmRDaGlsZCggJG9wdGlvbiApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLl92YWx1ZXMuaW5kZXhPZiggdmFsdWUgKTtcblx0XHR0aGlzLiRzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuXHRcdHRoaXMuJGRpc3BsYXkudGV4dENvbnRlbnQgPSBpbmRleCA9PT0gLTEgPyB2YWx1ZSA6IHRoaXMuX25hbWVzWyBpbmRleCBdO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxuY2xhc3MgU3RyaW5nQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHkgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnc3RyaW5nJyApO1xuXG5cdFx0dGhpcy4kaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3NwZWxsY2hlY2snLCAnZmFsc2UnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0JywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy4kaW5wdXQudmFsdWUgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGUgPT4ge1xuXHRcdFx0aWYgKCBlLmNvZGUgPT09ICdFbnRlcicgKSB7XG5cdFx0XHRcdHRoaXMuJGlucHV0LmJsdXIoKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRpbnB1dDtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxudmFyIHN0eWxlc2hlZXQgPSBgLmxpbC1ndWkge1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpO1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZSk7XG4gIGxpbmUtaGVpZ2h0OiAxO1xuICBmb250LXdlaWdodDogbm9ybWFsO1xuICBmb250LXN0eWxlOiBub3JtYWw7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG4gIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uO1xuICAtLWJhY2tncm91bmQtY29sb3I6ICMxZjFmMWY7XG4gIC0tdGV4dC1jb2xvcjogI2ViZWJlYjtcbiAgLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yOiAjMTExMTExO1xuICAtLXRpdGxlLXRleHQtY29sb3I6ICNlYmViZWI7XG4gIC0td2lkZ2V0LWNvbG9yOiAjNDI0MjQyO1xuICAtLWhvdmVyLWNvbG9yOiAjNGY0ZjRmO1xuICAtLWZvY3VzLWNvbG9yOiAjNTk1OTU5O1xuICAtLW51bWJlci1jb2xvcjogIzJjYzlmZjtcbiAgLS1zdHJpbmctY29sb3I6ICNhMmRiM2M7XG4gIC0tZm9udC1zaXplOiAxMXB4O1xuICAtLWlucHV0LWZvbnQtc2l6ZTogMTFweDtcbiAgLS1mb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgQXJpYWwsIHNhbnMtc2VyaWY7XG4gIC0tZm9udC1mYW1pbHktbW9ubzogTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFwiRHJvaWQgU2FucyBNb25vXCIsIG1vbm9zcGFjZTtcbiAgLS1wYWRkaW5nOiA0cHg7XG4gIC0tc3BhY2luZzogNHB4O1xuICAtLXdpZGdldC1oZWlnaHQ6IDIwcHg7XG4gIC0tdGl0bGUtaGVpZ2h0OiBjYWxjKHZhcigtLXdpZGdldC1oZWlnaHQpICsgdmFyKC0tc3BhY2luZykgKiAxLjI1KTtcbiAgLS1uYW1lLXdpZHRoOiA0NSU7XG4gIC0tc2xpZGVyLWtub2Itd2lkdGg6IDJweDtcbiAgLS1zbGlkZXItaW5wdXQtd2lkdGg6IDI3JTtcbiAgLS1jb2xvci1pbnB1dC13aWR0aDogMjclO1xuICAtLXNsaWRlci1pbnB1dC1taW4td2lkdGg6IDQ1cHg7XG4gIC0tY29sb3ItaW5wdXQtbWluLXdpZHRoOiA0NXB4O1xuICAtLWZvbGRlci1pbmRlbnQ6IDdweDtcbiAgLS13aWRnZXQtcGFkZGluZzogMCAwIDAgM3B4O1xuICAtLXdpZGdldC1ib3JkZXItcmFkaXVzOiAycHg7XG4gIC0tY2hlY2tib3gtc2l6ZTogY2FsYygwLjc1ICogdmFyKC0td2lkZ2V0LWhlaWdodCkpO1xuICAtLXNjcm9sbGJhci13aWR0aDogNXB4O1xufVxuLmxpbC1ndWksIC5saWwtZ3VpICoge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG4ubGlsLWd1aS5yb290IHtcbiAgd2lkdGg6IHZhcigtLXdpZHRoLCAyNDVweCk7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xufVxuLmxpbC1ndWkucm9vdCA+IC50aXRsZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLXRpdGxlLWJhY2tncm91bmQtY29sb3IpO1xuICBjb2xvcjogdmFyKC0tdGl0bGUtdGV4dC1jb2xvcik7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuIHtcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xuICBvdmVyZmxvdy15OiBhdXRvO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbjo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICB3aWR0aDogdmFyKC0tc2Nyb2xsYmFyLXdpZHRoKTtcbiAgaGVpZ2h0OiB2YXIoLS1zY3JvbGxiYXItd2lkdGgpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tc2Nyb2xsYmFyLXdpZHRoKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xufVxuQG1lZGlhIChwb2ludGVyOiBjb2Fyc2UpIHtcbiAgLmxpbC1ndWkuYWxsb3ctdG91Y2gtc3R5bGVzLCAubGlsLWd1aS5hbGxvdy10b3VjaC1zdHlsZXMgLmxpbC1ndWkge1xuICAgIC0td2lkZ2V0LWhlaWdodDogMjhweDtcbiAgICAtLXBhZGRpbmc6IDZweDtcbiAgICAtLXNwYWNpbmc6IDZweDtcbiAgICAtLWZvbnQtc2l6ZTogMTNweDtcbiAgICAtLWlucHV0LWZvbnQtc2l6ZTogMTZweDtcbiAgICAtLWZvbGRlci1pbmRlbnQ6IDEwcHg7XG4gICAgLS1zY3JvbGxiYXItd2lkdGg6IDdweDtcbiAgICAtLXNsaWRlci1pbnB1dC1taW4td2lkdGg6IDUwcHg7XG4gICAgLS1jb2xvci1pbnB1dC1taW4td2lkdGg6IDY1cHg7XG4gIH1cbn1cbi5saWwtZ3VpLmZvcmNlLXRvdWNoLXN0eWxlcywgLmxpbC1ndWkuZm9yY2UtdG91Y2gtc3R5bGVzIC5saWwtZ3VpIHtcbiAgLS13aWRnZXQtaGVpZ2h0OiAyOHB4O1xuICAtLXBhZGRpbmc6IDZweDtcbiAgLS1zcGFjaW5nOiA2cHg7XG4gIC0tZm9udC1zaXplOiAxM3B4O1xuICAtLWlucHV0LWZvbnQtc2l6ZTogMTZweDtcbiAgLS1mb2xkZXItaW5kZW50OiAxMHB4O1xuICAtLXNjcm9sbGJhci13aWR0aDogN3B4O1xuICAtLXNsaWRlci1pbnB1dC1taW4td2lkdGg6IDUwcHg7XG4gIC0tY29sb3ItaW5wdXQtbWluLXdpZHRoOiA2NXB4O1xufVxuLmxpbC1ndWkuYXV0b1BsYWNlIHtcbiAgbWF4LWhlaWdodDogMTAwJTtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAxNXB4O1xuICB6LWluZGV4OiAxMDAxO1xufVxuXG4ubGlsLWd1aSAuY29udHJvbGxlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDAgdmFyKC0tcGFkZGluZyk7XG4gIG1hcmdpbjogdmFyKC0tc3BhY2luZykgMDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMC41O1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuZGlzYWJsZWQsIC5saWwtZ3VpIC5jb250cm9sbGVyLmRpc2FibGVkICoge1xuICBwb2ludGVyLWV2ZW50czogbm9uZSAhaW1wb3J0YW50O1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgPiAubmFtZSB7XG4gIG1pbi13aWR0aDogdmFyKC0tbmFtZS13aWR0aCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xuICB3aGl0ZS1zcGFjZTogcHJlO1xuICBwYWRkaW5nLXJpZ2h0OiB2YXIoLS1zcGFjaW5nKTtcbiAgbGluZS1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgLndpZGdldCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgd2lkdGg6IDEwMCU7XG4gIG1pbi1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuc3RyaW5nIGlucHV0IHtcbiAgY29sb3I6IHZhcigtLXN0cmluZy1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5ib29sZWFuIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgLmRpc3BsYXkge1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciAuZGlzcGxheTpob3ZlcjpiZWZvcmUge1xuICAgIGNvbnRlbnQ6IFwiIFwiO1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gICAgYm9yZGVyOiAxcHggc29saWQgI2ZmZjk7XG4gICAgdG9wOiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIGJvdHRvbTogMDtcbiAgICBsZWZ0OiAwO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciBpbnB1dFt0eXBlPWNvbG9yXSB7XG4gIG9wYWNpdHk6IDA7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmNvbG9yIGlucHV0W3R5cGU9dGV4dF0ge1xuICBtYXJnaW4tbGVmdDogdmFyKC0tc3BhY2luZyk7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseS1tb25vKTtcbiAgbWluLXdpZHRoOiB2YXIoLS1jb2xvci1pbnB1dC1taW4td2lkdGgpO1xuICB3aWR0aDogdmFyKC0tY29sb3ItaW5wdXQtd2lkdGgpO1xuICBmbGV4LXNocmluazogMDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiBzZWxlY3Qge1xuICBvcGFjaXR5OiAwO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHdpZHRoOiAxMDAlO1xuICBtYXgtd2lkdGg6IDEwMCU7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXkge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XG4gIHBhZGRpbmctbGVmdDogMC41NWVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxLjc1ZW07XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXkuZm9jdXMge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5LmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAuZGlzcGxheTphZnRlciB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgY29udGVudDogXCLihpVcIjtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIHBhZGRpbmctcmlnaHQ6IDAuMzc1ZW07XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLndpZGdldCxcbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiBzZWxlY3Qge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLndpZGdldDpob3ZlciAuZGlzcGxheSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgaW5wdXQge1xuICBjb2xvcjogdmFyKC0tbnVtYmVyLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlci5oYXNTbGlkZXIgaW5wdXQge1xuICBtYXJnaW4tbGVmdDogdmFyKC0tc3BhY2luZyk7XG4gIHdpZHRoOiB2YXIoLS1zbGlkZXItaW5wdXQtd2lkdGgpO1xuICBtaW4td2lkdGg6IHZhcigtLXNsaWRlci1pbnB1dC1taW4td2lkdGgpO1xuICBmbGV4LXNocmluazogMDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgcGFkZGluZy1yaWdodDogdmFyKC0tc2xpZGVyLWtub2Itd2lkdGgpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgdG91Y2gtYWN0aW9uOiBwYW4teTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyLmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyLmFjdGl2ZSAuZmlsbCB7XG4gIG9wYWNpdHk6IDAuOTU7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLmZpbGwge1xuICBoZWlnaHQ6IDEwMCU7XG4gIGJvcmRlci1yaWdodDogdmFyKC0tc2xpZGVyLWtub2Itd2lkdGgpIHNvbGlkIHZhcigtLW51bWJlci1jb2xvcik7XG4gIGJveC1zaXppbmc6IGNvbnRlbnQtYm94O1xufVxuXG4ubGlsLWd1aS1kcmFnZ2luZyAubGlsLWd1aSB7XG4gIC0taG92ZXItY29sb3I6IHZhcigtLXdpZGdldC1jb2xvcik7XG59XG4ubGlsLWd1aS1kcmFnZ2luZyAqIHtcbiAgY3Vyc29yOiBldy1yZXNpemUgIWltcG9ydGFudDtcbn1cblxuLmxpbC1ndWktZHJhZ2dpbmcubGlsLWd1aS12ZXJ0aWNhbCAqIHtcbiAgY3Vyc29yOiBucy1yZXNpemUgIWltcG9ydGFudDtcbn1cblxuLmxpbC1ndWkgLnRpdGxlIHtcbiAgaGVpZ2h0OiB2YXIoLS10aXRsZS1oZWlnaHQpO1xuICBmb250LXdlaWdodDogNjAwO1xuICBwYWRkaW5nOiAwIHZhcigtLXBhZGRpbmcpO1xuICB3aWR0aDogMTAwJTtcbiAgdGV4dC1hbGlnbjogbGVmdDtcbiAgYmFja2dyb3VuZDogbm9uZTtcbiAgdGV4dC1kZWNvcmF0aW9uLXNraXA6IG9iamVjdHM7XG59XG4ubGlsLWd1aSAudGl0bGU6YmVmb3JlIHtcbiAgZm9udC1mYW1pbHk6IFwibGlsLWd1aVwiO1xuICBjb250ZW50OiBcIuKWvlwiO1xuICBwYWRkaW5nLXJpZ2h0OiAycHg7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbn1cbi5saWwtZ3VpIC50aXRsZTphY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgb3BhY2l0eTogMC43NTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIGJvZHk6bm90KC5saWwtZ3VpLWRyYWdnaW5nKSAubGlsLWd1aSAudGl0bGU6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXRpdGxlLWJhY2tncm91bmQtY29sb3IpO1xuICAgIG9wYWNpdHk6IDAuODU7XG4gIH1cbiAgLmxpbC1ndWkgLnRpdGxlOmZvY3VzIHtcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpLnJvb3QgPiAudGl0bGU6Zm9jdXMge1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmUgIWltcG9ydGFudDtcbn1cbi5saWwtZ3VpLmNsb3NlZCA+IC50aXRsZTpiZWZvcmUge1xuICBjb250ZW50OiBcIuKWuFwiO1xufVxuLmxpbC1ndWkuY2xvc2VkID4gLmNoaWxkcmVuIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC03cHgpO1xuICBvcGFjaXR5OiAwO1xufVxuLmxpbC1ndWkuY2xvc2VkOm5vdCgudHJhbnNpdGlvbikgPiAuY2hpbGRyZW4ge1xuICBkaXNwbGF5OiBub25lO1xufVxuLmxpbC1ndWkudHJhbnNpdGlvbiA+IC5jaGlsZHJlbiB7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IDMwMG1zO1xuICB0cmFuc2l0aW9uLXByb3BlcnR5OiBoZWlnaHQsIG9wYWNpdHksIHRyYW5zZm9ybTtcbiAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IGN1YmljLWJlemllcigwLjIsIDAuNiwgMC4zNSwgMSk7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmxpbC1ndWkgLmNoaWxkcmVuOmVtcHR5OmJlZm9yZSB7XG4gIGNvbnRlbnQ6IFwiRW1wdHlcIjtcbiAgcGFkZGluZzogMCB2YXIoLS1wYWRkaW5nKTtcbiAgbWFyZ2luOiB2YXIoLS1zcGFjaW5nKSAwO1xuICBkaXNwbGF5OiBibG9jaztcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgZm9udC1zdHlsZTogaXRhbGljO1xuICBsaW5lLWhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIG9wYWNpdHk6IDAuNTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW4gPiAubGlsLWd1aSA+IC50aXRsZSB7XG4gIGJvcmRlcjogMCBzb2xpZCB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBib3JkZXItd2lkdGg6IDFweCAwO1xuICB0cmFuc2l0aW9uOiBib3JkZXItY29sb3IgMzAwbXM7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuID4gLmxpbC1ndWkuY2xvc2VkID4gLnRpdGxlIHtcbiAgYm9yZGVyLWJvdHRvbS1jb2xvcjogdHJhbnNwYXJlbnQ7XG59XG4ubGlsLWd1aSArIC5jb250cm9sbGVyIHtcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXdpZGdldC1jb2xvcik7XG4gIG1hcmdpbi10b3A6IDA7XG4gIHBhZGRpbmctdG9wOiB2YXIoLS1zcGFjaW5nKTtcbn1cbi5saWwtZ3VpIC5saWwtZ3VpIC5saWwtZ3VpID4gLnRpdGxlIHtcbiAgYm9yZGVyOiBub25lO1xufVxuLmxpbC1ndWkgLmxpbC1ndWkgLmxpbC1ndWkgPiAuY2hpbGRyZW4ge1xuICBib3JkZXI6IG5vbmU7XG4gIG1hcmdpbi1sZWZ0OiB2YXIoLS1mb2xkZXItaW5kZW50KTtcbiAgYm9yZGVyLWxlZnQ6IDJweCBzb2xpZCB2YXIoLS13aWRnZXQtY29sb3IpO1xufVxuLmxpbC1ndWkgLmxpbC1ndWkgLmNvbnRyb2xsZXIge1xuICBib3JkZXI6IG5vbmU7XG59XG5cbi5saWwtZ3VpIGxhYmVsLCAubGlsLWd1aSBpbnB1dCwgLmxpbC1ndWkgYnV0dG9uIHtcbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5saWwtZ3VpIGlucHV0IHtcbiAgYm9yZGVyOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpO1xuICBmb250LXNpemU6IHZhcigtLWlucHV0LWZvbnQtc2l6ZSk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgYmFja2dyb3VuZDogdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xuICB3aWR0aDogMTAwJTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIGlucHV0OmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1jb2xvcik7XG4gIH1cbiAgLmxpbC1ndWkgaW5wdXQ6YWN0aXZlIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIGlucHV0OmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMTtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9dGV4dF0sXG4ubGlsLWd1aSBpbnB1dFt0eXBlPW51bWJlcl0ge1xuICBwYWRkaW5nOiB2YXIoLS13aWRnZXQtcGFkZGluZyk7XG4gIC1tb3otYXBwZWFyYW5jZTogdGV4dGZpZWxkO1xufVxuLmxpbC1ndWkgaW5wdXRbdHlwZT10ZXh0XTpmb2N1cyxcbi5saWwtZ3VpIGlucHV0W3R5cGU9bnVtYmVyXTpmb2N1cyB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9Y2hlY2tib3hdIHtcbiAgYXBwZWFyYW5jZTogbm9uZTtcbiAgd2lkdGg6IHZhcigtLWNoZWNrYm94LXNpemUpO1xuICBoZWlnaHQ6IHZhcigtLWNoZWNrYm94LXNpemUpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmxpbC1ndWkgaW5wdXRbdHlwZT1jaGVja2JveF06Y2hlY2tlZDpiZWZvcmUge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIGNvbnRlbnQ6IFwi4pyTXCI7XG4gIGZvbnQtc2l6ZTogdmFyKC0tY2hlY2tib3gtc2l6ZSk7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS1jaGVja2JveC1zaXplKTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIGlucHV0W3R5cGU9Y2hlY2tib3hdOmZvY3VzIHtcbiAgICBib3gtc2hhZG93OiBpbnNldCAwIDAgMCAxcHggdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSBidXR0b24ge1xuICBvdXRsaW5lOiBub25lO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseSk7XG4gIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplKTtcbiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xuICB3aWR0aDogMTAwJTtcbiAgYm9yZGVyOiBub25lO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgYnV0dG9uIHtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbjpmb2N1cyB7XG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMXB4IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgYnV0dG9uOmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cblxuQGZvbnQtZmFjZSB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgc3JjOiB1cmwoXCJkYXRhOmFwcGxpY2F0aW9uL2ZvbnQtd29mZjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxkMDlHUmdBQkFBQUFBQVVzQUFzQUFBQUFDSndBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkhVMVZDQUFBQkNBQUFBSDRBQUFEQUltd21ZRTlUTHpJQUFBR0lBQUFBUHdBQUFHQktxSDVTWTIxaGNBQUFBY2dBQUFEMEFBQUNydWt5eUpCbmJIbG1BQUFDdkFBQUFGOEFBQUNFSVpwV0gyaGxZV1FBQUFNY0FBQUFKd0FBQURaZmNqMnphR2hsWVFBQUEwUUFBQUFZQUFBQUpBQzVBSGhvYlhSNEFBQURYQUFBQUJBQUFBQk1BWkFBQUd4dlkyRUFBQU5zQUFBQUZBQUFBQ2dDRWdJeWJXRjRjQUFBQTRBQUFBQWVBQUFBSUFFZkFCSnVZVzFsQUFBRG9BQUFBU0lBQUFJSzlTVVUvWEJ2YzNRQUFBVEVBQUFBWmdBQUFKQ1RjTWMyZUp4VmpiRU9nakFVUlUraEZSQksxZEdSTCtBTG5BaVRveU1MRXpGcG5Qei9lQXNod1NhOTc1MTdjL013d0ptZUI5a3dQbCswY2Y1K3VHUFpYc3FQdTRudlphYmNTWmxkWjZrZnlXbm9tRlkvZVNjS3FaTld1cEtKTzZrWE4zSzl1Q1ZvTDdpSW5QcjFYNWJhWHMzdGp1TXFDdHpFdWFnbS9BQWx6UWdQQUFCNG5HTmdZUkJsbk1EQXlzREFZTS9nQmlUNW9MUUJBd3VESkFNREV3TXJNd05XRUpEbW1zSndnQ0ZlWFpnaEJjamxaTWdGQ3pPaUtPSUZBQjcxQmI4QWVKeTFrakZ1d2tBUVJaK0R3UkF3QnROUVJVR0tROE9kS0NBV1VoQWdLTGhJdUFzVlNwV3o1QmJrajNkRWdZaVVJc3pxV2RwWmUrWjcvd0Ixb0NZbUlvYm9pd2lMVDJXaktsL2pzY3JIZkdnL3BLZE1reWtsQzVaczJMRWZIWXBqY1JvUHptZTlNV1dtazNkV2JLOU9ia1draWtPZXRKNTU0Zld5b0VzbWRTbHQrdVIwcENKUjM0YjZ0L1RWZzFTWTNzWXZkZjh2dWlLcnB5YURYRElTaWVncDE3cDc1NzlHcDNwKyt5N0hQQWlZOXBtVGlibGpycjg1cVNpZHRsZzQrbDI1R0xDYVM4ZTZyUnhOQm1zbkVSdW5LYmFPT2JSejdONzJqdTV2ZEFqWXBCWEhnSnlsT0FWc01zZURBUEVQOExZb1VIaWNZMkJpQUFFZmhpQUdKZ1pXQmdaN1JuRlJkblZKRUxDUWxCU1JsQVRKTW9MVjJESzRnbFNZczZ1YnE1dmJLckpMU2JHcmdFbW92RHVESlZoZTNWemNYRndOTENPSUxCL0M0SXVRMXhUbjVGUGlsQlRqNUZQbUJBQjRXd29xQUhpY1kyQmtZR0FBNHNrMXNSL2orVzIrTW5BenBEQmdBeUVNUVVDU2c0RUp4QUVBd1VnRkhnQjRuR05nWkdCZ1NHRmdnSk1oREl3TXFFQVlBQnlIQVRKNG5HTmdBSUlVTkV3bUFBQmwzQUdSZUp4allBQUNJUVlsQmlNR0ozd1FBRWNRQkVWNG5HTmdaR0JnRUdaZ1kyQmlBQUVReVFXRURBei93WHdHQUFzUEFUSUFBSGljWGRCTlNzTkFIQVh3bDM1aUEwVVFYWW5NU2hmUzlHUFpBN1Q3TGdJdTAzU1Nwa3d6WVRJdDFCTjRBay9nS1R5QWVDeGZ3MzlqWmtqeW16Y3ZBd21BVy93Z3dIVUVHRGIzNitqUVEzR1hHb3Q3OUwyNGp4Q1A0Z0h6Ri9FSXI0akVJZTd3eGhPQzNnMlRNWXk0UTcrTHUvU0h1RWQvaXZ0NHdKZDR3UHhiUEVLTVgzR0k1K0RKRkdhU240cU56azhtY2JLU1I2eGRYZGhTemFPWkpHdGRhcGQ0dlZQYmk2clArY0w3VEdYT0h0WEtsbDRiWTFYbDdFR25QdHA3WHkybjAwenlLTFZIZmtIQmE0SWNKMm9EM2NnZ2dXdnQvVi9GYkRyVWxFVUpoVG4vMGF6VldiTlROcjBFbnM4ZGUxdGNlSzl4Wm1mQjFDUGpPbVBINGtpdG12T3ViY05wbVZUTjNvRkp5anpDdm5tcndoSlR6cXpWajlqaVNYOTExRmplQUFCNG5HM0hNUktDTUJCQTBmMGdpaUtpNERVOGswVjJHV2JJWkRPaDRQb1dXdnE2SjVWOElmOU5WTlFjYURoeW91WE1oWTRyUFRjRzdqd1ltWGhLcThXeitwNzYyYU5hZVlYb20ybjNtMmRMVFZnc3JDZ0ZKN09UbUlrWWJ3SWJDNnZJQjdXbUZmQUFBQT09XCIpIGZvcm1hdChcIndvZmZcIik7XG59YDtcblxuZnVuY3Rpb24gX2luamVjdFN0eWxlcyggY3NzQ29udGVudCApIHtcblx0Y29uc3QgaW5qZWN0ZWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3R5bGUnICk7XG5cdGluamVjdGVkLmlubmVySFRNTCA9IGNzc0NvbnRlbnQ7XG5cdGNvbnN0IGJlZm9yZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdoZWFkIGxpbmtbcmVsPXN0eWxlc2hlZXRdLCBoZWFkIHN0eWxlJyApO1xuXHRpZiAoIGJlZm9yZSApIHtcblx0XHRkb2N1bWVudC5oZWFkLmluc2VydEJlZm9yZSggaW5qZWN0ZWQsIGJlZm9yZSApO1xuXHR9IGVsc2Uge1xuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoIGluamVjdGVkICk7XG5cdH1cbn1cblxuXG5sZXQgc3R5bGVzSW5qZWN0ZWQgPSBmYWxzZTtcblxuY2xhc3MgR1VJIHtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHBhbmVsIHRoYXQgaG9sZHMgY29udHJvbGxlcnMuXG5cdCAqIEBleGFtcGxlXG5cdCAqIG5ldyBHVUkoKTtcblx0ICogbmV3IEdVSSggeyBjb250YWluZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnY3VzdG9tJyApIH0gKTtcblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmF1dG9QbGFjZT10cnVlXVxuXHQgKiBBZGRzIHRoZSBHVUkgdG8gYGRvY3VtZW50LmJvZHlgIGFuZCBmaXhlcyBpdCB0byB0aGUgdG9wIHJpZ2h0IG9mIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5jb250YWluZXJdXG5cdCAqIEFkZHMgdGhlIEdVSSB0byB0aGlzIERPTSBlbGVtZW50LiBPdmVycmlkZXMgYGF1dG9QbGFjZWAuXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aD0yNDVdXG5cdCAqIFdpZHRoIG9mIHRoZSBHVUkgaW4gcGl4ZWxzLCB1c3VhbGx5IHNldCB3aGVuIG5hbWUgbGFiZWxzIGJlY29tZSB0b28gbG9uZy4gTm90ZSB0aGF0IHlvdSBjYW4gbWFrZVxuXHQgKiBuYW1lIGxhYmVscyB3aWRlciBpbiBDU1Mgd2l0aCBgLmxpbOKAkWd1aSB7IOKAkeKAkW5hbWXigJF3aWR0aDogNTUlIH1gLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudGl0bGU9Q29udHJvbHNdXG5cdCAqIE5hbWUgdG8gZGlzcGxheSBpbiB0aGUgdGl0bGUgYmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNsb3NlRm9sZGVycz1mYWxzZV1cblx0ICogUGFzcyBgdHJ1ZWAgdG8gY2xvc2UgYWxsIGZvbGRlcnMgaW4gdGhpcyBHVUkgYnkgZGVmYXVsdC5cblx0ICpcblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmplY3RTdHlsZXM9dHJ1ZV1cblx0ICogSW5qZWN0cyB0aGUgZGVmYXVsdCBzdHlsZXNoZWV0IGludG8gdGhlIHBhZ2UgaWYgdGhpcyBpcyB0aGUgZmlyc3QgR1VJLlxuXHQgKiBQYXNzIGBmYWxzZWAgdG8gdXNlIHlvdXIgb3duIHN0eWxlc2hlZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50b3VjaFN0eWxlcz10cnVlXVxuXHQgKiBNYWtlcyBjb250cm9sbGVycyBsYXJnZXIgb24gdG91Y2ggZGV2aWNlcy4gUGFzcyBgZmFsc2VgIHRvIGRpc2FibGUgdG91Y2ggc3R5bGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0dVSX0gW29wdGlvbnMucGFyZW50XVxuXHQgKiBBZGRzIHRoaXMgR1VJIGFzIGEgY2hpbGQgaW4gYW5vdGhlciBHVUkuIFVzdWFsbHkgdGhpcyBpcyBkb25lIGZvciB5b3UgYnkgYGFkZEZvbGRlcigpYC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKCB7XG5cdFx0cGFyZW50LFxuXHRcdGF1dG9QbGFjZSA9IHBhcmVudCA9PT0gdW5kZWZpbmVkLFxuXHRcdGNvbnRhaW5lcixcblx0XHR3aWR0aCxcblx0XHR0aXRsZSA9ICdDb250cm9scycsXG5cdFx0Y2xvc2VGb2xkZXJzID0gZmFsc2UsXG5cdFx0aW5qZWN0U3R5bGVzID0gdHJ1ZSxcblx0XHR0b3VjaFN0eWxlcyA9IHRydWVcblx0fSA9IHt9ICkge1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEdVSSBjb250YWluaW5nIHRoaXMgZm9sZGVyLCBvciBgdW5kZWZpbmVkYCBpZiB0aGlzIGlzIHRoZSByb290IEdVSS5cblx0XHQgKiBAdHlwZSB7R1VJfVxuXHRcdCAqL1xuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHRvcCBsZXZlbCBHVUkgY29udGFpbmluZyB0aGlzIGZvbGRlciwgb3IgYHRoaXNgIGlmIHRoaXMgaXMgdGhlIHJvb3QgR1VJLlxuXHRcdCAqIEB0eXBlIHtHVUl9XG5cdFx0ICovXG5cdFx0dGhpcy5yb290ID0gcGFyZW50ID8gcGFyZW50LnJvb3QgOiB0aGlzO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxpc3Qgb2YgY29udHJvbGxlcnMgYW5kIGZvbGRlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJLlxuXHRcdCAqIEB0eXBlIHtBcnJheTxHVUl8Q29udHJvbGxlcj59XG5cdFx0ICovXG5cdFx0dGhpcy5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxpc3Qgb2YgY29udHJvbGxlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJLlxuXHRcdCAqIEB0eXBlIHtBcnJheTxDb250cm9sbGVyPn1cblx0XHQgKi9cblx0XHR0aGlzLmNvbnRyb2xsZXJzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbGlzdCBvZiBmb2xkZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSS5cblx0XHQgKiBAdHlwZSB7QXJyYXk8R1VJPn1cblx0XHQgKi9cblx0XHR0aGlzLmZvbGRlcnMgPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBHVUkgaXMgY2xvc2VkLiBVc2UgYGd1aS5vcGVuKClgIG9yIGBndWkuY2xvc2UoKWAgdG8gY2hhbmdlIHRoaXMuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5fY2xvc2VkID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgR1VJIGlzIGhpZGRlbi4gVXNlIGBndWkuc2hvdygpYCBvciBgZ3VpLmhpZGUoKWAgdG8gY2hhbmdlIHRoaXMuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5faGlkZGVuID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgb3V0ZXJtb3N0IGNvbnRhaW5lciBlbGVtZW50LlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLmRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnbGlsLWd1aScgKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSB0aXRsZS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnV0dG9uJyApO1xuXHRcdHRoaXMuJHRpdGxlLmNsYXNzTGlzdC5hZGQoICd0aXRsZScgKTtcblx0XHR0aGlzLiR0aXRsZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgdHJ1ZSApO1xuXG5cdFx0dGhpcy4kdGl0bGUuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgKCkgPT4gdGhpcy5vcGVuQW5pbWF0ZWQoIHRoaXMuX2Nsb3NlZCApICk7XG5cblx0XHQvLyBlbmFibGVzIDphY3RpdmUgcHNldWRvIGNsYXNzIG9uIG1vYmlsZVxuXHRcdHRoaXMuJHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgKCkgPT4ge30sIHsgcGFzc2l2ZTogdHJ1ZSB9ICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyBjaGlsZHJlbi5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kY2hpbGRyZW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGNoaWxkcmVuLmNsYXNzTGlzdC5hZGQoICdjaGlsZHJlbicgKTtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kdGl0bGUgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuJGNoaWxkcmVuICk7XG5cblx0XHR0aGlzLnRpdGxlKCB0aXRsZSApO1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblxuXHRcdFx0dGhpcy5wYXJlbnQuY2hpbGRyZW4ucHVzaCggdGhpcyApO1xuXHRcdFx0dGhpcy5wYXJlbnQuZm9sZGVycy5wdXNoKCB0aGlzICk7XG5cblx0XHRcdHRoaXMucGFyZW50LiRjaGlsZHJlbi5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHRcdC8vIFN0b3AgdGhlIGNvbnN0cnVjdG9yIGVhcmx5LCBldmVyeXRoaW5nIG9ud2FyZCBvbmx5IGFwcGxpZXMgdG8gcm9vdCBHVUknc1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdyb290JyApO1xuXG5cdFx0aWYgKCB0b3VjaFN0eWxlcyApIHtcblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnYWxsb3ctdG91Y2gtc3R5bGVzJyApO1xuXHRcdH1cblxuXHRcdC8vIEluamVjdCBzdHlsZXNoZWV0IGlmIHdlIGhhdmVuJ3QgZG9uZSB0aGF0IHlldFxuXHRcdGlmICggIXN0eWxlc0luamVjdGVkICYmIGluamVjdFN0eWxlcyApIHtcblx0XHRcdF9pbmplY3RTdHlsZXMoIHN0eWxlc2hlZXQgKTtcblx0XHRcdHN0eWxlc0luamVjdGVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoIGNvbnRhaW5lciApIHtcblxuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGF1dG9QbGFjZSApIHtcblxuXHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdhdXRvUGxhY2UnICk7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdH1cblxuXHRcdGlmICggd2lkdGggKSB7XG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoICctLXdpZHRoJywgd2lkdGggKyAncHgnICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY2xvc2VGb2xkZXJzID0gY2xvc2VGb2xkZXJzO1xuXG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGNvbnRyb2xsZXIgdG8gdGhlIEdVSSwgaW5mZXJyaW5nIGNvbnRyb2xsZXIgdHlwZSB1c2luZyB0aGUgYHR5cGVvZmAgb3BlcmF0b3IuXG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApO1xuXHQgKiBndWkuYWRkKCBvYmplY3QsICdudW1iZXInLCAwLCAxMDAsIDEgKTtcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAnb3B0aW9ucycsIFsgMSwgMiwgMyBdICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0aGUgY29udHJvbGxlciB3aWxsIG1vZGlmeS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbnRyb2wuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfG9iamVjdHxBcnJheX0gWyQxXSBNaW5pbXVtIHZhbHVlIGZvciBudW1iZXIgY29udHJvbGxlcnMsIG9yIHRoZSBzZXQgb2Zcblx0ICogc2VsZWN0YWJsZSB2YWx1ZXMgZm9yIGEgZHJvcGRvd24uXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4XSBNYXhpbXVtIHZhbHVlIGZvciBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbc3RlcF0gU3RlcCB2YWx1ZSBmb3IgbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcn1cblx0ICovXG5cdGFkZCggb2JqZWN0LCBwcm9wZXJ0eSwgJDEsIG1heCwgc3RlcCApIHtcblxuXHRcdGlmICggT2JqZWN0KCAkMSApID09PSAkMSApIHtcblxuXHRcdFx0cmV0dXJuIG5ldyBPcHRpb25Db250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCAkMSApO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5pdGlhbFZhbHVlID0gb2JqZWN0WyBwcm9wZXJ0eSBdO1xuXG5cdFx0c3dpdGNoICggdHlwZW9mIGluaXRpYWxWYWx1ZSApIHtcblxuXHRcdFx0Y2FzZSAnbnVtYmVyJzpcblxuXHRcdFx0XHRyZXR1cm4gbmV3IE51bWJlckNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksICQxLCBtYXgsIHN0ZXAgKTtcblxuXHRcdFx0Y2FzZSAnYm9vbGVhbic6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBCb29sZWFuQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG5cdFx0XHRjYXNlICdzdHJpbmcnOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgU3RyaW5nQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG5cdFx0XHRjYXNlICdmdW5jdGlvbic6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuXHRcdH1cblxuXHRcdGNvbnNvbGUuZXJyb3IoIGBndWkuYWRkIGZhaWxlZFxuXHRwcm9wZXJ0eTpgLCBwcm9wZXJ0eSwgYFxuXHRvYmplY3Q6YCwgb2JqZWN0LCBgXG5cdHZhbHVlOmAsIGluaXRpYWxWYWx1ZSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGNvbG9yIGNvbnRyb2xsZXIgdG8gdGhlIEdVSS5cblx0ICogQGV4YW1wbGVcblx0ICogcGFyYW1zID0ge1xuXHQgKiBcdGNzc0NvbG9yOiAnI2ZmMDBmZicsXG5cdCAqIFx0cmdiQ29sb3I6IHsgcjogMCwgZzogMC4yLCBiOiAwLjQgfSxcblx0ICogXHRjdXN0b21SYW5nZTogWyAwLCAxMjcsIDI1NSBdLFxuXHQgKiB9O1xuXHQgKlxuXHQgKiBndWkuYWRkQ29sb3IoIHBhcmFtcywgJ2Nzc0NvbG9yJyApO1xuXHQgKiBndWkuYWRkQ29sb3IoIHBhcmFtcywgJ3JnYkNvbG9yJyApO1xuXHQgKiBndWkuYWRkQ29sb3IoIHBhcmFtcywgJ2N1c3RvbVJhbmdlJywgMjU1ICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0aGUgY29udHJvbGxlciB3aWxsIG1vZGlmeS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbnRyb2wuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByZ2JTY2FsZSBNYXhpbXVtIHZhbHVlIGZvciBhIGNvbG9yIGNoYW5uZWwgd2hlbiB1c2luZyBhbiBSR0IgY29sb3IuIFlvdSBtYXlcblx0ICogbmVlZCB0byBzZXQgdGhpcyB0byAyNTUgaWYgeW91ciBjb2xvcnMgYXJlIHRvbyBicmlnaHQuXG5cdCAqIEByZXR1cm5zIHtDb250cm9sbGVyfVxuXHQgKi9cblx0YWRkQ29sb3IoIG9iamVjdCwgcHJvcGVydHksIHJnYlNjYWxlID0gMSApIHtcblx0XHRyZXR1cm4gbmV3IENvbG9yQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgcmdiU2NhbGUgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgZm9sZGVyIHRvIHRoZSBHVUksIHdoaWNoIGlzIGp1c3QgYW5vdGhlciBHVUkuIFRoaXMgbWV0aG9kIHJldHVybnNcblx0ICogdGhlIG5lc3RlZCBHVUkgc28geW91IGNhbiBhZGQgY29udHJvbGxlcnMgdG8gaXQuXG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IGZvbGRlciA9IGd1aS5hZGRGb2xkZXIoICdQb3NpdGlvbicgKTtcblx0ICogZm9sZGVyLmFkZCggcG9zaXRpb24sICd4JyApO1xuXHQgKiBmb2xkZXIuYWRkKCBwb3NpdGlvbiwgJ3knICk7XG5cdCAqIGZvbGRlci5hZGQoIHBvc2l0aW9uLCAneicgKTtcblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIE5hbWUgdG8gZGlzcGxheSBpbiB0aGUgZm9sZGVyJ3MgdGl0bGUgYmFyLlxuXHQgKiBAcmV0dXJucyB7R1VJfVxuXHQgKi9cblx0YWRkRm9sZGVyKCB0aXRsZSApIHtcblx0XHRjb25zdCBmb2xkZXIgPSBuZXcgR1VJKCB7IHBhcmVudDogdGhpcywgdGl0bGUgfSApO1xuXHRcdGlmICggdGhpcy5yb290Ll9jbG9zZUZvbGRlcnMgKSBmb2xkZXIuY2xvc2UoKTtcblx0XHRyZXR1cm4gZm9sZGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlY2FsbHMgdmFsdWVzIHRoYXQgd2VyZSBzYXZlZCB3aXRoIGBndWkuc2F2ZSgpYC5cblx0ICogQHBhcmFtIHtvYmplY3R9IG9ialxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJlY3Vyc2l2ZSBQYXNzIGZhbHNlIHRvIGV4Y2x1ZGUgZm9sZGVycyBkZXNjZW5kaW5nIGZyb20gdGhpcyBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bG9hZCggb2JqLCByZWN1cnNpdmUgPSB0cnVlICkge1xuXG5cdFx0aWYgKCBvYmouY29udHJvbGxlcnMgKSB7XG5cblx0XHRcdHRoaXMuY29udHJvbGxlcnMuZm9yRWFjaCggYyA9PiB7XG5cblx0XHRcdFx0aWYgKCBjIGluc3RhbmNlb2YgRnVuY3Rpb25Db250cm9sbGVyICkgcmV0dXJuO1xuXG5cdFx0XHRcdGlmICggYy5fbmFtZSBpbiBvYmouY29udHJvbGxlcnMgKSB7XG5cdFx0XHRcdFx0Yy5sb2FkKCBvYmouY29udHJvbGxlcnNbIGMuX25hbWUgXSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdGlmICggcmVjdXJzaXZlICYmIG9iai5mb2xkZXJzICkge1xuXG5cdFx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cblx0XHRcdFx0aWYgKCBmLl90aXRsZSBpbiBvYmouZm9sZGVycyApIHtcblx0XHRcdFx0XHRmLmxvYWQoIG9iai5mb2xkZXJzWyBmLl90aXRsZSBdICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIG9iamVjdCBtYXBwaW5nIGNvbnRyb2xsZXIgbmFtZXMgdG8gdmFsdWVzLiBUaGUgb2JqZWN0IGNhbiBiZSBwYXNzZWQgdG8gYGd1aS5sb2FkKClgIHRvXG5cdCAqIHJlY2FsbCB0aGVzZSB2YWx1ZXMuXG5cdCAqIEBleGFtcGxlXG5cdCAqIHtcblx0ICogXHRjb250cm9sbGVyczoge1xuXHQgKiBcdFx0cHJvcDE6IDEsXG5cdCAqIFx0XHRwcm9wMjogJ3ZhbHVlJyxcblx0ICogXHRcdC4uLlxuXHQgKiBcdH0sXG5cdCAqIFx0Zm9sZGVyczoge1xuXHQgKiBcdFx0Zm9sZGVyTmFtZTE6IHsgY29udHJvbGxlcnMsIGZvbGRlcnMgfSxcblx0ICogXHRcdGZvbGRlck5hbWUyOiB7IGNvbnRyb2xsZXJzLCBmb2xkZXJzIH1cblx0ICogXHRcdC4uLlxuXHQgKiBcdH1cblx0ICogfVxuXHQgKlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJlY3Vyc2l2ZSBQYXNzIGZhbHNlIHRvIGV4Y2x1ZGUgZm9sZGVycyBkZXNjZW5kaW5nIGZyb20gdGhpcyBHVUkuXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9XG5cdCAqL1xuXHRzYXZlKCByZWN1cnNpdmUgPSB0cnVlICkge1xuXG5cdFx0Y29uc3Qgb2JqID0ge1xuXHRcdFx0Y29udHJvbGxlcnM6IHt9LFxuXHRcdFx0Zm9sZGVyczoge31cblx0XHR9O1xuXG5cdFx0dGhpcy5jb250cm9sbGVycy5mb3JFYWNoKCBjID0+IHtcblxuXHRcdFx0aWYgKCBjIGluc3RhbmNlb2YgRnVuY3Rpb25Db250cm9sbGVyICkgcmV0dXJuO1xuXG5cdFx0XHRpZiAoIGMuX25hbWUgaW4gb2JqLmNvbnRyb2xsZXJzICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBDYW5ub3Qgc2F2ZSBHVUkgd2l0aCBkdXBsaWNhdGUgcHJvcGVydHkgXCIke2MuX25hbWV9XCJgICk7XG5cdFx0XHR9XG5cblx0XHRcdG9iai5jb250cm9sbGVyc1sgYy5fbmFtZSBdID0gYy5zYXZlKCk7XG5cblx0XHR9ICk7XG5cblx0XHRpZiAoIHJlY3Vyc2l2ZSApIHtcblxuXHRcdFx0dGhpcy5mb2xkZXJzLmZvckVhY2goIGYgPT4ge1xuXG5cdFx0XHRcdGlmICggZi5fdGl0bGUgaW4gb2JqLmZvbGRlcnMgKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IHNhdmUgR1VJIHdpdGggZHVwbGljYXRlIGZvbGRlciBcIiR7Zi5fdGl0bGV9XCJgICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvYmouZm9sZGVyc1sgZi5fdGl0bGUgXSA9IGYuc2F2ZSgpO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gb2JqO1xuXG5cdH1cblxuXHQvKipcblx0ICogT3BlbnMgYSBHVUkgb3IgZm9sZGVyLiBHVUkgYW5kIGZvbGRlcnMgYXJlIG9wZW4gYnkgZGVmYXVsdC5cblx0ICogQHBhcmFtIHtib29sZWFufSBvcGVuIFBhc3MgZmFsc2UgdG8gY2xvc2UuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub3BlbigpOyAvLyBvcGVuXG5cdCAqIGd1aS5vcGVuKCBmYWxzZSApOyAvLyBjbG9zZVxuXHQgKiBndWkub3BlbiggZ3VpLl9jbG9zZWQgKTsgLy8gdG9nZ2xlXG5cdCAqL1xuXHRvcGVuKCBvcGVuID0gdHJ1ZSApIHtcblxuXHRcdHRoaXMuX3NldENsb3NlZCggIW9wZW4gKTtcblxuXHRcdHRoaXMuJHRpdGxlLnNldEF0dHJpYnV0ZSggJ2FyaWEtZXhwYW5kZWQnLCAhdGhpcy5fY2xvc2VkICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoICdjbG9zZWQnLCB0aGlzLl9jbG9zZWQgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2VzIHRoZSBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0Y2xvc2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMub3BlbiggZmFsc2UgKTtcblx0fVxuXG5cdF9zZXRDbG9zZWQoIGNsb3NlZCApIHtcblx0XHRpZiAoIHRoaXMuX2Nsb3NlZCA9PT0gY2xvc2VkICkgcmV0dXJuO1xuXHRcdHRoaXMuX2Nsb3NlZCA9IGNsb3NlZDtcblx0XHR0aGlzLl9jYWxsT25PcGVuQ2xvc2UoIHRoaXMgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93cyB0aGUgR1VJIGFmdGVyIGl0J3MgYmVlbiBoaWRkZW4uXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLnNob3coKTtcblx0ICogZ3VpLnNob3coIGZhbHNlICk7IC8vIGhpZGVcblx0ICogZ3VpLnNob3coIGd1aS5faGlkZGVuICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0c2hvdyggc2hvdyA9IHRydWUgKSB7XG5cblx0XHR0aGlzLl9oaWRkZW4gPSAhc2hvdztcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdGhpcy5faGlkZGVuID8gJ25vbmUnIDogJyc7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0aGlkZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zaG93KCBmYWxzZSApO1xuXHR9XG5cblx0b3BlbkFuaW1hdGVkKCBvcGVuID0gdHJ1ZSApIHtcblxuXHRcdC8vIHNldCBzdGF0ZSBpbW1lZGlhdGVseVxuXHRcdHRoaXMuX3NldENsb3NlZCggIW9wZW4gKTtcblxuXHRcdHRoaXMuJHRpdGxlLnNldEF0dHJpYnV0ZSggJ2FyaWEtZXhwYW5kZWQnLCAhdGhpcy5fY2xvc2VkICk7XG5cblx0XHQvLyB3YWl0IGZvciBuZXh0IGZyYW1lIHRvIG1lYXN1cmUgJGNoaWxkcmVuXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG5cblx0XHRcdC8vIGV4cGxpY2l0bHkgc2V0IGluaXRpYWwgaGVpZ2h0IGZvciB0cmFuc2l0aW9uXG5cdFx0XHRjb25zdCBpbml0aWFsSGVpZ2h0ID0gdGhpcy4kY2hpbGRyZW4uY2xpZW50SGVpZ2h0O1xuXHRcdFx0dGhpcy4kY2hpbGRyZW4uc3R5bGUuaGVpZ2h0ID0gaW5pdGlhbEhlaWdodCArICdweCc7XG5cblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAndHJhbnNpdGlvbicgKTtcblxuXHRcdFx0Y29uc3Qgb25UcmFuc2l0aW9uRW5kID0gZSA9PiB7XG5cdFx0XHRcdGlmICggZS50YXJnZXQgIT09IHRoaXMuJGNoaWxkcmVuICkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLiRjaGlsZHJlbi5zdHlsZS5oZWlnaHQgPSAnJztcblx0XHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoICd0cmFuc2l0aW9uJyApO1xuXHRcdFx0XHR0aGlzLiRjaGlsZHJlbi5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCApO1xuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy4kY2hpbGRyZW4uYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQgKTtcblxuXHRcdFx0Ly8gdG9kbzogdGhpcyBpcyB3cm9uZyBpZiBjaGlsZHJlbidzIHNjcm9sbEhlaWdodCBtYWtlcyBmb3IgYSBndWkgdGFsbGVyIHRoYW4gbWF4SGVpZ2h0XG5cdFx0XHRjb25zdCB0YXJnZXRIZWlnaHQgPSAhb3BlbiA/IDAgOiB0aGlzLiRjaGlsZHJlbi5zY3JvbGxIZWlnaHQ7XG5cblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCAnY2xvc2VkJywgIW9wZW4gKTtcblxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuJGNoaWxkcmVuLnN0eWxlLmhlaWdodCA9IHRhcmdldEhlaWdodCArICdweCc7XG5cdFx0XHR9ICk7XG5cblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZSB0aGUgdGl0bGUgb2YgdGhpcyBHVUkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHRpdGxlKCB0aXRsZSApIHtcblx0XHQvKipcblx0XHQgKiBDdXJyZW50IHRpdGxlIG9mIHRoZSBHVUkuIFVzZSBgZ3VpLnRpdGxlKCAnVGl0bGUnIClgIHRvIG1vZGlmeSB0aGlzIHZhbHVlLlxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5fdGl0bGUgPSB0aXRsZTtcblx0XHR0aGlzLiR0aXRsZS50ZXh0Q29udGVudCA9IHRpdGxlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0cyBhbGwgY29udHJvbGxlcnMgdG8gdGhlaXIgaW5pdGlhbCB2YWx1ZXMuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVjdXJzaXZlIFBhc3MgZmFsc2UgdG8gZXhjbHVkZSBmb2xkZXJzIGRlc2NlbmRpbmcgZnJvbSB0aGlzIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRyZXNldCggcmVjdXJzaXZlID0gdHJ1ZSApIHtcblx0XHRjb25zdCBjb250cm9sbGVycyA9IHJlY3Vyc2l2ZSA/IHRoaXMuY29udHJvbGxlcnNSZWN1cnNpdmUoKSA6IHRoaXMuY29udHJvbGxlcnM7XG5cdFx0Y29udHJvbGxlcnMuZm9yRWFjaCggYyA9PiBjLnJlc2V0KCkgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIGEgY29udHJvbGxlciBpbiB0aGlzIEdVSSBjaGFuZ2VzLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHtvYmplY3Q6b2JqZWN0LCBwcm9wZXJ0eTpzdHJpbmcsIHZhbHVlOmFueSwgY29udHJvbGxlcjpDb250cm9sbGVyfSl9IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub25DaGFuZ2UoIGV2ZW50ID0+IHtcblx0ICogXHRldmVudC5vYmplY3QgICAgIC8vIG9iamVjdCB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiBcdGV2ZW50LnByb3BlcnR5ICAgLy8gc3RyaW5nLCBuYW1lIG9mIHByb3BlcnR5XG5cdCAqIFx0ZXZlbnQudmFsdWUgICAgICAvLyBuZXcgdmFsdWUgb2YgY29udHJvbGxlclxuXHQgKiBcdGV2ZW50LmNvbnRyb2xsZXIgLy8gY29udHJvbGxlciB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbkNoYW5nZSggY2FsbGJhY2sgKSB7XG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBhY2Nlc3MgdGhlIGZ1bmN0aW9uIGJvdW5kIHRvIGBvbkNoYW5nZWAgZXZlbnRzLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBndWkub25DaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkNoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X2NhbGxPbkNoYW5nZSggY29udHJvbGxlciApIHtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uQ2hhbmdlKCBjb250cm9sbGVyICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9vbkNoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25DaGFuZ2UuY2FsbCggdGhpcywge1xuXHRcdFx0XHRvYmplY3Q6IGNvbnRyb2xsZXIub2JqZWN0LFxuXHRcdFx0XHRwcm9wZXJ0eTogY29udHJvbGxlci5wcm9wZXJ0eSxcblx0XHRcdFx0dmFsdWU6IGNvbnRyb2xsZXIuZ2V0VmFsdWUoKSxcblx0XHRcdFx0Y29udHJvbGxlclxuXHRcdFx0fSApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIGEgY29udHJvbGxlciBpbiB0aGlzIEdVSSBoYXMgZmluaXNoZWQgY2hhbmdpbmcuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24oe29iamVjdDpvYmplY3QsIHByb3BlcnR5OnN0cmluZywgdmFsdWU6YW55LCBjb250cm9sbGVyOkNvbnRyb2xsZXJ9KX0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5vbkZpbmlzaENoYW5nZSggZXZlbnQgPT4ge1xuXHQgKiBcdGV2ZW50Lm9iamVjdCAgICAgLy8gb2JqZWN0IHRoYXQgd2FzIG1vZGlmaWVkXG5cdCAqIFx0ZXZlbnQucHJvcGVydHkgICAvLyBzdHJpbmcsIG5hbWUgb2YgcHJvcGVydHlcblx0ICogXHRldmVudC52YWx1ZSAgICAgIC8vIG5ldyB2YWx1ZSBvZiBjb250cm9sbGVyXG5cdCAqIFx0ZXZlbnQuY29udHJvbGxlciAvLyBjb250cm9sbGVyIHRoYXQgd2FzIG1vZGlmaWVkXG5cdCAqIH0gKTtcblx0ICovXG5cdG9uRmluaXNoQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uRmluaXNoQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGd1aS5vbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfY2FsbE9uRmluaXNoQ2hhbmdlKCBjb250cm9sbGVyICkge1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25GaW5pc2hDaGFuZ2UoIGNvbnRyb2xsZXIgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX29uRmluaXNoQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZS5jYWxsKCB0aGlzLCB7XG5cdFx0XHRcdG9iamVjdDogY29udHJvbGxlci5vYmplY3QsXG5cdFx0XHRcdHByb3BlcnR5OiBjb250cm9sbGVyLnByb3BlcnR5LFxuXHRcdFx0XHR2YWx1ZTogY29udHJvbGxlci5nZXRWYWx1ZSgpLFxuXHRcdFx0XHRjb250cm9sbGVyXG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGlzIEdVSSBvciBpdHMgZGVzY2VuZGFudHMgYXJlIG9wZW5lZCBvciBjbG9zZWQuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24oR1VJKX0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5vbk9wZW5DbG9zZSggY2hhbmdlZEdVSSA9PiB7XG5cdCAqIFx0Y29uc29sZS5sb2coIGNoYW5nZWRHVUkuX2Nsb3NlZCApO1xuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbk9wZW5DbG9zZSggY2FsbGJhY2sgKSB7XG5cdFx0dGhpcy5fb25PcGVuQ2xvc2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9jYWxsT25PcGVuQ2xvc2UoIGNoYW5nZWRHVUkgKSB7XG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25PcGVuQ2xvc2UoIGNoYW5nZWRHVUkgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX29uT3BlbkNsb3NlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbk9wZW5DbG9zZS5jYWxsKCB0aGlzLCBjaGFuZ2VkR1VJICk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlc3Ryb3lzIGFsbCBET00gZWxlbWVudHMgYW5kIGV2ZW50IGxpc3RlbmVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBHVUkuXG5cdCAqL1xuXHRkZXN0cm95KCkge1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnNwbGljZSggdGhpcy5wYXJlbnQuY2hpbGRyZW4uaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0XHR0aGlzLnBhcmVudC5mb2xkZXJzLnNwbGljZSggdGhpcy5wYXJlbnQuZm9sZGVycy5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50ICkge1xuXHRcdFx0dGhpcy5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXHRcdH1cblxuXHRcdEFycmF5LmZyb20oIHRoaXMuY2hpbGRyZW4gKS5mb3JFYWNoKCBjID0+IGMuZGVzdHJveSgpICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNvbnRyb2xsZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSSBhbmQgaXRzIGRlc2NlbmRlbnRzLlxuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcltdfVxuXHQgKi9cblx0Y29udHJvbGxlcnNSZWN1cnNpdmUoKSB7XG5cdFx0bGV0IGNvbnRyb2xsZXJzID0gQXJyYXkuZnJvbSggdGhpcy5jb250cm9sbGVycyApO1xuXHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblx0XHRcdGNvbnRyb2xsZXJzID0gY29udHJvbGxlcnMuY29uY2F0KCBmLmNvbnRyb2xsZXJzUmVjdXJzaXZlKCkgKTtcblx0XHR9ICk7XG5cdFx0cmV0dXJuIGNvbnRyb2xsZXJzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgZm9sZGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkgYW5kIGl0cyBkZXNjZW5kZW50cy5cblx0ICogQHJldHVybnMge0dVSVtdfVxuXHQgKi9cblx0Zm9sZGVyc1JlY3Vyc2l2ZSgpIHtcblx0XHRsZXQgZm9sZGVycyA9IEFycmF5LmZyb20oIHRoaXMuZm9sZGVycyApO1xuXHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblx0XHRcdGZvbGRlcnMgPSBmb2xkZXJzLmNvbmNhdCggZi5mb2xkZXJzUmVjdXJzaXZlKCkgKTtcblx0XHR9ICk7XG5cdFx0cmV0dXJuIGZvbGRlcnM7XG5cdH1cblxufVxuXG5leHBvcnQgeyBCb29sZWFuQ29udHJvbGxlciwgQ29sb3JDb250cm9sbGVyLCBDb250cm9sbGVyLCBGdW5jdGlvbkNvbnRyb2xsZXIsIEdVSSwgTnVtYmVyQ29udHJvbGxlciwgT3B0aW9uQ29udHJvbGxlciwgU3RyaW5nQ29udHJvbGxlciwgR1VJIGFzIGRlZmF1bHQgfTtcbiIsImltcG9ydCB0eXBlIHsgQWN0aW5TdGF0cyB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlDaGVja3BvaW50KHM6IEFjdGluU3RhdHMsIGZpeGVkQXJlYTogYm9vbGVhbik6IFwidmFsaWRcIiB8IFwiY29udGFjdHNcIiB8IFwiZmF0YWxcIiB7XG4gIGNvbnN0IGZpbml0ZSA9IFtcbiAgICBzLmNlbGwuYXJlYSxcbiAgICBzLmNlbGwuY2VudHJvaWRYLFxuICAgIHMuY2VsbC5jZW50cm9pZFksXG4gICAgcy5jZWxsLmxlZnQsXG4gICAgcy5jZWxsLnJpZ2h0LFxuICAgIHMuY2VsbC50b3AsXG4gICAgcy5jZWxsLmJvdHRvbSxcbiAgICBzLmFjdGluQmFsYW5jZUVycm9yLFxuICAgIHMuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgIHMuaW5Qb2x5bWVyLFxuICAgIHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzLFxuICAgIHMuYnJva2VuTGlua3MsXG4gICAgcy5jeWNsZXMsXG4gIF0uZXZlcnkoTnVtYmVyLmlzRmluaXRlKTtcbiAgaWYgKFxuICAgICFmaW5pdGUgfHxcbiAgICBzLmNlbGwuYXJlYSA8PSAwIHx8XG4gICAgcy5hY3RpbkJhbGFuY2VFcnJvciAhPT0gMCB8fFxuICAgIHMuYnJva2VuTGlua3MgIT09IDAgfHxcbiAgICBzLmN5Y2xlcyAhPT0gMCB8fFxuICAgICFOdW1iZXIuaXNJbnRlZ2VyKHMuaW5zaWRlUG9seW1lckJlYWRzKSB8fFxuICAgICFOdW1iZXIuaXNJbnRlZ2VyKHMuaW5Qb2x5bWVyKSB8fFxuICAgIHMuaW5zaWRlUG9seW1lckJlYWRzIDwgMCB8fFxuICAgIHMuaW5zaWRlUG9seW1lckJlYWRzID4gcy5pblBvbHltZXIgfHxcbiAgICAhTnVtYmVyLmlzSW50ZWdlcihzLmNyb3NzaW5nRmlsYW1lbnRCb25kcykgfHxcbiAgICBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyA8IDAgfHxcbiAgICAoZml4ZWRBcmVhICYmIE1hdGguYWJzKHMuY2VsbC5hcmVhIC0gMSkgPiAwLjAwMSlcbiAgKVxuICAgIHJldHVybiBcImZhdGFsXCI7XG4gIGlmIChzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyA9PT0gMCAmJiBzLmluc2lkZVBvbHltZXJCZWFkcyA9PT0gcy5pblBvbHltZXIpIHJldHVybiBcInZhbGlkXCI7XG4gIC8vIENvdW50cyBpZGVudGlmeSByZXNpZHVhbCBjb250YWN0cywgbm90IGNvcnJ1cHRpb24uIFRoZSByZXBhaXIncyBkaXNwbGFjZW1lbnQsXG4gIC8vIGl0ZXJhdGlvbiBhbmQgZWxhcHNlZC10aW1lIGxpbWl0cyBkZWNpZGUgd2hldGhlciB0aGVzZSBjYW4gYmUgY29ycmVjdGVkLlxuICByZXR1cm4gXCJjb250YWN0c1wiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2twb2ludERldGFpbHMoczogQWN0aW5TdGF0cykge1xuICByZXR1cm4ge1xuICAgIHN0ZXA6IHMuc3RlcCxcbiAgICBtYXNzOiBzLmFjdGluQmFsYW5jZUVycm9yLFxuICAgIGluc2lkZUY6IHMuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgIHRvdGFsRjogcy5pblBvbHltZXIsXG4gICAgb3V0c2lkZUY6IHMuaW5Qb2x5bWVyIC0gcy5pbnNpZGVQb2x5bWVyQmVhZHMsXG4gICAgY3Jvc3NpbmdzOiBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICBicm9rZW5MaW5rczogcy5icm9rZW5MaW5rcyxcbiAgICBjeWNsZXM6IHMuY3ljbGVzLFxuICAgIGFyZWE6IHMuY2VsbC5hcmVhLFxuICAgIGNlbnRyb2lkWDogcy5jZWxsLmNlbnRyb2lkWCxcbiAgICBjZW50cm9pZFk6IHMuY2VsbC5jZW50cm9pZFksXG4gIH07XG59XG5cbnR5cGUgRGVwZW5kZW5jaWVzID0ge1xuICBpbnNwZWN0OiAoKSA9PiBQcm9taXNlPEFjdGluU3RhdHM+O1xuICBiZWdpbjogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVwYWlyOiAoaXRlcmF0aW9uczogbnVtYmVyKSA9PiBQcm9taXNlPG51bWJlcj47XG4gIHJvbGxiYWNrOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBkaXNwb3NlOiAoKSA9PiB2b2lkO1xuICBmaXhlZEFyZWE6ICgpID0+IGJvb2xlYW47XG4gIG1heERpc3BsYWNlbWVudDogKCkgPT4gbnVtYmVyO1xuICBub3c6ICgpID0+IG51bWJlcjtcbiAgbm90aWNlOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuICBmYWlsOiAoZXJyb3I6IHVua25vd24pID0+IHZvaWQ7XG59O1xuZXhwb3J0IHR5cGUgUmVjb3ZlcnlSZWNvcmQgPSB7XG4gIHRyaWdnZXJTdGVwOiBudW1iZXI7XG4gIGN1cnJlbnRTdGVwPzogbnVtYmVyO1xuICBpbml0aWFsQ3Jvc3NpbmdzOiBudW1iZXI7XG4gIGluaXRpYWxPdXRzaWRlOiBudW1iZXI7XG4gIGxhdGVzdD86IFJldHVyblR5cGU8dHlwZW9mIGNoZWNrcG9pbnREZXRhaWxzPjtcbiAgcGFzc2VzOiBudW1iZXI7XG4gIG91dGNvbWU6IFwiY2hlY2tpbmdcIiB8IFwiZnJlc2gtc3RhdGUtY2xlYW5cIiB8IFwiY29ycmVjdGVkXCIgfCBcImZhaWxlZFwiO1xuICBtYXhEaXNwbGFjZW1lbnQ6IG51bWJlcjtcbiAgZWxhcHNlZE1zPzogbnVtYmVyO1xuICBlcnJvcj86IHN0cmluZztcbn07XG5cbi8vIENhbGxlZCBzeW5jaHJvbm91c2x5IGZyb20gdGhlIGFzeW5jaHJvbm91cyBkaWFnbm9zdGljIGNhbGxiYWNrLCBidXQgbmV2ZXJcbi8vIGF3YWl0ZWQgYnkgdGhhdCBjYWxsYmFjay4gVGhlIGFjdGl2ZSBmbGFnIGZyZWV6ZXMgbmV3IHBoeXNpY3Mgc3VibWlzc2lvbnMuXG5leHBvcnQgY2xhc3MgQ29udGFjdFJlY292ZXJ5IHtcbiAgYWN0aXZlID0gZmFsc2U7XG4gIHJlYWRvbmx5IGhpc3Rvcnk6IFJlY292ZXJ5UmVjb3JkW10gPSBbXTtcbiAgcHJpdmF0ZSBwZW5kaW5nOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgZGVwczogRGVwZW5kZW5jaWVzO1xuICBjb25zdHJ1Y3RvcihkZXBzOiBEZXBlbmRlbmNpZXMpIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuICB9XG4gIHdhaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZyA/PyBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICByZXF1ZXN0KHRyaWdnZXI6IEFjdGluU3RhdHMpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHJldHVybiB0aGlzLndhaXQoKTtcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgY29uc3QgZCA9IHRoaXMuZGVwcyxcbiAgICAgIHN0YXJ0ZWQgPSBkLm5vdygpO1xuICAgIGNvbnN0IHJlY29yZDogUmVjb3ZlcnlSZWNvcmQgPSB7XG4gICAgICB0cmlnZ2VyU3RlcDogdHJpZ2dlci5zdGVwLFxuICAgICAgaW5pdGlhbENyb3NzaW5nczogdHJpZ2dlci5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMsXG4gICAgICBpbml0aWFsT3V0c2lkZTogdHJpZ2dlci5pblBvbHltZXIgLSB0cmlnZ2VyLmluc2lkZVBvbHltZXJCZWFkcyxcbiAgICAgIHBhc3NlczogMCxcbiAgICAgIG91dGNvbWU6IFwiY2hlY2tpbmdcIixcbiAgICAgIG1heERpc3BsYWNlbWVudDogMCxcbiAgICB9O1xuICAgIHRoaXMuaGlzdG9yeS5wdXNoKHJlY29yZCk7XG4gICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPiAzMikgdGhpcy5oaXN0b3J5LnNoaWZ0KCk7XG4gICAgbGV0IGJhY2tlZFVwID0gZmFsc2U7XG4gICAgY29uc3QgY2hlY2tCdWRnZXQgPSAoKSA9PiB7XG4gICAgICBpZiAoZC5ub3coKSAtIHN0YXJ0ZWQgPiA1MDAwKSB0aHJvdyBFcnJvcihcIkNvbnRhY3QgcmVjb3ZlcnkgZXhjZWVkZWQgaXRzIHRpbWUgYnVkZ2V0XCIpO1xuICAgIH07XG4gICAgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgZC5ub3RpY2UoYFJlY2hlY2tpbmcgY29udGFjdHM6ICR7cmVjb3JkLmluaXRpYWxPdXRzaWRlfSBvdXRzaWRlIGJlYWQocyksICR7dHJpZ2dlci5jcm9zc2luZ0ZpbGFtZW50Qm9uZHN9IGNyb3NzaW5nKHMp4oCmYCk7XG4gICAgICAgIGxldCBzdGF0ZSA9IGF3YWl0IGQuaW5zcGVjdCgpO1xuICAgICAgICByZWNvcmQubGF0ZXN0ID0gY2hlY2twb2ludERldGFpbHMoc3RhdGUpO1xuICAgICAgICBjaGVja0J1ZGdldCgpO1xuICAgICAgICByZWNvcmQuY3VycmVudFN0ZXAgPSBzdGF0ZS5zdGVwO1xuICAgICAgICBsZXQga2luZCA9IGNsYXNzaWZ5Q2hlY2twb2ludChzdGF0ZSwgZC5maXhlZEFyZWEoKSk7XG4gICAgICAgIGlmIChraW5kID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICByZWNvcmQub3V0Y29tZSA9IFwiZnJlc2gtc3RhdGUtY2xlYW5cIjtcbiAgICAgICAgICBkLm5vdGljZShcIkN1cnJlbnQgc3RhdGUgdmVyaWZpZWQ7IGNvbnRpbnVpbmcuXCIpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoa2luZCAhPT0gXCJjb250YWN0c1wiKSB0aHJvdyBFcnJvcihgQ3VycmVudCBzdGF0ZSBoYXMgYSBub24tY29udGFjdCBpbnZhcmlhbnQgZmFpbHVyZTogJHtKU09OLnN0cmluZ2lmeShyZWNvcmQubGF0ZXN0KX1gKTtcbiAgICAgICAgYXdhaXQgZC5iZWdpbigpO1xuICAgICAgICBiYWNrZWRVcCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgaXRlcmF0aW9ucyBvZiBbNCwgOCwgMTYsIDMyXSkge1xuICAgICAgICAgIGNoZWNrQnVkZ2V0KCk7XG4gICAgICAgICAgZC5ub3RpY2UoYENvcnJlY3RpbmcgY29udGFjdCByZXNpZHVhbHMgKCR7cmVjb3JkLnBhc3NlcyArIGl0ZXJhdGlvbnN9IGV4dHJhIHBhc3NlcynigKZgKTtcbiAgICAgICAgICByZWNvcmQubWF4RGlzcGxhY2VtZW50ID0gYXdhaXQgZC5yZXBhaXIoaXRlcmF0aW9ucyk7XG4gICAgICAgICAgcmVjb3JkLnBhc3NlcyArPSBpdGVyYXRpb25zO1xuICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHJlY29yZC5tYXhEaXNwbGFjZW1lbnQpIHx8IHJlY29yZC5tYXhEaXNwbGFjZW1lbnQgPiBkLm1heERpc3BsYWNlbWVudCgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJDb250YWN0IGNvcnJlY3Rpb24gZXhjZWVkZWQgaXRzIGRpc3BsYWNlbWVudCBidWRnZXRcIik7XG4gICAgICAgICAgc3RhdGUgPSBhd2FpdCBkLmluc3BlY3QoKTtcbiAgICAgICAgICByZWNvcmQubGF0ZXN0ID0gY2hlY2twb2ludERldGFpbHMoc3RhdGUpO1xuICAgICAgICAgIGNoZWNrQnVkZ2V0KCk7XG4gICAgICAgICAgaWYgKHN0YXRlLnN0ZXAgIT09IHJlY29yZC5jdXJyZW50U3RlcCkgdGhyb3cgRXJyb3IoXCJQaHlzaWNzIGFkdmFuY2VkIGR1cmluZyBjb250YWN0IHJlY292ZXJ5XCIpO1xuICAgICAgICAgIGtpbmQgPSBjbGFzc2lmeUNoZWNrcG9pbnQoc3RhdGUsIGQuZml4ZWRBcmVhKCkpO1xuICAgICAgICAgIGlmIChraW5kID09PSBcInZhbGlkXCIpIHtcbiAgICAgICAgICAgIHJlY29yZC5vdXRjb21lID0gXCJjb3JyZWN0ZWRcIjtcbiAgICAgICAgICAgIGQubm90aWNlKGBDb250YWN0cyBjb3JyZWN0ZWQgYW5kIHZlcmlmaWVkICgke3JlY29yZC5wYXNzZXN9IHBhc3NlcykuYCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChraW5kICE9PSBcImNvbnRhY3RzXCIpIHRocm93IEVycm9yKGBDb250YWN0IGNvcnJlY3Rpb24gY2hhbmdlZCBhbm90aGVyIGludmFyaWFudDogJHtKU09OLnN0cmluZ2lmeShyZWNvcmQubGF0ZXN0KX1gKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBFcnJvcihgQ29udGFjdCBjb3JyZWN0aW9uIGRpZCBub3QgY29udmVyZ2Ugd2l0aGluIDYwIGV4dHJhIHBhc3NlczogJHtKU09OLnN0cmluZ2lmeShyZWNvcmQubGF0ZXN0KX1gKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlY29yZC5vdXRjb21lID0gXCJmYWlsZWRcIjtcbiAgICAgICAgcmVjb3JkLmVycm9yID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgICAgICBpZiAoYmFja2VkVXApIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZC5yb2xsYmFjaygpO1xuICAgICAgICAgIH0gY2F0Y2ggKHJvbGxiYWNrRXJyb3IpIHtcbiAgICAgICAgICAgIHJlY29yZC5lcnJvciArPSBgOyByb2xsYmFjayBmYWlsZWQ6ICR7U3RyaW5nKHJvbGxiYWNrRXJyb3IpfWA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGQuZmFpbChuZXcgRXJyb3IocmVjb3JkLmVycm9yKSk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBkLmRpc3Bvc2UoKTtcbiAgICAgICAgcmVjb3JkLmVsYXBzZWRNcyA9IGQubm93KCkgLSBzdGFydGVkO1xuICAgICAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgfVxuICAgIH07XG4gICAgdGhpcy5wZW5kaW5nID0gcnVuKCk7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZztcbiAgfVxufVxuIiwiaW1wb3J0IHsgcG9seWdvbk9jY3VwYW5jeSwgcG9seWdvbkJvbmRDcm9zc2luZyB9IGZyb20gXCIuL29jY3VwYW5jeVwiO1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGVzdEVuY2xvc3VyZShcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGJ1ZmZlcnM6IHsgYWN0aW46IEdQVUJ1ZmZlcjsgbWVtYnJhbmU6IEdQVUJ1ZmZlciB9LFxuICBjb3VudHM6IHsgYWN0aW46IG51bWJlcjsgbWVtYnJhbmU6IG51bWJlciB9LFxuICBkaXNwYXRjaDogKCkgPT4gdm9pZCxcbiAgY29uZmlndXJlOiAoZml4ZWRBcmVhOiBib29sZWFuLCByZWZlcmVuY2VBcmVhOiBudW1iZXIpID0+IHZvaWRcbikge1xuICBjb25zdCBjaGVja3M6IHsgbmFtZTogc3RyaW5nOyBwYXNzZWQ6IGJvb2xlYW4gfVtdID0gW107XG4gIGNvbnN0IGFzc2VydCA9IChuYW1lOiBzdHJpbmcsIGNvbmRpdGlvbjogYm9vbGVhbikgPT4ge1xuICAgIGNoZWNrcy5wdXNoKHsgbmFtZSwgcGFzc2VkOiBjb25kaXRpb24gfSk7XG4gICAgaWYgKCFjb25kaXRpb24pIHRocm93IG5ldyBFcnJvcihgRW5jbG9zdXJlIGZpeHR1cmUgZmFpbGVkOiAke25hbWV9YCk7XG4gIH07XG4gIGNvbnN0IHJlYWQgPSBhc3luYyAoYnVmZmVyOiBHUFVCdWZmZXIpID0+IHtcbiAgICBjb25zdCBzdGFnZSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBidWZmZXIuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGJ1ZmZlciwgMCwgc3RhZ2UsIDAsIGJ1ZmZlci5zaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgc3RhZ2UubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCBkYXRhID0gc3RhZ2UuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICBzdGFnZS51bm1hcCgpO1xuICAgIHN0YWdlLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgY29uc3QgcnVuID0gYXN5bmMgKHBvbHlnb246IG51bWJlcltdW10sIHBvaW50czogbnVtYmVyW11bXSwgZml4ZWRBcmVhID0gZmFsc2UsIHJlZmVyZW5jZUFyZWEgPSA0MDApID0+IHtcbiAgICBjb25zdCBtZW0gPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5tZW1icmFuZS5zaXplKSxcbiAgICAgIG1mID0gbmV3IEZsb2F0MzJBcnJheShtZW0pLFxuICAgICAgbXUgPSBuZXcgVWludDMyQXJyYXkobWVtKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgICAvLyBEZW5zZSBob3Jpem9udGFsIGVkZ2VzIGFsc28gb3ZlcmZsb3cgdGhlIHNob3J0bGlzdHMsIGV4ZXJjaXNpbmcgdGhlaXJcbiAgICAgIC8vIGNvbXBsZXRlLXBvbHlnb24gZmFsbGJhY2sgcmF0aGVyIHRoYW4gb25seSBzcGFyc2UgaGFwcHktcGF0aCBiaW5zLlxuICAgICAgY29uc3QgYXQgPSAoaSAqIHBvbHlnb24ubGVuZ3RoKSAvIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIGNvbnN0IGVkZ2UgPSBNYXRoLmZsb29yKGF0KTtcbiAgICAgIGNvbnN0IGEgPSBwb2x5Z29uW2VkZ2VdLFxuICAgICAgICBiID0gcG9seWdvblsoZWRnZSArIDEpICUgcG9seWdvbi5sZW5ndGhdO1xuICAgICAgY29uc3QgcCA9IFthWzBdICsgKGJbMF0gLSBhWzBdKSAqIChhdCAtIGVkZ2UpLCBhWzFdICsgKGJbMV0gLSBhWzFdKSAqIChhdCAtIGVkZ2UpXTtcbiAgICAgIG11W2kgKiAxMF0gPSBpO1xuICAgICAgbXVbaSAqIDEwICsgNl0gPSAoaSArIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgbXVbaSAqIDEwICsgN10gPSAoaSArIGNvdW50cy5tZW1icmFuZSAtIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgbWZbaSAqIDEwICsgMl0gPSBwWzBdO1xuICAgICAgbWZbaSAqIDEwICsgM10gPSBwWzFdO1xuICAgIH1cbiAgICBjb25zdCBhY3RpbiA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmFjdGluLnNpemUpLFxuICAgICAgYWYgPSBuZXcgRmxvYXQzMkFycmF5KGFjdGluKSxcbiAgICAgIGF1ID0gbmV3IFVpbnQzMkFycmF5KGFjdGluKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5hY3RpbjsgaSsrKSB7XG4gICAgICBhdVtpICogMTBdID0gYXVbaSAqIDEwICsgNl0gPSBhdVtpICogMTAgKyA3XSA9IGk7XG4gICAgfVxuICAgIHBvaW50cy5mb3JFYWNoKChbeCwgeV0sIGkpID0+IHtcbiAgICAgIGFmW2kgKiAxMCArIDJdID0geDtcbiAgICAgIGFmW2kgKiAxMCArIDNdID0geTtcbiAgICAgIGF1W2kgKiAxMCArIDZdID0gaSA9PT0gMCA/IDAgOiBpIC0gMTtcbiAgICAgIGF1W2kgKiAxMCArIDddID0gaSA9PT0gcG9pbnRzLmxlbmd0aCAtIDEgPyBpIDogaSArIDE7XG4gICAgfSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUsIDAsIG1lbSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMuYWN0aW4sIDAsIGFjdGluKTtcbiAgICBjb25maWd1cmUoZml4ZWRBcmVhLCByZWZlcmVuY2VBcmVhKTtcbiAgICBkaXNwYXRjaCgpO1xuICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgcmV0dXJuIHsgYWN0aW46IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSksIG1lbWJyYW5lOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5tZW1icmFuZSkpIH07XG4gIH07XG4gIGxldCByZXN1bHQgPSBhd2FpdCBydW4oXG4gICAgW1xuICAgICAgWzAsIDBdLFxuICAgICAgWzIwLCAwXSxcbiAgICAgIFsyMCwgMjBdLFxuICAgICAgWzAsIDIwXSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFsyNSwgMV0sXG4gICAgICBbMjYsIDFdLFxuICAgIF1cbiAgKTtcbiAgbGV0IGluc2lkZSA9IHBvbHlnb25PY2N1cGFuY3kocmVzdWx0Lm1lbWJyYW5lLCAxMCwgdHJ1ZSk7XG4gIGFzc2VydChcImVzY2FwZWQgZmlsYW1lbnQgYmVhZHMgYXJlIHByb2plY3RlZCBpbnNpZGVcIiwgaW5zaWRlKHJlc3VsdC5hY3RpblsyXSwgcmVzdWx0LmFjdGluWzNdKSAmJiBpbnNpZGUocmVzdWx0LmFjdGluWzEyXSwgcmVzdWx0LmFjdGluWzEzXSkpO1xuICBsZXQgd29yZHMgPSBuZXcgVWludDMyQXJyYXkocmVzdWx0LmFjdGluLmJ1ZmZlcik7XG4gIGFzc2VydChcbiAgICBcImNvbnRhY3QgcHJlc2VydmVzIGNvbm5lY3Rpdml0eSBhbmQgZmluaXRlIHJlc2Vydm9pciBhbW91bnRcIixcbiAgICB3b3Jkc1s3XSA9PT0gMSAmJlxuICAgICAgd29yZHNbMTZdID09PSAwICYmXG4gICAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb3VudHMuYWN0aW4gLSAyIH0sIChfLCBrKSA9PiBrICsgMikuZXZlcnkoKGkpID0+IHdvcmRzW2kgKiAxMCArIDZdID09PSBpICYmIHdvcmRzW2kgKiAxMCArIDddID09PSBpKVxuICApO1xuICByZXN1bHQgPSBhd2FpdCBydW4oXG4gICAgW1xuICAgICAgWzAsIDBdLFxuICAgICAgWzgsIDBdLFxuICAgICAgWzgsIDNdLFxuICAgICAgWzMsIDNdLFxuICAgICAgWzMsIDhdLFxuICAgICAgWzAsIDhdLFxuICAgIF0sXG4gICAgW1xuICAgICAgWzcsIDFdLFxuICAgICAgWzEsIDddLFxuICAgIF1cbiAgKTtcbiAgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShyZXN1bHQubWVtYnJhbmUsIDEwLCB0cnVlKTtcbiAgY29uc3QgY3Jvc3NpbmcgPSBwb2x5Z29uQm9uZENyb3NzaW5nKHJlc3VsdC5tZW1icmFuZSk7XG4gIGFzc2VydChcbiAgICBcImludGVyaW9yIGVuZHBvaW50cyBjYW5ub3QgYnJpZGdlIGFjcm9zcyBhIGNvbmNhdmUgZXh0ZXJpb3JcIixcbiAgICBpbnNpZGUocmVzdWx0LmFjdGluWzEyXSwgcmVzdWx0LmFjdGluWzEzXSkgJiYgIWNyb3NzaW5nKHJlc3VsdC5hY3RpblsyXSwgcmVzdWx0LmFjdGluWzNdLCByZXN1bHQuYWN0aW5bMTJdLCByZXN1bHQuYWN0aW5bMTNdKVxuICApO1xuICByZXN1bHQgPSBhd2FpdCBydW4oXG4gICAgW1xuICAgICAgWzAsIDBdLFxuICAgICAgWzIwLCAwXSxcbiAgICAgIFsyMCwgMjBdLFxuICAgICAgWzAsIDIwXSxcbiAgICBdLFxuICAgIFtdLFxuICAgIHRydWUsXG4gICAgOTAwXG4gICk7XG4gIGxldCBhcmVhMiA9IDAsXG4gICAgY3ggPSAwLFxuICAgIGN5ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMubWVtYnJhbmU7IGkrKykge1xuICAgIGNvbnN0IGogPSAoaSArIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgIGNvbnN0IGF4ID0gcmVzdWx0Lm1lbWJyYW5lW2kgKiAxMCArIDJdLFxuICAgICAgYXkgPSByZXN1bHQubWVtYnJhbmVbaSAqIDEwICsgM107XG4gICAgY29uc3QgYnggPSByZXN1bHQubWVtYnJhbmVbaiAqIDEwICsgMl0sXG4gICAgICBieSA9IHJlc3VsdC5tZW1icmFuZVtqICogMTAgKyAzXTtcbiAgICBjb25zdCBjcm9zcyA9IGF4ICogYnkgLSBheSAqIGJ4O1xuICAgIGFyZWEyICs9IGNyb3NzO1xuICAgIGN4ICs9IChheCArIGJ4KSAqIGNyb3NzO1xuICAgIGN5ICs9IChheSArIGJ5KSAqIGNyb3NzO1xuICB9XG4gIGFzc2VydChcImFyZWEgY2xvc3VyZSByZWFjaGVzIHRoZSBkZWNsYXJlZCByZWZlcmVuY2UgYXJlYVwiLCBNYXRoLmFicyhhcmVhMiAvIDIgLSA5MDApIDwgMC4wMik7XG4gIGFzc2VydChcImFyZWEgY2xvc3VyZSBwcmVzZXJ2ZXMgdGhlIGN1cnJlbnQgZ2VvbWV0cmljIGNlbnRyb2lkXCIsIE1hdGguYWJzKGN4IC8gKDMgKiBhcmVhMikgLSAxMCkgPCAwLjAwMSAmJiBNYXRoLmFicyhjeSAvICgzICogYXJlYTIpIC0gMTApIDwgMC4wMDEpO1xuICB3b3JkcyA9IG5ldyBVaW50MzJBcnJheShyZXN1bHQuYWN0aW4uYnVmZmVyKTtcbiAgYXNzZXJ0KFxuICAgIFwiZ2VvbWV0cnkgY2hhbmdlcyBkbyBub3QgbWFudWZhY3R1cmUgb3IgZGlzY2FyZCBHLWFjdGluXCIsXG4gICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnRzLmFjdGluIH0sIChfLCBpKSA9PiBpKS5ldmVyeSgoaSkgPT4gd29yZHNbaSAqIDEwICsgNl0gPT09IGkgJiYgd29yZHNbaSAqIDEwICsgN10gPT09IGkpXG4gICk7XG4gIHJldHVybiBjaGVja3M7XG59XG4iLCJpbXBvcnQgR1VJIGZyb20gXCJsaWwtZ3VpXCI7XG5pbXBvcnQgeyByZXF1ZXN0RGV2aWNlLCBjb25maWd1cmVDYW52YXMsIGNyZWF0ZVNoYWRlciwgc2V0dXBJbnRlcmFjdGlvbnMsIHNldHVwVGV4dHVyZXMsIGdldFJhbmRvbVZhbHVlcyB9IGZyb20gXCIuL3V0aWxzXCI7XG5pbXBvcnQgcmVuZGVyQ29kZSBmcm9tIFwiLi9zaGFkZXJzL3JlbmRlci53Z3NsXCI7XG5pbXBvcnQgc2ltdWxhdGVDb2RlIGZyb20gXCIuL3NoYWRlcnMvc2ltdWxhdGUud2dzbFwiO1xuaW1wb3J0IHsgY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcywgcnVuU2ltdWxhdGlvblN0ZXAsIHJ1bkVuY2xvc3VyZSwgcnVuQ29udGFjdFJlcGFpciB9IGZyb20gXCIuL3NpbXVsYXRlXCI7XG5pbXBvcnQgeyBDb250YWN0UmVjb3ZlcnksIGNsYXNzaWZ5Q2hlY2twb2ludCB9IGZyb20gXCIuL2NvbnRhY3QtcmVjb3ZlcnlcIjtcblxuLy8gSW1wb3J0IHNoYWRlciBpbmNsdWRlc1xuaW1wb3J0IGJpbmRpbmdzQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL2JpbmRpbmdzLndnc2xcIjtcbmltcG9ydCB0ZXh0dXJlc0NvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy90ZXh0dXJlcy53Z3NsXCI7XG5pbXBvcnQgYnVmZmVyc0NvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9idWZmZXJzLndnc2xcIjtcbmltcG9ydCByYW5kb21Db2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvcmFuZG9tLndnc2xcIjtcbmltcG9ydCBhY3RvbXlvc2luQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL2FjdG9teW9zaW4ud2dzbFwiO1xuaW1wb3J0IGVuY2xvc3VyZUNvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9lbmNsb3N1cmUud2dzbFwiO1xuaW1wb3J0IHsgUmVuZGVyTW9kdWxlIH0gZnJvbSBcIi4vcmVuZGVyXCI7XG5pbXBvcnQgeyBTcHJvdXRTY2hlZHVsZXIsIE1BWF9TUFJPVVRfU0lURVMgfSBmcm9tIFwiLi9zcHJvdXRzXCI7XG5pbXBvcnQgeyBBY3RpblRlbGVtZXRyeSB9IGZyb20gXCIuL3RlbGVtZXRyeVwiO1xuaW1wb3J0IHsgc2VlZGVkUmFuZG9tIH0gZnJvbSBcIi4vcmFuZG9tXCI7XG5pbXBvcnQgeyB0ZXN0TWVjaGFuaWNzIH0gZnJvbSBcIi4vbWVjaGFuaWNzLXRlc3RcIjtcbmltcG9ydCB7IHRlc3RFbmNsb3N1cmUgfSBmcm9tIFwiLi9lbmNsb3N1cmUtdGVzdFwiO1xuaW1wb3J0IHsgdGVzdFJlbmV3YWwgfSBmcm9tIFwiLi9yZW5ld2FsLXRlc3RcIjtcbmltcG9ydCB7IEZyYW1lQnVkZ2V0LCBMaXZlUGVyZm9ybWFuY2UgfSBmcm9tIFwiLi9yZWFsdGltZVwiO1xuXG4vLyBTaGFkZXIgaW5jbHVkZXMgbWFwcGluZ1xuY29uc3Qgc2hhZGVySW5jbHVkZXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7XG4gIGJpbmRpbmdzOiBiaW5kaW5nc0NvZGUsXG4gIHRleHR1cmVzOiB0ZXh0dXJlc0NvZGUsXG4gIGJ1ZmZlcnM6IGJ1ZmZlcnNDb2RlLFxuICByYW5kb206IHJhbmRvbUNvZGUsXG4gIGFjdG9teW9zaW46IGFjdG9teW9zaW5Db2RlLFxuICBlbmNsb3N1cmU6IGVuY2xvc3VyZUNvZGUsXG59O1xuXG4vLyBTaXplcyBpbiBieXRlcyAtIHVzZWZ1bCBmb3IgY2FsY3VsYXRpbmcgYnVmZmVyIHNpemVzIGFuZCBvZmZzZXRzXG5jb25zdCBzaXplMzIgPSA0OyAvLyBzaXplIG9mIGEgMzItYml0IGZsb2F0IG9yIGludFxuXG4vLyBVbmlmb3JtIHZhbHVlcyBjb250YWluZXJcbmNvbnN0IHVuaWZvcm1zID0ge1xuICBjb21wdXRlU3RlcHNQZXJGcmFtZTogNCxcbiAgdGFyZ2V0RlBTOiA2MCxcbiAgc2ltdWxhdGlvblNjYWxlOiAxLjAsIC8vIHRleHR1cmUgcGl4ZWxzIHBlciBzY3JlZW4gKENTUykgcGl4ZWw7IHRoZSBjZWxsIHNjYWxlcyB3aXRoIGl0IGluIHBpeGVscywgc28gaXQgbG9va3MgdGhlIHNhbWUgc2l6ZSBvbiBzY3JlZW5cbiAgYWN0aW5Db3VudDogMSAqIDI1NiAqIDI1NiwgLy8gNDAwMCBpcyBtaW5pbXVtIGZvciBuaWNlIGFjdGlvbi5cbiAgbWVtYnJhbmVDb3VudDogNiAqIDI1NixcbiAgc3RpZmZuZXNzOiAwLjUsXG4gIGZvb2ROZWFyYnlUaHJlc2hvbGQ6IDAuMDAxLFxuICBkaXNjb25uZWN0aW9uUHJvYmFiaWxpdHk6IDAuMDA2LFxuICBtb25vbWVyTWVtYnJhbmVSZXB1bHNpb246IDAuMDksIC8vIGhvdyBoYXJkIG1vbm9tZXJzIGFyZSBwdXNoZWQgb2ZmIHRoZSBtZW1icmFuZTogMS4wIGxlYXZlcyBhIH44IHB4IGdhcCwgMC4xIGFib3V0IDQgcHhcbiAgcG9seW1lclJlcHVsc2lvbjogMC40MjIsXG4gIHN0ZXJpY1NhbXBsaW5nUmFuZ2U6IDIsXG4gIGFjdGluQ29oZXNpb25SYW5nZTogMSxcbiAgYmluZFByb2I6IDAuMDMsXG4gIGJpbmRMZW5ndGhGbG9vcjogMiwgLy8gZmlsYW1lbnRzIHNob3J0ZXIgdGhhbiB0aGlzIGJpbmQgYXQgYmluZFByb2IgKiB0aGlzIChhIGxvbmUgbW9ub21lciBhdCBiaW5kUHJvYik7IGxvbmdlciBvbmVzIGF0IGJpbmRQcm9iICogbGVuZ3RoXG4gIGJpbmRMZW5ndGhTYXR1cmF0aW9uOiAyMCwgLy8gZmlsYW1lbnRzIGxvbmdlciB0aGFuIHRoaXMgYmluZCBubyBtb3JlIHJlYWRpbHkgKG1heCA2NClcbiAgYWN0aW5TdGVyaWNGb3JjZTogMC4yLFxuICBlcXVpbGlicml1bUxpbmVEaXN0YW5jZTogMi4wLCAvLyBhY3RpbiByZXN0IGxlbmd0aCBpbiBwaXhlbHM7IHNldHMgZmlsYW1lbnQgc3BhY2luZyBub3cgdGhhdCBhIGZpbGFtZW50IGRvZXNuJ3QgcmVwZWwgaXRzZWxmXG4gIG1vdmVtZW50TW9kZTogMCwgLy8gSWRsZTogcG9seW1lcml6YXRpb24gb25seSBjb21lcyBmcm9tIHRoZSBzcHJvdXQgc2l0ZXNcbiAgbWVtYnJhbmVSZXN0TGVuZ3RoOiAyLjAgLyAzLjAsIC8vIHdpdGggNnggdGhlIG9yaWdpbmFsIDI1NiBub2RlcyBhdCByZXN0IGxlbmd0aCAyIHRoZSBjZWxsIGlzIDJ4IHdpZGVyIGluIHBpeGVscywgbWF0Y2hpbmcgc2ltdWxhdGlvblNjYWxlXG4gIG1lbWJyYW5lU3RpZmZuZXNzOiAzLjAsIC8vIGhvdyBoYXJkIGEgc3RyZXRjaGVkIG1lbWJyYW5lIHB1bGxzIGluLCBhbG9uZyBpdHMgY3VydmF0dXJlXG4gIGxhbWVsbGlwb2RpdW1TdHJlbmd0aDogMC4xNSwgLy8gcG9seW1lcml6YXRpb24gZmllbGQgZW1pdHRlZCBieSB0aGUgZnJvbnQgb2YgdGhlIG1lbWJyYW5lLCB3aGVyZSBmaWxhbWVudHMgYWxzbyBicmFuY2g7IDAgPSBvZmZcbiAgbGFtZWxsaXBvZGl1bVdpZHRoOiAwLjAzNiwgLy8gZnJhY3Rpb24gb2YgdGhlIG1lbWJyYW5lLCBjZW50ZXJlZCBvbiB0aGUgZnJvbnQgKHRoZSByaWdodCBzaWRlIGF0IHJlc2V0KSwgdGhhdCBlbWl0cyBpdFxuICBsYW1lbGxpcG9kaXVtRmllbGREZWNheTogMC45OCwgLy8gcGVyLXN0ZXAgZGVjYXkgb2YgdGhhdCBmaWVsZFxuICBicmFuY2hQcm9iYWJpbGl0eTogMC4wMSwgLy8gcGVyIHN0ZXAsIGZvciBhIG1vbm9tZXIgbmV4dCB0byBhIGZpbGFtZW50IGluIHRoZSBsYW1lbGxpcG9kaXVtIGZpZWxkIGF0IHN0cmVuZ3RoIDFcbiAgZGVicmFuY2hQcm9iYWJpbGl0eTogMC4wMDA1LCAvLyBwZXIgc3RlcCwgZm9yIGVhY2ggYnJhbmNoIHRvIGNvbWUgb2ZmIGl0cyBtb3RoZXIgZmlsYW1lbnRcbiAgYWN0aW5CZW5kU3RpZmZuZXNzOiA0LjAsIC8vIGhvdyBmYXN0IGFuIGFjdGluJ3MgZGlyZWN0b3IgdHVybnMgdG93YXJkIGl0cyBuZWlnaGJvdXJzJyAoQ29zc2VyYXQgYmVuZGluZyk7IDAgPSBmbG9wcHlcbiAgYWN0aW5Db3NzZXJhdEl0ZXJhdGlvbnM6IDgsIC8vIENvc3NlcmF0IHBhc3NlcyBwZXIgc2ltdWxhdGlvbiBzdGVwOyBtb3JlID0gc3RpZmZlciwgc3RyYWlnaHRlbnMgbG9uZyBmaWxhbWVudHMgZmFzdGVyXG4gIHN0ZXJpY1NlbGZOZWlnaGJvcnM6IDYsIC8vIGZpbGFtZW50IG5laWdoYm91cnMgb24gZWFjaCBzaWRlIHRoYXQgZG9uJ3QgcmVwZWwgYW4gYWN0aW4gKG1heCAxMik7IHRoZSByZXN0IGxlbmd0aCBzcGFjZXMgdGhlbVxuICBtZW1icmFuZUZsb3c6IDAuNSwgLy8gaG93IGZhc3QgbWVtYnJhbmUgc2xpZGVzIHRvd2FyZCBzdHJldGNoZWQgcmVnaW9ucyAodGFuZ2VudGlhbCBzcGFjaW5nIGVxdWFsaXphdGlvbilcbiAgbWVtYnJhbmVGbG93SXRlcmF0aW9uczogOCwgLy8gdGFuZ2VudGlhbCBmbG93IHBhc3NlcyBwZXIgc2ltdWxhdGlvbiBzdGVwXG4gIG1lbWJyYW5lU21vb3RoaW5nOiAwLjAyLCAvLyBwdWxsIHRvd2FyZCB0aGUgbmVpZ2hib3VycycgbWlkcG9pbnQgcGVyIHN0ZXA7IHJlbGF4ZXMgaWRsZSBwcm90cnVzaW9ucyBhbmQgY3VzcHNcbiAgcG9seW1lcml6YXRpb25QYXRjaFNpemU6IDAuMDIsIC8vIGZyYWN0aW9uIG9mIHRoZSBtZW1icmFuZSB0aGF0IHBvbHltZXJpemVzIGluIE1vdmUgRWFzdCBtb2RlXG4gIHBvbHltZXJpemF0aW9uRmllbGREZWNheTogMC45NSwgLy8gcGVyLXN0ZXAgZGVjYXkgb2YgdGhlIHBvbHltZXJpemF0aW9uIGZpZWxkOyBsb3dlciA9IG1vcmUgbG9jYWwgPSB0aGlubmVyIHByb3RydXNpb25zXG4gIHNwcm91dENvdW50OiA2LCAvLyBtYXggbnVtYmVyIG9mIHNob3J0LWxpdmVkIHBvbHltZXJpemF0aW9uIHNpdGVzIGF0IG9uY2VcbiAgc3Byb3V0V2lkdGg6IDEsIC8vIG1lbWJyYW5lIG5vZGVzIGNvdmVyZWQgYnkgb25lIHNpdGVcbiAgc3Byb3V0RnJvbnRCaWFzOiAwLjc1LCAvLyBmcmFjdGlvbiBvZiBzaXRlcyBwbGFjZWQgbmVhciB0aGUgZnJvbnQsIHRoZSByZXN0IGFueXdoZXJlIGluIHRoZSBmcm9udCAzMCVcbiAgc3Byb3V0T25TdGVwczogNjAwMCwgLy8gYXZlcmFnZSBzaW11bGF0aW9uIHN0ZXBzIGEgc2l0ZSBzdGF5cyBvblxuICBzcHJvdXRPZmZTdGVwczogMTUwMCwgLy8gYXZlcmFnZSBzaW11bGF0aW9uIHN0ZXBzIGEgc2l0ZSBzdGF5cyBvZmZcbiAgbXlvc2luU3RyZW5ndGg6IDAsIC8vIG9wdC1pbiB1bnRpbCBtYXRjaGVkIGNvbXBhcmlzb25zIGVzdGFibGlzaCBhIGJlbmVmaXRcbiAgbXlvc2luU3BlZWQ6IDAuMDIsXG4gIG1lbWJyYW5lQ291cGxpbmc6IDAsXG4gIHN1YnN0cmF0ZURyYWc6IDQsXG4gIGNvcnRleFBvbHltZXJpemF0aW9uOiAwLCAvLyBkaXN0aW5jdCBvcHRpb25hbCBoeXBvdGhlc2lzOiBhIHBvc3RlcmlvciBhY3RpbiBzdWJzdHJhdGVcbiAgbW9ub21lck9wYWNpdHk6IDAuMiwgLy8gdmlzdWFsIG9ubHk6IGtlZXAgdGhlIGV4cGxpY2l0IGZpbGFtZW50cyBsZWdpYmxlXG4gIGdBY3RpbkZpZWxkOiAxLCAvLyBmaW5pdGUgd2VsbC1taXhlZCBwb29sIHBsdXMgZXhwbGljaXQtZmlsYW1lbnQgY29udGFpbm1lbnRcbiAgYXJlYUNvbnNlcnZhdGlvbjogMSwgLy8gaW1wb3NlZCBhcmVhLCBhIDItRCB2b2x1bWUgc3Vycm9nYXRlLCBub3QgbWVhc3VyZWQgcHJlc3N1cmVcbiAgYWRhcHRpdmVGcmFtZXM6IDEsXG4gIGN1ZVg6IDAsXG4gIGN1ZVk6IDAsXG4gIGN1ZUVuYWJsZWQ6IDAsXG4gIHBvbGFyaXR5TW9kZTogMCxcbiAgcG9sYXJpdHlUdXJuUmF0ZTogMC4wMixcbiAgcmVhclR1cm5vdmVyOiAwLFxuICB0dXJub3ZlckFnZTogNTAwLFxuICB0ZXRoZXJUdXJub3ZlcjogMCxcbiAgdGV0aGVyT25SYXRlOiAwLjAyLFxuICB0ZXRoZXJPZmZSYXRlOiAwLjAwMixcbiAgdGV0aGVyUmVjb3ZlcnlTdGVwczogNDAsXG4gIG1vdG9yUmVhckJpYXM6IDAsXG4gIGZyb250QWxpZ25tZW50OiAwLFxuICB0ZXRoZXJMb2FkT2ZmOiAwLjAwMixcbiAgY29sb3VyQWdlOiAwLFxufTtcblxuLy8gbnVtZXJpYyB1bmlmb3JtcyBjYW4gYmUgb3ZlcnJpZGRlbiBmcm9tIHRoZSBVUkwsIGUuZy4gP2JpbmRQcm9iPTAuMDUmZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U9MjsgP3J1bj1uYW1lIGxhYmVscyB0aGUgdGVsZW1ldHJ5XG5jb25zdCB1cmxQYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpO1xuY29uc3Qgc2hvd2Nhc2UgPSB1cmxQYXJhbXMuc2l6ZSA9PT0gMCB8fCB1cmxQYXJhbXMuZ2V0KFwiZGVtb1wiKSA9PT0gXCIxXCI7XG5pZiAoc2hvd2Nhc2UpXG4gIE9iamVjdC5hc3NpZ24odW5pZm9ybXMsIHtcbiAgICBtZW1icmFuZVJlc3RMZW5ndGg6IDEgLyAzLFxuICAgIG15b3NpblN0cmVuZ3RoOiAwLjA1LFxuICAgIG1lbWJyYW5lQ291cGxpbmc6IDAuMDUsXG4gICAgZ0FjdGluRmllbGQ6IDEsXG4gICAgYXJlYUNvbnNlcnZhdGlvbjogMSxcbiAgICBwb2xhcml0eU1vZGU6IDEsXG4gICAgcmVhclR1cm5vdmVyOiAwLjAxLFxuICAgIHRldGhlclR1cm5vdmVyOiAxLFxuICAgIG1vdG9yUmVhckJpYXM6IDEsXG4gICAgZnJvbnRBbGlnbm1lbnQ6IDAuOCxcbiAgICBjb2xvdXJBZ2U6IDEsXG4gIH0pO1xuY29uc3Qgc2VlZCA9IE51bWJlcih1cmxQYXJhbXMuZ2V0KFwic2VlZFwiKSA/PyA0MikgPj4+IDA7XG5jb25zdCBpbml0aWFsUmFuZG9tID0gc2VlZGVkUmFuZG9tKHNlZWQpO1xuZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgdXJsUGFyYW1zKSB7XG4gIGlmIChrZXkgaW4gdW5pZm9ybXMgJiYgTnVtYmVyLmlzRmluaXRlKE51bWJlcih2YWx1ZSkpKSB7XG4gICAgKHVuaWZvcm1zIGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj4pW2tleV0gPSBOdW1iZXIodmFsdWUpO1xuICB9XG59XG5mb3IgKGNvbnN0IFtuYW1lLCBtYXhpbXVtXSBvZiBPYmplY3QuZW50cmllcyh7XG4gIG15b3NpblN0cmVuZ3RoOiAwLjIsXG4gIG15b3NpblNwZWVkOiAwLjEsXG4gIG1lbWJyYW5lQ291cGxpbmc6IDAuMixcbiAgc3Vic3RyYXRlRHJhZzogMjAsXG4gIGNvcnRleFBvbHltZXJpemF0aW9uOiAwLjEsXG4gIG1vbm9tZXJPcGFjaXR5OiAxLFxuICBnQWN0aW5GaWVsZDogMSxcbiAgYXJlYUNvbnNlcnZhdGlvbjogMSxcbiAgcG9sYXJpdHlNb2RlOiAxLFxuICBwb2xhcml0eVR1cm5SYXRlOiAwLjIsXG4gIHJlYXJUdXJub3ZlcjogMC4yLFxuICB0ZXRoZXJUdXJub3ZlcjogMSxcbiAgdGV0aGVyT25SYXRlOiAxLFxuICB0ZXRoZXJPZmZSYXRlOiAwLjIsXG4gIG1vdG9yUmVhckJpYXM6IDEsXG4gIGZyb250QWxpZ25tZW50OiAxLFxuICB0ZXRoZXJMb2FkT2ZmOiAwLjEsXG4gIGNvbG91ckFnZTogMSxcbn0pKSB7XG4gIGNvbnN0IHZhbHVlcyA9IHVuaWZvcm1zIGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG4gIHZhbHVlc1tuYW1lXSA9IE1hdGgubWF4KDAsIE1hdGgubWluKG1heGltdW0sIHZhbHVlc1tuYW1lXSkpO1xufVxuXG5jb25zdCBERUJVR01PREUgPSBmYWxzZTtcbmNvbnN0IGRlYnVnU2l6ZSA9IDIwMDtcbmNvbnN0IFdPUktHUk9VUF9TSVpFID0gMjU2O1xuXG5hc3luYyBmdW5jdGlvbiBpbmRleCgpIHtcbiAgY29uc3QgaXNNb2JpbGVEZXZpY2UgPSAvQW5kcm9pZHxpUGhvbmV8aVBhZHxpUG9kfE9wZXJhIE1pbml8SUVNb2JpbGV8V1BEZXNrdG9wL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgaWYgKGlzTW9iaWxlRGV2aWNlKSB7XG4gICAgdW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWUgPSAxO1xuICB9XG5cbiAgLy8gc2V0dXAgYW5kIGNvbmZpZ3VyZSBXZWJHUFVcbiAgY29uc3QgZGV2aWNlID0gYXdhaXQgcmVxdWVzdERldmljZSgpO1xuICAvLyBHZXQgdGhlIGV4aXN0aW5nIGNhbnZhcyBmcm9tIHRoZSBET00gaW5zdGVhZCBvZiBjcmVhdGluZyBhIG5ldyBvbmVcbiAgY29uc3QgY2FudmFzID0gY29uZmlndXJlQ2FudmFzKGRldmljZSwgXCJtYWluLWNhbnZhc1wiLCB7XG4gICAgd2lkdGg6IE1hdGgucm91bmQoTWF0aC5tYXgoc2hvd2Nhc2UgPyAxMjgwIDogMCwgd2luZG93LmlubmVyV2lkdGgpICogdW5pZm9ybXMuc2ltdWxhdGlvblNjYWxlKSxcbiAgICBoZWlnaHQ6IE1hdGgucm91bmQoTWF0aC5tYXgoc2hvd2Nhc2UgPyA5NjAgOiAwLCB3aW5kb3cuaW5uZXJIZWlnaHQpICogdW5pZm9ybXMuc2ltdWxhdGlvblNjYWxlKSxcbiAgfSk7XG5cbiAgbGV0IHRpbWUgPSAwO1xuICBsZXQgcGF1c2VkID0gdXJsUGFyYW1zLmhhcyhcInBhdXNlZFwiKTtcbiAgbGV0IG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gZmFsc2U7XG4gIGxldCBjb250cm9sc0RpcnR5ID0gZmFsc2U7XG4gIGxldCBjdWVWZXJzaW9uID0gMDtcbiAgY29uc3QgZnJhbWVCdWRnZXQgPSBuZXcgRnJhbWVCdWRnZXQoKTtcbiAgY29uc3QgbGl2ZVBlcmZvcm1hbmNlID0gbmV3IExpdmVQZXJmb3JtYW5jZSgpO1xuICBjb25zdCBydW50aW1lRXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBmdW5jdGlvbiBzZXRQYXVzZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBwYXVzZWQgPSB2YWx1ZTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhdXNlLWRlbW9cIikhLnRleHRDb250ZW50ID0gcGF1c2VkID8gXCJSZXN1bWVcIiA6IFwiUGF1c2VcIjtcbiAgICBpZiAoIXZhbHVlKSBsaXZlUGVyZm9ybWFuY2UuY2xlYXJGcmFtZXMoKTtcbiAgfVxuICBmdW5jdGlvbiBzdG9wU2ltdWxhdGlvbihlcnJvcjogdW5rbm93bikge1xuICAgIGNvbnN0IHRleHQgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgaWYgKCFydW50aW1lRXJyb3JzLmluY2x1ZGVzKHRleHQpKSBydW50aW1lRXJyb3JzLnB1c2godGV4dCk7XG4gICAgc2V0UGF1c2VkKHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gYFN0b3BwZWQ6ICR7dGV4dH1gO1xuICAgIGNvbnN0IG5vdGljZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVtby1ub3RpY2VcIikhO1xuICAgIG5vdGljZS5oaWRkZW4gPSBmYWxzZTtcbiAgICBub3RpY2UudGV4dENvbnRlbnQgPSBgU2ltdWxhdGlvbiBwYXVzZWQ6ICR7dGV4dH1gO1xuICB9XG4gIGNvbnN0IGdwdUVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgZGV2aWNlLmFkZEV2ZW50TGlzdGVuZXIoXCJ1bmNhcHR1cmVkZXJyb3JcIiwgKGV2ZW50KSA9PiB7XG4gICAgZ3B1RXJyb3JzLnB1c2goZXZlbnQuZXJyb3IubWVzc2FnZSk7XG4gICAgc3RvcFNpbXVsYXRpb24oYEdQVSBlcnJvcjogJHtldmVudC5lcnJvci5tZXNzYWdlfWApO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gYEdQVSBlcnJvcjogJHtldmVudC5lcnJvci5tZXNzYWdlfWA7XG4gIH0pO1xuICBkZXZpY2UubG9zdC50aGVuKChpbmZvKSA9PiBncHVFcnJvcnMucHVzaChgRGV2aWNlIGxvc3Q6ICR7aW5mby5tZXNzYWdlfWApKTtcblxuICBjb25zdCBHUk9VUF9JTkRFWCA9IDA7XG4gIGNvbnN0IEJJTkRJTkdTX0JVRkZFUiA9IHsgQ0FOVkFTOiAwLCBDT05UUk9MUzogMSwgSU5URVJBQ1RJT05TOiAyIH07XG4gIGNvbnN0IEJJTkRJTkdTX1RFWFRVUkUgPSB7XG4gICAgSU5ERVg6IDMsXG4gICAgU1RFUklDX1BPVEVOVElBTDogNCxcbiAgICBQQVJBTUVURVJfRklFTERTOiA1LFxuICB9O1xuXG4gIGNvbnN0IEJJTkRJTkdTX0FHRU5UUyA9IHtcbiAgICBSQU5ET006IDYsXG4gICAgTUVNQlJBTkU6IDcsXG4gICAgQUNUSU46IDgsXG4gICAgQ09OTkVDVElPTl9MT0NLUzogOSxcbiAgICBURUxFTUVUUlk6IDEyLFxuICAgIE1FQ0hBTklDQUxfU05BUFNIT1Q6IDEzLFxuICAgIE1FQ0hBTklDQUxfTElOS1M6IDE0LFxuICAgIE1FQ0hBTklDQUxfRk9SQ0VTOiAxNSxcbiAgfTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU2V0IHVwIG1lbW9yeSByZXNvdXJjZXNcbiAgdmFyIGFjdHVhbFdpZHRoID0gY2FudmFzLnNpemUud2lkdGg7XG4gIHZhciBhY3R1YWxIZWlnaHQgPSBjYW52YXMuc2l6ZS5oZWlnaHQ7XG4gIGlmIChERUJVR01PREUpIHtcbiAgICBhY3R1YWxXaWR0aCA9IGRlYnVnU2l6ZTtcbiAgICBhY3R1YWxIZWlnaHQgPSBkZWJ1Z1NpemU7XG4gIH1cblxuICBjb25zdCB0ZXh0dXJlcyA9IHNldHVwVGV4dHVyZXMoXG4gICAgZGV2aWNlLFxuICAgIE9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSksXG4gICAge30sXG4gICAge1xuICAgICAgZGVwdGhPckFycmF5TGF5ZXJzOiB7XG4gICAgICAgIFtCSU5ESU5HU19URVhUVVJFLlNURVJJQ19QT1RFTlRJQUxdOiAzLFxuICAgICAgICBbQklORElOR1NfVEVYVFVSRS5QQVJBTUVURVJfRklFTERTXTogNixcbiAgICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuSU5ERVhdOiA0LFxuICAgICAgfSxcbiAgICAgIHdpZHRoOiBhY3R1YWxXaWR0aCxcbiAgICAgIGhlaWdodDogYWN0dWFsSGVpZ2h0LFxuICAgIH0sXG4gICAge1xuICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuU1RFUklDX1BPVEVOVElBTF06IFwicjMyZmxvYXRcIixcbiAgICAgIFtCSU5ESU5HU19URVhUVVJFLlBBUkFNRVRFUl9GSUVMRFNdOiBcInIzMmZsb2F0XCIsXG4gICAgICBbQklORElOR1NfVEVYVFVSRS5JTkRFWF06IFwicjMydWludFwiLFxuICAgIH1cbiAgKTtcblxuICBjb25zdCBURVhUVVJFX1dPUktHUk9VUF9DT1VOVDogW251bWJlciwgbnVtYmVyXSA9IFtcbiAgICBNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS53aWR0aCAvIE1hdGguc3FydChXT1JLR1JPVVBfU0laRSkpLFxuICAgIE1hdGguY2VpbCh0ZXh0dXJlcy5zaXplLmhlaWdodCAvIE1hdGguc3FydChXT1JLR1JPVVBfU0laRSkpLFxuICBdO1xuXG4gIGNvbnN0IEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQgPSB7XG4gICAgQUNUSU46IE1hdGguY2VpbCh1bmlmb3Jtcy5hY3RpbkNvdW50IC8gV09SS0dST1VQX1NJWkUpLFxuICAgIE1FTUJSQU5FOiBNYXRoLmNlaWwodW5pZm9ybXMubWVtYnJhbmVDb3VudCAvIFdPUktHUk9VUF9TSVpFKSxcbiAgfTtcbiAgY29uc3QgTUFYX0JVRkZFUl9XT1JLR1JPVVBfQ09VTlQgPSBNYXRoLm1heCguLi5PYmplY3QudmFsdWVzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQpKTtcblxuICAvLyBzZXR1cCBpbnRlcmFjdGlvbnNcbiAgY29uc3QgaW50ZXJhY3Rpb25zID0gc2V0dXBJbnRlcmFjdGlvbnMoZGV2aWNlLCBjYW52YXMuY29udGV4dC5jYW52YXMsIHRleHR1cmVzLnNpemUpO1xuICBjb25zdCBjYW52YXNfYnVmZmVycyA9IHtcbiAgICBbQklORElOR1NfQlVGRkVSLkNBTlZBU106IHRleHR1cmVzLmNhbnZhcy5idWZmZXIsXG4gICAgW0JJTkRJTkdTX0JVRkZFUi5DT05UUk9MU106IGludGVyYWN0aW9ucy5jb250cm9scy5idWZmZXIsXG4gICAgW0JJTkRJTkdTX0JVRkZFUi5JTlRFUkFDVElPTlNdOiBpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmJ1ZmZlcixcbiAgfTtcblxuICAvLyBGdW5jdGlvbiB0byB3cml0ZSB0aGUgdW5pZm9ybXMgb2JqZWN0IGludG8gdGhlIEFycmF5QnVmZmVyIGFjY29yZGluZyB0byBXR1NMIHN0cnVjdCBsYXlvdXRcbiAgY29uc3QgY29udHJvbHNEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhpbnRlcmFjdGlvbnMuY29udHJvbHMuZGF0YSk7XG4gIGNvbnN0IGNhbnZhc1ZpZXcgPSBuZXcgRGF0YVZpZXcodGV4dHVyZXMuY2FudmFzLmRhdGEuYnVmZmVyKTtcblxuICBjb25zdCB3cml0ZVVuaWZvcm1zID0gKCkgPT4ge1xuICAgIC8vIFdyaXRlIGNhbnZhcyBzaXplXG4gICAgY2FudmFzVmlldy5zZXRJbnQzMigwLCBhY3R1YWxXaWR0aCwgdHJ1ZSk7XG4gICAgY2FudmFzVmlldy5zZXRJbnQzMig0LCBhY3R1YWxIZWlnaHQsIHRydWUpO1xuXG4gICAgLy8gQ2FudmFzLmtleSBpcyB2ZWMyPHUzMj4sIGFsaWduZWQgdG8gYnl0ZSAxNi4gVUkgY2hhbmdlcyBkbyBub3QgcmVzZWVkLlxuICAgIGNhbnZhc1ZpZXcuc2V0VWludDMyKDE2LCBzZWVkLCB0cnVlKTtcbiAgICBjYW52YXNWaWV3LnNldFVpbnQzMigyMCwgc2VlZCBeIDB4OWUzNzc5YjksIHRydWUpO1xuXG4gICAgLy8gV3JpdGUgY29udHJvbHMgd2l0aCBhZGp1c3RlZCBvZmZzZXRzOlxuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDAsIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDQsIHVuaWZvcm1zLmFjdGluQ291bnQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig4LCB1bmlmb3Jtcy5zdGlmZm5lc3MsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigxMiwgdW5pZm9ybXMuZm9vZE5lYXJieVRocmVzaG9sZCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDE2LCB1bmlmb3Jtcy5kaXNjb25uZWN0aW9uUHJvYmFiaWxpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMCwgdW5pZm9ybXMucG9seW1lclJlcHVsc2lvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRJbnQzMigyNCwgdW5pZm9ybXMuc3RlcmljU2FtcGxpbmdSYW5nZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRJbnQzMigyOCwgdW5pZm9ybXMuYWN0aW5Db2hlc2lvblJhbmdlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzIsIHVuaWZvcm1zLmJpbmRQcm9iLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzNiwgdW5pZm9ybXMuYmluZExlbmd0aFNhdHVyYXRpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDQ4LCB1bmlmb3Jtcy5iaW5kTGVuZ3RoRmxvb3IsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig0MCwgdW5pZm9ybXMuYWN0aW5TdGVyaWNGb3JjZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDQ0LCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDU2LCB1bmlmb3Jtcy5tb25vbWVyTWVtYnJhbmVSZXB1bHNpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDUyLCB1bmlmb3Jtcy5tb3ZlbWVudE1vZGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig2MCwgdW5pZm9ybXMubWVtYnJhbmVTdGlmZm5lc3MsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig3MiwgdW5pZm9ybXMucG9seW1lcml6YXRpb25QYXRjaFNpemUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig3NiwgdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjA4LCB1bmlmb3Jtcy5tZW1icmFuZVNtb290aGluZywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIxNiwgdW5pZm9ybXMucG9seW1lcml6YXRpb25GaWVsZERlY2F5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjIwLCB1bmlmb3Jtcy5tZW1icmFuZUZsb3csIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMjQsIHVuaWZvcm1zLmxhbWVsbGlwb2RpdW1TdHJlbmd0aCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIyOCwgdW5pZm9ybXMubGFtZWxsaXBvZGl1bVdpZHRoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjMyLCB1bmlmb3Jtcy5sYW1lbGxpcG9kaXVtRmllbGREZWNheSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIzNiwgdW5pZm9ybXMuYnJhbmNoUHJvYmFiaWxpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNDAsIHVuaWZvcm1zLmRlYnJhbmNoUHJvYmFiaWxpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNDQsIHVuaWZvcm1zLmFjdGluQmVuZFN0aWZmbmVzcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjQ4LCB1bmlmb3Jtcy5zdGVyaWNTZWxmTmVpZ2hib3JzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjUyLCB1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI1NiwgdW5pZm9ybXMubXlvc2luU3BlZWQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNjAsIHVuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmcsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNjQsIHVuaWZvcm1zLnN1YnN0cmF0ZURyYWcsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNjgsIHVuaWZvcm1zLmNvcnRleFBvbHltZXJpemF0aW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNjQsIHVuaWZvcm1zLm1vbm9tZXJPcGFjaXR5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMig2OCwgdW5pZm9ybXMuZ0FjdGluRmllbGQgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIxMiwgdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI3MiwgdW5pZm9ybXMuY3VlWCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI3NiwgdW5pZm9ybXMuY3VlWSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjgwLCB1bmlmb3Jtcy5jdWVFbmFibGVkID8gMSA6IDAsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDI4NCwgY3VlVmVyc2lvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjg4LCB1bmlmb3Jtcy5wb2xhcml0eU1vZGUgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI5MiwgdW5pZm9ybXMucG9sYXJpdHlUdXJuUmF0ZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI5NiwgdW5pZm9ybXMucmVhclR1cm5vdmVyLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzAwLCBNYXRoLm1heCgxLCB1bmlmb3Jtcy50dXJub3ZlckFnZSksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDMwNCwgdW5pZm9ybXMudGV0aGVyVHVybm92ZXIgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMwOCwgdW5pZm9ybXMudGV0aGVyT25SYXRlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzEyLCB1bmlmb3Jtcy50ZXRoZXJPZmZSYXRlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzMTYsIE1hdGgubWF4KDAsIHVuaWZvcm1zLnRldGhlclJlY292ZXJ5U3RlcHMpLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzIwLCB1bmlmb3Jtcy5tb3RvclJlYXJCaWFzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzI0LCB1bmlmb3Jtcy5mcm9udEFsaWdubWVudCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMyOCwgdW5pZm9ybXMudGV0aGVyTG9hZE9mZiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMzMyLCB1bmlmb3Jtcy5jb2xvdXJBZ2UgPyAxIDogMCwgdHJ1ZSk7XG5cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlciwgMCwgaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmRhdGEpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcih0ZXh0dXJlcy5jYW52YXMuYnVmZmVyLCAwLCB0ZXh0dXJlcy5jYW52YXMuZGF0YSk7XG4gIH07XG5cbiAgd3JpdGVVbmlmb3JtcygpO1xuXG4gIC8vIHNldHVwIGFnZW50c1xuICBjb25zdCByYW5kb21CdWZmZXJTaXplID0gTWF0aC5tYXgodGV4dHVyZXMuc2l6ZS53aWR0aCAqIHRleHR1cmVzLnNpemUuaGVpZ2h0LCB1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIDI1Nik7XG5cbiAgLy8gaW5pdGlhbGl6ZSByYW5kb20gYnVmZmVyXG4gIGNvbnN0IHJhbmRvbURhdGEgPSBnZXRSYW5kb21WYWx1ZXMocmFuZG9tQnVmZmVyU2l6ZSwgaW5pdGlhbFJhbmRvbSk7XG5cbiAgY29uc3QgbnVtRmxvYXRzID0gMTA7IC8vIFNlZ21lbnQgc3RydWN0IHNpemUgaW4gMzItYml0IHdvcmRzXG5cbiAgY29uc3QgYWdlbnRfYnVmZmVycyA9IHtcbiAgICBbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IDMyICogKHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICsgMiksXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU106IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogMzIgKiAoMjU2ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCksXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0ZPUkNFU106IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgLy8gUHJlZml4OiBwaHlzaWNhbCBmb3JjZSBhY2N1bXVsYXRvcnMuIFRhaWw6IGNvbnNlcnZhdGl2ZSBtZW1icmFuZS1lZGdlXG4gICAgICAvLyByb3cgc2hvcnRsaXN0czsgZXhhY3QgdGVzdHMgZmFsbCBiYWNrIHRvIGFsbCBlZGdlcyBvbiBvdmVyZmxvdy5cbiAgICAgIHNpemU6IDggKiAodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKyBNYXRoLmNlaWwoYWN0dWFsSGVpZ2h0IC8gNCkgKiAyNTcpLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLlJBTkRPTV06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgbGFiZWw6IFwiUmFuZG9tIEJ1ZmZlclwiLFxuICAgICAgc2l6ZTogcmFuZG9tRGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLkFDVElOXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiBzaXplMzIgKiBudW1GbG9hdHMgKiB1bmlmb3Jtcy5hY3RpbkNvdW50LFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IHNpemUzMiAqIG51bUZsb2F0cyAqIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5DT05ORUNUSU9OX0xPQ0tTXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBsYWJlbDogXCJBY3RpbiBDb25uZWN0aW9uIExvY2tzIEJ1ZmZlclwiLFxuICAgICAgc2l6ZTogc2l6ZTMyICogdW5pZm9ybXMuYWN0aW5Db3VudCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFLFxuICAgIH0pLFxuICB9IGFzIFJlY29yZDxudW1iZXIsIEdQVUJ1ZmZlcj47XG5cbiAgY29uc3QgdGVsZW1ldHJ5ID0gbmV3IEFjdGluVGVsZW1ldHJ5KFxuICAgIGRldmljZSxcbiAgICBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sXG4gICAgdW5pZm9ybXMuYWN0aW5Db3VudCxcbiAgICBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0sXG4gICAgdW5pZm9ybXMubWVtYnJhbmVDb3VudCxcbiAgICB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgsXG4gICAgdXJsUGFyYW1zLmdldChcInJ1blwiKSA/PyBcImRlZmF1bHRcIixcbiAgICAzMCxcbiAgICAhIXVuaWZvcm1zLmdBY3RpbkZpZWxkXG4gICk7XG4gIHRlbGVtZXRyeS5vblNhbXBsZSA9IChzKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnNldENlbGxCb3VuZHMocy5jZWxsLmxlZnQsIHMuY2VsbC5yaWdodCwgcy5jZWxsLnRvcCwgcy5jZWxsLmJvdHRvbSk7XG4gICAgaWYgKHJlY292ZXJ5LmFjdGl2ZSB8fCBzLmRpYWdub3N0aWNLaW5kID09PSBcImNvbnRhY3QtcmVjaGVja1wiKSByZXR1cm47XG4gICAgaWYgKHVuaWZvcm1zLmdBY3RpbkZpZWxkICYmIGNsYXNzaWZ5Q2hlY2twb2ludChzLCAhIXVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pID09PSBcImNvbnRhY3RzXCIpIHtcbiAgICAgIHZvaWQgcmVjb3ZlcnkucmVxdWVzdChzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW52YWxpZCA9XG4gICAgICAodW5pZm9ybXMuZ0FjdGluRmllbGQgJiYgY2xhc3NpZnlDaGVja3BvaW50KHMsICEhdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbikgPT09IFwiZmF0YWxcIikgfHxcbiAgICAgIHMuYWN0aW5CYWxhbmNlRXJyb3IgfHxcbiAgICAgIHMuYnJva2VuTGlua3MgfHxcbiAgICAgIHMuY3ljbGVzIHx8XG4gICAgICAodW5pZm9ybXMuZ0FjdGluRmllbGQgJiYgKHMuaW5zaWRlUG9seW1lckJlYWRzICE9PSBzLmluUG9seW1lciB8fCBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcykpIHx8XG4gICAgICAodW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiAmJiBNYXRoLmFicyhzLmNlbGwuYXJlYSAtIDEpID4gMC4wMDEpIHx8XG4gICAgICAhTnVtYmVyLmlzRmluaXRlKHMuY2VsbC5jZW50cm9pZFgpO1xuICAgIGlmIChpbnZhbGlkKVxuICAgICAgc3RvcFNpbXVsYXRpb24oXG4gICAgICAgIGBOdW1lcmljYWwgY2hlY2sgZmFpbGVkIGF0IHN0ZXAgJHtzLnN0ZXB9OiAke0pTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBtYXNzOiBzLmFjdGluQmFsYW5jZUVycm9yLFxuICAgICAgICAgIGluc2lkZUY6IHMuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgICAgICAgIHRvdGFsRjogcy5pblBvbHltZXIsXG4gICAgICAgICAgY3Jvc3NpbmdzOiBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICAgICAgICBicm9rZW5MaW5rczogcy5icm9rZW5MaW5rcyxcbiAgICAgICAgICBjeWNsZXM6IHMuY3ljbGVzLFxuICAgICAgICAgIGFyZWE6IHMuY2VsbC5hcmVhLFxuICAgICAgICAgIGNlbnRyb2lkWDogcy5jZWxsLmNlbnRyb2lkWCxcbiAgICAgICAgfSl9OyByZXNldCB0byByZXBsYXkuYFxuICAgICAgKTtcbiAgfTtcbiAgbGV0IGNvbnRhY3RCYWNrdXA6IEFycmF5QnVmZmVyIHwgbnVsbCA9IG51bGw7XG4gIGFzeW5jIGZ1bmN0aW9uIHJlYWRBY3RpbigpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl07XG4gICAgY29uc3Qgc3RhZ2UgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogc291cmNlLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihzb3VyY2UsIDAsIHN0YWdlLCAwLCBzb3VyY2Uuc2l6ZSk7XG4gICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICBhd2FpdCBzdGFnZS5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgICAgcmV0dXJuIHN0YWdlLmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN0YWdlLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVjb3ZlcnkgPSBuZXcgQ29udGFjdFJlY292ZXJ5KHtcbiAgICBpbnNwZWN0OiBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgICAgYXdhaXQgdGVsZW1ldHJ5LnVwZGF0ZSh0aW1lLCBmcmFtZU5yLCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBpZiAoZ3B1RXJyb3JzLmxlbmd0aCkgdGhyb3cgRXJyb3IoZ3B1RXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgcmV0dXJuIHRlbGVtZXRyeS5oaXN0b3J5LmF0KC0xKSE7XG4gICAgfSxcbiAgICBiZWdpbjogYXN5bmMgKCkgPT4ge1xuICAgICAgY29udGFjdEJhY2t1cCA9IGF3YWl0IHJlYWRBY3RpbigpO1xuICAgIH0sXG4gICAgcmVwYWlyOiBhc3luYyAoaXRlcmF0aW9ucykgPT4ge1xuICAgICAgcnVuQ29udGFjdFJlcGFpcihkZXZpY2UsIHNpbVBpcGVsaW5lcywgYmluZEdyb3VwU2ltdWxhdGUsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsIGNhbnZhcy5jYW52YXMuaGVpZ2h0LCBpdGVyYXRpb25zKTtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCByZWFkQWN0aW4oKSxcbiAgICAgICAgYmVmb3JlID0gbmV3IEZsb2F0MzJBcnJheShjb250YWN0QmFja3VwISksXG4gICAgICAgIGFmdGVyID0gbmV3IEZsb2F0MzJBcnJheShjdXJyZW50KTtcbiAgICAgIGNvbnN0IGJ1ID0gbmV3IFVpbnQzMkFycmF5KGNvbnRhY3RCYWNrdXAhKSxcbiAgICAgICAgYXUgPSBuZXcgVWludDMyQXJyYXkoY3VycmVudCk7XG4gICAgICBsZXQgbWF4aW11bSA9IDA7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFmdGVyLmxlbmd0aDsgaSArPSAxMCkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIGlmIChqICE9PSAyICYmIGogIT09IDMgJiYgYnVbaSArIGpdICE9PSBhdVtpICsgal0pIHRocm93IEVycm9yKFwiQ29udGFjdCByZXBhaXIgY2hhbmdlZCBhY3RpbiBtZXRhZGF0YVwiKTtcbiAgICAgICAgY29uc3QgZGlzcGxhY2VtZW50ID0gTWF0aC5oeXBvdChhZnRlcltpICsgMl0gLSBiZWZvcmVbaSArIDJdLCBhZnRlcltpICsgM10gLSBiZWZvcmVbaSArIDNdKTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoZGlzcGxhY2VtZW50KSkgdGhyb3cgRXJyb3IoXCJOb24tZmluaXRlIGNvbnRhY3QgY29ycmVjdGlvblwiKTtcbiAgICAgICAgbWF4aW11bSA9IE1hdGgubWF4KG1heGltdW0sIGRpc3BsYWNlbWVudCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4aW11bTtcbiAgICB9LFxuICAgIHJvbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoY29udGFjdEJhY2t1cCkgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSwgMCwgY29udGFjdEJhY2t1cCk7XG4gICAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgIH0sXG4gICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgY29udGFjdEJhY2t1cCA9IG51bGw7XG4gICAgfSxcbiAgICBmaXhlZEFyZWE6ICgpID0+ICEhdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbixcbiAgICBtYXhEaXNwbGFjZW1lbnQ6ICgpID0+IDgsXG4gICAgbm93OiAoKSA9PiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICBub3RpY2U6IChtZXNzYWdlKSA9PiB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgfSxcbiAgICBmYWlsOiBzdG9wU2ltdWxhdGlvbixcbiAgfSk7XG4gIGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLlRFTEVNRVRSWV0gPSB0ZWxlbWV0cnkuY291bnRlckJ1ZmZlcjtcblxuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuUkFORE9NXSwgLypvZmZzZXQ9Ki8gMCwgLypkYXRhPSovIHJhbmRvbURhdGEpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBPdmVyYWxsIG1lbW9yeSBsYXlvdXRcbiAgY29uc3QgdmlzaWJpbGl0eSA9IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVDtcblxuICAvLyBUaGlzIGxheW91dCBpcyBmb3Igc2hhcmVkIHJlc291cmNlcyBiZXR3ZWVuIHNpbXVsYXRpb24gYW5kIHJlbmRlcmluZ1xuICBjb25zdCBzaGFyZWRMYXlvdXRFbnRyaWVzID0gW1xuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQlVGRkVSKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgYnVmZmVyOiB7IHR5cGU6IFwidW5pZm9ybVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlIH0sXG4gICAgfSkpLFxuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSkubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgYmluZGluZzogYmluZGluZyxcbiAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCxcbiAgICAgIHN0b3JhZ2VUZXh0dXJlOiB0ZXh0dXJlcy5iaW5kaW5nTGF5b3V0W2JpbmRpbmddLFxuICAgIH0pKSxcbiAgXTtcblxuICBjb25zdCBzaGFyZWRCaW5kR3JvdXBFbnRyaWVzID0gW1xuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSkubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgYmluZGluZyxcbiAgICAgIHJlc291cmNlOiB0ZXh0dXJlcy50ZXh0dXJlc1tiaW5kaW5nXS5jcmVhdGVWaWV3KCksXG4gICAgfSkpLFxuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQlVGRkVSKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nLFxuICAgICAgcmVzb3VyY2U6IHsgYnVmZmVyOiBjYW52YXNfYnVmZmVyc1tiaW5kaW5nXSB9LFxuICAgIH0pKSxcbiAgXTtcblxuICBjb25zdCBiaW5kR3JvdXBMYXlvdXRTaW11bGF0ZSA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFNpbXVsYXRlXCIsXG4gICAgZW50cmllczogW1xuICAgICAgLi4uc2hhcmVkTGF5b3V0RW50cmllcyxcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQUdFTlRTKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICAgIGJpbmRpbmc6IGJpbmRpbmcsXG4gICAgICAgIHZpc2liaWxpdHk6IHZpc2liaWxpdHksXG4gICAgICAgIGJ1ZmZlcjogeyB0eXBlOiBcInN0b3JhZ2VcIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZSB9LFxuICAgICAgfSkpLFxuICAgIF0sXG4gIH0pO1xuXG4gIGNvbnN0IGJpbmRHcm91cFNpbXVsYXRlID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cCh7XG4gICAgbGFiZWw6IGBCaW5kIEdyb3VwYCxcbiAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dFNpbXVsYXRlLFxuICAgIGVudHJpZXM6IFtcbiAgICAgIC4uLnNoYXJlZEJpbmRHcm91cEVudHJpZXMsXG4gICAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX0FHRU5UUykubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nLFxuICAgICAgICByZXNvdXJjZTogeyBidWZmZXI6IGFnZW50X2J1ZmZlcnNbYmluZGluZ10gfSxcbiAgICAgIH0pKSxcbiAgICBdLFxuICB9KTtcblxuICBjb25zdCBwaXBlbGluZUxheW91dFNpbXVsYXRlID0gZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICBsYWJlbDogXCJwaXBlbGluZUxheW91dFwiLFxuICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRTaW11bGF0ZV0sXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGxpbmVDb25zdHJhaW50RnVuY3Rpb24ocGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyKSB7XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMub3JpZW50YXRpb25VcGRhdGUpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKE1BWF9CVUZGRVJfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5jb3NzZXJhdFVwZGF0ZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmlmb3Jtcy5hY3RpbkNvc3NlcmF0SXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcbiAgICB9XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubGluZUNvbnN0cmFpbnQpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKE1BWF9CVUZGRVJfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tZW1icmFuZVRhbmdlbnRpYWxGbG93KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVuaWZvcm1zLm1lbWJyYW5lRmxvd0l0ZXJhdGlvbnM7IGkrKykge1xuICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNldCB1cCBjb2RlIGluc3RydWN0aW9uc1xuICBjb25zdCBtb2R1bGUgPSBhd2FpdCBjcmVhdGVTaGFkZXIoZGV2aWNlLCBzaW11bGF0ZUNvZGUsIHNoYWRlckluY2x1ZGVzKTtcblxuICBjb25zdCBzaW1QaXBlbGluZXMgPSBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzKGRldmljZSwgbW9kdWxlLCBwaXBlbGluZUxheW91dFNpbXVsYXRlKTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUlVOIHRoZSByZXNldCBzaGFkZXIgZnVuY3Rpb25cbiAgY29uc3QgcmVzZXQgPSAoKSA9PiB7XG4gICAgd3JpdGVVbmlmb3JtcygpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXSwgMCwgbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCkpKTtcblxuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG5cbiAgICBwYXNzLnNldEJpbmRHcm91cChHUk9VUF9JTkRFWCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuXG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMucmVzZXRBY3Rpbik7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG5cbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5yZXNldE1lbWJyYW5lKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcblxuICAgIHBhc3MuZW5kKCk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGlmICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCB8fCB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSBydW5FbmNsb3N1cmUoZGV2aWNlLCBzaW1QaXBlbGluZXMsIGJpbmRHcm91cFNpbXVsYXRlLCBCVUZGRVJfV09SS0dST1VQX0NPVU5ULCBhY3R1YWxIZWlnaHQpO1xuICAgIHRlbGVtZXRyeS5yZXNldCgpO1xuICB9O1xuICByZXNldCgpO1xuXG4gIGNvbnN0IHJlbmRlclNoYWRlciA9IGF3YWl0IGNyZWF0ZVNoYWRlcihkZXZpY2UsIHJlbmRlckNvZGUsIHNoYWRlckluY2x1ZGVzKTtcbiAgY29uc3QgcmVuZGVyTW9kdWxlID0gbmV3IFJlbmRlck1vZHVsZShcbiAgICBkZXZpY2UsXG4gICAgY2FudmFzLmZvcm1hdCxcbiAgICB7IHdpZHRoOiBhY3R1YWxXaWR0aCwgaGVpZ2h0OiBhY3R1YWxIZWlnaHQgfSxcbiAgICByZW5kZXJTaGFkZXIsXG4gICAgdGV4dHVyZXMsXG4gICAgc2hhcmVkTGF5b3V0RW50cmllcyxcbiAgICBzaGFyZWRCaW5kR3JvdXBFbnRyaWVzLFxuICAgIHsgYnVmZmVyOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX1NOQVBTSE9UXSwgb2Zmc2V0OiAzMiAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCksIHNpemU6IDMyIH1cbiAgKTtcbiAgZm9yIChjb25zdCBba2V5LCBwYXJhbWV0ZXIsIGxvdywgaGlnaF0gb2YgW1xuICAgIFtcIm1vZGVcIiwgXCJtaWNyb3Njb3BlXCIsIDAsIDFdLFxuICAgIFtcInpvb21cIiwgXCJ2aWV3Wm9vbVwiLCAxLCA2XSxcbiAgICBbXCJmb2N1c1wiLCBcImZvY3VzXCIsIC0xLCAxXSxcbiAgICBbXCJjb250cmFzdFwiLCBcIm9wdGljYWxDb250cmFzdFwiLCAwLjIsIDIuNV0sXG4gIF0gYXMgY29uc3QpIHtcbiAgICBpZiAodXJsUGFyYW1zLmhhcyhwYXJhbWV0ZXIpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcih1cmxQYXJhbXMuZ2V0KHBhcmFtZXRlcikpO1xuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJlbmRlck1vZHVsZS52aWV3W2tleV0gPSBNYXRoLm1heChsb3csIE1hdGgubWluKGhpZ2gsIHZhbHVlKSk7XG4gICAgfVxuICB9XG4gIHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPSByZW5kZXJNb2R1bGUudmlldy5tb2RlID8gMSA6IDA7XG4gIHJlbmRlck1vZHVsZS52aWV3LmF1dG9GaXQgPSAhdXJsUGFyYW1zLmhhcyhcInZpZXdab29tXCIpO1xuICBjb25zdCBpbml0aWFsUmFkaXVzID0gKHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKiB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpIC8gKDIgKiBNYXRoLlBJKTtcbiAgcmVuZGVyTW9kdWxlLnNldENlbGxCb3VuZHMoXG4gICAgYWN0dWFsV2lkdGggLyAyIC0gaW5pdGlhbFJhZGl1cyxcbiAgICBhY3R1YWxXaWR0aCAvIDIgKyBpbml0aWFsUmFkaXVzLFxuICAgIGFjdHVhbEhlaWdodCAvIDIgLSBpbml0aWFsUmFkaXVzLFxuICAgIGFjdHVhbEhlaWdodCAvIDIgKyBpbml0aWFsUmFkaXVzXG4gICk7XG4gIHJlbmRlck1vZHVsZS5maXRJbW1lZGlhdGVseSgpO1xuXG4gIC8vIFNob3cgdGhlIGluaXRpYWwgc29sdWJsZSBjb21wYXJ0bWVudCBldmVuIHdoZW4gb3BlbmVkIHBhdXNlZC4gVGhpcyB3cml0ZXNcbiAgLy8gb25seSB0aGUgdmlzdWFsaXphdGlvbiBtYXNrLCBub3QgcmVhY3Rpb24vc3RlcmljIGZpZWxkcyBvciBwaHlzaWNhbCBzdGF0ZS5cbiAgaWYgKHVuaWZvcm1zLmdBY3RpbkZpZWxkKSB7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuZHJhd1Jlc2Vydm9pcik7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoLi4uVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3MuZW5kKCk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIHJlbmRlck1vZHVsZS5yZW5kZXIoY2FudmFzLmNvbnRleHQpO1xuICB9XG5cbiAgdmFyIGZyYW1lTnIgPSAwO1xuICBjb25zdCBzcHJvdXRzID0gbmV3IFNwcm91dFNjaGVkdWxlcih1bmlmb3Jtcy5zcHJvdXRPblN0ZXBzICsgdW5pZm9ybXMuc3Byb3V0T2ZmU3RlcHMsIHNlZWRlZFJhbmRvbShzZWVkIF4gMHhhMzQxMzE2YykpO1xuICBjb25zdCBzcHJvdXRTaXRlcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmRhdGEsIDgwLCA0ICogTUFYX1NQUk9VVF9TSVRFUyk7XG5cbiAgLy8gUlVOIHRoZSBzaW0gY29tcHV0ZSBmdW5jdGlvbiBhbmQgcmVuZGVyIHBpeGVsc1xuICBhc3luYyBmdW5jdGlvbiB0aW1lc3RlcChzdGVwQ291bnQgPSB1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZSkge1xuICAgIGlmIChyZWNvdmVyeS5hY3RpdmUpIHJldHVybjtcbiAgICB0aW1lKys7XG4gICAgaWYgKGNvbnRyb2xzRGlydHkpIHtcbiAgICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICAgIGNvbnRyb2xzRGlydHkgPSBmYWxzZTtcbiAgICB9XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGludGVyYWN0aW9ucy5pbnRlcmFjdGlvbnMuYnVmZmVyLCAwLCBpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmRhdGEpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGVwQ291bnQ7IGkrKykge1xuICAgICAgc3Byb3V0cy51cGRhdGUoZnJhbWVOciwgdW5pZm9ybXMsIHNwcm91dFNpdGVzKTtcbiAgICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihpbnRlcmFjdGlvbnMuY29udHJvbHMuYnVmZmVyLCA4MCwgc3Byb3V0U2l0ZXMpO1xuICAgICAgcnVuU2ltdWxhdGlvblN0ZXAoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAgc2ltUGlwZWxpbmVzLFxuICAgICAgICBiaW5kR3JvdXBTaW11bGF0ZSxcbiAgICAgICAgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCxcbiAgICAgICAgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQsXG4gICAgICAgIGxpbmVDb25zdHJhaW50RnVuY3Rpb24sXG4gICAgICAgIGZyYW1lTnIsXG4gICAgICAgIGkgPT09IHN0ZXBDb3VudCAtIDEsXG4gICAgICAgICEhKHVuaWZvcm1zLmdBY3RpbkZpZWxkIHx8IHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pLFxuICAgICAgICAhIXVuaWZvcm1zLnBvbGFyaXR5TW9kZVxuICAgICAgKTtcbiAgICAgIGZyYW1lTnIrKztcbiAgICB9XG5cbiAgICByZW5kZXJNb2R1bGUucmVuZGVyKGNhbnZhcy5jb250ZXh0KTtcbiAgICBpZiAodW5pZm9ybXMuY3VlRW5hYmxlZCkgZGlzcGxheUN1ZSgpO1xuICAgIHRlbGVtZXRyeS5zbmFwc2hvdCh0aW1lLCBjYW52YXMuY2FudmFzKTtcbiAgICBpZiAoIXBhdXNlZCkgdGVsZW1ldHJ5LnVwZGF0ZSh0aW1lLCBmcmFtZU5yLCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSkuY2F0Y2goc3RvcFNpbXVsYXRpb24pO1xuICAgIGlmICh0aW1lICUgMzAgPT09IDApXG4gICAgICBtZWNoYW5pY2FsU3VtbWFyeSgpXG4gICAgICAgIC50aGVuKCh7IG1vdG9ycywgdGV0aGVycyB9KSA9PiB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKTtcbiAgICAgICAgICBpZiAoc3RhdHVzKVxuICAgICAgICAgICAgc3RhdHVzLnRleHRDb250ZW50ID0gYFNlZWQgJHtzZWVkfSDCtyAke21vdG9yc30gbW90b3IgbGlua3MgwrcgJHt0ZXRoZXJzfSB0ZXRoZXJzIMK3IGNvcnRleCAke3VuaWZvcm1zLmNvcnRleFBvbHltZXJpemF0aW9uID4gMCA/IFwib25cIiA6IFwib2ZmXCJ9YDtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN0b3BTaW11bGF0aW9uKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIG1lY2hhbmljYWxTdW1tYXJ5KCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdO1xuICAgIGNvbnN0IHN0YWdpbmcgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogYnVmZmVyLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihidWZmZXIsIDAsIHN0YWdpbmcsIDAsIGJ1ZmZlci5zaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgc3RhZ2luZy5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KHN0YWdpbmcuZ2V0TWFwcGVkUmFuZ2UoKSk7XG4gICAgbGV0IG1vdG9ycyA9IDAsXG4gICAgICB0ZXRoZXJzID0gMCxcbiAgICAgIHBvc3RlcmlvclRldGhlcnMgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMubGVuZ3RoIC8gODsgaSsrKSB7XG4gICAgICBpZiAod29yZHNbaSAqIDhdKSB7XG4gICAgICAgIGlmIChpIDwgMjU2KSBtb3RvcnMrKztcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGV0aGVycysrO1xuICAgICAgICAgIGNvbnN0IGFyYyA9IChpIC0gMjU2KSAvIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQ7XG4gICAgICAgICAgaWYgKGFyYyA+IDAuMjUgJiYgYXJjIDwgMC43NSkgcG9zdGVyaW9yVGV0aGVycysrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN0YWdpbmcudW5tYXAoKTtcbiAgICBzdGFnaW5nLmRlc3Ryb3koKTtcbiAgICByZXR1cm4geyBtb3RvcnMsIHRldGhlcnMsIHBvc3RlcmlvclRldGhlcnMgfTtcbiAgfVxuXG4gIGNvbnN0IGN1ZU1hcmtlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3VlLW1hcmtlclwiKSE7XG4gIGZ1bmN0aW9uIGRpc3BsYXlDdWUoKSB7XG4gICAgY3VlTWFya2VyLmhpZGRlbiA9ICF1bmlmb3Jtcy5jdWVFbmFibGVkO1xuICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBvaW50ID0gcmVuZGVyTW9kdWxlLndvcmxkVG9TY3JlZW4odW5pZm9ybXMuY3VlWCwgdW5pZm9ybXMuY3VlWSk7XG4gICAgY3VlTWFya2VyLnN0eWxlLmxlZnQgPSBgJHtyZWN0LmxlZnQgKyAocG9pbnQueCAvIGFjdHVhbFdpZHRoKSAqIHJlY3Qud2lkdGh9cHhgO1xuICAgIGN1ZU1hcmtlci5zdHlsZS50b3AgPSBgJHtyZWN0LnRvcCArIChwb2ludC55IC8gYWN0dWFsSGVpZ2h0KSAqIHJlY3QuaGVpZ2h0fXB4YDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImN1ZS1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gdW5pZm9ybXMucG9sYXJpdHlNb2RlXG4gICAgICA/IFwiUGVyc2lzdGVudCBoZWFkaW5nIMK3IGRyYWcgdG8gc2V0IGEgbmV3IGRpcmVjdGlvbiDCtyBFc2MgZmFjZXMgcmlnaHRcIlxuICAgICAgOiB1bmlmb3Jtcy5jdWVFbmFibGVkXG4gICAgICAgID8gXCJQb2xhcml0eSBjdWUgYWN0aXZlIMK3IGRyYWcgdG8gbW92ZSDCtyBFc2MgdG8gY2xlYXJcIlxuICAgICAgICA6IFwiQ2xpY2sgb3IgZHJhZyB0aGUgY2FudmFzIHRvIG1vdmUgdGhlIGFjdGl2ZSBlZGdlXCI7XG4gIH1cbiAgZnVuY3Rpb24gc2V0Q3VlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoeCkgfHwgIU51bWJlci5pc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IEVycm9yKFwiQ3VlIGNvb3JkaW5hdGVzIG11c3QgYmUgZmluaXRlXCIpO1xuICAgIHVuaWZvcm1zLmN1ZVggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhY3R1YWxXaWR0aCwgeCkpO1xuICAgIHVuaWZvcm1zLmN1ZVkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhY3R1YWxIZWlnaHQsIHkpKTtcbiAgICB1bmlmb3Jtcy5jdWVFbmFibGVkID0gMTtcbiAgICBjdWVWZXJzaW9uKys7XG4gICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gICAgZGlzcGxheUN1ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGNsZWFyQ3VlKCkge1xuICAgIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPSAwO1xuICAgIGN1ZVZlcnNpb24rKztcbiAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICBkaXNwbGF5Q3VlKCk7XG4gIH1cbiAgYXN5bmMgZnVuY3Rpb24gY3VlU3RhdGUoKSB7XG4gICAgY29uc3Qgc3RhZ2luZyA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiAzMiwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdLCAzMiAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIDEpLCBzdGFnaW5nLCAwLCAzMik7XG4gICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICBhd2FpdCBzdGFnaW5nLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgICBjb25zdCBkYXRhID0gc3RhZ2luZy5nZXRNYXBwZWRSYW5nZSgpLFxuICAgICAgICB1ID0gbmV3IFVpbnQzMkFycmF5KGRhdGEpLFxuICAgICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICAgIHJldHVybiB7IGluZGV4OiB1WzRdLCB2ZXJzaW9uOiB1WzVdLCB4OiBmWzBdLCB5OiBmWzFdLCBheGlzWDogZlsyXSwgYXhpc1k6IGZbM10sIGVuYWJsZWQ6ICEhdW5pZm9ybXMuY3VlRW5hYmxlZCwgc3RlcDogZnJhbWVOciB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoc3RhZ2luZy5tYXBTdGF0ZSA9PT0gXCJtYXBwZWRcIikgc3RhZ2luZy51bm1hcCgpO1xuICAgICAgc3RhZ2luZy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG4gIGNhbnZhcy5jYW52YXMuc3R5bGUudG91Y2hBY3Rpb24gPSBcIm5vbmVcIjtcbiAgbGV0IGRyYWdnaW5nID0gZmFsc2U7XG4gIGNvbnN0IHBvaW50Q3VlID0gKGU6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBvaW50ID0gcmVuZGVyTW9kdWxlLnNjcmVlblRvV29ybGQoKChlLmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiBhY3R1YWxXaWR0aCwgKChlLmNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCkgKiBhY3R1YWxIZWlnaHQpO1xuICAgIHNldEN1ZShwb2ludC54LCBwb2ludC55KTtcbiAgfTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVybjtcbiAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgY2FudmFzLmNhbnZhcy5zZXRQb2ludGVyQ2FwdHVyZShlLnBvaW50ZXJJZCk7XG4gICAgcG9pbnRDdWUoZSk7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCAoZSkgPT4ge1xuICAgIGlmIChkcmFnZ2luZykgcG9pbnRDdWUoZSk7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVydXBcIiwgKCkgPT4ge1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyY2FuY2VsXCIsICgpID0+IHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibG9zdHBvaW50ZXJjYXB0dXJlXCIsICgpID0+IHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgIHJlbmRlck1vZHVsZS5maXRJbW1lZGlhdGVseSgpO1xuICAgIHVwZGF0ZVZpZXcoKTtcbiAgfSk7XG4gIGRpc3BsYXlDdWUoKTtcblxuICBmdW5jdGlvbiB1cGRhdGVWaWV3KCkge1xuICAgIGRvY3VtZW50LmJvZHkuZGF0YXNldC52aWV3ID0gcmVuZGVyTW9kdWxlLnZpZXcubW9kZSA/IFwibWljcm9zY29wZVwiIDogXCJkaWFnbm9zdGljXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLXRpdGxlXCIpIS50ZXh0Q29udGVudCA9IHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPyBcIkNlbGwgwrcgdHJhbnNtaXR0ZWQgbGlnaHRcIiA6IFwiRXhwbGljaXQgZmlsYW1lbnRzIMK3IGRpYWdub3N0aWNzXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWV3LXpvb20tdmFsdWVcIikhLnRleHRDb250ZW50ID0gYCR7cmVuZGVyTW9kdWxlLnZpZXcuem9vbS50b0ZpeGVkKDEpfcOXYDtcbiAgICByZW5kZXJNb2R1bGUucmVuZGVyKGNhbnZhcy5jb250ZXh0KTtcbiAgICBkaXNwbGF5Q3VlKCk7XG4gIH1cbiAgY29uc3Qgdmlld1NlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlldy1tb2RlXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuICB2aWV3U2VsZWN0LnZhbHVlID0gU3RyaW5nKHJlbmRlck1vZHVsZS52aWV3Lm1vZGUpO1xuICB2aWV3U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPSBOdW1iZXIodmlld1NlbGVjdC52YWx1ZSk7XG4gICAgdXBkYXRlVmlldygpO1xuICB9KTtcbiAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgW1xuICAgIFtcInZpZXctem9vbVwiLCBcInpvb21cIl0sXG4gICAgW1widmlldy1mb2N1c1wiLCBcImZvY3VzXCJdLFxuICAgIFtcInZpZXctY29udHJhc3RcIiwgXCJjb250cmFzdFwiXSxcbiAgXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgaW5wdXQudmFsdWUgPSBTdHJpbmcocmVuZGVyTW9kdWxlLnZpZXdba2V5XSk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgIHJlbmRlck1vZHVsZS52aWV3W2tleV0gPSBOdW1iZXIoaW5wdXQudmFsdWUpO1xuICAgICAgaWYgKGtleSA9PT0gXCJ6b29tXCIpIHJlbmRlck1vZHVsZS52aWV3LmF1dG9GaXQgPSBmYWxzZTtcbiAgICAgIHVwZGF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb2xsb3ctY2VsbFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcuZm9sbG93ID0gKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQ7XG4gICAgdXBkYXRlVmlldygpO1xuICB9KTtcbiAgdXBkYXRlVmlldygpO1xuICBjb25zdCBzZXR0aW5nc1BhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLXBhbmVsXCIpITtcbiAgY29uc3Qgc2V0dGluZ3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZS1zZXR0aW5nc1wiKSE7XG4gIGZ1bmN0aW9uIHNldFNldHRpbmdzKG9wZW46IGJvb2xlYW4pIHtcbiAgICBzZXR0aW5nc1BhbmVsLmhpZGRlbiA9ICFvcGVuO1xuICAgIHNldHRpbmdzQnV0dG9uLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgU3RyaW5nKG9wZW4pKTtcbiAgICBkb2N1bWVudC5ib2R5LmRhdGFzZXQuc2V0dGluZ3MgPSBvcGVuID8gXCJvcGVuXCIgOiBcImNsb3NlZFwiO1xuICAgIGlmIChvcGVuKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlLXNldHRpbmdzXCIpIS5mb2N1cygpO1xuICAgIGVsc2Ugc2V0dGluZ3NCdXR0b24uZm9jdXMoKTtcbiAgfVxuICBzZXR0aW5nc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0U2V0dGluZ3Moc2V0dGluZ3NQYW5lbC5oaWRkZW4pKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZS1zZXR0aW5nc1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldFNldHRpbmdzKGZhbHNlKSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZml0LWNlbGxcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcuYXV0b0ZpdCA9IHRydWU7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcuZm9sbG93ID0gdHJ1ZTtcbiAgICByZW5kZXJNb2R1bGUuZml0SW1tZWRpYXRlbHkoKTtcbiAgICB1cGRhdGVWaWV3KCk7XG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3RvcmUtZGVtb1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24ucGF0aG5hbWUgKyBcIj9kZW1vPTFcIjtcbiAgfSk7XG4gIHNldHRpbmdzUGFuZWwuYXBwZW5kKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlhZ25vc3RpY3NcIikhKTtcbiAgc2V0dGluZ3NQYW5lbC5hcHBlbmQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpISk7XG5cbiAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtbyA9IHtcbiAgICBzZWVkLFxuICAgIHVuaWZvcm1zLFxuICAgIGdwdUVycm9ycyxcbiAgICBydW50aW1lRXJyb3JzLFxuICAgIGNvbnRhY3RSZWNvdmVyeTogcmVjb3ZlcnksXG4gICAgdmlldzogcmVuZGVyTW9kdWxlLnZpZXcsXG4gICAgcmVkcmF3OiB1cGRhdGVWaWV3LFxuICAgIHNjcmVlblRvV29ybGQ6ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gcmVuZGVyTW9kdWxlLnNjcmVlblRvV29ybGQoeCwgeSksXG4gICAgc2V0Q3VlLFxuICAgIGNsZWFyQ3VlLFxuICAgIGN1ZVN0YXRlLFxuICAgIGdldCBwYXVzZWQoKSB7XG4gICAgICByZXR1cm4gcGF1c2VkO1xuICAgIH0sXG4gICAgZ2V0IHN0ZXAoKSB7XG4gICAgICByZXR1cm4gZnJhbWVOcjtcbiAgICB9LFxuICAgIHBlcmZvcm1hbmNlU25hcHNob3Q6ICgpID0+ICh7IC4uLmxpdmVQZXJmb3JtYW5jZS5zbmFwc2hvdCgpLCBkaWFnbm9zdGljczogeyAuLi50ZWxlbWV0cnkudGltaW5ncyB9IH0pLFxuICAgIHBhdXNlOiAoKSA9PiB7XG4gICAgICBzZXRQYXVzZWQodHJ1ZSk7XG4gICAgfSxcbiAgICBwbGF5OiAoKSA9PiB7XG4gICAgICBzZXRQYXVzZWQoZmFsc2UpO1xuICAgIH0sXG4gICAgYXN5bmMgYWR2YW5jZShzdGVwczogbnVtYmVyKSB7XG4gICAgICBpZiAoIXBhdXNlZCB8fCByZWNvdmVyeS5hY3RpdmUgfHwgbWFudWFsQWR2YW5jZVBlbmRpbmcgfHwgIU51bWJlci5pc0ludGVnZXIoc3RlcHMpIHx8IHN0ZXBzIDwgMCB8fCBzdGVwcyA+IDIwMDApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGFuZCByZXF1ZXN0IG9uZSBiYXRjaCBvZiAw4oCTMjAwMCB3aG9sZSBzdGVwc1wiKTtcbiAgICAgIG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICAgIGZvciAobGV0IHJlbWFpbmluZyA9IHN0ZXBzOyByZW1haW5pbmcgPiAwOyApIHtcbiAgICAgICAgICBhd2FpdCByZWNvdmVyeS53YWl0KCk7XG4gICAgICAgICAgaWYgKHJ1bnRpbWVFcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IocnVudGltZUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgICBjb25zdCBiYXRjaCA9IE1hdGgubWluKDIwLCByZW1haW5pbmcpO1xuICAgICAgICAgIGF3YWl0IHRpbWVzdGVwKGJhdGNoKTtcbiAgICAgICAgICByZW1haW5pbmcgLT0gYmF0Y2g7XG4gICAgICAgICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICAgICAgICBpZiAoZ3B1RXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGdwdUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlKTtcbiAgICAgICAgYXdhaXQgcmVjb3Zlcnkud2FpdCgpO1xuICAgICAgICBpZiAocnVudGltZUVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihydW50aW1lRXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICB1cGRhdGVWaWV3KCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSEudGV4dENvbnRlbnQgPSBgUGF1c2VkIMK3IHN0ZXAgJHtmcmFtZU5yfWA7XG4gICAgICAgIHJldHVybiB7IHN0YXRzOiB0ZWxlbWV0cnkuaGlzdG9yeS5hdCgtMSksIGxpbmtzOiBhd2FpdCBtZWNoYW5pY2FsU3VtbWFyeSgpLCBncHVFcnJvcnMgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcblxuICBpZiAodXJsUGFyYW1zLmhhcyhcIm1lY2hhbmljc1Rlc3RcIikpIHtcbiAgICAod2luZG93IGFzIGFueSkuZmlsYW1lbnREZW1vLnRlc3RSZW5ld2FsID0gKCkgPT4ge1xuICAgICAgaWYgKCFwYXVzZWQpIHRocm93IEVycm9yKFwiUGF1c2UgYmVmb3JlIGRlc3RydWN0aXZlIHJlbmV3YWwgZml4dHVyZXNcIik7XG4gICAgICByZXR1cm4gdGVzdFJlbmV3YWwoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGluOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sXG4gICAgICAgICAgbWVtYnJhbmU6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSxcbiAgICAgICAgICBsaW5rczogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU10sXG4gICAgICAgICAgc25hcHNob3Q6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdLFxuICAgICAgICB9LFxuICAgICAgICB7IGFjdGluOiB1bmlmb3Jtcy5hY3RpbkNvdW50LCBtZW1icmFuZTogdW5pZm9ybXMubWVtYnJhbmVDb3VudCB9LFxuICAgICAgICAodmFsdWVzKSA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih1bmlmb3JtcywgdmFsdWVzKTtcbiAgICAgICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChraW5kLCByZXBlYXRzID0gMSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKSxcbiAgICAgICAgICAgIHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICAgICAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG4gICAgICAgICAgaWYgKGtpbmQgPT09IFwicG9sYXJpdHlcIikge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcygxKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnJlc29sdmVDdWUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSBcInR1cm5vdmVyXCIpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnVuYmluZE1pblBvbGUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG4gICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSBcIm1vdG9yXCIpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4gKyBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1vdG9yTGlua3MpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoMSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5hcHBseU1lY2hhbmljYWxGb3JjZXMpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTiArIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5hY3RpbmVzVG9UZXh0dXJlcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4gKyBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1lbWJyYW5lVGV0aGVycyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcGVhdHM7IGkrKykgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhc3MuZW5kKCk7XG4gICAgICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gICAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby50ZXN0RW5jbG9zdXJlID0gKCkgPT4ge1xuICAgICAgaWYgKCFwYXVzZWQpIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGJlZm9yZSBydW5uaW5nIGRlc3RydWN0aXZlIGVuY2xvc3VyZSBmaXh0dXJlc1wiKTtcbiAgICAgIHJldHVybiB0ZXN0RW5jbG9zdXJlKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHsgYWN0aW46IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSwgbWVtYnJhbmU6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSB9LFxuICAgICAgICB7IGFjdGluOiB1bmlmb3Jtcy5hY3RpbkNvdW50LCBtZW1icmFuZTogdW5pZm9ybXMubWVtYnJhbmVDb3VudCB9LFxuICAgICAgICAoKSA9PiBydW5FbmNsb3N1cmUoZGV2aWNlLCBzaW1QaXBlbGluZXMsIGJpbmRHcm91cFNpbXVsYXRlLCBCVUZGRVJfV09SS0dST1VQX0NPVU5ULCBhY3R1YWxIZWlnaHQpLFxuICAgICAgICAoZml4ZWRBcmVhLCBhcmVhKSA9PiB7XG4gICAgICAgICAgdW5pZm9ybXMuZ0FjdGluRmllbGQgPSAxO1xuICAgICAgICAgIHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24gPSBmaXhlZEFyZWEgPyAxIDogMDtcbiAgICAgICAgICB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGggPSBNYXRoLnNxcnQoNCAqIE1hdGguUEkgKiBhcmVhKSAvIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQ7XG4gICAgICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gICAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby50ZXN0TWVjaGFuaWNzID0gKCkgPT4ge1xuICAgICAgaWYgKCFwYXVzZWQpIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGJlZm9yZSBydW5uaW5nIGRlc3RydWN0aXZlIG1lY2hhbmljYWwgZml4dHVyZXNcIik7XG4gICAgICByZXR1cm4gdGVzdE1lY2hhbmljcyhcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICB7XG4gICAgICAgICAgYWN0aW46IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSxcbiAgICAgICAgICBtZW1icmFuZTogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdLFxuICAgICAgICAgIGxpbmtzOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXSxcbiAgICAgICAgICBmb3JjZXM6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfRk9SQ0VTXSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBhY3RpbjogdW5pZm9ybXMuYWN0aW5Db3VudCwgbWVtYnJhbmU6IHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgICAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgICAgICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuICAgICAgICAgIGNvbnN0IGNvdW50ID0gTWF0aC5jZWlsKCh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCkgLyBXT1JLR1JPVVBfU0laRSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbcGlwZWxpbmUsIGdyb3Vwc10gb2YgW1xuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5yZXNvbHZlQ3VlLCAxXSxcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIGNvdW50XSxcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMubW90b3JMaW5rcywgMV0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLm1lbWJyYW5lVGV0aGVycywgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORV0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLmFwcGx5TWVjaGFuaWNhbEZvcmNlcywgY291bnRdLFxuICAgICAgICAgIF0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUocGlwZWxpbmUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoZ3JvdXBzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFzcy5lbmQoKTtcbiAgICAgICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICAgIH0sXG4gICAgICAgIChzdHJlbmd0aCwgY291cGxpbmcsIGRyYWcpID0+IHtcbiAgICAgICAgICB1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aCA9IHN0cmVuZ3RoO1xuICAgICAgICAgIHVuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmcgPSBjb3VwbGluZztcbiAgICAgICAgICB1bmlmb3Jtcy5zdWJzdHJhdGVEcmFnID0gZHJhZztcbiAgICAgICAgICB1bmlmb3Jtcy5jdWVFbmFibGVkID0gMDtcbiAgICAgICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHBhdXNlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXVzZS1kZW1vXCIpITtcbiAgcGF1c2VCdXR0b24udGV4dENvbnRlbnQgPSBwYXVzZWQgPyBcIlJlc3VtZVwiIDogXCJQYXVzZVwiO1xuICBwYXVzZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHNldFBhdXNlZCghcGF1c2VkKTtcbiAgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzZXQtZGVtb1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGxvY2F0aW9uLnJlbG9hZCgpKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhci1jdWVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGVhckN1ZSk7XG4gIGNvbnN0IHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXAtZGVtb1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgYXN5bmMgZnVuY3Rpb24gc2luZ2xlU3RlcCgpIHtcbiAgICBpZiAoc3RlcEJ1dHRvbi5kaXNhYmxlZCkgcmV0dXJuO1xuICAgIHN0ZXBCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHNldFBhdXNlZCh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby5hZHZhbmNlKDEpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzdG9wU2ltdWxhdGlvbihlcnJvcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN0ZXBCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgc3RlcEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc2luZ2xlU3RlcCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiICYmICFzZXR0aW5nc1BhbmVsLmhpZGRlbikge1xuICAgICAgc2V0U2V0dGluZ3MoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmFsdEtleSkgcmV0dXJuO1xuICAgIGlmICgoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KT8uY2xvc2VzdChcImlucHV0LHNlbGVjdCx0ZXh0YXJlYSxidXR0b24sW2NvbnRlbnRlZGl0YWJsZT10cnVlXVwiKSB8fCBldmVudC5yZXBlYXQpIHJldHVybjtcbiAgICBpZiAoZXZlbnQuY29kZSA9PT0gXCJTcGFjZVwiKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2V0UGF1c2VkKCFwYXVzZWQpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5LnRvTG93ZXJDYXNlKCkgPT09IFwiblwiKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdm9pZCBzaW5nbGVTdGVwKCk7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIGNsZWFyQ3VlKCk7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkudG9Mb3dlckNhc2UoKSA9PT0gXCJyXCIpIHtcbiAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfSk7XG4gIGZvciAoY29uc3Qga2V5IG9mIFtcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiLCBcIm15b3NpblN0cmVuZ3RoXCIsIFwibWVtYnJhbmVDb3VwbGluZ1wiXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBsaXZlLSR7a2V5fWApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgdmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgdmFsdWUtJHtrZXl9YCkhO1xuICAgIHNsaWRlci52YWx1ZSA9IFN0cmluZyh1bmlmb3Jtc1trZXldKTtcbiAgICB2YWx1ZS50ZXh0Q29udGVudCA9IHVuaWZvcm1zW2tleV0udG9GaXhlZChrZXkgPT09IFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIgPyAyIDogMyk7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICB1bmlmb3Jtc1trZXldID0gTnVtYmVyKHNsaWRlci52YWx1ZSk7XG4gICAgICB2YWx1ZS50ZXh0Q29udGVudCA9IHVuaWZvcm1zW2tleV0udG9GaXhlZChrZXkgPT09IFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIgPyAyIDogMyk7XG4gICAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICAgIH0pO1xuICB9XG4gIGNvbnN0IGFkYXB0aXZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGFwdGl2ZS1mcmFtZXNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgYWRhcHRpdmUuY2hlY2tlZCA9ICEhdW5pZm9ybXMuYWRhcHRpdmVGcmFtZXM7XG4gIGFkYXB0aXZlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHVuaWZvcm1zLmFkYXB0aXZlRnJhbWVzID0gYWRhcHRpdmUuY2hlY2tlZCA/IDEgOiAwO1xuICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICB9KTtcbiAgY29uc3QgY2VsbFNpemUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNlbGwtc2l6ZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgY29uc3QgY29tcGFjdExpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBhY3QtZGVtb1wiKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcbiAgY29uc3QgY29tcGFjdFVybCA9IG5ldyBVUkwoY29tcGFjdExpbmsuaHJlZik7XG4gIGNvbXBhY3RVcmwuc2VhcmNoUGFyYW1zLnNldChcInNlZWRcIiwgU3RyaW5nKHNlZWQpKTtcbiAgY29tcGFjdExpbmsuaHJlZiA9IGNvbXBhY3RVcmwudG9TdHJpbmcoKTtcbiAgY29uc3QgcmVuZXdhbExpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlbmV3YWwtZGVtb1wiKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcbiAgY29uc3QgcmVuZXdhbFVybCA9IG5ldyBVUkwocmVuZXdhbExpbmsuaHJlZik7XG4gIHJlbmV3YWxVcmwuc2VhcmNoUGFyYW1zLnNldChcInNlZWRcIiwgU3RyaW5nKHNlZWQpKTtcbiAgcmVuZXdhbExpbmsuaHJlZiA9IHJlbmV3YWxVcmwudG9TdHJpbmcoKTtcbiAgY29uc3Qgc2VsZWN0ZWRTaXplID0gU3RyaW5nKHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCk7XG4gIGlmICghWy4uLmNlbGxTaXplLm9wdGlvbnNdLnNvbWUoKG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBzZWxlY3RlZFNpemUpKSB7XG4gICAgY2VsbFNpemUuYWRkKG5ldyBPcHRpb24oYCR7TWF0aC5yb3VuZCgxNTAgKiB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpfSUgKGN1c3RvbSlgLCBzZWxlY3RlZFNpemUpKTtcbiAgfVxuICBjZWxsU2l6ZS52YWx1ZSA9IHNlbGVjdGVkU2l6ZTtcbiAgY2VsbFNpemUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwibWVtYnJhbmVSZXN0TGVuZ3RoXCIsIGNlbGxTaXplLnZhbHVlKTtcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV4dC50b1N0cmluZygpO1xuICB9KTtcbiAgZm9yIChjb25zdCBuYW1lIG9mIFtcImdBY3RpbkZpZWxkXCIsIFwiYXJlYUNvbnNlcnZhdGlvblwiXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjaGVja2JveC5jaGVja2VkID0gdW5pZm9ybXNbbmFtZV0gPiAwO1xuICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQobmFtZSwgY2hlY2tib3guY2hlY2tlZCA/IFwiMVwiIDogXCIwXCIpO1xuICAgICAgbG9jYXRpb24uaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgICB9KTtcbiAgfVxuICBjb25zdCBjb3J0ZXhUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvcnRleC10b2dnbGVcIikgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgY29ydGV4VG9nZ2xlLmNoZWNrZWQgPSB1bmlmb3Jtcy5jb3J0ZXhQb2x5bWVyaXphdGlvbiA+IDA7XG4gIGNvcnRleFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJjb3J0ZXhQb2x5bWVyaXphdGlvblwiLCBjb3J0ZXhUb2dnbGUuY2hlY2tlZCA/IFwiMC4wM1wiIDogXCIwXCIpO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IGBTZWVkICR7c2VlZH0gwrcgbW90b3IgJHt1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aH0gwrcgY291cGxpbmcgJHt1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nfWA7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jbG9zdXJlLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPVxuICAgIGBHLWFjdGluOiAke3VuaWZvcm1zLmdBY3RpbkZpZWxkID8gXCJjb25zZXJ2ZWQsIHdlbGwtbWl4ZWQgcG9vbFwiIDogXCJsZWdhY3kgcGFydGljbGVzXCJ9IMK3IGFyZWE6ICR7dW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiA/IFwiY29uc3RyYWluZWRcIiA6IFwiZnJlZVwifWA7XG4gIGZvciAoY29uc3QgYW5jaG9yIG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEFuY2hvckVsZW1lbnQ+KFwiW2RhdGEtY2FzZV1cIikpIHtcbiAgICBjb25zdCBuZXh0ID0gbmV3IFVSTChhbmNob3IuaHJlZik7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwic2VlZFwiLCBTdHJpbmcoc2VlZCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImNvcnRleFBvbHltZXJpemF0aW9uXCIsIFN0cmluZyh1bmlmb3Jtcy5jb3J0ZXhQb2x5bWVyaXphdGlvbikpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcIm1lbWJyYW5lUmVzdExlbmd0aFwiLCBTdHJpbmcodW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoKSk7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiYWN0aW5Db3VudFwiLCBTdHJpbmcodW5pZm9ybXMuYWN0aW5Db3VudCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImdBY3RpbkZpZWxkXCIsIFN0cmluZyh1bmlmb3Jtcy5nQWN0aW5GaWVsZCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImFyZWFDb25zZXJ2YXRpb25cIiwgU3RyaW5nKHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbXG4gICAgICBcInBvbGFyaXR5TW9kZVwiLFxuICAgICAgXCJwb2xhcml0eVR1cm5SYXRlXCIsXG4gICAgICBcInJlYXJUdXJub3ZlclwiLFxuICAgICAgXCJ0dXJub3ZlckFnZVwiLFxuICAgICAgXCJ0ZXRoZXJUdXJub3ZlclwiLFxuICAgICAgXCJ0ZXRoZXJPblJhdGVcIixcbiAgICAgIFwidGV0aGVyT2ZmUmF0ZVwiLFxuICAgICAgXCJ0ZXRoZXJSZWNvdmVyeVN0ZXBzXCIsXG4gICAgICBcIm1vdG9yUmVhckJpYXNcIixcbiAgICAgIFwiZnJvbnRBbGlnbm1lbnRcIixcbiAgICAgIFwidGV0aGVyTG9hZE9mZlwiLFxuICAgICAgXCJjb2xvdXJBZ2VcIixcbiAgICBdIGFzIGNvbnN0KVxuICAgICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KGtleSwgU3RyaW5nKHVuaWZvcm1zW2tleV0pKTtcbiAgICBhbmNob3IuaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgICBjb25zdCBhY3RpdmUgPVxuICAgICAgTnVtYmVyKG5leHQuc2VhcmNoUGFyYW1zLmdldChcIm15b3NpblN0cmVuZ3RoXCIpID8/IDApID09PSB1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aCAmJlxuICAgICAgTnVtYmVyKG5leHQuc2VhcmNoUGFyYW1zLmdldChcIm1lbWJyYW5lQ291cGxpbmdcIikgPz8gMCkgPT09IHVuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmcgJiZcbiAgICAgIE51bWJlcihuZXh0LnNlYXJjaFBhcmFtcy5nZXQoXCJtZW1icmFuZVN0aWZmbmVzc1wiKSA/PyAzKSA9PT0gdW5pZm9ybXMubWVtYnJhbmVTdGlmZm5lc3M7XG4gICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImFyaWEtY3VycmVudFwiLCBTdHJpbmcoYWN0aXZlKSk7XG4gIH1cblxuICAvLyBHVUkgZm9yIGNvbnRyb2xzIGZvciBkZXNrdG9wIG9ubHlcbiAgaWYgKCFpc01vYmlsZURldmljZSkge1xuICAgIGxldCBndWkgPSBuZXcgR1VJKHsgY29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkdmFuY2VkLWNvbnRyb2xzXCIpISB9KTtcblxuICAgIGNvbnN0IG1lY2hhbmljcyA9IGd1aS5hZGRGb2xkZXIoXCJBY3RvbXlvc2luIGh5cG90aGVzaXNcIik7XG4gICAgY29uc3QgcmVuZXdhbCA9IGd1aS5hZGRGb2xkZXIoXCJQb2xhcml0eSBhbmQgcmVuZXdhbFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJwb2xhcml0eU1vZGVcIiwgeyBtYXRlcmlhbFBvbGU6IDAsIHBlcnNpc3RlbnREaXJlY3Rpb246IDEgfSkubmFtZShcIlBvbGFyaXR5IGZyYW1lXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInBvbGFyaXR5VHVyblJhdGVcIiwgMC4wMDEsIDAuMSwgMC4wMDEpLm5hbWUoXCJUdXJuaW5nIC8gc3RlcFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJyZWFyVHVybm92ZXJcIiwgMCwgMC4xLCAwLjAwNSkubmFtZShcIkFnZWQgcmVhciBjbGVhcmFuY2VcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidHVybm92ZXJBZ2VcIiwgMTAwLCAyMDAwLCA1MCkubmFtZShcIkFjdGluIG1hdHVyYXRpb24gc3RlcHNcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwibW90b3JSZWFyQmlhc1wiLCAwLCAxLCAwLjA1KS5uYW1lKFwiTWF0dXJlLXJlYXIgbW90b3IgYmlhc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJmcm9udEFsaWdubWVudFwiLCAwLCAxLCAwLjA1KS5uYW1lKFwiRnJvbnQgZmlsYW1lbnQgYWxpZ25tZW50XCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcImNvbG91ckFnZVwiLCB7IGFzc2VtYmx5UmVjZW5jeTogMCwgYmVhZEFnZTogMSB9KS5uYW1lKFwiQWN0aW4gY29sb3Vyc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0ZXRoZXJUdXJub3ZlclwiLCB7IGltbWVkaWF0ZVJlYmluZGluZzogMCwgZmluaXRlQmluZGluZzogMSB9KS5uYW1lKFwiVGV0aGVyIGtpbmV0aWNzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlck9uUmF0ZVwiLCAwLjAwMSwgMC4xLCAwLjAwMSkubmFtZShcIlRldGhlciBiaW5kaW5nIC8gc3RlcFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0ZXRoZXJPZmZSYXRlXCIsIDAsIDAuMDIsIDAuMDAxKS5uYW1lKFwiVGV0aGVyIHJlbGVhc2UgLyBzdGVwXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlclJlY292ZXJ5U3RlcHNcIiwgMCwgMzAwLCAxMCkubmFtZShcIlRldGhlciB1bmJvdW5kIGR3ZWxsXCIpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwibXlvc2luU3RyZW5ndGhcIiwgMCwgMC4yLCAwLjAwNSkubmFtZShcIk1vdG9yIGNvbnRyYWN0aWxpdHlcIikubGlzdGVuKCk7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJteW9zaW5TcGVlZFwiLCAwLCAwLjEsIDAuMDA1KS5uYW1lKFwiTGluayBzaG9ydGVuaW5nIC8gc3RlcFwiKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcIm1lbWJyYW5lQ291cGxpbmdcIiwgMCwgMC4yLCAwLjAwNSkubmFtZShcIk1lbWJyYW5lIHRldGhlcnNcIikubGlzdGVuKCk7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJzdWJzdHJhdGVEcmFnXCIsIDAsIDIwLCAwLjUpLm5hbWUoXCJGcm9udCBjbHV0Y2ggZHJhZ1wiKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcImNvcnRleFBvbHltZXJpemF0aW9uXCIsIDAsIDAuMSwgMC4wMDUpLm5hbWUoXCJCYXNhbCBjb3J0ZXggYXNzZW1ibHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtb25vbWVyT3BhY2l0eVwiLCAwLCAxLCAwLjA1KS5uYW1lKFwiTW9ub21lciB2aXNpYmlsaXR5XCIpO1xuXG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJjb21wdXRlU3RlcHNQZXJGcmFtZVwiKS5taW4oMSkubWF4KDc1KS5zdGVwKDEpLm5hbWUoXCJNYXggc3RlcHMgLyBmcmFtZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInRhcmdldEZQU1wiKS5taW4oMSkubWF4KDEyMCkuc3RlcCgxKS5uYW1lKFwiVGFyZ2V0IEZQU1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInN0aWZmbmVzc1wiKS5taW4oMC4wKS5tYXgoMi4wKS5uYW1lKFwiU3RpZmZuZXNzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZm9vZE5lYXJieVRocmVzaG9sZFwiKS5taW4oMC4wMDAwMDAxKS5tYXgoMS4wKS5uYW1lKFwiRm9vZCBOZWFyYnkgVGhyZXNob2xkXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZGlzY29ubmVjdGlvblByb2JhYmlsaXR5XCIpLm1pbigwKS5tYXgoMC45OTkpLm5hbWUoXCJEaXNjb25uZWN0aW9uIHByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3RlcmljU2FtcGxpbmdSYW5nZVwiKS5taW4oMSkubWF4KDUwKS5zdGVwKDEpLm5hbWUoXCJTdGVyaWMgU2FtcGxpbmcgUmFuZ2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpbkNvaGVzaW9uUmFuZ2VcIikubWluKDEpLm1heCgxMDApLnN0ZXAoMSkubmFtZShcIkFjdGluIENvaGVzaW9uIFJhbmdlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYmluZFByb2JcIikubWluKDAuMCkubWF4KDAuMSkuc3RlcCgwLjAwMDEpLm5hbWUoXCJCaW5kIFByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5TdGVyaWNGb3JjZVwiKS5taW4oMC4wKS5tYXgoMS4wKS5uYW1lKFwiQWN0aW4gU3RlcmljIEZvcmNlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5CZW5kU3RpZmZuZXNzXCIpLm1pbigwLjApLm1heCg0LjApLm5hbWUoXCJBY3RpbiBCZW5kIFN0aWZmbmVzc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImFjdGluQ29zc2VyYXRJdGVyYXRpb25zXCIpLm1pbigwKS5tYXgoMTYpLnN0ZXAoMSkubmFtZShcIkFjdGluIENvc3NlcmF0IEl0ZXJhdGlvbnNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzdGVyaWNTZWxmTmVpZ2hib3JzXCIpLm1pbigwKS5tYXgoMTIpLnN0ZXAoMSkubmFtZShcIlN0ZXJpYyBTZWxmIE5laWdoYm9yc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImVxdWlsaWJyaXVtTGluZURpc3RhbmNlXCIpLm1pbigwLjAxKS5tYXgoNi4wKS5uYW1lKFwiRXF1aWxpYnJpdW0gTGluZSBEaXN0YW5jZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInBvbHltZXJSZXB1bHNpb25cIikubWluKDAuMCkubWF4KDEuMCkubmFtZShcIlBvbHltZXIgUmVwdWxzaW9uXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibW9ub21lck1lbWJyYW5lUmVwdWxzaW9uXCIpLm1pbigwLjApLm1heCgyLjApLm5hbWUoXCJNb25vbWVyLU1lbWJyYW5lIFJlcHVsc2lvblwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJpbmRMZW5ndGhGbG9vclwiKS5taW4oMSkubWF4KDY0KS5zdGVwKDEpLm5hbWUoXCJCaW5kIExlbmd0aCBGbG9vclwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJpbmRMZW5ndGhTYXR1cmF0aW9uXCIpLm1pbigxKS5tYXgoNjQpLnN0ZXAoMSkubmFtZShcIkJpbmQgTGVuZ3RoIFNhdHVyYXRpb25cIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtb3ZlbWVudE1vZGVcIikub3B0aW9ucyh7IElkbGU6IDAsIFwiTW92ZSBFYXN0XCI6IDEgfSkubmFtZShcIk1vdmVtZW50IE1vZGVcIik7XG4gICAgLy8gdGhlIG90aGVyIG1lbWJyYW5lIHNldHRpbmdzIGFyZSB0dW5lZCBhbmQgcmFyZWx5IHRvdWNoZWQ7IHRoZXkgY2FuIHN0aWxsIGJlIHNldCBmcm9tIHRoZSBVUkwsIGUuZy4gP21lbWJyYW5lRmxvdz0wLjNcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1lbWJyYW5lU3RpZmZuZXNzXCIpLm1pbigwLjApLm1heCgxMDAuMCkubmFtZShcIk1lbWJyYW5lIFN0aWZmbmVzc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1lbWJyYW5lU21vb3RoaW5nXCIpLm1pbigwLjApLm1heCgwLjUpLm5hbWUoXCJNZW1icmFuZSBTbW9vdGhpbmdcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJwb2x5bWVyaXphdGlvblBhdGNoU2l6ZVwiKS5taW4oMC4wKS5tYXgoMC4yKS5uYW1lKFwiUG9seW1lcml6YXRpb24gUGF0Y2ggU2l6ZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInBvbHltZXJpemF0aW9uRmllbGREZWNheVwiKS5taW4oMC44KS5tYXgoMC45OTkpLnN0ZXAoMC4wMDEpLm5hbWUoXCJQb2x5bWVyaXphdGlvbiBGaWVsZCBEZWNheVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiKS5taW4oMC4wKS5tYXgoMi4wKS5uYW1lKFwiTGFtZWxsaXBvZGl1bSBTdHJlbmd0aFwiKS5saXN0ZW4oKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImxhbWVsbGlwb2RpdW1XaWR0aFwiKS5taW4oMC4wKS5tYXgoMC41KS5uYW1lKFwiTGFtZWxsaXBvZGl1bSBXaWR0aFwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImxhbWVsbGlwb2RpdW1GaWVsZERlY2F5XCIpLm1pbigwLjgpLm1heCgwLjk5OSkuc3RlcCgwLjAwMSkubmFtZShcIkxhbWVsbGlwb2RpdW0gRmllbGQgRGVjYXlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJicmFuY2hQcm9iYWJpbGl0eVwiKS5taW4oMC4wKS5tYXgoMC4yKS5zdGVwKDAuMDAxKS5uYW1lKFwiQnJhbmNoIFByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZGVicmFuY2hQcm9iYWJpbGl0eVwiKS5taW4oMC4wKS5tYXgoMC4wMSkuc3RlcCgwLjAwMDEpLm5hbWUoXCJEZWJyYW5jaCBQcm9iYWJpbGl0eVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dENvdW50XCIpLm1pbigwKS5tYXgoTUFYX1NQUk9VVF9TSVRFUykuc3RlcCgxKS5uYW1lKFwiU3Byb3V0IFNpdGVzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0V2lkdGhcIikubWluKDEpLm1heCgxNikuc3RlcCgxKS5uYW1lKFwiU3Byb3V0IFdpZHRoIChub2RlcylcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRGcm9udEJpYXNcIikubWluKDAuMCkubWF4KDEuMCkubmFtZShcIlNwcm91dCBGcm9udCBCaWFzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0T25TdGVwc1wiKS5taW4oMTAwKS5tYXgoMjAwMDApLnN0ZXAoMTAwKS5uYW1lKFwiU3Byb3V0IE9uIFN0ZXBzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0T2ZmU3RlcHNcIikubWluKDEwMCkubWF4KDIwMDAwKS5zdGVwKDEwMCkubmFtZShcIlNwcm91dCBPZmYgU3RlcHNcIik7XG4gICAgZ3VpLmFkZCh7IGV4ZWN1dGVGdW5jdGlvbjogKCkgPT4gbG9jYXRpb24ucmVsb2FkKCkgfSwgXCJleGVjdXRlRnVuY3Rpb25cIikubmFtZShcIlJlc2V0IHNlZWQgYW5kIGZpZWxkc1wiKTtcbiAgICBndWlcbiAgICAgIC5hZGQoXG4gICAgICAgIHtcbiAgICAgICAgICBwYXVzZTogKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF1c2VkKCFwYXVzZWQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFwicGF1c2VcIlxuICAgICAgKVxuICAgICAgLm5hbWUoXCJQYXVzZSAvIHJlc3VtZVwiKTtcbiAgICBndWkub25DaGFuZ2UoKCkgPT4ge1xuICAgICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICAgIGRpc3BsYXlDdWUoKTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIFtcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiLCBcIm15b3NpblN0cmVuZ3RoXCIsIFwibWVtYnJhbmVDb3VwbGluZ1wiXSBhcyBjb25zdCkge1xuICAgICAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGxpdmUtJHtrZXl9YCkgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUgPSBTdHJpbmcodW5pZm9ybXNba2V5XSk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGB2YWx1ZS0ke2tleX1gKSEudGV4dENvbnRlbnQgPSB1bmlmb3Jtc1trZXldLnRvRml4ZWQoa2V5ID09PSBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiID8gMiA6IDMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGd1aS5jbG9zZSgpO1xuICB9XG5cbiAgbGV0IGxhc3RGcmFtZVRpbWUgPSAwO1xuICBzZXRQYXVzZWQocGF1c2VkKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLW5vdGljZVwiKSEuaGlkZGVuID0gdHJ1ZTtcbiAgbGV0IGZyYW1lUGVuZGluZyA9IGZhbHNlO1xuICBjb25zdCBnZXRGcmFtZUludGVydmFsID0gKCkgPT4gMTAwMCAvIHVuaWZvcm1zLnRhcmdldEZQUzsgLy8gQ29udmVydCBGUFMgdG8gbWlsbGlzZWNvbmRzXG5cbiAgZnVuY3Rpb24gZnJhbWUoY3VycmVudFRpbWU6IG51bWJlcikge1xuICAgIGlmICghcGF1c2VkICYmICFyZWNvdmVyeS5hY3RpdmUgJiYgIWZyYW1lUGVuZGluZyAmJiAhbWFudWFsQWR2YW5jZVBlbmRpbmcgJiYgY3VycmVudFRpbWUgLSBsYXN0RnJhbWVUaW1lID49IGdldEZyYW1lSW50ZXJ2YWwoKSAtIDAuNSkge1xuICAgICAgZnJhbWVQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICAgIGlucHV0ID0gbGl2ZVBlcmZvcm1hbmNlLmlucHV0U25hcHNob3QoKTtcbiAgICAgIGNvbnN0IHN0ZXBzID0gdW5pZm9ybXMuYWRhcHRpdmVGcmFtZXMgPyBmcmFtZUJ1ZGdldC5jaG9vc2UodW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWUsIHVuaWZvcm1zLnRhcmdldEZQUykgOiB1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZTtcbiAgICAgIGxldCBlbmNvZGVkQXQgPSBzdGFydDtcbiAgICAgIHRpbWVzdGVwKHN0ZXBzKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZW5jb2RlZEF0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgcmV0dXJuIGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBkb25lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgZnJhbWVCdWRnZXQub2JzZXJ2ZShzdGVwcywgZG9uZSAtIHN0YXJ0LCBlbmNvZGVkQXQgLSBzdGFydCk7XG4gICAgICAgICAgbGl2ZVBlcmZvcm1hbmNlLmZyYW1lKHsgYXQ6IGRvbmUsIHN0ZXBzLCBlbmNvZGVNczogZW5jb2RlZEF0IC0gc3RhcnQsIHF1ZXVlVGFpbE1zOiBkb25lIC0gZW5jb2RlZEF0LCB0b3RhbE1zOiBkb25lIC0gc3RhcnQgfSwgaW5wdXQpO1xuICAgICAgICAgIGNvbnN0IHBlcmYgPSBsaXZlUGVyZm9ybWFuY2Uuc25hcHNob3QoKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIikhLnRleHRDb250ZW50ID0gcGF1c2VkXG4gICAgICAgICAgICA/IGBQYXVzZWQgwrcgc3RlcCAke2ZyYW1lTnJ9YFxuICAgICAgICAgICAgOiBgJHtwZXJmLnJlbmRlckZQUy50b0ZpeGVkKDApfSBGUFMgwrcgJHtwZXJmLnN0ZXBzUGVyU2Vjb25kLnRvRml4ZWQoMCl9IHN0ZXBzL3MgwrcgJHtzdGVwc30gc3RlcCR7c3RlcHMgPT09IDEgPyBcIlwiIDogXCJzXCJ9L2ZyYW1lYDtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN0b3BTaW11bGF0aW9uKVxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgZnJhbWVQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgbGFzdEZyYW1lVGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gIHJldHVybjtcbn1cblxuaW5kZXgoKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgY29uc3Qgc3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKTtcbiAgaWYgKHN0YXR1cykgc3RhdHVzLnRleHRDb250ZW50ID0gYFVuYWJsZSB0byBzdGFydCBXZWJHUFU6ICR7U3RyaW5nKGVycm9yKX1gO1xuICBjb25zdCBub3RpY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbW8tbm90aWNlXCIpO1xuICBpZiAobm90aWNlKSB7XG4gICAgbm90aWNlLmhpZGRlbiA9IGZhbHNlO1xuICAgIG5vdGljZS50ZXh0Q29udGVudCA9IGBVbmFibGUgdG8gc3RhcnQgV2ViR1BVOiAke1N0cmluZyhlcnJvcil9YDtcbiAgfVxuICBjb25zb2xlLmVycm9yKGVycm9yKTtcbn0pO1xuIiwiLy8gRXhlY3V0ZWQgb25seSB3aXRoID9tZWNoYW5pY3NUZXN0PTEuIFRlc3RzIHRoZSBhY3R1YWwgV0dTTCBwaXBlbGluZXMgb24gdHdvXG4vLyBleHBsaWNpdCB0d28tYmVhZCBmaWxhbWVudHMgYW5kIG9uZSBtZW1icmFuZSBhdHRhY2htZW50LCBub3QgYSBDUFUgc3Vycm9nYXRlLlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRlc3RNZWNoYW5pY3MoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXI7IGxpbmtzOiBHUFVCdWZmZXI7IGZvcmNlczogR1BVQnVmZmVyIH0sXG4gIGNvdW50czogeyBhY3RpbjogbnVtYmVyOyBtZW1icmFuZTogbnVtYmVyIH0sXG4gIGRpc3BhdGNoOiAoKSA9PiB2b2lkLFxuICBjb25maWd1cmU6IChzdHJlbmd0aDogbnVtYmVyLCBjb3VwbGluZzogbnVtYmVyLCBkcmFnOiBudW1iZXIpID0+IHZvaWRcbikge1xuICBjb25zdCByZXN1bHRzOiB7IG5hbWU6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuIH1bXSA9IFtdO1xuICBjb25zdCBhc3NlcnQgPSAobmFtZTogc3RyaW5nLCBvazogYm9vbGVhbikgPT4ge1xuICAgIHJlc3VsdHMucHVzaCh7IG5hbWUsIHBhc3NlZDogb2sgfSk7XG4gICAgaWYgKCFvaykgdGhyb3cgbmV3IEVycm9yKGBNZWNoYW5pY2FsIGZpeHR1cmUgZmFpbGVkOiAke25hbWV9YCk7XG4gIH07XG4gIGNvbnN0IHJlYWQgPSBhc3luYyAoYnVmZmVyOiBHUFVCdWZmZXIpID0+IHtcbiAgICBjb25zdCBjb3B5ID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IGJ1ZmZlci5zaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB9KTtcbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCAwLCBjb3B5LCAwLCBidWZmZXIuc2l6ZSk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGF3YWl0IGNvcHkubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCBkYXRhID0gY29weS5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApO1xuICAgIGNvcHkudW5tYXAoKTtcbiAgICBjb3B5LmRlc3Ryb3koKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgY29uc3QgZml4dHVyZSA9IGFzeW5jIChzdHJlbmd0aDogbnVtYmVyLCBjb3VwbGluZzogbnVtYmVyLCBkcmFnID0gMCwgZGV0YWNoZWQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGFjdGluID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMuYWN0aW4uc2l6ZSk7XG4gICAgY29uc3QgYSA9IG5ldyBVaW50MzJBcnJheShhY3RpbiksXG4gICAgICBhZiA9IG5ldyBGbG9hdDMyQXJyYXkoYWN0aW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHtcbiAgICAgIGFbaSAqIDEwXSA9IGFbaSAqIDEwICsgNl0gPSBhW2kgKiAxMCArIDddID0gaTtcbiAgICAgIGFmW2kgKiAxMCArIDJdID0gYWZbaSAqIDEwICsgM10gPSA1MDA7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBhZltpICogMTAgKyAyXSA9IFsxMCwgMTIsIDIwLCAxOF1baV07XG4gICAgICBhZltpICogMTAgKyAzXSA9IDEwO1xuICAgICAgYWZbaSAqIDEwICsgNF0gPSBpIDwgMiA/IDEgOiAtMTtcbiAgICAgIGFbaSAqIDEwICsgNl0gPSBpIDwgMiA/IDAgOiAyO1xuICAgICAgYVtpICogMTAgKyA3XSA9IGkgPCAyID8gMSA6IDM7XG4gICAgfVxuICAgIGNvbnN0IG1lbSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLnNpemUpO1xuICAgIGNvbnN0IG1mID0gbmV3IEZsb2F0MzJBcnJheShtZW0pLFxuICAgICAgbXUgPSBuZXcgVWludDMyQXJyYXkobWVtKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgICBtdVtpICogMTBdID0gaTtcbiAgICAgIG11W2kgKiAxMCArIDZdID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG11W2kgKiAxMCArIDddID0gKGkgKyBjb3VudHMubWVtYnJhbmUgLSAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG1mW2kgKiAxMCArIDJdID0gMTAwMDtcbiAgICAgIG1mW2kgKiAxMCArIDNdID0gMTAwMDtcbiAgICB9XG4gICAgbWZbMl0gPSAyNTtcbiAgICBtZlszXSA9IDEwO1xuICAgIG1mWyhjb3VudHMubWVtYnJhbmUgLyAyKSAqIDEwICsgMl0gPSAwO1xuICAgIG1mWyhjb3VudHMubWVtYnJhbmUgLyAyKSAqIDEwICsgM10gPSAxMDtcbiAgICBjb25zdCBsaW5rcyA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmxpbmtzLnNpemUpO1xuICAgIGNvbnN0IGx1ID0gbmV3IFVpbnQzMkFycmF5KGxpbmtzKSxcbiAgICAgIGxmID0gbmV3IEZsb2F0MzJBcnJheShsaW5rcyk7XG4gICAgbHUuc2V0KFsxLCAzLCAwLCAxLCAxLCAwLCAzLCAyXSwgMCk7XG4gICAgbGZbMl0gPSA1O1xuICAgIGx1LnNldChbMywgMCwgMCwgMSwgMywgMiwgMCwgMF0sIDI1NiAqIDgpO1xuICAgIGxmWzI1NiAqIDggKyAyXSA9IDE7XG4gICAgaWYgKGRldGFjaGVkKSB7XG4gICAgICBhWzZdID0gYVs3XSA9IDA7XG4gICAgICBhWzI2XSA9IGFbMjddID0gMjtcbiAgICB9XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMuYWN0aW4sIDAsIGFjdGluKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgbWVtKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5saW5rcywgMCwgbGlua3MpO1xuICAgIGNvbmZpZ3VyZShzdHJlbmd0aCwgY291cGxpbmcsIGRyYWcpO1xuICAgIGRpc3BhdGNoKCk7XG4gICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgZm9yY2VzOiBuZXcgSW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuZm9yY2VzKSkuc3ViYXJyYXkoMCwgMiAqIChjb3VudHMuYWN0aW4gKyBjb3VudHMubWVtYnJhbmUpKSxcbiAgICAgIGFjdGluOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpLFxuICAgICAgbWVtYnJhbmU6IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLm1lbWJyYW5lKSksXG4gICAgfTtcbiAgfTtcbiAgbGV0IHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLCAwKTtcbiAgYXNzZXJ0KFwib2ZmIGlzIG1lY2hhbmljYWxseSBpbmVydFwiLCBzdGF0ZS5mb3JjZXMuZXZlcnkoKHgpID0+IHggPT09IDApICYmIHN0YXRlLmFjdGluWzJdID09PSAxMCAmJiBzdGF0ZS5tZW1icmFuZVsyXSA9PT0gMjUpO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMCk7XG4gIGFzc2VydChcIm1vdG9yIGNvbnRyYWN0cyBvcHBvc2VkIGZpbGFtZW50c1wiLCBzdGF0ZS5hY3RpblsyXSA+IDEwICYmIHN0YXRlLmFjdGluWzIyXSA8IDIwKTtcbiAgYXNzZXJ0KFwibW90b3Igd2l0aG91dCB0ZXRoZXIgZG9lcyBub3QgbW92ZSBtZW1icmFuZVwiLCBzdGF0ZS5tZW1icmFuZVsyXSA9PT0gMjUpO1xuICBhc3NlcnQoXCJtb3RvciBmb3JjZXMgYXJlIHJlY2lwcm9jYWxcIiwgc3RhdGUuZm9yY2VzWzBdID09PSAtc3RhdGUuZm9yY2VzWzRdICYmIHN0YXRlLmZvcmNlc1swXSA+IDApO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMCwgMC4wNSk7XG4gIGFzc2VydChcInRldGhlciBwdWxscyBtZW1icmFuZSB0b3dhcmQgZmlsYW1lbnRcIiwgc3RhdGUubWVtYnJhbmVbMl0gPCAyNSAmJiBzdGF0ZS5hY3RpblsyMl0gPiAyMCk7XG4gIGFzc2VydChcInRldGhlciByZWFjdGlvbiBhY3RzIG9uIGFjdGluXCIsIHN0YXRlLmZvcmNlc1s0XSA9PT0gLXN0YXRlLmZvcmNlc1tjb3VudHMuYWN0aW4gKiAyXSk7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLjA1LCAwLjA1KTtcbiAgbGV0IGZ4ID0gMCxcbiAgICBmeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGUuZm9yY2VzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgZnggKz0gc3RhdGUuZm9yY2VzW2ldO1xuICAgIGZ5ICs9IHN0YXRlLmZvcmNlc1tpICsgMV07XG4gIH1cbiAgYXNzZXJ0KFwiY29tYmluZWQgaW50ZXJuYWwgZm9yY2Ugc3VtcyB0byB6ZXJvXCIsIGZ4ID09PSAwICYmIGZ5ID09PSAwKTtcbiAgY29uc3QgZnJlZURpc3BsYWNlbWVudCA9IHN0YXRlLmFjdGluWzJdIC0gMTA7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLjA1LCAwLjA1LCA0KTtcbiAgYXNzZXJ0KFwiY2x1dGNoIHJlZHVjZXMgbW90aW9uIHdpdGhvdXQgY2hhbmdpbmcgZ2VuZXJhdGVkIGZvcmNlXCIsIHN0YXRlLmFjdGluWzJdIC0gMTAgPCBmcmVlRGlzcGxhY2VtZW50ICYmIHN0YXRlLmZvcmNlc1swXSA+IDApO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMC4wNSwgMCwgdHJ1ZSk7XG4gIGFzc2VydChcbiAgICBcImRlcG9seW1lcml6ZWQgZW5kcG9pbnRzIHJlbGVhc2UgbW90b3IgYW5kIHRldGhlclwiLFxuICAgIHN0YXRlLmZvcmNlcy5ldmVyeSgoeCkgPT4geCA9PT0gMClcbiAgKTtcbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iLCIvLyBDb25zZXJ2YXRpdmUgeS1iYW5kIGVkZ2UgaW5kZXguIFByZWRpY2F0ZXMgcmVtYWluIGV4YWN0OyBsb25nIGVkZ2VzIGFyZVxuLy8gcmV0YWluZWQgaW4gYSBnbG9iYWwgbGlzdCBhbmQgbG9uZyBib25kIHF1ZXJpZXMgZmFsbCBiYWNrIHRvIGFsbCBlZGdlcy5cbi8vIE5vIGJvdW5kYXJ5L2NvbGxpc2lvbiBpcyBkaXNjYXJkZWQgdG8gaW1wcm92ZSBkaWFnbm9zdGljIGxhdGVuY3kuXG5jb25zdCBCQU5EID0gNDtcbnR5cGUgRWRnZSA9IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IGR4OiBudW1iZXI7IGR5OiBudW1iZXI7IGx4OiBudW1iZXI7IGh4OiBudW1iZXI7IGx5OiBudW1iZXI7IGh5OiBudW1iZXIgfTtcbmZ1bmN0aW9uIGVkZ2VJbmRleChtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGU6IG51bWJlciwgcmV2ZXJzZSA9IGZhbHNlKSB7XG4gIGNvbnN0IG4gPSBtZW1icmFuZS5sZW5ndGggLyBzdHJpZGU7XG4gIGNvbnN0IGVkZ2VzOiBFZGdlW10gPSBbXSxcbiAgICByb3dzID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VbXT4oKSxcbiAgICB3aWRlOiBFZGdlW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICBjb25zdCBqID0gKGkgKyAocmV2ZXJzZSA/IG4gLSAxIDogMSkpICUgbjtcbiAgICBjb25zdCB4ID0gbWVtYnJhbmVbaSAqIHN0cmlkZSArIDJdLFxuICAgICAgeSA9IG1lbWJyYW5lW2kgKiBzdHJpZGUgKyAzXSxcbiAgICAgIGJ4ID0gbWVtYnJhbmVbaiAqIHN0cmlkZSArIDJdLFxuICAgICAgYnkgPSBtZW1icmFuZVtqICogc3RyaWRlICsgM107XG4gICAgaWYgKCFbeCwgeSwgYngsIGJ5XS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJOb24tZmluaXRlIG1lbWJyYW5lIGdlb21ldHJ5XCIpO1xuICAgIGNvbnN0IGUgPSB7IHgsIHksIGR4OiBieCAtIHgsIGR5OiBieSAtIHksIGx4OiBNYXRoLm1pbih4LCBieCksIGh4OiBNYXRoLm1heCh4LCBieCksIGx5OiBNYXRoLm1pbih5LCBieSksIGh5OiBNYXRoLm1heCh5LCBieSkgfTtcbiAgICBlZGdlcy5wdXNoKGUpO1xuICAgIGNvbnN0IGxvdyA9IE1hdGguZmxvb3IoZS5seSAvIEJBTkQpLFxuICAgICAgaGlnaCA9IE1hdGguZmxvb3IoZS5oeSAvIEJBTkQpO1xuICAgIGlmIChoaWdoIC0gbG93ID4gMjU2KSB7XG4gICAgICB3aWRlLnB1c2goZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgcm93ID0gbG93OyByb3cgPD0gaGlnaDsgcm93KyspIHtcbiAgICAgIGNvbnN0IGxpc3QgPSByb3dzLmdldChyb3cpO1xuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChlKTtcbiAgICAgIGVsc2Ugcm93cy5zZXQocm93LCBbZV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBlZGdlcywgcm93cywgd2lkZSB9O1xufVxuXG4vLyBMZWdhY3kgcGFydGljbGUgY291bnRzIHVzZSBwaXhlbC1yb3cgc2FtcGxpbmc7IGV4cGxpY2l0LWZpbGFtZW50IG1vZGUgdXNlc1xuLy8gZXhhY3QgeSBjb29yZGluYXRlcy4gVGhlIGdlb21ldHJ5IGZvcm11bGEvb3JkZXIgbWF0Y2hlcyB0aGUgcHJpb3IgZnVsbCBzY2FuLlxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb25PY2N1cGFuY3kobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTAsIGV4YWN0ID0gZmFsc2UpIHtcbiAgY29uc3QgeyByb3dzLCB3aWRlIH0gPSBlZGdlSW5kZXgobWVtYnJhbmUsIHN0cmlkZSwgdHJ1ZSk7XG4gIGNvbnN0IGNhY2hlID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcltdPigpO1xuICByZXR1cm4gKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoeCkgfHwgIU51bWJlci5pc0Zpbml0ZSh5KSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoeSksXG4gICAgICBzY2FuWSA9IGV4YWN0ID8geSA6IHJvdyArIDAuNTtcbiAgICBjb25zdCBjYW5kaWRhdGVzID0gcm93cy5nZXQoTWF0aC5mbG9vcihzY2FuWSAvIEJBTkQpKSA/PyBbXTtcbiAgICBpZiAoZXhhY3QpIHtcbiAgICAgIGxldCBpbnNpZGUgPSBmYWxzZTtcbiAgICAgIGZvciAoY29uc3QgbGlzdCBvZiBbY2FuZGlkYXRlcywgd2lkZV0pXG4gICAgICAgIGZvciAoY29uc3QgZSBvZiBsaXN0KSB7XG4gICAgICAgICAgaWYgKGUueSA+IHNjYW5ZICE9IGUueSArIGUuZHkgPiBzY2FuWSAmJiBlLnggKyAoKHNjYW5ZIC0gZS55KSAqIGUuZHgpIC8gZS5keSA8PSB4KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICB9XG4gICAgICByZXR1cm4gaW5zaWRlO1xuICAgIH1cbiAgICBsZXQgY3Jvc3NpbmdzID0gY2FjaGUuZ2V0KHJvdyk7XG4gICAgaWYgKCFjcm9zc2luZ3MpIHtcbiAgICAgIGNyb3NzaW5ncyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBsaXN0IG9mIFtjYW5kaWRhdGVzLCB3aWRlXSlcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgICBpZiAoZS55ID4gc2NhblkgIT0gZS55ICsgZS5keSA+IHNjYW5ZKSBjcm9zc2luZ3MucHVzaChlLnggKyAoKHNjYW5ZIC0gZS55KSAqIGUuZHgpIC8gZS5keSk7XG4gICAgICAgIH1cbiAgICAgIGNyb3NzaW5ncy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgICBjYWNoZS5zZXQocm93LCBjcm9zc2luZ3MpO1xuICAgIH1cbiAgICBsZXQgbG8gPSAwLFxuICAgICAgaGkgPSBjcm9zc2luZ3MubGVuZ3RoO1xuICAgIHdoaWxlIChsbyA8IGhpKSB7XG4gICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICBpZiAoY3Jvc3NpbmdzW21pZF0gPD0geCkgbG8gPSBtaWQgKyAxO1xuICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvICUgMiA9PT0gMTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb25Cb25kQ3Jvc3NpbmcobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTApIHtcbiAgY29uc3QgeyBlZGdlcywgcm93cywgd2lkZSB9ID0gZWRnZUluZGV4KG1lbWJyYW5lLCBzdHJpZGUpO1xuICByZXR1cm4gKGF4OiBudW1iZXIsIGF5OiBudW1iZXIsIGJ4OiBudW1iZXIsIGJ5OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBkeCA9IGJ4IC0gYXgsXG4gICAgICBkeSA9IGJ5IC0gYXksXG4gICAgICBtaW5YID0gTWF0aC5taW4oYXgsIGJ4KSxcbiAgICAgIG1heFggPSBNYXRoLm1heChheCwgYngpLFxuICAgICAgbWluWSA9IE1hdGgubWluKGF5LCBieSksXG4gICAgICBtYXhZID0gTWF0aC5tYXgoYXksIGJ5KTtcbiAgICBjb25zdCBjcm9zc2VzID0gKGxpc3Q6IEVkZ2VbXSkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKG1heFggPCBlLmx4IHx8IG1pblggPiBlLmh4IHx8IG1heFkgPCBlLmx5IHx8IG1pblkgPiBlLmh5KSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZGVub21pbmF0b3IgPSBkeCAqIGUuZHkgLSBkeSAqIGUuZHg7XG4gICAgICAgIGlmIChNYXRoLmFicyhkZW5vbWluYXRvcikgPCAxZS04KSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgdCA9ICgoZS54IC0gYXgpICogZS5keSAtIChlLnkgLSBheSkgKiBlLmR4KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBjb25zdCB1ID0gKChlLnggLSBheCkgKiBkeSAtIChlLnkgLSBheSkgKiBkeCkgLyBkZW5vbWluYXRvcjtcbiAgICAgICAgaWYgKHQgPiAxZS01ICYmIHQgPCAxIC0gMWUtNSAmJiB1ID49IDAgJiYgdSA8PSAxKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIGNvbnN0IGxvdyA9IE1hdGguZmxvb3IobWluWSAvIEJBTkQpLFxuICAgICAgaGlnaCA9IE1hdGguZmxvb3IobWF4WSAvIEJBTkQpO1xuICAgIGlmIChoaWdoIC0gbG93ID4gMikgcmV0dXJuIGNyb3NzZXMoZWRnZXMpO1xuICAgIGlmIChjcm9zc2VzKHdpZGUpKSByZXR1cm4gdHJ1ZTtcbiAgICBmb3IgKGxldCByb3cgPSBsb3c7IHJvdyA8PSBoaWdoOyByb3crKykgaWYgKGNyb3NzZXMocm93cy5nZXQocm93KSA/PyBbXSkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiIsIi8vIFNlcGFyYXRlIHNlZWRlZCBzdHJlYW1zIGZvciBpbml0aWFsIHBvc2l0aW9ucy9rZXlzIGFuZCBDUFUgc3Byb3V0IHNjaGVkdWxpbmcuXG4vLyBHUFUgaW4tcGxhY2Uga2VybmVscyBpbmhlcml0ZWQgZnJvbSB0aGUgcHJvdG90eXBlIGFyZSBub3QgYml0d2lzZSBkZXRlcm1pbmlzdGljLlxuZXhwb3J0IGZ1bmN0aW9uIHNlZWRlZFJhbmRvbShzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgc3RhdGUgPSBzZWVkID4+PiAwO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHN0YXRlID0gKHN0YXRlICsgMHg2ZDJiNzlmNSkgPj4+IDA7XG4gICAgbGV0IHQgPSBNYXRoLmltdWwoc3RhdGUgXiAoc3RhdGUgPj4+IDE1KSwgc3RhdGUgfCAxKTtcbiAgICB0IF49IHQgKyBNYXRoLmltdWwodCBeICh0ID4+PiA3KSwgdCB8IDYxKTtcbiAgICByZXR1cm4gKCh0IF4gKHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cbiIsImV4cG9ydCBjbGFzcyBGcmFtZUJ1ZGdldCB7XG4gIHByaXZhdGUgc3RlcE1zID0gNDtcbiAgcHJpdmF0ZSBvdmVyaGVhZE1zID0gMjtcbiAgY2hvb3NlKG1heFN0ZXBzOiBudW1iZXIsIHRhcmdldEZQUzogbnVtYmVyKSB7XG4gICAgY29uc3QgYnVkZ2V0ID0gTWF0aC5tYXgoMSwgMTAwMCAvIE1hdGgubWF4KDEsIHRhcmdldEZQUykgLSAyIC0gdGhpcy5vdmVyaGVhZE1zKTtcbiAgICByZXR1cm4gTWF0aC5tYXgoMSwgTWF0aC5taW4oTWF0aC5mbG9vcihtYXhTdGVwcyksIE1hdGguZmxvb3IoYnVkZ2V0IC8gTWF0aC5tYXgoMC4xLCB0aGlzLnN0ZXBNcykpKSk7XG4gIH1cbiAgb2JzZXJ2ZShzdGVwczogbnVtYmVyLCB0b3RhbE1zOiBudW1iZXIsIGVuY29kZU1zOiBudW1iZXIpIHtcbiAgICAvLyBGaXhlZCBwaHlzaWNhbCBzdGVwczsgYWRhcHQgYmF0Y2hpbmcgb25seSwgbmV2ZXIgZHQgb3Igc29sdmVyIGl0ZXJhdGlvbnMuXG4gICAgdGhpcy5zdGVwTXMgPSAwLjggKiB0aGlzLnN0ZXBNcyArIDAuMiAqIE1hdGgubWF4KDAuMSwgKHRvdGFsTXMgLSB0aGlzLm92ZXJoZWFkTXMpIC8gc3RlcHMpO1xuICAgIHRoaXMub3ZlcmhlYWRNcyA9IDAuOSAqIHRoaXMub3ZlcmhlYWRNcyArIDAuMSAqIE1hdGgubWluKDMsIGVuY29kZU1zIC8gTWF0aC5tYXgoMSwgc3RlcHMpKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGcmFtZVNhbXBsZSA9IHsgYXQ6IG51bWJlcjsgc3RlcHM6IG51bWJlcjsgZW5jb2RlTXM6IG51bWJlcjsgcXVldWVUYWlsTXM6IG51bWJlcjsgdG90YWxNczogbnVtYmVyIH07XG5mdW5jdGlvbiBkaXN0cmlidXRpb24odmFsdWVzOiBudW1iZXJbXSkge1xuICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIHJldHVybiBzb3J0ZWQubGVuZ3RoXG4gICAgPyB7IG1lZGlhbjogc29ydGVkW3NvcnRlZC5sZW5ndGggPj4gMV0sIHA5NTogc29ydGVkW01hdGgubWluKHNvcnRlZC5sZW5ndGggLSAxLCBNYXRoLmZsb29yKHNvcnRlZC5sZW5ndGggKiAwLjk1KSldLCBtYXg6IHNvcnRlZC5hdCgtMSkgfVxuICAgIDogbnVsbDtcbn1cbmV4cG9ydCBjbGFzcyBMaXZlUGVyZm9ybWFuY2Uge1xuICBwcml2YXRlIGZyYW1lczogRnJhbWVTYW1wbGVbXSA9IFtdO1xuICBwcml2YXRlIGlucHV0czogbnVtYmVyW10gPSBbXTtcbiAgaW5wdXRWZXJzaW9uID0gMDtcbiAgcHJpdmF0ZSBwcm9jZXNzZWRWZXJzaW9uID0gMDtcbiAgcHJpdmF0ZSBpbnB1dEF0ID0gMDtcbiAgY29hbGVzY2VkSW5wdXRzID0gMDtcbiAgaW5wdXQoKSB7XG4gICAgdGhpcy5pbnB1dEF0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgcmV0dXJuICsrdGhpcy5pbnB1dFZlcnNpb247XG4gIH1cbiAgaW5wdXRTbmFwc2hvdCgpIHtcbiAgICByZXR1cm4geyB2ZXJzaW9uOiB0aGlzLmlucHV0VmVyc2lvbiwgYXQ6IHRoaXMuaW5wdXRBdCB9O1xuICB9XG4gIGZyYW1lKHNhbXBsZTogRnJhbWVTYW1wbGUsIGlucHV0OiB7IHZlcnNpb246IG51bWJlcjsgYXQ6IG51bWJlciB9KSB7XG4gICAgdGhpcy5mcmFtZXMucHVzaChzYW1wbGUpO1xuICAgIGlmICh0aGlzLmZyYW1lcy5sZW5ndGggPiA2MDApIHRoaXMuZnJhbWVzLnNoaWZ0KCk7XG4gICAgaWYgKGlucHV0LnZlcnNpb24gPiB0aGlzLnByb2Nlc3NlZFZlcnNpb24pIHtcbiAgICAgIHRoaXMuY29hbGVzY2VkSW5wdXRzICs9IE1hdGgubWF4KDAsIGlucHV0LnZlcnNpb24gLSB0aGlzLnByb2Nlc3NlZFZlcnNpb24gLSAxKTtcbiAgICAgIHRoaXMucHJvY2Vzc2VkVmVyc2lvbiA9IGlucHV0LnZlcnNpb247XG4gICAgICB0aGlzLmlucHV0cy5wdXNoKHNhbXBsZS5hdCAtIGlucHV0LmF0KTtcbiAgICAgIGlmICh0aGlzLmlucHV0cy5sZW5ndGggPiAyNTYpIHRoaXMuaW5wdXRzLnNoaWZ0KCk7XG4gICAgfVxuICB9XG4gIGNsZWFyRnJhbWVzKCkge1xuICAgIHRoaXMuZnJhbWVzLmxlbmd0aCA9IDA7XG4gIH1cbiAgc25hcHNob3QoKSB7XG4gICAgY29uc3QgZnJhbWVzID0gdGhpcy5mcmFtZXMsXG4gICAgICBzcGFuID0gZnJhbWVzLmxlbmd0aCA+IDEgPyAoZnJhbWVzLmF0KC0xKSEuYXQgLSBmcmFtZXNbMF0uYXQpIC8gMTAwMCA6IDA7XG4gICAgY29uc3QgaW50ZXJ2YWxzID0gZnJhbWVzLnNsaWNlKDEpLm1hcCgoZiwgaSkgPT4gZi5hdCAtIGZyYW1lc1tpXS5hdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpbmRvd0ZyYW1lczogZnJhbWVzLmxlbmd0aCxcbiAgICAgIHJlbmRlckZQUzogc3BhbiA/IChmcmFtZXMubGVuZ3RoIC0gMSkgLyBzcGFuIDogMCxcbiAgICAgIHN0ZXBzUGVyU2Vjb25kOiBzcGFuID8gZnJhbWVzLnNsaWNlKDEpLnJlZHVjZSgobiwgZikgPT4gbiArIGYuc3RlcHMsIDApIC8gc3BhbiA6IDAsXG4gICAgICBmcmFtZUludGVydmFsTXM6IGRpc3RyaWJ1dGlvbihpbnRlcnZhbHMpLFxuICAgICAgZW5jb2RlTXM6IGRpc3RyaWJ1dGlvbihmcmFtZXMubWFwKChmKSA9PiBmLmVuY29kZU1zKSksXG4gICAgICBxdWV1ZVRhaWxNczogZGlzdHJpYnV0aW9uKGZyYW1lcy5tYXAoKGYpID0+IGYucXVldWVUYWlsTXMpKSxcbiAgICAgIGlucHV0VG9Db21wbGV0ZWRGcmFtZU1zOiBkaXN0cmlidXRpb24odGhpcy5pbnB1dHMpLFxuICAgICAgY29hbGVzY2VkSW5wdXRzOiB0aGlzLmNvYWxlc2NlZElucHV0cyxcbiAgICB9O1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUmVuZGVyTW9kdWxlIHtcbiAgcHJpdmF0ZSBkZXZpY2U6IEdQVURldmljZTtcbiAgcHJpdmF0ZSBjYW52YXNGb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQ7XG5cbiAgLy8gUmVuZGVyaW5nIHJlc291cmNlc1xuICBwcml2YXRlIGludGVybWVkaWF0ZVRleHR1cmU6IEdQVVRleHR1cmU7XG4gIHByaXZhdGUgY29tcHV0ZVJlbmRlclBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmU7XG4gIHByaXZhdGUgcmVuZGVyUGlwZWxpbmU6IEdQVVJlbmRlclBpcGVsaW5lO1xuICBwcml2YXRlIGJpbmRHcm91cFBvc3RQcm9jZXNzOiBHUFVCaW5kR3JvdXA7XG4gIHByaXZhdGUgcmVuZGVyQmluZEdyb3VwOiBHUFVCaW5kR3JvdXA7XG4gIHByaXZhdGUgc3BlY2ltZW5QaXBlbGluZTogR1BVQ29tcHV0ZVBpcGVsaW5lO1xuICBwcml2YXRlIHNwZWNpbWVuQmluZEdyb3VwOiBHUFVCaW5kR3JvdXA7XG4gIHByaXZhdGUgc3BlY2ltZW5MYXlvdXQ6IEdQVUJpbmRHcm91cExheW91dDtcbiAgcHJpdmF0ZSBwcmVwYXJlc1NwZWNpbWVuOiBib29sZWFuO1xuICBwcml2YXRlIHZpZXdCdWZmZXI6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBzaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XG4gIHJlYWRvbmx5IHZpZXcgPSB7IG1vZGU6IDEsIHpvb206IDMsIGZvY3VzOiAwLjE1LCBjb250cmFzdDogMS4yLCBjaHJvbWE6IDAuNDUsIGdyYWluOiAwLjYsIGZvbGxvdzogdHJ1ZSwgYXV0b0ZpdDogdHJ1ZSB9O1xuICByZWFkb25seSBjYW1lcmE6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfTtcbiAgcHJpdmF0ZSBjYW1lcmFUYXJnZXQ6IHsgeDogbnVtYmVyOyB5OiBudW1iZXIgfTtcblxuICBwcml2YXRlIGV4dGVudCA9IHsgd2lkdGg6IDIwMCwgaGVpZ2h0OiAyMDAgfTtcbiAgc2V0Q2VsbEJvdW5kcyhsZWZ0OiBudW1iZXIsIHJpZ2h0OiBudW1iZXIsIHRvcDogbnVtYmVyLCBib3R0b206IG51bWJlcikge1xuICAgIGlmICghW2xlZnQsIHJpZ2h0LCB0b3AsIGJvdHRvbV0uZXZlcnkoTnVtYmVyLmlzRmluaXRlKSB8fCByaWdodCA8PSBsZWZ0IHx8IGJvdHRvbSA8PSB0b3ApIHJldHVybjtcbiAgICB0aGlzLmNhbWVyYVRhcmdldCA9IHsgeDogKGxlZnQgKyByaWdodCkgLyAyLCB5OiAodG9wICsgYm90dG9tKSAvIDIgfTtcbiAgICB0aGlzLmV4dGVudCA9IHsgd2lkdGg6IHJpZ2h0IC0gbGVmdCwgaGVpZ2h0OiBib3R0b20gLSB0b3AgfTtcbiAgfVxuICBwcml2YXRlIGZpdHRlZFpvb20oKSB7XG4gICAgcmV0dXJuIE1hdGgubWF4KDAuMiwgTWF0aC5taW4oMy44LCAod2luZG93LmlubmVyV2lkdGggKiAwLjc2KSAvIHRoaXMuZXh0ZW50LndpZHRoLCAoTWF0aC5tYXgoMTAwLCB3aW5kb3cuaW5uZXJIZWlnaHQgLSAxNjApICogMC43OCkgLyB0aGlzLmV4dGVudC5oZWlnaHQpKTtcbiAgfVxuICBmaXRJbW1lZGlhdGVseSgpIHtcbiAgICBpZiAodGhpcy52aWV3LmF1dG9GaXQpIHRoaXMudmlldy56b29tID0gdGhpcy5maXR0ZWRab29tKCk7XG4gICAgaWYgKHRoaXMudmlldy5mb2xsb3cpIE9iamVjdC5hc3NpZ24odGhpcy5jYW1lcmEsIHRoaXMuY2FtZXJhVGFyZ2V0KTtcbiAgfVxuICBwcml2YXRlIHNjcmVlblNjYWxlKCkge1xuICAgIHJldHVybiB7IHg6ICh0aGlzLnZpZXcuem9vbSAqIHRoaXMuc2l6ZS53aWR0aCkgLyB3aW5kb3cuaW5uZXJXaWR0aCwgeTogKHRoaXMudmlldy56b29tICogdGhpcy5zaXplLmhlaWdodCkgLyB3aW5kb3cuaW5uZXJIZWlnaHQgfTtcbiAgfVxuICBzY3JlZW5Ub1dvcmxkKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLnZpZXcubW9kZSkgcmV0dXJuIHsgeCwgeSB9O1xuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY3JlZW5TY2FsZSgpO1xuICAgIHJldHVybiB7IHg6IHRoaXMuY2FtZXJhLnggKyAoeCAtIHRoaXMuc2l6ZS53aWR0aCAvIDIpIC8gc2NhbGUueCwgeTogdGhpcy5jYW1lcmEueSArICh5IC0gdGhpcy5zaXplLmhlaWdodCAvIDIpIC8gc2NhbGUueSB9O1xuICB9XG4gIHdvcmxkVG9TY3JlZW4oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMudmlldy5tb2RlKSByZXR1cm4geyB4LCB5IH07XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjcmVlblNjYWxlKCk7XG4gICAgcmV0dXJuIHsgeDogKHggLSB0aGlzLmNhbWVyYS54KSAqIHNjYWxlLnggKyB0aGlzLnNpemUud2lkdGggLyAyLCB5OiAoeSAtIHRoaXMuY2FtZXJhLnkpICogc2NhbGUueSArIHRoaXMuc2l6ZS5oZWlnaHQgLyAyIH07XG4gIH1cblxuICBwcml2YXRlIFRFWFRVUkVfV09SS0dST1VQX0NPVU5UOiBbbnVtYmVyLCBudW1iZXJdO1xuXG4gIHB1YmxpYyBjb25zdHJ1Y3RvcihcbiAgICBkZXZpY2U6IEdQVURldmljZSxcbiAgICBjYW52YXNGb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQsXG4gICAgY2FudmFzU2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9LFxuICAgIHJlbmRlclNoYWRlcjogR1BVU2hhZGVyTW9kdWxlLFxuICAgIHRleHR1cmVzOiB7XG4gICAgICBzaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XG4gICAgfSxcbiAgICBzaGFyZWRMYXlvdXRFbnRyaWVzOiBHUFVCaW5kR3JvdXBMYXlvdXRFbnRyeVtdLFxuICAgIHNoYXJlZEJpbmRHcm91cEVudHJpZXM6IEdQVUJpbmRHcm91cEVudHJ5W10sXG4gICAgZ2VvbWV0cnk6IEdQVUJ1ZmZlckJpbmRpbmcsXG4gICAgZXh0ZXJuYWxTcGVjaW1lbj86IEdQVVRleHR1cmVcbiAgKSB7XG4gICAgdGhpcy5kZXZpY2UgPSBkZXZpY2U7XG4gICAgdGhpcy5jYW52YXNGb3JtYXQgPSBjYW52YXNGb3JtYXQ7XG4gICAgdGhpcy5zaXplID0gY2FudmFzU2l6ZTtcbiAgICB0aGlzLmNhbWVyYSA9IHsgeDogY2FudmFzU2l6ZS53aWR0aCAvIDIsIHk6IGNhbnZhc1NpemUuaGVpZ2h0IC8gMiB9O1xuICAgIHRoaXMuY2FtZXJhVGFyZ2V0ID0geyAuLi50aGlzLmNhbWVyYSB9O1xuICAgIHRoaXMuVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQgPSBbTWF0aC5jZWlsKHRleHR1cmVzLnNpemUud2lkdGggLyAxNiksIE1hdGguY2VpbCh0ZXh0dXJlcy5zaXplLmhlaWdodCAvIDE2KV07XG5cbiAgICBjb25zdCBCSU5ESU5HX0lOVEVSTUVESUFURV9URVhUVVJFID0gMTA7XG4gICAgdGhpcy52aWV3QnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IDQ4LCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIH0pO1xuICAgIHRoaXMucHJlcGFyZXNTcGVjaW1lbiA9ICFleHRlcm5hbFNwZWNpbWVuO1xuICAgIGNvbnN0IHNwZWNpbWVuID1cbiAgICAgIGV4dGVybmFsU3BlY2ltZW4gPz9cbiAgICAgIGRldmljZS5jcmVhdGVUZXh0dXJlKHtcbiAgICAgICAgc2l6ZTogW3RleHR1cmVzLnNpemUud2lkdGgsIHRleHR1cmVzLnNpemUuaGVpZ2h0XSxcbiAgICAgICAgZm9ybWF0OiBcInJnYmExNmZsb2F0XCIsXG4gICAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyxcbiAgICAgIH0pO1xuICAgIGNvbnN0IHNwZWNpbWVuVmlldyA9IHNwZWNpbWVuLmNyZWF0ZVZpZXcoKTtcbiAgICBjb25zdCBzcGVjaW1lbkxheW91dCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgICAgZW50cmllczogW1xuICAgICAgICAuLi5zaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgICAgICB7IGJpbmRpbmc6IDEzLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFLCBidWZmZXI6IHsgdHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxNiwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgc3RvcmFnZVRleHR1cmU6IHsgYWNjZXNzOiBcIndyaXRlLW9ubHlcIiwgZm9ybWF0OiBcInJnYmExNmZsb2F0XCIgfSB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICB0aGlzLnNwZWNpbWVuTGF5b3V0ID0gc3BlY2ltZW5MYXlvdXQ7XG4gICAgdGhpcy5zcGVjaW1lbkJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGF5b3V0OiBzcGVjaW1lbkxheW91dCxcbiAgICAgIGVudHJpZXM6IFsuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLCB7IGJpbmRpbmc6IDEzLCByZXNvdXJjZTogZ2VvbWV0cnkgfSwgeyBiaW5kaW5nOiAxNiwgcmVzb3VyY2U6IHNwZWNpbWVuVmlldyB9XSxcbiAgICB9KTtcbiAgICB0aGlzLnNwZWNpbWVuUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICAgIGxheW91dDogZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHsgYmluZEdyb3VwTGF5b3V0czogW3NwZWNpbWVuTGF5b3V0XSB9KSxcbiAgICAgIGNvbXB1dGU6IHsgbW9kdWxlOiByZW5kZXJTaGFkZXIsIGVudHJ5UG9pbnQ6IFwiYnVpbGRfc3BlY2ltZW5cIiB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbnRlcm1lZGlhdGVUZXh0dXJlID0gdGhpcy5kZXZpY2UuY3JlYXRlVGV4dHVyZSh7XG4gICAgICBzaXplOiBbY2FudmFzU2l6ZS53aWR0aCwgY2FudmFzU2l6ZS5oZWlnaHRdLFxuICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5DT1BZX1NSQyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzXCIsXG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIC4uLnNoYXJlZExheW91dEVudHJpZXMsXG4gICAgICAgIHsgYmluZGluZzogMTEsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIHRleHR1cmU6IHsgc2FtcGxlVHlwZTogXCJmbG9hdFwiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxMiwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgc2FtcGxlcjogeyB0eXBlOiBcImZpbHRlcmluZ1wiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxNywgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7IHR5cGU6IFwidW5pZm9ybVwiIH0gfSxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgICAgIHN0b3JhZ2VUZXh0dXJlOiB7XG4gICAgICAgICAgICBhY2Nlc3M6IFwid3JpdGUtb25seVwiLFxuICAgICAgICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHRoaXMuYmluZEdyb3VwUG9zdFByb2Nlc3MgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IGBCaW5kIEdyb3VwIFBvc3QgUHJvY2Vzc2AsXG4gICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzLFxuICAgICAgZW50cmllczogW1xuICAgICAgICAuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLFxuICAgICAgICB7IGJpbmRpbmc6IDExLCByZXNvdXJjZTogc3BlY2ltZW5WaWV3IH0sXG4gICAgICAgIHsgYmluZGluZzogMTIsIHJlc291cmNlOiBkZXZpY2UuY3JlYXRlU2FtcGxlcih7IG1hZ0ZpbHRlcjogXCJsaW5lYXJcIiwgbWluRmlsdGVyOiBcImxpbmVhclwiIH0pIH0sXG4gICAgICAgIHsgYmluZGluZzogMTcsIHJlc291cmNlOiB7IGJ1ZmZlcjogdGhpcy52aWV3QnVmZmVyIH0gfSxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXRQb3N0UHJvY2VzcyA9IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcInBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3NcIixcbiAgICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2Vzc10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbXB1dGVSZW5kZXJQaXBlbGluZSA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgICBsYXlvdXQ6IHBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3MsXG4gICAgICBjb21wdXRlOiB7IG1vZHVsZTogcmVuZGVyU2hhZGVyLCBlbnRyeVBvaW50OiBcInJlbmRlclwiIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBzY3JlZW5TYW1wbGVyID0gdGhpcy5kZXZpY2UuY3JlYXRlU2FtcGxlcih7XG4gICAgICBtYWdGaWx0ZXI6IFwibmVhcmVzdFwiLFxuICAgICAgbWluRmlsdGVyOiBcIm5lYXJlc3RcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbmRlckJpbmRHcm91cExheW91dCA9IHRoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICBsYWJlbDogXCJSZW5kZXIgQmluZCBHcm91cCBMYXlvdXRcIixcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgeyBiaW5kaW5nOiAwLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCwgc2FtcGxlcjogeyB0eXBlOiBcIm5vbi1maWx0ZXJpbmdcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsIHRleHR1cmU6IHt9IH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJCaW5kR3JvdXAgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIEJpbmQgR3JvdXBcIixcbiAgICAgIGxheW91dDogcmVuZGVyQmluZEdyb3VwTGF5b3V0LFxuICAgICAgZW50cmllczogW1xuICAgICAgICB7IGJpbmRpbmc6IDAsIHJlc291cmNlOiBzY3JlZW5TYW1wbGVyIH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCkgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclBpcGVsaW5lID0gdGhpcy5kZXZpY2UuY3JlYXRlUmVuZGVyUGlwZWxpbmUoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIFBpcGVsaW5lXCIsXG4gICAgICBsYXlvdXQ6IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgICAgYmluZEdyb3VwTGF5b3V0czogW3RoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7IGVudHJpZXM6IFtdIH0pLCByZW5kZXJCaW5kR3JvdXBMYXlvdXRdLFxuICAgICAgfSksXG4gICAgICB2ZXJ0ZXg6IHtcbiAgICAgICAgbW9kdWxlOiByZW5kZXJTaGFkZXIsXG4gICAgICAgIGVudHJ5UG9pbnQ6IFwidmVydFwiLFxuICAgICAgfSxcbiAgICAgIGZyYWdtZW50OiB7XG4gICAgICAgIG1vZHVsZTogcmVuZGVyU2hhZGVyLFxuICAgICAgICBlbnRyeVBvaW50OiBcImZyYWdcIixcbiAgICAgICAgdGFyZ2V0czogW3sgZm9ybWF0OiB0aGlzLmNhbnZhc0Zvcm1hdCB9XSxcbiAgICAgIH0sXG4gICAgICBwcmltaXRpdmU6IHtcbiAgICAgICAgdG9wb2xvZ3k6IFwidHJpYW5nbGUtbGlzdFwiLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZVNwZWNpbWVuQmluZGluZ3MoZW50cmllczogR1BVQmluZEdyb3VwRW50cnlbXSwgZ2VvbWV0cnk6IEdQVUJ1ZmZlckJpbmRpbmcsIG91dHB1dDogR1BVVGV4dHVyZVZpZXcpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgIGxheW91dDogdGhpcy5zcGVjaW1lbkxheW91dCxcbiAgICAgIGVudHJpZXM6IFsuLi5lbnRyaWVzLCB7IGJpbmRpbmc6IDEzLCByZXNvdXJjZTogZ2VvbWV0cnkgfSwgeyBiaW5kaW5nOiAxNiwgcmVzb3VyY2U6IG91dHB1dCB9XSxcbiAgICB9KTtcbiAgfVxuICBlbmNvZGVTcGVjaW1lbihlbmNvZGVyOiBHUFVDb21tYW5kRW5jb2RlciwgZ3JvdXA6IEdQVUJpbmRHcm91cCkge1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHRoaXMuc3BlY2ltZW5QaXBlbGluZSk7XG4gICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgZ3JvdXApO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLnRoaXMuVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3MuZW5kKCk7XG4gIH1cblxuICBwdWJsaWMgcmVuZGVyKGNhbnZhc0NvbnRleHQ6IEdQVUNhbnZhc0NvbnRleHQsIHF1ZXJ5U2V0PzogR1BVUXVlcnlTZXQsIHJlc29sdmVCdWZmZXI/OiBHUFVCdWZmZXIsIHJlc3VsdEJ1ZmZlcj86IEdQVUJ1ZmZlcikge1xuICAgIGlmICh0aGlzLnZpZXcubW9kZSAmJiB0aGlzLnZpZXcuYXV0b0ZpdCkgdGhpcy52aWV3Lnpvb20gKz0gMC4xOCAqICh0aGlzLmZpdHRlZFpvb20oKSAtIHRoaXMudmlldy56b29tKTtcbiAgICBpZiAodGhpcy52aWV3Lm1vZGUgJiYgdGhpcy52aWV3LmZvbGxvdykge1xuICAgICAgdGhpcy5jYW1lcmEueCArPSAwLjE4ICogKHRoaXMuY2FtZXJhVGFyZ2V0LnggLSB0aGlzLmNhbWVyYS54KTtcbiAgICAgIHRoaXMuY2FtZXJhLnkgKz0gMC4xOCAqICh0aGlzLmNhbWVyYVRhcmdldC55IC0gdGhpcy5jYW1lcmEueSk7XG4gICAgfVxuICAgIGNvbnN0IHZpZXdEYXRhID0gbmV3IEFycmF5QnVmZmVyKDQ4KSxcbiAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KHZpZXdEYXRhKSxcbiAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkodmlld0RhdGEpO1xuICAgIGYuc2V0KFt0aGlzLmNhbWVyYS54LCB0aGlzLmNhbWVyYS55LCB0aGlzLnZpZXcuem9vbV0pO1xuICAgIHVbM10gPSB0aGlzLnZpZXcubW9kZTtcbiAgICBmLnNldChbdGhpcy52aWV3LmZvY3VzLCB0aGlzLnZpZXcuY29udHJhc3QsIHRoaXMudmlldy5jaHJvbWEsIHRoaXMudmlldy5ncmFpbl0sIDQpO1xuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY3JlZW5TY2FsZSgpO1xuICAgIGYuc2V0KFtzY2FsZS54LCBzY2FsZS55XSwgOCk7XG4gICAgdGhpcy5kZXZpY2UucXVldWUud3JpdGVCdWZmZXIodGhpcy52aWV3QnVmZmVyLCAwLCB2aWV3RGF0YSk7XG4gICAgY29uc3QgY29tbWFuZEVuY29kZXIgPSB0aGlzLmRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuXG4gICAgaWYgKHRoaXMudmlldy5tb2RlICYmIHRoaXMucHJlcGFyZXNTcGVjaW1lbikge1xuICAgICAgY29uc3Qgc3BlY2ltZW5QYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgICAgc3BlY2ltZW5QYXNzLnNldFBpcGVsaW5lKHRoaXMuc3BlY2ltZW5QaXBlbGluZSk7XG4gICAgICBzcGVjaW1lblBhc3Muc2V0QmluZEdyb3VwKDAsIHRoaXMuc3BlY2ltZW5CaW5kR3JvdXApO1xuICAgICAgc3BlY2ltZW5QYXNzLmRpc3BhdGNoV29ya2dyb3VwcyguLi50aGlzLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UKTtcbiAgICAgIHNwZWNpbWVuUGFzcy5lbmQoKTtcbiAgICB9XG5cbiAgICAvLyAxLiBNYWluIGNvbXB1dGUgcmVuZGVyIHBhc3NcbiAgICBjb25zdCBwYXNzQ29tcHV0ZSA9IGNvbW1hbmRFbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICBwYXNzQ29tcHV0ZS5zZXRQaXBlbGluZSh0aGlzLmNvbXB1dGVSZW5kZXJQaXBlbGluZSk7XG4gICAgcGFzc0NvbXB1dGUuc2V0QmluZEdyb3VwKDAsIHRoaXMuYmluZEdyb3VwUG9zdFByb2Nlc3MpO1xuICAgIHBhc3NDb21wdXRlLmRpc3BhdGNoV29ya2dyb3VwcyguLi50aGlzLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzQ29tcHV0ZS5lbmQoKTtcblxuICAgIC8vIDIuIE1haW4gcmVuZGVyIHBhc3NcbiAgICBjb25zdCByZW5kZXJQYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5SZW5kZXJQYXNzKHtcbiAgICAgIGNvbG9yQXR0YWNobWVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHZpZXc6IGNhbnZhc0NvbnRleHQuZ2V0Q3VycmVudFRleHR1cmUoKS5jcmVhdGVWaWV3KCksXG4gICAgICAgICAgbG9hZE9wOiBcImNsZWFyXCIsXG4gICAgICAgICAgY2xlYXJWYWx1ZTogeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAxIH0sXG4gICAgICAgICAgc3RvcmVPcDogXCJzdG9yZVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICByZW5kZXJQYXNzLnNldFBpcGVsaW5lKHRoaXMucmVuZGVyUGlwZWxpbmUpO1xuICAgIHJlbmRlclBhc3Muc2V0QmluZEdyb3VwKDEsIHRoaXMucmVuZGVyQmluZEdyb3VwKTtcbiAgICByZW5kZXJQYXNzLmRyYXcoNiwgMSwgMCwgMCk7XG4gICAgcmVuZGVyUGFzcy5lbmQoKTtcblxuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLnN1Ym1pdChbY29tbWFuZEVuY29kZXIuZmluaXNoKCldKTtcbiAgfVxufVxuIiwiLy8gQWN0dWFsIEdQVSBjaGVja3MgZm9yIHNlbGVjdGl2ZSByZW5ld2FsLCBnZW51aW5lIHRldGhlciBkd2VsbCwgYW5kIGEgcG9sYXJpdHlcbi8vIGRpcmVjdGlvbiB0aGF0IHN1cnZpdmVzIHRyYW5zbGF0aW9uLiBGcmVzaCBmaXh0dXJlIHBhZ2VzIG9ubHkuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGVzdFJlbmV3YWwoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXI7IGxpbmtzOiBHUFVCdWZmZXI7IHNuYXBzaG90OiBHUFVCdWZmZXIgfSxcbiAgY291bnRzOiB7IGFjdGluOiBudW1iZXI7IG1lbWJyYW5lOiBudW1iZXIgfSxcbiAgY29uZmlndXJlOiAodmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB2b2lkLFxuICBkaXNwYXRjaDogKGtpbmQ6IFwicG9sYXJpdHlcIiB8IFwidHVybm92ZXJcIiB8IFwidGV0aGVyXCIgfCBcIm1vdG9yXCIsIHJlcGVhdHM/OiBudW1iZXIpID0+IHZvaWRcbikge1xuICBjb25zdCBjaGVja3M6IHsgbmFtZTogc3RyaW5nOyBwYXNzZWQ6IGJvb2xlYW4gfVtdID0gW107XG4gIGNvbnN0IGFzc2VydCA9IChuYW1lOiBzdHJpbmcsIHBhc3NlZDogYm9vbGVhbikgPT4ge1xuICAgIGNoZWNrcy5wdXNoKHsgbmFtZSwgcGFzc2VkIH0pO1xuICAgIGlmICghcGFzc2VkKSB0aHJvdyBFcnJvcihgUmVuZXdhbCBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyLCBvZmZzZXQgPSAwLCBzaXplID0gYnVmZmVyLnNpemUpID0+IHtcbiAgICBjb25zdCBzdGFnZSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICBjb25zdCBlID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZS5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCBvZmZzZXQsIHN0YWdlLCAwLCBzaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgc3RhZ2UubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCBkYXRhID0gc3RhZ2UuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICBzdGFnZS51bm1hcCgpO1xuICAgIHN0YWdlLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgZnVuY3Rpb24gbWVtYnJhbmUoc2hpZnQgPSAwLCBhdENvbnRhY3QgPSBmYWxzZSkge1xuICAgIGNvbnN0IGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5tZW1icmFuZS5zaXplKSxcbiAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkoZGF0YSksXG4gICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgICBjb25zdCBhbmdsZSA9ICgyICogTWF0aC5QSSAqIGkpIC8gY291bnRzLm1lbWJyYW5lO1xuICAgICAgdVtpICogMTBdID0gaTtcbiAgICAgIHVbaSAqIDEwICsgNl0gPSAoaSArIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBmW2kgKiAxMCArIDJdID0gNTAgKyBzaGlmdCArIDQ1ICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgZltpICogMTAgKyAzXSA9IDUwICsgNDUgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICBmW2kgKiAxMCArIDhdID0gaTtcbiAgICB9XG4gICAgaWYgKGF0Q29udGFjdCkge1xuICAgICAgZlsyXSA9IDEyO1xuICAgICAgZlszXSA9IDUwO1xuICAgIH1cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgZGF0YSk7XG4gIH1cbiAgZnVuY3Rpb24gZmlsYW1lbnRzKGFnZTogbnVtYmVyLCBwb3NpdGlvbnMgPSBbMTAsIDE0LCA4NSwgODldKSB7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmFjdGluLnNpemUpLFxuICAgICAgdSA9IG5ldyBVaW50MzJBcnJheShkYXRhKSxcbiAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHVbaSAqIDEwXSA9IHVbaSAqIDEwICsgNl0gPSB1W2kgKiAxMCArIDddID0gaTtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgoeCwgaSkgPT4ge1xuICAgICAgdVtpICogMTAgKyA2XSA9IGkgPCAyID8gMCA6IDI7XG4gICAgICB1W2kgKiAxMCArIDddID0gaSA8IDIgPyAxIDogMztcbiAgICAgIGZbaSAqIDEwICsgMl0gPSB4O1xuICAgICAgZltpICogMTAgKyAzXSA9IDUwO1xuICAgICAgZltpICogMTAgKyA0XSA9IDE7XG4gICAgICBmW2kgKiAxMCArIDldID0gYWdlO1xuICAgIH0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBkYXRhKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICBtZW1icmFuZSgpO1xuICBmaWxhbWVudHMoMTAwMCk7XG4gIGNvbmZpZ3VyZSh7IHBvbGFyaXR5TW9kZTogMCwgY3VlRW5hYmxlZDogMCB9KTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgY29uZmlndXJlKHtcbiAgICBwb2xhcml0eU1vZGU6IDEsXG4gICAgY3VlRW5hYmxlZDogMSxcbiAgICBjdWVYOiAxMDAsXG4gICAgY3VlWTogNTAsXG4gICAgcG9sYXJpdHlUdXJuUmF0ZTogMC4wMixcbiAgICByZWFyVHVybm92ZXI6IDEsXG4gICAgdHVybm92ZXJBZ2U6IDEwLFxuICAgIGRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eTogMCxcbiAgICBkZWJyYW5jaFByb2JhYmlsaXR5OiAwLFxuICB9KTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgZGlzcGF0Y2goXCJ0dXJub3ZlclwiKTtcbiAgbGV0IHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcImFnZWQgcmVhciBmaWxhbWVudCByZXR1cm5zIHRvIEctYWN0aW5cIiwgdVs2XSA9PT0gMCAmJiB1WzddID09PSAwICYmIHVbMTZdID09PSAxICYmIHVbMTddID09PSAxKTtcbiAgYXNzZXJ0KFwic2FtZS1hZ2VkIGZyb250IGZpbGFtZW50IGlzIHByb3RlY3RlZFwiLCB1WzI3XSA9PT0gMyAmJiB1WzM2XSA9PT0gMik7XG4gIGNvbnN0IGJyYW5jaCA9IGZpbGFtZW50cygwKSxcbiAgICBidSA9IG5ldyBVaW50MzJBcnJheShicmFuY2gpLFxuICAgIGJmID0gbmV3IEZsb2F0MzJBcnJheShicmFuY2gpO1xuICBidVsyNl0gPSAwO1xuICBidVsyN10gPSAyO1xuICBiZlsyMl0gPSAxMjtcbiAgYmZbMjNdID0gNTI7XG4gIGJmWzI5XSA9IDEwMDA7XG4gIGJ1WzM2XSA9IDM7XG4gIGJ1WzM3XSA9IDM7XG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBicmFuY2gpO1xuICBkaXNwYXRjaChcInR1cm5vdmVyXCIpO1xuICB1ID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICBhc3NlcnQoXCJvbGQgb25lLWJlYWQgYnJhbmNoIHJldHVybnMgdG8gdGhlIHNvbHVibGUgcG9vbFwiLCB1WzI2XSA9PT0gMiAmJiB1WzI3XSA9PT0gMik7XG4gIGFzc2VydChcImJyYW5jaCByZW1vdmFsIGRvZXMgbm90IGN1dCB0aGUgbW90aGVyIGZpbGFtZW50XCIsIHVbN10gPT09IDEgJiYgdVsxNl0gPT09IDApO1xuICBmaWxhbWVudHMoMCk7XG4gIGRpc3BhdGNoKFwidHVybm92ZXJcIik7XG4gIHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcInlvdW5nIHJlYXIgbmV0d29yayBpcyBub3QgcHJlbWF0dXJlbHkgY2xlYXJlZFwiLCB1WzddID09PSAxICYmIHVbMTZdID09PSAwKTtcbiAgY29uc3QgYmVmb3JlID0gbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuc25hcHNob3QsIDMyICogKGNvdW50cy5hY3RpbiArIGNvdW50cy5tZW1icmFuZSArIDEpLCAzMikpO1xuICBtZW1icmFuZSgxMDApO1xuICBkaXNwYXRjaChcInBvbGFyaXR5XCIpO1xuICBjb25zdCBhZnRlciA9IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLnNuYXBzaG90LCAzMiAqIChjb3VudHMuYWN0aW4gKyBjb3VudHMubWVtYnJhbmUgKyAxKSwgMzIpKTtcbiAgYXNzZXJ0KFwicG9sYXJpdHkgdmVjdG9yIHBlcnNpc3RzIHVuZGVyIGNlbGwgdHJhbnNsYXRpb25cIiwgTWF0aC5hYnMoYmVmb3JlWzJdIC0gYWZ0ZXJbMl0pIDwgMWUtNiAmJiBNYXRoLmFicyhiZWZvcmVbM10gLSBhZnRlclszXSkgPCAxZS02ICYmIGFmdGVyWzJdID4gMC45OSk7XG4gIG1lbWJyYW5lKCk7XG4gIGRpc3BhdGNoKFwicG9sYXJpdHlcIik7XG4gIGNvbmZpZ3VyZSh7IG1vdG9yUmVhckJpYXM6IDEsIG15b3NpblN0cmVuZ3RoOiAwLjA1LCBteW9zaW5TcGVlZDogMC4wMiB9KTtcbiAgZm9yIChjb25zdCBbcG9zaXRpb25zLCBuYW1lLCBhY3RpdmVdIG9mIFtcbiAgICBbWzEwLCAxNCwgMjAsIDE2XSwgXCJtYXR1cmUgcmVhciBtb3RvciBwcm9kdWNlcyBjb250cmFjdGlvblwiLCB0cnVlXSxcbiAgICBbWzgwLCA4NCwgOTAsIDg2XSwgXCJtYXR1cmUgZnJvbnQgbW90b3Igc3RheXMgaW5hY3RpdmVcIiwgZmFsc2VdLFxuICBdIGFzIGNvbnN0KSB7XG4gICAgZmlsYW1lbnRzKDEwMDAsIFsuLi5wb3NpdGlvbnNdKTtcbiAgICBjb25zdCBsaW5rID0gbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgY291bnRzLm1lbWJyYW5lKSk7XG4gICAgbGluay5zZXQoWzEsIDMsIDAsIDEsIDEsIDAsIDMsIDJdKTtcbiAgICBuZXcgRmxvYXQzMkFycmF5KGxpbmsuYnVmZmVyKVsyXSA9IDU7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmspO1xuICAgIGRpc3BhdGNoKFwibW90b3JcIik7XG4gICAgY29uc3QgbW92ZWQgPSBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICAgIGFzc2VydChuYW1lLCBhY3RpdmUgPyBtb3ZlZFsyXSA+IHBvc2l0aW9uc1swXSAmJiBtb3ZlZFsyMl0gPCBwb3NpdGlvbnNbMl0gOiBtb3ZlZFsyXSA9PT0gcG9zaXRpb25zWzBdICYmIG1vdmVkWzIyXSA9PT0gcG9zaXRpb25zWzJdKTtcbiAgfVxuICBtZW1icmFuZSgwLCB0cnVlKTtcbiAgZmlsYW1lbnRzKDEwMDApO1xuICBjb25zdCBsaW5rID0gbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgY291bnRzLm1lbWJyYW5lKSk7XG4gIGxpbmsuc2V0KFsxLCAwLCAwLCA2MDAsIDEsIDAsIDAsIDBdLCAyNTYgKiA4KTtcbiAgbmV3IEZsb2F0MzJBcnJheShsaW5rLmJ1ZmZlcilbMjU2ICogOCArIDJdID0gMjtcbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmspO1xuICBjb25maWd1cmUoeyBtZW1icmFuZUNvdXBsaW5nOiAwLjA1LCB0ZXRoZXJUdXJub3ZlcjogMSwgdGV0aGVyT25SYXRlOiAxLCB0ZXRoZXJPZmZSYXRlOiAwLCB0ZXRoZXJMb2FkT2ZmOiAwLCB0ZXRoZXJSZWNvdmVyeVN0ZXBzOiA0MCB9KTtcbiAgZGlzcGF0Y2goXCJ0ZXRoZXJcIik7XG4gIGxldCBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwiZXhwaXJlZCB0ZXRoZXIgZW50ZXJzIGFuIHVuYm91bmQgZHdlbGxcIiwgbGlua3NbMjU2ICogOF0gPT09IDAgJiYgbGlua3NbMjU2ICogOCArIDNdID09PSA0MCk7XG4gIGRpc3BhdGNoKFwidGV0aGVyXCIpO1xuICBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwidGV0aGVyIGRvZXMgbm90IHJlYmluZCBvbiB0aGUgbmV4dCBzdGVwXCIsIGxpbmtzWzI1NiAqIDhdID09PSAwICYmIGxpbmtzWzI1NiAqIDggKyAzXSA9PT0gMzkpO1xuICBkaXNwYXRjaChcInRldGhlclwiLCA0MCk7XG4gIGxpbmtzID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5saW5rcykpO1xuICBhc3NlcnQoXCJ0ZXRoZXIgY2FuIHJlYmluZCBhZnRlciBpdHMgZHdlbGxcIiwgbGlua3NbMjU2ICogOF0gPiAwKTtcbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzKGRldmljZTogR1BVRGV2aWNlLCBtb2R1bGU6IEdQVVNoYWRlck1vZHVsZSwgbGF5b3V0OiBHUFVQaXBlbGluZUxheW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc29sdmVDdWU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc29sdmVfZnJvbnRfY3VlXCIgfSB9KSxcbiAgICBkcmF3Q3VlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJkcmF3X3Jlc29sdmVkX2N1ZVwiIH0gfSksXG4gICAgbWVhc3VyZUVuY2xvc3VyZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibWVhc3VyZV9lbmNsb3N1cmVcIiB9IH0pLFxuICAgIGJ1aWxkRW5jbG9zdXJlUm93czogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYnVpbGRfZW5jbG9zdXJlX3Jvd3NcIiB9IH0pLFxuICAgIGRyYXdSZXNlcnZvaXI6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfcmVzZXJ2b2lyX2NvbXBhcnRtZW50XCIgfSB9KSxcbiAgICBwcm9qZWN0RW5jbG9zdXJlQXJlYTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicHJvamVjdF9lbmNsb3N1cmVfYXJlYVwiIH0gfSksXG4gICAgY29udGFpbkZpbGFtZW50UG9pbnRzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJjb250YWluX2ZpbGFtZW50X3BvaW50c1wiIH0gfSksXG4gICAgY29udGFpbkZpbGFtZW50Qm9uZHM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNvbnRhaW5fZmlsYW1lbnRfYm9uZHNcIiB9IH0pLFxuICAgIHNuYXBzaG90TWVjaGFuaWNzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJzbmFwc2hvdF9tZWNoYW5pY3NcIiB9IH0pLFxuICAgIG1vdG9yTGlua3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1vdG9yX2xpbmtzXCIgfSB9KSxcbiAgICBtZW1icmFuZVRldGhlcnM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RldGhlcnNcIiB9IH0pLFxuICAgIGFwcGx5TWVjaGFuaWNhbEZvcmNlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYXBwbHlfbWVjaGFuaWNhbF9mb3JjZXNcIiB9IH0pLFxuICAgIGRyYXdNZWNoYW5pY2FsTGlua3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfbWVjaGFuaWNhbF9saW5rc1wiIH0gfSksXG4gICAgbGluZUNvbnN0cmFpbnQ6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImxpbmVfY29uc3RyYWludF91cGRhdGVzXCIgfSB9KSxcbiAgICBtZW1icmFuZVRhbmdlbnRpYWxGbG93OiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtZW1icmFuZV90YW5nZW50aWFsX2Zsb3dcIiB9IH0pLFxuICAgIG9yaWVudGF0aW9uVXBkYXRlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJvcmllbnRhdGlvbl91cGRhdGVzXCIgfSB9KSxcbiAgICBjb3NzZXJhdFVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiY29zc2VyYXRfdXBkYXRlc1wiIH0gfSksXG4gICAgcmVzZXRBY3RpbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicmVzZXRfYWN0aW5cIiB9IH0pLFxuICAgIHJlc2V0TWVtYnJhbmU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc2V0X21lbWJyYW5lXCIgfSB9KSxcbiAgICBzdGVyaWNGb3JjZVVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwic3RlcmljX2ZvcmNlX3VwZGF0ZXNcIiB9IH0pLFxuICAgIGFjdGluQmluZDogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYmluZF9hY3Rpbl9tb25vbWVyXCIgfSB9KSxcbiAgICBhY3RpblBvbHltZXJQb3NpdGlvbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidXBkYXRlX2FjdGluX3BvbHltZXJfcG9zaXRpb25cIiB9IH0pLFxuICAgIGFjdGluTW9ub21lclBvc2l0aW9uOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfYWN0aW5fbW9ub21lcl9wb3NpdGlvblwiIH0gfSksXG4gICAgdW5iaW5kTWluUG9sZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidW5iaW5kX21pbl9wb2xlXCIgfSB9KSxcbiAgICBtZW1icmFuZVRvVGV4dHVyZXM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RvX3RleHR1cmVzXCIgfSB9KSxcbiAgICBhY3RpbmVzVG9UZXh0dXJlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYWN0aW5lc190b190ZXh0dXJlc1wiIH0gfSksXG4gICAgY2xlYXJSZW5kZXJMYXllcnM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNsZWFyX3JlbmRlcl9sYXllcnNcIiB9IH0pLFxuICAgIHVwZGF0ZVRleHR1cmVzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfdGV4dHVyZXNcIiB9IH0pLFxuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaChwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIsIHBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmUsIHg6IG51bWJlciwgeSA9IDEpIHtcbiAgcGFzcy5zZXRQaXBlbGluZShwaXBlbGluZSk7XG4gIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKHgsIHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuU2ltdWxhdGlvblN0ZXAoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgd29ya2dyb3VwQ291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgdGV4dHVyZVdvcmtncm91cENvdW50OiBbbnVtYmVyLCBudW1iZXJdLFxuICBsaW5lQ29uc3RyYWludEZ1bmN0aW9uOiAocGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyKSA9PiB2b2lkLFxuICBmcmFtZU5yOiBudW1iZXIsXG4gIGlzTGFzdFN0ZXBPZkZyYW1lOiBib29sZWFuLFxuICBlbmNsb3N1cmUgPSBmYWxzZSxcbiAgcGVyc2lzdGVudFBvbGFyaXR5ID0gZmFsc2UsXG4gIHF1ZXJ5SW5mbz86IHsgcXVlcnlTZXQ6IEdQVVF1ZXJ5U2V0OyBpc0ZpcnN0U3RlcDogYm9vbGVhbiB9LFxuICBleHRlbnNpb25zPzogeyBncm93dGg6IEdQVUNvbXB1dGVQaXBlbGluZTsgZm9yY2VzOiBHUFVDb21wdXRlUGlwZWxpbmUgfVxuKSB7XG4gIC8vIE9uZSBzdWJtaXNzaW9uIHBlciBmaXhlZCBzdGVwLiBEaXNwYXRjaCBvcmRlciBhbmQgaXRlcmF0aW9uIGNvdW50cyBhcmVcbiAgLy8gdW5jaGFuZ2VkOyBkaXNwYXRjaCBib3VuZGFyaWVzIHJldGFpbiBzdG9yYWdlIGRlcGVuZGVuY2llcy4gVW5pZm9ybSB3cml0ZXNcbiAgLy8gcmVtYWluIEJFRk9SRSBlYWNoIHN0ZXAgc3VibWlzc2lvbiwgc28gc3Byb3V0cyBhcmUgbm90IG92ZXJ3cml0dGVuIGJ5IHRoZVxuICAvLyBsYXN0IHN0ZXAncyB2YWx1ZXMgd2hlbiBzZXZlcmFsIGZpeGVkIHN0ZXBzIHNoYXJlIGFuIGFuaW1hdGlvbiBmcmFtZS5cbiAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKHtcbiAgICAuLi4ocXVlcnlJbmZvPy5pc0ZpcnN0U3RlcCAmJiB7XG4gICAgICB0aW1lc3RhbXBXcml0ZXM6IHtcbiAgICAgICAgcXVlcnlTZXQ6IHF1ZXJ5SW5mby5xdWVyeVNldCxcbiAgICAgICAgYmVnaW5uaW5nT2ZQYXNzV3JpdGVJbmRleDogMCxcbiAgICAgICAgZW5kT2ZQYXNzV3JpdGVJbmRleDogMSxcbiAgICAgIH0sXG4gICAgfSksXG4gIH0pO1xuICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuXG4gIGlmIChwZXJzaXN0ZW50UG9sYXJpdHkpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZWFzdXJlRW5jbG9zdXJlLCAxKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnJlc29sdmVDdWUsIDEpO1xuXG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSkge1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jbGVhclJlbmRlckxheWVycywgLi4udGV4dHVyZVdvcmtncm91cENvdW50KTtcbiAgfVxuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc3RlcmljRm9yY2VVcGRhdGUsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGxpbmVDb25zdHJhaW50RnVuY3Rpb24ocGFzcyk7XG4gIGlmIChlbmNsb3N1cmUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbCgodGV4dHVyZVdvcmtncm91cENvdW50WzFdICogMTYpIC8gKDQgKiAyNTYpKSk7XG4gIGlmIChleHRlbnNpb25zKSBkaXNwYXRjaChwYXNzLCBleHRlbnNpb25zLmdyb3d0aCwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpbkJpbmQsIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpblBvbHltZXJQb3NpdGlvbiwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFjdGluTW9ub21lclBvc2l0aW9uLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMudW5iaW5kTWluUG9sZSwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgaWYgKGVuY2xvc3VyZSkgZW5jb2RlRW5jbG9zdXJlKHBhc3MsIHBpcGVsaW5lcywgd29ya2dyb3VwQ291bnRzLCB0ZXh0dXJlV29ya2dyb3VwQ291bnRbMV0gKiAxNik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZW1icmFuZVRvVGV4dHVyZXMsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpbmVzVG9UZXh0dXJlcywgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnVwZGF0ZVRleHR1cmVzLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICBjb25zdCBtZWNoYW5pY2FsQ291bnQgPSB3b3JrZ3JvdXBDb3VudHMuQUNUSU4gKyB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkU7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgbWVjaGFuaWNhbENvdW50KTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1vdG9yTGlua3MsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVtYnJhbmVUZXRoZXJzLCB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkUpO1xuICBpZiAoZXh0ZW5zaW9ucykgZGlzcGF0Y2gocGFzcywgZXh0ZW5zaW9ucy5mb3JjZXMsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYXBwbHlNZWNoYW5pY2FsRm9yY2VzLCBtZWNoYW5pY2FsQ291bnQpO1xuICBpZiAoZW5jbG9zdXJlKSBlbmNvZGVFbmNsb3N1cmUocGFzcywgcGlwZWxpbmVzLCB3b3JrZ3JvdXBDb3VudHMsIHRleHR1cmVXb3JrZ3JvdXBDb3VudFsxXSAqIDE2KTtcbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lKSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuZHJhd01lY2hhbmljYWxMaW5rcywgMSArIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSAmJiBlbmNsb3N1cmUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3UmVzZXJ2b2lyLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICBpZiAoaXNMYXN0U3RlcE9mRnJhbWUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3Q3VlLCAxKTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuRW5jbG9zdXJlKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgYmluZEdyb3VwOiBHUFVCaW5kR3JvdXAsXG4gIGNvdW50czogeyBBQ1RJTjogbnVtYmVyOyBNRU1CUkFORTogbnVtYmVyIH0sXG4gIGhlaWdodDogbnVtYmVyXG4pIHtcbiAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG4gIGVuY29kZUVuY2xvc3VyZShwYXNzLCBwaXBlbGluZXMsIGNvdW50cywgaGVpZ2h0KTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG4vLyBGcm96ZW4tdGltZSBjb3JyZWN0aW9uOiBubyByZWFjdGlvbnMsIGFnZXMsIG1vdG9ycywgbWVtYnJhbmUgbW90aW9uIG9yIGFyZWFcbi8vIHByb2plY3Rpb24uIFRoZSBjYWxsZXIgdmVyaWZpZXMgdGhlIGZ1bGwgc3RhdGUgYWZ0ZXIgZWFjaCBib3VuZGVkIGJhdGNoLlxuZXhwb3J0IGZ1bmN0aW9uIHJ1bkNvbnRhY3RSZXBhaXIoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXIsXG4gIGl0ZXJhdGlvbnM6IG51bWJlclxuKSB7XG4gIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKSxcbiAgICBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbChoZWlnaHQgLyAoNCAqIDI1NikpKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50UG9pbnRzLCBjb3VudHMuQUNUSU4pO1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgY291bnRzLkFDVElOICsgY291bnRzLk1FTUJSQU5FKTtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50Qm9uZHMsIGNvdW50cy5BQ1RJTik7XG4gIH1cbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG5mdW5jdGlvbiBlbmNvZGVFbmNsb3N1cmUoXG4gIHBhc3M6IEdQVUNvbXB1dGVQYXNzRW5jb2RlcixcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXJcbikge1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5wcm9qZWN0RW5jbG9zdXJlQXJlYSwgY291bnRzLk1FTUJSQU5FKTtcbiAgLy8gUmVmcmVzaCB0aGUgbWVhc3VyZWQgYXJlYSBhZnRlciBwcm9qZWN0aW9uIGZvciB0aGUgbmV4dCByZWFjdGlvbiBzdGVwLlxuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbChoZWlnaHQgLyAoNCAqIDI1NikpKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgMjsgaXRlcmF0aW9uKyspIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIGNvdW50cy5BQ1RJTiArIGNvdW50cy5NRU1CUkFORSk7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudEJvbmRzLCBjb3VudHMuQUNUSU4pO1xuICB9XG59XG4iLCIvLyBTY2hlZHVsZXMgc2hvcnQtbGl2ZWQgcG9seW1lcml6YXRpb24gc2l0ZXMgb24gdGhlIG1lbWJyYW5lLCBzbyBsb2NhbCBwcm90cnVzaW9ucyBzcHJvdXQgYW5kIHJldHJhY3QuXG4vLyBFYWNoIHNsb3QgYWx0ZXJuYXRlcyBiZXR3ZWVuIG9uIChhIHNpdGUgYXQgYSBmaXhlZCBtZW1icmFuZSBwb3NpdGlvbikgYW5kIG9mZiwgd2l0aCByYW5kb20gZHVyYXRpb25zLFxuLy8gc28gdGhlIG51bWJlciBvZiBhY3RpdmUgc2l0ZXMgZmx1Y3R1YXRlcy4gT2Zmc2V0cyBsYW5kIGluIHRoZSBmcm9udCAzMCU7IHRoZVxuLy8gR1BVIG1hcHMgdGhlbSBpbnRvIHRoZSBzZWxlY3RlZCBwb2xhcml0eSBmcmFtZSB3aXRob3V0IGV4dHJhIFJORyBkcmF3cy5cblxuZXhwb3J0IGNvbnN0IE1BWF9TUFJPVVRfU0lURVMgPSA4O1xuLy8gaGFsZiBvZiB0aGUgZnJvbnQgcmVnaW9uIHdoZXJlIHNpdGVzIGNhbiBsYW5kLCBpbiBub3JtYWxpemVkIGFyYyBsZW5ndGggKDAuMTUgPSBmcm9udCAzMCUgb2YgdGhlIG1lbWJyYW5lKVxuY29uc3QgRlJPTlRfSEFMRl9XSURUSCA9IDAuMTU7XG5cbnR5cGUgU2xvdCA9IHsgY2VudGVyOiBudW1iZXI7IG9uVW50aWw6IG51bWJlcjsgb2ZmVW50aWw6IG51bWJlciB9O1xuXG5leHBvcnQgY2xhc3MgU3Byb3V0U2NoZWR1bGVyIHtcbiAgcHJpdmF0ZSBzbG90czogU2xvdFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhZ2dlclN0ZXBzOiBudW1iZXIsXG4gICAgcHJpdmF0ZSByYW5kb20gPSBNYXRoLnJhbmRvbVxuICApIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1BWF9TUFJPVVRfU0lURVM7IGkrKykge1xuICAgICAgLy8gc3RhZ2dlciB0aGUgZmlyc3Qgc3dpdGNoLW9uIG92ZXIgYSB3aG9sZSBvbi9vZmYgY3ljbGUgc28gdGhlIHNpdGVzIGRvbid0IGFsbCBzdGFydCB0b2dldGhlclxuICAgICAgdGhpcy5zbG90cy5wdXNoKHsgY2VudGVyOiAwLCBvblVudGlsOiAwLCBvZmZVbnRpbDogdGhpcy5yYW5kb20oKSAqIHN0YWdnZXJTdGVwcyB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBXcml0ZXMgW2NlbnRlciAobm9ybWFsaXplZCBhcmMgbGVuZ3RoKSwgaGFsZldpZHRoIChub2RlcyksIHN0cmVuZ3RoLCAwXSBwZXIgc2xvdCBpbnRvIGBvdXRgLlxuICB1cGRhdGUoXG4gICAgc3RlcDogbnVtYmVyLFxuICAgIHBhcmFtczogeyBzcHJvdXRDb3VudDogbnVtYmVyOyBzcHJvdXRXaWR0aDogbnVtYmVyOyBzcHJvdXRGcm9udEJpYXM6IG51bWJlcjsgc3Byb3V0T25TdGVwczogbnVtYmVyOyBzcHJvdXRPZmZTdGVwczogbnVtYmVyIH0sXG4gICAgb3V0OiBGbG9hdDMyQXJyYXlcbiAgKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNQVhfU1BST1VUX1NJVEVTOyBpKyspIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLnNsb3RzW2ldO1xuICAgICAgaWYgKHN0ZXAgPj0gc2xvdC5vZmZVbnRpbCAmJiBzdGVwID49IHNsb3Qub25VbnRpbCkge1xuICAgICAgICBzbG90LmNlbnRlciA9IHNhbXBsZUNlbnRlcihwYXJhbXMuc3Byb3V0RnJvbnRCaWFzLCB0aGlzLnJhbmRvbSk7XG4gICAgICAgIHNsb3Qub25VbnRpbCA9IHN0ZXAgKyBwYXJhbXMuc3Byb3V0T25TdGVwcyAqICgwLjUgKyB0aGlzLnJhbmRvbSgpKTtcbiAgICAgICAgc2xvdC5vZmZVbnRpbCA9IHNsb3Qub25VbnRpbCArIHBhcmFtcy5zcHJvdXRPZmZTdGVwcyAqICgwLjUgKyB0aGlzLnJhbmRvbSgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFjdGl2ZSA9IGkgPCBwYXJhbXMuc3Byb3V0Q291bnQgJiYgc3RlcCA8IHNsb3Qub25VbnRpbDtcbiAgICAgIG91dC5zZXQoW3Nsb3QuY2VudGVyLCBwYXJhbXMuc3Byb3V0V2lkdGggKiAwLjUsIGFjdGl2ZSA/IDEgOiAwLCAwXSwgaSAqIDQpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBOZWFyIHRoZSBmcm9udCAoYXJjIGxlbmd0aCAwKSB3aXRoIHByb2JhYmlsaXR5IGBmcm9udEJpYXNgLCBhbnl3aGVyZSBpbiB0aGUgZnJvbnQgcmVnaW9uIG90aGVyd2lzZS5cbmZ1bmN0aW9uIHNhbXBsZUNlbnRlcihmcm9udEJpYXM6IG51bWJlciwgcmFuZG9tOiAoKSA9PiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgb2Zmc2V0ID0gKHJhbmRvbSgpIC0gMC41KSAqIDIgKiBGUk9OVF9IQUxGX1dJRFRIO1xuICBpZiAocmFuZG9tKCkgPCBmcm9udEJpYXMpIHtcbiAgICBjb25zdCBnYXVzc2lhbiA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKDEgLSByYW5kb20oKSkpICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiByYW5kb20oKSk7XG4gICAgb2Zmc2V0ID0gTWF0aC5tYXgoLUZST05UX0hBTEZfV0lEVEgsIE1hdGgubWluKEZST05UX0hBTEZfV0lEVEgsIGdhdXNzaWFuICogMC4wOCkpO1xuICB9XG4gIHJldHVybiAob2Zmc2V0ICsgMSkgJSAxO1xufVxuIiwiLy8gUHVyZSBmdWxsLXNuYXBzaG90IGRpYWdub3N0aWNzLiBSdW5zIGluIHRoZSBib3VuZGVkIHdvcmtlciwgd2l0aCBubyBET00gb3Jcbi8vIEdQVSBhY2Nlc3MuIEdlb21ldHJ5IGNoZWNrcywgdG9wb2xvZ3kgd2Fsa3MgYW5kIGNvdW50ZXIgc2VtYW50aWNzIGFyZSBzaGFyZWRcbi8vIGJ5IGxpdmUgZGlhZ25vc3RpY3MgYW5kIGV2ZXJ5IGZvcmNlZCBzY2llbnRpZmljLWFzc2F5IGNoZWNrcG9pbnQuXG5pbXBvcnQgeyBwb2x5Z29uT2NjdXBhbmN5LCBwb2x5Z29uQm9uZENyb3NzaW5nIH0gZnJvbSBcIi4vb2NjdXBhbmN5XCI7XG5cbmNvbnN0IFNFR01FTlRfV09SRFMgPSAxMDsgLy8gaWQsIHN1YnR5cGUsIHBvc2l0aW9uKDIpLCBvcmllbnRhdGlvbigyKSwgdGFpbCwgaGVhZCwgYXJjX2xlbmd0aCwgYWdlXG5jb25zdCBUQUlMID0gNjtcbmNvbnN0IEhFQUQgPSA3O1xuXG4vLyBtdXN0IG1hdGNoIHRoZSBURUxFTUVUUllfKiBpbmRpY2VzIGluIHNpbXVsYXRlLndnc2xcbmV4cG9ydCBjb25zdCBURUxFTUVUUllfQ09VTlRFUlMgPSBbXG4gIFwiY2FuZGlkYXRlc1wiLCAvLyBmcmVlIG1vbm9tZXJzIGluIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZFxuICBcIm5laWdoYm9yRm91bmRcIiwgLy8gLi4uIHRoYXQgc2F3IGFuIGF2YWlsYWJsZSBoZWFkIG9yIG1vbm9tZXIgbmVhcmJ5XG4gIFwicGFzc2VkUHJvYlwiLCAvLyAuLi4gYW5kIHBhc3NlZCB0aGUgYmluZCBwcm9iYWJpbGl0eVxuICBcImJvdW5kXCIsIC8vIC4uLiBhbmQgd29uIGJvdGggbG9ja3NcbiAgXCJ1bmJvdW5kXCIsIC8vIG1pbnVzLWVuZCBkZXBvbHltZXJpemF0aW9uc1xuICBcImVsb25nYXRlZFwiLCAvLyBiaW5kcyBvbnRvIGFuIGV4aXN0aW5nIGZpbGFtZW50J3MgcGx1cyBlbmQgKGJvdW5kIG1pbnVzIGVsb25nYXRlZCA9IG5ldyBkaW1lcnMpXG4gIFwiaGVhZHNJbkZpZWxkXCIsIC8vIHBsdXMgZW5kcyBpbiB0aGUgcG9seW1lcml6YXRpb24gZmllbGQsIGkuZS4gYWJsZSB0byBlbG9uZ2F0ZVxuICBcImhlYWRGb3VuZFwiLCAvLyBjYW5kaWRhdGVzIHRoYXQgc2F3IHN1Y2ggYSBwbHVzIGVuZCBuZWFyYnlcbiAgXCJicmFuY2hlZFwiLCAvLyBuZXcgYnJhbmNoZXMgbnVjbGVhdGVkIG9uIHRoZSBzaWRlIG9mIGEgZmlsYW1lbnQgKGxhbWVsbGlwb2RpdW0gZmllbGQpXG4gIFwiZGVicmFuY2hlZFwiLCAvLyBicmFuY2hlcyB0aGF0IGNhbWUgb2ZmIHRoZWlyIG1vdGhlclxuICBcInBvaW50Q29udGFjdHNcIixcbiAgXCJib25kQ29udGFjdHNcIixcbiAgXCJyZWFyTWludXNMb3NzXCIsXG4gIFwiZnJvbnRNaW51c0xvc3NcIixcbiAgXCJyZWFyUGx1c0xvc3NcIixcbiAgXCJ0ZXRoZXJSZWxlYXNlZFwiLFxuXSBhcyBjb25zdDtcblxudHlwZSBDb3VudGVycyA9IFJlY29yZDwodHlwZW9mIFRFTEVNRVRSWV9DT1VOVEVSUylbbnVtYmVyXSwgbnVtYmVyPjtcblxuZXhwb3J0IHR5cGUgQWN0aW5TdGF0cyA9IHtcbiAgcnVuOiBzdHJpbmc7XG4gIGZyYW1lOiBudW1iZXI7XG4gIHN0ZXA6IG51bWJlcjtcbiAgYWN0aW5Db3VudDogbnVtYmVyO1xuICBtb25vbWVyczogbnVtYmVyO1xuICBmaWxhbWVudHM6IG51bWJlcjtcbiAgYnJhbmNoZXM6IG51bWJlcjsgLy8gZmlsYW1lbnRzIGhhbmdpbmcgb2ZmIHRoZSBzaWRlIG9mIGFub3RoZXIgb25lXG4gIGluUG9seW1lcjogbnVtYmVyO1xuICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHM6IG51bWJlcjsgLy8gbGVnYWN5IG1hcmtlci14IGhhbGYsIG5vdCB0aGUgY3VycmVudCBnZW9tZXRyaWMgcG9sYXJpdHkgZnJhbWVcbiAgaW5zaWRlUG9seW1lckJlYWRzOiBudW1iZXI7XG4gIGluc2lkZU1vbm9tZXJCZWFkczogbnVtYmVyO1xuICBnQWN0aW5Nb2RlOiBcIndlbGwtbWl4ZWRcIiB8IFwicGFydGljbGVzXCI7XG4gIGdBY3RpbkFtb3VudDogbnVtYmVyO1xuICBnQWN0aW5Db25jZW50cmF0aW9uOiBudW1iZXI7XG4gIGFjdGluQmFsYW5jZUVycm9yOiBudW1iZXI7XG4gIGNyb3NzaW5nRmlsYW1lbnRCb25kczogbnVtYmVyO1xuICBtZWFuUG9seW1lckFnZTogbnVtYmVyO1xuICBtYXhQb2x5bWVyQWdlOiBudW1iZXI7XG4gIG1lYW5MZW5ndGg6IG51bWJlcjtcbiAgbWVkaWFuTGVuZ3RoOiBudW1iZXI7XG4gIHA5MExlbmd0aDogbnVtYmVyO1xuICBtYXhMZW5ndGg6IG51bWJlcjtcbiAgLy8gZmlsYW1lbnQgY291bnRzIHBlciBsZW5ndGggYmluOiAyLCAzLTQsIDUtOCwgOS0xNiwgMTctMzIsIDMzLTY0LCA2NStcbiAgaGlzdG9ncmFtOiBudW1iZXJbXTtcbiAgbWVkaWFuQm9uZExlbmd0aDogbnVtYmVyOyAvLyBpbiB1bml0cyBvZiB0aGUgYWN0aW4gcmVzdCBsZW5ndGhcbiAgbWVkaWFuQmVuZEFuZ2xlOiBudW1iZXI7IC8vIGRlZ3JlZXMgYmV0d2VlbiBjb25zZWN1dGl2ZSBib25kcyBvZiBhIGZpbGFtZW50OyBsb3cgPSBzdGlmZlxuICBicm9rZW5MaW5rczogbnVtYmVyOyAvLyBhLmhlYWQgPSBiIGJ1dCBiLnRhaWwgIT0gYVxuICBjeWNsZXM6IG51bWJlcjtcbiAgcGVyU3RlcDogQ291bnRlcnM7IC8vIGV2ZW50IHJhdGVzIHNpbmNlIHRoZSBwcmV2aW91cyBzYW1wbGVcbiAgY2VsbDogQ2VsbFNoYXBlO1xuICBkaWFnbm9zdGljS2luZD86IFwic2ltdWxhdGlvblwiIHwgXCJjb250YWN0LXJlY2hlY2tcIjtcbn07XG5cbi8vIG1lbWJyYW5lIHNoYXBlIGluIHBpeGVsczsgbm9kZSAwIGlzIHRoZSBmcm9udCAodGhlIHJpZ2h0IHNpZGUgYXQgcmVzZXQpLCBub2RlIGNvdW50IC8gMiB0aGUgcmVhclxuZXhwb3J0IHR5cGUgQ2VsbFNoYXBlID0ge1xuICBsZWZ0OiBudW1iZXI7IC8vIGxlZnRtb3N0IG1lbWJyYW5lIHhcbiAgcmlnaHQ6IG51bWJlcjsgLy8gcmlnaHRtb3N0IG1lbWJyYW5lIHhcbiAgdG9wOiBudW1iZXI7XG4gIGJvdHRvbTogbnVtYmVyO1xuICBmcm9udFg6IG51bWJlcjtcbiAgcmVhclg6IG51bWJlcjtcbiAgY2VudHJvaWRYOiBudW1iZXI7XG4gIGNlbnRyb2lkWTogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlcjsgLy8gZnJvbnQgbm9kZSB0byByZWFyIG5vZGVcbiAgYXJlYTogbnVtYmVyOyAvLyByZWxhdGl2ZSB0byB0aGUgYXJlYSBhdCByZXNldFxuICAvLyBtZWFuIG1lbWJyYW5lIGVkZ2UgbGVuZ3RoIGluIHVuaXRzIG9mIHRoZSByZXN0IGxlbmd0aCwgb3ZlciB0aGUgcXVhcnRlciBvZiB0aGUgbm9kZXMgYXJvdW5kIHRoZSBmcm9udCBhbmQgdGhlIHJlYXJcbiAgZnJvbnRTcGFjaW5nOiBudW1iZXI7XG4gIHJlYXJTcGFjaW5nOiBudW1iZXI7XG59O1xuXG5jb25zdCBISVNUT0dSQU1fRURHRVMgPSBbMiwgNCwgOCwgMTYsIDMyLCA2NF07XG5cbmV4cG9ydCBjbGFzcyBUZWxlbWV0cnlBbmFseXNpcyB7XG4gIHByaXZhdGUgbGFzdENvdW50ZXJzOiBudW1iZXJbXSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RTdGVwID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFjdGluQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lUmVzdExlbmd0aDogbnVtYmVyLFxuICAgIHByaXZhdGUgcnVuOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSB3ZWxsTWl4ZWQgPSBmYWxzZVxuICApIHt9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBudWxsO1xuICAgIHRoaXMubGFzdFN0ZXAgPSAwO1xuICB9XG5cbiAgYW5hbHl6ZShcbiAgICBhY3RpbjogQXJyYXlCdWZmZXIsXG4gICAgbWVtYnJhbmVEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICBjb3VudGVyRGF0YTogQXJyYXlCdWZmZXIsXG4gICAgZnJhbWU6IG51bWJlcixcbiAgICBzdGVwOiBudW1iZXIsXG4gICAgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U6IG51bWJlcixcbiAgICB2ZXJpZmljYXRpb24gPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBwcmV2aW91c0NvdW50ZXJzID0gdGhpcy5sYXN0Q291bnRlcnMsXG4gICAgICBwcmV2aW91c1N0ZXAgPSB0aGlzLmxhc3RTdGVwO1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KGFjdGluKTtcbiAgICBjb25zdCBmbG9hdHMgPSBuZXcgRmxvYXQzMkFycmF5KHdvcmRzLmJ1ZmZlcik7XG4gICAgY29uc3QgY291bnRlcnMgPSBBcnJheS5mcm9tKG5ldyBVaW50MzJBcnJheShjb3VudGVyRGF0YSkpO1xuICAgIGNvbnN0IG1lbWJyYW5lID0gbmV3IEZsb2F0MzJBcnJheShtZW1icmFuZURhdGEpO1xuICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxTaGFwZShtZW1icmFuZSk7XG4gICAgY29uc3Qgc3RhdHMgPSB0aGlzLmNvbXB1dGUod29yZHMsIGZsb2F0cywgY291bnRlcnMsIGZyYW1lLCBzdGVwLCBlcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgY2VsbCk7XG4gICAgY29uc3QgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShtZW1icmFuZSwgU0VHTUVOVF9XT1JEUywgdGhpcy53ZWxsTWl4ZWQpO1xuICAgIGNvbnN0IGNyb3NzaW5nID0gdGhpcy53ZWxsTWl4ZWQgPyBwb2x5Z29uQm9uZENyb3NzaW5nKG1lbWJyYW5lKSA6IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFjdGluQ291bnQ7IGkrKykge1xuICAgICAgY29uc3QgZGlzY29ubmVjdGVkID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpO1xuICAgICAgaWYgKHRoaXMud2VsbE1peGVkICYmIGRpc2Nvbm5lY3RlZCkgY29udGludWU7IC8vIHJlc2Vydm9pciBlbnRyaWVzIGhhdmUgbm8gc3BhdGlhbCBjb29yZGluYXRlc1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBpZiAoXG4gICAgICAgIGNyb3NzaW5nICYmXG4gICAgICAgIHRhaWwgIT09IGkgJiZcbiAgICAgICAgY3Jvc3NpbmcoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdLCBmbG9hdHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyAyXSwgZmxvYXRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgM10pXG4gICAgICApXG4gICAgICAgIHN0YXRzLmNyb3NzaW5nRmlsYW1lbnRCb25kcysrO1xuICAgICAgaWYgKCFpbnNpZGUoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdKSkgY29udGludWU7XG4gICAgICBpZiAod29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpKSBzdGF0cy5pbnNpZGVNb25vbWVyQmVhZHMrKztcbiAgICAgIGVsc2Ugc3RhdHMuaW5zaWRlUG9seW1lckJlYWRzKys7XG4gICAgfVxuICAgIHN0YXRzLmdBY3RpbkNvbmNlbnRyYXRpb24gPSB0aGlzLndlbGxNaXhlZCA/IHN0YXRzLmdBY3RpbkFtb3VudCAvICgoY2VsbC5hcmVhICogKHRoaXMubWVtYnJhbmVDb3VudCAqIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAqKiAyKSAvICg0ICogTWF0aC5QSSkpIDogMDtcbiAgICBzdGF0cy5kaWFnbm9zdGljS2luZCA9IHZlcmlmaWNhdGlvbiA/IFwiY29udGFjdC1yZWNoZWNrXCIgOiBcInNpbXVsYXRpb25cIjtcbiAgICBpZiAodmVyaWZpY2F0aW9uKSB7XG4gICAgICB0aGlzLmxhc3RDb3VudGVycyA9IHByZXZpb3VzQ291bnRlcnM7XG4gICAgICB0aGlzLmxhc3RTdGVwID0gcHJldmlvdXNTdGVwO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICBwcml2YXRlIGNlbGxTaGFwZShmbG9hdHM6IEZsb2F0MzJBcnJheSk6IENlbGxTaGFwZSB7XG4gICAgY29uc3QgbiA9IHRoaXMubWVtYnJhbmVDb3VudDtcbiAgICBjb25zdCB4ID0gKGk6IG51bWJlcikgPT4gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgY29uc3QgeSA9IChpOiBudW1iZXIpID0+IGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdO1xuICAgIGxldCBsZWZ0ID0gSW5maW5pdHk7XG4gICAgbGV0IHJpZ2h0ID0gLUluZmluaXR5O1xuICAgIGxldCB0b3AgPSBJbmZpbml0eTtcbiAgICBsZXQgYm90dG9tID0gLUluZmluaXR5O1xuICAgIC8vIGFyZWEtd2VpZ2h0ZWQgY2VudHJvaWQgKHNob2VsYWNlKVxuICAgIGxldCBhcmVhID0gMDtcbiAgICBsZXQgY3ggPSAwO1xuICAgIGxldCBjeSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGxlZnQgPSBNYXRoLm1pbihsZWZ0LCB4KGkpKTtcbiAgICAgIHJpZ2h0ID0gTWF0aC5tYXgocmlnaHQsIHgoaSkpO1xuICAgICAgdG9wID0gTWF0aC5taW4odG9wLCB5KGkpKTtcbiAgICAgIGJvdHRvbSA9IE1hdGgubWF4KGJvdHRvbSwgeShpKSk7XG4gICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICBjb25zdCBjcm9zcyA9IHgoaSkgKiB5KGopIC0geChqKSAqIHkoaSk7XG4gICAgICBhcmVhICs9IGNyb3NzIC8gMjtcbiAgICAgIGN4ICs9ICh4KGkpICsgeChqKSkgKiBjcm9zcztcbiAgICAgIGN5ICs9ICh5KGkpICsgeShqKSkgKiBjcm9zcztcbiAgICB9XG4gICAgY29uc3QgcmVhciA9IG4gPj4gMTtcbiAgICBjb25zdCBxdWFydGVyU3BhY2luZyA9IChjZW50ZXI6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICBmb3IgKGxldCBrID0gLShuID4+IDMpOyBrIDwgbiA+PiAzOyBrKyspIHtcbiAgICAgICAgY29uc3QgaSA9IChjZW50ZXIgKyBrICsgbikgJSBuO1xuICAgICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICAgIHN1bSArPSBNYXRoLmh5cG90KHgoaikgLSB4KGkpLCB5KGopIC0geShpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtIC8gKG4gPj4gMikgLyB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aDtcbiAgICB9O1xuICAgIGNvbnN0IHJlc3RBcmVhID0gKG4gKiB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCkgKiogMiAvICg0ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQsXG4gICAgICByaWdodCxcbiAgICAgIHRvcCxcbiAgICAgIGJvdHRvbSxcbiAgICAgIGZyb250WDogeCgwKSxcbiAgICAgIHJlYXJYOiB4KHJlYXIpLFxuICAgICAgY2VudHJvaWRYOiBjeCAvICg2ICogYXJlYSksXG4gICAgICBjZW50cm9pZFk6IGN5IC8gKDYgKiBhcmVhKSxcbiAgICAgIGxlbmd0aDogTWF0aC5oeXBvdCh4KDApIC0geChyZWFyKSwgeSgwKSAtIHkocmVhcikpLFxuICAgICAgYXJlYTogTWF0aC5hYnMoYXJlYSkgLyByZXN0QXJlYSxcbiAgICAgIGZyb250U3BhY2luZzogcXVhcnRlclNwYWNpbmcoMCksXG4gICAgICByZWFyU3BhY2luZzogcXVhcnRlclNwYWNpbmcocmVhciksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZSh3b3JkczogVWludDMyQXJyYXksIGZsb2F0czogRmxvYXQzMkFycmF5LCBjb3VudGVyczogbnVtYmVyW10sIGZyYW1lOiBudW1iZXIsIHN0ZXA6IG51bWJlciwgcmVzdExlbmd0aDogbnVtYmVyLCBjZWxsOiBDZWxsU2hhcGUpOiBBY3RpblN0YXRzIHtcbiAgICBjb25zdCBuID0gdGhpcy5hY3RpbkNvdW50O1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgVWludDhBcnJheShuKTtcbiAgICBjb25zdCBsZW5ndGhzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBtb25vbWVycyA9IDA7XG4gICAgbGV0IGJyb2tlbkxpbmtzID0gMDtcbiAgICBsZXQgY3ljbGVzID0gMDtcbiAgICBsZXQgYnJhbmNoZXMgPSAwO1xuICAgIGxldCBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMgPSAwO1xuICAgIGxldCBhZ2VTdW0gPSAwLFxuICAgICAgbWF4QWdlID0gMDtcbiAgICBjb25zdCBib25kTGVuZ3RoczogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBiZW5kQW5nbGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhaWwgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdO1xuICAgICAgY29uc3QgaGVhZCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICBpZiAodGFpbCA9PT0gaSAmJiBoZWFkID09PSBpKSB7XG4gICAgICAgIG1vbm9tZXJzKys7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgYWdlID0gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgOV07XG4gICAgICBhZ2VTdW0gKz0gYWdlO1xuICAgICAgbWF4QWdlID0gTWF0aC5tYXgobWF4QWdlLCBhZ2UpO1xuICAgICAgaWYgKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdIDwgKGNlbGwuZnJvbnRYICsgY2VsbC5yZWFyWCkgLyAyKSBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMrKztcbiAgICAgIGlmIChoZWFkICE9PSBpICYmIHdvcmRzW2hlYWQgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gIT09IGkpIHtcbiAgICAgICAgYnJva2VuTGlua3MrKztcbiAgICAgIH1cbiAgICAgIC8vIGEgYnJhbmNoIHJvb3QncyB0YWlsIGlzIGl0cyBtb3RoZXIsIHdob3NlIGhlYWQgcG9pbnRzIGVsc2V3aGVyZSBhbG9uZyB0aGUgbW90aGVyIGZpbGFtZW50XG4gICAgICBjb25zdCBpc0JyYW5jaFJvb3QgPSB0YWlsICE9PSBpICYmIHdvcmRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF0gIT09IGk7XG4gICAgICBpZiAodGFpbCAhPT0gaSAmJiAhaXNCcmFuY2hSb290KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnJhbmNoZXMgKz0gaXNCcmFuY2hSb290ID8gMSA6IDA7XG4gICAgICAvLyBhIG1pbnVzIGVuZCBvciBicmFuY2ggcm9vdDogd2FsayB0byB0aGUgcGx1cyBlbmRcbiAgICAgIGxldCBsZW5ndGggPSAxO1xuICAgICAgbGV0IGN1cnJlbnQgPSBpO1xuICAgICAgbGV0IHByZXZEeCA9IDA7XG4gICAgICBsZXQgcHJldkR5ID0gMDtcbiAgICAgIHZpc2l0ZWRbaV0gPSAxO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHdvcmRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICAgIGlmIChuZXh0ID09PSBjdXJyZW50KSBicmVhaztcbiAgICAgICAgaWYgKHZpc2l0ZWRbbmV4dF0pIHtcbiAgICAgICAgICBjeWNsZXMrKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkeCA9IGZsb2F0c1tuZXh0ICogU0VHTUVOVF9XT1JEUyArIDJdIC0gZmxvYXRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgICAgIGNvbnN0IGR5ID0gZmxvYXRzW25leHQgKiBTRUdNRU5UX1dPUkRTICsgM10gLSBmbG9hdHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyAzXTtcbiAgICAgICAgYm9uZExlbmd0aHMucHVzaChNYXRoLmh5cG90KGR4LCBkeSkpO1xuICAgICAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgICAgIGJlbmRBbmdsZXMucHVzaCgoTWF0aC5hYnMoTWF0aC5hdGFuMihwcmV2RHggKiBkeSAtIHByZXZEeSAqIGR4LCBwcmV2RHggKiBkeCArIHByZXZEeSAqIGR5KSkgKiAxODApIC8gTWF0aC5QSSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJldkR4ID0gZHg7XG4gICAgICAgIHByZXZEeSA9IGR5O1xuICAgICAgICB2aXNpdGVkW25leHRdID0gMTtcbiAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgIGxlbmd0aCsrO1xuICAgICAgfVxuICAgICAgbGVuZ3Rocy5wdXNoKGxlbmd0aCk7XG4gICAgfVxuXG4gICAgbGVuZ3Rocy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgY29uc3QgaW5Qb2x5bWVyID0gbGVuZ3Rocy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgbCwgMCk7XG4gICAgY29uc3QgaGlzdG9ncmFtID0gbmV3IEFycmF5KEhJU1RPR1JBTV9FREdFUy5sZW5ndGggKyAxKS5maWxsKDApO1xuICAgIGZvciAoY29uc3QgbCBvZiBsZW5ndGhzKSB7XG4gICAgICBjb25zdCBiaW4gPSBISVNUT0dSQU1fRURHRVMuZmluZEluZGV4KChlZGdlKSA9PiBsIDw9IGVkZ2UpO1xuICAgICAgaGlzdG9ncmFtW2JpbiA9PT0gLTEgPyBISVNUT0dSQU1fRURHRVMubGVuZ3RoIDogYmluXSsrO1xuICAgIH1cblxuICAgIGNvbnN0IHN0ZXBzID0gTWF0aC5tYXgoMSwgc3RlcCAtIHRoaXMubGFzdFN0ZXApO1xuICAgIGNvbnN0IHBlclN0ZXAgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICBURUxFTUVUUllfQ09VTlRFUlMubWFwKChuYW1lLCBrKSA9PiBbbmFtZSwgdGhpcy5sYXN0Q291bnRlcnMgPyAoY291bnRlcnNba10gLSB0aGlzLmxhc3RDb3VudGVyc1trXSkgLyBzdGVwcyA6IDBdKVxuICAgICkgYXMgQ291bnRlcnM7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBjb3VudGVycztcbiAgICB0aGlzLmxhc3RTdGVwID0gc3RlcDtcblxuICAgIGNvbnN0IHF1YW50aWxlID0gKHE6IG51bWJlcikgPT4gKGxlbmd0aHMubGVuZ3RoID8gbGVuZ3Roc1tNYXRoLm1pbihsZW5ndGhzLmxlbmd0aCAtIDEsIE1hdGguZmxvb3IocSAqIGxlbmd0aHMubGVuZ3RoKSldIDogMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJ1bjogdGhpcy5ydW4sXG4gICAgICBmcmFtZSxcbiAgICAgIHN0ZXAsXG4gICAgICBhY3RpbkNvdW50OiBuLFxuICAgICAgbW9ub21lcnMsXG4gICAgICBmaWxhbWVudHM6IGxlbmd0aHMubGVuZ3RoLFxuICAgICAgYnJhbmNoZXMsXG4gICAgICBpblBvbHltZXIsXG4gICAgICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMsXG4gICAgICBpbnNpZGVQb2x5bWVyQmVhZHM6IDAsXG4gICAgICBpbnNpZGVNb25vbWVyQmVhZHM6IDAsXG4gICAgICBnQWN0aW5Nb2RlOiB0aGlzLndlbGxNaXhlZCA/IFwid2VsbC1taXhlZFwiIDogXCJwYXJ0aWNsZXNcIixcbiAgICAgIGdBY3RpbkFtb3VudDogbW9ub21lcnMsXG4gICAgICBnQWN0aW5Db25jZW50cmF0aW9uOiAwLFxuICAgICAgYWN0aW5CYWxhbmNlRXJyb3I6IG1vbm9tZXJzICsgaW5Qb2x5bWVyIC0gbixcbiAgICAgIGNyb3NzaW5nRmlsYW1lbnRCb25kczogMCxcbiAgICAgIG1lYW5Qb2x5bWVyQWdlOiBuID4gbW9ub21lcnMgPyBhZ2VTdW0gLyAobiAtIG1vbm9tZXJzKSA6IDAsXG4gICAgICBtYXhQb2x5bWVyQWdlOiBtYXhBZ2UsXG4gICAgICBtZWFuTGVuZ3RoOiBsZW5ndGhzLmxlbmd0aCA/IGluUG9seW1lciAvIGxlbmd0aHMubGVuZ3RoIDogMCxcbiAgICAgIG1lZGlhbkxlbmd0aDogcXVhbnRpbGUoMC41KSxcbiAgICAgIHA5MExlbmd0aDogcXVhbnRpbGUoMC45KSxcbiAgICAgIG1heExlbmd0aDogbGVuZ3Rocy5sZW5ndGggPyBsZW5ndGhzW2xlbmd0aHMubGVuZ3RoIC0gMV0gOiAwLFxuICAgICAgaGlzdG9ncmFtLFxuICAgICAgbWVkaWFuQm9uZExlbmd0aDogYm9uZExlbmd0aHMubGVuZ3RoID8gYm9uZExlbmd0aHMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JvbmRMZW5ndGhzLmxlbmd0aCA+PiAxXSAvIHJlc3RMZW5ndGggOiAwLFxuICAgICAgbWVkaWFuQmVuZEFuZ2xlOiBiZW5kQW5nbGVzLmxlbmd0aCA/IGJlbmRBbmdsZXMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JlbmRBbmdsZXMubGVuZ3RoID4+IDFdIDogMCxcbiAgICAgIGJyb2tlbkxpbmtzLFxuICAgICAgY3ljbGVzLFxuICAgICAgcGVyU3RlcCxcbiAgICAgIGNlbGwsXG4gICAgfTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVEVMRU1FVFJZX0NPVU5URVJTLCB0eXBlIEFjdGluU3RhdHMgfSBmcm9tIFwiLi90ZWxlbWV0cnktYW5hbHlzaXNcIjtcbmV4cG9ydCB7IFRFTEVNRVRSWV9DT1VOVEVSUywgdHlwZSBBY3RpblN0YXRzLCB0eXBlIENlbGxTaGFwZSB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xuXG4vLyBPbmUgaW4tZmxpZ2h0IHJlYWRiYWNrL3dvcmtlciBqb2IuIEV2ZXJ5IGZvcmNlZCBhc3NheSBjaGVja3BvaW50IHdhaXRzIGZvciBhXG4vLyBmcmVzaCBmdWxsIGFuYWx5c2lzOyBpbnRlcmFjdGl2ZSByZXF1ZXN0cyBjb2FsZXNjZSB3aGlsZSB0aGUgd29ya2VyIGlzIGJ1c3kuXG5leHBvcnQgY2xhc3MgQWN0aW5UZWxlbWV0cnkge1xuICByZWFkb25seSBjb3VudGVyQnVmZmVyOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgYWN0aW5TdGFnaW5nOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgY291bnRlclN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBtZW1icmFuZVN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBwZW5kaW5nOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgd29ya2VyID0gbmV3IFdvcmtlcihuZXcgVVJMKFwiLi90ZWxlbWV0cnkud29ya2VyLnRzXCIsIGltcG9ydC5tZXRhLnVybCksIHsgdHlwZTogXCJtb2R1bGVcIiB9KTtcbiAgcHJpdmF0ZSBqb2I6IHsgaWQ6IG51bWJlcjsgcmVzb2x2ZTogKHZhbHVlOiB7IHN0YXRzOiBBY3RpblN0YXRzOyBhbmFseXNpc01zOiBudW1iZXIgfSkgPT4gdm9pZDsgcmVqZWN0OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB3b3JrZXJGYWlsdXJlOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5leHRJZCA9IDA7XG4gIHByaXZhdGUgZGlzcGxheTogSFRNTFByZUVsZW1lbnQ7XG4gIHByaXZhdGUgc3VtbWFyeTogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgcG9zdFRvU2VydmVyID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInRlbGVtZXRyeVwiKSA9PT0gXCIxXCI7XG4gIHJlYWRvbmx5IGhpc3Rvcnk6IEFjdGluU3RhdHNbXSA9IFtdO1xuICBvblNhbXBsZT86IChzdGF0czogQWN0aW5TdGF0cykgPT4gdm9pZDtcbiAgcmVhZG9ubHkgdGltaW5ncyA9IHsgcmVhZGJhY2tNczogMCwgYW5hbHlzaXNNczogMCwgd29ya2VyUm91bmRUcmlwTXM6IDAsIHRvdGFsTXM6IDAsIGNvYWxlc2NlZEF1dG9tYXRpY1NhbXBsZXM6IDAgfTtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBkZXZpY2U6IEdQVURldmljZSxcbiAgICBwcml2YXRlIGFjdGluQnVmZmVyOiBHUFVCdWZmZXIsXG4gICAgYWN0aW5Db3VudDogbnVtYmVyLFxuICAgIHByaXZhdGUgbWVtYnJhbmVCdWZmZXI6IEdQVUJ1ZmZlcixcbiAgICBtZW1icmFuZUNvdW50OiBudW1iZXIsXG4gICAgbWVtYnJhbmVSZXN0TGVuZ3RoOiBudW1iZXIsXG4gICAgcHJpdmF0ZSBydW46IHN0cmluZyxcbiAgICBwcml2YXRlIGludGVydmFsRnJhbWVzID0gMzAsXG4gICAgcHJpdmF0ZSB3ZWxsTWl4ZWQgPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLmNvdW50ZXJCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxhYmVsOiBcIlRlbGVtZXRyeSBjb3VudGVyc1wiLFxuICAgICAgc2l6ZTogNCAqIFRFTEVNRVRSWV9DT1VOVEVSUy5sZW5ndGgsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSk7XG4gICAgY29uc3Qgc3RhZ2luZyA9IChzaXplOiBudW1iZXIpID0+IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICB0aGlzLmFjdGluU3RhZ2luZyA9IHN0YWdpbmcoYWN0aW5CdWZmZXIuc2l6ZSk7XG4gICAgdGhpcy5jb3VudGVyU3RhZ2luZyA9IHN0YWdpbmcodGhpcy5jb3VudGVyQnVmZmVyLnNpemUpO1xuICAgIHRoaXMubWVtYnJhbmVTdGFnaW5nID0gc3RhZ2luZyhtZW1icmFuZUJ1ZmZlci5zaXplKTtcbiAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHtcbiAgICAgIGNvbnN0IGpvYiA9IHRoaXMuam9iO1xuICAgICAgaWYgKCFqb2IgfHwgam9iLmlkICE9PSBkYXRhLmlkKSByZXR1cm47XG4gICAgICB0aGlzLmpvYiA9IG51bGw7XG4gICAgICBpZiAoZGF0YS5lcnJvcikgam9iLnJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvcikpO1xuICAgICAgZWxzZSBqb2IucmVzb2x2ZShkYXRhKTtcbiAgICB9O1xuICAgIHRoaXMud29ya2VyLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMud29ya2VyRmFpbHVyZSA9IG5ldyBFcnJvcihgRGlhZ25vc3RpYyB3b3JrZXI6ICR7ZXZlbnQubWVzc2FnZX1gKTtcbiAgICAgIHRoaXMuam9iPy5yZWplY3QodGhpcy53b3JrZXJGYWlsdXJlKTtcbiAgICAgIHRoaXMuam9iID0gbnVsbDtcbiAgICB9O1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJpbml0XCIsIGNvbmZpZzogW2FjdGluQ291bnQsIG1lbWJyYW5lQ291bnQsIG1lbWJyYW5lUmVzdExlbmd0aCwgcnVuLCB3ZWxsTWl4ZWRdIH0pO1xuICAgIGNvbnN0IGRldGFpbHMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkZXRhaWxzXCIpLCB7IGlkOiBcImRpYWdub3N0aWNzXCIgfSk7XG4gICAgT2JqZWN0LmFzc2lnbihkZXRhaWxzLnN0eWxlLCB7XG4gICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgbGVmdDogXCIxMHB4XCIsXG4gICAgICBib3R0b206IFwiMTBweFwiLFxuICAgICAgcGFkZGluZzogXCI2cHhcIixcbiAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICBmb250OiBcIjExcHggbW9ub3NwYWNlXCIsXG4gICAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMCwwLDAsLjgpXCIsXG4gICAgICB6SW5kZXg6IFwiMTAwMFwiLFxuICAgICAgbWF4V2lkdGg6IFwiY2FsYygxMDB2dyAtIDMycHgpXCIsXG4gICAgfSk7XG4gICAgdGhpcy5zdW1tYXJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN1bW1hcnlcIik7XG4gICAgdGhpcy5zdW1tYXJ5LnRleHRDb250ZW50ID0gXCJGdWxsIG51bWVyaWNhbCBkaWFnbm9zdGljcyDCtyB3b3JrZXJcIjtcbiAgICB0aGlzLmRpc3BsYXkgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIiksIHsgaWQ6IFwiYWN0aW5UZWxlbWV0cnlcIiB9KTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZGlzcGxheS5zdHlsZSwgeyBtYXhIZWlnaHQ6IFwiMjIwcHhcIiwgb3ZlcmZsb3c6IFwiYXV0b1wiLCBtYXJnaW46IFwiNnB4IDAgMFwiIH0pO1xuICAgIGRldGFpbHMuYXBwZW5kKHRoaXMuc3VtbWFyeSwgdGhpcy5kaXNwbGF5KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChkZXRhaWxzKTtcbiAgICAod2luZG93IGFzIGFueSkuYWN0aW5UZWxlbWV0cnkgPSB0aGlzO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicGFnZWhpZGVcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnBlcnNpc3RlZCkgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgfSk7XG4gIH1cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5kZXZpY2UucXVldWUud3JpdGVCdWZmZXIodGhpcy5jb3VudGVyQnVmZmVyLCAwLCBuZXcgVWludDMyQXJyYXkoVEVMRU1FVFJZX0NPVU5URVJTLmxlbmd0aCkpO1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJyZXNldFwiIH0pO1xuICAgIHRoaXMuaGlzdG9yeS5sZW5ndGggPSAwO1xuICB9XG4gIGFzeW5jIHVwZGF0ZShmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3Q6IG51bWJlciwgZm9yY2UgPSBmYWxzZSwgdmVyaWZpY2F0aW9uID0gZmFsc2UpIHtcbiAgICBpZiAoIWZvcmNlICYmIGZyYW1lICUgdGhpcy5pbnRlcnZhbEZyYW1lcyAhPT0gMCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgIGlmICghZm9yY2UpIHtcbiAgICAgICAgdGhpcy50aW1pbmdzLmNvYWxlc2NlZEF1dG9tYXRpY1NhbXBsZXMrKztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5wZW5kaW5nOyAvLyBuZXZlciByZXR1cm4gYW4gb2xkIHNuYXBzaG90IGZvciBhbiBleGFjdC1zdGVwIGFzc2F5XG4gICAgfVxuICAgIGlmICh0aGlzLndvcmtlckZhaWx1cmUpIHRocm93IHRoaXMud29ya2VyRmFpbHVyZTtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5jYXB0dXJlKGZyYW1lLCBzdGVwLCByZXN0LCB2ZXJpZmljYXRpb24pO1xuICAgIHRoaXMucGVuZGluZyA9IHByb21pc2U7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb21pc2U7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgPT09IHByb21pc2UpIHRoaXMucGVuZGluZyA9IG51bGw7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgYXN5bmMgY2FwdHVyZShmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3Q6IG51bWJlciwgdmVyaWZpY2F0aW9uID0gZmFsc2UpIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGVuY29kZXIgPSB0aGlzLmRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHRoaXMuYWN0aW5CdWZmZXIsIDAsIHRoaXMuYWN0aW5TdGFnaW5nLCAwLCB0aGlzLmFjdGluU3RhZ2luZy5zaXplKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcih0aGlzLmNvdW50ZXJCdWZmZXIsIDAsIHRoaXMuY291bnRlclN0YWdpbmcsIDAsIHRoaXMuY291bnRlclN0YWdpbmcuc2l6ZSk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIodGhpcy5tZW1icmFuZUJ1ZmZlciwgMCwgdGhpcy5tZW1icmFuZVN0YWdpbmcsIDAsIHRoaXMubWVtYnJhbmVTdGFnaW5nLnNpemUpO1xuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGNvbnN0IHN0YWdlcyA9IFt0aGlzLmFjdGluU3RhZ2luZywgdGhpcy5tZW1icmFuZVN0YWdpbmcsIHRoaXMuY291bnRlclN0YWdpbmddO1xuICAgIGxldCBjb3BpZXM6IEFycmF5QnVmZmVyW107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcHBlZCA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChzdGFnZXMubWFwKChidWZmZXIpID0+IGJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpKSk7XG4gICAgICBjb25zdCBmYWlsZWQgPSBtYXBwZWQuZmluZCgocmVzdWx0KSA9PiByZXN1bHQuc3RhdHVzID09PSBcInJlamVjdGVkXCIpO1xuICAgICAgaWYgKGZhaWxlZD8uc3RhdHVzID09PSBcInJlamVjdGVkXCIpIHRocm93IGZhaWxlZC5yZWFzb247XG4gICAgICBjb3BpZXMgPSBzdGFnZXMubWFwKChidWZmZXIpID0+IGJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZm9yIChjb25zdCBidWZmZXIgb2Ygc3RhZ2VzKSBpZiAoYnVmZmVyLm1hcFN0YXRlID09PSBcIm1hcHBlZFwiKSBidWZmZXIudW5tYXAoKTtcbiAgICB9XG4gICAgdGhpcy50aW1pbmdzLnJlYWRiYWNrTXMgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xuICAgIGNvbnN0IHdvcmtlclN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBpZCA9ICsrdGhpcy5uZXh0SWQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2U8eyBzdGF0czogQWN0aW5TdGF0czsgYW5hbHlzaXNNczogbnVtYmVyIH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuam9iID0geyBpZCwgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiYW5hbHl6ZVwiLCBpZCwgYWN0aW46IGNvcGllc1swXSwgbWVtYnJhbmU6IGNvcGllc1sxXSwgY291bnRlcnM6IGNvcGllc1syXSwgZnJhbWUsIHN0ZXAsIHJlc3QsIHZlcmlmaWNhdGlvbiB9LCBjb3BpZXMpO1xuICAgIH0pO1xuICAgIHRoaXMudGltaW5ncy53b3JrZXJSb3VuZFRyaXBNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gd29ya2VyU3RhcnQ7XG4gICAgdGhpcy50aW1pbmdzLmFuYWx5c2lzTXMgPSByZXN1bHQuYW5hbHlzaXNNcztcbiAgICB0aGlzLnRpbWluZ3MudG90YWxNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQ7XG4gICAgY29uc3QgcyA9IHJlc3VsdC5zdGF0cztcbiAgICB0aGlzLmhpc3RvcnkucHVzaChzKTtcbiAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDEwMjQpIHRoaXMuaGlzdG9yeS5zaGlmdCgpO1xuICAgIHRoaXMuc2hvdyhzKTtcbiAgICB0aGlzLm9uU2FtcGxlPy4ocyk7XG4gICAgaWYgKHRoaXMucG9zdFRvU2VydmVyKVxuICAgICAgZmV0Y2goXCIvX190ZWxlbWV0cnlcIiwgeyBtZXRob2Q6IFwiUE9TVFwiLCBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sIGJvZHk6IEpTT04uc3RyaW5naWZ5KHMpIH0pLnRoZW4oXG4gICAgICAgIChyKSA9PiAodGhpcy5wb3N0VG9TZXJ2ZXIgPSByLm9rKSxcbiAgICAgICAgKCkgPT4gKHRoaXMucG9zdFRvU2VydmVyID0gZmFsc2UpXG4gICAgICApO1xuICB9XG4gIHByaXZhdGUgc2hvdyhzOiBBY3RpblN0YXRzKSB7XG4gICAgY29uc3QgYyA9IHMuY2VsbCxcbiAgICAgIHIgPSBzLnBlclN0ZXA7XG4gICAgdGhpcy5zdW1tYXJ5LnRleHRDb250ZW50ID0gYENoZWNrZWQgc3RlcCAke3Muc3RlcH0gwrcgbWFzcyBlcnJvciAke3MuYWN0aW5CYWxhbmNlRXJyb3J9IMK3IEYgaW5zaWRlICR7cy5pbnNpZGVQb2x5bWVyQmVhZHN9LyR7cy5pblBvbHltZXJ9IMK3IGFyZWEgJHtjLmFyZWEudG9GaXhlZCg0KX0gwrcgd29ya2VyICR7dGhpcy50aW1pbmdzLmFuYWx5c2lzTXMudG9GaXhlZCgwKX0gbXNgO1xuICAgIHRoaXMuZGlzcGxheS50ZXh0Q29udGVudCA9IFtcbiAgICAgIGBmaWxhbWVudHMgJHtzLmZpbGFtZW50c30gKGJyYW5jaGVzICR7cy5icmFuY2hlc30pIMK3IHBvbHltZXIgJHsoKDEwMCAqIHMuaW5Qb2x5bWVyKSAvIHMuYWN0aW5Db3VudCkudG9GaXhlZCgxKX0lYCxcbiAgICAgIGBsZW5ndGggbWVhbiAke3MubWVhbkxlbmd0aC50b0ZpeGVkKDEpfSBtZWRpYW4gJHtzLm1lZGlhbkxlbmd0aH0gcDkwICR7cy5wOTBMZW5ndGh9IG1heCAke3MubWF4TGVuZ3RofWAsXG4gICAgICBgcG9seW1lciBhZ2UgbWVhbiAke3MubWVhblBvbHltZXJBZ2UudG9GaXhlZCgwKX0gbWF4ICR7cy5tYXhQb2x5bWVyQWdlLnRvRml4ZWQoMCl9IGZpeGVkIHN0ZXBzYCxcbiAgICAgIGBoaXN0IFsyfDMtNHw1LTh8OS0xNnwxNy0zMnwzMy02NHw2NStdICR7cy5oaXN0b2dyYW0uam9pbihcIiBcIil9YCxcbiAgICAgIGBib25kL3Jlc3QgJHtzLm1lZGlhbkJvbmRMZW5ndGgudG9GaXhlZCgyKX0gwrcgYmVuZCAke3MubWVkaWFuQmVuZEFuZ2xlLnRvRml4ZWQoMSl9wrAgwrcgYnJva2VuICR7cy5icm9rZW5MaW5rc30gwrcgY3ljbGVzICR7cy5jeWNsZXN9YCxcbiAgICAgIGBldmVudHMvc3RlcCAke09iamVjdC5lbnRyaWVzKHIpXG4gICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a306JHt2LnRvRml4ZWQoMyl9YClcbiAgICAgICAgLmpvaW4oXCIgXCIpfWAsXG4gICAgICBgeCBib3VuZHMgJHtjLmxlZnQudG9GaXhlZCgxKX3igJMke2MucmlnaHQudG9GaXhlZCgxKX0gwrcgbWF0ZXJpYWwgbWFya2VycyAke2MucmVhclgudG9GaXhlZCgxKX0vJHtjLmZyb250WC50b0ZpeGVkKDEpfSDCtyBjZW50cm9pZCAke2MuY2VudHJvaWRYLnRvRml4ZWQoMSl9LCR7Yy5jZW50cm9pZFkudG9GaXhlZCgxKX1gLFxuICAgICAgYGxlbmd0aCAke2MubGVuZ3RoLnRvRml4ZWQoMSl9IMK3IGFyZWEgJHtjLmFyZWEudG9GaXhlZCg2KX0gwrcgc3BhY2luZyBmcm9udC9yZWFyICR7Yy5mcm9udFNwYWNpbmcudG9GaXhlZCgyKX0vJHtjLnJlYXJTcGFjaW5nLnRvRml4ZWQoMil9YCxcbiAgICAgIHRoaXMud2VsbE1peGVkXG4gICAgICAgID8gYEcgcG9vbCAke3MuZ0FjdGluQW1vdW50fSAoJHtzLmdBY3RpbkNvbmNlbnRyYXRpb24udG9GaXhlZCgzKX0vcHjCsikgwrcgY3Jvc3NpbmcgYm9uZHMgJHtzLmNyb3NzaW5nRmlsYW1lbnRCb25kc31gXG4gICAgICAgIDogYGluc2lkZTogJHtzLmluc2lkZVBvbHltZXJCZWFkc30gRiArICR7cy5pbnNpZGVNb25vbWVyQmVhZHN9IEcgYmVhZHNgLFxuICAgICAgYGxlZ2FjeSBtYXJrZXIteCBoYWxmIHBvbHltZXIgJHtzLnBvc3RlcmlvclBvbHltZXJCZWFkc30gwrcgcmVhZGJhY2sgJHt0aGlzLnRpbWluZ3MucmVhZGJhY2tNcy50b0ZpeGVkKDEpfSBtcyDCtyB3b3JrZXIgcm91bmQgdHJpcCAke3RoaXMudGltaW5ncy53b3JrZXJSb3VuZFRyaXBNcy50b0ZpeGVkKDEpfSBtc2AsXG4gICAgXS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHNuYXBzaG90KGZyYW1lOiBudW1iZXIsIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICBjb25zdCBldmVyeSA9IE51bWJlcihuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwic25hcHNob3RFdmVyeVwiKSk7XG4gICAgaWYgKCFldmVyeSB8fCBmcmFtZSAlIGV2ZXJ5ICE9PSAwKSByZXR1cm47XG4gICAgY2FudmFzLnRvQmxvYigoYmxvYikgPT4gYmxvYiAmJiBmZXRjaChgL19fc25hcHNob3Q/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChgJHt0aGlzLnJ1bn0tJHtmcmFtZX1gKX1gLCB7IG1ldGhvZDogXCJQT1NUXCIsIGJvZHk6IGJsb2IgfSkpO1xuICB9XG59XG4iLCJcbmZ1bmN0aW9uIHRocm93RGV0ZWN0aW9uRXJyb3IoZXJyb3I6IHN0cmluZyk6IG5ldmVyIHtcbiAgY29uc3Qgbm90aWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIud2ViZ3B1LW5vdC1zdXBwb3J0ZWRcIik7XG4gIGlmIChub3RpY2UpIG5vdGljZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBpbml0aWFsaXplIFdlYkdQVTogXCIgKyBlcnJvcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0RGV2aWNlKFxuICBvcHRpb25zOiBHUFVSZXF1ZXN0QWRhcHRlck9wdGlvbnMgPSB7XG4gICAgcG93ZXJQcmVmZXJlbmNlOiBcImhpZ2gtcGVyZm9ybWFuY2VcIixcbiAgfSxcbiAgcmVxdWlyZWRGZWF0dXJlczogR1BVRmVhdHVyZU5hbWVbXSA9IFtdLFxuICByZXF1aXJlZExpbWl0czogUmVjb3JkPHN0cmluZywgdW5kZWZpbmVkIHwgbnVtYmVyPiA9IHtcbiAgICBtYXhTdG9yYWdlVGV4dHVyZXNQZXJTaGFkZXJTdGFnZTogOCxcbiAgfVxuKTogUHJvbWlzZTxHUFVEZXZpY2U+IHtcbiAgaWYgKCFuYXZpZ2F0b3IuZ3B1KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiV2ViR1BVIE5PVCBTdXBwb3J0ZWRcIik7XG5cbiAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIob3B0aW9ucyk7XG4gIGlmICghYWRhcHRlcikgdGhyb3dEZXRlY3Rpb25FcnJvcihcIk5vIEdQVSBhZGFwdGVyIGZvdW5kXCIpO1xuXG4gIGNvbnN0IGNhblRpbWVzdGFtcCA9IGFkYXB0ZXIuZmVhdHVyZXMuaGFzKFwidGltZXN0YW1wLXF1ZXJ5XCIpO1xuICBjb25zdCBmZWF0dXJlcyA9IFsuLi5yZXF1aXJlZEZlYXR1cmVzXTtcblxuICBpZiAoY2FuVGltZXN0YW1wKSB7XG4gICAgZmVhdHVyZXMucHVzaChcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgfVxuXG4gIC8vIEluc3RlYWQgb2YgcGFzc2luZyBhIHJlY29yZCB0aGF0IG1pZ2h0IGhhdmUgdW5kZWZpbmVkIHZhbHVlcywgZmlsdGVyIHRoZW0gb3V0OlxuICBjb25zdCBsaW1pdHMgPSBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMocmVxdWlyZWRMaW1pdHMpLmZpbHRlcigoW2tleSwgdmFsdWVdKSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSkgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcblxuICAvLyBUaGVuIHVzZSB0aGUgZmlsdGVyZWQgbGltaXRzIG9iamVjdDpcbiAgcmV0dXJuIGFkYXB0ZXIucmVxdWVzdERldmljZSh7XG4gICAgcmVxdWlyZWRGZWF0dXJlczogZmVhdHVyZXMsXG4gICAgcmVxdWlyZWRMaW1pdHM6IGxpbWl0cyxcbiAgICAuLi4oY2FuVGltZXN0YW1wID8gW1widGltZXN0YW1wLXF1ZXJ5XCJdIDogW10pLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZUNhbnZhcyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGlkOiBzdHJpbmcsXG4gIHNpemUgPSB7IHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCwgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfVxuKToge1xuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICBjb250ZXh0OiBHUFVDYW52YXNDb250ZXh0O1xuICBmb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQ7XG4gIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbn0ge1xuICBjb25zdCBjYW52YXMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksIHNpemUpO1xuICBjYW52YXMuaWQgPSBpZDtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdwdVwiKTtcbiAgaWYgKCFjb250ZXh0KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiQ2FudmFzIGRvZXMgbm90IHN1cHBvcnQgV2ViR1BVXCIpO1xuXG4gIGNvbnN0IGZvcm1hdCA9IG5hdmlnYXRvci5ncHUuZ2V0UHJlZmVycmVkQ2FudmFzRm9ybWF0KCk7XG4gIGNvbnRleHQuY29uZmlndXJlKHtcbiAgICBkZXZpY2U6IGRldmljZSxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICB1c2FnZTogR1BVVGV4dHVyZVVzYWdlLlJFTkRFUl9BVFRBQ0hNRU5ULFxuICAgIGFscGhhTW9kZTogXCJwcmVtdWx0aXBsaWVkXCIsXG4gIH0pO1xuXG4gIHJldHVybiB7IGNhbnZhczogY2FudmFzLCBjb250ZXh0OiBjb250ZXh0LCBmb3JtYXQ6IGZvcm1hdCwgc2l6ZTogc2l6ZSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2hhZGVyKGRldmljZTogR1BVRGV2aWNlLCBjb2RlOiBzdHJpbmcsIGluY2x1ZGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8R1BVU2hhZGVyTW9kdWxlPiB7XG4gIC8vIFByb2Nlc3MgdGhlIGNvZGUgd2l0aCBpbXBvcnRzXG4gIGNvbnN0IHByb2Nlc3NlZENvZGUgPSBwcmVwZW5kSW5jbHVkZXMoY29kZSwgaW5jbHVkZXMpO1xuXG4gIGNvbnN0IG1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoeyBjb2RlOiBwcm9jZXNzZWRDb2RlIH0pO1xuICBjb25zdCBpbmZvID0gYXdhaXQgbW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICBpZiAoaW5mby5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgbWVzc2FnZSBvZiBpbmZvLm1lc3NhZ2VzKSB7XG4gICAgICBjb25zb2xlLndhcm4oYCR7bWVzc2FnZS5tZXNzYWdlfSBcbiAgYXQgbGluZSAke21lc3NhZ2UubGluZU51bX1gKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgY29tcGlsZSBzaGFkZXJgKTtcbiAgfVxuICByZXR1cm4gbW9kdWxlO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaW1wb3J0IHN0YXRlbWVudHMgaW4gc2hhZGVyIGNvZGUgdG8gaW5jbHVkZSB0aGUgY29udGVudCBvZiByZWZlcmVuY2VkIG1vZHVsZXNcbiAqIEBwYXJhbSBjb2RlIC0gVGhlIHNoYWRlciBjb2RlIGNvbnRhaW5pbmcgaW1wb3J0IHN0YXRlbWVudHNcbiAqIEBwYXJhbSBpbmNsdWRlcyAtIE9wdGlvbmFsIG1hcHBpbmcgb2YgbW9kdWxlIG5hbWVzIHRvIHRoZWlyIGNvbnRlbnRcbiAqIEByZXR1cm5zIFRoZSBwcm9jZXNzZWQgc2hhZGVyIGNvZGUgd2l0aCBpbXBvcnRzIHJlc29sdmVkXG4gKi9cbmZ1bmN0aW9uIHByZXBlbmRJbmNsdWRlcyhjb2RlOiBzdHJpbmcsIGluY2x1ZGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IHN0cmluZyB7XG4gIC8vIEV4dHJhY3QgaW1wb3J0IHN0YXRlbWVudHNcbiAgY29uc3QgaW1wb3J0UmVnZXggPSAvXiNpbXBvcnRcXHMrKFthLXpBLVowLTlfXSspOjooW2EtekEtWjAtOV9dKykvZ207XG4gIGNvbnN0IGltcG9ydHMgPSBbLi4uY29kZS5tYXRjaEFsbChpbXBvcnRSZWdleCldO1xuXG4gIC8vIEJ1aWxkIGEgbWFwIG9mIGltcG9ydHMgdG8gdGhlaXIgY29udGVudFxuICBjb25zdCBpbmNsdWRlc1RvQWRkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgLy8gUHJvY2VzcyBlYWNoIGltcG9ydFxuICBmb3IgKGNvbnN0IFtmdWxsTWF0Y2gsIG5hbWVzcGFjZSwgbW9kdWxlTmFtZV0gb2YgaW1wb3J0cykge1xuICAgIGlmIChuYW1lc3BhY2UgPT09IFwiaW5jbHVkZXNcIiAmJiBpbmNsdWRlcyAmJiBtb2R1bGVOYW1lIGluIGluY2x1ZGVzKSB7XG4gICAgICBpbmNsdWRlc1RvQWRkW2Z1bGxNYXRjaF0gPSBpbmNsdWRlc1ttb2R1bGVOYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgcmVzb2x2ZSBpbXBvcnQ6ICR7ZnVsbE1hdGNofWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlcGxhY2UgaW1wb3J0IHN0YXRlbWVudHMgd2l0aCB0aGVpciBjb250ZW50XG4gIGxldCBwcm9jZXNzZWRDb2RlID0gY29kZTtcbiAgZm9yIChjb25zdCBbaW1wb3J0U3RhdGVtZW50LCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhpbmNsdWRlc1RvQWRkKSkge1xuICAgIC8vIFJlcGxhY2UgdGhlIGltcG9ydCBzdGF0ZW1lbnQgd2l0aCB0aGUgY29udGVudFxuICAgIHByb2Nlc3NlZENvZGUgPSBwcm9jZXNzZWRDb2RlLnJlcGxhY2UoaW1wb3J0U3RhdGVtZW50LCBjb250ZW50KTtcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzZWRDb2RlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGVyZm9ybWFuY2VRdWVyaWVzKGRldmljZTogR1BVRGV2aWNlKTogUHJvbWlzZTx7XG4gIHF1ZXJ5U2V0OiBHUFVRdWVyeVNldDtcbiAgcmVzb2x2ZUJ1ZmZlcjogR1BVQnVmZmVyO1xuICByZXN1bHRCdWZmZXI6IEdQVUJ1ZmZlcjtcbn0+IHtcbiAgY29uc3QgY2FuVGltZXN0YW1wID0gZGV2aWNlLmZlYXR1cmVzLmhhcyhcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgLy8gaWYgKCFjYW5UaW1lc3RhbXApIHtcbiAgLy8gICBjb25zb2xlLndhcm4oXCJUaW1lc3RhbXAgcXVlcmllcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGlzIGRldmljZS5cIik7XG4gIC8vICAgcmV0dXJuIHt9O1xuICAvLyB9XG4gIGNvbnN0IHF1ZXJ5U2V0ID0gZGV2aWNlLmNyZWF0ZVF1ZXJ5U2V0KHtcbiAgICB0eXBlOiBcInRpbWVzdGFtcFwiLFxuICAgIGNvdW50OiAyLFxuICB9KTtcblxuICBjb25zdCByZXNvbHZlQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgc2l6ZTogcXVlcnlTZXQuY291bnQgKiA4LFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5RVUVSWV9SRVNPTFZFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gIH0pO1xuXG4gIGNvbnN0IHJlc3VsdEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIHNpemU6IHJlc29sdmVCdWZmZXIuc2l6ZSxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCxcbiAgfSk7XG5cbiAgcmV0dXJuIHsgcXVlcnlTZXQsIHJlc29sdmVCdWZmZXIsIHJlc3VsdEJ1ZmZlciB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBJbnRlcmFjdGlvbnMoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgT2Zmc2NyZWVuQ2FudmFzLFxuICB0ZXh0dXJlOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0sXG4gIHNpemU6IG51bWJlciA9IDEwXG4pOiB7XG4gIGludGVyYWN0aW9uczoge1xuICAgIGRhdGE6IEZsb2F0MzJBcnJheTtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgfTtcbiAgY29udHJvbHM6IHtcbiAgICBkYXRhOiBBcnJheUJ1ZmZlcjtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgfTtcbiAgdHlwZTogR1BVQnVmZmVyQmluZGluZ1R5cGU7XG59IHtcbiAgbGV0IHVuaWZvcm1CdWZmZXJEYXRhID0gbmV3IEZsb2F0MzJBcnJheSg0KTtcbiAgbGV0IGNvbnRyb2xzQnVmZmVyRGF0YSA9IG5ldyBBcnJheUJ1ZmZlcigzMzYpO1xuXG4gIHZhciBzaWduID0gMTtcblxuICBsZXQgcG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IHZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XSk7XG4gIGlmIChjYW52YXMgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgIC8vIGRpc2FibGUgY29udGV4dCBtZW51XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBtb3ZlIGV2ZW50c1xuICAgIFtcIm1vdXNlbW92ZVwiLCBcInRvdWNobW92ZVwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBsZXQgY2xpZW50WCA9IDA7XG4gICAgICAgICAgbGV0IGNsaWVudFkgPSAwO1xuXG4gICAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xuICAgICAgICAgICAgY2xpZW50WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgICAgICBjbGllbnRZID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICBjbGllbnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgY2xpZW50WSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3NpdGlvbi54ID0gY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgICBwb3NpdGlvbi55ID0gY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgICAgLy8gU2NhbGUgZnJvbSBDU1MgcGl4ZWxzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXNcbiAgICAgICAgICBjb25zdCB4ID0gTWF0aC5mbG9vcigocG9zaXRpb24ueCAvIHJlY3Qud2lkdGgpICogdGV4dHVyZS53aWR0aCk7XG4gICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoKHBvc2l0aW9uLnkgLyByZWN0LmhlaWdodCkgKiB0ZXh0dXJlLmhlaWdodCk7XG5cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3gsIHldKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyB6b29tIGV2ZW50cyBUT0RPKEBnc3plcCkgYWRkIHBpbmNoIGFuZCBzY3JvbGwgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJ3aGVlbFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICBjYXNlIGV2ZW50IGluc3RhbmNlb2YgV2hlZWxFdmVudDpcbiAgICAgICAgICAgICAgdmVsb2NpdHkueCA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgdmVsb2NpdHkueSA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2l6ZSArPSB2ZWxvY2l0eS55O1xuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbc2l6ZV0sIDIpO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIGNsaWNrIGV2ZW50cyBUT0RPKEBnc3plcCkgaW1wbGVtZW50IHJpZ2h0IGNsaWNrIGVxdWl2YWxlbnQgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJtb3VzZWRvd25cIiwgXCJ0b3VjaHN0YXJ0XCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gMSAtIGV2ZW50LmJ1dHRvbjtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBUb3VjaEV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxID8gLTEgOiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3NpZ24gKiBzaXplXSwgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuICAgIFtcIm1vdXNldXBcIiwgXCJ0b3VjaGVuZFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtOYU5dLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdW5pZm9ybUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIGxhYmVsOiBcIkludGVyYWN0aW9uIEJ1ZmZlclwiLFxuICAgIHNpemU6IHVuaWZvcm1CdWZmZXJEYXRhLmJ5dGVMZW5ndGgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgY29uc3QgY29udHJvbHNCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJDb250cm9scyBCdWZmZXJcIixcbiAgICBzaXplOiBjb250cm9sc0J1ZmZlckRhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGludGVyYWN0aW9uczogeyBkYXRhOiB1bmlmb3JtQnVmZmVyRGF0YSwgYnVmZmVyOiB1bmlmb3JtQnVmZmVyIH0sXG4gICAgY29udHJvbHM6IHsgZGF0YTogY29udHJvbHNCdWZmZXJEYXRhLCBidWZmZXI6IGNvbnRyb2xzQnVmZmVyIH0sXG4gICAgdHlwZTogXCJ1bmlmb3JtXCIsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFRleHR1cmVzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYmluZGluZ3M6IG51bWJlcltdLFxuICBkYXRhOiB7IFtrZXk6IG51bWJlcl06IG51bWJlcltdW11bXSB9LFxuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9LFxuICBmb3JtYXQ/OiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmVGb3JtYXQgfVxuKToge1xuICBjYW52YXM6IHtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgICBkYXRhOiBVaW50MzJBcnJheTtcbiAgICB0eXBlOiBHUFVCdWZmZXJCaW5kaW5nVHlwZTtcbiAgfTtcbiAgdGV4dHVyZXM6IHsgW2tleTogbnVtYmVyXTogR1BVVGV4dHVyZSB9O1xuICBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9O1xuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9O1xufSB7XG4gIGNvbnN0IHRleHR1cmVzOiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmUgfSA9IHt9O1xuICBjb25zdCBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9ID0ge307XG4gIGNvbnN0IGRlcHRoT3JBcnJheUxheWVycyA9IHNpemUuZGVwdGhPckFycmF5TGF5ZXJzIHx8IHt9O1xuICBjb25zdCBERUZBVUxUX0ZPUk1BVCA9IFwicjMyZmxvYXRcIjtcblxuICBiaW5kaW5ncy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0ZXh0dXJlc1trZXldID0gZGV2aWNlLmNyZWF0ZVRleHR1cmUoe1xuICAgICAgdXNhZ2U6IEdQVVRleHR1cmVVc2FnZS5TVE9SQUdFX0JJTkRJTkcgfCBHUFVUZXh0dXJlVXNhZ2UuQ09QWV9EU1QsXG4gICAgICBmb3JtYXQ6IGZvcm1hdCAmJiBrZXkgaW4gZm9ybWF0ID8gZm9ybWF0W2tleV0gOiBERUZBVUxUX0ZPUk1BVCxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgIGRlcHRoT3JBcnJheUxheWVyczoga2V5IGluIGRlcHRoT3JBcnJheUxheWVycyA/IGRlcHRoT3JBcnJheUxheWVyc1trZXldIDogMSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKHRleHR1cmVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCBsYXllcnMgPSBrZXkgaW4gZGVwdGhPckFycmF5TGF5ZXJzID8gZGVwdGhPckFycmF5TGF5ZXJzW2tleV0gOiAxO1xuXG4gICAgYmluZGluZ0xheW91dFtrZXldID0ge1xuICAgICAgZm9ybWF0OiBmb3JtYXQgJiYga2V5IGluIGZvcm1hdCA/IGZvcm1hdFtrZXldIDogREVGQVVMVF9GT1JNQVQsXG4gICAgICBhY2Nlc3M6IFwicmVhZC13cml0ZVwiLFxuICAgICAgdmlld0RpbWVuc2lvbjogbGF5ZXJzID4gMSA/IFwiMmQtYXJyYXlcIiA6IFwiMmRcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYXJyYXkgPSBrZXkgaW4gZGF0YSA/IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbihkYXRhW2tleV0pKSA6IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZS53aWR0aCAqIHNpemUuaGVpZ2h0ICogbGF5ZXJzKTtcblxuICAgIGNvbnN0IGNoYW5uZWxzID0gY2hhbm5lbENvdW50KGJpbmRpbmdMYXlvdXRba2V5XS5mb3JtYXQpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZVRleHR1cmUoXG4gICAgICB7IHRleHR1cmU6IHRleHR1cmVzW2tleV0gfSxcbiAgICAgIC8qZGF0YT0qLyBhcnJheSxcbiAgICAgIC8qZGF0YUxheW91dD0qLyB7XG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgYnl0ZXNQZXJSb3c6IHNpemUud2lkdGggKiBhcnJheS5CWVRFU19QRVJfRUxFTUVOVCAqIGNoYW5uZWxzLFxuICAgICAgICByb3dzUGVySW1hZ2U6IHNpemUuaGVpZ2h0LFxuICAgICAgfSxcbiAgICAgIC8qc2l6ZT0qLyB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgICAgICBkZXB0aE9yQXJyYXlMYXllcnM6IGxheWVycyxcbiAgICAgIH1cbiAgICApO1xuICB9KTtcblxuICBsZXQgY2FudmFzRGF0YSA9IG5ldyBVaW50MzJBcnJheShbc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQsIDAsIDAsIDAsIDBdKTtcbiAgY29uc3QgY2FudmFzQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgbGFiZWw6IFwiQ2FudmFzIEJ1ZmZlclwiLFxuICAgIHNpemU6IGNhbnZhc0RhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoY2FudmFzQnVmZmVyLCAvKm9mZnNldD0qLyAwLCAvKmRhdGE9Ki8gY2FudmFzRGF0YSk7XG5cbiAgcmV0dXJuIHtcbiAgICBjYW52YXM6IHtcbiAgICAgIGJ1ZmZlcjogY2FudmFzQnVmZmVyLFxuICAgICAgZGF0YTogY2FudmFzRGF0YSxcbiAgICAgIHR5cGU6IFwidW5pZm9ybVwiLFxuICAgIH0sXG4gICAgdGV4dHVyZXM6IHRleHR1cmVzLFxuICAgIGJpbmRpbmdMYXlvdXQ6IGJpbmRpbmdMYXlvdXQsXG4gICAgc2l6ZTogc2l6ZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2hhbm5lbENvdW50KGZvcm1hdDogR1BVVGV4dHVyZUZvcm1hdCk6IG51bWJlciB7XG4gIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ2JhXCIpKSB7XG4gICAgcmV0dXJuIDQ7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdiXCIpKSB7XG4gICAgcmV0dXJuIDM7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdcIikpIHtcbiAgICByZXR1cm4gMjtcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyXCIpKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXQ6IFwiICsgZm9ybWF0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuKG5lc3RlZEFycmF5OiBudW1iZXJbXVtdW10pOiBudW1iZXJbXSB7XG4gIGNvbnN0IGZsYXR0ZW5lZDogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgayA9IDA7IGsgPCBuZXN0ZWRBcnJheVswXVswXS5sZW5ndGg7IGsrKykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmVzdGVkQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbmVzdGVkQXJyYXlbMF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZmxhdHRlbmVkLnB1c2gobmVzdGVkQXJyYXlbaV1bal1ba10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmbGF0dGVuZWQ7XG59XG5cbmZ1bmN0aW9uIHplcm9zKGhlaWdodDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBsYXllcnM6IG51bWJlciA9IDEpOiBudW1iZXJbXVtdW10ge1xuICBjb25zdCB6ZXJvQXJyYXk6IG51bWJlcltdW11bXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICBjb25zdCByb3c6IG51bWJlcltdW10gPSBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgIGNvbnN0IGxheWVyOiBudW1iZXJbXSA9IFtdO1xuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBsYXllcnM7IGsrKykge1xuICAgICAgICBsYXllci5wdXNoKDApO1xuICAgICAgfVxuICAgICAgcm93LnB1c2gobGF5ZXIpO1xuICAgIH1cbiAgICB6ZXJvQXJyYXkucHVzaChyb3cpO1xuICB9XG5cbiAgcmV0dXJuIHplcm9BcnJheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbVZhbHVlcyhsZW5ndGg6IG51bWJlciwgcmFuZG9tPzogKCkgPT4gbnVtYmVyKTogVWludDMyQXJyYXkge1xuICAvLyBmYXN0IGNwdS1zaWRlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdGlvblxuXG4gIGNvbnN0IG1heENodW5rTGVuZ3RoID0gNjU1MzYgLyA0O1xuICBjb25zdCByZXN1bHQgPSBuZXcgVWludDMyQXJyYXkoNCAqIGxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNCAqIGxlbmd0aDsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIGNvbnN0IGNodW5rTGVuZ3RoID0gTWF0aC5taW4obWF4Q2h1bmtMZW5ndGgsIDQgKiBsZW5ndGggLSBpKTtcbiAgICBpZiAocmFuZG9tKSB7XG4gICAgICBmb3IgKGxldCBqID0gaTsgaiA8IE1hdGgubWluKGkgKyBjaHVua0xlbmd0aCwgcmVzdWx0Lmxlbmd0aCk7IGorKykgcmVzdWx0W2pdID0gTWF0aC5mbG9vcihyYW5kb20oKSAqIDQyOTQ5NjcyOTYpO1xuICAgIH0gZWxzZSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJlc3VsdC5zdWJhcnJheShpLCBpICsgY2h1bmtMZW5ndGgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY2xhc3MgUGVyZm9ybWFuY2VNb25pdG9yIHtcbiAgcHJpdmF0ZSBsYXN0VGltZTogbnVtYmVyO1xuICBwcml2YXRlIGZyYW1lQ291bnQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBmcmFtZXNQZXJUaW1lTG9nOiBudW1iZXI7XG4gIHByaXZhdGUgZnBzRGlzcGxheTogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZnJhbWVzUGVyVGltZUxvZzogbnVtYmVyID0gMzApIHtcbiAgICB0aGlzLmZyYW1lc1BlclRpbWVMb2cgPSBmcmFtZXNQZXJUaW1lTG9nO1xuICAgIHRoaXMuZnBzRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSE7XG4gICAgdGhpcy5sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuZnJhbWVDb3VudCA9IDA7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKHRpbWU6IG51bWJlcikge1xuICAgIGlmICh0aW1lICUgdGhpcy5mcmFtZXNQZXJUaW1lTG9nID09PSAwKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgY29uc3QgdGltZUVsYXBzZWQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWU7XG5cbiAgICAgIC8vIEZQUyBDYWxjdWxhdGlvblxuICAgICAgY29uc3QgZnBzID0gTWF0aC5yb3VuZCgodGhpcy5mcmFtZUNvdW50ICogMTAwMCkgLyB0aW1lRWxhcHNlZCk7XG4gICAgICB0aGlzLmZwc0Rpc3BsYXkudGV4dENvbnRlbnQgPSBgRlBTOiAke2Zwc31gO1xuXG4gICAgICAvLyBSZXNldCBjb3VudGVyc1xuICAgICAgdGhpcy5mcmFtZUNvdW50ID0gMDtcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICB9XG4gICAgdGhpcy5mcmFtZUNvdW50Kys7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==