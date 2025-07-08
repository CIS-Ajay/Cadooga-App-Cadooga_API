// services/enqueueDjangoSync.js

const djangoQueue = require("../queues/djangoQueue");

const enqueueDjangoSync = async ({ jobIdPrefix, payload }) => {
  const jobId = `${jobIdPrefix}-${payload.id}`;

  await djangoQueue.add(payload, {
    attempts: 1000000, // retry indefinitely (approx 170 days)
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    jobId,
  });
};

module.exports = { enqueueDjangoSync };
