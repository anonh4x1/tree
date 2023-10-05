'use client';

import * as React from 'react';
import hljs from 'highlight.js/lib/core';
import hljsmd from 'highlight.js/lib/languages/markdown';
import Editor from 'react-simple-code-editor';

import 'highlight.js/styles/github.css';

import Image from 'next/image';

import { Icons } from './icons';
import toast from './toast';

hljs.registerLanguage('md', hljsmd);

export default function Form() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [source, setSource] = React.useState<string>(
    '- app\n  - dashboard\n    - layout.tsx\n    - page.tsx\n    - loading.tsx\n  - auth\n    - layout.tsx\n    - login\n      - page.tsx\n\t- register\n\t  - page.ts\n- next.config.js\n- README.md',
  );
  const [url, setUrl] = React.useState<string>('');

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsLoading(true);

    const response = await fetch('/api/parse', {
      method: 'POST',
      body: JSON.stringify({
        source,
      }),
    });

    if (!response?.ok) {
      setIsLoading(false);

      return toast({
        title: 'Something went wrong.',
        message: 'Your post was not saved. Please try again.',
        type: 'error',
      });
    }

    const json = await response.json();

    const imageResponse = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify(json),
    });

    if (!imageResponse?.ok) {
      setIsLoading(false);

      return toast({
        title: 'Something went wrong.',
        message: 'Your post was not saved. Please try again.',
        type: 'error',
      });
    }

    setIsLoading(false);
    const image = await imageResponse.blob();

    setUrl(URL.createObjectURL(image));

    return toast({
      message: 'Image successfully generated.',
      type: 'success',
    });
  }

  return (
    <div className="grid items-start lg:grid-cols-[1fr_768px] gap-10">
      <form onSubmit={onSubmit} className="grid items-start gap-2">
        <div className="">
          <Editor
            value={source}
            onValueChange={(code) => setSource(code)}
            highlight={(code) => {
              return hljs.highlight(code, { language: 'md' }).value;
            }}
            disabled={isLoading}
            padding={{
              top: 20,
              left: 18,
              right: 18,
              bottom: 20,
            }}
            className="block text-base font-mono h-[450px] w-full rounded-md border border-slate-300 placeholder:text-slate-400 hover:border-slate-400"
            textareaClassName="focus:outline-none focus:ring-2 focus:ring-neutral-800 focus:ring-offset-1"
          />
        </div>
        <button
          disabled={isLoading}
          className="inline-flex w-full items-center justify-center rounded-lg bg-[#24292F] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#111111]/90 focus:outline-none focus:ring-4 focus:ring-[#111111]/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <Icons.spinner className="mr-2 w-4 h-4 animate-spin" />}
          Generate
        </button>
      </form>
      <div className="overflow-hidden h-full min-h-[430px] rounded-lg bg-slate-50">
        {url ? <Image src={url} alt="Image" width={768} height={430} /> : null}
      </div>
    </div>
  );
}
