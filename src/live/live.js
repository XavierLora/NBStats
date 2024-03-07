import { upcomingGamesData } from '../index.js';
console.log(upcomingGamesData);

window.onload = async function() {
  try {
      // Assuming upcomingGamesData is fetched asynchronously
      await fetchData(); // Replace with your asynchronous data fetching function
      
      for (let i = 0; i < upcomingGamesData.events.length; i++) {
          const obj = upcomingGamesData.events[i];
          displayLiveGames(obj);
      }
  } catch (error) {
      console.error('Error:', error);
  }
};
  


const liveGamesMachine = (obj) => {
    var team1 = obj.competitions[0].competitors[0].team;
    var team2 = obj.competitions[0].competitors[1].team;
    var gameTeams = obj.shortName;
    var isGameActive = obj.status.type.state == "in" || obj.status.type.state == "post";
    var isGameOver = obj.status.type.state == "post";
    var score1 = obj.competitions[0].competitors[0].score;
    var score2 = obj.competitions[0].competitors[1].score;
    console.log(isGameActive);
    var record1 = obj.competitions[0].competitors[0].records[0].summary;
    var record2 = obj.competitions[0].competitors[1].records[0].summary;
    var date = obj.competitions[0].status.type.shortDetail;
    const makeGame = `
      <div class="collapse w-full">
        <input type="radio" name="my-accordion-1"/>
        <div class="collapse-title text-l font-medium flex flex-col justify-center">
          <div class="flex gap-4 justify-center text-center">
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
          </div>
          <p class="text-center">${date}</p>
          <div class="divider w-full"></div>
        </div>
        <div class="collapse-content text-center">
          <div class="stats shadow w-10/12">
            ${isGameActive ? // Check if game is active
              `<div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score2}</div>
              </div>
              <div class="stat place-items-center">
                <div class="stat-title text-base">Score</div>
                <div class="stat-value text-xl">${score1}</div>
              </div>` :
              `<div class="stat place-items-center">
                <div class="stat-title text-base">Record</div>
                <div class="stat-value text-xl">${record2}</div>
              </div>
              <div class="stat place-items-center">
                <div class="stat-title text-base">Record</div>
                <div class="stat-value text-xl">${record1}</div>
              </div>`
            }
          </div>
        </div>
      </div>`;
  
    return makeGame;
  }

function displayLiveGames(obj){
    let parentNode = document.getElementById('liveGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', liveGamesMachine(obj));
}