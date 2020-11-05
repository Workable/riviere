const defaultsDeep = require('lodash/defaultsDeep');
const Counter = require('passthrough-counter');
const Loggable = require('./lib/loggable');
const defaultOptions = require('./lib/options');
const utils = require('./lib/utils');
const httpProxy = require('./lib/proxies/http').proxy;
const httpsProxy = require('./lib/proxies/https').proxy;

const { EVENT } = Loggable;

function buildRiviere(options = {}) {
  const { errors = {}, logger, inbound, outbound, traceHeaderName, headersRegex } = defaultsDeep(
    options,
    defaultOptions(options)
  );

  const loggable = new Loggable(options);

  if (outbound.enabled) {
    const handler = options.adapter.requestProxy({
      level: outbound.level,
      logger,
      traceHeaderName,
      opts: {
        headersRegex,
        bodyKeys: options.bodyKeys,
        bodyKeysRegex: options.bodyKeysRegex,
        bodyValuesMaxLength: options.bodyValuesMaxLength,
        ...outbound
      }
    });
    httpProxy(handler);

    if (outbound.https) {
      httpsProxy(handler);
    }
  }

  return async function riviere(ctx, next) {
    ctx.state.riviereStartedAt = new Date().getTime();

    if (inbound.enabled && inbound.request.enabled) {
      utils.safeExec(() => loggable.emit(EVENT.INBOUND_REQUEST, { ctx }), logger);
    }

    try {
      await next();
    } catch (err) {
      if (errors.enabled) {
        utils.safeExec(() => loggable.emit(EVENT.UNEXPECTED_ERROR, { ctx, err }), logger);
      }

      if (typeof errors.callback === 'function') {
        await errors.callback(err, ctx);
      }
    } finally {
      if (inbound.enabled) {
        const length = ctx.response.length;
        let counter;

        if (!length && ctx.body && ctx.body.readable) {
          ctx.body = ctx.body.pipe((counter = Counter())).on('error', ctx.onerror);
        }

        const res = ctx.res;
        res.once('finish', responseFinished);
        res.once('close', responseFinished);

        function responseFinished(event) {
          res.removeListener('finish', responseFinished);
          res.removeListener('close', responseFinished);
          ctx.state.calculatedContentLength = counter ? counter.length : length;

          //Fire event to write log
          utils.safeExec(() => loggable.emit(EVENT.OUTBOUND_RESPONSE, { ctx }), logger);
        }
      }
    }
  };
}

buildRiviere.riviere = buildRiviere;

module.exports = buildRiviere;
