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
  var record1 = obj.competitions[0].competitors[0].records[0].summary;
  var record2 = obj.competitions[0].competitors[1].records[0].summary;
  var date = obj.competitions[0].status.type.detail;
  const makeGame = 
  `<div class="text-l font-medium text-center p-2">
    <div class="flex w-full">
      <div class="grid w-1/2 h-48 flex card bg-base-100 p-2 rounded-box place-items-center">
          <h2 class="card-title text-base">${team1.displayName}</h2>
          <div class="avatar">
              <div class="w-24 rounded-xl">
                <img src="${team1.logo}" />
              </div>
          </div>
          <h2 class="card-title">${record1}</h2>
      </div>
      <div class="divider divider-horizontal">VS</div>
      <div class="grid w-1/2 flex card bg-base-100 p-2 rounded-box place-items-center">
          <h2 class="card-title text-base">${team2.displayName}</h2>
          <div class="avatar">
              <div class="w-24 rounded-xl">
                <img src="${team2.logo}" />
              </div>
          </div>
          <h2 class="card-title">${record2}</h2>
      </div>
    </div>
    <div class="grid w-full place-items-center pt-2">
      <h2 class="card-title">${date}</h2>
    </div> 
</div>`;

  return makeGame;
}


function displayUpcomingGames(obj){
  let parentNode = document.getElementById('upcomingGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', upcomingGamesMachine(obj));
}

//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba
  
//http://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/types/2/leaders?lang=en&region=us