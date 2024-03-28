let teamData;
let teamStatData;

async function getTeamStats(){
    const apiUrl = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba/seasons/2024/teams?limit=30';

    return new Promise(async (resolve, reject) => {
        try{
            const response = await fetch(apiUrl);
            if(!response.ok){
                throw new Error('Error fetching NBA Teams');
            }
            const data = await response.json();
            
            const teamPromises = data.items.map(async teams => {
                var teamUrl = teams.$ref;
                var safeTeamUrl = teamUrl.replace('http:', 'https:');
                const teamResponse = await fetch(safeTeamUrl);
                if(!teamResponse.ok){
                    throw new Error('Error fetching team data');
                }
                const teamData = await teamResponse.json();
                var teamStatsUrl = teamData.statistics.$ref;
                var teamRecordUrl = teamData.record.$ref;
                var secureTeamStatsUrl = teamStatsUrl.replace('http:','https:');
                var secureTeamRecordUrl = teamRecordUrl.replace('https:','https:');
                const teamStatsResponse = await fetch(secureTeamStatsUrl);
                const teamRecordResponse = await fetch(secureTeamRecordUrl);
                if(!teamStatsResponse.ok || !teamRecordResponse.ok){
                    throw new Error('Error fetching team data');
                }
                const teamRecord = await teamRecordResponse.json();
                const teamStats = await teamStatsResponse.json();
                return{
                    teams: teamData,
                    stats: teamStats,
                    record: teamRecord
                };
            });
            const teamStats = await Promise.all(teamPromises);
            resolve(teamStats);
        }catch(error){
            reject(new Error('Promise Error NBA Teams'))
        }
    });
}

document.addEventListener('DOMContentLoaded', async function(){
    const teams = await Promise.all([getTeamStats()]);
    console.log(teams);
    try{
        const loadElement = document.getElementById("logoContainer");
        var step = (100/teams[0].length);
        for(let i=0; i<teams[0].length; i++){
            loadElement.innerHTML=`<div class="radial-progress" style="--value:${i*step}; --size:12rem; --thickness: 5px;" role="progressbar">${Math.floor((i*step))+'%'}</div>`;
            const obj = teams[0][i];
            displayTeams(obj);
    
        }
        loadElement.innerHTML=``;
        loadElement.style.zIndex="-999";
        loadElement.style.opacity="0";
        fadeMain();
        
    }catch(error){
        console.error('Error:', error);
    }
});

const teamsMachine = (obj) => {
    var teamCity = obj.teams.abbreviation;
    var teamName = obj.teams.name;
    var teamImg = obj.teams.logos[0].href;
    var record = obj.record.items[0].displayValue;
    var rank = obj.record.items[0].stats[10].value;
    const makeTeam = `
    <div class="collapse w-full">
                <input type="checkbox" name="my-accordion-1"/>
                  <div class="collapse-title text-l font-medium flex flex-col justify-center">
                      <div class="flex p-2 place-items-center align-center">
                          <div class="avatar">
                              <div class="w-14 rounded">
                              <img src="${teamImg}" />
                              </div>
                          </div>
                        <div class="flex flex-col px-2 text-left">
                          <p class="text-primary">${teamCity} ${teamName}</p>
                          <div class="flex flex-row text-left w-fit gap-4">
                            <p>#${rank}</p>
                            <p class="text-primary">${record}</p>
                          </div>
                        </div>
                        <div class="px-6 avatar-group -space-x-5 rtl:space-x-reverse flex-grow justify-end">
                          <div class="avatar">
                            <div class="w-12">
                              <img src="../assets/tatum.png" />
                            </div>
                          </div>
                          <div class="avatar">
                            <div class="w-12">
                              <img src="../assets/tatum.png" />
                            </div>
                          </div>
                          <div class="avatar">
                            <div class="w-12">
                              <img src="../assets/tatum.png" />
                            </div>
                          </div>
                          <div class="avatar">
                            <div class="w-12">
                              <img src="../assets/tatum.png" />
                            </div>
                          </div>
                          <div class="avatar">
                            <div class="w-12">
                              <img src="../assets/tatum.png" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="divider"></div> 
                  </div>
                  <div class="collapse-content text-center"> 
                  </div>
              </div>`;

    return makeTeam;
}

function displayTeams(obj){
    let parentNode = document.getElementById('liveGamesCardContainer');
    parentNode.insertAdjacentHTML('beforeend', teamsMachine(obj));
}

function fadeMain(){
    const mainElement = document.getElementById("liveGamesCardContainer");
    mainElement.classList.add("fadein");
}