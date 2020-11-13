import { ObjectId } from '../../../decorators/objectId.decorator'

export class ParamsDto {
  @ObjectId({
    message: 'incorrect post id entered'
  })
  id: string
}