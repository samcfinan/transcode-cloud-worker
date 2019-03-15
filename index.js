const pubsub = require('@google-cloud/pubsub');

const client = new pubsub.v1.SubscriberClient();
// process.env.GOOGLE_APPLICATION_CREDENTIALS="./transcode-cloud-service-account.json"

const projectName = process.env.PROJECT_NAME;
const subscriptionName = process.env.SUBSCRIPTION;

const formattedSubscription = client.subscriptionPath(
  projectName,
  subscriptionName
);

// The maximum number of messages returned for this request.
// Pub/Sub may return fewer than the number specified.
const maxMessages = 1;
const newAckDeadlineSeconds = 10;
const request = {
  subscription: formattedSubscription,
  maxMessages: maxMessages,
};

// Simulated worker function:
// The worker function is meant to be non-blocking. It starts a long-
// running process, such as writing the message to a table, which may
// take longer than the default 10-sec acknowledge deadline.
let isProcessed = false;

const worker = async (message) => {
  console.log(`Processing "${message.message.data}"...`);
  
  return new Promise(w => setTimeout(w => {
    console.log(`Finished processing "${message.message.data}".`);
    isProcessed = true;
  }, 5000));
}

const listen = async () => {
  
  const [response] = await client.pull(request);

  // The subscriber pulls a specified number of messages.
  // Obtain the first message.
  const message = response.receivedMessages[0];
  console.log(message);
  // Send the message to the worker function.
  await worker(message);
  
  let waiting = true;
  while (waiting) {
    await new Promise(r => setTimeout(r, 5000));
    // If the message has been processed..
    if (isProcessed) {
      const ackRequest = {
        subscription: formattedSubscription,
        ackIds: [message.ackId],
      };
  
      //..acknowledges the message.
      console.log(`Acknowledged: "${message.message.data}".`);
      // Exit after the message is acknowledged.
      waiting = false;
      console.log(`Done.`);
      return await client.acknowledge(ackRequest);
    } else {
      // If the message is not yet processed..
      const modifyAckRequest = {
        subscription: formattedSubscription,
        ackIds: [message.ackId],
        ackDeadlineSeconds: newAckDeadlineSeconds,
      };
  
      //..reset its ack deadline.
      await client.modifyAckDeadline(modifyAckRequest);
  
      console.log(
        `Reset ack deadline for "${
          message.message.data
        }" for ${newAckDeadlineSeconds}s.`
      );
    }
  }
}

// TODO
// Set up polling interval if not actively working

// const main = async () => {
//   setInterval(() => {

//   }, 5000)
// }

// main();
