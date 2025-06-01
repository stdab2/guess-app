import './App.css'
import { useState } from "react"
import { clsx } from "clsx"
import { languages } from "./utils/languages"
import type Languages from "./utils/languageInterface"
import { getFarewellText, getRandomWord } from "./utils/utils"
import Confetti from "react-confetti"
import getHint from "./api/anthropic"


export default function AssemblyEndgame() {
    const [currentWord, setCurrentWord] = useState<string>(() => getRandomWord())
    const [guessedLetters, setGuessedLetters] = useState<Array<string>>([])
    const [hint, setHint] = useState<Array<string>>([])

    const numGuessesLeft = languages.length - 1
    const wrongGuessCount = guessedLetters.filter(letter => !currentWord.includes(letter)).length
    const isGameWon: boolean = currentWord.split("").every(letter => guessedLetters.includes(letter))
    const isGameLost: boolean = wrongGuessCount >= numGuessesLeft
    const isGameOver: boolean = isGameWon || isGameLost
    const lastGuessedLetter = guessedLetters[guessedLetters.length - 1]
    const isLastGuessIncorrect = lastGuessedLetter && !currentWord.includes(lastGuessedLetter)

    const alphabet = "abcdefghijklmnopqrstuvwxyz"

    function addGuessedLetter(letter: string) {
        setGuessedLetters(prevLetters =>
            prevLetters.includes(letter) ?
                prevLetters :
                [...prevLetters, letter]
        )
    }

    function startNewGame() {
        setCurrentWord(getRandomWord())
        setGuessedLetters([])
        setHint([])
    }

    const languageElements = languages.map((lang: Languages, index) => {
        const isLanguageLost = index < wrongGuessCount
        const styles = {
            backgroundColor: lang.backgroundColor,
            color: lang.color
        }
        const className = clsx("chip", isLanguageLost && "lost")
        return (
            <span
                className={className}
                style={styles}
                key={lang.name}
            >
                {lang.name}
            </span>
        )
    })

    const letterElements = currentWord.split("").map((letter, index) => {
        const shouldRevealLetter = isGameLost || guessedLetters.includes(letter)
        const letterClassName = clsx(
            isGameLost && !guessedLetters.includes(letter) && "missed-letter"
        )
        return (
            <span key={index} className={letterClassName}>
                {shouldRevealLetter ? letter.toUpperCase() : ""}
            </span>
        )
    })

    const keyboardElements = alphabet.split("").map(letter => {
        const isGuessed = guessedLetters.includes(letter)
        const isCorrect = isGuessed && currentWord.includes(letter)
        const isWrong = isGuessed && !currentWord.includes(letter)
        const className = clsx({
            correct: isCorrect,
            wrong: isWrong
        })

        return (
            <button
                className={className}
                key={letter}
                disabled={isGameOver}
                aria-disabled={guessedLetters.includes(letter)}
                aria-label={`Letter ${letter}`}
                onClick={() => addGuessedLetter(letter)}
            >
                {letter.toUpperCase()}
            </button>
        )
    })

    const gameStatusClass = clsx("game-status", {
        won: isGameWon,
        lost: isGameLost,
        farewell: !isGameOver && isLastGuessIncorrect
    })

    function renderGameStatus() {
        if (!isGameOver && isLastGuessIncorrect) {
            return (
                <p className="farewell-message">
                    {getFarewellText(languages[wrongGuessCount - 1].name)}
                </p>
            )
        }

        if (isGameWon) {
            return (
                <>
                    <h2>You win!</h2>
                    <p>Well done! 🎉</p>
                </>
            )
        }
        if (isGameLost) {
            return (
                <>
                    <h2>Game over!</h2>
                    <p>You lose! Better start learning Assembly 😭</p>
                </>
            )
        }

        return null
    }

    async function newHint() {
      const result: string | null = await getHint(currentWord, guessedLetters.join(", "), hint.join("| "))
      if (typeof result === "string") {
        setHint(prev => {
          return [...prev, result]})
      }
    }

    return (
        <main>
            {
                isGameWon && 
                    <Confetti
                        recycle={false}
                        numberOfPieces={1000}
                    />
            }
            <header>
                <h1>Assembly: Endgame</h1>
                <p>Guess the word within 8 attempts to keep the
                programming world safe from Assembly!</p>
            </header>

            <section
                aria-live="polite"
                role="status"
                className={gameStatusClass}
            >
                {renderGameStatus()}
            </section>

            <section className="language-chips">
                {languageElements}
            </section>

            <section className="word">
                {letterElements}
            </section>

            <section
                className="sr-only"
                aria-live="polite"
                role="status"
            >
                <p>
                    {currentWord.includes(lastGuessedLetter) ?
                        `Correct! The letter ${lastGuessedLetter} is in the word.` :
                        `Sorry, the letter ${lastGuessedLetter} is not in the word.`
                    }
                    You have {numGuessesLeft} attempts left.
                </p>
                <p>Current word: {currentWord.split("").map(letter =>
                    guessedLetters.includes(letter) ? letter + "." : "blank.")
                    .join(" ")}</p>

            </section>

            <section className="keyboard">
                {keyboardElements}
            </section>

            {isGameOver &&
                <button
                    className="new-game"
                    onClick={startNewGame}
                >New Game</button>}

            {(!isGameOver && guessedLetters.length > 3) &&
              <>
                <button
                    className="new-hint"
                    onClick={newHint}
                >Get a hint 🤔</button>

                <h2>{hint[hint.length - 1]}</h2>
              </>
            }

        </main>
    )
}
