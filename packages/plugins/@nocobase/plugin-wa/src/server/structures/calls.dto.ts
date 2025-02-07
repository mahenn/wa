/**
 * Events
 */
import { ApiProperty } from '@nestjs/swagger';
import { ChatIdProperty } from './properties.dto';

function CallIdProperty() {
  return ApiProperty({
    description: 'Call ID',
    example: 'ABCDEFGABCDEFGABCDEFGABCDEFG',
  });
}

export class CallData {
  @CallIdProperty()
  id: string;

  @ChatIdProperty()
  from?: string;

  timestamp: number;

  isVideo: boolean;

  isGroup: boolean;
}
