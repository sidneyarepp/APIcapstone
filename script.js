let teamRecord = {};
let today = new Date();
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
let dateTime = date+' '+time;

const fetchTeams = () =>
  fetch("http://site.api.espn.com/apis/site/v2/sports/football/nfl/teams")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let teamsInfo = data.sports[0].leagues[0].teams;
      for (let i = 0; i < teamsInfo.length; i++) {
        let teamData = teamsInfo[i].team;
        let currentTeamAbbreviation = teamData.abbreviation;
        if (!teamRecord[currentTeamAbbreviation]) {
          teamRecord[currentTeamAbbreviation] =
            teamData.record.items[0].summary;
        }
      }
    })

const fetchTeamDetails = (team) =>
  fetch(`https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=${team}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const teamInfo = data.teams[0];
      const teamID = teamInfo.idTeam;
      $("#team-links").html(
        `<ul><li><a href="https://${teamInfo.strWebsite}" target="_blank"><img src="${teamInfo.strTeamBadge}" alt="${teamInfo.strTeam} Logo"></a></li><li><a href="https://${teamInfo.strFacebook}" target="_blank"><img src="facebook-logo.png"></a></li><li><a href="https://${teamInfo.strTwitter}" target="_blank"><img src="twitter-logo.png"></a></li><li><a href="https://${teamInfo.strInstagram}" target="_blank"><img src="instagram-logo.png"></a></li></ul><p></p>`
      );
      fetchEvents(teamID)
      $("#team-links").removeClass("hidden");
      $("section").removeClass("hidden");
    });

const fetchEvents = (teamID) =>
  fetch(`https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${teamID}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let nextFiveGames = [];
      for (let i = 0; i < data.events.length; i++) {
        let event = data.events[i];
        let eventDate = data.events[i].dateEvent.split("-");
        let correctedDate = `${eventDate[1]}/${eventDate[2]}/${eventDate[0]}`;
        nextFiveGames.push(`<li>${correctedDate} ${event.strEventAlternate}</li>`);
      }
      console.log(nextFiveGames);
      $('#event-info').html(nextFiveGames);
    });

const displayScores = () =>
fetch("http://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const week = data.week.number;
      $("#game-info").html(`<h3>Week ${week} Games</h3><!-- Current week games will show up here. --><ul id="game-info"></ul></div>`);
      for (let i = 0; i < data.events.length; i++) {
        const game = data.events[i];
        const awayTeamScore = game.competitions[0].competitors[0].score;
        const homeTeamScore = game.competitions[0].competitors[1].score;
        let teamAbbreviations = game.shortName.split(" @ ");
        let homeTeamAbbreviation = teamAbbreviations[0];
        let awayTeamAbbreviation = teamAbbreviations[1];
        $("#game-info").append(
          `<li><img src=${game.competitions[0].competitors[0].team.logo}> <img src="at-symbol.png" class="at-symbol"> <img src=${game.competitions[0].competitors[1].team.logo}><br>${awayTeamAbbreviation} (${awayTeamScore})<br>${homeTeamAbbreviation} (${homeTeamScore})<br>${game.status.type.detail}<br>Channel: ${game.competitions[0].broadcasts[0].names[0]}</li>`
        );
      $('#refresh-scores-button').html('<button id="refresh-scores" type="button">Refresh Scores</button>')  
      }
    })
    .catch((error) => {
      $("#team-links").html(`<p>Something went wrong. Error: ${error}</p>`);
      $("#team-links").removeClass("hidden");
    });

function pageContent(team) {
  fetchTeams();
  fetchTeamDetails(team);
  displayScores();
}

function refreshScores() {
  $('#refresh-scores-button').on('click', 'button', e => {
    e.stopPropagation();
    console.log('clicked')
    displayScores();
  })
}

function submitForm() {
  $("form").submit((e) => {
    e.preventDefault();
    selectedTeam = $("select").val();
    console.log(selectedTeam);
    pageContent(selectedTeam);
  });
}

$(submitForm());
$(refreshScores());
