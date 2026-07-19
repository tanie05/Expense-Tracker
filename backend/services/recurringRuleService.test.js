const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const RecurringRule = require('../models/recurringRuleModel');
const Transaction = require('../models/transactionModel');
const { runCatchUp } = require('./recurringRuleService');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await RecurringRule.deleteMany({});
  await Transaction.deleteMany({});
  jest.useRealTimers();
});

const userId = new mongoose.Types.ObjectId();
const categoryId = new mongoose.Types.ObjectId();

const makeRule = (overrides) => RecurringRule.create({
  user_id: userId,
  category_id: categoryId,
  type: 'expense',
  amount: 1000,
  frequency: 'monthly',
  interval: 1,
  start_date: new Date('2026-01-01'),
  next_run_date: new Date('2026-01-01'),
  ...overrides
});

const setToday = (isoDate) => {
  jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });
  jest.setSystemTime(new Date(isoDate));
};

describe('runCatchUp', () => {
  test('multi-month backfill: 3 months untouched produces 3 transactions with correct dates', async () => {
    setToday('2026-07-13T00:00:00.000Z');

    const rule = await makeRule({
      day_of_month: 15,
      next_run_date: new Date('2026-04-15')
    });

    await runCatchUp(userId);

    const transactions = await Transaction.find({ recurring_rule_id: rule._id }).sort('date');
    expect(transactions).toHaveLength(3);
    expect(transactions.map(t => t.date.toISOString().slice(0, 10))).toEqual([
      '2026-04-15',
      '2026-05-15',
      '2026-06-15'
    ]);

    const updated = await RecurringRule.findById(rule._id);
    expect(updated.next_run_date.toISOString().slice(0, 10)).toBe('2026-07-15');
    expect(updated.last_generated_date.toISOString().slice(0, 10)).toBe('2026-06-15');
  });

  test('month-end clamping: day_of_month 31 clamps to shorter months', async () => {
    setToday('2026-03-05T00:00:00.000Z');

    const rule = await makeRule({
      day_of_month: 31,
      next_run_date: new Date('2026-01-31')
    });

    await runCatchUp(userId);

    const transactions = await Transaction.find({ recurring_rule_id: rule._id }).sort('date');
    expect(transactions.map(t => t.date.toISOString().slice(0, 10))).toEqual([
      '2026-01-31',
      '2026-02-28'
    ]);

    const updated = await RecurringRule.findById(rule._id);
    expect(updated.next_run_date.toISOString().slice(0, 10)).toBe('2026-03-31');
  });

  test('end-date boundary: stops generating once next_run_date passes end_date', async () => {
    setToday('2026-06-01T00:00:00.000Z');

    const rule = await makeRule({
      day_of_month: 1,
      next_run_date: new Date('2026-01-01'),
      end_date: new Date('2026-02-15')
    });

    await runCatchUp(userId);

    const transactions = await Transaction.find({ recurring_rule_id: rule._id }).sort('date');
    expect(transactions.map(t => t.date.toISOString().slice(0, 10))).toEqual([
      '2026-01-01',
      '2026-02-01'
    ]);
  });

  test('end-date already passed: no transaction is created', async () => {
    setToday('2026-06-01T00:00:00.000Z');

    const rule = await makeRule({
      next_run_date: new Date('2026-01-01'),
      end_date: new Date('2025-12-31')
    });

    await runCatchUp(userId);

    const transactions = await Transaction.find({ recurring_rule_id: rule._id });
    expect(transactions).toHaveLength(0);
  });

  test('idempotency: running twice back-to-back does not duplicate transactions', async () => {
    setToday('2026-07-13T00:00:00.000Z');

    const rule = await makeRule({
      day_of_month: 15,
      next_run_date: new Date('2026-05-15')
    });

    await runCatchUp(userId);
    const firstRunCount = await Transaction.countDocuments({ recurring_rule_id: rule._id });

    await runCatchUp(userId);
    const secondRunCount = await Transaction.countDocuments({ recurring_rule_id: rule._id });

    expect(secondRunCount).toBe(firstRunCount);
    expect(firstRunCount).toBe(2);
  });

  test('inactive rules are skipped', async () => {
    setToday('2026-07-13T00:00:00.000Z');

    const rule = await makeRule({
      next_run_date: new Date('2026-01-01'),
      is_active: false
    });

    await runCatchUp(userId);

    const transactions = await Transaction.find({ recurring_rule_id: rule._id });
    expect(transactions).toHaveLength(0);
  });

  test('scoping by userId only catches up that user\'s rules', async () => {
    setToday('2026-07-13T00:00:00.000Z');

    const otherUserId = new mongoose.Types.ObjectId();
    const myRule = await makeRule({ next_run_date: new Date('2026-01-01') });
    const otherRule = await RecurringRule.create({
      user_id: otherUserId,
      category_id: categoryId,
      type: 'expense',
      amount: 500,
      frequency: 'monthly',
      interval: 1,
      start_date: new Date('2026-01-01'),
      next_run_date: new Date('2026-01-01')
    });

    await runCatchUp(userId);

    expect(await Transaction.countDocuments({ recurring_rule_id: myRule._id })).toBeGreaterThan(0);
    expect(await Transaction.countDocuments({ recurring_rule_id: otherRule._id })).toBe(0);
  });
});
