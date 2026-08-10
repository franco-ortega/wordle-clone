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

	const normalizeLetter = (value: string) => {
		const raw = value.trim().slice(-1).toUpperCase();
		if (raw.length !== 1) {
			return '';
		}

		const code = raw.charCodeAt(0);
		return code >= 65 && code <= 90 ? raw : '';
	};

	const handleChange = (index: number, value: string) => {
		const letter = normalizeLetter(value);

		setBoard((prev) => {
			const next = prev.map((r) => [...r]);

			if (value === '') {
				next[activeRow][index] = '';
				return next;
			}

			if (!letter) {
				return prev;
			}

			next[activeRow][index] = letter;
			return next;
		});
	};

	const commitActiveInput = () => {
		if (typeof document === 'undefined') {
			return;
		}

		const active = document.activeElement as HTMLInputElement | null;
		if (!active || active.tagName !== 'INPUT') {
			return;
		}

		const index = Number(active.dataset.guessIndex);
		if (!Number.isNaN(index)) {
			handleChange(index, active.value);
		}
	};

	const getActiveRowFromInputs = () => {
		if (typeof document === 'undefined') {
			return board[activeRow];
		}

		return board[activeRow].map((letter, index) => {
			const input = document.querySelector<HTMLInputElement>(
				`input[data-guess-index="${index}"]`,
			);
			return normalizeLetter(input?.value ?? letter);
		});
	};

	const submitRow = (e?: React.FormEvent) => {
		e?.preventDefault();
		const currentRow = getActiveRowFromInputs();
		setBoard((prev) => {
			const next = prev.map((r) => [...r]);
			next[activeRow] = currentRow;
			return next;
		});

		if (typeof document !== 'undefined') {
			(document.activeElement as HTMLElement | null)?.blur();
		}

		if (currentRow.some((c) => c === '')) {
			setMessage('Enter a full 5-letter word.');
			return;
		}

		const guess = currentRow.join('');
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

				<div
					className='mb-3 rounded-2xl border border-zinc-800 bg-zinc-800/80 p-2.5 text-center text-sm text-zinc-200'
					role='status'
					aria-live='polite'
				>
					{message}
				</div>

				<div
					className='mb-3 grid grid-cols-5 gap-2'
					role='grid'
					aria-label='Wordle board'
				>
					{board.map((row, ri) =>
						row.map((ch, ci) => (
							<div
								key={`${ri}-${ci}`}
								role='gridcell'
								aria-label={
									ri === activeRow
										? `Current row letter ${ci + 1}: ${ch || 'empty'}`
										: `Row ${ri + 1} letter ${ci + 1}: ${ch || 'empty'}`
								}
								className={`flex h-14 items-center justify-center rounded-2xl border text-xl font-bold uppercase ${getTileClass(evaluations[ri]?.[ci])} ${ri === activeRow ? 'border-emerald-400 ring-2 ring-emerald-500/25 bg-zinc-800 shadow-[0_0_0_0_2px_rgba(16,185,129,0.15)]' : ''}`}
							>
								{ch}
							</div>
						)),
					)}
				</div>
				<div
					className='flex flex-col gap-2'
					role='group'
					aria-labelledby='guess-input-label'
				>
					<div id='guess-input-label' className='sr-only'>
						Current guess input row
					</div>
					<div className='grid grid-cols-5 gap-2 rounded-2xl border border-emerald-500/20 bg-zinc-900/90 p-2 shadow-[0_0_0_0_1px_rgba(16,185,129,0.15)]'>
						{board[activeRow].map((val, i) => (
							<input
								key={i}
								type='text'
								aria-label={`Guess letter ${i + 1}`}
								inputMode='text'
								maxLength={1}
								data-guess-index={i}
								value={val}
								onChange={(e) => handleChange(i, e.target.value)}
								onBlur={(e) => handleChange(i, e.target.value)}
								autoCapitalize='characters'
								autoFocus={i === 0}
								autoCorrect='off'
								spellCheck={false}
								autoComplete='off'
								className='min-h-[12] rounded-2xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-center text-base font-semibold uppercase text-white outline-none focus:border-emerald-500'
							/>
						))}
					</div>
					<button
						type='button'
						onClick={submitRow}
						className='min-h-[12] rounded-2xl bg-emerald-600 px-3 py-3 text-sm font-semibold text-white active:bg-emerald-500'
					>
						Submit Guess
					</button>
				</div>
			</div>
		</main>
	);
}
