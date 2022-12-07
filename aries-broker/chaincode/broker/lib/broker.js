'use strict';

const { Contract } = require('fabric-contract-api');

class Broker extends Contract {

    // Query the state of a topic from the ledger.
    async queryTopic(ctx, topicNumber) {
        console.info('============= START : Initialize Query Topic ===========');
        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            return { message: `${topicNumber} does not exist` };
        }
        console.info('============= END : Initialize Query Topic ===========');
        return topicAsBytes.toString();
    }

    // Create a new topic with the provided information and put it on the ledger.
    async createTopic(ctx, topicNumber, topicName, message, mode) {
        console.info('============= START : Create Topic ===========');

        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (topicAsBytes && topicAsBytes.length !== 0) {
            return { message: `${topicNumber} already exist` };
        }

        let topic = {
            docType: 'topic',
            topicName,
            message,
            mode
        }

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic)));
        console.info('============= END : Create Topic ===========');
        return { message: `${topicNumber} is created` };
    }

    // Edit a topic on the ledger.
    async editTopic(ctx, topicNumber, editValue, editType) {
        console.info('============= START : Edit a Topic ===========');

        const topicAsBytes = await ctx.stub.getState(topicNumber); // get the topic from chaincode state
        if (!topicAsBytes || topicAsBytes.length === 0) {
            return { message: `${topicNumber} does not exist` };
        }
        const topic = JSON.parse(topicAsBytes.toString());
        if (editType === 'name') {
            topic.topicName = editValue;
        } else if (editType === 'message') {
            topic.message = editValue;
        } else if (editType === 'mode') {
            topic.mode = editValue
        }

        await ctx.stub.putState(topicNumber, Buffer.from(JSON.stringify(topic))); // update topic on ledger

        console.info('============= END : Edit a Topic ===========');
        return { message: `${topicNumber} is updated` };
    }

    // Query all topics from the ledger.
    async queryAllTopics(ctx) {
        console.info('============= START : Initialize Query All Topics ===========');
        const startKey = '';
        const endKey = '';
        const allResults = [];
        for await (const { key, value } of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ key, record });
        }
        console.info('============= END : Initialize Query All Topics ===========');
        return allResults;
    }
}

module.exports = Broker;