
const { google } = require('googleapis');

const LABEL_NAME = 'VacationAutoReply';

const repliedEmails = new Set();

async function getUnreadEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });
  const response = await gmail.users.messages.list({
    userId: 'me',
    labelIds: ['INBOX'],
    q: 'is:unread',
  });

  return response.data.messages || [];
}

function hasReplied(email) {
  return repliedEmails.has(email.id);
}

function markAsReplied(email) {
  repliedEmails.add(email.id);
}

async function sendReply(auth, email) {
  const gmail = google.gmail({ version: 'v1', auth });

  const message = `Thank you for your email! I am currently on vacation and will get back to you as soon as possible.`;

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: Buffer.from(
        `To: ${email.from}\r\nSubject: Re: ${email.subject}\r\n\r\n${message}`
      ).toString('base64'),
    },
  });
}

async function addLabelAndMove(auth, email) {
  const gmail = google.gmail({ version: 'v1', auth });

  // Check if the label exists, create it if not
  const labels = await gmail.users.labels.list({
    userId: 'me',
  });
  const label = labels.data.labels.find((l) => l.name === LABEL_NAME);

  if (!label) {
    await gmail.users.labels.create({
      userId: 'me',
      requestBody: {
        name: LABEL_NAME,
      },
    });
  }

  // Modify the email by adding the label
  await gmail.users.messages.modify({
    userId: 'me',
    id: email.id,
    requestBody: {
      addLabelIds: [LABEL_NAME],
    },
  });
}

module.exports = {
  getUnreadEmails,
  hasReplied,
  markAsReplied,
  sendReply,
  addLabelAndMove,
};
