
module.exports = (sequelize, DataTypes) => {

    const results_data = sequelize.define("results_data",{
      result_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true },
      total_votes: { type: DataTypes.INTEGER,allowNull: false},
      candidate_votes: { type: DataTypes.INTEGER,allowNull: false},
      result_outcome :{ type: DataTypes.ENUM,values: ['won', 'lost','tie'],defaultValue: "lost"},
    }); 

 
    results_data.associate = (models)=>{
    
      results_data.belongsTo(models.position_data, {
        foreignKey: {
          name: 'position_id'
         }, as: 'position' 
      });

      results_data.belongsTo(models. election_data, {
        foreignKey: {
          name: 'election_id'
        }, as: 'election' 
      });

      results_data.belongsTo(models. candidate_data, {
        foreignKey: {
          name: 'candidate_id'
        }, as: 'candidate' 
      });

    }
     
    return results_data;
   
};
    
    
    
    