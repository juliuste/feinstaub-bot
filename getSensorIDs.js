'use strict'

const fetch = require('node-fetch')
const filter = require('lodash.filter')
const berlin = require('german-states-bbox').BE

const isInBBox = (coords, bbox) => (
		(coords.latitude <= bbox[0])
	&&	(coords.latitude >= bbox[2])
	&&	(coords.longitude <= bbox[3])
	&&	(coords.longitude >= bbox[1])
)

const getSensorIDs = () =>
	fetch('https://api.luftdaten.info/static/v2/data.dust.min.json')
	.then((res) => res.json())
	.then((res) => filter(res, (o) => isInBBox(o.location, berlin)))
	.then((res) => res.map((o) => o.sensor.id))
	.catch((err) => [])

module.exports = getSensorIDs