
module.exports = (sequelize, DataTypes) => {

  const roll_data = sequelize.define("roll_data",{
    roll_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true },
    status :{ type: DataTypes.ENUM,values: ['eligible', 'disqualified'],defaultValue: "eligible"},
    reason: { type: DataTypes.STRING,allowNull: true},
    
  }); 


  roll_data.associate = (models)=>{
  
    roll_data.belongsTo(models. user_data, {
      foreignKey: {
        name: 'user_id'
      }, as: 'user_info' 
    });


    roll_data.belongsTo(models. election_data, {
      foreignKey: {
        name: 'election_id'
      }, as: 'election' 
    });

  }
  

  return roll_data;
 

};
  
  
  
  