'use client';

import { useState } from 'react';
import { getRandomWord } from '@/lib/wordle';

function Manual() {
	const [guess, setGuess] = useState('');
	const [displayCorrect, setDisplayCorrect] = useState(false);
	const [displayAnswer, setDisplayAnswer] = useState(false);
	const [numberOfGuesses, setNumberOfGuesses] = useState(0);
	// const targetWord = getRandomWord();
	const targetWord = 'SWIFT';

	const onGuessSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		setDisplayCorrect(true);
		setNumberOfGuesses((prev) => {
			const newTally = prev + 1;

			if (newTally === 5) setDisplayAnswer(true);

			return newTally;
		});
	};

	return (
		<div>
			<header>
				<h1>Wordle Manual</h1>
			</header>

			<main className='flex flex-col gap-2 items-center justify-center'>
				<p>This is the Wordle manual.</p>

				<section>
					<form
						onSubmit={onGuessSubmit}
						className='flex flex-col gap-2 items-center justify-center'
					>
						<label htmlFor='guess'>Guess:</label>
						<input
							className='border rounded p-1'
							type='text'
							id='guess'
							name='guess'
							onChange={(e) => setGuess(e.target.value)}
						/>
						<button
							type='submit'
							className='border-2 border-white border-r-4 rounded p-1 ml-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
						>
							Submit
						</button>
					</form>
				</section>

				{displayCorrect && (
					<section>Correct: {guess === targetWord ? 'Yes' : 'No'}</section>
				)}
				{displayAnswer && <section>Answer: {targetWord}</section>}
			</main>
		</div>
	);
}
export default Manual;
