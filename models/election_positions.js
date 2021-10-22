
module.exports = (sequelize, DataTypes) => {

    const position_data = sequelize.define("position_data",{
        position_name: { type: DataTypes.STRING,allowNull: false},
        position_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true }
    }); 

    position_data.associate= (models)=>{
    
      
      position_data.hasMany(models.candidate_data, {
        foreignKey: {
          name: 'position_id'
        }, as: 'candidate',onDelete: 'CASCADE' }); 

      position_data.hasMany(models.results_data, {
          foreignKey: {
            name: 'position_id'
          }, as: 'results',onDelete: 'CASCADE' });   
      
      position_data.belongsTo(models.election_data, {
        foreignKey: {
          name: 'election_id'
         }, as: 'election', onDelete: 'CASCADE'
      });

      position_data.hasMany(models.votes_data, {
        foreignKey: {
          name: 'election_id'
        }, as: 'votes',onDelete: 'CASCADE' }); 





    };
 
    return position_data;   

};
    
    
    
    