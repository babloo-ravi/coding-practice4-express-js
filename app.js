const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at https://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error; ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const playersQuery = `
    SELECT * FROM cricket_team ORDER BY player_id;`;

  const playerArray = await db.all(playersQuery);
  response.send(playerArray);
});

//Get Player API

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT * FROM cricket_team WHERE player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(player);
});

//Add Player API

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
    INSERT INTO 
        cricket_team (player_name,jersey_number,role) 
    VALUES(
        '${playerName}',
        ${jerseyNumber},
        '${role}');`;
  const dbResponse = await db.run(addPlayerQuery);
  const playerId = dbResponse.lastID;
  response.send(`Player Added to Team`);
});

//Update Player API

app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const UpdatedPlayerQuery = `
    UPDATE cricket_team SET player_name='${playerName}',jersey_number='${jerseyNumber}',role=${role}
     WHERE player_id=${playerId}`;

  await db.run(UpdatedPlayerQuery);

  response.send(`Player Details Updated`);
});

//Delete Player API

app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM cricket_team WHERE player_id=${playerId}; `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
