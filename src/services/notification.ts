import Notification, { NotificationStatusEnum, NotificationChannelEnum } from '../database/models/notification.model';

interface NotificationResponse {
  id?: number;
  channel: NotificationChannelEnum;
  to: string;
  body: string;
  externalId: string;
  status: NotificationStatusEnum;
  statusTimestamp: Date;
  version: number;
}

const notificationStateValidate = (
  channel: NotificationChannelEnum,
  previous: NotificationStatusEnum,
  next: NotificationStatusEnum
): boolean => {
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

  const validNextStates = stateManager[channel][previous] ?? [];
  return validNextStates.includes(next);
};

const sendNotification = async (
  channel: string,
  to: string,
  body: string,
  externalId: string
): Promise<NotificationResponse> => {
  const notification = await Notification.create({
    channel,
    to,
    body,
    externalId,
    status: NotificationStatusEnum.PROCESSING,
    statusTimestamp: new Date(),
    version: 1
  });
  return await notification.toJSON();
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
      const errorMessage = `Invalid status change: ${updatedNotification.status} -> ${status}`;
      console.log(errorMessage);
      throw new Error(errorMessage);
    }

    updatedNotification.status = status;
    updatedNotification.statusTimestamp = eventDate;
    updatedNotification.version++;

    await Notification.update(updatedNotification, { where: { id: updatedNotification.id } });
  }
};

export { sendNotification, processWebhook, notificationStateValidate };
