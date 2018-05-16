/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Emailaddresses = require('machinepack-emailaddresses');
var Passwords = require('machinepack-passwords');

module.exports = {
    getUserDetails: function(req, res) {
        User.findOne({ id: req.param('userId')
        }, function foundUser(err, createdUser) {
          if (err) return res.negotiate(err);
          return res.ok(createdUser);
      });
    },

    signin: function (req, res) {    
        User.findOne({ email: req.param('email')
        }, function foundUser(err, createdUser) {
          if (err) return res.negotiate(err);
          if (!createdUser) return res.notFound("User not found");
    
          Passwords.checkPassword({
            passwordAttempt: req.param('password'),
            encryptedPassword: createdUser.password
          }).exec({
    
            error: function (err){
              return res.negotiate(err);
            },
    
            incorrect: function (){
              return res.notFound("Password is incorrect");
            },
    
            success: function (){
              // Respond with a 200 status
              return res.ok(createdUser.id);
            }
          });
        });
    }, 

	signup: function(req, res) {
        if (_.isUndefined(req.param('email'))) {
            return res.badRequest('An email address is required!');
        }
        if (_.isUndefined(req.param('password'))) {
            return res.badRequest('A password is required!');
        }
        if (req.param('password').length < 6) {
            return res.badRequest('Password must be at least 6 characters!');
        }
        if (_.isUndefined(req.param('firstName'))) {
            return res.badRequest('Your first name is required!');
        }
        if (_.isUndefined(req.param('lastName'))){
            return res.badRequest('Your last name is required!');
        }
        if (!_.isString(req.param('password')) ||
            req.param('password').match(/[^a-z0-9]/i)) {
            return res.badRequest('Invalid password: It must consist of numbers and letters only.');
        }
        Emailaddresses.validate({
            string: req.param('email')
            }).exec({
            error: function(err) {
                return res.serverError(err);
            },
            invalid: function() {
                return res.badRequest('Not a valid email address!');
            },
            success: function() {
                Passwords.encryptPassword({
                    password: req.param('password'),
                }).exec({
                error: function(err) {
                    return res.serverError(err);
                },
                success: function(result) {
                    var options = {
                        email: req.param('email'),
                        firstName: req.param('firstName'),
                        lastName: req.param('lastName'),
                        phoneNumber: req.param('phoneNumber'),
                        password: result
                    };
                    User.create(options).exec(function(err, createdUser) {
                        if (err) {
                            if (err.invalidAttributes && err.invalidAttributes.email &&  err.invalidAttributes.email[0] && 
                                err.invalidAttributes.email[0].rule === 'unique') {
                                    return res.send(409, 'Email address is already being used by another user, please use another.');
                            }
                            return res.negotiate(err);
                        }
                            return res.ok(createdUser.id);
                        });
                },
                });
            },
            
        });
    }
    
}


