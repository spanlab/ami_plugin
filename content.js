//////////////// Handle infinite scrolling ///////////////////////////////////
MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var observer = new MutationObserver(function(mutations, observer) {
    // fired when a mutation occurs
    runCALM();
});

chrome.runtime.onMessage.addListener(getAmiStats);

function getAmiStats(userUrl, sender, sendResponse){
    // console.log(userUrl);
    var userId = userUrl.split('.com/').pop().split('&')[0];
    // console.log(userId);
    // Start file download.
    var dwnldTime = new Date().toLocaleString().replaceAll(',','').replaceAll('/','_').replaceAll(' ','_').replaceAll(':','_');
    // console.log(dwnldTime);
    var amiStats = userId+'_'+numTweets+'twts_'+dwnldTime+'.txt';
    download(amiStats,dwnlData);
    var userTweets = 'tweets_for_'+amiStats;
    download(userTweets,tweets_dwnld);
}

function chartLocation(){
    var tweetButtonExists = !!document.querySelector("[data-testid='SideNav_NewTweet_Button']");
    var logInCheck = !!document.querySelector("[data-testid='signup']");
    // var tweetButtonExists = document.body.contains("[data-testid='SideNav_NewTweet_Button']");
    // console.log(tweetButtonExists);
    // console.log(logInCheck);

    if (tweetButtonExists ==true){
      var chartLoc = document.querySelector("[data-testid='SideNav_NewTweet_Button']");
    }
    else{
      var chartLoc = document.querySelector("[href='/settings']");
    }
    // return console.log(chartLoc);
    return chartLoc;
}

// thanks carlos https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

// alert('You are using AMI to show you the affect breakdown of your twitter feed!');
// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  attributes: true
  //...
});
//////////////////////////////////////////////////////////////////////////////
var dwnlData =[];
var tweets_dwnld = [];
var tweetSentiment = {};
var skipped = new Set();
// var skipped = ();
var numTweets = 0;
var createdPieChart = false;
var createdBarPlot = false;
var createdHrzBarPlot = false;
var lap = 0;
var hap = 0;
var lan = 0;
var han = 0;
var neu = 0;

//////////////// Function to do the task /////////////////////////////////////
function runCALM() {
    var items = document.querySelectorAll("[data-testid='tweet']");

    for (var i = 0; i < items.length; i++) {   // for each item box
        var item = items[i];
        var itemText = item.childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[1].childNodes[0].childNodes[0]?.innerText;
        var itemId = item.childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].childNodes[0].querySelector('time')?.parentElement.href;
        if (!itemId || !itemText) {
          if (!skipped.has(item)) {
            // avoiding spam of the same tweets over and over
            // console.log(`Skipping (hasId: ${!!itemId} & hasText: ${!!itemText}):`, item);
            skipped.add(item);
            // tweets_dwnld+=itemText;
            // console.log(itemText);

          }
          continue
        }
        // This is outside the if statement because lines should be drawn every time
        var affect = tweetSentiment[itemId] || getSentiment(itemText);
        var nullSentiment = true;
        if(affect.HAN==true) {
          item.style.border = "thick solid red";
          if (!tweetSentiment[itemId]) { han += 1; }
          nullSentiment = false;
          // box.innerHTML += "High Arousal Negative Content(HAN)" + "<br>";
          // item.remove()

        }
        if(affect.HAP==true) {
          item.style.border = "thick solid yellow";
          if (!tweetSentiment[itemId]) { hap += 1; }
          nullSentiment = false;
          // box.innerHTML += "High Arousal Positive Content(HAP)" + "<br>";
          // item.remove()
        }
        if(affect.LAN==true) {
          item.style.border = "thick solid blue";
          if (!tweetSentiment[itemId]) { lan += 1; }
          nullSentiment = false;
          // box.innerHTML += "Low Arousal Negative Content(LAN)" + "<br>";
          // item.remove()
        }
        if(affect.LAP==true) {
          item.style.border = "thick solid green";
          if (!tweetSentiment[itemId]) { lap += 1; }
          nullSentiment = false;
          // box.innerHTML += "Low Arousal Positive Content(LAP)" + "<br>";
          // item.remove()
        }
        if(affect.NEU==true) {
          item.style.border = "thick solid gray";
          if (!tweetSentiment[itemId]) { neu += 1; }
          nullSentiment = false;
          // box.innerHTML += "Neutral Content(NEU)" + "<br>";
          // item.remove()
        }
        if(nullSentiment) {
          // want to see cases where tweets were found but not outlined
          console.log('Found null sentiment', item);
          item.style.border = "thick solid pink";
        }

        if (!tweetSentiment[itemId]) {
          // only process tweets we haven't seen before
          numTweets += 1;
          tweetSentiment[itemId] = affect;
          tweets_dwnld+='--------------------------------------------';
          tweets_dwnld+=itemText;
          tweets_dwnld+='++++++++++++++++++++++++++++++++++++++++++++';

          if(numTweets % 5 === 0 ){

            data = [ [ "😄", hap ],[ "🙂", lap ],[ "😐", neu ],[ "🙁", lan ],[ "😠", han ] ]; 
            dwnlData = [ [ "HAP", hap ],[ "LAP", lap ],[ "NEU", neu ],[ "LAN", lan ],[ "HAN", han ] ];
            var colors = [ "yellow", "green", "lightgrey", "blue", "red" ];
            // var colors = [ "  #fffc00", "#25d366", "#e8ecee", "#3b5998", " #ff0000" ];
            // var colors = [ "#fffc00", "#25d366", "#e8ecee", "#1da1f2", "#ff0000" ];
            //using the function
            // drawPieChart( data, colors );
            // drawBarPlot( data, colors );
            
            // // flip the order make positive on the right for horizontal 
            data = [ [ "😠", han ],[ "🙁", lan ],[ "😐", neu ],[ "🙂", lap ],[ "😄", hap ] ]; 
            dwnlData = [ [ "HAN", han ],[ "LAN", lan ],[ "NEU", neu ],[ "LAP", lap ],[ "HAP", hap ]];
            var colors = [ "red" ,"blue","lightgrey","green","yellow" ];
            drawHrzBarPlot( data, colors );


              // alert("Based on the last"+numTweets+" Tweets, you are seeing "+han+" HAN tweets.");

          }
        }
    }
}
//////////////////////////////////////////////////////////////////////////////

// function drawPieChart( data, colors, title ){

function drawPieChart( data, colors){

    if (!createdPieChart) {
      var tweetButton = chartLocation();
      // var tweetButton = document.querySelector("[data-testid='SideNav_NewTweet_Button']");

      // var box = tweetButton.closest('div').createElement("div");

      var box = document.createElement("div");
      // box.style.position = "fixed";
      // box.style.border = "1px solid rgb(0,0,0)";
      // box.style.backgroundColor = "#e5e4e2";
      box.id = 'box_chart_id';

      var pieChart = document.createElement("canvas");
      // pieChart.style.position = "fixed";
      pieChart.style.width = "400px";
      pieChart.style.height = "250px";
      pieChart.style.marginLeft = "20px";
      pieChart.style.marginTop = "20px";
      // pieChart.id = 'pieChartId';
      pieChart.setAttribute("id", "pieChartId");

      // box.innerHTML += "Affect Breakdown" + "<br>" + [numTweets + " Tweets"] + "<br>" + ["HAN : " + han] + "<br>" + ["LAN : " + lan] + "<br>" + ["HAP : " + hap] + "<br>" + ["LAP : " + lap] + "<br>" + ["NEU : " + neu];
      var boxTitle = document.createElement("h3");
      boxTitle.id = 'box_chart_title';
      // boxTitle.style.textAlign = 'center';
      box.appendChild(boxTitle);
      box.style.top = "150px";
      box.style.marginLeft = "10px";
      box.style.marginTop = "10px";
      box.style.width = "210px";
      box.style.height = "250px";
      box.style.textAlign = 'center';
      box.style.borderColor = "#1da1f2";


      tweetButton.parentElement.appendChild(box);

      // document.body.appendChild(pieChart); // adds the canvas to the body element
      document.getElementById('box_chart_id').appendChild(pieChart);
      // tweetButton.appendChild(pieChart);


      createdPieChart = true;
    }
    document.getElementById('box_chart_title').innerHTML = `Affect Mix Index (n=${numTweets})`;
    // document.getElementById('box_chart_title').innerHTML = title+${numTweets}+"Tweets";

    // var context = canvas.getContext( "2d" );
    var canvas = document.getElementById("pieChartId");
    var context = canvas.getContext('2d');
    // clearing canvas to redraw
    context.clearRect(0, 0, canvas.width, canvas.height);

    // var colors = [ "yellow", "green", "grey", "blue", "red" ];

    // var colors = [ "#FAE442", "#8BD448", "grey", "#2AA8F2", "#FF6355" ];


    // get length of data array
    var dataLength = data.length;
    // declare variable to store the total of all values
    var total = 0;

    // calculate total
    for( var i = 0; i < dataLength; i++ ){
        // add data value to total
        total += data[ i ][ 1 ];
    }

    // declare X and Y coordinates of the mid-point and radius
    var x = 50;
    var y = 50;
    var radius = 50;

    // declare starting point (right of circle)
    var startingPoint = 0;

    for( var i = 0; i < dataLength; i++ ){
    // for( var i = 1;){
        // calculate percent of total for current value
        var percent = data[ i ][ 1 ] * 100 / total;

        // calculate end point using the percentage (2 is the final point for the chart)
        var endPoint = startingPoint + ( 2 / 100 * percent );


        // draw chart segment for current element
        context.beginPath();
        // select corresponding color
        context.fillStyle = colors[ i ];
        context.moveTo( x, y );
        context.arc( x, y, radius, startingPoint * Math.PI, endPoint * Math.PI );
        context.fill();

        // // starting point for next element
        // // used for the ami piechart
        startingPoint = endPoint;


        // used for the ami piechart
        // draw labels for each element
        // context.rect( 110, 20 * i +2, 20, 18 );
        context.rect( 110, 20 * i +2, 20, 18 );
        context.fill();
        context.fillStyle = "black";
        context.font="bold 14px arial";
        // context.fillText( data[ i ][ 0 ] + "  " + data[ i ][ 1 ], 111, 20 * i + 17 );
        context.fillText( data[ i ][ 0 ] + "  (" + data[ i ][ 1 ] + ")", 112, 20 * i + 17 );


    }
}
// create working version of the barplot 
// using the one below to create a horizontal version of the barplot
function drawBarPlot( data, colors){
  var tweetButton = chartLocation();
  // var tweetButton = document.querySelector("[data-testid='SideNav_NewTweet_Button']");

    if (!createdBarPlot) {
      var box = document.createElement("div");
      // box.style.position = "fixed";
      // box.style.border = "1px solid rgb(0,0,0)";
      // box.style.backgroundColor = "#e5e4e2";
      box.id = 'box_chart_id';

      var pieChart = document.createElement("canvas");
      // pieChart.style.position = "fixed";
      pieChart.style.width = "400px";
      pieChart.style.height = "250px";
      // pieChart.style.marginLeft = "20px";
      // pieChart.style.marginTop = "20px";
      // pieChart.id = 'pieChartId';
      pieChart.setAttribute("id", "pieChartId");

      // box.innerHTML += "Affect Breakdown" + "<br>" + [numTweets + " Tweets"] + "<br>" + ["HAN : " + han] + "<br>" + ["LAN : " + lan] + "<br>" + ["HAP : " + hap] + "<br>" + ["LAP : " + lap] + "<br>" + ["NEU : " + neu];
      var boxTitle = document.createElement("h3");
      boxTitle.id = 'box_chart_title';
      // boxTitle.style.textAlign = 'center';
      box.appendChild(boxTitle);
      box.style.top = "150px";
      // box.style.marginLeft = "10px";
      // box.style.marginTop = "10px";
      box.style.width = "225px";
      box.style.height = "310px";
      box.style.textAlign = 'center';
      // box.style.borderColor = "#1da1f2";
      // box.style.border = "thick solid #1da1f2"
      // document.body.appendChild(box);
      tweetButton.parentElement.appendChild(box);

      // document.body.appendChild(pieChart); // adds the canvas to the body element
      document.getElementById('box_chart_id').appendChild(pieChart);

      createdBarPlot = true;
    }
    document.getElementById('box_chart_title').innerHTML = `Affect Mix Index (n=${numTweets})`;
    // document.getElementById('box_chart_title').innerHTML = title+${numTweets}+"Tweets";

    // var context = canvas.getContext( "2d" );
    var canvas = document.getElementById("pieChartId");
    var context = canvas.getContext('2d');
    // clearing canvas to redraw
    context.clearRect(0, 0, canvas.width, canvas.height);


    // get length of data array
    var dataLength = data.length;
    // declare variable to store the total of all values
    var total = 0;

    var maxWidth = 25;
    var maxHeight = 100;

    // calculate total
    for( var i = 0; i < dataLength; i++ ){
        // add data value to total
        total += data[ i ][ 1 ];
    }

    // declare starting point (right of circle)
    var startingPoint = 5;

    for( var i = 0; i < dataLength; i++ ){
        // calculate percent of total for current value
        var percent = data[ i ][ 1 ] / total;


        // fill the barplot
        context.beginPath();
        context.fillStyle = colors[ i ];
        context.rect(69, startingPoint, maxWidth, canvas.height*percent);
        // context.rect( 110, 20 * i +2, 20, 18 );
        context.fill();
        
        // draw the emojis--they show up at the midpoint of each bar
        var botmE = startingPoint+canvas.height*percent;
        var topE= startingPoint;
        context.beginPath();
        context.fillStyle = "black";
        context.font="bold 14px arial";
        // note that to get the emoji to show up in the middle you need the midpoint of each ami box
        // you get that by taking the startingPoint (topE) and then adding that to the bottom of the ami category box
        // which is startingPoint+canvas.height*percent and then dividing that by 2 
        // the whole equation is this ((topE + ((botmE)))/2)
        // we add the 6 at the end bc from the midpoint it draws the bottom of the emoji so when we add 6 we are lowering the emoji slightly
        // to align midpoint and mid point of emoji
        context.fillText( data[ i ][ 0 ] + "  " + Math.round(percent*100) +"%", 95, ((topE + ((botmE)))/2)+6);
        
        // // starting point for next bar is the end of the last
        startingPoint = startingPoint + (canvas.height*percent);
    }
}

function drawHrzBarPlot( data, colors){
  var tweetButton = chartLocation();
  // var tweetButton = document.querySelector("[data-testid='SideNav_NewTweet_Button']");

    if (!createdHrzBarPlot) {
      var box = document.createElement("div");
      // box.style.position = "fixed";
      // box.style.border = "1px solid rgb(0,0,0)";
      // box.style.backgroundColor = "#e5e4e2";
      box.id = 'box_chart_id';

      var pieChart = document.createElement("canvas");
      // pieChart.style.position = "fixed";
      // pieChart.style.width = "400px";
      pieChart.style.width = "225px";
      pieChart.style.height = "125px";
      // pieChart.style.marginLeft = "5px";
      // pieChart.style.marginTop = "5px";
      // pieChart.id = 'pieChartId';
      pieChart.setAttribute("id", "pieChartId");

      // box.innerHTML += "Affect Breakdown" + "<br>" + [numTweets + " Tweets"] + "<br>" + ["HAN : " + han] + "<br>" + ["LAN : " + lan] + "<br>" + ["HAP : " + hap] + "<br>" + ["LAP : " + lap] + "<br>" + ["NEU : " + neu];
      var boxTitle = document.createElement("h3");
      boxTitle.id = 'box_chart_title';
      box.appendChild(boxTitle);
      box.style.top = "150px";
      // box.style.marginLeft = "1px";
      // box.style.marginTop = "1px";
      box.style.width = "230px";
      box.style.height = "250px";
      box.style.textAlign = 'center';
      // document.body.appendChild(box);
      tweetButton.parentElement.appendChild(box);

      // document.body.appendChild(pieChart); // adds the canvas to the body element
      document.getElementById('box_chart_id').appendChild(pieChart);

      createdHrzBarPlot = true;
    }
    document.getElementById('box_chart_title').innerHTML = `Affect Mix Index (n=${numTweets})`;
    // document.getElementById('box_chart_title').innerHTML = title+${numTweets}+"Tweets";

    // var context = canvas.getContext( "2d" );
    var canvas = document.getElementById("pieChartId");
    var context = canvas.getContext('2d');
    // clearing canvas to redraw
    context.clearRect(0, 0, canvas.width, canvas.height);


    // get length of data array
    var dataLength = data.length;
    // declare variable to store the total of all values
    var total = 0;

    // var maxWidth = 200;
    // var maxWidth = 225;
    var maxWidth = canvas.width;
    var maxHeight = 25;

    // calculate total
    for( var i = 0; i < dataLength; i++ ){
        // add data value to total
        total += data[ i ][ 1 ];
    }

    // declare starting point (right of circle)
    var startingPoint = 0;

    for( var i = 0; i < dataLength; i++ ){
        // calculate percent of total for current value
        var percent = data[ i ][ 1 ] / total;


        // fill the barplot
        context.beginPath();
        context.fillStyle = colors[ i ];
        context.rect(startingPoint, 0, maxWidth*percent, maxHeight);
        context.fill();
        
        // draw the emojis--they show up at the midpoint of each bar
        var botmE = startingPoint+maxWidth*percent;

        var topE= startingPoint;
        context.beginPath();
        context.fillStyle = "black";
        context.font="bold 14px arial";
        // note that to get the emoji to show up in the middle you need the midpoint of each ami box
        // you get that by taking the startingPoint (topE) and then adding that to the bottom of the ami category box
        // which is startingPoint+canvas.height*percent and then dividing that by 2 
        // the whole equation is this ((topE + ((botmE)))/2)
        // we add the 10 at the end bc from the midpoint it draws the bottom of the emoji so when we add 10 we are lowering the emoji slightly
        // to align midpoint and mid point of emoji
        context.fillText( data[ i ][ 0 ],((topE + ((botmE)))/2)-10,40);
        context.fillText( Math.round(percent*100) +"%",((topE + ((botmE)))/2)-10,55);
        
        // // starting point for next bar is the end of the last
        startingPoint = startingPoint + (maxWidth*percent);
    }
}
//////////////////////////////////////////////////////////////////////////////

function getSentiment(itemText) {
    affect = {
        HAP: false,
        LAP: false,
        HAN: false,
        LAN: false,
        NEU: false,
        positive: 0,
        negative: 0
    };

    if (itemText.length > 0) {
        sentiment = Sentimood.prototype.analyze(itemText);
        positive = sentiment.positive.score;
        negative = sentiment.negative.score;
        affect.positive = positive;
        affect.negative = negative;
        if (positive == 0 && negative == 0) {
            affect.NEU = true;
            affect.neu += 1;
        }else if(positive ==  negative){
            if(negative >= 3){
                affect.HAN = true;
                affect.han += 1;
            }else{
                affect.LAN = true;
                affect.lan += 1;
            }
        }else {
            if (positive > 0 && positive <= 2 && negative < positive) {
                affect.LAP = true;
                affect.lap += 1;
            }else if (positive >= 3 && negative < positive) {
                affect.HAP = true;
                affect.hap += 1;
            }
            if (negative > 0 && negative <= 1 && positive < negative) {
                affect.LAN = true;
                affect.lan += 1;
            }else if (negative >= 2 && positive < negative) {
                affect.HAN = true;
                affect.han += 1;
            }
        }
    }
   return affect
}
//////////////////////////////////////////////////////////////////////////////

