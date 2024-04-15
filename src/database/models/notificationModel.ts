import { DataTypes } from 'sequelize';
import sequelize from '../sequelize';

const Notification = sequelize.define('Notification', {
  name: {
    type: DataTypes.STRING
  }
});

export default Notification;
