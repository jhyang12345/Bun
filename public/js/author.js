var loaded = false;

var mainpagemap;

var loadedlist = [];

//last time the post was loaded
var latest;
var earliest;

var user;

$(document).ready(function() {

  if(mobile) {
    $(window).scroll(function() {
      $('#postsby').fadeIn('fast');
      $('.authorpostcount').fadeIn('fast');
    });

    $(window).scroll(function() {
      clearTimeout($.data(this, 'scrollTimer'));
      $.data(this, 'scrollTimer', setTimeout(function() {
      $('#postsby').fadeOut('fast');
      $('.authorpostcount').fadeOut('fast');
        console.log("Haven't scrolled in 250ms!");
      }, 500));
    });
  }

  timerUpdate();

  bottomDetect($(window));

  topDetect($(window));

  Parse.Cloud.run('nameCount', {user: getUrlVars()["author"]}).then(function(num) {
    $('.authorpostcount').html(num);
    if(!mobile) {
      $('.authorpostcount').css('display', 'block');
    }
  });

  var userquery = new Parse.Query(Parse.User);
  userquery.equalTo('objectId', getUrlVars()['author']);
  userquery.first({
    success: function(object) {
      user = object;
      $('#postsby').append(user.get('FirstName') + ' ' + user.get('LastName'));
      var newpic = user.get("ProfilePic");
      if(newpic == undefined) {
          $('.postsbyProfilePic').attr('src', 'pictures/profile.png');
      } else {
          $('.postsbyProfilePic').attr('src', newpic.url());
          $('.postsbyProfilePic').load(function() {
            if ($(this).height() > $(this).width()) {
              console.log("CHECKED LONGER");
              $(this).addClass('heightlong');
            };
          });
      }
    }, error: function(err) {

    }
  }).then(function(result) {
    $(window).on('bottomevent', function() {
      var query = new Parse.Query('Post');
      query.descending("updatedAt");
      query.lessThan('updatedAt', latest);
      query.limit(3);
      query.equalTo('Author', user);
      query.find({
        success:function(results) {
          for(var i = 0; i < results.length; ++i) {
            console.log("adding post");
            if(!(results[i].id in loadedlist)) {
              loadedlist.push(results[i].id);
              latest = results[i].updatedAt;
              getPost(results[i].id, $('.main-container'));
              console.log("Updated At", results[i].updatedAt);
            }
          }
        }, error: function(err) {

        }
      });
    });

    $(window).on('topevent', function() {
      var query = new Parse.Query('Post');
      query.greaterThan('updatedAt', earliest);
      query.descending("updatedAt");
      query.equalTo('Author', user);
      query.limit(3);
      query.find({
        success:function(results) {
          results.reverse();
          for(var i = 0; i < results.length; ++i) {
            console.log("adding post");
            if(!(results[i].id in loadedlist)) {
              loadedlist.push(results[i].id);
              earliest = results[i].updatedAt;
              getPosttoFront(results[i].id, $('.main-container'));
              console.log("Updated At", results[i].updatedAt);
            }
          }
        }
      });
    });

    //query to find posts
    var query = new Parse.Query("Post");
    query.include("contents");
    query.include("Author");
    query.equalTo('Author', user);
    query.limit(5);
    query.descending("updatedAt");
    query.find({
      success: function(results) {
        earliest = results[0].updatedAt;
        for(var x = 0; x < results.length; x++) {
          latest = results[x].updatedAt;
          if(!(results[x].id in loadedlist)) {
            getPost(results[x].id, $('.main-container'));
            loadedlist.push(results[x].id);
          }

        }
      }, error: function(err) {

      }
    });

  });


  $('#makepost').on('click', function() {
    window.location.href = "./post.html";
  });

  $('span.timestamp').on('recurseupdateevent', function() {
    $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
  });

  $('span.comment-time').on('recurseupdateevent', function() {
    $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
  });


  console.log("Value of tag is", getUrlVars()["tag"]);

});
