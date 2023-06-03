import { StatusConfiguration, StatusType } from '../src/StatusConfiguration';

describe('identicalTo', () => {
    const symbol = 'P';
    const name = 'Pro';
    const nextStatusSymbol = 'C';
    const availableAsCommand = true;
    const type = StatusType.TODO;

    it('should detect identical objects', () => {
        const lhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        const rhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        expect(lhs.identicalTo(rhs)).toEqual(true);
    });

    it('should check symbol', () => {
        const lhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        const rhs = new StatusConfiguration('Q', name, nextStatusSymbol, availableAsCommand, type);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check name', () => {
        const lhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        const rhs = new StatusConfiguration(symbol, 'Con', nextStatusSymbol, availableAsCommand, type);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check nextStatusSymbol', () => {
        const lhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        const rhs = new StatusConfiguration(symbol, name, ' ', availableAsCommand, type);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check availableAsCommand', () => {
        const lhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        const rhs = new StatusConfiguration(symbol, name, nextStatusSymbol, false, type);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check type', () => {
        const lhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, StatusType.CANCELLED);
        const rhs = new StatusConfiguration(symbol, name, nextStatusSymbol, availableAsCommand, type);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });
});
