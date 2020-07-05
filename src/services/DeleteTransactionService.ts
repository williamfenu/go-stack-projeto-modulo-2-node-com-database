import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  transactionId: string;
}

class DeleteTransactionService {
  public async execute(transactionId: string): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne(transactionId);
    if (!transaction) {
      throw new AppError('No transaction was found');
    }

    await transactionRepository.remove(transaction);
  }
}

export default DeleteTransactionService;
