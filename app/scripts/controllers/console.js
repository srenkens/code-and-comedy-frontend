'use strict';

/**
 * @ngdoc function
 * @name codeAndComedyApp.controller:ConsoleCtrl
 * @description
 * # ConsoleCtrl
 * Controller of the codeAndComedyApp
 */
angular.module('codeAndComedyApp')
  .controller('ConsoleCtrl', ['$scope', '_', 'RegistrationsService', 'HelperService', ConsoleCtrl]);

function ConsoleCtrl ($scope, _, RegistrationsService, helper) {
  var numBadTries = 0;
  var ee = false,
      ez = false,
      nameAsked = false,
      emailAsked = false,
      name,
      email;

  setTimeout(function () {
    init();
    $scope.$apply();
  }, 200);

  function init(){
    printToConsole(['---------------------'], 'limegreen');
    printToConsole(['Available commands:'], 'green');
    printToConsole(['- ez: Simpler, interactive registration for less experienced users'], 'blue');
    printToConsole(['- register -m "email address" -n "name": Register for the Code & Comedy event'], 'green');
    printToConsole(['- as: Number of available seats'], 'green');
    printToConsole(['- help: This menu'], 'green');
    printToConsole(['---------------------'], 'limegreen');
  }

  function printToConsole(text, level){
    $scope.$broadcast('terminal-output', {
      output: true,
      text: text,
      breakLine: true,
      level: level
    });
  }

  function printSeatsLeft(){
    RegistrationsService.availability(function(res){
      var seatsLeft = res.availability;
      var level;
      if(seatsLeft == 0){
        level = 'red';
      }
      printToConsole([seatsLeft + " seats left"], level);
    }, function(err){
      printToConsole(['An error occured.', 'Please try again later or contact the administrator'], 'red');
    });
  }

  function registerGuest(cmd){
    var email = cmd[cmd.indexOf('-m') + 1].replace('"', '');
    var name = cmd[cmd.indexOf('-n') + 1].replace('"', '');
    var output;
    if(!name || cmd.indexOf('-n') === -1){
      printToConsole(['You have not entered a valid name'], 'red')
      return;
    }
    if(!email || cmd.indexOf('-m') === -1 || !helper.validateEmail(email)){
      printToConsole(['You have not entered a valid E-Mail address'], 'red')
      return;
    }

    var registration = {
      email: email,
      name: name,
      event_id: 1
    };

    RegistrationsService.register(registration, function(res){
      output = [
        name + ' has been registered with E-Mail address ' + email + '.',
        '',
        'We hope you will enjoy your evening.'
      ];

      printToConsole(output, 'green');
    }, function(err){
      console.log(err);
      switch(err.status){
        case 409:
          output = ['The user ' + name + ' has already registered with the e-mail address ' + email + ' before.',
                    'Please try again with a different account.'];
          break;
        default:
          output = ['An error occured.', 'Please try again later or contact the administrator'];
          break;
      }
      printToConsole(output, 'red');
    });
  }

  function ezRegistration(cmd){
    console.log(cmd);
    if(!name){
      if(!nameAsked){
        printToConsole(['What is your first name?']);
        nameAsked = true;
        return;
      } else {
        if(!cmd[0] || cmd[0].length == 0){
          printToConsole(['You have not entered a valid name'], 'red')
          return;
        }
        name = cmd[0];
      }
    }
    if(!email){
      if(!emailAsked){
        printToConsole(['What is your E-Mail address?']);
        emailAsked = true;
        return;
      } else {
        if(!cmd[0] || cmd[0].length == 0 || !helper.validateEmail(email)){
          printToConsole(['You have not entered a valid E-Mail address'], 'red')
          return;
        }
        email = cmd[0];
      }
    }
    if(email && name){
      registerUser(name, email, function(){
        nameAsked = false;
        emailAsked = false;
        name = undefined;
        email = undefined;
        ez = false;
      });
    }
  }

  function registerUser(name, email, cb){
    var output;
    var registration = {
      email: email,
      name: name,
      event_id: 1
    };

    RegistrationsService.register(registration, function(res){
      output = [
        name + ' has been registered with E-Mail address ' + email + '.',
        '',
        'We hope you will enjoy your evening.'
      ];

      printToConsole(output, 'green');
      cb();
    }, function(err){
      console.log(err);
      switch(err.status){
        case 409:
          output = ['The user ' + name + ' has already registered with the e-mail address ' + email + ' before.',
            'Please try again with a different account.'];
          break;
        default:
          output = ['An error occured.', 'Please try again later or contact the administrator'];
          break;
      }
      printToConsole(output, 'red');
      cb();
    });
  }

  $scope.$on('terminal-input', function (e, consoleInput) {
    // split the entire string so we can interpret word by word
    var cmd = consoleInput[0].command.split(' ');

    if(ez){
      ezRegistration(cmd);
      return;
    }

    // register the user for the CnC-event
    if(cmd.indexOf('register') !== -1){
      registerGuest(cmd);
      return;
    }

    // display the number of available seats
    if(cmd.indexOf('ez') !== -1){
      ez = true;
      ezRegistration(cmd);
      return;
    }

    // display the number of available seats
    if(cmd.indexOf('as') !== -1){
      printSeatsLeft();
      return;
    }

    // summon help menu
    if(cmd.indexOf('help') !== -1){
      init();
      return;
    }

    // The ultimate question
    if(consoleInput[0].command.indexOf('What is the answer to life, the universe and everything?') !== -1){
      printToConsole(
        [
          "The answer is:"
        ], 'blue'
      );
      var i = 0;
      var interval = setInterval(function(){
        i++;
        printToConsole(["."], 'blue');
        if(i >= 5){
          printToConsole(["42"], 'blue');
          clearInterval(interval);
        }
        $scope.$apply();
      }, 500);
      return;
    }

    if(!ee){
      if(numBadTries < 3 && numBadTries >= 0){
        printToConsole(['Unknown command: ' + consoleInput[0].command], 'yellow');
      } else if(numBadTries < 4 && numBadTries >= 3){
        printToConsole(['Try the \'help\' command for a list of available commands'], 'yellow');
      } else if(numBadTries >= 4){
        printToConsole(['Are you dense or are you trying to trick me?'], 'yellow');
        numBadTries = -1;
        ee = true;
      }
      numBadTries++;
    } else {
      printToConsole(['Stop that right now.'], 'red');
    }
  });
}
