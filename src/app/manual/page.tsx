'use client';

import { useState } from 'react';
import { getRandomWord } from '@/lib/wordle';

function Manual() {
	const [guess, setGuess] = useState('');
	const targetWord = getRandomWord();

	return (
		<div>
			<header>
				<h1>Wordle Manual</h1>
			</header>

			<main>
				<p>This is the Wordle manual.</p>

				<section>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							if (guess === targetWord) {
								alert('You guessed the word!');
							}
						}}
					>
						<label htmlFor='guess'>Guess:</label>
						<input
							type='text'
							id='guess'
							name='guess'
							onChange={(e) => setGuess(e.target.value)}
						/>
						<button type='submit'>Submit</button>
					</form>
				</section>

				<section>Answer: {guess}</section>
			</main>
		</div>
	);
}
export default Manual;
