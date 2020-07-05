import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const calculatedBalance = transactions.reduce(
      (balance, transaction) => {
        if (transaction.type === 'income') {
          const newBalance = balance;
          newBalance.income += transaction.value;
          return newBalance;
        }
        const newBalance = balance;
        newBalance.outcome += transaction.value;
        return newBalance;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    calculatedBalance.total =
      calculatedBalance.income - calculatedBalance.outcome;

    return calculatedBalance;
  }
}

export default TransactionsRepository;
