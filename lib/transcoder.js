// Simulated worker function:
// The worker function is meant to be non-blocking. It starts a long-
// running process which may take longer than the default 10-sec acknowledge deadline.
let isProcessed = false;

const worker = async message => {
  console.log(`Processing "${message.message.data}"...`);

  return new Promise(w =>
    setTimeout(w => {
      console.log(`Finished processing "${message.message.data}".`);
      isProcessed = true;
    }, 1000)
  );
};

module.exports = {
  worker
};
