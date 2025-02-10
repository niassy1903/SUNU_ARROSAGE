import { CurrentTimePipe } from './current-time.pipe';

describe('CurrentTimePipe', () => {
  it('create an instance', () => {
    const pipe = new CurrentTimePipe();
    expect(pipe).toBeTruthy();
  });
});
