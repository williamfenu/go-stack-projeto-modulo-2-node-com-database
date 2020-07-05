import { Router } from 'express';
import { getCustomRepository } from 'typeorm';
import multer from 'multer';

import config from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const uploadConfig = multer(config);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionRepository.getBalance();
  const transactions = await transactionRepository.find();

  response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute(id);

  response.send();
});

transactionsRouter.post(
  '/import',
  uploadConfig.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();
    const transactions = await importTransactionService.execute(
      request.file.filename,
    );
    response.json(transactions);
  },
);

export default transactionsRouter;
