const express = require("express");
const db = require('../../models');
const fast2sms = require('fast-two-sms')
const _ = require('lodash'); 
var generator = require('generate-password');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
var fs = require('fs');
const os = require('os'); 
var validator = require("email-validator");
const validatePhoneNumber = require('validate-phone-number-node-js');
const checkDiskSpace = require('check-disk-space').default;
const { constant } = require("lodash");

//Registration form
const user_register_get =  function(req,res)
{
  let errors = [];
  let success = [];

  res.render('../views/system_admin/registeruser',{errors,success});
}

//Dashboard View
const user_dashboard_get = async  function(req,res)
{


  let errors = [];
  let success = [];



  const users_count = await db.user_data.count();
  const users_active = await db.user_data.count({
    where : {
      status:'current'
    }
  });
  const users_admin= await db.user_data.count({
    where : {
      role:'admin'
    }
  });
  
//  console.log(users_count);





    //free memory
    // Printing os.freemem() value
var free_memory = os.freemem();
var free_mem_in_kb = free_memory/1024;
var free_mem_in_mb = free_mem_in_kb/1024;
var free_mem_in_gb = free_mem_in_mb/1024;
   
free_mem_in_kb = Math.floor(free_mem_in_kb);
free_mem_in_mb = Math.floor(free_mem_in_mb);
free_mem_in_gb = Math.floor(free_mem_in_gb);
   
free_mem_in_mb = free_mem_in_mb%1024;
free_mem_in_kb = free_mem_in_kb%1024;
free_memory = free_memory%1024;
  
//uptime
var ut_sec = os.uptime();
var ut_min = ut_sec/60;
var ut_hour = ut_min/60;
   
ut_sec = Math.floor(ut_sec);
ut_min = Math.floor(ut_min);
ut_hour = Math.floor(ut_hour);
  
ut_hour = ut_hour%60;
ut_min = ut_min%60;
ut_sec = ut_sec%60;

 
var free_s;
var total_s;

//check Storage
checkDiskSpace('C:/').then((diskSpace) => {
  free_s = niceBytes(diskSpace.free);
  total_s = niceBytes(diskSpace.size);

  // {
  //     diskPath: 'C:',
  //     free: 12345678,
  //     size: 98756432
  // }
  // Note: `free` and `size` are in bytes
  res.render('../views/system_admin/dashboard',{users_admin,free_mem_in_gb,free_mem_in_mb,ut_hour,ut_min,ut_sec,total_s,free_s,users_count,users_active});
})

        
function niceBytes(x){
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
   let l = 0, n = parseInt(x, 10) || 0;
   while(n >= 1024 && ++l){
       n = n/1024;
   }
   return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
 }

  
}



//Registration form
const login_handler =  function(req,res,next)
{
  passport.authenticate('local', {
    successRedirect: '/user/rolerouter',
    failureRedirect: '/',
    failureFlash: 'Invalid username or password'
  })(req, res, next);

}


//Registration form
const logout_handler =  function(req,res,next)
{

  req.session.destroy(function(err) {
    if(err) {
      console.log(err);
    } else {
      
      req.logout();
      res.redirect('/');
    }
  });

}


//saving user
const save = async function(req,res){
var  params = req.body;
var email = req.body.email
var phonenumber = req.body.phonenumber
let errors = [];
let success = [];
     

   try{
              const users_count = await db.user_data.count(
                {
                    where:{
                      email:req.body.email
                    }
                }
              );

              const users_id_count = await db.user_data.count(
                {
                    where:{
                      identification:req.body.identification
                    }
                }
              );
              const users_phone_count = await db.user_data.count(
                {
                    where:{
                      phonenumber:req.body.phonenumber
                    }
                }
              );

              if(! validator.validate(req.body.email))
              {
                errors.push({ msg: 'Invalid Email' });
              }
              if(! validatePhoneNumber.validate(phonenumber))
              {
                errors.push({ msg: 'Invalid Phone Number' });
              }
            
              if(users_count>0)
              {
              errors.push({ msg: 'User With Particular email Already Exist' });
              }
              if(users_id_count>0)
              {
              errors.push({ msg: 'User With Particular ID Already Exist' });
              }
              if(users_phone_count>0)
              {
              errors.push({ msg: 'Phone number Already Registered by another user' });
              }
              if (errors.length==0)
              {

                          //generate a user passowrd
                            var passwd = generator.generate({
                              length: 8,
                              numbers: true
                            });

                          //encrypt the password
                          
                          var salt = bcrypt.genSaltSync(10);
                          var hash = bcrypt.hashSync(passwd, salt);
                          params.password = hash;
                        
                         // 
                          
                          //saving election data to database
                          db.user_data.create(params).catch(function(err){
                            console.log(err)

                          });
                          success.push({ msg: 'user successfully registered' });
                        //sending username and password to the user
                        message = "Your Delhi University Online Voting system account has been created, Your username is : "+email+" and Password: "+passwd;
                        var options = {authorization : 'bRVqwyt6GYT7mNQzvkFOpSnhoC09XrEM8gZKA1dielPc25sBJLoUOnWaCl68usGf23FjKwdk1mADy54N' , message : message ,  numbers : [phonenumber]} 
                        fast2sms.sendMessage(options).then(response=>{console.log(response)}) 

                        
            }

            res.render('../views/system_admin/registeruser',{success,errors}); 
            console.log('error 1');

          }catch(err){console.log(err)}


}


//user manager
const manage = async function(req,res)
{

  var alertsm = req.flash('alerts1') ;
  if (alertsm.length<1)
  {
     alertsm = "";
  }
  
    //pagination logic
    const pageAsNumber = Number.parseInt(req.params.pagen);
    let page = 0;
    let size = 6; //number of records per page
    if(!Number.isNaN(pageAsNumber) && pageAsNumber > 0){
      page = pageAsNumber;
    }
  
    const users = await db.user_data.findAll({
      limit: size,
      offset: page * size
    });
    const totalusers = await db.user_data.count();
    const totalPages =  Math.ceil(totalusers/ Number.parseInt(size));
    //end of pagination logic


    res.render('../views/system_admin/usermanager',{users,page,totalPages,alertsm, errors: req.flash('alerte1')});
}


//delete election
const delete_user = async function(req,res)
{
    var uid=req.params.uid;
    var errors=[];
    try
    {

      const users_exist = await db.candidate_data.count(
        {
            where:{
              user_id:uid
            }
         }
       );
       const users_admin = await db.user_data.count(
        {
            where:{
              role:'admin',status:'current'
            }
         }
       );
       const user_role = await db.user_data.count(
        {
            where:{
              user_id:uid,role:'admin'
            }
          });

       if(users_admin==1 && user_role==1)
       {
        req.flash('alerte1', 'You can not Delete the current user, you need atleast one Active System Administrator'); 
        errors.push({ msg: 'You can not Delete the current user, you need atleast one System Administrator'}); 
       }

       if(users_exist>1)
       {
        req.flash('alerte1', 'Delete Failed!, User is attached to one or more elections as a candidate'); 
        errors.push({ msg: 'Delete Failed!, User is attached to one or more elections as a candidate'}); 
       }

      if(errors.length<1)
      {
              await db.user_data.destroy(
              {
                where: { user_id: uid }
              });
              req.flash('alerts1', 'User Deleted Successfully');
              res.redirect('/user/umanage/0');
      }
      else
      {
        res.redirect('/user/umanage/0');
      }
    }catch(err){console.log(err)}
     
   
}

//disable user
const user_disable = async function(req,res)
{
    var uid=req.params.uid;
    var errors=[];
    try
    {

    
       const users_admin = await db.user_data.count(
        {
            where:{
              role:'admin',status:'current'
            }
         }
       );
       const user_role = await db.user_data.count(
        {
            where:{
              user_id:uid,role:'admin'
            }
          });

       if(users_admin==1 && user_role==1)
       {
        req.flash('alerte1', 'You can not Disable the selected user, you need atleast one System Administrator'); 
        errors.push({ msg: 'You can not Disable the selected user, you need atleast one System Administrator'}); 
       }
     
      if(errors.length<1)
      {
              await db.user_data.update( {
                status: 'not_current' 
              },
              {
                where: { user_id: uid }
              });
              req.flash('alerts1', 'User Disabled Successfully');
              res.redirect('/user/umanage/0');
      }
      else
      {
        res.redirect('/user/umanage/0');
      }
    }catch(err){console.log(err)}
     
   
}

//enable user
const user_enable = async function(req,res)
{
    var uid=req.params.uid;
    var errors=[];
    try
    {
              await db.user_data.update( {
                status: 'current' 
              },
              {
                where: { user_id: uid }
              });
              req.flash('alerts1', 'User Enabled Successfully');
              res.redirect('/user/umanage/0');
      
    }catch(err){console.log(err)}
       
}


//Update user getting the form
const update_user1 = async function(req,res)
{
    var success=[];
    var errors=[];
    var uid=req.params.uid;
    
    try
    {
    
      const users = await db.user_data.findOne(
          {
              where:{
                user_id:uid
              }
           }
      );
      res.render('../views/system_admin/updateuser',{users,success,errors,alertsm : ""});

    }catch(err){console.log(err)}
     
   
  }  





//Update user getting the form
const update_user2 = async function(req,res)
{
    var uid=req.body.user_id;
    var params= req.body;
    var errors=[];  
    var success=[];  
    try
    {

      if(! validator.validate(req.body.email))
      {
        errors.push({ msg: 'Invalid Email' });
      }
      if(! validatePhoneNumber.validate(req.body.phonenumber))
      {
        errors.push({ msg: 'Invalid Phone Number' });
      }
    
     
      if (errors.length==0)
      {  

                const u_info = await db.user_data.findOne(
                  {
                      where:{
                        user_id:uid
                      }
                  }
                );

              if(u_info.email!=req.body.email)
              {
                            const users_count = await db.user_data.count(
                              {
                                  where:{
                                    email:req.body.email
                                  }
                              }
                            );
                            if(users_count>0)
                              {
                              errors.push({ msg: 'User With Particular email Already Exist' });
                              }

              
              } 

              if(u_info.email!=req.body.email)
              {
                        const users_id_count = await db.user_data.count(
                          {
                              where:{
                                identification:req.body.identification
                              }
                          }
                        );
                        if(users_id_count>0)
                        {
                        errors.push({ msg: 'User With Particular ID Already Exist' });
                        }
                        
                      
              }  

              if(u_info.phonenumber!=req.body.phonenumber)
              {
                const users_phone_count = await db.user_data.count(
                  {
                      where:{
                        phonenumber:req.body.phonenumber
                      }
                  }
                );

                if(users_phone_count>0)
                {
                errors.push({ msg: 'Phone number Already Registered by another user' });
                }          

              } 
        
              
              if (errors.length==0)
               { 
                        await db.user_data.update(params,
                            {
                                where:{
                                  user_id:uid
                                }
                            }
                        );              
                        req.flash('alerts1', 'User Updated Successfully');
                        res.redirect('/user/umanage/0');
                }
              else
              {

                const users = await db.user_data.findOne(
                  {
                      where:{
                        user_id:uid
                      }
                   }
              );
              res.render('../views/system_admin/updateuser',{users,success,errors,alertsm : ""});
    
                      
              }  
      }
      else
      {
                const users = await db.user_data.findOne(
                  {
                      where:{
                        user_id:uid
                      }
                  }
              );
              res.render('../views/system_admin/updateuser',{users,success,errors,alertsm : ""});

      }        

    }catch(err){console.log(err)}
     
   
  } 


 
//userpassword reset
const user_password_reset = async function(req,res)
{
    var uid=req.params.uid;

    try
    {
      
      const u_info = await db.user_data.findOne(
        {
            where:{
              user_id:uid
            }
        }
      );


       //generate a user passowrd
       var passwd = generator.generate({
        length: 8,
        numbers: true
      });

    //encrypt the password
    
    var salt = bcrypt.genSaltSync(10);
    var hash = bcrypt.hashSync(passwd, salt);
  

  //sending username and password to the user
  message = "Your Delhi University Online Voting System Account has been reset ,your username is : "+u_info.email+" and new password is : "+passwd;
  var options = {authorization : 'bRVqwyt6GYT7mNQzvkFOpSnhoC09XrEM8gZKA1dielPc25sBJLoUOnWaCl68usGf23FjKwdk1mADy54N' , message : message ,  numbers : [u_info.phonenumber]} 
  fast2sms.sendMessage(options).then(response=>{console.log(response)}) 
    
       await db.user_data.update({password:hash},
          {
              where:{
                user_id:uid
              }
           }
      );
  
      
      req.flash('alerts1', 'Password Was Reset Successfully & Details sent');
      res.redirect('/user/umanage/0');

    }catch(err){console.log(err)}
     
   
  } 






 //authentication for admin routes
 function isAuthenticated(req, res, next) {
            if (req.isAuthenticated())
          {
              req.user.then(function(result) {
              
                if(result.role!='admin')
                  {
                      res.redirect('/');
                  }  
                  else
                  {
                      return next();
                  }
              });

            
          }
          else
          {
              res.redirect('/');
          }
 
} 


//role router authentication
function isAuthenticated_role(req, res, next) {
       if (req.isAuthenticated())
        {
            return next();
        }
        else
        {
            res.redirect('/');
        }

} 


//authentication for admin routes
function user_router(req, res) {
    req.user.then(function(result) {
      // set username and passwords
      req.session.fname = result.firstname;
      req.session.lname = result.lastname;
      req.session.uid = result.user_id;
      if(result.role=='admin')
        {
          req.session.role = 'System Administrator';  
          res.redirect('/user/udashboard');
            
        }  
        else if(result.role=='e_admin') 
        {
          req.session.role = 'Election Administrator';
          res.redirect('/election/dashboard');
        }
        else if(result.role=='voter') 
        {
          req.session.role = 'Voter';
          res.redirect('/voter/dashboard');
        }
        else
        {
          res.redirect('/');
        }
    });
} 


//Change user Password
const user_change_password = async function(req,res){
  var  params = req.body;
  var errors = [];
  var success = [];
       
  
     try{
                const password_check = await db.user_data.findOne(
                  {
                      where:{
                        user_id:req.session.uid
                      }
                  }
                );

                if (req.body.new_password!=req.body.confirm_new_password) {
                  errors.push({ msg: 'Passwords are not Matching'}); 
                }
                if (req.body.new_password.length < 8) {
                    errors.push({ msg: 'Your password must be at least 8 characters'}); 
                }

                if (req.body.new_password.search(/[a-z]/i) < 0) {
                    errors.push({ msg: 'Your password must contain at least one letter.'});
                }
                if (req.body.new_password.search(/[0-9]/) < 0) {
                    errors.push({ msg: 'Your password must contain at least one digit.'}); 
                }
                

                const pcheck=bcrypt.compareSync(req.body.old_password,password_check.password);
               
      
                   if(pcheck==false)
                   {
                    errors.push({ msg: 'Wrong Old Password!' });
                   }
                   
           
                   if (errors.length<1) 
                   {
                     //encrypt the password
                     var salt = bcrypt.genSaltSync(10);
                     var hash = bcrypt.hashSync(req.body.new_password, salt);
                     // 
                       //saving election data to database
                       await db.user_data.update({password:hash},
                         {
                             where:{
                               user_id:req.session.uid
                             }
                         }
                         );
                       success.push({ msg: 'Password change was successful' });
                   
                     }
                     res.render('../views/system_admin/changepassword',{success,errors});


            }catch(err){console.log(err)}
  
  
  }


  //getting a form

  const user_change_password_get = async function(req,res){
    var errors = [];
    var success = [];
    
                res.render('../views/system_admin/changepassword',{success,errors}); 
                
    
                 
    
    }



 module.exports= {user_enable,user_disable,user_password_reset,user_change_password_get,user_change_password,user_dashboard_get,user_router,user_register_get,save,manage,delete_user,update_user1,update_user2,login_handler,logout_handler,isAuthenticated,isAuthenticated_role}