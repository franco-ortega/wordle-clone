'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { evaluateGuess, getRandomWord, type TileState } from '@/lib/wordle';

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const KEYBOARD_ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function getTileClass(state: TileState | undefined) {
	switch (state) {
		case 'correct':
			return 'bg-emerald-500 text-white';
		case 'present':
			return 'bg-amber-500 text-white';
		case 'absent':
			return 'bg-zinc-700 text-white';
		default:
			return 'bg-zinc-100 text-zinc-900';
	}
}

export default function Home() {
	const [targetWord, setTargetWord] = useState(() => getRandomWord());
	const [guesses, setGuesses] = useState<string[]>(
		Array(MAX_ATTEMPTS).fill(''),
	);
	const [currentGuess, setCurrentGuess] = useState('');
	const [attempt, setAttempt] = useState(0);
	const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
		'playing',
	);
	const [message, setMessage] = useState('Guess the hidden 5-letter word.');

	const board = useMemo(() => {
		return guesses.map((guess, index) => {
			if (index === attempt) {
				return currentGuess.padEnd(WORD_LENGTH, '');
			}
			return guess;
		});
	}, [attempt, currentGuess, guesses]);

	const evaluations = useMemo(() => {
		return guesses.map((guess, index) => {
			if (index < attempt && guess) {
				return evaluateGuess(guess, targetWord);
			}
			return Array(WORD_LENGTH).fill(undefined) as (TileState | undefined)[];
		});
	}, [attempt, guesses, targetWord]);

	const submitGuess = useCallback(
		(guess: string) => {
			if (guess.length < WORD_LENGTH) {
				setMessage('Enter a full 5-letter word.');
				return;
			}

			const nextGuesses = [...guesses];
			nextGuesses[attempt] = guess;
			setGuesses(nextGuesses);

			if (guess === targetWord) {
				setGameState('won');
				setMessage('You solved it!');
				return;
			}

			if (attempt === MAX_ATTEMPTS - 1) {
				setGameState('lost');
				setMessage(`The word was ${targetWord}.`);
				return;
			}

			setAttempt((prev) => prev + 1);
			setCurrentGuess('');
			setMessage('Try another word.');
		},
		[attempt, guesses, targetWord],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const key = event.key.toUpperCase();

			if (gameState !== 'playing') {
				return;
			}

			if (/^[A-Z]$/.test(key) && currentGuess.length < WORD_LENGTH) {
				event.preventDefault();
				setCurrentGuess((prev) => prev + key);
				return;
			}

			if (key === 'BACKSPACE') {
				event.preventDefault();
				setCurrentGuess((prev) => prev.slice(0, -1));
				return;
			}

			if (key === 'ENTER') {
				event.preventDefault();
				submitGuess(currentGuess);
			}
		},
		[currentGuess, gameState, submitGuess],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const handleLetterClick = (letter: string) => {
		if (gameState !== 'playing' || currentGuess.length >= WORD_LENGTH) {
			return;
		}

		setCurrentGuess((prev) => prev + letter);
	};

	const handleBackspace = () => {
		if (gameState === 'playing') {
			setCurrentGuess((prev) => prev.slice(0, -1));
		}
	};

	const handleEnter = () => {
		if (gameState !== 'playing') {
			return;
		}

		submitGuess(currentGuess);
	};

	const handleRestart = () => {
		setTargetWord(getRandomWord());
		setGuesses(Array(MAX_ATTEMPTS).fill(''));
		setCurrentGuess('');
		setAttempt(0);
		setGameState('playing');
		setMessage('Guess the hidden 5-letter word.');
	};

	return (
		<main className='flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-8 text-zinc-100'>
			<div className='w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl shadow-black/30'>
				<div className='mb-6 flex items-center justify-between'>
					<div>
						<p className='text-sm uppercase tracking-[0.35em] text-zinc-400'>
							Wordle Clone
						</p>
						<h1 className='text-3xl font-semibold'>Guess the word</h1>
					</div>
					<button
						onClick={handleRestart}
						className='rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-200 transition hover:bg-zinc-800'
					>
						Reset
					</button>
				</div>

				<div className='mb-5 rounded-xl bg-zinc-800/60 p-4 text-center text-sm text-zinc-200'>
					{message}
				</div>

				<div className='mb-6 grid grid-cols-5 gap-2'>
					{board.map((guess, rowIndex) => {
						const rowLetters = Array.from(guess);
						return Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
							const letter = rowLetters[colIndex] ?? '';
							const state = evaluations[rowIndex]?.[colIndex];
							return (
								<div
									key={`${rowIndex}-${colIndex}`}
									className={`flex h-14 items-center justify-center rounded-lg border text-xl font-bold uppercase ${getTileClass(state)}`}
								>
									{letter}
								</div>
							);
						});
					})}
				</div>

				<div className='space-y-2'>
					{KEYBOARD_ROWS.map((row) => (
						<div key={row} className='flex justify-center gap-2'>
							{row.split('').map((letter) => (
								<button
									key={letter}
									onClick={() => handleLetterClick(letter)}
									className='rounded-lg bg-zinc-800 px-3 py-3 text-sm font-semibold uppercase text-zinc-100 transition hover:bg-zinc-700'
								>
									{letter}
								</button>
							))}
						</div>
					))}

					<div className='flex justify-center gap-2'>
						<button
							onClick={handleBackspace}
							className='rounded-lg bg-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700'
						>
							Delete
						</button>
						<button
							onClick={handleEnter}
							className='rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500'
						>
							Enter
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
