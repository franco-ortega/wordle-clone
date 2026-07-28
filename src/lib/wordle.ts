export const WORDS = [
	'PLANT',
	'CRANE',
	'BRAVE',
	'SHINE',
	'GHOST',
	'MUSIC',
	'SMILE',
	'QUICK',
	'STONE',
	'CLOUD',
] as const;

export type TileState = 'correct' | 'present' | 'absent';

export function getRandomWord() {
	const index = Math.floor(Math.random() * WORDS.length);
	return WORDS[index];
}

export function evaluateGuess(guess: string, target: string): TileState[] {
	const result: TileState[] = Array(guess.length).fill('absent');
	const remaining = new Map<string, number>();

	for (const char of target) {
		remaining.set(char, (remaining.get(char) ?? 0) + 1);
	}

	for (let index = 0; index < guess.length; index += 1) {
		if (guess[index] === target[index]) {
			result[index] = 'correct';
			remaining.set(guess[index], (remaining.get(guess[index]) ?? 0) - 1);
		}
	}

	for (let index = 0; index < guess.length; index += 1) {
		if (result[index] === 'correct') {
			continue;
		}

		const char = guess[index];
		const count = remaining.get(char) ?? 0;

		if (count > 0) {
			result[index] = 'present';
			remaining.set(char, count - 1);
		}
	}

	return result;
}
