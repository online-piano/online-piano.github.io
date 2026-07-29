import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 text-center shadow-2xl sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-purple-500">404</p>
        <h1 className="mt-4 text-4xl font-bold text-gray-800 sm:text-5xl">这个页面没有找到</h1>
        <p className="mt-4 text-lg text-gray-600">
          你访问的页面可能已经移动、删除，或者地址输入有误。
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600"
          >
            返回钢琴主页
          </Link>
          <Link
            href="/"
            className="rounded-full border-2 border-purple-500 px-6 py-3 font-semibold text-purple-500 transition hover:bg-purple-50"
          >
            重新开始弹奏
          </Link>
        </div>

        <div className="mt-10 rounded-2xl bg-purple-50 p-6 text-left">
          <p className="text-sm font-semibold text-purple-700">你可以试试：</p>
          <ul className="mt-3 space-y-2 text-gray-600">
            <li>检查 URL 是否拼写正确</li>
            <li>回到主页继续弹奏或播放示例曲目</li>
            <li>刷新页面，确认资源是否正常加载</li>
          </ul>
        </div>
      </div>
    </main>
  );
}