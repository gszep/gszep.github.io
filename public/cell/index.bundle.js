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
        width: Math.round(window.innerWidth * uniforms.simulationScale),
        height: Math.round(window.innerHeight * uniforms.simulationScale),
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
    }
    const gpuErrors = [];
    device.addEventListener("uncapturederror", (event) => {
        gpuErrors.push(event.error.message);
        paused = true;
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
    const renderModule = new _render__WEBPACK_IMPORTED_MODULE_11__.RenderModule(device, canvas.format, { width: actualWidth, height: actualHeight }, renderShader, textures, sharedLayoutEntries, sharedBindGroupEntries);
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
        cueMarker.style.left = `${rect.left + (uniforms.cueX / actualWidth) * rect.width}px`;
        cueMarker.style.top = `${rect.top + (uniforms.cueY / actualHeight) * rect.height}px`;
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
        setCue(((e.clientX - rect.left) / rect.width) * actualWidth, ((e.clientY - rect.top) / rect.height) * actualHeight);
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
    window.addEventListener("resize", displayCue);
    displayCue();
    window.filamentDemo = {
        seed,
        uniforms,
        gpuErrors,
        runtimeErrors,
        contactRecovery: recovery,
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
        let gui = new lil_gui__WEBPACK_IMPORTED_MODULE_19__["default"]();
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
    TEXTURE_WORKGROUP_COUNT;
    constructor(device, canvasFormat, canvasSize, renderShader, textures, sharedLayoutEntries, sharedBindGroupEntries) {
        this.device = device;
        this.canvasFormat = canvasFormat;
        this.TEXTURE_WORKGROUP_COUNT = [Math.ceil(textures.size.width / 16), Math.ceil(textures.size.height / 16)];
        const BINDING_INTERMEDIATE_TEXTURE = 10;
        this.intermediateTexture = this.device.createTexture({
            size: [canvasSize.width, canvasSize.height],
            format: "rgba8unorm",
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC,
        });
        const bindGroupLayoutPostProcess = this.device.createBindGroupLayout({
            label: "bindGroupLayoutPostProcess",
            entries: [
                ...sharedLayoutEntries,
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
        const commandEncoder = this.device.createCommandEncoder();
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

module.exports = "#import includes::bindings\n#import includes::textures\n\nstruct VertexOutput {\n    @builtin(position) Position : vec4f,\n    @location(0) fragUV : vec2f,\n}\n\n@group(GROUP_INDEX) @binding(CONTROLS)\n  var<uniform> controls: Controls;\n\n@vertex\nfn vert(@builtin(vertex_index) VertexIndex : u32) -> VertexOutput {\n    const pos = array(\n        vec2( 1.0,  1.0),\n        vec2( 1.0, -1.0),\n        vec2(-1.0, -1.0),\n        vec2( 1.0,  1.0),\n        vec2(-1.0, -1.0),\n        vec2(-1.0,  1.0),\n    );\n\n    const uv = array(\n        vec2(1.0, 0.0),\n        vec2(1.0, 1.0),\n        vec2(0.0, 1.0),\n        vec2(1.0, 0.0),\n        vec2(0.0, 1.0),\n        vec2(0.0, 0.0),\n    );\n\n    var output : VertexOutput;\n    output.Position = vec4(pos[VertexIndex], 0.0, 1.0);\n    output.fragUV = uv[VertexIndex];\n    return output;\n}\n\nstruct Canvas {\n    size: vec2<i32>,\n    pass_id: u32,\n    key: vec2<u32>,\n}\n\nstruct Interactions {\n    position: vec2<f32>,\n    size: f32,\n};\n\n// Uniforms\n@group(GROUP_INDEX) @binding(CANVAS) \n  var<uniform> canvas: Canvas;\n\n@group(GROUP_INDEX) @binding(INTERACTIONS)\n  var<uniform> interactions: Interactions;\n\n@group(GROUP_INDEX) @binding(BINDING_INTERMEDIATE_TEXTURE)\n  var intermediateTexture: texture_storage_2d<rgba8unorm, write>; //rgba8unorm\n\n// Bindings for the final screen render\n@group(1) @binding(0) var screenSampler: sampler;\n@group(1) @binding(1) var screenTexture: texture_2d<f32>;\n\n// #e0600cff\nconst orange = vec4(0.878, 0.373, 0.000, 1.0);\n\n// #064164ff\n// const blue = vec4(0.024, 0.255, 0.396, 1.0);\nconst blue = vec4(0.0, 0.0, 0.0, 1.0);\n\nfn random_uniform(seed: u32) -> f32 {\n    return fract(sin(f32(seed) * 43758.5453123) * 12345.6789);\n}\n\n@compute @workgroup_size(16, 16)\nfn render(@builtin(global_invocation_id) id: vec3u) {\n    let x = vec2<i32>(id.xy);\n    var color = blue / 4;  // background\n    // Schematic compartment tint, not a quantitative G-actin density scale.\n    if (controls.gActinField != 0u && load_texture(parameter_fields, G_ACTIN_COMPARTMENT, x) > 0.5) {\n        color = vec4(0.025, 0.065, 0.09, 1.0);\n    }\n\n    // steric potential\n    var max_potential = 0.0;\n    let potential = load_steric_potential(x);\n\n    for (var i = 0; i < STERIC_POTENTIAL_DIM; i++) {\n        max_potential = max(max_potential, potential[i]);\n    }\n    color -= 0.05 * max_potential; // add shadow\n\n    // agent locations\n    let idx = load_texture_index(SEGMENT_INDEX, x);\n    if (idx > 0){\n        if (potential[STIGMERGYPOLYMER] > 0.1) {\n            let randomSample = 0.4 + random_uniform(idx) * 0.6;\n            color += get_actin_color(vec2<f32>(x));\n        }\n        else if (potential[STIGMERGYMONOMER] > 0.1) {\n            let randomSample = 0.4 + random_uniform(idx) * 0.6;\n             color += controls.monomerOpacity * randomSample * orange;\n        }\n    }\n    \n    // food signal\n    let foodsignal = load_texture(parameter_fields, CONNECTION_PROBABILITY, x);\n\n    let foodNearby = foodsignal > controls.foodNearbyThreshold;\n    var foodnearbyColor = vec4(0.0, 0.0, 0.0, 1.0);\n    if (foodNearby){\n      var decayedFoodSignal = foodsignal;\n      decayedFoodSignal = select(1.0, foodsignal / 0.01, foodsignal < 0.01);\n      foodnearbyColor = vec4(0.4, 0.4, 0.4, 1.0) * decayedFoodSignal;\n    }\n    \n    var debug = load_texture(parameter_fields, DEBUG, x);\n    if (debug > 0.0){\n      color = vec4(1.0, 1.0, 1.0, 1.0);\n    }\n    if (debug == 4.0){\n      color = vec4(0.0, 0.0, 1.0, 1.0);\n    }\n    if (debug == 5.0){\n      color = vec4(0.0, 1.0, 0.0, 1.0);\n    }\n    if (debug == 6.0) { color = vec4(1.0, 0.25, 0.85, 1.0); }\n    if (debug == 7.0) { color = vec4(0.2, 0.85, 1.0, 1.0); }\n    if (debug == 8.0) { color = vec4(1.0, 0.7, 0.2, 1.0); }\n    if (debug >= 20 && debug < 30000){\n      color = index_to_rainbow(u32(debug));\n    }\n\n    textureStore(intermediateTexture, x, color);\n}\n\nfn index_to_rainbow(idx: u32) -> vec4f {\n    if idx == 0 {\n        return vec4(0.0, 0.0, 0.0, 1.0);\n    }\n    let r = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 0.0);\n    let g = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 2.094);\n    let b = 0.5 + 0.5 * sin(f32(idx) * 0.1 + 4.188);\n    return vec4(r, g, b, 1.0);\n}\nfn index_to_parity(idx: u32) -> vec4f {\n    if idx == 0 {\n        return vec4(0.0, 0.0, 0.0, 1.0);\n    }\n    if (idx % 2 == 0) {\n        return vec4(1.0, 0.0, 0.0, 1.0);\n    } else {\n        return vec4(0.0, 1.0, 0.0, 1.0);\n    }\n}\n\n// Add this to your rendering shader\nfn get_actin_color(position: vec2<f32>) -> vec4<f32> {\n  if(controls.colourAge!=0u) {\n    let age=load_texture(parameter_fields,ACTIN_AGE,as_vec2i(position));\n    let mature=clamp(age/max(1.0,2.0*controls.turnoverAge),0.0,1.0);\n    return vec4(mix(vec3(1.0,1.0,0.0),vec3(1.0,0.1,0.1),mature),1.0);\n  }\n  let recency = load_texture(parameter_fields, RECENCY, as_vec2i(position));\n  \n  // Red color (newest)\n  let red = vec3<f32>(1.0, 0.0, 0.0);\n  // Yellow color (oldest)\n  let yellow = vec3<f32>(1.0, 1.0, 0.0);\n  \n  // Interpolate between yellow and red based on recency\n  let color = mix(red, yellow, recency);\n  \n  return vec4<f32>(color, 1.0);\n}\n\n@fragment\nfn frag(@location(0) fragUV: vec2f) -> @location(0) vec4f {\n  return textureSample(screenTexture, screenSampler, fragUV);\n}\n";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLGNBQWM7QUFDZDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLDhDQUE4QyxFQUFFOztBQUVoRDs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFFO0FBQ0Y7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRixnQkFBZ0IsU0FBUzs7QUFFekI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0EsdURBQXVELElBQUksZ0JBQWdCOztBQUUzRTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU07O0FBRU47O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvREFBb0QsaUJBQWlCO0FBQ3JFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQSx3REFBd0QsaUJBQWlCO0FBQ3pFOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxNQUFNOztBQUVOO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0RBQStELGlCQUFpQjtBQUNoRixxREFBcUQsaUJBQWlCOztBQUV0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLEtBQUs7QUFDbEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLFFBQVEsaUJBQWlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7O0FBRUo7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLGNBQWM7QUFDckQsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFH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QUN6RCxNQUFNLENBQUMsNkNBQTZDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlJLElBQUksS0FBSyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDakQsTUFBTSxDQUNKLDREQUE0RCxFQUM1RCxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUNaLEtBQUssQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2YsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUM3SCxDQUFDO0lBQ0YsTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUNoQjtRQUNFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNQLEVBQ0Q7UUFDRSxDQUFDLENBQUMsRUFBRSxD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QUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25FLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUMvRixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSwwQkFBMEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDbEcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUM5RixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzdGLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFD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QyxRQUFRLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN6QyxNQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDbEQsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQzFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztZQUM1RCxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsS0FBSyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xELENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEIsQ0FBQztRQUNELElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1YsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNaLENBQUM7UUFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBQ0QsU0FBUyxTQUFTLENBQUMsR0FBVyxFQUFFLFNBQVMsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQztRQUMxRCxNQUFNLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUM5QyxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQ3pCLENBQUMsR0FBRyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUU7WUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyRixTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO1lBQ3pCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzlCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDbkIsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztRQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNELFFBQVEsRUFBRSxDQUFDO0lBQ1gsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hCLFNBQVMsQ0FBQyxFQUFFLFlBQVksRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDOUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JCLFNBQVMsQ0FBQztRQUNSLFlBQVksRUFBRSxDQUFDO1FBQ2YsVUFBVSxFQUFFLENBQUM7UUFDYixJQUFJLEVBQUUsR0FBRztRQUNULElBQUksRUFBRSxFQUFFO1FBQ1IsZ0JBQWdCLEVBQUUsSUFBSTtRQUN0QixZQUFZLEVBQUUsQ0FBQztRQUNmLFdBQVcsRUFBRSxFQUFFO1FBQ2Ysd0JBQXdCLEVBQUUsQ0FBQztRQUMzQixtQkFBbUIsRUFBRSxDQUFDO0tBQ3ZCLENBQUMsQ0FBQztJQUNILFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQixRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDbkQsTUFBTSxDQUFDLHVDQUF1QyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUN4RyxNQUFNLENBQUMsdUNBQXVDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDNUUsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUN6QixFQUFFLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLEVBQzVCLEVBQUUsR0FBRyxJQUFJLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztJQUNkLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbkQsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JCLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvQyxNQUFNLENBQUMsaURBQWlELEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDdEYsTUFBTSxDQUFDLGlEQUFpRCxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3JGLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNiLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNyQixDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLCtDQUErQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ25GLE1BQU0sTUFBTSxHQUFHLElBQUksWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDN0csUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sS0FBSyxHQUFHLElBQUksWUFBWSxDQUFDLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDNUcsTUFBTSxDQUFDLGlEQUFpRCxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzdKLFFBQVEsRUFBRSxDQUFDO0lBQ1gsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3JCLFNBQVMsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztJQUN6RSxLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJO1FBQ3RDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSx3Q0FBd0MsRUFBRSxJQUFJLENBQUM7UUFDbEUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLG1DQUFtQyxFQUFFLEtBQUssQ0FBQztLQUN0RCxFQUFFLENBQUM7UUFDWCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkMsSUFBSSxZQUFZLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqRCxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEIsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUQsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRSxDQUFDLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkksQ0FBQztJQUNELFFBQVEsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDbEIsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hCLE1BQU0sSUFBSSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUMxRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUM5QyxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDakQsU0FBUyxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN2SSxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7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O0lBRU0sTUFBTSxDQUFDLElBQVk7UUFDeEIsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3ZDLE1BQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUN0QyxNQUFNLFdBQVcsR0FBRyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztZQUVoRCxrQkFBa0I7WUFDbEIsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsV0FBVyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEdBQUcsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUU1QyxpQkFBaUI7WUFDakIsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUM7UUFDOUIsQ0FBQztRQUNELElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNwQixDQUFDO0NBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vbm9kZV9tb2R1bGVzL2xpbC1ndWkvZGlzdC9saWwtZ3VpLmVzbS5qcyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL2NvbnRhY3QtcmVjb3ZlcnkudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9lbmNsb3N1cmUtdGVzdC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL2luZGV4LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvbWVjaGFuaWNzLXRlc3QudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9vY2N1cGFuY3kudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yYW5kb20udHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9yZWFsdGltZS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3JlbmRlci50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3JlbmV3YWwtdGVzdC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3NpbXVsYXRlLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvc3Byb3V0cy50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS1hbmFseXNpcy50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3RlbGVtZXRyeS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3V0aWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogbGlsLWd1aVxuICogaHR0cHM6Ly9saWwtZ3VpLmdlb3JnZWFsd2F5cy5jb21cbiAqIEB2ZXJzaW9uIDAuMjAuMFxuICogQGF1dGhvciBHZW9yZ2UgTWljaGFlbCBCcm93ZXJcbiAqIEBsaWNlbnNlIE1JVFxuICovXG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgYWxsIGNvbnRyb2xsZXJzLlxuICovXG5jbGFzcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCBjbGFzc05hbWUsIGVsZW1lbnRUeXBlID0gJ2RpdicgKSB7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgR1VJIHRoYXQgY29udGFpbnMgdGhpcyBjb250cm9sbGVyLlxuXHRcdCAqIEB0eXBlIHtHVUl9XG5cdFx0ICovXG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgb2JqZWN0IHRoaXMgY29udHJvbGxlciB3aWxsIG1vZGlmeS5cblx0XHQgKiBAdHlwZSB7b2JqZWN0fVxuXHRcdCAqL1xuXHRcdHRoaXMub2JqZWN0ID0gb2JqZWN0O1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbnRyb2wuXG5cdFx0ICogQHR5cGUge3N0cmluZ31cblx0XHQgKi9cblx0XHR0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgY29udHJvbGxlciBpcyBkaXNhYmxlZC5cblx0XHQgKiBVc2UgYGNvbnRyb2xsZXIuZGlzYWJsZSggdHJ1ZXxmYWxzZSApYCB0byBtb2RpZnkgdGhpcyB2YWx1ZS5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9kaXNhYmxlZCA9IGZhbHNlO1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIENvbnRyb2xsZXIgaXMgaGlkZGVuLlxuXHRcdCAqIFVzZSBgY29udHJvbGxlci5zaG93KClgIG9yIGBjb250cm9sbGVyLmhpZGUoKWAgdG8gY2hhbmdlIHRoaXMuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5faGlkZGVuID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgdmFsdWUgb2YgYG9iamVjdFsgcHJvcGVydHkgXWAgd2hlbiB0aGUgY29udHJvbGxlciB3YXMgY3JlYXRlZC5cblx0XHQgKiBAdHlwZSB7YW55fVxuXHRcdCAqL1xuXHRcdHRoaXMuaW5pdGlhbFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIG91dGVybW9zdCBjb250YWluZXIgRE9NIGVsZW1lbnQgZm9yIHRoaXMgY29udHJvbGxlci5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy5kb21FbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggZWxlbWVudFR5cGUgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2NvbnRyb2xsZXInICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGNvbnRyb2xsZXIncyBuYW1lLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiRuYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRuYW1lLmNsYXNzTGlzdC5hZGQoICduYW1lJyApO1xuXG5cdFx0Q29udHJvbGxlci5uZXh0TmFtZUlEID0gQ29udHJvbGxlci5uZXh0TmFtZUlEIHx8IDA7XG5cdFx0dGhpcy4kbmFtZS5pZCA9IGBsaWwtZ3VpLW5hbWUtJHsrK0NvbnRyb2xsZXIubmV4dE5hbWVJRH1gO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIGNvbnRyb2xsZXIncyBcIndpZGdldFwiICh3aGljaCBkaWZmZXJzIGJ5IGNvbnRyb2xsZXIgdHlwZSkuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJHdpZGdldCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmNsYXNzTGlzdC5hZGQoICd3aWRnZXQnICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCByZWNlaXZlcyB0aGUgZGlzYWJsZWQgYXR0cmlidXRlIHdoZW4gdXNpbmcgZGlzYWJsZSgpLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kd2lkZ2V0O1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiRuYW1lICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiR3aWRnZXQgKTtcblxuXHRcdC8vIERvbid0IGZpcmUgZ2xvYmFsIGtleSBldmVudHMgd2hpbGUgdHlwaW5nIGluIGEgY29udHJvbGxlclxuXHRcdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGUgPT4gZS5zdG9wUHJvcGFnYXRpb24oKSApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAna2V5dXAnLCBlID0+IGUuc3RvcFByb3BhZ2F0aW9uKCkgKTtcblxuXHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnB1c2goIHRoaXMgKTtcblx0XHR0aGlzLnBhcmVudC5jb250cm9sbGVycy5wdXNoKCB0aGlzICk7XG5cblx0XHR0aGlzLnBhcmVudC4kY2hpbGRyZW4uYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXG5cdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2sgPSB0aGlzLl9saXN0ZW5DYWxsYmFjay5iaW5kKCB0aGlzICk7XG5cblx0XHR0aGlzLm5hbWUoIHByb3BlcnR5ICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBuYW1lIG9mIHRoZSBjb250cm9sbGVyIGFuZCBpdHMgbGFiZWwgaW4gdGhlIEdVSS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRuYW1lKCBuYW1lICkge1xuXHRcdC8qKlxuXHRcdCAqIFRoZSBjb250cm9sbGVyJ3MgbmFtZS4gVXNlIGBjb250cm9sbGVyLm5hbWUoICdOYW1lJyApYCB0byBtb2RpZnkgdGhpcyB2YWx1ZS5cblx0XHQgKiBAdHlwZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdHRoaXMuX25hbWUgPSBuYW1lO1xuXHRcdHRoaXMuJG5hbWUudGV4dENvbnRlbnQgPSBuYW1lO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgdGhlIHZhbHVlIGlzIG1vZGlmaWVkIGJ5IHRoaXMgY29udHJvbGxlci5cblx0ICogVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIHRoZSBuZXcgdmFsdWUgYXMgaXRzIGZpcnN0IHBhcmFtZXRlci4gVGhlIHZhbHVlIG9mIGB0aGlzYCB3aWxsIGJlIHRoZVxuXHQgKiBjb250cm9sbGVyLlxuXHQgKlxuXHQgKiBGb3IgZnVuY3Rpb24gY29udHJvbGxlcnMsIHRoZSBgb25DaGFuZ2VgIGNhbGxiYWNrIHdpbGwgYmUgZmlyZWQgb24gY2xpY2ssIGFmdGVyIHRoZSBmdW5jdGlvblxuXHQgKiBleGVjdXRlcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IGNvbnRyb2xsZXIgPSBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKTtcblx0ICpcblx0ICogY29udHJvbGxlci5vbkNoYW5nZSggZnVuY3Rpb24oIHYgKSB7XG5cdCAqIFx0Y29uc29sZS5sb2coICdUaGUgdmFsdWUgaXMgbm93ICcgKyB2ICk7XG5cdCAqIFx0Y29uc29sZS5hc3NlcnQoIHRoaXMgPT09IGNvbnRyb2xsZXIgKTtcblx0ICogfSApO1xuXHQgKi9cblx0b25DaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25DaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWUgZGlyZWN0bHkuXG5cdFx0ICogVXNlIHRoZSBgY29udHJvbGxlci5vbkNoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbHMgdGhlIG9uQ2hhbmdlIG1ldGhvZHMgb2YgdGhpcyBjb250cm9sbGVyIGFuZCBpdHMgcGFyZW50IEdVSS5cblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0X2NhbGxPbkNoYW5nZSgpIHtcblxuXHRcdHRoaXMucGFyZW50Ll9jYWxsT25DaGFuZ2UoIHRoaXMgKTtcblxuXHRcdGlmICggdGhpcy5fb25DaGFuZ2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX29uQ2hhbmdlLmNhbGwoIHRoaXMsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHRcdH1cblxuXHRcdHRoaXMuX2NoYW5nZWQgPSB0cnVlO1xuXG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhZnRlciB0aGlzIGNvbnRyb2xsZXIgaGFzIGJlZW4gbW9kaWZpZWQgYW5kIGxvc2VzIGZvY3VzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29uc3QgY29udHJvbGxlciA9IGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApO1xuXHQgKlxuXHQgKiBjb250cm9sbGVyLm9uRmluaXNoQ2hhbmdlKCBmdW5jdGlvbiggdiApIHtcblx0ICogXHRjb25zb2xlLmxvZyggJ0NoYW5nZXMgY29tcGxldGU6ICcgKyB2ICk7XG5cdCAqIFx0Y29uc29sZS5hc3NlcnQoIHRoaXMgPT09IGNvbnRyb2xsZXIgKTtcblx0ICogfSApO1xuXHQgKi9cblx0b25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25GaW5pc2hDaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWVcblx0XHQgKiBkaXJlY3RseS4gVXNlIHRoZSBgY29udHJvbGxlci5vbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2hvdWxkIGJlIGNhbGxlZCBieSBDb250cm9sbGVyIHdoZW4gaXRzIHdpZGdldHMgbG9zZSBmb2N1cy5cblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0X2NhbGxPbkZpbmlzaENoYW5nZSgpIHtcblxuXHRcdGlmICggdGhpcy5fY2hhbmdlZCApIHtcblxuXHRcdFx0dGhpcy5wYXJlbnQuX2NhbGxPbkZpbmlzaENoYW5nZSggdGhpcyApO1xuXG5cdFx0XHRpZiAoIHRoaXMuX29uRmluaXNoQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlLmNhbGwoIHRoaXMsIHRoaXMuZ2V0VmFsdWUoKSApO1xuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0dGhpcy5fY2hhbmdlZCA9IGZhbHNlO1xuXG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgY29udHJvbGxlciBiYWNrIHRvIGl0cyBpbml0aWFsIHZhbHVlLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuaW5pdGlhbFZhbHVlICk7XG5cdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogRW5hYmxlcyB0aGlzIGNvbnRyb2xsZXIuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gZW5hYmxlZFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29udHJvbGxlci5lbmFibGUoKTtcblx0ICogY29udHJvbGxlci5lbmFibGUoIGZhbHNlICk7IC8vIGRpc2FibGVcblx0ICogY29udHJvbGxlci5lbmFibGUoIGNvbnRyb2xsZXIuX2Rpc2FibGVkICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0ZW5hYmxlKCBlbmFibGVkID0gdHJ1ZSApIHtcblx0XHRyZXR1cm4gdGhpcy5kaXNhYmxlKCAhZW5hYmxlZCApO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc2FibGVzIHRoaXMgY29udHJvbGxlci5cblx0ICogQHBhcmFtIHtib29sZWFufSBkaXNhYmxlZFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29udHJvbGxlci5kaXNhYmxlKCk7XG5cdCAqIGNvbnRyb2xsZXIuZGlzYWJsZSggZmFsc2UgKTsgLy8gZW5hYmxlXG5cdCAqIGNvbnRyb2xsZXIuZGlzYWJsZSggIWNvbnRyb2xsZXIuX2Rpc2FibGVkICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0ZGlzYWJsZSggZGlzYWJsZWQgPSB0cnVlICkge1xuXG5cdFx0aWYgKCBkaXNhYmxlZCA9PT0gdGhpcy5fZGlzYWJsZWQgKSByZXR1cm4gdGhpcztcblxuXHRcdHRoaXMuX2Rpc2FibGVkID0gZGlzYWJsZWQ7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSggJ2Rpc2FibGVkJywgZGlzYWJsZWQgKTtcblx0XHR0aGlzLiRkaXNhYmxlLnRvZ2dsZUF0dHJpYnV0ZSggJ2Rpc2FibGVkJywgZGlzYWJsZWQgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgdGhlIENvbnRyb2xsZXIgYWZ0ZXIgaXQncyBiZWVuIGhpZGRlbi5cblx0ICogQHBhcmFtIHtib29sZWFufSBzaG93XG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb250cm9sbGVyLnNob3coKTtcblx0ICogY29udHJvbGxlci5zaG93KCBmYWxzZSApOyAvLyBoaWRlXG5cdCAqIGNvbnRyb2xsZXIuc2hvdyggY29udHJvbGxlci5faGlkZGVuICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0c2hvdyggc2hvdyA9IHRydWUgKSB7XG5cblx0XHR0aGlzLl9oaWRkZW4gPSAhc2hvdztcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdGhpcy5faGlkZGVuID8gJ25vbmUnIDogJyc7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBDb250cm9sbGVyLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGhpZGUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuc2hvdyggZmFsc2UgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoaXMgY29udHJvbGxlciBpbnRvIGEgZHJvcGRvd24gb2Ygb3B0aW9ucy5cblx0ICpcblx0ICogQ2FsbGluZyB0aGlzIG1ldGhvZCBvbiBhbiBvcHRpb24gY29udHJvbGxlciB3aWxsIHNpbXBseSB1cGRhdGUgdGhlIG9wdGlvbnMuIEhvd2V2ZXIsIGlmIHRoaXNcblx0ICogY29udHJvbGxlciB3YXMgbm90IGFscmVhZHkgYW4gb3B0aW9uIGNvbnRyb2xsZXIsIG9sZCByZWZlcmVuY2VzIHRvIHRoaXMgY29udHJvbGxlciBhcmVcblx0ICogZGVzdHJveWVkLCBhbmQgYSBuZXcgY29udHJvbGxlciBpcyBhZGRlZCB0byB0aGUgZW5kIG9mIHRoZSBHVUkuXG5cdCAqIEBleGFtcGxlXG5cdCAqIC8vIHNhZmUgdXNhZ2Vcblx0ICpcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDEnICkub3B0aW9ucyggWyAnYScsICdiJywgJ2MnIF0gKTtcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDInICkub3B0aW9ucyggeyBCaWc6IDEwLCBTbWFsbDogMSB9ICk7XG5cdCAqIGd1aS5hZGQoIG9iaiwgJ3Byb3AzJyApO1xuXHQgKlxuXHQgKiAvLyBkYW5nZXJcblx0ICpcblx0ICogY29uc3QgY3RybDEgPSBndWkuYWRkKCBvYmosICdwcm9wMScgKTtcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDInICk7XG5cdCAqXG5cdCAqIC8vIGNhbGxpbmcgb3B0aW9ucyBvdXQgb2Ygb3JkZXIgYWRkcyBhIG5ldyBjb250cm9sbGVyIHRvIHRoZSBlbmQuLi5cblx0ICogY29uc3QgY3RybDIgPSBjdHJsMS5vcHRpb25zKCBbICdhJywgJ2InLCAnYycgXSApO1xuXHQgKlxuXHQgKiAvLyAuLi5hbmQgY3RybDEgbm93IHJlZmVyZW5jZXMgYSBjb250cm9sbGVyIHRoYXQgZG9lc24ndCBleGlzdFxuXHQgKiBhc3NlcnQoIGN0cmwyICE9PSBjdHJsMSApXG5cdCAqIEBwYXJhbSB7b2JqZWN0fEFycmF5fSBvcHRpb25zXG5cdCAqIEByZXR1cm5zIHtDb250cm9sbGVyfVxuXHQgKi9cblx0b3B0aW9ucyggb3B0aW9ucyApIHtcblx0XHRjb25zdCBjb250cm9sbGVyID0gdGhpcy5wYXJlbnQuYWRkKCB0aGlzLm9iamVjdCwgdGhpcy5wcm9wZXJ0eSwgb3B0aW9ucyApO1xuXHRcdGNvbnRyb2xsZXIubmFtZSggdGhpcy5fbmFtZSApO1xuXHRcdHRoaXMuZGVzdHJveSgpO1xuXHRcdHJldHVybiBjb250cm9sbGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG1pbmltdW0gdmFsdWUuIE9ubHkgd29ya3Mgb24gbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcGFyYW0ge251bWJlcn0gbWluXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bWluKCBtaW4gKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbWF4aW11bSB2YWx1ZS4gT25seSB3b3JrcyBvbiBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBtYXhcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRtYXgoIG1heCApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBWYWx1ZXMgc2V0IGJ5IHRoaXMgY29udHJvbGxlciB3aWxsIGJlIHJvdW5kZWQgdG8gbXVsdGlwbGVzIG9mIGBzdGVwYC4gT25seSB3b3JrcyBvbiBudW1iZXJcblx0ICogY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBzdGVwXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0c3RlcCggc3RlcCApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSb3VuZHMgdGhlIGRpc3BsYXllZCB2YWx1ZSB0byBhIGZpeGVkIG51bWJlciBvZiBkZWNpbWFscywgd2l0aG91dCBhZmZlY3RpbmcgdGhlIGFjdHVhbCB2YWx1ZVxuXHQgKiBsaWtlIGBzdGVwKClgLiBPbmx5IHdvcmtzIG9uIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAncHJvcGVydHknICkubGlzdGVuKCkuZGVjaW1hbHMoIDQgKTtcblx0ICogQHBhcmFtIHtudW1iZXJ9IGRlY2ltYWxzXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0ZGVjaW1hbHMoIGRlY2ltYWxzICkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxzIGB1cGRhdGVEaXNwbGF5KClgIGV2ZXJ5IGFuaW1hdGlvbiBmcmFtZS4gUGFzcyBgZmFsc2VgIHRvIHN0b3AgbGlzdGVuaW5nLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGxpc3RlblxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdGxpc3RlbiggbGlzdGVuID0gdHJ1ZSApIHtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjb250cm9sbGVyIGlzIGN1cnJlbnRseSBsaXN0ZW5pbmcuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGNvbnRyb2xsZXIubGlzdGVuKCB0cnVlfGZhbHNlIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2xpc3RlbmluZyA9IGxpc3RlbjtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuQ2FsbGJhY2tJRCAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0Y2FuY2VsQW5pbWF0aW9uRnJhbWUoIHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgKTtcblx0XHRcdHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5pbmcgKSB7XG5cdFx0XHR0aGlzLl9saXN0ZW5DYWxsYmFjaygpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRfbGlzdGVuQ2FsbGJhY2soKSB7XG5cblx0XHR0aGlzLl9saXN0ZW5DYWxsYmFja0lEID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCB0aGlzLl9saXN0ZW5DYWxsYmFjayApO1xuXG5cdFx0Ly8gVG8gcHJldmVudCBmcmFtZXJhdGUgbG9zcywgbWFrZSBzdXJlIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZCBiZWZvcmUgdXBkYXRpbmcgdGhlIGRpc3BsYXkuXG5cdFx0Ly8gTm90ZTogc2F2ZSgpIGlzIHVzZWQgaGVyZSBpbnN0ZWFkIG9mIGdldFZhbHVlKCkgb25seSBiZWNhdXNlIG9mIENvbG9yQ29udHJvbGxlci4gVGhlICE9PSBvcGVyYXRvclxuXHRcdC8vIHdvbid0IHdvcmsgZm9yIGNvbG9yIG9iamVjdHMgb3IgYXJyYXlzLCBidXQgQ29sb3JDb250cm9sbGVyLnNhdmUoKSBhbHdheXMgcmV0dXJucyBhIHN0cmluZy5cblxuXHRcdGNvbnN0IGN1clZhbHVlID0gdGhpcy5zYXZlKCk7XG5cblx0XHRpZiAoIGN1clZhbHVlICE9PSB0aGlzLl9saXN0ZW5QcmV2VmFsdWUgKSB7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHR9XG5cblx0XHR0aGlzLl9saXN0ZW5QcmV2VmFsdWUgPSBjdXJWYWx1ZTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYG9iamVjdFsgcHJvcGVydHkgXWAuXG5cdCAqIEByZXR1cm5zIHthbnl9XG5cdCAqL1xuXHRnZXRWYWx1ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5vYmplY3RbIHRoaXMucHJvcGVydHkgXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSB2YWx1ZSBvZiBgb2JqZWN0WyBwcm9wZXJ0eSBdYCwgaW52b2tlcyBhbnkgYG9uQ2hhbmdlYCBoYW5kbGVycyBhbmQgdXBkYXRlcyB0aGUgZGlzcGxheS5cblx0ICogQHBhcmFtIHthbnl9IHZhbHVlXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0c2V0VmFsdWUoIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLmdldFZhbHVlKCkgIT09IHZhbHVlICkge1xuXG5cdFx0XHR0aGlzLm9iamVjdFsgdGhpcy5wcm9wZXJ0eSBdID0gdmFsdWU7XG5cdFx0XHR0aGlzLl9jYWxsT25DaGFuZ2UoKTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBkaXNwbGF5IHRvIGtlZXAgaXQgaW4gc3luYyB3aXRoIHRoZSBjdXJyZW50IHZhbHVlLiBVc2VmdWwgZm9yIHVwZGF0aW5nIHlvdXJcblx0ICogY29udHJvbGxlcnMgd2hlbiB0aGVpciB2YWx1ZXMgaGF2ZSBiZWVuIG1vZGlmaWVkIG91dHNpZGUgb2YgdGhlIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bG9hZCggdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdmFsdWUgKTtcblx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHNhdmUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cm95cyB0aGlzIGNvbnRyb2xsZXIgYW5kIHJlbW92ZXMgaXQgZnJvbSB0aGUgcGFyZW50IEdVSS5cblx0ICovXG5cdGRlc3Ryb3koKSB7XG5cdFx0dGhpcy5saXN0ZW4oIGZhbHNlICk7XG5cdFx0dGhpcy5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKCB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHR0aGlzLnBhcmVudC5jb250cm9sbGVycy5zcGxpY2UoIHRoaXMucGFyZW50LmNvbnRyb2xsZXJzLmluZGV4T2YoIHRoaXMgKSwgMSApO1xuXHRcdHRoaXMucGFyZW50LiRjaGlsZHJlbi5yZW1vdmVDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cdH1cblxufVxuXG5jbGFzcyBCb29sZWFuQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHkgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnYm9vbGVhbicsICdsYWJlbCcgKTtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAnY2hlY2tib3gnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRpbnB1dCApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2NoYW5nZScsICgpID0+IHtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuJGlucHV0LmNoZWNrZWQgKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRpbnB1dDtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHRoaXMuJGlucHV0LmNoZWNrZWQgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVDb2xvclN0cmluZyggc3RyaW5nICkge1xuXG5cdGxldCBtYXRjaCwgcmVzdWx0O1xuXG5cdGlmICggbWF0Y2ggPSBzdHJpbmcubWF0Y2goIC8oI3wweCk/KFthLWYwLTldezZ9KS9pICkgKSB7XG5cblx0XHRyZXN1bHQgPSBtYXRjaFsgMiBdO1xuXG5cdH0gZWxzZSBpZiAoIG1hdGNoID0gc3RyaW5nLm1hdGNoKCAvcmdiXFwoXFxzKihcXGQqKVxccyosXFxzKihcXGQqKVxccyosXFxzKihcXGQqKVxccypcXCkvICkgKSB7XG5cblx0XHRyZXN1bHQgPSBwYXJzZUludCggbWF0Y2hbIDEgXSApLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCAyLCAwIClcblx0XHRcdCsgcGFyc2VJbnQoIG1hdGNoWyAyIF0gKS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggMiwgMCApXG5cdFx0XHQrIHBhcnNlSW50KCBtYXRjaFsgMyBdICkudG9TdHJpbmcoIDE2ICkucGFkU3RhcnQoIDIsIDAgKTtcblxuXHR9IGVsc2UgaWYgKCBtYXRjaCA9IHN0cmluZy5tYXRjaCggL14jPyhbYS1mMC05XSkoW2EtZjAtOV0pKFthLWYwLTldKSQvaSApICkge1xuXG5cdFx0cmVzdWx0ID0gbWF0Y2hbIDEgXSArIG1hdGNoWyAxIF0gKyBtYXRjaFsgMiBdICsgbWF0Y2hbIDIgXSArIG1hdGNoWyAzIF0gKyBtYXRjaFsgMyBdO1xuXG5cdH1cblxuXHRpZiAoIHJlc3VsdCApIHtcblx0XHRyZXR1cm4gJyMnICsgcmVzdWx0O1xuXHR9XG5cblx0cmV0dXJuIGZhbHNlO1xuXG59XG5cbmNvbnN0IFNUUklORyA9IHtcblx0aXNQcmltaXRpdmU6IHRydWUsXG5cdG1hdGNoOiB2ID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJyxcblx0ZnJvbUhleFN0cmluZzogbm9ybWFsaXplQ29sb3JTdHJpbmcsXG5cdHRvSGV4U3RyaW5nOiBub3JtYWxpemVDb2xvclN0cmluZ1xufTtcblxuY29uc3QgSU5UID0ge1xuXHRpc1ByaW1pdGl2ZTogdHJ1ZSxcblx0bWF0Y2g6IHYgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInLFxuXHRmcm9tSGV4U3RyaW5nOiBzdHJpbmcgPT4gcGFyc2VJbnQoIHN0cmluZy5zdWJzdHJpbmcoIDEgKSwgMTYgKSxcblx0dG9IZXhTdHJpbmc6IHZhbHVlID0+ICcjJyArIHZhbHVlLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCA2LCAwIClcbn07XG5cbmNvbnN0IEFSUkFZID0ge1xuXHRpc1ByaW1pdGl2ZTogZmFsc2UsXG5cblx0Ly8gVGhlIGFycm93IGZ1bmN0aW9uIGlzIGhlcmUgdG8gYXBwZWFzZSB0cmVlIHNoYWtlcnMgbGlrZSBlc2J1aWxkIG9yIHdlYnBhY2suXG5cdC8vIFNlZSBodHRwczovL2VzYnVpbGQuZ2l0aHViLmlvL2FwaS8jdHJlZS1zaGFraW5nXG5cdG1hdGNoOiB2ID0+IEFycmF5LmlzQXJyYXkoIHYgKSxcblxuXHRmcm9tSGV4U3RyaW5nKCBzdHJpbmcsIHRhcmdldCwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0Y29uc3QgaW50ID0gSU5ULmZyb21IZXhTdHJpbmcoIHN0cmluZyApO1xuXG5cdFx0dGFyZ2V0WyAwIF0gPSAoIGludCA+PiAxNiAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0WyAxIF0gPSAoIGludCA+PiA4ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXRbIDIgXSA9ICggaW50ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblxuXHR9LFxuXHR0b0hleFN0cmluZyggWyByLCBnLCBiIF0sIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdHJnYlNjYWxlID0gMjU1IC8gcmdiU2NhbGU7XG5cblx0XHRjb25zdCBpbnQgPSAoIHIgKiByZ2JTY2FsZSApIDw8IDE2IF5cblx0XHRcdCggZyAqIHJnYlNjYWxlICkgPDwgOCBeXG5cdFx0XHQoIGIgKiByZ2JTY2FsZSApIDw8IDA7XG5cblx0XHRyZXR1cm4gSU5ULnRvSGV4U3RyaW5nKCBpbnQgKTtcblxuXHR9XG59O1xuXG5jb25zdCBPQkpFQ1QgPSB7XG5cdGlzUHJpbWl0aXZlOiBmYWxzZSxcblx0bWF0Y2g6IHYgPT4gT2JqZWN0KCB2ICkgPT09IHYsXG5cdGZyb21IZXhTdHJpbmcoIHN0cmluZywgdGFyZ2V0LCByZ2JTY2FsZSA9IDEgKSB7XG5cblx0XHRjb25zdCBpbnQgPSBJTlQuZnJvbUhleFN0cmluZyggc3RyaW5nICk7XG5cblx0XHR0YXJnZXQuciA9ICggaW50ID4+IDE2ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXQuZyA9ICggaW50ID4+IDggJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXHRcdHRhcmdldC5iID0gKCBpbnQgJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXG5cdH0sXG5cdHRvSGV4U3RyaW5nKCB7IHIsIGcsIGIgfSwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0cmdiU2NhbGUgPSAyNTUgLyByZ2JTY2FsZTtcblxuXHRcdGNvbnN0IGludCA9ICggciAqIHJnYlNjYWxlICkgPDwgMTYgXlxuXHRcdFx0KCBnICogcmdiU2NhbGUgKSA8PCA4IF5cblx0XHRcdCggYiAqIHJnYlNjYWxlICkgPDwgMDtcblxuXHRcdHJldHVybiBJTlQudG9IZXhTdHJpbmcoIGludCApO1xuXG5cdH1cbn07XG5cbmNvbnN0IEZPUk1BVFMgPSBbIFNUUklORywgSU5ULCBBUlJBWSwgT0JKRUNUIF07XG5cbmZ1bmN0aW9uIGdldENvbG9yRm9ybWF0KCB2YWx1ZSApIHtcblx0cmV0dXJuIEZPUk1BVFMuZmluZCggZm9ybWF0ID0+IGZvcm1hdC5tYXRjaCggdmFsdWUgKSApO1xufVxuXG5jbGFzcyBDb2xvckNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblxuXHRjb25zdHJ1Y3RvciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCByZ2JTY2FsZSApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdjb2xvcicgKTtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAnY29sb3InICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndGFiaW5kZXgnLCAtMSApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdHRoaXMuJHRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kdGV4dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ3RleHQnICk7XG5cdFx0dGhpcy4kdGV4dC5zZXRBdHRyaWJ1dGUoICdzcGVsbGNoZWNrJywgJ2ZhbHNlJyApO1xuXHRcdHRoaXMuJHRleHQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kZGlzcGxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QuYWRkKCAnZGlzcGxheScgKTtcblxuXHRcdHRoaXMuJGRpc3BsYXkuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRkaXNwbGF5ICk7XG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiR0ZXh0ICk7XG5cblx0XHR0aGlzLl9mb3JtYXQgPSBnZXRDb2xvckZvcm1hdCggdGhpcy5pbml0aWFsVmFsdWUgKTtcblx0XHR0aGlzLl9yZ2JTY2FsZSA9IHJnYlNjYWxlO1xuXG5cdFx0dGhpcy5faW5pdGlhbFZhbHVlSGV4U3RyaW5nID0gdGhpcy5zYXZlKCk7XG5cdFx0dGhpcy5fdGV4dEZvY3VzZWQgPSBmYWxzZTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsICgpID0+IHtcblx0XHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdGhpcy4kaW5wdXQudmFsdWUgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHRleHQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0JywgKCkgPT4ge1xuXHRcdFx0Y29uc3QgdHJ5UGFyc2UgPSBub3JtYWxpemVDb2xvclN0cmluZyggdGhpcy4kdGV4dC52YWx1ZSApO1xuXHRcdFx0aWYgKCB0cnlQYXJzZSApIHtcblx0XHRcdFx0dGhpcy5fc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB0cnlQYXJzZSApO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHRleHQuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fdGV4dEZvY3VzZWQgPSB0cnVlO1xuXHRcdFx0dGhpcy4kdGV4dC5zZWxlY3QoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR0ZXh0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fdGV4dEZvY3VzZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJHRleHQ7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0cmVzZXQoKSB7XG5cdFx0dGhpcy5fc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB0aGlzLl9pbml0aWFsVmFsdWVIZXhTdHJpbmcgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHZhbHVlICkge1xuXG5cdFx0aWYgKCB0aGlzLl9mb3JtYXQuaXNQcmltaXRpdmUgKSB7XG5cblx0XHRcdGNvbnN0IG5ld1ZhbHVlID0gdGhpcy5fZm9ybWF0LmZyb21IZXhTdHJpbmcoIHZhbHVlICk7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCBuZXdWYWx1ZSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5fZm9ybWF0LmZyb21IZXhTdHJpbmcoIHZhbHVlLCB0aGlzLmdldFZhbHVlKCksIHRoaXMuX3JnYlNjYWxlICk7XG5cdFx0XHR0aGlzLl9jYWxsT25DaGFuZ2UoKTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRzYXZlKCkge1xuXHRcdHJldHVybiB0aGlzLl9mb3JtYXQudG9IZXhTdHJpbmcoIHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5fcmdiU2NhbGUgKTtcblx0fVxuXG5cdGxvYWQoIHZhbHVlICkge1xuXHRcdHRoaXMuX3NldFZhbHVlRnJvbUhleFN0cmluZyggdmFsdWUgKTtcblx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLl9mb3JtYXQudG9IZXhTdHJpbmcoIHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5fcmdiU2NhbGUgKTtcblx0XHRpZiAoICF0aGlzLl90ZXh0Rm9jdXNlZCApIHtcblx0XHRcdHRoaXMuJHRleHQudmFsdWUgPSB0aGlzLiRpbnB1dC52YWx1ZS5zdWJzdHJpbmcoIDEgKTtcblx0XHR9XG5cdFx0dGhpcy4kZGlzcGxheS5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSB0aGlzLiRpbnB1dC52YWx1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbmNsYXNzIEZ1bmN0aW9uQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHkgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnZnVuY3Rpb24nICk7XG5cblx0XHQvLyBCdXR0b25zIGFyZSB0aGUgb25seSBjYXNlIHdoZXJlIHdpZGdldCBjb250YWlucyBuYW1lXG5cdFx0dGhpcy4kYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2J1dHRvbicgKTtcblx0XHR0aGlzLiRidXR0b24uYXBwZW5kQ2hpbGQoIHRoaXMuJG5hbWUgKTtcblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGJ1dHRvbiApO1xuXG5cdFx0dGhpcy4kYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIGUgPT4ge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0dGhpcy5nZXRWYWx1ZSgpLmNhbGwoIHRoaXMub2JqZWN0ICk7XG5cdFx0XHR0aGlzLl9jYWxsT25DaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHQvLyBlbmFibGVzIDphY3RpdmUgcHNldWRvIGNsYXNzIG9uIG1vYmlsZVxuXHRcdHRoaXMuJGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsICgpID0+IHt9LCB7IHBhc3NpdmU6IHRydWUgfSApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJGJ1dHRvbjtcblxuXHR9XG5cbn1cblxuY2xhc3MgTnVtYmVyQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksIG1pbiwgbWF4LCBzdGVwICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ251bWJlcicgKTtcblxuXHRcdHRoaXMuX2luaXRJbnB1dCgpO1xuXG5cdFx0dGhpcy5taW4oIG1pbiApO1xuXHRcdHRoaXMubWF4KCBtYXggKTtcblxuXHRcdGNvbnN0IHN0ZXBFeHBsaWNpdCA9IHN0ZXAgIT09IHVuZGVmaW5lZDtcblx0XHR0aGlzLnN0ZXAoIHN0ZXBFeHBsaWNpdCA/IHN0ZXAgOiB0aGlzLl9nZXRJbXBsaWNpdFN0ZXAoKSwgc3RlcEV4cGxpY2l0ICk7XG5cblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHR9XG5cblx0ZGVjaW1hbHMoIGRlY2ltYWxzICkge1xuXHRcdHRoaXMuX2RlY2ltYWxzID0gZGVjaW1hbHM7XG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRtaW4oIG1pbiApIHtcblx0XHR0aGlzLl9taW4gPSBtaW47XG5cdFx0dGhpcy5fb25VcGRhdGVNaW5NYXgoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG1heCggbWF4ICkge1xuXHRcdHRoaXMuX21heCA9IG1heDtcblx0XHR0aGlzLl9vblVwZGF0ZU1pbk1heCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c3RlcCggc3RlcCwgZXhwbGljaXQgPSB0cnVlICkge1xuXHRcdHRoaXMuX3N0ZXAgPSBzdGVwO1xuXHRcdHRoaXMuX3N0ZXBFeHBsaWNpdCA9IGV4cGxpY2l0O1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblxuXHRcdGNvbnN0IHZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0aWYgKCB0aGlzLl9oYXNTbGlkZXIgKSB7XG5cblx0XHRcdGxldCBwZXJjZW50ID0gKCB2YWx1ZSAtIHRoaXMuX21pbiApIC8gKCB0aGlzLl9tYXggLSB0aGlzLl9taW4gKTtcblx0XHRcdHBlcmNlbnQgPSBNYXRoLm1heCggMCwgTWF0aC5taW4oIHBlcmNlbnQsIDEgKSApO1xuXG5cdFx0XHR0aGlzLiRmaWxsLnN0eWxlLndpZHRoID0gcGVyY2VudCAqIDEwMCArICclJztcblxuXHRcdH1cblxuXHRcdGlmICggIXRoaXMuX2lucHV0Rm9jdXNlZCApIHtcblx0XHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5fZGVjaW1hbHMgPT09IHVuZGVmaW5lZCA/IHZhbHVlIDogdmFsdWUudG9GaXhlZCggdGhpcy5fZGVjaW1hbHMgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0X2luaXRJbnB1dCgpIHtcblxuXHRcdHRoaXMuJGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2lucHV0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAndGV4dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHQvLyBPbiB0b3VjaCBkZXZpY2VzIG9ubHksIHVzZSBpbnB1dFt0eXBlPW51bWJlcl0gdG8gZm9yY2UgYSBudW1lcmljIGtleWJvYXJkLlxuXHRcdC8vIElkZWFsbHkgd2UgY291bGQgdXNlIG9uZSBpbnB1dCB0eXBlIGV2ZXJ5d2hlcmUsIGJ1dCBbdHlwZT1udW1iZXJdIGhhcyBxdWlya3Ncblx0XHQvLyBvbiBkZXNrdG9wLCBhbmQgW2lucHV0bW9kZT1kZWNpbWFsXSBoYXMgcXVpcmtzIG9uIGlPUy5cblx0XHQvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2dlb3JnZWFsd2F5cy9saWwtZ3VpL3B1bGwvMTZcblxuXHRcdGNvbnN0IGlzVG91Y2ggPSB3aW5kb3cubWF0Y2hNZWRpYSggJyhwb2ludGVyOiBjb2Fyc2UpJyApLm1hdGNoZXM7XG5cblx0XHRpZiAoIGlzVG91Y2ggKSB7XG5cdFx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ251bWJlcicgKTtcblx0XHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3N0ZXAnLCAnYW55JyApO1xuXHRcdH1cblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRpbnB1dDtcblxuXHRcdGNvbnN0IG9uSW5wdXQgPSAoKSA9PiB7XG5cblx0XHRcdGxldCB2YWx1ZSA9IHBhcnNlRmxvYXQoIHRoaXMuJGlucHV0LnZhbHVlICk7XG5cblx0XHRcdGlmICggaXNOYU4oIHZhbHVlICkgKSByZXR1cm47XG5cblx0XHRcdGlmICggdGhpcy5fc3RlcEV4cGxpY2l0ICkge1xuXHRcdFx0XHR2YWx1ZSA9IHRoaXMuX3NuYXAoIHZhbHVlICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0VmFsdWUoIHRoaXMuX2NsYW1wKCB2YWx1ZSApICk7XG5cblx0XHR9O1xuXG5cdFx0Ly8gS2V5cyAmIG1vdXNlIHdoZWVsXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBpbmNyZW1lbnQgPSBkZWx0YSA9PiB7XG5cblx0XHRcdGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdCggdGhpcy4kaW5wdXQudmFsdWUgKTtcblxuXHRcdFx0aWYgKCBpc05hTiggdmFsdWUgKSApIHJldHVybjtcblxuXHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIHZhbHVlICsgZGVsdGEgKTtcblxuXHRcdFx0Ly8gRm9yY2UgdGhlIGlucHV0IHRvIHVwZGF0ZURpc3BsYXkgd2hlbiBpdCdzIGZvY3VzZWRcblx0XHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uS2V5RG93biA9IGUgPT4ge1xuXHRcdFx0Ly8gVXNpbmcgYGUua2V5YCBpbnN0ZWFkIG9mIGBlLmNvZGVgIGFsc28gY2F0Y2hlcyBOdW1wYWRFbnRlclxuXHRcdFx0aWYgKCBlLmtleSA9PT0gJ0VudGVyJyApIHtcblx0XHRcdFx0dGhpcy4kaW5wdXQuYmx1cigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBlLmNvZGUgPT09ICdBcnJvd1VwJyApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpbmNyZW1lbnQoIHRoaXMuX3N0ZXAgKiB0aGlzLl9hcnJvd0tleU11bHRpcGxpZXIoIGUgKSApO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCBlLmNvZGUgPT09ICdBcnJvd0Rvd24nICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGluY3JlbWVudCggdGhpcy5fc3RlcCAqIHRoaXMuX2Fycm93S2V5TXVsdGlwbGllciggZSApICogLTEgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25XaGVlbCA9IGUgPT4ge1xuXHRcdFx0aWYgKCB0aGlzLl9pbnB1dEZvY3VzZWQgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aW5jcmVtZW50KCB0aGlzLl9zdGVwICogdGhpcy5fbm9ybWFsaXplTW91c2VXaGVlbCggZSApICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIFZlcnRpY2FsIGRyYWdcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGxldCB0ZXN0aW5nRm9yVmVydGljYWxEcmFnID0gZmFsc2UsXG5cdFx0XHRpbml0Q2xpZW50WCxcblx0XHRcdGluaXRDbGllbnRZLFxuXHRcdFx0cHJldkNsaWVudFksXG5cdFx0XHRpbml0VmFsdWUsXG5cdFx0XHRkcmFnRGVsdGE7XG5cblx0XHQvLyBPbmNlIHRoZSBtb3VzZSBpcyBkcmFnZ2VkIG1vcmUgdGhhbiBEUkFHX1RIUkVTSCBweCBvbiBhbnkgYXhpcywgd2UgZGVjaWRlXG5cdFx0Ly8gb24gdGhlIHVzZXIncyBpbnRlbnQ6IGhvcml6b250YWwgbWVhbnMgaGlnaGxpZ2h0LCB2ZXJ0aWNhbCBtZWFucyBkcmFnLlxuXHRcdGNvbnN0IERSQUdfVEhSRVNIID0gNTtcblxuXHRcdGNvbnN0IG9uTW91c2VEb3duID0gZSA9PiB7XG5cblx0XHRcdGluaXRDbGllbnRYID0gZS5jbGllbnRYO1xuXHRcdFx0aW5pdENsaWVudFkgPSBwcmV2Q2xpZW50WSA9IGUuY2xpZW50WTtcblx0XHRcdHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgPSB0cnVlO1xuXG5cdFx0XHRpbml0VmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0XHRkcmFnRGVsdGEgPSAwO1xuXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAgKTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvbk1vdXNlTW92ZSA9IGUgPT4ge1xuXG5cdFx0XHRpZiAoIHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgKSB7XG5cblx0XHRcdFx0Y29uc3QgZHggPSBlLmNsaWVudFggLSBpbml0Q2xpZW50WDtcblx0XHRcdFx0Y29uc3QgZHkgPSBlLmNsaWVudFkgLSBpbml0Q2xpZW50WTtcblxuXHRcdFx0XHRpZiAoIE1hdGguYWJzKCBkeSApID4gRFJBR19USFJFU0ggKSB7XG5cblx0XHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdFx0dGhpcy4kaW5wdXQuYmx1cigpO1xuXHRcdFx0XHRcdHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgPSBmYWxzZTtcblx0XHRcdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCB0cnVlLCAndmVydGljYWwnICk7XG5cblx0XHRcdFx0fSBlbHNlIGlmICggTWF0aC5hYnMoIGR4ICkgPiBEUkFHX1RIUkVTSCApIHtcblxuXHRcdFx0XHRcdG9uTW91c2VVcCgpO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHQvLyBUaGlzIGlzbid0IGFuIGVsc2Ugc28gdGhhdCB0aGUgZmlyc3QgbW92ZSBjb3VudHMgdG93YXJkcyBkcmFnRGVsdGFcblx0XHRcdGlmICggIXRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgKSB7XG5cblx0XHRcdFx0Y29uc3QgZHkgPSBlLmNsaWVudFkgLSBwcmV2Q2xpZW50WTtcblxuXHRcdFx0XHRkcmFnRGVsdGEgLT0gZHkgKiB0aGlzLl9zdGVwICogdGhpcy5fYXJyb3dLZXlNdWx0aXBsaWVyKCBlICk7XG5cblx0XHRcdFx0Ly8gQ2xhbXAgZHJhZ0RlbHRhIHNvIHdlIGRvbid0IGhhdmUgJ2RlYWQgc3BhY2UnIGFmdGVyIGRyYWdnaW5nIHBhc3QgYm91bmRzLlxuXHRcdFx0XHQvLyBXZSdyZSBva2F5IHdpdGggdGhlIGZhY3QgdGhhdCBib3VuZHMgY2FuIGJlIHVuZGVmaW5lZCBoZXJlLlxuXHRcdFx0XHRpZiAoIGluaXRWYWx1ZSArIGRyYWdEZWx0YSA+IHRoaXMuX21heCApIHtcblx0XHRcdFx0XHRkcmFnRGVsdGEgPSB0aGlzLl9tYXggLSBpbml0VmFsdWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIGluaXRWYWx1ZSArIGRyYWdEZWx0YSA8IHRoaXMuX21pbiApIHtcblx0XHRcdFx0XHRkcmFnRGVsdGEgPSB0aGlzLl9taW4gLSBpbml0VmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLl9zbmFwQ2xhbXBTZXRWYWx1ZSggaW5pdFZhbHVlICsgZHJhZ0RlbHRhICk7XG5cblx0XHRcdH1cblxuXHRcdFx0cHJldkNsaWVudFkgPSBlLmNsaWVudFk7XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Nb3VzZVVwID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggZmFsc2UsICd2ZXJ0aWNhbCcgKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBvbk1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgb25Nb3VzZVVwICk7XG5cdFx0fTtcblxuXHRcdC8vIEZvY3VzIHN0YXRlICYgb25GaW5pc2hDaGFuZ2Vcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGNvbnN0IG9uRm9jdXMgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9pbnB1dEZvY3VzZWQgPSB0cnVlO1xuXHRcdH07XG5cblx0XHRjb25zdCBvbkJsdXIgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9pbnB1dEZvY3VzZWQgPSBmYWxzZTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdpbnB1dCcsIG9uSW5wdXQgKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIG9uS2V5RG93biApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIG9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBvbk1vdXNlRG93biApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdmb2N1cycsIG9uRm9jdXMgKTtcblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsIG9uQmx1ciApO1xuXG5cdH1cblxuXHRfaW5pdFNsaWRlcigpIHtcblxuXHRcdHRoaXMuX2hhc1NsaWRlciA9IHRydWU7XG5cblx0XHQvLyBCdWlsZCBET01cblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdHRoaXMuJHNsaWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kc2xpZGVyLmNsYXNzTGlzdC5hZGQoICdzbGlkZXInICk7XG5cblx0XHR0aGlzLiRmaWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRmaWxsLmNsYXNzTGlzdC5hZGQoICdmaWxsJyApO1xuXG5cdFx0dGhpcy4kc2xpZGVyLmFwcGVuZENoaWxkKCB0aGlzLiRmaWxsICk7XG5cdFx0dGhpcy4kd2lkZ2V0Lmluc2VydEJlZm9yZSggdGhpcy4kc2xpZGVyLCB0aGlzLiRpbnB1dCApO1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdoYXNTbGlkZXInICk7XG5cblx0XHQvLyBNYXAgY2xpZW50WCB0byB2YWx1ZVxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3QgbWFwID0gKCB2LCBhLCBiLCBjLCBkICkgPT4ge1xuXHRcdFx0cmV0dXJuICggdiAtIGEgKSAvICggYiAtIGEgKSAqICggZCAtIGMgKSArIGM7XG5cdFx0fTtcblxuXHRcdGNvbnN0IHNldFZhbHVlRnJvbVggPSBjbGllbnRYID0+IHtcblx0XHRcdGNvbnN0IHJlY3QgPSB0aGlzLiRzbGlkZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG5cdFx0XHRsZXQgdmFsdWUgPSBtYXAoIGNsaWVudFgsIHJlY3QubGVmdCwgcmVjdC5yaWdodCwgdGhpcy5fbWluLCB0aGlzLl9tYXggKTtcblx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdH07XG5cblx0XHQvLyBNb3VzZSBkcmFnXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBtb3VzZURvd24gPSBlID0+IHtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIHRydWUgKTtcblx0XHRcdHNldFZhbHVlRnJvbVgoIGUuY2xpZW50WCApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZU1vdmUgKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNlVXAgKTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgbW91c2VNb3ZlID0gZSA9PiB7XG5cdFx0XHRzZXRWYWx1ZUZyb21YKCBlLmNsaWVudFggKTtcblx0XHR9O1xuXG5cdFx0Y29uc3QgbW91c2VVcCA9ICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggZmFsc2UgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgbW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBtb3VzZVVwICk7XG5cdFx0fTtcblxuXHRcdC8vIFRvdWNoIGRyYWdcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGxldCB0ZXN0aW5nRm9yU2Nyb2xsID0gZmFsc2UsIHByZXZDbGllbnRYLCBwcmV2Q2xpZW50WTtcblxuXHRcdGNvbnN0IGJlZ2luVG91Y2hEcmFnID0gZSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCB0cnVlICk7XG5cdFx0XHRzZXRWYWx1ZUZyb21YKCBlLnRvdWNoZXNbIDAgXS5jbGllbnRYICk7XG5cdFx0XHR0ZXN0aW5nRm9yU2Nyb2xsID0gZmFsc2U7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uVG91Y2hTdGFydCA9IGUgPT4ge1xuXG5cdFx0XHRpZiAoIGUudG91Y2hlcy5sZW5ndGggPiAxICkgcmV0dXJuO1xuXG5cdFx0XHQvLyBJZiB3ZSdyZSBpbiBhIHNjcm9sbGFibGUgY29udGFpbmVyLCB3ZSBzaG91bGQgd2FpdCBmb3IgdGhlIGZpcnN0XG5cdFx0XHQvLyB0b3VjaG1vdmUgdG8gc2VlIGlmIHRoZSB1c2VyIGlzIHRyeWluZyB0byBzbGlkZSBvciBzY3JvbGwuXG5cdFx0XHRpZiAoIHRoaXMuX2hhc1Njcm9sbEJhciApIHtcblxuXHRcdFx0XHRwcmV2Q2xpZW50WCA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFg7XG5cdFx0XHRcdHByZXZDbGllbnRZID0gZS50b3VjaGVzWyAwIF0uY2xpZW50WTtcblx0XHRcdFx0dGVzdGluZ0ZvclNjcm9sbCA9IHRydWU7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0Ly8gT3RoZXJ3aXNlLCB3ZSBjYW4gc2V0IHRoZSB2YWx1ZSBzdHJhaWdodCBhd2F5IG9uIHRvdWNoc3RhcnQuXG5cdFx0XHRcdGJlZ2luVG91Y2hEcmFnKCBlICk7XG5cblx0XHRcdH1cblxuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgeyBwYXNzaXZlOiBmYWxzZSB9ICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCApO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uVG91Y2hNb3ZlID0gZSA9PiB7XG5cblx0XHRcdGlmICggdGVzdGluZ0ZvclNjcm9sbCApIHtcblxuXHRcdFx0XHRjb25zdCBkeCA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFggLSBwcmV2Q2xpZW50WDtcblx0XHRcdFx0Y29uc3QgZHkgPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRZIC0gcHJldkNsaWVudFk7XG5cblx0XHRcdFx0aWYgKCBNYXRoLmFicyggZHggKSA+IE1hdGguYWJzKCBkeSApICkge1xuXG5cdFx0XHRcdFx0Ly8gV2UgbW92ZWQgaG9yaXpvbnRhbGx5LCBzZXQgdGhlIHZhbHVlIGFuZCBzdG9wIGNoZWNraW5nLlxuXHRcdFx0XHRcdGJlZ2luVG91Y2hEcmFnKCBlICk7XG5cblx0XHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRcdC8vIFRoaXMgd2FzLCBpbiBmYWN0LCBhbiBhdHRlbXB0IHRvIHNjcm9sbC4gQWJvcnQuXG5cdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSApO1xuXHRcdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBvblRvdWNoRW5kICk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0c2V0VmFsdWVGcm9tWCggZS50b3VjaGVzWyAwIF0uY2xpZW50WCApO1xuXG5cdFx0XHR9XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Ub3VjaEVuZCA9ICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggZmFsc2UgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBvblRvdWNoRW5kICk7XG5cdFx0fTtcblxuXHRcdC8vIE1vdXNlIHdoZWVsXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHQvLyBXZSBoYXZlIHRvIHVzZSBhIGRlYm91bmNlZCBmdW5jdGlvbiB0byBjYWxsIG9uRmluaXNoQ2hhbmdlIGJlY2F1c2Vcblx0XHQvLyB0aGVyZSdzIG5vIHdheSB0byB0ZWxsIHdoZW4gdGhlIHVzZXIgaXMgXCJkb25lXCIgbW91c2Utd2hlZWxpbmcuXG5cdFx0Y29uc3QgY2FsbE9uRmluaXNoQ2hhbmdlID0gdGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlLmJpbmQoIHRoaXMgKTtcblx0XHRjb25zdCBXSEVFTF9ERUJPVU5DRV9USU1FID0gNDAwO1xuXHRcdGxldCB3aGVlbEZpbmlzaENoYW5nZVRpbWVvdXQ7XG5cblx0XHRjb25zdCBvbldoZWVsID0gZSA9PiB7XG5cblx0XHRcdC8vIGlnbm9yZSB2ZXJ0aWNhbCB3aGVlbHMgaWYgdGhlcmUncyBhIHNjcm9sbGJhclxuXHRcdFx0Y29uc3QgaXNWZXJ0aWNhbCA9IE1hdGguYWJzKCBlLmRlbHRhWCApIDwgTWF0aC5hYnMoIGUuZGVsdGFZICk7XG5cdFx0XHRpZiAoIGlzVmVydGljYWwgJiYgdGhpcy5faGFzU2Nyb2xsQmFyICkgcmV0dXJuO1xuXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdC8vIHNldCB2YWx1ZVxuXHRcdFx0Y29uc3QgZGVsdGEgPSB0aGlzLl9ub3JtYWxpemVNb3VzZVdoZWVsKCBlICkgKiB0aGlzLl9zdGVwO1xuXHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIHRoaXMuZ2V0VmFsdWUoKSArIGRlbHRhICk7XG5cblx0XHRcdC8vIGZvcmNlIHRoZSBpbnB1dCB0byB1cGRhdGVEaXNwbGF5IHdoZW4gaXQncyBmb2N1c2VkXG5cdFx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblxuXHRcdFx0Ly8gZGVib3VuY2Ugb25GaW5pc2hDaGFuZ2Vcblx0XHRcdGNsZWFyVGltZW91dCggd2hlZWxGaW5pc2hDaGFuZ2VUaW1lb3V0ICk7XG5cdFx0XHR3aGVlbEZpbmlzaENoYW5nZVRpbWVvdXQgPSBzZXRUaW1lb3V0KCBjYWxsT25GaW5pc2hDaGFuZ2UsIFdIRUVMX0RFQk9VTkNFX1RJTUUgKTtcblxuXHRcdH07XG5cblx0XHR0aGlzLiRzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG1vdXNlRG93biApO1xuXHRcdHRoaXMuJHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCwgeyBwYXNzaXZlOiBmYWxzZSB9ICk7XG5cdFx0dGhpcy4kc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoICd3aGVlbCcsIG9uV2hlZWwsIHsgcGFzc2l2ZTogZmFsc2UgfSApO1xuXG5cdH1cblxuXHRfc2V0RHJhZ2dpbmdTdHlsZSggYWN0aXZlLCBheGlzID0gJ2hvcml6b250YWwnICkge1xuXHRcdGlmICggdGhpcy4kc2xpZGVyICkge1xuXHRcdFx0dGhpcy4kc2xpZGVyLmNsYXNzTGlzdC50b2dnbGUoICdhY3RpdmUnLCBhY3RpdmUgKTtcblx0XHR9XG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCAnbGlsLWd1aS1kcmFnZ2luZycsIGFjdGl2ZSApO1xuXHRcdGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnRvZ2dsZSggYGxpbC1ndWktJHtheGlzfWAsIGFjdGl2ZSApO1xuXHR9XG5cblx0X2dldEltcGxpY2l0U3RlcCgpIHtcblxuXHRcdGlmICggdGhpcy5faGFzTWluICYmIHRoaXMuX2hhc01heCApIHtcblx0XHRcdHJldHVybiAoIHRoaXMuX21heCAtIHRoaXMuX21pbiApIC8gMTAwMDtcblx0XHR9XG5cblx0XHRyZXR1cm4gMC4xO1xuXG5cdH1cblxuXHRfb25VcGRhdGVNaW5NYXgoKSB7XG5cblx0XHRpZiAoICF0aGlzLl9oYXNTbGlkZXIgJiYgdGhpcy5faGFzTWluICYmIHRoaXMuX2hhc01heCApIHtcblxuXHRcdFx0Ly8gSWYgdGhpcyBpcyB0aGUgZmlyc3QgdGltZSB3ZSdyZSBoZWFyaW5nIGFib3V0IG1pbiBhbmQgbWF4XG5cdFx0XHQvLyBhbmQgd2UgaGF2ZW4ndCBleHBsaWNpdGx5IHN0YXRlZCB3aGF0IG91ciBzdGVwIGlzLCBsZXQnc1xuXHRcdFx0Ly8gdXBkYXRlIHRoYXQgdG9vLlxuXHRcdFx0aWYgKCAhdGhpcy5fc3RlcEV4cGxpY2l0ICkge1xuXHRcdFx0XHR0aGlzLnN0ZXAoIHRoaXMuX2dldEltcGxpY2l0U3RlcCgpLCBmYWxzZSApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9pbml0U2xpZGVyKCk7XG5cdFx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblxuXHRcdH1cblxuXHR9XG5cblx0X25vcm1hbGl6ZU1vdXNlV2hlZWwoIGUgKSB7XG5cblx0XHRsZXQgeyBkZWx0YVgsIGRlbHRhWSB9ID0gZTtcblxuXHRcdC8vIFNhZmFyaSBhbmQgQ2hyb21lIHJlcG9ydCB3ZWlyZCBub24taW50ZWdyYWwgdmFsdWVzIGZvciBhIG5vdGNoZWQgd2hlZWwsXG5cdFx0Ly8gYnV0IHN0aWxsIGV4cG9zZSBhY3R1YWwgbGluZXMgc2Nyb2xsZWQgdmlhIHdoZWVsRGVsdGEuIE5vdGNoZWQgd2hlZWxzXG5cdFx0Ly8gc2hvdWxkIGJlaGF2ZSB0aGUgc2FtZSB3YXkgYXMgYXJyb3cga2V5cy5cblx0XHRpZiAoIE1hdGguZmxvb3IoIGUuZGVsdGFZICkgIT09IGUuZGVsdGFZICYmIGUud2hlZWxEZWx0YSApIHtcblx0XHRcdGRlbHRhWCA9IDA7XG5cdFx0XHRkZWx0YVkgPSAtZS53aGVlbERlbHRhIC8gMTIwO1xuXHRcdFx0ZGVsdGFZICo9IHRoaXMuX3N0ZXBFeHBsaWNpdCA/IDEgOiAxMDtcblx0XHR9XG5cblx0XHRjb25zdCB3aGVlbCA9IGRlbHRhWCArIC1kZWx0YVk7XG5cblx0XHRyZXR1cm4gd2hlZWw7XG5cblx0fVxuXG5cdF9hcnJvd0tleU11bHRpcGxpZXIoIGUgKSB7XG5cblx0XHRsZXQgbXVsdCA9IHRoaXMuX3N0ZXBFeHBsaWNpdCA/IDEgOiAxMDtcblxuXHRcdGlmICggZS5zaGlmdEtleSApIHtcblx0XHRcdG11bHQgKj0gMTA7XG5cdFx0fSBlbHNlIGlmICggZS5hbHRLZXkgKSB7XG5cdFx0XHRtdWx0IC89IDEwO1xuXHRcdH1cblxuXHRcdHJldHVybiBtdWx0O1xuXG5cdH1cblxuXHRfc25hcCggdmFsdWUgKSB7XG5cblx0XHQvLyBNYWtlIHRoZSBzdGVwcyBcInN0YXJ0XCIgYXQgbWluIG9yIG1heC5cblx0XHRsZXQgb2Zmc2V0ID0gMDtcblx0XHRpZiAoIHRoaXMuX2hhc01pbiApIHtcblx0XHRcdG9mZnNldCA9IHRoaXMuX21pbjtcblx0XHR9IGVsc2UgaWYgKCB0aGlzLl9oYXNNYXggKSB7XG5cdFx0XHRvZmZzZXQgPSB0aGlzLl9tYXg7XG5cdFx0fVxuXG5cdFx0dmFsdWUgLT0gb2Zmc2V0O1xuXG5cdFx0dmFsdWUgPSBNYXRoLnJvdW5kKCB2YWx1ZSAvIHRoaXMuX3N0ZXAgKSAqIHRoaXMuX3N0ZXA7XG5cblx0XHR2YWx1ZSArPSBvZmZzZXQ7XG5cblx0XHQvLyBVc2VkIHRvIHByZXZlbnQgXCJmbHlhd2F5XCIgZGVjaW1hbHMgbGlrZSAxLjAwMDAwMDAwMDAwMDAxXG5cdFx0dmFsdWUgPSBwYXJzZUZsb2F0KCB2YWx1ZS50b1ByZWNpc2lvbiggMTUgKSApO1xuXG5cdFx0cmV0dXJuIHZhbHVlO1xuXG5cdH1cblxuXHRfY2xhbXAoIHZhbHVlICkge1xuXHRcdC8vIGVpdGhlciBjb25kaXRpb24gaXMgZmFsc2UgaWYgbWluIG9yIG1heCBpcyB1bmRlZmluZWRcblx0XHRpZiAoIHZhbHVlIDwgdGhpcy5fbWluICkgdmFsdWUgPSB0aGlzLl9taW47XG5cdFx0aWYgKCB2YWx1ZSA+IHRoaXMuX21heCApIHZhbHVlID0gdGhpcy5fbWF4O1xuXHRcdHJldHVybiB2YWx1ZTtcblx0fVxuXG5cdF9zbmFwQ2xhbXBTZXRWYWx1ZSggdmFsdWUgKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5fY2xhbXAoIHRoaXMuX3NuYXAoIHZhbHVlICkgKSApO1xuXHR9XG5cblx0Z2V0IF9oYXNTY3JvbGxCYXIoKSB7XG5cdFx0Y29uc3Qgcm9vdCA9IHRoaXMucGFyZW50LnJvb3QuJGNoaWxkcmVuO1xuXHRcdHJldHVybiByb290LnNjcm9sbEhlaWdodCA+IHJvb3QuY2xpZW50SGVpZ2h0O1xuXHR9XG5cblx0Z2V0IF9oYXNNaW4oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21pbiAhPT0gdW5kZWZpbmVkO1xuXHR9XG5cblx0Z2V0IF9oYXNNYXgoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX21heCAhPT0gdW5kZWZpbmVkO1xuXHR9XG5cbn1cblxuY2xhc3MgT3B0aW9uQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksIG9wdGlvbnMgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnb3B0aW9uJyApO1xuXG5cdFx0dGhpcy4kc2VsZWN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ3NlbGVjdCcgKTtcblx0XHR0aGlzLiRzZWxlY3Quc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kZGlzcGxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QuYWRkKCAnZGlzcGxheScgKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5fdmFsdWVzWyB0aGlzLiRzZWxlY3Quc2VsZWN0ZWRJbmRleCBdICk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzJywgKCkgPT4ge1xuXHRcdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QuYWRkKCAnZm9jdXMnICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgKCkgPT4ge1xuXHRcdFx0dGhpcy4kZGlzcGxheS5jbGFzc0xpc3QucmVtb3ZlKCAnZm9jdXMnICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRzZWxlY3QgKTtcblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGRpc3BsYXkgKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRzZWxlY3Q7XG5cblx0XHR0aGlzLm9wdGlvbnMoIG9wdGlvbnMgKTtcblxuXHR9XG5cblx0b3B0aW9ucyggb3B0aW9ucyApIHtcblxuXHRcdHRoaXMuX3ZhbHVlcyA9IEFycmF5LmlzQXJyYXkoIG9wdGlvbnMgKSA/IG9wdGlvbnMgOiBPYmplY3QudmFsdWVzKCBvcHRpb25zICk7XG5cdFx0dGhpcy5fbmFtZXMgPSBBcnJheS5pc0FycmF5KCBvcHRpb25zICkgPyBvcHRpb25zIDogT2JqZWN0LmtleXMoIG9wdGlvbnMgKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5yZXBsYWNlQ2hpbGRyZW4oKTtcblxuXHRcdHRoaXMuX25hbWVzLmZvckVhY2goIG5hbWUgPT4ge1xuXHRcdFx0Y29uc3QgJG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdvcHRpb24nICk7XG5cdFx0XHQkb3B0aW9uLnRleHRDb250ZW50ID0gbmFtZTtcblx0XHRcdHRoaXMuJHNlbGVjdC5hcHBlbmRDaGlsZCggJG9wdGlvbiApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0Y29uc3QgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0Y29uc3QgaW5kZXggPSB0aGlzLl92YWx1ZXMuaW5kZXhPZiggdmFsdWUgKTtcblx0XHR0aGlzLiRzZWxlY3Quc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuXHRcdHRoaXMuJGRpc3BsYXkudGV4dENvbnRlbnQgPSBpbmRleCA9PT0gLTEgPyB2YWx1ZSA6IHRoaXMuX25hbWVzWyBpbmRleCBdO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxuY2xhc3MgU3RyaW5nQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHkgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnc3RyaW5nJyApO1xuXG5cdFx0dGhpcy4kaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3NwZWxsY2hlY2snLCAnZmFsc2UnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0JywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy4kaW5wdXQudmFsdWUgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIGUgPT4ge1xuXHRcdFx0aWYgKCBlLmNvZGUgPT09ICdFbnRlcicgKSB7XG5cdFx0XHRcdHRoaXMuJGlucHV0LmJsdXIoKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnYmx1cicsICgpID0+IHtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblxuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiRpbnB1dDtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxudmFyIHN0eWxlc2hlZXQgPSBgLmxpbC1ndWkge1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpO1xuICBmb250LXNpemU6IHZhcigtLWZvbnQtc2l6ZSk7XG4gIGxpbmUtaGVpZ2h0OiAxO1xuICBmb250LXdlaWdodDogbm9ybWFsO1xuICBmb250LXN0eWxlOiBub3JtYWw7XG4gIHRleHQtYWxpZ246IGxlZnQ7XG4gIGNvbG9yOiB2YXIoLS10ZXh0LWNvbG9yKTtcbiAgdXNlci1zZWxlY3Q6IG5vbmU7XG4gIC13ZWJraXQtdXNlci1zZWxlY3Q6IG5vbmU7XG4gIHRvdWNoLWFjdGlvbjogbWFuaXB1bGF0aW9uO1xuICAtLWJhY2tncm91bmQtY29sb3I6ICMxZjFmMWY7XG4gIC0tdGV4dC1jb2xvcjogI2ViZWJlYjtcbiAgLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yOiAjMTExMTExO1xuICAtLXRpdGxlLXRleHQtY29sb3I6ICNlYmViZWI7XG4gIC0td2lkZ2V0LWNvbG9yOiAjNDI0MjQyO1xuICAtLWhvdmVyLWNvbG9yOiAjNGY0ZjRmO1xuICAtLWZvY3VzLWNvbG9yOiAjNTk1OTU5O1xuICAtLW51bWJlci1jb2xvcjogIzJjYzlmZjtcbiAgLS1zdHJpbmctY29sb3I6ICNhMmRiM2M7XG4gIC0tZm9udC1zaXplOiAxMXB4O1xuICAtLWlucHV0LWZvbnQtc2l6ZTogMTFweDtcbiAgLS1mb250LWZhbWlseTogLWFwcGxlLXN5c3RlbSwgQmxpbmtNYWNTeXN0ZW1Gb250LCBcIlNlZ29lIFVJXCIsIFJvYm90bywgQXJpYWwsIHNhbnMtc2VyaWY7XG4gIC0tZm9udC1mYW1pbHktbW9ubzogTWVubG8sIE1vbmFjbywgQ29uc29sYXMsIFwiRHJvaWQgU2FucyBNb25vXCIsIG1vbm9zcGFjZTtcbiAgLS1wYWRkaW5nOiA0cHg7XG4gIC0tc3BhY2luZzogNHB4O1xuICAtLXdpZGdldC1oZWlnaHQ6IDIwcHg7XG4gIC0tdGl0bGUtaGVpZ2h0OiBjYWxjKHZhcigtLXdpZGdldC1oZWlnaHQpICsgdmFyKC0tc3BhY2luZykgKiAxLjI1KTtcbiAgLS1uYW1lLXdpZHRoOiA0NSU7XG4gIC0tc2xpZGVyLWtub2Itd2lkdGg6IDJweDtcbiAgLS1zbGlkZXItaW5wdXQtd2lkdGg6IDI3JTtcbiAgLS1jb2xvci1pbnB1dC13aWR0aDogMjclO1xuICAtLXNsaWRlci1pbnB1dC1taW4td2lkdGg6IDQ1cHg7XG4gIC0tY29sb3ItaW5wdXQtbWluLXdpZHRoOiA0NXB4O1xuICAtLWZvbGRlci1pbmRlbnQ6IDdweDtcbiAgLS13aWRnZXQtcGFkZGluZzogMCAwIDAgM3B4O1xuICAtLXdpZGdldC1ib3JkZXItcmFkaXVzOiAycHg7XG4gIC0tY2hlY2tib3gtc2l6ZTogY2FsYygwLjc1ICogdmFyKC0td2lkZ2V0LWhlaWdodCkpO1xuICAtLXNjcm9sbGJhci13aWR0aDogNXB4O1xufVxuLmxpbC1ndWksIC5saWwtZ3VpICoge1xuICBib3gtc2l6aW5nOiBib3JkZXItYm94O1xuICBtYXJnaW46IDA7XG4gIHBhZGRpbmc6IDA7XG59XG4ubGlsLWd1aS5yb290IHtcbiAgd2lkdGg6IHZhcigtLXdpZHRoLCAyNDVweCk7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGZsZXgtZGlyZWN0aW9uOiBjb2x1bW47XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xufVxuLmxpbC1ndWkucm9vdCA+IC50aXRsZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLXRpdGxlLWJhY2tncm91bmQtY29sb3IpO1xuICBjb2xvcjogdmFyKC0tdGl0bGUtdGV4dC1jb2xvcik7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuIHtcbiAgb3ZlcmZsb3cteDogaGlkZGVuO1xuICBvdmVyZmxvdy15OiBhdXRvO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbjo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICB3aWR0aDogdmFyKC0tc2Nyb2xsYmFyLXdpZHRoKTtcbiAgaGVpZ2h0OiB2YXIoLS1zY3JvbGxiYXItd2lkdGgpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1iYWNrZ3JvdW5kLWNvbG9yKTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW46Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0tc2Nyb2xsYmFyLXdpZHRoKTtcbiAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xufVxuQG1lZGlhIChwb2ludGVyOiBjb2Fyc2UpIHtcbiAgLmxpbC1ndWkuYWxsb3ctdG91Y2gtc3R5bGVzLCAubGlsLWd1aS5hbGxvdy10b3VjaC1zdHlsZXMgLmxpbC1ndWkge1xuICAgIC0td2lkZ2V0LWhlaWdodDogMjhweDtcbiAgICAtLXBhZGRpbmc6IDZweDtcbiAgICAtLXNwYWNpbmc6IDZweDtcbiAgICAtLWZvbnQtc2l6ZTogMTNweDtcbiAgICAtLWlucHV0LWZvbnQtc2l6ZTogMTZweDtcbiAgICAtLWZvbGRlci1pbmRlbnQ6IDEwcHg7XG4gICAgLS1zY3JvbGxiYXItd2lkdGg6IDdweDtcbiAgICAtLXNsaWRlci1pbnB1dC1taW4td2lkdGg6IDUwcHg7XG4gICAgLS1jb2xvci1pbnB1dC1taW4td2lkdGg6IDY1cHg7XG4gIH1cbn1cbi5saWwtZ3VpLmZvcmNlLXRvdWNoLXN0eWxlcywgLmxpbC1ndWkuZm9yY2UtdG91Y2gtc3R5bGVzIC5saWwtZ3VpIHtcbiAgLS13aWRnZXQtaGVpZ2h0OiAyOHB4O1xuICAtLXBhZGRpbmc6IDZweDtcbiAgLS1zcGFjaW5nOiA2cHg7XG4gIC0tZm9udC1zaXplOiAxM3B4O1xuICAtLWlucHV0LWZvbnQtc2l6ZTogMTZweDtcbiAgLS1mb2xkZXItaW5kZW50OiAxMHB4O1xuICAtLXNjcm9sbGJhci13aWR0aDogN3B4O1xuICAtLXNsaWRlci1pbnB1dC1taW4td2lkdGg6IDUwcHg7XG4gIC0tY29sb3ItaW5wdXQtbWluLXdpZHRoOiA2NXB4O1xufVxuLmxpbC1ndWkuYXV0b1BsYWNlIHtcbiAgbWF4LWhlaWdodDogMTAwJTtcbiAgcG9zaXRpb246IGZpeGVkO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAxNXB4O1xuICB6LWluZGV4OiAxMDAxO1xufVxuXG4ubGlsLWd1aSAuY29udHJvbGxlciB7XG4gIGRpc3BsYXk6IGZsZXg7XG4gIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gIHBhZGRpbmc6IDAgdmFyKC0tcGFkZGluZyk7XG4gIG1hcmdpbjogdmFyKC0tc3BhY2luZykgMDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMC41O1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuZGlzYWJsZWQsIC5saWwtZ3VpIC5jb250cm9sbGVyLmRpc2FibGVkICoge1xuICBwb2ludGVyLWV2ZW50czogbm9uZSAhaW1wb3J0YW50O1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgPiAubmFtZSB7XG4gIG1pbi13aWR0aDogdmFyKC0tbmFtZS13aWR0aCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xuICB3aGl0ZS1zcGFjZTogcHJlO1xuICBwYWRkaW5nLXJpZ2h0OiB2YXIoLS1zcGFjaW5nKTtcbiAgbGluZS1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgLndpZGdldCB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgd2lkdGg6IDEwMCU7XG4gIG1pbi1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuc3RyaW5nIGlucHV0IHtcbiAgY29sb3I6IHZhcigtLXN0cmluZy1jb2xvcik7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5ib29sZWFuIHtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgLmRpc3BsYXkge1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciAuZGlzcGxheTpob3ZlcjpiZWZvcmUge1xuICAgIGNvbnRlbnQ6IFwiIFwiO1xuICAgIGRpc3BsYXk6IGJsb2NrO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gICAgYm9yZGVyOiAxcHggc29saWQgI2ZmZjk7XG4gICAgdG9wOiAwO1xuICAgIHJpZ2h0OiAwO1xuICAgIGJvdHRvbTogMDtcbiAgICBsZWZ0OiAwO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciBpbnB1dFt0eXBlPWNvbG9yXSB7XG4gIG9wYWNpdHk6IDA7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmNvbG9yIGlucHV0W3R5cGU9dGV4dF0ge1xuICBtYXJnaW4tbGVmdDogdmFyKC0tc3BhY2luZyk7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseS1tb25vKTtcbiAgbWluLXdpZHRoOiB2YXIoLS1jb2xvci1pbnB1dC1taW4td2lkdGgpO1xuICB3aWR0aDogdmFyKC0tY29sb3ItaW5wdXQtd2lkdGgpO1xuICBmbGV4LXNocmluazogMDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiBzZWxlY3Qge1xuICBvcGFjaXR5OiAwO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHdpZHRoOiAxMDAlO1xuICBtYXgtd2lkdGg6IDEwMCU7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXkge1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgbWF4LXdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICB3b3JkLWJyZWFrOiBicmVhay1hbGw7XG4gIHBhZGRpbmctbGVmdDogMC41NWVtO1xuICBwYWRkaW5nLXJpZ2h0OiAxLjc1ZW07XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXkuZm9jdXMge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5LmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAuZGlzcGxheTphZnRlciB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgY29udGVudDogXCLihpVcIjtcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICB0b3A6IDA7XG4gIHJpZ2h0OiAwO1xuICBib3R0b206IDA7XG4gIHBhZGRpbmctcmlnaHQ6IDAuMzc1ZW07XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLndpZGdldCxcbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiBzZWxlY3Qge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG5AbWVkaWEgKGhvdmVyOiBob3Zlcikge1xuICAubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLndpZGdldDpob3ZlciAuZGlzcGxheSB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgaW5wdXQge1xuICBjb2xvcjogdmFyKC0tbnVtYmVyLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlci5oYXNTbGlkZXIgaW5wdXQge1xuICBtYXJnaW4tbGVmdDogdmFyKC0tc3BhY2luZyk7XG4gIHdpZHRoOiB2YXIoLS1zbGlkZXItaW5wdXQtd2lkdGgpO1xuICBtaW4td2lkdGg6IHZhcigtLXNsaWRlci1pbnB1dC1taW4td2lkdGgpO1xuICBmbGV4LXNocmluazogMDtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyIHtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgcGFkZGluZy1yaWdodDogdmFyKC0tc2xpZGVyLWtub2Itd2lkdGgpO1xuICBvdmVyZmxvdzogaGlkZGVuO1xuICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgdG91Y2gtYWN0aW9uOiBwYW4teTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyLmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuc2xpZGVyLmFjdGl2ZSAuZmlsbCB7XG4gIG9wYWNpdHk6IDAuOTU7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5udW1iZXIgLmZpbGwge1xuICBoZWlnaHQ6IDEwMCU7XG4gIGJvcmRlci1yaWdodDogdmFyKC0tc2xpZGVyLWtub2Itd2lkdGgpIHNvbGlkIHZhcigtLW51bWJlci1jb2xvcik7XG4gIGJveC1zaXppbmc6IGNvbnRlbnQtYm94O1xufVxuXG4ubGlsLWd1aS1kcmFnZ2luZyAubGlsLWd1aSB7XG4gIC0taG92ZXItY29sb3I6IHZhcigtLXdpZGdldC1jb2xvcik7XG59XG4ubGlsLWd1aS1kcmFnZ2luZyAqIHtcbiAgY3Vyc29yOiBldy1yZXNpemUgIWltcG9ydGFudDtcbn1cblxuLmxpbC1ndWktZHJhZ2dpbmcubGlsLWd1aS12ZXJ0aWNhbCAqIHtcbiAgY3Vyc29yOiBucy1yZXNpemUgIWltcG9ydGFudDtcbn1cblxuLmxpbC1ndWkgLnRpdGxlIHtcbiAgaGVpZ2h0OiB2YXIoLS10aXRsZS1oZWlnaHQpO1xuICBmb250LXdlaWdodDogNjAwO1xuICBwYWRkaW5nOiAwIHZhcigtLXBhZGRpbmcpO1xuICB3aWR0aDogMTAwJTtcbiAgdGV4dC1hbGlnbjogbGVmdDtcbiAgYmFja2dyb3VuZDogbm9uZTtcbiAgdGV4dC1kZWNvcmF0aW9uLXNraXA6IG9iamVjdHM7XG59XG4ubGlsLWd1aSAudGl0bGU6YmVmb3JlIHtcbiAgZm9udC1mYW1pbHk6IFwibGlsLWd1aVwiO1xuICBjb250ZW50OiBcIuKWvlwiO1xuICBwYWRkaW5nLXJpZ2h0OiAycHg7XG4gIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbn1cbi5saWwtZ3VpIC50aXRsZTphY3RpdmUge1xuICBiYWNrZ3JvdW5kOiB2YXIoLS10aXRsZS1iYWNrZ3JvdW5kLWNvbG9yKTtcbiAgb3BhY2l0eTogMC43NTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIGJvZHk6bm90KC5saWwtZ3VpLWRyYWdnaW5nKSAubGlsLWd1aSAudGl0bGU6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLXRpdGxlLWJhY2tncm91bmQtY29sb3IpO1xuICAgIG9wYWNpdHk6IDAuODU7XG4gIH1cbiAgLmxpbC1ndWkgLnRpdGxlOmZvY3VzIHtcbiAgICB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZSB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpLnJvb3QgPiAudGl0bGU6Zm9jdXMge1xuICB0ZXh0LWRlY29yYXRpb246IG5vbmUgIWltcG9ydGFudDtcbn1cbi5saWwtZ3VpLmNsb3NlZCA+IC50aXRsZTpiZWZvcmUge1xuICBjb250ZW50OiBcIuKWuFwiO1xufVxuLmxpbC1ndWkuY2xvc2VkID4gLmNoaWxkcmVuIHtcbiAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC03cHgpO1xuICBvcGFjaXR5OiAwO1xufVxuLmxpbC1ndWkuY2xvc2VkOm5vdCgudHJhbnNpdGlvbikgPiAuY2hpbGRyZW4ge1xuICBkaXNwbGF5OiBub25lO1xufVxuLmxpbC1ndWkudHJhbnNpdGlvbiA+IC5jaGlsZHJlbiB7XG4gIHRyYW5zaXRpb24tZHVyYXRpb246IDMwMG1zO1xuICB0cmFuc2l0aW9uLXByb3BlcnR5OiBoZWlnaHQsIG9wYWNpdHksIHRyYW5zZm9ybTtcbiAgdHJhbnNpdGlvbi10aW1pbmctZnVuY3Rpb246IGN1YmljLWJlemllcigwLjIsIDAuNiwgMC4zNSwgMSk7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHBvaW50ZXItZXZlbnRzOiBub25lO1xufVxuLmxpbC1ndWkgLmNoaWxkcmVuOmVtcHR5OmJlZm9yZSB7XG4gIGNvbnRlbnQ6IFwiRW1wdHlcIjtcbiAgcGFkZGluZzogMCB2YXIoLS1wYWRkaW5nKTtcbiAgbWFyZ2luOiB2YXIoLS1zcGFjaW5nKSAwO1xuICBkaXNwbGF5OiBibG9jaztcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgZm9udC1zdHlsZTogaXRhbGljO1xuICBsaW5lLWhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG4gIG9wYWNpdHk6IDAuNTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW4gPiAubGlsLWd1aSA+IC50aXRsZSB7XG4gIGJvcmRlcjogMCBzb2xpZCB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBib3JkZXItd2lkdGg6IDFweCAwO1xuICB0cmFuc2l0aW9uOiBib3JkZXItY29sb3IgMzAwbXM7XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuID4gLmxpbC1ndWkuY2xvc2VkID4gLnRpdGxlIHtcbiAgYm9yZGVyLWJvdHRvbS1jb2xvcjogdHJhbnNwYXJlbnQ7XG59XG4ubGlsLWd1aSArIC5jb250cm9sbGVyIHtcbiAgYm9yZGVyLXRvcDogMXB4IHNvbGlkIHZhcigtLXdpZGdldC1jb2xvcik7XG4gIG1hcmdpbi10b3A6IDA7XG4gIHBhZGRpbmctdG9wOiB2YXIoLS1zcGFjaW5nKTtcbn1cbi5saWwtZ3VpIC5saWwtZ3VpIC5saWwtZ3VpID4gLnRpdGxlIHtcbiAgYm9yZGVyOiBub25lO1xufVxuLmxpbC1ndWkgLmxpbC1ndWkgLmxpbC1ndWkgPiAuY2hpbGRyZW4ge1xuICBib3JkZXI6IG5vbmU7XG4gIG1hcmdpbi1sZWZ0OiB2YXIoLS1mb2xkZXItaW5kZW50KTtcbiAgYm9yZGVyLWxlZnQ6IDJweCBzb2xpZCB2YXIoLS13aWRnZXQtY29sb3IpO1xufVxuLmxpbC1ndWkgLmxpbC1ndWkgLmNvbnRyb2xsZXIge1xuICBib3JkZXI6IG5vbmU7XG59XG5cbi5saWwtZ3VpIGxhYmVsLCAubGlsLWd1aSBpbnB1dCwgLmxpbC1ndWkgYnV0dG9uIHtcbiAgLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5saWwtZ3VpIGlucHV0IHtcbiAgYm9yZGVyOiAwO1xuICBvdXRsaW5lOiBub25lO1xuICBmb250LWZhbWlseTogdmFyKC0tZm9udC1mYW1pbHkpO1xuICBmb250LXNpemU6IHZhcigtLWlucHV0LWZvbnQtc2l6ZSk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgYmFja2dyb3VuZDogdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xuICB3aWR0aDogMTAwJTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIGlucHV0OmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1jb2xvcik7XG4gIH1cbiAgLmxpbC1ndWkgaW5wdXQ6YWN0aXZlIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIGlucHV0OmRpc2FibGVkIHtcbiAgb3BhY2l0eTogMTtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9dGV4dF0sXG4ubGlsLWd1aSBpbnB1dFt0eXBlPW51bWJlcl0ge1xuICBwYWRkaW5nOiB2YXIoLS13aWRnZXQtcGFkZGluZyk7XG4gIC1tb3otYXBwZWFyYW5jZTogdGV4dGZpZWxkO1xufVxuLmxpbC1ndWkgaW5wdXRbdHlwZT10ZXh0XTpmb2N1cyxcbi5saWwtZ3VpIGlucHV0W3R5cGU9bnVtYmVyXTpmb2N1cyB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cbi5saWwtZ3VpIGlucHV0W3R5cGU9Y2hlY2tib3hdIHtcbiAgYXBwZWFyYW5jZTogbm9uZTtcbiAgd2lkdGg6IHZhcigtLWNoZWNrYm94LXNpemUpO1xuICBoZWlnaHQ6IHZhcigtLWNoZWNrYm94LXNpemUpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIHRleHQtYWxpZ246IGNlbnRlcjtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmxpbC1ndWkgaW5wdXRbdHlwZT1jaGVja2JveF06Y2hlY2tlZDpiZWZvcmUge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIGNvbnRlbnQ6IFwi4pyTXCI7XG4gIGZvbnQtc2l6ZTogdmFyKC0tY2hlY2tib3gtc2l6ZSk7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS1jaGVja2JveC1zaXplKTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIGlucHV0W3R5cGU9Y2hlY2tib3hdOmZvY3VzIHtcbiAgICBib3gtc2hhZG93OiBpbnNldCAwIDAgMCAxcHggdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSBidXR0b24ge1xuICBvdXRsaW5lOiBub25lO1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseSk7XG4gIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplKTtcbiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xuICB3aWR0aDogMTAwJTtcbiAgYm9yZGVyOiBub25lO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgYnV0dG9uIHtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgdGV4dC10cmFuc2Zvcm06IG5vbmU7XG4gIGJhY2tncm91bmQ6IHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbjpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0taG92ZXItY29sb3IpO1xuICB9XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyIGJ1dHRvbjpmb2N1cyB7XG4gICAgYm94LXNoYWRvdzogaW5zZXQgMCAwIDAgMXB4IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIgYnV0dG9uOmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbn1cblxuQGZvbnQtZmFjZSB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgc3JjOiB1cmwoXCJkYXRhOmFwcGxpY2F0aW9uL2ZvbnQtd29mZjtjaGFyc2V0PXV0Zi04O2Jhc2U2NCxkMDlHUmdBQkFBQUFBQVVzQUFzQUFBQUFDSndBQVFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQkhVMVZDQUFBQkNBQUFBSDRBQUFEQUltd21ZRTlUTHpJQUFBR0lBQUFBUHdBQUFHQktxSDVTWTIxaGNBQUFBY2dBQUFEMEFBQUNydWt5eUpCbmJIbG1BQUFDdkFBQUFGOEFBQUNFSVpwV0gyaGxZV1FBQUFNY0FBQUFKd0FBQURaZmNqMnphR2hsWVFBQUEwUUFBQUFZQUFBQUpBQzVBSGhvYlhSNEFBQURYQUFBQUJBQUFBQk1BWkFBQUd4dlkyRUFBQU5zQUFBQUZBQUFBQ2dDRWdJeWJXRjRjQUFBQTRBQUFBQWVBQUFBSUFFZkFCSnVZVzFsQUFBRG9BQUFBU0lBQUFJSzlTVVUvWEJ2YzNRQUFBVEVBQUFBWmdBQUFKQ1RjTWMyZUp4VmpiRU9nakFVUlUraEZSQksxZEdSTCtBTG5BaVRveU1MRXpGcG5Qei9lQXNod1NhOTc1MTdjL013d0ptZUI5a3dQbCswY2Y1K3VHUFpYc3FQdTRudlphYmNTWmxkWjZrZnlXbm9tRlkvZVNjS3FaTld1cEtKTzZrWE4zSzl1Q1ZvTDdpSW5QcjFYNWJhWHMzdGp1TXFDdHpFdWFnbS9BQWx6UWdQQUFCNG5HTmdZUkJsbk1EQXlzREFZTS9nQmlUNW9MUUJBd3VESkFNREV3TXJNd05XRUpEbW1zSndnQ0ZlWFpnaEJjamxaTWdGQ3pPaUtPSUZBQjcxQmI4QWVKeTFrakZ1d2tBUVJaK0R3UkF3QnROUVJVR0tROE9kS0NBV1VoQWdLTGhJdUFzVlNwV3o1QmJrajNkRWdZaVVJc3pxV2RwWmUrWjcvd0Ixb0NZbUlvYm9pd2lMVDJXaktsL2pzY3JIZkdnL3BLZE1reWtsQzVaczJMRWZIWXBqY1JvUHptZTlNV1dtazNkV2JLOU9ia1draWtPZXRKNTU0Zld5b0VzbWRTbHQrdVIwcENKUjM0YjZ0L1RWZzFTWTNzWXZkZjh2dWlLcnB5YURYRElTaWVncDE3cDc1NzlHcDNwKyt5N0hQQWlZOXBtVGlibGpycjg1cVNpZHRsZzQrbDI1R0xDYVM4ZTZyUnhOQm1zbkVSdW5LYmFPT2JSejdONzJqdTV2ZEFqWXBCWEhnSnlsT0FWc01zZURBUEVQOExZb1VIaWNZMkJpQUFFZmhpQUdKZ1pXQmdaN1JuRlJkblZKRUxDUWxCU1JsQVRKTW9MVjJESzRnbFNZczZ1YnE1dmJLckpMU2JHcmdFbW92RHVESlZoZTNWemNYRndOTENPSUxCL0M0SXVRMXhUbjVGUGlsQlRqNUZQbUJBQjRXd29xQUhpY1kyQmtZR0FBNHNrMXNSL2orVzIrTW5BenBEQmdBeUVNUVVDU2c0RUp4QUVBd1VnRkhnQjRuR05nWkdCZ1NHRmdnSk1oREl3TXFFQVlBQnlIQVRKNG5HTmdBSUlVTkV3bUFBQmwzQUdSZUp4allBQUNJUVlsQmlNR0ozd1FBRWNRQkVWNG5HTmdaR0JnRUdaZ1kyQmlBQUVReVFXRURBei93WHdHQUFzUEFUSUFBSGljWGRCTlNzTkFIQVh3bDM1aUEwVVFYWW5NU2hmUzlHUFpBN1Q3TGdJdTAzU1Nwa3d6WVRJdDFCTjRBay9nS1R5QWVDeGZ3MzlqWmtqeW16Y3ZBd21BVy93Z3dIVUVHRGIzNitqUVEzR1hHb3Q3OUwyNGp4Q1A0Z0h6Ri9FSXI0akVJZTd3eGhPQzNnMlRNWXk0UTcrTHUvU0h1RWQvaXZ0NHdKZDR3UHhiUEVLTVgzR0k1K0RKRkdhU240cU56azhtY2JLU1I2eGRYZGhTemFPWkpHdGRhcGQ0dlZQYmk2clArY0w3VEdYT0h0WEtsbDRiWTFYbDdFR25QdHA3WHkybjAwenlLTFZIZmtIQmE0SWNKMm9EM2NnZ2dXdnQvVi9GYkRyVWxFVUpoVG4vMGF6VldiTlROcjBFbnM4ZGUxdGNlSzl4Wm1mQjFDUGpPbVBINGtpdG12T3ViY05wbVZUTjNvRkp5anpDdm5tcndoSlR6cXpWajlqaVNYOTExRmplQUFCNG5HM0hNUktDTUJCQTBmMGdpaUtpNERVOGswVjJHV2JJWkRPaDRQb1dXdnE2SjVWOElmOU5WTlFjYURoeW91WE1oWTRyUFRjRzdqd1ltWGhLcThXeitwNzYyYU5hZVlYb20ybjNtMmRMVFZnc3JDZ0ZKN09UbUlrWWJ3SWJDNnZJQjdXbUZmQUFBQT09XCIpIGZvcm1hdChcIndvZmZcIik7XG59YDtcblxuZnVuY3Rpb24gX2luamVjdFN0eWxlcyggY3NzQ29udGVudCApIHtcblx0Y29uc3QgaW5qZWN0ZWQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc3R5bGUnICk7XG5cdGluamVjdGVkLmlubmVySFRNTCA9IGNzc0NvbnRlbnQ7XG5cdGNvbnN0IGJlZm9yZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoICdoZWFkIGxpbmtbcmVsPXN0eWxlc2hlZXRdLCBoZWFkIHN0eWxlJyApO1xuXHRpZiAoIGJlZm9yZSApIHtcblx0XHRkb2N1bWVudC5oZWFkLmluc2VydEJlZm9yZSggaW5qZWN0ZWQsIGJlZm9yZSApO1xuXHR9IGVsc2Uge1xuXHRcdGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoIGluamVjdGVkICk7XG5cdH1cbn1cblxuXG5sZXQgc3R5bGVzSW5qZWN0ZWQgPSBmYWxzZTtcblxuY2xhc3MgR1VJIHtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIHBhbmVsIHRoYXQgaG9sZHMgY29udHJvbGxlcnMuXG5cdCAqIEBleGFtcGxlXG5cdCAqIG5ldyBHVUkoKTtcblx0ICogbmV3IEdVSSggeyBjb250YWluZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCAnY3VzdG9tJyApIH0gKTtcblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmF1dG9QbGFjZT10cnVlXVxuXHQgKiBBZGRzIHRoZSBHVUkgdG8gYGRvY3VtZW50LmJvZHlgIGFuZCBmaXhlcyBpdCB0byB0aGUgdG9wIHJpZ2h0IG9mIHRoZSBwYWdlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBbb3B0aW9ucy5jb250YWluZXJdXG5cdCAqIEFkZHMgdGhlIEdVSSB0byB0aGlzIERPTSBlbGVtZW50LiBPdmVycmlkZXMgYGF1dG9QbGFjZWAuXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy53aWR0aD0yNDVdXG5cdCAqIFdpZHRoIG9mIHRoZSBHVUkgaW4gcGl4ZWxzLCB1c3VhbGx5IHNldCB3aGVuIG5hbWUgbGFiZWxzIGJlY29tZSB0b28gbG9uZy4gTm90ZSB0aGF0IHlvdSBjYW4gbWFrZVxuXHQgKiBuYW1lIGxhYmVscyB3aWRlciBpbiBDU1Mgd2l0aCBgLmxpbOKAkWd1aSB7IOKAkeKAkW5hbWXigJF3aWR0aDogNTUlIH1gLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW29wdGlvbnMudGl0bGU9Q29udHJvbHNdXG5cdCAqIE5hbWUgdG8gZGlzcGxheSBpbiB0aGUgdGl0bGUgYmFyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmNsb3NlRm9sZGVycz1mYWxzZV1cblx0ICogUGFzcyBgdHJ1ZWAgdG8gY2xvc2UgYWxsIGZvbGRlcnMgaW4gdGhpcyBHVUkgYnkgZGVmYXVsdC5cblx0ICpcblx0ICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5pbmplY3RTdHlsZXM9dHJ1ZV1cblx0ICogSW5qZWN0cyB0aGUgZGVmYXVsdCBzdHlsZXNoZWV0IGludG8gdGhlIHBhZ2UgaWYgdGhpcyBpcyB0aGUgZmlyc3QgR1VJLlxuXHQgKiBQYXNzIGBmYWxzZWAgdG8gdXNlIHlvdXIgb3duIHN0eWxlc2hlZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbb3B0aW9ucy50b3VjaFN0eWxlcz10cnVlXVxuXHQgKiBNYWtlcyBjb250cm9sbGVycyBsYXJnZXIgb24gdG91Y2ggZGV2aWNlcy4gUGFzcyBgZmFsc2VgIHRvIGRpc2FibGUgdG91Y2ggc3R5bGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge0dVSX0gW29wdGlvbnMucGFyZW50XVxuXHQgKiBBZGRzIHRoaXMgR1VJIGFzIGEgY2hpbGQgaW4gYW5vdGhlciBHVUkuIFVzdWFsbHkgdGhpcyBpcyBkb25lIGZvciB5b3UgYnkgYGFkZEZvbGRlcigpYC5cblx0ICovXG5cdGNvbnN0cnVjdG9yKCB7XG5cdFx0cGFyZW50LFxuXHRcdGF1dG9QbGFjZSA9IHBhcmVudCA9PT0gdW5kZWZpbmVkLFxuXHRcdGNvbnRhaW5lcixcblx0XHR3aWR0aCxcblx0XHR0aXRsZSA9ICdDb250cm9scycsXG5cdFx0Y2xvc2VGb2xkZXJzID0gZmFsc2UsXG5cdFx0aW5qZWN0U3R5bGVzID0gdHJ1ZSxcblx0XHR0b3VjaFN0eWxlcyA9IHRydWVcblx0fSA9IHt9ICkge1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIEdVSSBjb250YWluaW5nIHRoaXMgZm9sZGVyLCBvciBgdW5kZWZpbmVkYCBpZiB0aGlzIGlzIHRoZSByb290IEdVSS5cblx0XHQgKiBAdHlwZSB7R1VJfVxuXHRcdCAqL1xuXHRcdHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIHRvcCBsZXZlbCBHVUkgY29udGFpbmluZyB0aGlzIGZvbGRlciwgb3IgYHRoaXNgIGlmIHRoaXMgaXMgdGhlIHJvb3QgR1VJLlxuXHRcdCAqIEB0eXBlIHtHVUl9XG5cdFx0ICovXG5cdFx0dGhpcy5yb290ID0gcGFyZW50ID8gcGFyZW50LnJvb3QgOiB0aGlzO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxpc3Qgb2YgY29udHJvbGxlcnMgYW5kIGZvbGRlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJLlxuXHRcdCAqIEB0eXBlIHtBcnJheTxHVUl8Q29udHJvbGxlcj59XG5cdFx0ICovXG5cdFx0dGhpcy5jaGlsZHJlbiA9IFtdO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIGxpc3Qgb2YgY29udHJvbGxlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJLlxuXHRcdCAqIEB0eXBlIHtBcnJheTxDb250cm9sbGVyPn1cblx0XHQgKi9cblx0XHR0aGlzLmNvbnRyb2xsZXJzID0gW107XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbGlzdCBvZiBmb2xkZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSS5cblx0XHQgKiBAdHlwZSB7QXJyYXk8R1VJPn1cblx0XHQgKi9cblx0XHR0aGlzLmZvbGRlcnMgPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBHVUkgaXMgY2xvc2VkLiBVc2UgYGd1aS5vcGVuKClgIG9yIGBndWkuY2xvc2UoKWAgdG8gY2hhbmdlIHRoaXMuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5fY2xvc2VkID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgR1VJIGlzIGhpZGRlbi4gVXNlIGBndWkuc2hvdygpYCBvciBgZ3VpLmhpZGUoKWAgdG8gY2hhbmdlIHRoaXMuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5faGlkZGVuID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgb3V0ZXJtb3N0IGNvbnRhaW5lciBlbGVtZW50LlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLmRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnbGlsLWd1aScgKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIHRoZSB0aXRsZS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnV0dG9uJyApO1xuXHRcdHRoaXMuJHRpdGxlLmNsYXNzTGlzdC5hZGQoICd0aXRsZScgKTtcblx0XHR0aGlzLiR0aXRsZS5zZXRBdHRyaWJ1dGUoICdhcmlhLWV4cGFuZGVkJywgdHJ1ZSApO1xuXG5cdFx0dGhpcy4kdGl0bGUuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgKCkgPT4gdGhpcy5vcGVuQW5pbWF0ZWQoIHRoaXMuX2Nsb3NlZCApICk7XG5cblx0XHQvLyBlbmFibGVzIDphY3RpdmUgcHNldWRvIGNsYXNzIG9uIG1vYmlsZVxuXHRcdHRoaXMuJHRpdGxlLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgKCkgPT4ge30sIHsgcGFzc2l2ZTogdHJ1ZSB9ICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyBjaGlsZHJlbi5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kY2hpbGRyZW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGNoaWxkcmVuLmNsYXNzTGlzdC5hZGQoICdjaGlsZHJlbicgKTtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kdGl0bGUgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuJGNoaWxkcmVuICk7XG5cblx0XHR0aGlzLnRpdGxlKCB0aXRsZSApO1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblxuXHRcdFx0dGhpcy5wYXJlbnQuY2hpbGRyZW4ucHVzaCggdGhpcyApO1xuXHRcdFx0dGhpcy5wYXJlbnQuZm9sZGVycy5wdXNoKCB0aGlzICk7XG5cblx0XHRcdHRoaXMucGFyZW50LiRjaGlsZHJlbi5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHRcdC8vIFN0b3AgdGhlIGNvbnN0cnVjdG9yIGVhcmx5LCBldmVyeXRoaW5nIG9ud2FyZCBvbmx5IGFwcGxpZXMgdG8gcm9vdCBHVUknc1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdyb290JyApO1xuXG5cdFx0aWYgKCB0b3VjaFN0eWxlcyApIHtcblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnYWxsb3ctdG91Y2gtc3R5bGVzJyApO1xuXHRcdH1cblxuXHRcdC8vIEluamVjdCBzdHlsZXNoZWV0IGlmIHdlIGhhdmVuJ3QgZG9uZSB0aGF0IHlldFxuXHRcdGlmICggIXN0eWxlc0luamVjdGVkICYmIGluamVjdFN0eWxlcyApIHtcblx0XHRcdF9pbmplY3RTdHlsZXMoIHN0eWxlc2hlZXQgKTtcblx0XHRcdHN0eWxlc0luamVjdGVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHRpZiAoIGNvbnRhaW5lciApIHtcblxuXHRcdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdH0gZWxzZSBpZiAoIGF1dG9QbGFjZSApIHtcblxuXHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdhdXRvUGxhY2UnICk7XG5cdFx0XHRkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdH1cblxuXHRcdGlmICggd2lkdGggKSB7XG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoICctLXdpZHRoJywgd2lkdGggKyAncHgnICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY2xvc2VGb2xkZXJzID0gY2xvc2VGb2xkZXJzO1xuXG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGNvbnRyb2xsZXIgdG8gdGhlIEdVSSwgaW5mZXJyaW5nIGNvbnRyb2xsZXIgdHlwZSB1c2luZyB0aGUgYHR5cGVvZmAgb3BlcmF0b3IuXG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApO1xuXHQgKiBndWkuYWRkKCBvYmplY3QsICdudW1iZXInLCAwLCAxMDAsIDEgKTtcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAnb3B0aW9ucycsIFsgMSwgMiwgMyBdICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0aGUgY29udHJvbGxlciB3aWxsIG1vZGlmeS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbnRyb2wuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfG9iamVjdHxBcnJheX0gWyQxXSBNaW5pbXVtIHZhbHVlIGZvciBudW1iZXIgY29udHJvbGxlcnMsIG9yIHRoZSBzZXQgb2Zcblx0ICogc2VsZWN0YWJsZSB2YWx1ZXMgZm9yIGEgZHJvcGRvd24uXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbbWF4XSBNYXhpbXVtIHZhbHVlIGZvciBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBbc3RlcF0gU3RlcCB2YWx1ZSBmb3IgbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcn1cblx0ICovXG5cdGFkZCggb2JqZWN0LCBwcm9wZXJ0eSwgJDEsIG1heCwgc3RlcCApIHtcblxuXHRcdGlmICggT2JqZWN0KCAkMSApID09PSAkMSApIHtcblxuXHRcdFx0cmV0dXJuIG5ldyBPcHRpb25Db250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCAkMSApO1xuXG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5pdGlhbFZhbHVlID0gb2JqZWN0WyBwcm9wZXJ0eSBdO1xuXG5cdFx0c3dpdGNoICggdHlwZW9mIGluaXRpYWxWYWx1ZSApIHtcblxuXHRcdFx0Y2FzZSAnbnVtYmVyJzpcblxuXHRcdFx0XHRyZXR1cm4gbmV3IE51bWJlckNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksICQxLCBtYXgsIHN0ZXAgKTtcblxuXHRcdFx0Y2FzZSAnYm9vbGVhbic6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBCb29sZWFuQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG5cdFx0XHRjYXNlICdzdHJpbmcnOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgU3RyaW5nQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG5cdFx0XHRjYXNlICdmdW5jdGlvbic6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBGdW5jdGlvbkNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHkgKTtcblxuXHRcdH1cblxuXHRcdGNvbnNvbGUuZXJyb3IoIGBndWkuYWRkIGZhaWxlZFxuXHRwcm9wZXJ0eTpgLCBwcm9wZXJ0eSwgYFxuXHRvYmplY3Q6YCwgb2JqZWN0LCBgXG5cdHZhbHVlOmAsIGluaXRpYWxWYWx1ZSApO1xuXG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGNvbG9yIGNvbnRyb2xsZXIgdG8gdGhlIEdVSS5cblx0ICogQGV4YW1wbGVcblx0ICogcGFyYW1zID0ge1xuXHQgKiBcdGNzc0NvbG9yOiAnI2ZmMDBmZicsXG5cdCAqIFx0cmdiQ29sb3I6IHsgcjogMCwgZzogMC4yLCBiOiAwLjQgfSxcblx0ICogXHRjdXN0b21SYW5nZTogWyAwLCAxMjcsIDI1NSBdLFxuXHQgKiB9O1xuXHQgKlxuXHQgKiBndWkuYWRkQ29sb3IoIHBhcmFtcywgJ2Nzc0NvbG9yJyApO1xuXHQgKiBndWkuYWRkQ29sb3IoIHBhcmFtcywgJ3JnYkNvbG9yJyApO1xuXHQgKiBndWkuYWRkQ29sb3IoIHBhcmFtcywgJ2N1c3RvbVJhbmdlJywgMjU1ICk7XG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvYmplY3QgVGhlIG9iamVjdCB0aGUgY29udHJvbGxlciB3aWxsIG1vZGlmeS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHByb3BlcnR5IE5hbWUgb2YgdGhlIHByb3BlcnR5IHRvIGNvbnRyb2wuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSByZ2JTY2FsZSBNYXhpbXVtIHZhbHVlIGZvciBhIGNvbG9yIGNoYW5uZWwgd2hlbiB1c2luZyBhbiBSR0IgY29sb3IuIFlvdSBtYXlcblx0ICogbmVlZCB0byBzZXQgdGhpcyB0byAyNTUgaWYgeW91ciBjb2xvcnMgYXJlIHRvbyBicmlnaHQuXG5cdCAqIEByZXR1cm5zIHtDb250cm9sbGVyfVxuXHQgKi9cblx0YWRkQ29sb3IoIG9iamVjdCwgcHJvcGVydHksIHJnYlNjYWxlID0gMSApIHtcblx0XHRyZXR1cm4gbmV3IENvbG9yQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgcmdiU2NhbGUgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgZm9sZGVyIHRvIHRoZSBHVUksIHdoaWNoIGlzIGp1c3QgYW5vdGhlciBHVUkuIFRoaXMgbWV0aG9kIHJldHVybnNcblx0ICogdGhlIG5lc3RlZCBHVUkgc28geW91IGNhbiBhZGQgY29udHJvbGxlcnMgdG8gaXQuXG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnN0IGZvbGRlciA9IGd1aS5hZGRGb2xkZXIoICdQb3NpdGlvbicgKTtcblx0ICogZm9sZGVyLmFkZCggcG9zaXRpb24sICd4JyApO1xuXHQgKiBmb2xkZXIuYWRkKCBwb3NpdGlvbiwgJ3knICk7XG5cdCAqIGZvbGRlci5hZGQoIHBvc2l0aW9uLCAneicgKTtcblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlIE5hbWUgdG8gZGlzcGxheSBpbiB0aGUgZm9sZGVyJ3MgdGl0bGUgYmFyLlxuXHQgKiBAcmV0dXJucyB7R1VJfVxuXHQgKi9cblx0YWRkRm9sZGVyKCB0aXRsZSApIHtcblx0XHRjb25zdCBmb2xkZXIgPSBuZXcgR1VJKCB7IHBhcmVudDogdGhpcywgdGl0bGUgfSApO1xuXHRcdGlmICggdGhpcy5yb290Ll9jbG9zZUZvbGRlcnMgKSBmb2xkZXIuY2xvc2UoKTtcblx0XHRyZXR1cm4gZm9sZGVyO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlY2FsbHMgdmFsdWVzIHRoYXQgd2VyZSBzYXZlZCB3aXRoIGBndWkuc2F2ZSgpYC5cblx0ICogQHBhcmFtIHtvYmplY3R9IG9ialxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJlY3Vyc2l2ZSBQYXNzIGZhbHNlIHRvIGV4Y2x1ZGUgZm9sZGVycyBkZXNjZW5kaW5nIGZyb20gdGhpcyBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bG9hZCggb2JqLCByZWN1cnNpdmUgPSB0cnVlICkge1xuXG5cdFx0aWYgKCBvYmouY29udHJvbGxlcnMgKSB7XG5cblx0XHRcdHRoaXMuY29udHJvbGxlcnMuZm9yRWFjaCggYyA9PiB7XG5cblx0XHRcdFx0aWYgKCBjIGluc3RhbmNlb2YgRnVuY3Rpb25Db250cm9sbGVyICkgcmV0dXJuO1xuXG5cdFx0XHRcdGlmICggYy5fbmFtZSBpbiBvYmouY29udHJvbGxlcnMgKSB7XG5cdFx0XHRcdFx0Yy5sb2FkKCBvYmouY29udHJvbGxlcnNbIGMuX25hbWUgXSApO1xuXHRcdFx0XHR9XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdGlmICggcmVjdXJzaXZlICYmIG9iai5mb2xkZXJzICkge1xuXG5cdFx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cblx0XHRcdFx0aWYgKCBmLl90aXRsZSBpbiBvYmouZm9sZGVycyApIHtcblx0XHRcdFx0XHRmLmxvYWQoIG9iai5mb2xkZXJzWyBmLl90aXRsZSBdICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIG9iamVjdCBtYXBwaW5nIGNvbnRyb2xsZXIgbmFtZXMgdG8gdmFsdWVzLiBUaGUgb2JqZWN0IGNhbiBiZSBwYXNzZWQgdG8gYGd1aS5sb2FkKClgIHRvXG5cdCAqIHJlY2FsbCB0aGVzZSB2YWx1ZXMuXG5cdCAqIEBleGFtcGxlXG5cdCAqIHtcblx0ICogXHRjb250cm9sbGVyczoge1xuXHQgKiBcdFx0cHJvcDE6IDEsXG5cdCAqIFx0XHRwcm9wMjogJ3ZhbHVlJyxcblx0ICogXHRcdC4uLlxuXHQgKiBcdH0sXG5cdCAqIFx0Zm9sZGVyczoge1xuXHQgKiBcdFx0Zm9sZGVyTmFtZTE6IHsgY29udHJvbGxlcnMsIGZvbGRlcnMgfSxcblx0ICogXHRcdGZvbGRlck5hbWUyOiB7IGNvbnRyb2xsZXJzLCBmb2xkZXJzIH1cblx0ICogXHRcdC4uLlxuXHQgKiBcdH1cblx0ICogfVxuXHQgKlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJlY3Vyc2l2ZSBQYXNzIGZhbHNlIHRvIGV4Y2x1ZGUgZm9sZGVycyBkZXNjZW5kaW5nIGZyb20gdGhpcyBHVUkuXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9XG5cdCAqL1xuXHRzYXZlKCByZWN1cnNpdmUgPSB0cnVlICkge1xuXG5cdFx0Y29uc3Qgb2JqID0ge1xuXHRcdFx0Y29udHJvbGxlcnM6IHt9LFxuXHRcdFx0Zm9sZGVyczoge31cblx0XHR9O1xuXG5cdFx0dGhpcy5jb250cm9sbGVycy5mb3JFYWNoKCBjID0+IHtcblxuXHRcdFx0aWYgKCBjIGluc3RhbmNlb2YgRnVuY3Rpb25Db250cm9sbGVyICkgcmV0dXJuO1xuXG5cdFx0XHRpZiAoIGMuX25hbWUgaW4gb2JqLmNvbnRyb2xsZXJzICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBDYW5ub3Qgc2F2ZSBHVUkgd2l0aCBkdXBsaWNhdGUgcHJvcGVydHkgXCIke2MuX25hbWV9XCJgICk7XG5cdFx0XHR9XG5cblx0XHRcdG9iai5jb250cm9sbGVyc1sgYy5fbmFtZSBdID0gYy5zYXZlKCk7XG5cblx0XHR9ICk7XG5cblx0XHRpZiAoIHJlY3Vyc2l2ZSApIHtcblxuXHRcdFx0dGhpcy5mb2xkZXJzLmZvckVhY2goIGYgPT4ge1xuXG5cdFx0XHRcdGlmICggZi5fdGl0bGUgaW4gb2JqLmZvbGRlcnMgKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKCBgQ2Fubm90IHNhdmUgR1VJIHdpdGggZHVwbGljYXRlIGZvbGRlciBcIiR7Zi5fdGl0bGV9XCJgICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRvYmouZm9sZGVyc1sgZi5fdGl0bGUgXSA9IGYuc2F2ZSgpO1xuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gb2JqO1xuXG5cdH1cblxuXHQvKipcblx0ICogT3BlbnMgYSBHVUkgb3IgZm9sZGVyLiBHVUkgYW5kIGZvbGRlcnMgYXJlIG9wZW4gYnkgZGVmYXVsdC5cblx0ICogQHBhcmFtIHtib29sZWFufSBvcGVuIFBhc3MgZmFsc2UgdG8gY2xvc2UuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub3BlbigpOyAvLyBvcGVuXG5cdCAqIGd1aS5vcGVuKCBmYWxzZSApOyAvLyBjbG9zZVxuXHQgKiBndWkub3BlbiggZ3VpLl9jbG9zZWQgKTsgLy8gdG9nZ2xlXG5cdCAqL1xuXHRvcGVuKCBvcGVuID0gdHJ1ZSApIHtcblxuXHRcdHRoaXMuX3NldENsb3NlZCggIW9wZW4gKTtcblxuXHRcdHRoaXMuJHRpdGxlLnNldEF0dHJpYnV0ZSggJ2FyaWEtZXhwYW5kZWQnLCAhdGhpcy5fY2xvc2VkICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoICdjbG9zZWQnLCB0aGlzLl9jbG9zZWQgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2xvc2VzIHRoZSBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0Y2xvc2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMub3BlbiggZmFsc2UgKTtcblx0fVxuXG5cdF9zZXRDbG9zZWQoIGNsb3NlZCApIHtcblx0XHRpZiAoIHRoaXMuX2Nsb3NlZCA9PT0gY2xvc2VkICkgcmV0dXJuO1xuXHRcdHRoaXMuX2Nsb3NlZCA9IGNsb3NlZDtcblx0XHR0aGlzLl9jYWxsT25PcGVuQ2xvc2UoIHRoaXMgKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93cyB0aGUgR1VJIGFmdGVyIGl0J3MgYmVlbiBoaWRkZW4uXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gc2hvd1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLnNob3coKTtcblx0ICogZ3VpLnNob3coIGZhbHNlICk7IC8vIGhpZGVcblx0ICogZ3VpLnNob3coIGd1aS5faGlkZGVuICk7IC8vIHRvZ2dsZVxuXHQgKi9cblx0c2hvdyggc2hvdyA9IHRydWUgKSB7XG5cblx0XHR0aGlzLl9oaWRkZW4gPSAhc2hvdztcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5zdHlsZS5kaXNwbGF5ID0gdGhpcy5faGlkZGVuID8gJ25vbmUnIDogJyc7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBHVUkuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0aGlkZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zaG93KCBmYWxzZSApO1xuXHR9XG5cblx0b3BlbkFuaW1hdGVkKCBvcGVuID0gdHJ1ZSApIHtcblxuXHRcdC8vIHNldCBzdGF0ZSBpbW1lZGlhdGVseVxuXHRcdHRoaXMuX3NldENsb3NlZCggIW9wZW4gKTtcblxuXHRcdHRoaXMuJHRpdGxlLnNldEF0dHJpYnV0ZSggJ2FyaWEtZXhwYW5kZWQnLCAhdGhpcy5fY2xvc2VkICk7XG5cblx0XHQvLyB3YWl0IGZvciBuZXh0IGZyYW1lIHRvIG1lYXN1cmUgJGNoaWxkcmVuXG5cdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG5cblx0XHRcdC8vIGV4cGxpY2l0bHkgc2V0IGluaXRpYWwgaGVpZ2h0IGZvciB0cmFuc2l0aW9uXG5cdFx0XHRjb25zdCBpbml0aWFsSGVpZ2h0ID0gdGhpcy4kY2hpbGRyZW4uY2xpZW50SGVpZ2h0O1xuXHRcdFx0dGhpcy4kY2hpbGRyZW4uc3R5bGUuaGVpZ2h0ID0gaW5pdGlhbEhlaWdodCArICdweCc7XG5cblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAndHJhbnNpdGlvbicgKTtcblxuXHRcdFx0Y29uc3Qgb25UcmFuc2l0aW9uRW5kID0gZSA9PiB7XG5cdFx0XHRcdGlmICggZS50YXJnZXQgIT09IHRoaXMuJGNoaWxkcmVuICkgcmV0dXJuO1xuXHRcdFx0XHR0aGlzLiRjaGlsZHJlbi5zdHlsZS5oZWlnaHQgPSAnJztcblx0XHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoICd0cmFuc2l0aW9uJyApO1xuXHRcdFx0XHR0aGlzLiRjaGlsZHJlbi5yZW1vdmVFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCApO1xuXHRcdFx0fTtcblxuXHRcdFx0dGhpcy4kY2hpbGRyZW4uYWRkRXZlbnRMaXN0ZW5lciggJ3RyYW5zaXRpb25lbmQnLCBvblRyYW5zaXRpb25FbmQgKTtcblxuXHRcdFx0Ly8gdG9kbzogdGhpcyBpcyB3cm9uZyBpZiBjaGlsZHJlbidzIHNjcm9sbEhlaWdodCBtYWtlcyBmb3IgYSBndWkgdGFsbGVyIHRoYW4gbWF4SGVpZ2h0XG5cdFx0XHRjb25zdCB0YXJnZXRIZWlnaHQgPSAhb3BlbiA/IDAgOiB0aGlzLiRjaGlsZHJlbi5zY3JvbGxIZWlnaHQ7XG5cblx0XHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCAnY2xvc2VkJywgIW9wZW4gKTtcblxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuJGNoaWxkcmVuLnN0eWxlLmhlaWdodCA9IHRhcmdldEhlaWdodCArICdweCc7XG5cdFx0XHR9ICk7XG5cblx0XHR9ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZSB0aGUgdGl0bGUgb2YgdGhpcyBHVUkuXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHRpdGxlKCB0aXRsZSApIHtcblx0XHQvKipcblx0XHQgKiBDdXJyZW50IHRpdGxlIG9mIHRoZSBHVUkuIFVzZSBgZ3VpLnRpdGxlKCAnVGl0bGUnIClgIHRvIG1vZGlmeSB0aGlzIHZhbHVlLlxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5fdGl0bGUgPSB0aXRsZTtcblx0XHR0aGlzLiR0aXRsZS50ZXh0Q29udGVudCA9IHRpdGxlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlc2V0cyBhbGwgY29udHJvbGxlcnMgdG8gdGhlaXIgaW5pdGlhbCB2YWx1ZXMuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVjdXJzaXZlIFBhc3MgZmFsc2UgdG8gZXhjbHVkZSBmb2xkZXJzIGRlc2NlbmRpbmcgZnJvbSB0aGlzIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRyZXNldCggcmVjdXJzaXZlID0gdHJ1ZSApIHtcblx0XHRjb25zdCBjb250cm9sbGVycyA9IHJlY3Vyc2l2ZSA/IHRoaXMuY29udHJvbGxlcnNSZWN1cnNpdmUoKSA6IHRoaXMuY29udHJvbGxlcnM7XG5cdFx0Y29udHJvbGxlcnMuZm9yRWFjaCggYyA9PiBjLnJlc2V0KCkgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIGEgY29udHJvbGxlciBpbiB0aGlzIEdVSSBjaGFuZ2VzLlxuXHQgKiBAcGFyYW0ge2Z1bmN0aW9uKHtvYmplY3Q6b2JqZWN0LCBwcm9wZXJ0eTpzdHJpbmcsIHZhbHVlOmFueSwgY29udHJvbGxlcjpDb250cm9sbGVyfSl9IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkub25DaGFuZ2UoIGV2ZW50ID0+IHtcblx0ICogXHRldmVudC5vYmplY3QgICAgIC8vIG9iamVjdCB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiBcdGV2ZW50LnByb3BlcnR5ICAgLy8gc3RyaW5nLCBuYW1lIG9mIHByb3BlcnR5XG5cdCAqIFx0ZXZlbnQudmFsdWUgICAgICAvLyBuZXcgdmFsdWUgb2YgY29udHJvbGxlclxuXHQgKiBcdGV2ZW50LmNvbnRyb2xsZXIgLy8gY29udHJvbGxlciB0aGF0IHdhcyBtb2RpZmllZFxuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbkNoYW5nZSggY2FsbGJhY2sgKSB7XG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBhY2Nlc3MgdGhlIGZ1bmN0aW9uIGJvdW5kIHRvIGBvbkNoYW5nZWAgZXZlbnRzLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBndWkub25DaGFuZ2UoIGNhbGxiYWNrIClgIG1ldGhvZCBpbnN0ZWFkLlxuXHRcdCAqIEB0eXBlIHtGdW5jdGlvbn1cblx0XHQgKi9cblx0XHR0aGlzLl9vbkNoYW5nZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X2NhbGxPbkNoYW5nZSggY29udHJvbGxlciApIHtcblxuXHRcdGlmICggdGhpcy5wYXJlbnQgKSB7XG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uQ2hhbmdlKCBjb250cm9sbGVyICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLl9vbkNoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25DaGFuZ2UuY2FsbCggdGhpcywge1xuXHRcdFx0XHRvYmplY3Q6IGNvbnRyb2xsZXIub2JqZWN0LFxuXHRcdFx0XHRwcm9wZXJ0eTogY29udHJvbGxlci5wcm9wZXJ0eSxcblx0XHRcdFx0dmFsdWU6IGNvbnRyb2xsZXIuZ2V0VmFsdWUoKSxcblx0XHRcdFx0Y29udHJvbGxlclxuXHRcdFx0fSApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIHdoZW5ldmVyIGEgY29udHJvbGxlciBpbiB0aGlzIEdVSSBoYXMgZmluaXNoZWQgY2hhbmdpbmcuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24oe29iamVjdDpvYmplY3QsIHByb3BlcnR5OnN0cmluZywgdmFsdWU6YW55LCBjb250cm9sbGVyOkNvbnRyb2xsZXJ9KX0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5vbkZpbmlzaENoYW5nZSggZXZlbnQgPT4ge1xuXHQgKiBcdGV2ZW50Lm9iamVjdCAgICAgLy8gb2JqZWN0IHRoYXQgd2FzIG1vZGlmaWVkXG5cdCAqIFx0ZXZlbnQucHJvcGVydHkgICAvLyBzdHJpbmcsIG5hbWUgb2YgcHJvcGVydHlcblx0ICogXHRldmVudC52YWx1ZSAgICAgIC8vIG5ldyB2YWx1ZSBvZiBjb250cm9sbGVyXG5cdCAqIFx0ZXZlbnQuY29udHJvbGxlciAvLyBjb250cm9sbGVyIHRoYXQgd2FzIG1vZGlmaWVkXG5cdCAqIH0gKTtcblx0ICovXG5cdG9uRmluaXNoQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uRmluaXNoQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGd1aS5vbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfY2FsbE9uRmluaXNoQ2hhbmdlKCBjb250cm9sbGVyICkge1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25GaW5pc2hDaGFuZ2UoIGNvbnRyb2xsZXIgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX29uRmluaXNoQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbkZpbmlzaENoYW5nZS5jYWxsKCB0aGlzLCB7XG5cdFx0XHRcdG9iamVjdDogY29udHJvbGxlci5vYmplY3QsXG5cdFx0XHRcdHByb3BlcnR5OiBjb250cm9sbGVyLnByb3BlcnR5LFxuXHRcdFx0XHR2YWx1ZTogY29udHJvbGxlci5nZXRWYWx1ZSgpLFxuXHRcdFx0XHRjb250cm9sbGVyXG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbiB0aGlzIEdVSSBvciBpdHMgZGVzY2VuZGFudHMgYXJlIG9wZW5lZCBvciBjbG9zZWQuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24oR1VJKX0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5vbk9wZW5DbG9zZSggY2hhbmdlZEdVSSA9PiB7XG5cdCAqIFx0Y29uc29sZS5sb2coIGNoYW5nZWRHVUkuX2Nsb3NlZCApO1xuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbk9wZW5DbG9zZSggY2FsbGJhY2sgKSB7XG5cdFx0dGhpcy5fb25PcGVuQ2xvc2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9jYWxsT25PcGVuQ2xvc2UoIGNoYW5nZWRHVUkgKSB7XG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25PcGVuQ2xvc2UoIGNoYW5nZWRHVUkgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX29uT3BlbkNsb3NlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbk9wZW5DbG9zZS5jYWxsKCB0aGlzLCBjaGFuZ2VkR1VJICk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIERlc3Ryb3lzIGFsbCBET00gZWxlbWVudHMgYW5kIGV2ZW50IGxpc3RlbmVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBHVUkuXG5cdCAqL1xuXHRkZXN0cm95KCkge1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50LmNoaWxkcmVuLnNwbGljZSggdGhpcy5wYXJlbnQuY2hpbGRyZW4uaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0XHR0aGlzLnBhcmVudC5mb2xkZXJzLnNwbGljZSggdGhpcy5wYXJlbnQuZm9sZGVycy5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuZG9tRWxlbWVudC5wYXJlbnRFbGVtZW50ICkge1xuXHRcdFx0dGhpcy5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXHRcdH1cblxuXHRcdEFycmF5LmZyb20oIHRoaXMuY2hpbGRyZW4gKS5mb3JFYWNoKCBjID0+IGMuZGVzdHJveSgpICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGFuIGFycmF5IG9mIGNvbnRyb2xsZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSSBhbmQgaXRzIGRlc2NlbmRlbnRzLlxuXHQgKiBAcmV0dXJucyB7Q29udHJvbGxlcltdfVxuXHQgKi9cblx0Y29udHJvbGxlcnNSZWN1cnNpdmUoKSB7XG5cdFx0bGV0IGNvbnRyb2xsZXJzID0gQXJyYXkuZnJvbSggdGhpcy5jb250cm9sbGVycyApO1xuXHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblx0XHRcdGNvbnRyb2xsZXJzID0gY29udHJvbGxlcnMuY29uY2F0KCBmLmNvbnRyb2xsZXJzUmVjdXJzaXZlKCkgKTtcblx0XHR9ICk7XG5cdFx0cmV0dXJuIGNvbnRyb2xsZXJzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgZm9sZGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkgYW5kIGl0cyBkZXNjZW5kZW50cy5cblx0ICogQHJldHVybnMge0dVSVtdfVxuXHQgKi9cblx0Zm9sZGVyc1JlY3Vyc2l2ZSgpIHtcblx0XHRsZXQgZm9sZGVycyA9IEFycmF5LmZyb20oIHRoaXMuZm9sZGVycyApO1xuXHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblx0XHRcdGZvbGRlcnMgPSBmb2xkZXJzLmNvbmNhdCggZi5mb2xkZXJzUmVjdXJzaXZlKCkgKTtcblx0XHR9ICk7XG5cdFx0cmV0dXJuIGZvbGRlcnM7XG5cdH1cblxufVxuXG5leHBvcnQgeyBCb29sZWFuQ29udHJvbGxlciwgQ29sb3JDb250cm9sbGVyLCBDb250cm9sbGVyLCBGdW5jdGlvbkNvbnRyb2xsZXIsIEdVSSwgTnVtYmVyQ29udHJvbGxlciwgT3B0aW9uQ29udHJvbGxlciwgU3RyaW5nQ29udHJvbGxlciwgR1VJIGFzIGRlZmF1bHQgfTtcbiIsImltcG9ydCB0eXBlIHsgQWN0aW5TdGF0cyB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gY2xhc3NpZnlDaGVja3BvaW50KHM6IEFjdGluU3RhdHMsIGZpeGVkQXJlYTogYm9vbGVhbik6IFwidmFsaWRcIiB8IFwiY29udGFjdHNcIiB8IFwiZmF0YWxcIiB7XG4gIGNvbnN0IGZpbml0ZSA9IFtcbiAgICBzLmNlbGwuYXJlYSxcbiAgICBzLmNlbGwuY2VudHJvaWRYLFxuICAgIHMuY2VsbC5jZW50cm9pZFksXG4gICAgcy5jZWxsLmxlZnQsXG4gICAgcy5jZWxsLnJpZ2h0LFxuICAgIHMuY2VsbC50b3AsXG4gICAgcy5jZWxsLmJvdHRvbSxcbiAgICBzLmFjdGluQmFsYW5jZUVycm9yLFxuICAgIHMuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgIHMuaW5Qb2x5bWVyLFxuICAgIHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzLFxuICAgIHMuYnJva2VuTGlua3MsXG4gICAgcy5jeWNsZXMsXG4gIF0uZXZlcnkoTnVtYmVyLmlzRmluaXRlKTtcbiAgaWYgKFxuICAgICFmaW5pdGUgfHxcbiAgICBzLmNlbGwuYXJlYSA8PSAwIHx8XG4gICAgcy5hY3RpbkJhbGFuY2VFcnJvciAhPT0gMCB8fFxuICAgIHMuYnJva2VuTGlua3MgIT09IDAgfHxcbiAgICBzLmN5Y2xlcyAhPT0gMCB8fFxuICAgIHMuaW5zaWRlUG9seW1lckJlYWRzICE9PSBzLmluUG9seW1lciB8fFxuICAgIChmaXhlZEFyZWEgJiYgTWF0aC5hYnMocy5jZWxsLmFyZWEgLSAxKSA+IDAuMDAxKVxuICApXG4gICAgcmV0dXJuIFwiZmF0YWxcIjtcbiAgaWYgKHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzID09PSAwKSByZXR1cm4gXCJ2YWxpZFwiO1xuICByZXR1cm4gTnVtYmVyLmlzSW50ZWdlcihzLmNyb3NzaW5nRmlsYW1lbnRCb25kcykgJiYgcy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMgPiAwICYmIHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzIDw9IDggPyBcImNvbnRhY3RzXCIgOiBcImZhdGFsXCI7XG59XG5cbnR5cGUgRGVwZW5kZW5jaWVzID0ge1xuICBpbnNwZWN0OiAoKSA9PiBQcm9taXNlPEFjdGluU3RhdHM+O1xuICBiZWdpbjogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgcmVwYWlyOiAoaXRlcmF0aW9uczogbnVtYmVyKSA9PiBQcm9taXNlPG51bWJlcj47XG4gIHJvbGxiYWNrOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICBkaXNwb3NlOiAoKSA9PiB2b2lkO1xuICBmaXhlZEFyZWE6ICgpID0+IGJvb2xlYW47XG4gIG1heERpc3BsYWNlbWVudDogKCkgPT4gbnVtYmVyO1xuICBub3c6ICgpID0+IG51bWJlcjtcbiAgbm90aWNlOiAobWVzc2FnZTogc3RyaW5nKSA9PiB2b2lkO1xuICBmYWlsOiAoZXJyb3I6IHVua25vd24pID0+IHZvaWQ7XG59O1xuZXhwb3J0IHR5cGUgUmVjb3ZlcnlSZWNvcmQgPSB7XG4gIHRyaWdnZXJTdGVwOiBudW1iZXI7XG4gIGN1cnJlbnRTdGVwPzogbnVtYmVyO1xuICBpbml0aWFsQ3Jvc3NpbmdzOiBudW1iZXI7XG4gIHBhc3NlczogbnVtYmVyO1xuICBvdXRjb21lOiBcImNoZWNraW5nXCIgfCBcImZyZXNoLXN0YXRlLWNsZWFuXCIgfCBcImNvcnJlY3RlZFwiIHwgXCJmYWlsZWRcIjtcbiAgbWF4RGlzcGxhY2VtZW50OiBudW1iZXI7XG4gIGVsYXBzZWRNcz86IG51bWJlcjtcbiAgZXJyb3I/OiBzdHJpbmc7XG59O1xuXG4vLyBDYWxsZWQgc3luY2hyb25vdXNseSBmcm9tIHRoZSBhc3luY2hyb25vdXMgZGlhZ25vc3RpYyBjYWxsYmFjaywgYnV0IG5ldmVyXG4vLyBhd2FpdGVkIGJ5IHRoYXQgY2FsbGJhY2suIFRoZSBhY3RpdmUgZmxhZyBmcmVlemVzIG5ldyBwaHlzaWNzIHN1Ym1pc3Npb25zLlxuZXhwb3J0IGNsYXNzIENvbnRhY3RSZWNvdmVyeSB7XG4gIGFjdGl2ZSA9IGZhbHNlO1xuICByZWFkb25seSBoaXN0b3J5OiBSZWNvdmVyeVJlY29yZFtdID0gW107XG4gIHByaXZhdGUgcGVuZGluZzogUHJvbWlzZTx2b2lkPiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlY2VudDogbnVtYmVyW10gPSBbXTtcbiAgcHJpdmF0ZSBkZXBzOiBEZXBlbmRlbmNpZXM7XG4gIGNvbnN0cnVjdG9yKGRlcHM6IERlcGVuZGVuY2llcykge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG4gIH1cbiAgd2FpdCgpIHtcbiAgICByZXR1cm4gdGhpcy5wZW5kaW5nID8/IFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIHJlcXVlc3QodHJpZ2dlcjogQWN0aW5TdGF0cykge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkgcmV0dXJuIHRoaXMud2FpdCgpO1xuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICBjb25zdCBkID0gdGhpcy5kZXBzLFxuICAgICAgc3RhcnRlZCA9IGQubm93KCk7XG4gICAgY29uc3QgcmVjb3JkOiBSZWNvdmVyeVJlY29yZCA9IHtcbiAgICAgIHRyaWdnZXJTdGVwOiB0cmlnZ2VyLnN0ZXAsXG4gICAgICBpbml0aWFsQ3Jvc3NpbmdzOiB0cmlnZ2VyLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICAgIHBhc3NlczogMCxcbiAgICAgIG91dGNvbWU6IFwiY2hlY2tpbmdcIixcbiAgICAgIG1heERpc3BsYWNlbWVudDogMCxcbiAgICB9O1xuICAgIHRoaXMuaGlzdG9yeS5wdXNoKHJlY29yZCk7XG4gICAgaWYgKHRoaXMuaGlzdG9yeS5sZW5ndGggPiAzMikgdGhpcy5oaXN0b3J5LnNoaWZ0KCk7XG4gICAgbGV0IGJhY2tlZFVwID0gZmFsc2U7XG4gICAgY29uc3QgY2hlY2tCdWRnZXQgPSAoKSA9PiB7XG4gICAgICBpZiAoZC5ub3coKSAtIHN0YXJ0ZWQgPiA1MDAwKSB0aHJvdyBFcnJvcihcIkNvbnRhY3QgcmVjb3ZlcnkgZXhjZWVkZWQgaXRzIHRpbWUgYnVkZ2V0XCIpO1xuICAgIH07XG4gICAgY29uc3QgcnVuID0gYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5yZWNlbnQgPSB0aGlzLnJlY2VudC5maWx0ZXIoKHN0ZXApID0+IHRyaWdnZXIuc3RlcCAtIHN0ZXAgPCAxMDAwKTtcbiAgICAgICAgaWYgKHRoaXMucmVjZW50Lmxlbmd0aCA+PSAzKSB0aHJvdyBFcnJvcihcIlJlcGVhdGVkIGNvbnRhY3QgZmFpbHVyZXM6IHJlY292ZXJ5IGJ1ZGdldCBleGhhdXN0ZWRcIik7XG4gICAgICAgIHRoaXMucmVjZW50LnB1c2godHJpZ2dlci5zdGVwKTtcbiAgICAgICAgZC5ub3RpY2UoYFJlY2hlY2tpbmcgJHt0cmlnZ2VyLmNyb3NzaW5nRmlsYW1lbnRCb25kc30gY29udGFjdCBjcm9zc2luZyhzKeKApmApO1xuICAgICAgICBsZXQgc3RhdGUgPSBhd2FpdCBkLmluc3BlY3QoKTtcbiAgICAgICAgY2hlY2tCdWRnZXQoKTtcbiAgICAgICAgcmVjb3JkLmN1cnJlbnRTdGVwID0gc3RhdGUuc3RlcDtcbiAgICAgICAgbGV0IGtpbmQgPSBjbGFzc2lmeUNoZWNrcG9pbnQoc3RhdGUsIGQuZml4ZWRBcmVhKCkpO1xuICAgICAgICBpZiAoa2luZCA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgcmVjb3JkLm91dGNvbWUgPSBcImZyZXNoLXN0YXRlLWNsZWFuXCI7XG4gICAgICAgICAgZC5ub3RpY2UoXCJDdXJyZW50IHN0YXRlIHZlcmlmaWVkOyBjb250aW51aW5nLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGtpbmQgIT09IFwiY29udGFjdHNcIikgdGhyb3cgRXJyb3IoXCJDdXJyZW50IHN0YXRlIGhhcyBhIG5vbi1yZWNvdmVyYWJsZSBpbnZhcmlhbnQgZmFpbHVyZVwiKTtcbiAgICAgICAgYXdhaXQgZC5iZWdpbigpO1xuICAgICAgICBiYWNrZWRVcCA9IHRydWU7XG4gICAgICAgIGZvciAoY29uc3QgaXRlcmF0aW9ucyBvZiBbNCwgOCwgMTYsIDMyXSkge1xuICAgICAgICAgIGNoZWNrQnVkZ2V0KCk7XG4gICAgICAgICAgZC5ub3RpY2UoYENvcnJlY3RpbmcgY29udGFjdCByZXNpZHVhbHMgKCR7cmVjb3JkLnBhc3NlcyArIGl0ZXJhdGlvbnN9IGV4dHJhIHBhc3NlcynigKZgKTtcbiAgICAgICAgICByZWNvcmQubWF4RGlzcGxhY2VtZW50ID0gYXdhaXQgZC5yZXBhaXIoaXRlcmF0aW9ucyk7XG4gICAgICAgICAgcmVjb3JkLnBhc3NlcyArPSBpdGVyYXRpb25zO1xuICAgICAgICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHJlY29yZC5tYXhEaXNwbGFjZW1lbnQpIHx8IHJlY29yZC5tYXhEaXNwbGFjZW1lbnQgPiBkLm1heERpc3BsYWNlbWVudCgpKVxuICAgICAgICAgICAgdGhyb3cgRXJyb3IoXCJDb250YWN0IGNvcnJlY3Rpb24gZXhjZWVkZWQgaXRzIGRpc3BsYWNlbWVudCBidWRnZXRcIik7XG4gICAgICAgICAgc3RhdGUgPSBhd2FpdCBkLmluc3BlY3QoKTtcbiAgICAgICAgICBjaGVja0J1ZGdldCgpO1xuICAgICAgICAgIGlmIChzdGF0ZS5zdGVwICE9PSByZWNvcmQuY3VycmVudFN0ZXApIHRocm93IEVycm9yKFwiUGh5c2ljcyBhZHZhbmNlZCBkdXJpbmcgY29udGFjdCByZWNvdmVyeVwiKTtcbiAgICAgICAgICBraW5kID0gY2xhc3NpZnlDaGVja3BvaW50KHN0YXRlLCBkLmZpeGVkQXJlYSgpKTtcbiAgICAgICAgICBpZiAoa2luZCA9PT0gXCJ2YWxpZFwiKSB7XG4gICAgICAgICAgICByZWNvcmQub3V0Y29tZSA9IFwiY29ycmVjdGVkXCI7XG4gICAgICAgICAgICBkLm5vdGljZShgQ29udGFjdHMgY29ycmVjdGVkIGFuZCB2ZXJpZmllZCAoJHtyZWNvcmQucGFzc2VzfSBwYXNzZXMpLmApO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoa2luZCAhPT0gXCJjb250YWN0c1wiKSB0aHJvdyBFcnJvcihcIkNvbnRhY3QgY29ycmVjdGlvbiBjaGFuZ2VkIGFub3RoZXIgaW52YXJpYW50XCIpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IEVycm9yKFwiQ29udGFjdCBjb3JyZWN0aW9uIGRpZCBub3QgY29udmVyZ2Ugd2l0aGluIDYwIGV4dHJhIHBhc3Nlc1wiKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIHJlY29yZC5vdXRjb21lID0gXCJmYWlsZWRcIjtcbiAgICAgICAgcmVjb3JkLmVycm9yID0gU3RyaW5nKGVycm9yKTtcbiAgICAgICAgaWYgKGJhY2tlZFVwKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGQucm9sbGJhY2soKTtcbiAgICAgICAgICB9IGNhdGNoIChyb2xsYmFja0Vycm9yKSB7XG4gICAgICAgICAgICByZWNvcmQuZXJyb3IgKz0gYDsgcm9sbGJhY2sgZmFpbGVkOiAke1N0cmluZyhyb2xsYmFja0Vycm9yKX1gO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkLmZhaWwobmV3IEVycm9yKHJlY29yZC5lcnJvcikpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZC5kaXNwb3NlKCk7XG4gICAgICAgIHJlY29yZC5lbGFwc2VkTXMgPSBkLm5vdygpIC0gc3RhcnRlZDtcbiAgICAgICAgdGhpcy5hY3RpdmUgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHRoaXMucGVuZGluZyA9IHJ1bigpO1xuICAgIHJldHVybiB0aGlzLnBlbmRpbmc7XG4gIH1cbn1cbiIsImltcG9ydCB7IHBvbHlnb25PY2N1cGFuY3ksIHBvbHlnb25Cb25kQ3Jvc3NpbmcgfSBmcm9tIFwiLi9vY2N1cGFuY3lcIjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRlc3RFbmNsb3N1cmUoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXIgfSxcbiAgY291bnRzOiB7IGFjdGluOiBudW1iZXI7IG1lbWJyYW5lOiBudW1iZXIgfSxcbiAgZGlzcGF0Y2g6ICgpID0+IHZvaWQsXG4gIGNvbmZpZ3VyZTogKGZpeGVkQXJlYTogYm9vbGVhbiwgcmVmZXJlbmNlQXJlYTogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgY2hlY2tzOiB7IG5hbWU6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuIH1bXSA9IFtdO1xuICBjb25zdCBhc3NlcnQgPSAobmFtZTogc3RyaW5nLCBjb25kaXRpb246IGJvb2xlYW4pID0+IHtcbiAgICBjaGVja3MucHVzaCh7IG5hbWUsIHBhc3NlZDogY29uZGl0aW9uIH0pO1xuICAgIGlmICghY29uZGl0aW9uKSB0aHJvdyBuZXcgRXJyb3IoYEVuY2xvc3VyZSBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyKSA9PiB7XG4gICAgY29uc3Qgc3RhZ2UgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogYnVmZmVyLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihidWZmZXIsIDAsIHN0YWdlLCAwLCBidWZmZXIuc2l6ZSk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGF3YWl0IHN0YWdlLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgZGF0YSA9IHN0YWdlLmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCk7XG4gICAgc3RhZ2UudW5tYXAoKTtcbiAgICBzdGFnZS5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG4gIGNvbnN0IHJ1biA9IGFzeW5jIChwb2x5Z29uOiBudW1iZXJbXVtdLCBwb2ludHM6IG51bWJlcltdW10sIGZpeGVkQXJlYSA9IGZhbHNlLCByZWZlcmVuY2VBcmVhID0gNDAwKSA9PiB7XG4gICAgY29uc3QgbWVtID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUuc2l6ZSksXG4gICAgICBtZiA9IG5ldyBGbG9hdDMyQXJyYXkobWVtKSxcbiAgICAgIG11ID0gbmV3IFVpbnQzMkFycmF5KG1lbSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMubWVtYnJhbmU7IGkrKykge1xuICAgICAgLy8gRGVuc2UgaG9yaXpvbnRhbCBlZGdlcyBhbHNvIG92ZXJmbG93IHRoZSBzaG9ydGxpc3RzLCBleGVyY2lzaW5nIHRoZWlyXG4gICAgICAvLyBjb21wbGV0ZS1wb2x5Z29uIGZhbGxiYWNrIHJhdGhlciB0aGFuIG9ubHkgc3BhcnNlIGhhcHB5LXBhdGggYmlucy5cbiAgICAgIGNvbnN0IGF0ID0gKGkgKiBwb2x5Z29uLmxlbmd0aCkgLyBjb3VudHMubWVtYnJhbmU7XG4gICAgICBjb25zdCBlZGdlID0gTWF0aC5mbG9vcihhdCk7XG4gICAgICBjb25zdCBhID0gcG9seWdvbltlZGdlXSxcbiAgICAgICAgYiA9IHBvbHlnb25bKGVkZ2UgKyAxKSAlIHBvbHlnb24ubGVuZ3RoXTtcbiAgICAgIGNvbnN0IHAgPSBbYVswXSArIChiWzBdIC0gYVswXSkgKiAoYXQgLSBlZGdlKSwgYVsxXSArIChiWzFdIC0gYVsxXSkgKiAoYXQgLSBlZGdlKV07XG4gICAgICBtdVtpICogMTBdID0gaTtcbiAgICAgIG11W2kgKiAxMCArIDZdID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG11W2kgKiAxMCArIDddID0gKGkgKyBjb3VudHMubWVtYnJhbmUgLSAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIG1mW2kgKiAxMCArIDJdID0gcFswXTtcbiAgICAgIG1mW2kgKiAxMCArIDNdID0gcFsxXTtcbiAgICB9XG4gICAgY29uc3QgYWN0aW4gPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5hY3Rpbi5zaXplKSxcbiAgICAgIGFmID0gbmV3IEZsb2F0MzJBcnJheShhY3RpbiksXG4gICAgICBhdSA9IG5ldyBVaW50MzJBcnJheShhY3Rpbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMuYWN0aW47IGkrKykge1xuICAgICAgYXVbaSAqIDEwXSA9IGF1W2kgKiAxMCArIDZdID0gYXVbaSAqIDEwICsgN10gPSBpO1xuICAgIH1cbiAgICBwb2ludHMuZm9yRWFjaCgoW3gsIHldLCBpKSA9PiB7XG4gICAgICBhZltpICogMTAgKyAyXSA9IHg7XG4gICAgICBhZltpICogMTAgKyAzXSA9IHk7XG4gICAgICBhdVtpICogMTAgKyA2XSA9IGkgPT09IDAgPyAwIDogaSAtIDE7XG4gICAgICBhdVtpICogMTAgKyA3XSA9IGkgPT09IHBvaW50cy5sZW5ndGggLSAxID8gaSA6IGkgKyAxO1xuICAgIH0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLCAwLCBtZW0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBhY3Rpbik7XG4gICAgY29uZmlndXJlKGZpeGVkQXJlYSwgcmVmZXJlbmNlQXJlYSk7XG4gICAgZGlzcGF0Y2goKTtcbiAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgIHJldHVybiB7IGFjdGluOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpLCBtZW1icmFuZTogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubWVtYnJhbmUpKSB9O1xuICB9O1xuICBsZXQgcmVzdWx0ID0gYXdhaXQgcnVuKFxuICAgIFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFsyMCwgMF0sXG4gICAgICBbMjAsIDIwXSxcbiAgICAgIFswLCAyMF0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbMjUsIDFdLFxuICAgICAgWzI2LCAxXSxcbiAgICBdXG4gICk7XG4gIGxldCBpbnNpZGUgPSBwb2x5Z29uT2NjdXBhbmN5KHJlc3VsdC5tZW1icmFuZSwgMTAsIHRydWUpO1xuICBhc3NlcnQoXCJlc2NhcGVkIGZpbGFtZW50IGJlYWRzIGFyZSBwcm9qZWN0ZWQgaW5zaWRlXCIsIGluc2lkZShyZXN1bHQuYWN0aW5bMl0sIHJlc3VsdC5hY3RpblszXSkgJiYgaW5zaWRlKHJlc3VsdC5hY3RpblsxMl0sIHJlc3VsdC5hY3RpblsxM10pKTtcbiAgbGV0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KHJlc3VsdC5hY3Rpbi5idWZmZXIpO1xuICBhc3NlcnQoXG4gICAgXCJjb250YWN0IHByZXNlcnZlcyBjb25uZWN0aXZpdHkgYW5kIGZpbml0ZSByZXNlcnZvaXIgYW1vdW50XCIsXG4gICAgd29yZHNbN10gPT09IDEgJiZcbiAgICAgIHdvcmRzWzE2XSA9PT0gMCAmJlxuICAgICAgQXJyYXkuZnJvbSh7IGxlbmd0aDogY291bnRzLmFjdGluIC0gMiB9LCAoXywgaykgPT4gayArIDIpLmV2ZXJ5KChpKSA9PiB3b3Jkc1tpICogMTAgKyA2XSA9PT0gaSAmJiB3b3Jkc1tpICogMTAgKyA3XSA9PT0gaSlcbiAgKTtcbiAgcmVzdWx0ID0gYXdhaXQgcnVuKFxuICAgIFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFs4LCAwXSxcbiAgICAgIFs4LCAzXSxcbiAgICAgIFszLCAzXSxcbiAgICAgIFszLCA4XSxcbiAgICAgIFswLCA4XSxcbiAgICBdLFxuICAgIFtcbiAgICAgIFs3LCAxXSxcbiAgICAgIFsxLCA3XSxcbiAgICBdXG4gICk7XG4gIGluc2lkZSA9IHBvbHlnb25PY2N1cGFuY3kocmVzdWx0Lm1lbWJyYW5lLCAxMCwgdHJ1ZSk7XG4gIGNvbnN0IGNyb3NzaW5nID0gcG9seWdvbkJvbmRDcm9zc2luZyhyZXN1bHQubWVtYnJhbmUpO1xuICBhc3NlcnQoXG4gICAgXCJpbnRlcmlvciBlbmRwb2ludHMgY2Fubm90IGJyaWRnZSBhY3Jvc3MgYSBjb25jYXZlIGV4dGVyaW9yXCIsXG4gICAgaW5zaWRlKHJlc3VsdC5hY3RpblsxMl0sIHJlc3VsdC5hY3RpblsxM10pICYmICFjcm9zc2luZyhyZXN1bHQuYWN0aW5bMl0sIHJlc3VsdC5hY3RpblszXSwgcmVzdWx0LmFjdGluWzEyXSwgcmVzdWx0LmFjdGluWzEzXSlcbiAgKTtcbiAgcmVzdWx0ID0gYXdhaXQgcnVuKFxuICAgIFtcbiAgICAgIFswLCAwXSxcbiAgICAgIFsyMCwgMF0sXG4gICAgICBbMjAsIDIwXSxcbiAgICAgIFswLCAyMF0sXG4gICAgXSxcbiAgICBbXSxcbiAgICB0cnVlLFxuICAgIDkwMFxuICApO1xuICBsZXQgYXJlYTIgPSAwLFxuICAgIGN4ID0gMCxcbiAgICBjeSA9IDA7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLm1lbWJyYW5lOyBpKyspIHtcbiAgICBjb25zdCBqID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICBjb25zdCBheCA9IHJlc3VsdC5tZW1icmFuZVtpICogMTAgKyAyXSxcbiAgICAgIGF5ID0gcmVzdWx0Lm1lbWJyYW5lW2kgKiAxMCArIDNdO1xuICAgIGNvbnN0IGJ4ID0gcmVzdWx0Lm1lbWJyYW5lW2ogKiAxMCArIDJdLFxuICAgICAgYnkgPSByZXN1bHQubWVtYnJhbmVbaiAqIDEwICsgM107XG4gICAgY29uc3QgY3Jvc3MgPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgICBhcmVhMiArPSBjcm9zcztcbiAgICBjeCArPSAoYXggKyBieCkgKiBjcm9zcztcbiAgICBjeSArPSAoYXkgKyBieSkgKiBjcm9zcztcbiAgfVxuICBhc3NlcnQoXCJhcmVhIGNsb3N1cmUgcmVhY2hlcyB0aGUgZGVjbGFyZWQgcmVmZXJlbmNlIGFyZWFcIiwgTWF0aC5hYnMoYXJlYTIgLyAyIC0gOTAwKSA8IDAuMDIpO1xuICBhc3NlcnQoXCJhcmVhIGNsb3N1cmUgcHJlc2VydmVzIHRoZSBjdXJyZW50IGdlb21ldHJpYyBjZW50cm9pZFwiLCBNYXRoLmFicyhjeCAvICgzICogYXJlYTIpIC0gMTApIDwgMC4wMDEgJiYgTWF0aC5hYnMoY3kgLyAoMyAqIGFyZWEyKSAtIDEwKSA8IDAuMDAxKTtcbiAgd29yZHMgPSBuZXcgVWludDMyQXJyYXkocmVzdWx0LmFjdGluLmJ1ZmZlcik7XG4gIGFzc2VydChcbiAgICBcImdlb21ldHJ5IGNoYW5nZXMgZG8gbm90IG1hbnVmYWN0dXJlIG9yIGRpc2NhcmQgRy1hY3RpblwiLFxuICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50cy5hY3RpbiB9LCAoXywgaSkgPT4gaSkuZXZlcnkoKGkpID0+IHdvcmRzW2kgKiAxMCArIDZdID09PSBpICYmIHdvcmRzW2kgKiAxMCArIDddID09PSBpKVxuICApO1xuICByZXR1cm4gY2hlY2tzO1xufVxuIiwiaW1wb3J0IEdVSSBmcm9tIFwibGlsLWd1aVwiO1xuaW1wb3J0IHsgcmVxdWVzdERldmljZSwgY29uZmlndXJlQ2FudmFzLCBjcmVhdGVTaGFkZXIsIHNldHVwSW50ZXJhY3Rpb25zLCBzZXR1cFRleHR1cmVzLCBnZXRSYW5kb21WYWx1ZXMgfSBmcm9tIFwiLi91dGlsc1wiO1xuaW1wb3J0IHJlbmRlckNvZGUgZnJvbSBcIi4vc2hhZGVycy9yZW5kZXIud2dzbFwiO1xuaW1wb3J0IHNpbXVsYXRlQ29kZSBmcm9tIFwiLi9zaGFkZXJzL3NpbXVsYXRlLndnc2xcIjtcbmltcG9ydCB7IGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXMsIHJ1blNpbXVsYXRpb25TdGVwLCBydW5FbmNsb3N1cmUsIHJ1bkNvbnRhY3RSZXBhaXIgfSBmcm9tIFwiLi9zaW11bGF0ZVwiO1xuaW1wb3J0IHsgQ29udGFjdFJlY292ZXJ5LCBjbGFzc2lmeUNoZWNrcG9pbnQgfSBmcm9tIFwiLi9jb250YWN0LXJlY292ZXJ5XCI7XG5cbi8vIEltcG9ydCBzaGFkZXIgaW5jbHVkZXNcbmltcG9ydCBiaW5kaW5nc0NvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9iaW5kaW5ncy53Z3NsXCI7XG5pbXBvcnQgdGV4dHVyZXNDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvdGV4dHVyZXMud2dzbFwiO1xuaW1wb3J0IGJ1ZmZlcnNDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYnVmZmVycy53Z3NsXCI7XG5pbXBvcnQgcmFuZG9tQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL3JhbmRvbS53Z3NsXCI7XG5pbXBvcnQgYWN0b215b3NpbkNvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9hY3RvbXlvc2luLndnc2xcIjtcbmltcG9ydCBlbmNsb3N1cmVDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvZW5jbG9zdXJlLndnc2xcIjtcbmltcG9ydCB7IFJlbmRlck1vZHVsZSB9IGZyb20gXCIuL3JlbmRlclwiO1xuaW1wb3J0IHsgU3Byb3V0U2NoZWR1bGVyLCBNQVhfU1BST1VUX1NJVEVTIH0gZnJvbSBcIi4vc3Byb3V0c1wiO1xuaW1wb3J0IHsgQWN0aW5UZWxlbWV0cnkgfSBmcm9tIFwiLi90ZWxlbWV0cnlcIjtcbmltcG9ydCB7IHNlZWRlZFJhbmRvbSB9IGZyb20gXCIuL3JhbmRvbVwiO1xuaW1wb3J0IHsgdGVzdE1lY2hhbmljcyB9IGZyb20gXCIuL21lY2hhbmljcy10ZXN0XCI7XG5pbXBvcnQgeyB0ZXN0RW5jbG9zdXJlIH0gZnJvbSBcIi4vZW5jbG9zdXJlLXRlc3RcIjtcbmltcG9ydCB7IHRlc3RSZW5ld2FsIH0gZnJvbSBcIi4vcmVuZXdhbC10ZXN0XCI7XG5pbXBvcnQgeyBGcmFtZUJ1ZGdldCwgTGl2ZVBlcmZvcm1hbmNlIH0gZnJvbSBcIi4vcmVhbHRpbWVcIjtcblxuLy8gU2hhZGVyIGluY2x1ZGVzIG1hcHBpbmdcbmNvbnN0IHNoYWRlckluY2x1ZGVzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBiaW5kaW5nczogYmluZGluZ3NDb2RlLFxuICB0ZXh0dXJlczogdGV4dHVyZXNDb2RlLFxuICBidWZmZXJzOiBidWZmZXJzQ29kZSxcbiAgcmFuZG9tOiByYW5kb21Db2RlLFxuICBhY3RvbXlvc2luOiBhY3RvbXlvc2luQ29kZSxcbiAgZW5jbG9zdXJlOiBlbmNsb3N1cmVDb2RlLFxufTtcblxuLy8gU2l6ZXMgaW4gYnl0ZXMgLSB1c2VmdWwgZm9yIGNhbGN1bGF0aW5nIGJ1ZmZlciBzaXplcyBhbmQgb2Zmc2V0c1xuY29uc3Qgc2l6ZTMyID0gNDsgLy8gc2l6ZSBvZiBhIDMyLWJpdCBmbG9hdCBvciBpbnRcblxuLy8gVW5pZm9ybSB2YWx1ZXMgY29udGFpbmVyXG5jb25zdCB1bmlmb3JtcyA9IHtcbiAgY29tcHV0ZVN0ZXBzUGVyRnJhbWU6IDQsXG4gIHRhcmdldEZQUzogNjAsXG4gIHNpbXVsYXRpb25TY2FsZTogMS4wLCAvLyB0ZXh0dXJlIHBpeGVscyBwZXIgc2NyZWVuIChDU1MpIHBpeGVsOyB0aGUgY2VsbCBzY2FsZXMgd2l0aCBpdCBpbiBwaXhlbHMsIHNvIGl0IGxvb2tzIHRoZSBzYW1lIHNpemUgb24gc2NyZWVuXG4gIGFjdGluQ291bnQ6IDEgKiAyNTYgKiAyNTYsIC8vIDQwMDAgaXMgbWluaW11bSBmb3IgbmljZSBhY3Rpb24uXG4gIG1lbWJyYW5lQ291bnQ6IDYgKiAyNTYsXG4gIHN0aWZmbmVzczogMC41LFxuICBmb29kTmVhcmJ5VGhyZXNob2xkOiAwLjAwMSxcbiAgZGlzY29ubmVjdGlvblByb2JhYmlsaXR5OiAwLjAwNixcbiAgbW9ub21lck1lbWJyYW5lUmVwdWxzaW9uOiAwLjA5LCAvLyBob3cgaGFyZCBtb25vbWVycyBhcmUgcHVzaGVkIG9mZiB0aGUgbWVtYnJhbmU6IDEuMCBsZWF2ZXMgYSB+OCBweCBnYXAsIDAuMSBhYm91dCA0IHB4XG4gIHBvbHltZXJSZXB1bHNpb246IDAuNDIyLFxuICBzdGVyaWNTYW1wbGluZ1JhbmdlOiAyLFxuICBhY3RpbkNvaGVzaW9uUmFuZ2U6IDEsXG4gIGJpbmRQcm9iOiAwLjAzLFxuICBiaW5kTGVuZ3RoRmxvb3I6IDIsIC8vIGZpbGFtZW50cyBzaG9ydGVyIHRoYW4gdGhpcyBiaW5kIGF0IGJpbmRQcm9iICogdGhpcyAoYSBsb25lIG1vbm9tZXIgYXQgYmluZFByb2IpOyBsb25nZXIgb25lcyBhdCBiaW5kUHJvYiAqIGxlbmd0aFxuICBiaW5kTGVuZ3RoU2F0dXJhdGlvbjogMjAsIC8vIGZpbGFtZW50cyBsb25nZXIgdGhhbiB0aGlzIGJpbmQgbm8gbW9yZSByZWFkaWx5IChtYXggNjQpXG4gIGFjdGluU3RlcmljRm9yY2U6IDAuMixcbiAgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U6IDIuMCwgLy8gYWN0aW4gcmVzdCBsZW5ndGggaW4gcGl4ZWxzOyBzZXRzIGZpbGFtZW50IHNwYWNpbmcgbm93IHRoYXQgYSBmaWxhbWVudCBkb2Vzbid0IHJlcGVsIGl0c2VsZlxuICBtb3ZlbWVudE1vZGU6IDAsIC8vIElkbGU6IHBvbHltZXJpemF0aW9uIG9ubHkgY29tZXMgZnJvbSB0aGUgc3Byb3V0IHNpdGVzXG4gIG1lbWJyYW5lUmVzdExlbmd0aDogMi4wIC8gMy4wLCAvLyB3aXRoIDZ4IHRoZSBvcmlnaW5hbCAyNTYgbm9kZXMgYXQgcmVzdCBsZW5ndGggMiB0aGUgY2VsbCBpcyAyeCB3aWRlciBpbiBwaXhlbHMsIG1hdGNoaW5nIHNpbXVsYXRpb25TY2FsZVxuICBtZW1icmFuZVN0aWZmbmVzczogMy4wLCAvLyBob3cgaGFyZCBhIHN0cmV0Y2hlZCBtZW1icmFuZSBwdWxscyBpbiwgYWxvbmcgaXRzIGN1cnZhdHVyZVxuICBsYW1lbGxpcG9kaXVtU3RyZW5ndGg6IDAuMTUsIC8vIHBvbHltZXJpemF0aW9uIGZpZWxkIGVtaXR0ZWQgYnkgdGhlIGZyb250IG9mIHRoZSBtZW1icmFuZSwgd2hlcmUgZmlsYW1lbnRzIGFsc28gYnJhbmNoOyAwID0gb2ZmXG4gIGxhbWVsbGlwb2RpdW1XaWR0aDogMC4wMzYsIC8vIGZyYWN0aW9uIG9mIHRoZSBtZW1icmFuZSwgY2VudGVyZWQgb24gdGhlIGZyb250ICh0aGUgcmlnaHQgc2lkZSBhdCByZXNldCksIHRoYXQgZW1pdHMgaXRcbiAgbGFtZWxsaXBvZGl1bUZpZWxkRGVjYXk6IDAuOTgsIC8vIHBlci1zdGVwIGRlY2F5IG9mIHRoYXQgZmllbGRcbiAgYnJhbmNoUHJvYmFiaWxpdHk6IDAuMDEsIC8vIHBlciBzdGVwLCBmb3IgYSBtb25vbWVyIG5leHQgdG8gYSBmaWxhbWVudCBpbiB0aGUgbGFtZWxsaXBvZGl1bSBmaWVsZCBhdCBzdHJlbmd0aCAxXG4gIGRlYnJhbmNoUHJvYmFiaWxpdHk6IDAuMDAwNSwgLy8gcGVyIHN0ZXAsIGZvciBlYWNoIGJyYW5jaCB0byBjb21lIG9mZiBpdHMgbW90aGVyIGZpbGFtZW50XG4gIGFjdGluQmVuZFN0aWZmbmVzczogNC4wLCAvLyBob3cgZmFzdCBhbiBhY3RpbidzIGRpcmVjdG9yIHR1cm5zIHRvd2FyZCBpdHMgbmVpZ2hib3VycycgKENvc3NlcmF0IGJlbmRpbmcpOyAwID0gZmxvcHB5XG4gIGFjdGluQ29zc2VyYXRJdGVyYXRpb25zOiA4LCAvLyBDb3NzZXJhdCBwYXNzZXMgcGVyIHNpbXVsYXRpb24gc3RlcDsgbW9yZSA9IHN0aWZmZXIsIHN0cmFpZ2h0ZW5zIGxvbmcgZmlsYW1lbnRzIGZhc3RlclxuICBzdGVyaWNTZWxmTmVpZ2hib3JzOiA2LCAvLyBmaWxhbWVudCBuZWlnaGJvdXJzIG9uIGVhY2ggc2lkZSB0aGF0IGRvbid0IHJlcGVsIGFuIGFjdGluIChtYXggMTIpOyB0aGUgcmVzdCBsZW5ndGggc3BhY2VzIHRoZW1cbiAgbWVtYnJhbmVGbG93OiAwLjUsIC8vIGhvdyBmYXN0IG1lbWJyYW5lIHNsaWRlcyB0b3dhcmQgc3RyZXRjaGVkIHJlZ2lvbnMgKHRhbmdlbnRpYWwgc3BhY2luZyBlcXVhbGl6YXRpb24pXG4gIG1lbWJyYW5lRmxvd0l0ZXJhdGlvbnM6IDgsIC8vIHRhbmdlbnRpYWwgZmxvdyBwYXNzZXMgcGVyIHNpbXVsYXRpb24gc3RlcFxuICBtZW1icmFuZVNtb290aGluZzogMC4wMiwgLy8gcHVsbCB0b3dhcmQgdGhlIG5laWdoYm91cnMnIG1pZHBvaW50IHBlciBzdGVwOyByZWxheGVzIGlkbGUgcHJvdHJ1c2lvbnMgYW5kIGN1c3BzXG4gIHBvbHltZXJpemF0aW9uUGF0Y2hTaXplOiAwLjAyLCAvLyBmcmFjdGlvbiBvZiB0aGUgbWVtYnJhbmUgdGhhdCBwb2x5bWVyaXplcyBpbiBNb3ZlIEVhc3QgbW9kZVxuICBwb2x5bWVyaXphdGlvbkZpZWxkRGVjYXk6IDAuOTUsIC8vIHBlci1zdGVwIGRlY2F5IG9mIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZDsgbG93ZXIgPSBtb3JlIGxvY2FsID0gdGhpbm5lciBwcm90cnVzaW9uc1xuICBzcHJvdXRDb3VudDogNiwgLy8gbWF4IG51bWJlciBvZiBzaG9ydC1saXZlZCBwb2x5bWVyaXphdGlvbiBzaXRlcyBhdCBvbmNlXG4gIHNwcm91dFdpZHRoOiAxLCAvLyBtZW1icmFuZSBub2RlcyBjb3ZlcmVkIGJ5IG9uZSBzaXRlXG4gIHNwcm91dEZyb250QmlhczogMC43NSwgLy8gZnJhY3Rpb24gb2Ygc2l0ZXMgcGxhY2VkIG5lYXIgdGhlIGZyb250LCB0aGUgcmVzdCBhbnl3aGVyZSBpbiB0aGUgZnJvbnQgMzAlXG4gIHNwcm91dE9uU3RlcHM6IDYwMDAsIC8vIGF2ZXJhZ2Ugc2ltdWxhdGlvbiBzdGVwcyBhIHNpdGUgc3RheXMgb25cbiAgc3Byb3V0T2ZmU3RlcHM6IDE1MDAsIC8vIGF2ZXJhZ2Ugc2ltdWxhdGlvbiBzdGVwcyBhIHNpdGUgc3RheXMgb2ZmXG4gIG15b3NpblN0cmVuZ3RoOiAwLCAvLyBvcHQtaW4gdW50aWwgbWF0Y2hlZCBjb21wYXJpc29ucyBlc3RhYmxpc2ggYSBiZW5lZml0XG4gIG15b3NpblNwZWVkOiAwLjAyLFxuICBtZW1icmFuZUNvdXBsaW5nOiAwLFxuICBzdWJzdHJhdGVEcmFnOiA0LFxuICBjb3J0ZXhQb2x5bWVyaXphdGlvbjogMCwgLy8gZGlzdGluY3Qgb3B0aW9uYWwgaHlwb3RoZXNpczogYSBwb3N0ZXJpb3IgYWN0aW4gc3Vic3RyYXRlXG4gIG1vbm9tZXJPcGFjaXR5OiAwLjIsIC8vIHZpc3VhbCBvbmx5OiBrZWVwIHRoZSBleHBsaWNpdCBmaWxhbWVudHMgbGVnaWJsZVxuICBnQWN0aW5GaWVsZDogMSwgLy8gZmluaXRlIHdlbGwtbWl4ZWQgcG9vbCBwbHVzIGV4cGxpY2l0LWZpbGFtZW50IGNvbnRhaW5tZW50XG4gIGFyZWFDb25zZXJ2YXRpb246IDEsIC8vIGltcG9zZWQgYXJlYSwgYSAyLUQgdm9sdW1lIHN1cnJvZ2F0ZSwgbm90IG1lYXN1cmVkIHByZXNzdXJlXG4gIGFkYXB0aXZlRnJhbWVzOiAxLFxuICBjdWVYOiAwLFxuICBjdWVZOiAwLFxuICBjdWVFbmFibGVkOiAwLFxuICBwb2xhcml0eU1vZGU6IDAsXG4gIHBvbGFyaXR5VHVyblJhdGU6IDAuMDIsXG4gIHJlYXJUdXJub3ZlcjogMCxcbiAgdHVybm92ZXJBZ2U6IDUwMCxcbiAgdGV0aGVyVHVybm92ZXI6IDAsXG4gIHRldGhlck9uUmF0ZTogMC4wMixcbiAgdGV0aGVyT2ZmUmF0ZTogMC4wMDIsXG4gIHRldGhlclJlY292ZXJ5U3RlcHM6IDQwLFxuICBtb3RvclJlYXJCaWFzOiAwLFxuICBmcm9udEFsaWdubWVudDogMCxcbiAgdGV0aGVyTG9hZE9mZjogMC4wMDIsXG4gIGNvbG91ckFnZTogMCxcbn07XG5cbi8vIG51bWVyaWMgdW5pZm9ybXMgY2FuIGJlIG92ZXJyaWRkZW4gZnJvbSB0aGUgVVJMLCBlLmcuID9iaW5kUHJvYj0wLjA1JmVxdWlsaWJyaXVtTGluZURpc3RhbmNlPTI7ID9ydW49bmFtZSBsYWJlbHMgdGhlIHRlbGVtZXRyeVxuY29uc3QgdXJsUGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcbmNvbnN0IHNlZWQgPSBOdW1iZXIodXJsUGFyYW1zLmdldChcInNlZWRcIikgPz8gNDIpID4+PiAwO1xuY29uc3QgaW5pdGlhbFJhbmRvbSA9IHNlZWRlZFJhbmRvbShzZWVkKTtcbmZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIHVybFBhcmFtcykge1xuICBpZiAoa2V5IGluIHVuaWZvcm1zICYmIE51bWJlci5pc0Zpbml0ZShOdW1iZXIodmFsdWUpKSkge1xuICAgICh1bmlmb3JtcyBhcyBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KVtrZXldID0gTnVtYmVyKHZhbHVlKTtcbiAgfVxufVxuZm9yIChjb25zdCBbbmFtZSwgbWF4aW11bV0gb2YgT2JqZWN0LmVudHJpZXMoe1xuICBteW9zaW5TdHJlbmd0aDogMC4yLFxuICBteW9zaW5TcGVlZDogMC4xLFxuICBtZW1icmFuZUNvdXBsaW5nOiAwLjIsXG4gIHN1YnN0cmF0ZURyYWc6IDIwLFxuICBjb3J0ZXhQb2x5bWVyaXphdGlvbjogMC4xLFxuICBtb25vbWVyT3BhY2l0eTogMSxcbiAgZ0FjdGluRmllbGQ6IDEsXG4gIGFyZWFDb25zZXJ2YXRpb246IDEsXG4gIHBvbGFyaXR5TW9kZTogMSxcbiAgcG9sYXJpdHlUdXJuUmF0ZTogMC4yLFxuICByZWFyVHVybm92ZXI6IDAuMixcbiAgdGV0aGVyVHVybm92ZXI6IDEsXG4gIHRldGhlck9uUmF0ZTogMSxcbiAgdGV0aGVyT2ZmUmF0ZTogMC4yLFxuICBtb3RvclJlYXJCaWFzOiAxLFxuICBmcm9udEFsaWdubWVudDogMSxcbiAgdGV0aGVyTG9hZE9mZjogMC4xLFxuICBjb2xvdXJBZ2U6IDEsXG59KSkge1xuICBjb25zdCB2YWx1ZXMgPSB1bmlmb3JtcyBhcyBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuICB2YWx1ZXNbbmFtZV0gPSBNYXRoLm1heCgwLCBNYXRoLm1pbihtYXhpbXVtLCB2YWx1ZXNbbmFtZV0pKTtcbn1cblxuY29uc3QgREVCVUdNT0RFID0gZmFsc2U7XG5jb25zdCBkZWJ1Z1NpemUgPSAyMDA7XG5jb25zdCBXT1JLR1JPVVBfU0laRSA9IDI1NjtcblxuYXN5bmMgZnVuY3Rpb24gaW5kZXgoKSB7XG4gIGNvbnN0IGlzTW9iaWxlRGV2aWNlID0gL0FuZHJvaWR8aVBob25lfGlQYWR8aVBvZHxPcGVyYSBNaW5pfElFTW9iaWxlfFdQRGVza3RvcC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gIGlmIChpc01vYmlsZURldmljZSkge1xuICAgIHVuaWZvcm1zLmNvbXB1dGVTdGVwc1BlckZyYW1lID0gMTtcbiAgfVxuXG4gIC8vIHNldHVwIGFuZCBjb25maWd1cmUgV2ViR1BVXG4gIGNvbnN0IGRldmljZSA9IGF3YWl0IHJlcXVlc3REZXZpY2UoKTtcbiAgLy8gR2V0IHRoZSBleGlzdGluZyBjYW52YXMgZnJvbSB0aGUgRE9NIGluc3RlYWQgb2YgY3JlYXRpbmcgYSBuZXcgb25lXG4gIGNvbnN0IGNhbnZhcyA9IGNvbmZpZ3VyZUNhbnZhcyhkZXZpY2UsIFwibWFpbi1jYW52YXNcIiwge1xuICAgIHdpZHRoOiBNYXRoLnJvdW5kKHdpbmRvdy5pbm5lcldpZHRoICogdW5pZm9ybXMuc2ltdWxhdGlvblNjYWxlKSxcbiAgICBoZWlnaHQ6IE1hdGgucm91bmQod2luZG93LmlubmVySGVpZ2h0ICogdW5pZm9ybXMuc2ltdWxhdGlvblNjYWxlKSxcbiAgfSk7XG5cbiAgbGV0IHRpbWUgPSAwO1xuICBsZXQgcGF1c2VkID0gdXJsUGFyYW1zLmhhcyhcInBhdXNlZFwiKTtcbiAgbGV0IG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gZmFsc2U7XG4gIGxldCBjb250cm9sc0RpcnR5ID0gZmFsc2U7XG4gIGxldCBjdWVWZXJzaW9uID0gMDtcbiAgY29uc3QgZnJhbWVCdWRnZXQgPSBuZXcgRnJhbWVCdWRnZXQoKTtcbiAgY29uc3QgbGl2ZVBlcmZvcm1hbmNlID0gbmV3IExpdmVQZXJmb3JtYW5jZSgpO1xuICBjb25zdCBydW50aW1lRXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBmdW5jdGlvbiBzZXRQYXVzZWQodmFsdWU6IGJvb2xlYW4pIHtcbiAgICBwYXVzZWQgPSB2YWx1ZTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhdXNlLWRlbW9cIikhLnRleHRDb250ZW50ID0gcGF1c2VkID8gXCJSZXN1bWVcIiA6IFwiUGF1c2VcIjtcbiAgICBpZiAoIXZhbHVlKSBsaXZlUGVyZm9ybWFuY2UuY2xlYXJGcmFtZXMoKTtcbiAgfVxuICBmdW5jdGlvbiBzdG9wU2ltdWxhdGlvbihlcnJvcjogdW5rbm93bikge1xuICAgIGNvbnN0IHRleHQgPSBTdHJpbmcoZXJyb3IpO1xuICAgIGlmICghcnVudGltZUVycm9ycy5pbmNsdWRlcyh0ZXh0KSkgcnVudGltZUVycm9ycy5wdXNoKHRleHQpO1xuICAgIHNldFBhdXNlZCh0cnVlKTtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9IGBTdG9wcGVkOiAke3RleHR9YDtcbiAgfVxuICBjb25zdCBncHVFcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIGRldmljZS5hZGRFdmVudExpc3RlbmVyKFwidW5jYXB0dXJlZGVycm9yXCIsIChldmVudCkgPT4ge1xuICAgIGdwdUVycm9ycy5wdXNoKGV2ZW50LmVycm9yLm1lc3NhZ2UpO1xuICAgIHBhdXNlZCA9IHRydWU7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSBgR1BVIGVycm9yOiAke2V2ZW50LmVycm9yLm1lc3NhZ2V9YDtcbiAgfSk7XG4gIGRldmljZS5sb3N0LnRoZW4oKGluZm8pID0+IGdwdUVycm9ycy5wdXNoKGBEZXZpY2UgbG9zdDogJHtpbmZvLm1lc3NhZ2V9YCkpO1xuXG4gIGNvbnN0IEdST1VQX0lOREVYID0gMDtcbiAgY29uc3QgQklORElOR1NfQlVGRkVSID0geyBDQU5WQVM6IDAsIENPTlRST0xTOiAxLCBJTlRFUkFDVElPTlM6IDIgfTtcbiAgY29uc3QgQklORElOR1NfVEVYVFVSRSA9IHtcbiAgICBJTkRFWDogMyxcbiAgICBTVEVSSUNfUE9URU5USUFMOiA0LFxuICAgIFBBUkFNRVRFUl9GSUVMRFM6IDUsXG4gIH07XG5cbiAgY29uc3QgQklORElOR1NfQUdFTlRTID0ge1xuICAgIFJBTkRPTTogNixcbiAgICBNRU1CUkFORTogNyxcbiAgICBBQ1RJTjogOCxcbiAgICBDT05ORUNUSU9OX0xPQ0tTOiA5LFxuICAgIFRFTEVNRVRSWTogMTIsXG4gICAgTUVDSEFOSUNBTF9TTkFQU0hPVDogMTMsXG4gICAgTUVDSEFOSUNBTF9MSU5LUzogMTQsXG4gICAgTUVDSEFOSUNBTF9GT1JDRVM6IDE1LFxuICB9O1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTZXQgdXAgbWVtb3J5IHJlc291cmNlc1xuICB2YXIgYWN0dWFsV2lkdGggPSBjYW52YXMuc2l6ZS53aWR0aDtcbiAgdmFyIGFjdHVhbEhlaWdodCA9IGNhbnZhcy5zaXplLmhlaWdodDtcbiAgaWYgKERFQlVHTU9ERSkge1xuICAgIGFjdHVhbFdpZHRoID0gZGVidWdTaXplO1xuICAgIGFjdHVhbEhlaWdodCA9IGRlYnVnU2l6ZTtcbiAgfVxuXG4gIGNvbnN0IHRleHR1cmVzID0gc2V0dXBUZXh0dXJlcyhcbiAgICBkZXZpY2UsXG4gICAgT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19URVhUVVJFKSxcbiAgICB7fSxcbiAgICB7XG4gICAgICBkZXB0aE9yQXJyYXlMYXllcnM6IHtcbiAgICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuU1RFUklDX1BPVEVOVElBTF06IDMsXG4gICAgICAgIFtCSU5ESU5HU19URVhUVVJFLlBBUkFNRVRFUl9GSUVMRFNdOiA2LFxuICAgICAgICBbQklORElOR1NfVEVYVFVSRS5JTkRFWF06IDQsXG4gICAgICB9LFxuICAgICAgd2lkdGg6IGFjdHVhbFdpZHRoLFxuICAgICAgaGVpZ2h0OiBhY3R1YWxIZWlnaHQsXG4gICAgfSxcbiAgICB7XG4gICAgICBbQklORElOR1NfVEVYVFVSRS5TVEVSSUNfUE9URU5USUFMXTogXCJyMzJmbG9hdFwiLFxuICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuUEFSQU1FVEVSX0ZJRUxEU106IFwicjMyZmxvYXRcIixcbiAgICAgIFtCSU5ESU5HU19URVhUVVJFLklOREVYXTogXCJyMzJ1aW50XCIsXG4gICAgfVxuICApO1xuXG4gIGNvbnN0IFRFWFRVUkVfV09SS0dST1VQX0NPVU5UOiBbbnVtYmVyLCBudW1iZXJdID0gW1xuICAgIE1hdGguY2VpbCh0ZXh0dXJlcy5zaXplLndpZHRoIC8gTWF0aC5zcXJ0KFdPUktHUk9VUF9TSVpFKSksXG4gICAgTWF0aC5jZWlsKHRleHR1cmVzLnNpemUuaGVpZ2h0IC8gTWF0aC5zcXJ0KFdPUktHUk9VUF9TSVpFKSksXG4gIF07XG5cbiAgY29uc3QgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCA9IHtcbiAgICBBQ1RJTjogTWF0aC5jZWlsKHVuaWZvcm1zLmFjdGluQ291bnQgLyBXT1JLR1JPVVBfU0laRSksXG4gICAgTUVNQlJBTkU6IE1hdGguY2VpbCh1bmlmb3Jtcy5tZW1icmFuZUNvdW50IC8gV09SS0dST1VQX1NJWkUpLFxuICB9O1xuICBjb25zdCBNQVhfQlVGRkVSX1dPUktHUk9VUF9DT1VOVCA9IE1hdGgubWF4KC4uLk9iamVjdC52YWx1ZXMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVCkpO1xuXG4gIC8vIHNldHVwIGludGVyYWN0aW9uc1xuICBjb25zdCBpbnRlcmFjdGlvbnMgPSBzZXR1cEludGVyYWN0aW9ucyhkZXZpY2UsIGNhbnZhcy5jb250ZXh0LmNhbnZhcywgdGV4dHVyZXMuc2l6ZSk7XG4gIGNvbnN0IGNhbnZhc19idWZmZXJzID0ge1xuICAgIFtCSU5ESU5HU19CVUZGRVIuQ0FOVkFTXTogdGV4dHVyZXMuY2FudmFzLmJ1ZmZlcixcbiAgICBbQklORElOR1NfQlVGRkVSLkNPTlRST0xTXTogaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlcixcbiAgICBbQklORElOR1NfQlVGRkVSLklOVEVSQUNUSU9OU106IGludGVyYWN0aW9ucy5pbnRlcmFjdGlvbnMuYnVmZmVyLFxuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHdyaXRlIHRoZSB1bmlmb3JtcyBvYmplY3QgaW50byB0aGUgQXJyYXlCdWZmZXIgYWNjb3JkaW5nIHRvIFdHU0wgc3RydWN0IGxheW91dFxuICBjb25zdCBjb250cm9sc0RhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGludGVyYWN0aW9ucy5jb250cm9scy5kYXRhKTtcbiAgY29uc3QgY2FudmFzVmlldyA9IG5ldyBEYXRhVmlldyh0ZXh0dXJlcy5jYW52YXMuZGF0YS5idWZmZXIpO1xuXG4gIGNvbnN0IHdyaXRlVW5pZm9ybXMgPSAoKSA9PiB7XG4gICAgLy8gV3JpdGUgY2FudmFzIHNpemVcbiAgICBjYW52YXNWaWV3LnNldEludDMyKDAsIGFjdHVhbFdpZHRoLCB0cnVlKTtcbiAgICBjYW52YXNWaWV3LnNldEludDMyKDQsIGFjdHVhbEhlaWdodCwgdHJ1ZSk7XG5cbiAgICAvLyBDYW52YXMua2V5IGlzIHZlYzI8dTMyPiwgYWxpZ25lZCB0byBieXRlIDE2LiBVSSBjaGFuZ2VzIGRvIG5vdCByZXNlZWQuXG4gICAgY2FudmFzVmlldy5zZXRVaW50MzIoMTYsIHNlZWQsIHRydWUpO1xuICAgIGNhbnZhc1ZpZXcuc2V0VWludDMyKDIwLCBzZWVkIF4gMHg5ZTM3NzliOSwgdHJ1ZSk7XG5cbiAgICAvLyBXcml0ZSBjb250cm9scyB3aXRoIGFkanVzdGVkIG9mZnNldHM6XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMCwgdW5pZm9ybXMubWVtYnJhbmVDb3VudCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNCwgdW5pZm9ybXMuYWN0aW5Db3VudCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDgsIHVuaWZvcm1zLnN0aWZmbmVzcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDEyLCB1bmlmb3Jtcy5mb29kTmVhcmJ5VGhyZXNob2xkLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMTYsIHVuaWZvcm1zLmRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIwLCB1bmlmb3Jtcy5wb2x5bWVyUmVwdWxzaW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEludDMyKDI0LCB1bmlmb3Jtcy5zdGVyaWNTYW1wbGluZ1JhbmdlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEludDMyKDI4LCB1bmlmb3Jtcy5hY3RpbkNvaGVzaW9uUmFuZ2UsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMiwgdW5pZm9ybXMuYmluZFByb2IsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDM2LCB1bmlmb3Jtcy5iaW5kTGVuZ3RoU2F0dXJhdGlvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNDgsIHVuaWZvcm1zLmJpbmRMZW5ndGhGbG9vciwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDQwLCB1bmlmb3Jtcy5hY3RpblN0ZXJpY0ZvcmNlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNDQsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNTYsIHVuaWZvcm1zLm1vbm9tZXJNZW1icmFuZVJlcHVsc2lvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNTIsIHVuaWZvcm1zLm1vdmVtZW50TW9kZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDYwLCB1bmlmb3Jtcy5tZW1icmFuZVN0aWZmbmVzcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDcyLCB1bmlmb3Jtcy5wb2x5bWVyaXphdGlvblBhdGNoU2l6ZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDc2LCB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMDgsIHVuaWZvcm1zLm1lbWJyYW5lU21vb3RoaW5nLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjE2LCB1bmlmb3Jtcy5wb2x5bWVyaXphdGlvbkZpZWxkRGVjYXksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMjAsIHVuaWZvcm1zLm1lbWJyYW5lRmxvdywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIyNCwgdW5pZm9ybXMubGFtZWxsaXBvZGl1bVN0cmVuZ3RoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjI4LCB1bmlmb3Jtcy5sYW1lbGxpcG9kaXVtV2lkdGgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMzIsIHVuaWZvcm1zLmxhbWVsbGlwb2RpdW1GaWVsZERlY2F5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjM2LCB1bmlmb3Jtcy5icmFuY2hQcm9iYWJpbGl0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI0MCwgdW5pZm9ybXMuZGVicmFuY2hQcm9iYWJpbGl0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI0NCwgdW5pZm9ybXMuYWN0aW5CZW5kU3RpZmZuZXNzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyNDgsIHVuaWZvcm1zLnN0ZXJpY1NlbGZOZWlnaGJvcnMsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNTIsIHVuaWZvcm1zLm15b3NpblN0cmVuZ3RoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjU2LCB1bmlmb3Jtcy5teW9zaW5TcGVlZCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI2MCwgdW5pZm9ybXMubWVtYnJhbmVDb3VwbGluZywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI2NCwgdW5pZm9ybXMuc3Vic3RyYXRlRHJhZywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI2OCwgdW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig2NCwgdW5pZm9ybXMubW9ub21lck9wYWNpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDY4LCB1bmlmb3Jtcy5nQWN0aW5GaWVsZCA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjEyLCB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjcyLCB1bmlmb3Jtcy5jdWVYLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjc2LCB1bmlmb3Jtcy5jdWVZLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyODAsIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjg0LCBjdWVWZXJzaW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyODgsIHVuaWZvcm1zLnBvbGFyaXR5TW9kZSA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjkyLCB1bmlmb3Jtcy5wb2xhcml0eVR1cm5SYXRlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjk2LCB1bmlmb3Jtcy5yZWFyVHVybm92ZXIsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMDAsIE1hdGgubWF4KDEsIHVuaWZvcm1zLnR1cm5vdmVyQWdlKSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMzA0LCB1bmlmb3Jtcy50ZXRoZXJUdXJub3ZlciA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzA4LCB1bmlmb3Jtcy50ZXRoZXJPblJhdGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMTIsIHVuaWZvcm1zLnRldGhlck9mZlJhdGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDMxNiwgTWF0aC5tYXgoMCwgdW5pZm9ybXMudGV0aGVyUmVjb3ZlcnlTdGVwcyksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMjAsIHVuaWZvcm1zLm1vdG9yUmVhckJpYXMsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMjQsIHVuaWZvcm1zLmZyb250QWxpZ25tZW50LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzI4LCB1bmlmb3Jtcy50ZXRoZXJMb2FkT2ZmLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzMzIsIHVuaWZvcm1zLmNvbG91ckFnZSA/IDEgOiAwLCB0cnVlKTtcblxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihpbnRlcmFjdGlvbnMuY29udHJvbHMuYnVmZmVyLCAwLCBpbnRlcmFjdGlvbnMuY29udHJvbHMuZGF0YSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKHRleHR1cmVzLmNhbnZhcy5idWZmZXIsIDAsIHRleHR1cmVzLmNhbnZhcy5kYXRhKTtcbiAgfTtcblxuICB3cml0ZVVuaWZvcm1zKCk7XG5cbiAgLy8gc2V0dXAgYWdlbnRzXG4gIGNvbnN0IHJhbmRvbUJ1ZmZlclNpemUgPSBNYXRoLm1heCh0ZXh0dXJlcy5zaXplLndpZHRoICogdGV4dHVyZXMuc2l6ZS5oZWlnaHQsIHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICsgMjU2KTtcblxuICAvLyBpbml0aWFsaXplIHJhbmRvbSBidWZmZXJcbiAgY29uc3QgcmFuZG9tRGF0YSA9IGdldFJhbmRvbVZhbHVlcyhyYW5kb21CdWZmZXJTaXplLCBpbml0aWFsUmFuZG9tKTtcblxuICBjb25zdCBudW1GbG9hdHMgPSAxMDsgLy8gU2VnbWVudCBzdHJ1Y3Qgc2l6ZSBpbiAzMi1iaXQgd29yZHNcblxuICBjb25zdCBhZ2VudF9idWZmZXJzID0ge1xuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9TTkFQU0hPVF06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogMzIgKiAodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKyAyKSxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiAzMiAqICgyNTYgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50KSxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfRk9SQ0VTXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAvLyBQcmVmaXg6IHBoeXNpY2FsIGZvcmNlIGFjY3VtdWxhdG9ycy4gVGFpbDogY29uc2VydmF0aXZlIG1lbWJyYW5lLWVkZ2VcbiAgICAgIC8vIHJvdyBzaG9ydGxpc3RzOyBleGFjdCB0ZXN0cyBmYWxsIGJhY2sgdG8gYWxsIGVkZ2VzIG9uIG92ZXJmbG93LlxuICAgICAgc2l6ZTogOCAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIE1hdGguY2VpbChhY3R1YWxIZWlnaHQgLyA0KSAqIDI1NyksXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuUkFORE9NXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBsYWJlbDogXCJSYW5kb20gQnVmZmVyXCIsXG4gICAgICBzaXplOiByYW5kb21EYXRhLmJ5dGVMZW5ndGgsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuQUNUSU5dOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IHNpemUzMiAqIG51bUZsb2F0cyAqIHVuaWZvcm1zLmFjdGluQ291bnQsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogc2l6ZTMyICogbnVtRmxvYXRzICogdW5pZm9ybXMubWVtYnJhbmVDb3VudCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLkNPTk5FQ1RJT05fTE9DS1NdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxhYmVsOiBcIkFjdGluIENvbm5lY3Rpb24gTG9ja3MgQnVmZmVyXCIsXG4gICAgICBzaXplOiBzaXplMzIgKiB1bmlmb3Jtcy5hY3RpbkNvdW50LFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UsXG4gICAgfSksXG4gIH0gYXMgUmVjb3JkPG51bWJlciwgR1BVQnVmZmVyPjtcblxuICBjb25zdCB0ZWxlbWV0cnkgPSBuZXcgQWN0aW5UZWxlbWV0cnkoXG4gICAgZGV2aWNlLFxuICAgIGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSxcbiAgICB1bmlmb3Jtcy5hY3RpbkNvdW50LFxuICAgIGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSxcbiAgICB1bmlmb3Jtcy5tZW1icmFuZUNvdW50LFxuICAgIHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCxcbiAgICB1cmxQYXJhbXMuZ2V0KFwicnVuXCIpID8/IFwiZGVmYXVsdFwiLFxuICAgIDMwLFxuICAgICEhdW5pZm9ybXMuZ0FjdGluRmllbGRcbiAgKTtcbiAgdGVsZW1ldHJ5Lm9uU2FtcGxlID0gKHMpID0+IHtcbiAgICBpZiAocmVjb3ZlcnkuYWN0aXZlIHx8IHMuZGlhZ25vc3RpY0tpbmQgPT09IFwiY29udGFjdC1yZWNoZWNrXCIpIHJldHVybjtcbiAgICBpZiAodW5pZm9ybXMuZ0FjdGluRmllbGQgJiYgY2xhc3NpZnlDaGVja3BvaW50KHMsICEhdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbikgPT09IFwiY29udGFjdHNcIikge1xuICAgICAgdm9pZCByZWNvdmVyeS5yZXF1ZXN0KHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbnZhbGlkID1cbiAgICAgICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCAmJiBjbGFzc2lmeUNoZWNrcG9pbnQocywgISF1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSA9PT0gXCJmYXRhbFwiKSB8fFxuICAgICAgcy5hY3RpbkJhbGFuY2VFcnJvciB8fFxuICAgICAgcy5icm9rZW5MaW5rcyB8fFxuICAgICAgcy5jeWNsZXMgfHxcbiAgICAgICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCAmJiAocy5pbnNpZGVQb2x5bWVyQmVhZHMgIT09IHMuaW5Qb2x5bWVyIHx8IHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzKSkgfHxcbiAgICAgICh1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uICYmIE1hdGguYWJzKHMuY2VsbC5hcmVhIC0gMSkgPiAwLjAwMSkgfHxcbiAgICAgICFOdW1iZXIuaXNGaW5pdGUocy5jZWxsLmNlbnRyb2lkWCk7XG4gICAgaWYgKGludmFsaWQpXG4gICAgICBzdG9wU2ltdWxhdGlvbihcbiAgICAgICAgYE51bWVyaWNhbCBjaGVjayBmYWlsZWQgYXQgc3RlcCAke3Muc3RlcH06ICR7SlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG1hc3M6IHMuYWN0aW5CYWxhbmNlRXJyb3IsXG4gICAgICAgICAgaW5zaWRlRjogcy5pbnNpZGVQb2x5bWVyQmVhZHMsXG4gICAgICAgICAgdG90YWxGOiBzLmluUG9seW1lcixcbiAgICAgICAgICBjcm9zc2luZ3M6IHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzLFxuICAgICAgICAgIGJyb2tlbkxpbmtzOiBzLmJyb2tlbkxpbmtzLFxuICAgICAgICAgIGN5Y2xlczogcy5jeWNsZXMsXG4gICAgICAgICAgYXJlYTogcy5jZWxsLmFyZWEsXG4gICAgICAgICAgY2VudHJvaWRYOiBzLmNlbGwuY2VudHJvaWRYLFxuICAgICAgICB9KX07IHJlc2V0IHRvIHJlcGxheS5gXG4gICAgICApO1xuICB9O1xuICBsZXQgY29udGFjdEJhY2t1cDogQXJyYXlCdWZmZXIgfCBudWxsID0gbnVsbDtcbiAgYXN5bmMgZnVuY3Rpb24gcmVhZEFjdGluKCkge1xuICAgIGNvbnN0IHNvdXJjZSA9IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXTtcbiAgICBjb25zdCBzdGFnZSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBzb3VyY2Uuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHNvdXJjZSwgMCwgc3RhZ2UsIDAsIHNvdXJjZS5zaXplKTtcbiAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgIGF3YWl0IHN0YWdlLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgICByZXR1cm4gc3RhZ2UuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc3RhZ2UuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuICBjb25zdCByZWNvdmVyeSA9IG5ldyBDb250YWN0UmVjb3Zlcnkoe1xuICAgIGluc3BlY3Q6IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICBhd2FpdCB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlLCB0cnVlKTtcbiAgICAgIGlmIChncHVFcnJvcnMubGVuZ3RoKSB0aHJvdyBFcnJvcihncHVFcnJvcnMuam9pbihcIlxcblwiKSk7XG4gICAgICByZXR1cm4gdGVsZW1ldHJ5Lmhpc3RvcnkuYXQoLTEpITtcbiAgICB9LFxuICAgIGJlZ2luOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb250YWN0QmFja3VwID0gYXdhaXQgcmVhZEFjdGluKCk7XG4gICAgfSxcbiAgICByZXBhaXI6IGFzeW5jIChpdGVyYXRpb25zKSA9PiB7XG4gICAgICBydW5Db250YWN0UmVwYWlyKGRldmljZSwgc2ltUGlwZWxpbmVzLCBiaW5kR3JvdXBTaW11bGF0ZSwgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCwgY2FudmFzLmNhbnZhcy5oZWlnaHQsIGl0ZXJhdGlvbnMpO1xuICAgICAgY29uc3QgY3VycmVudCA9IGF3YWl0IHJlYWRBY3RpbigpLFxuICAgICAgICBiZWZvcmUgPSBuZXcgRmxvYXQzMkFycmF5KGNvbnRhY3RCYWNrdXAhKSxcbiAgICAgICAgYWZ0ZXIgPSBuZXcgRmxvYXQzMkFycmF5KGN1cnJlbnQpO1xuICAgICAgY29uc3QgYnUgPSBuZXcgVWludDMyQXJyYXkoY29udGFjdEJhY2t1cCEpLFxuICAgICAgICBhdSA9IG5ldyBVaW50MzJBcnJheShjdXJyZW50KTtcbiAgICAgIGxldCBtYXhpbXVtID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWZ0ZXIubGVuZ3RoOyBpICs9IDEwKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTA7IGorKykgaWYgKGogIT09IDIgJiYgaiAhPT0gMyAmJiBidVtpICsgal0gIT09IGF1W2kgKyBqXSkgdGhyb3cgRXJyb3IoXCJDb250YWN0IHJlcGFpciBjaGFuZ2VkIGFjdGluIG1ldGFkYXRhXCIpO1xuICAgICAgICBjb25zdCBkaXNwbGFjZW1lbnQgPSBNYXRoLmh5cG90KGFmdGVyW2kgKyAyXSAtIGJlZm9yZVtpICsgMl0sIGFmdGVyW2kgKyAzXSAtIGJlZm9yZVtpICsgM10pO1xuICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShkaXNwbGFjZW1lbnQpKSB0aHJvdyBFcnJvcihcIk5vbi1maW5pdGUgY29udGFjdCBjb3JyZWN0aW9uXCIpO1xuICAgICAgICBtYXhpbXVtID0gTWF0aC5tYXgobWF4aW11bSwgZGlzcGxhY2VtZW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXhpbXVtO1xuICAgIH0sXG4gICAgcm9sbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGlmIChjb250YWN0QmFja3VwKSBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLCAwLCBjb250YWN0QmFja3VwKTtcbiAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgfSxcbiAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICBjb250YWN0QmFja3VwID0gbnVsbDtcbiAgICB9LFxuICAgIGZpeGVkQXJlYTogKCkgPT4gISF1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uLFxuICAgIG1heERpc3BsYWNlbWVudDogKCkgPT4gOCxcbiAgICBub3c6ICgpID0+IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgIG5vdGljZTogKG1lc3NhZ2UpID0+IHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICB9LFxuICAgIGZhaWw6IHN0b3BTaW11bGF0aW9uLFxuICB9KTtcbiAgYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuVEVMRU1FVFJZXSA9IHRlbGVtZXRyeS5jb3VudGVyQnVmZmVyO1xuXG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5SQU5ET01dLCAvKm9mZnNldD0qLyAwLCAvKmRhdGE9Ki8gcmFuZG9tRGF0YSk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIE92ZXJhbGwgbWVtb3J5IGxheW91dFxuICBjb25zdCB2aXNpYmlsaXR5ID0gR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5UO1xuXG4gIC8vIFRoaXMgbGF5b3V0IGlzIGZvciBzaGFyZWQgcmVzb3VyY2VzIGJldHdlZW4gc2ltdWxhdGlvbiBhbmQgcmVuZGVyaW5nXG4gIGNvbnN0IHNoYXJlZExheW91dEVudHJpZXMgPSBbXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19CVUZGRVIpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgIGJpbmRpbmc6IGJpbmRpbmcsXG4gICAgICB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFIHwgR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsXG4gICAgICBidWZmZXI6IHsgdHlwZTogXCJ1bmlmb3JtXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGUgfSxcbiAgICB9KSksXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19URVhUVVJFKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgc3RvcmFnZVRleHR1cmU6IHRleHR1cmVzLmJpbmRpbmdMYXlvdXRbYmluZGluZ10sXG4gICAgfSkpLFxuICBdO1xuXG4gIGNvbnN0IHNoYXJlZEJpbmRHcm91cEVudHJpZXMgPSBbXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19URVhUVVJFKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nLFxuICAgICAgcmVzb3VyY2U6IHRleHR1cmVzLnRleHR1cmVzW2JpbmRpbmddLmNyZWF0ZVZpZXcoKSxcbiAgICB9KSksXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19CVUZGRVIpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgIGJpbmRpbmcsXG4gICAgICByZXNvdXJjZTogeyBidWZmZXI6IGNhbnZhc19idWZmZXJzW2JpbmRpbmddIH0sXG4gICAgfSkpLFxuICBdO1xuXG4gIGNvbnN0IGJpbmRHcm91cExheW91dFNpbXVsYXRlID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgbGFiZWw6IFwiYmluZEdyb3VwTGF5b3V0U2ltdWxhdGVcIixcbiAgICBlbnRyaWVzOiBbXG4gICAgICAuLi5zaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19BR0VOVFMpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgICAgYmluZGluZzogYmluZGluZyxcbiAgICAgICAgdmlzaWJpbGl0eTogdmlzaWJpbGl0eSxcbiAgICAgICAgYnVmZmVyOiB7IHR5cGU6IFwic3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlIH0sXG4gICAgICB9KSksXG4gICAgXSxcbiAgfSk7XG5cbiAgY29uc3QgYmluZEdyb3VwU2ltdWxhdGUgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICBsYWJlbDogYEJpbmQgR3JvdXBgLFxuICAgIGxheW91dDogYmluZEdyb3VwTGF5b3V0U2ltdWxhdGUsXG4gICAgZW50cmllczogW1xuICAgICAgLi4uc2hhcmVkQmluZEdyb3VwRW50cmllcyxcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQUdFTlRTKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICAgIGJpbmRpbmcsXG4gICAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogYWdlbnRfYnVmZmVyc1tiaW5kaW5nXSB9LFxuICAgICAgfSkpLFxuICAgIF0sXG4gIH0pO1xuXG4gIGNvbnN0IHBpcGVsaW5lTGF5b3V0U2ltdWxhdGUgPSBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgIGxhYmVsOiBcInBpcGVsaW5lTGF5b3V0XCIsXG4gICAgYmluZEdyb3VwTGF5b3V0czogW2JpbmRHcm91cExheW91dFNpbXVsYXRlXSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbGluZUNvbnN0cmFpbnRGdW5jdGlvbihwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIpIHtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5vcmllbnRhdGlvblVwZGF0ZSk7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoTUFYX0JVRkZFUl9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmNvc3NlcmF0VXBkYXRlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVuaWZvcm1zLmFjdGluQ29zc2VyYXRJdGVyYXRpb25zOyBpKyspIHtcbiAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4pO1xuICAgIH1cbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5saW5lQ29uc3RyYWludCk7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoTUFYX0JVRkZFUl9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1lbWJyYW5lVGFuZ2VudGlhbEZsb3cpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pZm9ybXMubWVtYnJhbmVGbG93SXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU2V0IHVwIGNvZGUgaW5zdHJ1Y3Rpb25zXG4gIGNvbnN0IG1vZHVsZSA9IGF3YWl0IGNyZWF0ZVNoYWRlcihkZXZpY2UsIHNpbXVsYXRlQ29kZSwgc2hhZGVySW5jbHVkZXMpO1xuXG4gIGNvbnN0IHNpbVBpcGVsaW5lcyA9IGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXMoZGV2aWNlLCBtb2R1bGUsIHBpcGVsaW5lTGF5b3V0U2ltdWxhdGUpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBSVU4gdGhlIHJlc2V0IHNoYWRlciBmdW5jdGlvblxuICBjb25zdCByZXNldCA9ICgpID0+IHtcbiAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdLCAwLCBuZXcgVWludDMyQXJyYXkoOCAqICgyNTYgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50KSkpO1xuXG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcblxuICAgIHBhc3Muc2V0QmluZEdyb3VwKEdST1VQX0lOREVYLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG5cbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5yZXNldEFjdGluKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcblxuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnJlc2V0TWVtYnJhbmUpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuXG4gICAgcGFzcy5lbmQoKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgaWYgKHVuaWZvcm1zLmdBY3RpbkZpZWxkIHx8IHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pIHJ1bkVuY2xvc3VyZShkZXZpY2UsIHNpbVBpcGVsaW5lcywgYmluZEdyb3VwU2ltdWxhdGUsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsIGFjdHVhbEhlaWdodCk7XG4gICAgdGVsZW1ldHJ5LnJlc2V0KCk7XG4gIH07XG4gIHJlc2V0KCk7XG5cbiAgY29uc3QgcmVuZGVyU2hhZGVyID0gYXdhaXQgY3JlYXRlU2hhZGVyKGRldmljZSwgcmVuZGVyQ29kZSwgc2hhZGVySW5jbHVkZXMpO1xuICBjb25zdCByZW5kZXJNb2R1bGUgPSBuZXcgUmVuZGVyTW9kdWxlKFxuICAgIGRldmljZSxcbiAgICBjYW52YXMuZm9ybWF0LFxuICAgIHsgd2lkdGg6IGFjdHVhbFdpZHRoLCBoZWlnaHQ6IGFjdHVhbEhlaWdodCB9LFxuICAgIHJlbmRlclNoYWRlcixcbiAgICB0ZXh0dXJlcyxcbiAgICBzaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgIHNoYXJlZEJpbmRHcm91cEVudHJpZXNcbiAgKTtcblxuICAvLyBTaG93IHRoZSBpbml0aWFsIHNvbHVibGUgY29tcGFydG1lbnQgZXZlbiB3aGVuIG9wZW5lZCBwYXVzZWQuIFRoaXMgd3JpdGVzXG4gIC8vIG9ubHkgdGhlIHZpc3VhbGl6YXRpb24gbWFzaywgbm90IHJlYWN0aW9uL3N0ZXJpYyBmaWVsZHMgb3IgcGh5c2ljYWwgc3RhdGUuXG4gIGlmICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCkge1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmRyYXdSZXNlcnZvaXIpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKC4uLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzLmVuZCgpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICByZW5kZXJNb2R1bGUucmVuZGVyKGNhbnZhcy5jb250ZXh0KTtcbiAgfVxuXG4gIHZhciBmcmFtZU5yID0gMDtcbiAgY29uc3Qgc3Byb3V0cyA9IG5ldyBTcHJvdXRTY2hlZHVsZXIodW5pZm9ybXMuc3Byb3V0T25TdGVwcyArIHVuaWZvcm1zLnNwcm91dE9mZlN0ZXBzLCBzZWVkZWRSYW5kb20oc2VlZCBeIDB4YTM0MTMxNmMpKTtcbiAgY29uc3Qgc3Byb3V0U2l0ZXMgPSBuZXcgRmxvYXQzMkFycmF5KGludGVyYWN0aW9ucy5jb250cm9scy5kYXRhLCA4MCwgNCAqIE1BWF9TUFJPVVRfU0lURVMpO1xuXG4gIC8vIFJVTiB0aGUgc2ltIGNvbXB1dGUgZnVuY3Rpb24gYW5kIHJlbmRlciBwaXhlbHNcbiAgYXN5bmMgZnVuY3Rpb24gdGltZXN0ZXAoc3RlcENvdW50ID0gdW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWUpIHtcbiAgICBpZiAocmVjb3ZlcnkuYWN0aXZlKSByZXR1cm47XG4gICAgdGltZSsrO1xuICAgIGlmIChjb250cm9sc0RpcnR5KSB7XG4gICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICBjb250cm9sc0RpcnR5ID0gZmFsc2U7XG4gICAgfVxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihpbnRlcmFjdGlvbnMuaW50ZXJhY3Rpb25zLmJ1ZmZlciwgMCwgaW50ZXJhY3Rpb25zLmludGVyYWN0aW9ucy5kYXRhKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc3RlcENvdW50OyBpKyspIHtcbiAgICAgIHNwcm91dHMudXBkYXRlKGZyYW1lTnIsIHVuaWZvcm1zLCBzcHJvdXRTaXRlcyk7XG4gICAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlciwgODAsIHNwcm91dFNpdGVzKTtcbiAgICAgIHJ1blNpbXVsYXRpb25TdGVwKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHNpbVBpcGVsaW5lcyxcbiAgICAgICAgYmluZEdyb3VwU2ltdWxhdGUsXG4gICAgICAgIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsXG4gICAgICAgIFRFWFRVUkVfV09SS0dST1VQX0NPVU5ULFxuICAgICAgICBsaW5lQ29uc3RyYWludEZ1bmN0aW9uLFxuICAgICAgICBmcmFtZU5yLFxuICAgICAgICBpID09PSBzdGVwQ291bnQgLSAxLFxuICAgICAgICAhISh1bmlmb3Jtcy5nQWN0aW5GaWVsZCB8fCB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSxcbiAgICAgICAgISF1bmlmb3Jtcy5wb2xhcml0eU1vZGVcbiAgICAgICk7XG4gICAgICBmcmFtZU5yKys7XG4gICAgfVxuXG4gICAgcmVuZGVyTW9kdWxlLnJlbmRlcihjYW52YXMuY29udGV4dCk7XG4gICAgdGVsZW1ldHJ5LnNuYXBzaG90KHRpbWUsIGNhbnZhcy5jYW52YXMpO1xuICAgIGlmICghcGF1c2VkKSB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlKS5jYXRjaChzdG9wU2ltdWxhdGlvbik7XG4gICAgaWYgKHRpbWUgJSAzMCA9PT0gMClcbiAgICAgIG1lY2hhbmljYWxTdW1tYXJ5KClcbiAgICAgICAgLnRoZW4oKHsgbW90b3JzLCB0ZXRoZXJzIH0pID0+IHtcbiAgICAgICAgICBjb25zdCBzdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpO1xuICAgICAgICAgIGlmIChzdGF0dXMpXG4gICAgICAgICAgICBzdGF0dXMudGV4dENvbnRlbnQgPSBgU2VlZCAke3NlZWR9IMK3ICR7bW90b3JzfSBtb3RvciBsaW5rcyDCtyAke3RldGhlcnN9IHRldGhlcnMgwrcgY29ydGV4ICR7dW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24gPiAwID8gXCJvblwiIDogXCJvZmZcIn1gO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3RvcFNpbXVsYXRpb24pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gbWVjaGFuaWNhbFN1bW1hcnkoKSB7XG4gICAgY29uc3QgYnVmZmVyID0gYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU107XG4gICAgY29uc3Qgc3RhZ2luZyA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBidWZmZXIuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGJ1ZmZlciwgMCwgc3RhZ2luZywgMCwgYnVmZmVyLnNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBzdGFnaW5nLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3Qgd29yZHMgPSBuZXcgVWludDMyQXJyYXkoc3RhZ2luZy5nZXRNYXBwZWRSYW5nZSgpKTtcbiAgICBsZXQgbW90b3JzID0gMCxcbiAgICAgIHRldGhlcnMgPSAwLFxuICAgICAgcG9zdGVyaW9yVGV0aGVycyA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGggLyA4OyBpKyspIHtcbiAgICAgIGlmICh3b3Jkc1tpICogOF0pIHtcbiAgICAgICAgaWYgKGkgPCAyNTYpIG1vdG9ycysrO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0ZXRoZXJzKys7XG4gICAgICAgICAgY29uc3QgYXJjID0gKGkgLSAyNTYpIC8gdW5pZm9ybXMubWVtYnJhbmVDb3VudDtcbiAgICAgICAgICBpZiAoYXJjID4gMC4yNSAmJiBhcmMgPCAwLjc1KSBwb3N0ZXJpb3JUZXRoZXJzKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgc3RhZ2luZy51bm1hcCgpO1xuICAgIHN0YWdpbmcuZGVzdHJveSgpO1xuICAgIHJldHVybiB7IG1vdG9ycywgdGV0aGVycywgcG9zdGVyaW9yVGV0aGVycyB9O1xuICB9XG5cbiAgY29uc3QgY3VlTWFya2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjdWUtbWFya2VyXCIpITtcbiAgZnVuY3Rpb24gZGlzcGxheUN1ZSgpIHtcbiAgICBjdWVNYXJrZXIuaGlkZGVuID0gIXVuaWZvcm1zLmN1ZUVuYWJsZWQ7XG4gICAgY29uc3QgcmVjdCA9IGNhbnZhcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY3VlTWFya2VyLnN0eWxlLmxlZnQgPSBgJHtyZWN0LmxlZnQgKyAodW5pZm9ybXMuY3VlWCAvIGFjdHVhbFdpZHRoKSAqIHJlY3Qud2lkdGh9cHhgO1xuICAgIGN1ZU1hcmtlci5zdHlsZS50b3AgPSBgJHtyZWN0LnRvcCArICh1bmlmb3Jtcy5jdWVZIC8gYWN0dWFsSGVpZ2h0KSAqIHJlY3QuaGVpZ2h0fXB4YDtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImN1ZS1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gdW5pZm9ybXMucG9sYXJpdHlNb2RlXG4gICAgICA/IFwiUGVyc2lzdGVudCBoZWFkaW5nIMK3IGRyYWcgdG8gc2V0IGEgbmV3IGRpcmVjdGlvbiDCtyBFc2MgZmFjZXMgcmlnaHRcIlxuICAgICAgOiB1bmlmb3Jtcy5jdWVFbmFibGVkXG4gICAgICAgID8gXCJQb2xhcml0eSBjdWUgYWN0aXZlIMK3IGRyYWcgdG8gbW92ZSDCtyBFc2MgdG8gY2xlYXJcIlxuICAgICAgICA6IFwiQ2xpY2sgb3IgZHJhZyB0aGUgY2FudmFzIHRvIG1vdmUgdGhlIGFjdGl2ZSBlZGdlXCI7XG4gIH1cbiAgZnVuY3Rpb24gc2V0Q3VlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUoeCkgfHwgIU51bWJlci5pc0Zpbml0ZSh5KSkgdGhyb3cgbmV3IEVycm9yKFwiQ3VlIGNvb3JkaW5hdGVzIG11c3QgYmUgZmluaXRlXCIpO1xuICAgIHVuaWZvcm1zLmN1ZVggPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhY3R1YWxXaWR0aCwgeCkpO1xuICAgIHVuaWZvcm1zLmN1ZVkgPSBNYXRoLm1heCgwLCBNYXRoLm1pbihhY3R1YWxIZWlnaHQsIHkpKTtcbiAgICB1bmlmb3Jtcy5jdWVFbmFibGVkID0gMTtcbiAgICBjdWVWZXJzaW9uKys7XG4gICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gICAgZGlzcGxheUN1ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGNsZWFyQ3VlKCkge1xuICAgIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPSAwO1xuICAgIGN1ZVZlcnNpb24rKztcbiAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICBkaXNwbGF5Q3VlKCk7XG4gIH1cbiAgYXN5bmMgZnVuY3Rpb24gY3VlU3RhdGUoKSB7XG4gICAgY29uc3Qgc3RhZ2luZyA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiAzMiwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdLCAzMiAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIDEpLCBzdGFnaW5nLCAwLCAzMik7XG4gICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICBhd2FpdCBzdGFnaW5nLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgICBjb25zdCBkYXRhID0gc3RhZ2luZy5nZXRNYXBwZWRSYW5nZSgpLFxuICAgICAgICB1ID0gbmV3IFVpbnQzMkFycmF5KGRhdGEpLFxuICAgICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICAgIHJldHVybiB7IGluZGV4OiB1WzRdLCB2ZXJzaW9uOiB1WzVdLCB4OiBmWzBdLCB5OiBmWzFdLCBheGlzWDogZlsyXSwgYXhpc1k6IGZbM10sIGVuYWJsZWQ6ICEhdW5pZm9ybXMuY3VlRW5hYmxlZCwgc3RlcDogZnJhbWVOciB9O1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAoc3RhZ2luZy5tYXBTdGF0ZSA9PT0gXCJtYXBwZWRcIikgc3RhZ2luZy51bm1hcCgpO1xuICAgICAgc3RhZ2luZy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG4gIGNhbnZhcy5jYW52YXMuc3R5bGUudG91Y2hBY3Rpb24gPSBcIm5vbmVcIjtcbiAgbGV0IGRyYWdnaW5nID0gZmFsc2U7XG4gIGNvbnN0IHBvaW50Q3VlID0gKGU6IFBvaW50ZXJFdmVudCkgPT4ge1xuICAgIGNvbnN0IHJlY3QgPSBjYW52YXMuY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHNldEN1ZSgoKGUuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoKSAqIGFjdHVhbFdpZHRoLCAoKGUuY2xpZW50WSAtIHJlY3QudG9wKSAvIHJlY3QuaGVpZ2h0KSAqIGFjdHVhbEhlaWdodCk7XG4gIH07XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJkb3duXCIsIChlKSA9PiB7XG4gICAgaWYgKGUuYnV0dG9uICE9PSAwKSByZXR1cm47XG4gICAgZHJhZ2dpbmcgPSB0cnVlO1xuICAgIGNhbnZhcy5jYW52YXMuc2V0UG9pbnRlckNhcHR1cmUoZS5wb2ludGVySWQpO1xuICAgIHBvaW50Q3VlKGUpO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcm1vdmVcIiwgKGUpID0+IHtcbiAgICBpZiAoZHJhZ2dpbmcpIHBvaW50Q3VlKGUpO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcnVwXCIsICgpID0+IHtcbiAgICBkcmFnZ2luZyA9IGZhbHNlO1xuICB9KTtcbiAgY2FudmFzLmNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFwicG9pbnRlcmNhbmNlbFwiLCAoKSA9PiB7XG4gICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSk7XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImxvc3Rwb2ludGVyY2FwdHVyZVwiLCAoKSA9PiB7XG4gICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIGRpc3BsYXlDdWUpO1xuICBkaXNwbGF5Q3VlKCk7XG5cbiAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtbyA9IHtcbiAgICBzZWVkLFxuICAgIHVuaWZvcm1zLFxuICAgIGdwdUVycm9ycyxcbiAgICBydW50aW1lRXJyb3JzLFxuICAgIGNvbnRhY3RSZWNvdmVyeTogcmVjb3ZlcnksXG4gICAgc2V0Q3VlLFxuICAgIGNsZWFyQ3VlLFxuICAgIGN1ZVN0YXRlLFxuICAgIGdldCBwYXVzZWQoKSB7XG4gICAgICByZXR1cm4gcGF1c2VkO1xuICAgIH0sXG4gICAgZ2V0IHN0ZXAoKSB7XG4gICAgICByZXR1cm4gZnJhbWVOcjtcbiAgICB9LFxuICAgIHBlcmZvcm1hbmNlU25hcHNob3Q6ICgpID0+ICh7IC4uLmxpdmVQZXJmb3JtYW5jZS5zbmFwc2hvdCgpLCBkaWFnbm9zdGljczogeyAuLi50ZWxlbWV0cnkudGltaW5ncyB9IH0pLFxuICAgIHBhdXNlOiAoKSA9PiB7XG4gICAgICBzZXRQYXVzZWQodHJ1ZSk7XG4gICAgfSxcbiAgICBwbGF5OiAoKSA9PiB7XG4gICAgICBzZXRQYXVzZWQoZmFsc2UpO1xuICAgIH0sXG4gICAgYXN5bmMgYWR2YW5jZShzdGVwczogbnVtYmVyKSB7XG4gICAgICBpZiAoIXBhdXNlZCB8fCByZWNvdmVyeS5hY3RpdmUgfHwgbWFudWFsQWR2YW5jZVBlbmRpbmcgfHwgIU51bWJlci5pc0ludGVnZXIoc3RlcHMpIHx8IHN0ZXBzIDwgMCB8fCBzdGVwcyA+IDIwMDApXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlBhdXNlIGFuZCByZXF1ZXN0IG9uZSBiYXRjaCBvZiAw4oCTMjAwMCB3aG9sZSBzdGVwc1wiKTtcbiAgICAgIG1hbnVhbEFkdmFuY2VQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICAgIGZvciAobGV0IHJlbWFpbmluZyA9IHN0ZXBzOyByZW1haW5pbmcgPiAwOyApIHtcbiAgICAgICAgICBhd2FpdCByZWNvdmVyeS53YWl0KCk7XG4gICAgICAgICAgaWYgKHJ1bnRpbWVFcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IocnVudGltZUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgICBjb25zdCBiYXRjaCA9IE1hdGgubWluKDIwLCByZW1haW5pbmcpO1xuICAgICAgICAgIGF3YWl0IHRpbWVzdGVwKGJhdGNoKTtcbiAgICAgICAgICByZW1haW5pbmcgLT0gYmF0Y2g7XG4gICAgICAgICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICAgICAgICBpZiAoZ3B1RXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGdwdUVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgfVxuICAgICAgICBhd2FpdCB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlKTtcbiAgICAgICAgYXdhaXQgcmVjb3Zlcnkud2FpdCgpO1xuICAgICAgICBpZiAocnVudGltZUVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihydW50aW1lRXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIikhLnRleHRDb250ZW50ID0gYFBhdXNlZCDCtyBzdGVwICR7ZnJhbWVOcn1gO1xuICAgICAgICByZXR1cm4geyBzdGF0czogdGVsZW1ldHJ5Lmhpc3RvcnkuYXQoLTEpLCBsaW5rczogYXdhaXQgbWVjaGFuaWNhbFN1bW1hcnkoKSwgZ3B1RXJyb3JzIH07XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBtYW51YWxBZHZhbmNlUGVuZGluZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG5cbiAgaWYgKHVybFBhcmFtcy5oYXMoXCJtZWNoYW5pY3NUZXN0XCIpKSB7XG4gICAgKHdpbmRvdyBhcyBhbnkpLmZpbGFtZW50RGVtby50ZXN0UmVuZXdhbCA9ICgpID0+IHtcbiAgICAgIGlmICghcGF1c2VkKSB0aHJvdyBFcnJvcihcIlBhdXNlIGJlZm9yZSBkZXN0cnVjdGl2ZSByZW5ld2FsIGZpeHR1cmVzXCIpO1xuICAgICAgcmV0dXJuIHRlc3RSZW5ld2FsKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpbjogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLFxuICAgICAgICAgIG1lbWJyYW5lOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0sXG4gICAgICAgICAgbGlua3M6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdLFxuICAgICAgICAgIHNuYXBzaG90OiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX1NOQVBTSE9UXSxcbiAgICAgICAgfSxcbiAgICAgICAgeyBhY3RpbjogdW5pZm9ybXMuYWN0aW5Db3VudCwgbWVtYnJhbmU6IHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgfSxcbiAgICAgICAgKHZhbHVlcykgPT4ge1xuICAgICAgICAgIE9iamVjdC5hc3NpZ24odW5pZm9ybXMsIHZhbHVlcyk7XG4gICAgICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgICB9LFxuICAgICAgICAoa2luZCwgcmVwZWF0cyA9IDEpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCksXG4gICAgICAgICAgICBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgICAgICAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwU2ltdWxhdGUpO1xuICAgICAgICAgIGlmIChraW5kID09PSBcInBvbGFyaXR5XCIpIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1lYXN1cmVFbmNsb3N1cmUpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoMSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5yZXNvbHZlQ3VlKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKDEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJ0dXJub3ZlclwiKSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy51bmJpbmRNaW5Qb2xlKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4pO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2luZCA9PT0gXCJtb3RvclwiKSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOICsgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tb3RvckxpbmtzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKDEpO1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuYXBwbHlNZWNoYW5pY2FsRm9yY2VzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4gKyBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuYWN0aW5lc1RvVGV4dHVyZXMpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTik7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOICsgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tZW1icmFuZVRldGhlcnMpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXBlYXRzOyBpKyspIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXNzLmVuZCgpO1xuICAgICAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICAgICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8udGVzdEVuY2xvc3VyZSA9ICgpID0+IHtcbiAgICAgIGlmICghcGF1c2VkKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXVzZSBiZWZvcmUgcnVubmluZyBkZXN0cnVjdGl2ZSBlbmNsb3N1cmUgZml4dHVyZXNcIik7XG4gICAgICByZXR1cm4gdGVzdEVuY2xvc3VyZShcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICB7IGFjdGluOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sIG1lbWJyYW5lOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0gfSxcbiAgICAgICAgeyBhY3RpbjogdW5pZm9ybXMuYWN0aW5Db3VudCwgbWVtYnJhbmU6IHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgfSxcbiAgICAgICAgKCkgPT4gcnVuRW5jbG9zdXJlKGRldmljZSwgc2ltUGlwZWxpbmVzLCBiaW5kR3JvdXBTaW11bGF0ZSwgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCwgYWN0dWFsSGVpZ2h0KSxcbiAgICAgICAgKGZpeGVkQXJlYSwgYXJlYSkgPT4ge1xuICAgICAgICAgIHVuaWZvcm1zLmdBY3RpbkZpZWxkID0gMTtcbiAgICAgICAgICB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uID0gZml4ZWRBcmVhID8gMSA6IDA7XG4gICAgICAgICAgdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoID0gTWF0aC5zcXJ0KDQgKiBNYXRoLlBJICogYXJlYSkgLyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50O1xuICAgICAgICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICAgICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8udGVzdE1lY2hhbmljcyA9ICgpID0+IHtcbiAgICAgIGlmICghcGF1c2VkKSB0aHJvdyBuZXcgRXJyb3IoXCJQYXVzZSBiZWZvcmUgcnVubmluZyBkZXN0cnVjdGl2ZSBtZWNoYW5pY2FsIGZpeHR1cmVzXCIpO1xuICAgICAgcmV0dXJuIHRlc3RNZWNoYW5pY3MoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGluOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5BQ1RJTl0sXG4gICAgICAgICAgbWVtYnJhbmU6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSxcbiAgICAgICAgICBsaW5rczogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU10sXG4gICAgICAgICAgZm9yY2VzOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0ZPUkNFU10sXG4gICAgICAgIH0sXG4gICAgICAgIHsgYWN0aW46IHVuaWZvcm1zLmFjdGluQ291bnQsIG1lbWJyYW5lOiB1bmlmb3Jtcy5tZW1icmFuZUNvdW50IH0sXG4gICAgICAgICgpID0+IHtcbiAgICAgICAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgICAgICAgY29uc3QgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgICAgICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cFNpbXVsYXRlKTtcbiAgICAgICAgICBjb25zdCBjb3VudCA9IE1hdGguY2VpbCgodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQpIC8gV09SS0dST1VQX1NJWkUpO1xuICAgICAgICAgIGZvciAoY29uc3QgW3BpcGVsaW5lLCBncm91cHNdIG9mIFtcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMucmVzb2x2ZUN1ZSwgMV0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzLCBjb3VudF0sXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLm1vdG9yTGlua3MsIDFdLFxuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5tZW1icmFuZVRldGhlcnMsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkVdLFxuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5hcHBseU1lY2hhbmljYWxGb3JjZXMsIGNvdW50XSxcbiAgICAgICAgICBdIGFzIGNvbnN0KSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHBpcGVsaW5lKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKGdyb3Vwcyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBhc3MuZW5kKCk7XG4gICAgICAgICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgICAgICB9LFxuICAgICAgICAoc3RyZW5ndGgsIGNvdXBsaW5nLCBkcmFnKSA9PiB7XG4gICAgICAgICAgdW5pZm9ybXMubXlvc2luU3RyZW5ndGggPSBzdHJlbmd0aDtcbiAgICAgICAgICB1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nID0gY291cGxpbmc7XG4gICAgICAgICAgdW5pZm9ybXMuc3Vic3RyYXRlRHJhZyA9IGRyYWc7XG4gICAgICAgICAgdW5pZm9ybXMuY3VlRW5hYmxlZCA9IDA7XG4gICAgICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH07XG4gIH1cblxuICBjb25zdCBwYXVzZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGF1c2UtZGVtb1wiKSE7XG4gIHBhdXNlQnV0dG9uLnRleHRDb250ZW50ID0gcGF1c2VkID8gXCJSZXN1bWVcIiA6IFwiUGF1c2VcIjtcbiAgcGF1c2VCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICBzZXRQYXVzZWQoIXBhdXNlZCk7XG4gIH0pO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInJlc2V0LWRlbW9cIikhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBsb2NhdGlvbi5yZWxvYWQoKSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xlYXItY3VlXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xlYXJDdWUpO1xuICBjb25zdCBzdGVwQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGVwLWRlbW9cIikgYXMgSFRNTEJ1dHRvbkVsZW1lbnQ7XG4gIGFzeW5jIGZ1bmN0aW9uIHNpbmdsZVN0ZXAoKSB7XG4gICAgaWYgKHN0ZXBCdXR0b24uZGlzYWJsZWQpIHJldHVybjtcbiAgICBzdGVwQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICBzZXRQYXVzZWQodHJ1ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0ICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8uYWR2YW5jZSgxKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgc3RvcFNpbXVsYXRpb24oZXJyb3IpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzdGVwQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG4gIHN0ZXBCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIHNpbmdsZVN0ZXApO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgKGV2ZW50KSA9PiB7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkgfHwgZXZlbnQubWV0YUtleSB8fCBldmVudC5hbHRLZXkpIHJldHVybjtcbiAgICBpZiAoKGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudCk/LmNsb3Nlc3QoXCJpbnB1dCxzZWxlY3QsdGV4dGFyZWEsYnV0dG9uLFtjb250ZW50ZWRpdGFibGU9dHJ1ZV1cIikgfHwgZXZlbnQucmVwZWF0KSByZXR1cm47XG4gICAgaWYgKGV2ZW50LmNvZGUgPT09IFwiU3BhY2VcIikge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHNldFBhdXNlZCghcGF1c2VkKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleS50b0xvd2VyQ2FzZSgpID09PSBcIm5cIikge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZvaWQgc2luZ2xlU3RlcCgpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5ID09PSBcIkVzY2FwZVwiKSB7XG4gICAgICBjbGVhckN1ZSgpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnQua2V5LnRvTG93ZXJDYXNlKCkgPT09IFwiclwiKSB7XG4gICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICB9XG4gIH0pO1xuICBmb3IgKGNvbnN0IGtleSBvZiBbXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIiwgXCJteW9zaW5TdHJlbmd0aFwiLCBcIm1lbWJyYW5lQ291cGxpbmdcIl0gYXMgY29uc3QpIHtcbiAgICBjb25zdCBzbGlkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgbGl2ZS0ke2tleX1gKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNvbnN0IHZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHZhbHVlLSR7a2V5fWApITtcbiAgICBzbGlkZXIudmFsdWUgPSBTdHJpbmcodW5pZm9ybXNba2V5XSk7XG4gICAgdmFsdWUudGV4dENvbnRlbnQgPSB1bmlmb3Jtc1trZXldLnRvRml4ZWQoa2V5ID09PSBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiID8gMiA6IDMpO1xuICAgIHNsaWRlci5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgdW5pZm9ybXNba2V5XSA9IE51bWJlcihzbGlkZXIudmFsdWUpO1xuICAgICAgdmFsdWUudGV4dENvbnRlbnQgPSB1bmlmb3Jtc1trZXldLnRvRml4ZWQoa2V5ID09PSBcImxhbWVsbGlwb2RpdW1TdHJlbmd0aFwiID8gMiA6IDMpO1xuICAgICAgY29udHJvbHNEaXJ0eSA9IHRydWU7XG4gICAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICB9KTtcbiAgfVxuICBjb25zdCBhZGFwdGl2ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRhcHRpdmUtZnJhbWVzXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGFkYXB0aXZlLmNoZWNrZWQgPSAhIXVuaWZvcm1zLmFkYXB0aXZlRnJhbWVzO1xuICBhZGFwdGl2ZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICB1bmlmb3Jtcy5hZGFwdGl2ZUZyYW1lcyA9IGFkYXB0aXZlLmNoZWNrZWQgPyAxIDogMDtcbiAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgfSk7XG4gIGNvbnN0IGNlbGxTaXplID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjZWxsLXNpemVcIikgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG4gIGNvbnN0IGNvbXBhY3RMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wYWN0LWRlbW9cIikgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gIGNvbnN0IGNvbXBhY3RVcmwgPSBuZXcgVVJMKGNvbXBhY3RMaW5rLmhyZWYpO1xuICBjb21wYWN0VXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzZWVkXCIsIFN0cmluZyhzZWVkKSk7XG4gIGNvbXBhY3RMaW5rLmhyZWYgPSBjb21wYWN0VXJsLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHJlbmV3YWxMaW5rID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZW5ld2FsLWRlbW9cIikgYXMgSFRNTEFuY2hvckVsZW1lbnQ7XG4gIGNvbnN0IHJlbmV3YWxVcmwgPSBuZXcgVVJMKHJlbmV3YWxMaW5rLmhyZWYpO1xuICByZW5ld2FsVXJsLnNlYXJjaFBhcmFtcy5zZXQoXCJzZWVkXCIsIFN0cmluZyhzZWVkKSk7XG4gIHJlbmV3YWxMaW5rLmhyZWYgPSByZW5ld2FsVXJsLnRvU3RyaW5nKCk7XG4gIGNvbnN0IHNlbGVjdGVkU2l6ZSA9IFN0cmluZyh1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpO1xuICBpZiAoIVsuLi5jZWxsU2l6ZS5vcHRpb25zXS5zb21lKChvcHRpb24pID0+IG9wdGlvbi52YWx1ZSA9PT0gc2VsZWN0ZWRTaXplKSkge1xuICAgIGNlbGxTaXplLmFkZChuZXcgT3B0aW9uKGAke01hdGgucm91bmQoMTUwICogdW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoKX0lIChjdXN0b20pYCwgc2VsZWN0ZWRTaXplKSk7XG4gIH1cbiAgY2VsbFNpemUudmFsdWUgPSBzZWxlY3RlZFNpemU7XG4gIGNlbGxTaXplLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcIm1lbWJyYW5lUmVzdExlbmd0aFwiLCBjZWxsU2l6ZS52YWx1ZSk7XG4gICAgbG9jYXRpb24uaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgfSk7XG4gIGZvciAoY29uc3QgbmFtZSBvZiBbXCJnQWN0aW5GaWVsZFwiLCBcImFyZWFDb25zZXJ2YXRpb25cIl0gYXMgY29uc3QpIHtcbiAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5hbWUpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gICAgY2hlY2tib3guY2hlY2tlZCA9IHVuaWZvcm1zW25hbWVdID4gMDtcbiAgICBjaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgIGNvbnN0IG5leHQgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KG5hbWUsIGNoZWNrYm94LmNoZWNrZWQgPyBcIjFcIiA6IFwiMFwiKTtcbiAgICAgIGxvY2F0aW9uLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgY29ydGV4VG9nZ2xlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb3J0ZXgtdG9nZ2xlXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQ7XG4gIGNvcnRleFRvZ2dsZS5jaGVja2VkID0gdW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24gPiAwO1xuICBjb3J0ZXhUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBVUkwobG9jYXRpb24uaHJlZik7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiY29ydGV4UG9seW1lcml6YXRpb25cIiwgY29ydGV4VG9nZ2xlLmNoZWNrZWQgPyBcIjAuMDNcIiA6IFwiMFwiKTtcbiAgICBsb2NhdGlvbi5ocmVmID0gbmV4dC50b1N0cmluZygpO1xuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSBgU2VlZCAke3NlZWR9IMK3IG1vdG9yICR7dW5pZm9ybXMubXlvc2luU3RyZW5ndGh9IMK3IGNvdXBsaW5nICR7dW5pZm9ybXMubWVtYnJhbmVDb3VwbGluZ31gO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuY2xvc3VyZS1zdGF0dXNcIikhLnRleHRDb250ZW50ID1cbiAgICBgRy1hY3RpbjogJHt1bmlmb3Jtcy5nQWN0aW5GaWVsZCA/IFwiY29uc2VydmVkLCB3ZWxsLW1peGVkIHBvb2xcIiA6IFwibGVnYWN5IHBhcnRpY2xlc1wifSDCtyBhcmVhOiAke3VuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24gPyBcImNvbnN0cmFpbmVkXCIgOiBcImZyZWVcIn1gO1xuICBmb3IgKGNvbnN0IGFuY2hvciBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsPEhUTUxBbmNob3JFbGVtZW50PihcIltkYXRhLWNhc2VdXCIpKSB7XG4gICAgY29uc3QgbmV4dCA9IG5ldyBVUkwoYW5jaG9yLmhyZWYpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcInNlZWRcIiwgU3RyaW5nKHNlZWQpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJjb3J0ZXhQb2x5bWVyaXphdGlvblwiLCBTdHJpbmcodW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24pKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJtZW1icmFuZVJlc3RMZW5ndGhcIiwgU3RyaW5nKHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCkpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImFjdGluQ291bnRcIiwgU3RyaW5nKHVuaWZvcm1zLmFjdGluQ291bnQpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJnQWN0aW5GaWVsZFwiLCBTdHJpbmcodW5pZm9ybXMuZ0FjdGluRmllbGQpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJhcmVhQ29uc2VydmF0aW9uXCIsIFN0cmluZyh1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSk7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgW1xuICAgICAgXCJwb2xhcml0eU1vZGVcIixcbiAgICAgIFwicG9sYXJpdHlUdXJuUmF0ZVwiLFxuICAgICAgXCJyZWFyVHVybm92ZXJcIixcbiAgICAgIFwidHVybm92ZXJBZ2VcIixcbiAgICAgIFwidGV0aGVyVHVybm92ZXJcIixcbiAgICAgIFwidGV0aGVyT25SYXRlXCIsXG4gICAgICBcInRldGhlck9mZlJhdGVcIixcbiAgICAgIFwidGV0aGVyUmVjb3ZlcnlTdGVwc1wiLFxuICAgICAgXCJtb3RvclJlYXJCaWFzXCIsXG4gICAgICBcImZyb250QWxpZ25tZW50XCIsXG4gICAgICBcInRldGhlckxvYWRPZmZcIixcbiAgICAgIFwiY29sb3VyQWdlXCIsXG4gICAgXSBhcyBjb25zdClcbiAgICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChrZXksIFN0cmluZyh1bmlmb3Jtc1trZXldKSk7XG4gICAgYW5jaG9yLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gICAgY29uc3QgYWN0aXZlID1cbiAgICAgIE51bWJlcihuZXh0LnNlYXJjaFBhcmFtcy5nZXQoXCJteW9zaW5TdHJlbmd0aFwiKSA/PyAwKSA9PT0gdW5pZm9ybXMubXlvc2luU3RyZW5ndGggJiZcbiAgICAgIE51bWJlcihuZXh0LnNlYXJjaFBhcmFtcy5nZXQoXCJtZW1icmFuZUNvdXBsaW5nXCIpID8/IDApID09PSB1bmlmb3Jtcy5tZW1icmFuZUNvdXBsaW5nICYmXG4gICAgICBOdW1iZXIobmV4dC5zZWFyY2hQYXJhbXMuZ2V0KFwibWVtYnJhbmVTdGlmZm5lc3NcIikgPz8gMykgPT09IHVuaWZvcm1zLm1lbWJyYW5lU3RpZmZuZXNzO1xuICAgIGFuY2hvci5zZXRBdHRyaWJ1dGUoXCJhcmlhLWN1cnJlbnRcIiwgU3RyaW5nKGFjdGl2ZSkpO1xuICB9XG5cbiAgLy8gR1VJIGZvciBjb250cm9scyBmb3IgZGVza3RvcCBvbmx5XG4gIGlmICghaXNNb2JpbGVEZXZpY2UpIHtcbiAgICBsZXQgZ3VpID0gbmV3IEdVSSgpO1xuXG4gICAgY29uc3QgbWVjaGFuaWNzID0gZ3VpLmFkZEZvbGRlcihcIkFjdG9teW9zaW4gaHlwb3RoZXNpc1wiKTtcbiAgICBjb25zdCByZW5ld2FsID0gZ3VpLmFkZEZvbGRlcihcIlBvbGFyaXR5IGFuZCByZW5ld2FsXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInBvbGFyaXR5TW9kZVwiLCB7IG1hdGVyaWFsUG9sZTogMCwgcGVyc2lzdGVudERpcmVjdGlvbjogMSB9KS5uYW1lKFwiUG9sYXJpdHkgZnJhbWVcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwicG9sYXJpdHlUdXJuUmF0ZVwiLCAwLjAwMSwgMC4xLCAwLjAwMSkubmFtZShcIlR1cm5pbmcgLyBzdGVwXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInJlYXJUdXJub3ZlclwiLCAwLCAwLjEsIDAuMDA1KS5uYW1lKFwiQWdlZCByZWFyIGNsZWFyYW5jZVwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0dXJub3ZlckFnZVwiLCAxMDAsIDIwMDAsIDUwKS5uYW1lKFwiQWN0aW4gbWF0dXJhdGlvbiBzdGVwc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJtb3RvclJlYXJCaWFzXCIsIDAsIDEsIDAuMDUpLm5hbWUoXCJNYXR1cmUtcmVhciBtb3RvciBiaWFzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcImZyb250QWxpZ25tZW50XCIsIDAsIDEsIDAuMDUpLm5hbWUoXCJGcm9udCBmaWxhbWVudCBhbGlnbm1lbnRcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwiY29sb3VyQWdlXCIsIHsgYXNzZW1ibHlSZWNlbmN5OiAwLCBiZWFkQWdlOiAxIH0pLm5hbWUoXCJBY3RpbiBjb2xvdXJzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlclR1cm5vdmVyXCIsIHsgaW1tZWRpYXRlUmViaW5kaW5nOiAwLCBmaW5pdGVCaW5kaW5nOiAxIH0pLm5hbWUoXCJUZXRoZXIga2luZXRpY3NcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidGV0aGVyT25SYXRlXCIsIDAuMDAxLCAwLjEsIDAuMDAxKS5uYW1lKFwiVGV0aGVyIGJpbmRpbmcgLyBzdGVwXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlck9mZlJhdGVcIiwgMCwgMC4wMiwgMC4wMDEpLm5hbWUoXCJUZXRoZXIgcmVsZWFzZSAvIHN0ZXBcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidGV0aGVyUmVjb3ZlcnlTdGVwc1wiLCAwLCAzMDAsIDEwKS5uYW1lKFwiVGV0aGVyIHVuYm91bmQgZHdlbGxcIik7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJteW9zaW5TdHJlbmd0aFwiLCAwLCAwLjIsIDAuMDA1KS5uYW1lKFwiTW90b3IgY29udHJhY3RpbGl0eVwiKS5saXN0ZW4oKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcIm15b3NpblNwZWVkXCIsIDAsIDAuMSwgMC4wMDUpLm5hbWUoXCJMaW5rIHNob3J0ZW5pbmcgLyBzdGVwXCIpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwibWVtYnJhbmVDb3VwbGluZ1wiLCAwLCAwLjIsIDAuMDA1KS5uYW1lKFwiTWVtYnJhbmUgdGV0aGVyc1wiKS5saXN0ZW4oKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcInN1YnN0cmF0ZURyYWdcIiwgMCwgMjAsIDAuNSkubmFtZShcIkZyb250IGNsdXRjaCBkcmFnXCIpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwiY29ydGV4UG9seW1lcml6YXRpb25cIiwgMCwgMC4xLCAwLjAwNSkubmFtZShcIkJhc2FsIGNvcnRleCBhc3NlbWJseVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1vbm9tZXJPcGFjaXR5XCIsIDAsIDEsIDAuMDUpLm5hbWUoXCJNb25vbWVyIHZpc2liaWxpdHlcIik7XG5cbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImNvbXB1dGVTdGVwc1BlckZyYW1lXCIpLm1pbigxKS5tYXgoNzUpLnN0ZXAoMSkubmFtZShcIk1heCBzdGVwcyAvIGZyYW1lXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwidGFyZ2V0RlBTXCIpLm1pbigxKS5tYXgoMTIwKS5zdGVwKDEpLm5hbWUoXCJUYXJnZXQgRlBTXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3RpZmZuZXNzXCIpLm1pbigwLjApLm1heCgyLjApLm5hbWUoXCJTdGlmZm5lc3NcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJmb29kTmVhcmJ5VGhyZXNob2xkXCIpLm1pbigwLjAwMDAwMDEpLm1heCgxLjApLm5hbWUoXCJGb29kIE5lYXJieSBUaHJlc2hvbGRcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJkaXNjb25uZWN0aW9uUHJvYmFiaWxpdHlcIikubWluKDApLm1heCgwLjk5OSkubmFtZShcIkRpc2Nvbm5lY3Rpb24gcHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzdGVyaWNTYW1wbGluZ1JhbmdlXCIpLm1pbigxKS5tYXgoNTApLnN0ZXAoMSkubmFtZShcIlN0ZXJpYyBTYW1wbGluZyBSYW5nZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImFjdGluQ29oZXNpb25SYW5nZVwiKS5taW4oMSkubWF4KDEwMCkuc3RlcCgxKS5uYW1lKFwiQWN0aW4gQ29oZXNpb24gUmFuZ2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJiaW5kUHJvYlwiKS5taW4oMC4wKS5tYXgoMC4xKS5zdGVwKDAuMDAwMSkubmFtZShcIkJpbmQgUHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpblN0ZXJpY0ZvcmNlXCIpLm1pbigwLjApLm1heCgxLjApLm5hbWUoXCJBY3RpbiBTdGVyaWMgRm9yY2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpbkJlbmRTdGlmZm5lc3NcIikubWluKDAuMCkubWF4KDQuMCkubmFtZShcIkFjdGluIEJlbmQgU3RpZmZuZXNzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5Db3NzZXJhdEl0ZXJhdGlvbnNcIikubWluKDApLm1heCgxNikuc3RlcCgxKS5uYW1lKFwiQWN0aW4gQ29zc2VyYXQgSXRlcmF0aW9uc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInN0ZXJpY1NlbGZOZWlnaGJvcnNcIikubWluKDApLm1heCgxMikuc3RlcCgxKS5uYW1lKFwiU3RlcmljIFNlbGYgTmVpZ2hib3JzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2VcIikubWluKDAuMDEpLm1heCg2LjApLm5hbWUoXCJFcXVpbGlicml1bSBMaW5lIERpc3RhbmNlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwicG9seW1lclJlcHVsc2lvblwiKS5taW4oMC4wKS5tYXgoMS4wKS5uYW1lKFwiUG9seW1lciBSZXB1bHNpb25cIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtb25vbWVyTWVtYnJhbmVSZXB1bHNpb25cIikubWluKDAuMCkubWF4KDIuMCkubmFtZShcIk1vbm9tZXItTWVtYnJhbmUgUmVwdWxzaW9uXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYmluZExlbmd0aEZsb29yXCIpLm1pbigxKS5tYXgoNjQpLnN0ZXAoMSkubmFtZShcIkJpbmQgTGVuZ3RoIEZsb29yXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYmluZExlbmd0aFNhdHVyYXRpb25cIikubWluKDEpLm1heCg2NCkuc3RlcCgxKS5uYW1lKFwiQmluZCBMZW5ndGggU2F0dXJhdGlvblwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1vdmVtZW50TW9kZVwiKS5vcHRpb25zKHsgSWRsZTogMCwgXCJNb3ZlIEVhc3RcIjogMSB9KS5uYW1lKFwiTW92ZW1lbnQgTW9kZVwiKTtcbiAgICAvLyB0aGUgb3RoZXIgbWVtYnJhbmUgc2V0dGluZ3MgYXJlIHR1bmVkIGFuZCByYXJlbHkgdG91Y2hlZDsgdGhleSBjYW4gc3RpbGwgYmUgc2V0IGZyb20gdGhlIFVSTCwgZS5nLiA/bWVtYnJhbmVGbG93PTAuM1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibWVtYnJhbmVTdGlmZm5lc3NcIikubWluKDAuMCkubWF4KDEwMC4wKS5uYW1lKFwiTWVtYnJhbmUgU3RpZmZuZXNzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibWVtYnJhbmVTbW9vdGhpbmdcIikubWluKDAuMCkubWF4KDAuNSkubmFtZShcIk1lbWJyYW5lIFNtb290aGluZ1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInBvbHltZXJpemF0aW9uUGF0Y2hTaXplXCIpLm1pbigwLjApLm1heCgwLjIpLm5hbWUoXCJQb2x5bWVyaXphdGlvbiBQYXRjaCBTaXplXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwicG9seW1lcml6YXRpb25GaWVsZERlY2F5XCIpLm1pbigwLjgpLm1heCgwLjk5OSkuc3RlcCgwLjAwMSkubmFtZShcIlBvbHltZXJpemF0aW9uIEZpZWxkIERlY2F5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIpLm1pbigwLjApLm1heCgyLjApLm5hbWUoXCJMYW1lbGxpcG9kaXVtIFN0cmVuZ3RoXCIpLmxpc3RlbigpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibGFtZWxsaXBvZGl1bVdpZHRoXCIpLm1pbigwLjApLm1heCgwLjUpLm5hbWUoXCJMYW1lbGxpcG9kaXVtIFdpZHRoXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibGFtZWxsaXBvZGl1bUZpZWxkRGVjYXlcIikubWluKDAuOCkubWF4KDAuOTk5KS5zdGVwKDAuMDAxKS5uYW1lKFwiTGFtZWxsaXBvZGl1bSBGaWVsZCBEZWNheVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJyYW5jaFByb2JhYmlsaXR5XCIpLm1pbigwLjApLm1heCgwLjIpLnN0ZXAoMC4wMDEpLm5hbWUoXCJCcmFuY2ggUHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJkZWJyYW5jaFByb2JhYmlsaXR5XCIpLm1pbigwLjApLm1heCgwLjAxKS5zdGVwKDAuMDAwMSkubmFtZShcIkRlYnJhbmNoIFByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0Q291bnRcIikubWluKDApLm1heChNQVhfU1BST1VUX1NJVEVTKS5zdGVwKDEpLm5hbWUoXCJTcHJvdXQgU2l0ZXNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRXaWR0aFwiKS5taW4oMSkubWF4KDE2KS5zdGVwKDEpLm5hbWUoXCJTcHJvdXQgV2lkdGggKG5vZGVzKVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dEZyb250Qmlhc1wiKS5taW4oMC4wKS5tYXgoMS4wKS5uYW1lKFwiU3Byb3V0IEZyb250IEJpYXNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRPblN0ZXBzXCIpLm1pbigxMDApLm1heCgyMDAwMCkuc3RlcCgxMDApLm5hbWUoXCJTcHJvdXQgT24gU3RlcHNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRPZmZTdGVwc1wiKS5taW4oMTAwKS5tYXgoMjAwMDApLnN0ZXAoMTAwKS5uYW1lKFwiU3Byb3V0IE9mZiBTdGVwc1wiKTtcbiAgICBndWkuYWRkKHsgZXhlY3V0ZUZ1bmN0aW9uOiAoKSA9PiBsb2NhdGlvbi5yZWxvYWQoKSB9LCBcImV4ZWN1dGVGdW5jdGlvblwiKS5uYW1lKFwiUmVzZXQgc2VlZCBhbmQgZmllbGRzXCIpO1xuICAgIGd1aVxuICAgICAgLmFkZChcbiAgICAgICAge1xuICAgICAgICAgIHBhdXNlOiAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXVzZWQoIXBhdXNlZCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgXCJwYXVzZVwiXG4gICAgICApXG4gICAgICAubmFtZShcIlBhdXNlIC8gcmVzdW1lXCIpO1xuICAgIGd1aS5vbkNoYW5nZSgoKSA9PiB7XG4gICAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICAgICAgZGlzcGxheUN1ZSgpO1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgW1wibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIsIFwibXlvc2luU3RyZW5ndGhcIiwgXCJtZW1icmFuZUNvdXBsaW5nXCJdIGFzIGNvbnN0KSB7XG4gICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgbGl2ZS0ke2tleX1gKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IFN0cmluZyh1bmlmb3Jtc1trZXldKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHZhbHVlLSR7a2V5fWApIS50ZXh0Q29udGVudCA9IHVuaWZvcm1zW2tleV0udG9GaXhlZChrZXkgPT09IFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIgPyAyIDogMyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZ3VpLmNsb3NlKCk7XG4gIH1cblxuICBsZXQgbGFzdEZyYW1lVGltZSA9IDA7XG4gIGxldCBmcmFtZVBlbmRpbmcgPSBmYWxzZTtcbiAgY29uc3QgZ2V0RnJhbWVJbnRlcnZhbCA9ICgpID0+IDEwMDAgLyB1bmlmb3Jtcy50YXJnZXRGUFM7IC8vIENvbnZlcnQgRlBTIHRvIG1pbGxpc2Vjb25kc1xuXG4gIGZ1bmN0aW9uIGZyYW1lKGN1cnJlbnRUaW1lOiBudW1iZXIpIHtcbiAgICBpZiAoIXBhdXNlZCAmJiAhcmVjb3ZlcnkuYWN0aXZlICYmICFmcmFtZVBlbmRpbmcgJiYgIW1hbnVhbEFkdmFuY2VQZW5kaW5nICYmIGN1cnJlbnRUaW1lIC0gbGFzdEZyYW1lVGltZSA+PSBnZXRGcmFtZUludGVydmFsKCkgLSAwLjUpIHtcbiAgICAgIGZyYW1lUGVuZGluZyA9IHRydWU7XG4gICAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgICAgICBpbnB1dCA9IGxpdmVQZXJmb3JtYW5jZS5pbnB1dFNuYXBzaG90KCk7XG4gICAgICBjb25zdCBzdGVwcyA9IHVuaWZvcm1zLmFkYXB0aXZlRnJhbWVzID8gZnJhbWVCdWRnZXQuY2hvb3NlKHVuaWZvcm1zLmNvbXB1dGVTdGVwc1BlckZyYW1lLCB1bmlmb3Jtcy50YXJnZXRGUFMpIDogdW5pZm9ybXMuY29tcHV0ZVN0ZXBzUGVyRnJhbWU7XG4gICAgICBsZXQgZW5jb2RlZEF0ID0gc3RhcnQ7XG4gICAgICB0aW1lc3RlcChzdGVwcylcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGVuY29kZWRBdCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgIHJldHVybiBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZG9uZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgICAgIGZyYW1lQnVkZ2V0Lm9ic2VydmUoc3RlcHMsIGRvbmUgLSBzdGFydCwgZW5jb2RlZEF0IC0gc3RhcnQpO1xuICAgICAgICAgIGxpdmVQZXJmb3JtYW5jZS5mcmFtZSh7IGF0OiBkb25lLCBzdGVwcywgZW5jb2RlTXM6IGVuY29kZWRBdCAtIHN0YXJ0LCBxdWV1ZVRhaWxNczogZG9uZSAtIGVuY29kZWRBdCwgdG90YWxNczogZG9uZSAtIHN0YXJ0IH0sIGlucHV0KTtcbiAgICAgICAgICBjb25zdCBwZXJmID0gbGl2ZVBlcmZvcm1hbmNlLnNuYXBzaG90KCk7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpIS50ZXh0Q29udGVudCA9IHBhdXNlZFxuICAgICAgICAgICAgPyBgUGF1c2VkIMK3IHN0ZXAgJHtmcmFtZU5yfWBcbiAgICAgICAgICAgIDogYCR7cGVyZi5yZW5kZXJGUFMudG9GaXhlZCgwKX0gRlBTIMK3ICR7cGVyZi5zdGVwc1BlclNlY29uZC50b0ZpeGVkKDApfSBzdGVwcy9zIMK3ICR7c3RlcHN9IHN0ZXAke3N0ZXBzID09PSAxID8gXCJcIiA6IFwic1wifS9mcmFtZWA7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChzdG9wU2ltdWxhdGlvbilcbiAgICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICAgIGZyYW1lUGVuZGluZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgIGxhc3RGcmFtZVRpbWUgPSBjdXJyZW50VGltZTtcbiAgICB9XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgfVxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICByZXR1cm47XG59XG5cbmluZGV4KCkuY2F0Y2goKGVycm9yKSA9PiB7XG4gIGNvbnN0IHN0YXR1cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIik7XG4gIGlmIChzdGF0dXMpIHN0YXR1cy50ZXh0Q29udGVudCA9IGBVbmFibGUgdG8gc3RhcnQgV2ViR1BVOiAke1N0cmluZyhlcnJvcil9YDtcbiAgY29uc29sZS5lcnJvcihlcnJvcik7XG59KTtcbiIsIi8vIEV4ZWN1dGVkIG9ubHkgd2l0aCA/bWVjaGFuaWNzVGVzdD0xLiBUZXN0cyB0aGUgYWN0dWFsIFdHU0wgcGlwZWxpbmVzIG9uIHR3b1xuLy8gZXhwbGljaXQgdHdvLWJlYWQgZmlsYW1lbnRzIGFuZCBvbmUgbWVtYnJhbmUgYXR0YWNobWVudCwgbm90IGEgQ1BVIHN1cnJvZ2F0ZS5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0ZXN0TWVjaGFuaWNzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYnVmZmVyczogeyBhY3RpbjogR1BVQnVmZmVyOyBtZW1icmFuZTogR1BVQnVmZmVyOyBsaW5rczogR1BVQnVmZmVyOyBmb3JjZXM6IEdQVUJ1ZmZlciB9LFxuICBjb3VudHM6IHsgYWN0aW46IG51bWJlcjsgbWVtYnJhbmU6IG51bWJlciB9LFxuICBkaXNwYXRjaDogKCkgPT4gdm9pZCxcbiAgY29uZmlndXJlOiAoc3RyZW5ndGg6IG51bWJlciwgY291cGxpbmc6IG51bWJlciwgZHJhZzogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgcmVzdWx0czogeyBuYW1lOiBzdHJpbmc7IHBhc3NlZDogYm9vbGVhbiB9W10gPSBbXTtcbiAgY29uc3QgYXNzZXJ0ID0gKG5hbWU6IHN0cmluZywgb2s6IGJvb2xlYW4pID0+IHtcbiAgICByZXN1bHRzLnB1c2goeyBuYW1lLCBwYXNzZWQ6IG9rIH0pO1xuICAgIGlmICghb2spIHRocm93IG5ldyBFcnJvcihgTWVjaGFuaWNhbCBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyKSA9PiB7XG4gICAgY29uc3QgY29weSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBidWZmZXIuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfSk7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGJ1ZmZlciwgMCwgY29weSwgMCwgYnVmZmVyLnNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBjb3B5Lm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgZGF0YSA9IGNvcHkuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICBjb3B5LnVubWFwKCk7XG4gICAgY29weS5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG4gIGNvbnN0IGZpeHR1cmUgPSBhc3luYyAoc3RyZW5ndGg6IG51bWJlciwgY291cGxpbmc6IG51bWJlciwgZHJhZyA9IDAsIGRldGFjaGVkID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBhY3RpbiA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmFjdGluLnNpemUpO1xuICAgIGNvbnN0IGEgPSBuZXcgVWludDMyQXJyYXkoYWN0aW4pLFxuICAgICAgYWYgPSBuZXcgRmxvYXQzMkFycmF5KGFjdGluKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5hY3RpbjsgaSsrKSB7XG4gICAgICBhW2kgKiAxMF0gPSBhW2kgKiAxMCArIDZdID0gYVtpICogMTAgKyA3XSA9IGk7XG4gICAgICBhZltpICogMTAgKyAyXSA9IGFmW2kgKiAxMCArIDNdID0gNTAwO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgYWZbaSAqIDEwICsgMl0gPSBbMTAsIDEyLCAyMCwgMThdW2ldO1xuICAgICAgYWZbaSAqIDEwICsgM10gPSAxMDtcbiAgICAgIGFmW2kgKiAxMCArIDRdID0gaSA8IDIgPyAxIDogLTE7XG4gICAgICBhW2kgKiAxMCArIDZdID0gaSA8IDIgPyAwIDogMjtcbiAgICAgIGFbaSAqIDEwICsgN10gPSBpIDwgMiA/IDEgOiAzO1xuICAgIH1cbiAgICBjb25zdCBtZW0gPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5tZW1icmFuZS5zaXplKTtcbiAgICBjb25zdCBtZiA9IG5ldyBGbG9hdDMyQXJyYXkobWVtKSxcbiAgICAgIG11ID0gbmV3IFVpbnQzMkFycmF5KG1lbSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMubWVtYnJhbmU7IGkrKykge1xuICAgICAgbXVbaSAqIDEwXSA9IGk7XG4gICAgICBtdVtpICogMTAgKyA2XSA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtZltpICogMTAgKyAyXSA9IDEwMDA7XG4gICAgICBtZltpICogMTAgKyAzXSA9IDEwMDA7XG4gICAgfVxuICAgIG1mWzJdID0gMjU7XG4gICAgbWZbM10gPSAxMDtcbiAgICBtZlsoY291bnRzLm1lbWJyYW5lIC8gMikgKiAxMCArIDJdID0gMDtcbiAgICBtZlsoY291bnRzLm1lbWJyYW5lIC8gMikgKiAxMCArIDNdID0gMTA7XG4gICAgY29uc3QgbGlua3MgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5saW5rcy5zaXplKTtcbiAgICBjb25zdCBsdSA9IG5ldyBVaW50MzJBcnJheShsaW5rcyksXG4gICAgICBsZiA9IG5ldyBGbG9hdDMyQXJyYXkobGlua3MpO1xuICAgIGx1LnNldChbMSwgMywgMCwgMSwgMSwgMCwgMywgMl0sIDApO1xuICAgIGxmWzJdID0gNTtcbiAgICBsdS5zZXQoWzMsIDAsIDAsIDEsIDMsIDIsIDAsIDBdLCAyNTYgKiA4KTtcbiAgICBsZlsyNTYgKiA4ICsgMl0gPSAxO1xuICAgIGlmIChkZXRhY2hlZCkge1xuICAgICAgYVs2XSA9IGFbN10gPSAwO1xuICAgICAgYVsyNl0gPSBhWzI3XSA9IDI7XG4gICAgfVxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBhY3Rpbik7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUsIDAsIG1lbSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmtzKTtcbiAgICBjb25maWd1cmUoc3RyZW5ndGgsIGNvdXBsaW5nLCBkcmFnKTtcbiAgICBkaXNwYXRjaCgpO1xuICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZvcmNlczogbmV3IEludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmZvcmNlcykpLnN1YmFycmF5KDAsIDIgKiAoY291bnRzLmFjdGluICsgY291bnRzLm1lbWJyYW5lKSksXG4gICAgICBhY3RpbjogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKSxcbiAgICAgIG1lbWJyYW5lOiBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5tZW1icmFuZSkpLFxuICAgIH07XG4gIH07XG4gIGxldCBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMCwgMCk7XG4gIGFzc2VydChcIm9mZiBpcyBtZWNoYW5pY2FsbHkgaW5lcnRcIiwgc3RhdGUuZm9yY2VzLmV2ZXJ5KCh4KSA9PiB4ID09PSAwKSAmJiBzdGF0ZS5hY3RpblsyXSA9PT0gMTAgJiYgc3RhdGUubWVtYnJhbmVbMl0gPT09IDI1KTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAuMDUsIDApO1xuICBhc3NlcnQoXCJtb3RvciBjb250cmFjdHMgb3Bwb3NlZCBmaWxhbWVudHNcIiwgc3RhdGUuYWN0aW5bMl0gPiAxMCAmJiBzdGF0ZS5hY3RpblsyMl0gPCAyMCk7XG4gIGFzc2VydChcIm1vdG9yIHdpdGhvdXQgdGV0aGVyIGRvZXMgbm90IG1vdmUgbWVtYnJhbmVcIiwgc3RhdGUubWVtYnJhbmVbMl0gPT09IDI1KTtcbiAgYXNzZXJ0KFwibW90b3IgZm9yY2VzIGFyZSByZWNpcHJvY2FsXCIsIHN0YXRlLmZvcmNlc1swXSA9PT0gLXN0YXRlLmZvcmNlc1s0XSAmJiBzdGF0ZS5mb3JjZXNbMF0gPiAwKTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAsIDAuMDUpO1xuICBhc3NlcnQoXCJ0ZXRoZXIgcHVsbHMgbWVtYnJhbmUgdG93YXJkIGZpbGFtZW50XCIsIHN0YXRlLm1lbWJyYW5lWzJdIDwgMjUgJiYgc3RhdGUuYWN0aW5bMjJdID4gMjApO1xuICBhc3NlcnQoXCJ0ZXRoZXIgcmVhY3Rpb24gYWN0cyBvbiBhY3RpblwiLCBzdGF0ZS5mb3JjZXNbNF0gPT09IC1zdGF0ZS5mb3JjZXNbY291bnRzLmFjdGluICogMl0pO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMC4wNSk7XG4gIGxldCBmeCA9IDAsXG4gICAgZnkgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YXRlLmZvcmNlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIGZ4ICs9IHN0YXRlLmZvcmNlc1tpXTtcbiAgICBmeSArPSBzdGF0ZS5mb3JjZXNbaSArIDFdO1xuICB9XG4gIGFzc2VydChcImNvbWJpbmVkIGludGVybmFsIGZvcmNlIHN1bXMgdG8gemVyb1wiLCBmeCA9PT0gMCAmJiBmeSA9PT0gMCk7XG4gIGNvbnN0IGZyZWVEaXNwbGFjZW1lbnQgPSBzdGF0ZS5hY3RpblsyXSAtIDEwO1xuICBzdGF0ZSA9IGF3YWl0IGZpeHR1cmUoMC4wNSwgMC4wNSwgNCk7XG4gIGFzc2VydChcImNsdXRjaCByZWR1Y2VzIG1vdGlvbiB3aXRob3V0IGNoYW5naW5nIGdlbmVyYXRlZCBmb3JjZVwiLCBzdGF0ZS5hY3RpblsyXSAtIDEwIDwgZnJlZURpc3BsYWNlbWVudCAmJiBzdGF0ZS5mb3JjZXNbMF0gPiAwKTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAuMDUsIDAuMDUsIDAsIHRydWUpO1xuICBhc3NlcnQoXG4gICAgXCJkZXBvbHltZXJpemVkIGVuZHBvaW50cyByZWxlYXNlIG1vdG9yIGFuZCB0ZXRoZXJcIixcbiAgICBzdGF0ZS5mb3JjZXMuZXZlcnkoKHgpID0+IHggPT09IDApXG4gICk7XG4gIHJldHVybiByZXN1bHRzO1xufVxuIiwiLy8gQ29uc2VydmF0aXZlIHktYmFuZCBlZGdlIGluZGV4LiBQcmVkaWNhdGVzIHJlbWFpbiBleGFjdDsgbG9uZyBlZGdlcyBhcmVcbi8vIHJldGFpbmVkIGluIGEgZ2xvYmFsIGxpc3QgYW5kIGxvbmcgYm9uZCBxdWVyaWVzIGZhbGwgYmFjayB0byBhbGwgZWRnZXMuXG4vLyBObyBib3VuZGFyeS9jb2xsaXNpb24gaXMgZGlzY2FyZGVkIHRvIGltcHJvdmUgZGlhZ25vc3RpYyBsYXRlbmN5LlxuY29uc3QgQkFORCA9IDQ7XG50eXBlIEVkZ2UgPSB7IHg6IG51bWJlcjsgeTogbnVtYmVyOyBkeDogbnVtYmVyOyBkeTogbnVtYmVyOyBseDogbnVtYmVyOyBoeDogbnVtYmVyOyBseTogbnVtYmVyOyBoeTogbnVtYmVyIH07XG5mdW5jdGlvbiBlZGdlSW5kZXgobWVtYnJhbmU6IEZsb2F0MzJBcnJheSwgc3RyaWRlOiBudW1iZXIsIHJldmVyc2UgPSBmYWxzZSkge1xuICBjb25zdCBuID0gbWVtYnJhbmUubGVuZ3RoIC8gc3RyaWRlO1xuICBjb25zdCBlZGdlczogRWRnZVtdID0gW10sXG4gICAgcm93cyA9IG5ldyBNYXA8bnVtYmVyLCBFZGdlW10+KCksXG4gICAgd2lkZTogRWRnZVtdID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgY29uc3QgaiA9IChpICsgKHJldmVyc2UgPyBuIC0gMSA6IDEpKSAlIG47XG4gICAgY29uc3QgeCA9IG1lbWJyYW5lW2kgKiBzdHJpZGUgKyAyXSxcbiAgICAgIHkgPSBtZW1icmFuZVtpICogc3RyaWRlICsgM10sXG4gICAgICBieCA9IG1lbWJyYW5lW2ogKiBzdHJpZGUgKyAyXSxcbiAgICAgIGJ5ID0gbWVtYnJhbmVbaiAqIHN0cmlkZSArIDNdO1xuICAgIGlmICghW3gsIHksIGJ4LCBieV0uZXZlcnkoTnVtYmVyLmlzRmluaXRlKSkgdGhyb3cgbmV3IEVycm9yKFwiTm9uLWZpbml0ZSBtZW1icmFuZSBnZW9tZXRyeVwiKTtcbiAgICBjb25zdCBlID0geyB4LCB5LCBkeDogYnggLSB4LCBkeTogYnkgLSB5LCBseDogTWF0aC5taW4oeCwgYngpLCBoeDogTWF0aC5tYXgoeCwgYngpLCBseTogTWF0aC5taW4oeSwgYnkpLCBoeTogTWF0aC5tYXgoeSwgYnkpIH07XG4gICAgZWRnZXMucHVzaChlKTtcbiAgICBjb25zdCBsb3cgPSBNYXRoLmZsb29yKGUubHkgLyBCQU5EKSxcbiAgICAgIGhpZ2ggPSBNYXRoLmZsb29yKGUuaHkgLyBCQU5EKTtcbiAgICBpZiAoaGlnaCAtIGxvdyA+IDI1Nikge1xuICAgICAgd2lkZS5wdXNoKGUpO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGZvciAobGV0IHJvdyA9IGxvdzsgcm93IDw9IGhpZ2g7IHJvdysrKSB7XG4gICAgICBjb25zdCBsaXN0ID0gcm93cy5nZXQocm93KTtcbiAgICAgIGlmIChsaXN0KSBsaXN0LnB1c2goZSk7XG4gICAgICBlbHNlIHJvd3Muc2V0KHJvdywgW2VdKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHsgZWRnZXMsIHJvd3MsIHdpZGUgfTtcbn1cblxuLy8gTGVnYWN5IHBhcnRpY2xlIGNvdW50cyB1c2UgcGl4ZWwtcm93IHNhbXBsaW5nOyBleHBsaWNpdC1maWxhbWVudCBtb2RlIHVzZXNcbi8vIGV4YWN0IHkgY29vcmRpbmF0ZXMuIFRoZSBnZW9tZXRyeSBmb3JtdWxhL29yZGVyIG1hdGNoZXMgdGhlIHByaW9yIGZ1bGwgc2Nhbi5cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uT2NjdXBhbmN5KG1lbWJyYW5lOiBGbG9hdDMyQXJyYXksIHN0cmlkZSA9IDEwLCBleGFjdCA9IGZhbHNlKSB7XG4gIGNvbnN0IHsgcm93cywgd2lkZSB9ID0gZWRnZUluZGV4KG1lbWJyYW5lLCBzdHJpZGUsIHRydWUpO1xuICBjb25zdCBjYWNoZSA9IG5ldyBNYXA8bnVtYmVyLCBudW1iZXJbXT4oKTtcbiAgcmV0dXJuICh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xuICAgIGlmICghTnVtYmVyLmlzRmluaXRlKHgpIHx8ICFOdW1iZXIuaXNGaW5pdGUoeSkpIHJldHVybiBmYWxzZTtcbiAgICBjb25zdCByb3cgPSBNYXRoLmZsb29yKHkpLFxuICAgICAgc2NhblkgPSBleGFjdCA/IHkgOiByb3cgKyAwLjU7XG4gICAgY29uc3QgY2FuZGlkYXRlcyA9IHJvd3MuZ2V0KE1hdGguZmxvb3Ioc2NhblkgLyBCQU5EKSkgPz8gW107XG4gICAgaWYgKGV4YWN0KSB7XG4gICAgICBsZXQgaW5zaWRlID0gZmFsc2U7XG4gICAgICBmb3IgKGNvbnN0IGxpc3Qgb2YgW2NhbmRpZGF0ZXMsIHdpZGVdKVxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICAgIGlmIChlLnkgPiBzY2FuWSAhPSBlLnkgKyBlLmR5ID4gc2NhblkgJiYgZS54ICsgKChzY2FuWSAtIGUueSkgKiBlLmR4KSAvIGUuZHkgPD0geCkgaW5zaWRlID0gIWluc2lkZTtcbiAgICAgICAgfVxuICAgICAgcmV0dXJuIGluc2lkZTtcbiAgICB9XG4gICAgbGV0IGNyb3NzaW5ncyA9IGNhY2hlLmdldChyb3cpO1xuICAgIGlmICghY3Jvc3NpbmdzKSB7XG4gICAgICBjcm9zc2luZ3MgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgbGlzdCBvZiBbY2FuZGlkYXRlcywgd2lkZV0pXG4gICAgICAgIGZvciAoY29uc3QgZSBvZiBsaXN0KSB7XG4gICAgICAgICAgaWYgKGUueSA+IHNjYW5ZICE9IGUueSArIGUuZHkgPiBzY2FuWSkgY3Jvc3NpbmdzLnB1c2goZS54ICsgKChzY2FuWSAtIGUueSkgKiBlLmR4KSAvIGUuZHkpO1xuICAgICAgICB9XG4gICAgICBjcm9zc2luZ3Muc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICAgICAgY2FjaGUuc2V0KHJvdywgY3Jvc3NpbmdzKTtcbiAgICB9XG4gICAgbGV0IGxvID0gMCxcbiAgICAgIGhpID0gY3Jvc3NpbmdzLmxlbmd0aDtcbiAgICB3aGlsZSAobG8gPCBoaSkge1xuICAgICAgY29uc3QgbWlkID0gKGxvICsgaGkpID4+PiAxO1xuICAgICAgaWYgKGNyb3NzaW5nc1ttaWRdIDw9IHgpIGxvID0gbWlkICsgMTtcbiAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsbyAlIDIgPT09IDE7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2x5Z29uQm9uZENyb3NzaW5nKG1lbWJyYW5lOiBGbG9hdDMyQXJyYXksIHN0cmlkZSA9IDEwKSB7XG4gIGNvbnN0IHsgZWRnZXMsIHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlKTtcbiAgcmV0dXJuIChheDogbnVtYmVyLCBheTogbnVtYmVyLCBieDogbnVtYmVyLCBieTogbnVtYmVyKSA9PiB7XG4gICAgY29uc3QgZHggPSBieCAtIGF4LFxuICAgICAgZHkgPSBieSAtIGF5LFxuICAgICAgbWluWCA9IE1hdGgubWluKGF4LCBieCksXG4gICAgICBtYXhYID0gTWF0aC5tYXgoYXgsIGJ4KSxcbiAgICAgIG1pblkgPSBNYXRoLm1pbihheSwgYnkpLFxuICAgICAgbWF4WSA9IE1hdGgubWF4KGF5LCBieSk7XG4gICAgY29uc3QgY3Jvc3NlcyA9IChsaXN0OiBFZGdlW10pID0+IHtcbiAgICAgIGZvciAoY29uc3QgZSBvZiBsaXN0KSB7XG4gICAgICAgIGlmIChtYXhYIDwgZS5seCB8fCBtaW5YID4gZS5oeCB8fCBtYXhZIDwgZS5seSB8fCBtaW5ZID4gZS5oeSkgY29udGludWU7XG4gICAgICAgIGNvbnN0IGRlbm9taW5hdG9yID0gZHggKiBlLmR5IC0gZHkgKiBlLmR4O1xuICAgICAgICBpZiAoTWF0aC5hYnMoZGVub21pbmF0b3IpIDwgMWUtOCkgY29udGludWU7XG4gICAgICAgIGNvbnN0IHQgPSAoKGUueCAtIGF4KSAqIGUuZHkgLSAoZS55IC0gYXkpICogZS5keCkgLyBkZW5vbWluYXRvcjtcbiAgICAgICAgY29uc3QgdSA9ICgoZS54IC0gYXgpICogZHkgLSAoZS55IC0gYXkpICogZHgpIC8gZGVub21pbmF0b3I7XG4gICAgICAgIGlmICh0ID4gMWUtNSAmJiB0IDwgMSAtIDFlLTUgJiYgdSA+PSAwICYmIHUgPD0gMSkgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgICBjb25zdCBsb3cgPSBNYXRoLmZsb29yKG1pblkgLyBCQU5EKSxcbiAgICAgIGhpZ2ggPSBNYXRoLmZsb29yKG1heFkgLyBCQU5EKTtcbiAgICBpZiAoaGlnaCAtIGxvdyA+IDIpIHJldHVybiBjcm9zc2VzKGVkZ2VzKTtcbiAgICBpZiAoY3Jvc3Nlcyh3aWRlKSkgcmV0dXJuIHRydWU7XG4gICAgZm9yIChsZXQgcm93ID0gbG93OyByb3cgPD0gaGlnaDsgcm93KyspIGlmIChjcm9zc2VzKHJvd3MuZ2V0KHJvdykgPz8gW10pKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG59XG4iLCIvLyBTZXBhcmF0ZSBzZWVkZWQgc3RyZWFtcyBmb3IgaW5pdGlhbCBwb3NpdGlvbnMva2V5cyBhbmQgQ1BVIHNwcm91dCBzY2hlZHVsaW5nLlxuLy8gR1BVIGluLXBsYWNlIGtlcm5lbHMgaW5oZXJpdGVkIGZyb20gdGhlIHByb3RvdHlwZSBhcmUgbm90IGJpdHdpc2UgZGV0ZXJtaW5pc3RpYy5cbmV4cG9ydCBmdW5jdGlvbiBzZWVkZWRSYW5kb20oc2VlZDogbnVtYmVyKTogKCkgPT4gbnVtYmVyIHtcbiAgbGV0IHN0YXRlID0gc2VlZCA+Pj4gMDtcbiAgcmV0dXJuICgpID0+IHtcbiAgICBzdGF0ZSA9IChzdGF0ZSArIDB4NmQyYjc5ZjUpID4+PiAwO1xuICAgIGxldCB0ID0gTWF0aC5pbXVsKHN0YXRlIF4gKHN0YXRlID4+PiAxNSksIHN0YXRlIHwgMSk7XG4gICAgdCBePSB0ICsgTWF0aC5pbXVsKHQgXiAodCA+Pj4gNyksIHQgfCA2MSk7XG4gICAgcmV0dXJuICgodCBeICh0ID4+PiAxNCkpID4+PiAwKSAvIDQyOTQ5NjcyOTY7XG4gIH07XG59XG4iLCJleHBvcnQgY2xhc3MgRnJhbWVCdWRnZXQge1xuICBwcml2YXRlIHN0ZXBNcyA9IDQ7XG4gIHByaXZhdGUgb3ZlcmhlYWRNcyA9IDI7XG4gIGNob29zZShtYXhTdGVwczogbnVtYmVyLCB0YXJnZXRGUFM6IG51bWJlcikge1xuICAgIGNvbnN0IGJ1ZGdldCA9IE1hdGgubWF4KDEsIDEwMDAgLyBNYXRoLm1heCgxLCB0YXJnZXRGUFMpIC0gMiAtIHRoaXMub3ZlcmhlYWRNcyk7XG4gICAgcmV0dXJuIE1hdGgubWF4KDEsIE1hdGgubWluKE1hdGguZmxvb3IobWF4U3RlcHMpLCBNYXRoLmZsb29yKGJ1ZGdldCAvIE1hdGgubWF4KDAuMSwgdGhpcy5zdGVwTXMpKSkpO1xuICB9XG4gIG9ic2VydmUoc3RlcHM6IG51bWJlciwgdG90YWxNczogbnVtYmVyLCBlbmNvZGVNczogbnVtYmVyKSB7XG4gICAgLy8gRml4ZWQgcGh5c2ljYWwgc3RlcHM7IGFkYXB0IGJhdGNoaW5nIG9ubHksIG5ldmVyIGR0IG9yIHNvbHZlciBpdGVyYXRpb25zLlxuICAgIHRoaXMuc3RlcE1zID0gMC44ICogdGhpcy5zdGVwTXMgKyAwLjIgKiBNYXRoLm1heCgwLjEsICh0b3RhbE1zIC0gdGhpcy5vdmVyaGVhZE1zKSAvIHN0ZXBzKTtcbiAgICB0aGlzLm92ZXJoZWFkTXMgPSAwLjkgKiB0aGlzLm92ZXJoZWFkTXMgKyAwLjEgKiBNYXRoLm1pbigzLCBlbmNvZGVNcyAvIE1hdGgubWF4KDEsIHN0ZXBzKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgRnJhbWVTYW1wbGUgPSB7IGF0OiBudW1iZXI7IHN0ZXBzOiBudW1iZXI7IGVuY29kZU1zOiBudW1iZXI7IHF1ZXVlVGFpbE1zOiBudW1iZXI7IHRvdGFsTXM6IG51bWJlciB9O1xuZnVuY3Rpb24gZGlzdHJpYnV0aW9uKHZhbHVlczogbnVtYmVyW10pIHtcbiAgY29uc3Qgc29ydGVkID0gWy4uLnZhbHVlc10uc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuICByZXR1cm4gc29ydGVkLmxlbmd0aFxuICAgID8geyBtZWRpYW46IHNvcnRlZFtzb3J0ZWQubGVuZ3RoID4+IDFdLCBwOTU6IHNvcnRlZFtNYXRoLm1pbihzb3J0ZWQubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcihzb3J0ZWQubGVuZ3RoICogMC45NSkpXSwgbWF4OiBzb3J0ZWQuYXQoLTEpIH1cbiAgICA6IG51bGw7XG59XG5leHBvcnQgY2xhc3MgTGl2ZVBlcmZvcm1hbmNlIHtcbiAgcHJpdmF0ZSBmcmFtZXM6IEZyYW1lU2FtcGxlW10gPSBbXTtcbiAgcHJpdmF0ZSBpbnB1dHM6IG51bWJlcltdID0gW107XG4gIGlucHV0VmVyc2lvbiA9IDA7XG4gIHByaXZhdGUgcHJvY2Vzc2VkVmVyc2lvbiA9IDA7XG4gIHByaXZhdGUgaW5wdXRBdCA9IDA7XG4gIGNvYWxlc2NlZElucHV0cyA9IDA7XG4gIGlucHV0KCkge1xuICAgIHRoaXMuaW5wdXRBdCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHJldHVybiArK3RoaXMuaW5wdXRWZXJzaW9uO1xuICB9XG4gIGlucHV0U25hcHNob3QoKSB7XG4gICAgcmV0dXJuIHsgdmVyc2lvbjogdGhpcy5pbnB1dFZlcnNpb24sIGF0OiB0aGlzLmlucHV0QXQgfTtcbiAgfVxuICBmcmFtZShzYW1wbGU6IEZyYW1lU2FtcGxlLCBpbnB1dDogeyB2ZXJzaW9uOiBudW1iZXI7IGF0OiBudW1iZXIgfSkge1xuICAgIHRoaXMuZnJhbWVzLnB1c2goc2FtcGxlKTtcbiAgICBpZiAodGhpcy5mcmFtZXMubGVuZ3RoID4gNjAwKSB0aGlzLmZyYW1lcy5zaGlmdCgpO1xuICAgIGlmIChpbnB1dC52ZXJzaW9uID4gdGhpcy5wcm9jZXNzZWRWZXJzaW9uKSB7XG4gICAgICB0aGlzLmNvYWxlc2NlZElucHV0cyArPSBNYXRoLm1heCgwLCBpbnB1dC52ZXJzaW9uIC0gdGhpcy5wcm9jZXNzZWRWZXJzaW9uIC0gMSk7XG4gICAgICB0aGlzLnByb2Nlc3NlZFZlcnNpb24gPSBpbnB1dC52ZXJzaW9uO1xuICAgICAgdGhpcy5pbnB1dHMucHVzaChzYW1wbGUuYXQgLSBpbnB1dC5hdCk7XG4gICAgICBpZiAodGhpcy5pbnB1dHMubGVuZ3RoID4gMjU2KSB0aGlzLmlucHV0cy5zaGlmdCgpO1xuICAgIH1cbiAgfVxuICBjbGVhckZyYW1lcygpIHtcbiAgICB0aGlzLmZyYW1lcy5sZW5ndGggPSAwO1xuICB9XG4gIHNuYXBzaG90KCkge1xuICAgIGNvbnN0IGZyYW1lcyA9IHRoaXMuZnJhbWVzLFxuICAgICAgc3BhbiA9IGZyYW1lcy5sZW5ndGggPiAxID8gKGZyYW1lcy5hdCgtMSkhLmF0IC0gZnJhbWVzWzBdLmF0KSAvIDEwMDAgOiAwO1xuICAgIGNvbnN0IGludGVydmFscyA9IGZyYW1lcy5zbGljZSgxKS5tYXAoKGYsIGkpID0+IGYuYXQgLSBmcmFtZXNbaV0uYXQpO1xuICAgIHJldHVybiB7XG4gICAgICB3aW5kb3dGcmFtZXM6IGZyYW1lcy5sZW5ndGgsXG4gICAgICByZW5kZXJGUFM6IHNwYW4gPyAoZnJhbWVzLmxlbmd0aCAtIDEpIC8gc3BhbiA6IDAsXG4gICAgICBzdGVwc1BlclNlY29uZDogc3BhbiA/IGZyYW1lcy5zbGljZSgxKS5yZWR1Y2UoKG4sIGYpID0+IG4gKyBmLnN0ZXBzLCAwKSAvIHNwYW4gOiAwLFxuICAgICAgZnJhbWVJbnRlcnZhbE1zOiBkaXN0cmlidXRpb24oaW50ZXJ2YWxzKSxcbiAgICAgIGVuY29kZU1zOiBkaXN0cmlidXRpb24oZnJhbWVzLm1hcCgoZikgPT4gZi5lbmNvZGVNcykpLFxuICAgICAgcXVldWVUYWlsTXM6IGRpc3RyaWJ1dGlvbihmcmFtZXMubWFwKChmKSA9PiBmLnF1ZXVlVGFpbE1zKSksXG4gICAgICBpbnB1dFRvQ29tcGxldGVkRnJhbWVNczogZGlzdHJpYnV0aW9uKHRoaXMuaW5wdXRzKSxcbiAgICAgIGNvYWxlc2NlZElucHV0czogdGhpcy5jb2FsZXNjZWRJbnB1dHMsXG4gICAgfTtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFJlbmRlck1vZHVsZSB7XG4gIHByaXZhdGUgZGV2aWNlOiBHUFVEZXZpY2U7XG4gIHByaXZhdGUgY2FudmFzRm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0O1xuXG4gIC8vIFJlbmRlcmluZyByZXNvdXJjZXNcbiAgcHJpdmF0ZSBpbnRlcm1lZGlhdGVUZXh0dXJlOiBHUFVUZXh0dXJlO1xuICBwcml2YXRlIGNvbXB1dGVSZW5kZXJQaXBlbGluZTogR1BVQ29tcHV0ZVBpcGVsaW5lO1xuICBwcml2YXRlIHJlbmRlclBpcGVsaW5lOiBHUFVSZW5kZXJQaXBlbGluZTtcbiAgcHJpdmF0ZSBiaW5kR3JvdXBQb3N0UHJvY2VzczogR1BVQmluZEdyb3VwO1xuICBwcml2YXRlIHJlbmRlckJpbmRHcm91cDogR1BVQmluZEdyb3VwO1xuXG4gIHByaXZhdGUgVEVYVFVSRV9XT1JLR1JPVVBfQ09VTlQ6IFtudW1iZXIsIG51bWJlcl07XG5cbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIGRldmljZTogR1BVRGV2aWNlLFxuICAgIGNhbnZhc0Zvcm1hdDogR1BVVGV4dHVyZUZvcm1hdCxcbiAgICBjYW52YXNTaXplOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0sXG4gICAgcmVuZGVyU2hhZGVyOiBHUFVTaGFkZXJNb2R1bGUsXG4gICAgdGV4dHVyZXM6IHtcbiAgICAgIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbiAgICB9LFxuICAgIHNoYXJlZExheW91dEVudHJpZXM6IEdQVUJpbmRHcm91cExheW91dEVudHJ5W10sXG4gICAgc2hhcmVkQmluZEdyb3VwRW50cmllczogR1BVQmluZEdyb3VwRW50cnlbXVxuICApIHtcbiAgICB0aGlzLmRldmljZSA9IGRldmljZTtcbiAgICB0aGlzLmNhbnZhc0Zvcm1hdCA9IGNhbnZhc0Zvcm1hdDtcbiAgICB0aGlzLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UID0gW01hdGguY2VpbCh0ZXh0dXJlcy5zaXplLndpZHRoIC8gMTYpLCBNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS5oZWlnaHQgLyAxNildO1xuXG4gICAgY29uc3QgQklORElOR19JTlRFUk1FRElBVEVfVEVYVFVSRSA9IDEwO1xuXG4gICAgdGhpcy5pbnRlcm1lZGlhdGVUZXh0dXJlID0gdGhpcy5kZXZpY2UuY3JlYXRlVGV4dHVyZSh7XG4gICAgICBzaXplOiBbY2FudmFzU2l6ZS53aWR0aCwgY2FudmFzU2l6ZS5oZWlnaHRdLFxuICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5DT1BZX1NSQyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzXCIsXG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIC4uLnNoYXJlZExheW91dEVudHJpZXMsXG4gICAgICAgIHtcbiAgICAgICAgICBiaW5kaW5nOiBCSU5ESU5HX0lOVEVSTUVESUFURV9URVhUVVJFLFxuICAgICAgICAgIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUgfCBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCxcbiAgICAgICAgICBzdG9yYWdlVGV4dHVyZToge1xuICAgICAgICAgICAgYWNjZXNzOiBcIndyaXRlLW9ubHlcIixcbiAgICAgICAgICAgIGZvcm1hdDogXCJyZ2JhOHVub3JtXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmJpbmRHcm91cFBvc3RQcm9jZXNzID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICAgIGxhYmVsOiBgQmluZCBHcm91cCBQb3N0IFByb2Nlc3NgLFxuICAgICAgbGF5b3V0OiBiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2VzcyxcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgLi4uc2hhcmVkQmluZEdyb3VwRW50cmllcyxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXRQb3N0UHJvY2VzcyA9IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcInBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3NcIixcbiAgICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2Vzc10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbXB1dGVSZW5kZXJQaXBlbGluZSA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgICBsYXlvdXQ6IHBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3MsXG4gICAgICBjb21wdXRlOiB7IG1vZHVsZTogcmVuZGVyU2hhZGVyLCBlbnRyeVBvaW50OiBcInJlbmRlclwiIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBzY3JlZW5TYW1wbGVyID0gdGhpcy5kZXZpY2UuY3JlYXRlU2FtcGxlcih7XG4gICAgICBtYWdGaWx0ZXI6IFwibmVhcmVzdFwiLFxuICAgICAgbWluRmlsdGVyOiBcIm5lYXJlc3RcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbmRlckJpbmRHcm91cExheW91dCA9IHRoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICBsYWJlbDogXCJSZW5kZXIgQmluZCBHcm91cCBMYXlvdXRcIixcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgeyBiaW5kaW5nOiAwLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCwgc2FtcGxlcjogeyB0eXBlOiBcIm5vbi1maWx0ZXJpbmdcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsIHRleHR1cmU6IHt9IH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJCaW5kR3JvdXAgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIEJpbmQgR3JvdXBcIixcbiAgICAgIGxheW91dDogcmVuZGVyQmluZEdyb3VwTGF5b3V0LFxuICAgICAgZW50cmllczogW1xuICAgICAgICB7IGJpbmRpbmc6IDAsIHJlc291cmNlOiBzY3JlZW5TYW1wbGVyIH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCkgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclBpcGVsaW5lID0gdGhpcy5kZXZpY2UuY3JlYXRlUmVuZGVyUGlwZWxpbmUoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIFBpcGVsaW5lXCIsXG4gICAgICBsYXlvdXQ6IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgICAgYmluZEdyb3VwTGF5b3V0czogW3RoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7IGVudHJpZXM6IFtdIH0pLCByZW5kZXJCaW5kR3JvdXBMYXlvdXRdLFxuICAgICAgfSksXG4gICAgICB2ZXJ0ZXg6IHtcbiAgICAgICAgbW9kdWxlOiByZW5kZXJTaGFkZXIsXG4gICAgICAgIGVudHJ5UG9pbnQ6IFwidmVydFwiLFxuICAgICAgfSxcbiAgICAgIGZyYWdtZW50OiB7XG4gICAgICAgIG1vZHVsZTogcmVuZGVyU2hhZGVyLFxuICAgICAgICBlbnRyeVBvaW50OiBcImZyYWdcIixcbiAgICAgICAgdGFyZ2V0czogW3sgZm9ybWF0OiB0aGlzLmNhbnZhc0Zvcm1hdCB9XSxcbiAgICAgIH0sXG4gICAgICBwcmltaXRpdmU6IHtcbiAgICAgICAgdG9wb2xvZ3k6IFwidHJpYW5nbGUtbGlzdFwiLFxuICAgICAgfSxcbiAgICB9KTtcblxuICB9XG5cbiAgcHVibGljIHJlbmRlcihjYW52YXNDb250ZXh0OiBHUFVDYW52YXNDb250ZXh0LCBxdWVyeVNldD86IEdQVVF1ZXJ5U2V0LCByZXNvbHZlQnVmZmVyPzogR1BVQnVmZmVyLCByZXN1bHRCdWZmZXI/OiBHUFVCdWZmZXIpIHtcbiAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG5cbiAgICAvLyAxLiBNYWluIGNvbXB1dGUgcmVuZGVyIHBhc3NcbiAgICBjb25zdCBwYXNzQ29tcHV0ZSA9IGNvbW1hbmRFbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICBwYXNzQ29tcHV0ZS5zZXRQaXBlbGluZSh0aGlzLmNvbXB1dGVSZW5kZXJQaXBlbGluZSk7XG4gICAgcGFzc0NvbXB1dGUuc2V0QmluZEdyb3VwKDAsIHRoaXMuYmluZEdyb3VwUG9zdFByb2Nlc3MpO1xuICAgIHBhc3NDb21wdXRlLmRpc3BhdGNoV29ya2dyb3VwcyguLi50aGlzLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UKTtcbiAgICBwYXNzQ29tcHV0ZS5lbmQoKTtcblxuICAgIC8vIDIuIE1haW4gcmVuZGVyIHBhc3NcbiAgICBjb25zdCByZW5kZXJQYXNzID0gY29tbWFuZEVuY29kZXIuYmVnaW5SZW5kZXJQYXNzKHtcbiAgICAgIGNvbG9yQXR0YWNobWVudHM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHZpZXc6IGNhbnZhc0NvbnRleHQuZ2V0Q3VycmVudFRleHR1cmUoKS5jcmVhdGVWaWV3KCksXG4gICAgICAgICAgbG9hZE9wOiBcImNsZWFyXCIsXG4gICAgICAgICAgY2xlYXJWYWx1ZTogeyByOiAwLCBnOiAwLCBiOiAwLCBhOiAxIH0sXG4gICAgICAgICAgc3RvcmVPcDogXCJzdG9yZVwiLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcbiAgICByZW5kZXJQYXNzLnNldFBpcGVsaW5lKHRoaXMucmVuZGVyUGlwZWxpbmUpO1xuICAgIHJlbmRlclBhc3Muc2V0QmluZEdyb3VwKDEsIHRoaXMucmVuZGVyQmluZEdyb3VwKTtcbiAgICByZW5kZXJQYXNzLmRyYXcoNiwgMSwgMCwgMCk7XG4gICAgcmVuZGVyUGFzcy5lbmQoKTtcblxuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLnN1Ym1pdChbY29tbWFuZEVuY29kZXIuZmluaXNoKCldKTtcbiAgfVxufVxuIiwiLy8gQWN0dWFsIEdQVSBjaGVja3MgZm9yIHNlbGVjdGl2ZSByZW5ld2FsLCBnZW51aW5lIHRldGhlciBkd2VsbCwgYW5kIGEgcG9sYXJpdHlcbi8vIGRpcmVjdGlvbiB0aGF0IHN1cnZpdmVzIHRyYW5zbGF0aW9uLiBGcmVzaCBmaXh0dXJlIHBhZ2VzIG9ubHkuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGVzdFJlbmV3YWwoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBidWZmZXJzOiB7IGFjdGluOiBHUFVCdWZmZXI7IG1lbWJyYW5lOiBHUFVCdWZmZXI7IGxpbmtzOiBHUFVCdWZmZXI7IHNuYXBzaG90OiBHUFVCdWZmZXIgfSxcbiAgY291bnRzOiB7IGFjdGluOiBudW1iZXI7IG1lbWJyYW5lOiBudW1iZXIgfSxcbiAgY29uZmlndXJlOiAodmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+KSA9PiB2b2lkLFxuICBkaXNwYXRjaDogKGtpbmQ6IFwicG9sYXJpdHlcIiB8IFwidHVybm92ZXJcIiB8IFwidGV0aGVyXCIgfCBcIm1vdG9yXCIsIHJlcGVhdHM/OiBudW1iZXIpID0+IHZvaWRcbikge1xuICBjb25zdCBjaGVja3M6IHsgbmFtZTogc3RyaW5nOyBwYXNzZWQ6IGJvb2xlYW4gfVtdID0gW107XG4gIGNvbnN0IGFzc2VydCA9IChuYW1lOiBzdHJpbmcsIHBhc3NlZDogYm9vbGVhbikgPT4ge1xuICAgIGNoZWNrcy5wdXNoKHsgbmFtZSwgcGFzc2VkIH0pO1xuICAgIGlmICghcGFzc2VkKSB0aHJvdyBFcnJvcihgUmVuZXdhbCBmaXh0dXJlIGZhaWxlZDogJHtuYW1lfWApO1xuICB9O1xuICBjb25zdCByZWFkID0gYXN5bmMgKGJ1ZmZlcjogR1BVQnVmZmVyLCBvZmZzZXQgPSAwLCBzaXplID0gYnVmZmVyLnNpemUpID0+IHtcbiAgICBjb25zdCBzdGFnZSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICBjb25zdCBlID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZS5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCBvZmZzZXQsIHN0YWdlLCAwLCBzaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgc3RhZ2UubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICBjb25zdCBkYXRhID0gc3RhZ2UuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICBzdGFnZS51bm1hcCgpO1xuICAgIHN0YWdlLmRlc3Ryb3koKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfTtcbiAgZnVuY3Rpb24gbWVtYnJhbmUoc2hpZnQgPSAwLCBhdENvbnRhY3QgPSBmYWxzZSkge1xuICAgIGNvbnN0IGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5tZW1icmFuZS5zaXplKSxcbiAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkoZGF0YSksXG4gICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgICBjb25zdCBhbmdsZSA9ICgyICogTWF0aC5QSSAqIGkpIC8gY291bnRzLm1lbWJyYW5lO1xuICAgICAgdVtpICogMTBdID0gaTtcbiAgICAgIHVbaSAqIDEwICsgNl0gPSAoaSArIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBmW2kgKiAxMCArIDJdID0gNTAgKyBzaGlmdCArIDQ1ICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgZltpICogMTAgKyAzXSA9IDUwICsgNDUgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICBmW2kgKiAxMCArIDhdID0gaTtcbiAgICB9XG4gICAgaWYgKGF0Q29udGFjdCkge1xuICAgICAgZlsyXSA9IDEyO1xuICAgICAgZlszXSA9IDUwO1xuICAgIH1cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgZGF0YSk7XG4gIH1cbiAgZnVuY3Rpb24gZmlsYW1lbnRzKGFnZTogbnVtYmVyLCBwb3NpdGlvbnMgPSBbMTAsIDE0LCA4NSwgODldKSB7XG4gICAgY29uc3QgZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLmFjdGluLnNpemUpLFxuICAgICAgdSA9IG5ldyBVaW50MzJBcnJheShkYXRhKSxcbiAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHVbaSAqIDEwXSA9IHVbaSAqIDEwICsgNl0gPSB1W2kgKiAxMCArIDddID0gaTtcbiAgICBwb3NpdGlvbnMuZm9yRWFjaCgoeCwgaSkgPT4ge1xuICAgICAgdVtpICogMTAgKyA2XSA9IGkgPCAyID8gMCA6IDI7XG4gICAgICB1W2kgKiAxMCArIDddID0gaSA8IDIgPyAxIDogMztcbiAgICAgIGZbaSAqIDEwICsgMl0gPSB4O1xuICAgICAgZltpICogMTAgKyAzXSA9IDUwO1xuICAgICAgZltpICogMTAgKyA0XSA9IDE7XG4gICAgICBmW2kgKiAxMCArIDldID0gYWdlO1xuICAgIH0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBkYXRhKTtcbiAgICByZXR1cm4gZGF0YTtcbiAgfVxuICBtZW1icmFuZSgpO1xuICBmaWxhbWVudHMoMTAwMCk7XG4gIGNvbmZpZ3VyZSh7IHBvbGFyaXR5TW9kZTogMCwgY3VlRW5hYmxlZDogMCB9KTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgY29uZmlndXJlKHtcbiAgICBwb2xhcml0eU1vZGU6IDEsXG4gICAgY3VlRW5hYmxlZDogMSxcbiAgICBjdWVYOiAxMDAsXG4gICAgY3VlWTogNTAsXG4gICAgcG9sYXJpdHlUdXJuUmF0ZTogMC4wMixcbiAgICByZWFyVHVybm92ZXI6IDEsXG4gICAgdHVybm92ZXJBZ2U6IDEwLFxuICAgIGRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eTogMCxcbiAgICBkZWJyYW5jaFByb2JhYmlsaXR5OiAwLFxuICB9KTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgZGlzcGF0Y2goXCJ0dXJub3ZlclwiKTtcbiAgbGV0IHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcImFnZWQgcmVhciBmaWxhbWVudCByZXR1cm5zIHRvIEctYWN0aW5cIiwgdVs2XSA9PT0gMCAmJiB1WzddID09PSAwICYmIHVbMTZdID09PSAxICYmIHVbMTddID09PSAxKTtcbiAgYXNzZXJ0KFwic2FtZS1hZ2VkIGZyb250IGZpbGFtZW50IGlzIHByb3RlY3RlZFwiLCB1WzI3XSA9PT0gMyAmJiB1WzM2XSA9PT0gMik7XG4gIGNvbnN0IGJyYW5jaCA9IGZpbGFtZW50cygwKSxcbiAgICBidSA9IG5ldyBVaW50MzJBcnJheShicmFuY2gpLFxuICAgIGJmID0gbmV3IEZsb2F0MzJBcnJheShicmFuY2gpO1xuICBidVsyNl0gPSAwO1xuICBidVsyN10gPSAyO1xuICBiZlsyMl0gPSAxMjtcbiAgYmZbMjNdID0gNTI7XG4gIGJmWzI5XSA9IDEwMDA7XG4gIGJ1WzM2XSA9IDM7XG4gIGJ1WzM3XSA9IDM7XG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmFjdGluLCAwLCBicmFuY2gpO1xuICBkaXNwYXRjaChcInR1cm5vdmVyXCIpO1xuICB1ID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICBhc3NlcnQoXCJvbGQgb25lLWJlYWQgYnJhbmNoIHJldHVybnMgdG8gdGhlIHNvbHVibGUgcG9vbFwiLCB1WzI2XSA9PT0gMiAmJiB1WzI3XSA9PT0gMik7XG4gIGFzc2VydChcImJyYW5jaCByZW1vdmFsIGRvZXMgbm90IGN1dCB0aGUgbW90aGVyIGZpbGFtZW50XCIsIHVbN10gPT09IDEgJiYgdVsxNl0gPT09IDApO1xuICBmaWxhbWVudHMoMCk7XG4gIGRpc3BhdGNoKFwidHVybm92ZXJcIik7XG4gIHUgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSk7XG4gIGFzc2VydChcInlvdW5nIHJlYXIgbmV0d29yayBpcyBub3QgcHJlbWF0dXJlbHkgY2xlYXJlZFwiLCB1WzddID09PSAxICYmIHVbMTZdID09PSAwKTtcbiAgY29uc3QgYmVmb3JlID0gbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuc25hcHNob3QsIDMyICogKGNvdW50cy5hY3RpbiArIGNvdW50cy5tZW1icmFuZSArIDEpLCAzMikpO1xuICBtZW1icmFuZSgxMDApO1xuICBkaXNwYXRjaChcInBvbGFyaXR5XCIpO1xuICBjb25zdCBhZnRlciA9IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLnNuYXBzaG90LCAzMiAqIChjb3VudHMuYWN0aW4gKyBjb3VudHMubWVtYnJhbmUgKyAxKSwgMzIpKTtcbiAgYXNzZXJ0KFwicG9sYXJpdHkgdmVjdG9yIHBlcnNpc3RzIHVuZGVyIGNlbGwgdHJhbnNsYXRpb25cIiwgTWF0aC5hYnMoYmVmb3JlWzJdIC0gYWZ0ZXJbMl0pIDwgMWUtNiAmJiBNYXRoLmFicyhiZWZvcmVbM10gLSBhZnRlclszXSkgPCAxZS02ICYmIGFmdGVyWzJdID4gMC45OSk7XG4gIG1lbWJyYW5lKCk7XG4gIGRpc3BhdGNoKFwicG9sYXJpdHlcIik7XG4gIGNvbmZpZ3VyZSh7IG1vdG9yUmVhckJpYXM6IDEsIG15b3NpblN0cmVuZ3RoOiAwLjA1LCBteW9zaW5TcGVlZDogMC4wMiB9KTtcbiAgZm9yIChjb25zdCBbcG9zaXRpb25zLCBuYW1lLCBhY3RpdmVdIG9mIFtcbiAgICBbWzEwLCAxNCwgMjAsIDE2XSwgXCJtYXR1cmUgcmVhciBtb3RvciBwcm9kdWNlcyBjb250cmFjdGlvblwiLCB0cnVlXSxcbiAgICBbWzgwLCA4NCwgOTAsIDg2XSwgXCJtYXR1cmUgZnJvbnQgbW90b3Igc3RheXMgaW5hY3RpdmVcIiwgZmFsc2VdLFxuICBdIGFzIGNvbnN0KSB7XG4gICAgZmlsYW1lbnRzKDEwMDAsIFsuLi5wb3NpdGlvbnNdKTtcbiAgICBjb25zdCBsaW5rID0gbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgY291bnRzLm1lbWJyYW5lKSk7XG4gICAgbGluay5zZXQoWzEsIDMsIDAsIDEsIDEsIDAsIDMsIDJdKTtcbiAgICBuZXcgRmxvYXQzMkFycmF5KGxpbmsuYnVmZmVyKVsyXSA9IDU7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmspO1xuICAgIGRpc3BhdGNoKFwibW90b3JcIik7XG4gICAgY29uc3QgbW92ZWQgPSBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICAgIGFzc2VydChuYW1lLCBhY3RpdmUgPyBtb3ZlZFsyXSA+IHBvc2l0aW9uc1swXSAmJiBtb3ZlZFsyMl0gPCBwb3NpdGlvbnNbMl0gOiBtb3ZlZFsyXSA9PT0gcG9zaXRpb25zWzBdICYmIG1vdmVkWzIyXSA9PT0gcG9zaXRpb25zWzJdKTtcbiAgfVxuICBtZW1icmFuZSgwLCB0cnVlKTtcbiAgZmlsYW1lbnRzKDEwMDApO1xuICBjb25zdCBsaW5rID0gbmV3IFVpbnQzMkFycmF5KDggKiAoMjU2ICsgY291bnRzLm1lbWJyYW5lKSk7XG4gIGxpbmsuc2V0KFsxLCAwLCAwLCA2MDAsIDEsIDAsIDAsIDBdLCAyNTYgKiA4KTtcbiAgbmV3IEZsb2F0MzJBcnJheShsaW5rLmJ1ZmZlcilbMjU2ICogOCArIDJdID0gMjtcbiAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubGlua3MsIDAsIGxpbmspO1xuICBjb25maWd1cmUoeyBtZW1icmFuZUNvdXBsaW5nOiAwLjA1LCB0ZXRoZXJUdXJub3ZlcjogMSwgdGV0aGVyT25SYXRlOiAxLCB0ZXRoZXJPZmZSYXRlOiAwLCB0ZXRoZXJMb2FkT2ZmOiAwLCB0ZXRoZXJSZWNvdmVyeVN0ZXBzOiA0MCB9KTtcbiAgZGlzcGF0Y2goXCJ0ZXRoZXJcIik7XG4gIGxldCBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwiZXhwaXJlZCB0ZXRoZXIgZW50ZXJzIGFuIHVuYm91bmQgZHdlbGxcIiwgbGlua3NbMjU2ICogOF0gPT09IDAgJiYgbGlua3NbMjU2ICogOCArIDNdID09PSA0MCk7XG4gIGRpc3BhdGNoKFwidGV0aGVyXCIpO1xuICBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwidGV0aGVyIGRvZXMgbm90IHJlYmluZCBvbiB0aGUgbmV4dCBzdGVwXCIsIGxpbmtzWzI1NiAqIDhdID09PSAwICYmIGxpbmtzWzI1NiAqIDggKyAzXSA9PT0gMzkpO1xuICBkaXNwYXRjaChcInRldGhlclwiLCA0MCk7XG4gIGxpbmtzID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5saW5rcykpO1xuICBhc3NlcnQoXCJ0ZXRoZXIgY2FuIHJlYmluZCBhZnRlciBpdHMgZHdlbGxcIiwgbGlua3NbMjU2ICogOF0gPiAwKTtcbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzKGRldmljZTogR1BVRGV2aWNlLCBtb2R1bGU6IEdQVVNoYWRlck1vZHVsZSwgbGF5b3V0OiBHUFVQaXBlbGluZUxheW91dCkge1xuICByZXR1cm4ge1xuICAgIHJlc29sdmVDdWU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc29sdmVfZnJvbnRfY3VlXCIgfSB9KSxcbiAgICBkcmF3Q3VlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJkcmF3X3Jlc29sdmVkX2N1ZVwiIH0gfSksXG4gICAgbWVhc3VyZUVuY2xvc3VyZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibWVhc3VyZV9lbmNsb3N1cmVcIiB9IH0pLFxuICAgIGJ1aWxkRW5jbG9zdXJlUm93czogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYnVpbGRfZW5jbG9zdXJlX3Jvd3NcIiB9IH0pLFxuICAgIGRyYXdSZXNlcnZvaXI6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfcmVzZXJ2b2lyX2NvbXBhcnRtZW50XCIgfSB9KSxcbiAgICBwcm9qZWN0RW5jbG9zdXJlQXJlYTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicHJvamVjdF9lbmNsb3N1cmVfYXJlYVwiIH0gfSksXG4gICAgY29udGFpbkZpbGFtZW50UG9pbnRzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJjb250YWluX2ZpbGFtZW50X3BvaW50c1wiIH0gfSksXG4gICAgY29udGFpbkZpbGFtZW50Qm9uZHM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNvbnRhaW5fZmlsYW1lbnRfYm9uZHNcIiB9IH0pLFxuICAgIHNuYXBzaG90TWVjaGFuaWNzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJzbmFwc2hvdF9tZWNoYW5pY3NcIiB9IH0pLFxuICAgIG1vdG9yTGlua3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1vdG9yX2xpbmtzXCIgfSB9KSxcbiAgICBtZW1icmFuZVRldGhlcnM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RldGhlcnNcIiB9IH0pLFxuICAgIGFwcGx5TWVjaGFuaWNhbEZvcmNlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYXBwbHlfbWVjaGFuaWNhbF9mb3JjZXNcIiB9IH0pLFxuICAgIGRyYXdNZWNoYW5pY2FsTGlua3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImRyYXdfbWVjaGFuaWNhbF9saW5rc1wiIH0gfSksXG4gICAgbGluZUNvbnN0cmFpbnQ6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImxpbmVfY29uc3RyYWludF91cGRhdGVzXCIgfSB9KSxcbiAgICBtZW1icmFuZVRhbmdlbnRpYWxGbG93OiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtZW1icmFuZV90YW5nZW50aWFsX2Zsb3dcIiB9IH0pLFxuICAgIG9yaWVudGF0aW9uVXBkYXRlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJvcmllbnRhdGlvbl91cGRhdGVzXCIgfSB9KSxcbiAgICBjb3NzZXJhdFVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiY29zc2VyYXRfdXBkYXRlc1wiIH0gfSksXG4gICAgcmVzZXRBY3RpbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwicmVzZXRfYWN0aW5cIiB9IH0pLFxuICAgIHJlc2V0TWVtYnJhbmU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc2V0X21lbWJyYW5lXCIgfSB9KSxcbiAgICBzdGVyaWNGb3JjZVVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwic3RlcmljX2ZvcmNlX3VwZGF0ZXNcIiB9IH0pLFxuICAgIGFjdGluQmluZDogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYmluZF9hY3Rpbl9tb25vbWVyXCIgfSB9KSxcbiAgICBhY3RpblBvbHltZXJQb3NpdGlvbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidXBkYXRlX2FjdGluX3BvbHltZXJfcG9zaXRpb25cIiB9IH0pLFxuICAgIGFjdGluTW9ub21lclBvc2l0aW9uOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfYWN0aW5fbW9ub21lcl9wb3NpdGlvblwiIH0gfSksXG4gICAgdW5iaW5kTWluUG9sZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidW5iaW5kX21pbl9wb2xlXCIgfSB9KSxcbiAgICBtZW1icmFuZVRvVGV4dHVyZXM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lbWJyYW5lX3RvX3RleHR1cmVzXCIgfSB9KSxcbiAgICBhY3RpbmVzVG9UZXh0dXJlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiYWN0aW5lc190b190ZXh0dXJlc1wiIH0gfSksXG4gICAgY2xlYXJSZW5kZXJMYXllcnM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNsZWFyX3JlbmRlcl9sYXllcnNcIiB9IH0pLFxuICAgIHVwZGF0ZVRleHR1cmVzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJ1cGRhdGVfdGV4dHVyZXNcIiB9IH0pLFxuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaChwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIsIHBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmUsIHg6IG51bWJlciwgeSA9IDEpIHtcbiAgcGFzcy5zZXRQaXBlbGluZShwaXBlbGluZSk7XG4gIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKHgsIHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuU2ltdWxhdGlvblN0ZXAoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgd29ya2dyb3VwQ291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgdGV4dHVyZVdvcmtncm91cENvdW50OiBbbnVtYmVyLCBudW1iZXJdLFxuICBsaW5lQ29uc3RyYWludEZ1bmN0aW9uOiAocGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyKSA9PiB2b2lkLFxuICBmcmFtZU5yOiBudW1iZXIsXG4gIGlzTGFzdFN0ZXBPZkZyYW1lOiBib29sZWFuLFxuICBlbmNsb3N1cmUgPSBmYWxzZSxcbiAgcGVyc2lzdGVudFBvbGFyaXR5ID0gZmFsc2UsXG4gIHF1ZXJ5SW5mbz86IHsgcXVlcnlTZXQ6IEdQVVF1ZXJ5U2V0OyBpc0ZpcnN0U3RlcDogYm9vbGVhbiB9XG4pIHtcbiAgLy8gT25lIHN1Ym1pc3Npb24gcGVyIGZpeGVkIHN0ZXAuIERpc3BhdGNoIG9yZGVyIGFuZCBpdGVyYXRpb24gY291bnRzIGFyZVxuICAvLyB1bmNoYW5nZWQ7IGRpc3BhdGNoIGJvdW5kYXJpZXMgcmV0YWluIHN0b3JhZ2UgZGVwZW5kZW5jaWVzLiBVbmlmb3JtIHdyaXRlc1xuICAvLyByZW1haW4gQkVGT1JFIGVhY2ggc3RlcCBzdWJtaXNzaW9uLCBzbyBzcHJvdXRzIGFyZSBub3Qgb3ZlcndyaXR0ZW4gYnkgdGhlXG4gIC8vIGxhc3Qgc3RlcCdzIHZhbHVlcyB3aGVuIHNldmVyYWwgZml4ZWQgc3RlcHMgc2hhcmUgYW4gYW5pbWF0aW9uIGZyYW1lLlxuICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3Moe1xuICAgIC4uLihxdWVyeUluZm8/LmlzRmlyc3RTdGVwICYmIHtcbiAgICAgIHRpbWVzdGFtcFdyaXRlczoge1xuICAgICAgICBxdWVyeVNldDogcXVlcnlJbmZvLnF1ZXJ5U2V0LFxuICAgICAgICBiZWdpbm5pbmdPZlBhc3NXcml0ZUluZGV4OiAwLFxuICAgICAgICBlbmRPZlBhc3NXcml0ZUluZGV4OiAxLFxuICAgICAgfSxcbiAgICB9KSxcbiAgfSk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG5cbiAgaWYgKHBlcnNpc3RlbnRQb2xhcml0eSkgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1lYXN1cmVFbmNsb3N1cmUsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMucmVzb2x2ZUN1ZSwgMSk7XG5cbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lKSB7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNsZWFyUmVuZGVyTGF5ZXJzLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICB9XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zdGVyaWNGb3JjZVVwZGF0ZSwgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FKTtcbiAgbGluZUNvbnN0cmFpbnRGdW5jdGlvbihwYXNzKTtcbiAgaWYgKGVuY2xvc3VyZSkgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmJ1aWxkRW5jbG9zdXJlUm93cywgTWF0aC5jZWlsKCh0ZXh0dXJlV29ya2dyb3VwQ291bnRbMV0gKiAxNikgLyAoNCAqIDI1NikpKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFjdGluQmluZCwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFjdGluUG9seW1lclBvc2l0aW9uLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYWN0aW5Nb25vbWVyUG9zaXRpb24sIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy51bmJpbmRNaW5Qb2xlLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBpZiAoZW5jbG9zdXJlKSBlbmNvZGVFbmNsb3N1cmUocGFzcywgcGlwZWxpbmVzLCB3b3JrZ3JvdXBDb3VudHMsIHRleHR1cmVXb3JrZ3JvdXBDb3VudFsxXSAqIDE2KTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1lbWJyYW5lVG9UZXh0dXJlcywgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFjdGluZXNUb1RleHR1cmVzLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMudXBkYXRlVGV4dHVyZXMsIC4uLnRleHR1cmVXb3JrZ3JvdXBDb3VudCk7XG4gIGNvbnN0IG1lY2hhbmljYWxDb3VudCA9IHdvcmtncm91cENvdW50cy5BQ1RJTiArIHdvcmtncm91cENvdW50cy5NRU1CUkFORTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzLCBtZWNoYW5pY2FsQ291bnQpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubW90b3JMaW5rcywgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZW1icmFuZVRldGhlcnMsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hcHBseU1lY2hhbmljYWxGb3JjZXMsIG1lY2hhbmljYWxDb3VudCk7XG4gIGlmIChlbmNsb3N1cmUpIGVuY29kZUVuY2xvc3VyZShwYXNzLCBwaXBlbGluZXMsIHdvcmtncm91cENvdW50cywgdGV4dHVyZVdvcmtncm91cENvdW50WzFdICogMTYpO1xuICBpZiAoaXNMYXN0U3RlcE9mRnJhbWUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3TWVjaGFuaWNhbExpbmtzLCAxICsgd29ya2dyb3VwQ291bnRzLk1FTUJSQU5FKTtcbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lICYmIGVuY2xvc3VyZSkgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmRyYXdSZXNlcnZvaXIsIC4uLnRleHR1cmVXb3JrZ3JvdXBDb3VudCk7XG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSkgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmRyYXdDdWUsIDEpO1xuICBwYXNzLmVuZCgpO1xuICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydW5FbmNsb3N1cmUoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXJcbikge1xuICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcbiAgZW5jb2RlRW5jbG9zdXJlKHBhc3MsIHBpcGVsaW5lcywgY291bnRzLCBoZWlnaHQpO1xuICBwYXNzLmVuZCgpO1xuICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG59XG5cbi8vIEZyb3plbi10aW1lIGNvcnJlY3Rpb246IG5vIHJlYWN0aW9ucywgYWdlcywgbW90b3JzLCBtZW1icmFuZSBtb3Rpb24gb3IgYXJlYVxuLy8gcHJvamVjdGlvbi4gVGhlIGNhbGxlciB2ZXJpZmllcyB0aGUgZnVsbCBzdGF0ZSBhZnRlciBlYWNoIGJvdW5kZWQgYmF0Y2guXG5leHBvcnQgZnVuY3Rpb24gcnVuQ29udGFjdFJlcGFpcihcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIHBpcGVsaW5lczogUmV0dXJuVHlwZTx0eXBlb2YgY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcz4sXG4gIGJpbmRHcm91cDogR1BVQmluZEdyb3VwLFxuICBjb3VudHM6IHsgQUNUSU46IG51bWJlcjsgTUVNQlJBTkU6IG51bWJlciB9LFxuICBoZWlnaHQ6IG51bWJlcixcbiAgaXRlcmF0aW9uczogbnVtYmVyXG4pIHtcbiAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpLFxuICAgIHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgcGFzcy5zZXRCaW5kR3JvdXAoMCwgYmluZEdyb3VwKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmJ1aWxkRW5jbG9zdXJlUm93cywgTWF0aC5jZWlsKGhlaWdodCAvICg0ICogMjU2KSkpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGl0ZXJhdGlvbnM7IGkrKykge1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jb250YWluRmlsYW1lbnRQb2ludHMsIGNvdW50cy5BQ1RJTik7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnNuYXBzaG90TWVjaGFuaWNzLCBjb3VudHMuQUNUSU4gKyBjb3VudHMuTUVNQlJBTkUpO1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jb250YWluRmlsYW1lbnRCb25kcywgY291bnRzLkFDVElOKTtcbiAgfVxuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50UG9pbnRzLCBjb3VudHMuQUNUSU4pO1xuICBwYXNzLmVuZCgpO1xuICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG59XG5cbmZ1bmN0aW9uIGVuY29kZUVuY2xvc3VyZShcbiAgcGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBjb3VudHM6IHsgQUNUSU46IG51bWJlcjsgTUVNQlJBTkU6IG51bWJlciB9LFxuICBoZWlnaHQ6IG51bWJlclxuKSB7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZWFzdXJlRW5jbG9zdXJlLCAxKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnByb2plY3RFbmNsb3N1cmVBcmVhLCBjb3VudHMuTUVNQlJBTkUpO1xuICAvLyBSZWZyZXNoIHRoZSBtZWFzdXJlZCBhcmVhIGFmdGVyIHByb2plY3Rpb24gZm9yIHRoZSBuZXh0IHJlYWN0aW9uIHN0ZXAuXG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZWFzdXJlRW5jbG9zdXJlLCAxKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmJ1aWxkRW5jbG9zdXJlUm93cywgTWF0aC5jZWlsKGhlaWdodCAvICg0ICogMjU2KSkpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50UG9pbnRzLCBjb3VudHMuQUNUSU4pO1xuICBmb3IgKGxldCBpdGVyYXRpb24gPSAwOyBpdGVyYXRpb24gPCAyOyBpdGVyYXRpb24rKykge1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgY291bnRzLkFDVElOICsgY291bnRzLk1FTUJSQU5FKTtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50Qm9uZHMsIGNvdW50cy5BQ1RJTik7XG4gIH1cbn1cbiIsIi8vIFNjaGVkdWxlcyBzaG9ydC1saXZlZCBwb2x5bWVyaXphdGlvbiBzaXRlcyBvbiB0aGUgbWVtYnJhbmUsIHNvIGxvY2FsIHByb3RydXNpb25zIHNwcm91dCBhbmQgcmV0cmFjdC5cbi8vIEVhY2ggc2xvdCBhbHRlcm5hdGVzIGJldHdlZW4gb24gKGEgc2l0ZSBhdCBhIGZpeGVkIG1lbWJyYW5lIHBvc2l0aW9uKSBhbmQgb2ZmLCB3aXRoIHJhbmRvbSBkdXJhdGlvbnMsXG4vLyBzbyB0aGUgbnVtYmVyIG9mIGFjdGl2ZSBzaXRlcyBmbHVjdHVhdGVzLiBPZmZzZXRzIGxhbmQgaW4gdGhlIGZyb250IDMwJTsgdGhlXG4vLyBHUFUgbWFwcyB0aGVtIGludG8gdGhlIHNlbGVjdGVkIHBvbGFyaXR5IGZyYW1lIHdpdGhvdXQgZXh0cmEgUk5HIGRyYXdzLlxuXG5leHBvcnQgY29uc3QgTUFYX1NQUk9VVF9TSVRFUyA9IDg7XG4vLyBoYWxmIG9mIHRoZSBmcm9udCByZWdpb24gd2hlcmUgc2l0ZXMgY2FuIGxhbmQsIGluIG5vcm1hbGl6ZWQgYXJjIGxlbmd0aCAoMC4xNSA9IGZyb250IDMwJSBvZiB0aGUgbWVtYnJhbmUpXG5jb25zdCBGUk9OVF9IQUxGX1dJRFRIID0gMC4xNTtcblxudHlwZSBTbG90ID0geyBjZW50ZXI6IG51bWJlcjsgb25VbnRpbDogbnVtYmVyOyBvZmZVbnRpbDogbnVtYmVyIH07XG5cbmV4cG9ydCBjbGFzcyBTcHJvdXRTY2hlZHVsZXIge1xuICBwcml2YXRlIHNsb3RzOiBTbG90W10gPSBbXTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzdGFnZ2VyU3RlcHM6IG51bWJlcixcbiAgICBwcml2YXRlIHJhbmRvbSA9IE1hdGgucmFuZG9tXG4gICkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTUFYX1NQUk9VVF9TSVRFUzsgaSsrKSB7XG4gICAgICAvLyBzdGFnZ2VyIHRoZSBmaXJzdCBzd2l0Y2gtb24gb3ZlciBhIHdob2xlIG9uL29mZiBjeWNsZSBzbyB0aGUgc2l0ZXMgZG9uJ3QgYWxsIHN0YXJ0IHRvZ2V0aGVyXG4gICAgICB0aGlzLnNsb3RzLnB1c2goeyBjZW50ZXI6IDAsIG9uVW50aWw6IDAsIG9mZlVudGlsOiB0aGlzLnJhbmRvbSgpICogc3RhZ2dlclN0ZXBzIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFdyaXRlcyBbY2VudGVyIChub3JtYWxpemVkIGFyYyBsZW5ndGgpLCBoYWxmV2lkdGggKG5vZGVzKSwgc3RyZW5ndGgsIDBdIHBlciBzbG90IGludG8gYG91dGAuXG4gIHVwZGF0ZShcbiAgICBzdGVwOiBudW1iZXIsXG4gICAgcGFyYW1zOiB7IHNwcm91dENvdW50OiBudW1iZXI7IHNwcm91dFdpZHRoOiBudW1iZXI7IHNwcm91dEZyb250QmlhczogbnVtYmVyOyBzcHJvdXRPblN0ZXBzOiBudW1iZXI7IHNwcm91dE9mZlN0ZXBzOiBudW1iZXIgfSxcbiAgICBvdXQ6IEZsb2F0MzJBcnJheVxuICApIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1BWF9TUFJPVVRfU0lURVM7IGkrKykge1xuICAgICAgY29uc3Qgc2xvdCA9IHRoaXMuc2xvdHNbaV07XG4gICAgICBpZiAoc3RlcCA+PSBzbG90Lm9mZlVudGlsICYmIHN0ZXAgPj0gc2xvdC5vblVudGlsKSB7XG4gICAgICAgIHNsb3QuY2VudGVyID0gc2FtcGxlQ2VudGVyKHBhcmFtcy5zcHJvdXRGcm9udEJpYXMsIHRoaXMucmFuZG9tKTtcbiAgICAgICAgc2xvdC5vblVudGlsID0gc3RlcCArIHBhcmFtcy5zcHJvdXRPblN0ZXBzICogKDAuNSArIHRoaXMucmFuZG9tKCkpO1xuICAgICAgICBzbG90Lm9mZlVudGlsID0gc2xvdC5vblVudGlsICsgcGFyYW1zLnNwcm91dE9mZlN0ZXBzICogKDAuNSArIHRoaXMucmFuZG9tKCkpO1xuICAgICAgfVxuICAgICAgY29uc3QgYWN0aXZlID0gaSA8IHBhcmFtcy5zcHJvdXRDb3VudCAmJiBzdGVwIDwgc2xvdC5vblVudGlsO1xuICAgICAgb3V0LnNldChbc2xvdC5jZW50ZXIsIHBhcmFtcy5zcHJvdXRXaWR0aCAqIDAuNSwgYWN0aXZlID8gMSA6IDAsIDBdLCBpICogNCk7XG4gICAgfVxuICB9XG59XG5cbi8vIE5lYXIgdGhlIGZyb250IChhcmMgbGVuZ3RoIDApIHdpdGggcHJvYmFiaWxpdHkgYGZyb250Qmlhc2AsIGFueXdoZXJlIGluIHRoZSBmcm9udCByZWdpb24gb3RoZXJ3aXNlLlxuZnVuY3Rpb24gc2FtcGxlQ2VudGVyKGZyb250QmlhczogbnVtYmVyLCByYW5kb206ICgpID0+IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBvZmZzZXQgPSAocmFuZG9tKCkgLSAwLjUpICogMiAqIEZST05UX0hBTEZfV0lEVEg7XG4gIGlmIChyYW5kb20oKSA8IGZyb250Qmlhcykge1xuICAgIGNvbnN0IGdhdXNzaWFuID0gTWF0aC5zcXJ0KC0yICogTWF0aC5sb2coMSAtIHJhbmRvbSgpKSkgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIHJhbmRvbSgpKTtcbiAgICBvZmZzZXQgPSBNYXRoLm1heCgtRlJPTlRfSEFMRl9XSURUSCwgTWF0aC5taW4oRlJPTlRfSEFMRl9XSURUSCwgZ2F1c3NpYW4gKiAwLjA4KSk7XG4gIH1cbiAgcmV0dXJuIChvZmZzZXQgKyAxKSAlIDE7XG59XG4iLCIvLyBQdXJlIGZ1bGwtc25hcHNob3QgZGlhZ25vc3RpY3MuIFJ1bnMgaW4gdGhlIGJvdW5kZWQgd29ya2VyLCB3aXRoIG5vIERPTSBvclxuLy8gR1BVIGFjY2Vzcy4gR2VvbWV0cnkgY2hlY2tzLCB0b3BvbG9neSB3YWxrcyBhbmQgY291bnRlciBzZW1hbnRpY3MgYXJlIHNoYXJlZFxuLy8gYnkgbGl2ZSBkaWFnbm9zdGljcyBhbmQgZXZlcnkgZm9yY2VkIHNjaWVudGlmaWMtYXNzYXkgY2hlY2twb2ludC5cbmltcG9ydCB7IHBvbHlnb25PY2N1cGFuY3ksIHBvbHlnb25Cb25kQ3Jvc3NpbmcgfSBmcm9tIFwiLi9vY2N1cGFuY3lcIjtcblxuY29uc3QgU0VHTUVOVF9XT1JEUyA9IDEwOyAvLyBpZCwgc3VidHlwZSwgcG9zaXRpb24oMiksIG9yaWVudGF0aW9uKDIpLCB0YWlsLCBoZWFkLCBhcmNfbGVuZ3RoLCBhZ2VcbmNvbnN0IFRBSUwgPSA2O1xuY29uc3QgSEVBRCA9IDc7XG5cbi8vIG11c3QgbWF0Y2ggdGhlIFRFTEVNRVRSWV8qIGluZGljZXMgaW4gc2ltdWxhdGUud2dzbFxuZXhwb3J0IGNvbnN0IFRFTEVNRVRSWV9DT1VOVEVSUyA9IFtcbiAgXCJjYW5kaWRhdGVzXCIsIC8vIGZyZWUgbW9ub21lcnMgaW4gdGhlIHBvbHltZXJpemF0aW9uIGZpZWxkXG4gIFwibmVpZ2hib3JGb3VuZFwiLCAvLyAuLi4gdGhhdCBzYXcgYW4gYXZhaWxhYmxlIGhlYWQgb3IgbW9ub21lciBuZWFyYnlcbiAgXCJwYXNzZWRQcm9iXCIsIC8vIC4uLiBhbmQgcGFzc2VkIHRoZSBiaW5kIHByb2JhYmlsaXR5XG4gIFwiYm91bmRcIiwgLy8gLi4uIGFuZCB3b24gYm90aCBsb2Nrc1xuICBcInVuYm91bmRcIiwgLy8gbWludXMtZW5kIGRlcG9seW1lcml6YXRpb25zXG4gIFwiZWxvbmdhdGVkXCIsIC8vIGJpbmRzIG9udG8gYW4gZXhpc3RpbmcgZmlsYW1lbnQncyBwbHVzIGVuZCAoYm91bmQgbWludXMgZWxvbmdhdGVkID0gbmV3IGRpbWVycylcbiAgXCJoZWFkc0luRmllbGRcIiwgLy8gcGx1cyBlbmRzIGluIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZCwgaS5lLiBhYmxlIHRvIGVsb25nYXRlXG4gIFwiaGVhZEZvdW5kXCIsIC8vIGNhbmRpZGF0ZXMgdGhhdCBzYXcgc3VjaCBhIHBsdXMgZW5kIG5lYXJieVxuICBcImJyYW5jaGVkXCIsIC8vIG5ldyBicmFuY2hlcyBudWNsZWF0ZWQgb24gdGhlIHNpZGUgb2YgYSBmaWxhbWVudCAobGFtZWxsaXBvZGl1bSBmaWVsZClcbiAgXCJkZWJyYW5jaGVkXCIsIC8vIGJyYW5jaGVzIHRoYXQgY2FtZSBvZmYgdGhlaXIgbW90aGVyXG4gIFwicG9pbnRDb250YWN0c1wiLFxuICBcImJvbmRDb250YWN0c1wiLFxuICBcInJlYXJNaW51c0xvc3NcIixcbiAgXCJmcm9udE1pbnVzTG9zc1wiLFxuICBcInJlYXJQbHVzTG9zc1wiLFxuICBcInRldGhlclJlbGVhc2VkXCIsXG5dIGFzIGNvbnN0O1xuXG50eXBlIENvdW50ZXJzID0gUmVjb3JkPCh0eXBlb2YgVEVMRU1FVFJZX0NPVU5URVJTKVtudW1iZXJdLCBudW1iZXI+O1xuXG5leHBvcnQgdHlwZSBBY3RpblN0YXRzID0ge1xuICBydW46IHN0cmluZztcbiAgZnJhbWU6IG51bWJlcjtcbiAgc3RlcDogbnVtYmVyO1xuICBhY3RpbkNvdW50OiBudW1iZXI7XG4gIG1vbm9tZXJzOiBudW1iZXI7XG4gIGZpbGFtZW50czogbnVtYmVyO1xuICBicmFuY2hlczogbnVtYmVyOyAvLyBmaWxhbWVudHMgaGFuZ2luZyBvZmYgdGhlIHNpZGUgb2YgYW5vdGhlciBvbmVcbiAgaW5Qb2x5bWVyOiBudW1iZXI7XG4gIHBvc3RlcmlvclBvbHltZXJCZWFkczogbnVtYmVyOyAvLyBsZWdhY3kgbWFya2VyLXggaGFsZiwgbm90IHRoZSBjdXJyZW50IGdlb21ldHJpYyBwb2xhcml0eSBmcmFtZVxuICBpbnNpZGVQb2x5bWVyQmVhZHM6IG51bWJlcjtcbiAgaW5zaWRlTW9ub21lckJlYWRzOiBudW1iZXI7XG4gIGdBY3Rpbk1vZGU6IFwid2VsbC1taXhlZFwiIHwgXCJwYXJ0aWNsZXNcIjtcbiAgZ0FjdGluQW1vdW50OiBudW1iZXI7XG4gIGdBY3RpbkNvbmNlbnRyYXRpb246IG51bWJlcjtcbiAgYWN0aW5CYWxhbmNlRXJyb3I6IG51bWJlcjtcbiAgY3Jvc3NpbmdGaWxhbWVudEJvbmRzOiBudW1iZXI7XG4gIG1lYW5Qb2x5bWVyQWdlOiBudW1iZXI7XG4gIG1heFBvbHltZXJBZ2U6IG51bWJlcjtcbiAgbWVhbkxlbmd0aDogbnVtYmVyO1xuICBtZWRpYW5MZW5ndGg6IG51bWJlcjtcbiAgcDkwTGVuZ3RoOiBudW1iZXI7XG4gIG1heExlbmd0aDogbnVtYmVyO1xuICAvLyBmaWxhbWVudCBjb3VudHMgcGVyIGxlbmd0aCBiaW46IDIsIDMtNCwgNS04LCA5LTE2LCAxNy0zMiwgMzMtNjQsIDY1K1xuICBoaXN0b2dyYW06IG51bWJlcltdO1xuICBtZWRpYW5Cb25kTGVuZ3RoOiBudW1iZXI7IC8vIGluIHVuaXRzIG9mIHRoZSBhY3RpbiByZXN0IGxlbmd0aFxuICBtZWRpYW5CZW5kQW5nbGU6IG51bWJlcjsgLy8gZGVncmVlcyBiZXR3ZWVuIGNvbnNlY3V0aXZlIGJvbmRzIG9mIGEgZmlsYW1lbnQ7IGxvdyA9IHN0aWZmXG4gIGJyb2tlbkxpbmtzOiBudW1iZXI7IC8vIGEuaGVhZCA9IGIgYnV0IGIudGFpbCAhPSBhXG4gIGN5Y2xlczogbnVtYmVyO1xuICBwZXJTdGVwOiBDb3VudGVyczsgLy8gZXZlbnQgcmF0ZXMgc2luY2UgdGhlIHByZXZpb3VzIHNhbXBsZVxuICBjZWxsOiBDZWxsU2hhcGU7XG4gIGRpYWdub3N0aWNLaW5kPzogXCJzaW11bGF0aW9uXCIgfCBcImNvbnRhY3QtcmVjaGVja1wiO1xufTtcblxuLy8gbWVtYnJhbmUgc2hhcGUgaW4gcGl4ZWxzOyBub2RlIDAgaXMgdGhlIGZyb250ICh0aGUgcmlnaHQgc2lkZSBhdCByZXNldCksIG5vZGUgY291bnQgLyAyIHRoZSByZWFyXG5leHBvcnQgdHlwZSBDZWxsU2hhcGUgPSB7XG4gIGxlZnQ6IG51bWJlcjsgLy8gbGVmdG1vc3QgbWVtYnJhbmUgeFxuICByaWdodDogbnVtYmVyOyAvLyByaWdodG1vc3QgbWVtYnJhbmUgeFxuICB0b3A6IG51bWJlcjtcbiAgYm90dG9tOiBudW1iZXI7XG4gIGZyb250WDogbnVtYmVyO1xuICByZWFyWDogbnVtYmVyO1xuICBjZW50cm9pZFg6IG51bWJlcjtcbiAgY2VudHJvaWRZOiBudW1iZXI7XG4gIGxlbmd0aDogbnVtYmVyOyAvLyBmcm9udCBub2RlIHRvIHJlYXIgbm9kZVxuICBhcmVhOiBudW1iZXI7IC8vIHJlbGF0aXZlIHRvIHRoZSBhcmVhIGF0IHJlc2V0XG4gIC8vIG1lYW4gbWVtYnJhbmUgZWRnZSBsZW5ndGggaW4gdW5pdHMgb2YgdGhlIHJlc3QgbGVuZ3RoLCBvdmVyIHRoZSBxdWFydGVyIG9mIHRoZSBub2RlcyBhcm91bmQgdGhlIGZyb250IGFuZCB0aGUgcmVhclxuICBmcm9udFNwYWNpbmc6IG51bWJlcjtcbiAgcmVhclNwYWNpbmc6IG51bWJlcjtcbn07XG5cbmNvbnN0IEhJU1RPR1JBTV9FREdFUyA9IFsyLCA0LCA4LCAxNiwgMzIsIDY0XTtcblxuZXhwb3J0IGNsYXNzIFRlbGVtZXRyeUFuYWx5c2lzIHtcbiAgcHJpdmF0ZSBsYXN0Q291bnRlcnM6IG51bWJlcltdIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbGFzdFN0ZXAgPSAwO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYWN0aW5Db3VudDogbnVtYmVyLFxuICAgIHByaXZhdGUgbWVtYnJhbmVDb3VudDogbnVtYmVyLFxuICAgIHByaXZhdGUgbWVtYnJhbmVSZXN0TGVuZ3RoOiBudW1iZXIsXG4gICAgcHJpdmF0ZSBydW46IHN0cmluZyxcbiAgICBwcml2YXRlIHdlbGxNaXhlZCA9IGZhbHNlXG4gICkge31cblxuICByZXNldCgpIHtcbiAgICB0aGlzLmxhc3RDb3VudGVycyA9IG51bGw7XG4gICAgdGhpcy5sYXN0U3RlcCA9IDA7XG4gIH1cblxuICBhbmFseXplKFxuICAgIGFjdGluOiBBcnJheUJ1ZmZlcixcbiAgICBtZW1icmFuZURhdGE6IEFycmF5QnVmZmVyLFxuICAgIGNvdW50ZXJEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICBmcmFtZTogbnVtYmVyLFxuICAgIHN0ZXA6IG51bWJlcixcbiAgICBlcXVpbGlicml1bUxpbmVEaXN0YW5jZTogbnVtYmVyLFxuICAgIHZlcmlmaWNhdGlvbiA9IGZhbHNlXG4gICkge1xuICAgIGNvbnN0IHByZXZpb3VzQ291bnRlcnMgPSB0aGlzLmxhc3RDb3VudGVycyxcbiAgICAgIHByZXZpb3VzU3RlcCA9IHRoaXMubGFzdFN0ZXA7XG4gICAgY29uc3Qgd29yZHMgPSBuZXcgVWludDMyQXJyYXkoYWN0aW4pO1xuICAgIGNvbnN0IGZsb2F0cyA9IG5ldyBGbG9hdDMyQXJyYXkod29yZHMuYnVmZmVyKTtcbiAgICBjb25zdCBjb3VudGVycyA9IEFycmF5LmZyb20obmV3IFVpbnQzMkFycmF5KGNvdW50ZXJEYXRhKSk7XG4gICAgY29uc3QgbWVtYnJhbmUgPSBuZXcgRmxvYXQzMkFycmF5KG1lbWJyYW5lRGF0YSk7XG4gICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbFNoYXBlKG1lbWJyYW5lKTtcbiAgICBjb25zdCBzdGF0cyA9IHRoaXMuY29tcHV0ZSh3b3JkcywgZmxvYXRzLCBjb3VudGVycywgZnJhbWUsIHN0ZXAsIGVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCBjZWxsKTtcbiAgICBjb25zdCBpbnNpZGUgPSBwb2x5Z29uT2NjdXBhbmN5KG1lbWJyYW5lLCBTRUdNRU5UX1dPUkRTLCB0aGlzLndlbGxNaXhlZCk7XG4gICAgY29uc3QgY3Jvc3NpbmcgPSB0aGlzLndlbGxNaXhlZCA/IHBvbHlnb25Cb25kQ3Jvc3NpbmcobWVtYnJhbmUpIDogbnVsbDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYWN0aW5Db3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBkaXNjb25uZWN0ZWQgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdID09PSBpICYmIHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF0gPT09IGk7XG4gICAgICBpZiAodGhpcy53ZWxsTWl4ZWQgJiYgZGlzY29ubmVjdGVkKSBjb250aW51ZTsgLy8gcmVzZXJ2b2lyIGVudHJpZXMgaGF2ZSBubyBzcGF0aWFsIGNvb3JkaW5hdGVzXG4gICAgICBjb25zdCB0YWlsID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXTtcbiAgICAgIGlmIChcbiAgICAgICAgY3Jvc3NpbmcgJiZcbiAgICAgICAgdGFpbCAhPT0gaSAmJlxuICAgICAgICBjcm9zc2luZyhmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAyXSwgZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgM10sIGZsb2F0c1t0YWlsICogU0VHTUVOVF9XT1JEUyArIDJdLCBmbG9hdHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyAzXSlcbiAgICAgIClcbiAgICAgICAgc3RhdHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzKys7XG4gICAgICBpZiAoIWluc2lkZShmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAyXSwgZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgM10pKSBjb250aW51ZTtcbiAgICAgIGlmICh3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdID09PSBpICYmIHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF0gPT09IGkpIHN0YXRzLmluc2lkZU1vbm9tZXJCZWFkcysrO1xuICAgICAgZWxzZSBzdGF0cy5pbnNpZGVQb2x5bWVyQmVhZHMrKztcbiAgICB9XG4gICAgc3RhdHMuZ0FjdGluQ29uY2VudHJhdGlvbiA9IHRoaXMud2VsbE1peGVkID8gc3RhdHMuZ0FjdGluQW1vdW50IC8gKChjZWxsLmFyZWEgKiAodGhpcy5tZW1icmFuZUNvdW50ICogdGhpcy5tZW1icmFuZVJlc3RMZW5ndGgpICoqIDIpIC8gKDQgKiBNYXRoLlBJKSkgOiAwO1xuICAgIHN0YXRzLmRpYWdub3N0aWNLaW5kID0gdmVyaWZpY2F0aW9uID8gXCJjb250YWN0LXJlY2hlY2tcIiA6IFwic2ltdWxhdGlvblwiO1xuICAgIGlmICh2ZXJpZmljYXRpb24pIHtcbiAgICAgIHRoaXMubGFzdENvdW50ZXJzID0gcHJldmlvdXNDb3VudGVycztcbiAgICAgIHRoaXMubGFzdFN0ZXAgPSBwcmV2aW91c1N0ZXA7XG4gICAgfVxuICAgIHJldHVybiBzdGF0cztcbiAgfVxuXG4gIHByaXZhdGUgY2VsbFNoYXBlKGZsb2F0czogRmxvYXQzMkFycmF5KTogQ2VsbFNoYXBlIHtcbiAgICBjb25zdCBuID0gdGhpcy5tZW1icmFuZUNvdW50O1xuICAgIGNvbnN0IHggPSAoaTogbnVtYmVyKSA9PiBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyAyXTtcbiAgICBjb25zdCB5ID0gKGk6IG51bWJlcikgPT4gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgM107XG4gICAgbGV0IGxlZnQgPSBJbmZpbml0eTtcbiAgICBsZXQgcmlnaHQgPSAtSW5maW5pdHk7XG4gICAgbGV0IHRvcCA9IEluZmluaXR5O1xuICAgIGxldCBib3R0b20gPSAtSW5maW5pdHk7XG4gICAgLy8gYXJlYS13ZWlnaHRlZCBjZW50cm9pZCAoc2hvZWxhY2UpXG4gICAgbGV0IGFyZWEgPSAwO1xuICAgIGxldCBjeCA9IDA7XG4gICAgbGV0IGN5ID0gMDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgbGVmdCA9IE1hdGgubWluKGxlZnQsIHgoaSkpO1xuICAgICAgcmlnaHQgPSBNYXRoLm1heChyaWdodCwgeChpKSk7XG4gICAgICB0b3AgPSBNYXRoLm1pbih0b3AsIHkoaSkpO1xuICAgICAgYm90dG9tID0gTWF0aC5tYXgoYm90dG9tLCB5KGkpKTtcbiAgICAgIGNvbnN0IGogPSAoaSArIDEpICUgbjtcbiAgICAgIGNvbnN0IGNyb3NzID0geChpKSAqIHkoaikgLSB4KGopICogeShpKTtcbiAgICAgIGFyZWEgKz0gY3Jvc3MgLyAyO1xuICAgICAgY3ggKz0gKHgoaSkgKyB4KGopKSAqIGNyb3NzO1xuICAgICAgY3kgKz0gKHkoaSkgKyB5KGopKSAqIGNyb3NzO1xuICAgIH1cbiAgICBjb25zdCByZWFyID0gbiA+PiAxO1xuICAgIGNvbnN0IHF1YXJ0ZXJTcGFjaW5nID0gKGNlbnRlcjogbnVtYmVyKSA9PiB7XG4gICAgICBsZXQgc3VtID0gMDtcbiAgICAgIGZvciAobGV0IGsgPSAtKG4gPj4gMyk7IGsgPCBuID4+IDM7IGsrKykge1xuICAgICAgICBjb25zdCBpID0gKGNlbnRlciArIGsgKyBuKSAlIG47XG4gICAgICAgIGNvbnN0IGogPSAoaSArIDEpICUgbjtcbiAgICAgICAgc3VtICs9IE1hdGguaHlwb3QoeChqKSAtIHgoaSksIHkoaikgLSB5KGkpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdW0gLyAobiA+PiAyKSAvIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoO1xuICAgIH07XG4gICAgY29uc3QgcmVzdEFyZWEgPSAobiAqIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAqKiAyIC8gKDQgKiBNYXRoLlBJKTtcbiAgICByZXR1cm4ge1xuICAgICAgbGVmdCxcbiAgICAgIHJpZ2h0LFxuICAgICAgdG9wLFxuICAgICAgYm90dG9tLFxuICAgICAgZnJvbnRYOiB4KDApLFxuICAgICAgcmVhclg6IHgocmVhciksXG4gICAgICBjZW50cm9pZFg6IGN4IC8gKDYgKiBhcmVhKSxcbiAgICAgIGNlbnRyb2lkWTogY3kgLyAoNiAqIGFyZWEpLFxuICAgICAgbGVuZ3RoOiBNYXRoLmh5cG90KHgoMCkgLSB4KHJlYXIpLCB5KDApIC0geShyZWFyKSksXG4gICAgICBhcmVhOiBNYXRoLmFicyhhcmVhKSAvIHJlc3RBcmVhLFxuICAgICAgZnJvbnRTcGFjaW5nOiBxdWFydGVyU3BhY2luZygwKSxcbiAgICAgIHJlYXJTcGFjaW5nOiBxdWFydGVyU3BhY2luZyhyZWFyKSxcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wdXRlKHdvcmRzOiBVaW50MzJBcnJheSwgZmxvYXRzOiBGbG9hdDMyQXJyYXksIGNvdW50ZXJzOiBudW1iZXJbXSwgZnJhbWU6IG51bWJlciwgc3RlcDogbnVtYmVyLCByZXN0TGVuZ3RoOiBudW1iZXIsIGNlbGw6IENlbGxTaGFwZSk6IEFjdGluU3RhdHMge1xuICAgIGNvbnN0IG4gPSB0aGlzLmFjdGluQ291bnQ7XG4gICAgY29uc3QgdmlzaXRlZCA9IG5ldyBVaW50OEFycmF5KG4pO1xuICAgIGNvbnN0IGxlbmd0aHM6IG51bWJlcltdID0gW107XG4gICAgbGV0IG1vbm9tZXJzID0gMDtcbiAgICBsZXQgYnJva2VuTGlua3MgPSAwO1xuICAgIGxldCBjeWNsZXMgPSAwO1xuICAgIGxldCBicmFuY2hlcyA9IDA7XG4gICAgbGV0IHBvc3RlcmlvclBvbHltZXJCZWFkcyA9IDA7XG4gICAgbGV0IGFnZVN1bSA9IDAsXG4gICAgICBtYXhBZ2UgPSAwO1xuICAgIGNvbnN0IGJvbmRMZW5ndGhzOiBudW1iZXJbXSA9IFtdO1xuICAgIGNvbnN0IGJlbmRBbmdsZXM6IG51bWJlcltdID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBjb25zdCBoZWFkID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBIRUFEXTtcbiAgICAgIGlmICh0YWlsID09PSBpICYmIGhlYWQgPT09IGkpIHtcbiAgICAgICAgbW9ub21lcnMrKztcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBjb25zdCBhZ2UgPSBmbG9hdHNbaSAqIFNFR01FTlRfV09SRFMgKyA5XTtcbiAgICAgIGFnZVN1bSArPSBhZ2U7XG4gICAgICBtYXhBZ2UgPSBNYXRoLm1heChtYXhBZ2UsIGFnZSk7XG4gICAgICBpZiAoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0gPCAoY2VsbC5mcm9udFggKyBjZWxsLnJlYXJYKSAvIDIpIHBvc3RlcmlvclBvbHltZXJCZWFkcysrO1xuICAgICAgaWYgKGhlYWQgIT09IGkgJiYgd29yZHNbaGVhZCAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSAhPT0gaSkge1xuICAgICAgICBicm9rZW5MaW5rcysrO1xuICAgICAgfVxuICAgICAgLy8gYSBicmFuY2ggcm9vdCdzIHRhaWwgaXMgaXRzIG1vdGhlciwgd2hvc2UgaGVhZCBwb2ludHMgZWxzZXdoZXJlIGFsb25nIHRoZSBtb3RoZXIgZmlsYW1lbnRcbiAgICAgIGNvbnN0IGlzQnJhbmNoUm9vdCA9IHRhaWwgIT09IGkgJiYgd29yZHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyBIRUFEXSAhPT0gaTtcbiAgICAgIGlmICh0YWlsICE9PSBpICYmICFpc0JyYW5jaFJvb3QpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBicmFuY2hlcyArPSBpc0JyYW5jaFJvb3QgPyAxIDogMDtcbiAgICAgIC8vIGEgbWludXMgZW5kIG9yIGJyYW5jaCByb290OiB3YWxrIHRvIHRoZSBwbHVzIGVuZFxuICAgICAgbGV0IGxlbmd0aCA9IDE7XG4gICAgICBsZXQgY3VycmVudCA9IGk7XG4gICAgICBsZXQgcHJldkR4ID0gMDtcbiAgICAgIGxldCBwcmV2RHkgPSAwO1xuICAgICAgdmlzaXRlZFtpXSA9IDE7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBjb25zdCBuZXh0ID0gd29yZHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyBIRUFEXTtcbiAgICAgICAgaWYgKG5leHQgPT09IGN1cnJlbnQpIGJyZWFrO1xuICAgICAgICBpZiAodmlzaXRlZFtuZXh0XSkge1xuICAgICAgICAgIGN5Y2xlcysrO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGR4ID0gZmxvYXRzW25leHQgKiBTRUdNRU5UX1dPUkRTICsgMl0gLSBmbG9hdHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyAyXTtcbiAgICAgICAgY29uc3QgZHkgPSBmbG9hdHNbbmV4dCAqIFNFR01FTlRfV09SRFMgKyAzXSAtIGZsb2F0c1tjdXJyZW50ICogU0VHTUVOVF9XT1JEUyArIDNdO1xuICAgICAgICBib25kTGVuZ3Rocy5wdXNoKE1hdGguaHlwb3QoZHgsIGR5KSk7XG4gICAgICAgIGlmIChsZW5ndGggPiAxKSB7XG4gICAgICAgICAgYmVuZEFuZ2xlcy5wdXNoKChNYXRoLmFicyhNYXRoLmF0YW4yKHByZXZEeCAqIGR5IC0gcHJldkR5ICogZHgsIHByZXZEeCAqIGR4ICsgcHJldkR5ICogZHkpKSAqIDE4MCkgLyBNYXRoLlBJKTtcbiAgICAgICAgfVxuICAgICAgICBwcmV2RHggPSBkeDtcbiAgICAgICAgcHJldkR5ID0gZHk7XG4gICAgICAgIHZpc2l0ZWRbbmV4dF0gPSAxO1xuICAgICAgICBjdXJyZW50ID0gbmV4dDtcbiAgICAgICAgbGVuZ3RoKys7XG4gICAgICB9XG4gICAgICBsZW5ndGhzLnB1c2gobGVuZ3RoKTtcbiAgICB9XG5cbiAgICBsZW5ndGhzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICBjb25zdCBpblBvbHltZXIgPSBsZW5ndGhzLnJlZHVjZSgoc3VtLCBsKSA9PiBzdW0gKyBsLCAwKTtcbiAgICBjb25zdCBoaXN0b2dyYW0gPSBuZXcgQXJyYXkoSElTVE9HUkFNX0VER0VTLmxlbmd0aCArIDEpLmZpbGwoMCk7XG4gICAgZm9yIChjb25zdCBsIG9mIGxlbmd0aHMpIHtcbiAgICAgIGNvbnN0IGJpbiA9IEhJU1RPR1JBTV9FREdFUy5maW5kSW5kZXgoKGVkZ2UpID0+IGwgPD0gZWRnZSk7XG4gICAgICBoaXN0b2dyYW1bYmluID09PSAtMSA/IEhJU1RPR1JBTV9FREdFUy5sZW5ndGggOiBiaW5dKys7XG4gICAgfVxuXG4gICAgY29uc3Qgc3RlcHMgPSBNYXRoLm1heCgxLCBzdGVwIC0gdGhpcy5sYXN0U3RlcCk7XG4gICAgY29uc3QgcGVyU3RlcCA9IE9iamVjdC5mcm9tRW50cmllcyhcbiAgICAgIFRFTEVNRVRSWV9DT1VOVEVSUy5tYXAoKG5hbWUsIGspID0+IFtuYW1lLCB0aGlzLmxhc3RDb3VudGVycyA/IChjb3VudGVyc1trXSAtIHRoaXMubGFzdENvdW50ZXJzW2tdKSAvIHN0ZXBzIDogMF0pXG4gICAgKSBhcyBDb3VudGVycztcbiAgICB0aGlzLmxhc3RDb3VudGVycyA9IGNvdW50ZXJzO1xuICAgIHRoaXMubGFzdFN0ZXAgPSBzdGVwO1xuXG4gICAgY29uc3QgcXVhbnRpbGUgPSAocTogbnVtYmVyKSA9PiAobGVuZ3Rocy5sZW5ndGggPyBsZW5ndGhzW01hdGgubWluKGxlbmd0aHMubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcihxICogbGVuZ3Rocy5sZW5ndGgpKV0gOiAwKTtcbiAgICByZXR1cm4ge1xuICAgICAgcnVuOiB0aGlzLnJ1bixcbiAgICAgIGZyYW1lLFxuICAgICAgc3RlcCxcbiAgICAgIGFjdGluQ291bnQ6IG4sXG4gICAgICBtb25vbWVycyxcbiAgICAgIGZpbGFtZW50czogbGVuZ3Rocy5sZW5ndGgsXG4gICAgICBicmFuY2hlcyxcbiAgICAgIGluUG9seW1lcixcbiAgICAgIHBvc3RlcmlvclBvbHltZXJCZWFkcyxcbiAgICAgIGluc2lkZVBvbHltZXJCZWFkczogMCxcbiAgICAgIGluc2lkZU1vbm9tZXJCZWFkczogMCxcbiAgICAgIGdBY3Rpbk1vZGU6IHRoaXMud2VsbE1peGVkID8gXCJ3ZWxsLW1peGVkXCIgOiBcInBhcnRpY2xlc1wiLFxuICAgICAgZ0FjdGluQW1vdW50OiBtb25vbWVycyxcbiAgICAgIGdBY3RpbkNvbmNlbnRyYXRpb246IDAsXG4gICAgICBhY3RpbkJhbGFuY2VFcnJvcjogbW9ub21lcnMgKyBpblBvbHltZXIgLSBuLFxuICAgICAgY3Jvc3NpbmdGaWxhbWVudEJvbmRzOiAwLFxuICAgICAgbWVhblBvbHltZXJBZ2U6IG4gPiBtb25vbWVycyA/IGFnZVN1bSAvIChuIC0gbW9ub21lcnMpIDogMCxcbiAgICAgIG1heFBvbHltZXJBZ2U6IG1heEFnZSxcbiAgICAgIG1lYW5MZW5ndGg6IGxlbmd0aHMubGVuZ3RoID8gaW5Qb2x5bWVyIC8gbGVuZ3Rocy5sZW5ndGggOiAwLFxuICAgICAgbWVkaWFuTGVuZ3RoOiBxdWFudGlsZSgwLjUpLFxuICAgICAgcDkwTGVuZ3RoOiBxdWFudGlsZSgwLjkpLFxuICAgICAgbWF4TGVuZ3RoOiBsZW5ndGhzLmxlbmd0aCA/IGxlbmd0aHNbbGVuZ3Rocy5sZW5ndGggLSAxXSA6IDAsXG4gICAgICBoaXN0b2dyYW0sXG4gICAgICBtZWRpYW5Cb25kTGVuZ3RoOiBib25kTGVuZ3Rocy5sZW5ndGggPyBib25kTGVuZ3Rocy5zb3J0KChhLCBiKSA9PiBhIC0gYilbYm9uZExlbmd0aHMubGVuZ3RoID4+IDFdIC8gcmVzdExlbmd0aCA6IDAsXG4gICAgICBtZWRpYW5CZW5kQW5nbGU6IGJlbmRBbmdsZXMubGVuZ3RoID8gYmVuZEFuZ2xlcy5zb3J0KChhLCBiKSA9PiBhIC0gYilbYmVuZEFuZ2xlcy5sZW5ndGggPj4gMV0gOiAwLFxuICAgICAgYnJva2VuTGlua3MsXG4gICAgICBjeWNsZXMsXG4gICAgICBwZXJTdGVwLFxuICAgICAgY2VsbCxcbiAgICB9O1xuICB9XG59XG4iLCJpbXBvcnQgeyBURUxFTUVUUllfQ09VTlRFUlMsIHR5cGUgQWN0aW5TdGF0cyB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xuZXhwb3J0IHsgVEVMRU1FVFJZX0NPVU5URVJTLCB0eXBlIEFjdGluU3RhdHMsIHR5cGUgQ2VsbFNoYXBlIH0gZnJvbSBcIi4vdGVsZW1ldHJ5LWFuYWx5c2lzXCI7XG5cbi8vIE9uZSBpbi1mbGlnaHQgcmVhZGJhY2svd29ya2VyIGpvYi4gRXZlcnkgZm9yY2VkIGFzc2F5IGNoZWNrcG9pbnQgd2FpdHMgZm9yIGFcbi8vIGZyZXNoIGZ1bGwgYW5hbHlzaXM7IGludGVyYWN0aXZlIHJlcXVlc3RzIGNvYWxlc2NlIHdoaWxlIHRoZSB3b3JrZXIgaXMgYnVzeS5cbmV4cG9ydCBjbGFzcyBBY3RpblRlbGVtZXRyeSB7XG4gIHJlYWRvbmx5IGNvdW50ZXJCdWZmZXI6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBhY3RpblN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBjb3VudGVyU3RhZ2luZzogR1BVQnVmZmVyO1xuICBwcml2YXRlIG1lbWJyYW5lU3RhZ2luZzogR1BVQnVmZmVyO1xuICBwcml2YXRlIHBlbmRpbmc6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB3b3JrZXIgPSBuZXcgV29ya2VyKG5ldyBVUkwoXCIuL3RlbGVtZXRyeS53b3JrZXIudHNcIiwgaW1wb3J0Lm1ldGEudXJsKSwgeyB0eXBlOiBcIm1vZHVsZVwiIH0pO1xuICBwcml2YXRlIGpvYjogeyBpZDogbnVtYmVyOyByZXNvbHZlOiAodmFsdWU6IHsgc3RhdHM6IEFjdGluU3RhdHM7IGFuYWx5c2lzTXM6IG51bWJlciB9KSA9PiB2b2lkOyByZWplY3Q6IChlcnJvcjogRXJyb3IpID0+IHZvaWQgfSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHdvcmtlckZhaWx1cmU6IEVycm9yIHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgbmV4dElkID0gMDtcbiAgcHJpdmF0ZSBkaXNwbGF5OiBIVE1MUHJlRWxlbWVudDtcbiAgcHJpdmF0ZSBzdW1tYXJ5OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBwb3N0VG9TZXJ2ZXIgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwidGVsZW1ldHJ5XCIpID09PSBcIjFcIjtcbiAgcmVhZG9ubHkgaGlzdG9yeTogQWN0aW5TdGF0c1tdID0gW107XG4gIG9uU2FtcGxlPzogKHN0YXRzOiBBY3RpblN0YXRzKSA9PiB2b2lkO1xuICByZWFkb25seSB0aW1pbmdzID0geyByZWFkYmFja01zOiAwLCBhbmFseXNpc01zOiAwLCB3b3JrZXJSb3VuZFRyaXBNczogMCwgdG90YWxNczogMCwgY29hbGVzY2VkQXV0b21hdGljU2FtcGxlczogMCB9O1xuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGRldmljZTogR1BVRGV2aWNlLFxuICAgIHByaXZhdGUgYWN0aW5CdWZmZXI6IEdQVUJ1ZmZlcixcbiAgICBhY3RpbkNvdW50OiBudW1iZXIsXG4gICAgcHJpdmF0ZSBtZW1icmFuZUJ1ZmZlcjogR1BVQnVmZmVyLFxuICAgIG1lbWJyYW5lQ291bnQ6IG51bWJlcixcbiAgICBtZW1icmFuZVJlc3RMZW5ndGg6IG51bWJlcixcbiAgICBwcml2YXRlIHJ1bjogc3RyaW5nLFxuICAgIHByaXZhdGUgaW50ZXJ2YWxGcmFtZXMgPSAzMCxcbiAgICBwcml2YXRlIHdlbGxNaXhlZCA9IGZhbHNlXG4gICkge1xuICAgIHRoaXMuY291bnRlckJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgbGFiZWw6IFwiVGVsZW1ldHJ5IGNvdW50ZXJzXCIsXG4gICAgICBzaXplOiA0ICogVEVMRU1FVFJZX0NPVU5URVJTLmxlbmd0aCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KTtcbiAgICBjb25zdCBzdGFnaW5nID0gKHNpemU6IG51bWJlcikgPT4gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFEIH0pO1xuICAgIHRoaXMuYWN0aW5TdGFnaW5nID0gc3RhZ2luZyhhY3RpbkJ1ZmZlci5zaXplKTtcbiAgICB0aGlzLmNvdW50ZXJTdGFnaW5nID0gc3RhZ2luZyh0aGlzLmNvdW50ZXJCdWZmZXIuc2l6ZSk7XG4gICAgdGhpcy5tZW1icmFuZVN0YWdpbmcgPSBzdGFnaW5nKG1lbWJyYW5lQnVmZmVyLnNpemUpO1xuICAgIHRoaXMud29ya2VyLm9ubWVzc2FnZSA9ICh7IGRhdGEgfSkgPT4ge1xuICAgICAgY29uc3Qgam9iID0gdGhpcy5qb2I7XG4gICAgICBpZiAoIWpvYiB8fCBqb2IuaWQgIT09IGRhdGEuaWQpIHJldHVybjtcbiAgICAgIHRoaXMuam9iID0gbnVsbDtcbiAgICAgIGlmIChkYXRhLmVycm9yKSBqb2IucmVqZWN0KG5ldyBFcnJvcihkYXRhLmVycm9yKSk7XG4gICAgICBlbHNlIGpvYi5yZXNvbHZlKGRhdGEpO1xuICAgIH07XG4gICAgdGhpcy53b3JrZXIub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgdGhpcy53b3JrZXJGYWlsdXJlID0gbmV3IEVycm9yKGBEaWFnbm9zdGljIHdvcmtlcjogJHtldmVudC5tZXNzYWdlfWApO1xuICAgICAgdGhpcy5qb2I/LnJlamVjdCh0aGlzLndvcmtlckZhaWx1cmUpO1xuICAgICAgdGhpcy5qb2IgPSBudWxsO1xuICAgIH07XG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImluaXRcIiwgY29uZmlnOiBbYWN0aW5Db3VudCwgbWVtYnJhbmVDb3VudCwgbWVtYnJhbmVSZXN0TGVuZ3RoLCBydW4sIHdlbGxNaXhlZF0gfSk7XG4gICAgY29uc3QgZGV0YWlscyA9IE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRldGFpbHNcIiksIHsgaWQ6IFwiZGlhZ25vc3RpY3NcIiB9KTtcbiAgICBPYmplY3QuYXNzaWduKGRldGFpbHMuc3R5bGUsIHtcbiAgICAgIHBvc2l0aW9uOiBcImZpeGVkXCIsXG4gICAgICBsZWZ0OiBcIjEwcHhcIixcbiAgICAgIGJvdHRvbTogXCIxMHB4XCIsXG4gICAgICBwYWRkaW5nOiBcIjZweFwiLFxuICAgICAgY29sb3I6IFwid2hpdGVcIixcbiAgICAgIGZvbnQ6IFwiMTFweCBtb25vc3BhY2VcIixcbiAgICAgIGJhY2tncm91bmQ6IFwicmdiYSgwLDAsMCwuOClcIixcbiAgICAgIHpJbmRleDogXCIxMDAwXCIsXG4gICAgICBtYXhXaWR0aDogXCJjYWxjKDEwMHZ3IC0gMzJweClcIixcbiAgICB9KTtcbiAgICB0aGlzLnN1bW1hcnkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3VtbWFyeVwiKTtcbiAgICB0aGlzLnN1bW1hcnkudGV4dENvbnRlbnQgPSBcIkZ1bGwgbnVtZXJpY2FsIGRpYWdub3N0aWNzIMK3IHdvcmtlclwiO1xuICAgIHRoaXMuZGlzcGxheSA9IE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInByZVwiKSwgeyBpZDogXCJhY3RpblRlbGVtZXRyeVwiIH0pO1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5kaXNwbGF5LnN0eWxlLCB7IG1heEhlaWdodDogXCIyMjBweFwiLCBvdmVyZmxvdzogXCJhdXRvXCIsIG1hcmdpbjogXCI2cHggMCAwXCIgfSk7XG4gICAgZGV0YWlscy5hcHBlbmQodGhpcy5zdW1tYXJ5LCB0aGlzLmRpc3BsYXkpO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kKGRldGFpbHMpO1xuICAgICh3aW5kb3cgYXMgYW55KS5hY3RpblRlbGVtZXRyeSA9IHRoaXM7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJwYWdlaGlkZVwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGlmICghZXZlbnQucGVyc2lzdGVkKSB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB9KTtcbiAgfVxuICByZXNldCgpIHtcbiAgICB0aGlzLmRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcih0aGlzLmNvdW50ZXJCdWZmZXIsIDAsIG5ldyBVaW50MzJBcnJheShURUxFTUVUUllfQ09VTlRFUlMubGVuZ3RoKSk7XG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInJlc2V0XCIgfSk7XG4gICAgdGhpcy5oaXN0b3J5Lmxlbmd0aCA9IDA7XG4gIH1cbiAgYXN5bmMgdXBkYXRlKGZyYW1lOiBudW1iZXIsIHN0ZXA6IG51bWJlciwgcmVzdDogbnVtYmVyLCBmb3JjZSA9IGZhbHNlLCB2ZXJpZmljYXRpb24gPSBmYWxzZSkge1xuICAgIGlmICghZm9yY2UgJiYgZnJhbWUgJSB0aGlzLmludGVydmFsRnJhbWVzICE9PSAwKSByZXR1cm47XG4gICAgaWYgKHRoaXMucGVuZGluZykge1xuICAgICAgaWYgKCFmb3JjZSkge1xuICAgICAgICB0aGlzLnRpbWluZ3MuY29hbGVzY2VkQXV0b21hdGljU2FtcGxlcysrO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnBlbmRpbmc7IC8vIG5ldmVyIHJldHVybiBhbiBvbGQgc25hcHNob3QgZm9yIGFuIGV4YWN0LXN0ZXAgYXNzYXlcbiAgICB9XG4gICAgaWYgKHRoaXMud29ya2VyRmFpbHVyZSkgdGhyb3cgdGhpcy53b3JrZXJGYWlsdXJlO1xuICAgIGNvbnN0IHByb21pc2UgPSB0aGlzLmNhcHR1cmUoZnJhbWUsIHN0ZXAsIHJlc3QsIHZlcmlmaWNhdGlvbik7XG4gICAgdGhpcy5wZW5kaW5nID0gcHJvbWlzZTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgcHJvbWlzZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaWYgKHRoaXMucGVuZGluZyA9PT0gcHJvbWlzZSkgdGhpcy5wZW5kaW5nID0gbnVsbDtcbiAgICB9XG4gIH1cbiAgcHJpdmF0ZSBhc3luYyBjYXB0dXJlKGZyYW1lOiBudW1iZXIsIHN0ZXA6IG51bWJlciwgcmVzdDogbnVtYmVyLCB2ZXJpZmljYXRpb24gPSBmYWxzZSkge1xuICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgY29uc3QgZW5jb2RlciA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIodGhpcy5hY3RpbkJ1ZmZlciwgMCwgdGhpcy5hY3RpblN0YWdpbmcsIDAsIHRoaXMuYWN0aW5TdGFnaW5nLnNpemUpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHRoaXMuY291bnRlckJ1ZmZlciwgMCwgdGhpcy5jb3VudGVyU3RhZ2luZywgMCwgdGhpcy5jb3VudGVyU3RhZ2luZy5zaXplKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcih0aGlzLm1lbWJyYW5lQnVmZmVyLCAwLCB0aGlzLm1lbWJyYW5lU3RhZ2luZywgMCwgdGhpcy5tZW1icmFuZVN0YWdpbmcuc2l6ZSk7XG4gICAgdGhpcy5kZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgY29uc3Qgc3RhZ2VzID0gW3RoaXMuYWN0aW5TdGFnaW5nLCB0aGlzLm1lbWJyYW5lU3RhZ2luZywgdGhpcy5jb3VudGVyU3RhZ2luZ107XG4gICAgbGV0IGNvcGllczogQXJyYXlCdWZmZXJbXTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgbWFwcGVkID0gYXdhaXQgUHJvbWlzZS5hbGxTZXR0bGVkKHN0YWdlcy5tYXAoKGJ1ZmZlcikgPT4gYnVmZmVyLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCkpKTtcbiAgICAgIGNvbnN0IGZhaWxlZCA9IG1hcHBlZC5maW5kKChyZXN1bHQpID0+IHJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIik7XG4gICAgICBpZiAoZmFpbGVkPy5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikgdGhyb3cgZmFpbGVkLnJlYXNvbjtcbiAgICAgIGNvcGllcyA9IHN0YWdlcy5tYXAoKGJ1ZmZlcikgPT4gYnVmZmVyLmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCkpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBmb3IgKGNvbnN0IGJ1ZmZlciBvZiBzdGFnZXMpIGlmIChidWZmZXIubWFwU3RhdGUgPT09IFwibWFwcGVkXCIpIGJ1ZmZlci51bm1hcCgpO1xuICAgIH1cbiAgICB0aGlzLnRpbWluZ3MucmVhZGJhY2tNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQ7XG4gICAgY29uc3Qgd29ya2VyU3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgIGlkID0gKyt0aGlzLm5leHRJZDtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBuZXcgUHJvbWlzZTx7IHN0YXRzOiBBY3RpblN0YXRzOyBhbmFseXNpc01zOiBudW1iZXIgfT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5qb2IgPSB7IGlkLCByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJhbmFseXplXCIsIGlkLCBhY3RpbjogY29waWVzWzBdLCBtZW1icmFuZTogY29waWVzWzFdLCBjb3VudGVyczogY29waWVzWzJdLCBmcmFtZSwgc3RlcCwgcmVzdCwgdmVyaWZpY2F0aW9uIH0sIGNvcGllcyk7XG4gICAgfSk7XG4gICAgdGhpcy50aW1pbmdzLndvcmtlclJvdW5kVHJpcE1zID0gcGVyZm9ybWFuY2Uubm93KCkgLSB3b3JrZXJTdGFydDtcbiAgICB0aGlzLnRpbWluZ3MuYW5hbHlzaXNNcyA9IHJlc3VsdC5hbmFseXNpc01zO1xuICAgIHRoaXMudGltaW5ncy50b3RhbE1zID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydDtcbiAgICBjb25zdCBzID0gcmVzdWx0LnN0YXRzO1xuICAgIHRoaXMuaGlzdG9yeS5wdXNoKHMpO1xuICAgIGlmICh0aGlzLmhpc3RvcnkubGVuZ3RoID4gMTAyNCkgdGhpcy5oaXN0b3J5LnNoaWZ0KCk7XG4gICAgdGhpcy5zaG93KHMpO1xuICAgIHRoaXMub25TYW1wbGU/LihzKTtcbiAgICBpZiAodGhpcy5wb3N0VG9TZXJ2ZXIpXG4gICAgICBmZXRjaChcIi9fX3RlbGVtZXRyeVwiLCB7IG1ldGhvZDogXCJQT1NUXCIsIGhlYWRlcnM6IHsgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSwgYm9keTogSlNPTi5zdHJpbmdpZnkocykgfSkudGhlbihcbiAgICAgICAgKHIpID0+ICh0aGlzLnBvc3RUb1NlcnZlciA9IHIub2spLFxuICAgICAgICAoKSA9PiAodGhpcy5wb3N0VG9TZXJ2ZXIgPSBmYWxzZSlcbiAgICAgICk7XG4gIH1cbiAgcHJpdmF0ZSBzaG93KHM6IEFjdGluU3RhdHMpIHtcbiAgICBjb25zdCBjID0gcy5jZWxsLFxuICAgICAgciA9IHMucGVyU3RlcDtcbiAgICB0aGlzLnN1bW1hcnkudGV4dENvbnRlbnQgPSBgQ2hlY2tlZCBzdGVwICR7cy5zdGVwfSDCtyBtYXNzIGVycm9yICR7cy5hY3RpbkJhbGFuY2VFcnJvcn0gwrcgRiBpbnNpZGUgJHtzLmluc2lkZVBvbHltZXJCZWFkc30vJHtzLmluUG9seW1lcn0gwrcgYXJlYSAke2MuYXJlYS50b0ZpeGVkKDQpfSDCtyB3b3JrZXIgJHt0aGlzLnRpbWluZ3MuYW5hbHlzaXNNcy50b0ZpeGVkKDApfSBtc2A7XG4gICAgdGhpcy5kaXNwbGF5LnRleHRDb250ZW50ID0gW1xuICAgICAgYGZpbGFtZW50cyAke3MuZmlsYW1lbnRzfSAoYnJhbmNoZXMgJHtzLmJyYW5jaGVzfSkgwrcgcG9seW1lciAkeygoMTAwICogcy5pblBvbHltZXIpIC8gcy5hY3RpbkNvdW50KS50b0ZpeGVkKDEpfSVgLFxuICAgICAgYGxlbmd0aCBtZWFuICR7cy5tZWFuTGVuZ3RoLnRvRml4ZWQoMSl9IG1lZGlhbiAke3MubWVkaWFuTGVuZ3RofSBwOTAgJHtzLnA5MExlbmd0aH0gbWF4ICR7cy5tYXhMZW5ndGh9YCxcbiAgICAgIGBwb2x5bWVyIGFnZSBtZWFuICR7cy5tZWFuUG9seW1lckFnZS50b0ZpeGVkKDApfSBtYXggJHtzLm1heFBvbHltZXJBZ2UudG9GaXhlZCgwKX0gZml4ZWQgc3RlcHNgLFxuICAgICAgYGhpc3QgWzJ8My00fDUtOHw5LTE2fDE3LTMyfDMzLTY0fDY1K10gJHtzLmhpc3RvZ3JhbS5qb2luKFwiIFwiKX1gLFxuICAgICAgYGJvbmQvcmVzdCAke3MubWVkaWFuQm9uZExlbmd0aC50b0ZpeGVkKDIpfSDCtyBiZW5kICR7cy5tZWRpYW5CZW5kQW5nbGUudG9GaXhlZCgxKX3CsCDCtyBicm9rZW4gJHtzLmJyb2tlbkxpbmtzfSDCtyBjeWNsZXMgJHtzLmN5Y2xlc31gLFxuICAgICAgYGV2ZW50cy9zdGVwICR7T2JqZWN0LmVudHJpZXMocilcbiAgICAgICAgLm1hcCgoW2ssIHZdKSA9PiBgJHtrfToke3YudG9GaXhlZCgzKX1gKVxuICAgICAgICAuam9pbihcIiBcIil9YCxcbiAgICAgIGB4IGJvdW5kcyAke2MubGVmdC50b0ZpeGVkKDEpfeKAkyR7Yy5yaWdodC50b0ZpeGVkKDEpfSDCtyBtYXRlcmlhbCBtYXJrZXJzICR7Yy5yZWFyWC50b0ZpeGVkKDEpfS8ke2MuZnJvbnRYLnRvRml4ZWQoMSl9IMK3IGNlbnRyb2lkICR7Yy5jZW50cm9pZFgudG9GaXhlZCgxKX0sJHtjLmNlbnRyb2lkWS50b0ZpeGVkKDEpfWAsXG4gICAgICBgbGVuZ3RoICR7Yy5sZW5ndGgudG9GaXhlZCgxKX0gwrcgYXJlYSAke2MuYXJlYS50b0ZpeGVkKDYpfSDCtyBzcGFjaW5nIGZyb250L3JlYXIgJHtjLmZyb250U3BhY2luZy50b0ZpeGVkKDIpfS8ke2MucmVhclNwYWNpbmcudG9GaXhlZCgyKX1gLFxuICAgICAgdGhpcy53ZWxsTWl4ZWRcbiAgICAgICAgPyBgRyBwb29sICR7cy5nQWN0aW5BbW91bnR9ICgke3MuZ0FjdGluQ29uY2VudHJhdGlvbi50b0ZpeGVkKDMpfS9weMKyKSDCtyBjcm9zc2luZyBib25kcyAke3MuY3Jvc3NpbmdGaWxhbWVudEJvbmRzfWBcbiAgICAgICAgOiBgaW5zaWRlOiAke3MuaW5zaWRlUG9seW1lckJlYWRzfSBGICsgJHtzLmluc2lkZU1vbm9tZXJCZWFkc30gRyBiZWFkc2AsXG4gICAgICBgbGVnYWN5IG1hcmtlci14IGhhbGYgcG9seW1lciAke3MucG9zdGVyaW9yUG9seW1lckJlYWRzfSDCtyByZWFkYmFjayAke3RoaXMudGltaW5ncy5yZWFkYmFja01zLnRvRml4ZWQoMSl9IG1zIMK3IHdvcmtlciByb3VuZCB0cmlwICR7dGhpcy50aW1pbmdzLndvcmtlclJvdW5kVHJpcE1zLnRvRml4ZWQoMSl9IG1zYCxcbiAgICBdLmpvaW4oXCJcXG5cIik7XG4gIH1cbiAgc25hcHNob3QoZnJhbWU6IG51bWJlciwgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgIGNvbnN0IGV2ZXJ5ID0gTnVtYmVyKG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoXCJzbmFwc2hvdEV2ZXJ5XCIpKTtcbiAgICBpZiAoIWV2ZXJ5IHx8IGZyYW1lICUgZXZlcnkgIT09IDApIHJldHVybjtcbiAgICBjYW52YXMudG9CbG9iKChibG9iKSA9PiBibG9iICYmIGZldGNoKGAvX19zbmFwc2hvdD9uYW1lPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGAke3RoaXMucnVufS0ke2ZyYW1lfWApfWAsIHsgbWV0aG9kOiBcIlBPU1RcIiwgYm9keTogYmxvYiB9KSk7XG4gIH1cbn1cbiIsIlxuZnVuY3Rpb24gdGhyb3dEZXRlY3Rpb25FcnJvcihlcnJvcjogc3RyaW5nKTogbmV2ZXIge1xuICBjb25zdCBub3RpY2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yPEhUTUxFbGVtZW50PihcIi53ZWJncHUtbm90LXN1cHBvcnRlZFwiKTtcbiAgaWYgKG5vdGljZSkgbm90aWNlLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGQgbm90IGluaXRpYWxpemUgV2ViR1BVOiBcIiArIGVycm9yKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlcXVlc3REZXZpY2UoXG4gIG9wdGlvbnM6IEdQVVJlcXVlc3RBZGFwdGVyT3B0aW9ucyA9IHtcbiAgICBwb3dlclByZWZlcmVuY2U6IFwiaGlnaC1wZXJmb3JtYW5jZVwiLFxuICB9LFxuICByZXF1aXJlZEZlYXR1cmVzOiBHUFVGZWF0dXJlTmFtZVtdID0gW10sXG4gIHJlcXVpcmVkTGltaXRzOiBSZWNvcmQ8c3RyaW5nLCB1bmRlZmluZWQgfCBudW1iZXI+ID0ge1xuICAgIG1heFN0b3JhZ2VUZXh0dXJlc1BlclNoYWRlclN0YWdlOiA4LFxuICB9XG4pOiBQcm9taXNlPEdQVURldmljZT4ge1xuICBpZiAoIW5hdmlnYXRvci5ncHUpIHRocm93RGV0ZWN0aW9uRXJyb3IoXCJXZWJHUFUgTk9UIFN1cHBvcnRlZFwiKTtcblxuICBjb25zdCBhZGFwdGVyID0gYXdhaXQgbmF2aWdhdG9yLmdwdS5yZXF1ZXN0QWRhcHRlcihvcHRpb25zKTtcbiAgaWYgKCFhZGFwdGVyKSB0aHJvd0RldGVjdGlvbkVycm9yKFwiTm8gR1BVIGFkYXB0ZXIgZm91bmRcIik7XG5cbiAgY29uc3QgY2FuVGltZXN0YW1wID0gYWRhcHRlci5mZWF0dXJlcy5oYXMoXCJ0aW1lc3RhbXAtcXVlcnlcIik7XG4gIGNvbnN0IGZlYXR1cmVzID0gWy4uLnJlcXVpcmVkRmVhdHVyZXNdO1xuXG4gIGlmIChjYW5UaW1lc3RhbXApIHtcbiAgICBmZWF0dXJlcy5wdXNoKFwidGltZXN0YW1wLXF1ZXJ5XCIpO1xuICB9XG5cbiAgLy8gSW5zdGVhZCBvZiBwYXNzaW5nIGEgcmVjb3JkIHRoYXQgbWlnaHQgaGF2ZSB1bmRlZmluZWQgdmFsdWVzLCBmaWx0ZXIgdGhlbSBvdXQ6XG4gIGNvbnN0IGxpbWl0cyA9IE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhyZXF1aXJlZExpbWl0cykuZmlsdGVyKChba2V5LCB2YWx1ZV0pID0+IHZhbHVlICE9PSB1bmRlZmluZWQpKSBhcyBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+O1xuXG4gIC8vIFRoZW4gdXNlIHRoZSBmaWx0ZXJlZCBsaW1pdHMgb2JqZWN0OlxuICByZXR1cm4gYWRhcHRlci5yZXF1ZXN0RGV2aWNlKHtcbiAgICByZXF1aXJlZEZlYXR1cmVzOiBmZWF0dXJlcyxcbiAgICByZXF1aXJlZExpbWl0czogbGltaXRzLFxuICAgIC4uLihjYW5UaW1lc3RhbXAgPyBbXCJ0aW1lc3RhbXAtcXVlcnlcIl0gOiBbXSksXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlndXJlQ2FudmFzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgaWQ6IHN0cmluZyxcbiAgc2l6ZSA9IHsgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoLCBoZWlnaHQ6IHdpbmRvdy5pbm5lckhlaWdodCB9XG4pOiB7XG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQ7XG4gIGNvbnRleHQ6IEdQVUNhbnZhc0NvbnRleHQ7XG4gIGZvcm1hdDogR1BVVGV4dHVyZUZvcm1hdDtcbiAgc2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xufSB7XG4gIGNvbnN0IGNhbnZhcyA9IE9iamVjdC5hc3NpZ24oZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSwgc2l6ZSk7XG4gIGNhbnZhcy5pZCA9IGlkO1xuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwid2ViZ3B1XCIpO1xuICBpZiAoIWNvbnRleHQpIHRocm93RGV0ZWN0aW9uRXJyb3IoXCJDYW52YXMgZG9lcyBub3Qgc3VwcG9ydCBXZWJHUFVcIik7XG5cbiAgY29uc3QgZm9ybWF0ID0gbmF2aWdhdG9yLmdwdS5nZXRQcmVmZXJyZWRDYW52YXNGb3JtYXQoKTtcbiAgY29udGV4dC5jb25maWd1cmUoe1xuICAgIGRldmljZTogZGV2aWNlLFxuICAgIGZvcm1hdDogZm9ybWF0LFxuICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuUkVOREVSX0FUVEFDSE1FTlQsXG4gICAgYWxwaGFNb2RlOiBcInByZW11bHRpcGxpZWRcIixcbiAgfSk7XG5cbiAgcmV0dXJuIHsgY2FudmFzOiBjYW52YXMsIGNvbnRleHQ6IGNvbnRleHQsIGZvcm1hdDogZm9ybWF0LCBzaXplOiBzaXplIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVTaGFkZXIoZGV2aWNlOiBHUFVEZXZpY2UsIGNvZGU6IHN0cmluZywgaW5jbHVkZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogUHJvbWlzZTxHUFVTaGFkZXJNb2R1bGU+IHtcbiAgLy8gUHJvY2VzcyB0aGUgY29kZSB3aXRoIGltcG9ydHNcbiAgY29uc3QgcHJvY2Vzc2VkQ29kZSA9IHByZXBlbmRJbmNsdWRlcyhjb2RlLCBpbmNsdWRlcyk7XG5cbiAgY29uc3QgbW9kdWxlID0gZGV2aWNlLmNyZWF0ZVNoYWRlck1vZHVsZSh7IGNvZGU6IHByb2Nlc3NlZENvZGUgfSk7XG4gIGNvbnN0IGluZm8gPSBhd2FpdCBtb2R1bGUuZ2V0Q29tcGlsYXRpb25JbmZvKCk7XG4gIGlmIChpbmZvLm1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKGxldCBtZXNzYWdlIG9mIGluZm8ubWVzc2FnZXMpIHtcbiAgICAgIGNvbnNvbGUud2FybihgJHttZXNzYWdlLm1lc3NhZ2V9IFxuICBhdCBsaW5lICR7bWVzc2FnZS5saW5lTnVtfWApO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBjb21waWxlIHNoYWRlcmApO1xuICB9XG4gIHJldHVybiBtb2R1bGU7XG59XG5cbi8qKlxuICogUHJvY2VzcyBpbXBvcnQgc3RhdGVtZW50cyBpbiBzaGFkZXIgY29kZSB0byBpbmNsdWRlIHRoZSBjb250ZW50IG9mIHJlZmVyZW5jZWQgbW9kdWxlc1xuICogQHBhcmFtIGNvZGUgLSBUaGUgc2hhZGVyIGNvZGUgY29udGFpbmluZyBpbXBvcnQgc3RhdGVtZW50c1xuICogQHBhcmFtIGluY2x1ZGVzIC0gT3B0aW9uYWwgbWFwcGluZyBvZiBtb2R1bGUgbmFtZXMgdG8gdGhlaXIgY29udGVudFxuICogQHJldHVybnMgVGhlIHByb2Nlc3NlZCBzaGFkZXIgY29kZSB3aXRoIGltcG9ydHMgcmVzb2x2ZWRcbiAqL1xuZnVuY3Rpb24gcHJlcGVuZEluY2x1ZGVzKGNvZGU6IHN0cmluZywgaW5jbHVkZXM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogc3RyaW5nIHtcbiAgLy8gRXh0cmFjdCBpbXBvcnQgc3RhdGVtZW50c1xuICBjb25zdCBpbXBvcnRSZWdleCA9IC9eI2ltcG9ydFxccysoW2EtekEtWjAtOV9dKyk6OihbYS16QS1aMC05X10rKS9nbTtcbiAgY29uc3QgaW1wb3J0cyA9IFsuLi5jb2RlLm1hdGNoQWxsKGltcG9ydFJlZ2V4KV07XG5cbiAgLy8gQnVpbGQgYSBtYXAgb2YgaW1wb3J0cyB0byB0aGVpciBjb250ZW50XG4gIGNvbnN0IGluY2x1ZGVzVG9BZGQ6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gPSB7fTtcblxuICAvLyBQcm9jZXNzIGVhY2ggaW1wb3J0XG4gIGZvciAoY29uc3QgW2Z1bGxNYXRjaCwgbmFtZXNwYWNlLCBtb2R1bGVOYW1lXSBvZiBpbXBvcnRzKSB7XG4gICAgaWYgKG5hbWVzcGFjZSA9PT0gXCJpbmNsdWRlc1wiICYmIGluY2x1ZGVzICYmIG1vZHVsZU5hbWUgaW4gaW5jbHVkZXMpIHtcbiAgICAgIGluY2x1ZGVzVG9BZGRbZnVsbE1hdGNoXSA9IGluY2x1ZGVzW21vZHVsZU5hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLndhcm4oYENvdWxkIG5vdCByZXNvbHZlIGltcG9ydDogJHtmdWxsTWF0Y2h9YCk7XG4gICAgfVxuICB9XG5cbiAgLy8gUmVwbGFjZSBpbXBvcnQgc3RhdGVtZW50cyB3aXRoIHRoZWlyIGNvbnRlbnRcbiAgbGV0IHByb2Nlc3NlZENvZGUgPSBjb2RlO1xuICBmb3IgKGNvbnN0IFtpbXBvcnRTdGF0ZW1lbnQsIGNvbnRlbnRdIG9mIE9iamVjdC5lbnRyaWVzKGluY2x1ZGVzVG9BZGQpKSB7XG4gICAgLy8gUmVwbGFjZSB0aGUgaW1wb3J0IHN0YXRlbWVudCB3aXRoIHRoZSBjb250ZW50XG4gICAgcHJvY2Vzc2VkQ29kZSA9IHByb2Nlc3NlZENvZGUucmVwbGFjZShpbXBvcnRTdGF0ZW1lbnQsIGNvbnRlbnQpO1xuICB9XG5cbiAgcmV0dXJuIHByb2Nlc3NlZENvZGU7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjcmVhdGVQZXJmb3JtYW5jZVF1ZXJpZXMoZGV2aWNlOiBHUFVEZXZpY2UpOiBQcm9taXNlPHtcbiAgcXVlcnlTZXQ6IEdQVVF1ZXJ5U2V0O1xuICByZXNvbHZlQnVmZmVyOiBHUFVCdWZmZXI7XG4gIHJlc3VsdEJ1ZmZlcjogR1BVQnVmZmVyO1xufT4ge1xuICBjb25zdCBjYW5UaW1lc3RhbXAgPSBkZXZpY2UuZmVhdHVyZXMuaGFzKFwidGltZXN0YW1wLXF1ZXJ5XCIpO1xuICAvLyBpZiAoIWNhblRpbWVzdGFtcCkge1xuICAvLyAgIGNvbnNvbGUud2FybihcIlRpbWVzdGFtcCBxdWVyaWVzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoaXMgZGV2aWNlLlwiKTtcbiAgLy8gICByZXR1cm4ge307XG4gIC8vIH1cbiAgY29uc3QgcXVlcnlTZXQgPSBkZXZpY2UuY3JlYXRlUXVlcnlTZXQoe1xuICAgIHR5cGU6IFwidGltZXN0YW1wXCIsXG4gICAgY291bnQ6IDIsXG4gIH0pO1xuXG4gIGNvbnN0IHJlc29sdmVCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBzaXplOiBxdWVyeVNldC5jb3VudCAqIDgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlFVRVJZX1JFU09MVkUgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX1NSQyxcbiAgfSk7XG5cbiAgY29uc3QgcmVzdWx0QnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgc2l6ZTogcmVzb2x2ZUJ1ZmZlci5zaXplLFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB8IEdQVUJ1ZmZlclVzYWdlLk1BUF9SRUFELFxuICB9KTtcblxuICByZXR1cm4geyBxdWVyeVNldCwgcmVzb2x2ZUJ1ZmZlciwgcmVzdWx0QnVmZmVyIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEludGVyYWN0aW9ucyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgfCBPZmZzY3JlZW5DYW52YXMsXG4gIHRleHR1cmU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSxcbiAgc2l6ZTogbnVtYmVyID0gMTBcbik6IHtcbiAgaW50ZXJhY3Rpb25zOiB7XG4gICAgZGF0YTogRmxvYXQzMkFycmF5O1xuICAgIGJ1ZmZlcjogR1BVQnVmZmVyO1xuICB9O1xuICBjb250cm9sczoge1xuICAgIGRhdGE6IEFycmF5QnVmZmVyO1xuICAgIGJ1ZmZlcjogR1BVQnVmZmVyO1xuICB9O1xuICB0eXBlOiBHUFVCdWZmZXJCaW5kaW5nVHlwZTtcbn0ge1xuICBsZXQgdW5pZm9ybUJ1ZmZlckRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KDQpO1xuICBsZXQgY29udHJvbHNCdWZmZXJEYXRhID0gbmV3IEFycmF5QnVmZmVyKDMzNik7XG5cbiAgdmFyIHNpZ24gPSAxO1xuXG4gIGxldCBwb3NpdGlvbiA9IHsgeDogMCwgeTogMCB9O1xuICBsZXQgdmVsb2NpdHkgPSB7IHg6IDAsIHk6IDAgfTtcblxuICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3Bvc2l0aW9uLngsIHBvc2l0aW9uLnldKTtcbiAgaWYgKGNhbnZhcyBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgLy8gZGlzYWJsZSBjb250ZXh0IG1lbnVcbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcImNvbnRleHRtZW51XCIsIChldmVudCkgPT4ge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIC8vIG1vdmUgZXZlbnRzXG4gICAgW1wibW91c2Vtb3ZlXCIsIFwidG91Y2htb3ZlXCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBjb25zdCByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICAgIGxldCBjbGllbnRYID0gMDtcbiAgICAgICAgICBsZXQgY2xpZW50WSA9IDA7XG5cbiAgICAgICAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50KSB7XG4gICAgICAgICAgICBjbGllbnRYID0gZXZlbnQuY2xpZW50WDtcbiAgICAgICAgICAgIGNsaWVudFkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQgaW5zdGFuY2VvZiBUb3VjaEV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQudG91Y2hlcy5sZW5ndGggPT09IDApIHJldHVybjtcbiAgICAgICAgICAgIGNsaWVudFggPSBldmVudC50b3VjaGVzWzBdLmNsaWVudFg7XG4gICAgICAgICAgICBjbGllbnRZID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHBvc2l0aW9uLnggPSBjbGllbnRYIC0gcmVjdC5sZWZ0O1xuICAgICAgICAgIHBvc2l0aW9uLnkgPSBjbGllbnRZIC0gcmVjdC50b3A7XG5cbiAgICAgICAgICAvLyBTY2FsZSBmcm9tIENTUyBwaXhlbHMgdG8gdGV4dHVyZSBjb29yZGluYXRlc1xuICAgICAgICAgIGNvbnN0IHggPSBNYXRoLmZsb29yKChwb3NpdGlvbi54IC8gcmVjdC53aWR0aCkgKiB0ZXh0dXJlLndpZHRoKTtcbiAgICAgICAgICBjb25zdCB5ID0gTWF0aC5mbG9vcigocG9zaXRpb24ueSAvIHJlY3QuaGVpZ2h0KSAqIHRleHR1cmUuaGVpZ2h0KTtcblxuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbeCwgeV0pO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIHpvb20gZXZlbnRzIFRPRE8oQGdzemVwKSBhZGQgcGluY2ggYW5kIHNjcm9sbCBmb3IgdG91Y2ggZGV2aWNlc1xuICAgIFtcIndoZWVsXCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBXaGVlbEV2ZW50OlxuICAgICAgICAgICAgICB2ZWxvY2l0eS54ID0gZXZlbnQuZGVsdGFZO1xuICAgICAgICAgICAgICB2ZWxvY2l0eS55ID0gZXZlbnQuZGVsdGFZO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzaXplICs9IHZlbG9jaXR5Lnk7XG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtzaXplXSwgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgLy8gY2xpY2sgZXZlbnRzIFRPRE8oQGdzemVwKSBpbXBsZW1lbnQgcmlnaHQgY2xpY2sgZXF1aXZhbGVudCBmb3IgdG91Y2ggZGV2aWNlc1xuICAgIFtcIm1vdXNlZG93blwiLCBcInRvdWNoc3RhcnRcIl0uZm9yRWFjaCgodHlwZSkgPT4ge1xuICAgICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAgIHR5cGUsXG4gICAgICAgIChldmVudCkgPT4ge1xuICAgICAgICAgIHN3aXRjaCAodHJ1ZSkge1xuICAgICAgICAgICAgY2FzZSBldmVudCBpbnN0YW5jZW9mIE1vdXNlRXZlbnQ6XG4gICAgICAgICAgICAgIHNpZ24gPSAxIC0gZXZlbnQuYnV0dG9uO1xuICAgICAgICAgICAgICBicmVhaztcblxuICAgICAgICAgICAgY2FzZSBldmVudCBpbnN0YW5jZW9mIFRvdWNoRXZlbnQ6XG4gICAgICAgICAgICAgIHNpZ24gPSBldmVudC50b3VjaGVzLmxlbmd0aCA+IDEgPyAtMSA6IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbc2lnbiAqIHNpemVdLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG4gICAgW1wibW91c2V1cFwiLCBcInRvdWNoZW5kXCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW05hTl0sIDIpO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcbiAgfVxuICBjb25zdCB1bmlmb3JtQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgbGFiZWw6IFwiSW50ZXJhY3Rpb24gQnVmZmVyXCIsXG4gICAgc2l6ZTogdW5pZm9ybUJ1ZmZlckRhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICBjb25zdCBjb250cm9sc0J1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIGxhYmVsOiBcIkNvbnRyb2xzIEJ1ZmZlclwiLFxuICAgIHNpemU6IGNvbnRyb2xzQnVmZmVyRGF0YS5ieXRlTGVuZ3RoLFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5VTklGT1JNIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gIH0pO1xuXG4gIHJldHVybiB7XG4gICAgaW50ZXJhY3Rpb25zOiB7IGRhdGE6IHVuaWZvcm1CdWZmZXJEYXRhLCBidWZmZXI6IHVuaWZvcm1CdWZmZXIgfSxcbiAgICBjb250cm9sczogeyBkYXRhOiBjb250cm9sc0J1ZmZlckRhdGEsIGJ1ZmZlcjogY29udHJvbHNCdWZmZXIgfSxcbiAgICB0eXBlOiBcInVuaWZvcm1cIixcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVGV4dHVyZXMoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBiaW5kaW5nczogbnVtYmVyW10sXG4gIGRhdGE6IHsgW2tleTogbnVtYmVyXTogbnVtYmVyW11bXVtdIH0sXG4gIHNpemU6IHtcbiAgICBkZXB0aE9yQXJyYXlMYXllcnM/OiB7IFtrZXk6IG51bWJlcl06IG51bWJlciB9O1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gIH0sXG4gIGZvcm1hdD86IHsgW2tleTogbnVtYmVyXTogR1BVVGV4dHVyZUZvcm1hdCB9XG4pOiB7XG4gIGNhbnZhczoge1xuICAgIGJ1ZmZlcjogR1BVQnVmZmVyO1xuICAgIGRhdGE6IFVpbnQzMkFycmF5O1xuICAgIHR5cGU6IEdQVUJ1ZmZlckJpbmRpbmdUeXBlO1xuICB9O1xuICB0ZXh0dXJlczogeyBba2V5OiBudW1iZXJdOiBHUFVUZXh0dXJlIH07XG4gIGJpbmRpbmdMYXlvdXQ6IHsgW2tleTogbnVtYmVyXTogR1BVU3RvcmFnZVRleHR1cmVCaW5kaW5nTGF5b3V0IH07XG4gIHNpemU6IHtcbiAgICBkZXB0aE9yQXJyYXlMYXllcnM/OiB7IFtrZXk6IG51bWJlcl06IG51bWJlciB9O1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gIH07XG59IHtcbiAgY29uc3QgdGV4dHVyZXM6IHsgW2tleTogbnVtYmVyXTogR1BVVGV4dHVyZSB9ID0ge307XG4gIGNvbnN0IGJpbmRpbmdMYXlvdXQ6IHsgW2tleTogbnVtYmVyXTogR1BVU3RvcmFnZVRleHR1cmVCaW5kaW5nTGF5b3V0IH0gPSB7fTtcbiAgY29uc3QgZGVwdGhPckFycmF5TGF5ZXJzID0gc2l6ZS5kZXB0aE9yQXJyYXlMYXllcnMgfHwge307XG4gIGNvbnN0IERFRkFVTFRfRk9STUFUID0gXCJyMzJmbG9hdFwiO1xuXG4gIGJpbmRpbmdzLmZvckVhY2goKGtleSkgPT4ge1xuICAgIHRleHR1cmVzW2tleV0gPSBkZXZpY2UuY3JlYXRlVGV4dHVyZSh7XG4gICAgICB1c2FnZTogR1BVVGV4dHVyZVVzYWdlLlNUT1JBR0VfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5DT1BZX0RTVCxcbiAgICAgIGZvcm1hdDogZm9ybWF0ICYmIGtleSBpbiBmb3JtYXQgPyBmb3JtYXRba2V5XSA6IERFRkFVTFRfRk9STUFULFxuICAgICAgc2l6ZToge1xuICAgICAgICB3aWR0aDogc2l6ZS53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBzaXplLmhlaWdodCxcbiAgICAgICAgZGVwdGhPckFycmF5TGF5ZXJzOiBrZXkgaW4gZGVwdGhPckFycmF5TGF5ZXJzID8gZGVwdGhPckFycmF5TGF5ZXJzW2tleV0gOiAxLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG5cbiAgT2JqZWN0LmtleXModGV4dHVyZXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgIGNvbnN0IGxheWVycyA9IGtleSBpbiBkZXB0aE9yQXJyYXlMYXllcnMgPyBkZXB0aE9yQXJyYXlMYXllcnNba2V5XSA6IDE7XG5cbiAgICBiaW5kaW5nTGF5b3V0W2tleV0gPSB7XG4gICAgICBmb3JtYXQ6IGZvcm1hdCAmJiBrZXkgaW4gZm9ybWF0ID8gZm9ybWF0W2tleV0gOiBERUZBVUxUX0ZPUk1BVCxcbiAgICAgIGFjY2VzczogXCJyZWFkLXdyaXRlXCIsXG4gICAgICB2aWV3RGltZW5zaW9uOiBsYXllcnMgPiAxID8gXCIyZC1hcnJheVwiIDogXCIyZFwiLFxuICAgIH07XG5cbiAgICBjb25zdCBhcnJheSA9IGtleSBpbiBkYXRhID8gbmV3IEZsb2F0MzJBcnJheShmbGF0dGVuKGRhdGFba2V5XSkpIDogbmV3IEZsb2F0MzJBcnJheShzaXplLndpZHRoICogc2l6ZS5oZWlnaHQgKiBsYXllcnMpO1xuXG4gICAgY29uc3QgY2hhbm5lbHMgPSBjaGFubmVsQ291bnQoYmluZGluZ0xheW91dFtrZXldLmZvcm1hdCk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlVGV4dHVyZShcbiAgICAgIHsgdGV4dHVyZTogdGV4dHVyZXNba2V5XSB9LFxuICAgICAgLypkYXRhPSovIGFycmF5LFxuICAgICAgLypkYXRhTGF5b3V0PSovIHtcbiAgICAgICAgb2Zmc2V0OiAwLFxuICAgICAgICBieXRlc1BlclJvdzogc2l6ZS53aWR0aCAqIGFycmF5LkJZVEVTX1BFUl9FTEVNRU5UICogY2hhbm5lbHMsXG4gICAgICAgIHJvd3NQZXJJbWFnZTogc2l6ZS5oZWlnaHQsXG4gICAgICB9LFxuICAgICAgLypzaXplPSovIHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgIGRlcHRoT3JBcnJheUxheWVyczogbGF5ZXJzLFxuICAgICAgfVxuICAgICk7XG4gIH0pO1xuXG4gIGxldCBjYW52YXNEYXRhID0gbmV3IFVpbnQzMkFycmF5KFtzaXplLndpZHRoLCBzaXplLmhlaWdodCwgMCwgMCwgMCwgMF0pO1xuICBjb25zdCBjYW52YXNCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJDYW52YXMgQnVmZmVyXCIsXG4gICAgc2l6ZTogY2FudmFzRGF0YS5ieXRlTGVuZ3RoLFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5VTklGT1JNIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gIH0pO1xuXG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihjYW52YXNCdWZmZXIsIC8qb2Zmc2V0PSovIDAsIC8qZGF0YT0qLyBjYW52YXNEYXRhKTtcblxuICByZXR1cm4ge1xuICAgIGNhbnZhczoge1xuICAgICAgYnVmZmVyOiBjYW52YXNCdWZmZXIsXG4gICAgICBkYXRhOiBjYW52YXNEYXRhLFxuICAgICAgdHlwZTogXCJ1bmlmb3JtXCIsXG4gICAgfSxcbiAgICB0ZXh0dXJlczogdGV4dHVyZXMsXG4gICAgYmluZGluZ0xheW91dDogYmluZGluZ0xheW91dCxcbiAgICBzaXplOiBzaXplLFxuICB9O1xufVxuXG5mdW5jdGlvbiBjaGFubmVsQ291bnQoZm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0KTogbnVtYmVyIHtcbiAgaWYgKGZvcm1hdC5pbmNsdWRlcyhcInJnYmFcIikpIHtcbiAgICByZXR1cm4gNDtcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ2JcIikpIHtcbiAgICByZXR1cm4gMztcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ1wiKSkge1xuICAgIHJldHVybiAyO1xuICB9IGVsc2UgaWYgKGZvcm1hdC5pbmNsdWRlcyhcInJcIikpIHtcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGZvcm1hdDogXCIgKyBmb3JtYXQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXR0ZW4obmVzdGVkQXJyYXk6IG51bWJlcltdW11bXSk6IG51bWJlcltdIHtcbiAgY29uc3QgZmxhdHRlbmVkOiBudW1iZXJbXSA9IFtdO1xuICBmb3IgKGxldCBrID0gMDsgayA8IG5lc3RlZEFycmF5WzBdWzBdLmxlbmd0aDsgaysrKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuZXN0ZWRBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBuZXN0ZWRBcnJheVswXS5sZW5ndGg7IGorKykge1xuICAgICAgICBmbGF0dGVuZWQucHVzaChuZXN0ZWRBcnJheVtpXVtqXVtrXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZsYXR0ZW5lZDtcbn1cblxuZnVuY3Rpb24gemVyb3MoaGVpZ2h0OiBudW1iZXIsIHdpZHRoOiBudW1iZXIsIGxheWVyczogbnVtYmVyID0gMSk6IG51bWJlcltdW11bXSB7XG4gIGNvbnN0IHplcm9BcnJheTogbnVtYmVyW11bXVtdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgIGNvbnN0IHJvdzogbnVtYmVyW11bXSA9IFtdO1xuICAgIGZvciAobGV0IGogPSAwOyBqIDwgd2lkdGg7IGorKykge1xuICAgICAgY29uc3QgbGF5ZXI6IG51bWJlcltdID0gW107XG4gICAgICBmb3IgKGxldCBrID0gMDsgayA8IGxheWVyczsgaysrKSB7XG4gICAgICAgIGxheWVyLnB1c2goMCk7XG4gICAgICB9XG4gICAgICByb3cucHVzaChsYXllcik7XG4gICAgfVxuICAgIHplcm9BcnJheS5wdXNoKHJvdyk7XG4gIH1cblxuICByZXR1cm4gemVyb0FycmF5O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UmFuZG9tVmFsdWVzKGxlbmd0aDogbnVtYmVyLCByYW5kb20/OiAoKSA9PiBudW1iZXIpOiBVaW50MzJBcnJheSB7XG4gIC8vIGZhc3QgY3B1LXNpZGUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uXG5cbiAgY29uc3QgbWF4Q2h1bmtMZW5ndGggPSA2NTUzNiAvIDQ7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50MzJBcnJheSg0ICogbGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCA0ICogbGVuZ3RoOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgY29uc3QgY2h1bmtMZW5ndGggPSBNYXRoLm1pbihtYXhDaHVua0xlbmd0aCwgNCAqIGxlbmd0aCAtIGkpO1xuICAgIGlmIChyYW5kb20pIHtcbiAgICAgIGZvciAobGV0IGogPSBpOyBqIDwgTWF0aC5taW4oaSArIGNodW5rTGVuZ3RoLCByZXN1bHQubGVuZ3RoKTsgaisrKSByZXN1bHRbal0gPSBNYXRoLmZsb29yKHJhbmRvbSgpICogNDI5NDk2NzI5Nik7XG4gICAgfSBlbHNlIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMocmVzdWx0LnN1YmFycmF5KGksIGkgKyBjaHVua0xlbmd0aCkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBjbGFzcyBQZXJmb3JtYW5jZU1vbml0b3Ige1xuICBwcml2YXRlIGxhc3RUaW1lOiBudW1iZXI7XG4gIHByaXZhdGUgZnJhbWVDb3VudDogbnVtYmVyO1xuICBwcml2YXRlIGZyYW1lc1BlclRpbWVMb2c6IG51bWJlcjtcbiAgcHJpdmF0ZSBmcHNEaXNwbGF5OiBIVE1MRWxlbWVudDtcblxuICBjb25zdHJ1Y3RvcihmcmFtZXNQZXJUaW1lTG9nOiBudW1iZXIgPSAzMCkge1xuICAgIHRoaXMuZnJhbWVzUGVyVGltZUxvZyA9IGZyYW1lc1BlclRpbWVMb2c7XG4gICAgdGhpcy5mcHNEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpITtcbiAgICB0aGlzLmxhc3RUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgdGhpcy5mcmFtZUNvdW50ID0gMDtcbiAgfVxuXG4gIHB1YmxpYyB1cGRhdGUodGltZTogbnVtYmVyKSB7XG4gICAgaWYgKHRpbWUgJSB0aGlzLmZyYW1lc1BlclRpbWVMb2cgPT09IDApIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgICBjb25zdCB0aW1lRWxhcHNlZCA9IGN1cnJlbnRUaW1lIC0gdGhpcy5sYXN0VGltZTtcblxuICAgICAgLy8gRlBTIENhbGN1bGF0aW9uXG4gICAgICBjb25zdCBmcHMgPSBNYXRoLnJvdW5kKCh0aGlzLmZyYW1lQ291bnQgKiAxMDAwKSAvIHRpbWVFbGFwc2VkKTtcbiAgICAgIHRoaXMuZnBzRGlzcGxheS50ZXh0Q29udGVudCA9IGBGUFM6ICR7ZnBzfWA7XG5cbiAgICAgIC8vIFJlc2V0IGNvdW50ZXJzXG4gICAgICB0aGlzLmZyYW1lQ291bnQgPSAwO1xuICAgICAgdGhpcy5sYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuICAgIH1cbiAgICB0aGlzLmZyYW1lQ291bnQrKztcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9