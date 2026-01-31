export const isSpamMessage = ({ message = '' }) => {
  const urlMatches = message.match(/https?:\/\/|www\./gi) || [];
  if (urlMatches.length > 2) {
    return true;
  }

  if (/(.)\1{12,}/.test(message)) {
    return true;
  }

  return false;
};
