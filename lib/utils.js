function safeExec(fn, logger) {
  try {
    return fn();
  } catch (err) {
    logger.error(err);
  }
}

module.exports = {
  safeExec
}
