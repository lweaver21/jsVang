import { L } from "./core.js";
export { BaseHttp };

const componentPath = "../../component/";

class BaseHttp {
    static #fullPath(dest) {
	return componentPath + dest;
    }
    static get(url, httpOpt) {
	let path = this.#fullPath(url);
	return new Promise(function(resolve, reject) {
	    let req = new XMLHttpRequest();
	    req.addEventListener("load", resolve);
	    req.addEventListener("error", reject);
	    req.open("GET", path);
	    if (httpOpt["contentType"])
		req.setRequestHeader("contentType", httpOpt["contentType"]);
	    req.send();
	});
    }
    static post(url, data, httpOpt) {
	let path = this.#fullPath(url);
	return new Promise(function(resolve, reject) {
	    let req = new XMLHttpRequest();
	    req.submittedData = data;
	    req.addEventListener("load", listener);
	    req.addEventListener("error", reject); 
	    req.open("POST", path);
	    if (httpOpt["contentType"])
		req.setRequestHeader("contentType", httpOpt["contentType"]);
	    req.send();
	});
    }
    static put(url, listener, data, query = null) {
	
    }
    static patch(url, listener, data, query = null) {
	
    }
    static delete(url, listener, query = null) {
	
    }

}