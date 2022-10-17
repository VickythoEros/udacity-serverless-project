import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl ,CheckTodoExist} from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('generateUploadUrl')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    
    const userId = getUserId(event);
    logger.debug(`attachment upload url todoId = ${todoId} by user: ${userId}`);


    const todoItem = await CheckTodoExist(todoId, userId);
    

    if (!todoItem) {
      logger.error(`todo with id = ${todoId} doesn't exist`);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Todo item doesn't exist"
        })
      };
    }

      const uploadUrl = await createAttachmentPresignedUrl(todoId, userId);
      return {
        statusCode: 201,
        body: JSON.stringify({ uploadUrl: uploadUrl  })
      };
  
    
  
  
})
    

handler
.use(httpErrorHandler())
.use(
    cors({
      credentials: true
    })
  )
