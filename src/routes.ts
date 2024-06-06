import Router from 'koa-router';
import { createUser, getAllContacts, getById, updateUser } from './controllers/ContactController';
import { requestLogger } from './middlewares/requestLogger';
import { responseBuilder } from './middlewares/responseBuilder';

const apiRouter = new Router({ prefix: '/api' });

apiRouter.use(responseBuilder);
apiRouter.use(requestLogger);

/**
 * GET /api/contacts - получение списка контактов
 * GET /api/contacts/1 - получение определенного контакта по его идентификатору
 * POST /api/contacts - создание нового контакта (name, surname, post)
 * PUT /api/contacts/:cid - редактирование существующего контакта
 */

export default [apiRouter];
apiRouter.get('/contacts', getAllContacts);
apiRouter.get('/contacts/:id', getById);
apiRouter.post('/contacts', createUser);
apiRouter.put('/contacts/:id', updateUser);
