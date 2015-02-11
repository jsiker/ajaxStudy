
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
    var state = cityInput.slice(-2).toUpperCase(); //get state name
    var city = cityInput.substr(0, cityInput.length - 4); //get city name w/o state abbr

    //convert abbr to full name
    function convert_state(name, to) {
//        var name = state;
        var states = new Array(                         {'name':'Alabama', 'abbrev':'AL'},          {'name':'Alaska', 'abbrev':'AK'},
            {'name':'Arizona', 'abbrev':'AZ'},          {'name':'Arkansas', 'abbrev':'AR'},         {'name':'California', 'abbrev':'CA'},
            {'name':'Colorado', 'abbrev':'CO'},         {'name':'Connecticut', 'abbrev':'CT'},      {'name':'Delaware', 'abbrev':'DE'},
            {'name':'Florida', 'abbrev':'FL'},          {'name':'Georgia', 'abbrev':'GA'},          {'name':'Hawaii', 'abbrev':'HI'},
            {'name':'Idaho', 'abbrev':'ID'},            {'name':'Illinois', 'abbrev':'IL'},         {'name':'Indiana', 'abbrev':'IN'},
            {'name':'Iowa', 'abbrev':'IA'},             {'name':'Kansas', 'abbrev':'KS'},           {'name':'Kentucky', 'abbrev':'KY'},
            {'name':'Louisiana', 'abbrev':'LA'},        {'name':'Maine', 'abbrev':'ME'},            {'name':'Maryland', 'abbrev':'MD'},
            {'name':'Massachusetts', 'abbrev':'MA'},    {'name':'Michigan', 'abbrev':'MI'},         {'name':'Minnesota', 'abbrev':'MN'},
            {'name':'Mississippi', 'abbrev':'MS'},      {'name':'Missouri', 'abbrev':'MO'},         {'name':'Montana', 'abbrev':'MT'},
            {'name':'Nebraska', 'abbrev':'NE'},         {'name':'Nevada', 'abbrev':'NV'},           {'name':'New Hampshire', 'abbrev':'NH'},
            {'name':'New Jersey', 'abbrev':'NJ'},       {'name':'New Mexico', 'abbrev':'NM'},       {'name':'New York', 'abbrev':'NY'},
            {'name':'North Carolina', 'abbrev':'NC'},   {'name':'North Dakota', 'abbrev':'ND'},     {'name':'Ohio', 'abbrev':'OH'},
            {'name':'Oklahoma', 'abbrev':'OK'},         {'name':'Oregon', 'abbrev':'OR'},           {'name':'Pennsylvania', 'abbrev':'PA'},
            {'name':'Rhode Island', 'abbrev':'RI'},     {'name':'South Carolina', 'abbrev':'SC'},   {'name':'South Dakota', 'abbrev':'SD'},
            {'name':'Tennessee', 'abbrev':'TN'},        {'name':'Texas', 'abbrev':'TX'},            {'name':'Utah', 'abbrev':'UT'},
            {'name':'Vermont', 'abbrev':'VT'},          {'name':'Virginia', 'abbrev':'VA'},         {'name':'Washington', 'abbrev':'WA'},
            {'name':'West Virginia', 'abbrev':'WV'},    {'name':'Wisconsin', 'abbrev':'WI'},        {'name':'Wyoming', 'abbrev':'WY'}
            );
        var returnthis = false;
        $.each(states, function(index, value){
            if (to == 'name') {
                if (value.abbrev == name){
                    returnthis = value.name;
                    return false;
                }
            } else if (to == 'abbrev') {
                if (value.name.toUpperCase() == name){
                    returnthis = value.abbrev;
                    return false;
                }
            }
        });
        return returnthis;
    }

    $greeting.text('You want to live at ' + address);

//    $flag.appendChild('<img src=https://en.wikipedia.org/wiki/File:Flag_of_'+city+',_'+convert_state(state)+'>');

    var bgImgURL =  "https://maps.googleapis.com/maps/api/streetview?size=600x600&location=" + address + '"';

    $body.append('<img class="bgimg" src=" '+bgImgURL+' ">');

    //NYT Ajax Request
    var nytURL = 'http://api.nytimes.com/svc/search/v2/articlesearch.json?&q=' + cityInput.toUpperCase() + '&sort=newest&api-key=5e440af1acab4a1c2057e6c7caab7ea5:0:53972115';
    $.getJSON(nytURL, function(data) {
        $nytHeaderElem.text('New York Times Articles About ' + cityInput);

        articles = data.response.docs;
        ($nytElem.after('<button>Next</button>'));
        for (var i = 0; i < 5; i++) {
            var article = articles[i];
            $nytElem.append('<li class="article">' +
                '<a href="' + article.web_url + '">' + article.headline.main + '</a>' +
                '<p>' + article.snippet + '</p>' +
                '</li>');
        }
        $('button').click(function (data) {
            for (var i = 5; i < articles.length; i++) {
                var article = articles[i];
                $nytElem.append('<li class="article">' +
                '<a href="' + article.web_url + '">' + article.headline.main + '</a>' +
                '<p>' + article.snippet + '</p>' +
                '</li>');
                $('button').remove();
            }
        })
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
          $greeting.append("<p>Current temperature in " + location + " is: <span class='black'>" + temp_f + "°F </span><img src="+image_url+"></p>");
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

        $.ajax({
            url: 'http://en.wikipedia.org//w/api.php?action=parse&format=json&page='+city+'&prop=images|text',
            dataType: 'jsonp',
            success: function (response) {
                var readData = $('<div>' + response.parse.text["*"] + '</div>');
                var box = readData.find('.infobox');
                var flagURL = box.find("img[src*='Flag']").attr('src');
                var noFlag = box.find('img').first().attr('src');
                if (typeof(flagURL) != 'undefined' ) {
                    $('#flag').html('<div><img src="' + flagURL + '"/></div>')
                } else {
                    $('#flag').html('<div><img src="' + noFlag + '"/></div>')
                }
            }
        });

    return false;
}

$('#form-container').submit(loadData);
