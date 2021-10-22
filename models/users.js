
module.exports = (sequelize, DataTypes) => {

    const user_data = sequelize.define("user_data",{
      user_id: { type: DataTypes.INTEGER, primaryKey: true , autoIncrement: true },
      identification: { type: DataTypes.STRING,allowNull: false},
      firstname: { type: DataTypes.STRING,allowNull: false},
      lastname: { type: DataTypes.STRING,allowNull: false},
      email: { type: DataTypes.STRING,allowNull: false},
      phonenumber: { type: DataTypes.STRING,allowNull: false},
      username: { type: DataTypes.STRING,allowNull: false},
      password: { type: DataTypes.STRING,allowNull: false},
      status:{ type: DataTypes.ENUM,values: ['current', 'not_current'],defaultValue: "current"},  
      role:{ type: DataTypes.ENUM,values: ['admin', 'e_admin','voter'],defaultValue: "voter"}
    }); 

    
    
    user_data.associate= (models)=>{
    
      user_data.hasMany(models.candidate_data, {
      foreignKey: {
        name: 'user_id'
      }, as: 'candidate',onDelete: 'CASCADE' });
  
      user_data.hasMany(models.votes_data, {
        foreignKey: {
          name: 'election_id'
        }, as: 'votes',onDelete: 'CASCADE' }); 
  
  }   

  
    return user_data;
   

};
    
    
    
    