import { gzipSync } from 'fflate';
import { gunzipInChunks, unpackBibleDb } from './bibleDbInstall';

const fakeDb = (size) => {
  const bytes = new Uint8Array(size);
  const header = 'SQLite format 3\u0000';
  [...header].forEach((char, index) => {
    bytes[index] = char.charCodeAt(0);
  });
  for (let i = header.length; i < size; i += 1) bytes[i] = (i * 31) % 251;
  return bytes;
};

const collectingSink = () => {
  const chunks = [];
  const sink = {
    closed: false,
    write: (chunk) => chunks.push(chunk.slice()),
    close: () => {
      sink.closed = true;
    },
    bytes: () => {
      const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
      chunks.reduce((offset, c) => {
        out.set(c, offset);
        return offset + c.length;
      }, 0);
      return out;
    },
  };
  return sink;
};

const noPause = () => Promise.resolve();

describe('gunzipInChunks', () => {
  it('round-trips data fed in small chunks and yields between them', async () => {
    const original = fakeDb(50000);
    const sink = collectingSink();
    const pause = jest.fn(noPause);
    await gunzipInChunks(gzipSync(original), sink.write, { chunkBytes: 64, pause });
    expect(sink.bytes()).toEqual(original);
    expect(pause.mock.calls.length).toBeGreaterThan(1);
  });

  it('rejects an empty archive', async () => {
    await expect(gunzipInChunks(new Uint8Array(0), () => {})).rejects.toThrow('empty');
  });
});

describe('unpackBibleDb', () => {
  it('writes the database and returns its size', async () => {
    const original = fakeDb(20000);
    const sink = collectingSink();
    const written = await unpackBibleDb(gzipSync(original), sink, {
      expectedBytes: original.length,
      pause: noPause,
    });
    expect(written).toBe(original.length);
    expect(sink.bytes()).toEqual(original);
    expect(sink.closed).toBe(true);
  });

  it('rejects output of the wrong size', async () => {
    const sink = collectingSink();
    await expect(
      unpackBibleDb(gzipSync(fakeDb(20000)), sink, { expectedBytes: 19999, pause: noPause })
    ).rejects.toThrow('expected 19999');
    expect(sink.closed).toBe(true);
  });

  it('rejects an archive that is not a SQLite database', async () => {
    const notDb = new TextEncoder().encode('just some text, not a database');
    await expect(
      unpackBibleDb(gzipSync(notDb), collectingSink(), { expectedBytes: notDb.length, pause: noPause })
    ).rejects.toThrow('does not contain a SQLite database');
  });

  it('closes the sink when the archive is corrupt', async () => {
    const sink = collectingSink();
    const corrupt = gzipSync(fakeDb(20000)).slice(0, 200);
    await expect(
      unpackBibleDb(corrupt, sink, { expectedBytes: 20000, pause: noPause })
    ).rejects.toThrow();
    expect(sink.closed).toBe(true);
  });
});
