enum LevelName {
  Basic = "Basic",
  Beginner = "Beginner",
  Intermediate = "Intermediate",
  Advanced = "Advanced",
}

const levelScoreMap: { [key in string]: number } = {
  [LevelName.Basic]: 0,
  [LevelName.Beginner]: Math.pow(10, 1),
  [LevelName.Intermediate]: Math.pow(10, 3),
  [LevelName.Advanced]: Math.pow(10, 5),
};

// pass it
class Person {
  constructor(public nameId: number, public score: number) {}

  get levelName() {
    let levelName = "";
    Object.keys(levelScoreMap).forEach(key => {
      if (this.score >= levelScoreMap[key]) {
        levelName = key;
      } else {
        return levelName;
      }
    });
    return levelName;
  }
}

// pass it
class Question {
  constructor(
    public questionId: number,
    public name: string,
    public description: string,
    public answerList: Array<{
      id: number;
      text: string;
      score: number;
      priority?: number;
    }>
  ) {}
}

const questionList = [
  new Question(1, "Question 1", "Description 1", [
    {
      id: 1,
      text: "Answer 1",
      score: levelScoreMap[LevelName.Basic],
    },
    {
      id: 2,
      text: "Answer 2",
      score: levelScoreMap[LevelName.Beginner] + 1,
    },
    {
      id: 3,
      text: "Answer 3",
      score: levelScoreMap[LevelName.Intermediate] + 1,
      priority: 0,
    },
    {
      id: 4,
      text: "Answer 4",
      score: levelScoreMap[LevelName.Advanced] + 1,
    },
  ]),
];

function calAnswerPriority(answerScore: number, personScore: number) {
  let priority = 0;
  Object.keys(levelScoreMap).forEach(key => {
    if (personScore < levelScoreMap[key] || answerScore < levelScoreMap[key]) return priority;
    priority++;
  });
  return priority;
}

// roll answer
function roll(optionList: Array<{ priority?: number }>) {
  const totalPriority = optionList.reduce((acc, { priority = 0 }) => acc + priority, 0);
  const randomValue = Math.floor(Math.random() * totalPriority) + 1;
  let currentSum = 0;
  for (const option of optionList) {
    currentSum += option.priority || 0;
    if (randomValue <= currentSum) return option;
  }
  return optionList[optionList.length - 1];
}

const people = new Person(1, 1);
const coveredAnswers = questionList[0].answerList.map(answer => {
  if (answer.priority !== undefined) return answer;
  return {
    ...answer,
    priority: calAnswerPriority(answer.score, people.score),
  };
});

console.table(coveredAnswers);
console.log(roll(coveredAnswers));
