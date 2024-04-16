import request from 'supertest';
import app from '../../src/app';
import sequelize from '../../src/database/sequelize';

const notificationMock = {
  channel: 'sms',
  to: '+15537999999999',
  body: 'Hello, world!',
  externalId: 'test123'
};

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Notification Endpoints', () => {
  describe('POST /notifications/send', () => {
    it('should create a valid notification', async () => {
      const response = await request(app).post('/notifications/send').send(notificationMock);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        ...notificationMock,
        status: 'processing'
      });
    });

    it('should dont create notification when empty data', async () => {
      const response = await request(app).post('/notifications/send').send({});
      expect(response.status).toBe(422);
    });

    it('should return 422 for invalid phone number', async () => {
      const invalidPhoneNotification = {
        ...notificationMock,
        to: 'invalid_number'
      };
      const response = await request(app).post('/notifications/send').send(invalidPhoneNotification);
      expect(response.status).toBe(422);
      expect(response.body.errors[0]).toEqual(
        "Validation is on to failed. The value 'invalid_number' is invalid to path 'to'"
      );
    });
  });

  describe('POST /notifications/webhook', () => {
    it('should accept a webhook and return 202', async () => {
      const webhookData = {
        timestamp: new Date().toISOString(),
        status: 'delivered',
        externalId: 'test123'
      };

      const response = await request(app).post('/notifications/webhook').send(webhookData);

      expect(response.status).toBe(202);
    });
  });
});
