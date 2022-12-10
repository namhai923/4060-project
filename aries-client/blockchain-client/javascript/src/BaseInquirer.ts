/**
 * REMARKS: Base Inquirer Setup for client's Command Line Interface 
 */

export enum ConfirmOptions {
  Yes = 'yes',
  No = 'no'
}

export enum AttrOptions {
  Number = 'number',
  Name = 'name',
  Message = 'message',
  Mode = 'mode'
}

export enum TopicType {
  Created = 'created',
  Subscribed = 'subscribed'
}

export enum TopicMode {
  Public = 'public',
  Private = 'private'
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

  public inquireOptions(title: string, promptOptions: string[]) {
    this.optionsInquirer.message = title
    this.optionsInquirer.choices = promptOptions
    return this.optionsInquirer
  }

  public inquireInput(title: string) {
    this.inputInquirer.message = title
    return this.inputInquirer
  }
}
