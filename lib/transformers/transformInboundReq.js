const flat = require('flat');
const lodash = require('lodash');

const constants = require('../constants');

function isHealthEndpoint(ctx, healthConfig) {
    if (healthConfig) {
        const method = ctx.request.method;
        for (let i = 0; i < healthConfig.length; i++) {
            const h = healthConfig[i];
            if (ctx.request.path === h.path && method === h.method.toUpperCase()) return true;
        }
    }
    return false;
} // todo refactor

module.exports = ({ ctx, health, bodyKeys, headersRegex }) => {
    const method = ctx.request.method;

    if (isHealthEndpoint(ctx,  health)) {
        return Object.assign({}, ctx.logCtx, { log_tag: constants.CATEGORY.INBOUND_REQUEST_HEALTH.TAG });
    }

    // pick body
    let metaBody;
    if (method === 'POST' && bodyKeys) {
        const picked = lodash.pick(ctx.request.body, bodyKeys);
        if (Object.keys(picked).length) {
            metaBody = flat({body: picked}, {safe: true});
        }
    }

    // pick headers
    let metaHeaders = {};
    if (headersRegex) {
        Object.keys(ctx.request.headers).forEach(header => {
            if (headersRegex.test(header)) {
                metaHeaders[header] = ctx.request.headers[header];
            }
        });
        if (Object.keys(metaHeaders).length) {
            metaHeaders = flat({headers: metaHeaders});
        }
    }

    const meta = {};
    if (Object.keys(metaHeaders).length) {
        meta.metaHeaders = metaHeaders;
    }
    if (metaBody) {
        meta.metaBody = metaBody;
    }
    return Object.assign(
        {},
        ctx.logCtx,
        meta,
        {
            log_tag: constants.CATEGORY.INBOUND_REQUEST.TAG
        }
    );
};
