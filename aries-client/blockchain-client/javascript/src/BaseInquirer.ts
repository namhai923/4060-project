/**
 * REMARKS: Base Inquirer Setup for client's Command Line Interface 
 */

import { Title } from './OutputClass'

export enum ConfirmOptions {
  Yes = 'yes',
  No = 'no'
}

export enum TopicOptions {
  Name = 'name',
  Message = 'message',
  Mode = 'mode'
}

export enum TopicType {
  Created = 'created',
  Subscribed = 'subscribed'
}

export class BaseInquirer {
  public optionsInquirer: { type: string; prefix: string; name: string; message: string; choices: string[] }
  public inputInquirer: { type: string; prefix: string; name: string; message: string; choices: string[] }

  public constructor() {
    this.optionsInquirer = {
      type: 'list',
      prefix: '',
      name: 'options',
      message: '',
      choices: [],
    }

    this.inputInquirer = {
      type: 'input',
      prefix: '',
      name: 'input',
      message: '',
      choices: [],
    }
  }

  public inquireOptions(promptOptions: string[]) {
    this.optionsInquirer.message = Title.OptionsTitle
    this.optionsInquirer.choices = promptOptions
    return this.optionsInquirer
  }

  public inquireInput(title: string) {
    this.inputInquirer.message = title
    return this.inputInquirer
  }

  public inquireConfirmation(title: string) {
    this.optionsInquirer.message = title
    this.optionsInquirer.choices = [ConfirmOptions.Yes, ConfirmOptions.No]
    return this.optionsInquirer
  }

  public inquireEditType(title: string) {
    this.optionsInquirer.message = title
    this.optionsInquirer.choices = [TopicOptions.Name, TopicOptions.Message, TopicOptions.Mode]
    return this.optionsInquirer
  }

  public inquireTopicType(title: string) {
    this.optionsInquirer.message = title
    this.optionsInquirer.choices = [TopicType.Created, TopicType.Subscribed]
    return this.optionsInquirer
  }
}
