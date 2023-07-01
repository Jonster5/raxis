import { Component, type ECS, Entity } from '..';
export type SocketData<T = any> = {
    type: string;
    body: T;
};
export declare class SocketManager extends Component {
    sockets: Map<string, Socket>;
    constructor(sockets?: Map<string, Socket>);
    onDestroy(): void;
}
export declare class Socket {
    connection: WebSocket;
    url: string;
    constructor(url: string);
    isOpen(): boolean;
    send(type: string, data: string): void;
    close(code?: number, reason?: string): void;
    onOpen(cb: (socket: this) => void): this;
    onMessage(cb: (data: SocketData, socket: this) => void): this;
    onClose(cb: (reason: string, clean: boolean, socket: this) => void): this;
    onerror(cb: (socket: this) => void): this;
}
export declare function addSocket(e: Entity, label: string, socket: Socket): Socket | undefined;
export declare function getSocket(e: Entity, label: string): Socket | undefined;
export declare function removeSocket(e: Entity, label: string): void;
export declare function SocketPlugin(ecs: ECS): void;
