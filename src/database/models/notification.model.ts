import { DataTypes } from 'sequelize';
import sequelize from '../sequelize';

export enum NotificationChannelEnum {
  SMS = 'sms',
  WHATSAPP = 'whatsapp'
}

export enum NotificationStatusEnum {
  PROCESSING = 'processing',
  REJECTED = 'rejected',
  SENT = 'sent',
  DELIVERED = 'delivered',
  VIEWED = 'viewed'
}

const Notification = sequelize.define('Notification', {
  channel: {
    type: DataTypes.ENUM,
    values: Object.values(NotificationChannelEnum)
  },
  to: {
    type: DataTypes.STRING
  },
  body: {
    type: DataTypes.STRING
  },
  externalId: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    values: Object.values(NotificationStatusEnum)
  },
  statusTimestamp: {
    type: DataTypes.DATE
  },
  version: {
    type: DataTypes.INTEGER
  }
});

export default Notification;
