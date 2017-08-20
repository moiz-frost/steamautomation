import { version } from '../../package.json';
import { Router } from 'express';
import { EventEmitter } from 'events';
import Steam from 'steam';
import CSGO from 'csgo';
import spoof from 'spoof';


const em = new EventEmitter();

const bot = new Steam.SteamClient(),
      steamUser = new Steam.SteamUser(bot),
      steamGC = new Steam.SteamGameCoordinator(bot, 730),
      csgoCLI = new CSGO.CSGOClient(steamUser, steamGC, false);


let player_data = {}
let tasks = 0;

export default ({ config, db }) => {
    let api = Router();

    // mount the facets resource
    // api.use('/facets', facets({ config, db }));

    // perhaps expose some API metadata at the root
    api.get('/', (req, res) => {
        res.json({ version });
    });

    api.post('/', (req, res) => {

        // comment this when doing local development
        // it'll spoof your mac address of all the interfaces on your machine
        // so your internet needs to reconnect before continuing
        // Else the script will take twice as long to complete for each request
        spoofMAC();

        player_data = {};

        let login_details = {
            "account_name": req.body.username,
            "password": req.body.password
        };

        bot.connect();
        // console.log('connect')
        bot.on('connected', () => steamUser.logOn(login_details));
        bot.on('logOnResponse', (response) => {
            if (response.eresult == Steam.EResult.OK) {
                console.log('logged in');
                next({ "steamID": bot.steamID })
            } else {
                res.json({error: "bad username/password"});
                process.exit();
            }

            csgoCLI.launch();

            csgoCLI.on('matchmakingStatsData', (matchmakingStatsData) => {
                let data = {
                    "casual_rank": matchmakingStatsData.player_level
                }
                next(data);
            });

            csgoCLI.on('playerProfile', (profile) => {
                let data = {
                    "competitive_rank": csgoCLI.Rank.getString(profile.account_profiles[0].ranking.rank_id)
                }
                next(data);
            });

            csgoCLI.on('ready', () => {
                console.log('ready');
                csgoCLI.matchmakingStatsRequest();
                csgoCLI.playerProfileRequest(csgoCLI.ToAccountID(bot.steamID));
            })

        });


        em.on('render', () => {
            // comment this as well when commenting spoofMAC()
            unspoofMAC();
            res.json(player_data);
        }
    })

    return api;
}

const next = (data) => {
    if (data) {
        console.log(data, tasks)
        Object.assign(player_data, data)
    }

    if (Object.keys(player_data).length == 3) {
        em.emit('render')
    }
}

const spoofMAC = () => {
    var interfaces = spoof.findInterfaces();

    interfaces.forEach(function (it) {
        let mac = spoof.random()

        setMACAddress(it.device, mac, it.port)
    }

}

const unspoofMAC = () => {
    var interfaces = spoof.findInterfaces();

    interfaces.forEach(function (it) {
        if (!it.address) {
            console.log((new Error('Could not read hardware MAC address for ' + device))
        }

        setMACAddress(it.device, it.address, it.port)
    }
}