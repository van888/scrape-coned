const mongoose = require('mongoose')

const outageSchema = new mongoose.Schema({
    // __v: { type: Number, select: false },
    conedOutages: [{
        _id: false,
        headLine: {
            outageAreaName: { type: String, required: true },
            currentOutages: { type: Number, required: true },
            customersOut: { type: Number, required: true },
            downloadDate: { type: Date, required: false, default: new Date() - 4 * 60 * 60 * 1000 },
            // downloadDate: { type: Date, required: false, default: DateTime.Now }, 
            // $currentDate: { downloadDate: true },
            lastUpdate: { type: String, required: true },
            updateFrequency: { type: String, required: true },
            reportDescription: { type: String, required: true },
        },
        boroughs: [
            {
                _id: false,
                location: { type: String, required: true },
                customersOutage: { type: Number, required: true },
                customerServed: { type: Number, required: true },
                estimateRestore: { type: String, required: false },
                zone: { type: String, required: true },
                impactedArea: { type: String, required: true }
            },
        ]
    }]
})

module.exports = mongoose.model('outage5', outageSchema)