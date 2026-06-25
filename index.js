// require("dotenv").config();

// const app = require("./src/app");
// const { connectDB } = require("./src/config/db");

// const PORT = process.env.PORT || 5000;


// connectDB().then(() => {
//   app.listen(PORT, () => {
//     console.log(`Server running on ${PORT}`);
    
//   });
// });
// const dns = require("dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

// require("dotenv").config();

// const app = require("./src/app");
// const { connectDB } = require("./src/config/db");

// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await connectDB();

   
//   } catch (err) {
//     console.error("SERVER FAILED TO START");
//     process.exit(1);
//   }
// })();

const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const app = require("./src/app");

module.exports = app;