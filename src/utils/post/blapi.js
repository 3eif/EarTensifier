const blapi = require('blapi');
const botLists = require('../../../config/botlists.json');

module.exports = async (client, servers, shardCount) => {
    blapi.setLogging(true);
    blapi.manualPost(servers, client.user.id, botLists, null, shardCount, null);
    client.log('Posted bot stats to bot lists.');
};