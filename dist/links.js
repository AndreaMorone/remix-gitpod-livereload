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
exports.dedupe = exports.getModuleLinkHrefs = exports.getDataLinkHrefs = exports.getNewMatchesForLinks = exports.getStylesheetPrefetchLinks = exports.isHtmlLinkDescriptor = exports.isPageLinkDescriptor = exports.prefetchStyleLinks = exports.getLinksForMatches = void 0;
const react_router_dom_1 = require("react-router-dom");
const routeModules_1 = require("./routeModules");
////////////////////////////////////////////////////////////////////////////////
/**
 * Gets all the links for a set of matches. The modules are assumed to have been
 * loaded already.
 */
function getLinksForMatches(matches, routeModules, manifest) {
    let descriptors = matches
        .map((match) => {
        var _a;
        let module = routeModules[match.route.id];
        return ((_a = module.links) === null || _a === void 0 ? void 0 : _a.call(module)) || [];
    })
        .flat(1);
    let preloads = getCurrentPageModulePreloadHrefs(matches, manifest);
    return dedupe(descriptors, preloads);
}
exports.getLinksForMatches = getLinksForMatches;
function prefetchStyleLinks(routeModule) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!routeModule.links)
            return;
        let descriptors = routeModule.links();
        if (!descriptors)
            return;
        let styleLinks = [];
        for (let descriptor of descriptors) {
            if (!isPageLinkDescriptor(descriptor) && descriptor.rel === "stylesheet") {
                styleLinks.push(Object.assign(Object.assign({}, descriptor), { rel: "preload", as: "style" }));
            }
        }
        // don't block for non-matching media queries
        let matchingLinks = styleLinks.filter((link) => !link.media || window.matchMedia(link.media).matches);
        yield Promise.all(matchingLinks.map(prefetchStyleLink));
    });
}
exports.prefetchStyleLinks = prefetchStyleLinks;
function prefetchStyleLink(descriptor) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve) => {
            let link = document.createElement("link");
            Object.assign(link, descriptor);
            function removeLink() {
                // if a navigation interrupts this prefetch React will update the <head>
                // and remove the link we put in there manually, so we check if it's still
                // there before trying to remove it
                if (document.head.contains(link)) {
                    document.head.removeChild(link);
                }
            }
            link.onload = () => {
                removeLink();
                resolve();
            };
            link.onerror = () => {
                removeLink();
                resolve();
            };
            document.head.appendChild(link);
        });
    });
}
////////////////////////////////////////////////////////////////////////////////
function isPageLinkDescriptor(object) {
    return object != null && typeof object.page === "string";
}
exports.isPageLinkDescriptor = isPageLinkDescriptor;
function isHtmlLinkDescriptor(object) {
    if (object == null)
        return false;
    // <link> may not have an href if <link rel="preload"> is used with imagesrcset + imagesizes
    // https://github.com/remix-run/remix/issues/184
    // https://html.spec.whatwg.org/commit-snapshots/cb4f5ff75de5f4cbd7013c4abad02f21c77d4d1c/#attr-link-imagesrcset
    if (object.href == null) {
        return (object.rel === "preload" &&
            (typeof object.imageSrcSet === "string" ||
                typeof object.imagesrcset === "string") &&
            (typeof object.imageSizes === "string" ||
                typeof object.imagesizes === "string"));
    }
    return typeof object.rel === "string" && typeof object.href === "string";
}
exports.isHtmlLinkDescriptor = isHtmlLinkDescriptor;
function getStylesheetPrefetchLinks(matches, manifest, routeModules) {
    return __awaiter(this, void 0, void 0, function* () {
        let links = yield Promise.all(matches.map((match) => __awaiter(this, void 0, void 0, function* () {
            let mod = yield (0, routeModules_1.loadRouteModule)(manifest.routes[match.route.id], routeModules);
            return mod.links ? mod.links() : [];
        })));
        return links
            .flat(1)
            .filter(isHtmlLinkDescriptor)
            .filter((link) => link.rel === "stylesheet" || link.rel === "preload")
            .map((link) => link.rel === "preload"
            ? Object.assign(Object.assign({}, link), { rel: "prefetch" })
            : Object.assign(Object.assign({}, link), { rel: "prefetch", as: "style" }));
    });
}
exports.getStylesheetPrefetchLinks = getStylesheetPrefetchLinks;
// This is ridiculously identical to transition.ts `filterMatchesToLoad`
function getNewMatchesForLinks(page, nextMatches, currentMatches, manifest, location, mode) {
    let path = parsePathPatch(page);
    let isNew = (match, index) => {
        if (!currentMatches[index])
            return true;
        return match.route.id !== currentMatches[index].route.id;
    };
    let matchPathChanged = (match, index) => {
        var _a;
        return (
        // param change, /users/123 -> /users/456
        currentMatches[index].pathname !== match.pathname ||
            // splat param changed, which is not present in match.path
            // e.g. /files/images/avatar.jpg -> files/finances.xls
            (((_a = currentMatches[index].route.path) === null || _a === void 0 ? void 0 : _a.endsWith("*")) &&
                currentMatches[index].params["*"] !== match.params["*"]));
    };
    // NOTE: keep this mostly up-to-date w/ the transition data diff, but this
    // version doesn't care about submissions
    let newMatches = mode === "data" && location.search !== path.search
        ? // this is really similar to stuff in transition.ts, maybe somebody smarter
            // than me (or in less of a hurry) can share some of it. You're the best.
            nextMatches.filter((match, index) => {
                var _a;
                let manifestRoute = manifest.routes[match.route.id];
                if (!manifestRoute.hasLoader) {
                    return false;
                }
                if (isNew(match, index) || matchPathChanged(match, index)) {
                    return true;
                }
                if (match.route.shouldRevalidate) {
                    let routeChoice = match.route.shouldRevalidate({
                        currentUrl: new URL(location.pathname + location.search + location.hash, window.origin),
                        currentParams: ((_a = currentMatches[0]) === null || _a === void 0 ? void 0 : _a.params) || {},
                        nextUrl: new URL(page, window.origin),
                        nextParams: match.params,
                        defaultShouldRevalidate: true,
                    });
                    if (typeof routeChoice === "boolean") {
                        return routeChoice;
                    }
                }
                return true;
            })
        : nextMatches.filter((match, index) => {
            let manifestRoute = manifest.routes[match.route.id];
            return ((mode === "assets" || manifestRoute.hasLoader) &&
                (isNew(match, index) || matchPathChanged(match, index)));
        });
    return newMatches;
}
exports.getNewMatchesForLinks = getNewMatchesForLinks;
function getDataLinkHrefs(page, matches, manifest) {
    let path = parsePathPatch(page);
    return dedupeHrefs(matches
        .filter((match) => manifest.routes[match.route.id].hasLoader)
        .map((match) => {
        let { pathname, search } = path;
        let searchParams = new URLSearchParams(search);
        searchParams.set("_data", match.route.id);
        return `${pathname}?${searchParams}`;
    }));
}
exports.getDataLinkHrefs = getDataLinkHrefs;
function getModuleLinkHrefs(matches, manifestPatch) {
    return dedupeHrefs(matches
        .map((match) => {
        let route = manifestPatch.routes[match.route.id];
        let hrefs = [route.module];
        if (route.imports) {
            hrefs = hrefs.concat(route.imports);
        }
        return hrefs;
    })
        .flat(1));
}
exports.getModuleLinkHrefs = getModuleLinkHrefs;
// The `<Script>` will render rel=modulepreload for the current page, we don't
// need to include them in a page prefetch, this gives us the list to remove
// while deduping.
function getCurrentPageModulePreloadHrefs(matches, manifest) {
    return dedupeHrefs(matches
        .map((match) => {
        let route = manifest.routes[match.route.id];
        let hrefs = [route.module];
        if (route.imports) {
            hrefs = hrefs.concat(route.imports);
        }
        return hrefs;
    })
        .flat(1));
}
function dedupeHrefs(hrefs) {
    return [...new Set(hrefs)];
}
function dedupe(descriptors, preloads) {
    let set = new Set();
    let preloadsSet = new Set(preloads);
    return descriptors.reduce((deduped, descriptor) => {
        let alreadyModulePreload = !isPageLinkDescriptor(descriptor) &&
            descriptor.as === "script" &&
            descriptor.href &&
            preloadsSet.has(descriptor.href);
        if (alreadyModulePreload) {
            return deduped;
        }
        let str = JSON.stringify(descriptor);
        if (!set.has(str)) {
            set.add(str);
            deduped.push(descriptor);
        }
        return deduped;
    }, []);
}
exports.dedupe = dedupe;
// https://github.com/remix-run/history/issues/897
function parsePathPatch(href) {
    let path = (0, react_router_dom_1.parsePath)(href);
    if (path.search === undefined)
        path.search = "";
    return path;
}
//# sourceMappingURL=links.js.map