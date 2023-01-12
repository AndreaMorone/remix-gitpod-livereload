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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientRoutes = exports.createServerRoutes = void 0;
const React = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const routeModules_1 = require("./routeModules");
const data_1 = require("./data");
const links_1 = require("./links");
const invariant_1 = __importDefault(require("./invariant"));
const component_1 = require("./component");
function createServerRoutes(manifest, routeModules, parentId) {
    return Object.values(manifest)
        .filter((route) => route.parentId === parentId)
        .map((route) => {
        let hasErrorBoundary = route.id === "root" || route.hasErrorBoundary || route.hasCatchBoundary;
        let dataRoute = {
            caseSensitive: route.caseSensitive,
            element: <component_1.RemixRoute id={route.id}/>,
            errorElement: hasErrorBoundary ? (<component_1.RemixRouteError id={route.id}/>) : undefined,
            id: route.id,
            index: route.index,
            path: route.path,
            handle: routeModules[route.id].handle,
            // Note: we don't need loader/action/shouldRevalidate on these routes
            // since they're for a static render
        };
        let children = createServerRoutes(manifest, routeModules, route.id);
        if (children.length > 0)
            dataRoute.children = children;
        return dataRoute;
    });
}
exports.createServerRoutes = createServerRoutes;
function createClientRoutes(manifest, routeModulesCache, parentId) {
    return Object.values(manifest)
        .filter((entryRoute) => entryRoute.parentId === parentId)
        .map((route) => {
        let hasErrorBoundary = route.id === "root" || route.hasErrorBoundary || route.hasCatchBoundary;
        let dataRoute = {
            caseSensitive: route.caseSensitive,
            element: <component_1.RemixRoute id={route.id}/>,
            errorElement: hasErrorBoundary ? (<component_1.RemixRouteError id={route.id}/>) : undefined,
            id: route.id,
            index: route.index,
            path: route.path,
            // handle gets added in via useMatches since we aren't guaranteed to
            // have the route module available here
            handle: undefined,
            loader: createDataFunction(route, routeModulesCache, false),
            action: createDataFunction(route, routeModulesCache, true),
            shouldRevalidate: createShouldRevalidate(route, routeModulesCache),
        };
        let children = createClientRoutes(manifest, routeModulesCache, route.id);
        if (children.length > 0)
            dataRoute.children = children;
        return dataRoute;
    });
}
exports.createClientRoutes = createClientRoutes;
function createShouldRevalidate(route, routeModules) {
    return function (arg) {
        let module = routeModules[route.id];
        (0, invariant_1.default)(module, `Expected route module to be loaded for ${route.id}`);
        if (module.shouldRevalidate) {
            return module.shouldRevalidate(arg);
        }
        return arg.defaultShouldRevalidate;
    };
}
function loadRouteModuleWithBlockingLinks(route, routeModules) {
    return __awaiter(this, void 0, void 0, function* () {
        let routeModule = yield (0, routeModules_1.loadRouteModule)(route, routeModules);
        yield (0, links_1.prefetchStyleLinks)(routeModule);
        return routeModule;
    });
}
function createDataFunction(route, routeModules, isAction) {
    return ({ request }) => __awaiter(this, void 0, void 0, function* () {
        let routeModulePromise = loadRouteModuleWithBlockingLinks(route, routeModules);
        try {
            if (isAction && !route.hasAction) {
                let msg = `Route "${route.id}" does not have an action, but you are trying ` +
                    `to submit to it. To fix this, please add an \`action\` function to the route`;
                console.error(msg);
                throw new Error(msg);
            }
            else if (!isAction && !route.hasLoader) {
                return null;
            }
            let result = yield (0, data_1.fetchData)(request, route.id);
            if (result instanceof Error) {
                throw result;
            }
            if ((0, data_1.isRedirectResponse)(result)) {
                throw getRedirect(result);
            }
            if ((0, data_1.isCatchResponse)(result)) {
                throw result;
            }
            return result;
        }
        finally {
            yield routeModulePromise;
        }
    });
}
function getRedirect(response) {
    let status = parseInt(response.headers.get("X-Remix-Status"), 10) || 302;
    let url = response.headers.get("X-Remix-Redirect");
    let headers = {};
    let revalidate = response.headers.get("X-Remix-Revalidate");
    if (revalidate) {
        headers["X-Remix-Revalidate"] = revalidate;
    }
    return (0, react_router_dom_1.redirect)(url, { status, headers });
}
//# sourceMappingURL=routes.js.map