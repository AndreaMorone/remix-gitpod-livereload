"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deserializeErrors = void 0;
const router_1 = require("@remix-run/router");
function deserializeErrors(errors) {
    if (!errors)
        return null;
    let entries = Object.entries(errors);
    let serialized = {};
    for (let [key, val] of entries) {
        // Hey you!  If you change this, please change the corresponding logic in
        // serializeErrors in remix-server-runtime/errors.ts :)
        if (val && val.__type === "RouteErrorResponse") {
            serialized[key] = new router_1.ErrorResponse(val.status, val.statusText, val.data, val.internal === true);
        }
        else if (val && val.__type === "Error") {
            let error = new Error(val.message);
            error.stack = val.stack;
            serialized[key] = error;
        }
        else {
            serialized[key] = val;
        }
    }
    return serialized;
}
exports.deserializeErrors = deserializeErrors;
//# sourceMappingURL=errors.js.map