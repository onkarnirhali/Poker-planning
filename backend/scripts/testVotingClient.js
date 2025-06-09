// backend/scripts/testVotingClient.js

const { io } = require("socket.io-client");

// Replace these with real values from your /auth/login and session creation
const ACCESS_TOKEN = "13d0ea08-eaa5-4c71-b95f-0a38cae040a3eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiOWJjNDlkMS1iMWMzLTQ5ODEtYTJlZS01YjY2Yzg3NGMxNTUiLCJpYXQiOjE3NDk0OTk5MjcsImV4cCI6MTc0OTUwMzUyN30.Wy_-C3GE5V_opYSsuveVgYsSUnoAQxiEhj-r9MmSYKU";
const SESSION_ID   = "13d0ea08-eaa5-4c71-b95f-0a38cae040a3";
const STORY_ID     = "<YOUR_STORY_ID>";

// Connect to the server with JWT auth
const socket = io("http://localhost:4000", {
  auth: { token: ACCESS_TOKEN },
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("✅ Connected as socket id:", socket.id);

  // 1) Join the session room
  socket.emit("join_session", { sessionId: SESSION_ID });
  console.log(`→ join_session { sessionId: "${SESSION_ID}" }`);

  // 2) Listen for participants joining
  socket.on("participant_joined", (data) => {
    console.log("← participant_joined", data);
  });

  // 3) Submit a vote after 2 seconds
  setTimeout(() => {
    const voteValue = "5"; // or any card value
    socket.emit("vote_submit", {
      sessionId: SESSION_ID,
      storyId: STORY_ID,
      value: voteValue,
    });
    console.log(`→ vote_submit { storyId: "${STORY_ID}", value: "${voteValue}" }`);
  }, 2000);

  // 4) Listen for vote updates
  socket.on("participant_voted", (data) => {
    console.log("← participant_voted", data);
  });

  // 5) After another 3 seconds, trigger reveal
  setTimeout(() => {
    socket.emit("reveal_votes", { sessionId: SESSION_ID, storyId: STORY_ID });
    console.log(`→ reveal_votes { storyId: "${STORY_ID}" }`);
  }, 5000);

  // 6) Listen for revealed votes
  socket.on("votes_revealed", (data) => {
    console.log("← votes_revealed", data);

    // 7) Finalize the story once revealed
    socket.emit("finalize_story", {
      sessionId: SESSION_ID,
      storyId: STORY_ID,
      finalValue: data.distribution, // or pick a specific value
    });
    console.log(`→ finalize_story { storyId: "${STORY_ID}", finalValue: ${JSON.stringify(data.distribution)} }`);

    // Disconnect after finalizing
    socket.disconnect();
  });
});

socket.on("disconnect", (reason) => {
  console.log("❌ Disconnected:", reason);
  process.exit(0);
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
  process.exit(1);
});