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

let currentIncident = {
	"PM10": null,
	"PM2.5": null
}

let lastNotification = {
	"PM10": null,
	"PM2.5": null
}

let sendTweet

if(config.debug){
	sendTweet = (message) => console.log(message)
	config.requestInterval = 0.05
	config.notificationInterval = 0.2
	for(let t in config.thresholds) config.thresholds[t] = 1
}
else{
	sendTweet = (message) => twitter.post('statuses/update', {status: message}, (e) => console.error(e))
}

const getSensorName = (id) => {
	const x = config.sensors.find((s) => s.id === id)
	if(x && x.name) return x.name
	if(config.language === 'de') return `Sensor ${id}`
	else return `sensor ${id}`
}

const fetchSensorData = (sensorIDs) => {
	// todo: queue?
	const requests = []
	for(let sensorID of sensorIDs){
		requests.push(
			fetch(`https://api.luftdaten.info/static/v1/sensor/${sensorID}/`)
			.then((res) => res.json())
			.then((res) => ({
				sensor: sensorID,
				location: res[res.length-1].location ? {
					longitude: +res[res.length-1].location.longitude,
					latitude: +res[res.length-1].location.latitude
				} : {},
				values: {
					'PM10': filter(res[res.length-1].sensordatavalues, (o) => o.value_type==='P1')[0].value,
					'PM2.5': filter(res[res.length-1].sensordatavalues, (o) => o.value_type==='P2')[0].value
				}
			}))
			.catch((err) => ({sensor: sensorID, location: {}, values: {'PM10': null, 'PM2.5': null}}))
		)
	}
	return Promise.all(requests)
}

const generateSensorLink = (sensor) => {
	if(!sensor.location || !sensor.location.longitude || !sensor.location.latitude) return null
	else return `http://deutschland.maps.luftdaten.info/#13/${sensor.location.latitude}/${sensor.location.longitude}`
}

const checkSensorData = (sensorData) => {
	for(let type of ['PM10', 'PM2.5']){
		const sortedData = sortBy(
			filter(sensorData, (o) => (o.values[type] || 0) > config.thresholds[type]),
			(o) => (-1) * o.values[type]
		)
		if(sortedData.length >= (config.sensorLimit || 1)){
			let sensorList
			if(sortedData.length > 3){
				sensorList = sortedData.slice(0, 3).map((o) => getSensorName(o.sensor)).join(', ') + `, +${sortedData.length-3}`
			}
			else{
				sensorList = sortedData.map((o) => getSensorName(o.sensor)).join(', ')
			}
			let message
			const link = generateSensorLink(sortedData[sortedData.length-1])
			if(config.language === 'de'){
				message = `⚠ Erhöhte Feinstaubbelastung in ${config.regionName}: ${sensorList}! ${type} ${sortedData[sortedData.length-1].values[type]} µg/m³ (${getSensorName(sortedData[sortedData.length-1].sensor)})${link ? ' '+link : '.'}`
			}
			else{
				message = `⚠ Increased fine dust pollution in ${config.regionName}: ${sensorList}! ${type} ${sortedData[sortedData.length-1].values[type]} µg/m³ (${getSensorName(sortedData[sortedData.length-1].sensor)})${link ? ' '+link : '.'}`
			}
			if(
				( !currentIncident[type] || (currentIncident[type] + (config.notificationInterval * 60 * 1000) <= +(new Date())) )
			&&	( !lastNotification[type] || lastNotification[type] + (config.notificationInterval * 60 * 1000) <= +(new Date()) )
			){
				currentIncident[type] = +new Date()
				lastNotification[type] = +new Date()
				sendTweet(message)
			}
		}
		else{
			currentIncident[type] = null
		}
	}
}

const check = () =>
	getSensorIDs()
	.then(fetchSensorData)
	.then(checkSensorData)
	.catch(console.error)

setInterval(() => check(), config.requestInterval * 60*1000)
