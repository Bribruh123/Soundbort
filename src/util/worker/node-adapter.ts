/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * https://github.com/GoogleChromeLabs/comlink/blob/main/src/node-adapter.ts
 */

import { Endpoint } from "comlink";

type NodeMessageEvent = { data: unknown };
type NodeEventListener = ((event: NodeMessageEvent) => void) | { handleEvent(event: NodeMessageEvent): void };

export interface NodeEndpoint {
    postMessage(message: any, transfer?: any[]): void;
    on(
        type: string,
        listener: NodeEventListener,
        options?: unknown
    ): void;
    off(
        type: string,
        listener: NodeEventListener,
        options?: unknown
    ): void;
    start?(): void;
}

function isListenerObject(listener: NodeEventListener): listener is { handleEvent(event: NodeMessageEvent): void } {
    return typeof listener === "object" && listener !== null && "handleEvent" in listener;
}

export default function nodeEndpoint(nep: NodeEndpoint): Endpoint {
    const listeners = new WeakMap<NodeEventListener, (data: unknown) => void>();
    return {
        postMessage: nep.postMessage.bind(nep),
        addEventListener: (_, eh) => {
            const l = (data: any) => {
                if (isListenerObject(eh)) {
                    eh.handleEvent({ data } as NodeMessageEvent);
                } else {
                    eh({ data } as NodeMessageEvent);
                }
            };
            nep.on("message", l);
            listeners.set(eh, l);
        },
        removeEventListener: (_, eh) => {
            const l = listeners.get(eh);
            if (!l) {
                return;
            }
            nep.off("message", l);
            listeners.delete(eh);
        },
        start: nep.start && nep.start.bind(nep),
    };
}
