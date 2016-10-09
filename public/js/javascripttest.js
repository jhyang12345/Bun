
$(document).ready(function() {
  Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

$('#signin').on('click', function(event) {
  event.preventDefault();
  var user = new Parse.User();
  user.set("username", $('#inputEmail').val());
  user.set("password", $('#inputPassword').val());
  Parse.User.logIn($('#inputEmail').val(), $('#inputPassword').val(), {
    success: function(user) {
      window.location.href = "./testmainpage.html";
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
