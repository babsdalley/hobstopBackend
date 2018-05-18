/**
 * HobbyController
 *
 * @description :: Server-side logic for managing hobbies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
const authToken = process.env.TWILIO_AUTH_TOKEN;

const SparkPost = require('sparkpost');
const sparky = new SparkPost(process.env.SPARKPOST_AUTH_TOKEN);

const client = require('twilio')(accountSid, authToken);
var sendSMS = function(message, mobileNumber) {
  client.messages.create({
    from: process.env.TWILIO_NUMBER,
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

var sendEmail = function(message, email) {
  sparky.transmissions.send({
      options: {
        endpoint: 'lanre.co'
      },
      content: {
        from: 'babajide@lanre.co',
        subject: 'New Hobby',
        html:'<html><body><p>'+ message +'</p></body></html>'
      },
      recipients: [
        {address: email}
      ]
    })
    .then(data => {
      console.log('Email sent!');
      console.log(data);
    })
    .catch(err => {
      console.log('Error sending mail');
      console.log(err);
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

    createNewHobby(req, res) {
        var name = req.param('name');
        var userId = req.param('userId');
        
    
        User.findOne({ id: userId }).exec(function(error, user) {
          if (error) {
            return res.negotiate(error);
          }
          if(!user){
            return res.notFound("User not found");
          }

          var message = "Hello "+  user.firstName + " " + user.lastName + ".\nThanks for signing up on hobstop. You created a new hobby: " + name + ". Hope you stick to it.";
          Hobby.create({ name: name, userId: userId }).exec(function(error, newHobby) {
            if (error) {
                return res.negotiate(error);
            }
            sendSMS(message, user.phoneNumber);
            sendEmail(message, user.email);
    
            return res.json(newHobby);
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
