function getNBAScoreboard() {
    const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
  
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', apiUrl, true);
      xhr.onload = function () {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject('Error fetching NBA scoreboard data');
        }
      };
      xhr.onerror = function () {
        reject('Error fetching NBA scoreboard data');
      };
      xhr.send();
    });
  }

getNBAScoreboard().then(data => {
    console.log('NBA Scoreboard Data:', data);
    console.log(data.events[0].competitions[0].competitors[0].team.displayName);
    for(var i = 0; i<data.events.length; i++){
        var obj = data.events[i];
        displayUpcomingGames(obj);
    }
}).catch(error => {
    console.error('Error:', error);
});

const upcomingGamesMachine = (obj) => {
  var team1 = obj.competitions[0].competitors[0].team;
  var team2 = obj.competitions[0].competitors[1].team;
  var gameTeams = obj.shortName;
  var record1 = obj.competitions[0].competitors[0].records[0].summary;
  var record2 = obj.competitions[0].competitors[1].records[0].summary;
  var date = obj.competitions[0].status.type.detail;
  const makeGame = 
  `<div class="flex gap-4">
  <div class="avatar">
    <div class="w-14 rounded-xl">
      <img src="${team1.logo}" />
    </div>
  </div>
  <h2 class="card-title">${gameTeams}</h2>
  <div class="avatar">
    <div class="w-14 rounded-xl">
      <img src="${team2.logo}" />
    </div>
  </div>
</div>
<p>${date}</p>`;

  return makeGame;
}


function displayUpcomingGames(obj){
  let parentNode = document.getElementById('upcomingGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', upcomingGamesMachine(obj));
}

//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba
  
//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/leaders?lang=en&region=us