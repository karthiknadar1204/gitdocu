import { getRepoData } from '@/lib/github';

interface Props {
  params: { username: string; repo: string };
}

export default async function RepoPage({ params }: Props) {
  const { username, repo } = params;

  console.log('🔍 URL Parameters:', { username, repo });

  try {
    // Step 1: Fetch repo contents (tree + key files)
    console.log('📡 Fetching repo data from GitHub...');
    const result = await getRepoData(username, repo);
    
    console.log('✅ Repo data fetched successfully:', result);

    return (
      <main className="p-4">
        <h1 className="text-2xl font-bold">{`${username}/${repo}`}</h1>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Repo Structure:</h2>
          <pre className="mt-2 whitespace-pre-wrap border p-4 rounded bg-gray-100 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </main>
    );
  } catch (error) {
    console.error('❌ Error fetching repo data:', error);
    
    return (
      <main className="p-4">
        <h1 className="text-2xl font-bold">{`${username}/${repo}`}</h1>
        <div className="mt-4 text-red-600">
          <h2 className="text-lg font-semibold">Error:</h2>
          <p>{error instanceof Error ? error.message : 'Failed to fetch repo data'}</p>
        </div>
      </main>
    );
  }
} 