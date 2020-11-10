import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface TransactionCSV {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const csvFilePath = path.resolve(__dirname, filePath);

    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      ltrim: true,
      rtrim: true,
      columns: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionCSV[] = [];
    const transactions: Transaction[] = [];

    parseCSV.on('data', line => {
      lines.push(line);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    const createTransactions = new CreateTransactionService();

    // eslint-disable-next-line no-restricted-syntax
    for await (const line of lines) {
      const { title, value, type, category } = line;
      const newTransaction = await createTransactions.execute({
        title,
        value,
        type,
        category,
      });
      transactions.push(newTransaction);
    }

    await fs.promises.unlink(filePath);

    // lines.forEach(async line => {
    //   const { title, value, type, category } = line;
    //   const newTransaction = await createTransactions.execute({
    //     title,
    //     value,
    //     type,
    //     category,
    //   });
    //   transactions.push(newTransaction);
    // });

    return transactions;
  }
}

export default ImportTransactionsService;
