import { DataTypes } from 'sequelize';
import sequelize from '../sequelize';

const Notification = sequelize.define('Notification', {
  channel: {
    type: DataTypes.STRING
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
    values: ['processing', 'rejected', 'sent', 'delivered', 'viewed']
  },
  statusTimestamp: {
    type: DataTypes.DATE
  },
  version: {
    type: DataTypes.INTEGER
  }
});

export default Notification;
