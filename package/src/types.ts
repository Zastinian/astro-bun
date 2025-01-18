interface OptionsSchema {
  assets: string;
  client: string;
  host: string | boolean;
  port: number;
  server: string;
  cluster?: UserOptions["cluster"];
  reusePort?: UserOptions["reusePort"];
  tls?: UserOptions["tls"];
  lowMemoryMode?: UserOptions["lowMemoryMode"];
  idleTimeout?: UserOptions["idleTimeout"];
  maxRequestBodySize?: UserOptions["maxRequestBodySize"];
}

export type Options = OptionsSchema;

export interface BunSSROptions {
  clientAddress: string;
}

export interface UserOptions {
  /**
   * Enables clustering, which allows the server to utilize multiple CPU cores.
   * When enabled, the server will spawn multiple worker processes to handle requests.
   *
   * @default false
   */
  cluster?: boolean;

  /**
   * Specifies whether to reuse the port. This is useful for avoiding "address in use" errors
   * when restarting the server quickly. This option is ignored when using clustering or when
   * the host is a Unix socket.
   *
   * @default false
   */
  reusePort?: boolean;

  /**
   * Specifies the TLS certificate and key paths for enabling HTTPS.
   * - `certPath`: The path to the TLS certificate file.
   * - `keyPath`: The path to the TLS private key file.
   *
   * If not provided, the server will run without TLS (HTTP).
   */
  tls?: {
    certPath: string;
    keyPath: string;
  };

  /**
   * Enables low memory mode, which reduces memory usage at the cost of performance.
   * This is useful for environments with limited memory resources.
   *
   * @default false
   */
  lowMemoryMode?: boolean;

  /**
   * Specifies the idle timeout in seconds. This is the maximum time (in seconds) that
   * a connection can remain idle before being closed. This option is ignored when the
   * host is a Unix socket.
   *
   * @default 10 // 10 seconds
   */
  idleTimeout?: number;

  /**
   * Specifies the maximum allowed size (in bytes) for request bodies. Requests with
   * bodies larger than this limit will be rejected. This helps prevent memory exhaustion
   * from large uploads or payloads.
   *
   * @default "1024 * 1024 * 128" // 128MB
   */
  maxRequestBodySize?: number;
}
