'use client';

import { useRef, useState } from 'react';
// import { getRandomWord } from '@/lib/wordle';

function Manual() {
	const [guess, setGuess] = useState('');
	const [displayCorrect, setDisplayCorrect] = useState(false);
	const [displayAnswer, setDisplayAnswer] = useState(false);
	const [numberOfGuesses, setNumberOfGuesses] = useState(0);
	// const targetWord = getRandomWord();
	const targetWord = 'SWIFT';

	// testing AREA

	const [letters, setLetters] = useState(['', '', '', '', '']);

	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	const handleLetterChange = (index: number, value: string) => {
		// Keep only the last character entered
		const letter = value.slice(-1);

		// Check that the character is a letter
		const isLetter =
			letter.length === 1 && letter.toUpperCase() !== letter.toLowerCase();

		if (!isLetter) {
			return;
		}

		const updatedLetters = [...letters];
		updatedLetters[index] = letter.toUpperCase();
		setLetters(updatedLetters);

		// Move focus to the next input
		if (index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		event: React.KeyboardEvent<HTMLInputElement>,
	) => {
		// Move to the previous input when Backspace is pressed on an empty input
		if (event.key === 'Backspace' && !letters[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const onGuessSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Prevent submitting an incomplete word
		if (letters.some((letter) => !letter)) {
			return;
		}

		const submittedGuess = letters.join('');
		setGuess(submittedGuess);
		setDisplayCorrect(true);

		setNumberOfGuesses((previousGuesses) => {
			const newTally = previousGuesses + 1;

			if (newTally === 5 || submittedGuess === targetWord) {
				setDisplayAnswer(true);
			}

			return newTally;
		});

		setLetters(['', '', '', '', '']);

		// Return focus to the first input
		inputRefs.current[0]?.focus();
	};

	// testing AREA

	return (
		<div>
			<header>
				<h1>Wordle Manual</h1>
			</header>

			<main className='flex flex-col gap-2 items-center justify-center'>
				<p>This is the Wordle manual.</p>

				<hr />

				<section>
					<form
						onSubmit={onGuessSubmit}
						className='flex flex-col gap-2 items-center justify-center p-5'
					>
						<div className='flex flex-row gap-2 items-center justify-center p-5'>
							{letters.map((letter, index) => (
								<label key={index} htmlFor={`letter-${index}`}>
									<input
										ref={(element) => {
											inputRefs.current[index] = element;
										}}
										className='border rounded p-1 w-10 text-center uppercase'
										type='text'
										id={`letter-${index}`}
										name={`letter-${index}`}
										value={letter}
										maxLength={1}
										autoComplete='off'
										inputMode='text'
										onChange={(e) => handleLetterChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
									/>
								</label>
							))}
						</div>

						<button
							type='submit'
							className='border-2 border-white border-r-4 rounded p-1 ml-2 bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
						>
							Submit
						</button>
					</form>

					<div className='flex flex-row gap-2 items-center justify-center p-5'>
						{letters.map((letter, index) => (
							<span
								key={index}
								className='border rounded inline-block p-1 w-10 h-10 text-center'
							>
								{letter}
							</span>
						))}
					</div>
				</section>

				{displayCorrect && (
					<section>Correct: {guess === targetWord ? 'Yes' : 'No'}</section>
				)}
				{displayAnswer && <section>Answer: {targetWord}</section>}
				<div>Number of Guesses: {numberOfGuesses} / 5</div>
			</main>
		</div>
	);
}
export default Manual;
