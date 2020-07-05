import fs from 'fs';
import path from 'path';
import { getRepository, In } from 'typeorm';

import AppError from '../errors/AppError';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(fileName: string): Promise<Transaction[]> {
    const filePath = path.join(uploadConfig.directory, fileName);
    const fileExists = await fs.promises.stat(filePath);

    if (fileExists) {
      const buffer = await fs.promises.readFile(filePath, {
        encoding: 'utf-8',
      });

      const lines = buffer.split('\n');
      const transactions: Array<Request> = [];
      const categories: Array<string> = [];
      const categoryRepository = getRepository(Category);
      const transactionRepository = getRepository(Transaction);

      lines.slice(1, lines.length - 1).forEach(line => {
        const [title, type, value, category] = line
          .split(',')
          .map(cell => cell.trim());

        if (!title || !type || !value || !category) {
          throw new AppError('Every field must be filled');
        }

        const parsedValue = parseInt(value, 10);
        const verifiedType = type === 'income' ? 'income' : 'outcome';

        categories.push(category);
        transactions.push({
          title,
          type: verifiedType,
          value: parsedValue,
          category,
        });
      });

      const savedCategories = await categoryRepository.find({
        where: {
          title: In(categories),
        },
      });

      const newCategories = categories
        .filter(
          category =>
            !savedCategories
              .map(savedCategory => savedCategory.title)
              .includes(category),
        )
        .filter(
          (category, index, current) => current.indexOf(category) === index,
        );

      const categoriesEntities = newCategories.map(category =>
        categoryRepository.create({ title: category }),
      );

      const newCategoriesSaved = await categoryRepository.save(
        categoriesEntities,
      );

      const transactionsCategories = [
        ...newCategoriesSaved,
        ...savedCategories,
      ];

      const transactionsEntities = transactions.map(transaction =>
        transactionRepository.create({
          title: transaction.title,
          value: transaction.value,
          type: transaction.type,
          category_id: transactionsCategories.find(
            category => category.title === transaction.category,
          )?.id,
        }),
      );

      const transactionsSaved = transactionRepository.save(
        transactionsEntities,
      );

      await fs.promises.unlink(filePath);

      return transactionsSaved;
    }
    throw new AppError('File not Found');
  }
}

export default ImportTransactionsService;
