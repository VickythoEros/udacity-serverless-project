import { TodosAccess } from '../dataLayers/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()
const bucketName = process.env.ATTACHMENT_S3_BUCKET



export async function CheckTodoExist(todoId:string, userId: string):Promise<boolean> {
    return todosAccess.CheckTodoExist(todoId,userId)
}

export async function getUserAllTodoItems(userId: string):Promise<TodoItem[]> {
    return todosAccess.getUserAllTodoItems(userId)
}

export async function createTodoItem(userId: string,todoItem: CreateTodoRequest): Promise<TodoItem> {

    const todoId = uuid.v4()

    return todosAccess.createTodoItem({
      todoId: todoId,
      userId: userId,
      name: todoItem.name,
      dueDate: todoItem.dueDate,
      done: false,
      createdAt: new Date().toISOString()
    })
}

export async function updateTodoItem(todoId:string, userId:string, todoUpdateItem:UpdateTodoRequest): Promise<void> {
    todosAccess.updateTodoItem(todoId,userId,todoUpdateItem)
}


export async function deleteTodoItem(todoId: string
,userId:string): Promise<void> {
    todosAccess.deleteTodoItem(todoId,userId)
}

export async function getPresignedUrl(todoId: string):Promise<string> {
    return todosAccess.getPresignedUrl(todoId)
}


export async function createAttachmentPresignedUrl(todoId: string, userId: string):Promise<string> {
    const uploadUrl = await todosAccess.getPresignedUrl(todoId)
    await todosAccess.attachmentUrl(todoId, userId,`https://${bucketName}.s3.amazonaws.com/${todoId}`);
    return uploadUrl;
  }