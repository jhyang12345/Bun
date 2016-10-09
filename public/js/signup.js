$(document).ready(function() {

  console.log("Width of window", $(window).width());
  $('#inputFirstName').keyup(function(e) {
    if($('#inputFirstName').val().length <= 1) {
      $('#inputFirstName').val($('#inputFirstName').val()[0].toUpperCase());
    }
  });

  $('#inputLastName').keyup(function(e) {
    if($('#inputLastName').val().length <= 1) {
      $('#inputLastName').val($('#inputLastName').val()[0].toUpperCase());
    }
  });

  $('#signup2').on('click', function() {
    event.preventDefault();
    window.location.href = "./signup.html";
  });

  $('#signup').on('click', function(event) {
    event.preventDefault();
    if(!IsEmail($('#signupEmail').val())) {
      $('#notemail').show();
      console.log('wrong email');
    } else if($('#signupPassword').val() != $('#confirmPassword').val()) {
      alert('Check if passwords match');
    } else if(!IsLongEnough($('#signupPassword').val())) {
      alert('Passwords need to be at least 8 characters long');
    } else if(IsntName($('#inputFirstName').val())) {
      console.log('Special characters are forbidden in names');
      alert('Special characters are forbidden in names');

    } else if(IsntName($('#inputLastName').val())) {
      console.log('Special characters are forbidden in names');
      alert('Special characters are forbidden in names');

    } else {
      var user = new Parse.User();
      var username =  $.trim($('#signupEmail').val()).toLowerCase();
      user.set("username", username);
      user.set("password", $('#signupPassword').val());
      user.set("FirstName", $('#inputFirstName').val());
  	  console.log($('#inputFirstName').val());
      user.set("LastName", $('#inputLastName').val());
      user.signUp(null, {
        success: function(user) {
          Parse.User.logOut();
          alert("Successfully Signed up!");
          window.location.href = "./index.html";
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
          alert("Error: " + error.code + " " + error.message);
        }
      });

    }
  });

  function IsntName(name) {
    var weird = '!@#$%^&*()+=<>?/:"\;\'\"\{\}\[\]';
    weird = weird.split("");
    console.log(weird);
    for(var i = 0; i < name.length; ++i) {
        if($.inArray(name[i], weird) != -1) {
          console.log("Went through");
          return true;
        }
    }
    return false;
  }

  function IsEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  $('.close').on('click', function() {
    $(this).hide();
  });

  jQuery.fn.center = function () {
      this.css("position","absolute");
      this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) +
                                                  $(window).scrollLeft()) + "px");
      return this;
  }

  $('#notemail').css('width', $('#signupPassword').width()+20);
  $('#fixpassword').css('width', $('#signupPassword').width()+20);
  $('#notemail').hide();
  $('#fixpassword').hide();

  $('#signupEmail').focusout(function() {
    if(!IsEmail($('#signupEmail').val())) {
      $('#notemail').show();
    }
  });
  $('#signupEmail').focus(function() {
    $('#notemail').hide();
  });

  $(window).resize(function() {
    $('#notemail').center();
    $('#fixpassword').center();
  });

  function IsLongEnough(string) {
    if(string.length < 8) {
      return false;
    }
    else {
      return true;
    }
  }

  //input password alert
  $('#signupPassword').focus(function() {
    $('#fixpassword').hide();
  });

  //input password alert
  $('#signupPassword').focusout(function() {
    if(!IsLongEnough($('#signupPassword').val())) {
      $('#fixpassword').show();
    }
  });


  //confirm password alert
  $('#confirmPassword').focusout(function() {
    if(!IsEmail($('#signupEmail').val())) {

    }
  });

  //make new user

});
