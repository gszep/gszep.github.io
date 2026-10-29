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
        s.insidePolymerBeads !== s.inPolymer ||
        (fixedArea && Math.abs(s.cell.area - 1) > 0.001))
        return "fatal";
    if (s.crossingFilamentBonds === 0)
        return "valid";
    return Number.isInteger(s.crossingFilamentBonds) && s.crossingFilamentBonds > 0 && s.crossingFilamentBonds <= 8 ? "contacts" : "fatal";
}
// Called synchronously from the asynchronous diagnostic callback, but never
// awaited by that callback. The active flag freezes new physics submissions.
class ContactRecovery {
    active = false;
    history = [];
    pending = null;
    recent = [];
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
                this.recent = this.recent.filter((step) => trigger.step - step < 1000);
                if (this.recent.length >= 3)
                    throw Error("Repeated contact failures: recovery budget exhausted");
                this.recent.push(trigger.step);
                d.notice(`Rechecking ${trigger.crossingFilamentBonds} contact crossing(s)…`);
                let state = await d.inspect();
                checkBudget();
                record.currentStep = state.step;
                let kind = classifyCheckpoint(state, d.fixedArea());
                if (kind === "valid") {
                    record.outcome = "fresh-state-clean";
                    d.notice("Current state verified; continuing.");
                    return;
                }
                if (kind !== "contacts")
                    throw Error("Current state has a non-recoverable invariant failure");
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
                        throw Error("Contact correction changed another invariant");
                }
                throw Error("Contact correction did not converge within 60 extra passes");
            }
            catch (error) {
                record.outcome = "failed";
                record.error = String(error);
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
        const text = String(error);
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
    constructor(device, canvasFormat, canvasSize, renderShader, textures, sharedLayoutEntries, sharedBindGroupEntries, geometry) {
        this.device = device;
        this.canvasFormat = canvasFormat;
        this.size = canvasSize;
        this.camera = { x: canvasSize.width / 2, y: canvasSize.height / 2 };
        this.cameraTarget = { ...this.camera };
        this.TEXTURE_WORKGROUP_COUNT = [Math.ceil(textures.size.width / 16), Math.ceil(textures.size.height / 16)];
        const BINDING_INTERMEDIATE_TEXTURE = 10;
        this.viewBuffer = device.createBuffer({ size: 48, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
        const specimen = device.createTexture({
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
        if (this.view.mode) {
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

module.exports = "// Coarse-grained, transient contractile crosslinks between EXPLICIT actin beads.\n// Shortening a link represents motor work; it is not an ATP cycle or a prediction\n// of molecular stepping. Each force has an equal and opposite partner. Snapshots\n// and fixed-point scatter accumulation prevent read/write races in these passes.\nconst MOTOR_SLOTS = 256u;\nconst FORCE_SCALE = 65536.0;\nstruct MechanicalSnapshot {\n  position: vec2<f32>,\n  orientation: vec2<f32>,\n  head: u32,\n  tail: u32,\n  attached: u32,\n  unused: u32,\n}\nstruct MechanicalLink {\n  a: u32, // actin index + 1, zero means unbound\n  b: u32,\n  rest: f32,\n  age: u32,\n  headA: u32,\n  tailA: u32,\n  headB: u32,\n  tailB: u32,\n}\nstruct MechanicalForce { x: atomic<i32>, y: atomic<i32> }\n@group(GROUP_INDEX) @binding(MECHANICAL_SNAPSHOT)\nvar<storage, read_write> mechanical_snapshot: array<MechanicalSnapshot>;\n@group(GROUP_INDEX) @binding(MECHANICAL_LINKS)\nvar<storage, read_write> mechanical_links: array<MechanicalLink>;\n@group(GROUP_INDEX) @binding(MECHANICAL_FORCES)\nvar<storage, read_write> mechanical_forces: array<MechanicalForce>;\n\nfn add_mechanical_force(i: u32, f: vec2<f32>) {\n  atomicAdd(&mechanical_forces[i].x, i32(round(f.x * FORCE_SCALE)));\n  atomicAdd(&mechanical_forces[i].y, i32(round(f.y * FORCE_SCALE)));\n}\n\n// Legacy mode uses a selected material vertex; renewal mode uses a persistent\n// cell-centred direction. Both prescribe polarity, not spontaneous biochemical\n// polarization or a translational steering force.\nfn cue_slot() -> u32 { return controls.actinCount + controls.membraneCount + 1u; }\nfn front_index() -> u32 { return mechanical_snapshot[cue_slot()].head; }\nfn front_arc() -> f32 { return f32(front_index()) / f32(controls.membraneCount); }\nfn polarity_axis() -> vec2<f32> {\n  let p = mechanical_snapshot[cue_slot()].orientation;\n  return select(vec2<f32>(1.0, 0.0), p, dot(p,p) > 0.5);\n}\nfn cell_center() -> vec2<f32> { return mechanical_snapshot[enclosure_slot()].position; }\nfn front_coordinate(p: vec2<f32>, material_arc: f32) -> f32 {\n  if (controls.polarityMode == 0u) { return fract(material_arc - front_arc()); }\n  let radial = normalize_safely(p - cell_center());\n  let axis = polarity_axis();\n  return fract(atan2(cross2(axis, radial), dot(axis, radial)) / (2.0 * PI) + 1.0);\n}\n\n@compute @workgroup_size(1)\nfn resolve_front_cue() {\n  var nearest = 0u;\n  if (controls.polarityMode != 0u) {\n    var state = mechanical_snapshot[cue_slot()];\n    let initialized = dot(state.orientation,state.orientation) > 0.5;\n    var axis = select(vec2<f32>(1.0,0.0),state.orientation,initialized);\n    var goalDirection = vec2<f32>(bitcast<f32>(state.attached),bitcast<f32>(state.unused));\n    if (!initialized || state.tail != controls.cueVersion) {\n      goalDirection = vec2<f32>(1.0,0.0);\n      if (controls.cueEnabled != 0u) {\n        goalDirection=axis;\n        if(distance(controls.cueTarget,cell_center()) > 1e-4) {goalDirection = normalize_safely(controls.cueTarget-cell_center());}\n      }\n    }\n    let angle = atan2(cross2(axis,goalDirection),dot(axis,goalDirection));\n    axis = rotate(axis,clamp(angle,-controls.polarityTurnRate,controls.polarityTurnRate));\n    var furthest = -1e30;\n    for (var i=0u;i<controls.membraneCount;i++) {\n      let projection=dot(membrane[i].position-cell_center(),axis);\n      if(projection>furthest){furthest=projection;nearest=i;}\n    }\n    state.orientation=axis;state.attached=bitcast<u32>(goalDirection.x);state.unused=bitcast<u32>(goalDirection.y);\n    state.head=nearest;state.tail=controls.cueVersion;state.position=membrane[nearest].position;\n    mechanical_snapshot[cue_slot()]=state;\n    return;\n  }\n  if (controls.cueEnabled != 0u) {\n    var distance_squared = 1e30;\n    for (var i = 0u; i < controls.membraneCount; i++) {\n      let delta = membrane[i].position - controls.cueTarget;\n      let d = dot(delta, delta);\n      if (d < distance_squared) { distance_squared = d; nearest = i; }\n    }\n  }\n  // Selection only: no position, force, or velocity is written to the cell.\n  mechanical_snapshot[cue_slot()].head = nearest;\n  mechanical_snapshot[cue_slot()].tail = controls.cueVersion;\n  mechanical_snapshot[cue_slot()].position = membrane[nearest].position;\n  mechanical_snapshot[cue_slot()].orientation = vec2<f32>(0.0);\n}\n\n@compute @workgroup_size(1)\nfn draw_resolved_cue() {\n  if (controls.cueEnabled == 0u && controls.polarityMode == 0u) { return; }\n  let p = membrane[front_index()].position;\n  mechanical_snapshot[cue_slot()].position = p;\n  for (var y = -3; y <= 3; y++) {\n    for (var x = -3; x <= 3; x++) {\n      if (x*x+y*y<=9) { store_texture(parameter_fields, DEBUG, as_vec2i(p)+vec2<i32>(x,y), 8.0); }\n    }\n  }\n  if (controls.polarityMode != 0u) {\n    for (var t=0.0;t<=10.0;t+=1.0) {store_texture(parameter_fields,DEBUG,as_vec2i(p+polarity_axis()*t),8.0);}\n  }\n}\n\nfn front_fraction(p: vec2<f32>) -> f32 {\n  if (controls.polarityMode != 0u) {\n    let radius=sqrt(max(1.0,mechanical_snapshot[enclosure_slot()].orientation.x)/PI);\n    return clamp(0.5+0.5*dot(p-cell_center(),polarity_axis())/radius,0.0,1.0);\n  }\n  let n = controls.actinCount;\n  let i = front_index();\n  let rear = mechanical_snapshot[n + (i + controls.membraneCount / 2u) % controls.membraneCount].position;\n  let front = mechanical_snapshot[n + i].position;\n  let axis = front - rear;\n  return clamp(dot(p - rear, axis) / max(dot(axis, axis), 1.0), 0.0, 1.0);\n}\nfn rear_maturity(p: vec2<f32>, age: f32) -> f32 {\n  let rear=1.0-smoothstep(0.3,0.7,front_fraction(p));\n  let scale=max(1.0,controls.turnoverAge);\n  return rear*smoothstep(scale,2.0*scale,age);\n}\nfn growing_head(s: Segment) -> bool {\n  return is_head(s) && (controls.rearTurnover <= 0.0 || rear_maturity(s.position,s.age) < 0.5);\n}\n\nfn same_actin(i: u32, h: u32, t: u32) -> bool {\n  let s = mechanical_snapshot[i];\n  return s.attached == 1u && s.head == h && s.tail == t;\n}\n\n@compute @workgroup_size(WGSZ)\nfn snapshot_mechanics(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  let n = controls.actinCount;\n  if (i >= n + controls.membraneCount) { return; }\n  var s: Segment;\n  if (i < n) { s = actines[i]; } else { s = membrane[i - n]; }\n  mechanical_snapshot[i] = MechanicalSnapshot(s.position, s.orientation, s.head, s.tail,\n    select(0u, 1u, s.head != s.id || s.tail != s.id), bitcast<u32>(s.age));\n  atomicStore(&mechanical_forces[i].x, 0);\n  atomicStore(&mechanical_forces[i].y, 0);\n}\n\n@compute @workgroup_size(WGSZ)\nfn motor_links(@builtin(global_invocation_id) id: vec3u) {\n  let slot = id.x;\n  if (slot >= MOTOR_SLOTS) { return; }\n  let rng = controls.actinCount + controls.membraneCount + slot;\n  if (controls.myosinStrength <= 0.0) { mechanical_links[slot].a = 0u; return; }\n  var link = mechanical_links[slot];\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let b = link.b - 1u;\n    if (!same_actin(a, link.headA, link.tailA) || !same_actin(b, link.headB, link.tailB) ||\n        link.age >= 300u || distance(mechanical_snapshot[a].position, mechanical_snapshot[b].position) > 24.0) {\n      link.a = 0u;\n    }\n  }\n  if (link.a == 0u) {\n    // Bounded search. No teleportation or global pull: a motor must find two\n    // nearby polymerized beads, on different local filament segments.\n    for (var trial = 0u; trial < 24u; trial++) {\n      let a = min(u32(random_uniform(rng) * f32(controls.actinCount)), controls.actinCount - 1u);\n      let sa = mechanical_snapshot[a];\n      if (sa.attached == 0u || random_uniform(rng) < front_fraction(sa.position)) { continue; }\n      if (controls.motorRearBias > 0.0 && random_uniform(rng) > mix(1.0,rear_maturity(sa.position,bitcast<f32>(sa.unused)),controls.motorRearBias)) { continue; }\n      let theta = random_uniform(rng) * 2.0 * PI;\n      let radius = 3.0 + random_uniform(rng) * 9.0;\n      let q = as_vec2i(sa.position + radius * vec2<f32>(cos(theta), sin(theta)));\n      let signal = load_texture_index(POLYMER_INDEX, q);\n      if (signal == 0u || signal > controls.actinCount) { continue; }\n      let b = signal - 1u;\n      let sb = mechanical_snapshot[b];\n      let d = distance(sa.position, sb.position);\n      if (a == b || b == sa.head || b == sa.tail || a == sb.head || a == sb.tail ||\n          sb.attached == 0u || any(as_vec2i(sb.position) != q) || d < 3.0 || d > 12.0 ||\n          dot(sa.orientation, sb.orientation) > 0.5) { continue; }\n      link = MechanicalLink(a + 1u, b + 1u, d, 0u, sa.head, sa.tail, sb.head, sb.tail);\n      break;\n    }\n  }\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let b = link.b - 1u;\n    let offset = mechanical_snapshot[b].position - mechanical_snapshot[a].position;\n    let d = length(offset);\n    let activation=mix(1.0,0.5*(rear_maturity(mechanical_snapshot[a].position,bitcast<f32>(mechanical_snapshot[a].unused))+\n      rear_maturity(mechanical_snapshot[b].position,bitcast<f32>(mechanical_snapshot[b].unused))),controls.motorRearBias);\n    link.rest = max(2.0, link.rest - controls.myosinSpeed * activation);\n    let f = normalize_safely(offset) * min(0.1, controls.myosinStrength * activation * max(0.0, d - link.rest));\n    add_mechanical_force(a, f);\n    add_mechanical_force(b, -f);\n    link.age++;\n  }\n  mechanical_links[slot] = link;\n}\n\n@compute @workgroup_size(WGSZ)\nfn membrane_tethers(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.membraneCount) { return; }\n  let slot = MOTOR_SLOTS + i;\n  if (controls.membraneCoupling <= 0.0) { mechanical_links[slot].a = 0u; mechanical_links[slot].age = 0u; return; }\n  let m = controls.actinCount + i;\n  let p = mechanical_snapshot[m].position;\n  var link = mechanical_links[slot];\n  let rng = controls.actinCount + i;\n  if (link.a > 0u) {\n    let extension=distance(mechanical_snapshot[link.a - 1u].position,p);\n    var detach = !same_actin(link.a - 1u, link.headA, link.tailA) || link.age >= 600u || extension > 24.0;\n    if (controls.tetherTurnover != 0u) {\n      let hazard=controls.tetherOffRate+controls.tetherLoadOff*max(0.0,extension-link.rest);\n      detach = detach || random_uniform(rng) < 1.0-exp(-hazard);\n    }\n    if (detach) {\n      link.a=0u;\n      if (controls.tetherTurnover != 0u) {\n        link.age=controls.tetherRecoverySteps;\n        mechanical_links[slot]=link;\n        atomicAdd(&telemetry[TELEMETRY_TETHER_RELEASED],1u);\n        return;\n      }\n    }\n  }\n  if (link.a == 0u) {\n    if (controls.tetherTurnover != 0u) {\n      if (link.age>0u) {link.age--;mechanical_links[slot]=link;return;}\n      if (random_uniform(rng) >= controls.tetherOnRate) { return; }\n    }\n    var best = 13.0;\n    // Deterministic local search over the current polymer index. A tether binds\n    // slack at the observed distance and becomes tensile only after separation.\n    for (var dy = -12; dy <= 12; dy += 2) {\n      for (var dx = -12; dx <= 12; dx += 2) {\n        let q = as_vec2i(p) + vec2<i32>(dx, dy);\n        let signal = load_texture_index(POLYMER_INDEX, q);\n        if (signal == 0u || signal > controls.actinCount) { continue; }\n        let a = signal - 1u;\n        let s = mechanical_snapshot[a];\n        let d = distance(p, s.position);\n        if (s.attached == 1u && all(as_vec2i(s.position) == q) && d < best) {\n          best = d;\n          link = MechanicalLink(a + 1u, 0u, d, 0u, s.head, s.tail, 0u, 0u);\n        }\n      }\n    }\n  }\n  if (link.a > 0u) {\n    let a = link.a - 1u;\n    let offset = mechanical_snapshot[a].position - p;\n    let f = normalize_safely(offset) * min(0.1, controls.membraneCoupling * max(0.0, length(offset) - link.rest));\n    add_mechanical_force(m, f);\n    add_mechanical_force(a, -f);\n    link.age++;\n  }\n  mechanical_links[slot] = link;\n}\n\n@compute @workgroup_size(WGSZ)\nfn apply_mechanical_forces(@builtin(global_invocation_id) id: vec3u) {\n  let i = id.x;\n  if (i >= controls.actinCount + controls.membraneCount) { return; }\n  let force = vec2<f32>(f32(atomicLoad(&mechanical_forces[i].x)), f32(atomicLoad(&mechanical_forces[i].y))) / FORCE_SCALE;\n  if (i < controls.actinCount) {\n    // Effective clutch resistance to the added forces, strongest at the front.\n    // The original positional solver is otherwise unchanged; no force-free\n    // hydrodynamics or full focal-adhesion dynamics are implied.\n    let mobility = 1.0 / (1.0 + controls.substrateDrag * front_fraction(mechanical_snapshot[i].position));\n    actines[i].position += mobility * force;\n  } else { membrane[i - controls.actinCount].position += force; }\n}\n\n@compute @workgroup_size(WGSZ)\nfn draw_mechanical_links(@builtin(global_invocation_id) id: vec3u) {\n  let slot = id.x;\n  if (slot >= MOTOR_SLOTS + controls.membraneCount) { return; }\n  let link = mechanical_links[slot];\n  if (link.a == 0u) { return; }\n  let a = actines[link.a - 1u].position;\n  var b: vec2<f32>;\n  var color = 6.0;\n  if (slot < MOTOR_SLOTS) { b = actines[link.b - 1u].position; }\n  else { b = membrane[slot - MOTOR_SLOTS].position; color = 7.0; }\n  let d = distance(a, b);\n  for (var t = 0.0; t <= min(d, 24.0); t += 0.8) {\n    store_texture(parameter_fields, DEBUG, as_vec2i(mix(a, b, t / max(d, 0.01))), color);\n  }\n}\n";

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

module.exports = "struct Segment {\n  id: u32,\n  subtype: u32,\n  position: vec2f,\n  orientation: vec2f,\n  tail: u32,\n  head: u32,\n  arc_length: f32,\n  age: f32, // bound-actin age in fixed steps; occupies the former padding word\n}\n\nfn is_disconnected(segment: Segment) -> bool {\n  return segment.tail == segment.id && segment.head == segment.id;\n}\n\nfn is_head(segment: Segment) -> bool {\n  return segment.tail != segment.id && segment.head == segment.id;\n}\n\nfn has_head(segment: Segment) -> bool {\n  return segment.head != segment.id;\n}\n\nfn is_tail(segment: Segment) -> bool {\n  return segment.tail == segment.id && segment.head != segment.id;\n}\n\nfn has_tail(segment: Segment) -> bool {\n  return segment.tail != segment.id;\n}\n\nfn is_end(segment: Segment) -> bool {\n  return segment.tail == segment.id || segment.head == segment.id;\n}\n\nfn has_connection(segment: Segment) -> bool {\n  return segment.tail != segment.id || segment.head != segment.id;\n}\n\nfn has_both_connections(segment: Segment) -> bool {\n  return segment.tail != segment.id && segment.head != segment.id;\n}\n\n// a branch hangs off the side of its mother filament: its tail points to the mother actin,\n// but the mother's head points along the mother filament, not back to the branch\nfn is_branch_root(idx: u32, segments: ptr<storage, array<Segment>, read_write>) -> bool {\n  let tail = segments[idx].tail;\n  return tail != idx && segments[tail].head != idx;\n}\n\nfn disconnect_from_head(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n\n  segments[segment.head].tail = segments[segment.head].id;\n  segments[idx].head = segment.id;\n}\n\nfn disconnect_from_tail(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let segment = segments[idx];\n\n  segments[segment.tail].head = segments[segment.tail].id;\n  segments[idx].tail = segment.id;\n}\n";

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

module.exports = "#import includes::bindings\n#import includes::textures\n#import includes::random\n#import includes::buffers\n#import includes::actomyosin\n#import includes::enclosure\n\nstruct Canvas {\n  size: vec2<i32>,\n  pass_id: u32,\n  key: vec2<u32>,\n}\n\nstruct NeighborStruct {\n  idx: u32,\n  distance: f32,\n}\n\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n\n@group(GROUP_INDEX) @binding(ACTIN)\n  var<storage, read_write> actines : array<Segment>;\n\n@group(GROUP_INDEX) @binding(MEMBRANE)  \n  var<storage, read_write> membrane : array<Segment>;\n\n@group(GROUP_INDEX) @binding(CONNECTION_LOCKS)\n  var<storage, read_write> connectionLocks: array<atomic<i32>>;\n\n// event counters read back by src/telemetry.ts (same order as TELEMETRY_COUNTERS there)\n@group(GROUP_INDEX) @binding(TELEMETRY)\n  var<storage, read_write> telemetry: array<atomic<u32>>;\nconst TELEMETRY_CANDIDATES = 0;\nconst TELEMETRY_NEIGHBOR_FOUND = 1;\nconst TELEMETRY_PASSED_PROB = 2;\nconst TELEMETRY_BOUND = 3;\nconst TELEMETRY_UNBOUND = 4;\nconst TELEMETRY_ELONGATED = 5;\nconst TELEMETRY_HEADS_IN_FIELD = 6;\nconst TELEMETRY_HEAD_FOUND = 7;\nconst TELEMETRY_BRANCHED = 8;\nconst TELEMETRY_DEBRANCHED = 9;\nconst TELEMETRY_POINT_CONTACTS = 10;\nconst TELEMETRY_BOND_CONTACTS = 11;\nconst TELEMETRY_REAR_LOSS = 12;\nconst TELEMETRY_FRONT_LOSS = 13;\nconst TELEMETRY_REAR_HEAD_LOSS = 14;\nconst TELEMETRY_TETHER_RELEASED = 15;\n\n\n\n\nconst PI = 3.14159265358979323846;\nconst WGSZ = 256;\n\n// new actins are placed this many rest lengths ahead of the filament head\nconst ACTIN_DROP_DISTANCE = 1.5;\n// Arp2/3 branches leave their mother filament at ~70 degrees, toward its plus end\nconst BRANCH_ANGLE = 70.0 * PI / 180.0;\n// how fast a branch root is pulled back to that angle, per step\nconst BRANCH_STIFFNESS = 0.5;\n// a branch whose mother actin got further than this (pixels) has lost it: the mother depolymerized and was rebound elsewhere.\n// Steric jitter alone moves them a couple of pixels apart\nconst BRANCH_MAX_DISTANCE = 6.0;\n\nconst MOVE_EAST = 1;\n\n// distance between two normalized arc lengths on a closed loop\nfn arc_distance(a: f32, b: f32) -> f32 {\n  let d = abs(a - b);\n  return min(d, 1.0 - d);\n}\n\nfn cross2(a: vec2<f32>, b: vec2<f32>) -> f32 {\n  return a.x * b.y - a.y * b.x;\n}\n\nfn perpendicular(v: vec2<f32>) -> vec2<f32> {\n  return vec2<f32>(-v.y, v.x);\n}\n\nfn angle(a: vec2<f32>, b: vec2<f32>) -> f32 {\n  return atan2(a.x * b.y - a.y * b.x, a.x * b.x + a.y * b.y);\n}\n\nfn rotate(v: vec2<f32>, theta: f32) -> vec2<f32> {\n  let c = cos(theta);\n  let s = sin(theta);\n  return vec2<f32>(c * v.x - s * v.y, s * v.x + c * v.y);\n}\n\n\nfn orientation_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, stiffness: f32) {\n  storageBarrier();\n\n  let segment = segments[idx];  \n  \n  // straightening a branch root would fold the branch onto its mother; update_actin_polymer_position keeps its angle instead\n  if (is_disconnected(segment) || idx >= arrayLength(segments) || is_branch_root(idx, segments)) {\n    return;\n  }\n  var tail = segments[segment.tail];\n  var head = segments[segment.head];\n\n  let perp = normalize_safely(perpendicular(segment.orientation));\n\n  // Measure the \"width\" of the membrane at two offset positions\n  let offset_distance = 0.5; // How far to offset the trapezium corners\n  let tail_offset_a = tail.position + perp * offset_distance;\n  let tail_offset_b = tail.position - perp * offset_distance;\n  let head_offset_a = head.position + perp * offset_distance;\n  let head_offset_b = head.position - perp * offset_distance;\n\n  // Compute trapezium edge lengths\n  let distance_a = length(head_offset_a - tail_offset_a);\n  let distance_b = length(head_offset_b - tail_offset_b);\n\n  // both edges prefer the same length, so any difference bends the chain back toward straight\n  let net_torque = distance_a - distance_b;\n\n  segments[idx].position += net_torque * perp * stiffness;\n  }\n\nfn steric_force_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>, coefficients: array<f32, STERIC_POTENTIAL_DIM>) {\n  let segment = segments[idx];\n  \n  if (idx >= arrayLength(segments)) {\n    return;\n  }\n  let theta = random_uniform(idx) * 2.0 * PI;\n  // 1 + was too small. Got artifacts from self. \n  let dx = (2 + f32(controls.steric_sampling_range) * random_uniform(idx)) * vec2<f32>(cos(theta), sin(theta));\n  \n  let normal = perpendicular(segment.orientation);\n  let position = segment.position - normal * dot(normalize_safely(dx), normal) * steric_force(segment.position, dx, coefficients) * 0.5;\n  \n  segments[idx].position = position;\n}\n\n\nfn line_constraint_update(idx: u32, segments: ptr<storage, array<Segment>, read_write>) {\n  let rest_length = controls.equilibrium_line_distance;\n  let segment = segments[idx];\n  \n  if (is_disconnected(segment) || is_end(segment) || idx >= arrayLength(segments)) {\n    return;\n  }\n\n  let tail = segments[segment.tail];\n  let head = segments[segment.head];\n\n  var net_displacement = vec2<f32>(0.0);\n  \n  // Simple spring forces-like constraint to maintain equilibrium distance\n  // use select to avoid branching\n  let tail_vec = tail.position - segment.position;\n  let tail_error = length(tail_vec) - rest_length;\n  net_displacement += select(vec2<f32>(0.0), normalize_safely(tail_vec) * tail_error * 0.5, has_tail(segment));\n\n  // same for head  \n  let head_vec = head.position - segment.position;\n  let head_error = length(head_vec) - rest_length;\n  net_displacement += select(vec2<f32>(0.0), normalize_safely(head_vec) * head_error * 0.5, has_head(segment));\n\n  segments[idx].position = segment.position + net_displacement;\n}\n\n// neighbours 1, 2, 4, ... nodes away on either side that the membrane rules compare with\nconst MEMBRANE_SCALES = 7u;\n\n// The membrane is a rope: it resists stretching, and folds freely when compressed.\n// Tension pulls a node toward the chord between its neighbours (along the curvature), as hard as the membrane\n// between them is stretched beyond its rest length. Measured at several scales, so the pull doesn't fade with\n// the node count: a taut membrane pulls the whole cell in, which is how the rear follows the front.\nfn membrane_constraint_update(idx: u32) {\n  if (idx >= arrayLength(&membrane)) {\n    return;\n  }\n  let segment = membrane[idx];\n  let tail = membrane[segment.tail];\n  let head = membrane[segment.head];\n\n  var net_displacement = vec2<f32>(0.0);\n  var tail_idx = idx;\n  var head_idx = idx;\n  var tail_length = 0.0;\n  var head_length = 0.0;\n  var steps = 0u;\n  for (var scale = 0u; scale < MEMBRANE_SCALES; scale++) {\n    for (; steps < (1u << scale); steps++) {\n      let next_tail = membrane[tail_idx].tail;\n      let next_head = membrane[head_idx].head;\n      tail_length += length(membrane[next_tail].position - membrane[tail_idx].position);\n      head_length += length(membrane[next_head].position - membrane[head_idx].position);\n      tail_idx = next_tail;\n      head_idx = next_head;\n    }\n    let stretch = max(0.0, (tail_length + head_length) / (2.0 * f32(steps) * controls.membraneRestLength) - 1.0);\n    let chord_midpoint = 0.5 * (membrane[tail_idx].position + membrane[head_idx].position);\n    // tension times the curvature of the circle through the node and its two neighbours at this scale, capped\n    // at half the way to the chord so short edges can't overshoot\n    let pull = controls.membraneStiffness * stretch * 2.0 / max(tail_length * head_length, 1e-6);\n    net_displacement += (chord_midpoint - segment.position) * min(0.5, pull);\n  }\n  net_displacement /= f32(MEMBRANE_SCALES);\n\n  // membrane smoothing: move toward the neighbours' midpoint. Fastest where the membrane is sharply curved,\n  // so idle protrusions and cusps retract and flatten while the round body barely shrinks.\n  let midpoint = 0.5 * (tail.position + head.position);\n  net_displacement += (midpoint - segment.position) * controls.membraneSmoothing;\n\n  membrane[idx].position = segment.position + net_displacement;\n  // membrane orientation is not 'constrained', just calculated. Actin carries its own director, see cosserat_update\n  membrane[idx].orientation = normalize_safely(head.position - tail.position);\n}\n\n// Slide membrane nodes along the membrane toward the more stretched side, comparing the membrane length to the\n// neighbours 1, 2, 4, ... nodes away on either side. This evens out node spacing without changing the shape, so\n// membrane flows toward stretched regions like a growing dendrite. The farther neighbours carry it across the\n// whole cell; with the direct neighbours alone it diffuses, and the rear stays crowded while the front is\n// stretched to its max length. A node slides at most half an edge per pass, so it stays on the membrane.\n\n@compute @workgroup_size(WGSZ)\nfn membrane_tangential_flow(@builtin(global_invocation_id) id : vec3u) {\n  if (id.x >= arrayLength(&membrane)) {\n    return;\n  }\n  let segment = membrane[id.x];\n  let tangent = normalize_safely(membrane[segment.head].position - membrane[segment.tail].position);\n  var tail = id.x;\n  var head = id.x;\n  var tail_length = 0.0;\n  var head_length = 0.0;\n  var steps = 0u;\n  var shift = 0.0;\n  for (var scale = 0u; scale < MEMBRANE_SCALES; scale++) {\n    for (; steps < (1u << scale); steps++) {\n      let next_tail = membrane[tail].tail;\n      let next_head = membrane[head].head;\n      tail_length += length(membrane[next_tail].position - membrane[tail].position);\n      head_length += length(membrane[next_head].position - membrane[head].position);\n      tail = next_tail;\n      head = next_head;\n    }\n    // per node, so every scale weighs the same\n    shift += 0.5 * (head_length - tail_length) / f32(steps);\n  }\n  let edge = min(length(membrane[segment.head].position - segment.position), length(membrane[segment.tail].position - segment.position));\n  shift = clamp(shift / f32(MEMBRANE_SCALES) * controls.membraneFlow, -0.5 * edge, 0.5 * edge);\n  membrane[id.x].position += tangent * shift;\n}\n\n// how fast an actin moves onto its neighbours' director lines, per step\nconst ACTIN_SHEAR_STIFFNESS = 0.5;\n// how fast a director turns toward its bond, per step. Kept weak: a director that just follows its bond\n// only describes the current shape, and the positions then have nothing to straighten toward\nconst ACTIN_DIRECTOR_SHEAR = 0.05;\n\n// 2D Cosserat rod for the actin filaments: every actin carries a director (its orientation) besides its position.\n// Bending acts on the angle between neighbouring directors and shear on the angle between a director and its bond,\n// so the stiffness doesn't depend on how far apart the actins are. Spacing is left to the steric forces.\nfn cosserat_update(idx: u32) {\n  if (idx >= arrayLength(&actines)) {\n    return;\n  }\n  let actin = actines[idx];\n  if (is_disconnected(actin)) {\n    return;\n  }\n  // a branch root meets its mother at BRANCH_ANGLE, which update_actin_polymer_position keeps\n  let along_tail = has_tail(actin) && !is_branch_root(idx, &actines);\n  let tail = actines[actin.tail];\n  let head = actines[actin.head];\n\n  // bond toward the head, or from the tail at the plus end\n  let bond = normalize_safely(select(actin.position - tail.position, head.position - actin.position, has_head(actin)));\n\n  // bending: turn the director toward its neighbours' directors\n  var neighbors = vec2<f32>(0.0);\n  neighbors += select(vec2<f32>(0.0), tail.orientation, along_tail);\n  neighbors += select(vec2<f32>(0.0), head.orientation, has_head(actin));\n  var director = normalize_safely(actin.orientation + controls.actinBendStiffness * neighbors);\n  // shear: turn the director toward its bond\n  director = normalize_safely(mix(director, bond, ACTIN_DIRECTOR_SHEAR));\n  actines[idx].orientation = director;\n\n  // shear on the positions: move onto the line the tail's director points along, and onto the line\n  // that puts the head along this director, at the same distances\n  var goal = vec2<f32>(0.0);\n  var count = 0.0;\n  if (along_tail) {\n    goal += tail.position + tail.orientation * length(actin.position - tail.position);\n    count += 1.0;\n  }\n  if (has_head(actin)) {\n    goal += head.position - director * length(head.position - actin.position);\n    count += 1.0;\n  }\n  if (count > 0.0) {\n    actines[idx].position += (goal / count - actin.position) * ACTIN_SHEAR_STIFFNESS;\n  }\n}\n\n// dispatched actinCosseratIterations times per step: each pass carries bending one actin further along a filament\n@compute @workgroup_size(WGSZ)\nfn cosserat_updates(@builtin(global_invocation_id) id : vec3u) {\n  cosserat_update(id.x);\n}\n\n@compute @workgroup_size(WGSZ)\nfn line_constraint_updates(@builtin(global_invocation_id) id : vec3u) {  \n  membrane_constraint_update(id.x);\n  line_constraint_update(id.x, &actines);\n}\n\n@compute @workgroup_size(WGSZ)\nfn orientation_updates(@builtin(global_invocation_id) id : vec3u) {\n  orientation_update(id.x, &membrane, controls.stiffness);\n  // do another update. gets a bit snappier\n  orientation_update(id.x, &membrane, controls.stiffness);\n}\n\n\n@compute @workgroup_size(WGSZ)\nfn steric_force_updates(@builtin(global_invocation_id) id : vec3u) {\n  // only polymers push the membrane. Monomers don't (G-actin barely does), and membrane self-repulsion\n  // makes the soft membrane buckle into persistent waves.\n  steric_force_update(id.x, &membrane, array<f32, STERIC_POTENTIAL_DIM>(0.0, 12.0, 0.0));\n}\n\n@compute @workgroup_size(WGSZ)\nfn update_actin_monomer_position(@builtin(global_invocation_id) id : vec3u) {\n  if (controls.gActinField != 0u) { return; }\n  let idx = id.x;\n  let actin = actines[idx];\n\n  if (has_connection(actin)) {\n    return;\n  }\n\n  let p = actines[idx].position;\n  let tangent = actines[idx].orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange);\n  var stericForce = vec2<f32>(0.0);\n  let membraneSignal = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(p)) * 3.0;\n  // choose either this one or the next. both are nice\n  // these 2 solutions to prevent actin 'highways' near the membrane. Uncomment to see what I mean.\n  let actinRepulsionScale = 0.2 + 0.8 * exp(-membraneSignal * 1000.0);\n  // let actinRepulsionScale = select(1.0, 0.2, membraneSignal/3.0 > 0.0001);\n\n  for (var t = -2.0*range; t <= 2.0*range; t += 1.0*range) {  \n    for (var n = -2.0*range; n <= 2.0*range; n += 1.0*range) { \n      let sample_pos = p + t * tangent + n * normal;\n      let densityMO = load_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(sample_pos)) * 0.4;\n      // how hard monomers are pushed off the membrane; sets the gap between the membrane and the actin\n      let densityME = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(sample_pos)) * controls.monomerMembraneRepulsion;\n\n      var density = densityME + densityMO*0.4;\n      let direction = normalize_safely(p - sample_pos);\n\n      // steer towards highest lifetime density\n      let food_signal = load_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(sample_pos));\n      let moveCondition = food_signal > controls.foodNearbyThreshold;\n\n      stericForce += select(vec2<f32>(0.0), direction * densityMO * actinRepulsionScale, densityMO > 0.0);\n      stericForce += select(vec2<f32>(0.0), direction * densityME, densityME > 0.0);\n    }\n  }\n\n  // go into the direction of the orientation texture\n  // Apply forces - steric force for avoidance, orientation for directed movement\n  actines[id.x].position += controls.actinStericForce * stericForce*10;\n}\n\n// upper bound for stericSelfNeighbors, the filament neighbours on each side that don't repel an actin\nconst MAX_STERIC_SELF_NEIGHBORS = 12u;\n\n@compute @workgroup_size(WGSZ)\nfn update_actin_polymer_position(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n  let actin = actines[idx];\n\n  if (is_disconnected(actin)) {\n    return;\n  }\n\n  let p = actin.position;\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange) * 3.0;\n  var stericForce = vec2<f32>(0.0);\n\n  // the membrane pushes through its field. Sample in a circle pattern\n  let sampleCount = 8; \n  for (var i = 0.0; i < f32(sampleCount); i += 1.0) {\n    let angle = 2.0 * PI * (i / f32(sampleCount));\n    let sampleDir = vec2f(cos(angle), sin(angle));\n    // make a radius that is subject to randomness\n    let radius = 0.1 + random_uniform(idx) * 0.9; // random radius between 0 and 1\n    let sample_pos = p + radius * range * sampleDir;\n\n    let densityME = load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(sample_pos));\n\n    stericForce += select(\n      vec2<f32>(0.0), \n      normalize_safely(p - sample_pos) * densityME, \n      densityME > 0.0\n    );\n  }\n\n  // this actin and its nearest neighbours along its own filament, which don't repel it: the rest length spaces them\n  var own: array<u32, 2 * MAX_STERIC_SELF_NEIGHBORS + 1>;\n  own[0] = idx;\n  var ownCount = 1u;\n  let selfNeighbors = min(controls.stericSelfNeighbors, MAX_STERIC_SELF_NEIGHBORS);\n  var current = idx;\n  for (var k = 0u; k < selfNeighbors && has_tail(actines[current]); k++) {\n    current = actines[current].tail;\n    own[ownCount] = current;\n    ownCount++;\n  }\n  current = idx;\n  for (var k = 0u; k < selfNeighbors && has_head(actines[current]); k++) {\n    current = actines[current].head;\n    own[ownCount] = current;\n    ownCount++;\n  }\n\n  // other polymer actins repel from where they are now, found through the polymer index. The blurred polymer\n  // field also holds where an actin was the last few steps, and an actin pushed by that trail keeps going\n  let center = as_vec2i(p);\n  let reach = i32(ceil(range));\n  for (var dy = -reach; dy <= reach; dy++) {\n    for (var dx = -reach; dx <= reach; dx++) {\n      let q = center + vec2<i32>(dx, dy);\n      let signal = load_texture_index(POLYMER_INDEX, q);\n      if (signal == 0u) {\n        continue;\n      }\n      let j = signal - 1u;\n      let other = actines[j];\n      // the index is never cleared: only count an actin at the pixel it is in now, so it counts once\n      if (is_disconnected(other) || any(as_vec2i(other.position) != q)) {\n        continue;\n      }\n      var isOwn = false;\n      for (var k = 0u; k < ownCount; k++) {\n        isOwn = isOwn || own[k] == j;\n      }\n      let offset = p - other.position;\n      let dist = length(offset);\n      if (!isOwn && dist < range) {\n        stericForce += normalize_safely(offset) * (1.0 - dist / range) * controls.polymerRepulsion;\n      }\n    }\n  }\n\n  actines[id.x].position += 0.5 * stericForce;\n\n  // keep a branch at its angle on whichever side of the mother it is\n  if (is_branch_root(idx, &actines)) {\n    let mother = actines[actin.tail];\n    let side = select(-1.0, 1.0, cross2(mother.orientation, actines[idx].position - mother.position) >= 0.0);\n    actines[idx].position += (branch_position(mother, side) - actines[idx].position) * BRANCH_STIFFNESS;\n  }\n}\n\n// both polymerization fields: the sprout / Move East one and the lamellipodium one\nfn polymerization_signal(p: vec2<f32>) -> f32 {\n  let front = max(load_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p)), load_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p)));\n  // Optional second hypothesis: basal assembly near the entire membrane supplies\n  // a posterior actin substrate. Zero exactly recovers the front-only rule.\n  let cortex = controls.cortexPolymerization * load_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(p));\n  return max(front, cortex);\n}\n\n// where a branch root sits: at BRANCH_ANGLE on the given side (+1 or -1) of its mother, as far from it as the\n// mother's own next actin (the actual spacing, which can stretch above the rest length)\nfn branch_position(mother: Segment, side: f32) -> vec2<f32> {\n  let spacing = max(controls.equilibrium_line_distance, length(actines[mother.head].position - mother.position));\n  return mother.position + rotate(mother.orientation, side * BRANCH_ANGLE) * spacing;\n}\n\n// upper bound for bindLengthSaturation; also caps the walk below\nconst MAX_BIND_LENGTH = 64u;\n\n// number of actins from idx back to the filament's minus end, counting idx, capped at max_length\nfn filament_length(idx: u32, max_length: u32) -> u32 {\n  var current = idx;\n  var n = 1u;\n  while (n < max_length && actines[current].tail != current) {\n    current = actines[current].tail;\n    n++;\n  }\n  return n;\n}\n\n@compute @workgroup_size(WGSZ)\nfn bind_actin_monomer(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&actines);\n  let idx = id.x;\n\n  let actin = actines[idx];\n  var p = actin.position;\n  if (controls.gActinField != 0u) {\n    if (has_connection(actin)) { return; }\n    // A free slot is a monomer equivalent in a uniform finite reservoir, not\n    // a particle at its stored position. Sample a membrane-access reaction\n    // location; only ACCEPTED transfers turn a free slot into an explicit bead.\n    let site = min(u32(random_uniform(idx) * f32(controls.membraneCount)), controls.membraneCount - 1u);\n    let wall = membrane[site];\n    p = wall.position - perpendicular(wall.orientation) * (2.0 + 6.0 * random_uniform(idx));\n  }\n\n  let food_signal = polymerization_signal(p);\n  let food_nearby = food_signal > controls.foodNearbyThreshold;\n  let lamellipodium_signal = load_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p));\n\n  // cancel if not a monomer and no food nearby\n  if (has_connection(actin) || !food_nearby) {\n    return;\n  }\n  atomicAdd(&telemetry[TELEMETRY_CANDIDATES], 1u);\n\n  let tangent = actin.orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n\n  // weak steric forcess\n  let range = f32(controls.actinCohesionRange);\n  var neighborStruct = NeighborStruct(idx, 999999.9);\n  // plus ends nearby win over monomers: elongation is fast, nucleating a new filament from two monomers is slow\n  var headStruct = NeighborStruct(idx, 999999.9);\n  // in the lamellipodium field, monomers next to the side of a filament can nucleate a branch on it\n  var motherStruct = NeighborStruct(idx, 999999.9);\n\n  let sampleCount = 6; \n  for (var i = 0.0; i < f32(sampleCount); i += 1.0) {\n    let angle2 = 2.0 * PI * (i / f32(sampleCount));\n    let sampleDir = vec2f(cos(angle2), sin(angle2));\n    // make a radius that is subject to randomness\n    let radius = 0.0 + random_uniform(idx) * 1.0; // random radius between 0 and 1\n    let sample_pos = p + radius * range * 2.0 * sampleDir;\n\n\n    let dist = length(p - sample_pos);\n\n    // monomers look for polymers to connect to. The head layer is never cleared, so only trust heads\n    // that are still close to where they wrote themselves\n    let headSignal = load_texture_index(HEAD_INDEX, as_vec2i(sample_pos));\n    if (headSignal > 0) {\n      let idxH = headSignal - 1;\n      let head = actines[idxH];\n      let headDist = length(p - head.position);\n      if (idxH != idx && growing_head(head) && headDist < ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance + 2.0 * range && headDist < headStruct.distance) {\n        headStruct = NeighborStruct(idxH, headDist);\n      }\n    }\n\n    // the polymer layer isn't cleared either\n    let polymerSignal = load_texture_index(POLYMER_INDEX, as_vec2i(sample_pos));\n    if (polymerSignal > 0 && lamellipodium_signal > controls.foodNearbyThreshold) {\n      let idxM = polymerSignal - 1;\n      let motherDist = length(p - actines[idxM].position);\n      if (has_both_connections(actines[idxM]) && motherDist < 2.0 * range + 1.0 && motherDist < motherStruct.distance) {\n        motherStruct = NeighborStruct(idxM, motherDist);\n      }\n    }\n\n    if (controls.gActinField != 0u) { continue; }\n    let actinSignal = load_texture_index(ACTIN_INDEX, as_vec2i(sample_pos));\n    if (actinSignal <= 0) {\n      continue;\n    }\n\n    let idxN = actinSignal - 1;\n    let neighbor = actines[idxN];\n    // NOTE: simplify more; Maybe already just bind to the first one instead of closest. Way easier.\n    let available = is_head(neighbor) || is_disconnected(neighbor);\n\n    // skip if not available or self\n    if (!available || idxN == idx){\n      continue;\n    }\n\n    // maybe not necessary. Just get a random one\n    if (dist < neighborStruct.distance) {\n        neighborStruct = NeighborStruct(idxN, dist);\n    } else if (dist == neighborStruct.distance && random_uniform(idx) < 0.3) {\n        neighborStruct = NeighborStruct(idxN, dist);\n    }\n  }\n\n  if (headStruct.idx != idx) {\n    neighborStruct = headStruct;\n    atomicAdd(&telemetry[TELEMETRY_HEAD_FOUND], 1u);\n  } else if (motherStruct.idx != idx) {\n    // branching (Arp2/3): the monomer becomes the root of a new filament on the side of the mother.\n    // Only the monomer changes, the mother keeps its own head and tail\n    if (random_uniform(idx) < controls.branchProbability * lamellipodium_signal &&\n        (controls.gActinField == 0u || inside_membrane(p)) &&\n        atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged) {\n      let mother = actines[motherStruct.idx];\n      let side = select(-1.0, 1.0, random_uniform(idx) < 0.5);\n      actines[idx].tail = motherStruct.idx;\n      actines[idx].age = 0.0;\n      actines[idx].position = branch_position(mother, side);\n      actines[idx].orientation = rotate(mother.orientation, side * BRANCH_ANGLE);\n      store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n      atomicAdd(&telemetry[TELEMETRY_BRANCHED], 1u);\n    }\n    return;\n  }\n\n  if (controls.gActinField != 0u && neighborStruct.idx == idx && (idx & 1u) == 0u) {\n    // A nucleus consumes two distinct free slots. Paired locks prevent double\n    // consumption when the partner is also recruited by a growing filament.\n    let partner = idx + 1u;\n    let dilution = reaction_dilution();\n    if (partner < count && is_disconnected(actines[partner]) &&\n        random_uniform(idx) < min(0.25, 0.02 * controls.bindProb * food_signal * dilution) && inside_membrane(p)) {\n      let theta = random_uniform(idx) * 2.0 * PI;\n      var direction = vec2<f32>(cos(theta), sin(theta));\n      if(controls.frontAlignment>0.0) {\n        let biased=mix(direction,polarity_axis(),controls.frontAlignment);\n        direction=select(polarity_axis(),normalize_safely(biased),dot(biased,biased)>1e-8);\n      }\n      let q = p + controls.equilibrium_line_distance * direction;\n      if (!inside_membrane(q)) { return; }\n      let locked = atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged;\n      if (!locked) { return; }\n      if (!atomicCompareExchangeWeak(&connectionLocks[partner], 0, 1).exchanged) {\n        atomicStore(&connectionLocks[idx], 0); return;\n      }\n      if (!is_disconnected(actines[idx]) || !is_disconnected(actines[partner])) {\n        atomicStore(&connectionLocks[idx], 0); atomicStore(&connectionLocks[partner], 0); return;\n      }\n      actines[idx].position = p; actines[partner].position = q;\n      actines[idx].orientation = direction; actines[partner].orientation = direction;\n      actines[idx].head = partner; actines[partner].tail = idx;\n      actines[idx].age = 0.0; actines[partner].age = 0.0;\n      atomicAdd(&telemetry[TELEMETRY_BOUND], 1u);\n    }\n    return;\n  }\n\n  // 3. Handle binding with neighborStruct\n  if (neighborStruct.idx != idx) {\n    atomicAdd(&telemetry[TELEMETRY_NEIGHBOR_FOUND], 1u);\n    // bind probability depends on the length L of the filament we'd join: bindProb for a lone monomer,\n    // bindProb * bindLengthFloor for short filaments, growing as bindProb * L from L = bindLengthFloor\n    // up to L = bindLengthSaturation\n    let neighborMin = actines[neighborStruct.idx].tail;\n    var dilution = 1.0;\n    if (controls.gActinField != 0u) {\n      dilution = reaction_dilution();\n    }\n    let rnd = random_uniform(idx) / max(0.01, food_signal * dilution);\n    let max_length = clamp(controls.bindLengthSaturation, controls.bindLengthFloor, MAX_BIND_LENGTH);\n    // cheap early outs before walking the filament\n    if (rnd > controls.bindProb * f32(max_length)) {\n      return;\n    }\n    let is_monomer = neighborMin == actines[neighborStruct.idx].id;\n    if (is_monomer && rnd > controls.bindProb) {\n      return;\n    }\n    if (!is_monomer && rnd > controls.bindProb * f32(controls.bindLengthFloor) &&\n        rnd > controls.bindProb * f32(filament_length(neighborStruct.idx, max_length))) {\n      return;\n    }\n    atomicAdd(&telemetry[TELEMETRY_PASSED_PROB], 1u);\n    if (controls.gActinField != 0u && !inside_membrane(p)) { return; }\n    if (atomicCompareExchangeWeak(&connectionLocks[neighborStruct.idx], 0, 1).exchanged && atomicCompareExchangeWeak(&connectionLocks[idx], 0, 1).exchanged) {\n      // locked the target and self\n      // atomicStore(&connectionLocks[idx], 1);\n      if (actines[neighborStruct.idx].head != actines[neighborStruct.idx].id || actines[idx].tail != actines[idx].id ) {\n        atomicStore(&connectionLocks[neighborStruct.idx], 0);\n        atomicStore(&connectionLocks[idx], 0);\n        return;\n      }\n      actines[idx].tail = neighborStruct.idx;\n      actines[neighborStruct.idx].head = idx;\n      actines[idx].age = 0.0;\n      if (is_monomer) { actines[neighborStruct.idx].age = 0.0; }\n      atomicAdd(&telemetry[TELEMETRY_BOUND], 1u);\n      if (!is_monomer) {\n        atomicAdd(&telemetry[TELEMETRY_ELONGATED], 1u);\n      }\n\n      // Mark the binding location with high recency value\n      store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n\n      // directors start along the bond; a monomer that nucleates a filament takes the same one\n      let bondDirection = normalize_safely(p - actines[neighborStruct.idx].position);\n      actines[idx].orientation = bondDirection;\n      if (is_monomer) {\n        actines[neighborStruct.idx].orientation = bondDirection;\n      }\n\n      // also put the actin exactly on the polymer + direction\n      if (neighborMin >= 0) {\n        let direction = normalize_safely(actines[neighborStruct.idx].position - actines[neighborMin].position);\n        let newPosition = actines[neighborStruct.idx].position + direction * ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance; // Move forward from current position\n        actines[idx].position = newPosition;\n      }\n    }\n  }\n}\n\n@compute @workgroup_size(WGSZ)\nfn unbind_min_pole(@builtin(global_invocation_id) id : vec3u) {\n\n  let idx = id.x;  \n  let actin = actines[idx];\n  if (is_disconnected(actin)) { actines[idx].age=0.0; return; }\n  actines[idx].age=min(actin.age+1.0,1e7);\n  let rear=rear_maturity(actin.position,actin.age);\n  let extra=controls.rearTurnover*rear;\n\n  if (is_tail(actin) && random_uniform(idx) < min(0.5,controls.disconnection_probability+extra)) {\n    if (actines[idx].head != idx) {\n      disconnect_from_head(idx, &actines);\n      atomicAdd(&telemetry[TELEMETRY_UNBOUND], 1u);\n      if(front_fraction(actin.position)<0.5){atomicAdd(&telemetry[TELEMETRY_REAR_LOSS],1u);}\n      else {atomicAdd(&telemetry[TELEMETRY_FRONT_LOSS],1u);}\n    }\n  }\n\n  // Aged rear barbed ends are capped against elongation and can peel back.\n  // A one-bead branch must detach only itself, never its mother's own head.\n  if (extra>0.0 && is_head(actin) && random_uniform(idx)<extra) {\n    let current=actines[idx];\n    if(current.tail!=idx) {\n      if(actines[current.tail].head==idx){disconnect_from_tail(idx,&actines);}\n      else {actines[idx].tail=idx;}\n      atomicAdd(&telemetry[TELEMETRY_REAR_HEAD_LOSS],1u);\n    }\n  }\n\n  // a branch comes off its mother at random, or once the mother actin has depolymerized\n  // (it is then a free monomer, or may already have been rebound somewhere else)\n  if (is_branch_root(idx, &actines)) {\n    let mother = actines[actin.tail];\n    let lost_mother = !has_both_connections(mother) || length(mother.position - actin.position) > BRANCH_MAX_DISTANCE;\n    if (lost_mother || random_uniform(idx) < min(0.5,controls.debranchProbability+0.25*extra)) {\n      actines[idx].tail = idx;\n      atomicAdd(&telemetry[TELEMETRY_DEBRANCHED], 1u);\n    }\n  }\n}\n\n\n@compute @workgroup_size(WGSZ)\nfn membrane_to_textures(@builtin(global_invocation_id) id : vec3u) {\n\n  let count = arrayLength(&membrane);\n  let idx = id.x;\n  if (idx >= count) {\n    return;\n  }\n\n  var segment = membrane[idx];\n  let p = segment.position;\n  let tangent = segment.orientation;\n\n  let normalized_arc_len = front_coordinate(p,segment.arc_length / f32(count));\n\n  if controls.movementMode == MOVE_EAST {\n    // polymerization patch around the selected front (arc 0 when cue is off)\n    if (arc_distance(normalized_arc_len, 0.0) < controls.polymerizationPatchSize * 0.5) {\n      store_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p), 1.0);\n    }\n  }\n\n  // lamellipodium: a broad field at the selected front (the right side at reset)\n  if (arc_distance(normalized_arc_len, 0.0) < controls.lamellipodiumWidth * 0.5) {\n    store_texture(parameter_fields, LAMELLIPODIUM, as_vec2i(p), controls.lamellipodiumStrength);\n  }\n\n  // short-lived sprout sites scheduled on the CPU: (center arc length, half width in nodes, strength, unused)\n  for (var i = 0; i < MAX_SPROUT_SITES; i++) {\n    let site = controls.sproutSites[i];\n    if (site.z > 0.0 && arc_distance(normalized_arc_len, site.x) * f32(count) < site.y) {\n      store_texture(parameter_fields, CONNECTION_PROBABILITY, as_vec2i(p), site.z);\n    }\n  }\n\n  // rasterize the whole edge to the head, so a stretched membrane has no gaps for actin to leak through\n  let edge = membrane[segment.head].position - p;\n  let edge_length = min(length(edge), 32.0);\n  let edge_dir = normalize_safely(edge);\n  // 5.0 renders green, 4.0 blue: mark every 20th node. Edges are sub-pixel, so a lone blue node gets\n  // overwritten by its green neighbours; colouring a short run of nodes keeps a visible blue dash.\n  let debug_color = select(5.0, 4.0, idx % 20u < 4u);\n  for (var t = -1.0; t <= edge_length; t += 1.0) {\n    let q = p + t * edge_dir;\n    store_texture(steric_potential, STIGMERGYMEMBRANE, as_vec2i(q), 1.0);\n    store_texture(parameter_fields, DEBUG, as_vec2i(q), debug_color);\n  }\n}\n\n@compute @workgroup_size(WGSZ)\nfn actines_to_textures(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n  if (idx >= controls.actinCount) {\n    return;\n  }\n\n  let actin = actines[idx];\n  if (controls.gActinField != 0u && is_disconnected(actin)) {\n    atomicStore(&connectionLocks[idx], 0);\n    return;\n  }\n  let p = actin.position;\n  let tangent = actin.orientation;\n  let normal = vec2<f32>(-tangent.y, tangent.x);\n  let direction = tangent * normal;\n\n  if (is_disconnected(actin)) {\n    // TODO: maybe smooth with a sigmoid function?\n    store_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(p), load_texture(steric_potential, STIGMERGYMONOMER, as_vec2i(p)) + 0.01);\n  }\n  else {\n    // the polymer field pushes the membrane, plus ends included\n    store_texture(steric_potential, STIGMERGYPOLYMER, as_vec2i(p), 1.0);\n    // read by the actin repulsion; branch nucleation only takes interior actins from it\n    store_texture_index(POLYMER_INDEX, as_vec2i(p), idx + 1);\n    if(controls.colourAge!=0u){store_texture(parameter_fields,ACTIN_AGE,as_vec2i(p),actin.age);}\n  }\n\n  // this is just for rendering!\n  store_texture_index(SEGMENT_INDEX, as_vec2i(p), idx + 1);\n  if (is_branch_root(idx, &actines)) {\n    store_texture(parameter_fields, DEBUG, as_vec2i(p), 4.0); // 4.0 renders blue\n    // the mother actin is the junction: tail, head and this branch give it degree 3\n    store_texture(parameter_fields, DEBUG, as_vec2i(actines[actin.tail].position), 4.0);\n  }\n\n  let food_nearby = polymerization_signal(p) > 0.001;\n  if (growing_head(actin) && food_nearby) {\n    let tail = actines[actin.tail];\n    let direction = normalize_safely(p - tail.position);\n    let dropPosition = p + direction * ACTIN_DROP_DISTANCE * controls.equilibrium_line_distance; // Move forward from current position\n\n    // Set high recency for head segments\n    store_texture(parameter_fields, RECENCY, as_vec2i(p), 1.0);\n\n    store_texture_index(HEAD_INDEX, as_vec2i(dropPosition), idx + 1);\n    atomicAdd(&telemetry[TELEMETRY_HEADS_IN_FIELD], 1u);\n    store_texture(parameter_fields, DEBUG, as_vec2i(dropPosition), 2.0);\n    // 0 means it's available to connect\n    // TODO: CAN'T WE DO THIS ELSEWHERE? LIKE A FINISH STEP IN THE PIPELINE? \n    atomicStore(&connectionLocks[idx], 0);\n  }\n  else if (is_disconnected(actin)) {\n    // 0 means it's available to connect\n    store_texture_index(ACTIN_INDEX, as_vec2i(p), idx + 1);\n    atomicStore(&connectionLocks[idx], 0);\n  }\n  else {\n    // 1 means it cannot connect\n    atomicStore(&connectionLocks[idx], 1);\n  }\n}\n\n// Each 16x16 workgroup copies its tile plus a 1-pixel border into workgroup memory once, then blurs from\n// there: ~1.3 texture loads per pixel per layer instead of 9.\nconst BLUR_TILE = 18;\nconst BLUR_LAYERS = 5;\nvar<workgroup> blur_tile: array<array<f32, BLUR_TILE * BLUR_TILE>, BLUR_LAYERS>;\n\nfn load_blur_layer(layer: u32, p: vec2i) -> f32 {\n  switch layer {\n    case 0u: { return load_texture(steric_potential, STIGMERGYMONOMER, p); }\n    case 1u: { return load_texture(steric_potential, STIGMERGYPOLYMER, p); }\n    case 2u: { return load_texture(steric_potential, STIGMERGYMEMBRANE, p); }\n    case 3u: { return load_texture(parameter_fields, CONNECTION_PROBABILITY, p); }\n    default: { return load_texture(parameter_fields, LAMELLIPODIUM, p); }\n  }\n}\n\n// same 3x3 kernel as gaussian_blur: center 8, adjacents 2, diagonals 1, normalized by 20\nfn blur_from_tile(layer: u32, local: vec2i) -> f32 {\n  let c = (local.y + 1) * BLUR_TILE + local.x + 1;\n  let t = &blur_tile[layer];\n  return (\n    2.0 * ((*t)[c - 1] + (*t)[c + 1] + (*t)[c - BLUR_TILE] + (*t)[c + BLUR_TILE]) +\n    (*t)[c - BLUR_TILE - 1] + (*t)[c - BLUR_TILE + 1] + (*t)[c + BLUR_TILE - 1] + (*t)[c + BLUR_TILE + 1] +\n    8.0 * (*t)[c]\n  ) / 20.0;\n}\n\n@compute @workgroup_size(16, 16)\nfn update_textures(@builtin(global_invocation_id) id : vec3u, @builtin(workgroup_id) wid : vec3u, @builtin(local_invocation_index) li : u32) {\n  let origin = vec2i(wid.xy) * 16 - 1;\n  for (var k = li; k < BLUR_TILE * BLUR_TILE; k += 256u) {\n    let q = origin + vec2i(i32(k % BLUR_TILE), i32(k / BLUR_TILE));\n    for (var layer = 0u; layer < BLUR_LAYERS; layer++) {\n      blur_tile[layer][k] = load_blur_layer(layer, q);\n    }\n  }\n  workgroupBarrier();\n\n  let p = vec2i(id.xy);\n  if (any(p >= canvas.size)) {\n    return;\n  }\n  let local = p - origin - 1;\n\n  // blur and decay in one pass; the particles only read these fields after both\n  store_texture(steric_potential, STIGMERGYMONOMER, p, 0.997*blur_from_tile(0u, local));\n  store_texture(steric_potential, STIGMERGYPOLYMER, p, 0.75*blur_from_tile(1u, local));\n  store_texture(steric_potential, STIGMERGYMEMBRANE, p, 0.95*blur_from_tile(2u, local));\n  // fast decay keeps the polymerization field local, so sprout sites make thin protrusions instead of broad bulges\n  store_texture(parameter_fields, CONNECTION_PROBABILITY, p, controls.polymerizationFieldDecay*blur_from_tile(3u, local));\n  store_texture(parameter_fields, LAMELLIPODIUM, p, controls.lamellipodiumFieldDecay*blur_from_tile(4u, local));\n}\n\n// layers only used for rendering; cleared once per frame, before the frame's last step\n@compute @workgroup_size(16, 16)\nfn clear_render_layers(@builtin(global_invocation_id) id : vec3u) {\n  let p = vec2i(id.xy);\n\n  store_texture_index(SEGMENT_INDEX, p, 0);\n  store_texture(parameter_fields, DEBUG, p, 0.0);\n  if(controls.colourAge!=0u){store_texture(parameter_fields,ACTIN_AGE,p,0.0);}\n  store_texture(parameter_fields, RECENCY, p, 0.99*load_texture(parameter_fields, RECENCY, p)); // ~0.9995 per step at 20 steps per frame\n}\n\n@compute @workgroup_size(WGSZ)\nfn reset_membrane(@builtin(global_invocation_id) id : vec3u) {\n  let count = arrayLength(&membrane);\n  let idx = id.x;\n  \n  if (idx >= count) {\n    return;\n  }\n\n  \n  let center = vec2<f32>(canvas.size) * 0.5;\n  // start at rest length, so the membrane begins relaxed instead of collapsing from far outside the actin\n  let radius = f32(count) * controls.membraneRestLength / (2.0 * PI);\n  let angle =  2 * PI * f32(idx) / f32(count);\n  membrane[idx].id = idx;\n  membrane[idx].subtype = MEMBRANE;\n  membrane[idx].position.x = center.x + radius * cos(angle);\n  membrane[idx].position.y = center.y + radius * sin(angle);\n\n  membrane[idx].orientation.x = -sin(angle);\n  membrane[idx].orientation.y = cos(angle);\n\n  membrane[idx].tail = (idx + count + 1) % count;\n  membrane[idx].head = (idx + count - 1) % count;\n  membrane[idx].arc_length = f32(idx);\n  membrane[idx].age = 0.0;\n  \n\n}\n\n@compute @workgroup_size(WGSZ)\nfn reset_actin(@builtin(global_invocation_id) id : vec3u) {\n  let idx = id.x;\n\n  // actines\n  let center = vec2<f32>(canvas.size) * 0.5;\n  let radius = min(center.x, center.y) * 0.5;\n  // distribute around a circle\n  let current_angle = random_uniform(idx) * 2.0 * PI;\n  let normalized_radius = sqrt(random_uniform(idx)) * radius * 0.3;\n\n  let xt = center.x + normalized_radius * cos(current_angle);\n  let yt = center.y + normalized_radius * sin(current_angle);\n  actines[idx].position = vec2<f32>(xt, yt);\n\n  let random_angle = random_uniform(idx);\n  actines[idx].orientation = vec2<f32>(cos(random_angle * 2.0 * PI), sin(random_angle * 2.0 * PI));\n\n  actines[idx].id = idx;\n  actines[idx].subtype = ACTIN;\n\n  actines[idx].head = idx;\n  actines[idx].tail = idx;\n  actines[idx].age = 0.0;\n}\n";

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
function runSimulationStep(device, pipelines, bindGroup, workgroupCounts, textureWorkgroupCount, lineConstraintFunction, frameNr, isLastStepOfFrame, enclosure = false, persistentPolarity = false, queryInfo) {
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
    worker = new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u("src_telemetry_worker_ts"), __webpack_require__.b), { type: undefined });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLGNBQWM7QUFDZDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLDhDQUE4QyxFQUFFOztBQUVoRDs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFFO0FBQ0Y7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRixnQkFBZ0IsU0FBUzs7QUFFekI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0EsdURBQXVELElBQUksZ0JBQWdCOztBQUUzRTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU07O0FBRU47O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvREFBb0QsaUJBQWlCO0FBQ3JFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQSx3REFBd0QsaUJBQWlCO0FBQ3pFOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxNQUFNOztBQUVOO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0RBQStELGlCQUFpQjtBQUNoRixxREFBcUQsaUJBQWlCOztBQUV0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLEtBQUs7QUFDbEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLFFBQVEsaUJBQWlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7O0FBRUo7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLGNBQWM7QUFDckQsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFH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QUN6RCxNQUFNLENBQUMsNkNBQTZDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlJLElBQUksS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQsTUFBTSxDQUNKLDREQUE0RCxFQUM1RCxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNaLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3SCxDQUFDO0lBQ0YsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUNoQjtRQUNFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNQLEVBQ0Q7UUFDRSxDQUFDLENBQUMsRUFBRSxD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QUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUMvRixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDbEcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzdGLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFD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QyxDQUFDLEVBQzdCLEVBQUUsR0FBRyxRQUFRLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNoQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztRQUM1RixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDL0gsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFDakMsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFLENBQUM7WUFDckIsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNiLFNBQVM7UUFDWCxDQUFDO1FBQ0QsS0FBSyxJQUFJLEdBQUcsR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFD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LEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlELElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEUsQ0FBQztRQUNELE1BQU0sUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUNsQyxDQUFDLEdBQUcsSUFBSSxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQzlCLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNoQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUN0QixDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNuRixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDakMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFF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Q0FBQyxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDNUQsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNsRCxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDMUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BCLENBQUM7UUFDRCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNWLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDWixDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDdEQsQ0FBQztJQUNELFNBQVMsU0FBUyxDQUFDLEdBQVcsRUFBRSxTQUFTLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUM7UUFDMUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFDOUMsQ0FBQyxHQUFHLElB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LENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuRixNQUFNLE1BQU0sR0FBRyxJQUFJLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzdHLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNkLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQixNQUFNLEtBQUssR0FBRyxJQUFJLFlBQVksQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzVHLE1BQU0sQ0FBQyxpREFBaUQsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUM3SixRQUFRLEVBQUUsQ0FBQztJQUNYLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQixTQUFTLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDekUsS0FBSyxNQUFNLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtRQUN0QyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsd0NBQXdDLEVBQUUsSUFBSSxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxtQ0FBbUMsRUFBRSxLQUFLLENBQUM7S0FDdEQsRUFBRSxDQUFDO1FBQ1gsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25DLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckMsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDakQsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2xCLE1BQU0sS0FBSyxHQUFHLElBQUksWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQzFELE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQyxD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QyxRQUFRLENBQUM7WUFFaEQsa0JBQWtCO1lBQ2xCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQy9ELElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxHQUFHLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFFNUMsaUJBQWlCO1lBQ2pCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO1lBQ3BCLElBQUksQ0FBQyxRQUFRLEdBQUcsV0FBVyxDQUFDO1FBQzlCLENBQUM7UUFDRCxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDcEIsQ0FBQztDQUNGIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL25vZGVfbW9kdWxlcy9saWwtZ3VpL2Rpc3QvbGlsLWd1aS5lc20uanMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9jb250YWN0LXJlY292ZXJ5LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvZW5jbG9zdXJlLXRlc3QudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9pbmRleC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL21lY2hhbmljcy10ZXN0LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvb2NjdXBhbmN5LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvcmFuZG9tLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvcmVhbHRpbWUudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yZW5kZXIudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yZW5ld2FsLXRlc3QudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9zaW11bGF0ZS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3Nwcm91dHMudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy90ZWxlbWV0cnktYW5hbHlzaXMudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy90ZWxlbWV0cnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy91dGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIGxpbC1ndWlcbiAqIGh0dHBzOi8vbGlsLWd1aS5nZW9yZ2VhbHdheXMuY29tXG4gKiBAdmVyc2lvbiAwLjIwLjBcbiAqIEBhdXRob3IgR2VvcmdlIE1pY2hhZWwgQnJvd2VyXG4gKiBAbGljZW5zZSBNSVRcbiAqL1xuXG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIGFsbCBjb250cm9sbGVycy5cbiAqL1xuY2xhc3MgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgY2xhc3NOYW1lLCBlbGVtZW50VHlwZSA9ICdkaXYnICkge1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEdVSSB0aGF0IGNvbnRhaW5zIHRoaXMgY29udHJvbGxlci5cblx0XHQgKiBAdHlwZSB7R1VJfVxuXHRcdCAqL1xuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG9iamVjdCB0aGlzIGNvbnRyb2xsZXIgd2lsbCBtb2RpZnkuXG5cdFx0ICogQHR5cGUge29iamVjdH1cblx0XHQgKi9cblx0XHR0aGlzLm9iamVjdCA9IG9iamVjdDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjb250cm9sLlxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNvbnRyb2xsZXIgaXMgZGlzYWJsZWQuXG5cdFx0ICogVXNlIGBjb250cm9sbGVyLmRpc2FibGUoIHRydWV8ZmFsc2UgKWAgdG8gbW9kaWZ5IHRoaXMgdmFsdWUuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5fZGlzYWJsZWQgPSBmYWxzZTtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBDb250cm9sbGVyIGlzIGhpZGRlbi5cblx0XHQgKiBVc2UgYGNvbnRyb2xsZXIuc2hvdygpYCBvciBgY29udHJvbGxlci5oaWRlKClgIHRvIGNoYW5nZSB0aGlzLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2hpZGRlbiA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHZhbHVlIG9mIGBvYmplY3RbIHByb3BlcnR5IF1gIHdoZW4gdGhlIGNvbnRyb2xsZXIgd2FzIGNyZWF0ZWQuXG5cdFx0ICogQHR5cGUge2FueX1cblx0XHQgKi9cblx0XHR0aGlzLmluaXRpYWxWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBvdXRlcm1vc3QgY29udGFpbmVyIERPTSBlbGVtZW50IGZvciB0aGlzIGNvbnRyb2xsZXIuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIGVsZW1lbnRUeXBlICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdjb250cm9sbGVyJyApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb250cm9sbGVyJ3MgbmFtZS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kbmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kbmFtZS5jbGFzc0xpc3QuYWRkKCAnbmFtZScgKTtcblxuXHRcdENvbnRyb2xsZXIubmV4dE5hbWVJRCA9IENvbnRyb2xsZXIubmV4dE5hbWVJRCB8fCAwO1xuXHRcdHRoaXMuJG5hbWUuaWQgPSBgbGlsLWd1aS1uYW1lLSR7KytDb250cm9sbGVyLm5leHROYW1lSUR9YDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSBjb250cm9sbGVyJ3MgXCJ3aWRnZXRcIiAod2hpY2ggZGlmZmVycyBieSBjb250cm9sbGVyIHR5cGUpLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiR3aWRnZXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJHdpZGdldC5jbGFzc0xpc3QuYWRkKCAnd2lkZ2V0JyApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgcmVjZWl2ZXMgdGhlIGRpc2FibGVkIGF0dHJpYnV0ZSB3aGVuIHVzaW5nIGRpc2FibGUoKS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJHdpZGdldDtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kbmFtZSApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kd2lkZ2V0ICk7XG5cblx0XHQvLyBEb24ndCBmaXJlIGdsb2JhbCBrZXkgZXZlbnRzIHdoaWxlIHR5cGluZyBpbiBhIGNvbnRyb2xsZXJcblx0XHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCkgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleXVwJywgZSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpICk7XG5cblx0XHR0aGlzLnBhcmVudC5jaGlsZHJlbi5wdXNoKCB0aGlzICk7XG5cdFx0dGhpcy5wYXJlbnQuY29udHJvbGxlcnMucHVzaCggdGhpcyApO1xuXG5cdFx0dGhpcy5wYXJlbnQuJGNoaWxkcmVuLmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdHRoaXMuX2xpc3RlbkNhbGxiYWNrID0gdGhpcy5fbGlzdGVuQ2FsbGJhY2suYmluZCggdGhpcyApO1xuXG5cdFx0dGhpcy5uYW1lKCBwcm9wZXJ0eSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbmFtZSBvZiB0aGUgY29udHJvbGxlciBhbmQgaXRzIGxhYmVsIGluIHRoZSBHVUkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bmFtZSggbmFtZSApIHtcblx0XHQvKipcblx0XHQgKiBUaGUgY29udHJvbGxlcidzIG5hbWUuIFVzZSBgY29udHJvbGxlci5uYW1lKCAnTmFtZScgKWAgdG8gbW9kaWZ5IHRoaXMgdmFsdWUuXG5cdFx0ICogQHR5cGUge3N0cmluZ31cblx0XHQgKi9cblx0XHR0aGlzLl9uYW1lID0gbmFtZTtcblx0XHR0aGlzLiRuYW1lLnRleHRDb250ZW50ID0gbmFtZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIHRoZSB2YWx1ZSBpcyBtb2RpZmllZCBieSB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqIFRoZSBmdW5jdGlvbiByZWNlaXZlcyB0aGUgbmV3IHZhbHVlIGFzIGl0cyBmaXJzdCBwYXJhbWV0ZXIuIFRoZSB2YWx1ZSBvZiBgdGhpc2Agd2lsbCBiZSB0aGVcblx0ICogY29udHJvbGxlci5cblx0ICpcblx0ICogRm9yIGZ1bmN0aW9uIGNvbnRyb2xsZXJzLCB0aGUgYG9uQ2hhbmdlYCBjYWxsYmFjayB3aWxsIGJlIGZpcmVkIG9uIGNsaWNrLCBhZnRlciB0aGUgZnVuY3Rpb25cblx0ICogZXhlY3V0ZXMuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb25zdCBjb250cm9sbGVyID0gZ3VpLmFkZCggb2JqZWN0LCAncHJvcGVydHknICk7XG5cdCAqXG5cdCAqIGNvbnRyb2xsZXIub25DaGFuZ2UoIGZ1bmN0aW9uKCB2ICkge1xuXHQgKiBcdGNvbnNvbGUubG9nKCAnVGhlIHZhbHVlIGlzIG5vdyAnICsgdiApO1xuXHQgKiBcdGNvbnNvbGUuYXNzZXJ0KCB0aGlzID09PSBjb250cm9sbGVyICk7XG5cdCAqIH0gKTtcblx0ICovXG5cdG9uQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlIGRpcmVjdGx5LlxuXHRcdCAqIFVzZSB0aGUgYGNvbnRyb2xsZXIub25DaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkNoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxzIHRoZSBvbkNoYW5nZSBtZXRob2RzIG9mIHRoaXMgY29udHJvbGxlciBhbmQgaXRzIHBhcmVudCBHVUkuXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdF9jYWxsT25DaGFuZ2UoKSB7XG5cblx0XHR0aGlzLnBhcmVudC5fY2FsbE9uQ2hhbmdlKCB0aGlzICk7XG5cblx0XHRpZiAoIHRoaXMuX29uQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbkNoYW5nZS5jYWxsKCB0aGlzLCB0aGlzLmdldFZhbHVlKCkgKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jaGFuZ2VkID0gdHJ1ZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgYWZ0ZXIgdGhpcyBjb250cm9sbGVyIGhhcyBiZWVuIG1vZGlmaWVkIGFuZCBsb3NlcyBmb2N1cy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IGNvbnRyb2xsZXIgPSBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKTtcblx0ICpcblx0ICogY29udHJvbGxlci5vbkZpbmlzaENoYW5nZSggZnVuY3Rpb24oIHYgKSB7XG5cdCAqIFx0Y29uc29sZS5sb2coICdDaGFuZ2VzIGNvbXBsZXRlOiAnICsgdiApO1xuXHQgKiBcdGNvbnNvbGUuYXNzZXJ0KCB0aGlzID09PSBjb250cm9sbGVyICk7XG5cdCAqIH0gKTtcblx0ICovXG5cdG9uRmluaXNoQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uRmluaXNoQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGNvbnRyb2xsZXIub25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNob3VsZCBiZSBjYWxsZWQgYnkgQ29udHJvbGxlciB3aGVuIGl0cyB3aWRnZXRzIGxvc2UgZm9jdXMuXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdF9jYWxsT25GaW5pc2hDaGFuZ2UoKSB7XG5cblx0XHRpZiAoIHRoaXMuX2NoYW5nZWQgKSB7XG5cblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25GaW5pc2hDaGFuZ2UoIHRoaXMgKTtcblxuXHRcdFx0aWYgKCB0aGlzLl9vbkZpbmlzaENoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZS5jYWxsKCB0aGlzLCB0aGlzLmdldFZhbHVlKCkgKTtcblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHRoaXMuX2NoYW5nZWQgPSBmYWxzZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIGNvbnRyb2xsZXIgYmFjayB0byBpdHMgaW5pdGlhbCB2YWx1ZS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRyZXNldCgpIHtcblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLmluaXRpYWxWYWx1ZSApO1xuXHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhpcyBjb250cm9sbGVyLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGVuYWJsZWRcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnRyb2xsZXIuZW5hYmxlKCk7XG5cdCAqIGNvbnRyb2xsZXIuZW5hYmxlKCBmYWxzZSApOyAvLyBkaXNhYmxlXG5cdCAqIGNvbnRyb2xsZXIuZW5hYmxlKCBjb250cm9sbGVyLl9kaXNhYmxlZCApOyAvLyB0b2dnbGVcblx0ICovXG5cdGVuYWJsZSggZW5hYmxlZCA9IHRydWUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuZGlzYWJsZSggIWVuYWJsZWQgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNhYmxlcyB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gZGlzYWJsZWRcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnRyb2xsZXIuZGlzYWJsZSgpO1xuXHQgKiBjb250cm9sbGVyLmRpc2FibGUoIGZhbHNlICk7IC8vIGVuYWJsZVxuXHQgKiBjb250cm9sbGVyLmRpc2FibGUoICFjb250cm9sbGVyLl9kaXNhYmxlZCApOyAvLyB0b2dnbGVcblx0ICovXG5cdGRpc2FibGUoIGRpc2FibGVkID0gdHJ1ZSApIHtcblxuXHRcdGlmICggZGlzYWJsZWQgPT09IHRoaXMuX2Rpc2FibGVkICkgcmV0dXJuIHRoaXM7XG5cblx0XHR0aGlzLl9kaXNhYmxlZCA9IGRpc2FibGVkO1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoICdkaXNhYmxlZCcsIGRpc2FibGVkICk7XG5cdFx0dGhpcy4kZGlzYWJsZS50b2dnbGVBdHRyaWJ1dGUoICdkaXNhYmxlZCcsIGRpc2FibGVkICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNob3dzIHRoZSBDb250cm9sbGVyIGFmdGVyIGl0J3MgYmVlbiBoaWRkZW4uXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29udHJvbGxlci5zaG93KCk7XG5cdCAqIGNvbnRyb2xsZXIuc2hvdyggZmFsc2UgKTsgLy8gaGlkZVxuXHQgKiBjb250cm9sbGVyLnNob3coIGNvbnRyb2xsZXIuX2hpZGRlbiApOyAvLyB0b2dnbGVcblx0ICovXG5cdHNob3coIHNob3cgPSB0cnVlICkge1xuXG5cdFx0dGhpcy5faGlkZGVuID0gIXNob3c7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHRoaXMuX2hpZGRlbiA/ICdub25lJyA6ICcnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIaWRlcyB0aGUgQ29udHJvbGxlci5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRoaWRlKCkge1xuXHRcdHJldHVybiB0aGlzLnNob3coIGZhbHNlICk7XG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGlzIGNvbnRyb2xsZXIgaW50byBhIGRyb3Bkb3duIG9mIG9wdGlvbnMuXG5cdCAqXG5cdCAqIENhbGxpbmcgdGhpcyBtZXRob2Qgb24gYW4gb3B0aW9uIGNvbnRyb2xsZXIgd2lsbCBzaW1wbHkgdXBkYXRlIHRoZSBvcHRpb25zLiBIb3dldmVyLCBpZiB0aGlzXG5cdCAqIGNvbnRyb2xsZXIgd2FzIG5vdCBhbHJlYWR5IGFuIG9wdGlvbiBjb250cm9sbGVyLCBvbGQgcmVmZXJlbmNlcyB0byB0aGlzIGNvbnRyb2xsZXIgYXJlXG5cdCAqIGRlc3Ryb3llZCwgYW5kIGEgbmV3IGNvbnRyb2xsZXIgaXMgYWRkZWQgdG8gdGhlIGVuZCBvZiB0aGUgR1VJLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiAvLyBzYWZlIHVzYWdlXG5cdCAqXG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AxJyApLm9wdGlvbnMoIFsgJ2EnLCAnYicsICdjJyBdICk7XG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AyJyApLm9wdGlvbnMoIHsgQmlnOiAxMCwgU21hbGw6IDEgfSApO1xuXHQgKiBndWkuYWRkKCBvYmosICdwcm9wMycgKTtcblx0ICpcblx0ICogLy8gZGFuZ2VyXG5cdCAqXG5cdCAqIGNvbnN0IGN0cmwxID0gZ3VpLmFkZCggb2JqLCAncHJvcDEnICk7XG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AyJyApO1xuXHQgKlxuXHQgKiAvLyBjYWxsaW5nIG9wdGlvbnMgb3V0IG9mIG9yZGVyIGFkZHMgYSBuZXcgY29udHJvbGxlciB0byB0aGUgZW5kLi4uXG5cdCAqIGNvbnN0IGN0cmwyID0gY3RybDEub3B0aW9ucyggWyAnYScsICdiJywgJ2MnIF0gKTtcblx0ICpcblx0ICogLy8gLi4uYW5kIGN0cmwxIG5vdyByZWZlcmVuY2VzIGEgY29udHJvbGxlciB0aGF0IGRvZXNuJ3QgZXhpc3Rcblx0ICogYXNzZXJ0KCBjdHJsMiAhPT0gY3RybDEgKVxuXHQgKiBAcGFyYW0ge29iamVjdHxBcnJheX0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcn1cblx0ICovXG5cdG9wdGlvbnMoIG9wdGlvbnMgKSB7XG5cdFx0Y29uc3QgY29udHJvbGxlciA9IHRoaXMucGFyZW50LmFkZCggdGhpcy5vYmplY3QsIHRoaXMucHJvcGVydHksIG9wdGlvbnMgKTtcblx0XHRjb250cm9sbGVyLm5hbWUoIHRoaXMuX25hbWUgKTtcblx0XHR0aGlzLmRlc3Ryb3koKTtcblx0XHRyZXR1cm4gY29udHJvbGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtaW5pbXVtIHZhbHVlLiBPbmx5IHdvcmtzIG9uIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQHBhcmFtIHtudW1iZXJ9IG1pblxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdG1pbiggbWluICkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1heGltdW0gdmFsdWUuIE9ubHkgd29ya3Mgb24gbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gbWF4XG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bWF4KCBtYXggKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogVmFsdWVzIHNldCBieSB0aGlzIGNvbnRyb2xsZXIgd2lsbCBiZSByb3VuZGVkIHRvIG11bHRpcGxlcyBvZiBgc3RlcGAuIE9ubHkgd29ya3Mgb24gbnVtYmVyXG5cdCAqIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gc3RlcFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHN0ZXAoIHN0ZXAgKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUm91bmRzIHRoZSBkaXNwbGF5ZWQgdmFsdWUgdG8gYSBmaXhlZCBudW1iZXIgb2YgZGVjaW1hbHMsIHdpdGhvdXQgYWZmZWN0aW5nIHRoZSBhY3R1YWwgdmFsdWVcblx0ICogbGlrZSBgc3RlcCgpYC4gT25seSB3b3JrcyBvbiBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApLmxpc3RlbigpLmRlY2ltYWxzKCA0ICk7XG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBkZWNpbWFsc1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGRlY2ltYWxzKCBkZWNpbWFscyApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxscyBgdXBkYXRlRGlzcGxheSgpYCBldmVyeSBhbmltYXRpb24gZnJhbWUuIFBhc3MgYGZhbHNlYCB0byBzdG9wIGxpc3RlbmluZy5cblx0ICogQHBhcmFtIHtib29sZWFufSBsaXN0ZW5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRsaXN0ZW4oIGxpc3RlbiA9IHRydWUgKSB7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgY29udHJvbGxlciBpcyBjdXJyZW50bHkgbGlzdGVuaW5nLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBjb250cm9sbGVyLmxpc3RlbiggdHJ1ZXxmYWxzZSApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9saXN0ZW5pbmcgPSBsaXN0ZW47XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdGNhbmNlbEFuaW1hdGlvbkZyYW1lKCB0aGlzLl9saXN0ZW5DYWxsYmFja0lEICk7XG5cdFx0XHR0aGlzLl9saXN0ZW5DYWxsYmFja0lEID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fbGlzdGVuaW5nICkge1xuXHRcdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2soKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0X2xpc3RlbkNhbGxiYWNrKCkge1xuXG5cdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2tJRCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSggdGhpcy5fbGlzdGVuQ2FsbGJhY2sgKTtcblxuXHRcdC8vIFRvIHByZXZlbnQgZnJhbWVyYXRlIGxvc3MsIG1ha2Ugc3VyZSB0aGUgdmFsdWUgaGFzIGNoYW5nZWQgYmVmb3JlIHVwZGF0aW5nIHRoZSBkaXNwbGF5LlxuXHRcdC8vIE5vdGU6IHNhdmUoKSBpcyB1c2VkIGhlcmUgaW5zdGVhZCBvZiBnZXRWYWx1ZSgpIG9ubHkgYmVjYXVzZSBvZiBDb2xvckNvbnRyb2xsZXIuIFRoZSAhPT0gb3BlcmF0b3Jcblx0XHQvLyB3b24ndCB3b3JrIGZvciBjb2xvciBvYmplY3RzIG9yIGFycmF5cywgYnV0IENvbG9yQ29udHJvbGxlci5zYXZlKCkgYWx3YXlzIHJldHVybnMgYSBzdHJpbmcuXG5cblx0XHRjb25zdCBjdXJWYWx1ZSA9IHRoaXMuc2F2ZSgpO1xuXG5cdFx0aWYgKCBjdXJWYWx1ZSAhPT0gdGhpcy5fbGlzdGVuUHJldlZhbHVlICkge1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fbGlzdGVuUHJldlZhbHVlID0gY3VyVmFsdWU7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGBvYmplY3RbIHByb3BlcnR5IF1gLlxuXHQgKiBAcmV0dXJucyB7YW55fVxuXHQgKi9cblx0Z2V0VmFsdWUoKSB7XG5cdFx0cmV0dXJuIHRoaXMub2JqZWN0WyB0aGlzLnByb3BlcnR5IF07XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgdmFsdWUgb2YgYG9iamVjdFsgcHJvcGVydHkgXWAsIGludm9rZXMgYW55IGBvbkNoYW5nZWAgaGFuZGxlcnMgYW5kIHVwZGF0ZXMgdGhlIGRpc3BsYXkuXG5cdCAqIEBwYXJhbSB7YW55fSB2YWx1ZVxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHNldFZhbHVlKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdGhpcy5nZXRWYWx1ZSgpICE9PSB2YWx1ZSApIHtcblxuXHRcdFx0dGhpcy5vYmplY3RbIHRoaXMucHJvcGVydHkgXSA9IHZhbHVlO1xuXHRcdFx0dGhpcy5fY2FsbE9uQ2hhbmdlKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZGlzcGxheSB0byBrZWVwIGl0IGluIHN5bmMgd2l0aCB0aGUgY3VycmVudCB2YWx1ZS4gVXNlZnVsIGZvciB1cGRhdGluZyB5b3VyXG5cdCAqIGNvbnRyb2xsZXJzIHdoZW4gdGhlaXIgdmFsdWVzIGhhdmUgYmVlbiBtb2RpZmllZCBvdXRzaWRlIG9mIHRoZSBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdGxvYWQoIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzYXZlKCkge1xuXHRcdHJldHVybiB0aGlzLmdldFZhbHVlKCk7XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveXMgdGhpcyBjb250cm9sbGVyIGFuZCByZW1vdmVzIGl0IGZyb20gdGhlIHBhcmVudCBHVUkuXG5cdCAqL1xuXHRkZXN0cm95KCkge1xuXHRcdHRoaXMubGlzdGVuKCBmYWxzZSApO1xuXHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnNwbGljZSggdGhpcy5wYXJlbnQuY2hpbGRyZW4uaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0dGhpcy5wYXJlbnQuY29udHJvbGxlcnMuc3BsaWNlKCB0aGlzLnBhcmVudC5jb250cm9sbGVycy5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHR0aGlzLnBhcmVudC4kY2hpbGRyZW4ucmVtb3ZlQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXHR9XG5cbn1cblxuY2xhc3MgQm9vbGVhbkNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5ICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ2Jvb2xlYW4nLCAnbGFiZWwnICk7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ2NoZWNrYm94JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLiRpbnB1dC5jaGVja2VkICk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kaW5wdXQ7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHR0aGlzLiRpbnB1dC5jaGVja2VkID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplQ29sb3JTdHJpbmcoIHN0cmluZyApIHtcblxuXHRsZXQgbWF0Y2gsIHJlc3VsdDtcblxuXHRpZiAoIG1hdGNoID0gc3RyaW5nLm1hdGNoKCAvKCN8MHgpPyhbYS1mMC05XXs2fSkvaSApICkge1xuXG5cdFx0cmVzdWx0ID0gbWF0Y2hbIDIgXTtcblxuXHR9IGVsc2UgaWYgKCBtYXRjaCA9IHN0cmluZy5tYXRjaCggL3JnYlxcKFxccyooXFxkKilcXHMqLFxccyooXFxkKilcXHMqLFxccyooXFxkKilcXHMqXFwpLyApICkge1xuXG5cdFx0cmVzdWx0ID0gcGFyc2VJbnQoIG1hdGNoWyAxIF0gKS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggMiwgMCApXG5cdFx0XHQrIHBhcnNlSW50KCBtYXRjaFsgMiBdICkudG9TdHJpbmcoIDE2ICkucGFkU3RhcnQoIDIsIDAgKVxuXHRcdFx0KyBwYXJzZUludCggbWF0Y2hbIDMgXSApLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCAyLCAwICk7XG5cblx0fSBlbHNlIGlmICggbWF0Y2ggPSBzdHJpbmcubWF0Y2goIC9eIz8oW2EtZjAtOV0pKFthLWYwLTldKShbYS1mMC05XSkkL2kgKSApIHtcblxuXHRcdHJlc3VsdCA9IG1hdGNoWyAxIF0gKyBtYXRjaFsgMSBdICsgbWF0Y2hbIDIgXSArIG1hdGNoWyAyIF0gKyBtYXRjaFsgMyBdICsgbWF0Y2hbIDMgXTtcblxuXHR9XG5cblx0aWYgKCByZXN1bHQgKSB7XG5cdFx0cmV0dXJuICcjJyArIHJlc3VsdDtcblx0fVxuXG5cdHJldHVybiBmYWxzZTtcblxufVxuXG5jb25zdCBTVFJJTkcgPSB7XG5cdGlzUHJpbWl0aXZlOiB0cnVlLFxuXHRtYXRjaDogdiA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZycsXG5cdGZyb21IZXhTdHJpbmc6IG5vcm1hbGl6ZUNvbG9yU3RyaW5nLFxuXHR0b0hleFN0cmluZzogbm9ybWFsaXplQ29sb3JTdHJpbmdcbn07XG5cbmNvbnN0IElOVCA9IHtcblx0aXNQcmltaXRpdmU6IHRydWUsXG5cdG1hdGNoOiB2ID0+IHR5cGVvZiB2ID09PSAnbnVtYmVyJyxcblx0ZnJvbUhleFN0cmluZzogc3RyaW5nID0+IHBhcnNlSW50KCBzdHJpbmcuc3Vic3RyaW5nKCAxICksIDE2ICksXG5cdHRvSGV4U3RyaW5nOiB2YWx1ZSA9PiAnIycgKyB2YWx1ZS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggNiwgMCApXG59O1xuXG5jb25zdCBBUlJBWSA9IHtcblx0aXNQcmltaXRpdmU6IGZhbHNlLFxuXG5cdC8vIFRoZSBhcnJvdyBmdW5jdGlvbiBpcyBoZXJlIHRvIGFwcGVhc2UgdHJlZSBzaGFrZXJzIGxpa2UgZXNidWlsZCBvciB3ZWJwYWNrLlxuXHQvLyBTZWUgaHR0cHM6Ly9lc2J1aWxkLmdpdGh1Yi5pby9hcGkvI3RyZWUtc2hha2luZ1xuXHRtYXRjaDogdiA9PiBBcnJheS5pc0FycmF5KCB2ICksXG5cblx0ZnJvbUhleFN0cmluZyggc3RyaW5nLCB0YXJnZXQsIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdGNvbnN0IGludCA9IElOVC5mcm9tSGV4U3RyaW5nKCBzdHJpbmcgKTtcblxuXHRcdHRhcmdldFsgMCBdID0gKCBpbnQgPj4gMTYgJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXHRcdHRhcmdldFsgMSBdID0gKCBpbnQgPj4gOCAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0WyAyIF0gPSAoIGludCAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cblx0fSxcblx0dG9IZXhTdHJpbmcoIFsgciwgZywgYiBdLCByZ2JTY2FsZSA9IDEgKSB7XG5cblx0XHRyZ2JTY2FsZSA9IDI1NSAvIHJnYlNjYWxlO1xuXG5cdFx0Y29uc3QgaW50ID0gKCByICogcmdiU2NhbGUgKSA8PCAxNiBeXG5cdFx0XHQoIGcgKiByZ2JTY2FsZSApIDw8IDggXlxuXHRcdFx0KCBiICogcmdiU2NhbGUgKSA8PCAwO1xuXG5cdFx0cmV0dXJuIElOVC50b0hleFN0cmluZyggaW50ICk7XG5cblx0fVxufTtcblxuY29uc3QgT0JKRUNUID0ge1xuXHRpc1ByaW1pdGl2ZTogZmFsc2UsXG5cdG1hdGNoOiB2ID0+IE9iamVjdCggdiApID09PSB2LFxuXHRmcm9tSGV4U3RyaW5nKCBzdHJpbmcsIHRhcmdldCwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0Y29uc3QgaW50ID0gSU5ULmZyb21IZXhTdHJpbmcoIHN0cmluZyApO1xuXG5cdFx0dGFyZ2V0LnIgPSAoIGludCA+PiAxNiAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0LmcgPSAoIGludCA+PiA4ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXQuYiA9ICggaW50ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblxuXHR9LFxuXHR0b0hleFN0cmluZyggeyByLCBnLCBiIH0sIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdHJnYlNjYWxlID0gMjU1IC8gcmdiU2NhbGU7XG5cblx0XHRjb25zdCBpbnQgPSAoIHIgKiByZ2JTY2FsZSApIDw8IDE2IF5cblx0XHRcdCggZyAqIHJnYlNjYWxlICkgPDwgOCBeXG5cdFx0XHQoIGIgKiByZ2JTY2FsZSApIDw8IDA7XG5cblx0XHRyZXR1cm4gSU5ULnRvSGV4U3RyaW5nKCBpbnQgKTtcblxuXHR9XG59O1xuXG5jb25zdCBGT1JNQVRTID0gWyBTVFJJTkcsIElOVCwgQVJSQVksIE9CSkVDVCBdO1xuXG5mdW5jdGlvbiBnZXRDb2xvckZvcm1hdCggdmFsdWUgKSB7XG5cdHJldHVybiBGT1JNQVRTLmZpbmQoIGZvcm1hdCA9PiBmb3JtYXQubWF0Y2goIHZhbHVlICkgKTtcbn1cblxuY2xhc3MgQ29sb3JDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgcmdiU2NhbGUgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnY29sb3InICk7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ2NvbG9yJyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3RhYmluZGV4JywgLTEgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHR0aGlzLiR0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJHRleHQuc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0JyApO1xuXHRcdHRoaXMuJHRleHQuc2V0QXR0cmlidXRlKCAnc3BlbGxjaGVjaycsICdmYWxzZScgKTtcblx0XHR0aGlzLiR0ZXh0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJGRpc3BsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LmFkZCggJ2Rpc3BsYXknICk7XG5cblx0XHR0aGlzLiRkaXNwbGF5LmFwcGVuZENoaWxkKCB0aGlzLiRpbnB1dCApO1xuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kZGlzcGxheSApO1xuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kdGV4dCApO1xuXG5cdFx0dGhpcy5fZm9ybWF0ID0gZ2V0Q29sb3JGb3JtYXQoIHRoaXMuaW5pdGlhbFZhbHVlICk7XG5cdFx0dGhpcy5fcmdiU2NhbGUgPSByZ2JTY2FsZTtcblxuXHRcdHRoaXMuX2luaXRpYWxWYWx1ZUhleFN0cmluZyA9IHRoaXMuc2F2ZSgpO1xuXHRcdHRoaXMuX3RleHRGb2N1c2VkID0gZmFsc2U7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnaW5wdXQnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsICgpID0+IHtcblx0XHRcdGNvbnN0IHRyeVBhcnNlID0gbm9ybWFsaXplQ29sb3JTdHJpbmcoIHRoaXMuJHRleHQudmFsdWUgKTtcblx0XHRcdGlmICggdHJ5UGFyc2UgKSB7XG5cdFx0XHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdHJ5UGFyc2UgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHR0aGlzLiR0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsICgpID0+IHtcblx0XHRcdHRoaXMuX3RleHRGb2N1c2VkID0gdHJ1ZTtcblx0XHRcdHRoaXMuJHRleHQuc2VsZWN0KCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kdGV4dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuX3RleHRGb2N1c2VkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiR0ZXh0O1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0fVxuXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdGhpcy5faW5pdGlhbFZhbHVlSGV4U3RyaW5nICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB2YWx1ZSApIHtcblxuXHRcdGlmICggdGhpcy5fZm9ybWF0LmlzUHJpbWl0aXZlICkge1xuXG5cdFx0XHRjb25zdCBuZXdWYWx1ZSA9IHRoaXMuX2Zvcm1hdC5mcm9tSGV4U3RyaW5nKCB2YWx1ZSApO1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggbmV3VmFsdWUgKTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdHRoaXMuX2Zvcm1hdC5mcm9tSGV4U3RyaW5nKCB2YWx1ZSwgdGhpcy5nZXRWYWx1ZSgpLCB0aGlzLl9yZ2JTY2FsZSApO1xuXHRcdFx0dGhpcy5fY2FsbE9uQ2hhbmdlKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdH1cblxuXHR9XG5cblx0c2F2ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fZm9ybWF0LnRvSGV4U3RyaW5nKCB0aGlzLmdldFZhbHVlKCksIHRoaXMuX3JnYlNjYWxlICk7XG5cdH1cblxuXHRsb2FkKCB2YWx1ZSApIHtcblx0XHR0aGlzLl9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHZhbHVlICk7XG5cdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5fZm9ybWF0LnRvSGV4U3RyaW5nKCB0aGlzLmdldFZhbHVlKCksIHRoaXMuX3JnYlNjYWxlICk7XG5cdFx0aWYgKCAhdGhpcy5fdGV4dEZvY3VzZWQgKSB7XG5cdFx0XHR0aGlzLiR0ZXh0LnZhbHVlID0gdGhpcy4kaW5wdXQudmFsdWUuc3Vic3RyaW5nKCAxICk7XG5cdFx0fVxuXHRcdHRoaXMuJGRpc3BsYXkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gdGhpcy4kaW5wdXQudmFsdWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5jbGFzcyBGdW5jdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5ICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ2Z1bmN0aW9uJyApO1xuXG5cdFx0Ly8gQnV0dG9ucyBhcmUgdGhlIG9ubHkgY2FzZSB3aGVyZSB3aWRnZXQgY29udGFpbnMgbmFtZVxuXHRcdHRoaXMuJGJ1dHRvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XG5cdFx0dGhpcy4kYnV0dG9uLmFwcGVuZENoaWxkKCB0aGlzLiRuYW1lICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRidXR0b24gKTtcblxuXHRcdHRoaXMuJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCBlID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMuZ2V0VmFsdWUoKS5jYWxsKCB0aGlzLm9iamVjdCApO1xuXHRcdFx0dGhpcy5fY2FsbE9uQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0Ly8gZW5hYmxlcyA6YWN0aXZlIHBzZXVkbyBjbGFzcyBvbiBtb2JpbGVcblx0XHR0aGlzLiRidXR0b24uYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCAoKSA9PiB7fSwgeyBwYXNzaXZlOiB0cnVlIH0gKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRidXR0b247XG5cblx0fVxuXG59XG5cbmNsYXNzIE51bWJlckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCBtaW4sIG1heCwgc3RlcCApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdudW1iZXInICk7XG5cblx0XHR0aGlzLl9pbml0SW5wdXQoKTtcblxuXHRcdHRoaXMubWluKCBtaW4gKTtcblx0XHR0aGlzLm1heCggbWF4ICk7XG5cblx0XHRjb25zdCBzdGVwRXhwbGljaXQgPSBzdGVwICE9PSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5zdGVwKCBzdGVwRXhwbGljaXQgPyBzdGVwIDogdGhpcy5fZ2V0SW1wbGljaXRTdGVwKCksIHN0ZXBFeHBsaWNpdCApO1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0fVxuXG5cdGRlY2ltYWxzKCBkZWNpbWFscyApIHtcblx0XHR0aGlzLl9kZWNpbWFscyA9IGRlY2ltYWxzO1xuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bWluKCBtaW4gKSB7XG5cdFx0dGhpcy5fbWluID0gbWluO1xuXHRcdHRoaXMuX29uVXBkYXRlTWluTWF4KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRtYXgoIG1heCApIHtcblx0XHR0aGlzLl9tYXggPSBtYXg7XG5cdFx0dGhpcy5fb25VcGRhdGVNaW5NYXgoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHN0ZXAoIHN0ZXAsIGV4cGxpY2l0ID0gdHJ1ZSApIHtcblx0XHR0aGlzLl9zdGVwID0gc3RlcDtcblx0XHR0aGlzLl9zdGVwRXhwbGljaXQgPSBleHBsaWNpdDtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdGlmICggdGhpcy5faGFzU2xpZGVyICkge1xuXG5cdFx0XHRsZXQgcGVyY2VudCA9ICggdmFsdWUgLSB0aGlzLl9taW4gKSAvICggdGhpcy5fbWF4IC0gdGhpcy5fbWluICk7XG5cdFx0XHRwZXJjZW50ID0gTWF0aC5tYXgoIDAsIE1hdGgubWluKCBwZXJjZW50LCAxICkgKTtcblxuXHRcdFx0dGhpcy4kZmlsbC5zdHlsZS53aWR0aCA9IHBlcmNlbnQgKiAxMDAgKyAnJSc7XG5cblx0XHR9XG5cblx0XHRpZiAoICF0aGlzLl9pbnB1dEZvY3VzZWQgKSB7XG5cdFx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuX2RlY2ltYWxzID09PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHZhbHVlLnRvRml4ZWQoIHRoaXMuX2RlY2ltYWxzICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdF9pbml0SW5wdXQoKSB7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ3RleHQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0Ly8gT24gdG91Y2ggZGV2aWNlcyBvbmx5LCB1c2UgaW5wdXRbdHlwZT1udW1iZXJdIHRvIGZvcmNlIGEgbnVtZXJpYyBrZXlib2FyZC5cblx0XHQvLyBJZGVhbGx5IHdlIGNvdWxkIHVzZSBvbmUgaW5wdXQgdHlwZSBldmVyeXdoZXJlLCBidXQgW3R5cGU9bnVtYmVyXSBoYXMgcXVpcmtzXG5cdFx0Ly8gb24gZGVza3RvcCwgYW5kIFtpbnB1dG1vZGU9ZGVjaW1hbF0gaGFzIHF1aXJrcyBvbiBpT1MuXG5cdFx0Ly8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9nZW9yZ2VhbHdheXMvbGlsLWd1aS9wdWxsLzE2XG5cblx0XHRjb25zdCBpc1RvdWNoID0gd2luZG93Lm1hdGNoTWVkaWEoICcocG9pbnRlcjogY29hcnNlKScgKS5tYXRjaGVzO1xuXG5cdFx0aWYgKCBpc1RvdWNoICkge1xuXHRcdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICdudW1iZXInICk7XG5cdFx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdzdGVwJywgJ2FueScgKTtcblx0XHR9XG5cblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kaW5wdXQ7XG5cblx0XHRjb25zdCBvbklucHV0ID0gKCkgPT4ge1xuXG5cdFx0XHRsZXQgdmFsdWUgPSBwYXJzZUZsb2F0KCB0aGlzLiRpbnB1dC52YWx1ZSApO1xuXG5cdFx0XHRpZiAoIGlzTmFOKCB2YWx1ZSApICkgcmV0dXJuO1xuXG5cdFx0XHRpZiAoIHRoaXMuX3N0ZXBFeHBsaWNpdCApIHtcblx0XHRcdFx0dmFsdWUgPSB0aGlzLl9zbmFwKCB2YWx1ZSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLl9jbGFtcCggdmFsdWUgKSApO1xuXG5cdFx0fTtcblxuXHRcdC8vIEtleXMgJiBtb3VzZSB3aGVlbFxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3QgaW5jcmVtZW50ID0gZGVsdGEgPT4ge1xuXG5cdFx0XHRjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cblx0XHRcdGlmICggaXNOYU4oIHZhbHVlICkgKSByZXR1cm47XG5cblx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCB2YWx1ZSArIGRlbHRhICk7XG5cblx0XHRcdC8vIEZvcmNlIHRoZSBpbnB1dCB0byB1cGRhdGVEaXNwbGF5IHdoZW4gaXQncyBmb2N1c2VkXG5cdFx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvbktleURvd24gPSBlID0+IHtcblx0XHRcdC8vIFVzaW5nIGBlLmtleWAgaW5zdGVhZCBvZiBgZS5jb2RlYCBhbHNvIGNhdGNoZXMgTnVtcGFkRW50ZXJcblx0XHRcdGlmICggZS5rZXkgPT09ICdFbnRlcicgKSB7XG5cdFx0XHRcdHRoaXMuJGlucHV0LmJsdXIoKTtcblx0XHRcdH1cblx0XHRcdGlmICggZS5jb2RlID09PSAnQXJyb3dVcCcgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aW5jcmVtZW50KCB0aGlzLl9zdGVwICogdGhpcy5fYXJyb3dLZXlNdWx0aXBsaWVyKCBlICkgKTtcblx0XHRcdH1cblx0XHRcdGlmICggZS5jb2RlID09PSAnQXJyb3dEb3duJyApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpbmNyZW1lbnQoIHRoaXMuX3N0ZXAgKiB0aGlzLl9hcnJvd0tleU11bHRpcGxpZXIoIGUgKSAqIC0xICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uV2hlZWwgPSBlID0+IHtcblx0XHRcdGlmICggdGhpcy5faW5wdXRGb2N1c2VkICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGluY3JlbWVudCggdGhpcy5fc3RlcCAqIHRoaXMuX25vcm1hbGl6ZU1vdXNlV2hlZWwoIGUgKSApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvLyBWZXJ0aWNhbCBkcmFnXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRsZXQgdGVzdGluZ0ZvclZlcnRpY2FsRHJhZyA9IGZhbHNlLFxuXHRcdFx0aW5pdENsaWVudFgsXG5cdFx0XHRpbml0Q2xpZW50WSxcblx0XHRcdHByZXZDbGllbnRZLFxuXHRcdFx0aW5pdFZhbHVlLFxuXHRcdFx0ZHJhZ0RlbHRhO1xuXG5cdFx0Ly8gT25jZSB0aGUgbW91c2UgaXMgZHJhZ2dlZCBtb3JlIHRoYW4gRFJBR19USFJFU0ggcHggb24gYW55IGF4aXMsIHdlIGRlY2lkZVxuXHRcdC8vIG9uIHRoZSB1c2VyJ3MgaW50ZW50OiBob3Jpem9udGFsIG1lYW5zIGhpZ2hsaWdodCwgdmVydGljYWwgbWVhbnMgZHJhZy5cblx0XHRjb25zdCBEUkFHX1RIUkVTSCA9IDU7XG5cblx0XHRjb25zdCBvbk1vdXNlRG93biA9IGUgPT4ge1xuXG5cdFx0XHRpbml0Q2xpZW50WCA9IGUuY2xpZW50WDtcblx0XHRcdGluaXRDbGllbnRZID0gcHJldkNsaWVudFkgPSBlLmNsaWVudFk7XG5cdFx0XHR0ZXN0aW5nRm9yVmVydGljYWxEcmFnID0gdHJ1ZTtcblxuXHRcdFx0aW5pdFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdFx0ZHJhZ0RlbHRhID0gMDtcblxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwICk7XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Nb3VzZU1vdmUgPSBlID0+IHtcblxuXHRcdFx0aWYgKCB0ZXN0aW5nRm9yVmVydGljYWxEcmFnICkge1xuXG5cdFx0XHRcdGNvbnN0IGR4ID0gZS5jbGllbnRYIC0gaW5pdENsaWVudFg7XG5cdFx0XHRcdGNvbnN0IGR5ID0gZS5jbGllbnRZIC0gaW5pdENsaWVudFk7XG5cblx0XHRcdFx0aWYgKCBNYXRoLmFicyggZHkgKSA+IERSQUdfVEhSRVNIICkge1xuXG5cdFx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdHRoaXMuJGlucHV0LmJsdXIoKTtcblx0XHRcdFx0XHR0ZXN0aW5nRm9yVmVydGljYWxEcmFnID0gZmFsc2U7XG5cdFx0XHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggdHJ1ZSwgJ3ZlcnRpY2FsJyApO1xuXG5cdFx0XHRcdH0gZWxzZSBpZiAoIE1hdGguYWJzKCBkeCApID4gRFJBR19USFJFU0ggKSB7XG5cblx0XHRcdFx0XHRvbk1vdXNlVXAoKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH1cblxuXHRcdFx0Ly8gVGhpcyBpc24ndCBhbiBlbHNlIHNvIHRoYXQgdGhlIGZpcnN0IG1vdmUgY291bnRzIHRvd2FyZHMgZHJhZ0RlbHRhXG5cdFx0XHRpZiAoICF0ZXN0aW5nRm9yVmVydGljYWxEcmFnICkge1xuXG5cdFx0XHRcdGNvbnN0IGR5ID0gZS5jbGllbnRZIC0gcHJldkNsaWVudFk7XG5cblx0XHRcdFx0ZHJhZ0RlbHRhIC09IGR5ICogdGhpcy5fc3RlcCAqIHRoaXMuX2Fycm93S2V5TXVsdGlwbGllciggZSApO1xuXG5cdFx0XHRcdC8vIENsYW1wIGRyYWdEZWx0YSBzbyB3ZSBkb24ndCBoYXZlICdkZWFkIHNwYWNlJyBhZnRlciBkcmFnZ2luZyBwYXN0IGJvdW5kcy5cblx0XHRcdFx0Ly8gV2UncmUgb2theSB3aXRoIHRoZSBmYWN0IHRoYXQgYm91bmRzIGNhbiBiZSB1bmRlZmluZWQgaGVyZS5cblx0XHRcdFx0aWYgKCBpbml0VmFsdWUgKyBkcmFnRGVsdGEgPiB0aGlzLl9tYXggKSB7XG5cdFx0XHRcdFx0ZHJhZ0RlbHRhID0gdGhpcy5fbWF4IC0gaW5pdFZhbHVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCBpbml0VmFsdWUgKyBkcmFnRGVsdGEgPCB0aGlzLl9taW4gKSB7XG5cdFx0XHRcdFx0ZHJhZ0RlbHRhID0gdGhpcy5fbWluIC0gaW5pdFZhbHVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIGluaXRWYWx1ZSArIGRyYWdEZWx0YSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHByZXZDbGllbnRZID0gZS5jbGllbnRZO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uTW91c2VVcCA9ICgpID0+IHtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIGZhbHNlLCAndmVydGljYWwnICk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCApO1xuXHRcdH07XG5cblx0XHQvLyBGb2N1cyBzdGF0ZSAmIG9uRmluaXNoQ2hhbmdlXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBvbkZvY3VzID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5faW5wdXRGb2N1c2VkID0gdHJ1ZTtcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25CbHVyID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5faW5wdXRGb2N1c2VkID0gZmFsc2U7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH07XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnaW5wdXQnLCBvbklucHV0ICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBvbktleURvd24gKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0gKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgb25Nb3VzZURvd24gKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCBvbkZvY3VzICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCBvbkJsdXIgKTtcblxuXHR9XG5cblx0X2luaXRTbGlkZXIoKSB7XG5cblx0XHR0aGlzLl9oYXNTbGlkZXIgPSB0cnVlO1xuXG5cdFx0Ly8gQnVpbGQgRE9NXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHR0aGlzLiRzbGlkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJHNsaWRlci5jbGFzc0xpc3QuYWRkKCAnc2xpZGVyJyApO1xuXG5cdFx0dGhpcy4kZmlsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kZmlsbC5jbGFzc0xpc3QuYWRkKCAnZmlsbCcgKTtcblxuXHRcdHRoaXMuJHNsaWRlci5hcHBlbmRDaGlsZCggdGhpcy4kZmlsbCApO1xuXHRcdHRoaXMuJHdpZGdldC5pbnNlcnRCZWZvcmUoIHRoaXMuJHNsaWRlciwgdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnaGFzU2xpZGVyJyApO1xuXG5cdFx0Ly8gTWFwIGNsaWVudFggdG8gdmFsdWVcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGNvbnN0IG1hcCA9ICggdiwgYSwgYiwgYywgZCApID0+IHtcblx0XHRcdHJldHVybiAoIHYgLSBhICkgLyAoIGIgLSBhICkgKiAoIGQgLSBjICkgKyBjO1xuXHRcdH07XG5cblx0XHRjb25zdCBzZXRWYWx1ZUZyb21YID0gY2xpZW50WCA9PiB7XG5cdFx0XHRjb25zdCByZWN0ID0gdGhpcy4kc2xpZGVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXHRcdFx0bGV0IHZhbHVlID0gbWFwKCBjbGllbnRYLCByZWN0LmxlZnQsIHJlY3QucmlnaHQsIHRoaXMuX21pbiwgdGhpcy5fbWF4ICk7XG5cdFx0XHR0aGlzLl9zbmFwQ2xhbXBTZXRWYWx1ZSggdmFsdWUgKTtcblx0XHR9O1xuXG5cdFx0Ly8gTW91c2UgZHJhZ1xuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3QgbW91c2VEb3duID0gZSA9PiB7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCB0cnVlICk7XG5cdFx0XHRzZXRWYWx1ZUZyb21YKCBlLmNsaWVudFggKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZVVwICk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG1vdXNlTW92ZSA9IGUgPT4ge1xuXHRcdFx0c2V0VmFsdWVGcm9tWCggZS5jbGllbnRYICk7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG1vdXNlVXAgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIGZhbHNlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2VVcCApO1xuXHRcdH07XG5cblx0XHQvLyBUb3VjaCBkcmFnXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRsZXQgdGVzdGluZ0ZvclNjcm9sbCA9IGZhbHNlLCBwcmV2Q2xpZW50WCwgcHJldkNsaWVudFk7XG5cblx0XHRjb25zdCBiZWdpblRvdWNoRHJhZyA9IGUgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggdHJ1ZSApO1xuXHRcdFx0c2V0VmFsdWVGcm9tWCggZS50b3VjaGVzWyAwIF0uY2xpZW50WCApO1xuXHRcdFx0dGVzdGluZ0ZvclNjcm9sbCA9IGZhbHNlO1xuXHRcdH07XG5cblx0XHRjb25zdCBvblRvdWNoU3RhcnQgPSBlID0+IHtcblxuXHRcdFx0aWYgKCBlLnRvdWNoZXMubGVuZ3RoID4gMSApIHJldHVybjtcblxuXHRcdFx0Ly8gSWYgd2UncmUgaW4gYSBzY3JvbGxhYmxlIGNvbnRhaW5lciwgd2Ugc2hvdWxkIHdhaXQgZm9yIHRoZSBmaXJzdFxuXHRcdFx0Ly8gdG91Y2htb3ZlIHRvIHNlZSBpZiB0aGUgdXNlciBpcyB0cnlpbmcgdG8gc2xpZGUgb3Igc2Nyb2xsLlxuXHRcdFx0aWYgKCB0aGlzLl9oYXNTY3JvbGxCYXIgKSB7XG5cblx0XHRcdFx0cHJldkNsaWVudFggPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRYO1xuXHRcdFx0XHRwcmV2Q2xpZW50WSA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFk7XG5cdFx0XHRcdHRlc3RpbmdGb3JTY3JvbGwgPSB0cnVlO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdC8vIE90aGVyd2lzZSwgd2UgY2FuIHNldCB0aGUgdmFsdWUgc3RyYWlnaHQgYXdheSBvbiB0b3VjaHN0YXJ0LlxuXHRcdFx0XHRiZWdpblRvdWNoRHJhZyggZSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIG9uVG91Y2hFbmQgKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvblRvdWNoTW92ZSA9IGUgPT4ge1xuXG5cdFx0XHRpZiAoIHRlc3RpbmdGb3JTY3JvbGwgKSB7XG5cblx0XHRcdFx0Y29uc3QgZHggPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRYIC0gcHJldkNsaWVudFg7XG5cdFx0XHRcdGNvbnN0IGR5ID0gZS50b3VjaGVzWyAwIF0uY2xpZW50WSAtIHByZXZDbGllbnRZO1xuXG5cdFx0XHRcdGlmICggTWF0aC5hYnMoIGR4ICkgPiBNYXRoLmFicyggZHkgKSApIHtcblxuXHRcdFx0XHRcdC8vIFdlIG1vdmVkIGhvcml6b250YWxseSwgc2V0IHRoZSB2YWx1ZSBhbmQgc3RvcCBjaGVja2luZy5cblx0XHRcdFx0XHRiZWdpblRvdWNoRHJhZyggZSApO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHQvLyBUaGlzIHdhcywgaW4gZmFjdCwgYW4gYXR0ZW1wdCB0byBzY3JvbGwuIEFib3J0LlxuXHRcdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUgKTtcblx0XHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdHNldFZhbHVlRnJvbVgoIGUudG91Y2hlc1sgMCBdLmNsaWVudFggKTtcblxuXHRcdFx0fVxuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uVG91Y2hFbmQgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIGZhbHNlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCApO1xuXHRcdH07XG5cblx0XHQvLyBNb3VzZSB3aGVlbFxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Ly8gV2UgaGF2ZSB0byB1c2UgYSBkZWJvdW5jZWQgZnVuY3Rpb24gdG8gY2FsbCBvbkZpbmlzaENoYW5nZSBiZWNhdXNlXG5cdFx0Ly8gdGhlcmUncyBubyB3YXkgdG8gdGVsbCB3aGVuIHRoZSB1c2VyIGlzIFwiZG9uZVwiIG1vdXNlLXdoZWVsaW5nLlxuXHRcdGNvbnN0IGNhbGxPbkZpbmlzaENoYW5nZSA9IHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZS5iaW5kKCB0aGlzICk7XG5cdFx0Y29uc3QgV0hFRUxfREVCT1VOQ0VfVElNRSA9IDQwMDtcblx0XHRsZXQgd2hlZWxGaW5pc2hDaGFuZ2VUaW1lb3V0O1xuXG5cdFx0Y29uc3Qgb25XaGVlbCA9IGUgPT4ge1xuXG5cdFx0XHQvLyBpZ25vcmUgdmVydGljYWwgd2hlZWxzIGlmIHRoZXJlJ3MgYSBzY3JvbGxiYXJcblx0XHRcdGNvbnN0IGlzVmVydGljYWwgPSBNYXRoLmFicyggZS5kZWx0YVggKSA8IE1hdGguYWJzKCBlLmRlbHRhWSApO1xuXHRcdFx0aWYgKCBpc1ZlcnRpY2FsICYmIHRoaXMuX2hhc1Njcm9sbEJhciApIHJldHVybjtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQvLyBzZXQgdmFsdWVcblx0XHRcdGNvbnN0IGRlbHRhID0gdGhpcy5fbm9ybWFsaXplTW91c2VXaGVlbCggZSApICogdGhpcy5fc3RlcDtcblx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCB0aGlzLmdldFZhbHVlKCkgKyBkZWx0YSApO1xuXG5cdFx0XHQvLyBmb3JjZSB0aGUgaW5wdXQgdG8gdXBkYXRlRGlzcGxheSB3aGVuIGl0J3MgZm9jdXNlZFxuXHRcdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cblx0XHRcdC8vIGRlYm91bmNlIG9uRmluaXNoQ2hhbmdlXG5cdFx0XHRjbGVhclRpbWVvdXQoIHdoZWVsRmluaXNoQ2hhbmdlVGltZW91dCApO1xuXHRcdFx0d2hlZWxGaW5pc2hDaGFuZ2VUaW1lb3V0ID0gc2V0VGltZW91dCggY2FsbE9uRmluaXNoQ2hhbmdlLCBXSEVFTF9ERUJPVU5DRV9USU1FICk7XG5cblx0XHR9O1xuXG5cdFx0dGhpcy4kc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBtb3VzZURvd24gKTtcblx0XHR0aGlzLiRzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXHRcdHRoaXMuJHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCAnd2hlZWwnLCBvbldoZWVsLCB7IHBhc3NpdmU6IGZhbHNlIH0gKTtcblxuXHR9XG5cblx0X3NldERyYWdnaW5nU3R5bGUoIGFjdGl2ZSwgYXhpcyA9ICdob3Jpem9udGFsJyApIHtcblx0XHRpZiAoIHRoaXMuJHNsaWRlciApIHtcblx0XHRcdHRoaXMuJHNsaWRlci5jbGFzc0xpc3QudG9nZ2xlKCAnYWN0aXZlJywgYWN0aXZlICk7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggJ2xpbC1ndWktZHJhZ2dpbmcnLCBhY3RpdmUgKTtcblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoIGBsaWwtZ3VpLSR7YXhpc31gLCBhY3RpdmUgKTtcblx0fVxuXG5cdF9nZXRJbXBsaWNpdFN0ZXAoKSB7XG5cblx0XHRpZiAoIHRoaXMuX2hhc01pbiAmJiB0aGlzLl9oYXNNYXggKSB7XG5cdFx0XHRyZXR1cm4gKCB0aGlzLl9tYXggLSB0aGlzLl9taW4gKSAvIDEwMDA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIDAuMTtcblxuXHR9XG5cblx0X29uVXBkYXRlTWluTWF4KCkge1xuXG5cdFx0aWYgKCAhdGhpcy5faGFzU2xpZGVyICYmIHRoaXMuX2hhc01pbiAmJiB0aGlzLl9oYXNNYXggKSB7XG5cblx0XHRcdC8vIElmIHRoaXMgaXMgdGhlIGZpcnN0IHRpbWUgd2UncmUgaGVhcmluZyBhYm91dCBtaW4gYW5kIG1heFxuXHRcdFx0Ly8gYW5kIHdlIGhhdmVuJ3QgZXhwbGljaXRseSBzdGF0ZWQgd2hhdCBvdXIgc3RlcCBpcywgbGV0J3Ncblx0XHRcdC8vIHVwZGF0ZSB0aGF0IHRvby5cblx0XHRcdGlmICggIXRoaXMuX3N0ZXBFeHBsaWNpdCApIHtcblx0XHRcdFx0dGhpcy5zdGVwKCB0aGlzLl9nZXRJbXBsaWNpdFN0ZXAoKSwgZmFsc2UgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5faW5pdFNsaWRlcigpO1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdF9ub3JtYWxpemVNb3VzZVdoZWVsKCBlICkge1xuXG5cdFx0bGV0IHsgZGVsdGFYLCBkZWx0YVkgfSA9IGU7XG5cblx0XHQvLyBTYWZhcmkgYW5kIENocm9tZSByZXBvcnQgd2VpcmQgbm9uLWludGVncmFsIHZhbHVlcyBmb3IgYSBub3RjaGVkIHdoZWVsLFxuXHRcdC8vIGJ1dCBzdGlsbCBleHBvc2UgYWN0dWFsIGxpbmVzIHNjcm9sbGVkIHZpYSB3aGVlbERlbHRhLiBOb3RjaGVkIHdoZWVsc1xuXHRcdC8vIHNob3VsZCBiZWhhdmUgdGhlIHNhbWUgd2F5IGFzIGFycm93IGtleXMuXG5cdFx0aWYgKCBNYXRoLmZsb29yKCBlLmRlbHRhWSApICE9PSBlLmRlbHRhWSAmJiBlLndoZWVsRGVsdGEgKSB7XG5cdFx0XHRkZWx0YVggPSAwO1xuXHRcdFx0ZGVsdGFZID0gLWUud2hlZWxEZWx0YSAvIDEyMDtcblx0XHRcdGRlbHRhWSAqPSB0aGlzLl9zdGVwRXhwbGljaXQgPyAxIDogMTA7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgd2hlZWwgPSBkZWx0YVggKyAtZGVsdGFZO1xuXG5cdFx0cmV0dXJuIHdoZWVsO1xuXG5cdH1cblxuXHRfYXJyb3dLZXlNdWx0aXBsaWVyKCBlICkge1xuXG5cdFx0bGV0IG11bHQgPSB0aGlzLl9zdGVwRXhwbGljaXQgPyAxIDogMTA7XG5cblx0XHRpZiAoIGUuc2hpZnRLZXkgKSB7XG5cdFx0XHRtdWx0ICo9IDEwO1xuXHRcdH0gZWxzZSBpZiAoIGUuYWx0S2V5ICkge1xuXHRcdFx0bXVsdCAvPSAxMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gbXVsdDtcblxuXHR9XG5cblx0X3NuYXAoIHZhbHVlICkge1xuXG5cdFx0Ly8gTWFrZSB0aGUgc3RlcHMgXCJzdGFydFwiIGF0IG1pbiBvciBtYXguXG5cdFx0bGV0IG9mZnNldCA9IDA7XG5cdFx0aWYgKCB0aGlzLl9oYXNNaW4gKSB7XG5cdFx0XHRvZmZzZXQgPSB0aGlzLl9taW47XG5cdFx0fSBlbHNlIGlmICggdGhpcy5faGFzTWF4ICkge1xuXHRcdFx0b2Zmc2V0ID0gdGhpcy5fbWF4O1xuXHRcdH1cblxuXHRcdHZhbHVlIC09IG9mZnNldDtcblxuXHRcdHZhbHVlID0gTWF0aC5yb3VuZCggdmFsdWUgLyB0aGlzLl9zdGVwICkgKiB0aGlzLl9zdGVwO1xuXG5cdFx0dmFsdWUgKz0gb2Zmc2V0O1xuXG5cdFx0Ly8gVXNlZCB0byBwcmV2ZW50IFwiZmx5YXdheVwiIGRlY2ltYWxzIGxpa2UgMS4wMDAwMDAwMDAwMDAwMVxuXHRcdHZhbHVlID0gcGFyc2VGbG9hdCggdmFsdWUudG9QcmVjaXNpb24oIDE1ICkgKTtcblxuXHRcdHJldHVybiB2YWx1ZTtcblxuXHR9XG5cblx0X2NsYW1wKCB2YWx1ZSApIHtcblx0XHQvLyBlaXRoZXIgY29uZGl0aW9uIGlzIGZhbHNlIGlmIG1pbiBvciBtYXggaXMgdW5kZWZpbmVkXG5cdFx0aWYgKCB2YWx1ZSA8IHRoaXMuX21pbiApIHZhbHVlID0gdGhpcy5fbWluO1xuXHRcdGlmICggdmFsdWUgPiB0aGlzLl9tYXggKSB2YWx1ZSA9IHRoaXMuX21heDtcblx0XHRyZXR1cm4gdmFsdWU7XG5cdH1cblxuXHRfc25hcENsYW1wU2V0VmFsdWUoIHZhbHVlICkge1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuX2NsYW1wKCB0aGlzLl9zbmFwKCB2YWx1ZSApICkgKTtcblx0fVxuXG5cdGdldCBfaGFzU2Nyb2xsQmFyKCkge1xuXHRcdGNvbnN0IHJvb3QgPSB0aGlzLnBhcmVudC5yb290LiRjaGlsZHJlbjtcblx0XHRyZXR1cm4gcm9vdC5zY3JvbGxIZWlnaHQgPiByb290LmNsaWVudEhlaWdodDtcblx0fVxuXG5cdGdldCBfaGFzTWluKCkge1xuXHRcdHJldHVybiB0aGlzLl9taW4gIT09IHVuZGVmaW5lZDtcblx0fVxuXG5cdGdldCBfaGFzTWF4KCkge1xuXHRcdHJldHVybiB0aGlzLl9tYXggIT09IHVuZGVmaW5lZDtcblx0fVxuXG59XG5cbmNsYXNzIE9wdGlvbkNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCBvcHRpb25zICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ29wdGlvbicgKTtcblxuXHRcdHRoaXMuJHNlbGVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzZWxlY3QnICk7XG5cdFx0dGhpcy4kc2VsZWN0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJGRpc3BsYXkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LmFkZCggJ2Rpc3BsYXknICk7XG5cblx0XHR0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuX3ZhbHVlc1sgdGhpcy4kc2VsZWN0LnNlbGVjdGVkSW5kZXggXSApO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsICgpID0+IHtcblx0XHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LmFkZCggJ2ZvY3VzJyApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuJGRpc3BsYXkuY2xhc3NMaXN0LnJlbW92ZSggJ2ZvY3VzJyApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kc2VsZWN0ICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRkaXNwbGF5ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kc2VsZWN0O1xuXG5cdFx0dGhpcy5vcHRpb25zKCBvcHRpb25zICk7XG5cblx0fVxuXG5cdG9wdGlvbnMoIG9wdGlvbnMgKSB7XG5cblx0XHR0aGlzLl92YWx1ZXMgPSBBcnJheS5pc0FycmF5KCBvcHRpb25zICkgPyBvcHRpb25zIDogT2JqZWN0LnZhbHVlcyggb3B0aW9ucyApO1xuXHRcdHRoaXMuX25hbWVzID0gQXJyYXkuaXNBcnJheSggb3B0aW9ucyApID8gb3B0aW9ucyA6IE9iamVjdC5rZXlzKCBvcHRpb25zICk7XG5cblx0XHR0aGlzLiRzZWxlY3QucmVwbGFjZUNoaWxkcmVuKCk7XG5cblx0XHR0aGlzLl9uYW1lcy5mb3JFYWNoKCBuYW1lID0+IHtcblx0XHRcdGNvbnN0ICRvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnb3B0aW9uJyApO1xuXHRcdFx0JG9wdGlvbi50ZXh0Q29udGVudCA9IG5hbWU7XG5cdFx0XHR0aGlzLiRzZWxlY3QuYXBwZW5kQ2hpbGQoICRvcHRpb24gKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdGNvbnN0IGluZGV4ID0gdGhpcy5fdmFsdWVzLmluZGV4T2YoIHZhbHVlICk7XG5cdFx0dGhpcy4kc2VsZWN0LnNlbGVjdGVkSW5kZXggPSBpbmRleDtcblx0XHR0aGlzLiRkaXNwbGF5LnRleHRDb250ZW50ID0gaW5kZXggPT09IC0xID8gdmFsdWUgOiB0aGlzLl9uYW1lc1sgaW5kZXggXTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbmNsYXNzIFN0cmluZ0NvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5ICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ3N0cmluZycgKTtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAndGV4dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdzcGVsbGNoZWNrJywgJ2ZhbHNlJyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsICgpID0+IHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBlID0+IHtcblx0XHRcdGlmICggZS5jb2RlID09PSAnRW50ZXInICkge1xuXHRcdFx0XHR0aGlzLiRpbnB1dC5ibHVyKCk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kaW5wdXQ7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbnZhciBzdHlsZXNoZWV0ID0gYC5saWwtZ3VpIHtcbiAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5KTtcbiAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUpO1xuICBsaW5lLWhlaWdodDogMTtcbiAgZm9udC13ZWlnaHQ6IG5vcm1hbDtcbiAgZm9udC1zdHlsZTogbm9ybWFsO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG4gIHVzZXItc2VsZWN0OiBub25lO1xuICAtd2Via2l0LXVzZXItc2VsZWN0OiBub25lO1xuICB0b3VjaC1hY3Rpb246IG1hbmlwdWxhdGlvbjtcbiAgLS1iYWNrZ3JvdW5kLWNvbG9yOiAjMWYxZjFmO1xuICAtLXRleHQtY29sb3I6ICNlYmViZWI7XG4gIC0tdGl0bGUtYmFja2dyb3VuZC1jb2xvcjogIzExMTExMTtcbiAgLS10aXRsZS10ZXh0LWNvbG9yOiAjZWJlYmViO1xuICAtLXdpZGdldC1jb2xvcjogIzQyNDI0MjtcbiAgLS1ob3Zlci1jb2xvcjogIzRmNGY0ZjtcbiAgLS1mb2N1cy1jb2xvcjogIzU5NTk1OTtcbiAgLS1udW1iZXItY29sb3I6ICMyY2M5ZmY7XG4gIC0tc3RyaW5nLWNvbG9yOiAjYTJkYjNjO1xuICAtLWZvbnQtc2l6ZTogMTFweDtcbiAgLS1pbnB1dC1mb250LXNpemU6IDExcHg7XG4gIC0tZm9udC1mYW1pbHk6IC1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgXCJTZWdvZSBVSVwiLCBSb2JvdG8sIEFyaWFsLCBzYW5zLXNlcmlmO1xuICAtLWZvbnQtZmFtaWx5LW1vbm86IE1lbmxvLCBNb25hY28sIENvbnNvbGFzLCBcIkRyb2lkIFNhbnMgTW9ub1wiLCBtb25vc3BhY2U7XG4gIC0tcGFkZGluZzogNHB4O1xuICAtLXNwYWNpbmc6IDRweDtcbiAgLS13aWRnZXQtaGVpZ2h0OiAyMHB4O1xuICAtLXRpdGxlLWhlaWdodDogY2FsYyh2YXIoLS13aWRnZXQtaGVpZ2h0KSArIHZhcigtLXNwYWNpbmcpICogMS4yNSk7XG4gIC0tbmFtZS13aWR0aDogNDUlO1xuICAtLXNsaWRlci1rbm9iLXdpZHRoOiAycHg7XG4gIC0tc2xpZGVyLWlucHV0LXdpZHRoOiAyNyU7XG4gIC0tY29sb3ItaW5wdXQtd2lkdGg6IDI3JTtcbiAgLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoOiA0NXB4O1xuICAtLWNvbG9yLWlucHV0LW1pbi13aWR0aDogNDVweDtcbiAgLS1mb2xkZXItaW5kZW50OiA3cHg7XG4gIC0td2lkZ2V0LXBhZGRpbmc6IDAgMCAwIDNweDtcbiAgLS13aWRnZXQtYm9yZGVyLXJhZGl1czogMnB4O1xuICAtLWNoZWNrYm94LXNpemU6IGNhbGMoMC43NSAqIHZhcigtLXdpZGdldC1oZWlnaHQpKTtcbiAgLS1zY3JvbGxiYXItd2lkdGg6IDVweDtcbn1cbi5saWwtZ3VpLCAubGlsLWd1aSAqIHtcbiAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgbWFyZ2luOiAwO1xuICBwYWRkaW5nOiAwO1xufVxuLmxpbC1ndWkucm9vdCB7XG4gIHdpZHRoOiB2YXIoLS13aWR0aCwgMjQ1cHgpO1xuICBkaXNwbGF5OiBmbGV4O1xuICBmbGV4LWRpcmVjdGlvbjogY29sdW1uO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAudGl0bGUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgY29sb3I6IHZhcigtLXRpdGxlLXRleHQtY29sb3IpO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbiB7XG4gIG92ZXJmbG93LXg6IGhpZGRlbjtcbiAgb3ZlcmZsb3cteTogYXV0bztcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW46Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgd2lkdGg6IHZhcigtLXNjcm9sbGJhci13aWR0aCk7XG4gIGhlaWdodDogdmFyKC0tc2Nyb2xsYmFyLXdpZHRoKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXNjcm9sbGJhci13aWR0aCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbkBtZWRpYSAocG9pbnRlcjogY29hcnNlKSB7XG4gIC5saWwtZ3VpLmFsbG93LXRvdWNoLXN0eWxlcywgLmxpbC1ndWkuYWxsb3ctdG91Y2gtc3R5bGVzIC5saWwtZ3VpIHtcbiAgICAtLXdpZGdldC1oZWlnaHQ6IDI4cHg7XG4gICAgLS1wYWRkaW5nOiA2cHg7XG4gICAgLS1zcGFjaW5nOiA2cHg7XG4gICAgLS1mb250LXNpemU6IDEzcHg7XG4gICAgLS1pbnB1dC1mb250LXNpemU6IDE2cHg7XG4gICAgLS1mb2xkZXItaW5kZW50OiAxMHB4O1xuICAgIC0tc2Nyb2xsYmFyLXdpZHRoOiA3cHg7XG4gICAgLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoOiA1MHB4O1xuICAgIC0tY29sb3ItaW5wdXQtbWluLXdpZHRoOiA2NXB4O1xuICB9XG59XG4ubGlsLWd1aS5mb3JjZS10b3VjaC1zdHlsZXMsIC5saWwtZ3VpLmZvcmNlLXRvdWNoLXN0eWxlcyAubGlsLWd1aSB7XG4gIC0td2lkZ2V0LWhlaWdodDogMjhweDtcbiAgLS1wYWRkaW5nOiA2cHg7XG4gIC0tc3BhY2luZzogNnB4O1xuICAtLWZvbnQtc2l6ZTogMTNweDtcbiAgLS1pbnB1dC1mb250LXNpemU6IDE2cHg7XG4gIC0tZm9sZGVyLWluZGVudDogMTBweDtcbiAgLS1zY3JvbGxiYXItd2lkdGg6IDdweDtcbiAgLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoOiA1MHB4O1xuICAtLWNvbG9yLWlucHV0LW1pbi13aWR0aDogNjVweDtcbn1cbi5saWwtZ3VpLmF1dG9QbGFjZSB7XG4gIG1heC1oZWlnaHQ6IDEwMCU7XG4gIHBvc2l0aW9uOiBmaXhlZDtcbiAgdG9wOiAwO1xuICByaWdodDogMTVweDtcbiAgei1pbmRleDogMTAwMTtcbn1cblxuLmxpbC1ndWkgLmNvbnRyb2xsZXIge1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBwYWRkaW5nOiAwIHZhcigtLXBhZGRpbmcpO1xuICBtYXJnaW46IHZhcigtLXNwYWNpbmcpIDA7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5kaXNhYmxlZCB7XG4gIG9wYWNpdHk6IDAuNTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmRpc2FibGVkLCAubGlsLWd1aSAuY29udHJvbGxlci5kaXNhYmxlZCAqIHtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmUgIWltcG9ydGFudDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyID4gLm5hbWUge1xuICBtaW4td2lkdGg6IHZhcigtLW5hbWUtd2lkdGgpO1xuICBmbGV4LXNocmluazogMDtcbiAgd2hpdGUtc3BhY2U6IHByZTtcbiAgcGFkZGluZy1yaWdodDogdmFyKC0tc3BhY2luZyk7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyIC53aWRnZXQge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHdpZHRoOiAxMDAlO1xuICBtaW4taGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLnN0cmluZyBpbnB1dCB7XG4gIGNvbG9yOiB2YXIoLS1zdHJpbmctY29sb3IpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuYm9vbGVhbiB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmNvbG9yIC5kaXNwbGF5IHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgLmRpc3BsYXk6aG92ZXI6YmVmb3JlIHtcbiAgICBjb250ZW50OiBcIiBcIjtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICAgIGJvcmRlcjogMXB4IHNvbGlkICNmZmY5O1xuICAgIHRvcDogMDtcbiAgICByaWdodDogMDtcbiAgICBib3R0b206IDA7XG4gICAgbGVmdDogMDtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgaW5wdXRbdHlwZT1jb2xvcl0ge1xuICBvcGFjaXR5OiAwO1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiAxMDAlO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciBpbnB1dFt0eXBlPXRleHRdIHtcbiAgbWFyZ2luLWxlZnQ6IHZhcigtLXNwYWNpbmcpO1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHktbW9ubyk7XG4gIG1pbi13aWR0aDogdmFyKC0tY29sb3ItaW5wdXQtbWluLXdpZHRoKTtcbiAgd2lkdGg6IHZhcigtLWNvbG9yLWlucHV0LXdpZHRoKTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gc2VsZWN0IHtcbiAgb3BhY2l0eTogMDtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB3aWR0aDogMTAwJTtcbiAgbWF4LXdpZHRoOiAxMDAlO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5IHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBsaW5lLWhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIG1heC13aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgd29yZC1icmVhazogYnJlYWstYWxsO1xuICBwYWRkaW5nLWxlZnQ6IDAuNTVlbTtcbiAgcGFkZGluZy1yaWdodDogMS43NWVtO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5LmZvY3VzIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAuZGlzcGxheS5hY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXk6YWZ0ZXIge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIGNvbnRlbnQ6IFwi4oaVXCI7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICByaWdodDogMDtcbiAgYm90dG9tOiAwO1xuICBwYWRkaW5nLXJpZ2h0OiAwLjM3NWVtO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC53aWRnZXQsXG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gc2VsZWN0IHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC53aWRnZXQ6aG92ZXIgLmRpc3BsYXkge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIGlucHV0IHtcbiAgY29sb3I6IHZhcigtLW51bWJlci1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIuaGFzU2xpZGVyIGlucHV0IHtcbiAgbWFyZ2luLWxlZnQ6IHZhcigtLXNwYWNpbmcpO1xuICB3aWR0aDogdmFyKC0tc2xpZGVyLWlucHV0LXdpZHRoKTtcbiAgbWluLXdpZHRoOiB2YXIoLS1zbGlkZXItaW5wdXQtbWluLXdpZHRoKTtcbiAgZmxleC1zaHJpbms6IDA7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlciB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIHBhZGRpbmctcmlnaHQ6IHZhcigtLXNsaWRlci1rbm9iLXdpZHRoKTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgY3Vyc29yOiBldy1yZXNpemU7XG4gIHRvdWNoLWFjdGlvbjogcGFuLXk7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlcjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlci5hY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLnNsaWRlci5hY3RpdmUgLmZpbGwge1xuICBvcGFjaXR5OiAwLjk1O1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIC5maWxsIHtcbiAgaGVpZ2h0OiAxMDAlO1xuICBib3JkZXItcmlnaHQ6IHZhcigtLXNsaWRlci1rbm9iLXdpZHRoKSBzb2xpZCB2YXIoLS1udW1iZXItY29sb3IpO1xuICBib3gtc2l6aW5nOiBjb250ZW50LWJveDtcbn1cblxuLmxpbC1ndWktZHJhZ2dpbmcgLmxpbC1ndWkge1xuICAtLWhvdmVyLWNvbG9yOiB2YXIoLS13aWRnZXQtY29sb3IpO1xufVxuLmxpbC1ndWktZHJhZ2dpbmcgKiB7XG4gIGN1cnNvcjogZXctcmVzaXplICFpbXBvcnRhbnQ7XG59XG5cbi5saWwtZ3VpLWRyYWdnaW5nLmxpbC1ndWktdmVydGljYWwgKiB7XG4gIGN1cnNvcjogbnMtcmVzaXplICFpbXBvcnRhbnQ7XG59XG5cbi5saWwtZ3VpIC50aXRsZSB7XG4gIGhlaWdodDogdmFyKC0tdGl0bGUtaGVpZ2h0KTtcbiAgZm9udC13ZWlnaHQ6IDYwMDtcbiAgcGFkZGluZzogMCB2YXIoLS1wYWRkaW5nKTtcbiAgd2lkdGg6IDEwMCU7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIGJhY2tncm91bmQ6IG5vbmU7XG4gIHRleHQtZGVjb3JhdGlvbi1za2lwOiBvYmplY3RzO1xufVxuLmxpbC1ndWkgLnRpdGxlOmJlZm9yZSB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgY29udGVudDogXCLilr5cIjtcbiAgcGFkZGluZy1yaWdodDogMnB4O1xuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG59XG4ubGlsLWd1aSAudGl0bGU6YWN0aXZlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tdGl0bGUtYmFja2dyb3VuZC1jb2xvcik7XG4gIG9wYWNpdHk6IDAuNzU7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICBib2R5Om5vdCgubGlsLWd1aS1kcmFnZ2luZykgLmxpbC1ndWkgLnRpdGxlOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgICBvcGFjaXR5OiAwLjg1O1xuICB9XG4gIC5saWwtZ3VpIC50aXRsZTpmb2N1cyB7XG4gICAgdGV4dC1kZWNvcmF0aW9uOiB1bmRlcmxpbmUgdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aS5yb290ID4gLnRpdGxlOmZvY3VzIHtcbiAgdGV4dC1kZWNvcmF0aW9uOiBub25lICFpbXBvcnRhbnQ7XG59XG4ubGlsLWd1aS5jbG9zZWQgPiAudGl0bGU6YmVmb3JlIHtcbiAgY29udGVudDogXCLilrhcIjtcbn1cbi5saWwtZ3VpLmNsb3NlZCA+IC5jaGlsZHJlbiB7XG4gIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtN3B4KTtcbiAgb3BhY2l0eTogMDtcbn1cbi5saWwtZ3VpLmNsb3NlZDpub3QoLnRyYW5zaXRpb24pID4gLmNoaWxkcmVuIHtcbiAgZGlzcGxheTogbm9uZTtcbn1cbi5saWwtZ3VpLnRyYW5zaXRpb24gPiAuY2hpbGRyZW4ge1xuICB0cmFuc2l0aW9uLWR1cmF0aW9uOiAzMDBtcztcbiAgdHJhbnNpdGlvbi1wcm9wZXJ0eTogaGVpZ2h0LCBvcGFjaXR5LCB0cmFuc2Zvcm07XG4gIHRyYW5zaXRpb24tdGltaW5nLWZ1bmN0aW9uOiBjdWJpYy1iZXppZXIoMC4yLCAwLjYsIDAuMzUsIDEpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbn1cbi5saWwtZ3VpIC5jaGlsZHJlbjplbXB0eTpiZWZvcmUge1xuICBjb250ZW50OiBcIkVtcHR5XCI7XG4gIHBhZGRpbmc6IDAgdmFyKC0tcGFkZGluZyk7XG4gIG1hcmdpbjogdmFyKC0tc3BhY2luZykgMDtcbiAgZGlzcGxheTogYmxvY2s7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGZvbnQtc3R5bGU6IGl0YWxpYztcbiAgbGluZS1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBvcGFjaXR5OiAwLjU7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuID4gLmxpbC1ndWkgPiAudGl0bGUge1xuICBib3JkZXI6IDAgc29saWQgdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgYm9yZGVyLXdpZHRoOiAxcHggMDtcbiAgdHJhbnNpdGlvbjogYm9yZGVyLWNvbG9yIDMwMG1zO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbiA+IC5saWwtZ3VpLmNsb3NlZCA+IC50aXRsZSB7XG4gIGJvcmRlci1ib3R0b20tY29sb3I6IHRyYW5zcGFyZW50O1xufVxuLmxpbC1ndWkgKyAuY29udHJvbGxlciB7XG4gIGJvcmRlci10b3A6IDFweCBzb2xpZCB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBtYXJnaW4tdG9wOiAwO1xuICBwYWRkaW5nLXRvcDogdmFyKC0tc3BhY2luZyk7XG59XG4ubGlsLWd1aSAubGlsLWd1aSAubGlsLWd1aSA+IC50aXRsZSB7XG4gIGJvcmRlcjogbm9uZTtcbn1cbi5saWwtZ3VpIC5saWwtZ3VpIC5saWwtZ3VpID4gLmNoaWxkcmVuIHtcbiAgYm9yZGVyOiBub25lO1xuICBtYXJnaW4tbGVmdDogdmFyKC0tZm9sZGVyLWluZGVudCk7XG4gIGJvcmRlci1sZWZ0OiAycHggc29saWQgdmFyKC0td2lkZ2V0LWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5saWwtZ3VpIC5jb250cm9sbGVyIHtcbiAgYm9yZGVyOiBub25lO1xufVxuXG4ubGlsLWd1aSBsYWJlbCwgLmxpbC1ndWkgaW5wdXQsIC5saWwtZ3VpIGJ1dHRvbiB7XG4gIC13ZWJraXQtdGFwLWhpZ2hsaWdodC1jb2xvcjogdHJhbnNwYXJlbnQ7XG59XG4ubGlsLWd1aSBpbnB1dCB7XG4gIGJvcmRlcjogMDtcbiAgb3V0bGluZTogbm9uZTtcbiAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5KTtcbiAgZm9udC1zaXplOiB2YXIoLS1pbnB1dC1mb250LXNpemUpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbiAgd2lkdGg6IDEwMCU7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSBpbnB1dDpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG4gIC5saWwtZ3VpIGlucHV0OmFjdGl2ZSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSBpbnB1dDpkaXNhYmxlZCB7XG4gIG9wYWNpdHk6IDE7XG59XG4ubGlsLWd1aSBpbnB1dFt0eXBlPXRleHRdLFxuLmxpbC1ndWkgaW5wdXRbdHlwZT1udW1iZXJdIHtcbiAgcGFkZGluZzogdmFyKC0td2lkZ2V0LXBhZGRpbmcpO1xuICAtbW96LWFwcGVhcmFuY2U6IHRleHRmaWVsZDtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9dGV4dF06Zm9jdXMsXG4ubGlsLWd1aSBpbnB1dFt0eXBlPW51bWJlcl06Zm9jdXMge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG4ubGlsLWd1aSBpbnB1dFt0eXBlPWNoZWNrYm94XSB7XG4gIGFwcGVhcmFuY2U6IG5vbmU7XG4gIHdpZHRoOiB2YXIoLS1jaGVja2JveC1zaXplKTtcbiAgaGVpZ2h0OiB2YXIoLS1jaGVja2JveC1zaXplKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9Y2hlY2tib3hdOmNoZWNrZWQ6YmVmb3JlIHtcbiAgZm9udC1mYW1pbHk6IFwibGlsLWd1aVwiO1xuICBjb250ZW50OiBcIuKck1wiO1xuICBmb250LXNpemU6IHZhcigtLWNoZWNrYm94LXNpemUpO1xuICBsaW5lLWhlaWdodDogdmFyKC0tY2hlY2tib3gtc2l6ZSk7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSBpbnB1dFt0eXBlPWNoZWNrYm94XTpmb2N1cyB7XG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMXB4IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgYnV0dG9uIHtcbiAgb3V0bGluZTogbm9uZTtcbiAgY3Vyc29yOiBwb2ludGVyO1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpO1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZSk7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbiAgd2lkdGg6IDEwMCU7XG4gIGJvcmRlcjogbm9uZTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbiB7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIHRleHQtdHJhbnNmb3JtOiBub25lO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlciBidXR0b246aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWNvbG9yKTtcbiAgfVxuICAubGlsLWd1aSAuY29udHJvbGxlciBidXR0b246Zm9jdXMge1xuICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMCAwIDFweCB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbjphY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG5cbkBmb250LWZhY2Uge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIHNyYzogdXJsKFwiZGF0YTphcHBsaWNhdGlvbi9mb250LXdvZmY7Y2hhcnNldD11dGYtODtiYXNlNjQsZDA5R1JnQUJBQUFBQUFVc0FBc0FBQUFBQ0p3QUFRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUJIVTFWQ0FBQUJDQUFBQUg0QUFBREFJbXdtWUU5VEx6SUFBQUdJQUFBQVB3QUFBR0JLcUg1U1kyMWhjQUFBQWNnQUFBRDBBQUFDcnVreXlKQm5iSGxtQUFBQ3ZBQUFBRjhBQUFDRUlacFdIMmhsWVdRQUFBTWNBQUFBSndBQUFEWmZjajJ6YUdobFlRQUFBMFFBQUFBWUFBQUFKQUM1QUhob2JYUjRBQUFEWEFBQUFCQUFBQUJNQVpBQUFHeHZZMkVBQUFOc0FBQUFGQUFBQUNnQ0VnSXliV0Y0Y0FBQUE0QUFBQUFlQUFBQUlBRWZBQkp1WVcxbEFBQURvQUFBQVNJQUFBSUs5U1VVL1hCdmMzUUFBQVRFQUFBQVpnQUFBSkNUY01jMmVKeFZqYkVPZ2pBVVJVK2hGUkJLMWRHUkwrQUxuQWlUb3lNTEV6RnBuUHovZUFzaHdTYTk3NTE3Yy9Nd3dKbWVCOWt3UGwrMGNmNSt1R1BaWHNxUHU0bnZaYWJjU1psZFo2a2Z5V25vbUZZL2VTY0txWk5XdXBLSk82a1hOM0s5dUNWb0w3aUluUHIxWDViYVhzM3RqdU1xQ3R6RXVhZ20vQUFselFnUEFBQjRuR05nWVJCbG5NREF5c0RBWU0vZ0JpVDVvTFFCQXd1REpBTURFd01yTXdOV0VKRG1tc0p3Z0NGZVhaZ2hCY2psWk1nRkN6T2lLT0lGQUI3MUJiOEFlSnkxa2pGdXdrQVFSWitEd1JBd0J0TlFSVUdLUThPZEtDQVdVaEFnS0xoSXVBc1ZTcFd6NUJia2ozZEVnWWlVSXN6cVdkcFplK1o3L3dCMW9DWW1Jb2JvaXdpTFQyV2pLbC9qc2NySGZHZy9wS2RNa3lrbEM1WnMyTEVmSFlwamNSb1B6bWU5TVdXbWszZFdiSzlPYmtXa2lrT2V0SjU1NGZXeW9Fc21kU2x0K3VSMHBDSlIzNGI2dC9UVmcxU1kzc1l2ZGY4dnVpS3JweWFEWERJU2llZ3AxN3A3NTc5R3AzcCsreTdIUEFpWTlwbVRpYmxqcnI4NXFTaWR0bGc0K2wyNUdMQ2FTOGU2clJ4TkJtc25FUnVuS2JhT09iUno3TjcyanU1dmRBallwQlhIZ0p5bE9BVnNNc2VEQVBFUDhMWW9VSGljWTJCaUFBRWZoaUFHSmdaV0JnWjdSbkZSZG5WSkVMQ1FsQlNSbEFUSk1vTFYyREs0Z2xTWXM2dWJxNXZiS3JKTFNiR3JnRW1vdkR1REpWaGUzVnpjWEZ3TkxDT0lMQi9DNEl1UTF4VG41RlBpbEJUajVGUG1CQUI0V3dvcUFIaWNZMkJrWUdBQTRzazFzUi9qK1cyK01uQXpwREJnQXlFTVFVQ1NnNEVKeEFFQXdVZ0ZIZ0I0bkdOZ1pHQmdTR0ZnZ0pNaERJd01xRUFZQUJ5SEFUSjRuR05nQUlJVU5Fd21BQUJsM0FHUmVKeGpZQUFDSVFZbEJpTUdKM3dRQUVjUUJFVjRuR05nWkdCZ0VHWmdZMkJpQUFFUXlRV0VEQXovd1h3R0FBc1BBVElBQUhpY1hkQk5Tc05BSEFYd2wzNWlBMFVRWFluTVNoZlM5R1BaQTdUN0xnSXUwM1NTcGt3ellUSXQxQk40QWsvZ0tUeUFlQ3hmdzM5alpranltemN2QXdtQVcvd2d3SFVFR0RiMzYralFRM0dYR290NzlMMjRqeENQNGdIekYvRUlyNGpFSWU3d3hoT0MzZzJUTVl5NFE3K0x1L1NIdUVkL2l2dDR3SmQ0d1B4YlBFS01YM0dJNStESkZHYVNuNHFOems4bWNiS1NSNnhkWGRoU3phT1pKR3RkYXBkNHZWUGJpNnJQK2NMN1RHWE9IdFhLbGw0YlkxWGw3RUduUHRwN1h5Mm4wMHp5S0xWSGZrSEJhNEljSjJvRDNjZ2dnV3Z0L1YvRmJEclVsRVVKaFRuLzBhelZXYk5UTnIwRW5zOGRlMXRjZUs5eFptZkIxQ1BqT21QSDRraXRtdk91YmNOcG1WVE4zb0ZKeWp6Q3ZubXJ3aEpUenF6Vmo5amlTWDkxMUZqZUFBQjRuRzNITVJLQ01CQkEwZjBnaWlLaTREVThrMFYyR1diSVpET2g0UG9XV3ZxNko1VjhJZjlOVk5RY2FEaHlvdVhNaFk0clBUY0c3andZbVhoS3E4V3orcDc2MmFOYWVZWG9tMm4zbTJkTFRWZ3NyQ2dGSjdPVG1Ja1lid0liQzZ2SUI3V21GZkFBQUE9PVwiKSBmb3JtYXQoXCJ3b2ZmXCIpO1xufWA7XG5cbmZ1bmN0aW9uIF9pbmplY3RTdHlsZXMoIGNzc0NvbnRlbnQgKSB7XG5cdGNvbnN0IGluamVjdGVkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3N0eWxlJyApO1xuXHRpbmplY3RlZC5pbm5lckhUTUwgPSBjc3NDb250ZW50O1xuXHRjb25zdCBiZWZvcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCAnaGVhZCBsaW5rW3JlbD1zdHlsZXNoZWV0XSwgaGVhZCBzdHlsZScgKTtcblx0aWYgKCBiZWZvcmUgKSB7XG5cdFx0ZG9jdW1lbnQuaGVhZC5pbnNlcnRCZWZvcmUoIGluamVjdGVkLCBiZWZvcmUgKTtcblx0fSBlbHNlIHtcblx0XHRkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKCBpbmplY3RlZCApO1xuXHR9XG59XG5cblxubGV0IHN0eWxlc0luamVjdGVkID0gZmFsc2U7XG5cbmNsYXNzIEdVSSB7XG5cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBwYW5lbCB0aGF0IGhvbGRzIGNvbnRyb2xsZXJzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBuZXcgR1VJKCk7XG5cdCAqIG5ldyBHVUkoIHsgY29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggJ2N1c3RvbScgKSB9ICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5hdXRvUGxhY2U9dHJ1ZV1cblx0ICogQWRkcyB0aGUgR1VJIHRvIGBkb2N1bWVudC5ib2R5YCBhbmQgZml4ZXMgaXQgdG8gdGhlIHRvcCByaWdodCBvZiB0aGUgcGFnZS5cblx0ICpcblx0ICogQHBhcmFtIHtIVE1MRWxlbWVudH0gW29wdGlvbnMuY29udGFpbmVyXVxuXHQgKiBBZGRzIHRoZSBHVUkgdG8gdGhpcyBET00gZWxlbWVudC4gT3ZlcnJpZGVzIGBhdXRvUGxhY2VgLlxuXHQgKlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMud2lkdGg9MjQ1XVxuXHQgKiBXaWR0aCBvZiB0aGUgR1VJIGluIHBpeGVscywgdXN1YWxseSBzZXQgd2hlbiBuYW1lIGxhYmVscyBiZWNvbWUgdG9vIGxvbmcuIE5vdGUgdGhhdCB5b3UgY2FuIG1ha2Vcblx0ICogbmFtZSBsYWJlbHMgd2lkZXIgaW4gQ1NTIHdpdGggYC5saWzigJFndWkgeyDigJHigJFuYW1l4oCRd2lkdGg6IDU1JSB9YC5cblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnRpdGxlPUNvbnRyb2xzXVxuXHQgKiBOYW1lIHRvIGRpc3BsYXkgaW4gdGhlIHRpdGxlIGJhci5cblx0ICpcblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5jbG9zZUZvbGRlcnM9ZmFsc2VdXG5cdCAqIFBhc3MgYHRydWVgIHRvIGNsb3NlIGFsbCBmb2xkZXJzIGluIHRoaXMgR1VJIGJ5IGRlZmF1bHQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuaW5qZWN0U3R5bGVzPXRydWVdXG5cdCAqIEluamVjdHMgdGhlIGRlZmF1bHQgc3R5bGVzaGVldCBpbnRvIHRoZSBwYWdlIGlmIHRoaXMgaXMgdGhlIGZpcnN0IEdVSS5cblx0ICogUGFzcyBgZmFsc2VgIHRvIHVzZSB5b3VyIG93biBzdHlsZXNoZWV0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW29wdGlvbnMudG91Y2hTdHlsZXM9dHJ1ZV1cblx0ICogTWFrZXMgY29udHJvbGxlcnMgbGFyZ2VyIG9uIHRvdWNoIGRldmljZXMuIFBhc3MgYGZhbHNlYCB0byBkaXNhYmxlIHRvdWNoIHN0eWxlcy5cblx0ICpcblx0ICogQHBhcmFtIHtHVUl9IFtvcHRpb25zLnBhcmVudF1cblx0ICogQWRkcyB0aGlzIEdVSSBhcyBhIGNoaWxkIGluIGFub3RoZXIgR1VJLiBVc3VhbGx5IHRoaXMgaXMgZG9uZSBmb3IgeW91IGJ5IGBhZGRGb2xkZXIoKWAuXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcigge1xuXHRcdHBhcmVudCxcblx0XHRhdXRvUGxhY2UgPSBwYXJlbnQgPT09IHVuZGVmaW5lZCxcblx0XHRjb250YWluZXIsXG5cdFx0d2lkdGgsXG5cdFx0dGl0bGUgPSAnQ29udHJvbHMnLFxuXHRcdGNsb3NlRm9sZGVycyA9IGZhbHNlLFxuXHRcdGluamVjdFN0eWxlcyA9IHRydWUsXG5cdFx0dG91Y2hTdHlsZXMgPSB0cnVlXG5cdH0gPSB7fSApIHtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBHVUkgY29udGFpbmluZyB0aGlzIGZvbGRlciwgb3IgYHVuZGVmaW5lZGAgaWYgdGhpcyBpcyB0aGUgcm9vdCBHVUkuXG5cdFx0ICogQHR5cGUge0dVSX1cblx0XHQgKi9cblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSB0b3AgbGV2ZWwgR1VJIGNvbnRhaW5pbmcgdGhpcyBmb2xkZXIsIG9yIGB0aGlzYCBpZiB0aGlzIGlzIHRoZSByb290IEdVSS5cblx0XHQgKiBAdHlwZSB7R1VJfVxuXHRcdCAqL1xuXHRcdHRoaXMucm9vdCA9IHBhcmVudCA/IHBhcmVudC5yb290IDogdGhpcztcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBsaXN0IG9mIGNvbnRyb2xsZXJzIGFuZCBmb2xkZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSS5cblx0XHQgKiBAdHlwZSB7QXJyYXk8R1VJfENvbnRyb2xsZXI+fVxuXHRcdCAqL1xuXHRcdHRoaXMuY2hpbGRyZW4gPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBsaXN0IG9mIGNvbnRyb2xsZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSS5cblx0XHQgKiBAdHlwZSB7QXJyYXk8Q29udHJvbGxlcj59XG5cdFx0ICovXG5cdFx0dGhpcy5jb250cm9sbGVycyA9IFtdO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxpc3Qgb2YgZm9sZGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkuXG5cdFx0ICogQHR5cGUge0FycmF5PEdVST59XG5cdFx0ICovXG5cdFx0dGhpcy5mb2xkZXJzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgR1VJIGlzIGNsb3NlZC4gVXNlIGBndWkub3BlbigpYCBvciBgZ3VpLmNsb3NlKClgIHRvIGNoYW5nZSB0aGlzLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2Nsb3NlZCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIEdVSSBpcyBoaWRkZW4uIFVzZSBgZ3VpLnNob3coKWAgb3IgYGd1aS5oaWRlKClgIHRvIGNoYW5nZSB0aGlzLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2hpZGRlbiA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG91dGVybW9zdCBjb250YWluZXIgZWxlbWVudC5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2xpbC1ndWknICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgdGl0bGUuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2J1dHRvbicgKTtcblx0XHR0aGlzLiR0aXRsZS5jbGFzc0xpc3QuYWRkKCAndGl0bGUnICk7XG5cdFx0dGhpcy4kdGl0bGUuc2V0QXR0cmlidXRlKCAnYXJpYS1leHBhbmRlZCcsIHRydWUgKTtcblxuXHRcdHRoaXMuJHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsICgpID0+IHRoaXMub3BlbkFuaW1hdGVkKCB0aGlzLl9jbG9zZWQgKSApO1xuXG5cdFx0Ly8gZW5hYmxlcyA6YWN0aXZlIHBzZXVkbyBjbGFzcyBvbiBtb2JpbGVcblx0XHR0aGlzLiR0aXRsZS5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsICgpID0+IHt9LCB7IHBhc3NpdmU6IHRydWUgfSApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgY2hpbGRyZW4uXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJGNoaWxkcmVuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRjaGlsZHJlbi5jbGFzc0xpc3QuYWRkKCAnY2hpbGRyZW4nICk7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuJHRpdGxlICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiRjaGlsZHJlbiApO1xuXG5cdFx0dGhpcy50aXRsZSggdGl0bGUgKTtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cblx0XHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnB1c2goIHRoaXMgKTtcblx0XHRcdHRoaXMucGFyZW50LmZvbGRlcnMucHVzaCggdGhpcyApO1xuXG5cdFx0XHR0aGlzLnBhcmVudC4kY2hpbGRyZW4uYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXG5cdFx0XHQvLyBTdG9wIHRoZSBjb25zdHJ1Y3RvciBlYXJseSwgZXZlcnl0aGluZyBvbndhcmQgb25seSBhcHBsaWVzIHRvIHJvb3QgR1VJJ3Ncblx0XHRcdHJldHVybjtcblxuXHRcdH1cblxuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAncm9vdCcgKTtcblxuXHRcdGlmICggdG91Y2hTdHlsZXMgKSB7XG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2FsbG93LXRvdWNoLXN0eWxlcycgKTtcblx0XHR9XG5cblx0XHQvLyBJbmplY3Qgc3R5bGVzaGVldCBpZiB3ZSBoYXZlbid0IGRvbmUgdGhhdCB5ZXRcblx0XHRpZiAoICFzdHlsZXNJbmplY3RlZCAmJiBpbmplY3RTdHlsZXMgKSB7XG5cdFx0XHRfaW5qZWN0U3R5bGVzKCBzdHlsZXNoZWV0ICk7XG5cdFx0XHRzdHlsZXNJbmplY3RlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBjb250YWluZXIgKSB7XG5cblx0XHRcdGNvbnRhaW5lci5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHR9IGVsc2UgaWYgKCBhdXRvUGxhY2UgKSB7XG5cblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnYXV0b1BsYWNlJyApO1xuXHRcdFx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHdpZHRoICkge1xuXHRcdFx0dGhpcy5kb21FbGVtZW50LnN0eWxlLnNldFByb3BlcnR5KCAnLS13aWR0aCcsIHdpZHRoICsgJ3B4JyApO1xuXHRcdH1cblxuXHRcdHRoaXMuX2Nsb3NlRm9sZGVycyA9IGNsb3NlRm9sZGVycztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBjb250cm9sbGVyIHRvIHRoZSBHVUksIGluZmVycmluZyBjb250cm9sbGVyIHR5cGUgdXNpbmcgdGhlIGB0eXBlb2ZgIG9wZXJhdG9yLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKTtcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAnbnVtYmVyJywgMCwgMTAwLCAxICk7XG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ29wdGlvbnMnLCBbIDEsIDIsIDMgXSApO1xuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdGhlIGNvbnRyb2xsZXIgd2lsbCBtb2RpZnkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjb250cm9sLlxuXHQgKiBAcGFyYW0ge251bWJlcnxvYmplY3R8QXJyYXl9IFskMV0gTWluaW11bSB2YWx1ZSBmb3IgbnVtYmVyIGNvbnRyb2xsZXJzLCBvciB0aGUgc2V0IG9mXG5cdCAqIHNlbGVjdGFibGUgdmFsdWVzIGZvciBhIGRyb3Bkb3duLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW21heF0gTWF4aW11bSB2YWx1ZSBmb3IgbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gW3N0ZXBdIFN0ZXAgdmFsdWUgZm9yIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQHJldHVybnMge0NvbnRyb2xsZXJ9XG5cdCAqL1xuXHRhZGQoIG9iamVjdCwgcHJvcGVydHksICQxLCBtYXgsIHN0ZXAgKSB7XG5cblx0XHRpZiAoIE9iamVjdCggJDEgKSA9PT0gJDEgKSB7XG5cblx0XHRcdHJldHVybiBuZXcgT3B0aW9uQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgJDEgKTtcblxuXHRcdH1cblxuXHRcdGNvbnN0IGluaXRpYWxWYWx1ZSA9IG9iamVjdFsgcHJvcGVydHkgXTtcblxuXHRcdHN3aXRjaCAoIHR5cGVvZiBpbml0aWFsVmFsdWUgKSB7XG5cblx0XHRcdGNhc2UgJ251bWJlcic6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBOdW1iZXJDb250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCAkMSwgbWF4LCBzdGVwICk7XG5cblx0XHRcdGNhc2UgJ2Jvb2xlYW4nOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgQm9vbGVhbkNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuXHRcdFx0Y2FzZSAnc3RyaW5nJzpcblxuXHRcdFx0XHRyZXR1cm4gbmV3IFN0cmluZ0NvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuXHRcdFx0Y2FzZSAnZnVuY3Rpb24nOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgRnVuY3Rpb25Db250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cblx0XHR9XG5cblx0XHRjb25zb2xlLmVycm9yKCBgZ3VpLmFkZCBmYWlsZWRcblx0cHJvcGVydHk6YCwgcHJvcGVydHksIGBcblx0b2JqZWN0OmAsIG9iamVjdCwgYFxuXHR2YWx1ZTpgLCBpbml0aWFsVmFsdWUgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBjb2xvciBjb250cm9sbGVyIHRvIHRoZSBHVUkuXG5cdCAqIEBleGFtcGxlXG5cdCAqIHBhcmFtcyA9IHtcblx0ICogXHRjc3NDb2xvcjogJyNmZjAwZmYnLFxuXHQgKiBcdHJnYkNvbG9yOiB7IHI6IDAsIGc6IDAuMiwgYjogMC40IH0sXG5cdCAqIFx0Y3VzdG9tUmFuZ2U6IFsgMCwgMTI3LCAyNTUgXSxcblx0ICogfTtcblx0ICpcblx0ICogZ3VpLmFkZENvbG9yKCBwYXJhbXMsICdjc3NDb2xvcicgKTtcblx0ICogZ3VpLmFkZENvbG9yKCBwYXJhbXMsICdyZ2JDb2xvcicgKTtcblx0ICogZ3VpLmFkZENvbG9yKCBwYXJhbXMsICdjdXN0b21SYW5nZScsIDI1NSApO1xuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb2JqZWN0IFRoZSBvYmplY3QgdGhlIGNvbnRyb2xsZXIgd2lsbCBtb2RpZnkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBwcm9wZXJ0eSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSB0byBjb250cm9sLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gcmdiU2NhbGUgTWF4aW11bSB2YWx1ZSBmb3IgYSBjb2xvciBjaGFubmVsIHdoZW4gdXNpbmcgYW4gUkdCIGNvbG9yLiBZb3UgbWF5XG5cdCAqIG5lZWQgdG8gc2V0IHRoaXMgdG8gMjU1IGlmIHlvdXIgY29sb3JzIGFyZSB0b28gYnJpZ2h0LlxuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcn1cblx0ICovXG5cdGFkZENvbG9yKCBvYmplY3QsIHByb3BlcnR5LCByZ2JTY2FsZSA9IDEgKSB7XG5cdFx0cmV0dXJuIG5ldyBDb2xvckNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksIHJnYlNjYWxlICk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGZvbGRlciB0byB0aGUgR1VJLCB3aGljaCBpcyBqdXN0IGFub3RoZXIgR1VJLiBUaGlzIG1ldGhvZCByZXR1cm5zXG5cdCAqIHRoZSBuZXN0ZWQgR1VJIHNvIHlvdSBjYW4gYWRkIGNvbnRyb2xsZXJzIHRvIGl0LlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb25zdCBmb2xkZXIgPSBndWkuYWRkRm9sZGVyKCAnUG9zaXRpb24nICk7XG5cdCAqIGZvbGRlci5hZGQoIHBvc2l0aW9uLCAneCcgKTtcblx0ICogZm9sZGVyLmFkZCggcG9zaXRpb24sICd5JyApO1xuXHQgKiBmb2xkZXIuYWRkKCBwb3NpdGlvbiwgJ3onICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZSBOYW1lIHRvIGRpc3BsYXkgaW4gdGhlIGZvbGRlcidzIHRpdGxlIGJhci5cblx0ICogQHJldHVybnMge0dVSX1cblx0ICovXG5cdGFkZEZvbGRlciggdGl0bGUgKSB7XG5cdFx0Y29uc3QgZm9sZGVyID0gbmV3IEdVSSggeyBwYXJlbnQ6IHRoaXMsIHRpdGxlIH0gKTtcblx0XHRpZiAoIHRoaXMucm9vdC5fY2xvc2VGb2xkZXJzICkgZm9sZGVyLmNsb3NlKCk7XG5cdFx0cmV0dXJuIGZvbGRlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWNhbGxzIHZhbHVlcyB0aGF0IHdlcmUgc2F2ZWQgd2l0aCBgZ3VpLnNhdmUoKWAuXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvYmpcblx0ICogQHBhcmFtIHtib29sZWFufSByZWN1cnNpdmUgUGFzcyBmYWxzZSB0byBleGNsdWRlIGZvbGRlcnMgZGVzY2VuZGluZyBmcm9tIHRoaXMgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGxvYWQoIG9iaiwgcmVjdXJzaXZlID0gdHJ1ZSApIHtcblxuXHRcdGlmICggb2JqLmNvbnRyb2xsZXJzICkge1xuXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXJzLmZvckVhY2goIGMgPT4ge1xuXG5cdFx0XHRcdGlmICggYyBpbnN0YW5jZW9mIEZ1bmN0aW9uQ29udHJvbGxlciApIHJldHVybjtcblxuXHRcdFx0XHRpZiAoIGMuX25hbWUgaW4gb2JqLmNvbnRyb2xsZXJzICkge1xuXHRcdFx0XHRcdGMubG9hZCggb2JqLmNvbnRyb2xsZXJzWyBjLl9uYW1lIF0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHJlY3Vyc2l2ZSAmJiBvYmouZm9sZGVycyApIHtcblxuXHRcdFx0dGhpcy5mb2xkZXJzLmZvckVhY2goIGYgPT4ge1xuXG5cdFx0XHRcdGlmICggZi5fdGl0bGUgaW4gb2JqLmZvbGRlcnMgKSB7XG5cdFx0XHRcdFx0Zi5sb2FkKCBvYmouZm9sZGVyc1sgZi5fdGl0bGUgXSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBvYmplY3QgbWFwcGluZyBjb250cm9sbGVyIG5hbWVzIHRvIHZhbHVlcy4gVGhlIG9iamVjdCBjYW4gYmUgcGFzc2VkIHRvIGBndWkubG9hZCgpYCB0b1xuXHQgKiByZWNhbGwgdGhlc2UgdmFsdWVzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiB7XG5cdCAqIFx0Y29udHJvbGxlcnM6IHtcblx0ICogXHRcdHByb3AxOiAxLFxuXHQgKiBcdFx0cHJvcDI6ICd2YWx1ZScsXG5cdCAqIFx0XHQuLi5cblx0ICogXHR9LFxuXHQgKiBcdGZvbGRlcnM6IHtcblx0ICogXHRcdGZvbGRlck5hbWUxOiB7IGNvbnRyb2xsZXJzLCBmb2xkZXJzIH0sXG5cdCAqIFx0XHRmb2xkZXJOYW1lMjogeyBjb250cm9sbGVycywgZm9sZGVycyB9XG5cdCAqIFx0XHQuLi5cblx0ICogXHR9XG5cdCAqIH1cblx0ICpcblx0ICogQHBhcmFtIHtib29sZWFufSByZWN1cnNpdmUgUGFzcyBmYWxzZSB0byBleGNsdWRlIGZvbGRlcnMgZGVzY2VuZGluZyBmcm9tIHRoaXMgR1VJLlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fVxuXHQgKi9cblx0c2F2ZSggcmVjdXJzaXZlID0gdHJ1ZSApIHtcblxuXHRcdGNvbnN0IG9iaiA9IHtcblx0XHRcdGNvbnRyb2xsZXJzOiB7fSxcblx0XHRcdGZvbGRlcnM6IHt9XG5cdFx0fTtcblxuXHRcdHRoaXMuY29udHJvbGxlcnMuZm9yRWFjaCggYyA9PiB7XG5cblx0XHRcdGlmICggYyBpbnN0YW5jZW9mIEZ1bmN0aW9uQ29udHJvbGxlciApIHJldHVybjtcblxuXHRcdFx0aWYgKCBjLl9uYW1lIGluIG9iai5jb250cm9sbGVycyApIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IHNhdmUgR1VJIHdpdGggZHVwbGljYXRlIHByb3BlcnR5IFwiJHtjLl9uYW1lfVwiYCApO1xuXHRcdFx0fVxuXG5cdFx0XHRvYmouY29udHJvbGxlcnNbIGMuX25hbWUgXSA9IGMuc2F2ZSgpO1xuXG5cdFx0fSApO1xuXG5cdFx0aWYgKCByZWN1cnNpdmUgKSB7XG5cblx0XHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblxuXHRcdFx0XHRpZiAoIGYuX3RpdGxlIGluIG9iai5mb2xkZXJzICkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvciggYENhbm5vdCBzYXZlIEdVSSB3aXRoIGR1cGxpY2F0ZSBmb2xkZXIgXCIke2YuX3RpdGxlfVwiYCApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0b2JqLmZvbGRlcnNbIGYuX3RpdGxlIF0gPSBmLnNhdmUoKTtcblxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9iajtcblxuXHR9XG5cblx0LyoqXG5cdCAqIE9wZW5zIGEgR1VJIG9yIGZvbGRlci4gR1VJIGFuZCBmb2xkZXJzIGFyZSBvcGVuIGJ5IGRlZmF1bHQuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gb3BlbiBQYXNzIGZhbHNlIHRvIGNsb3NlLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLm9wZW4oKTsgLy8gb3BlblxuXHQgKiBndWkub3BlbiggZmFsc2UgKTsgLy8gY2xvc2Vcblx0ICogZ3VpLm9wZW4oIGd1aS5fY2xvc2VkICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0b3Blbiggb3BlbiA9IHRydWUgKSB7XG5cblx0XHR0aGlzLl9zZXRDbG9zZWQoICFvcGVuICk7XG5cblx0XHR0aGlzLiR0aXRsZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgIXRoaXMuX2Nsb3NlZCApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCAnY2xvc2VkJywgdGhpcy5fY2xvc2VkICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIENsb3NlcyB0aGUgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGNsb3NlKCkge1xuXHRcdHJldHVybiB0aGlzLm9wZW4oIGZhbHNlICk7XG5cdH1cblxuXHRfc2V0Q2xvc2VkKCBjbG9zZWQgKSB7XG5cdFx0aWYgKCB0aGlzLl9jbG9zZWQgPT09IGNsb3NlZCApIHJldHVybjtcblx0XHR0aGlzLl9jbG9zZWQgPSBjbG9zZWQ7XG5cdFx0dGhpcy5fY2FsbE9uT3BlbkNsb3NlKCB0aGlzICk7XG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgdGhlIEdVSSBhZnRlciBpdCdzIGJlZW4gaGlkZGVuLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5zaG93KCk7XG5cdCAqIGd1aS5zaG93KCBmYWxzZSApOyAvLyBoaWRlXG5cdCAqIGd1aS5zaG93KCBndWkuX2hpZGRlbiApOyAvLyB0b2dnbGVcblx0ICovXG5cdHNob3coIHNob3cgPSB0cnVlICkge1xuXG5cdFx0dGhpcy5faGlkZGVuID0gIXNob3c7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHRoaXMuX2hpZGRlbiA/ICdub25lJyA6ICcnO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBIaWRlcyB0aGUgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGhpZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2hvdyggZmFsc2UgKTtcblx0fVxuXG5cdG9wZW5BbmltYXRlZCggb3BlbiA9IHRydWUgKSB7XG5cblx0XHQvLyBzZXQgc3RhdGUgaW1tZWRpYXRlbHlcblx0XHR0aGlzLl9zZXRDbG9zZWQoICFvcGVuICk7XG5cblx0XHR0aGlzLiR0aXRsZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgIXRoaXMuX2Nsb3NlZCApO1xuXG5cdFx0Ly8gd2FpdCBmb3IgbmV4dCBmcmFtZSB0byBtZWFzdXJlICRjaGlsZHJlblxuXHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4ge1xuXG5cdFx0XHQvLyBleHBsaWNpdGx5IHNldCBpbml0aWFsIGhlaWdodCBmb3IgdHJhbnNpdGlvblxuXHRcdFx0Y29uc3QgaW5pdGlhbEhlaWdodCA9IHRoaXMuJGNoaWxkcmVuLmNsaWVudEhlaWdodDtcblx0XHRcdHRoaXMuJGNoaWxkcmVuLnN0eWxlLmhlaWdodCA9IGluaXRpYWxIZWlnaHQgKyAncHgnO1xuXG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ3RyYW5zaXRpb24nICk7XG5cblx0XHRcdGNvbnN0IG9uVHJhbnNpdGlvbkVuZCA9IGUgPT4ge1xuXHRcdFx0XHRpZiAoIGUudGFyZ2V0ICE9PSB0aGlzLiRjaGlsZHJlbiApIHJldHVybjtcblx0XHRcdFx0dGhpcy4kY2hpbGRyZW4uc3R5bGUuaGVpZ2h0ID0gJyc7XG5cdFx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCAndHJhbnNpdGlvbicgKTtcblx0XHRcdFx0dGhpcy4kY2hpbGRyZW4ucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQgKTtcblx0XHRcdH07XG5cblx0XHRcdHRoaXMuJGNoaWxkcmVuLmFkZEV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kICk7XG5cblx0XHRcdC8vIHRvZG86IHRoaXMgaXMgd3JvbmcgaWYgY2hpbGRyZW4ncyBzY3JvbGxIZWlnaHQgbWFrZXMgZm9yIGEgZ3VpIHRhbGxlciB0aGFuIG1heEhlaWdodFxuXHRcdFx0Y29uc3QgdGFyZ2V0SGVpZ2h0ID0gIW9wZW4gPyAwIDogdGhpcy4kY2hpbGRyZW4uc2Nyb2xsSGVpZ2h0O1xuXG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSggJ2Nsb3NlZCcsICFvcGVuICk7XG5cblx0XHRcdHJlcXVlc3RBbmltYXRpb25GcmFtZSggKCkgPT4ge1xuXHRcdFx0XHR0aGlzLiRjaGlsZHJlbi5zdHlsZS5oZWlnaHQgPSB0YXJnZXRIZWlnaHQgKyAncHgnO1xuXHRcdFx0fSApO1xuXG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2UgdGhlIHRpdGxlIG9mIHRoaXMgR1VJLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHR0aXRsZSggdGl0bGUgKSB7XG5cdFx0LyoqXG5cdFx0ICogQ3VycmVudCB0aXRsZSBvZiB0aGUgR1VJLiBVc2UgYGd1aS50aXRsZSggJ1RpdGxlJyApYCB0byBtb2RpZnkgdGhpcyB2YWx1ZS5cblx0XHQgKiBAdHlwZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdHRoaXMuX3RpdGxlID0gdGl0bGU7XG5cdFx0dGhpcy4kdGl0bGUudGV4dENvbnRlbnQgPSB0aXRsZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNldHMgYWxsIGNvbnRyb2xsZXJzIHRvIHRoZWlyIGluaXRpYWwgdmFsdWVzLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJlY3Vyc2l2ZSBQYXNzIGZhbHNlIHRvIGV4Y2x1ZGUgZm9sZGVycyBkZXNjZW5kaW5nIGZyb20gdGhpcyBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0cmVzZXQoIHJlY3Vyc2l2ZSA9IHRydWUgKSB7XG5cdFx0Y29uc3QgY29udHJvbGxlcnMgPSByZWN1cnNpdmUgPyB0aGlzLmNvbnRyb2xsZXJzUmVjdXJzaXZlKCkgOiB0aGlzLmNvbnRyb2xsZXJzO1xuXHRcdGNvbnRyb2xsZXJzLmZvckVhY2goIGMgPT4gYy5yZXNldCgpICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuZXZlciBhIGNvbnRyb2xsZXIgaW4gdGhpcyBHVUkgY2hhbmdlcy5cblx0ICogQHBhcmFtIHtmdW5jdGlvbih7b2JqZWN0Om9iamVjdCwgcHJvcGVydHk6c3RyaW5nLCB2YWx1ZTphbnksIGNvbnRyb2xsZXI6Q29udHJvbGxlcn0pfSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLm9uQ2hhbmdlKCBldmVudCA9PiB7XG5cdCAqIFx0ZXZlbnQub2JqZWN0ICAgICAvLyBvYmplY3QgdGhhdCB3YXMgbW9kaWZpZWRcblx0ICogXHRldmVudC5wcm9wZXJ0eSAgIC8vIHN0cmluZywgbmFtZSBvZiBwcm9wZXJ0eVxuXHQgKiBcdGV2ZW50LnZhbHVlICAgICAgLy8gbmV3IHZhbHVlIG9mIGNvbnRyb2xsZXJcblx0ICogXHRldmVudC5jb250cm9sbGVyIC8vIGNvbnRyb2xsZXIgdGhhdCB3YXMgbW9kaWZpZWRcblx0ICogfSApO1xuXHQgKi9cblx0b25DaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25DaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWVcblx0XHQgKiBkaXJlY3RseS4gVXNlIHRoZSBgZ3VpLm9uQ2hhbmdlKCBjYWxsYmFjayApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7RnVuY3Rpb259XG5cdFx0ICovXG5cdFx0dGhpcy5fb25DaGFuZ2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9jYWxsT25DaGFuZ2UoIGNvbnRyb2xsZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMucGFyZW50ICkge1xuXHRcdFx0dGhpcy5wYXJlbnQuX2NhbGxPbkNoYW5nZSggY29udHJvbGxlciApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fb25DaGFuZ2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX29uQ2hhbmdlLmNhbGwoIHRoaXMsIHtcblx0XHRcdFx0b2JqZWN0OiBjb250cm9sbGVyLm9iamVjdCxcblx0XHRcdFx0cHJvcGVydHk6IGNvbnRyb2xsZXIucHJvcGVydHksXG5cdFx0XHRcdHZhbHVlOiBjb250cm9sbGVyLmdldFZhbHVlKCksXG5cdFx0XHRcdGNvbnRyb2xsZXJcblx0XHRcdH0gKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuZXZlciBhIGNvbnRyb2xsZXIgaW4gdGhpcyBHVUkgaGFzIGZpbmlzaGVkIGNoYW5naW5nLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHtvYmplY3Q6b2JqZWN0LCBwcm9wZXJ0eTpzdHJpbmcsIHZhbHVlOmFueSwgY29udHJvbGxlcjpDb250cm9sbGVyfSl9IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub25GaW5pc2hDaGFuZ2UoIGV2ZW50ID0+IHtcblx0ICogXHRldmVudC5vYmplY3QgICAgIC8vIG9iamVjdCB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiBcdGV2ZW50LnByb3BlcnR5ICAgLy8gc3RyaW5nLCBuYW1lIG9mIHByb3BlcnR5XG5cdCAqIFx0ZXZlbnQudmFsdWUgICAgICAvLyBuZXcgdmFsdWUgb2YgY29udHJvbGxlclxuXHQgKiBcdGV2ZW50LmNvbnRyb2xsZXIgLy8gY29udHJvbGxlciB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKSB7XG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBhY2Nlc3MgdGhlIGZ1bmN0aW9uIGJvdW5kIHRvIGBvbkZpbmlzaENoYW5nZWAgZXZlbnRzLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBndWkub25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X2NhbGxPbkZpbmlzaENoYW5nZSggY29udHJvbGxlciApIHtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uRmluaXNoQ2hhbmdlKCBjb250cm9sbGVyICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9vbkZpbmlzaENoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25GaW5pc2hDaGFuZ2UuY2FsbCggdGhpcywge1xuXHRcdFx0XHRvYmplY3Q6IGNvbnRyb2xsZXIub2JqZWN0LFxuXHRcdFx0XHRwcm9wZXJ0eTogY29udHJvbGxlci5wcm9wZXJ0eSxcblx0XHRcdFx0dmFsdWU6IGNvbnRyb2xsZXIuZ2V0VmFsdWUoKSxcblx0XHRcdFx0Y29udHJvbGxlclxuXHRcdFx0fSApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW4gdGhpcyBHVUkgb3IgaXRzIGRlc2NlbmRhbnRzIGFyZSBvcGVuZWQgb3IgY2xvc2VkLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKEdVSSl9IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub25PcGVuQ2xvc2UoIGNoYW5nZWRHVUkgPT4ge1xuXHQgKiBcdGNvbnNvbGUubG9nKCBjaGFuZ2VkR1VJLl9jbG9zZWQgKTtcblx0ICogfSApO1xuXHQgKi9cblx0b25PcGVuQ2xvc2UoIGNhbGxiYWNrICkge1xuXHRcdHRoaXMuX29uT3BlbkNsb3NlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfY2FsbE9uT3BlbkNsb3NlKCBjaGFuZ2VkR1VJICkge1xuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uT3BlbkNsb3NlKCBjaGFuZ2VkR1VJICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9vbk9wZW5DbG9zZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25PcGVuQ2xvc2UuY2FsbCggdGhpcywgY2hhbmdlZEdVSSApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cm95cyBhbGwgRE9NIGVsZW1lbnRzIGFuZCBldmVudCBsaXN0ZW5lcnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgR1VJLlxuXHQgKi9cblx0ZGVzdHJveSgpIHtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoIHRoaXMucGFyZW50LmNoaWxkcmVuLmluZGV4T2YoIHRoaXMgKSwgMSApO1xuXHRcdFx0dGhpcy5wYXJlbnQuZm9sZGVycy5zcGxpY2UoIHRoaXMucGFyZW50LmZvbGRlcnMuaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmRvbUVsZW1lbnQucGFyZW50RWxlbWVudCApIHtcblx0XHRcdHRoaXMuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50LnJlbW92ZUNoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblx0XHR9XG5cblx0XHRBcnJheS5mcm9tKCB0aGlzLmNoaWxkcmVuICkuZm9yRWFjaCggYyA9PiBjLmRlc3Ryb3koKSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBjb250cm9sbGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkgYW5kIGl0cyBkZXNjZW5kZW50cy5cblx0ICogQHJldHVybnMge0NvbnRyb2xsZXJbXX1cblx0ICovXG5cdGNvbnRyb2xsZXJzUmVjdXJzaXZlKCkge1xuXHRcdGxldCBjb250cm9sbGVycyA9IEFycmF5LmZyb20oIHRoaXMuY29udHJvbGxlcnMgKTtcblx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cdFx0XHRjb250cm9sbGVycyA9IGNvbnRyb2xsZXJzLmNvbmNhdCggZi5jb250cm9sbGVyc1JlY3Vyc2l2ZSgpICk7XG5cdFx0fSApO1xuXHRcdHJldHVybiBjb250cm9sbGVycztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGZvbGRlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJIGFuZCBpdHMgZGVzY2VuZGVudHMuXG5cdCAqIEByZXR1cm5zIHtHVUlbXX1cblx0ICovXG5cdGZvbGRlcnNSZWN1cnNpdmUoKSB7XG5cdFx0bGV0IGZvbGRlcnMgPSBBcnJheS5mcm9tKCB0aGlzLmZvbGRlcnMgKTtcblx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cdFx0XHRmb2xkZXJzID0gZm9sZGVycy5jb25jYXQoIGYuZm9sZGVyc1JlY3Vyc2l2ZSgpICk7XG5cdFx0fSApO1xuXHRcdHJldHVybiBmb2xkZXJzO1xuXHR9XG5cbn1cblxuZXhwb3J0IHsgQm9vbGVhbkNvbnRyb2xsZXIsIENvbG9yQ29udHJvbGxlciwgQ29udHJvbGxlciwgRnVuY3Rpb25Db250cm9sbGVyLCBHVUksIE51bWJlckNvbnRyb2xsZXIsIE9wdGlvbkNvbnRyb2xsZXIsIFN0cmluZ0NvbnRyb2xsZXIsIEdVSSBhcyBkZWZhdWx0IH07XG4iLCJpbXBvcnQgdHlwZSB7IEFjdGluU3RhdHMgfSBmcm9tIFwiLi90ZWxlbWV0cnktYW5hbHlzaXNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGNsYXNzaWZ5Q2hlY2twb2ludChzOiBBY3RpblN0YXRzLCBmaXhlZEFyZWE6IGJvb2xlYW4pOiBcInZhbGlkXCIgfCBcImNvbnRhY3RzXCIgfCBcImZhdGFsXCIge1xuICBjb25zdCBmaW5pdGUgPSBbXG4gICAgcy5jZWxsLmFyZWEsXG4gICAgcy5jZWxsLmNlbnRyb2lkWCxcbiAgICBzLmNlbGwuY2VudHJvaWRZLFxuICAgIHMuY2VsbC5sZWZ0LFxuICAgIHMuY2VsbC5yaWdodCxcbiAgICBzLmNlbGwudG9wLFxuICAgIHMuY2VsbC5ib3R0b20sXG4gICAgcy5hY3RpbkJhbGFuY2VFcnJvcixcbiAgICBzLmluc2lkZVBvbHltZXJCZWFkcyxcbiAgICBzLmluUG9seW1lcixcbiAgICBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICBzLmJyb2tlbkxpbmtzLFxuICAgIHMuY3ljbGVzLFxuICBdLmV2ZXJ5KE51bWJlci5pc0Zpbml0ZSk7XG4gIGlmIChcbiAgICAhZmluaXRlIHx8XG4gICAgcy5jZWxsLmFyZWEgPD0gMCB8fFxuICAgIHMuYWN0aW5CYWxhbmNlRXJyb3IgIT09IDAgfHxcbiAgICBzLmJyb2tlbkxpbmtzICE9PSAwIHx8XG4gICAgcy5jeWNsZXMgIT09IDAgfHxcbiAgICBzLmluc2lkZVBvbHltZXJCZWFkcyAhPT0gcy5pblBvbHltZXIgfHxcbiAgICAoZml4ZWRBcmVhICYmIE1hdGguYWJzKHMuY2VsbC5hcmVhIC0gMSkgPiAwLjAwMSlcbiAgKVxuICAgIHJldHVybiBcImZhdGFsXCI7XG4gIGlmIChzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyA9PT0gMCkgcmV0dXJuIFwidmFsaWRcIjtcbiAgcmV0dXJuIE51bWJlci5pc0ludGVnZXIocy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMpICYmIHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzID4gMCAmJiBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyA8PSA4ID8gXCJjb250YWN0c1wiIDogXCJmYXRhbFwiO1xufVxuXG50eXBlIERlcGVuZGVuY2llcyA9IHtcbiAgaW5zcGVjdDogKCkgPT4gUHJvbWlzZTxBY3RpblN0YXRzPjtcbiAgYmVnaW46ICgpID0+IFByb21pc2U8dm9pZD47XG4gIHJlcGFpcjogKGl0ZXJhdGlvbnM6IG51bWJlcikgPT4gUHJvbWlzZTxudW1iZXI+O1xuICByb2xsYmFjazogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgZGlzcG9zZTogKCkgPT4gdm9pZDtcbiAgZml4ZWRBcmVhOiAoKSA9PiBib29sZWFuO1xuICBtYXhEaXNwbGFjZW1lbnQ6ICgpID0+IG51bWJlcjtcbiAgbm93OiAoKSA9PiBudW1iZXI7XG4gIG5vdGljZTogKG1lc3NhZ2U6IHN0cmluZykgPT4gdm9pZDtcbiAgZmFpbDogKGVycm9yOiB1bmtub3duKSA9PiB2b2lkO1xufTtcbmV4cG9ydCB0eXBlIFJlY292ZXJ5UmVjb3JkID0ge1xuICB0cmlnZ2VyU3RlcDogbnVtYmVyO1xuICBjdXJyZW50U3RlcD86IG51bWJlcjtcbiAgaW5pdGlhbENyb3NzaW5nczogbnVtYmVyO1xuICBwYXNzZXM6IG51bWJlcjtcbiAgb3V0Y29tZTogXCJjaGVja2luZ1wiIHwgXCJmcmVzaC1zdGF0ZS1jbGVhblwiIHwgXCJjb3JyZWN0ZWRcIiB8IFwiZmFpbGVkXCI7XG4gIG1heERpc3BsYWNlbWVudDogbnVtYmVyO1xuICBlbGFwc2VkTXM/OiBudW1iZXI7XG4gIGVycm9yPzogc3RyaW5nO1xufTtcblxuLy8gQ2FsbGVkIHN5bmNocm9ub3VzbHkgZnJvbSB0aGUgYXN5bmNocm9ub3VzIGRpYWdub3N0aWMgY2FsbGJhY2ssIGJ1dCBuZXZlclxuLy8gYXdhaXRlZCBieSB0aGF0IGNhbGxiYWNrLiBUaGUgYWN0aXZlIGZsYWcgZnJlZXplcyBuZXcgcGh5c2ljcyBzdWJtaXNzaW9ucy5cbmV4cG9ydCBjbGFzcyBDb250YWN0UmVjb3Zlcnkge1xuICBhY3RpdmUgPSBmYWxzZTtcbiAgcmVhZG9ubHkgaGlzdG9yeTogUmVjb3ZlcnlSZWNvcmRbXSA9IFtdO1xuICBwcml2YXRlIHBlbmRpbmc6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWNlbnQ6IG51bWJlcltdID0gW107XG4gIHByaXZhdGUgZGVwczogRGVwZW5kZW5jaWVzO1xuICBjb25zdHJ1Y3RvcihkZXBzOiBEZXBlbmRlbmNpZXMpIHtcbiAgICB0aGlzLmRlcHMgPSBkZXBzO1xuICB9XG4gIHdhaXQoKSB7XG4gICAgcmV0dXJuIHRoaXMucGVuZGluZyA/PyBQcm9taXNlLnJlc29sdmUoKTtcbiAgfVxuICByZXF1ZXN0KHRyaWdnZXI6IEFjdGluU3RhdHMpIHtcbiAgICBpZiAodGhpcy5hY3RpdmUpIHJldHVybiB0aGlzLndhaXQoKTtcbiAgICB0aGlzLmFjdGl2ZSA9IHRydWU7XG4gICAgY29uc3QgZCA9IHRoaXMuZGVwcyxcbiAgICAgIHN0YXJ0ZWQgPSBkLm5vdygpO1xuICAgIGNvbnN0IHJlY29yZDogUmVjb3ZlcnlSZWNvcmQgPSB7XG4gICAgICB0cmlnZ2VyU3RlcDogdHJpZ2dlci5zdGVwLFxuICAgICAgaW5pdGlhbENyb3NzaW5nczogdHJpZ2dlci5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMsXG4gICAgICBwYXNzZXM6IDAsXG4gICAgICBvdXRjb21lOiBcImNoZWNraW5nXCIsXG4gICAgICBtYXhEaXNwbGFjZW1lbnQ6IDAsXG4gICAgfTtcbiAgICB0aGlzLmhpc3RvcnkucHVzaChyZWNvcmQpO1xuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID4gMzIpIHRoaXMuaGlzdG9yeS5zaGlmdCgpO1xuICAgIGxldCBiYWNrZWRVcCA9IGZhbHNlO1xuICAgIGNvbnN0IGNoZWNrQnVkZ2V0ID0gKCkgPT4ge1xuICAgICAgaWYgKGQubm93KCkgLSBzdGFydGVkID4gNTAwMCkgdGhyb3cgRXJyb3IoXCJDb250YWN0IHJlY292ZXJ5IGV4Y2VlZGVkIGl0cyB0aW1lIGJ1ZGdldFwiKTtcbiAgICB9O1xuICAgIGNvbnN0IHJ1biA9IGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMucmVjZW50ID0gdGhpcy5yZWNlbnQuZmlsdGVyKChzdGVwKSA9PiB0cmlnZ2VyLnN0ZXAgLSBzdGVwIDwgMTAwMCk7XG4gICAgICAgIGlmICh0aGlzLnJlY2VudC5sZW5ndGggPj0gMykgdGhyb3cgRXJyb3IoXCJSZXBlYXRlZCBjb250YWN0IGZhaWx1cmVzOiByZWNvdmVyeSBidWRnZXQgZXhoYXVzdGVkXCIpO1xuICAgICAgICB0aGlzLnJlY2VudC5wdXNoKHRyaWdnZXIuc3RlcCk7XG4gICAgICAgIGQubm90aWNlKGBSZWNoZWNraW5nICR7dHJpZ2dlci5jcm9zc2luZ0ZpbGFtZW50Qm9uZHN9IGNvbnRhY3QgY3Jvc3NpbmcocynigKZgKTtcbiAgICAgICAgbGV0IHN0YXRlID0gYXdhaXQgZC5pbnNwZWN0KCk7XG4gICAgICAgIGNoZWNrQnVkZ2V0KCk7XG4gICAgICAgIHJlY29yZC5jdXJyZW50U3RlcCA9IHN0YXRlLnN0ZXA7XG4gICAgICAgIGxldCBraW5kID0gY2xhc3NpZnlDaGVja3BvaW50KHN0YXRlLCBkLmZpeGVkQXJlYSgpKTtcbiAgICAgICAgaWYgKGtpbmQgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgIHJlY29yZC5vdXRjb21lID0gXCJmcmVzaC1zdGF0ZS1jbGVhblwiO1xuICAgICAgICAgIGQubm90aWNlKFwiQ3VycmVudCBzdGF0ZSB2ZXJpZmllZDsgY29udGludWluZy5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChraW5kICE9PSBcImNvbnRhY3RzXCIpIHRocm93IEVycm9yKFwiQ3VycmVudCBzdGF0ZSBoYXMgYSBub24tcmVjb3ZlcmFibGUgaW52YXJpYW50IGZhaWx1cmVcIik7XG4gICAgICAgIGF3YWl0IGQuYmVnaW4oKTtcbiAgICAgICAgYmFja2VkVXAgPSB0cnVlO1xuICAgICAgICBmb3IgKGNvbnN0IGl0ZXJhdGlvbnMgb2YgWzQsIDgsIDE2LCAzMl0pIHtcbiAgICAgICAgICBjaGVja0J1ZGdldCgpO1xuICAgICAgICAgIGQubm90aWNlKGBDb3JyZWN0aW5nIGNvbnRhY3QgcmVzaWR1YWxzICgke3JlY29yZC5wYXNzZXMgKyBpdGVyYXRpb25zfSBleHRyYSBwYXNzZXMp4oCmYCk7XG4gICAgICAgICAgcmVjb3JkLm1heERpc3BsYWNlbWVudCA9IGF3YWl0IGQucmVwYWlyKGl0ZXJhdGlvbnMpO1xuICAgICAgICAgIHJlY29yZC5wYXNzZXMgKz0gaXRlcmF0aW9ucztcbiAgICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShyZWNvcmQubWF4RGlzcGxhY2VtZW50KSB8fCByZWNvcmQubWF4RGlzcGxhY2VtZW50ID4gZC5tYXhEaXNwbGFjZW1lbnQoKSlcbiAgICAgICAgICAgIHRocm93IEVycm9yKFwiQ29udGFjdCBjb3JyZWN0aW9uIGV4Y2VlZGVkIGl0cyBkaXNwbGFjZW1lbnQgYnVkZ2V0XCIpO1xuICAgICAgICAgIHN0YXRlID0gYXdhaXQgZC5pbnNwZWN0KCk7XG4gICAgICAgICAgY2hlY2tCdWRnZXQoKTtcbiAgICAgICAgICBpZiAoc3RhdGUuc3RlcCAhPT0gcmVjb3JkLmN1cnJlbnRTdGVwKSB0aHJvdyBFcnJvcihcIlBoeXNpY3MgYWR2YW5jZWQgZHVyaW5nIGNvbnRhY3QgcmVjb3ZlcnlcIik7XG4gICAgICAgICAga2luZCA9IGNsYXNzaWZ5Q2hlY2twb2ludChzdGF0ZSwgZC5maXhlZEFyZWEoKSk7XG4gICAgICAgICAgaWYgKGtpbmQgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgICAgcmVjb3JkLm91dGNvbWUgPSBcImNvcnJlY3RlZFwiO1xuICAgICAgICAgICAgZC5ub3RpY2UoYENvbnRhY3RzIGNvcnJlY3RlZCBhbmQgdmVyaWZpZWQgKCR7cmVjb3JkLnBhc3Nlc30gcGFzc2VzKS5gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGtpbmQgIT09IFwiY29udGFjdHNcIikgdGhyb3cgRXJyb3IoXCJDb250YWN0IGNvcnJlY3Rpb24gY2hhbmdlZCBhbm90aGVyIGludmFyaWFudFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBFcnJvcihcIkNvbnRhY3QgY29ycmVjdGlvbiBkaWQgbm90IGNvbnZlcmdlIHdpdGhpbiA2MCBleHRyYSBwYXNzZXNcIik7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWNvcmQub3V0Y29tZSA9IFwiZmFpbGVkXCI7XG4gICAgICAgIHJlY29yZC5lcnJvciA9IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGlmIChiYWNrZWRVcCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBkLnJvbGxiYWNrKCk7XG4gICAgICAgICAgfSBjYXRjaCAocm9sbGJhY2tFcnJvcikge1xuICAgICAgICAgICAgcmVjb3JkLmVycm9yICs9IGA7IHJvbGxiYWNrIGZhaWxlZDogJHtTdHJpbmcocm9sbGJhY2tFcnJvcil9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZC5mYWlsKG5ldyBFcnJvcihyZWNvcmQuZXJyb3IpKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGQuZGlzcG9zZSgpO1xuICAgICAgICByZWNvcmQuZWxhcHNlZE1zID0gZC5ub3coKSAtIHN0YXJ0ZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnBlbmRpbmcgPSBydW4oKTtcbiAgICByZXR1cm4gdGhpcy5wZW5kaW5nO1xuICB9XG59XG4iLCJpbXBvcnQgeyBwb2x5Z29uT2NjdXBhbmN5LCBwb2x5Z29uQm9uZENyb3NzaW5nIH0gZnJvbSBcIi4vb2NjdXBhbmN5XCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0ZXN0RW5jbG9zdXJlKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYnVmZmVyczogeyBhY3RpbjogR1BVQnVmZmVyOyBtZW1icmFuZTogR1BVQnVmZmVyIH0sXG4gIGNvdW50czogeyBhY3RpbjogbnVtYmVyOyBtZW1icmFuZTogbnVtYmVyIH0sXG4gIGRpc3BhdGNoOiAoKSA9PiB2b2lkLFxuICBjb25maWd1cmU6IChmaXhlZEFyZWE6IGJvb2xlYW4sIHJlZmVyZW5jZUFyZWE6IG51bWJlcikgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IGNoZWNrczogeyBuYW1lOiBzdHJpbmc7IHBhc3NlZDogYm9vbGVhbiB9W10gPSBbXTtcbiAgY29uc3QgYXNzZXJ0ID0gKG5hbWU6IHN0cmluZywgY29uZGl0aW9uOiBib29sZWFuKSA9PiB7XG4gICAgY2hlY2tzLnB1c2goeyBuYW1lLCBwYXNzZWQ6IGNvbmRpdGlvbiB9KTtcbiAgICBpZiAoIWNvbmRpdGlvbikgdGhyb3cgbmV3IEVycm9yKGBFbmNsb3N1cmUgZml4dHVyZSBmYWlsZWQ6ICR7bmFtZX1gKTtcbiAgfTtcbiAgY29uc3QgcmVhZCA9IGFzeW5jIChidWZmZXI6IEdQVUJ1ZmZlcikgPT4ge1xuICAgIGNvbnN0IHN0YWdlID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IGJ1ZmZlci5zaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCAwLCBzdGFnZSwgMCwgYnVmZmVyLnNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBzdGFnZS5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IGRhdGEgPSBzdGFnZS5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApO1xuICAgIHN0YWdlLnVubWFwKCk7XG4gICAgc3RhZ2UuZGVzdHJveSgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuICBjb25zdCBydW4gPSBhc3luYyAocG9seWdvbjogbnVtYmVyW11bXSwgcG9pbnRzOiBudW1iZXJbXVtdLCBmaXhlZEFyZWEgPSBmYWxzZSwgcmVmZXJlbmNlQXJlYSA9IDQwMCkgPT4ge1xuICAgIGNvbnN0IG1lbSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLnNpemUpLFxuICAgICAgbWYgPSBuZXcgRmxvYXQzMkFycmF5KG1lbSksXG4gICAgICBtdSA9IG5ldyBVaW50MzJBcnJheShtZW0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLm1lbWJyYW5lOyBpKyspIHtcbiAgICAgIC8vIERlbnNlIGhvcml6b250YWwgZWRnZXMgYWxzbyBvdmVyZmxvdyB0aGUgc2hvcnRsaXN0cywgZXhlcmNpc2luZyB0aGVpclxuICAgICAgLy8gY29tcGxldGUtcG9seWdvbiBmYWxsYmFjayByYXRoZXIgdGhhbiBvbmx5IHNwYXJzZSBoYXBweS1wYXRoIGJpbnMuXG4gICAgICBjb25zdCBhdCA9IChpICogcG9seWdvbi5sZW5ndGgpIC8gY291bnRzLm1lbWJyYW5lO1xuICAgICAgY29uc3QgZWRnZSA9IE1hdGguZmxvb3IoYXQpO1xuICAgICAgY29uc3QgYSA9IHBvbHlnb25bZWRnZV0sXG4gICAgICAgIGIgPSBwb2x5Z29uWyhlZGdlICsgMSkgJSBwb2x5Z29uLmxlbmd0aF07XG4gICAgICBjb25zdCBwID0gW2FbMF0gKyAoYlswXSAtIGFbMF0pICogKGF0IC0gZWRnZSksIGFbMV0gKyAoYlsxXSAtIGFbMV0pICogKGF0IC0gZWRnZSldO1xuICAgICAgbXVbaSAqIDEwXSA9IGk7XG4gICAgICBtdVtpICogMTAgKyA2XSA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtZltpICogMTAgKyAyXSA9IHBbMF07XG4gICAgICBtZltpICogMTAgKyAzXSA9IHBbMV07XG4gICAgfVxuICAgIGNvbnN0IGFjdGluID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMuYWN0aW4uc2l6ZSksXG4gICAgICBhZiA9IG5ldyBGbG9hdDMyQXJyYXkoYWN0aW4pLFxuICAgICAgYXUgPSBuZXcgVWludDMyQXJyYXkoYWN0aW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHtcbiAgICAgIGF1W2kgKiAxMF0gPSBhdVtpICogMTAgKyA2XSA9IGF1W2kgKiAxMCArIDddID0gaTtcbiAgICB9XG4gICAgcG9pbnRzLmZvckVhY2goKFt4LCB5XSwgaSkgPT4ge1xuICAgICAgYWZbaSAqIDEwICsgMl0gPSB4O1xuICAgICAgYWZbaSAqIDEwICsgM10gPSB5O1xuICAgICAgYXVbaSAqIDEwICsgNl0gPSBpID09PSAwID8gMCA6IGkgLSAxO1xuICAgICAgYXVbaSAqIDEwICsgN10gPSBpID09PSBwb2ludHMubGVuZ3RoIC0gMSA/IGkgOiBpICsgMTtcbiAgICB9KTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgbWVtKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5hY3RpbiwgMCwgYWN0aW4pO1xuICAgIGNvbmZpZ3VyZShmaXhlZEFyZWEsIHJlZmVyZW5jZUFyZWEpO1xuICAgIGRpc3BhdGNoKCk7XG4gICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICByZXR1cm4geyBhY3RpbjogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKSwgbWVtYnJhbmU6IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLm1lbWJyYW5lKSkgfTtcbiAgfTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1bihcbiAgICBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbMjAsIDBdLFxuICAgICAgWzIwLCAyMF0sXG4gICAgICBbMCwgMjBdLFxuICAgIF0sXG4gICAgW1xuICAgICAgWzI1LCAxXSxcbiAgICAgIFsyNiwgMV0sXG4gICAgXVxuICApO1xuICBsZXQgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShyZXN1bHQubWVtYnJhbmUsIDEwLCB0cnVlKTtcbiAgYXNzZXJ0KFwiZXNjYXBlZCBmaWxhbWVudCBiZWFkcyBhcmUgcHJvamVjdGVkIGluc2lkZVwiLCBpbnNpZGUocmVzdWx0LmFjdGluWzJdLCByZXN1bHQuYWN0aW5bM10pICYmIGluc2lkZShyZXN1bHQuYWN0aW5bMTJdLCByZXN1bHQuYWN0aW5bMTNdKSk7XG4gIGxldCB3b3JkcyA9IG5ldyBVaW50MzJBcnJheShyZXN1bHQuYWN0aW4uYnVmZmVyKTtcbiAgYXNzZXJ0KFxuICAgIFwiY29udGFjdCBwcmVzZXJ2ZXMgY29ubmVjdGl2aXR5IGFuZCBmaW5pdGUgcmVzZXJ2b2lyIGFtb3VudFwiLFxuICAgIHdvcmRzWzddID09PSAxICYmXG4gICAgICB3b3Jkc1sxNl0gPT09IDAgJiZcbiAgICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50cy5hY3RpbiAtIDIgfSwgKF8sIGspID0+IGsgKyAyKS5ldmVyeSgoaSkgPT4gd29yZHNbaSAqIDEwICsgNl0gPT09IGkgJiYgd29yZHNbaSAqIDEwICsgN10gPT09IGkpXG4gICk7XG4gIHJlc3VsdCA9IGF3YWl0IHJ1bihcbiAgICBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbOCwgMF0sXG4gICAgICBbOCwgM10sXG4gICAgICBbMywgM10sXG4gICAgICBbMywgOF0sXG4gICAgICBbMCwgOF0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbNywgMV0sXG4gICAgICBbMSwgN10sXG4gICAgXVxuICApO1xuICBpbnNpZGUgPSBwb2x5Z29uT2NjdXBhbmN5KHJlc3VsdC5tZW1icmFuZSwgMTAsIHRydWUpO1xuICBjb25zdCBjcm9zc2luZyA9IHBvbHlnb25Cb25kQ3Jvc3NpbmcocmVzdWx0Lm1lbWJyYW5lKTtcbiAgYXNzZXJ0KFxuICAgIFwiaW50ZXJpb3IgZW5kcG9pbnRzIGNhbm5vdCBicmlkZ2UgYWNyb3NzIGEgY29uY2F2ZSBleHRlcmlvclwiLFxuICAgIGluc2lkZShyZXN1bHQuYWN0aW5bMTJdLCByZXN1bHQuYWN0aW5bMTNdKSAmJiAhY3Jvc3NpbmcocmVzdWx0LmFjdGluWzJdLCByZXN1bHQuYWN0aW5bM10sIHJlc3VsdC5hY3RpblsxMl0sIHJlc3VsdC5hY3RpblsxM10pXG4gICk7XG4gIHJlc3VsdCA9IGF3YWl0IHJ1bihcbiAgICBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbMjAsIDBdLFxuICAgICAgWzIwLCAyMF0sXG4gICAgICBbMCwgMjBdLFxuICAgIF0sXG4gICAgW10sXG4gICAgdHJ1ZSxcbiAgICA5MDBcbiAgKTtcbiAgbGV0IGFyZWEyID0gMCxcbiAgICBjeCA9IDAsXG4gICAgY3kgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgY29uc3QgaiA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgY29uc3QgYXggPSByZXN1bHQubWVtYnJhbmVbaSAqIDEwICsgMl0sXG4gICAgICBheSA9IHJlc3VsdC5tZW1icmFuZVtpICogMTAgKyAzXTtcbiAgICBjb25zdCBieCA9IHJlc3VsdC5tZW1icmFuZVtqICogMTAgKyAyXSxcbiAgICAgIGJ5ID0gcmVzdWx0Lm1lbWJyYW5lW2ogKiAxMCArIDNdO1xuICAgIGNvbnN0IGNyb3NzID0gYXggKiBieSAtIGF5ICogYng7XG4gICAgYXJlYTIgKz0gY3Jvc3M7XG4gICAgY3ggKz0gKGF4ICsgYngpICogY3Jvc3M7XG4gICAgY3kgKz0gKGF5ICsgYnkpICogY3Jvc3M7XG4gIH1cbiAgYXNzZXJ0KFwiYXJlYSBjbG9zdXJlIHJlYWNoZXMgdGhlIGRlY2xhcmVkIHJlZmVyZW5jZSBhcmVhXCIsIE1hdGguYWJzKGFyZWEyIC8gMiAtIDkwMCkgPCAwLjAyKTtcbiAgYXNzZXJ0KFwiYXJlYSBjbG9zdXJlIHByZXNlcnZlcyB0aGUgY3VycmVudCBnZW9tZXRyaWMgY2VudHJvaWRcIiwgTWF0aC5hYnMoY3ggLyAoMyAqIGFyZWEyKSAtIDEwKSA8IDAuMDAxICYmIE1hdGguYWJzKGN5IC8gKDMgKiBhcmVhMikgLSAxMCkgPCAwLjAwMSk7XG4gIHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KHJlc3VsdC5hY3Rpbi5idWZmZXIpO1xuICBhc3NlcnQoXG4gICAgXCJnZW9tZXRyeSBjaGFuZ2VzIGRvIG5vdCBtYW51ZmFjdHVyZSBvciBkaXNjYXJkIEctYWN0aW5cIixcbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb3VudHMuYWN0aW4gfSwgKF8sIGkpID0+IGkpLmV2ZXJ5KChpKSA9PiB3b3Jkc1tpICogMTAgKyA2XSA9PT0gaSAmJiB3b3Jkc1tpICogMTAgKyA3XSA9PT0gaSlcbiAgKTtcbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsImltcG9ydCBHVUkgZnJvbSBcImxpbC1ndWlcIjtcbmltcG9ydCB7IHJlcXVlc3REZXZpY2UsIGNvbmZpZ3VyZUNhbnZhcywgY3JlYXRlU2hhZGVyLCBzZXR1cEludGVyYWN0aW9ucywgc2V0dXBUZXh0dXJlcywgZ2V0UmFuZG9tVmFsdWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCByZW5kZXJDb2RlIGZyb20gXCIuL3NoYWRlcnMvcmVuZGVyLndnc2xcIjtcbmltcG9ydCBzaW11bGF0ZUNvZGUgZnJvbSBcIi4vc2hhZGVycy9zaW11bGF0ZS53Z3NsXCI7XG5pbXBvcnQgeyBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzLCBydW5TaW11bGF0aW9uU3RlcCwgcnVuRW5jbG9zdXJlLCBydW5Db250YWN0UmVwYWlyIH0gZnJvbSBcIi4vc2ltdWxhdGVcIjtcbmltcG9ydCB7IENvbnRhY3RSZWNvdmVyeSwgY2xhc3NpZnlDaGVja3BvaW50IH0gZnJvbSBcIi4vY29udGFjdC1yZWNvdmVyeVwiO1xuXG4vLyBJbXBvcnQgc2hhZGVyIGluY2x1ZGVzXG5pbXBvcnQgYmluZGluZ3NDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYmluZGluZ3Mud2dzbFwiO1xuaW1wb3J0IHRleHR1cmVzQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL3RleHR1cmVzLndnc2xcIjtcbmltcG9ydCBidWZmZXJzQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL2J1ZmZlcnMud2dzbFwiO1xuaW1wb3J0IHJhbmRvbUNvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9yYW5kb20ud2dzbFwiO1xuaW1wb3J0IGFjdG9teW9zaW5Db2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYWN0b215b3Npbi53Z3NsXCI7XG5pbXBvcnQgZW5jbG9zdXJlQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL2VuY2xvc3VyZS53Z3NsXCI7XG5pbXBvcnQgeyBSZW5kZXJNb2R1bGUgfSBmcm9tIFwiLi9yZW5kZXJcIjtcbmltcG9ydCB7IFNwcm91dFNjaGVkdWxlciwgTUFYX1NQUk9VVF9TSVRFUyB9IGZyb20gXCIuL3Nwcm91dHNcIjtcbmltcG9ydCB7IEFjdGluVGVsZW1ldHJ5IH0gZnJvbSBcIi4vdGVsZW1ldHJ5XCI7XG5pbXBvcnQgeyBzZWVkZWRSYW5kb20gfSBmcm9tIFwiLi9yYW5kb21cIjtcbmltcG9ydCB7IHRlc3RNZWNoYW5pY3MgfSBmcm9tIFwiLi9tZWNoYW5pY3MtdGVzdFwiO1xuaW1wb3J0IHsgdGVzdEVuY2xvc3VyZSB9IGZyb20gXCIuL2VuY2xvc3VyZS10ZXN0XCI7XG5pbXBvcnQgeyB0ZXN0UmVuZXdhbCB9IGZyb20gXCIuL3JlbmV3YWwtdGVzdFwiO1xuaW1wb3J0IHsgRnJhbWVCdWRnZXQsIExpdmVQZXJmb3JtYW5jZSB9IGZyb20gXCIuL3JlYWx0aW1lXCI7XG5cbi8vIFNoYWRlciBpbmNsdWRlcyBtYXBwaW5nXG5jb25zdCBzaGFkZXJJbmNsdWRlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgYmluZGluZ3M6IGJpbmRpbmdzQ29kZSxcbiAgdGV4dHVyZXM6IHRleHR1cmVzQ29kZSxcbiAgYnVmZmVyczogYnVmZmVyc0NvZGUsXG4gIHJhbmRvbTogcmFuZG9tQ29kZSxcbiAgYWN0b215b3NpbjogYWN0b215b3NpbkNvZGUsXG4gIGVuY2xvc3VyZTogZW5jbG9zdXJlQ29kZSxcbn07XG5cbi8vIFNpemVzIGluIGJ5dGVzIC0gdXNlZnVsIGZvciBjYWxjdWxhdGluZyBidWZmZXIgc2l6ZXMgYW5kIG9mZnNldHNcbmNvbnN0IHNpemUzMiA9IDQ7IC8vIHNpemUgb2YgYSAzMi1iaXQgZmxvYXQgb3IgaW50XG5cbi8vIFVuaWZvcm0gdmFsdWVzIGNvbnRhaW5lclxuY29uc3QgdW5pZm9ybXMgPSB7XG4gIGNvbXB1dGVTdGVwc1BlckZyYW1lOiA0LFxuICB0YXJnZXRGUFM6IDYwLFxuICBzaW11bGF0aW9uU2NhbGU6IDEuMCwgLy8gdGV4dHVyZSBwaXhlbHMgcGVyIHNjcmVlbiAoQ1NTKSBwaXhlbDsgdGhlIGNlbGwgc2NhbGVzIHdpdGggaXQgaW4gcGl4ZWxzLCBzbyBpdCBsb29rcyB0aGUgc2FtZSBzaXplIG9uIHNjcmVlblxuICBhY3RpbkNvdW50OiAxICogMjU2ICogMjU2LCAvLyA0MDAwIGlzIG1pbmltdW0gZm9yIG5pY2UgYWN0aW9uLlxuICBtZW1icmFuZUNvdW50OiA2ICogMjU2LFxuICBzdGlmZm5lc3M6IDAuNSxcbiAgZm9vZE5lYXJieVRocmVzaG9sZDogMC4wMDEsXG4gIGRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eTogMC4wMDYsXG4gIG1vbm9tZXJNZW1icmFuZVJlcHVsc2lvbjogMC4wOSwgLy8gaG93IGhhcmQgbW9ub21lcnMgYXJlIHB1c2hlZCBvZmYgdGhlIG1lbWJyYW5lOiAxLjAgbGVhdmVzIGEgfjggcHggZ2FwLCAwLjEgYWJvdXQgNCBweFxuICBwb2x5bWVyUmVwdWxzaW9uOiAwLjQyMixcbiAgc3RlcmljU2FtcGxpbmdSYW5nZTogMixcbiAgYWN0aW5Db2hlc2lvblJhbmdlOiAxLFxuICBiaW5kUHJvYjogMC4wMyxcbiAgYmluZExlbmd0aEZsb29yOiAyLCAvLyBmaWxhbWVudHMgc2hvcnRlciB0aGFuIHRoaXMgYmluZCBhdCBiaW5kUHJvYiAqIHRoaXMgKGEgbG9uZSBtb25vbWVyIGF0IGJpbmRQcm9iKTsgbG9uZ2VyIG9uZXMgYXQgYmluZFByb2IgKiBsZW5ndGhcbiAgYmluZExlbmd0aFNhdHVyYXRpb246IDIwLCAvLyBmaWxhbWVudHMgbG9uZ2VyIHRoYW4gdGhpcyBiaW5kIG5vIG1vcmUgcmVhZGlseSAobWF4IDY0KVxuICBhY3RpblN0ZXJpY0ZvcmNlOiAwLjIsXG4gIGVxdWlsaWJyaXVtTGluZURpc3RhbmNlOiAyLjAsIC8vIGFjdGluIHJlc3QgbGVuZ3RoIGluIHBpeGVsczsgc2V0cyBmaWxhbWVudCBzcGFjaW5nIG5vdyB0aGF0IGEgZmlsYW1lbnQgZG9lc24ndCByZXBlbCBpdHNlbGZcbiAgbW92ZW1lbnRNb2RlOiAwLCAvLyBJZGxlOiBwb2x5bWVyaXphdGlvbiBvbmx5IGNvbWVzIGZyb20gdGhlIHNwcm91dCBzaXRlc1xuICBtZW1icmFuZVJlc3RMZW5ndGg6IDIuMCAvIDMuMCwgLy8gd2l0aCA2eCB0aGUgb3JpZ2luYWwgMjU2IG5vZGVzIGF0IHJlc3QgbGVuZ3RoIDIgdGhlIGNlbGwgaXMgMnggd2lkZXIgaW4gcGl4ZWxzLCBtYXRjaGluZyBzaW11bGF0aW9uU2NhbGVcbiAgbWVtYnJhbmVTdGlmZm5lc3M6IDMuMCwgLy8gaG93IGhhcmQgYSBzdHJldGNoZWQgbWVtYnJhbmUgcHVsbHMgaW4sIGFsb25nIGl0cyBjdXJ2YXR1cmVcbiAgbGFtZWxsaXBvZGl1bVN0cmVuZ3RoOiAwLjE1LCAvLyBwb2x5bWVyaXphdGlvbiBmaWVsZCBlbWl0dGVkIGJ5IHRoZSBmcm9udCBvZiB0aGUgbWVtYnJhbmUsIHdoZXJlIGZpbGFtZW50cyBhbHNvIGJyYW5jaDsgMCA9IG9mZlxuICBsYW1lbGxpcG9kaXVtV2lkdGg6IDAuMDM2LCAvLyBmcmFjdGlvbiBvZiB0aGUgbWVtYnJhbmUsIGNlbnRlcmVkIG9uIHRoZSBmcm9udCAodGhlIHJpZ2h0IHNpZGUgYXQgcmVzZXQpLCB0aGF0IGVtaXRzIGl0XG4gIGxhbWVsbGlwb2RpdW1GaWVsZERlY2F5OiAwLjk4LCAvLyBwZXItc3RlcCBkZWNheSBvZiB0aGF0IGZpZWxkXG4gIGJyYW5jaFByb2JhYmlsaXR5OiAwLjAxLCAvLyBwZXIgc3RlcCwgZm9yIGEgbW9ub21lciBuZXh0IHRvIGEgZmlsYW1lbnQgaW4gdGhlIGxhbWVsbGlwb2RpdW0gZmllbGQgYXQgc3RyZW5ndGggMVxuICBkZWJyYW5jaFByb2JhYmlsaXR5OiAwLjAwMDUsIC8vIHBlciBzdGVwLCBmb3IgZWFjaCBicmFuY2ggdG8gY29tZSBvZmYgaXRzIG1vdGhlciBmaWxhbWVudFxuICBhY3RpbkJlbmRTdGlmZm5lc3M6IDQuMCwgLy8gaG93IGZhc3QgYW4gYWN0aW4ncyBkaXJlY3RvciB0dXJucyB0b3dhcmQgaXRzIG5laWdoYm91cnMnIChDb3NzZXJhdCBiZW5kaW5nKTsgMCA9IGZsb3BweVxuICBhY3RpbkNvc3NlcmF0SXRlcmF0aW9uczogOCwgLy8gQ29zc2VyYXQgcGFzc2VzIHBlciBzaW11bGF0aW9uIHN0ZXA7IG1vcmUgPSBzdGlmZmVyLCBzdHJhaWdodGVucyBsb25nIGZpbGFtZW50cyBmYXN0ZXJcbiAgc3RlcmljU2VsZk5laWdoYm9yczogNiwgLy8gZmlsYW1lbnQgbmVpZ2hib3VycyBvbiBlYWNoIHNpZGUgdGhhdCBkb24ndCByZXBlbCBhbiBhY3RpbiAobWF4IDEyKTsgdGhlIHJlc3QgbGVuZ3RoIHNwYWNlcyB0aGVtXG4gIG1lbWJyYW5lRmxvdzogMC41LCAvLyBob3cgZmFzdCBtZW1icmFuZSBzbGlkZXMgdG93YXJkIHN0cmV0Y2hlZCByZWdpb25zICh0YW5nZW50aWFsIHNwYWNpbmcgZXF1YWxpemF0aW9uKVxuICBtZW1icmFuZUZsb3dJdGVyYXRpb25zOiA4LCAvLyB0YW5nZW50aWFsIGZsb3cgcGFzc2VzIHBlciBzaW11bGF0aW9uIHN0ZXBcbiAgbWVtYnJhbmVTbW9vdGhpbmc6IDAuMDIsIC8vIHB1bGwgdG93YXJkIHRoZSBuZWlnaGJvdXJzJyBtaWRwb2ludCBwZXIgc3RlcDsgcmVsYXhlcyBpZGxlIHByb3RydXNpb25zIGFuZCBjdXNwc1xuICBwb2x5bWVyaXphdGlvblBhdGNoU2l6ZTogMC4wMiwgLy8gZnJhY3Rpb24gb2YgdGhlIG1lbWJyYW5lIHRoYXQgcG9seW1lcml6ZXMgaW4gTW92ZSBFYXN0IG1vZGVcbiAgcG9seW1lcml6YXRpb25GaWVsZERlY2F5OiAwLjk1LCAvLyBwZXItc3RlcCBkZWNheSBvZiB0aGUgcG9seW1lcml6YXRpb24gZmllbGQ7IGxvd2VyID0gbW9yZSBsb2NhbCA9IHRoaW5uZXIgcHJvdHJ1c2lvbnNcbiAgc3Byb3V0Q291bnQ6IDYsIC8vIG1heCBudW1iZXIgb2Ygc2hvcnQtbGl2ZWQgcG9seW1lcml6YXRpb24gc2l0ZXMgYXQgb25jZVxuICBzcHJvdXRXaWR0aDogMSwgLy8gbWVtYnJhbmUgbm9kZXMgY292ZXJlZCBieSBvbmUgc2l0ZVxuICBzcHJvdXRGcm9udEJpYXM6IDAuNzUsIC8vIGZyYWN0aW9uIG9mIHNpdGVzIHBsYWNlZCBuZWFyIHRoZSBmcm9udCwgdGhlIHJlc3QgYW55d2hlcmUgaW4gdGhlIGZyb250IDMwJVxuICBzcHJvdXRPblN0ZXBzOiA2MDAwLCAvLyBhdmVyYWdlIHNpbXVsYXRpb24gc3RlcHMgYSBzaXRlIHN0YXlzIG9uXG4gIHNwcm91dE9mZlN0ZXBzOiAxNTAwLCAvLyBhdmVyYWdlIHNpbXVsYXRpb24gc3RlcHMgYSBzaXRlIHN0YXlzIG9mZlxuICBteW9zaW5TdHJlbmd0aDogMCwgLy8gb3B0LWluIHVudGlsIG1hdGNoZWQgY29tcGFyaXNvbnMgZXN0YWJsaXNoIGEgYmVuZWZpdFxuICBteW9zaW5TcGVlZDogMC4wMixcbiAgbWVtYnJhbmVDb3VwbGluZzogMCxcbiAgc3Vic3RyYXRlRHJhZzogNCxcbiAgY29ydGV4UG9seW1lcml6YXRpb246IDAsIC8vIGRpc3RpbmN0IG9wdGlvbmFsIGh5cG90aGVzaXM6IGEgcG9zdGVyaW9yIGFjdGluIHN1YnN0cmF0ZVxuICBtb25vbWVyT3BhY2l0eTogMC4yLCAvLyB2aXN1YWwgb25seToga2VlcCB0aGUgZXhwbGljaXQgZmlsYW1lbnRzIGxlZ2libGVcbiAgZ0FjdGluRmllbGQ6IDEsIC8vIGZpbml0ZSB3ZWxsLW1peGVkIHBvb2wgcGx1cyBleHBsaWNpdC1maWxhbWVudCBjb250YWlubWVudFxuICBhcmVhQ29uc2VydmF0aW9uOiAxLCAvLyBpbXBvc2VkIGFyZWEsIGEgMi1EIHZvbHVtZSBzdXJyb2dhdGUsIG5vdCBtZWFzdXJlZCBwcmVzc3VyZVxuICBhZGFwdGl2ZUZyYW1lczogMSxcbiAgY3VlWDogMCxcbiAgY3VlWTogMCxcbiAgY3VlRW5hYmxlZDogMCxcbiAgcG9sYXJpdHlNb2RlOiAwLFxuICBwb2xhcml0eVR1cm5SYXRlOiAwLjAyLFxuICByZWFyVHVybm92ZXI6IDAsXG4gIHR1cm5vdmVyQWdlOiA1MDAsXG4gIHRldGhlclR1cm5vdmVyOiAwLFxuICB0ZXRoZXJPblJhdGU6IDAuMDIsXG4gIHRldGhlck9mZlJhdGU6IDAuMDAyLFxuICB0ZXRoZXJSZWNvdmVyeVN0ZXBzOiA0MCxcbiAgbW90b3JSZWFyQmlhczogMCxcbiAgZnJvbnRBbGlnbm1lbnQ6IDAsXG4gIHRldGhlckxvYWRPZmY6IDAuMDAyLFxuICBjb2xvdXJBZ2U6IDAsXG59O1xuXG4vLyBudW1lcmljIHVuaWZvcm1zIGNhbiBiZSBvdmVycmlkZGVuIGZyb20gdGhlIFVSTCwgZS5nLiA/YmluZFByb2I9MC4wNSZlcXVpbGlicml1bUxpbmVEaXN0YW5jZT0yOyA/cnVuPW5hbWUgbGFiZWxzIHRoZSB0ZWxlbWV0cnlcbmNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5jb25zdCBzaG93Y2FzZSA9IHVybFBhcmFtcy5zaXplID09PSAwIHx8IHVybFBhcmFtcy5nZXQoXCJkZW1vXCIpID09PSBcIjFcIjtcbmlmIChzaG93Y2FzZSlcbiAgT2JqZWN0LmFzc2lnbih1bmlmb3Jtcywge1xuICAgIG1lbWJyYW5lUmVzdExlbmd0aDogMSAvIDMsXG4gICAgbXlvc2luU3RyZW5ndGg6IDAuMDUsXG4gICAgbWVtYnJhbmVDb3VwbGluZzogMC4wNSxcbiAgICBnQWN0aW5GaWVsZDogMSxcbiAgICBhcmVhQ29uc2VydmF0aW9uOiAxLFxuICAgIHBvbGFyaXR5TW9kZTogMSxcbiAgICByZWFyVHVybm92ZXI6IDAuMDEsXG4gICAgdGV0aGVyVHVybm92ZXI6IDEsXG4gICAgbW90b3JSZWFyQmlhczogMSxcbiAgICBmcm9udEFsaWdubWVudDogMC44LFxuICAgIGNvbG91ckFnZTogMSxcbiAgfSk7XG5jb25zdCBzZWVkID0gTnVtYmVyKHVybFBhcmFtcy5nZXQoXCJzZWVkXCIpID8/IDQyKSA+Pj4gMDtcbmNvbnN0IGluaXRpYWxSYW5kb20gPSBzZWVkZWRSYW5kb20oc2VlZCk7XG5mb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB1cmxQYXJhbXMpIHtcbiAgaWYgKGtleSBpbiB1bmlmb3JtcyAmJiBOdW1iZXIuaXNGaW5pdGUoTnVtYmVyKHZhbHVlKSkpIHtcbiAgICAodW5pZm9ybXMgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPilba2V5XSA9IE51bWJlcih2YWx1ZSk7XG4gIH1cbn1cbmZvciAoY29uc3QgW25hbWUsIG1heGltdW1dIG9mIE9iamVjdC5lbnRyaWVzKHtcbiAgbXlvc2luU3RyZW5ndGg6IDAuMixcbiAgbXlvc2luU3BlZWQ6IDAuMSxcbiAgbWVtYnJhbmVDb3VwbGluZzogMC4yLFxuICBzdWJzdHJhdGVEcmFnOiAyMCxcbiAgY29ydGV4UG9seW1lcml6YXRpb246IDAuMSxcbiAgbW9ub21lck9wYWNpdHk6IDEsXG4gIGdBY3RpbkZpZWxkOiAxLFxuICBhcmVhQ29uc2VydmF0aW9uOiAxLFxuICBwb2xhcml0eU1vZGU6IDEsXG4gIHBvbGFyaXR5VHVyblJhdGU6IDAuMixcbiAgcmVhclR1cm5vdmVyOiAwLjIsXG4gIHRldGhlclR1cm5vdmVyOiAxLFxuICB0ZXRoZXJPblJhdGU6IDEsXG4gIHRldGhlck9mZlJhdGU6IDAuMixcbiAgbW90b3JSZWFyQmlhczogMSxcbiAgZnJvbnRBbGlnbm1lbnQ6IDEsXG4gIHRldGhlckxvYWRPZmY6IDAuMSxcbiAgY29sb3VyQWdlOiAxLFxufSkpIHtcbiAgY29uc3QgdmFsdWVzID0gdW5pZm9ybXMgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgdmFsdWVzW25hbWVdID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4aW11bSwgdmFsdWVzW25hbWVdKSk7XG59XG5cbmNvbnN0IERFQlVHTU9ERSA9IGZhbHNlO1xuY29uc3QgZGVidWdTaXplID0gMjAwO1xuY29uc3QgV09SS0dST1VQX1NJWkUgPSAyNTY7XG5cbmFzeW5jIGZ1bmN0aW9uIGluZGV4KCkge1xuICBjb25zdCBpc01vYmlsZURldmljZSA9IC9BbmRyb2lkfGlQaG9uZXxpUGFkfGlQb2R8T3BlcmEgTWluaXxJRU1vYmlsZXxXUERlc2t0b3AvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICBpZiAoaXNNb2JpbGVEZXZpY2UpIHtcbiAgICB1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZSA9IDE7XG4gIH1cblxuICAvLyBzZXR1cCBhbmQgY29uZmlndXJlIFdlYkdQVVxuICBjb25zdCBkZXZpY2UgPSBhd2FpdCByZXF1ZXN0RGV2aWNlKCk7XG4gIC8vIEdldCB0aGUgZXhpc3RpbmcgY2FudmFzIGZyb20gdGhlIERPTSBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG9uZVxuICBjb25zdCBjYW52YXMgPSBjb25maWd1cmVDYW52YXMoZGV2aWNlLCBcIm1haW4tY2FudmFzXCIsIHtcbiAgICB3aWR0aDogTWF0aC5yb3VuZChNYXRoLm1heChzaG93Y2FzZSA/IDEyODAgOiAwLCB3aW5kb3cuaW5uZXJXaWR0aCkgKiB1bmlmb3Jtcy5zaW11bGF0aW9uU2NhbGUpLFxuICAgIGhlaWdodDogTWF0aC5yb3VuZChNYXRoLm1heChzaG93Y2FzZSA/IDk2MCA6IDAsIHdpbmRvdy5pbm5lckhlaWdodCkgKiB1bmlmb3Jtcy5zaW11bGF0aW9uU2NhbGUpLFxuICB9KTtcblxuICBsZXQgdGltZSA9IDA7XG4gIGxldCBwYXVzZWQgPSB1cmxQYXJhbXMuaGFzKFwicGF1c2VkXCIpO1xuICBsZXQgbWFudWFsQWR2YW5jZVBlbmRpbmcgPSBmYWxzZTtcbiAgbGV0IGNvbnRyb2xzRGlydHkgPSBmYWxzZTtcbiAgbGV0IGN1ZVZlcnNpb24gPSAwO1xuICBjb25zdCBmcmFtZUJ1ZGdldCA9IG5ldyBGcmFtZUJ1ZGdldCgpO1xuICBjb25zdCBsaXZlUGVyZm9ybWFuY2UgPSBuZXcgTGl2ZVBlcmZvcm1hbmNlKCk7XG4gIGNvbnN0IHJ1bnRpbWVFcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIGZ1bmN0aW9uIHNldFBhdXNlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHBhdXNlZCA9IHZhbHVlO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGF1c2UtZGVtb1wiKSEudGV4dENvbnRlbnQgPSBwYXVzZWQgPyBcIlJlc3VtZVwiIDogXCJQYXVzZVwiO1xuICAgIGlmICghdmFsdWUpIGxpdmVQZXJmb3JtYW5jZS5jbGVhckZyYW1lcygpO1xuICB9XG4gIGZ1bmN0aW9uIHN0b3BTaW11bGF0aW9uKGVycm9yOiB1bmtub3duKSB7XG4gICAgY29uc3QgdGV4dCA9IFN0cmluZyhlcnJvcik7XG4gICAgaWYgKCFydW50aW1lRXJyb3JzLmluY2x1ZGVzKHRleHQpKSBydW50aW1lRXJyb3JzLnB1c2godGV4dCk7XG4gICAgc2V0UGF1c2VkKHRydWUpO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gYFN0b3BwZWQ6ICR7dGV4dH1gO1xuICAgIGNvbnN0IG5vdGljZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVtby1ub3RpY2VcIikhO1xuICAgIG5vdGljZS5oaWRkZW4gPSBmYWxzZTtcbiAgICBub3RpY2UudGV4dENvbnRlbnQgPSBgU2ltdWxhdGlvbiBwYXVzZWQ6ICR7dGV4dH1gO1xuICB9XG4gIGNvbnN0IGdwdUVycm9yczogc3RyaW5nW10gPSBbXTtcbiAgZGV2aWNlLmFkZEV2ZW50TGlzdGVuZXIoXCJ1bmNhcHR1cmVkZXJyb3JcIiwgKGV2ZW50KSA9PiB7XG4gICAgZ3B1RXJyb3JzLnB1c2goZXZlbnQuZXJyb3IubWVzc2FnZSk7XG4gICAgc3RvcFNpbXVsYXRpb24oYEdQVSBlcnJvcjogJHtldmVudC5lcnJvci5tZXNzYWdlfWApO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gYEdQVSBlcnJvcjogJHtldmVudC5lcnJvci5tZXNzYWdlfWA7XG4gIH0pO1xuICBkZXZpY2UubG9zdC50aGVuKChpbmZvKSA9PiBncHVFcnJvcnMucHVzaChgRGV2aWNlIGxvc3Q6ICR7aW5mby5tZXNzYWdlfWApKTtcblxuICBjb25zdCBHUk9VUF9JTkRFWCA9IDA7XG4gIGNvbnN0IEJJTkRJTkdTX0JVRkZFUiA9IHsgQ0FOVkFTOiAwLCBDT05UUk9MUzogMSwgSU5URVJBQ1RJT05TOiAyIH07XG4gIGNvbnN0IEJJTkRJTkdTX1RFWFRVUkUgPSB7XG4gICAgSU5ERVg6IDMsXG4gICAgU1RFUklDX1BPVEVOVElBTDogNCxcbiAgICBQQVJBTUVURVJfRklFTERTOiA1LFxuICB9O1xuXG4gIGNvbnN0IEJJTkRJTkdTX0FHRU5UUyA9IHtcbiAgICBSQU5ET006IDYsXG4gICAgTUVNQlJBTkU6IDcsXG4gICAgQUNUSU46IDgsXG4gICAgQ09OTkVDVElPTl9MT0NLUzogOSxcbiAgICBURUxFTUVUUlk6IDEyLFxuICAgIE1FQ0hBTklDQUxfU05BUFNIT1Q6IDEzLFxuICAgIE1FQ0hBTklDQUxfTElOS1M6IDE0LFxuICAgIE1FQ0hBTklDQUxfRk9SQ0VTOiAxNSxcbiAgfTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU2V0IHVwIG1lbW9yeSByZXNvdXJjZXNcbiAgdmFyIGFjdHVhbFdpZHRoID0gY2FudmFzLnNpemUud2lkdGg7XG4gIHZhciBhY3R1YWxIZWlnaHQgPSBjYW52YXMuc2l6ZS5oZWlnaHQ7XG4gIGlmIChERUJVR01PREUpIHtcbiAgICBhY3R1YWxXaWR0aCA9IGRlYnVnU2l6ZTtcbiAgICBhY3R1YWxIZWlnaHQgPSBkZWJ1Z1NpemU7XG4gIH1cblxuICBjb25zdCB0ZXh0dXJlcyA9IHNldHVwVGV4dHVyZXMoXG4gICAgZGV2aWNlLFxuICAgIE9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSksXG4gICAge30sXG4gICAge1xuICAgICAgZGVwdGhPckFycmF5TGF5ZXJzOiB7XG4gICAgICAgIFtCSU5ESU5HU19URVhUVVJFLlNURVJJQ19QT1RFTlRJQUxdOiAzLFxuICAgICAgICBbQklORElOR1NfVEVYVFVSRS5QQVJBTUVURVJfRklFTERTXTogNixcbiAgICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuSU5ERVhdOiA0LFxuICAgICAgfSxcbiAgICAgIHdpZHRoOiBhY3R1YWxXaWR0aCxcbiAgICAgIGhlaWdodDogYWN0dWFsSGVpZ2h0LFxuICAgIH0sXG4gICAge1xuICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuU1RFUklDX1BPVEVOVElBTF06IFwicjMyZmxvYXRcIixcbiAgICAgIFtCSU5ESU5HU19URVhUVVJFLlBBUkFNRVRFUl9GSUVMRFNdOiBcInIzMmZsb2F0XCIsXG4gICAgICBbQklORElOR1NfVEVYVFVSRS5JTkRFWF06IFwicjMydWludFwiLFxuICAgIH1cbiAgKTtcblxuICBjb25zdCBURVhUVVJFX1dPUktHUk9VUF9DT1VOVDogW251bWJlciwgbnVtYmVyXSA9IFtcbiAgICBNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS53aWR0aCAvIE1hdGguc3FydChXT1JLR1JPVVBfU0laRSkpLFxuICAgIE1hdGguY2VpbCh0ZXh0dXJlcy5zaXplLmhlaWdodCAvIE1hdGguc3FydChXT1JLR1JPVVBfU0laRSkpLFxuICBdO1xuXG4gIGNvbnN0IEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQgPSB7XG4gICAgQUNUSU46IE1hdGguY2VpbCh1bmlmb3Jtcy5hY3RpbkNvdW50IC8gV09SS0dST1VQX1NJWkUpLFxuICAgIE1FTUJSQU5FOiBNYXRoLmNlaWwodW5pZm9ybXMubWVtYnJhbmVDb3VudCAvIFdPUktHUk9VUF9TSVpFKSxcbiAgfTtcbiAgY29uc3QgTUFYX0JVRkZFUl9XT1JLR1JPVVBfQ09VTlQgPSBNYXRoLm1heCguLi5PYmplY3QudmFsdWVzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQpKTtcblxuICAvLyBzZXR1cCBpbnRlcmFjdGlvbnNcbiAgY29uc3QgaW50ZXJhY3Rpb25zID0gc2V0dXBJbnRlcmFjdGlvbnMoZGV2aWNlLCBjYW52YXMuY29udGV4dC5jYW52YXMsIHRleHR1cmVzLnNpemUpO1xuICBjb25zdCBjYW52YXNfYnVmZmVycyA9IHtcbiAgICBbQklORElOR1NfQlVGRkVSLkNBTlZBU106IHRleHR1cmVzLmNhbnZhcy5idWZmZXIsXG4gICAgW0JJTkRJTkdTX0JVRkZFUi5DT05UUk9MU106IGludGVyYWN0aW9ucy5jb250cm9scy5idWZmZXIsXG4gICAgW0JJTkRJTkdTX0JVRkZFUi5JTlRFUkFDVElPTlNdOiBpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmJ1ZmZlcixcbiAgfTtcblxuICAvLyBGdW5jdGlvbiB0byB3cml0ZSB0aGUgdW5pZm9ybXMgb2JqZWN0IGludG8gdGhlIEFycmF5QnVmZmVyIGFjY29yZGluZyB0byBXR1NMIHN0cnVjdCBsYXlvdXRcbiAgY29uc3QgY29udHJvbHNEYXRhVmlldyA9IG5ldyBEYXRhVmlldyhpbnRlcmFjdGlvbnMuY29udHJvbHMuZGF0YSk7XG4gIGNvbnN0IGNhbnZhc1ZpZXcgPSBuZXcgRGF0YVZpZXcodGV4dHVyZXMuY2FudmFzLmRhdGEuYnVmZmVyKTtcblxuICBjb25zdCB3cml0ZVVuaWZvcm1zID0gKCkgPT4ge1xuICAgIC8vIFdyaXRlIGNhbnZhcyBzaXplXG4gICAgY2FudmFzVmlldy5zZXRJbnQzMigwLCBhY3R1YWxXaWR0aCwgdHJ1ZSk7XG4gICAgY2FudmFzVmlldy5zZXRJbnQzMig0LCBhY3R1YWxIZWlnaHQsIHRydWUpO1xuXG4gICAgLy8gQ2FudmFzLmtleSBpcyB2ZWMyPHUzMj4sIGFsaWduZWQgdG8gYnl0ZSAxNi4gVUkgY2hhbmdlcyBkbyBub3QgcmVzZWVkLlxuICAgIGNhbnZhc1ZpZXcuc2V0VWludDMyKDE2LCBzZWVkLCB0cnVlKTtcbiAgICBjYW52YXNWaWV3LnNldFVpbnQzMigyMCwgc2VlZCBeIDB4OWUzNzc5YjksIHRydWUpO1xuXG4gICAgLy8gV3JpdGUgY29udHJvbHMgd2l0aCBhZGp1c3RlZCBvZmZzZXRzOlxuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDAsIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDQsIHVuaWZvcm1zLmFjdGluQ291bnQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig4LCB1bmlmb3Jtcy5zdGlmZm5lc3MsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigxMiwgdW5pZm9ybXMuZm9vZE5lYXJieVRocmVzaG9sZCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDE2LCB1bmlmb3Jtcy5kaXNjb25uZWN0aW9uUHJvYmFiaWxpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMCwgdW5pZm9ybXMucG9seW1lclJlcHVsc2lvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRJbnQzMigyNCwgdW5pZm9ybXMuc3RlcmljU2FtcGxpbmdSYW5nZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRJbnQzMigyOCwgdW5pZm9ybXMuYWN0aW5Db2hlc2lvblJhbmdlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzIsIHVuaWZvcm1zLmJpbmRQcm9iLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzNiwgdW5pZm9ybXMuYmluZExlbmd0aFNhdHVyYXRpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDQ4LCB1bmlmb3Jtcy5iaW5kTGVuZ3RoRmxvb3IsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig0MCwgdW5pZm9ybXMuYWN0aW5TdGVyaWNGb3JjZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDQ0LCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDU2LCB1bmlmb3Jtcy5tb25vbWVyTWVtYnJhbmVSZXB1bHNpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDUyLCB1bmlmb3Jtcy5tb3ZlbWVudE1vZGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig2MCwgdW5pZm9ybXMubWVtYnJhbmVTdGlmZm5lc3MsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig3MiwgdW5pZm9ybXMucG9seW1lcml6YXRpb25QYXRjaFNpemUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig3NiwgdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjA4LCB1bmlmb3Jtcy5tZW1icmFuZVNtb290aGluZywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIxNiwgdW5pZm9ybXMucG9seW1lcml6YXRpb25GaWVsZERlY2F5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjIwLCB1bmlmb3Jtcy5tZW1icmFuZUZsb3csIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMjQsIHVuaWZvcm1zLmxhbWVsbGlwb2RpdW1TdHJlbmd0aCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIyOCwgdW5pZm9ybXMubGFtZWxsaXBvZGl1bVdpZHRoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjMyLCB1bmlmb3Jtcy5sYW1lbGxpcG9kaXVtRmllbGREZWNheSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIzNiwgdW5pZm9ybXMuYnJhbmNoUHJvYmFiaWxpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNDAsIHVuaWZvcm1zLmRlYnJhbmNoUHJvYmFiaWxpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNDQsIHVuaWZvcm1zLmFjdGluQmVuZFN0aWZmbmVzcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjQ4LCB1bmlmb3Jtcy5zdGVyaWNTZWxmTmVpZ2hib3JzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjUyLCB1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI1NiwgdW5pZm9ybXMubXlvc2luU3BlZWQsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNjAsIHVuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmcsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNjQsIHVuaWZvcm1zLnN1YnN0cmF0ZURyYWcsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNjgsIHVuaWZvcm1zLmNvcnRleFBvbHltZXJpemF0aW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNjQsIHVuaWZvcm1zLm1vbm9tZXJPcGFjaXR5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMig2OCwgdW5pZm9ybXMuZ0FjdGluRmllbGQgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIxMiwgdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI3MiwgdW5pZm9ybXMuY3VlWCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI3NiwgdW5pZm9ybXMuY3VlWSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjgwLCB1bmlmb3Jtcy5jdWVFbmFibGVkID8gMSA6IDAsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDI4NCwgY3VlVmVyc2lvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjg4LCB1bmlmb3Jtcy5wb2xhcml0eU1vZGUgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI5MiwgdW5pZm9ybXMucG9sYXJpdHlUdXJuUmF0ZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI5NiwgdW5pZm9ybXMucmVhclR1cm5vdmVyLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzAwLCBNYXRoLm1heCgxLCB1bmlmb3Jtcy50dXJub3ZlckFnZSksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDMwNCwgdW5pZm9ybXMudGV0aGVyVHVybm92ZXIgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMwOCwgdW5pZm9ybXMudGV0aGVyT25SYXRlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzEyLCB1bmlmb3Jtcy50ZXRoZXJPZmZSYXRlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzMTYsIE1hdGgubWF4KDAsIHVuaWZvcm1zLnRldGhlclJlY292ZXJ5U3RlcHMpLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzIwLCB1bmlmb3Jtcy5tb3RvclJlYXJCaWFzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzI0LCB1bmlmb3Jtcy5mcm9udEFsaWdubWVudCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDMyOCwgdW5pZm9ybXMudGV0aGVyTG9hZE9mZiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMzMyLCB1bmlmb3Jtcy5jb2xvdXJBZ2UgPyAxIDogMCwgdHJ1ZSk7XG5cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlciwgMCwgaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmRhdGEpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcih0ZXh0dXJlcy5jYW52YXMuYnVmZmVyLCAwLCB0ZXh0dXJlcy5jYW52YXMuZGF0YSk7XG4gIH07XG5cbiAgd3JpdGVVbmlmb3JtcygpO1xuXG4gIC8vIHNldHVwIGFnZW50c1xuICBjb25zdCByYW5kb21CdWZmZXJTaXplID0gTWF0aC5tYXgodGV4dHVyZXMuc2l6ZS53aWR0aCAqIHRleHR1cmVzLnNpemUuaGVpZ2h0LCB1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIDI1Nik7XG5cbiAgLy8gaW5pdGlhbGl6ZSByYW5kb20gYnVmZmVyXG4gIGNvbnN0IHJhbmRvbURhdGEgPSBnZXRSYW5kb21WYWx1ZXMocmFuZG9tQnVmZmVyU2l6ZSwgaW5pdGlhbFJhbmRvbSk7XG5cbiAgY29uc3QgbnVtRmxvYXRzID0gMTA7IC8vIFNlZ21lbnQgc3RydWN0IHNpemUgaW4gMzItYml0IHdvcmRzXG5cbiAgY29uc3QgYWdlbnRfYnVmZmVycyA9IHtcbiAgICBbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IDMyICogKHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICsgMiksXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU106IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogMzIgKiAoMjU2ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCksXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0ZPUkNFU106IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgLy8gUHJlZml4OiBwaHlzaWNhbCBmb3JjZSBhY2N1bXVsYXRvcnMuIFRhaWw6IGNvbnNlcnZhdGl2ZSBtZW1icmFuZS1lZGdlXG4gICAgICAvLyByb3cgc2hvcnRsaXN0czsgZXhhY3QgdGVzdHMgZmFsbCBiYWNrIHRvIGFsbCBlZGdlcyBvbiBvdmVyZmxvdy5cbiAgICAgIHNpemU6IDggKiAodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKyBNYXRoLmNlaWwoYWN0dWFsSGVpZ2h0IC8gNCkgKiAyNTcpLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLlJBTkRPTV06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgbGFiZWw6IFwiUmFuZG9tIEJ1ZmZlclwiLFxuICAgICAgc2l6ZTogcmFuZG9tRGF0YS5ieXRlTGVuZ3RoLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLkFDVElOXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiBzaXplMzIgKiBudW1GbG9hdHMgKiB1bmlmb3Jtcy5hY3RpbkNvdW50LFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IHNpemUzMiAqIG51bUZsb2F0cyAqIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5DT05ORUNUSU9OX0xPQ0tTXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBsYWJlbDogXCJBY3RpbiBDb25uZWN0aW9uIExvY2tzIEJ1ZmZlclwiLFxuICAgICAgc2l6ZTogc2l6ZTMyICogdW5pZm9ybXMuYWN0aW5Db3VudCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFLFxuICAgIH0pLFxuICB9IGFzIFJlY29yZDxudW1iZXIsIEdQVUJ1ZmZlcj47XG5cbiAgY29uc3QgdGVsZW1ldHJ5ID0gbmV3IEFjdGluVGVsZW1ldHJ5KFxuICAgIGRldmljZSxcbiAgICBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sXG4gICAgdW5pZm9ybXMuYWN0aW5Db3VudCxcbiAgICBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0sXG4gICAgdW5pZm9ybXMubWVtYnJhbmVDb3VudCxcbiAgICB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgsXG4gICAgdXJsUGFyYW1zLmdldChcInJ1blwiKSA/PyBcImRlZmF1bHRcIixcbiAgICAzMCxcbiAgICAhIXVuaWZvcm1zLmdBY3RpbkZpZWxkXG4gICk7XG4gIHRlbGVtZXRyeS5vblNhbXBsZSA9IChzKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnNldENlbGxCb3VuZHMocy5jZWxsLmxlZnQsIHMuY2VsbC5yaWdodCwgcy5jZWxsLnRvcCwgcy5jZWxsLmJvdHRvbSk7XG4gICAgaWYgKHJlY292ZXJ5LmFjdGl2ZSB8fCBzLmRpYWdub3N0aWNLaW5kID09PSBcImNvbnRhY3QtcmVjaGVja1wiKSByZXR1cm47XG4gICAgaWYgKHVuaWZvcm1zLmdBY3RpbkZpZWxkICYmIGNsYXNzaWZ5Q2hlY2twb2ludChzLCAhIXVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pID09PSBcImNvbnRhY3RzXCIpIHtcbiAgICAgIHZvaWQgcmVjb3ZlcnkucmVxdWVzdChzKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgaW52YWxpZCA9XG4gICAgICAodW5pZm9ybXMuZ0FjdGluRmllbGQgJiYgY2xhc3NpZnlDaGVja3BvaW50KHMsICEhdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbikgPT09IFwiZmF0YWxcIikgfHxcbiAgICAgIHMuYWN0aW5CYWxhbmNlRXJyb3IgfHxcbiAgICAgIHMuYnJva2VuTGlua3MgfHxcbiAgICAgIHMuY3ljbGVzIHx8XG4gICAgICAodW5pZm9ybXMuZ0FjdGluRmllbGQgJiYgKHMuaW5zaWRlUG9seW1lckJlYWRzICE9PSBzLmluUG9seW1lciB8fCBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcykpIHx8XG4gICAgICAodW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiAmJiBNYXRoLmFicyhzLmNlbGwuYXJlYSAtIDEpID4gMC4wMDEpIHx8XG4gICAgICAhTnVtYmVyLmlzRmluaXRlKHMuY2VsbC5jZW50cm9pZFgpO1xuICAgIGlmIChpbnZhbGlkKVxuICAgICAgc3RvcFNpbXVsYXRpb24oXG4gICAgICAgIGBOdW1lcmljYWwgY2hlY2sgZmFpbGVkIGF0IHN0ZXAgJHtzLnN0ZXB9OiAke0pTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBtYXNzOiBzLmFjdGluQmFsYW5jZUVycm9yLFxuICAgICAgICAgIGluc2lkZUY6IHMuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgICAgICAgIHRvdGFsRjogcy5pblBvbHltZXIsXG4gICAgICAgICAgY3Jvc3NpbmdzOiBzLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICAgICAgICBicm9rZW5MaW5rczogcy5icm9rZW5MaW5rcyxcbiAgICAgICAgICBjeWNsZXM6IHMuY3ljbGVzLFxuICAgICAgICAgIGFyZWE6IHMuY2VsbC5hcmVhLFxuICAgICAgICAgIGNlbnRyb2lkWDogcy5jZWxsLmNlbnRyb2lkWCxcbiAgICAgICAgfSl9OyByZXNldCB0byByZXBsYXkuYFxuICAgICAgKTtcbiAgfTtcbiAgbGV0IGNvbnRhY3RCYWNrdXA6IEFycmF5QnVmZmVyIHwgbnVsbCA9IG51bGw7XG4gIGFzeW5jIGZ1bmN0aW9uIHJlYWRBY3RpbigpIHtcbiAgICBjb25zdCBzb3VyY2UgPSBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl07XG4gICAgY29uc3Qgc3RhZ2UgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogc291cmNlLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihzb3VyY2UsIDAsIHN0YWdlLCAwLCBzb3VyY2Uuc2l6ZSk7XG4gICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICBhd2FpdCBzdGFnZS5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgICAgcmV0dXJuIHN0YWdlLmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN0YWdlLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgcmVjb3ZlcnkgPSBuZXcgQ29udGFjdFJlY292ZXJ5KHtcbiAgICBpbnNwZWN0OiBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgICAgYXdhaXQgdGVsZW1ldHJ5LnVwZGF0ZSh0aW1lLCBmcmFtZU5yLCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgdHJ1ZSwgdHJ1ZSk7XG4gICAgICBpZiAoZ3B1RXJyb3JzLmxlbmd0aCkgdGhyb3cgRXJyb3IoZ3B1RXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgcmV0dXJuIHRlbGVtZXRyeS5oaXN0b3J5LmF0KC0xKSE7XG4gICAgfSxcbiAgICBiZWdpbjogYXN5bmMgKCkgPT4ge1xuICAgICAgY29udGFjdEJhY2t1cCA9IGF3YWl0IHJlYWRBY3RpbigpO1xuICAgIH0sXG4gICAgcmVwYWlyOiBhc3luYyAoaXRlcmF0aW9ucykgPT4ge1xuICAgICAgcnVuQ29udGFjdFJlcGFpcihkZXZpY2UsIHNpbVBpcGVsaW5lcywgYmluZEdyb3VwU2ltdWxhdGUsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsIGNhbnZhcy5jYW52YXMuaGVpZ2h0LCBpdGVyYXRpb25zKTtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBhd2FpdCByZWFkQWN0aW4oKSxcbiAgICAgICAgYmVmb3JlID0gbmV3IEZsb2F0MzJBcnJheShjb250YWN0QmFja3VwISksXG4gICAgICAgIGFmdGVyID0gbmV3IEZsb2F0MzJBcnJheShjdXJyZW50KTtcbiAgICAgIGNvbnN0IGJ1ID0gbmV3IFVpbnQzMkFycmF5KGNvbnRhY3RCYWNrdXAhKSxcbiAgICAgICAgYXUgPSBuZXcgVWludDMyQXJyYXkoY3VycmVudCk7XG4gICAgICBsZXQgbWF4aW11bSA9IDA7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFmdGVyLmxlbmd0aDsgaSArPSAxMCkge1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IDEwOyBqKyspIGlmIChqICE9PSAyICYmIGogIT09IDMgJiYgYnVbaSArIGpdICE9PSBhdVtpICsgal0pIHRocm93IEVycm9yKFwiQ29udGFjdCByZXBhaXIgY2hhbmdlZCBhY3RpbiBtZXRhZGF0YVwiKTtcbiAgICAgICAgY29uc3QgZGlzcGxhY2VtZW50ID0gTWF0aC5oeXBvdChhZnRlcltpICsgMl0gLSBiZWZvcmVbaSArIDJdLCBhZnRlcltpICsgM10gLSBiZWZvcmVbaSArIDNdKTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoZGlzcGxhY2VtZW50KSkgdGhyb3cgRXJyb3IoXCJOb24tZmluaXRlIGNvbnRhY3QgY29ycmVjdGlvblwiKTtcbiAgICAgICAgbWF4aW11bSA9IE1hdGgubWF4KG1heGltdW0sIGRpc3BsYWNlbWVudCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWF4aW11bTtcbiAgICB9LFxuICAgIHJvbGxiYWNrOiBhc3luYyAoKSA9PiB7XG4gICAgICBpZiAoY29udGFjdEJhY2t1cCkgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSwgMCwgY29udGFjdEJhY2t1cCk7XG4gICAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgIH0sXG4gICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgY29udGFjdEJhY2t1cCA9IG51bGw7XG4gICAgfSxcbiAgICBmaXhlZEFyZWE6ICgpID0+ICEhdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbixcbiAgICBtYXhEaXNwbGFjZW1lbnQ6ICgpID0+IDgsXG4gICAgbm93OiAoKSA9PiBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICBub3RpY2U6IChtZXNzYWdlKSA9PiB7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgfSxcbiAgICBmYWlsOiBzdG9wU2ltdWxhdGlvbixcbiAgfSk7XG4gIGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLlRFTEVNRVRSWV0gPSB0ZWxlbWV0cnkuY291bnRlckJ1ZmZlcjtcblxuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuUkFORE9NXSwgLypvZmZzZXQ9Ki8gMCwgLypkYXRhPSovIHJhbmRvbURhdGEpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBPdmVyYWxsIG1lbW9yeSBsYXlvdXRcbiAgY29uc3QgdmlzaWJpbGl0eSA9IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVDtcblxuICAvLyBUaGlzIGxheW91dCBpcyBmb3Igc2hhcmVkIHJlc291cmNlcyBiZXR3ZWVuIHNpbXVsYXRpb24gYW5kIHJlbmRlcmluZ1xuICBjb25zdCBzaGFyZWRMYXlvdXRFbnRyaWVzID0gW1xuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQlVGRkVSKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgYnVmZmVyOiB7IHR5cGU6IFwidW5pZm9ybVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlIH0sXG4gICAgfSkpLFxuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSkubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgYmluZGluZzogYmluZGluZyxcbiAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCxcbiAgICAgIHN0b3JhZ2VUZXh0dXJlOiB0ZXh0dXJlcy5iaW5kaW5nTGF5b3V0W2JpbmRpbmddLFxuICAgIH0pKSxcbiAgXTtcblxuICBjb25zdCBzaGFyZWRCaW5kR3JvdXBFbnRyaWVzID0gW1xuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfVEVYVFVSRSkubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgYmluZGluZyxcbiAgICAgIHJlc291cmNlOiB0ZXh0dXJlcy50ZXh0dXJlc1tiaW5kaW5nXS5jcmVhdGVWaWV3KCksXG4gICAgfSkpLFxuICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQlVGRkVSKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nLFxuICAgICAgcmVzb3VyY2U6IHsgYnVmZmVyOiBjYW52YXNfYnVmZmVyc1tiaW5kaW5nXSB9LFxuICAgIH0pKSxcbiAgXTtcblxuICBjb25zdCBiaW5kR3JvdXBMYXlvdXRTaW11bGF0ZSA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFNpbXVsYXRlXCIsXG4gICAgZW50cmllczogW1xuICAgICAgLi4uc2hhcmVkTGF5b3V0RW50cmllcyxcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQUdFTlRTKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICAgIGJpbmRpbmc6IGJpbmRpbmcsXG4gICAgICAgIHZpc2liaWxpdHk6IHZpc2liaWxpdHksXG4gICAgICAgIGJ1ZmZlcjogeyB0eXBlOiBcInN0b3JhZ2VcIiBhcyBHUFVCdWZmZXJCaW5kaW5nVHlwZSB9LFxuICAgICAgfSkpLFxuICAgIF0sXG4gIH0pO1xuXG4gIGNvbnN0IGJpbmRHcm91cFNpbXVsYXRlID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cCh7XG4gICAgbGFiZWw6IGBCaW5kIEdyb3VwYCxcbiAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dFNpbXVsYXRlLFxuICAgIGVudHJpZXM6IFtcbiAgICAgIC4uLnNoYXJlZEJpbmRHcm91cEVudHJpZXMsXG4gICAgICAuLi5PYmplY3QudmFsdWVzKEJJTkRJTkdTX0FHRU5UUykubWFwKChiaW5kaW5nKSA9PiAoe1xuICAgICAgICBiaW5kaW5nLFxuICAgICAgICByZXNvdXJjZTogeyBidWZmZXI6IGFnZW50X2J1ZmZlcnNbYmluZGluZ10gfSxcbiAgICAgIH0pKSxcbiAgICBdLFxuICB9KTtcblxuICBjb25zdCBwaXBlbGluZUxheW91dFNpbXVsYXRlID0gZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICBsYWJlbDogXCJwaXBlbGluZUxheW91dFwiLFxuICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRTaW11bGF0ZV0sXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGxpbmVDb25zdHJhaW50RnVuY3Rpb24ocGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyKSB7XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMub3JpZW50YXRpb25VcGRhdGUpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKE1BWF9CVUZGRVJfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5jb3NzZXJhdFVwZGF0ZSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1bmlmb3Jtcy5hY3RpbkNvc3NlcmF0SXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcbiAgICB9XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubGluZUNvbnN0cmFpbnQpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKE1BWF9CVUZGRVJfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tZW1icmFuZVRhbmdlbnRpYWxGbG93KTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVuaWZvcm1zLm1lbWJyYW5lRmxvd0l0ZXJhdGlvbnM7IGkrKykge1xuICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIFNldCB1cCBjb2RlIGluc3RydWN0aW9uc1xuICBjb25zdCBtb2R1bGUgPSBhd2FpdCBjcmVhdGVTaGFkZXIoZGV2aWNlLCBzaW11bGF0ZUNvZGUsIHNoYWRlckluY2x1ZGVzKTtcblxuICBjb25zdCBzaW1QaXBlbGluZXMgPSBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzKGRldmljZSwgbW9kdWxlLCBwaXBlbGluZUxheW91dFNpbXVsYXRlKTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gUlVOIHRoZSByZXNldCBzaGFkZXIgZnVuY3Rpb25cbiAgY29uc3QgcmVzZXQgPSAoKSA9PiB7XG4gICAgd3JpdGVVbmlmb3JtcygpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXSwgMCwgbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCkpKTtcblxuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG5cbiAgICBwYXNzLnNldEJpbmRHcm91cChHUk9VUF9JTkRFWCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuXG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMucmVzZXRBY3Rpbik7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG5cbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5yZXNldE1lbWJyYW5lKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcblxuICAgIHBhc3MuZW5kKCk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGlmICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCB8fCB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSBydW5FbmNsb3N1cmUoZGV2aWNlLCBzaW1QaXBlbGluZXMsIGJpbmRHcm91cFNpbXVsYXRlLCBCVUZGRVJfV09SS0dST1VQX0NPVU5ULCBhY3R1YWxIZWlnaHQpO1xuICAgIHRlbGVtZXRyeS5yZXNldCgpO1xuICB9O1xuICByZXNldCgpO1xuXG4gIGNvbnN0IHJlbmRlclNoYWRlciA9IGF3YWl0IGNyZWF0ZVNoYWRlcihkZXZpY2UsIHJlbmRlckNvZGUsIHNoYWRlckluY2x1ZGVzKTtcbiAgY29uc3QgcmVuZGVyTW9kdWxlID0gbmV3IFJlbmRlck1vZHVsZShcbiAgICBkZXZpY2UsXG4gICAgY2FudmFzLmZvcm1hdCxcbiAgICB7IHdpZHRoOiBhY3R1YWxXaWR0aCwgaGVpZ2h0OiBhY3R1YWxIZWlnaHQgfSxcbiAgICByZW5kZXJTaGFkZXIsXG4gICAgdGV4dHVyZXMsXG4gICAgc2hhcmVkTGF5b3V0RW50cmllcyxcbiAgICBzaGFyZWRCaW5kR3JvdXBFbnRyaWVzLFxuICAgIHsgYnVmZmVyOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX1NOQVBTSE9UXSwgb2Zmc2V0OiAzMiAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCksIHNpemU6IDMyIH1cbiAgKTtcbiAgZm9yIChjb25zdCBba2V5LCBwYXJhbWV0ZXIsIGxvdywgaGlnaF0gb2YgW1xuICAgIFtcIm1vZGVcIiwgXCJtaWNyb3Njb3BlXCIsIDAsIDFdLFxuICAgIFtcInpvb21cIiwgXCJ2aWV3Wm9vbVwiLCAxLCA2XSxcbiAgICBbXCJmb2N1c1wiLCBcImZvY3VzXCIsIC0xLCAxXSxcbiAgICBbXCJjb250cmFzdFwiLCBcIm9wdGljYWxDb250cmFzdFwiLCAwLjIsIDIuNV0sXG4gIF0gYXMgY29uc3QpIHtcbiAgICBpZiAodXJsUGFyYW1zLmhhcyhwYXJhbWV0ZXIpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IE51bWJlcih1cmxQYXJhbXMuZ2V0KHBhcmFtZXRlcikpO1xuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkpIHJlbmRlck1vZHVsZS52aWV3W2tleV0gPSBNYXRoLm1heChsb3csIE1hdGgubWluKGhpZ2gsIHZhbHVlKSk7XG4gICAgfVxuICB9XG4gIHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPSByZW5kZXJNb2R1bGUudmlldy5tb2RlID8gMSA6IDA7XG4gIHJlbmRlck1vZHVsZS52aWV3LmF1dG9GaXQgPSAhdXJsUGFyYW1zLmhhcyhcInZpZXdab29tXCIpO1xuICBjb25zdCBpbml0aWFsUmFkaXVzID0gKHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKiB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpIC8gKDIgKiBNYXRoLlBJKTtcbiAgcmVuZGVyTW9kdWxlLnNldENlbGxCb3VuZHMoXG4gICAgYWN0dWFsV2lkdGggLyAyIC0gaW5pdGlhbFJhZGl1cyxcbiAgICBhY3R1YWxXaWR0aCAvIDIgKyBpbml0aWFsUmFkaXVzLFxuICAgIGFjdHVhbEhlaWdodCAvIDIgLSBpbml0aWFsUmFkaXVzLFxuICAgIGFjdHVhbEhlaWdodCAvIDIgKyBpbml0aWFsUmFkaXVzXG4gICk7XG4gIHJlbmRlck1vZHVsZS5maXRJbW1lZGlhdGVseSgpO1xuXG4gIC8vIFNob3cgdGhlIGluaXRpYWwgc29sdWJsZSBjb21wYXJ0bWVudCBldmVuIHdoZW4gb3BlbmVkIHBhdXNlZC4gVGhpcyB3cml0ZXNcbiAgLy8gb25seSB0aGUgdmlzdWFsaXphdGlvbiBtYXNrLCBub3QgcmVhY3Rpb24vc3RlcmljIGZpZWxkcyBvciBwaHlzaWNhbCBzdGF0ZS5cbiAgaWYgKHVuaWZvcm1zLmdBY3RpbkZpZWxkKSB7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG4gICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuZHJhd1Jlc2Vydm9pcik7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoLi4uVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3MuZW5kKCk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIHJlbmRlck1vZHVsZS5yZW5kZXIoY2FudmFzLmNvbnRleHQpO1xuICB9XG5cbiAgdmFyIGZyYW1lTnIgPSAwO1xuICBjb25zdCBzcHJvdXRzID0gbmV3IFNwcm91dFNjaGVkdWxlcih1bmlmb3Jtcy5zcHJvdXRPblN0ZXBzICsgdW5pZm9ybXMuc3Byb3V0T2ZmU3RlcHMsIHNlZWRlZFJhbmRvbShzZWVkIF4gMHhhMzQxMzE2YykpO1xuICBjb25zdCBzcHJvdXRTaXRlcyA9IG5ldyBGbG9hdDMyQXJyYXkoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmRhdGEsIDgwLCA0ICogTUFYX1NQUk9VVF9TSVRFUyk7XG5cbiAgLy8gUlVOIHRoZSBzaW0gY29tcHV0ZSBmdW5jdGlvbiBhbmQgcmVuZGVyIHBpeGVsc1xuICBhc3luYyBmdW5jdGlvbiB0aW1lc3RlcChzdGVwQ291bnQgPSB1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZSkge1xuICAgIGlmIChyZWNvdmVyeS5hY3RpdmUpIHJldHVybjtcbiAgICB0aW1lKys7XG4gICAgaWYgKGNvbnRyb2xzRGlydHkpIHtcbiAgICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICAgIGNvbnRyb2xzRGlydHkgPSBmYWxzZTtcbiAgICB9XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGludGVyYWN0aW9ucy5pbnRlcmFjdGlvbnMuYnVmZmVyLCAwLCBpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmRhdGEpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGVwQ291bnQ7IGkrKykge1xuICAgICAgc3Byb3V0cy51cGRhdGUoZnJhbWVOciwgdW5pZm9ybXMsIHNwcm91dFNpdGVzKTtcbiAgICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihpbnRlcmFjdGlvbnMuY29udHJvbHMuYnVmZmVyLCA4MCwgc3Byb3V0U2l0ZXMpO1xuICAgICAgcnVuU2ltdWxhdGlvblN0ZXAoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAgc2ltUGlwZWxpbmVzLFxuICAgICAgICBiaW5kR3JvdXBTaW11bGF0ZSxcbiAgICAgICAgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCxcbiAgICAgICAgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQsXG4gICAgICAgIGxpbmVDb25zdHJhaW50RnVuY3Rpb24sXG4gICAgICAgIGZyYW1lTnIsXG4gICAgICAgIGkgPT09IHN0ZXBDb3VudCAtIDEsXG4gICAgICAgICEhKHVuaWZvcm1zLmdBY3RpbkZpZWxkIHx8IHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pLFxuICAgICAgICAhIXVuaWZvcm1zLnBvbGFyaXR5TW9kZVxuICAgICAgKTtcbiAgICAgIGZyYW1lTnIrKztcbiAgICB9XG5cbiAgICByZW5kZXJNb2R1bGUucmVuZGVyKGNhbnZhcy5jb250ZXh0KTtcbiAgICBpZiAodW5pZm9ybXMuY3VlRW5hYmxlZCkgZGlzcGxheUN1ZSgpO1xuICAgIHRlbGVtZXRyeS5zbmFwc2hvdCh0aW1lLCBjYW52YXMuY2FudmFzKTtcbiAgICBpZiAoIXBhdXNlZCkgdGVsZW1ldHJ5LnVwZGF0ZSh0aW1lLCBmcmFtZU5yLCB1bmlmb3Jtcy5lcXVpbGlicml1bUxpbmVEaXN0YW5jZSkuY2F0Y2goc3RvcFNpbXVsYXRpb24pO1xuICAgIGlmICh0aW1lICUgMzAgPT09IDApXG4gICAgICBtZWNoYW5pY2FsU3VtbWFyeSgpXG4gICAgICAgIC50aGVuKCh7IG1vdG9ycywgdGV0aGVycyB9KSA9PiB7XG4gICAgICAgICAgY29uc3Qgc3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKTtcbiAgICAgICAgICBpZiAoc3RhdHVzKVxuICAgICAgICAgICAgc3RhdHVzLnRleHRDb250ZW50ID0gYFNlZWQgJHtzZWVkfSDCtyAke21vdG9yc30gbW90b3IgbGlua3MgwrcgJHt0ZXRoZXJzfSB0ZXRoZXJzIMK3IGNvcnRleCAke3VuaWZvcm1zLmNvcnRleFBvbHltZXJpemF0aW9uID4gMCA/IFwib25cIiA6IFwib2ZmXCJ9YDtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN0b3BTaW11bGF0aW9uKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIG1lY2hhbmljYWxTdW1tYXJ5KCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdO1xuICAgIGNvbnN0IHN0YWdpbmcgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogYnVmZmVyLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihidWZmZXIsIDAsIHN0YWdpbmcsIDAsIGJ1ZmZlci5zaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgc3RhZ2luZy5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KHN0YWdpbmcuZ2V0TWFwcGVkUmFuZ2UoKSk7XG4gICAgbGV0IG1vdG9ycyA9IDAsXG4gICAgICB0ZXRoZXJzID0gMCxcbiAgICAgIHBvc3RlcmlvclRldGhlcnMgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd29yZHMubGVuZ3RoIC8gODsgaSsrKSB7XG4gICAgICBpZiAod29yZHNbaSAqIDhdKSB7XG4gICAgICAgIGlmIChpIDwgMjU2KSBtb3RvcnMrKztcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGV0aGVycysrO1xuICAgICAgICAgIGNvbnN0IGFyYyA9IChpIC0gMjU2KSAvIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQ7XG4gICAgICAgICAgaWYgKGFyYyA+IDAuMjUgJiYgYXJjIDwgMC43NSkgcG9zdGVyaW9yVGV0aGVycysrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHN0YWdpbmcudW5tYXAoKTtcbiAgICBzdGFnaW5nLmRlc3Ryb3koKTtcbiAgICByZXR1cm4geyBtb3RvcnMsIHRldGhlcnMsIHBvc3RlcmlvclRldGhlcnMgfTtcbiAgfVxuXG4gIGNvbnN0IGN1ZU1hcmtlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3VlLW1hcmtlclwiKSE7XG4gIGZ1bmN0aW9uIGRpc3BsYXlDdWUoKSB7XG4gICAgY3VlTWFya2VyLmhpZGRlbiA9ICF1bmlmb3Jtcy5jdWVFbmFibGVkO1xuICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBvaW50ID0gcmVuZGVyTW9kdWxlLndvcmxkVG9TY3JlZW4odW5pZm9ybXMuY3VlWCwgdW5pZm9ybXMuY3VlWSk7XG4gICAgY3VlTWFya2VyLnN0eWxlLmxlZnQgPSBgJHtyZWN0LmxlZnQgKyAocG9pbnQueCAvIGFjdHVhbFdpZHRoKSAqIHJlY3Qud2lkdGh9cHhgO1xuICAgIGN1ZU1hcmtlci5zdHlsZS50b3AgPSBgJHtyZWN0LnRvcCArIChwb2ludC55IC8gYWN0dWFsSGVpZ2h0KSAqIHJlY3QuaGVpZ2h0fXB4YDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImN1ZS1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gdW5pZm9ybXMucG9sYXJpdHlNb2RlXG4gICAgICA/IFwiUGVyc2lzdGVudCBoZWFkaW5nIMK3IGRyYWcgdG8gc2V0IGEgbmV3IGRpcmVjdGlvbiDCtyBFc2MgZmFjZXMgcmlnaHRcIlxuICAgICAgOiB1bmlmb3Jtcy5jdWVFbmFibGVkXG4gICAgICAgID8gXCJQb2xhcml0eSBjdWUgYWN0aXZlIMK3IGRyYWcgdG8gbW92ZSDCtyBFc2MgdG8gY2xlYXJcIlxuICAgICAgICA6IFwiQ2xpY2sgb3IgZHJhZyB0aGUgY2FudmFzIHRvIG1vdmUgdGhlIGFjdGl2ZSBlZGdlXCI7XG4gIH1cbiAgZnVuY3Rpb24gc2V0Q3VlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoeCkgfHwgIU51bWJlci5pc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IEVycm9yKFwiQ3VlIGNvb3JkaW5hdGVzIG11c3QgYmUgZmluaXRlXCIpO1xuICAgIHVuaWZvcm1zLmN1ZVggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhY3R1YWxXaWR0aCwgeCkpO1xuICAgIHVuaWZvcm1zLmN1ZVkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhY3R1YWxIZWlnaHQsIHkpKTtcbiAgICB1bmlmb3Jtcy5jdWVFbmFibGVkID0gMTtcbiAgICBjdWVWZXJzaW9uKys7XG4gICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gICAgZGlzcGxheUN1ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGNsZWFyQ3VlKCkge1xuICAgIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPSAwO1xuICAgIGN1ZVZlcnNpb24rKztcbiAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICBkaXNwbGF5Q3VlKCk7XG4gIH1cbiAgYXN5bmMgZnVuY3Rpb24gY3VlU3RhdGUoKSB7XG4gICAgY29uc3Qgc3RhZ2luZyA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiAzMiwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdLCAzMiAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIDEpLCBzdGFnaW5nLCAwLCAzMik7XG4gICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICBhd2FpdCBzdGFnaW5nLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgICBjb25zdCBkYXRhID0gc3RhZ2luZy5nZXRNYXBwZWRSYW5nZSgpLFxuICAgICAgICB1ID0gbmV3IFVpbnQzMkFycmF5KGRhdGEpLFxuICAgICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICAgIHJldHVybiB7IGluZGV4OiB1WzRdLCB2ZXJzaW9uOiB1WzVdLCB4OiBmWzBdLCB5OiBmWzFdLCBheGlzWDogZlsyXSwgYXhpc1k6IGZbM10sIGVuYWJsZWQ6ICEhdW5pZm9ybXMuY3VlRW5hYmxlZCwgc3RlcDogZnJhbWVOciB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoc3RhZ2luZy5tYXBTdGF0ZSA9PT0gXCJtYXBwZWRcIikgc3RhZ2luZy51bm1hcCgpO1xuICAgICAgc3RhZ2luZy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG4gIGNhbnZhcy5jYW52YXMuc3R5bGUudG91Y2hBY3Rpb24gPSBcIm5vbmVcIjtcbiAgbGV0IGRyYWdnaW5nID0gZmFsc2U7XG4gIGNvbnN0IHBvaW50Q3VlID0gKGU6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBvaW50ID0gcmVuZGVyTW9kdWxlLnNjcmVlblRvV29ybGQoKChlLmNsaWVudFggLSByZWN0LmxlZnQpIC8gcmVjdC53aWR0aCkgKiBhY3R1YWxXaWR0aCwgKChlLmNsaWVudFkgLSByZWN0LnRvcCkgLyByZWN0LmhlaWdodCkgKiBhY3R1YWxIZWlnaHQpO1xuICAgIHNldEN1ZShwb2ludC54LCBwb2ludC55KTtcbiAgfTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmRvd25cIiwgKGUpID0+IHtcbiAgICBpZiAoZS5idXR0b24gIT09IDApIHJldHVybjtcbiAgICBkcmFnZ2luZyA9IHRydWU7XG4gICAgY2FudmFzLmNhbnZhcy5zZXRQb2ludGVyQ2FwdHVyZShlLnBvaW50ZXJJZCk7XG4gICAgcG9pbnRDdWUoZSk7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVybW92ZVwiLCAoZSkgPT4ge1xuICAgIGlmIChkcmFnZ2luZykgcG9pbnRDdWUoZSk7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVydXBcIiwgKCkgPT4ge1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyY2FuY2VsXCIsICgpID0+IHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwibG9zdHBvaW50ZXJjYXB0dXJlXCIsICgpID0+IHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgKCkgPT4ge1xuICAgIHJlbmRlck1vZHVsZS5maXRJbW1lZGlhdGVseSgpO1xuICAgIHVwZGF0ZVZpZXcoKTtcbiAgfSk7XG4gIGRpc3BsYXlDdWUoKTtcblxuICBmdW5jdGlvbiB1cGRhdGVWaWV3KCkge1xuICAgIGRvY3VtZW50LmJvZHkuZGF0YXNldC52aWV3ID0gcmVuZGVyTW9kdWxlLnZpZXcubW9kZSA/IFwibWljcm9zY29wZVwiIDogXCJkaWFnbm9zdGljXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLXRpdGxlXCIpIS50ZXh0Q29udGVudCA9IHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPyBcIkNlbGwgwrcgdHJhbnNtaXR0ZWQgbGlnaHRcIiA6IFwiRXhwbGljaXQgZmlsYW1lbnRzIMK3IGRpYWdub3N0aWNzXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWV3LXpvb20tdmFsdWVcIikhLnRleHRDb250ZW50ID0gYCR7cmVuZGVyTW9kdWxlLnZpZXcuem9vbS50b0ZpeGVkKDEpfcOXYDtcbiAgICByZW5kZXJNb2R1bGUucmVuZGVyKGNhbnZhcy5jb250ZXh0KTtcbiAgICBkaXNwbGF5Q3VlKCk7XG4gIH1cbiAgY29uc3Qgdmlld1NlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlldy1tb2RlXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuICB2aWV3U2VsZWN0LnZhbHVlID0gU3RyaW5nKHJlbmRlck1vZHVsZS52aWV3Lm1vZGUpO1xuICB2aWV3U2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPSBOdW1iZXIodmlld1NlbGVjdC52YWx1ZSk7XG4gICAgdXBkYXRlVmlldygpO1xuICB9KTtcbiAgZm9yIChjb25zdCBbaWQsIGtleV0gb2YgW1xuICAgIFtcInZpZXctem9vbVwiLCBcInpvb21cIl0sXG4gICAgW1widmlldy1mb2N1c1wiLCBcImZvY3VzXCJdLFxuICAgIFtcInZpZXctY29udHJhc3RcIiwgXCJjb250cmFzdFwiXSxcbiAgXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IGlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgaW5wdXQudmFsdWUgPSBTdHJpbmcocmVuZGVyTW9kdWxlLnZpZXdba2V5XSk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgIHJlbmRlck1vZHVsZS52aWV3W2tleV0gPSBOdW1iZXIoaW5wdXQudmFsdWUpO1xuICAgICAgaWYgKGtleSA9PT0gXCJ6b29tXCIpIHJlbmRlck1vZHVsZS52aWV3LmF1dG9GaXQgPSBmYWxzZTtcbiAgICAgIHVwZGF0ZVZpZXcoKTtcbiAgICB9KTtcbiAgfVxuICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb2xsb3ctY2VsbFwiKSBhcyBIVE1MSW5wdXRFbGVtZW50KS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIChlKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcuZm9sbG93ID0gKGUudGFyZ2V0IGFzIEhUTUxJbnB1dEVsZW1lbnQpLmNoZWNrZWQ7XG4gICAgdXBkYXRlVmlldygpO1xuICB9KTtcbiAgdXBkYXRlVmlldygpO1xuICBjb25zdCBzZXR0aW5nc1BhbmVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLXBhbmVsXCIpITtcbiAgY29uc3Qgc2V0dGluZ3NCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRvZ2dsZS1zZXR0aW5nc1wiKSE7XG4gIGZ1bmN0aW9uIHNldFNldHRpbmdzKG9wZW46IGJvb2xlYW4pIHtcbiAgICBzZXR0aW5nc1BhbmVsLmhpZGRlbiA9ICFvcGVuO1xuICAgIHNldHRpbmdzQnV0dG9uLnNldEF0dHJpYnV0ZShcImFyaWEtZXhwYW5kZWRcIiwgU3RyaW5nKG9wZW4pKTtcbiAgICBkb2N1bWVudC5ib2R5LmRhdGFzZXQuc2V0dGluZ3MgPSBvcGVuID8gXCJvcGVuXCIgOiBcImNsb3NlZFwiO1xuICAgIGlmIChvcGVuKSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlLXNldHRpbmdzXCIpIS5mb2N1cygpO1xuICAgIGVsc2Ugc2V0dGluZ3NCdXR0b24uZm9jdXMoKTtcbiAgfVxuICBzZXR0aW5nc0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0U2V0dGluZ3Moc2V0dGluZ3NQYW5lbC5oaWRkZW4pKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZS1zZXR0aW5nc1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHNldFNldHRpbmdzKGZhbHNlKSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZml0LWNlbGxcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcuYXV0b0ZpdCA9IHRydWU7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcuZm9sbG93ID0gdHJ1ZTtcbiAgICByZW5kZXJNb2R1bGUuZml0SW1tZWRpYXRlbHkoKTtcbiAgICB1cGRhdGVWaWV3KCk7XG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc3RvcmUtZGVtb1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24ucGF0aG5hbWUgKyBcIj9kZW1vPTFcIjtcbiAgfSk7XG4gIHNldHRpbmdzUGFuZWwuYXBwZW5kKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGlhZ25vc3RpY3NcIikhKTtcbiAgc2V0dGluZ3NQYW5lbC5hcHBlbmQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpISk7XG5cbiAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtbyA9IHtcbiAgICBzZWVkLFxuICAgIHVuaWZvcm1zLFxuICAgIGdwdUVycm9ycyxcbiAgICBydW50aW1lRXJyb3JzLFxuICAgIGNvbnRhY3RSZWNvdmVyeTogcmVjb3ZlcnksXG4gICAgdmlldzogcmVuZGVyTW9kdWxlLnZpZXcsXG4gICAgcmVkcmF3OiB1cGRhdGVWaWV3LFxuICAgIHNjcmVlblRvV29ybGQ6ICh4OiBudW1iZXIsIHk6IG51bWJlcikgPT4gcmVuZGVyTW9kdWxlLnNjcmVlblRvV29ybGQoeCwgeSksXG4gICAgc2V0Q3VlLFxuICAgIGNsZWFyQ3VlLFxuICAgIGN1ZVN0YXRlLFxuICAgIGdldCBwYXVzZWQoKSB7XG4gICAgICByZXR1cm4gcGF1c2VkO1xuICAgIH0sXG4gICAgZ2V0IHN0ZXAoKSB7XG4gICAgICByZXR1cm4gZnJhbWVOcjtcbiAgICB9LFxuICAgIHBlcmZvcm1hbmNlU25hcHNob3Q6ICgpID0+ICh7IC4uLmxpdmVQZXJmb3JtYW5jZS5zbmFwc2hvdCgpLCBkaWFnbm9zdGljczogeyAuLi50ZWxlbWV0cnkudGltaW5ncyB9IH0pLFxuICAgIHBhdXNlOiAoKSA9PiB7XG4gICAgICBzZXRQYXVzZWQodHJ1ZSk7XG4gICAgfSxcbiAgICBwbGF5OiAoKSA9PiB7XG4gICAgICBzZXRQYXVzZWQoZmFsc2UpO1xuICAgIH0sXG4gICAgYXN5bmMgYWR2YW5jZShzdGVwczogbnVtYmVyKSB7XG4gICAgICBpZiAoIXBhdXNlZCB8fCByZWNvdmVyeS5hY3RpdmUgfHwgbWFudWFsQWR2YW5jZVBlbmRpbmcgfHwgIU51bWJlci5pc0ludGVnZXIoc3RlcHMpIHx8IHN0ZXBzIDwgMCB8fCBzdGVwcyA+IDIwMDApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGFuZCByZXF1ZXN0IG9uZSBiYXRjaCBvZiAw4oCTMjAwMCB3aG9sZSBzdGVwc1wiKTtcbiAgICAgIG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICAgIGZvciAobGV0IHJlbWFpbmluZyA9IHN0ZXBzOyByZW1haW5pbmcgPiAwOyApIHtcbiAgICAgICAgICBhd2FpdCByZWNvdmVyeS53YWl0KCk7XG4gICAgICAgICAgaWYgKHJ1bnRpbWVFcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IocnVudGltZUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgICBjb25zdCBiYXRjaCA9IE1hdGgubWluKDIwLCByZW1haW5pbmcpO1xuICAgICAgICAgIGF3YWl0IHRpbWVzdGVwKGJhdGNoKTtcbiAgICAgICAgICByZW1haW5pbmcgLT0gYmF0Y2g7XG4gICAgICAgICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICAgICAgICBpZiAoZ3B1RXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGdwdUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlKTtcbiAgICAgICAgYXdhaXQgcmVjb3Zlcnkud2FpdCgpO1xuICAgICAgICBpZiAocnVudGltZUVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihydW50aW1lRXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICB1cGRhdGVWaWV3KCk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSEudGV4dENvbnRlbnQgPSBgUGF1c2VkIMK3IHN0ZXAgJHtmcmFtZU5yfWA7XG4gICAgICAgIHJldHVybiB7IHN0YXRzOiB0ZWxlbWV0cnkuaGlzdG9yeS5hdCgtMSksIGxpbmtzOiBhd2FpdCBtZWNoYW5pY2FsU3VtbWFyeSgpLCBncHVFcnJvcnMgfTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcblxuICBpZiAodXJsUGFyYW1zLmhhcyhcIm1lY2hhbmljc1Rlc3RcIikpIHtcbiAgICAod2luZG93IGFzIGFueSkuZmlsYW1lbnREZW1vLnRlc3RSZW5ld2FsID0gKCkgPT4ge1xuICAgICAgaWYgKCFwYXVzZWQpIHRocm93IEVycm9yKFwiUGF1c2UgYmVmb3JlIGRlc3RydWN0aXZlIHJlbmV3YWwgZml4dHVyZXNcIik7XG4gICAgICByZXR1cm4gdGVzdFJlbmV3YWwoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGluOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sXG4gICAgICAgICAgbWVtYnJhbmU6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSxcbiAgICAgICAgICBsaW5rczogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU10sXG4gICAgICAgICAgc25hcHNob3Q6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdLFxuICAgICAgICB9LFxuICAgICAgICB7IGFjdGluOiB1bmlmb3Jtcy5hY3RpbkNvdW50LCBtZW1icmFuZTogdW5pZm9ybXMubWVtYnJhbmVDb3VudCB9LFxuICAgICAgICAodmFsdWVzKSA9PiB7XG4gICAgICAgICAgT2JqZWN0LmFzc2lnbih1bmlmb3JtcywgdmFsdWVzKTtcbiAgICAgICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICAgIH0sXG4gICAgICAgIChraW5kLCByZXBlYXRzID0gMSkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKSxcbiAgICAgICAgICAgIHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICAgICAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG4gICAgICAgICAgaWYgKGtpbmQgPT09IFwicG9sYXJpdHlcIikge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcygxKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnJlc29sdmVDdWUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoMSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSBcInR1cm5vdmVyXCIpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnVuYmluZE1pblBvbGUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG4gICAgICAgICAgfSBlbHNlIGlmIChraW5kID09PSBcIm1vdG9yXCIpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4gKyBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1vdG9yTGlua3MpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoMSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5hcHBseU1lY2hhbmljYWxGb3JjZXMpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTiArIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5hY3RpbmVzVG9UZXh0dXJlcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4gKyBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1lbWJyYW5lVGV0aGVycyk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlcGVhdHM7IGkrKykgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhc3MuZW5kKCk7XG4gICAgICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gICAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby50ZXN0RW5jbG9zdXJlID0gKCkgPT4ge1xuICAgICAgaWYgKCFwYXVzZWQpIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGJlZm9yZSBydW5uaW5nIGRlc3RydWN0aXZlIGVuY2xvc3VyZSBmaXh0dXJlc1wiKTtcbiAgICAgIHJldHVybiB0ZXN0RW5jbG9zdXJlKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHsgYWN0aW46IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSwgbWVtYnJhbmU6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSB9LFxuICAgICAgICB7IGFjdGluOiB1bmlmb3Jtcy5hY3RpbkNvdW50LCBtZW1icmFuZTogdW5pZm9ybXMubWVtYnJhbmVDb3VudCB9LFxuICAgICAgICAoKSA9PiBydW5FbmNsb3N1cmUoZGV2aWNlLCBzaW1QaXBlbGluZXMsIGJpbmRHcm91cFNpbXVsYXRlLCBCVUZGRVJfV09SS0dST1VQX0NPVU5ULCBhY3R1YWxIZWlnaHQpLFxuICAgICAgICAoZml4ZWRBcmVhLCBhcmVhKSA9PiB7XG4gICAgICAgICAgdW5pZm9ybXMuZ0FjdGluRmllbGQgPSAxO1xuICAgICAgICAgIHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24gPSBmaXhlZEFyZWEgPyAxIDogMDtcbiAgICAgICAgICB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGggPSBNYXRoLnNxcnQoNCAqIE1hdGguUEkgKiBhcmVhKSAvIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQ7XG4gICAgICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gICAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby50ZXN0TWVjaGFuaWNzID0gKCkgPT4ge1xuICAgICAgaWYgKCFwYXVzZWQpIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGJlZm9yZSBydW5uaW5nIGRlc3RydWN0aXZlIG1lY2hhbmljYWwgZml4dHVyZXNcIik7XG4gICAgICByZXR1cm4gdGVzdE1lY2hhbmljcyhcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICB7XG4gICAgICAgICAgYWN0aW46IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSxcbiAgICAgICAgICBtZW1icmFuZTogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdLFxuICAgICAgICAgIGxpbmtzOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXSxcbiAgICAgICAgICBmb3JjZXM6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfRk9SQ0VTXSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBhY3RpbjogdW5pZm9ybXMuYWN0aW5Db3VudCwgbWVtYnJhbmU6IHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgfSxcbiAgICAgICAgKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgICAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgICAgICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuICAgICAgICAgIGNvbnN0IGNvdW50ID0gTWF0aC5jZWlsKCh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCkgLyBXT1JLR1JPVVBfU0laRSk7XG4gICAgICAgICAgZm9yIChjb25zdCBbcGlwZWxpbmUsIGdyb3Vwc10gb2YgW1xuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5yZXNvbHZlQ3VlLCAxXSxcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIGNvdW50XSxcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMubW90b3JMaW5rcywgMV0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLm1lbWJyYW5lVGV0aGVycywgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORV0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLmFwcGx5TWVjaGFuaWNhbEZvcmNlcywgY291bnRdLFxuICAgICAgICAgIF0gYXMgY29uc3QpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUocGlwZWxpbmUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoZ3JvdXBzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFzcy5lbmQoKTtcbiAgICAgICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICAgIH0sXG4gICAgICAgIChzdHJlbmd0aCwgY291cGxpbmcsIGRyYWcpID0+IHtcbiAgICAgICAgICB1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aCA9IHN0cmVuZ3RoO1xuICAgICAgICAgIHVuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmcgPSBjb3VwbGluZztcbiAgICAgICAgICB1bmlmb3Jtcy5zdWJzdHJhdGVEcmFnID0gZHJhZztcbiAgICAgICAgICB1bmlmb3Jtcy5jdWVFbmFibGVkID0gMDtcbiAgICAgICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgfVxuXG4gIGNvbnN0IHBhdXNlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXVzZS1kZW1vXCIpITtcbiAgcGF1c2VCdXR0b24udGV4dENvbnRlbnQgPSBwYXVzZWQgPyBcIlJlc3VtZVwiIDogXCJQYXVzZVwiO1xuICBwYXVzZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIHNldFBhdXNlZCghcGF1c2VkKTtcbiAgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzZXQtZGVtb1wiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IGxvY2F0aW9uLnJlbG9hZCgpKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbGVhci1jdWVcIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGVhckN1ZSk7XG4gIGNvbnN0IHN0ZXBCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0ZXAtZGVtb1wiKSBhcyBIVE1MQnV0dG9uRWxlbWVudDtcbiAgYXN5bmMgZnVuY3Rpb24gc2luZ2xlU3RlcCgpIHtcbiAgICBpZiAoc3RlcEJ1dHRvbi5kaXNhYmxlZCkgcmV0dXJuO1xuICAgIHN0ZXBCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgIHNldFBhdXNlZCh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby5hZHZhbmNlKDEpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBzdG9wU2ltdWxhdGlvbihlcnJvcik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHN0ZXBCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9XG4gIH1cbiAgc3RlcEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgc2luZ2xlU3RlcCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCAoZXZlbnQpID0+IHtcbiAgICBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiICYmICFzZXR0aW5nc1BhbmVsLmhpZGRlbikge1xuICAgICAgc2V0U2V0dGluZ3MoZmFsc2UpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoZXZlbnQuY3RybEtleSB8fCBldmVudC5tZXRhS2V5IHx8IGV2ZW50LmFsdEtleSkgcmV0dXJuO1xuICAgIGlmICgoZXZlbnQudGFyZ2V0IGFzIEhUTUxFbGVtZW50KT8uY2xvc2VzdChcImlucHV0LHNlbGVjdCx0ZXh0YXJlYSxidXR0b24sW2NvbnRlbnRlZGl0YWJsZT10cnVlXVwiKSB8fCBldmVudC5yZXBlYXQpIHJldHVybjtcbiAgICBpZiAoZXZlbnQuY29kZSA9PT0gXCJTcGFjZVwiKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2V0UGF1c2VkKCFwYXVzZWQpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5LnRvTG93ZXJDYXNlKCkgPT09IFwiblwiKSB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdm9pZCBzaW5nbGVTdGVwKCk7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIpIHtcbiAgICAgIGNsZWFyQ3VlKCk7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkudG9Mb3dlckNhc2UoKSA9PT0gXCJyXCIpIHtcbiAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgIH1cbiAgfSk7XG4gIGZvciAoY29uc3Qga2V5IG9mIFtcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiLCBcIm15b3NpblN0cmVuZ3RoXCIsIFwibWVtYnJhbmVDb3VwbGluZ1wiXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IHNsaWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBsaXZlLSR7a2V5fWApIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY29uc3QgdmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgdmFsdWUtJHtrZXl9YCkhO1xuICAgIHNsaWRlci52YWx1ZSA9IFN0cmluZyh1bmlmb3Jtc1trZXldKTtcbiAgICB2YWx1ZS50ZXh0Q29udGVudCA9IHVuaWZvcm1zW2tleV0udG9GaXhlZChrZXkgPT09IFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIgPyAyIDogMyk7XG4gICAgc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoXCJpbnB1dFwiLCAoKSA9PiB7XG4gICAgICB1bmlmb3Jtc1trZXldID0gTnVtYmVyKHNsaWRlci52YWx1ZSk7XG4gICAgICB2YWx1ZS50ZXh0Q29udGVudCA9IHVuaWZvcm1zW2tleV0udG9GaXhlZChrZXkgPT09IFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIgPyAyIDogMyk7XG4gICAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICAgIH0pO1xuICB9XG4gIGNvbnN0IGFkYXB0aXZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGFwdGl2ZS1mcmFtZXNcIikgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgYWRhcHRpdmUuY2hlY2tlZCA9ICEhdW5pZm9ybXMuYWRhcHRpdmVGcmFtZXM7XG4gIGFkYXB0aXZlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIHVuaWZvcm1zLmFkYXB0aXZlRnJhbWVzID0gYWRhcHRpdmUuY2hlY2tlZCA/IDEgOiAwO1xuICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICB9KTtcbiAgY29uc3QgY2VsbFNpemUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNlbGwtc2l6ZVwiKSBhcyBIVE1MU2VsZWN0RWxlbWVudDtcbiAgY29uc3QgY29tcGFjdExpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBhY3QtZGVtb1wiKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcbiAgY29uc3QgY29tcGFjdFVybCA9IG5ldyBVUkwoY29tcGFjdExpbmsuaHJlZik7XG4gIGNvbXBhY3RVcmwuc2VhcmNoUGFyYW1zLnNldChcInNlZWRcIiwgU3RyaW5nKHNlZWQpKTtcbiAgY29tcGFjdExpbmsuaHJlZiA9IGNvbXBhY3RVcmwudG9TdHJpbmcoKTtcbiAgY29uc3QgcmVuZXdhbExpbmsgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlbmV3YWwtZGVtb1wiKSBhcyBIVE1MQW5jaG9yRWxlbWVudDtcbiAgY29uc3QgcmVuZXdhbFVybCA9IG5ldyBVUkwocmVuZXdhbExpbmsuaHJlZik7XG4gIHJlbmV3YWxVcmwuc2VhcmNoUGFyYW1zLnNldChcInNlZWRcIiwgU3RyaW5nKHNlZWQpKTtcbiAgcmVuZXdhbExpbmsuaHJlZiA9IHJlbmV3YWxVcmwudG9TdHJpbmcoKTtcbiAgY29uc3Qgc2VsZWN0ZWRTaXplID0gU3RyaW5nKHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCk7XG4gIGlmICghWy4uLmNlbGxTaXplLm9wdGlvbnNdLnNvbWUoKG9wdGlvbikgPT4gb3B0aW9uLnZhbHVlID09PSBzZWxlY3RlZFNpemUpKSB7XG4gICAgY2VsbFNpemUuYWRkKG5ldyBPcHRpb24oYCR7TWF0aC5yb3VuZCgxNTAgKiB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpfSUgKGN1c3RvbSlgLCBzZWxlY3RlZFNpemUpKTtcbiAgfVxuICBjZWxsU2l6ZS52YWx1ZSA9IHNlbGVjdGVkU2l6ZTtcbiAgY2VsbFNpemUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwibWVtYnJhbmVSZXN0TGVuZ3RoXCIsIGNlbGxTaXplLnZhbHVlKTtcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV4dC50b1N0cmluZygpO1xuICB9KTtcbiAgZm9yIChjb25zdCBuYW1lIG9mIFtcImdBY3RpbkZpZWxkXCIsIFwiYXJlYUNvbnNlcnZhdGlvblwiXSBhcyBjb25zdCkge1xuICAgIGNvbnN0IGNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQobmFtZSkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjaGVja2JveC5jaGVja2VkID0gdW5pZm9ybXNbbmFtZV0gPiAwO1xuICAgIGNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQobmFtZSwgY2hlY2tib3guY2hlY2tlZCA/IFwiMVwiIDogXCIwXCIpO1xuICAgICAgbG9jYXRpb24uaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgICB9KTtcbiAgfVxuICBjb25zdCBjb3J0ZXhUb2dnbGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvcnRleC10b2dnbGVcIikgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgY29ydGV4VG9nZ2xlLmNoZWNrZWQgPSB1bmlmb3Jtcy5jb3J0ZXhQb2x5bWVyaXphdGlvbiA+IDA7XG4gIGNvcnRleFRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJjb3J0ZXhQb2x5bWVyaXphdGlvblwiLCBjb3J0ZXhUb2dnbGUuY2hlY2tlZCA/IFwiMC4wM1wiIDogXCIwXCIpO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IGBTZWVkICR7c2VlZH0gwrcgbW90b3IgJHt1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aH0gwrcgY291cGxpbmcgJHt1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nfWA7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5jbG9zdXJlLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPVxuICAgIGBHLWFjdGluOiAke3VuaWZvcm1zLmdBY3RpbkZpZWxkID8gXCJjb25zZXJ2ZWQsIHdlbGwtbWl4ZWQgcG9vbFwiIDogXCJsZWdhY3kgcGFydGljbGVzXCJ9IMK3IGFyZWE6ICR7dW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiA/IFwiY29uc3RyYWluZWRcIiA6IFwiZnJlZVwifWA7XG4gIGZvciAoY29uc3QgYW5jaG9yIG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGw8SFRNTEFuY2hvckVsZW1lbnQ+KFwiW2RhdGEtY2FzZV1cIikpIHtcbiAgICBjb25zdCBuZXh0ID0gbmV3IFVSTChhbmNob3IuaHJlZik7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwic2VlZFwiLCBTdHJpbmcoc2VlZCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImNvcnRleFBvbHltZXJpemF0aW9uXCIsIFN0cmluZyh1bmlmb3Jtcy5jb3J0ZXhQb2x5bWVyaXphdGlvbikpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcIm1lbWJyYW5lUmVzdExlbmd0aFwiLCBTdHJpbmcodW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoKSk7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiYWN0aW5Db3VudFwiLCBTdHJpbmcodW5pZm9ybXMuYWN0aW5Db3VudCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImdBY3RpbkZpZWxkXCIsIFN0cmluZyh1bmlmb3Jtcy5nQWN0aW5GaWVsZCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImFyZWFDb25zZXJ2YXRpb25cIiwgU3RyaW5nKHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pKTtcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBbXG4gICAgICBcInBvbGFyaXR5TW9kZVwiLFxuICAgICAgXCJwb2xhcml0eVR1cm5SYXRlXCIsXG4gICAgICBcInJlYXJUdXJub3ZlclwiLFxuICAgICAgXCJ0dXJub3ZlckFnZVwiLFxuICAgICAgXCJ0ZXRoZXJUdXJub3ZlclwiLFxuICAgICAgXCJ0ZXRoZXJPblJhdGVcIixcbiAgICAgIFwidGV0aGVyT2ZmUmF0ZVwiLFxuICAgICAgXCJ0ZXRoZXJSZWNvdmVyeVN0ZXBzXCIsXG4gICAgICBcIm1vdG9yUmVhckJpYXNcIixcbiAgICAgIFwiZnJvbnRBbGlnbm1lbnRcIixcbiAgICAgIFwidGV0aGVyTG9hZE9mZlwiLFxuICAgICAgXCJjb2xvdXJBZ2VcIixcbiAgICBdIGFzIGNvbnN0KVxuICAgICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KGtleSwgU3RyaW5nKHVuaWZvcm1zW2tleV0pKTtcbiAgICBhbmNob3IuaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgICBjb25zdCBhY3RpdmUgPVxuICAgICAgTnVtYmVyKG5leHQuc2VhcmNoUGFyYW1zLmdldChcIm15b3NpblN0cmVuZ3RoXCIpID8/IDApID09PSB1bmlmb3Jtcy5teW9zaW5TdHJlbmd0aCAmJlxuICAgICAgTnVtYmVyKG5leHQuc2VhcmNoUGFyYW1zLmdldChcIm1lbWJyYW5lQ291cGxpbmdcIikgPz8gMCkgPT09IHVuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmcgJiZcbiAgICAgIE51bWJlcihuZXh0LnNlYXJjaFBhcmFtcy5nZXQoXCJtZW1icmFuZVN0aWZmbmVzc1wiKSA/PyAzKSA9PT0gdW5pZm9ybXMubWVtYnJhbmVTdGlmZm5lc3M7XG4gICAgYW5jaG9yLnNldEF0dHJpYnV0ZShcImFyaWEtY3VycmVudFwiLCBTdHJpbmcoYWN0aXZlKSk7XG4gIH1cblxuICAvLyBHVUkgZm9yIGNvbnRyb2xzIGZvciBkZXNrdG9wIG9ubHlcbiAgaWYgKCFpc01vYmlsZURldmljZSkge1xuICAgIGxldCBndWkgPSBuZXcgR1VJKHsgY29udGFpbmVyOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkdmFuY2VkLWNvbnRyb2xzXCIpISB9KTtcblxuICAgIGNvbnN0IG1lY2hhbmljcyA9IGd1aS5hZGRGb2xkZXIoXCJBY3RvbXlvc2luIGh5cG90aGVzaXNcIik7XG4gICAgY29uc3QgcmVuZXdhbCA9IGd1aS5hZGRGb2xkZXIoXCJQb2xhcml0eSBhbmQgcmVuZXdhbFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJwb2xhcml0eU1vZGVcIiwgeyBtYXRlcmlhbFBvbGU6IDAsIHBlcnNpc3RlbnREaXJlY3Rpb246IDEgfSkubmFtZShcIlBvbGFyaXR5IGZyYW1lXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInBvbGFyaXR5VHVyblJhdGVcIiwgMC4wMDEsIDAuMSwgMC4wMDEpLm5hbWUoXCJUdXJuaW5nIC8gc3RlcFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJyZWFyVHVybm92ZXJcIiwgMCwgMC4xLCAwLjAwNSkubmFtZShcIkFnZWQgcmVhciBjbGVhcmFuY2VcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidHVybm92ZXJBZ2VcIiwgMTAwLCAyMDAwLCA1MCkubmFtZShcIkFjdGluIG1hdHVyYXRpb24gc3RlcHNcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwibW90b3JSZWFyQmlhc1wiLCAwLCAxLCAwLjA1KS5uYW1lKFwiTWF0dXJlLXJlYXIgbW90b3IgYmlhc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJmcm9udEFsaWdubWVudFwiLCAwLCAxLCAwLjA1KS5uYW1lKFwiRnJvbnQgZmlsYW1lbnQgYWxpZ25tZW50XCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcImNvbG91ckFnZVwiLCB7IGFzc2VtYmx5UmVjZW5jeTogMCwgYmVhZEFnZTogMSB9KS5uYW1lKFwiQWN0aW4gY29sb3Vyc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0ZXRoZXJUdXJub3ZlclwiLCB7IGltbWVkaWF0ZVJlYmluZGluZzogMCwgZmluaXRlQmluZGluZzogMSB9KS5uYW1lKFwiVGV0aGVyIGtpbmV0aWNzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlck9uUmF0ZVwiLCAwLjAwMSwgMC4xLCAwLjAwMSkubmFtZShcIlRldGhlciBiaW5kaW5nIC8gc3RlcFwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0ZXRoZXJPZmZSYXRlXCIsIDAsIDAuMDIsIDAuMDAxKS5uYW1lKFwiVGV0aGVyIHJlbGVhc2UgLyBzdGVwXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlclJlY292ZXJ5U3RlcHNcIiwgMCwgMzAwLCAxMCkubmFtZShcIlRldGhlciB1bmJvdW5kIGR3ZWxsXCIpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwibXlvc2luU3RyZW5ndGhcIiwgMCwgMC4yLCAwLjAwNSkubmFtZShcIk1vdG9yIGNvbnRyYWN0aWxpdHlcIikubGlzdGVuKCk7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJteW9zaW5TcGVlZFwiLCAwLCAwLjEsIDAuMDA1KS5uYW1lKFwiTGluayBzaG9ydGVuaW5nIC8gc3RlcFwiKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcIm1lbWJyYW5lQ291cGxpbmdcIiwgMCwgMC4yLCAwLjAwNSkubmFtZShcIk1lbWJyYW5lIHRldGhlcnNcIikubGlzdGVuKCk7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJzdWJzdHJhdGVEcmFnXCIsIDAsIDIwLCAwLjUpLm5hbWUoXCJGcm9udCBjbHV0Y2ggZHJhZ1wiKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcImNvcnRleFBvbHltZXJpemF0aW9uXCIsIDAsIDAuMSwgMC4wMDUpLm5hbWUoXCJCYXNhbCBjb3J0ZXggYXNzZW1ibHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtb25vbWVyT3BhY2l0eVwiLCAwLCAxLCAwLjA1KS5uYW1lKFwiTW9ub21lciB2aXNpYmlsaXR5XCIpO1xuXG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJjb21wdXRlU3RlcHNQZXJGcmFtZVwiKS5taW4oMSkubWF4KDc1KS5zdGVwKDEpLm5hbWUoXCJNYXggc3RlcHMgLyBmcmFtZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInRhcmdldEZQU1wiKS5taW4oMSkubWF4KDEyMCkuc3RlcCgxKS5uYW1lKFwiVGFyZ2V0IEZQU1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInN0aWZmbmVzc1wiKS5taW4oMC4wKS5tYXgoMi4wKS5uYW1lKFwiU3RpZmZuZXNzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZm9vZE5lYXJieVRocmVzaG9sZFwiKS5taW4oMC4wMDAwMDAxKS5tYXgoMS4wKS5uYW1lKFwiRm9vZCBOZWFyYnkgVGhyZXNob2xkXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZGlzY29ubmVjdGlvblByb2JhYmlsaXR5XCIpLm1pbigwKS5tYXgoMC45OTkpLm5hbWUoXCJEaXNjb25uZWN0aW9uIHByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3RlcmljU2FtcGxpbmdSYW5nZVwiKS5taW4oMSkubWF4KDUwKS5zdGVwKDEpLm5hbWUoXCJTdGVyaWMgU2FtcGxpbmcgUmFuZ2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpbkNvaGVzaW9uUmFuZ2VcIikubWluKDEpLm1heCgxMDApLnN0ZXAoMSkubmFtZShcIkFjdGluIENvaGVzaW9uIFJhbmdlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYmluZFByb2JcIikubWluKDAuMCkubWF4KDAuMSkuc3RlcCgwLjAwMDEpLm5hbWUoXCJCaW5kIFByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5TdGVyaWNGb3JjZVwiKS5taW4oMC4wKS5tYXgoMS4wKS5uYW1lKFwiQWN0aW4gU3RlcmljIEZvcmNlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5CZW5kU3RpZmZuZXNzXCIpLm1pbigwLjApLm1heCg0LjApLm5hbWUoXCJBY3RpbiBCZW5kIFN0aWZmbmVzc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImFjdGluQ29zc2VyYXRJdGVyYXRpb25zXCIpLm1pbigwKS5tYXgoMTYpLnN0ZXAoMSkubmFtZShcIkFjdGluIENvc3NlcmF0IEl0ZXJhdGlvbnNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzdGVyaWNTZWxmTmVpZ2hib3JzXCIpLm1pbigwKS5tYXgoMTIpLnN0ZXAoMSkubmFtZShcIlN0ZXJpYyBTZWxmIE5laWdoYm9yc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImVxdWlsaWJyaXVtTGluZURpc3RhbmNlXCIpLm1pbigwLjAxKS5tYXgoNi4wKS5uYW1lKFwiRXF1aWxpYnJpdW0gTGluZSBEaXN0YW5jZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInBvbHltZXJSZXB1bHNpb25cIikubWluKDAuMCkubWF4KDEuMCkubmFtZShcIlBvbHltZXIgUmVwdWxzaW9uXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibW9ub21lck1lbWJyYW5lUmVwdWxzaW9uXCIpLm1pbigwLjApLm1heCgyLjApLm5hbWUoXCJNb25vbWVyLU1lbWJyYW5lIFJlcHVsc2lvblwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJpbmRMZW5ndGhGbG9vclwiKS5taW4oMSkubWF4KDY0KS5zdGVwKDEpLm5hbWUoXCJCaW5kIExlbmd0aCBGbG9vclwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJpbmRMZW5ndGhTYXR1cmF0aW9uXCIpLm1pbigxKS5tYXgoNjQpLnN0ZXAoMSkubmFtZShcIkJpbmQgTGVuZ3RoIFNhdHVyYXRpb25cIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtb3ZlbWVudE1vZGVcIikub3B0aW9ucyh7IElkbGU6IDAsIFwiTW92ZSBFYXN0XCI6IDEgfSkubmFtZShcIk1vdmVtZW50IE1vZGVcIik7XG4gICAgLy8gdGhlIG90aGVyIG1lbWJyYW5lIHNldHRpbmdzIGFyZSB0dW5lZCBhbmQgcmFyZWx5IHRvdWNoZWQ7IHRoZXkgY2FuIHN0aWxsIGJlIHNldCBmcm9tIHRoZSBVUkwsIGUuZy4gP21lbWJyYW5lRmxvdz0wLjNcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1lbWJyYW5lU3RpZmZuZXNzXCIpLm1pbigwLjApLm1heCgxMDAuMCkubmFtZShcIk1lbWJyYW5lIFN0aWZmbmVzc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1lbWJyYW5lU21vb3RoaW5nXCIpLm1pbigwLjApLm1heCgwLjUpLm5hbWUoXCJNZW1icmFuZSBTbW9vdGhpbmdcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJwb2x5bWVyaXphdGlvblBhdGNoU2l6ZVwiKS5taW4oMC4wKS5tYXgoMC4yKS5uYW1lKFwiUG9seW1lcml6YXRpb24gUGF0Y2ggU2l6ZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInBvbHltZXJpemF0aW9uRmllbGREZWNheVwiKS5taW4oMC44KS5tYXgoMC45OTkpLnN0ZXAoMC4wMDEpLm5hbWUoXCJQb2x5bWVyaXphdGlvbiBGaWVsZCBEZWNheVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiKS5taW4oMC4wKS5tYXgoMi4wKS5uYW1lKFwiTGFtZWxsaXBvZGl1bSBTdHJlbmd0aFwiKS5saXN0ZW4oKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImxhbWVsbGlwb2RpdW1XaWR0aFwiKS5taW4oMC4wKS5tYXgoMC41KS5uYW1lKFwiTGFtZWxsaXBvZGl1bSBXaWR0aFwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImxhbWVsbGlwb2RpdW1GaWVsZERlY2F5XCIpLm1pbigwLjgpLm1heCgwLjk5OSkuc3RlcCgwLjAwMSkubmFtZShcIkxhbWVsbGlwb2RpdW0gRmllbGQgRGVjYXlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJicmFuY2hQcm9iYWJpbGl0eVwiKS5taW4oMC4wKS5tYXgoMC4yKS5zdGVwKDAuMDAxKS5uYW1lKFwiQnJhbmNoIFByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZGVicmFuY2hQcm9iYWJpbGl0eVwiKS5taW4oMC4wKS5tYXgoMC4wMSkuc3RlcCgwLjAwMDEpLm5hbWUoXCJEZWJyYW5jaCBQcm9iYWJpbGl0eVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dENvdW50XCIpLm1pbigwKS5tYXgoTUFYX1NQUk9VVF9TSVRFUykuc3RlcCgxKS5uYW1lKFwiU3Byb3V0IFNpdGVzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0V2lkdGhcIikubWluKDEpLm1heCgxNikuc3RlcCgxKS5uYW1lKFwiU3Byb3V0IFdpZHRoIChub2RlcylcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRGcm9udEJpYXNcIikubWluKDAuMCkubWF4KDEuMCkubmFtZShcIlNwcm91dCBGcm9udCBCaWFzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0T25TdGVwc1wiKS5taW4oMTAwKS5tYXgoMjAwMDApLnN0ZXAoMTAwKS5uYW1lKFwiU3Byb3V0IE9uIFN0ZXBzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0T2ZmU3RlcHNcIikubWluKDEwMCkubWF4KDIwMDAwKS5zdGVwKDEwMCkubmFtZShcIlNwcm91dCBPZmYgU3RlcHNcIik7XG4gICAgZ3VpLmFkZCh7IGV4ZWN1dGVGdW5jdGlvbjogKCkgPT4gbG9jYXRpb24ucmVsb2FkKCkgfSwgXCJleGVjdXRlRnVuY3Rpb25cIikubmFtZShcIlJlc2V0IHNlZWQgYW5kIGZpZWxkc1wiKTtcbiAgICBndWlcbiAgICAgIC5hZGQoXG4gICAgICAgIHtcbiAgICAgICAgICBwYXVzZTogKCkgPT4ge1xuICAgICAgICAgICAgc2V0UGF1c2VkKCFwYXVzZWQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFwicGF1c2VcIlxuICAgICAgKVxuICAgICAgLm5hbWUoXCJQYXVzZSAvIHJlc3VtZVwiKTtcbiAgICBndWkub25DaGFuZ2UoKCkgPT4ge1xuICAgICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICAgIGRpc3BsYXlDdWUoKTtcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIFtcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiLCBcIm15b3NpblN0cmVuZ3RoXCIsIFwibWVtYnJhbmVDb3VwbGluZ1wiXSBhcyBjb25zdCkge1xuICAgICAgICAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGxpdmUtJHtrZXl9YCkgYXMgSFRNTElucHV0RWxlbWVudCkudmFsdWUgPSBTdHJpbmcodW5pZm9ybXNba2V5XSk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGB2YWx1ZS0ke2tleX1gKSEudGV4dENvbnRlbnQgPSB1bmlmb3Jtc1trZXldLnRvRml4ZWQoa2V5ID09PSBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiID8gMiA6IDMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGd1aS5jbG9zZSgpO1xuICB9XG5cbiAgbGV0IGxhc3RGcmFtZVRpbWUgPSAwO1xuICBzZXRQYXVzZWQocGF1c2VkKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLW5vdGljZVwiKSEuaGlkZGVuID0gdHJ1ZTtcbiAgbGV0IGZyYW1lUGVuZGluZyA9IGZhbHNlO1xuICBjb25zdCBnZXRGcmFtZUludGVydmFsID0gKCkgPT4gMTAwMCAvIHVuaWZvcm1zLnRhcmdldEZQUzsgLy8gQ29udmVydCBGUFMgdG8gbWlsbGlzZWNvbmRzXG5cbiAgZnVuY3Rpb24gZnJhbWUoY3VycmVudFRpbWU6IG51bWJlcikge1xuICAgIGlmICghcGF1c2VkICYmICFyZWNvdmVyeS5hY3RpdmUgJiYgIWZyYW1lUGVuZGluZyAmJiAhbWFudWFsQWR2YW5jZVBlbmRpbmcgJiYgY3VycmVudFRpbWUgLSBsYXN0RnJhbWVUaW1lID49IGdldEZyYW1lSW50ZXJ2YWwoKSAtIDAuNSkge1xuICAgICAgZnJhbWVQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICAgIGlucHV0ID0gbGl2ZVBlcmZvcm1hbmNlLmlucHV0U25hcHNob3QoKTtcbiAgICAgIGNvbnN0IHN0ZXBzID0gdW5pZm9ybXMuYWRhcHRpdmVGcmFtZXMgPyBmcmFtZUJ1ZGdldC5jaG9vc2UodW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWUsIHVuaWZvcm1zLnRhcmdldEZQUykgOiB1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZTtcbiAgICAgIGxldCBlbmNvZGVkQXQgPSBzdGFydDtcbiAgICAgIHRpbWVzdGVwKHN0ZXBzKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgZW5jb2RlZEF0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgcmV0dXJuIGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBkb25lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICAgICAgZnJhbWVCdWRnZXQub2JzZXJ2ZShzdGVwcywgZG9uZSAtIHN0YXJ0LCBlbmNvZGVkQXQgLSBzdGFydCk7XG4gICAgICAgICAgbGl2ZVBlcmZvcm1hbmNlLmZyYW1lKHsgYXQ6IGRvbmUsIHN0ZXBzLCBlbmNvZGVNczogZW5jb2RlZEF0IC0gc3RhcnQsIHF1ZXVlVGFpbE1zOiBkb25lIC0gZW5jb2RlZEF0LCB0b3RhbE1zOiBkb25lIC0gc3RhcnQgfSwgaW5wdXQpO1xuICAgICAgICAgIGNvbnN0IHBlcmYgPSBsaXZlUGVyZm9ybWFuY2Uuc25hcHNob3QoKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIikhLnRleHRDb250ZW50ID0gcGF1c2VkXG4gICAgICAgICAgICA/IGBQYXVzZWQgwrcgc3RlcCAke2ZyYW1lTnJ9YFxuICAgICAgICAgICAgOiBgJHtwZXJmLnJlbmRlckZQUy50b0ZpeGVkKDApfSBGUFMgwrcgJHtwZXJmLnN0ZXBzUGVyU2Vjb25kLnRvRml4ZWQoMCl9IHN0ZXBzL3MgwrcgJHtzdGVwc30gc3RlcCR7c3RlcHMgPT09IDEgPyBcIlwiIDogXCJzXCJ9L2ZyYW1lYDtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKHN0b3BTaW11bGF0aW9uKVxuICAgICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgICAgZnJhbWVQZW5kaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgbGFzdEZyYW1lVGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIH1cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICB9XG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gIHJldHVybjtcbn1cblxuaW5kZXgoKS5jYXRjaCgoZXJyb3IpID0+IHtcbiAgY29uc3Qgc3RhdHVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKTtcbiAgaWYgKHN0YXR1cykgc3RhdHVzLnRleHRDb250ZW50ID0gYFVuYWJsZSB0byBzdGFydCBXZWJHUFU6ICR7U3RyaW5nKGVycm9yKX1gO1xuICBjb25zdCBub3RpY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbW8tbm90aWNlXCIpO1xuICBpZiAobm90aWNlKSB7XG4gICAgbm90aWNlLmhpZGRlbiA9IGZhbHNlO1xuICAgIG5vdGljZS50ZXh0Q29udGVudCA9IGBVbmFibGUgdG8gc3RhcnQgV2ViR1BVOiAke1N0cmluZyhlcnJvcil9YDtcbiAgfVxuICBjb25zb2xlLmVycm9yKGVycm9yKTtcbn0pO1xuIiwiLy8gRXhlY3V0ZWQgb25seSB3aXRoID9tZWNoYW5pY3NUZXN0PTEuIFRlc3RzIHRoZSBhY3R1YWwgV0dTTCBwaXBlbGluZXMgb24gdHdvXG4vLyBleHBsaWNpdCB0d28tYmVhZCBmaWxhbWVudHMgYW5kIG9uZSBtZW1icmFuZSBhdHRhY2htZW50LCBub3QgYSBDUFUgc3Vycm9nYXRlLlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRlc3RNZWNoYW5pY3MoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXI7IGxpbmtzOiBHUFVCdWZmZXI7IGZvcmNlczogR1BVQnVmZmVyIH0sXG4gIGNvdW50czogeyBhY3RpbjogbnVtYmVyOyBtZW1icmFuZTogbnVtYmVyIH0sXG4gIGRpc3BhdGNoOiAoKSA9PiB2b2lkLFxuICBjb25maWd1cmU6IChzdHJlbmd0aDogbnVtYmVyLCBjb3VwbGluZzogbnVtYmVyLCBkcmFnOiBudW1iZXIpID0+IHZvaWRcbikge1xuICBjb25zdCByZXN1bHRzOiB7IG5hbWU6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuIH1bXSA9IFtdO1xuICBjb25zdCBhc3NlcnQgPSAobmFtZTogc3RyaW5nLCBvazogYm9vbGVhbikgPT4ge1xuICAgIHJlc3VsdHMucHVzaCh7IG5hbWUsIHBhc3NlZDogb2sgfSk7XG4gICAgaWYgKCFvaykgdGhyb3cgbmV3IEVycm9yKGBNZWNoYW5pY2FsIGZpeHR1cmUgZmFpbGVkOiAke25hbWV9YCk7XG4gIH07XG4gIGNvbnN0IHJlYWQgPSBhc3luYyAoYnVmZmVyOiBHUFVCdWZmZXIpID0+IHtcbiAgICBjb25zdCBjb3B5ID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IGJ1ZmZlci5zaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB9KTtcbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCAwLCBjb3B5LCAwLCBidWZmZXIuc2l6ZSk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGF3YWl0IGNvcHkubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCBkYXRhID0gY29weS5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApO1xuICAgIGNvcHkudW5tYXAoKTtcbiAgICBjb3B5LmRlc3Ryb3koKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgY29uc3QgZml4dHVyZSA9IGFzeW5jIChzdHJlbmd0aDogbnVtYmVyLCBjb3VwbGluZzogbnVtYmVyLCBkcmFnID0gMCwgZGV0YWNoZWQgPSBmYWxzZSkgPT4ge1xuICAgIGNvbnN0IGFjdGluID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMuYWN0aW4uc2l6ZSk7XG4gICAgY29uc3QgYSA9IG5ldyBVaW50MzJBcnJheShhY3RpbiksXG4gICAgICBhZiA9IG5ldyBGbG9hdDMyQXJyYXkoYWN0aW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHtcbiAgICAgIGFbaSAqIDEwXSA9IGFbaSAqIDEwICsgNl0gPSBhW2kgKiAxMCArIDddID0gaTtcbiAgICAgIGFmW2kgKiAxMCArIDJdID0gYWZbaSAqIDEwICsgM10gPSA1MDA7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICBhZltpICogMTAgKyAyXSA9IFsxMCwgMTIsIDIwLCAxOF1baV07XG4gICAgICBhZltpICogMTAgKyAzXSA9IDEwO1xuICAgICAgYWZbaSAqIDEwICsgNF0gPSBpIDwgMiA/IDEgOiAtMTtcbiAgICAgIGFbaSAqIDEwICsgNl0gPSBpIDwgMiA/IDAgOiAyO1xuICAgICAgYVtpICogMTAgKyA3XSA9IGkgPCAyID8gMSA6IDM7XG4gICAgfVxuICAgIGNvbnN0IG1lbSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLnNpemUpO1xuICAgIGNvbnN0IG1mID0gbmV3IEZsb2F0MzJBcnJheShtZW0pLFxuICAgICAgbXUgPSBuZXcgVWludDMyQXJyYXkobWVtKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgICBtdVtpICogMTBdID0gaTtcbiAgICAgIG11W2kgKiAxMCArIDZdID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG11W2kgKiAxMCArIDddID0gKGkgKyBjb3VudHMubWVtYnJhbmUgLSAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG1mW2kgKiAxMCArIDJdID0gMTAwMDtcbiAgICAgIG1mW2kgKiAxMCArIDNdID0gMTAwMDtcbiAgICB9XG4gICAgbWZbMl0gPSAyNTtcbiAgICBtZlszXSA9IDEwO1xuICAgIG1mWyhjb3VudHMubWVtYnJhbmUgLyAyKSAqIDEwICsgMl0gPSAwO1xuICAgIG1mWyhjb3VudHMubWVtYnJhbmUgLyAyKSAqIDEwICsgM10gPSAxMDtcbiAgICBjb25zdCBsaW5rcyA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmxpbmtzLnNpemUpO1xuICAgIGNvbnN0IGx1ID0gbmV3IFVpbnQzMkFycmF5KGxpbmtzKSxcbiAgICAgIGxmID0gbmV3IEZsb2F0MzJBcnJheShsaW5rcyk7XG4gICAgbHUuc2V0KFsxLCAzLCAwLCAxLCAxLCAwLCAzLCAyXSwgMCk7XG4gICAgbGZbMl0gPSA1O1xuICAgIGx1LnNldChbMywgMCwgMCwgMSwgMywgMiwgMCwgMF0sIDI1NiAqIDgpO1xuICAgIGxmWzI1NiAqIDggKyAyXSA9IDE7XG4gICAgaWYgKGRldGFjaGVkKSB7XG4gICAgICBhWzZdID0gYVs3XSA9IDA7XG4gICAgICBhWzI2XSA9IGFbMjddID0gMjtcbiAgICB9XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMuYWN0aW4sIDAsIGFjdGluKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgbWVtKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5saW5rcywgMCwgbGlua3MpO1xuICAgIGNvbmZpZ3VyZShzdHJlbmd0aCwgY291cGxpbmcsIGRyYWcpO1xuICAgIGRpc3BhdGNoKCk7XG4gICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICByZXR1cm4ge1xuICAgICAgZm9yY2VzOiBuZXcgSW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuZm9yY2VzKSkuc3ViYXJyYXkoMCwgMiAqIChjb3VudHMuYWN0aW4gKyBjb3VudHMubWVtYnJhbmUpKSxcbiAgICAgIGFjdGluOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpLFxuICAgICAgbWVtYnJhbmU6IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLm1lbWJyYW5lKSksXG4gICAgfTtcbiAgfTtcbiAgbGV0IHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLCAwKTtcbiAgYXNzZXJ0KFwib2ZmIGlzIG1lY2hhbmljYWxseSBpbmVydFwiLCBzdGF0ZS5mb3JjZXMuZXZlcnkoKHgpID0+IHggPT09IDApICYmIHN0YXRlLmFjdGluWzJdID09PSAxMCAmJiBzdGF0ZS5tZW1icmFuZVsyXSA9PT0gMjUpO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMCk7XG4gIGFzc2VydChcIm1vdG9yIGNvbnRyYWN0cyBvcHBvc2VkIGZpbGFtZW50c1wiLCBzdGF0ZS5hY3RpblsyXSA+IDEwICYmIHN0YXRlLmFjdGluWzIyXSA8IDIwKTtcbiAgYXNzZXJ0KFwibW90b3Igd2l0aG91dCB0ZXRoZXIgZG9lcyBub3QgbW92ZSBtZW1icmFuZVwiLCBzdGF0ZS5tZW1icmFuZVsyXSA9PT0gMjUpO1xuICBhc3NlcnQoXCJtb3RvciBmb3JjZXMgYXJlIHJlY2lwcm9jYWxcIiwgc3RhdGUuZm9yY2VzWzBdID09PSAtc3RhdGUuZm9yY2VzWzRdICYmIHN0YXRlLmZvcmNlc1swXSA+IDApO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMCwgMC4wNSk7XG4gIGFzc2VydChcInRldGhlciBwdWxscyBtZW1icmFuZSB0b3dhcmQgZmlsYW1lbnRcIiwgc3RhdGUubWVtYnJhbmVbMl0gPCAyNSAmJiBzdGF0ZS5hY3RpblsyMl0gPiAyMCk7XG4gIGFzc2VydChcInRldGhlciByZWFjdGlvbiBhY3RzIG9uIGFjdGluXCIsIHN0YXRlLmZvcmNlc1s0XSA9PT0gLXN0YXRlLmZvcmNlc1tjb3VudHMuYWN0aW4gKiAyXSk7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLjA1LCAwLjA1KTtcbiAgbGV0IGZ4ID0gMCxcbiAgICBmeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RhdGUuZm9yY2VzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgZnggKz0gc3RhdGUuZm9yY2VzW2ldO1xuICAgIGZ5ICs9IHN0YXRlLmZvcmNlc1tpICsgMV07XG4gIH1cbiAgYXNzZXJ0KFwiY29tYmluZWQgaW50ZXJuYWwgZm9yY2Ugc3VtcyB0byB6ZXJvXCIsIGZ4ID09PSAwICYmIGZ5ID09PSAwKTtcbiAgY29uc3QgZnJlZURpc3BsYWNlbWVudCA9IHN0YXRlLmFjdGluWzJdIC0gMTA7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLjA1LCAwLjA1LCA0KTtcbiAgYXNzZXJ0KFwiY2x1dGNoIHJlZHVjZXMgbW90aW9uIHdpdGhvdXQgY2hhbmdpbmcgZ2VuZXJhdGVkIGZvcmNlXCIsIHN0YXRlLmFjdGluWzJdIC0gMTAgPCBmcmVlRGlzcGxhY2VtZW50ICYmIHN0YXRlLmZvcmNlc1swXSA+IDApO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMC4wNSwgMCwgdHJ1ZSk7XG4gIGFzc2VydChcbiAgICBcImRlcG9seW1lcml6ZWQgZW5kcG9pbnRzIHJlbGVhc2UgbW90b3IgYW5kIHRldGhlclwiLFxuICAgIHN0YXRlLmZvcmNlcy5ldmVyeSgoeCkgPT4geCA9PT0gMClcbiAgKTtcbiAgcmV0dXJuIHJlc3VsdHM7XG59XG4iLCIvLyBDb25zZXJ2YXRpdmUgeS1iYW5kIGVkZ2UgaW5kZXguIFByZWRpY2F0ZXMgcmVtYWluIGV4YWN0OyBsb25nIGVkZ2VzIGFyZVxuLy8gcmV0YWluZWQgaW4gYSBnbG9iYWwgbGlzdCBhbmQgbG9uZyBib25kIHF1ZXJpZXMgZmFsbCBiYWNrIHRvIGFsbCBlZGdlcy5cbi8vIE5vIGJvdW5kYXJ5L2NvbGxpc2lvbiBpcyBkaXNjYXJkZWQgdG8gaW1wcm92ZSBkaWFnbm9zdGljIGxhdGVuY3kuXG5jb25zdCBCQU5EID0gNDtcbnR5cGUgRWRnZSA9IHsgeDogbnVtYmVyOyB5OiBudW1iZXI7IGR4OiBudW1iZXI7IGR5OiBudW1iZXI7IGx4OiBudW1iZXI7IGh4OiBudW1iZXI7IGx5OiBudW1iZXI7IGh5OiBudW1iZXIgfTtcbmZ1bmN0aW9uIGVkZ2VJbmRleChtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGU6IG51bWJlciwgcmV2ZXJzZSA9IGZhbHNlKSB7XG4gIGNvbnN0IG4gPSBtZW1icmFuZS5sZW5ndGggLyBzdHJpZGU7XG4gIGNvbnN0IGVkZ2VzOiBFZGdlW10gPSBbXSxcbiAgICByb3dzID0gbmV3IE1hcDxudW1iZXIsIEVkZ2VbXT4oKSxcbiAgICB3aWRlOiBFZGdlW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICBjb25zdCBqID0gKGkgKyAocmV2ZXJzZSA/IG4gLSAxIDogMSkpICUgbjtcbiAgICBjb25zdCB4ID0gbWVtYnJhbmVbaSAqIHN0cmlkZSArIDJdLFxuICAgICAgeSA9IG1lbWJyYW5lW2kgKiBzdHJpZGUgKyAzXSxcbiAgICAgIGJ4ID0gbWVtYnJhbmVbaiAqIHN0cmlkZSArIDJdLFxuICAgICAgYnkgPSBtZW1icmFuZVtqICogc3RyaWRlICsgM107XG4gICAgaWYgKCFbeCwgeSwgYngsIGJ5XS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJOb24tZmluaXRlIG1lbWJyYW5lIGdlb21ldHJ5XCIpO1xuICAgIGNvbnN0IGUgPSB7IHgsIHksIGR4OiBieCAtIHgsIGR5OiBieSAtIHksIGx4OiBNYXRoLm1pbih4LCBieCksIGh4OiBNYXRoLm1heCh4LCBieCksIGx5OiBNYXRoLm1pbih5LCBieSksIGh5OiBNYXRoLm1heCh5LCBieSkgfTtcbiAgICBlZGdlcy5wdXNoKGUpO1xuICAgIGNvbnN0IGxvdyA9IE1hdGguZmxvb3IoZS5seSAvIEJBTkQpLFxuICAgICAgaGlnaCA9IE1hdGguZmxvb3IoZS5oeSAvIEJBTkQpO1xuICAgIGlmIChoaWdoIC0gbG93ID4gMjU2KSB7XG4gICAgICB3aWRlLnB1c2goZSk7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgZm9yIChsZXQgcm93ID0gbG93OyByb3cgPD0gaGlnaDsgcm93KyspIHtcbiAgICAgIGNvbnN0IGxpc3QgPSByb3dzLmdldChyb3cpO1xuICAgICAgaWYgKGxpc3QpIGxpc3QucHVzaChlKTtcbiAgICAgIGVsc2Ugcm93cy5zZXQocm93LCBbZV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4geyBlZGdlcywgcm93cywgd2lkZSB9O1xufVxuXG4vLyBMZWdhY3kgcGFydGljbGUgY291bnRzIHVzZSBwaXhlbC1yb3cgc2FtcGxpbmc7IGV4cGxpY2l0LWZpbGFtZW50IG1vZGUgdXNlc1xuLy8gZXhhY3QgeSBjb29yZGluYXRlcy4gVGhlIGdlb21ldHJ5IGZvcm11bGEvb3JkZXIgbWF0Y2hlcyB0aGUgcHJpb3IgZnVsbCBzY2FuLlxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb25PY2N1cGFuY3kobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTAsIGV4YWN0ID0gZmFsc2UpIHtcbiAgY29uc3QgeyByb3dzLCB3aWRlIH0gPSBlZGdlSW5kZXgobWVtYnJhbmUsIHN0cmlkZSwgdHJ1ZSk7XG4gIGNvbnN0IGNhY2hlID0gbmV3IE1hcDxudW1iZXIsIG51bWJlcltdPigpO1xuICByZXR1cm4gKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoeCkgfHwgIU51bWJlci5pc0Zpbml0ZSh5KSkgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IHJvdyA9IE1hdGguZmxvb3IoeSksXG4gICAgICBzY2FuWSA9IGV4YWN0ID8geSA6IHJvdyArIDAuNTtcbiAgICBjb25zdCBjYW5kaWRhdGVzID0gcm93cy5nZXQoTWF0aC5mbG9vcihzY2FuWSAvIEJBTkQpKSA/PyBbXTtcbiAgICBpZiAoZXhhY3QpIHtcbiAgICAgIGxldCBpbnNpZGUgPSBmYWxzZTtcbiAgICAgIGZvciAoY29uc3QgbGlzdCBvZiBbY2FuZGlkYXRlcywgd2lkZV0pXG4gICAgICAgIGZvciAoY29uc3QgZSBvZiBsaXN0KSB7XG4gICAgICAgICAgaWYgKGUueSA+IHNjYW5ZICE9IGUueSArIGUuZHkgPiBzY2FuWSAmJiBlLnggKyAoKHNjYW5ZIC0gZS55KSAqIGUuZHgpIC8gZS5keSA8PSB4KSBpbnNpZGUgPSAhaW5zaWRlO1xuICAgICAgICB9XG4gICAgICByZXR1cm4gaW5zaWRlO1xuICAgIH1cbiAgICBsZXQgY3Jvc3NpbmdzID0gY2FjaGUuZ2V0KHJvdyk7XG4gICAgaWYgKCFjcm9zc2luZ3MpIHtcbiAgICAgIGNyb3NzaW5ncyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBsaXN0IG9mIFtjYW5kaWRhdGVzLCB3aWRlXSlcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgICBpZiAoZS55ID4gc2NhblkgIT0gZS55ICsgZS5keSA+IHNjYW5ZKSBjcm9zc2luZ3MucHVzaChlLnggKyAoKHNjYW5ZIC0gZS55KSAqIGUuZHgpIC8gZS5keSk7XG4gICAgICAgIH1cbiAgICAgIGNyb3NzaW5ncy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgICBjYWNoZS5zZXQocm93LCBjcm9zc2luZ3MpO1xuICAgIH1cbiAgICBsZXQgbG8gPSAwLFxuICAgICAgaGkgPSBjcm9zc2luZ3MubGVuZ3RoO1xuICAgIHdoaWxlIChsbyA8IGhpKSB7XG4gICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICBpZiAoY3Jvc3NpbmdzW21pZF0gPD0geCkgbG8gPSBtaWQgKyAxO1xuICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvICUgMiA9PT0gMTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvbHlnb25Cb25kQ3Jvc3NpbmcobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlID0gMTApIHtcbiAgY29uc3QgeyBlZGdlcywgcm93cywgd2lkZSB9ID0gZWRnZUluZGV4KG1lbWJyYW5lLCBzdHJpZGUpO1xuICByZXR1cm4gKGF4OiBudW1iZXIsIGF5OiBudW1iZXIsIGJ4OiBudW1iZXIsIGJ5OiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBkeCA9IGJ4IC0gYXgsXG4gICAgICBkeSA9IGJ5IC0gYXksXG4gICAgICBtaW5YID0gTWF0aC5taW4oYXgsIGJ4KSxcbiAgICAgIG1heFggPSBNYXRoLm1heChheCwgYngpLFxuICAgICAgbWluWSA9IE1hdGgubWluKGF5LCBieSksXG4gICAgICBtYXhZID0gTWF0aC5tYXgoYXksIGJ5KTtcbiAgICBjb25zdCBjcm9zc2VzID0gKGxpc3Q6IEVkZ2VbXSkgPT4ge1xuICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgaWYgKG1heFggPCBlLmx4IHx8IG1pblggPiBlLmh4IHx8IG1heFkgPCBlLmx5IHx8IG1pblkgPiBlLmh5KSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgZGVub21pbmF0b3IgPSBkeCAqIGUuZHkgLSBkeSAqIGUuZHg7XG4gICAgICAgIGlmIChNYXRoLmFicyhkZW5vbWluYXRvcikgPCAxZS04KSBjb250aW51ZTtcbiAgICAgICAgY29uc3QgdCA9ICgoZS54IC0gYXgpICogZS5keSAtIChlLnkgLSBheSkgKiBlLmR4KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBjb25zdCB1ID0gKChlLnggLSBheCkgKiBkeSAtIChlLnkgLSBheSkgKiBkeCkgLyBkZW5vbWluYXRvcjtcbiAgICAgICAgaWYgKHQgPiAxZS01ICYmIHQgPCAxIC0gMWUtNSAmJiB1ID49IDAgJiYgdSA8PSAxKSByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIGNvbnN0IGxvdyA9IE1hdGguZmxvb3IobWluWSAvIEJBTkQpLFxuICAgICAgaGlnaCA9IE1hdGguZmxvb3IobWF4WSAvIEJBTkQpO1xuICAgIGlmIChoaWdoIC0gbG93ID4gMikgcmV0dXJuIGNyb3NzZXMoZWRnZXMpO1xuICAgIGlmIChjcm9zc2VzKHdpZGUpKSByZXR1cm4gdHJ1ZTtcbiAgICBmb3IgKGxldCByb3cgPSBsb3c7IHJvdyA8PSBoaWdoOyByb3crKykgaWYgKGNyb3NzZXMocm93cy5nZXQocm93KSA/PyBbXSkpIHJldHVybiB0cnVlO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcbn1cbiIsIi8vIFNlcGFyYXRlIHNlZWRlZCBzdHJlYW1zIGZvciBpbml0aWFsIHBvc2l0aW9ucy9rZXlzIGFuZCBDUFUgc3Byb3V0IHNjaGVkdWxpbmcuXG4vLyBHUFUgaW4tcGxhY2Uga2VybmVscyBpbmhlcml0ZWQgZnJvbSB0aGUgcHJvdG90eXBlIGFyZSBub3QgYml0d2lzZSBkZXRlcm1pbmlzdGljLlxuZXhwb3J0IGZ1bmN0aW9uIHNlZWRlZFJhbmRvbShzZWVkOiBudW1iZXIpOiAoKSA9PiBudW1iZXIge1xuICBsZXQgc3RhdGUgPSBzZWVkID4+PiAwO1xuICByZXR1cm4gKCkgPT4ge1xuICAgIHN0YXRlID0gKHN0YXRlICsgMHg2ZDJiNzlmNSkgPj4+IDA7XG4gICAgbGV0IHQgPSBNYXRoLmltdWwoc3RhdGUgXiAoc3RhdGUgPj4+IDE1KSwgc3RhdGUgfCAxKTtcbiAgICB0IF49IHQgKyBNYXRoLmltdWwodCBeICh0ID4+PiA3KSwgdCB8IDYxKTtcbiAgICByZXR1cm4gKCh0IF4gKHQgPj4+IDE0KSkgPj4+IDApIC8gNDI5NDk2NzI5NjtcbiAgfTtcbn1cbiIsImV4cG9ydCBjbGFzcyBGcmFtZUJ1ZGdldCB7XG4gIHByaXZhdGUgc3RlcE1zID0gNDtcbiAgcHJpdmF0ZSBvdmVyaGVhZE1zID0gMjtcbiAgY2hvb3NlKG1heFN0ZXBzOiBudW1iZXIsIHRhcmdldEZQUzogbnVtYmVyKSB7XG4gICAgY29uc3QgYnVkZ2V0ID0gTWF0aC5tYXgoMSwgMTAwMCAvIE1hdGgubWF4KDEsIHRhcmdldEZQUykgLSAyIC0gdGhpcy5vdmVyaGVhZE1zKTtcbiAgICByZXR1cm4gTWF0aC5tYXgoMSwgTWF0aC5taW4oTWF0aC5mbG9vcihtYXhTdGVwcyksIE1hdGguZmxvb3IoYnVkZ2V0IC8gTWF0aC5tYXgoMC4xLCB0aGlzLnN0ZXBNcykpKSk7XG4gIH1cbiAgb2JzZXJ2ZShzdGVwczogbnVtYmVyLCB0b3RhbE1zOiBudW1iZXIsIGVuY29kZU1zOiBudW1iZXIpIHtcbiAgICAvLyBGaXhlZCBwaHlzaWNhbCBzdGVwczsgYWRhcHQgYmF0Y2hpbmcgb25seSwgbmV2ZXIgZHQgb3Igc29sdmVyIGl0ZXJhdGlvbnMuXG4gICAgdGhpcy5zdGVwTXMgPSAwLjggKiB0aGlzLnN0ZXBNcyArIDAuMiAqIE1hdGgubWF4KDAuMSwgKHRvdGFsTXMgLSB0aGlzLm92ZXJoZWFkTXMpIC8gc3RlcHMpO1xuICAgIHRoaXMub3ZlcmhlYWRNcyA9IDAuOSAqIHRoaXMub3ZlcmhlYWRNcyArIDAuMSAqIE1hdGgubWluKDMsIGVuY29kZU1zIC8gTWF0aC5tYXgoMSwgc3RlcHMpKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBGcmFtZVNhbXBsZSA9IHsgYXQ6IG51bWJlcjsgc3RlcHM6IG51bWJlcjsgZW5jb2RlTXM6IG51bWJlcjsgcXVldWVUYWlsTXM6IG51bWJlcjsgdG90YWxNczogbnVtYmVyIH07XG5mdW5jdGlvbiBkaXN0cmlidXRpb24odmFsdWVzOiBudW1iZXJbXSkge1xuICBjb25zdCBzb3J0ZWQgPSBbLi4udmFsdWVzXS5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIHJldHVybiBzb3J0ZWQubGVuZ3RoXG4gICAgPyB7IG1lZGlhbjogc29ydGVkW3NvcnRlZC5sZW5ndGggPj4gMV0sIHA5NTogc29ydGVkW01hdGgubWluKHNvcnRlZC5sZW5ndGggLSAxLCBNYXRoLmZsb29yKHNvcnRlZC5sZW5ndGggKiAwLjk1KSldLCBtYXg6IHNvcnRlZC5hdCgtMSkgfVxuICAgIDogbnVsbDtcbn1cbmV4cG9ydCBjbGFzcyBMaXZlUGVyZm9ybWFuY2Uge1xuICBwcml2YXRlIGZyYW1lczogRnJhbWVTYW1wbGVbXSA9IFtdO1xuICBwcml2YXRlIGlucHV0czogbnVtYmVyW10gPSBbXTtcbiAgaW5wdXRWZXJzaW9uID0gMDtcbiAgcHJpdmF0ZSBwcm9jZXNzZWRWZXJzaW9uID0gMDtcbiAgcHJpdmF0ZSBpbnB1dEF0ID0gMDtcbiAgY29hbGVzY2VkSW5wdXRzID0gMDtcbiAgaW5wdXQoKSB7XG4gICAgdGhpcy5pbnB1dEF0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgcmV0dXJuICsrdGhpcy5pbnB1dFZlcnNpb247XG4gIH1cbiAgaW5wdXRTbmFwc2hvdCgpIHtcbiAgICByZXR1cm4geyB2ZXJzaW9uOiB0aGlzLmlucHV0VmVyc2lvbiwgYXQ6IHRoaXMuaW5wdXRBdCB9O1xuICB9XG4gIGZyYW1lKHNhbXBsZTogRnJhbWVTYW1wbGUsIGlucHV0OiB7IHZlcnNpb246IG51bWJlcjsgYXQ6IG51bWJlciB9KSB7XG4gICAgdGhpcy5mcmFtZXMucHVzaChzYW1wbGUpO1xuICAgIGlmICh0aGlzLmZyYW1lcy5sZW5ndGggPiA2MDApIHRoaXMuZnJhbWVzLnNoaWZ0KCk7XG4gICAgaWYgKGlucHV0LnZlcnNpb24gPiB0aGlzLnByb2Nlc3NlZFZlcnNpb24pIHtcbiAgICAgIHRoaXMuY29hbGVzY2VkSW5wdXRzICs9IE1hdGgubWF4KDAsIGlucHV0LnZlcnNpb24gLSB0aGlzLnByb2Nlc3NlZFZlcnNpb24gLSAxKTtcbiAgICAgIHRoaXMucHJvY2Vzc2VkVmVyc2lvbiA9IGlucHV0LnZlcnNpb247XG4gICAgICB0aGlzLmlucHV0cy5wdXNoKHNhbXBsZS5hdCAtIGlucHV0LmF0KTtcbiAgICAgIGlmICh0aGlzLmlucHV0cy5sZW5ndGggPiAyNTYpIHRoaXMuaW5wdXRzLnNoaWZ0KCk7XG4gICAgfVxuICB9XG4gIGNsZWFyRnJhbWVzKCkge1xuICAgIHRoaXMuZnJhbWVzLmxlbmd0aCA9IDA7XG4gIH1cbiAgc25hcHNob3QoKSB7XG4gICAgY29uc3QgZnJhbWVzID0gdGhpcy5mcmFtZXMsXG4gICAgICBzcGFuID0gZnJhbWVzLmxlbmd0aCA+IDEgPyAoZnJhbWVzLmF0KC0xKSEuYXQgLSBmcmFtZXNbMF0uYXQpIC8gMTAwMCA6IDA7XG4gICAgY29uc3QgaW50ZXJ2YWxzID0gZnJhbWVzLnNsaWNlKDEpLm1hcCgoZiwgaSkgPT4gZi5hdCAtIGZyYW1lc1tpXS5hdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHdpbmRvd0ZyYW1lczogZnJhbWVzLmxlbmd0aCxcbiAgICAgIHJlbmRlckZQUzogc3BhbiA/IChmcmFtZXMubGVuZ3RoIC0gMSkgLyBzcGFuIDogMCxcbiAgICAgIHN0ZXBzUGVyU2Vjb25kOiBzcGFuID8gZnJhbWVzLnNsaWNlKDEpLnJlZHVjZSgobiwgZikgPT4gbiArIGYuc3RlcHMsIDApIC8gc3BhbiA6IDAsXG4gICAgICBmcmFtZUludGVydmFsTXM6IGRpc3RyaWJ1dGlvbihpbnRlcnZhbHMpLFxuICAgICAgZW5jb2RlTXM6IGRpc3RyaWJ1dGlvbihmcmFtZXMubWFwKChmKSA9PiBmLmVuY29kZU1zKSksXG4gICAgICBxdWV1ZVRhaWxNczogZGlzdHJpYnV0aW9uKGZyYW1lcy5tYXAoKGYpID0+IGYucXVldWVUYWlsTXMpKSxcbiAgICAgIGlucHV0VG9Db21wbGV0ZWRGcmFtZU1zOiBkaXN0cmlidXRpb24odGhpcy5pbnB1dHMpLFxuICAgICAgY29hbGVzY2VkSW5wdXRzOiB0aGlzLmNvYWxlc2NlZElucHV0cyxcbiAgICB9O1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgUmVuZGVyTW9kdWxlIHtcbiAgcHJpdmF0ZSBkZXZpY2U6IEdQVURldmljZTtcbiAgcHJpdmF0ZSBjYW52YXNGb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQ7XG5cbiAgLy8gUmVuZGVyaW5nIHJlc291cmNlc1xuICBwcml2YXRlIGludGVybWVkaWF0ZVRleHR1cmU6IEdQVVRleHR1cmU7XG4gIHByaXZhdGUgY29tcHV0ZVJlbmRlclBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmU7XG4gIHByaXZhdGUgcmVuZGVyUGlwZWxpbmU6IEdQVVJlbmRlclBpcGVsaW5lO1xuICBwcml2YXRlIGJpbmRHcm91cFBvc3RQcm9jZXNzOiBHUFVCaW5kR3JvdXA7XG4gIHByaXZhdGUgcmVuZGVyQmluZEdyb3VwOiBHUFVCaW5kR3JvdXA7XG4gIHByaXZhdGUgc3BlY2ltZW5QaXBlbGluZTogR1BVQ29tcHV0ZVBpcGVsaW5lO1xuICBwcml2YXRlIHNwZWNpbWVuQmluZEdyb3VwOiBHUFVCaW5kR3JvdXA7XG4gIHByaXZhdGUgdmlld0J1ZmZlcjogR1BVQnVmZmVyO1xuICBwcml2YXRlIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbiAgcmVhZG9ubHkgdmlldyA9IHsgbW9kZTogMSwgem9vbTogMywgZm9jdXM6IDAuMTUsIGNvbnRyYXN0OiAxLjIsIGNocm9tYTogMC40NSwgZ3JhaW46IDAuNiwgZm9sbG93OiB0cnVlLCBhdXRvRml0OiB0cnVlIH07XG4gIHJlYWRvbmx5IGNhbWVyYTogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuICBwcml2YXRlIGNhbWVyYVRhcmdldDogeyB4OiBudW1iZXI7IHk6IG51bWJlciB9O1xuXG4gIHByaXZhdGUgZXh0ZW50ID0geyB3aWR0aDogMjAwLCBoZWlnaHQ6IDIwMCB9O1xuICBzZXRDZWxsQm91bmRzKGxlZnQ6IG51bWJlciwgcmlnaHQ6IG51bWJlciwgdG9wOiBudW1iZXIsIGJvdHRvbTogbnVtYmVyKSB7XG4gICAgaWYgKCFbbGVmdCwgcmlnaHQsIHRvcCwgYm90dG9tXS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpIHx8IHJpZ2h0IDw9IGxlZnQgfHwgYm90dG9tIDw9IHRvcCkgcmV0dXJuO1xuICAgIHRoaXMuY2FtZXJhVGFyZ2V0ID0geyB4OiAobGVmdCArIHJpZ2h0KSAvIDIsIHk6ICh0b3AgKyBib3R0b20pIC8gMiB9O1xuICAgIHRoaXMuZXh0ZW50ID0geyB3aWR0aDogcmlnaHQgLSBsZWZ0LCBoZWlnaHQ6IGJvdHRvbSAtIHRvcCB9O1xuICB9XG4gIHByaXZhdGUgZml0dGVkWm9vbSgpIHtcbiAgICByZXR1cm4gTWF0aC5tYXgoMC4yLCBNYXRoLm1pbigzLjgsICh3aW5kb3cuaW5uZXJXaWR0aCAqIDAuNzYpIC8gdGhpcy5leHRlbnQud2lkdGgsIChNYXRoLm1heCgxMDAsIHdpbmRvdy5pbm5lckhlaWdodCAtIDE2MCkgKiAwLjc4KSAvIHRoaXMuZXh0ZW50LmhlaWdodCkpO1xuICB9XG4gIGZpdEltbWVkaWF0ZWx5KCkge1xuICAgIGlmICh0aGlzLnZpZXcuYXV0b0ZpdCkgdGhpcy52aWV3Lnpvb20gPSB0aGlzLmZpdHRlZFpvb20oKTtcbiAgICBpZiAodGhpcy52aWV3LmZvbGxvdykgT2JqZWN0LmFzc2lnbih0aGlzLmNhbWVyYSwgdGhpcy5jYW1lcmFUYXJnZXQpO1xuICB9XG4gIHByaXZhdGUgc2NyZWVuU2NhbGUoKSB7XG4gICAgcmV0dXJuIHsgeDogKHRoaXMudmlldy56b29tICogdGhpcy5zaXplLndpZHRoKSAvIHdpbmRvdy5pbm5lcldpZHRoLCB5OiAodGhpcy52aWV3Lnpvb20gKiB0aGlzLnNpemUuaGVpZ2h0KSAvIHdpbmRvdy5pbm5lckhlaWdodCB9O1xuICB9XG4gIHNjcmVlblRvV29ybGQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBpZiAoIXRoaXMudmlldy5tb2RlKSByZXR1cm4geyB4LCB5IH07XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjcmVlblNjYWxlKCk7XG4gICAgcmV0dXJuIHsgeDogdGhpcy5jYW1lcmEueCArICh4IC0gdGhpcy5zaXplLndpZHRoIC8gMikgLyBzY2FsZS54LCB5OiB0aGlzLmNhbWVyYS55ICsgKHkgLSB0aGlzLnNpemUuaGVpZ2h0IC8gMikgLyBzY2FsZS55IH07XG4gIH1cbiAgd29ybGRUb1NjcmVlbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICghdGhpcy52aWV3Lm1vZGUpIHJldHVybiB7IHgsIHkgfTtcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NyZWVuU2NhbGUoKTtcbiAgICByZXR1cm4geyB4OiAoeCAtIHRoaXMuY2FtZXJhLngpICogc2NhbGUueCArIHRoaXMuc2l6ZS53aWR0aCAvIDIsIHk6ICh5IC0gdGhpcy5jYW1lcmEueSkgKiBzY2FsZS55ICsgdGhpcy5zaXplLmhlaWdodCAvIDIgfTtcbiAgfVxuXG4gIHByaXZhdGUgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQ6IFtudW1iZXIsIG51bWJlcl07XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIGRldmljZTogR1BVRGV2aWNlLFxuICAgIGNhbnZhc0Zvcm1hdDogR1BVVGV4dHVyZUZvcm1hdCxcbiAgICBjYW52YXNTaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0sXG4gICAgcmVuZGVyU2hhZGVyOiBHUFVTaGFkZXJNb2R1bGUsXG4gICAgdGV4dHVyZXM6IHtcbiAgICAgIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbiAgICB9LFxuICAgIHNoYXJlZExheW91dEVudHJpZXM6IEdQVUJpbmRHcm91cExheW91dEVudHJ5W10sXG4gICAgc2hhcmVkQmluZEdyb3VwRW50cmllczogR1BVQmluZEdyb3VwRW50cnlbXSxcbiAgICBnZW9tZXRyeTogR1BVQnVmZmVyQmluZGluZ1xuICApIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLmNhbnZhc0Zvcm1hdCA9IGNhbnZhc0Zvcm1hdDtcbiAgICB0aGlzLnNpemUgPSBjYW52YXNTaXplO1xuICAgIHRoaXMuY2FtZXJhID0geyB4OiBjYW52YXNTaXplLndpZHRoIC8gMiwgeTogY2FudmFzU2l6ZS5oZWlnaHQgLyAyIH07XG4gICAgdGhpcy5jYW1lcmFUYXJnZXQgPSB7IC4uLnRoaXMuY2FtZXJhIH07XG4gICAgdGhpcy5URVhUVVJFX1dPUktHUk9VUF9DT1VOVCA9IFtNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS53aWR0aCAvIDE2KSwgTWF0aC5jZWlsKHRleHR1cmVzLnNpemUuaGVpZ2h0IC8gMTYpXTtcblxuICAgIGNvbnN0IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUgPSAxMDtcbiAgICB0aGlzLnZpZXdCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogNDgsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5VTklGT1JNIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfSk7XG4gICAgY29uc3Qgc3BlY2ltZW4gPSBkZXZpY2UuY3JlYXRlVGV4dHVyZSh7XG4gICAgICBzaXplOiBbdGV4dHVyZXMuc2l6ZS53aWR0aCwgdGV4dHVyZXMuc2l6ZS5oZWlnaHRdLFxuICAgICAgZm9ybWF0OiBcInJnYmExNmZsb2F0XCIsXG4gICAgICB1c2FnZTogR1BVVGV4dHVyZVVzYWdlLlNUT1JBR0VfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5URVhUVVJFX0JJTkRJTkcsXG4gICAgfSk7XG4gICAgY29uc3Qgc3BlY2ltZW5WaWV3ID0gc3BlY2ltZW4uY3JlYXRlVmlldygpO1xuICAgIGNvbnN0IHNwZWNpbWVuTGF5b3V0ID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIC4uLnNoYXJlZExheW91dEVudHJpZXMsXG4gICAgICAgIHsgYmluZGluZzogMTMsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjogeyB0eXBlOiBcInJlYWQtb25seS1zdG9yYWdlXCIgfSB9LFxuICAgICAgICB7IGJpbmRpbmc6IDE2LCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFLCBzdG9yYWdlVGV4dHVyZTogeyBhY2Nlc3M6IFwid3JpdGUtb25seVwiLCBmb3JtYXQ6IFwicmdiYTE2ZmxvYXRcIiB9IH0sXG4gICAgICBdLFxuICAgIH0pO1xuICAgIHRoaXMuc3BlY2ltZW5CaW5kR3JvdXAgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgIGxheW91dDogc3BlY2ltZW5MYXlvdXQsXG4gICAgICBlbnRyaWVzOiBbLi4uc2hhcmVkQmluZEdyb3VwRW50cmllcywgeyBiaW5kaW5nOiAxMywgcmVzb3VyY2U6IGdlb21ldHJ5IH0sIHsgYmluZGluZzogMTYsIHJlc291cmNlOiBzcGVjaW1lblZpZXcgfV0sXG4gICAgfSk7XG4gICAgdGhpcy5zcGVjaW1lblBpcGVsaW5lID0gZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgICBsYXlvdXQ6IGRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7IGJpbmRHcm91cExheW91dHM6IFtzcGVjaW1lbkxheW91dF0gfSksXG4gICAgICBjb21wdXRlOiB7IG1vZHVsZTogcmVuZGVyU2hhZGVyLCBlbnRyeVBvaW50OiBcImJ1aWxkX3NwZWNpbWVuXCIgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZSA9IHRoaXMuZGV2aWNlLmNyZWF0ZVRleHR1cmUoe1xuICAgICAgc2l6ZTogW2NhbnZhc1NpemUud2lkdGgsIGNhbnZhc1NpemUuaGVpZ2h0XSxcbiAgICAgIGZvcm1hdDogXCJyZ2JhOHVub3JtXCIsXG4gICAgICB1c2FnZTogR1BVVGV4dHVyZVVzYWdlLlNUT1JBR0VfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5URVhUVVJFX0JJTkRJTkcgfCBHUFVUZXh0dXJlVXNhZ2UuQ09QWV9TUkMsXG4gICAgfSk7XG5cbiAgICBjb25zdCBiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2VzcyA9IHRoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICBsYWJlbDogXCJiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2Vzc1wiLFxuICAgICAgZW50cmllczogW1xuICAgICAgICAuLi5zaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgICAgICB7IGJpbmRpbmc6IDExLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFLCB0ZXh0dXJlOiB7IHNhbXBsZVR5cGU6IFwiZmxvYXRcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMTIsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIHNhbXBsZXI6IHsgdHlwZTogXCJmaWx0ZXJpbmdcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMTcsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIGJ1ZmZlcjogeyB0eXBlOiBcInVuaWZvcm1cIiB9IH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiaW5kaW5nOiBCSU5ESU5HX0lOVEVSTUVESUFURV9URVhUVVJFLFxuICAgICAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCxcbiAgICAgICAgICBzdG9yYWdlVGV4dHVyZToge1xuICAgICAgICAgICAgYWNjZXNzOiBcIndyaXRlLW9ubHlcIixcbiAgICAgICAgICAgIGZvcm1hdDogXCJyZ2JhOHVub3JtXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmJpbmRHcm91cFBvc3RQcm9jZXNzID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgIGxhYmVsOiBgQmluZCBHcm91cCBQb3N0IFByb2Nlc3NgLFxuICAgICAgbGF5b3V0OiBiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2VzcyxcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgLi4uc2hhcmVkQmluZEdyb3VwRW50cmllcyxcbiAgICAgICAgeyBiaW5kaW5nOiAxMSwgcmVzb3VyY2U6IHNwZWNpbWVuVmlldyB9LFxuICAgICAgICB7IGJpbmRpbmc6IDEyLCByZXNvdXJjZTogZGV2aWNlLmNyZWF0ZVNhbXBsZXIoeyBtYWdGaWx0ZXI6IFwibGluZWFyXCIsIG1pbkZpbHRlcjogXCJsaW5lYXJcIiB9KSB9LFxuICAgICAgICB7IGJpbmRpbmc6IDE3LCByZXNvdXJjZTogeyBidWZmZXI6IHRoaXMudmlld0J1ZmZlciB9IH0sXG4gICAgICAgIHtcbiAgICAgICAgICBiaW5kaW5nOiBCSU5ESU5HX0lOVEVSTUVESUFURV9URVhUVVJFLFxuICAgICAgICAgIHJlc291cmNlOiB0aGlzLmludGVybWVkaWF0ZVRleHR1cmUuY3JlYXRlVmlldygpLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3MgPSB0aGlzLmRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XG4gICAgICBsYWJlbDogXCJwaXBlbGluZUxheW91dFBvc3RQcm9jZXNzXCIsXG4gICAgICBiaW5kR3JvdXBMYXlvdXRzOiBbYmluZEdyb3VwTGF5b3V0UG9zdFByb2Nlc3NdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5jb21wdXRlUmVuZGVyUGlwZWxpbmUgPSB0aGlzLmRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoe1xuICAgICAgbGF5b3V0OiBwaXBlbGluZUxheW91dFBvc3RQcm9jZXNzLFxuICAgICAgY29tcHV0ZTogeyBtb2R1bGU6IHJlbmRlclNoYWRlciwgZW50cnlQb2ludDogXCJyZW5kZXJcIiB9LFxuICAgIH0pO1xuXG4gICAgY29uc3Qgc2NyZWVuU2FtcGxlciA9IHRoaXMuZGV2aWNlLmNyZWF0ZVNhbXBsZXIoe1xuICAgICAgbWFnRmlsdGVyOiBcIm5lYXJlc3RcIixcbiAgICAgIG1pbkZpbHRlcjogXCJuZWFyZXN0XCIsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZW5kZXJCaW5kR3JvdXBMYXlvdXQgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIEJpbmQgR3JvdXAgTGF5b3V0XCIsXG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIHsgYmluZGluZzogMCwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsIHNhbXBsZXI6IHsgdHlwZTogXCJub24tZmlsdGVyaW5nXCIgfSB9LFxuICAgICAgICB7IGJpbmRpbmc6IDEsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULCB0ZXh0dXJlOiB7fSB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHRoaXMucmVuZGVyQmluZEdyb3VwID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgIGxhYmVsOiBcIlJlbmRlciBCaW5kIEdyb3VwXCIsXG4gICAgICBsYXlvdXQ6IHJlbmRlckJpbmRHcm91cExheW91dCxcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgeyBiaW5kaW5nOiAwLCByZXNvdXJjZTogc2NyZWVuU2FtcGxlciB9LFxuICAgICAgICB7IGJpbmRpbmc6IDEsIHJlc291cmNlOiB0aGlzLmludGVybWVkaWF0ZVRleHR1cmUuY3JlYXRlVmlldygpIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJQaXBlbGluZSA9IHRoaXMuZGV2aWNlLmNyZWF0ZVJlbmRlclBpcGVsaW5lKHtcbiAgICAgIGxhYmVsOiBcIlJlbmRlciBQaXBlbGluZVwiLFxuICAgICAgbGF5b3V0OiB0aGlzLmRldmljZS5jcmVhdGVQaXBlbGluZUxheW91dCh7XG4gICAgICAgIGJpbmRHcm91cExheW91dHM6IFt0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXBMYXlvdXQoeyBlbnRyaWVzOiBbXSB9KSwgcmVuZGVyQmluZEdyb3VwTGF5b3V0XSxcbiAgICAgIH0pLFxuICAgICAgdmVydGV4OiB7XG4gICAgICAgIG1vZHVsZTogcmVuZGVyU2hhZGVyLFxuICAgICAgICBlbnRyeVBvaW50OiBcInZlcnRcIixcbiAgICAgIH0sXG4gICAgICBmcmFnbWVudDoge1xuICAgICAgICBtb2R1bGU6IHJlbmRlclNoYWRlcixcbiAgICAgICAgZW50cnlQb2ludDogXCJmcmFnXCIsXG4gICAgICAgIHRhcmdldHM6IFt7IGZvcm1hdDogdGhpcy5jYW52YXNGb3JtYXQgfV0sXG4gICAgICB9LFxuICAgICAgcHJpbWl0aXZlOiB7XG4gICAgICAgIHRvcG9sb2d5OiBcInRyaWFuZ2xlLWxpc3RcIixcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBwdWJsaWMgcmVuZGVyKGNhbnZhc0NvbnRleHQ6IEdQVUNhbnZhc0NvbnRleHQsIHF1ZXJ5U2V0PzogR1BVUXVlcnlTZXQsIHJlc29sdmVCdWZmZXI/OiBHUFVCdWZmZXIsIHJlc3VsdEJ1ZmZlcj86IEdQVUJ1ZmZlcikge1xuICAgIGlmICh0aGlzLnZpZXcubW9kZSAmJiB0aGlzLnZpZXcuYXV0b0ZpdCkgdGhpcy52aWV3Lnpvb20gKz0gMC4xOCAqICh0aGlzLmZpdHRlZFpvb20oKSAtIHRoaXMudmlldy56b29tKTtcbiAgICBpZiAodGhpcy52aWV3Lm1vZGUgJiYgdGhpcy52aWV3LmZvbGxvdykge1xuICAgICAgdGhpcy5jYW1lcmEueCArPSAwLjE4ICogKHRoaXMuY2FtZXJhVGFyZ2V0LnggLSB0aGlzLmNhbWVyYS54KTtcbiAgICAgIHRoaXMuY2FtZXJhLnkgKz0gMC4xOCAqICh0aGlzLmNhbWVyYVRhcmdldC55IC0gdGhpcy5jYW1lcmEueSk7XG4gICAgfVxuICAgIGNvbnN0IHZpZXdEYXRhID0gbmV3IEFycmF5QnVmZmVyKDQ4KSxcbiAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KHZpZXdEYXRhKSxcbiAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkodmlld0RhdGEpO1xuICAgIGYuc2V0KFt0aGlzLmNhbWVyYS54LCB0aGlzLmNhbWVyYS55LCB0aGlzLnZpZXcuem9vbV0pO1xuICAgIHVbM10gPSB0aGlzLnZpZXcubW9kZTtcbiAgICBmLnNldChbdGhpcy52aWV3LmZvY3VzLCB0aGlzLnZpZXcuY29udHJhc3QsIHRoaXMudmlldy5jaHJvbWEsIHRoaXMudmlldy5ncmFpbl0sIDQpO1xuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY3JlZW5TY2FsZSgpO1xuICAgIGYuc2V0KFtzY2FsZS54LCBzY2FsZS55XSwgOCk7XG4gICAgdGhpcy5kZXZpY2UucXVldWUud3JpdGVCdWZmZXIodGhpcy52aWV3QnVmZmVyLCAwLCB2aWV3RGF0YSk7XG4gICAgY29uc3QgY29tbWFuZEVuY29kZXIgPSB0aGlzLmRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuXG4gICAgaWYgKHRoaXMudmlldy5tb2RlKSB7XG4gICAgICBjb25zdCBzcGVjaW1lblBhc3MgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgICBzcGVjaW1lblBhc3Muc2V0UGlwZWxpbmUodGhpcy5zcGVjaW1lblBpcGVsaW5lKTtcbiAgICAgIHNwZWNpbWVuUGFzcy5zZXRCaW5kR3JvdXAoMCwgdGhpcy5zcGVjaW1lbkJpbmRHcm91cCk7XG4gICAgICBzcGVjaW1lblBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLnRoaXMuVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQpO1xuICAgICAgc3BlY2ltZW5QYXNzLmVuZCgpO1xuICAgIH1cblxuICAgIC8vIDEuIE1haW4gY29tcHV0ZSByZW5kZXIgcGFzc1xuICAgIGNvbnN0IHBhc3NDb21wdXRlID0gY29tbWFuZEVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgIHBhc3NDb21wdXRlLnNldFBpcGVsaW5lKHRoaXMuY29tcHV0ZVJlbmRlclBpcGVsaW5lKTtcbiAgICBwYXNzQ29tcHV0ZS5zZXRCaW5kR3JvdXAoMCwgdGhpcy5iaW5kR3JvdXBQb3N0UHJvY2Vzcyk7XG4gICAgcGFzc0NvbXB1dGUuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLnRoaXMuVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3NDb21wdXRlLmVuZCgpO1xuXG4gICAgLy8gMi4gTWFpbiByZW5kZXIgcGFzc1xuICAgIGNvbnN0IHJlbmRlclBhc3MgPSBjb21tYW5kRW5jb2Rlci5iZWdpblJlbmRlclBhc3Moe1xuICAgICAgY29sb3JBdHRhY2htZW50czogW1xuICAgICAgICB7XG4gICAgICAgICAgdmlldzogY2FudmFzQ29udGV4dC5nZXRDdXJyZW50VGV4dHVyZSgpLmNyZWF0ZVZpZXcoKSxcbiAgICAgICAgICBsb2FkT3A6IFwiY2xlYXJcIixcbiAgICAgICAgICBjbGVhclZhbHVlOiB7IHI6IDAsIGc6IDAsIGI6IDAsIGE6IDEgfSxcbiAgICAgICAgICBzdG9yZU9wOiBcInN0b3JlXCIsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuICAgIHJlbmRlclBhc3Muc2V0UGlwZWxpbmUodGhpcy5yZW5kZXJQaXBlbGluZSk7XG4gICAgcmVuZGVyUGFzcy5zZXRCaW5kR3JvdXAoMSwgdGhpcy5yZW5kZXJCaW5kR3JvdXApO1xuICAgIHJlbmRlclBhc3MuZHJhdyg2LCAxLCAwLCAwKTtcbiAgICByZW5kZXJQYXNzLmVuZCgpO1xuXG4gICAgdGhpcy5kZXZpY2UucXVldWUuc3VibWl0KFtjb21tYW5kRW5jb2Rlci5maW5pc2goKV0pO1xuICB9XG59XG4iLCIvLyBBY3R1YWwgR1BVIGNoZWNrcyBmb3Igc2VsZWN0aXZlIHJlbmV3YWwsIGdlbnVpbmUgdGV0aGVyIGR3ZWxsLCBhbmQgYSBwb2xhcml0eVxuLy8gZGlyZWN0aW9uIHRoYXQgc3Vydml2ZXMgdHJhbnNsYXRpb24uIEZyZXNoIGZpeHR1cmUgcGFnZXMgb25seS5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0ZXN0UmVuZXdhbChcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGJ1ZmZlcnM6IHsgYWN0aW46IEdQVUJ1ZmZlcjsgbWVtYnJhbmU6IEdQVUJ1ZmZlcjsgbGlua3M6IEdQVUJ1ZmZlcjsgc25hcHNob3Q6IEdQVUJ1ZmZlciB9LFxuICBjb3VudHM6IHsgYWN0aW46IG51bWJlcjsgbWVtYnJhbmU6IG51bWJlciB9LFxuICBjb25maWd1cmU6ICh2YWx1ZXM6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4pID0+IHZvaWQsXG4gIGRpc3BhdGNoOiAoa2luZDogXCJwb2xhcml0eVwiIHwgXCJ0dXJub3ZlclwiIHwgXCJ0ZXRoZXJcIiB8IFwibW90b3JcIiwgcmVwZWF0cz86IG51bWJlcikgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IGNoZWNrczogeyBuYW1lOiBzdHJpbmc7IHBhc3NlZDogYm9vbGVhbiB9W10gPSBbXTtcbiAgY29uc3QgYXNzZXJ0ID0gKG5hbWU6IHN0cmluZywgcGFzc2VkOiBib29sZWFuKSA9PiB7XG4gICAgY2hlY2tzLnB1c2goeyBuYW1lLCBwYXNzZWQgfSk7XG4gICAgaWYgKCFwYXNzZWQpIHRocm93IEVycm9yKGBSZW5ld2FsIGZpeHR1cmUgZmFpbGVkOiAke25hbWV9YCk7XG4gIH07XG4gIGNvbnN0IHJlYWQgPSBhc3luYyAoYnVmZmVyOiBHUFVCdWZmZXIsIG9mZnNldCA9IDAsIHNpemUgPSBidWZmZXIuc2l6ZSkgPT4ge1xuICAgIGNvbnN0IHN0YWdlID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIGNvbnN0IGUgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlLmNvcHlCdWZmZXJUb0J1ZmZlcihidWZmZXIsIG9mZnNldCwgc3RhZ2UsIDAsIHNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2UuZmluaXNoKCldKTtcbiAgICBhd2FpdCBzdGFnZS5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IGRhdGEgPSBzdGFnZS5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApO1xuICAgIHN0YWdlLnVubWFwKCk7XG4gICAgc3RhZ2UuZGVzdHJveSgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuICBmdW5jdGlvbiBtZW1icmFuZShzaGlmdCA9IDAsIGF0Q29udGFjdCA9IGZhbHNlKSB7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLnNpemUpLFxuICAgICAgdSA9IG5ldyBVaW50MzJBcnJheShkYXRhKSxcbiAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLm1lbWJyYW5lOyBpKyspIHtcbiAgICAgIGNvbnN0IGFuZ2xlID0gKDIgKiBNYXRoLlBJICogaSkgLyBjb3VudHMubWVtYnJhbmU7XG4gICAgICB1W2kgKiAxMF0gPSBpO1xuICAgICAgdVtpICogMTAgKyA2XSA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICB1W2kgKiAxMCArIDddID0gKGkgKyBjb3VudHMubWVtYnJhbmUgLSAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIGZbaSAqIDEwICsgMl0gPSA1MCArIHNoaWZ0ICsgNDUgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICBmW2kgKiAxMCArIDNdID0gNTAgKyA0NSAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgIGZbaSAqIDEwICsgOF0gPSBpO1xuICAgIH1cbiAgICBpZiAoYXRDb250YWN0KSB7XG4gICAgICBmWzJdID0gMTI7XG4gICAgICBmWzNdID0gNTA7XG4gICAgfVxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLCAwLCBkYXRhKTtcbiAgfVxuICBmdW5jdGlvbiBmaWxhbWVudHMoYWdlOiBudW1iZXIsIHBvc2l0aW9ucyA9IFsxMCwgMTQsIDg1LCA4OV0pIHtcbiAgICBjb25zdCBkYXRhID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMuYWN0aW4uc2l6ZSksXG4gICAgICB1ID0gbmV3IFVpbnQzMkFycmF5KGRhdGEpLFxuICAgICAgZiA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMuYWN0aW47IGkrKykgdVtpICogMTBdID0gdVtpICogMTAgKyA2XSA9IHVbaSAqIDEwICsgN10gPSBpO1xuICAgIHBvc2l0aW9ucy5mb3JFYWNoKCh4LCBpKSA9PiB7XG4gICAgICB1W2kgKiAxMCArIDZdID0gaSA8IDIgPyAwIDogMjtcbiAgICAgIHVbaSAqIDEwICsgN10gPSBpIDwgMiA/IDEgOiAzO1xuICAgICAgZltpICogMTAgKyAyXSA9IHg7XG4gICAgICBmW2kgKiAxMCArIDNdID0gNTA7XG4gICAgICBmW2kgKiAxMCArIDRdID0gMTtcbiAgICAgIGZbaSAqIDEwICsgOV0gPSBhZ2U7XG4gICAgfSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMuYWN0aW4sIDAsIGRhdGEpO1xuICAgIHJldHVybiBkYXRhO1xuICB9XG4gIG1lbWJyYW5lKCk7XG4gIGZpbGFtZW50cygxMDAwKTtcbiAgY29uZmlndXJlKHsgcG9sYXJpdHlNb2RlOiAwLCBjdWVFbmFibGVkOiAwIH0pO1xuICBkaXNwYXRjaChcInBvbGFyaXR5XCIpO1xuICBjb25maWd1cmUoe1xuICAgIHBvbGFyaXR5TW9kZTogMSxcbiAgICBjdWVFbmFibGVkOiAxLFxuICAgIGN1ZVg6IDEwMCxcbiAgICBjdWVZOiA1MCxcbiAgICBwb2xhcml0eVR1cm5SYXRlOiAwLjAyLFxuICAgIHJlYXJUdXJub3ZlcjogMSxcbiAgICB0dXJub3ZlckFnZTogMTAsXG4gICAgZGlzY29ubmVjdGlvblByb2JhYmlsaXR5OiAwLFxuICAgIGRlYnJhbmNoUHJvYmFiaWxpdHk6IDAsXG4gIH0pO1xuICBkaXNwYXRjaChcInBvbGFyaXR5XCIpO1xuICBkaXNwYXRjaChcInR1cm5vdmVyXCIpO1xuICBsZXQgdSA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKTtcbiAgYXNzZXJ0KFwiYWdlZCByZWFyIGZpbGFtZW50IHJldHVybnMgdG8gRy1hY3RpblwiLCB1WzZdID09PSAwICYmIHVbN10gPT09IDAgJiYgdVsxNl0gPT09IDEgJiYgdVsxN10gPT09IDEpO1xuICBhc3NlcnQoXCJzYW1lLWFnZWQgZnJvbnQgZmlsYW1lbnQgaXMgcHJvdGVjdGVkXCIsIHVbMjddID09PSAzICYmIHVbMzZdID09PSAyKTtcbiAgY29uc3QgYnJhbmNoID0gZmlsYW1lbnRzKDApLFxuICAgIGJ1ID0gbmV3IFVpbnQzMkFycmF5KGJyYW5jaCksXG4gICAgYmYgPSBuZXcgRmxvYXQzMkFycmF5KGJyYW5jaCk7XG4gIGJ1WzI2XSA9IDA7XG4gIGJ1WzI3XSA9IDI7XG4gIGJmWzIyXSA9IDEyO1xuICBiZlsyM10gPSA1MjtcbiAgYmZbMjldID0gMTAwMDtcbiAgYnVbMzZdID0gMztcbiAgYnVbMzddID0gMztcbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMuYWN0aW4sIDAsIGJyYW5jaCk7XG4gIGRpc3BhdGNoKFwidHVybm92ZXJcIik7XG4gIHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcIm9sZCBvbmUtYmVhZCBicmFuY2ggcmV0dXJucyB0byB0aGUgc29sdWJsZSBwb29sXCIsIHVbMjZdID09PSAyICYmIHVbMjddID09PSAyKTtcbiAgYXNzZXJ0KFwiYnJhbmNoIHJlbW92YWwgZG9lcyBub3QgY3V0IHRoZSBtb3RoZXIgZmlsYW1lbnRcIiwgdVs3XSA9PT0gMSAmJiB1WzE2XSA9PT0gMCk7XG4gIGZpbGFtZW50cygwKTtcbiAgZGlzcGF0Y2goXCJ0dXJub3ZlclwiKTtcbiAgdSA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKTtcbiAgYXNzZXJ0KFwieW91bmcgcmVhciBuZXR3b3JrIGlzIG5vdCBwcmVtYXR1cmVseSBjbGVhcmVkXCIsIHVbN10gPT09IDEgJiYgdVsxNl0gPT09IDApO1xuICBjb25zdCBiZWZvcmUgPSBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5zbmFwc2hvdCwgMzIgKiAoY291bnRzLmFjdGluICsgY291bnRzLm1lbWJyYW5lICsgMSksIDMyKSk7XG4gIG1lbWJyYW5lKDEwMCk7XG4gIGRpc3BhdGNoKFwicG9sYXJpdHlcIik7XG4gIGNvbnN0IGFmdGVyID0gbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuc25hcHNob3QsIDMyICogKGNvdW50cy5hY3RpbiArIGNvdW50cy5tZW1icmFuZSArIDEpLCAzMikpO1xuICBhc3NlcnQoXCJwb2xhcml0eSB2ZWN0b3IgcGVyc2lzdHMgdW5kZXIgY2VsbCB0cmFuc2xhdGlvblwiLCBNYXRoLmFicyhiZWZvcmVbMl0gLSBhZnRlclsyXSkgPCAxZS02ICYmIE1hdGguYWJzKGJlZm9yZVszXSAtIGFmdGVyWzNdKSA8IDFlLTYgJiYgYWZ0ZXJbMl0gPiAwLjk5KTtcbiAgbWVtYnJhbmUoKTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgY29uZmlndXJlKHsgbW90b3JSZWFyQmlhczogMSwgbXlvc2luU3RyZW5ndGg6IDAuMDUsIG15b3NpblNwZWVkOiAwLjAyIH0pO1xuICBmb3IgKGNvbnN0IFtwb3NpdGlvbnMsIG5hbWUsIGFjdGl2ZV0gb2YgW1xuICAgIFtbMTAsIDE0LCAyMCwgMTZdLCBcIm1hdHVyZSByZWFyIG1vdG9yIHByb2R1Y2VzIGNvbnRyYWN0aW9uXCIsIHRydWVdLFxuICAgIFtbODAsIDg0LCA5MCwgODZdLCBcIm1hdHVyZSBmcm9udCBtb3RvciBzdGF5cyBpbmFjdGl2ZVwiLCBmYWxzZV0sXG4gIF0gYXMgY29uc3QpIHtcbiAgICBmaWxhbWVudHMoMTAwMCwgWy4uLnBvc2l0aW9uc10pO1xuICAgIGNvbnN0IGxpbmsgPSBuZXcgVWludDMyQXJyYXkoOCAqICgyNTYgKyBjb3VudHMubWVtYnJhbmUpKTtcbiAgICBsaW5rLnNldChbMSwgMywgMCwgMSwgMSwgMCwgMywgMl0pO1xuICAgIG5ldyBGbG9hdDMyQXJyYXkobGluay5idWZmZXIpWzJdID0gNTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5saW5rcywgMCwgbGluayk7XG4gICAgZGlzcGF0Y2goXCJtb3RvclwiKTtcbiAgICBjb25zdCBtb3ZlZCA9IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gICAgYXNzZXJ0KG5hbWUsIGFjdGl2ZSA/IG1vdmVkWzJdID4gcG9zaXRpb25zWzBdICYmIG1vdmVkWzIyXSA8IHBvc2l0aW9uc1syXSA6IG1vdmVkWzJdID09PSBwb3NpdGlvbnNbMF0gJiYgbW92ZWRbMjJdID09PSBwb3NpdGlvbnNbMl0pO1xuICB9XG4gIG1lbWJyYW5lKDAsIHRydWUpO1xuICBmaWxhbWVudHMoMTAwMCk7XG4gIGNvbnN0IGxpbmsgPSBuZXcgVWludDMyQXJyYXkoOCAqICgyNTYgKyBjb3VudHMubWVtYnJhbmUpKTtcbiAgbGluay5zZXQoWzEsIDAsIDAsIDYwMCwgMSwgMCwgMCwgMF0sIDI1NiAqIDgpO1xuICBuZXcgRmxvYXQzMkFycmF5KGxpbmsuYnVmZmVyKVsyNTYgKiA4ICsgMl0gPSAyO1xuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5saW5rcywgMCwgbGluayk7XG4gIGNvbmZpZ3VyZSh7IG1lbWJyYW5lQ291cGxpbmc6IDAuMDUsIHRldGhlclR1cm5vdmVyOiAxLCB0ZXRoZXJPblJhdGU6IDEsIHRldGhlck9mZlJhdGU6IDAsIHRldGhlckxvYWRPZmY6IDAsIHRldGhlclJlY292ZXJ5U3RlcHM6IDQwIH0pO1xuICBkaXNwYXRjaChcInRldGhlclwiKTtcbiAgbGV0IGxpbmtzID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5saW5rcykpO1xuICBhc3NlcnQoXCJleHBpcmVkIHRldGhlciBlbnRlcnMgYW4gdW5ib3VuZCBkd2VsbFwiLCBsaW5rc1syNTYgKiA4XSA9PT0gMCAmJiBsaW5rc1syNTYgKiA4ICsgM10gPT09IDQwKTtcbiAgZGlzcGF0Y2goXCJ0ZXRoZXJcIik7XG4gIGxpbmtzID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5saW5rcykpO1xuICBhc3NlcnQoXCJ0ZXRoZXIgZG9lcyBub3QgcmViaW5kIG9uIHRoZSBuZXh0IHN0ZXBcIiwgbGlua3NbMjU2ICogOF0gPT09IDAgJiYgbGlua3NbMjU2ICogOCArIDNdID09PSAzOSk7XG4gIGRpc3BhdGNoKFwidGV0aGVyXCIsIDQwKTtcbiAgbGlua3MgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmxpbmtzKSk7XG4gIGFzc2VydChcInRldGhlciBjYW4gcmViaW5kIGFmdGVyIGl0cyBkd2VsbFwiLCBsaW5rc1syNTYgKiA4XSA+IDApO1xuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXMoZGV2aWNlOiBHUFVEZXZpY2UsIG1vZHVsZTogR1BVU2hhZGVyTW9kdWxlLCBsYXlvdXQ6IEdQVVBpcGVsaW5lTGF5b3V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzb2x2ZUN1ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicmVzb2x2ZV9mcm9udF9jdWVcIiB9IH0pLFxuICAgIGRyYXdDdWU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfcmVzb2x2ZWRfY3VlXCIgfSB9KSxcbiAgICBtZWFzdXJlRW5jbG9zdXJlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtZWFzdXJlX2VuY2xvc3VyZVwiIH0gfSksXG4gICAgYnVpbGRFbmNsb3N1cmVSb3dzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJidWlsZF9lbmNsb3N1cmVfcm93c1wiIH0gfSksXG4gICAgZHJhd1Jlc2Vydm9pcjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiZHJhd19yZXNlcnZvaXJfY29tcGFydG1lbnRcIiB9IH0pLFxuICAgIHByb2plY3RFbmNsb3N1cmVBcmVhOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJwcm9qZWN0X2VuY2xvc3VyZV9hcmVhXCIgfSB9KSxcbiAgICBjb250YWluRmlsYW1lbnRQb2ludHM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNvbnRhaW5fZmlsYW1lbnRfcG9pbnRzXCIgfSB9KSxcbiAgICBjb250YWluRmlsYW1lbnRCb25kczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiY29udGFpbl9maWxhbWVudF9ib25kc1wiIH0gfSksXG4gICAgc25hcHNob3RNZWNoYW5pY3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInNuYXBzaG90X21lY2hhbmljc1wiIH0gfSksXG4gICAgbW90b3JMaW5rczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibW90b3JfbGlua3NcIiB9IH0pLFxuICAgIG1lbWJyYW5lVGV0aGVyczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibWVtYnJhbmVfdGV0aGVyc1wiIH0gfSksXG4gICAgYXBwbHlNZWNoYW5pY2FsRm9yY2VzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJhcHBseV9tZWNoYW5pY2FsX2ZvcmNlc1wiIH0gfSksXG4gICAgZHJhd01lY2hhbmljYWxMaW5rczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiZHJhd19tZWNoYW5pY2FsX2xpbmtzXCIgfSB9KSxcbiAgICBsaW5lQ29uc3RyYWludDogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibGluZV9jb25zdHJhaW50X3VwZGF0ZXNcIiB9IH0pLFxuICAgIG1lbWJyYW5lVGFuZ2VudGlhbEZsb3c6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RhbmdlbnRpYWxfZmxvd1wiIH0gfSksXG4gICAgb3JpZW50YXRpb25VcGRhdGU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm9yaWVudGF0aW9uX3VwZGF0ZXNcIiB9IH0pLFxuICAgIGNvc3NlcmF0VXBkYXRlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJjb3NzZXJhdF91cGRhdGVzXCIgfSB9KSxcbiAgICByZXNldEFjdGluOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJyZXNldF9hY3RpblwiIH0gfSksXG4gICAgcmVzZXRNZW1icmFuZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicmVzZXRfbWVtYnJhbmVcIiB9IH0pLFxuICAgIHN0ZXJpY0ZvcmNlVXBkYXRlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJzdGVyaWNfZm9yY2VfdXBkYXRlc1wiIH0gfSksXG4gICAgYWN0aW5CaW5kOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJiaW5kX2FjdGluX21vbm9tZXJcIiB9IH0pLFxuICAgIGFjdGluUG9seW1lclBvc2l0aW9uOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfYWN0aW5fcG9seW1lcl9wb3NpdGlvblwiIH0gfSksXG4gICAgYWN0aW5Nb25vbWVyUG9zaXRpb246IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInVwZGF0ZV9hY3Rpbl9tb25vbWVyX3Bvc2l0aW9uXCIgfSB9KSxcbiAgICB1bmJpbmRNaW5Qb2xlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1bmJpbmRfbWluX3BvbGVcIiB9IH0pLFxuICAgIG1lbWJyYW5lVG9UZXh0dXJlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibWVtYnJhbmVfdG9fdGV4dHVyZXNcIiB9IH0pLFxuICAgIGFjdGluZXNUb1RleHR1cmVzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJhY3RpbmVzX3RvX3RleHR1cmVzXCIgfSB9KSxcbiAgICBjbGVhclJlbmRlckxheWVyczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiY2xlYXJfcmVuZGVyX2xheWVyc1wiIH0gfSksXG4gICAgdXBkYXRlVGV4dHVyZXM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInVwZGF0ZV90ZXh0dXJlc1wiIH0gfSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKHBhc3M6IEdQVUNvbXB1dGVQYXNzRW5jb2RlciwgcGlwZWxpbmU6IEdQVUNvbXB1dGVQaXBlbGluZSwgeDogbnVtYmVyLCB5ID0gMSkge1xuICBwYXNzLnNldFBpcGVsaW5lKHBpcGVsaW5lKTtcbiAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoeCwgeSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5TaW11bGF0aW9uU3RlcChcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIHBpcGVsaW5lczogUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcz4sXG4gIGJpbmRHcm91cDogR1BVQmluZEdyb3VwLFxuICB3b3JrZ3JvdXBDb3VudHM6IHsgQUNUSU46IG51bWJlcjsgTUVNQlJBTkU6IG51bWJlciB9LFxuICB0ZXh0dXJlV29ya2dyb3VwQ291bnQ6IFtudW1iZXIsIG51bWJlcl0sXG4gIGxpbmVDb25zdHJhaW50RnVuY3Rpb246IChwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIpID0+IHZvaWQsXG4gIGZyYW1lTnI6IG51bWJlcixcbiAgaXNMYXN0U3RlcE9mRnJhbWU6IGJvb2xlYW4sXG4gIGVuY2xvc3VyZSA9IGZhbHNlLFxuICBwZXJzaXN0ZW50UG9sYXJpdHkgPSBmYWxzZSxcbiAgcXVlcnlJbmZvPzogeyBxdWVyeVNldDogR1BVUXVlcnlTZXQ7IGlzRmlyc3RTdGVwOiBib29sZWFuIH1cbikge1xuICAvLyBPbmUgc3VibWlzc2lvbiBwZXIgZml4ZWQgc3RlcC4gRGlzcGF0Y2ggb3JkZXIgYW5kIGl0ZXJhdGlvbiBjb3VudHMgYXJlXG4gIC8vIHVuY2hhbmdlZDsgZGlzcGF0Y2ggYm91bmRhcmllcyByZXRhaW4gc3RvcmFnZSBkZXBlbmRlbmNpZXMuIFVuaWZvcm0gd3JpdGVzXG4gIC8vIHJlbWFpbiBCRUZPUkUgZWFjaCBzdGVwIHN1Ym1pc3Npb24sIHNvIHNwcm91dHMgYXJlIG5vdCBvdmVyd3JpdHRlbiBieSB0aGVcbiAgLy8gbGFzdCBzdGVwJ3MgdmFsdWVzIHdoZW4gc2V2ZXJhbCBmaXhlZCBzdGVwcyBzaGFyZSBhbiBhbmltYXRpb24gZnJhbWUuXG4gIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgY29uc3QgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcyh7XG4gICAgLi4uKHF1ZXJ5SW5mbz8uaXNGaXJzdFN0ZXAgJiYge1xuICAgICAgdGltZXN0YW1wV3JpdGVzOiB7XG4gICAgICAgIHF1ZXJ5U2V0OiBxdWVyeUluZm8ucXVlcnlTZXQsXG4gICAgICAgIGJlZ2lubmluZ09mUGFzc1dyaXRlSW5kZXg6IDAsXG4gICAgICAgIGVuZE9mUGFzc1dyaXRlSW5kZXg6IDEsXG4gICAgICB9LFxuICAgIH0pLFxuICB9KTtcbiAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcblxuICBpZiAocGVyc2lzdGVudFBvbGFyaXR5KSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5yZXNvbHZlQ3VlLCAxKTtcblxuICBpZiAoaXNMYXN0U3RlcE9mRnJhbWUpIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY2xlYXJSZW5kZXJMYXllcnMsIC4uLnRleHR1cmVXb3JrZ3JvdXBDb3VudCk7XG4gIH1cbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnN0ZXJpY0ZvcmNlVXBkYXRlLCB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkUpO1xuICBsaW5lQ29uc3RyYWludEZ1bmN0aW9uKHBhc3MpO1xuICBpZiAoZW5jbG9zdXJlKSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYnVpbGRFbmNsb3N1cmVSb3dzLCBNYXRoLmNlaWwoKHRleHR1cmVXb3JrZ3JvdXBDb3VudFsxXSAqIDE2KSAvICg0ICogMjU2KSkpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYWN0aW5CaW5kLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYWN0aW5Qb2x5bWVyUG9zaXRpb24sIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3Rpbk1vbm9tZXJQb3NpdGlvbiwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnVuYmluZE1pblBvbGUsIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGlmIChlbmNsb3N1cmUpIGVuY29kZUVuY2xvc3VyZShwYXNzLCBwaXBlbGluZXMsIHdvcmtncm91cENvdW50cywgdGV4dHVyZVdvcmtncm91cENvdW50WzFdICogMTYpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVtYnJhbmVUb1RleHR1cmVzLCB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkUpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYWN0aW5lc1RvVGV4dHVyZXMsIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy51cGRhdGVUZXh0dXJlcywgLi4udGV4dHVyZVdvcmtncm91cENvdW50KTtcbiAgY29uc3QgbWVjaGFuaWNhbENvdW50ID0gd29ya2dyb3VwQ291bnRzLkFDVElOICsgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIG1lY2hhbmljYWxDb3VudCk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tb3RvckxpbmtzLCAxKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1lbWJyYW5lVGV0aGVycywgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFwcGx5TWVjaGFuaWNhbEZvcmNlcywgbWVjaGFuaWNhbENvdW50KTtcbiAgaWYgKGVuY2xvc3VyZSkgZW5jb2RlRW5jbG9zdXJlKHBhc3MsIHBpcGVsaW5lcywgd29ya2dyb3VwQ291bnRzLCB0ZXh0dXJlV29ya2dyb3VwQ291bnRbMV0gKiAxNik7XG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSkgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmRyYXdNZWNoYW5pY2FsTGlua3MsIDEgKyB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkUpO1xuICBpZiAoaXNMYXN0U3RlcE9mRnJhbWUgJiYgZW5jbG9zdXJlKSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuZHJhd1Jlc2Vydm9pciwgLi4udGV4dHVyZVdvcmtncm91cENvdW50KTtcbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lKSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuZHJhd0N1ZSwgMSk7XG4gIHBhc3MuZW5kKCk7XG4gIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1bkVuY2xvc3VyZShcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIHBpcGVsaW5lczogUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcz4sXG4gIGJpbmRHcm91cDogR1BVQmluZEdyb3VwLFxuICBjb3VudHM6IHsgQUNUSU46IG51bWJlcjsgTUVNQlJBTkU6IG51bWJlciB9LFxuICBoZWlnaHQ6IG51bWJlclxuKSB7XG4gIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgY29uc3QgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuICBlbmNvZGVFbmNsb3N1cmUocGFzcywgcGlwZWxpbmVzLCBjb3VudHMsIGhlaWdodCk7XG4gIHBhc3MuZW5kKCk7XG4gIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbn1cblxuLy8gRnJvemVuLXRpbWUgY29ycmVjdGlvbjogbm8gcmVhY3Rpb25zLCBhZ2VzLCBtb3RvcnMsIG1lbWJyYW5lIG1vdGlvbiBvciBhcmVhXG4vLyBwcm9qZWN0aW9uLiBUaGUgY2FsbGVyIHZlcmlmaWVzIHRoZSBmdWxsIHN0YXRlIGFmdGVyIGVhY2ggYm91bmRlZCBiYXRjaC5cbmV4cG9ydCBmdW5jdGlvbiBydW5Db250YWN0UmVwYWlyKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgYmluZEdyb3VwOiBHUFVCaW5kR3JvdXAsXG4gIGNvdW50czogeyBBQ1RJTjogbnVtYmVyOyBNRU1CUkFORTogbnVtYmVyIH0sXG4gIGhlaWdodDogbnVtYmVyLFxuICBpdGVyYXRpb25zOiBudW1iZXJcbikge1xuICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCksXG4gICAgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYnVpbGRFbmNsb3N1cmVSb3dzLCBNYXRoLmNlaWwoaGVpZ2h0IC8gKDQgKiAyNTYpKSk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaXRlcmF0aW9uczsgaSsrKSB7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIGNvdW50cy5BQ1RJTiArIGNvdW50cy5NRU1CUkFORSk7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudEJvbmRzLCBjb3VudHMuQUNUSU4pO1xuICB9XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jb250YWluRmlsYW1lbnRQb2ludHMsIGNvdW50cy5BQ1RJTik7XG4gIHBhc3MuZW5kKCk7XG4gIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbn1cblxuZnVuY3Rpb24gZW5jb2RlRW5jbG9zdXJlKFxuICBwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIsXG4gIHBpcGVsaW5lczogUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcz4sXG4gIGNvdW50czogeyBBQ1RJTjogbnVtYmVyOyBNRU1CUkFORTogbnVtYmVyIH0sXG4gIGhlaWdodDogbnVtYmVyXG4pIHtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1lYXN1cmVFbmNsb3N1cmUsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMucHJvamVjdEVuY2xvc3VyZUFyZWEsIGNvdW50cy5NRU1CUkFORSk7XG4gIC8vIFJlZnJlc2ggdGhlIG1lYXN1cmVkIGFyZWEgYWZ0ZXIgcHJvamVjdGlvbiBmb3IgdGhlIG5leHQgcmVhY3Rpb24gc3RlcC5cbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1lYXN1cmVFbmNsb3N1cmUsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYnVpbGRFbmNsb3N1cmVSb3dzLCBNYXRoLmNlaWwoaGVpZ2h0IC8gKDQgKiAyNTYpKSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jb250YWluRmlsYW1lbnRQb2ludHMsIGNvdW50cy5BQ1RJTik7XG4gIGZvciAobGV0IGl0ZXJhdGlvbiA9IDA7IGl0ZXJhdGlvbiA8IDI7IGl0ZXJhdGlvbisrKSB7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzLCBjb3VudHMuQUNUSU4gKyBjb3VudHMuTUVNQlJBTkUpO1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jb250YWluRmlsYW1lbnRCb25kcywgY291bnRzLkFDVElOKTtcbiAgfVxufVxuIiwiLy8gU2NoZWR1bGVzIHNob3J0LWxpdmVkIHBvbHltZXJpemF0aW9uIHNpdGVzIG9uIHRoZSBtZW1icmFuZSwgc28gbG9jYWwgcHJvdHJ1c2lvbnMgc3Byb3V0IGFuZCByZXRyYWN0LlxuLy8gRWFjaCBzbG90IGFsdGVybmF0ZXMgYmV0d2VlbiBvbiAoYSBzaXRlIGF0IGEgZml4ZWQgbWVtYnJhbmUgcG9zaXRpb24pIGFuZCBvZmYsIHdpdGggcmFuZG9tIGR1cmF0aW9ucyxcbi8vIHNvIHRoZSBudW1iZXIgb2YgYWN0aXZlIHNpdGVzIGZsdWN0dWF0ZXMuIE9mZnNldHMgbGFuZCBpbiB0aGUgZnJvbnQgMzAlOyB0aGVcbi8vIEdQVSBtYXBzIHRoZW0gaW50byB0aGUgc2VsZWN0ZWQgcG9sYXJpdHkgZnJhbWUgd2l0aG91dCBleHRyYSBSTkcgZHJhd3MuXG5cbmV4cG9ydCBjb25zdCBNQVhfU1BST1VUX1NJVEVTID0gODtcbi8vIGhhbGYgb2YgdGhlIGZyb250IHJlZ2lvbiB3aGVyZSBzaXRlcyBjYW4gbGFuZCwgaW4gbm9ybWFsaXplZCBhcmMgbGVuZ3RoICgwLjE1ID0gZnJvbnQgMzAlIG9mIHRoZSBtZW1icmFuZSlcbmNvbnN0IEZST05UX0hBTEZfV0lEVEggPSAwLjE1O1xuXG50eXBlIFNsb3QgPSB7IGNlbnRlcjogbnVtYmVyOyBvblVudGlsOiBudW1iZXI7IG9mZlVudGlsOiBudW1iZXIgfTtcblxuZXhwb3J0IGNsYXNzIFNwcm91dFNjaGVkdWxlciB7XG4gIHByaXZhdGUgc2xvdHM6IFNsb3RbXSA9IFtdO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHN0YWdnZXJTdGVwczogbnVtYmVyLFxuICAgIHByaXZhdGUgcmFuZG9tID0gTWF0aC5yYW5kb21cbiAgKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNQVhfU1BST1VUX1NJVEVTOyBpKyspIHtcbiAgICAgIC8vIHN0YWdnZXIgdGhlIGZpcnN0IHN3aXRjaC1vbiBvdmVyIGEgd2hvbGUgb24vb2ZmIGN5Y2xlIHNvIHRoZSBzaXRlcyBkb24ndCBhbGwgc3RhcnQgdG9nZXRoZXJcbiAgICAgIHRoaXMuc2xvdHMucHVzaCh7IGNlbnRlcjogMCwgb25VbnRpbDogMCwgb2ZmVW50aWw6IHRoaXMucmFuZG9tKCkgKiBzdGFnZ2VyU3RlcHMgfSk7XG4gICAgfVxuICB9XG5cbiAgLy8gV3JpdGVzIFtjZW50ZXIgKG5vcm1hbGl6ZWQgYXJjIGxlbmd0aCksIGhhbGZXaWR0aCAobm9kZXMpLCBzdHJlbmd0aCwgMF0gcGVyIHNsb3QgaW50byBgb3V0YC5cbiAgdXBkYXRlKFxuICAgIHN0ZXA6IG51bWJlcixcbiAgICBwYXJhbXM6IHsgc3Byb3V0Q291bnQ6IG51bWJlcjsgc3Byb3V0V2lkdGg6IG51bWJlcjsgc3Byb3V0RnJvbnRCaWFzOiBudW1iZXI7IHNwcm91dE9uU3RlcHM6IG51bWJlcjsgc3Byb3V0T2ZmU3RlcHM6IG51bWJlciB9LFxuICAgIG91dDogRmxvYXQzMkFycmF5XG4gICkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTUFYX1NQUk9VVF9TSVRFUzsgaSsrKSB7XG4gICAgICBjb25zdCBzbG90ID0gdGhpcy5zbG90c1tpXTtcbiAgICAgIGlmIChzdGVwID49IHNsb3Qub2ZmVW50aWwgJiYgc3RlcCA+PSBzbG90Lm9uVW50aWwpIHtcbiAgICAgICAgc2xvdC5jZW50ZXIgPSBzYW1wbGVDZW50ZXIocGFyYW1zLnNwcm91dEZyb250QmlhcywgdGhpcy5yYW5kb20pO1xuICAgICAgICBzbG90Lm9uVW50aWwgPSBzdGVwICsgcGFyYW1zLnNwcm91dE9uU3RlcHMgKiAoMC41ICsgdGhpcy5yYW5kb20oKSk7XG4gICAgICAgIHNsb3Qub2ZmVW50aWwgPSBzbG90Lm9uVW50aWwgKyBwYXJhbXMuc3Byb3V0T2ZmU3RlcHMgKiAoMC41ICsgdGhpcy5yYW5kb20oKSk7XG4gICAgICB9XG4gICAgICBjb25zdCBhY3RpdmUgPSBpIDwgcGFyYW1zLnNwcm91dENvdW50ICYmIHN0ZXAgPCBzbG90Lm9uVW50aWw7XG4gICAgICBvdXQuc2V0KFtzbG90LmNlbnRlciwgcGFyYW1zLnNwcm91dFdpZHRoICogMC41LCBhY3RpdmUgPyAxIDogMCwgMF0sIGkgKiA0KTtcbiAgICB9XG4gIH1cbn1cblxuLy8gTmVhciB0aGUgZnJvbnQgKGFyYyBsZW5ndGggMCkgd2l0aCBwcm9iYWJpbGl0eSBgZnJvbnRCaWFzYCwgYW55d2hlcmUgaW4gdGhlIGZyb250IHJlZ2lvbiBvdGhlcndpc2UuXG5mdW5jdGlvbiBzYW1wbGVDZW50ZXIoZnJvbnRCaWFzOiBudW1iZXIsIHJhbmRvbTogKCkgPT4gbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IG9mZnNldCA9IChyYW5kb20oKSAtIDAuNSkgKiAyICogRlJPTlRfSEFMRl9XSURUSDtcbiAgaWYgKHJhbmRvbSgpIDwgZnJvbnRCaWFzKSB7XG4gICAgY29uc3QgZ2F1c3NpYW4gPSBNYXRoLnNxcnQoLTIgKiBNYXRoLmxvZygxIC0gcmFuZG9tKCkpKSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogcmFuZG9tKCkpO1xuICAgIG9mZnNldCA9IE1hdGgubWF4KC1GUk9OVF9IQUxGX1dJRFRILCBNYXRoLm1pbihGUk9OVF9IQUxGX1dJRFRILCBnYXVzc2lhbiAqIDAuMDgpKTtcbiAgfVxuICByZXR1cm4gKG9mZnNldCArIDEpICUgMTtcbn1cbiIsIi8vIFB1cmUgZnVsbC1zbmFwc2hvdCBkaWFnbm9zdGljcy4gUnVucyBpbiB0aGUgYm91bmRlZCB3b3JrZXIsIHdpdGggbm8gRE9NIG9yXG4vLyBHUFUgYWNjZXNzLiBHZW9tZXRyeSBjaGVja3MsIHRvcG9sb2d5IHdhbGtzIGFuZCBjb3VudGVyIHNlbWFudGljcyBhcmUgc2hhcmVkXG4vLyBieSBsaXZlIGRpYWdub3N0aWNzIGFuZCBldmVyeSBmb3JjZWQgc2NpZW50aWZpYy1hc3NheSBjaGVja3BvaW50LlxuaW1wb3J0IHsgcG9seWdvbk9jY3VwYW5jeSwgcG9seWdvbkJvbmRDcm9zc2luZyB9IGZyb20gXCIuL29jY3VwYW5jeVwiO1xuXG5jb25zdCBTRUdNRU5UX1dPUkRTID0gMTA7IC8vIGlkLCBzdWJ0eXBlLCBwb3NpdGlvbigyKSwgb3JpZW50YXRpb24oMiksIHRhaWwsIGhlYWQsIGFyY19sZW5ndGgsIGFnZVxuY29uc3QgVEFJTCA9IDY7XG5jb25zdCBIRUFEID0gNztcblxuLy8gbXVzdCBtYXRjaCB0aGUgVEVMRU1FVFJZXyogaW5kaWNlcyBpbiBzaW11bGF0ZS53Z3NsXG5leHBvcnQgY29uc3QgVEVMRU1FVFJZX0NPVU5URVJTID0gW1xuICBcImNhbmRpZGF0ZXNcIiwgLy8gZnJlZSBtb25vbWVycyBpbiB0aGUgcG9seW1lcml6YXRpb24gZmllbGRcbiAgXCJuZWlnaGJvckZvdW5kXCIsIC8vIC4uLiB0aGF0IHNhdyBhbiBhdmFpbGFibGUgaGVhZCBvciBtb25vbWVyIG5lYXJieVxuICBcInBhc3NlZFByb2JcIiwgLy8gLi4uIGFuZCBwYXNzZWQgdGhlIGJpbmQgcHJvYmFiaWxpdHlcbiAgXCJib3VuZFwiLCAvLyAuLi4gYW5kIHdvbiBib3RoIGxvY2tzXG4gIFwidW5ib3VuZFwiLCAvLyBtaW51cy1lbmQgZGVwb2x5bWVyaXphdGlvbnNcbiAgXCJlbG9uZ2F0ZWRcIiwgLy8gYmluZHMgb250byBhbiBleGlzdGluZyBmaWxhbWVudCdzIHBsdXMgZW5kIChib3VuZCBtaW51cyBlbG9uZ2F0ZWQgPSBuZXcgZGltZXJzKVxuICBcImhlYWRzSW5GaWVsZFwiLCAvLyBwbHVzIGVuZHMgaW4gdGhlIHBvbHltZXJpemF0aW9uIGZpZWxkLCBpLmUuIGFibGUgdG8gZWxvbmdhdGVcbiAgXCJoZWFkRm91bmRcIiwgLy8gY2FuZGlkYXRlcyB0aGF0IHNhdyBzdWNoIGEgcGx1cyBlbmQgbmVhcmJ5XG4gIFwiYnJhbmNoZWRcIiwgLy8gbmV3IGJyYW5jaGVzIG51Y2xlYXRlZCBvbiB0aGUgc2lkZSBvZiBhIGZpbGFtZW50IChsYW1lbGxpcG9kaXVtIGZpZWxkKVxuICBcImRlYnJhbmNoZWRcIiwgLy8gYnJhbmNoZXMgdGhhdCBjYW1lIG9mZiB0aGVpciBtb3RoZXJcbiAgXCJwb2ludENvbnRhY3RzXCIsXG4gIFwiYm9uZENvbnRhY3RzXCIsXG4gIFwicmVhck1pbnVzTG9zc1wiLFxuICBcImZyb250TWludXNMb3NzXCIsXG4gIFwicmVhclBsdXNMb3NzXCIsXG4gIFwidGV0aGVyUmVsZWFzZWRcIixcbl0gYXMgY29uc3Q7XG5cbnR5cGUgQ291bnRlcnMgPSBSZWNvcmQ8KHR5cGVvZiBURUxFTUVUUllfQ09VTlRFUlMpW251bWJlcl0sIG51bWJlcj47XG5cbmV4cG9ydCB0eXBlIEFjdGluU3RhdHMgPSB7XG4gIHJ1bjogc3RyaW5nO1xuICBmcmFtZTogbnVtYmVyO1xuICBzdGVwOiBudW1iZXI7XG4gIGFjdGluQ291bnQ6IG51bWJlcjtcbiAgbW9ub21lcnM6IG51bWJlcjtcbiAgZmlsYW1lbnRzOiBudW1iZXI7XG4gIGJyYW5jaGVzOiBudW1iZXI7IC8vIGZpbGFtZW50cyBoYW5naW5nIG9mZiB0aGUgc2lkZSBvZiBhbm90aGVyIG9uZVxuICBpblBvbHltZXI6IG51bWJlcjtcbiAgcG9zdGVyaW9yUG9seW1lckJlYWRzOiBudW1iZXI7IC8vIGxlZ2FjeSBtYXJrZXIteCBoYWxmLCBub3QgdGhlIGN1cnJlbnQgZ2VvbWV0cmljIHBvbGFyaXR5IGZyYW1lXG4gIGluc2lkZVBvbHltZXJCZWFkczogbnVtYmVyO1xuICBpbnNpZGVNb25vbWVyQmVhZHM6IG51bWJlcjtcbiAgZ0FjdGluTW9kZTogXCJ3ZWxsLW1peGVkXCIgfCBcInBhcnRpY2xlc1wiO1xuICBnQWN0aW5BbW91bnQ6IG51bWJlcjtcbiAgZ0FjdGluQ29uY2VudHJhdGlvbjogbnVtYmVyO1xuICBhY3RpbkJhbGFuY2VFcnJvcjogbnVtYmVyO1xuICBjcm9zc2luZ0ZpbGFtZW50Qm9uZHM6IG51bWJlcjtcbiAgbWVhblBvbHltZXJBZ2U6IG51bWJlcjtcbiAgbWF4UG9seW1lckFnZTogbnVtYmVyO1xuICBtZWFuTGVuZ3RoOiBudW1iZXI7XG4gIG1lZGlhbkxlbmd0aDogbnVtYmVyO1xuICBwOTBMZW5ndGg6IG51bWJlcjtcbiAgbWF4TGVuZ3RoOiBudW1iZXI7XG4gIC8vIGZpbGFtZW50IGNvdW50cyBwZXIgbGVuZ3RoIGJpbjogMiwgMy00LCA1LTgsIDktMTYsIDE3LTMyLCAzMy02NCwgNjUrXG4gIGhpc3RvZ3JhbTogbnVtYmVyW107XG4gIG1lZGlhbkJvbmRMZW5ndGg6IG51bWJlcjsgLy8gaW4gdW5pdHMgb2YgdGhlIGFjdGluIHJlc3QgbGVuZ3RoXG4gIG1lZGlhbkJlbmRBbmdsZTogbnVtYmVyOyAvLyBkZWdyZWVzIGJldHdlZW4gY29uc2VjdXRpdmUgYm9uZHMgb2YgYSBmaWxhbWVudDsgbG93ID0gc3RpZmZcbiAgYnJva2VuTGlua3M6IG51bWJlcjsgLy8gYS5oZWFkID0gYiBidXQgYi50YWlsICE9IGFcbiAgY3ljbGVzOiBudW1iZXI7XG4gIHBlclN0ZXA6IENvdW50ZXJzOyAvLyBldmVudCByYXRlcyBzaW5jZSB0aGUgcHJldmlvdXMgc2FtcGxlXG4gIGNlbGw6IENlbGxTaGFwZTtcbiAgZGlhZ25vc3RpY0tpbmQ/OiBcInNpbXVsYXRpb25cIiB8IFwiY29udGFjdC1yZWNoZWNrXCI7XG59O1xuXG4vLyBtZW1icmFuZSBzaGFwZSBpbiBwaXhlbHM7IG5vZGUgMCBpcyB0aGUgZnJvbnQgKHRoZSByaWdodCBzaWRlIGF0IHJlc2V0KSwgbm9kZSBjb3VudCAvIDIgdGhlIHJlYXJcbmV4cG9ydCB0eXBlIENlbGxTaGFwZSA9IHtcbiAgbGVmdDogbnVtYmVyOyAvLyBsZWZ0bW9zdCBtZW1icmFuZSB4XG4gIHJpZ2h0OiBudW1iZXI7IC8vIHJpZ2h0bW9zdCBtZW1icmFuZSB4XG4gIHRvcDogbnVtYmVyO1xuICBib3R0b206IG51bWJlcjtcbiAgZnJvbnRYOiBudW1iZXI7XG4gIHJlYXJYOiBudW1iZXI7XG4gIGNlbnRyb2lkWDogbnVtYmVyO1xuICBjZW50cm9pZFk6IG51bWJlcjtcbiAgbGVuZ3RoOiBudW1iZXI7IC8vIGZyb250IG5vZGUgdG8gcmVhciBub2RlXG4gIGFyZWE6IG51bWJlcjsgLy8gcmVsYXRpdmUgdG8gdGhlIGFyZWEgYXQgcmVzZXRcbiAgLy8gbWVhbiBtZW1icmFuZSBlZGdlIGxlbmd0aCBpbiB1bml0cyBvZiB0aGUgcmVzdCBsZW5ndGgsIG92ZXIgdGhlIHF1YXJ0ZXIgb2YgdGhlIG5vZGVzIGFyb3VuZCB0aGUgZnJvbnQgYW5kIHRoZSByZWFyXG4gIGZyb250U3BhY2luZzogbnVtYmVyO1xuICByZWFyU3BhY2luZzogbnVtYmVyO1xufTtcblxuY29uc3QgSElTVE9HUkFNX0VER0VTID0gWzIsIDQsIDgsIDE2LCAzMiwgNjRdO1xuXG5leHBvcnQgY2xhc3MgVGVsZW1ldHJ5QW5hbHlzaXMge1xuICBwcml2YXRlIGxhc3RDb3VudGVyczogbnVtYmVyW10gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBsYXN0U3RlcCA9IDA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBhY3RpbkNvdW50OiBudW1iZXIsXG4gICAgcHJpdmF0ZSBtZW1icmFuZUNvdW50OiBudW1iZXIsXG4gICAgcHJpdmF0ZSBtZW1icmFuZVJlc3RMZW5ndGg6IG51bWJlcixcbiAgICBwcml2YXRlIHJ1bjogc3RyaW5nLFxuICAgIHByaXZhdGUgd2VsbE1peGVkID0gZmFsc2VcbiAgKSB7fVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMubGFzdENvdW50ZXJzID0gbnVsbDtcbiAgICB0aGlzLmxhc3RTdGVwID0gMDtcbiAgfVxuXG4gIGFuYWx5emUoXG4gICAgYWN0aW46IEFycmF5QnVmZmVyLFxuICAgIG1lbWJyYW5lRGF0YTogQXJyYXlCdWZmZXIsXG4gICAgY291bnRlckRhdGE6IEFycmF5QnVmZmVyLFxuICAgIGZyYW1lOiBudW1iZXIsXG4gICAgc3RlcDogbnVtYmVyLFxuICAgIGVxdWlsaWJyaXVtTGluZURpc3RhbmNlOiBudW1iZXIsXG4gICAgdmVyaWZpY2F0aW9uID0gZmFsc2VcbiAgKSB7XG4gICAgY29uc3QgcHJldmlvdXNDb3VudGVycyA9IHRoaXMubGFzdENvdW50ZXJzLFxuICAgICAgcHJldmlvdXNTdGVwID0gdGhpcy5sYXN0U3RlcDtcbiAgICBjb25zdCB3b3JkcyA9IG5ldyBVaW50MzJBcnJheShhY3Rpbik7XG4gICAgY29uc3QgZmxvYXRzID0gbmV3IEZsb2F0MzJBcnJheSh3b3Jkcy5idWZmZXIpO1xuICAgIGNvbnN0IGNvdW50ZXJzID0gQXJyYXkuZnJvbShuZXcgVWludDMyQXJyYXkoY291bnRlckRhdGEpKTtcbiAgICBjb25zdCBtZW1icmFuZSA9IG5ldyBGbG9hdDMyQXJyYXkobWVtYnJhbmVEYXRhKTtcbiAgICBjb25zdCBjZWxsID0gdGhpcy5jZWxsU2hhcGUobWVtYnJhbmUpO1xuICAgIGNvbnN0IHN0YXRzID0gdGhpcy5jb21wdXRlKHdvcmRzLCBmbG9hdHMsIGNvdW50ZXJzLCBmcmFtZSwgc3RlcCwgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2UsIGNlbGwpO1xuICAgIGNvbnN0IGluc2lkZSA9IHBvbHlnb25PY2N1cGFuY3kobWVtYnJhbmUsIFNFR01FTlRfV09SRFMsIHRoaXMud2VsbE1peGVkKTtcbiAgICBjb25zdCBjcm9zc2luZyA9IHRoaXMud2VsbE1peGVkID8gcG9seWdvbkJvbmRDcm9zc2luZyhtZW1icmFuZSkgOiBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5hY3RpbkNvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IGRpc2Nvbm5lY3RlZCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gPT09IGkgJiYgd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBIRUFEXSA9PT0gaTtcbiAgICAgIGlmICh0aGlzLndlbGxNaXhlZCAmJiBkaXNjb25uZWN0ZWQpIGNvbnRpbnVlOyAvLyByZXNlcnZvaXIgZW50cmllcyBoYXZlIG5vIHNwYXRpYWwgY29vcmRpbmF0ZXNcbiAgICAgIGNvbnN0IHRhaWwgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdO1xuICAgICAgaWYgKFxuICAgICAgICBjcm9zc2luZyAmJlxuICAgICAgICB0YWlsICE9PSBpICYmXG4gICAgICAgIGNyb3NzaW5nKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdLCBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAzXSwgZmxvYXRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1t0YWlsICogU0VHTUVOVF9XT1JEUyArIDNdKVxuICAgICAgKVxuICAgICAgICBzdGF0cy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMrKztcbiAgICAgIGlmICghaW5zaWRlKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdLCBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAzXSkpIGNvbnRpbnVlO1xuICAgICAgaWYgKHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gPT09IGkgJiYgd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBIRUFEXSA9PT0gaSkgc3RhdHMuaW5zaWRlTW9ub21lckJlYWRzKys7XG4gICAgICBlbHNlIHN0YXRzLmluc2lkZVBvbHltZXJCZWFkcysrO1xuICAgIH1cbiAgICBzdGF0cy5nQWN0aW5Db25jZW50cmF0aW9uID0gdGhpcy53ZWxsTWl4ZWQgPyBzdGF0cy5nQWN0aW5BbW91bnQgLyAoKGNlbGwuYXJlYSAqICh0aGlzLm1lbWJyYW5lQ291bnQgKiB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCkgKiogMikgLyAoNCAqIE1hdGguUEkpKSA6IDA7XG4gICAgc3RhdHMuZGlhZ25vc3RpY0tpbmQgPSB2ZXJpZmljYXRpb24gPyBcImNvbnRhY3QtcmVjaGVja1wiIDogXCJzaW11bGF0aW9uXCI7XG4gICAgaWYgKHZlcmlmaWNhdGlvbikge1xuICAgICAgdGhpcy5sYXN0Q291bnRlcnMgPSBwcmV2aW91c0NvdW50ZXJzO1xuICAgICAgdGhpcy5sYXN0U3RlcCA9IHByZXZpb3VzU3RlcDtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXRzO1xuICB9XG5cbiAgcHJpdmF0ZSBjZWxsU2hhcGUoZmxvYXRzOiBGbG9hdDMyQXJyYXkpOiBDZWxsU2hhcGUge1xuICAgIGNvbnN0IG4gPSB0aGlzLm1lbWJyYW5lQ291bnQ7XG4gICAgY29uc3QgeCA9IChpOiBudW1iZXIpID0+IGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdO1xuICAgIGNvbnN0IHkgPSAoaTogbnVtYmVyKSA9PiBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAzXTtcbiAgICBsZXQgbGVmdCA9IEluZmluaXR5O1xuICAgIGxldCByaWdodCA9IC1JbmZpbml0eTtcbiAgICBsZXQgdG9wID0gSW5maW5pdHk7XG4gICAgbGV0IGJvdHRvbSA9IC1JbmZpbml0eTtcbiAgICAvLyBhcmVhLXdlaWdodGVkIGNlbnRyb2lkIChzaG9lbGFjZSlcbiAgICBsZXQgYXJlYSA9IDA7XG4gICAgbGV0IGN4ID0gMDtcbiAgICBsZXQgY3kgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBsZWZ0ID0gTWF0aC5taW4obGVmdCwgeChpKSk7XG4gICAgICByaWdodCA9IE1hdGgubWF4KHJpZ2h0LCB4KGkpKTtcbiAgICAgIHRvcCA9IE1hdGgubWluKHRvcCwgeShpKSk7XG4gICAgICBib3R0b20gPSBNYXRoLm1heChib3R0b20sIHkoaSkpO1xuICAgICAgY29uc3QgaiA9IChpICsgMSkgJSBuO1xuICAgICAgY29uc3QgY3Jvc3MgPSB4KGkpICogeShqKSAtIHgoaikgKiB5KGkpO1xuICAgICAgYXJlYSArPSBjcm9zcyAvIDI7XG4gICAgICBjeCArPSAoeChpKSArIHgoaikpICogY3Jvc3M7XG4gICAgICBjeSArPSAoeShpKSArIHkoaikpICogY3Jvc3M7XG4gICAgfVxuICAgIGNvbnN0IHJlYXIgPSBuID4+IDE7XG4gICAgY29uc3QgcXVhcnRlclNwYWNpbmcgPSAoY2VudGVyOiBudW1iZXIpID0+IHtcbiAgICAgIGxldCBzdW0gPSAwO1xuICAgICAgZm9yIChsZXQgayA9IC0obiA+PiAzKTsgayA8IG4gPj4gMzsgaysrKSB7XG4gICAgICAgIGNvbnN0IGkgPSAoY2VudGVyICsgayArIG4pICUgbjtcbiAgICAgICAgY29uc3QgaiA9IChpICsgMSkgJSBuO1xuICAgICAgICBzdW0gKz0gTWF0aC5oeXBvdCh4KGopIC0geChpKSwgeShqKSAtIHkoaSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN1bSAvIChuID4+IDIpIC8gdGhpcy5tZW1icmFuZVJlc3RMZW5ndGg7XG4gICAgfTtcbiAgICBjb25zdCByZXN0QXJlYSA9IChuICogdGhpcy5tZW1icmFuZVJlc3RMZW5ndGgpICoqIDIgLyAoNCAqIE1hdGguUEkpO1xuICAgIHJldHVybiB7XG4gICAgICBsZWZ0LFxuICAgICAgcmlnaHQsXG4gICAgICB0b3AsXG4gICAgICBib3R0b20sXG4gICAgICBmcm9udFg6IHgoMCksXG4gICAgICByZWFyWDogeChyZWFyKSxcbiAgICAgIGNlbnRyb2lkWDogY3ggLyAoNiAqIGFyZWEpLFxuICAgICAgY2VudHJvaWRZOiBjeSAvICg2ICogYXJlYSksXG4gICAgICBsZW5ndGg6IE1hdGguaHlwb3QoeCgwKSAtIHgocmVhciksIHkoMCkgLSB5KHJlYXIpKSxcbiAgICAgIGFyZWE6IE1hdGguYWJzKGFyZWEpIC8gcmVzdEFyZWEsXG4gICAgICBmcm9udFNwYWNpbmc6IHF1YXJ0ZXJTcGFjaW5nKDApLFxuICAgICAgcmVhclNwYWNpbmc6IHF1YXJ0ZXJTcGFjaW5nKHJlYXIpLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbXB1dGUod29yZHM6IFVpbnQzMkFycmF5LCBmbG9hdHM6IEZsb2F0MzJBcnJheSwgY291bnRlcnM6IG51bWJlcltdLCBmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3RMZW5ndGg6IG51bWJlciwgY2VsbDogQ2VsbFNoYXBlKTogQWN0aW5TdGF0cyB7XG4gICAgY29uc3QgbiA9IHRoaXMuYWN0aW5Db3VudDtcbiAgICBjb25zdCB2aXNpdGVkID0gbmV3IFVpbnQ4QXJyYXkobik7XG4gICAgY29uc3QgbGVuZ3RoczogbnVtYmVyW10gPSBbXTtcbiAgICBsZXQgbW9ub21lcnMgPSAwO1xuICAgIGxldCBicm9rZW5MaW5rcyA9IDA7XG4gICAgbGV0IGN5Y2xlcyA9IDA7XG4gICAgbGV0IGJyYW5jaGVzID0gMDtcbiAgICBsZXQgcG9zdGVyaW9yUG9seW1lckJlYWRzID0gMDtcbiAgICBsZXQgYWdlU3VtID0gMCxcbiAgICAgIG1heEFnZSA9IDA7XG4gICAgY29uc3QgYm9uZExlbmd0aHM6IG51bWJlcltdID0gW107XG4gICAgY29uc3QgYmVuZEFuZ2xlczogbnVtYmVyW10gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBjb25zdCB0YWlsID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXTtcbiAgICAgIGNvbnN0IGhlYWQgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdO1xuICAgICAgaWYgKHRhaWwgPT09IGkgJiYgaGVhZCA9PT0gaSkge1xuICAgICAgICBtb25vbWVycysrO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFnZSA9IGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDldO1xuICAgICAgYWdlU3VtICs9IGFnZTtcbiAgICAgIG1heEFnZSA9IE1hdGgubWF4KG1heEFnZSwgYWdlKTtcbiAgICAgIGlmIChmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAyXSA8IChjZWxsLmZyb250WCArIGNlbGwucmVhclgpIC8gMikgcG9zdGVyaW9yUG9seW1lckJlYWRzKys7XG4gICAgICBpZiAoaGVhZCAhPT0gaSAmJiB3b3Jkc1toZWFkICogU0VHTUVOVF9XT1JEUyArIFRBSUxdICE9PSBpKSB7XG4gICAgICAgIGJyb2tlbkxpbmtzKys7XG4gICAgICB9XG4gICAgICAvLyBhIGJyYW5jaCByb290J3MgdGFpbCBpcyBpdHMgbW90aGVyLCB3aG9zZSBoZWFkIHBvaW50cyBlbHNld2hlcmUgYWxvbmcgdGhlIG1vdGhlciBmaWxhbWVudFxuICAgICAgY29uc3QgaXNCcmFuY2hSb290ID0gdGFpbCAhPT0gaSAmJiB3b3Jkc1t0YWlsICogU0VHTUVOVF9XT1JEUyArIEhFQURdICE9PSBpO1xuICAgICAgaWYgKHRhaWwgIT09IGkgJiYgIWlzQnJhbmNoUm9vdCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGJyYW5jaGVzICs9IGlzQnJhbmNoUm9vdCA/IDEgOiAwO1xuICAgICAgLy8gYSBtaW51cyBlbmQgb3IgYnJhbmNoIHJvb3Q6IHdhbGsgdG8gdGhlIHBsdXMgZW5kXG4gICAgICBsZXQgbGVuZ3RoID0gMTtcbiAgICAgIGxldCBjdXJyZW50ID0gaTtcbiAgICAgIGxldCBwcmV2RHggPSAwO1xuICAgICAgbGV0IHByZXZEeSA9IDA7XG4gICAgICB2aXNpdGVkW2ldID0gMTtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIGNvbnN0IG5leHQgPSB3b3Jkc1tjdXJyZW50ICogU0VHTUVOVF9XT1JEUyArIEhFQURdO1xuICAgICAgICBpZiAobmV4dCA9PT0gY3VycmVudCkgYnJlYWs7XG4gICAgICAgIGlmICh2aXNpdGVkW25leHRdKSB7XG4gICAgICAgICAgY3ljbGVzKys7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHggPSBmbG9hdHNbbmV4dCAqIFNFR01FTlRfV09SRFMgKyAyXSAtIGZsb2F0c1tjdXJyZW50ICogU0VHTUVOVF9XT1JEUyArIDJdO1xuICAgICAgICBjb25zdCBkeSA9IGZsb2F0c1tuZXh0ICogU0VHTUVOVF9XT1JEUyArIDNdIC0gZmxvYXRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgM107XG4gICAgICAgIGJvbmRMZW5ndGhzLnB1c2goTWF0aC5oeXBvdChkeCwgZHkpKTtcbiAgICAgICAgaWYgKGxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBiZW5kQW5nbGVzLnB1c2goKE1hdGguYWJzKE1hdGguYXRhbjIocHJldkR4ICogZHkgLSBwcmV2RHkgKiBkeCwgcHJldkR4ICogZHggKyBwcmV2RHkgKiBkeSkpICogMTgwKSAvIE1hdGguUEkpO1xuICAgICAgICB9XG4gICAgICAgIHByZXZEeCA9IGR4O1xuICAgICAgICBwcmV2RHkgPSBkeTtcbiAgICAgICAgdmlzaXRlZFtuZXh0XSA9IDE7XG4gICAgICAgIGN1cnJlbnQgPSBuZXh0O1xuICAgICAgICBsZW5ndGgrKztcbiAgICAgIH1cbiAgICAgIGxlbmd0aHMucHVzaChsZW5ndGgpO1xuICAgIH1cblxuICAgIGxlbmd0aHMuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgIGNvbnN0IGluUG9seW1lciA9IGxlbmd0aHMucmVkdWNlKChzdW0sIGwpID0+IHN1bSArIGwsIDApO1xuICAgIGNvbnN0IGhpc3RvZ3JhbSA9IG5ldyBBcnJheShISVNUT0dSQU1fRURHRVMubGVuZ3RoICsgMSkuZmlsbCgwKTtcbiAgICBmb3IgKGNvbnN0IGwgb2YgbGVuZ3Rocykge1xuICAgICAgY29uc3QgYmluID0gSElTVE9HUkFNX0VER0VTLmZpbmRJbmRleCgoZWRnZSkgPT4gbCA8PSBlZGdlKTtcbiAgICAgIGhpc3RvZ3JhbVtiaW4gPT09IC0xID8gSElTVE9HUkFNX0VER0VTLmxlbmd0aCA6IGJpbl0rKztcbiAgICB9XG5cbiAgICBjb25zdCBzdGVwcyA9IE1hdGgubWF4KDEsIHN0ZXAgLSB0aGlzLmxhc3RTdGVwKTtcbiAgICBjb25zdCBwZXJTdGVwID0gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgICAgVEVMRU1FVFJZX0NPVU5URVJTLm1hcCgobmFtZSwgaykgPT4gW25hbWUsIHRoaXMubGFzdENvdW50ZXJzID8gKGNvdW50ZXJzW2tdIC0gdGhpcy5sYXN0Q291bnRlcnNba10pIC8gc3RlcHMgOiAwXSlcbiAgICApIGFzIENvdW50ZXJzO1xuICAgIHRoaXMubGFzdENvdW50ZXJzID0gY291bnRlcnM7XG4gICAgdGhpcy5sYXN0U3RlcCA9IHN0ZXA7XG5cbiAgICBjb25zdCBxdWFudGlsZSA9IChxOiBudW1iZXIpID0+IChsZW5ndGhzLmxlbmd0aCA/IGxlbmd0aHNbTWF0aC5taW4obGVuZ3Rocy5sZW5ndGggLSAxLCBNYXRoLmZsb29yKHEgKiBsZW5ndGhzLmxlbmd0aCkpXSA6IDApO1xuICAgIHJldHVybiB7XG4gICAgICBydW46IHRoaXMucnVuLFxuICAgICAgZnJhbWUsXG4gICAgICBzdGVwLFxuICAgICAgYWN0aW5Db3VudDogbixcbiAgICAgIG1vbm9tZXJzLFxuICAgICAgZmlsYW1lbnRzOiBsZW5ndGhzLmxlbmd0aCxcbiAgICAgIGJyYW5jaGVzLFxuICAgICAgaW5Qb2x5bWVyLFxuICAgICAgcG9zdGVyaW9yUG9seW1lckJlYWRzLFxuICAgICAgaW5zaWRlUG9seW1lckJlYWRzOiAwLFxuICAgICAgaW5zaWRlTW9ub21lckJlYWRzOiAwLFxuICAgICAgZ0FjdGluTW9kZTogdGhpcy53ZWxsTWl4ZWQgPyBcIndlbGwtbWl4ZWRcIiA6IFwicGFydGljbGVzXCIsXG4gICAgICBnQWN0aW5BbW91bnQ6IG1vbm9tZXJzLFxuICAgICAgZ0FjdGluQ29uY2VudHJhdGlvbjogMCxcbiAgICAgIGFjdGluQmFsYW5jZUVycm9yOiBtb25vbWVycyArIGluUG9seW1lciAtIG4sXG4gICAgICBjcm9zc2luZ0ZpbGFtZW50Qm9uZHM6IDAsXG4gICAgICBtZWFuUG9seW1lckFnZTogbiA+IG1vbm9tZXJzID8gYWdlU3VtIC8gKG4gLSBtb25vbWVycykgOiAwLFxuICAgICAgbWF4UG9seW1lckFnZTogbWF4QWdlLFxuICAgICAgbWVhbkxlbmd0aDogbGVuZ3Rocy5sZW5ndGggPyBpblBvbHltZXIgLyBsZW5ndGhzLmxlbmd0aCA6IDAsXG4gICAgICBtZWRpYW5MZW5ndGg6IHF1YW50aWxlKDAuNSksXG4gICAgICBwOTBMZW5ndGg6IHF1YW50aWxlKDAuOSksXG4gICAgICBtYXhMZW5ndGg6IGxlbmd0aHMubGVuZ3RoID8gbGVuZ3Roc1tsZW5ndGhzLmxlbmd0aCAtIDFdIDogMCxcbiAgICAgIGhpc3RvZ3JhbSxcbiAgICAgIG1lZGlhbkJvbmRMZW5ndGg6IGJvbmRMZW5ndGhzLmxlbmd0aCA/IGJvbmRMZW5ndGhzLnNvcnQoKGEsIGIpID0+IGEgLSBiKVtib25kTGVuZ3Rocy5sZW5ndGggPj4gMV0gLyByZXN0TGVuZ3RoIDogMCxcbiAgICAgIG1lZGlhbkJlbmRBbmdsZTogYmVuZEFuZ2xlcy5sZW5ndGggPyBiZW5kQW5nbGVzLnNvcnQoKGEsIGIpID0+IGEgLSBiKVtiZW5kQW5nbGVzLmxlbmd0aCA+PiAxXSA6IDAsXG4gICAgICBicm9rZW5MaW5rcyxcbiAgICAgIGN5Y2xlcyxcbiAgICAgIHBlclN0ZXAsXG4gICAgICBjZWxsLFxuICAgIH07XG4gIH1cbn1cbiIsImltcG9ydCB7IFRFTEVNRVRSWV9DT1VOVEVSUywgdHlwZSBBY3RpblN0YXRzIH0gZnJvbSBcIi4vdGVsZW1ldHJ5LWFuYWx5c2lzXCI7XG5leHBvcnQgeyBURUxFTUVUUllfQ09VTlRFUlMsIHR5cGUgQWN0aW5TdGF0cywgdHlwZSBDZWxsU2hhcGUgfSBmcm9tIFwiLi90ZWxlbWV0cnktYW5hbHlzaXNcIjtcblxuLy8gT25lIGluLWZsaWdodCByZWFkYmFjay93b3JrZXIgam9iLiBFdmVyeSBmb3JjZWQgYXNzYXkgY2hlY2twb2ludCB3YWl0cyBmb3IgYVxuLy8gZnJlc2ggZnVsbCBhbmFseXNpczsgaW50ZXJhY3RpdmUgcmVxdWVzdHMgY29hbGVzY2Ugd2hpbGUgdGhlIHdvcmtlciBpcyBidXN5LlxuZXhwb3J0IGNsYXNzIEFjdGluVGVsZW1ldHJ5IHtcbiAgcmVhZG9ubHkgY291bnRlckJ1ZmZlcjogR1BVQnVmZmVyO1xuICBwcml2YXRlIGFjdGluU3RhZ2luZzogR1BVQnVmZmVyO1xuICBwcml2YXRlIGNvdW50ZXJTdGFnaW5nOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgbWVtYnJhbmVTdGFnaW5nOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgcGVuZGluZzogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHdvcmtlciA9IG5ldyBXb3JrZXIobmV3IFVSTChcIi4vdGVsZW1ldHJ5Lndvcmtlci50c1wiLCBpbXBvcnQubWV0YS51cmwpLCB7IHR5cGU6IFwibW9kdWxlXCIgfSk7XG4gIHByaXZhdGUgam9iOiB7IGlkOiBudW1iZXI7IHJlc29sdmU6ICh2YWx1ZTogeyBzdGF0czogQWN0aW5TdGF0czsgYW5hbHlzaXNNczogbnVtYmVyIH0pID0+IHZvaWQ7IHJlamVjdDogKGVycm9yOiBFcnJvcikgPT4gdm9pZCB9IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgd29ya2VyRmFpbHVyZTogRXJyb3IgfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBuZXh0SWQgPSAwO1xuICBwcml2YXRlIGRpc3BsYXk6IEhUTUxQcmVFbGVtZW50O1xuICBwcml2YXRlIHN1bW1hcnk6IEhUTUxFbGVtZW50O1xuICBwcml2YXRlIHBvc3RUb1NlcnZlciA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoXCJ0ZWxlbWV0cnlcIikgPT09IFwiMVwiO1xuICByZWFkb25seSBoaXN0b3J5OiBBY3RpblN0YXRzW10gPSBbXTtcbiAgb25TYW1wbGU/OiAoc3RhdHM6IEFjdGluU3RhdHMpID0+IHZvaWQ7XG4gIHJlYWRvbmx5IHRpbWluZ3MgPSB7IHJlYWRiYWNrTXM6IDAsIGFuYWx5c2lzTXM6IDAsIHdvcmtlclJvdW5kVHJpcE1zOiAwLCB0b3RhbE1zOiAwLCBjb2FsZXNjZWRBdXRvbWF0aWNTYW1wbGVzOiAwIH07XG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgZGV2aWNlOiBHUFVEZXZpY2UsXG4gICAgcHJpdmF0ZSBhY3RpbkJ1ZmZlcjogR1BVQnVmZmVyLFxuICAgIGFjdGluQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lQnVmZmVyOiBHUFVCdWZmZXIsXG4gICAgbWVtYnJhbmVDb3VudDogbnVtYmVyLFxuICAgIG1lbWJyYW5lUmVzdExlbmd0aDogbnVtYmVyLFxuICAgIHByaXZhdGUgcnVuOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSBpbnRlcnZhbEZyYW1lcyA9IDMwLFxuICAgIHByaXZhdGUgd2VsbE1peGVkID0gZmFsc2VcbiAgKSB7XG4gICAgdGhpcy5jb3VudGVyQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBsYWJlbDogXCJUZWxlbWV0cnkgY291bnRlcnNcIixcbiAgICAgIHNpemU6IDQgKiBURUxFTUVUUllfQ09VTlRFUlMubGVuZ3RoLFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pO1xuICAgIGNvbnN0IHN0YWdpbmcgPSAoc2l6ZTogbnVtYmVyKSA9PiBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgdGhpcy5hY3RpblN0YWdpbmcgPSBzdGFnaW5nKGFjdGluQnVmZmVyLnNpemUpO1xuICAgIHRoaXMuY291bnRlclN0YWdpbmcgPSBzdGFnaW5nKHRoaXMuY291bnRlckJ1ZmZlci5zaXplKTtcbiAgICB0aGlzLm1lbWJyYW5lU3RhZ2luZyA9IHN0YWdpbmcobWVtYnJhbmVCdWZmZXIuc2l6ZSk7XG4gICAgdGhpcy53b3JrZXIub25tZXNzYWdlID0gKHsgZGF0YSB9KSA9PiB7XG4gICAgICBjb25zdCBqb2IgPSB0aGlzLmpvYjtcbiAgICAgIGlmICgham9iIHx8IGpvYi5pZCAhPT0gZGF0YS5pZCkgcmV0dXJuO1xuICAgICAgdGhpcy5qb2IgPSBudWxsO1xuICAgICAgaWYgKGRhdGEuZXJyb3IpIGpvYi5yZWplY3QobmV3IEVycm9yKGRhdGEuZXJyb3IpKTtcbiAgICAgIGVsc2Ugam9iLnJlc29sdmUoZGF0YSk7XG4gICAgfTtcbiAgICB0aGlzLndvcmtlci5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICB0aGlzLndvcmtlckZhaWx1cmUgPSBuZXcgRXJyb3IoYERpYWdub3N0aWMgd29ya2VyOiAke2V2ZW50Lm1lc3NhZ2V9YCk7XG4gICAgICB0aGlzLmpvYj8ucmVqZWN0KHRoaXMud29ya2VyRmFpbHVyZSk7XG4gICAgICB0aGlzLmpvYiA9IG51bGw7XG4gICAgfTtcbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiaW5pdFwiLCBjb25maWc6IFthY3RpbkNvdW50LCBtZW1icmFuZUNvdW50LCBtZW1icmFuZVJlc3RMZW5ndGgsIHJ1biwgd2VsbE1peGVkXSB9KTtcbiAgICBjb25zdCBkZXRhaWxzID0gT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGV0YWlsc1wiKSwgeyBpZDogXCJkaWFnbm9zdGljc1wiIH0pO1xuICAgIE9iamVjdC5hc3NpZ24oZGV0YWlscy5zdHlsZSwge1xuICAgICAgcG9zaXRpb246IFwiZml4ZWRcIixcbiAgICAgIGxlZnQ6IFwiMTBweFwiLFxuICAgICAgYm90dG9tOiBcIjEwcHhcIixcbiAgICAgIHBhZGRpbmc6IFwiNnB4XCIsXG4gICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgZm9udDogXCIxMXB4IG1vbm9zcGFjZVwiLFxuICAgICAgYmFja2dyb3VuZDogXCJyZ2JhKDAsMCwwLC44KVwiLFxuICAgICAgekluZGV4OiBcIjEwMDBcIixcbiAgICAgIG1heFdpZHRoOiBcImNhbGMoMTAwdncgLSAzMnB4KVwiLFxuICAgIH0pO1xuICAgIHRoaXMuc3VtbWFyeSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzdW1tYXJ5XCIpO1xuICAgIHRoaXMuc3VtbWFyeS50ZXh0Q29udGVudCA9IFwiRnVsbCBudW1lcmljYWwgZGlhZ25vc3RpY3Mgwrcgd29ya2VyXCI7XG4gICAgdGhpcy5kaXNwbGF5ID0gT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicHJlXCIpLCB7IGlkOiBcImFjdGluVGVsZW1ldHJ5XCIgfSk7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLmRpc3BsYXkuc3R5bGUsIHsgbWF4SGVpZ2h0OiBcIjIyMHB4XCIsIG92ZXJmbG93OiBcImF1dG9cIiwgbWFyZ2luOiBcIjZweCAwIDBcIiB9KTtcbiAgICBkZXRhaWxzLmFwcGVuZCh0aGlzLnN1bW1hcnksIHRoaXMuZGlzcGxheSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmQoZGV0YWlscyk7XG4gICAgKHdpbmRvdyBhcyBhbnkpLmFjdGluVGVsZW1ldHJ5ID0gdGhpcztcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBhZ2VoaWRlXCIsIChldmVudCkgPT4ge1xuICAgICAgaWYgKCFldmVudC5wZXJzaXN0ZWQpIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIH0pO1xuICB9XG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKHRoaXMuY291bnRlckJ1ZmZlciwgMCwgbmV3IFVpbnQzMkFycmF5KFRFTEVNRVRSWV9DT1VOVEVSUy5sZW5ndGgpKTtcbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IHR5cGU6IFwicmVzZXRcIiB9KTtcbiAgICB0aGlzLmhpc3RvcnkubGVuZ3RoID0gMDtcbiAgfVxuICBhc3luYyB1cGRhdGUoZnJhbWU6IG51bWJlciwgc3RlcDogbnVtYmVyLCByZXN0OiBudW1iZXIsIGZvcmNlID0gZmFsc2UsIHZlcmlmaWNhdGlvbiA9IGZhbHNlKSB7XG4gICAgaWYgKCFmb3JjZSAmJiBmcmFtZSAlIHRoaXMuaW50ZXJ2YWxGcmFtZXMgIT09IDApIHJldHVybjtcbiAgICBpZiAodGhpcy5wZW5kaW5nKSB7XG4gICAgICBpZiAoIWZvcmNlKSB7XG4gICAgICAgIHRoaXMudGltaW5ncy5jb2FsZXNjZWRBdXRvbWF0aWNTYW1wbGVzKys7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF3YWl0IHRoaXMucGVuZGluZzsgLy8gbmV2ZXIgcmV0dXJuIGFuIG9sZCBzbmFwc2hvdCBmb3IgYW4gZXhhY3Qtc3RlcCBhc3NheVxuICAgIH1cbiAgICBpZiAodGhpcy53b3JrZXJGYWlsdXJlKSB0aHJvdyB0aGlzLndvcmtlckZhaWx1cmU7XG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuY2FwdHVyZShmcmFtZSwgc3RlcCwgcmVzdCwgdmVyaWZpY2F0aW9uKTtcbiAgICB0aGlzLnBlbmRpbmcgPSBwcm9taXNlO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBwcm9taXNlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAodGhpcy5wZW5kaW5nID09PSBwcm9taXNlKSB0aGlzLnBlbmRpbmcgPSBudWxsO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIGFzeW5jIGNhcHR1cmUoZnJhbWU6IG51bWJlciwgc3RlcDogbnVtYmVyLCByZXN0OiBudW1iZXIsIHZlcmlmaWNhdGlvbiA9IGZhbHNlKSB7XG4gICAgY29uc3Qgc3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICBjb25zdCBlbmNvZGVyID0gdGhpcy5kZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcih0aGlzLmFjdGluQnVmZmVyLCAwLCB0aGlzLmFjdGluU3RhZ2luZywgMCwgdGhpcy5hY3RpblN0YWdpbmcuc2l6ZSk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIodGhpcy5jb3VudGVyQnVmZmVyLCAwLCB0aGlzLmNvdW50ZXJTdGFnaW5nLCAwLCB0aGlzLmNvdW50ZXJTdGFnaW5nLnNpemUpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHRoaXMubWVtYnJhbmVCdWZmZXIsIDAsIHRoaXMubWVtYnJhbmVTdGFnaW5nLCAwLCB0aGlzLm1lbWJyYW5lU3RhZ2luZy5zaXplKTtcbiAgICB0aGlzLmRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBjb25zdCBzdGFnZXMgPSBbdGhpcy5hY3RpblN0YWdpbmcsIHRoaXMubWVtYnJhbmVTdGFnaW5nLCB0aGlzLmNvdW50ZXJTdGFnaW5nXTtcbiAgICBsZXQgY29waWVzOiBBcnJheUJ1ZmZlcltdO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBtYXBwZWQgPSBhd2FpdCBQcm9taXNlLmFsbFNldHRsZWQoc3RhZ2VzLm1hcCgoYnVmZmVyKSA9PiBidWZmZXIubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKSkpO1xuICAgICAgY29uc3QgZmFpbGVkID0gbWFwcGVkLmZpbmQoKHJlc3VsdCkgPT4gcmVzdWx0LnN0YXR1cyA9PT0gXCJyZWplY3RlZFwiKTtcbiAgICAgIGlmIChmYWlsZWQ/LnN0YXR1cyA9PT0gXCJyZWplY3RlZFwiKSB0aHJvdyBmYWlsZWQucmVhc29uO1xuICAgICAgY29waWVzID0gc3RhZ2VzLm1hcCgoYnVmZmVyKSA9PiBidWZmZXIuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGZvciAoY29uc3QgYnVmZmVyIG9mIHN0YWdlcykgaWYgKGJ1ZmZlci5tYXBTdGF0ZSA9PT0gXCJtYXBwZWRcIikgYnVmZmVyLnVubWFwKCk7XG4gICAgfVxuICAgIHRoaXMudGltaW5ncy5yZWFkYmFja01zID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydDtcbiAgICBjb25zdCB3b3JrZXJTdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgaWQgPSArK3RoaXMubmV4dElkO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IG5ldyBQcm9taXNlPHsgc3RhdHM6IEFjdGluU3RhdHM7IGFuYWx5c2lzTXM6IG51bWJlciB9PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmpvYiA9IHsgaWQsIHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImFuYWx5emVcIiwgaWQsIGFjdGluOiBjb3BpZXNbMF0sIG1lbWJyYW5lOiBjb3BpZXNbMV0sIGNvdW50ZXJzOiBjb3BpZXNbMl0sIGZyYW1lLCBzdGVwLCByZXN0LCB2ZXJpZmljYXRpb24gfSwgY29waWVzKTtcbiAgICB9KTtcbiAgICB0aGlzLnRpbWluZ3Mud29ya2VyUm91bmRUcmlwTXMgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHdvcmtlclN0YXJ0O1xuICAgIHRoaXMudGltaW5ncy5hbmFseXNpc01zID0gcmVzdWx0LmFuYWx5c2lzTXM7XG4gICAgdGhpcy50aW1pbmdzLnRvdGFsTXMgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xuICAgIGNvbnN0IHMgPSByZXN1bHQuc3RhdHM7XG4gICAgdGhpcy5oaXN0b3J5LnB1c2gocyk7XG4gICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPiAxMDI0KSB0aGlzLmhpc3Rvcnkuc2hpZnQoKTtcbiAgICB0aGlzLnNob3cocyk7XG4gICAgdGhpcy5vblNhbXBsZT8uKHMpO1xuICAgIGlmICh0aGlzLnBvc3RUb1NlcnZlcilcbiAgICAgIGZldGNoKFwiL19fdGVsZW1ldHJ5XCIsIHsgbWV0aG9kOiBcIlBPU1RcIiwgaGVhZGVyczogeyBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LCBib2R5OiBKU09OLnN0cmluZ2lmeShzKSB9KS50aGVuKFxuICAgICAgICAocikgPT4gKHRoaXMucG9zdFRvU2VydmVyID0gci5vayksXG4gICAgICAgICgpID0+ICh0aGlzLnBvc3RUb1NlcnZlciA9IGZhbHNlKVxuICAgICAgKTtcbiAgfVxuICBwcml2YXRlIHNob3coczogQWN0aW5TdGF0cykge1xuICAgIGNvbnN0IGMgPSBzLmNlbGwsXG4gICAgICByID0gcy5wZXJTdGVwO1xuICAgIHRoaXMuc3VtbWFyeS50ZXh0Q29udGVudCA9IGBDaGVja2VkIHN0ZXAgJHtzLnN0ZXB9IMK3IG1hc3MgZXJyb3IgJHtzLmFjdGluQmFsYW5jZUVycm9yfSDCtyBGIGluc2lkZSAke3MuaW5zaWRlUG9seW1lckJlYWRzfS8ke3MuaW5Qb2x5bWVyfSDCtyBhcmVhICR7Yy5hcmVhLnRvRml4ZWQoNCl9IMK3IHdvcmtlciAke3RoaXMudGltaW5ncy5hbmFseXNpc01zLnRvRml4ZWQoMCl9IG1zYDtcbiAgICB0aGlzLmRpc3BsYXkudGV4dENvbnRlbnQgPSBbXG4gICAgICBgZmlsYW1lbnRzICR7cy5maWxhbWVudHN9IChicmFuY2hlcyAke3MuYnJhbmNoZXN9KSDCtyBwb2x5bWVyICR7KCgxMDAgKiBzLmluUG9seW1lcikgLyBzLmFjdGluQ291bnQpLnRvRml4ZWQoMSl9JWAsXG4gICAgICBgbGVuZ3RoIG1lYW4gJHtzLm1lYW5MZW5ndGgudG9GaXhlZCgxKX0gbWVkaWFuICR7cy5tZWRpYW5MZW5ndGh9IHA5MCAke3MucDkwTGVuZ3RofSBtYXggJHtzLm1heExlbmd0aH1gLFxuICAgICAgYHBvbHltZXIgYWdlIG1lYW4gJHtzLm1lYW5Qb2x5bWVyQWdlLnRvRml4ZWQoMCl9IG1heCAke3MubWF4UG9seW1lckFnZS50b0ZpeGVkKDApfSBmaXhlZCBzdGVwc2AsXG4gICAgICBgaGlzdCBbMnwzLTR8NS04fDktMTZ8MTctMzJ8MzMtNjR8NjUrXSAke3MuaGlzdG9ncmFtLmpvaW4oXCIgXCIpfWAsXG4gICAgICBgYm9uZC9yZXN0ICR7cy5tZWRpYW5Cb25kTGVuZ3RoLnRvRml4ZWQoMil9IMK3IGJlbmQgJHtzLm1lZGlhbkJlbmRBbmdsZS50b0ZpeGVkKDEpfcKwIMK3IGJyb2tlbiAke3MuYnJva2VuTGlua3N9IMK3IGN5Y2xlcyAke3MuY3ljbGVzfWAsXG4gICAgICBgZXZlbnRzL3N0ZXAgJHtPYmplY3QuZW50cmllcyhyKVxuICAgICAgICAubWFwKChbaywgdl0pID0+IGAke2t9OiR7di50b0ZpeGVkKDMpfWApXG4gICAgICAgIC5qb2luKFwiIFwiKX1gLFxuICAgICAgYHggYm91bmRzICR7Yy5sZWZ0LnRvRml4ZWQoMSl94oCTJHtjLnJpZ2h0LnRvRml4ZWQoMSl9IMK3IG1hdGVyaWFsIG1hcmtlcnMgJHtjLnJlYXJYLnRvRml4ZWQoMSl9LyR7Yy5mcm9udFgudG9GaXhlZCgxKX0gwrcgY2VudHJvaWQgJHtjLmNlbnRyb2lkWC50b0ZpeGVkKDEpfSwke2MuY2VudHJvaWRZLnRvRml4ZWQoMSl9YCxcbiAgICAgIGBsZW5ndGggJHtjLmxlbmd0aC50b0ZpeGVkKDEpfSDCtyBhcmVhICR7Yy5hcmVhLnRvRml4ZWQoNil9IMK3IHNwYWNpbmcgZnJvbnQvcmVhciAke2MuZnJvbnRTcGFjaW5nLnRvRml4ZWQoMil9LyR7Yy5yZWFyU3BhY2luZy50b0ZpeGVkKDIpfWAsXG4gICAgICB0aGlzLndlbGxNaXhlZFxuICAgICAgICA/IGBHIHBvb2wgJHtzLmdBY3RpbkFtb3VudH0gKCR7cy5nQWN0aW5Db25jZW50cmF0aW9uLnRvRml4ZWQoMyl9L3B4wrIpIMK3IGNyb3NzaW5nIGJvbmRzICR7cy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHN9YFxuICAgICAgICA6IGBpbnNpZGU6ICR7cy5pbnNpZGVQb2x5bWVyQmVhZHN9IEYgKyAke3MuaW5zaWRlTW9ub21lckJlYWRzfSBHIGJlYWRzYCxcbiAgICAgIGBsZWdhY3kgbWFya2VyLXggaGFsZiBwb2x5bWVyICR7cy5wb3N0ZXJpb3JQb2x5bWVyQmVhZHN9IMK3IHJlYWRiYWNrICR7dGhpcy50aW1pbmdzLnJlYWRiYWNrTXMudG9GaXhlZCgxKX0gbXMgwrcgd29ya2VyIHJvdW5kIHRyaXAgJHt0aGlzLnRpbWluZ3Mud29ya2VyUm91bmRUcmlwTXMudG9GaXhlZCgxKX0gbXNgLFxuICAgIF0uam9pbihcIlxcblwiKTtcbiAgfVxuICBzbmFwc2hvdChmcmFtZTogbnVtYmVyLCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgY29uc3QgZXZlcnkgPSBOdW1iZXIobmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInNuYXBzaG90RXZlcnlcIikpO1xuICAgIGlmICghZXZlcnkgfHwgZnJhbWUgJSBldmVyeSAhPT0gMCkgcmV0dXJuO1xuICAgIGNhbnZhcy50b0Jsb2IoKGJsb2IpID0+IGJsb2IgJiYgZmV0Y2goYC9fX3NuYXBzaG90P25hbWU9JHtlbmNvZGVVUklDb21wb25lbnQoYCR7dGhpcy5ydW59LSR7ZnJhbWV9YCl9YCwgeyBtZXRob2Q6IFwiUE9TVFwiLCBib2R5OiBibG9iIH0pKTtcbiAgfVxufVxuIiwiXG5mdW5jdGlvbiB0aHJvd0RldGVjdGlvbkVycm9yKGVycm9yOiBzdHJpbmcpOiBuZXZlciB7XG4gIGNvbnN0IG5vdGljZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3I8SFRNTEVsZW1lbnQ+KFwiLndlYmdwdS1ub3Qtc3VwcG9ydGVkXCIpO1xuICBpZiAobm90aWNlKSBub3RpY2Uuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICB0aHJvdyBuZXcgRXJyb3IoXCJDb3VsZCBub3QgaW5pdGlhbGl6ZSBXZWJHUFU6IFwiICsgZXJyb3IpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVxdWVzdERldmljZShcbiAgb3B0aW9uczogR1BVUmVxdWVzdEFkYXB0ZXJPcHRpb25zID0ge1xuICAgIHBvd2VyUHJlZmVyZW5jZTogXCJoaWdoLXBlcmZvcm1hbmNlXCIsXG4gIH0sXG4gIHJlcXVpcmVkRmVhdHVyZXM6IEdQVUZlYXR1cmVOYW1lW10gPSBbXSxcbiAgcmVxdWlyZWRMaW1pdHM6IFJlY29yZDxzdHJpbmcsIHVuZGVmaW5lZCB8IG51bWJlcj4gPSB7XG4gICAgbWF4U3RvcmFnZVRleHR1cmVzUGVyU2hhZGVyU3RhZ2U6IDgsXG4gIH1cbik6IFByb21pc2U8R1BVRGV2aWNlPiB7XG4gIGlmICghbmF2aWdhdG9yLmdwdSkgdGhyb3dEZXRlY3Rpb25FcnJvcihcIldlYkdQVSBOT1QgU3VwcG9ydGVkXCIpO1xuXG4gIGNvbnN0IGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKG9wdGlvbnMpO1xuICBpZiAoIWFkYXB0ZXIpIHRocm93RGV0ZWN0aW9uRXJyb3IoXCJObyBHUFUgYWRhcHRlciBmb3VuZFwiKTtcblxuICBjb25zdCBjYW5UaW1lc3RhbXAgPSBhZGFwdGVyLmZlYXR1cmVzLmhhcyhcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgY29uc3QgZmVhdHVyZXMgPSBbLi4ucmVxdWlyZWRGZWF0dXJlc107XG5cbiAgaWYgKGNhblRpbWVzdGFtcCkge1xuICAgIGZlYXR1cmVzLnB1c2goXCJ0aW1lc3RhbXAtcXVlcnlcIik7XG4gIH1cblxuICAvLyBJbnN0ZWFkIG9mIHBhc3NpbmcgYSByZWNvcmQgdGhhdCBtaWdodCBoYXZlIHVuZGVmaW5lZCB2YWx1ZXMsIGZpbHRlciB0aGVtIG91dDpcbiAgY29uc3QgbGltaXRzID0gT2JqZWN0LmZyb21FbnRyaWVzKE9iamVjdC5lbnRyaWVzKHJlcXVpcmVkTGltaXRzKS5maWx0ZXIoKFtrZXksIHZhbHVlXSkgPT4gdmFsdWUgIT09IHVuZGVmaW5lZCkpIGFzIFJlY29yZDxzdHJpbmcsIG51bWJlcj47XG5cbiAgLy8gVGhlbiB1c2UgdGhlIGZpbHRlcmVkIGxpbWl0cyBvYmplY3Q6XG4gIHJldHVybiBhZGFwdGVyLnJlcXVlc3REZXZpY2Uoe1xuICAgIHJlcXVpcmVkRmVhdHVyZXM6IGZlYXR1cmVzLFxuICAgIHJlcXVpcmVkTGltaXRzOiBsaW1pdHMsXG4gICAgLi4uKGNhblRpbWVzdGFtcCA/IFtcInRpbWVzdGFtcC1xdWVyeVwiXSA6IFtdKSxcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25maWd1cmVDYW52YXMoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBpZDogc3RyaW5nLFxuICBzaXplID0geyB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0IH1cbik6IHtcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudDtcbiAgY29udGV4dDogR1BVQ2FudmFzQ29udGV4dDtcbiAgZm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0O1xuICBzaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH07XG59IHtcbiAgY29uc3QgY2FudmFzID0gT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpLCBzaXplKTtcbiAgY2FudmFzLmlkID0gaWQ7XG4gIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJncHVcIik7XG4gIGlmICghY29udGV4dCkgdGhyb3dEZXRlY3Rpb25FcnJvcihcIkNhbnZhcyBkb2VzIG5vdCBzdXBwb3J0IFdlYkdQVVwiKTtcblxuICBjb25zdCBmb3JtYXQgPSBuYXZpZ2F0b3IuZ3B1LmdldFByZWZlcnJlZENhbnZhc0Zvcm1hdCgpO1xuICBjb250ZXh0LmNvbmZpZ3VyZSh7XG4gICAgZGV2aWNlOiBkZXZpY2UsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgdXNhZ2U6IEdQVVRleHR1cmVVc2FnZS5SRU5ERVJfQVRUQUNITUVOVCxcbiAgICBhbHBoYU1vZGU6IFwicHJlbXVsdGlwbGllZFwiLFxuICB9KTtcblxuICByZXR1cm4geyBjYW52YXM6IGNhbnZhcywgY29udGV4dDogY29udGV4dCwgZm9ybWF0OiBmb3JtYXQsIHNpemU6IHNpemUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNoYWRlcihkZXZpY2U6IEdQVURldmljZSwgY29kZTogc3RyaW5nLCBpbmNsdWRlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBQcm9taXNlPEdQVVNoYWRlck1vZHVsZT4ge1xuICAvLyBQcm9jZXNzIHRoZSBjb2RlIHdpdGggaW1wb3J0c1xuICBjb25zdCBwcm9jZXNzZWRDb2RlID0gcHJlcGVuZEluY2x1ZGVzKGNvZGUsIGluY2x1ZGVzKTtcblxuICBjb25zdCBtb2R1bGUgPSBkZXZpY2UuY3JlYXRlU2hhZGVyTW9kdWxlKHsgY29kZTogcHJvY2Vzc2VkQ29kZSB9KTtcbiAgY29uc3QgaW5mbyA9IGF3YWl0IG1vZHVsZS5nZXRDb21waWxhdGlvbkluZm8oKTtcbiAgaWYgKGluZm8ubWVzc2FnZXMubGVuZ3RoID4gMCkge1xuICAgIGZvciAobGV0IG1lc3NhZ2Ugb2YgaW5mby5tZXNzYWdlcykge1xuICAgICAgY29uc29sZS53YXJuKGAke21lc3NhZ2UubWVzc2FnZX0gXG4gIGF0IGxpbmUgJHttZXNzYWdlLmxpbmVOdW19YCk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGNvbXBpbGUgc2hhZGVyYCk7XG4gIH1cbiAgcmV0dXJuIG1vZHVsZTtcbn1cblxuLyoqXG4gKiBQcm9jZXNzIGltcG9ydCBzdGF0ZW1lbnRzIGluIHNoYWRlciBjb2RlIHRvIGluY2x1ZGUgdGhlIGNvbnRlbnQgb2YgcmVmZXJlbmNlZCBtb2R1bGVzXG4gKiBAcGFyYW0gY29kZSAtIFRoZSBzaGFkZXIgY29kZSBjb250YWluaW5nIGltcG9ydCBzdGF0ZW1lbnRzXG4gKiBAcGFyYW0gaW5jbHVkZXMgLSBPcHRpb25hbCBtYXBwaW5nIG9mIG1vZHVsZSBuYW1lcyB0byB0aGVpciBjb250ZW50XG4gKiBAcmV0dXJucyBUaGUgcHJvY2Vzc2VkIHNoYWRlciBjb2RlIHdpdGggaW1wb3J0cyByZXNvbHZlZFxuICovXG5mdW5jdGlvbiBwcmVwZW5kSW5jbHVkZXMoY29kZTogc3RyaW5nLCBpbmNsdWRlcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz4pOiBzdHJpbmcge1xuICAvLyBFeHRyYWN0IGltcG9ydCBzdGF0ZW1lbnRzXG4gIGNvbnN0IGltcG9ydFJlZ2V4ID0gL14jaW1wb3J0XFxzKyhbYS16QS1aMC05X10rKTo6KFthLXpBLVowLTlfXSspL2dtO1xuICBjb25zdCBpbXBvcnRzID0gWy4uLmNvZGUubWF0Y2hBbGwoaW1wb3J0UmVnZXgpXTtcblxuICAvLyBCdWlsZCBhIG1hcCBvZiBpbXBvcnRzIHRvIHRoZWlyIGNvbnRlbnRcbiAgY29uc3QgaW5jbHVkZXNUb0FkZDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXG4gIC8vIFByb2Nlc3MgZWFjaCBpbXBvcnRcbiAgZm9yIChjb25zdCBbZnVsbE1hdGNoLCBuYW1lc3BhY2UsIG1vZHVsZU5hbWVdIG9mIGltcG9ydHMpIHtcbiAgICBpZiAobmFtZXNwYWNlID09PSBcImluY2x1ZGVzXCIgJiYgaW5jbHVkZXMgJiYgbW9kdWxlTmFtZSBpbiBpbmNsdWRlcykge1xuICAgICAgaW5jbHVkZXNUb0FkZFtmdWxsTWF0Y2hdID0gaW5jbHVkZXNbbW9kdWxlTmFtZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybihgQ291bGQgbm90IHJlc29sdmUgaW1wb3J0OiAke2Z1bGxNYXRjaH1gKTtcbiAgICB9XG4gIH1cblxuICAvLyBSZXBsYWNlIGltcG9ydCBzdGF0ZW1lbnRzIHdpdGggdGhlaXIgY29udGVudFxuICBsZXQgcHJvY2Vzc2VkQ29kZSA9IGNvZGU7XG4gIGZvciAoY29uc3QgW2ltcG9ydFN0YXRlbWVudCwgY29udGVudF0gb2YgT2JqZWN0LmVudHJpZXMoaW5jbHVkZXNUb0FkZCkpIHtcbiAgICAvLyBSZXBsYWNlIHRoZSBpbXBvcnQgc3RhdGVtZW50IHdpdGggdGhlIGNvbnRlbnRcbiAgICBwcm9jZXNzZWRDb2RlID0gcHJvY2Vzc2VkQ29kZS5yZXBsYWNlKGltcG9ydFN0YXRlbWVudCwgY29udGVudCk7XG4gIH1cblxuICByZXR1cm4gcHJvY2Vzc2VkQ29kZTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVBlcmZvcm1hbmNlUXVlcmllcyhkZXZpY2U6IEdQVURldmljZSk6IFByb21pc2U8e1xuICBxdWVyeVNldDogR1BVUXVlcnlTZXQ7XG4gIHJlc29sdmVCdWZmZXI6IEdQVUJ1ZmZlcjtcbiAgcmVzdWx0QnVmZmVyOiBHUFVCdWZmZXI7XG59PiB7XG4gIGNvbnN0IGNhblRpbWVzdGFtcCA9IGRldmljZS5mZWF0dXJlcy5oYXMoXCJ0aW1lc3RhbXAtcXVlcnlcIik7XG4gIC8vIGlmICghY2FuVGltZXN0YW1wKSB7XG4gIC8vICAgY29uc29sZS53YXJuKFwiVGltZXN0YW1wIHF1ZXJpZXMgYXJlIG5vdCBzdXBwb3J0ZWQgYnkgdGhpcyBkZXZpY2UuXCIpO1xuICAvLyAgIHJldHVybiB7fTtcbiAgLy8gfVxuICBjb25zdCBxdWVyeVNldCA9IGRldmljZS5jcmVhdGVRdWVyeVNldCh7XG4gICAgdHlwZTogXCJ0aW1lc3RhbXBcIixcbiAgICBjb3VudDogMixcbiAgfSk7XG5cbiAgY29uc3QgcmVzb2x2ZUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIHNpemU6IHF1ZXJ5U2V0LmNvdW50ICogOCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuUVVFUllfUkVTT0xWRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICB9KTtcblxuICBjb25zdCByZXN1bHRCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBzaXplOiByZXNvbHZlQnVmZmVyLnNpemUsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQsXG4gIH0pO1xuXG4gIHJldHVybiB7IHF1ZXJ5U2V0LCByZXNvbHZlQnVmZmVyLCByZXN1bHRCdWZmZXIgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwSW50ZXJhY3Rpb25zKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCB8IE9mZnNjcmVlbkNhbnZhcyxcbiAgdGV4dHVyZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9LFxuICBzaXplOiBudW1iZXIgPSAxMFxuKToge1xuICBpbnRlcmFjdGlvbnM6IHtcbiAgICBkYXRhOiBGbG9hdDMyQXJyYXk7XG4gICAgYnVmZmVyOiBHUFVCdWZmZXI7XG4gIH07XG4gIGNvbnRyb2xzOiB7XG4gICAgZGF0YTogQXJyYXlCdWZmZXI7XG4gICAgYnVmZmVyOiBHUFVCdWZmZXI7XG4gIH07XG4gIHR5cGU6IEdQVUJ1ZmZlckJpbmRpbmdUeXBlO1xufSB7XG4gIGxldCB1bmlmb3JtQnVmZmVyRGF0YSA9IG5ldyBGbG9hdDMyQXJyYXkoNCk7XG4gIGxldCBjb250cm9sc0J1ZmZlckRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoMzM2KTtcblxuICB2YXIgc2lnbiA9IDE7XG5cbiAgbGV0IHBvc2l0aW9uID0geyB4OiAwLCB5OiAwIH07XG4gIGxldCB2ZWxvY2l0eSA9IHsgeDogMCwgeTogMCB9O1xuXG4gIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbcG9zaXRpb24ueCwgcG9zaXRpb24ueV0pO1xuICBpZiAoY2FudmFzIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAvLyBkaXNhYmxlIGNvbnRleHQgbWVudVxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwiY29udGV4dG1lbnVcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xuXG4gICAgLy8gbW92ZSBldmVudHNcbiAgICBbXCJtb3VzZW1vdmVcIiwgXCJ0b3VjaG1vdmVcIl0uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgbGV0IGNsaWVudFggPSAwO1xuICAgICAgICAgIGxldCBjbGllbnRZID0gMDtcblxuICAgICAgICAgIGlmIChldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQpIHtcbiAgICAgICAgICAgIGNsaWVudFggPSBldmVudC5jbGllbnRYO1xuICAgICAgICAgICAgY2xpZW50WSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgICAgfSBlbHNlIGlmIChldmVudCBpbnN0YW5jZW9mIFRvdWNoRXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xuICAgICAgICAgICAgY2xpZW50WCA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WDtcbiAgICAgICAgICAgIGNsaWVudFkgPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgcG9zaXRpb24ueCA9IGNsaWVudFggLSByZWN0LmxlZnQ7XG4gICAgICAgICAgcG9zaXRpb24ueSA9IGNsaWVudFkgLSByZWN0LnRvcDtcblxuICAgICAgICAgIC8vIFNjYWxlIGZyb20gQ1NTIHBpeGVscyB0byB0ZXh0dXJlIGNvb3JkaW5hdGVzXG4gICAgICAgICAgY29uc3QgeCA9IE1hdGguZmxvb3IoKHBvc2l0aW9uLnggLyByZWN0LndpZHRoKSAqIHRleHR1cmUud2lkdGgpO1xuICAgICAgICAgIGNvbnN0IHkgPSBNYXRoLmZsb29yKChwb3NpdGlvbi55IC8gcmVjdC5oZWlnaHQpICogdGV4dHVyZS5oZWlnaHQpO1xuXG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFt4LCB5XSk7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gem9vbSBldmVudHMgVE9ETyhAZ3N6ZXApIGFkZCBwaW5jaCBhbmQgc2Nyb2xsIGZvciB0b3VjaCBkZXZpY2VzXG4gICAgW1wid2hlZWxcIl0uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgICAgICAgY2FzZSBldmVudCBpbnN0YW5jZW9mIFdoZWVsRXZlbnQ6XG4gICAgICAgICAgICAgIHZlbG9jaXR5LnggPSBldmVudC5kZWx0YVk7XG4gICAgICAgICAgICAgIHZlbG9jaXR5LnkgPSBldmVudC5kZWx0YVk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNpemUgKz0gdmVsb2NpdHkueTtcbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3NpemVdLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyBjbGljayBldmVudHMgVE9ETyhAZ3N6ZXApIGltcGxlbWVudCByaWdodCBjbGljayBlcXVpdmFsZW50IGZvciB0b3VjaCBkZXZpY2VzXG4gICAgW1wibW91c2Vkb3duXCIsIFwidG91Y2hzdGFydFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICBjYXNlIGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudDpcbiAgICAgICAgICAgICAgc2lnbiA9IDEgLSBldmVudC5idXR0b247XG4gICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICBjYXNlIGV2ZW50IGluc3RhbmNlb2YgVG91Y2hFdmVudDpcbiAgICAgICAgICAgICAgc2lnbiA9IGV2ZW50LnRvdWNoZXMubGVuZ3RoID4gMSA/IC0xIDogMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtzaWduICogc2l6ZV0sIDIpO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgICBbXCJtb3VzZXVwXCIsIFwidG91Y2hlbmRcIl0uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbTmFOXSwgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuICB9XG4gIGNvbnN0IHVuaWZvcm1CdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJJbnRlcmFjdGlvbiBCdWZmZXJcIixcbiAgICBzaXplOiB1bmlmb3JtQnVmZmVyRGF0YS5ieXRlTGVuZ3RoLFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5VTklGT1JNIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gIH0pO1xuXG4gIGNvbnN0IGNvbnRyb2xzQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgbGFiZWw6IFwiQ29udHJvbHMgQnVmZmVyXCIsXG4gICAgc2l6ZTogY29udHJvbHNCdWZmZXJEYXRhLmJ5dGVMZW5ndGgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBpbnRlcmFjdGlvbnM6IHsgZGF0YTogdW5pZm9ybUJ1ZmZlckRhdGEsIGJ1ZmZlcjogdW5pZm9ybUJ1ZmZlciB9LFxuICAgIGNvbnRyb2xzOiB7IGRhdGE6IGNvbnRyb2xzQnVmZmVyRGF0YSwgYnVmZmVyOiBjb250cm9sc0J1ZmZlciB9LFxuICAgIHR5cGU6IFwidW5pZm9ybVwiLFxuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBUZXh0dXJlcyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGJpbmRpbmdzOiBudW1iZXJbXSxcbiAgZGF0YTogeyBba2V5OiBudW1iZXJdOiBudW1iZXJbXVtdW10gfSxcbiAgc2l6ZToge1xuICAgIGRlcHRoT3JBcnJheUxheWVycz86IHsgW2tleTogbnVtYmVyXTogbnVtYmVyIH07XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgfSxcbiAgZm9ybWF0PzogeyBba2V5OiBudW1iZXJdOiBHUFVUZXh0dXJlRm9ybWF0IH1cbik6IHtcbiAgY2FudmFzOiB7XG4gICAgYnVmZmVyOiBHUFVCdWZmZXI7XG4gICAgZGF0YTogVWludDMyQXJyYXk7XG4gICAgdHlwZTogR1BVQnVmZmVyQmluZGluZ1R5cGU7XG4gIH07XG4gIHRleHR1cmVzOiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmUgfTtcbiAgYmluZGluZ0xheW91dDogeyBba2V5OiBudW1iZXJdOiBHUFVTdG9yYWdlVGV4dHVyZUJpbmRpbmdMYXlvdXQgfTtcbiAgc2l6ZToge1xuICAgIGRlcHRoT3JBcnJheUxheWVycz86IHsgW2tleTogbnVtYmVyXTogbnVtYmVyIH07XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgfTtcbn0ge1xuICBjb25zdCB0ZXh0dXJlczogeyBba2V5OiBudW1iZXJdOiBHUFVUZXh0dXJlIH0gPSB7fTtcbiAgY29uc3QgYmluZGluZ0xheW91dDogeyBba2V5OiBudW1iZXJdOiBHUFVTdG9yYWdlVGV4dHVyZUJpbmRpbmdMYXlvdXQgfSA9IHt9O1xuICBjb25zdCBkZXB0aE9yQXJyYXlMYXllcnMgPSBzaXplLmRlcHRoT3JBcnJheUxheWVycyB8fCB7fTtcbiAgY29uc3QgREVGQVVMVF9GT1JNQVQgPSBcInIzMmZsb2F0XCI7XG5cbiAgYmluZGluZ3MuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgdGV4dHVyZXNba2V5XSA9IGRldmljZS5jcmVhdGVUZXh0dXJlKHtcbiAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLkNPUFlfRFNULFxuICAgICAgZm9ybWF0OiBmb3JtYXQgJiYga2V5IGluIGZvcm1hdCA/IGZvcm1hdFtrZXldIDogREVGQVVMVF9GT1JNQVQsXG4gICAgICBzaXplOiB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgICAgICBkZXB0aE9yQXJyYXlMYXllcnM6IGtleSBpbiBkZXB0aE9yQXJyYXlMYXllcnMgPyBkZXB0aE9yQXJyYXlMYXllcnNba2V5XSA6IDEsXG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcblxuICBPYmplY3Qua2V5cyh0ZXh0dXJlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgY29uc3QgbGF5ZXJzID0ga2V5IGluIGRlcHRoT3JBcnJheUxheWVycyA/IGRlcHRoT3JBcnJheUxheWVyc1trZXldIDogMTtcblxuICAgIGJpbmRpbmdMYXlvdXRba2V5XSA9IHtcbiAgICAgIGZvcm1hdDogZm9ybWF0ICYmIGtleSBpbiBmb3JtYXQgPyBmb3JtYXRba2V5XSA6IERFRkFVTFRfRk9STUFULFxuICAgICAgYWNjZXNzOiBcInJlYWQtd3JpdGVcIixcbiAgICAgIHZpZXdEaW1lbnNpb246IGxheWVycyA+IDEgPyBcIjJkLWFycmF5XCIgOiBcIjJkXCIsXG4gICAgfTtcblxuICAgIGNvbnN0IGFycmF5ID0ga2V5IGluIGRhdGEgPyBuZXcgRmxvYXQzMkFycmF5KGZsYXR0ZW4oZGF0YVtrZXldKSkgOiBuZXcgRmxvYXQzMkFycmF5KHNpemUud2lkdGggKiBzaXplLmhlaWdodCAqIGxheWVycyk7XG5cbiAgICBjb25zdCBjaGFubmVscyA9IGNoYW5uZWxDb3VudChiaW5kaW5nTGF5b3V0W2tleV0uZm9ybWF0KTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVUZXh0dXJlKFxuICAgICAgeyB0ZXh0dXJlOiB0ZXh0dXJlc1trZXldIH0sXG4gICAgICAvKmRhdGE9Ki8gYXJyYXksXG4gICAgICAvKmRhdGFMYXlvdXQ9Ki8ge1xuICAgICAgICBvZmZzZXQ6IDAsXG4gICAgICAgIGJ5dGVzUGVyUm93OiBzaXplLndpZHRoICogYXJyYXkuQllURVNfUEVSX0VMRU1FTlQgKiBjaGFubmVscyxcbiAgICAgICAgcm93c1BlckltYWdlOiBzaXplLmhlaWdodCxcbiAgICAgIH0sXG4gICAgICAvKnNpemU9Ki8ge1xuICAgICAgICB3aWR0aDogc2l6ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCxcbiAgICAgICAgZGVwdGhPckFycmF5TGF5ZXJzOiBsYXllcnMsXG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG5cbiAgbGV0IGNhbnZhc0RhdGEgPSBuZXcgVWludDMyQXJyYXkoW3NpemUud2lkdGgsIHNpemUuaGVpZ2h0LCAwLCAwLCAwLCAwXSk7XG4gIGNvbnN0IGNhbnZhc0J1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIGxhYmVsOiBcIkNhbnZhcyBCdWZmZXJcIixcbiAgICBzaXplOiBjYW52YXNEYXRhLmJ5dGVMZW5ndGgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGNhbnZhc0J1ZmZlciwgLypvZmZzZXQ9Ki8gMCwgLypkYXRhPSovIGNhbnZhc0RhdGEpO1xuXG4gIHJldHVybiB7XG4gICAgY2FudmFzOiB7XG4gICAgICBidWZmZXI6IGNhbnZhc0J1ZmZlcixcbiAgICAgIGRhdGE6IGNhbnZhc0RhdGEsXG4gICAgICB0eXBlOiBcInVuaWZvcm1cIixcbiAgICB9LFxuICAgIHRleHR1cmVzOiB0ZXh0dXJlcyxcbiAgICBiaW5kaW5nTGF5b3V0OiBiaW5kaW5nTGF5b3V0LFxuICAgIHNpemU6IHNpemUsXG4gIH07XG59XG5cbmZ1bmN0aW9uIGNoYW5uZWxDb3VudChmb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQpOiBudW1iZXIge1xuICBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdiYVwiKSkge1xuICAgIHJldHVybiA0O1xuICB9IGVsc2UgaWYgKGZvcm1hdC5pbmNsdWRlcyhcInJnYlwiKSkge1xuICAgIHJldHVybiAzO1xuICB9IGVsc2UgaWYgKGZvcm1hdC5pbmNsdWRlcyhcInJnXCIpKSB7XG4gICAgcmV0dXJuIDI7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwiclwiKSkge1xuICAgIHJldHVybiAxO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgZm9ybWF0OiBcIiArIGZvcm1hdCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZmxhdHRlbihuZXN0ZWRBcnJheTogbnVtYmVyW11bXVtdKTogbnVtYmVyW10ge1xuICBjb25zdCBmbGF0dGVuZWQ6IG51bWJlcltdID0gW107XG4gIGZvciAobGV0IGsgPSAwOyBrIDwgbmVzdGVkQXJyYXlbMF1bMF0ubGVuZ3RoOyBrKyspIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5lc3RlZEFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5lc3RlZEFycmF5WzBdLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIGZsYXR0ZW5lZC5wdXNoKG5lc3RlZEFycmF5W2ldW2pdW2tdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmxhdHRlbmVkO1xufVxuXG5mdW5jdGlvbiB6ZXJvcyhoZWlnaHQ6IG51bWJlciwgd2lkdGg6IG51bWJlciwgbGF5ZXJzOiBudW1iZXIgPSAxKTogbnVtYmVyW11bXVtdIHtcbiAgY29uc3QgemVyb0FycmF5OiBudW1iZXJbXVtdW10gPSBbXTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGhlaWdodDsgaSsrKSB7XG4gICAgY29uc3Qgcm93OiBudW1iZXJbXVtdID0gW107XG4gICAgZm9yIChsZXQgaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG4gICAgICBjb25zdCBsYXllcjogbnVtYmVyW10gPSBbXTtcbiAgICAgIGZvciAobGV0IGsgPSAwOyBrIDwgbGF5ZXJzOyBrKyspIHtcbiAgICAgICAgbGF5ZXIucHVzaCgwKTtcbiAgICAgIH1cbiAgICAgIHJvdy5wdXNoKGxheWVyKTtcbiAgICB9XG4gICAgemVyb0FycmF5LnB1c2gocm93KTtcbiAgfVxuXG4gIHJldHVybiB6ZXJvQXJyYXk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSYW5kb21WYWx1ZXMobGVuZ3RoOiBudW1iZXIsIHJhbmRvbT86ICgpID0+IG51bWJlcik6IFVpbnQzMkFycmF5IHtcbiAgLy8gZmFzdCBjcHUtc2lkZSByYW5kb20gbnVtYmVyIGdlbmVyYXRpb25cblxuICBjb25zdCBtYXhDaHVua0xlbmd0aCA9IDY1NTM2IC8gNDtcbiAgY29uc3QgcmVzdWx0ID0gbmV3IFVpbnQzMkFycmF5KDQgKiBsZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDQgKiBsZW5ndGg7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBjb25zdCBjaHVua0xlbmd0aCA9IE1hdGgubWluKG1heENodW5rTGVuZ3RoLCA0ICogbGVuZ3RoIC0gaSk7XG4gICAgaWYgKHJhbmRvbSkge1xuICAgICAgZm9yIChsZXQgaiA9IGk7IGogPCBNYXRoLm1pbihpICsgY2h1bmtMZW5ndGgsIHJlc3VsdC5sZW5ndGgpOyBqKyspIHJlc3VsdFtqXSA9IE1hdGguZmxvb3IocmFuZG9tKCkgKiA0Mjk0OTY3Mjk2KTtcbiAgICB9IGVsc2UgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhyZXN1bHQuc3ViYXJyYXkoaSwgaSArIGNodW5rTGVuZ3RoKSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZXhwb3J0IGNsYXNzIFBlcmZvcm1hbmNlTW9uaXRvciB7XG4gIHByaXZhdGUgbGFzdFRpbWU6IG51bWJlcjtcbiAgcHJpdmF0ZSBmcmFtZUNvdW50OiBudW1iZXI7XG4gIHByaXZhdGUgZnJhbWVzUGVyVGltZUxvZzogbnVtYmVyO1xuICBwcml2YXRlIGZwc0Rpc3BsYXk6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGZyYW1lc1BlclRpbWVMb2c6IG51bWJlciA9IDMwKSB7XG4gICAgdGhpcy5mcmFtZXNQZXJUaW1lTG9nID0gZnJhbWVzUGVyVGltZUxvZztcbiAgICB0aGlzLmZwc0Rpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIikhO1xuICAgIHRoaXMubGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLmZyYW1lQ291bnQgPSAwO1xuICB9XG5cbiAgcHVibGljIHVwZGF0ZSh0aW1lOiBudW1iZXIpIHtcbiAgICBpZiAodGltZSAlIHRoaXMuZnJhbWVzUGVyVGltZUxvZyA9PT0gMCkge1xuICAgICAgY29uc3QgY3VycmVudFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgIGNvbnN0IHRpbWVFbGFwc2VkID0gY3VycmVudFRpbWUgLSB0aGlzLmxhc3RUaW1lO1xuXG4gICAgICAvLyBGUFMgQ2FsY3VsYXRpb25cbiAgICAgIGNvbnN0IGZwcyA9IE1hdGgucm91bmQoKHRoaXMuZnJhbWVDb3VudCAqIDEwMDApIC8gdGltZUVsYXBzZWQpO1xuICAgICAgdGhpcy5mcHNEaXNwbGF5LnRleHRDb250ZW50ID0gYEZQUzogJHtmcHN9YDtcblxuICAgICAgLy8gUmVzZXQgY291bnRlcnNcbiAgICAgIHRoaXMuZnJhbWVDb3VudCA9IDA7XG4gICAgICB0aGlzLmxhc3RUaW1lID0gY3VycmVudFRpbWU7XG4gICAgfVxuICAgIHRoaXMuZnJhbWVDb3VudCsrO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=