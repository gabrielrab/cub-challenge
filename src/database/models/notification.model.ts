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
    values: Object.values(NotificationChannelEnum),
    validate: {
      isIn: [Object.values(NotificationChannelEnum)]
    }
  },
  to: {
    type: DataTypes.STRING,
    validate: {
      is: /^\+?[1-9]\d{1,3}[1-9]\d{7,}$/
    }
  },
  body: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  externalId: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING,
    values: Object.values(NotificationStatusEnum),
    validate: {
      isIn: [Object.values(NotificationStatusEnum)]
    }
  },
  statusTimestamp: {
    type: DataTypes.DATE
  },
  version: {
    type: DataTypes.INTEGER
  }
});

export default Notification;
