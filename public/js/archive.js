Parse.initialize("R6Za2GZWzmkKmvssylL7J9qyVxmP2rPgxoYmOvMq", "qzqQDTPpWPmyYNvWaN5ON9YtnWhFS8mGKHO9UrBO");

var Title = Parse.Object.extend("Title");
var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("Comment");

var loaded = false;

var month = new Array();
month[0] = "January";
month[1] = "February";
month[2] = "March";
month[3] = "April";
month[4] = "May";
month[5] = "June";
month[6] = "July";
month[7] = "August";
month[8] = "September";
month[9] = "October";
month[10] = "November";
month[11] = "December";

$(document).ready(function() {

  //	location.reload(true);
  var newheight = $('.navbar').height();
  $('.sidebar').css('margin-top', newheight + 'px');
  $('.sidebar').css('height', $(window).height() + 'px');
//  $('.main-container').css('margin-top', newheight+'px');
//  $('.main-container').css('margin-left', $('.sidebar').width()+30 + 'px');

  $('#makepost').on('click', function() {
    window.location.href = "./post.html";
  });

  $(window).resize( function() {
  //    $('.main-container').css('margin-left', $('.sidebar').width()+30 + 'px');
  //    $('.main-container').width($('.navbar').css('width') - $('.sidebar').width() - 30 + 'px');
  });

  $('.promptbox').css('left', $(window).width() / 2 - $('.promptbox').width() / 2);
  $('.promptbox').css('top', $(window).height() / 2 - $('.promptbox').height() / 2);


  $('#mapcloser').on('click', function() {
    $('#mapholder').fadeOut('fast');
  });

  $('#archivesearch').keypress(function(e) {
    if(e.keyCode == 13) {
      $('.tablerow').each(function() {
        $(this).remove();
      });
      var titleQuery = new Parse.Query(Title);
      titleQuery.include("Author");
      titleQuery.descending("createdAt");
      titleQuery.contains('lowertitle', $.trim($('#archivesearch').val()).toLowerCase());
      $('#overlay').on('click', function() {
        $('#overlay').css('display', 'none');
        $('#postviewer').empty();
        $('#postviewer').remove();
        $('#mapholder').fadeOut('fast');
      });
      titleQuery.find({
        success: function(obj) {
          var datelabel;

          console.log(obj.length);
          for(var i = 0; i < obj.length; ++i) {

            var d = obj[i].createdAt;
            datelabel = getDatelabel(d)
            var id = obj[i].get('from');

            $('tbody').append('<tr class="tablerow" id="row' + obj[i].get("from") + '"><td><span class="rowtitle">' + obj[i].get("title") +
            '</span><span class="rowinfo"></span></td><td>' +
              obj[i].get("Author").get("FirstName") + ' ' + obj[i].get("Author").get("LastName") + '</td><td>' +
              datelabel + '</td></tr>'
            );

            $('#row' + obj[i].get("from")).children('td').children('.rowinfo').append('<span class="smilecount">0</span>' +
            '<img class="archivesmiley" src="pictures/smileygray.png" />' +
            '<span class="commentcount">0</span>' +
            '<img class="archivecomment" src="pictures/comment.png" />');

            if(mobile) {
              $('#row' + obj[i].get("from")).children('td').children('.rowinfo').children('.archivesmiley').after('<br>');
              $('#row' + obj[i].get("from")).children('td:first-child').css('padding-right', $('#row' + obj[i].get("from")).children('td').children('.rowinfo').width());

            }

            Parse.Cloud.run('commentnumber', {Post: id}).then(function(response) {
              var number = response.number;
              console.log(response.number);
              $('#row' + response.postid).children('td').children('.rowinfo').children('.commentcount').html(number);
              if(mobile) {
                $('#row' + response.postid).children('td:first-child').css('padding-right', $('#row' + response.postid).children('td').children('.rowinfo').width());
              }
            });

            Parse.Cloud.run('SmilesId', {Post: id}).then(function(response) {
              console.log(response);
              $('#row' + response.postid).children('td').children('.rowinfo').children('.smilecount').html(response.smiles);
            });

            Parse.Cloud.run('hasSmiledId', {Post: id, User: Parse.User.current().id}).then(function(response) {
              if(response.smiled) {
                $('#row' + response.postid).children('td').children('.rowinfo').children('.archivesmiley').attr('src', 'pictures/brightsmile.png');
              }
            });

            console.log("Running commentnumber");


            $('#row' + obj[i].get("from")).on('click', function() {
              console.log("list item clicked!");
              $('#overlay').css('display', 'block');

              $('#postviewer').remove();
              $('body').append('<div id="postviewer"><button type="button" class="close postcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');

              $('#postviewer').on('click', function() {
                $('.postcloser').css('visibility', 'visible');
                setTimeout(function() {
                  $('.postcloser').css('visibility', 'none');
                },2000);
              });

              $('.postcloser').on('click', function() {
                $('#overlay').click();
              });

              $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
              $(window).resize(function() {
                  $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
              });
              console.log($(this).attr('id'));
              var query = new Parse.Query(Post);
              query.include("contents");
              query.include("Author");
              query.equalTo("objectId", $(this).attr('id').substring(3));
              query.limit(1);
              query.descending("createdAt");

              //get Post from objectId
              scrollbuffer = $(window).scrollTop();

              $('body,html').animate({scrollTop: 0}, 100);
              getPost($(this).attr('id').substring(3), $('#postviewer'));

            });
          }
        }, error: function(err) {
          console.log("Something went wrong");
        }
      });

    }
  });

  var titleQuery = new Parse.Query(Title);
  titleQuery.include("Author");
  titleQuery.descending("createdAt");

  $('#overlay').on('click', function() {
    $('#overlay').css('display', 'none');
    $('#postviewer').empty();
    $('#postviewer').remove();
    $('#mapholder').fadeOut('fast');
    $('body,html').animate({scrollTop: scrollbuffer}, 100);
  });
  titleQuery.find({
    success: function(obj) {
      var datelabel;

      console.log(obj.length);
      for(var i = 0; i < obj.length; ++i) {

        var d = obj[i].createdAt;
        datelabel = getDatelabel(d)
        var id = obj[i].get('from');

        $('tbody').append('<tr class="tablerow" id="row' + obj[i].get("from") + '"><td><span class="rowtitle">' + obj[i].get("title") +
        '</span><span class="rowinfo"></span></td><td>' +
          obj[i].get("Author").get("FirstName") + ' ' + obj[i].get("Author").get("LastName") + '</td><td>' +
          datelabel + '</td></tr>'
        );

        $('#row' + obj[i].get("from")).children('td').children('.rowinfo').append(' <span class="smilecount">0</span>' +
        '<img class="archivesmiley" src="pictures/smileygray.png" />' +
        '<span class="commentcount">0</span>' +
        '<img class="archivecomment" src="pictures/comment.png" />');

        if(mobile) {
          $('#row' + obj[i].get("from")).children('td').children('.rowinfo').children('.archivesmiley').after('<br>');
          $('#row' + obj[i].get("from")).children('td:first-child').css('padding-right', $('#row' + obj[i].get("from")).children('td').children('.rowinfo').width());

        }

        Parse.Cloud.run('commentnumber', {Post: id}).then(function(response) {
          var number = response.number;
        //  console.log(response.number);
          $('#row' + response.postid).children('td').children('.rowinfo').children('.commentcount').html(number);
          if(mobile) {
            $('#row' + response.postid).children('td:first-child').css('padding-right', $('#row' + response.postid).children('td').children('.rowinfo').width());
          }
        });


        Parse.Cloud.run('SmilesId', {Post: id}).then(function(response) {
        //  console.log(response);
          $('#row' + response.postid).children('td').children('.rowinfo').children('.smilecount').html(response.smiles);
        });

        Parse.Cloud.run('hasSmiledId', {Post: id, User: Parse.User.current().id}).then(function(response) {
          console.log(response);
          if(response.smiled) {
            $('#row' + response.postid).children('td').children('.rowinfo').children('.archivesmiley').attr('src', 'pictures/brightsmile.png');
          }
        });

        $('#row' + obj[i].get("from")).on('click', function() {
          console.log("list item clicked!");
          $('#overlay').css('display', 'block');

          $('#postviewer').remove();
          $('body').append('<div id="postviewer"><button type="button" class="close postcloser" aria-label="Close"><span aria-hidden="true">&times;</span></button></div>');

          $('#postviewer').on('click', function() {
            $('.postcloser').css('visibility', 'visible');
            setTimeout(function() {
              $('.postcloser').css('visibility', 'none');
            },2000);
          });

          $('.postcloser').on('click', function() {
            $('#overlay').click();
          });

          $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
          $(window).resize(function() {
              $('#postviewer').css('left', $(window).width() / 2 - $('#postviewer').width() / 2 + 'px');
          });
          console.log($(this).attr('id'));
          var query = new Parse.Query(Post);
          query.include("contents");
          query.include("Author");
          query.equalTo("objectId", $(this).attr('id').substring(3));
          query.limit(1);
          query.descending("createdAt");

					//get Post from objectId
          scrollbuffer = $(window).scrollTop();

          $('body,html').animate({scrollTop: 0}, 100);
					getPost($(this).attr('id').substring(3), $('#postviewer'));

        });
      }
    }, error: function(err) {
      console.log("Something went wrong");
    }
  });

});
