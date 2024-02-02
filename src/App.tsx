import '@/styles/main.css';
import { useState } from 'react';
import styles from './App.module.css';
import { Select } from './components/Select';
import { useSearchWords } from './query';
import { Word } from './types';

const OptionElement = ({ word }: { word: string }) => <>➡️ {word}</>;

const App = () => {
  const [query, setQuery] = useState('');
  const { data: words, isFetching } = useSearchWords(query);
  const [selectedValue, setSelectedValue] = useState<Word>();

  return (
    <main className={styles.main}>
      <Select
        selectId="word-select"
        selectName="favorite word"
        values={words}
        toOption={({ word }) => ({
          label: word,
          value: word,
        })}
        inputValue={query}
        setInputValue={setQuery}
        onOptionSelected={setSelectedValue}
        renderOption={(option) => <OptionElement word={option.value} />}
        isLoading={isFetching}
      />
      <div className={styles.result}>selected option: {selectedValue?.word ?? 'none'}</div>
    </main>
  );
};

export default App;
