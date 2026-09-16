'use client';

import { FormEvent, useState } from 'react';

const ANSWER = 'CRANE';
const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type LetterStatus = 'empty' | 'correct' | 'present' | 'absent';

export default function Wordle(): JSX.Element {
	const [currentGuess, setCurrentGuess] = useState<string>('');
	const [guesses, setGuesses] = useState<string[]>([]);
	const [message, setMessage] = useState<string>('');

	function submitGuess(event: FormEvent<HTMLFormElement>): void {
		event.preventDefault();

		const guess = currentGuess.trim().toUpperCase();

		if (guess.length !== WORD_LENGTH) {
			setMessage('Your guess must contain 5 letters.');
			return;
		}

		if (guesses.length >= MAX_GUESSES || guesses.includes(ANSWER)) {
			return;
		}

		setGuesses((previousGuesses: string[]) => [...previousGuesses, guess]);

		setCurrentGuess('');
		setMessage('');

		if (guess === ANSWER) {
			setMessage('You won!');
		} else if (guesses.length + 1 === MAX_GUESSES) {
			setMessage(`Game over! The answer was ${ANSWER}.`);
		}
	}

	const gameOver = guesses.length >= MAX_GUESSES || guesses.includes(ANSWER);

	return (
		<main className='mx-auto flex min-h-screen max-w-md flex-col items-center px-4 py-8'>
			<h1 className='mb-6 text-3xl font-bold'>Wordle</h1>

			<div className='mb-6 flex flex-col gap-1.5'>
				{Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
					const guess: string = guesses[rowIndex] ?? '';

					return (
						<div className='flex gap-1.5' key={rowIndex}>
							{Array.from({ length: WORD_LENGTH }).map((_, columnIndex) => {
								const letter: string = guess[columnIndex] ?? '';

								const status: LetterStatus = getLetterStatus(
									letter,
									columnIndex,
									ANSWER,
								);

								return (
									<div
										key={columnIndex}
										className={[
											'flex h-14 w-14 items-center justify-center',
											'border-2 text-2xl font-bold uppercase',
											getTileClasses(status),
										].join(' ')}
									>
										{letter}
									</div>
								);
							})}
						</div>
					);
				})}
			</div>

			<form
				onSubmit={submitGuess}
				className='flex w-full max-w-sm justify-center gap-2'
			>
				<input
					value={currentGuess}
					onChange={(event) =>
						setCurrentGuess(event.target.value.toUpperCase())
					}
					maxLength={WORD_LENGTH}
					disabled={gameOver}
					aria-label='Enter your guess'
					className='w-32 rounded border-2 border-gray-300 px-3 py-2 text-center text-xl uppercase outline-none focus:border-blue-500 disabled:bg-gray-100'
				/>

				<button
					type='submit'
					disabled={gameOver}
					className='rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400'
				>
					Submit
				</button>
			</form>

			{message && <p className='mt-4 text-center font-semibold'>{message}</p>}
		</main>
	);
}

function getLetterStatus(
	letter: string,
	index: number,
	answer: string,
): LetterStatus {
	if (letter === '') {
		return 'empty';
	}

	if (letter === answer[index]) {
		return 'correct';
	}

	if (answer.includes(letter)) {
		return 'present';
	}

	return 'absent';
}

function getTileClasses(status: LetterStatus): string {
	switch (status) {
		case 'correct':
			return 'border-green-600 bg-green-600 text-white';

		case 'present':
			return 'border-yellow-500 bg-yellow-500 text-white';

		case 'absent':
			return 'border-gray-500 bg-gray-500 text-white';

		default:
			return 'border-gray-300 bg-white text-black';
	}
}
