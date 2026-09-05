'use client';

import { useState } from 'react';
import { getRandomWord } from '@/lib/wordle';

function Manual() {
	const [guess, setGuess] = useState('');
	const [guess2, setGuess2] = useState('');
	const [letterOne, setLetterOne] = useState('');
	const [letterTwo, setLetterTwo] = useState('');
	const [letterThree, setLetterThree] = useState('');
	const [letterFour, setLetterFour] = useState('');
	const [letterFive, setLetterFive] = useState('');
	const [displayCorrect, setDisplayCorrect] = useState(false);
	const [displayAnswer, setDisplayAnswer] = useState(false);
	const [numberOfGuesses, setNumberOfGuesses] = useState(0);
	// const targetWord = getRandomWord();
	const targetWord = 'SWIFT';

	// const onGuessSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
	// 	e.preventDefault();

	// 	setDisplayCorrect(true);
	// 	setNumberOfGuesses((prev) => {
	// 		const newTally = prev + 1;

	// 		if (newTally === 5) setDisplayAnswer(true);

	// 		return newTally;
	// 	});
	// };

	const onGuessSubmit2 = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		const guess = (
			letterOne +
			letterTwo +
			letterThree +
			letterFour +
			letterFive
		).toUpperCase();

		setGuess2(guess);

		setDisplayCorrect(true);
		setNumberOfGuesses((prev) => {
			const newTally = prev + 1;

			if (newTally === 5 || guess2 === targetWord) setDisplayAnswer(true);

			return newTally;
		});

		setLetterOne('');
		setLetterTwo('');
		setLetterThree('');
		setLetterFour('');
		setLetterFive('');
	};

	return (
		<div>
			<header>
				<h1>Wordle Manual</h1>
			</header>

			<main className='flex flex-col gap-2 items-center justify-center'>
				<p>This is the Wordle manual.</p>

				<hr />

				<section>
					{/* <form
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
					</form> */}

					<form
						onSubmit={onGuessSubmit2}
						className='flex flex-col gap-2 items-center justify-center p-5'
					>
						<div className='flex flex-row gap-2 items-center justify-center p-5'>
							<label htmlFor='letter-one'>
								<input
									className='border rounded p-1 w-10'
									type='text'
									id='letter-one'
									name='letter-one'
									value={letterOne}
									onChange={(e) => setLetterOne(e.target.value)}
								/>
							</label>
							<label htmlFor='letter-two'>
								<input
									className='border rounded p-1 w-10'
									type='text'
									id='letter-two'
									name='letter-two'
									value={letterTwo}
									onChange={(e) => setLetterTwo(e.target.value)}
								/>
							</label>
							<label htmlFor='letter-three'>
								<input
									className='border rounded p-1 w-10'
									type='text'
									id='letter-three'
									name='letter-three'
									value={letterThree}
									onChange={(e) => setLetterThree(e.target.value)}
								/>
							</label>
							<label htmlFor='letter-four'>
								<input
									className='border rounded p-1 w-10'
									type='text'
									id='letter-four'
									name='letter-four'
									value={letterFour}
									onChange={(e) => setLetterFour(e.target.value)}
								/>
							</label>
							<label htmlFor='letter-five'>
								<input
									className='border rounded p-1 w-10'
									type='text'
									id='letter-five'
									name='letter-five'
									value={letterFive}
									onChange={(e) => setLetterFive(e.target.value)}
								/>
							</label>
						</div>

						<button
							type='submit'
							className='border-2 border-white border-r-4 rounded p-1 ml-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
						>
							Submit
						</button>
					</form>

					<div className='flex flex-row gap-2 items-center justify-center p-5'>
						<span className='border rounded inline-block p-1 w-10 h-10 text-center'>
							{letterOne.toUpperCase()}
						</span>{' '}
						<span className='border rounded inline-block p-1 w-10 h-10 text-center'>
							{letterTwo.toUpperCase()}
						</span>{' '}
						<span className='border rounded inline-block p-1 w-10 h-10 text-center'>
							{letterThree.toUpperCase()}
						</span>{' '}
						<span className='border rounded inline-block p-1 w-10 h-10 text-center'>
							{letterFour.toUpperCase()}
						</span>{' '}
						<span className='border rounded inline-block p-1 w-10 h-10 text-center'>
							{letterFive.toUpperCase()}
						</span>
					</div>
				</section>

				{displayCorrect && (
					<section>Correct: {guess2 === targetWord ? 'Yes' : 'No'}</section>
				)}
				{displayAnswer && <section>Answer: {targetWord}</section>}
			</main>
		</div>
	);
}
export default Manual;
