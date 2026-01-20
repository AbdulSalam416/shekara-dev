

import Link from 'next/link';
import { endpoints } from '../lib/endpoints';

export default function Index() {


  return (
    <div>
      <h1>Welcome to LLM Knowledge Graph!</h1>
      <Link href={`/${endpoints.analyze}`} className={'text-blue-300'}> Analyse</Link>
    </div>
  );
}
