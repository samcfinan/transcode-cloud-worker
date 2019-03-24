const config = require("./config/config.json");
const { pollMessages } = require("./lib/pubsub");

// TODO
// Set up polling interval if not actively working

class Server {
  constructor() {
    this.working = false;
    this.worker = null;
    this.interval = setInterval(() => {
      if (!this.working) {
        this.poll();
      }
    }, 5000);
    
  }

  async poll() {
    const poll = await pollMessages()
    if (poll.working) {
      this.working = true;
      await this.work(poll.job);
    }
  }

  // Fake work job
  async work(job) {
    this.working = true;
    console.log("Working");
    return new Promise(() => setTimeout(() => {
      console.log("Work complete");
      this.working = false;
    }, 5000))
  }
}

outOfMessages = false;
const main = async () => {
  const server = new Server();
};

main();
