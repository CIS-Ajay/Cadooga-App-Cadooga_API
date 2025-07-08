// queues/djangoQueue.js
const Queue = require('bull');
const { forwardToDjango } = require('../services/djangoService');
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6380";

const djangoQueue = new Queue('djangoQueue', REDIS_URL);

djangoQueue.process(async (job) => {
  const { endpoint, method, headers = {}, ...data } = job.data;
  const id = data.id || "<unknown>";
  console.log("Retrying Django sync for user ID:", id);

  try {
    await forwardToDjango({
      endpoint,
      method,
      data,
      headers
    });
    console.log("Django sync successful for user ID:", job.data.id);
    return;
  } catch (err) {
    console.error("Django retry failed:", err.message);
    throw new Error("Django sync failed again");
  }
});


module.exports = djangoQueue;
