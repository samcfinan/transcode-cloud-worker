const config = require("./config/config.json");
const pubsub = require("@google-cloud/pubsub");

const client = new pubsub.v1.SubscriberClient();
process.env.GOOGLE_APPLICATION_CREDENTIALS = config.pubsub.serviceaccount;

const projectName = config.project;
const subscriptionName = config.pubsub.subscription;

const formattedSubscription = client.subscriptionPath(
  projectName,
  subscriptionName
);

// The maximum number of messages returned for this request.
// Pub/Sub may return fewer than the number specified.
const maxMessages = 1;
const newAckDeadlineSeconds = 30;
const request = {
  subscription: formattedSubscription,
  returnImmediately: true,
  maxMessages: maxMessages
};


const pollMessages = async () => {
  const response = await client.pull(request).catch((err) => console.log(err));

  // Early exit if no messages.
  if (response[0].receivedMessages.length === 0) {
    return false
  }

  const message = response[0].receivedMessages[0];
  console.log(response[0].receivedMessages[0])

  const ackRequest = {
    subscription: formattedSubscription,
    ackIds: [message.ackId]
  }



  await client.acknowledge(ackRequest).then(res => console.log(res));
  return true;
  // // The subscriber pulls a specified number of messages.
  // // Obtain the first message.
  // const message = [response].receivedMessages[0];
  // console.log(message);
  // // Send the message to the worker function.
  // await worker(message);

  // let waiting = true;
  // while (waiting) {
  //   // If the message has been processed..
  //   if (isProcessed) {
  //     const ackRequest = {
  //       subscription: formattedSubscription,
  //       ackIds: [message.ackId]
  //     };
      
  //     //..acknowledges the message.
  //     console.log(`Acknowledged: "${message.message.data}".`);
  //     // Exit after the message is acknowledged.
  //     waiting = false;
  //     console.log(`Done.`);
  //     return await client.acknowledge(ackRequest);
  //   } else {
  //     // If the message is not yet processed..
  //     await new Promise(r => setTimeout(r, 5000));
  //     const modifyAckRequest = {
  //       subscription: formattedSubscription,
  //       ackIds: [message.ackId],
  //       ackDeadlineSeconds: newAckDeadlineSeconds
  //     };

  //     //..reset its ack deadline.
  //     await client.modifyAckDeadline(modifyAckRequest);

  //     console.log(
  //       `Reset ack deadline for "${
  //         message.message.data
  //       }" for ${newAckDeadlineSeconds}s.`
  //     );
  //   }
  // }
};
