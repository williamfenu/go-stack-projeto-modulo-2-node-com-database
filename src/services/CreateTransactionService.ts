import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError(
        'The outcome value must be less than the total amount',
      );
    }

    const categoryFound = await categoryRepository.findOne({
      title: category,
    });

    if (categoryFound) {
      const newTransaction = transactionRepository.create({
        title,
        value,
        type,
        category_id: categoryFound.id,
      });

      const transaction = await transactionRepository.save(newTransaction);

      return transaction;
    }

    const newCategory = categoryRepository.create({
      title: category,
    });

    const savedCategory = await categoryRepository.save(newCategory);

    const newTransaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: savedCategory.id,
    });

    const transaction = await transactionRepository.save(newTransaction);

    return transaction;
  }
}

export default CreateTransactionService;
