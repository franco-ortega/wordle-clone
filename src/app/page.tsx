'use client';

import { useState } from 'react';
import { evaluateGuess, getRandomWord } from '@/lib/wordle';
import type { TileState } from '@/lib/wordle';

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
	const [board, setBoard] = useState(() =>
		Array.from({ length: MAX_ATTEMPTS }, () => Array(WORD_LENGTH).fill('')),
	);
	const [evaluations, setEvaluations] = useState(() =>
		Array.from({ length: MAX_ATTEMPTS }, () =>
			Array(WORD_LENGTH).fill(undefined as TileState | undefined),
		),
	);
	const [activeRow, setActiveRow] = useState(0);
	const [message, setMessage] = useState('Enter a full 5-letter word.');

	const handleChange = (index: number, value: string) => {
		const letter = value
			.replace(/[^A-Za-z]/g, '')
			.slice(0, 1)
			.toUpperCase();
		setBoard((prev) => {
			const next = prev.map((r) => [...r]);
			next[activeRow][index] = letter;
			return next;
		});
	};

	const submitRow = (e?: React.FormEvent) => {
		e?.preventDefault();
		const row = board[activeRow];
		if (row.some((c) => c === '')) {
			setMessage('Enter a full 5-letter word.');
			return;
		}

		const guess = row.join('');
		const evalRow = evaluateGuess(guess, targetWord);

		setEvaluations((prev) => {
			const next = prev.map((r) => [...r]);
			next[activeRow] = evalRow;
			return next;
		});

		if (guess === targetWord) {
			setMessage('You solved it!');
			return;
		}

		if (activeRow === MAX_ATTEMPTS - 1) {
			setMessage(`The word was ${targetWord}.`);
			return;
		}

		setActiveRow((r) => r + 1);
		setMessage('Try another word.');
	};

	const restart = () => {
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
		setMessage('Enter a full 5-letter word.');
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
						onClick={restart}
						className='rounded-full border border-zinc-700 px-3 py-1 text-sm text-zinc-200'
					>
						Reset
					</button>
				</div>

				<div className='mb-3 rounded-2xl border border-zinc-800 bg-zinc-800/80 p-2.5 text-center text-sm text-zinc-200'>
					{message}
				</div>

				<div className='mb-3 grid grid-cols-5 gap-2'>
					{board.map((row, ri) =>
						row.map((ch, ci) => (
							<div
								key={`${ri}-${ci}`}
								className={`flex h-14 items-center justify-center rounded-2xl border text-xl font-bold uppercase ${getTileClass(evaluations[ri]?.[ci])}`}
							>
								{ch}
							</div>
						)),
					)}
				</div>

				<form onSubmit={submitRow} className='flex flex-col gap-2'>
					<div className='grid grid-cols-5 gap-2'>
						{board[activeRow].map((val, i) => (
							<input
								key={i}
								type='text'
								inputMode='text'
								maxLength={1}
								value={val}
								onChange={(e) => handleChange(i, e.target.value)}
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
