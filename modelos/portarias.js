const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PortariaSchema = new Schema({

    titulo: {
        type: String,
        required: true,
    },
    assunto: {
        type: String,
        required: true,
    }

});

module.exports = mongoose.model('Portaria', PortariaSchema);