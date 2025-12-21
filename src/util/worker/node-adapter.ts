/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * https://github.com/GoogleChromeLabs/comlink/blob/main/src/node-adapter.ts
 */

import { Endpoint } from "comlink";

type NodeMessageEvent = { data: unknown };
type EventListenerLike = ((event: NodeMessageEvent) => void) | { handleEvent(event: NodeMessageEvent): void };

export interface NodeEndpoint {
    postMessage(message: unknown, transfer?: any[]): void;
    on(type: string, listener: (value: unknown) => void, options?: unknown): void;
    off(type: string, listener: (value: unknown) => void, options?: unknown): void;
    start?(): void;
}

export default function nodeEndpoint(nep: NodeEndpoint): Endpoint {
    const listeners = new WeakMap<EventListenerLike, (value: unknown) => void>();
    return {
        postMessage: nep.postMessage.bind(nep),
        addEventListener: (_, eh: EventListenerLike) => {
            const wrapped = (value: unknown) => {
                const event: NodeMessageEvent = { data: value };
                if (typeof eh === "function") {
                    eh(event);
                } else {
                    eh.handleEvent(event);
                }
            };
            nep.on("message", wrapped);
            listeners.set(eh, wrapped);
        },
        removeEventListener: (_, eh: EventListenerLike) => {
            const wrapped = listeners.get(eh);
            if (!wrapped) {
                return;
            }
            nep.off("message", wrapped);
            listeners.delete(eh);
        },
        start: nep.start && nep.start.bind(nep),
    } as Endpoint;
}
