const constants = require('../constants');

module.exports = ({ ctx, err }) => {
  err.action = `${ctx.logCtx.method}${ctx.request.path}`;
  err.params = {
    query: ctx.request.query,
    body: ctx.request.body,
    log_tag: constants.CATEGORY.UNEXPECTED_ERROR.TAG
  };
  err.context = Object.assign(err.context || {}, ctx.logCtx);
  return err;
};
