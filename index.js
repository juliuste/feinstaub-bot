'use strict'

const config = require('config')
const fetch = require('node-fetch')
const filter = require('lodash.filter')
const sortBy = require('lodash.sortby')
const twitterClient = require('twit')
const getSensorIDs = require('./getSensorIDs')

const twitter = new twitterClient({
	consumer_key: config.twitter.key,
	consumer_secret: config.twitter.key_secret,
	access_token: config.twitter.token,
	access_token_secret: config.twitter.token_secret,
	timeout_ms: 60*1000
})

const sendTweet = (message) => twitter.post('statuses/update', {status: message}, (e) => console.error(e))

const fetchSensorData = (sensorIDs) => {
	// todo: queue?
	const requests = []
	for(let sensorID of sensorIDs){
		requests.push(
			fetch(`https://api.luftdaten.info/static/v1/sensor/${sensorID}/`)
			.then((res) => res.json())
			.then((res) => ({
				sensor: sensorID,
				value: filter(res[res.length-1].sensordatavalues, (o) => o.value_type==='P1')[0].value
			}))
			.catch((err) => ({sensor: sensorID, value: null}))
		)
	}
	return Promise.all(requests)
}

const checkSensorData = (sensorData) => {
	const sortedData = sortBy(
		filter(sensorData, (o) => (o.value || 0) > config.threshold),
		(o) => (-1) * o.value
	)
	if(sortedData.length > 1){
		let sensorList
		if(sortedData.length > 3){
			sensorList = sortedData.slice(0, 3).map((o) => o.sensor).join(', ') + `, +${sortedData.length-3} more`
		}
		else{
			sensorList = sortedData.map((o) => o.sensor).join(', ')
		}
		const message = `Caution! High fine dust pollution in Berlin at sensors ${sensorList}! Peak PM10 ${sortedData[0].value} µg/m³ at sensor ${sortedData[0].sensor}.`
		sendTweet(message)
	}
}

const check = () => 
	getSensorIDs()
	.then(fetchSensorData)
	.then(checkSensorData)

setInterval(() => check(), config.interval * 60*1000)