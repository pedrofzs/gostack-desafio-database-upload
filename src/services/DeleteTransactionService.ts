import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const transactionToRemove = await transactionsRepository.findOne(id);

    if (!transactionToRemove) {
      throw new AppError('The id does not match with any transaction.');
    }

    await transactionsRepository.remove(transactionToRemove);
  }
}

export default DeleteTransactionService;
