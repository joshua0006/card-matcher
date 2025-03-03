import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Timer, 
  Shuffle, 
  Lightbulb,
  RotateCcw,
  Settings,
  XCircle,
  Trophy,
  Heart,
  Diamond,
  Club,
  Spade,
  Gauge,
  Dumbbell,
  Award,
  Flame,
  Brain,
  Play
} from 'lucide-react'
// Import the card back image
import cardBackImage from './assets/card-back.png'

// Character types for variety
type CharacterType = 'animal' | 'superhero' | 'robot' | 'mythical'

// Card suit type
type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

// Character interface
interface Character {
  id: number
  name: string
  type: CharacterType
  matched: boolean
  flipped: boolean
  imageUrl: string
  suit: CardSuit
  color: string
}

// Difficulty level interface
interface DifficultyLevel {
  name: string
  pairs: number
  timeLimit: number
}

// Power-up types
type PowerUpType = 'shuffle' | 'hint' | 'slowTime'

// Updated card variants for faster flip
const cardVariants = {
  hidden: { rotateY: 0 },
  visible: { rotateY: 180, transition: { duration: 0.2, ease: "easeInOut" } },
}

function App() {
  // Game difficulty levels with added icon properties
  const difficultyLevels: (DifficultyLevel & { icon: React.ReactNode; color: string })[] = [
    { 
      name: 'Normal', 
      pairs: 6, 
      timeLimit: 60, 
      icon: <Gauge className="mb-1" size={28} />,
      color: 'from-green-400 to-emerald-500'
    },
    { 
      name: 'Hard', 
      pairs: 9, 
      timeLimit: 90,
      icon: <Dumbbell className="mb-1" size={28} />,
      color: 'from-blue-400 to-indigo-500'
    },
    { 
      name: 'Expert', 
      pairs: 12, 
      timeLimit: 120,
      icon: <Award className="mb-1" size={28} />,
      color: 'from-purple-400 to-violet-500'
    },
    { 
      name: 'Insane', 
      pairs: 18, 
      timeLimit: 180,
      icon: <Flame className="mb-1" size={28} />,
      color: 'from-red-400 to-rose-500'
    },
  ]

  // State hooks
  const [difficulty, setDifficulty] = useState<DifficultyLevel & { icon: React.ReactNode; color: string }>(difficultyLevels[0])
  const [characters, setCharacters] = useState<Character[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [timeLeft, setTimeLeft] = useState<number>(difficultyLevels[0].timeLimit)
  const [score, setScore] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState<boolean>(false)
  const [gameOver, setGameOver] = useState<boolean>(false)
  const [gameWon, setGameWon] = useState<boolean>(false)
  const [powerUps, setPowerUps] = useState({
    shuffle: 1,
    hint: 2,
    slowTime: 1
  })
  const [hintCard, setHintCard] = useState<number | null>(null)
  const [showSettings, setShowSettings] = useState<boolean>(false)

  // Card suit assignments
  const cardSuits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades']
  
  // Character card data (simplified for this example)
  const characterData: Omit<Character, 'id' | 'matched' | 'flipped' | 'suit' | 'color'>[] = [
    { name: 'Lion', type: 'animal', imageUrl: '🦁' },
    { name: 'Elephant', type: 'animal', imageUrl: '🐘' },
    { name: 'Giraffe', type: 'animal', imageUrl: '🦒' },
    { name: 'Batman', type: 'superhero', imageUrl: '🦇' },
    { name: 'Spider', type: 'superhero', imageUrl: '🕷️' },
    { name: 'Robot', type: 'robot', imageUrl: '🤖' },
    { name: 'Alien', type: 'robot', imageUrl: '👽' },
    { name: 'Dragon', type: 'mythical', imageUrl: '🐉' },
    { name: 'Unicorn', type: 'mythical', imageUrl: '🦄' },
    { name: 'Phoenix', type: 'mythical', imageUrl: '🔥' },
    { name: 'Mermaid', type: 'mythical', imageUrl: '🧜‍♀️' },
    { name: 'Wizard', type: 'mythical', imageUrl: '🧙‍♂️' },
    { name: 'Ghost', type: 'mythical', imageUrl: '👻' },
    { name: 'Vampire', type: 'mythical', imageUrl: '🧛' },
    { name: 'Zombie', type: 'mythical', imageUrl: '🧟' },
    { name: 'Werewolf', type: 'mythical', imageUrl: '🐺' },
    { name: 'Fairy', type: 'mythical', imageUrl: '🧚' },
    { name: 'Ogre', type: 'mythical', imageUrl: '👹' },
  ]

  // Updated card styling function
  const getSuitComponent = (suit: CardSuit, size = 16) => {
    switch (suit) {
      case 'hearts':
        return <Heart size={size} className="text-red-500" />
      case 'diamonds':
        return <Diamond size={size} className="text-red-500" />
      case 'clubs':
        return <Club size={size} className="text-gray-800" />
      case 'spades':
        return <Spade size={size} className="text-gray-800" />
    }
  }

  // Initialize or restart the game
  const initializeGame = useCallback(() => {
    // Create card pairs based on difficulty
    const shuffledCharacters: Character[] = []
    const selectedCharacters = [...characterData]
      .sort(() => Math.random() - 0.5)
      .slice(0, difficulty.pairs)
    
    // Create pairs
    selectedCharacters.forEach((char, index) => {
      // Assign a random suit to each character
      const randomSuit = cardSuits[Math.floor(Math.random() * cardSuits.length)]
      const color = randomSuit === 'hearts' || randomSuit === 'diamonds' ? 'red' : 'black'
      
      // Add two of each character with same suit
      for (let i = 0; i < 2; i++) {
        shuffledCharacters.push({
          ...char,
          id: index * 2 + i,
          matched: false,
          flipped: false,
          suit: randomSuit,
          color
        })
      }
    })
    
    // Shuffle the pairs
    const finalCharacters = shuffledCharacters.sort(() => Math.random() - 0.5)
    
    setCharacters(finalCharacters)
    setFlippedCards([])
    setMatchedPairs(0)
    setTimeLeft(difficulty.timeLimit)
    setScore(0)
    setGameOver(false)
    setGameWon(false)
    setPowerUps({ shuffle: 1, hint: 2, slowTime: 1 })
    setHintCard(null)
  }, [difficulty, cardSuits])

  // Start the game
  const startGame = () => {
    initializeGame()
    setGameStarted(true)
  }

  // Handle card flip
  const handleCardFlip = (id: number) => {
    // Ignore if card is already flipped or matched
    if (
      flippedCards.length === 2 ||
      characters[id].flipped ||
      characters[id].matched ||
      gameOver
    ) return
    
    // Flip the card
    const updatedCharacters = [...characters]
    updatedCharacters[id].flipped = true
    setCharacters(updatedCharacters)
    
    // Add to flipped cards
    setFlippedCards([...flippedCards, id])
  }

  // Check for matches
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      
      // Check if the cards match
      if (characters[first].name === characters[second].name) {
        // Mark as matched
        const updatedCharacters = [...characters]
        updatedCharacters[first].matched = true
        updatedCharacters[second].matched = true
        setCharacters(updatedCharacters)
        
        // Update score and matched pairs
        setScore(prevScore => prevScore + 10)
        setMatchedPairs(prevPairs => prevPairs + 1)
        
        // Add time bonus for correct match
        setTimeLeft(prevTime => prevTime + 5)
        
        // Reset flipped cards
        setFlippedCards([])
      } else {
        // If no match, flip back after delay
        setTimeout(() => {
          const updatedCharacters = [...characters]
          updatedCharacters[first].flipped = false
          updatedCharacters[second].flipped = false
          setCharacters(updatedCharacters)
          setFlippedCards([])
          
          // Slight penalty for wrong match
          setTimeLeft(prevTime => Math.max(1, prevTime - 2))
        }, 1000)
      }
    }
  }, [flippedCards, characters])

  // Check win condition
  useEffect(() => {
    if (gameStarted && matchedPairs === difficulty.pairs) {
      setGameWon(true)
      setGameOver(true)
    }
  }, [matchedPairs, difficulty.pairs, gameStarted])

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver) return
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer)
          setGameOver(true)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [gameStarted, gameOver])

  // Use power-ups
  const usePowerUp = (type: PowerUpType) => {
    if (powerUps[type] <= 0 || gameOver || !gameStarted) return
    
    // Update power-up count
    setPowerUps({
      ...powerUps,
      [type]: powerUps[type] - 1
    })
    
    switch (type) {
      case 'shuffle':
        // Shuffle all cards that aren't matched
        const shuffledCharacters = [...characters]
        const unmatchedIndices = shuffledCharacters
          .map((char, index) => char.matched ? -1 : index)
          .filter(index => index !== -1)
        
        // Fisher-Yates shuffle
        for (let i = unmatchedIndices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const temp = shuffledCharacters[unmatchedIndices[i]]
          shuffledCharacters[unmatchedIndices[i]] = shuffledCharacters[unmatchedIndices[j]]
          shuffledCharacters[unmatchedIndices[j]] = temp
        }
        
        setCharacters(shuffledCharacters)
        break
        
      case 'hint':
        // Find an unmatched pair
        const unmatchedPairs = [];
        const characterMap = new Map();
        
        // Group characters by name to find pairs
        characters.forEach((char, idx) => {
          if (!char.matched) {
            if (!characterMap.has(char.name)) {
              characterMap.set(char.name, [idx]);
            } else {
              characterMap.get(char.name).push(idx);
            }
          }
        });
        
        // Find character names that have unmatched pairs
        for (const [name, indices] of characterMap.entries()) {
          if (indices.length === 2) {
            unmatchedPairs.push(indices);
          }
        }
        
        if (unmatchedPairs.length > 0) {
          // Select a random pair
          const randomPair = unmatchedPairs[Math.floor(Math.random() * unmatchedPairs.length)];
          // Select one card from the pair to hint
          const hintCardIndex = randomPair[Math.floor(Math.random() * 2)];
          
          setHintCard(hintCardIndex);
          
          // Clear hint after 3 seconds
          setTimeout(() => {
            setHintCard(null);
          }, 3000);
        }
        break
        
      case 'slowTime':
        // Add time
        setTimeLeft(prevTime => prevTime + 10)
        break
    }
  }

  // Updated grid layout
  const getGridColumns = () => {
    if (difficulty.pairs <= 6) return 'grid-cols-4'
    if (difficulty.pairs <= 9) return 'grid-cols-6'
    return 'grid-cols-6 sm:grid-cols-8'
  }

  // Enhanced card corner rendering
  const renderCardCorner = (character: Character, topLeft = true) => (
    <div className={`absolute ${topLeft ? 'top-2 left-2' : 'bottom-2 right-2'} z-10`}>
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-bold" style={{ color: character.color }}>
          {character.name[0]}
        </span>
        {getSuitComponent(character.suit, 16)}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 overflow-hidden">
      <motion.div 
        className="max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Memory Match
          </h1>
        </header>

        {/* Settings modal would go here */}

        {!gameStarted ? (
          <motion.div 
            className="bg-slate-800/60 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-slate-700/50 max-w-3xl mx-auto"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center bg-gradient-to-r from-cyan-300 to-blue-300 text-transparent bg-clip-text">
              <Brain className="inline mr-2 mb-1" size={32} />
              Choose Difficulty
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {difficultyLevels.map((level, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDifficulty(level)}
                  className={`p-5 rounded-2xl transition-all duration-300 h-full ${
                    difficulty.name === level.name 
                    ? `bg-gradient-to-br ${level.color} shadow-lg shadow-${level.color.split('-')[1]}-500/20 text-white` 
                    : 'bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    {level.icon}
                    <div className="text-xl font-bold mb-2">{level.name}</div>
                    <div className="flex items-center justify-center gap-1 text-sm">
                      <div className="flex items-center">
                        <div className="rounded-full bg-white/20 w-5 h-5 flex items-center justify-center mr-1">
                          <span className="text-xs">{level.pairs}</span>
                        </div>
                        <span>pairs</span>
                      </div>
                    </div>
                    <div className="mt-1 text-sm flex items-center">
                      <Timer size={16} className="mr-1" />
                      {level.timeLimit}s
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center justify-center"
            >
              <Play size={22} className="mr-2" />
              Start Game
            </motion.button>
          </motion.div>
        ) : (
          <div className="game-container">
            {/* Simplified game header */}
            <motion.div 
              className="flex justify-between items-center mb-4 bg-slate-700/30 backdrop-blur-sm p-3 rounded-xl border border-slate-600/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-2 text-sm">
                <Trophy className="text-amber-400" size={18} />
                <span>{score}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Timer className="text-cyan-400" size={18} />
                <span>{timeLeft}s</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>{matchedPairs}/{difficulty.pairs}</span>
              </div>
            </motion.div>

          

            {/* Card grid with faster animations */}
            <motion.div 
              className={`grid ${getGridColumns()} gap-3 mb-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {characters.map((character, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleCardFlip(index)}
                  className={`relative aspect-[3/4] cursor-pointer perspective-1000 ${
                    hintCard === index ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse-slow' : ''
                  }`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  <motion.div 
                    className="w-full h-full relative preserve-3d"
                    animate={{ rotateY: character.flipped || character.matched ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    {/* Updated card back with image */}
                    <div className={`absolute inset-0 backface-hidden rounded-xl border-2 ${
                      hintCard === index ? 'border-yellow-400 border-4' : 'border-slate-500/50'
                    } flex items-center justify-center overflow-hidden`}>
                      <img 
                        src={cardBackImage} 
                        alt="Card back" 
                        className={`w-full h-full object-cover ${
                          hintCard === index ? 'opacity-90 brightness-110' : ''
                        }`}
                      />
                      {hintCard === index && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lightbulb size={32} className="text-yellow-400 animate-pulse-slow shadow-lg" />
                        </div>
                      )}
                    </div>

                    {/* Minimalist card front */}
                    <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl bg-white ${
                      character.matched ? 'border-2 border-emerald-400' : 'border border-slate-200'
                    }`}>
                      <div className="w-full h-full rounded-lg flex items-center justify-center relative">
                        {renderCardCorner(character, true)}
                        {renderCardCorner(character, false)}
                        
                        <motion.div 
                          className="w-4/5 h-4/5 flex items-center justify-center"
                          animate={{ scale: character.matched ? [1, 1.1, 1] : 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <span className={`leading-none ${
                            difficulty.name === 'Expert' 
                              ? 'text-[4rem] sm:text-[4.5rem] md:text-[5rem]' 
                              : difficulty.name === 'Insane'
                                ? 'text-[3.5rem] sm:text-[4rem] md:text-[4.5rem]'
                                : 'text-[5rem] sm:text-[6rem] md:text-[7rem]'
                          }`}>
                            {character.imageUrl}
                          </span>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            {/* Simplified game over modal */}
            <AnimatePresence>
              {gameOver && (
                <motion.div 
                  className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div 
                    className="bg-slate-800 p-6 rounded-2xl max-w-md w-full border border-slate-700"
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                  >
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">
                        {gameWon ? '🎉' : '⏳'}
                      </div>
                      <h2 className="text-xl font-bold mb-2">
                        {gameWon ? 'Congratulations!' : 'Time Expired!'}
                      </h2>
                      <p className="text-slate-300 text-sm mb-4">
                        {gameWon 
                          ? `You matched all ${difficulty.pairs} pairs!`
                          : `Matched ${matchedPairs} of ${difficulty.pairs} pairs`
                        }
                      </p>
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => initializeGame()}
                          className="px-4 py-2 bg-emerald-500/90 hover:bg-emerald-400 rounded-lg flex items-center gap-1 text-sm"
                        >
                          <RotateCcw size={16} />
                          Play Again
                        </button>
                        <button
                          onClick={() => setGameStarted(false)}
                          className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm"
                        >
                          Main Menu
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default App
