import Notification from '../database/models/notification.model';

const sendNotification = async (
  channel: string,
  to: string,
  body: string,
  externalId: string
): Promise<Notification> => {
  const notification = await Notification.create({
    channel,
    to,
    body,
    externalId,
    status: 'sent',
    statusTimestamp: new Date(),
    version: 1
  });
  return notification.toJSON();
};
const processWebhook = async () => {};

export { sendNotification };
