import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Heading,
  Inline,
  Label,
  ProgressBar,
  Stack,
  Strong,
  Text,
  Toggle
} from '@forge/react';
import { invoke } from '@forge/bridge';

const App = () => {
  const [qandas, setQandas] = useState(undefined);
  const [questionsToRevealState, setQuestionsToRevealState] = useState({});

  useEffect(() => {
    invoke('retrieveQuestionsAndAnswers').then(setQandas);
  }, []);

  const revealAnswer = (question) => {
    const clonedQuestionsToRevealState = { ...questionsToRevealState };
    clonedQuestionsToRevealState[question] = true;
    setQuestionsToRevealState(clonedQuestionsToRevealState);
  }

  const countQuestionsAnswered = () => {
    let count = 0;
    for (const question in questionsToRevealState) {
      if (questionsToRevealState[question]) {
        count++;
      }
    }
    return count; 
  }

  const renderProgressIndicator = () => {
    const questionCount = qandas.length;
    const answerCount = countQuestionsAnswered();
    const message = answerCount === 0 ? `Not started` : 
      answerCount === questionCount ? `All questions answered` :
      `In progress: ${answerCount} of ${qandas.length} questions answered`;
    const value = questionCount === 0 ? 1 : answerCount / questionCount;
    return (
      <Stack space='space.0'>
        <Label>{message}</Label>
        <ProgressBar
          appearance="success"
          ariaLabel={message}
          value={value}
        />
      </Stack>
    );
  };

  const renderQanda = (qanda) => {
    const renderedAnswer = questionsToRevealState[qanda.question] ? (
      <Text>
        <Strong>Answer</Strong>: {qanda.answer}
      </Text>
    ) : (
      <Text>
        <Inline>
        <Strong>Answer</Strong>: 
          <Toggle 
            id="toggle"
            onChange={() => {
              revealAnswer(qanda.question);
            }}
            isChecked={false}
            isDisabled={false}
          />
        </Inline>
      </Text>
    );
    return (
      <>
        <Stack space='space.0'>
          <Text>
            <Strong>Question</Strong>: {qanda.question}
          </Text>
        </Stack>
        <Stack space='space.0'>
          {renderedAnswer}
        </Stack>
        <Text></Text>
      </>
    );
  }

  const renderQandas = () => {
    return qandas.map(renderQanda);
  }

  const renderQuiz = () => {
    if (qandas) {
      if (qandas.length === 0) {
        return <Text>No questions and answers were found. Try generating them using the Q&A Agent.</Text>;
      } else {
        return (
          <Stack space='space.200'>
            <Text>
              Test yourself by answering the following questions:
            </Text>
            {renderProgressIndicator()}
            {renderQandas()}
          </Stack>
        );
      }
    } else {
      return <Text>Loading questions and answers...</Text>;
    }
  }

  return (
    <>
      <Heading as="h2">Q&A Quiz</Heading>
      {renderQuiz()}
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
