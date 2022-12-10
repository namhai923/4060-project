/**
 * Authors: Hai Nguyen, Sahilpreet Singh Sidhu, Chikamnaele Ngene
 * Supervisor: Sara Rouhani
 * 
 * REMARKS: Client app to connect with Broker server in order to connect client's agent with Broker's agent for 
 *          authenticating and verifying purpose, both agents are built with Hyperledger Aries (HA). Then client 
 *          will be able to interact with Broker's ledger and also update their ledger to synchronize data, 
 *          both ledgers are bulit with Hyperledger Fabric (HF).
 */

import { clear } from 'console'
import { textSync } from 'figlet'
import inquirer from 'inquirer'

import { ClientAgent } from './ClientAgent'
import { BaseInquirer, ConfirmOptions, AttrOptions, TopicType, TopicMode } from './BaseInquirer'
import { Listener } from './Listener'
import { greenText, Title } from './OutputClass'
import TopicClient from '../client-app/TopicClient'

/**
 * List of actions to interact with Broker's ledger
 */
enum PromptOptions {
  ShowID              = 'Show my ID',
  CreateConnection    = 'Connect to Broker',
  CreateTopic         = 'Create new topic',
  EditTopic           = 'Edit topic',
  AddSubscriber       = 'Add subscriber to your topic',
  SearchTopic         = 'Search from available topics',
  SubscribeTopic      = 'Subscribe to topic',
  QueryTopic          = 'Query topic',
  QueryMulTopics      = 'Query multiple topics',
  Exit                = 'Exit',
  ClearAll            = 'Clear all credentials and connections',
}

/**
 * This function will start the client app
 */
export const runClientAgent = async () => {
  clear()
  console.log(textSync('Client', { horizontalLayout: 'full' }))
  const clientInquirer = await ClientInquirer.build()
  await clientInquirer.processAnswer()
}

export class ClientInquirer extends BaseInquirer {
  private clientAgent: ClientAgent     // HA agent for authenticating purpose
  private listener: Listener           // listener for response from Broker's server
  private clientApi: TopicClient       // client's api to send data and interact with Broker's server

  public constructor(clientAgent: ClientAgent, clientApi: TopicClient) {
    super()
    this.clientAgent = clientAgent
    this.clientApi = clientApi
    this.listener = new Listener()
    this.listener.messageListener(this.clientAgent)
  }

  /**
   * This function will connect to HF ledger and create a HA agent with specific configuration
   * 
   * @returns {ClientInquirer} client with built HA agent and connected to HF ledger
   */
  public static async build(): Promise<ClientInquirer> {
    const clientAgent = await ClientAgent.build()

    let connectConfig = {
      mspOrg: 'Org1MSP',
      orgUserId: 'appUser',
      caClientPath: 'ca.org1.example.com',
      userPath: 'org1.department1'
    }

    const clientApi = await TopicClient.build(connectConfig)
    return new ClientInquirer(clientAgent, clientApi)
  }

  /**
   * This function will display list of appropriate actions that client can perform 
   * 
   * @returns {string} client's choice from the list of actions
   */
  private async getPromptChoice() {
    if (this.clientAgent.connected) {
      const connectedOptions = [PromptOptions.ShowID,
                                PromptOptions.CreateTopic,
                                PromptOptions.EditTopic,
                                PromptOptions.AddSubscriber,
                                PromptOptions.SearchTopic,
                                PromptOptions.SubscribeTopic,
                                PromptOptions.QueryTopic,
                                PromptOptions.QueryMulTopics,
                                PromptOptions.Exit]
      return await inquirer.prompt([this.inquireOptions(Title.OptionsTitle, connectedOptions)])
    }

    const reducedOption = [PromptOptions.CreateConnection, PromptOptions.Exit, PromptOptions.ClearAll]
    return await inquirer.prompt([this.inquireOptions(Title.OptionsTitle, reducedOption)])
  }

  /**
   * This function will choose action to perform based on client's choice
   */
  public async processAnswer() {
    const choice = await this.getPromptChoice()
    if(this.listener.on) return

    switch (choice.options) {
      case PromptOptions.CreateConnection:
        await this.connection()
        break
      case PromptOptions.ShowID:
        await this.showID()
        break
      case PromptOptions.CreateTopic:
        await this.createTopic()
        break
      case PromptOptions.EditTopic:
        await this.editTopic()
        break
      case PromptOptions.AddSubscriber:
        await this.addSubscriber()
        break
      case PromptOptions.SearchTopic:
        await this.searchTopic()
        break
      case PromptOptions.SubscribeTopic:
        await this.subscribeTopic()
        break
      case PromptOptions.QueryTopic:
        await this.queryTopic()
        break
      case PromptOptions.QueryMulTopics:
        await this.queryMulTopics()
        break
      case PromptOptions.Exit:
        await this.exit()
        break
      case PromptOptions.ClearAll:
        await this.clearAll()
        break
    }
    await this.processAnswer()
  }

  /**
   * This function will connect client agent to Broker's agent and start listening to Broker's agent
   */
  private async connection() {
    let invitation = await this.clientAgent.printConnectionInvite()
    this.listener.proofRequestListener(this.clientAgent)
    this.listener.credentialOfferListener(this.clientAgent)
    await this.sendInvitation(invitation)
  }

  /**
   * This function will send connecting invitation to Broker server
   * 
   * @param invitationUrl invitation url that will be sent to Broker server
   */
  private async sendInvitation(invitationUrl: string) {
    const reqBody = { invitationUrl }
    let response = await this.clientApi.connectToAgent(reqBody)
    await this.clientAgent.waitForConnection()
    console.log(greenText(response.message))
  }

  /**
   * This function let uesr show their own credential ID
   * 
   */
  private async showID() {
    let response = await this.clientApi.getClientID(await this.addAuthInfo({}))
    console.log(greenText(response.message))
  }

  private async addSubscriber() {
    const topicNumber = (await inquirer.prompt([this.inquireInput(Title.TopicNumberTitle)])).input
    const subscriberID = (await inquirer.prompt([this.inquireInput(Title.AddSubTitle)])).input
    let reqBody = { topicNumber, subscriberID }

    let response = await this.clientApi.addSubscriber(await this.addAuthInfo(reqBody))
    console.log(greenText(response.message))
  }

  /**
   * This function will get threadID of client's most current credential 
   * 
   * @returns {string} threadID of client's most current credential
   */
  private async getLatestCred() {
    let allRecords = await this.clientAgent.agent.credentials.getAll()
    let currDate = allRecords[0].createdAt, currThreadId = allRecords[0].threadId 
    allRecords.forEach( async element => {
      if(element.createdAt > currDate){
        currDate = element.createdAt
        currThreadId = element.threadId
      }
    })

    return currThreadId
  }

  /**
   * This function will add information for Broker's authentication and verification
   * 
   * @param reqBody data that will be sent to Broker server
   * @returns {any} data with added information for authenticating and verifying
   */
  private async addAuthInfo(reqBody: any) {
    Object.assign(reqBody, { clientDid: (await this.clientAgent.getConnectionRecord()).did })
    Object.assign(reqBody,{ clientThreadId: await this.getLatestCred() })
    return reqBody
  }

  /**
   * This function will prompt user's input to create a new topic
   * 
   * @returns {any} new topic's data
   */
  private async getTopicDetails() {
    const topicNumber = (await inquirer.prompt([this.inquireInput(Title.TopicNumberTitle)])).input
    const topicName = (await inquirer.prompt([this.inquireInput(Title.TopicNameTitle)])).input
    const message = (await inquirer.prompt([this.inquireInput(Title.MessageDetailsTitle)])).input
    const mode = await inquirer.prompt([this.inquireOptions(Title.TopicModeTitle, [TopicMode.Public, TopicMode.Private])])

    return { topicNumber, topicName, message, mode: mode.options }
  }

  /**
   * This function will sent data to Broker server to create a new topic on Broker's ledger
   */
  private async createTopic() {
    let reqBody = await this.getTopicDetails()

    let response = await this.clientApi.createTopic(await this.addAuthInfo(reqBody))
    console.log(greenText(response.message))
  }
  /**
   * This function will prompt user's choice and input for that
   * 
   * @param title title string for prompt options
   * @returns user's choice and input for that
   */
  private async attrPrompt(title: string, attrOptions: string[]) {
    const attrType = await inquirer.prompt([this.inquireOptions(title, attrOptions)])
    let attrValue
    if (attrType.options === AttrOptions.Number) {
      attrValue = (await inquirer.prompt([this.inquireInput(Title.TopicNumberTitle)])).input
    } else if (attrType.options === AttrOptions.Name) {
      attrValue = (await inquirer.prompt([this.inquireInput(Title.TopicNameTitle)])).input
    } else if (attrType.options === AttrOptions.Message) {
      attrValue = (await inquirer.prompt([this.inquireInput(Title.MessageDetailsTitle)])).input
    } else {
      const mode = await inquirer.prompt([this.inquireOptions(Title.TopicModeTitle, [TopicMode.Public, TopicMode.Private])])
      attrValue = mode.options
    }
    return {attrValue, attrType: attrType.options}
  }

  /**
   * This function will sent data to Broker server to modify an existed topic on Broker's ledger
   */
  private async editTopic() {
    const topicNumber = (await inquirer.prompt([this.inquireInput(Title.TopicNumberTitle)])).input
    let {attrValue: editValue, attrType: editType} = await this.attrPrompt(Title.EditTypeTitle, [AttrOptions.Name, AttrOptions.Message, AttrOptions.Mode])
    let reqBody = { topicNumber, editValue, editType }

    let response = await this.clientApi.editTopic(await this.addAuthInfo(reqBody))
    console.log(greenText(response.message))
  }

  /**
   * This function will sent data to Broker server to get basic information of searched topics on Broker's ledger
   */
  private async searchTopic() {
    let {attrValue: searchValue, attrType: searchType} = await this.attrPrompt(Title.SearchTypeTitle, [AttrOptions.Number, AttrOptions.Name, AttrOptions.Mode])
    let reqBody = {searchValue, searchType}

    let response = await this.clientApi.searchTopic(Object.assign(reqBody, { clientDid: (await this.clientAgent.getConnectionRecord()).did }))
    for (let topic of response) {
      console.log(greenText(topic))
    }
  }

  /**
   * This function will sent data to Broker server to subscribe for an existed topic on Broker's ledger
   */
  private async subscribeTopic() {
    const topicNumber = (await inquirer.prompt([this.inquireInput(Title.TopicNumberTitle)])).input
    const reqBody = { topicNumber }

    let response = await this.clientApi.subscribeTopic(await this.addAuthInfo(reqBody))
    console.log(greenText(response.message))
  }

  /**
   * This function will sent data to Broker server to query an existed topic on Broker's ledger
   */
  private async queryTopic(){
    const topicNumber = (await inquirer.prompt([this.inquireInput(Title.TopicNumberTitle)])).input
    const reqBody = { topicNumber }

    let response = await this.clientApi.queryTopic(await this.addAuthInfo(reqBody))
    console.log(response)
  }

  /**
   * This function will sent data to Broker server to query all created or subscribed topics on Broker's ledger
   */
  private async queryMulTopics(){
    const queryType = await inquirer.prompt([this.inquireOptions(Title.QueryTypeTitle, [TopicType.Created, TopicType.Subscribed])])
    const reqBody = { queryType: queryType.options }

    let response = await this.clientApi.queryMulTopics(await this.addAuthInfo(reqBody))
    console.log(response)
  }

  /**
   * This function will shutdown client
   */
  private async exit() {
    const confirm = await inquirer.prompt([this.inquireOptions(Title.ConfirmTitle, [ConfirmOptions.Yes, ConfirmOptions.No])])
    if (confirm.options === ConfirmOptions.Yes) {
      await this.clientApi.disconnect()
      await this.clientAgent.exit()
      process.exit(0)
    }
  }

  /**
   * This function will delete all credentials and connections in HA agent
   * (ONLY USE FOR DEVELOPING AND TESTING PURPOSE)
   */
  private async clearAll() {
    let credentialRecords = await this.clientAgent.agent.credentials.getAll()
    credentialRecords.forEach(async element => {
      await this.clientAgent.agent.credentials.deleteById(element.id)
    })

    let connectionRecords = await this.clientAgent.agent.connections.getAll()
    connectionRecords.forEach(async element => {
      await this.clientAgent.agent.connections.deleteById(element.id)
    })
  }
}

void runClientAgent()
