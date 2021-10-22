
module.exports = (sequelize, DataTypes) => {

    const candidate_data = sequelize.define("candidate_data",{
      candidate_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true },
      status :{ type: DataTypes.ENUM,values: ['eligible', 'disqualified'],defaultValue: "eligible"},
      reason: { type: DataTypes.STRING,allowNull: true},
      
    }); 

 
    candidate_data.associate = (models)=>{
    
      candidate_data.belongsTo(models.position_data, {
        foreignKey: {
          name: 'position_id'
         }, as: 'position' 
      });
    
    
      candidate_data.belongsTo(models. user_data, {
        foreignKey: {
          name: 'user_id'
        }, as: 'user_info' 
      });


      candidate_data.belongsTo(models. election_data, {
        foreignKey: {
          name: 'election_id'
        }, as: 'election' 
      });


      candidate_data.hasMany(models.votes_data, {
        foreignKey: {
          name: 'candidate_id'
        }, as: 'votes',onDelete: 'CASCADE' }); 
      
      candidate_data.hasMany(models.results_data, {
          foreignKey: {
            name: 'candidate_id'
          }, as: 'results',onDelete: 'CASCADE' });   

    }
    
      
   
 
    return candidate_data;
   

};
    



    
    
    