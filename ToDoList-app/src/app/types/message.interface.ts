export enum MessageStatus {
  success = 'success',
  error = 'error'
}

export interface Message {
  type: MessageStatus;
  text: string
}