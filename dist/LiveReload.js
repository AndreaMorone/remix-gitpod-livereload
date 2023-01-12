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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveReload = exports.useFetcher = exports.useFetchers = exports.useTransition = exports.useActionData = exports.useLoaderData = exports.useMatches = exports.Scripts = exports.Meta = exports.PrefetchPageLinks = exports.Links = exports.composeEventHandlers = exports.Link = exports.NavLink = exports.RemixRouteError = exports.RemixRoute = exports.RemixEntry = exports.RemixContext = void 0;
const React = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const errorBoundaries_1 = require("./errorBoundaries");
const invariant_1 = __importDefault(require("./invariant"));
const links_1 = require("./links");
const markup_1 = require("./markup");
const transition_1 = require("./transition");
function useDataRouterContext() {
    let context = React.useContext(react_router_dom_1.UNSAFE_DataRouterContext);
    (0, invariant_1.default)(context, "You must render this element inside a <DataRouterContext.Provider> element");
    return context;
}
function useDataRouterStateContext() {
    let context = React.useContext(react_router_dom_1.UNSAFE_DataRouterStateContext);
    (0, invariant_1.default)(context, "You must render this element inside a <DataRouterStateContext.Provider> element");
    return context;
}
////////////////////////////////////////////////////////////////////////////////
// RemixContext
exports.RemixContext = React.createContext(undefined);
exports.RemixContext.displayName = "Remix";
function useRemixContext() {
    let context = React.useContext(exports.RemixContext);
    (0, invariant_1.default)(context, "You must render this element inside a <Remix> element");
    return context;
}
////////////////////////////////////////////////////////////////////////////////
// RemixEntry
function RemixEntry(props) {
    return <h1>Not Implemented!</h1>;
}
exports.RemixEntry = RemixEntry;
////////////////////////////////////////////////////////////////////////////////
// RemixRoute
function RemixRoute({ id }) {
    let { routeModules } = useRemixContext();
    (0, invariant_1.default)(routeModules, "Cannot initialize 'routeModules'. This normally occurs when you have server code in your client modules.\n" +
        "Check this link for more details:\nhttps://remix.run/pages/gotchas#server-code-in-client-bundles");
    let { default: Component } = routeModules[id];
    (0, invariant_1.default)(Component, `Route "${id}" has no component! Please go add a \`default\` export in the route module file.\n` +
        "If you were trying to navigate or submit to a resource route, use `<a>` instead of `<Link>` or `<Form reloadDocument>`.");
    return <Component />;
}
exports.RemixRoute = RemixRoute;
function RemixRouteError({ id }) {
    let { routeModules } = useRemixContext();
    // This checks prevent cryptic error messages such as: 'Cannot read properties of undefined (reading 'root')'
    (0, invariant_1.default)(routeModules, "Cannot initialize 'routeModules'. This normally occurs when you have server code in your client modules.\n" +
        "Check this link for more details:\nhttps://remix.run/pages/gotchas#server-code-in-client-bundles");
    let error = (0, react_router_dom_1.useRouteError)();
    let location = (0, react_router_dom_1.useLocation)();
    let { CatchBoundary, ErrorBoundary } = routeModules[id];
    // POC for potential v2 error boundary handling
    // if (future.v2_errorBoundary) {
    //   // Provide defaults for the root route if they are not present
    //   if (id === "root") {
    //     ErrorBoundary ||= RemixRootDefaultNewErrorBoundary;
    //   }
    //   return <ErrorBoundary />
    // }
    // Provide defaults for the root route if they are not present
    if (id === "root") {
        CatchBoundary || (CatchBoundary = errorBoundaries_1.RemixRootDefaultCatchBoundary);
        ErrorBoundary || (ErrorBoundary = errorBoundaries_1.RemixRootDefaultErrorBoundary);
    }
    if ((0, react_router_dom_1.isRouteErrorResponse)(error)) {
        let tError = error;
        if ((tError === null || tError === void 0 ? void 0 : tError.error) instanceof Error &&
            tError.status !== 404 &&
            ErrorBoundary) {
            // Internal framework-thrown ErrorResponses
            return (<errorBoundaries_1.RemixErrorBoundary location={location} component={ErrorBoundary} error={tError.error}/>);
        }
        if (CatchBoundary) {
            // User-thrown ErrorResponses
            return (<errorBoundaries_1.RemixCatchBoundary component={CatchBoundary} catch={error}/>);
        }
    }
    if (error instanceof Error && ErrorBoundary) {
        // User- or framework-thrown Errors
        return (<errorBoundaries_1.RemixErrorBoundary location={location} component={ErrorBoundary} error={error}/>);
    }
    throw error;
}
exports.RemixRouteError = RemixRouteError;
function usePrefetchBehavior(prefetch, theirElementProps) {
    let [maybePrefetch, setMaybePrefetch] = React.useState(false);
    let [shouldPrefetch, setShouldPrefetch] = React.useState(false);
    let { onFocus, onBlur, onMouseEnter, onMouseLeave, onTouchStart } = theirElementProps;
    React.useEffect(() => {
        if (prefetch === "render") {
            setShouldPrefetch(true);
        }
    }, [prefetch]);
    let setIntent = () => {
        if (prefetch === "intent") {
            setMaybePrefetch(true);
        }
    };
    let cancelIntent = () => {
        if (prefetch === "intent") {
            setMaybePrefetch(false);
            setShouldPrefetch(false);
        }
    };
    React.useEffect(() => {
        if (maybePrefetch) {
            let id = setTimeout(() => {
                setShouldPrefetch(true);
            }, 100);
            return () => {
                clearTimeout(id);
            };
        }
    }, [maybePrefetch]);
    return [
        shouldPrefetch,
        {
            onFocus: composeEventHandlers(onFocus, setIntent),
            onBlur: composeEventHandlers(onBlur, cancelIntent),
            onMouseEnter: composeEventHandlers(onMouseEnter, setIntent),
            onMouseLeave: composeEventHandlers(onMouseLeave, cancelIntent),
            onTouchStart: composeEventHandlers(onTouchStart, setIntent),
        },
    ];
}
/**
 * A special kind of `<Link>` that knows whether or not it is "active".
 *
 * @see https://remix.run/components/nav-link
 */
let NavLink = React.forwardRef((_a, forwardedRef) => {
    var { to, prefetch = "none" } = _a, props = __rest(_a, ["to", "prefetch"]);
    let href = (0, react_router_dom_1.useHref)(to);
    let [shouldPrefetch, prefetchHandlers] = usePrefetchBehavior(prefetch, props);
    return (<>
        <react_router_dom_1.NavLink ref={forwardedRef} to={to} {...props} {...prefetchHandlers}/>
        {shouldPrefetch ? <PrefetchPageLinks page={href}/> : null}
      </>);
});
exports.NavLink = NavLink;
NavLink.displayName = "NavLink";
/**
 * This component renders an anchor tag and is the primary way the user will
 * navigate around your website.
 *
 * @see https://remix.run/components/link
 */
let Link = React.forwardRef((_a, forwardedRef) => {
    var { to, prefetch = "none" } = _a, props = __rest(_a, ["to", "prefetch"]);
    let href = (0, react_router_dom_1.useHref)(to);
    let [shouldPrefetch, prefetchHandlers] = usePrefetchBehavior(prefetch, props);
    return (<>
        <react_router_dom_1.Link ref={forwardedRef} to={to} {...props} {...prefetchHandlers}/>
        {shouldPrefetch ? <PrefetchPageLinks page={href}/> : null}
      </>);
});
exports.Link = Link;
Link.displayName = "Link";
function composeEventHandlers(theirHandler, ourHandler) {
    return (event) => {
        theirHandler && theirHandler(event);
        if (!event.defaultPrevented) {
            ourHandler(event);
        }
    };
}
exports.composeEventHandlers = composeEventHandlers;
/**
 * Renders the `<link>` tags for the current routes.
 *
 * @see https://remix.run/components/links
 */
function Links() {
    let { manifest, routeModules } = useRemixContext();
    let { matches } = useDataRouterStateContext();
    let links = React.useMemo(() => (0, links_1.getLinksForMatches)(matches, routeModules, manifest), [matches, routeModules, manifest]);
    return (<>
      {links.map((link) => {
            if ((0, links_1.isPageLinkDescriptor)(link)) {
                return <PrefetchPageLinks key={link.page} {...link}/>;
            }
            let imageSrcSet = null;
            // In React 17, <link imageSrcSet> and <link imageSizes> will warn
            // because the DOM attributes aren't recognized, so users need to pass
            // them in all lowercase to forward the attributes to the node without a
            // warning. Normalize so that either property can be used in Remix.
            if ("useId" in React) {
                if (link.imagesrcset) {
                    link.imageSrcSet = imageSrcSet = link.imagesrcset;
                    delete link.imagesrcset;
                }
                if (link.imagesizes) {
                    link.imageSizes = link.imagesizes;
                    delete link.imagesizes;
                }
            }
            else {
                if (link.imageSrcSet) {
                    link.imagesrcset = imageSrcSet = link.imageSrcSet;
                    delete link.imageSrcSet;
                }
                if (link.imageSizes) {
                    link.imagesizes = link.imageSizes;
                    delete link.imageSizes;
                }
            }
            return (<link key={link.rel + (link.href || "") + (imageSrcSet || "")} {...link}/>);
        })}
    </>);
}
exports.Links = Links;
/**
 * This component renders all of the `<link rel="prefetch">` and
 * `<link rel="modulepreload"/>` tags for all the assets (data, modules, css) of
 * a given page.
 *
 * @param props
 * @param props.page
 * @see https://remix.run/components/prefetch-page-links
 */
function PrefetchPageLinks(_a) {
    var { page } = _a, dataLinkProps = __rest(_a, ["page"]);
    let { router } = useDataRouterContext();
    let matches = React.useMemo(() => (0, react_router_dom_1.matchRoutes)(router.routes, page), [router.routes, page]);
    if (!matches) {
        console.warn(`Tried to prefetch ${page} but no routes matched.`);
        return null;
    }
    return (<PrefetchPageLinksImpl page={page} matches={matches} {...dataLinkProps}/>);
}
exports.PrefetchPageLinks = PrefetchPageLinks;
function usePrefetchedStylesheets(matches) {
    let { manifest, routeModules } = useRemixContext();
    let [styleLinks, setStyleLinks] = React.useState([]);
    React.useEffect(() => {
        let interrupted = false;
        (0, links_1.getStylesheetPrefetchLinks)(matches, manifest, routeModules).then((links) => {
            if (!interrupted)
                setStyleLinks(links);
        });
        return () => {
            interrupted = true;
        };
    }, [matches, manifest, routeModules]);
    return styleLinks;
}
function PrefetchPageLinksImpl(_a) {
    var { page, matches: nextMatches } = _a, linkProps = __rest(_a, ["page", "matches"]);
    let location = (0, react_router_dom_1.useLocation)();
    let { manifest } = useRemixContext();
    let { matches } = useDataRouterStateContext();
    let newMatchesForData = React.useMemo(() => (0, links_1.getNewMatchesForLinks)(page, nextMatches, matches, manifest, location, "data"), [page, nextMatches, matches, manifest, location]);
    let newMatchesForAssets = React.useMemo(() => (0, links_1.getNewMatchesForLinks)(page, nextMatches, matches, manifest, location, "assets"), [page, nextMatches, matches, manifest, location]);
    let dataHrefs = React.useMemo(() => (0, links_1.getDataLinkHrefs)(page, newMatchesForData, manifest), [newMatchesForData, page, manifest]);
    let moduleHrefs = React.useMemo(() => (0, links_1.getModuleLinkHrefs)(newMatchesForAssets, manifest), [newMatchesForAssets, manifest]);
    // needs to be a hook with async behavior because we need the modules, not
    // just the manifest like the other links in here.
    let styleLinks = usePrefetchedStylesheets(newMatchesForAssets);
    return (<>
      {dataHrefs.map((href) => (<link key={href} rel="prefetch" as="fetch" href={href} {...linkProps}/>))}
      {moduleHrefs.map((href) => (<link key={href} rel="modulepreload" href={href} {...linkProps}/>))}
      {styleLinks.map((link) => (
        // these don't spread `linkProps` because they are full link descriptors
        // already with their own props
        <link key={link.href} {...link}/>))}
    </>);
}
/**
 * Renders the `<title>` and `<meta>` tags for the current routes.
 *
 * @see https://remix.run/components/meta
 */
function V1Meta() {
    let { routeModules } = useRemixContext();
    let { matches, loaderData } = useDataRouterStateContext();
    let location = (0, react_router_dom_1.useLocation)();
    let meta = {};
    let parentsData = {};
    for (let match of matches) {
        let routeId = match.route.id;
        let data = loaderData[routeId];
        let params = match.params;
        let routeModule = routeModules[routeId];
        if (routeModule.meta) {
            let routeMeta = typeof routeModule.meta === "function"
                ? routeModule.meta({
                    data,
                    parentsData,
                    params,
                    location,
                    matches: undefined,
                })
                : routeModule.meta;
            if (routeMeta && Array.isArray(routeMeta)) {
                throw new Error("The route at " +
                    match.route.path +
                    " returns an array. This is only supported with the `v2_meta` future flag " +
                    "in the Remix config. Either set the flag to `true` or update the route's " +
                    "meta function to return an object." +
                    "\n\nTo reference the v1 meta function API, see https://remix.run/route/meta"
                // TODO: Add link to the docs once they are written
                // + "\n\nTo reference future flags and the v2 meta API, see https://remix.run/file-conventions/remix-config#future-v2-meta."
                );
            }
            Object.assign(meta, routeMeta);
        }
        parentsData[routeId] = data;
    }
    return (<>
      {Object.entries(meta).map(([name, value]) => {
            if (!value) {
                return null;
            }
            if (["charset", "charSet"].includes(name)) {
                return <meta key="charset" charSet={value}/>;
            }
            if (name === "title") {
                return <title key="title">{String(value)}</title>;
            }
            // Open Graph tags use the `property` attribute, while other meta tags
            // use `name`. See https://ogp.me/
            //
            // Namespaced attributes:
            //  - https://ogp.me/#type_music
            //  - https://ogp.me/#type_video
            //  - https://ogp.me/#type_article
            //  - https://ogp.me/#type_book
            //  - https://ogp.me/#type_profile
            //
            // Facebook specific tags begin with `fb:` and also use the `property`
            // attribute.
            //
            // Twitter specific tags begin with `twitter:` but they use `name`, so
            // they are excluded.
            let isOpenGraphTag = /^(og|music|video|article|book|profile|fb):.+$/.test(name);
            return [value].flat().map((content) => {
                if (isOpenGraphTag) {
                    return (<meta property={name} content={content} key={name + content}/>);
                }
                if (typeof content === "string") {
                    return <meta name={name} content={content} key={name + content}/>;
                }
                return <meta key={name + JSON.stringify(content)} {...content}/>;
            });
        })}
    </>);
}
function V2Meta() {
    let { routeModules } = useRemixContext();
    let { matches, loaderData } = useDataRouterStateContext();
    let location = (0, react_router_dom_1.useLocation)();
    let meta = [];
    let parentsData = {};
    let matchesWithMeta = matches.map((match) => (Object.assign(Object.assign({}, match), { meta: [] })));
    let index = -1;
    for (let match of matches) {
        index++;
        let routeId = match.route.id;
        let data = loaderData[routeId];
        let params = match.params;
        let routeModule = routeModules[routeId];
        let routeMeta = [];
        if (routeModule === null || routeModule === void 0 ? void 0 : routeModule.meta) {
            routeMeta =
                typeof routeModule.meta === "function"
                    ? routeModule.meta({
                        data,
                        parentsData,
                        params,
                        location,
                        matches: matchesWithMeta,
                    })
                    : routeModule.meta;
        }
        routeMeta = routeMeta || [];
        if (!Array.isArray(routeMeta)) {
            throw new Error("The `v2_meta` API is enabled in the Remix config, but the route at " +
                match.route.path +
                " returns an invalid value. In v2, all route meta functions must " +
                "return an array of meta objects." +
                // TODO: Add link to the docs once they are written
                // "\n\nTo reference future flags and the v2 meta API, see https://remix.run/file-conventions/remix-config#future-v2-meta." +
                "\n\nTo reference the v1 meta function API, see https://remix.run/route/meta");
        }
        matchesWithMeta[index].meta = routeMeta;
        meta = routeMeta;
        parentsData[routeId] = data;
    }
    return (<>
      {meta.flat().map((metaProps) => {
            if (!metaProps) {
                return null;
            }
            if ("title" in metaProps) {
                return <title key="title">{String(metaProps.title)}</title>;
            }
            if ("charSet" in metaProps || "charset" in metaProps) {
                // TODO: We normalize this for the user in v1, but should we continue
                // to do that? Seems like a nice convenience IMO.
                return (<meta key="charset" charSet={metaProps.charSet || metaProps.charset}/>);
            }
            return <meta key={JSON.stringify(metaProps)} {...metaProps}/>;
        })}
    </>);
}
function Meta() {
    let { future } = useRemixContext();
    return (future === null || future === void 0 ? void 0 : future.v2_meta) ? <V2Meta /> : <V1Meta />;
}
exports.Meta = Meta;
/**
 * Tracks whether Remix has finished hydrating or not, so scripts can be skipped
 * during client-side updates.
 */
let isHydrated = false;
/**
 * Renders the `<script>` tags needed for the initial render. Bundles for
 * additional routes are loaded later as needed.
 *
 * @param props Additional properties to add to each script tag that is rendered.
 * In addition to scripts, \<link rel="modulepreload"> tags receive the crossOrigin
 * property if provided.
 *
 * @see https://remix.run/components/scripts
 */
function Scripts(props) {
    let { manifest, serverHandoffString } = useRemixContext();
    let { router } = useDataRouterContext();
    let { matches } = useDataRouterStateContext();
    let navigation = (0, react_router_dom_1.useNavigation)();
    React.useEffect(() => {
        isHydrated = true;
    }, []);
    let initialScripts = React.useMemo(() => {
        let contextScript = serverHandoffString
            ? `window.__remixContext = ${serverHandoffString};`
            : "";
        let routeModulesScript = `${matches
            .map((match, index) => `import ${JSON.stringify(manifest.url)};
  import * as route${index} from ${JSON.stringify(manifest.routes[match.route.id].module)};`)
            .join("\n")}
  window.__remixRouteModules = {${matches
            .map((match, index) => `${JSON.stringify(match.route.id)}:route${index}`)
            .join(",")}};
  
  import(${JSON.stringify(manifest.entry.module)});`;
        return (<>
        <script {...props} suppressHydrationWarning dangerouslySetInnerHTML={(0, markup_1.createHtml)(contextScript)} type={undefined}/>
        <script {...props} suppressHydrationWarning dangerouslySetInnerHTML={(0, markup_1.createHtml)(routeModulesScript)} type="module" async/>
      </>);
        // disabled deps array because we are purposefully only rendering this once
        // for hydration, after that we want to just continue rendering the initial
        // scripts as they were when the page first loaded
        // eslint-disable-next-line
    }, []);
    // avoid waterfall when importing the next route module
    let nextMatches = React.useMemo(() => {
        if (navigation.location) {
            // FIXME: can probably use transitionManager `nextMatches`
            let matches = (0, react_router_dom_1.matchRoutes)(router.routes, navigation.location);
            (0, invariant_1.default)(matches, `No routes match path "${navigation.location.pathname}"`);
            return matches;
        }
        return [];
    }, [navigation.location, router.routes]);
    let routePreloads = matches
        .concat(nextMatches)
        .map((match) => {
        let route = manifest.routes[match.route.id];
        return (route.imports || []).concat([route.module]);
    })
        .flat(1);
    let preloads = manifest.entry.imports.concat(routePreloads);
    return (<>
      <link rel="modulepreload" href={manifest.url} crossOrigin={props.crossOrigin}/>
      <link rel="modulepreload" href={manifest.entry.module} crossOrigin={props.crossOrigin}/>
      {dedupe(preloads).map((path) => (<link key={path} rel="modulepreload" href={path} crossOrigin={props.crossOrigin}/>))}
      {isHydrated ? null : initialScripts}
    </>);
}
exports.Scripts = Scripts;
function dedupe(array) {
    return [...new Set(array)];
}
function useMatches() {
    let { routeModules } = useRemixContext();
    let matches = (0, react_router_dom_1.useMatches)();
    return matches.map((match) => {
        let remixMatch = {
            id: match.id,
            pathname: match.pathname,
            params: match.params,
            data: match.data,
            // Need to grab handle here since we don't have it at client-side route
            // creation time
            handle: routeModules[match.id].handle,
        };
        return remixMatch;
    });
}
exports.useMatches = useMatches;
/**
 * Returns the JSON parsed data from the current route's `loader`.
 *
 * @see https://remix.run/hooks/use-loader-data
 */
function useLoaderData() {
    return (0, react_router_dom_1.useLoaderData)();
}
exports.useLoaderData = useLoaderData;
/**
 * Returns the JSON parsed data from the current route's `action`.
 *
 * @see https://remix.run/hooks/use-action-data
 */
function useActionData() {
    return (0, react_router_dom_1.useActionData)();
}
exports.useActionData = useActionData;
/**
 * Returns everything you need to know about a page transition to build pending
 * navigation indicators and optimistic UI on data mutations.
 *
 * @see https://remix.run/hooks/use-transition
 */
function useTransition() {
    let navigation = (0, react_router_dom_1.useNavigation)();
    return React.useMemo(() => convertNavigationToTransition(navigation), [navigation]);
}
exports.useTransition = useTransition;
function convertNavigationToTransition(navigation) {
    let { location, state, formMethod, formAction, formEncType, formData } = navigation;
    if (!location) {
        return transition_1.IDLE_TRANSITION;
    }
    let isActionSubmission = formMethod != null &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(formMethod.toUpperCase());
    if (state === "submitting" &&
        formMethod &&
        formAction &&
        formEncType &&
        formData) {
        if (isActionSubmission) {
            // Actively submitting to an action
            let transition = {
                location,
                state,
                submission: {
                    method: formMethod.toUpperCase(),
                    action: formAction,
                    encType: formEncType,
                    formData: formData,
                    key: "",
                },
                type: "actionSubmission",
            };
            return transition;
        }
        else {
            // @remix-run/router doesn't mark loader submissions as state: "submitting"
            (0, invariant_1.default)(false, "Encountered an unexpected navigation scenario in useTransition()");
        }
    }
    if (state === "loading") {
        let { _isRedirect, _isFetchActionRedirect } = location.state || {};
        if (formMethod && formAction && formEncType && formData) {
            if (!_isRedirect) {
                if (isActionSubmission) {
                    // We're reloading the same location after an action submission
                    let transition = {
                        location,
                        state,
                        submission: {
                            method: formMethod.toUpperCase(),
                            action: formAction,
                            encType: formEncType,
                            formData: formData,
                            key: "",
                        },
                        type: "actionReload",
                    };
                    return transition;
                }
                else {
                    // The new router fixes a bug in useTransition where the submission
                    // "action" represents the request URL not the state of the <form> in
                    // the DOM.  Back-port it here to maintain behavior, but useNavigation
                    // will fix this bug.
                    let url = new URL(formAction, window.location.origin);
                    // This typing override should be safe since this is only running for
                    // GET submissions and over in @remix-run/router we have an invariant
                    // if you have any non-string values in your FormData when we attempt
                    // to convert them to URLSearchParams
                    url.search = new URLSearchParams(formData.entries()).toString();
                    // Actively "submitting" to a loader
                    let transition = {
                        location,
                        state: "submitting",
                        submission: {
                            method: formMethod.toUpperCase(),
                            action: url.pathname + url.search,
                            encType: formEncType,
                            formData: formData,
                            key: "",
                        },
                        type: "loaderSubmission",
                    };
                    return transition;
                }
            }
            else {
                // Redirecting after a submission
                if (isActionSubmission) {
                    let transition = {
                        location,
                        state,
                        submission: {
                            method: formMethod.toUpperCase(),
                            action: formAction,
                            encType: formEncType,
                            formData: formData,
                            key: "",
                        },
                        type: "actionRedirect",
                    };
                    return transition;
                }
                else {
                    let transition = {
                        location,
                        state,
                        submission: {
                            method: formMethod.toUpperCase(),
                            action: formAction,
                            encType: formEncType,
                            formData: formData,
                            key: "",
                        },
                        type: "loaderSubmissionRedirect",
                    };
                    return transition;
                }
            }
        }
        else if (_isRedirect) {
            if (_isFetchActionRedirect) {
                let transition = {
                    location,
                    state,
                    submission: undefined,
                    type: "fetchActionRedirect",
                };
                return transition;
            }
            else {
                let transition = {
                    location,
                    state,
                    submission: undefined,
                    type: "normalRedirect",
                };
                return transition;
            }
        }
    }
    // If no scenarios above match, then it's a normal load!
    let transition = {
        location,
        state: "loading",
        submission: undefined,
        type: "normalLoad",
    };
    return transition;
}
/**
 * Provides all fetchers currently on the page. Useful for layouts and parent
 * routes that need to provide pending/optimistic UI regarding the fetch.
 *
 * @see https://remix.run/api/remix#usefetchers
 */
function useFetchers() {
    let fetchers = (0, react_router_dom_1.useFetchers)();
    return fetchers.map((f) => convertRouterFetcherToRemixFetcher({
        state: f.state,
        data: f.data,
        formMethod: f.formMethod,
        formAction: f.formAction,
        formData: f.formData,
        formEncType: f.formEncType,
        " _hasFetcherDoneAnything ": f[" _hasFetcherDoneAnything "],
    }));
}
exports.useFetchers = useFetchers;
/**
 * Interacts with route loaders and actions without causing a navigation. Great
 * for any interaction that stays on the same page.
 *
 * @see https://remix.run/hooks/use-fetcher
 */
function useFetcher() {
    let fetcherRR = (0, react_router_dom_1.useFetcher)();
    let remixFetcher = convertRouterFetcherToRemixFetcher({
        state: fetcherRR.state,
        data: fetcherRR.data,
        formMethod: fetcherRR.formMethod,
        formAction: fetcherRR.formAction,
        formData: fetcherRR.formData,
        formEncType: fetcherRR.formEncType,
        " _hasFetcherDoneAnything ": fetcherRR[" _hasFetcherDoneAnything "],
    });
    return Object.assign(Object.assign({}, remixFetcher), { load: fetcherRR.load, submit: fetcherRR.submit, Form: fetcherRR.Form });
}
exports.useFetcher = useFetcher;
function convertRouterFetcherToRemixFetcher(fetcherRR) {
    let { state, formMethod, formAction, formEncType, formData, data } = fetcherRR;
    let isActionSubmission = formMethod != null &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(formMethod.toUpperCase());
    if (state === "idle") {
        if (fetcherRR[" _hasFetcherDoneAnything "] === true) {
            let fetcher = {
                state: "idle",
                type: "done",
                submission: undefined,
                data,
            };
            return fetcher;
        }
        else {
            let fetcher = transition_1.IDLE_FETCHER;
            return fetcher;
        }
    }
    if (state === "submitting" &&
        formMethod &&
        formAction &&
        formEncType &&
        formData) {
        if (isActionSubmission) {
            // Actively submitting to an action
            let fetcher = {
                state,
                type: "actionSubmission",
                formMethod: formMethod.toUpperCase(),
                formAction: formAction,
                formEncType: formEncType,
                formData: formData,
                submission: {
                    method: formMethod.toUpperCase(),
                    action: formAction,
                    encType: formEncType,
                    formData: formData,
                    key: "",
                },
                data: undefined,
            };
            return fetcher;
        }
        else {
            // @remix-run/router doesn't mark loader submissions as state: "submitting"
            (0, invariant_1.default)(false, "Encountered an unexpected fetcher scenario in useFetcher()");
        }
    }
    if (state === "loading") {
        if (formMethod && formAction && formEncType && formData) {
            if (isActionSubmission) {
                if (data) {
                    // In a loading state but we have data - must be an actionReload
                    let fetcher = {
                        state,
                        type: "actionReload",
                        formMethod: formMethod.toUpperCase(),
                        formAction: formAction,
                        formEncType: formEncType,
                        formData: formData,
                        submission: {
                            method: formMethod.toUpperCase(),
                            action: formAction,
                            encType: formEncType,
                            formData: formData,
                            key: "",
                        },
                        data,
                    };
                    return fetcher;
                }
                else {
                    let fetcher = {
                        state,
                        type: "actionRedirect",
                        formMethod: formMethod.toUpperCase(),
                        formAction: formAction,
                        formEncType: formEncType,
                        formData: formData,
                        submission: {
                            method: formMethod.toUpperCase(),
                            action: formAction,
                            encType: formEncType,
                            formData: formData,
                            key: "",
                        },
                        data: undefined,
                    };
                    return fetcher;
                }
            }
            else {
                // The new router fixes a bug in useTransition where the submission
                // "action" represents the request URL not the state of the <form> in
                // the DOM.  Back-port it here to maintain behavior, but useNavigation
                // will fix this bug.
                let url = new URL(formAction, window.location.origin);
                // This typing override should be safe since this is only running for
                // GET submissions and over in @remix-run/router we have an invariant
                // if you have any non-string values in your FormData when we attempt
                // to convert them to URLSearchParams
                url.search = new URLSearchParams(formData.entries()).toString();
                // Actively "submitting" to a loader
                let fetcher = {
                    state: "submitting",
                    type: "loaderSubmission",
                    formMethod: formMethod.toUpperCase(),
                    formAction: formAction,
                    formEncType: formEncType,
                    formData: formData,
                    submission: {
                        method: formMethod.toUpperCase(),
                        action: url.pathname + url.search,
                        encType: formEncType,
                        formData: formData,
                        key: "",
                    },
                    data: undefined,
                };
                return fetcher;
            }
        }
    }
    // If all else fails, it's a normal load!
    let fetcher = {
        state: "loading",
        type: "normalLoad",
        submission: undefined,
        data: undefined,
    };
    return fetcher;
}
// Dead Code Elimination magic for production builds.
// This way devs don't have to worry about doing the NODE_ENV check themselves.
// If running an un-bundled server outside of `remix dev` you will still need
// to set the REMIX_DEV_SERVER_WS_PORT manually.
exports.LiveReload = process.env.NODE_ENV !== "development"
    ? () => null
    : function LiveReload({ port = Number(process.env.REMIX_DEV_SERVER_WS_PORT || 8002), nonce = undefined, }) {
        let js = String.raw;
        return (<script nonce={nonce} suppressHydrationWarning dangerouslySetInnerHTML={{
                __html: js `
                  function remixLiveReloadConnect(config) {
                    let protocol = location.protocol === "https:" ? "wss:" : "ws:";
                    let host = location.hostname;
                    let socketPath = protocol + "//" + host + ":" + ${String(port)} + "/socket";
                    let ws;
                    if(host.includes(".gitpod.io")){
                      socketPath = protocol + "//" + host.replace("3000",${port}) + "/socket";
                      ws = new WebSocket(socketPath);
                    } else {
                      ws = new WebSocket(socketPath);
                    }                    
                    ws.onmessage = (message) => {
                      let event = JSON.parse(message.data);
                      if (event.type === "LOG") {
                        console.log(event.message);
                      }
                      if (event.type === "RELOAD") {
                        console.log("💿 Reloading window ...");
                        window.location.reload();
                      }
                    };
                    ws.onopen = () => {
                      if (config && typeof config.onOpen === "function") {
                        config.onOpen();
                      }
                    };
                    ws.onclose = (event) => {
                      if (event.code === 1006) {
                        console.log("Remix dev asset server web socket closed. Reconnecting...");
                        setTimeout(
                          () =>
                            remixLiveReloadConnect({
                              onOpen: () => window.location.reload(),
                            }),
                          1000
                        );
                      }
                    };
                    ws.onerror = (error) => {
                      console.log("Remix dev asset server web socket error:");
                      console.error(error);
                    };
                  }
                  remixLiveReloadConnect();
                `,
            }}/>);
    };
//# sourceMappingURL=LiveReload.js.map