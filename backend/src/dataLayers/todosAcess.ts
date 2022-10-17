import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk')
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')


// TODO: Implement the dataLayer logic

export class TodosAccess {
  
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly s3 = new AWS.S3({ signatureVersion: 'v4'}),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
      private readonly indexName = process.env.TODOS_CREATED_AT_INDEX,
      private readonly signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION,
      ) {
    }
  

    async CheckTodoExist(todoId: string, userId: string): Promise<boolean> {
      logger.debug(`getItem with Id = ${todoId} and UserId = ${userId}`);
        const result = await this.docClient
          .get({
            TableName: this.todosTable,
            Key: {
              todoId: todoId, userId: userId
            }
          })
          .promise();
      
        return !!result.Item ;
      }

    async getUserAllTodoItems(userId: string): Promise<TodoItem[]> {
      logger.debug(`getUserAllTodoItems for UserId = ${userId}`);
      const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()

      return result.Items as TodoItem[]
    }
  

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
      logger.debug(`createTodoItem `);
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()
    
        return todoItem as TodoItem
    }

    async updateTodoItem(todoId: string, userId: string, updateTodoItem: TodoUpdate): Promise<void> {
      logger.debug(`updateTodoItem with Id = ${todoId} and UserId = ${userId}`);
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
              todoId: todoId , userId: userId
            },
            ExpressionAttributeNames: { '#name': 'name' }, //Attribute name is a reserved keyword in the Amazon DynamoDB.
            UpdateExpression: `set #name = :name, dueDate = :dueDate, done = :done`,
            ExpressionAttributeValues: {
              ":name": updateTodoItem.name,
              ":dueDate": updateTodoItem.dueDate,
              ":done": updateTodoItem.done
            }
        }).promise()
    
    }

    async deleteTodoItem(todoId: string, userId: string): Promise<void>{
        logger.debug('deleteTodoItem with Id:', todoId);

        await this.docClient.delete({
          TableName: this.todosTable,
          Key:{
            todoId: todoId,userId: userId
          }
        }).promise()

    }


    async getPresignedUrl(todoId: string): Promise<string> {
        logger.debug(`getPresignedUrl with Id: ${todoId}`);
    
        return this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: parseInt(this.signedUrlExpiration)
        });
    }

   async  attachmentUrl(todoId: string, userId: string, url: string): Promise<void> {
    logger.debug(`attachmentUrl (todoId: ${todoId}, url: ${url})`);
  
    await this.docClient.update({
        TableName: this.todosTable,
        Key: { 
            todoId: todoId, userId: userId 
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': url
        }
      })
      .promise();
    }

    

}
  