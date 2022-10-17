import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { CheckTodoExist, deleteTodoItem } from '../../businessLogic/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('deleteTodoItem');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Remove a TODO item by id

    logger.warn(`Delete todo with id = ${todoId}, event : ${event} `);
    const userId = getUserId(event);
    
    const todoItem = await CheckTodoExist(todoId, userId);
    
    if (!todoItem) {
      logger.error(`todo with id = ${todoId} doesn't exist`);
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: `todo with id = ${todoId} doesn't exist`
        })
      };
    }
    
    await deleteTodoItem(todoId, userId)
    
    return {
      statusCode: 200,
      body: ""
    };
  }
)

handler
.use(httpErrorHandler())
.use(
    cors({
      credentials: true
    })
  )
