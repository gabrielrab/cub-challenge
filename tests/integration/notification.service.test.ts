import { sendNotification, processWebhook, notificationStateValidate } from '../../src/services/notification';
import Notification, {
  NotificationChannelEnum,
  NotificationStatusEnum
} from '../../src/database/models/notification.model';
import sequelize from '../../src/database/sequelize';

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Notification Service', () => {
  describe('notificationStateValidate', () => {
    it.each([
      [NotificationChannelEnum.SMS, NotificationStatusEnum.PROCESSING, NotificationStatusEnum.REJECTED, true],
      [NotificationChannelEnum.SMS, NotificationStatusEnum.SENT, NotificationStatusEnum.DELIVERED, true],
      [NotificationChannelEnum.WHATSAPP, NotificationStatusEnum.DELIVERED, NotificationStatusEnum.VIEWED, true],
      [NotificationChannelEnum.SMS, NotificationStatusEnum.PROCESSING, NotificationStatusEnum.DELIVERED, false]
    ])(
      'should validate notification state transitions correctly (%s, %s, %s)',
      async (channel, previous, next, expected) => {
        const isValid = notificationStateValidate(channel, previous, next);
        expect(isValid).toBe(expected);
      }
    );
  });

  describe('sendNotification', () => {
    it('should create a notification with PROCESSING status', async () => {
      const notification = await sendNotification('sms', '+15555555555', 'Test message', 'ext123');
      expect(notification.status).toBe(NotificationStatusEnum.PROCESSING);
    });
  });

  describe('processWebhook', () => {
    it('should update the notification status correctly', async () => {
      const notification = await sendNotification('sms', '+15555555555', 'Test message', 'ext123');
      await processWebhook(
        notification.statusTimestamp.toISOString(),
        NotificationStatusEnum.SENT,
        notification.externalId
      );
      const updatedNotification = (
        await Notification.findOne({ where: { externalId: notification.externalId } })
      )?.toJSON();
      expect(updatedNotification.status).toBe(NotificationStatusEnum.SENT);
    });

    it('should throw an error for invalid status transition', async () => {
      const notification = (
        await Notification.create({
          channel: NotificationChannelEnum.SMS,
          to: '+15555555555',
          body: 'Test message',
          externalId: '123ext',
          status: NotificationStatusEnum.PROCESSING,
          statusTimestamp: new Date(),
          version: 1
        })
      ).toJSON();

      const invalidStatus = NotificationStatusEnum.DELIVERED;
      const process = processWebhook(new Date().toISOString(), invalidStatus, notification.externalId);

      await expect(process).rejects.toThrow(
        `Invalid status change: ${NotificationStatusEnum.PROCESSING} -> ${invalidStatus}`
      );
    });

    it('handles race conditions by rejecting invalid transitions before a valid transition', async () => {
      const notification = await sendNotification(
        NotificationChannelEnum.SMS,
        '+15555555555',
        'Initial message',
        'race123'
      );

      const invalidTransition = processWebhook(
        notification.statusTimestamp.toISOString(),
        NotificationStatusEnum.DELIVERED,
        notification.externalId
      );

      await expect(invalidTransition).rejects.toThrow('Invalid status change');

      await processWebhook(
        notification.statusTimestamp.toISOString(),
        NotificationStatusEnum.SENT,
        notification.externalId
      );

      const updatedNotification = (
        await Notification.findOne({ where: { externalId: notification.externalId } })
      )?.toJSON();
      expect(updatedNotification.status).toBe(NotificationStatusEnum.SENT);

      const validAttempt = processWebhook(
        notification.statusTimestamp.toISOString(),
        NotificationStatusEnum.DELIVERED,
        notification.externalId
      );
      await expect(validAttempt).resolves.toBeUndefined();

      const finalNotification = (
        await Notification.findOne({ where: { externalId: notification.externalId } })
      )?.toJSON();
      expect(finalNotification.status).toBe(NotificationStatusEnum.DELIVERED);
    });
  });
});
