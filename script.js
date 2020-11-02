// fetch links
const sportsDBteamURL = 'https://www.thesportsdb.com/api/v1/json/1/searchteams.php?t=';
const sportsDBeventsURL = 'https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=';
const espnTeamURL = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams';
const espnLiveScores = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';

// unused variable due to all team records not being available in espn's database
let teamRecord = {};

//unused functionality because of lack of data available for all 32 team records
const fetchTeams = () =>
  fetch(espnTeamURL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // espn teams data structure to access all teams in the nfl
      let teamsInfo = data.sports[0].leagues[0].teams;
      // iterating over all the teams to pull team record data
      for (let i = 0; i < teamsInfo.length; i++) {
        let teamData = teamsInfo[i].team;
        // team abbreviation is pulled to make it possible to pull each team's record
        let currentTeamAbbreviation = teamData.abbreviation;
        if (!teamRecord[currentTeamAbbreviation]) {
          teamRecord[currentTeamAbbreviation] =
            teamData.record.items[0].summary;
        }
      }
    })

// used to add all information to the page from the sports db api/a second fetch is called within this fetch, fetch events, to pull in the next five games for the team selected
const fetchTeamDetails = (team) =>
  fetch(`${sportsDBteamURL}${team}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const teamInfo = data.teams[0];
      const teamID = teamInfo.idTeam;
      // creating the links for the team website, facebook, twitter, and instagram.
      $("#team-links").html(
        `<ul><li><a href="https://${teamInfo.strWebsite}" target="_blank"><img src="${teamInfo.strTeamBadge}" alt="${teamInfo.strTeam} Logo"></a></li><li><a href="https://${teamInfo.strFacebook}" target="_blank"><img src="facebook-logo.png"></a></li><li><a href="https://${teamInfo.strTwitter}" target="_blank"><img src="twitter-logo.png"></a></li><li><a href="https://${teamInfo.strInstagram}" target="_blank"><img src="instagram-logo.png"></a></li></ul><p></p>`
      );
      // fetch to pull in all games for the current week
      fetchEvents(teamID)
      // removing the 'hidden' class from the areas of the page that contain the data.
      $("#team-information").removeClass("hidden");
      $("#live-scores").removeClass("hidden");
    });

// pulling the next five games for the selected team from the sports db api
const fetchEvents = (teamID) =>
  fetch(`${sportsDBeventsURL}${teamID}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      let nextFiveGames = [];
      // iterating through the next five games listed in the sports db api for the selected team to format the event date
      for (let i = 0; i < data.events.length; i++) {
        let event = data.events[i];
        let eventDate = data.events[i].dateEvent.split("-");
        // reformatting the event date from ddmmyyyy to mmddyyyy
        let correctedDate = `${eventDate[1]}/${eventDate[2]}/${eventDate[0]}`;
        nextFiveGames.push(`<li>${correctedDate} ${event.strEventAlternate}</li>`);
      }
      $('#event-info').html(nextFiveGames);
    });

// used to get the live scores for all games in the current week from the espn api
const displayScores = () =>
fetch(espnLiveScores)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      const week = data.week.number;
      // creating the current week scores heading noting the current week number
      $("#game-info").html(`<h3>Week ${week} Games</h3><!-- Current week games will show up here. --><ul id="game-info"></ul></div>`);
      // iterating through each game to format them
      for (let i = 0; i < data.events.length; i++) {
        // accessing all the games
        const game = data.events[i];
        const awayTeamScore = game.competitions[0].competitors[0].score;
        const homeTeamScore = game.competitions[0].competitors[1].score;
        // getting the team abbreviations so they display for the game scores
        let teamAbbreviations = game.shortName.split(" @ ");
        let homeTeamAbbreviation = teamAbbreviations[0];
        let awayTeamAbbreviation = teamAbbreviations[1];
        // setting up the current week scores so they display properly
        $("#game-info").append(
          `<li><img src=${game.competitions[0].competitors[0].team.logo}> <img src="at-symbol.png" class="at-symbol"> <img src=${game.competitions[0].competitors[1].team.logo}><br>${awayTeamAbbreviation} (${awayTeamScore})<br>${homeTeamAbbreviation} (${homeTeamScore})<br>${game.status.type.detail}<br>Channel: ${game.competitions[0].broadcasts[0].names[0]}</li>`
        );
      // adding the refresh scores button
      $('#refresh-scores-button').html('<button id="refresh-scores" type="button">Refresh Scores</button>')  
      }
    })
    .catch((error) => {
      $("#team-links").html(`<p>Something went wrong. Error: ${error}</p>`);
      $("#team-links").removeClass("hidden");
    });

// used to create the page content
function pageContent(team) {
  fetchTeams();
  fetchTeamDetails(team);
  displayScores();
}

// function to set the refresh scores button functionality
function refreshScores() {
  $('#refresh-scores-button').on('click', 'button', e => {
    e.stopPropagation();
    console.log('clicked')
    displayScores();
  })
}

// primary function used to display everythign on the page
function submitForm() {
  $("form").submit((e) => {
    e.preventDefault();
    selectedTeam = $("select").val();
    console.log(selectedTeam);
    pageContent(selectedTeam);
  });
}

// functions launched after the dom loads
$(submitForm());
$(refreshScores());
