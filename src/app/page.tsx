'use client';

import { useRef, useState } from 'react';
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

function createMatrix<T>(rows: number, cols: number, fill: T): T[][] {
	const result: T[][] = [];
	for (let i = 0; i < rows; i++) {
		const row: T[] = [];
		for (let j = 0; j < cols; j++) {
			row.push(fill);
		}
		result.push(row);
	}
	return result;
}

export default function Home() {
	const [targetWord, setTargetWord] = useState(() => getRandomWord());
	const [board, setBoard] = useState(() =>
		createMatrix(MAX_ATTEMPTS, WORD_LENGTH, ''),
	);
	const [evaluations, setEvaluations] = useState(() =>
		createMatrix<TileState | undefined>(MAX_ATTEMPTS, WORD_LENGTH, undefined),
	);
	const [activeRow, setActiveRow] = useState(0);
	const [guessInput, setGuessInput] = useState('');
	const [message, setMessage] = useState('Enter a full 5-letter word.');
	const inputRef = useRef<HTMLInputElement>(null);

	const normalizeGuess = (value: string) => {
		let letters = '';
		for (let i = 0; i < value.length; i++) {
			const char = value[i];
			const code = char.charCodeAt(0);
			if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
				letters += char;
			}
		}
		return letters.toUpperCase().slice(0, WORD_LENGTH);
	};

	const handleGuessInput = (value: string) => {
		setGuessInput(normalizeGuess(value));
	};

	const submitRow = () => {
		const paddedInput = guessInput.padEnd(WORD_LENGTH, ' ');
		const currentRow: string[] = [];
		for (let i = 0; i < WORD_LENGTH; i++) {
			const char = paddedInput[i];
			currentRow.push(char === ' ' ? '' : char);
		}

		if (currentRow.some((c) => c === '')) {
			setMessage('Enter a full 5-letter word.');
			return;
		}

		const guess = currentRow.join('');
		const evalRow = evaluateGuess(guess, targetWord);

		setBoard((prev) => {
			const next = prev.map((row) => [...row]);
			next[activeRow] = currentRow;
			return next;
		});

		setEvaluations((prev) => {
			const next = prev.map((row) => [...row]);
			next[activeRow] = evalRow;
			return next;
		});

		if (guess === targetWord) {
			setMessage('You solved it!');
			setGuessInput('');
			inputRef.current?.blur();
			return;
		}

		if (activeRow === MAX_ATTEMPTS - 1) {
			setMessage(`The word was ${targetWord}.`);
			setGuessInput('');
			inputRef.current?.blur();
			return;
		}

		setGuessInput('');
		setActiveRow((r) => r + 1);
		setMessage('Try another word.');
	};

	const restart = () => {
		setTargetWord(getRandomWord());
		setBoard(createMatrix(MAX_ATTEMPTS, WORD_LENGTH, ''));
		setEvaluations(
			createMatrix<TileState | undefined>(MAX_ATTEMPTS, WORD_LENGTH, undefined),
		);
		setGuessInput('');
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
				<div className='flex flex-col gap-2'>
					<label htmlFor='guess-input' className='sr-only'>
						Enter your guess
					</label>
					<input
						ref={inputRef}
						id='guess-input'
						type='text'
						value={guessInput}
						onChange={(e) => handleGuessInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								submitRow();
							}
						}}
						autoCapitalize='characters'
						autoCorrect='off'
						spellCheck={false}
						autoComplete='off'
						maxLength={WORD_LENGTH}
						placeholder='Type a 5-letter word'
						className='rounded-2xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-center text-base font-semibold uppercase text-white outline-none focus:border-emerald-500'
					/>
					<button
						type='button'
						onClick={submitRow}
						className='min-h-14 rounded-2xl bg-emerald-600 px-4 py-4 text-base font-semibold text-white transition-colors active:bg-emerald-500 hover:bg-emerald-500 disabled:opacity-50'
					>
						Submit Guess
					</button>
				</div>
			</div>
		</main>
	);
}
