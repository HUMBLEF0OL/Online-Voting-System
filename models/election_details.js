

module.exports = (sequelize, DataTypes) => {

const election_data = sequelize.define("election_data",{
    title: { type: DataTypes.STRING,allowNull: false},
    status :{ type: DataTypes.ENUM,values: ['not_started','running','completed'],defaultValue: "not_started"},
    start_date: {type: DataTypes.DATE,allowNull: false},
    start_time: {type: DataTypes.STRING,allowNull: false},
    stop_date: { type: DataTypes.DATE,allowNull: false},
    stop_time: { type: DataTypes.STRING,allowNull: false},
    election_display_id: { type: DataTypes.INTEGER, allowNull: false},
    otp: { type: DataTypes.INTEGER,allowNull: false},
    otp_expiry_time: { type: DataTypes.DATE,allowNull: false},
    otp_verify :{ type: DataTypes.ENUM,values: ['yes', 'no'],defaultValue: "no"},
    published :{ type: DataTypes.ENUM,values: ['yes', 'no'],defaultValue: "no"},
    election_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true }
}); 

election_data.associate = (models)=>{
    
    election_data.hasMany(models.position_data, {
    foreignKey: {
      name: 'election_id'
    }, as: 'position',onDelete: 'CASCADE' });


    election_data.hasMany(models.results_data, {
      foreignKey: {
        name: 'election_id'
      }, as: 'results',onDelete: 'CASCADE' });
  
  
    election_data.hasMany(models.roll_data, {
      foreignKey: {
        name: 'election_id'
      }, as: 'roll',onDelete: 'CASCADE' });
  

   election_data.hasMany(models.candidate_data, {
      foreignKey: {
        name: 'election_id'
      }, as: 'candidate',onDelete: 'CASCADE' }); 
    
   election_data.hasMany(models.votes_data, {
        foreignKey: {
          name: 'election_id'
        }, as: 'votes',onDelete: 'CASCADE' }); 


};   


return election_data;
};



