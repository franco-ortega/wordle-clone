'use client';

import { useState } from 'react';
import { getRandomWord } from '@/lib/wordle';

function Manual() {
	const [guess, setGuess] = useState('');
	const [displayCorrect, setDisplayCorrect] = useState(false);
	// const targetWord = getRandomWord();
	const targetWord = 'SWIFT';

	const onGuessSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		setDisplayCorrect(true);
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
				<section>Answer: {guess}</section>
			</main>
		</div>
	);
}
export default Manual;
