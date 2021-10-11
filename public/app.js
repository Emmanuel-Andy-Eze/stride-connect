"use strict";

function sharePost() {
    if (navigator.share) {
        navigator.share({
          title: `${post.title}`,
          text: `${post.description}`,
          url: window.location.href
        }).then(() => {
          console.log('Thanks for sharing!');
        })
        .catch(err => {
          console.log(`Couldn't share because of`, err.message);
        });
      } else {
        console.log('web share not supported');
      }
}

$(function() {
    var $newPostForm = $( "#new-post-form" );

    if( $newPostForm.length ) {
        $newPostForm.on( "submit", function( e ) {
            e.preventDefault();
            $newPostForm.find( ".invalid-feedback" ).remove();
            $newPostForm.find( ".is-invalid" ).removeClass( "is-invalid" );

            var formData = new FormData();
            formData.append( "description", $( "#description" ).val() );
            formData.append( "image", $( "#image" )[0].files[0] );

            var settings = {
                url: $newPostForm.attr( "action" ),
                type: "POST",
                data: formData,
                processData: false,
                contentType: false,
                success: function( res ) {
                    if( res.errors ) {
                        res.errors.forEach(function( err ) {
                            $newPostForm.find( "[name=" + err.param + "]" ).addClass( "is-invalid" ).after( '<span class="invalid-feedback" role="alert"><strong>' + err. msg + '</strong></span>' );
                        });
                    } else if( res.created ) {
                        window.location = "/posts/" + res.postid;
                    } else {
                        console.log( res );
                    }
                }
            };

            $.ajax( settings );
        });
    }


    var $followBtn = $( "#follow-btn" );

    if( $followBtn.length ) {
        $followBtn.click(function() {
            var data = {
                followers: $followBtn.data( "followers" ),
                following: $followBtn.data( "following" ),
                action: $followBtn.data( "action" )
            };

            $.post( "/users/follow", data, function( res ) {
              if( res.done ) {  
                var text = $followBtn.data( "action" ) === "follow" ? "Unfollow" : "Follow";
                var count = parseInt( $( "#followers" ).text(), 10 );

                if( text === "Unfollow" ) {
                    $( "#followers" ).text( count + 1 );
                    $followBtn.data( "action", "unfollow" ).text( text );
                } else {
                    $( "#followers" ).text( count - 1 ); 
                    $followBtn.data( "action", "follow" ).text( text );
                }
              }  
            });
        });
    }
});