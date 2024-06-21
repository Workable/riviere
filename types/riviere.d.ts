export function riviere(options?: {
  color?: boolean,
  styles?: Array<string>,
  adapter?: any,
  context?: (ctx: any) => any,
  errors?: {
    callback: (ctx: any, error: Error) => any
  },
  health?: Array<{ path: string; method: string; }>,
  logger?: {
    info: any,
    error: any
  },
  inbound?: {
    enabled: boolean,
    request?: {
      enabled: boolean
    },
    level: string,
    maxBodyValueChars?: number
  },
  outbound?: {
    enabled: boolean,
    level: string,
    https?: boolean,
    maxBodyValueChars?: number,
    blacklistedPathRegex?: RegExp
  },
  bodyKeys?: Array<string>,
  bodyKeysRegex?: RegExp,
  bodyKeysCallback?: (body: any, ctx?: any) => any,
  headersRegex?: RegExp,
  headerValueCallback?: (key: string, value: any) => any,
  hostFieldName?: string,
  traceHeaderName?: string,
  forceIds?: boolean
}): any;
