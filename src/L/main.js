"use strict";

import { L, Lment } from './core.js';
import { BaseHttp as Http } from './http.js';

export { Component, ComponentHttp };

class ComponentHttp {
    static #parseTemplateLoc(name) {
	return name.slice(0, name.indexOf(".")) + "/" + name;
    }
    static #fetchSuccess(data) {
	return data.target.response;
    }
    static #fetchError(err) {
	console.error("Fetch Error", err);
    }
    static #empty = new Promise((resolve) => resolve(""));
    static #loadHtml(dest) {
	return Http.get(dest, { contentType: "text/html" });
    }
    static fetchView(html) {
	//Initial view get/interpollate
	//Probably fire a couple events (onBeforeFetch, onAfterFetch)
	return html 
	  ? this.#loadHtml(this.#parseTemplateLoc(html)).then(this.#fetchSuccess, this.#fetchError)
	  : this.#empty;
    }
    static #loadCss(dest) {
	return Http.get(dest, { contentType: "text/css" });
    }
    static fetchStyles(styles) {
	return styles 
	  ? this.#loadCss(this.#parseTemplateLoc(styles)).then(this.#fetchSuccess, this.#fetchError)
	  : this.#empty;
    }
}

class Component extends HTMLElement {
    static tag = "";
    static html = "";
    static styles = "";
    static events = {};
    static event(name) {
	const defaultOpt = {bubble: true, cancellable: true, composed: false};
	let def = this.events[name];
	if (def) {
	    //Extend default options
	    return L.curry(function (name, eventDef, options) { 
			    return new CustomEvent(name, L.ext(defaultOpt, eventDef, options));
		         })(name, def);
	}
	else {
	    //Use only default options here
	    return L.curry(function(name, options) {
				return new CustomEvent(name, L.ext(defaultOpt, options));
			  })(name);
	}
    }
    
    #assemble(literal, params) {
	return new Function(params, "return `"+literal+"`;");
    }

    #rerender(data) {
	let curryAssemble = L.curry(this.#assemble)(this.constructor.templateHtml),
	    params = Object.keys(data);
	var template = L.curry(curryAssemble(params));

	for (var i = 0; i < params.length; i++) {
	    template = template(data[params[i]]);
	}
	    let dom = this.getDom(),
	    	shadow = dom.shadow(),
		replaceContainer = new Lment(document.createElement("div")).html.inner(template);
	
	    shadow.children()
		.where((val, ind, arr) => ind)
		.forEach((val) => val.remove());

	replaceContainer.children()
	    .forEach((val) => shadow.append(val));
    }

    #watching = {};
    #triggerScope() {
	this.#rerender(this.#watching);
    }
    #watch(ref) {
	let watching = this.#watching,
	    trigger = this.#triggerScope,
	    props = this.constructor.scope;
	for (const prop in props) {
		watching[prop] = props[prop];
	        Object.defineProperty(this, prop, {
		    configurable: true,
		    get() {
		    	return watching[prop];
 		    },
		    set(val) {
			watching[prop] = val;
		    	trigger.call(this, prop);
		    }
	    	});
	}
    }

    #shadowBase;
    set shadow(val) {
	if (!this.#shadowBase) {
	    if (L.is.shadow(val)) {
		this.#shadowBase = val;
		this.#initEnd.call(this);
	    }
	}
	else {
	    this.#shadowBase = L.is.shadow(val) ? val : this.#shadowBase;
	}
    }
    get shadow() {
	return this.#shadowBase;
    }

    static templateHtml;
    static templateStyle;
    #attachShadow(component) {
	this.#watch(component);
	component.hidden = true;
	let shadow = component.attachShadow({mode: "open"}),
	    watching = component.constructor.scope,
	    params = Object.keys(watching),
	    curryAssemble = L.curry(this.#assemble);

	ComponentHttp.fetchStyles(component.constructor.styles).then(function(css) {
		component.constructor.templateStyle = css;
	    ComponentHttp.fetchView(component.constructor.html).then(function(html) {
		component.constructor.templateHtml = html;

		let htmlAssemble = L.curry(curryAssemble(html, params));

		for (var prop in watching) {
		    htmlAssemble = htmlAssemble(watching[prop]);
		}
		
	    	let template = `<style>\n
    @import "../../style/app.css";\n
    ${css}\n
</style>` + htmlAssemble;

		shadow.innerHTML = template;
		new Lment(shadow).q("style").on("load", function () { component.hidden = false; });
		component.shadow = shadow;
	    });
	});
    }

    #initEnd() {
	if (L.is.fn(this.onInitEnd))
	    this.onInitEnd(L);
    }
    #init() {
	if (L.is.fn(this.onInit))
	    this.onInit(L);
    }
    getDom() {
	return new Lment(this);
    }

    constructor() {
	super();
	this.#attachShadow(this);
	this.#init();
    }
}