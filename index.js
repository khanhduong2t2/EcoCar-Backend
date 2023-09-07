const app = require("./src/app");

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
    console.log(`Server running with ${PORT} `)
});

process.on("SIGINT", () => {
    server.close(() => {
        console.log('Exit Server')
        process.exit();
    });
});