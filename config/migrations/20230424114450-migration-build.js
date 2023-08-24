"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction((t) =>
        queryInterface.addColumn(
          "miggrateusers",
          "deep",
          { type: Sequelize.INTEGER },
          { transaction: t }
        )
    )
  },
  

  async down(queryInterface) {
    queryInterface.sequelize.transaction((t) =>
      Promise.all([
        queryInterface.removeColumn("miggrateusers", "deep", { transaction: t }),
      ])
    );
  },
};
