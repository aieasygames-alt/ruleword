export function generateMemorySequence(
  length: number,
  random: () => number = Math.random,
): number[] {
  return Array.from({ length }, () => Math.floor(random() * 9))
}

export function checkMemorySequenceInput(
  sequence: number[],
  input: number[],
): 'pending' | 'correct' | 'wrong' {
  const index = input.length - 1
  if (index < 0) return 'pending'
  if (input[index] !== sequence[index]) return 'wrong'
  return input.length === sequence.length ? 'correct' : 'pending'
}
