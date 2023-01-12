"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemixRootDefaultCatchBoundary = exports.RemixCatchBoundary = exports.useCatch = exports.RemixRootDefaultErrorBoundary = exports.RemixErrorBoundary = void 0;
const react_1 = __importStar(require("react"));
class RemixErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { error: props.error || null, location: props.location };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    static getDerivedStateFromProps(props, state) {
        // When we get into an error state, the user will likely click "back" to the
        // previous page that didn't have an error. Because this wraps the entire
        // application (even the HTML!) that will have no effect--the error page
        // continues to display. This gives us a mechanism to recover from the error
        // when the location changes.
        //
        // Whether we're in an error state or not, we update the location in state
        // so that when we are in an error state, it gets reset when a new location
        // comes in and the user recovers from the error.
        if (state.location !== props.location) {
            return { error: props.error || null, location: props.location };
        }
        // If we're not changing locations, preserve the location but still surface
        // any new errors that may come through. We retain the existing error, we do
        // this because the error provided from the app state may be cleared without
        // the location changing.
        return { error: props.error || state.error, location: state.location };
    }
    render() {
        if (this.state.error) {
            return <this.props.component error={this.state.error}/>;
        }
        else {
            return this.props.children;
        }
    }
}
exports.RemixErrorBoundary = RemixErrorBoundary;
/**
 * When app's don't provide a root level ErrorBoundary, we default to this.
 */
function RemixRootDefaultErrorBoundary({ error }) {
    console.error(error);
    return (<html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
        <title>Application Error!</title>
      </head>
      <body>
        <main style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
          <h1 style={{ fontSize: "24px" }}>Application Error</h1>
          <pre style={{
            padding: "2rem",
            background: "hsla(10, 50%, 50%, 0.1)",
            color: "red",
            overflow: "auto",
        }}>
            {error.stack}
          </pre>
        </main>
        <script dangerouslySetInnerHTML={{
            __html: `
              console.log(
                "💿 Hey developer👋. You can provide a way better UX than this when your app throws errors. Check out https://remix.run/guides/errors for more information."
              );
            `,
        }}/>
      </body>
    </html>);
}
exports.RemixRootDefaultErrorBoundary = RemixRootDefaultErrorBoundary;
let RemixCatchContext = react_1.default.createContext(undefined);
/**
 * Returns the status code and thrown response data.
 *
 * @see https://remix.run/route/catch-boundary
 */
function useCatch() {
    return (0, react_1.useContext)(RemixCatchContext);
}
exports.useCatch = useCatch;
function RemixCatchBoundary({ catch: catchVal, component: Component, children, }) {
    if (catchVal) {
        return (<RemixCatchContext.Provider value={catchVal}>
        <Component />
      </RemixCatchContext.Provider>);
    }
    return <>{children}</>;
}
exports.RemixCatchBoundary = RemixCatchBoundary;
/**
 * When app's don't provide a root level CatchBoundary, we default to this.
 */
function RemixRootDefaultCatchBoundary() {
    let caught = useCatch();
    return (<html lang="en">
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
        <title>Unhandled Thrown Response!</title>
      </head>
      <body>
        <h1 style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
          {caught.status} {caught.statusText}
        </h1>
        <script dangerouslySetInnerHTML={{
            __html: `
              console.log(
                "💿 Hey developer👋. You can provide a way better UX than this when your app throws 404s (and other responses). Check out https://remix.run/guides/not-found for more information."
              );
            `,
        }}/>
      </body>
    </html>);
}
exports.RemixRootDefaultCatchBoundary = RemixRootDefaultCatchBoundary;
//# sourceMappingURL=errorBoundaries.js.map