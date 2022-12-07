const axiosClient = require ('./axiosClient.js');

let brokerApi = {
  connectToAgent: ({invitationUrl}) => {
    let url = '/connectToAgent';
    return axiosClient.post(url, {invitationUrl});
  },
  queryTopic: ({topicNumber, clientDid, clientThreadId}) => {
    let url = '/queryTopic';
    return axiosClient.post(url, {topicNumber, clientDid, clientThreadId});
  },
  createTopic: ({topicNumber, topicName, message, mode, clientDid, clientThreadId}) => {
    let url = '/createTopic';
    return axiosClient.post(url, {topicNumber, topicName, message, mode, clientDid, clientThreadId});
  },
  editTopic: ({topicNumber, topicName, message, mode, clientDid, clientThreadId}) => {
    let url = '/editTopic';
    return axiosClient.post(url, {topicNumber, topicName, message, mode, clientDid, clientThreadId});
  },
  subscribeToTopic: ({topicNumber, clientDid, clientThreadId}) => {
    let url = '/subscribeToTopic';
    return axiosClient.post(url, {topicNumber, clientDid, clientThreadId});
  },
  queryAllTopics: ({clientDid, clientThreadId}) => {
    let url = '/queryAllTopics';
    return axiosClient.post(url, {clientDid, clientThreadId})
  }
}

module.exports = brokerApi;