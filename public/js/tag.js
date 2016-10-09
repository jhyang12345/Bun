
var loaded = false;

var mainpagemap;

var loadedlist = [];

//last time the post was loaded
var latest;
var earliest;

$(document).ready(function() {
  if(mobile) {
    $(window).scroll(function() {
      $('.bigtag').fadeIn('fast');
      $('.postcount').fadeIn('fast');
    });

    $(window).scroll(function() {
      clearTimeout($.data(this, 'scrollTimer'));
      $.data(this, 'scrollTimer', setTimeout(function() {
      $('.bigtag').fadeOut('fast');
      $('.postcount').fadeOut('fast');
        console.log("Haven't scrolled in 250ms!");
      }, 500));
    });
  }

  timerUpdate();

  bottomDetect($(window));

  topDetect($(window));

  if(getUrlVars()["tag"] == "") {
    $('.bigtag').append("etc.");
  } else {
    $('.bigtag').append(getUrlVars()["tag"]);
  }

  Parse.Cloud.run('postCount', {tag: getUrlVars()["tag"]}).then(function(response) {
    $('.postcount').append(response);
    if(!mobile) {
      $('.postcount').css('display', 'block');
    }
  });


  $(window).on('bottomevent', function() {
    var query = new Parse.Query('Post');
    query.descending("updatedAt");
    query.lessThan('updatedAt', latest);
    query.limit(3);
    query.equalTo('tag', getUrlVars()["tag"]);
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
    query.equalTo('tag', getUrlVars()["tag"]);
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


  $('#makepost').on('click', function() {
    window.location.href = "./post.html";
  });

  $('span.timestamp').on('recurseupdateevent', function() {
    $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
  });

  $('span.comment-time').on('recurseupdateevent', function() {
    $(this).html(getCurrentTime(Date.parse($(this).attr('id'))));
  });

  //query to find posts
  var query = new Parse.Query("Post");
  query.include("contents");
  query.include("Author");
  query.equalTo('tag', getUrlVars()["tag"]);
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

  $(window).resize( function() {
  //    $('.main-container').css('margin-left', $('.sidebar').width()+30 + 'px');
  //    $('.main-container').width($('.navbar').css('width') - $('.sidebar').width() - 30 + 'px');
  });

  console.log("Value of tag is", getUrlVars()["tag"]);

});
