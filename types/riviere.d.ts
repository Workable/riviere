export function riviere(options?: {
  color?: boolean,
  styles?: Array<string>,
  adapter?: any,
  context?: (ctx: any) => any,
  errors?: {
    callback: (ctx: any, error: Error) => any
  },
  health?: Array<{path: string; method: string; }>,
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
    maxBodyValueChars?: number
  },
  bodyKeys?: Array<string>,
  bodyKeysRegex?: RegExp,
  headersRegex?: RegExp,
  traceHeaderName?: string,
  forceIds?: boolean
}): any;
