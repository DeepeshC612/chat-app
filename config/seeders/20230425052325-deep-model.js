"use strict";




const deepList = [{ deep: 55 }];
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    let deep = null;
    deepList.map(async (item) => {
      try {
        // deep = await queryInterface.rawSelect(
        //   "MiggrateUsers",
        //   {
        //     where: {
        //       deep: item.deep,
        //     },
        //   },
        //   ['id']
        // );
        // if (deep) {
        
          deep = await queryInterface.sequelize.query('UPDATE miggrateusers SET deep = 40 WHERE miggrateusers.id = 4');
        // }
      } catch (error) {
        console.log(error, "error");
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("MiggrateUsers", null, {});
  },
};
