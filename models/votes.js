
module.exports = (sequelize, DataTypes) => {

    const votes_data = sequelize.define("votes_data",{
      vote_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true },
      otp: { type: DataTypes.INTEGER,allowNull: false},
      otp_expiry_time: { type: DataTypes.DATE,allowNull: false},
      otp_verify :{ type: DataTypes.ENUM,values: ['yes', 'no'],defaultValue: "no"}
      
    }); 

 
    votes_data.associate = (models)=>{
    
      votes_data.belongsTo(models.position_data, {
        foreignKey: {
          name: 'position_id'
         }, as: 'position' 
      });
    
      votes_data.belongsTo(models. user_data, {
        foreignKey: {
          name: 'user_id'
        }, as: 'user_info' 
      });

      votes_data.belongsTo(models. election_data, {
        foreignKey: {
          name: 'election_id'
        }, as: 'election' 
      });

      votes_data.belongsTo(models. candidate_data, {
        foreignKey: {
          name: 'candadate_id'
        }, as: 'candidate' 
      });

    }
     
    return votes_data;
   
};
    
    
    
    