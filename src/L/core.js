"use strict";
//(function() {

    (function() {

	if (!Element.prototype.matches) {
	  Element.prototype.matches =
	    Element.prototype.msMatchesSelector ||
	    Element.prototype.webkitMatchesSelector;
	}

	if (window.Element && !Element.prototype.closest) {
	    Element.prototype.closest = function(s) {
    	    	var matches = (this.document || this.ownerDocument).querySelectorAll(s),
        	    i,
        	    el = this;
    	    	do {
      		    i = matches.length;
      		    while (--i >= 0 && matches.item(i) !== el) {};
    	    	} while ((i < 0) && (el = el.parentElement));

    	    	return el;
  	    };
	}
    })();

    class BaseUtil {
	static #objectEnough(obj) {
	   return typeof obj == "object" && obj instanceof Object && !(obj instanceof Array) && !(obj instanceof Date) && !(obj instanceof Lment) && !(obj instanceof LmentArray);
	}

	static ready(fn) {
	    window.addEventListener("load", fn, false);
	}

	static registerComponents(components) {
	    this.ready(function() {
		components.forEach((val) => window.customElements.define(val.tag, val));
	    });
	}

	//Three Curry's Please
	static curry = function(func) {
	    return function curried(...args) {
		if (args.length >= func.length) {
		    return func.apply(this, args);
		}
		else if (!args) {
		    return curried.apply(this, null);
		} 
		else {
		    return function(...args2) {
			return curried.apply(this, args.concat(args2));
		    }
		}
	    }
	}

	static reverseCurry = function(func) {
	    return function curried(...args) {
		if (args.length >= func.length) {
		    return func.apply(this, args.reverse());
		}
		else if (!args) {
		    return curried.apply(this, null);
		}
		else {
		    return function(...args2) {
			return curried.apply(this, args.concat(args2))
		    }
		}
	    }
	}

	//x is the final arg to input after componse
	//Reverse order here (args read right to left)
	static compose = 
		(...fns) => 
	    	    x => 
			fns.reduceRight(
			    (y, f) => 
		    		f(y), x);

	//Args read left to right (easier to use with a lot of function)
	static pipe = 
		(...fns) => 
		    x => 
			fns.reduce((y, f) =>
				     f(y), x);	

	static qa(selector) {
	    return new LmentArray(document.querySelectorAll(selector));
	}

	static q(selector) {
	    return new Lment(document.querySelector(selector));
	}
	
	static get is() {
	    return {
		raw: function(arg) {
		    return arg && arg instanceof HTMLElement;
		},
		htmlCollection: function(arg) {
		    return arg && arg instanceof HTMLCollection;
		},
		lment: function(arg) {
		    return arg && arg instanceof Lment;
		},
		array: function(arg) {
		    return arg && arg instanceof Array;
		},
		nodeList: function(arg) {
		    return arg && arg instanceof NodeList;
		},
		fragment: function(arg) {
		    return arg && arg instanceof DocumentFragment;
		},
		lmentArray: function(arg) {
		    return arg && arg instanceof LmentArray;
		},
		date: function(arg) {
		    return arg && arg instanceof Date;
		},
		fn: function (arg) {
		    return arg && typeof arg === "function" && arg instanceof Function;
		},
		shadow: function (arg) {
		    return arg && arg instanceof ShadowRoot;
		},
	 	event: function (arg) {
		    return arg && arg instanceof Event;
		},
		customEvent: function (arg) {
		    return arg && arg instanceof CustomEvent;
		},
		clr: function (arg) {
		    return BaseUtil.#objectEnough(arg);
		}
	    };
	}

	static deepCopy(target, from) {
	    for (var prop in from) {
		if (this.#objectEnough(from[prop]) && this.#objectEnough(target[prop])) {
		    this.deepCopy(target[prop], from[prop]);
		}
		else {
		    target[prop] = from[prop];
		}    
	    }
	    return target;
	}

	static shallowCopy(target, from) {
	    for (var prop in from) {
		target[prop] = from[prop];
	    }
	    return target;
	}

	static clone(target) {
	    return Object.assign({}, target);
	}

	static ext(target) {
	    let result = this.clone(target ? target : {});
	    if (typeof arguments[arguments.length-1] === "boolean") {
		if (arguments[arguments.length-1]) {
		    //deep copy
		    for (var i = 1; i < arguments.length-1; i++) {
			if (arguments[i]) {
			    result = this.deepCopy(result, arguments[i]);
			}
		    }
		}
		else {
		    //shallow copy
		    for (var i = 1; i < arguments.length-1; i++) {
			result = this.shallowCopy(result, arguments[i]);
		    }
		}
	    }
	    else {
		//shallow copy
		for (var i = 1; i < arguments.length; i++) {
		    result = this.shallowCopy(result, arguments[i]);
	    	}
	    }
	    return result;
	}
    }

    class L extends BaseUtil {
	
    }

    class BaseClass {
	#raw;
	constructor(raw) {
	    if (BaseUtil.is.raw(raw) || BaseUtil.is.fragment(raw)) {
		this.#raw = raw;
	    }
	}
	add = function(className) {
	    return this.#raw.classList.add(className);
	}

	remove = function(className) {
	    return this.#raw.classList.remove(className);
	}

	replace = function(replace, replaceWith) {
	    return this.#raw.classList.replace(replace, replaceWith);
	}

	getAll() {
	    return this.#raw.classList;
	}

	hasClass(className) {
	    let result = false;
	    this.#raw.classList.forEach((val) => {
		if (val === "btn")
		    result = true;
	    });
	    return result;
	}
    }

    class BaseStyle {
	#raw;
	constructor(raw) {
	    if (BaseUtil.is.raw(raw) || BaseUtil.is.fragment(raw)) {
		this.#raw = raw;
		if (BaseUtil.is.fragment(raw)) {
		    this.sheets = function() {
			return this.raw.styleSheets;
		    }
		}
	    }
	}
	find(name) {
	    if (name)
	        return this.#raw.style.getPropertyValue(name);
	    else 
	        return this.#raw.style;
	}

	update(name, value) {
	    return this.#raw.style.setProperty(name, value);
	}

    }

    class BaseAttribute {
	#raw;
	constructor(raw) {
	    if (BaseUtil.is.raw(raw) || BaseUtil.is.fragment(raw)) {
		this.#raw = raw;
	    }
	}

	names() {
	    return this.#raw.getAttributeNames();
	}

	has(name) {
	    return this.#raw.hasAttribute(name);
	}

	find(name) {
	    if (this.#raw.hasAttribute(name))
	        return this.#raw.attributes[name];
	}

	update(name, value) {
	    return this.#raw.setAttribute(name, value);
	}

	remove(name) {
	    return this.#raw.attributes.removeNamedItem(name);
	}
    }

    class BaseText {
	#raw;
	constructor(raw) {
	    if (BaseUtil.is.raw(raw) || BaseUtil.is.fragment(raw)) {
		this.#raw = raw;
	    }
	}

	inner(text) {
	    if (text || text === "") {
		this.#raw.innerText = text;
		return new Lment(this.#raw);
	    }
	    else 
		return this.#raw.innerText;
	}

	outer(text) {
	    if (text || text === "") {
		this.#raw.outerText = text;
		return new Lment(this.#raw);
	    }
	    else
		return this.#raw.outerText;
	}
    }

    class BaseHtml {
	#raw;
	constructor(raw) {
	    if (BaseUtil.is.raw(raw) || BaseUtil.is.fragment(raw)) {
		this.#raw = raw;
	    }
	}

	outer(html) {
	    if (html || html === "") {
		this.#raw.outerHTML = html;
		return new Lment(this.#raw);
	    }
	    else
		return this.#raw.outerHTML;
	}

	inner(html) {
	    if (html || html === "") {
		this.#raw.innerHTML = html;
		return new Lment(this.#raw);
	    }
	    else
		return this.#raw.innerHTML;
	}
    }

    class BaseData {
	#raw;
	constructor(raw) {
	    if (BaseUtil.is.raw(raw)) {
		this.#raw = raw;
	    }
	}
	
	getValue(name) {
	    return this.#raw.dataset[name];
	}
	getObject(name) {
	    if (this.#raw.dataset.hasOwnProperty(name)) {
		return JSON.parse(this.#raw.dataset[name]);
	    }
	}
	setValue(name, value) {
	    return this.#raw.dataset[name] = value;
	}
	delete(name) {
	    return delete this.#raw.dataset[name];
	}
	modifyObject(name, propOrVal, val) {
		let result,
		parse,
		cur = this.#raw.dataset[name],
		exists = cur ? true : false;
	    if (arguments.length === 3) {
		if (exists) {
		    result = BaseUtil.ext(JSON.parse(this.#raw.dataset[name][propOrVal]), val, true);
		    parse = JSON.parse(cur);
		    this.#raw.dataset[name][propOrVal] = JSON.stringify(result);
		}
		else {
		    result = {};
		    result[propOrVal] = val;
		    this.#raw.dataset[name] = JSON.stringify(result);
		}
	    }
	    else {
		if (exists) {
		    result = BaseUtil.ext(JSON.parse(this.#raw.dataset[name]), propOrVal, true);
		    this.#raw.dataset[name] = JSON.stringify(result);
		}
		else {
		    result = propOrVal;
		    this.#raw.dataset[name] = JSON.stringify(result);
		}
	    }
	    return result;
	}
    }

    class BaseEvent {
	static builtIn = [
	    {name: "abort", to: UIEvent},
	    {name: "afterprint", to: Event},
	    {name: "animationend", to: AnimationEvent},
	    {name: "animationiteration", to: AnimationEvent},
	    {name: "animationstart", to: AnimationEvent},
	    {name: "beforeprint", to: Event },
	    {name: "beforeunload", to: UIEvent},
	    {name: "blur", to: FocusEvent},
	    {name: "canplay", to: Event},
	    {name: "canplaythrough", to: Event},
	    {name: "change", to: Event},
	    {name: "click", to: MouseEvent},
	    {name: "contextmenu", to: MouseEvent},
	    {name: "copy", to: ClipboardEvent},
	    {name: "cut", to: ClipboardEvent},
	    {name: "dblclick", to: MouseEvent},
	    {name: "drag", to: DragEvent},
	    {name: "dragend", to: DragEvent},
	    {name: "dragleave", to: DragEvent},
	    {name: "dragover", to: DragEvent},
	    {name: "dragstart", to: DragEvent},
	    {name: "drop", to: DragEvent},
	    {name: "durationchange", to: Event},
	    {name: "ended", to: Event},
	    {name: "error", to: Event},
	    {name: "focus", to: FocusEvent},
	    {name: "focusin", to: FocusEvent},
	    {name: "focusout", to: FocusEvent},
	    {name: "fullscreenchange", to: Event},
	    {name: "fullscreenerror", to: Event},
	    {name: "hashchange", to: HashChangeEvent},
	    {name: "input", to: InputEvent},
	    {name: "invalid", to: Event},
	    {name: "keydown", to: KeyboardEvent},
	    {name: "keypress", to: KeyboardEvent},
	    {name: "keyup", to: KeyboardEvent},
	    {name: "load", to: UIEvent},
	    {name: "loadeddata", to: Event},
	    {name: "loadedmetadata", to: Event},
	    {name: "loadstart", to: ProgressEvent},
	    {name: "message", to: Event},
	    {name: "MouseDown", to: MouseEvent},
	    {name: "mouseenter", to: MouseEvent},
	    {name: "mouseleave", to: MouseEvent},
	    {name: "mousemove", to: MouseEvent},
	    {name: "mouseover", to: MouseEvent},
	    {name: "mouseout", to: MouseEvent},
	    {name: "mouseup", to: MouseEvent},
	    {name: "mousewheel", to: WheelEvent},
	    {name: "offline", to: Event},
	    {name: "online", to: Event},
	    {name: "open", to: Event},
	    {name: "pagehide", to: PageTransitionEvent},
	    {name: "pageshow", to: PageTransitionEvent},
	    {name: "paste", to: ClipboardEvent},
	    {name: "pause", to: Event},
	    {name: "play", to: Event},
	    {name: "playing", to: Event},
	    {name: "popstate", to: PopStateEvent},
	    {name: "progress", to: Event},
	    {name: "ratechange", to: Event},
	    {name: "resize", to: UIEvent},
	    {name: "scroll", to: UIEvent},
	    {name: "search", to: Event},
	    {name: "seeked", to: Event},
	    {name: "seeking", to: Event},
	    {name: "select", to: UIEvent},
	    {name: "show", to: Event},
	    {name: "stalled", to: Event},
	    {name: "storage", to: StorageEvent},
	    {name: "submit", to: Event},
	    {name: "suspend", to: Event},
	    {name: "timeupdate", to: Event},
	    {name: "toggle", to: Event},
	    {name: "touchcancel", to: TouchEvent},
	    {name: "touchend", to: TouchEvent},
	    {name: "touchmove", to: TouchEvent},
	    {name: "touchstart", to: TouchEvent},
	    {name: "transitionend", to: TransitionEvent},
	    {name: "unload", to: UIEvent},
	    {name: "volumechange", to: Event},
	    {name: "waiting", to: Event},
	    {name: "wheel", to: WheelEvent},
	];
    }

    class Lment {
	raw;
	qa(selector) {
	    return new LmentArray(this.raw.querySelectorAll(selector));
	}
	q(selector) {
	    return new Lment(this.raw.querySelector(selector));
	}
	classes;
	styles;
	text;
	html;
	data;
	attributes;
	animations;
	matches(selector) {
	    return this.raw.matches(selector);
	}
	parent() {
	    return new Lment(this.raw.parentElement);
	}
	children() {
	    return new LmentArray(this.raw.children);
	}
	next() {
	    return new Lment(this.raw.nextElementSibling);
	}
	prev() {
	    return new Lment(this.raw.previousElementSibling);
	}
	append(html) {
	    if (BaseUtil.is.lment(html))
		this.raw.append(html.raw);
	    else if (BaseUtil.is.lmentArray(html))
		for (var i = 0; i < html.length; i++)
		    this.raw.append(html[i].raw);
	    else if (BaseUtil.is.raw(html))
		this.raw.append(html);
	}
	prepend(html) {
	    if (BaseUtil.is.lment(html))
		this.raw.prepend(html.raw);
	    else if (BaseUtil.is.lmentArray(html))
		for (var i = 0; i < html.length; i++)
		    this.raw.prepend(html[i].raw);
	    else if (BaseUtil.is.raw(html))
		this.raw.prepend(html);
	}
	closest(selector) {
	    let result = this.raw.closest(selector);
	    return result ? new Lment(result): null;
	}
	#prepHandler = function(fn, e) {
	    return fn.call(this, e);
	}
	click(optionalFn) {
	    if (optionalFn)
		this.raw.addEventListener("click", (e) => this.#prepHandler(optionalFn, e));
	    else
		this.raw.click();
	    return this;
	}
	blur(optionalFn) {
	    if (optionalFn)
		this.raw.addEventListener("blur", (e) => this.#prepHandler(optionalFn, e));
	    else
		this.raw.blur();
	    return this;
	}
	focus(optionalFn) {
	    if (optionalFn)
		this.raw.addEventListener("focus", (e) => this.#prepHandler(optionalFn, e));
	    else
		this.raw.focus();
	    return this;
	}
	scroll(optionalFn) {
	    if (optionalFn)
		this.raw.addEventListener("scroll", (e) => this.#prepHandler(optionalFn, e));
	    else
		this.raw.scroll();
	    return this;
	}
	on(name, fn, optOrCapture = false) {
	    this.raw.addEventListener(name, (e) => this.#prepHandler(fn, e), optOrCapture);
	    return this;
	}
	off(name, listener, capture = false) {
	    this.raw.removeEventListener(name, (e) => this.#prepHandler(listener, e), capture);
	    return this;
	}
	trigger(name, data = null) {
	    if (BaseUtil.is.event(name) || BaseUtil.is.customEvent(name)) {
		this.raw.dispatchEvent(name);
		return this;
	    }
	    let builtIn = BaseEvent.builtIn.filter((val) => { return val.name === name; }),
		event;
	    if (builtIn.length == 0) {
		if (BaseUtil.is.clr(data))
		    event = new CustomEvent(name, data);
		else
		    event = new CustomEvent(name);
	    }
	    else {
		if (BaseUtil.is.clr(data))
		    event = new builtIn[0].to(name, data);
		else
		    event = new builtIn[0].to(name);
	    }
	    this.raw.dispatchEvent(event);
	    return this;
	}
	remove() {
	    this.raw.remove();
	}
	replace(el) {
	    if (BaseUtil.is.raw(el)) {
		let result = new Lment(el);
		this.replaceWith(el);
		return result;
	    }
	    else if (BaseUtil.is.lment(el)) {
		this.replaceWith(el);
		return el;
	    }
	}
	shadow() {
	    if (this.raw.shadowRoot)
		return new Lment(this.raw.shadowRoot);
	}

	constructor(raw) {
	    if (raw && (BaseUtil.is.raw(raw) || BaseUtil.is.fragment(raw))) {
		this.raw = raw;
		this.classes = new BaseClass(raw);
		this.styles = new BaseStyle(raw);
		this.attributes = new BaseAttribute(raw);
		this.text = new BaseText(raw);
		this.html = new BaseHtml(raw);
		this.data = new BaseData(raw);
	    }
	    else {
		return null;
	    }
	}
    }

    class LmentArray {
	#value = [];
	#iterate = function(callback) {
	    return this.#value.forEach(callback);
	}
	#filter = function(callback) {
	    return new LmentArray(this.#value.filter(callback));
	}
	constructor(nodeList) {
	    if (BaseUtil.is.nodeList(nodeList) || BaseUtil.is.htmlCollection(nodeList) || BaseUtil.is.array(nodeList) || BaseUtil.is.lmentArray(nodeList)) {
		if (BaseUtil.is.htmlCollection(nodeList)) {
		    for (var i = 0; i < nodeList.length; i++) {
			if (BaseUtil.is.raw(nodeList[i]))
			    this.#value.push(new Lment(nodeList[i]));
		    }
		}
		else if (BaseUtil.is.lmentArray(nodeList)) {
		    this.#value.splice(0,0,nodeList.list);
		}
		else {
		    nodeList.forEach((val) => {
			if (BaseUtil.is.raw(val))
		    	    this.#value.push(new Lment(val));
			else if (BaseUtil.is.lment(val))
			    this.#value.push(val);
		    });
		}
	    }
	}
	get list() { return this.#value; }
	get length() { return this.#value.length; }
	index(ind) {
	    return this.#value[ind];
	}
	copy() {
	    let arr = [];
	    this.#iterate((val) => {
		arr.push(val);
	    });
	    return arr;
	}
	add(lmentOrArr) {
	    if (BaseUtil.is.lmentArray(lmentOrArr)) {
		for (var i = 0; i < lmentOrArr.length; i++) {
		    let val = lmentOrArr.index(i);
		    if (BaseUtil.is.lment(val))
		        this.#value.push(val);
		}
	    }
	    else if (BaseUtil.is.lment(lmentOrArr)) {
		this.#value.push(lmentOrArr);
	    }
	    else if (BaseUtil.is.array(lmentOrArr)) {
		lmentOrArr.forEach((val) => {
		    if (BaseUtil.is.lment(val)) {
			this.#value.push(val);
		    }
		    else if (BaseUtil.is.raw(val)) {
			this.#value.push(new Lment(val));
		    }
		});
	    }
	    else if (BaseUtil.is.raw(lmentOrArr)) {
		this.#value.push(new Lment(lmentOrArr));
	    }
	    else if (BaseUtil.is.htmlCollection(lmentOrArr)) {
		for (var i = 0; i < lmentOrArr; i++) {
		    let val = lmentOrArr[i];
		    if (BaseUtil.is.raw(val))
			this.#value.push(new Lment(val));
		}
	    }
	    else if (BaseUtil.is.nodeList(lmentOrArr)) {
		lmentOrArr.forEach((val) => {
		    if (BaseUtil.is.raw(val))
			this.#value.push(new Lment(val));
		});
	    }
	}

	remove(lmentOrSelector, shouldDelete) {
	    if (BaseUtil.is.lment(lmentOrSelector)) {
		let ind = this.#value.findIndex(lmentOrSelector);
		if (shouldDelete === true)
		    lmentOrSelector.remove();
		this.#value.splice(ind, 1);
	    }
	    else {
		let arr = [];
		this.#iterate((val, ind) => {
		    if (val.raw.matches(lmentOrSelector))
			arr.push(ind);
		});
		for(var i = 0; i < arr.length; i++) {
		    if (shouldDelete === true)
			this.#value[arr[i]].raw.remove();
		    this.#value.splice(arr[i], 1);
		}
	    }
	}

	where(fn) {
	    return this.#filter(fn);
	}

	first(fn) {
	    if (fn && fn instanceof Function) {
		return this.#filter(fn)[0];
	    }
	    else {
		return this.#value[0];
	    }
	}

	addClass(className) {
	    this.#iterate((val) => {
		val.classes.add(className)
	    });

	    return this;
	}

	removeClass(className) {
	    this.#iterate((val) => {
		val.classes.remove(className);
	    });

	    return this;
	}

	replaceClass(replace, replaceWith) {
	    this.#iterate((val) => {
		val.classes.replace(replace, replaceWith);
	    });

	    return this;
	}

	setStyle(name, value) {
	    this.#iterate((val) => {
		val.styles.update(name, value);
	    });

	    return this;
	}

	forEach(fn) {
	    this.#iterate(fn);
	}

	contains(selectorOrFn) {
	    let result = false;
	    if (typeof selectorOrFn === "function") {
		result = this.where(selectorOrFn).length > 0;
	    }
	    else {
		this.#iterate((val) => {
		    if (val.raw.matches(selectorOrFn))
			result = true;
		});
	    }
	    return result;
	}	
    }


	export { L, Lment };

//})();