import { ApiProperty } from '@nestjs/swagger';
import { WAMedia } from './media.dto';
import { ReplyToMessage } from './message.dto';
import { WAMessageAck } from './enums.dto';
import { ChatIdProperty, MessageIdProperty } from './properties.dto';

export class WALocation {
  description?: string;
  latitude: string;
  longitude: string;
}

class WAMessageBase {
  @MessageIdProperty()
  id: string;

  /**  */
  @ApiProperty({
    description: 'Unix timestamp for when the message was created',
    example: 1666943582,
  })
  timestamp: number;

  @ChatIdProperty({
    description:
      'ID for the Chat that this message was sent to, except if the message was sent by the current user ',
  })
  from: any;

  @ApiProperty({
    description: 'Indicates if the message was sent by the current user',
  })
  fromMe: any;

  @ChatIdProperty({
    description: `
* ID for who this message is for.
* If the message is sent by the current user, it will be the Chat to which the message is being sent.
* If the message is sent by another user, it will be the ID for the current user.
`,
  })
  to: any;

  @ApiProperty({
    description: 'For groups - participant who sent the message',
  })
  participant: any;
}

export class WAMessage extends WAMessageBase {
  @ApiProperty({
    description: 'Message content',
  })
  body: string;

  @ApiProperty({
    description: 'Indicates if the message has media available for download',
  })
  hasMedia: boolean;

  @ApiProperty({
    description: 'Media object for the message if any and downloaded',
  })
  media?: any;

  @ApiProperty({
    description:
      'Use `media.url` instead! The URL for the media in the message if any',
    deprecated: true,
    example:
      'http://localhost:3000/api/files/false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA.oga',
  })
  mediaUrl: any;

  @ApiProperty({
    description: 'ACK status for the message',
  })
  ack: any;

  @ApiProperty({
    description: 'ACK status name for the message',
  })
  ackName: string;

  @ApiProperty({
    description:
      'If the message was sent to a group, this field will contain the user that sent the message.',
  })
  author?: string;

  @ApiProperty({
    description:
      'Location information contained in the message, if the message is type "location"',
  })
  location?: any;

  @ApiProperty({
    description: 'List of vCards contained in the message.',
  })
  vCards?: any;

  replyTo?: ReplyToMessage;

  @ApiProperty({
    description: 'Indicates if the message was forwarded',
  })
  forwarded?: any;

  @ApiProperty({
    description: 'Number of times the message was forwarded',
  })
  forwardingScore?: any;

  /** Returns message in a raw format */
  @ApiProperty({
    description:
      'Message in a raw format that we get from WhatsApp. May be changed anytime, use it with caution! It depends a lot on the underlying backend.',
  })
  _data?: any;
}

export class WAReaction {
  @ApiProperty({
    description:
      'Reaction to the message. Either the reaction (emoji) or empty string to remove the reaction',
  })
  text: string;

  @ApiProperty({
    description: 'Message ID for the message to react to',
    example: 'false_11111111111@c.us_AAAAAAAAAAAAAAAAAAAA',
  })
  messageId: string;
}

export class WAMessageReaction extends WAMessageBase {
  @ApiProperty({
    description:
      'Reaction to the message. Either the reaction (emoji) or empty string to remove the reaction',
  })
  reaction: WAReaction;
}
