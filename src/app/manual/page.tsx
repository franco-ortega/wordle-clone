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

			<main>
				<p>This is the Wordle manual.</p>

				<section>
					<form onSubmit={onGuessSubmit}>
						<label htmlFor='guess'>Guess:</label>
						<input
							className='border rounded p-1'
							type='text'
							id='guess'
							name='guess'
							onChange={(e) => setGuess(e.target.value)}
						/>
						<button type='submit'>Submit</button>
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
