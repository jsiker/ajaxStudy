
function loadData() {

    var $body = $('body');
    var $wikiElem = $('#wikipedia-links');
    var $nytHeaderElem = $('#nytimes-header');
    var $nytElem = $('#nytimes-articles');
    var $greeting = $('#greeting');

    // clear out old data before new request
    $wikiElem.text("");
    $nytElem.text("");

    // load streetview

    // YOUR CODE GOES HERE!
    var addressInput = $('#street').val();
    var cityInput = $('#city').val();
    var address = addressInput + ', ' + cityInput;
    var state = cityInput.slice(-2); //get state name
    var city = cityInput.substr(0, cityInput.length - 4); //get city name w/o state abbr

    $greeting.text('You want to live at ' + address);

    var bgImgURL =  "https://maps.googleapis.com/maps/api/streetview?size=600x600&location=" + address + '"';

    $body.append('<img class="bgimg" src=" '+bgImgURL+' ">');

    //NYT Ajax Request
    var nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?&q=' + cityInput.toUpperCase() + '&sort=newest&api-key=5e440af1acab4a1c2057e6c7caab7ea5:0:53972115';
    $.getJSON(nytURL, function(data) {
        $nytHeaderElem.text('New York Times Articles About ' + cityInput);

        articles = data.response.docs;
        for (var i = 0; i < 5; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">' +
                '<a href="' + article.web_url + '">' + article.headline.main + '</a>' +
                '<p>' + article.snippet + '</p>' +
                '</li>');
        }
    }).error(function(e) {
        $nytHeaderElem.text('Sorry, Articles Could Not Be Loaded About ' + cityInput + '.')
    });


        //Weather Underground
     $.ajax({
          url : "http://api.wunderground.com/api/916bb7fdf62d3576/geolookup/conditions/q/" + state + "/" + city + ".json",
          dataType : "jsonp",
          success : function(parsed_json) {
          var location = parsed_json['location']['city'];
          var temp_f = parsed_json['current_observation']['temp_f'];
          var image_url = 'http://icons.wxug.com/i/c/j/' + parsed_json['current_observation']['icon'] + '.png';
          $greeting.append("<p>Current temperature in " + location + " is: " + temp_f + "°F <img src="+image_url+"></p>");
          }
      });


    //WIKI request using JSONP (to deal with CORS TKTKTKTK)
    // must have seperate error function here, JSONP doesn't allow chaining of error methods to success function
    var wikiRequestTimeout = setTimeout(function(){
        $wikiElem.html('Failed to load Wikipedia ' + '<a href="https://wikimediafoundation.org/wiki/Ways_to_Give">' + 'resources' + '</a>');
    }, 2000);
    $.ajax({
        url: 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + cityInput + '&format=json&callback=wikiCallback',
        dataType: 'jsonp',
        success: function(response) {
            var articleList = response[1]; // [1] is an array of articles with articleStr as title
            for(var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
            }
            clearTimeout(wikiRequestTimeout); //stops timeout in error method so it doesn't run when request is successful
        }
    });
    var flag = 'http://ajax.googleapis.com/ajax/services/search/images?v=1.0&q=' + cityInput;

    return false;
}

$('#form-container').submit(loadData);

// loadData();
