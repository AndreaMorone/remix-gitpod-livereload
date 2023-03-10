"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveReload = void 0;
const React = require("react");
exports.LiveReload = process.env.NODE_ENV !== "development"
    ? () => null
    : function LiveReload({ port = Number(process.env.REMIX_DEV_SERVER_WS_PORT || 8002), }) {
        let js = String.raw;
        return (React.createElement("script", { suppressHydrationWarning: true, dangerouslySetInnerHTML: {
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
            } }));
    };
