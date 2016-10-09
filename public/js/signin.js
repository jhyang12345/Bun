
$(document).ready(function() {
  Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

  var emailAdd = $.trim($(this).text());

  $('#signin').on('click', function(event) {
    event.preventDefault();
    var user = new Parse.User();
    var username = $.trim($('#inputEmail').val()).toLowerCase();
    user.set("username", username);
    console.log("'"+username+"'");
    user.set("password", $('#inputPassword').val());
    Parse.User.logIn(username, $('#inputPassword').val(), {
      success: function(user) {
        window.location.href = "./mainpage.html";
      },
      error: function(user, error) {
        alert('wrong password or id');
      }
    });
    var cururl = window.location.href;
  });

  $('#signin2').on('click', function(event) {
    event.preventDefault();
    var user = new Parse.User();
    var username = $.trim($('#inputEmail2').val()).toLowerCase();
    user.set("username", username);
    console.log("'"+username+"'");
    user.set("password", $('#inputPassword2').val());
    Parse.User.logIn(username, $('#inputPassword2').val(), {
      success: function(user) {
        window.location.href = "./mainpage.html";
      },
      error: function(user, error) {
        alert('wrong password or id');
      }
    });
    var cururl = window.location.href;
  });
});



$( document ).ready(function() {
    console.log( "ready!" );
});
