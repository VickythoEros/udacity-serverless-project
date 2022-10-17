import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors,httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodoItem } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'


const logger = createLogger('createTodoItem')


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    // TODO: Implement creating a new TODO item

    const userId = getUserId(event);
    logger.info(`Creating todo by User ${userId} , event :  ${event}`);

    const todoItem = await createTodoItem(userId,newTodo)

    return {
      statusCode: 201,
      body: JSON.stringify({ item: todoItem })
     };
})

handler
.use(httpErrorHandler())
.use(
  cors({
    credentials: true
  })
)
