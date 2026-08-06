'use client';

import { useState } from 'react';
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
	const [board, setBoard] = useState<string[][]>(() =>
		Array.from({ length: MAX_ATTEMPTS }, () => Array(WORD_LENGTH).fill('')),
	);
	const [evaluations, setEvaluations] = useState<(TileState | undefined)[][]>(
		() =>
			Array.from({ length: MAX_ATTEMPTS }, () =>
				Array(WORD_LENGTH).fill(undefined),
			),
	);
	const [activeRow, setActiveRow] = useState(0);
	const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>(
		'playing',
	);
	const [message, setMessage] = useState('Guess the hidden 5-letter word.');

	const handleLetterChange = (index: number, value: string) => {
		const sanitized = value
			.replace(/[^A-Z]/gi, '')
			.slice(0, 1)
			.toUpperCase();
		setBoard((prev) => {
			const next = prev.map((row) => [...row]);
			next[activeRow][index] = sanitized;
			return next;
		});
	};

	const currentGuess = board[activeRow].join('');

	const handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
		event?.preventDefault();
		if (gameState !== 'playing') {
			return;
		}

		if (board[activeRow].some((letter) => letter === '')) {
			setMessage('Enter a full 5-letter word.');
			return;
		}

		const guess = currentGuess;
		const evaluation = evaluateGuess(guess, targetWord);

		setEvaluations((prev) => {
			const next = prev.map((row) => [...row]);
			next[activeRow] = evaluation;
			return next;
		});

		if (guess === targetWord) {
			setGameState('won');
			setMessage('You solved it!');
			return;
		}

		if (activeRow === MAX_ATTEMPTS - 1) {
			setGameState('lost');
			setMessage(`The word was ${targetWord}.`);
			return;
		}

		setActiveRow((prev) => prev + 1);
		setMessage('Try another word.');
	};

	const handleRestart = () => {
		setTargetWord(getRandomWord());
		setBoard(
			Array.from({ length: MAX_ATTEMPTS }, () => Array(WORD_LENGTH).fill('')),
		);
		setEvaluations(
			Array.from({ length: MAX_ATTEMPTS }, () =>
				Array(WORD_LENGTH).fill(undefined),
			),
		);
		setActiveRow(0);
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
					{board.map((row, rowIndex) =>
						row.map((letter, colIndex) => {
							const state = evaluations[rowIndex]?.[colIndex];
							return (
								<div
									key={`${rowIndex}-${colIndex}`}
									className={`flex h-14 items-center justify-center rounded-2xl border text-xl font-bold uppercase ${getTileClass(state)}`}
								>
									{letter}
								</div>
							);
						}),
					)}
				</div>

				<div className='mb-3 rounded-2xl border border-zinc-800 bg-zinc-800/70 px-3 py-2 text-center text-sm text-zinc-300'>
					Enter one letter in each box, then submit.
				</div>

				<form onSubmit={handleSubmit} className='flex flex-col gap-2'>
					<div className='grid grid-cols-5 gap-2'>
						{board[activeRow].map((letter, index) => (
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
