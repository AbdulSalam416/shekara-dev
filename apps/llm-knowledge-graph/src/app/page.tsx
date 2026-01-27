

import Link from 'next/link';
import { endpoints } from '../lib/endpoints';

export default function Index() {


  return (
    <div className={'flex flex-col items-center justify-center'}>
      <h1>Welcome to LLM Knowledge Graph!</h1>
      <Link href={`/${endpoints.research}`} className={'text-blue-300'}> Mindgraph Research </Link>
    </div>
  );
}
