/* 
Ok, so I am trying to make sense of this issue because in this thread there is a mixture of different issues and there are also false expectations of some apis. I will try to clarify:
  - queue.empty empties the "queue", meaning that all jobs that are waiting to be processed are discarded, maybe the name is not a very good one, but that is that it does. It is not a wipe all kind of thing.
  - queue.clean removes jobs from a given "status", for example you can remove all the jobs that are completed, failed, delayed, etc. It would be possible to implement empty with clean by calling clean several times on the "status" a job can be when waiting to be processed, such as "wait", "paused", "delayed", "priority".
  - Finally, repeatable jobs are a special type of job that creates an entry in the "repeat" zset. As long as an entry representing a given repeatable job is in this set, the job will repeat according to its cron values, so in order to remove it you need to use the queue.removeRepeatable method, as stated in the documentation.

If the same repeatable job is added several times it should result in a noop, otherwise it is a bug. In the version of bull at the time of this writing (3.4.7) there is no know issue regarding removing repeatable jobs.

I am willing to improve the empty and clean functionalities, it would require a major version though.

I will close this thread for now and if based on the information above you find an inconsistent behaviour please open a new issue and I will work on it as soon as possible.
*/

const Queue = require('bull');

/* Util methods to "clean" queue */
const getKeys = async q => {
  const multi = q.multi();
  multi.keys('*');
  const keys = await multi.exec();
  return keys[0][1];
};

const filterQueueKeys = (q, keys) => {
  const prefix = `${q.keyPrefix}:${q.name}`;
  return keys.filter(k => k.includes(prefix));
};

const deleteKeys = async (q, keys) => {
  const multi = q.multi();
  keys.forEach(k => multi.del(k));
  await multi.exec();
};

const emptyQueue = async q => {
  const keys = await getKeys(q);
  const queueKeys = filterQueueKeys(q, keys);
  await deleteKeys(q, queueKeys);
};

/* Using queue */
const queue = new Queue('hello');

emptyQueue(queue).then(() => {
  queue.process(function(job, done) {
    console.log('[job.id]', job.id);
    console.log('[job.data]', job.data);
    done();
  });

  queue.add({ imos: [1, 2, 3] });
  queue.add({ imos: [4, 5, 6] });

  // Close queue
  setTimeout(() => {
    queue.close();
  }, 1000);
});
