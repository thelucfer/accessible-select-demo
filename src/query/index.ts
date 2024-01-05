import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Word } from '../types';

export const searchWords = async (query: string): Promise<Array<Word>> => {
  const res = await fetch(`https://api.datamuse.com/sug?s=${query}`);

  const data = await res.json();

  return data;
};

export const useSearchWords = (query: string) =>
  useQuery({
    queryKey: ['wordSearch', query],
    queryFn: () => searchWords(query),
    placeholderData: keepPreviousData,
  });
