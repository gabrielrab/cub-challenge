import Notification, { NotificationStatusEnum, NotificationChannelEnum } from '../database/models/notification.model';

const notificationStateValidate = (
  channel: NotificationChannelEnum,
  previous: NotificationStatusEnum,
  next: NotificationStatusEnum
): Boolean => {
  type StateManager = {
    [key in NotificationChannelEnum]: {
      [state in NotificationStatusEnum]?: NotificationStatusEnum[];
    };
  };

  const stateManager: StateManager = {
    [NotificationChannelEnum.SMS]: {
      [NotificationStatusEnum.PROCESSING]: [NotificationStatusEnum.REJECTED, NotificationStatusEnum.SENT],
      [NotificationStatusEnum.SENT]: [NotificationStatusEnum.DELIVERED]
    },
    [NotificationChannelEnum.WHATSAPP]: {
      [NotificationStatusEnum.PROCESSING]: [NotificationStatusEnum.REJECTED, NotificationStatusEnum.SENT],
      [NotificationStatusEnum.SENT]: [NotificationStatusEnum.DELIVERED],
      [NotificationStatusEnum.DELIVERED]: [NotificationStatusEnum.VIEWED]
    }
  };

  const validNextStates = stateManager[channel][previous] || [];
  return validNextStates.includes(next);
};

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
    status: NotificationStatusEnum.PROCESSING,
    statusTimestamp: new Date(),
    version: 1
  });
  return notification.toJSON();
};
const processWebhook = async (timestamp: string, status: string, externalId: string): Promise<void> => {
  const eventDate = new Date(timestamp);
  const notification = await Notification.findOne({ where: { externalId } });

  if (notification) {
    const updatedNotification = notification.toJSON();

    const valid = notificationStateValidate(
      updatedNotification.channel,
      updatedNotification.status,
      status as NotificationStatusEnum
    );

    if (!valid) {
      // add logic here after
      console.log('valid update');
      return;
    }

    updatedNotification.status = status;
    updatedNotification.statusTimestamp = eventDate;
    updatedNotification.version++;

    await Notification.update(updatedNotification, { where: { id: updatedNotification.id } });
  }
};

export { sendNotification, processWebhook };
