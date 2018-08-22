export as namespace RsupMQTT

export enum ERROR{
  OK = 0,
  CONNECT_TIMEOUT = 1,
  SUBSCRIBE_TIMEOUT = 2,
  UNSUBSCRIBE_TIMEOUT = 3,
  PING_TIMEOUT = 4,
  INTERNAL_ERROR = 5,
  CONNACK_RETURNCODE = 6,
  SOCKET_ERROR = 7,
  SOCKET_CLOSE = 8,
  MALFORMED_UTF = 9,
  UNSUPPORTED = 10,
  INVALID_STATE = 11,
  INVALID_TYPE = 12,
  INVALID_ARGUMENT = 13,
  UNSUPPORTED_OPERATION = 14,
  INVALID_STORED_DATA = 15,
  INVALID_MQTT_MESSAGE_TYPE = 16,
  MALFORMED_UNICODE = 17,
  BUFFER_FULL = 18
}

interface ClientSetting {paho: object, pahoOpts: object}
type ClientConstructor<T extends Client> = {new(setting: ClientSetting): T}
type ClientFactory<T extends Client> = (setting: ClientSetting) => T

interface ConnectOptions{
  host: string, 
  port?: number,
  path?: string,
  ssl?: boolean,
  clientId?: string,
  keepalive?: number,
  username?: string,
  password?: string,
  will?: MessagePayload,
  cleanSession?: boolean,
  reconnect? :boolean
  mqttVersion? : number,
  mqttVersionExplicit?: boolean
}

export function connect<T extends Client>(
  opts: ConnectOptions | string, 
  Ctor?: ClientConstructor<T> | ClientFactory<T>): Promise<T>
  
declare class Message{
  readonly topic: string
  readonly json: object | void
  readonly string: string
  readonly bytes: MessageBytes
  readonly qos: 0 | 1 | 2
  readonly dup: boolean
  readonly retain: boolean
}

type MessageBytes = ArrayBufferView | ArrayBuffer | Buffer
type MessageListener = (message: Message) => void
type TopicMessageListener = (topic: string, message: Message) => void
type ErrorListener = (err: ClientError) => void
type MessagePayload = object | string | MessageBytes
interface MessageOptions { qos?: 0 | 1 | 2, retain?: boolean }

declare class ClientError extends Error{
  readonly code: number
  readonly message: string
  is(ERROR): boolean
  occurred(): boolean
}

export class Client{
  constructor(setting: ClientSetting)
  readonly host: string
  readonly port: number
  readonly path: string
  readonly uri: string
  readonly clientId: string
  isConnected(): boolean
  on(eventName: 'message' | 'sent', listener: TopicMessageListener): void
  on(eventName: 'close' | 'reconnect' | 'error', listener: ErrorListener): void
  once(eventName: 'message' | 'sent', listener: TopicMessageListener): void
  once(eventName: 'close' | 'reconnect' | 'error', listener: ErrorListener): void
  off(eventName: 'message' | 'sent', listener: TopicMessageListener): void
  off(eventName: 'close' | 'reconnect' | 'error', listener: ErrorListener): void
  onMessage(topic: string, listener: MessageListener): void
  onSent(topic: string, listener: MessageListener): void
  removeMessageListener(topic: string, listener?: MessageListener): void
  subscribe(topic: string): Subscription
  unsubscribe(topic: string, removeListeners?: boolean): void
  subscribed(): string[]
  send(topic: string, payload: MessagePayload, opts?: MessageOptions): void
  publish(topic: string, payload: MessagePayload, opts?: MessageOptions): void
  disconnect(): void
  reconnect(): Promise<void>
}

declare class Subscription{
  readonly topic: string
  on (listener: MessageListener): this
  once (listener: MessageListener): this
  off (listener?: MessageListener): this
  unsubscribe(removeListeners?: boolean): this
  send(payload: MessagePayload, opts?: MessageOptions): this
  publish(payload: MessagePayload, opts?: MessageOptions): this
}
