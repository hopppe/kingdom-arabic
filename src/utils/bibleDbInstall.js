// Unpacks the gzipped Bible database that ships inside the app.
//
// Shipping it compressed means the phone keeps ~16 MB of gzip in the app bundle
// plus one 43 MB unpacked copy, instead of the 43 MB database twice (expo-sqlite
// always copies a bundled database into its own directory before opening it).

import { Gunzip } from 'fflate';

const CHUNK_BYTES = 1 << 20;
const SQLITE_HEADER = 'SQLite format 3\u0000';

const nextTick = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Decompress gzip `input`, handing each output chunk to `onOutput`.
 * Feeds the input 1 MB at a time and yields between chunks so the UI keeps drawing.
 */
export async function gunzipInChunks(input, onOutput, { chunkBytes = CHUNK_BYTES, pause = nextTick } = {}) {
  if (!input || input.length === 0) {
    throw new Error('Bible database archive is empty');
  }
  const gunzip = new Gunzip((chunk) => onOutput(chunk));
  for (let offset = 0; offset < input.length; offset += chunkBytes) {
    const end = Math.min(offset + chunkBytes, input.length);
    gunzip.push(input.subarray(offset, end), end === input.length);
    await pause();
  }
}

const hasSqliteHeader = (bytes) =>
  bytes.length >= SQLITE_HEADER.length &&
  [...SQLITE_HEADER].every((char, index) => bytes[index] === char.charCodeAt(0));

/**
 * Unpack `gzBytes` into `sink` ({ write(Uint8Array), close() }) and verify the result.
 * Throws if the output is not a SQLite file of exactly `expectedBytes`, so the caller
 * can discard the partial file instead of opening a corrupt database.
 */
export async function unpackBibleDb(gzBytes, sink, { expectedBytes, ...options }) {
  let written = 0;
  let headerOk = null;
  try {
    await gunzipInChunks(
      gzBytes,
      (chunk) => {
        if (headerOk === null) headerOk = hasSqliteHeader(chunk);
        sink.write(chunk);
        written += chunk.length;
      },
      options
    );
  } finally {
    sink.close();
  }
  if (!headerOk) {
    throw new Error('Bible database archive does not contain a SQLite database');
  }
  if (written !== expectedBytes) {
    throw new Error(`Bible database unpacked to ${written} bytes, expected ${expectedBytes}`);
  }
  return written;
}
