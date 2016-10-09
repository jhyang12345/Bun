
Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

$('#signup').on('click', function(event) {
  event.preventDefault();
  if(!IsEmail($('#inputEmail').val())) {
    $('#notemail').show();
    console.log('wrong email');
  } else if($('#inputPassword').val() != $('#confirmPassword').val()) {
    alert('Check if passwords match');
  } else {
    var user = new Parse.User();
    user.set("username", $('#inputEmail').val());
    user.set("password", $('#inputPassword').val());
    user.signUp(null, {
      success: function(user) {
        
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
  }
});


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

$('#notemail').css('width', $('#inputPassword').width()+20).center();
$('#fixpassword').css('width', $('#inputPassword').width()+20).center();
$('#notemail').hide();
$('#fixpassword').hide();

$('#inputEmail').focusout(function() {
  if(!IsEmail($('#inputEmail').val())) {
    $('#notemail').show();
  }
});
$('#inputEmail').focus(function() {
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
$('#inputPassword').focus(function() {
  $('#fixpassword').hide();
});

//input password alert
$('#inputPassword').focusout(function() {
  if(!IsLongEnough($('#inputPassword').val())) {
    $('#fixpassword').show();
  }
});


//confirm password alert
$('#confirmPassword').focusout(function() {
  if(!IsEmail($('#inputEmail').val())) {

  }
});

//make new user
