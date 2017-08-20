CSGO RankVerifier in ES6
==================================


Getting Started
---------------

```sh
# Install dependencies
npm install

# Start development live-reload server
PORT=8080 npm run dev

# Start production server:
PORT=8080 npm start
```

The server has now started and you can get account rank by sending a post request with `username` and `password` to
`localhost:8080/api/`. The response will contain `steamID`, `casual_rank` and `competitive_rank`.
