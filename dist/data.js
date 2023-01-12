"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchData = exports.isRedirectResponse = exports.isErrorResponse = exports.isCatchResponse = void 0;
function isCatchResponse(response) {
    return (response instanceof Response &&
        response.headers.get("X-Remix-Catch") != null);
}
exports.isCatchResponse = isCatchResponse;
function isErrorResponse(response) {
    return (response instanceof Response &&
        response.headers.get("X-Remix-Error") != null);
}
exports.isErrorResponse = isErrorResponse;
function isRedirectResponse(response) {
    return (response instanceof Response &&
        response.headers.get("X-Remix-Redirect") != null);
}
exports.isRedirectResponse = isRedirectResponse;
function fetchData(request, routeId) {
    return __awaiter(this, void 0, void 0, function* () {
        let url = new URL(request.url);
        url.searchParams.set("_data", routeId);
        let init = { signal: request.signal };
        if (request.method !== "GET") {
            init.method = request.method;
            let contentType = request.headers.get("Content-Type");
            init.body =
                // Check between word boundaries instead of startsWith() due to the last
                // paragraph of https://httpwg.org/specs/rfc9110.html#field.content-type
                contentType && /\bapplication\/x-www-form-urlencoded\b/.test(contentType)
                    ? new URLSearchParams(yield request.text())
                    : yield request.formData();
        }
        let response = yield fetch(url.href, init);
        if (isErrorResponse(response)) {
            let data = yield response.json();
            let error = new Error(data.message);
            error.stack = data.stack;
            return error;
        }
        return response;
    });
}
exports.fetchData = fetchData;
//# sourceMappingURL=data.js.map