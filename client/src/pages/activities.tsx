import { useState } from 'react';
import MobileLayout from '@/components/mobile-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gamepad2, 
  Trophy, 
  Brain, 
  TrendingUp, 
  PiggyBank,
  Target,
  Award,
  Star,
  Zap
} from 'lucide-react';

export default function Activities() {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const games = [
    {
      id: 'financial-quiz',
      title: 'Money Master Quiz',
      description: 'Test your financial knowledge with fun questions',
      icon: Brain,
      color: 'bg-blue-500',
      difficulty: 'Easy',
      points: 100,
    },
    {
      id: 'investment-challenge',
      title: 'Investment Challenge',
      description: 'Make smart investment decisions and grow your virtual portfolio',
      icon: TrendingUp,
      color: 'bg-green-500',
      difficulty: 'Medium',
      points: 250,
    },
    {
      id: 'savings-sprint',
      title: 'Savings Sprint',
      description: 'Learn to save money with real-world scenarios',
      icon: PiggyBank,
      color: 'bg-purple-500',
      difficulty: 'Easy',
      points: 150,
    },
    {
      id: 'goal-getter',
      title: 'Goal Getter',
      description: 'Set and achieve financial goals',
      icon: Target,
      color: 'bg-orange-500',
      difficulty: 'Hard',
      points: 300,
    },
  ];

  const quizQuestions = [
    {
      question: "What does investing mean?",
      options: [
        "Spending all your money",
        "Putting money to work to grow over time",
        "Hiding money under your pillow",
        "Giving money away"
      ],
      correctAnswer: 1,
      explanation: "Investing means putting your money to work so it can grow over time!"
    },
    {
      question: "What is a stock?",
      options: [
        "A type of candy",
        "A piece of ownership in a company",
        "A savings account",
        "A type of loan"
      ],
      correctAnswer: 1,
      explanation: "A stock is a small piece of ownership in a company. When you own stock, you own a tiny part of that business!"
    },
    {
      question: "Why is it important to save money?",
      options: [
        "To have money for future needs and goals",
        "Because it's boring",
        "To make your piggy bank heavy",
        "Only adults need to save"
      ],
      correctAnswer: 0,
      explanation: "Saving helps you prepare for the future and achieve your goals!"
    },
    {
      question: "What does 'diversification' mean?",
      options: [
        "Buying only one type of investment",
        "Spreading your money across different investments",
        "Spending all your money at once",
        "Keeping all money in cash"
      ],
      correctAnswer: 1,
      explanation: "Diversification means spreading your investments so you don't have all your eggs in one basket!"
    },
    {
      question: "How can money grow over time?",
      options: [
        "It doesn't grow",
        "Through compound interest and investments",
        "By hiding it in your room",
        "Money trees"
      ],
      correctAnswer: 1,
      explanation: "Money grows through compound interest - earning money on your earnings - and good investments!"
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah J.', points: 2450, badge: '🏆' },
    { rank: 2, name: 'Alex M.', points: 2100, badge: '🥈' },
    { rank: 3, name: 'Emma W.', points: 1850, badge: '🥉' },
    { rank: 4, name: 'You', points: 1200, badge: '⭐' },
    { rank: 5, name: 'Lucas P.', points: 950, badge: '' },
  ];

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Prevent multiple clicks
    
    setSelectedAnswer(answerIndex);
    setShowExplanation(true);
    
    const correct = quizQuestions[currentQuestion].correctAnswer === answerIndex;
    
    if (correct) {
      setQuizScore(quizScore + 20);
    }

    // Move to next question after showing explanation
    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        // Reset answer state BEFORE moving to next question
        setSelectedAnswer(null);
        setShowExplanation(false);
        // Use a small delay to ensure state is cleared before question changes
        setTimeout(() => {
          setCurrentQuestion(currentQuestion + 1);
        }, 50);
      } else {
        // Quiz completed
        setSelectedAnswer(null);
        setShowExplanation(false);
        setCurrentQuestion(0);
        setQuizScore(0);
        setSelectedGame(null);
      }
    }, 2500);
  };

  const renderGameList = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Learning Activities</h1>
          <p className="text-muted-foreground text-sm">Build your financial knowledge</p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <Card 
            key={game.id}
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
            onClick={() => game.id === 'financial-quiz' ? setSelectedGame(game.id) : null}
          >
            <CardContent className="p-6">
              <div className={`w-12 h-12 ${game.color} rounded-lg flex items-center justify-center mb-4`}>
                <game.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="font-bold text-lg mb-2">{game.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{game.description}</p>
              
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {game.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-sm font-semibold">{game.points} pts</span>
                </div>
              </div>
              
              {game.id === 'financial-quiz' && (
                <Button className="w-full mt-4" size="sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Play Now
                </Button>
              )}
              {game.id !== 'financial-quiz' && (
                <div className="mt-4 text-center">
                  <Badge variant="outline" className="text-xs">Coming Soon</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div 
                key={entry.rank}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  entry.name === 'You' ? 'bg-primary/10 border-2 border-primary' : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-background rounded-full flex items-center justify-center font-bold text-sm">
                    {entry.badge || entry.rank}
                  </div>
                  <span className="font-semibold">{entry.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="font-bold">{entry.points}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Your Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">Level 3 - Money Explorer</span>
              <span className="text-sm text-muted-foreground">1200 / 2000 pts</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-xs text-muted-foreground">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">3</div>
              <div className="text-xs text-muted-foreground">Badges Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuiz = () => {
    const question = quizQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Quiz Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setSelectedGame(null)}>
            ← Back to Games
          </Button>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            <span className="font-bold">{quizScore} pts</span>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold">Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </CardContent>
        </Card>

        {/* Question */}
        <Card key={currentQuestion}>
          <CardHeader>
            <CardTitle className="text-lg">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = question.correctAnswer === index;
              const showResult = selectedAnswer !== null;
              
              let buttonClass = "w-full text-left justify-start h-auto py-4 px-4 ";
              
              if (showResult) {
                if (isSelected && isCorrect) {
                  buttonClass += "bg-green-100 border-green-500 border-2 text-green-900 font-semibold";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "bg-red-100 border-red-500 border-2 text-red-900 font-semibold";
                } else if (isCorrect) {
                  buttonClass += "bg-green-50 border-green-300 border-2 text-green-800 font-semibold";
                } else {
                  buttonClass += "opacity-50 border-gray-200 text-gray-600";
                }
              } else {
                buttonClass += "hover:bg-primary/10 hover:border-primary border-gray-200 text-foreground";
              }
              
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={buttonClass}
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                >
                  <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && (
                    <span className="text-green-600 font-bold ml-2">✓</span>
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <span className="text-red-600 font-bold ml-2">✗</span>
                  )}
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Explanation Card - Shows after answering */}
        {showExplanation ? (
          <Card className={selectedAnswer === question.correctAnswer ? "bg-green-50 border-green-200" : "bg-blue-50 border-blue-200"}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {selectedAnswer === question.correctAnswer ? (
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">✓</span>
                  </div>
                ) : (
                  <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">
                    {selectedAnswer === question.correctAnswer ? "🎉 Correct! +20 points" : "💡 Learn & Grow"}
                  </p>
                  <p className="text-sm">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 mb-1">💡 Think About It</p>
                  <p className="text-sm text-blue-800">
                    Take your time and choose the answer that makes the most sense to you!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <MobileLayout currentTab="activities">
      {selectedGame === 'financial-quiz' ? renderQuiz() : renderGameList()}
    </MobileLayout>
  );
}
