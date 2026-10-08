import type { IncomingMessage, ServerResponse } from 'http';

export interface ApiRequest extends IncomingMessage {
  query?: Record<string, string | string[] | undefined>;
  body?: any;
  cookies?: Record<string, string>;
  socket: any;
  customFetch?: typeof fetch;
  pollIntervalMs?: number;
  maxPollAttempts?: number;
  [key: string]: any;
}

export interface ApiResponse extends ServerResponse {
  status(statusCode: number): this;
  json(body: unknown): this;
  send(body?: unknown): this;
}

export type ApiHandler = (req: ApiRequest, res: ApiResponse) => Promise<unknown> | unknown;
