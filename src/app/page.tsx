'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
	const inputRef = useRef<HTMLInputElement>(null);

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

	const appendLetter = (letter: string) => {
		if (gameState !== 'playing' || currentGuess.length >= WORD_LENGTH) {
			return;
		}

		inputRef.current?.focus();
		setCurrentGuess((prev) => prev + letter);
	};

	const handleLetterClick = (letter: string) => {
		appendLetter(letter);
	};

	const handleBackspace = () => {
		if (gameState === 'playing') {
			inputRef.current?.focus();
			setCurrentGuess((prev) => prev.slice(0, -1));
		}
	};

	const handleEnter = () => {
		if (gameState !== 'playing') {
			return;
		}

		inputRef.current?.focus();
		submitGuess(currentGuess);
	};

	const handleInputChange = (value: string) => {
		const sanitized = value
			.replace(/[^A-Z]/gi, '')
			.slice(0, WORD_LENGTH)
			.toUpperCase();
		setCurrentGuess(sanitized);
	};

	const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleEnter();
		}

		if (event.key === 'Backspace') {
			event.preventDefault();
			handleBackspace();
		}
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
		<main className='flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden bg-zinc-950 px-2 py-4 text-zinc-100 sm:px-4 sm:py-8'>
			<div className='w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3 shadow-2xl shadow-black/30 sm:p-6'>
				<div className='mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between'>
					<div>
						<p className='text-sm uppercase tracking-[0.35em] text-zinc-400'>
							Wordle Clone
						</p>
						<h1 className='text-2xl font-semibold sm:text-3xl'>
							Guess the word
						</h1>
					</div>
					<button
						onClick={handleRestart}
						className='w-fit rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-200 transition hover:bg-zinc-800'
					>
						Reset
					</button>
				</div>

				<div className='mb-4 rounded-xl bg-zinc-800/60 p-3 text-center text-sm text-zinc-200 sm:mb-5 sm:p-4'>
					{message}
				</div>

				<input
					ref={inputRef}
					type='text'
					value={currentGuess}
					onChange={(event) => handleInputChange(event.target.value)}
					onInput={(event) => handleInputChange(event.currentTarget.value)}
					onKeyDown={handleInputKeyDown}
					inputMode='text'
					autoCapitalize='characters'
					autoCorrect='off'
					spellCheck={false}
					autoComplete='off'
					placeholder='Tap here to type letters'
					className='mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800/70 px-3 py-3 text-base text-white outline-none transition focus:border-emerald-500 sm:mb-5'
				/>

				<div
					className='mb-4 grid grid-cols-5 gap-1.5 sm:mb-6 sm:gap-2'
					onClick={() => inputRef.current?.focus()}
				>
					{board.map((guess, rowIndex) => {
						const rowLetters = Array.from(guess);
						return Array.from({ length: WORD_LENGTH }, (_, colIndex) => {
							const letter = rowLetters[colIndex] ?? '';
							const state = evaluations[rowIndex]?.[colIndex];
							return (
								<div
									key={`${rowIndex}-${colIndex}`}
									className={`flex h-12 items-center justify-center rounded-lg border text-lg font-bold uppercase sm:h-14 sm:text-xl md:h-16 ${getTileClass(state)}`}
								>
									{letter}
								</div>
							);
						});
					})}
				</div>

				<div className='space-y-2'>
					{KEYBOARD_ROWS.map((row) => (
						<div
							key={row}
							className='flex flex-wrap justify-center gap-1.5 sm:gap-2'
						>
							{row.split('').map((letter) => (
								<button
									key={letter}
									type='button'
									onPointerDown={(event) => {
										event.preventDefault();
										handleLetterClick(letter);
									}}
									onClick={(event) => {
										event.preventDefault();
										handleLetterClick(letter);
									}}
									className='touch-manipulation min-h-[44px] rounded-lg bg-zinc-800 px-2 py-2 text-sm font-semibold uppercase text-zinc-100 transition hover:bg-zinc-700 sm:px-3 sm:py-3'
								>
									{letter}
								</button>
							))}
						</div>
					))}

					<div className='flex justify-center gap-2'>
						<button
							type='button'
							onPointerDown={(event) => {
								event.preventDefault();
								handleBackspace();
							}}
							onClick={(event) => {
								event.preventDefault();
								handleBackspace();
							}}
							className='touch-manipulation min-h-[44px] rounded-lg bg-zinc-800 px-3 py-3 text-sm font-semibold text-zinc-100 transition hover:bg-zinc-700 sm:px-4'
						>
							Delete
						</button>
						<button
							type='button'
							onPointerDown={(event) => {
								event.preventDefault();
								handleEnter();
							}}
							onClick={(event) => {
								event.preventDefault();
								handleEnter();
							}}
							className='touch-manipulation min-h-[44px] rounded-lg bg-emerald-600 px-3 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 sm:px-4'
						>
							Enter
						</button>
					</div>
				</div>
			</div>
		</main>
	);
}
