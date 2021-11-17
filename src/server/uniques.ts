interface Unique
{
  id: string,
  ms: number,
}

const DefaultLimit = 1000 * 60 * 60 * 48; // Track over two days

export class Uniques
{
  msLimit: number;
  uniques: { [id: string]: number };

  constructor(msLimit: number = DefaultLimit)
  {
    this.msLimit = msLimit;
    this.uniques = {};
  }

  cull(): void
  {
    let msExpires = (new Date()).getTime() - this.msLimit;
    Object.keys(this.uniques).forEach(id => {
        if (this.uniques[id] < msExpires)
          delete this.uniques[id];
      });
  }

  touch(id: string): void
  {
    this.uniques[id] = (new Date()).getTime();
  }

  count(msSince: number): number
  {
    let n = 0;
    let msCount = (new Date()).getTime() - msSince;
    Object.values(this.uniques).forEach((ms: number) => {
        if (ms > msCount)
          n++;
      });
    return n;
  }

  lastMinute(): number { return this.count(1000 * 60) }
  lastHour(): number { return this.count(1000 * 60 * 60) }
  lastDay(): number { this.cull(); return this.count(1000 * 60 * 60 * 24) }
}
