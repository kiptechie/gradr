// NOTE: This script does not save the actual event timestamps, because GA ignores events if they are older than a few hours.

const GARelay = {
  resendInterval: false,
  blocked: false,
  // Play with these two values to change behaviour of resending cached events.
  // Just sending 1 request at a time with 1s Timeout seemed to give the least ignored events
  NUM_SENT_PER_BATCH: 1,
  BATCH_TIMEOUT: 1000,
  RETRY_INTERVAL: 5000,

  ga () {
    if (navigator.onLine) {
      ga(...arguments);
    } else {
      this.cache([...arguments]);
    }
  },

  cache (args) {
    const gaCache = this.getCache();
    gaCache.push({
      args,
      timeStamp: Date.now()
    });
    this.setCache(gaCache);
    this.setResendInterval();
  },

  tryResend () {
    if (!navigator.onLine || this.blocked) return;

    const self = this;
    const gaCache = this.getCache();
    for (let i = 0; i < gaCache.length; i += 1) {
      const req = gaCache.pop();
      self.ga(...req.args);

      if (this.NUM_SENT_PER_BATCH - 1 === i) {
        this.setCache(gaCache);
        self.blocked = true;
        this.setResendInterval();
        setTimeout(() => {
          self.blocked = false;
        }, this.BATCH_TIMEOUT);
        return;
      }
    }
    this.setCache([]);
    this.clearResendInterval();
  },

  setResendInterval () {
    if (this.resendInterval) return;
    const self = this;
    this.resendInterval = setInterval(() => {
      self.tryResend(); 
    }, this.RETRY_INTERVAL);
  },

  clearResendInterval () {
    if (this.resendInterval !== false) {
      clearInterval(this.resendInterval);
      this.resendInterval = false;
    }
  },

  getCache () {
    try {
      return JSON.parse(localStorage.getItem('gaCache')) || [];
    } catch (err) {
      return [];
    }
  },

  setCache (val) {
    try {
      localStorage.setItem('gaCache', JSON.stringify(val));
    } catch (error) {
      console.warn(error.message);
    }
  }
};

export default GARelay;
