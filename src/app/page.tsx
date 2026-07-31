'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { evaluateGuess, getRandomWord, type TileState } from '@/lib/wordle';

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

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
	const [letters, setLetters] = useState<string[]>(Array(WORD_LENGTH).fill(''));
	const [attempt, setAttempt] = useState(0);
	const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
		'playing',
	);
	const [message, setMessage] = useState('Guess the hidden 5-letter word.');

	const currentGuess = letters.join('').toUpperCase();

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
			const normalizedGuess = guess.toUpperCase();

			if (normalizedGuess.length < WORD_LENGTH) {
				setMessage('Enter a full 5-letter word.');
				return;
			}

			setGuesses((prevGuesses) => {
				const nextGuesses = [...prevGuesses];
				nextGuesses[attempt] = normalizedGuess;
				return nextGuesses;
			});

			if (normalizedGuess === targetWord) {
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
			setLetters(Array(WORD_LENGTH).fill(''));
			setMessage('Try another word.');
		},
		[attempt, targetWord],
	);

	const handleLetterChange = (index: number, value: string) => {
		const sanitized = value
			.replace(/[^A-Z]/gi, '')
			.slice(0, 1)
			.toUpperCase();
		setLetters((prev) => {
			const next = [...prev];
			next[index] = sanitized;
			return next;
		});
	};

	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			const key = event.key.toUpperCase();

			if (gameState !== 'playing') {
				return;
			}

			if (/^[A-Z]$/.test(key)) {
				event.preventDefault();
				setLetters((prev) => {
					const next = [...prev];
					const firstEmpty = next.findIndex((letter) => letter === '');
					if (firstEmpty >= 0) {
						next[firstEmpty] = key;
					}
					return next;
				});
				return;
			}

			if (key === 'BACKSPACE') {
				event.preventDefault();
				setLetters((prev) => {
					const next = [...prev];
					for (let index = next.length - 1; index >= 0; index -= 1) {
						if (next[index] !== '') {
							next[index] = '';
							break;
						}
					}
					return next;
				});
				return;
			}

			if (key === 'ENTER') {
				event.preventDefault();
				handleSubmit();
			}
		},
		[gameState],
	);

	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [handleKeyDown]);

	const handleSubmit = () => {
		if (gameState !== 'playing') {
			return;
		}

		submitGuess(currentGuess);
	};

	const handleRestart = () => {
		setTargetWord(getRandomWord());
		setGuesses(Array(MAX_ATTEMPTS).fill(''));
		setLetters(Array(WORD_LENGTH).fill(''));
		setAttempt(0);
		setGameState('playing');
		setMessage('Guess the hidden 5-letter word.');
	};

	return (
		<main className='flex min-h-screen w-full items-center justify-center bg-zinc-950 px-3 py-3 text-zinc-100'>
			<div className='w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900/95 p-3 shadow-2xl shadow-black/40'>
				<div className='mb-3 flex items-center justify-between'>
					<div>
						<p className='text-[11px] uppercase tracking-[0.35em] text-zinc-400'>
							Wordle Clone
						</p>
						<h1 className='text-xl font-semibold'>Guess the word</h1>
					</div>
					<button
						type='button'
						onClick={handleRestart}
						className='rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-200'
					>
						Reset
					</button>
				</div>

				<div className='mb-3 rounded-2xl border border-zinc-800 bg-zinc-800/80 p-2.5 text-center text-sm text-zinc-200'>
					{message}
				</div>

				<div className='mb-3 grid grid-cols-5 gap-2'>
					{board.map((guess, rowIndex) => {
						const rowLetters = Array.from(guess);
						return Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
							const letter = rowLetters[colIndex] ?? '';
							const state = evaluations[rowIndex]?.[colIndex];
							return (
								<div
									key={`${rowIndex}-${colIndex}`}
									className={`flex h-14 items-center justify-center rounded-2xl border text-xl font-bold uppercase ${getTileClass(state)}`}
								>
									{letter}
								</div>
							);
						});
					})}
				</div>

				<div className='mb-3 rounded-2xl border border-zinc-800 bg-zinc-800/70 px-3 py-2 text-center text-sm text-zinc-300'>
					Enter one letter in each box, then submit.
				</div>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						handleSubmit();
					}}
					className='flex flex-col gap-2'
				>
					<div className='grid grid-cols-5 gap-2'>
						{letters.map((letter, index) => (
							<input
								key={index}
								type='text'
								inputMode='text'
								maxLength={1}
								value={letter}
								onChange={(event) =>
									handleLetterChange(index, event.target.value)
								}
								autoCapitalize='characters'
								autoCorrect='off'
								spellCheck={false}
								autoComplete='off'
								className='min-h-[48px] rounded-2xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-center text-base font-semibold uppercase text-white outline-none focus:border-emerald-500'
							/>
						))}
					</div>
					<button
						type='submit'
						className='min-h-[48px] rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white active:bg-emerald-500'
					>
						Submit Guess
					</button>
				</form>
			</div>
		</main>
	);
}
