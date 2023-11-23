const express = require('express');
const auth = require('./auth');
const gmail = require('./gmail');
const scheduler = require('./scheduler');

// Express setup
const app = express();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  startApp();
});

app.get('/', (req, res) => {
    res.send('Hello, this is your Node.js app!');
  }); 
async function startApp() {
  try {
    // Authenticate with Google
    const authClient = await auth.authenticate();

    // Start the scheduler
    scheduler.start(async () => {
      try {
        // Check for new emails
        const unreadEmails = await gmail.getUnreadEmails(authClient);

        // Process each unread email
        for (const email of unreadEmails) {
          // Check if this email has been replied to
          if (!gmail.hasReplied(email)) {
            // Send a reply
            await gmail.sendReply(authClient, email);

            // Add label and move to the label
            await gmail.addLabelAndMove(authClient, email);

            // Mark as replied
            gmail.markAsReplied(email);
          }
        }
      } catch (error) {
        console.error('Error processing emails:', error);
      }
    });
  } catch (error) {
    console.error('Authentication error:', error);
  }
}

