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
   * Enables clustering.
   *
   * This option is only available when using Bun's built-in clustering.
   *
   * @default false
   */
  cluster?: boolean;
  /**
   * Specifies whether to reuse the port.
   *
   * This option is only available when using Bun's built-in clustering.
   *
   * This option is ignored when using clustering or when the host is a unix socket.
   *
   * @default false
   */
  reusePort?: boolean;
  /**
   * Specifies the tls certificate and key paths.
   *
   * - 'certPath' - The path to the certificate file.
   * - 'keyPath' - The path to the key file.
   */
  tls?: {
    certPath: string;
    keyPath: string;
  };
  /**
   * Specifies whether to enable low memory mode.
   *
   * This option is only available when using Bun's built-in clustering.
   *
   * @default false
   */
  lowMemoryMode?: boolean;
  /**
   * Specifies the idle timeout in milliseconds.
   *
   * This option is only available when using Bun's built-in clustering.
   *
   * @default 10 // 10 seconds
   */
  idleTimeout?: number;
  /**
   * Specifies the maximum request body size in bytes.
   *
   * This option is only available when using Bun's built-in clustering.
   *
   * @default "1024 * 1024 * 128" // 128MB
   */
  maxRequestBodySize?: number;
}
