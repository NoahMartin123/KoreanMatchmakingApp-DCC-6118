'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('FriendsModel', 'status', {
      type: Sequelize.ENUM('pending', 'accepted'),
      allowNull: false,
      defaultValue: 'accepted',
    });
    await queryInterface.addColumn('FriendsModel', 'requester_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'UserAccount', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('FriendsModel', 'status');
    await queryInterface.removeColumn('FriendsModel', 'requester_id');
  },
};
