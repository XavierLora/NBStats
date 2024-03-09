let liveGamesData;
async function getLiveGames() {
  const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
          throw new Error('Error fetching NBA scoreboard data');
      }
      liveGamesData = await response.json();
      resolve(liveGamesData);
  } catch (error) {
      reject(new Error('Error fetching NBA scoreboard data'));
  }
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  const liveData = await Promise.all([getLiveGames()]);
  console.log(liveData)
  try {
      for (let i = 0; i < liveGamesData.events.length; i++) {
          const obj = liveGamesData.events[i];
          displayLiveGames(obj);
      }
  } catch (error) {
      console.error('Error:', error);
  }
});

const liveGamesMachine = (obj) => {
    var team1 = obj.competitions[0].competitors[0].team;
    var team2 = obj.competitions[0].competitors[1].team;
    var name1 = obj.competitions[0].competitors[0].team.abbreviation;
    var name2 = obj.competitions[0].competitors[1].team.abbreviation;
    var gameTeams = obj.shortName;
    var isGameActive = obj.status.type.state == "in";
    var isGamePre = obj.status.type.state == "pre";
    var isGameOver = obj.status.type.state == "post";
    var score1 = obj.competitions[0].competitors[0].score;
    var score2 = obj.competitions[0].competitors[1].score;
    var preRebStatName = obj.competitions[0].competitors[0].statistics[0].abbreviation;
    var preRebStatTotal1 = obj.competitions[0].competitors[0].statistics[0].displayValue;
    var preRebStatAvg1 = obj.competitions[0].competitors[0].statistics[1].displayValue;
    var preRebStatRank1 = obj.competitions[0].competitors[0].statistics[0].rankDisplayValue;
    var preRebStatTotal2 = obj.competitions[0].competitors[1].statistics[0].displayValue;
    var preRebStatAvg2 = obj.competitions[0].competitors[1].statistics[1].displayValue;
    var preRebStatRank2 = obj.competitions[0].competitors[1].statistics[0].rankDisplayValue;
    var preAstStatName = obj.competitions[0].competitors[0].statistics[2].abbreviation;
    var preAstStatTotal1 = obj.competitions[0].competitors[0].statistics[2].displayValue;
    var preAstStatAvg1 = obj.competitions[0].competitors[0].statistics[14].displayValue;
    var preAstStatRank1 = obj.competitions[0].competitors[0].statistics[2].rankDisplayValue;
    var preAstStatTotal2 = obj.competitions[0].competitors[1].statistics[2].displayValue;
    var preAstStatAvg2 = obj.competitions[0].competitors[1].statistics[14].displayValue;
    var preAstStatRank2 = obj.competitions[0].competitors[1].statistics[2].rankDisplayValue;
    var prePtsStatName = obj.competitions[0].competitors[0].statistics[5].abbreviation;
    var prePtsStatTotal1 = obj.competitions[0].competitors[0].statistics[4].displayValue+"/"+obj.competitions[0].competitors[0].statistics[3].displayValue;
    var prePtsStatAvg1 = obj.competitions[0].competitors[0].statistics[1].displayValue;
    var prePtsStatRank1 = obj.competitions[0].competitors[0].statistics[5].rankDisplayValue;
    var prePtsStatTotal2 = obj.competitions[0].competitors[1].statistics[4].displayValue+"/"+obj.competitions[0].competitors[1].statistics[3].displayValue;
    var prePtsStatAvg2 = obj.competitions[0].competitors[1].statistics[1].displayValue;
    var prePtsStatRank2 = obj.competitions[0].competitors[1].statistics[5].rankDisplayValue;
    
    console.log(isGameActive);
    var record1 = obj.competitions[0].competitors[0].records[0].summary;
    var record2 = obj.competitions[0].competitors[1].records[0].summary;
    var date = obj.competitions[0].status.type.shortDetail;
    const makeGame = `
    <div class="collapse w-full">
      <input type="radio" name="my-accordion-1"/>
      <div class="collapse-title text-l font-medium flex flex-col justify-center">
        <p class="text-center">${date}</p>
        <div class="flex gap-4 justify-center text-center">
        ${isGamePre ? // Check if game is pre
            `<h2 class="card-title text-base">${record2}</h2>
            <div class="avatar">
            <div class="w-14 rounded-xl">
              <img src="${team2.logo}" />
            </div>
          </div>
          <h2 class="card-title text-base">${gameTeams}</h2>
          <div class="avatar">
            <div class="w-14 rounded-xl">
              <img src="${team1.logo}" />
            </div>
          </div>
          <h2 class="card-title text-base">${record1}</h2>` :
            (isGameActive ? // Check if game is active
              `<h2 class="card-title text-xl">${score2}</h2>
              <div class="avatar">
              <div class="w-14 rounded-xl">
                <img src="${team2.logo}" />
              </div>
            </div>
            <h2 class="card-title text-base">${gameTeams}</h2>
            <div class="avatar">
              <div class="w-14 rounded-xl">
                <img src="${team1.logo}" />
              </div>
            </div>
            <h2 class="card-title text-xl">${score1}</h2>` :
              (isGameOver ? // Check if game is over
                `<h2 class="card-title text-xl">${score2}</h2>
              <div class="avatar">
              <div class="w-14 rounded-xl">
                <img src="${team2.logo}" />
              </div>
            </div>
            <h2 class="card-title text-base">${gameTeams}</h2>
            <div class="avatar">
              <div class="w-14 rounded-xl">
                <img src="${team1.logo}" />
              </div>
            </div>
            <h2 class="card-title text-xl">${score1}</h2>` :
                `<div class="stat place-items-center">
                  <div class="stat-title text-base">Game Status Unknown</div>
                </div>`
              )
            )
          }
        </div>
        <div class="divider w-full"></div>
      </div>
      <div class="collapse-content text-center">
        <div class="collapse-title text-l font-medium flex flex-col justify-center">
        <p class="text-center">Team Stats</p>
        <div class="stats shadow w-full">
          ${isGamePre ? // Check if game is pre
            `<div role="tablist" class="tabs tabs-bordered justify-center">
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name2}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto w-full">
            <table class="table-xs">
              <!-- head -->
              <thead>
                <tr>
                  <th></th>
                  <th>Total</th>
                  <th>AVG</th>
                  <th>Rank</th>
                </tr>
              </thead>
              <tbody>
                <!-- row 1 -->
                <tr>
                  <th>${prePtsStatName}</th>
                  <td>${prePtsStatTotal2}</td>
                  <td>${prePtsStatAvg2}</td>
                  <td>${prePtsStatRank2}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                <th>${preAstStatName}</th>
                <td>${preAstStatTotal2}</td>
                <td>${preAstStatAvg2}</td>
                <td>${preAstStatRank2}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                <th>${preRebStatName}</th>
                <td>${preRebStatTotal2}</td>
                <td>${preRebStatAvg2}</td>
                <td>${preRebStatRank2}</td>
                </tr>
              </tbody>
            </table>
          </div>
            </div>
            <input type="radio" name="my_tabs_1" role="tab" class="tab" aria-label="${name1}" />
            <div role="tabpanel" class="tab-content">
            <div class="overflow-x-auto">
              <table class="table-xs">
                <!-- head -->
                <thead>
                  <tr>
                    <th></th>
                    <th>Total</th>
                    <th>AVG</th>
                    <th>Rank</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- row 1 -->
                  <tr>
                  <th>${prePtsStatName}</th>
                  <td>${prePtsStatTotal1}</td>
                  <td>${prePtsStatAvg1}</td>
                  <td>${prePtsStatRank1}</td>
                </tr>
                <!-- row 2 -->
                <tr>
                <th>${preAstStatName}</th>
                <td>${preAstStatTotal1}</td>
                <td>${preAstStatAvg1}</td>
                <td>${preAstStatRank1}</td>
                </tr>
                <!-- row 3 -->
                <tr>
                <th>${preRebStatName}</th>
                <td>${preRebStatTotal1}</td>
                <td>${preRebStatAvg1}</td>
                <td>${preRebStatRank1}</td>
                </tr>
                </tbody>
              </table>
            </div>
            </div>
          </div>` :
            (isGameActive ? // Check if game is active
              `<div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score2}</div>
              </div>
              <div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score1}</div>
              </div>` :
              (isGameOver ? // Check if game is over
                `<div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score2}</div>
              </div>
              <div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score1}</div>
              </div>` :
                `<div class="stat place-items-center">
                  <div class="stat-title text-base">Game Status Unknown</div>
                </div>`
              )
            )
          }
        </div>
      </div>
    </div>
    </div>`;
  
    return makeGame;
  }

function displayLiveGames(obj){
    let parentNode = document.getElementById('liveGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', liveGamesMachine(obj));
}