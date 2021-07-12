# jsVang (v1)
js Vanilla angular: Open-Source Modular web development with that vanilla js flavor

*NO TYPESCRIPT REQUIRED!*


Easily define and utilize re-usable web components with this lightweight vanilla JS framework. Define, import, and extend modules to efficiently integrate with components. Works well with even the most basic file-system structure. Allowing web-developers at any level to create functional, modular web apps _**without the need of anything other than**_ their own _**HTML, CSS, and JS**_ skills.



## Quick Install

To install, simply download the _**'src'**_ folder and move the _**'L'**_ module folder to wherever is most convenient. Like, *`webapp/js`* or *`webapp/js/modules`* or really wherever. Just remember that all your import/export file locations are relative. 



## Component Setup

1. Create a _**'component'**_ folder in your root directory
    * Each web component is located in it's own subdirectory of the *component* folder 
    * Each folder will contain an HTML, CSS, and JS file that defines your component
    
2. Add the component files The file/dir sturcture of each component goes:
    * *`/component/[name]/[name].component.html`*
    * *`/component/[name]/[name].component.css`*
    * *`/component/[name]/[name].component.js`*

**Defining a component** only requires 9 lines of code in it's _**.component.js**_ file:

``` javascript
    import { Component } from '../../js/L/main.js';    // Absolute paths ('~/etc') aren't allowed here unfortunately
    
    export class TestComponent extends Component {
        static tag = "app-test";    //Tag Name for html MUST contain a dash <app-test></app-test>
        static html = "test.component.html";    //Just the file names
        static style = "test.component.css";
        
        constructor() {
            super();
        }
    }
```



## Register Component(s)
To use these components in html, you first need to register your components with the DOM.

1. Add a _**.js**_ module file (wherever really) named whatever you want. Traditional angular would name this file _**app.js**_ and place it in the root directory. 
2. In your module file, import all the components you want to define and register it using the base util class _**'L'**_ from */L/core.js*

``` javascript
    import { L } from './js/module/L/core.js';
    import { TestComponent } from './component/test/test.component.js';
    
    let components = [
	    TestComponent,
    ];
    
    L.registerComponents(components);
```    
    
3. Include script tag reference in _**index.html**_
    - e.g. `<script type="module" src="/app.js"></script>`
4. You now have access to `<app-test></app-test>` in HTML

*note: External CSS stylesheet rules are inheritted with these components*



## Scope & Interpolation
Declare watched properties on a component who's values can be dynamically parsed into it's HTML template.

In the _**.component.js**_ file, define the static _'scope'_ property directly inside the component class definition.

``` javascript
    import { Component } from '../../js/L/main.js';
    
    export class TestComponent extends Component {
        static tag = "app-test";
        static html = "test.component.html";
        static style = "test.component.css";
        static scope { foo: "bar", bar: 21 };   //  <====== Can also set initial values here
    
        constructor() {
            super();
        }
    }
```


Interpolation is achieved in the HTML template file with `${ }`

```html
    <p>Name: </p>
    <span>${ foo }</span> <!-- Scope property -->
    <p>Age: </p>
    <span>${ bar }</span> <!-- Scope property -->
```


Inside the brackets you can evaluate any JS. However, *'this'* refers to *window* while *scope* property names are considered reserved keywords.



## Component Event Hooks

#### onInit()
- Called before template has been fetched/rendered
- Don't access DOM onInit or else it won't render correctly

#### onInitEnd()
- Called after template has been rendered/attached
- Safe to access DOM here



## Component HTML Element Callbacks
Built-In hooks fired by the element itself

#### connectedCallback()
- Called as soon as the element connects
- Safe to access DOM here
- Traditionally used for setting event handlers on/in the component

#### disconnectedCallback()
- Called when element is removed from the DOM
- Remove event handlers here
- A  dispose function would be good here

#### adoptedCallback()
- Called when the element has been moved to another page

#### attributeChangedCallback(name, oldValue, newValue)
- Called when an observed atribute is added, removed, or changed
- _See observedAttribute under 'Getters'_



## Getters

#### static get observedAttribute()
- Return an array of attribute names to watch
- Determines which attributes trigger attributeChangedCallback



## DOM Events

