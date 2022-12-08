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
  editTopic: ({topicNumber, editValue, editType, clientDid, clientThreadId}) => {
    let url = '/editTopic';
    return axiosClient.post(url, {topicNumber, editValue, editType, clientDid, clientThreadId});
  },
  subscribeTopic: ({topicNumber, clientDid, clientThreadId}) => {
    let url = '/subscribeTopic';
    return axiosClient.post(url, {topicNumber, clientDid, clientThreadId});
  },
  showTopics: ({clientDid}) => {
    let url = '/showTopics';
    return axiosClient.post(url, {clientDid});
  },
  queryAllTopics: ({clientDid, clientThreadId}) => {
    let url = '/queryAllTopics';
    return axiosClient.post(url, {clientDid, clientThreadId})
  }
}

module.exports = brokerApi;