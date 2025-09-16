// Lightweight local embedding via @xenova/transformers (no API key needed)
// Model: sentence-transformers/all-MiniLM-L6-v2 (384 dims), padded to 1536

let pipeline: any | null = null

async function loadPipeline() {
  if (pipeline) return pipeline
  // Dynamic import to avoid SSR cost until first use
  const tf = await import('@xenova/transformers')
  pipeline = await tf.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
    dtype: 'fp32',
    device: 'wasm',
  })
  return pipeline
}

function padTo1536(vec: number[]): number[] {
  const out = new Array(1536).fill(0)
  for (let i = 0; i < Math.min(1536, vec.length); i++) out[i] = vec[i]
  return out
}

function deterministicEmbedding(text: string): number[] {
  let s = Array.from(text).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 2166136261)
  const rnd = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 0xffffffff }
  return Array.from({ length: 1536 }, () => rnd() * 2 - 1)
}

export async function embedLocally(text: string): Promise<number[]> {
  try {
    const pipe = await loadPipeline()
    const output: any = await pipe(text, { normalize: true, pooling: 'mean' })
    const vector: number[] = Array.from(output.data || output)
    if (!vector || vector.length === 0) return deterministicEmbedding(text)
    return padTo1536(vector)
  } catch (err) {
    console.error('Local embedding failed, using deterministic fallback:', (err as any)?.message || err)
    return deterministicEmbedding(text)
  }
}

export function embedDeterministic(text: string): number[] {
  return deterministicEmbedding(text)
}


