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
/* harmony export */   polygonLoops: () => (/* binding */ polygonLoops),
/* harmony export */   polygonOccupancy: () => (/* binding */ polygonOccupancy)
/* harmony export */ });
// Conservative y-band edge index. Predicates remain exact; long edges are
// retained in a global list and long bond queries fall back to all edges.
// No boundary/collision is discarded to improve diagnostic latency.
// With `links: true` adjacency comes from the membrane `tail` links (word 6)
// instead of index order, so fusion/scission can re-link the same buffer into
// several closed loops. Degenerate self-links and links without a destination
// vertex carry no edge and are skipped; every edge that exists is indexed.
const BAND = 4;
const TAIL_WORD = 6; // segment word 6 holds `tail`: the next vertex along the ring
const HEAD_WORD = 7; // segment word 7 holds `head`: the previous vertex along the ring
function edgeIndex(membrane, stride, reverse = false, options) {
    const n = membrane.length / stride;
    const linked = options?.links ? new Uint32Array(membrane.buffer, membrane.byteOffset, membrane.length) : null;
    const edges = [], rows = new Map(), wide = [];
    for (let i = 0; i < n; i++) {
        const j = linked ? linked[i * stride + TAIL_WORD] : (i + (reverse ? n - 1 : 1)) % n;
        if (linked && (j === i || j >= n))
            continue; // free vertex or dead link: no edge to index
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
function polygonOccupancy(membrane, stride = 10, exact = false, options) {
    const { rows, wide } = edgeIndex(membrane, stride, true, options);
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
function polygonBondCrossing(membrane, stride = 10, options) {
    const { edges, rows, wide } = edgeIndex(membrane, stride, false, options);
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
// Topology of a link-followed membrane, always read from the tail links (word
// 6) since fusion/scission can re-link the buffer into several closed loops.
// Inner loops wind opposite to the outer one, so their signed areas subtract.
// Degenerate self-links and links without a destination vertex carry no edge:
// a self-link is a free vertex in no loop, while a dead link counts as broken
// and never joins a loop. Walks stop at visited vertices, so broken topology
// cannot loop forever or count a chain twice.
function polygonLoops(membrane, stride = 10, count = membrane.length / stride) {
    const words = new Uint32Array(membrane.buffer, membrane.byteOffset, membrane.length);
    const visited = new Uint8Array(count);
    const loopAreas = [];
    let brokenLinks = 0;
    for (let i = 0; i < count; i++) {
        const tail = words[i * stride + TAIL_WORD];
        const head = words[i * stride + HEAD_WORD];
        // out-of-range links read as undefined, so dead links count as broken
        if (words[tail * stride + HEAD_WORD] !== i || words[head * stride + TAIL_WORD] !== i)
            brokenLinks++;
        if (visited[i] || tail === i || tail >= count)
            continue;
        // follow tail links once per loop, until the walk closes back on i
        let current = i;
        let vertices = 0;
        let shoelace = 0;
        let closed = false;
        for (;;) {
            visited[current] = 1;
            const next = words[current * stride + TAIL_WORD];
            if (next === current || next >= count)
                break;
            shoelace += membrane[current * stride + 2] * membrane[next * stride + 3] - membrane[next * stride + 2] * membrane[current * stride + 3];
            vertices++;
            if (next === i) {
                closed = true;
                break;
            }
            if (visited[next])
                break;
            current = next;
        }
        if (closed)
            loopAreas.push({ vertices, area: shoelace / 2 });
    }
    loopAreas.sort((a, b) => Math.abs(b.area) - Math.abs(a.area));
    return { loops: loopAreas.length, brokenLinks, loopAreas };
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
    output;
    // `glide` is the time constant, in seconds, with which the view moves to the framed region.
    view = { mode: 1, zoom: 3, focus: 0.15, contrast: 1.2, chroma: 0.45, grain: 0.6, follow: true, autoFit: true, preyStain: 0, glide: 0.085, tight: false };
    rendered = 0;
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
        // `tight` is for stills without page furniture: the framed region fills the image.
        if (this.view.tight)
            return Math.max(0.2, Math.min(8, (window.innerWidth * 0.94) / this.extent.width, (window.innerHeight * 0.94) / this.extent.height));
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
    outputScale() {
        return { x: (this.view.zoom * this.output.width) / window.innerWidth, y: (this.view.zoom * this.output.height) / window.innerHeight };
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
    OUTPUT_WORKGROUP_COUNT;
    constructor(device, canvasFormat, canvasSize, renderShader, textures, sharedLayoutEntries, sharedBindGroupEntries, geometry, externalSpecimen, outputSize = canvasSize) {
        this.device = device;
        this.canvasFormat = canvasFormat;
        this.size = canvasSize;
        this.output = outputSize;
        this.camera = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
        this.cameraTarget = { ...this.camera };
        this.TEXTURE_WORKGROUP_COUNT = [Math.ceil(textures.size.width / 16), Math.ceil(textures.size.height / 16)];
        this.OUTPUT_WORKGROUP_COUNT = [Math.ceil(outputSize.width / 16), Math.ceil(outputSize.height / 16)];
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
            size: [outputSize.width, outputSize.height],
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
        // The same glide at any frame rate.
        const now = performance.now(), ease = 1 - Math.exp(-Math.min(0.25, Math.max(0.001, (now - this.rendered) / 1000)) / this.view.glide);
        this.rendered = now;
        if (this.view.mode && this.view.autoFit)
            this.view.zoom += ease * (this.fittedZoom() - this.view.zoom);
        if (this.view.mode && this.view.follow) {
            this.camera.x += ease * (this.cameraTarget.x - this.camera.x);
            this.camera.y += ease * (this.cameraTarget.y - this.camera.y);
        }
        const viewData = new ArrayBuffer(48), f = new Float32Array(viewData), u = new Uint32Array(viewData);
        f.set([this.camera.x, this.camera.y, this.view.zoom]);
        u[3] = this.view.mode;
        f.set([this.view.focus, this.view.contrast, this.view.chroma, this.view.grain], 4);
        const scale = this.outputScale();
        f.set([scale.x, scale.y, this.view.preyStain], 8);
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
        passCompute.dispatchWorkgroups(...this.OUTPUT_WORKGROUP_COUNT);
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
    // The rendered image as pixels, read back from the GPU. Unlike drawing the canvas into
    // another canvas, this does not depend on how the browser presents WebGPU canvases.
    async readPixels() {
        const { width, height } = this.output, bytesPerRow = Math.ceil((width * 4) / 256) * 256, staging = this.device.createBuffer({ size: bytesPerRow * height, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
        try {
            const encoder = this.device.createCommandEncoder();
            encoder.copyTextureToBuffer({ texture: this.intermediateTexture }, { buffer: staging, bytesPerRow }, [width, height]);
            this.device.queue.submit([encoder.finish()]);
            await staging.mapAsync(GPUMapMode.READ);
            const padded = new Uint8Array(staging.getMappedRange()), data = new Uint8ClampedArray(width * height * 4);
            for (let y = 0; y < height; y++)
                data.set(padded.subarray(y * bytesPerRow, y * bytesPerRow + width * 4), y * width * 4);
            return new ImageData(data, width, height);
        }
        finally {
            staging.destroy();
        }
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

module.exports = "// Coarse-grained, transient contractile crosslinks between EXPLICIT actin beads.\n// Shortening a link represents motor work; it is not an ATP cycle or a prediction\n// of molecular stepping. Each force has an equal and opposite partner. Snapshots\n// and fixed-point scatter accumulation prevent read/write races in these passes.\nconst MOTOR_SLOTS = 256u;\nconst FORCE_SCALE = 65536.0;\nstruct MechanicalSnapshot {\n  position: vec2<f32>,\n  orientation: vec2<f32>,\n  head: u32,\n  tail: u32,\n  attached: u32,\n  unused: u32,\n}\nstruct MechanicalLink {\n  a: u32, // actin index + 1, zero means unbound\n  b: u32,\n  rest: f32,\n  age: u32,\n  headA: u32,\n  tailA: u32,\n  headB: u32,\n  tailB: u32,\n}\nstruct MechanicalForce { x: atomic<i32>, y: atomic<i32> }\n@group(GROUP_INDEX) @binding(MECHANICAL_SNAPSHOT)\nvar<storage, read_write> mechanical_snapshot: array<MechanicalSnapshot>;\n@group(GROUP_INDEX) @binding(MECHANICAL_LINKS)\nvar<storage, read_write> mechanical_links: array<MechanicalLink>;\n@group(GROUP_INDEX) @binding(MECHANICAL_FORCES)\nvar<storage, read_write> mechanical_forces: array<MechanicalForce>;\n\nfn add_mechanical_force(i: u32, f: vec2<f32>) {\n  atomicAdd(&mechanical_forces[i].x, i32(round(f.x * FORCE_SCALE)));\n  atomicAdd(&mechanical_forces[i].y, i32(round(f.y * FORCE_SCALE)));\n}\n\n// Legacy mode uses a selected material vertex; renewal mode uses a persistent\n// cell-centred direction. Both prescribe polarity, not spontaneous biochemical\n// polarization or a translational steering force.\nfn cue_slot() -> u32 { return controls.actinCount + controls.membraneCount + 1u; }\nfn front_index() -> u32 { return mechanical_snapshot[cue_slot()].head; }\nfn front_arc() -> f32 { return f32(front_index()) / f32(controls.membraneCount); }\nfn polarity_axis() -> vec2<f32> {\n  let p = mechanical_snapshot[cue_slot()].orientation;\n  return select(vec2<f32>(1.0, 0.0), p, dot(p,p) > 0.5);\n}\nfn cell_center() -> vec2<f32> { return mechanical_snapshot[enclosure_slot()].position; }\nfn front_coordinate(p: vec2<f32>, material_arc: f32) -> f32 {\n  if (controls.polarityMode == 0u) { return fract(material_arc - front_arc()); }\n  let radial = normalize_safely(p - cell_center());\n  let axis = polarity_axis();\n  return fract(atan2(cross2(axis, radial), dot(axis, radial)) / (2.0 * PI) + 1.0);\n}\n\n@compute @workgroup_size(1)\nfn resolve_front_cue() {\n  var nearest = 0u;\n  if (controls.polarityMode != 0u) {\n    var state = mechanical_snapshot[cue_slot()];\n    let initialized = dot(state.orientation,state.orientation) > 0.5;\n    var axis = select(vec2<f32>(1.0,0.0),state.orientation,initialized);\n    var goalDirection = vec2<f32>(bitcast<f32>(state.attached),bitcast<f32>(state.unused));\n    if (!initialized || state.tail != controls.cueVersion) {\n      goalDirection = vec2<f32>(1.0,0.0);\n      if (controls.cueEnabled != 0u) {\n        goalDirection=axis;\n        if(distance(controls.cueTarget,cell_center()) > 1e-4) {goalDirection = normalize_safely(controls.cueTarget-cell_center());}\n      }\n    }\n    let angle = atan2(cross2(axis,goalDirection),dot(axis,goalDirection));\n    axis = rotate(axis,clamp(angle,-controls.polarityTurnRate,controls.polarityTurnRate));\n    var furthest = -1e30;\n    // the plasma and phagosome membrane only; the nucleus vertices are the last ones\n    for (var i=0u;i<nucleus_start();i++) {\n      let projection=dot(membrane[i].position-cell_center(),axis);\n      if(projection>furthest){furthest=projection;nearest=i;}\n    }\n    state.orientation=axis;state.attached=bitcast<u32>(goalDirection.x);state.unused=bitcast<u32>(goalDirection.y);\n    state.head=nearest;state.tail=controls.cueVersion;state.position=membrane[nearest].position;\n    mechanical_snapshot[cue_slot()]=state;\n    return;\n  }\n  if (controls.cueEnabled != 0u) {\n    var distance_squared = 1e30;\n    for (var i = 0u; i < nucleus_start(); i++) {\n      let delta = membrane[i].position - controls.cueTarget;\n      let d = dot(delta, delta);\n      if (d < distance_squared) { distance_squared = d; nearest = i; }\n    }\n  }\n  // Selection only: no position, force, or velocity is written to the cell.\n  mechanical_snapshot[cue_slot()].head = nearest;\n  mechanical_snapshot[cue_slot()].tail = controls.cueVersion;\n  mechanical_snapshot[cue_slot()].position = membrane[nearest].position;\n  mechanical_snapshot[cue_slot()].orientation = vec2<f32>(0.0);\n}\n\n@compute @workgroup_size(1)\nfn draw_resolved_cue() {\n  if (controls.cueEnabled == 0u && controls.polarityMode == 0u) { return; }\n  let p = membrane[front_index()].position;\n  mechanical_snapshot[cue_slot()].position = p;\n  for (var y = -3; y <= 3; y++) {\n    for (var x = -3; x <= 3; x++) {\n      if (x*x+y*y<=9) { store_texture(parameter_fields, DEBUG, as_vec2i(p)+vec2<i32>(x,y), 8.0); }\n    }\n  }\n  if (controls.polarityMode != 0u) {\n    for (var t=0.0;t<=10.0;t+=1.0) {store_texture(parameter_fields,DEBUG,as_vec2i(p+polarity_axis()*t),8.0);}\n  }\n}\n\nfn front_fraction(p: vec2<f32>) -> f32 {\n  if (controls.polarityMode != 0u) {\n    let radius=sqrt(max(1.0,mechanical_snapshot[enclosure_slot()].orientation.x)/PI);\n    return clamp(0.5+0.5*dot(p-cell_center(),polarity_axis())/radius,0.0,1.0);\n  }\n  let n = controls.actinCount;\n  let i = front_index();\n  let rear = mechanical_snapshot[n + (i + controls.membraneCount / 2u) % controls.membraneCount].position;\n  let front = mechanical_snapshot[n + i].position;\n  let axis = front - rear;\n  return clamp(dot(p - rear, axis) / max(dot(axis, axis), 1.0), 0.0, 1.0);\n}\nfn rear_maturity(p: vec2<f32>, age: f32) -> f32 {\n  let rear=1.0-smoothstep(0.3,0.7,front_fraction(p));\n  let scale=max(1.0,controls.turnoverAge);\n  return rear*smoothstep(scale,2.0*scale,age);\n}\nfn growing_head(s: Segment) -> bool {\n  return is_head(s) && s.subtype != FILOPODIAL_ACTIN && (controls.rearTurnover <= 0.0 || rear_maturity(s.position,s.age) < 0.5);\n}\n\nfn same_actin(i: u32, h: u32, t: u32) -> bool {\n  let s = mechanical_snapshot[i];\n  return s.attached == 1u && s.head == h && s.tail == t;\n}\n\n@compute @workgroup_size(WGSZ)\nfn snapshot_mechanics(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  let n = controls.actinCount;\n  if (i >= n + controls.membraneCount) { return; }\n  var s: Segment;\n  if (i < n) { s = actines[i]; } else { s = membrane[i - n]; }\n  mechanical_snapshot[i] = MechanicalSnapshot(s.position, s.orientation, s.head, s.tail,\n    select(0u, 1u, s.head != s.id || s.tail != s.id), bitcast<u32>(s.age));\n  atomicStore(&mechanical_forces[i].x, 0);\n  atomicStore(&mechanical_forces[i].y, 0);\n}\n\n@compute @workgroup_size(WGSZ)\nfn motor_links(@builtin(global_invocation_id) id: vec3u) {\n  let slot = id.x;\n  if (slot >= MOTOR_SLOTS) { return; }\n  let rng = controls.actinCount + controls.membraneCount + slot;\n  if (controls.myosinStrength <= 0.0) { mechanical_links[slot].a = 0u; return; }\n  var link = mechanical_links[slot];\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let b = link.b - 1u;\n    if (!same_actin(a, link.headA, link.tailA) || !same_actin(b, link.headB, link.tailB) ||\n        link.age >= 300u || distance(mechanical_snapshot[a].position, mechanical_snapshot[b].position) > 24.0) {\n      link.a = 0u;\n    }\n  }\n  if (link.a == 0u) {\n    // Bounded search. No teleportation or global pull: a motor must find two\n    // nearby polymerized beads, on different local filament segments.\n    for (var trial = 0u; trial < 24u; trial++) {\n      let a = min(u32(random_uniform(rng) * f32(controls.actinCount)), controls.actinCount - 1u);\n      let sa = mechanical_snapshot[a];\n      if (sa.attached == 0u || random_uniform(rng) < front_fraction(sa.position)) { continue; }\n      if (controls.motorRearBias > 0.0 && random_uniform(rng) > mix(1.0,rear_maturity(sa.position,bitcast<f32>(sa.unused)),controls.motorRearBias)) { continue; }\n      let theta = random_uniform(rng) * 2.0 * PI;\n      let radius = 3.0 + random_uniform(rng) * 9.0;\n      let q = as_vec2i(sa.position + radius * vec2<f32>(cos(theta), sin(theta)));\n      let signal = load_texture_index(POLYMER_INDEX, q);\n      if (signal == 0u || signal > controls.actinCount) { continue; }\n      let b = signal - 1u;\n      let sb = mechanical_snapshot[b];\n      let d = distance(sa.position, sb.position);\n      if (a == b || b == sa.head || b == sa.tail || a == sb.head || a == sb.tail ||\n          sb.attached == 0u || any(as_vec2i(sb.position) != q) || d < 3.0 || d > 12.0 ||\n          dot(sa.orientation, sb.orientation) > 0.5) { continue; }\n      link = MechanicalLink(a + 1u, b + 1u, d, 0u, sa.head, sa.tail, sb.head, sb.tail);\n      break;\n    }\n  }\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let b = link.b - 1u;\n    let offset = mechanical_snapshot[b].position - mechanical_snapshot[a].position;\n    let d = length(offset);\n    let activation=mix(1.0,0.5*(rear_maturity(mechanical_snapshot[a].position,bitcast<f32>(mechanical_snapshot[a].unused))+\n      rear_maturity(mechanical_snapshot[b].position,bitcast<f32>(mechanical_snapshot[b].unused))),controls.motorRearBias);\n    link.rest = max(2.0, link.rest - controls.myosinSpeed * activation);\n    let f = normalize_safely(offset) * min(0.1, controls.myosinStrength * activation * max(0.0, d - link.rest));\n    add_mechanical_force(a, f);\n    add_mechanical_force(b, -f);\n    link.age++;\n  }\n  mechanical_links[slot] = link;\n}\n\n@compute @workgroup_size(WGSZ)\nfn membrane_tethers(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.membraneCount) { return; }\n  let slot = MOTOR_SLOTS + i;\n  if (controls.membraneCoupling <= 0.0) { mechanical_links[slot].a = 0u; mechanical_links[slot].age = 0u; return; }\n  let m = controls.actinCount + i;\n  let p = mechanical_snapshot[m].position;\n  var link = mechanical_links[slot];\n  let rng = controls.actinCount + i;\n  if (link.a > 0u) {\n    let extension=distance(mechanical_snapshot[link.a - 1u].position,p);\n    var detach = !same_actin(link.a - 1u, link.headA, link.tailA) || link.age >= 600u || extension > 24.0;\n    if (controls.tetherTurnover != 0u) {\n      let hazard=controls.tetherOffRate+controls.tetherLoadOff*max(0.0,extension-link.rest);\n      detach = detach || random_uniform(rng) < 1.0-exp(-hazard);\n    }\n    if (detach) {\n      link.a=0u;\n      if (controls.tetherTurnover != 0u) {\n        link.age=controls.tetherRecoverySteps;\n        mechanical_links[slot]=link;\n        atomicAdd(&telemetry[TELEMETRY_TETHER_RELEASED],1u);\n        return;\n      }\n    }\n  }\n  if (link.a == 0u) {\n    if (controls.tetherTurnover != 0u) {\n      if (link.age>0u) {link.age--;mechanical_links[slot]=link;return;}\n      if (random_uniform(rng) >= controls.tetherOnRate) { return; }\n    }\n    var best = 13.0;\n    // Deterministic local search over the current polymer index. A tether binds\n    // slack at the observed distance and becomes tensile only after separation.\n    for (var dy = -12; dy <= 12; dy += 2) {\n      for (var dx = -12; dx <= 12; dx += 2) {\n        let q = as_vec2i(p) + vec2<i32>(dx, dy);\n        let signal = load_texture_index(POLYMER_INDEX, q);\n        if (signal == 0u || signal > controls.actinCount) { continue; }\n        let a = signal - 1u;\n        let s = mechanical_snapshot[a];\n        let d = distance(p, s.position);\n        if (s.attached == 1u && all(as_vec2i(s.position) == q) && d < best) {\n          best = d;\n          link = MechanicalLink(a + 1u, 0u, d, 0u, s.head, s.tail, 0u, 0u);\n        }\n      }\n    }\n  }\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let offset = mechanical_snapshot[a].position - p;\n    let f = normalize_safely(offset) * min(0.1, controls.membraneCoupling * max(0.0, length(offset) - link.rest));\n    add_mechanical_force(m, f);\n    add_mechanical_force(a, -f);\n    link.age++;\n  }\n  mechanical_links[slot] = link;\n}\n\n@compute @workgroup_size(WGSZ)\nfn apply_mechanical_forces(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.actinCount + controls.membraneCount) { return; }\n  let force = vec2<f32>(f32(atomicLoad(&mechanical_forces[i].x)), f32(atomicLoad(&mechanical_forces[i].y))) / FORCE_SCALE;\n  if (i < controls.actinCount) {\n    // Effective clutch resistance to the added forces, strongest at the front.\n    // The original positional solver is otherwise unchanged; no force-free\n    // hydrodynamics or full focal-adhesion dynamics are implied.\n    let mobility = 1.0 / (1.0 + controls.substrateDrag * front_fraction(mechanical_snapshot[i].position));\n    actines[i].position += mobility * force;\n  } else { membrane[i - controls.actinCount].position += force; }\n}\n\n@compute @workgroup_size(WGSZ)\nfn draw_mechanical_links(@builtin(global_invocation_id) id: vec3u) {\n  let slot = id.x;\n  if (slot >= MOTOR_SLOTS + controls.membraneCount) { return; }\n  let link = mechanical_links[slot];\n  if (link.a == 0u) { return; }\n  let a = actines[link.a - 1u].position;\n  var b: vec2<f32>;\n  var color = 6.0;\n  if (slot < MOTOR_SLOTS) { b = actines[link.b - 1u].position; }\n  else { b = membrane[slot - MOTOR_SLOTS].position; color = 7.0; }\n  let d = distance(a, b);\n  for (var t = 0.0; t <= min(d, 24.0); t += 0.8) {\n    store_texture(parameter_fields, DEBUG, as_vec2i(mix(a, b, t / max(d, 0.01))), color);\n  }\n}\n";

/***/ }),

/***/ "./src/shaders/includes/bindings.wgsl":
/*!********************************************!*\
  !*** ./src/shaders/includes/bindings.wgsl ***!
  \********************************************/
/***/ ((module) => {

module.exports = "const GROUP_INDEX = 0;\n\nconst CANVAS = 0;\nconst CONTROLS = 1;\nconst INTERACTIONS = 2;\n\nconst INDEX = 3;\nconst SEGMENT_INDEX = 0;\nconst ACTIN_INDEX = 1;\nconst HEAD_INDEX = 2; // filament plus ends, written at the spot where they take up a monomer\nconst POLYMER_INDEX = 3; // filament actins, for their repulsion; branches nucleate on the interior ones\n\n\nconst STERIC_POTENTIAL = 4;\nconst STERIC_POTENTIAL_DIM = 3;\nconst STIGMERGYMONOMER = 0;\nconst STIGMERGYPOLYMER = 1;\nconst STIGMERGYMEMBRANE = 2;\n\nconst PARAMETER_FIELDS = 5;\nconst DEBUG = 0;\nconst CONNECTION_PROBABILITY = 1;\nconst RECENCY = 2;\n// second polymerization field, emitted by the front of the membrane: filaments there grow and also branch\nconst LAMELLIPODIUM = 3;\nconst G_ACTIN_COMPARTMENT = 4; // visualization mask only, not a transported concentration field\nconst ACTIN_AGE = 5; // visualization only; actual bead age, not a diffusing field\n\nconst RANDOM = 6;\nconst MEMBRANE = 7;\nconst ACTIN = 8;\nconst CONNECTION_LOCKS = 9;\nconst TELEMETRY = 12;\nconst MECHANICAL_SNAPSHOT = 13;\nconst MECHANICAL_LINKS = 14;\nconst MECHANICAL_FORCES = 15;\n\nconst BINDING_INTERMEDIATE_TEXTURE = 10;\n\n\nconst MAX_SPROUT_SITES = 8;\n\n// TODO: maybe put elsewhere, but best place for now\n// Define the Controls struct matching TypeScript layout\nstruct Controls {    \n    membraneCount: u32,        // offset 0, size 4, align 4\n    actinCount: u32,           // offset 4, size 4, align 4\n    stiffness: f32,     // offset 8, size 4, align 4\n    foodNearbyThreshold: f32,     // offset 12, size 4, align 4\n    disconnection_probability: f32,          // offset 16, size 4, align 4\n    polymerRepulsion: f32,        // offset 20, size 4, align 4\n    steric_sampling_range: i32,// offset 24, size 4, align 4\n    actinCohesionRange: i32,   // offset 28, size 4, align 4\n    bindProb: f32,            // offset 32, size 4, align 4\n    bindLengthSaturation: u32,     // offset 36, size 4, align 4\n    actinStericForce: f32,                // offset 40, size 4, align 4\n    equilibrium_line_distance: f32,     // offset 44, size 4, align 4\n    bindLengthFloor: u32,     // offset 48, size 4, align 4\n    movementMode: u32,        // offset 52, size 4, align 4\n    monomerMembraneRepulsion: f32,    // offset 56, size 4, align 4\n    membraneStiffness: f32,           // offset 60, size 4, align 4\n    monomerOpacity: f32,              // offset 64\n    gActinField: u32,                 // offset 68: finite, well-mixed monomer reservoir\n    polymerizationPatchSize: f32,     // offset 72, size 4, align 4\n    membraneRestLength: f32,          // offset 76, size 4, align 4\n    sproutSites: array<vec4<f32>, MAX_SPROUT_SITES>, // offset 80, size 128, align 16\n    membraneSmoothing: f32,           // offset 208, size 4, align 4\n    areaConservation: f32,             // offset 212: imposed 2-D volume surrogate\n    polymerizationFieldDecay: f32,    // offset 216, size 4, align 4\n    membraneFlow: f32,                // offset 220, size 4, align 4\n    lamellipodiumStrength: f32,       // offset 224, size 4, align 4\n    lamellipodiumWidth: f32,          // offset 228, size 4, align 4\n    lamellipodiumFieldDecay: f32,     // offset 232, size 4, align 4\n    branchProbability: f32,           // offset 236, size 4, align 4\n    debranchProbability: f32,         // offset 240, size 4, align 4\n    actinBendStiffness: f32,          // offset 244, size 4, align 4\n    stericSelfNeighbors: u32,         // offset 248, size 4, align 4\n    myosinStrength: f32,              // offset 252\n    myosinSpeed: f32,                 // offset 256\n    membraneCoupling: f32,            // offset 260\n    substrateDrag: f32,               // offset 264\n    cortexPolymerization: f32,         // offset 268; optional basal cortical assembly\n    cueTarget: vec2<f32>,              // offset 272: world-space pointer cue\n    cueEnabled: u32,                   // offset 280\n    cueVersion: u32,                   // offset 284, applied input version for diagnostics\n    polarityMode: u32,                 // 288: persistent cell-centred vector\n    polarityTurnRate: f32,             // 292: radians per fixed step\n    rearTurnover: f32,                 // 296: extra aged-rear end loss probability\n    turnoverAge: f32,                  // 300: maturation scale in fixed steps\n    tetherTurnover: u32,               // 304: finite binding and unbound dwell\n    tetherOnRate: f32,                 // 308\n    tetherOffRate: f32,                // 312\n    tetherRecoverySteps: u32,          // 316\n    motorRearBias: f32,                // 320: age/rear activation weight\n    frontAlignment: f32,              // 324: initial filament orientation bias\n    tetherLoadOff: f32,                // 328: extension-dependent detachment\n    colourAge: u32,                    // 332: yellow young -> red old\n    contactSignal: f32,                // 336: polymerization field emitted where another cell's membrane is within reach (colony only; 0 = off)\n    referenceArea: f32,                // 340: area held by the area projection (colony); 0 = circle of the rest perimeter\n    nucleusCount: u32,                 // 344: nucleus vertices, the last ones of the membrane buffer (colony; 0 = none)\n    nucleusRadius: f32,                // 348\n    reach: u32,                        // 352: colony only; nonzero while a predator reaches for its prey with bundle 0\n    reachPad0: u32,                    // 356\n    reachPad1: u32,                    // 360\n    reachPad2: u32,                    // 364\n                               // Total size = 368 bytes, rounded to 16.\n}\n";

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

module.exports = "// Enclosure closure for a 2-D cell. Area projection is an imposed volume\n// surrogate, NOT a measurement of hydrostatic pressure. Contacts below are\n// kinematic nonpenetration constraints; the pre-existing steric coupling still\n// supplies the deformable-wall response.\n// Membrane edges run from each vertex to its `tail`, so one buffer may hold\n// several closed loops. Inner loops are oriented opposite to the outer loop:\n// the signed area is the cytoplasm area and their interior counts as outside.\nfn enclosure_slot() -> u32 { return controls.actinCount + controls.membraneCount; }\n// Colony predators: the last nucleusCount membrane vertices form the nucleus, an\n// inner loop kept as a rigid disc. Its centre is kept one slot after the cue.\nfn nucleus_start() -> u32 { return controls.membraneCount - controls.nucleusCount; }\nfn is_nucleus(i: u32) -> bool { return controls.nucleusCount > 0u && i >= nucleus_start(); }\nfn nucleus_slot() -> u32 { return enclosure_slot() + 2u; }\nfn reference_area() -> f32 {\n  // Colony cells state their area explicitly, so that membrane rest length above the\n  // circle value is slack (a membrane reservoir) rather than a larger cell.\n  if (controls.referenceArea > 0.0) { return controls.referenceArea; }\n  let circumference = f32(controls.membraneCount) * controls.membraneRestLength;\n  return circumference * circumference / (4.0 * PI);\n}\n\nconst ENCLOSURE_ROW_HEIGHT = 4.0;\nconst ENCLOSURE_ROW_CAPACITY = 256u;\nconst ENCLOSURE_ROW_STRIDE = 257u;\nfn row_base(row: u32) -> u32 { return enclosure_slot() + row * ENCLOSURE_ROW_STRIDE; }\n// Colony only: intercellular contact forces, then contact signals, one entry per membrane vertex.\nfn contact_base() -> u32 { return row_base(u32(ceil(f32(canvas.size.y) / ENCLOSURE_ROW_HEIGHT))); }\nfn reaction_dilution() -> f32 {\n  // Fixed reference across cell sizes, so a smaller volume really increases\n  // concentration-dependent supply instead of redefining its reference rate.\n  return (1024.0 * 1024.0 / (4.0 * PI)) / max(1.0, mechanical_snapshot[enclosure_slot()].orientation.x);\n}\n\n@compute @workgroup_size(WGSZ)\nfn build_enclosure_rows(@builtin(global_invocation_id) id: vec3u) {\n  let row = id.x;\n  let rows = u32(ceil(f32(canvas.size.y) / ENCLOSURE_ROW_HEIGHT));\n  if (row >= rows || controls.gActinField == 0u) { return; }\n  let low = f32(row) * ENCLOSURE_ROW_HEIGHT;\n  let high = low + ENCLOSURE_ROW_HEIGHT;\n  var count = 0u;\n  for (var i = 0u; i < controls.membraneCount; i++) {\n    let a = membrane[i].position;\n    let b = membrane[membrane[i].tail].position;\n    if (max(a.y, b.y) >= low && min(a.y, b.y) <= high && any(a != b)) {\n      if (count < ENCLOSURE_ROW_CAPACITY) { atomicStore(&mechanical_forces[row_base(row) + 1u + count].x, i32(i)); }\n      count++;\n    }\n  }\n  // Overflow is explicit: callers fall back to the complete polygon. No edge\n  // or selected collision case is discarded to meet a performance target.\n  atomicStore(&mechanical_forces[row_base(row)].x, i32(count));\n}\n\nfn inside_membrane(p: vec2<f32>) -> bool {\n  var inside = false;\n  let row = i32(floor(p.y / ENCLOSURE_ROW_HEIGHT));\n  var count = controls.membraneCount;\n  var shortlist = false;\n  if (row >= 0 && p.y < f32(canvas.size.y)) {\n    let found = u32(atomicLoad(&mechanical_forces[row_base(u32(row))].x));\n    if (found <= ENCLOSURE_ROW_CAPACITY) { count = found; shortlist = true; }\n  }\n  for (var k = 0u; k < count; k++) {\n    var i = k;\n    if (shortlist) { i = u32(atomicLoad(&mechanical_forces[row_base(u32(row)) + 1u + k].x)); }\n    let a = membrane[i].position;\n    let b = membrane[membrane[i].tail].position;\n    if ((a.y > p.y) != (b.y > p.y)) {\n      let x = a.x + (p.y - a.y) * (b.x - a.x) / (b.y - a.y);\n      if (p.x < x) { inside = !inside; }\n    }\n  }\n  return inside;\n}\n\n@compute @workgroup_size(1)\nfn measure_enclosure() {\n  let n = controls.membraneCount;\n  // Relative coordinates avoid cancellation when the cell translates.\n  let origin = membrane[0].position;\n  var area2 = 0.0;\n  var moment = vec2<f32>(0.0);\n  var low = origin;\n  var high = origin;\n  for (var i = 0u; i < n; i++) {\n    low = min(low, membrane[i].position);\n    high = max(high, membrane[i].position);\n    let a = membrane[i].position - origin;\n    let b = membrane[membrane[i].tail].position - origin;\n    let weight = cross2(a, b);\n    area2 += weight;\n    moment += (a + b) * weight;\n  }\n  let area = abs(area2) * 0.5;\n  var center = origin;\n  var scale = 1.0;\n  if (area > 1.0) {\n    center += moment / (3.0 * area2);\n    if (controls.areaConservation > 0.0) { scale = sqrt(reference_area() / area); }\n  }\n  mechanical_snapshot[enclosure_slot()].position = center;\n  mechanical_snapshot[enclosure_slot()].orientation = vec2<f32>(area, scale);\n  mechanical_snapshot[enclosure_slot()].head = bitcast<u32>(low.x);\n  mechanical_snapshot[enclosure_slot()].tail = bitcast<u32>(high.x);\n  mechanical_snapshot[enclosure_slot()].attached = bitcast<u32>(low.y);\n  mechanical_snapshot[enclosure_slot()].unused = bitcast<u32>(high.y);\n}\n\n@compute @workgroup_size(WGSZ)\nfn project_enclosure_area(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.membraneCount || controls.areaConservation <= 0.0) { return; }\n  let geometry = mechanical_snapshot[enclosure_slot()];\n  // Uniform scaling about the CURRENT area centroid changes area but does not\n  // prescribe a centroid destination or a direction of translation.\n  membrane[i].position = geometry.position + (membrane[i].position - geometry.position) * geometry.orientation.y;\n}\n\n@compute @workgroup_size(WGSZ)\nfn contain_filament_points(@builtin(global_invocation_id) id: vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount || controls.gActinField == 0u || is_disconnected(actines[idx])) { return; }\n  let p = actines[idx].position;\n  if (inside_membrane(p)) { return; }\n  atomicAdd(&telemetry[TELEMETRY_POINT_CONTACTS], 1u);\n  var best_distance = 1e30;\n  var best = p;\n  var best_a = p;\n  var best_b = p;\n  for (var i = 0u; i < controls.membraneCount; i++) {\n    let a = membrane[i].position;\n    let b = membrane[membrane[i].tail].position;\n    let edge = b - a;\n    let t = clamp(dot(p - a, edge) / max(dot(edge, edge), 1e-12), 0.0, 1.0);\n    let q = a + t * edge;\n    let d = dot(p - q, p - q);\n    if (d < best_distance && dot(edge, edge) > 1e-12) {\n      best_distance = d; best = q; best_a = a; best_b = b;\n    }\n  }\n  let inward = normalize_safely(perpendicular(best_b - best_a));\n  var q = best + 0.1 * inward;\n  // At a concave vertex, move toward the selected edge's interior before\n  // applying the small inward inset. Reject neither mass nor connectivity.\n  for (var k = 0u; k < 8u && !inside_membrane(q); k++) {\n    best = mix(best, (best_a + best_b) * 0.5, 0.5);\n    q = best + inward * (0.1 / f32(k + 2u));\n  }\n  actines[idx].position = q;\n}\n\n@compute @workgroup_size(WGSZ)\nfn contain_filament_bonds(@builtin(global_invocation_id) id: vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount || controls.gActinField == 0u) { return; }\n  let bead = mechanical_snapshot[idx];\n  if (bead.attached == 0u || bead.tail == idx) { return; }\n  let a = mechanical_snapshot[bead.tail].position;\n  let b = bead.position;\n  let delta = b - a;\n  var first = 1.0;\n  let low = i32(floor(min(a.y, b.y) / ENCLOSURE_ROW_HEIGHT));\n  let high = i32(floor(max(a.y, b.y) / ENCLOSURE_ROW_HEIGHT));\n  var shortlist = low >= 0 && max(a.y, b.y) < f32(canvas.size.y) && high - low <= 2;\n  if (shortlist) {\n    for (var row = low; row <= high; row++) {\n      shortlist = shortlist && u32(atomicLoad(&mechanical_forces[row_base(u32(row))].x)) <= ENCLOSURE_ROW_CAPACITY;\n    }\n  }\n  let batches = select(1u, u32(high - low + 1), shortlist);\n  for (var batch = 0u; batch < batches; batch++) {\n    var count = controls.membraneCount;\n    var base = 0u;\n    if (shortlist) {\n      base = row_base(u32(low) + batch);\n      count = u32(atomicLoad(&mechanical_forces[base].x));\n    }\n    for (var k = 0u; k < count; k++) {\n      var i = k;\n      if (shortlist) { i = u32(atomicLoad(&mechanical_forces[base + 1u + k].x)); }\n      let c = membrane[i].position;\n      let edge = membrane[membrane[i].tail].position - c;\n      let denominator = cross2(delta, edge);\n      if (abs(denominator) < 1e-8) { continue; }\n      let t = cross2(c - a, edge) / denominator;\n      let u = cross2(c - a, delta) / denominator;\n      if (t > 1e-5 && t < first && u >= 0.0 && u <= 1.0) { first = t; }\n    }\n  }\n  if (first < 1.0) {\n    atomicAdd(&telemetry[TELEMETRY_BOND_CONTACTS], 1u);\n    actines[idx].position = a + delta * max(0.0, first - 0.1 / max(length(delta), 0.1));\n  }\n}\n\n@compute @workgroup_size(16, 16)\nfn draw_reservoir_compartment(@builtin(global_invocation_id) id: vec3u) {\n  let p = vec2<i32>(id.xy);\n  if (any(p >= canvas.size)) { return; }\n  let geometry = mechanical_snapshot[enclosure_slot()];\n  let q = vec2<f32>(p) + 0.5;\n  var fill = 0.0;\n  if (controls.gActinField != 0u && q.x >= bitcast<f32>(geometry.head) && q.x <= bitcast<f32>(geometry.tail) &&\n      q.y >= bitcast<f32>(geometry.attached) && q.y <= bitcast<f32>(geometry.unused)) {\n    fill = select(0.0, 1.0, inside_membrane(q));\n    // Nucleus pixels are 2 plus their stain (0..1), for the microscope view.\n    if (controls.nucleusCount > 0u && fill == 0.0) {\n      let offset = q - mechanical_snapshot[nucleus_slot()].position;\n      if (length(offset) < controls.nucleusRadius) { fill = 2.0 + nucleus_stain(offset); }\n    }\n  }\n  store_texture(parameter_fields, G_ACTIN_COMPARTMENT, p, fill);\n}\n\nfn stain_hash(p: vec2<f32>) -> f32 {\n  var q = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);\n  q += dot(q, q.yzx + 33.33);\n  return fract((q.x + q.y) * q.z);\n}\nfn stain_noise(p: vec2<f32>) -> f32 {\n  let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);\n  return mix(mix(stain_hash(i), stain_hash(i + vec2<f32>(1, 0)), w.x), mix(stain_hash(i + vec2<f32>(0, 1)), stain_hash(i + vec2<f32>(1, 1)), w.x), w.y);\n}\n// Display only: an illustrative chromatin texture with a denser periphery and\n// nucleoli, fixed to the disc so that it moves with it. Not simulated structure.\nfn nucleus_stain(offset: vec2<f32>) -> f32 {\n  let radius = controls.nucleusRadius;\n  let d = length(offset);\n  let seed = f32(canvas.key.x % 997u);\n  // peripheral chromatin, clumps, and two nucleoli\n  var stain = 0.38 + 0.32 * smoothstep(radius - 3.5, radius - 1.2, d);\n  stain += 0.36 * (stain_noise(offset * 0.75 + seed) - 0.5) + 0.2 * (stain_noise(offset * 1.7 - seed) - 0.5);\n  let a = seed * 2.39;\n  let first = 0.3 * radius * vec2<f32>(cos(a), sin(a));\n  let second = 0.42 * radius * vec2<f32>(cos(a + 2.4), sin(a + 2.4));\n  stain += 0.45 * (1.0 - smoothstep(0.9, 2.0, distance(offset, first)));\n  stain += 0.3 * (1.0 - smoothstep(0.5, 1.4, distance(offset, second)));\n  // soft outer pixel, so the outline is not stepped\n  stain *= mix(0.45, 1.0, smoothstep(radius, radius - 1.0, d));\n  return clamp(stain, 0.0, 0.99);\n}\n";

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

module.exports = "#import includes::bindings\n#import includes::textures\n\nstruct VertexOutput {\n    @builtin(position) Position : vec4f,\n    @location(0) fragUV : vec2f,\n}\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n@vertex\nfn vert(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {\n    const pos = array(\n        vec2( 1.0,  1.0),\n        vec2( 1.0, -1.0),\n        vec2(-1.0, -1.0),\n        vec2( 1.0,  1.0),\n        vec2(-1.0, -1.0),\n        vec2(-1.0,  1.0),\n    );\n\n    const uv = array(\n        vec2(1.0, 0.0),\n        vec2(1.0, 1.0),\n        vec2(0.0, 1.0),\n        vec2(1.0, 0.0),\n        vec2(0.0, 1.0),\n        vec2(0.0, 0.0),\n    );\n\n    var output : VertexOutput;\n    output.Position = vec4(pos[VertexIndex], 0.0, 1.0);\n    output.fragUV = uv[VertexIndex];\n    return output;\n}\n\nstruct Canvas {\n    size: vec2<i32>,\n    pass_id: u32,\n    key: vec2<u32>,\n}\n\nstruct Interactions {\n    position: vec2<f32>,\n    size: f32,\n};\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(INTERACTIONS)\n  var<uniform> interactions: Interactions;\n\n@group(GROUP_INDEX) @binding(BINDING_INTERMEDIATE_TEXTURE)\n  var intermediateTexture: texture_storage_2d<rgba8unorm, write>; //rgba8unorm\n\n// Bindings for the final screen render\n@group(1) @binding(0) var screenSampler: sampler;\n@group(1) @binding(1) var screenTexture: texture_2d<f32>;\n\n// A display-only transmitted-light approximation, not a light-field acquisition\n// or a calibrated optical model. No simulation buffers or fields are modified.\nstruct View {\n  center: vec2<f32>, zoom: f32, mode: u32,\n  focus: f32, contrast: f32, chroma: f32, grain: f32,\n  screenScale: vec2f,\n  // Colony view: channel g of the specimen carries a second stain for prey instead of network density.\n  preyStain: f32, padding: f32,\n}\nstruct SpecimenGeometry { center: vec2<f32>, areaScale: vec2<f32>, bounds: vec4<u32> }\n@group(0) @binding(11) var specimenTexture: texture_2d<f32>;\n@group(0) @binding(12) var specimenSampler: sampler;\n@group(0) @binding(13) var<storage, read> specimenGeometry: SpecimenGeometry;\n@group(0) @binding(16) var specimenOutput: texture_storage_2d<rgba16float, write>;\n@group(0) @binding(17) var<uniform> view: View;\n\nfn hash2(p: vec2<f32>) -> f32 {\n  var q = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);\n  q += dot(q, q.yzx + 33.33);\n  return fract((q.x + q.y) * q.z);\n}\nfn soft_noise(p: vec2<f32>) -> f32 {\n  let i = floor(p); let f = fract(p); let w = f*f*(3.0-2.0*f);\n  return mix(mix(hash2(i),hash2(i+vec2f(1,0)),w.x),mix(hash2(i+vec2f(0,1)),hash2(i+vec2f(1,1)),w.x),w.y);\n}\nfn optical_granules(p: vec2f) -> f32 {\n  let warped = p + 1.5*vec2f(soft_noise(p*0.2),soft_noise(p*0.2+7.1));\n  let grid = floor(warped);\n  var pigment = 0.0;\n  for(var y=-1;y<=1;y++) {\n    for(var x=-1;x<=1;x++) {\n      let cell = grid+vec2f(f32(x),f32(y));\n      let seed = hash2(cell);\n      let offset = vec2f(hash2(cell+17.3),hash2(cell-9.7));\n      let angle = seed*6.2831853;\n      let axis = vec2f(cos(angle),sin(angle));\n      let delta = warped-cell-offset;\n      let q = vec2f(dot(delta,axis),dot(delta,vec2f(-axis.y,axis.x)))*(vec2f(1.0,1.0+0.7*seed));\n      let r = length(q);\n      let size = 0.12+0.29*seed;\n      let core = 1.0-smoothstep(size-0.07,size+0.02,r);\n      let rim = exp(-pow((r-size)/0.045,2.0));\n      pigment = max(pigment,(0.5+0.5*seed)*core+0.3*rim);\n    }\n  }\n  return pigment;\n}\n\n@compute @workgroup_size(16,16)\nfn build_specimen(@builtin(global_invocation_id) id: vec3u) {\n  let p = vec2i(id.xy);\n  if (any(p >= canvas.size)) { return; }\n  let compartment = select(0.0,load_texture(parameter_fields, G_ACTIN_COMPARTMENT, p),controls.gActinField != 0u);\n  // The compartment mask marks nucleus pixels with 2 plus their stain. The nucleus\n  // counts as cell body, and its stain is carried as a negative network channel.\n  let nucleus = compartment > 1.5;\n  let body = min(compartment, 1.0);\n  let polymer = select(clamp(load_texture(steric_potential, STIGMERGYPOLYMER, p), 0.0, 1.0), 2.0 - compartment, nucleus);\n  let membrane = clamp(load_texture(steric_potential, STIGMERGYMEMBRANE, p), 0.0, 1.0);\n  // Stain follows the simulated network density, so the dense front and the\n  // cleared rear stay visible. The fine grain is an illustrative texture, not\n  // additional simulated organelles.\n  let local = vec2f(p) - specimenGeometry.center;\n  var pigment = 0.0;\n  if (!nucleus && polymer > 0.001) { pigment = polymer * (0.3 + 0.75*optical_granules(local/2.6)); }\n  textureStore(specimenOutput,p,vec4f(body,polymer,membrane,pigment));\n}\n\nfn specimen(p: vec2f) -> vec4f {\n  // Optical sampling is not periodic: do not repeat the cell at image borders.\n  if (any(p < vec2f(0)) || any(p >= vec2f(canvas.size))) { return vec4f(0); }\n  return textureSampleLevel(specimenTexture,specimenSampler,(p+0.5)/vec2f(canvas.size),0.0);\n}\nfn soft_specimen(p: vec2f, radius: f32) -> vec4f {\n  var value = specimen(p)*0.25;\n  value += (specimen(p+vec2f(radius,0))+specimen(p-vec2f(radius,0))+\n    specimen(p+vec2f(0,radius))+specimen(p-vec2f(0,radius)))*0.125;\n  let r=radius*0.7071;\n  value += (specimen(p+vec2f(r,r))+specimen(p-vec2f(r,r))+\n    specimen(p+vec2f(r,-r))+specimen(p+vec2f(-r,r)))*0.0625;\n  return value;\n}\nfn microscope(screen: vec2f, output: vec2f) -> vec4f {\n  let p = view.center + (screen - output*0.5) / view.screenScale;\n  let radius = 0.35 + abs(view.focus)*2.4;\n  let image = soft_specimen(p,radius);\n  let wide = soft_specimen(p,radius+2.5);\n  let pigment = max(0.0,image.a)*view.contrast;\n  let uv = (screen-output*0.5)/max(output.x,output.y);\n  let light = vec3f(0.835,0.875,0.862) - 0.055*dot(uv,uv);\n  let quarry = max(0.0,image.g)*view.preyStain*view.contrast;\n  // Colony nuclei carry their stain as negative g (see build_specimen and colony-composite).\n  let chromatin = max(0.0,-image.g)*view.contrast;\n  let extinction = vec3f(0.68,0.47,1.32)*pigment + vec3f(0.30,1.25,0.42)*quarry + vec3f(0.72,0.92,0.24)*chromatin + vec3f(0.025,0.032,0.035)*image.r;\n  var color = light*exp(-extinction);\n  // Low-amplitude phase halo and a soft membrane rim; never a neon outline.\n  let phase = wide.r-image.r;\n  color += vec3f(0.12,0.105,0.075)*phase*(1.0+0.4*view.focus);\n  color -= vec3f(0.09,0.08,0.16)*image.b*view.contrast;\n  color -= vec3f(0.025)*max(0.0,image.g)*(1.0-view.preyStain);\n  let shift = vec2f(0.8,0.35)*(1.0+abs(view.focus));\n  let dispersion = specimen(p+shift)-specimen(p-shift);\n  color += view.chroma*vec3f(0.055,-0.022,0.045)*(dispersion.r+0.45*dispersion.a);\n  // Fixed sensor grain: no flicker and no simulation RNG consumption.\n  let grain = hash2(screen)-0.5;\n  let haze = soft_noise(screen/2.3)-0.5;\n  color += view.grain*(0.018*grain+0.014*haze);\n  return vec4f(clamp(color,vec3f(0),vec3f(1)),1);\n}\n\n// #e0600cff\nconst orange = vec4(0.878, 0.373, 0.000, 1.0);\n\n// #064164ff\n// const blue = vec4(0.024, 0.255, 0.396, 1.0);\nconst blue = vec4(0.0, 0.0, 0.0, 1.0);\n\nfn random_uniform(seed: u32) -> f32 {\n    return fract(sin(f32(seed) * 43758.5453123) * 12345.6789);\n}\n\n@compute @workgroup_size(16, 16)\nfn render(@builtin(global_invocation_id) id: vec3u) {\n    let x = vec2<i32>(id.xy);\n    // The display may be finer than the simulation grid; the model is unchanged.\n    let output = vec2<i32>(textureDimensions(intermediateTexture));\n    if (any(x >= output)) { return; }\n    if (view.mode != 0u) {\n      textureStore(intermediateTexture,x,microscope(vec2f(x),vec2f(output)));\n      return;\n    }\n    var color = blue / 4;  // background\n    // Schematic compartment tint, not a quantitative G-actin density scale.\n    if (controls.gActinField != 0u && load_texture(parameter_fields, G_ACTIN_COMPARTMENT, x) > 0.5) {\n        color = vec4(0.025, 0.065, 0.09, 1.0);\n    }\n\n    // steric potential\n    var max_potential = 0.0;\n    let potential = load_steric_potential(x);\n\n    for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n        max_potential = max(max_potential, potential[i]);\n    }\n    color -= 0.05 * max_potential; // add shadow\n\n    // agent locations\n    let idx = load_texture_index(SEGMENT_INDEX, x);\n    if (idx > 0){\n        if (potential[STIGMERGYPOLYMER] > 0.1) {\n            let randomSample = 0.4 + random_uniform(idx) * 0.6;\n            color += get_actin_color(vec2<f32>(x));\n        }\n        else if (potential[STIGMERGYMONOMER] > 0.1) {\n            let randomSample = 0.4 + random_uniform(idx) * 0.6;\n             color += controls.monomerOpacity * randomSample * orange;\n        }\n    }\n    \n    // food signal\n    let foodsignal = load_texture(parameter_fields, CONNECTION_PROBABILITY, x);\n\n    let foodNearby = foodsignal > controls.foodNearbyThreshold;\n    var foodnearbyColor = vec4(0.0, 0.0, 0.0, 1.0);\n    if (foodNearby){\n      var decayedFoodSignal = foodsignal;\n      decayedFoodSignal = select(1.0, foodsignal / 0.01, foodsignal < 0.01);\n      foodnearbyColor = vec4(0.4, 0.4, 0.4, 1.0) * decayedFoodSignal;\n    }\n    \n    var debug = load_texture(parameter_fields, DEBUG, x);\n    if (debug > 0.0){\n      color = vec4(1.0, 1.0, 1.0, 1.0);\n    }\n    if (debug == 4.0){\n      color = vec4(0.0, 0.0, 1.0, 1.0);\n    }\n    if (debug == 5.0){\n      color = vec4(0.0, 1.0, 0.0, 1.0);\n    }\n    if (debug == 6.0) { color = vec4(1.0, 0.25, 0.85, 1.0); }\n    if (debug == 7.0) { color = vec4(0.2, 0.85, 1.0, 1.0); }\n    if (debug == 8.0) { color = vec4(1.0, 0.7, 0.2, 1.0); }\n    if (debug >= 20 && debug < 30000){\n      color = index_to_rainbow(u32(debug));\n    }\n\n    textureStore(intermediateTexture, x, color);\n}\n\nfn index_to_rainbow(idx: u32) -> vec4f {\n    if idx == 0 {\n        return vec4(0.0, 0.0, 0.0, 1.0);\n    }\n    let r = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 0.0);\n    let g = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 2.094);\n    let b = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 4.188);\n    return vec4(r, g, b, 1.0);\n}\nfn index_to_parity(idx: u32) -> vec4f {\n    if idx == 0 {\n        return vec4(0.0, 0.0, 0.0, 1.0);\n    }\n    if (idx % 2 == 0) {\n        return vec4(1.0, 0.0, 0.0, 1.0);\n    } else {\n        return vec4(0.0, 1.0, 0.0, 1.0);\n    }\n}\n\n// Add this to your rendering shader\nfn get_actin_color(position: vec2<f32>) -> vec4<f32> {\n  if(controls.colourAge!=0u) {\n    let age=load_texture(parameter_fields,ACTIN_AGE,as_vec2i(position));\n    let mature=clamp(age/max(1.0,2.0*controls.turnoverAge),0.0,1.0);\n    return vec4(mix(vec3(1.0,1.0,0.0),vec3(1.0,0.1,0.1),mature),1.0);\n  }\n  let recency = load_texture(parameter_fields, RECENCY, as_vec2i(position));\n  \n  // Red color (newest)\n  let red = vec3<f32>(1.0, 0.0, 0.0);\n  // Yellow color (oldest)\n  let yellow = vec3<f32>(1.0, 1.0, 0.0);\n  \n  // Interpolate between yellow and red based on recency\n  let color = mix(red, yellow, recency);\n  \n  return vec4<f32>(color, 1.0);\n}\n\n@fragment\nfn frag(@location(0) fragUV: vec2f) -> @location(0) vec4f {\n  return textureSample(screenTexture, screenSampler, fragUV);\n}\n";

/***/ }),

/***/ "./src/shaders/simulate.wgsl":
/*!***********************************!*\
  !*** ./src/shaders/simulate.wgsl ***!
  \***********************************/
/***/ ((module) => {

module.exports = "#import includes::bindings\n#import includes::textures\n#import includes::random\n#import includes::buffers\n#import includes::actomyosin\n#import includes::enclosure\n\nstruct Canvas {\n  size: vec2<i32>,\n  pass_id: u32,\n  key: vec2<u32>,\n}\n\nstruct NeighborStruct {\n  idx: u32,\n  distance: f32,\n}\n\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n\n@group(GROUP_INDEX) @binding(ACTIN)\n  var<storage, read_write> actines : array<Segment>;\n\n@group(GROUP_INDEX) @binding(MEMBRANE)  \n  var<storage, read_write> membrane : array<Segment>;\n\n@group(GROUP_INDEX) @binding(CONNECTION_LOCKS)\n  var<storage, read_write> connectionLocks: array<atomic<i32>>;\n\n// event counters read back by src/telemetry.ts (same order as TELEMETRY_COUNTERS there)\n@group(GROUP_INDEX) @binding(TELEMETRY)\n  var<storage, read_write> telemetry: array<atomic<u32>>;\nconst TELEMETRY_CANDIDATES = 0;\nconst TELEMETRY_NEIGHBOR_FOUND = 1;\nconst TELEMETRY_PASSED_PROB = 2;\nconst TELEMETRY_BOUND = 3;\nconst TELEMETRY_UNBOUND = 4;\nconst TELEMETRY_ELONGATED = 5;\nconst TELEMETRY_HEADS_IN_FIELD = 6;\nconst TELEMETRY_HEAD_FOUND = 7;\nconst TELEMETRY_BRANCHED = 8;\nconst TELEMETRY_DEBRANCHED = 9;\nconst TELEMETRY_POINT_CONTACTS = 10;\nconst TELEMETRY_BOND_CONTACTS = 11;\nconst TELEMETRY_REAR_LOSS = 12;\nconst TELEMETRY_FRONT_LOSS = 13;\nconst TELEMETRY_REAR_HEAD_LOSS = 14;\nconst TELEMETRY_TETHER_RELEASED = 15;\n\n\n\n\nconst PI = 3.14159265358979323846;\nconst WGSZ = 256;\n\n// new actins are placed this many rest lengths ahead of the filament head\nconst ACTIN_DROP_DISTANCE = 1.5;\n// Arp2/3 branches leave their mother filament at ~70 degrees, toward its plus end\nconst BRANCH_ANGLE = 70.0 * PI / 180.0;\n// how fast a branch root is pulled back to that angle, per step\nconst BRANCH_STIFFNESS = 0.5;\n// a branch whose mother actin got further than this (pixels) has lost it: the mother depolymerized and was rebound elsewhere.\n// Steric jitter alone moves them a couple of pixels apart\nconst BRANCH_MAX_DISTANCE = 6.0;\n\nconst MOVE_EAST = 1;\n\n// distance between two normalized arc lengths on a closed loop\nfn arc_distance(a: f32, b: f32) -> f32 {\n  let d = abs(a - b);\n  return min(d, 1.0 - d);\n}\n\nfn cross2(a: vec2<f32>, b: vec2<f32>) -> f32 {\n  return a.x * b.y - a.y * b.x;\n}\n\nfn perpendicular(v: vec2<f32>) -> vec2<f32> {\n  return vec2<f32>(-v.y, v.x);\n}\n\nfn angle(a: vec2<f32>, b: vec2<f32>) -> f32 {\n  return atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);\n}\n\nfn rotate(v: vec2<f32>, theta: f32) -> vec2<f32> {\n  let c = cos(theta);\n  let s = sin(theta);\n  return vec2<f32>(c * v.x - s * v.y, s * v.x + c * v.y);\n}\n\n\nfn orientation_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, stiffness: f32) {\n  storageBarrier();\n\n  let segment = segments[idx];  \n  \n  // straightening a branch root would fold the branch onto its mother; update_actin_polymer_position keeps its angle instead\n  if (is_disconnected(segment) || idx >= arrayLength(segments) || is_branch_root(idx, segments)) {\n    return;\n  }\n  var tail = segments[segment.tail];\n  var head = segments[segment.head];\n\n  let perp = normalize_safely(perpendicular(segment.orientation));\n\n  // Measure the \"width\" of the membrane at two offset positions\n  let offset_distance = 0.5; // How far to offset the trapezium corners\n  let tail_offset_a = tail.position + perp * offset_distance;\n  let tail_offset_b = tail.position - perp * offset_distance;\n  let head_offset_a = head.position + perp * offset_distance;\n  let head_offset_b = head.position - perp * offset_distance;\n\n  // Compute trapezium edge lengths\n  let distance_a = length(head_offset_a - tail_offset_a);\n  let distance_b = length(head_offset_b - tail_offset_b);\n\n  // both edges prefer the same length, so any difference bends the chain back toward straight\n  let net_torque = distance_a - distance_b;\n\n  segments[idx].position += net_torque * perp * stiffness;\n  }\n\nfn steric_force_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, coefficients: array<f32, STERIC_POTENTIAL_DIM>) {\n  let segment = segments[idx];\n  \n  if (idx >= arrayLength(segments)) {\n    return;\n  }\n  let theta = random_uniform(idx) * 2.0 * PI;\n  // 1 + was too small. Got artifacts from self. \n  let dx = (2 + f32(controls.steric_sampling_range) * random_uniform(idx)) * vec2<f32>(cos(theta), sin(theta));\n  \n  let normal = perpendicular(segment.orientation);\n  let position = segment.position - normal * dot(normalize_safely(dx), normal) * steric_force(segment.position, dx, coefficients) * 0.5;\n  \n  segments[idx].position = position;\n}\n\n\nfn line_constraint_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let rest_length = controls.equilibrium_line_distance;\n  let segment = segments[idx];\n  \n  if (is_disconnected(segment) || is_end(segment) || idx >= arrayLength(segments)) {\n    return;\n  }\n\n  let tail = segments[segment.tail];\n  let head = segments[segment.head];\n\n  var net_displacement = vec2<f32>(0.0);\n  \n  // Simple spring forces-like constraint to maintain equilibrium distance\n  // use select to avoid branching\n  let tail_vec = tail.position - segment.position;\n  let tail_error = length(tail_vec) - rest_length;\n  net_displacement += select(vec2<f32>(0.0), normalize_safely(tail_vec) * tail_error * 0.5, has_tail(segment));\n\n  // same for head  \n  let head_vec = head.position - segment.position;\n  let head_error = length(head_vec) - rest_length;\n  net_displacement += select(vec2<f32>(0.0), normalize_safely(head_vec) * head_error * 0.5, has_head(segment));\n\n  segments[idx].position = segment.position + net_displacement;\n}\n\n// neighbours 1, 2, 4, ... nodes away on either side that the membrane rules compare with\nconst MEMBRANE_SCALES = 7u;\n\n// The membrane is a rope: it resists stretching, and folds freely when compressed.\n// Tension pulls a node toward the chord between its neighbours (along the curvature), as hard as the membrane\n// between them is stretched beyond its rest length. Measured at several scales, so the pull doesn't fade with\n// the node count: a taut membrane pulls the whole cell in, which is how the rear follows the front.\nfn membrane_constraint_update(idx: u32) {\n  // the nucleus keeps its shape through restore_nucleus instead\n  if (idx >= arrayLength(&membrane) || is_nucleus(idx)) {\n    return;\n  }\n  let segment = membrane[idx];\n  let tail = membrane[segment.tail];\n  let head = membrane[segment.head];\n\n  var net_displacement = vec2<f32>(0.0);\n  var tail_idx = idx;\n  var head_idx = idx;\n  var tail_length = 0.0;\n  var head_length = 0.0;\n  var steps = 0u;\n  for (var scale = 0u; scale < MEMBRANE_SCALES; scale++) {\n    for (; steps < (1u << scale); steps++) {\n      let next_tail = membrane[tail_idx].tail;\n      let next_head = membrane[head_idx].head;\n      tail_length += length(membrane[next_tail].position - membrane[tail_idx].position);\n      head_length += length(membrane[next_head].position - membrane[head_idx].position);\n      tail_idx = next_tail;\n      head_idx = next_head;\n    }\n    let stretch = max(0.0, (tail_length + head_length) / (2.0 * f32(steps) * controls.membraneRestLength) - 1.0);\n    let chord_midpoint = 0.5 * (membrane[tail_idx].position + membrane[head_idx].position);\n    // tension times the curvature of the circle through the node and its two neighbours at this scale, capped\n    // at half the way to the chord so short edges can't overshoot\n    let pull = controls.membraneStiffness * stretch * 2.0 / max(tail_length * head_length, 1e-6);\n    net_displacement += (chord_midpoint - segment.position) * min(0.5, pull);\n  }\n  net_displacement /= f32(MEMBRANE_SCALES);\n\n  // membrane smoothing: move toward the neighbours' midpoint. Fastest where the membrane is sharply curved,\n  // so idle protrusions and cusps retract and flatten while the round body barely shrinks.\n  let midpoint = 0.5 * (tail.position + head.position);\n  net_displacement += (midpoint - segment.position) * controls.membraneSmoothing;\n\n  membrane[idx].position = segment.position + net_displacement;\n  // membrane orientation is not 'constrained', just calculated. Actin carries its own director, see cosserat_update\n  membrane[idx].orientation = normalize_safely(head.position - tail.position);\n}\n\n// Slide membrane nodes along the membrane toward the more stretched side, comparing the membrane length to the\n// neighbours 1, 2, 4, ... nodes away on either side. This evens out node spacing without changing the shape, so\n// membrane flows toward stretched regions like a growing dendrite. The farther neighbours carry it across the\n// whole cell; with the direct neighbours alone it diffuses, and the rear stays crowded while the front is\n// stretched to its max length. A node slides at most half an edge per pass, so it stays on the membrane.\n\n@compute @workgroup_size(WGSZ)\nfn membrane_tangential_flow(@builtin(global_invocation_id) id : vec3u) {\n  if (id.x >= arrayLength(&membrane) || is_nucleus(id.x)) {\n    return;\n  }\n  let segment = membrane[id.x];\n  let tangent = normalize_safely(membrane[segment.head].position - membrane[segment.tail].position);\n  var tail = id.x;\n  var head = id.x;\n  var tail_length = 0.0;\n  var head_length = 0.0;\n  var steps = 0u;\n  var shift = 0.0;\n  for (var scale = 0u; scale < MEMBRANE_SCALES; scale++) {\n    for (; steps < (1u << scale); steps++) {\n      let next_tail = membrane[tail].tail;\n      let next_head = membrane[head].head;\n      tail_length += length(membrane[next_tail].position - membrane[tail].position);\n      head_length += length(membrane[next_head].position - membrane[head].position);\n      tail = next_tail;\n      head = next_head;\n    }\n    // per node, so every scale weighs the same\n    shift += 0.5 * (head_length - tail_length) / f32(steps);\n  }\n  let edge = min(length(membrane[segment.head].position - segment.position), length(membrane[segment.tail].position - segment.position));\n  shift = clamp(shift / f32(MEMBRANE_SCALES) * controls.membraneFlow, -0.5 * edge, 0.5 * edge);\n  membrane[id.x].position += tangent * shift;\n}\n\n// how fast an actin moves onto its neighbours' director lines, per step\nconst ACTIN_SHEAR_STIFFNESS = 0.5;\n// how fast a director turns toward its bond, per step. Kept weak: a director that just follows its bond\n// only describes the current shape, and the positions then have nothing to straighten toward\nconst ACTIN_DIRECTOR_SHEAR = 0.05;\n\n// 2D Cosserat rod for the actin filaments: every actin carries a director (its orientation) besides its position.\n// Bending acts on the angle between neighbouring directors and shear on the angle between a director and its bond,\n// so the stiffness doesn't depend on how far apart the actins are. Spacing is left to the steric forces.\nfn cosserat_update(idx: u32) {\n  if (idx >= arrayLength(&actines)) {\n    return;\n  }\n  let actin = actines[idx];\n  if (is_disconnected(actin)) {\n    return;\n  }\n  // a branch root meets its mother at BRANCH_ANGLE, which update_actin_polymer_position keeps\n  let along_tail = has_tail(actin) && !is_branch_root(idx, &actines);\n  let tail = actines[actin.tail];\n  let head = actines[actin.head];\n\n  // bond toward the head, or from the tail at the plus end\n  let bond = normalize_safely(select(actin.position - tail.position, head.position - actin.position, has_head(actin)));\n\n  // bending: turn the director toward its neighbours' directors\n  var neighbors = vec2<f32>(0.0);\n  neighbors += select(vec2<f32>(0.0), tail.orientation, along_tail);\n  neighbors += select(vec2<f32>(0.0), head.orientation, has_head(actin));\n  var director = normalize_safely(actin.orientation + controls.actinBendStiffness * neighbors);\n  // shear: turn the director toward its bond\n  director = normalize_safely(mix(director, bond, ACTIN_DIRECTOR_SHEAR));\n  actines[idx].orientation = director;\n\n  // shear on the positions: move onto the line the tail's director points along, and onto the line\n  // that puts the head along this director, at the same distances\n  var goal = vec2<f32>(0.0);\n  var count = 0.0;\n  if (along_tail) {\n    goal += tail.position + tail.orientation * length(actin.position - tail.position);\n    count += 1.0;\n  }\n  if (has_head(actin)) {\n    goal += head.position - director * length(head.position - actin.position);\n    count += 1.0;\n  }\n  if (count > 0.0) {\n    actines[idx].position += (goal / count - actin.position) * ACTIN_SHEAR_STIFFNESS;\n  }\n}\n\n// dispatched actinCosseratIterations times per step: each pass carries bending one actin further along a filament\n@compute @workgroup_size(WGSZ)\nfn cosserat_updates(@builtin(global_invocation_id) id : vec3u) {\n  cosserat_update(id.x);\n}\n\n@compute @workgroup_size(WGSZ)\nfn line_constraint_updates(@builtin(global_invocation_id) id : vec3u) {  \n  membrane_constraint_update(id.x);\n  line_constraint_update(id.x, &actines);\n}\n\n@compute @workgroup_size(WGSZ)\nfn orientation_updates(@builtin(global_invocation_id) id : vec3u) {\n  orientation_update(id.x, &membrane, controls.stiffness);\n  // do another update. gets a bit snappier\n  orientation_update(id.x, &membrane, controls.stiffness);\n}\n\n\n@compute @workgroup_size(WGSZ)\nfn steric_force_updates(@builtin(global_invocation_id) id : vec3u) {\n  // only polymers push the membrane. Monomers don't (G-actin barely does), and membrane self-repulsion\n  // makes the soft membrane buckle into persistent waves.\n  steric_force_update(id.x, &membrane, array<f32, STERIC_POTENTIAL_DIM>(0.0, 12.0, 0.0));\n}\n\n@compute @workgroup_size(WGSZ)\nfn update_actin_monomer_position(@builtin(global_invocation_id) id : vec3u) {\n  if (controls.gActinField != 0u) { return; }\n  let idx = id.x;\n  let actin = actines[idx];\n\n  if (has_connection(actin)) {\n    return;\n  }\n\n  let p = actines[idx].position;\n  let tangent = actines[idx].orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange);\n  var stericForce = vec2<f32>(0.0);\n  let membraneSignal = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(p)) * 3.0;\n  // choose either this one or the next. both are nice\n  // these 2 solutions to prevent actin 'highways' near the membrane. Uncomment to see what I mean.\n  let actinRepulsionScale = 0.2 + 0.8 * exp(-membraneSignal * 1000.0);\n  // let actinRepulsionScale = select(1.0, 0.2, membraneSignal/3.0 > 0.0001);\n\n  for (var t = -2.0*range; t <= 2.0*range; t += 1.0*range) {  \n    for (var n = -2.0*range; n <= 2.0*range; n += 1.0*range) { \n      let sample_pos = p + t * tangent + n * normal;\n      let densityMO = load_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(sample_pos)) * 0.4;\n      // how hard monomers are pushed off the membrane; sets the gap between the membrane and the actin\n      let densityME = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(sample_pos)) * controls.monomerMembraneRepulsion;\n\n      var density = densityME + densityMO*0.4;\n      let direction = normalize_safely(p - sample_pos);\n\n      // steer towards highest lifetime density\n      let food_signal = load_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(sample_pos));\n      let moveCondition = food_signal > controls.foodNearbyThreshold;\n\n      stericForce += select(vec2<f32>(0.0), direction * densityMO * actinRepulsionScale, densityMO > 0.0);\n      stericForce += select(vec2<f32>(0.0), direction * densityME, densityME > 0.0);\n    }\n  }\n\n  // go into the direction of the orientation texture\n  // Apply forces - steric force for avoidance, orientation for directed movement\n  actines[id.x].position += controls.actinStericForce * stericForce*10;\n}\n\n// upper bound for stericSelfNeighbors, the filament neighbours on each side that don't repel an actin\nconst MAX_STERIC_SELF_NEIGHBORS = 12u;\n\n@compute @workgroup_size(WGSZ)\nfn update_actin_polymer_position(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n  let actin = actines[idx];\n\n  if (is_disconnected(actin)) {\n    return;\n  }\n\n  let p = actin.position;\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange) * 3.0;\n  var stericForce = vec2<f32>(0.0);\n\n  // the membrane pushes through its field. Sample in a circle pattern\n  let sampleCount = 8; \n  for (var i = 0.0; i < f32(sampleCount); i += 1.0) {\n    let angle = 2.0 * PI * (i / f32(sampleCount));\n    let sampleDir = vec2f(cos(angle), sin(angle));\n    // make a radius that is subject to randomness\n    let radius = 0.1 + random_uniform(idx) * 0.9; // random radius between 0 and 1\n    let sample_pos = p + radius * range * sampleDir;\n\n    let densityME = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(sample_pos));\n\n    stericForce += select(\n      vec2<f32>(0.0), \n      normalize_safely(p - sample_pos) * densityME, \n      densityME > 0.0\n    );\n  }\n\n  // this actin and its nearest neighbours along its own filament, which don't repel it: the rest length spaces them\n  var own: array<u32, 2 * MAX_STERIC_SELF_NEIGHBORS + 1>;\n  own[0] = idx;\n  var ownCount = 1u;\n  let selfNeighbors = min(controls.stericSelfNeighbors, MAX_STERIC_SELF_NEIGHBORS);\n  var current = idx;\n  for (var k = 0u; k < selfNeighbors && has_tail(actines[current]); k++) {\n    current = actines[current].tail;\n    own[ownCount] = current;\n    ownCount++;\n  }\n  current = idx;\n  for (var k = 0u; k < selfNeighbors && has_head(actines[current]); k++) {\n    current = actines[current].head;\n    own[ownCount] = current;\n    ownCount++;\n  }\n\n  // other polymer actins repel from where they are now, found through the polymer index. The blurred polymer\n  // field also holds where an actin was the last few steps, and an actin pushed by that trail keeps going\n  let center = as_vec2i(p);\n  let reach = i32(ceil(range));\n  for (var dy = -reach; dy <= reach; dy++) {\n    for (var dx = -reach; dx <= reach; dx++) {\n      let q = center + vec2<i32>(dx, dy);\n      let signal = load_texture_index(POLYMER_INDEX, q);\n      if (signal == 0u) {\n        continue;\n      }\n      let j = signal - 1u;\n      let other = actines[j];\n      // the index is never cleared: only count an actin at the pixel it is in now, so it counts once\n      if (is_disconnected(other) || any(as_vec2i(other.position) != q)) {\n        continue;\n      }\n      var isOwn = false;\n      for (var k = 0u; k < ownCount; k++) {\n        isOwn = isOwn || own[k] == j;\n      }\n      let offset = p - other.position;\n      let dist = length(offset);\n      if (!isOwn && dist < range) {\n        stericForce += normalize_safely(offset) * (1.0 - dist / range) * controls.polymerRepulsion;\n      }\n    }\n  }\n\n  actines[id.x].position += 0.5 * stericForce;\n\n  // keep a branch at its angle on whichever side of the mother it is\n  if (is_branch_root(idx, &actines)) {\n    let mother = actines[actin.tail];\n    let side = select(-1.0, 1.0, cross2(mother.orientation, actines[idx].position - mother.position) >= 0.0);\n    actines[idx].position += (branch_position(mother, side) - actines[idx].position) * BRANCH_STIFFNESS;\n  }\n}\n\n// both polymerization fields: the sprout / Move East one and the lamellipodium one\nfn polymerization_signal(p: vec2<f32>) -> f32 {\n  let front = max(load_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p)), load_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p)));\n  // Optional second hypothesis: basal assembly near the entire membrane supplies\n  // a posterior actin substrate. Zero exactly recovers the front-only rule.\n  let cortex = controls.cortexPolymerization * load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(p));\n  return max(front, cortex);\n}\n\n// where a branch root sits: at BRANCH_ANGLE on the given side (+1 or -1) of its mother, as far from it as the\n// mother's own next actin (the actual spacing, which can stretch above the rest length)\nfn branch_position(mother: Segment, side: f32) -> vec2<f32> {\n  let spacing = max(controls.equilibrium_line_distance, length(actines[mother.head].position - mother.position));\n  return mother.position + rotate(mother.orientation, side * BRANCH_ANGLE) * spacing;\n}\n\n// upper bound for bindLengthSaturation; also caps the walk below\nconst MAX_BIND_LENGTH = 64u;\n\n// number of actins from idx back to the filament's minus end, counting idx, capped at max_length\nfn filament_length(idx: u32, max_length: u32) -> u32 {\n  var current = idx;\n  var n = 1u;\n  while (n < max_length && actines[current].tail != current) {\n    current = actines[current].tail;\n    n++;\n  }\n  return n;\n}\n\n@compute @workgroup_size(WGSZ)\nfn bind_actin_monomer(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&actines);\n  let idx = id.x;\n\n  let actin = actines[idx];\n  var p = actin.position;\n  if (controls.gActinField != 0u) {\n    if (has_connection(actin)) { return; }\n    // A free slot is a monomer equivalent in a uniform finite reservoir, not\n    // a particle at its stored position. Sample a membrane-access reaction\n    // location; only ACCEPTED transfers turn a free slot into an explicit bead.\n    // not at the nucleus: its vertices are the last ones\n    let sites = nucleus_start();\n    let site = min(u32(random_uniform(idx) * f32(sites)), sites - 1u);\n    let wall = membrane[site];\n    p = wall.position - perpendicular(wall.orientation) * (2.0 + 6.0 * random_uniform(idx));\n  }\n\n  let food_signal = polymerization_signal(p);\n  let food_nearby = food_signal > controls.foodNearbyThreshold;\n  let lamellipodium_signal = load_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p));\n\n  // cancel if not a monomer and no food nearby\n  if (has_connection(actin) || !food_nearby) {\n    return;\n  }\n  atomicAdd(&telemetry[TELEMETRY_CANDIDATES], 1u);\n\n  let tangent = actin.orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange);\n  var neighborStruct = NeighborStruct(idx, 999999.9);\n  // plus ends nearby win over monomers: elongation is fast, nucleating a new filament from two monomers is slow\n  var headStruct = NeighborStruct(idx, 999999.9);\n  // in the lamellipodium field, monomers next to the side of a filament can nucleate a branch on it\n  var motherStruct = NeighborStruct(idx, 999999.9);\n\n  let sampleCount = 6; \n  for (var i = 0.0; i < f32(sampleCount); i += 1.0) {\n    let angle2 = 2.0 * PI * (i / f32(sampleCount));\n    let sampleDir = vec2f(cos(angle2), sin(angle2));\n    // make a radius that is subject to randomness\n    let radius = 0.0 + random_uniform(idx) * 1.0; // random radius between 0 and 1\n    let sample_pos = p + radius * range * 2.0 * sampleDir;\n\n\n    let dist = length(p - sample_pos);\n\n    // monomers look for polymers to connect to. The head layer is never cleared, so only trust heads\n    // that are still close to where they wrote themselves\n    let headSignal = load_texture_index(HEAD_INDEX, as_vec2i(sample_pos));\n    if (headSignal > 0) {\n      let idxH = headSignal - 1;\n      let head = actines[idxH];\n      let headDist = length(p - head.position);\n      if (idxH != idx && growing_head(head) && headDist < ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance + 2.0 * range && headDist < headStruct.distance) {\n        headStruct = NeighborStruct(idxH, headDist);\n      }\n    }\n\n    // the polymer layer isn't cleared either\n    let polymerSignal = load_texture_index(POLYMER_INDEX, as_vec2i(sample_pos));\n    if (polymerSignal > 0 && lamellipodium_signal > controls.foodNearbyThreshold) {\n      let idxM = polymerSignal - 1;\n      let motherDist = length(p - actines[idxM].position);\n      if (actines[idxM].subtype != FILOPODIAL_ACTIN && has_both_connections(actines[idxM]) && motherDist < 2.0 * range + 1.0 && motherDist < motherStruct.distance) {\n        motherStruct = NeighborStruct(idxM, motherDist);\n      }\n    }\n\n    if (controls.gActinField != 0u) { continue; }\n    let actinSignal = load_texture_index(ACTIN_INDEX, as_vec2i(sample_pos));\n    if (actinSignal <= 0) {\n      continue;\n    }\n\n    let idxN = actinSignal - 1;\n    let neighbor = actines[idxN];\n    // NOTE: simplify more; Maybe already just bind to the first one instead of closest. Way easier.\n    let available = is_head(neighbor) || is_disconnected(neighbor);\n\n    // skip if not available or self\n    if (!available || idxN == idx){\n      continue;\n    }\n\n    // maybe not necessary. Just get a random one\n    if (dist < neighborStruct.distance) {\n        neighborStruct = NeighborStruct(idxN, dist);\n    } else if (dist == neighborStruct.distance && random_uniform(idx) < 0.3) {\n        neighborStruct = NeighborStruct(idxN, dist);\n    }\n  }\n\n  if (headStruct.idx != idx) {\n    neighborStruct = headStruct;\n    atomicAdd(&telemetry[TELEMETRY_HEAD_FOUND], 1u);\n  } else if (motherStruct.idx != idx) {\n    // branching (Arp2/3): the monomer becomes the root of a new filament on the side of the mother.\n    // Only the monomer changes, the mother keeps its own head and tail\n    if (random_uniform(idx) < controls.branchProbability * lamellipodium_signal &&\n        (controls.gActinField == 0u || inside_membrane(p)) &&\n        atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged) {\n      let mother = actines[motherStruct.idx];\n      let side = select(-1.0, 1.0, random_uniform(idx) < 0.5);\n      actines[idx].tail = motherStruct.idx;\n      actines[idx].age = 0.0;\n      actines[idx].position = branch_position(mother, side);\n      actines[idx].orientation = rotate(mother.orientation, side * BRANCH_ANGLE);\n      store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n      atomicAdd(&telemetry[TELEMETRY_BRANCHED], 1u);\n    }\n    return;\n  }\n\n  if (controls.gActinField != 0u && neighborStruct.idx == idx && (idx & 1u) == 0u) {\n    // A nucleus consumes two distinct free slots. Paired locks prevent double\n    // consumption when the partner is also recruited by a growing filament.\n    let partner = idx + 1u;\n    let dilution = reaction_dilution();\n    if (partner < count && is_disconnected(actines[partner]) &&\n        random_uniform(idx) < min(0.25, 0.02 * controls.bindProb * food_signal * dilution) && inside_membrane(p)) {\n      let theta = random_uniform(idx) * 2.0 * PI;\n      var direction = vec2<f32>(cos(theta), sin(theta));\n      if(controls.frontAlignment>0.0) {\n        let biased=mix(direction,polarity_axis(),controls.frontAlignment);\n        direction=select(polarity_axis(),normalize_safely(biased),dot(biased,biased)>1e-8);\n      }\n      let q = p + controls.equilibrium_line_distance * direction;\n      if (!inside_membrane(q)) { return; }\n      let locked = atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged;\n      if (!locked) { return; }\n      if (!atomicCompareExchangeWeak(&connectionLocks[partner], 0, 1).exchanged) {\n        atomicStore(&connectionLocks[idx], 0); return;\n      }\n      if (!is_disconnected(actines[idx]) || !is_disconnected(actines[partner])) {\n        atomicStore(&connectionLocks[idx], 0); atomicStore(&connectionLocks[partner], 0); return;\n      }\n      actines[idx].position = p; actines[partner].position = q;\n      actines[idx].orientation = direction; actines[partner].orientation = direction;\n      actines[idx].head = partner; actines[partner].tail = idx;\n      actines[idx].age = 0.0; actines[partner].age = 0.0;\n      atomicAdd(&telemetry[TELEMETRY_BOUND], 1u);\n    }\n    return;\n  }\n\n  // 3. Handle binding with neighborStruct\n  if (neighborStruct.idx != idx) {\n    atomicAdd(&telemetry[TELEMETRY_NEIGHBOR_FOUND], 1u);\n    // bind probability depends on the length L of the filament we'd join: bindProb for a lone monomer,\n    // bindProb * bindLengthFloor for short filaments, growing as bindProb * L from L = bindLengthFloor\n    // up to L = bindLengthSaturation\n    let neighborMin = actines[neighborStruct.idx].tail;\n    var dilution = 1.0;\n    if (controls.gActinField != 0u) {\n      dilution = reaction_dilution();\n    }\n    let rnd = random_uniform(idx) / max(0.01, food_signal * dilution);\n    let max_length = clamp(controls.bindLengthSaturation, controls.bindLengthFloor, MAX_BIND_LENGTH);\n    // cheap early outs before walking the filament\n    if (rnd > controls.bindProb * f32(max_length)) {\n      return;\n    }\n    let is_monomer = neighborMin == actines[neighborStruct.idx].id;\n    if (is_monomer && rnd > controls.bindProb) {\n      return;\n    }\n    if (!is_monomer && rnd > controls.bindProb * f32(controls.bindLengthFloor) &&\n        rnd > controls.bindProb * f32(filament_length(neighborStruct.idx, max_length))) {\n      return;\n    }\n    atomicAdd(&telemetry[TELEMETRY_PASSED_PROB], 1u);\n    if (controls.gActinField != 0u && !inside_membrane(p)) { return; }\n    if (atomicCompareExchangeWeak(&connectionLocks[neighborStruct.idx], 0, 1).exchanged && atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged) {\n      // locked the target and self\n      // atomicStore(&connectionLocks[idx], 1);\n      if (actines[neighborStruct.idx].head != actines[neighborStruct.idx].id || actines[idx].tail != actines[idx].id ) {\n        atomicStore(&connectionLocks[neighborStruct.idx], 0);\n        atomicStore(&connectionLocks[idx], 0);\n        return;\n      }\n      actines[idx].tail = neighborStruct.idx;\n      actines[neighborStruct.idx].head = idx;\n      actines[idx].age = 0.0;\n      if (is_monomer) { actines[neighborStruct.idx].age = 0.0; }\n      atomicAdd(&telemetry[TELEMETRY_BOUND], 1u);\n      if (!is_monomer) {\n        atomicAdd(&telemetry[TELEMETRY_ELONGATED], 1u);\n      }\n\n      // Mark the binding location with high recency value\n      store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n\n      // directors start along the bond; a monomer that nucleates a filament takes the same one\n      let bondDirection = normalize_safely(p - actines[neighborStruct.idx].position);\n      actines[idx].orientation = bondDirection;\n      if (is_monomer) {\n        actines[neighborStruct.idx].orientation = bondDirection;\n      }\n\n      // also put the actin exactly on the polymer + direction\n      if (neighborMin >= 0) {\n        let direction = normalize_safely(actines[neighborStruct.idx].position - actines[neighborMin].position);\n        let newPosition = actines[neighborStruct.idx].position + direction * ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance; // Move forward from current position\n        actines[idx].position = newPosition;\n      }\n    }\n  }\n}\n\n@compute @workgroup_size(WGSZ)\nfn unbind_min_pole(@builtin(global_invocation_id) id : vec3u) {\n\n  let idx = id.x;  \n  let actin = actines[idx];\n  if (is_disconnected(actin)) { actines[idx].age=0.0; return; }\n  actines[idx].age=min(actin.age+1.0,1e7);\n  if(actin.subtype == FILOPODIAL_ACTIN) { return; }\n  let rear=rear_maturity(actin.position,actin.age);\n  let extra=controls.rearTurnover*rear;\n\n  if (is_tail(actin) && random_uniform(idx) < min(0.5,controls.disconnection_probability+extra)) {\n    if (actines[idx].head != idx) {\n      disconnect_from_head(idx, &actines);\n      atomicAdd(&telemetry[TELEMETRY_UNBOUND], 1u);\n      if(front_fraction(actin.position)<0.5){atomicAdd(&telemetry[TELEMETRY_REAR_LOSS],1u);}\n      else {atomicAdd(&telemetry[TELEMETRY_FRONT_LOSS],1u);}\n    }\n  }\n\n  // Aged rear barbed ends are capped against elongation and can peel back.\n  // A one-bead branch must detach only itself, never its mother's own head.\n  if (extra>0.0 && is_head(actin) && random_uniform(idx)<extra) {\n    let current=actines[idx];\n    if(current.tail!=idx) {\n      if(actines[current.tail].head==idx){disconnect_from_tail(idx,&actines);}\n      else {actines[idx].tail=idx;}\n      atomicAdd(&telemetry[TELEMETRY_REAR_HEAD_LOSS],1u);\n    }\n  }\n\n  // a branch comes off its mother at random, or once the mother actin has depolymerized\n  // (it is then a free monomer, or may already have been rebound somewhere else)\n  if (is_branch_root(idx, &actines)) {\n    let mother = actines[actin.tail];\n    let lost_mother = !has_both_connections(mother) || length(mother.position - actin.position) > BRANCH_MAX_DISTANCE;\n    if (lost_mother || random_uniform(idx) < min(0.5,controls.debranchProbability+0.25*extra)) {\n      actines[idx].tail = idx;\n      atomicAdd(&telemetry[TELEMETRY_DEBRANCHED], 1u);\n    }\n  }\n}\n\n\n@compute @workgroup_size(WGSZ)\nfn membrane_to_textures(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&membrane);\n  let idx = id.x;\n  if (idx >= count) {\n    return;\n  }\n\n  var segment = membrane[idx];\n  let p = segment.position;\n  let tangent = segment.orientation;\n\n  let normalized_arc_len = front_coordinate(p,segment.arc_length / f32(count));\n  // Inner loops (phagosome, nucleus) are rasterized as walls below but emit no polarity fields.\n  let plasma = segment.subtype == MEMBRANE;\n\n  // Receptor engagement (colony only): where another cell's membrane is within reach but not yet\n  // bound, emit the polymerization field so this cell's own network pushes the rim onward.\n  if (plasma && controls.contactSignal > 0.0) {\n    if (atomicLoad(&mechanical_forces[contact_base() + controls.membraneCount + idx].x) >= 65536) { // low bits: filopodium tip bound flag\n      store_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p), controls.contactSignal);\n    }\n  }\n\n  if plasma && controls.movementMode == MOVE_EAST {\n    // polymerization patch around the selected front (arc 0 when cue is off)\n    if (arc_distance(normalized_arc_len, 0.0) < controls.polymerizationPatchSize * 0.5) {\n      store_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p), 1.0);\n    }\n  }\n\n  // lamellipodium: a broad field at the selected front (the right side at reset)\n  if (plasma && arc_distance(normalized_arc_len, 0.0) < controls.lamellipodiumWidth * 0.5) {\n    store_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p), controls.lamellipodiumStrength);\n  }\n\n  // short-lived sprout sites scheduled on the CPU: (center arc length, half width in nodes, strength, unused)\n  for (var i = 0; i < MAX_SPROUT_SITES; i++) {\n    let site = controls.sproutSites[i];\n    if (plasma && site.z > 0.0 && arc_distance(normalized_arc_len, site.x) * f32(count) < site.y) {\n      store_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p), site.z);\n    }\n  }\n\n  // rasterize the whole edge to the head, so a stretched membrane has no gaps for actin to leak through\n  let edge = membrane[segment.head].position - p;\n  let edge_length = min(length(edge), 32.0);\n  let edge_dir = normalize_safely(edge);\n  // 5.0 renders green, 4.0 blue: mark every 20th node. Edges are sub-pixel, so a lone blue node gets\n  // overwritten by its green neighbours; colouring a short run of nodes keeps a visible blue dash.\n  let debug_color = select(5.0, 4.0, idx % 20u < 4u);\n  for (var t = -1.0; t <= edge_length; t += 1.0) {\n    let q = p + t * edge_dir;\n    store_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(q), 1.0);\n    store_texture(parameter_fields, DEBUG, as_vec2i(q), debug_color);\n  }\n}\n\n@compute @workgroup_size(WGSZ)\nfn actines_to_textures(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount) {\n    return;\n  }\n\n  let actin = actines[idx];\n  if (controls.gActinField != 0u && is_disconnected(actin)) {\n    atomicStore(&connectionLocks[idx], 0);\n    return;\n  }\n  let p = actin.position;\n  let tangent = actin.orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n  let direction = tangent * normal;\n\n  if (is_disconnected(actin)) {\n    // TODO: maybe smooth with a sigmoid function?\n    store_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(p), load_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(p)) + 0.01);\n  }\n  else {\n    // the polymer field pushes the membrane, plus ends included\n    store_texture(steric_potential, STIGMERGYPOLYMER, as_vec2i(p), 1.0);\n    // read by the actin repulsion; branch nucleation only takes interior actins from it\n    store_texture_index(POLYMER_INDEX, as_vec2i(p), idx + 1);\n    if(controls.colourAge!=0u){store_texture(parameter_fields,ACTIN_AGE,as_vec2i(p),actin.age);}\n  }\n\n  // this is just for rendering!\n  store_texture_index(SEGMENT_INDEX, as_vec2i(p), idx + 1);\n  if (is_branch_root(idx, &actines)) {\n    store_texture(parameter_fields, DEBUG, as_vec2i(p), 4.0); // 4.0 renders blue\n    // the mother actin is the junction: tail, head and this branch give it degree 3\n    store_texture(parameter_fields, DEBUG, as_vec2i(actines[actin.tail].position), 4.0);\n  }\n\n  let food_nearby = polymerization_signal(p) > 0.001;\n  if (growing_head(actin) && food_nearby) {\n    let tail = actines[actin.tail];\n    let direction = normalize_safely(p - tail.position);\n    let dropPosition = p + direction * ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance; // Move forward from current position\n\n    // Set high recency for head segments\n    store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n\n    store_texture_index(HEAD_INDEX, as_vec2i(dropPosition), idx + 1);\n    atomicAdd(&telemetry[TELEMETRY_HEADS_IN_FIELD], 1u);\n    store_texture(parameter_fields, DEBUG, as_vec2i(dropPosition), 2.0);\n    // 0 means it's available to connect\n    // TODO: CAN'T WE DO THIS ELSEWHERE? LIKE A FINISH STEP IN THE PIPELINE? \n    atomicStore(&connectionLocks[idx], 0);\n  }\n  else if (is_disconnected(actin)) {\n    // 0 means it's available to connect\n    store_texture_index(ACTIN_INDEX, as_vec2i(p), idx + 1);\n    atomicStore(&connectionLocks[idx], 0);\n  }\n  else {\n    // 1 means it cannot connect\n    atomicStore(&connectionLocks[idx], 1);\n  }\n}\n\n// Each 16x16 workgroup copies its tile plus a 1-pixel border into workgroup memory once, then blurs from\n// there: ~1.3 texture loads per pixel per layer instead of 9.\nconst BLUR_TILE = 18;\nconst BLUR_LAYERS = 5;\nvar<workgroup> blur_tile: array<array<f32, BLUR_TILE * BLUR_TILE>, BLUR_LAYERS>;\n\nfn load_blur_layer(layer: u32, p: vec2i) -> f32 {\n  switch layer {\n    case 0u: { return load_texture(steric_potential, STIGMERGYMONOMER, p); }\n    case 1u: { return load_texture(steric_potential, STIGMERGYPOLYMER, p); }\n    case 2u: { return load_texture(steric_potential, STIGMERGYMEMBRANE, p); }\n    case 3u: { return load_texture(parameter_fields, CONNECTION_PROBABILITY, p); }\n    default: { return load_texture(parameter_fields, LAMELLIPODIUM, p); }\n  }\n}\n\n// same 3x3 kernel as gaussian_blur: center 8, adjacents 2, diagonals 1, normalized by 20\nfn blur_from_tile(layer: u32, local: vec2i) -> f32 {\n  let c = (local.y + 1) * BLUR_TILE + local.x + 1;\n  let t = &blur_tile[layer];\n  return (\n    2.0 * ((*t)[c - 1] + (*t)[c + 1] + (*t)[c - BLUR_TILE] + (*t)[c + BLUR_TILE]) +\n    (*t)[c - BLUR_TILE - 1] + (*t)[c - BLUR_TILE + 1] + (*t)[c + BLUR_TILE - 1] + (*t)[c + BLUR_TILE + 1] +\n    8.0 * (*t)[c]\n  ) / 20.0;\n}\n\n@compute @workgroup_size(16, 16)\nfn update_textures(@builtin(global_invocation_id) id : vec3u, @builtin(workgroup_id) wid : vec3u, @builtin(local_invocation_index) li : u32) {\n  let origin = vec2i(wid.xy) * 16 - 1;\n  for (var k = li; k < BLUR_TILE * BLUR_TILE; k += 256u) {\n    let q = origin + vec2i(i32(k % BLUR_TILE), i32(k / BLUR_TILE));\n    for (var layer = 0u; layer < BLUR_LAYERS; layer++) {\n      blur_tile[layer][k] = load_blur_layer(layer, q);\n    }\n  }\n  workgroupBarrier();\n\n  let p = vec2i(id.xy);\n  if (any(p >= canvas.size)) {\n    return;\n  }\n  let local = p - origin - 1;\n\n  // blur and decay in one pass; the particles only read these fields after both\n  store_texture(steric_potential, STIGMERGYMONOMER, p, 0.997*blur_from_tile(0u, local));\n  store_texture(steric_potential, STIGMERGYPOLYMER, p, 0.75*blur_from_tile(1u, local));\n  store_texture(steric_potential, STIGMERGYMEMBRANE, p, 0.95*blur_from_tile(2u, local));\n  // fast decay keeps the polymerization field local, so sprout sites make thin protrusions instead of broad bulges\n  store_texture(parameter_fields, CONNECTION_PROBABILITY, p, controls.polymerizationFieldDecay*blur_from_tile(3u, local));\n  store_texture(parameter_fields, LAMELLIPODIUM, p, controls.lamellipodiumFieldDecay*blur_from_tile(4u, local));\n}\n\n// layers only used for rendering; cleared once per frame, before the frame's last step\n@compute @workgroup_size(16, 16)\nfn clear_render_layers(@builtin(global_invocation_id) id : vec3u) {\n  let p = vec2i(id.xy);\n\n  store_texture_index(SEGMENT_INDEX, p, 0);\n  store_texture(parameter_fields, DEBUG, p, 0.0);\n  if(controls.colourAge!=0u){store_texture(parameter_fields,ACTIN_AGE,p,0.0);}\n  store_texture(parameter_fields, RECENCY, p, 0.99*load_texture(parameter_fields, RECENCY, p)); // ~0.9995 per step at 20 steps per frame\n}\n\n@compute @workgroup_size(WGSZ)\nfn reset_membrane(@builtin(global_invocation_id) id : vec3u) {\n  let count = arrayLength(&membrane);\n  let idx = id.x;\n  \n  if (idx >= count) {\n    return;\n  }\n\n  \n  let center = vec2<f32>(canvas.size) * 0.5;\n  // start at rest length, so the membrane begins relaxed instead of collapsing from far outside the actin\n  let radius = f32(count) * controls.membraneRestLength / (2.0 * PI);\n  let angle =  2 * PI * f32(idx) / f32(count);\n  membrane[idx].id = idx;\n  membrane[idx].subtype = MEMBRANE;\n  membrane[idx].position.x = center.x + radius * cos(angle);\n  membrane[idx].position.y = center.y + radius * sin(angle);\n\n  membrane[idx].orientation.x = -sin(angle);\n  membrane[idx].orientation.y = cos(angle);\n\n  membrane[idx].tail = (idx + count + 1) % count;\n  membrane[idx].head = (idx + count - 1) % count;\n  membrane[idx].arc_length = f32(idx);\n  membrane[idx].age = 0.0;\n  \n\n}\n\n@compute @workgroup_size(WGSZ)\nfn reset_actin(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n\n  // actines\n  let center = vec2<f32>(canvas.size) * 0.5;\n  let radius = min(center.x, center.y) * 0.5;\n  // distribute around a circle\n  let current_angle = random_uniform(idx) * 2.0 * PI;\n  let normalized_radius = sqrt(random_uniform(idx)) * radius * 0.3;\n\n  let xt = center.x + normalized_radius * cos(current_angle);\n  let yt = center.y + normalized_radius * sin(current_angle);\n  actines[idx].position = vec2<f32>(xt, yt);\n\n  let random_angle = random_uniform(idx);\n  actines[idx].orientation = vec2<f32>(cos(random_angle * 2.0 * PI), sin(random_angle * 2.0 * PI));\n\n  actines[idx].id = idx;\n  actines[idx].subtype = ACTIN;\n\n  actines[idx].head = idx;\n  actines[idx].tail = idx;\n  actines[idx].age = 0.0;\n}\n";

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
    // The nucleus disc is also restored before the first containment of the step,
    // so that the actin is held against a disc and not against steric dents.
    if (extensions) {
        dispatch(pass, extensions.nucleus.measure, 1);
        dispatch(pass, extensions.nucleus.restore, 1);
    }
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
    if (extensions) {
        dispatch(pass, extensions.forces, 1);
        dispatch(pass, extensions.nucleus.measure, 1);
        dispatch(pass, extensions.nucleus.exclude, workgroupCounts.MEMBRANE);
    }
    dispatch(pass, pipelines.applyMechanicalForces, mechanicalCount);
    // The nucleus disc is restored after every pass that moves membrane by vertex.
    // The area projection that follows scales it as a whole, so it stays a disc,
    // and the area and actin containment then see the final membrane of the step.
    if (extensions) {
        dispatch(pass, extensions.nucleus.measure, 1);
        dispatch(pass, extensions.nucleus.restore, 1);
        dispatch(pass, extensions.nucleus.clear, workgroupCounts.MEMBRANE);
    }
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
    lastCounters = null;
    lastStep = 0;
    // explicit fields rather than constructor parameter properties: the module
    // stays loadable by node's type-stripping test runner
    actinCount;
    membraneCount;
    membraneRestLength;
    run;
    wellMixed;
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
    // Rest length and counts can differ per cell and change at run time; the
    // per-step counter history is deliberately preserved.
    configure(actinCount, membraneCount, membraneRestLength) {
        this.actinCount = actinCount;
        this.membraneCount = membraneCount;
        this.membraneRestLength = membraneRestLength;
    }
    analyze(actin, membraneData, counterData, frame, step, equilibriumLineDistance, verification = false) {
        const previousCounters = this.lastCounters, previousStep = this.lastStep;
        const words = new Uint32Array(actin);
        const floats = new Float32Array(words.buffer);
        const counters = Array.from(new Uint32Array(counterData));
        const membrane = new Float32Array(membraneData);
        const cell = this.cellShape(membrane);
        const stats = this.compute(words, floats, counters, frame, step, equilibriumLineDistance, cell);
        // fusion/scission can re-link the membrane into several loops, so every
        // polygon predicate follows tail links instead of index order
        const inside = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonOccupancy)(membrane, SEGMENT_WORDS, this.wellMixed, { links: true });
        const crossing = this.wellMixed ? (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonBondCrossing)(membrane, SEGMENT_WORDS, { links: true }) : null;
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
    // Membrane edges follow the runtime tail links: after fusion/scission the
    // same buffer holds one outer loop plus inner loops of opposite winding, so
    // the signed shoelace sum over all link edges is the cytoplasm area (outer
    // minus inner) and the centroid is the cytoplasm centroid. The legacy fields
    // frontX, rearX, length, frontSpacing and rearSpacing stay index-based.
    cellShape(floats) {
        const n = this.membraneCount;
        const words = new Uint32Array(floats.buffer, floats.byteOffset, floats.length);
        const x = (i) => floats[i * SEGMENT_WORDS + 2];
        const y = (i) => floats[i * SEGMENT_WORDS + 3];
        const restArea = (n * this.membraneRestLength) ** 2 / (4 * Math.PI);
        let left = Infinity;
        let right = -Infinity;
        let top = Infinity;
        let bottom = -Infinity;
        // area-weighted centroid (shoelace) over all link edges
        let area = 0;
        let cx = 0;
        let cy = 0;
        for (let i = 0; i < n; i++) {
            left = Math.min(left, x(i));
            right = Math.max(right, x(i));
            top = Math.min(top, y(i));
            bottom = Math.max(bottom, y(i));
            const tail = words[i * SEGMENT_WORDS + TAIL];
            if (tail === i || tail >= n)
                continue; // free vertex or dead link: no edge
            const cross = x(i) * y(tail) - x(tail) * y(i);
            area += cross / 2;
            cx += (x(i) + x(tail)) * cross;
            cy += (y(i) + y(tail)) * cross;
        }
        const topology = (0,_occupancy__WEBPACK_IMPORTED_MODULE_0__.polygonLoops)(floats, SEGMENT_WORDS, n);
        const loopAreas = topology.loopAreas.map((loop) => ({ vertices: loop.vertices, area: loop.area / restArea }));
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
            loops: topology.loops,
            membraneBrokenLinks: topology.brokenLinks,
            loopAreas,
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
    let controlsBufferData = new ArrayBuffer(368);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLGNBQWM7QUFDZDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLDhDQUE4QyxFQUFFOztBQUVoRDs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFFO0FBQ0Y7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRixnQkFBZ0IsU0FBUzs7QUFFekI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0EsdURBQXVELElBQUksZ0JBQWdCOztBQUUzRTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU07O0FBRU47O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvREFBb0QsaUJBQWlCO0FBQ3JFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQSx3REFBd0QsaUJBQWlCO0FBQ3pFOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxNQUFNOztBQUVOO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0RBQStELGlCQUFpQjtBQUNoRixxREFBcUQsaUJBQWlCOztBQUV0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLEtBQUs7QUFDbEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLFFBQVEsaUJBQWlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7O0FBRUo7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLGNBQWM7QUFDckQsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBOzs7QUFHQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQWUsaURBQWlEO0FBQ2hFO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0EsWUFBWSxhQUFhO0FBQ3pCO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQSw4Q0FBOEMsbUJBQW1CO0FBQ2pFO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckI7QUFDQTtBQUNBLFlBQVksU0FBUztBQUNyQjtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEI7QUFDQTtBQUNBLFlBQVksS0FBSztBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRyxLQUFLOztBQUVSO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esc0RBQXNELElBQUksZ0JBQWdCOztBQUUxRTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQixZQUFZLHFCQUFxQjtBQUNqQztBQUNBLFlBQVksUUFBUTtBQUNwQixZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixzQkFBc0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsWUFBWSxRQUFRO0FBQ3BCLFlBQVksUUFBUTtBQUNwQjtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQSw0QkFBNEIsc0JBQXNCO0FBQ2xEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxRQUFRO0FBQ3BCLFlBQVksU0FBUztBQUNyQixjQUFjO0FBQ2Q7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsS0FBSzs7QUFFTDs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxxQkFBcUIsc0JBQXNCO0FBQzNDLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVksU0FBUztBQUNyQixjQUFjO0FBQ2Q7QUFDQTs7QUFFQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0EsaUVBQWlFLFFBQVE7QUFDekU7O0FBRUE7O0FBRUEsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTtBQUNBLGdFQUFnRSxTQUFTO0FBQ3pFOztBQUVBOztBQUVBLEtBQUs7O0FBRUw7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFlBQVksU0FBUztBQUNyQixjQUFjO0FBQ2Q7QUFDQSxnQkFBZ0I7QUFDaEIsdUJBQXVCO0FBQ3ZCLDZCQUE2QjtBQUM3QjtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7QUFDQSx1QkFBdUI7QUFDdkIsNkJBQTZCO0FBQzdCO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxLQUFLOztBQUVMLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLFlBQVksUUFBUTtBQUNwQixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxTQUFTO0FBQ3JCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFlBQVksVUFBVSxpRUFBaUUsR0FBRztBQUMxRixjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFVBQVUsaUVBQWlFLEdBQUc7QUFDMUYsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxlQUFlO0FBQzNCLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7O0FBRXlKOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3QxRWxKLFNBQVMsa0JBQWtCLENBQUMsQ0FBYSxFQUFFLFNBQWtCO0lBQ2xFLE1BQU0sTUFBTSxHQUFHO1FBQ2IsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJO1FBQ1gsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQ2hCLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUztRQUNoQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUk7UUFDWCxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUs7UUFDWixDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUc7UUFDVixDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU07UUFDYixDQUFDLENBQUMsaUJBQWlCO1FBQ25CLENBQUMsQ0FBQyxrQkFBa0I7UUFDcEIsQ0FBQyxDQUFDLFNBQVM7UUFDWCxDQUFDLENBQUMscUJBQXFCO1FBQ3ZCLENBQUMsQ0FBQyxXQUFXO1FBQ2IsQ0FBQyxDQUFDLE1BQU07S0FDVCxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDekIsSUFDRSxDQUFDLE1BQU07UUFDUCxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDO1FBQ2hCLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxDQUFDO1FBQ3pCLENBQUMsQ0FBQyxXQUFXLEtBQUssQ0FBQztRQUNuQixDQUFDLENBQUMsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDO1FBQ3ZDLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBQzlCLENBQUMsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDO1FBQ3hCLENBQUMsQ0FBQyxrQkFBa0IsR0FBRyxDQUFDLENBQUMsU0FBUztRQUNsQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDO1FBQzFDLENBQUMsQ0FBQyxxQkFBcUIsR0FBRyxDQUFDO1FBQzNCLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBRWhELE9BQU8sT0FBTyxDQUFDO0lBQ2pCLElBQUksQ0FBQyxDQUFDLHFCQUFxQixLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsa0JBQWtCLEtBQUssQ0FBQyxDQUFDLFNBQVM7UUFBRSxPQUFPLE9BQU8sQ0FBQztJQUMxRixnRkFBZ0Y7SUFDaEYsMkVBQTJFO0lBQzNFLE9BQU8sVUFBVSxDQUFDO0FBQ3BCLENBQUM7QUFFTSxTQUFTLGlCQUFpQixDQUFDLENBQWE7SUFDN0MsT0FBTztRQUNMLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSTtRQUNaLElBQUksRUFBRSxDQUFDLENBQUMsaUJBQWlCO1FBQ3pCLE9BQU8sRUFBRSxDQUFDLENBQUMsa0JBQWtCO1FBQzdCLE1BQU0sRUFBRSxDQUFDLENBQUMsU0FBUztRQUNuQixRQUFRLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsa0JBQWtCO1FBQzVDLFNBQVMsRUFBRSxDQUFDLENBQUMscUJBQXFCO1FBQ2xDLFdBQVcsRUFBRSxDQUFDLENBQUMsV0FBVztRQUMxQixNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU07UUFDaEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSTtRQUNqQixTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTO1FBQzNCLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVM7S0FDNUIsQ0FBQztBQUNKLENBQUM7QUEyQkQsNEVBQTRFO0FBQzVFLDZFQUE2RTtBQUN0RSxNQUFNLGVBQWU7SUFDMUIsTUFBTSxHQUFHLEtBQUssQ0FBQztJQUNOLE9BQU8sR0FBcUIsRUFBRSxDQUFDO0lBQ2hDLE9BQU8sR0FBeUIsSUFBSSxDQUFDO0lBQ3JDLElBQUksQ0FBZTtJQUMzQixZQUFZLElBQWtCO1FBQzVCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ25CLENBQUM7SUFDRCxJQUFJO1FBQ0YsT0FBTyxJQUFJLENBQUMsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBQ0QsT0FBTyxDQUFDLE9BQW1CO1FBQ3pCLElBQUksSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUNwQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztRQUNuQixNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUNqQixPQUFPLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLE1BQU0sTUFBTSxHQUFtQjtZQUM3QixXQUFXLEVBQUUsT0FBTyxDQUFDLElBQUk7WUFDekIsZ0JBQWdCLEVBQUUsT0FBTyxDQUFDLHFCQUFxQjtZQUMvQyxjQUFjLEVBQUUsT0FBTyxDQUFDLFNBQVMsR0FBRyxPQUFPLENBQUMsa0JBQWtCO1lBQzlELE1BQU0sRUFBRSxDQUFDO1lBQ1QsT0FBTyxFQUFFLFVBQVU7WUFDbkIsZUFBZSxFQUFFLENBQUM7U0FDbkIsQ0FBQztRQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzFCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsRUFBRTtZQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDbkQsSUFBSSxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3JCLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRTtZQUN2QixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxPQUFPLEdBQUcsSUFBSTtnQkFBRSxNQUFNLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDO1FBQ3pGLENBQUMsQ0FBQztRQUNGLE1BQU0sR0FBRyxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ3JCLElBQUksQ0FBQztnQkFDSCxDQUFDLENBQUMsTUFBTSxDQUFDLHdCQUF3QixNQUFNLENBQUMsY0FBYyxxQkFBcUIsT0FBTyxDQUFDLHFCQUFxQixlQUFlLENBQUMsQ0FBQztnQkFDekgsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQzlCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3pDLFdBQVcsRUFBRSxDQUFDO2dCQUNkLE1BQU0sQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQztnQkFDaEMsSUFBSSxJQUFJLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUNwRCxJQUFJLElBQUksS0FBSyxPQUFPLEVBQUUsQ0FBQztvQkFDckIsTUFBTSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQztvQkFDckMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO29CQUNoRCxPQUFPO2dCQUNULENBQUM7Z0JBQ0QsSUFBSSxJQUFJLEtBQUssVUFBVTtvQkFBRSxNQUFNLEtBQUssQ0FBQyxzREFBc0QsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM1SCxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEIsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDaEIsS0FBSyxNQUFNLFVBQVUsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7b0JBQ3hDLFdBQVcsRUFBRSxDQUFDO29CQUNkLENBQUMsQ0FBQyxNQUFNLENBQUMsaUNBQWlDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsVUFBVSxpQkFBaUIsQ0FBQyxDQUFDO29CQUN2RixNQUFNLENBQUMsZUFBZSxHQUFHLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztvQkFDcEQsTUFBTSxDQUFDLE1BQU0sSUFBSSxVQUFVLENBQUM7b0JBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQyxlQUFlLEVBQUU7d0JBQzFGLE1BQU0sS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7b0JBQ3JFLEtBQUssR0FBRyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztvQkFDMUIsTUFBTSxDQUFDLE1BQU0sR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekMsV0FBVyxFQUFFLENBQUM7b0JBQ2QsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxXQUFXO3dCQUFFLE1BQU0sS0FBSyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7b0JBQy9GLElBQUksR0FBRyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQ2hELElBQUksSUFBSSxLQUFLLE9BQU8sRUFBRSxDQUFDO3dCQUNyQixNQUFNLENBQUMsT0FBTyxHQUFHLFdBQVcsQ0FBQzt3QkFDN0IsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxvQ0FBb0MsTUFBTSxDQUFDLE1BQU0sV0FBVyxDQUFDLENBQUM7d0JBQ3ZFLE9BQU87b0JBQ1QsQ0FBQztvQkFDRCxJQUFJLElBQUksS0FBSyxVQUFVO3dCQUFFLE1BQU0sS0FBSyxDQUFDLGlEQUFpRCxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3pILENBQUM7Z0JBQ0QsTUFBTSxLQUFLLENBQUMsK0RBQStELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM5RyxDQUFDO1lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztnQkFDZixNQUFNLENBQUMsT0FBTyxHQUFHLFFBQVEsQ0FBQztnQkFDMUIsTUFBTSxDQUFDLEtBQUssR0FBRyxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7Z0JBQ3RFLElBQUksUUFBUSxFQUFFLENBQUM7b0JBQ2IsSUFBSSxDQUFDO3dCQUNILE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO29CQUNyQixDQUFDO29CQUFDLE9BQU8sYUFBYSxFQUFFLENBQUM7d0JBQ3ZCLE1BQU0sQ0FBQyxLQUFLLElBQUksc0JBQXNCLE1BQU0sQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDO29CQUNoRSxDQUFDO2dCQUNILENBQUM7Z0JBQ0QsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDO29CQUFTLENBQUM7Z0JBQ1QsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2dCQUNaLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLE9BQU8sQ0FBQztnQkFDckMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDdEIsQ0FBQztRQUNILENBQUMsQ0FBQztRQUNGLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDckIsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQ3RCLENBQUM7Q0FDRjs7Ozs7Ozs7Ozs7Ozs7OztBQ3hLbUU7QUFFN0QsS0FBSyxVQUFVLGFBQWEsQ0FDakMsTUFBaUIsRUFDakIsT0FBa0QsRUFDbEQsTUFBMkMsRUFDM0MsUUFBb0IsRUFDcEIsU0FBOEQ7SUFFOUQsTUFBTSxNQUFNLEdBQXdDLEVBQUUsQ0FBQztJQUN2RCxNQUFNLE1BQU0sR0FBRyxDQUFDLElBQVksRUFBRSxTQUFrQixFQUFFLEVBQUU7UUFDbEQsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsU0FBUztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLElBQUksRUFBRSxDQUFDLENBQUM7SUFDdkUsQ0FBQyxDQUFDO0lBQ0YsTUFBTSxJQUFJLEdBQUcsS0FBSyxFQUFFLE1BQWlCLEVBQUUsRUFBRTtRQUN2QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLGNBQWMsQ0FBQyxRQUFRLEdBQUcsY0FBYyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbkgsTUFBTSxPQUFPLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDOUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDN0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ3hDLE1BQU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM3QyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDZCxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDaEIsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDLENBQUM7SUFDRixNQUFNLEdBQUcsR0FBRyxLQUFLLEVBQUUsT0FBbUIsRUFBRSxNQUFrQixFQUFFLFNBQVMsR0FBRyxLQUFLLEVBQUUsYUFBYSxHQUFHLEdBQUcsRUFBRSxFQUFFO1FBQ3BHLE1BQU0sR0FBRyxHQUFHLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQ2hELEVBQUUsR0FBRyxJQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFDMUIsRUFBRSxHQUFHLElBQUksV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDekMsd0VBQXdFO1lBQ3hFLHFFQUFxRTtZQUNyRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUNsRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDckIsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDM0MsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDbkYsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzNDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUM3RCxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEIsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3hCLENBQUM7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUMvQyxFQUFFLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQzVCLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztR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R0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BGLElBQUksTUFBTSxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQUUsU0FBUyxDQUFDLDZDQUE2QztRQUMxRixNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDaEMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQyxFQUM1QixFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQzdCLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1RixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDL0gsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLFNBQVM7UUFDWCxDQUFDO1FBQ0QsS0FBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0IsSUFBSSxJQUFJO2dCQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQztJQUNILENBQUM7SUFDRCxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUMvQixDQUFDO0FBRUQsNkVBQTZFO0FBQzdFLCtFQUErRTtBQUN4RSxTQUFTLGdCQUFnQixDQUFDLFFBQXNCLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsS0FBSyxFQUFFLE9BQXFCO0lBQ3hHLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xFLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxFQUFvQixDQUFDO0lBQzFDLE9BQU8sQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFXLEVBQUU7UUFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzdELE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQ3ZCLEtBQUssR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNoQyxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzVELElBQUksS0FBSyxFQUFFLENBQUM7WUFDVixJQUFJLE1BQU0sR0FBRyxLQUFLLENBQUM7WUFDbkIsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUM7Z0JBQ25DLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ3JCLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7d0JBQUUsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDO2dCQUN0RyxDQUFDO1lBQ0gsT0FBTyxNQUFNLENBQUM7UUFDaEIsQ0FBQztRQUNELElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDL0IsSUFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2YsU0FBUyxHQUFHLEVBQUUsQ0FBQztZQUNmLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDO2dCQUNuQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO29CQUNyQixJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxLQUFLO3dCQUFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUM3RixDQUFDO1lBQ0gsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNoQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1QixDQUFDO1FBQ0QsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUNSLEVBQUUsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3hCLE9BQU8sRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDO1lBQ2YsTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVCLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQUUsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUM7O2dCQUNqQyxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBQ2hCLENBQUM7UUFDRCxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RCLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFTSxTQUFTLG1CQUFtQixDQUFDLFFBQXNCLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxPQUFxQjtJQUM1RixNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDMUUsT0FBTyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFFO1FBQ3hELE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQ2hCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUNaLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFDdkIsSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2QixJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQ3ZCLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxQixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO1lBQy9CLEtBQUssTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFO29CQUFFLFNBQVM7Z0JBQ3ZFLE1BQU0sV0FBVyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDO2dCQUMxQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEdBQUcsSUFBSTtvQkFBRSxTQUFTO2dCQUMzQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDO2dCQUNoRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLFdBQVcsQ0FBQztnQkFDNUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDaEUsQ0FBQztZQUNELE9BQU8sS0FBSyxDQUFDO1FBQ2YsQ0FBQyxDQUFDO1FBQ0YsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQ2pDLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztZQUFFLE9BQU8sT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzFDLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQztZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQy9CLEtBQUssSUFBSSxHQUFHLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxJQUFJLEVBQUUsR0FBRyxFQUFFO1lBQUUsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQUUsT0FBTyxJQUFJLENBQUM7UUFDdEYsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDLENBQUM7QUFDSixDQUFDO0FBUUQsOEVBQThFO0FBQzlFLDZFQUE2RTtBQUM3RSw4RUFBOEU7QUFDOUUsOEVBQThFO0FBQzlFLDhFQUE4RTtBQUM5RSw2RUFBNkU7QUFDN0UsOENBQThDO0FBQ3ZDLFNBQVMsWUFBWSxDQUFDLFFBQXNCLEVBQUUsTUFBTSxHQUFHLEVBQUUsRUFBRSxLQUFLLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNO0lBQ2hHLE1BQU0sS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDckYsTUFBTSxPQUFPLEdBQUcsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdEMsTUFBTSxTQUFTLEdBQXlDLEVBQUUsQ0FBQztJQUMzRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDcEIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQy9CLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1FBQzNDLHNFQUFzRTtRQUN0RSxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDO1lBQUUsV0FBVyxFQUFFLENBQUM7UUFDcEcsSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSztZQUFFLFNBQVM7UUFDeEQsbUVBQW1FO1FBQ25FLElBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztRQUNoQixJQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFDakIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLElBQUksTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQixTQUFTLENBQUM7WUFDUixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDO1lBQ2pELElBQUksSUFBSSxLQUFLLE9BQU8sSUFBSSxJQUFJLElBQUksS0FBSztnQkFBRSxNQUFNO1lBQzdDLFFBQVEsSUFBSSxRQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUN4SSxRQUFRLEVBQUUsQ0FBQztZQUNYLElBQUksSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNmLE1BQU0sR0FBRyxJQUFJLENBQUM7Z0JBQ2QsTUFBTTtZQUNSLENBQUM7WUFDRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUM7Z0JBQUUsTUFBTTtZQUN6QixPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLENBQUM7UUFDRCxJQUFJLE1BQU07WUFBRSxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxRQUFRLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0QsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDOUQsT0FBTyxFQUFFLEtBQUssRUFBRSxTQUFTLENBQUMsTUFBTSxFQUFFLFdBQVcsRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUM3RCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM5SkQsZ0ZBQWdGO0FBQ2hGLG1GQUFtRjtBQUM1RSxTQUFTLFlBQVksQ0FBQyxJQUFZO0lBQ3ZDLElBQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLENBQUM7SUFDdkIsT0FBTyxHQUFHLEVBQUU7UUFDVixLQUFLLEdBQUcsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNyRCxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUMxQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDL0MsQ0FBQyxDQUFDO0FBQ0osQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ1ZNLE1BQU0sV0FBVztJQUNkLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDWCxVQUFVLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZCLE1BQU0sQ0FBQyxRQUFnQixFQUFFLFNBQWlCO1FBQ3hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2hGLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RyxDQUFDO0lBQ0QsT0FBTyxDQUFDLEtBQWEsRUFBRSxPQUFlLEVBQUUsUUFBZ0I7UUFDdEQsNEVBQTRFO1FBQzVFLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQztRQUMzRixJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUM3RixDQUFDO0NBQ0Y7QUFHRCxTQUFTLFlBQVksQ0FBQyxNQUFnQjtJQUNwQyxNQUFNLE1BQU0sR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sTUFBTSxDQUFDLE1BQU07UUFDbEIsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxJQUFJLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDeEksQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNYLENBQUM7QUFDTSxNQUFNLGVBQWU7SUFDbEIsTUFBTSxHQUFrQixFQUFFLENBQUM7SUFDM0IsTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM5QixZQUFZLEdBQUcsQ0FBQyxDQUFDO0lBQ1QsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0lBQ3JCLE9BQU8sR0FBRyxDQUFDLENBQUM7SUFDcEIsZUFBZSxHQUFHLENBQUMsQ0FBQztJQUNwQixLQUFLO1FBQ0gsSUFBSSxDQUFDLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDakMsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUNELGFBQWE7UUFDWCxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMxRCxDQUFDO0lBQ0QsS0FBSyxDQUFDLE1BQW1CLEVBQUUsS0FBc0M7UUFDL0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekIsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFHO1lBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsRCxJQUFJLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDMUMsSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUMvRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQztZQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN2QyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUc7Z0JBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNwRCxDQUFDO0lBQ0gsQ0FBQztJQUNELFdBQVc7UUFDVCxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDekIsQ0FBQztJQUNELFFBQVE7UUFDTixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxFQUN4QixJQUFJLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0UsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyRSxPQUFPO1lBQ0wsWUFBWSxFQUFFLE1BQU0sQ0FBQyxNQUFNO1lBQzNCLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDaEQsY0FBYyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbEYsZUFBZSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUM7WUFDeEMsUUFBUSxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDckQsV0FBVyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDM0QsdUJBQXVCLEVBQUUsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDbEQsZUFBZSxFQUFFLElBQUksQ0FBQyxlQUFlO1NBQ3RDLENBQUM7SUFDSixDQUFDO0NBQ0Y7Ozs7Ozs7Ozs7Ozs7OztBQy9ETSxNQUFNLFlBQVk7SUFDZixNQUFNLENBQVk7SUFDbEIsWUFBWSxDQUFtQjtJQUV2QyxzQkFBc0I7SUFDZCxtQkFBbUIsQ0FBYTtJQUNoQyxxQkFBcUIsQ0FBcUI7SUFDMUMsY0FBYyxDQUFvQjtJQUNsQyxvQkFBb0IsQ0FBZTtJQUNuQyxlQUFlLENBQWU7SUFDOUIsZ0JBQWdCLENBQXFCO0lBQ3JDLGlCQUFpQixDQUFlO0lBQ2hDLGNBQWMsQ0FBcUI7SUFDbkMsZ0JBQWdCLENBQVU7SUFDMUIsVUFBVSxDQUFZO0lBQ3RCLElBQUksQ0FBb0M7SUFDeEMsTUFBTSxDQUFvQztJQUNsRCw0RkFBNEY7SUFDbkYsSUFBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDMUosUUFBUSxHQUFHLENBQUMsQ0FBQztJQUNaLE1BQU0sQ0FBMkI7SUFDbEMsWUFBWSxDQUEyQjtJQUV2QyxNQUFNLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUM3QyxhQUFhLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsTUFBYztRQUNwRSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssSUFBSSxJQUFJLElBQUksTUFBTSxJQUFJLEdBQUc7WUFBRSxPQUFPO1FBQ2pHLElBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNyRSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRyxJQUFJLEVBQUUsTUFBTSxFQUFFLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUM5RCxDQUFDO0lBQ08sVUFBVTtRQUNoQixtRkFBbUY7UUFDbkYsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUs7WUFBRSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ3pKLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDN0osQ0FBQztJQUNELGNBQWM7UUFDWixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTztZQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMxRCxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTTtZQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDdEUsQ0FBQztJQUNPLFdBQVc7UUFDakIsT0FBTyxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNwSSxDQUFDO0lBQ08sV0FBVztRQUNqQixPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3hJLENBQUM7SUFDRCxhQUFhLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzdILENBQUM7SUFDRCxhQUFhLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDaEMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSTtZQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDckMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO0lBQzdILENBQUM7SUFFTyx1QkFBdUIsQ0FBbUI7SUFDMUMsc0JBQXNCLENBQW1CO0lBRWpELFlBQ0UsTUFBaUIsRUFDakIsWUFBOEIsRUFDOUIsVUFBNkMsRUFDN0MsWUFBNkIsRUFDN0IsUUFFQyxFQUNELG1CQUE4QyxFQUM5QyxzQkFBMkMsRUFDM0MsUUFBMEIsRUFDMUIsZ0JBQTZCLEVBQzdCLFVBQVUsR0FBRyxVQUFVO1FBRXZCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxZQUFZLEdBQUcsWUFBWSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO1FBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUUsVUFBVSxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDcEUsSUFBSSxDQUFDLFlBQVksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzNHLElBQUksQ0FBQyxzQkFBc0IsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUVwRyxNQUFNLDRCQUE0QixHQUFHLEVBQUUsQ0FBQztRQUN4QyxJQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxjQUFjLENBQUMsT0FBTyxHQUFHLGNBQWMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO1FBQzdHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLGdCQUFnQixDQUFDO1FBQzFDLE1BQU0sUUFBUSxHQUNaLGdCQUFnQjtZQUNoQixNQUFNLENBQUMsYUFBYSxDQUFDO2dCQUNuQixJQUFJLEVBQUUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDakQsTUFBTSxFQUFFLGFBQWE7Z0JBQ3JCLEtBQUssRUFBRSxlQUFlLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxlQUFlO2FBQ3pFLENBQUMsQ0FBQztRQUNMLE1BQU0sWUFBWSxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQyxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7WUFDbEQsT0FBTyxFQUFFO2dCQUNQLEdBQUcsbUJBQW1CO2dCQUN0QixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLG1CQUFtQixFQUFFLEVBQUU7Z0JBQzFGLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsY0FBYyxDQUFDLE9BQU8sRUFBRSxjQUFjLEVBQUUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sRUFBRSxhQUFhLEVBQUUsRUFBRTthQUNySDtTQUNGLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxNQUFNLENBQUMsZUFBZSxDQUFDO1lBQzlDLE1BQU0sRUFBRSxjQUFjO1lBQ3RCLE9BQU8sRUFBRSxDQUFDLEdBQUcsc0JBQXNCLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxDQUFDO1NBQ25ILENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxNQUFNLENBQUMscUJBQXFCLENBQUM7WUFDbkQsTUFBTSxFQUFFLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFLGdCQUFnQixFQUFFLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUMzRSxPQUFPLEVBQUUsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxnQkFBZ0IsRUFBRTtTQUNoRSxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDbkQsSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsTUFBTSxDQUFDO1lBQzNDLE1BQU0sRUFBRSxZQUFZO1lBQ3BCLEtBQUssRUFBRSxlQUFlLENBQUMsZUFBZSxHQUFHLGVBQWUsQ0FBQyxlQUFlLEdBQUcsZUFBZSxDQUFDLFFBQVE7U0FDcEcsQ0FBQyxDQUFDO1FBRUgsTUFBTSwwQkFBMEIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDO1lBQ25FLEtBQUssRUFBRSw0QkFBNEI7WUFDbkMsT0FBTyxFQUFFO2dCQUNQLEdBQUcsbUJBQW1CO2dCQUN0QixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxFQUFFO2dCQUNyRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxFQUFFO2dCQUNuRixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxFQUFFO2dCQUNoRjtvQkFDRSxPQUFPLEVBQUUsNEJBQTRCO29CQUNyQyxVQUFVLEVBQUUsY0FBYyxDQUFDLE9BQU8sR0FBRyxjQUFjLENBQUMsUUFBUTtvQkFDNUQsY0FBYyxFQUFFO3dCQUNkLE1BQU0sRUFBRSxZQUFZO3dCQUNwQixNQUFNLEVBQUUsWUFBWTtxQkFDckI7aUJBQ0Y7YUFDRjtTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQztZQUN0RCxLQUFLLEVBQUUseUJBQXlCO1lBQ2hDLE1BQU0sRUFBRSwwQkFBMEI7WUFDbEMsT0FBTyxFQUFFO2dCQUNQLEdBQUcsc0JBQXNCO2dCQUN6QixFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRTtnQkFDdkMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFBRTtnQkFDN0YsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7Z0JBQ3REO29CQUNFLE9BQU8sRUFBRSw0QkFBNEI7b0JBQ3JDLFFBQVEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsVUFBVSxFQUFFO2lCQUNoRDthQUNGO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1lBQ2pFLEtBQUssRUFBRSwyQkFBMkI7WUFDbEMsZ0JBQWdCLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQztTQUMvQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztZQUM3RCxNQUFNLEVBQUUseUJBQXlCO1lBQ2pDLE9BQU8sRUFBRSxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRTtTQUN4RCxDQUFDLENBQUM7UUFFSCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUM5QyxTQUFTLEVBQUUsU0FBUztZQUNwQixTQUFTLEVBQUUsU0FBUztTQUNyQixDQUFDLENBQUM7UUFFSCxNQUFNLHFCQUFxQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLENBQUM7WUFDOUQsS0FBSyxFQUFFLDBCQUEwQjtZQUNqQyxPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLElBQUksRUFBRSxlQUFlLEVBQUUsRUFBRTtnQkFDdkYsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFVBQVUsRUFBRSxjQUFjLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUU7YUFDakU7U0FDRixDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO1lBQ2pELEtBQUssRUFBRSxtQkFBbUI7WUFDMUIsTUFBTSxFQUFFLHFCQUFxQjtZQUM3QixPQUFPLEVBQUU7Z0JBQ1AsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUU7Z0JBQ3ZDLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxFQUFFO2FBQ2hFO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1lBQ3JELEtBQUssRUFBRSxpQkFBaUI7WUFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CLENBQUM7Z0JBQ3ZDLGdCQUFnQixFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLHFCQUFxQixDQUFDO2FBQzlGLENBQUM7WUFDRixNQUFNLEVBQUU7Z0JBQ04sTUFBTSxFQUFFLFlBQVk7Z0JBQ3BCLFVBQVUsRUFBRSxNQUFNO2FBQ25CO1lBQ0QsUUFBUSxFQUFFO2dCQUNSLE1BQU0sRUFBRSxZQUFZO2dCQUNwQixVQUFVLEVBQUUsTUFBTTtnQkFDbEIsT0FBTyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO2FBQ3pDO1lBQ0QsU0FBUyxFQUFFO2dCQUNULFFBQVEsRUFBRSxlQUFlO2FBQzFCO1NBQ0YsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELHNCQUFzQixDQUFDLE9BQTRCLEVBQUUsUUFBMEIsRUFBRSxNQUFzQjtRQUNyRyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDO1lBQ2pDLE1BQU0sRUFBRSxJQUFJLENBQUMsY0FBYztZQUMzQixPQUFPLEVBQUUsQ0FBQyxHQUFHLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUM7U0FDOUYsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUNELGNBQWMsQ0FBQyxPQUEwQixFQUFFLEtBQW1CO1FBQzVELE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFDekQsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxhQUErQixFQUFFLFFBQXNCLEVBQUUsYUFBeUIsRUFBRSxZQUF3QjtRQUN4SCxvQ0FBb0M7UUFDcEMsTUFBTSxHQUFHLEdBQUcsV0FBVyxDQUFDLEdBQUcsRUFBRSxFQUMzQixJQUFJLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hHLElBQUksQ0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO1FBQ3BCLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO1lBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDOUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO1FBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQ2xDLENBQUMsR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFDOUIsQ0FBQyxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENB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LEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLG1DQUFtQyxFQUFFLEtBQUssQ0FBQztLQUN0RCxFQUFFLENBQUM7UUFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkksQ0FBQztJQUNELFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFB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Q0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFNUMsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO1FBQzlCLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDcEIsQ0FBQztDQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL25vZGVfbW9kdWxlcy9saWwtZ3VpL2Rpc3QvbGlsLWd1aS5lc20uanMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9jb250YWN0LXJlY292ZXJ5LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvZW5jbG9zdXJlLXRlc3QudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL21lY2hhbmljcy10ZXN0LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvb2NjdXBhbmN5LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvcmFuZG9tLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvcmVhbHRpbWUudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yZW5kZXIudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yZW5ld2FsLXRlc3QudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9zaW11bGF0ZS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3Nwcm91dHMudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy90ZWxlbWV0cnktYW5hbHlzaXMudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy90ZWxlbWV0cnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy91dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGxpbC1ndWlcbiAqIGh0dHBzOi8vbGlsLWd1aS5nZW9yZ2VhbHdheXMuY29tXG4gKiBAdmVyc2lvbiAwLjIwLjBcbiAqIEBhdXRob3IgR2VvcmdlIE1pY2hhZWwgQnJvd2VyXG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBjb250cm9sbGVycy5cbiAqL1xuY2xhc3MgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgY2xhc3NOYW1lLCBlbGVtZW50VHlwZSA9ICdkaXYnICkge1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEdVSSB0aGF0IGNvbnRhaW5zIHRoaXMgY29udHJvbGxlci5cblx0XHQgKiBAdHlwZSB7R1VJfVxuXHRcdCAqL1xuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG9iamVjdCB0aGlzIGNvbnRyb2xsZXIgd2lsbCBtb2RpZnkuXG5cdFx0ICogQHR5cGUge29iamVjdH1cblx0XHQgKi9cblx0XHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjb250cm9sLlxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNvbnRyb2xsZXIgaXMgZGlzYWJsZWQuXG5cdFx0ICogVXNlIGBjb250cm9sbGVyLmRpc2FibGUoIHRydWV8ZmFsc2UgKWAgdG8gbW9kaWZ5IHRoaXMgdmFsdWUuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5fZGlzYWJsZWQgPSBmYWxzZTtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBDb250cm9sbGVyIGlzIGhpZGRlbi5cblx0XHQgKiBVc2UgYGNvbnRyb2xsZXIuc2hvdygpYCBvciBgY29udHJvbGxlci5oaWRlKClgIHRvIGNoYW5nZSB0aGlzLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2hpZGRlbiA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHZhbHVlIG9mIGBvYmplY3RbIHByb3BlcnR5IF1gIHdoZW4gdGhlIGNvbnRyb2xsZXIgd2FzIGNyZWF0ZWQuXG5cdFx0ICogQHR5cGUge2FueX1cblx0XHQgKi9cblx0XHR0aGlzLmluaXRpYWxWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBvdXRlcm1vc3QgY29udGFpbmVyIERPTSBlbGVtZW50IGZvciB0aGlzIGNvbnRyb2xsZXIuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIGVsZW1lbnRUeXBlICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdjb250cm9sbGVyJyApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb250cm9sbGVyJ3MgbmFtZS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kbmFtZS5jbGFzc0xpc3QuYWRkKCAnbmFtZScgKTtcblxuXHRcdENvbnRyb2xsZXIubmV4dE5hbWVJRCA9IENvbnRyb2xsZXIubmV4dE5hbWVJRCB8fCAwO1xuXHRcdHRoaXMuJG5hbWUuaWQgPSBgbGlsLWd1aS1uYW1lLSR7KytDb250cm9sbGVyLm5leHROYW1lSUR9YDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb250cm9sbGVyJ3MgXCJ3aWRnZXRcIiAod2hpY2ggZGlmZmVycyBieSBjb250cm9sbGVyIHR5cGUpLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiR3aWRnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJHdpZGdldC5jbGFzc0xpc3QuYWRkKCAnd2lkZ2V0JyApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgcmVjZWl2ZXMgdGhlIGRpc2FibGVkIGF0dHJpYnV0ZSB3aGVuIHVzaW5nIGRpc2FibGUoKS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJHdpZGdldDtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kbmFtZSApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kd2lkZ2V0ICk7XG5cblx0XHQvLyBEb24ndCBmaXJlIGdsb2JhbCBrZXkgZXZlbnRzIHdoaWxlIHR5cGluZyBpbiBhIGNvbnRyb2xsZXJcblx0XHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCkgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgZSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpICk7XG5cblx0XHR0aGlzLnBhcmVudC5jaGlsZHJlbi5wdXNoKCB0aGlzICk7XG5cdFx0dGhpcy5wYXJlbnQuY29udHJvbGxlcnMucHVzaCggdGhpcyApO1xuXG5cdFx0dGhpcy5wYXJlbnQuJGNoaWxkcmVuLmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdHRoaXMuX2xpc3RlbkNhbGxiYWNrID0gdGhpcy5fbGlzdGVuQ2FsbGJhY2suYmluZCggdGhpcyApO1xuXG5cdFx0dGhpcy5uYW1lKCBwcm9wZXJ0eSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbmFtZSBvZiB0aGUgY29udHJvbGxlciBhbmQgaXRzIGxhYmVsIGluIHRoZSBHVUkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bmFtZSggbmFtZSApIHtcblx0XHQvKipcblx0XHQgKiBUaGUgY29udHJvbGxlcidzIG5hbWUuIFVzZSBgY29udHJvbGxlci5uYW1lKCAnTmFtZScgKWAgdG8gbW9kaWZ5IHRoaXMgdmFsdWUuXG5cdFx0ICogQHR5cGUge3N0cmluZ31cblx0XHQgKi9cblx0XHR0aGlzLl9uYW1lID0gbmFtZTtcblx0XHR0aGlzLiRuYW1lLnRleHRDb250ZW50ID0gbmFtZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBpcyBtb2RpZmllZCBieSB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqIFRoZSBmdW5jdGlvbiByZWNlaXZlcyB0aGUgbmV3IHZhbHVlIGFzIGl0cyBmaXJzdCBwYXJhbWV0ZXIuIFRoZSB2YWx1ZSBvZiBgdGhpc2Agd2lsbCBiZSB0aGVcblx0ICogY29udHJvbGxlci5cblx0ICpcblx0ICogRm9yIGZ1bmN0aW9uIGNvbnRyb2xsZXJzLCB0aGUgYG9uQ2hhbmdlYCBjYWxsYmFjayB3aWxsIGJlIGZpcmVkIG9uIGNsaWNrLCBhZnRlciB0aGUgZnVuY3Rpb25cblx0ICogZXhlY3V0ZXMuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb25zdCBjb250cm9sbGVyID0gZ3VpLmFkZCggb2JqZWN0LCAncHJvcGVydHknICk7XG5cdCAqXG5cdCAqIGNvbnRyb2xsZXIub25DaGFuZ2UoIGZ1bmN0aW9uKCB2ICkge1xuXHQgKiBcdGNvbnNvbGUubG9nKCAnVGhlIHZhbHVlIGlzIG5vdyAnICsgdiApO1xuXHQgKiBcdGNvbnNvbGUuYXNzZXJ0KCB0aGlzID09PSBjb250cm9sbGVyICk7XG5cdCAqIH0gKTtcblx0ICovXG5cdG9uQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlIGRpcmVjdGx5LlxuXHRcdCAqIFVzZSB0aGUgYGNvbnRyb2xsZXIub25DaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkNoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxzIHRoZSBvbkNoYW5nZSBtZXRob2RzIG9mIHRoaXMgY29udHJvbGxlciBhbmQgaXRzIHBhcmVudCBHVUkuXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdF9jYWxsT25DaGFuZ2UoKSB7XG5cblx0XHR0aGlzLnBhcmVudC5fY2FsbE9uQ2hhbmdlKCB0aGlzICk7XG5cblx0XHRpZiAoIHRoaXMuX29uQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbkNoYW5nZS5jYWxsKCB0aGlzLCB0aGlzLmdldFZhbHVlKCkgKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhpcyBjb250cm9sbGVyIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBsb3NlcyBmb2N1cy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IGNvbnRyb2xsZXIgPSBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKTtcblx0ICpcblx0ICogY29udHJvbGxlci5vbkZpbmlzaENoYW5nZSggZnVuY3Rpb24oIHYgKSB7XG5cdCAqIFx0Y29uc29sZS5sb2coICdDaGFuZ2VzIGNvbXBsZXRlOiAnICsgdiApO1xuXHQgKiBcdGNvbnNvbGUuYXNzZXJ0KCB0aGlzID09PSBjb250cm9sbGVyICk7XG5cdCAqIH0gKTtcblx0ICovXG5cdG9uRmluaXNoQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uRmluaXNoQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGNvbnRyb2xsZXIub25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNob3VsZCBiZSBjYWxsZWQgYnkgQ29udHJvbGxlciB3aGVuIGl0cyB3aWRnZXRzIGxvc2UgZm9jdXMuXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdF9jYWxsT25GaW5pc2hDaGFuZ2UoKSB7XG5cblx0XHRpZiAoIHRoaXMuX2NoYW5nZWQgKSB7XG5cblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25GaW5pc2hDaGFuZ2UoIHRoaXMgKTtcblxuXHRcdFx0aWYgKCB0aGlzLl9vbkZpbmlzaENoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZS5jYWxsKCB0aGlzLCB0aGlzLmdldFZhbHVlKCkgKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHRoaXMuX2NoYW5nZWQgPSBmYWxzZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGNvbnRyb2xsZXIgYmFjayB0byBpdHMgaW5pdGlhbCB2YWx1ZS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRyZXNldCgpIHtcblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLmluaXRpYWxWYWx1ZSApO1xuXHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhpcyBjb250cm9sbGVyLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWRcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnRyb2xsZXIuZW5hYmxlKCk7XG5cdCAqIGNvbnRyb2xsZXIuZW5hYmxlKCBmYWxzZSApOyAvLyBkaXNhYmxlXG5cdCAqIGNvbnRyb2xsZXIuZW5hYmxlKCBjb250cm9sbGVyLl9kaXNhYmxlZCApOyAvLyB0b2dnbGVcblx0ICovXG5cdGVuYWJsZSggZW5hYmxlZCA9IHRydWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZGlzYWJsZSggIWVuYWJsZWQgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNhYmxlcyB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gZGlzYWJsZWRcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnRyb2xsZXIuZGlzYWJsZSgpO1xuXHQgKiBjb250cm9sbGVyLmRpc2FibGUoIGZhbHNlICk7IC8vIGVuYWJsZVxuXHQgKiBjb250cm9sbGVyLmRpc2FibGUoICFjb250cm9sbGVyLl9kaXNhYmxlZCApOyAvLyB0b2dnbGVcblx0ICovXG5cdGRpc2FibGUoIGRpc2FibGVkID0gdHJ1ZSApIHtcblxuXHRcdGlmICggZGlzYWJsZWQgPT09IHRoaXMuX2Rpc2FibGVkICkgcmV0dXJuIHRoaXM7XG5cblx0XHR0aGlzLl9kaXNhYmxlZCA9IGRpc2FibGVkO1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoICdkaXNhYmxlZCcsIGRpc2FibGVkICk7XG5cdFx0dGhpcy4kZGlzYWJsZS50b2dnbGVBdHRyaWJ1dGUoICdkaXNhYmxlZCcsIGRpc2FibGVkICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNob3dzIHRoZSBDb250cm9sbGVyIGFmdGVyIGl0J3MgYmVlbiBoaWRkZW4uXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29udHJvbGxlci5zaG93KCk7XG5cdCAqIGNvbnRyb2xsZXIuc2hvdyggZmFsc2UgKTsgLy8gaGlkZVxuXHQgKiBjb250cm9sbGVyLnNob3coIGNvbnRyb2xsZXIuX2hpZGRlbiApOyAvLyB0b2dnbGVcblx0ICovXG5cdHNob3coIHNob3cgPSB0cnVlICkge1xuXG5cdFx0dGhpcy5faGlkZGVuID0gIXNob3c7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHRoaXMuX2hpZGRlbiA/ICdub25lJyA6ICcnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIaWRlcyB0aGUgQ29udHJvbGxlci5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRoaWRlKCkge1xuXHRcdHJldHVybiB0aGlzLnNob3coIGZhbHNlICk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGlzIGNvbnRyb2xsZXIgaW50byBhIGRyb3Bkb3duIG9mIG9wdGlvbnMuXG5cdCAqXG5cdCAqIENhbGxpbmcgdGhpcyBtZXRob2Qgb24gYW4gb3B0aW9uIGNvbnRyb2xsZXIgd2lsbCBzaW1wbHkgdXBkYXRlIHRoZSBvcHRpb25zLiBIb3dldmVyLCBpZiB0aGlzXG5cdCAqIGNvbnRyb2xsZXIgd2FzIG5vdCBhbHJlYWR5IGFuIG9wdGlvbiBjb250cm9sbGVyLCBvbGQgcmVmZXJlbmNlcyB0byB0aGlzIGNvbnRyb2xsZXIgYXJlXG5cdCAqIGRlc3Ryb3llZCwgYW5kIGEgbmV3IGNvbnRyb2xsZXIgaXMgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgR1VJLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiAvLyBzYWZlIHVzYWdlXG5cdCAqXG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AxJyApLm9wdGlvbnMoIFsgJ2EnLCAnYicsICdjJyBdICk7XG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AyJyApLm9wdGlvbnMoIHsgQmlnOiAxMCwgU21hbGw6IDEgfSApO1xuXHQgKiBndWkuYWRkKCBvYmosICdwcm9wMycgKTtcblx0ICpcblx0ICogLy8gZGFuZ2VyXG5cdCAqXG5cdCAqIGNvbnN0IGN0cmwxID0gZ3VpLmFkZCggb2JqLCAncHJvcDEnICk7XG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AyJyApO1xuXHQgKlxuXHQgKiAvLyBjYWxsaW5nIG9wdGlvbnMgb3V0IG9mIG9yZGVyIGFkZHMgYSBuZXcgY29udHJvbGxlciB0byB0aGUgZW5kLi4uXG5cdCAqIGNvbnN0IGN0cmwyID0gY3RybDEub3B0aW9ucyggWyAnYScsICdiJywgJ2MnIF0gKTtcblx0ICpcblx0ICogLy8gLi4uYW5kIGN0cmwxIG5vdyByZWZlcmVuY2VzIGEgY29udHJvbGxlciB0aGF0IGRvZXNuJ3QgZXhpc3Rcblx0ICogYXNzZXJ0KCBjdHJsMiAhPT0gY3RybDEgKVxuXHQgKiBAcGFyYW0ge29iamVjdHxBcnJheX0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcn1cblx0ICovXG5cdG9wdGlvbnMoIG9wdGlvbnMgKSB7XG5cdFx0Y29uc3QgY29udHJvbGxlciA9IHRoaXMucGFyZW50LmFkZCggdGhpcy5vYmplY3QsIHRoaXMucHJvcGVydHksIG9wdGlvbnMgKTtcblx0XHRjb250cm9sbGVyLm5hbWUoIHRoaXMuX25hbWUgKTtcblx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHRyZXR1cm4gY29udHJvbGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtaW5pbXVtIHZhbHVlLiBPbmx5IHdvcmtzIG9uIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQHBhcmFtIHtudW1iZXJ9IG1pblxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdG1pbiggbWluICkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1heGltdW0gdmFsdWUuIE9ubHkgd29ya3Mgb24gbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gbWF4XG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bWF4KCBtYXggKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVmFsdWVzIHNldCBieSB0aGlzIGNvbnRyb2xsZXIgd2lsbCBiZSByb3VuZGVkIHRvIG11bHRpcGxlcyBvZiBgc3RlcGAuIE9ubHkgd29ya3Mgb24gbnVtYmVyXG5cdCAqIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gc3RlcFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHN0ZXAoIHN0ZXAgKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUm91bmRzIHRoZSBkaXNwbGF5ZWQgdmFsdWUgdG8gYSBmaXhlZCBudW1iZXIgb2YgZGVjaW1hbHMsIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBhY3R1YWwgdmFsdWVcblx0ICogbGlrZSBgc3RlcCgpYC4gT25seSB3b3JrcyBvbiBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApLmxpc3RlbigpLmRlY2ltYWxzKCA0ICk7XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFsc1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGRlY2ltYWxzKCBkZWNpbWFscyApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxscyBgdXBkYXRlRGlzcGxheSgpYCBldmVyeSBhbmltYXRpb24gZnJhbWUuIFBhc3MgYGZhbHNlYCB0byBzdG9wIGxpc3RlbmluZy5cblx0ICogQHBhcmFtIHtib29sZWFufSBsaXN0ZW5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRsaXN0ZW4oIGxpc3RlbiA9IHRydWUgKSB7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgY29udHJvbGxlciBpcyBjdXJyZW50bHkgbGlzdGVuaW5nLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBjb250cm9sbGVyLmxpc3RlbiggdHJ1ZXxmYWxzZSApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9saXN0ZW5pbmcgPSBsaXN0ZW47XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKCB0aGlzLl9saXN0ZW5DYWxsYmFja0lEICk7XG5cdFx0XHR0aGlzLl9saXN0ZW5DYWxsYmFja0lEID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fbGlzdGVuaW5nICkge1xuXHRcdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0X2xpc3RlbkNhbGxiYWNrKCkge1xuXG5cdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2tJRCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5fbGlzdGVuQ2FsbGJhY2sgKTtcblxuXHRcdC8vIFRvIHByZXZlbnQgZnJhbWVyYXRlIGxvc3MsIG1ha2Ugc3VyZSB0aGUgdmFsdWUgaGFzIGNoYW5nZWQgYmVmb3JlIHVwZGF0aW5nIHRoZSBkaXNwbGF5LlxuXHRcdC8vIE5vdGU6IHNhdmUoKSBpcyB1c2VkIGhlcmUgaW5zdGVhZCBvZiBnZXRWYWx1ZSgpIG9ubHkgYmVjYXVzZSBvZiBDb2xvckNvbnRyb2xsZXIuIFRoZSAhPT0gb3BlcmF0b3Jcblx0XHQvLyB3b24ndCB3b3JrIGZvciBjb2xvciBvYmplY3RzIG9yIGFycmF5cywgYnV0IENvbG9yQ29udHJvbGxlci5zYXZlKCkgYWx3YXlzIHJldHVybnMgYSBzdHJpbmcuXG5cblx0XHRjb25zdCBjdXJWYWx1ZSA9IHRoaXMuc2F2ZSgpO1xuXG5cdFx0aWYgKCBjdXJWYWx1ZSAhPT0gdGhpcy5fbGlzdGVuUHJldlZhbHVlICkge1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fbGlzdGVuUHJldlZhbHVlID0gY3VyVmFsdWU7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGBvYmplY3RbIHByb3BlcnR5IF1gLlxuXHQgKiBAcmV0dXJucyB7YW55fVxuXHQgKi9cblx0Z2V0VmFsdWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMub2JqZWN0WyB0aGlzLnByb3BlcnR5IF07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgb2YgYG9iamVjdFsgcHJvcGVydHkgXWAsIGludm9rZXMgYW55IGBvbkNoYW5nZWAgaGFuZGxlcnMgYW5kIHVwZGF0ZXMgdGhlIGRpc3BsYXkuXG5cdCAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHNldFZhbHVlKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdGhpcy5nZXRWYWx1ZSgpICE9PSB2YWx1ZSApIHtcblxuXHRcdFx0dGhpcy5vYmplY3RbIHRoaXMucHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0dGhpcy5fY2FsbE9uQ2hhbmdlKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZGlzcGxheSB0byBrZWVwIGl0IGluIHN5bmMgd2l0aCB0aGUgY3VycmVudCB2YWx1ZS4gVXNlZnVsIGZvciB1cGRhdGluZyB5b3VyXG5cdCAqIGNvbnRyb2xsZXJzIHdoZW4gdGhlaXIgdmFsdWVzIGhhdmUgYmVlbiBtb2RpZmllZCBvdXRzaWRlIG9mIHRoZSBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGxvYWQoIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzYXZlKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFZhbHVlKCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveXMgdGhpcyBjb250cm9sbGVyIGFuZCByZW1vdmVzIGl0IGZyb20gdGhlIHBhcmVudCBHVUkuXG5cdCAqL1xuXHRkZXN0cm95KCkge1xuXHRcdHRoaXMubGlzdGVuKCBmYWxzZSApO1xuXHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnNwbGljZSggdGhpcy5wYXJlbnQuY2hpbGRyZW4uaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0dGhpcy5wYXJlbnQuY29udHJvbGxlcnMuc3BsaWNlKCB0aGlzLnBhcmVudC5jb250cm9sbGVycy5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHR0aGlzLnBhcmVudC4kY2hpbGRyZW4ucmVtb3ZlQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXHR9XG5cbn1cblxuY2xhc3MgQm9vbGVhbkNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5ICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ2Jvb2xlYW4nLCAnbGFiZWwnICk7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ2NoZWNrYm94JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLiRpbnB1dC5jaGVja2VkICk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kaW5wdXQ7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHR0aGlzLiRpbnB1dC5jaGVja2VkID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQ29sb3JTdHJpbmcoIHN0cmluZyApIHtcblxuXHRsZXQgbWF0Y2gsIHJlc3VsdDtcblxuXHRpZiAoIG1hdGNoID0gc3RyaW5nLm1hdGNoKCAvKCN8MHgpPyhbYS1mMC05XXs2fSkvaSApICkge1xuXG5cdFx0cmVzdWx0ID0gbWF0Y2hbIDIgXTtcblxuXHR9IGVsc2UgaWYgKCBtYXRjaCA9IHN0cmluZy5tYXRjaCggL3JnYlxcKFxccyooXFxkKilcXHMqLFxccyooXFxkKilcXHMqLFxccyooXFxkKilcXHMqXFwpLyApICkge1xuXG5cdFx0cmVzdWx0ID0gcGFyc2VJbnQoIG1hdGNoWyAxIF0gKS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggMiwgMCApXG5cdFx0XHQrIHBhcnNlSW50KCBtYXRjaFsgMiBdICkudG9TdHJpbmcoIDE2ICkucGFkU3RhcnQoIDIsIDAgKVxuXHRcdFx0KyBwYXJzZUludCggbWF0Y2hbIDMgXSApLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCAyLCAwICk7XG5cblx0fSBlbHNlIGlmICggbWF0Y2ggPSBzdHJpbmcubWF0Y2goIC9eIz8oW2EtZjAtOV0pKFthLWYwLTldKShbYS1mMC05XSkkL2kgKSApIHtcblxuXHRcdHJlc3VsdCA9IG1hdGNoWyAxIF0gKyBtYXRjaFsgMSBdICsgbWF0Y2hbIDIgXSArIG1hdGNoWyAyIF0gKyBtYXRjaFsgMyBdICsgbWF0Y2hbIDMgXTtcblxuXHR9XG5cblx0aWYgKCByZXN1bHQgKSB7XG5cdFx0cmV0dXJuICcjJyArIHJlc3VsdDtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcblxufVxuXG5jb25zdCBTVFJJTkcgPSB7XG5cdGlzUHJpbWl0aXZlOiB0cnVlLFxuXHRtYXRjaDogdiA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZycsXG5cdGZyb21IZXhTdHJpbmc6IG5vcm1hbGl6ZUNvbG9yU3RyaW5nLFxuXHR0b0hleFN0cmluZzogbm9ybWFsaXplQ29sb3JTdHJpbmdcbn07XG5cbmNvbnN0IElOVCA9IHtcblx0aXNQcmltaXRpdmU6IHRydWUsXG5cdG1hdGNoOiB2ID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJyxcblx0ZnJvbUhleFN0cmluZzogc3RyaW5nID0+IHBhcnNlSW50KCBzdHJpbmcuc3Vic3RyaW5nKCAxICksIDE2ICksXG5cdHRvSGV4U3RyaW5nOiB2YWx1ZSA9PiAnIycgKyB2YWx1ZS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggNiwgMCApXG59O1xuXG5jb25zdCBBUlJBWSA9IHtcblx0aXNQcmltaXRpdmU6IGZhbHNlLFxuXG5cdC8vIFRoZSBhcnJvdyBmdW5jdGlvbiBpcyBoZXJlIHRvIGFwcGVhc2UgdHJlZSBzaGFrZXJzIGxpa2UgZXNidWlsZCBvciB3ZWJwYWNrLlxuXHQvLyBTZWUgaHR0cHM6Ly9lc2J1aWxkLmdpdGh1Yi5pby9hcGkvI3RyZWUtc2hha2luZ1xuXHRtYXRjaDogdiA9PiBBcnJheS5pc0FycmF5KCB2ICksXG5cblx0ZnJvbUhleFN0cmluZyggc3RyaW5nLCB0YXJnZXQsIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdGNvbnN0IGludCA9IElOVC5mcm9tSGV4U3RyaW5nKCBzdHJpbmcgKTtcblxuXHRcdHRhcmdldFsgMCBdID0gKCBpbnQgPj4gMTYgJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXHRcdHRhcmdldFsgMSBdID0gKCBpbnQgPj4gOCAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0WyAyIF0gPSAoIGludCAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cblx0fSxcblx0dG9IZXhTdHJpbmcoIFsgciwgZywgYiBdLCByZ2JTY2FsZSA9IDEgKSB7XG5cblx0XHRyZ2JTY2FsZSA9IDI1NSAvIHJnYlNjYWxlO1xuXG5cdFx0Y29uc3QgaW50ID0gKCByICogcmdiU2NhbGUgKSA8PCAxNiBeXG5cdFx0XHQoIGcgKiByZ2JTY2FsZSApIDw8IDggXlxuXHRcdFx0KCBiICogcmdiU2NhbGUgKSA8PCAwO1xuXG5cdFx0cmV0dXJuIElOVC50b0hleFN0cmluZyggaW50ICk7XG5cblx0fVxufTtcblxuY29uc3QgT0JKRUNUID0ge1xuXHRpc1ByaW1pdGl2ZTogZmFsc2UsXG5cdG1hdGNoOiB2ID0+IE9iamVjdCggdiApID09PSB2LFxuXHRmcm9tSGV4U3RyaW5nKCBzdHJpbmcsIHRhcmdldCwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0Y29uc3QgaW50ID0gSU5ULmZyb21IZXhTdHJpbmcoIHN0cmluZyApO1xuXG5cdFx0dGFyZ2V0LnIgPSAoIGludCA+PiAxNiAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0LmcgPSAoIGludCA+PiA4ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXQuYiA9ICggaW50ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblxuXHR9LFxuXHR0b0hleFN0cmluZyggeyByLCBnLCBiIH0sIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdHJnYlNjYWxlID0gMjU1IC8gcmdiU2NhbGU7XG5cblx0XHRjb25zdCBpbnQgPSAoIHIgKiByZ2JTY2FsZSApIDw8IDE2IF5cblx0XHRcdCggZyAqIHJnYlNjYWxlICkgPDwgOCBeXG5cdFx0XHQoIGIgKiByZ2JTY2FsZSApIDw8IDA7XG5cblx0XHRyZXR1cm4gSU5ULnRvSGV4U3RyaW5nKCBpbnQgKTtcblxuXHR9XG59O1xuXG5jb25zdCBGT1JNQVRTID0gWyBTVFJJTkcsIElOVCwgQVJSQVksIE9CSkVDVCBdO1xuXG5mdW5jdGlvbiBnZXRDb2xvckZvcm1hdCggdmFsdWUgKSB7XG5cdHJldHVybiBGT1JNQVRTLmZpbmQoIGZvcm1hdCA9PiBmb3JtYXQubWF0Y2goIHZhbHVlICkgKTtcbn1cblxuY2xhc3MgQ29sb3JDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgcmdiU2NhbGUgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnY29sb3InICk7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ2NvbG9yJyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3RhYmluZGV4JywgLTEgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHR0aGlzLiR0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJHRleHQuc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0JyApO1xuXHRcdHRoaXMuJHRleHQuc2V0QXR0cmlidXRlKCAnc3BlbGxjaGVjaycsICdmYWxzZScgKTtcblx0XHR0aGlzLiR0ZXh0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJGRpc3BsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LmFkZCggJ2Rpc3BsYXknICk7XG5cblx0XHR0aGlzLiRkaXNwbGF5LmFwcGVuZENoaWxkKCB0aGlzLiRpbnB1dCApO1xuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kZGlzcGxheSApO1xuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kdGV4dCApO1xuXG5cdFx0dGhpcy5fZm9ybWF0ID0gZ2V0Q29sb3JGb3JtYXQoIHRoaXMuaW5pdGlhbFZhbHVlICk7XG5cdFx0dGhpcy5fcmdiU2NhbGUgPSByZ2JTY2FsZTtcblxuXHRcdHRoaXMuX2luaXRpYWxWYWx1ZUhleFN0cmluZyA9IHRoaXMuc2F2ZSgpO1xuXHRcdHRoaXMuX3RleHRGb2N1c2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnaW5wdXQnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsICgpID0+IHtcblx0XHRcdGNvbnN0IHRyeVBhcnNlID0gbm9ybWFsaXplQ29sb3JTdHJpbmcoIHRoaXMuJHRleHQudmFsdWUgKTtcblx0XHRcdGlmICggdHJ5UGFyc2UgKSB7XG5cdFx0XHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdHJ5UGFyc2UgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHR0aGlzLiR0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsICgpID0+IHtcblx0XHRcdHRoaXMuX3RleHRGb2N1c2VkID0gdHJ1ZTtcblx0XHRcdHRoaXMuJHRleHQuc2VsZWN0KCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kdGV4dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuX3RleHRGb2N1c2VkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiR0ZXh0O1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0fVxuXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdGhpcy5faW5pdGlhbFZhbHVlSGV4U3RyaW5nICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdGhpcy5fZm9ybWF0LmlzUHJpbWl0aXZlICkge1xuXG5cdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuX2Zvcm1hdC5mcm9tSGV4U3RyaW5nKCB2YWx1ZSApO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggbmV3VmFsdWUgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRoaXMuX2Zvcm1hdC5mcm9tSGV4U3RyaW5nKCB2YWx1ZSwgdGhpcy5nZXRWYWx1ZSgpLCB0aGlzLl9yZ2JTY2FsZSApO1xuXHRcdFx0dGhpcy5fY2FsbE9uQ2hhbmdlKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdH1cblxuXHR9XG5cblx0c2F2ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZm9ybWF0LnRvSGV4U3RyaW5nKCB0aGlzLmdldFZhbHVlKCksIHRoaXMuX3JnYlNjYWxlICk7XG5cdH1cblxuXHRsb2FkKCB2YWx1ZSApIHtcblx0XHR0aGlzLl9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHZhbHVlICk7XG5cdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5fZm9ybWF0LnRvSGV4U3RyaW5nKCB0aGlzLmdldFZhbHVlKCksIHRoaXMuX3JnYlNjYWxlICk7XG5cdFx0aWYgKCAhdGhpcy5fdGV4dEZvY3VzZWQgKSB7XG5cdFx0XHR0aGlzLiR0ZXh0LnZhbHVlID0gdGhpcy4kaW5wdXQudmFsdWUuc3Vic3RyaW5nKCAxICk7XG5cdFx0fVxuXHRcdHRoaXMuJGRpc3BsYXkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy4kaW5wdXQudmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5jbGFzcyBGdW5jdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5ICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ2Z1bmN0aW9uJyApO1xuXG5cdFx0Ly8gQnV0dG9ucyBhcmUgdGhlIG9ubHkgY2FzZSB3aGVyZSB3aWRnZXQgY29udGFpbnMgbmFtZVxuXHRcdHRoaXMuJGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XG5cdFx0dGhpcy4kYnV0dG9uLmFwcGVuZENoaWxkKCB0aGlzLiRuYW1lICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRidXR0b24gKTtcblxuXHRcdHRoaXMuJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBlID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMuZ2V0VmFsdWUoKS5jYWxsKCB0aGlzLm9iamVjdCApO1xuXHRcdFx0dGhpcy5fY2FsbE9uQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gZW5hYmxlcyA6YWN0aXZlIHBzZXVkbyBjbGFzcyBvbiBtb2JpbGVcblx0XHR0aGlzLiRidXR0b24uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCAoKSA9PiB7fSwgeyBwYXNzaXZlOiB0cnVlIH0gKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRidXR0b247XG5cblx0fVxuXG59XG5cbmNsYXNzIE51bWJlckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCBtaW4sIG1heCwgc3RlcCApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdudW1iZXInICk7XG5cblx0XHR0aGlzLl9pbml0SW5wdXQoKTtcblxuXHRcdHRoaXMubWluKCBtaW4gKTtcblx0XHR0aGlzLm1heCggbWF4ICk7XG5cblx0XHRjb25zdCBzdGVwRXhwbGljaXQgPSBzdGVwICE9PSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5zdGVwKCBzdGVwRXhwbGljaXQgPyBzdGVwIDogdGhpcy5fZ2V0SW1wbGljaXRTdGVwKCksIHN0ZXBFeHBsaWNpdCApO1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0fVxuXG5cdGRlY2ltYWxzKCBkZWNpbWFscyApIHtcblx0XHR0aGlzLl9kZWNpbWFscyA9IGRlY2ltYWxzO1xuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bWluKCBtaW4gKSB7XG5cdFx0dGhpcy5fbWluID0gbWluO1xuXHRcdHRoaXMuX29uVXBkYXRlTWluTWF4KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRtYXgoIG1heCApIHtcblx0XHR0aGlzLl9tYXggPSBtYXg7XG5cdFx0dGhpcy5fb25VcGRhdGVNaW5NYXgoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHN0ZXAoIHN0ZXAsIGV4cGxpY2l0ID0gdHJ1ZSApIHtcblx0XHR0aGlzLl9zdGVwID0gc3RlcDtcblx0XHR0aGlzLl9zdGVwRXhwbGljaXQgPSBleHBsaWNpdDtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdGlmICggdGhpcy5faGFzU2xpZGVyICkge1xuXG5cdFx0XHRsZXQgcGVyY2VudCA9ICggdmFsdWUgLSB0aGlzLl9taW4gKSAvICggdGhpcy5fbWF4IC0gdGhpcy5fbWluICk7XG5cdFx0XHRwZXJjZW50ID0gTWF0aC5tYXgoIDAsIE1hdGgubWluKCBwZXJjZW50LCAxICkgKTtcblxuXHRcdFx0dGhpcy4kZmlsbC5zdHlsZS53aWR0aCA9IHBlcmNlbnQgKiAxMDAgKyAnJSc7XG5cblx0XHR9XG5cblx0XHRpZiAoICF0aGlzLl9pbnB1dEZvY3VzZWQgKSB7XG5cdFx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuX2RlY2ltYWxzID09PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHZhbHVlLnRvRml4ZWQoIHRoaXMuX2RlY2ltYWxzICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdF9pbml0SW5wdXQoKSB7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ3RleHQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0Ly8gT24gdG91Y2ggZGV2aWNlcyBvbmx5LCB1c2UgaW5wdXRbdHlwZT1udW1iZXJdIHRvIGZvcmNlIGEgbnVtZXJpYyBrZXlib2FyZC5cblx0XHQvLyBJZGVhbGx5IHdlIGNvdWxkIHVzZSBvbmUgaW5wdXQgdHlwZSBldmVyeXdoZXJlLCBidXQgW3R5cGU9bnVtYmVyXSBoYXMgcXVpcmtzXG5cdFx0Ly8gb24gZGVza3RvcCwgYW5kIFtpbnB1dG1vZGU9ZGVjaW1hbF0gaGFzIHF1aXJrcyBvbiBpT1MuXG5cdFx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9nZW9yZ2VhbHdheXMvbGlsLWd1aS9wdWxsLzE2XG5cblx0XHRjb25zdCBpc1RvdWNoID0gd2luZG93Lm1hdGNoTWVkaWEoICcocG9pbnRlcjogY29hcnNlKScgKS5tYXRjaGVzO1xuXG5cdFx0aWYgKCBpc1RvdWNoICkge1xuXHRcdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICdudW1iZXInICk7XG5cdFx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdzdGVwJywgJ2FueScgKTtcblx0XHR9XG5cblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kaW5wdXQ7XG5cblx0XHRjb25zdCBvbklucHV0ID0gKCkgPT4ge1xuXG5cdFx0XHRsZXQgdmFsdWUgPSBwYXJzZUZsb2F0KCB0aGlzLiRpbnB1dC52YWx1ZSApO1xuXG5cdFx0XHRpZiAoIGlzTmFOKCB2YWx1ZSApICkgcmV0dXJuO1xuXG5cdFx0XHRpZiAoIHRoaXMuX3N0ZXBFeHBsaWNpdCApIHtcblx0XHRcdFx0dmFsdWUgPSB0aGlzLl9zbmFwKCB2YWx1ZSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLl9jbGFtcCggdmFsdWUgKSApO1xuXG5cdFx0fTtcblxuXHRcdC8vIEtleXMgJiBtb3VzZSB3aGVlbFxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3QgaW5jcmVtZW50ID0gZGVsdGEgPT4ge1xuXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cblx0XHRcdGlmICggaXNOYU4oIHZhbHVlICkgKSByZXR1cm47XG5cblx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCB2YWx1ZSArIGRlbHRhICk7XG5cblx0XHRcdC8vIEZvcmNlIHRoZSBpbnB1dCB0byB1cGRhdGVEaXNwbGF5IHdoZW4gaXQncyBmb2N1c2VkXG5cdFx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvbktleURvd24gPSBlID0+IHtcblx0XHRcdC8vIFVzaW5nIGBlLmtleWAgaW5zdGVhZCBvZiBgZS5jb2RlYCBhbHNvIGNhdGNoZXMgTnVtcGFkRW50ZXJcblx0XHRcdGlmICggZS5rZXkgPT09ICdFbnRlcicgKSB7XG5cdFx0XHRcdHRoaXMuJGlucHV0LmJsdXIoKTtcblx0XHRcdH1cblx0XHRcdGlmICggZS5jb2RlID09PSAnQXJyb3dVcCcgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aW5jcmVtZW50KCB0aGlzLl9zdGVwICogdGhpcy5fYXJyb3dLZXlNdWx0aXBsaWVyKCBlICkgKTtcblx0XHRcdH1cblx0XHRcdGlmICggZS5jb2RlID09PSAnQXJyb3dEb3duJyApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpbmNyZW1lbnQoIHRoaXMuX3N0ZXAgKiB0aGlzLl9hcnJvd0tleU11bHRpcGxpZXIoIGUgKSAqIC0xICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uV2hlZWwgPSBlID0+IHtcblx0XHRcdGlmICggdGhpcy5faW5wdXRGb2N1c2VkICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGluY3JlbWVudCggdGhpcy5fc3RlcCAqIHRoaXMuX25vcm1hbGl6ZU1vdXNlV2hlZWwoIGUgKSApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBWZXJ0aWNhbCBkcmFnXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRsZXQgdGVzdGluZ0ZvclZlcnRpY2FsRHJhZyA9IGZhbHNlLFxuXHRcdFx0aW5pdENsaWVudFgsXG5cdFx0XHRpbml0Q2xpZW50WSxcblx0XHRcdHByZXZDbGllbnRZLFxuXHRcdFx0aW5pdFZhbHVlLFxuXHRcdFx0ZHJhZ0RlbHRhO1xuXG5cdFx0Ly8gT25jZSB0aGUgbW91c2UgaXMgZHJhZ2dlZCBtb3JlIHRoYW4gRFJBR19USFJFU0ggcHggb24gYW55IGF4aXMsIHdlIGRlY2lkZVxuXHRcdC8vIG9uIHRoZSB1c2VyJ3MgaW50ZW50OiBob3Jpem9udGFsIG1lYW5zIGhpZ2hsaWdodCwgdmVydGljYWwgbWVhbnMgZHJhZy5cblx0XHRjb25zdCBEUkFHX1RIUkVTSCA9IDU7XG5cblx0XHRjb25zdCBvbk1vdXNlRG93biA9IGUgPT4ge1xuXG5cdFx0XHRpbml0Q2xpZW50WCA9IGUuY2xpZW50WDtcblx0XHRcdGluaXRDbGllbnRZID0gcHJldkNsaWVudFkgPSBlLmNsaWVudFk7XG5cdFx0XHR0ZXN0aW5nRm9yVmVydGljYWxEcmFnID0gdHJ1ZTtcblxuXHRcdFx0aW5pdFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdFx0ZHJhZ0RlbHRhID0gMDtcblxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwICk7XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Nb3VzZU1vdmUgPSBlID0+IHtcblxuXHRcdFx0aWYgKCB0ZXN0aW5nRm9yVmVydGljYWxEcmFnICkge1xuXG5cdFx0XHRcdGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gaW5pdENsaWVudFg7XG5cdFx0XHRcdGNvbnN0IGR5ID0gZS5jbGllbnRZIC0gaW5pdENsaWVudFk7XG5cblx0XHRcdFx0aWYgKCBNYXRoLmFicyggZHkgKSA+IERSQUdfVEhSRVNIICkge1xuXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdHRoaXMuJGlucHV0LmJsdXIoKTtcblx0XHRcdFx0XHR0ZXN0aW5nRm9yVmVydGljYWxEcmFnID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggdHJ1ZSwgJ3ZlcnRpY2FsJyApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIE1hdGguYWJzKCBkeCApID4gRFJBR19USFJFU0ggKSB7XG5cblx0XHRcdFx0XHRvbk1vdXNlVXAoKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gVGhpcyBpc24ndCBhbiBlbHNlIHNvIHRoYXQgdGhlIGZpcnN0IG1vdmUgY291bnRzIHRvd2FyZHMgZHJhZ0RlbHRhXG5cdFx0XHRpZiAoICF0ZXN0aW5nRm9yVmVydGljYWxEcmFnICkge1xuXG5cdFx0XHRcdGNvbnN0IGR5ID0gZS5jbGllbnRZIC0gcHJldkNsaWVudFk7XG5cblx0XHRcdFx0ZHJhZ0RlbHRhIC09IGR5ICogdGhpcy5fc3RlcCAqIHRoaXMuX2Fycm93S2V5TXVsdGlwbGllciggZSApO1xuXG5cdFx0XHRcdC8vIENsYW1wIGRyYWdEZWx0YSBzbyB3ZSBkb24ndCBoYXZlICdkZWFkIHNwYWNlJyBhZnRlciBkcmFnZ2luZyBwYXN0IGJvdW5kcy5cblx0XHRcdFx0Ly8gV2UncmUgb2theSB3aXRoIHRoZSBmYWN0IHRoYXQgYm91bmRzIGNhbiBiZSB1bmRlZmluZWQgaGVyZS5cblx0XHRcdFx0aWYgKCBpbml0VmFsdWUgKyBkcmFnRGVsdGEgPiB0aGlzLl9tYXggKSB7XG5cdFx0XHRcdFx0ZHJhZ0RlbHRhID0gdGhpcy5fbWF4IC0gaW5pdFZhbHVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBpbml0VmFsdWUgKyBkcmFnRGVsdGEgPCB0aGlzLl9taW4gKSB7XG5cdFx0XHRcdFx0ZHJhZ0RlbHRhID0gdGhpcy5fbWluIC0gaW5pdFZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIGluaXRWYWx1ZSArIGRyYWdEZWx0YSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHByZXZDbGllbnRZID0gZS5jbGllbnRZO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uTW91c2VVcCA9ICgpID0+IHtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIGZhbHNlLCAndmVydGljYWwnICk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCApO1xuXHRcdH07XG5cblx0XHQvLyBGb2N1cyBzdGF0ZSAmIG9uRmluaXNoQ2hhbmdlXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBvbkZvY3VzID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5faW5wdXRGb2N1c2VkID0gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25CbHVyID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5faW5wdXRGb2N1c2VkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH07XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnaW5wdXQnLCBvbklucHV0ICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBvbktleURvd24gKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0gKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZURvd24gKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBvbkZvY3VzICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCBvbkJsdXIgKTtcblxuXHR9XG5cblx0X2luaXRTbGlkZXIoKSB7XG5cblx0XHR0aGlzLl9oYXNTbGlkZXIgPSB0cnVlO1xuXG5cdFx0Ly8gQnVpbGQgRE9NXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHR0aGlzLiRzbGlkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJHNsaWRlci5jbGFzc0xpc3QuYWRkKCAnc2xpZGVyJyApO1xuXG5cdFx0dGhpcy4kZmlsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kZmlsbC5jbGFzc0xpc3QuYWRkKCAnZmlsbCcgKTtcblxuXHRcdHRoaXMuJHNsaWRlci5hcHBlbmRDaGlsZCggdGhpcy4kZmlsbCApO1xuXHRcdHRoaXMuJHdpZGdldC5pbnNlcnRCZWZvcmUoIHRoaXMuJHNsaWRlciwgdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnaGFzU2xpZGVyJyApO1xuXG5cdFx0Ly8gTWFwIGNsaWVudFggdG8gdmFsdWVcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGNvbnN0IG1hcCA9ICggdiwgYSwgYiwgYywgZCApID0+IHtcblx0XHRcdHJldHVybiAoIHYgLSBhICkgLyAoIGIgLSBhICkgKiAoIGQgLSBjICkgKyBjO1xuXHRcdH07XG5cblx0XHRjb25zdCBzZXRWYWx1ZUZyb21YID0gY2xpZW50WCA9PiB7XG5cdFx0XHRjb25zdCByZWN0ID0gdGhpcy4kc2xpZGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0bGV0IHZhbHVlID0gbWFwKCBjbGllbnRYLCByZWN0LmxlZnQsIHJlY3QucmlnaHQsIHRoaXMuX21pbiwgdGhpcy5fbWF4ICk7XG5cdFx0XHR0aGlzLl9zbmFwQ2xhbXBTZXRWYWx1ZSggdmFsdWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8gTW91c2UgZHJhZ1xuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3QgbW91c2VEb3duID0gZSA9PiB7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCB0cnVlICk7XG5cdFx0XHRzZXRWYWx1ZUZyb21YKCBlLmNsaWVudFggKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZVVwICk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG1vdXNlTW92ZSA9IGUgPT4ge1xuXHRcdFx0c2V0VmFsdWVGcm9tWCggZS5jbGllbnRYICk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG1vdXNlVXAgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIGZhbHNlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2VVcCApO1xuXHRcdH07XG5cblx0XHQvLyBUb3VjaCBkcmFnXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRsZXQgdGVzdGluZ0ZvclNjcm9sbCA9IGZhbHNlLCBwcmV2Q2xpZW50WCwgcHJldkNsaWVudFk7XG5cblx0XHRjb25zdCBiZWdpblRvdWNoRHJhZyA9IGUgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggdHJ1ZSApO1xuXHRcdFx0c2V0VmFsdWVGcm9tWCggZS50b3VjaGVzWyAwIF0uY2xpZW50WCApO1xuXHRcdFx0dGVzdGluZ0ZvclNjcm9sbCA9IGZhbHNlO1xuXHRcdH07XG5cblx0XHRjb25zdCBvblRvdWNoU3RhcnQgPSBlID0+IHtcblxuXHRcdFx0aWYgKCBlLnRvdWNoZXMubGVuZ3RoID4gMSApIHJldHVybjtcblxuXHRcdFx0Ly8gSWYgd2UncmUgaW4gYSBzY3JvbGxhYmxlIGNvbnRhaW5lciwgd2Ugc2hvdWxkIHdhaXQgZm9yIHRoZSBmaXJzdFxuXHRcdFx0Ly8gdG91Y2htb3ZlIHRvIHNlZSBpZiB0aGUgdXNlciBpcyB0cnlpbmcgdG8gc2xpZGUgb3Igc2Nyb2xsLlxuXHRcdFx0aWYgKCB0aGlzLl9oYXNTY3JvbGxCYXIgKSB7XG5cblx0XHRcdFx0cHJldkNsaWVudFggPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRYO1xuXHRcdFx0XHRwcmV2Q2xpZW50WSA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFk7XG5cdFx0XHRcdHRlc3RpbmdGb3JTY3JvbGwgPSB0cnVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIE90aGVyd2lzZSwgd2UgY2FuIHNldCB0aGUgdmFsdWUgc3RyYWlnaHQgYXdheSBvbiB0b3VjaHN0YXJ0LlxuXHRcdFx0XHRiZWdpblRvdWNoRHJhZyggZSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIG9uVG91Y2hFbmQgKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvblRvdWNoTW92ZSA9IGUgPT4ge1xuXG5cdFx0XHRpZiAoIHRlc3RpbmdGb3JTY3JvbGwgKSB7XG5cblx0XHRcdFx0Y29uc3QgZHggPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRYIC0gcHJldkNsaWVudFg7XG5cdFx0XHRcdGNvbnN0IGR5ID0gZS50b3VjaGVzWyAwIF0uY2xpZW50WSAtIHByZXZDbGllbnRZO1xuXG5cdFx0XHRcdGlmICggTWF0aC5hYnMoIGR4ICkgPiBNYXRoLmFicyggZHkgKSApIHtcblxuXHRcdFx0XHRcdC8vIFdlIG1vdmVkIGhvcml6b250YWxseSwgc2V0IHRoZSB2YWx1ZSBhbmQgc3RvcCBjaGVja2luZy5cblx0XHRcdFx0XHRiZWdpblRvdWNoRHJhZyggZSApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBUaGlzIHdhcywgaW4gZmFjdCwgYW4gYXR0ZW1wdCB0byBzY3JvbGwuIEFib3J0LlxuXHRcdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUgKTtcblx0XHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHNldFZhbHVlRnJvbVgoIGUudG91Y2hlc1sgMCBdLmNsaWVudFggKTtcblxuXHRcdFx0fVxuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uVG91Y2hFbmQgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIGZhbHNlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCApO1xuXHRcdH07XG5cblx0XHQvLyBNb3VzZSB3aGVlbFxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Ly8gV2UgaGF2ZSB0byB1c2UgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdG8gY2FsbCBvbkZpbmlzaENoYW5nZSBiZWNhdXNlXG5cdFx0Ly8gdGhlcmUncyBubyB3YXkgdG8gdGVsbCB3aGVuIHRoZSB1c2VyIGlzIFwiZG9uZVwiIG1vdXNlLXdoZWVsaW5nLlxuXHRcdGNvbnN0IGNhbGxPbkZpbmlzaENoYW5nZSA9IHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0Y29uc3QgV0hFRUxfREVCT1VOQ0VfVElNRSA9IDQwMDtcblx0XHRsZXQgd2hlZWxGaW5pc2hDaGFuZ2VUaW1lb3V0O1xuXG5cdFx0Y29uc3Qgb25XaGVlbCA9IGUgPT4ge1xuXG5cdFx0XHQvLyBpZ25vcmUgdmVydGljYWwgd2hlZWxzIGlmIHRoZXJlJ3MgYSBzY3JvbGxiYXJcblx0XHRcdGNvbnN0IGlzVmVydGljYWwgPSBNYXRoLmFicyggZS5kZWx0YVggKSA8IE1hdGguYWJzKCBlLmRlbHRhWSApO1xuXHRcdFx0aWYgKCBpc1ZlcnRpY2FsICYmIHRoaXMuX2hhc1Njcm9sbEJhciApIHJldHVybjtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQvLyBzZXQgdmFsdWVcblx0XHRcdGNvbnN0IGRlbHRhID0gdGhpcy5fbm9ybWFsaXplTW91c2VXaGVlbCggZSApICogdGhpcy5fc3RlcDtcblx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCB0aGlzLmdldFZhbHVlKCkgKyBkZWx0YSApO1xuXG5cdFx0XHQvLyBmb3JjZSB0aGUgaW5wdXQgdG8gdXBkYXRlRGlzcGxheSB3aGVuIGl0J3MgZm9jdXNlZFxuXHRcdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cblx0XHRcdC8vIGRlYm91bmNlIG9uRmluaXNoQ2hhbmdlXG5cdFx0XHRjbGVhclRpbWVvdXQoIHdoZWVsRmluaXNoQ2hhbmdlVGltZW91dCApO1xuXHRcdFx0d2hlZWxGaW5pc2hDaGFuZ2VUaW1lb3V0ID0gc2V0VGltZW91dCggY2FsbE9uRmluaXNoQ2hhbmdlLCBXSEVFTF9ERUJPVU5DRV9USU1FICk7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy4kc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBtb3VzZURvd24gKTtcblx0XHR0aGlzLiRzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXHRcdHRoaXMuJHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0gKTtcblxuXHR9XG5cblx0X3NldERyYWdnaW5nU3R5bGUoIGFjdGl2ZSwgYXhpcyA9ICdob3Jpem9udGFsJyApIHtcblx0XHRpZiAoIHRoaXMuJHNsaWRlciApIHtcblx0XHRcdHRoaXMuJHNsaWRlci5jbGFzc0xpc3QudG9nZ2xlKCAnYWN0aXZlJywgYWN0aXZlICk7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ2xpbC1ndWktZHJhZ2dpbmcnLCBhY3RpdmUgKTtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoIGBsaWwtZ3VpLSR7YXhpc31gLCBhY3RpdmUgKTtcblx0fVxuXG5cdF9nZXRJbXBsaWNpdFN0ZXAoKSB7XG5cblx0XHRpZiAoIHRoaXMuX2hhc01pbiAmJiB0aGlzLl9oYXNNYXggKSB7XG5cdFx0XHRyZXR1cm4gKCB0aGlzLl9tYXggLSB0aGlzLl9taW4gKSAvIDEwMDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDAuMTtcblxuXHR9XG5cblx0X29uVXBkYXRlTWluTWF4KCkge1xuXG5cdFx0aWYgKCAhdGhpcy5faGFzU2xpZGVyICYmIHRoaXMuX2hhc01pbiAmJiB0aGlzLl9oYXNNYXggKSB7XG5cblx0XHRcdC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UncmUgaGVhcmluZyBhYm91dCBtaW4gYW5kIG1heFxuXHRcdFx0Ly8gYW5kIHdlIGhhdmVuJ3QgZXhwbGljaXRseSBzdGF0ZWQgd2hhdCBvdXIgc3RlcCBpcywgbGV0J3Ncblx0XHRcdC8vIHVwZGF0ZSB0aGF0IHRvby5cblx0XHRcdGlmICggIXRoaXMuX3N0ZXBFeHBsaWNpdCApIHtcblx0XHRcdFx0dGhpcy5zdGVwKCB0aGlzLl9nZXRJbXBsaWNpdFN0ZXAoKSwgZmFsc2UgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5faW5pdFNsaWRlcigpO1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdF9ub3JtYWxpemVNb3VzZVdoZWVsKCBlICkge1xuXG5cdFx0bGV0IHsgZGVsdGFYLCBkZWx0YVkgfSA9IGU7XG5cblx0XHQvLyBTYWZhcmkgYW5kIENocm9tZSByZXBvcnQgd2VpcmQgbm9uLWludGVncmFsIHZhbHVlcyBmb3IgYSBub3RjaGVkIHdoZWVsLFxuXHRcdC8vIGJ1dCBzdGlsbCBleHBvc2UgYWN0dWFsIGxpbmVzIHNjcm9sbGVkIHZpYSB3aGVlbERlbHRhLiBOb3RjaGVkIHdoZWVsc1xuXHRcdC8vIHNob3VsZCBiZWhhdmUgdGhlIHNhbWUgd2F5IGFzIGFycm93IGtleXMuXG5cdFx0aWYgKCBNYXRoLmZsb29yKCBlLmRlbHRhWSApICE9PSBlLmRlbHRhWSAmJiBlLndoZWVsRGVsdGEgKSB7XG5cdFx0XHRkZWx0YVggPSAwO1xuXHRcdFx0ZGVsdGFZID0gLWUud2hlZWxEZWx0YSAvIDEyMDtcblx0XHRcdGRlbHRhWSAqPSB0aGlzLl9zdGVwRXhwbGljaXQgPyAxIDogMTA7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgd2hlZWwgPSBkZWx0YVggKyAtZGVsdGFZO1xuXG5cdFx0cmV0dXJuIHdoZWVsO1xuXG5cdH1cblxuXHRfYXJyb3dLZXlNdWx0aXBsaWVyKCBlICkge1xuXG5cdFx0bGV0IG11bHQgPSB0aGlzLl9zdGVwRXhwbGljaXQgPyAxIDogMTA7XG5cblx0XHRpZiAoIGUuc2hpZnRLZXkgKSB7XG5cdFx0XHRtdWx0ICo9IDEwO1xuXHRcdH0gZWxzZSBpZiAoIGUuYWx0S2V5ICkge1xuXHRcdFx0bXVsdCAvPSAxMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbXVsdDtcblxuXHR9XG5cblx0X3NuYXAoIHZhbHVlICkge1xuXG5cdFx0Ly8gTWFrZSB0aGUgc3RlcHMgXCJzdGFydFwiIGF0IG1pbiBvciBtYXguXG5cdFx0bGV0IG9mZnNldCA9IDA7XG5cdFx0aWYgKCB0aGlzLl9oYXNNaW4gKSB7XG5cdFx0XHRvZmZzZXQgPSB0aGlzLl9taW47XG5cdFx0fSBlbHNlIGlmICggdGhpcy5faGFzTWF4ICkge1xuXHRcdFx0b2Zmc2V0ID0gdGhpcy5fbWF4O1xuXHRcdH1cblxuXHRcdHZhbHVlIC09IG9mZnNldDtcblxuXHRcdHZhbHVlID0gTWF0aC5yb3VuZCggdmFsdWUgLyB0aGlzLl9zdGVwICkgKiB0aGlzLl9zdGVwO1xuXG5cdFx0dmFsdWUgKz0gb2Zmc2V0O1xuXG5cdFx0Ly8gVXNlZCB0byBwcmV2ZW50IFwiZmx5YXdheVwiIGRlY2ltYWxzIGxpa2UgMS4wMDAwMDAwMDAwMDAwMVxuXHRcdHZhbHVlID0gcGFyc2VGbG9hdCggdmFsdWUudG9QcmVjaXNpb24oIDE1ICkgKTtcblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0X2NsYW1wKCB2YWx1ZSApIHtcblx0XHQvLyBlaXRoZXIgY29uZGl0aW9uIGlzIGZhbHNlIGlmIG1pbiBvciBtYXggaXMgdW5kZWZpbmVkXG5cdFx0aWYgKCB2YWx1ZSA8IHRoaXMuX21pbiApIHZhbHVlID0gdGhpcy5fbWluO1xuXHRcdGlmICggdmFsdWUgPiB0aGlzLl9tYXggKSB2YWx1ZSA9IHRoaXMuX21heDtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRfc25hcENsYW1wU2V0VmFsdWUoIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuX2NsYW1wKCB0aGlzLl9zbmFwKCB2YWx1ZSApICkgKTtcblx0fVxuXG5cdGdldCBfaGFzU2Nyb2xsQmFyKCkge1xuXHRcdGNvbnN0IHJvb3QgPSB0aGlzLnBhcmVudC5yb290LiRjaGlsZHJlbjtcblx0XHRyZXR1cm4gcm9vdC5zY3JvbGxIZWlnaHQgPiByb290LmNsaWVudEhlaWdodDtcblx0fVxuXG5cdGdldCBfaGFzTWluKCkge1xuXHRcdHJldHVybiB0aGlzLl9taW4gIT09IHVuZGVmaW5lZDtcblx0fVxuXG5cdGdldCBfaGFzTWF4KCkge1xuXHRcdHJldHVybiB0aGlzLl9tYXggIT09IHVuZGVmaW5lZDtcblx0fVxuXG59XG5cbmNsYXNzIE9wdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCBvcHRpb25zICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ29wdGlvbicgKTtcblxuXHRcdHRoaXMuJHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzZWxlY3QnICk7XG5cdFx0dGhpcy4kc2VsZWN0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJGRpc3BsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LmFkZCggJ2Rpc3BsYXknICk7XG5cblx0XHR0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuX3ZhbHVlc1sgdGhpcy4kc2VsZWN0LnNlbGVjdGVkSW5kZXggXSApO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsICgpID0+IHtcblx0XHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LmFkZCggJ2ZvY3VzJyApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LnJlbW92ZSggJ2ZvY3VzJyApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kc2VsZWN0ICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRkaXNwbGF5ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kc2VsZWN0O1xuXG5cdFx0dGhpcy5vcHRpb25zKCBvcHRpb25zICk7XG5cblx0fVxuXG5cdG9wdGlvbnMoIG9wdGlvbnMgKSB7XG5cblx0XHR0aGlzLl92YWx1ZXMgPSBBcnJheS5pc0FycmF5KCBvcHRpb25zICkgPyBvcHRpb25zIDogT2JqZWN0LnZhbHVlcyggb3B0aW9ucyApO1xuXHRcdHRoaXMuX25hbWVzID0gQXJyYXkuaXNBcnJheSggb3B0aW9ucyApID8gb3B0aW9ucyA6IE9iamVjdC5rZXlzKCBvcHRpb25zICk7XG5cblx0XHR0aGlzLiRzZWxlY3QucmVwbGFjZUNoaWxkcmVuKCk7XG5cblx0XHR0aGlzLl9uYW1lcy5mb3JFYWNoKCBuYW1lID0+IHtcblx0XHRcdGNvbnN0ICRvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0aW9uJyApO1xuXHRcdFx0JG9wdGlvbi50ZXh0Q29udGVudCA9IG5hbWU7XG5cdFx0XHR0aGlzLiRzZWxlY3QuYXBwZW5kQ2hpbGQoICRvcHRpb24gKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5fdmFsdWVzLmluZGV4T2YoIHZhbHVlICk7XG5cdFx0dGhpcy4kc2VsZWN0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblx0XHR0aGlzLiRkaXNwbGF5LnRleHRDb250ZW50ID0gaW5kZXggPT09IC0xID8gdmFsdWUgOiB0aGlzLl9uYW1lc1sgaW5kZXggXTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbmNsYXNzIFN0cmluZ0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5ICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ3N0cmluZycgKTtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAndGV4dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdzcGVsbGNoZWNrJywgJ2ZhbHNlJyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsICgpID0+IHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBlID0+IHtcblx0XHRcdGlmICggZS5jb2RlID09PSAnRW50ZXInICkge1xuXHRcdFx0XHR0aGlzLiRpbnB1dC5ibHVyKCk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kaW5wdXQ7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbnZhciBzdHlsZXNoZWV0ID0gYC5saWwtZ3VpIHtcbiAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5KTtcbiAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUpO1xuICBsaW5lLWhlaWdodDogMTtcbiAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcbiAgLS1iYWNrZ3JvdW5kLWNvbG9yOiAjMWYxZjFmO1xuICAtLXRleHQtY29sb3I6ICNlYmViZWI7XG4gIC0tdGl0bGUtYmFja2dyb3VuZC1jb2xvcjogIzExMTExMTtcbiAgLS10aXRsZS10ZXh0LWNvbG9yOiAjZWJlYmViO1xuICAtLXdpZGdldC1jb2xvcjogIzQyNDI0MjtcbiAgLS1ob3Zlci1jb2xvcjogIzRmNGY0ZjtcbiAgLS1mb2N1cy1jb2xvcjogIzU5NTk1OTtcbiAgLS1udW1iZXItY29sb3I6ICMyY2M5ZmY7XG4gIC0tc3RyaW5nLWNvbG9yOiAjYTJkYjNjO1xuICAtLWZvbnQtc2l6ZTogMTFweDtcbiAgLS1pbnB1dC1mb250LXNpemU6IDExcHg7XG4gIC0tZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIEFyaWFsLCBzYW5zLXNlcmlmO1xuICAtLWZvbnQtZmFtaWx5LW1vbm86IE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkRyb2lkIFNhbnMgTW9ub1wiLCBtb25vc3BhY2U7XG4gIC0tcGFkZGluZzogNHB4O1xuICAtLXNwYWNpbmc6IDRweDtcbiAgLS13aWRnZXQtaGVpZ2h0OiAyMHB4O1xuICAtLXRpdGxlLWhlaWdodDogY2FsYyh2YXIoLS13aWRnZXQtaGVpZ2h0KSArIHZhcigtLXNwYWNpbmcpICogMS4yNSk7XG4gIC0tbmFtZS13aWR0aDogNDUlO1xuICAtLXNsaWRlci1rbm9iLXdpZHRoOiAycHg7XG4gIC0tc2xpZGVyLWlucHV0LXdpZHRoOiAyNyU7XG4gIC0tY29sb3ItaW5wdXQtd2lkdGg6IDI3JTtcbiAgLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoOiA0NXB4O1xuICAtLWNvbG9yLWlucHV0LW1pbi13aWR0aDogNDVweDtcbiAgLS1mb2xkZXItaW5kZW50OiA3cHg7XG4gIC0td2lkZ2V0LXBhZGRpbmc6IDAgMCAwIDNweDtcbiAgLS13aWRnZXQtYm9yZGVyLXJhZGl1czogMnB4O1xuICAtLWNoZWNrYm94LXNpemU6IGNhbGMoMC43NSAqIHZhcigtLXdpZGdldC1oZWlnaHQpKTtcbiAgLS1zY3JvbGxiYXItd2lkdGg6IDVweDtcbn1cbi5saWwtZ3VpLCAubGlsLWd1aSAqIHtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuLmxpbC1ndWkucm9vdCB7XG4gIHdpZHRoOiB2YXIoLS13aWR0aCwgMjQ1cHgpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAudGl0bGUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgY29sb3I6IHZhcigtLXRpdGxlLXRleHQtY29sb3IpO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbiB7XG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgb3ZlcmZsb3cteTogYXV0bztcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgd2lkdGg6IHZhcigtLXNjcm9sbGJhci13aWR0aCk7XG4gIGhlaWdodDogdmFyKC0tc2Nyb2xsYmFyLXdpZHRoKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXNjcm9sbGJhci13aWR0aCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbkBtZWRpYSAocG9pbnRlcjogY29hcnNlKSB7XG4gIC5saWwtZ3VpLmFsbG93LXRvdWNoLXN0eWxlcywgLmxpbC1ndWkuYWxsb3ctdG91Y2gtc3R5bGVzIC5saWwtZ3VpIHtcbiAgICAtLXdpZGdldC1oZWlnaHQ6IDI4cHg7XG4gICAgLS1wYWRkaW5nOiA2cHg7XG4gICAgLS1zcGFjaW5nOiA2cHg7XG4gICAgLS1mb250LXNpemU6IDEzcHg7XG4gICAgLS1pbnB1dC1mb250LXNpemU6IDE2cHg7XG4gICAgLS1mb2xkZXItaW5kZW50OiAxMHB4O1xuICAgIC0tc2Nyb2xsYmFyLXdpZHRoOiA3cHg7XG4gICAgLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoOiA1MHB4O1xuICAgIC0tY29sb3ItaW5wdXQtbWluLXdpZHRoOiA2NXB4O1xuICB9XG59XG4ubGlsLWd1aS5mb3JjZS10b3VjaC1zdHlsZXMsIC5saWwtZ3VpLmZvcmNlLXRvdWNoLXN0eWxlcyAubGlsLWd1aSB7XG4gIC0td2lkZ2V0LWhlaWdodDogMjhweDtcbiAgLS1wYWRkaW5nOiA2cHg7XG4gIC0tc3BhY2luZzogNnB4O1xuICAtLWZvbnQtc2l6ZTogMTNweDtcbiAgLS1pbnB1dC1mb250LXNpemU6IDE2cHg7XG4gIC0tZm9sZGVyLWluZGVudDogMTBweDtcbiAgLS1zY3JvbGxiYXItd2lkdGg6IDdweDtcbiAgLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoOiA1MHB4O1xuICAtLWNvbG9yLWlucHV0LW1pbi13aWR0aDogNjVweDtcbn1cbi5saWwtZ3VpLmF1dG9QbGFjZSB7XG4gIG1heC1oZWlnaHQ6IDEwMCU7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICByaWdodDogMTVweDtcbiAgei1pbmRleDogMTAwMTtcbn1cblxuLmxpbC1ndWkgLmNvbnRyb2xsZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAwIHZhcigtLXBhZGRpbmcpO1xuICBtYXJnaW46IHZhcigtLXNwYWNpbmcpIDA7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5kaXNhYmxlZCB7XG4gIG9wYWNpdHk6IDAuNTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmRpc2FibGVkLCAubGlsLWd1aSAuY29udHJvbGxlci5kaXNhYmxlZCAqIHtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmUgIWltcG9ydGFudDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyID4gLm5hbWUge1xuICBtaW4td2lkdGg6IHZhcigtLW5hbWUtd2lkdGgpO1xuICBmbGV4LXNocmluazogMDtcbiAgd2hpdGUtc3BhY2U6IHByZTtcbiAgcGFkZGluZy1yaWdodDogdmFyKC0tc3BhY2luZyk7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyIC53aWRnZXQge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHdpZHRoOiAxMDAlO1xuICBtaW4taGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLnN0cmluZyBpbnB1dCB7XG4gIGNvbG9yOiB2YXIoLS1zdHJpbmctY29sb3IpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuYm9vbGVhbiB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmNvbG9yIC5kaXNwbGF5IHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgLmRpc3BsYXk6aG92ZXI6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIiBcIjtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY5O1xuICAgIHRvcDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgaW5wdXRbdHlwZT1jb2xvcl0ge1xuICBvcGFjaXR5OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciBpbnB1dFt0eXBlPXRleHRdIHtcbiAgbWFyZ2luLWxlZnQ6IHZhcigtLXNwYWNpbmcpO1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHktbW9ubyk7XG4gIG1pbi13aWR0aDogdmFyKC0tY29sb3ItaW5wdXQtbWluLXdpZHRoKTtcbiAgd2lkdGg6IHZhcigtLWNvbG9yLWlucHV0LXdpZHRoKTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gc2VsZWN0IHtcbiAgb3BhY2l0eTogMDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiAxMDAlO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5IHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBsaW5lLWhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIG1heC13aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1xuICBwYWRkaW5nLWxlZnQ6IDAuNTVlbTtcbiAgcGFkZGluZy1yaWdodDogMS43NWVtO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5LmZvY3VzIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAuZGlzcGxheS5hY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXk6YWZ0ZXIge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIGNvbnRlbnQ6IFwi4oaVXCI7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjM3NWVtO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC53aWRnZXQsXG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gc2VsZWN0IHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC53aWRnZXQ6aG92ZXIgLmRpc3BsYXkge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIGlucHV0IHtcbiAgY29sb3I6IHZhcigtLW51bWJlci1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIuaGFzU2xpZGVyIGlucHV0IHtcbiAgbWFyZ2luLWxlZnQ6IHZhcigtLXNwYWNpbmcpO1xuICB3aWR0aDogdmFyKC0tc2xpZGVyLWlucHV0LXdpZHRoKTtcbiAgbWluLXdpZHRoOiB2YXIoLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoKTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlciB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIHBhZGRpbmctcmlnaHQ6IHZhcigtLXNsaWRlci1rbm9iLXdpZHRoKTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgY3Vyc29yOiBldy1yZXNpemU7XG4gIHRvdWNoLWFjdGlvbjogcGFuLXk7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlcjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlci5hY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlci5hY3RpdmUgLmZpbGwge1xuICBvcGFjaXR5OiAwLjk1O1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIC5maWxsIHtcbiAgaGVpZ2h0OiAxMDAlO1xuICBib3JkZXItcmlnaHQ6IHZhcigtLXNsaWRlci1rbm9iLXdpZHRoKSBzb2xpZCB2YXIoLS1udW1iZXItY29sb3IpO1xuICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbn1cblxuLmxpbC1ndWktZHJhZ2dpbmcgLmxpbC1ndWkge1xuICAtLWhvdmVyLWNvbG9yOiB2YXIoLS13aWRnZXQtY29sb3IpO1xufVxuLmxpbC1ndWktZHJhZ2dpbmcgKiB7XG4gIGN1cnNvcjogZXctcmVzaXplICFpbXBvcnRhbnQ7XG59XG5cbi5saWwtZ3VpLWRyYWdnaW5nLmxpbC1ndWktdmVydGljYWwgKiB7XG4gIGN1cnNvcjogbnMtcmVzaXplICFpbXBvcnRhbnQ7XG59XG5cbi5saWwtZ3VpIC50aXRsZSB7XG4gIGhlaWdodDogdmFyKC0tdGl0bGUtaGVpZ2h0KTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgcGFkZGluZzogMCB2YXIoLS1wYWRkaW5nKTtcbiAgd2lkdGg6IDEwMCU7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIGJhY2tncm91bmQ6IG5vbmU7XG4gIHRleHQtZGVjb3JhdGlvbi1za2lwOiBvYmplY3RzO1xufVxuLmxpbC1ndWkgLnRpdGxlOmJlZm9yZSB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgY29udGVudDogXCLilr5cIjtcbiAgcGFkZGluZy1yaWdodDogMnB4O1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG59XG4ubGlsLWd1aSAudGl0bGU6YWN0aXZlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tdGl0bGUtYmFja2dyb3VuZC1jb2xvcik7XG4gIG9wYWNpdHk6IDAuNzU7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICBib2R5Om5vdCgubGlsLWd1aS1kcmFnZ2luZykgLmxpbC1ndWkgLnRpdGxlOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICBvcGFjaXR5OiAwLjg1O1xuICB9XG4gIC5saWwtZ3VpIC50aXRsZTpmb2N1cyB7XG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aS5yb290ID4gLnRpdGxlOmZvY3VzIHtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lICFpbXBvcnRhbnQ7XG59XG4ubGlsLWd1aS5jbG9zZWQgPiAudGl0bGU6YmVmb3JlIHtcbiAgY29udGVudDogXCLilrhcIjtcbn1cbi5saWwtZ3VpLmNsb3NlZCA+IC5jaGlsZHJlbiB7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtN3B4KTtcbiAgb3BhY2l0eTogMDtcbn1cbi5saWwtZ3VpLmNsb3NlZDpub3QoLnRyYW5zaXRpb24pID4gLmNoaWxkcmVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5saWwtZ3VpLnRyYW5zaXRpb24gPiAuY2hpbGRyZW4ge1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAzMDBtcztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogaGVpZ2h0LCBvcGFjaXR5LCB0cmFuc2Zvcm07XG4gIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuMzUsIDEpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5saWwtZ3VpIC5jaGlsZHJlbjplbXB0eTpiZWZvcmUge1xuICBjb250ZW50OiBcIkVtcHR5XCI7XG4gIHBhZGRpbmc6IDAgdmFyKC0tcGFkZGluZyk7XG4gIG1hcmdpbjogdmFyKC0tc3BhY2luZykgMDtcbiAgZGlzcGxheTogYmxvY2s7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgbGluZS1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBvcGFjaXR5OiAwLjU7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuID4gLmxpbC1ndWkgPiAudGl0bGUge1xuICBib3JkZXI6IDAgc29saWQgdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgYm9yZGVyLXdpZHRoOiAxcHggMDtcbiAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIDMwMG1zO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbiA+IC5saWwtZ3VpLmNsb3NlZCA+IC50aXRsZSB7XG4gIGJvcmRlci1ib3R0b20tY29sb3I6IHRyYW5zcGFyZW50O1xufVxuLmxpbC1ndWkgKyAuY29udHJvbGxlciB7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBtYXJnaW4tdG9wOiAwO1xuICBwYWRkaW5nLXRvcDogdmFyKC0tc3BhY2luZyk7XG59XG4ubGlsLWd1aSAubGlsLWd1aSAubGlsLWd1aSA+IC50aXRsZSB7XG4gIGJvcmRlcjogbm9uZTtcbn1cbi5saWwtZ3VpIC5saWwtZ3VpIC5saWwtZ3VpID4gLmNoaWxkcmVuIHtcbiAgYm9yZGVyOiBub25lO1xuICBtYXJnaW4tbGVmdDogdmFyKC0tZm9sZGVyLWluZGVudCk7XG4gIGJvcmRlci1sZWZ0OiAycHggc29saWQgdmFyKC0td2lkZ2V0LWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5saWwtZ3VpIC5jb250cm9sbGVyIHtcbiAgYm9yZGVyOiBub25lO1xufVxuXG4ubGlsLWd1aSBsYWJlbCwgLmxpbC1ndWkgaW5wdXQsIC5saWwtZ3VpIGJ1dHRvbiB7XG4gIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XG59XG4ubGlsLWd1aSBpbnB1dCB7XG4gIGJvcmRlcjogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5KTtcbiAgZm9udC1zaXplOiB2YXIoLS1pbnB1dC1mb250LXNpemUpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSBpbnB1dDpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG4gIC5saWwtZ3VpIGlucHV0OmFjdGl2ZSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSBpbnB1dDpkaXNhYmxlZCB7XG4gIG9wYWNpdHk6IDE7XG59XG4ubGlsLWd1aSBpbnB1dFt0eXBlPXRleHRdLFxuLmxpbC1ndWkgaW5wdXRbdHlwZT1udW1iZXJdIHtcbiAgcGFkZGluZzogdmFyKC0td2lkZ2V0LXBhZGRpbmcpO1xuICAtbW96LWFwcGVhcmFuY2U6IHRleHRmaWVsZDtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9dGV4dF06Zm9jdXMsXG4ubGlsLWd1aSBpbnB1dFt0eXBlPW51bWJlcl06Zm9jdXMge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG4ubGlsLWd1aSBpbnB1dFt0eXBlPWNoZWNrYm94XSB7XG4gIGFwcGVhcmFuY2U6IG5vbmU7XG4gIHdpZHRoOiB2YXIoLS1jaGVja2JveC1zaXplKTtcbiAgaGVpZ2h0OiB2YXIoLS1jaGVja2JveC1zaXplKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9Y2hlY2tib3hdOmNoZWNrZWQ6YmVmb3JlIHtcbiAgZm9udC1mYW1pbHk6IFwibGlsLWd1aVwiO1xuICBjb250ZW50OiBcIuKck1wiO1xuICBmb250LXNpemU6IHZhcigtLWNoZWNrYm94LXNpemUpO1xuICBsaW5lLWhlaWdodDogdmFyKC0tY2hlY2tib3gtc2l6ZSk7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSBpbnB1dFt0eXBlPWNoZWNrYm94XTpmb2N1cyB7XG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMXB4IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgYnV0dG9uIHtcbiAgb3V0bGluZTogbm9uZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpO1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZSk7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbiAgd2lkdGg6IDEwMCU7XG4gIGJvcmRlcjogbm9uZTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbiB7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlciBidXR0b246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWNvbG9yKTtcbiAgfVxuICAubGlsLWd1aSAuY29udHJvbGxlciBidXR0b246Zm9jdXMge1xuICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMCAwIDFweCB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbjphY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG5cbkBmb250LWZhY2Uge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIHNyYzogdXJsKFwiZGF0YTphcHBsaWNhdGlvbi9mb250LXdvZmY7Y2hhcnNldD11dGYtODtiYXNlNjQsZDA5R1JnQUJBQUFBQUFVc0FBc0FBQUFBQ0p3QUFRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIVTFWQ0FBQUJDQUFBQUg0QUFBREFJbXdtWUU5VEx6SUFBQUdJQUFBQVB3QUFBR0JLcUg1U1kyMWhjQUFBQWNnQUFBRDBBQUFDcnVreXlKQm5iSGxtQUFBQ3ZBQUFBRjhBQUFDRUlacFdIMmhsWVdRQUFBTWNBQUFBSndBQUFEWmZjajJ6YUdobFlRQUFBMFFBQUFBWUFBQUFKQUM1QUhob2JYUjRBQUFEWEFBQUFCQUFBQUJNQVpBQUFHeHZZMkVBQUFOc0FBQUFGQUFBQUNnQ0VnSXliV0Y0Y0FBQUE0QUFBQUFlQUFBQUlBRWZBQkp1WVcxbEFBQURvQUFBQVNJQUFBSUs5U1VVL1hCdmMzUUFBQVRFQUFBQVpnQUFBSkNUY01jMmVKeFZqYkVPZ2pBVVJVK2hGUkJLMWRHUkwrQUxuQWlUb3lNTEV6RnBuUHovZUFzaHdTYTk3NTE3Yy9Nd3dKbWVCOWt3UGwrMGNmNSt1R1BaWHNxUHU0bnZaYWJjU1psZFo2a2Z5V25vbUZZL2VTY0txWk5XdXBLSk82a1hOM0s5dUNWb0w3aUluUHIxWDViYVhzM3RqdU1xQ3R6RXVhZ20vQUFselFnUEFBQjRuR05nWVJCbG5NREF5c0RBWU0vZ0JpVDVvTFFCQXd1REpBTURFd01yTXdOV0VKRG1tc0p3Z0NGZVhaZ2hCY2psWk1nRkN6T2lLT0lGQUI3MUJiOEFlSnkxa2pGdXdrQVFSWitEd1JBd0J0TlFSVUdLUThPZEtDQVdVaEFnS0xoSXVBc1ZTcFd6NUJia2ozZEVnWWlVSXN6cVdkcFplK1o3L3dCMW9DWW1Jb2JvaXdpTFQyV2pLbC9qc2NySGZHZy9wS2RNa3lrbEM1WnMyTEVmSFlwamNSb1B6bWU5TVdXbWszZFdiSzlPYmtXa2lrT2V0SjU1NGZXeW9Fc21kU2x0K3VSMHBDSlIzNGI2dC9UVmcxU1kzc1l2ZGY4dnVpS3JweWFEWERJU2llZ3AxN3A3NTc5R3AzcCsreTdIUEFpWTlwbVRpYmxqcnI4NXFTaWR0bGc0K2wyNUdMQ2FTOGU2clJ4TkJtc25FUnVuS2JhT09iUno3TjcyanU1dmRBallwQlhIZ0p5bE9BVnNNc2VEQVBFUDhMWW9VSGljWTJCaUFBRWZoaUFHSmdaV0JnWjdSbkZSZG5WSkVMQ1FsQlNSbEFUSk1vTFYyREs0Z2xTWXM2dWJxNXZiS3JKTFNiR3JnRW1vdkR1REpWaGUzVnpjWEZ3TkxDT0lMQi9DNEl1UTF4VG41RlBpbEJUajVGUG1CQUI0V3dvcUFIaWNZMkJrWUdBQTRzazFzUi9qK1cyK01uQXpwREJnQXlFTVFVQ1NnNEVKeEFFQXdVZ0ZIZ0I0bkdOZ1pHQmdTR0ZnZ0pNaERJd01xRUFZQUJ5SEFUSjRuR05nQUlJVU5Fd21BQUJsM0FHUmVKeGpZQUFDSVFZbEJpTUdKM3dRQUVjUUJFVjRuR05nWkdCZ0VHWmdZMkJpQUFFUXlRV0VEQXovd1h3R0FBc1BBVElBQUhpY1hkQk5Tc05BSEFYd2wzNWlBMFVRWFluTVNoZlM5R1BaQTdUN0xnSXUwM1NTcGt3ellUSXQxQk40QWsvZ0tUeUFlQ3hmdzM5alpranltemN2QXdtQVcvd2d3SFVFR0RiMzYralFRM0dYR290NzlMMjRqeENQNGdIekYvRUlyNGpFSWU3d3hoT0MzZzJUTVl5NFE3K0x1L1NIdUVkL2l2dDR3SmQ0d1B4YlBFS01YM0dJNStESkZHYVNuNHFOems4bWNiS1NSNnhkWGRoU3phT1pKR3RkYXBkNHZWUGJpNnJQK2NMN1RHWE9IdFhLbGw0YlkxWGw3RUduUHRwN1h5Mm4wMHp5S0xWSGZrSEJhNEljSjJvRDNjZ2dnV3Z0L1YvRmJEclVsRVVKaFRuLzBhelZXYk5UTnIwRW5zOGRlMXRjZUs5eFptZkIxQ1BqT21QSDRraXRtdk91YmNOcG1WVE4zb0ZKeWp6Q3ZubXJ3aEpUenF6Vmo5amlTWDkxMUZqZUFBQjRuRzNITVJLQ01CQkEwZjBnaWlLaTREVThrMFYyR1diSVpET2g0UG9XV3ZxNko1VjhJZjlOVk5RY2FEaHlvdVhNaFk0clBUY0c3andZbVhoS3E4V3orcDc2MmFOYWVZWG9tMm4zbTJkTFRWZ3NyQ2dGSjdPVG1Ja1lid0liQzZ2SUI3V21GZkFBQUE9PVwiKSBmb3JtYXQoXCJ3b2ZmXCIpO1xufWA7XG5cbmZ1bmN0aW9uIF9pbmplY3RTdHlsZXMoIGNzc0NvbnRlbnQgKSB7XG5cdGNvbnN0IGluamVjdGVkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3N0eWxlJyApO1xuXHRpbmplY3RlZC5pbm5lckhUTUwgPSBjc3NDb250ZW50O1xuXHRjb25zdCBiZWZvcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnaGVhZCBsaW5rW3JlbD1zdHlsZXNoZWV0XSwgaGVhZCBzdHlsZScgKTtcblx0aWYgKCBiZWZvcmUgKSB7XG5cdFx0ZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUoIGluamVjdGVkLCBiZWZvcmUgKTtcblx0fSBlbHNlIHtcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCBpbmplY3RlZCApO1xuXHR9XG59XG5cblxubGV0IHN0eWxlc0luamVjdGVkID0gZmFsc2U7XG5cbmNsYXNzIEdVSSB7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBwYW5lbCB0aGF0IGhvbGRzIGNvbnRyb2xsZXJzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBuZXcgR1VJKCk7XG5cdCAqIG5ldyBHVUkoIHsgY29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2N1c3RvbScgKSB9ICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5hdXRvUGxhY2U9dHJ1ZV1cblx0ICogQWRkcyB0aGUgR1VJIHRvIGBkb2N1bWVudC5ib2R5YCBhbmQgZml4ZXMgaXQgdG8gdGhlIHRvcCByaWdodCBvZiB0aGUgcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbnMuY29udGFpbmVyXVxuXHQgKiBBZGRzIHRoZSBHVUkgdG8gdGhpcyBET00gZWxlbWVudC4gT3ZlcnJpZGVzIGBhdXRvUGxhY2VgLlxuXHQgKlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGg9MjQ1XVxuXHQgKiBXaWR0aCBvZiB0aGUgR1VJIGluIHBpeGVscywgdXN1YWxseSBzZXQgd2hlbiBuYW1lIGxhYmVscyBiZWNvbWUgdG9vIGxvbmcuIE5vdGUgdGhhdCB5b3UgY2FuIG1ha2Vcblx0ICogbmFtZSBsYWJlbHMgd2lkZXIgaW4gQ1NTIHdpdGggYC5saWzigJFndWkgeyDigJHigJFuYW1l4oCRd2lkdGg6IDU1JSB9YC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnRpdGxlPUNvbnRyb2xzXVxuXHQgKiBOYW1lIHRvIGRpc3BsYXkgaW4gdGhlIHRpdGxlIGJhci5cblx0ICpcblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jbG9zZUZvbGRlcnM9ZmFsc2VdXG5cdCAqIFBhc3MgYHRydWVgIHRvIGNsb3NlIGFsbCBmb2xkZXJzIGluIHRoaXMgR1VJIGJ5IGRlZmF1bHQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW5qZWN0U3R5bGVzPXRydWVdXG5cdCAqIEluamVjdHMgdGhlIGRlZmF1bHQgc3R5bGVzaGVldCBpbnRvIHRoZSBwYWdlIGlmIHRoaXMgaXMgdGhlIGZpcnN0IEdVSS5cblx0ICogUGFzcyBgZmFsc2VgIHRvIHVzZSB5b3VyIG93biBzdHlsZXNoZWV0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG91Y2hTdHlsZXM9dHJ1ZV1cblx0ICogTWFrZXMgY29udHJvbGxlcnMgbGFyZ2VyIG9uIHRvdWNoIGRldmljZXMuIFBhc3MgYGZhbHNlYCB0byBkaXNhYmxlIHRvdWNoIHN0eWxlcy5cblx0ICpcblx0ICogQHBhcmFtIHtHVUl9IFtvcHRpb25zLnBhcmVudF1cblx0ICogQWRkcyB0aGlzIEdVSSBhcyBhIGNoaWxkIGluIGFub3RoZXIgR1VJLiBVc3VhbGx5IHRoaXMgaXMgZG9uZSBmb3IgeW91IGJ5IGBhZGRGb2xkZXIoKWAuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcigge1xuXHRcdHBhcmVudCxcblx0XHRhdXRvUGxhY2UgPSBwYXJlbnQgPT09IHVuZGVmaW5lZCxcblx0XHRjb250YWluZXIsXG5cdFx0d2lkdGgsXG5cdFx0dGl0bGUgPSAnQ29udHJvbHMnLFxuXHRcdGNsb3NlRm9sZGVycyA9IGZhbHNlLFxuXHRcdGluamVjdFN0eWxlcyA9IHRydWUsXG5cdFx0dG91Y2hTdHlsZXMgPSB0cnVlXG5cdH0gPSB7fSApIHtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBHVUkgY29udGFpbmluZyB0aGlzIGZvbGRlciwgb3IgYHVuZGVmaW5lZGAgaWYgdGhpcyBpcyB0aGUgcm9vdCBHVUkuXG5cdFx0ICogQHR5cGUge0dVSX1cblx0XHQgKi9cblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSB0b3AgbGV2ZWwgR1VJIGNvbnRhaW5pbmcgdGhpcyBmb2xkZXIsIG9yIGB0aGlzYCBpZiB0aGlzIGlzIHRoZSByb290IEdVSS5cblx0XHQgKiBAdHlwZSB7R1VJfVxuXHRcdCAqL1xuXHRcdHRoaXMucm9vdCA9IHBhcmVudCA/IHBhcmVudC5yb290IDogdGhpcztcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBsaXN0IG9mIGNvbnRyb2xsZXJzIGFuZCBmb2xkZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSS5cblx0XHQgKiBAdHlwZSB7QXJyYXk8R1VJfENvbnRyb2xsZXI+fVxuXHRcdCAqL1xuXHRcdHRoaXMuY2hpbGRyZW4gPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBsaXN0IG9mIGNvbnRyb2xsZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSS5cblx0XHQgKiBAdHlwZSB7QXJyYXk8Q29udHJvbGxlcj59XG5cdFx0ICovXG5cdFx0dGhpcy5jb250cm9sbGVycyA9IFtdO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxpc3Qgb2YgZm9sZGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkuXG5cdFx0ICogQHR5cGUge0FycmF5PEdVST59XG5cdFx0ICovXG5cdFx0dGhpcy5mb2xkZXJzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgR1VJIGlzIGNsb3NlZC4gVXNlIGBndWkub3BlbigpYCBvciBgZ3VpLmNsb3NlKClgIHRvIGNoYW5nZSB0aGlzLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2Nsb3NlZCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIEdVSSBpcyBoaWRkZW4uIFVzZSBgZ3VpLnNob3coKWAgb3IgYGd1aS5oaWRlKClgIHRvIGNoYW5nZSB0aGlzLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2hpZGRlbiA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG91dGVybW9zdCBjb250YWluZXIgZWxlbWVudC5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2xpbC1ndWknICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgdGl0bGUuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2J1dHRvbicgKTtcblx0XHR0aGlzLiR0aXRsZS5jbGFzc0xpc3QuYWRkKCAndGl0bGUnICk7XG5cdFx0dGhpcy4kdGl0bGUuc2V0QXR0cmlidXRlKCAnYXJpYS1leHBhbmRlZCcsIHRydWUgKTtcblxuXHRcdHRoaXMuJHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsICgpID0+IHRoaXMub3BlbkFuaW1hdGVkKCB0aGlzLl9jbG9zZWQgKSApO1xuXG5cdFx0Ly8gZW5hYmxlcyA6YWN0aXZlIHBzZXVkbyBjbGFzcyBvbiBtb2JpbGVcblx0XHR0aGlzLiR0aXRsZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsICgpID0+IHt9LCB7IHBhc3NpdmU6IHRydWUgfSApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgY2hpbGRyZW4uXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJGNoaWxkcmVuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRjaGlsZHJlbi5jbGFzc0xpc3QuYWRkKCAnY2hpbGRyZW4nICk7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuJHRpdGxlICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiRjaGlsZHJlbiApO1xuXG5cdFx0dGhpcy50aXRsZSggdGl0bGUgKTtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cblx0XHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnB1c2goIHRoaXMgKTtcblx0XHRcdHRoaXMucGFyZW50LmZvbGRlcnMucHVzaCggdGhpcyApO1xuXG5cdFx0XHR0aGlzLnBhcmVudC4kY2hpbGRyZW4uYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXG5cdFx0XHQvLyBTdG9wIHRoZSBjb25zdHJ1Y3RvciBlYXJseSwgZXZlcnl0aGluZyBvbndhcmQgb25seSBhcHBsaWVzIHRvIHJvb3QgR1VJJ3Ncblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAncm9vdCcgKTtcblxuXHRcdGlmICggdG91Y2hTdHlsZXMgKSB7XG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2FsbG93LXRvdWNoLXN0eWxlcycgKTtcblx0XHR9XG5cblx0XHQvLyBJbmplY3Qgc3R5bGVzaGVldCBpZiB3ZSBoYXZlbid0IGRvbmUgdGhhdCB5ZXRcblx0XHRpZiAoICFzdHlsZXNJbmplY3RlZCAmJiBpbmplY3RTdHlsZXMgKSB7XG5cdFx0XHRfaW5qZWN0U3R5bGVzKCBzdHlsZXNoZWV0ICk7XG5cdFx0XHRzdHlsZXNJbmplY3RlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBjb250YWluZXIgKSB7XG5cblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHR9IGVsc2UgaWYgKCBhdXRvUGxhY2UgKSB7XG5cblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnYXV0b1BsYWNlJyApO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHdpZHRoICkge1xuXHRcdFx0dGhpcy5kb21FbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCAnLS13aWR0aCcsIHdpZHRoICsgJ3B4JyApO1xuXHRcdH1cblxuXHRcdHRoaXMuX2Nsb3NlRm9sZGVycyA9IGNsb3NlRm9sZGVycztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBjb250cm9sbGVyIHRvIHRoZSBHVUksIGluZmVycmluZyBjb250cm9sbGVyIHR5cGUgdXNpbmcgdGhlIGB0eXBlb2ZgIG9wZXJhdG9yLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKTtcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAnbnVtYmVyJywgMCwgMTAwLCAxICk7XG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ29wdGlvbnMnLCBbIDEsIDIsIDMgXSApO1xuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdGhlIGNvbnRyb2xsZXIgd2lsbCBtb2RpZnkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjb250cm9sLlxuXHQgKiBAcGFyYW0ge251bWJlcnxvYmplY3R8QXJyYXl9IFskMV0gTWluaW11bSB2YWx1ZSBmb3IgbnVtYmVyIGNvbnRyb2xsZXJzLCBvciB0aGUgc2V0IG9mXG5cdCAqIHNlbGVjdGFibGUgdmFsdWVzIGZvciBhIGRyb3Bkb3duLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW21heF0gTWF4aW11bSB2YWx1ZSBmb3IgbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW3N0ZXBdIFN0ZXAgdmFsdWUgZm9yIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQHJldHVybnMge0NvbnRyb2xsZXJ9XG5cdCAqL1xuXHRhZGQoIG9iamVjdCwgcHJvcGVydHksICQxLCBtYXgsIHN0ZXAgKSB7XG5cblx0XHRpZiAoIE9iamVjdCggJDEgKSA9PT0gJDEgKSB7XG5cblx0XHRcdHJldHVybiBuZXcgT3B0aW9uQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgJDEgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IGluaXRpYWxWYWx1ZSA9IG9iamVjdFsgcHJvcGVydHkgXTtcblxuXHRcdHN3aXRjaCAoIHR5cGVvZiBpbml0aWFsVmFsdWUgKSB7XG5cblx0XHRcdGNhc2UgJ251bWJlcic6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBOdW1iZXJDb250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCAkMSwgbWF4LCBzdGVwICk7XG5cblx0XHRcdGNhc2UgJ2Jvb2xlYW4nOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgQm9vbGVhbkNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuXHRcdFx0Y2FzZSAnc3RyaW5nJzpcblxuXHRcdFx0XHRyZXR1cm4gbmV3IFN0cmluZ0NvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuXHRcdFx0Y2FzZSAnZnVuY3Rpb24nOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25Db250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cblx0XHR9XG5cblx0XHRjb25zb2xlLmVycm9yKCBgZ3VpLmFkZCBmYWlsZWRcblx0cHJvcGVydHk6YCwgcHJvcGVydHksIGBcblx0b2JqZWN0OmAsIG9iamVjdCwgYFxuXHR2YWx1ZTpgLCBpbml0aWFsVmFsdWUgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBjb2xvciBjb250cm9sbGVyIHRvIHRoZSBHVUkuXG5cdCAqIEBleGFtcGxlXG5cdCAqIHBhcmFtcyA9IHtcblx0ICogXHRjc3NDb2xvcjogJyNmZjAwZmYnLFxuXHQgKiBcdHJnYkNvbG9yOiB7IHI6IDAsIGc6IDAuMiwgYjogMC40IH0sXG5cdCAqIFx0Y3VzdG9tUmFuZ2U6IFsgMCwgMTI3LCAyNTUgXSxcblx0ICogfTtcblx0ICpcblx0ICogZ3VpLmFkZENvbG9yKCBwYXJhbXMsICdjc3NDb2xvcicgKTtcblx0ICogZ3VpLmFkZENvbG9yKCBwYXJhbXMsICdyZ2JDb2xvcicgKTtcblx0ICogZ3VpLmFkZENvbG9yKCBwYXJhbXMsICdjdXN0b21SYW5nZScsIDI1NSApO1xuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdGhlIGNvbnRyb2xsZXIgd2lsbCBtb2RpZnkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjb250cm9sLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmdiU2NhbGUgTWF4aW11bSB2YWx1ZSBmb3IgYSBjb2xvciBjaGFubmVsIHdoZW4gdXNpbmcgYW4gUkdCIGNvbG9yLiBZb3UgbWF5XG5cdCAqIG5lZWQgdG8gc2V0IHRoaXMgdG8gMjU1IGlmIHlvdXIgY29sb3JzIGFyZSB0b28gYnJpZ2h0LlxuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcn1cblx0ICovXG5cdGFkZENvbG9yKCBvYmplY3QsIHByb3BlcnR5LCByZ2JTY2FsZSA9IDEgKSB7XG5cdFx0cmV0dXJuIG5ldyBDb2xvckNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHJnYlNjYWxlICk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGZvbGRlciB0byB0aGUgR1VJLCB3aGljaCBpcyBqdXN0IGFub3RoZXIgR1VJLiBUaGlzIG1ldGhvZCByZXR1cm5zXG5cdCAqIHRoZSBuZXN0ZWQgR1VJIHNvIHlvdSBjYW4gYWRkIGNvbnRyb2xsZXJzIHRvIGl0LlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb25zdCBmb2xkZXIgPSBndWkuYWRkRm9sZGVyKCAnUG9zaXRpb24nICk7XG5cdCAqIGZvbGRlci5hZGQoIHBvc2l0aW9uLCAneCcgKTtcblx0ICogZm9sZGVyLmFkZCggcG9zaXRpb24sICd5JyApO1xuXHQgKiBmb2xkZXIuYWRkKCBwb3NpdGlvbiwgJ3onICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSBOYW1lIHRvIGRpc3BsYXkgaW4gdGhlIGZvbGRlcidzIHRpdGxlIGJhci5cblx0ICogQHJldHVybnMge0dVSX1cblx0ICovXG5cdGFkZEZvbGRlciggdGl0bGUgKSB7XG5cdFx0Y29uc3QgZm9sZGVyID0gbmV3IEdVSSggeyBwYXJlbnQ6IHRoaXMsIHRpdGxlIH0gKTtcblx0XHRpZiAoIHRoaXMucm9vdC5fY2xvc2VGb2xkZXJzICkgZm9sZGVyLmNsb3NlKCk7XG5cdFx0cmV0dXJuIGZvbGRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWNhbGxzIHZhbHVlcyB0aGF0IHdlcmUgc2F2ZWQgd2l0aCBgZ3VpLnNhdmUoKWAuXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvYmpcblx0ICogQHBhcmFtIHtib29sZWFufSByZWN1cnNpdmUgUGFzcyBmYWxzZSB0byBleGNsdWRlIGZvbGRlcnMgZGVzY2VuZGluZyBmcm9tIHRoaXMgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGxvYWQoIG9iaiwgcmVjdXJzaXZlID0gdHJ1ZSApIHtcblxuXHRcdGlmICggb2JqLmNvbnRyb2xsZXJzICkge1xuXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXJzLmZvckVhY2goIGMgPT4ge1xuXG5cdFx0XHRcdGlmICggYyBpbnN0YW5jZW9mIEZ1bmN0aW9uQ29udHJvbGxlciApIHJldHVybjtcblxuXHRcdFx0XHRpZiAoIGMuX25hbWUgaW4gb2JqLmNvbnRyb2xsZXJzICkge1xuXHRcdFx0XHRcdGMubG9hZCggb2JqLmNvbnRyb2xsZXJzWyBjLl9uYW1lIF0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHJlY3Vyc2l2ZSAmJiBvYmouZm9sZGVycyApIHtcblxuXHRcdFx0dGhpcy5mb2xkZXJzLmZvckVhY2goIGYgPT4ge1xuXG5cdFx0XHRcdGlmICggZi5fdGl0bGUgaW4gb2JqLmZvbGRlcnMgKSB7XG5cdFx0XHRcdFx0Zi5sb2FkKCBvYmouZm9sZGVyc1sgZi5fdGl0bGUgXSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBvYmplY3QgbWFwcGluZyBjb250cm9sbGVyIG5hbWVzIHRvIHZhbHVlcy4gVGhlIG9iamVjdCBjYW4gYmUgcGFzc2VkIHRvIGBndWkubG9hZCgpYCB0b1xuXHQgKiByZWNhbGwgdGhlc2UgdmFsdWVzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiB7XG5cdCAqIFx0Y29udHJvbGxlcnM6IHtcblx0ICogXHRcdHByb3AxOiAxLFxuXHQgKiBcdFx0cHJvcDI6ICd2YWx1ZScsXG5cdCAqIFx0XHQuLi5cblx0ICogXHR9LFxuXHQgKiBcdGZvbGRlcnM6IHtcblx0ICogXHRcdGZvbGRlck5hbWUxOiB7IGNvbnRyb2xsZXJzLCBmb2xkZXJzIH0sXG5cdCAqIFx0XHRmb2xkZXJOYW1lMjogeyBjb250cm9sbGVycywgZm9sZGVycyB9XG5cdCAqIFx0XHQuLi5cblx0ICogXHR9XG5cdCAqIH1cblx0ICpcblx0ICogQHBhcmFtIHtib29sZWFufSByZWN1cnNpdmUgUGFzcyBmYWxzZSB0byBleGNsdWRlIGZvbGRlcnMgZGVzY2VuZGluZyBmcm9tIHRoaXMgR1VJLlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fVxuXHQgKi9cblx0c2F2ZSggcmVjdXJzaXZlID0gdHJ1ZSApIHtcblxuXHRcdGNvbnN0IG9iaiA9IHtcblx0XHRcdGNvbnRyb2xsZXJzOiB7fSxcblx0XHRcdGZvbGRlcnM6IHt9XG5cdFx0fTtcblxuXHRcdHRoaXMuY29udHJvbGxlcnMuZm9yRWFjaCggYyA9PiB7XG5cblx0XHRcdGlmICggYyBpbnN0YW5jZW9mIEZ1bmN0aW9uQ29udHJvbGxlciApIHJldHVybjtcblxuXHRcdFx0aWYgKCBjLl9uYW1lIGluIG9iai5jb250cm9sbGVycyApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IHNhdmUgR1VJIHdpdGggZHVwbGljYXRlIHByb3BlcnR5IFwiJHtjLl9uYW1lfVwiYCApO1xuXHRcdFx0fVxuXG5cdFx0XHRvYmouY29udHJvbGxlcnNbIGMuX25hbWUgXSA9IGMuc2F2ZSgpO1xuXG5cdFx0fSApO1xuXG5cdFx0aWYgKCByZWN1cnNpdmUgKSB7XG5cblx0XHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblxuXHRcdFx0XHRpZiAoIGYuX3RpdGxlIGluIG9iai5mb2xkZXJzICkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggYENhbm5vdCBzYXZlIEdVSSB3aXRoIGR1cGxpY2F0ZSBmb2xkZXIgXCIke2YuX3RpdGxlfVwiYCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0b2JqLmZvbGRlcnNbIGYuX3RpdGxlIF0gPSBmLnNhdmUoKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9iajtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE9wZW5zIGEgR1VJIG9yIGZvbGRlci4gR1VJIGFuZCBmb2xkZXJzIGFyZSBvcGVuIGJ5IGRlZmF1bHQuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gb3BlbiBQYXNzIGZhbHNlIHRvIGNsb3NlLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLm9wZW4oKTsgLy8gb3BlblxuXHQgKiBndWkub3BlbiggZmFsc2UgKTsgLy8gY2xvc2Vcblx0ICogZ3VpLm9wZW4oIGd1aS5fY2xvc2VkICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0b3Blbiggb3BlbiA9IHRydWUgKSB7XG5cblx0XHR0aGlzLl9zZXRDbG9zZWQoICFvcGVuICk7XG5cblx0XHR0aGlzLiR0aXRsZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgIXRoaXMuX2Nsb3NlZCApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCAnY2xvc2VkJywgdGhpcy5fY2xvc2VkICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlcyB0aGUgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGNsb3NlKCkge1xuXHRcdHJldHVybiB0aGlzLm9wZW4oIGZhbHNlICk7XG5cdH1cblxuXHRfc2V0Q2xvc2VkKCBjbG9zZWQgKSB7XG5cdFx0aWYgKCB0aGlzLl9jbG9zZWQgPT09IGNsb3NlZCApIHJldHVybjtcblx0XHR0aGlzLl9jbG9zZWQgPSBjbG9zZWQ7XG5cdFx0dGhpcy5fY2FsbE9uT3BlbkNsb3NlKCB0aGlzICk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgdGhlIEdVSSBhZnRlciBpdCdzIGJlZW4gaGlkZGVuLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5zaG93KCk7XG5cdCAqIGd1aS5zaG93KCBmYWxzZSApOyAvLyBoaWRlXG5cdCAqIGd1aS5zaG93KCBndWkuX2hpZGRlbiApOyAvLyB0b2dnbGVcblx0ICovXG5cdHNob3coIHNob3cgPSB0cnVlICkge1xuXG5cdFx0dGhpcy5faGlkZGVuID0gIXNob3c7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHRoaXMuX2hpZGRlbiA/ICdub25lJyA6ICcnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIaWRlcyB0aGUgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGhpZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2hvdyggZmFsc2UgKTtcblx0fVxuXG5cdG9wZW5BbmltYXRlZCggb3BlbiA9IHRydWUgKSB7XG5cblx0XHQvLyBzZXQgc3RhdGUgaW1tZWRpYXRlbHlcblx0XHR0aGlzLl9zZXRDbG9zZWQoICFvcGVuICk7XG5cblx0XHR0aGlzLiR0aXRsZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgIXRoaXMuX2Nsb3NlZCApO1xuXG5cdFx0Ly8gd2FpdCBmb3IgbmV4dCBmcmFtZSB0byBtZWFzdXJlICRjaGlsZHJlblxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4ge1xuXG5cdFx0XHQvLyBleHBsaWNpdGx5IHNldCBpbml0aWFsIGhlaWdodCBmb3IgdHJhbnNpdGlvblxuXHRcdFx0Y29uc3QgaW5pdGlhbEhlaWdodCA9IHRoaXMuJGNoaWxkcmVuLmNsaWVudEhlaWdodDtcblx0XHRcdHRoaXMuJGNoaWxkcmVuLnN0eWxlLmhlaWdodCA9IGluaXRpYWxIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ3RyYW5zaXRpb24nICk7XG5cblx0XHRcdGNvbnN0IG9uVHJhbnNpdGlvbkVuZCA9IGUgPT4ge1xuXHRcdFx0XHRpZiAoIGUudGFyZ2V0ICE9PSB0aGlzLiRjaGlsZHJlbiApIHJldHVybjtcblx0XHRcdFx0dGhpcy4kY2hpbGRyZW4uc3R5bGUuaGVpZ2h0ID0gJyc7XG5cdFx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAndHJhbnNpdGlvbicgKTtcblx0XHRcdFx0dGhpcy4kY2hpbGRyZW4ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQgKTtcblx0XHRcdH07XG5cblx0XHRcdHRoaXMuJGNoaWxkcmVuLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kICk7XG5cblx0XHRcdC8vIHRvZG86IHRoaXMgaXMgd3JvbmcgaWYgY2hpbGRyZW4ncyBzY3JvbGxIZWlnaHQgbWFrZXMgZm9yIGEgZ3VpIHRhbGxlciB0aGFuIG1heEhlaWdodFxuXHRcdFx0Y29uc3QgdGFyZ2V0SGVpZ2h0ID0gIW9wZW4gPyAwIDogdGhpcy4kY2hpbGRyZW4uc2Nyb2xsSGVpZ2h0O1xuXG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSggJ2Nsb3NlZCcsICFvcGVuICk7XG5cblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4ge1xuXHRcdFx0XHR0aGlzLiRjaGlsZHJlbi5zdHlsZS5oZWlnaHQgPSB0YXJnZXRIZWlnaHQgKyAncHgnO1xuXHRcdFx0fSApO1xuXG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2UgdGhlIHRpdGxlIG9mIHRoaXMgR1VJLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHR0aXRsZSggdGl0bGUgKSB7XG5cdFx0LyoqXG5cdFx0ICogQ3VycmVudCB0aXRsZSBvZiB0aGUgR1VJLiBVc2UgYGd1aS50aXRsZSggJ1RpdGxlJyApYCB0byBtb2RpZnkgdGhpcyB2YWx1ZS5cblx0XHQgKiBAdHlwZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdHRoaXMuX3RpdGxlID0gdGl0bGU7XG5cdFx0dGhpcy4kdGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNldHMgYWxsIGNvbnRyb2xsZXJzIHRvIHRoZWlyIGluaXRpYWwgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJlY3Vyc2l2ZSBQYXNzIGZhbHNlIHRvIGV4Y2x1ZGUgZm9sZGVycyBkZXNjZW5kaW5nIGZyb20gdGhpcyBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0cmVzZXQoIHJlY3Vyc2l2ZSA9IHRydWUgKSB7XG5cdFx0Y29uc3QgY29udHJvbGxlcnMgPSByZWN1cnNpdmUgPyB0aGlzLmNvbnRyb2xsZXJzUmVjdXJzaXZlKCkgOiB0aGlzLmNvbnRyb2xsZXJzO1xuXHRcdGNvbnRyb2xsZXJzLmZvckVhY2goIGMgPT4gYy5yZXNldCgpICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuZXZlciBhIGNvbnRyb2xsZXIgaW4gdGhpcyBHVUkgY2hhbmdlcy5cblx0ICogQHBhcmFtIHtmdW5jdGlvbih7b2JqZWN0Om9iamVjdCwgcHJvcGVydHk6c3RyaW5nLCB2YWx1ZTphbnksIGNvbnRyb2xsZXI6Q29udHJvbGxlcn0pfSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLm9uQ2hhbmdlKCBldmVudCA9PiB7XG5cdCAqIFx0ZXZlbnQub2JqZWN0ICAgICAvLyBvYmplY3QgdGhhdCB3YXMgbW9kaWZpZWRcblx0ICogXHRldmVudC5wcm9wZXJ0eSAgIC8vIHN0cmluZywgbmFtZSBvZiBwcm9wZXJ0eVxuXHQgKiBcdGV2ZW50LnZhbHVlICAgICAgLy8gbmV3IHZhbHVlIG9mIGNvbnRyb2xsZXJcblx0ICogXHRldmVudC5jb250cm9sbGVyIC8vIGNvbnRyb2xsZXIgdGhhdCB3YXMgbW9kaWZpZWRcblx0ICogfSApO1xuXHQgKi9cblx0b25DaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25DaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWVcblx0XHQgKiBkaXJlY3RseS4gVXNlIHRoZSBgZ3VpLm9uQ2hhbmdlKCBjYWxsYmFjayApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7RnVuY3Rpb259XG5cdFx0ICovXG5cdFx0dGhpcy5fb25DaGFuZ2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9jYWxsT25DaGFuZ2UoIGNvbnRyb2xsZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMucGFyZW50ICkge1xuXHRcdFx0dGhpcy5wYXJlbnQuX2NhbGxPbkNoYW5nZSggY29udHJvbGxlciApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fb25DaGFuZ2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX29uQ2hhbmdlLmNhbGwoIHRoaXMsIHtcblx0XHRcdFx0b2JqZWN0OiBjb250cm9sbGVyLm9iamVjdCxcblx0XHRcdFx0cHJvcGVydHk6IGNvbnRyb2xsZXIucHJvcGVydHksXG5cdFx0XHRcdHZhbHVlOiBjb250cm9sbGVyLmdldFZhbHVlKCksXG5cdFx0XHRcdGNvbnRyb2xsZXJcblx0XHRcdH0gKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuZXZlciBhIGNvbnRyb2xsZXIgaW4gdGhpcyBHVUkgaGFzIGZpbmlzaGVkIGNoYW5naW5nLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHtvYmplY3Q6b2JqZWN0LCBwcm9wZXJ0eTpzdHJpbmcsIHZhbHVlOmFueSwgY29udHJvbGxlcjpDb250cm9sbGVyfSl9IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub25GaW5pc2hDaGFuZ2UoIGV2ZW50ID0+IHtcblx0ICogXHRldmVudC5vYmplY3QgICAgIC8vIG9iamVjdCB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiBcdGV2ZW50LnByb3BlcnR5ICAgLy8gc3RyaW5nLCBuYW1lIG9mIHByb3BlcnR5XG5cdCAqIFx0ZXZlbnQudmFsdWUgICAgICAvLyBuZXcgdmFsdWUgb2YgY29udHJvbGxlclxuXHQgKiBcdGV2ZW50LmNvbnRyb2xsZXIgLy8gY29udHJvbGxlciB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKSB7XG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBhY2Nlc3MgdGhlIGZ1bmN0aW9uIGJvdW5kIHRvIGBvbkZpbmlzaENoYW5nZWAgZXZlbnRzLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBndWkub25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X2NhbGxPbkZpbmlzaENoYW5nZSggY29udHJvbGxlciApIHtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uRmluaXNoQ2hhbmdlKCBjb250cm9sbGVyICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9vbkZpbmlzaENoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25GaW5pc2hDaGFuZ2UuY2FsbCggdGhpcywge1xuXHRcdFx0XHRvYmplY3Q6IGNvbnRyb2xsZXIub2JqZWN0LFxuXHRcdFx0XHRwcm9wZXJ0eTogY29udHJvbGxlci5wcm9wZXJ0eSxcblx0XHRcdFx0dmFsdWU6IGNvbnRyb2xsZXIuZ2V0VmFsdWUoKSxcblx0XHRcdFx0Y29udHJvbGxlclxuXHRcdFx0fSApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhpcyBHVUkgb3IgaXRzIGRlc2NlbmRhbnRzIGFyZSBvcGVuZWQgb3IgY2xvc2VkLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKEdVSSl9IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub25PcGVuQ2xvc2UoIGNoYW5nZWRHVUkgPT4ge1xuXHQgKiBcdGNvbnNvbGUubG9nKCBjaGFuZ2VkR1VJLl9jbG9zZWQgKTtcblx0ICogfSApO1xuXHQgKi9cblx0b25PcGVuQ2xvc2UoIGNhbGxiYWNrICkge1xuXHRcdHRoaXMuX29uT3BlbkNsb3NlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfY2FsbE9uT3BlbkNsb3NlKCBjaGFuZ2VkR1VJICkge1xuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uT3BlbkNsb3NlKCBjaGFuZ2VkR1VJICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9vbk9wZW5DbG9zZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25PcGVuQ2xvc2UuY2FsbCggdGhpcywgY2hhbmdlZEdVSSApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cm95cyBhbGwgRE9NIGVsZW1lbnRzIGFuZCBldmVudCBsaXN0ZW5lcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgR1VJLlxuXHQgKi9cblx0ZGVzdHJveSgpIHtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoIHRoaXMucGFyZW50LmNoaWxkcmVuLmluZGV4T2YoIHRoaXMgKSwgMSApO1xuXHRcdFx0dGhpcy5wYXJlbnQuZm9sZGVycy5zcGxpY2UoIHRoaXMucGFyZW50LmZvbGRlcnMuaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCApIHtcblx0XHRcdHRoaXMuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblx0XHR9XG5cblx0XHRBcnJheS5mcm9tKCB0aGlzLmNoaWxkcmVuICkuZm9yRWFjaCggYyA9PiBjLmRlc3Ryb3koKSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBjb250cm9sbGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkgYW5kIGl0cyBkZXNjZW5kZW50cy5cblx0ICogQHJldHVybnMge0NvbnRyb2xsZXJbXX1cblx0ICovXG5cdGNvbnRyb2xsZXJzUmVjdXJzaXZlKCkge1xuXHRcdGxldCBjb250cm9sbGVycyA9IEFycmF5LmZyb20oIHRoaXMuY29udHJvbGxlcnMgKTtcblx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cdFx0XHRjb250cm9sbGVycyA9IGNvbnRyb2xsZXJzLmNvbmNhdCggZi5jb250cm9sbGVyc1JlY3Vyc2l2ZSgpICk7XG5cdFx0fSApO1xuXHRcdHJldHVybiBjb250cm9sbGVycztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGZvbGRlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJIGFuZCBpdHMgZGVzY2VuZGVudHMuXG5cdCAqIEByZXR1cm5zIHtHVUlbXX1cblx0ICovXG5cdGZvbGRlcnNSZWN1cnNpdmUoKSB7XG5cdFx0bGV0IGZvbGRlcnMgPSBBcnJheS5mcm9tKCB0aGlzLmZvbGRlcnMgKTtcblx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cdFx0XHRmb2xkZXJzID0gZm9sZGVycy5jb25jYXQoIGYuZm9sZGVyc1JlY3Vyc2l2ZSgpICk7XG5cdFx0fSApO1xuXHRcdHJldHVybiBmb2xkZXJzO1xuXHR9XG5cbn1cblxuZXhwb3J0IHsgQm9vbGVhbkNvbnRyb2xsZXIsIENvbG9yQ29udHJvbGxlciwgQ29udHJvbGxlciwgRnVuY3Rpb25Db250cm9sbGVyLCBHVUksIE51bWJlckNvbnRyb2xsZXIsIE9wdGlvbkNvbnRyb2xsZXIsIFN0cmluZ0NvbnRyb2xsZXIsIEdVSSBhcyBkZWZhdWx0IH07XG4iLCJpbXBvcnQgdHlwZSB7IEFjdGluU3RhdHMgfSBmcm9tIFwiLi90ZWxlbWV0cnktYW5hbHlzaXNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5Q2hlY2twb2ludChzOiBBY3RpblN0YXRzLCBmaXhlZEFyZWE6IGJvb2xlYW4pOiBcInZhbGlkXCIgfCBcImNvbnRhY3RzXCIgfCBcImZhdGFsXCIge1xuICBjb25zdCBmaW5pdGUgPSBbXG4gICAgcy5jZWxsLmFyZWEsXG4gICAgcy5jZWxsLmNlbnRyb2lkWCxcbiAgICBzLmNlbGwuY2VudHJvaWRZLFxuICAgIHMuY2VsbC5sZWZ0LFxuICAgIHMuY2VsbC5yaWdodCxcbiAgICBzLmNlbGwudG9wLFxuICAgIHMuY2VsbC5ib3R0b20sXG4gICAgcy5hY3RpbkJhbGFuY2VFcnJvcixcbiAgICBzLmluc2lkZVBvbHltZXJCZWFkcyxcbiAgICBzLmluUG9seW1lcixcbiAgICBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICBzLmJyb2tlbkxpbmtzLFxuICAgIHMuY3ljbGVzLFxuICBdLmV2ZXJ5KE51bWJlci5pc0Zpbml0ZSk7XG4gIGlmIChcbiAgICAhZmluaXRlIHx8XG4gICAgcy5jZWxsLmFyZWEgPD0gMCB8fFxuICAgIHMuYWN0aW5CYWxhbmNlRXJyb3IgIT09IDAgfHxcbiAgICBzLmJyb2tlbkxpbmtzICE9PSAwIHx8XG4gICAgcy5jeWNsZXMgIT09IDAgfHxcbiAgICAhTnVtYmVyLmlzSW50ZWdlcihzLmluc2lkZVBvbHltZXJCZWFkcykgfHxcbiAgICAhTnVtYmVyLmlzSW50ZWdlcihzLmluUG9seW1lcikgfHxcbiAgICBzLmluc2lkZVBvbHltZXJCZWFkcyA8IDAgfHxcbiAgICBzLmluc2lkZVBvbHltZXJCZWFkcyA+IHMuaW5Qb2x5bWVyIHx8XG4gICAgIU51bWJlci5pc0ludGVnZXIocy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMpIHx8XG4gICAgcy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMgPCAwIHx8XG4gICAgKGZpeGVkQXJlYSAmJiBNYXRoLmFicyhzLmNlbGwuYXJlYSAtIDEpID4gMC4wMDEpXG4gIClcbiAgICByZXR1cm4gXCJmYXRhbFwiO1xuICBpZiAocy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMgPT09IDAgJiYgcy5pbnNpZGVQb2x5bWVyQmVhZHMgPT09IHMuaW5Qb2x5bWVyKSByZXR1cm4gXCJ2YWxpZFwiO1xuICAvLyBDb3VudHMgaWRlbnRpZnkgcmVzaWR1YWwgY29udGFjdHMsIG5vdCBjb3JydXB0aW9uLiBUaGUgcmVwYWlyJ3MgZGlzcGxhY2VtZW50LFxuICAvLyBpdGVyYXRpb24gYW5kIGVsYXBzZWQtdGltZSBsaW1pdHMgZGVjaWRlIHdoZXRoZXIgdGhlc2UgY2FuIGJlIGNvcnJlY3RlZC5cbiAgcmV0dXJuIFwiY29udGFjdHNcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrcG9pbnREZXRhaWxzKHM6IEFjdGluU3RhdHMpIHtcbiAgcmV0dXJuIHtcbiAgICBzdGVwOiBzLnN0ZXAsXG4gICAgbWFzczogcy5hY3RpbkJhbGFuY2VFcnJvcixcbiAgICBpbnNpZGVGOiBzLmluc2lkZVBvbHltZXJCZWFkcyxcbiAgICB0b3RhbEY6IHMuaW5Qb2x5bWVyLFxuICAgIG91dHNpZGVGOiBzLmluUG9seW1lciAtIHMuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgIGNyb3NzaW5nczogcy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMsXG4gICAgYnJva2VuTGlua3M6IHMuYnJva2VuTGlua3MsXG4gICAgY3ljbGVzOiBzLmN5Y2xlcyxcbiAgICBhcmVhOiBzLmNlbGwuYXJlYSxcbiAgICBjZW50cm9pZFg6IHMuY2VsbC5jZW50cm9pZFgsXG4gICAgY2VudHJvaWRZOiBzLmNlbGwuY2VudHJvaWRZLFxuICB9O1xufVxuXG50eXBlIERlcGVuZGVuY2llcyA9IHtcbiAgaW5zcGVjdDogKCkgPT4gUHJvbWlzZTxBY3RpblN0YXRzPjtcbiAgYmVnaW46ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHJlcGFpcjogKGl0ZXJhdGlvbnM6IG51bWJlcikgPT4gUHJvbWlzZTxudW1iZXI+O1xuICByb2xsYmFjazogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgZGlzcG9zZTogKCkgPT4gdm9pZDtcbiAgZml4ZWRBcmVhOiAoKSA9PiBib29sZWFuO1xuICBtYXhEaXNwbGFjZW1lbnQ6ICgpID0+IG51bWJlcjtcbiAgbm93OiAoKSA9PiBudW1iZXI7XG4gIG5vdGljZTogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZDtcbiAgZmFpbDogKGVycm9yOiB1bmtub3duKSA9PiB2b2lkO1xufTtcbmV4cG9ydCB0eXBlIFJlY292ZXJ5UmVjb3JkID0ge1xuICB0cmlnZ2VyU3RlcDogbnVtYmVyO1xuICBjdXJyZW50U3RlcD86IG51bWJlcjtcbiAgaW5pdGlhbENyb3NzaW5nczogbnVtYmVyO1xuICBpbml0aWFsT3V0c2lkZTogbnVtYmVyO1xuICBsYXRlc3Q/OiBSZXR1cm5UeXBlPHR5cGVvZiBjaGVja3BvaW50RGV0YWlscz47XG4gIHBhc3NlczogbnVtYmVyO1xuICBvdXRjb21lOiBcImNoZWNraW5nXCIgfCBcImZyZXNoLXN0YXRlLWNsZWFuXCIgfCBcImNvcnJlY3RlZFwiIHwgXCJmYWlsZWRcIjtcbiAgbWF4RGlzcGxhY2VtZW50OiBudW1iZXI7XG4gIGVsYXBzZWRNcz86IG51bWJlcjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59O1xuXG4vLyBDYWxsZWQgc3luY2hyb25vdXNseSBmcm9tIHRoZSBhc3luY2hyb25vdXMgZGlhZ25vc3RpYyBjYWxsYmFjaywgYnV0IG5ldmVyXG4vLyBhd2FpdGVkIGJ5IHRoYXQgY2FsbGJhY2suIFRoZSBhY3RpdmUgZmxhZyBmcmVlemVzIG5ldyBwaHlzaWNzIHN1Ym1pc3Npb25zLlxuZXhwb3J0IGNsYXNzIENvbnRhY3RSZWNvdmVyeSB7XG4gIGFjdGl2ZSA9IGZhbHNlO1xuICByZWFkb25seSBoaXN0b3J5OiBSZWNvdmVyeVJlY29yZFtdID0gW107XG4gIHByaXZhdGUgcGVuZGluZzogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGRlcHM6IERlcGVuZGVuY2llcztcbiAgY29uc3RydWN0b3IoZGVwczogRGVwZW5kZW5jaWVzKSB7XG4gICAgdGhpcy5kZXBzID0gZGVwcztcbiAgfVxuICB3YWl0KCkge1xuICAgIHJldHVybiB0aGlzLnBlbmRpbmcgPz8gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgcmVxdWVzdCh0cmlnZ2VyOiBBY3RpblN0YXRzKSB7XG4gICAgaWYgKHRoaXMuYWN0aXZlKSByZXR1cm4gdGhpcy53YWl0KCk7XG4gICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuICAgIGNvbnN0IGQgPSB0aGlzLmRlcHMsXG4gICAgICBzdGFydGVkID0gZC5ub3coKTtcbiAgICBjb25zdCByZWNvcmQ6IFJlY292ZXJ5UmVjb3JkID0ge1xuICAgICAgdHJpZ2dlclN0ZXA6IHRyaWdnZXIuc3RlcCxcbiAgICAgIGluaXRpYWxDcm9zc2luZ3M6IHRyaWdnZXIuY3Jvc3NpbmdGaWxhbWVudEJvbmRzLFxuICAgICAgaW5pdGlhbE91dHNpZGU6IHRyaWdnZXIuaW5Qb2x5bWVyIC0gdHJpZ2dlci5pbnNpZGVQb2x5bWVyQmVhZHMsXG4gICAgICBwYXNzZXM6IDAsXG4gICAgICBvdXRjb21lOiBcImNoZWNraW5nXCIsXG4gICAgICBtYXhEaXNwbGFjZW1lbnQ6IDAsXG4gICAgfTtcbiAgICB0aGlzLmhpc3RvcnkucHVzaChyZWNvcmQpO1xuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID4gMzIpIHRoaXMuaGlzdG9yeS5zaGlmdCgpO1xuICAgIGxldCBiYWNrZWRVcCA9IGZhbHNlO1xuICAgIGNvbnN0IGNoZWNrQnVkZ2V0ID0gKCkgPT4ge1xuICAgICAgaWYgKGQubm93KCkgLSBzdGFydGVkID4gNTAwMCkgdGhyb3cgRXJyb3IoXCJDb250YWN0IHJlY292ZXJ5IGV4Y2VlZGVkIGl0cyB0aW1lIGJ1ZGdldFwiKTtcbiAgICB9O1xuICAgIGNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGQubm90aWNlKGBSZWNoZWNraW5nIGNvbnRhY3RzOiAke3JlY29yZC5pbml0aWFsT3V0c2lkZX0gb3V0c2lkZSBiZWFkKHMpLCAke3RyaWdnZXIuY3Jvc3NpbmdGaWxhbWVudEJvbmRzfSBjcm9zc2luZyhzKeKApmApO1xuICAgICAgICBsZXQgc3RhdGUgPSBhd2FpdCBkLmluc3BlY3QoKTtcbiAgICAgICAgcmVjb3JkLmxhdGVzdCA9IGNoZWNrcG9pbnREZXRhaWxzKHN0YXRlKTtcbiAgICAgICAgY2hlY2tCdWRnZXQoKTtcbiAgICAgICAgcmVjb3JkLmN1cnJlbnRTdGVwID0gc3RhdGUuc3RlcDtcbiAgICAgICAgbGV0IGtpbmQgPSBjbGFzc2lmeUNoZWNrcG9pbnQoc3RhdGUsIGQuZml4ZWRBcmVhKCkpO1xuICAgICAgICBpZiAoa2luZCA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgcmVjb3JkLm91dGNvbWUgPSBcImZyZXNoLXN0YXRlLWNsZWFuXCI7XG4gICAgICAgICAgZC5ub3RpY2UoXCJDdXJyZW50IHN0YXRlIHZlcmlmaWVkOyBjb250aW51aW5nLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtpbmQgIT09IFwiY29udGFjdHNcIikgdGhyb3cgRXJyb3IoYEN1cnJlbnQgc3RhdGUgaGFzIGEgbm9uLWNvbnRhY3QgaW52YXJpYW50IGZhaWx1cmU6ICR7SlNPTi5zdHJpbmdpZnkocmVjb3JkLmxhdGVzdCl9YCk7XG4gICAgICAgIGF3YWl0IGQuYmVnaW4oKTtcbiAgICAgICAgYmFja2VkVXAgPSB0cnVlO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZXJhdGlvbnMgb2YgWzQsIDgsIDE2LCAzMl0pIHtcbiAgICAgICAgICBjaGVja0J1ZGdldCgpO1xuICAgICAgICAgIGQubm90aWNlKGBDb3JyZWN0aW5nIGNvbnRhY3QgcmVzaWR1YWxzICgke3JlY29yZC5wYXNzZXMgKyBpdGVyYXRpb25zfSBleHRyYSBwYXNzZXMp4oCmYCk7XG4gICAgICAgICAgcmVjb3JkLm1heERpc3BsYWNlbWVudCA9IGF3YWl0IGQucmVwYWlyKGl0ZXJhdGlvbnMpO1xuICAgICAgICAgIHJlY29yZC5wYXNzZXMgKz0gaXRlcmF0aW9ucztcbiAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShyZWNvcmQubWF4RGlzcGxhY2VtZW50KSB8fCByZWNvcmQubWF4RGlzcGxhY2VtZW50ID4gZC5tYXhEaXNwbGFjZW1lbnQoKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiQ29udGFjdCBjb3JyZWN0aW9uIGV4Y2VlZGVkIGl0cyBkaXNwbGFjZW1lbnQgYnVkZ2V0XCIpO1xuICAgICAgICAgIHN0YXRlID0gYXdhaXQgZC5pbnNwZWN0KCk7XG4gICAgICAgICAgcmVjb3JkLmxhdGVzdCA9IGNoZWNrcG9pbnREZXRhaWxzKHN0YXRlKTtcbiAgICAgICAgICBjaGVja0J1ZGdldCgpO1xuICAgICAgICAgIGlmIChzdGF0ZS5zdGVwICE9PSByZWNvcmQuY3VycmVudFN0ZXApIHRocm93IEVycm9yKFwiUGh5c2ljcyBhZHZhbmNlZCBkdXJpbmcgY29udGFjdCByZWNvdmVyeVwiKTtcbiAgICAgICAgICBraW5kID0gY2xhc3NpZnlDaGVja3BvaW50KHN0YXRlLCBkLmZpeGVkQXJlYSgpKTtcbiAgICAgICAgICBpZiAoa2luZCA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgICByZWNvcmQub3V0Y29tZSA9IFwiY29ycmVjdGVkXCI7XG4gICAgICAgICAgICBkLm5vdGljZShgQ29udGFjdHMgY29ycmVjdGVkIGFuZCB2ZXJpZmllZCAoJHtyZWNvcmQucGFzc2VzfSBwYXNzZXMpLmApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoa2luZCAhPT0gXCJjb250YWN0c1wiKSB0aHJvdyBFcnJvcihgQ29udGFjdCBjb3JyZWN0aW9uIGNoYW5nZWQgYW5vdGhlciBpbnZhcmlhbnQ6ICR7SlNPTi5zdHJpbmdpZnkocmVjb3JkLmxhdGVzdCl9YCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgRXJyb3IoYENvbnRhY3QgY29ycmVjdGlvbiBkaWQgbm90IGNvbnZlcmdlIHdpdGhpbiA2MCBleHRyYSBwYXNzZXM6ICR7SlNPTi5zdHJpbmdpZnkocmVjb3JkLmxhdGVzdCl9YCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWNvcmQub3V0Y29tZSA9IFwiZmFpbGVkXCI7XG4gICAgICAgIHJlY29yZC5lcnJvciA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICAgICAgaWYgKGJhY2tlZFVwKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGQucm9sbGJhY2soKTtcbiAgICAgICAgICB9IGNhdGNoIChyb2xsYmFja0Vycm9yKSB7XG4gICAgICAgICAgICByZWNvcmQuZXJyb3IgKz0gYDsgcm9sbGJhY2sgZmFpbGVkOiAke1N0cmluZyhyb2xsYmFja0Vycm9yKX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkLmZhaWwobmV3IEVycm9yKHJlY29yZC5lcnJvcikpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZC5kaXNwb3NlKCk7XG4gICAgICAgIHJlY29yZC5lbGFwc2VkTXMgPSBkLm5vdygpIC0gc3RhcnRlZDtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMucGVuZGluZyA9IHJ1bigpO1xuICAgIHJldHVybiB0aGlzLnBlbmRpbmc7XG4gIH1cbn1cbiIsImltcG9ydCB7IHBvbHlnb25PY2N1cGFuY3ksIHBvbHlnb25Cb25kQ3Jvc3NpbmcgfSBmcm9tIFwiLi9vY2N1cGFuY3lcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRlc3RFbmNsb3N1cmUoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXIgfSxcbiAgY291bnRzOiB7IGFjdGluOiBudW1iZXI7IG1lbWJyYW5lOiBudW1iZXIgfSxcbiAgZGlzcGF0Y2g6ICgpID0+IHZvaWQsXG4gIGNvbmZpZ3VyZTogKGZpeGVkQXJlYTogYm9vbGVhbiwgcmVmZXJlbmNlQXJlYTogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgY2hlY2tzOiB7IG5hbWU6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuIH1bXSA9IFtdO1xuICBjb25zdCBhc3NlcnQgPSAobmFtZTogc3RyaW5nLCBjb25kaXRpb246IGJvb2xlYW4pID0+IHtcbiAgICBjaGVja3MucHVzaCh7IG5hbWUsIHBhc3NlZDogY29uZGl0aW9uIH0pO1xuICAgIGlmICghY29uZGl0aW9uKSB0aHJvdyBuZXcgRXJyb3IoYEVuY2xvc3VyZSBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyKSA9PiB7XG4gICAgY29uc3Qgc3RhZ2UgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogYnVmZmVyLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihidWZmZXIsIDAsIHN0YWdlLCAwLCBidWZmZXIuc2l6ZSk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGF3YWl0IHN0YWdlLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgZGF0YSA9IHN0YWdlLmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCk7XG4gICAgc3RhZ2UudW5tYXAoKTtcbiAgICBzdGFnZS5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG4gIGNvbnN0IHJ1biA9IGFzeW5jIChwb2x5Z29uOiBudW1iZXJbXVtdLCBwb2ludHM6IG51bWJlcltdW10sIGZpeGVkQXJlYSA9IGZhbHNlLCByZWZlcmVuY2VBcmVhID0gNDAwKSA9PiB7XG4gICAgY29uc3QgbWVtID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUuc2l6ZSksXG4gICAgICBtZiA9IG5ldyBGbG9hdDMyQXJyYXkobWVtKSxcbiAgICAgIG11ID0gbmV3IFVpbnQzMkFycmF5KG1lbSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMubWVtYnJhbmU7IGkrKykge1xuICAgICAgLy8gRGVuc2UgaG9yaXpvbnRhbCBlZGdlcyBhbHNvIG92ZXJmbG93IHRoZSBzaG9ydGxpc3RzLCBleGVyY2lzaW5nIHRoZWlyXG4gICAgICAvLyBjb21wbGV0ZS1wb2x5Z29uIGZhbGxiYWNrIHJhdGhlciB0aGFuIG9ubHkgc3BhcnNlIGhhcHB5LXBhdGggYmlucy5cbiAgICAgIGNvbnN0IGF0ID0gKGkgKiBwb2x5Z29uLmxlbmd0aCkgLyBjb3VudHMubWVtYnJhbmU7XG4gICAgICBjb25zdCBlZGdlID0gTWF0aC5mbG9vcihhdCk7XG4gICAgICBjb25zdCBhID0gcG9seWdvbltlZGdlXSxcbiAgICAgICAgYiA9IHBvbHlnb25bKGVkZ2UgKyAxKSAlIHBvbHlnb24ubGVuZ3RoXTtcbiAgICAgIGNvbnN0IHAgPSBbYVswXSArIChiWzBdIC0gYVswXSkgKiAoYXQgLSBlZGdlKSwgYVsxXSArIChiWzFdIC0gYVsxXSkgKiAoYXQgLSBlZGdlKV07XG4gICAgICBtdVtpICogMTBdID0gaTtcbiAgICAgIG11W2kgKiAxMCArIDZdID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG11W2kgKiAxMCArIDddID0gKGkgKyBjb3VudHMubWVtYnJhbmUgLSAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG1mW2kgKiAxMCArIDJdID0gcFswXTtcbiAgICAgIG1mW2kgKiAxMCArIDNdID0gcFsxXTtcbiAgICB9XG4gICAgY29uc3QgYWN0aW4gPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5hY3Rpbi5zaXplKSxcbiAgICAgIGFmID0gbmV3IEZsb2F0MzJBcnJheShhY3RpbiksXG4gICAgICBhdSA9IG5ldyBVaW50MzJBcnJheShhY3Rpbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMuYWN0aW47IGkrKykge1xuICAgICAgYXVbaSAqIDEwXSA9IGF1W2kgKiAxMCArIDZdID0gYXVbaSAqIDEwICsgN10gPSBpO1xuICAgIH1cbiAgICBwb2ludHMuZm9yRWFjaCgoW3gsIHldLCBpKSA9PiB7XG4gICAgICBhZltpICogMTAgKyAyXSA9IHg7XG4gICAgICBhZltpICogMTAgKyAzXSA9IHk7XG4gICAgICBhdVtpICogMTAgKyA2XSA9IGkgPT09IDAgPyAwIDogaSAtIDE7XG4gICAgICBhdVtpICogMTAgKyA3XSA9IGkgPT09IHBvaW50cy5sZW5ndGggLSAxID8gaSA6IGkgKyAxO1xuICAgIH0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLCAwLCBtZW0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBhY3Rpbik7XG4gICAgY29uZmlndXJlKGZpeGVkQXJlYSwgcmVmZXJlbmNlQXJlYSk7XG4gICAgZGlzcGF0Y2goKTtcbiAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgIHJldHVybiB7IGFjdGluOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpLCBtZW1icmFuZTogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubWVtYnJhbmUpKSB9O1xuICB9O1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuKFxuICAgIFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFsyMCwgMF0sXG4gICAgICBbMjAsIDIwXSxcbiAgICAgIFswLCAyMF0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbMjUsIDFdLFxuICAgICAgWzI2LCAxXSxcbiAgICBdXG4gICk7XG4gIGxldCBpbnNpZGUgPSBwb2x5Z29uT2NjdXBhbmN5KHJlc3VsdC5tZW1icmFuZSwgMTAsIHRydWUpO1xuICBhc3NlcnQoXCJlc2NhcGVkIGZpbGFtZW50IGJlYWRzIGFyZSBwcm9qZWN0ZWQgaW5zaWRlXCIsIGluc2lkZShyZXN1bHQuYWN0aW5bMl0sIHJlc3VsdC5hY3RpblszXSkgJiYgaW5zaWRlKHJlc3VsdC5hY3RpblsxMl0sIHJlc3VsdC5hY3RpblsxM10pKTtcbiAgbGV0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KHJlc3VsdC5hY3Rpbi5idWZmZXIpO1xuICBhc3NlcnQoXG4gICAgXCJjb250YWN0IHByZXNlcnZlcyBjb25uZWN0aXZpdHkgYW5kIGZpbml0ZSByZXNlcnZvaXIgYW1vdW50XCIsXG4gICAgd29yZHNbN10gPT09IDEgJiZcbiAgICAgIHdvcmRzWzE2XSA9PT0gMCAmJlxuICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnRzLmFjdGluIC0gMiB9LCAoXywgaykgPT4gayArIDIpLmV2ZXJ5KChpKSA9PiB3b3Jkc1tpICogMTAgKyA2XSA9PT0gaSAmJiB3b3Jkc1tpICogMTAgKyA3XSA9PT0gaSlcbiAgKTtcbiAgcmVzdWx0ID0gYXdhaXQgcnVuKFxuICAgIFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFs4LCAwXSxcbiAgICAgIFs4LCAzXSxcbiAgICAgIFszLCAzXSxcbiAgICAgIFszLCA4XSxcbiAgICAgIFswLCA4XSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFs3LCAxXSxcbiAgICAgIFsxLCA3XSxcbiAgICBdXG4gICk7XG4gIGluc2lkZSA9IHBvbHlnb25PY2N1cGFuY3kocmVzdWx0Lm1lbWJyYW5lLCAxMCwgdHJ1ZSk7XG4gIGNvbnN0IGNyb3NzaW5nID0gcG9seWdvbkJvbmRDcm9zc2luZyhyZXN1bHQubWVtYnJhbmUpO1xuICBhc3NlcnQoXG4gICAgXCJpbnRlcmlvciBlbmRwb2ludHMgY2Fubm90IGJyaWRnZSBhY3Jvc3MgYSBjb25jYXZlIGV4dGVyaW9yXCIsXG4gICAgaW5zaWRlKHJlc3VsdC5hY3RpblsxMl0sIHJlc3VsdC5hY3RpblsxM10pICYmICFjcm9zc2luZyhyZXN1bHQuYWN0aW5bMl0sIHJlc3VsdC5hY3RpblszXSwgcmVzdWx0LmFjdGluWzEyXSwgcmVzdWx0LmFjdGluWzEzXSlcbiAgKTtcbiAgcmVzdWx0ID0gYXdhaXQgcnVuKFxuICAgIFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFsyMCwgMF0sXG4gICAgICBbMjAsIDIwXSxcbiAgICAgIFswLCAyMF0sXG4gICAgXSxcbiAgICBbXSxcbiAgICB0cnVlLFxuICAgIDkwMFxuICApO1xuICBsZXQgYXJlYTIgPSAwLFxuICAgIGN4ID0gMCxcbiAgICBjeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLm1lbWJyYW5lOyBpKyspIHtcbiAgICBjb25zdCBqID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICBjb25zdCBheCA9IHJlc3VsdC5tZW1icmFuZVtpICogMTAgKyAyXSxcbiAgICAgIGF5ID0gcmVzdWx0Lm1lbWJyYW5lW2kgKiAxMCArIDNdO1xuICAgIGNvbnN0IGJ4ID0gcmVzdWx0Lm1lbWJyYW5lW2ogKiAxMCArIDJdLFxuICAgICAgYnkgPSByZXN1bHQubWVtYnJhbmVbaiAqIDEwICsgM107XG4gICAgY29uc3QgY3Jvc3MgPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICBhcmVhMiArPSBjcm9zcztcbiAgICBjeCArPSAoYXggKyBieCkgKiBjcm9zcztcbiAgICBjeSArPSAoYXkgKyBieSkgKiBjcm9zcztcbiAgfVxuICBhc3NlcnQoXCJhcmVhIGNsb3N1cmUgcmVhY2hlcyB0aGUgZGVjbGFyZWQgcmVmZXJlbmNlIGFyZWFcIiwgTWF0aC5hYnMoYXJlYTIgLyAyIC0gOTAwKSA8IDAuMDIpO1xuICBhc3NlcnQoXCJhcmVhIGNsb3N1cmUgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdlb21ldHJpYyBjZW50cm9pZFwiLCBNYXRoLmFicyhjeCAvICgzICogYXJlYTIpIC0gMTApIDwgMC4wMDEgJiYgTWF0aC5hYnMoY3kgLyAoMyAqIGFyZWEyKSAtIDEwKSA8IDAuMDAxKTtcbiAgd29yZHMgPSBuZXcgVWludDMyQXJyYXkocmVzdWx0LmFjdGluLmJ1ZmZlcik7XG4gIGFzc2VydChcbiAgICBcImdlb21ldHJ5IGNoYW5nZXMgZG8gbm90IG1hbnVmYWN0dXJlIG9yIGRpc2NhcmQgRy1hY3RpblwiLFxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50cy5hY3RpbiB9LCAoXywgaSkgPT4gaSkuZXZlcnkoKGkpID0+IHdvcmRzW2kgKiAxMCArIDZdID09PSBpICYmIHdvcmRzW2kgKiAxMCArIDddID09PSBpKVxuICApO1xuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiaW1wb3J0IEdVSSBmcm9tIFwibGlsLWd1aVwiO1xuaW1wb3J0IHsgcmVxdWVzdERldmljZSwgY29uZmlndXJlQ2FudmFzLCBjcmVhdGVTaGFkZXIsIHNldHVwSW50ZXJhY3Rpb25zLCBzZXR1cFRleHR1cmVzLCBnZXRSYW5kb21WYWx1ZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHJlbmRlckNvZGUgZnJvbSBcIi4vc2hhZGVycy9yZW5kZXIud2dzbFwiO1xuaW1wb3J0IHNpbXVsYXRlQ29kZSBmcm9tIFwiLi9zaGFkZXJzL3NpbXVsYXRlLndnc2xcIjtcbmltcG9ydCB7IGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXMsIHJ1blNpbXVsYXRpb25TdGVwLCBydW5FbmNsb3N1cmUsIHJ1bkNvbnRhY3RSZXBhaXIgfSBmcm9tIFwiLi9zaW11bGF0ZVwiO1xuaW1wb3J0IHsgQ29udGFjdFJlY292ZXJ5LCBjbGFzc2lmeUNoZWNrcG9pbnQgfSBmcm9tIFwiLi9jb250YWN0LXJlY292ZXJ5XCI7XG5cbi8vIEltcG9ydCBzaGFkZXIgaW5jbHVkZXNcbmltcG9ydCBiaW5kaW5nc0NvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9iaW5kaW5ncy53Z3NsXCI7XG5pbXBvcnQgdGV4dHVyZXNDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvdGV4dHVyZXMud2dzbFwiO1xuaW1wb3J0IGJ1ZmZlcnNDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYnVmZmVycy53Z3NsXCI7XG5pbXBvcnQgcmFuZG9tQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL3JhbmRvbS53Z3NsXCI7XG5pbXBvcnQgYWN0b215b3NpbkNvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9hY3RvbXlvc2luLndnc2xcIjtcbmltcG9ydCBlbmNsb3N1cmVDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvZW5jbG9zdXJlLndnc2xcIjtcbmltcG9ydCB7IFJlbmRlck1vZHVsZSB9IGZyb20gXCIuL3JlbmRlclwiO1xuaW1wb3J0IHsgU3Byb3V0U2NoZWR1bGVyLCBNQVhfU1BST1VUX1NJVEVTIH0gZnJvbSBcIi4vc3Byb3V0c1wiO1xuaW1wb3J0IHsgQWN0aW5UZWxlbWV0cnkgfSBmcm9tIFwiLi90ZWxlbWV0cnlcIjtcbmltcG9ydCB7IHNlZWRlZFJhbmRvbSB9IGZyb20gXCIuL3JhbmRvbVwiO1xuaW1wb3J0IHsgdGVzdE1lY2hhbmljcyB9IGZyb20gXCIuL21lY2hhbmljcy10ZXN0XCI7XG5pbXBvcnQgeyB0ZXN0RW5jbG9zdXJlIH0gZnJvbSBcIi4vZW5jbG9zdXJlLXRlc3RcIjtcbmltcG9ydCB7IHRlc3RSZW5ld2FsIH0gZnJvbSBcIi4vcmVuZXdhbC10ZXN0XCI7XG5pbXBvcnQgeyBGcmFtZUJ1ZGdldCwgTGl2ZVBlcmZvcm1hbmNlIH0gZnJvbSBcIi4vcmVhbHRpbWVcIjtcblxuLy8gU2hhZGVyIGluY2x1ZGVzIG1hcHBpbmdcbmNvbnN0IHNoYWRlckluY2x1ZGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBiaW5kaW5nczogYmluZGluZ3NDb2RlLFxuICB0ZXh0dXJlczogdGV4dHVyZXNDb2RlLFxuICBidWZmZXJzOiBidWZmZXJzQ29kZSxcbiAgcmFuZG9tOiByYW5kb21Db2RlLFxuICBhY3RvbXlvc2luOiBhY3RvbXlvc2luQ29kZSxcbiAgZW5jbG9zdXJlOiBlbmNsb3N1cmVDb2RlLFxufTtcblxuLy8gU2l6ZXMgaW4gYnl0ZXMgLSB1c2VmdWwgZm9yIGNhbGN1bGF0aW5nIGJ1ZmZlciBzaXplcyBhbmQgb2Zmc2V0c1xuY29uc3Qgc2l6ZTMyID0gNDsgLy8gc2l6ZSBvZiBhIDMyLWJpdCBmbG9hdCBvciBpbnRcblxuLy8gVW5pZm9ybSB2YWx1ZXMgY29udGFpbmVyXG5jb25zdCB1bmlmb3JtcyA9IHtcbiAgY29tcHV0ZVN0ZXBzUGVyRnJhbWU6IDQsXG4gIHRhcmdldEZQUzogNjAsXG4gIHNpbXVsYXRpb25TY2FsZTogMS4wLCAvLyB0ZXh0dXJlIHBpeGVscyBwZXIgc2NyZWVuIChDU1MpIHBpeGVsOyB0aGUgY2VsbCBzY2FsZXMgd2l0aCBpdCBpbiBwaXhlbHMsIHNvIGl0IGxvb2tzIHRoZSBzYW1lIHNpemUgb24gc2NyZWVuXG4gIGFjdGluQ291bnQ6IDEgKiAyNTYgKiAyNTYsIC8vIDQwMDAgaXMgbWluaW11bSBmb3IgbmljZSBhY3Rpb24uXG4gIG1lbWJyYW5lQ291bnQ6IDYgKiAyNTYsXG4gIHN0aWZmbmVzczogMC41LFxuICBmb29kTmVhcmJ5VGhyZXNob2xkOiAwLjAwMSxcbiAgZGlzY29ubmVjdGlvblByb2JhYmlsaXR5OiAwLjAwNixcbiAgbW9ub21lck1lbWJyYW5lUmVwdWxzaW9uOiAwLjA5LCAvLyBob3cgaGFyZCBtb25vbWVycyBhcmUgcHVzaGVkIG9mZiB0aGUgbWVtYnJhbmU6IDEuMCBsZWF2ZXMgYSB+OCBweCBnYXAsIDAuMSBhYm91dCA0IHB4XG4gIHBvbHltZXJSZXB1bHNpb246IDAuNDIyLFxuICBzdGVyaWNTYW1wbGluZ1JhbmdlOiAyLFxuICBhY3RpbkNvaGVzaW9uUmFuZ2U6IDEsXG4gIGJpbmRQcm9iOiAwLjAzLFxuICBiaW5kTGVuZ3RoRmxvb3I6IDIsIC8vIGZpbGFtZW50cyBzaG9ydGVyIHRoYW4gdGhpcyBiaW5kIGF0IGJpbmRQcm9iICogdGhpcyAoYSBsb25lIG1vbm9tZXIgYXQgYmluZFByb2IpOyBsb25nZXIgb25lcyBhdCBiaW5kUHJvYiAqIGxlbmd0aFxuICBiaW5kTGVuZ3RoU2F0dXJhdGlvbjogMjAsIC8vIGZpbGFtZW50cyBsb25nZXIgdGhhbiB0aGlzIGJpbmQgbm8gbW9yZSByZWFkaWx5IChtYXggNjQpXG4gIGFjdGluU3RlcmljRm9yY2U6IDAuMixcbiAgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U6IDIuMCwgLy8gYWN0aW4gcmVzdCBsZW5ndGggaW4gcGl4ZWxzOyBzZXRzIGZpbGFtZW50IHNwYWNpbmcgbm93IHRoYXQgYSBmaWxhbWVudCBkb2Vzbid0IHJlcGVsIGl0c2VsZlxuICBtb3ZlbWVudE1vZGU6IDAsIC8vIElkbGU6IHBvbHltZXJpemF0aW9uIG9ubHkgY29tZXMgZnJvbSB0aGUgc3Byb3V0IHNpdGVzXG4gIG1lbWJyYW5lUmVzdExlbmd0aDogMi4wIC8gMy4wLCAvLyB3aXRoIDZ4IHRoZSBvcmlnaW5hbCAyNTYgbm9kZXMgYXQgcmVzdCBsZW5ndGggMiB0aGUgY2VsbCBpcyAyeCB3aWRlciBpbiBwaXhlbHMsIG1hdGNoaW5nIHNpbXVsYXRpb25TY2FsZVxuICBtZW1icmFuZVN0aWZmbmVzczogMy4wLCAvLyBob3cgaGFyZCBhIHN0cmV0Y2hlZCBtZW1icmFuZSBwdWxscyBpbiwgYWxvbmcgaXRzIGN1cnZhdHVyZVxuICBsYW1lbGxpcG9kaXVtU3RyZW5ndGg6IDAuMTUsIC8vIHBvbHltZXJpemF0aW9uIGZpZWxkIGVtaXR0ZWQgYnkgdGhlIGZyb250IG9mIHRoZSBtZW1icmFuZSwgd2hlcmUgZmlsYW1lbnRzIGFsc28gYnJhbmNoOyAwID0gb2ZmXG4gIGxhbWVsbGlwb2RpdW1XaWR0aDogMC4wMzYsIC8vIGZyYWN0aW9uIG9mIHRoZSBtZW1icmFuZSwgY2VudGVyZWQgb24gdGhlIGZyb250ICh0aGUgcmlnaHQgc2lkZSBhdCByZXNldCksIHRoYXQgZW1pdHMgaXRcbiAgbGFtZWxsaXBvZGl1bUZpZWxkRGVjYXk6IDAuOTgsIC8vIHBlci1zdGVwIGRlY2F5IG9mIHRoYXQgZmllbGRcbiAgYnJhbmNoUHJvYmFiaWxpdHk6IDAuMDEsIC8vIHBlciBzdGVwLCBmb3IgYSBtb25vbWVyIG5leHQgdG8gYSBmaWxhbWVudCBpbiB0aGUgbGFtZWxsaXBvZGl1bSBmaWVsZCBhdCBzdHJlbmd0aCAxXG4gIGRlYnJhbmNoUHJvYmFiaWxpdHk6IDAuMDAwNSwgLy8gcGVyIHN0ZXAsIGZvciBlYWNoIGJyYW5jaCB0byBjb21lIG9mZiBpdHMgbW90aGVyIGZpbGFtZW50XG4gIGFjdGluQmVuZFN0aWZmbmVzczogNC4wLCAvLyBob3cgZmFzdCBhbiBhY3RpbidzIGRpcmVjdG9yIHR1cm5zIHRvd2FyZCBpdHMgbmVpZ2hib3VycycgKENvc3NlcmF0IGJlbmRpbmcpOyAwID0gZmxvcHB5XG4gIGFjdGluQ29zc2VyYXRJdGVyYXRpb25zOiA4LCAvLyBDb3NzZXJhdCBwYXNzZXMgcGVyIHNpbXVsYXRpb24gc3RlcDsgbW9yZSA9IHN0aWZmZXIsIHN0cmFpZ2h0ZW5zIGxvbmcgZmlsYW1lbnRzIGZhc3RlclxuICBzdGVyaWNTZWxmTmVpZ2hib3JzOiA2LCAvLyBmaWxhbWVudCBuZWlnaGJvdXJzIG9uIGVhY2ggc2lkZSB0aGF0IGRvbid0IHJlcGVsIGFuIGFjdGluIChtYXggMTIpOyB0aGUgcmVzdCBsZW5ndGggc3BhY2VzIHRoZW1cbiAgbWVtYnJhbmVGbG93OiAwLjUsIC8vIGhvdyBmYXN0IG1lbWJyYW5lIHNsaWRlcyB0b3dhcmQgc3RyZXRjaGVkIHJlZ2lvbnMgKHRhbmdlbnRpYWwgc3BhY2luZyBlcXVhbGl6YXRpb24pXG4gIG1lbWJyYW5lRmxvd0l0ZXJhdGlvbnM6IDgsIC8vIHRhbmdlbnRpYWwgZmxvdyBwYXNzZXMgcGVyIHNpbXVsYXRpb24gc3RlcFxuICBtZW1icmFuZVNtb290aGluZzogMC4wMiwgLy8gcHVsbCB0b3dhcmQgdGhlIG5laWdoYm91cnMnIG1pZHBvaW50IHBlciBzdGVwOyByZWxheGVzIGlkbGUgcHJvdHJ1c2lvbnMgYW5kIGN1c3BzXG4gIHBvbHltZXJpemF0aW9uUGF0Y2hTaXplOiAwLjAyLCAvLyBmcmFjdGlvbiBvZiB0aGUgbWVtYnJhbmUgdGhhdCBwb2x5bWVyaXplcyBpbiBNb3ZlIEVhc3QgbW9kZVxuICBwb2x5bWVyaXphdGlvbkZpZWxkRGVjYXk6IDAuOTUsIC8vIHBlci1zdGVwIGRlY2F5IG9mIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZDsgbG93ZXIgPSBtb3JlIGxvY2FsID0gdGhpbm5lciBwcm90cnVzaW9uc1xuICBzcHJvdXRDb3VudDogNiwgLy8gbWF4IG51bWJlciBvZiBzaG9ydC1saXZlZCBwb2x5bWVyaXphdGlvbiBzaXRlcyBhdCBvbmNlXG4gIHNwcm91dFdpZHRoOiAxLCAvLyBtZW1icmFuZSBub2RlcyBjb3ZlcmVkIGJ5IG9uZSBzaXRlXG4gIHNwcm91dEZyb250QmlhczogMC43NSwgLy8gZnJhY3Rpb24gb2Ygc2l0ZXMgcGxhY2VkIG5lYXIgdGhlIGZyb250LCB0aGUgcmVzdCBhbnl3aGVyZSBpbiB0aGUgZnJvbnQgMzAlXG4gIHNwcm91dE9uU3RlcHM6IDYwMDAsIC8vIGF2ZXJhZ2Ugc2ltdWxhdGlvbiBzdGVwcyBhIHNpdGUgc3RheXMgb25cbiAgc3Byb3V0T2ZmU3RlcHM6IDE1MDAsIC8vIGF2ZXJhZ2Ugc2ltdWxhdGlvbiBzdGVwcyBhIHNpdGUgc3RheXMgb2ZmXG4gIG15b3NpblN0cmVuZ3RoOiAwLCAvLyBvcHQtaW4gdW50aWwgbWF0Y2hlZCBjb21wYXJpc29ucyBlc3RhYmxpc2ggYSBiZW5lZml0XG4gIG15b3NpblNwZWVkOiAwLjAyLFxuICBtZW1icmFuZUNvdXBsaW5nOiAwLFxuICBzdWJzdHJhdGVEcmFnOiA0LFxuICBjb3J0ZXhQb2x5bWVyaXphdGlvbjogMCwgLy8gZGlzdGluY3Qgb3B0aW9uYWwgaHlwb3RoZXNpczogYSBwb3N0ZXJpb3IgYWN0aW4gc3Vic3RyYXRlXG4gIG1vbm9tZXJPcGFjaXR5OiAwLjIsIC8vIHZpc3VhbCBvbmx5OiBrZWVwIHRoZSBleHBsaWNpdCBmaWxhbWVudHMgbGVnaWJsZVxuICBnQWN0aW5GaWVsZDogMSwgLy8gZmluaXRlIHdlbGwtbWl4ZWQgcG9vbCBwbHVzIGV4cGxpY2l0LWZpbGFtZW50IGNvbnRhaW5tZW50XG4gIGFyZWFDb25zZXJ2YXRpb246IDEsIC8vIGltcG9zZWQgYXJlYSwgYSAyLUQgdm9sdW1lIHN1cnJvZ2F0ZSwgbm90IG1lYXN1cmVkIHByZXNzdXJlXG4gIGFkYXB0aXZlRnJhbWVzOiAxLFxuICBjdWVYOiAwLFxuICBjdWVZOiAwLFxuICBjdWVFbmFibGVkOiAwLFxuICBwb2xhcml0eU1vZGU6IDAsXG4gIHBvbGFyaXR5VHVyblJhdGU6IDAuMDIsXG4gIHJlYXJUdXJub3ZlcjogMCxcbiAgdHVybm92ZXJBZ2U6IDUwMCxcbiAgdGV0aGVyVHVybm92ZXI6IDAsXG4gIHRldGhlck9uUmF0ZTogMC4wMixcbiAgdGV0aGVyT2ZmUmF0ZTogMC4wMDIsXG4gIHRldGhlclJlY292ZXJ5U3RlcHM6IDQwLFxuICBtb3RvclJlYXJCaWFzOiAwLFxuICBmcm9udEFsaWdubWVudDogMCxcbiAgdGV0aGVyTG9hZE9mZjogMC4wMDIsXG4gIGNvbG91ckFnZTogMCxcbn07XG5cbi8vIG51bWVyaWMgdW5pZm9ybXMgY2FuIGJlIG92ZXJyaWRkZW4gZnJvbSB0aGUgVVJMLCBlLmcuID9iaW5kUHJvYj0wLjA1JmVxdWlsaWJyaXVtTGluZURpc3RhbmNlPTI7ID9ydW49bmFtZSBsYWJlbHMgdGhlIHRlbGVtZXRyeVxuY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbmNvbnN0IHNob3djYXNlID0gdXJsUGFyYW1zLnNpemUgPT09IDAgfHwgdXJsUGFyYW1zLmdldChcImRlbW9cIikgPT09IFwiMVwiO1xuaWYgKHNob3djYXNlKVxuICBPYmplY3QuYXNzaWduKHVuaWZvcm1zLCB7XG4gICAgbWVtYnJhbmVSZXN0TGVuZ3RoOiAxIC8gMyxcbiAgICBteW9zaW5TdHJlbmd0aDogMC4wNSxcbiAgICBtZW1icmFuZUNvdXBsaW5nOiAwLjA1LFxuICAgIGdBY3RpbkZpZWxkOiAxLFxuICAgIGFyZWFDb25zZXJ2YXRpb246IDEsXG4gICAgcG9sYXJpdHlNb2RlOiAxLFxuICAgIHJlYXJUdXJub3ZlcjogMC4wMSxcbiAgICB0ZXRoZXJUdXJub3ZlcjogMSxcbiAgICBtb3RvclJlYXJCaWFzOiAxLFxuICAgIGZyb250QWxpZ25tZW50OiAwLjgsXG4gICAgY29sb3VyQWdlOiAxLFxuICB9KTtcbmNvbnN0IHNlZWQgPSBOdW1iZXIodXJsUGFyYW1zLmdldChcInNlZWRcIikgPz8gNDIpID4+PiAwO1xuY29uc3QgaW5pdGlhbFJhbmRvbSA9IHNlZWRlZFJhbmRvbShzZWVkKTtcbmZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHVybFBhcmFtcykge1xuICBpZiAoa2V5IGluIHVuaWZvcm1zICYmIE51bWJlci5pc0Zpbml0ZShOdW1iZXIodmFsdWUpKSkge1xuICAgICh1bmlmb3JtcyBhcyBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KVtrZXldID0gTnVtYmVyKHZhbHVlKTtcbiAgfVxufVxuZm9yIChjb25zdCBbbmFtZSwgbWF4aW11bV0gb2YgT2JqZWN0LmVudHJpZXMoe1xuICBteW9zaW5TdHJlbmd0aDogMC4yLFxuICBteW9zaW5TcGVlZDogMC4xLFxuICBtZW1icmFuZUNvdXBsaW5nOiAwLjIsXG4gIHN1YnN0cmF0ZURyYWc6IDIwLFxuICBjb3J0ZXhQb2x5bWVyaXphdGlvbjogMC4xLFxuICBtb25vbWVyT3BhY2l0eTogMSxcbiAgZ0FjdGluRmllbGQ6IDEsXG4gIGFyZWFDb25zZXJ2YXRpb246IDEsXG4gIHBvbGFyaXR5TW9kZTogMSxcbiAgcG9sYXJpdHlUdXJuUmF0ZTogMC4yLFxuICByZWFyVHVybm92ZXI6IDAuMixcbiAgdGV0aGVyVHVybm92ZXI6IDEsXG4gIHRldGhlck9uUmF0ZTogMSxcbiAgdGV0aGVyT2ZmUmF0ZTogMC4yLFxuICBtb3RvclJlYXJCaWFzOiAxLFxuICBmcm9udEFsaWdubWVudDogMSxcbiAgdGV0aGVyTG9hZE9mZjogMC4xLFxuICBjb2xvdXJBZ2U6IDEsXG59KSkge1xuICBjb25zdCB2YWx1ZXMgPSB1bmlmb3JtcyBhcyBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICB2YWx1ZXNbbmFtZV0gPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhpbXVtLCB2YWx1ZXNbbmFtZV0pKTtcbn1cblxuY29uc3QgREVCVUdNT0RFID0gZmFsc2U7XG5jb25zdCBkZWJ1Z1NpemUgPSAyMDA7XG5jb25zdCBXT1JLR1JPVVBfU0laRSA9IDI1NjtcblxuYXN5bmMgZnVuY3Rpb24gaW5kZXgoKSB7XG4gIGNvbnN0IGlzTW9iaWxlRGV2aWNlID0gL0FuZHJvaWR8aVBob25lfGlQYWR8aVBvZHxPcGVyYSBNaW5pfElFTW9iaWxlfFdQRGVza3RvcC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc01vYmlsZURldmljZSkge1xuICAgIHVuaWZvcm1zLmNvbXB1dGVTdGVwc1BlckZyYW1lID0gMTtcbiAgfVxuXG4gIC8vIHNldHVwIGFuZCBjb25maWd1cmUgV2ViR1BVXG4gIGNvbnN0IGRldmljZSA9IGF3YWl0IHJlcXVlc3REZXZpY2UoKTtcbiAgLy8gR2V0IHRoZSBleGlzdGluZyBjYW52YXMgZnJvbSB0aGUgRE9NIGluc3RlYWQgb2YgY3JlYXRpbmcgYSBuZXcgb25lXG4gIGNvbnN0IGNhbnZhcyA9IGNvbmZpZ3VyZUNhbnZhcyhkZXZpY2UsIFwibWFpbi1jYW52YXNcIiwge1xuICAgIHdpZHRoOiBNYXRoLnJvdW5kKE1hdGgubWF4KHNob3djYXNlID8gMTI4MCA6IDAsIHdpbmRvdy5pbm5lcldpZHRoKSAqIHVuaWZvcm1zLnNpbXVsYXRpb25TY2FsZSksXG4gICAgaGVpZ2h0OiBNYXRoLnJvdW5kKE1hdGgubWF4KHNob3djYXNlID8gOTYwIDogMCwgd2luZG93LmlubmVySGVpZ2h0KSAqIHVuaWZvcm1zLnNpbXVsYXRpb25TY2FsZSksXG4gIH0pO1xuXG4gIGxldCB0aW1lID0gMDtcbiAgbGV0IHBhdXNlZCA9IHVybFBhcmFtcy5oYXMoXCJwYXVzZWRcIik7XG4gIGxldCBtYW51YWxBZHZhbmNlUGVuZGluZyA9IGZhbHNlO1xuICBsZXQgY29udHJvbHNEaXJ0eSA9IGZhbHNlO1xuICBsZXQgY3VlVmVyc2lvbiA9IDA7XG4gIGNvbnN0IGZyYW1lQnVkZ2V0ID0gbmV3IEZyYW1lQnVkZ2V0KCk7XG4gIGNvbnN0IGxpdmVQZXJmb3JtYW5jZSA9IG5ldyBMaXZlUGVyZm9ybWFuY2UoKTtcbiAgY29uc3QgcnVudGltZUVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgZnVuY3Rpb24gc2V0UGF1c2VkKHZhbHVlOiBib29sZWFuKSB7XG4gICAgcGF1c2VkID0gdmFsdWU7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXVzZS1kZW1vXCIpIS50ZXh0Q29udGVudCA9IHBhdXNlZCA/IFwiUmVzdW1lXCIgOiBcIlBhdXNlXCI7XG4gICAgaWYgKCF2YWx1ZSkgbGl2ZVBlcmZvcm1hbmNlLmNsZWFyRnJhbWVzKCk7XG4gIH1cbiAgZnVuY3Rpb24gc3RvcFNpbXVsYXRpb24oZXJyb3I6IHVua25vd24pIHtcbiAgICBjb25zdCB0ZXh0ID0gZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiBTdHJpbmcoZXJyb3IpO1xuICAgIGlmICghcnVudGltZUVycm9ycy5pbmNsdWRlcyh0ZXh0KSkgcnVudGltZUVycm9ycy5wdXNoKHRleHQpO1xuICAgIHNldFBhdXNlZCh0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IGBTdG9wcGVkOiAke3RleHR9YDtcbiAgICBjb25zdCBub3RpY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbW8tbm90aWNlXCIpITtcbiAgICBub3RpY2UuaGlkZGVuID0gZmFsc2U7XG4gICAgbm90aWNlLnRleHRDb250ZW50ID0gYFNpbXVsYXRpb24gcGF1c2VkOiAke3RleHR9YDtcbiAgfVxuICBjb25zdCBncHVFcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIGRldmljZS5hZGRFdmVudExpc3RlbmVyKFwidW5jYXB0dXJlZGVycm9yXCIsIChldmVudCkgPT4ge1xuICAgIGdwdUVycm9ycy5wdXNoKGV2ZW50LmVycm9yLm1lc3NhZ2UpO1xuICAgIHN0b3BTaW11bGF0aW9uKGBHUFUgZXJyb3I6ICR7ZXZlbnQuZXJyb3IubWVzc2FnZX1gKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IGBHUFUgZXJyb3I6ICR7ZXZlbnQuZXJyb3IubWVzc2FnZX1gO1xuICB9KTtcbiAgZGV2aWNlLmxvc3QudGhlbigoaW5mbykgPT4gZ3B1RXJyb3JzLnB1c2goYERldmljZSBsb3N0OiAke2luZm8ubWVzc2FnZX1gKSk7XG5cbiAgY29uc3QgR1JPVVBfSU5ERVggPSAwO1xuICBjb25zdCBCSU5ESU5HU19CVUZGRVIgPSB7IENBTlZBUzogMCwgQ09OVFJPTFM6IDEsIElOVEVSQUNUSU9OUzogMiB9O1xuICBjb25zdCBCSU5ESU5HU19URVhUVVJFID0ge1xuICAgIElOREVYOiAzLFxuICAgIFNURVJJQ19QT1RFTlRJQUw6IDQsXG4gICAgUEFSQU1FVEVSX0ZJRUxEUzogNSxcbiAgfTtcblxuICBjb25zdCBCSU5ESU5HU19BR0VOVFMgPSB7XG4gICAgUkFORE9NOiA2LFxuICAgIE1FTUJSQU5FOiA3LFxuICAgIEFDVElOOiA4LFxuICAgIENPTk5FQ1RJT05fTE9DS1M6IDksXG4gICAgVEVMRU1FVFJZOiAxMixcbiAgICBNRUNIQU5JQ0FMX1NOQVBTSE9UOiAxMyxcbiAgICBNRUNIQU5JQ0FMX0xJTktTOiAxNCxcbiAgICBNRUNIQU5JQ0FMX0ZPUkNFUzogMTUsXG4gIH07XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNldCB1cCBtZW1vcnkgcmVzb3VyY2VzXG4gIHZhciBhY3R1YWxXaWR0aCA9IGNhbnZhcy5zaXplLndpZHRoO1xuICB2YXIgYWN0dWFsSGVpZ2h0ID0gY2FudmFzLnNpemUuaGVpZ2h0O1xuICBpZiAoREVCVUdNT0RFKSB7XG4gICAgYWN0dWFsV2lkdGggPSBkZWJ1Z1NpemU7XG4gICAgYWN0dWFsSGVpZ2h0ID0gZGVidWdTaXplO1xuICB9XG5cbiAgY29uc3QgdGV4dHVyZXMgPSBzZXR1cFRleHR1cmVzKFxuICAgIGRldmljZSxcbiAgICBPYmplY3QudmFsdWVzKEJJTkRJTkdTX1RFWFRVUkUpLFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGRlcHRoT3JBcnJheUxheWVyczoge1xuICAgICAgICBbQklORElOR1NfVEVYVFVSRS5TVEVSSUNfUE9URU5USUFMXTogMyxcbiAgICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuUEFSQU1FVEVSX0ZJRUxEU106IDYsXG4gICAgICAgIFtCSU5ESU5HU19URVhUVVJFLklOREVYXTogNCxcbiAgICAgIH0sXG4gICAgICB3aWR0aDogYWN0dWFsV2lkdGgsXG4gICAgICBoZWlnaHQ6IGFjdHVhbEhlaWdodCxcbiAgICB9LFxuICAgIHtcbiAgICAgIFtCSU5ESU5HU19URVhUVVJFLlNURVJJQ19QT1RFTlRJQUxdOiBcInIzMmZsb2F0XCIsXG4gICAgICBbQklORElOR1NfVEVYVFVSRS5QQVJBTUVURVJfRklFTERTXTogXCJyMzJmbG9hdFwiLFxuICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuSU5ERVhdOiBcInIzMnVpbnRcIixcbiAgICB9XG4gICk7XG5cbiAgY29uc3QgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQ6IFtudW1iZXIsIG51bWJlcl0gPSBbXG4gICAgTWF0aC5jZWlsKHRleHR1cmVzLnNpemUud2lkdGggLyBNYXRoLnNxcnQoV09SS0dST1VQX1NJWkUpKSxcbiAgICBNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS5oZWlnaHQgLyBNYXRoLnNxcnQoV09SS0dST1VQX1NJWkUpKSxcbiAgXTtcblxuICBjb25zdCBCVUZGRVJfV09SS0dST1VQX0NPVU5UID0ge1xuICAgIEFDVElOOiBNYXRoLmNlaWwodW5pZm9ybXMuYWN0aW5Db3VudCAvIFdPUktHUk9VUF9TSVpFKSxcbiAgICBNRU1CUkFORTogTWF0aC5jZWlsKHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgLyBXT1JLR1JPVVBfU0laRSksXG4gIH07XG4gIGNvbnN0IE1BWF9CVUZGRVJfV09SS0dST1VQX0NPVU5UID0gTWF0aC5tYXgoLi4uT2JqZWN0LnZhbHVlcyhCVUZGRVJfV09SS0dST1VQX0NPVU5UKSk7XG5cbiAgLy8gc2V0dXAgaW50ZXJhY3Rpb25zXG4gIGNvbnN0IGludGVyYWN0aW9ucyA9IHNldHVwSW50ZXJhY3Rpb25zKGRldmljZSwgY2FudmFzLmNvbnRleHQuY2FudmFzLCB0ZXh0dXJlcy5zaXplKTtcbiAgY29uc3QgY2FudmFzX2J1ZmZlcnMgPSB7XG4gICAgW0JJTkRJTkdTX0JVRkZFUi5DQU5WQVNdOiB0ZXh0dXJlcy5jYW52YXMuYnVmZmVyLFxuICAgIFtCSU5ESU5HU19CVUZGRVIuQ09OVFJPTFNdOiBpbnRlcmFjdGlvbnMuY29udHJvbHMuYnVmZmVyLFxuICAgIFtCSU5ESU5HU19CVUZGRVIuSU5URVJBQ1RJT05TXTogaW50ZXJhY3Rpb25zLmludGVyYWN0aW9ucy5idWZmZXIsXG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gdG8gd3JpdGUgdGhlIHVuaWZvcm1zIG9iamVjdCBpbnRvIHRoZSBBcnJheUJ1ZmZlciBhY2NvcmRpbmcgdG8gV0dTTCBzdHJ1Y3QgbGF5b3V0XG4gIGNvbnN0IGNvbnRyb2xzRGF0YVZpZXcgPSBuZXcgRGF0YVZpZXcoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmRhdGEpO1xuICBjb25zdCBjYW52YXNWaWV3ID0gbmV3IERhdGFWaWV3KHRleHR1cmVzLmNhbnZhcy5kYXRhLmJ1ZmZlcik7XG5cbiAgY29uc3Qgd3JpdGVVbmlmb3JtcyA9ICgpID0+IHtcbiAgICAvLyBXcml0ZSBjYW52YXMgc2l6ZVxuICAgIGNhbnZhc1ZpZXcuc2V0SW50MzIoMCwgYWN0dWFsV2lkdGgsIHRydWUpO1xuICAgIGNhbnZhc1ZpZXcuc2V0SW50MzIoNCwgYWN0dWFsSGVpZ2h0LCB0cnVlKTtcblxuICAgIC8vIENhbnZhcy5rZXkgaXMgdmVjMjx1MzI+LCBhbGlnbmVkIHRvIGJ5dGUgMTYuIFVJIGNoYW5nZXMgZG8gbm90IHJlc2VlZC5cbiAgICBjYW52YXNWaWV3LnNldFVpbnQzMigxNiwgc2VlZCwgdHJ1ZSk7XG4gICAgY2FudmFzVmlldy5zZXRVaW50MzIoMjAsIHNlZWQgXiAweDllMzc3OWI5LCB0cnVlKTtcblxuICAgIC8vIFdyaXRlIGNvbnRyb2xzIHdpdGggYWRqdXN0ZWQgb2Zmc2V0czpcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigwLCB1bmlmb3Jtcy5tZW1icmFuZUNvdW50LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMig0LCB1bmlmb3Jtcy5hY3RpbkNvdW50LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoOCwgdW5pZm9ybXMuc3RpZmZuZXNzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMTIsIHVuaWZvcm1zLmZvb2ROZWFyYnlUaHJlc2hvbGQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigxNiwgdW5pZm9ybXMuZGlzY29ubmVjdGlvblByb2JhYmlsaXR5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjAsIHVuaWZvcm1zLnBvbHltZXJSZXB1bHNpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0SW50MzIoMjQsIHVuaWZvcm1zLnN0ZXJpY1NhbXBsaW5nUmFuZ2UsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0SW50MzIoMjgsIHVuaWZvcm1zLmFjdGluQ29oZXNpb25SYW5nZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMyLCB1bmlmb3Jtcy5iaW5kUHJvYiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMzYsIHVuaWZvcm1zLmJpbmRMZW5ndGhTYXR1cmF0aW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMig0OCwgdW5pZm9ybXMuYmluZExlbmd0aEZsb29yLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNDAsIHVuaWZvcm1zLmFjdGluU3RlcmljRm9yY2UsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig0NCwgdW5pZm9ybXMuZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2UsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig1NiwgdW5pZm9ybXMubW9ub21lck1lbWJyYW5lUmVwdWxzaW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMig1MiwgdW5pZm9ybXMubW92ZW1lbnRNb2RlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNjAsIHVuaWZvcm1zLm1lbWJyYW5lU3RpZmZuZXNzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNzIsIHVuaWZvcm1zLnBvbHltZXJpemF0aW9uUGF0Y2hTaXplLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNzYsIHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIwOCwgdW5pZm9ybXMubWVtYnJhbmVTbW9vdGhpbmcsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMTYsIHVuaWZvcm1zLnBvbHltZXJpemF0aW9uRmllbGREZWNheSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIyMCwgdW5pZm9ybXMubWVtYnJhbmVGbG93LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjI0LCB1bmlmb3Jtcy5sYW1lbGxpcG9kaXVtU3RyZW5ndGgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMjgsIHVuaWZvcm1zLmxhbWVsbGlwb2RpdW1XaWR0aCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIzMiwgdW5pZm9ybXMubGFtZWxsaXBvZGl1bUZpZWxkRGVjYXksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMzYsIHVuaWZvcm1zLmJyYW5jaFByb2JhYmlsaXR5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjQwLCB1bmlmb3Jtcy5kZWJyYW5jaFByb2JhYmlsaXR5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjQ0LCB1bmlmb3Jtcy5hY3RpbkJlbmRTdGlmZm5lc3MsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDI0OCwgdW5pZm9ybXMuc3RlcmljU2VsZk5laWdoYm9ycywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI1MiwgdW5pZm9ybXMubXlvc2luU3RyZW5ndGgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNTYsIHVuaWZvcm1zLm15b3NpblNwZWVkLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjYwLCB1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjY0LCB1bmlmb3Jtcy5zdWJzdHJhdGVEcmFnLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjY4LCB1bmlmb3Jtcy5jb3J0ZXhQb2x5bWVyaXphdGlvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDY0LCB1bmlmb3Jtcy5tb25vbWVyT3BhY2l0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNjgsIHVuaWZvcm1zLmdBY3RpbkZpZWxkID8gMSA6IDAsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMTIsIHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNzIsIHVuaWZvcm1zLmN1ZVgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNzYsIHVuaWZvcm1zLmN1ZVksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDI4MCwgdW5pZm9ybXMuY3VlRW5hYmxlZCA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyODQsIGN1ZVZlcnNpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDI4OCwgdW5pZm9ybXMucG9sYXJpdHlNb2RlID8gMSA6IDAsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyOTIsIHVuaWZvcm1zLnBvbGFyaXR5VHVyblJhdGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyOTYsIHVuaWZvcm1zLnJlYXJUdXJub3ZlciwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMwMCwgTWF0aC5tYXgoMSwgdW5pZm9ybXMudHVybm92ZXJBZ2UpLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzMDQsIHVuaWZvcm1zLnRldGhlclR1cm5vdmVyID8gMSA6IDAsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMDgsIHVuaWZvcm1zLnRldGhlck9uUmF0ZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMxMiwgdW5pZm9ybXMudGV0aGVyT2ZmUmF0ZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMzE2LCBNYXRoLm1heCgwLCB1bmlmb3Jtcy50ZXRoZXJSZWNvdmVyeVN0ZXBzKSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMyMCwgdW5pZm9ybXMubW90b3JSZWFyQmlhcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMyNCwgdW5pZm9ybXMuZnJvbnRBbGlnbm1lbnQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMjgsIHVuaWZvcm1zLnRldGhlckxvYWRPZmYsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDMzMiwgdW5pZm9ybXMuY29sb3VyQWdlID8gMSA6IDAsIHRydWUpO1xuXG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGludGVyYWN0aW9ucy5jb250cm9scy5idWZmZXIsIDAsIGludGVyYWN0aW9ucy5jb250cm9scy5kYXRhKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIodGV4dHVyZXMuY2FudmFzLmJ1ZmZlciwgMCwgdGV4dHVyZXMuY2FudmFzLmRhdGEpO1xuICB9O1xuXG4gIHdyaXRlVW5pZm9ybXMoKTtcblxuICAvLyBzZXR1cCBhZ2VudHNcbiAgY29uc3QgcmFuZG9tQnVmZmVyU2l6ZSA9IE1hdGgubWF4KHRleHR1cmVzLnNpemUud2lkdGggKiB0ZXh0dXJlcy5zaXplLmhlaWdodCwgdW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKyAyNTYpO1xuXG4gIC8vIGluaXRpYWxpemUgcmFuZG9tIGJ1ZmZlclxuICBjb25zdCByYW5kb21EYXRhID0gZ2V0UmFuZG9tVmFsdWVzKHJhbmRvbUJ1ZmZlclNpemUsIGluaXRpYWxSYW5kb20pO1xuXG4gIGNvbnN0IG51bUZsb2F0cyA9IDEwOyAvLyBTZWdtZW50IHN0cnVjdCBzaXplIGluIDMyLWJpdCB3b3Jkc1xuXG4gIGNvbnN0IGFnZW50X2J1ZmZlcnMgPSB7XG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX1NOQVBTSE9UXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiAzMiAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIDIpLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IDMyICogKDI1NiArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQpLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9GT1JDRVNdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIC8vIFByZWZpeDogcGh5c2ljYWwgZm9yY2UgYWNjdW11bGF0b3JzLiBUYWlsOiBjb25zZXJ2YXRpdmUgbWVtYnJhbmUtZWRnZVxuICAgICAgLy8gcm93IHNob3J0bGlzdHM7IGV4YWN0IHRlc3RzIGZhbGwgYmFjayB0byBhbGwgZWRnZXMgb24gb3ZlcmZsb3cuXG4gICAgICBzaXplOiA4ICogKHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICsgTWF0aC5jZWlsKGFjdHVhbEhlaWdodCAvIDQpICogMjU3KSxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5SQU5ET01dOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxhYmVsOiBcIlJhbmRvbSBCdWZmZXJcIixcbiAgICAgIHNpemU6IHJhbmRvbURhdGEuYnl0ZUxlbmd0aCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogc2l6ZTMyICogbnVtRmxvYXRzICogdW5pZm9ybXMuYWN0aW5Db3VudCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiBzaXplMzIgKiBudW1GbG9hdHMgKiB1bmlmb3Jtcy5tZW1icmFuZUNvdW50LFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuQ09OTkVDVElPTl9MT0NLU106IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgbGFiZWw6IFwiQWN0aW4gQ29ubmVjdGlvbiBMb2NrcyBCdWZmZXJcIixcbiAgICAgIHNpemU6IHNpemUzMiAqIHVuaWZvcm1zLmFjdGluQ291bnQsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSxcbiAgICB9KSxcbiAgfSBhcyBSZWNvcmQ8bnVtYmVyLCBHUFVCdWZmZXI+O1xuXG4gIGNvbnN0IHRlbGVtZXRyeSA9IG5ldyBBY3RpblRlbGVtZXRyeShcbiAgICBkZXZpY2UsXG4gICAgYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLFxuICAgIHVuaWZvcm1zLmFjdGluQ291bnQsXG4gICAgYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdLFxuICAgIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQsXG4gICAgdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoLFxuICAgIHVybFBhcmFtcy5nZXQoXCJydW5cIikgPz8gXCJkZWZhdWx0XCIsXG4gICAgMzAsXG4gICAgISF1bmlmb3Jtcy5nQWN0aW5GaWVsZFxuICApO1xuICB0ZWxlbWV0cnkub25TYW1wbGUgPSAocykgPT4ge1xuICAgIHJlbmRlck1vZHVsZS5zZXRDZWxsQm91bmRzKHMuY2VsbC5sZWZ0LCBzLmNlbGwucmlnaHQsIHMuY2VsbC50b3AsIHMuY2VsbC5ib3R0b20pO1xuICAgIGlmIChyZWNvdmVyeS5hY3RpdmUgfHwgcy5kaWFnbm9zdGljS2luZCA9PT0gXCJjb250YWN0LXJlY2hlY2tcIikgcmV0dXJuO1xuICAgIGlmICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCAmJiBjbGFzc2lmeUNoZWNrcG9pbnQocywgISF1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSA9PT0gXCJjb250YWN0c1wiKSB7XG4gICAgICB2b2lkIHJlY292ZXJ5LnJlcXVlc3Qocyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGludmFsaWQgPVxuICAgICAgKHVuaWZvcm1zLmdBY3RpbkZpZWxkICYmIGNsYXNzaWZ5Q2hlY2twb2ludChzLCAhIXVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pID09PSBcImZhdGFsXCIpIHx8XG4gICAgICBzLmFjdGluQmFsYW5jZUVycm9yIHx8XG4gICAgICBzLmJyb2tlbkxpbmtzIHx8XG4gICAgICBzLmN5Y2xlcyB8fFxuICAgICAgKHVuaWZvcm1zLmdBY3RpbkZpZWxkICYmIChzLmluc2lkZVBvbHltZXJCZWFkcyAhPT0gcy5pblBvbHltZXIgfHwgcy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMpKSB8fFxuICAgICAgKHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24gJiYgTWF0aC5hYnMocy5jZWxsLmFyZWEgLSAxKSA+IDAuMDAxKSB8fFxuICAgICAgIU51bWJlci5pc0Zpbml0ZShzLmNlbGwuY2VudHJvaWRYKTtcbiAgICBpZiAoaW52YWxpZClcbiAgICAgIHN0b3BTaW11bGF0aW9uKFxuICAgICAgICBgTnVtZXJpY2FsIGNoZWNrIGZhaWxlZCBhdCBzdGVwICR7cy5zdGVwfTogJHtKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgbWFzczogcy5hY3RpbkJhbGFuY2VFcnJvcixcbiAgICAgICAgICBpbnNpZGVGOiBzLmluc2lkZVBvbHltZXJCZWFkcyxcbiAgICAgICAgICB0b3RhbEY6IHMuaW5Qb2x5bWVyLFxuICAgICAgICAgIGNyb3NzaW5nczogcy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMsXG4gICAgICAgICAgYnJva2VuTGlua3M6IHMuYnJva2VuTGlua3MsXG4gICAgICAgICAgY3ljbGVzOiBzLmN5Y2xlcyxcbiAgICAgICAgICBhcmVhOiBzLmNlbGwuYXJlYSxcbiAgICAgICAgICBjZW50cm9pZFg6IHMuY2VsbC5jZW50cm9pZFgsXG4gICAgICAgIH0pfTsgcmVzZXQgdG8gcmVwbGF5LmBcbiAgICAgICk7XG4gIH07XG4gIGxldCBjb250YWN0QmFja3VwOiBBcnJheUJ1ZmZlciB8IG51bGwgPSBudWxsO1xuICBhc3luYyBmdW5jdGlvbiByZWFkQWN0aW4oKSB7XG4gICAgY29uc3Qgc291cmNlID0gYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dO1xuICAgIGNvbnN0IHN0YWdlID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IHNvdXJjZS5zaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoc291cmNlLCAwLCBzdGFnZSwgMCwgc291cmNlLnNpemUpO1xuICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgYXdhaXQgc3RhZ2UubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICAgIHJldHVybiBzdGFnZS5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzdGFnZS5kZXN0cm95KCk7XG4gICAgfVxuICB9XG4gIGNvbnN0IHJlY292ZXJ5ID0gbmV3IENvbnRhY3RSZWNvdmVyeSh7XG4gICAgaW5zcGVjdDogYXN5bmMgKCkgPT4ge1xuICAgICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICAgIGF3YWl0IHRlbGVtZXRyeS51cGRhdGUodGltZSwgZnJhbWVOciwgdW5pZm9ybXMuZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2UsIHRydWUsIHRydWUpO1xuICAgICAgaWYgKGdwdUVycm9ycy5sZW5ndGgpIHRocm93IEVycm9yKGdwdUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgIHJldHVybiB0ZWxlbWV0cnkuaGlzdG9yeS5hdCgtMSkhO1xuICAgIH0sXG4gICAgYmVnaW46IGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnRhY3RCYWNrdXAgPSBhd2FpdCByZWFkQWN0aW4oKTtcbiAgICB9LFxuICAgIHJlcGFpcjogYXN5bmMgKGl0ZXJhdGlvbnMpID0+IHtcbiAgICAgIHJ1bkNvbnRhY3RSZXBhaXIoZGV2aWNlLCBzaW1QaXBlbGluZXMsIGJpbmRHcm91cFNpbXVsYXRlLCBCVUZGRVJfV09SS0dST1VQX0NPVU5ULCBjYW52YXMuY2FudmFzLmhlaWdodCwgaXRlcmF0aW9ucyk7XG4gICAgICBjb25zdCBjdXJyZW50ID0gYXdhaXQgcmVhZEFjdGluKCksXG4gICAgICAgIGJlZm9yZSA9IG5ldyBGbG9hdDMyQXJyYXkoY29udGFjdEJhY2t1cCEpLFxuICAgICAgICBhZnRlciA9IG5ldyBGbG9hdDMyQXJyYXkoY3VycmVudCk7XG4gICAgICBjb25zdCBidSA9IG5ldyBVaW50MzJBcnJheShjb250YWN0QmFja3VwISksXG4gICAgICAgIGF1ID0gbmV3IFVpbnQzMkFycmF5KGN1cnJlbnQpO1xuICAgICAgbGV0IG1heGltdW0gPSAwO1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhZnRlci5sZW5ndGg7IGkgKz0gMTApIHtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCAxMDsgaisrKSBpZiAoaiAhPT0gMiAmJiBqICE9PSAzICYmIGJ1W2kgKyBqXSAhPT0gYXVbaSArIGpdKSB0aHJvdyBFcnJvcihcIkNvbnRhY3QgcmVwYWlyIGNoYW5nZWQgYWN0aW4gbWV0YWRhdGFcIik7XG4gICAgICAgIGNvbnN0IGRpc3BsYWNlbWVudCA9IE1hdGguaHlwb3QoYWZ0ZXJbaSArIDJdIC0gYmVmb3JlW2kgKyAyXSwgYWZ0ZXJbaSArIDNdIC0gYmVmb3JlW2kgKyAzXSk7XG4gICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKGRpc3BsYWNlbWVudCkpIHRocm93IEVycm9yKFwiTm9uLWZpbml0ZSBjb250YWN0IGNvcnJlY3Rpb25cIik7XG4gICAgICAgIG1heGltdW0gPSBNYXRoLm1heChtYXhpbXVtLCBkaXNwbGFjZW1lbnQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1heGltdW07XG4gICAgfSxcbiAgICByb2xsYmFjazogYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKGNvbnRhY3RCYWNrdXApIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sIDAsIGNvbnRhY3RCYWNrdXApO1xuICAgICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICB9LFxuICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgIGNvbnRhY3RCYWNrdXAgPSBudWxsO1xuICAgIH0sXG4gICAgZml4ZWRBcmVhOiAoKSA9PiAhIXVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24sXG4gICAgbWF4RGlzcGxhY2VtZW50OiAoKSA9PiA4LFxuICAgIG5vdzogKCkgPT4gcGVyZm9ybWFuY2Uubm93KCksXG4gICAgbm90aWNlOiAobWVzc2FnZSkgPT4ge1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuICAgIH0sXG4gICAgZmFpbDogc3RvcFNpbXVsYXRpb24sXG4gIH0pO1xuICBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5URUxFTUVUUlldID0gdGVsZW1ldHJ5LmNvdW50ZXJCdWZmZXI7XG5cbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLlJBTkRPTV0sIC8qb2Zmc2V0PSovIDAsIC8qZGF0YT0qLyByYW5kb21EYXRhKTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gT3ZlcmFsbCBtZW1vcnkgbGF5b3V0XG4gIGNvbnN0IHZpc2liaWxpdHkgPSBHUFVTaGFkZXJTdGFnZS5DT01QVVRFIHwgR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQ7XG5cbiAgLy8gVGhpcyBsYXlvdXQgaXMgZm9yIHNoYXJlZCByZXNvdXJjZXMgYmV0d2VlbiBzaW11bGF0aW9uIGFuZCByZW5kZXJpbmdcbiAgY29uc3Qgc2hhcmVkTGF5b3V0RW50cmllcyA9IFtcbiAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX0JVRkZFUikubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgYmluZGluZzogYmluZGluZyxcbiAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCxcbiAgICAgIGJ1ZmZlcjogeyB0eXBlOiBcInVuaWZvcm1cIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZSB9LFxuICAgIH0pKSxcbiAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX1RFWFRVUkUpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgIGJpbmRpbmc6IGJpbmRpbmcsXG4gICAgICB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFIHwgR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsXG4gICAgICBzdG9yYWdlVGV4dHVyZTogdGV4dHVyZXMuYmluZGluZ0xheW91dFtiaW5kaW5nXSxcbiAgICB9KSksXG4gIF07XG5cbiAgY29uc3Qgc2hhcmVkQmluZEdyb3VwRW50cmllcyA9IFtcbiAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX1RFWFRVUkUpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgIGJpbmRpbmcsXG4gICAgICByZXNvdXJjZTogdGV4dHVyZXMudGV4dHVyZXNbYmluZGluZ10uY3JlYXRlVmlldygpLFxuICAgIH0pKSxcbiAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX0JVRkZFUikubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgYmluZGluZyxcbiAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogY2FudmFzX2J1ZmZlcnNbYmluZGluZ10gfSxcbiAgICB9KSksXG4gIF07XG5cbiAgY29uc3QgYmluZEdyb3VwTGF5b3V0U2ltdWxhdGUgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICBsYWJlbDogXCJiaW5kR3JvdXBMYXlvdXRTaW11bGF0ZVwiLFxuICAgIGVudHJpZXM6IFtcbiAgICAgIC4uLnNoYXJlZExheW91dEVudHJpZXMsXG4gICAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX0FHRU5UUykubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgICB2aXNpYmlsaXR5OiB2aXNpYmlsaXR5LFxuICAgICAgICBidWZmZXI6IHsgdHlwZTogXCJzdG9yYWdlXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGUgfSxcbiAgICAgIH0pKSxcbiAgICBdLFxuICB9KTtcblxuICBjb25zdCBiaW5kR3JvdXBTaW11bGF0ZSA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgIGxhYmVsOiBgQmluZCBHcm91cGAsXG4gICAgbGF5b3V0OiBiaW5kR3JvdXBMYXlvdXRTaW11bGF0ZSxcbiAgICBlbnRyaWVzOiBbXG4gICAgICAuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLFxuICAgICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19BR0VOVFMpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgICAgYmluZGluZyxcbiAgICAgICAgcmVzb3VyY2U6IHsgYnVmZmVyOiBhZ2VudF9idWZmZXJzW2JpbmRpbmddIH0sXG4gICAgICB9KSksXG4gICAgXSxcbiAgfSk7XG5cbiAgY29uc3QgcGlwZWxpbmVMYXlvdXRTaW11bGF0ZSA9IGRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XG4gICAgbGFiZWw6IFwicGlwZWxpbmVMYXlvdXRcIixcbiAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0U2ltdWxhdGVdLFxuICB9KTtcblxuICBmdW5jdGlvbiBsaW5lQ29uc3RyYWludEZ1bmN0aW9uKHBhc3M6IEdQVUNvbXB1dGVQYXNzRW5jb2Rlcikge1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm9yaWVudGF0aW9uVXBkYXRlKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhNQVhfQlVGRkVSX1dPUktHUk9VUF9DT1VOVCk7XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuY29zc2VyYXRVcGRhdGUpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pZm9ybXMuYWN0aW5Db3NzZXJhdEl0ZXJhdGlvbnM7IGkrKykge1xuICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG4gICAgfVxuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmxpbmVDb25zdHJhaW50KTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhNQVhfQlVGRkVSX1dPUktHUk9VUF9DT1VOVCk7XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubWVtYnJhbmVUYW5nZW50aWFsRmxvdyk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmlmb3Jtcy5tZW1icmFuZUZsb3dJdGVyYXRpb25zOyBpKyspIHtcbiAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTZXQgdXAgY29kZSBpbnN0cnVjdGlvbnNcbiAgY29uc3QgbW9kdWxlID0gYXdhaXQgY3JlYXRlU2hhZGVyKGRldmljZSwgc2ltdWxhdGVDb2RlLCBzaGFkZXJJbmNsdWRlcyk7XG5cbiAgY29uc3Qgc2ltUGlwZWxpbmVzID0gY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcyhkZXZpY2UsIG1vZHVsZSwgcGlwZWxpbmVMYXlvdXRTaW11bGF0ZSk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFJVTiB0aGUgcmVzZXQgc2hhZGVyIGZ1bmN0aW9uXG4gIGNvbnN0IHJlc2V0ID0gKCkgPT4ge1xuICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU10sIDAsIG5ldyBVaW50MzJBcnJheSg4ICogKDI1NiArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQpKSk7XG5cbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgY29uc3QgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuXG4gICAgcGFzcy5zZXRCaW5kR3JvdXAoR1JPVVBfSU5ERVgsIGJpbmRHcm91cFNpbXVsYXRlKTtcblxuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnJlc2V0QWN0aW4pO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4pO1xuXG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMucmVzZXRNZW1icmFuZSk7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG5cbiAgICBwYXNzLmVuZCgpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBpZiAodW5pZm9ybXMuZ0FjdGluRmllbGQgfHwgdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbikgcnVuRW5jbG9zdXJlKGRldmljZSwgc2ltUGlwZWxpbmVzLCBiaW5kR3JvdXBTaW11bGF0ZSwgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCwgYWN0dWFsSGVpZ2h0KTtcbiAgICB0ZWxlbWV0cnkucmVzZXQoKTtcbiAgfTtcbiAgcmVzZXQoKTtcblxuICBjb25zdCByZW5kZXJTaGFkZXIgPSBhd2FpdCBjcmVhdGVTaGFkZXIoZGV2aWNlLCByZW5kZXJDb2RlLCBzaGFkZXJJbmNsdWRlcyk7XG4gIGNvbnN0IHJlbmRlck1vZHVsZSA9IG5ldyBSZW5kZXJNb2R1bGUoXG4gICAgZGV2aWNlLFxuICAgIGNhbnZhcy5mb3JtYXQsXG4gICAgeyB3aWR0aDogYWN0dWFsV2lkdGgsIGhlaWdodDogYWN0dWFsSGVpZ2h0IH0sXG4gICAgcmVuZGVyU2hhZGVyLFxuICAgIHRleHR1cmVzLFxuICAgIHNoYXJlZExheW91dEVudHJpZXMsXG4gICAgc2hhcmVkQmluZEdyb3VwRW50cmllcyxcbiAgICB7IGJ1ZmZlcjogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9TTkFQU0hPVF0sIG9mZnNldDogMzIgKiAodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQpLCBzaXplOiAzMiB9XG4gICk7XG4gIGZvciAoY29uc3QgW2tleSwgcGFyYW1ldGVyLCBsb3csIGhpZ2hdIG9mIFtcbiAgICBbXCJtb2RlXCIsIFwibWljcm9zY29wZVwiLCAwLCAxXSxcbiAgICBbXCJ6b29tXCIsIFwidmlld1pvb21cIiwgMSwgNl0sXG4gICAgW1wiZm9jdXNcIiwgXCJmb2N1c1wiLCAtMSwgMV0sXG4gICAgW1wiY29udHJhc3RcIiwgXCJvcHRpY2FsQ29udHJhc3RcIiwgMC4yLCAyLjVdLFxuICBdIGFzIGNvbnN0KSB7XG4gICAgaWYgKHVybFBhcmFtcy5oYXMocGFyYW1ldGVyKSkge1xuICAgICAgY29uc3QgdmFsdWUgPSBOdW1iZXIodXJsUGFyYW1zLmdldChwYXJhbWV0ZXIpKTtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSByZW5kZXJNb2R1bGUudmlld1trZXldID0gTWF0aC5tYXgobG93LCBNYXRoLm1pbihoaWdoLCB2YWx1ZSkpO1xuICAgIH1cbiAgfVxuICByZW5kZXJNb2R1bGUudmlldy5tb2RlID0gcmVuZGVyTW9kdWxlLnZpZXcubW9kZSA/IDEgOiAwO1xuICByZW5kZXJNb2R1bGUudmlldy5hdXRvRml0ID0gIXVybFBhcmFtcy5oYXMoXCJ2aWV3Wm9vbVwiKTtcbiAgY29uc3QgaW5pdGlhbFJhZGl1cyA9ICh1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICogdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAvICgyICogTWF0aC5QSSk7XG4gIHJlbmRlck1vZHVsZS5zZXRDZWxsQm91bmRzKFxuICAgIGFjdHVhbFdpZHRoIC8gMiAtIGluaXRpYWxSYWRpdXMsXG4gICAgYWN0dWFsV2lkdGggLyAyICsgaW5pdGlhbFJhZGl1cyxcbiAgICBhY3R1YWxIZWlnaHQgLyAyIC0gaW5pdGlhbFJhZGl1cyxcbiAgICBhY3R1YWxIZWlnaHQgLyAyICsgaW5pdGlhbFJhZGl1c1xuICApO1xuICByZW5kZXJNb2R1bGUuZml0SW1tZWRpYXRlbHkoKTtcblxuICAvLyBTaG93IHRoZSBpbml0aWFsIHNvbHVibGUgY29tcGFydG1lbnQgZXZlbiB3aGVuIG9wZW5lZCBwYXVzZWQuIFRoaXMgd3JpdGVzXG4gIC8vIG9ubHkgdGhlIHZpc3VhbGl6YXRpb24gbWFzaywgbm90IHJlYWN0aW9uL3N0ZXJpYyBmaWVsZHMgb3IgcGh5c2ljYWwgc3RhdGUuXG4gIGlmICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCkge1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmRyYXdSZXNlcnZvaXIpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzLmVuZCgpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICByZW5kZXJNb2R1bGUucmVuZGVyKGNhbnZhcy5jb250ZXh0KTtcbiAgfVxuXG4gIHZhciBmcmFtZU5yID0gMDtcbiAgY29uc3Qgc3Byb3V0cyA9IG5ldyBTcHJvdXRTY2hlZHVsZXIodW5pZm9ybXMuc3Byb3V0T25TdGVwcyArIHVuaWZvcm1zLnNwcm91dE9mZlN0ZXBzLCBzZWVkZWRSYW5kb20oc2VlZCBeIDB4YTM0MTMxNmMpKTtcbiAgY29uc3Qgc3Byb3V0U2l0ZXMgPSBuZXcgRmxvYXQzMkFycmF5KGludGVyYWN0aW9ucy5jb250cm9scy5kYXRhLCA4MCwgNCAqIE1BWF9TUFJPVVRfU0lURVMpO1xuXG4gIC8vIFJVTiB0aGUgc2ltIGNvbXB1dGUgZnVuY3Rpb24gYW5kIHJlbmRlciBwaXhlbHNcbiAgYXN5bmMgZnVuY3Rpb24gdGltZXN0ZXAoc3RlcENvdW50ID0gdW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWUpIHtcbiAgICBpZiAocmVjb3ZlcnkuYWN0aXZlKSByZXR1cm47XG4gICAgdGltZSsrO1xuICAgIGlmIChjb250cm9sc0RpcnR5KSB7XG4gICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICBjb250cm9sc0RpcnR5ID0gZmFsc2U7XG4gICAgfVxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmJ1ZmZlciwgMCwgaW50ZXJhY3Rpb25zLmludGVyYWN0aW9ucy5kYXRhKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RlcENvdW50OyBpKyspIHtcbiAgICAgIHNwcm91dHMudXBkYXRlKGZyYW1lTnIsIHVuaWZvcm1zLCBzcHJvdXRTaXRlcyk7XG4gICAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlciwgODAsIHNwcm91dFNpdGVzKTtcbiAgICAgIHJ1blNpbXVsYXRpb25TdGVwKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHNpbVBpcGVsaW5lcyxcbiAgICAgICAgYmluZEdyb3VwU2ltdWxhdGUsXG4gICAgICAgIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsXG4gICAgICAgIFRFWFRVUkVfV09SS0dST1VQX0NPVU5ULFxuICAgICAgICBsaW5lQ29uc3RyYWludEZ1bmN0aW9uLFxuICAgICAgICBmcmFtZU5yLFxuICAgICAgICBpID09PSBzdGVwQ291bnQgLSAxLFxuICAgICAgICAhISh1bmlmb3Jtcy5nQWN0aW5GaWVsZCB8fCB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSxcbiAgICAgICAgISF1bmlmb3Jtcy5wb2xhcml0eU1vZGVcbiAgICAgICk7XG4gICAgICBmcmFtZU5yKys7XG4gICAgfVxuXG4gICAgcmVuZGVyTW9kdWxlLnJlbmRlcihjYW52YXMuY29udGV4dCk7XG4gICAgaWYgKHVuaWZvcm1zLmN1ZUVuYWJsZWQpIGRpc3BsYXlDdWUoKTtcbiAgICB0ZWxlbWV0cnkuc25hcHNob3QodGltZSwgY2FudmFzLmNhbnZhcyk7XG4gICAgaWYgKCFwYXVzZWQpIHRlbGVtZXRyeS51cGRhdGUodGltZSwgZnJhbWVOciwgdW5pZm9ybXMuZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2UpLmNhdGNoKHN0b3BTaW11bGF0aW9uKTtcbiAgICBpZiAodGltZSAlIDMwID09PSAwKVxuICAgICAgbWVjaGFuaWNhbFN1bW1hcnkoKVxuICAgICAgICAudGhlbigoeyBtb3RvcnMsIHRldGhlcnMgfSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIik7XG4gICAgICAgICAgaWYgKHN0YXR1cylcbiAgICAgICAgICAgIHN0YXR1cy50ZXh0Q29udGVudCA9IGBTZWVkICR7c2VlZH0gwrcgJHttb3RvcnN9IG1vdG9yIGxpbmtzIMK3ICR7dGV0aGVyc30gdGV0aGVycyDCtyBjb3J0ZXggJHt1bmlmb3Jtcy5jb3J0ZXhQb2x5bWVyaXphdGlvbiA+IDAgPyBcIm9uXCIgOiBcIm9mZlwifWA7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChzdG9wU2ltdWxhdGlvbik7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBtZWNoYW5pY2FsU3VtbWFyeSgpIHtcbiAgICBjb25zdCBidWZmZXIgPSBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXTtcbiAgICBjb25zdCBzdGFnaW5nID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IGJ1ZmZlci5zaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCAwLCBzdGFnaW5nLCAwLCBidWZmZXIuc2l6ZSk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGF3YWl0IHN0YWdpbmcubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCB3b3JkcyA9IG5ldyBVaW50MzJBcnJheShzdGFnaW5nLmdldE1hcHBlZFJhbmdlKCkpO1xuICAgIGxldCBtb3RvcnMgPSAwLFxuICAgICAgdGV0aGVycyA9IDAsXG4gICAgICBwb3N0ZXJpb3JUZXRoZXJzID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdvcmRzLmxlbmd0aCAvIDg7IGkrKykge1xuICAgICAgaWYgKHdvcmRzW2kgKiA4XSkge1xuICAgICAgICBpZiAoaSA8IDI1NikgbW90b3JzKys7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHRldGhlcnMrKztcbiAgICAgICAgICBjb25zdCBhcmMgPSAoaSAtIDI1NikgLyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50O1xuICAgICAgICAgIGlmIChhcmMgPiAwLjI1ICYmIGFyYyA8IDAuNzUpIHBvc3RlcmlvclRldGhlcnMrKztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBzdGFnaW5nLnVubWFwKCk7XG4gICAgc3RhZ2luZy5kZXN0cm95KCk7XG4gICAgcmV0dXJuIHsgbW90b3JzLCB0ZXRoZXJzLCBwb3N0ZXJpb3JUZXRoZXJzIH07XG4gIH1cblxuICBjb25zdCBjdWVNYXJrZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImN1ZS1tYXJrZXJcIikhO1xuICBmdW5jdGlvbiBkaXNwbGF5Q3VlKCkge1xuICAgIGN1ZU1hcmtlci5oaWRkZW4gPSAhdW5pZm9ybXMuY3VlRW5hYmxlZDtcbiAgICBjb25zdCByZWN0ID0gY2FudmFzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBwb2ludCA9IHJlbmRlck1vZHVsZS53b3JsZFRvU2NyZWVuKHVuaWZvcm1zLmN1ZVgsIHVuaWZvcm1zLmN1ZVkpO1xuICAgIGN1ZU1hcmtlci5zdHlsZS5sZWZ0ID0gYCR7cmVjdC5sZWZ0ICsgKHBvaW50LnggLyBhY3R1YWxXaWR0aCkgKiByZWN0LndpZHRofXB4YDtcbiAgICBjdWVNYXJrZXIuc3R5bGUudG9wID0gYCR7cmVjdC50b3AgKyAocG9pbnQueSAvIGFjdHVhbEhlaWdodCkgKiByZWN0LmhlaWdodH1weGA7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjdWUtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IHVuaWZvcm1zLnBvbGFyaXR5TW9kZVxuICAgICAgPyBcIlBlcnNpc3RlbnQgaGVhZGluZyDCtyBkcmFnIHRvIHNldCBhIG5ldyBkaXJlY3Rpb24gwrcgRXNjIGZhY2VzIHJpZ2h0XCJcbiAgICAgIDogdW5pZm9ybXMuY3VlRW5hYmxlZFxuICAgICAgICA/IFwiUG9sYXJpdHkgY3VlIGFjdGl2ZSDCtyBkcmFnIHRvIG1vdmUgwrcgRXNjIHRvIGNsZWFyXCJcbiAgICAgICAgOiBcIkNsaWNrIG9yIGRyYWcgdGhlIGNhbnZhcyB0byBtb3ZlIHRoZSBhY3RpdmUgZWRnZVwiO1xuICB9XG4gIGZ1bmN0aW9uIHNldEN1ZSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHgpIHx8ICFOdW1iZXIuaXNGaW5pdGUoeSkpIHRocm93IG5ldyBFcnJvcihcIkN1ZSBjb29yZGluYXRlcyBtdXN0IGJlIGZpbml0ZVwiKTtcbiAgICB1bmlmb3Jtcy5jdWVYID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oYWN0dWFsV2lkdGgsIHgpKTtcbiAgICB1bmlmb3Jtcy5jdWVZID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oYWN0dWFsSGVpZ2h0LCB5KSk7XG4gICAgdW5pZm9ybXMuY3VlRW5hYmxlZCA9IDE7XG4gICAgY3VlVmVyc2lvbisrO1xuICAgIGNvbnRyb2xzRGlydHkgPSB0cnVlO1xuICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICAgIGRpc3BsYXlDdWUoKTtcbiAgfVxuICBmdW5jdGlvbiBjbGVhckN1ZSgpIHtcbiAgICB1bmlmb3Jtcy5jdWVFbmFibGVkID0gMDtcbiAgICBjdWVWZXJzaW9uKys7XG4gICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gICAgZGlzcGxheUN1ZSgpO1xuICB9XG4gIGFzeW5jIGZ1bmN0aW9uIGN1ZVN0YXRlKCkge1xuICAgIGNvbnN0IHN0YWdpbmcgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogMzIsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX1NOQVBTSE9UXSwgMzIgKiAodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKyAxKSwgc3RhZ2luZywgMCwgMzIpO1xuICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgYXdhaXQgc3RhZ2luZy5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgICAgY29uc3QgZGF0YSA9IHN0YWdpbmcuZ2V0TWFwcGVkUmFuZ2UoKSxcbiAgICAgICAgdSA9IG5ldyBVaW50MzJBcnJheShkYXRhKSxcbiAgICAgICAgZiA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG4gICAgICByZXR1cm4geyBpbmRleDogdVs0XSwgdmVyc2lvbjogdVs1XSwgeDogZlswXSwgeTogZlsxXSwgYXhpc1g6IGZbMl0sIGF4aXNZOiBmWzNdLCBlbmFibGVkOiAhIXVuaWZvcm1zLmN1ZUVuYWJsZWQsIHN0ZXA6IGZyYW1lTnIgfTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHN0YWdpbmcubWFwU3RhdGUgPT09IFwibWFwcGVkXCIpIHN0YWdpbmcudW5tYXAoKTtcbiAgICAgIHN0YWdpbmcuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuICBjYW52YXMuY2FudmFzLnN0eWxlLnRvdWNoQWN0aW9uID0gXCJub25lXCI7XG4gIGxldCBkcmFnZ2luZyA9IGZhbHNlO1xuICBjb25zdCBwb2ludEN1ZSA9IChlOiBQb2ludGVyRXZlbnQpID0+IHtcbiAgICBjb25zdCByZWN0ID0gY2FudmFzLmNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBjb25zdCBwb2ludCA9IHJlbmRlck1vZHVsZS5zY3JlZW5Ub1dvcmxkKCgoZS5jbGllbnRYIC0gcmVjdC5sZWZ0KSAvIHJlY3Qud2lkdGgpICogYWN0dWFsV2lkdGgsICgoZS5jbGllbnRZIC0gcmVjdC50b3ApIC8gcmVjdC5oZWlnaHQpICogYWN0dWFsSGVpZ2h0KTtcbiAgICBzZXRDdWUocG9pbnQueCwgcG9pbnQueSk7XG4gIH07XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIChlKSA9PiB7XG4gICAgaWYgKGUuYnV0dG9uICE9PSAwKSByZXR1cm47XG4gICAgZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGNhbnZhcy5jYW52YXMuc2V0UG9pbnRlckNhcHR1cmUoZS5wb2ludGVySWQpO1xuICAgIHBvaW50Q3VlKGUpO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgKGUpID0+IHtcbiAgICBpZiAoZHJhZ2dpbmcpIHBvaW50Q3VlKGUpO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIsICgpID0+IHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmNhbmNlbFwiLCAoKSA9PiB7XG4gICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSk7XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImxvc3Rwb2ludGVyY2FwdHVyZVwiLCAoKSA9PiB7XG4gICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsICgpID0+IHtcbiAgICByZW5kZXJNb2R1bGUuZml0SW1tZWRpYXRlbHkoKTtcbiAgICB1cGRhdGVWaWV3KCk7XG4gIH0pO1xuICBkaXNwbGF5Q3VlKCk7XG5cbiAgZnVuY3Rpb24gdXBkYXRlVmlldygpIHtcbiAgICBkb2N1bWVudC5ib2R5LmRhdGFzZXQudmlldyA9IHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPyBcIm1pY3Jvc2NvcGVcIiA6IFwiZGlhZ25vc3RpY1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVtby10aXRsZVwiKSEudGV4dENvbnRlbnQgPSByZW5kZXJNb2R1bGUudmlldy5tb2RlID8gXCJDZWxsIMK3IHRyYW5zbWl0dGVkIGxpZ2h0XCIgOiBcIkV4cGxpY2l0IGZpbGFtZW50cyDCtyBkaWFnbm9zdGljc1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlldy16b29tLXZhbHVlXCIpIS50ZXh0Q29udGVudCA9IGAke3JlbmRlck1vZHVsZS52aWV3Lnpvb20udG9GaXhlZCgxKX3Dl2A7XG4gICAgcmVuZGVyTW9kdWxlLnJlbmRlcihjYW52YXMuY29udGV4dCk7XG4gICAgZGlzcGxheUN1ZSgpO1xuICB9XG4gIGNvbnN0IHZpZXdTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZXctbW9kZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgdmlld1NlbGVjdC52YWx1ZSA9IFN0cmluZyhyZW5kZXJNb2R1bGUudmlldy5tb2RlKTtcbiAgdmlld1NlbGVjdC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICByZW5kZXJNb2R1bGUudmlldy5tb2RlID0gTnVtYmVyKHZpZXdTZWxlY3QudmFsdWUpO1xuICAgIHVwZGF0ZVZpZXcoKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgW2lkLCBrZXldIG9mIFtcbiAgICBbXCJ2aWV3LXpvb21cIiwgXCJ6b29tXCJdLFxuICAgIFtcInZpZXctZm9jdXNcIiwgXCJmb2N1c1wiXSxcbiAgICBbXCJ2aWV3LWNvbnRyYXN0XCIsIFwiY29udHJhc3RcIl0sXG4gIF0gYXMgY29uc3QpIHtcbiAgICBjb25zdCBpbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGlucHV0LnZhbHVlID0gU3RyaW5nKHJlbmRlck1vZHVsZS52aWV3W2tleV0pO1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICByZW5kZXJNb2R1bGUudmlld1trZXldID0gTnVtYmVyKGlucHV0LnZhbHVlKTtcbiAgICAgIGlmIChrZXkgPT09IFwiem9vbVwiKSByZW5kZXJNb2R1bGUudmlldy5hdXRvRml0ID0gZmFsc2U7XG4gICAgICB1cGRhdGVWaWV3KCk7XG4gICAgfSk7XG4gIH1cbiAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9sbG93LWNlbGxcIikgYXMgSFRNTElucHV0RWxlbWVudCkuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoZSkgPT4ge1xuICAgIHJlbmRlck1vZHVsZS52aWV3LmZvbGxvdyA9IChlLnRhcmdldCBhcyBIVE1MSW5wdXRFbGVtZW50KS5jaGVja2VkO1xuICAgIHVwZGF0ZVZpZXcoKTtcbiAgfSk7XG4gIHVwZGF0ZVZpZXcoKTtcbiAgY29uc3Qgc2V0dGluZ3NQYW5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVtby1wYW5lbFwiKSE7XG4gIGNvbnN0IHNldHRpbmdzQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0b2dnbGUtc2V0dGluZ3NcIikhO1xuICBmdW5jdGlvbiBzZXRTZXR0aW5ncyhvcGVuOiBib29sZWFuKSB7XG4gICAgc2V0dGluZ3NQYW5lbC5oaWRkZW4gPSAhb3BlbjtcbiAgICBzZXR0aW5nc0J1dHRvbi5zZXRBdHRyaWJ1dGUoXCJhcmlhLWV4cGFuZGVkXCIsIFN0cmluZyhvcGVuKSk7XG4gICAgZG9jdW1lbnQuYm9keS5kYXRhc2V0LnNldHRpbmdzID0gb3BlbiA/IFwib3BlblwiIDogXCJjbG9zZWRcIjtcbiAgICBpZiAob3BlbikgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZS1zZXR0aW5nc1wiKSEuZm9jdXMoKTtcbiAgICBlbHNlIHNldHRpbmdzQnV0dG9uLmZvY3VzKCk7XG4gIH1cbiAgc2V0dGluZ3NCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldFNldHRpbmdzKHNldHRpbmdzUGFuZWwuaGlkZGVuKSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2Utc2V0dGluZ3NcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRTZXR0aW5ncyhmYWxzZSkpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZpdC1jZWxsXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHJlbmRlck1vZHVsZS52aWV3LmF1dG9GaXQgPSB0cnVlO1xuICAgIHJlbmRlck1vZHVsZS52aWV3LmZvbGxvdyA9IHRydWU7XG4gICAgcmVuZGVyTW9kdWxlLmZpdEltbWVkaWF0ZWx5KCk7XG4gICAgdXBkYXRlVmlldygpO1xuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXN0b3JlLWRlbW9cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLnBhdGhuYW1lICsgXCI/ZGVtbz0xXCI7XG4gIH0pO1xuICBzZXR0aW5nc1BhbmVsLmFwcGVuZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRpYWdub3N0aWNzXCIpISk7XG4gIHNldHRpbmdzUGFuZWwuYXBwZW5kKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSEpO1xuXG4gICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8gPSB7XG4gICAgc2VlZCxcbiAgICB1bmlmb3JtcyxcbiAgICBncHVFcnJvcnMsXG4gICAgcnVudGltZUVycm9ycyxcbiAgICBjb250YWN0UmVjb3Zlcnk6IHJlY292ZXJ5LFxuICAgIHZpZXc6IHJlbmRlck1vZHVsZS52aWV3LFxuICAgIHJlZHJhdzogdXBkYXRlVmlldyxcbiAgICBzY3JlZW5Ub1dvcmxkOiAoeDogbnVtYmVyLCB5OiBudW1iZXIpID0+IHJlbmRlck1vZHVsZS5zY3JlZW5Ub1dvcmxkKHgsIHkpLFxuICAgIHNldEN1ZSxcbiAgICBjbGVhckN1ZSxcbiAgICBjdWVTdGF0ZSxcbiAgICBnZXQgcGF1c2VkKCkge1xuICAgICAgcmV0dXJuIHBhdXNlZDtcbiAgICB9LFxuICAgIGdldCBzdGVwKCkge1xuICAgICAgcmV0dXJuIGZyYW1lTnI7XG4gICAgfSxcbiAgICBwZXJmb3JtYW5jZVNuYXBzaG90OiAoKSA9PiAoeyAuLi5saXZlUGVyZm9ybWFuY2Uuc25hcHNob3QoKSwgZGlhZ25vc3RpY3M6IHsgLi4udGVsZW1ldHJ5LnRpbWluZ3MgfSB9KSxcbiAgICBwYXVzZTogKCkgPT4ge1xuICAgICAgc2V0UGF1c2VkKHRydWUpO1xuICAgIH0sXG4gICAgcGxheTogKCkgPT4ge1xuICAgICAgc2V0UGF1c2VkKGZhbHNlKTtcbiAgICB9LFxuICAgIGFzeW5jIGFkdmFuY2Uoc3RlcHM6IG51bWJlcikge1xuICAgICAgaWYgKCFwYXVzZWQgfHwgcmVjb3ZlcnkuYWN0aXZlIHx8IG1hbnVhbEFkdmFuY2VQZW5kaW5nIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHN0ZXBzKSB8fCBzdGVwcyA8IDAgfHwgc3RlcHMgPiAyMDAwKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJQYXVzZSBhbmQgcmVxdWVzdCBvbmUgYmF0Y2ggb2YgMOKAkzIwMDAgd2hvbGUgc3RlcHNcIik7XG4gICAgICBtYW51YWxBZHZhbmNlUGVuZGluZyA9IHRydWU7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgICAgICBmb3IgKGxldCByZW1haW5pbmcgPSBzdGVwczsgcmVtYWluaW5nID4gMDsgKSB7XG4gICAgICAgICAgYXdhaXQgcmVjb3Zlcnkud2FpdCgpO1xuICAgICAgICAgIGlmIChydW50aW1lRXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKHJ1bnRpbWVFcnJvcnMuam9pbihcIlxcblwiKSk7XG4gICAgICAgICAgY29uc3QgYmF0Y2ggPSBNYXRoLm1pbigyMCwgcmVtYWluaW5nKTtcbiAgICAgICAgICBhd2FpdCB0aW1lc3RlcChiYXRjaCk7XG4gICAgICAgICAgcmVtYWluaW5nIC09IGJhdGNoO1xuICAgICAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICAgICAgaWYgKGdwdUVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihncHVFcnJvcnMuam9pbihcIlxcblwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgYXdhaXQgdGVsZW1ldHJ5LnVwZGF0ZSh0aW1lLCBmcmFtZU5yLCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgdHJ1ZSk7XG4gICAgICAgIGF3YWl0IHJlY292ZXJ5LndhaXQoKTtcbiAgICAgICAgaWYgKHJ1bnRpbWVFcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IocnVudGltZUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgdXBkYXRlVmlldygpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIikhLnRleHRDb250ZW50ID0gYFBhdXNlZCDCtyBzdGVwICR7ZnJhbWVOcn1gO1xuICAgICAgICByZXR1cm4geyBzdGF0czogdGVsZW1ldHJ5Lmhpc3RvcnkuYXQoLTEpLCBsaW5rczogYXdhaXQgbWVjaGFuaWNhbFN1bW1hcnkoKSwgZ3B1RXJyb3JzIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBtYW51YWxBZHZhbmNlUGVuZGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG5cbiAgaWYgKHVybFBhcmFtcy5oYXMoXCJtZWNoYW5pY3NUZXN0XCIpKSB7XG4gICAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby50ZXN0UmVuZXdhbCA9ICgpID0+IHtcbiAgICAgIGlmICghcGF1c2VkKSB0aHJvdyBFcnJvcihcIlBhdXNlIGJlZm9yZSBkZXN0cnVjdGl2ZSByZW5ld2FsIGZpeHR1cmVzXCIpO1xuICAgICAgcmV0dXJuIHRlc3RSZW5ld2FsKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpbjogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLFxuICAgICAgICAgIG1lbWJyYW5lOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0sXG4gICAgICAgICAgbGlua3M6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdLFxuICAgICAgICAgIHNuYXBzaG90OiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX1NOQVBTSE9UXSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBhY3RpbjogdW5pZm9ybXMuYWN0aW5Db3VudCwgbWVtYnJhbmU6IHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgfSxcbiAgICAgICAgKHZhbHVlcykgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odW5pZm9ybXMsIHZhbHVlcyk7XG4gICAgICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgICB9LFxuICAgICAgICAoa2luZCwgcmVwZWF0cyA9IDEpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCksXG4gICAgICAgICAgICBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgICAgICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuICAgICAgICAgIGlmIChraW5kID09PSBcInBvbGFyaXR5XCIpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1lYXN1cmVFbmNsb3N1cmUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoMSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5yZXNvbHZlQ3VlKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJ0dXJub3ZlclwiKSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy51bmJpbmRNaW5Qb2xlKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJtb3RvclwiKSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOICsgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tb3RvckxpbmtzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKDEpO1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuYXBwbHlNZWNoYW5pY2FsRm9yY2VzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4gKyBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuYWN0aW5lc1RvVGV4dHVyZXMpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOICsgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tZW1icmFuZVRldGhlcnMpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXBlYXRzOyBpKyspIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXNzLmVuZCgpO1xuICAgICAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICAgICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8udGVzdEVuY2xvc3VyZSA9ICgpID0+IHtcbiAgICAgIGlmICghcGF1c2VkKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXVzZSBiZWZvcmUgcnVubmluZyBkZXN0cnVjdGl2ZSBlbmNsb3N1cmUgZml4dHVyZXNcIik7XG4gICAgICByZXR1cm4gdGVzdEVuY2xvc3VyZShcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICB7IGFjdGluOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sIG1lbWJyYW5lOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0gfSxcbiAgICAgICAgeyBhY3RpbjogdW5pZm9ybXMuYWN0aW5Db3VudCwgbWVtYnJhbmU6IHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgfSxcbiAgICAgICAgKCkgPT4gcnVuRW5jbG9zdXJlKGRldmljZSwgc2ltUGlwZWxpbmVzLCBiaW5kR3JvdXBTaW11bGF0ZSwgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCwgYWN0dWFsSGVpZ2h0KSxcbiAgICAgICAgKGZpeGVkQXJlYSwgYXJlYSkgPT4ge1xuICAgICAgICAgIHVuaWZvcm1zLmdBY3RpbkZpZWxkID0gMTtcbiAgICAgICAgICB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uID0gZml4ZWRBcmVhID8gMSA6IDA7XG4gICAgICAgICAgdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoID0gTWF0aC5zcXJ0KDQgKiBNYXRoLlBJICogYXJlYSkgLyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50O1xuICAgICAgICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICAgICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8udGVzdE1lY2hhbmljcyA9ICgpID0+IHtcbiAgICAgIGlmICghcGF1c2VkKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXVzZSBiZWZvcmUgcnVubmluZyBkZXN0cnVjdGl2ZSBtZWNoYW5pY2FsIGZpeHR1cmVzXCIpO1xuICAgICAgcmV0dXJuIHRlc3RNZWNoYW5pY3MoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGluOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sXG4gICAgICAgICAgbWVtYnJhbmU6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSxcbiAgICAgICAgICBsaW5rczogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU10sXG4gICAgICAgICAgZm9yY2VzOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0ZPUkNFU10sXG4gICAgICAgIH0sXG4gICAgICAgIHsgYWN0aW46IHVuaWZvcm1zLmFjdGluQ291bnQsIG1lbWJyYW5lOiB1bmlmb3Jtcy5tZW1icmFuZUNvdW50IH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICAgICAgY29uc3QgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgICAgICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cFNpbXVsYXRlKTtcbiAgICAgICAgICBjb25zdCBjb3VudCA9IE1hdGguY2VpbCgodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQpIC8gV09SS0dST1VQX1NJWkUpO1xuICAgICAgICAgIGZvciAoY29uc3QgW3BpcGVsaW5lLCBncm91cHNdIG9mIFtcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMucmVzb2x2ZUN1ZSwgMV0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzLCBjb3VudF0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLm1vdG9yTGlua3MsIDFdLFxuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5tZW1icmFuZVRldGhlcnMsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkVdLFxuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5hcHBseU1lY2hhbmljYWxGb3JjZXMsIGNvdW50XSxcbiAgICAgICAgICBdIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHBpcGVsaW5lKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKGdyb3Vwcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhc3MuZW5kKCk7XG4gICAgICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgICB9LFxuICAgICAgICAoc3RyZW5ndGgsIGNvdXBsaW5nLCBkcmFnKSA9PiB7XG4gICAgICAgICAgdW5pZm9ybXMubXlvc2luU3RyZW5ndGggPSBzdHJlbmd0aDtcbiAgICAgICAgICB1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nID0gY291cGxpbmc7XG4gICAgICAgICAgdW5pZm9ybXMuc3Vic3RyYXRlRHJhZyA9IGRyYWc7XG4gICAgICAgICAgdW5pZm9ybXMuY3VlRW5hYmxlZCA9IDA7XG4gICAgICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gIH1cblxuICBjb25zdCBwYXVzZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGF1c2UtZGVtb1wiKSE7XG4gIHBhdXNlQnV0dG9uLnRleHRDb250ZW50ID0gcGF1c2VkID8gXCJSZXN1bWVcIiA6IFwiUGF1c2VcIjtcbiAgcGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBzZXRQYXVzZWQoIXBhdXNlZCk7XG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0LWRlbW9cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBsb2NhdGlvbi5yZWxvYWQoKSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXItY3VlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xlYXJDdWUpO1xuICBjb25zdCBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGVwLWRlbW9cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIGFzeW5jIGZ1bmN0aW9uIHNpbmdsZVN0ZXAoKSB7XG4gICAgaWYgKHN0ZXBCdXR0b24uZGlzYWJsZWQpIHJldHVybjtcbiAgICBzdGVwQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzZXRQYXVzZWQodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0ICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8uYWR2YW5jZSgxKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc3RvcFNpbXVsYXRpb24oZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzdGVwQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIHN0ZXBCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNpbmdsZVN0ZXApO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIiAmJiAhc2V0dGluZ3NQYW5lbC5oaWRkZW4pIHtcbiAgICAgIHNldFNldHRpbmdzKGZhbHNlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5hbHRLZXkpIHJldHVybjtcbiAgICBpZiAoKGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCk/LmNsb3Nlc3QoXCJpbnB1dCxzZWxlY3QsdGV4dGFyZWEsYnV0dG9uLFtjb250ZW50ZWRpdGFibGU9dHJ1ZV1cIikgfHwgZXZlbnQucmVwZWF0KSByZXR1cm47XG4gICAgaWYgKGV2ZW50LmNvZGUgPT09IFwiU3BhY2VcIikge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNldFBhdXNlZCghcGF1c2VkKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleS50b0xvd2VyQ2FzZSgpID09PSBcIm5cIikge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZvaWQgc2luZ2xlU3RlcCgpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBjbGVhckN1ZSgpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5LnRvTG93ZXJDYXNlKCkgPT09IFwiclwiKSB7XG4gICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gIH0pO1xuICBmb3IgKGNvbnN0IGtleSBvZiBbXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIiwgXCJteW9zaW5TdHJlbmd0aFwiLCBcIm1lbWJyYW5lQ291cGxpbmdcIl0gYXMgY29uc3QpIHtcbiAgICBjb25zdCBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgbGl2ZS0ke2tleX1gKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IHZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHZhbHVlLSR7a2V5fWApITtcbiAgICBzbGlkZXIudmFsdWUgPSBTdHJpbmcodW5pZm9ybXNba2V5XSk7XG4gICAgdmFsdWUudGV4dENvbnRlbnQgPSB1bmlmb3Jtc1trZXldLnRvRml4ZWQoa2V5ID09PSBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiID8gMiA6IDMpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgdW5pZm9ybXNba2V5XSA9IE51bWJlcihzbGlkZXIudmFsdWUpO1xuICAgICAgdmFsdWUudGV4dENvbnRlbnQgPSB1bmlmb3Jtc1trZXldLnRvRml4ZWQoa2V5ID09PSBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiID8gMiA6IDMpO1xuICAgICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICB9KTtcbiAgfVxuICBjb25zdCBhZGFwdGl2ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRhcHRpdmUtZnJhbWVzXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGFkYXB0aXZlLmNoZWNrZWQgPSAhIXVuaWZvcm1zLmFkYXB0aXZlRnJhbWVzO1xuICBhZGFwdGl2ZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICB1bmlmb3Jtcy5hZGFwdGl2ZUZyYW1lcyA9IGFkYXB0aXZlLmNoZWNrZWQgPyAxIDogMDtcbiAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgfSk7XG4gIGNvbnN0IGNlbGxTaXplID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjZWxsLXNpemVcIikgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG4gIGNvbnN0IGNvbXBhY3RMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wYWN0LWRlbW9cIikgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gIGNvbnN0IGNvbXBhY3RVcmwgPSBuZXcgVVJMKGNvbXBhY3RMaW5rLmhyZWYpO1xuICBjb21wYWN0VXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzZWVkXCIsIFN0cmluZyhzZWVkKSk7XG4gIGNvbXBhY3RMaW5rLmhyZWYgPSBjb21wYWN0VXJsLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHJlbmV3YWxMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZW5ld2FsLWRlbW9cIikgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gIGNvbnN0IHJlbmV3YWxVcmwgPSBuZXcgVVJMKHJlbmV3YWxMaW5rLmhyZWYpO1xuICByZW5ld2FsVXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzZWVkXCIsIFN0cmluZyhzZWVkKSk7XG4gIHJlbmV3YWxMaW5rLmhyZWYgPSByZW5ld2FsVXJsLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHNlbGVjdGVkU2l6ZSA9IFN0cmluZyh1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpO1xuICBpZiAoIVsuLi5jZWxsU2l6ZS5vcHRpb25zXS5zb21lKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gc2VsZWN0ZWRTaXplKSkge1xuICAgIGNlbGxTaXplLmFkZChuZXcgT3B0aW9uKGAke01hdGgucm91bmQoMTUwICogdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoKX0lIChjdXN0b20pYCwgc2VsZWN0ZWRTaXplKSk7XG4gIH1cbiAgY2VsbFNpemUudmFsdWUgPSBzZWxlY3RlZFNpemU7XG4gIGNlbGxTaXplLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcIm1lbWJyYW5lUmVzdExlbmd0aFwiLCBjZWxsU2l6ZS52YWx1ZSk7XG4gICAgbG9jYXRpb24uaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbmFtZSBvZiBbXCJnQWN0aW5GaWVsZFwiLCBcImFyZWFDb25zZXJ2YXRpb25cIl0gYXMgY29uc3QpIHtcbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5hbWUpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY2hlY2tib3guY2hlY2tlZCA9IHVuaWZvcm1zW25hbWVdID4gMDtcbiAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KG5hbWUsIGNoZWNrYm94LmNoZWNrZWQgPyBcIjFcIiA6IFwiMFwiKTtcbiAgICAgIGxvY2F0aW9uLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgY29ydGV4VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3J0ZXgtdG9nZ2xlXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGNvcnRleFRvZ2dsZS5jaGVja2VkID0gdW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24gPiAwO1xuICBjb3J0ZXhUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiY29ydGV4UG9seW1lcml6YXRpb25cIiwgY29ydGV4VG9nZ2xlLmNoZWNrZWQgPyBcIjAuMDNcIiA6IFwiMFwiKTtcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV4dC50b1N0cmluZygpO1xuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSBgU2VlZCAke3NlZWR9IMK3IG1vdG9yICR7dW5pZm9ybXMubXlvc2luU3RyZW5ndGh9IMK3IGNvdXBsaW5nICR7dW5pZm9ybXMubWVtYnJhbmVDb3VwbGluZ31gO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2xvc3VyZS1zdGF0dXNcIikhLnRleHRDb250ZW50ID1cbiAgICBgRy1hY3RpbjogJHt1bmlmb3Jtcy5nQWN0aW5GaWVsZCA/IFwiY29uc2VydmVkLCB3ZWxsLW1peGVkIHBvb2xcIiA6IFwibGVnYWN5IHBhcnRpY2xlc1wifSDCtyBhcmVhOiAke3VuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24gPyBcImNvbnN0cmFpbmVkXCIgOiBcImZyZWVcIn1gO1xuICBmb3IgKGNvbnN0IGFuY2hvciBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxBbmNob3JFbGVtZW50PihcIltkYXRhLWNhc2VdXCIpKSB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBVUkwoYW5jaG9yLmhyZWYpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcInNlZWRcIiwgU3RyaW5nKHNlZWQpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJjb3J0ZXhQb2x5bWVyaXphdGlvblwiLCBTdHJpbmcodW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24pKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJtZW1icmFuZVJlc3RMZW5ndGhcIiwgU3RyaW5nKHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImFjdGluQ291bnRcIiwgU3RyaW5nKHVuaWZvcm1zLmFjdGluQ291bnQpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJnQWN0aW5GaWVsZFwiLCBTdHJpbmcodW5pZm9ybXMuZ0FjdGluRmllbGQpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJhcmVhQ29uc2VydmF0aW9uXCIsIFN0cmluZyh1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSk7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgW1xuICAgICAgXCJwb2xhcml0eU1vZGVcIixcbiAgICAgIFwicG9sYXJpdHlUdXJuUmF0ZVwiLFxuICAgICAgXCJyZWFyVHVybm92ZXJcIixcbiAgICAgIFwidHVybm92ZXJBZ2VcIixcbiAgICAgIFwidGV0aGVyVHVybm92ZXJcIixcbiAgICAgIFwidGV0aGVyT25SYXRlXCIsXG4gICAgICBcInRldGhlck9mZlJhdGVcIixcbiAgICAgIFwidGV0aGVyUmVjb3ZlcnlTdGVwc1wiLFxuICAgICAgXCJtb3RvclJlYXJCaWFzXCIsXG4gICAgICBcImZyb250QWxpZ25tZW50XCIsXG4gICAgICBcInRldGhlckxvYWRPZmZcIixcbiAgICAgIFwiY29sb3VyQWdlXCIsXG4gICAgXSBhcyBjb25zdClcbiAgICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChrZXksIFN0cmluZyh1bmlmb3Jtc1trZXldKSk7XG4gICAgYW5jaG9yLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gICAgY29uc3QgYWN0aXZlID1cbiAgICAgIE51bWJlcihuZXh0LnNlYXJjaFBhcmFtcy5nZXQoXCJteW9zaW5TdHJlbmd0aFwiKSA/PyAwKSA9PT0gdW5pZm9ybXMubXlvc2luU3RyZW5ndGggJiZcbiAgICAgIE51bWJlcihuZXh0LnNlYXJjaFBhcmFtcy5nZXQoXCJtZW1icmFuZUNvdXBsaW5nXCIpID8/IDApID09PSB1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nICYmXG4gICAgICBOdW1iZXIobmV4dC5zZWFyY2hQYXJhbXMuZ2V0KFwibWVtYnJhbmVTdGlmZm5lc3NcIikgPz8gMykgPT09IHVuaWZvcm1zLm1lbWJyYW5lU3RpZmZuZXNzO1xuICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWN1cnJlbnRcIiwgU3RyaW5nKGFjdGl2ZSkpO1xuICB9XG5cbiAgLy8gR1VJIGZvciBjb250cm9scyBmb3IgZGVza3RvcCBvbmx5XG4gIGlmICghaXNNb2JpbGVEZXZpY2UpIHtcbiAgICBsZXQgZ3VpID0gbmV3IEdVSSh7IGNvbnRhaW5lcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZHZhbmNlZC1jb250cm9sc1wiKSEgfSk7XG5cbiAgICBjb25zdCBtZWNoYW5pY3MgPSBndWkuYWRkRm9sZGVyKFwiQWN0b215b3NpbiBoeXBvdGhlc2lzXCIpO1xuICAgIGNvbnN0IHJlbmV3YWwgPSBndWkuYWRkRm9sZGVyKFwiUG9sYXJpdHkgYW5kIHJlbmV3YWxcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwicG9sYXJpdHlNb2RlXCIsIHsgbWF0ZXJpYWxQb2xlOiAwLCBwZXJzaXN0ZW50RGlyZWN0aW9uOiAxIH0pLm5hbWUoXCJQb2xhcml0eSBmcmFtZVwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJwb2xhcml0eVR1cm5SYXRlXCIsIDAuMDAxLCAwLjEsIDAuMDAxKS5uYW1lKFwiVHVybmluZyAvIHN0ZXBcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwicmVhclR1cm5vdmVyXCIsIDAsIDAuMSwgMC4wMDUpLm5hbWUoXCJBZ2VkIHJlYXIgY2xlYXJhbmNlXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInR1cm5vdmVyQWdlXCIsIDEwMCwgMjAwMCwgNTApLm5hbWUoXCJBY3RpbiBtYXR1cmF0aW9uIHN0ZXBzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcIm1vdG9yUmVhckJpYXNcIiwgMCwgMSwgMC4wNSkubmFtZShcIk1hdHVyZS1yZWFyIG1vdG9yIGJpYXNcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwiZnJvbnRBbGlnbm1lbnRcIiwgMCwgMSwgMC4wNSkubmFtZShcIkZyb250IGZpbGFtZW50IGFsaWdubWVudFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJjb2xvdXJBZ2VcIiwgeyBhc3NlbWJseVJlY2VuY3k6IDAsIGJlYWRBZ2U6IDEgfSkubmFtZShcIkFjdGluIGNvbG91cnNcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidGV0aGVyVHVybm92ZXJcIiwgeyBpbW1lZGlhdGVSZWJpbmRpbmc6IDAsIGZpbml0ZUJpbmRpbmc6IDEgfSkubmFtZShcIlRldGhlciBraW5ldGljc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0ZXRoZXJPblJhdGVcIiwgMC4wMDEsIDAuMSwgMC4wMDEpLm5hbWUoXCJUZXRoZXIgYmluZGluZyAvIHN0ZXBcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidGV0aGVyT2ZmUmF0ZVwiLCAwLCAwLjAyLCAwLjAwMSkubmFtZShcIlRldGhlciByZWxlYXNlIC8gc3RlcFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0ZXRoZXJSZWNvdmVyeVN0ZXBzXCIsIDAsIDMwMCwgMTApLm5hbWUoXCJUZXRoZXIgdW5ib3VuZCBkd2VsbFwiKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcIm15b3NpblN0cmVuZ3RoXCIsIDAsIDAuMiwgMC4wMDUpLm5hbWUoXCJNb3RvciBjb250cmFjdGlsaXR5XCIpLmxpc3RlbigpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwibXlvc2luU3BlZWRcIiwgMCwgMC4xLCAwLjAwNSkubmFtZShcIkxpbmsgc2hvcnRlbmluZyAvIHN0ZXBcIik7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJtZW1icmFuZUNvdXBsaW5nXCIsIDAsIDAuMiwgMC4wMDUpLm5hbWUoXCJNZW1icmFuZSB0ZXRoZXJzXCIpLmxpc3RlbigpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwic3Vic3RyYXRlRHJhZ1wiLCAwLCAyMCwgMC41KS5uYW1lKFwiRnJvbnQgY2x1dGNoIGRyYWdcIik7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJjb3J0ZXhQb2x5bWVyaXphdGlvblwiLCAwLCAwLjEsIDAuMDA1KS5uYW1lKFwiQmFzYWwgY29ydGV4IGFzc2VtYmx5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibW9ub21lck9wYWNpdHlcIiwgMCwgMSwgMC4wNSkubmFtZShcIk1vbm9tZXIgdmlzaWJpbGl0eVwiKTtcblxuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiY29tcHV0ZVN0ZXBzUGVyRnJhbWVcIikubWluKDEpLm1heCg3NSkuc3RlcCgxKS5uYW1lKFwiTWF4IHN0ZXBzIC8gZnJhbWVcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJ0YXJnZXRGUFNcIikubWluKDEpLm1heCgxMjApLnN0ZXAoMSkubmFtZShcIlRhcmdldCBGUFNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzdGlmZm5lc3NcIikubWluKDAuMCkubWF4KDIuMCkubmFtZShcIlN0aWZmbmVzc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImZvb2ROZWFyYnlUaHJlc2hvbGRcIikubWluKDAuMDAwMDAwMSkubWF4KDEuMCkubmFtZShcIkZvb2QgTmVhcmJ5IFRocmVzaG9sZFwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eVwiKS5taW4oMCkubWF4KDAuOTk5KS5uYW1lKFwiRGlzY29ubmVjdGlvbiBwcm9iYWJpbGl0eVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInN0ZXJpY1NhbXBsaW5nUmFuZ2VcIikubWluKDEpLm1heCg1MCkuc3RlcCgxKS5uYW1lKFwiU3RlcmljIFNhbXBsaW5nIFJhbmdlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5Db2hlc2lvblJhbmdlXCIpLm1pbigxKS5tYXgoMTAwKS5zdGVwKDEpLm5hbWUoXCJBY3RpbiBDb2hlc2lvbiBSYW5nZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJpbmRQcm9iXCIpLm1pbigwLjApLm1heCgwLjEpLnN0ZXAoMC4wMDAxKS5uYW1lKFwiQmluZCBQcm9iYWJpbGl0eVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImFjdGluU3RlcmljRm9yY2VcIikubWluKDAuMCkubWF4KDEuMCkubmFtZShcIkFjdGluIFN0ZXJpYyBGb3JjZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImFjdGluQmVuZFN0aWZmbmVzc1wiKS5taW4oMC4wKS5tYXgoNC4wKS5uYW1lKFwiQWN0aW4gQmVuZCBTdGlmZm5lc3NcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpbkNvc3NlcmF0SXRlcmF0aW9uc1wiKS5taW4oMCkubWF4KDE2KS5zdGVwKDEpLm5hbWUoXCJBY3RpbiBDb3NzZXJhdCBJdGVyYXRpb25zXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3RlcmljU2VsZk5laWdoYm9yc1wiKS5taW4oMCkubWF4KDEyKS5zdGVwKDEpLm5hbWUoXCJTdGVyaWMgU2VsZiBOZWlnaGJvcnNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJlcXVpbGlicml1bUxpbmVEaXN0YW5jZVwiKS5taW4oMC4wMSkubWF4KDYuMCkubmFtZShcIkVxdWlsaWJyaXVtIExpbmUgRGlzdGFuY2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJwb2x5bWVyUmVwdWxzaW9uXCIpLm1pbigwLjApLm1heCgxLjApLm5hbWUoXCJQb2x5bWVyIFJlcHVsc2lvblwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1vbm9tZXJNZW1icmFuZVJlcHVsc2lvblwiKS5taW4oMC4wKS5tYXgoMi4wKS5uYW1lKFwiTW9ub21lci1NZW1icmFuZSBSZXB1bHNpb25cIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJiaW5kTGVuZ3RoRmxvb3JcIikubWluKDEpLm1heCg2NCkuc3RlcCgxKS5uYW1lKFwiQmluZCBMZW5ndGggRmxvb3JcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJiaW5kTGVuZ3RoU2F0dXJhdGlvblwiKS5taW4oMSkubWF4KDY0KS5zdGVwKDEpLm5hbWUoXCJCaW5kIExlbmd0aCBTYXR1cmF0aW9uXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibW92ZW1lbnRNb2RlXCIpLm9wdGlvbnMoeyBJZGxlOiAwLCBcIk1vdmUgRWFzdFwiOiAxIH0pLm5hbWUoXCJNb3ZlbWVudCBNb2RlXCIpO1xuICAgIC8vIHRoZSBvdGhlciBtZW1icmFuZSBzZXR0aW5ncyBhcmUgdHVuZWQgYW5kIHJhcmVseSB0b3VjaGVkOyB0aGV5IGNhbiBzdGlsbCBiZSBzZXQgZnJvbSB0aGUgVVJMLCBlLmcuID9tZW1icmFuZUZsb3c9MC4zXG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtZW1icmFuZVN0aWZmbmVzc1wiKS5taW4oMC4wKS5tYXgoMTAwLjApLm5hbWUoXCJNZW1icmFuZSBTdGlmZm5lc3NcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtZW1icmFuZVNtb290aGluZ1wiKS5taW4oMC4wKS5tYXgoMC41KS5uYW1lKFwiTWVtYnJhbmUgU21vb3RoaW5nXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwicG9seW1lcml6YXRpb25QYXRjaFNpemVcIikubWluKDAuMCkubWF4KDAuMikubmFtZShcIlBvbHltZXJpemF0aW9uIFBhdGNoIFNpemVcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJwb2x5bWVyaXphdGlvbkZpZWxkRGVjYXlcIikubWluKDAuOCkubWF4KDAuOTk5KS5zdGVwKDAuMDAxKS5uYW1lKFwiUG9seW1lcml6YXRpb24gRmllbGQgRGVjYXlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIikubWluKDAuMCkubWF4KDIuMCkubmFtZShcIkxhbWVsbGlwb2RpdW0gU3RyZW5ndGhcIikubGlzdGVuKCk7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJsYW1lbGxpcG9kaXVtV2lkdGhcIikubWluKDAuMCkubWF4KDAuNSkubmFtZShcIkxhbWVsbGlwb2RpdW0gV2lkdGhcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJsYW1lbGxpcG9kaXVtRmllbGREZWNheVwiKS5taW4oMC44KS5tYXgoMC45OTkpLnN0ZXAoMC4wMDEpLm5hbWUoXCJMYW1lbGxpcG9kaXVtIEZpZWxkIERlY2F5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYnJhbmNoUHJvYmFiaWxpdHlcIikubWluKDAuMCkubWF4KDAuMikuc3RlcCgwLjAwMSkubmFtZShcIkJyYW5jaCBQcm9iYWJpbGl0eVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImRlYnJhbmNoUHJvYmFiaWxpdHlcIikubWluKDAuMCkubWF4KDAuMDEpLnN0ZXAoMC4wMDAxKS5uYW1lKFwiRGVicmFuY2ggUHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRDb3VudFwiKS5taW4oMCkubWF4KE1BWF9TUFJPVVRfU0lURVMpLnN0ZXAoMSkubmFtZShcIlNwcm91dCBTaXRlc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dFdpZHRoXCIpLm1pbigxKS5tYXgoMTYpLnN0ZXAoMSkubmFtZShcIlNwcm91dCBXaWR0aCAobm9kZXMpXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0RnJvbnRCaWFzXCIpLm1pbigwLjApLm1heCgxLjApLm5hbWUoXCJTcHJvdXQgRnJvbnQgQmlhc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dE9uU3RlcHNcIikubWluKDEwMCkubWF4KDIwMDAwKS5zdGVwKDEwMCkubmFtZShcIlNwcm91dCBPbiBTdGVwc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dE9mZlN0ZXBzXCIpLm1pbigxMDApLm1heCgyMDAwMCkuc3RlcCgxMDApLm5hbWUoXCJTcHJvdXQgT2ZmIFN0ZXBzXCIpO1xuICAgIGd1aS5hZGQoeyBleGVjdXRlRnVuY3Rpb246ICgpID0+IGxvY2F0aW9uLnJlbG9hZCgpIH0sIFwiZXhlY3V0ZUZ1bmN0aW9uXCIpLm5hbWUoXCJSZXNldCBzZWVkIGFuZCBmaWVsZHNcIik7XG4gICAgZ3VpXG4gICAgICAuYWRkKFxuICAgICAgICB7XG4gICAgICAgICAgcGF1c2U6ICgpID0+IHtcbiAgICAgICAgICAgIHNldFBhdXNlZCghcGF1c2VkKTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBcInBhdXNlXCJcbiAgICAgIClcbiAgICAgIC5uYW1lKFwiUGF1c2UgLyByZXN1bWVcIik7XG4gICAgZ3VpLm9uQ2hhbmdlKCgpID0+IHtcbiAgICAgIGNvbnRyb2xzRGlydHkgPSB0cnVlO1xuICAgICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gICAgICBkaXNwbGF5Q3VlKCk7XG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBbXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIiwgXCJteW9zaW5TdHJlbmd0aFwiLCBcIm1lbWJyYW5lQ291cGxpbmdcIl0gYXMgY29uc3QpIHtcbiAgICAgICAgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBsaXZlLSR7a2V5fWApIGFzIEhUTUxJbnB1dEVsZW1lbnQpLnZhbHVlID0gU3RyaW5nKHVuaWZvcm1zW2tleV0pO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgdmFsdWUtJHtrZXl9YCkhLnRleHRDb250ZW50ID0gdW5pZm9ybXNba2V5XS50b0ZpeGVkKGtleSA9PT0gXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIiA/IDIgOiAzKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBndWkuY2xvc2UoKTtcbiAgfVxuXG4gIGxldCBsYXN0RnJhbWVUaW1lID0gMDtcbiAgc2V0UGF1c2VkKHBhdXNlZCk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVtby1ub3RpY2VcIikhLmhpZGRlbiA9IHRydWU7XG4gIGxldCBmcmFtZVBlbmRpbmcgPSBmYWxzZTtcbiAgY29uc3QgZ2V0RnJhbWVJbnRlcnZhbCA9ICgpID0+IDEwMDAgLyB1bmlmb3Jtcy50YXJnZXRGUFM7IC8vIENvbnZlcnQgRlBTIHRvIG1pbGxpc2Vjb25kc1xuXG4gIGZ1bmN0aW9uIGZyYW1lKGN1cnJlbnRUaW1lOiBudW1iZXIpIHtcbiAgICBpZiAoIXBhdXNlZCAmJiAhcmVjb3ZlcnkuYWN0aXZlICYmICFmcmFtZVBlbmRpbmcgJiYgIW1hbnVhbEFkdmFuY2VQZW5kaW5nICYmIGN1cnJlbnRUaW1lIC0gbGFzdEZyYW1lVGltZSA+PSBnZXRGcmFtZUludGVydmFsKCkgLSAwLjUpIHtcbiAgICAgIGZyYW1lUGVuZGluZyA9IHRydWU7XG4gICAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICBpbnB1dCA9IGxpdmVQZXJmb3JtYW5jZS5pbnB1dFNuYXBzaG90KCk7XG4gICAgICBjb25zdCBzdGVwcyA9IHVuaWZvcm1zLmFkYXB0aXZlRnJhbWVzID8gZnJhbWVCdWRnZXQuY2hvb3NlKHVuaWZvcm1zLmNvbXB1dGVTdGVwc1BlckZyYW1lLCB1bmlmb3Jtcy50YXJnZXRGUFMpIDogdW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWU7XG4gICAgICBsZXQgZW5jb2RlZEF0ID0gc3RhcnQ7XG4gICAgICB0aW1lc3RlcChzdGVwcylcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGVuY29kZWRBdCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgIHJldHVybiBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZG9uZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgIGZyYW1lQnVkZ2V0Lm9ic2VydmUoc3RlcHMsIGRvbmUgLSBzdGFydCwgZW5jb2RlZEF0IC0gc3RhcnQpO1xuICAgICAgICAgIGxpdmVQZXJmb3JtYW5jZS5mcmFtZSh7IGF0OiBkb25lLCBzdGVwcywgZW5jb2RlTXM6IGVuY29kZWRBdCAtIHN0YXJ0LCBxdWV1ZVRhaWxNczogZG9uZSAtIGVuY29kZWRBdCwgdG90YWxNczogZG9uZSAtIHN0YXJ0IH0sIGlucHV0KTtcbiAgICAgICAgICBjb25zdCBwZXJmID0gbGl2ZVBlcmZvcm1hbmNlLnNuYXBzaG90KCk7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpIS50ZXh0Q29udGVudCA9IHBhdXNlZFxuICAgICAgICAgICAgPyBgUGF1c2VkIMK3IHN0ZXAgJHtmcmFtZU5yfWBcbiAgICAgICAgICAgIDogYCR7cGVyZi5yZW5kZXJGUFMudG9GaXhlZCgwKX0gRlBTIMK3ICR7cGVyZi5zdGVwc1BlclNlY29uZC50b0ZpeGVkKDApfSBzdGVwcy9zIMK3ICR7c3RlcHN9IHN0ZXAke3N0ZXBzID09PSAxID8gXCJcIiA6IFwic1wifS9mcmFtZWA7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChzdG9wU2ltdWxhdGlvbilcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgIGZyYW1lUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIGxhc3RGcmFtZVRpbWUgPSBjdXJyZW50VGltZTtcbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICByZXR1cm47XG59XG5cbmluZGV4KCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gIGNvbnN0IHN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIik7XG4gIGlmIChzdGF0dXMpIHN0YXR1cy50ZXh0Q29udGVudCA9IGBVbmFibGUgdG8gc3RhcnQgV2ViR1BVOiAke1N0cmluZyhlcnJvcil9YDtcbiAgY29uc3Qgbm90aWNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLW5vdGljZVwiKTtcbiAgaWYgKG5vdGljZSkge1xuICAgIG5vdGljZS5oaWRkZW4gPSBmYWxzZTtcbiAgICBub3RpY2UudGV4dENvbnRlbnQgPSBgVW5hYmxlIHRvIHN0YXJ0IFdlYkdQVTogJHtTdHJpbmcoZXJyb3IpfWA7XG4gIH1cbiAgY29uc29sZS5lcnJvcihlcnJvcik7XG59KTtcbiIsIi8vIEV4ZWN1dGVkIG9ubHkgd2l0aCA/bWVjaGFuaWNzVGVzdD0xLiBUZXN0cyB0aGUgYWN0dWFsIFdHU0wgcGlwZWxpbmVzIG9uIHR3b1xuLy8gZXhwbGljaXQgdHdvLWJlYWQgZmlsYW1lbnRzIGFuZCBvbmUgbWVtYnJhbmUgYXR0YWNobWVudCwgbm90IGEgQ1BVIHN1cnJvZ2F0ZS5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0ZXN0TWVjaGFuaWNzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYnVmZmVyczogeyBhY3RpbjogR1BVQnVmZmVyOyBtZW1icmFuZTogR1BVQnVmZmVyOyBsaW5rczogR1BVQnVmZmVyOyBmb3JjZXM6IEdQVUJ1ZmZlciB9LFxuICBjb3VudHM6IHsgYWN0aW46IG51bWJlcjsgbWVtYnJhbmU6IG51bWJlciB9LFxuICBkaXNwYXRjaDogKCkgPT4gdm9pZCxcbiAgY29uZmlndXJlOiAoc3RyZW5ndGg6IG51bWJlciwgY291cGxpbmc6IG51bWJlciwgZHJhZzogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgcmVzdWx0czogeyBuYW1lOiBzdHJpbmc7IHBhc3NlZDogYm9vbGVhbiB9W10gPSBbXTtcbiAgY29uc3QgYXNzZXJ0ID0gKG5hbWU6IHN0cmluZywgb2s6IGJvb2xlYW4pID0+IHtcbiAgICByZXN1bHRzLnB1c2goeyBuYW1lLCBwYXNzZWQ6IG9rIH0pO1xuICAgIGlmICghb2spIHRocm93IG5ldyBFcnJvcihgTWVjaGFuaWNhbCBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyKSA9PiB7XG4gICAgY29uc3QgY29weSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBidWZmZXIuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfSk7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGJ1ZmZlciwgMCwgY29weSwgMCwgYnVmZmVyLnNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBjb3B5Lm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgZGF0YSA9IGNvcHkuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICBjb3B5LnVubWFwKCk7XG4gICAgY29weS5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG4gIGNvbnN0IGZpeHR1cmUgPSBhc3luYyAoc3RyZW5ndGg6IG51bWJlciwgY291cGxpbmc6IG51bWJlciwgZHJhZyA9IDAsIGRldGFjaGVkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBhY3RpbiA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmFjdGluLnNpemUpO1xuICAgIGNvbnN0IGEgPSBuZXcgVWludDMyQXJyYXkoYWN0aW4pLFxuICAgICAgYWYgPSBuZXcgRmxvYXQzMkFycmF5KGFjdGluKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5hY3RpbjsgaSsrKSB7XG4gICAgICBhW2kgKiAxMF0gPSBhW2kgKiAxMCArIDZdID0gYVtpICogMTAgKyA3XSA9IGk7XG4gICAgICBhZltpICogMTAgKyAyXSA9IGFmW2kgKiAxMCArIDNdID0gNTAwO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgYWZbaSAqIDEwICsgMl0gPSBbMTAsIDEyLCAyMCwgMThdW2ldO1xuICAgICAgYWZbaSAqIDEwICsgM10gPSAxMDtcbiAgICAgIGFmW2kgKiAxMCArIDRdID0gaSA8IDIgPyAxIDogLTE7XG4gICAgICBhW2kgKiAxMCArIDZdID0gaSA8IDIgPyAwIDogMjtcbiAgICAgIGFbaSAqIDEwICsgN10gPSBpIDwgMiA/IDEgOiAzO1xuICAgIH1cbiAgICBjb25zdCBtZW0gPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5tZW1icmFuZS5zaXplKTtcbiAgICBjb25zdCBtZiA9IG5ldyBGbG9hdDMyQXJyYXkobWVtKSxcbiAgICAgIG11ID0gbmV3IFVpbnQzMkFycmF5KG1lbSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMubWVtYnJhbmU7IGkrKykge1xuICAgICAgbXVbaSAqIDEwXSA9IGk7XG4gICAgICBtdVtpICogMTAgKyA2XSA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtZltpICogMTAgKyAyXSA9IDEwMDA7XG4gICAgICBtZltpICogMTAgKyAzXSA9IDEwMDA7XG4gICAgfVxuICAgIG1mWzJdID0gMjU7XG4gICAgbWZbM10gPSAxMDtcbiAgICBtZlsoY291bnRzLm1lbWJyYW5lIC8gMikgKiAxMCArIDJdID0gMDtcbiAgICBtZlsoY291bnRzLm1lbWJyYW5lIC8gMikgKiAxMCArIDNdID0gMTA7XG4gICAgY29uc3QgbGlua3MgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5saW5rcy5zaXplKTtcbiAgICBjb25zdCBsdSA9IG5ldyBVaW50MzJBcnJheShsaW5rcyksXG4gICAgICBsZiA9IG5ldyBGbG9hdDMyQXJyYXkobGlua3MpO1xuICAgIGx1LnNldChbMSwgMywgMCwgMSwgMSwgMCwgMywgMl0sIDApO1xuICAgIGxmWzJdID0gNTtcbiAgICBsdS5zZXQoWzMsIDAsIDAsIDEsIDMsIDIsIDAsIDBdLCAyNTYgKiA4KTtcbiAgICBsZlsyNTYgKiA4ICsgMl0gPSAxO1xuICAgIGlmIChkZXRhY2hlZCkge1xuICAgICAgYVs2XSA9IGFbN10gPSAwO1xuICAgICAgYVsyNl0gPSBhWzI3XSA9IDI7XG4gICAgfVxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBhY3Rpbik7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUsIDAsIG1lbSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmtzKTtcbiAgICBjb25maWd1cmUoc3RyZW5ndGgsIGNvdXBsaW5nLCBkcmFnKTtcbiAgICBkaXNwYXRjaCgpO1xuICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZvcmNlczogbmV3IEludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmZvcmNlcykpLnN1YmFycmF5KDAsIDIgKiAoY291bnRzLmFjdGluICsgY291bnRzLm1lbWJyYW5lKSksXG4gICAgICBhY3RpbjogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKSxcbiAgICAgIG1lbWJyYW5lOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5tZW1icmFuZSkpLFxuICAgIH07XG4gIH07XG4gIGxldCBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMCwgMCk7XG4gIGFzc2VydChcIm9mZiBpcyBtZWNoYW5pY2FsbHkgaW5lcnRcIiwgc3RhdGUuZm9yY2VzLmV2ZXJ5KCh4KSA9PiB4ID09PSAwKSAmJiBzdGF0ZS5hY3RpblsyXSA9PT0gMTAgJiYgc3RhdGUubWVtYnJhbmVbMl0gPT09IDI1KTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAuMDUsIDApO1xuICBhc3NlcnQoXCJtb3RvciBjb250cmFjdHMgb3Bwb3NlZCBmaWxhbWVudHNcIiwgc3RhdGUuYWN0aW5bMl0gPiAxMCAmJiBzdGF0ZS5hY3RpblsyMl0gPCAyMCk7XG4gIGFzc2VydChcIm1vdG9yIHdpdGhvdXQgdGV0aGVyIGRvZXMgbm90IG1vdmUgbWVtYnJhbmVcIiwgc3RhdGUubWVtYnJhbmVbMl0gPT09IDI1KTtcbiAgYXNzZXJ0KFwibW90b3IgZm9yY2VzIGFyZSByZWNpcHJvY2FsXCIsIHN0YXRlLmZvcmNlc1swXSA9PT0gLXN0YXRlLmZvcmNlc1s0XSAmJiBzdGF0ZS5mb3JjZXNbMF0gPiAwKTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAsIDAuMDUpO1xuICBhc3NlcnQoXCJ0ZXRoZXIgcHVsbHMgbWVtYnJhbmUgdG93YXJkIGZpbGFtZW50XCIsIHN0YXRlLm1lbWJyYW5lWzJdIDwgMjUgJiYgc3RhdGUuYWN0aW5bMjJdID4gMjApO1xuICBhc3NlcnQoXCJ0ZXRoZXIgcmVhY3Rpb24gYWN0cyBvbiBhY3RpblwiLCBzdGF0ZS5mb3JjZXNbNF0gPT09IC1zdGF0ZS5mb3JjZXNbY291bnRzLmFjdGluICogMl0pO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMC4wNSk7XG4gIGxldCBmeCA9IDAsXG4gICAgZnkgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmZvcmNlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIGZ4ICs9IHN0YXRlLmZvcmNlc1tpXTtcbiAgICBmeSArPSBzdGF0ZS5mb3JjZXNbaSArIDFdO1xuICB9XG4gIGFzc2VydChcImNvbWJpbmVkIGludGVybmFsIGZvcmNlIHN1bXMgdG8gemVyb1wiLCBmeCA9PT0gMCAmJiBmeSA9PT0gMCk7XG4gIGNvbnN0IGZyZWVEaXNwbGFjZW1lbnQgPSBzdGF0ZS5hY3RpblsyXSAtIDEwO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMC4wNSwgNCk7XG4gIGFzc2VydChcImNsdXRjaCByZWR1Y2VzIG1vdGlvbiB3aXRob3V0IGNoYW5naW5nIGdlbmVyYXRlZCBmb3JjZVwiLCBzdGF0ZS5hY3RpblsyXSAtIDEwIDwgZnJlZURpc3BsYWNlbWVudCAmJiBzdGF0ZS5mb3JjZXNbMF0gPiAwKTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAuMDUsIDAuMDUsIDAsIHRydWUpO1xuICBhc3NlcnQoXG4gICAgXCJkZXBvbHltZXJpemVkIGVuZHBvaW50cyByZWxlYXNlIG1vdG9yIGFuZCB0ZXRoZXJcIixcbiAgICBzdGF0ZS5mb3JjZXMuZXZlcnkoKHgpID0+IHggPT09IDApXG4gICk7XG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwiLy8gQ29uc2VydmF0aXZlIHktYmFuZCBlZGdlIGluZGV4LiBQcmVkaWNhdGVzIHJlbWFpbiBleGFjdDsgbG9uZyBlZGdlcyBhcmVcbi8vIHJldGFpbmVkIGluIGEgZ2xvYmFsIGxpc3QgYW5kIGxvbmcgYm9uZCBxdWVyaWVzIGZhbGwgYmFjayB0byBhbGwgZWRnZXMuXG4vLyBObyBib3VuZGFyeS9jb2xsaXNpb24gaXMgZGlzY2FyZGVkIHRvIGltcHJvdmUgZGlhZ25vc3RpYyBsYXRlbmN5LlxuLy8gV2l0aCBgbGlua3M6IHRydWVgIGFkamFjZW5jeSBjb21lcyBmcm9tIHRoZSBtZW1icmFuZSBgdGFpbGAgbGlua3MgKHdvcmQgNilcbi8vIGluc3RlYWQgb2YgaW5kZXggb3JkZXIsIHNvIGZ1c2lvbi9zY2lzc2lvbiBjYW4gcmUtbGluayB0aGUgc2FtZSBidWZmZXIgaW50b1xuLy8gc2V2ZXJhbCBjbG9zZWQgbG9vcHMuIERlZ2VuZXJhdGUgc2VsZi1saW5rcyBhbmQgbGlua3Mgd2l0aG91dCBhIGRlc3RpbmF0aW9uXG4vLyB2ZXJ0ZXggY2Fycnkgbm8gZWRnZSBhbmQgYXJlIHNraXBwZWQ7IGV2ZXJ5IGVkZ2UgdGhhdCBleGlzdHMgaXMgaW5kZXhlZC5cbmNvbnN0IEJBTkQgPSA0O1xuY29uc3QgVEFJTF9XT1JEID0gNjsgLy8gc2VnbWVudCB3b3JkIDYgaG9sZHMgYHRhaWxgOiB0aGUgbmV4dCB2ZXJ0ZXggYWxvbmcgdGhlIHJpbmdcbmNvbnN0IEhFQURfV09SRCA9IDc7IC8vIHNlZ21lbnQgd29yZCA3IGhvbGRzIGBoZWFkYDogdGhlIHByZXZpb3VzIHZlcnRleCBhbG9uZyB0aGUgcmluZ1xudHlwZSBFZGdlID0geyB4OiBudW1iZXI7IHk6IG51bWJlcjsgZHg6IG51bWJlcjsgZHk6IG51bWJlcjsgbHg6IG51bWJlcjsgaHg6IG51bWJlcjsgbHk6IG51bWJlcjsgaHk6IG51bWJlciB9O1xuZXhwb3J0IHR5cGUgRWRnZU9wdGlvbnMgPSB7IGxpbmtzPzogYm9vbGVhbiB9O1xuXG5mdW5jdGlvbiBlZGdlSW5kZXgobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlOiBudW1iZXIsIHJldmVyc2UgPSBmYWxzZSwgb3B0aW9ucz86IEVkZ2VPcHRpb25zKSB7XG4gIGNvbnN0IG4gPSBtZW1icmFuZS5sZW5ndGggLyBzdHJpZGU7XG4gIGNvbnN0IGxpbmtlZCA9IG9wdGlvbnM/LmxpbmtzID8gbmV3IFVpbnQzMkFycmF5KG1lbWJyYW5lLmJ1ZmZlciwgbWVtYnJhbmUuYnl0ZU9mZnNldCwgbWVtYnJhbmUubGVuZ3RoKSA6IG51bGw7XG4gIGNvbnN0IGVkZ2VzOiBFZGdlW10gPSBbXSxcbiAgICByb3dzID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VbXT4oKSxcbiAgICB3aWRlOiBFZGdlW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICBjb25zdCBqID0gbGlua2VkID8gbGlua2VkW2kgKiBzdHJpZGUgKyBUQUlMX1dPUkRdIDogKGkgKyAocmV2ZXJzZSA/IG4gLSAxIDogMSkpICUgbjtcbiAgICBpZiAobGlua2VkICYmIChqID09PSBpIHx8IGogPj0gbikpIGNvbnRpbnVlOyAvLyBmcmVlIHZlcnRleCBvciBkZWFkIGxpbms6IG5vIGVkZ2UgdG8gaW5kZXhcbiAgICBjb25zdCB4ID0gbWVtYnJhbmVbaSAqIHN0cmlkZSArIDJdLFxuICAgICAgeSA9IG1lbWJyYW5lW2kgKiBzdHJpZGUgKyAzXSxcbiAgICAgIGJ4ID0gbWVtYnJhbmVbaiAqIHN0cmlkZSArIDJdLFxuICAgICAgYnkgPSBtZW1icmFuZVtqICogc3RyaWRlICsgM107XG4gICAgaWYgKCFbeCwgeSwgYngsIGJ5XS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJOb24tZmluaXRlIG1lbWJyYW5lIGdlb21ldHJ5XCIpO1xuICAgIGNvbnN0IGUgPSB7IHgsIHksIGR4OiBieCAtIHgsIGR5OiBieSAtIHksIGx4OiBNYXRoLm1pbih4LCBieCksIGh4OiBNYXRoLm1heCh4LCBieCksIGx5OiBNYXRoLm1pbih5LCBieSksIGh5OiBNYXRoLm1heCh5LCBieSkgfTtcbiAgICBlZGdlcy5wdXNoKGUpO1xuICAgIGNvbnN0IGxvdyA9IE1hdGguZmxvb3IoZS5seSAvIEJBTkQpLFxuICAgICAgaGlnaCA9IE1hdGguZmxvb3IoZS5oeSAvIEJBTkQpO1xuICAgIGlmIChoaWdoIC0gbG93ID4gMjU2KSB7XG4gICAgICB3aWRlLnB1c2goZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgcm93ID0gbG93OyByb3cgPD0gaGlnaDsgcm93KyspIHtcbiAgICAgIGNvbnN0IGxpc3QgPSByb3dzLmdldChyb3cpO1xuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChlKTtcbiAgICAgIGVsc2Ugcm93cy5zZXQocm93LCBbZV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBlZGdlcywgcm93cywgd2lkZSB9O1xufVxuXG4vLyBMZWdhY3kgcGFydGljbGUgY291bnRzIHVzZSBwaXhlbC1yb3cgc2FtcGxpbmc7IGV4cGxpY2l0LWZpbGFtZW50IG1vZGUgdXNlc1xuLy8gZXhhY3QgeSBjb29yZGluYXRlcy4gVGhlIGdlb21ldHJ5IGZvcm11bGEvb3JkZXIgbWF0Y2hlcyB0aGUgcHJpb3IgZnVsbCBzY2FuLlxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb25PY2N1cGFuY3kobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTAsIGV4YWN0ID0gZmFsc2UsIG9wdGlvbnM/OiBFZGdlT3B0aW9ucykge1xuICBjb25zdCB7IHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlLCB0cnVlLCBvcHRpb25zKTtcbiAgY29uc3QgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyW10+KCk7XG4gIHJldHVybiAoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcih5KSxcbiAgICAgIHNjYW5ZID0gZXhhY3QgPyB5IDogcm93ICsgMC41O1xuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSByb3dzLmdldChNYXRoLmZsb29yKHNjYW5ZIC8gQkFORCkpID8/IFtdO1xuICAgIGlmIChleGFjdCkge1xuICAgICAgbGV0IGluc2lkZSA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBsaXN0IG9mIFtjYW5kaWRhdGVzLCB3aWRlXSlcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgICBpZiAoZS55ID4gc2NhblkgIT0gZS55ICsgZS5keSA+IHNjYW5ZICYmIGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5IDw9IHgpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgfVxuICAgIGxldCBjcm9zc2luZ3MgPSBjYWNoZS5nZXQocm93KTtcbiAgICBpZiAoIWNyb3NzaW5ncykge1xuICAgICAgY3Jvc3NpbmdzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGxpc3Qgb2YgW2NhbmRpZGF0ZXMsIHdpZGVdKVxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICAgIGlmIChlLnkgPiBzY2FuWSAhPSBlLnkgKyBlLmR5ID4gc2NhblkpIGNyb3NzaW5ncy5wdXNoKGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5KTtcbiAgICAgICAgfVxuICAgICAgY3Jvc3NpbmdzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICAgIGNhY2hlLnNldChyb3csIGNyb3NzaW5ncyk7XG4gICAgfVxuICAgIGxldCBsbyA9IDAsXG4gICAgICBoaSA9IGNyb3NzaW5ncy5sZW5ndGg7XG4gICAgd2hpbGUgKGxvIDwgaGkpIHtcbiAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgIGlmIChjcm9zc2luZ3NbbWlkXSA8PSB4KSBsbyA9IG1pZCArIDE7XG4gICAgICBlbHNlIGhpID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG8gJSAyID09PSAxO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbkJvbmRDcm9zc2luZyhtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGUgPSAxMCwgb3B0aW9ucz86IEVkZ2VPcHRpb25zKSB7XG4gIGNvbnN0IHsgZWRnZXMsIHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlLCBmYWxzZSwgb3B0aW9ucyk7XG4gIHJldHVybiAoYXg6IG51bWJlciwgYXk6IG51bWJlciwgYng6IG51bWJlciwgYnk6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIG1pblggPSBNYXRoLm1pbihheCwgYngpLFxuICAgICAgbWF4WCA9IE1hdGgubWF4KGF4LCBieCksXG4gICAgICBtaW5ZID0gTWF0aC5taW4oYXksIGJ5KSxcbiAgICAgIG1heFkgPSBNYXRoLm1heChheSwgYnkpO1xuICAgIGNvbnN0IGNyb3NzZXMgPSAobGlzdDogRWRnZVtdKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICBpZiAobWF4WCA8IGUubHggfHwgbWluWCA+IGUuaHggfHwgbWF4WSA8IGUubHkgfHwgbWluWSA+IGUuaHkpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9IGR4ICogZS5keSAtIGR5ICogZS5keDtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9taW5hdG9yKSA8IDFlLTgpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCB0ID0gKChlLnggLSBheCkgKiBlLmR5IC0gKGUueSAtIGF5KSAqIGUuZHgpIC8gZGVub21pbmF0b3I7XG4gICAgICAgIGNvbnN0IHUgPSAoKGUueCAtIGF4KSAqIGR5IC0gKGUueSAtIGF5KSAqIGR4KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBpZiAodCA+IDFlLTUgJiYgdCA8IDEgLSAxZS01ICYmIHUgPj0gMCAmJiB1IDw9IDEpIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgY29uc3QgbG93ID0gTWF0aC5mbG9vcihtaW5ZIC8gQkFORCksXG4gICAgICBoaWdoID0gTWF0aC5mbG9vcihtYXhZIC8gQkFORCk7XG4gICAgaWYgKGhpZ2ggLSBsb3cgPiAyKSByZXR1cm4gY3Jvc3NlcyhlZGdlcyk7XG4gICAgaWYgKGNyb3NzZXMod2lkZSkpIHJldHVybiB0cnVlO1xuICAgIGZvciAobGV0IHJvdyA9IGxvdzsgcm93IDw9IGhpZ2g7IHJvdysrKSBpZiAoY3Jvc3Nlcyhyb3dzLmdldChyb3cpID8/IFtdKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuXG5leHBvcnQgdHlwZSBNZW1icmFuZUxvb3BzID0ge1xuICBsb29wczogbnVtYmVyOyAvLyBjbG9zZWQgbG9vcHMgZm91bmQgYnkgZm9sbG93aW5nIHRhaWwgbGlua3MgZnJvbSB1bnZpc2l0ZWQgdmVydGljZXNcbiAgYnJva2VuTGlua3M6IG51bWJlcjsgLy8gdmVydGljZXMgaSB3aXRoIGhlYWQodGFpbChpKSkgIT09IGkgb3IgdGFpbChoZWFkKGkpKSAhPT0gaVxuICBsb29wQXJlYXM6IHsgdmVydGljZXM6IG51bWJlcjsgYXJlYTogbnVtYmVyIH1bXTsgLy8gc2lnbmVkIHBpeGVsIGFyZWFzLCBsYXJnZXN0IHxhcmVhfCBmaXJzdFxufTtcblxuLy8gVG9wb2xvZ3kgb2YgYSBsaW5rLWZvbGxvd2VkIG1lbWJyYW5lLCBhbHdheXMgcmVhZCBmcm9tIHRoZSB0YWlsIGxpbmtzICh3b3JkXG4vLyA2KSBzaW5jZSBmdXNpb24vc2Npc3Npb24gY2FuIHJlLWxpbmsgdGhlIGJ1ZmZlciBpbnRvIHNldmVyYWwgY2xvc2VkIGxvb3BzLlxuLy8gSW5uZXIgbG9vcHMgd2luZCBvcHBvc2l0ZSB0byB0aGUgb3V0ZXIgb25lLCBzbyB0aGVpciBzaWduZWQgYXJlYXMgc3VidHJhY3QuXG4vLyBEZWdlbmVyYXRlIHNlbGYtbGlua3MgYW5kIGxpbmtzIHdpdGhvdXQgYSBkZXN0aW5hdGlvbiB2ZXJ0ZXggY2Fycnkgbm8gZWRnZTpcbi8vIGEgc2VsZi1saW5rIGlzIGEgZnJlZSB2ZXJ0ZXggaW4gbm8gbG9vcCwgd2hpbGUgYSBkZWFkIGxpbmsgY291bnRzIGFzIGJyb2tlblxuLy8gYW5kIG5ldmVyIGpvaW5zIGEgbG9vcC4gV2Fsa3Mgc3RvcCBhdCB2aXNpdGVkIHZlcnRpY2VzLCBzbyBicm9rZW4gdG9wb2xvZ3lcbi8vIGNhbm5vdCBsb29wIGZvcmV2ZXIgb3IgY291bnQgYSBjaGFpbiB0d2ljZS5cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uTG9vcHMobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTAsIGNvdW50ID0gbWVtYnJhbmUubGVuZ3RoIC8gc3RyaWRlKTogTWVtYnJhbmVMb29wcyB7XG4gIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KG1lbWJyYW5lLmJ1ZmZlciwgbWVtYnJhbmUuYnl0ZU9mZnNldCwgbWVtYnJhbmUubGVuZ3RoKTtcbiAgY29uc3QgdmlzaXRlZCA9IG5ldyBVaW50OEFycmF5KGNvdW50KTtcbiAgY29uc3QgbG9vcEFyZWFzOiB7IHZlcnRpY2VzOiBudW1iZXI7IGFyZWE6IG51bWJlciB9W10gPSBbXTtcbiAgbGV0IGJyb2tlbkxpbmtzID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudDsgaSsrKSB7XG4gICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBzdHJpZGUgKyBUQUlMX1dPUkRdO1xuICAgIGNvbnN0IGhlYWQgPSB3b3Jkc1tpICogc3RyaWRlICsgSEVBRF9XT1JEXTtcbiAgICAvLyBvdXQtb2YtcmFuZ2UgbGlua3MgcmVhZCBhcyB1bmRlZmluZWQsIHNvIGRlYWQgbGlua3MgY291bnQgYXMgYnJva2VuXG4gICAgaWYgKHdvcmRzW3RhaWwgKiBzdHJpZGUgKyBIRUFEX1dPUkRdICE9PSBpIHx8IHdvcmRzW2hlYWQgKiBzdHJpZGUgKyBUQUlMX1dPUkRdICE9PSBpKSBicm9rZW5MaW5rcysrO1xuICAgIGlmICh2aXNpdGVkW2ldIHx8IHRhaWwgPT09IGkgfHwgdGFpbCA+PSBjb3VudCkgY29udGludWU7XG4gICAgLy8gZm9sbG93IHRhaWwgbGlua3Mgb25jZSBwZXIgbG9vcCwgdW50aWwgdGhlIHdhbGsgY2xvc2VzIGJhY2sgb24gaVxuICAgIGxldCBjdXJyZW50ID0gaTtcbiAgICBsZXQgdmVydGljZXMgPSAwO1xuICAgIGxldCBzaG9lbGFjZSA9IDA7XG4gICAgbGV0IGNsb3NlZCA9IGZhbHNlO1xuICAgIGZvciAoOzspIHtcbiAgICAgIHZpc2l0ZWRbY3VycmVudF0gPSAxO1xuICAgICAgY29uc3QgbmV4dCA9IHdvcmRzW2N1cnJlbnQgKiBzdHJpZGUgKyBUQUlMX1dPUkRdO1xuICAgICAgaWYgKG5leHQgPT09IGN1cnJlbnQgfHwgbmV4dCA+PSBjb3VudCkgYnJlYWs7XG4gICAgICBzaG9lbGFjZSArPSBtZW1icmFuZVtjdXJyZW50ICogc3RyaWRlICsgMl0gKiBtZW1icmFuZVtuZXh0ICogc3RyaWRlICsgM10gLSBtZW1icmFuZVtuZXh0ICogc3RyaWRlICsgMl0gKiBtZW1icmFuZVtjdXJyZW50ICogc3RyaWRlICsgM107XG4gICAgICB2ZXJ0aWNlcysrO1xuICAgICAgaWYgKG5leHQgPT09IGkpIHtcbiAgICAgICAgY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAodmlzaXRlZFtuZXh0XSkgYnJlYWs7XG4gICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICB9XG4gICAgaWYgKGNsb3NlZCkgbG9vcEFyZWFzLnB1c2goeyB2ZXJ0aWNlcywgYXJlYTogc2hvZWxhY2UgLyAyIH0pO1xuICB9XG4gIGxvb3BBcmVhcy5zb3J0KChhLCBiKSA9PiBNYXRoLmFicyhiLmFyZWEpIC0gTWF0aC5hYnMoYS5hcmVhKSk7XG4gIHJldHVybiB7IGxvb3BzOiBsb29wQXJlYXMubGVuZ3RoLCBicm9rZW5MaW5rcywgbG9vcEFyZWFzIH07XG59XG4iLCIvLyBTZXBhcmF0ZSBzZWVkZWQgc3RyZWFtcyBmb3IgaW5pdGlhbCBwb3NpdGlvbnMva2V5cyBhbmQgQ1BVIHNwcm91dCBzY2hlZHVsaW5nLlxuLy8gR1BVIGluLXBsYWNlIGtlcm5lbHMgaW5oZXJpdGVkIGZyb20gdGhlIHByb3RvdHlwZSBhcmUgbm90IGJpdHdpc2UgZGV0ZXJtaW5pc3RpYy5cbmV4cG9ydCBmdW5jdGlvbiBzZWVkZWRSYW5kb20oc2VlZDogbnVtYmVyKTogKCkgPT4gbnVtYmVyIHtcbiAgbGV0IHN0YXRlID0gc2VlZCA+Pj4gMDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBzdGF0ZSA9IChzdGF0ZSArIDB4NmQyYjc5ZjUpID4+PiAwO1xuICAgIGxldCB0ID0gTWF0aC5pbXVsKHN0YXRlIF4gKHN0YXRlID4+PiAxNSksIHN0YXRlIHwgMSk7XG4gICAgdCBePSB0ICsgTWF0aC5pbXVsKHQgXiAodCA+Pj4gNyksIHQgfCA2MSk7XG4gICAgcmV0dXJuICgodCBeICh0ID4+PiAxNCkpID4+PiAwKSAvIDQyOTQ5NjcyOTY7XG4gIH07XG59XG4iLCJleHBvcnQgY2xhc3MgRnJhbWVCdWRnZXQge1xuICBwcml2YXRlIHN0ZXBNcyA9IDQ7XG4gIHByaXZhdGUgb3ZlcmhlYWRNcyA9IDI7XG4gIGNob29zZShtYXhTdGVwczogbnVtYmVyLCB0YXJnZXRGUFM6IG51bWJlcikge1xuICAgIGNvbnN0IGJ1ZGdldCA9IE1hdGgubWF4KDEsIDEwMDAgLyBNYXRoLm1heCgxLCB0YXJnZXRGUFMpIC0gMiAtIHRoaXMub3ZlcmhlYWRNcyk7XG4gICAgcmV0dXJuIE1hdGgubWF4KDEsIE1hdGgubWluKE1hdGguZmxvb3IobWF4U3RlcHMpLCBNYXRoLmZsb29yKGJ1ZGdldCAvIE1hdGgubWF4KDAuMSwgdGhpcy5zdGVwTXMpKSkpO1xuICB9XG4gIG9ic2VydmUoc3RlcHM6IG51bWJlciwgdG90YWxNczogbnVtYmVyLCBlbmNvZGVNczogbnVtYmVyKSB7XG4gICAgLy8gRml4ZWQgcGh5c2ljYWwgc3RlcHM7IGFkYXB0IGJhdGNoaW5nIG9ubHksIG5ldmVyIGR0IG9yIHNvbHZlciBpdGVyYXRpb25zLlxuICAgIHRoaXMuc3RlcE1zID0gMC44ICogdGhpcy5zdGVwTXMgKyAwLjIgKiBNYXRoLm1heCgwLjEsICh0b3RhbE1zIC0gdGhpcy5vdmVyaGVhZE1zKSAvIHN0ZXBzKTtcbiAgICB0aGlzLm92ZXJoZWFkTXMgPSAwLjkgKiB0aGlzLm92ZXJoZWFkTXMgKyAwLjEgKiBNYXRoLm1pbigzLCBlbmNvZGVNcyAvIE1hdGgubWF4KDEsIHN0ZXBzKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgRnJhbWVTYW1wbGUgPSB7IGF0OiBudW1iZXI7IHN0ZXBzOiBudW1iZXI7IGVuY29kZU1zOiBudW1iZXI7IHF1ZXVlVGFpbE1zOiBudW1iZXI7IHRvdGFsTXM6IG51bWJlciB9O1xuZnVuY3Rpb24gZGlzdHJpYnV0aW9uKHZhbHVlczogbnVtYmVyW10pIHtcbiAgY29uc3Qgc29ydGVkID0gWy4uLnZhbHVlc10uc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICByZXR1cm4gc29ydGVkLmxlbmd0aFxuICAgID8geyBtZWRpYW46IHNvcnRlZFtzb3J0ZWQubGVuZ3RoID4+IDFdLCBwOTU6IHNvcnRlZFtNYXRoLm1pbihzb3J0ZWQubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcihzb3J0ZWQubGVuZ3RoICogMC45NSkpXSwgbWF4OiBzb3J0ZWQuYXQoLTEpIH1cbiAgICA6IG51bGw7XG59XG5leHBvcnQgY2xhc3MgTGl2ZVBlcmZvcm1hbmNlIHtcbiAgcHJpdmF0ZSBmcmFtZXM6IEZyYW1lU2FtcGxlW10gPSBbXTtcbiAgcHJpdmF0ZSBpbnB1dHM6IG51bWJlcltdID0gW107XG4gIGlucHV0VmVyc2lvbiA9IDA7XG4gIHByaXZhdGUgcHJvY2Vzc2VkVmVyc2lvbiA9IDA7XG4gIHByaXZhdGUgaW5wdXRBdCA9IDA7XG4gIGNvYWxlc2NlZElucHV0cyA9IDA7XG4gIGlucHV0KCkge1xuICAgIHRoaXMuaW5wdXRBdCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHJldHVybiArK3RoaXMuaW5wdXRWZXJzaW9uO1xuICB9XG4gIGlucHV0U25hcHNob3QoKSB7XG4gICAgcmV0dXJuIHsgdmVyc2lvbjogdGhpcy5pbnB1dFZlcnNpb24sIGF0OiB0aGlzLmlucHV0QXQgfTtcbiAgfVxuICBmcmFtZShzYW1wbGU6IEZyYW1lU2FtcGxlLCBpbnB1dDogeyB2ZXJzaW9uOiBudW1iZXI7IGF0OiBudW1iZXIgfSkge1xuICAgIHRoaXMuZnJhbWVzLnB1c2goc2FtcGxlKTtcbiAgICBpZiAodGhpcy5mcmFtZXMubGVuZ3RoID4gNjAwKSB0aGlzLmZyYW1lcy5zaGlmdCgpO1xuICAgIGlmIChpbnB1dC52ZXJzaW9uID4gdGhpcy5wcm9jZXNzZWRWZXJzaW9uKSB7XG4gICAgICB0aGlzLmNvYWxlc2NlZElucHV0cyArPSBNYXRoLm1heCgwLCBpbnB1dC52ZXJzaW9uIC0gdGhpcy5wcm9jZXNzZWRWZXJzaW9uIC0gMSk7XG4gICAgICB0aGlzLnByb2Nlc3NlZFZlcnNpb24gPSBpbnB1dC52ZXJzaW9uO1xuICAgICAgdGhpcy5pbnB1dHMucHVzaChzYW1wbGUuYXQgLSBpbnB1dC5hdCk7XG4gICAgICBpZiAodGhpcy5pbnB1dHMubGVuZ3RoID4gMjU2KSB0aGlzLmlucHV0cy5zaGlmdCgpO1xuICAgIH1cbiAgfVxuICBjbGVhckZyYW1lcygpIHtcbiAgICB0aGlzLmZyYW1lcy5sZW5ndGggPSAwO1xuICB9XG4gIHNuYXBzaG90KCkge1xuICAgIGNvbnN0IGZyYW1lcyA9IHRoaXMuZnJhbWVzLFxuICAgICAgc3BhbiA9IGZyYW1lcy5sZW5ndGggPiAxID8gKGZyYW1lcy5hdCgtMSkhLmF0IC0gZnJhbWVzWzBdLmF0KSAvIDEwMDAgOiAwO1xuICAgIGNvbnN0IGludGVydmFscyA9IGZyYW1lcy5zbGljZSgxKS5tYXAoKGYsIGkpID0+IGYuYXQgLSBmcmFtZXNbaV0uYXQpO1xuICAgIHJldHVybiB7XG4gICAgICB3aW5kb3dGcmFtZXM6IGZyYW1lcy5sZW5ndGgsXG4gICAgICByZW5kZXJGUFM6IHNwYW4gPyAoZnJhbWVzLmxlbmd0aCAtIDEpIC8gc3BhbiA6IDAsXG4gICAgICBzdGVwc1BlclNlY29uZDogc3BhbiA/IGZyYW1lcy5zbGljZSgxKS5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLnN0ZXBzLCAwKSAvIHNwYW4gOiAwLFxuICAgICAgZnJhbWVJbnRlcnZhbE1zOiBkaXN0cmlidXRpb24oaW50ZXJ2YWxzKSxcbiAgICAgIGVuY29kZU1zOiBkaXN0cmlidXRpb24oZnJhbWVzLm1hcCgoZikgPT4gZi5lbmNvZGVNcykpLFxuICAgICAgcXVldWVUYWlsTXM6IGRpc3RyaWJ1dGlvbihmcmFtZXMubWFwKChmKSA9PiBmLnF1ZXVlVGFpbE1zKSksXG4gICAgICBpbnB1dFRvQ29tcGxldGVkRnJhbWVNczogZGlzdHJpYnV0aW9uKHRoaXMuaW5wdXRzKSxcbiAgICAgIGNvYWxlc2NlZElucHV0czogdGhpcy5jb2FsZXNjZWRJbnB1dHMsXG4gICAgfTtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFJlbmRlck1vZHVsZSB7XG4gIHByaXZhdGUgZGV2aWNlOiBHUFVEZXZpY2U7XG4gIHByaXZhdGUgY2FudmFzRm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0O1xuXG4gIC8vIFJlbmRlcmluZyByZXNvdXJjZXNcbiAgcHJpdmF0ZSBpbnRlcm1lZGlhdGVUZXh0dXJlOiBHUFVUZXh0dXJlO1xuICBwcml2YXRlIGNvbXB1dGVSZW5kZXJQaXBlbGluZTogR1BVQ29tcHV0ZVBpcGVsaW5lO1xuICBwcml2YXRlIHJlbmRlclBpcGVsaW5lOiBHUFVSZW5kZXJQaXBlbGluZTtcbiAgcHJpdmF0ZSBiaW5kR3JvdXBQb3N0UHJvY2VzczogR1BVQmluZEdyb3VwO1xuICBwcml2YXRlIHJlbmRlckJpbmRHcm91cDogR1BVQmluZEdyb3VwO1xuICBwcml2YXRlIHNwZWNpbWVuUGlwZWxpbmU6IEdQVUNvbXB1dGVQaXBlbGluZTtcbiAgcHJpdmF0ZSBzcGVjaW1lbkJpbmRHcm91cDogR1BVQmluZEdyb3VwO1xuICBwcml2YXRlIHNwZWNpbWVuTGF5b3V0OiBHUFVCaW5kR3JvdXBMYXlvdXQ7XG4gIHByaXZhdGUgcHJlcGFyZXNTcGVjaW1lbjogYm9vbGVhbjtcbiAgcHJpdmF0ZSB2aWV3QnVmZmVyOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgc2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xuICBwcml2YXRlIG91dHB1dDogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xuICAvLyBgZ2xpZGVgIGlzIHRoZSB0aW1lIGNvbnN0YW50LCBpbiBzZWNvbmRzLCB3aXRoIHdoaWNoIHRoZSB2aWV3IG1vdmVzIHRvIHRoZSBmcmFtZWQgcmVnaW9uLlxuICByZWFkb25seSB2aWV3ID0geyBtb2RlOiAxLCB6b29tOiAzLCBmb2N1czogMC4xNSwgY29udHJhc3Q6IDEuMiwgY2hyb21hOiAwLjQ1LCBncmFpbjogMC42LCBmb2xsb3c6IHRydWUsIGF1dG9GaXQ6IHRydWUsIHByZXlTdGFpbjogMCwgZ2xpZGU6IDAuMDg1LCB0aWdodDogZmFsc2UgfTtcbiAgcHJpdmF0ZSByZW5kZXJlZCA9IDA7XG4gIHJlYWRvbmx5IGNhbWVyYTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuICBwcml2YXRlIGNhbWVyYVRhcmdldDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuXG4gIHByaXZhdGUgZXh0ZW50ID0geyB3aWR0aDogMjAwLCBoZWlnaHQ6IDIwMCB9O1xuICBzZXRDZWxsQm91bmRzKGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciwgdG9wOiBudW1iZXIsIGJvdHRvbTogbnVtYmVyKSB7XG4gICAgaWYgKCFbbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tXS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpIHx8IHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuO1xuICAgIHRoaXMuY2FtZXJhVGFyZ2V0ID0geyB4OiAobGVmdCArIHJpZ2h0KSAvIDIsIHk6ICh0b3AgKyBib3R0b20pIC8gMiB9O1xuICAgIHRoaXMuZXh0ZW50ID0geyB3aWR0aDogcmlnaHQgLSBsZWZ0LCBoZWlnaHQ6IGJvdHRvbSAtIHRvcCB9O1xuICB9XG4gIHByaXZhdGUgZml0dGVkWm9vbSgpIHtcbiAgICAvLyBgdGlnaHRgIGlzIGZvciBzdGlsbHMgd2l0aG91dCBwYWdlIGZ1cm5pdHVyZTogdGhlIGZyYW1lZCByZWdpb24gZmlsbHMgdGhlIGltYWdlLlxuICAgIGlmICh0aGlzLnZpZXcudGlnaHQpIHJldHVybiBNYXRoLm1heCgwLjIsIE1hdGgubWluKDgsICh3aW5kb3cuaW5uZXJXaWR0aCAqIDAuOTQpIC8gdGhpcy5leHRlbnQud2lkdGgsICh3aW5kb3cuaW5uZXJIZWlnaHQgKiAwLjk0KSAvIHRoaXMuZXh0ZW50LmhlaWdodCkpO1xuICAgIHJldHVybiBNYXRoLm1heCgwLjIsIE1hdGgubWluKDMuOCwgKHdpbmRvdy5pbm5lcldpZHRoICogMC43NikgLyB0aGlzLmV4dGVudC53aWR0aCwgKE1hdGgubWF4KDEwMCwgd2luZG93LmlubmVySGVpZ2h0IC0gMTYwKSAqIDAuNzgpIC8gdGhpcy5leHRlbnQuaGVpZ2h0KSk7XG4gIH1cbiAgZml0SW1tZWRpYXRlbHkoKSB7XG4gICAgaWYgKHRoaXMudmlldy5hdXRvRml0KSB0aGlzLnZpZXcuem9vbSA9IHRoaXMuZml0dGVkWm9vbSgpO1xuICAgIGlmICh0aGlzLnZpZXcuZm9sbG93KSBPYmplY3QuYXNzaWduKHRoaXMuY2FtZXJhLCB0aGlzLmNhbWVyYVRhcmdldCk7XG4gIH1cbiAgcHJpdmF0ZSBzY3JlZW5TY2FsZSgpIHtcbiAgICByZXR1cm4geyB4OiAodGhpcy52aWV3Lnpvb20gKiB0aGlzLnNpemUud2lkdGgpIC8gd2luZG93LmlubmVyV2lkdGgsIHk6ICh0aGlzLnZpZXcuem9vbSAqIHRoaXMuc2l6ZS5oZWlnaHQpIC8gd2luZG93LmlubmVySGVpZ2h0IH07XG4gIH1cbiAgcHJpdmF0ZSBvdXRwdXRTY2FsZSgpIHtcbiAgICByZXR1cm4geyB4OiAodGhpcy52aWV3Lnpvb20gKiB0aGlzLm91dHB1dC53aWR0aCkgLyB3aW5kb3cuaW5uZXJXaWR0aCwgeTogKHRoaXMudmlldy56b29tICogdGhpcy5vdXRwdXQuaGVpZ2h0KSAvIHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9XG4gIHNjcmVlblRvV29ybGQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMudmlldy5tb2RlKSByZXR1cm4geyB4LCB5IH07XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjcmVlblNjYWxlKCk7XG4gICAgcmV0dXJuIHsgeDogdGhpcy5jYW1lcmEueCArICh4IC0gdGhpcy5zaXplLndpZHRoIC8gMikgLyBzY2FsZS54LCB5OiB0aGlzLmNhbWVyYS55ICsgKHkgLSB0aGlzLnNpemUuaGVpZ2h0IC8gMikgLyBzY2FsZS55IH07XG4gIH1cbiAgd29ybGRUb1NjcmVlbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICghdGhpcy52aWV3Lm1vZGUpIHJldHVybiB7IHgsIHkgfTtcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NyZWVuU2NhbGUoKTtcbiAgICByZXR1cm4geyB4OiAoeCAtIHRoaXMuY2FtZXJhLngpICogc2NhbGUueCArIHRoaXMuc2l6ZS53aWR0aCAvIDIsIHk6ICh5IC0gdGhpcy5jYW1lcmEueSkgKiBzY2FsZS55ICsgdGhpcy5zaXplLmhlaWdodCAvIDIgfTtcbiAgfVxuXG4gIHByaXZhdGUgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQ6IFtudW1iZXIsIG51bWJlcl07XG4gIHByaXZhdGUgT1VUUFVUX1dPUktHUk9VUF9DT1VOVDogW251bWJlciwgbnVtYmVyXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gICAgY2FudmFzRm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0LFxuICAgIGNhbnZhc1NpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSxcbiAgICByZW5kZXJTaGFkZXI6IEdQVVNoYWRlck1vZHVsZSxcbiAgICB0ZXh0dXJlczoge1xuICAgICAgc2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xuICAgIH0sXG4gICAgc2hhcmVkTGF5b3V0RW50cmllczogR1BVQmluZEdyb3VwTGF5b3V0RW50cnlbXSxcbiAgICBzaGFyZWRCaW5kR3JvdXBFbnRyaWVzOiBHUFVCaW5kR3JvdXBFbnRyeVtdLFxuICAgIGdlb21ldHJ5OiBHUFVCdWZmZXJCaW5kaW5nLFxuICAgIGV4dGVybmFsU3BlY2ltZW4/OiBHUFVUZXh0dXJlLFxuICAgIG91dHB1dFNpemUgPSBjYW52YXNTaXplXG4gICkge1xuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgIHRoaXMuY2FudmFzRm9ybWF0ID0gY2FudmFzRm9ybWF0O1xuICAgIHRoaXMuc2l6ZSA9IGNhbnZhc1NpemU7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXRTaXplO1xuICAgIHRoaXMuY2FtZXJhID0geyB4OiBjYW52YXNTaXplLndpZHRoIC8gMiwgeTogY2FudmFzU2l6ZS5oZWlnaHQgLyAyIH07XG4gICAgdGhpcy5jYW1lcmFUYXJnZXQgPSB7IC4uLnRoaXMuY2FtZXJhIH07XG4gICAgdGhpcy5URVhUVVJFX1dPUktHUk9VUF9DT1VOVCA9IFtNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS53aWR0aCAvIDE2KSwgTWF0aC5jZWlsKHRleHR1cmVzLnNpemUuaGVpZ2h0IC8gMTYpXTtcbiAgICB0aGlzLk9VVFBVVF9XT1JLR1JPVVBfQ09VTlQgPSBbTWF0aC5jZWlsKG91dHB1dFNpemUud2lkdGggLyAxNiksIE1hdGguY2VpbChvdXRwdXRTaXplLmhlaWdodCAvIDE2KV07XG5cbiAgICBjb25zdCBCSU5ESU5HX0lOVEVSTUVESUFURV9URVhUVVJFID0gMTA7XG4gICAgdGhpcy52aWV3QnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IDQ4LCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIH0pO1xuICAgIHRoaXMucHJlcGFyZXNTcGVjaW1lbiA9ICFleHRlcm5hbFNwZWNpbWVuO1xuICAgIGNvbnN0IHNwZWNpbWVuID1cbiAgICAgIGV4dGVybmFsU3BlY2ltZW4gPz9cbiAgICAgIGRldmljZS5jcmVhdGVUZXh0dXJlKHtcbiAgICAgICAgc2l6ZTogW3RleHR1cmVzLnNpemUud2lkdGgsIHRleHR1cmVzLnNpemUuaGVpZ2h0XSxcbiAgICAgICAgZm9ybWF0OiBcInJnYmExNmZsb2F0XCIsXG4gICAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyxcbiAgICAgIH0pO1xuICAgIGNvbnN0IHNwZWNpbWVuVmlldyA9IHNwZWNpbWVuLmNyZWF0ZVZpZXcoKTtcbiAgICBjb25zdCBzcGVjaW1lbkxheW91dCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgICAgZW50cmllczogW1xuICAgICAgICAuLi5zaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgICAgICB7IGJpbmRpbmc6IDEzLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFLCBidWZmZXI6IHsgdHlwZTogXCJyZWFkLW9ubHktc3RvcmFnZVwiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxNiwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgc3RvcmFnZVRleHR1cmU6IHsgYWNjZXNzOiBcIndyaXRlLW9ubHlcIiwgZm9ybWF0OiBcInJnYmExNmZsb2F0XCIgfSB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICB0aGlzLnNwZWNpbWVuTGF5b3V0ID0gc3BlY2ltZW5MYXlvdXQ7XG4gICAgdGhpcy5zcGVjaW1lbkJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGF5b3V0OiBzcGVjaW1lbkxheW91dCxcbiAgICAgIGVudHJpZXM6IFsuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLCB7IGJpbmRpbmc6IDEzLCByZXNvdXJjZTogZ2VvbWV0cnkgfSwgeyBiaW5kaW5nOiAxNiwgcmVzb3VyY2U6IHNwZWNpbWVuVmlldyB9XSxcbiAgICB9KTtcbiAgICB0aGlzLnNwZWNpbWVuUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICAgIGxheW91dDogZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHsgYmluZEdyb3VwTGF5b3V0czogW3NwZWNpbWVuTGF5b3V0XSB9KSxcbiAgICAgIGNvbXB1dGU6IHsgbW9kdWxlOiByZW5kZXJTaGFkZXIsIGVudHJ5UG9pbnQ6IFwiYnVpbGRfc3BlY2ltZW5cIiB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbnRlcm1lZGlhdGVUZXh0dXJlID0gdGhpcy5kZXZpY2UuY3JlYXRlVGV4dHVyZSh7XG4gICAgICBzaXplOiBbb3V0cHV0U2l6ZS53aWR0aCwgb3V0cHV0U2l6ZS5oZWlnaHRdLFxuICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5DT1BZX1NSQyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzXCIsXG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIC4uLnNoYXJlZExheW91dEVudHJpZXMsXG4gICAgICAgIHsgYmluZGluZzogMTEsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIHRleHR1cmU6IHsgc2FtcGxlVHlwZTogXCJmbG9hdFwiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxMiwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgc2FtcGxlcjogeyB0eXBlOiBcImZpbHRlcmluZ1wiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxNywgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7IHR5cGU6IFwidW5pZm9ybVwiIH0gfSxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgICAgIHN0b3JhZ2VUZXh0dXJlOiB7XG4gICAgICAgICAgICBhY2Nlc3M6IFwid3JpdGUtb25seVwiLFxuICAgICAgICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHRoaXMuYmluZEdyb3VwUG9zdFByb2Nlc3MgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IGBCaW5kIEdyb3VwIFBvc3QgUHJvY2Vzc2AsXG4gICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzLFxuICAgICAgZW50cmllczogW1xuICAgICAgICAuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLFxuICAgICAgICB7IGJpbmRpbmc6IDExLCByZXNvdXJjZTogc3BlY2ltZW5WaWV3IH0sXG4gICAgICAgIHsgYmluZGluZzogMTIsIHJlc291cmNlOiBkZXZpY2UuY3JlYXRlU2FtcGxlcih7IG1hZ0ZpbHRlcjogXCJsaW5lYXJcIiwgbWluRmlsdGVyOiBcImxpbmVhclwiIH0pIH0sXG4gICAgICAgIHsgYmluZGluZzogMTcsIHJlc291cmNlOiB7IGJ1ZmZlcjogdGhpcy52aWV3QnVmZmVyIH0gfSxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXRQb3N0UHJvY2VzcyA9IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcInBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3NcIixcbiAgICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2Vzc10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbXB1dGVSZW5kZXJQaXBlbGluZSA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgICBsYXlvdXQ6IHBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3MsXG4gICAgICBjb21wdXRlOiB7IG1vZHVsZTogcmVuZGVyU2hhZGVyLCBlbnRyeVBvaW50OiBcInJlbmRlclwiIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBzY3JlZW5TYW1wbGVyID0gdGhpcy5kZXZpY2UuY3JlYXRlU2FtcGxlcih7XG4gICAgICBtYWdGaWx0ZXI6IFwibmVhcmVzdFwiLFxuICAgICAgbWluRmlsdGVyOiBcIm5lYXJlc3RcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbmRlckJpbmRHcm91cExheW91dCA9IHRoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICBsYWJlbDogXCJSZW5kZXIgQmluZCBHcm91cCBMYXlvdXRcIixcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgeyBiaW5kaW5nOiAwLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCwgc2FtcGxlcjogeyB0eXBlOiBcIm5vbi1maWx0ZXJpbmdcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsIHRleHR1cmU6IHt9IH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJCaW5kR3JvdXAgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIEJpbmQgR3JvdXBcIixcbiAgICAgIGxheW91dDogcmVuZGVyQmluZEdyb3VwTGF5b3V0LFxuICAgICAgZW50cmllczogW1xuICAgICAgICB7IGJpbmRpbmc6IDAsIHJlc291cmNlOiBzY3JlZW5TYW1wbGVyIH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCkgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclBpcGVsaW5lID0gdGhpcy5kZXZpY2UuY3JlYXRlUmVuZGVyUGlwZWxpbmUoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIFBpcGVsaW5lXCIsXG4gICAgICBsYXlvdXQ6IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgICAgYmluZEdyb3VwTGF5b3V0czogW3RoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7IGVudHJpZXM6IFtdIH0pLCByZW5kZXJCaW5kR3JvdXBMYXlvdXRdLFxuICAgICAgfSksXG4gICAgICB2ZXJ0ZXg6IHtcbiAgICAgICAgbW9kdWxlOiByZW5kZXJTaGFkZXIsXG4gICAgICAgIGVudHJ5UG9pbnQ6IFwidmVydFwiLFxuICAgICAgfSxcbiAgICAgIGZyYWdtZW50OiB7XG4gICAgICAgIG1vZHVsZTogcmVuZGVyU2hhZGVyLFxuICAgICAgICBlbnRyeVBvaW50OiBcImZyYWdcIixcbiAgICAgICAgdGFyZ2V0czogW3sgZm9ybWF0OiB0aGlzLmNhbnZhc0Zvcm1hdCB9XSxcbiAgICAgIH0sXG4gICAgICBwcmltaXRpdmU6IHtcbiAgICAgICAgdG9wb2xvZ3k6IFwidHJpYW5nbGUtbGlzdFwiLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGNyZWF0ZVNwZWNpbWVuQmluZGluZ3MoZW50cmllczogR1BVQmluZEdyb3VwRW50cnlbXSwgZ2VvbWV0cnk6IEdQVUJ1ZmZlckJpbmRpbmcsIG91dHB1dDogR1BVVGV4dHVyZVZpZXcpIHtcbiAgICByZXR1cm4gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgIGxheW91dDogdGhpcy5zcGVjaW1lbkxheW91dCxcbiAgICAgIGVudHJpZXM6IFsuLi5lbnRyaWVzLCB7IGJpbmRpbmc6IDEzLCByZXNvdXJjZTogZ2VvbWV0cnkgfSwgeyBiaW5kaW5nOiAxNiwgcmVzb3VyY2U6IG91dHB1dCB9XSxcbiAgICB9KTtcbiAgfVxuICBlbmNvZGVTcGVjaW1lbihlbmNvZGVyOiBHUFVDb21tYW5kRW5jb2RlciwgZ3JvdXA6IEdQVUJpbmRHcm91cCkge1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHRoaXMuc3BlY2ltZW5QaXBlbGluZSk7XG4gICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgZ3JvdXApO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLnRoaXMuVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3MuZW5kKCk7XG4gIH1cblxuICBwdWJsaWMgcmVuZGVyKGNhbnZhc0NvbnRleHQ6IEdQVUNhbnZhc0NvbnRleHQsIHF1ZXJ5U2V0PzogR1BVUXVlcnlTZXQsIHJlc29sdmVCdWZmZXI/OiBHUFVCdWZmZXIsIHJlc3VsdEJ1ZmZlcj86IEdQVUJ1ZmZlcikge1xuICAgIC8vIFRoZSBzYW1lIGdsaWRlIGF0IGFueSBmcmFtZSByYXRlLlxuICAgIGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgZWFzZSA9IDEgLSBNYXRoLmV4cCgtTWF0aC5taW4oMC4yNSwgTWF0aC5tYXgoMC4wMDEsIChub3cgLSB0aGlzLnJlbmRlcmVkKSAvIDEwMDApKSAvIHRoaXMudmlldy5nbGlkZSk7XG4gICAgdGhpcy5yZW5kZXJlZCA9IG5vdztcbiAgICBpZiAodGhpcy52aWV3Lm1vZGUgJiYgdGhpcy52aWV3LmF1dG9GaXQpIHRoaXMudmlldy56b29tICs9IGVhc2UgKiAodGhpcy5maXR0ZWRab29tKCkgLSB0aGlzLnZpZXcuem9vbSk7XG4gICAgaWYgKHRoaXMudmlldy5tb2RlICYmIHRoaXMudmlldy5mb2xsb3cpIHtcbiAgICAgIHRoaXMuY2FtZXJhLnggKz0gZWFzZSAqICh0aGlzLmNhbWVyYVRhcmdldC54IC0gdGhpcy5jYW1lcmEueCk7XG4gICAgICB0aGlzLmNhbWVyYS55ICs9IGVhc2UgKiAodGhpcy5jYW1lcmFUYXJnZXQueSAtIHRoaXMuY2FtZXJhLnkpO1xuICAgIH1cbiAgICBjb25zdCB2aWV3RGF0YSA9IG5ldyBBcnJheUJ1ZmZlcig0OCksXG4gICAgICBmID0gbmV3IEZsb2F0MzJBcnJheSh2aWV3RGF0YSksXG4gICAgICB1ID0gbmV3IFVpbnQzMkFycmF5KHZpZXdEYXRhKTtcbiAgICBmLnNldChbdGhpcy5jYW1lcmEueCwgdGhpcy5jYW1lcmEueSwgdGhpcy52aWV3Lnpvb21dKTtcbiAgICB1WzNdID0gdGhpcy52aWV3Lm1vZGU7XG4gICAgZi5zZXQoW3RoaXMudmlldy5mb2N1cywgdGhpcy52aWV3LmNvbnRyYXN0LCB0aGlzLnZpZXcuY2hyb21hLCB0aGlzLnZpZXcuZ3JhaW5dLCA0KTtcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMub3V0cHV0U2NhbGUoKTtcbiAgICBmLnNldChbc2NhbGUueCwgc2NhbGUueSwgdGhpcy52aWV3LnByZXlTdGFpbl0sIDgpO1xuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKHRoaXMudmlld0J1ZmZlciwgMCwgdmlld0RhdGEpO1xuICAgIGNvbnN0IGNvbW1hbmRFbmNvZGVyID0gdGhpcy5kZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcblxuICAgIGlmICh0aGlzLnZpZXcubW9kZSAmJiB0aGlzLnByZXBhcmVzU3BlY2ltZW4pIHtcbiAgICAgIGNvbnN0IHNwZWNpbWVuUGFzcyA9IGNvbW1hbmRFbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICAgIHNwZWNpbWVuUGFzcy5zZXRQaXBlbGluZSh0aGlzLnNwZWNpbWVuUGlwZWxpbmUpO1xuICAgICAgc3BlY2ltZW5QYXNzLnNldEJpbmRHcm91cCgwLCB0aGlzLnNwZWNpbWVuQmluZEdyb3VwKTtcbiAgICAgIHNwZWNpbWVuUGFzcy5kaXNwYXRjaFdvcmtncm91cHMoLi4udGhpcy5URVhUVVJFX1dPUktHUk9VUF9DT1VOVCk7XG4gICAgICBzcGVjaW1lblBhc3MuZW5kKCk7XG4gICAgfVxuXG4gICAgLy8gMS4gTWFpbiBjb21wdXRlIHJlbmRlciBwYXNzXG4gICAgY29uc3QgcGFzc0NvbXB1dGUgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgcGFzc0NvbXB1dGUuc2V0UGlwZWxpbmUodGhpcy5jb21wdXRlUmVuZGVyUGlwZWxpbmUpO1xuICAgIHBhc3NDb21wdXRlLnNldEJpbmRHcm91cCgwLCB0aGlzLmJpbmRHcm91cFBvc3RQcm9jZXNzKTtcbiAgICBwYXNzQ29tcHV0ZS5kaXNwYXRjaFdvcmtncm91cHMoLi4udGhpcy5PVVRQVVRfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzQ29tcHV0ZS5lbmQoKTtcblxuICAgIC8vIDIuIE1haW4gcmVuZGVyIHBhc3NcbiAgICBjb25zdCByZW5kZXJQYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5SZW5kZXJQYXNzKHtcbiAgICAgIGNvbG9yQXR0YWNobWVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHZpZXc6IGNhbnZhc0NvbnRleHQuZ2V0Q3VycmVudFRleHR1cmUoKS5jcmVhdGVWaWV3KCksXG4gICAgICAgICAgbG9hZE9wOiBcImNsZWFyXCIsXG4gICAgICAgICAgY2xlYXJWYWx1ZTogeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAxIH0sXG4gICAgICAgICAgc3RvcmVPcDogXCJzdG9yZVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICByZW5kZXJQYXNzLnNldFBpcGVsaW5lKHRoaXMucmVuZGVyUGlwZWxpbmUpO1xuICAgIHJlbmRlclBhc3Muc2V0QmluZEdyb3VwKDEsIHRoaXMucmVuZGVyQmluZEdyb3VwKTtcbiAgICByZW5kZXJQYXNzLmRyYXcoNiwgMSwgMCwgMCk7XG4gICAgcmVuZGVyUGFzcy5lbmQoKTtcblxuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLnN1Ym1pdChbY29tbWFuZEVuY29kZXIuZmluaXNoKCldKTtcbiAgfVxuXG4gIC8vIFRoZSByZW5kZXJlZCBpbWFnZSBhcyBwaXhlbHMsIHJlYWQgYmFjayBmcm9tIHRoZSBHUFUuIFVubGlrZSBkcmF3aW5nIHRoZSBjYW52YXMgaW50b1xuICAvLyBhbm90aGVyIGNhbnZhcywgdGhpcyBkb2VzIG5vdCBkZXBlbmQgb24gaG93IHRoZSBicm93c2VyIHByZXNlbnRzIFdlYkdQVSBjYW52YXNlcy5cbiAgYXN5bmMgcmVhZFBpeGVscygpIHtcbiAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IHRoaXMub3V0cHV0LFxuICAgICAgYnl0ZXNQZXJSb3cgPSBNYXRoLmNlaWwoKHdpZHRoICogNCkgLyAyNTYpICogMjU2LFxuICAgICAgc3RhZ2luZyA9IHRoaXMuZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IGJ5dGVzUGVyUm93ICogaGVpZ2h0LCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW5jb2RlciA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICBlbmNvZGVyLmNvcHlUZXh0dXJlVG9CdWZmZXIoeyB0ZXh0dXJlOiB0aGlzLmludGVybWVkaWF0ZVRleHR1cmUgfSwgeyBidWZmZXI6IHN0YWdpbmcsIGJ5dGVzUGVyUm93IH0sIFt3aWR0aCwgaGVpZ2h0XSk7XG4gICAgICB0aGlzLmRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgIGF3YWl0IHN0YWdpbmcubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICAgIGNvbnN0IHBhZGRlZCA9IG5ldyBVaW50OEFycmF5KHN0YWdpbmcuZ2V0TWFwcGVkUmFuZ2UoKSksXG4gICAgICAgIGRhdGEgPSBuZXcgVWludDhDbGFtcGVkQXJyYXkod2lkdGggKiBoZWlnaHQgKiA0KTtcbiAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIGRhdGEuc2V0KHBhZGRlZC5zdWJhcnJheSh5ICogYnl0ZXNQZXJSb3csIHkgKiBieXRlc1BlclJvdyArIHdpZHRoICogNCksIHkgKiB3aWR0aCAqIDQpO1xuICAgICAgcmV0dXJuIG5ldyBJbWFnZURhdGEoZGF0YSwgd2lkdGgsIGhlaWdodCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN0YWdpbmcuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuIiwiLy8gQWN0dWFsIEdQVSBjaGVja3MgZm9yIHNlbGVjdGl2ZSByZW5ld2FsLCBnZW51aW5lIHRldGhlciBkd2VsbCwgYW5kIGEgcG9sYXJpdHlcbi8vIGRpcmVjdGlvbiB0aGF0IHN1cnZpdmVzIHRyYW5zbGF0aW9uLiBGcmVzaCBmaXh0dXJlIHBhZ2VzIG9ubHkuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGVzdFJlbmV3YWwoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXI7IGxpbmtzOiBHUFVCdWZmZXI7IHNuYXBzaG90OiBHUFVCdWZmZXIgfSxcbiAgY291bnRzOiB7IGFjdGluOiBudW1iZXI7IG1lbWJyYW5lOiBudW1iZXIgfSxcbiAgY29uZmlndXJlOiAodmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB2b2lkLFxuICBkaXNwYXRjaDogKGtpbmQ6IFwicG9sYXJpdHlcIiB8IFwidHVybm92ZXJcIiB8IFwidGV0aGVyXCIgfCBcIm1vdG9yXCIsIHJlcGVhdHM/OiBudW1iZXIpID0+IHZvaWRcbikge1xuICBjb25zdCBjaGVja3M6IHsgbmFtZTogc3RyaW5nOyBwYXNzZWQ6IGJvb2xlYW4gfVtdID0gW107XG4gIGNvbnN0IGFzc2VydCA9IChuYW1lOiBzdHJpbmcsIHBhc3NlZDogYm9vbGVhbikgPT4ge1xuICAgIGNoZWNrcy5wdXNoKHsgbmFtZSwgcGFzc2VkIH0pO1xuICAgIGlmICghcGFzc2VkKSB0aHJvdyBFcnJvcihgUmVuZXdhbCBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyLCBvZmZzZXQgPSAwLCBzaXplID0gYnVmZmVyLnNpemUpID0+IHtcbiAgICBjb25zdCBzdGFnZSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICBjb25zdCBlID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZS5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCBvZmZzZXQsIHN0YWdlLCAwLCBzaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgc3RhZ2UubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCBkYXRhID0gc3RhZ2UuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICBzdGFnZS51bm1hcCgpO1xuICAgIHN0YWdlLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgZnVuY3Rpb24gbWVtYnJhbmUoc2hpZnQgPSAwLCBhdENvbnRhY3QgPSBmYWxzZSkge1xuICAgIGNvbnN0IGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5tZW1icmFuZS5zaXplKSxcbiAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkoZGF0YSksXG4gICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgICBjb25zdCBhbmdsZSA9ICgyICogTWF0aC5QSSAqIGkpIC8gY291bnRzLm1lbWJyYW5lO1xuICAgICAgdVtpICogMTBdID0gaTtcbiAgICAgIHVbaSAqIDEwICsgNl0gPSAoaSArIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBmW2kgKiAxMCArIDJdID0gNTAgKyBzaGlmdCArIDQ1ICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgZltpICogMTAgKyAzXSA9IDUwICsgNDUgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICBmW2kgKiAxMCArIDhdID0gaTtcbiAgICB9XG4gICAgaWYgKGF0Q29udGFjdCkge1xuICAgICAgZlsyXSA9IDEyO1xuICAgICAgZlszXSA9IDUwO1xuICAgIH1cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgZGF0YSk7XG4gIH1cbiAgZnVuY3Rpb24gZmlsYW1lbnRzKGFnZTogbnVtYmVyLCBwb3NpdGlvbnMgPSBbMTAsIDE0LCA4NSwgODldKSB7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmFjdGluLnNpemUpLFxuICAgICAgdSA9IG5ldyBVaW50MzJBcnJheShkYXRhKSxcbiAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHVbaSAqIDEwXSA9IHVbaSAqIDEwICsgNl0gPSB1W2kgKiAxMCArIDddID0gaTtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgoeCwgaSkgPT4ge1xuICAgICAgdVtpICogMTAgKyA2XSA9IGkgPCAyID8gMCA6IDI7XG4gICAgICB1W2kgKiAxMCArIDddID0gaSA8IDIgPyAxIDogMztcbiAgICAgIGZbaSAqIDEwICsgMl0gPSB4O1xuICAgICAgZltpICogMTAgKyAzXSA9IDUwO1xuICAgICAgZltpICogMTAgKyA0XSA9IDE7XG4gICAgICBmW2kgKiAxMCArIDldID0gYWdlO1xuICAgIH0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBkYXRhKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICBtZW1icmFuZSgpO1xuICBmaWxhbWVudHMoMTAwMCk7XG4gIGNvbmZpZ3VyZSh7IHBvbGFyaXR5TW9kZTogMCwgY3VlRW5hYmxlZDogMCB9KTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgY29uZmlndXJlKHtcbiAgICBwb2xhcml0eU1vZGU6IDEsXG4gICAgY3VlRW5hYmxlZDogMSxcbiAgICBjdWVYOiAxMDAsXG4gICAgY3VlWTogNTAsXG4gICAgcG9sYXJpdHlUdXJuUmF0ZTogMC4wMixcbiAgICByZWFyVHVybm92ZXI6IDEsXG4gICAgdHVybm92ZXJBZ2U6IDEwLFxuICAgIGRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eTogMCxcbiAgICBkZWJyYW5jaFByb2JhYmlsaXR5OiAwLFxuICB9KTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgZGlzcGF0Y2goXCJ0dXJub3ZlclwiKTtcbiAgbGV0IHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcImFnZWQgcmVhciBmaWxhbWVudCByZXR1cm5zIHRvIEctYWN0aW5cIiwgdVs2XSA9PT0gMCAmJiB1WzddID09PSAwICYmIHVbMTZdID09PSAxICYmIHVbMTddID09PSAxKTtcbiAgYXNzZXJ0KFwic2FtZS1hZ2VkIGZyb250IGZpbGFtZW50IGlzIHByb3RlY3RlZFwiLCB1WzI3XSA9PT0gMyAmJiB1WzM2XSA9PT0gMik7XG4gIGNvbnN0IGJyYW5jaCA9IGZpbGFtZW50cygwKSxcbiAgICBidSA9IG5ldyBVaW50MzJBcnJheShicmFuY2gpLFxuICAgIGJmID0gbmV3IEZsb2F0MzJBcnJheShicmFuY2gpO1xuICBidVsyNl0gPSAwO1xuICBidVsyN10gPSAyO1xuICBiZlsyMl0gPSAxMjtcbiAgYmZbMjNdID0gNTI7XG4gIGJmWzI5XSA9IDEwMDA7XG4gIGJ1WzM2XSA9IDM7XG4gIGJ1WzM3XSA9IDM7XG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBicmFuY2gpO1xuICBkaXNwYXRjaChcInR1cm5vdmVyXCIpO1xuICB1ID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICBhc3NlcnQoXCJvbGQgb25lLWJlYWQgYnJhbmNoIHJldHVybnMgdG8gdGhlIHNvbHVibGUgcG9vbFwiLCB1WzI2XSA9PT0gMiAmJiB1WzI3XSA9PT0gMik7XG4gIGFzc2VydChcImJyYW5jaCByZW1vdmFsIGRvZXMgbm90IGN1dCB0aGUgbW90aGVyIGZpbGFtZW50XCIsIHVbN10gPT09IDEgJiYgdVsxNl0gPT09IDApO1xuICBmaWxhbWVudHMoMCk7XG4gIGRpc3BhdGNoKFwidHVybm92ZXJcIik7XG4gIHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcInlvdW5nIHJlYXIgbmV0d29yayBpcyBub3QgcHJlbWF0dXJlbHkgY2xlYXJlZFwiLCB1WzddID09PSAxICYmIHVbMTZdID09PSAwKTtcbiAgY29uc3QgYmVmb3JlID0gbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuc25hcHNob3QsIDMyICogKGNvdW50cy5hY3RpbiArIGNvdW50cy5tZW1icmFuZSArIDEpLCAzMikpO1xuICBtZW1icmFuZSgxMDApO1xuICBkaXNwYXRjaChcInBvbGFyaXR5XCIpO1xuICBjb25zdCBhZnRlciA9IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLnNuYXBzaG90LCAzMiAqIChjb3VudHMuYWN0aW4gKyBjb3VudHMubWVtYnJhbmUgKyAxKSwgMzIpKTtcbiAgYXNzZXJ0KFwicG9sYXJpdHkgdmVjdG9yIHBlcnNpc3RzIHVuZGVyIGNlbGwgdHJhbnNsYXRpb25cIiwgTWF0aC5hYnMoYmVmb3JlWzJdIC0gYWZ0ZXJbMl0pIDwgMWUtNiAmJiBNYXRoLmFicyhiZWZvcmVbM10gLSBhZnRlclszXSkgPCAxZS02ICYmIGFmdGVyWzJdID4gMC45OSk7XG4gIG1lbWJyYW5lKCk7XG4gIGRpc3BhdGNoKFwicG9sYXJpdHlcIik7XG4gIGNvbmZpZ3VyZSh7IG1vdG9yUmVhckJpYXM6IDEsIG15b3NpblN0cmVuZ3RoOiAwLjA1LCBteW9zaW5TcGVlZDogMC4wMiB9KTtcbiAgZm9yIChjb25zdCBbcG9zaXRpb25zLCBuYW1lLCBhY3RpdmVdIG9mIFtcbiAgICBbWzEwLCAxNCwgMjAsIDE2XSwgXCJtYXR1cmUgcmVhciBtb3RvciBwcm9kdWNlcyBjb250cmFjdGlvblwiLCB0cnVlXSxcbiAgICBbWzgwLCA4NCwgOTAsIDg2XSwgXCJtYXR1cmUgZnJvbnQgbW90b3Igc3RheXMgaW5hY3RpdmVcIiwgZmFsc2VdLFxuICBdIGFzIGNvbnN0KSB7XG4gICAgZmlsYW1lbnRzKDEwMDAsIFsuLi5wb3NpdGlvbnNdKTtcbiAgICBjb25zdCBsaW5rID0gbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgY291bnRzLm1lbWJyYW5lKSk7XG4gICAgbGluay5zZXQoWzEsIDMsIDAsIDEsIDEsIDAsIDMsIDJdKTtcbiAgICBuZXcgRmxvYXQzMkFycmF5KGxpbmsuYnVmZmVyKVsyXSA9IDU7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmspO1xuICAgIGRpc3BhdGNoKFwibW90b3JcIik7XG4gICAgY29uc3QgbW92ZWQgPSBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICAgIGFzc2VydChuYW1lLCBhY3RpdmUgPyBtb3ZlZFsyXSA+IHBvc2l0aW9uc1swXSAmJiBtb3ZlZFsyMl0gPCBwb3NpdGlvbnNbMl0gOiBtb3ZlZFsyXSA9PT0gcG9zaXRpb25zWzBdICYmIG1vdmVkWzIyXSA9PT0gcG9zaXRpb25zWzJdKTtcbiAgfVxuICBtZW1icmFuZSgwLCB0cnVlKTtcbiAgZmlsYW1lbnRzKDEwMDApO1xuICBjb25zdCBsaW5rID0gbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgY291bnRzLm1lbWJyYW5lKSk7XG4gIGxpbmsuc2V0KFsxLCAwLCAwLCA2MDAsIDEsIDAsIDAsIDBdLCAyNTYgKiA4KTtcbiAgbmV3IEZsb2F0MzJBcnJheShsaW5rLmJ1ZmZlcilbMjU2ICogOCArIDJdID0gMjtcbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmspO1xuICBjb25maWd1cmUoeyBtZW1icmFuZUNvdXBsaW5nOiAwLjA1LCB0ZXRoZXJUdXJub3ZlcjogMSwgdGV0aGVyT25SYXRlOiAxLCB0ZXRoZXJPZmZSYXRlOiAwLCB0ZXRoZXJMb2FkT2ZmOiAwLCB0ZXRoZXJSZWNvdmVyeVN0ZXBzOiA0MCB9KTtcbiAgZGlzcGF0Y2goXCJ0ZXRoZXJcIik7XG4gIGxldCBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwiZXhwaXJlZCB0ZXRoZXIgZW50ZXJzIGFuIHVuYm91bmQgZHdlbGxcIiwgbGlua3NbMjU2ICogOF0gPT09IDAgJiYgbGlua3NbMjU2ICogOCArIDNdID09PSA0MCk7XG4gIGRpc3BhdGNoKFwidGV0aGVyXCIpO1xuICBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwidGV0aGVyIGRvZXMgbm90IHJlYmluZCBvbiB0aGUgbmV4dCBzdGVwXCIsIGxpbmtzWzI1NiAqIDhdID09PSAwICYmIGxpbmtzWzI1NiAqIDggKyAzXSA9PT0gMzkpO1xuICBkaXNwYXRjaChcInRldGhlclwiLCA0MCk7XG4gIGxpbmtzID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5saW5rcykpO1xuICBhc3NlcnQoXCJ0ZXRoZXIgY2FuIHJlYmluZCBhZnRlciBpdHMgZHdlbGxcIiwgbGlua3NbMjU2ICogOF0gPiAwKTtcbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzKGRldmljZTogR1BVRGV2aWNlLCBtb2R1bGU6IEdQVVNoYWRlck1vZHVsZSwgbGF5b3V0OiBHUFVQaXBlbGluZUxheW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc29sdmVDdWU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc29sdmVfZnJvbnRfY3VlXCIgfSB9KSxcbiAgICBkcmF3Q3VlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJkcmF3X3Jlc29sdmVkX2N1ZVwiIH0gfSksXG4gICAgbWVhc3VyZUVuY2xvc3VyZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibWVhc3VyZV9lbmNsb3N1cmVcIiB9IH0pLFxuICAgIGJ1aWxkRW5jbG9zdXJlUm93czogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYnVpbGRfZW5jbG9zdXJlX3Jvd3NcIiB9IH0pLFxuICAgIGRyYXdSZXNlcnZvaXI6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfcmVzZXJ2b2lyX2NvbXBhcnRtZW50XCIgfSB9KSxcbiAgICBwcm9qZWN0RW5jbG9zdXJlQXJlYTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicHJvamVjdF9lbmNsb3N1cmVfYXJlYVwiIH0gfSksXG4gICAgY29udGFpbkZpbGFtZW50UG9pbnRzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJjb250YWluX2ZpbGFtZW50X3BvaW50c1wiIH0gfSksXG4gICAgY29udGFpbkZpbGFtZW50Qm9uZHM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNvbnRhaW5fZmlsYW1lbnRfYm9uZHNcIiB9IH0pLFxuICAgIHNuYXBzaG90TWVjaGFuaWNzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJzbmFwc2hvdF9tZWNoYW5pY3NcIiB9IH0pLFxuICAgIG1vdG9yTGlua3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1vdG9yX2xpbmtzXCIgfSB9KSxcbiAgICBtZW1icmFuZVRldGhlcnM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RldGhlcnNcIiB9IH0pLFxuICAgIGFwcGx5TWVjaGFuaWNhbEZvcmNlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYXBwbHlfbWVjaGFuaWNhbF9mb3JjZXNcIiB9IH0pLFxuICAgIGRyYXdNZWNoYW5pY2FsTGlua3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfbWVjaGFuaWNhbF9saW5rc1wiIH0gfSksXG4gICAgbGluZUNvbnN0cmFpbnQ6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImxpbmVfY29uc3RyYWludF91cGRhdGVzXCIgfSB9KSxcbiAgICBtZW1icmFuZVRhbmdlbnRpYWxGbG93OiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtZW1icmFuZV90YW5nZW50aWFsX2Zsb3dcIiB9IH0pLFxuICAgIG9yaWVudGF0aW9uVXBkYXRlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJvcmllbnRhdGlvbl91cGRhdGVzXCIgfSB9KSxcbiAgICBjb3NzZXJhdFVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiY29zc2VyYXRfdXBkYXRlc1wiIH0gfSksXG4gICAgcmVzZXRBY3RpbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicmVzZXRfYWN0aW5cIiB9IH0pLFxuICAgIHJlc2V0TWVtYnJhbmU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc2V0X21lbWJyYW5lXCIgfSB9KSxcbiAgICBzdGVyaWNGb3JjZVVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwic3RlcmljX2ZvcmNlX3VwZGF0ZXNcIiB9IH0pLFxuICAgIGFjdGluQmluZDogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYmluZF9hY3Rpbl9tb25vbWVyXCIgfSB9KSxcbiAgICBhY3RpblBvbHltZXJQb3NpdGlvbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidXBkYXRlX2FjdGluX3BvbHltZXJfcG9zaXRpb25cIiB9IH0pLFxuICAgIGFjdGluTW9ub21lclBvc2l0aW9uOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfYWN0aW5fbW9ub21lcl9wb3NpdGlvblwiIH0gfSksXG4gICAgdW5iaW5kTWluUG9sZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidW5iaW5kX21pbl9wb2xlXCIgfSB9KSxcbiAgICBtZW1icmFuZVRvVGV4dHVyZXM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RvX3RleHR1cmVzXCIgfSB9KSxcbiAgICBhY3RpbmVzVG9UZXh0dXJlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYWN0aW5lc190b190ZXh0dXJlc1wiIH0gfSksXG4gICAgY2xlYXJSZW5kZXJMYXllcnM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNsZWFyX3JlbmRlcl9sYXllcnNcIiB9IH0pLFxuICAgIHVwZGF0ZVRleHR1cmVzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfdGV4dHVyZXNcIiB9IH0pLFxuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaChwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIsIHBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmUsIHg6IG51bWJlciwgeSA9IDEpIHtcbiAgcGFzcy5zZXRQaXBlbGluZShwaXBlbGluZSk7XG4gIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKHgsIHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuU2ltdWxhdGlvblN0ZXAoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgd29ya2dyb3VwQ291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgdGV4dHVyZVdvcmtncm91cENvdW50OiBbbnVtYmVyLCBudW1iZXJdLFxuICBsaW5lQ29uc3RyYWludEZ1bmN0aW9uOiAocGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyKSA9PiB2b2lkLFxuICBmcmFtZU5yOiBudW1iZXIsXG4gIGlzTGFzdFN0ZXBPZkZyYW1lOiBib29sZWFuLFxuICBlbmNsb3N1cmUgPSBmYWxzZSxcbiAgcGVyc2lzdGVudFBvbGFyaXR5ID0gZmFsc2UsXG4gIHF1ZXJ5SW5mbz86IHsgcXVlcnlTZXQ6IEdQVVF1ZXJ5U2V0OyBpc0ZpcnN0U3RlcDogYm9vbGVhbiB9LFxuICBleHRlbnNpb25zPzoge1xuICAgIGdyb3d0aDogR1BVQ29tcHV0ZVBpcGVsaW5lO1xuICAgIGZvcmNlczogR1BVQ29tcHV0ZVBpcGVsaW5lO1xuICAgIG51Y2xldXM6IHsgbWVhc3VyZTogR1BVQ29tcHV0ZVBpcGVsaW5lOyBleGNsdWRlOiBHUFVDb21wdXRlUGlwZWxpbmU7IHJlc3RvcmU6IEdQVUNvbXB1dGVQaXBlbGluZTsgY2xlYXI6IEdQVUNvbXB1dGVQaXBlbGluZSB9O1xuICB9XG4pIHtcbiAgLy8gT25lIHN1Ym1pc3Npb24gcGVyIGZpeGVkIHN0ZXAuIERpc3BhdGNoIG9yZGVyIGFuZCBpdGVyYXRpb24gY291bnRzIGFyZVxuICAvLyB1bmNoYW5nZWQ7IGRpc3BhdGNoIGJvdW5kYXJpZXMgcmV0YWluIHN0b3JhZ2UgZGVwZW5kZW5jaWVzLiBVbmlmb3JtIHdyaXRlc1xuICAvLyByZW1haW4gQkVGT1JFIGVhY2ggc3RlcCBzdWJtaXNzaW9uLCBzbyBzcHJvdXRzIGFyZSBub3Qgb3ZlcndyaXR0ZW4gYnkgdGhlXG4gIC8vIGxhc3Qgc3RlcCdzIHZhbHVlcyB3aGVuIHNldmVyYWwgZml4ZWQgc3RlcHMgc2hhcmUgYW4gYW5pbWF0aW9uIGZyYW1lLlxuICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3Moe1xuICAgIC4uLihxdWVyeUluZm8/LmlzRmlyc3RTdGVwICYmIHtcbiAgICAgIHRpbWVzdGFtcFdyaXRlczoge1xuICAgICAgICBxdWVyeVNldDogcXVlcnlJbmZvLnF1ZXJ5U2V0LFxuICAgICAgICBiZWdpbm5pbmdPZlBhc3NXcml0ZUluZGV4OiAwLFxuICAgICAgICBlbmRPZlBhc3NXcml0ZUluZGV4OiAxLFxuICAgICAgfSxcbiAgICB9KSxcbiAgfSk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG5cbiAgaWYgKHBlcnNpc3RlbnRQb2xhcml0eSkgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1lYXN1cmVFbmNsb3N1cmUsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMucmVzb2x2ZUN1ZSwgMSk7XG5cbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lKSB7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNsZWFyUmVuZGVyTGF5ZXJzLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICB9XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zdGVyaWNGb3JjZVVwZGF0ZSwgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FKTtcbiAgbGluZUNvbnN0cmFpbnRGdW5jdGlvbihwYXNzKTtcbiAgLy8gVGhlIG51Y2xldXMgZGlzYyBpcyBhbHNvIHJlc3RvcmVkIGJlZm9yZSB0aGUgZmlyc3QgY29udGFpbm1lbnQgb2YgdGhlIHN0ZXAsXG4gIC8vIHNvIHRoYXQgdGhlIGFjdGluIGlzIGhlbGQgYWdhaW5zdCBhIGRpc2MgYW5kIG5vdCBhZ2FpbnN0IHN0ZXJpYyBkZW50cy5cbiAgaWYgKGV4dGVuc2lvbnMpIHtcbiAgICBkaXNwYXRjaChwYXNzLCBleHRlbnNpb25zLm51Y2xldXMubWVhc3VyZSwgMSk7XG4gICAgZGlzcGF0Y2gocGFzcywgZXh0ZW5zaW9ucy5udWNsZXVzLnJlc3RvcmUsIDEpO1xuICB9XG4gIGlmIChlbmNsb3N1cmUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbCgodGV4dHVyZVdvcmtncm91cENvdW50WzFdICogMTYpIC8gKDQgKiAyNTYpKSk7XG4gIGlmIChleHRlbnNpb25zKSBkaXNwYXRjaChwYXNzLCBleHRlbnNpb25zLmdyb3d0aCwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpbkJpbmQsIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpblBvbHltZXJQb3NpdGlvbiwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFjdGluTW9ub21lclBvc2l0aW9uLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMudW5iaW5kTWluUG9sZSwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgaWYgKGVuY2xvc3VyZSkgZW5jb2RlRW5jbG9zdXJlKHBhc3MsIHBpcGVsaW5lcywgd29ya2dyb3VwQ291bnRzLCB0ZXh0dXJlV29ya2dyb3VwQ291bnRbMV0gKiAxNik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZW1icmFuZVRvVGV4dHVyZXMsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpbmVzVG9UZXh0dXJlcywgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnVwZGF0ZVRleHR1cmVzLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICBjb25zdCBtZWNoYW5pY2FsQ291bnQgPSB3b3JrZ3JvdXBDb3VudHMuQUNUSU4gKyB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkU7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgbWVjaGFuaWNhbENvdW50KTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1vdG9yTGlua3MsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVtYnJhbmVUZXRoZXJzLCB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkUpO1xuICBpZiAoZXh0ZW5zaW9ucykge1xuICAgIGRpc3BhdGNoKHBhc3MsIGV4dGVuc2lvbnMuZm9yY2VzLCAxKTtcbiAgICBkaXNwYXRjaChwYXNzLCBleHRlbnNpb25zLm51Y2xldXMubWVhc3VyZSwgMSk7XG4gICAgZGlzcGF0Y2gocGFzcywgZXh0ZW5zaW9ucy5udWNsZXVzLmV4Y2x1ZGUsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIH1cbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFwcGx5TWVjaGFuaWNhbEZvcmNlcywgbWVjaGFuaWNhbENvdW50KTtcbiAgLy8gVGhlIG51Y2xldXMgZGlzYyBpcyByZXN0b3JlZCBhZnRlciBldmVyeSBwYXNzIHRoYXQgbW92ZXMgbWVtYnJhbmUgYnkgdmVydGV4LlxuICAvLyBUaGUgYXJlYSBwcm9qZWN0aW9uIHRoYXQgZm9sbG93cyBzY2FsZXMgaXQgYXMgYSB3aG9sZSwgc28gaXQgc3RheXMgYSBkaXNjLFxuICAvLyBhbmQgdGhlIGFyZWEgYW5kIGFjdGluIGNvbnRhaW5tZW50IHRoZW4gc2VlIHRoZSBmaW5hbCBtZW1icmFuZSBvZiB0aGUgc3RlcC5cbiAgaWYgKGV4dGVuc2lvbnMpIHtcbiAgICBkaXNwYXRjaChwYXNzLCBleHRlbnNpb25zLm51Y2xldXMubWVhc3VyZSwgMSk7XG4gICAgZGlzcGF0Y2gocGFzcywgZXh0ZW5zaW9ucy5udWNsZXVzLnJlc3RvcmUsIDEpO1xuICAgIGRpc3BhdGNoKHBhc3MsIGV4dGVuc2lvbnMubnVjbGV1cy5jbGVhciwgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FKTtcbiAgfVxuICBpZiAoZW5jbG9zdXJlKSBlbmNvZGVFbmNsb3N1cmUocGFzcywgcGlwZWxpbmVzLCB3b3JrZ3JvdXBDb3VudHMsIHRleHR1cmVXb3JrZ3JvdXBDb3VudFsxXSAqIDE2KTtcbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lKSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuZHJhd01lY2hhbmljYWxMaW5rcywgMSArIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSAmJiBlbmNsb3N1cmUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3UmVzZXJ2b2lyLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICBpZiAoaXNMYXN0U3RlcE9mRnJhbWUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3Q3VlLCAxKTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuRW5jbG9zdXJlKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgYmluZEdyb3VwOiBHUFVCaW5kR3JvdXAsXG4gIGNvdW50czogeyBBQ1RJTjogbnVtYmVyOyBNRU1CUkFORTogbnVtYmVyIH0sXG4gIGhlaWdodDogbnVtYmVyXG4pIHtcbiAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG4gIGVuY29kZUVuY2xvc3VyZShwYXNzLCBwaXBlbGluZXMsIGNvdW50cywgaGVpZ2h0KTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG4vLyBGcm96ZW4tdGltZSBjb3JyZWN0aW9uOiBubyByZWFjdGlvbnMsIGFnZXMsIG1vdG9ycywgbWVtYnJhbmUgbW90aW9uIG9yIGFyZWFcbi8vIHByb2plY3Rpb24uIFRoZSBjYWxsZXIgdmVyaWZpZXMgdGhlIGZ1bGwgc3RhdGUgYWZ0ZXIgZWFjaCBib3VuZGVkIGJhdGNoLlxuZXhwb3J0IGZ1bmN0aW9uIHJ1bkNvbnRhY3RSZXBhaXIoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXIsXG4gIGl0ZXJhdGlvbnM6IG51bWJlclxuKSB7XG4gIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKSxcbiAgICBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbChoZWlnaHQgLyAoNCAqIDI1NikpKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50UG9pbnRzLCBjb3VudHMuQUNUSU4pO1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgY291bnRzLkFDVElOICsgY291bnRzLk1FTUJSQU5FKTtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50Qm9uZHMsIGNvdW50cy5BQ1RJTik7XG4gIH1cbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG5mdW5jdGlvbiBlbmNvZGVFbmNsb3N1cmUoXG4gIHBhc3M6IEdQVUNvbXB1dGVQYXNzRW5jb2RlcixcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXJcbikge1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5wcm9qZWN0RW5jbG9zdXJlQXJlYSwgY291bnRzLk1FTUJSQU5FKTtcbiAgLy8gUmVmcmVzaCB0aGUgbWVhc3VyZWQgYXJlYSBhZnRlciBwcm9qZWN0aW9uIGZvciB0aGUgbmV4dCByZWFjdGlvbiBzdGVwLlxuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbChoZWlnaHQgLyAoNCAqIDI1NikpKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgMjsgaXRlcmF0aW9uKyspIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIGNvdW50cy5BQ1RJTiArIGNvdW50cy5NRU1CUkFORSk7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudEJvbmRzLCBjb3VudHMuQUNUSU4pO1xuICB9XG59XG4iLCIvLyBTY2hlZHVsZXMgc2hvcnQtbGl2ZWQgcG9seW1lcml6YXRpb24gc2l0ZXMgb24gdGhlIG1lbWJyYW5lLCBzbyBsb2NhbCBwcm90cnVzaW9ucyBzcHJvdXQgYW5kIHJldHJhY3QuXG4vLyBFYWNoIHNsb3QgYWx0ZXJuYXRlcyBiZXR3ZWVuIG9uIChhIHNpdGUgYXQgYSBmaXhlZCBtZW1icmFuZSBwb3NpdGlvbikgYW5kIG9mZiwgd2l0aCByYW5kb20gZHVyYXRpb25zLFxuLy8gc28gdGhlIG51bWJlciBvZiBhY3RpdmUgc2l0ZXMgZmx1Y3R1YXRlcy4gT2Zmc2V0cyBsYW5kIGluIHRoZSBmcm9udCAzMCU7IHRoZVxuLy8gR1BVIG1hcHMgdGhlbSBpbnRvIHRoZSBzZWxlY3RlZCBwb2xhcml0eSBmcmFtZSB3aXRob3V0IGV4dHJhIFJORyBkcmF3cy5cblxuZXhwb3J0IGNvbnN0IE1BWF9TUFJPVVRfU0lURVMgPSA4O1xuLy8gaGFsZiBvZiB0aGUgZnJvbnQgcmVnaW9uIHdoZXJlIHNpdGVzIGNhbiBsYW5kLCBpbiBub3JtYWxpemVkIGFyYyBsZW5ndGggKDAuMTUgPSBmcm9udCAzMCUgb2YgdGhlIG1lbWJyYW5lKVxuY29uc3QgRlJPTlRfSEFMRl9XSURUSCA9IDAuMTU7XG5cbnR5cGUgU2xvdCA9IHsgY2VudGVyOiBudW1iZXI7IG9uVW50aWw6IG51bWJlcjsgb2ZmVW50aWw6IG51bWJlciB9O1xuXG5leHBvcnQgY2xhc3MgU3Byb3V0U2NoZWR1bGVyIHtcbiAgcHJpdmF0ZSBzbG90czogU2xvdFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhZ2dlclN0ZXBzOiBudW1iZXIsXG4gICAgcHJpdmF0ZSByYW5kb20gPSBNYXRoLnJhbmRvbVxuICApIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1BWF9TUFJPVVRfU0lURVM7IGkrKykge1xuICAgICAgLy8gc3RhZ2dlciB0aGUgZmlyc3Qgc3dpdGNoLW9uIG92ZXIgYSB3aG9sZSBvbi9vZmYgY3ljbGUgc28gdGhlIHNpdGVzIGRvbid0IGFsbCBzdGFydCB0b2dldGhlclxuICAgICAgdGhpcy5zbG90cy5wdXNoKHsgY2VudGVyOiAwLCBvblVudGlsOiAwLCBvZmZVbnRpbDogdGhpcy5yYW5kb20oKSAqIHN0YWdnZXJTdGVwcyB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBXcml0ZXMgW2NlbnRlciAobm9ybWFsaXplZCBhcmMgbGVuZ3RoKSwgaGFsZldpZHRoIChub2RlcyksIHN0cmVuZ3RoLCAwXSBwZXIgc2xvdCBpbnRvIGBvdXRgLlxuICB1cGRhdGUoXG4gICAgc3RlcDogbnVtYmVyLFxuICAgIHBhcmFtczogeyBzcHJvdXRDb3VudDogbnVtYmVyOyBzcHJvdXRXaWR0aDogbnVtYmVyOyBzcHJvdXRGcm9udEJpYXM6IG51bWJlcjsgc3Byb3V0T25TdGVwczogbnVtYmVyOyBzcHJvdXRPZmZTdGVwczogbnVtYmVyIH0sXG4gICAgb3V0OiBGbG9hdDMyQXJyYXlcbiAgKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNQVhfU1BST1VUX1NJVEVTOyBpKyspIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLnNsb3RzW2ldO1xuICAgICAgaWYgKHN0ZXAgPj0gc2xvdC5vZmZVbnRpbCAmJiBzdGVwID49IHNsb3Qub25VbnRpbCkge1xuICAgICAgICBzbG90LmNlbnRlciA9IHNhbXBsZUNlbnRlcihwYXJhbXMuc3Byb3V0RnJvbnRCaWFzLCB0aGlzLnJhbmRvbSk7XG4gICAgICAgIHNsb3Qub25VbnRpbCA9IHN0ZXAgKyBwYXJhbXMuc3Byb3V0T25TdGVwcyAqICgwLjUgKyB0aGlzLnJhbmRvbSgpKTtcbiAgICAgICAgc2xvdC5vZmZVbnRpbCA9IHNsb3Qub25VbnRpbCArIHBhcmFtcy5zcHJvdXRPZmZTdGVwcyAqICgwLjUgKyB0aGlzLnJhbmRvbSgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFjdGl2ZSA9IGkgPCBwYXJhbXMuc3Byb3V0Q291bnQgJiYgc3RlcCA8IHNsb3Qub25VbnRpbDtcbiAgICAgIG91dC5zZXQoW3Nsb3QuY2VudGVyLCBwYXJhbXMuc3Byb3V0V2lkdGggKiAwLjUsIGFjdGl2ZSA/IDEgOiAwLCAwXSwgaSAqIDQpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBOZWFyIHRoZSBmcm9udCAoYXJjIGxlbmd0aCAwKSB3aXRoIHByb2JhYmlsaXR5IGBmcm9udEJpYXNgLCBhbnl3aGVyZSBpbiB0aGUgZnJvbnQgcmVnaW9uIG90aGVyd2lzZS5cbmZ1bmN0aW9uIHNhbXBsZUNlbnRlcihmcm9udEJpYXM6IG51bWJlciwgcmFuZG9tOiAoKSA9PiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgb2Zmc2V0ID0gKHJhbmRvbSgpIC0gMC41KSAqIDIgKiBGUk9OVF9IQUxGX1dJRFRIO1xuICBpZiAocmFuZG9tKCkgPCBmcm9udEJpYXMpIHtcbiAgICBjb25zdCBnYXVzc2lhbiA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKDEgLSByYW5kb20oKSkpICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiByYW5kb20oKSk7XG4gICAgb2Zmc2V0ID0gTWF0aC5tYXgoLUZST05UX0hBTEZfV0lEVEgsIE1hdGgubWluKEZST05UX0hBTEZfV0lEVEgsIGdhdXNzaWFuICogMC4wOCkpO1xuICB9XG4gIHJldHVybiAob2Zmc2V0ICsgMSkgJSAxO1xufVxuIiwiLy8gUHVyZSBmdWxsLXNuYXBzaG90IGRpYWdub3N0aWNzLiBSdW5zIGluIHRoZSBib3VuZGVkIHdvcmtlciwgd2l0aCBubyBET00gb3Jcbi8vIEdQVSBhY2Nlc3MuIEdlb21ldHJ5IGNoZWNrcywgdG9wb2xvZ3kgd2Fsa3MgYW5kIGNvdW50ZXIgc2VtYW50aWNzIGFyZSBzaGFyZWRcbi8vIGJ5IGxpdmUgZGlhZ25vc3RpY3MgYW5kIGV2ZXJ5IGZvcmNlZCBzY2llbnRpZmljLWFzc2F5IGNoZWNrcG9pbnQuXG5pbXBvcnQgeyBwb2x5Z29uT2NjdXBhbmN5LCBwb2x5Z29uQm9uZENyb3NzaW5nLCBwb2x5Z29uTG9vcHMgfSBmcm9tIFwiLi9vY2N1cGFuY3lcIjtcblxuY29uc3QgU0VHTUVOVF9XT1JEUyA9IDEwOyAvLyBpZCwgc3VidHlwZSwgcG9zaXRpb24oMiksIG9yaWVudGF0aW9uKDIpLCB0YWlsLCBoZWFkLCBhcmNfbGVuZ3RoLCBhZ2VcbmNvbnN0IFRBSUwgPSA2O1xuY29uc3QgSEVBRCA9IDc7XG5cbi8vIG11c3QgbWF0Y2ggdGhlIFRFTEVNRVRSWV8qIGluZGljZXMgaW4gc2ltdWxhdGUud2dzbFxuZXhwb3J0IGNvbnN0IFRFTEVNRVRSWV9DT1VOVEVSUyA9IFtcbiAgXCJjYW5kaWRhdGVzXCIsIC8vIGZyZWUgbW9ub21lcnMgaW4gdGhlIHBvbHltZXJpemF0aW9uIGZpZWxkXG4gIFwibmVpZ2hib3JGb3VuZFwiLCAvLyAuLi4gdGhhdCBzYXcgYW4gYXZhaWxhYmxlIGhlYWQgb3IgbW9ub21lciBuZWFyYnlcbiAgXCJwYXNzZWRQcm9iXCIsIC8vIC4uLiBhbmQgcGFzc2VkIHRoZSBiaW5kIHByb2JhYmlsaXR5XG4gIFwiYm91bmRcIiwgLy8gLi4uIGFuZCB3b24gYm90aCBsb2Nrc1xuICBcInVuYm91bmRcIiwgLy8gbWludXMtZW5kIGRlcG9seW1lcml6YXRpb25zXG4gIFwiZWxvbmdhdGVkXCIsIC8vIGJpbmRzIG9udG8gYW4gZXhpc3RpbmcgZmlsYW1lbnQncyBwbHVzIGVuZCAoYm91bmQgbWludXMgZWxvbmdhdGVkID0gbmV3IGRpbWVycylcbiAgXCJoZWFkc0luRmllbGRcIiwgLy8gcGx1cyBlbmRzIGluIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZCwgaS5lLiBhYmxlIHRvIGVsb25nYXRlXG4gIFwiaGVhZEZvdW5kXCIsIC8vIGNhbmRpZGF0ZXMgdGhhdCBzYXcgc3VjaCBhIHBsdXMgZW5kIG5lYXJieVxuICBcImJyYW5jaGVkXCIsIC8vIG5ldyBicmFuY2hlcyBudWNsZWF0ZWQgb24gdGhlIHNpZGUgb2YgYSBmaWxhbWVudCAobGFtZWxsaXBvZGl1bSBmaWVsZClcbiAgXCJkZWJyYW5jaGVkXCIsIC8vIGJyYW5jaGVzIHRoYXQgY2FtZSBvZmYgdGhlaXIgbW90aGVyXG4gIFwicG9pbnRDb250YWN0c1wiLFxuICBcImJvbmRDb250YWN0c1wiLFxuICBcInJlYXJNaW51c0xvc3NcIixcbiAgXCJmcm9udE1pbnVzTG9zc1wiLFxuICBcInJlYXJQbHVzTG9zc1wiLFxuICBcInRldGhlclJlbGVhc2VkXCIsXG5dIGFzIGNvbnN0O1xuXG50eXBlIENvdW50ZXJzID0gUmVjb3JkPCh0eXBlb2YgVEVMRU1FVFJZX0NPVU5URVJTKVtudW1iZXJdLCBudW1iZXI+O1xuXG5leHBvcnQgdHlwZSBBY3RpblN0YXRzID0ge1xuICBydW46IHN0cmluZztcbiAgZnJhbWU6IG51bWJlcjtcbiAgc3RlcDogbnVtYmVyO1xuICBhY3RpbkNvdW50OiBudW1iZXI7XG4gIG1vbm9tZXJzOiBudW1iZXI7XG4gIGZpbGFtZW50czogbnVtYmVyO1xuICBicmFuY2hlczogbnVtYmVyOyAvLyBmaWxhbWVudHMgaGFuZ2luZyBvZmYgdGhlIHNpZGUgb2YgYW5vdGhlciBvbmVcbiAgaW5Qb2x5bWVyOiBudW1iZXI7XG4gIHBvc3RlcmlvclBvbHltZXJCZWFkczogbnVtYmVyOyAvLyBsZWdhY3kgbWFya2VyLXggaGFsZiwgbm90IHRoZSBjdXJyZW50IGdlb21ldHJpYyBwb2xhcml0eSBmcmFtZVxuICBpbnNpZGVQb2x5bWVyQmVhZHM6IG51bWJlcjtcbiAgaW5zaWRlTW9ub21lckJlYWRzOiBudW1iZXI7XG4gIGdBY3Rpbk1vZGU6IFwid2VsbC1taXhlZFwiIHwgXCJwYXJ0aWNsZXNcIjtcbiAgZ0FjdGluQW1vdW50OiBudW1iZXI7XG4gIGdBY3RpbkNvbmNlbnRyYXRpb246IG51bWJlcjtcbiAgYWN0aW5CYWxhbmNlRXJyb3I6IG51bWJlcjtcbiAgY3Jvc3NpbmdGaWxhbWVudEJvbmRzOiBudW1iZXI7XG4gIG1lYW5Qb2x5bWVyQWdlOiBudW1iZXI7XG4gIG1heFBvbHltZXJBZ2U6IG51bWJlcjtcbiAgbWVhbkxlbmd0aDogbnVtYmVyO1xuICBtZWRpYW5MZW5ndGg6IG51bWJlcjtcbiAgcDkwTGVuZ3RoOiBudW1iZXI7XG4gIG1heExlbmd0aDogbnVtYmVyO1xuICAvLyBmaWxhbWVudCBjb3VudHMgcGVyIGxlbmd0aCBiaW46IDIsIDMtNCwgNS04LCA5LTE2LCAxNy0zMiwgMzMtNjQsIDY1K1xuICBoaXN0b2dyYW06IG51bWJlcltdO1xuICBtZWRpYW5Cb25kTGVuZ3RoOiBudW1iZXI7IC8vIGluIHVuaXRzIG9mIHRoZSBhY3RpbiByZXN0IGxlbmd0aFxuICBtZWRpYW5CZW5kQW5nbGU6IG51bWJlcjsgLy8gZGVncmVlcyBiZXR3ZWVuIGNvbnNlY3V0aXZlIGJvbmRzIG9mIGEgZmlsYW1lbnQ7IGxvdyA9IHN0aWZmXG4gIGJyb2tlbkxpbmtzOiBudW1iZXI7IC8vIGEuaGVhZCA9IGIgYnV0IGIudGFpbCAhPSBhXG4gIGN5Y2xlczogbnVtYmVyO1xuICBwZXJTdGVwOiBDb3VudGVyczsgLy8gZXZlbnQgcmF0ZXMgc2luY2UgdGhlIHByZXZpb3VzIHNhbXBsZVxuICBjZWxsOiBDZWxsU2hhcGU7XG4gIGRpYWdub3N0aWNLaW5kPzogXCJzaW11bGF0aW9uXCIgfCBcImNvbnRhY3QtcmVjaGVja1wiO1xufTtcblxuLy8gbWVtYnJhbmUgc2hhcGUgaW4gcGl4ZWxzOyBub2RlIDAgaXMgdGhlIGZyb250ICh0aGUgcmlnaHQgc2lkZSBhdCByZXNldCksIG5vZGUgY291bnQgLyAyIHRoZSByZWFyXG5leHBvcnQgdHlwZSBDZWxsU2hhcGUgPSB7XG4gIGxlZnQ6IG51bWJlcjsgLy8gbGVmdG1vc3QgbWVtYnJhbmUgeFxuICByaWdodDogbnVtYmVyOyAvLyByaWdodG1vc3QgbWVtYnJhbmUgeFxuICB0b3A6IG51bWJlcjtcbiAgYm90dG9tOiBudW1iZXI7XG4gIGZyb250WDogbnVtYmVyO1xuICByZWFyWDogbnVtYmVyO1xuICBjZW50cm9pZFg6IG51bWJlcjtcbiAgY2VudHJvaWRZOiBudW1iZXI7XG4gIGxlbmd0aDogbnVtYmVyOyAvLyBmcm9udCBub2RlIHRvIHJlYXIgbm9kZVxuICBhcmVhOiBudW1iZXI7IC8vIHJlbGF0aXZlIHRvIHRoZSBhcmVhIGF0IHJlc2V0XG4gIC8vIG1lYW4gbWVtYnJhbmUgZWRnZSBsZW5ndGggaW4gdW5pdHMgb2YgdGhlIHJlc3QgbGVuZ3RoLCBvdmVyIHRoZSBxdWFydGVyIG9mIHRoZSBub2RlcyBhcm91bmQgdGhlIGZyb250IGFuZCB0aGUgcmVhclxuICBmcm9udFNwYWNpbmc6IG51bWJlcjtcbiAgcmVhclNwYWNpbmc6IG51bWJlcjtcbiAgbG9vcHM6IG51bWJlcjsgLy8gY2xvc2VkIGxvb3BzIGZvdW5kIGJ5IGZvbGxvd2luZyB0YWlsIGxpbmtzIGZyb20gdW52aXNpdGVkIHZlcnRpY2VzXG4gIG1lbWJyYW5lQnJva2VuTGlua3M6IG51bWJlcjsgLy8gdmVydGljZXMgaSB3aXRoIGhlYWQodGFpbChpKSkgIT09IGkgb3IgdGFpbChoZWFkKGkpKSAhPT0gaVxuICAvLyBvbmUgZW50cnkgcGVyIGNsb3NlZCBsb29wLCBzaWduZWQgYXJlYSByZWxhdGl2ZSB0byByZXN0QXJlYSwgbGFyZ2VzdCB8YXJlYXwgZmlyc3RcbiAgbG9vcEFyZWFzOiB7IHZlcnRpY2VzOiBudW1iZXI7IGFyZWE6IG51bWJlciB9W107XG59O1xuXG5jb25zdCBISVNUT0dSQU1fRURHRVMgPSBbMiwgNCwgOCwgMTYsIDMyLCA2NF07XG5cbmV4cG9ydCBjbGFzcyBUZWxlbWV0cnlBbmFseXNpcyB7XG4gIHByaXZhdGUgbGFzdENvdW50ZXJzOiBudW1iZXJbXSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RTdGVwID0gMDtcbiAgLy8gZXhwbGljaXQgZmllbGRzIHJhdGhlciB0aGFuIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBwcm9wZXJ0aWVzOiB0aGUgbW9kdWxlXG4gIC8vIHN0YXlzIGxvYWRhYmxlIGJ5IG5vZGUncyB0eXBlLXN0cmlwcGluZyB0ZXN0IHJ1bm5lclxuICBwcml2YXRlIGFjdGluQ291bnQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBtZW1icmFuZUNvdW50OiBudW1iZXI7XG4gIHByaXZhdGUgbWVtYnJhbmVSZXN0TGVuZ3RoOiBudW1iZXI7XG4gIHByaXZhdGUgcnVuOiBzdHJpbmc7XG4gIHByaXZhdGUgd2VsbE1peGVkOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKGFjdGluQ291bnQ6IG51bWJlciwgbWVtYnJhbmVDb3VudDogbnVtYmVyLCBtZW1icmFuZVJlc3RMZW5ndGg6IG51bWJlciwgcnVuOiBzdHJpbmcsIHdlbGxNaXhlZCA9IGZhbHNlKSB7XG4gICAgdGhpcy5hY3RpbkNvdW50ID0gYWN0aW5Db3VudDtcbiAgICB0aGlzLm1lbWJyYW5lQ291bnQgPSBtZW1icmFuZUNvdW50O1xuICAgIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoID0gbWVtYnJhbmVSZXN0TGVuZ3RoO1xuICAgIHRoaXMucnVuID0gcnVuO1xuICAgIHRoaXMud2VsbE1peGVkID0gd2VsbE1peGVkO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBudWxsO1xuICAgIHRoaXMubGFzdFN0ZXAgPSAwO1xuICB9XG5cbiAgLy8gUmVzdCBsZW5ndGggYW5kIGNvdW50cyBjYW4gZGlmZmVyIHBlciBjZWxsIGFuZCBjaGFuZ2UgYXQgcnVuIHRpbWU7IHRoZVxuICAvLyBwZXItc3RlcCBjb3VudGVyIGhpc3RvcnkgaXMgZGVsaWJlcmF0ZWx5IHByZXNlcnZlZC5cbiAgY29uZmlndXJlKGFjdGluQ291bnQ6IG51bWJlciwgbWVtYnJhbmVDb3VudDogbnVtYmVyLCBtZW1icmFuZVJlc3RMZW5ndGg6IG51bWJlcikge1xuICAgIHRoaXMuYWN0aW5Db3VudCA9IGFjdGluQ291bnQ7XG4gICAgdGhpcy5tZW1icmFuZUNvdW50ID0gbWVtYnJhbmVDb3VudDtcbiAgICB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCA9IG1lbWJyYW5lUmVzdExlbmd0aDtcbiAgfVxuXG4gIGFuYWx5emUoXG4gICAgYWN0aW46IEFycmF5QnVmZmVyLFxuICAgIG1lbWJyYW5lRGF0YTogQXJyYXlCdWZmZXIsXG4gICAgY291bnRlckRhdGE6IEFycmF5QnVmZmVyLFxuICAgIGZyYW1lOiBudW1iZXIsXG4gICAgc3RlcDogbnVtYmVyLFxuICAgIGVxdWlsaWJyaXVtTGluZURpc3RhbmNlOiBudW1iZXIsXG4gICAgdmVyaWZpY2F0aW9uID0gZmFsc2VcbiAgKSB7XG4gICAgY29uc3QgcHJldmlvdXNDb3VudGVycyA9IHRoaXMubGFzdENvdW50ZXJzLFxuICAgICAgcHJldmlvdXNTdGVwID0gdGhpcy5sYXN0U3RlcDtcbiAgICBjb25zdCB3b3JkcyA9IG5ldyBVaW50MzJBcnJheShhY3Rpbik7XG4gICAgY29uc3QgZmxvYXRzID0gbmV3IEZsb2F0MzJBcnJheSh3b3Jkcy5idWZmZXIpO1xuICAgIGNvbnN0IGNvdW50ZXJzID0gQXJyYXkuZnJvbShuZXcgVWludDMyQXJyYXkoY291bnRlckRhdGEpKTtcbiAgICBjb25zdCBtZW1icmFuZSA9IG5ldyBGbG9hdDMyQXJyYXkobWVtYnJhbmVEYXRhKTtcbiAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxsU2hhcGUobWVtYnJhbmUpO1xuICAgIGNvbnN0IHN0YXRzID0gdGhpcy5jb21wdXRlKHdvcmRzLCBmbG9hdHMsIGNvdW50ZXJzLCBmcmFtZSwgc3RlcCwgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2UsIGNlbGwpO1xuICAgIC8vIGZ1c2lvbi9zY2lzc2lvbiBjYW4gcmUtbGluayB0aGUgbWVtYnJhbmUgaW50byBzZXZlcmFsIGxvb3BzLCBzbyBldmVyeVxuICAgIC8vIHBvbHlnb24gcHJlZGljYXRlIGZvbGxvd3MgdGFpbCBsaW5rcyBpbnN0ZWFkIG9mIGluZGV4IG9yZGVyXG4gICAgY29uc3QgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShtZW1icmFuZSwgU0VHTUVOVF9XT1JEUywgdGhpcy53ZWxsTWl4ZWQsIHsgbGlua3M6IHRydWUgfSk7XG4gICAgY29uc3QgY3Jvc3NpbmcgPSB0aGlzLndlbGxNaXhlZCA/IHBvbHlnb25Cb25kQ3Jvc3NpbmcobWVtYnJhbmUsIFNFR01FTlRfV09SRFMsIHsgbGlua3M6IHRydWUgfSkgOiBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hY3RpbkNvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IGRpc2Nvbm5lY3RlZCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gPT09IGkgJiYgd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBIRUFEXSA9PT0gaTtcbiAgICAgIGlmICh0aGlzLndlbGxNaXhlZCAmJiBkaXNjb25uZWN0ZWQpIGNvbnRpbnVlOyAvLyByZXNlcnZvaXIgZW50cmllcyBoYXZlIG5vIHNwYXRpYWwgY29vcmRpbmF0ZXNcbiAgICAgIGNvbnN0IHRhaWwgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdO1xuICAgICAgaWYgKFxuICAgICAgICBjcm9zc2luZyAmJlxuICAgICAgICB0YWlsICE9PSBpICYmXG4gICAgICAgIGNyb3NzaW5nKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdLCBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAzXSwgZmxvYXRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1t0YWlsICogU0VHTUVOVF9XT1JEUyArIDNdKVxuICAgICAgKVxuICAgICAgICBzdGF0cy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMrKztcbiAgICAgIGlmICghaW5zaWRlKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdLCBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAzXSkpIGNvbnRpbnVlO1xuICAgICAgaWYgKHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gPT09IGkgJiYgd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBIRUFEXSA9PT0gaSkgc3RhdHMuaW5zaWRlTW9ub21lckJlYWRzKys7XG4gICAgICBlbHNlIHN0YXRzLmluc2lkZVBvbHltZXJCZWFkcysrO1xuICAgIH1cbiAgICBzdGF0cy5nQWN0aW5Db25jZW50cmF0aW9uID0gdGhpcy53ZWxsTWl4ZWQgPyBzdGF0cy5nQWN0aW5BbW91bnQgLyAoKGNlbGwuYXJlYSAqICh0aGlzLm1lbWJyYW5lQ291bnQgKiB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCkgKiogMikgLyAoNCAqIE1hdGguUEkpKSA6IDA7XG4gICAgc3RhdHMuZGlhZ25vc3RpY0tpbmQgPSB2ZXJpZmljYXRpb24gPyBcImNvbnRhY3QtcmVjaGVja1wiIDogXCJzaW11bGF0aW9uXCI7XG4gICAgaWYgKHZlcmlmaWNhdGlvbikge1xuICAgICAgdGhpcy5sYXN0Q291bnRlcnMgPSBwcmV2aW91c0NvdW50ZXJzO1xuICAgICAgdGhpcy5sYXN0U3RlcCA9IHByZXZpb3VzU3RlcDtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG5cbiAgLy8gTWVtYnJhbmUgZWRnZXMgZm9sbG93IHRoZSBydW50aW1lIHRhaWwgbGlua3M6IGFmdGVyIGZ1c2lvbi9zY2lzc2lvbiB0aGVcbiAgLy8gc2FtZSBidWZmZXIgaG9sZHMgb25lIG91dGVyIGxvb3AgcGx1cyBpbm5lciBsb29wcyBvZiBvcHBvc2l0ZSB3aW5kaW5nLCBzb1xuICAvLyB0aGUgc2lnbmVkIHNob2VsYWNlIHN1bSBvdmVyIGFsbCBsaW5rIGVkZ2VzIGlzIHRoZSBjeXRvcGxhc20gYXJlYSAob3V0ZXJcbiAgLy8gbWludXMgaW5uZXIpIGFuZCB0aGUgY2VudHJvaWQgaXMgdGhlIGN5dG9wbGFzbSBjZW50cm9pZC4gVGhlIGxlZ2FjeSBmaWVsZHNcbiAgLy8gZnJvbnRYLCByZWFyWCwgbGVuZ3RoLCBmcm9udFNwYWNpbmcgYW5kIHJlYXJTcGFjaW5nIHN0YXkgaW5kZXgtYmFzZWQuXG4gIHByaXZhdGUgY2VsbFNoYXBlKGZsb2F0czogRmxvYXQzMkFycmF5KTogQ2VsbFNoYXBlIHtcbiAgICBjb25zdCBuID0gdGhpcy5tZW1icmFuZUNvdW50O1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KGZsb2F0cy5idWZmZXIsIGZsb2F0cy5ieXRlT2Zmc2V0LCBmbG9hdHMubGVuZ3RoKTtcbiAgICBjb25zdCB4ID0gKGk6IG51bWJlcikgPT4gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgY29uc3QgeSA9IChpOiBudW1iZXIpID0+IGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdO1xuICAgIGNvbnN0IHJlc3RBcmVhID0gKG4gKiB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCkgKiogMiAvICg0ICogTWF0aC5QSSk7XG4gICAgbGV0IGxlZnQgPSBJbmZpbml0eTtcbiAgICBsZXQgcmlnaHQgPSAtSW5maW5pdHk7XG4gICAgbGV0IHRvcCA9IEluZmluaXR5O1xuICAgIGxldCBib3R0b20gPSAtSW5maW5pdHk7XG4gICAgLy8gYXJlYS13ZWlnaHRlZCBjZW50cm9pZCAoc2hvZWxhY2UpIG92ZXIgYWxsIGxpbmsgZWRnZXNcbiAgICBsZXQgYXJlYSA9IDA7XG4gICAgbGV0IGN4ID0gMDtcbiAgICBsZXQgY3kgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBsZWZ0ID0gTWF0aC5taW4obGVmdCwgeChpKSk7XG4gICAgICByaWdodCA9IE1hdGgubWF4KHJpZ2h0LCB4KGkpKTtcbiAgICAgIHRvcCA9IE1hdGgubWluKHRvcCwgeShpKSk7XG4gICAgICBib3R0b20gPSBNYXRoLm1heChib3R0b20sIHkoaSkpO1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBpZiAodGFpbCA9PT0gaSB8fCB0YWlsID49IG4pIGNvbnRpbnVlOyAvLyBmcmVlIHZlcnRleCBvciBkZWFkIGxpbms6IG5vIGVkZ2VcbiAgICAgIGNvbnN0IGNyb3NzID0geChpKSAqIHkodGFpbCkgLSB4KHRhaWwpICogeShpKTtcbiAgICAgIGFyZWEgKz0gY3Jvc3MgLyAyO1xuICAgICAgY3ggKz0gKHgoaSkgKyB4KHRhaWwpKSAqIGNyb3NzO1xuICAgICAgY3kgKz0gKHkoaSkgKyB5KHRhaWwpKSAqIGNyb3NzO1xuICAgIH1cbiAgICBjb25zdCB0b3BvbG9neSA9IHBvbHlnb25Mb29wcyhmbG9hdHMsIFNFR01FTlRfV09SRFMsIG4pO1xuICAgIGNvbnN0IGxvb3BBcmVhcyA9IHRvcG9sb2d5Lmxvb3BBcmVhcy5tYXAoKGxvb3ApID0+ICh7IHZlcnRpY2VzOiBsb29wLnZlcnRpY2VzLCBhcmVhOiBsb29wLmFyZWEgLyByZXN0QXJlYSB9KSk7XG4gICAgY29uc3QgcmVhciA9IG4gPj4gMTtcbiAgICBjb25zdCBxdWFydGVyU3BhY2luZyA9IChjZW50ZXI6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICBmb3IgKGxldCBrID0gLShuID4+IDMpOyBrIDwgbiA+PiAzOyBrKyspIHtcbiAgICAgICAgY29uc3QgaSA9IChjZW50ZXIgKyBrICsgbikgJSBuO1xuICAgICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICAgIHN1bSArPSBNYXRoLmh5cG90KHgoaikgLSB4KGkpLCB5KGopIC0geShpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtIC8gKG4gPj4gMikgLyB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aDtcbiAgICB9O1xuICAgIHJldHVybiB7XG4gICAgICBsZWZ0LFxuICAgICAgcmlnaHQsXG4gICAgICB0b3AsXG4gICAgICBib3R0b20sXG4gICAgICBmcm9udFg6IHgoMCksXG4gICAgICByZWFyWDogeChyZWFyKSxcbiAgICAgIGNlbnRyb2lkWDogY3ggLyAoNiAqIGFyZWEpLFxuICAgICAgY2VudHJvaWRZOiBjeSAvICg2ICogYXJlYSksXG4gICAgICBsZW5ndGg6IE1hdGguaHlwb3QoeCgwKSAtIHgocmVhciksIHkoMCkgLSB5KHJlYXIpKSxcbiAgICAgIGFyZWE6IE1hdGguYWJzKGFyZWEpIC8gcmVzdEFyZWEsXG4gICAgICBmcm9udFNwYWNpbmc6IHF1YXJ0ZXJTcGFjaW5nKDApLFxuICAgICAgcmVhclNwYWNpbmc6IHF1YXJ0ZXJTcGFjaW5nKHJlYXIpLFxuICAgICAgbG9vcHM6IHRvcG9sb2d5Lmxvb3BzLFxuICAgICAgbWVtYnJhbmVCcm9rZW5MaW5rczogdG9wb2xvZ3kuYnJva2VuTGlua3MsXG4gICAgICBsb29wQXJlYXMsXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZSh3b3JkczogVWludDMyQXJyYXksIGZsb2F0czogRmxvYXQzMkFycmF5LCBjb3VudGVyczogbnVtYmVyW10sIGZyYW1lOiBudW1iZXIsIHN0ZXA6IG51bWJlciwgcmVzdExlbmd0aDogbnVtYmVyLCBjZWxsOiBDZWxsU2hhcGUpOiBBY3RpblN0YXRzIHtcbiAgICBjb25zdCBuID0gdGhpcy5hY3RpbkNvdW50O1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgVWludDhBcnJheShuKTtcbiAgICBjb25zdCBsZW5ndGhzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBtb25vbWVycyA9IDA7XG4gICAgbGV0IGJyb2tlbkxpbmtzID0gMDtcbiAgICBsZXQgY3ljbGVzID0gMDtcbiAgICBsZXQgYnJhbmNoZXMgPSAwO1xuICAgIGxldCBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMgPSAwO1xuICAgIGxldCBhZ2VTdW0gPSAwLFxuICAgICAgbWF4QWdlID0gMDtcbiAgICBjb25zdCBib25kTGVuZ3RoczogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBiZW5kQW5nbGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhaWwgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdO1xuICAgICAgY29uc3QgaGVhZCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICBpZiAodGFpbCA9PT0gaSAmJiBoZWFkID09PSBpKSB7XG4gICAgICAgIG1vbm9tZXJzKys7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgYWdlID0gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgOV07XG4gICAgICBhZ2VTdW0gKz0gYWdlO1xuICAgICAgbWF4QWdlID0gTWF0aC5tYXgobWF4QWdlLCBhZ2UpO1xuICAgICAgaWYgKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdIDwgKGNlbGwuZnJvbnRYICsgY2VsbC5yZWFyWCkgLyAyKSBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMrKztcbiAgICAgIGlmIChoZWFkICE9PSBpICYmIHdvcmRzW2hlYWQgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gIT09IGkpIHtcbiAgICAgICAgYnJva2VuTGlua3MrKztcbiAgICAgIH1cbiAgICAgIC8vIGEgYnJhbmNoIHJvb3QncyB0YWlsIGlzIGl0cyBtb3RoZXIsIHdob3NlIGhlYWQgcG9pbnRzIGVsc2V3aGVyZSBhbG9uZyB0aGUgbW90aGVyIGZpbGFtZW50XG4gICAgICBjb25zdCBpc0JyYW5jaFJvb3QgPSB0YWlsICE9PSBpICYmIHdvcmRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF0gIT09IGk7XG4gICAgICBpZiAodGFpbCAhPT0gaSAmJiAhaXNCcmFuY2hSb290KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnJhbmNoZXMgKz0gaXNCcmFuY2hSb290ID8gMSA6IDA7XG4gICAgICAvLyBhIG1pbnVzIGVuZCBvciBicmFuY2ggcm9vdDogd2FsayB0byB0aGUgcGx1cyBlbmRcbiAgICAgIGxldCBsZW5ndGggPSAxO1xuICAgICAgbGV0IGN1cnJlbnQgPSBpO1xuICAgICAgbGV0IHByZXZEeCA9IDA7XG4gICAgICBsZXQgcHJldkR5ID0gMDtcbiAgICAgIHZpc2l0ZWRbaV0gPSAxO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHdvcmRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICAgIGlmIChuZXh0ID09PSBjdXJyZW50KSBicmVhaztcbiAgICAgICAgaWYgKHZpc2l0ZWRbbmV4dF0pIHtcbiAgICAgICAgICBjeWNsZXMrKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkeCA9IGZsb2F0c1tuZXh0ICogU0VHTUVOVF9XT1JEUyArIDJdIC0gZmxvYXRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgICAgIGNvbnN0IGR5ID0gZmxvYXRzW25leHQgKiBTRUdNRU5UX1dPUkRTICsgM10gLSBmbG9hdHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyAzXTtcbiAgICAgICAgYm9uZExlbmd0aHMucHVzaChNYXRoLmh5cG90KGR4LCBkeSkpO1xuICAgICAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgICAgIGJlbmRBbmdsZXMucHVzaCgoTWF0aC5hYnMoTWF0aC5hdGFuMihwcmV2RHggKiBkeSAtIHByZXZEeSAqIGR4LCBwcmV2RHggKiBkeCArIHByZXZEeSAqIGR5KSkgKiAxODApIC8gTWF0aC5QSSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJldkR4ID0gZHg7XG4gICAgICAgIHByZXZEeSA9IGR5O1xuICAgICAgICB2aXNpdGVkW25leHRdID0gMTtcbiAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgIGxlbmd0aCsrO1xuICAgICAgfVxuICAgICAgbGVuZ3Rocy5wdXNoKGxlbmd0aCk7XG4gICAgfVxuXG4gICAgbGVuZ3Rocy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgY29uc3QgaW5Qb2x5bWVyID0gbGVuZ3Rocy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgbCwgMCk7XG4gICAgY29uc3QgaGlzdG9ncmFtID0gbmV3IEFycmF5KEhJU1RPR1JBTV9FREdFUy5sZW5ndGggKyAxKS5maWxsKDApO1xuICAgIGZvciAoY29uc3QgbCBvZiBsZW5ndGhzKSB7XG4gICAgICBjb25zdCBiaW4gPSBISVNUT0dSQU1fRURHRVMuZmluZEluZGV4KChlZGdlKSA9PiBsIDw9IGVkZ2UpO1xuICAgICAgaGlzdG9ncmFtW2JpbiA9PT0gLTEgPyBISVNUT0dSQU1fRURHRVMubGVuZ3RoIDogYmluXSsrO1xuICAgIH1cblxuICAgIGNvbnN0IHN0ZXBzID0gTWF0aC5tYXgoMSwgc3RlcCAtIHRoaXMubGFzdFN0ZXApO1xuICAgIGNvbnN0IHBlclN0ZXAgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICBURUxFTUVUUllfQ09VTlRFUlMubWFwKChuYW1lLCBrKSA9PiBbbmFtZSwgdGhpcy5sYXN0Q291bnRlcnMgPyAoY291bnRlcnNba10gLSB0aGlzLmxhc3RDb3VudGVyc1trXSkgLyBzdGVwcyA6IDBdKVxuICAgICkgYXMgQ291bnRlcnM7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBjb3VudGVycztcbiAgICB0aGlzLmxhc3RTdGVwID0gc3RlcDtcblxuICAgIGNvbnN0IHF1YW50aWxlID0gKHE6IG51bWJlcikgPT4gKGxlbmd0aHMubGVuZ3RoID8gbGVuZ3Roc1tNYXRoLm1pbihsZW5ndGhzLmxlbmd0aCAtIDEsIE1hdGguZmxvb3IocSAqIGxlbmd0aHMubGVuZ3RoKSldIDogMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJ1bjogdGhpcy5ydW4sXG4gICAgICBmcmFtZSxcbiAgICAgIHN0ZXAsXG4gICAgICBhY3RpbkNvdW50OiBuLFxuICAgICAgbW9ub21lcnMsXG4gICAgICBmaWxhbWVudHM6IGxlbmd0aHMubGVuZ3RoLFxuICAgICAgYnJhbmNoZXMsXG4gICAgICBpblBvbHltZXIsXG4gICAgICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMsXG4gICAgICBpbnNpZGVQb2x5bWVyQmVhZHM6IDAsXG4gICAgICBpbnNpZGVNb25vbWVyQmVhZHM6IDAsXG4gICAgICBnQWN0aW5Nb2RlOiB0aGlzLndlbGxNaXhlZCA/IFwid2VsbC1taXhlZFwiIDogXCJwYXJ0aWNsZXNcIixcbiAgICAgIGdBY3RpbkFtb3VudDogbW9ub21lcnMsXG4gICAgICBnQWN0aW5Db25jZW50cmF0aW9uOiAwLFxuICAgICAgYWN0aW5CYWxhbmNlRXJyb3I6IG1vbm9tZXJzICsgaW5Qb2x5bWVyIC0gbixcbiAgICAgIGNyb3NzaW5nRmlsYW1lbnRCb25kczogMCxcbiAgICAgIG1lYW5Qb2x5bWVyQWdlOiBuID4gbW9ub21lcnMgPyBhZ2VTdW0gLyAobiAtIG1vbm9tZXJzKSA6IDAsXG4gICAgICBtYXhQb2x5bWVyQWdlOiBtYXhBZ2UsXG4gICAgICBtZWFuTGVuZ3RoOiBsZW5ndGhzLmxlbmd0aCA/IGluUG9seW1lciAvIGxlbmd0aHMubGVuZ3RoIDogMCxcbiAgICAgIG1lZGlhbkxlbmd0aDogcXVhbnRpbGUoMC41KSxcbiAgICAgIHA5MExlbmd0aDogcXVhbnRpbGUoMC45KSxcbiAgICAgIG1heExlbmd0aDogbGVuZ3Rocy5sZW5ndGggPyBsZW5ndGhzW2xlbmd0aHMubGVuZ3RoIC0gMV0gOiAwLFxuICAgICAgaGlzdG9ncmFtLFxuICAgICAgbWVkaWFuQm9uZExlbmd0aDogYm9uZExlbmd0aHMubGVuZ3RoID8gYm9uZExlbmd0aHMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JvbmRMZW5ndGhzLmxlbmd0aCA+PiAxXSAvIHJlc3RMZW5ndGggOiAwLFxuICAgICAgbWVkaWFuQmVuZEFuZ2xlOiBiZW5kQW5nbGVzLmxlbmd0aCA/IGJlbmRBbmdsZXMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JlbmRBbmdsZXMubGVuZ3RoID4+IDFdIDogMCxcbiAgICAgIGJyb2tlbkxpbmtzLFxuICAgICAgY3ljbGVzLFxuICAgICAgcGVyU3RlcCxcbiAgICAgIGNlbGwsXG4gICAgfTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVEVMRU1FVFJZX0NPVU5URVJTLCB0eXBlIEFjdGluU3RhdHMgfSBmcm9tIFwiLi90ZWxlbWV0cnktYW5hbHlzaXNcIjtcbmV4cG9ydCB7IFRFTEVNRVRSWV9DT1VOVEVSUywgdHlwZSBBY3RpblN0YXRzLCB0eXBlIENlbGxTaGFwZSB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xuXG4vLyBPbmUgaW4tZmxpZ2h0IHJlYWRiYWNrL3dvcmtlciBqb2IuIEV2ZXJ5IGZvcmNlZCBhc3NheSBjaGVja3BvaW50IHdhaXRzIGZvciBhXG4vLyBmcmVzaCBmdWxsIGFuYWx5c2lzOyBpbnRlcmFjdGl2ZSByZXF1ZXN0cyBjb2FsZXNjZSB3aGlsZSB0aGUgd29ya2VyIGlzIGJ1c3kuXG5leHBvcnQgY2xhc3MgQWN0aW5UZWxlbWV0cnkge1xuICByZWFkb25seSBjb3VudGVyQnVmZmVyOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgYWN0aW5TdGFnaW5nOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgY291bnRlclN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBtZW1icmFuZVN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBwZW5kaW5nOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgd29ya2VyID0gbmV3IFdvcmtlcihuZXcgVVJMKFwiLi90ZWxlbWV0cnkud29ya2VyLnRzXCIsIGltcG9ydC5tZXRhLnVybCksIHsgdHlwZTogXCJtb2R1bGVcIiB9KTtcbiAgcHJpdmF0ZSBqb2I6IHsgaWQ6IG51bWJlcjsgcmVzb2x2ZTogKHZhbHVlOiB7IHN0YXRzOiBBY3RpblN0YXRzOyBhbmFseXNpc01zOiBudW1iZXIgfSkgPT4gdm9pZDsgcmVqZWN0OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB3b3JrZXJGYWlsdXJlOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5leHRJZCA9IDA7XG4gIHByaXZhdGUgZGlzcGxheTogSFRNTFByZUVsZW1lbnQ7XG4gIHByaXZhdGUgc3VtbWFyeTogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgcG9zdFRvU2VydmVyID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInRlbGVtZXRyeVwiKSA9PT0gXCIxXCI7XG4gIHJlYWRvbmx5IGhpc3Rvcnk6IEFjdGluU3RhdHNbXSA9IFtdO1xuICBvblNhbXBsZT86IChzdGF0czogQWN0aW5TdGF0cykgPT4gdm9pZDtcbiAgcmVhZG9ubHkgdGltaW5ncyA9IHsgcmVhZGJhY2tNczogMCwgYW5hbHlzaXNNczogMCwgd29ya2VyUm91bmRUcmlwTXM6IDAsIHRvdGFsTXM6IDAsIGNvYWxlc2NlZEF1dG9tYXRpY1NhbXBsZXM6IDAgfTtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBkZXZpY2U6IEdQVURldmljZSxcbiAgICBwcml2YXRlIGFjdGluQnVmZmVyOiBHUFVCdWZmZXIsXG4gICAgYWN0aW5Db3VudDogbnVtYmVyLFxuICAgIHByaXZhdGUgbWVtYnJhbmVCdWZmZXI6IEdQVUJ1ZmZlcixcbiAgICBtZW1icmFuZUNvdW50OiBudW1iZXIsXG4gICAgbWVtYnJhbmVSZXN0TGVuZ3RoOiBudW1iZXIsXG4gICAgcHJpdmF0ZSBydW46IHN0cmluZyxcbiAgICBwcml2YXRlIGludGVydmFsRnJhbWVzID0gMzAsXG4gICAgcHJpdmF0ZSB3ZWxsTWl4ZWQgPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLmNvdW50ZXJCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxhYmVsOiBcIlRlbGVtZXRyeSBjb3VudGVyc1wiLFxuICAgICAgc2l6ZTogNCAqIFRFTEVNRVRSWV9DT1VOVEVSUy5sZW5ndGgsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSk7XG4gICAgY29uc3Qgc3RhZ2luZyA9IChzaXplOiBudW1iZXIpID0+IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICB0aGlzLmFjdGluU3RhZ2luZyA9IHN0YWdpbmcoYWN0aW5CdWZmZXIuc2l6ZSk7XG4gICAgdGhpcy5jb3VudGVyU3RhZ2luZyA9IHN0YWdpbmcodGhpcy5jb3VudGVyQnVmZmVyLnNpemUpO1xuICAgIHRoaXMubWVtYnJhbmVTdGFnaW5nID0gc3RhZ2luZyhtZW1icmFuZUJ1ZmZlci5zaXplKTtcbiAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHtcbiAgICAgIGNvbnN0IGpvYiA9IHRoaXMuam9iO1xuICAgICAgaWYgKCFqb2IgfHwgam9iLmlkICE9PSBkYXRhLmlkKSByZXR1cm47XG4gICAgICB0aGlzLmpvYiA9IG51bGw7XG4gICAgICBpZiAoZGF0YS5lcnJvcikgam9iLnJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvcikpO1xuICAgICAgZWxzZSBqb2IucmVzb2x2ZShkYXRhKTtcbiAgICB9O1xuICAgIHRoaXMud29ya2VyLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMud29ya2VyRmFpbHVyZSA9IG5ldyBFcnJvcihgRGlhZ25vc3RpYyB3b3JrZXI6ICR7ZXZlbnQubWVzc2FnZX1gKTtcbiAgICAgIHRoaXMuam9iPy5yZWplY3QodGhpcy53b3JrZXJGYWlsdXJlKTtcbiAgICAgIHRoaXMuam9iID0gbnVsbDtcbiAgICB9O1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJpbml0XCIsIGNvbmZpZzogW2FjdGluQ291bnQsIG1lbWJyYW5lQ291bnQsIG1lbWJyYW5lUmVzdExlbmd0aCwgcnVuLCB3ZWxsTWl4ZWRdIH0pO1xuICAgIGNvbnN0IGRldGFpbHMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkZXRhaWxzXCIpLCB7IGlkOiBcImRpYWdub3N0aWNzXCIgfSk7XG4gICAgT2JqZWN0LmFzc2lnbihkZXRhaWxzLnN0eWxlLCB7XG4gICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgbGVmdDogXCIxMHB4XCIsXG4gICAgICBib3R0b206IFwiMTBweFwiLFxuICAgICAgcGFkZGluZzogXCI2cHhcIixcbiAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICBmb250OiBcIjExcHggbW9ub3NwYWNlXCIsXG4gICAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMCwwLDAsLjgpXCIsXG4gICAgICB6SW5kZXg6IFwiMTAwMFwiLFxuICAgICAgbWF4V2lkdGg6IFwiY2FsYygxMDB2dyAtIDMycHgpXCIsXG4gICAgfSk7XG4gICAgdGhpcy5zdW1tYXJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN1bW1hcnlcIik7XG4gICAgdGhpcy5zdW1tYXJ5LnRleHRDb250ZW50ID0gXCJGdWxsIG51bWVyaWNhbCBkaWFnbm9zdGljcyDCtyB3b3JrZXJcIjtcbiAgICB0aGlzLmRpc3BsYXkgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIiksIHsgaWQ6IFwiYWN0aW5UZWxlbWV0cnlcIiB9KTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZGlzcGxheS5zdHlsZSwgeyBtYXhIZWlnaHQ6IFwiMjIwcHhcIiwgb3ZlcmZsb3c6IFwiYXV0b1wiLCBtYXJnaW46IFwiNnB4IDAgMFwiIH0pO1xuICAgIGRldGFpbHMuYXBwZW5kKHRoaXMuc3VtbWFyeSwgdGhpcy5kaXNwbGF5KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChkZXRhaWxzKTtcbiAgICAod2luZG93IGFzIGFueSkuYWN0aW5UZWxlbWV0cnkgPSB0aGlzO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicGFnZWhpZGVcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnBlcnNpc3RlZCkgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgfSk7XG4gIH1cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5kZXZpY2UucXVldWUud3JpdGVCdWZmZXIodGhpcy5jb3VudGVyQnVmZmVyLCAwLCBuZXcgVWludDMyQXJyYXkoVEVMRU1FVFJZX0NPVU5URVJTLmxlbmd0aCkpO1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJyZXNldFwiIH0pO1xuICAgIHRoaXMuaGlzdG9yeS5sZW5ndGggPSAwO1xuICB9XG4gIGFzeW5jIHVwZGF0ZShmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3Q6IG51bWJlciwgZm9yY2UgPSBmYWxzZSwgdmVyaWZpY2F0aW9uID0gZmFsc2UpIHtcbiAgICBpZiAoIWZvcmNlICYmIGZyYW1lICUgdGhpcy5pbnRlcnZhbEZyYW1lcyAhPT0gMCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgIGlmICghZm9yY2UpIHtcbiAgICAgICAgdGhpcy50aW1pbmdzLmNvYWxlc2NlZEF1dG9tYXRpY1NhbXBsZXMrKztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5wZW5kaW5nOyAvLyBuZXZlciByZXR1cm4gYW4gb2xkIHNuYXBzaG90IGZvciBhbiBleGFjdC1zdGVwIGFzc2F5XG4gICAgfVxuICAgIGlmICh0aGlzLndvcmtlckZhaWx1cmUpIHRocm93IHRoaXMud29ya2VyRmFpbHVyZTtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5jYXB0dXJlKGZyYW1lLCBzdGVwLCByZXN0LCB2ZXJpZmljYXRpb24pO1xuICAgIHRoaXMucGVuZGluZyA9IHByb21pc2U7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb21pc2U7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgPT09IHByb21pc2UpIHRoaXMucGVuZGluZyA9IG51bGw7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgYXN5bmMgY2FwdHVyZShmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3Q6IG51bWJlciwgdmVyaWZpY2F0aW9uID0gZmFsc2UpIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGVuY29kZXIgPSB0aGlzLmRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHRoaXMuYWN0aW5CdWZmZXIsIDAsIHRoaXMuYWN0aW5TdGFnaW5nLCAwLCB0aGlzLmFjdGluU3RhZ2luZy5zaXplKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcih0aGlzLmNvdW50ZXJCdWZmZXIsIDAsIHRoaXMuY291bnRlclN0YWdpbmcsIDAsIHRoaXMuY291bnRlclN0YWdpbmcuc2l6ZSk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIodGhpcy5tZW1icmFuZUJ1ZmZlciwgMCwgdGhpcy5tZW1icmFuZVN0YWdpbmcsIDAsIHRoaXMubWVtYnJhbmVTdGFnaW5nLnNpemUpO1xuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGNvbnN0IHN0YWdlcyA9IFt0aGlzLmFjdGluU3RhZ2luZywgdGhpcy5tZW1icmFuZVN0YWdpbmcsIHRoaXMuY291bnRlclN0YWdpbmddO1xuICAgIGxldCBjb3BpZXM6IEFycmF5QnVmZmVyW107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcHBlZCA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChzdGFnZXMubWFwKChidWZmZXIpID0+IGJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpKSk7XG4gICAgICBjb25zdCBmYWlsZWQgPSBtYXBwZWQuZmluZCgocmVzdWx0KSA9PiByZXN1bHQuc3RhdHVzID09PSBcInJlamVjdGVkXCIpO1xuICAgICAgaWYgKGZhaWxlZD8uc3RhdHVzID09PSBcInJlamVjdGVkXCIpIHRocm93IGZhaWxlZC5yZWFzb247XG4gICAgICBjb3BpZXMgPSBzdGFnZXMubWFwKChidWZmZXIpID0+IGJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZm9yIChjb25zdCBidWZmZXIgb2Ygc3RhZ2VzKSBpZiAoYnVmZmVyLm1hcFN0YXRlID09PSBcIm1hcHBlZFwiKSBidWZmZXIudW5tYXAoKTtcbiAgICB9XG4gICAgdGhpcy50aW1pbmdzLnJlYWRiYWNrTXMgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xuICAgIGNvbnN0IHdvcmtlclN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBpZCA9ICsrdGhpcy5uZXh0SWQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2U8eyBzdGF0czogQWN0aW5TdGF0czsgYW5hbHlzaXNNczogbnVtYmVyIH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuam9iID0geyBpZCwgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiYW5hbHl6ZVwiLCBpZCwgYWN0aW46IGNvcGllc1swXSwgbWVtYnJhbmU6IGNvcGllc1sxXSwgY291bnRlcnM6IGNvcGllc1syXSwgZnJhbWUsIHN0ZXAsIHJlc3QsIHZlcmlmaWNhdGlvbiB9LCBjb3BpZXMpO1xuICAgIH0pO1xuICAgIHRoaXMudGltaW5ncy53b3JrZXJSb3VuZFRyaXBNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gd29ya2VyU3RhcnQ7XG4gICAgdGhpcy50aW1pbmdzLmFuYWx5c2lzTXMgPSByZXN1bHQuYW5hbHlzaXNNcztcbiAgICB0aGlzLnRpbWluZ3MudG90YWxNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQ7XG4gICAgY29uc3QgcyA9IHJlc3VsdC5zdGF0cztcbiAgICB0aGlzLmhpc3RvcnkucHVzaChzKTtcbiAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDEwMjQpIHRoaXMuaGlzdG9yeS5zaGlmdCgpO1xuICAgIHRoaXMuc2hvdyhzKTtcbiAgICB0aGlzLm9uU2FtcGxlPy4ocyk7XG4gICAgaWYgKHRoaXMucG9zdFRvU2VydmVyKVxuICAgICAgZmV0Y2goXCIvX190ZWxlbWV0cnlcIiwgeyBtZXRob2Q6IFwiUE9TVFwiLCBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sIGJvZHk6IEpTT04uc3RyaW5naWZ5KHMpIH0pLnRoZW4oXG4gICAgICAgIChyKSA9PiAodGhpcy5wb3N0VG9TZXJ2ZXIgPSByLm9rKSxcbiAgICAgICAgKCkgPT4gKHRoaXMucG9zdFRvU2VydmVyID0gZmFsc2UpXG4gICAgICApO1xuICB9XG4gIHByaXZhdGUgc2hvdyhzOiBBY3RpblN0YXRzKSB7XG4gICAgY29uc3QgYyA9IHMuY2VsbCxcbiAgICAgIHIgPSBzLnBlclN0ZXA7XG4gICAgdGhpcy5zdW1tYXJ5LnRleHRDb250ZW50ID0gYENoZWNrZWQgc3RlcCAke3Muc3RlcH0gwrcgbWFzcyBlcnJvciAke3MuYWN0aW5CYWxhbmNlRXJyb3J9IMK3IEYgaW5zaWRlICR7cy5pbnNpZGVQb2x5bWVyQmVhZHN9LyR7cy5pblBvbHltZXJ9IMK3IGFyZWEgJHtjLmFyZWEudG9GaXhlZCg0KX0gwrcgd29ya2VyICR7dGhpcy50aW1pbmdzLmFuYWx5c2lzTXMudG9GaXhlZCgwKX0gbXNgO1xuICAgIHRoaXMuZGlzcGxheS50ZXh0Q29udGVudCA9IFtcbiAgICAgIGBmaWxhbWVudHMgJHtzLmZpbGFtZW50c30gKGJyYW5jaGVzICR7cy5icmFuY2hlc30pIMK3IHBvbHltZXIgJHsoKDEwMCAqIHMuaW5Qb2x5bWVyKSAvIHMuYWN0aW5Db3VudCkudG9GaXhlZCgxKX0lYCxcbiAgICAgIGBsZW5ndGggbWVhbiAke3MubWVhbkxlbmd0aC50b0ZpeGVkKDEpfSBtZWRpYW4gJHtzLm1lZGlhbkxlbmd0aH0gcDkwICR7cy5wOTBMZW5ndGh9IG1heCAke3MubWF4TGVuZ3RofWAsXG4gICAgICBgcG9seW1lciBhZ2UgbWVhbiAke3MubWVhblBvbHltZXJBZ2UudG9GaXhlZCgwKX0gbWF4ICR7cy5tYXhQb2x5bWVyQWdlLnRvRml4ZWQoMCl9IGZpeGVkIHN0ZXBzYCxcbiAgICAgIGBoaXN0IFsyfDMtNHw1LTh8OS0xNnwxNy0zMnwzMy02NHw2NStdICR7cy5oaXN0b2dyYW0uam9pbihcIiBcIil9YCxcbiAgICAgIGBib25kL3Jlc3QgJHtzLm1lZGlhbkJvbmRMZW5ndGgudG9GaXhlZCgyKX0gwrcgYmVuZCAke3MubWVkaWFuQmVuZEFuZ2xlLnRvRml4ZWQoMSl9wrAgwrcgYnJva2VuICR7cy5icm9rZW5MaW5rc30gwrcgY3ljbGVzICR7cy5jeWNsZXN9YCxcbiAgICAgIGBldmVudHMvc3RlcCAke09iamVjdC5lbnRyaWVzKHIpXG4gICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a306JHt2LnRvRml4ZWQoMyl9YClcbiAgICAgICAgLmpvaW4oXCIgXCIpfWAsXG4gICAgICBgeCBib3VuZHMgJHtjLmxlZnQudG9GaXhlZCgxKX3igJMke2MucmlnaHQudG9GaXhlZCgxKX0gwrcgbWF0ZXJpYWwgbWFya2VycyAke2MucmVhclgudG9GaXhlZCgxKX0vJHtjLmZyb250WC50b0ZpeGVkKDEpfSDCtyBjZW50cm9pZCAke2MuY2VudHJvaWRYLnRvRml4ZWQoMSl9LCR7Yy5jZW50cm9pZFkudG9GaXhlZCgxKX1gLFxuICAgICAgYGxlbmd0aCAke2MubGVuZ3RoLnRvRml4ZWQoMSl9IMK3IGFyZWEgJHtjLmFyZWEudG9GaXhlZCg2KX0gwrcgc3BhY2luZyBmcm9udC9yZWFyICR7Yy5mcm9udFNwYWNpbmcudG9GaXhlZCgyKX0vJHtjLnJlYXJTcGFjaW5nLnRvRml4ZWQoMil9YCxcbiAgICAgIHRoaXMud2VsbE1peGVkXG4gICAgICAgID8gYEcgcG9vbCAke3MuZ0FjdGluQW1vdW50fSAoJHtzLmdBY3RpbkNvbmNlbnRyYXRpb24udG9GaXhlZCgzKX0vcHjCsikgwrcgY3Jvc3NpbmcgYm9uZHMgJHtzLmNyb3NzaW5nRmlsYW1lbnRCb25kc31gXG4gICAgICAgIDogYGluc2lkZTogJHtzLmluc2lkZVBvbHltZXJCZWFkc30gRiArICR7cy5pbnNpZGVNb25vbWVyQmVhZHN9IEcgYmVhZHNgLFxuICAgICAgYGxlZ2FjeSBtYXJrZXIteCBoYWxmIHBvbHltZXIgJHtzLnBvc3RlcmlvclBvbHltZXJCZWFkc30gwrcgcmVhZGJhY2sgJHt0aGlzLnRpbWluZ3MucmVhZGJhY2tNcy50b0ZpeGVkKDEpfSBtcyDCtyB3b3JrZXIgcm91bmQgdHJpcCAke3RoaXMudGltaW5ncy53b3JrZXJSb3VuZFRyaXBNcy50b0ZpeGVkKDEpfSBtc2AsXG4gICAgXS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHNuYXBzaG90KGZyYW1lOiBudW1iZXIsIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICBjb25zdCBldmVyeSA9IE51bWJlcihuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwic25hcHNob3RFdmVyeVwiKSk7XG4gICAgaWYgKCFldmVyeSB8fCBmcmFtZSAlIGV2ZXJ5ICE9PSAwKSByZXR1cm47XG4gICAgY2FudmFzLnRvQmxvYigoYmxvYikgPT4gYmxvYiAmJiBmZXRjaChgL19fc25hcHNob3Q/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChgJHt0aGlzLnJ1bn0tJHtmcmFtZX1gKX1gLCB7IG1ldGhvZDogXCJQT1NUXCIsIGJvZHk6IGJsb2IgfSkpO1xuICB9XG59XG4iLCJcbmZ1bmN0aW9uIHRocm93RGV0ZWN0aW9uRXJyb3IoZXJyb3I6IHN0cmluZyk6IG5ldmVyIHtcbiAgY29uc3Qgbm90aWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIud2ViZ3B1LW5vdC1zdXBwb3J0ZWRcIik7XG4gIGlmIChub3RpY2UpIG5vdGljZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBpbml0aWFsaXplIFdlYkdQVTogXCIgKyBlcnJvcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0RGV2aWNlKFxuICBvcHRpb25zOiBHUFVSZXF1ZXN0QWRhcHRlck9wdGlvbnMgPSB7XG4gICAgcG93ZXJQcmVmZXJlbmNlOiBcImhpZ2gtcGVyZm9ybWFuY2VcIixcbiAgfSxcbiAgcmVxdWlyZWRGZWF0dXJlczogR1BVRmVhdHVyZU5hbWVbXSA9IFtdLFxuICByZXF1aXJlZExpbWl0czogUmVjb3JkPHN0cmluZywgdW5kZWZpbmVkIHwgbnVtYmVyPiA9IHtcbiAgICBtYXhTdG9yYWdlVGV4dHVyZXNQZXJTaGFkZXJTdGFnZTogOCxcbiAgfVxuKTogUHJvbWlzZTxHUFVEZXZpY2U+IHtcbiAgaWYgKCFuYXZpZ2F0b3IuZ3B1KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiV2ViR1BVIE5PVCBTdXBwb3J0ZWRcIik7XG5cbiAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIob3B0aW9ucyk7XG4gIGlmICghYWRhcHRlcikgdGhyb3dEZXRlY3Rpb25FcnJvcihcIk5vIEdQVSBhZGFwdGVyIGZvdW5kXCIpO1xuXG4gIGNvbnN0IGNhblRpbWVzdGFtcCA9IGFkYXB0ZXIuZmVhdHVyZXMuaGFzKFwidGltZXN0YW1wLXF1ZXJ5XCIpO1xuICBjb25zdCBmZWF0dXJlcyA9IFsuLi5yZXF1aXJlZEZlYXR1cmVzXTtcblxuICBpZiAoY2FuVGltZXN0YW1wKSB7XG4gICAgZmVhdHVyZXMucHVzaChcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgfVxuXG4gIC8vIEluc3RlYWQgb2YgcGFzc2luZyBhIHJlY29yZCB0aGF0IG1pZ2h0IGhhdmUgdW5kZWZpbmVkIHZhbHVlcywgZmlsdGVyIHRoZW0gb3V0OlxuICBjb25zdCBsaW1pdHMgPSBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMocmVxdWlyZWRMaW1pdHMpLmZpbHRlcigoW2tleSwgdmFsdWVdKSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSkgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcblxuICAvLyBUaGVuIHVzZSB0aGUgZmlsdGVyZWQgbGltaXRzIG9iamVjdDpcbiAgcmV0dXJuIGFkYXB0ZXIucmVxdWVzdERldmljZSh7XG4gICAgcmVxdWlyZWRGZWF0dXJlczogZmVhdHVyZXMsXG4gICAgcmVxdWlyZWRMaW1pdHM6IGxpbWl0cyxcbiAgICAuLi4oY2FuVGltZXN0YW1wID8gW1widGltZXN0YW1wLXF1ZXJ5XCJdIDogW10pLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZUNhbnZhcyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGlkOiBzdHJpbmcsXG4gIHNpemUgPSB7IHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCwgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfVxuKToge1xuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICBjb250ZXh0OiBHUFVDYW52YXNDb250ZXh0O1xuICBmb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQ7XG4gIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbn0ge1xuICBjb25zdCBjYW52YXMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksIHNpemUpO1xuICBjYW52YXMuaWQgPSBpZDtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdwdVwiKTtcbiAgaWYgKCFjb250ZXh0KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiQ2FudmFzIGRvZXMgbm90IHN1cHBvcnQgV2ViR1BVXCIpO1xuXG4gIGNvbnN0IGZvcm1hdCA9IG5hdmlnYXRvci5ncHUuZ2V0UHJlZmVycmVkQ2FudmFzRm9ybWF0KCk7XG4gIGNvbnRleHQuY29uZmlndXJlKHtcbiAgICBkZXZpY2U6IGRldmljZSxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICB1c2FnZTogR1BVVGV4dHVyZVVzYWdlLlJFTkRFUl9BVFRBQ0hNRU5ULFxuICAgIGFscGhhTW9kZTogXCJwcmVtdWx0aXBsaWVkXCIsXG4gIH0pO1xuXG4gIHJldHVybiB7IGNhbnZhczogY2FudmFzLCBjb250ZXh0OiBjb250ZXh0LCBmb3JtYXQ6IGZvcm1hdCwgc2l6ZTogc2l6ZSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2hhZGVyKGRldmljZTogR1BVRGV2aWNlLCBjb2RlOiBzdHJpbmcsIGluY2x1ZGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8R1BVU2hhZGVyTW9kdWxlPiB7XG4gIC8vIFByb2Nlc3MgdGhlIGNvZGUgd2l0aCBpbXBvcnRzXG4gIGNvbnN0IHByb2Nlc3NlZENvZGUgPSBwcmVwZW5kSW5jbHVkZXMoY29kZSwgaW5jbHVkZXMpO1xuXG4gIGNvbnN0IG1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoeyBjb2RlOiBwcm9jZXNzZWRDb2RlIH0pO1xuICBjb25zdCBpbmZvID0gYXdhaXQgbW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICBpZiAoaW5mby5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgbWVzc2FnZSBvZiBpbmZvLm1lc3NhZ2VzKSB7XG4gICAgICBjb25zb2xlLndhcm4oYCR7bWVzc2FnZS5tZXNzYWdlfSBcbiAgYXQgbGluZSAke21lc3NhZ2UubGluZU51bX1gKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgY29tcGlsZSBzaGFkZXJgKTtcbiAgfVxuICByZXR1cm4gbW9kdWxlO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaW1wb3J0IHN0YXRlbWVudHMgaW4gc2hhZGVyIGNvZGUgdG8gaW5jbHVkZSB0aGUgY29udGVudCBvZiByZWZlcmVuY2VkIG1vZHVsZXNcbiAqIEBwYXJhbSBjb2RlIC0gVGhlIHNoYWRlciBjb2RlIGNvbnRhaW5pbmcgaW1wb3J0IHN0YXRlbWVudHNcbiAqIEBwYXJhbSBpbmNsdWRlcyAtIE9wdGlvbmFsIG1hcHBpbmcgb2YgbW9kdWxlIG5hbWVzIHRvIHRoZWlyIGNvbnRlbnRcbiAqIEByZXR1cm5zIFRoZSBwcm9jZXNzZWQgc2hhZGVyIGNvZGUgd2l0aCBpbXBvcnRzIHJlc29sdmVkXG4gKi9cbmZ1bmN0aW9uIHByZXBlbmRJbmNsdWRlcyhjb2RlOiBzdHJpbmcsIGluY2x1ZGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IHN0cmluZyB7XG4gIC8vIEV4dHJhY3QgaW1wb3J0IHN0YXRlbWVudHNcbiAgY29uc3QgaW1wb3J0UmVnZXggPSAvXiNpbXBvcnRcXHMrKFthLXpBLVowLTlfXSspOjooW2EtekEtWjAtOV9dKykvZ207XG4gIGNvbnN0IGltcG9ydHMgPSBbLi4uY29kZS5tYXRjaEFsbChpbXBvcnRSZWdleCldO1xuXG4gIC8vIEJ1aWxkIGEgbWFwIG9mIGltcG9ydHMgdG8gdGhlaXIgY29udGVudFxuICBjb25zdCBpbmNsdWRlc1RvQWRkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgLy8gUHJvY2VzcyBlYWNoIGltcG9ydFxuICBmb3IgKGNvbnN0IFtmdWxsTWF0Y2gsIG5hbWVzcGFjZSwgbW9kdWxlTmFtZV0gb2YgaW1wb3J0cykge1xuICAgIGlmIChuYW1lc3BhY2UgPT09IFwiaW5jbHVkZXNcIiAmJiBpbmNsdWRlcyAmJiBtb2R1bGVOYW1lIGluIGluY2x1ZGVzKSB7XG4gICAgICBpbmNsdWRlc1RvQWRkW2Z1bGxNYXRjaF0gPSBpbmNsdWRlc1ttb2R1bGVOYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgcmVzb2x2ZSBpbXBvcnQ6ICR7ZnVsbE1hdGNofWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlcGxhY2UgaW1wb3J0IHN0YXRlbWVudHMgd2l0aCB0aGVpciBjb250ZW50XG4gIGxldCBwcm9jZXNzZWRDb2RlID0gY29kZTtcbiAgZm9yIChjb25zdCBbaW1wb3J0U3RhdGVtZW50LCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhpbmNsdWRlc1RvQWRkKSkge1xuICAgIC8vIFJlcGxhY2UgdGhlIGltcG9ydCBzdGF0ZW1lbnQgd2l0aCB0aGUgY29udGVudFxuICAgIHByb2Nlc3NlZENvZGUgPSBwcm9jZXNzZWRDb2RlLnJlcGxhY2UoaW1wb3J0U3RhdGVtZW50LCBjb250ZW50KTtcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzZWRDb2RlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGVyZm9ybWFuY2VRdWVyaWVzKGRldmljZTogR1BVRGV2aWNlKTogUHJvbWlzZTx7XG4gIHF1ZXJ5U2V0OiBHUFVRdWVyeVNldDtcbiAgcmVzb2x2ZUJ1ZmZlcjogR1BVQnVmZmVyO1xuICByZXN1bHRCdWZmZXI6IEdQVUJ1ZmZlcjtcbn0+IHtcbiAgY29uc3QgY2FuVGltZXN0YW1wID0gZGV2aWNlLmZlYXR1cmVzLmhhcyhcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgLy8gaWYgKCFjYW5UaW1lc3RhbXApIHtcbiAgLy8gICBjb25zb2xlLndhcm4oXCJUaW1lc3RhbXAgcXVlcmllcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGlzIGRldmljZS5cIik7XG4gIC8vICAgcmV0dXJuIHt9O1xuICAvLyB9XG4gIGNvbnN0IHF1ZXJ5U2V0ID0gZGV2aWNlLmNyZWF0ZVF1ZXJ5U2V0KHtcbiAgICB0eXBlOiBcInRpbWVzdGFtcFwiLFxuICAgIGNvdW50OiAyLFxuICB9KTtcblxuICBjb25zdCByZXNvbHZlQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgc2l6ZTogcXVlcnlTZXQuY291bnQgKiA4LFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5RVUVSWV9SRVNPTFZFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gIH0pO1xuXG4gIGNvbnN0IHJlc3VsdEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIHNpemU6IHJlc29sdmVCdWZmZXIuc2l6ZSxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCxcbiAgfSk7XG5cbiAgcmV0dXJuIHsgcXVlcnlTZXQsIHJlc29sdmVCdWZmZXIsIHJlc3VsdEJ1ZmZlciB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBJbnRlcmFjdGlvbnMoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgT2Zmc2NyZWVuQ2FudmFzLFxuICB0ZXh0dXJlOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0sXG4gIHNpemU6IG51bWJlciA9IDEwXG4pOiB7XG4gIGludGVyYWN0aW9uczoge1xuICAgIGRhdGE6IEZsb2F0MzJBcnJheTtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgfTtcbiAgY29udHJvbHM6IHtcbiAgICBkYXRhOiBBcnJheUJ1ZmZlcjtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgfTtcbiAgdHlwZTogR1BVQnVmZmVyQmluZGluZ1R5cGU7XG59IHtcbiAgbGV0IHVuaWZvcm1CdWZmZXJEYXRhID0gbmV3IEZsb2F0MzJBcnJheSg0KTtcbiAgbGV0IGNvbnRyb2xzQnVmZmVyRGF0YSA9IG5ldyBBcnJheUJ1ZmZlcigzNjgpO1xuXG4gIHZhciBzaWduID0gMTtcblxuICBsZXQgcG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IHZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XSk7XG4gIGlmIChjYW52YXMgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgIC8vIGRpc2FibGUgY29udGV4dCBtZW51XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBtb3ZlIGV2ZW50c1xuICAgIFtcIm1vdXNlbW92ZVwiLCBcInRvdWNobW92ZVwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBsZXQgY2xpZW50WCA9IDA7XG4gICAgICAgICAgbGV0IGNsaWVudFkgPSAwO1xuXG4gICAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xuICAgICAgICAgICAgY2xpZW50WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgICAgICBjbGllbnRZID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICBjbGllbnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgY2xpZW50WSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3NpdGlvbi54ID0gY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgICBwb3NpdGlvbi55ID0gY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgICAgLy8gU2NhbGUgZnJvbSBDU1MgcGl4ZWxzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXNcbiAgICAgICAgICBjb25zdCB4ID0gTWF0aC5mbG9vcigocG9zaXRpb24ueCAvIHJlY3Qud2lkdGgpICogdGV4dHVyZS53aWR0aCk7XG4gICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoKHBvc2l0aW9uLnkgLyByZWN0LmhlaWdodCkgKiB0ZXh0dXJlLmhlaWdodCk7XG5cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3gsIHldKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyB6b29tIGV2ZW50cyBUT0RPKEBnc3plcCkgYWRkIHBpbmNoIGFuZCBzY3JvbGwgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJ3aGVlbFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICBjYXNlIGV2ZW50IGluc3RhbmNlb2YgV2hlZWxFdmVudDpcbiAgICAgICAgICAgICAgdmVsb2NpdHkueCA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgdmVsb2NpdHkueSA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2l6ZSArPSB2ZWxvY2l0eS55O1xuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbc2l6ZV0sIDIpO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIGNsaWNrIGV2ZW50cyBUT0RPKEBnc3plcCkgaW1wbGVtZW50IHJpZ2h0IGNsaWNrIGVxdWl2YWxlbnQgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJtb3VzZWRvd25cIiwgXCJ0b3VjaHN0YXJ0XCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gMSAtIGV2ZW50LmJ1dHRvbjtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBUb3VjaEV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxID8gLTEgOiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3NpZ24gKiBzaXplXSwgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuICAgIFtcIm1vdXNldXBcIiwgXCJ0b3VjaGVuZFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtOYU5dLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdW5pZm9ybUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIGxhYmVsOiBcIkludGVyYWN0aW9uIEJ1ZmZlclwiLFxuICAgIHNpemU6IHVuaWZvcm1CdWZmZXJEYXRhLmJ5dGVMZW5ndGgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgY29uc3QgY29udHJvbHNCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJDb250cm9scyBCdWZmZXJcIixcbiAgICBzaXplOiBjb250cm9sc0J1ZmZlckRhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGludGVyYWN0aW9uczogeyBkYXRhOiB1bmlmb3JtQnVmZmVyRGF0YSwgYnVmZmVyOiB1bmlmb3JtQnVmZmVyIH0sXG4gICAgY29udHJvbHM6IHsgZGF0YTogY29udHJvbHNCdWZmZXJEYXRhLCBidWZmZXI6IGNvbnRyb2xzQnVmZmVyIH0sXG4gICAgdHlwZTogXCJ1bmlmb3JtXCIsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFRleHR1cmVzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYmluZGluZ3M6IG51bWJlcltdLFxuICBkYXRhOiB7IFtrZXk6IG51bWJlcl06IG51bWJlcltdW11bXSB9LFxuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9LFxuICBmb3JtYXQ/OiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmVGb3JtYXQgfVxuKToge1xuICBjYW52YXM6IHtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgICBkYXRhOiBVaW50MzJBcnJheTtcbiAgICB0eXBlOiBHUFVCdWZmZXJCaW5kaW5nVHlwZTtcbiAgfTtcbiAgdGV4dHVyZXM6IHsgW2tleTogbnVtYmVyXTogR1BVVGV4dHVyZSB9O1xuICBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9O1xuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9O1xufSB7XG4gIGNvbnN0IHRleHR1cmVzOiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmUgfSA9IHt9O1xuICBjb25zdCBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9ID0ge307XG4gIGNvbnN0IGRlcHRoT3JBcnJheUxheWVycyA9IHNpemUuZGVwdGhPckFycmF5TGF5ZXJzIHx8IHt9O1xuICBjb25zdCBERUZBVUxUX0ZPUk1BVCA9IFwicjMyZmxvYXRcIjtcblxuICBiaW5kaW5ncy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0ZXh0dXJlc1trZXldID0gZGV2aWNlLmNyZWF0ZVRleHR1cmUoe1xuICAgICAgdXNhZ2U6IEdQVVRleHR1cmVVc2FnZS5TVE9SQUdFX0JJTkRJTkcgfCBHUFVUZXh0dXJlVXNhZ2UuQ09QWV9EU1QsXG4gICAgICBmb3JtYXQ6IGZvcm1hdCAmJiBrZXkgaW4gZm9ybWF0ID8gZm9ybWF0W2tleV0gOiBERUZBVUxUX0ZPUk1BVCxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgIGRlcHRoT3JBcnJheUxheWVyczoga2V5IGluIGRlcHRoT3JBcnJheUxheWVycyA/IGRlcHRoT3JBcnJheUxheWVyc1trZXldIDogMSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKHRleHR1cmVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCBsYXllcnMgPSBrZXkgaW4gZGVwdGhPckFycmF5TGF5ZXJzID8gZGVwdGhPckFycmF5TGF5ZXJzW2tleV0gOiAxO1xuXG4gICAgYmluZGluZ0xheW91dFtrZXldID0ge1xuICAgICAgZm9ybWF0OiBmb3JtYXQgJiYga2V5IGluIGZvcm1hdCA/IGZvcm1hdFtrZXldIDogREVGQVVMVF9GT1JNQVQsXG4gICAgICBhY2Nlc3M6IFwicmVhZC13cml0ZVwiLFxuICAgICAgdmlld0RpbWVuc2lvbjogbGF5ZXJzID4gMSA/IFwiMmQtYXJyYXlcIiA6IFwiMmRcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYXJyYXkgPSBrZXkgaW4gZGF0YSA/IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbihkYXRhW2tleV0pKSA6IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZS53aWR0aCAqIHNpemUuaGVpZ2h0ICogbGF5ZXJzKTtcblxuICAgIGNvbnN0IGNoYW5uZWxzID0gY2hhbm5lbENvdW50KGJpbmRpbmdMYXlvdXRba2V5XS5mb3JtYXQpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZVRleHR1cmUoXG4gICAgICB7IHRleHR1cmU6IHRleHR1cmVzW2tleV0gfSxcbiAgICAgIC8qZGF0YT0qLyBhcnJheSxcbiAgICAgIC8qZGF0YUxheW91dD0qLyB7XG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgYnl0ZXNQZXJSb3c6IHNpemUud2lkdGggKiBhcnJheS5CWVRFU19QRVJfRUxFTUVOVCAqIGNoYW5uZWxzLFxuICAgICAgICByb3dzUGVySW1hZ2U6IHNpemUuaGVpZ2h0LFxuICAgICAgfSxcbiAgICAgIC8qc2l6ZT0qLyB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgICAgICBkZXB0aE9yQXJyYXlMYXllcnM6IGxheWVycyxcbiAgICAgIH1cbiAgICApO1xuICB9KTtcblxuICBsZXQgY2FudmFzRGF0YSA9IG5ldyBVaW50MzJBcnJheShbc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQsIDAsIDAsIDAsIDBdKTtcbiAgY29uc3QgY2FudmFzQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgbGFiZWw6IFwiQ2FudmFzIEJ1ZmZlclwiLFxuICAgIHNpemU6IGNhbnZhc0RhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoY2FudmFzQnVmZmVyLCAvKm9mZnNldD0qLyAwLCAvKmRhdGE9Ki8gY2FudmFzRGF0YSk7XG5cbiAgcmV0dXJuIHtcbiAgICBjYW52YXM6IHtcbiAgICAgIGJ1ZmZlcjogY2FudmFzQnVmZmVyLFxuICAgICAgZGF0YTogY2FudmFzRGF0YSxcbiAgICAgIHR5cGU6IFwidW5pZm9ybVwiLFxuICAgIH0sXG4gICAgdGV4dHVyZXM6IHRleHR1cmVzLFxuICAgIGJpbmRpbmdMYXlvdXQ6IGJpbmRpbmdMYXlvdXQsXG4gICAgc2l6ZTogc2l6ZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2hhbm5lbENvdW50KGZvcm1hdDogR1BVVGV4dHVyZUZvcm1hdCk6IG51bWJlciB7XG4gIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ2JhXCIpKSB7XG4gICAgcmV0dXJuIDQ7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdiXCIpKSB7XG4gICAgcmV0dXJuIDM7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdcIikpIHtcbiAgICByZXR1cm4gMjtcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyXCIpKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXQ6IFwiICsgZm9ybWF0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuKG5lc3RlZEFycmF5OiBudW1iZXJbXVtdW10pOiBudW1iZXJbXSB7XG4gIGNvbnN0IGZsYXR0ZW5lZDogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgayA9IDA7IGsgPCBuZXN0ZWRBcnJheVswXVswXS5sZW5ndGg7IGsrKykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmVzdGVkQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbmVzdGVkQXJyYXlbMF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZmxhdHRlbmVkLnB1c2gobmVzdGVkQXJyYXlbaV1bal1ba10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmbGF0dGVuZWQ7XG59XG5cbmZ1bmN0aW9uIHplcm9zKGhlaWdodDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBsYXllcnM6IG51bWJlciA9IDEpOiBudW1iZXJbXVtdW10ge1xuICBjb25zdCB6ZXJvQXJyYXk6IG51bWJlcltdW11bXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICBjb25zdCByb3c6IG51bWJlcltdW10gPSBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgIGNvbnN0IGxheWVyOiBudW1iZXJbXSA9IFtdO1xuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBsYXllcnM7IGsrKykge1xuICAgICAgICBsYXllci5wdXNoKDApO1xuICAgICAgfVxuICAgICAgcm93LnB1c2gobGF5ZXIpO1xuICAgIH1cbiAgICB6ZXJvQXJyYXkucHVzaChyb3cpO1xuICB9XG5cbiAgcmV0dXJuIHplcm9BcnJheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbVZhbHVlcyhsZW5ndGg6IG51bWJlciwgcmFuZG9tPzogKCkgPT4gbnVtYmVyKTogVWludDMyQXJyYXkge1xuICAvLyBmYXN0IGNwdS1zaWRlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdGlvblxuXG4gIGNvbnN0IG1heENodW5rTGVuZ3RoID0gNjU1MzYgLyA0O1xuICBjb25zdCByZXN1bHQgPSBuZXcgVWludDMyQXJyYXkoNCAqIGxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNCAqIGxlbmd0aDsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIGNvbnN0IGNodW5rTGVuZ3RoID0gTWF0aC5taW4obWF4Q2h1bmtMZW5ndGgsIDQgKiBsZW5ndGggLSBpKTtcbiAgICBpZiAocmFuZG9tKSB7XG4gICAgICBmb3IgKGxldCBqID0gaTsgaiA8IE1hdGgubWluKGkgKyBjaHVua0xlbmd0aCwgcmVzdWx0Lmxlbmd0aCk7IGorKykgcmVzdWx0W2pdID0gTWF0aC5mbG9vcihyYW5kb20oKSAqIDQyOTQ5NjcyOTYpO1xuICAgIH0gZWxzZSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJlc3VsdC5zdWJhcnJheShpLCBpICsgY2h1bmtMZW5ndGgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY2xhc3MgUGVyZm9ybWFuY2VNb25pdG9yIHtcbiAgcHJpdmF0ZSBsYXN0VGltZTogbnVtYmVyO1xuICBwcml2YXRlIGZyYW1lQ291bnQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBmcmFtZXNQZXJUaW1lTG9nOiBudW1iZXI7XG4gIHByaXZhdGUgZnBzRGlzcGxheTogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZnJhbWVzUGVyVGltZUxvZzogbnVtYmVyID0gMzApIHtcbiAgICB0aGlzLmZyYW1lc1BlclRpbWVMb2cgPSBmcmFtZXNQZXJUaW1lTG9nO1xuICAgIHRoaXMuZnBzRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSE7XG4gICAgdGhpcy5sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuZnJhbWVDb3VudCA9IDA7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKHRpbWU6IG51bWJlcikge1xuICAgIGlmICh0aW1lICUgdGhpcy5mcmFtZXNQZXJUaW1lTG9nID09PSAwKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgY29uc3QgdGltZUVsYXBzZWQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWU7XG5cbiAgICAgIC8vIEZQUyBDYWxjdWxhdGlvblxuICAgICAgY29uc3QgZnBzID0gTWF0aC5yb3VuZCgodGhpcy5mcmFtZUNvdW50ICogMTAwMCkgLyB0aW1lRWxhcHNlZCk7XG4gICAgICB0aGlzLmZwc0Rpc3BsYXkudGV4dENvbnRlbnQgPSBgRlBTOiAke2Zwc31gO1xuXG4gICAgICAvLyBSZXNldCBjb3VudGVyc1xuICAgICAgdGhpcy5mcmFtZUNvdW50ID0gMDtcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICB9XG4gICAgdGhpcy5mcmFtZUNvdW50Kys7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==