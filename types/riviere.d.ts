export function middleware(options?: {
  color?: boolean,
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
    level: string
  },
  outbound?: {
    enabled: boolean,
    level: string,
    https?: boolean
  },
  bodyKeys?: Array<string>,
  headersRegex?: RegExp,
  traceHeaderName?: string,
  forceIds?: boolean
}): any;
