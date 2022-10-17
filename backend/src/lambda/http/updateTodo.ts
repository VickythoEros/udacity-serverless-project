import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { CheckTodoExist, updateTodoItem } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('updateTodoItem')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    logger.info(`Updating todo with id = ${todoId}, event :${event}`);
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

    await updateTodoItem(todoId,userId, updatedTodo);

    return {
      statusCode: 200,
      body: ""
    };
})

handler
.use(httpErrorHandler())
.use(
    cors({
      credentials: true
    })
  )
