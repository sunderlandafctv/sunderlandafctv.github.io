/**
* playerpage.min.js
* @author Ryan Comerford <https://ryncmrfrd.me>
* @link https://sunderlandafc.tv/player?ID=00
*/
var playerNames = FuzzySet();
const token = 'AIzaSyDBs9KZOutpxzd-_fNSUAl-nj0rW01XXJI';
var loadedVideos = !1;
$.ajax({
    type: 'GET',
    url: 'https://www.googleapis.com/drive/v3/files/1Sgoayrj1r7aLMYx6T4VoNpzmJWI6v1aA?key=AIzaSyDBs9KZOutpxzd-_fNSUAl-nj0rW01XXJI',
    data: {
        'alt': 'media'
    },
    success: function(msg) {
        Papa.parse(msg, {
            header: !0,
            complete: function(results) {
                for (var i = 0; i < results.data.length - 1; i++) {
                    playerNames.add(String(results.data[i].Name))
                }
                Search(results.data);
                LoadPlayerContent(results.data)
            }
        })
    }
});

function LoadPlayerContent(playercsv) {
    let url = new URL(window.location.href);
    let searchParams = new URLSearchParams(url.search);
    const id = searchParams.get('ID');
    var playerData = playercsv.filter(data => data.ID === id)[0];
    $.ajax({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/playlists?key=AIzaSyDBs9KZOutpxzd-_fNSUAl-nj0rW01XXJI",
        data: {
            'channelId': 'UCoh98rO2DkogICZKE-2fJ7g',
            'maxResults': '50',
            'part': 'snippet,contentDetails'
        },
        success: function(results) {
            if (!playerData) {
                $('#visibleScreen').html('<div class="flex h-center column" style="height: 80vh">' + '<h1 class="text-center accent" style="font-size: 150px; margin: 0;">404</h1>' + '<p class="text-center">The player your equested was not found.</p>' + '<p class="text-center"><a class="label accent" href="/"><span class="icon home"></span> Home</a></p>' + '</div>')
            } else if (playerData) {
                $(document).attr('title', playerData.Name + ' - SunderlandAFC.TV');
                $('#playerName').html('<strong class="accent">' + playerData.Name + '</strong> (' + playerData['Years '] + ')');
                $('#playerDescription').html(playerData.Overview);
                $('#playerImage').attr('src', 'bin/Players/' + playerData.ID + '.png');
                $('#playerGames').html(playerData.Appearances);
                $('#playerGoals').html(playerData.Goals);
                $('#playerDecadesLink').attr('href', 'decades/' + playerData.Decade + '.html').html(playerData.Decade + "'s");
                $('#playerStatsLink').attr('href', playerData.Statistics)
            }
            $.each(results.items, function(i) {
                var playlist = results.items[i];
                if (playlist.snippet.title == playerData.Name) {
                    $.ajax({
                        type: "GET",
                        url: "https://www.googleapis.com/youtube/v3/playlistItems?key=AIzaSyDBs9KZOutpxzd-_fNSUAl-nj0rW01XXJI",
                        data: {
                            'playlistId': playlist.id,
                            'maxResults': '50',
                            'part': 'snippet'
                        },
                        success: function(results) {
                            $('#watchVideos').text(playerData.Name);
                            $.each(results.items, function(i) {
                                $('#playerVideos').append('<article id="embededVideo">' + '<iframe src="https://www.youtube.com/embed/' + results.items[i].snippet.resourceId.videoId + '"></iframe>' + '</article>')
                            })
                        },
                        error: function(error) {
                            alert("Something's gone wrong :(");
                            console.error('Error: ' + error.responseJSON.error.message)
                        }
                    });
                    loadedVideos = !0
                }
            });
            if (loadedVideos == !1) {
                $('#ifVideos').html('No videos availible. <b class="accent">Sorry about that.</b>');
                $('footer').css({
                    'position': 'absolute',
                    'bottom': '0'
                })
            }
        },
        error: function(error) {
            alert("Something's gone wrong :(");
            console.error('Error: ' + error.responseJSON.error.message)
        }
    })
}
$('#searchInput').focus(function() {
    $('.search').addClass('focus')
});
$('#searchInput').focusout(function() {
    $('.search').removeClass('focus');
    $('#searchInput').val('');
    setTimeout(function() {
        $('.searchResults').html('');
        $('.searchResults').attr('')
    }, 2000)
});

function Search(parsedcsv) {
    const searchInput = $('#searchInput');
    searchInput.keyup(function() {
        if (playerNames.get(searchInput.val())) {
            var fuzzyresult = playerNames.get(searchInput.val())[0][1];
            $('.searchResults').html(fuzzyresult);
            $('.searchResults').attr('href', 'player.html?ID=' + parsedcsv.filter(data => data.Name === fuzzyresult)[0].ID)
        } else {
            $('.searchResults').html('')
        }
    })
}