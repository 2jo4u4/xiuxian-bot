import { LevelName } from "./Constants.ts";

const levelScoreMap: { [key in LevelName]: number } = {
  [LevelName.練氣境]: 0,
  [LevelName.築基境]: Math.pow(10, 1),
  [LevelName.金丹境]: Math.pow(10, 3),
  [LevelName.元嬰境]: Math.pow(10, 5),
  [LevelName.化神境]: Math.pow(10, 7),
  [LevelName.煉虛境]: Math.pow(10, 10),
  [LevelName.合體境]: Math.pow(10, 13),
  [LevelName.大乘境]: Math.pow(10, 16),
  [LevelName.渡劫境]: Math.pow(10, 20),
};

// pass it
class Person {
  constructor(public nameId: number, public score: number) {}

  get levelName(): LevelName {
    let result: LevelName = LevelName.練氣境;
    for (const level of Object.values(LevelName)) {
      if (this.score >= levelScoreMap[level]) {
        result = level;
      }
    }
    return result;
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
      score: levelScoreMap[LevelName.練氣境],
    },
    {
      id: 2,
      text: "Answer 2",
      score: levelScoreMap[LevelName.築基境] + 1,
    },
    {
      id: 3,
      text: "Answer 3",
      score: levelScoreMap[LevelName.金丹境] + 1,
      priority: 0,
    },
    {
      id: 4,
      text: "Answer 4",
      score: levelScoreMap[LevelName.元嬰境] + 1,
    },
  ]),
];

function calAnswerPriority(answerScore: number, personScore: number) {
  let priority = 0;
  (Object.values(LevelName) as LevelName[]).forEach((level) => {
    if (
      personScore < levelScoreMap[level] ||
      answerScore < levelScoreMap[level]
    )
      return priority;
    priority++;
  });
  return priority;
}

// roll answer
function roll(optionList: Array<{ priority?: number }>) {
  const totalPriority = optionList.reduce(
    (acc, { priority = 0 }) => acc + priority,
    0
  );
  const randomValue = Math.floor(Math.random() * totalPriority) + 1;
  let currentSum = 0;
  for (const option of optionList) {
    currentSum += option.priority || 0;
    if (randomValue <= currentSum) return option;
  }
  return optionList[optionList.length - 1];
}

const people = new Person(1, 1);
const coveredAnswers = questionList[0].answerList.map((answer) => {
  if (answer.priority !== undefined) return answer;
  return {
    ...answer,
    priority: calAnswerPriority(answer.score, people.score),
  };
});

console.table(coveredAnswers);
console.log(roll(coveredAnswers));
