import useSWR from 'swr';

const fetchCategories = async () => {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('Failed to fetch categories');
  const data = await response.json();
  return data.categories || [];
};

export const useCategories = () => {
  const { data, error, isLoading } = useSWR(
    'categories',
    fetchCategories,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
  };
};
