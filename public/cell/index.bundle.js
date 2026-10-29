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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZLFFBQVE7QUFDcEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxZQUFZLFNBQVM7QUFDckIsY0FBYztBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsWUFBWSxLQUFLO0FBQ2pCLGNBQWM7QUFDZDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLDhDQUE4QyxFQUFFOztBQUVoRDs7QUFFQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQSxHQUFHOztBQUVIOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSxFQUFFO0FBQ0Y7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEVBQUU7QUFDRixnQkFBZ0IsU0FBUzs7QUFFekI7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTs7QUFFSjs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLElBQUk7O0FBRUo7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0EsdURBQXVELElBQUksZ0JBQWdCOztBQUUzRTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU07O0FBRU47O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxvREFBb0QsaUJBQWlCO0FBQ3JFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLEtBQUs7O0FBRUw7QUFDQTs7QUFFQTs7QUFFQSx3REFBd0QsaUJBQWlCO0FBQ3pFOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQSxNQUFNOztBQUVOO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSxLQUFLOztBQUVMO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0EsK0RBQStELGlCQUFpQjtBQUNoRixxREFBcUQsaUJBQWlCOztBQUV0RTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLEtBQUs7QUFDbEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBLFFBQVEsaUJBQWlCOztBQUV6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7O0FBRUo7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLElBQUk7O0FBRUo7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJOztBQUVKO0FBQ0E7QUFDQSxJQUFJOztBQUVKOztBQUVBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUNBQXVDLGNBQWM7QUFDckQsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFH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QUFDLElBQUksQ0FBQyxFQUMvQyxFQUFFLEdBQUcsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQzVCLEVBQUUsR0FBRyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM5QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELENBQUM7UUFDRCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDM0IsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ25CLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQixFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDckMsRUFBRSxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkQsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztR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QyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM3RyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDZCxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckIsTUFBTSxLQUFLLEdBQUcsSUFBSSxZQUFZLENBQUMsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUM1RyxNQUFNLENBQUMsaURBQWlELEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDN0osUUFBUSxFQUFFLENBQUM7SUFDWCxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDckIsU0FBUyxDQUFDLEVBQUUsYUFBYSxFQUFFLENBQUMsRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ3pFLEtBQUssTUFBTSxDQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7UUFDdEMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLHdDQUF3QyxFQUFFLElBQUksQ0FBQztRQUNsRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsbUNBQW1DLEVBQUUsS0FBSyxDQUFD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RyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBRTVDLGlCQUFpQjtZQUNqQixJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQztZQUNwQixJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQztRQUM5QixDQUFDO1FBQ0QsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQ3BCLENBQUM7Q0FDRiIsInNvdXJjZXMiOlsid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9ub2RlX21vZHVsZXMvbGlsLWd1aS9kaXN0L2xpbC1ndWkuZXNtLmpzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvY29udGFjdC1yZWNvdmVyeS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL2VuY2xvc3VyZS10ZXN0LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9tZWNoYW5pY3MtdGVzdC50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL29jY3VwYW5jeS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3JhbmRvbS50cyIsIndlYnBhY2s6Ly93ZWJncHVfY29sbGFiX3N0cmluZ2VkX2VudGl0aWVzLy4vc3JjL3JlYWx0aW1lLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvcmVuZGVyLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvcmVuZXdhbC10ZXN0LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvc2ltdWxhdGUudHMiLCJ3ZWJwYWNrOi8vd2ViZ3B1X2NvbGxhYl9zdHJpbmdlZF9lbnRpdGllcy8uL3NyYy9zcHJvdXRzLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvdGVsZW1ldHJ5LWFuYWx5c2lzLnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvdGVsZW1ldHJ5LnRzIiwid2VicGFjazovL3dlYmdwdV9jb2xsYWJfc3RyaW5nZWRfZW50aXRpZXMvLi9zcmMvdXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBsaWwtZ3VpXG4gKiBodHRwczovL2xpbC1ndWkuZ2VvcmdlYWx3YXlzLmNvbVxuICogQHZlcnNpb24gMC4yMC4wXG4gKiBAYXV0aG9yIEdlb3JnZSBNaWNoYWVsIEJyb3dlclxuICogQGxpY2Vuc2UgTUlUXG4gKi9cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgY29udHJvbGxlcnMuXG4gKi9cbmNsYXNzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksIGNsYXNzTmFtZSwgZWxlbWVudFR5cGUgPSAnZGl2JyApIHtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBHVUkgdGhhdCBjb250YWlucyB0aGlzIGNvbnRyb2xsZXIuXG5cdFx0ICogQHR5cGUge0dVSX1cblx0XHQgKi9cblx0XHR0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBvYmplY3QgdGhpcyBjb250cm9sbGVyIHdpbGwgbW9kaWZ5LlxuXHRcdCAqIEB0eXBlIHtvYmplY3R9XG5cdFx0ICovXG5cdFx0dGhpcy5vYmplY3QgPSBvYmplY3Q7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gY29udHJvbC5cblx0XHQgKiBAdHlwZSB7c3RyaW5nfVxuXHRcdCAqL1xuXHRcdHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjb250cm9sbGVyIGlzIGRpc2FibGVkLlxuXHRcdCAqIFVzZSBgY29udHJvbGxlci5kaXNhYmxlKCB0cnVlfGZhbHNlIClgIHRvIG1vZGlmeSB0aGlzIHZhbHVlLlxuXHRcdCAqIEB0eXBlIHtib29sZWFufVxuXHRcdCAqL1xuXHRcdHRoaXMuX2Rpc2FibGVkID0gZmFsc2U7XG5cblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGRldGVybWluZSBpZiB0aGUgQ29udHJvbGxlciBpcyBoaWRkZW4uXG5cdFx0ICogVXNlIGBjb250cm9sbGVyLnNob3coKWAgb3IgYGNvbnRyb2xsZXIuaGlkZSgpYCB0byBjaGFuZ2UgdGhpcy5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9oaWRkZW4gPSBmYWxzZTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSB2YWx1ZSBvZiBgb2JqZWN0WyBwcm9wZXJ0eSBdYCB3aGVuIHRoZSBjb250cm9sbGVyIHdhcyBjcmVhdGVkLlxuXHRcdCAqIEB0eXBlIHthbnl9XG5cdFx0ICovXG5cdFx0dGhpcy5pbml0aWFsVmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgb3V0ZXJtb3N0IGNvbnRhaW5lciBET00gZWxlbWVudCBmb3IgdGhpcyBjb250cm9sbGVyLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLmRvbUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCBlbGVtZW50VHlwZSApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QuYWRkKCAnY29udHJvbGxlcicgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggY2xhc3NOYW1lICk7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgY29udHJvbGxlcidzIG5hbWUuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJG5hbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJG5hbWUuY2xhc3NMaXN0LmFkZCggJ25hbWUnICk7XG5cblx0XHRDb250cm9sbGVyLm5leHROYW1lSUQgPSBDb250cm9sbGVyLm5leHROYW1lSUQgfHwgMDtcblx0XHR0aGlzLiRuYW1lLmlkID0gYGxpbC1ndWktbmFtZS0keysrQ29udHJvbGxlci5uZXh0TmFtZUlEfWA7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgRE9NIGVsZW1lbnQgdGhhdCBjb250YWlucyB0aGUgY29udHJvbGxlcidzIFwid2lkZ2V0XCIgKHdoaWNoIGRpZmZlcnMgYnkgY29udHJvbGxlciB0eXBlKS5cblx0XHQgKiBAdHlwZSB7SFRNTEVsZW1lbnR9XG5cdFx0ICovXG5cdFx0dGhpcy4kd2lkZ2V0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiR3aWRnZXQuY2xhc3NMaXN0LmFkZCggJ3dpZGdldCcgKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IHJlY2VpdmVzIHRoZSBkaXNhYmxlZCBhdHRyaWJ1dGUgd2hlbiB1c2luZyBkaXNhYmxlKCkuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuJGRpc2FibGUgPSB0aGlzLiR3aWRnZXQ7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuJG5hbWUgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuJHdpZGdldCApO1xuXG5cdFx0Ly8gRG9uJ3QgZmlyZSBnbG9iYWwga2V5IGV2ZW50cyB3aGlsZSB0eXBpbmcgaW4gYSBjb250cm9sbGVyXG5cdFx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZSA9PiBlLnN0b3BQcm9wYWdhdGlvbigpICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXl1cCcsIGUgPT4gZS5zdG9wUHJvcGFnYXRpb24oKSApO1xuXG5cdFx0dGhpcy5wYXJlbnQuY2hpbGRyZW4ucHVzaCggdGhpcyApO1xuXHRcdHRoaXMucGFyZW50LmNvbnRyb2xsZXJzLnB1c2goIHRoaXMgKTtcblxuXHRcdHRoaXMucGFyZW50LiRjaGlsZHJlbi5hcHBlbmRDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cblx0XHR0aGlzLl9saXN0ZW5DYWxsYmFjayA9IHRoaXMuX2xpc3RlbkNhbGxiYWNrLmJpbmQoIHRoaXMgKTtcblxuXHRcdHRoaXMubmFtZSggcHJvcGVydHkgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIG5hbWUgb2YgdGhlIGNvbnRyb2xsZXIgYW5kIGl0cyBsYWJlbCBpbiB0aGUgR1VJLlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdG5hbWUoIG5hbWUgKSB7XG5cdFx0LyoqXG5cdFx0ICogVGhlIGNvbnRyb2xsZXIncyBuYW1lLiBVc2UgYGNvbnRyb2xsZXIubmFtZSggJ05hbWUnIClgIHRvIG1vZGlmeSB0aGlzIHZhbHVlLlxuXHRcdCAqIEB0eXBlIHtzdHJpbmd9XG5cdFx0ICovXG5cdFx0dGhpcy5fbmFtZSA9IG5hbWU7XG5cdFx0dGhpcy4kbmFtZS50ZXh0Q29udGVudCA9IG5hbWU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuZXZlciB0aGUgdmFsdWUgaXMgbW9kaWZpZWQgYnkgdGhpcyBjb250cm9sbGVyLlxuXHQgKiBUaGUgZnVuY3Rpb24gcmVjZWl2ZXMgdGhlIG5ldyB2YWx1ZSBhcyBpdHMgZmlyc3QgcGFyYW1ldGVyLiBUaGUgdmFsdWUgb2YgYHRoaXNgIHdpbGwgYmUgdGhlXG5cdCAqIGNvbnRyb2xsZXIuXG5cdCAqXG5cdCAqIEZvciBmdW5jdGlvbiBjb250cm9sbGVycywgdGhlIGBvbkNoYW5nZWAgY2FsbGJhY2sgd2lsbCBiZSBmaXJlZCBvbiBjbGljaywgYWZ0ZXIgdGhlIGZ1bmN0aW9uXG5cdCAqIGV4ZWN1dGVzLlxuXHQgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogY29uc3QgY29udHJvbGxlciA9IGd1aS5hZGQoIG9iamVjdCwgJ3Byb3BlcnR5JyApO1xuXHQgKlxuXHQgKiBjb250cm9sbGVyLm9uQ2hhbmdlKCBmdW5jdGlvbiggdiApIHtcblx0ICogXHRjb25zb2xlLmxvZyggJ1RoZSB2YWx1ZSBpcyBub3cgJyArIHYgKTtcblx0ICogXHRjb25zb2xlLmFzc2VydCggdGhpcyA9PT0gY29udHJvbGxlciApO1xuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbkNoYW5nZSggY2FsbGJhY2sgKSB7XG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBhY2Nlc3MgdGhlIGZ1bmN0aW9uIGJvdW5kIHRvIGBvbkNoYW5nZWAgZXZlbnRzLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZSBkaXJlY3RseS5cblx0XHQgKiBVc2UgdGhlIGBjb250cm9sbGVyLm9uQ2hhbmdlKCBjYWxsYmFjayApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7RnVuY3Rpb259XG5cdFx0ICovXG5cdFx0dGhpcy5fb25DaGFuZ2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxscyB0aGUgb25DaGFuZ2UgbWV0aG9kcyBvZiB0aGlzIGNvbnRyb2xsZXIgYW5kIGl0cyBwYXJlbnQgR1VJLlxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRfY2FsbE9uQ2hhbmdlKCkge1xuXG5cdFx0dGhpcy5wYXJlbnQuX2NhbGxPbkNoYW5nZSggdGhpcyApO1xuXG5cdFx0aWYgKCB0aGlzLl9vbkNoYW5nZSAhPT0gdW5kZWZpbmVkICkge1xuXHRcdFx0dGhpcy5fb25DaGFuZ2UuY2FsbCggdGhpcywgdGhpcy5nZXRWYWx1ZSgpICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5fY2hhbmdlZCA9IHRydWU7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBQYXNzIGEgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIHRoaXMgY29udHJvbGxlciBoYXMgYmVlbiBtb2RpZmllZCBhbmQgbG9zZXMgZm9jdXMuXG5cdCAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb25zdCBjb250cm9sbGVyID0gZ3VpLmFkZCggb2JqZWN0LCAncHJvcGVydHknICk7XG5cdCAqXG5cdCAqIGNvbnRyb2xsZXIub25GaW5pc2hDaGFuZ2UoIGZ1bmN0aW9uKCB2ICkge1xuXHQgKiBcdGNvbnNvbGUubG9nKCAnQ2hhbmdlcyBjb21wbGV0ZTogJyArIHYgKTtcblx0ICogXHRjb25zb2xlLmFzc2VydCggdGhpcyA9PT0gY29udHJvbGxlciApO1xuXHQgKiB9ICk7XG5cdCAqL1xuXHRvbkZpbmlzaENoYW5nZSggY2FsbGJhY2sgKSB7XG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBhY2Nlc3MgdGhlIGZ1bmN0aW9uIGJvdW5kIHRvIGBvbkZpbmlzaENoYW5nZWAgZXZlbnRzLiBEb24ndCBtb2RpZnkgdGhpcyB2YWx1ZVxuXHRcdCAqIGRpcmVjdGx5LiBVc2UgdGhlIGBjb250cm9sbGVyLm9uRmluaXNoQ2hhbmdlKCBjYWxsYmFjayApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7RnVuY3Rpb259XG5cdFx0ICovXG5cdFx0dGhpcy5fb25GaW5pc2hDaGFuZ2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTaG91bGQgYmUgY2FsbGVkIGJ5IENvbnRyb2xsZXIgd2hlbiBpdHMgd2lkZ2V0cyBsb3NlIGZvY3VzLlxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRfY2FsbE9uRmluaXNoQ2hhbmdlKCkge1xuXG5cdFx0aWYgKCB0aGlzLl9jaGFuZ2VkICkge1xuXG5cdFx0XHR0aGlzLnBhcmVudC5fY2FsbE9uRmluaXNoQ2hhbmdlKCB0aGlzICk7XG5cblx0XHRcdGlmICggdGhpcy5fb25GaW5pc2hDaGFuZ2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdFx0dGhpcy5fb25GaW5pc2hDaGFuZ2UuY2FsbCggdGhpcywgdGhpcy5nZXRWYWx1ZSgpICk7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHR0aGlzLl9jaGFuZ2VkID0gZmFsc2U7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBjb250cm9sbGVyIGJhY2sgdG8gaXRzIGluaXRpYWwgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0cmVzZXQoKSB7XG5cdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5pbml0aWFsVmFsdWUgKTtcblx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoaXMgY29udHJvbGxlci5cblx0ICogQHBhcmFtIHtib29sZWFufSBlbmFibGVkXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb250cm9sbGVyLmVuYWJsZSgpO1xuXHQgKiBjb250cm9sbGVyLmVuYWJsZSggZmFsc2UgKTsgLy8gZGlzYWJsZVxuXHQgKiBjb250cm9sbGVyLmVuYWJsZSggY29udHJvbGxlci5fZGlzYWJsZWQgKTsgLy8gdG9nZ2xlXG5cdCAqL1xuXHRlbmFibGUoIGVuYWJsZWQgPSB0cnVlICkge1xuXHRcdHJldHVybiB0aGlzLmRpc2FibGUoICFlbmFibGVkICk7XG5cdH1cblxuXHQvKipcblx0ICogRGlzYWJsZXMgdGhpcyBjb250cm9sbGVyLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IGRpc2FibGVkXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBjb250cm9sbGVyLmRpc2FibGUoKTtcblx0ICogY29udHJvbGxlci5kaXNhYmxlKCBmYWxzZSApOyAvLyBlbmFibGVcblx0ICogY29udHJvbGxlci5kaXNhYmxlKCAhY29udHJvbGxlci5fZGlzYWJsZWQgKTsgLy8gdG9nZ2xlXG5cdCAqL1xuXHRkaXNhYmxlKCBkaXNhYmxlZCA9IHRydWUgKSB7XG5cblx0XHRpZiAoIGRpc2FibGVkID09PSB0aGlzLl9kaXNhYmxlZCApIHJldHVybiB0aGlzO1xuXG5cdFx0dGhpcy5fZGlzYWJsZWQgPSBkaXNhYmxlZDtcblxuXHRcdHRoaXMuZG9tRWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCAnZGlzYWJsZWQnLCBkaXNhYmxlZCApO1xuXHRcdHRoaXMuJGRpc2FibGUudG9nZ2xlQXR0cmlidXRlKCAnZGlzYWJsZWQnLCBkaXNhYmxlZCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBTaG93cyB0aGUgQ29udHJvbGxlciBhZnRlciBpdCdzIGJlZW4gaGlkZGVuLlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHNob3dcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGNvbnRyb2xsZXIuc2hvdygpO1xuXHQgKiBjb250cm9sbGVyLnNob3coIGZhbHNlICk7IC8vIGhpZGVcblx0ICogY29udHJvbGxlci5zaG93KCBjb250cm9sbGVyLl9oaWRkZW4gKTsgLy8gdG9nZ2xlXG5cdCAqL1xuXHRzaG93KCBzaG93ID0gdHJ1ZSApIHtcblxuXHRcdHRoaXMuX2hpZGRlbiA9ICFzaG93O1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB0aGlzLl9oaWRkZW4gPyAnbm9uZScgOiAnJztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGlkZXMgdGhlIENvbnRyb2xsZXIuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0aGlkZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5zaG93KCBmYWxzZSApO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoYW5nZXMgdGhpcyBjb250cm9sbGVyIGludG8gYSBkcm9wZG93biBvZiBvcHRpb25zLlxuXHQgKlxuXHQgKiBDYWxsaW5nIHRoaXMgbWV0aG9kIG9uIGFuIG9wdGlvbiBjb250cm9sbGVyIHdpbGwgc2ltcGx5IHVwZGF0ZSB0aGUgb3B0aW9ucy4gSG93ZXZlciwgaWYgdGhpc1xuXHQgKiBjb250cm9sbGVyIHdhcyBub3QgYWxyZWFkeSBhbiBvcHRpb24gY29udHJvbGxlciwgb2xkIHJlZmVyZW5jZXMgdG8gdGhpcyBjb250cm9sbGVyIGFyZVxuXHQgKiBkZXN0cm95ZWQsIGFuZCBhIG5ldyBjb250cm9sbGVyIGlzIGFkZGVkIHRvIHRoZSBlbmQgb2YgdGhlIEdVSS5cblx0ICogQGV4YW1wbGVcblx0ICogLy8gc2FmZSB1c2FnZVxuXHQgKlxuXHQgKiBndWkuYWRkKCBvYmosICdwcm9wMScgKS5vcHRpb25zKCBbICdhJywgJ2InLCAnYycgXSApO1xuXHQgKiBndWkuYWRkKCBvYmosICdwcm9wMicgKS5vcHRpb25zKCB7IEJpZzogMTAsIFNtYWxsOiAxIH0gKTtcblx0ICogZ3VpLmFkZCggb2JqLCAncHJvcDMnICk7XG5cdCAqXG5cdCAqIC8vIGRhbmdlclxuXHQgKlxuXHQgKiBjb25zdCBjdHJsMSA9IGd1aS5hZGQoIG9iaiwgJ3Byb3AxJyApO1xuXHQgKiBndWkuYWRkKCBvYmosICdwcm9wMicgKTtcblx0ICpcblx0ICogLy8gY2FsbGluZyBvcHRpb25zIG91dCBvZiBvcmRlciBhZGRzIGEgbmV3IGNvbnRyb2xsZXIgdG8gdGhlIGVuZC4uLlxuXHQgKiBjb25zdCBjdHJsMiA9IGN0cmwxLm9wdGlvbnMoIFsgJ2EnLCAnYicsICdjJyBdICk7XG5cdCAqXG5cdCAqIC8vIC4uLmFuZCBjdHJsMSBub3cgcmVmZXJlbmNlcyBhIGNvbnRyb2xsZXIgdGhhdCBkb2Vzbid0IGV4aXN0XG5cdCAqIGFzc2VydCggY3RybDIgIT09IGN0cmwxIClcblx0ICogQHBhcmFtIHtvYmplY3R8QXJyYXl9IG9wdGlvbnNcblx0ICogQHJldHVybnMge0NvbnRyb2xsZXJ9XG5cdCAqL1xuXHRvcHRpb25zKCBvcHRpb25zICkge1xuXHRcdGNvbnN0IGNvbnRyb2xsZXIgPSB0aGlzLnBhcmVudC5hZGQoIHRoaXMub2JqZWN0LCB0aGlzLnByb3BlcnR5LCBvcHRpb25zICk7XG5cdFx0Y29udHJvbGxlci5uYW1lKCB0aGlzLl9uYW1lICk7XG5cdFx0dGhpcy5kZXN0cm95KCk7XG5cdFx0cmV0dXJuIGNvbnRyb2xsZXI7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbWluaW11bSB2YWx1ZS4gT25seSB3b3JrcyBvbiBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEBwYXJhbSB7bnVtYmVyfSBtaW5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRtaW4oIG1pbiApIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtYXhpbXVtIHZhbHVlLiBPbmx5IHdvcmtzIG9uIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQHBhcmFtIHtudW1iZXJ9IG1heFxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdG1heCggbWF4ICkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFZhbHVlcyBzZXQgYnkgdGhpcyBjb250cm9sbGVyIHdpbGwgYmUgcm91bmRlZCB0byBtdWx0aXBsZXMgb2YgYHN0ZXBgLiBPbmx5IHdvcmtzIG9uIG51bWJlclxuXHQgKiBjb250cm9sbGVycy5cblx0ICogQHBhcmFtIHtudW1iZXJ9IHN0ZXBcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRzdGVwKCBzdGVwICkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJvdW5kcyB0aGUgZGlzcGxheWVkIHZhbHVlIHRvIGEgZml4ZWQgbnVtYmVyIG9mIGRlY2ltYWxzLCB3aXRob3V0IGFmZmVjdGluZyB0aGUgYWN0dWFsIHZhbHVlXG5cdCAqIGxpa2UgYHN0ZXAoKWAuIE9ubHkgd29ya3Mgb24gbnVtYmVyIGNvbnRyb2xsZXJzLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkuYWRkKCBvYmplY3QsICdwcm9wZXJ0eScgKS5saXN0ZW4oKS5kZWNpbWFscyggNCApO1xuXHQgKiBAcGFyYW0ge251bWJlcn0gZGVjaW1hbHNcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRkZWNpbWFscyggZGVjaW1hbHMgKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbHMgYHVwZGF0ZURpc3BsYXkoKWAgZXZlcnkgYW5pbWF0aW9uIGZyYW1lLiBQYXNzIGBmYWxzZWAgdG8gc3RvcCBsaXN0ZW5pbmcuXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gbGlzdGVuXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0bGlzdGVuKCBsaXN0ZW4gPSB0cnVlICkge1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNvbnRyb2xsZXIgaXMgY3VycmVudGx5IGxpc3RlbmluZy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWVcblx0XHQgKiBkaXJlY3RseS4gVXNlIHRoZSBgY29udHJvbGxlci5saXN0ZW4oIHRydWV8ZmFsc2UgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge2Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dGhpcy5fbGlzdGVuaW5nID0gbGlzdGVuO1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5DYWxsYmFja0lEICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHRjYW5jZWxBbmltYXRpb25GcmFtZSggdGhpcy5fbGlzdGVuQ2FsbGJhY2tJRCApO1xuXHRcdFx0dGhpcy5fbGlzdGVuQ2FsbGJhY2tJRCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmluZyApIHtcblx0XHRcdHRoaXMuX2xpc3RlbkNhbGxiYWNrKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdF9saXN0ZW5DYWxsYmFjaygpIHtcblxuXHRcdHRoaXMuX2xpc3RlbkNhbGxiYWNrSUQgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRoaXMuX2xpc3RlbkNhbGxiYWNrICk7XG5cblx0XHQvLyBUbyBwcmV2ZW50IGZyYW1lcmF0ZSBsb3NzLCBtYWtlIHN1cmUgdGhlIHZhbHVlIGhhcyBjaGFuZ2VkIGJlZm9yZSB1cGRhdGluZyB0aGUgZGlzcGxheS5cblx0XHQvLyBOb3RlOiBzYXZlKCkgaXMgdXNlZCBoZXJlIGluc3RlYWQgb2YgZ2V0VmFsdWUoKSBvbmx5IGJlY2F1c2Ugb2YgQ29sb3JDb250cm9sbGVyLiBUaGUgIT09IG9wZXJhdG9yXG5cdFx0Ly8gd29uJ3Qgd29yayBmb3IgY29sb3Igb2JqZWN0cyBvciBhcnJheXMsIGJ1dCBDb2xvckNvbnRyb2xsZXIuc2F2ZSgpIGFsd2F5cyByZXR1cm5zIGEgc3RyaW5nLlxuXG5cdFx0Y29uc3QgY3VyVmFsdWUgPSB0aGlzLnNhdmUoKTtcblxuXHRcdGlmICggY3VyVmFsdWUgIT09IHRoaXMuX2xpc3RlblByZXZWYWx1ZSApIHtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2xpc3RlblByZXZWYWx1ZSA9IGN1clZhbHVlO1xuXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBgb2JqZWN0WyBwcm9wZXJ0eSBdYC5cblx0ICogQHJldHVybnMge2FueX1cblx0ICovXG5cdGdldFZhbHVlKCkge1xuXHRcdHJldHVybiB0aGlzLm9iamVjdFsgdGhpcy5wcm9wZXJ0eSBdO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHZhbHVlIG9mIGBvYmplY3RbIHByb3BlcnR5IF1gLCBpbnZva2VzIGFueSBgb25DaGFuZ2VgIGhhbmRsZXJzIGFuZCB1cGRhdGVzIHRoZSBkaXNwbGF5LlxuXHQgKiBAcGFyYW0ge2FueX0gdmFsdWVcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRzZXRWYWx1ZSggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuZ2V0VmFsdWUoKSAhPT0gdmFsdWUgKSB7XG5cblx0XHRcdHRoaXMub2JqZWN0WyB0aGlzLnByb3BlcnR5IF0gPSB2YWx1ZTtcblx0XHRcdHRoaXMuX2NhbGxPbkNoYW5nZSgpO1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIGRpc3BsYXkgdG8ga2VlcCBpdCBpbiBzeW5jIHdpdGggdGhlIGN1cnJlbnQgdmFsdWUuIFVzZWZ1bCBmb3IgdXBkYXRpbmcgeW91clxuXHQgKiBjb250cm9sbGVycyB3aGVuIHRoZWlyIHZhbHVlcyBoYXZlIGJlZW4gbW9kaWZpZWQgb3V0c2lkZSBvZiB0aGUgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRsb2FkKCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldFZhbHVlKCB2YWx1ZSApO1xuXHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c2F2ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlc3Ryb3lzIHRoaXMgY29udHJvbGxlciBhbmQgcmVtb3ZlcyBpdCBmcm9tIHRoZSBwYXJlbnQgR1VJLlxuXHQgKi9cblx0ZGVzdHJveSgpIHtcblx0XHR0aGlzLmxpc3RlbiggZmFsc2UgKTtcblx0XHR0aGlzLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoIHRoaXMucGFyZW50LmNoaWxkcmVuLmluZGV4T2YoIHRoaXMgKSwgMSApO1xuXHRcdHRoaXMucGFyZW50LmNvbnRyb2xsZXJzLnNwbGljZSggdGhpcy5wYXJlbnQuY29udHJvbGxlcnMuaW5kZXhPZiggdGhpcyApLCAxICk7XG5cdFx0dGhpcy5wYXJlbnQuJGNoaWxkcmVuLnJlbW92ZUNoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblx0fVxuXG59XG5cbmNsYXNzIEJvb2xlYW5Db250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdib29sZWFuJywgJ2xhYmVsJyApO1xuXG5cdFx0dGhpcy4kaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICdjaGVja2JveCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGlucHV0ICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnY2hhbmdlJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy4kaW5wdXQuY2hlY2tlZCApO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJGlucHV0O1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0dGhpcy4kaW5wdXQuY2hlY2tlZCA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG59XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZUNvbG9yU3RyaW5nKCBzdHJpbmcgKSB7XG5cblx0bGV0IG1hdGNoLCByZXN1bHQ7XG5cblx0aWYgKCBtYXRjaCA9IHN0cmluZy5tYXRjaCggLygjfDB4KT8oW2EtZjAtOV17Nn0pL2kgKSApIHtcblxuXHRcdHJlc3VsdCA9IG1hdGNoWyAyIF07XG5cblx0fSBlbHNlIGlmICggbWF0Y2ggPSBzdHJpbmcubWF0Y2goIC9yZ2JcXChcXHMqKFxcZCopXFxzKixcXHMqKFxcZCopXFxzKixcXHMqKFxcZCopXFxzKlxcKS8gKSApIHtcblxuXHRcdHJlc3VsdCA9IHBhcnNlSW50KCBtYXRjaFsgMSBdICkudG9TdHJpbmcoIDE2ICkucGFkU3RhcnQoIDIsIDAgKVxuXHRcdFx0KyBwYXJzZUludCggbWF0Y2hbIDIgXSApLnRvU3RyaW5nKCAxNiApLnBhZFN0YXJ0KCAyLCAwIClcblx0XHRcdCsgcGFyc2VJbnQoIG1hdGNoWyAzIF0gKS50b1N0cmluZyggMTYgKS5wYWRTdGFydCggMiwgMCApO1xuXG5cdH0gZWxzZSBpZiAoIG1hdGNoID0gc3RyaW5nLm1hdGNoKCAvXiM/KFthLWYwLTldKShbYS1mMC05XSkoW2EtZjAtOV0pJC9pICkgKSB7XG5cblx0XHRyZXN1bHQgPSBtYXRjaFsgMSBdICsgbWF0Y2hbIDEgXSArIG1hdGNoWyAyIF0gKyBtYXRjaFsgMiBdICsgbWF0Y2hbIDMgXSArIG1hdGNoWyAzIF07XG5cblx0fVxuXG5cdGlmICggcmVzdWx0ICkge1xuXHRcdHJldHVybiAnIycgKyByZXN1bHQ7XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG5cbn1cblxuY29uc3QgU1RSSU5HID0ge1xuXHRpc1ByaW1pdGl2ZTogdHJ1ZSxcblx0bWF0Y2g6IHYgPT4gdHlwZW9mIHYgPT09ICdzdHJpbmcnLFxuXHRmcm9tSGV4U3RyaW5nOiBub3JtYWxpemVDb2xvclN0cmluZyxcblx0dG9IZXhTdHJpbmc6IG5vcm1hbGl6ZUNvbG9yU3RyaW5nXG59O1xuXG5jb25zdCBJTlQgPSB7XG5cdGlzUHJpbWl0aXZlOiB0cnVlLFxuXHRtYXRjaDogdiA9PiB0eXBlb2YgdiA9PT0gJ251bWJlcicsXG5cdGZyb21IZXhTdHJpbmc6IHN0cmluZyA9PiBwYXJzZUludCggc3RyaW5nLnN1YnN0cmluZyggMSApLCAxNiApLFxuXHR0b0hleFN0cmluZzogdmFsdWUgPT4gJyMnICsgdmFsdWUudG9TdHJpbmcoIDE2ICkucGFkU3RhcnQoIDYsIDAgKVxufTtcblxuY29uc3QgQVJSQVkgPSB7XG5cdGlzUHJpbWl0aXZlOiBmYWxzZSxcblxuXHQvLyBUaGUgYXJyb3cgZnVuY3Rpb24gaXMgaGVyZSB0byBhcHBlYXNlIHRyZWUgc2hha2VycyBsaWtlIGVzYnVpbGQgb3Igd2VicGFjay5cblx0Ly8gU2VlIGh0dHBzOi8vZXNidWlsZC5naXRodWIuaW8vYXBpLyN0cmVlLXNoYWtpbmdcblx0bWF0Y2g6IHYgPT4gQXJyYXkuaXNBcnJheSggdiApLFxuXG5cdGZyb21IZXhTdHJpbmcoIHN0cmluZywgdGFyZ2V0LCByZ2JTY2FsZSA9IDEgKSB7XG5cblx0XHRjb25zdCBpbnQgPSBJTlQuZnJvbUhleFN0cmluZyggc3RyaW5nICk7XG5cblx0XHR0YXJnZXRbIDAgXSA9ICggaW50ID4+IDE2ICYgMjU1ICkgLyAyNTUgKiByZ2JTY2FsZTtcblx0XHR0YXJnZXRbIDEgXSA9ICggaW50ID4+IDggJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXHRcdHRhcmdldFsgMiBdID0gKCBpbnQgJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXG5cdH0sXG5cdHRvSGV4U3RyaW5nKCBbIHIsIGcsIGIgXSwgcmdiU2NhbGUgPSAxICkge1xuXG5cdFx0cmdiU2NhbGUgPSAyNTUgLyByZ2JTY2FsZTtcblxuXHRcdGNvbnN0IGludCA9ICggciAqIHJnYlNjYWxlICkgPDwgMTYgXlxuXHRcdFx0KCBnICogcmdiU2NhbGUgKSA8PCA4IF5cblx0XHRcdCggYiAqIHJnYlNjYWxlICkgPDwgMDtcblxuXHRcdHJldHVybiBJTlQudG9IZXhTdHJpbmcoIGludCApO1xuXG5cdH1cbn07XG5cbmNvbnN0IE9CSkVDVCA9IHtcblx0aXNQcmltaXRpdmU6IGZhbHNlLFxuXHRtYXRjaDogdiA9PiBPYmplY3QoIHYgKSA9PT0gdixcblx0ZnJvbUhleFN0cmluZyggc3RyaW5nLCB0YXJnZXQsIHJnYlNjYWxlID0gMSApIHtcblxuXHRcdGNvbnN0IGludCA9IElOVC5mcm9tSGV4U3RyaW5nKCBzdHJpbmcgKTtcblxuXHRcdHRhcmdldC5yID0gKCBpbnQgPj4gMTYgJiAyNTUgKSAvIDI1NSAqIHJnYlNjYWxlO1xuXHRcdHRhcmdldC5nID0gKCBpbnQgPj4gOCAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cdFx0dGFyZ2V0LmIgPSAoIGludCAmIDI1NSApIC8gMjU1ICogcmdiU2NhbGU7XG5cblx0fSxcblx0dG9IZXhTdHJpbmcoIHsgciwgZywgYiB9LCByZ2JTY2FsZSA9IDEgKSB7XG5cblx0XHRyZ2JTY2FsZSA9IDI1NSAvIHJnYlNjYWxlO1xuXG5cdFx0Y29uc3QgaW50ID0gKCByICogcmdiU2NhbGUgKSA8PCAxNiBeXG5cdFx0XHQoIGcgKiByZ2JTY2FsZSApIDw8IDggXlxuXHRcdFx0KCBiICogcmdiU2NhbGUgKSA8PCAwO1xuXG5cdFx0cmV0dXJuIElOVC50b0hleFN0cmluZyggaW50ICk7XG5cblx0fVxufTtcblxuY29uc3QgRk9STUFUUyA9IFsgU1RSSU5HLCBJTlQsIEFSUkFZLCBPQkpFQ1QgXTtcblxuZnVuY3Rpb24gZ2V0Q29sb3JGb3JtYXQoIHZhbHVlICkge1xuXHRyZXR1cm4gRk9STUFUUy5maW5kKCBmb3JtYXQgPT4gZm9ybWF0Lm1hdGNoKCB2YWx1ZSApICk7XG59XG5cbmNsYXNzIENvbG9yQ29udHJvbGxlciBleHRlbmRzIENvbnRyb2xsZXIge1xuXG5cdGNvbnN0cnVjdG9yKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksIHJnYlNjYWxlICkge1xuXG5cdFx0c3VwZXIoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgJ2NvbG9yJyApO1xuXG5cdFx0dGhpcy4kaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICdjb2xvcicgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0YWJpbmRleCcsIC0xICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbGxlZGJ5JywgdGhpcy4kbmFtZS5pZCApO1xuXG5cdFx0dGhpcy4kdGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiR0ZXh0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAndGV4dCcgKTtcblx0XHR0aGlzLiR0ZXh0LnNldEF0dHJpYnV0ZSggJ3NwZWxsY2hlY2snLCAnZmFsc2UnICk7XG5cdFx0dGhpcy4kdGV4dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHR0aGlzLiRkaXNwbGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRkaXNwbGF5LmNsYXNzTGlzdC5hZGQoICdkaXNwbGF5JyApO1xuXG5cdFx0dGhpcy4kZGlzcGxheS5hcHBlbmRDaGlsZCggdGhpcy4kaW5wdXQgKTtcblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJGRpc3BsYXkgKTtcblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJHRleHQgKTtcblxuXHRcdHRoaXMuX2Zvcm1hdCA9IGdldENvbG9yRm9ybWF0KCB0aGlzLmluaXRpYWxWYWx1ZSApO1xuXHRcdHRoaXMuX3JnYlNjYWxlID0gcmdiU2NhbGU7XG5cblx0XHR0aGlzLl9pbml0aWFsVmFsdWVIZXhTdHJpbmcgPSB0aGlzLnNhdmUoKTtcblx0XHR0aGlzLl90ZXh0Rm9jdXNlZCA9IGZhbHNlO1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0JywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB0aGlzLiRpbnB1dC52YWx1ZSApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kdGV4dC5hZGRFdmVudExpc3RlbmVyKCAnaW5wdXQnLCAoKSA9PiB7XG5cdFx0XHRjb25zdCB0cnlQYXJzZSA9IG5vcm1hbGl6ZUNvbG9yU3RyaW5nKCB0aGlzLiR0ZXh0LnZhbHVlICk7XG5cdFx0XHRpZiAoIHRyeVBhcnNlICkge1xuXHRcdFx0XHR0aGlzLl9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHRyeVBhcnNlICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kdGV4dC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl90ZXh0Rm9jdXNlZCA9IHRydWU7XG5cdFx0XHR0aGlzLiR0ZXh0LnNlbGVjdCgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHRleHQuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCAoKSA9PiB7XG5cdFx0XHR0aGlzLl90ZXh0Rm9jdXNlZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kdGV4dDtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdH1cblxuXHRyZXNldCgpIHtcblx0XHR0aGlzLl9zZXRWYWx1ZUZyb21IZXhTdHJpbmcoIHRoaXMuX2luaXRpYWxWYWx1ZUhleFN0cmluZyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X3NldFZhbHVlRnJvbUhleFN0cmluZyggdmFsdWUgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2Zvcm1hdC5pc1ByaW1pdGl2ZSApIHtcblxuXHRcdFx0Y29uc3QgbmV3VmFsdWUgPSB0aGlzLl9mb3JtYXQuZnJvbUhleFN0cmluZyggdmFsdWUgKTtcblx0XHRcdHRoaXMuc2V0VmFsdWUoIG5ld1ZhbHVlICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHR0aGlzLl9mb3JtYXQuZnJvbUhleFN0cmluZyggdmFsdWUsIHRoaXMuZ2V0VmFsdWUoKSwgdGhpcy5fcmdiU2NhbGUgKTtcblx0XHRcdHRoaXMuX2NhbGxPbkNoYW5nZSgpO1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0XHR9XG5cblx0fVxuXG5cdHNhdmUoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2Zvcm1hdC50b0hleFN0cmluZyggdGhpcy5nZXRWYWx1ZSgpLCB0aGlzLl9yZ2JTY2FsZSApO1xuXHR9XG5cblx0bG9hZCggdmFsdWUgKSB7XG5cdFx0dGhpcy5fc2V0VmFsdWVGcm9tSGV4U3RyaW5nKCB2YWx1ZSApO1xuXHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHR0aGlzLiRpbnB1dC52YWx1ZSA9IHRoaXMuX2Zvcm1hdC50b0hleFN0cmluZyggdGhpcy5nZXRWYWx1ZSgpLCB0aGlzLl9yZ2JTY2FsZSApO1xuXHRcdGlmICggIXRoaXMuX3RleHRGb2N1c2VkICkge1xuXHRcdFx0dGhpcy4kdGV4dC52YWx1ZSA9IHRoaXMuJGlucHV0LnZhbHVlLnN1YnN0cmluZyggMSApO1xuXHRcdH1cblx0XHR0aGlzLiRkaXNwbGF5LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IHRoaXMuJGlucHV0LnZhbHVlO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cbn1cblxuY2xhc3MgRnVuY3Rpb25Db250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdmdW5jdGlvbicgKTtcblxuXHRcdC8vIEJ1dHRvbnMgYXJlIHRoZSBvbmx5IGNhc2Ugd2hlcmUgd2lkZ2V0IGNvbnRhaW5zIG5hbWVcblx0XHR0aGlzLiRidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnYnV0dG9uJyApO1xuXHRcdHRoaXMuJGJ1dHRvbi5hcHBlbmRDaGlsZCggdGhpcy4kbmFtZSApO1xuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kYnV0dG9uICk7XG5cblx0XHR0aGlzLiRidXR0b24uYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgZSA9PiB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLmdldFZhbHVlKCkuY2FsbCggdGhpcy5vYmplY3QgKTtcblx0XHRcdHRoaXMuX2NhbGxPbkNoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdC8vIGVuYWJsZXMgOmFjdGl2ZSBwc2V1ZG8gY2xhc3Mgb24gbW9iaWxlXG5cdFx0dGhpcy4kYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0JywgKCkgPT4ge30sIHsgcGFzc2l2ZTogdHJ1ZSB9ICk7XG5cblx0XHR0aGlzLiRkaXNhYmxlID0gdGhpcy4kYnV0dG9uO1xuXG5cdH1cblxufVxuXG5jbGFzcyBOdW1iZXJDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgbWluLCBtYXgsIHN0ZXAgKSB7XG5cblx0XHRzdXBlciggcGFyZW50LCBvYmplY3QsIHByb3BlcnR5LCAnbnVtYmVyJyApO1xuXG5cdFx0dGhpcy5faW5pdElucHV0KCk7XG5cblx0XHR0aGlzLm1pbiggbWluICk7XG5cdFx0dGhpcy5tYXgoIG1heCApO1xuXG5cdFx0Y29uc3Qgc3RlcEV4cGxpY2l0ID0gc3RlcCAhPT0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuc3RlcCggc3RlcEV4cGxpY2l0ID8gc3RlcCA6IHRoaXMuX2dldEltcGxpY2l0U3RlcCgpLCBzdGVwRXhwbGljaXQgKTtcblxuXHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdH1cblxuXHRkZWNpbWFscyggZGVjaW1hbHMgKSB7XG5cdFx0dGhpcy5fZGVjaW1hbHMgPSBkZWNpbWFscztcblx0XHR0aGlzLnVwZGF0ZURpc3BsYXkoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdG1pbiggbWluICkge1xuXHRcdHRoaXMuX21pbiA9IG1pbjtcblx0XHR0aGlzLl9vblVwZGF0ZU1pbk1heCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0bWF4KCBtYXggKSB7XG5cdFx0dGhpcy5fbWF4ID0gbWF4O1xuXHRcdHRoaXMuX29uVXBkYXRlTWluTWF4KCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRzdGVwKCBzdGVwLCBleHBsaWNpdCA9IHRydWUgKSB7XG5cdFx0dGhpcy5fc3RlcCA9IHN0ZXA7XG5cdFx0dGhpcy5fc3RlcEV4cGxpY2l0ID0gZXhwbGljaXQ7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHR1cGRhdGVEaXNwbGF5KCkge1xuXG5cdFx0Y29uc3QgdmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cblx0XHRpZiAoIHRoaXMuX2hhc1NsaWRlciApIHtcblxuXHRcdFx0bGV0IHBlcmNlbnQgPSAoIHZhbHVlIC0gdGhpcy5fbWluICkgLyAoIHRoaXMuX21heCAtIHRoaXMuX21pbiApO1xuXHRcdFx0cGVyY2VudCA9IE1hdGgubWF4KCAwLCBNYXRoLm1pbiggcGVyY2VudCwgMSApICk7XG5cblx0XHRcdHRoaXMuJGZpbGwuc3R5bGUud2lkdGggPSBwZXJjZW50ICogMTAwICsgJyUnO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCAhdGhpcy5faW5wdXRGb2N1c2VkICkge1xuXHRcdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLl9kZWNpbWFscyA9PT0gdW5kZWZpbmVkID8gdmFsdWUgOiB2YWx1ZS50b0ZpeGVkKCB0aGlzLl9kZWNpbWFscyApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHRfaW5pdElucHV0KCkge1xuXG5cdFx0dGhpcy4kaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnaW5wdXQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAndHlwZScsICd0ZXh0JyApO1xuXHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWxsZWRieScsIHRoaXMuJG5hbWUuaWQgKTtcblxuXHRcdC8vIE9uIHRvdWNoIGRldmljZXMgb25seSwgdXNlIGlucHV0W3R5cGU9bnVtYmVyXSB0byBmb3JjZSBhIG51bWVyaWMga2V5Ym9hcmQuXG5cdFx0Ly8gSWRlYWxseSB3ZSBjb3VsZCB1c2Ugb25lIGlucHV0IHR5cGUgZXZlcnl3aGVyZSwgYnV0IFt0eXBlPW51bWJlcl0gaGFzIHF1aXJrc1xuXHRcdC8vIG9uIGRlc2t0b3AsIGFuZCBbaW5wdXRtb2RlPWRlY2ltYWxdIGhhcyBxdWlya3Mgb24gaU9TLlxuXHRcdC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZ2VvcmdlYWx3YXlzL2xpbC1ndWkvcHVsbC8xNlxuXG5cdFx0Y29uc3QgaXNUb3VjaCA9IHdpbmRvdy5tYXRjaE1lZGlhKCAnKHBvaW50ZXI6IGNvYXJzZSknICkubWF0Y2hlcztcblxuXHRcdGlmICggaXNUb3VjaCApIHtcblx0XHRcdHRoaXMuJGlucHV0LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAnbnVtYmVyJyApO1xuXHRcdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnc3RlcCcsICdhbnknICk7XG5cdFx0fVxuXG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRpbnB1dCApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJGlucHV0O1xuXG5cdFx0Y29uc3Qgb25JbnB1dCA9ICgpID0+IHtcblxuXHRcdFx0bGV0IHZhbHVlID0gcGFyc2VGbG9hdCggdGhpcy4kaW5wdXQudmFsdWUgKTtcblxuXHRcdFx0aWYgKCBpc05hTiggdmFsdWUgKSApIHJldHVybjtcblxuXHRcdFx0aWYgKCB0aGlzLl9zdGVwRXhwbGljaXQgKSB7XG5cdFx0XHRcdHZhbHVlID0gdGhpcy5fc25hcCggdmFsdWUgKTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5zZXRWYWx1ZSggdGhpcy5fY2xhbXAoIHZhbHVlICkgKTtcblxuXHRcdH07XG5cblx0XHQvLyBLZXlzICYgbW91c2Ugd2hlZWxcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGNvbnN0IGluY3JlbWVudCA9IGRlbHRhID0+IHtcblxuXHRcdFx0Y29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KCB0aGlzLiRpbnB1dC52YWx1ZSApO1xuXG5cdFx0XHRpZiAoIGlzTmFOKCB2YWx1ZSApICkgcmV0dXJuO1xuXG5cdFx0XHR0aGlzLl9zbmFwQ2xhbXBTZXRWYWx1ZSggdmFsdWUgKyBkZWx0YSApO1xuXG5cdFx0XHQvLyBGb3JjZSB0aGUgaW5wdXQgdG8gdXBkYXRlRGlzcGxheSB3aGVuIGl0J3MgZm9jdXNlZFxuXHRcdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25LZXlEb3duID0gZSA9PiB7XG5cdFx0XHQvLyBVc2luZyBgZS5rZXlgIGluc3RlYWQgb2YgYGUuY29kZWAgYWxzbyBjYXRjaGVzIE51bXBhZEVudGVyXG5cdFx0XHRpZiAoIGUua2V5ID09PSAnRW50ZXInICkge1xuXHRcdFx0XHR0aGlzLiRpbnB1dC5ibHVyKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGUuY29kZSA9PT0gJ0Fycm93VXAnICkge1xuXHRcdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRcdGluY3JlbWVudCggdGhpcy5fc3RlcCAqIHRoaXMuX2Fycm93S2V5TXVsdGlwbGllciggZSApICk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIGUuY29kZSA9PT0gJ0Fycm93RG93bicgKSB7XG5cdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0aW5jcmVtZW50KCB0aGlzLl9zdGVwICogdGhpcy5fYXJyb3dLZXlNdWx0aXBsaWVyKCBlICkgKiAtMSApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRjb25zdCBvbldoZWVsID0gZSA9PiB7XG5cdFx0XHRpZiAoIHRoaXMuX2lucHV0Rm9jdXNlZCApIHtcblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRpbmNyZW1lbnQoIHRoaXMuX3N0ZXAgKiB0aGlzLl9ub3JtYWxpemVNb3VzZVdoZWVsKCBlICkgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gVmVydGljYWwgZHJhZ1xuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0bGV0IHRlc3RpbmdGb3JWZXJ0aWNhbERyYWcgPSBmYWxzZSxcblx0XHRcdGluaXRDbGllbnRYLFxuXHRcdFx0aW5pdENsaWVudFksXG5cdFx0XHRwcmV2Q2xpZW50WSxcblx0XHRcdGluaXRWYWx1ZSxcblx0XHRcdGRyYWdEZWx0YTtcblxuXHRcdC8vIE9uY2UgdGhlIG1vdXNlIGlzIGRyYWdnZWQgbW9yZSB0aGFuIERSQUdfVEhSRVNIIHB4IG9uIGFueSBheGlzLCB3ZSBkZWNpZGVcblx0XHQvLyBvbiB0aGUgdXNlcidzIGludGVudDogaG9yaXpvbnRhbCBtZWFucyBoaWdobGlnaHQsIHZlcnRpY2FsIG1lYW5zIGRyYWcuXG5cdFx0Y29uc3QgRFJBR19USFJFU0ggPSA1O1xuXG5cdFx0Y29uc3Qgb25Nb3VzZURvd24gPSBlID0+IHtcblxuXHRcdFx0aW5pdENsaWVudFggPSBlLmNsaWVudFg7XG5cdFx0XHRpbml0Q2xpZW50WSA9IHByZXZDbGllbnRZID0gZS5jbGllbnRZO1xuXHRcdFx0dGVzdGluZ0ZvclZlcnRpY2FsRHJhZyA9IHRydWU7XG5cblx0XHRcdGluaXRWYWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRcdGRyYWdEZWx0YSA9IDA7XG5cblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUgKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG9uTW91c2VVcCApO1xuXG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uTW91c2VNb3ZlID0gZSA9PiB7XG5cblx0XHRcdGlmICggdGVzdGluZ0ZvclZlcnRpY2FsRHJhZyApIHtcblxuXHRcdFx0XHRjb25zdCBkeCA9IGUuY2xpZW50WCAtIGluaXRDbGllbnRYO1xuXHRcdFx0XHRjb25zdCBkeSA9IGUuY2xpZW50WSAtIGluaXRDbGllbnRZO1xuXG5cdFx0XHRcdGlmICggTWF0aC5hYnMoIGR5ICkgPiBEUkFHX1RIUkVTSCApIHtcblxuXHRcdFx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR0aGlzLiRpbnB1dC5ibHVyKCk7XG5cdFx0XHRcdFx0dGVzdGluZ0ZvclZlcnRpY2FsRHJhZyA9IGZhbHNlO1xuXHRcdFx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIHRydWUsICd2ZXJ0aWNhbCcgKTtcblxuXHRcdFx0XHR9IGVsc2UgaWYgKCBNYXRoLmFicyggZHggKSA+IERSQUdfVEhSRVNIICkge1xuXG5cdFx0XHRcdFx0b25Nb3VzZVVwKCk7XG5cblx0XHRcdFx0fVxuXG5cdFx0XHR9XG5cblx0XHRcdC8vIFRoaXMgaXNuJ3QgYW4gZWxzZSBzbyB0aGF0IHRoZSBmaXJzdCBtb3ZlIGNvdW50cyB0b3dhcmRzIGRyYWdEZWx0YVxuXHRcdFx0aWYgKCAhdGVzdGluZ0ZvclZlcnRpY2FsRHJhZyApIHtcblxuXHRcdFx0XHRjb25zdCBkeSA9IGUuY2xpZW50WSAtIHByZXZDbGllbnRZO1xuXG5cdFx0XHRcdGRyYWdEZWx0YSAtPSBkeSAqIHRoaXMuX3N0ZXAgKiB0aGlzLl9hcnJvd0tleU11bHRpcGxpZXIoIGUgKTtcblxuXHRcdFx0XHQvLyBDbGFtcCBkcmFnRGVsdGEgc28gd2UgZG9uJ3QgaGF2ZSAnZGVhZCBzcGFjZScgYWZ0ZXIgZHJhZ2dpbmcgcGFzdCBib3VuZHMuXG5cdFx0XHRcdC8vIFdlJ3JlIG9rYXkgd2l0aCB0aGUgZmFjdCB0aGF0IGJvdW5kcyBjYW4gYmUgdW5kZWZpbmVkIGhlcmUuXG5cdFx0XHRcdGlmICggaW5pdFZhbHVlICsgZHJhZ0RlbHRhID4gdGhpcy5fbWF4ICkge1xuXHRcdFx0XHRcdGRyYWdEZWx0YSA9IHRoaXMuX21heCAtIGluaXRWYWx1ZTtcblx0XHRcdFx0fSBlbHNlIGlmICggaW5pdFZhbHVlICsgZHJhZ0RlbHRhIDwgdGhpcy5fbWluICkge1xuXHRcdFx0XHRcdGRyYWdEZWx0YSA9IHRoaXMuX21pbiAtIGluaXRWYWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuX3NuYXBDbGFtcFNldFZhbHVlKCBpbml0VmFsdWUgKyBkcmFnRGVsdGEgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRwcmV2Q2xpZW50WSA9IGUuY2xpZW50WTtcblxuXHRcdH07XG5cblx0XHRjb25zdCBvbk1vdXNlVXAgPSAoKSA9PiB7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCBmYWxzZSwgJ3ZlcnRpY2FsJyApO1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlICk7XG5cdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNldXAnLCBvbk1vdXNlVXAgKTtcblx0XHR9O1xuXG5cdFx0Ly8gRm9jdXMgc3RhdGUgJiBvbkZpbmlzaENoYW5nZVxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0Y29uc3Qgb25Gb2N1cyA9ICgpID0+IHtcblx0XHRcdHRoaXMuX2lucHV0Rm9jdXNlZCA9IHRydWU7XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9uQmx1ciA9ICgpID0+IHtcblx0XHRcdHRoaXMuX2lucHV0Rm9jdXNlZCA9IGZhbHNlO1xuXHRcdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cdFx0XHR0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UoKTtcblx0XHR9O1xuXG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2lucHV0Jywgb25JbnB1dCApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgb25LZXlEb3duICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9ICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIG9uTW91c2VEb3duICk7XG5cdFx0dGhpcy4kaW5wdXQuYWRkRXZlbnRMaXN0ZW5lciggJ2ZvY3VzJywgb25Gb2N1cyApO1xuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgb25CbHVyICk7XG5cblx0fVxuXG5cdF9pbml0U2xpZGVyKCkge1xuXG5cdFx0dGhpcy5faGFzU2xpZGVyID0gdHJ1ZTtcblxuXHRcdC8vIEJ1aWxkIERPTVxuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0dGhpcy4kc2xpZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRzbGlkZXIuY2xhc3NMaXN0LmFkZCggJ3NsaWRlcicgKTtcblxuXHRcdHRoaXMuJGZpbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnZGl2JyApO1xuXHRcdHRoaXMuJGZpbGwuY2xhc3NMaXN0LmFkZCggJ2ZpbGwnICk7XG5cblx0XHR0aGlzLiRzbGlkZXIuYXBwZW5kQ2hpbGQoIHRoaXMuJGZpbGwgKTtcblx0XHR0aGlzLiR3aWRnZXQuaW5zZXJ0QmVmb3JlKCB0aGlzLiRzbGlkZXIsIHRoaXMuJGlucHV0ICk7XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2hhc1NsaWRlcicgKTtcblxuXHRcdC8vIE1hcCBjbGllbnRYIHRvIHZhbHVlXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0XHRjb25zdCBtYXAgPSAoIHYsIGEsIGIsIGMsIGQgKSA9PiB7XG5cdFx0XHRyZXR1cm4gKCB2IC0gYSApIC8gKCBiIC0gYSApICogKCBkIC0gYyApICsgYztcblx0XHR9O1xuXG5cdFx0Y29uc3Qgc2V0VmFsdWVGcm9tWCA9IGNsaWVudFggPT4ge1xuXHRcdFx0Y29uc3QgcmVjdCA9IHRoaXMuJHNsaWRlci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblx0XHRcdGxldCB2YWx1ZSA9IG1hcCggY2xpZW50WCwgcmVjdC5sZWZ0LCByZWN0LnJpZ2h0LCB0aGlzLl9taW4sIHRoaXMuX21heCApO1xuXHRcdFx0dGhpcy5fc25hcENsYW1wU2V0VmFsdWUoIHZhbHVlICk7XG5cdFx0fTtcblxuXHRcdC8vIE1vdXNlIGRyYWdcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdGNvbnN0IG1vdXNlRG93biA9IGUgPT4ge1xuXHRcdFx0dGhpcy5fc2V0RHJhZ2dpbmdTdHlsZSggdHJ1ZSApO1xuXHRcdFx0c2V0VmFsdWVGcm9tWCggZS5jbGllbnRYICk7XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbW92ZScsIG1vdXNlTW92ZSApO1xuXHRcdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZXVwJywgbW91c2VVcCApO1xuXHRcdH07XG5cblx0XHRjb25zdCBtb3VzZU1vdmUgPSBlID0+IHtcblx0XHRcdHNldFZhbHVlRnJvbVgoIGUuY2xpZW50WCApO1xuXHRcdH07XG5cblx0XHRjb25zdCBtb3VzZVVwID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCBmYWxzZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZW1vdmUnLCBtb3VzZU1vdmUgKTtcblx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2V1cCcsIG1vdXNlVXAgKTtcblx0XHR9O1xuXG5cdFx0Ly8gVG91Y2ggZHJhZ1xuXHRcdC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cdFx0bGV0IHRlc3RpbmdGb3JTY3JvbGwgPSBmYWxzZSwgcHJldkNsaWVudFgsIHByZXZDbGllbnRZO1xuXG5cdFx0Y29uc3QgYmVnaW5Ub3VjaERyYWcgPSBlID0+IHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdHRoaXMuX3NldERyYWdnaW5nU3R5bGUoIHRydWUgKTtcblx0XHRcdHNldFZhbHVlRnJvbVgoIGUudG91Y2hlc1sgMCBdLmNsaWVudFggKTtcblx0XHRcdHRlc3RpbmdGb3JTY3JvbGwgPSBmYWxzZTtcblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Ub3VjaFN0YXJ0ID0gZSA9PiB7XG5cblx0XHRcdGlmICggZS50b3VjaGVzLmxlbmd0aCA+IDEgKSByZXR1cm47XG5cblx0XHRcdC8vIElmIHdlJ3JlIGluIGEgc2Nyb2xsYWJsZSBjb250YWluZXIsIHdlIHNob3VsZCB3YWl0IGZvciB0aGUgZmlyc3Rcblx0XHRcdC8vIHRvdWNobW92ZSB0byBzZWUgaWYgdGhlIHVzZXIgaXMgdHJ5aW5nIHRvIHNsaWRlIG9yIHNjcm9sbC5cblx0XHRcdGlmICggdGhpcy5faGFzU2Nyb2xsQmFyICkge1xuXG5cdFx0XHRcdHByZXZDbGllbnRYID0gZS50b3VjaGVzWyAwIF0uY2xpZW50WDtcblx0XHRcdFx0cHJldkNsaWVudFkgPSBlLnRvdWNoZXNbIDAgXS5jbGllbnRZO1xuXHRcdFx0XHR0ZXN0aW5nRm9yU2Nyb2xsID0gdHJ1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBPdGhlcndpc2UsIHdlIGNhbiBzZXQgdGhlIHZhbHVlIHN0cmFpZ2h0IGF3YXkgb24gdG91Y2hzdGFydC5cblx0XHRcdFx0YmVnaW5Ub3VjaERyYWcoIGUgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlLCB7IHBhc3NpdmU6IGZhbHNlIH0gKTtcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hlbmQnLCBvblRvdWNoRW5kICk7XG5cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb25Ub3VjaE1vdmUgPSBlID0+IHtcblxuXHRcdFx0aWYgKCB0ZXN0aW5nRm9yU2Nyb2xsICkge1xuXG5cdFx0XHRcdGNvbnN0IGR4ID0gZS50b3VjaGVzWyAwIF0uY2xpZW50WCAtIHByZXZDbGllbnRYO1xuXHRcdFx0XHRjb25zdCBkeSA9IGUudG91Y2hlc1sgMCBdLmNsaWVudFkgLSBwcmV2Q2xpZW50WTtcblxuXHRcdFx0XHRpZiAoIE1hdGguYWJzKCBkeCApID4gTWF0aC5hYnMoIGR5ICkgKSB7XG5cblx0XHRcdFx0XHQvLyBXZSBtb3ZlZCBob3Jpem9udGFsbHksIHNldCB0aGUgdmFsdWUgYW5kIHN0b3AgY2hlY2tpbmcuXG5cdFx0XHRcdFx0YmVnaW5Ub3VjaERyYWcoIGUgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0Ly8gVGhpcyB3YXMsIGluIGZhY3QsIGFuIGF0dGVtcHQgdG8gc2Nyb2xsLiBBYm9ydC5cblx0XHRcdFx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlICk7XG5cdFx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIG9uVG91Y2hFbmQgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRzZXRWYWx1ZUZyb21YKCBlLnRvdWNoZXNbIDAgXS5jbGllbnRYICk7XG5cblx0XHRcdH1cblxuXHRcdH07XG5cblx0XHRjb25zdCBvblRvdWNoRW5kID0gKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0XHR0aGlzLl9zZXREcmFnZ2luZ1N0eWxlKCBmYWxzZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSApO1xuXHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaGVuZCcsIG9uVG91Y2hFbmQgKTtcblx0XHR9O1xuXG5cdFx0Ly8gTW91c2Ugd2hlZWxcblx0XHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHRcdC8vIFdlIGhhdmUgdG8gdXNlIGEgZGVib3VuY2VkIGZ1bmN0aW9uIHRvIGNhbGwgb25GaW5pc2hDaGFuZ2UgYmVjYXVzZVxuXHRcdC8vIHRoZXJlJ3Mgbm8gd2F5IHRvIHRlbGwgd2hlbiB0aGUgdXNlciBpcyBcImRvbmVcIiBtb3VzZS13aGVlbGluZy5cblx0XHRjb25zdCBjYWxsT25GaW5pc2hDaGFuZ2UgPSB0aGlzLl9jYWxsT25GaW5pc2hDaGFuZ2UuYmluZCggdGhpcyApO1xuXHRcdGNvbnN0IFdIRUVMX0RFQk9VTkNFX1RJTUUgPSA0MDA7XG5cdFx0bGV0IHdoZWVsRmluaXNoQ2hhbmdlVGltZW91dDtcblxuXHRcdGNvbnN0IG9uV2hlZWwgPSBlID0+IHtcblxuXHRcdFx0Ly8gaWdub3JlIHZlcnRpY2FsIHdoZWVscyBpZiB0aGVyZSdzIGEgc2Nyb2xsYmFyXG5cdFx0XHRjb25zdCBpc1ZlcnRpY2FsID0gTWF0aC5hYnMoIGUuZGVsdGFYICkgPCBNYXRoLmFicyggZS5kZWx0YVkgKTtcblx0XHRcdGlmICggaXNWZXJ0aWNhbCAmJiB0aGlzLl9oYXNTY3JvbGxCYXIgKSByZXR1cm47XG5cblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblxuXHRcdFx0Ly8gc2V0IHZhbHVlXG5cdFx0XHRjb25zdCBkZWx0YSA9IHRoaXMuX25vcm1hbGl6ZU1vdXNlV2hlZWwoIGUgKSAqIHRoaXMuX3N0ZXA7XG5cdFx0XHR0aGlzLl9zbmFwQ2xhbXBTZXRWYWx1ZSggdGhpcy5nZXRWYWx1ZSgpICsgZGVsdGEgKTtcblxuXHRcdFx0Ly8gZm9yY2UgdGhlIGlucHV0IHRvIHVwZGF0ZURpc3BsYXkgd2hlbiBpdCdzIGZvY3VzZWRcblx0XHRcdHRoaXMuJGlucHV0LnZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuXG5cdFx0XHQvLyBkZWJvdW5jZSBvbkZpbmlzaENoYW5nZVxuXHRcdFx0Y2xlYXJUaW1lb3V0KCB3aGVlbEZpbmlzaENoYW5nZVRpbWVvdXQgKTtcblx0XHRcdHdoZWVsRmluaXNoQ2hhbmdlVGltZW91dCA9IHNldFRpbWVvdXQoIGNhbGxPbkZpbmlzaENoYW5nZSwgV0hFRUxfREVCT1VOQ0VfVElNRSApO1xuXG5cdFx0fTtcblxuXHRcdHRoaXMuJHNsaWRlci5hZGRFdmVudExpc3RlbmVyKCAnbW91c2Vkb3duJywgbW91c2VEb3duICk7XG5cdFx0dGhpcy4kc2xpZGVyLmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCB7IHBhc3NpdmU6IGZhbHNlIH0gKTtcblx0XHR0aGlzLiRzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lciggJ3doZWVsJywgb25XaGVlbCwgeyBwYXNzaXZlOiBmYWxzZSB9ICk7XG5cblx0fVxuXG5cdF9zZXREcmFnZ2luZ1N0eWxlKCBhY3RpdmUsIGF4aXMgPSAnaG9yaXpvbnRhbCcgKSB7XG5cdFx0aWYgKCB0aGlzLiRzbGlkZXIgKSB7XG5cdFx0XHR0aGlzLiRzbGlkZXIuY2xhc3NMaXN0LnRvZ2dsZSggJ2FjdGl2ZScsIGFjdGl2ZSApO1xuXHRcdH1cblx0XHRkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC50b2dnbGUoICdsaWwtZ3VpLWRyYWdnaW5nJywgYWN0aXZlICk7XG5cdFx0ZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QudG9nZ2xlKCBgbGlsLWd1aS0ke2F4aXN9YCwgYWN0aXZlICk7XG5cdH1cblxuXHRfZ2V0SW1wbGljaXRTdGVwKCkge1xuXG5cdFx0aWYgKCB0aGlzLl9oYXNNaW4gJiYgdGhpcy5faGFzTWF4ICkge1xuXHRcdFx0cmV0dXJuICggdGhpcy5fbWF4IC0gdGhpcy5fbWluICkgLyAxMDAwO1xuXHRcdH1cblxuXHRcdHJldHVybiAwLjE7XG5cblx0fVxuXG5cdF9vblVwZGF0ZU1pbk1heCgpIHtcblxuXHRcdGlmICggIXRoaXMuX2hhc1NsaWRlciAmJiB0aGlzLl9oYXNNaW4gJiYgdGhpcy5faGFzTWF4ICkge1xuXG5cdFx0XHQvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCB0aW1lIHdlJ3JlIGhlYXJpbmcgYWJvdXQgbWluIGFuZCBtYXhcblx0XHRcdC8vIGFuZCB3ZSBoYXZlbid0IGV4cGxpY2l0bHkgc3RhdGVkIHdoYXQgb3VyIHN0ZXAgaXMsIGxldCdzXG5cdFx0XHQvLyB1cGRhdGUgdGhhdCB0b28uXG5cdFx0XHRpZiAoICF0aGlzLl9zdGVwRXhwbGljaXQgKSB7XG5cdFx0XHRcdHRoaXMuc3RlcCggdGhpcy5fZ2V0SW1wbGljaXRTdGVwKCksIGZhbHNlICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2luaXRTbGlkZXIoKTtcblx0XHRcdHRoaXMudXBkYXRlRGlzcGxheSgpO1xuXG5cdFx0fVxuXG5cdH1cblxuXHRfbm9ybWFsaXplTW91c2VXaGVlbCggZSApIHtcblxuXHRcdGxldCB7IGRlbHRhWCwgZGVsdGFZIH0gPSBlO1xuXG5cdFx0Ly8gU2FmYXJpIGFuZCBDaHJvbWUgcmVwb3J0IHdlaXJkIG5vbi1pbnRlZ3JhbCB2YWx1ZXMgZm9yIGEgbm90Y2hlZCB3aGVlbCxcblx0XHQvLyBidXQgc3RpbGwgZXhwb3NlIGFjdHVhbCBsaW5lcyBzY3JvbGxlZCB2aWEgd2hlZWxEZWx0YS4gTm90Y2hlZCB3aGVlbHNcblx0XHQvLyBzaG91bGQgYmVoYXZlIHRoZSBzYW1lIHdheSBhcyBhcnJvdyBrZXlzLlxuXHRcdGlmICggTWF0aC5mbG9vciggZS5kZWx0YVkgKSAhPT0gZS5kZWx0YVkgJiYgZS53aGVlbERlbHRhICkge1xuXHRcdFx0ZGVsdGFYID0gMDtcblx0XHRcdGRlbHRhWSA9IC1lLndoZWVsRGVsdGEgLyAxMjA7XG5cdFx0XHRkZWx0YVkgKj0gdGhpcy5fc3RlcEV4cGxpY2l0ID8gMSA6IDEwO1xuXHRcdH1cblxuXHRcdGNvbnN0IHdoZWVsID0gZGVsdGFYICsgLWRlbHRhWTtcblxuXHRcdHJldHVybiB3aGVlbDtcblxuXHR9XG5cblx0X2Fycm93S2V5TXVsdGlwbGllciggZSApIHtcblxuXHRcdGxldCBtdWx0ID0gdGhpcy5fc3RlcEV4cGxpY2l0ID8gMSA6IDEwO1xuXG5cdFx0aWYgKCBlLnNoaWZ0S2V5ICkge1xuXHRcdFx0bXVsdCAqPSAxMDtcblx0XHR9IGVsc2UgaWYgKCBlLmFsdEtleSApIHtcblx0XHRcdG11bHQgLz0gMTA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG11bHQ7XG5cblx0fVxuXG5cdF9zbmFwKCB2YWx1ZSApIHtcblxuXHRcdC8vIE1ha2UgdGhlIHN0ZXBzIFwic3RhcnRcIiBhdCBtaW4gb3IgbWF4LlxuXHRcdGxldCBvZmZzZXQgPSAwO1xuXHRcdGlmICggdGhpcy5faGFzTWluICkge1xuXHRcdFx0b2Zmc2V0ID0gdGhpcy5fbWluO1xuXHRcdH0gZWxzZSBpZiAoIHRoaXMuX2hhc01heCApIHtcblx0XHRcdG9mZnNldCA9IHRoaXMuX21heDtcblx0XHR9XG5cblx0XHR2YWx1ZSAtPSBvZmZzZXQ7XG5cblx0XHR2YWx1ZSA9IE1hdGgucm91bmQoIHZhbHVlIC8gdGhpcy5fc3RlcCApICogdGhpcy5fc3RlcDtcblxuXHRcdHZhbHVlICs9IG9mZnNldDtcblxuXHRcdC8vIFVzZWQgdG8gcHJldmVudCBcImZseWF3YXlcIiBkZWNpbWFscyBsaWtlIDEuMDAwMDAwMDAwMDAwMDFcblx0XHR2YWx1ZSA9IHBhcnNlRmxvYXQoIHZhbHVlLnRvUHJlY2lzaW9uKCAxNSApICk7XG5cblx0XHRyZXR1cm4gdmFsdWU7XG5cblx0fVxuXG5cdF9jbGFtcCggdmFsdWUgKSB7XG5cdFx0Ly8gZWl0aGVyIGNvbmRpdGlvbiBpcyBmYWxzZSBpZiBtaW4gb3IgbWF4IGlzIHVuZGVmaW5lZFxuXHRcdGlmICggdmFsdWUgPCB0aGlzLl9taW4gKSB2YWx1ZSA9IHRoaXMuX21pbjtcblx0XHRpZiAoIHZhbHVlID4gdGhpcy5fbWF4ICkgdmFsdWUgPSB0aGlzLl9tYXg7XG5cdFx0cmV0dXJuIHZhbHVlO1xuXHR9XG5cblx0X3NuYXBDbGFtcFNldFZhbHVlKCB2YWx1ZSApIHtcblx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLl9jbGFtcCggdGhpcy5fc25hcCggdmFsdWUgKSApICk7XG5cdH1cblxuXHRnZXQgX2hhc1Njcm9sbEJhcigpIHtcblx0XHRjb25zdCByb290ID0gdGhpcy5wYXJlbnQucm9vdC4kY2hpbGRyZW47XG5cdFx0cmV0dXJuIHJvb3Quc2Nyb2xsSGVpZ2h0ID4gcm9vdC5jbGllbnRIZWlnaHQ7XG5cdH1cblxuXHRnZXQgX2hhc01pbigpIHtcblx0XHRyZXR1cm4gdGhpcy5fbWluICE9PSB1bmRlZmluZWQ7XG5cdH1cblxuXHRnZXQgX2hhc01heCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fbWF4ICE9PSB1bmRlZmluZWQ7XG5cdH1cblxufVxuXG5jbGFzcyBPcHRpb25Db250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSwgb3B0aW9ucyApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdvcHRpb24nICk7XG5cblx0XHR0aGlzLiRzZWxlY3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCAnc2VsZWN0JyApO1xuXHRcdHRoaXMuJHNlbGVjdC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHR0aGlzLiRkaXNwbGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0XHR0aGlzLiRkaXNwbGF5LmNsYXNzTGlzdC5hZGQoICdkaXNwbGF5JyApO1xuXG5cdFx0dGhpcy4kc2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoICdjaGFuZ2UnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLl92YWx1ZXNbIHRoaXMuJHNlbGVjdC5zZWxlY3RlZEluZGV4IF0gKTtcblx0XHRcdHRoaXMuX2NhbGxPbkZpbmlzaENoYW5nZSgpO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCAnZm9jdXMnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLiRkaXNwbGF5LmNsYXNzTGlzdC5hZGQoICdmb2N1cycgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiRzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lciggJ2JsdXInLCAoKSA9PiB7XG5cdFx0XHR0aGlzLiRkaXNwbGF5LmNsYXNzTGlzdC5yZW1vdmUoICdmb2N1cycgKTtcblx0XHR9ICk7XG5cblx0XHR0aGlzLiR3aWRnZXQuYXBwZW5kQ2hpbGQoIHRoaXMuJHNlbGVjdCApO1xuXHRcdHRoaXMuJHdpZGdldC5hcHBlbmRDaGlsZCggdGhpcy4kZGlzcGxheSApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJHNlbGVjdDtcblxuXHRcdHRoaXMub3B0aW9ucyggb3B0aW9ucyApO1xuXG5cdH1cblxuXHRvcHRpb25zKCBvcHRpb25zICkge1xuXG5cdFx0dGhpcy5fdmFsdWVzID0gQXJyYXkuaXNBcnJheSggb3B0aW9ucyApID8gb3B0aW9ucyA6IE9iamVjdC52YWx1ZXMoIG9wdGlvbnMgKTtcblx0XHR0aGlzLl9uYW1lcyA9IEFycmF5LmlzQXJyYXkoIG9wdGlvbnMgKSA/IG9wdGlvbnMgOiBPYmplY3Qua2V5cyggb3B0aW9ucyApO1xuXG5cdFx0dGhpcy4kc2VsZWN0LnJlcGxhY2VDaGlsZHJlbigpO1xuXG5cdFx0dGhpcy5fbmFtZXMuZm9yRWFjaCggbmFtZSA9PiB7XG5cdFx0XHRjb25zdCAkb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggJ29wdGlvbicgKTtcblx0XHRcdCRvcHRpb24udGV4dENvbnRlbnQgPSBuYW1lO1xuXHRcdFx0dGhpcy4kc2VsZWN0LmFwcGVuZENoaWxkKCAkb3B0aW9uICk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0dXBkYXRlRGlzcGxheSgpIHtcblx0XHRjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0VmFsdWUoKTtcblx0XHRjb25zdCBpbmRleCA9IHRoaXMuX3ZhbHVlcy5pbmRleE9mKCB2YWx1ZSApO1xuXHRcdHRoaXMuJHNlbGVjdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cdFx0dGhpcy4kZGlzcGxheS50ZXh0Q29udGVudCA9IGluZGV4ID09PSAtMSA/IHZhbHVlIDogdGhpcy5fbmFtZXNbIGluZGV4IF07XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG5jbGFzcyBTdHJpbmdDb250cm9sbGVyIGV4dGVuZHMgQ29udHJvbGxlciB7XG5cblx0Y29uc3RydWN0b3IoIHBhcmVudCwgb2JqZWN0LCBwcm9wZXJ0eSApIHtcblxuXHRcdHN1cGVyKCBwYXJlbnQsIG9iamVjdCwgcHJvcGVydHksICdzdHJpbmcnICk7XG5cblx0XHR0aGlzLiRpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdpbnB1dCcgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ3RleHQnICk7XG5cdFx0dGhpcy4kaW5wdXQuc2V0QXR0cmlidXRlKCAnc3BlbGxjaGVjaycsICdmYWxzZScgKTtcblx0XHR0aGlzLiRpbnB1dC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsbGVkYnknLCB0aGlzLiRuYW1lLmlkICk7XG5cblx0XHR0aGlzLiRpbnB1dC5hZGRFdmVudExpc3RlbmVyKCAnaW5wdXQnLCAoKSA9PiB7XG5cdFx0XHR0aGlzLnNldFZhbHVlKCB0aGlzLiRpbnB1dC52YWx1ZSApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgZSA9PiB7XG5cdFx0XHRpZiAoIGUuY29kZSA9PT0gJ0VudGVyJyApIHtcblx0XHRcdFx0dGhpcy4kaW5wdXQuYmx1cigpO1xuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdHRoaXMuJGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoICdibHVyJywgKCkgPT4ge1xuXHRcdFx0dGhpcy5fY2FsbE9uRmluaXNoQ2hhbmdlKCk7XG5cdFx0fSApO1xuXG5cdFx0dGhpcy4kd2lkZ2V0LmFwcGVuZENoaWxkKCB0aGlzLiRpbnB1dCApO1xuXG5cdFx0dGhpcy4kZGlzYWJsZSA9IHRoaXMuJGlucHV0O1xuXG5cdFx0dGhpcy51cGRhdGVEaXNwbGF5KCk7XG5cblx0fVxuXG5cdHVwZGF0ZURpc3BsYXkoKSB7XG5cdFx0dGhpcy4kaW5wdXQudmFsdWUgPSB0aGlzLmdldFZhbHVlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxufVxuXG52YXIgc3R5bGVzaGVldCA9IGAubGlsLWd1aSB7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseSk7XG4gIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplKTtcbiAgbGluZS1oZWlnaHQ6IDE7XG4gIGZvbnQtd2VpZ2h0OiBub3JtYWw7XG4gIGZvbnQtc3R5bGU6IG5vcm1hbDtcbiAgdGV4dC1hbGlnbjogbGVmdDtcbiAgY29sb3I6IHZhcigtLXRleHQtY29sb3IpO1xuICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgLXdlYmtpdC11c2VyLXNlbGVjdDogbm9uZTtcbiAgdG91Y2gtYWN0aW9uOiBtYW5pcHVsYXRpb247XG4gIC0tYmFja2dyb3VuZC1jb2xvcjogIzFmMWYxZjtcbiAgLS10ZXh0LWNvbG9yOiAjZWJlYmViO1xuICAtLXRpdGxlLWJhY2tncm91bmQtY29sb3I6ICMxMTExMTE7XG4gIC0tdGl0bGUtdGV4dC1jb2xvcjogI2ViZWJlYjtcbiAgLS13aWRnZXQtY29sb3I6ICM0MjQyNDI7XG4gIC0taG92ZXItY29sb3I6ICM0ZjRmNGY7XG4gIC0tZm9jdXMtY29sb3I6ICM1OTU5NTk7XG4gIC0tbnVtYmVyLWNvbG9yOiAjMmNjOWZmO1xuICAtLXN0cmluZy1jb2xvcjogI2EyZGIzYztcbiAgLS1mb250LXNpemU6IDExcHg7XG4gIC0taW5wdXQtZm9udC1zaXplOiAxMXB4O1xuICAtLWZvbnQtZmFtaWx5OiAtYXBwbGUtc3lzdGVtLCBCbGlua01hY1N5c3RlbUZvbnQsIFwiU2Vnb2UgVUlcIiwgUm9ib3RvLCBBcmlhbCwgc2Fucy1zZXJpZjtcbiAgLS1mb250LWZhbWlseS1tb25vOiBNZW5sbywgTW9uYWNvLCBDb25zb2xhcywgXCJEcm9pZCBTYW5zIE1vbm9cIiwgbW9ub3NwYWNlO1xuICAtLXBhZGRpbmc6IDRweDtcbiAgLS1zcGFjaW5nOiA0cHg7XG4gIC0td2lkZ2V0LWhlaWdodDogMjBweDtcbiAgLS10aXRsZS1oZWlnaHQ6IGNhbGModmFyKC0td2lkZ2V0LWhlaWdodCkgKyB2YXIoLS1zcGFjaW5nKSAqIDEuMjUpO1xuICAtLW5hbWUtd2lkdGg6IDQ1JTtcbiAgLS1zbGlkZXIta25vYi13aWR0aDogMnB4O1xuICAtLXNsaWRlci1pbnB1dC13aWR0aDogMjclO1xuICAtLWNvbG9yLWlucHV0LXdpZHRoOiAyNyU7XG4gIC0tc2xpZGVyLWlucHV0LW1pbi13aWR0aDogNDVweDtcbiAgLS1jb2xvci1pbnB1dC1taW4td2lkdGg6IDQ1cHg7XG4gIC0tZm9sZGVyLWluZGVudDogN3B4O1xuICAtLXdpZGdldC1wYWRkaW5nOiAwIDAgMCAzcHg7XG4gIC0td2lkZ2V0LWJvcmRlci1yYWRpdXM6IDJweDtcbiAgLS1jaGVja2JveC1zaXplOiBjYWxjKDAuNzUgKiB2YXIoLS13aWRnZXQtaGVpZ2h0KSk7XG4gIC0tc2Nyb2xsYmFyLXdpZHRoOiA1cHg7XG59XG4ubGlsLWd1aSwgLmxpbC1ndWkgKiB7XG4gIGJveC1zaXppbmc6IGJvcmRlci1ib3g7XG4gIG1hcmdpbjogMDtcbiAgcGFkZGluZzogMDtcbn1cbi5saWwtZ3VpLnJvb3Qge1xuICB3aWR0aDogdmFyKC0td2lkdGgsIDI0NXB4KTtcbiAgZGlzcGxheTogZmxleDtcbiAgZmxleC1kaXJlY3Rpb246IGNvbHVtbjtcbiAgYmFja2dyb3VuZDogdmFyKC0tYmFja2dyb3VuZC1jb2xvcik7XG59XG4ubGlsLWd1aS5yb290ID4gLnRpdGxlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tdGl0bGUtYmFja2dyb3VuZC1jb2xvcik7XG4gIGNvbG9yOiB2YXIoLS10aXRsZS10ZXh0LWNvbG9yKTtcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW4ge1xuICBvdmVyZmxvdy14OiBoaWRkZW47XG4gIG92ZXJmbG93LXk6IGF1dG87XG59XG4ubGlsLWd1aS5yb290ID4gLmNoaWxkcmVuOjotd2Via2l0LXNjcm9sbGJhciB7XG4gIHdpZHRoOiB2YXIoLS1zY3JvbGxiYXItd2lkdGgpO1xuICBoZWlnaHQ6IHZhcigtLXNjcm9sbGJhci13aWR0aCk7XG4gIGJhY2tncm91bmQ6IHZhcigtLWJhY2tncm91bmQtY29sb3IpO1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbjo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS1zY3JvbGxiYXItd2lkdGgpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS1mb2N1cy1jb2xvcik7XG59XG5AbWVkaWEgKHBvaW50ZXI6IGNvYXJzZSkge1xuICAubGlsLWd1aS5hbGxvdy10b3VjaC1zdHlsZXMsIC5saWwtZ3VpLmFsbG93LXRvdWNoLXN0eWxlcyAubGlsLWd1aSB7XG4gICAgLS13aWRnZXQtaGVpZ2h0OiAyOHB4O1xuICAgIC0tcGFkZGluZzogNnB4O1xuICAgIC0tc3BhY2luZzogNnB4O1xuICAgIC0tZm9udC1zaXplOiAxM3B4O1xuICAgIC0taW5wdXQtZm9udC1zaXplOiAxNnB4O1xuICAgIC0tZm9sZGVyLWluZGVudDogMTBweDtcbiAgICAtLXNjcm9sbGJhci13aWR0aDogN3B4O1xuICAgIC0tc2xpZGVyLWlucHV0LW1pbi13aWR0aDogNTBweDtcbiAgICAtLWNvbG9yLWlucHV0LW1pbi13aWR0aDogNjVweDtcbiAgfVxufVxuLmxpbC1ndWkuZm9yY2UtdG91Y2gtc3R5bGVzLCAubGlsLWd1aS5mb3JjZS10b3VjaC1zdHlsZXMgLmxpbC1ndWkge1xuICAtLXdpZGdldC1oZWlnaHQ6IDI4cHg7XG4gIC0tcGFkZGluZzogNnB4O1xuICAtLXNwYWNpbmc6IDZweDtcbiAgLS1mb250LXNpemU6IDEzcHg7XG4gIC0taW5wdXQtZm9udC1zaXplOiAxNnB4O1xuICAtLWZvbGRlci1pbmRlbnQ6IDEwcHg7XG4gIC0tc2Nyb2xsYmFyLXdpZHRoOiA3cHg7XG4gIC0tc2xpZGVyLWlucHV0LW1pbi13aWR0aDogNTBweDtcbiAgLS1jb2xvci1pbnB1dC1taW4td2lkdGg6IDY1cHg7XG59XG4ubGlsLWd1aS5hdXRvUGxhY2Uge1xuICBtYXgtaGVpZ2h0OiAxMDAlO1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgcmlnaHQ6IDE1cHg7XG4gIHotaW5kZXg6IDEwMDE7XG59XG5cbi5saWwtZ3VpIC5jb250cm9sbGVyIHtcbiAgZGlzcGxheTogZmxleDtcbiAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgcGFkZGluZzogMCB2YXIoLS1wYWRkaW5nKTtcbiAgbWFyZ2luOiB2YXIoLS1zcGFjaW5nKSAwO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuZGlzYWJsZWQge1xuICBvcGFjaXR5OiAwLjU7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5kaXNhYmxlZCwgLmxpbC1ndWkgLmNvbnRyb2xsZXIuZGlzYWJsZWQgKiB7XG4gIHBvaW50ZXItZXZlbnRzOiBub25lICFpbXBvcnRhbnQ7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlciA+IC5uYW1lIHtcbiAgbWluLXdpZHRoOiB2YXIoLS1uYW1lLXdpZHRoKTtcbiAgZmxleC1zaHJpbms6IDA7XG4gIHdoaXRlLXNwYWNlOiBwcmU7XG4gIHBhZGRpbmctcmlnaHQ6IHZhcigtLXNwYWNpbmcpO1xuICBsaW5lLWhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlciAud2lkZ2V0IHtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICB3aWR0aDogMTAwJTtcbiAgbWluLWhlaWdodDogdmFyKC0td2lkZ2V0LWhlaWdodCk7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5zdHJpbmcgaW5wdXQge1xuICBjb2xvcjogdmFyKC0tc3RyaW5nLWNvbG9yKTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmJvb2xlYW4ge1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5jb2xvciAuZGlzcGxheSB7XG4gIHdpZHRoOiAxMDAlO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBib3JkZXItcmFkaXVzOiB2YXIoLS13aWRnZXQtYm9yZGVyLXJhZGl1cyk7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyLmNvbG9yIC5kaXNwbGF5OmhvdmVyOmJlZm9yZSB7XG4gICAgY29udGVudDogXCIgXCI7XG4gICAgZGlzcGxheTogYmxvY2s7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgICBib3JkZXI6IDFweCBzb2xpZCAjZmZmOTtcbiAgICB0b3A6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgYm90dG9tOiAwO1xuICAgIGxlZnQ6IDA7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLmNvbG9yIGlucHV0W3R5cGU9Y29sb3JdIHtcbiAgb3BhY2l0eTogMDtcbiAgd2lkdGg6IDEwMCU7XG4gIGhlaWdodDogMTAwJTtcbiAgY3Vyc29yOiBwb2ludGVyO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIuY29sb3IgaW5wdXRbdHlwZT10ZXh0XSB7XG4gIG1hcmdpbi1sZWZ0OiB2YXIoLS1zcGFjaW5nKTtcbiAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5LW1vbm8pO1xuICBtaW4td2lkdGg6IHZhcigtLWNvbG9yLWlucHV0LW1pbi13aWR0aCk7XG4gIHdpZHRoOiB2YXIoLS1jb2xvci1pbnB1dC13aWR0aCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIHNlbGVjdCB7XG4gIG9wYWNpdHk6IDA7XG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgd2lkdGg6IDEwMCU7XG4gIG1heC13aWR0aDogMTAwJTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAuZGlzcGxheSB7XG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgbGluZS1oZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBtYXgtd2lkdGg6IDEwMCU7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIHdvcmQtYnJlYWs6IGJyZWFrLWFsbDtcbiAgcGFkZGluZy1sZWZ0OiAwLjU1ZW07XG4gIHBhZGRpbmctcmlnaHQ6IDEuNzVlbTtcbiAgYmFja2dyb3VuZDogdmFyKC0td2lkZ2V0LWNvbG9yKTtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAuZGlzcGxheS5mb2N1cyB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlci5vcHRpb24gLmRpc3BsYXkuYWN0aXZlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIC5kaXNwbGF5OmFmdGVyIHtcbiAgZm9udC1mYW1pbHk6IFwibGlsLWd1aVwiO1xuICBjb250ZW50OiBcIuKGlVwiO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMDtcbiAgcmlnaHQ6IDA7XG4gIGJvdHRvbTogMDtcbiAgcGFkZGluZy1yaWdodDogMC4zNzVlbTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAud2lkZ2V0LFxuLmxpbC1ndWkgLmNvbnRyb2xsZXIub3B0aW9uIHNlbGVjdCB7XG4gIGN1cnNvcjogcG9pbnRlcjtcbn1cbkBtZWRpYSAoaG92ZXI6IGhvdmVyKSB7XG4gIC5saWwtZ3VpIC5jb250cm9sbGVyLm9wdGlvbiAud2lkZ2V0OmhvdmVyIC5kaXNwbGF5IHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciBpbnB1dCB7XG4gIGNvbG9yOiB2YXIoLS1udW1iZXItY29sb3IpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyLmhhc1NsaWRlciBpbnB1dCB7XG4gIG1hcmdpbi1sZWZ0OiB2YXIoLS1zcGFjaW5nKTtcbiAgd2lkdGg6IHZhcigtLXNsaWRlci1pbnB1dC13aWR0aCk7XG4gIG1pbi13aWR0aDogdmFyKC0tc2xpZGVyLWlucHV0LW1pbi13aWR0aCk7XG4gIGZsZXgtc2hyaW5rOiAwO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIC5zbGlkZXIge1xuICB3aWR0aDogMTAwJTtcbiAgaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgYmFja2dyb3VuZDogdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICBwYWRkaW5nLXJpZ2h0OiB2YXIoLS1zbGlkZXIta25vYi13aWR0aCk7XG4gIG92ZXJmbG93OiBoaWRkZW47XG4gIGN1cnNvcjogZXctcmVzaXplO1xuICB0b3VjaC1hY3Rpb246IHBhbi15O1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIC5zbGlkZXI6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIC5zbGlkZXIuYWN0aXZlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xufVxuLmxpbC1ndWkgLmNvbnRyb2xsZXIubnVtYmVyIC5zbGlkZXIuYWN0aXZlIC5maWxsIHtcbiAgb3BhY2l0eTogMC45NTtcbn1cbi5saWwtZ3VpIC5jb250cm9sbGVyLm51bWJlciAuZmlsbCB7XG4gIGhlaWdodDogMTAwJTtcbiAgYm9yZGVyLXJpZ2h0OiB2YXIoLS1zbGlkZXIta25vYi13aWR0aCkgc29saWQgdmFyKC0tbnVtYmVyLWNvbG9yKTtcbiAgYm94LXNpemluZzogY29udGVudC1ib3g7XG59XG5cbi5saWwtZ3VpLWRyYWdnaW5nIC5saWwtZ3VpIHtcbiAgLS1ob3Zlci1jb2xvcjogdmFyKC0td2lkZ2V0LWNvbG9yKTtcbn1cbi5saWwtZ3VpLWRyYWdnaW5nICoge1xuICBjdXJzb3I6IGV3LXJlc2l6ZSAhaW1wb3J0YW50O1xufVxuXG4ubGlsLWd1aS1kcmFnZ2luZy5saWwtZ3VpLXZlcnRpY2FsICoge1xuICBjdXJzb3I6IG5zLXJlc2l6ZSAhaW1wb3J0YW50O1xufVxuXG4ubGlsLWd1aSAudGl0bGUge1xuICBoZWlnaHQ6IHZhcigtLXRpdGxlLWhlaWdodCk7XG4gIGZvbnQtd2VpZ2h0OiA2MDA7XG4gIHBhZGRpbmc6IDAgdmFyKC0tcGFkZGluZyk7XG4gIHdpZHRoOiAxMDAlO1xuICB0ZXh0LWFsaWduOiBsZWZ0O1xuICBiYWNrZ3JvdW5kOiBub25lO1xuICB0ZXh0LWRlY29yYXRpb24tc2tpcDogb2JqZWN0cztcbn1cbi5saWwtZ3VpIC50aXRsZTpiZWZvcmUge1xuICBmb250LWZhbWlseTogXCJsaWwtZ3VpXCI7XG4gIGNvbnRlbnQ6IFwi4pa+XCI7XG4gIHBhZGRpbmctcmlnaHQ6IDJweDtcbiAgZGlzcGxheTogaW5saW5lLWJsb2NrO1xufVxuLmxpbC1ndWkgLnRpdGxlOmFjdGl2ZSB7XG4gIGJhY2tncm91bmQ6IHZhcigtLXRpdGxlLWJhY2tncm91bmQtY29sb3IpO1xuICBvcGFjaXR5OiAwLjc1O1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgYm9keTpub3QoLmxpbC1ndWktZHJhZ2dpbmcpIC5saWwtZ3VpIC50aXRsZTpob3ZlciB7XG4gICAgYmFja2dyb3VuZDogdmFyKC0tdGl0bGUtYmFja2dyb3VuZC1jb2xvcik7XG4gICAgb3BhY2l0eTogMC44NTtcbiAgfVxuICAubGlsLWd1aSAudGl0bGU6Zm9jdXMge1xuICAgIHRleHQtZGVjb3JhdGlvbjogdW5kZXJsaW5lIHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkucm9vdCA+IC50aXRsZTpmb2N1cyB7XG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZSAhaW1wb3J0YW50O1xufVxuLmxpbC1ndWkuY2xvc2VkID4gLnRpdGxlOmJlZm9yZSB7XG4gIGNvbnRlbnQ6IFwi4pa4XCI7XG59XG4ubGlsLWd1aS5jbG9zZWQgPiAuY2hpbGRyZW4ge1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoLTdweCk7XG4gIG9wYWNpdHk6IDA7XG59XG4ubGlsLWd1aS5jbG9zZWQ6bm90KC50cmFuc2l0aW9uKSA+IC5jaGlsZHJlbiB7XG4gIGRpc3BsYXk6IG5vbmU7XG59XG4ubGlsLWd1aS50cmFuc2l0aW9uID4gLmNoaWxkcmVuIHtcbiAgdHJhbnNpdGlvbi1kdXJhdGlvbjogMzAwbXM7XG4gIHRyYW5zaXRpb24tcHJvcGVydHk6IGhlaWdodCwgb3BhY2l0eSwgdHJhbnNmb3JtO1xuICB0cmFuc2l0aW9uLXRpbWluZy1mdW5jdGlvbjogY3ViaWMtYmV6aWVyKDAuMiwgMC42LCAwLjM1LCAxKTtcbiAgb3ZlcmZsb3c6IGhpZGRlbjtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG59XG4ubGlsLWd1aSAuY2hpbGRyZW46ZW1wdHk6YmVmb3JlIHtcbiAgY29udGVudDogXCJFbXB0eVwiO1xuICBwYWRkaW5nOiAwIHZhcigtLXBhZGRpbmcpO1xuICBtYXJnaW46IHZhcigtLXNwYWNpbmcpIDA7XG4gIGRpc3BsYXk6IGJsb2NrO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBmb250LXN0eWxlOiBpdGFsaWM7XG4gIGxpbmUtaGVpZ2h0OiB2YXIoLS13aWRnZXQtaGVpZ2h0KTtcbiAgb3BhY2l0eTogMC41O1xufVxuLmxpbC1ndWkucm9vdCA+IC5jaGlsZHJlbiA+IC5saWwtZ3VpID4gLnRpdGxlIHtcbiAgYm9yZGVyOiAwIHNvbGlkIHZhcigtLXdpZGdldC1jb2xvcik7XG4gIGJvcmRlci13aWR0aDogMXB4IDA7XG4gIHRyYW5zaXRpb246IGJvcmRlci1jb2xvciAzMDBtcztcbn1cbi5saWwtZ3VpLnJvb3QgPiAuY2hpbGRyZW4gPiAubGlsLWd1aS5jbG9zZWQgPiAudGl0bGUge1xuICBib3JkZXItYm90dG9tLWNvbG9yOiB0cmFuc3BhcmVudDtcbn1cbi5saWwtZ3VpICsgLmNvbnRyb2xsZXIge1xuICBib3JkZXItdG9wOiAxcHggc29saWQgdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgbWFyZ2luLXRvcDogMDtcbiAgcGFkZGluZy10b3A6IHZhcigtLXNwYWNpbmcpO1xufVxuLmxpbC1ndWkgLmxpbC1ndWkgLmxpbC1ndWkgPiAudGl0bGUge1xuICBib3JkZXI6IG5vbmU7XG59XG4ubGlsLWd1aSAubGlsLWd1aSAubGlsLWd1aSA+IC5jaGlsZHJlbiB7XG4gIGJvcmRlcjogbm9uZTtcbiAgbWFyZ2luLWxlZnQ6IHZhcigtLWZvbGRlci1pbmRlbnQpO1xuICBib3JkZXItbGVmdDogMnB4IHNvbGlkIHZhcigtLXdpZGdldC1jb2xvcik7XG59XG4ubGlsLWd1aSAubGlsLWd1aSAuY29udHJvbGxlciB7XG4gIGJvcmRlcjogbm9uZTtcbn1cblxuLmxpbC1ndWkgbGFiZWwsIC5saWwtZ3VpIGlucHV0LCAubGlsLWd1aSBidXR0b24ge1xuICAtd2Via2l0LXRhcC1oaWdobGlnaHQtY29sb3I6IHRyYW5zcGFyZW50O1xufVxuLmxpbC1ndWkgaW5wdXQge1xuICBib3JkZXI6IDA7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGZvbnQtZmFtaWx5OiB2YXIoLS1mb250LWZhbWlseSk7XG4gIGZvbnQtc2l6ZTogdmFyKC0taW5wdXQtZm9udC1zaXplKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICBiYWNrZ3JvdW5kOiB2YXIoLS13aWRnZXQtY29sb3IpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG4gIHdpZHRoOiAxMDAlO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgaW5wdXQ6aG92ZXIge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWhvdmVyLWNvbG9yKTtcbiAgfVxuICAubGlsLWd1aSBpbnB1dDphY3RpdmUge1xuICAgIGJhY2tncm91bmQ6IHZhcigtLWZvY3VzLWNvbG9yKTtcbiAgfVxufVxuLmxpbC1ndWkgaW5wdXQ6ZGlzYWJsZWQge1xuICBvcGFjaXR5OiAxO1xufVxuLmxpbC1ndWkgaW5wdXRbdHlwZT10ZXh0XSxcbi5saWwtZ3VpIGlucHV0W3R5cGU9bnVtYmVyXSB7XG4gIHBhZGRpbmc6IHZhcigtLXdpZGdldC1wYWRkaW5nKTtcbiAgLW1vei1hcHBlYXJhbmNlOiB0ZXh0ZmllbGQ7XG59XG4ubGlsLWd1aSBpbnB1dFt0eXBlPXRleHRdOmZvY3VzLFxuLmxpbC1ndWkgaW5wdXRbdHlwZT1udW1iZXJdOmZvY3VzIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xufVxuLmxpbC1ndWkgaW5wdXRbdHlwZT1jaGVja2JveF0ge1xuICBhcHBlYXJhbmNlOiBub25lO1xuICB3aWR0aDogdmFyKC0tY2hlY2tib3gtc2l6ZSk7XG4gIGhlaWdodDogdmFyKC0tY2hlY2tib3gtc2l6ZSk7XG4gIGJvcmRlci1yYWRpdXM6IHZhcigtLXdpZGdldC1ib3JkZXItcmFkaXVzKTtcbiAgdGV4dC1hbGlnbjogY2VudGVyO1xuICBjdXJzb3I6IHBvaW50ZXI7XG59XG4ubGlsLWd1aSBpbnB1dFt0eXBlPWNoZWNrYm94XTpjaGVja2VkOmJlZm9yZSB7XG4gIGZvbnQtZmFtaWx5OiBcImxpbC1ndWlcIjtcbiAgY29udGVudDogXCLinJNcIjtcbiAgZm9udC1zaXplOiB2YXIoLS1jaGVja2JveC1zaXplKTtcbiAgbGluZS1oZWlnaHQ6IHZhcigtLWNoZWNrYm94LXNpemUpO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgaW5wdXRbdHlwZT1jaGVja2JveF06Zm9jdXMge1xuICAgIGJveC1zaGFkb3c6IGluc2V0IDAgMCAwIDFweCB2YXIoLS1mb2N1cy1jb2xvcik7XG4gIH1cbn1cbi5saWwtZ3VpIGJ1dHRvbiB7XG4gIG91dGxpbmU6IG5vbmU7XG4gIGN1cnNvcjogcG9pbnRlcjtcbiAgZm9udC1mYW1pbHk6IHZhcigtLWZvbnQtZmFtaWx5KTtcbiAgZm9udC1zaXplOiB2YXIoLS1mb250LXNpemUpO1xuICBjb2xvcjogdmFyKC0tdGV4dC1jb2xvcik7XG4gIHdpZHRoOiAxMDAlO1xuICBib3JkZXI6IG5vbmU7XG59XG4ubGlsLWd1aSAuY29udHJvbGxlciBidXR0b24ge1xuICBoZWlnaHQ6IHZhcigtLXdpZGdldC1oZWlnaHQpO1xuICB0ZXh0LXRyYW5zZm9ybTogbm9uZTtcbiAgYmFja2dyb3VuZDogdmFyKC0td2lkZ2V0LWNvbG9yKTtcbiAgYm9yZGVyLXJhZGl1czogdmFyKC0td2lkZ2V0LWJvcmRlci1yYWRpdXMpO1xufVxuQG1lZGlhIChob3ZlcjogaG92ZXIpIHtcbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIgYnV0dG9uOmhvdmVyIHtcbiAgICBiYWNrZ3JvdW5kOiB2YXIoLS1ob3Zlci1jb2xvcik7XG4gIH1cbiAgLmxpbC1ndWkgLmNvbnRyb2xsZXIgYnV0dG9uOmZvY3VzIHtcbiAgICBib3gtc2hhZG93OiBpbnNldCAwIDAgMCAxcHggdmFyKC0tZm9jdXMtY29sb3IpO1xuICB9XG59XG4ubGlsLWd1aSAuY29udHJvbGxlciBidXR0b246YWN0aXZlIHtcbiAgYmFja2dyb3VuZDogdmFyKC0tZm9jdXMtY29sb3IpO1xufVxuXG5AZm9udC1mYWNlIHtcbiAgZm9udC1mYW1pbHk6IFwibGlsLWd1aVwiO1xuICBzcmM6IHVybChcImRhdGE6YXBwbGljYXRpb24vZm9udC13b2ZmO2NoYXJzZXQ9dXRmLTg7YmFzZTY0LGQwOUdSZ0FCQUFBQUFBVXNBQXNBQUFBQUNKd0FBUUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFCSFUxVkNBQUFCQ0FBQUFINEFBQURBSW13bVlFOVRMeklBQUFHSUFBQUFQd0FBQUdCS3FINVNZMjFoY0FBQUFjZ0FBQUQwQUFBQ3J1a3l5SkJuYkhsbUFBQUN2QUFBQUY4QUFBQ0VJWnBXSDJobFlXUUFBQU1jQUFBQUp3QUFBRFpmY2oyemFHaGxZUUFBQTBRQUFBQVlBQUFBSkFDNUFIaG9iWFI0QUFBRFhBQUFBQkFBQUFCTUFaQUFBR3h2WTJFQUFBTnNBQUFBRkFBQUFDZ0NFZ0l5YldGNGNBQUFBNEFBQUFBZUFBQUFJQUVmQUJKdVlXMWxBQUFEb0FBQUFTSUFBQUlLOVNVVS9YQnZjM1FBQUFURUFBQUFaZ0FBQUpDVGNNYzJlSnhWamJFT2dqQVVSVStoRlJCSzFkR1JMK0FMbkFpVG95TUxFekZwblB6L2VBc2h3U2E5NzUxN2MvTXd3Sm1lQjlrd1BsKzBjZjUrdUdQWlhzcVB1NG52WmFiY1NabGRaNmtmeVdub21GWS9lU2NLcVpOV3VwS0pPNmtYTjNLOXVDVm9MN2lJblByMVg1YmFYczN0anVNcUN0ekV1YWdtL0FBbHpRZ1BBQUI0bkdOZ1lSQmxuTURBeXNEQVlNL2dCaVQ1b0xRQkF3dURKQU1ERXdNck13TldFSkRtbXNKd2dDRmVYWmdoQmNqbFpNZ0ZDek9pS09JRkFCNzFCYjhBZUp5MWtqRnV3a0FRUlorRHdSQXdCdE5RUlVHS1E4T2RLQ0FXVWhBZ0tMaEl1QXNWU3BXejVCYmtqM2RFZ1lpVUlzenFXZHBaZStaNy93QjFvQ1ltSW9ib2l3aUxUMldqS2wvanNjckhmR2cvcEtkTWt5a2xDNVpzMkxFZkhZcGpjUm9Qem1lOU1XV21rM2RXYks5T2JrV2tpa09ldEo1NTRmV3lvRXNtZFNsdCt1UjBwQ0pSMzRiNnQvVFZnMVNZM3NZdmRmOHZ1aUtycHlhRFhESVNpZWdwMTdwNzU3OUdwM3ArK3k3SFBBaVk5cG1UaWJsanJyODVxU2lkdGxnNCtsMjVHTENhUzhlNnJSeE5CbXNuRVJ1bktiYU9PYlJ6N043Mmp1NXZkQWpZcEJYSGdKeWxPQVZzTXNlREFQRVA4TFlvVUhpY1kyQmlBQUVmaGlBR0pnWldCZ1o3Um5GUmRuVkpFTENRbEJTUmxBVEpNb0xWMkRLNGdsU1lzNnVicTV2YktySkxTYkdyZ0Vtb3ZEdURKVmhlM1Z6Y1hGd05MQ09JTEIvQzRJdVExeFRuNUZQaWxCVGo1RlBtQkFCNFd3b3FBSGljWTJCa1lHQUE0c2sxc1IvaitXMitNbkF6cERCZ0F5RU1RVUNTZzRFSnhBRUF3VWdGSGdCNG5HTmdaR0JnU0dGZ2dKTWhESXdNcUVBWUFCeUhBVEo0bkdOZ0FJSVVORXdtQUFCbDNBR1JlSnhqWUFBQ0lRWWxCaU1HSjN3UUFFY1FCRVY0bkdOZ1pHQmdFR1pnWTJCaUFBRVF5UVdFREF6L3dYd0dBQXNQQVRJQUFIaWNYZEJOU3NOQUhBWHdsMzVpQTBVUVhZbk1TaGZTOUdQWkE3VDdMZ0l1MDNTU3Brd3pZVEl0MUJONEFrL2dLVHlBZUN4ZnczOWpaa2p5bXpjdkF3bUFXL3dnd0hVRUdEYjM2K2pRUTNHWEdvdDc5TDI0anhDUDRnSHpGL0VJcjRqRUllN3d4aE9DM2cyVE1ZeTRRNytMdS9TSHVFZC9pdnQ0d0pkNHdQeGJQRUtNWDNHSTUrREpGR2FTbjRxTnprOG1jYktTUjZ4ZFhkaFN6YU9aSkd0ZGFwZDR2VlBiaTZyUCtjTDdUR1hPSHRYS2xsNGJZMVhsN0VHblB0cDdYeTJuMDB6eUtMVkhma0hCYTRJY0oyb0QzY2dnZ1d2dC9WL0ZiRHJVbEVVSmhUbi8wYXpWV2JOVE5yMEVuczhkZTF0Y2VLOXhabWZCMUNQak9tUEg0a2l0bXZPdWJjTnBtVlROM29GSnlqekN2bm1yd2hKVHpxelZqOWppU1g5MTFGamVBQUI0bkczSE1SS0NNQkJBMGYwZ2lpS2k0RFU4azBWMkdXYklaRE9oNFBvV1d2cTZKNVY4SWY5TlZOUWNhRGh5b3VYTWhZNHJQVGNHN2p3WW1YaEtxOFd6K3A3NjJhTmFlWVhvbTJuM20yZExUVmdzckNnRko3T1RtSWtZYndJYkM2dklCN1dtRmZBQUFBPT1cIikgZm9ybWF0KFwid29mZlwiKTtcbn1gO1xuXG5mdW5jdGlvbiBfaW5qZWN0U3R5bGVzKCBjc3NDb250ZW50ICkge1xuXHRjb25zdCBpbmplY3RlZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdzdHlsZScgKTtcblx0aW5qZWN0ZWQuaW5uZXJIVE1MID0gY3NzQ29udGVudDtcblx0Y29uc3QgYmVmb3JlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggJ2hlYWQgbGlua1tyZWw9c3R5bGVzaGVldF0sIGhlYWQgc3R5bGUnICk7XG5cdGlmICggYmVmb3JlICkge1xuXHRcdGRvY3VtZW50LmhlYWQuaW5zZXJ0QmVmb3JlKCBpbmplY3RlZCwgYmVmb3JlICk7XG5cdH0gZWxzZSB7XG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZCggaW5qZWN0ZWQgKTtcblx0fVxufVxuXG5cbmxldCBzdHlsZXNJbmplY3RlZCA9IGZhbHNlO1xuXG5jbGFzcyBHVUkge1xuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgcGFuZWwgdGhhdCBob2xkcyBjb250cm9sbGVycy5cblx0ICogQGV4YW1wbGVcblx0ICogbmV3IEdVSSgpO1xuXHQgKiBuZXcgR1VJKCB7IGNvbnRhaW5lcjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoICdjdXN0b20nICkgfSApO1xuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuYXV0b1BsYWNlPXRydWVdXG5cdCAqIEFkZHMgdGhlIEdVSSB0byBgZG9jdW1lbnQuYm9keWAgYW5kIGZpeGVzIGl0IHRvIHRoZSB0b3AgcmlnaHQgb2YgdGhlIHBhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IFtvcHRpb25zLmNvbnRhaW5lcl1cblx0ICogQWRkcyB0aGUgR1VJIHRvIHRoaXMgRE9NIGVsZW1lbnQuIE92ZXJyaWRlcyBgYXV0b1BsYWNlYC5cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLndpZHRoPTI0NV1cblx0ICogV2lkdGggb2YgdGhlIEdVSSBpbiBwaXhlbHMsIHVzdWFsbHkgc2V0IHdoZW4gbmFtZSBsYWJlbHMgYmVjb21lIHRvbyBsb25nLiBOb3RlIHRoYXQgeW91IGNhbiBtYWtlXG5cdCAqIG5hbWUgbGFiZWxzIHdpZGVyIGluIENTUyB3aXRoIGAubGls4oCRZ3VpIHsg4oCR4oCRbmFtZeKAkXdpZHRoOiA1NSUgfWAuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy50aXRsZT1Db250cm9sc11cblx0ICogTmFtZSB0byBkaXNwbGF5IGluIHRoZSB0aXRsZSBiYXIuXG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuY2xvc2VGb2xkZXJzPWZhbHNlXVxuXHQgKiBQYXNzIGB0cnVlYCB0byBjbG9zZSBhbGwgZm9sZGVycyBpbiB0aGlzIEdVSSBieSBkZWZhdWx0LlxuXHQgKlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmluamVjdFN0eWxlcz10cnVlXVxuXHQgKiBJbmplY3RzIHRoZSBkZWZhdWx0IHN0eWxlc2hlZXQgaW50byB0aGUgcGFnZSBpZiB0aGlzIGlzIHRoZSBmaXJzdCBHVUkuXG5cdCAqIFBhc3MgYGZhbHNlYCB0byB1c2UgeW91ciBvd24gc3R5bGVzaGVldC5cblx0ICpcblx0ICogQHBhcmFtIHtudW1iZXJ9IFtvcHRpb25zLnRvdWNoU3R5bGVzPXRydWVdXG5cdCAqIE1ha2VzIGNvbnRyb2xsZXJzIGxhcmdlciBvbiB0b3VjaCBkZXZpY2VzLiBQYXNzIGBmYWxzZWAgdG8gZGlzYWJsZSB0b3VjaCBzdHlsZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7R1VJfSBbb3B0aW9ucy5wYXJlbnRdXG5cdCAqIEFkZHMgdGhpcyBHVUkgYXMgYSBjaGlsZCBpbiBhbm90aGVyIEdVSS4gVXN1YWxseSB0aGlzIGlzIGRvbmUgZm9yIHlvdSBieSBgYWRkRm9sZGVyKClgLlxuXHQgKi9cblx0Y29uc3RydWN0b3IoIHtcblx0XHRwYXJlbnQsXG5cdFx0YXV0b1BsYWNlID0gcGFyZW50ID09PSB1bmRlZmluZWQsXG5cdFx0Y29udGFpbmVyLFxuXHRcdHdpZHRoLFxuXHRcdHRpdGxlID0gJ0NvbnRyb2xzJyxcblx0XHRjbG9zZUZvbGRlcnMgPSBmYWxzZSxcblx0XHRpbmplY3RTdHlsZXMgPSB0cnVlLFxuXHRcdHRvdWNoU3R5bGVzID0gdHJ1ZVxuXHR9ID0ge30gKSB7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgR1VJIGNvbnRhaW5pbmcgdGhpcyBmb2xkZXIsIG9yIGB1bmRlZmluZWRgIGlmIHRoaXMgaXMgdGhlIHJvb3QgR1VJLlxuXHRcdCAqIEB0eXBlIHtHVUl9XG5cdFx0ICovXG5cdFx0dGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgdG9wIGxldmVsIEdVSSBjb250YWluaW5nIHRoaXMgZm9sZGVyLCBvciBgdGhpc2AgaWYgdGhpcyBpcyB0aGUgcm9vdCBHVUkuXG5cdFx0ICogQHR5cGUge0dVSX1cblx0XHQgKi9cblx0XHR0aGlzLnJvb3QgPSBwYXJlbnQgPyBwYXJlbnQucm9vdCA6IHRoaXM7XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbGlzdCBvZiBjb250cm9sbGVycyBhbmQgZm9sZGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkuXG5cdFx0ICogQHR5cGUge0FycmF5PEdVSXxDb250cm9sbGVyPn1cblx0XHQgKi9cblx0XHR0aGlzLmNoaWxkcmVuID0gW107XG5cblx0XHQvKipcblx0XHQgKiBUaGUgbGlzdCBvZiBjb250cm9sbGVycyBjb250YWluZWQgYnkgdGhpcyBHVUkuXG5cdFx0ICogQHR5cGUge0FycmF5PENvbnRyb2xsZXI+fVxuXHRcdCAqL1xuXHRcdHRoaXMuY29udHJvbGxlcnMgPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBsaXN0IG9mIGZvbGRlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJLlxuXHRcdCAqIEB0eXBlIHtBcnJheTxHVUk+fVxuXHRcdCAqL1xuXHRcdHRoaXMuZm9sZGVycyA9IFtdO1xuXG5cdFx0LyoqXG5cdFx0ICogVXNlZCB0byBkZXRlcm1pbmUgaWYgdGhlIEdVSSBpcyBjbG9zZWQuIFVzZSBgZ3VpLm9wZW4oKWAgb3IgYGd1aS5jbG9zZSgpYCB0byBjaGFuZ2UgdGhpcy5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9jbG9zZWQgPSBmYWxzZTtcblxuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gZGV0ZXJtaW5lIGlmIHRoZSBHVUkgaXMgaGlkZGVuLiBVc2UgYGd1aS5zaG93KClgIG9yIGBndWkuaGlkZSgpYCB0byBjaGFuZ2UgdGhpcy5cblx0XHQgKiBAdHlwZSB7Ym9vbGVhbn1cblx0XHQgKi9cblx0XHR0aGlzLl9oaWRkZW4gPSBmYWxzZTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBvdXRlcm1vc3QgY29udGFpbmVyIGVsZW1lbnQuXG5cdFx0ICogQHR5cGUge0hUTUxFbGVtZW50fVxuXHRcdCAqL1xuXHRcdHRoaXMuZG9tRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdsaWwtZ3VpJyApO1xuXG5cdFx0LyoqXG5cdFx0ICogVGhlIERPTSBlbGVtZW50IHRoYXQgY29udGFpbnMgdGhlIHRpdGxlLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiR0aXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdidXR0b24nICk7XG5cdFx0dGhpcy4kdGl0bGUuY2xhc3NMaXN0LmFkZCggJ3RpdGxlJyApO1xuXHRcdHRoaXMuJHRpdGxlLnNldEF0dHJpYnV0ZSggJ2FyaWEtZXhwYW5kZWQnLCB0cnVlICk7XG5cblx0XHR0aGlzLiR0aXRsZS5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCAoKSA9PiB0aGlzLm9wZW5BbmltYXRlZCggdGhpcy5fY2xvc2VkICkgKTtcblxuXHRcdC8vIGVuYWJsZXMgOmFjdGl2ZSBwc2V1ZG8gY2xhc3Mgb24gbW9iaWxlXG5cdFx0dGhpcy4kdGl0bGUuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCAoKSA9PiB7fSwgeyBwYXNzaXZlOiB0cnVlIH0gKTtcblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBET00gZWxlbWVudCB0aGF0IGNvbnRhaW5zIGNoaWxkcmVuLlxuXHRcdCAqIEB0eXBlIHtIVE1MRWxlbWVudH1cblx0XHQgKi9cblx0XHR0aGlzLiRjaGlsZHJlbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdFx0dGhpcy4kY2hpbGRyZW4uY2xhc3NMaXN0LmFkZCggJ2NoaWxkcmVuJyApO1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLiR0aXRsZSApO1xuXHRcdHRoaXMuZG9tRWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy4kY2hpbGRyZW4gKTtcblxuXHRcdHRoaXMudGl0bGUoIHRpdGxlICk7XG5cblx0XHRpZiAoIHRoaXMucGFyZW50ICkge1xuXG5cdFx0XHR0aGlzLnBhcmVudC5jaGlsZHJlbi5wdXNoKCB0aGlzICk7XG5cdFx0XHR0aGlzLnBhcmVudC5mb2xkZXJzLnB1c2goIHRoaXMgKTtcblxuXHRcdFx0dGhpcy5wYXJlbnQuJGNoaWxkcmVuLmFwcGVuZENoaWxkKCB0aGlzLmRvbUVsZW1lbnQgKTtcblxuXHRcdFx0Ly8gU3RvcCB0aGUgY29uc3RydWN0b3IgZWFybHksIGV2ZXJ5dGhpbmcgb253YXJkIG9ubHkgYXBwbGllcyB0byByb290IEdVSSdzXG5cdFx0XHRyZXR1cm47XG5cblx0XHR9XG5cblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ3Jvb3QnICk7XG5cblx0XHRpZiAoIHRvdWNoU3R5bGVzICkge1xuXHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICdhbGxvdy10b3VjaC1zdHlsZXMnICk7XG5cdFx0fVxuXG5cdFx0Ly8gSW5qZWN0IHN0eWxlc2hlZXQgaWYgd2UgaGF2ZW4ndCBkb25lIHRoYXQgeWV0XG5cdFx0aWYgKCAhc3R5bGVzSW5qZWN0ZWQgJiYgaW5qZWN0U3R5bGVzICkge1xuXHRcdFx0X2luamVjdFN0eWxlcyggc3R5bGVzaGVldCApO1xuXHRcdFx0c3R5bGVzSW5qZWN0ZWQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdGlmICggY29udGFpbmVyICkge1xuXG5cdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXG5cdFx0fSBlbHNlIGlmICggYXV0b1BsYWNlICkge1xuXG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LmFkZCggJ2F1dG9QbGFjZScgKTtcblx0XHRcdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuZG9tRWxlbWVudCApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB3aWR0aCApIHtcblx0XHRcdHRoaXMuZG9tRWxlbWVudC5zdHlsZS5zZXRQcm9wZXJ0eSggJy0td2lkdGgnLCB3aWR0aCArICdweCcgKTtcblx0XHR9XG5cblx0XHR0aGlzLl9jbG9zZUZvbGRlcnMgPSBjbG9zZUZvbGRlcnM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgY29udHJvbGxlciB0byB0aGUgR1VJLCBpbmZlcnJpbmcgY29udHJvbGxlciB0eXBlIHVzaW5nIHRoZSBgdHlwZW9mYCBvcGVyYXRvci5cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLmFkZCggb2JqZWN0LCAncHJvcGVydHknICk7XG5cdCAqIGd1aS5hZGQoIG9iamVjdCwgJ251bWJlcicsIDAsIDEwMCwgMSApO1xuXHQgKiBndWkuYWRkKCBvYmplY3QsICdvcHRpb25zJywgWyAxLCAyLCAzIF0gKTtcblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRoZSBjb250cm9sbGVyIHdpbGwgbW9kaWZ5LlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgTmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gY29udHJvbC5cblx0ICogQHBhcmFtIHtudW1iZXJ8b2JqZWN0fEFycmF5fSBbJDFdIE1pbmltdW0gdmFsdWUgZm9yIG51bWJlciBjb250cm9sbGVycywgb3IgdGhlIHNldCBvZlxuXHQgKiBzZWxlY3RhYmxlIHZhbHVlcyBmb3IgYSBkcm9wZG93bi5cblx0ICogQHBhcmFtIHtudW1iZXJ9IFttYXhdIE1heGltdW0gdmFsdWUgZm9yIG51bWJlciBjb250cm9sbGVycy5cblx0ICogQHBhcmFtIHtudW1iZXJ9IFtzdGVwXSBTdGVwIHZhbHVlIGZvciBudW1iZXIgY29udHJvbGxlcnMuXG5cdCAqIEByZXR1cm5zIHtDb250cm9sbGVyfVxuXHQgKi9cblx0YWRkKCBvYmplY3QsIHByb3BlcnR5LCAkMSwgbWF4LCBzdGVwICkge1xuXG5cdFx0aWYgKCBPYmplY3QoICQxICkgPT09ICQxICkge1xuXG5cdFx0XHRyZXR1cm4gbmV3IE9wdGlvbkNvbnRyb2xsZXIoIHRoaXMsIG9iamVjdCwgcHJvcGVydHksICQxICk7XG5cblx0XHR9XG5cblx0XHRjb25zdCBpbml0aWFsVmFsdWUgPSBvYmplY3RbIHByb3BlcnR5IF07XG5cblx0XHRzd2l0Y2ggKCB0eXBlb2YgaW5pdGlhbFZhbHVlICkge1xuXG5cdFx0XHRjYXNlICdudW1iZXInOlxuXG5cdFx0XHRcdHJldHVybiBuZXcgTnVtYmVyQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSwgJDEsIG1heCwgc3RlcCApO1xuXG5cdFx0XHRjYXNlICdib29sZWFuJzpcblxuXHRcdFx0XHRyZXR1cm4gbmV3IEJvb2xlYW5Db250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cblx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cblx0XHRcdFx0cmV0dXJuIG5ldyBTdHJpbmdDb250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5ICk7XG5cblx0XHRcdGNhc2UgJ2Z1bmN0aW9uJzpcblxuXHRcdFx0XHRyZXR1cm4gbmV3IEZ1bmN0aW9uQ29udHJvbGxlciggdGhpcywgb2JqZWN0LCBwcm9wZXJ0eSApO1xuXG5cdFx0fVxuXG5cdFx0Y29uc29sZS5lcnJvciggYGd1aS5hZGQgZmFpbGVkXG5cdHByb3BlcnR5OmAsIHByb3BlcnR5LCBgXG5cdG9iamVjdDpgLCBvYmplY3QsIGBcblx0dmFsdWU6YCwgaW5pdGlhbFZhbHVlICk7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgY29sb3IgY29udHJvbGxlciB0byB0aGUgR1VJLlxuXHQgKiBAZXhhbXBsZVxuXHQgKiBwYXJhbXMgPSB7XG5cdCAqIFx0Y3NzQ29sb3I6ICcjZmYwMGZmJyxcblx0ICogXHRyZ2JDb2xvcjogeyByOiAwLCBnOiAwLjIsIGI6IDAuNCB9LFxuXHQgKiBcdGN1c3RvbVJhbmdlOiBbIDAsIDEyNywgMjU1IF0sXG5cdCAqIH07XG5cdCAqXG5cdCAqIGd1aS5hZGRDb2xvciggcGFyYW1zLCAnY3NzQ29sb3InICk7XG5cdCAqIGd1aS5hZGRDb2xvciggcGFyYW1zLCAncmdiQ29sb3InICk7XG5cdCAqIGd1aS5hZGRDb2xvciggcGFyYW1zLCAnY3VzdG9tUmFuZ2UnLCAyNTUgKTtcblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG9iamVjdCBUaGUgb2JqZWN0IHRoZSBjb250cm9sbGVyIHdpbGwgbW9kaWZ5LlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gcHJvcGVydHkgTmFtZSBvZiB0aGUgcHJvcGVydHkgdG8gY29udHJvbC5cblx0ICogQHBhcmFtIHtudW1iZXJ9IHJnYlNjYWxlIE1heGltdW0gdmFsdWUgZm9yIGEgY29sb3IgY2hhbm5lbCB3aGVuIHVzaW5nIGFuIFJHQiBjb2xvci4gWW91IG1heVxuXHQgKiBuZWVkIHRvIHNldCB0aGlzIHRvIDI1NSBpZiB5b3VyIGNvbG9ycyBhcmUgdG9vIGJyaWdodC5cblx0ICogQHJldHVybnMge0NvbnRyb2xsZXJ9XG5cdCAqL1xuXHRhZGRDb2xvciggb2JqZWN0LCBwcm9wZXJ0eSwgcmdiU2NhbGUgPSAxICkge1xuXHRcdHJldHVybiBuZXcgQ29sb3JDb250cm9sbGVyKCB0aGlzLCBvYmplY3QsIHByb3BlcnR5LCByZ2JTY2FsZSApO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZHMgYSBmb2xkZXIgdG8gdGhlIEdVSSwgd2hpY2ggaXMganVzdCBhbm90aGVyIEdVSS4gVGhpcyBtZXRob2QgcmV0dXJuc1xuXHQgKiB0aGUgbmVzdGVkIEdVSSBzbyB5b3UgY2FuIGFkZCBjb250cm9sbGVycyB0byBpdC5cblx0ICogQGV4YW1wbGVcblx0ICogY29uc3QgZm9sZGVyID0gZ3VpLmFkZEZvbGRlciggJ1Bvc2l0aW9uJyApO1xuXHQgKiBmb2xkZXIuYWRkKCBwb3NpdGlvbiwgJ3gnICk7XG5cdCAqIGZvbGRlci5hZGQoIHBvc2l0aW9uLCAneScgKTtcblx0ICogZm9sZGVyLmFkZCggcG9zaXRpb24sICd6JyApO1xuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGUgTmFtZSB0byBkaXNwbGF5IGluIHRoZSBmb2xkZXIncyB0aXRsZSBiYXIuXG5cdCAqIEByZXR1cm5zIHtHVUl9XG5cdCAqL1xuXHRhZGRGb2xkZXIoIHRpdGxlICkge1xuXHRcdGNvbnN0IGZvbGRlciA9IG5ldyBHVUkoIHsgcGFyZW50OiB0aGlzLCB0aXRsZSB9ICk7XG5cdFx0aWYgKCB0aGlzLnJvb3QuX2Nsb3NlRm9sZGVycyApIGZvbGRlci5jbG9zZSgpO1xuXHRcdHJldHVybiBmb2xkZXI7XG5cdH1cblxuXHQvKipcblx0ICogUmVjYWxscyB2YWx1ZXMgdGhhdCB3ZXJlIHNhdmVkIHdpdGggYGd1aS5zYXZlKClgLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb2JqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVjdXJzaXZlIFBhc3MgZmFsc2UgdG8gZXhjbHVkZSBmb2xkZXJzIGRlc2NlbmRpbmcgZnJvbSB0aGlzIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRsb2FkKCBvYmosIHJlY3Vyc2l2ZSA9IHRydWUgKSB7XG5cblx0XHRpZiAoIG9iai5jb250cm9sbGVycyApIHtcblxuXHRcdFx0dGhpcy5jb250cm9sbGVycy5mb3JFYWNoKCBjID0+IHtcblxuXHRcdFx0XHRpZiAoIGMgaW5zdGFuY2VvZiBGdW5jdGlvbkNvbnRyb2xsZXIgKSByZXR1cm47XG5cblx0XHRcdFx0aWYgKCBjLl9uYW1lIGluIG9iai5jb250cm9sbGVycyApIHtcblx0XHRcdFx0XHRjLmxvYWQoIG9iai5jb250cm9sbGVyc1sgYy5fbmFtZSBdICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0fSApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCByZWN1cnNpdmUgJiYgb2JqLmZvbGRlcnMgKSB7XG5cblx0XHRcdHRoaXMuZm9sZGVycy5mb3JFYWNoKCBmID0+IHtcblxuXHRcdFx0XHRpZiAoIGYuX3RpdGxlIGluIG9iai5mb2xkZXJzICkge1xuXHRcdFx0XHRcdGYubG9hZCggb2JqLmZvbGRlcnNbIGYuX3RpdGxlIF0gKTtcblx0XHRcdFx0fVxuXG5cdFx0XHR9ICk7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gb2JqZWN0IG1hcHBpbmcgY29udHJvbGxlciBuYW1lcyB0byB2YWx1ZXMuIFRoZSBvYmplY3QgY2FuIGJlIHBhc3NlZCB0byBgZ3VpLmxvYWQoKWAgdG9cblx0ICogcmVjYWxsIHRoZXNlIHZhbHVlcy5cblx0ICogQGV4YW1wbGVcblx0ICoge1xuXHQgKiBcdGNvbnRyb2xsZXJzOiB7XG5cdCAqIFx0XHRwcm9wMTogMSxcblx0ICogXHRcdHByb3AyOiAndmFsdWUnLFxuXHQgKiBcdFx0Li4uXG5cdCAqIFx0fSxcblx0ICogXHRmb2xkZXJzOiB7XG5cdCAqIFx0XHRmb2xkZXJOYW1lMTogeyBjb250cm9sbGVycywgZm9sZGVycyB9LFxuXHQgKiBcdFx0Zm9sZGVyTmFtZTI6IHsgY29udHJvbGxlcnMsIGZvbGRlcnMgfVxuXHQgKiBcdFx0Li4uXG5cdCAqIFx0fVxuXHQgKiB9XG5cdCAqXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gcmVjdXJzaXZlIFBhc3MgZmFsc2UgdG8gZXhjbHVkZSBmb2xkZXJzIGRlc2NlbmRpbmcgZnJvbSB0aGlzIEdVSS5cblx0ICogQHJldHVybnMge29iamVjdH1cblx0ICovXG5cdHNhdmUoIHJlY3Vyc2l2ZSA9IHRydWUgKSB7XG5cblx0XHRjb25zdCBvYmogPSB7XG5cdFx0XHRjb250cm9sbGVyczoge30sXG5cdFx0XHRmb2xkZXJzOiB7fVxuXHRcdH07XG5cblx0XHR0aGlzLmNvbnRyb2xsZXJzLmZvckVhY2goIGMgPT4ge1xuXG5cdFx0XHRpZiAoIGMgaW5zdGFuY2VvZiBGdW5jdGlvbkNvbnRyb2xsZXIgKSByZXR1cm47XG5cblx0XHRcdGlmICggYy5fbmFtZSBpbiBvYmouY29udHJvbGxlcnMgKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvciggYENhbm5vdCBzYXZlIEdVSSB3aXRoIGR1cGxpY2F0ZSBwcm9wZXJ0eSBcIiR7Yy5fbmFtZX1cImAgKTtcblx0XHRcdH1cblxuXHRcdFx0b2JqLmNvbnRyb2xsZXJzWyBjLl9uYW1lIF0gPSBjLnNhdmUoKTtcblxuXHRcdH0gKTtcblxuXHRcdGlmICggcmVjdXJzaXZlICkge1xuXG5cdFx0XHR0aGlzLmZvbGRlcnMuZm9yRWFjaCggZiA9PiB7XG5cblx0XHRcdFx0aWYgKCBmLl90aXRsZSBpbiBvYmouZm9sZGVycyApIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoIGBDYW5ub3Qgc2F2ZSBHVUkgd2l0aCBkdXBsaWNhdGUgZm9sZGVyIFwiJHtmLl90aXRsZX1cImAgKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG9iai5mb2xkZXJzWyBmLl90aXRsZSBdID0gZi5zYXZlKCk7XG5cblx0XHRcdH0gKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiBvYmo7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBPcGVucyBhIEdVSSBvciBmb2xkZXIuIEdVSSBhbmQgZm9sZGVycyBhcmUgb3BlbiBieSBkZWZhdWx0LlxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IG9wZW4gUGFzcyBmYWxzZSB0byBjbG9zZS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5vcGVuKCk7IC8vIG9wZW5cblx0ICogZ3VpLm9wZW4oIGZhbHNlICk7IC8vIGNsb3NlXG5cdCAqIGd1aS5vcGVuKCBndWkuX2Nsb3NlZCApOyAvLyB0b2dnbGVcblx0ICovXG5cdG9wZW4oIG9wZW4gPSB0cnVlICkge1xuXG5cdFx0dGhpcy5fc2V0Q2xvc2VkKCAhb3BlbiApO1xuXG5cdFx0dGhpcy4kdGl0bGUuc2V0QXR0cmlidXRlKCAnYXJpYS1leHBhbmRlZCcsICF0aGlzLl9jbG9zZWQgKTtcblx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LnRvZ2dsZSggJ2Nsb3NlZCcsIHRoaXMuX2Nsb3NlZCApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDbG9zZXMgdGhlIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRjbG9zZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5vcGVuKCBmYWxzZSApO1xuXHR9XG5cblx0X3NldENsb3NlZCggY2xvc2VkICkge1xuXHRcdGlmICggdGhpcy5fY2xvc2VkID09PSBjbG9zZWQgKSByZXR1cm47XG5cdFx0dGhpcy5fY2xvc2VkID0gY2xvc2VkO1xuXHRcdHRoaXMuX2NhbGxPbk9wZW5DbG9zZSggdGhpcyApO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNob3dzIHRoZSBHVUkgYWZ0ZXIgaXQncyBiZWVuIGhpZGRlbi5cblx0ICogQHBhcmFtIHtib29sZWFufSBzaG93XG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKiBAZXhhbXBsZVxuXHQgKiBndWkuc2hvdygpO1xuXHQgKiBndWkuc2hvdyggZmFsc2UgKTsgLy8gaGlkZVxuXHQgKiBndWkuc2hvdyggZ3VpLl9oaWRkZW4gKTsgLy8gdG9nZ2xlXG5cdCAqL1xuXHRzaG93KCBzaG93ID0gdHJ1ZSApIHtcblxuXHRcdHRoaXMuX2hpZGRlbiA9ICFzaG93O1xuXG5cdFx0dGhpcy5kb21FbGVtZW50LnN0eWxlLmRpc3BsYXkgPSB0aGlzLl9oaWRkZW4gPyAnbm9uZScgOiAnJztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogSGlkZXMgdGhlIEdVSS5cblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqL1xuXHRoaWRlKCkge1xuXHRcdHJldHVybiB0aGlzLnNob3coIGZhbHNlICk7XG5cdH1cblxuXHRvcGVuQW5pbWF0ZWQoIG9wZW4gPSB0cnVlICkge1xuXG5cdFx0Ly8gc2V0IHN0YXRlIGltbWVkaWF0ZWx5XG5cdFx0dGhpcy5fc2V0Q2xvc2VkKCAhb3BlbiApO1xuXG5cdFx0dGhpcy4kdGl0bGUuc2V0QXR0cmlidXRlKCAnYXJpYS1leHBhbmRlZCcsICF0aGlzLl9jbG9zZWQgKTtcblxuXHRcdC8vIHdhaXQgZm9yIG5leHQgZnJhbWUgdG8gbWVhc3VyZSAkY2hpbGRyZW5cblx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHtcblxuXHRcdFx0Ly8gZXhwbGljaXRseSBzZXQgaW5pdGlhbCBoZWlnaHQgZm9yIHRyYW5zaXRpb25cblx0XHRcdGNvbnN0IGluaXRpYWxIZWlnaHQgPSB0aGlzLiRjaGlsZHJlbi5jbGllbnRIZWlnaHQ7XG5cdFx0XHR0aGlzLiRjaGlsZHJlbi5zdHlsZS5oZWlnaHQgPSBpbml0aWFsSGVpZ2h0ICsgJ3B4JztcblxuXHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC5hZGQoICd0cmFuc2l0aW9uJyApO1xuXG5cdFx0XHRjb25zdCBvblRyYW5zaXRpb25FbmQgPSBlID0+IHtcblx0XHRcdFx0aWYgKCBlLnRhcmdldCAhPT0gdGhpcy4kY2hpbGRyZW4gKSByZXR1cm47XG5cdFx0XHRcdHRoaXMuJGNoaWxkcmVuLnN0eWxlLmhlaWdodCA9ICcnO1xuXHRcdFx0XHR0aGlzLmRvbUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSggJ3RyYW5zaXRpb24nICk7XG5cdFx0XHRcdHRoaXMuJGNoaWxkcmVuLnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0cmFuc2l0aW9uZW5kJywgb25UcmFuc2l0aW9uRW5kICk7XG5cdFx0XHR9O1xuXG5cdFx0XHR0aGlzLiRjaGlsZHJlbi5hZGRFdmVudExpc3RlbmVyKCAndHJhbnNpdGlvbmVuZCcsIG9uVHJhbnNpdGlvbkVuZCApO1xuXG5cdFx0XHQvLyB0b2RvOiB0aGlzIGlzIHdyb25nIGlmIGNoaWxkcmVuJ3Mgc2Nyb2xsSGVpZ2h0IG1ha2VzIGZvciBhIGd1aSB0YWxsZXIgdGhhbiBtYXhIZWlnaHRcblx0XHRcdGNvbnN0IHRhcmdldEhlaWdodCA9ICFvcGVuID8gMCA6IHRoaXMuJGNoaWxkcmVuLnNjcm9sbEhlaWdodDtcblxuXHRcdFx0dGhpcy5kb21FbGVtZW50LmNsYXNzTGlzdC50b2dnbGUoICdjbG9zZWQnLCAhb3BlbiApO1xuXG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoICgpID0+IHtcblx0XHRcdFx0dGhpcy4kY2hpbGRyZW4uc3R5bGUuaGVpZ2h0ID0gdGFyZ2V0SGVpZ2h0ICsgJ3B4Jztcblx0XHRcdH0gKTtcblxuXHRcdH0gKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH1cblxuXHQvKipcblx0ICogQ2hhbmdlIHRoZSB0aXRsZSBvZiB0aGlzIEdVSS5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG5cdCAqIEByZXR1cm5zIHt0aGlzfVxuXHQgKi9cblx0dGl0bGUoIHRpdGxlICkge1xuXHRcdC8qKlxuXHRcdCAqIEN1cnJlbnQgdGl0bGUgb2YgdGhlIEdVSS4gVXNlIGBndWkudGl0bGUoICdUaXRsZScgKWAgdG8gbW9kaWZ5IHRoaXMgdmFsdWUuXG5cdFx0ICogQHR5cGUge3N0cmluZ31cblx0XHQgKi9cblx0XHR0aGlzLl90aXRsZSA9IHRpdGxlO1xuXHRcdHRoaXMuJHRpdGxlLnRleHRDb250ZW50ID0gdGl0bGU7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogUmVzZXRzIGFsbCBjb250cm9sbGVycyB0byB0aGVpciBpbml0aWFsIHZhbHVlcy5cblx0ICogQHBhcmFtIHtib29sZWFufSByZWN1cnNpdmUgUGFzcyBmYWxzZSB0byBleGNsdWRlIGZvbGRlcnMgZGVzY2VuZGluZyBmcm9tIHRoaXMgR1VJLlxuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICovXG5cdHJlc2V0KCByZWN1cnNpdmUgPSB0cnVlICkge1xuXHRcdGNvbnN0IGNvbnRyb2xsZXJzID0gcmVjdXJzaXZlID8gdGhpcy5jb250cm9sbGVyc1JlY3Vyc2l2ZSgpIDogdGhpcy5jb250cm9sbGVycztcblx0XHRjb250cm9sbGVycy5mb3JFYWNoKCBjID0+IGMucmVzZXQoKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBjb250cm9sbGVyIGluIHRoaXMgR1VJIGNoYW5nZXMuXG5cdCAqIEBwYXJhbSB7ZnVuY3Rpb24oe29iamVjdDpvYmplY3QsIHByb3BlcnR5OnN0cmluZywgdmFsdWU6YW55LCBjb250cm9sbGVyOkNvbnRyb2xsZXJ9KX0gY2FsbGJhY2tcblx0ICogQHJldHVybnMge3RoaXN9XG5cdCAqIEBleGFtcGxlXG5cdCAqIGd1aS5vbkNoYW5nZSggZXZlbnQgPT4ge1xuXHQgKiBcdGV2ZW50Lm9iamVjdCAgICAgLy8gb2JqZWN0IHRoYXQgd2FzIG1vZGlmaWVkXG5cdCAqIFx0ZXZlbnQucHJvcGVydHkgICAvLyBzdHJpbmcsIG5hbWUgb2YgcHJvcGVydHlcblx0ICogXHRldmVudC52YWx1ZSAgICAgIC8vIG5ldyB2YWx1ZSBvZiBjb250cm9sbGVyXG5cdCAqIFx0ZXZlbnQuY29udHJvbGxlciAvLyBjb250cm9sbGVyIHRoYXQgd2FzIG1vZGlmaWVkXG5cdCAqIH0gKTtcblx0ICovXG5cdG9uQ2hhbmdlKCBjYWxsYmFjayApIHtcblx0XHQvKipcblx0XHQgKiBVc2VkIHRvIGFjY2VzcyB0aGUgZnVuY3Rpb24gYm91bmQgdG8gYG9uQ2hhbmdlYCBldmVudHMuIERvbid0IG1vZGlmeSB0aGlzIHZhbHVlXG5cdFx0ICogZGlyZWN0bHkuIFVzZSB0aGUgYGd1aS5vbkNoYW5nZSggY2FsbGJhY2sgKWAgbWV0aG9kIGluc3RlYWQuXG5cdFx0ICogQHR5cGUge0Z1bmN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuX29uQ2hhbmdlID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRfY2FsbE9uQ2hhbmdlKCBjb250cm9sbGVyICkge1xuXG5cdFx0aWYgKCB0aGlzLnBhcmVudCApIHtcblx0XHRcdHRoaXMucGFyZW50Ll9jYWxsT25DaGFuZ2UoIGNvbnRyb2xsZXIgKTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuX29uQ2hhbmdlICE9PSB1bmRlZmluZWQgKSB7XG5cdFx0XHR0aGlzLl9vbkNoYW5nZS5jYWxsKCB0aGlzLCB7XG5cdFx0XHRcdG9iamVjdDogY29udHJvbGxlci5vYmplY3QsXG5cdFx0XHRcdHByb3BlcnR5OiBjb250cm9sbGVyLnByb3BlcnR5LFxuXHRcdFx0XHR2YWx1ZTogY29udHJvbGxlci5nZXRWYWx1ZSgpLFxuXHRcdFx0XHRjb250cm9sbGVyXG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgd2hlbmV2ZXIgYSBjb250cm9sbGVyIGluIHRoaXMgR1VJIGhhcyBmaW5pc2hlZCBjaGFuZ2luZy5cblx0ICogQHBhcmFtIHtmdW5jdGlvbih7b2JqZWN0Om9iamVjdCwgcHJvcGVydHk6c3RyaW5nLCB2YWx1ZTphbnksIGNvbnRyb2xsZXI6Q29udHJvbGxlcn0pfSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLm9uRmluaXNoQ2hhbmdlKCBldmVudCA9PiB7XG5cdCAqIFx0ZXZlbnQub2JqZWN0ICAgICAvLyBvYmplY3QgdGhhdCB3YXMgbW9kaWZpZWRcblx0ICogXHRldmVudC5wcm9wZXJ0eSAgIC8vIHN0cmluZywgbmFtZSBvZiBwcm9wZXJ0eVxuXHQgKiBcdGV2ZW50LnZhbHVlICAgICAgLy8gbmV3IHZhbHVlIG9mIGNvbnRyb2xsZXJcblx0ICogXHRldmVudC5jb250cm9sbGVyIC8vIGNvbnRyb2xsZXIgdGhhdCB3YXMgbW9kaWZpZWRcblx0ICogfSApO1xuXHQgKi9cblx0b25GaW5pc2hDaGFuZ2UoIGNhbGxiYWNrICkge1xuXHRcdC8qKlxuXHRcdCAqIFVzZWQgdG8gYWNjZXNzIHRoZSBmdW5jdGlvbiBib3VuZCB0byBgb25GaW5pc2hDaGFuZ2VgIGV2ZW50cy4gRG9uJ3QgbW9kaWZ5IHRoaXMgdmFsdWVcblx0XHQgKiBkaXJlY3RseS4gVXNlIHRoZSBgZ3VpLm9uRmluaXNoQ2hhbmdlKCBjYWxsYmFjayApYCBtZXRob2QgaW5zdGVhZC5cblx0XHQgKiBAdHlwZSB7RnVuY3Rpb259XG5cdFx0ICovXG5cdFx0dGhpcy5fb25GaW5pc2hDaGFuZ2UgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdF9jYWxsT25GaW5pc2hDaGFuZ2UoIGNvbnRyb2xsZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMucGFyZW50ICkge1xuXHRcdFx0dGhpcy5wYXJlbnQuX2NhbGxPbkZpbmlzaENoYW5nZSggY29udHJvbGxlciApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fb25GaW5pc2hDaGFuZ2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX29uRmluaXNoQ2hhbmdlLmNhbGwoIHRoaXMsIHtcblx0XHRcdFx0b2JqZWN0OiBjb250cm9sbGVyLm9iamVjdCxcblx0XHRcdFx0cHJvcGVydHk6IGNvbnRyb2xsZXIucHJvcGVydHksXG5cdFx0XHRcdHZhbHVlOiBjb250cm9sbGVyLmdldFZhbHVlKCksXG5cdFx0XHRcdGNvbnRyb2xsZXJcblx0XHRcdH0gKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUGFzcyBhIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCB3aGVuIHRoaXMgR1VJIG9yIGl0cyBkZXNjZW5kYW50cyBhcmUgb3BlbmVkIG9yIGNsb3NlZC5cblx0ICogQHBhcmFtIHtmdW5jdGlvbihHVUkpfSBjYWxsYmFja1xuXHQgKiBAcmV0dXJucyB7dGhpc31cblx0ICogQGV4YW1wbGVcblx0ICogZ3VpLm9uT3BlbkNsb3NlKCBjaGFuZ2VkR1VJID0+IHtcblx0ICogXHRjb25zb2xlLmxvZyggY2hhbmdlZEdVSS5fY2xvc2VkICk7XG5cdCAqIH0gKTtcblx0ICovXG5cdG9uT3BlbkNsb3NlKCBjYWxsYmFjayApIHtcblx0XHR0aGlzLl9vbk9wZW5DbG9zZSA9IGNhbGxiYWNrO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0X2NhbGxPbk9wZW5DbG9zZSggY2hhbmdlZEdVSSApIHtcblx0XHRpZiAoIHRoaXMucGFyZW50ICkge1xuXHRcdFx0dGhpcy5wYXJlbnQuX2NhbGxPbk9wZW5DbG9zZSggY2hhbmdlZEdVSSApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5fb25PcGVuQ2xvc2UgIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdHRoaXMuX29uT3BlbkNsb3NlLmNhbGwoIHRoaXMsIGNoYW5nZWRHVUkgKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVzdHJveXMgYWxsIERPTSBlbGVtZW50cyBhbmQgZXZlbnQgbGlzdGVuZXJzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIEdVSS5cblx0ICovXG5cdGRlc3Ryb3koKSB7XG5cblx0XHRpZiAoIHRoaXMucGFyZW50ICkge1xuXHRcdFx0dGhpcy5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKCB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKCB0aGlzICksIDEgKTtcblx0XHRcdHRoaXMucGFyZW50LmZvbGRlcnMuc3BsaWNlKCB0aGlzLnBhcmVudC5mb2xkZXJzLmluZGV4T2YoIHRoaXMgKSwgMSApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5kb21FbGVtZW50LnBhcmVudEVsZW1lbnQgKSB7XG5cdFx0XHR0aGlzLmRvbUVsZW1lbnQucGFyZW50RWxlbWVudC5yZW1vdmVDaGlsZCggdGhpcy5kb21FbGVtZW50ICk7XG5cdFx0fVxuXG5cdFx0QXJyYXkuZnJvbSggdGhpcy5jaGlsZHJlbiApLmZvckVhY2goIGMgPT4gYy5kZXN0cm95KCkgKTtcblxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgY29udHJvbGxlcnMgY29udGFpbmVkIGJ5IHRoaXMgR1VJIGFuZCBpdHMgZGVzY2VuZGVudHMuXG5cdCAqIEByZXR1cm5zIHtDb250cm9sbGVyW119XG5cdCAqL1xuXHRjb250cm9sbGVyc1JlY3Vyc2l2ZSgpIHtcblx0XHRsZXQgY29udHJvbGxlcnMgPSBBcnJheS5mcm9tKCB0aGlzLmNvbnRyb2xsZXJzICk7XG5cdFx0dGhpcy5mb2xkZXJzLmZvckVhY2goIGYgPT4ge1xuXHRcdFx0Y29udHJvbGxlcnMgPSBjb250cm9sbGVycy5jb25jYXQoIGYuY29udHJvbGxlcnNSZWN1cnNpdmUoKSApO1xuXHRcdH0gKTtcblx0XHRyZXR1cm4gY29udHJvbGxlcnM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhbiBhcnJheSBvZiBmb2xkZXJzIGNvbnRhaW5lZCBieSB0aGlzIEdVSSBhbmQgaXRzIGRlc2NlbmRlbnRzLlxuXHQgKiBAcmV0dXJucyB7R1VJW119XG5cdCAqL1xuXHRmb2xkZXJzUmVjdXJzaXZlKCkge1xuXHRcdGxldCBmb2xkZXJzID0gQXJyYXkuZnJvbSggdGhpcy5mb2xkZXJzICk7XG5cdFx0dGhpcy5mb2xkZXJzLmZvckVhY2goIGYgPT4ge1xuXHRcdFx0Zm9sZGVycyA9IGZvbGRlcnMuY29uY2F0KCBmLmZvbGRlcnNSZWN1cnNpdmUoKSApO1xuXHRcdH0gKTtcblx0XHRyZXR1cm4gZm9sZGVycztcblx0fVxuXG59XG5cbmV4cG9ydCB7IEJvb2xlYW5Db250cm9sbGVyLCBDb2xvckNvbnRyb2xsZXIsIENvbnRyb2xsZXIsIEZ1bmN0aW9uQ29udHJvbGxlciwgR1VJLCBOdW1iZXJDb250cm9sbGVyLCBPcHRpb25Db250cm9sbGVyLCBTdHJpbmdDb250cm9sbGVyLCBHVUkgYXMgZGVmYXVsdCB9O1xuIiwiaW1wb3J0IHR5cGUgeyBBY3RpblN0YXRzIH0gZnJvbSBcIi4vdGVsZW1ldHJ5LWFuYWx5c2lzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBjbGFzc2lmeUNoZWNrcG9pbnQoczogQWN0aW5TdGF0cywgZml4ZWRBcmVhOiBib29sZWFuKTogXCJ2YWxpZFwiIHwgXCJjb250YWN0c1wiIHwgXCJmYXRhbFwiIHtcbiAgY29uc3QgZmluaXRlID0gW1xuICAgIHMuY2VsbC5hcmVhLFxuICAgIHMuY2VsbC5jZW50cm9pZFgsXG4gICAgcy5jZWxsLmNlbnRyb2lkWSxcbiAgICBzLmNlbGwubGVmdCxcbiAgICBzLmNlbGwucmlnaHQsXG4gICAgcy5jZWxsLnRvcCxcbiAgICBzLmNlbGwuYm90dG9tLFxuICAgIHMuYWN0aW5CYWxhbmNlRXJyb3IsXG4gICAgcy5pbnNpZGVQb2x5bWVyQmVhZHMsXG4gICAgcy5pblBvbHltZXIsXG4gICAgcy5jcm9zc2luZ0ZpbGFtZW50Qm9uZHMsXG4gICAgcy5icm9rZW5MaW5rcyxcbiAgICBzLmN5Y2xlcyxcbiAgXS5ldmVyeShOdW1iZXIuaXNGaW5pdGUpO1xuICBpZiAoXG4gICAgIWZpbml0ZSB8fFxuICAgIHMuY2VsbC5hcmVhIDw9IDAgfHxcbiAgICBzLmFjdGluQmFsYW5jZUVycm9yICE9PSAwIHx8XG4gICAgcy5icm9rZW5MaW5rcyAhPT0gMCB8fFxuICAgIHMuY3ljbGVzICE9PSAwIHx8XG4gICAgIU51bWJlci5pc0ludGVnZXIocy5pbnNpZGVQb2x5bWVyQmVhZHMpIHx8XG4gICAgIU51bWJlci5pc0ludGVnZXIocy5pblBvbHltZXIpIHx8XG4gICAgcy5pbnNpZGVQb2x5bWVyQmVhZHMgPCAwIHx8XG4gICAgcy5pbnNpZGVQb2x5bWVyQmVhZHMgPiBzLmluUG9seW1lciB8fFxuICAgICFOdW1iZXIuaXNJbnRlZ2VyKHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzKSB8fFxuICAgIHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzIDwgMCB8fFxuICAgIChmaXhlZEFyZWEgJiYgTWF0aC5hYnMocy5jZWxsLmFyZWEgLSAxKSA+IDAuMDAxKVxuICApXG4gICAgcmV0dXJuIFwiZmF0YWxcIjtcbiAgaWYgKHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzID09PSAwICYmIHMuaW5zaWRlUG9seW1lckJlYWRzID09PSBzLmluUG9seW1lcikgcmV0dXJuIFwidmFsaWRcIjtcbiAgLy8gQ291bnRzIGlkZW50aWZ5IHJlc2lkdWFsIGNvbnRhY3RzLCBub3QgY29ycnVwdGlvbi4gVGhlIHJlcGFpcidzIGRpc3BsYWNlbWVudCxcbiAgLy8gaXRlcmF0aW9uIGFuZCBlbGFwc2VkLXRpbWUgbGltaXRzIGRlY2lkZSB3aGV0aGVyIHRoZXNlIGNhbiBiZSBjb3JyZWN0ZWQuXG4gIHJldHVybiBcImNvbnRhY3RzXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja3BvaW50RGV0YWlscyhzOiBBY3RpblN0YXRzKSB7XG4gIHJldHVybiB7XG4gICAgc3RlcDogcy5zdGVwLFxuICAgIG1hc3M6IHMuYWN0aW5CYWxhbmNlRXJyb3IsXG4gICAgaW5zaWRlRjogcy5pbnNpZGVQb2x5bWVyQmVhZHMsXG4gICAgdG90YWxGOiBzLmluUG9seW1lcixcbiAgICBvdXRzaWRlRjogcy5pblBvbHltZXIgLSBzLmluc2lkZVBvbHltZXJCZWFkcyxcbiAgICBjcm9zc2luZ3M6IHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzLFxuICAgIGJyb2tlbkxpbmtzOiBzLmJyb2tlbkxpbmtzLFxuICAgIGN5Y2xlczogcy5jeWNsZXMsXG4gICAgYXJlYTogcy5jZWxsLmFyZWEsXG4gICAgY2VudHJvaWRYOiBzLmNlbGwuY2VudHJvaWRYLFxuICAgIGNlbnRyb2lkWTogcy5jZWxsLmNlbnRyb2lkWSxcbiAgfTtcbn1cblxudHlwZSBEZXBlbmRlbmNpZXMgPSB7XG4gIGluc3BlY3Q6ICgpID0+IFByb21pc2U8QWN0aW5TdGF0cz47XG4gIGJlZ2luOiAoKSA9PiBQcm9taXNlPHZvaWQ+O1xuICByZXBhaXI6IChpdGVyYXRpb25zOiBudW1iZXIpID0+IFByb21pc2U8bnVtYmVyPjtcbiAgcm9sbGJhY2s6ICgpID0+IFByb21pc2U8dm9pZD47XG4gIGRpc3Bvc2U6ICgpID0+IHZvaWQ7XG4gIGZpeGVkQXJlYTogKCkgPT4gYm9vbGVhbjtcbiAgbWF4RGlzcGxhY2VtZW50OiAoKSA9PiBudW1iZXI7XG4gIG5vdzogKCkgPT4gbnVtYmVyO1xuICBub3RpY2U6IChtZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQ7XG4gIGZhaWw6IChlcnJvcjogdW5rbm93bikgPT4gdm9pZDtcbn07XG5leHBvcnQgdHlwZSBSZWNvdmVyeVJlY29yZCA9IHtcbiAgdHJpZ2dlclN0ZXA6IG51bWJlcjtcbiAgY3VycmVudFN0ZXA/OiBudW1iZXI7XG4gIGluaXRpYWxDcm9zc2luZ3M6IG51bWJlcjtcbiAgaW5pdGlhbE91dHNpZGU6IG51bWJlcjtcbiAgbGF0ZXN0PzogUmV0dXJuVHlwZTx0eXBlb2YgY2hlY2twb2ludERldGFpbHM+O1xuICBwYXNzZXM6IG51bWJlcjtcbiAgb3V0Y29tZTogXCJjaGVja2luZ1wiIHwgXCJmcmVzaC1zdGF0ZS1jbGVhblwiIHwgXCJjb3JyZWN0ZWRcIiB8IFwiZmFpbGVkXCI7XG4gIG1heERpc3BsYWNlbWVudDogbnVtYmVyO1xuICBlbGFwc2VkTXM/OiBudW1iZXI7XG4gIGVycm9yPzogc3RyaW5nO1xufTtcblxuLy8gQ2FsbGVkIHN5bmNocm9ub3VzbHkgZnJvbSB0aGUgYXN5bmNocm9ub3VzIGRpYWdub3N0aWMgY2FsbGJhY2ssIGJ1dCBuZXZlclxuLy8gYXdhaXRlZCBieSB0aGF0IGNhbGxiYWNrLiBUaGUgYWN0aXZlIGZsYWcgZnJlZXplcyBuZXcgcGh5c2ljcyBzdWJtaXNzaW9ucy5cbmV4cG9ydCBjbGFzcyBDb250YWN0UmVjb3Zlcnkge1xuICBhY3RpdmUgPSBmYWxzZTtcbiAgcmVhZG9ubHkgaGlzdG9yeTogUmVjb3ZlcnlSZWNvcmRbXSA9IFtdO1xuICBwcml2YXRlIHBlbmRpbmc6IFByb21pc2U8dm9pZD4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBkZXBzOiBEZXBlbmRlbmNpZXM7XG4gIGNvbnN0cnVjdG9yKGRlcHM6IERlcGVuZGVuY2llcykge1xuICAgIHRoaXMuZGVwcyA9IGRlcHM7XG4gIH1cbiAgd2FpdCgpIHtcbiAgICByZXR1cm4gdGhpcy5wZW5kaW5nID8/IFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIHJlcXVlc3QodHJpZ2dlcjogQWN0aW5TdGF0cykge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkgcmV0dXJuIHRoaXMud2FpdCgpO1xuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZTtcbiAgICBjb25zdCBkID0gdGhpcy5kZXBzLFxuICAgICAgc3RhcnRlZCA9IGQubm93KCk7XG4gICAgY29uc3QgcmVjb3JkOiBSZWNvdmVyeVJlY29yZCA9IHtcbiAgICAgIHRyaWdnZXJTdGVwOiB0cmlnZ2VyLnN0ZXAsXG4gICAgICBpbml0aWFsQ3Jvc3NpbmdzOiB0cmlnZ2VyLmNyb3NzaW5nRmlsYW1lbnRCb25kcyxcbiAgICAgIGluaXRpYWxPdXRzaWRlOiB0cmlnZ2VyLmluUG9seW1lciAtIHRyaWdnZXIuaW5zaWRlUG9seW1lckJlYWRzLFxuICAgICAgcGFzc2VzOiAwLFxuICAgICAgb3V0Y29tZTogXCJjaGVja2luZ1wiLFxuICAgICAgbWF4RGlzcGxhY2VtZW50OiAwLFxuICAgIH07XG4gICAgdGhpcy5oaXN0b3J5LnB1c2gocmVjb3JkKTtcbiAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDMyKSB0aGlzLmhpc3Rvcnkuc2hpZnQoKTtcbiAgICBsZXQgYmFja2VkVXAgPSBmYWxzZTtcbiAgICBjb25zdCBjaGVja0J1ZGdldCA9ICgpID0+IHtcbiAgICAgIGlmIChkLm5vdygpIC0gc3RhcnRlZCA+IDUwMDApIHRocm93IEVycm9yKFwiQ29udGFjdCByZWNvdmVyeSBleGNlZWRlZCBpdHMgdGltZSBidWRnZXRcIik7XG4gICAgfTtcbiAgICBjb25zdCBydW4gPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBkLm5vdGljZShgUmVjaGVja2luZyBjb250YWN0czogJHtyZWNvcmQuaW5pdGlhbE91dHNpZGV9IG91dHNpZGUgYmVhZChzKSwgJHt0cmlnZ2VyLmNyb3NzaW5nRmlsYW1lbnRCb25kc30gY3Jvc3NpbmcocynigKZgKTtcbiAgICAgICAgbGV0IHN0YXRlID0gYXdhaXQgZC5pbnNwZWN0KCk7XG4gICAgICAgIHJlY29yZC5sYXRlc3QgPSBjaGVja3BvaW50RGV0YWlscyhzdGF0ZSk7XG4gICAgICAgIGNoZWNrQnVkZ2V0KCk7XG4gICAgICAgIHJlY29yZC5jdXJyZW50U3RlcCA9IHN0YXRlLnN0ZXA7XG4gICAgICAgIGxldCBraW5kID0gY2xhc3NpZnlDaGVja3BvaW50KHN0YXRlLCBkLmZpeGVkQXJlYSgpKTtcbiAgICAgICAgaWYgKGtpbmQgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgIHJlY29yZC5vdXRjb21lID0gXCJmcmVzaC1zdGF0ZS1jbGVhblwiO1xuICAgICAgICAgIGQubm90aWNlKFwiQ3VycmVudCBzdGF0ZSB2ZXJpZmllZDsgY29udGludWluZy5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChraW5kICE9PSBcImNvbnRhY3RzXCIpIHRocm93IEVycm9yKGBDdXJyZW50IHN0YXRlIGhhcyBhIG5vbi1jb250YWN0IGludmFyaWFudCBmYWlsdXJlOiAke0pTT04uc3RyaW5naWZ5KHJlY29yZC5sYXRlc3QpfWApO1xuICAgICAgICBhd2FpdCBkLmJlZ2luKCk7XG4gICAgICAgIGJhY2tlZFVwID0gdHJ1ZTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVyYXRpb25zIG9mIFs0LCA4LCAxNiwgMzJdKSB7XG4gICAgICAgICAgY2hlY2tCdWRnZXQoKTtcbiAgICAgICAgICBkLm5vdGljZShgQ29ycmVjdGluZyBjb250YWN0IHJlc2lkdWFscyAoJHtyZWNvcmQucGFzc2VzICsgaXRlcmF0aW9uc30gZXh0cmEgcGFzc2VzKeKApmApO1xuICAgICAgICAgIHJlY29yZC5tYXhEaXNwbGFjZW1lbnQgPSBhd2FpdCBkLnJlcGFpcihpdGVyYXRpb25zKTtcbiAgICAgICAgICByZWNvcmQucGFzc2VzICs9IGl0ZXJhdGlvbnM7XG4gICAgICAgICAgaWYgKCFOdW1iZXIuaXNGaW5pdGUocmVjb3JkLm1heERpc3BsYWNlbWVudCkgfHwgcmVjb3JkLm1heERpc3BsYWNlbWVudCA+IGQubWF4RGlzcGxhY2VtZW50KCkpXG4gICAgICAgICAgICB0aHJvdyBFcnJvcihcIkNvbnRhY3QgY29ycmVjdGlvbiBleGNlZWRlZCBpdHMgZGlzcGxhY2VtZW50IGJ1ZGdldFwiKTtcbiAgICAgICAgICBzdGF0ZSA9IGF3YWl0IGQuaW5zcGVjdCgpO1xuICAgICAgICAgIHJlY29yZC5sYXRlc3QgPSBjaGVja3BvaW50RGV0YWlscyhzdGF0ZSk7XG4gICAgICAgICAgY2hlY2tCdWRnZXQoKTtcbiAgICAgICAgICBpZiAoc3RhdGUuc3RlcCAhPT0gcmVjb3JkLmN1cnJlbnRTdGVwKSB0aHJvdyBFcnJvcihcIlBoeXNpY3MgYWR2YW5jZWQgZHVyaW5nIGNvbnRhY3QgcmVjb3ZlcnlcIik7XG4gICAgICAgICAga2luZCA9IGNsYXNzaWZ5Q2hlY2twb2ludChzdGF0ZSwgZC5maXhlZEFyZWEoKSk7XG4gICAgICAgICAgaWYgKGtpbmQgPT09IFwidmFsaWRcIikge1xuICAgICAgICAgICAgcmVjb3JkLm91dGNvbWUgPSBcImNvcnJlY3RlZFwiO1xuICAgICAgICAgICAgZC5ub3RpY2UoYENvbnRhY3RzIGNvcnJlY3RlZCBhbmQgdmVyaWZpZWQgKCR7cmVjb3JkLnBhc3Nlc30gcGFzc2VzKS5gKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGtpbmQgIT09IFwiY29udGFjdHNcIikgdGhyb3cgRXJyb3IoYENvbnRhY3QgY29ycmVjdGlvbiBjaGFuZ2VkIGFub3RoZXIgaW52YXJpYW50OiAke0pTT04uc3RyaW5naWZ5KHJlY29yZC5sYXRlc3QpfWApO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IEVycm9yKGBDb250YWN0IGNvcnJlY3Rpb24gZGlkIG5vdCBjb252ZXJnZSB3aXRoaW4gNjAgZXh0cmEgcGFzc2VzOiAke0pTT04uc3RyaW5naWZ5KHJlY29yZC5sYXRlc3QpfWApO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgcmVjb3JkLm91dGNvbWUgPSBcImZhaWxlZFwiO1xuICAgICAgICByZWNvcmQuZXJyb3IgPSBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6IFN0cmluZyhlcnJvcik7XG4gICAgICAgIGlmIChiYWNrZWRVcCkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBkLnJvbGxiYWNrKCk7XG4gICAgICAgICAgfSBjYXRjaCAocm9sbGJhY2tFcnJvcikge1xuICAgICAgICAgICAgcmVjb3JkLmVycm9yICs9IGA7IHJvbGxiYWNrIGZhaWxlZDogJHtTdHJpbmcocm9sbGJhY2tFcnJvcil9YDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZC5mYWlsKG5ldyBFcnJvcihyZWNvcmQuZXJyb3IpKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGQuZGlzcG9zZSgpO1xuICAgICAgICByZWNvcmQuZWxhcHNlZE1zID0gZC5ub3coKSAtIHN0YXJ0ZWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcbiAgICB0aGlzLnBlbmRpbmcgPSBydW4oKTtcbiAgICByZXR1cm4gdGhpcy5wZW5kaW5nO1xuICB9XG59XG4iLCJpbXBvcnQgeyBwb2x5Z29uT2NjdXBhbmN5LCBwb2x5Z29uQm9uZENyb3NzaW5nIH0gZnJvbSBcIi4vb2NjdXBhbmN5XCI7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0ZXN0RW5jbG9zdXJlKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYnVmZmVyczogeyBhY3RpbjogR1BVQnVmZmVyOyBtZW1icmFuZTogR1BVQnVmZmVyIH0sXG4gIGNvdW50czogeyBhY3RpbjogbnVtYmVyOyBtZW1icmFuZTogbnVtYmVyIH0sXG4gIGRpc3BhdGNoOiAoKSA9PiB2b2lkLFxuICBjb25maWd1cmU6IChmaXhlZEFyZWE6IGJvb2xlYW4sIHJlZmVyZW5jZUFyZWE6IG51bWJlcikgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IGNoZWNrczogeyBuYW1lOiBzdHJpbmc7IHBhc3NlZDogYm9vbGVhbiB9W10gPSBbXTtcbiAgY29uc3QgYXNzZXJ0ID0gKG5hbWU6IHN0cmluZywgY29uZGl0aW9uOiBib29sZWFuKSA9PiB7XG4gICAgY2hlY2tzLnB1c2goeyBuYW1lLCBwYXNzZWQ6IGNvbmRpdGlvbiB9KTtcbiAgICBpZiAoIWNvbmRpdGlvbikgdGhyb3cgbmV3IEVycm9yKGBFbmNsb3N1cmUgZml4dHVyZSBmYWlsZWQ6ICR7bmFtZX1gKTtcbiAgfTtcbiAgY29uc3QgcmVhZCA9IGFzeW5jIChidWZmZXI6IEdQVUJ1ZmZlcikgPT4ge1xuICAgIGNvbnN0IHN0YWdlID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IGJ1ZmZlci5zaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoYnVmZmVyLCAwLCBzdGFnZSwgMCwgYnVmZmVyLnNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBzdGFnZS5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IGRhdGEgPSBzdGFnZS5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApO1xuICAgIHN0YWdlLnVubWFwKCk7XG4gICAgc3RhZ2UuZGVzdHJveSgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuICBjb25zdCBydW4gPSBhc3luYyAocG9seWdvbjogbnVtYmVyW11bXSwgcG9pbnRzOiBudW1iZXJbXVtdLCBmaXhlZEFyZWEgPSBmYWxzZSwgcmVmZXJlbmNlQXJlYSA9IDQwMCkgPT4ge1xuICAgIGNvbnN0IG1lbSA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLnNpemUpLFxuICAgICAgbWYgPSBuZXcgRmxvYXQzMkFycmF5KG1lbSksXG4gICAgICBtdSA9IG5ldyBVaW50MzJBcnJheShtZW0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLm1lbWJyYW5lOyBpKyspIHtcbiAgICAgIC8vIERlbnNlIGhvcml6b250YWwgZWRnZXMgYWxzbyBvdmVyZmxvdyB0aGUgc2hvcnRsaXN0cywgZXhlcmNpc2luZyB0aGVpclxuICAgICAgLy8gY29tcGxldGUtcG9seWdvbiBmYWxsYmFjayByYXRoZXIgdGhhbiBvbmx5IHNwYXJzZSBoYXBweS1wYXRoIGJpbnMuXG4gICAgICBjb25zdCBhdCA9IChpICogcG9seWdvbi5sZW5ndGgpIC8gY291bnRzLm1lbWJyYW5lO1xuICAgICAgY29uc3QgZWRnZSA9IE1hdGguZmxvb3IoYXQpO1xuICAgICAgY29uc3QgYSA9IHBvbHlnb25bZWRnZV0sXG4gICAgICAgIGIgPSBwb2x5Z29uWyhlZGdlICsgMSkgJSBwb2x5Z29uLmxlbmd0aF07XG4gICAgICBjb25zdCBwID0gW2FbMF0gKyAoYlswXSAtIGFbMF0pICogKGF0IC0gZWRnZSksIGFbMV0gKyAoYlsxXSAtIGFbMV0pICogKGF0IC0gZWRnZSldO1xuICAgICAgbXVbaSAqIDEwXSA9IGk7XG4gICAgICBtdVtpICogMTAgKyA2XSA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtdVtpICogMTAgKyA3XSA9IChpICsgY291bnRzLm1lbWJyYW5lIC0gMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgICBtZltpICogMTAgKyAyXSA9IHBbMF07XG4gICAgICBtZltpICogMTAgKyAzXSA9IHBbMV07XG4gICAgfVxuICAgIGNvbnN0IGFjdGluID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMuYWN0aW4uc2l6ZSksXG4gICAgICBhZiA9IG5ldyBGbG9hdDMyQXJyYXkoYWN0aW4pLFxuICAgICAgYXUgPSBuZXcgVWludDMyQXJyYXkoYWN0aW4pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLmFjdGluOyBpKyspIHtcbiAgICAgIGF1W2kgKiAxMF0gPSBhdVtpICogMTAgKyA2XSA9IGF1W2kgKiAxMCArIDddID0gaTtcbiAgICB9XG4gICAgcG9pbnRzLmZvckVhY2goKFt4LCB5XSwgaSkgPT4ge1xuICAgICAgYWZbaSAqIDEwICsgMl0gPSB4O1xuICAgICAgYWZbaSAqIDEwICsgM10gPSB5O1xuICAgICAgYXVbaSAqIDEwICsgNl0gPSBpID09PSAwID8gMCA6IGkgLSAxO1xuICAgICAgYXVbaSAqIDEwICsgN10gPSBpID09PSBwb2ludHMubGVuZ3RoIC0gMSA/IGkgOiBpICsgMTtcbiAgICB9KTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5tZW1icmFuZSwgMCwgbWVtKTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5hY3RpbiwgMCwgYWN0aW4pO1xuICAgIGNvbmZpZ3VyZShmaXhlZEFyZWEsIHJlZmVyZW5jZUFyZWEpO1xuICAgIGRpc3BhdGNoKCk7XG4gICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICByZXR1cm4geyBhY3RpbjogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKSwgbWVtYnJhbmU6IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLm1lbWJyYW5lKSkgfTtcbiAgfTtcbiAgbGV0IHJlc3VsdCA9IGF3YWl0IHJ1bihcbiAgICBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbMjAsIDBdLFxuICAgICAgWzIwLCAyMF0sXG4gICAgICBbMCwgMjBdLFxuICAgIF0sXG4gICAgW1xuICAgICAgWzI1LCAxXSxcbiAgICAgIFsyNiwgMV0sXG4gICAgXVxuICApO1xuICBsZXQgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShyZXN1bHQubWVtYnJhbmUsIDEwLCB0cnVlKTtcbiAgYXNzZXJ0KFwiZXNjYXBlZCBmaWxhbWVudCBiZWFkcyBhcmUgcHJvamVjdGVkIGluc2lkZVwiLCBpbnNpZGUocmVzdWx0LmFjdGluWzJdLCByZXN1bHQuYWN0aW5bM10pICYmIGluc2lkZShyZXN1bHQuYWN0aW5bMTJdLCByZXN1bHQuYWN0aW5bMTNdKSk7XG4gIGxldCB3b3JkcyA9IG5ldyBVaW50MzJBcnJheShyZXN1bHQuYWN0aW4uYnVmZmVyKTtcbiAgYXNzZXJ0KFxuICAgIFwiY29udGFjdCBwcmVzZXJ2ZXMgY29ubmVjdGl2aXR5IGFuZCBmaW5pdGUgcmVzZXJ2b2lyIGFtb3VudFwiLFxuICAgIHdvcmRzWzddID09PSAxICYmXG4gICAgICB3b3Jkc1sxNl0gPT09IDAgJiZcbiAgICAgIEFycmF5LmZyb20oeyBsZW5ndGg6IGNvdW50cy5hY3RpbiAtIDIgfSwgKF8sIGspID0+IGsgKyAyKS5ldmVyeSgoaSkgPT4gd29yZHNbaSAqIDEwICsgNl0gPT09IGkgJiYgd29yZHNbaSAqIDEwICsgN10gPT09IGkpXG4gICk7XG4gIHJlc3VsdCA9IGF3YWl0IHJ1bihcbiAgICBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbOCwgMF0sXG4gICAgICBbOCwgM10sXG4gICAgICBbMywgM10sXG4gICAgICBbMywgOF0sXG4gICAgICBbMCwgOF0sXG4gICAgXSxcbiAgICBbXG4gICAgICBbNywgMV0sXG4gICAgICBbMSwgN10sXG4gICAgXVxuICApO1xuICBpbnNpZGUgPSBwb2x5Z29uT2NjdXBhbmN5KHJlc3VsdC5tZW1icmFuZSwgMTAsIHRydWUpO1xuICBjb25zdCBjcm9zc2luZyA9IHBvbHlnb25Cb25kQ3Jvc3NpbmcocmVzdWx0Lm1lbWJyYW5lKTtcbiAgYXNzZXJ0KFxuICAgIFwiaW50ZXJpb3IgZW5kcG9pbnRzIGNhbm5vdCBicmlkZ2UgYWNyb3NzIGEgY29uY2F2ZSBleHRlcmlvclwiLFxuICAgIGluc2lkZShyZXN1bHQuYWN0aW5bMTJdLCByZXN1bHQuYWN0aW5bMTNdKSAmJiAhY3Jvc3NpbmcocmVzdWx0LmFjdGluWzJdLCByZXN1bHQuYWN0aW5bM10sIHJlc3VsdC5hY3RpblsxMl0sIHJlc3VsdC5hY3RpblsxM10pXG4gICk7XG4gIHJlc3VsdCA9IGF3YWl0IHJ1bihcbiAgICBbXG4gICAgICBbMCwgMF0sXG4gICAgICBbMjAsIDBdLFxuICAgICAgWzIwLCAyMF0sXG4gICAgICBbMCwgMjBdLFxuICAgIF0sXG4gICAgW10sXG4gICAgdHJ1ZSxcbiAgICA5MDBcbiAgKTtcbiAgbGV0IGFyZWEyID0gMCxcbiAgICBjeCA9IDAsXG4gICAgY3kgPSAwO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5tZW1icmFuZTsgaSsrKSB7XG4gICAgY29uc3QgaiA9IChpICsgMSkgJSBjb3VudHMubWVtYnJhbmU7XG4gICAgY29uc3QgYXggPSByZXN1bHQubWVtYnJhbmVbaSAqIDEwICsgMl0sXG4gICAgICBheSA9IHJlc3VsdC5tZW1icmFuZVtpICogMTAgKyAzXTtcbiAgICBjb25zdCBieCA9IHJlc3VsdC5tZW1icmFuZVtqICogMTAgKyAyXSxcbiAgICAgIGJ5ID0gcmVzdWx0Lm1lbWJyYW5lW2ogKiAxMCArIDNdO1xuICAgIGNvbnN0IGNyb3NzID0gYXggKiBieSAtIGF5ICogYng7XG4gICAgYXJlYTIgKz0gY3Jvc3M7XG4gICAgY3ggKz0gKGF4ICsgYngpICogY3Jvc3M7XG4gICAgY3kgKz0gKGF5ICsgYnkpICogY3Jvc3M7XG4gIH1cbiAgYXNzZXJ0KFwiYXJlYSBjbG9zdXJlIHJlYWNoZXMgdGhlIGRlY2xhcmVkIHJlZmVyZW5jZSBhcmVhXCIsIE1hdGguYWJzKGFyZWEyIC8gMiAtIDkwMCkgPCAwLjAyKTtcbiAgYXNzZXJ0KFwiYXJlYSBjbG9zdXJlIHByZXNlcnZlcyB0aGUgY3VycmVudCBnZW9tZXRyaWMgY2VudHJvaWRcIiwgTWF0aC5hYnMoY3ggLyAoMyAqIGFyZWEyKSAtIDEwKSA8IDAuMDAxICYmIE1hdGguYWJzKGN5IC8gKDMgKiBhcmVhMikgLSAxMCkgPCAwLjAwMSk7XG4gIHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KHJlc3VsdC5hY3Rpbi5idWZmZXIpO1xuICBhc3NlcnQoXG4gICAgXCJnZW9tZXRyeSBjaGFuZ2VzIGRvIG5vdCBtYW51ZmFjdHVyZSBvciBkaXNjYXJkIEctYWN0aW5cIixcbiAgICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBjb3VudHMuYWN0aW4gfSwgKF8sIGkpID0+IGkpLmV2ZXJ5KChpKSA9PiB3b3Jkc1tpICogMTAgKyA2XSA9PT0gaSAmJiB3b3Jkc1tpICogMTAgKyA3XSA9PT0gaSlcbiAgKTtcbiAgcmV0dXJuIGNoZWNrcztcbn1cbiIsImltcG9ydCBHVUkgZnJvbSBcImxpbC1ndWlcIjtcbmltcG9ydCB7IHJlcXVlc3REZXZpY2UsIGNvbmZpZ3VyZUNhbnZhcywgY3JlYXRlU2hhZGVyLCBzZXR1cEludGVyYWN0aW9ucywgc2V0dXBUZXh0dXJlcywgZ2V0UmFuZG9tVmFsdWVzIH0gZnJvbSBcIi4vdXRpbHNcIjtcbmltcG9ydCByZW5kZXJDb2RlIGZyb20gXCIuL3NoYWRlcnMvcmVuZGVyLndnc2xcIjtcbmltcG9ydCBzaW11bGF0ZUNvZGUgZnJvbSBcIi4vc2hhZGVycy9zaW11bGF0ZS53Z3NsXCI7XG5pbXBvcnQgeyBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzLCBydW5TaW11bGF0aW9uU3RlcCwgcnVuRW5jbG9zdXJlLCBydW5Db250YWN0UmVwYWlyIH0gZnJvbSBcIi4vc2ltdWxhdGVcIjtcbmltcG9ydCB7IENvbnRhY3RSZWNvdmVyeSwgY2xhc3NpZnlDaGVja3BvaW50IH0gZnJvbSBcIi4vY29udGFjdC1yZWNvdmVyeVwiO1xuXG4vLyBJbXBvcnQgc2hhZGVyIGluY2x1ZGVzXG5pbXBvcnQgYmluZGluZ3NDb2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYmluZGluZ3Mud2dzbFwiO1xuaW1wb3J0IHRleHR1cmVzQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL3RleHR1cmVzLndnc2xcIjtcbmltcG9ydCBidWZmZXJzQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL2J1ZmZlcnMud2dzbFwiO1xuaW1wb3J0IHJhbmRvbUNvZGUgZnJvbSBcIi4vc2hhZGVycy9pbmNsdWRlcy9yYW5kb20ud2dzbFwiO1xuaW1wb3J0IGFjdG9teW9zaW5Db2RlIGZyb20gXCIuL3NoYWRlcnMvaW5jbHVkZXMvYWN0b215b3Npbi53Z3NsXCI7XG5pbXBvcnQgZW5jbG9zdXJlQ29kZSBmcm9tIFwiLi9zaGFkZXJzL2luY2x1ZGVzL2VuY2xvc3VyZS53Z3NsXCI7XG5pbXBvcnQgeyBSZW5kZXJNb2R1bGUgfSBmcm9tIFwiLi9yZW5kZXJcIjtcbmltcG9ydCB7IFNwcm91dFNjaGVkdWxlciwgTUFYX1NQUk9VVF9TSVRFUyB9IGZyb20gXCIuL3Nwcm91dHNcIjtcbmltcG9ydCB7IEFjdGluVGVsZW1ldHJ5IH0gZnJvbSBcIi4vdGVsZW1ldHJ5XCI7XG5pbXBvcnQgeyBzZWVkZWRSYW5kb20gfSBmcm9tIFwiLi9yYW5kb21cIjtcbmltcG9ydCB7IHRlc3RNZWNoYW5pY3MgfSBmcm9tIFwiLi9tZWNoYW5pY3MtdGVzdFwiO1xuaW1wb3J0IHsgdGVzdEVuY2xvc3VyZSB9IGZyb20gXCIuL2VuY2xvc3VyZS10ZXN0XCI7XG5pbXBvcnQgeyB0ZXN0UmVuZXdhbCB9IGZyb20gXCIuL3JlbmV3YWwtdGVzdFwiO1xuaW1wb3J0IHsgRnJhbWVCdWRnZXQsIExpdmVQZXJmb3JtYW5jZSB9IGZyb20gXCIuL3JlYWx0aW1lXCI7XG5cbi8vIFNoYWRlciBpbmNsdWRlcyBtYXBwaW5nXG5jb25zdCBzaGFkZXJJbmNsdWRlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgYmluZGluZ3M6IGJpbmRpbmdzQ29kZSxcbiAgdGV4dHVyZXM6IHRleHR1cmVzQ29kZSxcbiAgYnVmZmVyczogYnVmZmVyc0NvZGUsXG4gIHJhbmRvbTogcmFuZG9tQ29kZSxcbiAgYWN0b215b3NpbjogYWN0b215b3NpbkNvZGUsXG4gIGVuY2xvc3VyZTogZW5jbG9zdXJlQ29kZSxcbn07XG5cbi8vIFNpemVzIGluIGJ5dGVzIC0gdXNlZnVsIGZvciBjYWxjdWxhdGluZyBidWZmZXIgc2l6ZXMgYW5kIG9mZnNldHNcbmNvbnN0IHNpemUzMiA9IDQ7IC8vIHNpemUgb2YgYSAzMi1iaXQgZmxvYXQgb3IgaW50XG5cbi8vIFVuaWZvcm0gdmFsdWVzIGNvbnRhaW5lclxuY29uc3QgdW5pZm9ybXMgPSB7XG4gIGNvbXB1dGVTdGVwc1BlckZyYW1lOiA0LFxuICB0YXJnZXRGUFM6IDYwLFxuICBzaW11bGF0aW9uU2NhbGU6IDEuMCwgLy8gdGV4dHVyZSBwaXhlbHMgcGVyIHNjcmVlbiAoQ1NTKSBwaXhlbDsgdGhlIGNlbGwgc2NhbGVzIHdpdGggaXQgaW4gcGl4ZWxzLCBzbyBpdCBsb29rcyB0aGUgc2FtZSBzaXplIG9uIHNjcmVlblxuICBhY3RpbkNvdW50OiAxICogMjU2ICogMjU2LCAvLyA0MDAwIGlzIG1pbmltdW0gZm9yIG5pY2UgYWN0aW9uLlxuICBtZW1icmFuZUNvdW50OiA2ICogMjU2LFxuICBzdGlmZm5lc3M6IDAuNSxcbiAgZm9vZE5lYXJieVRocmVzaG9sZDogMC4wMDEsXG4gIGRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eTogMC4wMDYsXG4gIG1vbm9tZXJNZW1icmFuZVJlcHVsc2lvbjogMC4wOSwgLy8gaG93IGhhcmQgbW9ub21lcnMgYXJlIHB1c2hlZCBvZmYgdGhlIG1lbWJyYW5lOiAxLjAgbGVhdmVzIGEgfjggcHggZ2FwLCAwLjEgYWJvdXQgNCBweFxuICBwb2x5bWVyUmVwdWxzaW9uOiAwLjQyMixcbiAgc3RlcmljU2FtcGxpbmdSYW5nZTogMixcbiAgYWN0aW5Db2hlc2lvblJhbmdlOiAxLFxuICBiaW5kUHJvYjogMC4wMyxcbiAgYmluZExlbmd0aEZsb29yOiAyLCAvLyBmaWxhbWVudHMgc2hvcnRlciB0aGFuIHRoaXMgYmluZCBhdCBiaW5kUHJvYiAqIHRoaXMgKGEgbG9uZSBtb25vbWVyIGF0IGJpbmRQcm9iKTsgbG9uZ2VyIG9uZXMgYXQgYmluZFByb2IgKiBsZW5ndGhcbiAgYmluZExlbmd0aFNhdHVyYXRpb246IDIwLCAvLyBmaWxhbWVudHMgbG9uZ2VyIHRoYW4gdGhpcyBiaW5kIG5vIG1vcmUgcmVhZGlseSAobWF4IDY0KVxuICBhY3RpblN0ZXJpY0ZvcmNlOiAwLjIsXG4gIGVxdWlsaWJyaXVtTGluZURpc3RhbmNlOiAyLjAsIC8vIGFjdGluIHJlc3QgbGVuZ3RoIGluIHBpeGVsczsgc2V0cyBmaWxhbWVudCBzcGFjaW5nIG5vdyB0aGF0IGEgZmlsYW1lbnQgZG9lc24ndCByZXBlbCBpdHNlbGZcbiAgbW92ZW1lbnRNb2RlOiAwLCAvLyBJZGxlOiBwb2x5bWVyaXphdGlvbiBvbmx5IGNvbWVzIGZyb20gdGhlIHNwcm91dCBzaXRlc1xuICBtZW1icmFuZVJlc3RMZW5ndGg6IDIuMCAvIDMuMCwgLy8gd2l0aCA2eCB0aGUgb3JpZ2luYWwgMjU2IG5vZGVzIGF0IHJlc3QgbGVuZ3RoIDIgdGhlIGNlbGwgaXMgMnggd2lkZXIgaW4gcGl4ZWxzLCBtYXRjaGluZyBzaW11bGF0aW9uU2NhbGVcbiAgbWVtYnJhbmVTdGlmZm5lc3M6IDMuMCwgLy8gaG93IGhhcmQgYSBzdHJldGNoZWQgbWVtYnJhbmUgcHVsbHMgaW4sIGFsb25nIGl0cyBjdXJ2YXR1cmVcbiAgbGFtZWxsaXBvZGl1bVN0cmVuZ3RoOiAwLjE1LCAvLyBwb2x5bWVyaXphdGlvbiBmaWVsZCBlbWl0dGVkIGJ5IHRoZSBmcm9udCBvZiB0aGUgbWVtYnJhbmUsIHdoZXJlIGZpbGFtZW50cyBhbHNvIGJyYW5jaDsgMCA9IG9mZlxuICBsYW1lbGxpcG9kaXVtV2lkdGg6IDAuMDM2LCAvLyBmcmFjdGlvbiBvZiB0aGUgbWVtYnJhbmUsIGNlbnRlcmVkIG9uIHRoZSBmcm9udCAodGhlIHJpZ2h0IHNpZGUgYXQgcmVzZXQpLCB0aGF0IGVtaXRzIGl0XG4gIGxhbWVsbGlwb2RpdW1GaWVsZERlY2F5OiAwLjk4LCAvLyBwZXItc3RlcCBkZWNheSBvZiB0aGF0IGZpZWxkXG4gIGJyYW5jaFByb2JhYmlsaXR5OiAwLjAxLCAvLyBwZXIgc3RlcCwgZm9yIGEgbW9ub21lciBuZXh0IHRvIGEgZmlsYW1lbnQgaW4gdGhlIGxhbWVsbGlwb2RpdW0gZmllbGQgYXQgc3RyZW5ndGggMVxuICBkZWJyYW5jaFByb2JhYmlsaXR5OiAwLjAwMDUsIC8vIHBlciBzdGVwLCBmb3IgZWFjaCBicmFuY2ggdG8gY29tZSBvZmYgaXRzIG1vdGhlciBmaWxhbWVudFxuICBhY3RpbkJlbmRTdGlmZm5lc3M6IDQuMCwgLy8gaG93IGZhc3QgYW4gYWN0aW4ncyBkaXJlY3RvciB0dXJucyB0b3dhcmQgaXRzIG5laWdoYm91cnMnIChDb3NzZXJhdCBiZW5kaW5nKTsgMCA9IGZsb3BweVxuICBhY3RpbkNvc3NlcmF0SXRlcmF0aW9uczogOCwgLy8gQ29zc2VyYXQgcGFzc2VzIHBlciBzaW11bGF0aW9uIHN0ZXA7IG1vcmUgPSBzdGlmZmVyLCBzdHJhaWdodGVucyBsb25nIGZpbGFtZW50cyBmYXN0ZXJcbiAgc3RlcmljU2VsZk5laWdoYm9yczogNiwgLy8gZmlsYW1lbnQgbmVpZ2hib3VycyBvbiBlYWNoIHNpZGUgdGhhdCBkb24ndCByZXBlbCBhbiBhY3RpbiAobWF4IDEyKTsgdGhlIHJlc3QgbGVuZ3RoIHNwYWNlcyB0aGVtXG4gIG1lbWJyYW5lRmxvdzogMC41LCAvLyBob3cgZmFzdCBtZW1icmFuZSBzbGlkZXMgdG93YXJkIHN0cmV0Y2hlZCByZWdpb25zICh0YW5nZW50aWFsIHNwYWNpbmcgZXF1YWxpemF0aW9uKVxuICBtZW1icmFuZUZsb3dJdGVyYXRpb25zOiA4LCAvLyB0YW5nZW50aWFsIGZsb3cgcGFzc2VzIHBlciBzaW11bGF0aW9uIHN0ZXBcbiAgbWVtYnJhbmVTbW9vdGhpbmc6IDAuMDIsIC8vIHB1bGwgdG93YXJkIHRoZSBuZWlnaGJvdXJzJyBtaWRwb2ludCBwZXIgc3RlcDsgcmVsYXhlcyBpZGxlIHByb3RydXNpb25zIGFuZCBjdXNwc1xuICBwb2x5bWVyaXphdGlvblBhdGNoU2l6ZTogMC4wMiwgLy8gZnJhY3Rpb24gb2YgdGhlIG1lbWJyYW5lIHRoYXQgcG9seW1lcml6ZXMgaW4gTW92ZSBFYXN0IG1vZGVcbiAgcG9seW1lcml6YXRpb25GaWVsZERlY2F5OiAwLjk1LCAvLyBwZXItc3RlcCBkZWNheSBvZiB0aGUgcG9seW1lcml6YXRpb24gZmllbGQ7IGxvd2VyID0gbW9yZSBsb2NhbCA9IHRoaW5uZXIgcHJvdHJ1c2lvbnNcbiAgc3Byb3V0Q291bnQ6IDYsIC8vIG1heCBudW1iZXIgb2Ygc2hvcnQtbGl2ZWQgcG9seW1lcml6YXRpb24gc2l0ZXMgYXQgb25jZVxuICBzcHJvdXRXaWR0aDogMSwgLy8gbWVtYnJhbmUgbm9kZXMgY292ZXJlZCBieSBvbmUgc2l0ZVxuICBzcHJvdXRGcm9udEJpYXM6IDAuNzUsIC8vIGZyYWN0aW9uIG9mIHNpdGVzIHBsYWNlZCBuZWFyIHRoZSBmcm9udCwgdGhlIHJlc3QgYW55d2hlcmUgaW4gdGhlIGZyb250IDMwJVxuICBzcHJvdXRPblN0ZXBzOiA2MDAwLCAvLyBhdmVyYWdlIHNpbXVsYXRpb24gc3RlcHMgYSBzaXRlIHN0YXlzIG9uXG4gIHNwcm91dE9mZlN0ZXBzOiAxNTAwLCAvLyBhdmVyYWdlIHNpbXVsYXRpb24gc3RlcHMgYSBzaXRlIHN0YXlzIG9mZlxuICBteW9zaW5TdHJlbmd0aDogMCwgLy8gb3B0LWluIHVudGlsIG1hdGNoZWQgY29tcGFyaXNvbnMgZXN0YWJsaXNoIGEgYmVuZWZpdFxuICBteW9zaW5TcGVlZDogMC4wMixcbiAgbWVtYnJhbmVDb3VwbGluZzogMCxcbiAgc3Vic3RyYXRlRHJhZzogNCxcbiAgY29ydGV4UG9seW1lcml6YXRpb246IDAsIC8vIGRpc3RpbmN0IG9wdGlvbmFsIGh5cG90aGVzaXM6IGEgcG9zdGVyaW9yIGFjdGluIHN1YnN0cmF0ZVxuICBtb25vbWVyT3BhY2l0eTogMC4yLCAvLyB2aXN1YWwgb25seToga2VlcCB0aGUgZXhwbGljaXQgZmlsYW1lbnRzIGxlZ2libGVcbiAgZ0FjdGluRmllbGQ6IDEsIC8vIGZpbml0ZSB3ZWxsLW1peGVkIHBvb2wgcGx1cyBleHBsaWNpdC1maWxhbWVudCBjb250YWlubWVudFxuICBhcmVhQ29uc2VydmF0aW9uOiAxLCAvLyBpbXBvc2VkIGFyZWEsIGEgMi1EIHZvbHVtZSBzdXJyb2dhdGUsIG5vdCBtZWFzdXJlZCBwcmVzc3VyZVxuICBhZGFwdGl2ZUZyYW1lczogMSxcbiAgY3VlWDogMCxcbiAgY3VlWTogMCxcbiAgY3VlRW5hYmxlZDogMCxcbiAgcG9sYXJpdHlNb2RlOiAwLFxuICBwb2xhcml0eVR1cm5SYXRlOiAwLjAyLFxuICByZWFyVHVybm92ZXI6IDAsXG4gIHR1cm5vdmVyQWdlOiA1MDAsXG4gIHRldGhlclR1cm5vdmVyOiAwLFxuICB0ZXRoZXJPblJhdGU6IDAuMDIsXG4gIHRldGhlck9mZlJhdGU6IDAuMDAyLFxuICB0ZXRoZXJSZWNvdmVyeVN0ZXBzOiA0MCxcbiAgbW90b3JSZWFyQmlhczogMCxcbiAgZnJvbnRBbGlnbm1lbnQ6IDAsXG4gIHRldGhlckxvYWRPZmY6IDAuMDAyLFxuICBjb2xvdXJBZ2U6IDAsXG59O1xuXG4vLyBudW1lcmljIHVuaWZvcm1zIGNhbiBiZSBvdmVycmlkZGVuIGZyb20gdGhlIFVSTCwgZS5nLiA/YmluZFByb2I9MC4wNSZlcXVpbGlicml1bUxpbmVEaXN0YW5jZT0yOyA/cnVuPW5hbWUgbGFiZWxzIHRoZSB0ZWxlbWV0cnlcbmNvbnN0IHVybFBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMod2luZG93LmxvY2F0aW9uLnNlYXJjaCk7XG5jb25zdCBzaG93Y2FzZSA9IHVybFBhcmFtcy5zaXplID09PSAwIHx8IHVybFBhcmFtcy5nZXQoXCJkZW1vXCIpID09PSBcIjFcIjtcbmlmIChzaG93Y2FzZSlcbiAgT2JqZWN0LmFzc2lnbih1bmlmb3Jtcywge1xuICAgIG1lbWJyYW5lUmVzdExlbmd0aDogMSAvIDMsXG4gICAgbXlvc2luU3RyZW5ndGg6IDAuMDUsXG4gICAgbWVtYnJhbmVDb3VwbGluZzogMC4wNSxcbiAgICBnQWN0aW5GaWVsZDogMSxcbiAgICBhcmVhQ29uc2VydmF0aW9uOiAxLFxuICAgIHBvbGFyaXR5TW9kZTogMSxcbiAgICByZWFyVHVybm92ZXI6IDAuMDEsXG4gICAgdGV0aGVyVHVybm92ZXI6IDEsXG4gICAgbW90b3JSZWFyQmlhczogMSxcbiAgICBmcm9udEFsaWdubWVudDogMC44LFxuICAgIGNvbG91ckFnZTogMSxcbiAgfSk7XG5jb25zdCBzZWVkID0gTnVtYmVyKHVybFBhcmFtcy5nZXQoXCJzZWVkXCIpID8/IDQyKSA+Pj4gMDtcbmNvbnN0IGluaXRpYWxSYW5kb20gPSBzZWVkZWRSYW5kb20oc2VlZCk7XG5mb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiB1cmxQYXJhbXMpIHtcbiAgaWYgKGtleSBpbiB1bmlmb3JtcyAmJiBOdW1iZXIuaXNGaW5pdGUoTnVtYmVyKHZhbHVlKSkpIHtcbiAgICAodW5pZm9ybXMgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPilba2V5XSA9IE51bWJlcih2YWx1ZSk7XG4gIH1cbn1cbmZvciAoY29uc3QgW25hbWUsIG1heGltdW1dIG9mIE9iamVjdC5lbnRyaWVzKHtcbiAgbXlvc2luU3RyZW5ndGg6IDAuMixcbiAgbXlvc2luU3BlZWQ6IDAuMSxcbiAgbWVtYnJhbmVDb3VwbGluZzogMC4yLFxuICBzdWJzdHJhdGVEcmFnOiAyMCxcbiAgY29ydGV4UG9seW1lcml6YXRpb246IDAuMSxcbiAgbW9ub21lck9wYWNpdHk6IDEsXG4gIGdBY3RpbkZpZWxkOiAxLFxuICBhcmVhQ29uc2VydmF0aW9uOiAxLFxuICBwb2xhcml0eU1vZGU6IDEsXG4gIHBvbGFyaXR5VHVyblJhdGU6IDAuMixcbiAgcmVhclR1cm5vdmVyOiAwLjIsXG4gIHRldGhlclR1cm5vdmVyOiAxLFxuICB0ZXRoZXJPblJhdGU6IDEsXG4gIHRldGhlck9mZlJhdGU6IDAuMixcbiAgbW90b3JSZWFyQmlhczogMSxcbiAgZnJvbnRBbGlnbm1lbnQ6IDEsXG4gIHRldGhlckxvYWRPZmY6IDAuMSxcbiAgY29sb3VyQWdlOiAxLFxufSkpIHtcbiAgY29uc3QgdmFsdWVzID0gdW5pZm9ybXMgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcbiAgdmFsdWVzW25hbWVdID0gTWF0aC5tYXgoMCwgTWF0aC5taW4obWF4aW11bSwgdmFsdWVzW25hbWVdKSk7XG59XG5cbmNvbnN0IERFQlVHTU9ERSA9IGZhbHNlO1xuY29uc3QgZGVidWdTaXplID0gMjAwO1xuY29uc3QgV09SS0dST1VQX1NJWkUgPSAyNTY7XG5cbmFzeW5jIGZ1bmN0aW9uIGluZGV4KCkge1xuICBjb25zdCBpc01vYmlsZURldmljZSA9IC9BbmRyb2lkfGlQaG9uZXxpUGFkfGlQb2R8T3BlcmEgTWluaXxJRU1vYmlsZXxXUERlc2t0b3AvaS50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuICBpZiAoaXNNb2JpbGVEZXZpY2UpIHtcbiAgICB1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZSA9IDE7XG4gIH1cblxuICAvLyBzZXR1cCBhbmQgY29uZmlndXJlIFdlYkdQVVxuICBjb25zdCBkZXZpY2UgPSBhd2FpdCByZXF1ZXN0RGV2aWNlKCk7XG4gIC8vIEdldCB0aGUgZXhpc3RpbmcgY2FudmFzIGZyb20gdGhlIERPTSBpbnN0ZWFkIG9mIGNyZWF0aW5nIGEgbmV3IG9uZVxuICBjb25zdCBjYW52YXMgPSBjb25maWd1cmVDYW52YXMoZGV2aWNlLCBcIm1haW4tY2FudmFzXCIsIHtcbiAgICB3aWR0aDogTWF0aC5yb3VuZChNYXRoLm1heChzaG93Y2FzZSA/IDEyODAgOiAwLCB3aW5kb3cuaW5uZXJXaWR0aCkgKiB1bmlmb3Jtcy5zaW11bGF0aW9uU2NhbGUpLFxuICAgIGhlaWdodDogTWF0aC5yb3VuZChNYXRoLm1heChzaG93Y2FzZSA/IDk2MCA6IDAsIHdpbmRvdy5pbm5lckhlaWdodCkgKiB1bmlmb3Jtcy5zaW11bGF0aW9uU2NhbGUpLFxuICB9KTtcblxuICBsZXQgdGltZSA9IDA7XG4gIGxldCBwYXVzZWQgPSB1cmxQYXJhbXMuaGFzKFwicGF1c2VkXCIpO1xuICBsZXQgbWFudWFsQWR2YW5jZVBlbmRpbmcgPSBmYWxzZTtcbiAgbGV0IGNvbnRyb2xzRGlydHkgPSBmYWxzZTtcbiAgbGV0IGN1ZVZlcnNpb24gPSAwO1xuICBjb25zdCBmcmFtZUJ1ZGdldCA9IG5ldyBGcmFtZUJ1ZGdldCgpO1xuICBjb25zdCBsaXZlUGVyZm9ybWFuY2UgPSBuZXcgTGl2ZVBlcmZvcm1hbmNlKCk7XG4gIGNvbnN0IHJ1bnRpbWVFcnJvcnM6IHN0cmluZ1tdID0gW107XG4gIGZ1bmN0aW9uIHNldFBhdXNlZCh2YWx1ZTogYm9vbGVhbikge1xuICAgIHBhdXNlZCA9IHZhbHVlO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGF1c2UtZGVtb1wiKSEudGV4dENvbnRlbnQgPSBwYXVzZWQgPyBcIlJlc3VtZVwiIDogXCJQYXVzZVwiO1xuICAgIGlmICghdmFsdWUpIGxpdmVQZXJmb3JtYW5jZS5jbGVhckZyYW1lcygpO1xuICB9XG4gIGZ1bmN0aW9uIHN0b3BTaW11bGF0aW9uKGVycm9yOiB1bmtub3duKSB7XG4gICAgY29uc3QgdGV4dCA9IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogU3RyaW5nKGVycm9yKTtcbiAgICBpZiAoIXJ1bnRpbWVFcnJvcnMuaW5jbHVkZXModGV4dCkpIHJ1bnRpbWVFcnJvcnMucHVzaCh0ZXh0KTtcbiAgICBzZXRQYXVzZWQodHJ1ZSk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSBgU3RvcHBlZDogJHt0ZXh0fWA7XG4gICAgY29uc3Qgbm90aWNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZW1vLW5vdGljZVwiKSE7XG4gICAgbm90aWNlLmhpZGRlbiA9IGZhbHNlO1xuICAgIG5vdGljZS50ZXh0Q29udGVudCA9IGBTaW11bGF0aW9uIHBhdXNlZDogJHt0ZXh0fWA7XG4gIH1cbiAgY29uc3QgZ3B1RXJyb3JzOiBzdHJpbmdbXSA9IFtdO1xuICBkZXZpY2UuYWRkRXZlbnRMaXN0ZW5lcihcInVuY2FwdHVyZWRlcnJvclwiLCAoZXZlbnQpID0+IHtcbiAgICBncHVFcnJvcnMucHVzaChldmVudC5lcnJvci5tZXNzYWdlKTtcbiAgICBzdG9wU2ltdWxhdGlvbihgR1BVIGVycm9yOiAke2V2ZW50LmVycm9yLm1lc3NhZ2V9YCk7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZWNoYW5pY2FsLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSBgR1BVIGVycm9yOiAke2V2ZW50LmVycm9yLm1lc3NhZ2V9YDtcbiAgfSk7XG4gIGRldmljZS5sb3N0LnRoZW4oKGluZm8pID0+IGdwdUVycm9ycy5wdXNoKGBEZXZpY2UgbG9zdDogJHtpbmZvLm1lc3NhZ2V9YCkpO1xuXG4gIGNvbnN0IEdST1VQX0lOREVYID0gMDtcbiAgY29uc3QgQklORElOR1NfQlVGRkVSID0geyBDQU5WQVM6IDAsIENPTlRST0xTOiAxLCBJTlRFUkFDVElPTlM6IDIgfTtcbiAgY29uc3QgQklORElOR1NfVEVYVFVSRSA9IHtcbiAgICBJTkRFWDogMyxcbiAgICBTVEVSSUNfUE9URU5USUFMOiA0LFxuICAgIFBBUkFNRVRFUl9GSUVMRFM6IDUsXG4gIH07XG5cbiAgY29uc3QgQklORElOR1NfQUdFTlRTID0ge1xuICAgIFJBTkRPTTogNixcbiAgICBNRU1CUkFORTogNyxcbiAgICBBQ1RJTjogOCxcbiAgICBDT05ORUNUSU9OX0xPQ0tTOiA5LFxuICAgIFRFTEVNRVRSWTogMTIsXG4gICAgTUVDSEFOSUNBTF9TTkFQU0hPVDogMTMsXG4gICAgTUVDSEFOSUNBTF9MSU5LUzogMTQsXG4gICAgTUVDSEFOSUNBTF9GT1JDRVM6IDE1LFxuICB9O1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBTZXQgdXAgbWVtb3J5IHJlc291cmNlc1xuICB2YXIgYWN0dWFsV2lkdGggPSBjYW52YXMuc2l6ZS53aWR0aDtcbiAgdmFyIGFjdHVhbEhlaWdodCA9IGNhbnZhcy5zaXplLmhlaWdodDtcbiAgaWYgKERFQlVHTU9ERSkge1xuICAgIGFjdHVhbFdpZHRoID0gZGVidWdTaXplO1xuICAgIGFjdHVhbEhlaWdodCA9IGRlYnVnU2l6ZTtcbiAgfVxuXG4gIGNvbnN0IHRleHR1cmVzID0gc2V0dXBUZXh0dXJlcyhcbiAgICBkZXZpY2UsXG4gICAgT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19URVhUVVJFKSxcbiAgICB7fSxcbiAgICB7XG4gICAgICBkZXB0aE9yQXJyYXlMYXllcnM6IHtcbiAgICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuU1RFUklDX1BPVEVOVElBTF06IDMsXG4gICAgICAgIFtCSU5ESU5HU19URVhUVVJFLlBBUkFNRVRFUl9GSUVMRFNdOiA2LFxuICAgICAgICBbQklORElOR1NfVEVYVFVSRS5JTkRFWF06IDQsXG4gICAgICB9LFxuICAgICAgd2lkdGg6IGFjdHVhbFdpZHRoLFxuICAgICAgaGVpZ2h0OiBhY3R1YWxIZWlnaHQsXG4gICAgfSxcbiAgICB7XG4gICAgICBbQklORElOR1NfVEVYVFVSRS5TVEVSSUNfUE9URU5USUFMXTogXCJyMzJmbG9hdFwiLFxuICAgICAgW0JJTkRJTkdTX1RFWFRVUkUuUEFSQU1FVEVSX0ZJRUxEU106IFwicjMyZmxvYXRcIixcbiAgICAgIFtCSU5ESU5HU19URVhUVVJFLklOREVYXTogXCJyMzJ1aW50XCIsXG4gICAgfVxuICApO1xuXG4gIGNvbnN0IFRFWFRVUkVfV09SS0dST1VQX0NPVU5UOiBbbnVtYmVyLCBudW1iZXJdID0gW1xuICAgIE1hdGguY2VpbCh0ZXh0dXJlcy5zaXplLndpZHRoIC8gTWF0aC5zcXJ0KFdPUktHUk9VUF9TSVpFKSksXG4gICAgTWF0aC5jZWlsKHRleHR1cmVzLnNpemUuaGVpZ2h0IC8gTWF0aC5zcXJ0KFdPUktHUk9VUF9TSVpFKSksXG4gIF07XG5cbiAgY29uc3QgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCA9IHtcbiAgICBBQ1RJTjogTWF0aC5jZWlsKHVuaWZvcm1zLmFjdGluQ291bnQgLyBXT1JLR1JPVVBfU0laRSksXG4gICAgTUVNQlJBTkU6IE1hdGguY2VpbCh1bmlmb3Jtcy5tZW1icmFuZUNvdW50IC8gV09SS0dST1VQX1NJWkUpLFxuICB9O1xuICBjb25zdCBNQVhfQlVGRkVSX1dPUktHUk9VUF9DT1VOVCA9IE1hdGgubWF4KC4uLk9iamVjdC52YWx1ZXMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVCkpO1xuXG4gIC8vIHNldHVwIGludGVyYWN0aW9uc1xuICBjb25zdCBpbnRlcmFjdGlvbnMgPSBzZXR1cEludGVyYWN0aW9ucyhkZXZpY2UsIGNhbnZhcy5jb250ZXh0LmNhbnZhcywgdGV4dHVyZXMuc2l6ZSk7XG4gIGNvbnN0IGNhbnZhc19idWZmZXJzID0ge1xuICAgIFtCSU5ESU5HU19CVUZGRVIuQ0FOVkFTXTogdGV4dHVyZXMuY2FudmFzLmJ1ZmZlcixcbiAgICBbQklORElOR1NfQlVGRkVSLkNPTlRST0xTXTogaW50ZXJhY3Rpb25zLmNvbnRyb2xzLmJ1ZmZlcixcbiAgICBbQklORElOR1NfQlVGRkVSLklOVEVSQUNUSU9OU106IGludGVyYWN0aW9ucy5pbnRlcmFjdGlvbnMuYnVmZmVyLFxuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIHRvIHdyaXRlIHRoZSB1bmlmb3JtcyBvYmplY3QgaW50byB0aGUgQXJyYXlCdWZmZXIgYWNjb3JkaW5nIHRvIFdHU0wgc3RydWN0IGxheW91dFxuICBjb25zdCBjb250cm9sc0RhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGludGVyYWN0aW9ucy5jb250cm9scy5kYXRhKTtcbiAgY29uc3QgY2FudmFzVmlldyA9IG5ldyBEYXRhVmlldyh0ZXh0dXJlcy5jYW52YXMuZGF0YS5idWZmZXIpO1xuXG4gIGNvbnN0IHdyaXRlVW5pZm9ybXMgPSAoKSA9PiB7XG4gICAgLy8gV3JpdGUgY2FudmFzIHNpemVcbiAgICBjYW52YXNWaWV3LnNldEludDMyKDAsIGFjdHVhbFdpZHRoLCB0cnVlKTtcbiAgICBjYW52YXNWaWV3LnNldEludDMyKDQsIGFjdHVhbEhlaWdodCwgdHJ1ZSk7XG5cbiAgICAvLyBDYW52YXMua2V5IGlzIHZlYzI8dTMyPiwgYWxpZ25lZCB0byBieXRlIDE2LiBVSSBjaGFuZ2VzIGRvIG5vdCByZXNlZWQuXG4gICAgY2FudmFzVmlldy5zZXRVaW50MzIoMTYsIHNlZWQsIHRydWUpO1xuICAgIGNhbnZhc1ZpZXcuc2V0VWludDMyKDIwLCBzZWVkIF4gMHg5ZTM3NzliOSwgdHJ1ZSk7XG5cbiAgICAvLyBXcml0ZSBjb250cm9scyB3aXRoIGFkanVzdGVkIG9mZnNldHM6XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMCwgdW5pZm9ybXMubWVtYnJhbmVDb3VudCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNCwgdW5pZm9ybXMuYWN0aW5Db3VudCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDgsIHVuaWZvcm1zLnN0aWZmbmVzcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDEyLCB1bmlmb3Jtcy5mb29kTmVhcmJ5VGhyZXNob2xkLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMTYsIHVuaWZvcm1zLmRpc2Nvbm5lY3Rpb25Qcm9iYWJpbGl0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIwLCB1bmlmb3Jtcy5wb2x5bWVyUmVwdWxzaW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEludDMyKDI0LCB1bmlmb3Jtcy5zdGVyaWNTYW1wbGluZ1JhbmdlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEludDMyKDI4LCB1bmlmb3Jtcy5hY3RpbkNvaGVzaW9uUmFuZ2UsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMiwgdW5pZm9ybXMuYmluZFByb2IsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDM2LCB1bmlmb3Jtcy5iaW5kTGVuZ3RoU2F0dXJhdGlvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNDgsIHVuaWZvcm1zLmJpbmRMZW5ndGhGbG9vciwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDQwLCB1bmlmb3Jtcy5hY3RpblN0ZXJpY0ZvcmNlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNDQsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoNTYsIHVuaWZvcm1zLm1vbm9tZXJNZW1icmFuZVJlcHVsc2lvbiwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoNTIsIHVuaWZvcm1zLm1vdmVtZW50TW9kZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDYwLCB1bmlmb3Jtcy5tZW1icmFuZVN0aWZmbmVzcywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDcyLCB1bmlmb3Jtcy5wb2x5bWVyaXphdGlvblBhdGNoU2l6ZSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDc2LCB1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMDgsIHVuaWZvcm1zLm1lbWJyYW5lU21vb3RoaW5nLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjE2LCB1bmlmb3Jtcy5wb2x5bWVyaXphdGlvbkZpZWxkRGVjYXksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMjAsIHVuaWZvcm1zLm1lbWJyYW5lRmxvdywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDIyNCwgdW5pZm9ybXMubGFtZWxsaXBvZGl1bVN0cmVuZ3RoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjI4LCB1bmlmb3Jtcy5sYW1lbGxpcG9kaXVtV2lkdGgsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyMzIsIHVuaWZvcm1zLmxhbWVsbGlwb2RpdW1GaWVsZERlY2F5LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjM2LCB1bmlmb3Jtcy5icmFuY2hQcm9iYWJpbGl0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI0MCwgdW5pZm9ybXMuZGVicmFuY2hQcm9iYWJpbGl0eSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI0NCwgdW5pZm9ybXMuYWN0aW5CZW5kU3RpZmZuZXNzLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyNDgsIHVuaWZvcm1zLnN0ZXJpY1NlbGZOZWlnaGJvcnMsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigyNTIsIHVuaWZvcm1zLm15b3NpblN0cmVuZ3RoLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjU2LCB1bmlmb3Jtcy5teW9zaW5TcGVlZCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI2MCwgdW5pZm9ybXMubWVtYnJhbmVDb3VwbGluZywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI2NCwgdW5pZm9ybXMuc3Vic3RyYXRlRHJhZywgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRGbG9hdDMyKDI2OCwgdW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24sIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMig2NCwgdW5pZm9ybXMubW9ub21lck9wYWNpdHksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDY4LCB1bmlmb3Jtcy5nQWN0aW5GaWVsZCA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjEyLCB1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjcyLCB1bmlmb3Jtcy5jdWVYLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjc2LCB1bmlmb3Jtcy5jdWVZLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyODAsIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPyAxIDogMCwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMjg0LCBjdWVWZXJzaW9uLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigyODgsIHVuaWZvcm1zLnBvbGFyaXR5TW9kZSA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjkyLCB1bmlmb3Jtcy5wb2xhcml0eVR1cm5SYXRlLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMjk2LCB1bmlmb3Jtcy5yZWFyVHVybm92ZXIsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMDAsIE1hdGgubWF4KDEsIHVuaWZvcm1zLnR1cm5vdmVyQWdlKSwgdHJ1ZSk7XG4gICAgY29udHJvbHNEYXRhVmlldy5zZXRVaW50MzIoMzA0LCB1bmlmb3Jtcy50ZXRoZXJUdXJub3ZlciA/IDEgOiAwLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzA4LCB1bmlmb3Jtcy50ZXRoZXJPblJhdGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMTIsIHVuaWZvcm1zLnRldGhlck9mZlJhdGUsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0VWludDMyKDMxNiwgTWF0aC5tYXgoMCwgdW5pZm9ybXMudGV0aGVyUmVjb3ZlcnlTdGVwcyksIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMjAsIHVuaWZvcm1zLm1vdG9yUmVhckJpYXMsIHRydWUpO1xuICAgIGNvbnRyb2xzRGF0YVZpZXcuc2V0RmxvYXQzMigzMjQsIHVuaWZvcm1zLmZyb250QWxpZ25tZW50LCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldEZsb2F0MzIoMzI4LCB1bmlmb3Jtcy50ZXRoZXJMb2FkT2ZmLCB0cnVlKTtcbiAgICBjb250cm9sc0RhdGFWaWV3LnNldFVpbnQzMigzMzIsIHVuaWZvcm1zLmNvbG91ckFnZSA/IDEgOiAwLCB0cnVlKTtcblxuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihpbnRlcmFjdGlvbnMuY29udHJvbHMuYnVmZmVyLCAwLCBpbnRlcmFjdGlvbnMuY29udHJvbHMuZGF0YSk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKHRleHR1cmVzLmNhbnZhcy5idWZmZXIsIDAsIHRleHR1cmVzLmNhbnZhcy5kYXRhKTtcbiAgfTtcblxuICB3cml0ZVVuaWZvcm1zKCk7XG5cbiAgLy8gc2V0dXAgYWdlbnRzXG4gIGNvbnN0IHJhbmRvbUJ1ZmZlclNpemUgPSBNYXRoLm1heCh0ZXh0dXJlcy5zaXplLndpZHRoICogdGV4dHVyZXMuc2l6ZS5oZWlnaHQsIHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICsgMjU2KTtcblxuICAvLyBpbml0aWFsaXplIHJhbmRvbSBidWZmZXJcbiAgY29uc3QgcmFuZG9tRGF0YSA9IGdldFJhbmRvbVZhbHVlcyhyYW5kb21CdWZmZXJTaXplLCBpbml0aWFsUmFuZG9tKTtcblxuICBjb25zdCBudW1GbG9hdHMgPSAxMDsgLy8gU2VnbWVudCBzdHJ1Y3Qgc2l6ZSBpbiAzMi1iaXQgd29yZHNcblxuICBjb25zdCBhZ2VudF9idWZmZXJzID0ge1xuICAgIFtCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9TTkFQU0hPVF06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogMzIgKiAodW5pZm9ybXMuYWN0aW5Db3VudCArIHVuaWZvcm1zLm1lbWJyYW5lQ291bnQgKyAyKSxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBzaXplOiAzMiAqICgyNTYgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50KSxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfRk9SQ0VTXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICAvLyBQcmVmaXg6IHBoeXNpY2FsIGZvcmNlIGFjY3VtdWxhdG9ycy4gVGFpbDogY29uc2VydmF0aXZlIG1lbWJyYW5lLWVkZ2VcbiAgICAgIC8vIHJvdyBzaG9ydGxpc3RzOyBleGFjdCB0ZXN0cyBmYWxsIGJhY2sgdG8gYWxsIGVkZ2VzIG9uIG92ZXJmbG93LlxuICAgICAgc2l6ZTogOCAqICh1bmlmb3Jtcy5hY3RpbkNvdW50ICsgdW5pZm9ybXMubWVtYnJhbmVDb3VudCArIE1hdGguY2VpbChhY3R1YWxIZWlnaHQgLyA0KSAqIDI1NyksXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDLFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuUkFORE9NXTogZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgICBsYWJlbDogXCJSYW5kb20gQnVmZmVyXCIsXG4gICAgICBzaXplOiByYW5kb21EYXRhLmJ5dGVMZW5ndGgsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICAgIH0pLFxuICAgIFtCSU5ESU5HU19BR0VOVFMuQUNUSU5dOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIHNpemU6IHNpemUzMiAqIG51bUZsb2F0cyAqIHVuaWZvcm1zLmFjdGluQ291bnQsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSksXG4gICAgW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV06IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgICAgc2l6ZTogc2l6ZTMyICogbnVtRmxvYXRzICogdW5pZm9ybXMubWVtYnJhbmVDb3VudCxcbiAgICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5TVE9SQUdFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMgfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgICB9KSxcbiAgICBbQklORElOR1NfQUdFTlRTLkNPTk5FQ1RJT05fTE9DS1NdOiBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxhYmVsOiBcIkFjdGluIENvbm5lY3Rpb24gTG9ja3MgQnVmZmVyXCIsXG4gICAgICBzaXplOiBzaXplMzIgKiB1bmlmb3Jtcy5hY3RpbkNvdW50LFxuICAgICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlNUT1JBR0UsXG4gICAgfSksXG4gIH0gYXMgUmVjb3JkPG51bWJlciwgR1BVQnVmZmVyPjtcblxuICBjb25zdCB0ZWxlbWV0cnkgPSBuZXcgQWN0aW5UZWxlbWV0cnkoXG4gICAgZGV2aWNlLFxuICAgIGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSxcbiAgICB1bmlmb3Jtcy5hY3RpbkNvdW50LFxuICAgIGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FTUJSQU5FXSxcbiAgICB1bmlmb3Jtcy5tZW1icmFuZUNvdW50LFxuICAgIHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCxcbiAgICB1cmxQYXJhbXMuZ2V0KFwicnVuXCIpID8/IFwiZGVmYXVsdFwiLFxuICAgIDMwLFxuICAgICEhdW5pZm9ybXMuZ0FjdGluRmllbGRcbiAgKTtcbiAgdGVsZW1ldHJ5Lm9uU2FtcGxlID0gKHMpID0+IHtcbiAgICByZW5kZXJNb2R1bGUuc2V0Q2VsbEJvdW5kcyhzLmNlbGwubGVmdCwgcy5jZWxsLnJpZ2h0LCBzLmNlbGwudG9wLCBzLmNlbGwuYm90dG9tKTtcbiAgICBpZiAocmVjb3ZlcnkuYWN0aXZlIHx8IHMuZGlhZ25vc3RpY0tpbmQgPT09IFwiY29udGFjdC1yZWNoZWNrXCIpIHJldHVybjtcbiAgICBpZiAodW5pZm9ybXMuZ0FjdGluRmllbGQgJiYgY2xhc3NpZnlDaGVja3BvaW50KHMsICEhdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbikgPT09IFwiY29udGFjdHNcIikge1xuICAgICAgdm9pZCByZWNvdmVyeS5yZXF1ZXN0KHMpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBpbnZhbGlkID1cbiAgICAgICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCAmJiBjbGFzc2lmeUNoZWNrcG9pbnQocywgISF1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uKSA9PT0gXCJmYXRhbFwiKSB8fFxuICAgICAgcy5hY3RpbkJhbGFuY2VFcnJvciB8fFxuICAgICAgcy5icm9rZW5MaW5rcyB8fFxuICAgICAgcy5jeWNsZXMgfHxcbiAgICAgICh1bmlmb3Jtcy5nQWN0aW5GaWVsZCAmJiAocy5pbnNpZGVQb2x5bWVyQmVhZHMgIT09IHMuaW5Qb2x5bWVyIHx8IHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzKSkgfHxcbiAgICAgICh1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uICYmIE1hdGguYWJzKHMuY2VsbC5hcmVhIC0gMSkgPiAwLjAwMSkgfHxcbiAgICAgICFOdW1iZXIuaXNGaW5pdGUocy5jZWxsLmNlbnRyb2lkWCk7XG4gICAgaWYgKGludmFsaWQpXG4gICAgICBzdG9wU2ltdWxhdGlvbihcbiAgICAgICAgYE51bWVyaWNhbCBjaGVjayBmYWlsZWQgYXQgc3RlcCAke3Muc3RlcH06ICR7SlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgIG1hc3M6IHMuYWN0aW5CYWxhbmNlRXJyb3IsXG4gICAgICAgICAgaW5zaWRlRjogcy5pbnNpZGVQb2x5bWVyQmVhZHMsXG4gICAgICAgICAgdG90YWxGOiBzLmluUG9seW1lcixcbiAgICAgICAgICBjcm9zc2luZ3M6IHMuY3Jvc3NpbmdGaWxhbWVudEJvbmRzLFxuICAgICAgICAgIGJyb2tlbkxpbmtzOiBzLmJyb2tlbkxpbmtzLFxuICAgICAgICAgIGN5Y2xlczogcy5jeWNsZXMsXG4gICAgICAgICAgYXJlYTogcy5jZWxsLmFyZWEsXG4gICAgICAgICAgY2VudHJvaWRYOiBzLmNlbGwuY2VudHJvaWRYLFxuICAgICAgICB9KX07IHJlc2V0IHRvIHJlcGxheS5gXG4gICAgICApO1xuICB9O1xuICBsZXQgY29udGFjdEJhY2t1cDogQXJyYXlCdWZmZXIgfCBudWxsID0gbnVsbDtcbiAgYXN5bmMgZnVuY3Rpb24gcmVhZEFjdGluKCkge1xuICAgIGNvbnN0IHNvdXJjZSA9IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXTtcbiAgICBjb25zdCBzdGFnZSA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBzb3VyY2Uuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHNvdXJjZSwgMCwgc3RhZ2UsIDAsIHNvdXJjZS5zaXplKTtcbiAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgIGF3YWl0IHN0YWdlLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgICByZXR1cm4gc3RhZ2UuZ2V0TWFwcGVkUmFuZ2UoKS5zbGljZSgwKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc3RhZ2UuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxuICBjb25zdCByZWNvdmVyeSA9IG5ldyBDb250YWN0UmVjb3Zlcnkoe1xuICAgIGluc3BlY3Q6IGFzeW5jICgpID0+IHtcbiAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgICBhd2FpdCB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlLCB0cnVlLCB0cnVlKTtcbiAgICAgIGlmIChncHVFcnJvcnMubGVuZ3RoKSB0aHJvdyBFcnJvcihncHVFcnJvcnMuam9pbihcIlxcblwiKSk7XG4gICAgICByZXR1cm4gdGVsZW1ldHJ5Lmhpc3RvcnkuYXQoLTEpITtcbiAgICB9LFxuICAgIGJlZ2luOiBhc3luYyAoKSA9PiB7XG4gICAgICBjb250YWN0QmFja3VwID0gYXdhaXQgcmVhZEFjdGluKCk7XG4gICAgfSxcbiAgICByZXBhaXI6IGFzeW5jIChpdGVyYXRpb25zKSA9PiB7XG4gICAgICBydW5Db250YWN0UmVwYWlyKGRldmljZSwgc2ltUGlwZWxpbmVzLCBiaW5kR3JvdXBTaW11bGF0ZSwgQlVGRkVSX1dPUktHUk9VUF9DT1VOVCwgY2FudmFzLmNhbnZhcy5oZWlnaHQsIGl0ZXJhdGlvbnMpO1xuICAgICAgY29uc3QgY3VycmVudCA9IGF3YWl0IHJlYWRBY3RpbigpLFxuICAgICAgICBiZWZvcmUgPSBuZXcgRmxvYXQzMkFycmF5KGNvbnRhY3RCYWNrdXAhKSxcbiAgICAgICAgYWZ0ZXIgPSBuZXcgRmxvYXQzMkFycmF5KGN1cnJlbnQpO1xuICAgICAgY29uc3QgYnUgPSBuZXcgVWludDMyQXJyYXkoY29udGFjdEJhY2t1cCEpLFxuICAgICAgICBhdSA9IG5ldyBVaW50MzJBcnJheShjdXJyZW50KTtcbiAgICAgIGxldCBtYXhpbXVtID0gMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWZ0ZXIubGVuZ3RoOyBpICs9IDEwKSB7XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgMTA7IGorKykgaWYgKGogIT09IDIgJiYgaiAhPT0gMyAmJiBidVtpICsgal0gIT09IGF1W2kgKyBqXSkgdGhyb3cgRXJyb3IoXCJDb250YWN0IHJlcGFpciBjaGFuZ2VkIGFjdGluIG1ldGFkYXRhXCIpO1xuICAgICAgICBjb25zdCBkaXNwbGFjZW1lbnQgPSBNYXRoLmh5cG90KGFmdGVyW2kgKyAyXSAtIGJlZm9yZVtpICsgMl0sIGFmdGVyW2kgKyAzXSAtIGJlZm9yZVtpICsgM10pO1xuICAgICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShkaXNwbGFjZW1lbnQpKSB0aHJvdyBFcnJvcihcIk5vbi1maW5pdGUgY29udGFjdCBjb3JyZWN0aW9uXCIpO1xuICAgICAgICBtYXhpbXVtID0gTWF0aC5tYXgobWF4aW11bSwgZGlzcGxhY2VtZW50KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXhpbXVtO1xuICAgIH0sXG4gICAgcm9sbGJhY2s6IGFzeW5jICgpID0+IHtcbiAgICAgIGlmIChjb250YWN0QmFja3VwKSBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLCAwLCBjb250YWN0QmFja3VwKTtcbiAgICAgIGF3YWl0IGRldmljZS5xdWV1ZS5vblN1Ym1pdHRlZFdvcmtEb25lKCk7XG4gICAgfSxcbiAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICBjb250YWN0QmFja3VwID0gbnVsbDtcbiAgICB9LFxuICAgIGZpeGVkQXJlYTogKCkgPT4gISF1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uLFxuICAgIG1heERpc3BsYWNlbWVudDogKCkgPT4gOCxcbiAgICBub3c6ICgpID0+IHBlcmZvcm1hbmNlLm5vdygpLFxuICAgIG5vdGljZTogKG1lc3NhZ2UpID0+IHtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICB9LFxuICAgIGZhaWw6IHN0b3BTaW11bGF0aW9uLFxuICB9KTtcbiAgYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuVEVMRU1FVFJZXSA9IHRlbGVtZXRyeS5jb3VudGVyQnVmZmVyO1xuXG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5SQU5ET01dLCAvKm9mZnNldD0qLyAwLCAvKmRhdGE9Ki8gcmFuZG9tRGF0YSk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIC8vIE92ZXJhbGwgbWVtb3J5IGxheW91dFxuICBjb25zdCB2aXNpYmlsaXR5ID0gR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5UO1xuXG4gIC8vIFRoaXMgbGF5b3V0IGlzIGZvciBzaGFyZWQgcmVzb3VyY2VzIGJldHdlZW4gc2ltdWxhdGlvbiBhbmQgcmVuZGVyaW5nXG4gIGNvbnN0IHNoYXJlZExheW91dEVudHJpZXMgPSBbXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19CVUZGRVIpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgIGJpbmRpbmc6IGJpbmRpbmcsXG4gICAgICB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5DT01QVVRFIHwgR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsXG4gICAgICBidWZmZXI6IHsgdHlwZTogXCJ1bmlmb3JtXCIgYXMgR1BVQnVmZmVyQmluZGluZ1R5cGUgfSxcbiAgICB9KSksXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19URVhUVVJFKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nOiBiaW5kaW5nLFxuICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgc3RvcmFnZVRleHR1cmU6IHRleHR1cmVzLmJpbmRpbmdMYXlvdXRbYmluZGluZ10sXG4gICAgfSkpLFxuICBdO1xuXG4gIGNvbnN0IHNoYXJlZEJpbmRHcm91cEVudHJpZXMgPSBbXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19URVhUVVJFKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICBiaW5kaW5nLFxuICAgICAgcmVzb3VyY2U6IHRleHR1cmVzLnRleHR1cmVzW2JpbmRpbmddLmNyZWF0ZVZpZXcoKSxcbiAgICB9KSksXG4gICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19CVUZGRVIpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgIGJpbmRpbmcsXG4gICAgICByZXNvdXJjZTogeyBidWZmZXI6IGNhbnZhc19idWZmZXJzW2JpbmRpbmddIH0sXG4gICAgfSkpLFxuICBdO1xuXG4gIGNvbnN0IGJpbmRHcm91cExheW91dFNpbXVsYXRlID0gZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgbGFiZWw6IFwiYmluZEdyb3VwTGF5b3V0U2ltdWxhdGVcIixcbiAgICBlbnRyaWVzOiBbXG4gICAgICAuLi5zaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgICAgLi4uT2JqZWN0LnZhbHVlcyhCSU5ESU5HU19BR0VOVFMpLm1hcCgoYmluZGluZykgPT4gKHtcbiAgICAgICAgYmluZGluZzogYmluZGluZyxcbiAgICAgICAgdmlzaWJpbGl0eTogdmlzaWJpbGl0eSxcbiAgICAgICAgYnVmZmVyOiB7IHR5cGU6IFwic3RvcmFnZVwiIGFzIEdQVUJ1ZmZlckJpbmRpbmdUeXBlIH0sXG4gICAgICB9KSksXG4gICAgXSxcbiAgfSk7XG5cbiAgY29uc3QgYmluZEdyb3VwU2ltdWxhdGUgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwKHtcbiAgICBsYWJlbDogYEJpbmQgR3JvdXBgLFxuICAgIGxheW91dDogYmluZEdyb3VwTGF5b3V0U2ltdWxhdGUsXG4gICAgZW50cmllczogW1xuICAgICAgLi4uc2hhcmVkQmluZEdyb3VwRW50cmllcyxcbiAgICAgIC4uLk9iamVjdC52YWx1ZXMoQklORElOR1NfQUdFTlRTKS5tYXAoKGJpbmRpbmcpID0+ICh7XG4gICAgICAgIGJpbmRpbmcsXG4gICAgICAgIHJlc291cmNlOiB7IGJ1ZmZlcjogYWdlbnRfYnVmZmVyc1tiaW5kaW5nXSB9LFxuICAgICAgfSkpLFxuICAgIF0sXG4gIH0pO1xuXG4gIGNvbnN0IHBpcGVsaW5lTGF5b3V0U2ltdWxhdGUgPSBkZXZpY2UuY3JlYXRlUGlwZWxpbmVMYXlvdXQoe1xuICAgIGxhYmVsOiBcInBpcGVsaW5lTGF5b3V0XCIsXG4gICAgYmluZEdyb3VwTGF5b3V0czogW2JpbmRHcm91cExheW91dFNpbXVsYXRlXSxcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbGluZUNvbnN0cmFpbnRGdW5jdGlvbihwYXNzOiBHUFVDb21wdXRlUGFzc0VuY29kZXIpIHtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5vcmllbnRhdGlvblVwZGF0ZSk7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoTUFYX0JVRkZFUl9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmNvc3NlcmF0VXBkYXRlKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVuaWZvcm1zLmFjdGluQ29zc2VyYXRJdGVyYXRpb25zOyBpKyspIHtcbiAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4pO1xuICAgIH1cbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5saW5lQ29uc3RyYWludCk7XG4gICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoTUFYX0JVRkZFUl9XT1JLR1JPVVBfQ09VTlQpO1xuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLm1lbWJyYW5lVGFuZ2VudGlhbEZsb3cpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdW5pZm9ybXMubWVtYnJhbmVGbG93SXRlcmF0aW9uczsgaSsrKSB7XG4gICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICB9XG4gIH1cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgLy8gU2V0IHVwIGNvZGUgaW5zdHJ1Y3Rpb25zXG4gIGNvbnN0IG1vZHVsZSA9IGF3YWl0IGNyZWF0ZVNoYWRlcihkZXZpY2UsIHNpbXVsYXRlQ29kZSwgc2hhZGVySW5jbHVkZXMpO1xuXG4gIGNvbnN0IHNpbVBpcGVsaW5lcyA9IGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXMoZGV2aWNlLCBtb2R1bGUsIHBpcGVsaW5lTGF5b3V0U2ltdWxhdGUpO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAvLyBSVU4gdGhlIHJlc2V0IHNoYWRlciBmdW5jdGlvblxuICBjb25zdCByZXNldCA9ICgpID0+IHtcbiAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdLCAwLCBuZXcgVWludDMyQXJyYXkoOCAqICgyNTYgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50KSkpO1xuXG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcblxuICAgIHBhc3Muc2V0QmluZEdyb3VwKEdST1VQX0lOREVYLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG5cbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5yZXNldEFjdGluKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcblxuICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLnJlc2V0TWVtYnJhbmUpO1xuICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuXG4gICAgcGFzcy5lbmQoKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgaWYgKHVuaWZvcm1zLmdBY3RpbkZpZWxkIHx8IHVuaWZvcm1zLmFyZWFDb25zZXJ2YXRpb24pIHJ1bkVuY2xvc3VyZShkZXZpY2UsIHNpbVBpcGVsaW5lcywgYmluZEdyb3VwU2ltdWxhdGUsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsIGFjdHVhbEhlaWdodCk7XG4gICAgdGVsZW1ldHJ5LnJlc2V0KCk7XG4gIH07XG4gIHJlc2V0KCk7XG5cbiAgY29uc3QgcmVuZGVyU2hhZGVyID0gYXdhaXQgY3JlYXRlU2hhZGVyKGRldmljZSwgcmVuZGVyQ29kZSwgc2hhZGVySW5jbHVkZXMpO1xuICBjb25zdCByZW5kZXJNb2R1bGUgPSBuZXcgUmVuZGVyTW9kdWxlKFxuICAgIGRldmljZSxcbiAgICBjYW52YXMuZm9ybWF0LFxuICAgIHsgd2lkdGg6IGFjdHVhbFdpZHRoLCBoZWlnaHQ6IGFjdHVhbEhlaWdodCB9LFxuICAgIHJlbmRlclNoYWRlcixcbiAgICB0ZXh0dXJlcyxcbiAgICBzaGFyZWRMYXlvdXRFbnRyaWVzLFxuICAgIHNoYXJlZEJpbmRHcm91cEVudHJpZXMsXG4gICAgeyBidWZmZXI6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfU05BUFNIT1RdLCBvZmZzZXQ6IDMyICogKHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50KSwgc2l6ZTogMzIgfVxuICApO1xuICBmb3IgKGNvbnN0IFtrZXksIHBhcmFtZXRlciwgbG93LCBoaWdoXSBvZiBbXG4gICAgW1wibW9kZVwiLCBcIm1pY3Jvc2NvcGVcIiwgMCwgMV0sXG4gICAgW1wiem9vbVwiLCBcInZpZXdab29tXCIsIDEsIDZdLFxuICAgIFtcImZvY3VzXCIsIFwiZm9jdXNcIiwgLTEsIDFdLFxuICAgIFtcImNvbnRyYXN0XCIsIFwib3B0aWNhbENvbnRyYXN0XCIsIDAuMiwgMi41XSxcbiAgXSBhcyBjb25zdCkge1xuICAgIGlmICh1cmxQYXJhbXMuaGFzKHBhcmFtZXRlcikpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gTnVtYmVyKHVybFBhcmFtcy5nZXQocGFyYW1ldGVyKSk7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlKSkgcmVuZGVyTW9kdWxlLnZpZXdba2V5XSA9IE1hdGgubWF4KGxvdywgTWF0aC5taW4oaGlnaCwgdmFsdWUpKTtcbiAgICB9XG4gIH1cbiAgcmVuZGVyTW9kdWxlLnZpZXcubW9kZSA9IHJlbmRlck1vZHVsZS52aWV3Lm1vZGUgPyAxIDogMDtcbiAgcmVuZGVyTW9kdWxlLnZpZXcuYXV0b0ZpdCA9ICF1cmxQYXJhbXMuaGFzKFwidmlld1pvb21cIik7XG4gIGNvbnN0IGluaXRpYWxSYWRpdXMgPSAodW5pZm9ybXMubWVtYnJhbmVDb3VudCAqIHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCkgLyAoMiAqIE1hdGguUEkpO1xuICByZW5kZXJNb2R1bGUuc2V0Q2VsbEJvdW5kcyhcbiAgICBhY3R1YWxXaWR0aCAvIDIgLSBpbml0aWFsUmFkaXVzLFxuICAgIGFjdHVhbFdpZHRoIC8gMiArIGluaXRpYWxSYWRpdXMsXG4gICAgYWN0dWFsSGVpZ2h0IC8gMiAtIGluaXRpYWxSYWRpdXMsXG4gICAgYWN0dWFsSGVpZ2h0IC8gMiArIGluaXRpYWxSYWRpdXNcbiAgKTtcbiAgcmVuZGVyTW9kdWxlLmZpdEltbWVkaWF0ZWx5KCk7XG5cbiAgLy8gU2hvdyB0aGUgaW5pdGlhbCBzb2x1YmxlIGNvbXBhcnRtZW50IGV2ZW4gd2hlbiBvcGVuZWQgcGF1c2VkLiBUaGlzIHdyaXRlc1xuICAvLyBvbmx5IHRoZSB2aXN1YWxpemF0aW9uIG1hc2ssIG5vdCByZWFjdGlvbi9zdGVyaWMgZmllbGRzIG9yIHBoeXNpY2FsIHN0YXRlLlxuICBpZiAodW5pZm9ybXMuZ0FjdGluRmllbGQpIHtcbiAgICBjb25zdCBlbmNvZGVyID0gZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG4gICAgY29uc3QgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cFNpbXVsYXRlKTtcbiAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5kcmF3UmVzZXJ2b2lyKTtcbiAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyguLi5URVhUVVJFX1dPUktHUk9VUF9DT1VOVCk7XG4gICAgcGFzcy5lbmQoKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgcmVuZGVyTW9kdWxlLnJlbmRlcihjYW52YXMuY29udGV4dCk7XG4gIH1cblxuICB2YXIgZnJhbWVOciA9IDA7XG4gIGNvbnN0IHNwcm91dHMgPSBuZXcgU3Byb3V0U2NoZWR1bGVyKHVuaWZvcm1zLnNwcm91dE9uU3RlcHMgKyB1bmlmb3Jtcy5zcHJvdXRPZmZTdGVwcywgc2VlZGVkUmFuZG9tKHNlZWQgXiAweGEzNDEzMTZjKSk7XG4gIGNvbnN0IHNwcm91dFNpdGVzID0gbmV3IEZsb2F0MzJBcnJheShpbnRlcmFjdGlvbnMuY29udHJvbHMuZGF0YSwgODAsIDQgKiBNQVhfU1BST1VUX1NJVEVTKTtcblxuICAvLyBSVU4gdGhlIHNpbSBjb21wdXRlIGZ1bmN0aW9uIGFuZCByZW5kZXIgcGl4ZWxzXG4gIGFzeW5jIGZ1bmN0aW9uIHRpbWVzdGVwKHN0ZXBDb3VudCA9IHVuaWZvcm1zLmNvbXB1dGVTdGVwc1BlckZyYW1lKSB7XG4gICAgaWYgKHJlY292ZXJ5LmFjdGl2ZSkgcmV0dXJuO1xuICAgIHRpbWUrKztcbiAgICBpZiAoY29udHJvbHNEaXJ0eSkge1xuICAgICAgd3JpdGVVbmlmb3JtcygpO1xuICAgICAgY29udHJvbHNEaXJ0eSA9IGZhbHNlO1xuICAgIH1cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoaW50ZXJhY3Rpb25zLmludGVyYWN0aW9ucy5idWZmZXIsIDAsIGludGVyYWN0aW9ucy5pbnRlcmFjdGlvbnMuZGF0YSk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN0ZXBDb3VudDsgaSsrKSB7XG4gICAgICBzcHJvdXRzLnVwZGF0ZShmcmFtZU5yLCB1bmlmb3Jtcywgc3Byb3V0U2l0ZXMpO1xuICAgICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGludGVyYWN0aW9ucy5jb250cm9scy5idWZmZXIsIDgwLCBzcHJvdXRTaXRlcyk7XG4gICAgICBydW5TaW11bGF0aW9uU3RlcChcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICBzaW1QaXBlbGluZXMsXG4gICAgICAgIGJpbmRHcm91cFNpbXVsYXRlLFxuICAgICAgICBCVUZGRVJfV09SS0dST1VQX0NPVU5ULFxuICAgICAgICBURVhUVVJFX1dPUktHUk9VUF9DT1VOVCxcbiAgICAgICAgbGluZUNvbnN0cmFpbnRGdW5jdGlvbixcbiAgICAgICAgZnJhbWVOcixcbiAgICAgICAgaSA9PT0gc3RlcENvdW50IC0gMSxcbiAgICAgICAgISEodW5pZm9ybXMuZ0FjdGluRmllbGQgfHwgdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiksXG4gICAgICAgICEhdW5pZm9ybXMucG9sYXJpdHlNb2RlXG4gICAgICApO1xuICAgICAgZnJhbWVOcisrO1xuICAgIH1cblxuICAgIHJlbmRlck1vZHVsZS5yZW5kZXIoY2FudmFzLmNvbnRleHQpO1xuICAgIGlmICh1bmlmb3Jtcy5jdWVFbmFibGVkKSBkaXNwbGF5Q3VlKCk7XG4gICAgdGVsZW1ldHJ5LnNuYXBzaG90KHRpbWUsIGNhbnZhcy5jYW52YXMpO1xuICAgIGlmICghcGF1c2VkKSB0ZWxlbWV0cnkudXBkYXRlKHRpbWUsIGZyYW1lTnIsIHVuaWZvcm1zLmVxdWlsaWJyaXVtTGluZURpc3RhbmNlKS5jYXRjaChzdG9wU2ltdWxhdGlvbik7XG4gICAgaWYgKHRpbWUgJSAzMCA9PT0gMClcbiAgICAgIG1lY2hhbmljYWxTdW1tYXJ5KClcbiAgICAgICAgLnRoZW4oKHsgbW90b3JzLCB0ZXRoZXJzIH0pID0+IHtcbiAgICAgICAgICBjb25zdCBzdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpO1xuICAgICAgICAgIGlmIChzdGF0dXMpXG4gICAgICAgICAgICBzdGF0dXMudGV4dENvbnRlbnQgPSBgU2VlZCAke3NlZWR9IMK3ICR7bW90b3JzfSBtb3RvciBsaW5rcyDCtyAke3RldGhlcnN9IHRldGhlcnMgwrcgY29ydGV4ICR7dW5pZm9ybXMuY29ydGV4UG9seW1lcml6YXRpb24gPiAwID8gXCJvblwiIDogXCJvZmZcIn1gO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3RvcFNpbXVsYXRpb24pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gbWVjaGFuaWNhbFN1bW1hcnkoKSB7XG4gICAgY29uc3QgYnVmZmVyID0gYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9MSU5LU107XG4gICAgY29uc3Qgc3RhZ2luZyA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiBidWZmZXIuc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKGJ1ZmZlciwgMCwgc3RhZ2luZywgMCwgYnVmZmVyLnNpemUpO1xuICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICBhd2FpdCBzdGFnaW5nLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3Qgd29yZHMgPSBuZXcgVWludDMyQXJyYXkoc3RhZ2luZy5nZXRNYXBwZWRSYW5nZSgpKTtcbiAgICBsZXQgbW90b3JzID0gMCxcbiAgICAgIHRldGhlcnMgPSAwLFxuICAgICAgcG9zdGVyaW9yVGV0aGVycyA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3b3Jkcy5sZW5ndGggLyA4OyBpKyspIHtcbiAgICAgIGlmICh3b3Jkc1tpICogOF0pIHtcbiAgICAgICAgaWYgKGkgPCAyNTYpIG1vdG9ycysrO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB0ZXRoZXJzKys7XG4gICAgICAgICAgY29uc3QgYXJjID0gKGkgLSAyNTYpIC8gdW5pZm9ybXMubWVtYnJhbmVDb3VudDtcbiAgICAgICAgICBpZiAoYXJjID4gMC4yNSAmJiBhcmMgPCAwLjc1KSBwb3N0ZXJpb3JUZXRoZXJzKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgc3RhZ2luZy51bm1hcCgpO1xuICAgIHN0YWdpbmcuZGVzdHJveSgpO1xuICAgIHJldHVybiB7IG1vdG9ycywgdGV0aGVycywgcG9zdGVyaW9yVGV0aGVycyB9O1xuICB9XG5cbiAgY29uc3QgY3VlTWFya2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjdWUtbWFya2VyXCIpITtcbiAgZnVuY3Rpb24gZGlzcGxheUN1ZSgpIHtcbiAgICBjdWVNYXJrZXIuaGlkZGVuID0gIXVuaWZvcm1zLmN1ZUVuYWJsZWQ7XG4gICAgY29uc3QgcmVjdCA9IGNhbnZhcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgcG9pbnQgPSByZW5kZXJNb2R1bGUud29ybGRUb1NjcmVlbih1bmlmb3Jtcy5jdWVYLCB1bmlmb3Jtcy5jdWVZKTtcbiAgICBjdWVNYXJrZXIuc3R5bGUubGVmdCA9IGAke3JlY3QubGVmdCArIChwb2ludC54IC8gYWN0dWFsV2lkdGgpICogcmVjdC53aWR0aH1weGA7XG4gICAgY3VlTWFya2VyLnN0eWxlLnRvcCA9IGAke3JlY3QudG9wICsgKHBvaW50LnkgLyBhY3R1YWxIZWlnaHQpICogcmVjdC5oZWlnaHR9cHhgO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3VlLXN0YXR1c1wiKSEudGV4dENvbnRlbnQgPSB1bmlmb3Jtcy5wb2xhcml0eU1vZGVcbiAgICAgID8gXCJQZXJzaXN0ZW50IGhlYWRpbmcgwrcgZHJhZyB0byBzZXQgYSBuZXcgZGlyZWN0aW9uIMK3IEVzYyBmYWNlcyByaWdodFwiXG4gICAgICA6IHVuaWZvcm1zLmN1ZUVuYWJsZWRcbiAgICAgICAgPyBcIlBvbGFyaXR5IGN1ZSBhY3RpdmUgwrcgZHJhZyB0byBtb3ZlIMK3IEVzYyB0byBjbGVhclwiXG4gICAgICAgIDogXCJDbGljayBvciBkcmFnIHRoZSBjYW52YXMgdG8gbW92ZSB0aGUgYWN0aXZlIGVkZ2VcIjtcbiAgfVxuICBmdW5jdGlvbiBzZXRDdWUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSB0aHJvdyBuZXcgRXJyb3IoXCJDdWUgY29vcmRpbmF0ZXMgbXVzdCBiZSBmaW5pdGVcIik7XG4gICAgdW5pZm9ybXMuY3VlWCA9IE1hdGgubWF4KDAsIE1hdGgubWluKGFjdHVhbFdpZHRoLCB4KSk7XG4gICAgdW5pZm9ybXMuY3VlWSA9IE1hdGgubWF4KDAsIE1hdGgubWluKGFjdHVhbEhlaWdodCwgeSkpO1xuICAgIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPSAxO1xuICAgIGN1ZVZlcnNpb24rKztcbiAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICBsaXZlUGVyZm9ybWFuY2UuaW5wdXQoKTtcbiAgICBkaXNwbGF5Q3VlKCk7XG4gIH1cbiAgZnVuY3Rpb24gY2xlYXJDdWUoKSB7XG4gICAgdW5pZm9ybXMuY3VlRW5hYmxlZCA9IDA7XG4gICAgY3VlVmVyc2lvbisrO1xuICAgIGNvbnRyb2xzRGlydHkgPSB0cnVlO1xuICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICAgIGRpc3BsYXlDdWUoKTtcbiAgfVxuICBhc3luYyBmdW5jdGlvbiBjdWVTdGF0ZSgpIHtcbiAgICBjb25zdCBzdGFnaW5nID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7IHNpemU6IDMyLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIoYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9TTkFQU0hPVF0sIDMyICogKHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50ICsgMSksIHN0YWdpbmcsIDAsIDMyKTtcbiAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgIGF3YWl0IHN0YWdpbmcubWFwQXN5bmMoR1BVTWFwTW9kZS5SRUFEKTtcbiAgICAgIGNvbnN0IGRhdGEgPSBzdGFnaW5nLmdldE1hcHBlZFJhbmdlKCksXG4gICAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkoZGF0YSksXG4gICAgICAgIGYgPSBuZXcgRmxvYXQzMkFycmF5KGRhdGEpO1xuICAgICAgcmV0dXJuIHsgaW5kZXg6IHVbNF0sIHZlcnNpb246IHVbNV0sIHg6IGZbMF0sIHk6IGZbMV0sIGF4aXNYOiBmWzJdLCBheGlzWTogZlszXSwgZW5hYmxlZDogISF1bmlmb3Jtcy5jdWVFbmFibGVkLCBzdGVwOiBmcmFtZU5yIH07XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChzdGFnaW5nLm1hcFN0YXRlID09PSBcIm1hcHBlZFwiKSBzdGFnaW5nLnVubWFwKCk7XG4gICAgICBzdGFnaW5nLmRlc3Ryb3koKTtcbiAgICB9XG4gIH1cbiAgY2FudmFzLmNhbnZhcy5zdHlsZS50b3VjaEFjdGlvbiA9IFwibm9uZVwiO1xuICBsZXQgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgY29uc3QgcG9pbnRDdWUgPSAoZTogUG9pbnRlckV2ZW50KSA9PiB7XG4gICAgY29uc3QgcmVjdCA9IGNhbnZhcy5jYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgcG9pbnQgPSByZW5kZXJNb2R1bGUuc2NyZWVuVG9Xb3JsZCgoKGUuY2xpZW50WCAtIHJlY3QubGVmdCkgLyByZWN0LndpZHRoKSAqIGFjdHVhbFdpZHRoLCAoKGUuY2xpZW50WSAtIHJlY3QudG9wKSAvIHJlY3QuaGVpZ2h0KSAqIGFjdHVhbEhlaWdodCk7XG4gICAgc2V0Q3VlKHBvaW50LngsIHBvaW50LnkpO1xuICB9O1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJwb2ludGVyZG93blwiLCAoZSkgPT4ge1xuICAgIGlmIChlLmJ1dHRvbiAhPT0gMCkgcmV0dXJuO1xuICAgIGRyYWdnaW5nID0gdHJ1ZTtcbiAgICBjYW52YXMuY2FudmFzLnNldFBvaW50ZXJDYXB0dXJlKGUucG9pbnRlcklkKTtcbiAgICBwb2ludEN1ZShlKTtcbiAgfSk7XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJtb3ZlXCIsIChlKSA9PiB7XG4gICAgaWYgKGRyYWdnaW5nKSBwb2ludEN1ZShlKTtcbiAgfSk7XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJ1cFwiLCAoKSA9PiB7XG4gICAgZHJhZ2dpbmcgPSBmYWxzZTtcbiAgfSk7XG4gIGNhbnZhcy5jYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcInBvaW50ZXJjYW5jZWxcIiwgKCkgPT4ge1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gIH0pO1xuICBjYW52YXMuY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJsb3N0cG9pbnRlcmNhcHR1cmVcIiwgKCkgPT4ge1xuICAgIGRyYWdnaW5nID0gZmFsc2U7XG4gIH0pO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLCAoKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLmZpdEltbWVkaWF0ZWx5KCk7XG4gICAgdXBkYXRlVmlldygpO1xuICB9KTtcbiAgZGlzcGxheUN1ZSgpO1xuXG4gIGZ1bmN0aW9uIHVwZGF0ZVZpZXcoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5kYXRhc2V0LnZpZXcgPSByZW5kZXJNb2R1bGUudmlldy5tb2RlID8gXCJtaWNyb3Njb3BlXCIgOiBcImRpYWdub3N0aWNcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbW8tdGl0bGVcIikhLnRleHRDb250ZW50ID0gcmVuZGVyTW9kdWxlLnZpZXcubW9kZSA/IFwiQ2VsbCDCtyB0cmFuc21pdHRlZCBsaWdodFwiIDogXCJFeHBsaWNpdCBmaWxhbWVudHMgwrcgZGlhZ25vc3RpY3NcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZXctem9vbS12YWx1ZVwiKSEudGV4dENvbnRlbnQgPSBgJHtyZW5kZXJNb2R1bGUudmlldy56b29tLnRvRml4ZWQoMSl9w5dgO1xuICAgIHJlbmRlck1vZHVsZS5yZW5kZXIoY2FudmFzLmNvbnRleHQpO1xuICAgIGRpc3BsYXlDdWUoKTtcbiAgfVxuICBjb25zdCB2aWV3U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWV3LW1vZGVcIikgYXMgSFRNTFNlbGVjdEVsZW1lbnQ7XG4gIHZpZXdTZWxlY3QudmFsdWUgPSBTdHJpbmcocmVuZGVyTW9kdWxlLnZpZXcubW9kZSk7XG4gIHZpZXdTZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgcmVuZGVyTW9kdWxlLnZpZXcubW9kZSA9IE51bWJlcih2aWV3U2VsZWN0LnZhbHVlKTtcbiAgICB1cGRhdGVWaWV3KCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IFtpZCwga2V5XSBvZiBbXG4gICAgW1widmlldy16b29tXCIsIFwiem9vbVwiXSxcbiAgICBbXCJ2aWV3LWZvY3VzXCIsIFwiZm9jdXNcIl0sXG4gICAgW1widmlldy1jb250cmFzdFwiLCBcImNvbnRyYXN0XCJdLFxuICBdIGFzIGNvbnN0KSB7XG4gICAgY29uc3QgaW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBpbnB1dC52YWx1ZSA9IFN0cmluZyhyZW5kZXJNb2R1bGUudmlld1trZXldKTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgKCkgPT4ge1xuICAgICAgcmVuZGVyTW9kdWxlLnZpZXdba2V5XSA9IE51bWJlcihpbnB1dC52YWx1ZSk7XG4gICAgICBpZiAoa2V5ID09PSBcInpvb21cIikgcmVuZGVyTW9kdWxlLnZpZXcuYXV0b0ZpdCA9IGZhbHNlO1xuICAgICAgdXBkYXRlVmlldygpO1xuICAgIH0pO1xuICB9XG4gIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvbGxvdy1jZWxsXCIpIGFzIEhUTUxJbnB1dEVsZW1lbnQpLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKGUpID0+IHtcbiAgICByZW5kZXJNb2R1bGUudmlldy5mb2xsb3cgPSAoZS50YXJnZXQgYXMgSFRNTElucHV0RWxlbWVudCkuY2hlY2tlZDtcbiAgICB1cGRhdGVWaWV3KCk7XG4gIH0pO1xuICB1cGRhdGVWaWV3KCk7XG4gIGNvbnN0IHNldHRpbmdzUGFuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbW8tcGFuZWxcIikhO1xuICBjb25zdCBzZXR0aW5nc0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidG9nZ2xlLXNldHRpbmdzXCIpITtcbiAgZnVuY3Rpb24gc2V0U2V0dGluZ3Mob3BlbjogYm9vbGVhbikge1xuICAgIHNldHRpbmdzUGFuZWwuaGlkZGVuID0gIW9wZW47XG4gICAgc2V0dGluZ3NCdXR0b24uc2V0QXR0cmlidXRlKFwiYXJpYS1leHBhbmRlZFwiLCBTdHJpbmcob3BlbikpO1xuICAgIGRvY3VtZW50LmJvZHkuZGF0YXNldC5zZXR0aW5ncyA9IG9wZW4gPyBcIm9wZW5cIiA6IFwiY2xvc2VkXCI7XG4gICAgaWYgKG9wZW4pIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2Utc2V0dGluZ3NcIikhLmZvY3VzKCk7XG4gICAgZWxzZSBzZXR0aW5nc0J1dHRvbi5mb2N1cygpO1xuICB9XG4gIHNldHRpbmdzQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiBzZXRTZXR0aW5ncyhzZXR0aW5nc1BhbmVsLmhpZGRlbikpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlLXNldHRpbmdzXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gc2V0U2V0dGluZ3MoZmFsc2UpKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmaXQtY2VsbFwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICByZW5kZXJNb2R1bGUudmlldy5hdXRvRml0ID0gdHJ1ZTtcbiAgICByZW5kZXJNb2R1bGUudmlldy5mb2xsb3cgPSB0cnVlO1xuICAgIHJlbmRlck1vZHVsZS5maXRJbW1lZGlhdGVseSgpO1xuICAgIHVwZGF0ZVZpZXcoKTtcbiAgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVzdG9yZS1kZW1vXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5wYXRobmFtZSArIFwiP2RlbW89MVwiO1xuICB9KTtcbiAgc2V0dGluZ3NQYW5lbC5hcHBlbmQoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkaWFnbm9zdGljc1wiKSEpO1xuICBzZXR0aW5nc1BhbmVsLmFwcGVuZChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZwc0NvdW50ZXJcIikhKTtcblxuICAod2luZG93IGFzIGFueSkuZmlsYW1lbnREZW1vID0ge1xuICAgIHNlZWQsXG4gICAgdW5pZm9ybXMsXG4gICAgZ3B1RXJyb3JzLFxuICAgIHJ1bnRpbWVFcnJvcnMsXG4gICAgY29udGFjdFJlY292ZXJ5OiByZWNvdmVyeSxcbiAgICB2aWV3OiByZW5kZXJNb2R1bGUudmlldyxcbiAgICByZWRyYXc6IHVwZGF0ZVZpZXcsXG4gICAgc2NyZWVuVG9Xb3JsZDogKHg6IG51bWJlciwgeTogbnVtYmVyKSA9PiByZW5kZXJNb2R1bGUuc2NyZWVuVG9Xb3JsZCh4LCB5KSxcbiAgICBzZXRDdWUsXG4gICAgY2xlYXJDdWUsXG4gICAgY3VlU3RhdGUsXG4gICAgZ2V0IHBhdXNlZCgpIHtcbiAgICAgIHJldHVybiBwYXVzZWQ7XG4gICAgfSxcbiAgICBnZXQgc3RlcCgpIHtcbiAgICAgIHJldHVybiBmcmFtZU5yO1xuICAgIH0sXG4gICAgcGVyZm9ybWFuY2VTbmFwc2hvdDogKCkgPT4gKHsgLi4ubGl2ZVBlcmZvcm1hbmNlLnNuYXBzaG90KCksIGRpYWdub3N0aWNzOiB7IC4uLnRlbGVtZXRyeS50aW1pbmdzIH0gfSksXG4gICAgcGF1c2U6ICgpID0+IHtcbiAgICAgIHNldFBhdXNlZCh0cnVlKTtcbiAgICB9LFxuICAgIHBsYXk6ICgpID0+IHtcbiAgICAgIHNldFBhdXNlZChmYWxzZSk7XG4gICAgfSxcbiAgICBhc3luYyBhZHZhbmNlKHN0ZXBzOiBudW1iZXIpIHtcbiAgICAgIGlmICghcGF1c2VkIHx8IHJlY292ZXJ5LmFjdGl2ZSB8fCBtYW51YWxBZHZhbmNlUGVuZGluZyB8fCAhTnVtYmVyLmlzSW50ZWdlcihzdGVwcykgfHwgc3RlcHMgPCAwIHx8IHN0ZXBzID4gMjAwMClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiUGF1c2UgYW5kIHJlcXVlc3Qgb25lIGJhdGNoIG9mIDDigJMyMDAwIHdob2xlIHN0ZXBzXCIpO1xuICAgICAgbWFudWFsQWR2YW5jZVBlbmRpbmcgPSB0cnVlO1xuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICAgICAgZm9yIChsZXQgcmVtYWluaW5nID0gc3RlcHM7IHJlbWFpbmluZyA+IDA7ICkge1xuICAgICAgICAgIGF3YWl0IHJlY292ZXJ5LndhaXQoKTtcbiAgICAgICAgICBpZiAocnVudGltZUVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihydW50aW1lRXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICAgIGNvbnN0IGJhdGNoID0gTWF0aC5taW4oMjAsIHJlbWFpbmluZyk7XG4gICAgICAgICAgYXdhaXQgdGltZXN0ZXAoYmF0Y2gpO1xuICAgICAgICAgIHJlbWFpbmluZyAtPSBiYXRjaDtcbiAgICAgICAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgICAgICAgIGlmIChncHVFcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoZ3B1RXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICB9XG4gICAgICAgIGF3YWl0IHRlbGVtZXRyeS51cGRhdGUodGltZSwgZnJhbWVOciwgdW5pZm9ybXMuZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2UsIHRydWUpO1xuICAgICAgICBhd2FpdCByZWNvdmVyeS53YWl0KCk7XG4gICAgICAgIGlmIChydW50aW1lRXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKHJ1bnRpbWVFcnJvcnMuam9pbihcIlxcblwiKSk7XG4gICAgICAgIHVwZGF0ZVZpZXcoKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmcHNDb3VudGVyXCIpIS50ZXh0Q29udGVudCA9IGBQYXVzZWQgwrcgc3RlcCAke2ZyYW1lTnJ9YDtcbiAgICAgICAgcmV0dXJuIHsgc3RhdHM6IHRlbGVtZXRyeS5oaXN0b3J5LmF0KC0xKSwgbGlua3M6IGF3YWl0IG1lY2hhbmljYWxTdW1tYXJ5KCksIGdwdUVycm9ycyB9O1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgbWFudWFsQWR2YW5jZVBlbmRpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9LFxuICB9O1xuXG4gIGlmICh1cmxQYXJhbXMuaGFzKFwibWVjaGFuaWNzVGVzdFwiKSkge1xuICAgICh3aW5kb3cgYXMgYW55KS5maWxhbWVudERlbW8udGVzdFJlbmV3YWwgPSAoKSA9PiB7XG4gICAgICBpZiAoIXBhdXNlZCkgdGhyb3cgRXJyb3IoXCJQYXVzZSBiZWZvcmUgZGVzdHJ1Y3RpdmUgcmVuZXdhbCBmaXh0dXJlc1wiKTtcbiAgICAgIHJldHVybiB0ZXN0UmVuZXdhbChcbiAgICAgICAgZGV2aWNlLFxuICAgICAgICB7XG4gICAgICAgICAgYWN0aW46IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLkFDVElOXSxcbiAgICAgICAgICBtZW1icmFuZTogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdLFxuICAgICAgICAgIGxpbmtzOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRUNIQU5JQ0FMX0xJTktTXSxcbiAgICAgICAgICBzbmFwc2hvdDogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9TTkFQU0hPVF0sXG4gICAgICAgIH0sXG4gICAgICAgIHsgYWN0aW46IHVuaWZvcm1zLmFjdGluQ291bnQsIG1lbWJyYW5lOiB1bmlmb3Jtcy5tZW1icmFuZUNvdW50IH0sXG4gICAgICAgICh2YWx1ZXMpID0+IHtcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHVuaWZvcm1zLCB2YWx1ZXMpO1xuICAgICAgICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICAgICAgfSxcbiAgICAgICAgKGtpbmQsIHJlcGVhdHMgPSAxKSA9PiB7XG4gICAgICAgICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpLFxuICAgICAgICAgICAgcGFzcyA9IGVuY29kZXIuYmVnaW5Db21wdXRlUGFzcygpO1xuICAgICAgICAgIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cFNpbXVsYXRlKTtcbiAgICAgICAgICBpZiAoa2luZCA9PT0gXCJwb2xhcml0eVwiKSB7XG4gICAgICAgICAgICBwYXNzLnNldFBpcGVsaW5lKHNpbVBpcGVsaW5lcy5tZWFzdXJlRW5jbG9zdXJlKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKDEpO1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMucmVzb2x2ZUN1ZSk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcygxKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09IFwidHVybm92ZXJcIikge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMudW5iaW5kTWluUG9sZSk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGtpbmQgPT09IFwibW90b3JcIikge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTiArIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubW90b3JMaW5rcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcygxKTtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmFwcGx5TWVjaGFuaWNhbEZvcmNlcyk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULkFDVElOICsgQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5NRU1CUkFORSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhc3Muc2V0UGlwZWxpbmUoc2ltUGlwZWxpbmVzLmFjdGluZXNUb1RleHR1cmVzKTtcbiAgICAgICAgICAgIHBhc3MuZGlzcGF0Y2hXb3JrZ3JvdXBzKEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuQUNUSU4pO1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MpO1xuICAgICAgICAgICAgcGFzcy5kaXNwYXRjaFdvcmtncm91cHMoQlVGRkVSX1dPUktHUk9VUF9DT1VOVC5BQ1RJTiArIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQuTUVNQlJBTkUpO1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShzaW1QaXBlbGluZXMubWVtYnJhbmVUZXRoZXJzKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVwZWF0czsgaSsrKSBwYXNzLmRpc3BhdGNoV29ya2dyb3VwcyhCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcGFzcy5lbmQoKTtcbiAgICAgICAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgICAod2luZG93IGFzIGFueSkuZmlsYW1lbnREZW1vLnRlc3RFbmNsb3N1cmUgPSAoKSA9PiB7XG4gICAgICBpZiAoIXBhdXNlZCkgdGhyb3cgbmV3IEVycm9yKFwiUGF1c2UgYmVmb3JlIHJ1bm5pbmcgZGVzdHJ1Y3RpdmUgZW5jbG9zdXJlIGZpeHR1cmVzXCIpO1xuICAgICAgcmV0dXJuIHRlc3RFbmNsb3N1cmUoXG4gICAgICAgIGRldmljZSxcbiAgICAgICAgeyBhY3RpbjogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLCBtZW1icmFuZTogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVNQlJBTkVdIH0sXG4gICAgICAgIHsgYWN0aW46IHVuaWZvcm1zLmFjdGluQ291bnQsIG1lbWJyYW5lOiB1bmlmb3Jtcy5tZW1icmFuZUNvdW50IH0sXG4gICAgICAgICgpID0+IHJ1bkVuY2xvc3VyZShkZXZpY2UsIHNpbVBpcGVsaW5lcywgYmluZEdyb3VwU2ltdWxhdGUsIEJVRkZFUl9XT1JLR1JPVVBfQ09VTlQsIGFjdHVhbEhlaWdodCksXG4gICAgICAgIChmaXhlZEFyZWEsIGFyZWEpID0+IHtcbiAgICAgICAgICB1bmlmb3Jtcy5nQWN0aW5GaWVsZCA9IDE7XG4gICAgICAgICAgdW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbiA9IGZpeGVkQXJlYSA/IDEgOiAwO1xuICAgICAgICAgIHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCA9IE1hdGguc3FydCg0ICogTWF0aC5QSSAqIGFyZWEpIC8gdW5pZm9ybXMubWVtYnJhbmVDb3VudDtcbiAgICAgICAgICB3cml0ZVVuaWZvcm1zKCk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcbiAgICAod2luZG93IGFzIGFueSkuZmlsYW1lbnREZW1vLnRlc3RNZWNoYW5pY3MgPSAoKSA9PiB7XG4gICAgICBpZiAoIXBhdXNlZCkgdGhyb3cgbmV3IEVycm9yKFwiUGF1c2UgYmVmb3JlIHJ1bm5pbmcgZGVzdHJ1Y3RpdmUgbWVjaGFuaWNhbCBmaXh0dXJlc1wiKTtcbiAgICAgIHJldHVybiB0ZXN0TWVjaGFuaWNzKFxuICAgICAgICBkZXZpY2UsXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpbjogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuQUNUSU5dLFxuICAgICAgICAgIG1lbWJyYW5lOiBhZ2VudF9idWZmZXJzW0JJTkRJTkdTX0FHRU5UUy5NRU1CUkFORV0sXG4gICAgICAgICAgbGlua3M6IGFnZW50X2J1ZmZlcnNbQklORElOR1NfQUdFTlRTLk1FQ0hBTklDQUxfTElOS1NdLFxuICAgICAgICAgIGZvcmNlczogYWdlbnRfYnVmZmVyc1tCSU5ESU5HU19BR0VOVFMuTUVDSEFOSUNBTF9GT1JDRVNdLFxuICAgICAgICB9LFxuICAgICAgICB7IGFjdGluOiB1bmlmb3Jtcy5hY3RpbkNvdW50LCBtZW1icmFuZTogdW5pZm9ybXMubWVtYnJhbmVDb3VudCB9LFxuICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgICAgICAgIGNvbnN0IHBhc3MgPSBlbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICAgICAgICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXBTaW11bGF0ZSk7XG4gICAgICAgICAgY29uc3QgY291bnQgPSBNYXRoLmNlaWwoKHVuaWZvcm1zLmFjdGluQ291bnQgKyB1bmlmb3Jtcy5tZW1icmFuZUNvdW50KSAvIFdPUktHUk9VUF9TSVpFKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IFtwaXBlbGluZSwgZ3JvdXBzXSBvZiBbXG4gICAgICAgICAgICBbc2ltUGlwZWxpbmVzLnJlc29sdmVDdWUsIDFdLFxuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgY291bnRdLFxuICAgICAgICAgICAgW3NpbVBpcGVsaW5lcy5tb3RvckxpbmtzLCAxXSxcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMubWVtYnJhbmVUZXRoZXJzLCBCVUZGRVJfV09SS0dST1VQX0NPVU5ULk1FTUJSQU5FXSxcbiAgICAgICAgICAgIFtzaW1QaXBlbGluZXMuYXBwbHlNZWNoYW5pY2FsRm9yY2VzLCBjb3VudF0sXG4gICAgICAgICAgXSBhcyBjb25zdCkge1xuICAgICAgICAgICAgcGFzcy5zZXRQaXBlbGluZShwaXBlbGluZSk7XG4gICAgICAgICAgICBwYXNzLmRpc3BhdGNoV29ya2dyb3Vwcyhncm91cHMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwYXNzLmVuZCgpO1xuICAgICAgICAgIGRldmljZS5xdWV1ZS5zdWJtaXQoW2VuY29kZXIuZmluaXNoKCldKTtcbiAgICAgICAgfSxcbiAgICAgICAgKHN0cmVuZ3RoLCBjb3VwbGluZywgZHJhZykgPT4ge1xuICAgICAgICAgIHVuaWZvcm1zLm15b3NpblN0cmVuZ3RoID0gc3RyZW5ndGg7XG4gICAgICAgICAgdW5pZm9ybXMubWVtYnJhbmVDb3VwbGluZyA9IGNvdXBsaW5nO1xuICAgICAgICAgIHVuaWZvcm1zLnN1YnN0cmF0ZURyYWcgPSBkcmFnO1xuICAgICAgICAgIHVuaWZvcm1zLmN1ZUVuYWJsZWQgPSAwO1xuICAgICAgICAgIHdyaXRlVW5pZm9ybXMoKTtcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9O1xuICB9XG5cbiAgY29uc3QgcGF1c2VCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhdXNlLWRlbW9cIikhO1xuICBwYXVzZUJ1dHRvbi50ZXh0Q29udGVudCA9IHBhdXNlZCA/IFwiUmVzdW1lXCIgOiBcIlBhdXNlXCI7XG4gIHBhdXNlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgc2V0UGF1c2VkKCFwYXVzZWQpO1xuICB9KTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyZXNldC1kZW1vXCIpIS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gbG9jYXRpb24ucmVsb2FkKCkpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsZWFyLWN1ZVwiKSEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsZWFyQ3VlKTtcbiAgY29uc3Qgc3RlcEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RlcC1kZW1vXCIpIGFzIEhUTUxCdXR0b25FbGVtZW50O1xuICBhc3luYyBmdW5jdGlvbiBzaW5nbGVTdGVwKCkge1xuICAgIGlmIChzdGVwQnV0dG9uLmRpc2FibGVkKSByZXR1cm47XG4gICAgc3RlcEJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgc2V0UGF1c2VkKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCAod2luZG93IGFzIGFueSkuZmlsYW1lbnREZW1vLmFkdmFuY2UoMSk7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIHN0b3BTaW11bGF0aW9uKGVycm9yKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc3RlcEJ1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuICBzdGVwQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBzaW5nbGVTdGVwKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIChldmVudCkgPT4ge1xuICAgIGlmIChldmVudC5rZXkgPT09IFwiRXNjYXBlXCIgJiYgIXNldHRpbmdzUGFuZWwuaGlkZGVuKSB7XG4gICAgICBzZXRTZXR0aW5ncyhmYWxzZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgfHwgZXZlbnQuYWx0S2V5KSByZXR1cm47XG4gICAgaWYgKChldmVudC50YXJnZXQgYXMgSFRNTEVsZW1lbnQpPy5jbG9zZXN0KFwiaW5wdXQsc2VsZWN0LHRleHRhcmVhLGJ1dHRvbixbY29udGVudGVkaXRhYmxlPXRydWVdXCIpIHx8IGV2ZW50LnJlcGVhdCkgcmV0dXJuO1xuICAgIGlmIChldmVudC5jb2RlID09PSBcIlNwYWNlXCIpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBzZXRQYXVzZWQoIXBhdXNlZCk7XG4gICAgfSBlbHNlIGlmIChldmVudC5rZXkudG9Mb3dlckNhc2UoKSA9PT0gXCJuXCIpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2b2lkIHNpbmdsZVN0ZXAoKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleSA9PT0gXCJFc2NhcGVcIikge1xuICAgICAgY2xlYXJDdWUoKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50LmtleS50b0xvd2VyQ2FzZSgpID09PSBcInJcIikge1xuICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfVxuICB9KTtcbiAgZm9yIChjb25zdCBrZXkgb2YgW1wibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIsIFwibXlvc2luU3RyZW5ndGhcIiwgXCJtZW1icmFuZUNvdXBsaW5nXCJdIGFzIGNvbnN0KSB7XG4gICAgY29uc3Qgc2xpZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGxpdmUtJHtrZXl9YCkgYXMgSFRNTElucHV0RWxlbWVudDtcbiAgICBjb25zdCB2YWx1ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGB2YWx1ZS0ke2tleX1gKSE7XG4gICAgc2xpZGVyLnZhbHVlID0gU3RyaW5nKHVuaWZvcm1zW2tleV0pO1xuICAgIHZhbHVlLnRleHRDb250ZW50ID0gdW5pZm9ybXNba2V5XS50b0ZpeGVkKGtleSA9PT0gXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIiA/IDIgOiAzKTtcbiAgICBzbGlkZXIuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsICgpID0+IHtcbiAgICAgIHVuaWZvcm1zW2tleV0gPSBOdW1iZXIoc2xpZGVyLnZhbHVlKTtcbiAgICAgIHZhbHVlLnRleHRDb250ZW50ID0gdW5pZm9ybXNba2V5XS50b0ZpeGVkKGtleSA9PT0gXCJsYW1lbGxpcG9kaXVtU3RyZW5ndGhcIiA/IDIgOiAzKTtcbiAgICAgIGNvbnRyb2xzRGlydHkgPSB0cnVlO1xuICAgICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgYWRhcHRpdmUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkYXB0aXZlLWZyYW1lc1wiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICBhZGFwdGl2ZS5jaGVja2VkID0gISF1bmlmb3Jtcy5hZGFwdGl2ZUZyYW1lcztcbiAgYWRhcHRpdmUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgdW5pZm9ybXMuYWRhcHRpdmVGcmFtZXMgPSBhZGFwdGl2ZS5jaGVja2VkID8gMSA6IDA7XG4gICAgbGl2ZVBlcmZvcm1hbmNlLmlucHV0KCk7XG4gIH0pO1xuICBjb25zdCBjZWxsU2l6ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2VsbC1zaXplXCIpIGFzIEhUTUxTZWxlY3RFbGVtZW50O1xuICBjb25zdCBjb21wYWN0TGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGFjdC1kZW1vXCIpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICBjb25zdCBjb21wYWN0VXJsID0gbmV3IFVSTChjb21wYWN0TGluay5ocmVmKTtcbiAgY29tcGFjdFVybC5zZWFyY2hQYXJhbXMuc2V0KFwic2VlZFwiLCBTdHJpbmcoc2VlZCkpO1xuICBjb21wYWN0TGluay5ocmVmID0gY29tcGFjdFVybC50b1N0cmluZygpO1xuICBjb25zdCByZW5ld2FsTGluayA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicmVuZXdhbC1kZW1vXCIpIGFzIEhUTUxBbmNob3JFbGVtZW50O1xuICBjb25zdCByZW5ld2FsVXJsID0gbmV3IFVSTChyZW5ld2FsTGluay5ocmVmKTtcbiAgcmVuZXdhbFVybC5zZWFyY2hQYXJhbXMuc2V0KFwic2VlZFwiLCBTdHJpbmcoc2VlZCkpO1xuICByZW5ld2FsTGluay5ocmVmID0gcmVuZXdhbFVybC50b1N0cmluZygpO1xuICBjb25zdCBzZWxlY3RlZFNpemUgPSBTdHJpbmcodW5pZm9ybXMubWVtYnJhbmVSZXN0TGVuZ3RoKTtcbiAgaWYgKCFbLi4uY2VsbFNpemUub3B0aW9uc10uc29tZSgob3B0aW9uKSA9PiBvcHRpb24udmFsdWUgPT09IHNlbGVjdGVkU2l6ZSkpIHtcbiAgICBjZWxsU2l6ZS5hZGQobmV3IE9wdGlvbihgJHtNYXRoLnJvdW5kKDE1MCAqIHVuaWZvcm1zLm1lbWJyYW5lUmVzdExlbmd0aCl9JSAoY3VzdG9tKWAsIHNlbGVjdGVkU2l6ZSkpO1xuICB9XG4gIGNlbGxTaXplLnZhbHVlID0gc2VsZWN0ZWRTaXplO1xuICBjZWxsU2l6ZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICBjb25zdCBuZXh0ID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJtZW1icmFuZVJlc3RMZW5ndGhcIiwgY2VsbFNpemUudmFsdWUpO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBuZXh0LnRvU3RyaW5nKCk7XG4gIH0pO1xuICBmb3IgKGNvbnN0IG5hbWUgb2YgW1wiZ0FjdGluRmllbGRcIiwgXCJhcmVhQ29uc2VydmF0aW9uXCJdIGFzIGNvbnN0KSB7XG4gICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChuYW1lKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICAgIGNoZWNrYm94LmNoZWNrZWQgPSB1bmlmb3Jtc1tuYW1lXSA+IDA7XG4gICAgY2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0ID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcbiAgICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChuYW1lLCBjaGVja2JveC5jaGVja2VkID8gXCIxXCIgOiBcIjBcIik7XG4gICAgICBsb2NhdGlvbi5ocmVmID0gbmV4dC50b1N0cmluZygpO1xuICAgIH0pO1xuICB9XG4gIGNvbnN0IGNvcnRleFRvZ2dsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29ydGV4LXRvZ2dsZVwiKSBhcyBIVE1MSW5wdXRFbGVtZW50O1xuICBjb3J0ZXhUb2dnbGUuY2hlY2tlZCA9IHVuaWZvcm1zLmNvcnRleFBvbHltZXJpemF0aW9uID4gMDtcbiAgY29ydGV4VG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgIGNvbnN0IG5leHQgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuICAgIG5leHQuc2VhcmNoUGFyYW1zLnNldChcImNvcnRleFBvbHltZXJpemF0aW9uXCIsIGNvcnRleFRvZ2dsZS5jaGVja2VkID8gXCIwLjAzXCIgOiBcIjBcIik7XG4gICAgbG9jYXRpb24uaHJlZiA9IG5leHQudG9TdHJpbmcoKTtcbiAgfSk7XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVjaGFuaWNhbC1zdGF0dXNcIikhLnRleHRDb250ZW50ID0gYFNlZWQgJHtzZWVkfSDCtyBtb3RvciAke3VuaWZvcm1zLm15b3NpblN0cmVuZ3RofSDCtyBjb3VwbGluZyAke3VuaWZvcm1zLm1lbWJyYW5lQ291cGxpbmd9YDtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmNsb3N1cmUtc3RhdHVzXCIpIS50ZXh0Q29udGVudCA9XG4gICAgYEctYWN0aW46ICR7dW5pZm9ybXMuZ0FjdGluRmllbGQgPyBcImNvbnNlcnZlZCwgd2VsbC1taXhlZCBwb29sXCIgOiBcImxlZ2FjeSBwYXJ0aWNsZXNcIn0gwrcgYXJlYTogJHt1bmlmb3Jtcy5hcmVhQ29uc2VydmF0aW9uID8gXCJjb25zdHJhaW5lZFwiIDogXCJmcmVlXCJ9YDtcbiAgZm9yIChjb25zdCBhbmNob3Igb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbDxIVE1MQW5jaG9yRWxlbWVudD4oXCJbZGF0YS1jYXNlXVwiKSkge1xuICAgIGNvbnN0IG5leHQgPSBuZXcgVVJMKGFuY2hvci5ocmVmKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJzZWVkXCIsIFN0cmluZyhzZWVkKSk7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiY29ydGV4UG9seW1lcml6YXRpb25cIiwgU3RyaW5nKHVuaWZvcm1zLmNvcnRleFBvbHltZXJpemF0aW9uKSk7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwibWVtYnJhbmVSZXN0TGVuZ3RoXCIsIFN0cmluZyh1bmlmb3Jtcy5tZW1icmFuZVJlc3RMZW5ndGgpKTtcbiAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoXCJhY3RpbkNvdW50XCIsIFN0cmluZyh1bmlmb3Jtcy5hY3RpbkNvdW50KSk7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiZ0FjdGluRmllbGRcIiwgU3RyaW5nKHVuaWZvcm1zLmdBY3RpbkZpZWxkKSk7XG4gICAgbmV4dC5zZWFyY2hQYXJhbXMuc2V0KFwiYXJlYUNvbnNlcnZhdGlvblwiLCBTdHJpbmcodW5pZm9ybXMuYXJlYUNvbnNlcnZhdGlvbikpO1xuICAgIGZvciAoY29uc3Qga2V5IG9mIFtcbiAgICAgIFwicG9sYXJpdHlNb2RlXCIsXG4gICAgICBcInBvbGFyaXR5VHVyblJhdGVcIixcbiAgICAgIFwicmVhclR1cm5vdmVyXCIsXG4gICAgICBcInR1cm5vdmVyQWdlXCIsXG4gICAgICBcInRldGhlclR1cm5vdmVyXCIsXG4gICAgICBcInRldGhlck9uUmF0ZVwiLFxuICAgICAgXCJ0ZXRoZXJPZmZSYXRlXCIsXG4gICAgICBcInRldGhlclJlY292ZXJ5U3RlcHNcIixcbiAgICAgIFwibW90b3JSZWFyQmlhc1wiLFxuICAgICAgXCJmcm9udEFsaWdubWVudFwiLFxuICAgICAgXCJ0ZXRoZXJMb2FkT2ZmXCIsXG4gICAgICBcImNvbG91ckFnZVwiLFxuICAgIF0gYXMgY29uc3QpXG4gICAgICBuZXh0LnNlYXJjaFBhcmFtcy5zZXQoa2V5LCBTdHJpbmcodW5pZm9ybXNba2V5XSkpO1xuICAgIGFuY2hvci5ocmVmID0gbmV4dC50b1N0cmluZygpO1xuICAgIGNvbnN0IGFjdGl2ZSA9XG4gICAgICBOdW1iZXIobmV4dC5zZWFyY2hQYXJhbXMuZ2V0KFwibXlvc2luU3RyZW5ndGhcIikgPz8gMCkgPT09IHVuaWZvcm1zLm15b3NpblN0cmVuZ3RoICYmXG4gICAgICBOdW1iZXIobmV4dC5zZWFyY2hQYXJhbXMuZ2V0KFwibWVtYnJhbmVDb3VwbGluZ1wiKSA/PyAwKSA9PT0gdW5pZm9ybXMubWVtYnJhbmVDb3VwbGluZyAmJlxuICAgICAgTnVtYmVyKG5leHQuc2VhcmNoUGFyYW1zLmdldChcIm1lbWJyYW5lU3RpZmZuZXNzXCIpID8/IDMpID09PSB1bmlmb3Jtcy5tZW1icmFuZVN0aWZmbmVzcztcbiAgICBhbmNob3Iuc2V0QXR0cmlidXRlKFwiYXJpYS1jdXJyZW50XCIsIFN0cmluZyhhY3RpdmUpKTtcbiAgfVxuXG4gIC8vIEdVSSBmb3IgY29udHJvbHMgZm9yIGRlc2t0b3Agb25seVxuICBpZiAoIWlzTW9iaWxlRGV2aWNlKSB7XG4gICAgbGV0IGd1aSA9IG5ldyBHVUkoeyBjb250YWluZXI6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWR2YW5jZWQtY29udHJvbHNcIikhIH0pO1xuXG4gICAgY29uc3QgbWVjaGFuaWNzID0gZ3VpLmFkZEZvbGRlcihcIkFjdG9teW9zaW4gaHlwb3RoZXNpc1wiKTtcbiAgICBjb25zdCByZW5ld2FsID0gZ3VpLmFkZEZvbGRlcihcIlBvbGFyaXR5IGFuZCByZW5ld2FsXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInBvbGFyaXR5TW9kZVwiLCB7IG1hdGVyaWFsUG9sZTogMCwgcGVyc2lzdGVudERpcmVjdGlvbjogMSB9KS5uYW1lKFwiUG9sYXJpdHkgZnJhbWVcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwicG9sYXJpdHlUdXJuUmF0ZVwiLCAwLjAwMSwgMC4xLCAwLjAwMSkubmFtZShcIlR1cm5pbmcgLyBzdGVwXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInJlYXJUdXJub3ZlclwiLCAwLCAwLjEsIDAuMDA1KS5uYW1lKFwiQWdlZCByZWFyIGNsZWFyYW5jZVwiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJ0dXJub3ZlckFnZVwiLCAxMDAsIDIwMDAsIDUwKS5uYW1lKFwiQWN0aW4gbWF0dXJhdGlvbiBzdGVwc1wiKTtcbiAgICByZW5ld2FsLmFkZCh1bmlmb3JtcywgXCJtb3RvclJlYXJCaWFzXCIsIDAsIDEsIDAuMDUpLm5hbWUoXCJNYXR1cmUtcmVhciBtb3RvciBiaWFzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcImZyb250QWxpZ25tZW50XCIsIDAsIDEsIDAuMDUpLm5hbWUoXCJGcm9udCBmaWxhbWVudCBhbGlnbm1lbnRcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwiY29sb3VyQWdlXCIsIHsgYXNzZW1ibHlSZWNlbmN5OiAwLCBiZWFkQWdlOiAxIH0pLm5hbWUoXCJBY3RpbiBjb2xvdXJzXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlclR1cm5vdmVyXCIsIHsgaW1tZWRpYXRlUmViaW5kaW5nOiAwLCBmaW5pdGVCaW5kaW5nOiAxIH0pLm5hbWUoXCJUZXRoZXIga2luZXRpY3NcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidGV0aGVyT25SYXRlXCIsIDAuMDAxLCAwLjEsIDAuMDAxKS5uYW1lKFwiVGV0aGVyIGJpbmRpbmcgLyBzdGVwXCIpO1xuICAgIHJlbmV3YWwuYWRkKHVuaWZvcm1zLCBcInRldGhlck9mZlJhdGVcIiwgMCwgMC4wMiwgMC4wMDEpLm5hbWUoXCJUZXRoZXIgcmVsZWFzZSAvIHN0ZXBcIik7XG4gICAgcmVuZXdhbC5hZGQodW5pZm9ybXMsIFwidGV0aGVyUmVjb3ZlcnlTdGVwc1wiLCAwLCAzMDAsIDEwKS5uYW1lKFwiVGV0aGVyIHVuYm91bmQgZHdlbGxcIik7XG4gICAgbWVjaGFuaWNzLmFkZCh1bmlmb3JtcywgXCJteW9zaW5TdHJlbmd0aFwiLCAwLCAwLjIsIDAuMDA1KS5uYW1lKFwiTW90b3IgY29udHJhY3RpbGl0eVwiKS5saXN0ZW4oKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcIm15b3NpblNwZWVkXCIsIDAsIDAuMSwgMC4wMDUpLm5hbWUoXCJMaW5rIHNob3J0ZW5pbmcgLyBzdGVwXCIpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwibWVtYnJhbmVDb3VwbGluZ1wiLCAwLCAwLjIsIDAuMDA1KS5uYW1lKFwiTWVtYnJhbmUgdGV0aGVyc1wiKS5saXN0ZW4oKTtcbiAgICBtZWNoYW5pY3MuYWRkKHVuaWZvcm1zLCBcInN1YnN0cmF0ZURyYWdcIiwgMCwgMjAsIDAuNSkubmFtZShcIkZyb250IGNsdXRjaCBkcmFnXCIpO1xuICAgIG1lY2hhbmljcy5hZGQodW5pZm9ybXMsIFwiY29ydGV4UG9seW1lcml6YXRpb25cIiwgMCwgMC4xLCAwLjAwNSkubmFtZShcIkJhc2FsIGNvcnRleCBhc3NlbWJseVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1vbm9tZXJPcGFjaXR5XCIsIDAsIDEsIDAuMDUpLm5hbWUoXCJNb25vbWVyIHZpc2liaWxpdHlcIik7XG5cbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImNvbXB1dGVTdGVwc1BlckZyYW1lXCIpLm1pbigxKS5tYXgoNzUpLnN0ZXAoMSkubmFtZShcIk1heCBzdGVwcyAvIGZyYW1lXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwidGFyZ2V0RlBTXCIpLm1pbigxKS5tYXgoMTIwKS5zdGVwKDEpLm5hbWUoXCJUYXJnZXQgRlBTXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3RpZmZuZXNzXCIpLm1pbigwLjApLm1heCgyLjApLm5hbWUoXCJTdGlmZm5lc3NcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJmb29kTmVhcmJ5VGhyZXNob2xkXCIpLm1pbigwLjAwMDAwMDEpLm1heCgxLjApLm5hbWUoXCJGb29kIE5lYXJieSBUaHJlc2hvbGRcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJkaXNjb25uZWN0aW9uUHJvYmFiaWxpdHlcIikubWluKDApLm1heCgwLjk5OSkubmFtZShcIkRpc2Nvbm5lY3Rpb24gcHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzdGVyaWNTYW1wbGluZ1JhbmdlXCIpLm1pbigxKS5tYXgoNTApLnN0ZXAoMSkubmFtZShcIlN0ZXJpYyBTYW1wbGluZyBSYW5nZVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImFjdGluQ29oZXNpb25SYW5nZVwiKS5taW4oMSkubWF4KDEwMCkuc3RlcCgxKS5uYW1lKFwiQWN0aW4gQ29oZXNpb24gUmFuZ2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJiaW5kUHJvYlwiKS5taW4oMC4wKS5tYXgoMC4xKS5zdGVwKDAuMDAwMSkubmFtZShcIkJpbmQgUHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpblN0ZXJpY0ZvcmNlXCIpLm1pbigwLjApLm1heCgxLjApLm5hbWUoXCJBY3RpbiBTdGVyaWMgRm9yY2VcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJhY3RpbkJlbmRTdGlmZm5lc3NcIikubWluKDAuMCkubWF4KDQuMCkubmFtZShcIkFjdGluIEJlbmQgU3RpZmZuZXNzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYWN0aW5Db3NzZXJhdEl0ZXJhdGlvbnNcIikubWluKDApLm1heCgxNikuc3RlcCgxKS5uYW1lKFwiQWN0aW4gQ29zc2VyYXQgSXRlcmF0aW9uc1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInN0ZXJpY1NlbGZOZWlnaGJvcnNcIikubWluKDApLm1heCgxMikuc3RlcCgxKS5uYW1lKFwiU3RlcmljIFNlbGYgTmVpZ2hib3JzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2VcIikubWluKDAuMDEpLm1heCg2LjApLm5hbWUoXCJFcXVpbGlicml1bSBMaW5lIERpc3RhbmNlXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwicG9seW1lclJlcHVsc2lvblwiKS5taW4oMC4wKS5tYXgoMS4wKS5uYW1lKFwiUG9seW1lciBSZXB1bHNpb25cIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJtb25vbWVyTWVtYnJhbmVSZXB1bHNpb25cIikubWluKDAuMCkubWF4KDIuMCkubmFtZShcIk1vbm9tZXItTWVtYnJhbmUgUmVwdWxzaW9uXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYmluZExlbmd0aEZsb29yXCIpLm1pbigxKS5tYXgoNjQpLnN0ZXAoMSkubmFtZShcIkJpbmQgTGVuZ3RoIEZsb29yXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwiYmluZExlbmd0aFNhdHVyYXRpb25cIikubWluKDEpLm1heCg2NCkuc3RlcCgxKS5uYW1lKFwiQmluZCBMZW5ndGggU2F0dXJhdGlvblwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcIm1vdmVtZW50TW9kZVwiKS5vcHRpb25zKHsgSWRsZTogMCwgXCJNb3ZlIEVhc3RcIjogMSB9KS5uYW1lKFwiTW92ZW1lbnQgTW9kZVwiKTtcbiAgICAvLyB0aGUgb3RoZXIgbWVtYnJhbmUgc2V0dGluZ3MgYXJlIHR1bmVkIGFuZCByYXJlbHkgdG91Y2hlZDsgdGhleSBjYW4gc3RpbGwgYmUgc2V0IGZyb20gdGhlIFVSTCwgZS5nLiA/bWVtYnJhbmVGbG93PTAuM1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibWVtYnJhbmVTdGlmZm5lc3NcIikubWluKDAuMCkubWF4KDEwMC4wKS5uYW1lKFwiTWVtYnJhbmUgU3RpZmZuZXNzXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibWVtYnJhbmVTbW9vdGhpbmdcIikubWluKDAuMCkubWF4KDAuNSkubmFtZShcIk1lbWJyYW5lIFNtb290aGluZ1wiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInBvbHltZXJpemF0aW9uUGF0Y2hTaXplXCIpLm1pbigwLjApLm1heCgwLjIpLm5hbWUoXCJQb2x5bWVyaXphdGlvbiBQYXRjaCBTaXplXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwicG9seW1lcml6YXRpb25GaWVsZERlY2F5XCIpLm1pbigwLjgpLm1heCgwLjk5OSkuc3RlcCgwLjAwMSkubmFtZShcIlBvbHltZXJpemF0aW9uIEZpZWxkIERlY2F5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIpLm1pbigwLjApLm1heCgyLjApLm5hbWUoXCJMYW1lbGxpcG9kaXVtIFN0cmVuZ3RoXCIpLmxpc3RlbigpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibGFtZWxsaXBvZGl1bVdpZHRoXCIpLm1pbigwLjApLm1heCgwLjUpLm5hbWUoXCJMYW1lbGxpcG9kaXVtIFdpZHRoXCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwibGFtZWxsaXBvZGl1bUZpZWxkRGVjYXlcIikubWluKDAuOCkubWF4KDAuOTk5KS5zdGVwKDAuMDAxKS5uYW1lKFwiTGFtZWxsaXBvZGl1bSBGaWVsZCBEZWNheVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcImJyYW5jaFByb2JhYmlsaXR5XCIpLm1pbigwLjApLm1heCgwLjIpLnN0ZXAoMC4wMDEpLm5hbWUoXCJCcmFuY2ggUHJvYmFiaWxpdHlcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJkZWJyYW5jaFByb2JhYmlsaXR5XCIpLm1pbigwLjApLm1heCgwLjAxKS5zdGVwKDAuMDAwMSkubmFtZShcIkRlYnJhbmNoIFByb2JhYmlsaXR5XCIpO1xuICAgIGd1aS5hZGQodW5pZm9ybXMsIFwic3Byb3V0Q291bnRcIikubWluKDApLm1heChNQVhfU1BST1VUX1NJVEVTKS5zdGVwKDEpLm5hbWUoXCJTcHJvdXQgU2l0ZXNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRXaWR0aFwiKS5taW4oMSkubWF4KDE2KS5zdGVwKDEpLm5hbWUoXCJTcHJvdXQgV2lkdGggKG5vZGVzKVwiKTtcbiAgICBndWkuYWRkKHVuaWZvcm1zLCBcInNwcm91dEZyb250Qmlhc1wiKS5taW4oMC4wKS5tYXgoMS4wKS5uYW1lKFwiU3Byb3V0IEZyb250IEJpYXNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRPblN0ZXBzXCIpLm1pbigxMDApLm1heCgyMDAwMCkuc3RlcCgxMDApLm5hbWUoXCJTcHJvdXQgT24gU3RlcHNcIik7XG4gICAgZ3VpLmFkZCh1bmlmb3JtcywgXCJzcHJvdXRPZmZTdGVwc1wiKS5taW4oMTAwKS5tYXgoMjAwMDApLnN0ZXAoMTAwKS5uYW1lKFwiU3Byb3V0IE9mZiBTdGVwc1wiKTtcbiAgICBndWkuYWRkKHsgZXhlY3V0ZUZ1bmN0aW9uOiAoKSA9PiBsb2NhdGlvbi5yZWxvYWQoKSB9LCBcImV4ZWN1dGVGdW5jdGlvblwiKS5uYW1lKFwiUmVzZXQgc2VlZCBhbmQgZmllbGRzXCIpO1xuICAgIGd1aVxuICAgICAgLmFkZChcbiAgICAgICAge1xuICAgICAgICAgIHBhdXNlOiAoKSA9PiB7XG4gICAgICAgICAgICBzZXRQYXVzZWQoIXBhdXNlZCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgXCJwYXVzZVwiXG4gICAgICApXG4gICAgICAubmFtZShcIlBhdXNlIC8gcmVzdW1lXCIpO1xuICAgIGd1aS5vbkNoYW5nZSgoKSA9PiB7XG4gICAgICBjb250cm9sc0RpcnR5ID0gdHJ1ZTtcbiAgICAgIGxpdmVQZXJmb3JtYW5jZS5pbnB1dCgpO1xuICAgICAgZGlzcGxheUN1ZSgpO1xuICAgICAgZm9yIChjb25zdCBrZXkgb2YgW1wibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIsIFwibXlvc2luU3RyZW5ndGhcIiwgXCJtZW1icmFuZUNvdXBsaW5nXCJdIGFzIGNvbnN0KSB7XG4gICAgICAgIChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgbGl2ZS0ke2tleX1gKSBhcyBIVE1MSW5wdXRFbGVtZW50KS52YWx1ZSA9IFN0cmluZyh1bmlmb3Jtc1trZXldKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHZhbHVlLSR7a2V5fWApIS50ZXh0Q29udGVudCA9IHVuaWZvcm1zW2tleV0udG9GaXhlZChrZXkgPT09IFwibGFtZWxsaXBvZGl1bVN0cmVuZ3RoXCIgPyAyIDogMyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZ3VpLmNsb3NlKCk7XG4gIH1cblxuICBsZXQgbGFzdEZyYW1lVGltZSA9IDA7XG4gIHNldFBhdXNlZChwYXVzZWQpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbW8tbm90aWNlXCIpIS5oaWRkZW4gPSB0cnVlO1xuICBsZXQgZnJhbWVQZW5kaW5nID0gZmFsc2U7XG4gIGNvbnN0IGdldEZyYW1lSW50ZXJ2YWwgPSAoKSA9PiAxMDAwIC8gdW5pZm9ybXMudGFyZ2V0RlBTOyAvLyBDb252ZXJ0IEZQUyB0byBtaWxsaXNlY29uZHNcblxuICBmdW5jdGlvbiBmcmFtZShjdXJyZW50VGltZTogbnVtYmVyKSB7XG4gICAgaWYgKCFwYXVzZWQgJiYgIXJlY292ZXJ5LmFjdGl2ZSAmJiAhZnJhbWVQZW5kaW5nICYmICFtYW51YWxBZHZhbmNlUGVuZGluZyAmJiBjdXJyZW50VGltZSAtIGxhc3RGcmFtZVRpbWUgPj0gZ2V0RnJhbWVJbnRlcnZhbCgpIC0gMC41KSB7XG4gICAgICBmcmFtZVBlbmRpbmcgPSB0cnVlO1xuICAgICAgY29uc3Qgc3RhcnQgPSBwZXJmb3JtYW5jZS5ub3coKSxcbiAgICAgICAgaW5wdXQgPSBsaXZlUGVyZm9ybWFuY2UuaW5wdXRTbmFwc2hvdCgpO1xuICAgICAgY29uc3Qgc3RlcHMgPSB1bmlmb3Jtcy5hZGFwdGl2ZUZyYW1lcyA/IGZyYW1lQnVkZ2V0LmNob29zZSh1bmlmb3Jtcy5jb21wdXRlU3RlcHNQZXJGcmFtZSwgdW5pZm9ybXMudGFyZ2V0RlBTKSA6IHVuaWZvcm1zLmNvbXB1dGVTdGVwc1BlckZyYW1lO1xuICAgICAgbGV0IGVuY29kZWRBdCA9IHN0YXJ0O1xuICAgICAgdGltZXN0ZXAoc3RlcHMpXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICBlbmNvZGVkQXQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICByZXR1cm4gZGV2aWNlLnF1ZXVlLm9uU3VibWl0dGVkV29ya0RvbmUoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IGRvbmUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICAgICAgICBmcmFtZUJ1ZGdldC5vYnNlcnZlKHN0ZXBzLCBkb25lIC0gc3RhcnQsIGVuY29kZWRBdCAtIHN0YXJ0KTtcbiAgICAgICAgICBsaXZlUGVyZm9ybWFuY2UuZnJhbWUoeyBhdDogZG9uZSwgc3RlcHMsIGVuY29kZU1zOiBlbmNvZGVkQXQgLSBzdGFydCwgcXVldWVUYWlsTXM6IGRvbmUgLSBlbmNvZGVkQXQsIHRvdGFsTXM6IGRvbmUgLSBzdGFydCB9LCBpbnB1dCk7XG4gICAgICAgICAgY29uc3QgcGVyZiA9IGxpdmVQZXJmb3JtYW5jZS5zbmFwc2hvdCgpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSEudGV4dENvbnRlbnQgPSBwYXVzZWRcbiAgICAgICAgICAgID8gYFBhdXNlZCDCtyBzdGVwICR7ZnJhbWVOcn1gXG4gICAgICAgICAgICA6IGAke3BlcmYucmVuZGVyRlBTLnRvRml4ZWQoMCl9IEZQUyDCtyAke3BlcmYuc3RlcHNQZXJTZWNvbmQudG9GaXhlZCgwKX0gc3RlcHMvcyDCtyAke3N0ZXBzfSBzdGVwJHtzdGVwcyA9PT0gMSA/IFwiXCIgOiBcInNcIn0vZnJhbWVgO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goc3RvcFNpbXVsYXRpb24pXG4gICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICBmcmFtZVBlbmRpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgICBsYXN0RnJhbWVUaW1lID0gY3VycmVudFRpbWU7XG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShmcmFtZSk7XG4gIH1cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcbiAgcmV0dXJuO1xufVxuXG5pbmRleCgpLmNhdGNoKChlcnJvcikgPT4ge1xuICBjb25zdCBzdGF0dXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lY2hhbmljYWwtc3RhdHVzXCIpO1xuICBpZiAoc3RhdHVzKSBzdGF0dXMudGV4dENvbnRlbnQgPSBgVW5hYmxlIHRvIHN0YXJ0IFdlYkdQVTogJHtTdHJpbmcoZXJyb3IpfWA7XG4gIGNvbnN0IG5vdGljZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVtby1ub3RpY2VcIik7XG4gIGlmIChub3RpY2UpIHtcbiAgICBub3RpY2UuaGlkZGVuID0gZmFsc2U7XG4gICAgbm90aWNlLnRleHRDb250ZW50ID0gYFVuYWJsZSB0byBzdGFydCBXZWJHUFU6ICR7U3RyaW5nKGVycm9yKX1gO1xuICB9XG4gIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xufSk7XG4iLCIvLyBFeGVjdXRlZCBvbmx5IHdpdGggP21lY2hhbmljc1Rlc3Q9MS4gVGVzdHMgdGhlIGFjdHVhbCBXR1NMIHBpcGVsaW5lcyBvbiB0d29cbi8vIGV4cGxpY2l0IHR3by1iZWFkIGZpbGFtZW50cyBhbmQgb25lIG1lbWJyYW5lIGF0dGFjaG1lbnQsIG5vdCBhIENQVSBzdXJyb2dhdGUuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gdGVzdE1lY2hhbmljcyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGJ1ZmZlcnM6IHsgYWN0aW46IEdQVUJ1ZmZlcjsgbWVtYnJhbmU6IEdQVUJ1ZmZlcjsgbGlua3M6IEdQVUJ1ZmZlcjsgZm9yY2VzOiBHUFVCdWZmZXIgfSxcbiAgY291bnRzOiB7IGFjdGluOiBudW1iZXI7IG1lbWJyYW5lOiBudW1iZXIgfSxcbiAgZGlzcGF0Y2g6ICgpID0+IHZvaWQsXG4gIGNvbmZpZ3VyZTogKHN0cmVuZ3RoOiBudW1iZXIsIGNvdXBsaW5nOiBudW1iZXIsIGRyYWc6IG51bWJlcikgPT4gdm9pZFxuKSB7XG4gIGNvbnN0IHJlc3VsdHM6IHsgbmFtZTogc3RyaW5nOyBwYXNzZWQ6IGJvb2xlYW4gfVtdID0gW107XG4gIGNvbnN0IGFzc2VydCA9IChuYW1lOiBzdHJpbmcsIG9rOiBib29sZWFuKSA9PiB7XG4gICAgcmVzdWx0cy5wdXNoKHsgbmFtZSwgcGFzc2VkOiBvayB9KTtcbiAgICBpZiAoIW9rKSB0aHJvdyBuZXcgRXJyb3IoYE1lY2hhbmljYWwgZml4dHVyZSBmYWlsZWQ6ICR7bmFtZX1gKTtcbiAgfTtcbiAgY29uc3QgcmVhZCA9IGFzeW5jIChidWZmZXI6IEdQVUJ1ZmZlcikgPT4ge1xuICAgIGNvbnN0IGNvcHkgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZTogYnVmZmVyLnNpemUsIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIH0pO1xuICAgIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcihidWZmZXIsIDAsIGNvcHksIDAsIGJ1ZmZlci5zaXplKTtcbiAgICBkZXZpY2UucXVldWUuc3VibWl0KFtlbmNvZGVyLmZpbmlzaCgpXSk7XG4gICAgYXdhaXQgY29weS5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpO1xuICAgIGNvbnN0IGRhdGEgPSBjb3B5LmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCk7XG4gICAgY29weS51bm1hcCgpO1xuICAgIGNvcHkuZGVzdHJveSgpO1xuICAgIHJldHVybiBkYXRhO1xuICB9O1xuICBjb25zdCBmaXh0dXJlID0gYXN5bmMgKHN0cmVuZ3RoOiBudW1iZXIsIGNvdXBsaW5nOiBudW1iZXIsIGRyYWcgPSAwLCBkZXRhY2hlZCA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgYWN0aW4gPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5hY3Rpbi5zaXplKTtcbiAgICBjb25zdCBhID0gbmV3IFVpbnQzMkFycmF5KGFjdGluKSxcbiAgICAgIGFmID0gbmV3IEZsb2F0MzJBcnJheShhY3Rpbik7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMuYWN0aW47IGkrKykge1xuICAgICAgYVtpICogMTBdID0gYVtpICogMTAgKyA2XSA9IGFbaSAqIDEwICsgN10gPSBpO1xuICAgICAgYWZbaSAqIDEwICsgMl0gPSBhZltpICogMTAgKyAzXSA9IDUwMDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgIGFmW2kgKiAxMCArIDJdID0gWzEwLCAxMiwgMjAsIDE4XVtpXTtcbiAgICAgIGFmW2kgKiAxMCArIDNdID0gMTA7XG4gICAgICBhZltpICogMTAgKyA0XSA9IGkgPCAyID8gMSA6IC0xO1xuICAgICAgYVtpICogMTAgKyA2XSA9IGkgPCAyID8gMCA6IDI7XG4gICAgICBhW2kgKiAxMCArIDddID0gaSA8IDIgPyAxIDogMztcbiAgICB9XG4gICAgY29uc3QgbWVtID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUuc2l6ZSk7XG4gICAgY29uc3QgbWYgPSBuZXcgRmxvYXQzMkFycmF5KG1lbSksXG4gICAgICBtdSA9IG5ldyBVaW50MzJBcnJheShtZW0pO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY291bnRzLm1lbWJyYW5lOyBpKyspIHtcbiAgICAgIG11W2kgKiAxMF0gPSBpO1xuICAgICAgbXVbaSAqIDEwICsgNl0gPSAoaSArIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgbXVbaSAqIDEwICsgN10gPSAoaSArIGNvdW50cy5tZW1icmFuZSAtIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgbWZbaSAqIDEwICsgMl0gPSAxMDAwO1xuICAgICAgbWZbaSAqIDEwICsgM10gPSAxMDAwO1xuICAgIH1cbiAgICBtZlsyXSA9IDI1O1xuICAgIG1mWzNdID0gMTA7XG4gICAgbWZbKGNvdW50cy5tZW1icmFuZSAvIDIpICogMTAgKyAyXSA9IDA7XG4gICAgbWZbKGNvdW50cy5tZW1icmFuZSAvIDIpICogMTAgKyAzXSA9IDEwO1xuICAgIGNvbnN0IGxpbmtzID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMubGlua3Muc2l6ZSk7XG4gICAgY29uc3QgbHUgPSBuZXcgVWludDMyQXJyYXkobGlua3MpLFxuICAgICAgbGYgPSBuZXcgRmxvYXQzMkFycmF5KGxpbmtzKTtcbiAgICBsdS5zZXQoWzEsIDMsIDAsIDEsIDEsIDAsIDMsIDJdLCAwKTtcbiAgICBsZlsyXSA9IDU7XG4gICAgbHUuc2V0KFszLCAwLCAwLCAxLCAzLCAyLCAwLCAwXSwgMjU2ICogOCk7XG4gICAgbGZbMjU2ICogOCArIDJdID0gMTtcbiAgICBpZiAoZGV0YWNoZWQpIHtcbiAgICAgIGFbNl0gPSBhWzddID0gMDtcbiAgICAgIGFbMjZdID0gYVsyN10gPSAyO1xuICAgIH1cbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5hY3RpbiwgMCwgYWN0aW4pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLm1lbWJyYW5lLCAwLCBtZW0pO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmxpbmtzLCAwLCBsaW5rcyk7XG4gICAgY29uZmlndXJlKHN0cmVuZ3RoLCBjb3VwbGluZywgZHJhZyk7XG4gICAgZGlzcGF0Y2goKTtcbiAgICBhd2FpdCBkZXZpY2UucXVldWUub25TdWJtaXR0ZWRXb3JrRG9uZSgpO1xuICAgIHJldHVybiB7XG4gICAgICBmb3JjZXM6IG5ldyBJbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5mb3JjZXMpKS5zdWJhcnJheSgwLCAyICogKGNvdW50cy5hY3RpbiArIGNvdW50cy5tZW1icmFuZSkpLFxuICAgICAgYWN0aW46IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmFjdGluKSksXG4gICAgICBtZW1icmFuZTogbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubWVtYnJhbmUpKSxcbiAgICB9O1xuICB9O1xuICBsZXQgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAsIDApO1xuICBhc3NlcnQoXCJvZmYgaXMgbWVjaGFuaWNhbGx5IGluZXJ0XCIsIHN0YXRlLmZvcmNlcy5ldmVyeSgoeCkgPT4geCA9PT0gMCkgJiYgc3RhdGUuYWN0aW5bMl0gPT09IDEwICYmIHN0YXRlLm1lbWJyYW5lWzJdID09PSAyNSk7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLjA1LCAwKTtcbiAgYXNzZXJ0KFwibW90b3IgY29udHJhY3RzIG9wcG9zZWQgZmlsYW1lbnRzXCIsIHN0YXRlLmFjdGluWzJdID4gMTAgJiYgc3RhdGUuYWN0aW5bMjJdIDwgMjApO1xuICBhc3NlcnQoXCJtb3RvciB3aXRob3V0IHRldGhlciBkb2VzIG5vdCBtb3ZlIG1lbWJyYW5lXCIsIHN0YXRlLm1lbWJyYW5lWzJdID09PSAyNSk7XG4gIGFzc2VydChcIm1vdG9yIGZvcmNlcyBhcmUgcmVjaXByb2NhbFwiLCBzdGF0ZS5mb3JjZXNbMF0gPT09IC1zdGF0ZS5mb3JjZXNbNF0gJiYgc3RhdGUuZm9yY2VzWzBdID4gMCk7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLCAwLjA1KTtcbiAgYXNzZXJ0KFwidGV0aGVyIHB1bGxzIG1lbWJyYW5lIHRvd2FyZCBmaWxhbWVudFwiLCBzdGF0ZS5tZW1icmFuZVsyXSA8IDI1ICYmIHN0YXRlLmFjdGluWzIyXSA+IDIwKTtcbiAgYXNzZXJ0KFwidGV0aGVyIHJlYWN0aW9uIGFjdHMgb24gYWN0aW5cIiwgc3RhdGUuZm9yY2VzWzRdID09PSAtc3RhdGUuZm9yY2VzW2NvdW50cy5hY3RpbiAqIDJdKTtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAuMDUsIDAuMDUpO1xuICBsZXQgZnggPSAwLFxuICAgIGZ5ID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGF0ZS5mb3JjZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICBmeCArPSBzdGF0ZS5mb3JjZXNbaV07XG4gICAgZnkgKz0gc3RhdGUuZm9yY2VzW2kgKyAxXTtcbiAgfVxuICBhc3NlcnQoXCJjb21iaW5lZCBpbnRlcm5hbCBmb3JjZSBzdW1zIHRvIHplcm9cIiwgZnggPT09IDAgJiYgZnkgPT09IDApO1xuICBjb25zdCBmcmVlRGlzcGxhY2VtZW50ID0gc3RhdGUuYWN0aW5bMl0gLSAxMDtcbiAgc3RhdGUgPSBhd2FpdCBmaXh0dXJlKDAuMDUsIDAuMDUsIDQpO1xuICBhc3NlcnQoXCJjbHV0Y2ggcmVkdWNlcyBtb3Rpb24gd2l0aG91dCBjaGFuZ2luZyBnZW5lcmF0ZWQgZm9yY2VcIiwgc3RhdGUuYWN0aW5bMl0gLSAxMCA8IGZyZWVEaXNwbGFjZW1lbnQgJiYgc3RhdGUuZm9yY2VzWzBdID4gMCk7XG4gIHN0YXRlID0gYXdhaXQgZml4dHVyZSgwLjA1LCAwLjA1LCAwLCB0cnVlKTtcbiAgYXNzZXJ0KFxuICAgIFwiZGVwb2x5bWVyaXplZCBlbmRwb2ludHMgcmVsZWFzZSBtb3RvciBhbmQgdGV0aGVyXCIsXG4gICAgc3RhdGUuZm9yY2VzLmV2ZXJ5KCh4KSA9PiB4ID09PSAwKVxuICApO1xuICByZXR1cm4gcmVzdWx0cztcbn1cbiIsIi8vIENvbnNlcnZhdGl2ZSB5LWJhbmQgZWRnZSBpbmRleC4gUHJlZGljYXRlcyByZW1haW4gZXhhY3Q7IGxvbmcgZWRnZXMgYXJlXG4vLyByZXRhaW5lZCBpbiBhIGdsb2JhbCBsaXN0IGFuZCBsb25nIGJvbmQgcXVlcmllcyBmYWxsIGJhY2sgdG8gYWxsIGVkZ2VzLlxuLy8gTm8gYm91bmRhcnkvY29sbGlzaW9uIGlzIGRpc2NhcmRlZCB0byBpbXByb3ZlIGRpYWdub3N0aWMgbGF0ZW5jeS5cbmNvbnN0IEJBTkQgPSA0O1xudHlwZSBFZGdlID0geyB4OiBudW1iZXI7IHk6IG51bWJlcjsgZHg6IG51bWJlcjsgZHk6IG51bWJlcjsgbHg6IG51bWJlcjsgaHg6IG51bWJlcjsgbHk6IG51bWJlcjsgaHk6IG51bWJlciB9O1xuZnVuY3Rpb24gZWRnZUluZGV4KG1lbWJyYW5lOiBGbG9hdDMyQXJyYXksIHN0cmlkZTogbnVtYmVyLCByZXZlcnNlID0gZmFsc2UpIHtcbiAgY29uc3QgbiA9IG1lbWJyYW5lLmxlbmd0aCAvIHN0cmlkZTtcbiAgY29uc3QgZWRnZXM6IEVkZ2VbXSA9IFtdLFxuICAgIHJvd3MgPSBuZXcgTWFwPG51bWJlciwgRWRnZVtdPigpLFxuICAgIHdpZGU6IEVkZ2VbXSA9IFtdO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgIGNvbnN0IGogPSAoaSArIChyZXZlcnNlID8gbiAtIDEgOiAxKSkgJSBuO1xuICAgIGNvbnN0IHggPSBtZW1icmFuZVtpICogc3RyaWRlICsgMl0sXG4gICAgICB5ID0gbWVtYnJhbmVbaSAqIHN0cmlkZSArIDNdLFxuICAgICAgYnggPSBtZW1icmFuZVtqICogc3RyaWRlICsgMl0sXG4gICAgICBieSA9IG1lbWJyYW5lW2ogKiBzdHJpZGUgKyAzXTtcbiAgICBpZiAoIVt4LCB5LCBieCwgYnldLmV2ZXJ5KE51bWJlci5pc0Zpbml0ZSkpIHRocm93IG5ldyBFcnJvcihcIk5vbi1maW5pdGUgbWVtYnJhbmUgZ2VvbWV0cnlcIik7XG4gICAgY29uc3QgZSA9IHsgeCwgeSwgZHg6IGJ4IC0geCwgZHk6IGJ5IC0geSwgbHg6IE1hdGgubWluKHgsIGJ4KSwgaHg6IE1hdGgubWF4KHgsIGJ4KSwgbHk6IE1hdGgubWluKHksIGJ5KSwgaHk6IE1hdGgubWF4KHksIGJ5KSB9O1xuICAgIGVkZ2VzLnB1c2goZSk7XG4gICAgY29uc3QgbG93ID0gTWF0aC5mbG9vcihlLmx5IC8gQkFORCksXG4gICAgICBoaWdoID0gTWF0aC5mbG9vcihlLmh5IC8gQkFORCk7XG4gICAgaWYgKGhpZ2ggLSBsb3cgPiAyNTYpIHtcbiAgICAgIHdpZGUucHVzaChlKTtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICBmb3IgKGxldCByb3cgPSBsb3c7IHJvdyA8PSBoaWdoOyByb3crKykge1xuICAgICAgY29uc3QgbGlzdCA9IHJvd3MuZ2V0KHJvdyk7XG4gICAgICBpZiAobGlzdCkgbGlzdC5wdXNoKGUpO1xuICAgICAgZWxzZSByb3dzLnNldChyb3csIFtlXSk7XG4gICAgfVxuICB9XG4gIHJldHVybiB7IGVkZ2VzLCByb3dzLCB3aWRlIH07XG59XG5cbi8vIExlZ2FjeSBwYXJ0aWNsZSBjb3VudHMgdXNlIHBpeGVsLXJvdyBzYW1wbGluZzsgZXhwbGljaXQtZmlsYW1lbnQgbW9kZSB1c2VzXG4vLyBleGFjdCB5IGNvb3JkaW5hdGVzLiBUaGUgZ2VvbWV0cnkgZm9ybXVsYS9vcmRlciBtYXRjaGVzIHRoZSBwcmlvciBmdWxsIHNjYW4uXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbk9jY3VwYW5jeShtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGUgPSAxMCwgZXhhY3QgPSBmYWxzZSkge1xuICBjb25zdCB7IHJvd3MsIHdpZGUgfSA9IGVkZ2VJbmRleChtZW1icmFuZSwgc3RyaWRlLCB0cnVlKTtcbiAgY29uc3QgY2FjaGUgPSBuZXcgTWFwPG51bWJlciwgbnVtYmVyW10+KCk7XG4gIHJldHVybiAoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuID0+IHtcbiAgICBpZiAoIU51bWJlci5pc0Zpbml0ZSh4KSB8fCAhTnVtYmVyLmlzRmluaXRlKHkpKSByZXR1cm4gZmFsc2U7XG4gICAgY29uc3Qgcm93ID0gTWF0aC5mbG9vcih5KSxcbiAgICAgIHNjYW5ZID0gZXhhY3QgPyB5IDogcm93ICsgMC41O1xuICAgIGNvbnN0IGNhbmRpZGF0ZXMgPSByb3dzLmdldChNYXRoLmZsb29yKHNjYW5ZIC8gQkFORCkpID8/IFtdO1xuICAgIGlmIChleGFjdCkge1xuICAgICAgbGV0IGluc2lkZSA9IGZhbHNlO1xuICAgICAgZm9yIChjb25zdCBsaXN0IG9mIFtjYW5kaWRhdGVzLCB3aWRlXSlcbiAgICAgICAgZm9yIChjb25zdCBlIG9mIGxpc3QpIHtcbiAgICAgICAgICBpZiAoZS55ID4gc2NhblkgIT0gZS55ICsgZS5keSA+IHNjYW5ZICYmIGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5IDw9IHgpIGluc2lkZSA9ICFpbnNpZGU7XG4gICAgICAgIH1cbiAgICAgIHJldHVybiBpbnNpZGU7XG4gICAgfVxuICAgIGxldCBjcm9zc2luZ3MgPSBjYWNoZS5nZXQocm93KTtcbiAgICBpZiAoIWNyb3NzaW5ncykge1xuICAgICAgY3Jvc3NpbmdzID0gW107XG4gICAgICBmb3IgKGNvbnN0IGxpc3Qgb2YgW2NhbmRpZGF0ZXMsIHdpZGVdKVxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICAgIGlmIChlLnkgPiBzY2FuWSAhPSBlLnkgKyBlLmR5ID4gc2NhblkpIGNyb3NzaW5ncy5wdXNoKGUueCArICgoc2NhblkgLSBlLnkpICogZS5keCkgLyBlLmR5KTtcbiAgICAgICAgfVxuICAgICAgY3Jvc3NpbmdzLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICAgIGNhY2hlLnNldChyb3csIGNyb3NzaW5ncyk7XG4gICAgfVxuICAgIGxldCBsbyA9IDAsXG4gICAgICBoaSA9IGNyb3NzaW5ncy5sZW5ndGg7XG4gICAgd2hpbGUgKGxvIDwgaGkpIHtcbiAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgIGlmIChjcm9zc2luZ3NbbWlkXSA8PSB4KSBsbyA9IG1pZCArIDE7XG4gICAgICBlbHNlIGhpID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG8gJSAyID09PSAxO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9seWdvbkJvbmRDcm9zc2luZyhtZW1icmFuZTogRmxvYXQzMkFycmF5LCBzdHJpZGUgPSAxMCkge1xuICBjb25zdCB7IGVkZ2VzLCByb3dzLCB3aWRlIH0gPSBlZGdlSW5kZXgobWVtYnJhbmUsIHN0cmlkZSk7XG4gIHJldHVybiAoYXg6IG51bWJlciwgYXk6IG51bWJlciwgYng6IG51bWJlciwgYnk6IG51bWJlcikgPT4ge1xuICAgIGNvbnN0IGR4ID0gYnggLSBheCxcbiAgICAgIGR5ID0gYnkgLSBheSxcbiAgICAgIG1pblggPSBNYXRoLm1pbihheCwgYngpLFxuICAgICAgbWF4WCA9IE1hdGgubWF4KGF4LCBieCksXG4gICAgICBtaW5ZID0gTWF0aC5taW4oYXksIGJ5KSxcbiAgICAgIG1heFkgPSBNYXRoLm1heChheSwgYnkpO1xuICAgIGNvbnN0IGNyb3NzZXMgPSAobGlzdDogRWRnZVtdKSA9PiB7XG4gICAgICBmb3IgKGNvbnN0IGUgb2YgbGlzdCkge1xuICAgICAgICBpZiAobWF4WCA8IGUubHggfHwgbWluWCA+IGUuaHggfHwgbWF4WSA8IGUubHkgfHwgbWluWSA+IGUuaHkpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9IGR4ICogZS5keSAtIGR5ICogZS5keDtcbiAgICAgICAgaWYgKE1hdGguYWJzKGRlbm9taW5hdG9yKSA8IDFlLTgpIGNvbnRpbnVlO1xuICAgICAgICBjb25zdCB0ID0gKChlLnggLSBheCkgKiBlLmR5IC0gKGUueSAtIGF5KSAqIGUuZHgpIC8gZGVub21pbmF0b3I7XG4gICAgICAgIGNvbnN0IHUgPSAoKGUueCAtIGF4KSAqIGR5IC0gKGUueSAtIGF5KSAqIGR4KSAvIGRlbm9taW5hdG9yO1xuICAgICAgICBpZiAodCA+IDFlLTUgJiYgdCA8IDEgLSAxZS01ICYmIHUgPj0gMCAmJiB1IDw9IDEpIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgY29uc3QgbG93ID0gTWF0aC5mbG9vcihtaW5ZIC8gQkFORCksXG4gICAgICBoaWdoID0gTWF0aC5mbG9vcihtYXhZIC8gQkFORCk7XG4gICAgaWYgKGhpZ2ggLSBsb3cgPiAyKSByZXR1cm4gY3Jvc3NlcyhlZGdlcyk7XG4gICAgaWYgKGNyb3NzZXMod2lkZSkpIHJldHVybiB0cnVlO1xuICAgIGZvciAobGV0IHJvdyA9IGxvdzsgcm93IDw9IGhpZ2g7IHJvdysrKSBpZiAoY3Jvc3Nlcyhyb3dzLmdldChyb3cpID8/IFtdKSkgcmV0dXJuIHRydWU7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xufVxuIiwiLy8gU2VwYXJhdGUgc2VlZGVkIHN0cmVhbXMgZm9yIGluaXRpYWwgcG9zaXRpb25zL2tleXMgYW5kIENQVSBzcHJvdXQgc2NoZWR1bGluZy5cbi8vIEdQVSBpbi1wbGFjZSBrZXJuZWxzIGluaGVyaXRlZCBmcm9tIHRoZSBwcm90b3R5cGUgYXJlIG5vdCBiaXR3aXNlIGRldGVybWluaXN0aWMuXG5leHBvcnQgZnVuY3Rpb24gc2VlZGVkUmFuZG9tKHNlZWQ6IG51bWJlcik6ICgpID0+IG51bWJlciB7XG4gIGxldCBzdGF0ZSA9IHNlZWQgPj4+IDA7XG4gIHJldHVybiAoKSA9PiB7XG4gICAgc3RhdGUgPSAoc3RhdGUgKyAweDZkMmI3OWY1KSA+Pj4gMDtcbiAgICBsZXQgdCA9IE1hdGguaW11bChzdGF0ZSBeIChzdGF0ZSA+Pj4gMTUpLCBzdGF0ZSB8IDEpO1xuICAgIHQgXj0gdCArIE1hdGguaW11bCh0IF4gKHQgPj4+IDcpLCB0IHwgNjEpO1xuICAgIHJldHVybiAoKHQgXiAodCA+Pj4gMTQpKSA+Pj4gMCkgLyA0Mjk0OTY3Mjk2O1xuICB9O1xufVxuIiwiZXhwb3J0IGNsYXNzIEZyYW1lQnVkZ2V0IHtcbiAgcHJpdmF0ZSBzdGVwTXMgPSA0O1xuICBwcml2YXRlIG92ZXJoZWFkTXMgPSAyO1xuICBjaG9vc2UobWF4U3RlcHM6IG51bWJlciwgdGFyZ2V0RlBTOiBudW1iZXIpIHtcbiAgICBjb25zdCBidWRnZXQgPSBNYXRoLm1heCgxLCAxMDAwIC8gTWF0aC5tYXgoMSwgdGFyZ2V0RlBTKSAtIDIgLSB0aGlzLm92ZXJoZWFkTXMpO1xuICAgIHJldHVybiBNYXRoLm1heCgxLCBNYXRoLm1pbihNYXRoLmZsb29yKG1heFN0ZXBzKSwgTWF0aC5mbG9vcihidWRnZXQgLyBNYXRoLm1heCgwLjEsIHRoaXMuc3RlcE1zKSkpKTtcbiAgfVxuICBvYnNlcnZlKHN0ZXBzOiBudW1iZXIsIHRvdGFsTXM6IG51bWJlciwgZW5jb2RlTXM6IG51bWJlcikge1xuICAgIC8vIEZpeGVkIHBoeXNpY2FsIHN0ZXBzOyBhZGFwdCBiYXRjaGluZyBvbmx5LCBuZXZlciBkdCBvciBzb2x2ZXIgaXRlcmF0aW9ucy5cbiAgICB0aGlzLnN0ZXBNcyA9IDAuOCAqIHRoaXMuc3RlcE1zICsgMC4yICogTWF0aC5tYXgoMC4xLCAodG90YWxNcyAtIHRoaXMub3ZlcmhlYWRNcykgLyBzdGVwcyk7XG4gICAgdGhpcy5vdmVyaGVhZE1zID0gMC45ICogdGhpcy5vdmVyaGVhZE1zICsgMC4xICogTWF0aC5taW4oMywgZW5jb2RlTXMgLyBNYXRoLm1heCgxLCBzdGVwcykpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIEZyYW1lU2FtcGxlID0geyBhdDogbnVtYmVyOyBzdGVwczogbnVtYmVyOyBlbmNvZGVNczogbnVtYmVyOyBxdWV1ZVRhaWxNczogbnVtYmVyOyB0b3RhbE1zOiBudW1iZXIgfTtcbmZ1bmN0aW9uIGRpc3RyaWJ1dGlvbih2YWx1ZXM6IG51bWJlcltdKSB7XG4gIGNvbnN0IHNvcnRlZCA9IFsuLi52YWx1ZXNdLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgcmV0dXJuIHNvcnRlZC5sZW5ndGhcbiAgICA/IHsgbWVkaWFuOiBzb3J0ZWRbc29ydGVkLmxlbmd0aCA+PiAxXSwgcDk1OiBzb3J0ZWRbTWF0aC5taW4oc29ydGVkLmxlbmd0aCAtIDEsIE1hdGguZmxvb3Ioc29ydGVkLmxlbmd0aCAqIDAuOTUpKV0sIG1heDogc29ydGVkLmF0KC0xKSB9XG4gICAgOiBudWxsO1xufVxuZXhwb3J0IGNsYXNzIExpdmVQZXJmb3JtYW5jZSB7XG4gIHByaXZhdGUgZnJhbWVzOiBGcmFtZVNhbXBsZVtdID0gW107XG4gIHByaXZhdGUgaW5wdXRzOiBudW1iZXJbXSA9IFtdO1xuICBpbnB1dFZlcnNpb24gPSAwO1xuICBwcml2YXRlIHByb2Nlc3NlZFZlcnNpb24gPSAwO1xuICBwcml2YXRlIGlucHV0QXQgPSAwO1xuICBjb2FsZXNjZWRJbnB1dHMgPSAwO1xuICBpbnB1dCgpIHtcbiAgICB0aGlzLmlucHV0QXQgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICByZXR1cm4gKyt0aGlzLmlucHV0VmVyc2lvbjtcbiAgfVxuICBpbnB1dFNuYXBzaG90KCkge1xuICAgIHJldHVybiB7IHZlcnNpb246IHRoaXMuaW5wdXRWZXJzaW9uLCBhdDogdGhpcy5pbnB1dEF0IH07XG4gIH1cbiAgZnJhbWUoc2FtcGxlOiBGcmFtZVNhbXBsZSwgaW5wdXQ6IHsgdmVyc2lvbjogbnVtYmVyOyBhdDogbnVtYmVyIH0pIHtcbiAgICB0aGlzLmZyYW1lcy5wdXNoKHNhbXBsZSk7XG4gICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA+IDYwMCkgdGhpcy5mcmFtZXMuc2hpZnQoKTtcbiAgICBpZiAoaW5wdXQudmVyc2lvbiA+IHRoaXMucHJvY2Vzc2VkVmVyc2lvbikge1xuICAgICAgdGhpcy5jb2FsZXNjZWRJbnB1dHMgKz0gTWF0aC5tYXgoMCwgaW5wdXQudmVyc2lvbiAtIHRoaXMucHJvY2Vzc2VkVmVyc2lvbiAtIDEpO1xuICAgICAgdGhpcy5wcm9jZXNzZWRWZXJzaW9uID0gaW5wdXQudmVyc2lvbjtcbiAgICAgIHRoaXMuaW5wdXRzLnB1c2goc2FtcGxlLmF0IC0gaW5wdXQuYXQpO1xuICAgICAgaWYgKHRoaXMuaW5wdXRzLmxlbmd0aCA+IDI1NikgdGhpcy5pbnB1dHMuc2hpZnQoKTtcbiAgICB9XG4gIH1cbiAgY2xlYXJGcmFtZXMoKSB7XG4gICAgdGhpcy5mcmFtZXMubGVuZ3RoID0gMDtcbiAgfVxuICBzbmFwc2hvdCgpIHtcbiAgICBjb25zdCBmcmFtZXMgPSB0aGlzLmZyYW1lcyxcbiAgICAgIHNwYW4gPSBmcmFtZXMubGVuZ3RoID4gMSA/IChmcmFtZXMuYXQoLTEpIS5hdCAtIGZyYW1lc1swXS5hdCkgLyAxMDAwIDogMDtcbiAgICBjb25zdCBpbnRlcnZhbHMgPSBmcmFtZXMuc2xpY2UoMSkubWFwKChmLCBpKSA9PiBmLmF0IC0gZnJhbWVzW2ldLmF0KTtcbiAgICByZXR1cm4ge1xuICAgICAgd2luZG93RnJhbWVzOiBmcmFtZXMubGVuZ3RoLFxuICAgICAgcmVuZGVyRlBTOiBzcGFuID8gKGZyYW1lcy5sZW5ndGggLSAxKSAvIHNwYW4gOiAwLFxuICAgICAgc3RlcHNQZXJTZWNvbmQ6IHNwYW4gPyBmcmFtZXMuc2xpY2UoMSkucmVkdWNlKChuLCBmKSA9PiBuICsgZi5zdGVwcywgMCkgLyBzcGFuIDogMCxcbiAgICAgIGZyYW1lSW50ZXJ2YWxNczogZGlzdHJpYnV0aW9uKGludGVydmFscyksXG4gICAgICBlbmNvZGVNczogZGlzdHJpYnV0aW9uKGZyYW1lcy5tYXAoKGYpID0+IGYuZW5jb2RlTXMpKSxcbiAgICAgIHF1ZXVlVGFpbE1zOiBkaXN0cmlidXRpb24oZnJhbWVzLm1hcCgoZikgPT4gZi5xdWV1ZVRhaWxNcykpLFxuICAgICAgaW5wdXRUb0NvbXBsZXRlZEZyYW1lTXM6IGRpc3RyaWJ1dGlvbih0aGlzLmlucHV0cyksXG4gICAgICBjb2FsZXNjZWRJbnB1dHM6IHRoaXMuY29hbGVzY2VkSW5wdXRzLFxuICAgIH07XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBSZW5kZXJNb2R1bGUge1xuICBwcml2YXRlIGRldmljZTogR1BVRGV2aWNlO1xuICBwcml2YXRlIGNhbnZhc0Zvcm1hdDogR1BVVGV4dHVyZUZvcm1hdDtcblxuICAvLyBSZW5kZXJpbmcgcmVzb3VyY2VzXG4gIHByaXZhdGUgaW50ZXJtZWRpYXRlVGV4dHVyZTogR1BVVGV4dHVyZTtcbiAgcHJpdmF0ZSBjb21wdXRlUmVuZGVyUGlwZWxpbmU6IEdQVUNvbXB1dGVQaXBlbGluZTtcbiAgcHJpdmF0ZSByZW5kZXJQaXBlbGluZTogR1BVUmVuZGVyUGlwZWxpbmU7XG4gIHByaXZhdGUgYmluZEdyb3VwUG9zdFByb2Nlc3M6IEdQVUJpbmRHcm91cDtcbiAgcHJpdmF0ZSByZW5kZXJCaW5kR3JvdXA6IEdQVUJpbmRHcm91cDtcbiAgcHJpdmF0ZSBzcGVjaW1lblBpcGVsaW5lOiBHUFVDb21wdXRlUGlwZWxpbmU7XG4gIHByaXZhdGUgc3BlY2ltZW5CaW5kR3JvdXA6IEdQVUJpbmRHcm91cDtcbiAgcHJpdmF0ZSB2aWV3QnVmZmVyOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgc2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xuICByZWFkb25seSB2aWV3ID0geyBtb2RlOiAxLCB6b29tOiAzLCBmb2N1czogMC4xNSwgY29udHJhc3Q6IDEuMiwgY2hyb21hOiAwLjQ1LCBncmFpbjogMC42LCBmb2xsb3c6IHRydWUsIGF1dG9GaXQ6IHRydWUgfTtcbiAgcmVhZG9ubHkgY2FtZXJhOiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH07XG4gIHByaXZhdGUgY2FtZXJhVGFyZ2V0OiB7IHg6IG51bWJlcjsgeTogbnVtYmVyIH07XG5cbiAgcHJpdmF0ZSBleHRlbnQgPSB7IHdpZHRoOiAyMDAsIGhlaWdodDogMjAwIH07XG4gIHNldENlbGxCb3VuZHMobGVmdDogbnVtYmVyLCByaWdodDogbnVtYmVyLCB0b3A6IG51bWJlciwgYm90dG9tOiBudW1iZXIpIHtcbiAgICBpZiAoIVtsZWZ0LCByaWdodCwgdG9wLCBib3R0b21dLmV2ZXJ5KE51bWJlci5pc0Zpbml0ZSkgfHwgcmlnaHQgPD0gbGVmdCB8fCBib3R0b20gPD0gdG9wKSByZXR1cm47XG4gICAgdGhpcy5jYW1lcmFUYXJnZXQgPSB7IHg6IChsZWZ0ICsgcmlnaHQpIC8gMiwgeTogKHRvcCArIGJvdHRvbSkgLyAyIH07XG4gICAgdGhpcy5leHRlbnQgPSB7IHdpZHRoOiByaWdodCAtIGxlZnQsIGhlaWdodDogYm90dG9tIC0gdG9wIH07XG4gIH1cbiAgcHJpdmF0ZSBmaXR0ZWRab29tKCkge1xuICAgIHJldHVybiBNYXRoLm1heCgwLjIsIE1hdGgubWluKDMuOCwgKHdpbmRvdy5pbm5lcldpZHRoICogMC43NikgLyB0aGlzLmV4dGVudC53aWR0aCwgKE1hdGgubWF4KDEwMCwgd2luZG93LmlubmVySGVpZ2h0IC0gMTYwKSAqIDAuNzgpIC8gdGhpcy5leHRlbnQuaGVpZ2h0KSk7XG4gIH1cbiAgZml0SW1tZWRpYXRlbHkoKSB7XG4gICAgaWYgKHRoaXMudmlldy5hdXRvRml0KSB0aGlzLnZpZXcuem9vbSA9IHRoaXMuZml0dGVkWm9vbSgpO1xuICAgIGlmICh0aGlzLnZpZXcuZm9sbG93KSBPYmplY3QuYXNzaWduKHRoaXMuY2FtZXJhLCB0aGlzLmNhbWVyYVRhcmdldCk7XG4gIH1cbiAgcHJpdmF0ZSBzY3JlZW5TY2FsZSgpIHtcbiAgICByZXR1cm4geyB4OiAodGhpcy52aWV3Lnpvb20gKiB0aGlzLnNpemUud2lkdGgpIC8gd2luZG93LmlubmVyV2lkdGgsIHk6ICh0aGlzLnZpZXcuem9vbSAqIHRoaXMuc2l6ZS5oZWlnaHQpIC8gd2luZG93LmlubmVySGVpZ2h0IH07XG4gIH1cbiAgc2NyZWVuVG9Xb3JsZCh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgIGlmICghdGhpcy52aWV3Lm1vZGUpIHJldHVybiB7IHgsIHkgfTtcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMuc2NyZWVuU2NhbGUoKTtcbiAgICByZXR1cm4geyB4OiB0aGlzLmNhbWVyYS54ICsgKHggLSB0aGlzLnNpemUud2lkdGggLyAyKSAvIHNjYWxlLngsIHk6IHRoaXMuY2FtZXJhLnkgKyAoeSAtIHRoaXMuc2l6ZS5oZWlnaHQgLyAyKSAvIHNjYWxlLnkgfTtcbiAgfVxuICB3b3JsZFRvU2NyZWVuKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgaWYgKCF0aGlzLnZpZXcubW9kZSkgcmV0dXJuIHsgeCwgeSB9O1xuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5zY3JlZW5TY2FsZSgpO1xuICAgIHJldHVybiB7IHg6ICh4IC0gdGhpcy5jYW1lcmEueCkgKiBzY2FsZS54ICsgdGhpcy5zaXplLndpZHRoIC8gMiwgeTogKHkgLSB0aGlzLmNhbWVyYS55KSAqIHNjYWxlLnkgKyB0aGlzLnNpemUuaGVpZ2h0IC8gMiB9O1xuICB9XG5cbiAgcHJpdmF0ZSBURVhUVVJFX1dPUktHUk9VUF9DT1VOVDogW251bWJlciwgbnVtYmVyXTtcblxuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gICAgY2FudmFzRm9ybWF0OiBHUFVUZXh0dXJlRm9ybWF0LFxuICAgIGNhbnZhc1NpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfSxcbiAgICByZW5kZXJTaGFkZXI6IEdQVVNoYWRlck1vZHVsZSxcbiAgICB0ZXh0dXJlczoge1xuICAgICAgc2l6ZTogeyB3aWR0aDogbnVtYmVyOyBoZWlnaHQ6IG51bWJlciB9O1xuICAgIH0sXG4gICAgc2hhcmVkTGF5b3V0RW50cmllczogR1BVQmluZEdyb3VwTGF5b3V0RW50cnlbXSxcbiAgICBzaGFyZWRCaW5kR3JvdXBFbnRyaWVzOiBHUFVCaW5kR3JvdXBFbnRyeVtdLFxuICAgIGdlb21ldHJ5OiBHUFVCdWZmZXJCaW5kaW5nXG4gICkge1xuICAgIHRoaXMuZGV2aWNlID0gZGV2aWNlO1xuICAgIHRoaXMuY2FudmFzRm9ybWF0ID0gY2FudmFzRm9ybWF0O1xuICAgIHRoaXMuc2l6ZSA9IGNhbnZhc1NpemU7XG4gICAgdGhpcy5jYW1lcmEgPSB7IHg6IGNhbnZhc1NpemUud2lkdGggLyAyLCB5OiBjYW52YXNTaXplLmhlaWdodCAvIDIgfTtcbiAgICB0aGlzLmNhbWVyYVRhcmdldCA9IHsgLi4udGhpcy5jYW1lcmEgfTtcbiAgICB0aGlzLlRFWFRVUkVfV09SS0dST1VQX0NPVU5UID0gW01hdGguY2VpbCh0ZXh0dXJlcy5zaXplLndpZHRoIC8gMTYpLCBNYXRoLmNlaWwodGV4dHVyZXMuc2l6ZS5oZWlnaHQgLyAxNildO1xuXG4gICAgY29uc3QgQklORElOR19JTlRFUk1FRElBVEVfVEVYVFVSRSA9IDEwO1xuICAgIHRoaXMudmlld0J1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplOiA0OCwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCB9KTtcbiAgICBjb25zdCBzcGVjaW1lbiA9IGRldmljZS5jcmVhdGVUZXh0dXJlKHtcbiAgICAgIHNpemU6IFt0ZXh0dXJlcy5zaXplLndpZHRoLCB0ZXh0dXJlcy5zaXplLmhlaWdodF0sXG4gICAgICBmb3JtYXQ6IFwicmdiYTE2ZmxvYXRcIixcbiAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyxcbiAgICB9KTtcbiAgICBjb25zdCBzcGVjaW1lblZpZXcgPSBzcGVjaW1lbi5jcmVhdGVWaWV3KCk7XG4gICAgY29uc3Qgc3BlY2ltZW5MYXlvdXQgPSBkZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgLi4uc2hhcmVkTGF5b3V0RW50cmllcyxcbiAgICAgICAgeyBiaW5kaW5nOiAxMywgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7IHR5cGU6IFwicmVhZC1vbmx5LXN0b3JhZ2VcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMTYsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIHN0b3JhZ2VUZXh0dXJlOiB7IGFjY2VzczogXCJ3cml0ZS1vbmx5XCIsIGZvcm1hdDogXCJyZ2JhMTZmbG9hdFwiIH0gfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgdGhpcy5zcGVjaW1lbkJpbmRHcm91cCA9IGRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGF5b3V0OiBzcGVjaW1lbkxheW91dCxcbiAgICAgIGVudHJpZXM6IFsuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLCB7IGJpbmRpbmc6IDEzLCByZXNvdXJjZTogZ2VvbWV0cnkgfSwgeyBiaW5kaW5nOiAxNiwgcmVzb3VyY2U6IHNwZWNpbWVuVmlldyB9XSxcbiAgICB9KTtcbiAgICB0aGlzLnNwZWNpbWVuUGlwZWxpbmUgPSBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHtcbiAgICAgIGxheW91dDogZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHsgYmluZEdyb3VwTGF5b3V0czogW3NwZWNpbWVuTGF5b3V0XSB9KSxcbiAgICAgIGNvbXB1dGU6IHsgbW9kdWxlOiByZW5kZXJTaGFkZXIsIGVudHJ5UG9pbnQ6IFwiYnVpbGRfc3BlY2ltZW5cIiB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5pbnRlcm1lZGlhdGVUZXh0dXJlID0gdGhpcy5kZXZpY2UuY3JlYXRlVGV4dHVyZSh7XG4gICAgICBzaXplOiBbY2FudmFzU2l6ZS53aWR0aCwgY2FudmFzU2l6ZS5oZWlnaHRdLFxuICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgIHVzYWdlOiBHUFVUZXh0dXJlVXNhZ2UuU1RPUkFHRV9CSU5ESU5HIHwgR1BVVGV4dHVyZVVzYWdlLlRFWFRVUkVfQklORElORyB8IEdQVVRleHR1cmVVc2FnZS5DT1BZX1NSQyxcbiAgICB9KTtcblxuICAgIGNvbnN0IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzID0gdGhpcy5kZXZpY2UuY3JlYXRlQmluZEdyb3VwTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcImJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzXCIsXG4gICAgICBlbnRyaWVzOiBbXG4gICAgICAgIC4uLnNoYXJlZExheW91dEVudHJpZXMsXG4gICAgICAgIHsgYmluZGluZzogMTEsIHZpc2liaWxpdHk6IEdQVVNoYWRlclN0YWdlLkNPTVBVVEUsIHRleHR1cmU6IHsgc2FtcGxlVHlwZTogXCJmbG9hdFwiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxMiwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgc2FtcGxlcjogeyB0eXBlOiBcImZpbHRlcmluZ1wiIH0gfSxcbiAgICAgICAgeyBiaW5kaW5nOiAxNywgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSwgYnVmZmVyOiB7IHR5cGU6IFwidW5pZm9ybVwiIH0gfSxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuQ09NUFVURSB8IEdQVVNoYWRlclN0YWdlLkZSQUdNRU5ULFxuICAgICAgICAgIHN0b3JhZ2VUZXh0dXJlOiB7XG4gICAgICAgICAgICBhY2Nlc3M6IFwid3JpdGUtb25seVwiLFxuICAgICAgICAgICAgZm9ybWF0OiBcInJnYmE4dW5vcm1cIixcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHRoaXMuYmluZEdyb3VwUG9zdFByb2Nlc3MgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IGBCaW5kIEdyb3VwIFBvc3QgUHJvY2Vzc2AsXG4gICAgICBsYXlvdXQ6IGJpbmRHcm91cExheW91dFBvc3RQcm9jZXNzLFxuICAgICAgZW50cmllczogW1xuICAgICAgICAuLi5zaGFyZWRCaW5kR3JvdXBFbnRyaWVzLFxuICAgICAgICB7IGJpbmRpbmc6IDExLCByZXNvdXJjZTogc3BlY2ltZW5WaWV3IH0sXG4gICAgICAgIHsgYmluZGluZzogMTIsIHJlc291cmNlOiBkZXZpY2UuY3JlYXRlU2FtcGxlcih7IG1hZ0ZpbHRlcjogXCJsaW5lYXJcIiwgbWluRmlsdGVyOiBcImxpbmVhclwiIH0pIH0sXG4gICAgICAgIHsgYmluZGluZzogMTcsIHJlc291cmNlOiB7IGJ1ZmZlcjogdGhpcy52aWV3QnVmZmVyIH0gfSxcbiAgICAgICAge1xuICAgICAgICAgIGJpbmRpbmc6IEJJTkRJTkdfSU5URVJNRURJQVRFX1RFWFRVUkUsXG4gICAgICAgICAgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCksXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgY29uc3QgcGlwZWxpbmVMYXlvdXRQb3N0UHJvY2VzcyA9IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgIGxhYmVsOiBcInBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3NcIixcbiAgICAgIGJpbmRHcm91cExheW91dHM6IFtiaW5kR3JvdXBMYXlvdXRQb3N0UHJvY2Vzc10sXG4gICAgfSk7XG5cbiAgICB0aGlzLmNvbXB1dGVSZW5kZXJQaXBlbGluZSA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7XG4gICAgICBsYXlvdXQ6IHBpcGVsaW5lTGF5b3V0UG9zdFByb2Nlc3MsXG4gICAgICBjb21wdXRlOiB7IG1vZHVsZTogcmVuZGVyU2hhZGVyLCBlbnRyeVBvaW50OiBcInJlbmRlclwiIH0sXG4gICAgfSk7XG5cbiAgICBjb25zdCBzY3JlZW5TYW1wbGVyID0gdGhpcy5kZXZpY2UuY3JlYXRlU2FtcGxlcih7XG4gICAgICBtYWdGaWx0ZXI6IFwibmVhcmVzdFwiLFxuICAgICAgbWluRmlsdGVyOiBcIm5lYXJlc3RcIixcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbmRlckJpbmRHcm91cExheW91dCA9IHRoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7XG4gICAgICBsYWJlbDogXCJSZW5kZXIgQmluZCBHcm91cCBMYXlvdXRcIixcbiAgICAgIGVudHJpZXM6IFtcbiAgICAgICAgeyBiaW5kaW5nOiAwLCB2aXNpYmlsaXR5OiBHUFVTaGFkZXJTdGFnZS5GUkFHTUVOVCwgc2FtcGxlcjogeyB0eXBlOiBcIm5vbi1maWx0ZXJpbmdcIiB9IH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgdmlzaWJpbGl0eTogR1BVU2hhZGVyU3RhZ2UuRlJBR01FTlQsIHRleHR1cmU6IHt9IH0sXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZW5kZXJCaW5kR3JvdXAgPSB0aGlzLmRldmljZS5jcmVhdGVCaW5kR3JvdXAoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIEJpbmQgR3JvdXBcIixcbiAgICAgIGxheW91dDogcmVuZGVyQmluZEdyb3VwTGF5b3V0LFxuICAgICAgZW50cmllczogW1xuICAgICAgICB7IGJpbmRpbmc6IDAsIHJlc291cmNlOiBzY3JlZW5TYW1wbGVyIH0sXG4gICAgICAgIHsgYmluZGluZzogMSwgcmVzb3VyY2U6IHRoaXMuaW50ZXJtZWRpYXRlVGV4dHVyZS5jcmVhdGVWaWV3KCkgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlbmRlclBpcGVsaW5lID0gdGhpcy5kZXZpY2UuY3JlYXRlUmVuZGVyUGlwZWxpbmUoe1xuICAgICAgbGFiZWw6IFwiUmVuZGVyIFBpcGVsaW5lXCIsXG4gICAgICBsYXlvdXQ6IHRoaXMuZGV2aWNlLmNyZWF0ZVBpcGVsaW5lTGF5b3V0KHtcbiAgICAgICAgYmluZEdyb3VwTGF5b3V0czogW3RoaXMuZGV2aWNlLmNyZWF0ZUJpbmRHcm91cExheW91dCh7IGVudHJpZXM6IFtdIH0pLCByZW5kZXJCaW5kR3JvdXBMYXlvdXRdLFxuICAgICAgfSksXG4gICAgICB2ZXJ0ZXg6IHtcbiAgICAgICAgbW9kdWxlOiByZW5kZXJTaGFkZXIsXG4gICAgICAgIGVudHJ5UG9pbnQ6IFwidmVydFwiLFxuICAgICAgfSxcbiAgICAgIGZyYWdtZW50OiB7XG4gICAgICAgIG1vZHVsZTogcmVuZGVyU2hhZGVyLFxuICAgICAgICBlbnRyeVBvaW50OiBcImZyYWdcIixcbiAgICAgICAgdGFyZ2V0czogW3sgZm9ybWF0OiB0aGlzLmNhbnZhc0Zvcm1hdCB9XSxcbiAgICAgIH0sXG4gICAgICBwcmltaXRpdmU6IHtcbiAgICAgICAgdG9wb2xvZ3k6IFwidHJpYW5nbGUtbGlzdFwiLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIHB1YmxpYyByZW5kZXIoY2FudmFzQ29udGV4dDogR1BVQ2FudmFzQ29udGV4dCwgcXVlcnlTZXQ/OiBHUFVRdWVyeVNldCwgcmVzb2x2ZUJ1ZmZlcj86IEdQVUJ1ZmZlciwgcmVzdWx0QnVmZmVyPzogR1BVQnVmZmVyKSB7XG4gICAgaWYgKHRoaXMudmlldy5tb2RlICYmIHRoaXMudmlldy5hdXRvRml0KSB0aGlzLnZpZXcuem9vbSArPSAwLjE4ICogKHRoaXMuZml0dGVkWm9vbSgpIC0gdGhpcy52aWV3Lnpvb20pO1xuICAgIGlmICh0aGlzLnZpZXcubW9kZSAmJiB0aGlzLnZpZXcuZm9sbG93KSB7XG4gICAgICB0aGlzLmNhbWVyYS54ICs9IDAuMTggKiAodGhpcy5jYW1lcmFUYXJnZXQueCAtIHRoaXMuY2FtZXJhLngpO1xuICAgICAgdGhpcy5jYW1lcmEueSArPSAwLjE4ICogKHRoaXMuY2FtZXJhVGFyZ2V0LnkgLSB0aGlzLmNhbWVyYS55KTtcbiAgICB9XG4gICAgY29uc3Qgdmlld0RhdGEgPSBuZXcgQXJyYXlCdWZmZXIoNDgpLFxuICAgICAgZiA9IG5ldyBGbG9hdDMyQXJyYXkodmlld0RhdGEpLFxuICAgICAgdSA9IG5ldyBVaW50MzJBcnJheSh2aWV3RGF0YSk7XG4gICAgZi5zZXQoW3RoaXMuY2FtZXJhLngsIHRoaXMuY2FtZXJhLnksIHRoaXMudmlldy56b29tXSk7XG4gICAgdVszXSA9IHRoaXMudmlldy5tb2RlO1xuICAgIGYuc2V0KFt0aGlzLnZpZXcuZm9jdXMsIHRoaXMudmlldy5jb250cmFzdCwgdGhpcy52aWV3LmNocm9tYSwgdGhpcy52aWV3LmdyYWluXSwgNCk7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnNjcmVlblNjYWxlKCk7XG4gICAgZi5zZXQoW3NjYWxlLngsIHNjYWxlLnldLCA4KTtcbiAgICB0aGlzLmRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcih0aGlzLnZpZXdCdWZmZXIsIDAsIHZpZXdEYXRhKTtcbiAgICBjb25zdCBjb21tYW5kRW5jb2RlciA9IHRoaXMuZGV2aWNlLmNyZWF0ZUNvbW1hbmRFbmNvZGVyKCk7XG5cbiAgICBpZiAodGhpcy52aWV3Lm1vZGUpIHtcbiAgICAgIGNvbnN0IHNwZWNpbWVuUGFzcyA9IGNvbW1hbmRFbmNvZGVyLmJlZ2luQ29tcHV0ZVBhc3MoKTtcbiAgICAgIHNwZWNpbWVuUGFzcy5zZXRQaXBlbGluZSh0aGlzLnNwZWNpbWVuUGlwZWxpbmUpO1xuICAgICAgc3BlY2ltZW5QYXNzLnNldEJpbmRHcm91cCgwLCB0aGlzLnNwZWNpbWVuQmluZEdyb3VwKTtcbiAgICAgIHNwZWNpbWVuUGFzcy5kaXNwYXRjaFdvcmtncm91cHMoLi4udGhpcy5URVhUVVJFX1dPUktHUk9VUF9DT1VOVCk7XG4gICAgICBzcGVjaW1lblBhc3MuZW5kKCk7XG4gICAgfVxuXG4gICAgLy8gMS4gTWFpbiBjb21wdXRlIHJlbmRlciBwYXNzXG4gICAgY29uc3QgcGFzc0NvbXB1dGUgPSBjb21tYW5kRW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gICAgcGFzc0NvbXB1dGUuc2V0UGlwZWxpbmUodGhpcy5jb21wdXRlUmVuZGVyUGlwZWxpbmUpO1xuICAgIHBhc3NDb21wdXRlLnNldEJpbmRHcm91cCgwLCB0aGlzLmJpbmRHcm91cFBvc3RQcm9jZXNzKTtcbiAgICBwYXNzQ29tcHV0ZS5kaXNwYXRjaFdvcmtncm91cHMoLi4udGhpcy5URVhUVVJFX1dPUktHUk9VUF9DT1VOVCk7XG4gICAgcGFzc0NvbXB1dGUuZW5kKCk7XG5cbiAgICAvLyAyLiBNYWluIHJlbmRlciBwYXNzXG4gICAgY29uc3QgcmVuZGVyUGFzcyA9IGNvbW1hbmRFbmNvZGVyLmJlZ2luUmVuZGVyUGFzcyh7XG4gICAgICBjb2xvckF0dGFjaG1lbnRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB2aWV3OiBjYW52YXNDb250ZXh0LmdldEN1cnJlbnRUZXh0dXJlKCkuY3JlYXRlVmlldygpLFxuICAgICAgICAgIGxvYWRPcDogXCJjbGVhclwiLFxuICAgICAgICAgIGNsZWFyVmFsdWU6IHsgcjogMCwgZzogMCwgYjogMCwgYTogMSB9LFxuICAgICAgICAgIHN0b3JlT3A6IFwic3RvcmVcIixcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG4gICAgcmVuZGVyUGFzcy5zZXRQaXBlbGluZSh0aGlzLnJlbmRlclBpcGVsaW5lKTtcbiAgICByZW5kZXJQYXNzLnNldEJpbmRHcm91cCgxLCB0aGlzLnJlbmRlckJpbmRHcm91cCk7XG4gICAgcmVuZGVyUGFzcy5kcmF3KDYsIDEsIDAsIDApO1xuICAgIHJlbmRlclBhc3MuZW5kKCk7XG5cbiAgICB0aGlzLmRldmljZS5xdWV1ZS5zdWJtaXQoW2NvbW1hbmRFbmNvZGVyLmZpbmlzaCgpXSk7XG4gIH1cbn1cbiIsIi8vIEFjdHVhbCBHUFUgY2hlY2tzIGZvciBzZWxlY3RpdmUgcmVuZXdhbCwgZ2VudWluZSB0ZXRoZXIgZHdlbGwsIGFuZCBhIHBvbGFyaXR5XG4vLyBkaXJlY3Rpb24gdGhhdCBzdXJ2aXZlcyB0cmFuc2xhdGlvbi4gRnJlc2ggZml4dHVyZSBwYWdlcyBvbmx5LlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRlc3RSZW5ld2FsKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYnVmZmVyczogeyBhY3RpbjogR1BVQnVmZmVyOyBtZW1icmFuZTogR1BVQnVmZmVyOyBsaW5rczogR1BVQnVmZmVyOyBzbmFwc2hvdDogR1BVQnVmZmVyIH0sXG4gIGNvdW50czogeyBhY3RpbjogbnVtYmVyOyBtZW1icmFuZTogbnVtYmVyIH0sXG4gIGNvbmZpZ3VyZTogKHZhbHVlczogUmVjb3JkPHN0cmluZywgbnVtYmVyPikgPT4gdm9pZCxcbiAgZGlzcGF0Y2g6IChraW5kOiBcInBvbGFyaXR5XCIgfCBcInR1cm5vdmVyXCIgfCBcInRldGhlclwiIHwgXCJtb3RvclwiLCByZXBlYXRzPzogbnVtYmVyKSA9PiB2b2lkXG4pIHtcbiAgY29uc3QgY2hlY2tzOiB7IG5hbWU6IHN0cmluZzsgcGFzc2VkOiBib29sZWFuIH1bXSA9IFtdO1xuICBjb25zdCBhc3NlcnQgPSAobmFtZTogc3RyaW5nLCBwYXNzZWQ6IGJvb2xlYW4pID0+IHtcbiAgICBjaGVja3MucHVzaCh7IG5hbWUsIHBhc3NlZCB9KTtcbiAgICBpZiAoIXBhc3NlZCkgdGhyb3cgRXJyb3IoYFJlbmV3YWwgZml4dHVyZSBmYWlsZWQ6ICR7bmFtZX1gKTtcbiAgfTtcbiAgY29uc3QgcmVhZCA9IGFzeW5jIChidWZmZXI6IEdQVUJ1ZmZlciwgb2Zmc2V0ID0gMCwgc2l6ZSA9IGJ1ZmZlci5zaXplKSA9PiB7XG4gICAgY29uc3Qgc3RhZ2UgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHsgc2l6ZSwgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNUIHwgR1BVQnVmZmVyVXNhZ2UuTUFQX1JFQUQgfSk7XG4gICAgY29uc3QgZSA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGUuY29weUJ1ZmZlclRvQnVmZmVyKGJ1ZmZlciwgb2Zmc2V0LCBzdGFnZSwgMCwgc2l6ZSk7XG4gICAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZS5maW5pc2goKV0pO1xuICAgIGF3YWl0IHN0YWdlLm1hcEFzeW5jKEdQVU1hcE1vZGUuUkVBRCk7XG4gICAgY29uc3QgZGF0YSA9IHN0YWdlLmdldE1hcHBlZFJhbmdlKCkuc2xpY2UoMCk7XG4gICAgc3RhZ2UudW5tYXAoKTtcbiAgICBzdGFnZS5kZXN0cm95KCk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH07XG4gIGZ1bmN0aW9uIG1lbWJyYW5lKHNoaWZ0ID0gMCwgYXRDb250YWN0ID0gZmFsc2UpIHtcbiAgICBjb25zdCBkYXRhID0gbmV3IEFycmF5QnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUuc2l6ZSksXG4gICAgICB1ID0gbmV3IFVpbnQzMkFycmF5KGRhdGEpLFxuICAgICAgZiA9IG5ldyBGbG9hdDMyQXJyYXkoZGF0YSk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb3VudHMubWVtYnJhbmU7IGkrKykge1xuICAgICAgY29uc3QgYW5nbGUgPSAoMiAqIE1hdGguUEkgKiBpKSAvIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIHVbaSAqIDEwXSA9IGk7XG4gICAgICB1W2kgKiAxMCArIDZdID0gKGkgKyAxKSAlIGNvdW50cy5tZW1icmFuZTtcbiAgICAgIHVbaSAqIDEwICsgN10gPSAoaSArIGNvdW50cy5tZW1icmFuZSAtIDEpICUgY291bnRzLm1lbWJyYW5lO1xuICAgICAgZltpICogMTAgKyAyXSA9IDUwICsgc2hpZnQgKyA0NSAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgIGZbaSAqIDEwICsgM10gPSA1MCArIDQ1ICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgZltpICogMTAgKyA4XSA9IGk7XG4gICAgfVxuICAgIGlmIChhdENvbnRhY3QpIHtcbiAgICAgIGZbMl0gPSAxMjtcbiAgICAgIGZbM10gPSA1MDtcbiAgICB9XG4gICAgZGV2aWNlLnF1ZXVlLndyaXRlQnVmZmVyKGJ1ZmZlcnMubWVtYnJhbmUsIDAsIGRhdGEpO1xuICB9XG4gIGZ1bmN0aW9uIGZpbGFtZW50cyhhZ2U6IG51bWJlciwgcG9zaXRpb25zID0gWzEwLCAxNCwgODUsIDg5XSkge1xuICAgIGNvbnN0IGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVycy5hY3Rpbi5zaXplKSxcbiAgICAgIHUgPSBuZXcgVWludDMyQXJyYXkoZGF0YSksXG4gICAgICBmID0gbmV3IEZsb2F0MzJBcnJheShkYXRhKTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNvdW50cy5hY3RpbjsgaSsrKSB1W2kgKiAxMF0gPSB1W2kgKiAxMCArIDZdID0gdVtpICogMTAgKyA3XSA9IGk7XG4gICAgcG9zaXRpb25zLmZvckVhY2goKHgsIGkpID0+IHtcbiAgICAgIHVbaSAqIDEwICsgNl0gPSBpIDwgMiA/IDAgOiAyO1xuICAgICAgdVtpICogMTAgKyA3XSA9IGkgPCAyID8gMSA6IDM7XG4gICAgICBmW2kgKiAxMCArIDJdID0geDtcbiAgICAgIGZbaSAqIDEwICsgM10gPSA1MDtcbiAgICAgIGZbaSAqIDEwICsgNF0gPSAxO1xuICAgICAgZltpICogMTAgKyA5XSA9IGFnZTtcbiAgICB9KTtcbiAgICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5hY3RpbiwgMCwgZGF0YSk7XG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cbiAgbWVtYnJhbmUoKTtcbiAgZmlsYW1lbnRzKDEwMDApO1xuICBjb25maWd1cmUoeyBwb2xhcml0eU1vZGU6IDAsIGN1ZUVuYWJsZWQ6IDAgfSk7XG4gIGRpc3BhdGNoKFwicG9sYXJpdHlcIik7XG4gIGNvbmZpZ3VyZSh7XG4gICAgcG9sYXJpdHlNb2RlOiAxLFxuICAgIGN1ZUVuYWJsZWQ6IDEsXG4gICAgY3VlWDogMTAwLFxuICAgIGN1ZVk6IDUwLFxuICAgIHBvbGFyaXR5VHVyblJhdGU6IDAuMDIsXG4gICAgcmVhclR1cm5vdmVyOiAxLFxuICAgIHR1cm5vdmVyQWdlOiAxMCxcbiAgICBkaXNjb25uZWN0aW9uUHJvYmFiaWxpdHk6IDAsXG4gICAgZGVicmFuY2hQcm9iYWJpbGl0eTogMCxcbiAgfSk7XG4gIGRpc3BhdGNoKFwicG9sYXJpdHlcIik7XG4gIGRpc3BhdGNoKFwidHVybm92ZXJcIik7XG4gIGxldCB1ID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICBhc3NlcnQoXCJhZ2VkIHJlYXIgZmlsYW1lbnQgcmV0dXJucyB0byBHLWFjdGluXCIsIHVbNl0gPT09IDAgJiYgdVs3XSA9PT0gMCAmJiB1WzE2XSA9PT0gMSAmJiB1WzE3XSA9PT0gMSk7XG4gIGFzc2VydChcInNhbWUtYWdlZCBmcm9udCBmaWxhbWVudCBpcyBwcm90ZWN0ZWRcIiwgdVsyN10gPT09IDMgJiYgdVszNl0gPT09IDIpO1xuICBjb25zdCBicmFuY2ggPSBmaWxhbWVudHMoMCksXG4gICAgYnUgPSBuZXcgVWludDMyQXJyYXkoYnJhbmNoKSxcbiAgICBiZiA9IG5ldyBGbG9hdDMyQXJyYXkoYnJhbmNoKTtcbiAgYnVbMjZdID0gMDtcbiAgYnVbMjddID0gMjtcbiAgYmZbMjJdID0gMTI7XG4gIGJmWzIzXSA9IDUyO1xuICBiZlsyOV0gPSAxMDAwO1xuICBidVszNl0gPSAzO1xuICBidVszN10gPSAzO1xuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoYnVmZmVycy5hY3RpbiwgMCwgYnJhbmNoKTtcbiAgZGlzcGF0Y2goXCJ0dXJub3ZlclwiKTtcbiAgdSA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKTtcbiAgYXNzZXJ0KFwib2xkIG9uZS1iZWFkIGJyYW5jaCByZXR1cm5zIHRvIHRoZSBzb2x1YmxlIHBvb2xcIiwgdVsyNl0gPT09IDIgJiYgdVsyN10gPT09IDIpO1xuICBhc3NlcnQoXCJicmFuY2ggcmVtb3ZhbCBkb2VzIG5vdCBjdXQgdGhlIG1vdGhlciBmaWxhbWVudFwiLCB1WzddID09PSAxICYmIHVbMTZdID09PSAwKTtcbiAgZmlsYW1lbnRzKDApO1xuICBkaXNwYXRjaChcInR1cm5vdmVyXCIpO1xuICB1ID0gbmV3IFVpbnQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5hY3RpbikpO1xuICBhc3NlcnQoXCJ5b3VuZyByZWFyIG5ldHdvcmsgaXMgbm90IHByZW1hdHVyZWx5IGNsZWFyZWRcIiwgdVs3XSA9PT0gMSAmJiB1WzE2XSA9PT0gMCk7XG4gIGNvbnN0IGJlZm9yZSA9IG5ldyBGbG9hdDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLnNuYXBzaG90LCAzMiAqIChjb3VudHMuYWN0aW4gKyBjb3VudHMubWVtYnJhbmUgKyAxKSwgMzIpKTtcbiAgbWVtYnJhbmUoMTAwKTtcbiAgZGlzcGF0Y2goXCJwb2xhcml0eVwiKTtcbiAgY29uc3QgYWZ0ZXIgPSBuZXcgRmxvYXQzMkFycmF5KGF3YWl0IHJlYWQoYnVmZmVycy5zbmFwc2hvdCwgMzIgKiAoY291bnRzLmFjdGluICsgY291bnRzLm1lbWJyYW5lICsgMSksIDMyKSk7XG4gIGFzc2VydChcInBvbGFyaXR5IHZlY3RvciBwZXJzaXN0cyB1bmRlciBjZWxsIHRyYW5zbGF0aW9uXCIsIE1hdGguYWJzKGJlZm9yZVsyXSAtIGFmdGVyWzJdKSA8IDFlLTYgJiYgTWF0aC5hYnMoYmVmb3JlWzNdIC0gYWZ0ZXJbM10pIDwgMWUtNiAmJiBhZnRlclsyXSA+IDAuOTkpO1xuICBtZW1icmFuZSgpO1xuICBkaXNwYXRjaChcInBvbGFyaXR5XCIpO1xuICBjb25maWd1cmUoeyBtb3RvclJlYXJCaWFzOiAxLCBteW9zaW5TdHJlbmd0aDogMC4wNSwgbXlvc2luU3BlZWQ6IDAuMDIgfSk7XG4gIGZvciAoY29uc3QgW3Bvc2l0aW9ucywgbmFtZSwgYWN0aXZlXSBvZiBbXG4gICAgW1sxMCwgMTQsIDIwLCAxNl0sIFwibWF0dXJlIHJlYXIgbW90b3IgcHJvZHVjZXMgY29udHJhY3Rpb25cIiwgdHJ1ZV0sXG4gICAgW1s4MCwgODQsIDkwLCA4Nl0sIFwibWF0dXJlIGZyb250IG1vdG9yIHN0YXlzIGluYWN0aXZlXCIsIGZhbHNlXSxcbiAgXSBhcyBjb25zdCkge1xuICAgIGZpbGFtZW50cygxMDAwLCBbLi4ucG9zaXRpb25zXSk7XG4gICAgY29uc3QgbGluayA9IG5ldyBVaW50MzJBcnJheSg4ICogKDI1NiArIGNvdW50cy5tZW1icmFuZSkpO1xuICAgIGxpbmsuc2V0KFsxLCAzLCAwLCAxLCAxLCAwLCAzLCAyXSk7XG4gICAgbmV3IEZsb2F0MzJBcnJheShsaW5rLmJ1ZmZlcilbMl0gPSA1O1xuICAgIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmxpbmtzLCAwLCBsaW5rKTtcbiAgICBkaXNwYXRjaChcIm1vdG9yXCIpO1xuICAgIGNvbnN0IG1vdmVkID0gbmV3IEZsb2F0MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMuYWN0aW4pKTtcbiAgICBhc3NlcnQobmFtZSwgYWN0aXZlID8gbW92ZWRbMl0gPiBwb3NpdGlvbnNbMF0gJiYgbW92ZWRbMjJdIDwgcG9zaXRpb25zWzJdIDogbW92ZWRbMl0gPT09IHBvc2l0aW9uc1swXSAmJiBtb3ZlZFsyMl0gPT09IHBvc2l0aW9uc1syXSk7XG4gIH1cbiAgbWVtYnJhbmUoMCwgdHJ1ZSk7XG4gIGZpbGFtZW50cygxMDAwKTtcbiAgY29uc3QgbGluayA9IG5ldyBVaW50MzJBcnJheSg4ICogKDI1NiArIGNvdW50cy5tZW1icmFuZSkpO1xuICBsaW5rLnNldChbMSwgMCwgMCwgNjAwLCAxLCAwLCAwLCAwXSwgMjU2ICogOCk7XG4gIG5ldyBGbG9hdDMyQXJyYXkobGluay5idWZmZXIpWzI1NiAqIDggKyAyXSA9IDI7XG4gIGRldmljZS5xdWV1ZS53cml0ZUJ1ZmZlcihidWZmZXJzLmxpbmtzLCAwLCBsaW5rKTtcbiAgY29uZmlndXJlKHsgbWVtYnJhbmVDb3VwbGluZzogMC4wNSwgdGV0aGVyVHVybm92ZXI6IDEsIHRldGhlck9uUmF0ZTogMSwgdGV0aGVyT2ZmUmF0ZTogMCwgdGV0aGVyTG9hZE9mZjogMCwgdGV0aGVyUmVjb3ZlcnlTdGVwczogNDAgfSk7XG4gIGRpc3BhdGNoKFwidGV0aGVyXCIpO1xuICBsZXQgbGlua3MgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmxpbmtzKSk7XG4gIGFzc2VydChcImV4cGlyZWQgdGV0aGVyIGVudGVycyBhbiB1bmJvdW5kIGR3ZWxsXCIsIGxpbmtzWzI1NiAqIDhdID09PSAwICYmIGxpbmtzWzI1NiAqIDggKyAzXSA9PT0gNDApO1xuICBkaXNwYXRjaChcInRldGhlclwiKTtcbiAgbGlua3MgPSBuZXcgVWludDMyQXJyYXkoYXdhaXQgcmVhZChidWZmZXJzLmxpbmtzKSk7XG4gIGFzc2VydChcInRldGhlciBkb2VzIG5vdCByZWJpbmQgb24gdGhlIG5leHQgc3RlcFwiLCBsaW5rc1syNTYgKiA4XSA9PT0gMCAmJiBsaW5rc1syNTYgKiA4ICsgM10gPT09IDM5KTtcbiAgZGlzcGF0Y2goXCJ0ZXRoZXJcIiwgNDApO1xuICBsaW5rcyA9IG5ldyBVaW50MzJBcnJheShhd2FpdCByZWFkKGJ1ZmZlcnMubGlua3MpKTtcbiAgYXNzZXJ0KFwidGV0aGVyIGNhbiByZWJpbmQgYWZ0ZXIgaXRzIGR3ZWxsXCIsIGxpbmtzWzI1NiAqIDhdID4gMCk7XG4gIHJldHVybiBjaGVja3M7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gY3JlYXRlU2ltdWxhdGlvblBpcGVsaW5lcyhkZXZpY2U6IEdQVURldmljZSwgbW9kdWxlOiBHUFVTaGFkZXJNb2R1bGUsIGxheW91dDogR1BVUGlwZWxpbmVMYXlvdXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXNvbHZlQ3VlOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJyZXNvbHZlX2Zyb250X2N1ZVwiIH0gfSksXG4gICAgZHJhd0N1ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiZHJhd19yZXNvbHZlZF9jdWVcIiB9IH0pLFxuICAgIG1lYXN1cmVFbmNsb3N1cmU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcIm1lYXN1cmVfZW5jbG9zdXJlXCIgfSB9KSxcbiAgICBidWlsZEVuY2xvc3VyZVJvd3M6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImJ1aWxkX2VuY2xvc3VyZV9yb3dzXCIgfSB9KSxcbiAgICBkcmF3UmVzZXJ2b2lyOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJkcmF3X3Jlc2Vydm9pcl9jb21wYXJ0bWVudFwiIH0gfSksXG4gICAgcHJvamVjdEVuY2xvc3VyZUFyZWE6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInByb2plY3RfZW5jbG9zdXJlX2FyZWFcIiB9IH0pLFxuICAgIGNvbnRhaW5GaWxhbWVudFBvaW50czogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwiY29udGFpbl9maWxhbWVudF9wb2ludHNcIiB9IH0pLFxuICAgIGNvbnRhaW5GaWxhbWVudEJvbmRzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJjb250YWluX2ZpbGFtZW50X2JvbmRzXCIgfSB9KSxcbiAgICBzbmFwc2hvdE1lY2hhbmljczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwic25hcHNob3RfbWVjaGFuaWNzXCIgfSB9KSxcbiAgICBtb3RvckxpbmtzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtb3Rvcl9saW5rc1wiIH0gfSksXG4gICAgbWVtYnJhbmVUZXRoZXJzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtZW1icmFuZV90ZXRoZXJzXCIgfSB9KSxcbiAgICBhcHBseU1lY2hhbmljYWxGb3JjZXM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImFwcGx5X21lY2hhbmljYWxfZm9yY2VzXCIgfSB9KSxcbiAgICBkcmF3TWVjaGFuaWNhbExpbmtzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJkcmF3X21lY2hhbmljYWxfbGlua3NcIiB9IH0pLFxuICAgIGxpbmVDb25zdHJhaW50OiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJsaW5lX2NvbnN0cmFpbnRfdXBkYXRlc1wiIH0gfSksXG4gICAgbWVtYnJhbmVUYW5nZW50aWFsRmxvdzogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwibWVtYnJhbmVfdGFuZ2VudGlhbF9mbG93XCIgfSB9KSxcbiAgICBvcmllbnRhdGlvblVwZGF0ZTogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwib3JpZW50YXRpb25fdXBkYXRlc1wiIH0gfSksXG4gICAgY29zc2VyYXRVcGRhdGU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImNvc3NlcmF0X3VwZGF0ZXNcIiB9IH0pLFxuICAgIHJlc2V0QWN0aW46IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInJlc2V0X2FjdGluXCIgfSB9KSxcbiAgICByZXNldE1lbWJyYW5lOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJyZXNldF9tZW1icmFuZVwiIH0gfSksXG4gICAgc3RlcmljRm9yY2VVcGRhdGU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInN0ZXJpY19mb3JjZV91cGRhdGVzXCIgfSB9KSxcbiAgICBhY3RpbkJpbmQ6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImJpbmRfYWN0aW5fbW9ub21lclwiIH0gfSksXG4gICAgYWN0aW5Qb2x5bWVyUG9zaXRpb246IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInVwZGF0ZV9hY3Rpbl9wb2x5bWVyX3Bvc2l0aW9uXCIgfSB9KSxcbiAgICBhY3Rpbk1vbm9tZXJQb3NpdGlvbjogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidXBkYXRlX2FjdGluX21vbm9tZXJfcG9zaXRpb25cIiB9IH0pLFxuICAgIHVuYmluZE1pblBvbGU6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcInVuYmluZF9taW5fcG9sZVwiIH0gfSksXG4gICAgbWVtYnJhbmVUb1RleHR1cmVzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJtZW1icmFuZV90b190ZXh0dXJlc1wiIH0gfSksXG4gICAgYWN0aW5lc1RvVGV4dHVyZXM6IGRldmljZS5jcmVhdGVDb21wdXRlUGlwZWxpbmUoeyBsYXlvdXQsIGNvbXB1dGU6IHsgbW9kdWxlLCBlbnRyeVBvaW50OiBcImFjdGluZXNfdG9fdGV4dHVyZXNcIiB9IH0pLFxuICAgIGNsZWFyUmVuZGVyTGF5ZXJzOiBkZXZpY2UuY3JlYXRlQ29tcHV0ZVBpcGVsaW5lKHsgbGF5b3V0LCBjb21wdXRlOiB7IG1vZHVsZSwgZW50cnlQb2ludDogXCJjbGVhcl9yZW5kZXJfbGF5ZXJzXCIgfSB9KSxcbiAgICB1cGRhdGVUZXh0dXJlczogZGV2aWNlLmNyZWF0ZUNvbXB1dGVQaXBlbGluZSh7IGxheW91dCwgY29tcHV0ZTogeyBtb2R1bGUsIGVudHJ5UG9pbnQ6IFwidXBkYXRlX3RleHR1cmVzXCIgfSB9KSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2gocGFzczogR1BVQ29tcHV0ZVBhc3NFbmNvZGVyLCBwaXBlbGluZTogR1BVQ29tcHV0ZVBpcGVsaW5lLCB4OiBudW1iZXIsIHkgPSAxKSB7XG4gIHBhc3Muc2V0UGlwZWxpbmUocGlwZWxpbmUpO1xuICBwYXNzLmRpc3BhdGNoV29ya2dyb3Vwcyh4LCB5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJ1blNpbXVsYXRpb25TdGVwKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgYmluZEdyb3VwOiBHUFVCaW5kR3JvdXAsXG4gIHdvcmtncm91cENvdW50czogeyBBQ1RJTjogbnVtYmVyOyBNRU1CUkFORTogbnVtYmVyIH0sXG4gIHRleHR1cmVXb3JrZ3JvdXBDb3VudDogW251bWJlciwgbnVtYmVyXSxcbiAgbGluZUNvbnN0cmFpbnRGdW5jdGlvbjogKHBhc3M6IEdQVUNvbXB1dGVQYXNzRW5jb2RlcikgPT4gdm9pZCxcbiAgZnJhbWVOcjogbnVtYmVyLFxuICBpc0xhc3RTdGVwT2ZGcmFtZTogYm9vbGVhbixcbiAgZW5jbG9zdXJlID0gZmFsc2UsXG4gIHBlcnNpc3RlbnRQb2xhcml0eSA9IGZhbHNlLFxuICBxdWVyeUluZm8/OiB7IHF1ZXJ5U2V0OiBHUFVRdWVyeVNldDsgaXNGaXJzdFN0ZXA6IGJvb2xlYW4gfVxuKSB7XG4gIC8vIE9uZSBzdWJtaXNzaW9uIHBlciBmaXhlZCBzdGVwLiBEaXNwYXRjaCBvcmRlciBhbmQgaXRlcmF0aW9uIGNvdW50cyBhcmVcbiAgLy8gdW5jaGFuZ2VkOyBkaXNwYXRjaCBib3VuZGFyaWVzIHJldGFpbiBzdG9yYWdlIGRlcGVuZGVuY2llcy4gVW5pZm9ybSB3cml0ZXNcbiAgLy8gcmVtYWluIEJFRk9SRSBlYWNoIHN0ZXAgc3VibWlzc2lvbiwgc28gc3Byb3V0cyBhcmUgbm90IG92ZXJ3cml0dGVuIGJ5IHRoZVxuICAvLyBsYXN0IHN0ZXAncyB2YWx1ZXMgd2hlbiBzZXZlcmFsIGZpeGVkIHN0ZXBzIHNoYXJlIGFuIGFuaW1hdGlvbiBmcmFtZS5cbiAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKHtcbiAgICAuLi4ocXVlcnlJbmZvPy5pc0ZpcnN0U3RlcCAmJiB7XG4gICAgICB0aW1lc3RhbXBXcml0ZXM6IHtcbiAgICAgICAgcXVlcnlTZXQ6IHF1ZXJ5SW5mby5xdWVyeVNldCxcbiAgICAgICAgYmVnaW5uaW5nT2ZQYXNzV3JpdGVJbmRleDogMCxcbiAgICAgICAgZW5kT2ZQYXNzV3JpdGVJbmRleDogMSxcbiAgICAgIH0sXG4gICAgfSksXG4gIH0pO1xuICBwYXNzLnNldEJpbmRHcm91cCgwLCBiaW5kR3JvdXApO1xuXG4gIGlmIChwZXJzaXN0ZW50UG9sYXJpdHkpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZWFzdXJlRW5jbG9zdXJlLCAxKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnJlc29sdmVDdWUsIDEpO1xuXG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSkge1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5jbGVhclJlbmRlckxheWVycywgLi4udGV4dHVyZVdvcmtncm91cENvdW50KTtcbiAgfVxuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc3RlcmljRm9yY2VVcGRhdGUsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGxpbmVDb25zdHJhaW50RnVuY3Rpb24ocGFzcyk7XG4gIGlmIChlbmNsb3N1cmUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbCgodGV4dHVyZVdvcmtncm91cENvdW50WzFdICogMTYpIC8gKDQgKiAyNTYpKSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpbkJpbmQsIHdvcmtncm91cENvdW50cy5BQ1RJTik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpblBvbHltZXJQb3NpdGlvbiwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmFjdGluTW9ub21lclBvc2l0aW9uLCB3b3JrZ3JvdXBDb3VudHMuQUNUSU4pO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMudW5iaW5kTWluUG9sZSwgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgaWYgKGVuY2xvc3VyZSkgZW5jb2RlRW5jbG9zdXJlKHBhc3MsIHBpcGVsaW5lcywgd29ya2dyb3VwQ291bnRzLCB0ZXh0dXJlV29ya2dyb3VwQ291bnRbMV0gKiAxNik7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5tZW1icmFuZVRvVGV4dHVyZXMsIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5hY3RpbmVzVG9UZXh0dXJlcywgd29ya2dyb3VwQ291bnRzLkFDVElOKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLnVwZGF0ZVRleHR1cmVzLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICBjb25zdCBtZWNoYW5pY2FsQ291bnQgPSB3b3JrZ3JvdXBDb3VudHMuQUNUSU4gKyB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkU7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgbWVjaGFuaWNhbENvdW50KTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLm1vdG9yTGlua3MsIDEpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVtYnJhbmVUZXRoZXJzLCB3b3JrZ3JvdXBDb3VudHMuTUVNQlJBTkUpO1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuYXBwbHlNZWNoYW5pY2FsRm9yY2VzLCBtZWNoYW5pY2FsQ291bnQpO1xuICBpZiAoZW5jbG9zdXJlKSBlbmNvZGVFbmNsb3N1cmUocGFzcywgcGlwZWxpbmVzLCB3b3JrZ3JvdXBDb3VudHMsIHRleHR1cmVXb3JrZ3JvdXBDb3VudFsxXSAqIDE2KTtcbiAgaWYgKGlzTGFzdFN0ZXBPZkZyYW1lKSBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuZHJhd01lY2hhbmljYWxMaW5rcywgMSArIHdvcmtncm91cENvdW50cy5NRU1CUkFORSk7XG4gIGlmIChpc0xhc3RTdGVwT2ZGcmFtZSAmJiBlbmNsb3N1cmUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3UmVzZXJ2b2lyLCAuLi50ZXh0dXJlV29ya2dyb3VwQ291bnQpO1xuICBpZiAoaXNMYXN0U3RlcE9mRnJhbWUpIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5kcmF3Q3VlLCAxKTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuRW5jbG9zdXJlKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgYmluZEdyb3VwOiBHUFVCaW5kR3JvdXAsXG4gIGNvdW50czogeyBBQ1RJTjogbnVtYmVyOyBNRU1CUkFORTogbnVtYmVyIH0sXG4gIGhlaWdodDogbnVtYmVyXG4pIHtcbiAgY29uc3QgZW5jb2RlciA9IGRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICBjb25zdCBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG4gIGVuY29kZUVuY2xvc3VyZShwYXNzLCBwaXBlbGluZXMsIGNvdW50cywgaGVpZ2h0KTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG4vLyBGcm96ZW4tdGltZSBjb3JyZWN0aW9uOiBubyByZWFjdGlvbnMsIGFnZXMsIG1vdG9ycywgbWVtYnJhbmUgbW90aW9uIG9yIGFyZWFcbi8vIHByb2plY3Rpb24uIFRoZSBjYWxsZXIgdmVyaWZpZXMgdGhlIGZ1bGwgc3RhdGUgYWZ0ZXIgZWFjaCBib3VuZGVkIGJhdGNoLlxuZXhwb3J0IGZ1bmN0aW9uIHJ1bkNvbnRhY3RSZXBhaXIoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBwaXBlbGluZXM6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZVNpbXVsYXRpb25QaXBlbGluZXM+LFxuICBiaW5kR3JvdXA6IEdQVUJpbmRHcm91cCxcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXIsXG4gIGl0ZXJhdGlvbnM6IG51bWJlclxuKSB7XG4gIGNvbnN0IGVuY29kZXIgPSBkZXZpY2UuY3JlYXRlQ29tbWFuZEVuY29kZXIoKSxcbiAgICBwYXNzID0gZW5jb2Rlci5iZWdpbkNvbXB1dGVQYXNzKCk7XG4gIHBhc3Muc2V0QmluZEdyb3VwKDAsIGJpbmRHcm91cCk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbChoZWlnaHQgLyAoNCAqIDI1NikpKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zOyBpKyspIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50UG9pbnRzLCBjb3VudHMuQUNUSU4pO1xuICAgIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5zbmFwc2hvdE1lY2hhbmljcywgY291bnRzLkFDVElOICsgY291bnRzLk1FTUJSQU5FKTtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuY29udGFpbkZpbGFtZW50Qm9uZHMsIGNvdW50cy5BQ1RJTik7XG4gIH1cbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgcGFzcy5lbmQoKTtcbiAgZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xufVxuXG5mdW5jdGlvbiBlbmNvZGVFbmNsb3N1cmUoXG4gIHBhc3M6IEdQVUNvbXB1dGVQYXNzRW5jb2RlcixcbiAgcGlwZWxpbmVzOiBSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVTaW11bGF0aW9uUGlwZWxpbmVzPixcbiAgY291bnRzOiB7IEFDVElOOiBudW1iZXI7IE1FTUJSQU5FOiBudW1iZXIgfSxcbiAgaGVpZ2h0OiBudW1iZXJcbikge1xuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5wcm9qZWN0RW5jbG9zdXJlQXJlYSwgY291bnRzLk1FTUJSQU5FKTtcbiAgLy8gUmVmcmVzaCB0aGUgbWVhc3VyZWQgYXJlYSBhZnRlciBwcm9qZWN0aW9uIGZvciB0aGUgbmV4dCByZWFjdGlvbiBzdGVwLlxuICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMubWVhc3VyZUVuY2xvc3VyZSwgMSk7XG4gIGRpc3BhdGNoKHBhc3MsIHBpcGVsaW5lcy5idWlsZEVuY2xvc3VyZVJvd3MsIE1hdGguY2VpbChoZWlnaHQgLyAoNCAqIDI1NikpKTtcbiAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudFBvaW50cywgY291bnRzLkFDVElOKTtcbiAgZm9yIChsZXQgaXRlcmF0aW9uID0gMDsgaXRlcmF0aW9uIDwgMjsgaXRlcmF0aW9uKyspIHtcbiAgICBkaXNwYXRjaChwYXNzLCBwaXBlbGluZXMuc25hcHNob3RNZWNoYW5pY3MsIGNvdW50cy5BQ1RJTiArIGNvdW50cy5NRU1CUkFORSk7XG4gICAgZGlzcGF0Y2gocGFzcywgcGlwZWxpbmVzLmNvbnRhaW5GaWxhbWVudEJvbmRzLCBjb3VudHMuQUNUSU4pO1xuICB9XG59XG4iLCIvLyBTY2hlZHVsZXMgc2hvcnQtbGl2ZWQgcG9seW1lcml6YXRpb24gc2l0ZXMgb24gdGhlIG1lbWJyYW5lLCBzbyBsb2NhbCBwcm90cnVzaW9ucyBzcHJvdXQgYW5kIHJldHJhY3QuXG4vLyBFYWNoIHNsb3QgYWx0ZXJuYXRlcyBiZXR3ZWVuIG9uIChhIHNpdGUgYXQgYSBmaXhlZCBtZW1icmFuZSBwb3NpdGlvbikgYW5kIG9mZiwgd2l0aCByYW5kb20gZHVyYXRpb25zLFxuLy8gc28gdGhlIG51bWJlciBvZiBhY3RpdmUgc2l0ZXMgZmx1Y3R1YXRlcy4gT2Zmc2V0cyBsYW5kIGluIHRoZSBmcm9udCAzMCU7IHRoZVxuLy8gR1BVIG1hcHMgdGhlbSBpbnRvIHRoZSBzZWxlY3RlZCBwb2xhcml0eSBmcmFtZSB3aXRob3V0IGV4dHJhIFJORyBkcmF3cy5cblxuZXhwb3J0IGNvbnN0IE1BWF9TUFJPVVRfU0lURVMgPSA4O1xuLy8gaGFsZiBvZiB0aGUgZnJvbnQgcmVnaW9uIHdoZXJlIHNpdGVzIGNhbiBsYW5kLCBpbiBub3JtYWxpemVkIGFyYyBsZW5ndGggKDAuMTUgPSBmcm9udCAzMCUgb2YgdGhlIG1lbWJyYW5lKVxuY29uc3QgRlJPTlRfSEFMRl9XSURUSCA9IDAuMTU7XG5cbnR5cGUgU2xvdCA9IHsgY2VudGVyOiBudW1iZXI7IG9uVW50aWw6IG51bWJlcjsgb2ZmVW50aWw6IG51bWJlciB9O1xuXG5leHBvcnQgY2xhc3MgU3Byb3V0U2NoZWR1bGVyIHtcbiAgcHJpdmF0ZSBzbG90czogU2xvdFtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc3RhZ2dlclN0ZXBzOiBudW1iZXIsXG4gICAgcHJpdmF0ZSByYW5kb20gPSBNYXRoLnJhbmRvbVxuICApIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE1BWF9TUFJPVVRfU0lURVM7IGkrKykge1xuICAgICAgLy8gc3RhZ2dlciB0aGUgZmlyc3Qgc3dpdGNoLW9uIG92ZXIgYSB3aG9sZSBvbi9vZmYgY3ljbGUgc28gdGhlIHNpdGVzIGRvbid0IGFsbCBzdGFydCB0b2dldGhlclxuICAgICAgdGhpcy5zbG90cy5wdXNoKHsgY2VudGVyOiAwLCBvblVudGlsOiAwLCBvZmZVbnRpbDogdGhpcy5yYW5kb20oKSAqIHN0YWdnZXJTdGVwcyB9KTtcbiAgICB9XG4gIH1cblxuICAvLyBXcml0ZXMgW2NlbnRlciAobm9ybWFsaXplZCBhcmMgbGVuZ3RoKSwgaGFsZldpZHRoIChub2RlcyksIHN0cmVuZ3RoLCAwXSBwZXIgc2xvdCBpbnRvIGBvdXRgLlxuICB1cGRhdGUoXG4gICAgc3RlcDogbnVtYmVyLFxuICAgIHBhcmFtczogeyBzcHJvdXRDb3VudDogbnVtYmVyOyBzcHJvdXRXaWR0aDogbnVtYmVyOyBzcHJvdXRGcm9udEJpYXM6IG51bWJlcjsgc3Byb3V0T25TdGVwczogbnVtYmVyOyBzcHJvdXRPZmZTdGVwczogbnVtYmVyIH0sXG4gICAgb3V0OiBGbG9hdDMyQXJyYXlcbiAgKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBNQVhfU1BST1VUX1NJVEVTOyBpKyspIHtcbiAgICAgIGNvbnN0IHNsb3QgPSB0aGlzLnNsb3RzW2ldO1xuICAgICAgaWYgKHN0ZXAgPj0gc2xvdC5vZmZVbnRpbCAmJiBzdGVwID49IHNsb3Qub25VbnRpbCkge1xuICAgICAgICBzbG90LmNlbnRlciA9IHNhbXBsZUNlbnRlcihwYXJhbXMuc3Byb3V0RnJvbnRCaWFzLCB0aGlzLnJhbmRvbSk7XG4gICAgICAgIHNsb3Qub25VbnRpbCA9IHN0ZXAgKyBwYXJhbXMuc3Byb3V0T25TdGVwcyAqICgwLjUgKyB0aGlzLnJhbmRvbSgpKTtcbiAgICAgICAgc2xvdC5vZmZVbnRpbCA9IHNsb3Qub25VbnRpbCArIHBhcmFtcy5zcHJvdXRPZmZTdGVwcyAqICgwLjUgKyB0aGlzLnJhbmRvbSgpKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFjdGl2ZSA9IGkgPCBwYXJhbXMuc3Byb3V0Q291bnQgJiYgc3RlcCA8IHNsb3Qub25VbnRpbDtcbiAgICAgIG91dC5zZXQoW3Nsb3QuY2VudGVyLCBwYXJhbXMuc3Byb3V0V2lkdGggKiAwLjUsIGFjdGl2ZSA/IDEgOiAwLCAwXSwgaSAqIDQpO1xuICAgIH1cbiAgfVxufVxuXG4vLyBOZWFyIHRoZSBmcm9udCAoYXJjIGxlbmd0aCAwKSB3aXRoIHByb2JhYmlsaXR5IGBmcm9udEJpYXNgLCBhbnl3aGVyZSBpbiB0aGUgZnJvbnQgcmVnaW9uIG90aGVyd2lzZS5cbmZ1bmN0aW9uIHNhbXBsZUNlbnRlcihmcm9udEJpYXM6IG51bWJlciwgcmFuZG9tOiAoKSA9PiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgb2Zmc2V0ID0gKHJhbmRvbSgpIC0gMC41KSAqIDIgKiBGUk9OVF9IQUxGX1dJRFRIO1xuICBpZiAocmFuZG9tKCkgPCBmcm9udEJpYXMpIHtcbiAgICBjb25zdCBnYXVzc2lhbiA9IE1hdGguc3FydCgtMiAqIE1hdGgubG9nKDEgLSByYW5kb20oKSkpICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiByYW5kb20oKSk7XG4gICAgb2Zmc2V0ID0gTWF0aC5tYXgoLUZST05UX0hBTEZfV0lEVEgsIE1hdGgubWluKEZST05UX0hBTEZfV0lEVEgsIGdhdXNzaWFuICogMC4wOCkpO1xuICB9XG4gIHJldHVybiAob2Zmc2V0ICsgMSkgJSAxO1xufVxuIiwiLy8gUHVyZSBmdWxsLXNuYXBzaG90IGRpYWdub3N0aWNzLiBSdW5zIGluIHRoZSBib3VuZGVkIHdvcmtlciwgd2l0aCBubyBET00gb3Jcbi8vIEdQVSBhY2Nlc3MuIEdlb21ldHJ5IGNoZWNrcywgdG9wb2xvZ3kgd2Fsa3MgYW5kIGNvdW50ZXIgc2VtYW50aWNzIGFyZSBzaGFyZWRcbi8vIGJ5IGxpdmUgZGlhZ25vc3RpY3MgYW5kIGV2ZXJ5IGZvcmNlZCBzY2llbnRpZmljLWFzc2F5IGNoZWNrcG9pbnQuXG5pbXBvcnQgeyBwb2x5Z29uT2NjdXBhbmN5LCBwb2x5Z29uQm9uZENyb3NzaW5nIH0gZnJvbSBcIi4vb2NjdXBhbmN5XCI7XG5cbmNvbnN0IFNFR01FTlRfV09SRFMgPSAxMDsgLy8gaWQsIHN1YnR5cGUsIHBvc2l0aW9uKDIpLCBvcmllbnRhdGlvbigyKSwgdGFpbCwgaGVhZCwgYXJjX2xlbmd0aCwgYWdlXG5jb25zdCBUQUlMID0gNjtcbmNvbnN0IEhFQUQgPSA3O1xuXG4vLyBtdXN0IG1hdGNoIHRoZSBURUxFTUVUUllfKiBpbmRpY2VzIGluIHNpbXVsYXRlLndnc2xcbmV4cG9ydCBjb25zdCBURUxFTUVUUllfQ09VTlRFUlMgPSBbXG4gIFwiY2FuZGlkYXRlc1wiLCAvLyBmcmVlIG1vbm9tZXJzIGluIHRoZSBwb2x5bWVyaXphdGlvbiBmaWVsZFxuICBcIm5laWdoYm9yRm91bmRcIiwgLy8gLi4uIHRoYXQgc2F3IGFuIGF2YWlsYWJsZSBoZWFkIG9yIG1vbm9tZXIgbmVhcmJ5XG4gIFwicGFzc2VkUHJvYlwiLCAvLyAuLi4gYW5kIHBhc3NlZCB0aGUgYmluZCBwcm9iYWJpbGl0eVxuICBcImJvdW5kXCIsIC8vIC4uLiBhbmQgd29uIGJvdGggbG9ja3NcbiAgXCJ1bmJvdW5kXCIsIC8vIG1pbnVzLWVuZCBkZXBvbHltZXJpemF0aW9uc1xuICBcImVsb25nYXRlZFwiLCAvLyBiaW5kcyBvbnRvIGFuIGV4aXN0aW5nIGZpbGFtZW50J3MgcGx1cyBlbmQgKGJvdW5kIG1pbnVzIGVsb25nYXRlZCA9IG5ldyBkaW1lcnMpXG4gIFwiaGVhZHNJbkZpZWxkXCIsIC8vIHBsdXMgZW5kcyBpbiB0aGUgcG9seW1lcml6YXRpb24gZmllbGQsIGkuZS4gYWJsZSB0byBlbG9uZ2F0ZVxuICBcImhlYWRGb3VuZFwiLCAvLyBjYW5kaWRhdGVzIHRoYXQgc2F3IHN1Y2ggYSBwbHVzIGVuZCBuZWFyYnlcbiAgXCJicmFuY2hlZFwiLCAvLyBuZXcgYnJhbmNoZXMgbnVjbGVhdGVkIG9uIHRoZSBzaWRlIG9mIGEgZmlsYW1lbnQgKGxhbWVsbGlwb2RpdW0gZmllbGQpXG4gIFwiZGVicmFuY2hlZFwiLCAvLyBicmFuY2hlcyB0aGF0IGNhbWUgb2ZmIHRoZWlyIG1vdGhlclxuICBcInBvaW50Q29udGFjdHNcIixcbiAgXCJib25kQ29udGFjdHNcIixcbiAgXCJyZWFyTWludXNMb3NzXCIsXG4gIFwiZnJvbnRNaW51c0xvc3NcIixcbiAgXCJyZWFyUGx1c0xvc3NcIixcbiAgXCJ0ZXRoZXJSZWxlYXNlZFwiLFxuXSBhcyBjb25zdDtcblxudHlwZSBDb3VudGVycyA9IFJlY29yZDwodHlwZW9mIFRFTEVNRVRSWV9DT1VOVEVSUylbbnVtYmVyXSwgbnVtYmVyPjtcblxuZXhwb3J0IHR5cGUgQWN0aW5TdGF0cyA9IHtcbiAgcnVuOiBzdHJpbmc7XG4gIGZyYW1lOiBudW1iZXI7XG4gIHN0ZXA6IG51bWJlcjtcbiAgYWN0aW5Db3VudDogbnVtYmVyO1xuICBtb25vbWVyczogbnVtYmVyO1xuICBmaWxhbWVudHM6IG51bWJlcjtcbiAgYnJhbmNoZXM6IG51bWJlcjsgLy8gZmlsYW1lbnRzIGhhbmdpbmcgb2ZmIHRoZSBzaWRlIG9mIGFub3RoZXIgb25lXG4gIGluUG9seW1lcjogbnVtYmVyO1xuICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHM6IG51bWJlcjsgLy8gbGVnYWN5IG1hcmtlci14IGhhbGYsIG5vdCB0aGUgY3VycmVudCBnZW9tZXRyaWMgcG9sYXJpdHkgZnJhbWVcbiAgaW5zaWRlUG9seW1lckJlYWRzOiBudW1iZXI7XG4gIGluc2lkZU1vbm9tZXJCZWFkczogbnVtYmVyO1xuICBnQWN0aW5Nb2RlOiBcIndlbGwtbWl4ZWRcIiB8IFwicGFydGljbGVzXCI7XG4gIGdBY3RpbkFtb3VudDogbnVtYmVyO1xuICBnQWN0aW5Db25jZW50cmF0aW9uOiBudW1iZXI7XG4gIGFjdGluQmFsYW5jZUVycm9yOiBudW1iZXI7XG4gIGNyb3NzaW5nRmlsYW1lbnRCb25kczogbnVtYmVyO1xuICBtZWFuUG9seW1lckFnZTogbnVtYmVyO1xuICBtYXhQb2x5bWVyQWdlOiBudW1iZXI7XG4gIG1lYW5MZW5ndGg6IG51bWJlcjtcbiAgbWVkaWFuTGVuZ3RoOiBudW1iZXI7XG4gIHA5MExlbmd0aDogbnVtYmVyO1xuICBtYXhMZW5ndGg6IG51bWJlcjtcbiAgLy8gZmlsYW1lbnQgY291bnRzIHBlciBsZW5ndGggYmluOiAyLCAzLTQsIDUtOCwgOS0xNiwgMTctMzIsIDMzLTY0LCA2NStcbiAgaGlzdG9ncmFtOiBudW1iZXJbXTtcbiAgbWVkaWFuQm9uZExlbmd0aDogbnVtYmVyOyAvLyBpbiB1bml0cyBvZiB0aGUgYWN0aW4gcmVzdCBsZW5ndGhcbiAgbWVkaWFuQmVuZEFuZ2xlOiBudW1iZXI7IC8vIGRlZ3JlZXMgYmV0d2VlbiBjb25zZWN1dGl2ZSBib25kcyBvZiBhIGZpbGFtZW50OyBsb3cgPSBzdGlmZlxuICBicm9rZW5MaW5rczogbnVtYmVyOyAvLyBhLmhlYWQgPSBiIGJ1dCBiLnRhaWwgIT0gYVxuICBjeWNsZXM6IG51bWJlcjtcbiAgcGVyU3RlcDogQ291bnRlcnM7IC8vIGV2ZW50IHJhdGVzIHNpbmNlIHRoZSBwcmV2aW91cyBzYW1wbGVcbiAgY2VsbDogQ2VsbFNoYXBlO1xuICBkaWFnbm9zdGljS2luZD86IFwic2ltdWxhdGlvblwiIHwgXCJjb250YWN0LXJlY2hlY2tcIjtcbn07XG5cbi8vIG1lbWJyYW5lIHNoYXBlIGluIHBpeGVsczsgbm9kZSAwIGlzIHRoZSBmcm9udCAodGhlIHJpZ2h0IHNpZGUgYXQgcmVzZXQpLCBub2RlIGNvdW50IC8gMiB0aGUgcmVhclxuZXhwb3J0IHR5cGUgQ2VsbFNoYXBlID0ge1xuICBsZWZ0OiBudW1iZXI7IC8vIGxlZnRtb3N0IG1lbWJyYW5lIHhcbiAgcmlnaHQ6IG51bWJlcjsgLy8gcmlnaHRtb3N0IG1lbWJyYW5lIHhcbiAgdG9wOiBudW1iZXI7XG4gIGJvdHRvbTogbnVtYmVyO1xuICBmcm9udFg6IG51bWJlcjtcbiAgcmVhclg6IG51bWJlcjtcbiAgY2VudHJvaWRYOiBudW1iZXI7XG4gIGNlbnRyb2lkWTogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlcjsgLy8gZnJvbnQgbm9kZSB0byByZWFyIG5vZGVcbiAgYXJlYTogbnVtYmVyOyAvLyByZWxhdGl2ZSB0byB0aGUgYXJlYSBhdCByZXNldFxuICAvLyBtZWFuIG1lbWJyYW5lIGVkZ2UgbGVuZ3RoIGluIHVuaXRzIG9mIHRoZSByZXN0IGxlbmd0aCwgb3ZlciB0aGUgcXVhcnRlciBvZiB0aGUgbm9kZXMgYXJvdW5kIHRoZSBmcm9udCBhbmQgdGhlIHJlYXJcbiAgZnJvbnRTcGFjaW5nOiBudW1iZXI7XG4gIHJlYXJTcGFjaW5nOiBudW1iZXI7XG59O1xuXG5jb25zdCBISVNUT0dSQU1fRURHRVMgPSBbMiwgNCwgOCwgMTYsIDMyLCA2NF07XG5cbmV4cG9ydCBjbGFzcyBUZWxlbWV0cnlBbmFseXNpcyB7XG4gIHByaXZhdGUgbGFzdENvdW50ZXJzOiBudW1iZXJbXSB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIGxhc3RTdGVwID0gMDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGFjdGluQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lQ291bnQ6IG51bWJlcixcbiAgICBwcml2YXRlIG1lbWJyYW5lUmVzdExlbmd0aDogbnVtYmVyLFxuICAgIHByaXZhdGUgcnVuOiBzdHJpbmcsXG4gICAgcHJpdmF0ZSB3ZWxsTWl4ZWQgPSBmYWxzZVxuICApIHt9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBudWxsO1xuICAgIHRoaXMubGFzdFN0ZXAgPSAwO1xuICB9XG5cbiAgYW5hbHl6ZShcbiAgICBhY3RpbjogQXJyYXlCdWZmZXIsXG4gICAgbWVtYnJhbmVEYXRhOiBBcnJheUJ1ZmZlcixcbiAgICBjb3VudGVyRGF0YTogQXJyYXlCdWZmZXIsXG4gICAgZnJhbWU6IG51bWJlcixcbiAgICBzdGVwOiBudW1iZXIsXG4gICAgZXF1aWxpYnJpdW1MaW5lRGlzdGFuY2U6IG51bWJlcixcbiAgICB2ZXJpZmljYXRpb24gPSBmYWxzZVxuICApIHtcbiAgICBjb25zdCBwcmV2aW91c0NvdW50ZXJzID0gdGhpcy5sYXN0Q291bnRlcnMsXG4gICAgICBwcmV2aW91c1N0ZXAgPSB0aGlzLmxhc3RTdGVwO1xuICAgIGNvbnN0IHdvcmRzID0gbmV3IFVpbnQzMkFycmF5KGFjdGluKTtcbiAgICBjb25zdCBmbG9hdHMgPSBuZXcgRmxvYXQzMkFycmF5KHdvcmRzLmJ1ZmZlcik7XG4gICAgY29uc3QgY291bnRlcnMgPSBBcnJheS5mcm9tKG5ldyBVaW50MzJBcnJheShjb3VudGVyRGF0YSkpO1xuICAgIGNvbnN0IG1lbWJyYW5lID0gbmV3IEZsb2F0MzJBcnJheShtZW1icmFuZURhdGEpO1xuICAgIGNvbnN0IGNlbGwgPSB0aGlzLmNlbGxTaGFwZShtZW1icmFuZSk7XG4gICAgY29uc3Qgc3RhdHMgPSB0aGlzLmNvbXB1dGUod29yZHMsIGZsb2F0cywgY291bnRlcnMsIGZyYW1lLCBzdGVwLCBlcXVpbGlicml1bUxpbmVEaXN0YW5jZSwgY2VsbCk7XG4gICAgY29uc3QgaW5zaWRlID0gcG9seWdvbk9jY3VwYW5jeShtZW1icmFuZSwgU0VHTUVOVF9XT1JEUywgdGhpcy53ZWxsTWl4ZWQpO1xuICAgIGNvbnN0IGNyb3NzaW5nID0gdGhpcy53ZWxsTWl4ZWQgPyBwb2x5Z29uQm9uZENyb3NzaW5nKG1lbWJyYW5lKSA6IG51bGw7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmFjdGluQ291bnQ7IGkrKykge1xuICAgICAgY29uc3QgZGlzY29ubmVjdGVkID0gd29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpO1xuICAgICAgaWYgKHRoaXMud2VsbE1peGVkICYmIGRpc2Nvbm5lY3RlZCkgY29udGludWU7IC8vIHJlc2Vydm9pciBlbnRyaWVzIGhhdmUgbm8gc3BhdGlhbCBjb29yZGluYXRlc1xuICAgICAgY29uc3QgdGFpbCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF07XG4gICAgICBpZiAoXG4gICAgICAgIGNyb3NzaW5nICYmXG4gICAgICAgIHRhaWwgIT09IGkgJiZcbiAgICAgICAgY3Jvc3NpbmcoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdLCBmbG9hdHNbdGFpbCAqIFNFR01FTlRfV09SRFMgKyAyXSwgZmxvYXRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgM10pXG4gICAgICApXG4gICAgICAgIHN0YXRzLmNyb3NzaW5nRmlsYW1lbnRCb25kcysrO1xuICAgICAgaWYgKCFpbnNpZGUoZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl0sIGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdKSkgY29udGludWU7XG4gICAgICBpZiAod29yZHNbaSAqIFNFR01FTlRfV09SRFMgKyBUQUlMXSA9PT0gaSAmJiB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIEhFQURdID09PSBpKSBzdGF0cy5pbnNpZGVNb25vbWVyQmVhZHMrKztcbiAgICAgIGVsc2Ugc3RhdHMuaW5zaWRlUG9seW1lckJlYWRzKys7XG4gICAgfVxuICAgIHN0YXRzLmdBY3RpbkNvbmNlbnRyYXRpb24gPSB0aGlzLndlbGxNaXhlZCA/IHN0YXRzLmdBY3RpbkFtb3VudCAvICgoY2VsbC5hcmVhICogKHRoaXMubWVtYnJhbmVDb3VudCAqIHRoaXMubWVtYnJhbmVSZXN0TGVuZ3RoKSAqKiAyKSAvICg0ICogTWF0aC5QSSkpIDogMDtcbiAgICBzdGF0cy5kaWFnbm9zdGljS2luZCA9IHZlcmlmaWNhdGlvbiA/IFwiY29udGFjdC1yZWNoZWNrXCIgOiBcInNpbXVsYXRpb25cIjtcbiAgICBpZiAodmVyaWZpY2F0aW9uKSB7XG4gICAgICB0aGlzLmxhc3RDb3VudGVycyA9IHByZXZpb3VzQ291bnRlcnM7XG4gICAgICB0aGlzLmxhc3RTdGVwID0gcHJldmlvdXNTdGVwO1xuICAgIH1cbiAgICByZXR1cm4gc3RhdHM7XG4gIH1cblxuICBwcml2YXRlIGNlbGxTaGFwZShmbG9hdHM6IEZsb2F0MzJBcnJheSk6IENlbGxTaGFwZSB7XG4gICAgY29uc3QgbiA9IHRoaXMubWVtYnJhbmVDb3VudDtcbiAgICBjb25zdCB4ID0gKGk6IG51bWJlcikgPT4gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgY29uc3QgeSA9IChpOiBudW1iZXIpID0+IGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDNdO1xuICAgIGxldCBsZWZ0ID0gSW5maW5pdHk7XG4gICAgbGV0IHJpZ2h0ID0gLUluZmluaXR5O1xuICAgIGxldCB0b3AgPSBJbmZpbml0eTtcbiAgICBsZXQgYm90dG9tID0gLUluZmluaXR5O1xuICAgIC8vIGFyZWEtd2VpZ2h0ZWQgY2VudHJvaWQgKHNob2VsYWNlKVxuICAgIGxldCBhcmVhID0gMDtcbiAgICBsZXQgY3ggPSAwO1xuICAgIGxldCBjeSA9IDA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGxlZnQgPSBNYXRoLm1pbihsZWZ0LCB4KGkpKTtcbiAgICAgIHJpZ2h0ID0gTWF0aC5tYXgocmlnaHQsIHgoaSkpO1xuICAgICAgdG9wID0gTWF0aC5taW4odG9wLCB5KGkpKTtcbiAgICAgIGJvdHRvbSA9IE1hdGgubWF4KGJvdHRvbSwgeShpKSk7XG4gICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICBjb25zdCBjcm9zcyA9IHgoaSkgKiB5KGopIC0geChqKSAqIHkoaSk7XG4gICAgICBhcmVhICs9IGNyb3NzIC8gMjtcbiAgICAgIGN4ICs9ICh4KGkpICsgeChqKSkgKiBjcm9zcztcbiAgICAgIGN5ICs9ICh5KGkpICsgeShqKSkgKiBjcm9zcztcbiAgICB9XG4gICAgY29uc3QgcmVhciA9IG4gPj4gMTtcbiAgICBjb25zdCBxdWFydGVyU3BhY2luZyA9IChjZW50ZXI6IG51bWJlcikgPT4ge1xuICAgICAgbGV0IHN1bSA9IDA7XG4gICAgICBmb3IgKGxldCBrID0gLShuID4+IDMpOyBrIDwgbiA+PiAzOyBrKyspIHtcbiAgICAgICAgY29uc3QgaSA9IChjZW50ZXIgKyBrICsgbikgJSBuO1xuICAgICAgICBjb25zdCBqID0gKGkgKyAxKSAlIG47XG4gICAgICAgIHN1bSArPSBNYXRoLmh5cG90KHgoaikgLSB4KGkpLCB5KGopIC0geShpKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3VtIC8gKG4gPj4gMikgLyB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aDtcbiAgICB9O1xuICAgIGNvbnN0IHJlc3RBcmVhID0gKG4gKiB0aGlzLm1lbWJyYW5lUmVzdExlbmd0aCkgKiogMiAvICg0ICogTWF0aC5QSSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGxlZnQsXG4gICAgICByaWdodCxcbiAgICAgIHRvcCxcbiAgICAgIGJvdHRvbSxcbiAgICAgIGZyb250WDogeCgwKSxcbiAgICAgIHJlYXJYOiB4KHJlYXIpLFxuICAgICAgY2VudHJvaWRYOiBjeCAvICg2ICogYXJlYSksXG4gICAgICBjZW50cm9pZFk6IGN5IC8gKDYgKiBhcmVhKSxcbiAgICAgIGxlbmd0aDogTWF0aC5oeXBvdCh4KDApIC0geChyZWFyKSwgeSgwKSAtIHkocmVhcikpLFxuICAgICAgYXJlYTogTWF0aC5hYnMoYXJlYSkgLyByZXN0QXJlYSxcbiAgICAgIGZyb250U3BhY2luZzogcXVhcnRlclNwYWNpbmcoMCksXG4gICAgICByZWFyU3BhY2luZzogcXVhcnRlclNwYWNpbmcocmVhciksXG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgY29tcHV0ZSh3b3JkczogVWludDMyQXJyYXksIGZsb2F0czogRmxvYXQzMkFycmF5LCBjb3VudGVyczogbnVtYmVyW10sIGZyYW1lOiBudW1iZXIsIHN0ZXA6IG51bWJlciwgcmVzdExlbmd0aDogbnVtYmVyLCBjZWxsOiBDZWxsU2hhcGUpOiBBY3RpblN0YXRzIHtcbiAgICBjb25zdCBuID0gdGhpcy5hY3RpbkNvdW50O1xuICAgIGNvbnN0IHZpc2l0ZWQgPSBuZXcgVWludDhBcnJheShuKTtcbiAgICBjb25zdCBsZW5ndGhzOiBudW1iZXJbXSA9IFtdO1xuICAgIGxldCBtb25vbWVycyA9IDA7XG4gICAgbGV0IGJyb2tlbkxpbmtzID0gMDtcbiAgICBsZXQgY3ljbGVzID0gMDtcbiAgICBsZXQgYnJhbmNoZXMgPSAwO1xuICAgIGxldCBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMgPSAwO1xuICAgIGxldCBhZ2VTdW0gPSAwLFxuICAgICAgbWF4QWdlID0gMDtcbiAgICBjb25zdCBib25kTGVuZ3RoczogbnVtYmVyW10gPSBbXTtcbiAgICBjb25zdCBiZW5kQW5nbGVzOiBudW1iZXJbXSA9IFtdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNvbnN0IHRhaWwgPSB3b3Jkc1tpICogU0VHTUVOVF9XT1JEUyArIFRBSUxdO1xuICAgICAgY29uc3QgaGVhZCA9IHdvcmRzW2kgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICBpZiAodGFpbCA9PT0gaSAmJiBoZWFkID09PSBpKSB7XG4gICAgICAgIG1vbm9tZXJzKys7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgY29uc3QgYWdlID0gZmxvYXRzW2kgKiBTRUdNRU5UX1dPUkRTICsgOV07XG4gICAgICBhZ2VTdW0gKz0gYWdlO1xuICAgICAgbWF4QWdlID0gTWF0aC5tYXgobWF4QWdlLCBhZ2UpO1xuICAgICAgaWYgKGZsb2F0c1tpICogU0VHTUVOVF9XT1JEUyArIDJdIDwgKGNlbGwuZnJvbnRYICsgY2VsbC5yZWFyWCkgLyAyKSBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMrKztcbiAgICAgIGlmIChoZWFkICE9PSBpICYmIHdvcmRzW2hlYWQgKiBTRUdNRU5UX1dPUkRTICsgVEFJTF0gIT09IGkpIHtcbiAgICAgICAgYnJva2VuTGlua3MrKztcbiAgICAgIH1cbiAgICAgIC8vIGEgYnJhbmNoIHJvb3QncyB0YWlsIGlzIGl0cyBtb3RoZXIsIHdob3NlIGhlYWQgcG9pbnRzIGVsc2V3aGVyZSBhbG9uZyB0aGUgbW90aGVyIGZpbGFtZW50XG4gICAgICBjb25zdCBpc0JyYW5jaFJvb3QgPSB0YWlsICE9PSBpICYmIHdvcmRzW3RhaWwgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF0gIT09IGk7XG4gICAgICBpZiAodGFpbCAhPT0gaSAmJiAhaXNCcmFuY2hSb290KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgYnJhbmNoZXMgKz0gaXNCcmFuY2hSb290ID8gMSA6IDA7XG4gICAgICAvLyBhIG1pbnVzIGVuZCBvciBicmFuY2ggcm9vdDogd2FsayB0byB0aGUgcGx1cyBlbmRcbiAgICAgIGxldCBsZW5ndGggPSAxO1xuICAgICAgbGV0IGN1cnJlbnQgPSBpO1xuICAgICAgbGV0IHByZXZEeCA9IDA7XG4gICAgICBsZXQgcHJldkR5ID0gMDtcbiAgICAgIHZpc2l0ZWRbaV0gPSAxO1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgY29uc3QgbmV4dCA9IHdvcmRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgSEVBRF07XG4gICAgICAgIGlmIChuZXh0ID09PSBjdXJyZW50KSBicmVhaztcbiAgICAgICAgaWYgKHZpc2l0ZWRbbmV4dF0pIHtcbiAgICAgICAgICBjeWNsZXMrKztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkeCA9IGZsb2F0c1tuZXh0ICogU0VHTUVOVF9XT1JEUyArIDJdIC0gZmxvYXRzW2N1cnJlbnQgKiBTRUdNRU5UX1dPUkRTICsgMl07XG4gICAgICAgIGNvbnN0IGR5ID0gZmxvYXRzW25leHQgKiBTRUdNRU5UX1dPUkRTICsgM10gLSBmbG9hdHNbY3VycmVudCAqIFNFR01FTlRfV09SRFMgKyAzXTtcbiAgICAgICAgYm9uZExlbmd0aHMucHVzaChNYXRoLmh5cG90KGR4LCBkeSkpO1xuICAgICAgICBpZiAobGVuZ3RoID4gMSkge1xuICAgICAgICAgIGJlbmRBbmdsZXMucHVzaCgoTWF0aC5hYnMoTWF0aC5hdGFuMihwcmV2RHggKiBkeSAtIHByZXZEeSAqIGR4LCBwcmV2RHggKiBkeCArIHByZXZEeSAqIGR5KSkgKiAxODApIC8gTWF0aC5QSSk7XG4gICAgICAgIH1cbiAgICAgICAgcHJldkR4ID0gZHg7XG4gICAgICAgIHByZXZEeSA9IGR5O1xuICAgICAgICB2aXNpdGVkW25leHRdID0gMTtcbiAgICAgICAgY3VycmVudCA9IG5leHQ7XG4gICAgICAgIGxlbmd0aCsrO1xuICAgICAgfVxuICAgICAgbGVuZ3Rocy5wdXNoKGxlbmd0aCk7XG4gICAgfVxuXG4gICAgbGVuZ3Rocy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgY29uc3QgaW5Qb2x5bWVyID0gbGVuZ3Rocy5yZWR1Y2UoKHN1bSwgbCkgPT4gc3VtICsgbCwgMCk7XG4gICAgY29uc3QgaGlzdG9ncmFtID0gbmV3IEFycmF5KEhJU1RPR1JBTV9FREdFUy5sZW5ndGggKyAxKS5maWxsKDApO1xuICAgIGZvciAoY29uc3QgbCBvZiBsZW5ndGhzKSB7XG4gICAgICBjb25zdCBiaW4gPSBISVNUT0dSQU1fRURHRVMuZmluZEluZGV4KChlZGdlKSA9PiBsIDw9IGVkZ2UpO1xuICAgICAgaGlzdG9ncmFtW2JpbiA9PT0gLTEgPyBISVNUT0dSQU1fRURHRVMubGVuZ3RoIDogYmluXSsrO1xuICAgIH1cblxuICAgIGNvbnN0IHN0ZXBzID0gTWF0aC5tYXgoMSwgc3RlcCAtIHRoaXMubGFzdFN0ZXApO1xuICAgIGNvbnN0IHBlclN0ZXAgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gICAgICBURUxFTUVUUllfQ09VTlRFUlMubWFwKChuYW1lLCBrKSA9PiBbbmFtZSwgdGhpcy5sYXN0Q291bnRlcnMgPyAoY291bnRlcnNba10gLSB0aGlzLmxhc3RDb3VudGVyc1trXSkgLyBzdGVwcyA6IDBdKVxuICAgICkgYXMgQ291bnRlcnM7XG4gICAgdGhpcy5sYXN0Q291bnRlcnMgPSBjb3VudGVycztcbiAgICB0aGlzLmxhc3RTdGVwID0gc3RlcDtcblxuICAgIGNvbnN0IHF1YW50aWxlID0gKHE6IG51bWJlcikgPT4gKGxlbmd0aHMubGVuZ3RoID8gbGVuZ3Roc1tNYXRoLm1pbihsZW5ndGhzLmxlbmd0aCAtIDEsIE1hdGguZmxvb3IocSAqIGxlbmd0aHMubGVuZ3RoKSldIDogMCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJ1bjogdGhpcy5ydW4sXG4gICAgICBmcmFtZSxcbiAgICAgIHN0ZXAsXG4gICAgICBhY3RpbkNvdW50OiBuLFxuICAgICAgbW9ub21lcnMsXG4gICAgICBmaWxhbWVudHM6IGxlbmd0aHMubGVuZ3RoLFxuICAgICAgYnJhbmNoZXMsXG4gICAgICBpblBvbHltZXIsXG4gICAgICBwb3N0ZXJpb3JQb2x5bWVyQmVhZHMsXG4gICAgICBpbnNpZGVQb2x5bWVyQmVhZHM6IDAsXG4gICAgICBpbnNpZGVNb25vbWVyQmVhZHM6IDAsXG4gICAgICBnQWN0aW5Nb2RlOiB0aGlzLndlbGxNaXhlZCA/IFwid2VsbC1taXhlZFwiIDogXCJwYXJ0aWNsZXNcIixcbiAgICAgIGdBY3RpbkFtb3VudDogbW9ub21lcnMsXG4gICAgICBnQWN0aW5Db25jZW50cmF0aW9uOiAwLFxuICAgICAgYWN0aW5CYWxhbmNlRXJyb3I6IG1vbm9tZXJzICsgaW5Qb2x5bWVyIC0gbixcbiAgICAgIGNyb3NzaW5nRmlsYW1lbnRCb25kczogMCxcbiAgICAgIG1lYW5Qb2x5bWVyQWdlOiBuID4gbW9ub21lcnMgPyBhZ2VTdW0gLyAobiAtIG1vbm9tZXJzKSA6IDAsXG4gICAgICBtYXhQb2x5bWVyQWdlOiBtYXhBZ2UsXG4gICAgICBtZWFuTGVuZ3RoOiBsZW5ndGhzLmxlbmd0aCA/IGluUG9seW1lciAvIGxlbmd0aHMubGVuZ3RoIDogMCxcbiAgICAgIG1lZGlhbkxlbmd0aDogcXVhbnRpbGUoMC41KSxcbiAgICAgIHA5MExlbmd0aDogcXVhbnRpbGUoMC45KSxcbiAgICAgIG1heExlbmd0aDogbGVuZ3Rocy5sZW5ndGggPyBsZW5ndGhzW2xlbmd0aHMubGVuZ3RoIC0gMV0gOiAwLFxuICAgICAgaGlzdG9ncmFtLFxuICAgICAgbWVkaWFuQm9uZExlbmd0aDogYm9uZExlbmd0aHMubGVuZ3RoID8gYm9uZExlbmd0aHMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JvbmRMZW5ndGhzLmxlbmd0aCA+PiAxXSAvIHJlc3RMZW5ndGggOiAwLFxuICAgICAgbWVkaWFuQmVuZEFuZ2xlOiBiZW5kQW5nbGVzLmxlbmd0aCA/IGJlbmRBbmdsZXMuc29ydCgoYSwgYikgPT4gYSAtIGIpW2JlbmRBbmdsZXMubGVuZ3RoID4+IDFdIDogMCxcbiAgICAgIGJyb2tlbkxpbmtzLFxuICAgICAgY3ljbGVzLFxuICAgICAgcGVyU3RlcCxcbiAgICAgIGNlbGwsXG4gICAgfTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgVEVMRU1FVFJZX0NPVU5URVJTLCB0eXBlIEFjdGluU3RhdHMgfSBmcm9tIFwiLi90ZWxlbWV0cnktYW5hbHlzaXNcIjtcbmV4cG9ydCB7IFRFTEVNRVRSWV9DT1VOVEVSUywgdHlwZSBBY3RpblN0YXRzLCB0eXBlIENlbGxTaGFwZSB9IGZyb20gXCIuL3RlbGVtZXRyeS1hbmFseXNpc1wiO1xuXG4vLyBPbmUgaW4tZmxpZ2h0IHJlYWRiYWNrL3dvcmtlciBqb2IuIEV2ZXJ5IGZvcmNlZCBhc3NheSBjaGVja3BvaW50IHdhaXRzIGZvciBhXG4vLyBmcmVzaCBmdWxsIGFuYWx5c2lzOyBpbnRlcmFjdGl2ZSByZXF1ZXN0cyBjb2FsZXNjZSB3aGlsZSB0aGUgd29ya2VyIGlzIGJ1c3kuXG5leHBvcnQgY2xhc3MgQWN0aW5UZWxlbWV0cnkge1xuICByZWFkb25seSBjb3VudGVyQnVmZmVyOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgYWN0aW5TdGFnaW5nOiBHUFVCdWZmZXI7XG4gIHByaXZhdGUgY291bnRlclN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBtZW1icmFuZVN0YWdpbmc6IEdQVUJ1ZmZlcjtcbiAgcHJpdmF0ZSBwZW5kaW5nOiBQcm9taXNlPHZvaWQ+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgd29ya2VyID0gbmV3IFdvcmtlcihuZXcgVVJMKFwiLi90ZWxlbWV0cnkud29ya2VyLnRzXCIsIGltcG9ydC5tZXRhLnVybCksIHsgdHlwZTogXCJtb2R1bGVcIiB9KTtcbiAgcHJpdmF0ZSBqb2I6IHsgaWQ6IG51bWJlcjsgcmVzb2x2ZTogKHZhbHVlOiB7IHN0YXRzOiBBY3RpblN0YXRzOyBhbmFseXNpc01zOiBudW1iZXIgfSkgPT4gdm9pZDsgcmVqZWN0OiAoZXJyb3I6IEVycm9yKSA9PiB2b2lkIH0gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSB3b3JrZXJGYWlsdXJlOiBFcnJvciB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIG5leHRJZCA9IDA7XG4gIHByaXZhdGUgZGlzcGxheTogSFRNTFByZUVsZW1lbnQ7XG4gIHByaXZhdGUgc3VtbWFyeTogSFRNTEVsZW1lbnQ7XG4gIHByaXZhdGUgcG9zdFRvU2VydmVyID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInRlbGVtZXRyeVwiKSA9PT0gXCIxXCI7XG4gIHJlYWRvbmx5IGhpc3Rvcnk6IEFjdGluU3RhdHNbXSA9IFtdO1xuICBvblNhbXBsZT86IChzdGF0czogQWN0aW5TdGF0cykgPT4gdm9pZDtcbiAgcmVhZG9ubHkgdGltaW5ncyA9IHsgcmVhZGJhY2tNczogMCwgYW5hbHlzaXNNczogMCwgd29ya2VyUm91bmRUcmlwTXM6IDAsIHRvdGFsTXM6IDAsIGNvYWxlc2NlZEF1dG9tYXRpY1NhbXBsZXM6IDAgfTtcbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBkZXZpY2U6IEdQVURldmljZSxcbiAgICBwcml2YXRlIGFjdGluQnVmZmVyOiBHUFVCdWZmZXIsXG4gICAgYWN0aW5Db3VudDogbnVtYmVyLFxuICAgIHByaXZhdGUgbWVtYnJhbmVCdWZmZXI6IEdQVUJ1ZmZlcixcbiAgICBtZW1icmFuZUNvdW50OiBudW1iZXIsXG4gICAgbWVtYnJhbmVSZXN0TGVuZ3RoOiBudW1iZXIsXG4gICAgcHJpdmF0ZSBydW46IHN0cmluZyxcbiAgICBwcml2YXRlIGludGVydmFsRnJhbWVzID0gMzAsXG4gICAgcHJpdmF0ZSB3ZWxsTWl4ZWQgPSBmYWxzZVxuICApIHtcbiAgICB0aGlzLmNvdW50ZXJCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICAgIGxhYmVsOiBcIlRlbGVtZXRyeSBjb3VudGVyc1wiLFxuICAgICAgc2l6ZTogNCAqIFRFTEVNRVRSWV9DT1VOVEVSUy5sZW5ndGgsXG4gICAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuU1RPUkFHRSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfU1JDIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QsXG4gICAgfSk7XG4gICAgY29uc3Qgc3RhZ2luZyA9IChzaXplOiBudW1iZXIpID0+IGRldmljZS5jcmVhdGVCdWZmZXIoeyBzaXplLCB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCB9KTtcbiAgICB0aGlzLmFjdGluU3RhZ2luZyA9IHN0YWdpbmcoYWN0aW5CdWZmZXIuc2l6ZSk7XG4gICAgdGhpcy5jb3VudGVyU3RhZ2luZyA9IHN0YWdpbmcodGhpcy5jb3VudGVyQnVmZmVyLnNpemUpO1xuICAgIHRoaXMubWVtYnJhbmVTdGFnaW5nID0gc3RhZ2luZyhtZW1icmFuZUJ1ZmZlci5zaXplKTtcbiAgICB0aGlzLndvcmtlci5vbm1lc3NhZ2UgPSAoeyBkYXRhIH0pID0+IHtcbiAgICAgIGNvbnN0IGpvYiA9IHRoaXMuam9iO1xuICAgICAgaWYgKCFqb2IgfHwgam9iLmlkICE9PSBkYXRhLmlkKSByZXR1cm47XG4gICAgICB0aGlzLmpvYiA9IG51bGw7XG4gICAgICBpZiAoZGF0YS5lcnJvcikgam9iLnJlamVjdChuZXcgRXJyb3IoZGF0YS5lcnJvcikpO1xuICAgICAgZWxzZSBqb2IucmVzb2x2ZShkYXRhKTtcbiAgICB9O1xuICAgIHRoaXMud29ya2VyLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIHRoaXMud29ya2VyRmFpbHVyZSA9IG5ldyBFcnJvcihgRGlhZ25vc3RpYyB3b3JrZXI6ICR7ZXZlbnQubWVzc2FnZX1gKTtcbiAgICAgIHRoaXMuam9iPy5yZWplY3QodGhpcy53b3JrZXJGYWlsdXJlKTtcbiAgICAgIHRoaXMuam9iID0gbnVsbDtcbiAgICB9O1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJpbml0XCIsIGNvbmZpZzogW2FjdGluQ291bnQsIG1lbWJyYW5lQ291bnQsIG1lbWJyYW5lUmVzdExlbmd0aCwgcnVuLCB3ZWxsTWl4ZWRdIH0pO1xuICAgIGNvbnN0IGRldGFpbHMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkZXRhaWxzXCIpLCB7IGlkOiBcImRpYWdub3N0aWNzXCIgfSk7XG4gICAgT2JqZWN0LmFzc2lnbihkZXRhaWxzLnN0eWxlLCB7XG4gICAgICBwb3NpdGlvbjogXCJmaXhlZFwiLFxuICAgICAgbGVmdDogXCIxMHB4XCIsXG4gICAgICBib3R0b206IFwiMTBweFwiLFxuICAgICAgcGFkZGluZzogXCI2cHhcIixcbiAgICAgIGNvbG9yOiBcIndoaXRlXCIsXG4gICAgICBmb250OiBcIjExcHggbW9ub3NwYWNlXCIsXG4gICAgICBiYWNrZ3JvdW5kOiBcInJnYmEoMCwwLDAsLjgpXCIsXG4gICAgICB6SW5kZXg6IFwiMTAwMFwiLFxuICAgICAgbWF4V2lkdGg6IFwiY2FsYygxMDB2dyAtIDMycHgpXCIsXG4gICAgfSk7XG4gICAgdGhpcy5zdW1tYXJ5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInN1bW1hcnlcIik7XG4gICAgdGhpcy5zdW1tYXJ5LnRleHRDb250ZW50ID0gXCJGdWxsIG51bWVyaWNhbCBkaWFnbm9zdGljcyDCtyB3b3JrZXJcIjtcbiAgICB0aGlzLmRpc3BsYXkgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwcmVcIiksIHsgaWQ6IFwiYWN0aW5UZWxlbWV0cnlcIiB9KTtcbiAgICBPYmplY3QuYXNzaWduKHRoaXMuZGlzcGxheS5zdHlsZSwgeyBtYXhIZWlnaHQ6IFwiMjIwcHhcIiwgb3ZlcmZsb3c6IFwiYXV0b1wiLCBtYXJnaW46IFwiNnB4IDAgMFwiIH0pO1xuICAgIGRldGFpbHMuYXBwZW5kKHRoaXMuc3VtbWFyeSwgdGhpcy5kaXNwbGF5KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZChkZXRhaWxzKTtcbiAgICAod2luZG93IGFzIGFueSkuYWN0aW5UZWxlbWV0cnkgPSB0aGlzO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicGFnZWhpZGVcIiwgKGV2ZW50KSA9PiB7XG4gICAgICBpZiAoIWV2ZW50LnBlcnNpc3RlZCkgdGhpcy53b3JrZXIudGVybWluYXRlKCk7XG4gICAgfSk7XG4gIH1cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5kZXZpY2UucXVldWUud3JpdGVCdWZmZXIodGhpcy5jb3VudGVyQnVmZmVyLCAwLCBuZXcgVWludDMyQXJyYXkoVEVMRU1FVFJZX0NPVU5URVJTLmxlbmd0aCkpO1xuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJyZXNldFwiIH0pO1xuICAgIHRoaXMuaGlzdG9yeS5sZW5ndGggPSAwO1xuICB9XG4gIGFzeW5jIHVwZGF0ZShmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3Q6IG51bWJlciwgZm9yY2UgPSBmYWxzZSwgdmVyaWZpY2F0aW9uID0gZmFsc2UpIHtcbiAgICBpZiAoIWZvcmNlICYmIGZyYW1lICUgdGhpcy5pbnRlcnZhbEZyYW1lcyAhPT0gMCkgcmV0dXJuO1xuICAgIGlmICh0aGlzLnBlbmRpbmcpIHtcbiAgICAgIGlmICghZm9yY2UpIHtcbiAgICAgICAgdGhpcy50aW1pbmdzLmNvYWxlc2NlZEF1dG9tYXRpY1NhbXBsZXMrKztcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYXdhaXQgdGhpcy5wZW5kaW5nOyAvLyBuZXZlciByZXR1cm4gYW4gb2xkIHNuYXBzaG90IGZvciBhbiBleGFjdC1zdGVwIGFzc2F5XG4gICAgfVxuICAgIGlmICh0aGlzLndvcmtlckZhaWx1cmUpIHRocm93IHRoaXMud29ya2VyRmFpbHVyZTtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5jYXB0dXJlKGZyYW1lLCBzdGVwLCByZXN0LCB2ZXJpZmljYXRpb24pO1xuICAgIHRoaXMucGVuZGluZyA9IHByb21pc2U7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb21pc2U7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmICh0aGlzLnBlbmRpbmcgPT09IHByb21pc2UpIHRoaXMucGVuZGluZyA9IG51bGw7XG4gICAgfVxuICB9XG4gIHByaXZhdGUgYXN5bmMgY2FwdHVyZShmcmFtZTogbnVtYmVyLCBzdGVwOiBudW1iZXIsIHJlc3Q6IG51bWJlciwgdmVyaWZpY2F0aW9uID0gZmFsc2UpIHtcbiAgICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIGNvbnN0IGVuY29kZXIgPSB0aGlzLmRldmljZS5jcmVhdGVDb21tYW5kRW5jb2RlcigpO1xuICAgIGVuY29kZXIuY29weUJ1ZmZlclRvQnVmZmVyKHRoaXMuYWN0aW5CdWZmZXIsIDAsIHRoaXMuYWN0aW5TdGFnaW5nLCAwLCB0aGlzLmFjdGluU3RhZ2luZy5zaXplKTtcbiAgICBlbmNvZGVyLmNvcHlCdWZmZXJUb0J1ZmZlcih0aGlzLmNvdW50ZXJCdWZmZXIsIDAsIHRoaXMuY291bnRlclN0YWdpbmcsIDAsIHRoaXMuY291bnRlclN0YWdpbmcuc2l6ZSk7XG4gICAgZW5jb2Rlci5jb3B5QnVmZmVyVG9CdWZmZXIodGhpcy5tZW1icmFuZUJ1ZmZlciwgMCwgdGhpcy5tZW1icmFuZVN0YWdpbmcsIDAsIHRoaXMubWVtYnJhbmVTdGFnaW5nLnNpemUpO1xuICAgIHRoaXMuZGV2aWNlLnF1ZXVlLnN1Ym1pdChbZW5jb2Rlci5maW5pc2goKV0pO1xuICAgIGNvbnN0IHN0YWdlcyA9IFt0aGlzLmFjdGluU3RhZ2luZywgdGhpcy5tZW1icmFuZVN0YWdpbmcsIHRoaXMuY291bnRlclN0YWdpbmddO1xuICAgIGxldCBjb3BpZXM6IEFycmF5QnVmZmVyW107XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IG1hcHBlZCA9IGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChzdGFnZXMubWFwKChidWZmZXIpID0+IGJ1ZmZlci5tYXBBc3luYyhHUFVNYXBNb2RlLlJFQUQpKSk7XG4gICAgICBjb25zdCBmYWlsZWQgPSBtYXBwZWQuZmluZCgocmVzdWx0KSA9PiByZXN1bHQuc3RhdHVzID09PSBcInJlamVjdGVkXCIpO1xuICAgICAgaWYgKGZhaWxlZD8uc3RhdHVzID09PSBcInJlamVjdGVkXCIpIHRocm93IGZhaWxlZC5yZWFzb247XG4gICAgICBjb3BpZXMgPSBzdGFnZXMubWFwKChidWZmZXIpID0+IGJ1ZmZlci5nZXRNYXBwZWRSYW5nZSgpLnNsaWNlKDApKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgZm9yIChjb25zdCBidWZmZXIgb2Ygc3RhZ2VzKSBpZiAoYnVmZmVyLm1hcFN0YXRlID09PSBcIm1hcHBlZFwiKSBidWZmZXIudW5tYXAoKTtcbiAgICB9XG4gICAgdGhpcy50aW1pbmdzLnJlYWRiYWNrTXMgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0O1xuICAgIGNvbnN0IHdvcmtlclN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KCksXG4gICAgICBpZCA9ICsrdGhpcy5uZXh0SWQ7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgbmV3IFByb21pc2U8eyBzdGF0czogQWN0aW5TdGF0czsgYW5hbHlzaXNNczogbnVtYmVyIH0+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuam9iID0geyBpZCwgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiYW5hbHl6ZVwiLCBpZCwgYWN0aW46IGNvcGllc1swXSwgbWVtYnJhbmU6IGNvcGllc1sxXSwgY291bnRlcnM6IGNvcGllc1syXSwgZnJhbWUsIHN0ZXAsIHJlc3QsIHZlcmlmaWNhdGlvbiB9LCBjb3BpZXMpO1xuICAgIH0pO1xuICAgIHRoaXMudGltaW5ncy53b3JrZXJSb3VuZFRyaXBNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gd29ya2VyU3RhcnQ7XG4gICAgdGhpcy50aW1pbmdzLmFuYWx5c2lzTXMgPSByZXN1bHQuYW5hbHlzaXNNcztcbiAgICB0aGlzLnRpbWluZ3MudG90YWxNcyA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnQ7XG4gICAgY29uc3QgcyA9IHJlc3VsdC5zdGF0cztcbiAgICB0aGlzLmhpc3RvcnkucHVzaChzKTtcbiAgICBpZiAodGhpcy5oaXN0b3J5Lmxlbmd0aCA+IDEwMjQpIHRoaXMuaGlzdG9yeS5zaGlmdCgpO1xuICAgIHRoaXMuc2hvdyhzKTtcbiAgICB0aGlzLm9uU2FtcGxlPy4ocyk7XG4gICAgaWYgKHRoaXMucG9zdFRvU2VydmVyKVxuICAgICAgZmV0Y2goXCIvX190ZWxlbWV0cnlcIiwgeyBtZXRob2Q6IFwiUE9TVFwiLCBoZWFkZXJzOiB7IFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiIH0sIGJvZHk6IEpTT04uc3RyaW5naWZ5KHMpIH0pLnRoZW4oXG4gICAgICAgIChyKSA9PiAodGhpcy5wb3N0VG9TZXJ2ZXIgPSByLm9rKSxcbiAgICAgICAgKCkgPT4gKHRoaXMucG9zdFRvU2VydmVyID0gZmFsc2UpXG4gICAgICApO1xuICB9XG4gIHByaXZhdGUgc2hvdyhzOiBBY3RpblN0YXRzKSB7XG4gICAgY29uc3QgYyA9IHMuY2VsbCxcbiAgICAgIHIgPSBzLnBlclN0ZXA7XG4gICAgdGhpcy5zdW1tYXJ5LnRleHRDb250ZW50ID0gYENoZWNrZWQgc3RlcCAke3Muc3RlcH0gwrcgbWFzcyBlcnJvciAke3MuYWN0aW5CYWxhbmNlRXJyb3J9IMK3IEYgaW5zaWRlICR7cy5pbnNpZGVQb2x5bWVyQmVhZHN9LyR7cy5pblBvbHltZXJ9IMK3IGFyZWEgJHtjLmFyZWEudG9GaXhlZCg0KX0gwrcgd29ya2VyICR7dGhpcy50aW1pbmdzLmFuYWx5c2lzTXMudG9GaXhlZCgwKX0gbXNgO1xuICAgIHRoaXMuZGlzcGxheS50ZXh0Q29udGVudCA9IFtcbiAgICAgIGBmaWxhbWVudHMgJHtzLmZpbGFtZW50c30gKGJyYW5jaGVzICR7cy5icmFuY2hlc30pIMK3IHBvbHltZXIgJHsoKDEwMCAqIHMuaW5Qb2x5bWVyKSAvIHMuYWN0aW5Db3VudCkudG9GaXhlZCgxKX0lYCxcbiAgICAgIGBsZW5ndGggbWVhbiAke3MubWVhbkxlbmd0aC50b0ZpeGVkKDEpfSBtZWRpYW4gJHtzLm1lZGlhbkxlbmd0aH0gcDkwICR7cy5wOTBMZW5ndGh9IG1heCAke3MubWF4TGVuZ3RofWAsXG4gICAgICBgcG9seW1lciBhZ2UgbWVhbiAke3MubWVhblBvbHltZXJBZ2UudG9GaXhlZCgwKX0gbWF4ICR7cy5tYXhQb2x5bWVyQWdlLnRvRml4ZWQoMCl9IGZpeGVkIHN0ZXBzYCxcbiAgICAgIGBoaXN0IFsyfDMtNHw1LTh8OS0xNnwxNy0zMnwzMy02NHw2NStdICR7cy5oaXN0b2dyYW0uam9pbihcIiBcIil9YCxcbiAgICAgIGBib25kL3Jlc3QgJHtzLm1lZGlhbkJvbmRMZW5ndGgudG9GaXhlZCgyKX0gwrcgYmVuZCAke3MubWVkaWFuQmVuZEFuZ2xlLnRvRml4ZWQoMSl9wrAgwrcgYnJva2VuICR7cy5icm9rZW5MaW5rc30gwrcgY3ljbGVzICR7cy5jeWNsZXN9YCxcbiAgICAgIGBldmVudHMvc3RlcCAke09iamVjdC5lbnRyaWVzKHIpXG4gICAgICAgIC5tYXAoKFtrLCB2XSkgPT4gYCR7a306JHt2LnRvRml4ZWQoMyl9YClcbiAgICAgICAgLmpvaW4oXCIgXCIpfWAsXG4gICAgICBgeCBib3VuZHMgJHtjLmxlZnQudG9GaXhlZCgxKX3igJMke2MucmlnaHQudG9GaXhlZCgxKX0gwrcgbWF0ZXJpYWwgbWFya2VycyAke2MucmVhclgudG9GaXhlZCgxKX0vJHtjLmZyb250WC50b0ZpeGVkKDEpfSDCtyBjZW50cm9pZCAke2MuY2VudHJvaWRYLnRvRml4ZWQoMSl9LCR7Yy5jZW50cm9pZFkudG9GaXhlZCgxKX1gLFxuICAgICAgYGxlbmd0aCAke2MubGVuZ3RoLnRvRml4ZWQoMSl9IMK3IGFyZWEgJHtjLmFyZWEudG9GaXhlZCg2KX0gwrcgc3BhY2luZyBmcm9udC9yZWFyICR7Yy5mcm9udFNwYWNpbmcudG9GaXhlZCgyKX0vJHtjLnJlYXJTcGFjaW5nLnRvRml4ZWQoMil9YCxcbiAgICAgIHRoaXMud2VsbE1peGVkXG4gICAgICAgID8gYEcgcG9vbCAke3MuZ0FjdGluQW1vdW50fSAoJHtzLmdBY3RpbkNvbmNlbnRyYXRpb24udG9GaXhlZCgzKX0vcHjCsikgwrcgY3Jvc3NpbmcgYm9uZHMgJHtzLmNyb3NzaW5nRmlsYW1lbnRCb25kc31gXG4gICAgICAgIDogYGluc2lkZTogJHtzLmluc2lkZVBvbHltZXJCZWFkc30gRiArICR7cy5pbnNpZGVNb25vbWVyQmVhZHN9IEcgYmVhZHNgLFxuICAgICAgYGxlZ2FjeSBtYXJrZXIteCBoYWxmIHBvbHltZXIgJHtzLnBvc3RlcmlvclBvbHltZXJCZWFkc30gwrcgcmVhZGJhY2sgJHt0aGlzLnRpbWluZ3MucmVhZGJhY2tNcy50b0ZpeGVkKDEpfSBtcyDCtyB3b3JrZXIgcm91bmQgdHJpcCAke3RoaXMudGltaW5ncy53b3JrZXJSb3VuZFRyaXBNcy50b0ZpeGVkKDEpfSBtc2AsXG4gICAgXS5qb2luKFwiXFxuXCIpO1xuICB9XG4gIHNuYXBzaG90KGZyYW1lOiBudW1iZXIsIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICBjb25zdCBldmVyeSA9IE51bWJlcihuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwic25hcHNob3RFdmVyeVwiKSk7XG4gICAgaWYgKCFldmVyeSB8fCBmcmFtZSAlIGV2ZXJ5ICE9PSAwKSByZXR1cm47XG4gICAgY2FudmFzLnRvQmxvYigoYmxvYikgPT4gYmxvYiAmJiBmZXRjaChgL19fc25hcHNob3Q/bmFtZT0ke2VuY29kZVVSSUNvbXBvbmVudChgJHt0aGlzLnJ1bn0tJHtmcmFtZX1gKX1gLCB7IG1ldGhvZDogXCJQT1NUXCIsIGJvZHk6IGJsb2IgfSkpO1xuICB9XG59XG4iLCJcbmZ1bmN0aW9uIHRocm93RGV0ZWN0aW9uRXJyb3IoZXJyb3I6IHN0cmluZyk6IG5ldmVyIHtcbiAgY29uc3Qgbm90aWNlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcjxIVE1MRWxlbWVudD4oXCIud2ViZ3B1LW5vdC1zdXBwb3J0ZWRcIik7XG4gIGlmIChub3RpY2UpIG5vdGljZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCBpbml0aWFsaXplIFdlYkdQVTogXCIgKyBlcnJvcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXF1ZXN0RGV2aWNlKFxuICBvcHRpb25zOiBHUFVSZXF1ZXN0QWRhcHRlck9wdGlvbnMgPSB7XG4gICAgcG93ZXJQcmVmZXJlbmNlOiBcImhpZ2gtcGVyZm9ybWFuY2VcIixcbiAgfSxcbiAgcmVxdWlyZWRGZWF0dXJlczogR1BVRmVhdHVyZU5hbWVbXSA9IFtdLFxuICByZXF1aXJlZExpbWl0czogUmVjb3JkPHN0cmluZywgdW5kZWZpbmVkIHwgbnVtYmVyPiA9IHtcbiAgICBtYXhTdG9yYWdlVGV4dHVyZXNQZXJTaGFkZXJTdGFnZTogOCxcbiAgfVxuKTogUHJvbWlzZTxHUFVEZXZpY2U+IHtcbiAgaWYgKCFuYXZpZ2F0b3IuZ3B1KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiV2ViR1BVIE5PVCBTdXBwb3J0ZWRcIik7XG5cbiAgY29uc3QgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIob3B0aW9ucyk7XG4gIGlmICghYWRhcHRlcikgdGhyb3dEZXRlY3Rpb25FcnJvcihcIk5vIEdQVSBhZGFwdGVyIGZvdW5kXCIpO1xuXG4gIGNvbnN0IGNhblRpbWVzdGFtcCA9IGFkYXB0ZXIuZmVhdHVyZXMuaGFzKFwidGltZXN0YW1wLXF1ZXJ5XCIpO1xuICBjb25zdCBmZWF0dXJlcyA9IFsuLi5yZXF1aXJlZEZlYXR1cmVzXTtcblxuICBpZiAoY2FuVGltZXN0YW1wKSB7XG4gICAgZmVhdHVyZXMucHVzaChcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgfVxuXG4gIC8vIEluc3RlYWQgb2YgcGFzc2luZyBhIHJlY29yZCB0aGF0IG1pZ2h0IGhhdmUgdW5kZWZpbmVkIHZhbHVlcywgZmlsdGVyIHRoZW0gb3V0OlxuICBjb25zdCBsaW1pdHMgPSBPYmplY3QuZnJvbUVudHJpZXMoT2JqZWN0LmVudHJpZXMocmVxdWlyZWRMaW1pdHMpLmZpbHRlcigoW2tleSwgdmFsdWVdKSA9PiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSkgYXMgUmVjb3JkPHN0cmluZywgbnVtYmVyPjtcblxuICAvLyBUaGVuIHVzZSB0aGUgZmlsdGVyZWQgbGltaXRzIG9iamVjdDpcbiAgcmV0dXJuIGFkYXB0ZXIucmVxdWVzdERldmljZSh7XG4gICAgcmVxdWlyZWRGZWF0dXJlczogZmVhdHVyZXMsXG4gICAgcmVxdWlyZWRMaW1pdHM6IGxpbWl0cyxcbiAgICAuLi4oY2FuVGltZXN0YW1wID8gW1widGltZXN0YW1wLXF1ZXJ5XCJdIDogW10pLFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmZpZ3VyZUNhbnZhcyhcbiAgZGV2aWNlOiBHUFVEZXZpY2UsXG4gIGlkOiBzdHJpbmcsXG4gIHNpemUgPSB7IHdpZHRoOiB3aW5kb3cuaW5uZXJXaWR0aCwgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQgfVxuKToge1xuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50O1xuICBjb250ZXh0OiBHUFVDYW52YXNDb250ZXh0O1xuICBmb3JtYXQ6IEdQVVRleHR1cmVGb3JtYXQ7XG4gIHNpemU6IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfTtcbn0ge1xuICBjb25zdCBjYW52YXMgPSBPYmplY3QuYXNzaWduKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksIHNpemUpO1xuICBjYW52YXMuaWQgPSBpZDtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gIGNvbnN0IGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dChcIndlYmdwdVwiKTtcbiAgaWYgKCFjb250ZXh0KSB0aHJvd0RldGVjdGlvbkVycm9yKFwiQ2FudmFzIGRvZXMgbm90IHN1cHBvcnQgV2ViR1BVXCIpO1xuXG4gIGNvbnN0IGZvcm1hdCA9IG5hdmlnYXRvci5ncHUuZ2V0UHJlZmVycmVkQ2FudmFzRm9ybWF0KCk7XG4gIGNvbnRleHQuY29uZmlndXJlKHtcbiAgICBkZXZpY2U6IGRldmljZSxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICB1c2FnZTogR1BVVGV4dHVyZVVzYWdlLlJFTkRFUl9BVFRBQ0hNRU5ULFxuICAgIGFscGhhTW9kZTogXCJwcmVtdWx0aXBsaWVkXCIsXG4gIH0pO1xuXG4gIHJldHVybiB7IGNhbnZhczogY2FudmFzLCBjb250ZXh0OiBjb250ZXh0LCBmb3JtYXQ6IGZvcm1hdCwgc2l6ZTogc2l6ZSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2hhZGVyKGRldmljZTogR1BVRGV2aWNlLCBjb2RlOiBzdHJpbmcsIGluY2x1ZGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IFByb21pc2U8R1BVU2hhZGVyTW9kdWxlPiB7XG4gIC8vIFByb2Nlc3MgdGhlIGNvZGUgd2l0aCBpbXBvcnRzXG4gIGNvbnN0IHByb2Nlc3NlZENvZGUgPSBwcmVwZW5kSW5jbHVkZXMoY29kZSwgaW5jbHVkZXMpO1xuXG4gIGNvbnN0IG1vZHVsZSA9IGRldmljZS5jcmVhdGVTaGFkZXJNb2R1bGUoeyBjb2RlOiBwcm9jZXNzZWRDb2RlIH0pO1xuICBjb25zdCBpbmZvID0gYXdhaXQgbW9kdWxlLmdldENvbXBpbGF0aW9uSW5mbygpO1xuICBpZiAoaW5mby5tZXNzYWdlcy5sZW5ndGggPiAwKSB7XG4gICAgZm9yIChsZXQgbWVzc2FnZSBvZiBpbmZvLm1lc3NhZ2VzKSB7XG4gICAgICBjb25zb2xlLndhcm4oYCR7bWVzc2FnZS5tZXNzYWdlfSBcbiAgYXQgbGluZSAke21lc3NhZ2UubGluZU51bX1gKTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgY29tcGlsZSBzaGFkZXJgKTtcbiAgfVxuICByZXR1cm4gbW9kdWxlO1xufVxuXG4vKipcbiAqIFByb2Nlc3MgaW1wb3J0IHN0YXRlbWVudHMgaW4gc2hhZGVyIGNvZGUgdG8gaW5jbHVkZSB0aGUgY29udGVudCBvZiByZWZlcmVuY2VkIG1vZHVsZXNcbiAqIEBwYXJhbSBjb2RlIC0gVGhlIHNoYWRlciBjb2RlIGNvbnRhaW5pbmcgaW1wb3J0IHN0YXRlbWVudHNcbiAqIEBwYXJhbSBpbmNsdWRlcyAtIE9wdGlvbmFsIG1hcHBpbmcgb2YgbW9kdWxlIG5hbWVzIHRvIHRoZWlyIGNvbnRlbnRcbiAqIEByZXR1cm5zIFRoZSBwcm9jZXNzZWQgc2hhZGVyIGNvZGUgd2l0aCBpbXBvcnRzIHJlc29sdmVkXG4gKi9cbmZ1bmN0aW9uIHByZXBlbmRJbmNsdWRlcyhjb2RlOiBzdHJpbmcsIGluY2x1ZGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPik6IHN0cmluZyB7XG4gIC8vIEV4dHJhY3QgaW1wb3J0IHN0YXRlbWVudHNcbiAgY29uc3QgaW1wb3J0UmVnZXggPSAvXiNpbXBvcnRcXHMrKFthLXpBLVowLTlfXSspOjooW2EtekEtWjAtOV9dKykvZ207XG4gIGNvbnN0IGltcG9ydHMgPSBbLi4uY29kZS5tYXRjaEFsbChpbXBvcnRSZWdleCldO1xuXG4gIC8vIEJ1aWxkIGEgbWFwIG9mIGltcG9ydHMgdG8gdGhlaXIgY29udGVudFxuICBjb25zdCBpbmNsdWRlc1RvQWRkOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cbiAgLy8gUHJvY2VzcyBlYWNoIGltcG9ydFxuICBmb3IgKGNvbnN0IFtmdWxsTWF0Y2gsIG5hbWVzcGFjZSwgbW9kdWxlTmFtZV0gb2YgaW1wb3J0cykge1xuICAgIGlmIChuYW1lc3BhY2UgPT09IFwiaW5jbHVkZXNcIiAmJiBpbmNsdWRlcyAmJiBtb2R1bGVOYW1lIGluIGluY2x1ZGVzKSB7XG4gICAgICBpbmNsdWRlc1RvQWRkW2Z1bGxNYXRjaF0gPSBpbmNsdWRlc1ttb2R1bGVOYW1lXTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS53YXJuKGBDb3VsZCBub3QgcmVzb2x2ZSBpbXBvcnQ6ICR7ZnVsbE1hdGNofWApO1xuICAgIH1cbiAgfVxuXG4gIC8vIFJlcGxhY2UgaW1wb3J0IHN0YXRlbWVudHMgd2l0aCB0aGVpciBjb250ZW50XG4gIGxldCBwcm9jZXNzZWRDb2RlID0gY29kZTtcbiAgZm9yIChjb25zdCBbaW1wb3J0U3RhdGVtZW50LCBjb250ZW50XSBvZiBPYmplY3QuZW50cmllcyhpbmNsdWRlc1RvQWRkKSkge1xuICAgIC8vIFJlcGxhY2UgdGhlIGltcG9ydCBzdGF0ZW1lbnQgd2l0aCB0aGUgY29udGVudFxuICAgIHByb2Nlc3NlZENvZGUgPSBwcm9jZXNzZWRDb2RlLnJlcGxhY2UoaW1wb3J0U3RhdGVtZW50LCBjb250ZW50KTtcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzZWRDb2RlO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlUGVyZm9ybWFuY2VRdWVyaWVzKGRldmljZTogR1BVRGV2aWNlKTogUHJvbWlzZTx7XG4gIHF1ZXJ5U2V0OiBHUFVRdWVyeVNldDtcbiAgcmVzb2x2ZUJ1ZmZlcjogR1BVQnVmZmVyO1xuICByZXN1bHRCdWZmZXI6IEdQVUJ1ZmZlcjtcbn0+IHtcbiAgY29uc3QgY2FuVGltZXN0YW1wID0gZGV2aWNlLmZlYXR1cmVzLmhhcyhcInRpbWVzdGFtcC1xdWVyeVwiKTtcbiAgLy8gaWYgKCFjYW5UaW1lc3RhbXApIHtcbiAgLy8gICBjb25zb2xlLndhcm4oXCJUaW1lc3RhbXAgcXVlcmllcyBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGlzIGRldmljZS5cIik7XG4gIC8vICAgcmV0dXJuIHt9O1xuICAvLyB9XG4gIGNvbnN0IHF1ZXJ5U2V0ID0gZGV2aWNlLmNyZWF0ZVF1ZXJ5U2V0KHtcbiAgICB0eXBlOiBcInRpbWVzdGFtcFwiLFxuICAgIGNvdW50OiAyLFxuICB9KTtcblxuICBjb25zdCByZXNvbHZlQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgc2l6ZTogcXVlcnlTZXQuY291bnQgKiA4LFxuICAgIHVzYWdlOiBHUFVCdWZmZXJVc2FnZS5RVUVSWV9SRVNPTFZFIHwgR1BVQnVmZmVyVXNhZ2UuQ09QWV9TUkMsXG4gIH0pO1xuXG4gIGNvbnN0IHJlc3VsdEJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIHNpemU6IHJlc29sdmVCdWZmZXIuc2l6ZSxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuQ09QWV9EU1QgfCBHUFVCdWZmZXJVc2FnZS5NQVBfUkVBRCxcbiAgfSk7XG5cbiAgcmV0dXJuIHsgcXVlcnlTZXQsIHJlc29sdmVCdWZmZXIsIHJlc3VsdEJ1ZmZlciB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBJbnRlcmFjdGlvbnMoXG4gIGRldmljZTogR1BVRGV2aWNlLFxuICBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgT2Zmc2NyZWVuQ2FudmFzLFxuICB0ZXh0dXJlOiB7IHdpZHRoOiBudW1iZXI7IGhlaWdodDogbnVtYmVyIH0sXG4gIHNpemU6IG51bWJlciA9IDEwXG4pOiB7XG4gIGludGVyYWN0aW9uczoge1xuICAgIGRhdGE6IEZsb2F0MzJBcnJheTtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgfTtcbiAgY29udHJvbHM6IHtcbiAgICBkYXRhOiBBcnJheUJ1ZmZlcjtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgfTtcbiAgdHlwZTogR1BVQnVmZmVyQmluZGluZ1R5cGU7XG59IHtcbiAgbGV0IHVuaWZvcm1CdWZmZXJEYXRhID0gbmV3IEZsb2F0MzJBcnJheSg0KTtcbiAgbGV0IGNvbnRyb2xzQnVmZmVyRGF0YSA9IG5ldyBBcnJheUJ1ZmZlcigzMzYpO1xuXG4gIHZhciBzaWduID0gMTtcblxuICBsZXQgcG9zaXRpb24gPSB7IHg6IDAsIHk6IDAgfTtcbiAgbGV0IHZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH07XG5cbiAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtwb3NpdGlvbi54LCBwb3NpdGlvbi55XSk7XG4gIGlmIChjYW52YXMgaW5zdGFuY2VvZiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICAgIC8vIGRpc2FibGUgY29udGV4dCBtZW51XG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvLyBtb3ZlIGV2ZW50c1xuICAgIFtcIm1vdXNlbW92ZVwiLCBcInRvdWNobW92ZVwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICBsZXQgY2xpZW50WCA9IDA7XG4gICAgICAgICAgbGV0IGNsaWVudFkgPSAwO1xuXG4gICAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTW91c2VFdmVudCkge1xuICAgICAgICAgICAgY2xpZW50WCA9IGV2ZW50LmNsaWVudFg7XG4gICAgICAgICAgICBjbGllbnRZID0gZXZlbnQuY2xpZW50WTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50IGluc3RhbmNlb2YgVG91Y2hFdmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LnRvdWNoZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG4gICAgICAgICAgICBjbGllbnRYID0gZXZlbnQudG91Y2hlc1swXS5jbGllbnRYO1xuICAgICAgICAgICAgY2xpZW50WSA9IGV2ZW50LnRvdWNoZXNbMF0uY2xpZW50WTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBwb3NpdGlvbi54ID0gY2xpZW50WCAtIHJlY3QubGVmdDtcbiAgICAgICAgICBwb3NpdGlvbi55ID0gY2xpZW50WSAtIHJlY3QudG9wO1xuXG4gICAgICAgICAgLy8gU2NhbGUgZnJvbSBDU1MgcGl4ZWxzIHRvIHRleHR1cmUgY29vcmRpbmF0ZXNcbiAgICAgICAgICBjb25zdCB4ID0gTWF0aC5mbG9vcigocG9zaXRpb24ueCAvIHJlY3Qud2lkdGgpICogdGV4dHVyZS53aWR0aCk7XG4gICAgICAgICAgY29uc3QgeSA9IE1hdGguZmxvb3IoKHBvc2l0aW9uLnkgLyByZWN0LmhlaWdodCkgKiB0ZXh0dXJlLmhlaWdodCk7XG5cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3gsIHldKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG5cbiAgICAvLyB6b29tIGV2ZW50cyBUT0RPKEBnc3plcCkgYWRkIHBpbmNoIGFuZCBzY3JvbGwgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJ3aGVlbFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgc3dpdGNoICh0cnVlKSB7XG4gICAgICAgICAgICBjYXNlIGV2ZW50IGluc3RhbmNlb2YgV2hlZWxFdmVudDpcbiAgICAgICAgICAgICAgdmVsb2NpdHkueCA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgdmVsb2NpdHkueSA9IGV2ZW50LmRlbHRhWTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2l6ZSArPSB2ZWxvY2l0eS55O1xuICAgICAgICAgIHVuaWZvcm1CdWZmZXJEYXRhLnNldChbc2l6ZV0sIDIpO1xuICAgICAgICB9LFxuICAgICAgICB7IHBhc3NpdmU6IHRydWUgfVxuICAgICAgKTtcbiAgICB9KTtcblxuICAgIC8vIGNsaWNrIGV2ZW50cyBUT0RPKEBnc3plcCkgaW1wbGVtZW50IHJpZ2h0IGNsaWNrIGVxdWl2YWxlbnQgZm9yIHRvdWNoIGRldmljZXNcbiAgICBbXCJtb3VzZWRvd25cIiwgXCJ0b3VjaHN0YXJ0XCJdLmZvckVhY2goKHR5cGUpID0+IHtcbiAgICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgICB0eXBlLFxuICAgICAgICAoZXZlbnQpID0+IHtcbiAgICAgICAgICBzd2l0Y2ggKHRydWUpIHtcbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBNb3VzZUV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gMSAtIGV2ZW50LmJ1dHRvbjtcbiAgICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICAgIGNhc2UgZXZlbnQgaW5zdGFuY2VvZiBUb3VjaEV2ZW50OlxuICAgICAgICAgICAgICBzaWduID0gZXZlbnQudG91Y2hlcy5sZW5ndGggPiAxID8gLTEgOiAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICB1bmlmb3JtQnVmZmVyRGF0YS5zZXQoW3NpZ24gKiBzaXplXSwgMik7XG4gICAgICAgIH0sXG4gICAgICAgIHsgcGFzc2l2ZTogdHJ1ZSB9XG4gICAgICApO1xuICAgIH0pO1xuICAgIFtcIm1vdXNldXBcIiwgXCJ0b3VjaGVuZFwiXS5mb3JFYWNoKCh0eXBlKSA9PiB7XG4gICAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgdHlwZSxcbiAgICAgICAgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgdW5pZm9ybUJ1ZmZlckRhdGEuc2V0KFtOYU5dLCAyKTtcbiAgICAgICAgfSxcbiAgICAgICAgeyBwYXNzaXZlOiB0cnVlIH1cbiAgICAgICk7XG4gICAgfSk7XG4gIH1cbiAgY29uc3QgdW5pZm9ybUJ1ZmZlciA9IGRldmljZS5jcmVhdGVCdWZmZXIoe1xuICAgIGxhYmVsOiBcIkludGVyYWN0aW9uIEJ1ZmZlclwiLFxuICAgIHNpemU6IHVuaWZvcm1CdWZmZXJEYXRhLmJ5dGVMZW5ndGgsXG4gICAgdXNhZ2U6IEdQVUJ1ZmZlclVzYWdlLlVOSUZPUk0gfCBHUFVCdWZmZXJVc2FnZS5DT1BZX0RTVCxcbiAgfSk7XG5cbiAgY29uc3QgY29udHJvbHNCdWZmZXIgPSBkZXZpY2UuY3JlYXRlQnVmZmVyKHtcbiAgICBsYWJlbDogXCJDb250cm9scyBCdWZmZXJcIixcbiAgICBzaXplOiBjb250cm9sc0J1ZmZlckRhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICByZXR1cm4ge1xuICAgIGludGVyYWN0aW9uczogeyBkYXRhOiB1bmlmb3JtQnVmZmVyRGF0YSwgYnVmZmVyOiB1bmlmb3JtQnVmZmVyIH0sXG4gICAgY29udHJvbHM6IHsgZGF0YTogY29udHJvbHNCdWZmZXJEYXRhLCBidWZmZXI6IGNvbnRyb2xzQnVmZmVyIH0sXG4gICAgdHlwZTogXCJ1bmlmb3JtXCIsXG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFRleHR1cmVzKFxuICBkZXZpY2U6IEdQVURldmljZSxcbiAgYmluZGluZ3M6IG51bWJlcltdLFxuICBkYXRhOiB7IFtrZXk6IG51bWJlcl06IG51bWJlcltdW11bXSB9LFxuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9LFxuICBmb3JtYXQ/OiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmVGb3JtYXQgfVxuKToge1xuICBjYW52YXM6IHtcbiAgICBidWZmZXI6IEdQVUJ1ZmZlcjtcbiAgICBkYXRhOiBVaW50MzJBcnJheTtcbiAgICB0eXBlOiBHUFVCdWZmZXJCaW5kaW5nVHlwZTtcbiAgfTtcbiAgdGV4dHVyZXM6IHsgW2tleTogbnVtYmVyXTogR1BVVGV4dHVyZSB9O1xuICBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9O1xuICBzaXplOiB7XG4gICAgZGVwdGhPckFycmF5TGF5ZXJzPzogeyBba2V5OiBudW1iZXJdOiBudW1iZXIgfTtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICB9O1xufSB7XG4gIGNvbnN0IHRleHR1cmVzOiB7IFtrZXk6IG51bWJlcl06IEdQVVRleHR1cmUgfSA9IHt9O1xuICBjb25zdCBiaW5kaW5nTGF5b3V0OiB7IFtrZXk6IG51bWJlcl06IEdQVVN0b3JhZ2VUZXh0dXJlQmluZGluZ0xheW91dCB9ID0ge307XG4gIGNvbnN0IGRlcHRoT3JBcnJheUxheWVycyA9IHNpemUuZGVwdGhPckFycmF5TGF5ZXJzIHx8IHt9O1xuICBjb25zdCBERUZBVUxUX0ZPUk1BVCA9IFwicjMyZmxvYXRcIjtcblxuICBiaW5kaW5ncy5mb3JFYWNoKChrZXkpID0+IHtcbiAgICB0ZXh0dXJlc1trZXldID0gZGV2aWNlLmNyZWF0ZVRleHR1cmUoe1xuICAgICAgdXNhZ2U6IEdQVVRleHR1cmVVc2FnZS5TVE9SQUdFX0JJTkRJTkcgfCBHUFVUZXh0dXJlVXNhZ2UuQ09QWV9EU1QsXG4gICAgICBmb3JtYXQ6IGZvcm1hdCAmJiBrZXkgaW4gZm9ybWF0ID8gZm9ybWF0W2tleV0gOiBERUZBVUxUX0ZPUk1BVCxcbiAgICAgIHNpemU6IHtcbiAgICAgICAgd2lkdGg6IHNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogc2l6ZS5oZWlnaHQsXG4gICAgICAgIGRlcHRoT3JBcnJheUxheWVyczoga2V5IGluIGRlcHRoT3JBcnJheUxheWVycyA/IGRlcHRoT3JBcnJheUxheWVyc1trZXldIDogMSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xuXG4gIE9iamVjdC5rZXlzKHRleHR1cmVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICBjb25zdCBsYXllcnMgPSBrZXkgaW4gZGVwdGhPckFycmF5TGF5ZXJzID8gZGVwdGhPckFycmF5TGF5ZXJzW2tleV0gOiAxO1xuXG4gICAgYmluZGluZ0xheW91dFtrZXldID0ge1xuICAgICAgZm9ybWF0OiBmb3JtYXQgJiYga2V5IGluIGZvcm1hdCA/IGZvcm1hdFtrZXldIDogREVGQVVMVF9GT1JNQVQsXG4gICAgICBhY2Nlc3M6IFwicmVhZC13cml0ZVwiLFxuICAgICAgdmlld0RpbWVuc2lvbjogbGF5ZXJzID4gMSA/IFwiMmQtYXJyYXlcIiA6IFwiMmRcIixcbiAgICB9O1xuXG4gICAgY29uc3QgYXJyYXkgPSBrZXkgaW4gZGF0YSA/IG5ldyBGbG9hdDMyQXJyYXkoZmxhdHRlbihkYXRhW2tleV0pKSA6IG5ldyBGbG9hdDMyQXJyYXkoc2l6ZS53aWR0aCAqIHNpemUuaGVpZ2h0ICogbGF5ZXJzKTtcblxuICAgIGNvbnN0IGNoYW5uZWxzID0gY2hhbm5lbENvdW50KGJpbmRpbmdMYXlvdXRba2V5XS5mb3JtYXQpO1xuICAgIGRldmljZS5xdWV1ZS53cml0ZVRleHR1cmUoXG4gICAgICB7IHRleHR1cmU6IHRleHR1cmVzW2tleV0gfSxcbiAgICAgIC8qZGF0YT0qLyBhcnJheSxcbiAgICAgIC8qZGF0YUxheW91dD0qLyB7XG4gICAgICAgIG9mZnNldDogMCxcbiAgICAgICAgYnl0ZXNQZXJSb3c6IHNpemUud2lkdGggKiBhcnJheS5CWVRFU19QRVJfRUxFTUVOVCAqIGNoYW5uZWxzLFxuICAgICAgICByb3dzUGVySW1hZ2U6IHNpemUuaGVpZ2h0LFxuICAgICAgfSxcbiAgICAgIC8qc2l6ZT0qLyB7XG4gICAgICAgIHdpZHRoOiBzaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHNpemUuaGVpZ2h0LFxuICAgICAgICBkZXB0aE9yQXJyYXlMYXllcnM6IGxheWVycyxcbiAgICAgIH1cbiAgICApO1xuICB9KTtcblxuICBsZXQgY2FudmFzRGF0YSA9IG5ldyBVaW50MzJBcnJheShbc2l6ZS53aWR0aCwgc2l6ZS5oZWlnaHQsIDAsIDAsIDAsIDBdKTtcbiAgY29uc3QgY2FudmFzQnVmZmVyID0gZGV2aWNlLmNyZWF0ZUJ1ZmZlcih7XG4gICAgbGFiZWw6IFwiQ2FudmFzIEJ1ZmZlclwiLFxuICAgIHNpemU6IGNhbnZhc0RhdGEuYnl0ZUxlbmd0aCxcbiAgICB1c2FnZTogR1BVQnVmZmVyVXNhZ2UuVU5JRk9STSB8IEdQVUJ1ZmZlclVzYWdlLkNPUFlfRFNULFxuICB9KTtcblxuICBkZXZpY2UucXVldWUud3JpdGVCdWZmZXIoY2FudmFzQnVmZmVyLCAvKm9mZnNldD0qLyAwLCAvKmRhdGE9Ki8gY2FudmFzRGF0YSk7XG5cbiAgcmV0dXJuIHtcbiAgICBjYW52YXM6IHtcbiAgICAgIGJ1ZmZlcjogY2FudmFzQnVmZmVyLFxuICAgICAgZGF0YTogY2FudmFzRGF0YSxcbiAgICAgIHR5cGU6IFwidW5pZm9ybVwiLFxuICAgIH0sXG4gICAgdGV4dHVyZXM6IHRleHR1cmVzLFxuICAgIGJpbmRpbmdMYXlvdXQ6IGJpbmRpbmdMYXlvdXQsXG4gICAgc2l6ZTogc2l6ZSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2hhbm5lbENvdW50KGZvcm1hdDogR1BVVGV4dHVyZUZvcm1hdCk6IG51bWJlciB7XG4gIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyZ2JhXCIpKSB7XG4gICAgcmV0dXJuIDQ7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdiXCIpKSB7XG4gICAgcmV0dXJuIDM7XG4gIH0gZWxzZSBpZiAoZm9ybWF0LmluY2x1ZGVzKFwicmdcIikpIHtcbiAgICByZXR1cm4gMjtcbiAgfSBlbHNlIGlmIChmb3JtYXQuaW5jbHVkZXMoXCJyXCIpKSB7XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBmb3JtYXQ6IFwiICsgZm9ybWF0KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBmbGF0dGVuKG5lc3RlZEFycmF5OiBudW1iZXJbXVtdW10pOiBudW1iZXJbXSB7XG4gIGNvbnN0IGZsYXR0ZW5lZDogbnVtYmVyW10gPSBbXTtcbiAgZm9yIChsZXQgayA9IDA7IGsgPCBuZXN0ZWRBcnJheVswXVswXS5sZW5ndGg7IGsrKykge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbmVzdGVkQXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgbmVzdGVkQXJyYXlbMF0ubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZmxhdHRlbmVkLnB1c2gobmVzdGVkQXJyYXlbaV1bal1ba10pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmbGF0dGVuZWQ7XG59XG5cbmZ1bmN0aW9uIHplcm9zKGhlaWdodDogbnVtYmVyLCB3aWR0aDogbnVtYmVyLCBsYXllcnM6IG51bWJlciA9IDEpOiBudW1iZXJbXVtdW10ge1xuICBjb25zdCB6ZXJvQXJyYXk6IG51bWJlcltdW11bXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICBjb25zdCByb3c6IG51bWJlcltdW10gPSBbXTtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgIGNvbnN0IGxheWVyOiBudW1iZXJbXSA9IFtdO1xuICAgICAgZm9yIChsZXQgayA9IDA7IGsgPCBsYXllcnM7IGsrKykge1xuICAgICAgICBsYXllci5wdXNoKDApO1xuICAgICAgfVxuICAgICAgcm93LnB1c2gobGF5ZXIpO1xuICAgIH1cbiAgICB6ZXJvQXJyYXkucHVzaChyb3cpO1xuICB9XG5cbiAgcmV0dXJuIHplcm9BcnJheTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFJhbmRvbVZhbHVlcyhsZW5ndGg6IG51bWJlciwgcmFuZG9tPzogKCkgPT4gbnVtYmVyKTogVWludDMyQXJyYXkge1xuICAvLyBmYXN0IGNwdS1zaWRlIHJhbmRvbSBudW1iZXIgZ2VuZXJhdGlvblxuXG4gIGNvbnN0IG1heENodW5rTGVuZ3RoID0gNjU1MzYgLyA0O1xuICBjb25zdCByZXN1bHQgPSBuZXcgVWludDMyQXJyYXkoNCAqIGxlbmd0aCk7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgNCAqIGxlbmd0aDsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIGNvbnN0IGNodW5rTGVuZ3RoID0gTWF0aC5taW4obWF4Q2h1bmtMZW5ndGgsIDQgKiBsZW5ndGggLSBpKTtcbiAgICBpZiAocmFuZG9tKSB7XG4gICAgICBmb3IgKGxldCBqID0gaTsgaiA8IE1hdGgubWluKGkgKyBjaHVua0xlbmd0aCwgcmVzdWx0Lmxlbmd0aCk7IGorKykgcmVzdWx0W2pdID0gTWF0aC5mbG9vcihyYW5kb20oKSAqIDQyOTQ5NjcyOTYpO1xuICAgIH0gZWxzZSBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKHJlc3VsdC5zdWJhcnJheShpLCBpICsgY2h1bmtMZW5ndGgpKTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY2xhc3MgUGVyZm9ybWFuY2VNb25pdG9yIHtcbiAgcHJpdmF0ZSBsYXN0VGltZTogbnVtYmVyO1xuICBwcml2YXRlIGZyYW1lQ291bnQ6IG51bWJlcjtcbiAgcHJpdmF0ZSBmcmFtZXNQZXJUaW1lTG9nOiBudW1iZXI7XG4gIHByaXZhdGUgZnBzRGlzcGxheTogSFRNTEVsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IoZnJhbWVzUGVyVGltZUxvZzogbnVtYmVyID0gMzApIHtcbiAgICB0aGlzLmZyYW1lc1BlclRpbWVMb2cgPSBmcmFtZXNQZXJUaW1lTG9nO1xuICAgIHRoaXMuZnBzRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZnBzQ291bnRlclwiKSE7XG4gICAgdGhpcy5sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIHRoaXMuZnJhbWVDb3VudCA9IDA7XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlKHRpbWU6IG51bWJlcikge1xuICAgIGlmICh0aW1lICUgdGhpcy5mcmFtZXNQZXJUaW1lTG9nID09PSAwKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuICAgICAgY29uc3QgdGltZUVsYXBzZWQgPSBjdXJyZW50VGltZSAtIHRoaXMubGFzdFRpbWU7XG5cbiAgICAgIC8vIEZQUyBDYWxjdWxhdGlvblxuICAgICAgY29uc3QgZnBzID0gTWF0aC5yb3VuZCgodGhpcy5mcmFtZUNvdW50ICogMTAwMCkgLyB0aW1lRWxhcHNlZCk7XG4gICAgICB0aGlzLmZwc0Rpc3BsYXkudGV4dENvbnRlbnQgPSBgRlBTOiAke2Zwc31gO1xuXG4gICAgICAvLyBSZXNldCBjb3VudGVyc1xuICAgICAgdGhpcy5mcmFtZUNvdW50ID0gMDtcbiAgICAgIHRoaXMubGFzdFRpbWUgPSBjdXJyZW50VGltZTtcbiAgICB9XG4gICAgdGhpcy5mcmFtZUNvdW50Kys7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==