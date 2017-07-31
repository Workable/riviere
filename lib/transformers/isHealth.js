module.exports = (ctx, healthConfig) => {
  if (healthConfig) {
    const method = ctx.request.method;
    for (let i = 0; i < healthConfig.length; i++) {
      const h = healthConfig[i];
      if (ctx.request.path === h.path && method === h.method.toUpperCase()) return true;
    }
  }
  return false;
};
