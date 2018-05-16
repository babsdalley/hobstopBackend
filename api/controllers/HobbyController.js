/**
 * HobbyController
 *
 * @description :: Server-side logic for managing hobbies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
require('dotenv').config();

const accountSid = 'ACc4df0a10f63f2c7040bf98d244f91a5a'; // Your Account SID from www.twilio.com/console
const authToken = '00f0878293d7ff333ccac2ab7d2c9fd4';

const client = require('twilio')(accountSid, authToken);
var sendSMS = function(message, mobileNumber) {
  client.messages.create({
    from: '+16263250829',
    to: mobileNumber,
    body: message,
    }, function(err, message){
        if(err){
          console.log(err);
          return
        }
        else{
          console.log(message.sid);
        }
    });
}

module.exports = {
	getUserHobbies(req, res){
        Hobby.find({ userId: req.param('userId')
        }, function foundHobbies(err, createdHobbies) {
          if (err) return res.negotiate(err);
          return res.ok(createdHobbies);
      });
    },

    // createNewHobby(req, res){
    //     var name = req.param('name');
    //     var message = "You created a new hobby: " + name;
    //     User.findOne({ id: req.param('userId')
    //     }, function foundUser(err, createdUser) {
    //       if (err) return res.negotiate(err);
    //       if (!createdUser) return res.notFound("User not found");
    //       return res.ok(createdUser);
        
    //     var newHobby = {
    //         name: name,
    //         userId: req.param('userId')
    //     };

    //     Hobby.create(newHobby).exec(function(err, newHobby) {
    //         if (err) {
    //             return res.json(500, { status:false, message: "Hobby could not be created" });
    //         }
    //         twilioService.sendSMS(message, createdUser.phoneNumber);
    //         return res.ok(newHobby);
    
    //     });
    // });
    // },

    createNewHobby(req, res) {
        var name = req.param('name');
        var userId = req.param('userId');
        var message = "You created a new hobby: " + name
    
        User.findOne({ id: userId }).exec(function(error, user) {
          if (error) {
            return res.negotiate(error);
          }
          if(!user){
            return res.notFound("User not found");
          }
    
          Hobby.create({ name: name, userId: userId }).exec(function(error, newHobby) {
            if (error) {
                return res.negotiate(error);
            }
            sendSMS(message, user.phoneNumber)
    
            return res.ok(newHobby);
          });
        });
    
      },

    deleteHobby(req, res){
        Hobby.destroy({id: req.param('id')
        },function deleteHobby(err, deletedHobby) {
            if (err) return res.negotiate(err);
            return res.ok(deletedHobby);
        });
    },

    editHobby: function(req, res) {
        var name = req.param('name');
        var id = req.param('id');
    
        Hobby.update({ id: id }, { name: name }, function(error, updatedHobby) {
          if (error) {
            return res.json(500, { status:false, message: "Hobby could not be updated" });
          }
          return res.ok(updatedHobby);
        });
      },
      
};

// User.update({id: req.param('id')},{deleted: true}, function(err, removedUser){
//     if (err) return res.negotiate(err);
//     if (removedUser.length === 0) {
//     return res.notFound();
//     }
//     return res.ok();
// });
// }
// };