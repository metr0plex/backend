import { Contact } from '../models/Contact';

// Получение списка контактов с количеством вызовов
export const getAllContacts = async (ctx: any) => {
  try {
    const contacts = await Contact.findAll();
    ctx.body = contacts;
  } catch (error) {
    console.error('Ошибка при получении списка контактов:', error);
    ctx.status = 500;
    ctx.body = 'Произошла ошибка при получении списка контактов';
  }
};
// Получение определенного контакта со списком всех его вызовов
export const getById = async (ctx: any) => {
  try {
    const id = ctx.params.id;
    const contacts = await Contact.findById(id);
    ctx.body = contacts;
  } catch (error) {
    console.error('Ошибка при получении списка контактов:', error);
    ctx.status = 500;
    ctx.body = 'Произошла ошибка при получении списка контактов';
  }
};
// Создание нового контакта
export const createUser = async (ctx: any) => {
  try {
    const contactData = ctx.request.body;
    const newContact = new Contact(contactData.cid, contactData.name, contactData.surname, contactData.post);
    const contacts = await Contact.addNewUser(ctx.db, newContact);
    ctx.status = 201;
    ctx.body = contacts;
  } catch (error) {
    console.error('Ошибка при создании контакта:', error);
    ctx.status = 500;
    ctx.body = 'Произошла ошибка при создании контакта';
  }
};
// Редактирование отдельного контакта
export const updateUser = async (ctx: any) => {
  try {
    const id = ctx.params.id;
    const contactData = ctx.request.body;
    const updatedContact = new Contact(id, contactData.name, contactData.surname, contactData.post);
    const contacts = await Contact.updateContactById(id, updatedContact);
    if (contacts) {
      ctx.status = 200;
      ctx.body = contacts;
    } else {
      ctx.status = 404;
      ctx.body = contacts;
    }
  } catch (error) {
    console.error('Ошибка при редактировании контакта:', error);
    ctx.status = 500;
    ctx.body = 'Произошла ошибка при редактировании контакта';
  }
};
