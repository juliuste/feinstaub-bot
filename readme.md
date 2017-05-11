# [berlinFeinstaub-bot](https://twitter.com/berlinFeinstaub)

[![dependency status](https://img.shields.io/david/juliuste/berlinFeinstaub-bot.svg)](https://david-dm.org/juliuste/berlinFeinstaub-bot)
[![dev dependency status](https://img.shields.io/david/dev/juliuste/berlinFeinstaub-bot.svg)](https://david-dm.org/juliuste/berlinFeinstaub-bot#info=devDependencies)
[![license](https://img.shields.io/github/license/juliuste/berlinFeinstaub-bot.svg?style=flat)](LICENSE)

[@berlinFeinstaub](https://twitter.com/berlinFeinstaub). Twitter bot that monitors fine dust pollution in Berlin using [luftdaten.info](http://luftdaten.info) community sensors. Tweets when PM10 emissions surpass 50 µg/m³ or PM2.5 emissions surpass 25 µg/m³. See also [further information about fine dust pollution in Germany](http://www.umweltbundesamt.de/en/topics/air/particulate-matter-pm10) provided by the German federal environmental protection agency. Inspired by [@FeinstaubFR](https://twitter.com/FeinstaubFR).

## Installation

You need to have [`git`](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [`nodejs`](https://nodejs.org/en/download/package-manager/) installed.

```bash
git clone https://github.com/juliuste/berlinFeinstaub-bot.git
cd berlinFeinstaub-bot
npm install
```

## Configuration

If you want to adapt the bot to watch your municipalities sensors instead, you can simply do so by changing the config file/s:

### `config/default.json`

```js
{
	"twitter": { // your Twitter API credentials **
		"key": "X",
		"key_secret": "X",
		"token": "X",
		"token_secret": "X"
	},
	"thresholds": {
		"PM10": 50, // PM10 limit in µg/m³
		"PM2.5": 25 // PM2.5 limit in µg/m³
	},
	"interval": 60, // interval for the bot to run in minutes
	"regions": [ // list of german "Gemeindeschlüssel" keys, can be empty *
		"110000000000"
	],
	"sensors": [244, 277], // list of additional sensor IDs, can be empty
	"sensorLimit": 2 // number of sensors that have to surpass the threshold in order to trigger the bot (helps avoiding false alarm caused by one malfunctioning sensor)
}
```

\* If you only know your [municipalities 7-digit key](http://www.statistik-portal.de/Statistik-Portal/gemeindeverz.asp), just add '0000' for the 11-digit key. Example (Berlin): 11000000 -> 110000000000. You can give multiple municipality keys.

** Even though you can add your Twitter API credentials in `default.json`, it's strongly recommended to store them in a seperate file called `production.json` which should look like this:

```js
{
	"twitter": { // your Twitter API credentials **
		"key": "X",
		"key_secret": "X",
		"token": "X",
		"token_secret": "X"
	}
}
```

**If you want to run the bot using `production.json`, just execute `npm run start`.**

## Contributing

If you found a bug, want to propose a feature or feel the urge to complain about your life, feel free to visit [the issues page](https://github.com/juliuste/berlinFeinstaub-bot/issues).
