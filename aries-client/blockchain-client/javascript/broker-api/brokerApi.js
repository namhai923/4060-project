const axiosClient = require ('./axiosClient.js');

let brokerApi = {
  connectToAgent: ({invitationUrl}) => {
    let url = '/connectToAgent';
    return axiosClient.post(url, {invitationUrl});
  },
  getClientID: ({clientDid, clientThreadId}) => {
    let url = '/getClientID';
    return axiosClient.post(url, {clientDid, clientThreadId});
  },
  queryTopic: ({topicNumber, clientDid, clientThreadId}) => {
    let url = '/queryTopic';
    return axiosClient.post(url, {topicNumber, clientDid, clientThreadId});
  },
  createTopic: ({topicNumber, topicName, message, mode, clientDid, clientThreadId}) => {
    let url = '/createTopic';
    return axiosClient.post(url, {topicNumber, topicName, message, mode, clientDid, clientThreadId});
  },
  editTopic: ({topicNumber, editValue, editType, clientDid, clientThreadId}) => {
    let url = '/editTopic';
    return axiosClient.post(url, {topicNumber, editValue, editType, clientDid, clientThreadId});
  },
  addSubscriber: ({topicNumber, subscriberID, clientDid, clientThreadId}) => {
    let url = '/addSubscriber';
    return axiosClient.post(url, {topicNumber, subscriberID, clientDid, clientThreadId});
  },
  subscribeTopic: ({topicNumber, clientDid, clientThreadId}) => {
    let url = '/subscribeTopic';
    return axiosClient.post(url, {topicNumber, clientDid, clientThreadId});
  },
  searchTopic: ({searchValue, searchType, clientDid}) => {
    let url = '/searchTopic';
    return axiosClient.post(url, {searchValue, searchType, clientDid});
  },
  queryMulTopics: ({queryType, clientDid, clientThreadId}) => {
    let url = '/queryMulTopics';
    return axiosClient.post(url, {queryType, clientDid, clientThreadId})
  }
}

module.exports = brokerApi;