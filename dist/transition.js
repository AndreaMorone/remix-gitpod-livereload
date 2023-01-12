"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IDLE_FETCHER = exports.IDLE_TRANSITION = exports.CatchValue = void 0;
class CatchValue {
    constructor(status, statusText, data) {
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}
exports.CatchValue = CatchValue;
exports.IDLE_TRANSITION = {
    state: "idle",
    submission: undefined,
    location: undefined,
    type: "idle",
};
exports.IDLE_FETCHER = {
    state: "idle",
    type: "init",
    data: undefined,
    submission: undefined,
};
//# sourceMappingURL=transition.js.map