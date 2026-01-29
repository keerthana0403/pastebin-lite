export function getNow(req) {
    if (process.env.TEST_MODE === "1") {
      const testNow = req.headers["x-test-now-ms"];
      if (testNow) {
        const parsed = Number(testNow);
        if (!Number.isNaN(parsed)) return parsed;
      }
    }
    return Date.now();
  }
  